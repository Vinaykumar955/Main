import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  cn(
    "group/btn relative inline-flex select-none items-center justify-center gap-2",
    "font-mono text-[11px] uppercase tracking-[0.14em] font-medium",
    "border rounded transition-all duration-150 ease-out-quart",
    "outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-signal focus-visible:outline-offset-2",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:translate-y-px active:duration-75",
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "bg-signal text-ink border-signal",
          "hover:bg-ink hover:text-signal hover:border-signal",
        ),
        secondary: cn(
          "bg-ink text-fg border-line-strong",
          "hover:bg-surface-raised hover:border-fg-subtle",
        ),
        ghost: cn(
          "bg-transparent text-fg border-transparent",
          "hover:bg-surface-raised hover:border-line",
        ),
        outline: cn(
          "bg-transparent text-fg border-line-strong",
          "hover:border-fg hover:bg-surface-raised",
        ),
        danger: cn(
          "bg-ink text-signal border-signal",
          "hover:bg-signal hover:text-ink",
        ),
        link: cn(
          "bg-transparent border-transparent text-fg underline-offset-4 underline",
          "hover:text-signal px-0 h-auto",
        ),
      },
      size: {
        xs: "h-7 px-2.5 text-[10px]",
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-11 px-5 text-xs",
        icon: "h-9 w-9 px-0",
        "icon-sm": "h-8 w-8 px-0",
        "icon-xs": "h-6 w-6 px-0 text-[10px]",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      block: false,
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      block,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(buttonStyles({ variant, size, block }), className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
        ) : leftIcon ? (
          <span className="flex h-3 w-3 items-center justify-center">
            {leftIcon}
          </span>
        ) : null}
        {children && <span className="truncate">{children}</span>}
        {rightIcon && !loading ? (
          <span className="flex h-3 w-3 items-center justify-center">
            {rightIcon}
          </span>
        ) : null}
      </button>
    );
  },
);
Button.displayName = "Button";
