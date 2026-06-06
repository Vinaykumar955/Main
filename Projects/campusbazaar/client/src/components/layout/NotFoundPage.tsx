import { Link } from "react-router-dom";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="grid min-h-[80dvh] place-items-center px-4">
      <div className="flex w-full max-w-lg flex-col items-center gap-5 border border-line bg-ink-100 p-8 text-center">
        <pre className="font-mono text-[10px] leading-tight text-signal">
{`┌──────────────────────────┐
│  E R R O R _ 4 0 4     │
│  ROUTE_NOT_FOUND         │
│  ─────────────────       │
│  0x404                   │
│  n=0 items               │
└──────────────────────────┘`}
        </pre>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Lost in the corridor.
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            The page you tried to reach isn't on the floor map.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link to="/">
            <Button variant="primary" size="sm" leftIcon={<Home className="h-3 w-3" />}>
              HOME
            </Button>
          </Link>
          <Link to="/browse">
            <Button variant="outline" size="sm" leftIcon={<Compass className="h-3 w-3" />}>
              BROWSE
            </Button>
          </Link>
          <button onClick={() => history.back()} type="button">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-3 w-3" />}>
              BACK
            </Button>
          </button>
        </div>
      </div>
    </div>
  );
}
