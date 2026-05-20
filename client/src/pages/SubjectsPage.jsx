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

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    year: "1",
    semester: "1",
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/subjects");
      setSubjects(response.data || []);
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast.error("Failed to load subjects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      name: "",
      code: "",
      year: "1",
      semester: "1",
    });
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/subjects", formData);
      toast.success("Subject added successfully!");
      setShowAddModal(false);
      await loadSubjects();
    } catch (error) {
      const message = error.response?.data?.error || "Failed to add subject";
      toast.error(message);
      console.error("Error adding subject:", error);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await api.delete(`/admin/subjects/${subjectId}`);
        toast.success("Subject deleted successfully!");
        await loadSubjects();
      } catch (error) {
        const message =
          error.response?.data?.error || "Failed to delete subject";
        toast.error(message);
        console.error("Error deleting subject:", error);
      }
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const query = searchQuery.toLowerCase();
    return (
      subject.name.toLowerCase().includes(query) ||
      subject.code.toLowerCase().includes(query)
    );
  });

  const tableColumns = [
    {
      header: "Subject Name",
      accessor: "name",
      width: "200px",
    },
    {
      header: "Code",
      accessor: "code",
      width: "100px",
    },
    {
      header: "Year",
      accessor: "year",
      width: "80px",
    },
    {
      header: "Semester",
      accessor: "semester",
      width: "100px",
    },
    {
      header: "Actions",
      width: "100px",
      render: (_, row) => (
        <button
          onClick={() => handleDeleteSubject(row._id)}
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
        <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
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

  const FormField = ({ label, name, type = "text", required, ...props }) => (
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
          {props.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
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
              Subject Management
            </h1>
            <p className="text-sm text-slate-600">
              Create and manage academic subjects
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Subject
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-600">Loading subjects...</div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <DataTable
              columns={tableColumns}
              data={filteredSubjects}
              isLoading={isLoading}
              emptyMessage="No subjects found"
            />
          </div>
        )}

        {/* Modal */}
        <Modal
          title="Add New Subject"
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubject}
        >
          <FormField
            label="Subject Name"
            name="name"
            required
            placeholder="Mathematics"
          />
          <FormField
            label="Subject Code"
            name="code"
            required
            placeholder="MATH101"
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Year"
              name="year"
              type="select"
              required
              options={["1", "2", "3", "4"]}
            />
            <FormField
              label="Semester"
              name="semester"
              type="select"
              required
              options={["1", "2"]}
            />
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
