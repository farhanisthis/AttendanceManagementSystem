import express from "express";
import bcrypt from "bcrypt";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// Users
router.post("/users", auth, requireRole("admin"), async (req, res) => {
  try {
    console.log("User authenticated:", req.user);
    console.log("Received user data:", req.body);

    const { name, email, password, role, enrollment, phone, sections } =
      req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      passwordHash,
      role,
      phone,
    };

    // Add role-specific fields
    if (role === "student") {
      userData.enrollment = enrollment;
      userData.classOrBatch = enrollment; // Keep both for compatibility
    } else if (role === "teacher") {
      userData.sections = sections || [];
    }

    console.log("Processed user data:", userData);

    const user = await User.create(userData);
    console.log("User created successfully:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    res.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    // Check for specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users", auth, requireRole("admin"), async (req, res) => {
  try {
    console.log("GET /users - User authenticated:", req.user);
    const { role } = req.query;
    const q = role ? { role } : {};
    console.log("Query:", q);
    const users = await User.find(q).select("-passwordHash");
    console.log(`Found ${users.length} users with role: ${role || "all"}`);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/users/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      enrollment,
      phone,
      sections,
      batch,
      section,
    } = req.body;

    // First get the existing user to determine their role
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const update = { name, email, phone, batch, section };

    if (password) {
      update.passwordHash = await bcrypt.hash(password, 10);
    }

    // Add role-specific fields based on existing user's role
    if (existingUser.role === "student") {
      update.enrollment = enrollment;
      update.classOrBatch = enrollment; // Keep both for compatibility
    } else if (existingUser.role === "teacher") {
      update.sections = sections || [];
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("-passwordHash");

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ error: error.message });
  }
});

router.delete("/users/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(400).json({ error: error.message });
  }
});

// Section assignment for teachers
router.put(
  "/users/:id/assign-section",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { year, section, subjectId, role } = req.body;

      if (!year || !section || !subjectId || !role) {
        return res.status(400).json({
          error: "Missing required fields: year, section, subjectId, role",
        });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role !== "teacher") {
        return res
          .status(400)
          .json({ error: "Can only assign sections to teachers" });
      }

      // Initialize teacherAssignments array if it doesn't exist
      if (!user.teacherAssignments) {
        user.teacherAssignments = [];
      }

      // Check if assignment already exists
      const existingAssignment = user.teacherAssignments.find(
        (assignment) =>
          assignment.year === year &&
          assignment.section === section &&
          assignment.subjectId?.toString() === subjectId
      );

      if (existingAssignment) {
        return res.status(400).json({ error: "Assignment already exists" });
      }

      // Add new assignment
      user.teacherAssignments.push({
        year,
        section,
        subjectId,
        role,
        classOrBatch: `${year} - ${section}`,
      });

      await user.save();

      res.json(user);
    } catch (error) {
      console.error("Error assigning section:", error);
      res.status(500).json({ error: "Failed to assign section" });
    }
  }
);

// Remove section assignment
router.delete(
  "/users/:id/assign-section",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { year, section, subjectId } = req.body;

      if (!year || !section || !subjectId) {
        return res
          .status(400)
          .json({ error: "Missing required fields: year, section, subjectId" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role !== "teacher") {
        return res
          .status(400)
          .json({ error: "Can only remove assignments from teachers" });
      }

      if (!user.teacherAssignments) {
        return res.status(400).json({ error: "No assignments found" });
      }

      // Remove the assignment
      user.teacherAssignments = user.teacherAssignments.filter(
        (assignment) =>
          !(
            assignment.year === year &&
            assignment.section === section &&
            assignment.subjectId?.toString() === subjectId
          )
      );

      await user.save();

      res.json(user);
    } catch (error) {
      console.error("Error removing section assignment:", error);
      res.status(500).json({ error: "Failed to remove section assignment" });
    }
  }
);

