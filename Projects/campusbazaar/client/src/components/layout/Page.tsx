import { useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Padded by default. Set false for full-bleed sections. */
  padded?: boolean;
  /** Tighter top spacing when used under a fixed header */
  flush?: boolean;
  size?: "default" | "wide" | "narrow" | "full";
}

const sizeMap = {
  default: "max-w-[1400px]",
  wide: "max-w-[1600px]",
  narrow: "max-w-3xl",
  full: "max-w-none",
} as const;

export function Page({
  children,
  padded = true,
  flush = false,
  size = "default",
  className,
  ...props
}: PageProps) {
  return (
    <main
      className={cn(
        sizeMap[size],
        "mx-auto w-full",
        padded && (flush ? "px-3 pt-3 sm:px-5" : "px-3 py-5 sm:px-5 sm:py-7"),
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-5 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className="text-mono mb-1.5 text-[10px] uppercase tracking-[0.24em] text-signal">
            {eyebrow}
          </div>
        )}
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">{description}</p>
        )}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          {actions}
        </div>
      )}
    </header>
  );
}

export function PageSection({
  title,
  description,
  children,
  action,
  className,
  meta,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  meta?: ReactNode;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || action) && (
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="text-mono text-[11px] uppercase tracking-[0.2em] text-fg">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-fg-muted">{description}</p>
            )}
            {meta && <div className="mt-1.5 flex items-center gap-2">{meta}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageGrid({
  children,
  cols = 4,
  className,
}: {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const map = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  } as const;
  return <div className={cn("grid gap-3", map[cols], className)}>{children}</div>;
}

export function Stack({
  children,
  className,
  gap = 3,
}: {
  children: ReactNode;
  className?: string;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
}) {
  const map = {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8",
  } as const;
  return <div className={cn("flex flex-col", map[gap], className)}>{children}</div>;
}

export function Inline({
  children,
  className,
  gap = 2,
  align = "center",
}: {
  children: ReactNode;
  className?: string;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  align?: "start" | "center" | "end" | "baseline" | "stretch";
}) {
  const g = {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
  } as const;
  const a = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    baseline: "items-baseline",
    stretch: "items-stretch",
  } as const;
  return (
    <div className={cn("flex flex-row flex-wrap", g[gap], a[align], className)}>
      {children}
    </div>
  );
}

export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin border border-current border-t-transparent"
      style={{ width: size, height: size, borderRadius: "9999px" }}
      aria-label="Loading"
    />
  );
}

export function Divider({ label }: { label?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1 text-fg-subtle">
      <span className="h-px flex-1 bg-line" />
      {label && (
        <span className="text-mono text-[10px] uppercase tracking-[0.2em]">
          {label}
        </span>
      )}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function Ticker({
  items,
  separator = "─",
}: {
  items: string[];
  separator?: string;
}) {
  return (
    <div className="relative w-full overflow-hidden border-y border-line bg-ink-200 py-1.5 text-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
      <div className="flex animate-marquee gap-6 whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-6">
            <span>{item}</span>
            <span className="text-fg-ghost">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
