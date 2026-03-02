// src/store/useAuth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '../types/hotel';

interface User {
  id: string;
  username: string;
  role: Role;
}

interface AuthStore {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, role: Role) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,

      register: (username, password, role) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find((u: any) => u.username === username)) return false;
        users.push({ id: Date.now().toString(), username, password, role });
        localStorage.setItem('users', JSON.stringify(users));
        return true;
      },

      login: async (username, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const found = users.find((u: any) => u.username === username && u.password === password);
        if (!found) return false;
        set({ user: { id: found.id, username, role: found.role } });
        return true;
      },

      logout: () => set({ user: null }),
    }),
    { name: 'auth-storage' }
  )
);