import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  maxLengthCounter?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, maxLengthCounter, id, value, ...props }, ref) => {
    const inputId = id || `ta-${Math.random().toString(36).slice(2, 8)}`;
    const charCount = typeof value === "string" ? value.length : 0;
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
            "relative border border-line bg-surface",
            "transition-colors duration-150 ease-out-quart",
            "focus-within:border-fg hover:border-line-strong",
            error && "border-signal",
          )}
        >
          <textarea
            ref={ref}
            id={inputId}
            value={value}
            className={cn(
              "block w-full resize-none bg-transparent px-3 py-2.5",
              "text-sm leading-relaxed text-fg placeholder:text-fg-ghost",
              "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            )}
            {...props}
          />
          {maxLengthCounter && props.maxLength && (
            <div className="pointer-events-none absolute bottom-2 right-3 text-mono text-[10px] tabular-nums text-fg-subtle">
              {charCount}/{props.maxLength}
            </div>
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
Textarea.displayName = "Textarea";
