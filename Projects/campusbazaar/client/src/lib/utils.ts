/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with Tailwind conflict resolution.
 * Conditional, static, and dynamic classnames all play nicely.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency (INR by default for hostel context).
 * Uses tabular-nums via font-family, returns compact for big values.
 */
export function formatPrice(
  amount: number,
  options: { currency?: "INR" | "USD"; compact?: boolean } = {},
): string {
  const { currency = "INR", compact = false } = options;
  if (amount === 0) return "FREE";

  if (compact && amount >= 100000) {
    return `${currency === "INR" ? "₹" : "$"}${(amount / 100000).toFixed(1)}L`;
  }
  if (compact && amount >= 1000) {
    return `${currency === "INR" ? "₹" : "$"}${(amount / 1000).toFixed(1)}k`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Relative time like "2h ago" / "3d ago" — short, mechanical, mono-friendly.
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dys = Math.floor(h / 24);
  if (dys < 7) return `${dys}d ago`;
  const wks = Math.floor(dys / 7);
  if (wks < 4) return `${wks}w ago`;
  const mo = Math.floor(dys / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(dys / 365);
  return `${y}y ago`;
}

/**
 * Always-tabular time, like 12:04:38 — for telemetry strips.
 */
export function formatClock(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Short hash, used for build/version display.
 */
export function shortHash(input: string, len = 6): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(len, "0").slice(0, len);
}

/**
 * Initials from a name (max 2 chars), uppercase.
 */
export function initials(name: string | undefined | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, max = 80): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

/**
 * Generate a fake-but-stable ID for skeleton demo data.
 */
export function fakeId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Slugify for URL-safe strings.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format a date for telemetry strip: "06.06.26".
 */
export function formatDateStamp(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(-2)}`;
}

/**
 * Format large numbers compactly: 1234 → 1.2k, 1500000 → 1.5M.
 */
export function formatCompactNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1000000).toFixed(1)}M`;
}

/**
 * Build a class string from variants — meant to be used with cva.
 */
export function variants<T extends Record<string, Record<string, string>>>(styles: T) {
  return styles;
}

/**
 * Sleep utility for async flow testing.
 */
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Type-safe object entries.
 */
export function typedEntries<T extends Record<string, unknown>>(o: T) {
  return Object.entries(o) as [keyof T, T[keyof T]][];
}

/**
 * Strip a value of undefined / null.
 */
export function compact<T>(arr: (T | null | undefined | false)[]): T[] {
  return arr.filter((x): x is T => Boolean(x));
}

/**
 * Debounce function for type-safety.
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  ms: number,
): (...args: TArgs) => void {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: TArgs) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Safe JSON parse.
 */
export function safeJsonParse<T = unknown>(input: string, fallback: T): T {
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}
