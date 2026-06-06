import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Eye,
  Flag,
  Package,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { localStore } from "@/data";
import { Page, PageHeader, PageSection } from "@/components/layout/Page";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { MetaCell, LEDCounter, StatusDot } from "@/components/ui/Atoms";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { cn, formatPrice, timeAgo } from "@/lib/utils";

const REPORTS = [
  { id: "r1", listing: "Lamp · BH-1", reason: "Wrong category", reporter: "kabir_s", status: "pending", time: "1h ago" },
  { id: "r2", listing: "Cycle · BH-2", reason: "Duplicate listing", reporter: "ishav", status: "pending", time: "3h ago" },
  { id: "r3", listing: "Router · GH-1", reason: "Suspicious pricing", reporter: "rohanm", status: "pending", time: "6h ago" },
  { id: "r4", listing: "Notes · BH-1", reason: "Spam", reporter: "priya_n", status: "resolved", time: "1d ago" },
  { id: "r5", listing: "Diyas · BH-1", reason: "Inappropriate", reporter: "ananya_i", status: "pending", time: "1d ago" },
  { id: "r6", listing: "Shoes · GH-2", reason: "Other", reporter: "kavya.m", status: "dismissed", time: "2d ago" },
  { id: "r7", listing: "Chair · BH-1", reason: "Wrong category", reporter: "arjun.b", status: "pending", time: "2d ago" },
];

