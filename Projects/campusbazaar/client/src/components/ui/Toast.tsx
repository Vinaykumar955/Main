import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertCircle, X, XCircle } from "lucide-react";
import { useToastStore, type Toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

const iconMap = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
  danger: XCircle,
  neutral: Info,
} as const;

const toneMap = {
  success: "border-success/40 text-success",
  info: "border-cyan/40 text-cyan",
  warning: "border-warning/40 text-warning",
  danger: "border-signal text-signal",
  neutral: "border-line text-fg-muted",
} as const;

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-[100] flex flex-col items-center gap-2 px-3 sm:bottom-3 sm:left-auto sm:right-3 sm:top-auto sm:items-end">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = iconMap[toast.type];
  const [progress, setProgress] = useState(100);
  const duration = toast.durationMs ?? 4000;

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.max(0, 100 - ((now - start) / duration) * 100);
      setProgress(pct);
      if (pct > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <motion.div
      role="status"
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm flex-col border bg-ink-100 shadow-panel-raised",
        toneMap[toast.type],
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <div className="text-mono text-[11px] uppercase tracking-[0.18em] text-fg">
            {toast.title}
          </div>
          {toast.body && (
            <div className="mt-0.5 text-xs text-fg-muted">{toast.body}</div>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="grid h-6 w-6 shrink-0 place-items-center text-fg-subtle transition-colors hover:text-fg"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
      <div className="h-px w-full bg-line">
        <div
          className="h-full bg-current transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
