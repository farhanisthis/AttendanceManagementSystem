import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import teacherRoutes from "./routes/teacher.js";
import studentRoutes from "./routes/student.js";
import commonRoutes from "./routes/common.js";

const app = express();
// CORS configuration for production
const corsOptions = {
  origin: [
    "http://localhost:5173", // Development
    "https://attendancemanagementsystem-1-o34z.onrender.com", // Your frontend URL
    "https://attendancemanagementsystem.onrender.com", // Your backend URL
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// Handle preflight requests
app.options("*", cors(corsOptions));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

app.get("/", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/common", commonRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});
app.listen(process.env.PORT || 4000, () =>
  console.log("Server on http://localhost:" + (process.env.PORT || 4000))
);