// Mentorship assignment for teachers
router.put(
  "/users/:id/assign-mentorship",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { year, section, description } = req.body;

      if (!year || !section) {
        return res
          .status(400)
          .json({ error: "Missing required fields: year, section" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role !== "teacher") {
        return res
          .status(400)
          .json({ error: "Can only assign mentorship to teachers" });
      }

      // Initialize mentorship if it doesn't exist
      if (!user.mentorship) {
        user.mentorship = {};
      }

      // Update mentorship
      user.mentorship = {
        year,
        section,
        description: description || "Academic guidance and career counseling",
        classOrBatch: `${year} - ${section}`,
      };

      await user.save();

      res.json(user);
    } catch (error) {
      console.error("Error assigning mentorship:", error);
      res.status(500).json({ error: "Failed to assign mentorship" });
    }
  }
);

// Remove mentorship
router.delete(
  "/users/:id/mentorship",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role !== "teacher") {
        return res
          .status(400)
          .json({ error: "Can only remove mentorship from teachers" });
      }

      user.mentorship = undefined;
      await user.save();

      res.json(user);
    } catch (error) {
      console.error("Error removing mentorship:", error);
      res.status(500).json({ error: "Failed to remove mentorship" });
    }
  }
);

// Remove teacher assignment by index
router.delete(
  "/users/:id/assignments/:assignmentIndex",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { assignmentIndex } = req.params;
      const index = parseInt(assignmentIndex);

      if (isNaN(index) || index < 0) {
        return res.status(400).json({ error: "Invalid assignment index" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role !== "teacher") {
        return res
          .status(400)
          .json({ error: "Can only remove assignments from teachers" });
      }

      if (!user.teacherAssignments || !user.teacherAssignments[index]) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      // Remove the assignment at the specified index
      user.teacherAssignments.splice(index, 1);
      await user.save();

      res.json(user);
    } catch (error) {
      console.error("Error removing teacher assignment:", error);
      res.status(500).json({ error: "Failed to remove teacher assignment" });
    }
  }
);

// Subjects
router.post("/subjects", auth, requireRole("admin"), async (req, res) => {
  res.json(await Subject.create(req.body));
});

router.get("/subjects", auth, requireRole("admin"), async (req, res) => {
  res.json(await Subject.find());
});

