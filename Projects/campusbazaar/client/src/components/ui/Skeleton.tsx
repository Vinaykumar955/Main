import { type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  variant?: "rect" | "text" | "circle" | "block";
  style?: CSSProperties;
}

export function Skeleton({ className, variant = "rect", style }: SkeletonProps) {
  const base = "skeleton";
  const variantClass = {
    rect: "rounded-none",
    text: "h-3 rounded-none",
    circle: "rounded-full",
    block: "rounded-none",
  } as const;
  return (
    <div className={cn(base, variantClass[variant], className)} style={style} />
  );
}

export function SkeletonText({
  lines = 3,
  lastWidth = "60%",
}: {
  lines?: number;
  lastWidth?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-2.5"
          // last line shorter for realism
          style={{ width: i === lines - 1 ? lastWidth : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="border border-line bg-surface">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-2 w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-3 py-3 last:border-b-0">
      <Skeleton variant="circle" className="h-8 w-8 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-2.5 w-1/2" />
        <Skeleton className="h-2 w-1/3" />
      </div>
      {children}
    </div>
  );
}