export function AdminDashboardPage() {
  const [tab, setTab] = useState<"overview" | "reports" | "users" | "listings">("overview");
  const listings = localStore.getListings({ limit: 100 }).items;
  const users = localStore.getUser("u1")!;
  const sparkSignups = Array.from({ length: 14 }, (_, i) => 12 + i / 2 + Math.sin(i) * 4);
  const sparkListings = Array.from({ length: 14 }, (_, i) => 8 + i * 0.4 + Math.cos(i / 2) * 5);

  return (
    <div className="space-y-5 p-3 sm:p-5">
      <PageHeader
        eyebrow="//CONSOLE"
        title="Admin Dashboard"
        description="Live pulse of your floor's marketplace. Take action, approve, moderate."
        actions={
          <>
            <Badge variant="success" size="sm" dot pulse>
              ALL_SYSTEMS_GO
            </Badge>
            <Button variant="outline" size="sm" leftIcon={<Activity className="h-3 w-3" />}>
              EXPORT_LOG
            </Button>
          </>
        }
        meta={
          <Tabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "reports", label: "Reports", count: 7 },
              { id: "users", label: "Users" },
              { id: "listings", label: "Listings" },
            ]}
            active={tab}
            onChange={(id) => setTab(id as never)}
            size="sm"
          />
        }
      />

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="USERS" value="1,284" delta="+12" accent="signal" spark={sparkSignups} />
            <KpiCard label="LISTINGS" value="3,902" delta="+86" accent="cyan" spark={sparkListings} />
            <KpiCard label="SOLD_30D" value="612" delta="+18%" accent="success" spark={sparkListings.map((v) => v * 0.6)} />
            <KpiCard label="PENDING" value="7" delta="-3" accent="warning" spark={sparkListings.map((v) => v * 0.1)} />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader title="ACTIVITY_FEED" meta="LIVE" actions={<StatusDot status="loading" label />} />
              <div className="divide-y divide-line">
                {Array.from({ length: 8 }).map((_, i) => {
                  const events = [
                    { icon: Package, color: "text-cyan", text: "Rohan posted a router in BH-1" },
                    { icon: CheckCircle2, color: "text-success", text: "Isha marked a notebook as SOLD" },
                    { icon: Flag, color: "text-signal", text: "Ananya reported a lamp" },
                    { icon: Users, color: "text-fg-muted", text: "New floor rep assigned: BH-2 floor 3" },
                    { icon: Package, color: "text-cyan", text: "Vihaan posted 3 textbooks" },
                    { icon: CheckCircle2, color: "text-success", text: "Saanvi marked kurti set as SOLD" },
                    { icon: Eye, color: "text-fg-muted", text: "Aditya's listing crossed 100 views" },
                    { icon: Flag, color: "text-signal", text: "Kabir reported a duplicate cycle" },
                  ];
                  const e = events[i % events.length]!;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className={cn("grid h-7 w-7 shrink-0 place-items-center border border-line", e.color)}>
                        <e.icon className="h-3 w-3" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1 text-xs text-fg">{e.text}</div>
                      <span className="font-mono text-[9px] tabular-nums text-fg-subtle">
                        {String((i + 1) * 3).padStart(2, "0")}m
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="space-y-3">
              <Card>
                <CardHeader title="MODERATION_QUEUE" meta="07 PENDING" />
                <div className="divide-y divide-line">
                  {REPORTS.slice(0, 4).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-ink-200"
                    >
                      <div className="grid h-7 w-7 shrink-0 place-items-center border border-signal text-signal">
                        <Flag className="h-3 w-3" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs text-fg">{r.listing}</div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
                          {r.reason} · @{r.reporter}
                        </div>
                      </div>
                      <span className="font-mono text-[9px] tabular-nums text-fg-subtle">{r.time}</span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader title="TOP_FLOORS" />
                <div className="space-y-1.5 p-3">
                  {["BH-1", "GH-1", "BH-2", "GH-2"].map((h, i) => {
                    const v = [86, 64, 51, 22][i]!;
                    return (
                      <div key={h} className="space-y-0.5">
                        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
                          <span className="text-fg">{h}</span>
                          <span className="text-fg-subtle tabular-nums">{v} listings</span>
                        </div>
                        <div className="h-1 w-full bg-ink-200">
                          <div className="h-full bg-signal" style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {tab === "reports" && <ReportsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "listings" && <ListingsTab items={listings} />}
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  accent,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  accent: "signal" | "cyan" | "success" | "warning";
  spark: number[];
}) {
  const map = {
    signal: "text-signal",
    cyan: "text-cyan",
    success: "text-success",
    warning: "text-warning",
  } as const;
  return (
    <div className="border border-line bg-surface p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-fg-subtle">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tabular-nums text-fg">{value}</span>
        <span className={cn("font-mono text-[10px] tabular-nums", map[accent])}>{delta}</span>
      </div>
      <div className="mt-2">
        <Sparkline values={spark} width={180} height={26} stroke={`var(--color-${accent === "warning" ? "warning" : accent === "cyan" ? "cyan" : accent === "success" ? "success" : "signal"})`} />
      </div>
    </div>
  );
}

function ReportsTab() {
  const [filter, setFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("pending");
  const filtered = REPORTS.filter((r) => filter === "all" || r.status === filter);
  return (
    <>
      <div className="flex items-center gap-1.5">
        {(["all", "pending", "resolved", "dismissed"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "h-8 border px-3 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
              filter === f
                ? "border-signal bg-signal text-ink"
                : "border-line text-fg-muted hover:border-fg-subtle hover:text-fg",
            )}
          >
            {f} <span className="ml-1 tabular-nums">{f === "all" ? REPORTS.length : REPORTS.filter((r) => r.status === f).length}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="divide-y divide-line">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center border border-line bg-ink-200">
                <Flag className="h-3.5 w-3.5 text-signal" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-fg">{r.listing}</span>
                  <Badge
                    variant={r.status === "pending" ? "warning" : r.status === "resolved" ? "success" : "default"}
                    size="xs"
                  >
                    {r.status}
                  </Badge>
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
                  {r.reason} · reported by @{r.reporter} · {r.time}
                </div>
              </div>
              {r.status === "pending" && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button size="sm" variant="outline" leftIcon={<X className="h-3 w-3" />}>
                    DISMISS
                  </Button>
                  <Button size="sm" variant="danger" leftIcon={<Trash2 className="h-3 w-3" />}>
                    REMOVE
                  </Button>
                  <Button size="sm" variant="primary" leftIcon={<CheckCircle2 className="h-3 w-3" />}>
                    RESOLVE
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function UsersTab() {
  const users = Array.from({ length: 6 }, (_, i) => localStore.getUser(`u${i + 1}`)).filter(Boolean);
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line text-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
              <th className="px-3 py-2">USER</th>
              <th className="px-3 py-2">HOSTEL</th>
              <th className="px-3 py-2">LISTINGS</th>
              <th className="px-3 py-2">SOLD</th>
              <th className="px-3 py-2">RATING</th>
              <th className="px-3 py-2">LAST_SEEN</th>
              <th className="px-3 py-2">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) =>
              u ? (
                <tr key={u.id} className="border-b border-line transition-colors hover:bg-ink-200">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <div className="text-fg">{u.name}</div>
                        <div className="font-mono text-[9px] tracking-wide text-fg-subtle">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">{u.hostel.name}</td>
                  <td className="px-3 py-2 font-mono text-[10px] tabular-nums text-fg-muted">{u.listingsCount}</td>
                  <td className="px-3 py-2 font-mono text-[10px] tabular-nums text-fg-muted">{u.soldCount}</td>
                  <td className="px-3 py-2 font-mono text-[10px] tabular-nums text-warning">{u.rating.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono text-[10px] tabular-nums text-fg-subtle">{timeAgo(u.lastSeenAt)}</td>
                  <td className="px-3 py-2">
                    <Badge variant={u.verified ? "success" : "default"} size="xs" dot>
                      {u.verified ? "ACTIVE" : "PENDING"}
                    </Badge>
                  </td>
                </tr>
              ) : null,
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ListingsTab({ items }: { items: ReturnType<typeof localStore.getListings>["items"] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line text-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
              <th className="px-3 py-2">LISTING</th>
              <th className="px-3 py-2">SELLER</th>
              <th className="px-3 py-2">CATEGORY</th>
              <th className="px-3 py-2">PRICE</th>
              <th className="px-3 py-2">STATUS</th>
              <th className="px-3 py-2">VIEWS</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 10).map((l) => (
              <tr key={l.id} className="border-b border-line transition-colors hover:bg-ink-200">
                <td className="px-3 py-2">
                  <div className="line-clamp-1 max-w-[200px] text-fg">{l.title}</div>
                  <div className="font-mono text-[9px] tabular-nums text-fg-subtle">{l.id.toUpperCase()}</div>
                </td>
                <td className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">@{l.seller.username}</td>
                <td className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">{l.category.name}</td>
                <td className="px-3 py-2 font-mono text-[10px] tabular-nums text-fg">{formatPrice(l.price)}</td>
                <td className="px-3 py-2">
                  <Badge
                    variant={l.status === "active" ? "success" : l.status === "sold" ? "default" : "warning"}
                    size="xs"
                  >
                    {l.status}
                  </Badge>
                </td>
                <td className="px-3 py-2 font-mono text-[10px] tabular-nums text-fg-subtle">{l.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function AdminActivityPage() {
  return (
    <div className="space-y-4 p-3 sm:p-5">
      <PageHeader
        eyebrow="//CONSOLE"
        title="Live Activity"
        description="Real-time feed of every event on the marketplace."
        actions={<Badge variant="success" size="sm" dot pulse>STREAMING</Badge>}
      />
      <Card>
        <div className="divide-y divide-line">
          {Array.from({ length: 24 }).map((_, i) => {
            const events = [
              { icon: Package, text: "Rohan posted a router", color: "text-cyan" },
              { icon: Eye, text: "Ananya viewed 3 listings", color: "text-fg-muted" },
              { icon: CheckCircle2, text: "Isha marked notebook as SOLD", color: "text-success" },
              { icon: Flag, text: "Kabir reported a cycle", color: "text-signal" },
              { icon: Users, text: "Saanvi signed up", color: "text-fg-muted" },
              { icon: Package, text: "Vihaan posted 3 textbooks", color: "text-cyan" },
            ];
            const e = events[i % events.length]!;
            return (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className={cn("grid h-7 w-7 place-items-center border border-line", e.color)}>
                  <e.icon className="h-3 w-3" strokeWidth={1.5} />
                </div>
                <span className="flex-1 text-xs text-fg">{e.text}</span>
                <span className="font-mono text-[9px] tabular-nums text-fg-subtle">{String(i * 13 % 60).padStart(2, "0")}s ago</span>
                <LEDCounter value={String(1000 + i * 7).padStart(4, "0")} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
