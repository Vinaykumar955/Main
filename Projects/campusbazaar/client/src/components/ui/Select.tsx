import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  size?: "sm" | "md" | "lg";
  leftAddon?: ReactNode;
}

const sizeMap = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
} as const;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, hint, error, options, size = "md", leftAddon, id, ...props },
    ref,
  ) => {
    const inputId = id || `sel-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className="flex w-full flex-col gap-1.5">
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
            "group/select relative flex items-center gap-2 border border-line rounded bg-surface-raised px-3",
            "transition-colors duration-150 ease-out-quart",
            "focus-within:border-fg hover:border-line-strong",
            error && "border-signal",
            sizeMap[size],
          )}
        >
          {leftAddon && (
            <span className="flex h-4 w-4 items-center justify-center text-fg-subtle">
              {leftAddon}
            </span>
          )}
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "h-full w-full appearance-none bg-transparent pr-7",
              "text-fg focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-fg-subtle"
            strokeWidth={1.5}
          />
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
Select.displayName = "Select";
