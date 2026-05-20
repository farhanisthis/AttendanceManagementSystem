import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../AuthContext";
import DataTable from "../components/DataTable";
import { Download, Search } from "lucide-react";

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/attendance");
      setAttendance(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading attendance:", error);
      toast.error("Failed to load attendance data");
      setAttendance([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const query = searchQuery.toLowerCase();
    return (
      record.date?.toLowerCase().includes(query) ||
      record.classOrBatch?.toLowerCase().includes(query)
    );
  });

  const tableColumns = [
    {
      header: "Date",
      accessor: "date",
      width: "120px",
    },
    {
      header: "Class/Batch",
      accessor: "classOrBatch",
      width: "150px",
    },
    {
      header: "Present",
      accessor: "records",
      width: "100px",
      render: (records) => {
        const present = records?.filter((r) => r.status === "present").length || 0;
        return <span className="font-semibold text-green-600">{present}</span>;
      },
    },
    {
      header: "Absent",
      accessor: "records",
      width: "100px",
      render: (records) => {
        const absent = records?.filter((r) => r.status === "absent").length || 0;
        return <span className="font-semibold text-red-600">{absent}</span>;
      },
    },
    {
      header: "Total",
      accessor: "records",
      width: "100px",
      render: (records) => {
        const total = records?.length || 0;
        return <span className="font-semibold text-slate-900">{total}</span>;
      },
    },
    {
      header: "Attendance %",
      accessor: "records",
      width: "120px",
      render: (records) => {
        if (!records || records.length === 0) return "—";
        const present = records.filter((r) => r.status === "present").length;
        const percentage = Math.round((present / records.length) * 100);
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full ${
                  percentage >= 75 ? "bg-green-500" : "bg-yellow-500"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium">{percentage}%</span>
          </div>
        );
      },
    },
  ];

  const handleExport = () => {
    try {
      const csvContent = [
        ["Date", "Class/Batch", "Present", "Absent", "Total", "Attendance %"],
        ...filteredAttendance.map((record) => {
          const present =
            record.records?.filter((r) => r.status === "present").length || 0;
          const absent =
            record.records?.filter((r) => r.status === "absent").length || 0;
          const total = record.records?.length || 0;
          const percentage =
            total > 0 ? Math.round((present / total) * 100) : 0;
          return [
            record.date,
            record.classOrBatch,
            present,
            absent,
            total,
            `${percentage}%`,
          ];
        }),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
      console.error("Export error:", error);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Attendance Analytics
            </h1>
            <p className="text-sm text-slate-600">
              View and analyze attendance records across classes
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by date or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-600">Loading attendance...</div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <DataTable
              columns={tableColumns}
              data={filteredAttendance}
              isLoading={isLoading}
              emptyMessage="No attendance records found"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
