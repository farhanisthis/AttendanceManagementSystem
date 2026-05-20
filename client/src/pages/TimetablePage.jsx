import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import { useAuth } from "../AuthContext";
import { Plus, Trash2 } from "lucide-react";

export default function TimetablePage() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/admin/timetable");
      setTimetable(data);
    } catch (error) {
      toast.error("Failed to load timetable");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await api.delete(`/admin/timetable/${slotId}`);
        toast.success("Slot deleted successfully");
        await loadTimetable();
      } catch (error) {
        toast.error("Failed to delete slot");
        console.error(error);
      }
    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const columns = [
    { key: "classOrBatch", label: "Class/Batch", sortable: true },
    {
      key: "dayOfWeek",
      label: "Day",
      sortable: true,
      render: (val) => days[val - 1] || val,
    },
    { key: "startTime", label: "Start Time", sortable: true },
    { key: "endTime", label: "End Time", sortable: true },
    { key: "slotType", label: "Type", sortable: true },
    { key: "room", label: "Room", sortable: true, render: (val) => val || "-" },
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
            <h1 className="text-3xl font-bold text-slate-900">Timetable</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage class schedule and timetable slots
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Slot
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-600">Loading timetable...</div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={timetable}
            actions={actions}
            searchPlaceholder="Search by class, day, or room..."
            itemsPerPage={15}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
