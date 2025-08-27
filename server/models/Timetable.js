import mongoose from "mongoose";
const timetableSchema = new mongoose.Schema(
  {
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
    classOrBatch: { type: String, required: true }, // Section like E1, E2, etc.
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotType: { 
      type: String, 
      enum: ["theory", "lab", "tutorial"], 
      default: "theory" 
    },
    room: { type: String }, // Optional room number
    notes: { type: String }, // Additional notes for the slot
  },
  { timestamps: true }
);

// Compound index to prevent overlapping time slots for same section on same day
timetableSchema.index(
  { classOrBatch: 1, dayOfWeek: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

export default mongoose.model("Timetable", timetableSchema);
