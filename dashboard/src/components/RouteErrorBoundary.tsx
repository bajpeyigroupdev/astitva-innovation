import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface ErrorBoundaryPageProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryPage extends Component<ErrorBoundaryPageProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Admin route failed to render:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-background px-6 py-16 text-foreground">
          <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
            <h1 className="text-xl font-semibold">This page could not load</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              The dashboard hit an unexpected error. You can retry the page or return to the overview.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Reload page
              </button>
              <Link to="/" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
                Back to overview
              </Link>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export const RouteErrorBoundary = ({ children }: ErrorBoundaryPageProps) => {
  const location = useLocation();
  return <ErrorBoundaryPage key={`${location.pathname}${location.search}`}>
    {children}
  </ErrorBoundaryPage>;
};

export default RouteErrorBoundary;
