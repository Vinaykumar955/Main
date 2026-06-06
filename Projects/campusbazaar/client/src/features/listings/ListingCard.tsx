import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, MessageCircle, Eye, MapPin, Sparkles, Flame } from "lucide-react";
import type { Listing } from "@/types/domain";
import { cn, formatPrice, timeAgo } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useListingsStore } from "@/store";
import { useSaveListing } from "./useListings";

export interface ListingCardProps {
  listing: Listing;
  variant?: "grid" | "list" | "compact";
  className?: string;
}

export function ListingCard({ listing, variant = "grid", className }: ListingCardProps) {
  const saved = useListingsStore((s) => Boolean(s.saved[listing.id]));
  const toggleSaved = useListingsStore((s) => s.toggleSaved);
  const save = useSaveListing();

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(listing.id);
    save.mutate({ id: listing.id, save: !saved });
  };

  if (variant === "list") {
    return <ListingCardList listing={listing} saved={saved} onSave={handleSave} className={className} />;
  }

  if (variant === "compact") {
    return <ListingCardCompact listing={listing} saved={saved} onSave={handleSave} className={className} />;
  }

  return (
    <Link
      to={`/listing/${listing.id}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface shadow-panel transition-all duration-150 ease-out-quart",
        "hover:border-fg-subtle hover:shadow-panel-raised",
        className,
      )}
    >
      <div className="relative">
        <ImageWithFallback
          src={listing.images[0]?.url}
          alt={listing.title}
          aspect="4-3"
        />
        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">
          {listing.urgent && (
            <Badge variant="danger" size="xs" dot pulse>
              <Flame className="h-2.5 w-2.5" strokeWidth={2} /> URGENT
            </Badge>
          )}
          {listing.swapAvailable && (
            <Badge variant="info" size="xs">
              <Sparkles className="h-2.5 w-2.5" strokeWidth={2} /> SWAP
            </Badge>
          )}
          {listing.status === "sold" && (
            <Badge variant="default" size="xs">
              SOLD
            </Badge>
          )}
          {listing.status === "reserved" && (
            <Badge variant="warning" size="xs">
              RESERVED
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center border border-line bg-surface-raised text-fg-muted backdrop-blur-sm transition-colors hover:border-signal hover:text-signal"
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved ? (
            <BookmarkCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <Bookmark className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
        </button>
        {listing.isFree && (
          <div className="absolute bottom-2 left-2 border border-success bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-success backdrop-blur-sm">
            FREE
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center gap-1.5 text-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
          <span className="truncate">{listing.category.name}</span>
          <span aria-hidden>·</span>
          <span className="truncate tabular-nums">{timeAgo(listing.createdAt)}</span>
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-fg group-hover:text-signal">
          {listing.title}
        </h3>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-lg font-semibold tabular-nums text-fg">
            {formatPrice(listing.price)}
          </span>
          {listing.negotiable && !listing.isFree && (
            <span className="text-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
              NEG.
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-2.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar src={listing.seller.avatar} name={listing.seller.name} size="xs" />
            <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
              @{listing.seller.username}
            </span>
            {listing.seller.verified && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-label="verified" />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
            <MapPin className="h-2.5 w-2.5" strokeWidth={1.5} />
            <span className="tabular-nums">{listing.hostel.block}</span>
            <span aria-hidden>·</span>
            <Eye className="h-2.5 w-2.5" strokeWidth={1.5} />
            <span className="tabular-nums">{listing.views}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ListingCardList({
  listing,
  saved,
  onSave,
  className,
}: {
  listing: Listing;
  saved: boolean;
  onSave: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <Link
      to={`/listing/${listing.id}`}
      className={cn(
        "group flex items-stretch border border-line bg-surface transition-colors hover:border-fg-subtle",
        className,
      )}
    >
      <div className="relative w-32 shrink-0 sm:w-40">
        <ImageWithFallback
          src={listing.images[0]?.url}
          alt={listing.title}
          aspect="square"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center gap-1.5 text-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
          <span className="truncate">{listing.category.name}</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{timeAgo(listing.createdAt)}</span>
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-fg group-hover:text-signal">
          {listing.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <span className="font-mono text-base font-semibold tabular-nums text-fg">
            {formatPrice(listing.price)}
          </span>
          <div className="flex items-center gap-2 text-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" strokeWidth={1.5} />
              {listing.hostel.block}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" strokeWidth={1.5} />
              {listing.views}
            </span>
            <button
              type="button"
              onClick={onSave}
              className="grid h-6 w-6 place-items-center text-fg-muted hover:text-signal"
              aria-label="Save"
            >
              {saved ? <BookmarkCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Bookmark className="h-3.5 w-3.5" strokeWidth={1.5} />}
            </button>
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function ListingCardCompact({
  listing,
  saved,
  onSave,
  className,
}: {
  listing: Listing;
  saved: boolean;
  onSave: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <Link
      to={`/listing/${listing.id}`}
      className={cn(
        "group flex items-center gap-2 border border-line bg-surface p-2 transition-colors hover:border-fg-subtle",
        className,
      )}
    >
      <div className="relative h-12 w-12 shrink-0">
        <ImageWithFallback
          src={listing.images[0]?.url}
          alt={listing.title}
          aspect="square"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs text-fg group-hover:text-signal">
          {listing.title}
        </div>
        <div className="font-mono text-[11px] tabular-nums text-signal">
          {formatPrice(listing.price)}
        </div>
      </div>
      <button
        type="button"
        onClick={onSave}
        className="grid h-6 w-6 shrink-0 place-items-center text-fg-muted hover:text-signal"
        aria-label="Save"
      >
        {saved ? <BookmarkCheck className="h-3 w-3" strokeWidth={1.5} /> : <Bookmark className="h-3 w-3" strokeWidth={1.5} />}
      </button>
    </Link>
  );
}
