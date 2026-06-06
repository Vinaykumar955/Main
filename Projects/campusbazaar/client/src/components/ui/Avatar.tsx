import { cn, initials } from "@/lib/utils";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  online?: boolean;
  className?: string;
  status?: "online" | "idle" | "dnd" | "offline";
}

const sizeMap = {
  xs: "h-5 w-5 text-[8px]",
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[10px]",
  lg: "h-10 w-10 text-xs",
  xl: "h-14 w-14 text-sm",
  "2xl": "h-20 w-20 text-lg",
} as const;

const statusColor = {
  online: "bg-success",
  idle: "bg-warning",
  dnd: "bg-signal",
  offline: "bg-fg-subtle",
} as const;

export function Avatar({
  src,
  name,
  size = "md",
  online,
  status,
  className,
}: AvatarProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          className={cn(
            "block border border-line object-cover",
            sizeMap[size],
          )}
        />
      ) : (
        <div
          className={cn(
            "grid place-items-center border border-line bg-surface-raised font-mono uppercase text-fg-muted",
            sizeMap[size],
          )}
          aria-label={name}
          role="img"
        >
          {initials(name)}
        </div>
      )}
      {(online || status) && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2 w-2 border border-ink-200",
            statusColor[status ?? (online ? "online" : "offline")],
            status === "online" && "animate-blink-dot",
          )}
        />
      )}
    </div>
  );
}
