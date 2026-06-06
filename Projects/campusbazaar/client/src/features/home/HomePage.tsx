import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Flame,
  Heart,
  MessageCircle,
  Package,
  Plus,
  Search,
  Shield,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useListings, useCategories } from "@/features/listings/useListings";
import { ListingCard } from "@/features/listings/ListingCard";
import { Page, PageSection, Inline, Stack } from "@/components/layout/Page";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { MetaCell, LEDCounter, StatusDot } from "@/components/ui/Atoms";
import { useAuthStore, useUIStore } from "@/store";
import { useClock } from "@/hooks";
import { cn, formatClock, formatDateStamp } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { localStore } from "@/data";
import { Ticker } from "@/components/layout/Page";

const HERO_PHRASES = [
  "less waste.",
  "less haggling.",
  "more dorm life.",
  "cash on pickup.",
  "no strangers.",
  "no shipping.",
];

export function HomePage() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const toggleCommand = useUIStore((s) => s.toggleCommand);
  const clock = useClock(1000);
  const { data: fresh } = useListings({ sort: "newest", limit: 8 });
  const { data: trending } = useListings({ sort: "most-viewed", limit: 4 });
  const { data: free } = useListings({ sort: "newest", category: "free", limit: 4 });
  const { data: urgent } = useListings({ sort: "newest", page: 1, limit: 50 });
  const urgentItems = urgent?.items.filter((l) => l.urgent).slice(0, 4) ?? [];
  const { data: categories } = useCategories();

  const hour = clock.getHours();
  const greeting = hour < 5 ? "LATE_NIGHT" : hour < 12 ? "GOOD_MORNING" : hour < 17 ? "GOOD_AFTERNOON" : "GOOD_EVENING";

  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setPhraseIdx((i) => (i + 1) % HERO_PHRASES.length),
      2600,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-surface-raised">
        <div className="absolute inset-0 bg-dot-grid bg-dot-md opacity-40" aria-hidden />
        <div className="absolute inset-0 bg-scanlines opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-3 py-8 sm:px-5 sm:py-12">
          <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="inline-flex items-center gap-2 border border-signal/40 bg-signal/5 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
                <span className="h-1.5 w-1.5 rounded-full bg-signal animate-blink-dot" />
                LIVE · {formatDateStamp(clock)} · {formatClock(clock)}
              </div>
              <h1 className="mt-4 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl lg:text-5xl">
                {isAuth && user
                  ? `${greeting.replace(/_/g, " ")}, ${user.name.split(" ")[0]}.`
                  : "The floor's marketplace."}
                <br />
                <span
                  key={phraseIdx}
                  className={cn("inline-block text-signal caret")}
                  aria-live="polite"
                >
                  {HERO_PHRASES[phraseIdx]}
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm text-fg-muted sm:text-base">
                Routers, topper notes, cycles, diyas — buy and sell within your hostel.
                Cash on pickup. Floor-rep sealed. No strangers, no shipping.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link to="/browse">
                  <Button variant="primary" size="lg" leftIcon={<Search className="h-3.5 w-3.5" />}>
                    BROWSE_FLOOR
                  </Button>
                </Link>
                <Link to="/sell">
                  <Button variant="outline" size="lg" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                    POST_ITEM
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={toggleCommand}
                  className="ml-1 inline-flex h-11 items-center gap-1.5 border border-line bg-surface px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted hover:border-fg-subtle hover:text-fg"
                >
                  <kbd className="border border-line bg-surface-raised px-1 text-[9px]">⌘</kbd>
                  <kbd className="border border-line bg-surface-raised px-1 text-[9px]">K</kbd>
                  <span>QUICK_SEARCH</span>
                </button>
              </div>
            </div>

            <Card className="hidden lg:block">
              <CardHeader
                title="FLOOR_PULSE"
                meta={
                  <StatusDot status="online" label />
                }
                actions={<Badge variant="success" size="sm" dot pulse>STABLE</Badge>}
              />
              <CardBody className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <MetaCell label="ONLINE_NOW" value="187" />
                  <MetaCell label="ACTIVE_LISTINGS" value={(fresh?.total ?? 0).toString()} />
                  <MetaCell label="SOLD_TODAY" value="23" />
                  <MetaCell label="AVG_PICKUP" value="18m" />
                </div>
                <div className="flex items-center justify-between border border-line bg-surface-raised p-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
                    RESPONSE_RATE
                  </span>
                  <LEDCounter value="0094" />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
                    <span>DEMAND_24H</span>
                    <span className="text-success">+18%</span>
                  </div>
                  <Sparkline
                    values={Array.from({ length: 24 }, (_, i) => 20 + Math.sin(i / 2) * 8 + i)}
                    width={300}
                    height={36}
                    stroke="var(--color-signal)"
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      <Ticker
        items={[
          "🚨 3 ITEMS POSTED IN THE LAST HOUR",
          "🔥 URGENT: cycles in BH-2 selling cheap",
          "💬 14 active threads right now",
          "📦 86 items listed this week",
          "⚡ 18-min average pickup time",
          "🪪 Floor-rep verification enabled across 4 blocks",
        ]}
      />

      <Page padded>
        {/* Discover rail */}
        <PageSection
          title="DISCOVER"
          description="Curated views into your floor."
          meta={
            <Badge variant="default" size="sm" dot>
              {fresh?.total ?? 0} TOTAL
            </Badge>
          }
          action={
            <Link to="/browse">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                VIEW_ALL
              </Button>
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <DiscoverTile
              to="/browse?sort=most-viewed"
              label="TRENDING"
              count="24"
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              accent="signal"
            />
            <DiscoverTile
              to="/c/free"
              label="FREE_ZONE"
              count={free?.total.toString() ?? "0"}
              icon={<Sparkles className="h-3.5 w-3.5" />}
              accent="success"
            />
            <DiscoverTile
              to="/c/free"
              label="FREE_ZONE"
              count={free?.total.toString() ?? "0"}
              icon={<Sparkles className="h-3.5 w-3.5" />}
              accent="success"
            />
            <DiscoverTile
              to="/browse?condition=likeNew"
              label="LIKE_NEW"
              count="62"
              icon={<Tag className="h-3.5 w-3.5" />}
              accent="info"
            />
            <DiscoverTile
              to="/browse?sort=price-asc"
              label="UNDER_500"
              count="48"
              icon={<Zap className="h-3.5 w-3.5" />}
              accent="warning"
            />
            <DiscoverTile
              to="/discover/urgent"
              label="URGENT"
              count={urgentItems.length.toString()}
              icon={<Flame className="h-3.5 w-3.5" />}
              accent="danger"
            />
            <DiscoverTile
              to="/discover/freshie"
              label="FRESHIE_KIT"
              count="12"
              icon={<Users className="h-3.5 w-3.5" />}
              accent="info"
            />
          </div>
        </PageSection>

        {/* Categories */}
        <PageSection title="CATEGORIES" description="Browse by what you're after." className="mt-6">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {(categories ?? []).slice(0, 12).map((c) => (
              <Link
                key={c.id}
                to={`/c/${c.slug}`}
                className="group/cat relative flex flex-col items-start rounded-md border border-line bg-surface p-3 transition-all duration-150 ease-out-quart hover:border-fg-subtle hover:shadow-panel-raised"
              >
                <div className="grid h-7 w-7 place-items-center rounded border border-line bg-ink-200 text-fg-muted transition-colors group-hover/cat:border-signal group-hover/cat:text-signal">
                  <Package className="h-3.5 w-3.5" strokeWidth={1.5} />
                </div>
                <div className="mt-2 text-xs font-medium text-fg group-hover/cat:text-signal">
                  {c.name}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
                  {c.count} ITEMS
                </div>
                <ArrowUpRight className="absolute right-2 top-2 h-3 w-3 text-fg-subtle opacity-0 transition-opacity group-hover/cat:opacity-100" />
              </Link>
            ))}
          </div>
        </PageSection>

        {/* Fresh */}
        <PageSection
          title="FRESH_ON_THE_FLOOR"
          description="Just posted. Move fast."
          className="mt-6"
          meta={<Badge variant="default" size="sm" dot pulse>LIVE</Badge>}
          action={
            <Link to="/browse?sort=newest">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                ALL_FRESH
              </Button>
            </Link>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(fresh?.items ?? []).slice(0, 8).map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </PageSection>

        {/* Two-column: Urgent + Free */}
        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <UrgentColumn items={urgentItems} />
          <FreeColumn items={free?.items ?? []} />
        </div>

        {/* Trending */}
        <PageSection
          title="TRENDING_NOW"
          description="What everyone's looking at."
          className="mt-6"
          action={
            <Badge variant="default" size="sm" dot>
              UPDATED_60s
            </Badge>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(trending?.items ?? []).slice(0, 4).map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </PageSection>

        {/* Trust / Floor */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TrustCard
            icon={<Shield className="h-4 w-4" />}
            title="FLOOR_SEAL"
            body="Every listing vouched by your floor rep. No fakes, no spam, no strangers."
            accent="signal"
          />
          <TrustCard
            icon={<MessageCircle className="h-4 w-4" />}
            title="IN_APP_CHAT"
            body="Threaded messages with your floor. Walk away with a paper trail."
            accent="cyan"
          />
          <TrustCard
            icon={<Zap className="h-4 w-4" />}
            title="INSTANT_PICKUP"
            body="Average 18-minute pickup within the same block. Cash on the spot."
            accent="success"
          />
        </div>
      </Page>
    </div>
  );
}

function DiscoverTile({
  to,
  label,
  count,
  icon,
  accent,
}: {
  to: string;
  label: string;
  count: string;
  icon: React.ReactNode;
  accent: "signal" | "info" | "success" | "warning" | "danger";
}) {
  const map = {
    signal: "border-signal/40 text-signal",
    info: "border-cyan/40 text-cyan",
    success: "border-success/40 text-success",
    warning: "border-warning/40 text-warning",
    danger: "border-signal text-signal",
  } as const;
  return (
    <Link
      to={to}
      className={`group/dt relative rounded-md border border-line bg-surface p-3 transition-all duration-150 ease-out-quart hover:border-fg-subtle hover:shadow-panel-raised`}
    >
      <div className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded border ${map[accent]}`}>
        {icon}
      </div>
      <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-fg">{label}</div>
      <div className="mt-0.5 font-mono text-[10px] tabular-nums text-fg-subtle">{count} ITEMS</div>
      <ArrowUpRight className="absolute right-2 top-2 h-3 w-3 text-fg-subtle opacity-0 transition-opacity group-hover/dt:opacity-100" />
    </Link>
  );
}

function UrgentColumn({ items }: { items: ReturnType<typeof localStore.getListings>["items"] }) {
  return (
    <Card>
      <CardHeader
        title="MIDNIGHT_RUSH"
        meta={<Badge variant="danger" size="xs" dot pulse>LIVE</Badge>}
        actions={<Flame className="h-3.5 w-3.5 text-signal" strokeWidth={1.5} />}
      />
      <div className="divide-y divide-line">
        {items.length === 0 ? (
          <div className="p-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
            ALL_QUIET
          </div>
        ) : (
          items.map((l) => (
            <Link
              key={l.id}
              to={`/listing/${l.id}`}
              className="flex items-start gap-3 p-3 transition-colors hover:bg-surface-raised hover:pl-3.5"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded border border-signal/40 bg-signal/5 text-signal">
                <Flame className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-fg">{l.title}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
                  @{l.seller.username} · {l.hostel.name}
                </div>
                <div className="mt-1 font-mono text-sm tabular-nums text-signal">
                  {l.isFree ? "FREE" : `₹${l.price.toLocaleString("en-IN")}`}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}

function FreeColumn({ items }: { items: ReturnType<typeof localStore.getListings>["items"] }) {
  return (
    <Card>
      <CardHeader
        title="FREE_ZONE"
        meta={<Badge variant="success" size="xs" dot>₹0</Badge>}
        actions={<Sparkles className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />}
      />
      <div className="divide-y divide-line">
        {items.length === 0 ? (
          <div className="p-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
            NO_FREE_NOW
          </div>
        ) : (
          items.map((l) => (
            <Link
              key={l.id}
              to={`/listing/${l.id}`}
              className="flex items-start gap-3 p-3 transition-colors hover:bg-surface-raised hover:pl-3.5"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded border border-success/40 bg-success/5 text-success">
                <Heart className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-fg">{l.title}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
                  @{l.seller.username} · {l.hostel.name}
                </div>
                <div className="mt-1 font-mono text-sm uppercase tracking-wide text-success">
                  CLAIM_FREE
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}

function TrustCard({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: "signal" | "cyan" | "success";
}) {
  const map = {
    signal: "border-signal/30 text-signal",
    cyan: "border-cyan/30 text-cyan",
    success: "border-success/30 text-success",
  } as const;
  return (
    <div className="rounded-md border border-line bg-surface p-4 transition-all duration-150 ease-out-quart hover:border-fg-subtle hover:shadow-panel-raised">
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded border ${map[accent]}`}>
        {icon}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg">{title}</div>
      <p className="mt-1 text-xs text-fg-muted">{body}</p>
    </div>
  );
}
