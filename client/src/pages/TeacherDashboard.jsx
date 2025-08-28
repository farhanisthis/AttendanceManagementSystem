import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";
import { useAuth } from "../AuthContext";

const todayISO = () => new Date().toISOString().slice(0, 10);

function Section({ title, children, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {icon && <div className="text-2xl">{icon}</div>}
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1); // Default to Monday if Sunday
  const [slots, setSlots] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [mark, setMark] = useState({}); // studentId -> 'present'|'absent'
  const [msg, setMsg] = useState("");
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [mentorship, setMentorship] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const days = [
    { id: 1, name: "Monday", short: "Mon" },
    { id: 2, name: "Tuesday", short: "Tue" },
    { id: 3, name: "Wednesday", short: "Wed" },
    { id: 4, name: "Thursday", short: "Thu" },
    { id: 5, name: "Friday", short: "Fri" },
    { id: 6, name: "Saturday", short: "Sat" },
  ];

  const loadSlots = async (day) => {
    const { data } = await api.get(`/teacher/timetable?day=${day}`);
    setSlots(data);
    setSelected(null);
    setExistingAttendance(null);
    setIsEditing(false);
  };

  // Helper function to extract meaningful error messages
  const getErrorMessage = (error) => {
    // Check for MongoDB duplicate key error
    if (error.response?.data?.error?.includes("E11000")) {
      const errorStr = error.response.data.error;
      if (errorStr.includes("email")) {
        return "Email already exists. Please use a different email address.";
      } else if (errorStr.includes("enrollment")) {
        return "Enrollment number already exists. Please use a different enrollment number.";
      } else if (errorStr.includes("code")) {
        return "Subject code already exists. Please use a different code.";
      }
      return "Duplicate entry found. Please check your input.";
    }

    // Check for validation errors
    if (error.response?.data?.error?.includes("validation failed")) {
      const validationErrors = error.response.data.error;
      if (validationErrors.includes("email")) {
        return "Invalid email format. Please enter a valid email address.";
      } else if (validationErrors.includes("password")) {
        return "Password must be at least 6 characters long.";
      }
      return "Validation failed. Please check your input.";
    }

    // Check for specific API error messages
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    // Fallback error messages
    if (error.code === "NETWORK_ERROR") {
      return "Network error. Please check your connection.";
    }
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please try again.";
    }

    return "An error occurred. Please try again.";
  };

  const loadTeacherProfile = async () => {
    try {
      setIsLoadingProfile(true);
      console.log("Loading teacher profile...");
      const { data } = await api.get(`/common/profile`);
      console.log("Profile data received:", data);
      if (data) {
        if (data.teacherAssignments) {
          console.log("Setting teacher assignments:", data.teacherAssignments);
          setTeacherAssignments(data.teacherAssignments);
        }
        if (data.mentorship) {
          console.log("Setting mentorship:", data.mentorship);
          setMentorship(data.mentorship);
        }
      }
    } catch (error) {
      console.error("Error loading teacher profile:", error);
      toast.error("Failed to load teacher profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadStudents = async (classOrBatch) => {
    try {
      const { data } = await api.get(`/common/students?teacherId=${user._id}`);

      // Filter students by the selected class/batch
      const filteredStudents = data.filter(
        (student) => student.classOrBatch === classOrBatch
      );
      setStudents(filteredStudents);

      // Initialize with absent as default
      const init = {};
      filteredStudents.forEach((s) => {
        init[s._id] = "absent";
      });
      setMark(init);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load students");
      setStudents([]);
      setMark({});
    }
  };

  const checkExistingAttendance = async (timetableId, date) => {
    try {
      const { data } = await api.get(
        `/teacher/attendance/check?timetableId=${timetableId}&date=${date}`
      );
      if (data && data.records) {
        setExistingAttendance(data);
        // Pre-fill the mark state with existing attendance
        const existingMarks = {};
        data.records.forEach((record) => {
          existingMarks[record.studentId] = record.status;
        });
        setMark(existingMarks);
        return true;
      }
      return false;
    } catch (error) {
      console.log("No existing attendance found");
      return false;
    }
  };

  useEffect(() => {
    loadSlots(selectedDay);
    // Load teacher assignments
    if (user) {
      loadTeacherProfile();
    }
  }, [selectedDay, user]);

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (msg && !msg.includes("Error") && !isSubmitting) {
      const timer = setTimeout(() => {
        setMsg("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [msg, isSubmitting]);

  const onSelect = async (tt) => {
    setSelected(tt);
    setMsg("");
    await loadStudents(tt.classOrBatch);

    // Check if attendance already exists for this date and timetable
    const hasExisting = await checkExistingAttendance(tt._id, date);
    if (hasExisting) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  };

  const onDateChange = async (newDate) => {
    setDate(newDate);
    if (selected) {
      const hasExisting = await checkExistingAttendance(selected._id, newDate);
      if (hasExisting) {
        setIsEditing(true);
      } else {
        setIsEditing(false);
        // Reset to default absent state
        const init = {};
        students.forEach((s) => {
          init[s._id] = "absent";
        });
        setMark(init);
      }
    }
  };

  const toggleAttendance = (studentId) => {
    setMark((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
  };

  const submit = async () => {
    // Validation checks
    if (!selected || !selected._id) {
      toast.error("No class selected");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (students.length === 0) {
      toast.error("No students found for this class");
      return;
    }

    // Check if all students have attendance marked
    const allStudentsMarked = students.every((student) => mark[student._id]);
    if (!allStudentsMarked) {
      toast.error("Please mark attendance for all students");
      return;
    }

    const records = Object.entries(mark).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    try {
      setIsSubmitting(true);
      toast.loading("Saving attendance...");

      const response = await api.post("/teacher/attendance/mark", {
        date,
        timetableId: selected._id,
        records,
      });

      toast.success("Attendance saved successfully!");
      setIsEditing(true);

      // Refresh existing attendance
      await checkExistingAttendance(selected._id, date);

      // Show success message with details
      const presentCount = records.filter((r) => r.status === "present").length;
      const absentCount = records.filter((r) => r.status === "absent").length;
      toast.success(
        `Attendance saved! ${presentCount} present, ${absentCount} absent`
      );
    } catch (error) {
      console.error("Error saving attendance:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sorted = useMemo(
    () => [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots]
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-lg">
          <span className="text-3xl">👨‍🏫</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4">
          Teacher Dashboard
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Manage your classes and mark student attendance efficiently
        </p>
      </div>

      {/* Teacher Assignments Section */}
      {isLoadingProfile ? (
        <Section title="Loading Assignments..." icon="⏳">
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg text-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading your assignments...</p>
          </div>
        </Section>
      ) : (teacherAssignments && teacherAssignments.length > 0) ||
        (mentorship && mentorship.classOrBatch) ? (
        <Section title="Your Assignments & Mentorship" icon="📚">
          {/* Teaching Assignments */}
          {teacherAssignments &&
            teacherAssignments.length > 0 &&
            teacherAssignments.filter((a) => a.role === "teaching").length >
              0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Teaching Assignments:
                </h4>
                <div className="flex flex-wrap gap-3">
                  {teacherAssignments
                    .filter((a) => a.role === "teaching")
                    .map((assignment, index) => (
                      <div key={index} className="badge badge-primary badge-lg">
                        {assignment.classOrBatch}
                        {assignment.subjectName &&
                          ` - ${assignment.subjectName}`}
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Mentorship Assignment */}
          {mentorship && mentorship.classOrBatch && (
            <div className="mb-4">
              <h4 className="font-medium text-blue-700 mb-2">Mentorship:</h4>
              <div className="flex flex-wrap gap-3">
                <div className="badge badge-outline  badge-secondary badge-lg">
                  {mentorship.classOrBatch}
                </div>
                {mentorship.description && (
                  <div className="text-sm text-gray-600 mt-1">
                    {mentorship.description}
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mt-3">
            You can mark attendance for students in your teaching assignments.
            Mentorship provides academic guidance.
          </p>
        </Section>
      ) : (
        <Section title="No Assignments" icon="⚠️">
          <div className="text-center py-4">
            <p className="text-gray-600">
              You haven't been assigned to any sections yet.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please contact your administrator for section assignments.
            </p>
          </div>
        </Section>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Weekly Schedule" icon="📅">
          <div className="space-y-4">
            <div className="flex gap-2 items-center mb-4">
              <span className="text-slate-600 font-medium">
                Teacher: {user.name}
              </span>
            </div>

            {/* Day Selection Boxes */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md text-center ${
                    selectedDay === day.id
                      ? "border-blue-500 bg-blue-50 text-blue-800 shadow-md"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-bold text-lg">{day.short}</div>
                  <div className="text-sm opacity-75">{day.name}</div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {sorted.map((tt) => (
                <button
                  key={tt._id}
                  onClick={() => onSelect(tt)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    selected?._id === tt._id
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-medium">
                    {tt.startTime} - {tt.endTime}
                  </div>
                  <div className="text-sm text-slate-600">
                    {tt.subjectId?.name} • {tt.classOrBatch}
                  </div>
                </button>
              ))}
              {sorted.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  No classes scheduled for this day
                </div>
              )}
            </div>
          </div>
        </Section>

        <Section title="Mark Attendance" icon="✅">
          {!selected ? (
            <div className="text-center text-slate-500 py-12">
              Select a class slot from the left to mark attendance
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center p-3 bg-slate-50 rounded-lg">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {selected.subjectId?.name}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {selected.classOrBatch}
                </span>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={date}
                  onChange={(e) => onDateChange(e.target.value)}
                />
              </div>

              {existingAttendance && (
                <div className="alert alert-info">
                  <span>
                    📝 Attendance already marked for this date. You can edit
                    below.
                  </span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Enrollment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students && students.length > 0 ? (
                      students.map((s) => (
                        <tr key={s._id}>
                          <td className="font-medium">{s.name}</td>
                          <td className="text-slate-600">
                            {s.enrollment || "Not provided"}
                          </td>
                          <td>
                            <button
                              onClick={() => toggleAttendance(s._id)}
                              className={`btn btn-sm ${
                                mark[s._id] === "present"
                                  ? "btn-success"
                                  : "btn-error"
                              }`}
                            >
                              {mark[s._id] === "present"
                                ? "✅ Present"
                                : "❌ Absent"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-center text-slate-500 py-4"
                        >
                          No students enrolled in this class
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  className="btn btn-primary flex-1"
                  onClick={submit}
                  disabled={students.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : isEditing ? (
                    "Update Attendance"
                  ) : (
                    "Save Attendance"
                  )}
                </button>
                <a className="btn btn-outline" href="/teacher/reports/csv">
                  Export CSV
                </a>
              </div>

              {msg && (
                <div
                  className={`alert ${
                    msg.includes("Error") ? "alert-error" : "alert-success"
                  } mt-3`}
                >
                  <span>
                    {msg.includes("Error") ? "❌" : "✅"} {msg}
                  </span>
                  {!msg.includes("Error") && (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setMsg("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
