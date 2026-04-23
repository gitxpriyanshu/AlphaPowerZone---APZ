import { create } from 'zustand';
import { User } from '@typeDefs/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: localStorage.getItem('apz_user') ? JSON.parse(localStorage.getItem('apz_user')!) : null,
  token: localStorage.getItem('apz_token'),
  isAuthenticated: !!localStorage.getItem('apz_token'),
  isLoading: false,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('apz_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('apz_user');
    }
    set({ user, isAuthenticated: !!user });
  },
  setToken: (token) => {
    if (token) {
      localStorage.setItem('apz_token', token);
    } else {
      localStorage.removeItem('apz_token');
      localStorage.removeItem('apz_user');
    }
    set({ token, isAuthenticated: !!token });
  },
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    localStorage.removeItem('apz_token');
    localStorage.removeItem('apz_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
