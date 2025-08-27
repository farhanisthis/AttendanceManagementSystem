import express from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import Timetable from "../models/Timetable.js";
import Attendance from "../models/Attendance.js";
import mongoose from "mongoose";
const router = express.Router();

router.get("/timetable", auth, requireRole("student"), async (req, res) => {
  const items = await Timetable.find({ classOrBatch: req.user.classOrBatch })
    .populate("subjectId")
    .populate("teacherId", "name");
  res.json(items);
});
router.get(
  "/attendance/summary",
  auth,
  requireRole("student"),
  async (req, res) => {
    try {
      const docs = await Attendance.find({
        classOrBatch: req.user.classOrBatch,
      }).lean();

      const me = String(req.user._id);
      const map = {};

      // Get unique subject IDs to fetch subject data
      const subjectIds = [...new Set(docs.map((d) => d.subjectId))];

      // Fetch subject data for all subjects
      const Subject = mongoose.model("Subject");
      const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean();
      const subjectMap = {};
      subjects.forEach((s) => {
        subjectMap[String(s._id)] = { name: s.name, code: s.code };
      });

      for (const a of docs) {
        const rec = a.records.find((r) => String(r.studentId) === me);
        if (!rec) continue;

        const subjectId = String(a.subjectId);
        const subjectInfo = subjectMap[subjectId];

        // Use subject name as key, fallback to code, then ID
        const subjectKey =
          subjectInfo?.name || subjectInfo?.code || `Subject ${subjectId}`;

        if (!map[subjectKey]) {
          map[subjectKey] = {
            present: 0,
            total: 0,
            subjectId: subjectId,
            subjectName: subjectInfo?.name,
            subjectCode: subjectInfo?.code,
          };
        }
        map[subjectKey].total += 1;
        if (rec.status === "present") map[subjectKey].present += 1;
      }

      res.json(map);
    } catch (error) {
      console.error("Error in attendance summary:", error);
      res.status(500).json({ error: "Failed to get attendance summary" });
    }
  }
);

// Get detailed attendance records for a student
router.get("/attendance", auth, requireRole("student"), async (req, res) => {
  try {
    const docs = await Attendance.find({
      classOrBatch: req.user.classOrBatch,
    })
      .populate("subjectId", "name code")
      .populate("teacherId", "name email")
      .sort({ date: -1 }) // Most recent first
      .lean();

    const studentId = String(req.user._id);
    const studentAttendance = [];

    for (const attendance of docs) {
      const record = attendance.records.find(
        (r) => String(r.studentId) === studentId
      );

      if (record) {
        studentAttendance.push({
          _id: attendance._id,
          date: attendance.date,
          subjectId: attendance.subjectId,
          teacherId: attendance.teacherId,
          classOrBatch: attendance.classOrBatch,
          status: record.status,
        });
      }
    }

    res.json(studentAttendance);
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});

export default router;
