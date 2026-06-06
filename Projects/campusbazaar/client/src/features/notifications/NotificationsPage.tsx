import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Heart,
  MessageCircle,
  Package,
  Tag,
  TrendingUp,
  Users,
  Flame,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { localStore } from "@/data";
import type { Notification } from "@/types/domain";
import { cn, timeAgo } from "@/lib/utils";
import { Page, PageHeader, PageSection } from "@/components/layout/Page";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Separator } from "@/components/ui/Separator";
import { StatusDot } from "@/components/ui/Atoms";
import { Avatar } from "@/components/ui/Avatar";

const ICON_MAP: Record<Notification["type"], LucideIcon> = {
  message: MessageCircle,
  offer: Tag,
  saved: Heart,
  system: Users,
  listing_sold: CheckCircle2,
  listing_view: TrendingUp,
  review: Package,
};

const COLOR_MAP: Record<Notification["type"], string> = {
  message: "text-cyan border-cyan/40",
  offer: "text-signal border-signal/40",
  saved: "text-warning border-warning/40",
  system: "text-fg-muted border-line",
  listing_sold: "text-success border-success/40",
  listing_view: "text-fg-muted border-line",
  review: "text-warning border-warning/40",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "message", label: "Messages" },
  { id: "offer", label: "Offers" },
  { id: "saved", label: "Saved" },
  { id: "system", label: "System" },
] as const;

export function NotificationsPage() {
  const initial = localStore.getNotifications();
  const [items, setItems] = useState<Notification[]>(initial);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const filtered = items.filter((n) => filter === "all" || n.type === filter);
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const markRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <Page>
      <PageHeader
        eyebrow="//ACTIVITY"
        title="Notifications"
        description="What's happening on your floor."
        actions={
          <>
            <Badge variant={unread > 0 ? "signal" : "default"} size="sm" dot={unread > 0} pulse={unread > 0}>
              <span className="tabular-nums">{unread}</span> UNREAD
            </Badge>
            <Button variant="outline" size="sm" onClick={markAllRead}>
              MARK_ALL_READ
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-8 border px-3 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
              filter === f.id
                ? "border-signal bg-signal text-ink"
                : "border-line text-fg-muted hover:border-fg-subtle hover:text-fg",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader
            title="FEED"
            meta={
              <span className="tabular-nums">
                {filtered.length} / {items.length} ITEMS
              </span>
            }
            actions={<StatusDot status={unread > 0 ? "loading" : "online"} label />}
          />
          <div className="divide-y divide-line">
            {filtered.length === 0 ? (
              <EmptyState
                variant="ascii"
                title="CLEAR"
                description="All caught up. New activity will show up here."
              />
            ) : (
              filtered.map((n) => {
                const Icon = ICON_MAP[n.type];
                return (
                  <Link
                    key={n.id}
                    to={n.link ?? "#"}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "group relative flex items-start gap-3 p-3 transition-colors",
                      n.read ? "bg-ink-100" : "bg-ink-200",
                      "hover:bg-ink-200",
                    )}
                  >
                    {!n.read && (
                      <span className="absolute left-0 top-0 h-full w-px bg-signal" />
                    )}
                    <div
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center border",
                        COLOR_MAP[n.type],
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-mono text-[10px] uppercase tracking-[0.2em] text-fg">
                          {n.title}
                        </h3>
                        <span className="font-mono text-[9px] tabular-nums text-fg-subtle">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-fg-muted">{n.body}</p>
                    </div>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 shrink-0 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                      strokeWidth={1.5}
                    />
                  </Link>
                );
              })
            )}
          </div>
        </Card>

        <aside className="space-y-3">
          <Card>
            <CardHeader title="PREFERENCES" />
            <CardBody className="space-y-2.5 text-xs text-fg-muted">
              <PrefRow icon={<MessageCircle className="h-3 w-3" />} label="Direct messages" enabled />
              <PrefRow icon={<Tag className="h-3 w-3" />} label="Offers" enabled />
              <PrefRow icon={<Heart className="h-3 w-3" />} label="Saved items" enabled />
              <PrefRow icon={<Flame className="h-3 w-3" />} label="Midnight rush" enabled />
              <PrefRow icon={<Users className="h-3 w-3" />} label="Floor updates" enabled />
              <PrefRow icon={<Bell className="h-3 w-3" />} label="Marketing" enabled={false} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="WEEKLY_DIGEST" />
            <CardBody className="space-y-2.5 text-xs text-fg-muted">
              <p>Top deals, fresh listings, and floor stats in one email every Sunday.</p>
              <Separator variant="dot" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
                  NEXT_DIGEST
                </span>
                <span className="font-mono text-xs tabular-nums text-fg">SUN · 10:00</span>
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </Page>
  );
}

function PrefRow({
  icon,
  label,
  enabled,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-fg">
        <span className="text-fg-subtle">{icon}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em]">{label}</span>
      </div>
      <button
        type="button"
        className={cn(
          "relative h-5 w-9 border transition-colors",
          enabled ? "border-signal bg-signal" : "border-line bg-ink-200",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-3 w-3 -translate-y-1/2 border bg-ink transition-transform",
            enabled ? "right-1 border-ink" : "left-1 border-fg",
          )}
        />
      </button>
    </div>
  );
}
