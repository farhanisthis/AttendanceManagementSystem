import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Subject from "./models/Subject.js";
import Timetable from "./models/Timetable.js";

const run = async () => {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/college_attendance";
  await mongoose.connect(mongoUri);

  // Admin creation
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
    console.log("✅ Admin created");
  }

  // Teacher creation
  let t = await User.findOne({ role: "teacher" });
  if (!t) {
    t = await User.create({
      name: "Teacher A",
      email: "teacher@example.com",
      passwordHash: await bcrypt.hash("teacher123", 10),
      role: "teacher",
      mentorship: {
        year: "2nd year",
        section: "E1",
        classOrBatch: "2nd year - E1",
        description:
          "Academic guidance and career counseling for 2nd year E1 students",
      },
    });
    console.log("✅ Teacher created");
  }

  // ---------- STUDENT SEEDING ----------
  const students3rdYearE1 = [
    { enrol: "00124402023", name: "Mohammad Asad" },
    { enrol: "00224402023", name: "Shiven Sharma" },
    { enrol: "00324402023", name: "SHIVAM VIJ" },
    { enrol: "00424402023", name: "TANYA SINHA" },
    { enrol: "00524402023", name: "Madhav Wadhwa" },
    { enrol: "00624402023", name: "POSHIKA PAL" },
    { enrol: "00724402023", name: "Ranveer Singh" },
    { enrol: "00824402023", name: "Devang bisht" },
    { enrol: "00924402023", name: "Vaibhav Kumar" },
    { enrol: "01024402023", name: "Kkavya Sahni" },
    { enrol: "01124402023", name: "DEEPALI JAIN" },
    { enrol: "01224402023", name: "HARSH MAGGO" },
    { enrol: "01324402023", name: "Vibhuti Panwar" },
    { enrol: "01424402023", name: "Aryan verma" },
    { enrol: "01524402023", name: "Jai Malik" },
    { enrol: "01624402023", name: "NIHARIKA SHARMA" },
    { enrol: "01724402023", name: "Siddharth Shrestha" },
    { enrol: "01824402023", name: "ARYAN THAKUR" },
    { enrol: "01924402023", name: "Aditya Kant Pathak" },
    { enrol: "02024402023", name: "Gursahib Singh" },
    { enrol: "02124402023", name: "brahmjot singh" },
    { enrol: "02224402023", name: "HARSHITA SALUJA" },
    { enrol: "02324402023", name: "Sanskriti Singhal" },
    { enrol: "02424402023", name: "SANDEEP KUMAR" },
    { enrol: "02524402023", name: "Vishnu Narayan" },
    { enrol: "02624402023", name: "VAJIPAYAJULA" },
    { enrol: "02724402023", name: "Akshita" },
    { enrol: "02824402023", name: "Mishti sehgal" },
    { enrol: "02924402023", name: "TWINKLE SHARMA" },
    { enrol: "03024402023", name: "DHRUV SHARMA" },
    { enrol: "03124402023", name: "Saif Siddiqui" },
    { enrol: "03224402023", name: "Aman kumar" },
    { enrol: "03324402023", name: "Muskan sharma" },
    { enrol: "03424402023", name: "Vansh Khatri" },
    { enrol: "03524402023", name: "Pansul Saxena" },
    { enrol: "03624402023", name: "Mayank Mayur" },
    { enrol: "03724402023", name: "Niyati Mittal" },
    { enrol: "03824402023", name: "Jiya Basra" },
    { enrol: "03924402023", name: "Aditya s bhandari" },
    { enrol: "04024402023", name: "Krish Aggarwal" },
    { enrol: "04124402023", name: "MOHIT KUMAR" },
    { enrol: "04224402023", name: "Pavish Ahuja" },
    { enrol: "04324402023", name: "Sunveen Kaur" },
    { enrol: "04424402023", name: "Priyanshu Shekhar" },
    { enrol: "04524402023", name: "Manas Sharma" },
    { enrol: "04624402023", name: "Muskan Thapa" },
    { enrol: "04724402023", name: "SHIVANI TIWARI" },
    { enrol: "04824402023", name: "Parth Malhotra" },
    { enrol: "04924402023", name: "Megha Chakraborty" },
    { enrol: "05024402023", name: "Aaryan Bhardwaj" },
    { enrol: "05124402023", name: "Manish Nainwal" },
    { enrol: "05224402023", name: "Nitin Kamia" },
    { enrol: "05324402023", name: "krishna goyal" },
    { enrol: "05424402023", name: "Ashish Luthra" },
    { enrol: "05524402023", name: "Farhan Ali" },
    { enrol: "05624402023", name: "Jashandeep singh" },
    { enrol: "05724402023", name: "Aditya Bhardwaj" },
    { enrol: "05824402023", name: "AKSHAT GULSATIYA" },
    { enrol: "05924402023", name: "Shreeyansh Srivastava" },
    { enrol: "06024402023", name: "priyanshu sharma" },
  ];

  const students3rdYearE2 = [
    { enrollmentNo: "06124402023", name: "Rohit Dahiya" },
    { enrollmentNo: "06224402023", name: "Saiyid Fazal Abbas Rizvi" },
    { enrollmentNo: "06324402023", name: "Shreya pal" },
    { enrollmentNo: "06424402023", name: "Garema Gaba" },
    { enrollmentNo: "06524402023", name: "Piyush Sharma" },
    { enrollmentNo: "06624402023", name: "Chaitanya Jeet Singh" },
    { enrollmentNo: "06724402023", name: "Tejaswani Raj" },
    { enrollmentNo: "06824402023", name: "Dhruv Pahuja" },
    { enrollmentNo: "06924402023", name: "Rohan Matta" },
    { enrollmentNo: "07024402023", name: "Muskan" },
    { enrollmentNo: "07124402023", name: "Parth Gupta" },
    { enrollmentNo: "07224402023", name: "Manya Sharma" },
    { enrollmentNo: "07324402023", name: "Simran" },
    { enrollmentNo: "07424402023", name: "Nakul Garg" },
    { enrollmentNo: "07524402023", name: "Mohd Ayan" },
    { enrollmentNo: "07624402023", name: "Chirag Joshi" },
    { enrollmentNo: "07724402023", name: "Premkumar Pavankumar Baghel" },
    { enrollmentNo: "07824402023", name: "Anuj Mandal" },
    { enrollmentNo: "07924402023", name: "Ajay" },
    { enrollmentNo: "08024402023", name: "Havi Bhardwaj" },
    { enrollmentNo: "08124402023", name: "Gaurav Badoni" },
    { enrollmentNo: "08224402023", name: "Anjnay Garg" },
    { enrollmentNo: "08324402023", name: "Tanvi Handa" },
    { enrollmentNo: "08424402023", name: "Kashish" },
    { enrollmentNo: "08524402023", name: "Narender" },
    { enrollmentNo: "08624402023", name: "Ujjwal Nigam" },
    { enrollmentNo: "08724402023", name: "Gagan Thakur" },
    { enrollmentNo: "08824402023", name: "Vansh Chandna" },
    { enrollmentNo: "08924402023", name: "Samdish Singh" },
    { enrollmentNo: "09024402023", name: "Sumeet Singh Marwah" },
    { enrollmentNo: "09124402023", name: "Manan Tyagi" },
    { enrollmentNo: "09224402023", name: "Rehan Gupta" },
    { enrollmentNo: "09324402023", name: "Lokesh Singh Rawat" },
    { enrollmentNo: "09424402023", name: "Krishna Gulati" },
    { enrollmentNo: "09524402023", name: "Arpit Arya" },
    { enrollmentNo: "09624402023", name: "Rohan Bhujade" },
    { enrollmentNo: "09724402023", name: "Priyanshu" },
    { enrollmentNo: "09824402023", name: "Rahul Sharma" },
    { enrollmentNo: "09924402023", name: "Sonali Sharma" },
    { enrollmentNo: "10024402023", name: "Harkirat Singh Maken" },
    { enrollmentNo: "10124402023", name: "Rachit Relia" },
    { enrollmentNo: "10224402023", name: "Govind Ahuja" },
    { enrollmentNo: "10324402023", name: "Nancy Sra" },
    { enrollmentNo: "10424402023", name: "Aman Bisht" },
    { enrollmentNo: "10524402023", name: "Anupam" },
    { enrollmentNo: "10624402023", name: "Ujjwal Pal" },
    { enrollmentNo: "10724402023", name: "Peeyush Sheoran" },
    { enrollmentNo: "10824402023", name: "Gaurav" },
    { enrollmentNo: "35124402023", name: "Divyansh Chopra" },
    { enrollmentNo: "35224402023", name: "Jimmy Thomas" },
    { enrollmentNo: "35324402023", name: "Harsh sharma" },
    { enrollmentNo: "35424402023", name: "Daksh Chanana" },
    { enrollmentNo: "35524402023", name: "Sambhav Singh" },
    { enrollmentNo: "35624402023", name: "Kartik" },
    { enrollmentNo: "35724402023", name: "Dhruv Agnihotri" },
    { enrollmentNo: "35824402023", name: "Akul Bhasin" },
    { enrollmentNo: "35924402023", name: "Pratham Sharma" },
    { enrollmentNo: "36024402023", name: "Aastha" },
    { enrollmentNo: "36124402023", name: "Perepa Surya Aarush" },
    { enrollmentNo: "36224402023", name: "Daksh" },
  ];

  const seedStudents = async (students, section) => {
    let createdCount = 0,
      skippedCount = 0;
    for (const student of students) {
      try {
        const existingStudent = await User.findOne({
          $or: [
            {
              email: `${student.name
                .toLowerCase()
                .replace(/\s+/g, "")}@example.com`,
            },
            { enrollment: student.enrollmentNo },
          ],
        });

        if (existingStudent) {
          skippedCount++;
          continue;
        }

        await User.create({
          name: student.name,
          email: `${student.name
            .toLowerCase()
            .replace(/\s+/g, "")}@example.com`,
          passwordHash: await bcrypt.hash("student123", 10),
          role: "student",
          enrollment: student.enrollmentNo,
          batch: "3rd year",
          section,
          classOrBatch: `3rd year - ${section}`,
          phone: "",
        });

        createdCount++;
      } catch (err) {
        console.error(`❌ Error creating ${student.name}:`, err.message);
      }
    }
    console.log(
      `🎉 ${section} Students: Created ${createdCount}, Skipped ${skippedCount}`
    );
  };

  await seedStudents(students3rdYearE1, "E1");
  await seedStudents(students3rdYearE2, "E2");

  // ---------- SUBJECT SEEDING ----------
  console.log("📚 Creating subjects...");
  const subjects = [
    {
      name: "Database Systems",
      code: "DBMS",
      year: "3rd year",
      semester: "5th Semester",
    },
    {
      name: "Computer Networks",
      code: "CN",
      year: "3rd year",
      semester: "5th Semester",
    },
    {
      name: "Operating Systems",
      code: "OS",
      year: "3rd year",
      semester: "5th Semester",
    },
    {
      name: "Software Engineering",
      code: "SE",
      year: "3rd year",
      semester: "6th Semester",
    },
    {
      name: "Data Structures",
      code: "DS",
      year: "2nd year",
      semester: "3rd Semester",
    },
    {
      name: "Object Oriented Programming",
      code: "OOP",
      year: "2nd year",
      semester: "3rd Semester",
    },
  ];

  for (const subjectData of subjects) {
    let subject = await Subject.findOne({ code: subjectData.code });
    if (!subject) {
      subject = await Subject.create(subjectData);
      console.log(
        `✅ Created subject: ${subjectData.name} (${subjectData.code})`
      );
    } else {
      console.log(
        `⚠️  Subject ${subjectData.name} already exists, skipping...`
      );
    }
  }

  // ---------- TIMETABLE SEEDING ----------
  console.log("📅 Creating timetables...");
  const timetables = [
    {
      subjectCode: "DBMS",
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "10:00",
      classOrBatch: "3rd year - E1",
    },
    {
      subjectCode: "CN",
      dayOfWeek: 1, // Monday
      startTime: "10:00",
      endTime: "11:00",
      classOrBatch: "3rd year - E1",
    },
    {
      subjectCode: "OS",
      dayOfWeek: 2, // Tuesday
      startTime: "09:00",
      endTime: "10:00",
      classOrBatch: "3rd year - E1",
    },
    {
      subjectCode: "SE",
      dayOfWeek: 2, // Tuesday
      startTime: "10:00",
      endTime: "11:00",
      classOrBatch: "3rd year - E1",
    },
  ];

  for (const ttData of timetables) {
    try {
      const subject = await Subject.findOne({ code: ttData.subjectCode });
      if (subject) {
        const existingTT = await Timetable.findOne({
          subjectId: subject._id,
          classOrBatch: ttData.classOrBatch,
          dayOfWeek: ttData.dayOfWeek,
        });

        if (!existingTT) {
          await Timetable.create({
            subjectId: subject._id,
            teacherId: t._id,
            classOrBatch: ttData.classOrBatch,
            dayOfWeek: ttData.dayOfWeek,
            startTime: ttData.startTime,
            endTime: ttData.endTime,
          });
          console.log(
            `✅ Created timetable: ${subject.name} on day ${ttData.dayOfWeek}`
          );
        } else {
          console.log(
            `⚠️  Timetable for ${subject.name} already exists, skipping...`
          );
        }
      }
    } catch (error) {
      console.log(
        `⚠️  Skipping timetable creation for ${ttData.subjectCode}: ${error.message}`
      );
    }
  }

  console.log("✅ Seeding completed!");
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
