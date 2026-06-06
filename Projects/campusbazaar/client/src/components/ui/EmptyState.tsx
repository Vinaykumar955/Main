import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: "default" | "minimal" | "ascii";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  if (variant === "ascii") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 border border-dashed border-line bg-surface/40 px-6 py-10 text-center",
          className,
        )}
      >
        <pre className="text-mono text-[10px] leading-tight text-fg-subtle">
          {`┌─────────────┐
│   EMPTY    │
│   ─────    │
│   n=0      │
└─────────────┘`}
        </pre>
        <h3 className="text-mono text-xs uppercase tracking-[0.2em] text-fg">
          {title}
        </h3>
        {description && (
          <p className="max-w-md text-xs text-fg-muted">{description}</p>
        )}
        {action}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 border border-dashed border-line bg-surface/30 px-6 py-12 text-center",
        variant === "minimal" && "py-8",
        className,
      )}
    >
      {icon && (
        <div className="grid h-10 w-10 place-items-center border border-line text-fg-muted">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-mono text-[11px] uppercase tracking-[0.2em] text-fg">
          {title}
        </h3>
        {description && (
          <p className="max-w-sm text-xs text-fg-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
