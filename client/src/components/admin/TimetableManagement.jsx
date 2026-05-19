import React, { useState } from "react";
import Section from "../Section";
import { timeSlots } from "../../utils/subjectHelper";

export default function TimetableManagement({
  teachers,
  subjects,
  timetable,
  addBulkSlots,
  addSlot,
  deleteSlot,
}) {
  // Selection states
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Bulk add slots state
  const [bulkSlots, setBulkSlots] = useState([]);

  // Single slot state
  const [newSlot, setNewSlot] = useState({
    subject: "",
    day: "",
    startTime: "",
    endTime: "",
    slotType: "theory",
    room: "",
  });

  // Helpers for bulk slots
  const handleAddBulkSlot = () => {
    setBulkSlots([
      ...bulkSlots,
      {
        subjectId: "",
        dayOfWeek: 1,
        startTime: "10:30",
        endTime: "11:30",
        slotType: "theory",
        room: "",
        batch: selectedBatch,
        section: selectedSection,
      },
    ]);
  };

  const handleRemoveBulkSlot = (index) => {
    setBulkSlots(bulkSlots.filter((_, i) => i !== index));
  };

  const handleUpdateBulkSlot = (index, field, value) => {
    const updated = [...bulkSlots];
    updated[index][field] = value;
    setBulkSlots(updated);
  };

  const handleAddAllBulkSlots = async () => {
    const success = await addBulkSlots(selectedTeacher, selectedBatch, selectedSection, bulkSlots);
    if (success) {
      setBulkSlots([]);
    }
  };

  const handleAddSingleSlot = async () => {
    const success = await addSlot(selectedTeacher, selectedBatch, selectedSection, newSlot);
    if (success) {
      setNewSlot({
        subject: "",
        day: "",
        startTime: "",
        endTime: "",
        slotType: "theory",
        room: "",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Selection Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-md font-bold text-slate-800 mb-4">Select Target Schedule Path</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Assign to Lecturer</label>
            <select
              className="select select-bordered w-full bg-white"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">Select Lecturer</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Academic Year</label>
            <select
              className="select select-bordered w-full bg-white"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">Select Year</option>
              <option value="1st year">1st Year</option>
              <option value="2nd year">2nd Year</option>
              <option value="3rd year">3rd Year</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Section Group</label>
            <select
              className="select select-bordered w-full bg-white"
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
        </div>
      </div>

      {selectedTeacher && selectedBatch && selectedSection ? (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Bulk Time Slot Creation */}
          <Section title="Bulk Class Scheduling" icon="📅">
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs font-medium text-slate-500">
                  Bulk Schedule Slots ({bulkSlots.length} active)
                </span>
                <button className="btn btn-sm btn-outline btn-primary" onClick={handleAddBulkSlot}>
                  + Add Grid Row
                </button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {bulkSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 shadow-sm hover:border-slate-300 transition-colors"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Subject</label>
                        <select
                          className="select select-bordered select-sm w-full bg-white"
                          value={slot.subjectId}
                          onChange={(e) => handleUpdateBulkSlot(index, "subjectId", e.target.value)}
                        >
                          <option value="">Choose Course</option>
                          {subjects
                            .filter((s) => s.year === selectedBatch)
                            .map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Week Day</label>
                        <select
                          className="select select-bordered select-sm w-full bg-white"
                          value={slot.dayOfWeek}
                          onChange={(e) => handleUpdateBulkSlot(index, "dayOfWeek", e.target.value)}
                        >
                          <option value="1">Monday</option>
                          <option value="2">Tuesday</option>
                          <option value="3">Wednesday</option>
                          <option value="4">Thursday</option>
                          <option value="5">Friday</option>
                          <option value="6">Saturday</option>
                          <option value="0">Sunday</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Period Time</label>
                        <select
                          className="select select-bordered select-sm w-full bg-white"
                          value={
                            timeSlots.find((ts) => ts.startTime === slot.startTime && ts.endTime === slot.endTime)
                              ?.label || ""
                          }
                          onChange={(e) => {
                            const selectedSlot = timeSlots.find((ts) => ts.label === e.target.value);
                            if (selectedSlot) {
                              handleUpdateBulkSlot(index, "startTime", selectedSlot.startTime);
                              handleUpdateBulkSlot(index, "endTime", selectedSlot.endTime);
                            }
                          }}
                        >
                          <option value="">Time Slot</option>
                          {timeSlots.map((ts) => (
                            <option key={ts.label} value={ts.label}>
                              {ts.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Session Type</label>
                        <select
                          className="select select-bordered select-sm w-full bg-white"
                          value={slot.slotType}
                          onChange={(e) => handleUpdateBulkSlot(index, "slotType", e.target.value)}
                        >
                          <option value="theory">Theory Lecture</option>
                          <option value="lab">Practical Lab</option>
                          <option value="tutorial">Tutorial Session</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Classroom</label>
                        <input
                          className="input input-bordered input-sm w-full bg-white"
                          placeholder="Room #"
                          value={slot.room}
                          onChange={(e) => handleUpdateBulkSlot(index, "room", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button className="btn btn-xs btn-error text-white gap-1" onClick={() => handleRemoveBulkSlot(index)}>
                        ✕ Delete Row
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {bulkSlots.length > 0 ? (
                <button className="btn btn-primary w-full shadow-md hover:shadow-lg" onClick={handleAddAllBulkSlots}>
                  📅 Commit Bulk Schedule Slots
                </button>
              ) : (
                <div className="text-center py-8 text-slate-400 italic text-sm">
                  Add grid rows above to generate bulk schedule items.
                </div>
              )}
            </div>
          </Section>

          {/* Single Slot Creation */}
          <Section title="Single Period Scheduler" icon="➕">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Select Subject Course</label>
                <select
                  className="select select-bordered w-full"
                  value={newSlot.subject}
                  onChange={(e) => setNewSlot((prev) => ({ ...prev, subject: e.target.value }))}
                >
                  <option value="">Choose Course</option>
                  {subjects
                    .filter((s) => s.year === selectedBatch)
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Weekday</label>
                  <select
                    className="select select-bordered w-full"
                    value={newSlot.day}
                    onChange={(e) => setNewSlot((prev) => ({ ...prev, day: e.target.value }))}
                  >
                    <option value="">Choose Day</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Time Interval Slot</label>
                  <select
                    className="select select-bordered w-full"
                    value={
                      timeSlots.find((ts) => ts.startTime === newSlot.startTime && ts.endTime === newSlot.endTime)
                        ?.label || ""
                    }
                    onChange={(e) => {
                      const selectedSlot = timeSlots.find((ts) => ts.label === e.target.value);
                      if (selectedSlot) {
                        setNewSlot((prev) => ({
                          ...prev,
                          startTime: selectedSlot.startTime,
                          endTime: selectedSlot.endTime,
                        }));
                      }
                    }}
                  >
                    <option value="">Select Time Interval</option>
                    {timeSlots.map((ts) => (
                      <option key={ts.label} value={ts.label}>
                        {ts.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Lecture Room (Optional)</label>
                  <select
                    className="select select-bordered w-full"
                    value={newSlot.room}
                    onChange={(e) => setNewSlot((prev) => ({ ...prev, room: e.target.value }))}
                  >
                    <option value="">Select Room (Optional)</option>
                    {["111", "112", "114", "115", "211", "212", "214", "215", "311", "312", "314", "315", "411", "412", "414", "415", "511", "512", "514", "515"].map(
                      (r) => (
                        <option key={r} value={r}>
                          Room {r}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Session Setup</label>
                  <select
                    className="select select-bordered w-full"
                    value={newSlot.slotType}
                    onChange={(e) => setNewSlot((prev) => ({ ...prev, slotType: e.target.value }))}
                  >
                    <option value="theory">Theory Lecture</option>
                    <option value="lab">Practical Lab</option>
                    <option value="tutorial">Tutorial Session</option>
                  </select>
                </div>
              </div>

              <button
                className="btn btn-primary w-full mt-2"
                onClick={handleAddSingleSlot}
                disabled={!newSlot.subject || !newSlot.day || !newSlot.startTime || !newSlot.endTime}
              >
                ➕ Schedule Single Period
              </button>
            </div>
          </Section>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center text-blue-700">
          💡 Select Lecturer, Year, and Section Group to manage custom course timetables.
        </div>
      )}

      {/* Current Timetable Panel */}
      <Section title="Current Active Timetable" icon="📋">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="table w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="font-semibold text-slate-700">Subject</th>
                <th className="font-semibold text-slate-700">Lecturer</th>
                <th className="font-semibold text-slate-700">Class/Batch</th>
                <th className="font-semibold text-slate-700">Weekday</th>
                <th className="font-semibold text-slate-700">Time Window</th>
                <th className="font-semibold text-slate-700">Type</th>
                <th className="font-semibold text-slate-700">Room</th>
                <th className="font-semibold text-slate-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {timetable.length > 0 ? (
                timetable.map((tt) => (
                  <tr key={tt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="font-semibold text-slate-800">{tt.subjectId?.name}</td>
                    <td className="text-slate-600 font-medium">{tt.teacherId?.name}</td>
                    <td>
                      <span className="badge badge-outline">{tt.classOrBatch}</span>
                    </td>
                    <td className="font-medium text-slate-700">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][tt.dayOfWeek]}
                    </td>
                    <td className="font-mono text-slate-600 text-xs">
                      {tt.startTime} – {tt.endTime}
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm uppercase font-semibold ${
                          tt.slotType === "lab"
                            ? "badge-warning"
                            : tt.slotType === "tutorial"
                            ? "badge-secondary"
                            : "badge-primary"
                        }`}
                      >
                        {tt.slotType || "theory"}
                      </span>
                    </td>
                    <td className="font-semibold text-slate-700">{tt.room || "—"}</td>
                    <td className="text-right">
                      <button
                        className="btn btn-xs btn-error text-white shadow-sm"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this timetable slot?")) {
                            deleteSlot(tt._id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400 italic">
                    No active timetable records found.
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
