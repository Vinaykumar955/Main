import { Link } from "react-router-dom";
import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Shield,
  Repeat,
  Tag,
  Calendar,
  CheckCircle2,
  Flame,
  Package,
  User,
} from "lucide-react";
import { useEffect } from "react";
import type { Listing, Review } from "@/types/domain";
import { cn, formatPrice, timeAgo, formatCompactNumber } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { StatusDot, MetaCell, LEDCounter } from "@/components/ui/Atoms";
import { useListingsStore } from "@/store";
import { useSaveListing, useSetListingStatus } from "./useListings";

export interface ListingDetailProps {
  listing: Listing;
  reviews?: Review[];
}

export function ListingDetail({ listing }: ListingDetailProps) {
  const recordView = useListingsStore((s) => s.recordView);
  const saved = useListingsStore((s) => Boolean(s.saved[listing.id]));
  const toggleSaved = useListingsStore((s) => s.toggleSaved);
  const save = useSaveListing();
  const setStatus = useSetListingStatus();

  useEffect(() => {
    recordView(listing.id);
  }, [listing.id, recordView]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
      <div className="space-y-4">
        <Gallery images={listing.images} title={listing.title} />
        <SpecsAndDescription listing={listing} />
        <SellerCard seller={listing.seller} />
      </div>

      <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <PurchaseCard
          listing={listing}
          saved={saved}
          onSave={() => {
            toggleSaved(listing.id);
            save.mutate({ id: listing.id, save: !saved });
          }}
          onMarkSold={() => setStatus.mutate({ id: listing.id, status: "sold" })}
          onMarkAvailable={() => setStatus.mutate({ id: listing.id, status: "active" })}
        />
        <SafetyCard />
        <MetaCard listing={listing} />
      </aside>
    </div>
  );
}

