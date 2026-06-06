import { Outlet, useNavigate } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Flag,
  Tags,
  Activity,
  Settings,
  Shield,
  ArrowLeft,
  KeyRound,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { useSignIn } from "@/features/auth/useAuth";
import { toast } from "@/lib/notify";
import { Button } from "@/components/ui/Button";

interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
}

const sections: { label: string; items: AdminNavItem[] }[] = [
  {
    label: "OVERVIEW",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/activity", label: "Live activity", icon: Activity },
    ],
  },
  {
    label: "MODERATION",
    items: [
      { to: "/admin/reports", label: "Reports", icon: Flag, badge: 7 },
      { to: "/admin/listings", label: "Listings", icon: Package },
      { to: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { to: "/admin/categories", label: "Categories", icon: Tags },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

const DEMO_ADMIN = { email: "aarav_x@hostel.edu", password: "password123" };

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const signIn = useSignIn();

  const handleDemoAdmin = () => {
    signIn.mutate(DEMO_ADMIN, {
      onSuccess: () => {
        toast.success("DEMO_ADMIN_SIGNED_IN", "Welcome, @aarav_x. Console unlocked.");
      },
      onError: (err) => {
        toast.danger("DEMO_LOGIN_FAILED", err.message);
      },
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="grid min-h-[60dvh] place-items-center px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-md border border-line bg-surface p-6 text-center shadow-panel">
          <div className="grid h-10 w-10 place-items-center border border-signal text-signal">
            <Shield className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <h2 className="text-mono text-xs uppercase tracking-[0.2em] text-fg">
            RESTRICTED
          </h2>
          <p className="text-xs text-fg-muted">
            Admin access required. Sign in with a floor-rep account.
          </p>

          <div className="my-1 w-full border-t border-line" />

          <div className="flex w-full flex-col gap-1.5 rounded border border-line bg-surface-raised p-3 text-left">
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-signal">
              <KeyRound className="h-3 w-3" strokeWidth={1.5} /> DEMO_CREDENTIALS
            </div>
            <div className="font-mono text-[11px] text-fg-muted">
              <span className="text-fg-subtle">EMAIL</span> · {DEMO_ADMIN.email}
            </div>
            <div className="font-mono text-[11px] text-fg-muted">
              <span className="text-fg-subtle">PASS</span> · {DEMO_ADMIN.password}
            </div>
          </div>

          {isAuth ? (
            <div className="flex w-full flex-col gap-2">
              <Button
                block
                onClick={handleDemoAdmin}
                loading={signIn.isPending}
                leftIcon={<LogIn className="h-3 w-3" strokeWidth={2} />}
              >
                SIGN_IN_AS_DEMO_ADMIN
              </Button>
              <Link
                to="/"
                className="inline-flex h-8 items-center justify-center gap-1.5 border border-line rounded font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted hover:border-fg hover:text-fg"
              >
                <ArrowLeft className="h-3 w-3" strokeWidth={1.5} /> BACK
              </Link>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <Button
                block
                onClick={() => navigate(`/auth?email=${encodeURIComponent(DEMO_ADMIN.email)}&password=${encodeURIComponent(DEMO_ADMIN.password)}`)}
                leftIcon={<LogIn className="h-3 w-3" strokeWidth={2} />}
              >
                GO_TO_SIGN_IN
              </Button>
              <Link
                to="/"
                className="inline-flex h-8 items-center justify-center gap-1.5 border border-line rounded font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted hover:border-fg hover:text-fg"
              >
                <ArrowLeft className="h-3 w-3" strokeWidth={1.5} /> BACK
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] gap-0 px-0 sm:px-3 lg:px-5">
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 border-r border-line bg-ink-200 sm:block">
        <div className="flex h-full flex-col overflow-y-auto py-4">
          <div className="px-4 pb-3">
            <div className="text-mono text-[10px] uppercase tracking-[0.22em] text-signal">
              CONSOLE
            </div>
            <div className="mt-0.5 truncate font-mono text-[10px] tracking-wide text-fg-subtle">
              @{user.username}
            </div>
          </div>
          <nav className="flex flex-col gap-4 px-2">
            {sections.map((section) => (
              <div key={section.label}>
                <div className="px-2 pb-1.5 text-mono text-[9px] uppercase tracking-[0.22em] text-fg-subtle">
                  {section.label}
                </div>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          "group/side relative flex items-center gap-2.5 border-l-2 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                          isActive
                            ? "border-signal bg-ink-100 text-fg"
                            : "border-transparent text-fg-subtle hover:bg-ink-100 hover:text-fg",
                        )
                      }
                    >
                      <item.icon className="h-3 w-3" strokeWidth={1.5} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="grid min-w-[18px] place-items-center border border-signal rounded bg-signal/10 px-1 text-[9px] tabular-nums text-signal">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
