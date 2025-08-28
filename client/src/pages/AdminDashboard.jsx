import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";

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

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [activeTab, setActiveTab] = useState("users");
  const [subjectYearFilter, setSubjectYearFilter] = useState("");
  const [selectedTeacherForStudents, setSelectedTeacherForStudents] =
    useState("");
  const [selectedSubjectForStudents, setSelectedSubjectForStudents] =
    useState("");
  const [selectedYearForStudents, setSelectedYearForStudents] = useState("");
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [userYearFilter, setUserYearFilter] = useState("");

  // Pagination states
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);

  // Enhanced user registration state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    enrollment: "",
    phone: "",
    sections: [],
    batch: "",
    section: "",
    classOrBatch: "",
  });

  // User editing states
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    enrollment: "",
    sections: [],
  });

  // Timetable management states
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [bulkSlots, setBulkSlots] = useState([]);

  // Teacher assignment states
  const [assigningTeacher, setAssigningTeacher] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    year: "",
    section: "",
    subjectId: "",
    role: "teaching",
  });
  const [mentorshipForm, setMentorshipForm] = useState({
    year: "",
    section: "",
    description: "",
  });
  const [showMentorshipForm, setShowMentorshipForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState(null);

  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    year: "",
    semester: "",
  });

  // Predefined time slots for 1-hour periods (12-hour format with AM/PM) - Only half-hour slots
  const timeSlots = [
    { label: "8:30 AM - 9:30 AM", startTime: "08:30", endTime: "09:30" },
    { label: "9:30 AM - 10:30 AM", startTime: "09:30", endTime: "10:30" },
    { label: "10:30 AM - 11:30 AM", startTime: "10:30", endTime: "11:30" },
    { label: "11:30 AM - 12:30 PM", startTime: "11:30", endTime: "12:30" },
    { label: "12:30 PM - 1:30 PM", startTime: "12:30", endTime: "13:30" },
    { label: "1:30 PM - 2:30 PM", startTime: "13:30", endTime: "14:30" },
    { label: "2:30 PM - 3:30 PM", startTime: "14:30", endTime: "15:30" },
    { label: "3:30 PM - 4:30 PM", startTime: "15:30", endTime: "16:30" },
    { label: "4:30 PM - 5:30 PM", startTime: "16:30", endTime: "17:30" },
  ];

  const showAttendanceReport = (attendanceRecord) => {
    try {
      console.log("Processing attendance record:", attendanceRecord);

      // Process attendance data to show present/absent students with names
      const presentStudents = [];
      const absentStudents = [];

      if (attendanceRecord.records && attendanceRecord.records.length > 0) {
        attendanceRecord.records.forEach((record) => {
          // Find student name from students array
          const student = students.find((s) => s._id === record.studentId);
          const studentInfo = {
            studentId: record.studentId,
            studentName: student ? student.name : `Student ${record.studentId}`,
            enrollment: student ? student.enrollment : "N/A",
            status: record.status,
          };

          if (record.status === "present") {
            presentStudents.push(studentInfo);
          } else {
            absentStudents.push(studentInfo);
          }
        });
      }

      console.log(
        "Processed students - Present:",
        presentStudents,
        "Absent:",
        absentStudents
      );

      setAttendanceReport({
        date: attendanceRecord.date,
        subject: attendanceRecord.subjectId?.name || "Unknown Subject",
        class: attendanceRecord.classOrBatch,
        present: presentStudents,
        absent: absentStudents,
        total: attendanceRecord.records?.length || 0,
        teacher: attendanceRecord.teacherId?.name || "Unknown Teacher",
      });
      setShowReportModal(true);
    } catch (error) {
      console.error("Error processing attendance report:", error);
      toast.error("Failed to process attendance report");
    }
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

      try {
        const ttRes = await api.get("/admin/timetable");
        setTimetable(ttRes.data);
      } catch (error) {
        console.error("Timetable API failed:", error);
        toast.error("Failed to load timetable");
      }

      try {
        const attRes = await api.get("/admin/attendance");

        if (attRes.data && Array.isArray(attRes.data)) {
          setAttendance(attRes.data);
        } else {
          setAttendance([]);
        }
      } catch (error) {
        console.error("Attendance API failed:", error);

        // Handle 404 (no attendance records) gracefully
        if (error.response?.status === 404) {
          setAttendance([]);
          return;
        }

        // Show error toast for other errors
        toast.error(`Failed to load attendance: ${error.message}`);
        setAttendance([]);
      }
    } catch (error) {
      console.error("Error in load function:", error);
      setError(error.message);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Export data to JSON
  const exportData = () => {
    try {
      const data = {
        teachers,
        students,
        subjects,
        timetable,
        attendance,
        exportDate: new Date().toISOString(),
        totalUsers: teachers.length + students.length,
        totalSubjects: subjects.length,
        totalTimetableSlots: timetable.length,
        totalAttendanceRecords: attendance.length,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ams_data_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  // Filter and search functions
  const filteredSubjects = subjects.filter((subject) => {
    if (subjectYearFilter && subject.year !== subjectYearFilter) {
      return false;
    }
    return true;
  });

  const filteredUsers = () => {
    let allUsers = [];

    if (filterRole === "all" || filterRole === "teacher") {
      allUsers.push(...teachers.map((t) => ({ ...t, role: "teacher" })));
    }
    if (filterRole === "all" || filterRole === "student") {
      allUsers.push(...students.map((s) => ({ ...s, role: "student" })));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      allUsers = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.enrollment && user.enrollment.toLowerCase().includes(term))
      );
    }

    if (userYearFilter) {
      allUsers = allUsers.filter((user) => user.batch === userYearFilter);
    }

    return allUsers;
  };

  // Helper function to extract meaningful error messages
  const getErrorMessage = (error) => {
    // Check for specific API error messages first
    if (error.response?.data?.error) {
      const errorMsg = error.response.data.error;

      // Handle specific error cases
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

      return errorMsg;
    }

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

    // Fallback error messages
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

  useEffect(() => {
    load();
  }, []);

  // Enhanced user registration function
  const registerUser = async () => {
    try {
      setIsRegistering(true);

      // Enhanced validation
      if (!newUser.name?.trim()) {
        toast.error("Name is required");
        return;
      }

      if (!newUser.email?.trim()) {
        toast.error("Email is required");
        return;
      }

      if (!newUser.email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (!newUser.password || newUser.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      if (newUser.role === "student") {
        if (!newUser.enrollment?.trim()) {
          toast.error("Enrollment number is required for students");
          return;
        }
        if (!newUser.batch?.trim()) {
          toast.error("Year is required for students");
          return;
        }
        if (!newUser.section?.trim()) {
          toast.error("Section is required for students");
          return;
        }
      }

      if (
        newUser.role === "teacher" &&
        (!newUser.sections || newUser.sections.length === 0)
      ) {
        toast.error("At least one section is required for teachers");
        return;
      }

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

      const response = await api.post("/admin/users", userData);

      // Reload data after successful registration
      await load();

      // Clear form after successful registration
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "student",
        enrollment: "",
        phone: "",
        sections: [],
        batch: "",
        section: "",
        classOrBatch: "",
      });

      toast.success("User registered successfully!");

      // Auto-refresh data every 30 seconds for real-time updates
      const refreshTimer = setTimeout(() => {
        if (!isLoading) {
          load();
        }
      }, 30000);

      // Store timer for cleanup
      window.refreshTimer = refreshTimer;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error registering user:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  // User editing functions
  const startEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      enrollment: user.enrollment || "",
      sections: user.sections || [],
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      name: "",
      email: "",
      phone: "",
      enrollment: "",
      sections: [],
    });
  };

  const saveEditUser = async () => {
    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      };

      if (editingUser.role === "student") {
        updateData.enrollment = editForm.enrollment;
      } else if (editingUser.role === "teacher") {
        updateData.sections = editForm.sections;
      }

      await api.put(`/admin/users/${editingUser._id}`, updateData);
      cancelEdit();
      load();
      toast.success("User updated successfully!");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        load();
        toast.success("User deleted successfully!");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        console.error("Error deleting user:", error);
      }
    }
  };

  const createSubject = async () => {
    if (
      !newSubject.name ||
      !newSubject.code ||
      !newSubject.year ||
      !newSubject.semester
    ) {
      toast.error("Please fill in all fields (Name, Code, Year, Semester)");
      return;
    }

    try {
      await api.post("/admin/subjects", newSubject);
      setNewSubject({ name: "", code: "", year: "", semester: "" });
      load();
      toast.success("Subject created successfully!");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error creating subject:", error);
    }
  };

  // Timetable management functions
  const addBulkSlots = async () => {
    // Validate inputs

    if (
      !selectedTeacher ||
      !selectedBatch ||
      !selectedSection ||
      bulkSlots.length === 0
    ) {
      toast.error(
        "Please select teacher, batch, section and add at least one slot"
      );
      return;
    }

    try {
      // Process bulk slots

      // Validate that all slots have required fields
      const validSlots = bulkSlots.filter(
        (slot) => slot.subjectId && slot.startTime && slot.endTime
      );

      if (validSlots.length !== bulkSlots.length) {
        toast.error(
          "Please fill in all required fields (Subject, Start Time, End Time) for all slots"
        );
        return;
      }

      const slotsData = validSlots.map((slot) => ({
        ...slot,
        teacherId: selectedTeacher,
        classOrBatch: `${selectedBatch} - ${selectedSection}`,
        dayOfWeek: Number(slot.dayOfWeek),
      }));

      // Create timetable slots

      // Try bulk endpoint first
      try {
        const response = await api.post("/admin/timetable/bulk", slotsData);
        // Bulk creation successful
        setBulkSlots([]);
        load();
        toast.success(
          `Successfully created ${validSlots.length} timetable slots!`
        );
        return;
      } catch (bulkError) {
        // Fallback to individual creation

        // Fallback: add slots one by one
        let successCount = 0;
        for (const slot of slotsData) {
          try {
            await api.post("/admin/timetable", slot);
            successCount++;
          } catch (err) {
            console.error("Error adding individual slot:", err);
            console.error("Slot that failed:", slot);
            console.error("Error response:", err.response?.data);
          }
        }

        // Individual creation completed
        setBulkSlots([]);
        load();
        toast.success(
          `Successfully created ${successCount}/${slotsData.length} timetable slots!`
        );
      }
    } catch (error) {
      console.error("=== ERROR IN TIMETABLE CREATION ===");
      console.error("Error details:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error("Error adding slots. Check console for details.");
    }
  };

  const addSlot = async () => {
    if (!newSlot.subject || !newSlot.day || !newSlot.startTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await api.post("/admin/timetable", newSlot);
      setNewSlot({
        subject: "",
        day: "",
        startTime: "",
        endTime: "",
        slotType: "theory",
        room: "",
        notes: "",
      });
      load();
      toast.success("Timetable slot added successfully!");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error adding timetable slot:", error);
    }
  };

  const loadTeacherStudents = async () => {
    try {
      const response = await api.get("/admin/teacher-students", {
        params: {
          teacherId: selectedTeacherForStudents,
          subjectId: selectedSubjectForStudents,
          year: selectedYearForStudents,
        },
      });

      setTeacherStudents(response.data);

      // Set display names
      const teacher = teachers.find(
        (t) => t._id === selectedTeacherForStudents
      );
      const subject = subjects.find(
        (s) => s._id === selectedSubjectForStudents
      );
      setSelectedTeacherName(teacher?.name || "");
      setSelectedSubjectName(subject?.name || "");
    } catch (error) {
      toast.error("Failed to load students");
      console.error("Error loading teacher students:", error);
    }
  };

  const addBulkSlot = () => {
    setBulkSlots([
      ...bulkSlots,
      {
        subjectId: "",
        dayOfWeek: 1,
        startTime: "10:30",
        endTime: "11:30",
        slotType: "theory",
        room: "",
        notes: "",
        batch: selectedBatch,
        section: selectedSection,
      },
    ]);
  };

  const removeBulkSlot = (index) => {
    setBulkSlots(bulkSlots.filter((_, i) => i !== index));
  };

  const updateBulkSlot = (index, field, value) => {
    const updated = [...bulkSlots];
    updated[index][field] = value;
    setBulkSlots(updated);
  };

  const deleteSlot = async (id) => {
    try {
      await api.delete(`/admin/timetable/${id}`);
      load();
      toast.success("Timetable slot deleted successfully!");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error deleting timetable slot:", error);
    }
  };

  const addSubject = async () => {
    if (!newSubject.name || !newSubject.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await api.post("/admin/subjects", newSubject);
      setNewSubject({
        name: "",
        code: "",
        year: "",
        semester: "",
      });
      load();
      toast.success("Subject added successfully!");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error adding subject:", error);
    }
  };

  const deleteSubject = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await api.delete(`/admin/subjects/${id}`);
        load();
        toast.success("Subject deleted successfully!");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        console.error("Error deleting subject:", error);
      }
    }
  };

  // Teacher assignment functions
  const startAssignTeacher = (teacher) => {
    setAssigningTeacher(teacher);
    setNewAssignment({
      year: "",
      section: "",
      subjectId: "",
      role: "teaching",
    });
    setShowMentorshipForm(false);
  };

  const cancelAssignTeacher = () => {
    setAssigningTeacher(null);
    setNewAssignment({
      year: "",
      section: "",
      subjectId: "",
      role: "teaching",
    });
    setShowMentorshipForm(false);
  };

  const assignTeacherToSection = async () => {
    if (
      !newAssignment.year ||
      !newAssignment.section ||
      !newAssignment.subjectId
    ) {
      toast.error("Please select year, section, and subject");
      return;
    }

    try {
      const subject = subjects.find((s) => s._id === newAssignment.subjectId);
      if (!subject) {
        toast.error("Selected subject not found");
        return;
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
        assignmentData
      );
      cancelAssignTeacher();
      load();
      toast.success(
        `Teacher assigned to ${subject.name} for ${newAssignment.year} ${newAssignment.section} successfully!`
      );
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error assigning teacher to section:", error);
    }
  };

  const assignMentorship = async () => {
    if (!mentorshipForm.year || !mentorshipForm.section) {
      toast.error("Please select both year and section for mentorship");
      return;
    }

    try {
      const mentorshipData = {
        year: mentorshipForm.year,
        section: mentorshipForm.section,
        classOrBatch: `${mentorshipForm.year} - ${mentorshipForm.section}`,
        description:
          mentorshipForm.description ||
          "Academic guidance and career counseling",
      };

      await api.put(
        `/admin/users/${assigningTeacher._id}/assign-mentorship`,
        mentorshipData
      );
      setShowMentorshipForm(false);
      setMentorshipForm({ year: "", section: "", description: "" });
      load();
      toast.success("Mentorship assigned successfully!");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      console.error("Error assigning mentorship:", error);
    }
  };

  const removeTeacherAssignment = async (teacherId, assignmentIndex) => {
    if (window.confirm("Are you sure you want to remove this assignment?")) {
      try {
        await api.delete(
          `/admin/users/${teacherId}/assignments/${assignmentIndex}`
        );
        load();
        toast.success("Assignment removed successfully!");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        console.error("Error removing assignment:", error);
      }
    }
  };

  const removeMentorship = async (teacherId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this mentorship assignment?"
      )
    ) {
      try {
        await api.delete(`/admin/users/${teacherId}/mentorship`);
        load();
        toast.success("Mentorship removed successfully!");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        console.error("Error removing mentorship:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-lg">
          <span className="text-3xl">⚙️</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4">
          Admin Dashboard
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Manage teachers, students, subjects, and timetable with comprehensive
          administrative tools
        </p>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Loading data...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700">Error: {error}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setError(null)}
                className="btn btn-sm btn-outline btn-error"
              >
                Dismiss
              </button>
              <button
                onClick={load}
                className="btn btn-sm btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Retry"}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={load}
            className="btn btn-outline btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading...
              </>
            ) : (
              <>
                <span>🔄</span>
                Refresh Data
              </>
            )}
          </button>

          <button
            onClick={() => exportData()}
            className="btn btn-outline btn-secondary"
            disabled={isLoading}
          >
            <span>📊</span>
            Export Data
          </button>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <span className="text-primary">📊</span>
          System Overview
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {teachers.length + students.length}
                </div>
                <div className="text-sm text-blue-500 font-medium">
                  Total Users
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Teachers:</span>
                <span className="font-semibold text-blue-700">
                  {teachers.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Students:</span>
                <span className="font-semibold text-blue-700">
                  {students.length}
                </span>
              </div>
            </div>
          </div>

          {/* Subjects Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📚</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {subjects.length}
                </div>
                <div className="text-sm text-green-500 font-medium">
                  Subjects
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Active subjects in the system
            </div>
          </div>

          {/* Timetable Slots Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📅</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {timetable.length}
                </div>
                <div className="text-sm text-purple-500 font-medium">
                  Timetable Slots
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Scheduled classes and sessions
            </div>
          </div>

          {/* Attendance Records Card */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {attendance.length}
                </div>
                <div className="text-sm text-orange-500 font-medium">
                  Attendance
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {attendance.length > 0
                ? "Marked attendance records"
                : "No records yet - teachers need to mark attendance"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Management Interface */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: "users", name: "👥 User Management", icon: "👤" },
              { id: "timetable", name: "📅 Timetable", icon: "📅" },
              { id: "subjects", name: "📚 Subjects", icon: "📚" },
              {
                id: "teacher-students",
                name: "👨‍🏫 Teacher-Students",
                icon: "👨‍🎓",
              },
              { id: "attendance", name: "✅ Attendance", icon: "✅" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "users" && (
        <div className="space-y-8">
          <Section title="User Registration" icon="👤">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="input input-bordered w-full"
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((v) => ({ ...v, name: e.target.value }))
                  }
                />
                <input
                  className="input input-bordered w-full"
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((v) => ({ ...v, email: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  className="input input-bordered w-full"
                  placeholder="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser((v) => ({ ...v, password: e.target.value }))
                  }
                />
                <input
                  className="input input-bordered w-full"
                  placeholder="Phone (Optional)"
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser((v) => ({ ...v, phone: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  className="select select-bordered w-full"
                  value={newUser.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setNewUser((v) => ({
                      ...v,
                      role: newRole,
                      // Clear role-specific fields when switching roles
                      enrollment: newRole === "student" ? v.enrollment : "",
                      sections: newRole === "teacher" ? v.sections : [],
                      batch: newRole === "student" ? v.batch : "",
                      section: newRole === "student" ? v.section : "",
                    }));
                  }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>

                {/* Batch and Section fields are auto-generated from enrollment for students */}
              </div>

              {newUser.role === "student" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      className="select select-bordered w-full"
                      value={newUser.batch}
                      onChange={(e) => {
                        const newBatch = e.target.value;
                        setNewUser((v) => ({
                          ...v,
                          batch: newBatch,
                          // Auto-generate classOrBatch when both batch and section are selected
                          classOrBatch:
                            newBatch && v.section
                              ? `${newBatch} - ${v.section}`
                              : "",
                        }));
                      }}
                    >
                      <option value="">Select Year</option>
                      <option value="1st year">1st Year</option>
                      <option value="2nd year">2nd Year</option>
                      <option value="3rd year">3rd Year</option>
                    </select>

                    <select
                      className="select select-bordered w-full"
                      value={newUser.section}
                      onChange={(e) => {
                        const newSection = e.target.value;
                        setNewUser((v) => ({
                          ...v,
                          section: newSection,
                          // Auto-generate classOrBatch when both batch and section are selected
                          classOrBatch:
                            v.batch && newSection
                              ? `${v.batch} - ${newSection}`
                              : "",
                        }));
                      }}
                    >
                      <option value="">Select Section</option>
                      <option value="E1">Section E1</option>
                      <option value="E2">Section E2</option>
                      <option value="M1">Section M1</option>
                      <option value="M2">Section M2</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="input input-bordered w-full"
                      placeholder="Enrollment Number (e.g., 2024CS001)"
                      value={newUser.enrollment}
                      onChange={(e) =>
                        setNewUser((v) => ({
                          ...v,
                          enrollment: e.target.value,
                        }))
                      }
                    />

                    <input
                      className="input input-bordered w-full bg-gray-100"
                      placeholder="Class/Batch (Auto-generated)"
                      value={newUser.classOrBatch}
                      disabled
                    />
                  </div>
                </>
              ) : (
                <input
                  className="input input-bordered w-full"
                  placeholder="Sections (e.g., E1,E2,M1,M2)"
                  value={newUser.sections?.join(",") || ""}
                  onChange={(e) =>
                    setNewUser((v) => ({
                      ...v,
                      sections: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    }))
                  }
                />
              )}

              <button
                className="btn btn-primary w-full"
                onClick={registerUser}
                disabled={
                  !newUser.name ||
                  !newUser.email ||
                  !newUser.password ||
                  isRegistering ||
                  (newUser.role === "student" &&
                    (!newUser.batch || !newUser.section || !newUser.enrollment))
                }
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-content"></div>
                    Registering...
                  </>
                ) : (
                  "Register User"
                )}
              </button>
            </div>
          </Section>
        </div>
      )}

      {activeTab === "timetable" && (
        <div className="space-y-8">
          <Section title="Advanced Timetable Management" icon="📅">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <select
                  className="select select-bordered w-full"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <select
                  className="select select-bordered w-full"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <option value="">Select Batch</option>
                  <option value="1st year">1st Year</option>
                  <option value="2nd year">2nd Year</option>
                  <option value="3rd year">3rd Year</option>
                </select>

                <select
                  className="select select-bordered w-full"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="">Select Section</option>
                  <option value="E1">Section E1</option>
                  <option value="E2">Section E2</option>
                  <option value="M1">Section M1</option>
                  <option value="M2">Section M2</option>
                </select>
              </div>

              {selectedTeacher && selectedBatch && selectedSection && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Bulk Add Time Slots</h4>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={addBulkSlot}
                    >
                      + Add Slot
                    </button>
                  </div>

                  {bulkSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="p-3 border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <div className="grid grid-cols-5 gap-2">
                        <select
                          className="select select-bordered select-sm"
                          value={slot.subjectId}
                          onChange={(e) =>
                            updateBulkSlot(index, "subjectId", e.target.value)
                          }
                        >
                          <option value="">Subject</option>
                          {subjects.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>

                        <select
                          className="select select-bordered select-sm"
                          value={slot.dayOfWeek}
                          onChange={(e) =>
                            updateBulkSlot(index, "dayOfWeek", e.target.value)
                          }
                        >
                          <option value="1">Mon</option>
                          <option value="2">Tue</option>
                          <option value="3">Wed</option>
                          <option value="4">Thu</option>
                          <option value="5">Fri</option>
                          <option value="6">Sat</option>
                          <option value="0">Sun</option>
                        </select>

                        <select
                          className="select select-bordered select-sm"
                          value={
                            timeSlots.find(
                              (ts) =>
                                ts.startTime === slot.startTime &&
                                ts.endTime === slot.endTime
                            )?.label || ""
                          }
                          onChange={(e) => {
                            const selectedSlot = timeSlots.find(
                              (ts) => ts.label === e.target.value
                            );
                            if (selectedSlot) {
                              updateBulkSlot(
                                index,
                                "startTime",
                                selectedSlot.startTime
                              );
                              updateBulkSlot(
                                index,
                                "endTime",
                                selectedSlot.endTime
                              );
                            }
                          }}
                        >
                          <option value="">Select Time Slot</option>
                          {timeSlots.map((timeSlot) => (
                            <option key={timeSlot.label} value={timeSlot.label}>
                              {timeSlot.label}
                            </option>
                          ))}
                        </select>

                        <select
                          className="select select-bordered select-sm"
                          value={slot.slotType}
                          onChange={(e) =>
                            updateBulkSlot(index, "slotType", e.target.value)
                          }
                        >
                          <option value="theory">Theory</option>
                          <option value="lab">Lab</option>
                          <option value="tutorial">Tutorial</option>
                        </select>

                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => removeBulkSlot(index)}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <input
                          className="input input-bordered input-sm"
                          placeholder="Room (Optional)"
                          value={slot.room}
                          onChange={(e) =>
                            updateBulkSlot(index, "room", e.target.value)
                          }
                        />
                        <input
                          className="input input-bordered input-sm"
                          placeholder="Notes (Optional)"
                          value={slot.notes}
                          onChange={(e) =>
                            updateBulkSlot(index, "notes", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}

                  {bulkSlots.length > 0 && (
                    <button
                      className="btn btn-primary w-full"
                      onClick={addBulkSlots}
                    >
                      Add All Slots
                    </button>
                  )}
                </div>
              )}
            </div>
          </Section>

          <Section title="Teaching & Mentorship Management" icon="👨‍🏫">
            {/* Search and Filter */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Teachers
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      className=" input input-bordered pl-10 bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Assignment Type
                  </label>
                  <select
                    className="select select-bordered bg-white"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="teacher">
                      Teaching Only (No Mentorship)
                    </option>
                    <option value="student">
                      Mentorship Only (No Teaching)
                    </option>
                  </select>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Actions
                  </label>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-outline btn-primary"
                      onClick={() => setSearchTerm("")}
                      disabled={!searchTerm}
                    >
                      Clear Search
                    </button>
                    <button
                      className="btn btn-sm btn-outline btn-secondary"
                      onClick={() => setFilterRole("all")}
                      disabled={filterRole === "all"}
                    >
                      Show All Types
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Results Summary */}
              {searchTerm && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing results for "
                    <span className="font-medium text-gray-800">
                      {searchTerm}
                    </span>
                    "
                    {filterRole !== "all" && (
                      <span>
                        {" "}
                        • Filtered by:{" "}
                        <span className="font-medium text-gray-800">
                          {filterRole === "teacher"
                            ? "Teaching Only"
                            : "Mentorship Only"}
                        </span>
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
              <table className="table w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Section Assignments
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // First filter by role
                    let roleFilteredTeachers = teachers;
                    if (filterRole === "teacher") {
                      // Show only teachers with teaching assignments BUT NO mentorship
                      roleFilteredTeachers = teachers.filter(
                        (t) =>
                          t.teacherAssignments &&
                          t.teacherAssignments.some(
                            (a) => a.role === "teaching"
                          ) &&
                          (!t.mentorship || !t.mentorship.classOrBatch)
                      );
                    } else if (filterRole === "student") {
                      // Show only teachers with mentorship assignments BUT NO teaching
                      roleFilteredTeachers = teachers.filter(
                        (t) =>
                          t.mentorship &&
                          t.mentorship.classOrBatch &&
                          (!t.teacherAssignments ||
                            !t.teacherAssignments.some(
                              (a) => a.role === "teaching"
                            ))
                      );
                    }
                    // filterRole === "all" shows all teachers

                    // Then filter by search term
                    const filteredTeachers = roleFilteredTeachers.filter(
                      (t) => {
                        if (searchTerm) {
                          const term = searchTerm.toLowerCase();
                          return (
                            t.name.toLowerCase().includes(term) ||
                            t.email.toLowerCase().includes(term)
                          );
                        }
                        return true;
                      }
                    );

                    if (filteredTeachers.length === 0) {
                      return (
                        <tr>
                          <td colSpan="5" className="text-center opacity-70">
                            {searchTerm
                              ? "No teachers found matching your search"
                              : filterRole === "student"
                              ? "No teachers with mentorship only found"
                              : filterRole === "teacher"
                              ? "No teachers with teaching only found"
                              : "No teachers added yet"}
                          </td>
                        </tr>
                      );
                    }

                    return (
                      showAllTeachers
                        ? filteredTeachers
                        : filteredTeachers.slice(0, 10)
                    ).map((t) => (
                      <tr
                        key={t._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser?._id === t._id ? (
                            <input
                              className="input input-bordered input-sm w-full"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  name: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              {t.name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser?._id === t._id ? (
                            <input
                              className="input input-bordered input-sm w-full"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  email: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <div className="text-sm text-gray-600">
                              {t.email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser?._id === t._id ? (
                            <input
                              className="input input-bordered input-sm w-full"
                              placeholder="Phone"
                              value={editForm.phone}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  phone: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <div className="text-sm text-gray-600">
                              {t.phone || "Not provided"}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-3">
                            {/* Teaching Assignments */}
                            {t.teacherAssignments &&
                              t.teacherAssignments.filter(
                                (a) => a.role === "teaching"
                              ).length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                    📚 Teaching
                                  </div>
                                  <div className="space-y-2">
                                    {t.teacherAssignments
                                      .filter((a) => a.role === "teaching")
                                      .map((assignment, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 border border-blue-200"
                                        >
                                          <span className="text-sm font-medium text-blue-800">
                                            {assignment.classOrBatch}
                                            {assignment.subjectName &&
                                              ` • ${assignment.subjectName}`}
                                          </span>
                                          <button
                                            className="btn btn-xs btn-error bg-red-500 hover:bg-red-600 border-0 text-white"
                                            onClick={() =>
                                              removeTeacherAssignment(
                                                t._id,
                                                t.teacherAssignments.findIndex(
                                                  (a) => a === assignment
                                                )
                                              )
                                            }
                                            title="Remove assignment"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                            {/* Mentorship Assignment */}
                            {t.mentorship && t.mentorship.classOrBatch && (
                              <div className="mb-3">
                                <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                  🎯 Mentorship
                                </div>
                                <div className="bg-purple-50 rounded-lg px-3 py-2 border border-purple-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-purple-800">
                                      {t.mentorship.classOrBatch}
                                    </span>
                                    <button
                                      className="btn btn-xs btn-error bg-red-500 hover:bg-red-600 border-0 text-white"
                                      onClick={() => removeMentorship(t._id)}
                                      title="Remove mentorship"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  {t.mentorship.description && (
                                    <div className="text-xs text-purple-600 mt-1">
                                      {t.mentorship.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {(!t.teacherAssignments ||
                              t.teacherAssignments.length === 0) &&
                              !t.mentorship?.classOrBatch && (
                                <div className="text-center py-3">
                                  <span className="text-sm text-gray-400 italic">
                                    No assignments yet
                                  </span>
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser?._id === t._id ? (
                            <div className="flex gap-2">
                              <button
                                className="btn btn-xs btn-success bg-green-500 hover:bg-green-600 border-0 text-white"
                                onClick={saveEditUser}
                              >
                                💾 Save
                              </button>
                              <button
                                className="btn btn-xs btn-outline border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={cancelEdit}
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2 flex-col">
                              <button
                                className="btn btn-xs btn-outline border-blue-300 text-blue-700 hover:bg-blue-50"
                                onClick={() => startEditUser(t)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn btn-xs btn-primary bg-blue-500 hover:bg-blue-600 border-0 text-white"
                                onClick={() => startAssignTeacher(t)}
                              >
                                📚 Assign Section
                              </button>
                              <button
                                className="btn btn-xs btn-secondary bg-purple-500 hover:bg-purple-600 border-0 text-white"
                                onClick={() => {
                                  setAssigningTeacher(t);
                                  setShowMentorshipForm(true);
                                  setMentorshipForm({
                                    year: "",
                                    section: "",
                                    description: "",
                                  });
                                }}
                              >
                                🎯 Assign Mentorship
                              </button>
                              <button
                                className="btn btn-xs btn-error bg-red-500 hover:bg-red-600 border-0 text-white"
                                onClick={() => deleteUser(t._id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>

              {/* Pagination for Teachers */}
              {(() => {
                // First filter by role
                let roleFilteredTeachers = teachers;
                if (filterRole === "teacher") {
                  // Show only teachers with teaching assignments BUT NO mentorship
                  roleFilteredTeachers = teachers.filter(
                    (t) =>
                      t.teacherAssignments &&
                      t.teacherAssignments.some((a) => a.role === "teaching") &&
                      (!t.mentorship || !t.mentorship.classOrBatch)
                  );
                } else if (filterRole === "student") {
                  // Show only teachers with mentorship assignments BUT NO teaching
                  roleFilteredTeachers = teachers.filter(
                    (t) =>
                      t.mentorship &&
                      t.mentorship.classOrBatch &&
                      (!t.teacherAssignments ||
                        !t.teacherAssignments.some(
                          (a) => a.role === "teaching"
                        ))
                  );
                }
                // filterRole === "all" shows all teachers

                // Then filter by search term
                const filteredTeachers = roleFilteredTeachers.filter((t) => {
                  if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    return (
                      t.name.toLowerCase().includes(term) ||
                      t.email.toLowerCase().includes(term)
                    );
                  }
                  return true;
                });

                return filteredTeachers.length > 10 ? (
                  <div className="mt-6 flex justify-center">
                    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
                      <button
                        className="btn btn-outline btn-sm border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                        onClick={() => setShowAllTeachers(!showAllTeachers)}
                      >
                        {showAllTeachers ? (
                          <>
                            <span>👁️</span>
                            Show Less
                          </>
                        ) : (
                          <>
                            <span>📋</span>
                            Show All ({filteredTeachers.length})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Teacher Assignment Modal */}
            {assigningTeacher && !showMentorshipForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    Assign {assigningTeacher.name} to Section
                  </h3>

                  <div className="space-y-4">
                    <select
                      className="select select-bordered w-full"
                      value={newAssignment.year}
                      onChange={(e) => {
                        const year = e.target.value;
                        setNewAssignment((prev) => ({
                          ...prev,
                          year,
                          subjectId: "", // Reset subject when year changes
                        }));
                      }}
                    >
                      <option value="">Select Year</option>
                      <option value="1st year">1st Year</option>
                      <option value="2nd year">2nd Year</option>
                      <option value="3rd year">3rd Year</option>
                    </select>

                    <select
                      className="select select-bordered w-full"
                      value={newAssignment.section}
                      onChange={(e) =>
                        setNewAssignment((prev) => ({
                          ...prev,
                          section: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Section</option>
                      <option value="E1">Section E1</option>
                      <option value="E2">Section E2</option>
                      <option value="M1">Section M1</option>
                      <option value="M2">Section M2</option>
                    </select>

                    <select
                      className="select select-bordered w-full"
                      value={newAssignment.subjectId}
                      onChange={(e) =>
                        setNewAssignment((prev) => ({
                          ...prev,
                          subjectId: e.target.value,
                        }))
                      }
                      disabled={!newAssignment.year}
                    >
                      <option value="">Select Subject</option>
                      {newAssignment.year &&
                        subjects
                          .filter(
                            (subject) => subject.year === newAssignment.year
                          )
                          .map((subject) => (
                            <option key={subject._id} value={subject._id}>
                              {subject.name} ({subject.code})
                            </option>
                          ))}
                    </select>

                    <select
                      className="select select-bordered w-full"
                      value={newAssignment.role}
                      onChange={(e) =>
                        setNewAssignment((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                    >
                      <option value="teaching">Teaching Role</option>
                      <option value="mentorship">Mentorship Role</option>
                    </select>

                    <div className="flex gap-2 justify-end">
                      <button
                        className="btn btn-ghost"
                        onClick={cancelAssignTeacher}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={assignTeacherToSection}
                        disabled={
                          !newAssignment.year ||
                          !newAssignment.section ||
                          !newAssignment.subjectId
                        }
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mentorship Assignment Modal */}
            {assigningTeacher && showMentorshipForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    Assign {assigningTeacher.name} as Mentor
                  </h3>

                  <div className="space-y-4">
                    <select
                      className="select select-bordered w-full"
                      value={mentorshipForm.year}
                      onChange={(e) =>
                        setMentorshipForm((prev) => ({
                          ...prev,
                          year: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Year</option>
                      <option value="1st year">1st Year</option>
                      <option value="2nd year">2nd Year</option>
                      <option value="3rd year">3rd Year</option>
                    </select>

                    <select
                      className="select select-bordered w-full"
                      value={mentorshipForm.section}
                      onChange={(e) =>
                        setMentorshipForm((prev) => ({
                          ...prev,
                          section: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Section</option>
                      <option value="E1">Section E1</option>
                      <option value="E2">Section E2</option>
                      <option value="M1">Section M1</option>
                      <option value="M2">Section M2</option>
                    </select>

                    <textarea
                      className="textarea textarea-bordered w-full"
                      placeholder="Mentorship Description (Optional)"
                      value={mentorshipForm.description}
                      onChange={(e) =>
                        setMentorshipForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        className="btn btn-ghost"
                        onClick={cancelAssignTeacher}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={assignMentorship}
                        disabled={
                          !mentorshipForm.year || !mentorshipForm.section
                        }
                      >
                        Assign Mentorship
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Section>

          <Section title="Students Management" icon="👨‍🎓">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Enrollment</th>
                    <th>Phone</th>
                    <th>Class</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // First filter by role
                    let roleFilteredStudents = students;
                    if (filterRole === "student") {
                      // Show only students (mentorship context)
                      roleFilteredStudents = students;
                    } else if (filterRole === "teacher") {
                      // Show only students assigned to teaching classes
                      roleFilteredStudents = students.filter(
                        (s) => s.classOrBatch && s.classOrBatch.includes(" - ")
                      );
                    }
                    // filterRole === "all" shows all students

                    // Then filter by search term
                    const filteredStudents = roleFilteredStudents.filter(
                      (s) => {
                        if (searchTerm) {
                          const term = searchTerm.toLowerCase();
                          return (
                            s.name.toLowerCase().includes(term) ||
                            s.email.toLowerCase().includes(term) ||
                            (s.enrollment &&
                              s.enrollment.toLowerCase().includes(term))
                          );
                        }
                        return true;
                      }
                    );

                    if (filteredStudents.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" className="text-center opacity-70">
                            {searchTerm
                              ? "No students found matching your search"
                              : filterRole === "teacher"
                              ? "No students assigned to teaching classes found"
                              : filterRole === "student"
                              ? "No students for mentorship found"
                              : "No students added yet"}
                          </td>
                        </tr>
                      );
                    }

                    return (
                      showAllStudents
                        ? filteredStudents
                        : filteredStudents.slice(0, 10)
                    ).map((s) => (
                      <tr key={s._id}>
                        <td>
                          {editingUser?._id === s._id ? (
                            <input
                              className="input input-bordered input-sm"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  name: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            s.name
                          )}
                        </td>
                        <td>
                          {editingUser?._id === s._id ? (
                            <input
                              className="input input-bordered input-sm"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  email: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            s.email
                          )}
                        </td>
                        <td>
                          {editingUser?._id === s._id ? (
                            <input
                              className="input input-bordered input-sm"
                              placeholder="Enrollment"
                              value={editForm.enrollment}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  enrollment: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            s.enrollment || "Not provided"
                          )}
                        </td>
                        <td>
                          {editingUser?._id === s._id ? (
                            <input
                              className="input input-bordered input-sm"
                              placeholder="Phone"
                              value={editForm.phone}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  phone: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            s.phone || "Not provided"
                          )}
                        </td>

                        <td>
                          {editingUser?._id === s._id ? (
                            <select
                              className="select select-bordered select-sm"
                              value={editForm.enrollment}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  enrollment: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select Class/Batch</option>
                              <option value="1st year - E1">
                                1st Year - E1
                              </option>
                              <option value="1st year - E2">
                                1st Year - E2
                              </option>
                              <option value="1st year - M1">
                                1st Year - M1
                              </option>
                              <option value="1st year - M2">
                                1st Year - M2
                              </option>
                              <option value="2nd year - E1">
                                2nd Year - E1
                              </option>
                              <option value="2nd year - E2">
                                2nd Year - E2
                              </option>
                              <option value="2nd year - M1">
                                2nd Year - M1
                              </option>
                              <option value="2nd year - M2">
                                2nd Year - M2
                              </option>
                              <option value="3rd year - E1">
                                3rd Year - E1
                              </option>
                              <option value="3rd year - E2">
                                3rd Year - E2
                              </option>
                              <option value="3rd year - M1">
                                3rd Year - M1
                              </option>
                              <option value="3rd year - M2">
                                3rd Year - M2
                              </option>
                            </select>
                          ) : (
                            s.enrollment || "Not assigned"
                          )}
                        </td>

                        <td>
                          {editingUser?._id === s._id ? (
                            <div className="flex gap-1">
                              <button
                                className="btn btn-xs btn-success"
                                onClick={saveEditUser}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-xs btn-ghost"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                className="btn btn-xs btn-outline"
                                onClick={() => startEditUser(s)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-xs btn-error"
                                onClick={() => deleteUser(s._id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>

              {/* Pagination for Students */}
              {(() => {
                // First filter by role
                let roleFilteredStudents = students;
                if (filterRole === "student") {
                  roleFilteredStudents = students;
                } else if (filterRole === "teacher") {
                  roleFilteredStudents = [];
                }
                // filterRole === "all" shows all students

                // Then filter by search term
                const filteredStudents = roleFilteredStudents.filter((s) => {
                  if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    return (
                      s.name.toLowerCase().includes(term) ||
                      s.email.toLowerCase().includes(term) ||
                      (s.enrollment &&
                        s.enrollment.toLowerCase().includes(term))
                    );
                  }
                  return true;
                });

                return filteredStudents.length > 10 ? (
                  <div className="mt-4 flex justify-center">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setShowAllStudents(!showAllStudents)}
                    >
                      {showAllStudents
                        ? "Show Less"
                        : `Show All (${filteredStudents.length})`}
                    </button>
                  </div>
                ) : null;
              })()}
            </div>
          </Section>

          <Section title="Subjects" icon="📚">
            <div className="grid grid-cols-4 gap-2">
              <input
                className="input input-bordered"
                placeholder="Name"
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject((v) => ({ ...v, name: e.target.value }))
                }
              />
              <input
                className="input input-bordered"
                placeholder="Code"
                value={newSubject.code}
                onChange={(e) =>
                  setNewSubject((v) => ({ ...v, code: e.target.value }))
                }
              />
              <select
                className="select select-bordered"
                value={newSubject.year}
                onChange={(e) =>
                  setNewSubject((v) => ({ ...v, year: e.target.value }))
                }
              >
                <option value="">Select Year</option>
                <option value="1st year">1st Year</option>
                <option value="2nd year">2nd Year</option>
                <option value="3rd year">3rd Year</option>
              </select>
              <select
                className="select select-bordered"
                value={newSubject.semester}
                onChange={(e) =>
                  setNewSubject((v) => ({ ...v, semester: e.target.value }))
                }
              >
                <option value="">Select Semester</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
              </select>
            </div>
            <div className="mt-3 flex justify-center">
              <button className="btn btn-primary" onClick={createSubject}>
                Add Subject
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 ">
              {subjects.length > 0 ? (
                subjects.map((sub) => (
                  <div
                    key={sub._id}
                    className="badge bg-gray-100 flex items-center gap-2 "
                  >
                    <span>
                      {sub.name} ({sub.code})
                      {sub.year && sub.semester
                        ? ` - ${sub.year} ${sub.semester}`
                        : ""}
                    </span>
                    <button
                      className="h-8 w-8 rounded-2xl btn-error text-white cursor-pointer flex items-center justify-center"
                      onClick={() => deleteSubject(sub._id)}
                      title="Delete subject"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center opacity-70 w-full">
                  No subjects added yet
                </div>
              )}
            </div>
          </Section>

          <Section title="Current Timetable" icon="📋">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Class</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Room</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.length > 0 ? (
                    timetable.map((tt) => (
                      <tr key={tt._id}>
                        <td>{tt.subjectId?.name}</td>
                        <td>{tt.teacherId?.name}</td>
                        <td>{tt.classOrBatch}</td>
                        <td>
                          {
                            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                              tt.dayOfWeek
                            ]
                          }
                        </td>
                        <td>
                          {tt.startTime}–{tt.endTime}
                        </td>
                        <td>
                          <span className="badge badge-outline">
                            {tt.slotType || "theory"}
                          </span>
                        </td>
                        <td>{tt.room || "—"}</td>
                        <td>
                          <button
                            className="btn btn-xs btn-error"
                            onClick={() => deleteSlot(tt._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center opacity-70">
                        No timetable slots created yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Attendance Records" icon="📊">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Class</th>
                    <th>Students Present</th>
                    <th>Students Absent</th>
                    <th>Total Students</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map((att) => {
                      const presentCount = att.records.filter(
                        (r) => r.status === "present"
                      ).length;
                      const absentCount = att.records.filter(
                        (r) => r.status === "absent"
                      ).length;
                      const totalCount = att.records.length;

                      return (
                        <tr key={att._id}>
                          <td className="font-medium">
                            {new Date(att.date).toLocaleDateString()}
                          </td>
                          <td>{att.subjectId?.name || "N/A"}</td>
                          <td>{att.teacherId?.name || "N/A"}</td>
                          <td>{att.classOrBatch}</td>
                          <td>
                            <span className="badge badge-success">
                              {presentCount}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-error">
                              {absentCount}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-outline">
                              {totalCount}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-xs btn-info"
                              onClick={() => showAttendanceReport(att)}
                              title="View detailed attendance report"
                            >
                              📊 Report
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center opacity-70">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {activeTab === "subjects" && (
        <div className="space-y-8">
          <Section title="Subjects" icon="📚">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="input input-bordered w-full"
                  placeholder="Subject Name"
                  value={newSubject.name}
                  onChange={(e) =>
                    setNewSubject((v) => ({ ...v, name: e.target.value }))
                  }
                />
                <input
                  className="input input-bordered w-full"
                  placeholder="Subject Code"
                  value={newSubject.code}
                  onChange={(e) =>
                    setNewSubject((v) => ({ ...v, code: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  className="select select-bordered w-full"
                  value={newSubject.year}
                  onChange={(e) =>
                    setNewSubject((v) => ({ ...v, year: e.target.value }))
                  }
                >
                  <option value="">Select Year</option>
                  <option value="1st year">1st Year</option>
                  <option value="2nd year">2nd Year</option>
                  <option value="3rd year">3rd Year</option>
                </select>

                <select
                  className="select select-bordered w-full"
                  value={newSubject.semester}
                  onChange={(e) =>
                    setNewSubject((v) => ({ ...v, semester: e.target.value }))
                  }
                >
                  <option value="">Select Semester</option>
                  <option value="1st semester">1st Semester</option>
                  <option value="2nd semester">2nd Semester</option>
                </select>
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={addSubject}
                disabled={
                  !newSubject.name || !newSubject.code || !newSubject.year
                }
              >
                <span>📚</span>
                Add Subject
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Current Subjects</h3>

              {/* Year Filter */}
              <div className="mb-4">
                <select
                  className="select select-bordered"
                  value={subjectYearFilter}
                  onChange={(e) => setSubjectYearFilter(e.target.value)}
                >
                  <option value="">All Years</option>
                  <option value="1st year">1st Year</option>
                  <option value="2nd year">2nd Year</option>
                  <option value="3rd year">3rd Year</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Year</th>
                      <th>Semester</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.length > 0 ? (
                      filteredSubjects.map((subject) => (
                        <tr key={subject._id}>
                          <td>{subject.name}</td>
                          <td>{subject.code}</td>
                          <td>
                            <span className="badge badge-primary">
                              {subject.year}
                            </span>
                          </td>
                          <td>{subject.semester}</td>
                          <td>
                            <button
                              className="btn btn-xs btn-error"
                              onClick={() => deleteSubject(subject._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center opacity-70">
                          {subjectYearFilter
                            ? `No subjects found for ${subjectYearFilter}`
                            : "No subjects added yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>
        </div>
      )}

      {activeTab === "teacher-students" && (
        <div className="space-y-8">
          <Section title="Teacher-Student Management" icon="��‍🏫">
            <div className="space-y-6">
              {/* Teacher Selection */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">
                  Select Teacher & Subject
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <select
                    className="select select-bordered w-full"
                    value={selectedTeacherForStudents}
                    onChange={(e) => {
                      setSelectedTeacherForStudents(e.target.value);
                      setSelectedSubjectForStudents("");
                      setSelectedYearForStudents("");
                    }}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="select select-bordered w-full"
                    value={selectedYearForStudents}
                    onChange={(e) => {
                      setSelectedYearForStudents(e.target.value);
                      // Automatically find and set the subject for this teacher and year
                      if (selectedTeacherForStudents && e.target.value) {
                        const teacher = teachers.find(
                          (t) => t._id === selectedTeacherForStudents
                        );
                        const assignment = teacher?.teacherAssignments?.find(
                          (assignment) => assignment.year === e.target.value
                        );
                        if (assignment) {
                          const subject = subjects.find(
                            (s) => s._id === assignment.subjectId
                          );
                          if (subject) {
                            setSelectedSubjectForStudents(subject._id);
                          }
                        }
                      }
                    }}
                    disabled={!selectedTeacherForStudents}
                  >
                    <option value="">Select Year</option>
                    {selectedTeacherForStudents && (
                      <>
                        <option value="1st year">1st Year</option>
                        <option value="2nd year">2nd Year</option>
                        <option value="3rd year">3rd Year</option>
                      </>
                    )}
                  </select>

                  <div className="select select-bordered w-full bg-gray-100 flex items-center justify-center">
                    {selectedTeacherForStudents &&
                    selectedYearForStudents &&
                    selectedSubjectForStudents ? (
                      <span className="text-gray-700 font-medium">
                        {subjects.find(
                          (s) => s._id === selectedSubjectForStudents
                        )?.name || "Subject not found"}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Subject will be shown here
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-primary mt-4"
                  onClick={loadTeacherStudents}
                  disabled={
                    !selectedTeacherForStudents ||
                    !selectedSubjectForStudents ||
                    !selectedYearForStudents
                  }
                >
                  👥 Load Students
                </button>
              </div>

              {/* Students List */}
              {teacherStudents.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold p-4 border-b border-gray-200">
                    Students for {selectedTeacherName} - {selectedSubjectName} (
                    {selectedYearForStudents})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enrollment
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teacherStudents.map((student) => (
                          <tr key={student._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {student.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {student.enrollment}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {student.section}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm text-gray-600">
                      Total Students:{" "}
                      <span className="font-semibold">
                        {teacherStudents.length}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {teacherStudents.length === 0 &&
                selectedTeacherForStudents &&
                selectedSubjectForStudents &&
                selectedYearForStudents && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">👨‍🎓</div>
                    <div className="text-lg font-medium text-gray-600 mb-2">
                      No Students Found
                    </div>
                    <div className="text-sm text-gray-500">
                      No students are enrolled in {selectedYearForStudents} for
                      this subject
                    </div>
                  </div>
                )}
            </div>
          </Section>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="space-y-8">
          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 text-xl">ℹ️</div>
              <div>
                <h3 className="font-medium text-blue-800 mb-1">
                  About Attendance Records
                </h3>
                <p className="text-sm text-blue-700">
                  Attendance records are created when teachers mark attendance
                  for their classes. If you don't see any records here, it means
                  teachers haven't marked attendance yet.
                </p>
              </div>
            </div>
          </div>

          <Section title="Attendance Records" icon="📊">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-600">Loading attendance data...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Teacher</th>
                      <th>Class</th>
                      <th>Students Present</th>
                      <th>Students Absent</th>
                      <th>Total Students</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length > 0 ? (
                      attendance.map((att) => {
                        const presentCount = att.records.filter(
                          (r) => r.status === "present"
                        ).length;
                        const absentCount = att.records.filter(
                          (r) => r.status === "absent"
                        ).length;
                        const totalCount = att.records.length;

                        return (
                          <tr key={att._id}>
                            <td className="font-medium">
                              {new Date(att.date).toLocaleDateString()}
                            </td>
                            <td>{att.subjectId?.name || "N/A"}</td>
                            <td>{att.teacherId?.name || "N/A"}</td>
                            <td>{att.classOrBatch}</td>
                            <td>
                              <span className="badge badge-success">
                                {presentCount}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-error">
                                {absentCount}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-outline">
                                {totalCount}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-xs btn-info"
                                onClick={() => showAttendanceReport(att)}
                                title="View detailed attendance report"
                              >
                                📊 Report
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center opacity-70">
                          <div className="py-8">
                            <div className="text-4xl mb-2">📊</div>
                            <div className="text-lg font-medium text-gray-600 mb-2">
                              No Attendance Records Yet
                            </div>
                            <div className="text-sm text-gray-500 mb-4">
                              Attendance records will appear here once teachers
                              start marking attendance for their classes.
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg border">
                              <strong>Debug Info:</strong>
                              <br />• Total Students: {students.length}
                              <br />• Total Teachers: {teachers.length}
                              <br />• Total Subjects: {subjects.length}
                              <br />• Total Timetable Slots: {timetable.length}
                              <br />• Attendance Records: {attendance.length}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>
      )}

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
                <p className="text-sm">Teacher: {attendanceReport.teacher}</p>
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
                          key={index}
                          className="bg-white rounded-lg p-3 border border-green-200"
                        >
                          <div className="font-medium text-green-800">
                            {student.studentName}
                          </div>
                          <div className="text-sm text-green-600">
                            Enrollment: {student.enrollment}
                          </div>
                          <div className="text-xs text-green-500">
                            Status: {student.status}
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
                          key={index}
                          className="bg-white rounded-lg p-3 border border-red-200"
                        >
                          <div className="font-medium text-red-800">
                            {student.studentName}
                          </div>
                          <div className="text-sm text-red-600">
                            Enrollment: {student.enrollment}
                          </div>
                          <div className="text-xs text-red-500">
                            Status: {student.status}
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
                    teacher: attendanceReport.teacher,
                    present: attendanceReport.present,
                    absent: attendanceReport.absent,
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
