import { z } from "zod";
import type {
  Listing,
  ListingFilter,
  Paginated,
  Category,
} from "@/types/domain";
import { api, fetcher } from "@/services/api";

export const createListingSchema = z.object({
  title: z.string().min(4, "Title is too short").max(100),
  description: z.string().min(20, "Tell the story (min 20)").max(2000),
  price: z.coerce.number().int().min(0),
  isFree: z.boolean().default(false),
  negotiable: z.boolean().default(false),
  urgent: z.boolean().default(false),
  swapAvailable: z.boolean().default(false),
  condition: z.enum(["new", "likeNew", "good", "fair", "poor"]),
  category: z.string().min(1, "Pick a category"),
  tags: z.array(z.string().max(20)).max(8).default([]),
  images: z.array(z.string().url().or(z.string().startsWith("/uploads"))).min(1, "At least one image").max(6),
  hostel: z.string().min(1, "Pick a hostel"),
  room: z.string().max(12).optional().or(z.literal("")),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const listingService = {
  list: (filter: ListingFilter) =>
    fetcher<Paginated<Listing>>({
      url: "/listings",
      method: "GET",
      params: filter as Record<string, string | number | boolean | undefined>,
    }),

  get: (id: string) => fetcher<Listing>({ url: `/listings/${id}` }),

  create: (input: CreateListingInput) =>
    api.post<{ listing: Listing }>("/listings", input).then((r) => r.data.listing),

  update: (id: string, input: Partial<CreateListingInput>) =>
    api.put<{ listing: Listing }>(`/listings/${id}`, input).then((r) => r.data.listing),

  remove: (id: string) => api.delete(`/listings/${id}`),

  setStatus: (id: string, status: Listing["status"]) =>
    api.patch(`/listings/${id}/status`, { status }),

  save: (id: string) => api.post(`/listings/${id}/save`),
  unsave: (id: string) => api.delete(`/listings/${id}/save`),

  uploadImages: (form: FormData) =>
    api
      .post<{ urls: string[] }>("/uploads/images", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.urls),

  report: (id: string, reason: string, details?: string) =>
    api.post(`/listings/${id}/report`, { reason, details }),

  similar: (id: string) =>
    fetcher<{ items: Listing[] }>({ url: `/listings/${id}/similar` }).then((r) => r.items),

  categories: () =>
    fetcher<{ items: Category[] }>({ url: "/categories" }).then((r) => r.items),

  saved: () =>
    fetcher<{ items: Listing[] }>({ url: "/listings/saved" }).then((r) => r.items),

  byUser: (userId: string) =>
    fetcher<{ items: Listing[] }>({ url: `/users/${userId}/listings` }).then((r) => r.items),
};
