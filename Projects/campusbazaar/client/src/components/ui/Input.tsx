import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  monospace?: boolean;
}

const sizeMap = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      hint,
      error,
      leftAddon,
      rightAddon,
      size = "md",
      block = true,
      monospace = false,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className={cn("flex flex-col gap-1.5", block && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle"
          >
            {label}
            {props.required && <span className="ml-0.5 text-signal">*</span>}
          </label>
        )}
        <div
          className={cn(
            "group/input relative flex items-center gap-2",
            "border border-line rounded bg-surface px-3",
            "transition-colors duration-150 ease-out-quart",
            "focus-within:border-fg",
            "hover:border-line-strong",
            error && "border-signal",
            sizeMap[size],
          )}
        >
          {leftAddon && (
            <span className="flex h-4 w-4 items-center justify-center text-fg-subtle">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-full w-full bg-transparent text-fg placeholder:text-fg-ghost",
              "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              monospace && "font-mono text-tabular",
            )}
            {...props}
          />
          {rightAddon && (
            <span className="flex h-4 w-4 items-center justify-center text-fg-subtle">
              {rightAddon}
            </span>
          )}
        </div>
        {(hint || error) && (
          <p
            className={cn(
              "text-[10px] font-mono tracking-wide",
              error ? "text-signal" : "text-fg-subtle",
            )}
          >
            {error ? `> ${error.toUpperCase()}` : `> ${hint?.toUpperCase()}`}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
