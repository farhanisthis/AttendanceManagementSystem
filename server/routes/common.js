import express from "express";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";
const router = express.Router();
router.get("/students", auth, async (req, res) => {
  try {
    const { classOrBatch, teacherId, year, section, subjectId } = req.query;

    let query = { role: "student" };

    // If teacherId is provided, filter by teacher's assigned sections and year
    if (teacherId) {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ error: "Invalid teacher ID" });
      }

      if (teacher.teacherAssignments && teacher.teacherAssignments.length > 0) {
        // If specific year and subject are provided, filter by those
        if (year && subjectId) {
          console.log(
            "Looking for teacher assignment with subjectId:",
            subjectId
          );
          console.log("Teacher assignments:", teacher.teacherAssignments);

          const relevantAssignment = teacher.teacherAssignments.find(
            (assignment) => {
              console.log("Checking assignment:", assignment);
              return assignment.subjectId.toString() === subjectId;
            }
          );

          if (relevantAssignment) {
            console.log("Found relevant assignment:", relevantAssignment);

            // IMPORTANT: Use the teacher's assignment year/section, NOT the frontend year
            // This ensures teachers only see students from their assigned classes
            const teacherYear = relevantAssignment.year;
            const teacherSection = relevantAssignment.section;

            console.log("Using teacher assignment:", {
              teacherYear,
              teacherSection,
              frontendYear: year,
              frontendSection: section || "not provided",
            });

            // Filter students by the teacher's assigned year and section
            query.batch = teacherYear;
            query.section = teacherSection;

            console.log("Filtering students with teacher assignment:", {
              teacherYear,
              teacherSection,
              query,
            });

            // Debug: Check what students exist with this query
            const foundStudents = await User.find(query).select(
              "name email batch section classOrBatch enrollment"
            );
            console.log(
              `Found ${foundStudents.length} students with query:`,
              foundStudents
            );
          } else {
            // Teacher not assigned to this subject
            console.log("Teacher not assigned to subject:", subjectId);
            return res.json([]);
          }
        } else {
          // Filter by teacher's assigned classes (for backward compatibility)
          const assignedClasses = teacher.teacherAssignments.map(
            (assignment) => assignment.classOrBatch
          );
          query.classOrBatch = { $in: assignedClasses };
        }
      } else {
        // Teacher has no assignments, return empty array
        return res.json([]);
      }
    } else if (classOrBatch) {
      // Filter by specific class/batch if provided
      query.classOrBatch = classOrBatch;
    } else if (year) {
      // Filter by year if provided
      query.batch = year;
      if (section) {
        query.section = section;
      }
    }

    const items = await User.find(query).select(
      "_id name email classOrBatch enrollment batch section"
    );
    res.json(items);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Get current user's complete profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user data without sensitive information
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      classOrBatch: user.classOrBatch,
      enrollment: user.enrollment,
      phone: user.phone,
      teacherAssignments: user.teacherAssignments || [],
      mentorship: user.mentorship || null,
      sections: user.sections || [],
    };

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Debug endpoint to check data structure
router.get("/debug/teacher-assignments", auth, async (req, res) => {
  try {
    const { teacherId } = req.query;
    if (!teacherId) {
      return res.status(400).json({ error: "Teacher ID required" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ error: "Invalid teacher ID" });
    }

    // Get all students
    const students = await User.find({ role: "student" }).select(
      "name email batch section classOrBatch"
    );

    // Get all subjects
    const subjects = await Subject.find({}).select("name code year");

    // Get all timetables
    const timetables = await Timetable.find({})
      .populate("subjectId", "name code")
      .populate("teacherId", "name email");

    res.json({
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        teacherAssignments: teacher.teacherAssignments || [],
      },
      students,
      subjects,
      timetables,
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({ error: "Failed to fetch debug data" });
  }
});

// Simple test endpoint to check student filtering
router.get("/test/students", auth, async (req, res) => {
  try {
    const { year, section, subjectId } = req.query;

    console.log("Testing student filtering with:", {
      year,
      section,
      subjectId,
    });

    // Test different query combinations
    const queries = [
      { role: "student", batch: year },
      { role: "student", section: section },
      { role: "student", batch: year, section: section },
      { role: "student", classOrBatch: `${year} - ${section}` },
    ];

    const results = {};

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      const students = await User.find(query).select(
        "name email batch section classOrBatch"
      );
      results[`query_${i + 1}`] = { query, count: students.length, students };
    }

    // Also show ALL students in the system
    const allStudents = await User.find({ role: "student" }).select(
      "name email batch section classOrBatch enrollment"
    );
    results.allStudents = { count: allStudents.length, students: allStudents };

    res.json(results);
  } catch (error) {
    console.error("Error in test endpoint:", error);
    res.status(500).json({ error: "Failed to test student filtering" });
  }
});

// Quick endpoint to see all students
router.get("/debug/all-students", auth, async (req, res) => {
  try {
    const allStudents = await User.find({ role: "student" }).select(
      "name email batch section classOrBatch enrollment"
    );

    console.log("=== ALL STUDENTS DEBUG ===");
    console.log(`Total students: ${allStudents.length}`);
    allStudents.forEach((student, index) => {
      console.log(`Student ${index + 1}:`, {
        name: student.name,
        email: student.email,
        batch: student.batch,
        section: student.section,
        classOrBatch: student.classOrBatch,
        enrollment: student.enrollment,
      });
    });
    console.log("==========================");

    res.json({
      total: allStudents.length,
      students: allStudents,
    });
  } catch (error) {
    console.error("Error fetching all students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Public debug endpoint (no auth required) to check database
router.get("/debug/public/students", async (req, res) => {
  try {
    const allStudents = await User.find({ role: "student" }).select(
      "name email batch section classOrBatch enrollment"
    );

    console.log("=== PUBLIC DEBUG: ALL STUDENTS ===");
    console.log(`Total students: ${allStudents.length}`);
    allStudents.forEach((student, index) => {
      console.log(`Student ${index + 1}:`, {
        name: student.name,
        email: student.email,
        batch: student.batch,
        section: student.section,
        classOrBatch: student.classOrBatch,
        enrollment: student.enrollment,
      });
    });
    console.log("==================================");

    res.json({
      total: allStudents.length,
      students: allStudents,
    });
  } catch (error) {
    console.error("Error in public debug endpoint:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Quick fix endpoint to update student Rohit
router.put("/debug/fix-rohit", async (req, res) => {
  try {
    const result = await User.findOneAndUpdate(
      { name: "rohit", role: "student" },
      {
        batch: "3rd year",
        section: "E1",
        classOrBatch: "3rd year - E1",
      },
      { new: true }
    );

    if (result) {
      console.log("✅ Fixed student Rohit:", result);
      res.json({
        success: true,
        message: "Student Rohit updated successfully",
        student: result,
      });
    } else {
      res.json({ success: false, message: "Student Rohit not found" });
    }
  } catch (error) {
    console.error("Error fixing student Rohit:", error);
    res.status(500).json({ error: "Failed to fix student" });
  }
});

export default router;
