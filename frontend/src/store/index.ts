import { create } from 'zustand';
import type { User, Toast } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

interface ToastState {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

// ─── Auth Store ──────────────────────────────
export const useAuthStore = create<AuthState>((set) => {
  // Rehydrate from localStorage on app load
  const stored = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  let user: User | null = null;
  try { user = stored ? JSON.parse(stored) : null; } catch { /* ignore */ }

  return {
    user,
    token,
    isAuthenticated: !!(user && token),

    setAuth: (user, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },

    clearAuth: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});

// ─── Toast Store ─────────────────────────────
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
