import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String }, // Optional phone number
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
    },
    batch: { type: String }, // 1st year, 2nd year, 3rd year
    section: { type: String }, // E1, E2, M1, M2
    enrollment: { type: String, unique: true, sparse: true }, // Student enrollment number
    classOrBatch: { type: String }, // For students: single class, For teachers: can be multiple sections
    // Virtual field for students to maintain compatibility
    studentClass: {
      type: String,
      get: function () {
        if (this.role === "student") {
          return this.enrollment || this.classOrBatch;
        }
        return this.classOrBatch;
      },
    },
    sections: [{ type: String }], // For teachers: array of sections they teach
    teacherAssignments: [
      {
        year: { type: String, required: true },
        section: { type: String, required: true },
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },
        role: {
          type: String,
          required: true,
          enum: ["teaching", "mentorship"],
        },
        classOrBatch: { type: String },
        subjectName: { type: String },
      },
    ],
    mentorship: {
      year: { type: String },
      section: { type: String },
      description: { type: String },
      classOrBatch: { type: String },
    },
  },
  { timestamps: true }
);
export default mongoose.model("User", userSchema);
