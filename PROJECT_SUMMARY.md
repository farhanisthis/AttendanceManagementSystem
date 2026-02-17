# AttendEase — Attendance Management System

## What Problem Does It Solve

In most colleges, attendance is still tracked using paper registers or scattered spreadsheets. This leads to:

- **Manual errors** — Teachers mark attendance on paper, which is prone to mistakes and difficult to audit.
- **No real-time visibility** — Students have no way to check their own attendance without asking teachers.
- **Administrative overhead** — Admins have to manually compile attendance reports across subjects, sections, and time periods.
- **Timetable conflicts** — Scheduling classes without a conflict-detection system leads to overlapping slots for teachers or sections.

**AttendEase** solves these problems by providing a centralized, role-based web platform where:
- **Admins** manage users, subjects, timetables, and view institution-wide attendance reports.
- **Teachers** mark attendance digitally per timetable slot and export reports as CSV.
- **Students** view their own attendance records and subject-wise attendance percentage.

---

## Tech Stack

| Layer        | Technology                                                      |
| ------------ | --------------------------------------------------------------- |
| **Frontend** | React 19, Vite, TailwindCSS v4, DaisyUI, React Router, Axios   |
| **Backend**  | Node.js, Express.js                                             |
| **Database** | MongoDB with Mongoose ODM                                       |
| **Auth**     | JWT (JSON Web Tokens), bcrypt for password hashing              |
| **Email**    | Nodemailer (Gmail) for OTP-based password reset                 |
| **Export**   | json2csv for CSV attendance report generation                   |
| **Hosting**  | Render (configured via `render.yaml`)                           |

---

## Features

1. **Role-Based Access Control** — Three roles: Admin, Teacher, Student. Each has a dedicated dashboard with permissions enforced via middleware.
2. **User Management** — Admin can register, edit, and delete users (teachers and students) with fields like batch, section, enrollment number.
3. **Subject Management** — Admin can create, update, and delete subjects with name, code, year, and semester.
4. **Timetable Management** — Admin creates timetable slots with day, time, teacher, subject, room, and slot type (theory/lab/tutorial). The system automatically detects **time slot conflicts** for both sections and teachers.
5. **Teacher–Section Assignments** — Admin assigns teachers to specific year-section-subject combinations for teaching or mentorship roles.
6. **Digital Attendance Marking** — Teachers select a timetable slot and mark each student as present or absent. Supports both first-time marking and updating existing records.
7. **Student Attendance Tracking** — Students view their attendance records in a table, with subject-wise percentage summaries.
8. **Attendance Reports & CSV Export** — Teachers can view attendance reports and export all their attendance data as a downloadable CSV file.
9. **OTP-Based Password Reset** — Forgot password flow using 6-digit OTP sent via email, with expiry and verification.
10. **Responsive Modern UI** — Glassmorphism, gradients, hover animations, and DaisyUI components for a clean, professional look.

---

## How Frontend Talks to Backend

```
┌──────────────────┐          HTTP (REST API)          ┌──────────────────┐
│                  │  ──────────────────────────────▶   │                  │
│   React Client   │   GET/POST/PUT/DELETE requests    │  Express Server  │
│   (Vite, :5173)  │   with JWT in Authorization       │    (Node, :4000) │
│                  │  ◀──────────────────────────────   │                  │
│                  │        JSON responses              │                  │
└──────────────────┘                                    └──────────────────┘
```

1. **Axios Instance** (`client/src/api.js`) — A centralized Axios instance is configured with the backend base URL and an interceptor that automatically attaches the JWT token from `localStorage` to every request's `Authorization` header.

2. **API Routes** — The backend exposes RESTful endpoints under:
   - `/api/auth` — Register, login, OTP, password reset
   - `/api/admin` — CRUD for users, subjects, timetable, assignments
   - `/api/teacher` — Timetable, attendance marking/checking, reports, CSV export
   - `/api/student` — View timetable, attendance summary, detailed records
   - `/api/common` — Shared endpoints like student listing and profile

3. **Auth Flow** — On login, the server returns a JWT token. The frontend stores it in `localStorage` and sends it with every subsequent request. The `auth` middleware on the backend verifies the token and attaches the user to `req.user`.

4. **CORS** — The backend is configured with specific allowed origins (localhost for dev, Render URLs for production) to enable cross-origin requests.

5. **Proxy (Dev)** — In development, Vite's proxy configuration forwards `/api` requests to the backend to avoid CORS issues.

---

## Database Structure

MongoDB with **4 collections**:

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────┐
│    User      │       │    Timetable     │       │   Subject    │
├─────────────┤       ├─────────────────┤       ├──────────────┤
│ name         │       │ subjectId (ref)  │◀──────│ name         │
│ email        │       │ teacherId (ref)  │       │ code         │
│ passwordHash │       │ classOrBatch     │       │ year         │
│ role (enum)  │──────▶│ dayOfWeek        │       │ semester     │
│ batch        │       │ startTime        │       └──────────────┘
│ section      │       │ endTime          │
│ enrollment   │       │ slotType         │       ┌──────────────┐
│ classOrBatch │       │ room             │       │  Attendance  │
│ teacherAssign│       └─────────────────┘       ├──────────────┤
│ mentorship   │                                  │ date         │
└─────────────┘                                  │ timetableId  │
     │                                            │ subjectId    │
     │            referenced in                   │ teacherId    │
     └────────────────────────────────────────────│ classOrBatch │
                                                  │ records[]    │
                                                  │  ├ studentId │
                                                  │  └ status    │
                                                  └──────────────┘
```

- **User** — Stores all users (admin, teacher, student) with role-based fields.
- **Subject** — Academic subjects with code, year, and semester.
- **Timetable** — Maps subjects to teachers, sections, days, and time slots. Has pre-save hooks for conflict detection.
- **Attendance** — Links to a timetable slot and stores an array of student records (present/absent) for a given date. Indexed uniquely on `(date, timetableId)`.

---

## One Challenge Faced

**Timetable Slot Conflict Detection**

One significant challenge was implementing **timetable conflict detection**. When an admin creates a new timetable slot, the system needs to ensure:

1. **No section conflicts** — The same section (e.g., "3rd Year - E1") can't have two classes at overlapping times on the same day.
2. **No teacher conflicts** — The same teacher can't be assigned to two different sections at overlapping times.

This was solved using a **Mongoose pre-save hook** on the Timetable model. Before saving any new slot, the hook queries for existing slots that overlap in time for either the same section or the same teacher:

```javascript
timetableSchema.pre("save", async function (next) {
  // Check for section conflicts
  const classConflicts = await this.constructor.find({
    _id: { $ne: this._id },
    classOrBatch: this.classOrBatch,
    dayOfWeek: this.dayOfWeek,
    $or: [{ startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } }],
  });

  // Check for teacher conflicts
  const teacherConflicts = await this.constructor.find({
    _id: { $ne: this._id },
    teacherId: this.teacherId,
    dayOfWeek: this.dayOfWeek,
    $or: [{ startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } }],
  });
});
```

The challenge was getting the time overlap logic right — using `startTime < endTime AND endTime > startTime` (range overlap check) instead of exact time matching, and making sure it works correctly for both new inserts and updates (excluding the current document via `$ne: this._id`). Compound indexes were also added to keep these queries performant as the timetable grows.
