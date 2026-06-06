import { useEffect, type HTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  side?: "right" | "center" | "bottom";
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)]",
} as const;

const sideMap = {
  right: "items-stretch justify-end",
  center: "items-center justify-center p-4",
  bottom: "items-end justify-center p-2 sm:items-end",
} as const;

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  side = "right",
  closeOnBackdrop = true,
  closeOnEsc = true,
  className,
  bodyClassName,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, closeOnEsc]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const variants =
    side === "right"
      ? {
          initial: { x: "100%", opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: "100%", opacity: 0 },
        }
      : side === "bottom"
        ? {
            initial: { y: "100%", opacity: 0 },
            animate: { y: 0, opacity: 1 },
            exit: { y: "100%", opacity: 0 },
          }
        : {
            initial: { opacity: 0, y: 8, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 8, scale: 0.98 },
          };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          <div className={cn("relative z-10 flex w-full", sideMap[side])}>
            <motion.div
              {...variants}
              transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
              className={cn(
                "relative flex max-h-[100dvh] w-full flex-col border border-line bg-ink-100",
                side === "right" && sizeMap[size] + " border-l",
                side === "center" && sizeMap[size] + " mx-4",
                side === "bottom" && "max-h-[90vh] border-t",
                className,
              )}
            >
              {(title || description) && (
                <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                  <div className="min-w-0 flex-1">
                    {title && (
                      <h2 className="text-mono text-xs uppercase tracking-[0.18em] text-fg">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-xs text-fg-muted">{description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="grid h-7 w-7 shrink-0 place-items-center border border-line text-fg-muted transition-colors hover:border-fg hover:text-fg"
                    aria-label="Close"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              )}
              <div className={cn("flex-1 overflow-y-auto", bodyClassName)}>
                {children}
              </div>
              {footer && (
                <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
