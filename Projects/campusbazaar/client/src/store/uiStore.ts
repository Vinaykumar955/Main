import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AccentKey } from "@/config/theme";

type Theme = "dark" | "light";
type Density = "comfortable" | "compact";

interface UIState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  accent: AccentKey;
  setAccent: (c: AccentKey) => void;

  density: Density;
  setDensity: (d: Density) => void;

  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          const root = document.documentElement;
          root.classList.toggle("dark", theme === "dark");
          root.classList.toggle("light", theme === "light");
        }
      },
      toggleTheme: () =>
        set((s) => {
          const theme: Theme = s.theme === "dark" ? "light" : "dark";
          if (typeof document !== "undefined") {
            const root = document.documentElement;
            root.classList.toggle("dark", theme === "dark");
            root.classList.toggle("light", theme === "light");
          }
          return { theme };
        }),

      accent: "red",
      setAccent: (accent) => set({ accent }),

      density: "comfortable",
      setDensity: (density) => set({ density }),

      commandOpen: false,
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),

      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: "cb.ui",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
