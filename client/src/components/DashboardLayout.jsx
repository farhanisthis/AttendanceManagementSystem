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
    <div className="min-h-screen bg-slate-950">
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

        <main className="px-4 py-6 md:px-8 md:py-8 bg-gradient-to-br from-slate-950 to-slate-900 min-h-[calc(100vh-56px)]">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
