import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import api from "../api";

import UserManagement from "../components/admin/UserManagement";
import TimetableManagement from "../components/admin/TimetableManagement";
import SubjectManagement from "../components/admin/SubjectManagement";
import TeacherStudents from "../components/admin/TeacherStudents";
import AttendanceManagement from "../components/admin/AttendanceManagement";

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = [
    "users",
    "teachers",
    "students",
    "timetable",
    "subjects",
    "teacher-students",
    "attendance",
  ];

  // Helper function to extract meaningful error messages
  const getErrorMessage = (error) => {
    if (error.response?.data?.error) {
      const errorMsg = error.response.data.error;
      if (errorMsg.includes("Email already exists")) {
        return "Email already exists. Please use a different email address.";
      }
      if (errorMsg.includes("Enrollment number already exists")) {
        return "Enrollment number already exists. Please use a different enrollment number.";
      }
      if (errorMsg.includes("Subject code already exists")) {
        return "Subject code already exists. Please use a different code.";
      }
      if (errorMsg.includes("Missing required fields")) {
        return "Please fill in all required fields.";
      }
      if (errorMsg.includes("Invalid email format")) {
        return "Please enter a valid email address.";
      }
      if (errorMsg.includes("Password must be at least 6 characters")) {
        return "Password must be at least 6 characters long.";
      }
      if (errorMsg.includes("Enrollment number required for students")) {
        return "Enrollment number is required for students.";
      }
      if (errorMsg.includes("Invalid role")) {
        return "Invalid user role selected.";
      }
      if (errorMsg.includes("scheduling conflict")) {
        return "Scheduling conflict detected. Please check the time slot.";
      }
      return errorMsg;
    }

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

    if (error.response?.data?.error?.includes("validation failed")) {
      const validationErrors = error.response.data.error;
      if (validationErrors.includes("email")) {
        return "Invalid email format. Please enter a valid email address.";
      } else if (validationErrors.includes("password")) {
        return "Password must be at least 6 characters long.";
      }
      return "Validation failed. Please check your input.";
    }

    if (error.code === "NETWORK_ERROR") {
      return "Network error. Please check your connection.";
    }
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please try again.";
    }
    if (error.response?.status === 401) {
      return "Authentication failed. Please log in again.";
    }
    if (error.response?.status === 403) {
      return "Access denied. You don't have permission for this action.";
    }
    if (error.response?.status === 404) {
      return "Resource not found. Please check your request.";
    }
    if (error.response?.status === 500) {
      return "Server error. Please try again later.";
    }

    return "An error occurred. Please try again.";
  };

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load teachers
      try {
        const tRes = await api.get("/admin/users?role=teacher");
        setTeachers(tRes.data);
      } catch (error) {
        console.error("Teachers API failed:", error);
        toast.error("Failed to load teachers");
      }

      // Load students
      try {
        const sRes = await api.get("/admin/users?role=student");
        setStudents(sRes.data);
      } catch (error) {
        console.error("Students API failed:", error);
        toast.error("Failed to load students");
      }

      // Load subjects
      try {
        const subRes = await api.get("/admin/subjects");
        setSubjects(subRes.data);
      } catch (error) {
        console.error("Subjects API failed:", error);
        toast.error("Failed to load subjects");
      }

      // Load timetable
      try {
        const ttRes = await api.get("/admin/timetable");
        setTimetable(ttRes.data);
      } catch (error) {
        console.error("Timetable API failed:", error);
        toast.error("Failed to load timetable");
      }

      // Load attendance
      try {
        const attRes = await api.get("/admin/attendance");
        if (attRes.data && Array.isArray(attRes.data)) {
          setAttendance(attRes.data);
        } else {
          setAttendance([]);
        }
      } catch (error) {
        console.error("Attendance API failed:", error);
        if (error.response?.status === 404) {
          setAttendance([]);
        } else {
          toast.error(`Failed to load attendance: ${error.message}`);
          setAttendance([]);
        }
      }
    } catch (error) {
      console.error("Error in load function:", error);
      setError(error.message);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Action callbacks passed down to subcomponents
  const registerUser = async (newUser) => {
    try {
      setIsRegistering(true);
      const userData = {
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        role: newUser.role,
        phone: newUser.phone?.trim() || "",
      };

      if (newUser.role === "student") {
        userData.enrollment = newUser.enrollment.trim();
        userData.batch = newUser.batch.trim();
        userData.section = newUser.section.trim();
        userData.classOrBatch = `${newUser.batch.trim()} - ${newUser.section.trim()}`;
      } else if (newUser.role === "teacher") {
        userData.sections = newUser.sections || [];
      }

      await api.post("/admin/users", userData);
      await load();
      toast.success("User registered successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error registering user:", error);
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  const saveEditUser = async (editingUser, editForm) => {
    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      };

      if (editingUser.role === "student") {
        updateData.enrollment = editForm.enrollment;
        if (editForm.batch && editForm.section) {
          updateData.batch = editForm.batch;
          updateData.section = editForm.section;
          updateData.classOrBatch = `${editForm.batch} - ${editForm.section}`;
        }
      } else if (editingUser.role === "teacher") {
        updateData.sections = editForm.sections;
      }

      await api.put(`/admin/users/${editingUser._id}`, updateData);
      await load();
      toast.success("User updated successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error updating user:", error);
      return false;
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        await load();
        toast.success("User deleted successfully!");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        console.error("Error deleting user:", error);
      }
    }
  };

  const assignTeacherToSection = async (assigningTeacher, newAssignment) => {
    try {
      const subject = subjects.find((s) => s._id === newAssignment.subjectId);
      if (!subject) {
        toast.error("Selected subject not found");
        return false;
      }

      const assignmentData = {
        year: newAssignment.year,
        section: newAssignment.section,
        classOrBatch: `${newAssignment.year} - ${newAssignment.section}`,
        subjectId: newAssignment.subjectId,
        subjectName: subject.name,
        role: newAssignment.role,
      };

      await api.put(
        `/admin/users/${assigningTeacher._id}/assign-section`,
        assignmentData,
      );
      await load();
      toast.success(`Teacher assigned to ${subject.name} successfully!`);
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error assigning teacher:", error);
      return false;
    }
  };

  const removeTeacherAssignment = async (teacherId, assignmentIndex) => {
    if (window.confirm("Are you sure you want to remove this assignment?")) {
      try {
        await api.delete(
          `/admin/users/${teacherId}/assignments/${assignmentIndex}`,
        );
        await load();
        toast.success("Assignment removed successfully!");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        console.error("Error removing assignment:", error);
      }
    }
  };

  const assignMentorship = async (assigningTeacher, mentorshipForm) => {
    try {
      const mentorshipData = {
        year: mentorshipForm.year,
        section: mentorshipForm.section,
        classOrBatch: `${mentorshipForm.year} - ${mentorshipForm.section}`,
        description: mentorshipForm.description || "Academic Counseling",
      };

      await api.put(
        `/admin/users/${assigningTeacher._id}/assign-mentorship`,
        mentorshipData,
      );
      await load();
      toast.success("Mentorship assigned successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error assigning mentorship:", error);
      return false;
    }
  };

  const removeMentorship = async (teacherId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this mentorship assignment?",
      )
    ) {
      try {
        await api.delete(`/admin/users/${teacherId}/mentorship`);
        await load();
        toast.success("Mentorship removed successfully!");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        console.error("Error removing mentorship:", error);
      }
    }
  };

  const addBulkSlots = async (
    selectedTeacher,
    selectedBatch,
    selectedSection,
    bulkSlots,
  ) => {
    const validSlots = bulkSlots.filter(
      (slot) => slot.subjectId && slot.startTime && slot.endTime,
    );
    if (validSlots.length !== bulkSlots.length) {
      toast.error("Please fill in all required fields for all slots");
      return false;
    }

    const slotsData = validSlots.map((slot) => ({
      ...slot,
      teacherId: selectedTeacher,
      classOrBatch: `${selectedBatch} - ${selectedSection}`,
      dayOfWeek: Number(slot.dayOfWeek),
    }));

    try {
      // Try bulk post first
      try {
        await api.post("/admin/timetable/bulk", slotsData);
        await load();
        toast.success(
          `Successfully created ${validSlots.length} timetable slots!`,
        );
        return true;
      } catch (bulkError) {
        console.error(
          "Bulk scheduling failed, falling back to individual inserts...",
          bulkError,
        );
        if (bulkError.response?.data?.error?.includes("scheduling conflict")) {
          toast.error(
            `${bulkError.response.data.error}: ${bulkError.response.data.details || ""}`,
          );
          return false;
        }

        let successCount = 0;
        for (const slot of slotsData) {
          try {
            await api.post("/admin/timetable", slot);
            successCount++;
          } catch (err) {
            console.error("Individual slot failed:", slot, err);
          }
        }

        await load();
        if (successCount > 0) {
          toast.success(
            `Scheduled ${successCount}/${validSlots.length} slots successfully!`,
          );
          return true;
        } else {
          toast.error("Failed to schedule slots due to conflicts.");
          return false;
        }
      }
    } catch (error) {
      toast.error("Error scheduling slots. Check logs for details.");
      console.error(error);
      return false;
    }
  };

  const addSlot = async (
    selectedTeacher,
    selectedBatch,
    selectedSection,
    newSlot,
  ) => {
    try {
      const slotData = {
        subjectId: newSlot.subject,
        dayOfWeek: Number(newSlot.day),
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        slotType: newSlot.slotType,
        room: newSlot.room,
        teacherId: selectedTeacher,
        classOrBatch: `${selectedBatch} - ${selectedSection}`,
      };

      await api.post("/admin/timetable", slotData);
      await load();
      toast.success("Timetable slot added successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error adding slot:", error);
      return false;
    }
  };

  const deleteSlot = async (id) => {
    try {
      await api.delete(`/admin/timetable/${id}`);
      await load();
      toast.success("Timetable slot deleted successfully!");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error deleting slot:", error);
    }
  };

  const addSubject = async (newSubject) => {
    try {
      await api.post("/admin/subjects", newSubject);
      await load();
      toast.success("Subject added successfully!");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error adding subject:", error);
      return false;
    }
  };

  const deleteSubject = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await api.delete(`/admin/subjects/${id}`);
        await load();
        toast.success("Subject deleted successfully!");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        console.error("Error deleting subject:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Institutional overview and management controls
        </p>

        {/* Global Loading / Error Indicators */}
        {isLoading && (
          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span>Syncing database...</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-4">
            <span className="text-sm text-red-600 font-medium">{error}</span>
            <button
              className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
              onClick={load}
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-800">
            Institutional Overview
          </h2>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Total Users
              </div>
              <div className="mb-2 text-3xl font-bold text-slate-900">
                {teachers.length + students.length}
              </div>
              <div className="flex gap-3 text-xs">
                <div>
                  <span className="text-slate-600">Teachers:</span>
                  <span className="font-bold text-slate-900 ml-2">
                    {teachers.length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Students:</span>
                  <span className="font-bold text-slate-900 ml-2">
                    {students.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Active Subjects
              </div>
              <div className="mb-2 text-3xl font-bold text-slate-900">
                {subjects.length}
              </div>
              <div className="text-xs text-slate-600">Registered courses</div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Scheduled Slots
              </div>
              <div className="mb-2 text-3xl font-bold text-slate-900">
                {timetable.length}
              </div>
              <div className="text-xs text-slate-600">Classes scheduled</div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Marked Sessions
              </div>
              <div className="mb-2 text-3xl font-bold text-slate-900">
                {attendance.length}
              </div>
              <div className="text-xs text-slate-600">Attendance records</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-800">
            Quick Management
          </h2>
          <div className="grid gap-2 md:grid-cols-5">
            {[
              {
                id: "users",
                name: "User Management",
                icon: "👥",
                color: "blue",
              },
              {
                id: "timetable",
                name: "Timetable",
                icon: "📅",
                color: "purple",
              },
              { id: "subjects", name: "Subjects", icon: "📚", color: "green" },
              {
                id: "teacher-students",
                name: "Assignments",
                icon: "👨‍🎓",
                color: "indigo",
              },
              {
                id: "attendance",
                name: "Attendance",
                icon: "✅",
                color: "orange",
              },
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => handleTabChange(action.id)}
                className={`rounded-md border px-3 py-3 text-left transition-colors ${
                  activeTab === action.id
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="mb-1 text-xl">{action.icon}</div>
                <div className="text-xs font-semibold uppercase tracking-wide">
                  {action.name}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-3 md:p-4">
          <div>
            {activeTab === "users" && (
              <UserManagement
                teachers={teachers}
                students={students}
                subjects={subjects}
                registerUser={registerUser}
                saveEditUser={saveEditUser}
                deleteUser={deleteUser}
                assignTeacherToSection={assignTeacherToSection}
                removeTeacherAssignment={removeTeacherAssignment}
                assignMentorship={assignMentorship}
                removeMentorship={removeMentorship}
                isRegistering={isRegistering}
              />
            )}

            {activeTab === "timetable" && (
              <TimetableManagement
                teachers={teachers}
                subjects={subjects}
                timetable={timetable}
                addBulkSlots={addBulkSlots}
                addSlot={addSlot}
                deleteSlot={deleteSlot}
              />
            )}

            {activeTab === "subjects" && (
              <SubjectManagement
                subjects={subjects}
                addSubject={addSubject}
                deleteSubject={deleteSubject}
              />
            )}

            {activeTab === "teacher-students" && (
              <TeacherStudents teachers={teachers} subjects={subjects} />
            )}

            {activeTab === "attendance" && (
              <AttendanceManagement
                attendance={attendance}
                isLoading={isLoading}
                studentsCount={students.length}
                teachersCount={teachers.length}
                subjectsCount={subjects.length}
                timetableCount={timetable.length}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
