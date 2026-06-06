import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Eye, Flame, Heart, MessageCircle, Share2, Users } from "lucide-react";
import { useListing, useSimilarListings } from "@/features/listings/useListings";
import { ListingDetail } from "@/features/listings/ListingDetail";
import { ListingCard } from "@/features/listings/ListingCard";
import { Page, PageHeader, PageSection } from "@/components/layout/Page";
import { SkeletonList } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export function ListingDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: listing, isLoading, isError } = useListing(id);
  const { data: similar } = useSimilarListings(id);

  if (isLoading) {
    return (
      <Page>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="aspect-[4/3] w-full animate-pulse bg-ink-200" />
            <div className="h-32 w-full animate-pulse bg-ink-200" />
          </div>
          <div className="space-y-3">
            <div className="h-44 w-full animate-pulse bg-ink-200" />
            <div className="h-28 w-full animate-pulse bg-ink-200" />
          </div>
        </div>
      </Page>
    );
  }

  if (isError || !listing) {
    return (
      <Page>
        <div className="grid min-h-[50dvh] place-items-center">
          <EmptyState
            variant="ascii"
            title="LISTING_NOT_FOUND"
            description="It may have been removed or already sold."
            action={
              <Link to="/browse">
                <Button size="sm">BROWSE_FLOOR</Button>
              </Link>
            }
          />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="mb-4">
        <Link to="/browse" className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle hover:text-fg">
          <ArrowLeft className="h-3 w-3" /> BACK_TO_BROWSE
        </Link>
      </div>
      <ListingDetail listing={listing} />

      {similar && similar.length > 0 && (
        <PageSection
          title="SIMILAR_ITEMS"
          description="From the same category."
          className="mt-8"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {similar.slice(0, 4).map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </PageSection>
      )}
    </Page>
  );
}
