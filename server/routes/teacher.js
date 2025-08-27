import express from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import Timetable from "../models/Timetable.js";
import Attendance from "../models/Attendance.js";
import { Parser as CsvParser } from "json2csv";
const router = express.Router();

router.get("/timetable", auth, requireRole("teacher"), async (req, res) => {
  const { day } = req.query;
  const q = { teacherId: req.user._id };
  if (day !== undefined) q.dayOfWeek = Number(day);
  const items = await Timetable.find(q).populate("subjectId").lean();
  res.json(items);
});

// New endpoint to check existing attendance
router.get(
  "/attendance/check",
  auth,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { timetableId, date } = req.query;

      // Verify the timetable belongs to the teacher
      const tt = await Timetable.findById(timetableId).lean();
      if (!tt || String(tt.teacherId) !== String(req.user._id)) {
        return res.status(400).json({ error: "Invalid timetable" });
      }

      // Find existing attendance
      const attendance = await Attendance.findOne({ date, timetableId }).lean();

      if (attendance) {
        res.json(attendance);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/attendance/mark",
  auth,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const { date, timetableId, records } = req.body;

      // Validate required fields

      // Validate required fields
      if (!date || !timetableId || !records || !Array.isArray(records)) {
        return res.status(400).json({
          error:
            "Missing required fields: date, timetableId, and records array",
        });
      }

      if (records.length === 0) {
        return res.status(400).json({
          error: "Records array cannot be empty",
        });
      }

      // Find and validate timetable
      const tt = await Timetable.findById(timetableId).lean();
      if (!tt) {
        return res.status(400).json({ error: "Timetable not found" });
      }

      if (String(tt.teacherId) !== String(req.user._id)) {
        return res
          .status(403)
          .json({ error: "You can only mark attendance for your own classes" });
      }

      // Validate records structure
      const validRecords = records.filter(
        (record) =>
          record.studentId &&
          record.status &&
          ["present", "absent"].includes(record.status)
      );

      if (validRecords.length !== records.length) {
        return res.status(400).json({
          error:
            "Invalid record format. Each record must have studentId and status (present/absent)",
        });
      }

      // Create or update attendance record

      const doc = await Attendance.findOneAndUpdate(
        { date, timetableId },
        {
          date,
          timetableId,
          subjectId: tt.subjectId,
          teacherId: tt.teacherId,
          classOrBatch: tt.classOrBatch,
          records: validRecords,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Attendance saved successfully

      res.json(doc);
    } catch (error) {
      console.error("Error in attendance/mark:", error);
      res.status(500).json({
        error: "Internal server error while saving attendance",
        details: error.message,
      });
    }
  }
);

router.get("/reports", auth, requireRole("teacher"), async (req, res) => {
  const { subjectId } = req.query;
  const q = { teacherId: req.user._id };
  if (subjectId) q.subjectId = subjectId;
  const items = await Attendance.find(q)
    .populate("subjectId", "name code")
    .lean();
  res.json(items);
});

router.get("/reports/csv", auth, requireRole("teacher"), async (req, res) => {
  const items = await Attendance.find({ teacherId: req.user._id })
    .populate("subjectId", "name code")
    .lean();
  const rows = [];
  for (const a of items) {
    for (const r of a.records) {
      rows.push({
        date: a.date,
        subject: a.subjectId?.name,
        code: a.subjectId?.code,
        class: a.classOrBatch,
        studentId: r.studentId,
        status: r.status,
      });
    }
  }
  const csv = new CsvParser({
    fields: ["date", "subject", "code", "class", "studentId", "status"],
  }).parse(rows);
  res.header("Content-Type", "text/csv");
  res.attachment("attendance.csv");
  return res.send(csv);
});

export default router;
