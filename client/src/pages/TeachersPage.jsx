import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import { useAuth } from "../AuthContext";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/admin/users?role=teacher");
      setTeachers(data);
    } catch (error) {
      toast.error("Failed to load teachers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await api.delete(`/admin/users/${teacherId}`);
        toast.success("Teacher deleted successfully");
        await loadTeachers();
      } catch (error) {
        toast.error("Failed to delete teacher");
        console.error(error);
      }
    }
  };

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      render: (val) => val || "-",
    },
  ];

  const actions = [
    { label: "Edit", icon: Edit2, onClick: () => {} },
    {
      label: "Delete",
      icon: Trash2,
      variant: "danger",
      onClick: (row) => handleDelete(row._id),
    },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Teachers</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage teacher records and assignments
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Teacher
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-600">Loading teachers...</div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={teachers}
            actions={actions}
            searchPlaceholder="Search by name or email..."
            itemsPerPage={15}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
