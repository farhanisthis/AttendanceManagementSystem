import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Request interceptor - add auth token
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) {
    cfg.headers.Authorization = `Bearer ${t}`;
    console.log("Request with token:", cfg.url);
  } else {
    console.warn("No token found for request:", cfg.url);
  }
  return cfg;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed - clearing local storage");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
