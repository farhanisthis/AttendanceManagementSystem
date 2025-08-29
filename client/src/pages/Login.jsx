import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Password reset states
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState("email"); // email, otp, password
  const [resetLoading, setResetLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      const role = user.role;
      nav(
        role === "admin"
          ? "/admin"
          : role === "teacher"
          ? "/teacher"
          : "/student"
      );
    }
  }, [user, isLoading, nav]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (user) {
    return null;
  }

  // Helper function to extract meaningful error messages
  const getErrorMessage = (error) => {
    // Check for authentication errors
    if (error.response?.status === 401) {
      return "Invalid email or password. Please try again.";
    }
    if (error.response?.status === 403) {
      return "Access denied. Please check your credentials.";
    }
    if (error.response?.status === 404) {
      return "User not found. Please check your email.";
    }

    // Check for specific API error messages
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    // Fallback error messages
    if (error.code === "NETWORK_ERROR") {
      return "Network error. Please check your connection.";
    }
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please try again.";
    }

    return "Login failed. Please try again.";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      const role = data.user.role;
      toast.success("Login successful!");
      nav(
        role === "admin"
          ? "/admin"
          : role === "teacher"
          ? "/teacher"
          : "/student"
      );
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      setErr(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for password reset
  const sendOTP = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setResetLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: resetEmail.trim() });
      setOtpSent(true);
      setResetStep("otp");
      toast.success("OTP sent to your email!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  // Verify OTP and proceed to password reset
  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    setResetLoading(true);
    try {
      await api.post("/auth/verify-otp", {
        email: resetEmail.trim(),
        otp: otp.trim(),
      });
      setResetStep("password");
      toast.success("OTP verified successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Invalid OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  // Reset password with new password
  const resetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setResetLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: resetEmail.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });

      toast.success(
        "Password reset successfully! Please login with your new password."
      );
      // Reset all states and go back to login
      setShowResetForm(false);
      setResetStep("email");
      setResetEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpSent(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to reset password. Please try again.";
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  // Reset password reset form
  const resetResetForm = () => {
    setShowResetForm(false);
    setResetStep("email");
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpSent(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span className="text-3xl">🎓</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-blue-100 text-lg">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                className={`w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Registration Link */}
            <div className="text-center mt-6 pt-6 border-t border-slate-200">
              <p className="text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Password Reset Form */}
            {showResetForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">🔐 Password Reset</h3>
                      <button
                        onClick={resetResetForm}
                        className="text-white hover:text-blue-200 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    {resetStep === "email" && (
                      <form onSubmit={sendOTP} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Address
                          </label>
                          <input
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                            placeholder="Enter your email address"
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className={`w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            resetLoading ? "opacity-75 cursor-not-allowed" : ""
                          }`}
                          disabled={resetLoading}
                        >
                          {resetLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Sending OTP...</span>
                            </div>
                          ) : (
                            "Send OTP"
                          )}
                        </button>
                      </form>
                    )}

                    {resetStep === "otp" && (
                      <form onSubmit={verifyOTP} className="space-y-4">
                        <div className="text-center mb-4">
                          <p className="text-sm text-slate-600">
                            We've sent a 6-digit OTP to{" "}
                            <span className="font-semibold text-slate-800">
                              {resetEmail}
                            </span>
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Enter OTP
                          </label>
                          <input
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 focus:bg-white text-center text-lg font-mono"
                            placeholder="000000"
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) =>
                              setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setResetStep("email")}
                            className="flex-1 py-3 px-6 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className={`flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              resetLoading
                                ? "opacity-75 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={resetLoading}
                          >
                            {resetLoading ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Verifying...</span>
                              </div>
                            ) : (
                              "Verify OTP"
                            )}
                          </button>
                        </div>
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={sendOTP}
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            Didn't receive OTP? Resend
                          </button>
                        </div>
                      </form>
                    )}

                    {resetStep === "password" && (
                      <form onSubmit={resetPassword} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            New Password
                          </label>
                          <input
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                            placeholder="Enter new password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Minimum 6 characters
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                            placeholder="Confirm new password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setResetStep("otp")}
                            className="flex-1 py-3 px-6 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className={`flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              resetLoading
                                ? "opacity-75 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={resetLoading}
                          >
                            {resetLoading ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Resetting...</span>
                              </div>
                            ) : (
                              "Reset Password"
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 mb-3">
                  Demo Credentials
                </p>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1 mb-4">
                  <p className="text-sm text-slate-700">
                    Email:{" "}
                    <span className="font-mono font-medium">
                      admin@example.com
                    </span>
                  </p>
                  <p className="text-sm text-slate-700">
                    Password:{" "}
                    <span className="font-mono font-medium">admin123</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline"
                >
                  Clear all stored data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
