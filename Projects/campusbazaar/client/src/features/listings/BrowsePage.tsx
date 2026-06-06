import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ArrowUpDown, Grid3x3, List as ListIcon, Package, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { cn, formatCompactNumber } from "@/lib/utils";
import { useDebounce } from "@/hooks";
import { useListings, useCategories } from "./useListings";
import { ListingCard } from "./ListingCard";
import { SkeletonList, EmptyState, Button, Badge } from "@/components/ui";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Chip, Range } from "@/components/ui/Atoms";
import { sortToQuery } from "./useListings";
import type { ListingFilter, SortOption } from "@/types/domain";

const SORTS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "most-viewed", label: "Most viewed" },
  { value: "most-saved", label: "Most saved" },
];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "likeNew", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

export function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const filter: ListingFilter = {
    search: params.get("q") ?? undefined,
    category: params.get("category") ?? undefined,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    condition: params.getAll("condition") as ListingFilter["condition"],
    hostel: params.get("hostel") ?? undefined,
    sort: (params.get("sort") as SortOption) ?? "newest",
    page: Number(params.get("page") ?? 1),
  };

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (value && value !== "") next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next, { replace: true });
  };

  const toggleArrayParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    const list = next.getAll(key);
    if (list.includes(value)) {
      const filtered = list.filter((v) => v !== value);
      next.delete(key);
      filtered.forEach((v) => next.append(key, v));
    } else {
      next.append(key, value);
    }
    next.delete("page");
    setParams(next, { replace: true });
  };

  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const { data, isLoading, isError } = useListings(filter);
  const { data: categories } = useCategories();
  const search = useDebounce(filter.search, 200);

  return (
    <div className="space-y-3">
      <Header total={data?.total} search={filter.search} setParam={setParam} />
      <Toolbar
        filter={filter}
        layout={layout}
        setLayout={setLayout}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        setParam={setParam}
        onClear={clearAll}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <FilterPanel
          open={filtersOpen}
          filter={filter}
          setParam={setParam}
          toggleArrayParam={toggleArrayParam}
          categories={categories ?? []}
        />
        <div>
          {isLoading ? (
            <SkeletonList count={8} />
          ) : isError ? (
            <EmptyState
              variant="ascii"
              title="FETCH_FAILED"
              description="Network or server glitch. Pull to retry."
              action={
                <Button size="sm" onClick={() => window.location.reload()}>
                  RETRY
                </Button>
              }
            />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              variant="ascii"
              title="NO_MATCHES"
              description={
                search
                  ? `No results for "${search}". Try a different query.`
                  : "Nothing in this category yet. Be the first to post."
              }
              action={
                <Link to="/sell">
                  <Button size="sm">POST_ITEM</Button>
                </Link>
              }
            />
          ) : (
            <div
              className={cn(
                layout === "grid"
                  ? "grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-2",
              )}
            >
              {data.items.map((l) => (
                <ListingCard key={l.id} listing={l} variant={layout} />
              ))}
            </div>
          )}

          {data && data.pages > 1 && (
            <Pagination
              page={data.page}
              pages={data.pages}
              onPage={(p) => setParam("page", String(p))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Header({
  total,
  search,
  setParam,
}: {
  total: number | undefined;
  search: string | undefined;
  setParam: (k: string, v: string | undefined) => void;
}) {
  return (
    <div className="border border-line bg-surface-raised p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-mono text-[10px] uppercase tracking-[0.24em] text-signal">
            //BROWSE
          </div>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            {search ? `Results for "${search}"` : "Browse the floor"}
          </h1>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
            <span className="tabular-nums">{formatCompactNumber(total ?? 0)} ITEMS</span>
            <span aria-hidden>·</span>
            <span>UPDATED LIVE</span>
            <span aria-hidden>·</span>
            <span className="text-signal">SCAN_RESULTS</span>
          </div>
        </div>
        <div className="flex-1 sm:max-w-sm">
          <Input
            placeholder="Search by title, tag, or seller…"
            leftAddon={<SearchIcon className="h-3.5 w-3.5" strokeWidth={1.5} />}
            value={search ?? ""}
            onChange={(e) => setParam("q", e.target.value || undefined)}
          />
        </div>
      </div>
    </div>
  );
}

function Toolbar({
  filter,
  layout,
  setLayout,
  filtersOpen,
  setFiltersOpen,
  setParam,
  onClear,
}: {
  filter: ListingFilter;
  layout: "grid" | "list";
  setLayout: (l: "grid" | "list") => void;
  filtersOpen: boolean;
  setFiltersOpen: (v: boolean) => void;
  setParam: (k: string, v: string | undefined) => void;
  onClear: () => void;
}) {
  const activeFilters = [
    filter.category,
    filter.hostel,
    filter.minPrice || filter.maxPrice ? "price" : null,
    filter.condition?.length ? "condition" : null,
    filter.search,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2 border border-line bg-surface px-3 py-2">
      <button
        type="button"
        onClick={() => setFiltersOpen(!filtersOpen)}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 border px-2.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
          filtersOpen
            ? "border-signal bg-signal text-ink"
            : "border-line text-fg-muted hover:border-fg-subtle hover:text-fg",
        )}
      >
        <SlidersHorizontal className="h-3 w-3" strokeWidth={1.5} />
        FILTERS
        {activeFilters > 0 && (
          <span className="ml-1 border border-current px-1 text-[9px] tabular-nums">
            {activeFilters}
          </span>
        )}
      </button>

      {filter.category && (
        <Chip active onClick={() => setParam("category", undefined)} size="sm">
          {filter.category} <X className="h-2.5 w-2.5" />
        </Chip>
      )}
      {filter.search && (
        <Chip active onClick={() => setParam("q", undefined)} size="sm">
          "{filter.search}" <X className="h-2.5 w-2.5" />
        </Chip>
      )}
      {(filter.minPrice || filter.maxPrice) && (
        <Chip active onClick={() => {
          setParam("minPrice", undefined);
          setParam("maxPrice", undefined);
        }} size="sm">
          ₹{filter.minPrice ?? 0}–₹{filter.maxPrice ?? "∞"} <X className="h-2.5 w-2.5" />
        </Chip>
      )}

      {activeFilters > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle hover:text-signal"
        >
          CLEAR_ALL
        </button>
      )}

      <div className="ml-auto flex items-center gap-2 sm:ml-2">
        <Select
          options={SORTS}
          value={filter.sort ?? "newest"}
          onChange={(e) => setParam("sort", e.target.value)}
          size="sm"
          leftAddon={<ArrowUpDown className="h-3 w-3" strokeWidth={1.5} />}
          className="min-w-[150px]"
        />
        <div className="hidden border border-line sm:flex">
          <button
            type="button"
            onClick={() => setLayout("grid")}
            className={cn(
              "grid h-8 w-8 place-items-center",
              layout === "grid" ? "bg-ink-200 text-fg" : "text-fg-muted hover:text-fg",
            )}
            aria-label="Grid view"
          >
            <Grid3x3 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setLayout("list")}
            className={cn(
              "grid h-8 w-8 place-items-center border-l border-line",
              layout === "list" ? "bg-ink-200 text-fg" : "text-fg-muted hover:text-fg",
            )}
            aria-label="List view"
          >
            <ListIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  open,
  filter,
  setParam,
  toggleArrayParam,
  categories,
}: {
  open: boolean;
  filter: ListingFilter;
  setParam: (k: string, v: string | undefined) => void;
  toggleArrayParam: (k: string, v: string) => void;
  categories: { id: string; slug: string; name: string; icon: string }[];
}) {
  if (!open) return null;
  return (
    <aside className="border border-line bg-surface">
      <Section title="CATEGORY">
        <div className="flex flex-col gap-0.5">
          {categories.map((cat) => {
            const active = filter.category === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setParam("category", active ? undefined : cat.slug)}
                className={cn(
                  "flex items-center gap-2 border-l-2 px-2.5 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                  active
                    ? "border-signal bg-surface-raised text-fg"
                    : "border-transparent text-fg-muted hover:bg-surface-raised hover:text-fg",
                )}
              >
                <span className="grid h-5 w-5 place-items-center border border-line">
                  <Package className="h-3 w-3" strokeWidth={1.5} />
                </span>
                <span className="flex-1 truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="PRICE (₹)">
        <div className="space-y-3">
          <Range
            min={0}
            max={10000}
            step={100}
            value={filter.maxPrice ?? 10000}
            onChange={(e) => setParam("maxPrice", e.target.value)}
            showValue
            label="MAX"
          />
          <Range
            min={0}
            max={10000}
            step={100}
            value={filter.minPrice ?? 0}
            onChange={(e) => setParam("minPrice", e.target.value)}
            showValue
            label="MIN"
          />
        </div>
      </Section>

      <Section title="CONDITION">
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((c) => {
            const active = filter.condition?.includes(c.value as never);
            return (
              <Chip
                key={c.value}
                active={Boolean(active)}
                onClick={() => toggleArrayParam("condition", c.value)}
              >
                {c.label}
              </Chip>
            );
          })}
        </div>
      </Section>

      <Section title="HOSTEL" last>
        <Select
          options={[
            { value: "", label: "All hostels" },
            { value: "NC 1", label: "NC 1" },
            { value: "NC 2", label: "NC 2" },
            { value: "NC 3", label: "NC 3" },
            { value: "NC 4", label: "NC 4" },
            { value: "NC 5", label: "NC 5" },
            { value: "NC 6", label: "NC 6" },
            { value: "Zakir A", label: "Zakir A" },
            { value: "Zakir B", label: "Zakir B" },
            { value: "Zakir C", label: "Zakir C" },
            { value: "Zakir D", label: "Zakir D" },
          ]}
          value={filter.hostel ?? ""}
          onChange={(e) => setParam("hostel", e.target.value || undefined)}
        />
      </Section>
    </aside>
  );
}

function Section({
  title,
  children,
  last = false,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn("border-line p-3", !last && "border-b")}>
      <div className="mb-2 text-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
        {title}
      </div>
      {children}
    </div>
  );
}

function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-center gap-1.5">
      <Button
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        PREV
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: pages }).map((_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              className={cn(
                "h-8 min-w-8 border px-2 font-mono text-[10px] tabular-nums",
                p === page
                  ? "border-signal bg-signal text-ink"
                  : "border-line text-fg-muted hover:border-fg-subtle hover:text-fg",
              )}
            >
              {p}
            </button>
          );
        })}
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        NEXT
      </Button>
    </div>
  );
}
