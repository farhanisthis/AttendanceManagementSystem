import axios from "axios";

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Production backend URL - this should match your render.yaml
  const productionUrl = "https://attendancemanagementsystem-7t71.onrender.com";

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

  // Production fallback
  console.log("🚀 Using production URL:", productionUrl);
  console.log("📍 Current hostname:", window.location.hostname);
  console.log("🔧 DEV mode:", import.meta.env.DEV);
  return productionUrl;
};

const api = axios.create({
  baseURL: getApiBaseUrl() + "/api",
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
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
