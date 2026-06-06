import { AuthCard } from "@/features/auth";
import { Page, PageHeader, PageSection } from "@/components/layout/Page";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Shield, Sparkles, Users, Zap } from "lucide-react";

export function AuthPage() {
  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] place-items-center bg-ink-200 bg-dot-grid bg-dot-md px-3 py-8 sm:py-12">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        <div className="hidden flex-col justify-between border border-line bg-ink-100 p-6 sm:p-8 lg:flex">
          <div>
            <div className="text-mono text-[10px] uppercase tracking-[0.24em] text-signal">
              //ACCESS
            </div>
            <h1 className="mt-2 text-balance text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">
              The floor's marketplace.<br />
              <span className="text-signal">Verified by your .edu</span>
            </h1>
            <p className="mt-3 max-w-md text-sm text-fg-muted">
              Sign in to message sellers, save items, and post your own. No strangers. No ads.
              Free for students, forever.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Feature icon={<Shield className="h-4 w-4" />} accent="signal" title="FLOOR_SEAL" body="Your floor rep vouches for every transaction." />
            <Feature icon={<Users className="h-4 w-4" />} accent="cyan" title="FLOOR_ONLY" body="No strangers, no shipping — just the same block." />
            <Feature icon={<Zap className="h-4 w-4" />} accent="success" title="INSTANT" body="Most pickups happen in under 20 minutes." />
            <Feature icon={<Sparkles className="h-4 w-4" />} accent="info" title="0% FEES" body="Built for students, run by students, free for everyone." />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 border-t border-line pt-5 text-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle">
            <div>
              <div className="font-mono text-base text-fg">1,284</div>
              <div>STUDENTS</div>
            </div>
            <div className="border-x border-line">
              <div className="font-mono text-base text-fg">3,902</div>
              <div>LISTINGS</div>
            </div>
            <div>
              <div className="font-mono text-base text-fg">10</div>
              <div>HOSTELS</div>
            </div>
          </div>
        </div>

        <AuthCard />
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: "signal" | "cyan" | "success" | "info";
}) {
  const map = {
    signal: "border-signal/40 text-signal",
    cyan: "border-cyan/40 text-cyan",
    success: "border-success/40 text-success",
    info: "border-cyan/40 text-cyan",
  } as const;
  return (
    <div className="flex items-start gap-3 rounded-md border border-line bg-ink-200 p-3 transition-all duration-150 ease-out-quart hover:border-fg-subtle hover:shadow-panel-raised">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded border ${map[accent]}`}>{icon}</div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg">{title}</div>
        <p className="text-xs text-fg-muted">{body}</p>
      </div>
    </div>
  );
}
