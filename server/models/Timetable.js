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
      default: "theory",
    },
    room: { type: String }, // Optional room number
    notes: { type: String }, // Additional notes for the slot
  },
  { timestamps: true }
);

// Compound index to prevent overlapping time slots for same section on same day
// This index helps with query performance but doesn't prevent overlaps
timetableSchema.index({
  classOrBatch: 1,
  dayOfWeek: 1,
  startTime: 1,
  endTime: 1,
});

// Add a compound index for teacher conflicts
timetableSchema.index({ teacherId: 1, dayOfWeek: 1, startTime: 1, endTime: 1 });

// Pre-save hook to validate no overlapping time slots
timetableSchema.pre("save", async function (next) {
  try {
    // Check for class/batch conflicts
    const classConflicts = await this.constructor.find({
      _id: { $ne: this._id }, // Exclude current document if updating
      classOrBatch: this.classOrBatch,
      dayOfWeek: this.dayOfWeek,
      $or: [
        {
          startTime: { $lt: this.endTime },
          endTime: { $gt: this.startTime },
        },
      ],
    });

    if (classConflicts.length > 0) {
      const error = new Error(
        "Time slot conflicts with existing classes for the same section"
      );
      error.name = "ValidationError";
      return next(error);
    }

    // Check for teacher conflicts
    const teacherConflicts = await this.constructor.find({
      _id: { $ne: this._id }, // Exclude current document if updating
      teacherId: this.teacherId,
      dayOfWeek: this.dayOfWeek,
      $or: [
        {
          startTime: { $lt: this.endTime },
          endTime: { $gt: this.startTime },
        },
      ],
    });

    if (teacherConflicts.length > 0) {
      const error = new Error("Teacher has conflicting classes at this time");
      error.name = "ValidationError";
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Timetable", timetableSchema);
