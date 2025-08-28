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
