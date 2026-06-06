import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/domain";
import { useToastStore } from "./toastStore";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "error";
  isAuthenticated: boolean;
  signIn: (user: User, token: string) => void;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;
  setStatus: (status: AuthState["status"]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      status: "idle",
      isAuthenticated: false,
      signIn: (user, token) => set({ user, token, isAuthenticated: true, status: "idle" }),
      signOut: () => {
        set({ user: null, token: null, isAuthenticated: false, status: "idle" });
        useToastStore.getState().push({ type: "info", title: "SIGNED_OUT", body: "Session ended." });
      },
      updateUser: (patch) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...patch } } : state,
        ),
      setStatus: (status) => set({ status }),
    }),
    {
      name: "cb.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    },
  ),
);
