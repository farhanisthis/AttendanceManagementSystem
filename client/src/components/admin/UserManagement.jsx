import React, { useState } from "react";
import Section from "../Section";

export default function UserManagement({
  teachers,
  students,
  subjects,
  registerUser,
  saveEditUser,
  deleteUser,
  assignTeacherToSection,
  removeTeacherAssignment,
  assignMentorship,
  removeMentorship,
  isRegistering,
}) {
  // Local UI States for searching, filtering, and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);

  // Local state for registering new user
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

  // Local state for editing user
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    enrollment: "",
    sections: [],
    batch: "",
    section: "",
  });

  // Local state for assignments
  const [assigningTeacher, setAssigningTeacher] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    year: "",
    section: "",
    subjectId: "",
    role: "teaching",
  });

  const [showMentorshipForm, setShowMentorshipForm] = useState(false);
  const [mentorshipForm, setMentorshipForm] = useState({
    year: "",
    section: "",
    description: "",
  });

  // Helpers
  const startEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      enrollment: user.enrollment || "",
      sections: user.sections || [],
      batch: user.batch || "",
      section: user.section || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      name: "",
      email: "",
      phone: "",
      enrollment: "",
      sections: [],
      batch: "",
      section: "",
    });
  };

  const handleSaveEdit = async () => {
    const success = await saveEditUser(editingUser, editForm);
    if (success) {
      handleCancelEdit();
    }
  };

  const handleRegister = async () => {
    const success = await registerUser(newUser);
    if (success) {
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
    }
  };

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

  const handleAssignTeacher = async () => {
    const success = await assignTeacherToSection(assigningTeacher, newAssignment);
    if (success) {
      cancelAssignTeacher();
    }
  };

  const handleAssignMentorship = async () => {
    const success = await assignMentorship(assigningTeacher, mentorshipForm);
    if (success) {
      setShowMentorshipForm(false);
      setMentorshipForm({ year: "", section: "", description: "" });
      setAssigningTeacher(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Registration Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <Section title="Register New User" icon="👤">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  className="input input-bordered w-full"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((v) => ({ ...v, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input
                  className="input input-bordered w-full"
                  type="email"
                  placeholder="name@university.edu"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((v) => ({ ...v, email: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                  className="input input-bordered w-full"
                  type="password"
                  placeholder="At least 6 chars"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser((v) => ({ ...v, password: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone (Optional)</label>
                <input
                  className="input input-bordered w-full"
                  placeholder="Contact number"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser((v) => ({ ...v, phone: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">System Role</label>
                <select
                  className="select select-bordered w-full"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser((v) => ({ ...v, role: e.target.value }))
                  }
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              {newUser.role === "student" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Academic Year & Section</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="select select-bordered w-full"
                        value={newUser.batch}
                        onChange={(e) => {
                          const newBatch = e.target.value;
                          setNewUser((v) => ({
                            ...v,
                            batch: newBatch,
                            classOrBatch: newBatch && v.section ? `${newBatch} - ${v.section}` : "",
                          }));
                        }}
                      >
                        <option value="">Year</option>
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
                            classOrBatch: v.batch && newSection ? `${v.batch} - ${newSection}` : "",
                          }));
                        }}
                      >
                        <option value="">Section</option>
                        <option value="E1">Section E1</option>
                        <option value="E2">Section E2</option>
                        <option value="M1">Section M1</option>
                        <option value="M2">Section M2</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Enrollment Number</label>
                    <input
                      className="input input-bordered w-full"
                      placeholder="e.g., 2024CS001"
                      value={newUser.enrollment}
                      onChange={(e) =>
                        setNewUser((v) => ({ ...v, enrollment: e.target.value }))
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-slate-700">Teachable Sections (Comma separated)</label>
                  <input
                    className="input input-bordered w-full"
                    placeholder="e.g., E1, E2, M1"
                    value={newUser.sections?.join(", ") || ""}
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
                </div>
              )}

              <div className="lg:col-span-1">
                <button
                  className="btn btn-primary w-full shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={handleRegister}
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
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register User</span>
                  )}
                </button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Search Accounts</label>
            <input
              type="text"
              placeholder="Search by name, email, enrollment..."
              className="input input-bordered w-full bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Filter Assigned Context</label>
            <select
              className="select select-bordered w-full bg-white"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Academic Roles</option>
              <option value="teacher">Teaching Assignments Only</option>
              <option value="student">Mentorship Assignments Only</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-outline btn-primary flex-1"
              onClick={() => {
                setSearchTerm("");
                setFilterRole("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Section */}
      <Section title="Faculty & Teaching Mentors" icon="👨‍🏫">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="table w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="font-semibold text-slate-700">Name</th>
                <th className="font-semibold text-slate-700">Email</th>
                <th className="font-semibold text-slate-700">Phone</th>
                <th className="font-semibold text-slate-700">Assignments & Mentorship</th>
                <th className="font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let list = teachers;
                if (filterRole === "teacher") {
                  list = teachers.filter(
                    (t) =>
                      t.teacherAssignments?.some((a) => a.role === "teaching") &&
                      (!t.mentorship || !t.mentorship.classOrBatch)
                  );
                } else if (filterRole === "student") {
                  list = teachers.filter(
                    (t) =>
                      t.mentorship?.classOrBatch &&
                      (!t.teacherAssignments || !t.teacherAssignments.some((a) => a.role === "teaching"))
                  );
                }

                if (searchTerm) {
                  const term = searchTerm.toLowerCase();
                  list = list.filter(
                    (t) =>
                      t.name.toLowerCase().includes(term) ||
                      t.email.toLowerCase().includes(term)
                  );
                }

                if (list.length === 0) {
                  return (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400 italic">
                        No faculty members found matching your search.
                      </td>
                    </tr>
                  );
                }

                const displayed = showAllTeachers ? list : list.slice(0, 10);

                return displayed.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                    <td>
                      {editingUser?._id === t._id ? (
                        <input
                          className="input input-bordered input-sm w-full"
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        />
                      ) : (
                        <div className="font-semibold text-slate-800">{t.name}</div>
                      )}
                    </td>
                    <td>
                      {editingUser?._id === t._id ? (
                        <input
                          className="input input-bordered input-sm w-full"
                          value={editForm.email}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        />
                      ) : (
                        <div className="text-slate-600 font-medium">{t.email}</div>
                      )}
                    </td>
                    <td>
                      {editingUser?._id === t._id ? (
                        <input
                          className="input input-bordered input-sm w-full"
                          value={editForm.phone}
                          onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                        />
                      ) : (
                        <div className="text-slate-600">{t.phone || "N/A"}</div>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-3 items-center">
                        {/* Teaching assignments */}
                        {t.teacherAssignments?.filter((a) => a.role === "teaching").length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 block">Teaching</span>
                            <div className="flex flex-wrap gap-1">
                              {t.teacherAssignments
                                .filter((a) => a.role === "teaching")
                                .map((a, idx) => (
                                  <span key={idx} className="badge badge-sm badge-info gap-1 py-2 font-medium">
                                    {a.classOrBatch} • {a.subjectName}
                                    <button
                                      className="text-red-500 font-bold ml-1 hover:text-red-700"
                                      onClick={() => removeTeacherAssignment(t._id, t.teacherAssignments.indexOf(a))}
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Mentorship assignment */}
                        {t.mentorship?.classOrBatch && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-500 block">Mentorship</span>
                            <span className="badge badge-sm badge-secondary gap-1 py-2 font-medium">
                              {t.mentorship.classOrBatch}
                              <button
                                className="text-red-500 font-bold ml-1 hover:text-red-700"
                                onClick={() => removeMentorship(t._id)}
                              >
                                ✕
                              </button>
                            </span>
                          </div>
                        )}

                        {!t.teacherAssignments?.length && !t.mentorship?.classOrBatch && (
                          <span className="text-xs text-slate-400 italic">No assigned classes</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {editingUser?._id === t._id ? (
                          <>
                            <button className="btn btn-xs btn-success text-white" onClick={handleSaveEdit}>Save</button>
                            <button className="btn btn-xs btn-ghost" onClick={handleCancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-xs btn-outline" onClick={() => startEditUser(t)}>Edit</button>
                            <button className="btn btn-xs btn-primary text-white" onClick={() => startAssignTeacher(t)}>Assign</button>
                            <button
                              className="btn btn-xs btn-secondary text-white"
                              onClick={() => {
                                setAssigningTeacher(t);
                                setShowMentorshipForm(true);
                                setMentorshipForm({ year: "", section: "", description: "" });
                              }}
                            >
                              Mentor
                            </button>
                            <button className="btn btn-xs btn-error text-white" onClick={() => deleteUser(t._id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination Trigger */}
        {(() => {
          let list = teachers;
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter((t) => t.name.toLowerCase().includes(term) || t.email.toLowerCase().includes(term));
          }
          return list.length > 10 ? (
            <div className="mt-4 flex justify-center">
              <button
                className="btn btn-sm btn-outline btn-primary"
                onClick={() => setShowAllTeachers(!showAllTeachers)}
              >
                {showAllTeachers ? "Show Less" : `Show All Teachers (${list.length})`}
              </button>
            </div>
          ) : null;
        })()}
      </Section>

      {/* Students Section */}
      <Section title="Students & Enrolled Batches" icon="👨‍🎓">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="table w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="font-semibold text-slate-700">Name</th>
                <th className="font-semibold text-slate-700">Email</th>
                <th className="font-semibold text-slate-700">Enrollment</th>
                <th className="font-semibold text-slate-700">Phone</th>
                <th className="font-semibold text-slate-700">Assigned Class</th>
                <th className="font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let list = students;
                if (searchTerm) {
                  const term = searchTerm.toLowerCase();
                  list = list.filter(
                    (s) =>
                      s.name.toLowerCase().includes(term) ||
                      s.email.toLowerCase().includes(term) ||
                      s.enrollment?.toLowerCase().includes(term)
                  );
                }

                if (list.length === 0) {
                  return (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400 italic">
                        No students found matching your search criteria.
                      </td>
                    </tr>
                  );
                }

                const displayed = showAllStudents ? list : list.slice(0, 10);

                return displayed.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                    <td>
                      {editingUser?._id === s._id ? (
                        <input
                          className="input input-bordered input-sm w-full"
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        />
                      ) : (
                        <div className="font-semibold text-slate-800">{s.name}</div>
                      )}
                    </td>
                    <td>
                      {editingUser?._id === s._id ? (
                        <input
                          className="input input-bordered input-sm w-full"
                          value={editForm.email}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        />
                      ) : (
                        <div className="text-slate-600 font-medium">{s.email}</div>
                      )}
                    </td>
                    <td>
                      {editingUser?._id === s._id ? (
                        <input
                          className="input input-bordered input-sm w-full"
                          value={editForm.enrollment}
                          onChange={(e) => setEditForm((f) => ({ ...f, enrollment: e.target.value }))}
                        />
                      ) : (
                        <div className="text-slate-600 font-mono font-medium">{s.enrollment || "N/A"}</div>
                      )}
                    </td>
                    <td>
                      {editingUser?._id === s._id ? (
                        <input
                          className="input input-bordered input-sm w-full"
                          value={editForm.phone}
                          onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                        />
                      ) : (
                        <div className="text-slate-600">{s.phone || "N/A"}</div>
                      )}
                    </td>
                    <td>
                      {editingUser?._id === s._id ? (
                        <div className="flex gap-2">
                          <select
                            className="select select-bordered select-sm w-full"
                            value={editForm.batch}
                            onChange={(e) => setEditForm((f) => ({ ...f, batch: e.target.value }))}
                          >
                            <option value="">Year</option>
                            <option value="1st year">1st Year</option>
                            <option value="2nd year">2nd Year</option>
                            <option value="3rd year">3rd Year</option>
                          </select>
                          <select
                            className="select select-bordered select-sm w-full"
                            value={editForm.section}
                            onChange={(e) => setEditForm((f) => ({ ...f, section: e.target.value }))}
                          >
                            <option value="">Section</option>
                            <option value="E1">E1</option>
                            <option value="E2">E2</option>
                            <option value="M1">M1</option>
                            <option value="M2">M2</option>
                          </select>
                        </div>
                      ) : (
                        <span className="badge badge-ghost font-medium">
                          {s.batch && s.section ? `${s.batch} ${s.section}` : s.classOrBatch || "Unassigned"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {editingUser?._id === s._id ? (
                          <>
                            <button className="btn btn-xs btn-success text-white" onClick={handleSaveEdit}>Save</button>
                            <button className="btn btn-xs btn-ghost" onClick={handleCancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-xs btn-outline" onClick={() => startEditUser(s)}>Edit</button>
                            <button className="btn btn-xs btn-error text-white" onClick={() => deleteUser(s._id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination Trigger */}
        {(() => {
          let list = students;
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter((s) => s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || s.enrollment?.toLowerCase().includes(term));
          }
          return list.length > 10 ? (
            <div className="mt-4 flex justify-center">
              <button
                className="btn btn-sm btn-outline btn-primary"
                onClick={() => setShowAllStudents(!showAllStudents)}
              >
                {showAllStudents ? "Show Less" : `Show All Students (${list.length})`}
              </button>
            </div>
          ) : null;
        })()}
      </Section>

      {/* Teacher Assignment Modal */}
      {assigningTeacher && !showMentorshipForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-md shadow-2xl border border-slate-100 animate-scale-in">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Assign Course
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Configure class and course assignments for <span className="font-semibold text-slate-700">{assigningTeacher.name}</span>.
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Academic Year</label>
                <select
                  className="select select-bordered w-full"
                  value={newAssignment.year}
                  onChange={(e) =>
                    setNewAssignment((prev) => ({
                      ...prev,
                      year: e.target.value,
                      subjectId: "", // Reset subject
                    }))
                  }
                >
                  <option value="">Select Year</option>
                  <option value="1st year">1st Year</option>
                  <option value="2nd year">2nd Year</option>
                  <option value="3rd year">3rd Year</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Section</label>
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Subject</label>
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
                      .filter((subject) => subject.year === newAssignment.year)
                      .map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name} ({subject.code})
                        </option>
                      ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Assignment Role</label>
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
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button className="btn btn-ghost" onClick={cancelAssignTeacher}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAssignTeacher}
                  disabled={!newAssignment.year || !newAssignment.section || !newAssignment.subjectId}
                >
                  Assign Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentorship Assignment Modal */}
      {assigningTeacher && showMentorshipForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-md shadow-2xl border border-slate-100 animate-scale-in">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Assign Mentor Section
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Configure a dedicated mentorship batch for <span className="font-semibold text-slate-700">{assigningTeacher.name}</span>.
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Academic Year</label>
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Section</label>
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Mentorship Notes (Optional)</label>
                <textarea
                  className="textarea textarea-bordered w-full h-20"
                  placeholder="e.g., Lead academic counseling and performance tracking."
                  value={mentorshipForm.description}
                  onChange={(e) =>
                    setMentorshipForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button className="btn btn-ghost" onClick={cancelAssignTeacher}>
                  Cancel
                </button>
                <button
                  className="btn btn-secondary text-white"
                  onClick={handleAssignMentorship}
                  disabled={!mentorshipForm.year || !mentorshipForm.section}
                >
                  Assign Mentor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
