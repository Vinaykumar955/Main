import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Home,
  Inbox,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User,
  LogOut,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn, shortHash } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/store";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useIsMobile, useOnlineStatus } from "@/hooks";
import { StatusDot } from "@/components/ui/Atoms";
import { Dropdown } from "@/components/ui/Tabs";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/browse", label: "Browse", icon: Search },
  { to: "/messages", label: "Messages", icon: Inbox, badge: 3 },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/notifications", label: "Alerts", icon: Bell, badge: 2 },
] as const;

export function Navbar() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const signOut = useAuthStore((s) => s.signOut);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const toggleCommand = useUIStore((s) => s.toggleCommand);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const [scrolled, setScrolled] = useState(false);
  const [pulseLogo, setPulseLogo] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPulseLogo(true);
    window.setTimeout(() => setPulseLogo(false), 600);
    if (isMobile) {
      toggleSidebar();
    } else {
      navigate("/");
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line bg-surface-raised/80 backdrop-blur-md",
        scrolled && "border-line-strong",
      )}
    >
      <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
        <button
          type="button"
          onClick={toggleSidebar}
          className="grid h-8 w-8 shrink-0 place-items-center border border-line text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
          aria-label="Open menu"
          title="Open menu"
        >
          <Menu className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <button
          type="button"
          onClick={onLogoClick}
          className={cn(
            "group/logo flex items-center gap-2.5 outline-none",
            pulseLogo && "animate-pulse-ring rounded",
          )}
          aria-label="Go to home"
        >
          <span className="grid h-7 w-7 place-items-center border border-signal bg-surface font-mono text-[10px] uppercase tracking-widest text-signal transition-colors group-hover/logo:bg-signal group-hover/logo:text-ink">
            CB
          </span>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-mono text-[11px] uppercase tracking-[0.2em] text-fg">
              CAMPUS//BAZAAR
            </span>
            <span className="text-mono text-[8px] uppercase tracking-[0.2em] text-fg-subtle">
              v0.1.0 · {shortHash(location.pathname)}
            </span>
          </div>
        </button>

        <div className="ml-1 hidden items-center gap-1 md:flex">
          {navItems.slice(0, 2).map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        <button
          type="button"
          onClick={toggleCommand}
          className="ml-1 hidden h-8 min-w-[200px] flex-1 items-center gap-2 border border-line rounded bg-surface px-3 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle transition-colors hover:border-fg-subtle hover:text-fg lg:flex"
          aria-label="Open command palette"
        >
          <Search className="h-3 w-3" strokeWidth={1.5} />
          <span>SEARCH</span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="border border-line bg-surface-raised px-1 text-[9px]">⌘</kbd>
            <kbd className="border border-line bg-surface-raised px-1 text-[9px]">K</kbd>
          </span>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <StatusDot status={online ? "online" : "offline"} size="xs" />

          <button
            type="button"
            onClick={toggleTheme}
            className="hidden h-8 w-8 place-items-center border border-line rounded text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg sm:grid"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Moon className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
          </button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-3 w-3" strokeWidth={2} />}
            className="hidden sm:inline-flex"
            onClick={() => navigate("/sell")}
          >
            POST
          </Button>

          {isAuth && user ? (
            <Dropdown
              align="end"
              trigger={
                <button
                  type="button"
                  className="ml-1 flex items-center gap-2 border border-line rounded bg-surface py-1 pl-1 pr-2 transition-colors hover:border-fg-subtle"
                  aria-label="Open user menu"
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" online />
                  <span className="hidden text-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted sm:inline">
                    {user.username}
                  </span>
                </button>
              }
              items={[
                { id: "profile", label: "Profile", icon: <User className="h-3 w-3" />, onSelect: () => navigate(`/u/${user.username}`) },
                { id: "settings", label: "Settings", icon: <Settings className="h-3 w-3" />, onSelect: () => navigate("/settings") },
                ...(user.role === "admin"
                  ? [{ id: "admin", label: "Admin", icon: <Shield className="h-3 w-3" />, onSelect: () => navigate("/admin") }]
                  : []),
                { id: "d", label: "", divider: true },
                { id: "signout", label: "Sign out", icon: <LogOut className="h-3 w-3" />, onSelect: signOut, danger: true },
              ]}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth")}
              className="hidden sm:inline-flex"
            >
              SIGN IN
            </Button>
          )}

          {isMobile && (
            <button
              type="button"
              onClick={toggleCommand}
              className="grid h-8 w-8 place-items-center border border-line rounded text-fg-muted"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* mobile quick nav */}
      <nav className="flex h-11 items-center gap-1 overflow-x-auto border-t border-line bg-surface-raised px-2 scrollbar-hide md:hidden">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} compact />
        ))}
      </nav>
    </header>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  badge,
  compact = false,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  compact?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "group/nav relative flex items-center gap-1.5 border rounded transition-colors",
          compact ? "h-8 px-2.5 text-[10px]" : "h-8 px-3 text-[10px]",
          "font-mono uppercase tracking-[0.16em]",
          isActive
            ? "border-line bg-surface text-fg"
            : "border-transparent text-fg-subtle hover:border-line hover:text-fg",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-3 w-3" strokeWidth={1.5} />
          <span>{label}</span>
          {typeof badge === "number" && badge > 0 && (
            <span
              className={cn(
                "ml-0.5 grid min-w-[16px] place-items-center border rounded px-1 text-[9px] tabular-nums",
                isActive
                  ? "border-signal bg-signal text-ink"
                  : "border-line bg-surface text-fg-muted",
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function MobileDock() {
  return null; // navigation lives in Navbar
}
