import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface StatusDotProps {
  status: "online" | "idle" | "dnd" | "offline" | "loading";
  size?: "xs" | "sm" | "md";
  label?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
} as const;

const colorMap = {
  online: "bg-success animate-blink-dot",
  idle: "bg-warning",
  dnd: "bg-signal",
  offline: "bg-fg-subtle",
  loading: "bg-cyan animate-blink-dot",
} as const;

export function StatusDot({ status, size = "sm", label, className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "block rounded-full",
          sizeMap[size],
          colorMap[status],
        )}
        aria-label={status}
      />
      {label && (
        <span className="text-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
          {status}
        </span>
      )}
    </span>
  );
}

export interface MetaCellProps {
  label: string;
  value: ReactNode;
  trend?: "up" | "down" | "flat";
  className?: string;
}

export function MetaCell({ label, value, className }: MetaCellProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-mono text-[9px] uppercase tracking-[0.2em] text-fg-subtle">
        {label}
      </span>
      <span className="font-mono text-xs tabular-nums text-fg">{value}</span>
    </div>
  );
}

export interface LEDCounterProps {
  value: number | string;
  digits?: number;
  className?: string;
}

export function LEDCounter({ value, digits = 4, className }: LEDCounterProps) {
  const str = String(value).padStart(digits, "0").slice(-digits);
  return (
    <span
      className={cn(
        "inline-flex font-mono text-[11px] uppercase tracking-[0.18em] text-cyan",
        "border border-cyan/30 bg-cyan/5 px-2 py-0.5 tabular-nums",
        className,
      )}
    >
      <span className="opacity-60">[</span>
      <span className="text-glow">{str}</span>
      <span className="opacity-60">]</span>
    </span>
  );
}

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: "sm" | "md";
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, active, size = "sm", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 border rounded font-mono uppercase tracking-[0.14em] transition-colors",
          size === "sm" ? "h-6 px-2 text-[10px]" : "h-8 px-3 text-[11px]",
          active
            ? "border-signal bg-signal text-ink"
            : "border-line text-fg-muted hover:border-fg-subtle hover:text-fg",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Chip.displayName = "Chip";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `cb-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer items-center gap-2 text-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted",
          className,
        )}
      >
        <span className="relative inline-block h-4 w-4">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
            {...props}
          />
          <span
            className={cn(
              "block h-4 w-4 border border-line bg-surface transition-colors",
              "peer-checked:border-signal peer-checked:bg-signal peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-signal peer-focus-visible:outline-offset-2",
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-ink opacity-0 transition-opacity",
              "peer-checked:opacity-100",
            )}
            aria-hidden="true"
          />
        </span>
        {label}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

export interface RangeProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showValue?: boolean;
  min?: number;
  max?: number;
}

export const Range = forwardRef<HTMLInputElement, RangeProps>(
  ({ className, label, showValue, value, min = 0, max = 100, ...props }, ref) => {
    return (
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        {label && (
          <div className="flex items-center justify-between">
            <span className="text-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
              {label}
            </span>
            {showValue && (
              <span className="font-mono text-[10px] tabular-nums text-fg-muted">
                {String(value)}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          min={min}
          max={max}
          className={cn(
            "h-1 w-full appearance-none border border-line bg-surface accent-signal",
            "[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-signal",
            "[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-signal",
          )}
          {...props}
        />
      </div>
    );
  },
);
Range.displayName = "Range";
