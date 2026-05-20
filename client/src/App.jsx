import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  Users,
  BookOpen,
  BarChart3,
  ArrowRight,
  Lock,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function Home() {
  const { user, isLoading } = useAuth();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex">
                <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
                  📋 Our Product Institutions
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl font-black leading-tight text-slate-900">
                Smart Attendance
                <br />
                <span className="text-blue-600">Management for</span>
                <br />
                Modern Education
              </h1>

              {/* Description */}
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                Streamline your academic operations with an enterprise-grade
                tracking system. Empower administrators, teachers, and students
                with real-time data.
              </p>

              {/* CTA Buttons */}
              {!isLoading && !user && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    to="/login"
                    className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button className="px-8 py-3.5 bg-white text-slate-900 font-semibold border-2 border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all inline-flex items-center justify-center gap-2">
                    View Features
                  </button>
                </div>
              )}

              {!isLoading && user && (
                <Link
                  to={
                    user.role === "admin"
                      ? "/admin"
                      : user.role === "teacher"
                        ? "/teacher"
                        : "/student"
                  }
                  className="inline-flex px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all gap-2 shadow-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Right - Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-8 border border-blue-100 shadow-2xl">
                <div className="space-y-4">
                  <div className="h-8 bg-blue-200 rounded w-32"></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-blue-100 rounded-lg"></div>
                    <div className="h-20 bg-purple-100 rounded-lg"></div>
                    <div className="h-20 bg-pink-100 rounded-lg"></div>
                  </div>
                  <div className="h-32 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="h-3 bg-blue-200 rounded w-24"></div>
                      <div className="h-2 bg-blue-100 rounded w-32"></div>
                      <div className="h-2 bg-blue-100 rounded w-28"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tailored for Every User Section */}
      <div className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Tailored for Every User
            </h2>
            <p className="text-lg text-slate-600">
              Precision tools designed for the unique needs of educational
              stakeholders.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* For Admins */}
            <div className="group bg-white rounded-xl border border-slate-200 p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                For Admins
              </h3>
              <p className="text-slate-600 mb-6">
                Comprehensive oversight of institutional logistics and
                reporting.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">Management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">Timetables</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">Analytics</span>
                </li>
              </ul>
              <Link
                to="/login"
                className="text-blue-600 font-bold text-sm hover:text-blue-700 uppercase tracking-wide"
              >
                EXPLORE ADMIN PORTAL →
              </Link>
            </div>

            {/* For Teachers */}
            <div className="group bg-white rounded-xl border border-slate-200 p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                For Teachers
              </h3>
              <p className="text-slate-600 mb-6">
                Effortless classroom management and student engagement tracking.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">
                    Efficient marking
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">Schedules</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">Trends</span>
                </li>
              </ul>
              <Link
                to="/login"
                className="text-blue-600 font-bold text-sm hover:text-blue-700 uppercase tracking-wide"
              >
                MARK ATTENDANCE →
              </Link>
            </div>

            {/* For Students */}
            <div className="group bg-white rounded-xl border border-slate-200 p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                For Students
              </h3>
              <p className="text-slate-600 mb-6">
                Self-service access to records and academic performance metrics.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">
                    Status tracking
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">Progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">
                    Notifications
                  </span>
                </li>
              </ul>
              <Link
                to="/login"
                className="text-blue-600 font-bold text-sm hover:text-blue-700 uppercase tracking-wide"
              >
                VIEW MY PROFILE →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Digital Tracking */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 md:p-10 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-3xl md:text-4xl font-black mb-4">
                  Digital Tracking
                </h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Say goodbye to manual errors. Our digital tracking system
                  ensures every record is precise, verifiable, and instantly
                  accessible.
                </p>
              </div>
              <div className="mt-8">
                <span className="text-xs font-bold bg-blue-500 px-3 py-1 rounded-full text-blue-100">
                  100% DIGITAL
                </span>
              </div>
            </div>

            {/* Real-time Updates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
                <Zap className="w-8 h-8 text-blue-600 mb-4" />
                <h4 className="font-bold text-slate-900 mb-2">
                  Real-time Updates
                </h4>
                <p className="text-sm text-slate-600">
                  Instant synchronization across all devices. Know who is
                  present the moment they arrive.
                </p>
              </div>

              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
                <Lock className="w-8 h-8 text-blue-600 mb-4" />
                <h4 className="font-bold text-slate-900 mb-2">Role Access</h4>
                <p className="text-sm text-slate-600">
                  Granular permissions for every user type. Control exactly who
                  sees what data.
                </p>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 col-span-2">
                <Shield className="w-8 h-8 text-blue-400 mb-4" />
                <h4 className="font-bold mb-2">Security</h4>
                <p className="text-sm text-slate-300">
                  Enterprise-grade encryption for sensitive data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-blue-50 border-t border-blue-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Ready to revolutionize your
            <br />
            institutional efficiency?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join hundreds of modern educational institutions using AttendEase
            today.
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-block px-10 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute roles={["admin"]}>
                    <AdminDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute>
                  <RoleRoute roles={["teacher", "admin"]}>
                    <TeacherDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <RoleRoute roles={["student", "admin"]}>
                    <StudentDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
              fontSize: "16px",
              padding: "16px 20px",
              borderRadius: "12px",
              minWidth: "320px",
              maxWidth: "400px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
              style: {
                background: "#10b981",
                color: "#fff",
                fontSize: "16px",
                padding: "16px 20px",
                borderRadius: "12px",
                minWidth: "320px",
                maxWidth: "400px",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
              style: {
                background: "#ef4444",
                color: "#fff",
                fontSize: "16px",
                padding: "16px 20px",
                borderRadius: "12px",
                minWidth: "320px",
                maxWidth: "400px",
                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
