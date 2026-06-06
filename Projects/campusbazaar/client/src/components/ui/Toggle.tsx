import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled state. If omitted, the toggle runs uncontrolled via `defaultChecked`. */
  checked?: boolean;
  onChange?: (next: boolean) => void;
  defaultChecked?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md";
}

export function Toggle({
  checked,
  onChange,
  defaultChecked = false,
  label,
  description,
  size = "md",
  className,
  disabled,
  ...props
}: ToggleProps) {
  const isControlled = typeof checked === "boolean";
  const [internal, setInternal] = useState(defaultChecked);
  useEffect(() => {
    if (!isControlled) setInternal(defaultChecked);
  }, [defaultChecked, isControlled]);
  const value = isControlled ? (checked as boolean) : internal;

  const update = (next: boolean) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const trackSize = size === "sm" ? "h-4 w-7" : "h-5 w-9";
  const thumbSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const thumbOffset =
    size === "sm"
      ? value
        ? "translate-x-3"
        : "translate-x-0.5"
      : value
        ? "translate-x-4"
        : "translate-x-0.5";

  return (
    <label
      className={cn(
        "group flex cursor-pointer items-start gap-3",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => update(!value)}
        className={cn(
          "relative inline-flex shrink-0 items-center border transition-colors",
          trackSize,
          value ? "border-signal bg-signal" : "border-line bg-surface",
        )}
        {...props}
      >
        <span
          className={cn(
            "block transform border bg-ink transition-transform",
            thumbSize,
            value ? "border-ink" : "border-fg",
            thumbOffset,
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex-1 space-y-0.5">
          {label && (
            <div className="text-mono text-[11px] uppercase tracking-[0.16em] text-fg">
              {label}
            </div>
          )}
          {description && (
            <p className="text-[11px] text-fg-muted">{description}</p>
          )}
        </div>
      )}
    </label>
  );
}
