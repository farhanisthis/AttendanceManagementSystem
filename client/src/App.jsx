import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-slate-200/50 shadow-2xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-8 shadow-xl">
              <span className="text-5xl">🎓</span>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-6 leading-tight">
              Smart College
              <br />
              <span className="text-5xl">Timetable & Attendance</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              Streamlined attendance management with role-based access. Clean
              UI, minimal clicks, maximum efficiency for modern education.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">
                Admin Management
              </span>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium text-sm">
                Teacher Tools
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium text-sm">
                Student Portal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="group">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">👨‍🏫</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Teachers</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Manage classes and mark attendance with intuitive tools designed
              for educators.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium text-sm">
              Manage Classes
            </div>
          </div>
        </div>

        <div className="group">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">👨‍🎓</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Students</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Track attendance and view schedules with a clean, student-friendly
              interface.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-medium text-sm">
              Track Progress
            </div>
          </div>
        </div>

        <div className="group">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Attendance
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Generate comprehensive reports and export data for administrative
              needs.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-full font-medium text-sm">
              Export Data
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">
          Why Choose Smart College?
        </h2>
        <div className="grid gap-8 md:grid-cols-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-slate-600">Digital Attendance</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
            <div className="text-slate-600">Access Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              Real-time
            </div>
            <div className="text-slate-600">Updates</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-600 mb-2">Secure</div>
            <div className="text-slate-600">Data Protection</div>
          </div>
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
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
