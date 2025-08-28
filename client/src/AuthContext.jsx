import { createContext, useContext, useState, useEffect } from "react";
import api from "./api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to validate token with server
  const validateToken = async (token) => {
    try {
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      console.error("Token validation failed:", error);
      return null;
    }
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Clear any existing auth data on app start to ensure clean state
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token || storedUser) {
          console.log("AuthContext: Clearing existing auth data on app start");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        // Always start with no user
        setUser(null);
        console.log("AuthContext: Starting with clean state");
      } catch (error) {
        console.error("AuthContext: Error during initialization:", error);
        // Clear storage on error
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for token expiration events from API interceptor
    const handleTokenExpired = () => {
      console.log("AuthContext: Token expired event received");
      setUser(null);
    };

    window.addEventListener("tokenExpired", handleTokenExpired);

    // Cleanup event listener
    return () => {
      window.removeEventListener("tokenExpired", handleTokenExpired);
    };
  }, []);

  const login = (data) => {
    console.log("AuthContext: Login called with:", data);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    console.log("AuthContext: User state updated to:", data.user);
  };

  const logout = () => {
    console.log("AuthContext: Logout called");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Debug: Log whenever user state changes
  useEffect(() => {
    if (!isLoading) {
      console.log("AuthContext: User state changed to:", user);
    }
  }, [user, isLoading]);

  return (
    <AuthCtx.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthCtx.Provider>
  );
};
