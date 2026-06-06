import { z } from "zod";

/**
 * Centralised string table. Drop all user-facing copy here to keep JSX free of
 * hardcoded text — keeps the i18n door open and reviews easy.
 */
export const COPY = {
  app: {
    name: "CAMPUS//BAZAAR",
    tagline: "Hostel floor's marketplace",
    version: "v0.1.0",
  },
  nav: {
    home: "Home",
    browse: "Browse",
    sell: "Sell",
    messages: "Messages",
    profile: "Profile",
    saved: "Saved",
    notifications: "Notifications",
    admin: "Admin",
    signIn: "Sign In",
    signOut: "Sign Out",
  },
  actions: {
    post: "POST_ITEM",
    contact: "Contact",
    save: "Save",
    saved: "Saved",
    unsave: "Unsave",
    share: "Share",
    report: "Report",
    markSold: "Mark as sold",
    markAvailable: "Mark available",
    delete: "Delete",
    edit: "Edit",
    cancel: "Cancel",
    confirm: "Confirm",
    retry: "Retry",
    loadMore: "Load more",
    filters: "Filters",
    sort: "Sort",
    clear: "Clear all",
    apply: "Apply",
  },
  states: {
    loading: "Loading…",
    empty: "Nothing here yet",
    error: "Something went wrong",
    offline: "You're offline",
  },
  auth: {
    signInTitle: "AUTH//ACCESS",
    signInSubtitle: "Verify your .edu to enter the floor",
    signUpTitle: "NEW//RESIDENT",
    signUpSubtitle: "Create your floor identity",
    emailLabel: "EMAIL",
    passwordLabel: "PASSWORD",
    nameLabel: "NAME",
    submit: "CONTINUE",
  },
  listing: {
    title: "TITLE",
    description: "DESCRIPTION",
    price: "PRICE",
    category: "CATEGORY",
    condition: "CONDITION",
    images: "IMAGES",
    location: "LOCATION",
    negotiable: "NEGOTIABLE",
    urgent: "URGENT_SALE",
    swap: "OPEN_TO_SWAP",
    free: "FREE",
    status: {
      active: "ACTIVE",
      sold: "SOLD",
      draft: "DRAFT",
      reserved: "RESERVED",
      removed: "REMOVED",
    },
    conditionOpts: {
      new: "New",
      likeNew: "Like New",
      good: "Good",
      fair: "Fair",
      poor: "Poor",
    },
  },
  errors: {
    required: "Required",
    invalidEmail: "Invalid email",
    passwordTooShort: "Min 8 characters",
    passwordMismatch: "Passwords don't match",
    generic: "Something went wrong. Please try again.",
  },
} as const;

export type CopyShape = typeof COPY;

/**
 * Env schema — validated at boot, typed thereafter.
 *
 * VITE_API_URL accepts either an absolute URL (`https://api.example.com`) or a
 * root-relative path (`/api`) which Vite's dev-server proxy forwards to the
 * Express server. We use a string check (not `z.string().url()`) so the
 * default `"/api"` doesn't fail validation when no env var is set.
 *
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are optional. When both are
 * present, the auth layer can use Supabase for persistence; otherwise it
 * falls through to the in-memory local store.
 */
const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .min(1)
    .refine(
      (v) => v.startsWith("/") || /^https?:\/\//.test(v),
      "VITE_API_URL must be a root-relative path (e.g. /api) or an absolute http(s) URL",
    )
    .default("/api"),
  VITE_APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  VITE_BUILD_HASH: z.string().default("dev"),
  VITE_SUPABASE_URL: z.string().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
});

const raw = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_BUILD_HASH: import.meta.env.VITE_BUILD_HASH,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export const env = envSchema.parse({
  VITE_API_URL: raw.VITE_API_URL ?? "/api",
  VITE_APP_ENV: raw.VITE_APP_ENV ?? "development",
  VITE_BUILD_HASH: raw.VITE_BUILD_HASH ?? "dev-local",
  VITE_SUPABASE_URL: raw.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: raw.VITE_SUPABASE_ANON_KEY,
});

export const APP_CONFIG = {
  pageSize: 24,
  maxImageSize: 5 * 1024 * 1024,
  maxImagesPerListing: 6,
  messagePageSize: 50,
  heartbeatInterval: 30_000,
} as const;
