import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  Home,
  LayoutDashboard,
  MessageCircle,
  Package,
  Plus,
  Search,
  Shield,
  User,
  X,
  Bell,
  Bookmark,
  Settings,
  Sparkles,
  Tags,
  Flame,
  Users,
} from "lucide-react";
import { useUIStore } from "@/store";
import { useDebounce } from "@/hooks";
import { cn, formatCompactNumber } from "@/lib/utils";

interface CommandEntry {
  id: string;
  title: string;
  group: string;
  icon: React.ReactNode;
  hint?: string;
  shortcut?: string;
  to: string;
}

const commands: CommandEntry[] = [
  { id: "go-home", title: "Go home", group: "Navigate", icon: <Home className="h-3.5 w-3.5" />, to: "/", shortcut: "G H" },
  { id: "go-browse", title: "Browse all listings", group: "Navigate", icon: <Compass className="h-3.5 w-3.5" />, to: "/browse", shortcut: "G B" },
  { id: "go-sell", title: "Post a new listing", group: "Navigate", icon: <Plus className="h-3.5 w-3.5" />, to: "/sell", shortcut: "N" },
  { id: "go-msg", title: "Open messages", group: "Navigate", icon: <MessageCircle className="h-3.5 w-3.5" />, to: "/messages", shortcut: "G M" },
  { id: "go-saved", title: "Saved listings", group: "Navigate", icon: <Bookmark className="h-3.5 w-3.5" />, to: "/saved" },
  { id: "go-notif", title: "Notifications", group: "Navigate", icon: <Bell className="h-3.5 w-3.5" />, to: "/notifications" },
  { id: "go-profile", title: "My profile", group: "Navigate", icon: <User className="h-3.5 w-3.5" />, to: "/profile" },
  { id: "go-admin", title: "Admin dashboard", group: "Navigate", icon: <Shield className="h-3.5 w-3.5" />, to: "/admin" },
  { id: "go-settings", title: "Settings", group: "Navigate", icon: <Settings className="h-3.5 w-3.5" />, to: "/settings" },
  { id: "cat-routers", title: "Routers & networking", group: "Category", icon: <Package className="h-3.5 w-3.5" />, to: "/c/routers" },
  { id: "cat-textbooks", title: "Textbooks & notes", group: "Category", icon: <Package className="h-3.5 w-3.5" />, to: "/c/textbooks" },
  { id: "cat-furniture", title: "Furniture", group: "Category", icon: <Package className="h-3.5 w-3.5" />, to: "/c/furniture" },
  { id: "cat-electronics", title: "Electronics & gadgets", group: "Category", icon: <Package className="h-3.5 w-3.5" />, to: "/c/electronics" },
  { id: "cat-cycle", title: "Cycles & vehicles", group: "Category", icon: <Package className="h-3.5 w-3.5" />, to: "/c/cycles" },
  { id: "ftr-urgent", title: "Midnight rush — urgent items", group: "Discover", icon: <Flame className="h-3.5 w-3.5" />, to: "/discover/urgent" },
  { id: "ftr-freshie", title: "Freshie starter kit", group: "Discover", icon: <Sparkles className="h-3.5 w-3.5" />, to: "/discover/freshie" },
  { id: "ftr-leaving", title: "Leaving soon — last chance", group: "Discover", icon: <Users className="h-3.5 w-3.5" />, to: "/discover/leaving" },
  { id: "ftr-deals", title: "Best deals under ₹500", group: "Discover", icon: <Tags className="h-3.5 w-3.5" />, to: "/discover/deals" },
];

export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const debounced = useDebounce(query, 80);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!debounced) return commands;
    const q = debounced.toLowerCase();
    return commands.filter(
      (c) => c.title.toLowerCase().includes(q) || c.group.toLowerCase().includes(q),
    );
  }, [debounced]);

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered, activeIndex]);

  if (!open) return null;

  const onSelect = (entry: CommandEntry) => {
    setOpen(false);
    navigate(entry.to);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/70 px-3 pt-[10vh] backdrop-blur-sm sm:pt-[14vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="flex w-full max-w-2xl flex-col border border-line bg-surface text-fg shadow-panel-raised"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
          <Search className="h-3.5 w-3.5 text-fg-subtle" strokeWidth={1.5} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings, categories, actions…"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(0, i - 1));
              }
              if (e.key === "Enter") {
                e.preventDefault();
                const item = filtered[activeIndex];
                if (item) onSelect(item);
              }
            }}
            className="h-7 w-full bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-6 w-6 place-items-center text-fg-subtle hover:text-fg"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
              NO_MATCH
            </div>
          ) : (
            Object.entries(
              filtered.reduce<Record<string, CommandEntry[]>>((acc, c) => {
                acc[c.group] = [...(acc[c.group] ?? []), c];
                return acc;
              }, {}),
            ).map(([group, items]) => (
              <div key={group} className="px-1.5 pb-1.5">
                <div className="px-2 pb-1 pt-1.5 text-mono text-[9px] uppercase tracking-[0.24em] text-fg-subtle">
                  {group}
                </div>
                {items.map((c) => {
                  const idx = filtered.indexOf(c);
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => onSelect(c)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-2 py-1.5 text-left transition-colors",
                        active ? "bg-ink-200" : "hover:bg-ink-200",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-6 w-6 shrink-0 place-items-center border",
                          active ? "border-signal text-signal" : "border-line text-fg-muted",
                        )}
                      >
                        {c.icon}
                      </span>
                      <span className="flex-1 truncate text-sm text-fg">{c.title}</span>
                      {c.shortcut && (
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
                          {c.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-3 py-1.5 text-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{formatCompactNumber(filtered.length)} ITEMS</span>
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-blink-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
