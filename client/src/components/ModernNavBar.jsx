import React, { useState } from "react";
import {
  Bell,
  LogOut,
  Menu,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

export default function Navbar({
  user,
  onLogout,
  onMenuToggle,
  onDesktopToggle,
  isSidebarCollapsed,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <nav className="sticky top-0 z-30 flex h-14 items-center border-b border-slate-200 bg-white/98 px-3 backdrop-blur-sm md:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuToggle}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={onDesktopToggle}
            className="hidden rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:inline-flex"
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              Workspace
            </p>
            <p className="text-sm font-semibold text-slate-900">
              Attendance Control Center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-slate-900 leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  {user?.role || "User"}
                </p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
