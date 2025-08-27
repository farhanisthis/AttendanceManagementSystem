import mongoose from "mongoose";
const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    year: { type: String, required: false, default: "" },
    semester: { type: String, required: false, default: "" },
  },
  { timestamps: true }
);
export default mongoose.model("Subject", subjectSchema);
