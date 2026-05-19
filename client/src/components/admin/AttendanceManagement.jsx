import React, { useState } from "react";
import Section from "../Section";
import { toast } from "react-hot-toast";

export default function AttendanceManagement({
  attendance,
  isLoading,
  studentsCount,
  teachersCount,
  subjectsCount,
  timetableCount,
}) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState(null);

  const handleShowReport = (att) => {
    const presentList = att.records.filter((r) => r.status === "present");
    const absentList = att.records.filter((r) => r.status === "absent");

    setAttendanceReport({
      _id: att._id,
      date: att.date,
      subject: att.subjectId?.name || "N/A",
      class: att.classOrBatch || "N/A",
      teacher: att.teacherId?.name || "N/A",
      present: presentList,
      absent: absentList,
      total: att.records.length,
    });
    setShowReportModal(true);
  };

  const handleDownloadReport = () => {
    if (!attendanceReport) return;

    const reportData = {
      date: attendanceReport.date,
      subject: attendanceReport.subject,
      class: attendanceReport.class,
      teacher: attendanceReport.teacher,
      presentCount: attendanceReport.present.length,
      absentCount: attendanceReport.absent.length,
      totalCount: attendanceReport.total,
      attendanceRate:
        attendanceReport.total > 0
          ? Math.round((attendanceReport.present.length / attendanceReport.total) * 100)
          : 0,
      presentStudents: attendanceReport.present.map((s) => ({
        name: s.studentName,
        enrollment: s.enrollment,
      })),
      absentStudents: attendanceReport.absent.map((s) => ({
        name: s.studentName,
        enrollment: s.enrollment,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${attendanceReport.class.replace(/\s+/g, "")}-${new Date(
      attendanceReport.date
    )
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Attendance report exported successfully!");
  };

  return (
    <div className="space-y-8">
      {/* Overview/Debug Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
        <div className="flex gap-4 items-start">
          <div className="text-blue-500 text-3xl">📊</div>
          <div className="space-y-2">
            <h3 className="text-md font-bold text-blue-800">Academic System Log Summary</h3>
            <p className="text-sm text-blue-700">
              Below are active attendance sessions created by teachers across scheduled semesters. Use detailed logs to auditing present/absent quotients.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <span className="badge badge-outline text-xs text-blue-700 border-blue-300">Students Registered: {studentsCount}</span>
              <span className="badge badge-outline text-xs text-blue-700 border-blue-300">Active Faculty: {teachersCount}</span>
              <span className="badge badge-outline text-xs text-blue-700 border-blue-300">Subjects Mapped: {subjectsCount}</span>
              <span className="badge badge-outline text-xs text-blue-700 border-blue-300">Timetable Slots: {timetableCount}</span>
            </div>
          </div>
        </div>
      </div>

      <Section title="Attendance Logs & Sessions" icon="📋">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-slate-500 text-sm">Synchronizing attendance records...</div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="table w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="font-semibold text-slate-700">Session Date</th>
                  <th className="font-semibold text-slate-700">Subject Course</th>
                  <th className="font-semibold text-slate-700">Faculty Instructor</th>
                  <th className="font-semibold text-slate-700">Class/Batch</th>
                  <th className="font-semibold text-slate-700 text-center">Present</th>
                  <th className="font-semibold text-slate-700 text-center">Absent</th>
                  <th className="font-semibold text-slate-700 text-center">Total Students</th>
                  <th className="font-semibold text-slate-700 text-right">Audit</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? (
                  attendance.map((att) => {
                    const presentCount = att.records.filter((r) => r.status === "present").length;
                    const absentCount = att.records.filter((r) => r.status === "absent").length;
                    const totalCount = att.records.length;

                    return (
                      <tr key={att._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="font-semibold text-slate-800">
                          {new Date(att.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="font-medium text-slate-700">{att.subjectId?.name || "N/A"}</td>
                        <td className="text-slate-600">{att.teacherId?.name || "N/A"}</td>
                        <td>
                          <span className="badge badge-outline">{att.classOrBatch}</span>
                        </td>
                        <td className="text-center font-bold text-green-600 bg-green-50/30">
                          {presentCount}
                        </td>
                        <td className="text-center font-bold text-red-600 bg-red-50/30">
                          {absentCount}
                        </td>
                        <td className="text-center font-semibold text-slate-600">{totalCount}</td>
                        <td className="text-right">
                          <button
                            className="btn btn-xs btn-primary text-white"
                            onClick={() => handleShowReport(att)}
                          >
                            📊 View Report
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400 italic">
                      No attendance session logs registered yet in system database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Attendance Report Modal */}
      {showReportModal && attendanceReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-100 animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Detailed Session Report</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-white hover:text-blue-200 text-xl font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-blue-100">
                <div>
                  Course: <span className="font-semibold text-white">{attendanceReport.subject}</span>
                </div>
                <div>
                  Batch Year: <span className="font-semibold text-white">{attendanceReport.class}</span>
                </div>
                <div>
                  Date: <span className="font-semibold text-white">{new Date(attendanceReport.date).toLocaleDateString()}</span>
                </div>
                <div>
                  Lecturer: <span className="font-semibold text-white">{attendanceReport.teacher}</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{attendanceReport.present.length}</div>
                  <div className="text-xs text-green-700 font-semibold uppercase">Students Present</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{attendanceReport.absent.length}</div>
                  <div className="text-xs text-red-700 font-semibold uppercase">Students Absent</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {attendanceReport.total > 0
                      ? Math.round((attendanceReport.present.length / attendanceReport.total) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-blue-700 font-semibold uppercase">Attendance Rate</div>
                </div>
              </div>

              {/* Present List */}
              <div>
                <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
                  <span>✅</span> Present Students ({attendanceReport.present.length})
                </h4>
                <div className="bg-green-50/20 border border-green-100 rounded-xl p-4">
                  {attendanceReport.present.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {attendanceReport.present.map((student, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-2.5 border border-green-100 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-800">{student.studentName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{student.enrollment}</div>
                          </div>
                          <span className="badge badge-success badge-sm py-1.5 font-bold uppercase text-[9px] tracking-wide text-white">Present</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-green-600 text-xs italic">No students present for this session.</div>
                  )}
                </div>
              </div>

              {/* Absent List */}
              <div>
                <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-1">
                  <span>✕</span> Absent Students ({attendanceReport.absent.length})
                </h4>
                <div className="bg-red-50/20 border border-red-100 rounded-xl p-4">
                  {attendanceReport.absent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {attendanceReport.absent.map((student, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-2.5 border border-red-100 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-800">{student.studentName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{student.enrollment}</div>
                          </div>
                          <span className="badge badge-error badge-sm py-1.5 font-bold uppercase text-[9px] tracking-wide text-white">Absent</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-red-600 text-xs italic">No students absent for this session.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowReportModal(false)} className="btn btn-outline">
                Dismiss
              </button>
              <button onClick={handleDownloadReport} className="btn btn-primary text-white">
                📥 Export JSON Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
