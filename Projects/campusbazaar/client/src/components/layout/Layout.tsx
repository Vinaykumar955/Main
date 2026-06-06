import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { ToastViewport } from "@/components/ui/Toast";
import { TelemetryStrip } from "@/components/ui/TelemetryStrip";
import { useClock, useOnlineStatus } from "@/hooks";
import { formatClock, formatDateStamp, shortHash } from "@/lib/utils";

export function Layout() {
  const location = useLocation();
  const clock = useClock(1000);
  const online = useOnlineStatus();
  const [buildHash] = useState(() => shortHash(import.meta.env.VITE_BUILD_HASH ?? "dev"));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-bg text-fg">
      <TelemetryStrip
        route={location.pathname}
        env={import.meta.env.VITE_APP_ENV?.toUpperCase() ?? "DEV"}
        buildHash={buildHash}
        online={online}
        className="hidden lg:flex"
      >
        <span className="tabular-nums text-fg-muted">
          {formatDateStamp(clock)}·{formatClock(clock)}
        </span>
      </TelemetryStrip>
      <Navbar />
      <div className={cn("flex-1", location.pathname !== "/" && "border-t-0")}>
        <Outlet />
      </div>
      <SiteFooter />
      <Sidebar />
      <CommandPalette />
      <ToastViewport />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-line bg-surface-raised">
      <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-7 w-7 place-items-center border border-signal bg-surface font-mono text-[10px] uppercase tracking-widest text-signal">
              CB
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                BUILT_BY_STUDENTS / FOR_STUDENTS
              </span>
              <span className="text-mono text-[8px] uppercase tracking-[0.2em] text-fg-ghost">
                HOSTEL.CIRC.0X42 · NIGHTLY_BUILD
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle">
            <a href="#" className="hover:text-fg">PRIVACY</a>
            <span aria-hidden>│</span>
            <a href="#" className="hover:text-fg">TERMS</a>
            <span aria-hidden>│</span>
            <a href="#" className="hover:text-fg">REPORT_ABUSE</a>
            <span aria-hidden>│</span>
            <span className="tabular-nums">v0.1.0</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-line pt-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2 text-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            <span className="text-fg-subtle">//</span>
            <span>MADE_BY</span>
            <span className="inline-flex items-center gap-1.5 border border-signal bg-signal/5 px-1.5 py-0.5 text-fg">
              <span className="h-1.5 w-1.5 rounded-full bg-signal animate-blink-dot" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
                VINAY KUMAR
              </span>
            </span>
            <span className="text-fg-subtle">//</span>
            <span className="text-fg-subtle">made for floors, by floor reps</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle tabular-nums">
            <span>© </span>
            <span>{new Date().getFullYear()}</span>
            <span aria-hidden> · </span>
            <span>//CB</span>
            <span aria-hidden> · </span>
            <span>ALL_RIGHTS_RESERVED</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-mono text-[9px] uppercase tracking-[0.2em] text-fg-ghost">
          <span>less waste, less haggling, more dorm life</span>
        </div>
      </div>
    </footer>
  );
}
