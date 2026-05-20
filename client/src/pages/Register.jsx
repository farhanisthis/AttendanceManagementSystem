import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Mail, Lock, User, BookOpen, Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "../api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    enrollment: "",
    phone: "",
    batch: "",
    section: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.role === "student" && !formData.enrollment.trim()) {
      newErrors.enrollment = "Enrollment number is required for students";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors above");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === "student" && {
          enrollment: formData.enrollment,
          batch: formData.batch || undefined,
          section: formData.section || undefined,
        }),
        ...(formData.phone && { phone: formData.phone }),
      });

      if (response.data.success || response.data.message) {
        toast.success("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid lg:grid-cols-2 gap-0 min-h-screen">
        {/* Left - Dashboard Preview */}
        <div className="hidden lg:flex bg-gradient-to-br from-blue-50 to-indigo-50 p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-20 -mr-48"></div>
          <div className="relative z-10 w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
              {/* Mock Dashboard Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">A</span>
                  </div>
                  <h3 className="text-white font-bold">Admin Dashboard</h3>
                </div>
              </div>

              {/* Mock Stats */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-2xl font-black text-blue-600 mb-1">
                      123
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Active Users
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="text-2xl font-black text-green-600 mb-1">
                      26
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Subjects
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="text-2xl font-black text-purple-600 mb-1">
                      27
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Timetables
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <div className="text-2xl font-black text-orange-600 mb-1">
                      98%
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Attendance
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-3">
                    Empowering Campus Administration
                  </p>
                  <p className="text-sm font-bold text-slate-900 mb-2">
                    Join thousands of educators and students managing daily
                    attendance with precision and ease.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Register Form */}
        <div className="flex items-center justify-center px-4 py-12 lg:py-0">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-900 mb-2">
                Create Account
              </h1>
              <p className="text-slate-600">
                Enter your institutional details to get started.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 text-sm transition-all ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@university.edu"
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 text-sm transition-all ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={`w-full pl-12 pr-11 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 text-sm transition-all ${
                      errors.password
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors pointer-events-auto"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1.5">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={`w-full pl-12 pr-11 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 text-sm transition-all ${
                      errors.confirmPassword
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors pointer-events-auto"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1.5">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  User Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 text-sm hover:border-slate-400 transition-all bg-white"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              {/* Enrollment Number (for students) */}
              {formData.role === "student" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Enrollment Number
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="enrollment"
                        value={formData.enrollment}
                        onChange={handleChange}
                        placeholder="EN-2024-001"
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 text-sm transition-all ${
                          errors.enrollment
                            ? "border-red-500 bg-red-50"
                            : "border-slate-300 hover:border-slate-400"
                        }`}
                      />
                    </div>
                    {errors.enrollment && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.enrollment}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                        Batch
                      </label>
                      <input
                        type="text"
                        name="batch"
                        value={formData.batch}
                        onChange={handleChange}
                        placeholder="First Year"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 text-sm hover:border-slate-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                        Section
                      </label>
                      <input
                        type="text"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        placeholder="Section A"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 text-sm hover:border-slate-400 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 text-sm mt-8 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Register Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
