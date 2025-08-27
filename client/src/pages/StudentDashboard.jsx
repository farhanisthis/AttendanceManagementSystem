import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

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

  const getAttendancePercentage = () => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(
      (a) => a.status === "present"
    ).length;
    return Math.round((presentCount / attendance.length) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl mb-6 shadow-lg">
          <span className="text-3xl">👨‍🎓</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">
          Student Dashboard
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          View your attendance records and academic progress
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Student Information" icon="ℹ️">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Name
                </label>
                <div className="text-lg font-semibold">{user.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Email
                </label>
                <div className="text-lg font-semibold">{user.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Enrollment
                </label>
                <div className="text-lg font-semibold">
                  {user.enrollment || "Not provided"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Class/Batch
                </label>
                <div className="text-lg font-semibold">
                  {user.classOrBatch || "Not assigned"}
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Attendance Overview" icon="📊">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">
              {getAttendancePercentage()}%
            </div>
            <div className="text-slate-600">Overall Attendance Rate</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-600 font-semibold">
                  {attendance.filter((a) => a.status === "present").length}
                </div>
                <div className="text-green-700">Present</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-red-600 font-semibold">
                  {attendance.filter((a) => a.status === "absent").length}
                </div>
                <div className="text-red-700">Absent</div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Attendance Records" icon="📋" className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
              <div className="mt-2 text-slate-600">Loading attendance...</div>
            </div>
          ) : attendance.length > 0 ? (
            <div className="overflow-x-auto">
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
            <div className="text-center py-8 text-slate-500">
              No attendance records found yet.
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
