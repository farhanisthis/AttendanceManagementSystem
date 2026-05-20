import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import ModernNavBar from "./ModernNavBar";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children, user }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        userRole={user?.role}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <ModernNavBar
          user={user}
          onLogout={handleLogout}
          onMenuToggle={() => setIsMobileSidebarOpen(true)}
          onDesktopToggle={() => setIsSidebarCollapsed((prev) => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
