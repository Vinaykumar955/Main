import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { localStore, fakeAsync } from "@/data";
import { useToastStore } from "@/store";
import { createListingSchema, type CreateListingInput } from "./listingService";
import type { Listing, ListingFilter, SortOption } from "@/types/domain";

export const listingKeys = {
  all: ["listings"] as const,
  list: (filter: ListingFilter) => ["listings", "list", filter] as const,
  detail: (id: string) => ["listings", "detail", id] as const,
  similar: (id: string) => ["listings", "similar", id] as const,
  saved: ["listings", "saved"] as const,
  categories: ["categories"] as const,
  byUser: (userId: string) => ["listings", "byUser", userId] as const,
};

export function useListings(filter: ListingFilter) {
  return useQuery({
    queryKey: listingKeys.list(filter),
    queryFn: async () => fakeAsync(localStore.getListings(filter)),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useInfiniteListings(filter: Omit<ListingFilter, "page">) {
  return useInfiniteQuery({
    queryKey: ["listings", "infinite", filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      fakeAsync(localStore.getListings({ ...filter, page: pageParam as number })),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: listingKeys.detail(id ?? ""),
    queryFn: async () => {
      const listing = localStore.getListing(id!);
      if (!listing) throw new Error("Listing not found");
      localStore.recordView(id!);
      return fakeAsync(listing, 100);
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useSimilarListings(id: string | undefined) {
  return useQuery({
    queryKey: listingKeys.similar(id ?? ""),
    queryFn: async () => fakeAsync(localStore.similar(id!), 80),
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: listingKeys.categories,
    queryFn: async () => fakeAsync(localStore.getCategories(), 60),
    staleTime: 60 * 60 * 1000,
  });
}

export function useSavedListings() {
  return useQuery({
    queryKey: listingKeys.saved,
    queryFn: async () => {
      // Filter from the global store; in real app this would be a backend call
      const all = localStore.getListings({ limit: 100 });
      return fakeAsync(all.items.slice(0, 6), 80);
    },
  });
}

export function useUserListings(userId: string | undefined) {
  return useQuery({
    queryKey: listingKeys.byUser(userId ?? ""),
    queryFn: async () => fakeAsync(localStore.getUserListings(userId!), 80),
    enabled: Boolean(userId),
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  const push = useToastStore((s) => s.push);
  return useMutation({
    mutationFn: async (input: CreateListingInput) => {
      const parsed = createListingSchema.parse(input);
      await fakeAsync(null, 500);
      const me = localStore.getUser("u1")!;
      const category = localStore.getCategories().find((c) => c.slug === parsed.category) ??
        localStore.getCategories()[0]!;
      const created = localStore.createListing({
        ...parsed,
        isFree: parsed.price === 0,
        category,
        seller: {
          id: me.id,
          name: me.name,
          username: me.username,
          avatar: me.avatar,
          verified: me.verified,
          rating: me.rating,
          listingsCount: me.listingsCount,
          soldCount: me.soldCount,
          hostel: me.hostel.name,
          room: me.room,
        },
        hostel: { id: me.hostel.id, name: me.hostel.name, block: me.hostel.block },
        status: "active",
        images: parsed.images.map((url, i) => ({
          id: `img-new-${i}`,
          url,
          alt: parsed.title,
          width: 800,
          height: 600,
        })),
        tags: parsed.tags,
      });
      return created;
    },
    onSuccess: (listing) => {
      qc.invalidateQueries({ queryKey: listingKeys.all });
      push({ type: "success", title: "LISTING_POSTED", body: listing.title });
    },
    onError: (err) => {
      push({ type: "danger", title: "POST_FAILED", body: err.message });
    },
  });
}

export function useUpdateListing(id: string) {
  const qc = useQueryClient();
  const push = useToastStore((s) => s.push);
  return useMutation({
    mutationFn: async (input: Partial<CreateListingInput>) => {
      await fakeAsync(null, 300);
      const { category: _category, hostel: _hostel, ...rest } = input;
      const patch: Partial<Listing> = {
        ...rest,
        images: rest.images?.map((url, i) => ({
          id: `img-edit-${i}`,
          url,
          alt: rest.title ?? "",
          width: 800,
          height: 600,
        })),
        tags: rest.tags,
      };
      return localStore.updateListing(id, patch);
    },
    onSuccess: (listing) => {
      qc.invalidateQueries({ queryKey: listingKeys.detail(id) });
      qc.invalidateQueries({ queryKey: listingKeys.all });
      push({ type: "success", title: "LISTING_UPDATED", body: listing?.title ?? "" });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  const push = useToastStore((s) => s.push);
  return useMutation({
    mutationFn: async (id: string) => {
      await fakeAsync(null, 200);
      return localStore.deleteListing(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: listingKeys.all });
      push({ type: "info", title: "LISTING_REMOVED" });
    },
  });
}

export function useSetListingStatus() {
  const qc = useQueryClient();
  const push = useToastStore((s) => s.push);
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Listing["status"] }) => {
      await fakeAsync(null, 200);
      return localStore.setStatus(id, status);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: listingKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: listingKeys.all });
      push({
        type: vars.status === "sold" ? "success" : "info",
        title: `STATUS_${vars.status.toUpperCase()}`,
      });
    },
  });
}

export function useSaveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, save }: { id: string; save: boolean }) => {
      await fakeAsync(null, 100);
      const listing = localStore.getListing(id);
      if (!listing) throw new Error("Not found");
      listing.saves = Math.max(0, listing.saves + (save ? 1 : -1));
      return listing;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: listingKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: listingKeys.saved });
    },
  });
}

export function useReportListing() {
  const push = useToastStore((s) => s.push);
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string; details?: string }) => {
      await fakeAsync(null, 300);
      return { id, reason };
    },
    onSuccess: () => {
      push({ type: "success", title: "REPORT_SUBMITTED", body: "Mods will review." });
    },
  });
}

export function useUploadImages() {
  const push = useToastStore((s) => s.push);
  return useMutation({
    mutationFn: async (files: File[]) => {
      // The mock store doesn't persist images. We resolve with stock URLs so
      // the upload UX is end-to-end usable in the demo.
      const fallback = [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop",
      ];
      await fakeAsync(null, 500);
      return files.map((_, i) => fallback[i % fallback.length]!);
    },
    onError: (err) => {
      push({ type: "danger", title: "UPLOAD_FAILED", body: err.message });
    },
  });
}

export function sortToQuery(sort: SortOption | string): string {
  switch (sort) {
    case "newest":
      return "-createdAt";
    case "oldest":
      return "createdAt";
    case "price-asc":
      return "price";
    case "price-desc":
      return "-price";
    case "most-viewed":
      return "-views";
    case "most-saved":
      return "-saves";
    default:
      return "-createdAt";
  }
}