router.put("/subjects/:id", auth, requireRole("admin"), async (req, res) => {
  res.json(
    await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
});

router.delete("/subjects/:id", auth, requireRole("admin"), async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// Timetable
router.post("/timetable", auth, requireRole("admin"), async (req, res) => {
  try {
    const {
      subjectId,
      teacherId,
      classOrBatch,
      dayOfWeek,
      startTime,
      endTime,
      slotType,
      room,
    } = req.body;

    // Validate required fields
    if (
      !subjectId ||
      !teacherId ||
      !classOrBatch ||
      dayOfWeek === undefined ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check for scheduling conflicts
    const conflictingSlots = await Timetable.find({
      classOrBatch,
      dayOfWeek,
      $or: [
        // Check if new slot overlaps with existing slots
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (conflictingSlots.length > 0) {
      return res.status(400).json({
        error: "System prevents scheduling conflict",
        details: "This time slot conflicts with existing classes",
        conflicts: conflictingSlots.map((slot) => ({
          subject: slot.subjectId,
          teacher: slot.teacherId,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      });
    }

    // Check if teacher has conflicting classes
    const teacherConflicts = await Timetable.find({
      teacherId,
      dayOfWeek,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (teacherConflicts.length > 0) {
      return res.status(400).json({
        error: "System prevents scheduling conflict",
        details: "Teacher has conflicting classes at this time",
        conflicts: teacherConflicts.map((slot) => ({
          subject: slot.subjectId,
          class: slot.classOrBatch,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      });
    }

    const timetableSlot = await Timetable.create(req.body);
    // Return populated data so frontend shows subject names immediately
    const populatedSlot = await Timetable.findById(timetableSlot._id)
      .populate("subjectId")
      .populate("teacherId", "name email");
    res.json(populatedSlot);
  } catch (error) {
    console.error("Error creating timetable slot:", error);
    res.status(400).json({ error: error.message });
  }
});

// New bulk timetable creation endpoint
router.post("/timetable/bulk", auth, requireRole("admin"), async (req, res) => {
  try {
    const slots = req.body;
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ error: "Invalid slots data" });
    }

    const createdSlots = await Timetable.insertMany(slots);
    // Return populated data for all created slots
    const populatedSlots = await Timetable.find({
      _id: { $in: createdSlots.map((s) => s._id) },
    })
      .populate("subjectId")
      .populate("teacherId", "name email");

    res.json(populatedSlots);
  } catch (error) {
    console.error("Error creating bulk timetable slots:", error);
    res.status(400).json({ error: error.message });
  }
});

router.get("/timetable", auth, requireRole("admin"), async (req, res) => {
  const { classOrBatch } = req.query;
  const q = classOrBatch ? { classOrBatch } : {};
  const items = await Timetable.find(q)
    .populate("subjectId")
    .populate("teacherId", "name email");
  res.json(items);
});

router.delete(
  "/timetable/:id",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const slot = await Timetable.findByIdAndDelete(req.params.id);
      if (!slot) {
        return res.status(404).json({ error: "Timetable slot not found" });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error("Error deleting timetable slot:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Attendance
router.get("/attendance", auth, requireRole("admin"), async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("subjectId", "name code")
      .populate("teacherId", "name email")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});

// Generate comprehensive monthly reports
router.get("/reports/monthly", auth, requireRole("admin"), async (req, res) => {
  try {
    const { month, year, classOrBatch, subjectId, teacherId } = req.query;

    // Default to current month if not specified
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    // Create date range for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    // Build query
    const query = {
      date: {
        $gte: startDate.toISOString().split("T")[0],
        $lte: endDate.toISOString().split("T")[0],
      },
    };

    if (classOrBatch) query.classOrBatch = classOrBatch;
    if (subjectId) query.subjectId = subjectId;
    if (teacherId) query.teacherId = teacherId;

    const attendanceRecords = await Attendance.find(query)
      .populate("subjectId", "name code")
      .populate("teacherId", "name email")
      .lean();

    // Calculate statistics
    const totalClasses = attendanceRecords.length;
    let totalStudents = 0;
    let totalPresent = 0;
    let totalAbsent = 0;

    const subjectStats = {};
    const teacherStats = {};
    const classStats = {};

    for (const record of attendanceRecords) {
      const subjectName = record.subjectId?.name || "Unknown Subject";
      const teacherName = record.teacherId?.name || "Unknown Teacher";
      const className = record.classOrBatch;

      // Initialize stats if not exists
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { present: 0, absent: 0, total: 0 };
      }
      if (!teacherStats[teacherName]) {
        teacherStats[teacherName] = { present: 0, absent: 0, total: 0 };
      }
      if (!classStats[className]) {
        classStats[className] = { present: 0, absent: 0, total: 0 };
      }

      // Count records
      for (const studentRecord of record.records) {
        totalStudents++;
        if (studentRecord.status === "present") {
          totalPresent++;
          subjectStats[subjectName].present++;
          teacherStats[teacherName].present++;
          classStats[className].present++;
        } else {
          totalAbsent++;
          subjectStats[subjectName].absent++;
          teacherStats[teacherName].absent++;
          classStats[className].absent++;
        }
        subjectStats[subjectName].total++;
        teacherStats[teacherName].total++;
        classStats[className].total++;
      }
    }

    // Calculate percentages
    const overallAttendance =
      totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(2) : 0;

    const report = {
      period: {
        month: targetMonth,
        year: targetYear,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      summary: {
        totalClasses,
        totalStudents,
        totalPresent,
        totalAbsent,
        overallAttendance: `${overallAttendance}%`,
      },
      subjectStats: Object.entries(subjectStats).map(([name, stats]) => ({
        name,
        present: stats.present,
        absent: stats.absent,
        total: stats.total,
        percentage:
          stats.total > 0
            ? ((stats.present / stats.total) * 100).toFixed(2) + "%"
            : "0%",
      })),
      teacherStats: Object.entries(teacherStats).map(([name, stats]) => ({
        name,
        present: stats.present,
        absent: stats.absent,
        total: stats.total,
        percentage:
          stats.total > 0
            ? ((stats.present / stats.total) * 100).toFixed(2) + "%"
            : "0%",
      })),
      classStats: Object.entries(classStats).map(([name, stats]) => ({
        name,
        present: stats.present,
        absent: stats.absent,
        total: stats.total,
        percentage:
          stats.total > 0
            ? ((stats.present / stats.total) * 100).toFixed(2) + "%"
            : "0%",
      })),
      detailedRecords: attendanceRecords,
    };

    res.json(report);
  } catch (error) {
    console.error("Error generating monthly report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Export report as CSV
router.get(
  "/reports/monthly/csv",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { month, year, classOrBatch, subjectId, teacherId } = req.query;

      // Default to current month if not specified
      const currentDate = new Date();
      const targetMonth = month || currentDate.getMonth() + 1;
      const targetYear = year || currentDate.getFullYear();

      // Create date range for the month
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0);

      // Build query
      const query = {
        date: {
          $gte: startDate.toISOString().split("T")[0],
          $lte: endDate.toISOString().split("T")[0],
        },
      };

      if (classOrBatch) query.classOrBatch = classOrBatch;
      if (subjectId) query.subjectId = subjectId;
      if (teacherId) query.teacherId = teacherId;

      const attendanceRecords = await Attendance.find(query)
        .populate("subjectId", "name code")
        .populate("teacherId", "name email")
        .lean();

      // Prepare CSV data
      const csvRows = [];
      for (const record of attendanceRecords) {
        for (const studentRecord of record.records) {
          csvRows.push({
            date: record.date,
            subject: record.subjectId?.name || "Unknown",
            subjectCode: record.subjectId?.code || "N/A",
            teacher: record.teacherId?.name || "Unknown",
            class: record.classOrBatch,
            studentId: studentRecord.studentId,
            status: studentRecord.status,
            timestamp: record.createdAt,
          });
        }
      }

      // Convert to CSV
      const csv = new (await import("json2csv")).Parser({
        fields: [
          "date",
          "subject",
          "subjectCode",
          "teacher",
          "class",
          "studentId",
          "status",
          "timestamp",
        ],
      }).parse(csvRows);

      res.header("Content-Type", "text/csv");
      res.attachment(`attendance_report_${targetMonth}_${targetYear}.csv`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting CSV report:", error);
      res.status(500).json({ error: "Failed to export report" });
    }
  }
);

// Teacher Students
router.get(
  "/teacher-students",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { teacherId, subjectId, year } = req.query;

      if (!teacherId || !subjectId || !year) {
        return res.status(400).json({
          error: "Missing required parameters: teacherId, subjectId, year",
        });
      }

      // First, get the teacher's specific assignment for this subject and year
      const teacher = await User.findById(teacherId).lean();
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // Find the specific class/batch this teacher is assigned to for this subject
      let teacherClass = null;
      if (teacher.teacherAssignments) {
        const assignment = teacher.teacherAssignments.find(
          (assignment) =>
            assignment.subjectId?.toString() === subjectId &&
            assignment.year === year
        );
        if (assignment) {
          teacherClass = assignment.classOrBatch;
        }
      }

      // If no specific assignment found, return empty array
      if (!teacherClass) {
        return res.json([]);
      }

      // Now find students in the EXACT class/batch only
      const students = await User.find({
        role: "student",
        classOrBatch: teacherClass, // Only exact match, no regex
      })
        .select("-passwordHash")
        .lean();

      // Additional strict filtering to ensure exact matches
      const filteredStudents = students.filter((student) => {
        const studentClass = student.classOrBatch || student.enrollment || "";

        // Only return students with exact class match
        return studentClass === teacherClass;
      });

      res.json(filteredStudents);
    } catch (error) {
      console.error("Error fetching teacher students:", error);
      res.status(500).json({ error: "Failed to fetch teacher students" });
    }
  }
);

export default router;
