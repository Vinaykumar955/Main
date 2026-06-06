import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface State {
  error: Error | null;
}

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, info);
    }
  }

  reset = (): void => this.setState({ error: null });

  override render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-3 border border-line bg-surface p-6 text-center">
        <div className="grid h-10 w-10 place-items-center border border-signal text-signal">
          <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-mono text-xs uppercase tracking-[0.2em] text-fg">
            RENDER_FAILED
          </h2>
          <p className="mt-1 text-xs text-fg-muted">
            {error.message || "An unexpected error broke the page."}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={reset}>
          RETRY
        </Button>
      </div>
    </div>
  );
}
