import mongoose from "mongoose";
const recordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: { type: String, enum: ["present", "absent"], required: true },
  },
  { _id: false }
);
const attendanceSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classOrBatch: { type: String, required: true },
    records: [recordSchema],
  },
  { timestamps: true }
);
attendanceSchema.index({ date: 1, timetableId: 1 }, { unique: true });
export default mongoose.model("Attendance", attendanceSchema);
