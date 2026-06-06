import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  variant?: "line" | "ascii" | "dot";
  label?: string;
}

export function Separator({
  orientation = "horizontal",
  variant = "line",
  label,
  className,
  ...props
}: SeparatorProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("h-full w-px bg-line", className)}
        {...props}
      />
    );
  }

  if (variant === "ascii") {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn("flex items-center gap-2 text-fg-subtle", className)}
        {...props}
      >
        <span className="font-mono text-[10px] tracking-widest">─</span>
        {label && (
          <span className="font-mono text-[9px] uppercase tracking-[0.2em]">
            {label}
          </span>
        )}
        <span
          className="font-mono text-[10px] tracking-widest"
          aria-hidden="true"
        >
          ─────────────────────────
        </span>
      </div>
    );
  }

  if (variant === "dot") {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn("flex items-center gap-1.5 text-fg-subtle", className)}
        {...props}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="h-0.5 w-0.5 rounded-full bg-fg-subtle"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("h-px w-full bg-line", className)}
      {...props}
    />
  );
}
