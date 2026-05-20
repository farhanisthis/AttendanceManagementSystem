import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PanelLeftClose,
  PanelLeft,
  X,
  Home,
  Users,
  BookOpen,
  Clock,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function Sidebar({
  userRole,
  onLogout,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) {
  const location = useLocation();

  const isActive = (item) => {
    return item.path === location.pathname;
  };

  const menuItems = {
    admin: [
      {
        label: "Dashboard",
        icon: Home,
        path: "/admin",
      },
      {
        label: "Students",
        icon: Users,
        path: "/admin/students",
      },
      {
        label: "Teachers",
        icon: Users,
        path: "/admin/teachers",
      },
      {
        label: "Subjects",
        icon: BookOpen,
        path: "/admin/subjects",
      },
      {
        label: "Timetable",
        icon: Clock,
        path: "/admin/timetable",
      },
      {
        label: "Attendance",
        icon: BarChart3,
        path: "/admin/attendance",
      },
    ],
    teacher: [
      {
        label: "Dashboard",
        icon: Home,
        path: "/teacher",
      },
      {
        label: "Classes",
        icon: Users,
        path: "/teacher/classes",
      },
      {
        label: "Attendance",
        icon: BarChart3,
        path: "/teacher/attendance",
      },
      {
        label: "Schedule",
        icon: Clock,
        path: "/teacher/schedule",
      },
    ],
    student: [
      {
        label: "Dashboard",
        icon: Home,
        path: "/student",
      },
      {
        label: "My Schedule",
        icon: Clock,
        path: "/student/schedule",
      },
      {
        label: "Attendance",
        icon: BarChart3,
        path: "/student/attendance",
      },
    ],
  };

  const items = menuItems[userRole] || menuItems.student;

  return (
    <>
      {isMobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-700 bg-slate-900 text-slate-200 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-700 px-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-sm font-bold text-white">
              A
            </div>
            {!isCollapsed && (
              <span className="truncate text-sm font-semibold tracking-wide text-slate-100">
                AttendEase
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="hidden rounded-md p-1.5 text-slate-300 hover:bg-slate-800 lg:inline-flex"
              aria-label="Toggle sidebar width"
            >
              {isCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={onCloseMobile}
              className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {!isCollapsed && (
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Workspace
            </p>
          )}

          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <div key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => onCloseMobile?.()}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-all duration-200 ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-slate-700 p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-950/40 hover:text-red-200"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
