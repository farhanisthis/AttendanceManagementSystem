import { Outlet, Link } from "react-router-dom";
import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <NavBar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 animate-fade-in">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🎓</span>
                </div>
                <span className="text-lg font-bold text-slate-800">AttendEase</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                A modern attendance management system built for colleges — track, manage, and export attendance effortlessly.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-slate-500 hover:text-blue-600 transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/login" className="text-slate-500 hover:text-blue-600 transition-colors">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="text-slate-500 hover:text-blue-600 transition-colors">Register</Link>
                </li>
              </ul>
            </div>

            {/* Roles */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Portals
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/admin" className="text-slate-500 hover:text-blue-600 transition-colors">Admin Dashboard</Link>
                </li>
                <li>
                  <Link to="/teacher" className="text-slate-500 hover:text-blue-600 transition-colors">Teacher Dashboard</Link>
                </li>
                <li>
                  <Link to="/student" className="text-slate-500 hover:text-blue-600 transition-colors">Student Dashboard</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-8 pt-6 text-center">
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} AttendEase. All rights reserved.
              <span className="mx-2">·</span>
              Developed by Farhan Ali
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
