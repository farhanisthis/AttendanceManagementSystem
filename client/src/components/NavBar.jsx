import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useState } from "react";

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `font-medium transition-colors duration-200 ${
      isActive(path) ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-slate-900">AttendEase</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={navLinkClass("/")}>
              Home
            </Link>
            <Link to="/login" className={navLinkClass("/login")}>
              Attendance
            </Link>
          </div>

          {/* Right side: user info + login/logout */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                Logout
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 text-slate-600 hover:text-blue-600 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/login"
              className="block px-4 py-2 text-slate-600 hover:text-blue-600 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Attendance
            </Link>
            {user && (
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-red-600 font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
