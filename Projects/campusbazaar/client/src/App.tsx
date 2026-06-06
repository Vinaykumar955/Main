import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@/routes";
import { useUIStore } from "@/store";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { ACCENT_PALETTE, type AccentKey } from "@/config/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

/**
 * Boots the document with the right classes / inline vars for theme + accent.
 * Runs once on mount and again whenever the user toggles.
 */
function ThemeBoot() {
  const theme = useUIStore((s) => s.theme);
  const accent = useUIStore((s) => s.accent);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const palette = ACCENT_PALETTE[accent as AccentKey] ?? ACCENT_PALETTE.red;
    root.style.setProperty("--color-signal", palette.s500);
    root.style.setProperty("--color-signal-500", palette.s500);
    root.style.setProperty("--color-signal-400", palette.s400);
    root.style.setProperty("--color-signal-600", palette.s600);
    root.style.setProperty("--color-signal-50", palette.s50);
    root.style.setProperty("--color-signal-100", palette.s100);
    root.style.setProperty("--color-signal-200", palette.s200);
    root.style.setProperty("--color-signal-300", palette.s300);
    root.style.setProperty("--color-signal-700", palette.s700);
    root.style.setProperty("--color-signal-800", palette.s800);
    root.style.setProperty("--color-signal-900", palette.s900);
    root.style.setProperty("--color-danger", palette.s500);
  }, [accent]);

  return null;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeBoot />
        <AppRoutes />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
