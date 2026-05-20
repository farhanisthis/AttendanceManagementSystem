import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";

const run = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/college_attendance";
    await mongoose.connect(mongoUri);

    const newPassword = "teacher123";
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const result = await User.updateMany({ role: "teacher" }, { passwordHash });

    console.log(`✅ Updated ${result.modifiedCount} teacher(s)`);
    console.log(`🔑 All teachers password reset to: ${newPassword}`);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

run();
