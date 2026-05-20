import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

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
  const percentage =
    attendance.length === 0
      ? 0
      : Math.round((presentCount / attendance.length) * 100);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          View your attendance and academic progress
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Student Information
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <div className="mb-1 text-xs text-slate-500">Full Name</div>
            <div className="text-lg font-semibold text-slate-900">
              {user.name}
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-500">Email</div>
            <div className="break-all text-sm font-medium text-slate-900">
              {user.email}
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-500">Enrollment Number</div>
            <div className="text-lg font-semibold text-slate-900">
              {user.enrollment || "-"}
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-500">Class / Section</div>
            <div className="text-lg font-semibold text-slate-900">
              {user.batch && user.section
                ? `${user.batch} ${user.section}`
                : user.classOrBatch || "-"}
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-800">
          Attendance Overview
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-md border border-slate-200 bg-white p-5">
            <svg
              width="120"
              height="120"
              viewBox="0 0 140 140"
              className="-rotate-90"
            >
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="12"
              />
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke={
                  percentage >= 75
                    ? "#3b82f6"
                    : percentage >= 50
                      ? "#f59e0b"
                      : "#ef4444"
                }
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 377} 377`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="mt-3 text-center">
              <div className="text-3xl font-bold text-slate-900">
                {percentage}%
              </div>
              <div className="mt-1 text-xs text-slate-600">Attendance Rate</div>
            </div>
            <div className="mt-3 text-xs text-slate-600">
              {percentage >= 75
                ? "✅ Excellent attendance"
                : percentage >= 50
                  ? "⚠️ Needs improvement"
                  : "❌ Critical attendance"}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              PRESENT CLASSES
            </div>
            <div className="mb-2 text-3xl font-bold text-slate-900">
              {presentCount}
            </div>
            <div className="text-xs text-slate-600">
              Out of{" "}
              <span className="font-bold text-slate-900">
                {attendance.length}
              </span>{" "}
              total sessions
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              ABSENT CLASSES
            </div>
            <div className="mb-2 text-3xl font-bold text-slate-900">
              {absentCount}
            </div>
            <div className="text-xs text-slate-600">
              Keep your attendance above{" "}
              <span className="font-bold text-slate-900">75%</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-800">
          Attendance Records
        </h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block text-4xl mb-4">⏳</div>
            <p className="text-slate-600 font-medium">Loading attendance...</p>
          </div>
        ) : attendance.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Subject
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Teacher
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Class
                    </th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((record) => (
                    <tr
                      key={record._id}
                      className="odd:bg-white even:bg-slate-50/35 hover:bg-blue-50/50"
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-slate-900">
                        {record.subjectId?.name || "-"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-900">
                        {record.teacherId?.name || "-"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-900">
                        {record.classOrBatch}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {record.status === "present" ? (
                          <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            ✅ Present
                          </span>
                        ) : (
                          <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                            ❌ Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50 py-10 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-slate-600 font-medium">
              No attendance records yet
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Your attendance records will appear here once your teachers mark
              them
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
