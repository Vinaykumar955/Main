import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  Plus,
  MessageCircle,
  Bookmark,
  Bell,
  User,
  Settings,
  Shield,
  Tag,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/store";
import { Badge } from "@/components/ui/Badge";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  authOnly?: boolean;
  guestOnly?: boolean;
  adminOnly?: boolean;
  group: "main" | "you" | "admin";
}

const items: NavItem[] = [
  { to: "/", label: "Home", icon: Home, group: "main" },
  { to: "/browse", label: "Browse floor", icon: Compass, group: "main" },
  { to: "/c/free", label: "Free zone", icon: Tag, group: "main" },
  { to: "/c/textbooks", label: "Textbooks", icon: Tag, group: "main" },
  { to: "/sell", label: "Post item", icon: Plus, group: "main" },
  { to: "/messages", label: "Messages", icon: MessageCircle, badge: 3, group: "you" },
  { to: "/saved", label: "Saved", icon: Bookmark, group: "you" },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: 2, group: "you" },
  { to: "/settings", label: "Settings", icon: Settings, group: "you" },
  { to: "/admin", label: "Admin", icon: Shield, group: "admin", adminOnly: true },
];

const groups: { key: NavItem["group"]; label: string }[] = [
  { key: "main", label: "DISCOVER" },
  { key: "you", label: "YOU" },
  { key: "admin", label: "OPS" },
];

export function Sidebar() {
  const open = useUIStore((s) => s.sidebarOpen);
  const setOpen = useUIStore((s) => s.setSidebarOpen);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const isAdmin = user?.role === "admin" || user?.role === "moderator";
  const visible = items.filter((i) => {
    if (i.adminOnly) return isAdmin;
    return true;
  });

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-line bg-surface shadow-panel-raised",
          "transition-transform duration-300 ease-out-quart",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-label="Main menu"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid h-7 w-7 place-items-center border border-signal bg-surface font-mono text-[10px] uppercase tracking-widest text-signal">
              CB
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-mono text-[11px] uppercase tracking-[0.2em] text-fg">
                CAMPUS//BAZAAR
              </span>
              <span className="text-mono text-[8px] uppercase tracking-[0.2em] text-fg-subtle">
                {user ? `@${user.username}` : "GUEST_MODE"}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-7 w-7 place-items-center border border-line text-fg-muted hover:border-fg-subtle hover:text-fg"
            aria-label="Close menu"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="border-b border-line bg-surface-raised px-4 py-3">
          <div className="text-mono text-[9px] uppercase tracking-[0.24em] text-fg-subtle">
            STATUS
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <Badge variant="success" size="sm" dot pulse>
              {user ? "ONLINE" : "GUEST"}
            </Badge>
            <span className="text-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
              {isAdmin ? "ADMIN" : "STUDENT"}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {groups.map((g) => {
            const groupItems = visible.filter((i) => i.group === g.key);
            if (groupItems.length === 0) return null;
            return (
              <div key={g.key} className="px-2 pb-2">
                <div className="px-2 pb-1 pt-1.5 text-mono text-[9px] uppercase tracking-[0.24em] text-fg-subtle">
                  {g.label}
                </div>
                {groupItems.map((item) => {
                  const active = location.pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        navigate(item.to);
                      }}
                      className={cn(
                        "group/snav flex w-full items-center gap-2.5 border-l-2 px-2.5 py-2 text-left transition-colors",
                        active
                          ? "border-signal bg-surface-raised text-fg"
                          : "border-transparent text-fg-muted hover:border-line hover:bg-surface-raised hover:text-fg",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span className="flex-1 truncate font-mono text-[11px] uppercase tracking-[0.14em]">
                        {item.label}
                      </span>
                      {typeof item.badge === "number" && item.badge > 0 && (
                        <span className="border border-signal bg-signal px-1 text-[9px] tabular-nums text-ink">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-line bg-surface-raised px-4 py-3">
          <div className="flex items-center justify-between text-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
            <span>BUILD_0.1.0</span>
            <span className="tabular-nums">//MENU</span>
          </div>
        </div>
      </aside>
    </>
  );
}
