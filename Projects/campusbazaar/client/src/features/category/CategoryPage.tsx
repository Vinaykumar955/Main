import { Link, useSearchParams, useParams } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { useCategories, useListings } from "@/features/listings/useListings";
import { ListingCard } from "@/features/listings/ListingCard";
import { Page, PageHeader } from "@/components/layout/Page";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonList } from "@/components/ui/Skeleton";

export function CategoryPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const { data: categories } = useCategories();
  const category = categories?.find((c) => c.slug === slug);
  const sort = params.get("sort") ?? "newest";
  const search = params.get("q") ?? undefined;
  const { data, isLoading } = useListings({ category: slug, sort: sort as never, search, limit: 24 });

  return (
    <Page>
      <PageHeader
        eyebrow={`//CATEGORY/${slug.toUpperCase()}`}
        title={category?.name ?? slug.replace(/-/g, " ")}
        description={category?.description}
        actions={
          <Link to="/browse">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-3 w-3" />}>
              ALL
            </Button>
          </Link>
        }
        meta={
          <>
            <Badge variant="default" size="sm" dot>
              <span className="tabular-nums">{data?.total ?? 0}</span> ITEMS
            </Badge>
            <Badge variant="info" size="sm">
              {category?.name.toUpperCase()}
            </Badge>
          </>
        }
      />
      {isLoading ? (
        <SkeletonList count={8} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<Package className="h-4 w-4" />}
          title="CATEGORY_EMPTY"
          description="No items in this category yet. Be the first to post."
          action={
            <Link to="/sell">
              <Button size="sm">POST_ITEM</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </Page>
  );
}
