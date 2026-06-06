import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipContextShape {
  open: boolean;
  setOpen: (open: boolean) => void;
}

import { createContext, useContext, useState } from "react";

const TooltipContext = createContext<TooltipContextShape | null>(null);

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const sideMap = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  } as const;
  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 whitespace-nowrap border border-line bg-ink-100 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-fg shadow-panel-raised",
            sideMap[side],
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  return ctx;
}
