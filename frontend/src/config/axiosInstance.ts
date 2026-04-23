import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Base axios instance for AlphaPowerZone API
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically attaches JWT from localStorage to the Authorization header
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('apz_token') || localStorage.getItem('apz_owner_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global error cases like 401 (Unauthorized) and displays error toasts
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Global 401 handler: clear token and redirect to login
      localStorage.removeItem('apz_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    } else {
      // Global error toast
      const errorMessage = (error.response?.data as any)?.message || 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
