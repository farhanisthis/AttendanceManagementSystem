import { createContext, useContext, useState, useEffect } from "react";
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        console.log("AuthContext: Initializing with stored user:", parsed);
        return parsed;
      }
    } catch (error) {
      console.error("AuthContext: Error parsing stored user:", error);
      localStorage.removeItem("user");
    }
    return null;
  });

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
    console.log("AuthContext: User state changed to:", user);
  }, [user]);

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
};
