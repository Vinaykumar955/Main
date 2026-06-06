import { Link } from "react-router-dom";
import { Bookmark, Search, X } from "lucide-react";
import { useState } from "react";
import { useListings } from "@/features/listings/useListings";
import { ListingCard } from "@/features/listings/ListingCard";
import { Page, PageHeader, PageSection } from "@/components/layout/Page";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useListingsStore } from "@/store";
import { cn, formatPrice } from "@/lib/utils";

const TAGS = ["under-500", "freshie", "moving-out", "no-haggle", "with-box"];

export function SavedPage() {
  const saved = useListingsStore((s) => s.saved);
  const { data: all } = useListings({ limit: 100 });
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const items = (all?.items ?? []).filter((l) => Boolean(saved[l.id]));
  const filtered = items.filter((l) => {
    if (query && !l.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (tag && !l.tags.includes(tag)) return false;
    return true;
  });

  const totalValue = items.reduce((sum, l) => sum + l.price, 0);

  return (
    <Page>
      <PageHeader
        eyebrow="//SAVED"
        title="Your saved floor"
        description="Items you flagged. Track prices, contact sellers, claim them before they're gone."
        actions={
          <Badge variant="default" size="sm" dot>
            <span className="tabular-nums">{items.length}</span> ITEMS
          </Badge>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader title="WATCHING" />
          <CardBody>
            <div className="font-mono text-3xl font-semibold tabular-nums text-fg">{items.length}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
              {items.filter((l) => l.isFree).length} free · {items.filter((l) => l.urgent).length} urgent
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="TOTAL_VALUE" />
          <CardBody>
            <div className="font-mono text-3xl font-semibold tabular-nums text-fg">
              ₹{totalValue.toLocaleString("en-IN")}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
              {items.length > 0 ? "₹" + Math.round(totalValue / items.length).toLocaleString("en-IN") : "—"} avg
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="PRICE_DROPS" meta="7D" />
          <CardBody>
            <div className="font-mono text-3xl font-semibold tabular-nums text-success">3</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
              average drop ₹120
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 border border-line bg-ink-200 p-2">
        <div className="min-w-0 flex-1">
          <Input
            placeholder="Search your saved items…"
            leftAddon={<Search className="h-3.5 w-3.5" strokeWidth={1.5} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTag(null)}
            className={cn(
              "h-8 border px-2 font-mono text-[10px] uppercase tracking-[0.16em]",
              tag === null
                ? "border-signal bg-signal text-ink"
                : "border-line text-fg-muted hover:border-fg-subtle hover:text-fg",
            )}
          >
            ALL
          </button>
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t === tag ? null : t)}
              className={cn(
                "h-8 border px-2 font-mono text-[10px] uppercase tracking-[0.16em]",
                tag === t
                  ? "border-signal bg-signal text-ink"
                  : "border-line text-fg-muted hover:border-fg-subtle hover:text-fg",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          variant="ascii"
          title="NOTHING_SAVED"
          description="Tap the bookmark icon on any listing to start tracking it."
          action={
            <Link to="/browse">
              <Button size="sm">BROWSE_FLOOR</Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState variant="ascii" title="NO_MATCH" description="Try clearing the search." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </Page>
  );
}
