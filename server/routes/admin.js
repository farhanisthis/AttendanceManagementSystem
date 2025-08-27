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
    console.log("Creating user with data:", req.body);
    const {
      name,
      email,
      password,
      role,
      enrollment,
      phone,
      sections,
      batch,
      section,
    } = req.body;

    // Input validation and sanitization
    if (!name?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (role === "student" && !enrollment?.trim()) {
      return res
        .status(400)
        .json({ error: "Enrollment number required for students" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      phone: phone?.trim() || "",
    };

    // Add role-specific fields
    if (role === "student") {
      userData.enrollment = enrollment.trim();

      // Always use the provided batch and section if they exist
      if (batch && section && batch.trim() && section.trim()) {
        userData.batch = batch.trim();
        userData.section = section.trim();
        userData.classOrBatch = `${batch.trim()} - ${section.trim()}`;
        console.log("✅ Creating student with provided batch/section:", {
          batch: batch.trim(),
          section: section.trim(),
        });
      } else {
        // Fallback: extract from enrollment if batch/section not provided
        userData.classOrBatch = enrollment.trim();
        userData.batch = enrollment.split("-")[0] || enrollment;
        userData.section = enrollment.split("-")[1] || enrollment;
        console.log("⚠️  Using fallback batch/section from enrollment:", {
          batch: userData.batch,
          section: userData.section,
        });
      }
    } else if (role === "teacher") {
      userData.sections = Array.isArray(sections) ? sections : [];
    }

    const user = await User.create(userData);
    res.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    // Check for specific MongoDB errors
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({ error: "Email already exists" });
      }
      if (error.keyPattern.enrollment) {
        return res
          .status(400)
          .json({ error: "Enrollment number already exists" });
      }
      return res.status(400).json({ error: "Duplicate entry found" });
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
    const { role } = req.query;
    const q = role ? { role } : {};
    const users = await User.find(q).select("-passwordHash");
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

      // If batch and section are provided, use them (this preserves the correct values)
      if (batch && section) {
        update.batch = batch;
        update.section = section;
        update.classOrBatch = `${batch} - ${section}`;
      } else {
        // Fallback: extract from enrollment only if batch/section not provided
        update.classOrBatch = enrollment;
        update.batch = enrollment?.split("-")[0] || enrollment;
        update.section = enrollment?.split("-")[1] || enrollment;
      }
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

// Get students for a specific teacher, subject, and year
router.get(
  "/teacher-students",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { teacherId, subjectId, year } = req.query;

      if (!teacherId || !subjectId || !year) {
        return res.status(400).json({
          error: "Teacher ID, Subject ID, and Year are required",
        });
      }

      // Find students in the specified year
      const students = await User.find({
        role: "student",
        batch: year,
      }).select("name email enrollment batch section");

      res.json(students);
    } catch (error) {
      console.error("Error fetching teacher students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  }
);

// Check attendance count (for debugging)
router.get(
  "/attendance/count",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const totalCount = await Attendance.countDocuments({});
      res.json({ count: totalCount });
    } catch (error) {
      console.error("Error counting attendance:", error);
      res.status(500).json({ error: "Failed to count attendance" });
    }
  }
);

// Attendance
router.get("/attendance", auth, requireRole("admin"), async (req, res) => {
  try {
    const { date, classOrBatch, teacherId } = req.query;
    let query = {};

    if (date) query.date = date;
    if (classOrBatch) query.classOrBatch = classOrBatch;
    if (teacherId) query.teacherId = teacherId;

    // First check if there are any attendance records
    const totalCount = await Attendance.countDocuments(query);

    if (totalCount === 0) {
      return res.status(404).json({
        message: "No attendance records found",
        count: 0,
      });
    }

    const attendance = await Attendance.find(query)
      .populate("subjectId", "name code")
      .populate("teacherId", "name email")
      .lean();

    // Validate that populated data exists
    const validAttendance = attendance.filter((record) => {
      if (!record.subjectId || !record.teacherId) {
        console.warn(
          `Attendance record ${record._id} has missing references:`,
          {
            subjectId: record.subjectId,
            teacherId: record.teacherId,
          }
        );
        return false;
      }
      return true;
    });

    res.json(validAttendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);

    // Provide more specific error messages
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid ID format in query parameters",
      });
    }

    res.status(500).json({
      error: "Failed to fetch attendance",
      details: error.message,
    });
  }
});

// Subjects
router.post("/subjects", auth, requireRole("admin"), async (req, res) => {
  res.json(await Subject.create(req.body));
});

router.get("/subjects", auth, requireRole("admin"), async (req, res) => {
  try {
    const { year } = req.query;
    let query = {};

    if (year) {
      query.year = year;
    }

    const subjects = await Subject.find(query);
    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
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

export default router;