function Gallery({
  images,
  title,
}: {
  images: Listing["images"];
  title: string;
}) {
  const main = images[0]?.url;
  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/3] overflow-hidden border border-line bg-ink-200">
        <ImageWithFallback src={main} alt={title} aspect="4-3" />
        {images.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 right-3 border border-line bg-surface-raised px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted backdrop-blur-sm">
            01 / {String(images.length).padStart(2, "0")}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.slice(0, 6).map((img, i) => (
            <button
              key={img.id}
              type="button"
              className={cn(
                "relative aspect-square overflow-hidden border bg-ink-200 transition-colors",
                i === 0 ? "border-signal" : "border-line hover:border-fg-subtle",
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              <span className="pointer-events-none absolute bottom-0.5 right-0.5 border border-line bg-surface-raised px-1 font-mono text-[8px] tabular-nums text-fg-muted backdrop-blur-sm">
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecsAndDescription({ listing }: { listing: Listing }) {
  return (
    <div className="border border-line bg-surface">
      <div className="border-b border-line p-4">
        <div className="flex flex-wrap items-center gap-1.5 text-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
          <Link to={`/c/${listing.category.slug}`} className="hover:text-signal">
            {listing.category.name}
          </Link>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{listing.id.toUpperCase()}</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">POSTED {timeAgo(listing.createdAt)}</span>
          {listing.urgent && (
            <>
              <span aria-hidden>·</span>
              <Badge variant="danger" size="xs" dot pulse>
                URGENT
              </Badge>
            </>
          )}
        </div>
        <h1 className="mt-2 text-balance text-2xl font-semibold leading-tight tracking-tight text-fg sm:text-3xl">
          {listing.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums text-fg">
            {formatPrice(listing.price)}
          </span>
          {listing.negotiable && !listing.isFree && (
            <Badge variant="info" size="sm">NEGOTIABLE</Badge>
          )}
          {listing.swapAvailable && (
            <Badge variant="info" size="sm">OPEN TO SWAP</Badge>
          )}
          {listing.isFree && <Badge variant="success" size="sm">FREE</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border-b border-line sm:grid-cols-4">
        <Stat icon={<Tag className="h-3 w-3" strokeWidth={1.5} />} label="CONDITION" value={listing.condition} />
        <Stat icon={<MapPin className="h-3 w-3" strokeWidth={1.5} />} label="LOCATION" value={`${listing.hostel.block}`} />
        <Stat icon={<Calendar className="h-3 w-3" strokeWidth={1.5} />} label="POSTED" value={timeAgo(listing.createdAt)} />
        <Stat icon={<Eye className="h-3 w-3" strokeWidth={1.5} />} label="VIEWS" value={formatCompactNumber(listing.views)} />
      </div>

      <div className="p-4">
        <h2 className="text-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
          DESCRIPTION
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-fg">
          {listing.description}
        </p>
        {listing.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center border border-line bg-ink-200 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-r border-line p-3 last:border-r-0 sm:border-b-0">
      <span className="text-fg-subtle">{icon}</span>
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
          {label}
        </div>
        <div className="text-xs uppercase tracking-wide text-fg">{String(value)}</div>
      </div>
    </div>
  );
}

function SellerCard({ seller }: { seller: Listing["seller"] }) {
  return (
    <div className="border border-line bg-surface p-4">
      <h2 className="text-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
        SELLER
      </h2>
      <div className="mt-2.5 flex items-start gap-3">
        <Avatar src={seller.avatar} name={seller.name} size="xl" status="online" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-fg">{seller.name}</h3>
            {seller.verified && (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
            )}
          </div>
          <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
            @{seller.username} · {seller.hostel} · {seller.room}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
            <span className="flex items-center gap-1">
              <span className="text-warning">★</span>
              <span className="tabular-nums">{seller.rating.toFixed(1)}</span>
              <span className="text-fg-subtle">/5</span>
            </span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{seller.listingsCount} LISTINGS</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{seller.soldCount} SOLD</span>
          </div>
        </div>
        <Link
          to={`/u/${seller.username}`}
          className="grid h-8 w-8 shrink-0 place-items-center border border-line text-fg-muted hover:border-fg hover:text-fg"
          aria-label="View profile"
        >
          <User className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}

function PurchaseCard({
  listing,
  saved,
  onSave,
  onMarkSold,
  onMarkAvailable,
}: {
  listing: Listing;
  saved: boolean;
  onSave: () => void;
  onMarkSold: () => void;
  onMarkAvailable: () => void;
}) {
  const isSold = listing.status === "sold";
  return (
    <div className="border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="text-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
          ACTION
        </span>
        <StatusDot status={isSold ? "offline" : "online"} label />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-3xl font-semibold tabular-nums text-fg">
            {formatPrice(listing.price)}
          </span>
          {listing.negotiable && !isSold && !listing.isFree && (
            <Badge variant="info" size="sm">NEG.</Badge>
          )}
        </div>

        <Button
          variant="primary"
          size="lg"
          block
          leftIcon={<MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />}
          disabled={isSold}
        >
          {isSold ? "ITEM_SOLD" : "MESSAGE_SELLER"}
        </Button>

        <div className="grid grid-cols-3 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={saved ? <Heart className="h-3 w-3 fill-current" strokeWidth={1.5} /> : <Bookmark className="h-3 w-3" strokeWidth={1.5} />}
            onClick={onSave}
          >
            {saved ? "SAVED" : "SAVE"}
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Share2 className="h-3 w-3" strokeWidth={1.5} />}>
            SHARE
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Shield className="h-3 w-3" strokeWidth={1.5} />}>
            REPORT
          </Button>
        </div>

        {!isSold ? (
          <Button
            variant="ghost"
            size="sm"
            block
            leftIcon={<CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />}
            onClick={onMarkSold}
            className="text-fg-subtle"
          >
            MARK AS SOLD
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            block
            leftIcon={<Repeat className="h-3 w-3" strokeWidth={1.5} />}
            onClick={onMarkAvailable}
            className="text-fg-subtle"
          >
            MARK AVAILABLE
          </Button>
        )}
      </div>
    </div>
  );
}

function SafetyCard() {
  return (
    <div className="border border-line bg-ink-200 p-4">
      <div className="flex items-center gap-2">
        <Shield className="h-3.5 w-3.5 text-signal" strokeWidth={1.5} />
        <h3 className="text-mono text-[10px] uppercase tracking-[0.2em] text-fg">
          SAFETY_TIPS
        </h3>
      </div>
      <ul className="mt-2 space-y-1.5 font-mono text-[11px] text-fg-muted">
        <li>· MEET IN THE COMMON ROOM, NEVER ALONE</li>
        <li>· TEST BEFORE YOU PAY</li>
        <li>· USE THE IN-APP CHAT FOR PROOF</li>
        <li>· CHECK THE SELLER'S FLOOR SEAL</li>
      </ul>
    </div>
  );
}

function MetaCard({ listing }: { listing: Listing }) {
  return (
    <div className="border border-line bg-ink-200 p-4">
      <div className="flex items-center gap-2">
        <Package className="h-3.5 w-3.5 text-cyan" strokeWidth={1.5} />
        <h3 className="text-mono text-[10px] uppercase tracking-[0.2em] text-fg">
          METADATA
        </h3>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <MetaCell label="ID" value={listing.id.slice(0, 8).toUpperCase()} />
        <MetaCell label="VIEWS" value={formatCompactNumber(listing.views)} />
        <MetaCell label="SAVES" value={formatCompactNumber(listing.saves)} />
        <MetaCell label="UPDATED" value={timeAgo(listing.updatedAt)} />
      </div>
      <Separator variant="dot" className="my-3" />
      <div className="flex items-center justify-between">
        <span className="text-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
          FRESHNESS
        </span>
        <LEDCounter value={String(Math.min(9999, listing.views)).padStart(4, "0")} />
      </div>
    </div>
  );
}
