import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import DataTable from "../components/DataTable";
import { useAuth } from "../AuthContext";
import { Download } from "lucide-react";

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/admin/attendance");
      setAttendance(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load attendance data");
      console.error(error);
      setAttendance([]);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "classOrBatch", label: "Class/Batch", sortable: true },
    {
      key: "records",
      label: "Present/Total",
      render: (records, row) => {
        const present =
          records?.filter((r) => r.status === "present").length || 0;
        const total = records?.length || 0;
        return `${present}/${total}`;
      },
    },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
            <p className="mt-1 text-sm text-slate-600">
              View and analyze attendance records
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-600">Loading attendance...</div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={attendance}
            searchPlaceholder="Search by date or class..."
            itemsPerPage={15}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
