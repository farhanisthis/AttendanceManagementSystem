import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Subject from "./models/Subject.js";
import Timetable from "./models/Timetable.js";

const run = async () => {
  // Use default MongoDB connection if no environment variable
  const mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/college_attendance";
  await mongoose.connect(mongoUri);

  // Create admin if not exists
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    await User.create({
      name: process.env.ADMIN_NAME || "Admin User",
      email: adminEmail,
      passwordHash: await bcrypt.hash(
        process.env.ADMIN_PASSWORD || "admin123",
        10
      ),
      role: "admin",
    });
    console.log("Admin created");
  }

  // Create teacher if not exists
  let t = await User.findOne({ role: "teacher" });
  if (!t) {
    t = await User.create({
      name: "Teacher A",
      email: "teacher@example.com",
      passwordHash: await bcrypt.hash("teacher123", 10),
      role: "teacher",
      teacherAssignments: [
        {
          year: "2nd year",
          section: "E1",
          classOrBatch: "2nd year - E1",
          role: "teaching",
        },
        {
          year: "3rd year",
          section: "E1",
          classOrBatch: "3rd year - E1",
          role: "teaching",
        },
      ],
      mentorship: {
        year: "2nd year",
        section: "E1",
        classOrBatch: "2nd year - E1",
        description:
          "Academic guidance and career counseling for 2nd year E1 students",
      },
    });
  }

  // Create sample student if not exists
  let s = await User.findOne({ role: "student" });
  if (!s) {
    s = await User.create({
      name: "Student A",
      email: "student@example.com",
      passwordHash: await bcrypt.hash("student123", 10),
      role: "student",
      classOrBatch: process.env.DEFAULT_CLASS || "1st year - E1",
    });
  }

  // Seed 35 students for 3rd year E1
  console.log("🌱 Seeding 35 students for 3rd year E1...");
  const students3rdYearE1 = [
    { "S.No": 1, "Enrol No": "00124402023", Name: "Mohammad Asad" },
    { "S.No": 2, "Enrol No": "00224402023", Name: "Shiven Sharma" },
    { "S.No": 3, "Enrol No": "00324402023", Name: "SHIVAM VIJ" },
    { "S.No": 4, "Enrol No": "00424402023", Name: "TANYA SINHA" },
    { "S.No": 5, "Enrol No": "00524402023", Name: "Madhav Wadhwa" },
    { "S.No": 6, "Enrol No": "00624402023", Name: "POSHIKA PAL" },
    { "S.No": 7, "Enrol No": "00724402023", Name: "Ranveer Singh" },
    { "S.No": 8, "Enrol No": "00824402023", Name: "Devang bisht" },
    { "S.No": 9, "Enrol No": "00924402023", Name: "Vaibhav Kumar" },
    { "S.No": 10, "Enrol No": "01024402023", Name: "Kkavya Sahni" },
    { "S.No": 11, "Enrol No": "01124402023", Name: "DEEPALI JAIN" },
    { "S.No": 12, "Enrol No": "01224402023", Name: "HARSH MAGGO" },
    { "S.No": 13, "Enrol No": "01324402023", Name: "Vibhuti Panwar" },
    { "S.No": 14, "Enrol No": "01424402023", Name: "Aryan verma" },
    { "S.No": 15, "Enrol No": "01524402023", Name: "Jai Malik" },
    { "S.No": 16, "Enrol No": "01624402023", Name: "NIHARIKA SHARMA" },
    { "S.No": 17, "Enrol No": "01724402023", Name: "Siddharth Shrestha" },
    { "S.No": 18, "Enrol No": "01824402023", Name: "ARYAN THAKUR" },
    { "S.No": 19, "Enrol No": "01924402023", Name: "Aditya Kant Pathak" },
    { "S.No": 20, "Enrol No": "02024402023", Name: "Gursaibh Singh" },
    { "S.No": 21, "Enrol No": "02124402023", Name: "brahmjot singh" },
    { "S.No": 22, "Enrol No": "02224402023", Name: "HARSHITA SALUJA" },
    { "S.No": 23, "Enrol No": "02324402023", Name: "Sanskriti Singhal" },
    { "S.No": 24, "Enrol No": "02424402023", Name: "SANDEEP KUMAR" },
    { "S.No": 25, "Enrol No": "02524402023", Name: "Vishnu Narayan Khanna" },
    { "S.No": 26, "Enrol No": "02624402023", Name: "VAJIPAYAJULA ADITYA" },
    { "S.No": 27, "Enrol No": "02724402023", Name: "Akshita" },
    { "S.No": 28, "Enrol No": "02824402023", Name: "Mishti sehgal" },
    { "S.No": 29, "Enrol No": "02924402023", Name: "TWINKLE SHARMA" },
    { "S.No": 30, "Enrol No": "03024402023", Name: "DHRUV SHARMA" },
    { "S.No": 31, "Enrol No": "03124402023", Name: "Saif Siddiqui" },
    { "S.No": 32, "Enrol No": "03224402023", Name: "Aman kumar" },
    { "S.No": 33, "Enrol No": "03324402023", Name: "Muskan sharma" },
    { "S.No": 34, "Enrol No": "03424402023", Name: "Vansh Khatri" },
    { "S.No": 35, "Enrol No": "03524402023", Name: "Pansul Saxena" },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const student of students3rdYearE1) {
    try {
      // Check if student already exists
      const existingStudent = await User.findOne({
        $or: [
          {
            email: `${student.Name.toLowerCase().replace(
              /\s+/g,
              ""
            )}@example.com`,
          },
          { enrollment: student["Enrol No"] },
        ],
      });

      if (existingStudent) {
        console.log(`⚠️  Student ${student.Name} already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Create student with proper data
      const userData = {
        name: student.Name,
        email: `${student.Name.toLowerCase().replace(/\s+/g, "")}@example.com`,
        passwordHash: await bcrypt.hash("student123", 10),
        role: "student",
        enrollment: student["Enrol No"],
        batch: "3rd year",
        section: "E1",
        classOrBatch: "3rd year - E1",
        phone: "",
      };

      await User.create(userData);
      createdCount++;
      console.log(
        `✅ Created student: ${student.Name} (${student["Enrol No"]})`
      );
    } catch (error) {
      console.error(
        `❌ Error creating student ${student.Name}:`,
        error.message
      );
    }
  }

  console.log(
    `🎉 3rd Year E1 Students: Created ${createdCount}, Skipped ${skippedCount}`
  );

  // Create sample subject if not exists
  let subj = await Subject.findOne({ code: "DBMS" });
  if (!subj) {
    subj = await Subject.create({
      name: "Database Systems",
      code: "DBMS",
      year: "1st year",
      semester: "1st Semester",
    });
  }

  // Create sample timetable if not exists
  const tt = await Timetable.findOne({
    subjectId: subj._id,
    classOrBatch: process.env.DEFAULT_CLASS,
  });
  if (!tt) {
    await Timetable.create({
      subjectId: subj._id,
      teacherId: t._id,
      classOrBatch: process.env.DEFAULT_CLASS,
      dayOfWeek: 1,
      startTime: "10:00",
      endTime: "11:00",
    });
  }

  console.log("Seeding completed successfully!");
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
