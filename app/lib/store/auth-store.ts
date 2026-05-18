import { create } from "zustand";

export type AppUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
};

type AuthState = {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ loading }),

  clearAuth: () =>
    set({
      user: null,
      loading: false,
    }),
}));
