import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Owner {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin';
}

interface OwnerState {
  owner: Owner | null;
  token: string | null;
  isAuthenticated: boolean;
  setOwner: (owner: Owner, token: string) => void;
  logout: () => void;
}

export const useOwnerStore = create<OwnerState>()(
  persist(
    (set) => ({
      owner: null,
      token: null,
      isAuthenticated: false,
      setOwner: (owner, token) => {
        localStorage.setItem('apz_owner_token', token);
        set({ owner, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('apz_owner_token');
        set({ owner: null, token: null, isAuthenticated: false });
        window.location.href = '/admin/login';
      },
    }),
    {
      name: 'apz-owner-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
