import React, { useState } from "react";
import Section from "../Section";
import { subjectInfoMap, getSubjectInfo } from "../../utils/subjectHelper";

export default function SubjectManagement({ subjects, addSubject, deleteSubject }) {
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    semester: "",
    year: "",
  });

  const [subjectYearFilter, setSubjectYearFilter] = useState("");

  const handleSubjectChange = (e) => {
    const selectedSubject = e.target.value;
    if (selectedSubject) {
      const subjectInfo = getSubjectInfo(selectedSubject);
      setNewSubject({
        name: selectedSubject,
        code: subjectInfo.code,
        semester: subjectInfo.semester,
        year: subjectInfo.year,
      });
    } else {
      setNewSubject({
        name: "",
        code: "",
        semester: "",
        year: "",
      });
    }
  };

  const handleCreateSubject = async () => {
    const success = await addSubject(newSubject);
    if (success) {
      setNewSubject({
        name: "",
        code: "",
        semester: "",
        year: "",
      });
    }
  };

  // Group subjects by Semester for display in dropdown
  const semesters = {
    "Semester 1": [
      "Discrete Mathematics",
      "Programming Using C",
      "Fundamentals of Computers & IT",
      "Web Technologies",
      "Technical Communication",
      "C Programming Lab",
      "IT Lab",
      "Web Tech Lab",
    ],
    "Semester 2": [
      "Applied Mathematics",
      "Web Based Programming",
      "Data Structures",
      "Database Management Systems",
      "Environmental Studies",
      "VB.Net Lab",
      "Statistical Analysis using Excel",
      "Photoshop Lab",
      "Web Programming Lab",
      "Data Structures Lab",
      "DBMS Lab",
    ],
    "Semester 3": [
      "Computer Networks",
      "Computer Organisation & Architecture",
      "Object Oriented Programming with C++",
      "Human Values & Ethics",
      "Basics of Python Programming",
      "Python Lab",
      "Cyber Security",
      "Cyber Security Lab",
      "Principles of Management & Organisational Behaviour",
      "CorelDraw Lab",
      "ASP.Net",
      "AR/VR",
      "Cyber Ethics",
      "C++ Lab",
    ],
    "Semester 4": [
      "Java Programming",
      "Software Engineering",
      "Management & Entrepreneurship",
      "Introduction to Data Science",
      "Data Science Lab",
      "Introduction to Artificial Intelligence",
      "AI Lab",
      "Network Security",
      "Network Security Lab",
      "Web Development with Python & Django",
      "Django Lab",
      "Digital Marketing",
      "Principles of Accounting",
      "Personality Development Skills",
      "Java Lab",
      "SE Lab",
    ],
    "Semester 5": [
      "Operating System & Linux Programming",
      "Computer Graphics",
      "Cloud Computing",
      "Machine Learning with Python",
      "ML Lab",
      "Web Security",
      "Web Security Lab",
      "Web Development with Java & JSP",
      "JSP Lab",
      "OS/Linux Lab",
      "CG Lab",
    ],
    "Semester 6": [
      "Data Warehousing & Data Mining",
      "E-Commerce",
      "Internet of Things",
      "Data Visualization & Analytics",
      "DVA Lab",
      "Deep Learning with Python",
      "DL Lab",
      "IT Act & Cyber Laws",
      "Mobile Application Development",
      "Mobile App Dev Lab",
      "Seminar / Conference Presentation",
      "IoT Lab",
    ],
  };

  const filteredSubjects = subjects.filter((s) => {
    if (subjectYearFilter && s.year !== subjectYearFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Create Subject Card */}
      <Section title="Academics & Subject Registry" icon="📚">
        <div className="grid gap-6 md:grid-cols-2 items-end bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Choose BCA Syllabus Subject</label>
            <select
              className="select select-bordered w-full bg-white"
              value={newSubject.name}
              onChange={handleSubjectChange}
            >
              <option value="">Select Curriculum Subject</option>
              {Object.keys(semesters).map((semesterName) => (
                <optgroup key={semesterName} label={semesterName}>
                  {semesters[semesterName].map((subName) => (
                    <option key={subName} value={subName}>
                      {subName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-400 mb-1 uppercase">Mapped Code</div>
              <input
                className="input input-bordered w-full bg-slate-100/80 font-mono font-bold"
                value={newSubject.code}
                placeholder="Code auto-loaded"
                disabled
              />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-400 mb-1 uppercase">Semester Mapped</div>
              <input
                className="input input-bordered w-full bg-slate-100/80 font-medium"
                value={newSubject.semester}
                placeholder="Semester auto-loaded"
                disabled
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              className="btn btn-primary w-full md:w-auto px-8"
              onClick={handleCreateSubject}
              disabled={!newSubject.name || !newSubject.code || !newSubject.semester || !newSubject.year}
            >
              📚 Add Subject Course
            </button>
          </div>
        </div>
      </Section>

      {/* Current Active Subjects Card */}
      <Section title="Currently Registered Courses" icon="📋">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-slate-700">
            Active Registry: <span className="font-bold text-blue-600">{filteredSubjects.length} subjects</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Filter Year:</label>
            <select
              className="select select-bordered select-sm w-full sm:w-44 bg-white"
              value={subjectYearFilter}
              onChange={(e) => setSubjectYearFilter(e.target.value)}
            >
              <option value="">All Academic Years</option>
              <option value="1st year">1st Year</option>
              <option value="2nd year">2nd Year</option>
              <option value="3rd year">3rd Year</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="table w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="font-semibold text-slate-700">Subject Name</th>
                <th className="font-semibold text-slate-700">Code</th>
                <th className="font-semibold text-slate-700">Academic Year</th>
                <th className="font-semibold text-slate-700">Semester</th>
                <th className="font-semibold text-slate-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="font-semibold text-slate-800">{subject.name}</td>
                    <td className="font-mono text-slate-600 font-bold">{subject.code}</td>
                    <td>
                      <span className="badge badge-primary font-medium">{subject.year}</span>
                    </td>
                    <td className="text-slate-600 font-medium">{subject.semester}</td>
                    <td className="text-right">
                      <button
                        className="btn btn-xs btn-error text-white shadow-sm"
                        onClick={() => deleteSubject(subject._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400 italic">
                    {subjectYearFilter
                      ? `No registered subjects found for ${subjectYearFilter}`
                      : "No registered subjects found in database."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
