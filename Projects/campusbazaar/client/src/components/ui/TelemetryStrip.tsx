import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TelemetryStripProps {
  route?: string;
  env?: string;
  buildHash?: string;
  online?: boolean;
  className?: string;
  children?: ReactNode;
}

export function TelemetryStrip({
  route,
  env = "DEV",
  buildHash = "0xa1b2c3",
  online = true,
  className,
  children,
}: TelemetryStripProps) {
  return (
    <div
      className={cn(
        "flex h-6 items-center gap-3 border-b border-line bg-ink-200 px-3 text-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            online ? "bg-success animate-blink-dot" : "bg-signal",
          )}
        />
        <span>{online ? "ONLINE" : "OFFLINE"}</span>
      </div>
      <span aria-hidden="true">│</span>
      <span className="tabular-nums">BLD_{buildHash}</span>
      {route && (
        <>
          <span aria-hidden="true">│</span>
          <span className="truncate">RT_{route}</span>
        </>
      )}
      <span aria-hidden="true">│</span>
      <span className="border border-line px-1 text-[9px]">{env}</span>
      <div className="ml-auto flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}
