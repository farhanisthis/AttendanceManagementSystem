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

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    enrollment: "",
    batch: "",
    section: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/users?role=student");
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      name: "",
      email: "",
      enrollment: "",
      batch: "",
      section: "",
      phone: "",
      password: "",
    });
    setShowAddModal(true);
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      enrollment: student.enrollment,
      batch: student.batch,
      section: student.section,
      phone: student.phone || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: "student",
        phone: formData.phone?.trim() || "",
        enrollment: formData.enrollment.trim(),
        batch: formData.batch.trim(),
        section: formData.section.trim(),
        classOrBatch: `${formData.batch.trim()} - ${formData.section.trim()}`,
      };

      await api.post("/admin/users", userData);
      toast.success("Student added successfully!");
      setShowAddModal(false);
      await loadStudents();
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to add student";
      toast.error(message);
      console.error("Error adding student:", error);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || "",
        enrollment: formData.enrollment.trim(),
        batch: formData.batch.trim(),
        section: formData.section.trim(),
        classOrBatch: `${formData.batch.trim()} - ${formData.section.trim()}`,
      };

      await api.put(`/admin/users/${editingStudent._id}`, updateData);
      toast.success("Student updated successfully!");
      setShowEditModal(false);
      await loadStudents();
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to update student";
      toast.error(message);
      console.error("Error updating student:", error);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`/admin/users/${studentId}`);
        toast.success("Student deleted successfully!");
        await loadStudents();
      } catch (error) {
        const message =
          error.response?.data?.error || "Failed to delete student";
        toast.error(message);
        console.error("Error deleting student:", error);
      }
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.enrollment.toLowerCase().includes(query)
    );
  });

  const tableColumns = [
    {
      header: "Name",
      accessor: "name",
      width: "180px",
    },
    {
      header: "Email",
      accessor: "email",
      width: "200px",
    },
    {
      header: "Enrollment",
      accessor: "enrollment",
      width: "120px",
    },
    {
      header: "Batch",
      accessor: "batch",
      width: "100px",
    },
    {
      header: "Section",
      accessor: "section",
      width: "100px",
    },
    {
      header: "Phone",
      accessor: "phone",
      width: "120px",
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
            onClick={() => handleDeleteStudent(row._id)}
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
                {editingStudent ? "Update" : "Add"}
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
              Student Management
            </h1>
            <p className="text-sm text-slate-600">
              Manage student records, enrollment, and batch assignments
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Student
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or enrollment number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-600">Loading students...</div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <DataTable
              columns={tableColumns}
              data={filteredStudents}
              isLoading={isLoading}
              emptyMessage="No students found"
            />
          </div>
        )}

        {/* Modals */}
        <Modal
          title="Add New Student"
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStudent}
        >
          <FormField
            label="Full Name"
            name="name"
            required
            placeholder="John Doe"
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            required
            placeholder="john@example.com"
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            required
            placeholder="Minimum 6 characters"
          />
          <FormField
            label="Enrollment Number"
            name="enrollment"
            required
            placeholder="ENR001"
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Batch"
              name="batch"
              required
              placeholder="2024"
            />
            <FormField
              label="Section"
              name="section"
              required
              placeholder="A"
            />
          </div>
          <FormField
            label="Phone (Optional)"
            name="phone"
            type="tel"
            placeholder="+91 9876543210"
          />
        </Modal>

        <Modal
          title="Edit Student"
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditStudent}
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
            label="Enrollment Number"
            name="enrollment"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Batch"
              name="batch"
              required
            />
            <FormField
              label="Section"
              name="section"
              required
            />
          </div>
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
