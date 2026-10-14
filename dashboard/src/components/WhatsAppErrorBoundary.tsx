import React, { Component, ErrorInfo, ReactNode } from "react";

interface WhatsAppErrorBoundaryProps {
  children: ReactNode;
}

interface WhatsAppErrorBoundaryState {
  hasError: boolean;
}

class WhatsAppErrorBoundary extends Component<WhatsAppErrorBoundaryProps, WhatsAppErrorBoundaryState> {
  state: WhatsAppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WhatsAppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("WhatsApp dashboard render failed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 py-12">
          <section
            role="alert"
            className="w-full rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-xl"
          >
            <h1 className="text-lg font-semibold text-foreground">WhatsApp dashboard could not load</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The page hit an unexpected error. Reload it or return to the admin overview.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Reload WhatsApp
              </button>
              <a
                href="/"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground"
              >
                Admin overview
              </a>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default WhatsAppErrorBoundary;
