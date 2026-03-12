import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Just to sync if needed, but primary state is now instant
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loginUser = async (email, password) => {
    try {
      const res = await api.post("/users/signin", { email, password });
      const userData = res.data.user; // Backend now returns { message, user: {id, name, email, role: 'user'} }
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const loginOwner = async (email, password, secretKey) => {
    try {
      const res = await api.post("/owners/signin", { email, password, secretKey });
      const ownerData = res.data.owner; // Backend returns { message, owner: {id, name, email, role: 'owner'} }
      setUser(ownerData);
      localStorage.setItem("user", JSON.stringify(ownerData));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      const endpoint =
        user?.role === "owner" ? "/owners/logout" : "/users/logout";
      await api.post(endpoint);
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loginUser, loginOwner, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
