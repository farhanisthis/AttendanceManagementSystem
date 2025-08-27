import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <span className="text-white text-xl font-bold">🎓</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Smart College
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>

            {/* Role-based Navigation */}
            {user && user.role === "admin" && (
              <Link
                to="/admin"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Admin Dashboard
              </Link>
            )}

            {user && user.role === "teacher" && (
              <Link
                to="/teacher"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Attendance
              </Link>
            )}

            {user && user.role === "student" && (
              <Link
                to="/student"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                My Attendance
              </Link>
            )}

            {!user && (
              <Link
                to="/login"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">
                      {user.name || user.role}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-sm">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow-lg bg-white rounded-xl w-52 border border-slate-200"
                >
                  {/* User Info Section */}
                  {user && (
                    <li className="mb-2">
                      <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">
                            {user.name || user.role}
                          </span>
                          <span className="text-xs text-slate-500 capitalize">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </li>
                  )}

                  <li>
                    <Link
                      to="/"
                      className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      Home
                    </Link>
                  </li>

                  {/* Role-based Mobile Navigation */}
                  {user && user.role === "admin" && (
                    <li>
                      <Link
                        to="/admin"
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  )}

                  {user && user.role === "teacher" && (
                    <li>
                      <Link
                        to="/teacher"
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        Attendance
                      </Link>
                    </li>
                  )}

                  {user && user.role === "student" && (
                    <li>
                      <Link
                        to="/student"
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        My Attendance
                      </Link>
                    </li>
                  )}

                  {!user && (
                    <li>
                      <Link
                        to="/login"
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        Login
                      </Link>
                    </li>
                  )}
                  {user && (
                    <li>
                      <button
                        onClick={logout}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg w-full text-left"
                      >
                        Logout
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
