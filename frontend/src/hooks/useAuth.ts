import { useAuthStore } from '@store/authStore';
import axiosInstance from '@config/axiosInstance';
import { AuthResponse, User } from '@/types/user';
import toast from 'react-hot-toast';

/**
 * Custom hook for authentication logic
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setToken, setLoading, logout: storeLogout } = useAuthStore();

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
      const rawData = response.data as any;
      const resData = rawData.data || rawData;
      setUser(resData.user);
      setToken(resData.token);
      toast.success('Login successful!');
      return resData;
    } catch (error) {
      // Error handled by interceptor
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/register', userData);
      const rawData = response.data as any;
      const resData = rawData.data || rawData;
      setUser(resData.user);
      setToken(resData.token);
      toast.success('Registration successful!');
      return resData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
    toast.success('Logged out successfully');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
};
