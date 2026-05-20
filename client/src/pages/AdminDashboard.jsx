import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../AuthContext";
import { Users, BookOpen, Clock, BarChart3, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    subjects: 0,
    timetableSlots: 0,
    attendanceRecords: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);

      const [teachersRes, studentsRes, subjectsRes, timetableRes, attendanceRes] =
        await Promise.all([
          api.get("/admin/users?role=teacher"),
          api.get("/admin/users?role=student"),
          api.get("/admin/subjects"),
          api.get("/admin/timetable"),
          api.get("/admin/attendance"),
        ]);

      setStats({
        teachers: teachersRes.data?.length || 0,
        students: studentsRes.data?.length || 0,
        subjects: subjectsRes.data?.length || 0,
        timetableSlots: timetableRes.data?.length || 0,
        attendanceRecords: (attendanceRes.data || []).length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const KPICard = ({ icon: Icon, label, value, color = "blue", action }) => {
    const colorClasses = {
      blue: "bg-blue-500/10 text-blue-400",
      green: "bg-emerald-500/10 text-emerald-400",
      purple: "bg-purple-500/10 text-purple-400",
      orange: "bg-amber-500/10 text-amber-400",
      red: "bg-red-500/10 text-red-400",
    };

    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 hover:bg-slate-700/80 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className={`rounded-lg p-3 ${colorClasses[color] || colorClasses.blue}`}>
            <Icon className="h-6 w-6" />
          </div>
          {action && (
            <button
              onClick={action}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
            >
              View <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          {label}
        </div>
        <div className="text-3xl font-bold text-slate-100">{value}</div>
      </div>
    );
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Institutional overview and quick access to management tools
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="text-slate-400">Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Key Metrics
              </h2>
              <div className="grid gap-4 md:grid-cols-5">
                <KPICard
                  icon={Users}
                  label="Teachers"
                  value={stats.teachers}
                  color="blue"
                  action={() => navigate("/admin/teachers")}
                />
                <KPICard
                  icon={Users}
                  label="Students"
                  value={stats.students}
                  color="green"
                  action={() => navigate("/admin/students")}
                />
                <KPICard
                  icon={BookOpen}
                  label="Subjects"
                  value={stats.subjects}
                  color="purple"
                  action={() => navigate("/admin/subjects")}
                />
                <KPICard
                  icon={Clock}
                  label="Timetable Slots"
                  value={stats.timetableSlots}
                  color="orange"
                  action={() => navigate("/admin/timetable")}
                />
                <KPICard
                  icon={BarChart3}
                  label="Attendance Records"
                  value={stats.attendanceRecords}
                  color="red"
                  action={() => navigate("/admin/attendance")}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Management
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Manage Students",
                    description: "Add, edit, or remove student records",
                    path: "/admin/students",
                    icon: Users,
                  },
                  {
                    title: "Manage Teachers",
                    description: "Handle teacher assignments and profiles",
                    path: "/admin/teachers",
                    icon: Users,
                  },
                  {
                    title: "Manage Subjects",
                    description: "Create and organize academic subjects",
                    path: "/admin/subjects",
                    icon: BookOpen,
                  },
                  {
                    title: "Manage Timetable",
                    description: "Schedule classes and detect conflicts",
                    path: "/admin/timetable",
                    icon: Clock,
                  },
                  {
                    title: "View Attendance",
                    description: "Analyze attendance patterns and trends",
                    path: "/admin/attendance",
                    icon: BarChart3,
                  },
                ].map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => navigate(action.path)}
                      className="group rounded-lg border border-slate-700 bg-slate-800 p-5 text-left hover:border-blue-600 hover:bg-slate-700 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="rounded-lg bg-slate-700 p-2 group-hover:bg-blue-600/20 transition-colors">
                          <Icon className="h-5 w-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-slate-100 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                        {action.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Info */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-slate-100 mb-4">System Information</h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Total Users
                  </div>
                  <div className="text-3xl font-bold text-slate-100">
                    {stats.teachers + stats.students}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {stats.teachers} teachers, {stats.students} students
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Active Courses
                  </div>
                  <div className="text-3xl font-bold text-slate-100">
                    {stats.subjects}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Scheduled Classes
                  </div>
                  <div className="text-3xl font-bold text-slate-100">
                    {stats.timetableSlots}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
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
