import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../AuthContext";
import DataTable from "../components/DataTable";
import {
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

export default function TimetablePage() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    teacherId: "",
    subjectId: "",
    dayOfWeek: "0",
    startTime: "",
    endTime: "",
    slotType: "Lecture",
    room: "",
    classOrBatch: "",
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ttRes, teachRes, subjRes] = await Promise.all([
        api.get("/admin/timetable"),
        api.get("/admin/users?role=teacher"),
        api.get("/admin/subjects"),
      ]);
      setTimetable(ttRes.data || []);
      setTeachers(teachRes.data || []);
      setSubjects(subjRes.data || []);
    } catch (error) {
      console.error("Error loading timetable data:", error);
      toast.error("Failed to load timetable");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      teacherId: "",
      subjectId: "",
      dayOfWeek: "0",
      startTime: "",
      endTime: "",
      slotType: "Lecture",
      room: "",
      classOrBatch: "",
    });
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/timetable", {
        ...formData,
        dayOfWeek: Number(formData.dayOfWeek),
      });
      toast.success("Timetable slot added successfully!");
      setShowAddModal(false);
      await loadData();
    } catch (error) {
      const message = error.response?.data?.error || "Failed to add slot";
      toast.error(message);
      console.error("Error adding slot:", error);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await api.delete(`/admin/timetable/${slotId}`);
        toast.success("Slot deleted successfully!");
        await loadData();
      } catch (error) {
        const message = error.response?.data?.error || "Failed to delete slot";
        toast.error(message);
        console.error("Error deleting slot:", error);
      }
    }
  };

  const filteredTimetable = timetable.filter((slot) => {
    const query = searchQuery.toLowerCase();
    const teacher = teachers.find(t => t._id === slot.teacherId);
    const subject = subjects.find(s => s._id === slot.subjectId);
    return (
      (teacher?.name.toLowerCase().includes(query)) ||
      (subject?.name.toLowerCase().includes(query)) ||
      slot.classOrBatch?.toLowerCase().includes(query) ||
      slot.room?.toLowerCase().includes(query)
    );
  });

  const tableColumns = [
    {
      header: "Teacher",
      accessor: "teacherId",
      width: "150px",
      render: (value) => {
        const teacher = teachers.find(t => t._id === value);
        return teacher?.name || "—";
      },
    },
    {
      header: "Subject",
      accessor: "subjectId",
      width: "150px",
      render: (value) => {
        const subject = subjects.find(s => s._id === value);
        return subject?.name || "—";
      },
    },
    {
      header: "Day",
      accessor: "dayOfWeek",
      width: "100px",
      render: (value) => days[value] || "—",
    },
    {
      header: "Time",
      accessor: "startTime",
      width: "120px",
      render: (_, row) => `${row.startTime} - ${row.endTime}`,
    },
    {
      header: "Class",
      accessor: "classOrBatch",
      width: "100px",
    },
    {
      header: "Room",
      accessor: "room",
      width: "80px",
    },
    {
      header: "Actions",
      width: "100px",
      render: (_, row) => (
        <button
          onClick={() => handleDeleteSlot(row._id)}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      ),
    },
  ];

  const Modal = ({ title, isOpen, onClose, onSubmit, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white shadow-lg max-h-screen overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white">
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4 px-6 py-4">
            {children}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const FormField = ({ label, name, type = "text", required, options, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          required={required}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...props}
        >
          <option value="">Select {label}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          required={required}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...props}
        />
      )}
    </div>
  );

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Timetable Management
            </h1>
            <p className="text-sm text-slate-600">
              Schedule classes and manage timetable slots
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Slot
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by teacher, subject, class, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-600">Loading timetable...</div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <DataTable
              columns={tableColumns}
              data={filteredTimetable}
              isLoading={isLoading}
              emptyMessage="No timetable slots found"
            />
          </div>
        )}

        {/* Modal */}
        <Modal
          title="Add New Timetable Slot"
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSlot}
        >
          <FormField
            label="Teacher"
            name="teacherId"
            type="select"
            required
            options={teachers.map(t => ({ value: t._id, label: t.name }))}
          />
          <FormField
            label="Subject"
            name="subjectId"
            type="select"
            required
            options={subjects.map(s => ({ value: s._id, label: s.name }))}
          />
          <FormField
            label="Day"
            name="dayOfWeek"
            type="select"
            required
            options={days.map((day, idx) => ({ value: String(idx), label: day }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Start Time"
              name="startTime"
              type="time"
              required
            />
            <FormField
              label="End Time"
              name="endTime"
              type="time"
              required
            />
          </div>
          <FormField
            label="Class / Batch"
            name="classOrBatch"
            required
            placeholder="e.g., 2024 - A"
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Room"
              name="room"
              placeholder="e.g., 101"
            />
            <FormField
              label="Type"
              name="slotType"
              type="select"
              options={[
                { value: "Lecture", label: "Lecture" },
                { value: "Practical", label: "Practical" },
                { value: "Seminar", label: "Seminar" },
              ]}
            />
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
            searchPlaceholder="Search by class, day, or room..."
            itemsPerPage={15}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
