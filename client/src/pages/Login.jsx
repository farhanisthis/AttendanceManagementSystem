import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from "lucide-react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState("email");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      const role = user.role;
      nav(
        role === "admin"
          ? "/admin"
          : role === "teacher"
            ? "/teacher"
            : "/student",
      );
    }
  }, [user, isLoading, nav]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  const getErrorMessage = (error) => {
    if (error.response?.status === 401) return "Invalid email or password.";
    if (error.response?.status === 404) return "User not found.";
    if (error.response?.data?.error) return error.response.data.error;
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
            : "/student",
      );
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      setErr(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setResetLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: resetEmail.trim() });
      setResetStep("otp");
      toast.success("OTP sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send OTP.");
    } finally {
      setResetLoading(false);
    }
  };

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
      toast.error(error.response?.data?.error || "OTP verification failed.");
    } finally {
      setResetLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setResetLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: resetEmail.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });
      toast.success("Password reset successfully!");
      setShowResetForm(false);
      setResetStep("email");
      setResetEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.error || "Password reset failed.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 md:px-8 md:py-10 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">AttendEase</h1>
            </div>
            <p className="text-sm text-slate-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {!showResetForm ? (
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Error Alert */}
                {err && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-200 text-red-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      !
                    </div>
                    <p className="text-sm text-red-700 font-medium">{err}</p>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-11 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 pointer-events-auto"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-600">
                      New to AttendEase?
                    </span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <Link
                  to="/register"
                  className="w-full h-10 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  Create Account
                </Link>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-medium text-slate-600 mb-3">
                    Demo Credentials:
                  </p>
                  <div className="space-y-1 text-xs text-slate-700">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      <code className="bg-white px-2 py-1 rounded border border-slate-200">
                        admin@example.com
                      </code>
                    </p>
                    <p>
                      <span className="font-medium">Password:</span>{" "}
                      <code className="bg-white px-2 py-1 rounded border border-slate-200">
                        admin123
                      </code>
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              /* Password Reset Form */
              <div>
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setShowResetForm(false);
                      setResetStep("email");
                      setResetEmail("");
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>

                {resetStep === "email" && (
                  <form onSubmit={sendOTP} className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Reset Password
                    </h2>
                    <p className="text-sm text-slate-600">
                      Enter your email address and we'll send you an OTP to
                      reset your password.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full h-10 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resetLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </form>
                )}

                {resetStep === "otp" && (
                  <form onSubmit={verifyOTP} className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Verify OTP
                    </h2>
                    <p className="text-sm text-slate-600">
                      We've sent a 6-digit code to{" "}
                      <span className="font-medium">{resetEmail}</span>
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        placeholder="000000"
                        maxLength="6"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-center text-lg font-mono tracking-widest"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full h-10 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resetLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={sendOTP}
                      className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                      Didn't receive? Resend
                    </button>
                  </form>
                )}

                {resetStep === "password" && (
                  <form onSubmit={resetPassword} className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Create New Password
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1.5">
                        At least 6 characters
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full h-10 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resetLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
