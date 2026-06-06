import { type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeStyles = cva(
  cn(
    "inline-flex items-center gap-1.5 border font-mono uppercase tracking-[0.14em]",
    "transition-colors duration-150",
  ),
  {
    variants: {
      variant: {
        default: "border-line text-fg-muted bg-surface",
        signal: "border-signal text-signal bg-signal/10",
        success: "border-success/40 text-success bg-success/10",
        warning: "border-warning/40 text-warning bg-warning/10",
        danger: "border-signal text-signal bg-signal/10",
        info: "border-cyan/40 text-cyan bg-cyan/10",
        ghost: "border-line text-fg-subtle bg-transparent",
      },
      size: {
        xs: "h-5 px-1.5 text-[9px]",
        sm: "h-6 px-2 text-[10px]",
        md: "h-7 px-2.5 text-[11px]",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {
  dot?: boolean;
  pulse?: boolean;
  icon?: ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  dot = false,
  pulse = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeStyles({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current",
            pulse && "animate-blink-dot",
          )}
        />
      )}
      {icon}
      {children}
    </span>
  );
}
