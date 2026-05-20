import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";
import { useAuth } from "../AuthContext";

const todayISO = () => new Date().toISOString().slice(0, 10);

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
        (student) => student.classOrBatch === classOrBatch,
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
        `/teacher/attendance/check?timetableId=${timetableId}&date=${date}`,
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
        `Attendance saved! ${presentCount} present, ${absentCount} absent`,
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
    [slots],
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your classes and mark student attendance
        </p>
      </div>

      {/* Teacher Profile & Assignments */}
      {isLoadingProfile ? (
        <div className="p-8 bg-slate-50 rounded-lg text-center">
          <div className="inline-block text-4xl mb-4">⏳</div>
          <p className="text-slate-600">Loading your assignments...</p>
        </div>
      ) : (teacherAssignments && teacherAssignments.length > 0) ||
        (mentorship && mentorship.classOrBatch) ? (
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Your Assignments
          </h2>

          {/* Teaching Assignments */}
          {teacherAssignments &&
            teacherAssignments.length > 0 &&
            teacherAssignments.filter((a) => a.role === "teaching").length >
              0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Teaching Assignments
                </h3>
                <div className="flex flex-wrap gap-3">
                  {teacherAssignments
                    .filter((a) => a.role === "teaching")
                    .map((assignment, index) => (
                      <div
                        key={index}
                        className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700"
                      >
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
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                Mentorship Role
              </h3>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                  {mentorship.classOrBatch}
                </div>
                {mentorship.description && (
                  <div className="text-sm text-slate-600 self-center">
                    {mentorship.description}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="text-slate-700 font-medium mb-2">No assignments yet</p>
          <p className="text-sm text-slate-600">
            Please contact your administrator for section assignments.
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="sticky top-16 rounded-md border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-base font-semibold text-slate-900">
              Weekly Schedule
            </h3>

            <div className="mb-6">
              <p className="text-sm text-slate-600 font-medium">
                You:{" "}
                <span className="font-bold text-slate-900">{user.name}</span>
              </p>
            </div>

            {/* Day Selection */}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Day
              </p>
              <div className="grid grid-cols-3 gap-2">
                {days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDay(day.id)}
                    className={`rounded-md p-2 text-sm font-semibold transition-all ${
                      selectedDay === day.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Your Classes
              </p>
              {sorted.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No classes scheduled</p>
                </div>
              ) : (
                sorted.map((tt) => (
                  <button
                    key={tt._id}
                    onClick={() => onSelect(tt)}
                    className={`w-full rounded-md border p-2.5 text-left transition-all ${
                      selected?._id === tt._id
                        ? "border-blue-300 bg-blue-50 text-slate-900"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold text-sm">
                      {tt.startTime} - {tt.endTime}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {tt.subjectId?.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {tt.classOrBatch}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selected ? (
            <div className="rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mb-2 text-4xl">📋</div>
              <p className="text-slate-600 text-lg font-medium">
                Select a class from the left
              </p>
              <p className="text-slate-500 text-sm mt-2">to mark attendance</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-md border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-sm text-slate-600 font-medium mb-1">
                      Subject
                    </div>
                    <div className="text-xl font-semibold text-slate-900">
                      {selected.subjectId?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 font-medium mb-1">
                      Class
                    </div>
                    <div className="text-xl font-semibold text-slate-900">
                      {selected.classOrBatch}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => onDateChange(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {existingAttendance && (
                  <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg text-sm text-amber-900 font-medium">
                    ✏️ Attendance already marked. You can edit below.
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Student Name
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Enrollment
                        </th>
                        <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students && students.length > 0 ? (
                        students.map((s) => (
                          <tr
                            key={s._id}
                            className="odd:bg-white even:bg-slate-50/30 hover:bg-blue-50/50"
                          >
                            <td className="px-4 py-2.5 font-medium text-slate-900">
                              {s.name}
                            </td>
                            <td className="px-4 py-2.5 text-sm text-slate-600">
                              {s.enrollment || "-"}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <button
                                onClick={() => toggleAttendance(s._id)}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                                  mark[s._id] === "present"
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : "bg-red-100 text-red-700 border border-red-300"
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
                            className="px-6 py-8 text-center text-slate-500"
                          >
                            No students in this class
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {students && students.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-md border border-slate-200 bg-white p-3 text-center">
                    <div className="mb-0.5 text-2xl font-bold text-slate-900">
                      {students.length}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Total Students
                    </div>
                  </div>
                  <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center">
                    <div className="mb-0.5 text-2xl font-bold text-green-600">
                      {
                        Object.values(mark).filter((v) => v === "present")
                          .length
                      }
                    </div>
                    <div className="text-xs text-green-700 font-medium">
                      Present
                    </div>
                  </div>
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center">
                    <div className="mb-0.5 text-2xl font-bold text-red-600">
                      {Object.values(mark).filter((v) => v === "absent").length}
                    </div>
                    <div className="text-xs text-red-700 font-medium">
                      Absent
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={submit}
                  disabled={students.length === 0 || isSubmitting}
                  className="flex-1 rounded-md bg-blue-600 py-2.5 font-semibold text-white transition-all hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEditing
                      ? "Update Attendance"
                      : "Save Attendance"}
                </button>
                <a
                  href="/teacher/reports/csv"
                  className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Export CSV
                </a>
              </div>

              {msg && (
                <div
                  className={`p-4 rounded-lg font-medium ${
                    msg.includes("Error")
                      ? "bg-red-50 border border-red-200 text-red-700"
                      : "bg-green-50 border border-green-200 text-green-700"
                  }`}
                >
                  {msg.includes("Error") ? "❌" : "✅"} {msg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
