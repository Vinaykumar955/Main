import { type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Spinner } from "@/components/layout/Page";

/**
 * Route guard. Bounces unauthenticated users to /auth with a return path.
 * Supports both <Route element={<ProtectedRoute />}> (uses <Outlet />) and
 * direct usage with children.
 */
export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  return <>{children ?? <Outlet />}</>;
}

export function GuestOnly({ children }: { children?: ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  if (isAuth) return <Navigate to="/" replace />;
  return <>{children ?? <Outlet />}</>;
}

export function AdminOnly({ children }: { children?: ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);
  if (role !== "admin" && role !== "moderator") {
    return (
      <div className="grid min-h-[60dvh] place-items-center">
        <div className="flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
          <Spinner />
          <span>VERIFYING_CREDENTIALS…</span>
        </div>
      </div>
    );
  }
  return <>{children ?? <Outlet />}</>;
}
