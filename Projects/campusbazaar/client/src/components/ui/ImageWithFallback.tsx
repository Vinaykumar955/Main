import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageWithFallbackProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt: string;
  aspect?: "square" | "video" | "auto" | "4-3" | "3-4";
  label?: string;
  showLabel?: boolean;
}

const aspectMap = {
  square: "aspect-square",
  video: "aspect-video",
  "4-3": "aspect-[4/3]",
  "3-4": "aspect-[3/4]",
  auto: "",
} as const;

export function ImageWithFallback({
  src,
  alt,
  className,
  aspect = "auto",
  label,
  showLabel = true,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const displayLabel = label ?? alt;

  if (!src || error) {
    return (
      <div
        className={cn(
          "relative grid place-items-center overflow-hidden bg-ink-200 text-fg-subtle",
          aspectMap[aspect],
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <div className="absolute inset-0 bg-dot-grid bg-dot-md opacity-60" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, var(--color-fg) 0 1px, transparent 1px 8px)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-1.5 px-3 text-center">
          <ImageOff className="h-4 w-4" strokeWidth={1.5} />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-fg-subtle">
            NO_IMAGE
          </span>
          {showLabel && displayLabel && (
            <span className="mt-0.5 line-clamp-2 text-[11px] font-medium text-fg">
              {displayLabel}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[inherit] bg-ink-200",
        aspectMap[aspect],
        className,
      )}
    >
      {!loaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
        {...props}
      />
      {showLabel && displayLabel && (
        <div
          className={cn(
            "pointer-events-none absolute left-2 bottom-2 max-w-[calc(100%-1rem)]",
            "border border-fg/30 bg-ink/70 px-1.5 py-0.5 backdrop-blur-sm",
            "transition-opacity duration-200",
            loaded ? "opacity-90" : "opacity-0",
          )}
        >
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.18em] text-fg">
            <Tag className="h-2.5 w-2.5 text-signal" strokeWidth={1.5} />
            <span className="truncate">{displayLabel}</span>
          </span>
        </div>
      )}
    </div>
  );
}
