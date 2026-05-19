import axios from "axios";

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Check if we're running on localhost (more reliable than import.meta.env.DEV)
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("localhost") ||
    import.meta.env.DEV;

  if (isLocalhost) {
    console.log("🛠️ Using development URL: http://localhost:4000");
    console.log("📍 Current hostname:", window.location.hostname);
    console.log("🔧 DEV mode:", import.meta.env.DEV);
    return "http://localhost:4000";
  }

  // Production backend URL - use environment variable if set, otherwise fallback to deployed backend
  let productionUrl = import.meta.env.VITE_API_URL || "https://attendancemanagementsystem-7t71.onrender.com";

  // Auto-correct if it points to the old/non-existent backend URL without the "-7t71" suffix
  if (productionUrl.includes("attendancemanagementsystem.onrender.com") && !productionUrl.includes("-7t71")) {
    console.log("⚠️ Old backend URL detected, auto-correcting to the correct active backend.");
    productionUrl = "https://attendancemanagementsystem-7t71.onrender.com";
  }

  console.log("🚀 Using production URL:", productionUrl);
  console.log("📍 Current hostname:", window.location.hostname);
  console.log("🔧 DEV mode:", import.meta.env.DEV);
  return productionUrl;
};

const rawBaseUrl = getApiBaseUrl();
const api = axios.create({
  baseURL: rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, "")}/api`,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      baseURL: config.baseURL,
      path: config.url,
      env: import.meta.env.MODE,
    });

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Dispatch custom event to notify auth context
      window.dispatchEvent(new CustomEvent("tokenExpired"));

      // Only redirect if we're not already on the login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
