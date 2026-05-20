import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import { useAuth } from "../AuthContext";
import { Plus, Trash2 } from "lucide-react";

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/admin/subjects");
      setSubjects(data);
    } catch (error) {
      toast.error("Failed to load subjects");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await api.delete(`/admin/subjects/${subjectId}`);
        toast.success("Subject deleted successfully");
        await loadSubjects();
      } catch (error) {
        toast.error("Failed to delete subject");
        console.error(error);
      }
    }
  };

  const columns = [
    { key: "name", label: "Subject Name", sortable: true },
    { key: "code", label: "Code", sortable: true },
    { key: "year", label: "Year", sortable: true },
    { key: "semester", label: "Semester", sortable: true },
  ];

  const actions = [
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
            <h1 className="text-3xl font-bold text-slate-900">Subjects</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage academic subjects and courses
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Subject
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-600">Loading subjects...</div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={subjects}
            actions={actions}
            searchPlaceholder="Search by name or code..."
            itemsPerPage={15}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
