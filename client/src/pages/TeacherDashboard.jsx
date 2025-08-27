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
  const [showReportModal, setShowReportModal] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [showAllStudents, setShowAllStudents] = useState(false);

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
      const { data } = await api.get(`/common/profile`);
      if (data) {
        if (data.teacherAssignments) {
          setTeacherAssignments(data.teacherAssignments);
        }
        if (data.mentorship) {
          setMentorship(data.mentorship);
        }
      }
    } catch (error) {
      console.error("Error loading teacher profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadStudents = async (classOrBatch, timetableData = null) => {
    try {
      // Debug authentication state
      console.log("=== AUTHENTICATION DEBUG ===");
      console.log("User object:", user);
      console.log("User ID:", user?._id);
      console.log("User role:", user?.role);
      console.log("Token exists:", !!localStorage.getItem("token"));
      console.log(
        "Token value:",
        localStorage.getItem("token")?.substring(0, 20) + "..."
      );
      console.log("================================");

      // Check if user is authenticated
      if (!user || !user._id) {
        console.error("User not authenticated - user:", user);
        toast.error("Please login again");
        setStudents([]);
        return;
      }

      // Check if token exists
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        toast.error("Please login again");
        setStudents([]);
        return;
      }

      // Extract year and section from classOrBatch (format: "1st year - E1")
      const yearMatch = classOrBatch.match(/^(.+?)\s+year/);
      const sectionMatch = classOrBatch.match(/\s*-\s*(.+)$/);

      let year = yearMatch ? yearMatch[1] + " year" : null;
      let section = sectionMatch ? sectionMatch[1] : null;

      // Alternative: try to extract from the full classOrBatch string
      if (!year && classOrBatch.includes("year")) {
        const parts = classOrBatch.split(" - ");
        if (parts.length === 2) {
          const yearPart = parts[0].trim();
          const sectionPart = parts[1].trim();
          if (yearPart.includes("year") && sectionPart) {
            year = yearPart;
            section = sectionPart;
          }
        }
      }

      // Get the subject ID from the timetable data passed as parameter or from selected state
      const subjectId =
        timetableData?.subjectId?._id || selected?.subjectId?._id;

      console.log("=== STUDENT LOADING DEBUG ===");
      console.log("Class/Batch:", classOrBatch);
      console.log("Extracted Year:", year);
      console.log("Extracted Section:", section);
      console.log("Subject ID:", subjectId);
      console.log("Selected Timetable:", selected);
      console.log("Timetable Data Parameter:", timetableData);
      console.log("================================");

      // Show warning if teacher is trying to access a class they're not assigned to
      if (year && section && subjectId) {
        console.log(
          "⚠️  NOTE: Students will be filtered by teacher's assigned year/section, not the selected class"
        );
        console.log(
          "⚠️  This ensures teachers only see students from their assigned classes"
        );
      }

      let url = `/common/students?teacherId=${user._id}`;
      if (year && subjectId) {
        // Pass the frontend year for debugging, but backend will use teacher's assignment
        url += `&year=${encodeURIComponent(year)}&subjectId=${subjectId}`;
        console.log("🔍 Frontend requesting students for:", {
          year,
          section,
          subjectId,
        });
        console.log(
          "🔍 Backend will filter by teacher's assigned year/section"
        );
      } else {
        // Fallback to old method
        url += `&classOrBatch=${encodeURIComponent(classOrBatch)}`;
      }

      console.log("Loading students with URL:", url);
      console.log("User ID:", user._id);
      console.log("Token exists:", !!token);

      const { data } = await api.get(url);
      console.log("Students loaded successfully:", data);
      setStudents(data);

      // Initialize with absent as default
      const init = {};
      data.forEach((s) => {
        init[s._id] = "absent";
      });
      setMark(init);
    } catch (error) {
      console.error("Error loading students:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please login again.");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Failed to load students");
      }

      setStudents([]);
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
      // No existing attendance found
      return false;
    }
  };

  useEffect(() => {
    console.log("=== TEACHER DASHBOARD MOUNT ===");
    console.log("User from context:", user);
    console.log("User ID:", user?._id);
    console.log("User role:", user?.role);
    console.log("LocalStorage user:", localStorage.getItem("user"));
    console.log(
      "LocalStorage token:",
      localStorage.getItem("token")?.substring(0, 20) + "..."
    );
    console.log("================================");

    loadSlots(selectedDay);
    // Load teacher assignments
    if (user) {
      loadTeacherProfile();
    } else {
      console.warn("No user object found in context");
      // Try to get user from localStorage as fallback
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        console.log("Found user in localStorage:", storedUser);
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Parsed user:", parsedUser);
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
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
    // Check if user is available before proceeding
    if (!user || !user._id) {
      console.error("Cannot load students - user not authenticated");
      toast.error("Please wait for authentication to complete");
      return;
    }

    console.log("=== TIMETABLE SELECTION DEBUG ===");
    console.log("Selected Timetable Object:", tt);
    console.log("Timetable ID:", tt._id);
    console.log("Class/Batch:", tt.classOrBatch);
    console.log("Subject ID (raw):", tt.subjectId);
    console.log("Subject ID (string):", tt.subjectId?._id);
    console.log("Subject ID (toString):", tt.subjectId?.toString());
    console.log("Full Subject Object:", tt.subjectId);
    console.log("================================");

    // Set the selected timetable first
    setSelected(tt);
    setMsg("");

    // Load students immediately with the timetable data
    await loadStudents(tt.classOrBatch, tt);

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

    // Submit attendance data

    try {
      setIsSubmitting(true);
      // Show loading state

      const response = await api.post("/teacher/attendance/mark", {
        date,
        timetableId: selected._id,
        records,
      });

      // Attendance saved successfully
      toast.success("Attendance saved successfully!");
      setIsEditing(true);
      // Refresh existing attendance
      await checkExistingAttendance(selected._id, date);
    } catch (error) {
      console.error("Error saving attendance:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAttendanceReport = () => {
    if (!existingAttendance) return;

    // Process attendance data to show present/absent students
    const presentStudents = [];
    const absentStudents = [];

    existingAttendance.records.forEach((record) => {
      const student = students.find((s) => s._id === record.studentId);
      if (student) {
        if (record.status === "present") {
          presentStudents.push(student);
        } else {
          absentStudents.push(student);
        }
      }
    });

    setAttendanceReport({
      date: date,
      subject: selected.subjectId?.name,
      class: selected.classOrBatch,
      present: presentStudents,
      absent: absentStudents,
      total: students.length,
    });
    setShowReportModal(true);
  };

  const showAttendanceReportForSlot = async (slot) => {
    try {
      // Check if there's attendance data for this slot on today's date
      const { data: attendanceData } = await api.get(
        `/teacher/attendance/check?timetableId=${slot._id}&date=${todayISO()}`
      );

      if (!attendanceData) {
        toast.error("No attendance data found for this class today");
        return;
      }

      // Load students for this slot
      const { data: slotStudents } = await api.get(
        `/common/students?teacherId=${user._id}&year=${
          slot.classOrBatch?.split(" - ")[0]
        }&subjectId=${slot.subjectId._id}`
      );

      // Process attendance data
      const presentStudents = [];
      const absentStudents = [];

      attendanceData.records.forEach((record) => {
        const student = slotStudents.find((s) => s._id === record.studentId);
        if (student) {
          if (record.status === "present") {
            presentStudents.push(student);
          } else {
            absentStudents.push(student);
          }
        }
      });

      setAttendanceReport({
        date: todayISO(),
        subject: slot.subjectId?.name,
        class: slot.classOrBatch,
        present: presentStudents,
        absent: absentStudents,
        total: slotStudents.length,
      });
      setShowReportModal(true);
    } catch (error) {
      console.error("Error loading attendance report for slot:", error);
      toast.error("Failed to load attendance report");
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

        {/* Loading State */}
        {isLoadingProfile && (
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Loading profile...</span>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Assignments Section */}
      {(teacherAssignments && teacherAssignments.length > 0) ||
      (mentorship && mentorship.classOrBatch) ? (
        <Section title="Your Assignments & Mentorship" icon="📚">
          {/* Teaching Assignments */}
          {teacherAssignments &&
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
                <div className="badge badge-secondary badge-lg">
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
                <div key={tt._id} className="space-y-2">
                  <button
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

                  {/* Attendance Report Button for this slot */}
                  <button
                    onClick={() => showAttendanceReportForSlot(tt)}
                    className="w-full btn btn-sm btn-info"
                    disabled={!tt._id}
                    title="View attendance report for this class"
                  >
                    📊 Attendance Report
                  </button>
                </div>
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
                    {students.length > 0 ? (
                      <>
                        {/* Show first 10 students or all if showAllStudents is true */}
                        {(showAllStudents
                          ? students
                          : students.slice(0, 10)
                        ).map((s) => (
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
                              {existingAttendance && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Current:{" "}
                                  {existingAttendance.records.find(
                                    (r) => r.studentId === s._id
                                  )?.status || "Not marked"}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}

                        {/* Show "See More" button if there are more than 10 students */}
                        {students.length > 10 && (
                          <tr>
                            <td colSpan="3" className="text-center py-4">
                              <button
                                onClick={() =>
                                  setShowAllStudents(!showAllStudents)
                                }
                                className="btn btn-outline btn-sm"
                              >
                                {showAllStudents
                                  ? "Show Less"
                                  : `See More (${
                                      students.length - 10
                                    } more students)`}
                              </button>
                            </td>
                          </tr>
                        )}
                      </>
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

      {/* Attendance Report Modal */}
      {showReportModal && attendanceReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">📊 Attendance Report</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 text-blue-100">
                <p className="font-medium">
                  {attendanceReport.subject} • {attendanceReport.class}
                </p>
                <p className="text-sm">
                  Date: {new Date(attendanceReport.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {attendanceReport.present.length}
                  </div>
                  <div className="text-green-700">Present</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {attendanceReport.absent.length}
                  </div>
                  <div className="text-red-700">Absent</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {attendanceReport.total}
                  </div>
                  <div className="text-blue-700">Total</div>
                </div>
              </div>

              {/* Present Students */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                  ✅ Present Students ({attendanceReport.present.length})
                </h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  {attendanceReport.present.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {attendanceReport.present.map((student, index) => (
                        <div
                          key={student._id}
                          className="bg-white rounded-lg p-3 border border-green-200"
                        >
                          <div className="font-medium text-green-800">
                            {student.name}
                          </div>
                          <div className="text-sm text-green-600">
                            {student.enrollment}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 text-center py-4">
                      No students present
                    </p>
                  )}
                </div>
              </div>

              {/* Absent Students */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                  ❌ Absent Students ({attendanceReport.absent.length})
                </h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  {attendanceReport.absent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {attendanceReport.absent.map((student, index) => (
                        <div
                          key={student._id}
                          className="bg-white rounded-lg p-3 border border-red-200"
                        >
                          <div className="font-medium text-red-800">
                            {student.name}
                          </div>
                          <div className="text-sm text-red-600">
                            {student.enrollment}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-600 text-center py-4">
                      No students absent
                    </p>
                  )}
                </div>
              </div>

              {/* Attendance Percentage */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {attendanceReport.total > 0
                    ? Math.round(
                        (attendanceReport.present.length /
                          attendanceReport.total) *
                          100
                      )
                    : 0}
                  %
                </div>
                <div className="text-gray-600">Attendance Rate</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Generate and download report
                  const reportData = {
                    date: attendanceReport.date,
                    subject: attendanceReport.subject,
                    class: attendanceReport.class,
                    present: attendanceReport.present.map((s) => ({
                      name: s.name,
                      enrollment: s.enrollment,
                    })),
                    absent: attendanceReport.absent.map((s) => ({
                      name: s.name,
                      enrollment: s.enrollment,
                    })),
                    total: attendanceReport.total,
                    attendanceRate:
                      attendanceReport.total > 0
                        ? Math.round(
                            (attendanceReport.present.length /
                              attendanceReport.total) *
                              100
                          )
                        : 0,
                  };

                  const blob = new Blob([JSON.stringify(reportData, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `attendance-report-${attendanceReport.date}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Report downloaded successfully!");
                }}
                className="btn btn-primary"
              >
                📥 Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
