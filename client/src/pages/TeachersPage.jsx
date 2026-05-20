import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../AuthContext";
import DataTable from "../components/DataTable";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
} from "lucide-react";

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/users?role=teacher");
      setTeachers(response.data || []);
    } catch (error) {
      console.error("Error loading teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
    });
    setShowAddModal(true);
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: "teacher",
        phone: formData.phone?.trim() || "",
      };

      await api.post("/admin/users", userData);
      toast.success("Teacher added successfully!");
      setShowAddModal(false);
      await loadTeachers();
    } catch (error) {
      const message = error.response?.data?.error || "Failed to add teacher";
      toast.error(message);
      console.error("Error adding teacher:", error);
    }
  };

  const handleEditTeacher = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || "",
      };

      await api.put(`/admin/users/${editingTeacher._id}`, updateData);
      toast.success("Teacher updated successfully!");
      setShowEditModal(false);
      await loadTeachers();
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to update teacher";
      toast.error(message);
      console.error("Error updating teacher:", error);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await api.delete(`/admin/users/${teacherId}`);
        toast.success("Teacher deleted successfully!");
        await loadTeachers();
      } catch (error) {
        const message =
          error.response?.data?.error || "Failed to delete teacher";
        toast.error(message);
        console.error("Error deleting teacher:", error);
      }
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const query = searchQuery.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(query) ||
      teacher.email.toLowerCase().includes(query)
    );
  });

  const tableColumns = [
    {
      header: "Name",
      accessor: "name",
      width: "200px",
    },
    {
      header: "Email",
      accessor: "email",
      width: "250px",
    },
    {
      header: "Phone",
      accessor: "phone",
      width: "130px",
      render: (value) => value || "—",
    },
    {
      header: "Actions",
      width: "120px",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => handleDeleteTeacher(row._id)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
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
                {editingTeacher ? "Update" : "Add"}
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
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Teacher Management
            </h1>
            <p className="text-sm text-slate-600">
              Manage teacher profiles and assignments
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Teacher
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-600">Loading teachers...</div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <DataTable
              columns={tableColumns}
              data={filteredTeachers}
              isLoading={isLoading}
              emptyMessage="No teachers found"
            />
          </div>
        )}

        {/* Modals */}
        <Modal
          title="Add New Teacher"
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTeacher}
        >
          <FormField
            label="Full Name"
            name="name"
            required
            placeholder="Jane Smith"
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            required
            placeholder="jane@example.com"
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            required
            placeholder="Minimum 6 characters"
          />
          <FormField
            label="Phone (Optional)"
            name="phone"
            type="tel"
            placeholder="+91 9876543210"
          />
        </Modal>

        <Modal
          title="Edit Teacher"
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditTeacher}
        >
          <FormField
            label="Full Name"
            name="name"
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            required
          />
          <FormField
            label="Phone (Optional)"
            name="phone"
            type="tel"
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
