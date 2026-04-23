import { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../config/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { useOwnerStore } from "../store/ownerStore";
import { User } from "../types/user";

interface AuthContextType {
  user: User | null;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginOwner: (email: string, password: string, secretKey: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
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
      const res = await axiosInstance.post("/users/signin", { email, password });
      const userData = res.data.data.user; 
      const token = res.data.data.token;
      
      // Sync with global store
      useAuthStore.getState().setUser(userData);
      useAuthStore.getState().setToken(token);
      
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
      const res = await axiosInstance.post("/owners/signin", { email, password, secretKey });
      const ownerData = res.data.data.owner; 
      const token = res.data.data.token;
      
      // Sync with owner store
      useOwnerStore.getState().setOwner(ownerData, token);
      
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
      await axiosInstance.post(endpoint);
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      useAuthStore.getState().logout();
      useOwnerStore.getState().logout();
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
