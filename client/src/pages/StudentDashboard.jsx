import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";
import Section from "../components/Section";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/student/attendance`);
      setAttendance(data);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === "present" ? (
      <span className="badge badge-success">Present</span>
    ) : (
      <span className="badge badge-error">Absent</span>
    );
  };

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const percentage = attendance.length === 0
    ? 0
    : Math.round((presentCount / attendance.length) * 100);

  const progressColor =
    percentage >= 75 ? "from-emerald-500 to-green-500" :
    percentage >= 50 ? "from-amber-500 to-yellow-500" :
    "from-red-500 to-rose-500";

  return (
    <div className="space-y-8">
      <div className="text-center mb-12 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl mb-6 shadow-lg animate-scale-in">
          <span className="text-3xl">👨‍🎓</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-slate-800 via-green-700 to-emerald-700 bg-clip-text text-transparent mb-4 tracking-tight">
          Student Dashboard
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          View your attendance records and academic progress
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Student Information" icon="ℹ️">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Name
                </label>
                <div className="text-lg font-semibold text-slate-800 mt-0.5">{user.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Email
                </label>
                <div className="text-lg font-semibold text-slate-800 mt-0.5">{user.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Enrollment
                </label>
                <div className="text-lg font-semibold text-slate-800 mt-0.5">
                  {user.enrollment || "Not provided"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Class / Batch
                </label>
                <div className="text-lg font-semibold text-slate-800 mt-0.5">
                  {user.batch && user.section
                    ? `${user.batch} ${user.section}`
                    : user.classOrBatch || "Not assigned"}
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Attendance Overview" icon="📊">
          <div className="text-center space-y-5">
            {/* Circular-ish progress display */}
            <div className="relative inline-flex items-center justify-center">
              <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                <circle cx="70" cy="70" r="60" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <circle
                  cx="70" cy="70" r="60"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(percentage / 100) * 377} 377`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={percentage >= 75 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#ef4444"} />
                    <stop offset="100%" stopColor={percentage >= 75 ? "#059669" : percentage >= 50 ? "#d97706" : "#dc2626"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-800">{percentage}%</span>
                <span className="text-xs text-slate-500 font-medium">Attendance</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200/60">
                <div className="text-2xl font-bold text-emerald-600">
                  {presentCount}
                </div>
                <div className="text-emerald-700 font-medium mt-0.5">Present</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-200/60">
                <div className="text-2xl font-bold text-red-600">
                  {absentCount}
                </div>
                <div className="text-red-700 font-medium mt-0.5">Absent</div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Attendance Records" icon="📋" className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner loading-lg mx-auto"></div>
              <div className="mt-3 text-slate-500 font-medium">Loading attendance...</div>
            </div>
          ) : attendance.length > 0 ? (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Class</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td className="font-medium">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td>{record.subjectId?.name || "N/A"}</td>
                      <td>{record.teacherId?.name || "N/A"}</td>
                      <td>{record.classOrBatch}</td>
                      <td>{getStatusBadge(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <div className="text-4xl mb-3">📭</div>
              No attendance records found yet.
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
