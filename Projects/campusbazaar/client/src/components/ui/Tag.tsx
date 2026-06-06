import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  icon?: ReactNode;
  onRemove?: () => void;
}

const variantMap = {
  default: "border-line text-fg-muted bg-surface",
  success: "border-success/40 text-success bg-success/5",
  warning: "border-warning/40 text-warning bg-warning/5",
  danger: "border-signal/40 text-signal bg-signal/5",
  info: "border-cyan/40 text-cyan bg-cyan/5",
  neutral: "border-line text-fg-subtle bg-transparent",
} as const;

const sizeMap = {
  sm: "h-5 px-1.5 text-[9px] gap-1",
  md: "h-6 px-2 text-[10px] gap-1.5",
} as const;

export function Tag({
  className,
  variant = "default",
  size = "sm",
  icon,
  onRemove,
  children,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border font-mono uppercase tracking-[0.12em]",
        variantMap[variant],
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {icon && <span className="grid h-2.5 w-2.5 place-items-center">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 grid h-3 w-3 place-items-center hover:text-signal"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
