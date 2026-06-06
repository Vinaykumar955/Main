import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "raised" | "inset" | "ghost";
  cornerTicks?: boolean;
  scanline?: boolean;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      cornerTicks = false,
      scanline = false,
      interactive = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-md border border-line bg-surface",
          variant === "raised" && "bg-surface-raised",
          variant === "inset" && "bg-surface-sunken",
          variant === "ghost" && "bg-transparent border-dashed",
          interactive &&
            "transition-colors duration-150 ease-out-quart hover:border-fg-subtle",
          cornerTicks && "corner-ticks",
          scanline && "scanline",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
}

export const CardHeader = ({
  className,
  title,
  meta,
  actions,
  bordered = true,
  children,
  ...props
}: CardHeaderProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3",
        bordered && "hairline-b",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        {title && (
          <div className="text-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle">
            {title}
          </div>
        )}
        {meta && (
          <div className="mt-0.5 truncate font-mono text-[10px] tabular-nums text-fg-subtle">
            {meta}
          </div>
        )}
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  );
};

export const CardBody = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-4 py-3", className)} {...props} />
);

export const CardFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center gap-2 px-4 py-3 hairline-t", className)}
    {...props}
  />
);
