import axios from "axios";

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Force production backend URL for now
  const productionUrl = "https://attendancemanagementsystem-7t71.onrender.com";

  if (import.meta.env.VITE_API_URL) {
    console.log("Using VITE_API_URL:", import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // Development fallback
  if (import.meta.env.DEV) {
    console.log("Using development URL: http://localhost:4000");
    return "http://localhost:4000";
  }

  // Production fallback - update this with your actual backend URL
  console.log("Using production URL:", productionUrl);
  return productionUrl;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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
