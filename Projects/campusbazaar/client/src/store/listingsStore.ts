import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ID, Listing, Paginated } from "@/types/domain";
import { api } from "@/services/api";

interface DraftListing {
  title: string;
  description: string;
  price: number;
  category?: string;
  condition?: string;
  images: string[];
  tags: string[];
  negotiable: boolean;
  urgent: boolean;
  swapAvailable: boolean;
  isFree: boolean;
  step: number;
  lastSavedAt: number;
}

interface ListingsState {
  drafts: Record<string, DraftListing>;
  cached: Record<ID, Listing>;
  saved: Record<ID, number>;
  recentlyViewed: ID[];

  saveDraft: (id: string, draft: Partial<DraftListing>) => void;
  removeDraft: (id: string) => void;
  toggleSaved: (id: ID) => Promise<void>;
  cacheListing: (listing: Listing) => void;
  recordView: (id: ID) => void;

  clearRecentlyViewed: () => void;
}

const RECENT_MAX = 12;

export const useListingsStore = create<ListingsState>()(
  persist(
    (set, get) => ({
      drafts: {},
      cached: {},
      saved: {},
      recentlyViewed: [],

      saveDraft: (id, draft) =>
        set((s) => ({
          drafts: {
            ...s.drafts,
            [id]: {
              title: "",
              description: "",
              price: 0,
              images: [],
              tags: [],
              negotiable: false,
              urgent: false,
              swapAvailable: false,
              isFree: false,
              step: 0,
              ...s.drafts[id],
              ...draft,
              lastSavedAt: Date.now(),
            },
          },
        })),

      removeDraft: (id) =>
        set((s) => {
          const { [id]: _omit, ...rest } = s.drafts;
          return { drafts: rest };
        }),

      toggleSaved: async (id) => {
        const isSaved = Boolean(get().saved[id]);
        set((s) => {
          const { [id]: _omit, ...rest } = isSaved ? s.saved : { ...s.saved, [id]: Date.now() };
          return { saved: rest };
        });
        try {
          await api.post(`/listings/${id}/${isSaved ? "unsave" : "save"}`);
        } catch {
          // revert
          set((s) => {
            const { [id]: _omit, ...rest } = isSaved ? { ...s.saved, [id]: Date.now() } : s.saved;
            return { saved: rest };
          });
        }
      },

      cacheListing: (listing) =>
        set((s) => ({ cached: { ...s.cached, [listing.id]: listing } })),

      recordView: (id) =>
        set((s) => {
          const filtered = s.recentlyViewed.filter((x) => x !== id);
          return { recentlyViewed: [id, ...filtered].slice(0, RECENT_MAX) };
        }),

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: "cb.listings",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        drafts: s.drafts,
        saved: s.saved,
        recentlyViewed: s.recentlyViewed,
      }),
    },
  ),
);

export type { DraftListing, Paginated };
