import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { StatusDot } from "@/components/ui/Atoms";

export function AuthCard() {
  const [mode, setMode] = useState<"in" | "up">("in");

  return (
    <div className="relative rounded-md border border-line bg-ink-100 p-6 shadow-panel-raised sm:p-8">
      {/* corner ticks */}
      <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-signal" />
      <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-signal" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-signal" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-signal" />

      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-mono text-[10px] uppercase tracking-[0.24em] text-signal">
            {mode === "in" ? "AUTH//ACCESS" : "NEW//RESIDENT"}
          </div>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-fg">
            {mode === "in" ? "Welcome back to the floor." : "Join your floor's marketplace."}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {mode === "in"
              ? "Verify your .edu to enter."
              : "Three minutes. Free for students. No ads."}
          </p>
        </div>
        <StatusDot status="online" size="md" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {mode === "in" ? (
            <SignInForm onSwitchToSignUp={() => setMode("up")} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setMode("in")} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5 text-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-base text-fg">0%</span>
          <span>FEES</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-x border-line">
          <span className="font-mono text-base text-fg">.EDU</span>
          <span>VERIFIED</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-base text-fg">FLOOR</span>
          <span>ONLY</span>
        </div>
      </div>
    </div>
  );
}
