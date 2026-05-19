import React, { useState } from "react";
import Section from "../Section";
import api from "../../api";
import { toast } from "react-hot-toast";

export default function TeacherStudents({ teachers, subjects }) {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [teacherNameDisplay, setTeacherNameDisplay] = useState("");
  const [subjectNameDisplay, setSubjectNameDisplay] = useState("");

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setSelectedSubject("");

    // Auto-select subject mapped to teacher for this year if available
    if (selectedTeacher && year) {
      const teacher = teachers.find((t) => t._id === selectedTeacher);
      const assignment = teacher?.teacherAssignments?.find((a) => a.year === year);
      if (assignment) {
        const subject = subjects.find((s) => s._id === assignment.subjectId);
        if (subject) {
          setSelectedSubject(subject._id);
        }
      }
    }
  };

  const loadStudents = async () => {
    if (!selectedTeacher || !selectedSubject || !selectedYear) {
      toast.error("Please select teacher, year, and subject");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get("/admin/teacher-students", {
        params: {
          teacherId: selectedTeacher,
          subjectId: selectedSubject,
          year: selectedYear,
        },
      });

      setStudents(response.data);
      setHasLoaded(true);

      const teacherObj = teachers.find((t) => t._id === selectedTeacher);
      const subjectObj = subjects.find((s) => s._id === selectedSubject);
      setTeacherNameDisplay(teacherObj?.name || "Teacher");
      setSubjectNameDisplay(subjectObj?.name || "Subject");
    } catch (error) {
      toast.error("Failed to load student list");
      console.error("Error loading teacher students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Section title="Teacher-Student Registry Matrix" icon="🏫">
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-slate-800 mb-4">Query Enrolled Class Directory</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Lecturer</label>
                <select
                  className="select select-bordered w-full bg-white"
                  value={selectedTeacher}
                  onChange={(e) => {
                    setSelectedTeacher(e.target.value);
                    setSelectedSubject("");
                    setSelectedYear("");
                  }}
                >
                  <option value="">Choose Lecturer</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Academic Year</label>
                <select
                  className="select select-bordered w-full bg-white"
                  value={selectedYear}
                  onChange={handleYearChange}
                  disabled={!selectedTeacher}
                >
                  <option value="">Choose Year</option>
                  <option value="1st year">1st Year</option>
                  <option value="2nd year">2nd Year</option>
                  <option value="3rd year">3rd Year</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Subject Course</label>
                <div className="select select-bordered w-full bg-slate-100 flex items-center px-4 justify-between border-slate-300">
                  {selectedTeacher && selectedYear && selectedSubject ? (
                    <span className="text-slate-800 font-semibold truncate max-w-full">
                      {subjects.find((s) => s._id === selectedSubject)?.name || "Subject Loaded"}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Select Teacher & Year...</span>
                  )}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary mt-6 w-full md:w-auto px-8"
              onClick={loadStudents}
              disabled={!selectedTeacher || !selectedSubject || !selectedYear || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-content"></div>
                  <span>Querying Enrolled Students...</span>
                </>
              ) : (
                <span>👥 Query Students List</span>
              )}
            </button>
          </div>

          {/* Student Grid results */}
          {hasLoaded && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Enrolled Students: {subjectNameDisplay}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lecturer: <span className="font-semibold">{teacherNameDisplay}</span> • Batch Year: <span className="font-semibold">{selectedYear}</span>
                  </p>
                </div>
                <span className="badge badge-primary badge-lg font-bold py-3 shadow-md">{students.length} Enrolled</span>
              </div>

              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="font-semibold text-slate-700">Student Name</th>
                        <th className="font-semibold text-slate-700">Email Address</th>
                        <th className="font-semibold text-slate-700">Enrollment ID</th>
                        <th className="font-semibold text-slate-700 text-right">Section Mapped</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="font-semibold text-slate-800">{student.name}</td>
                          <td className="text-slate-600 font-medium">{student.email}</td>
                          <td className="font-mono text-slate-600 font-bold text-xs">{student.enrollment}</td>
                          <td className="text-right">
                            <span className="badge badge-ghost font-semibold">{student.section}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 italic">
                  No students are enrolled in {selectedYear} for {subjectNameDisplay}.
                </div>
              )}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
