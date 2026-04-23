import axios from 'axios';

const adminAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('apz_owner_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('apz_owner_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminAxios;
