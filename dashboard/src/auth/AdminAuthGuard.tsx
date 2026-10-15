import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "./authService";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const location = useLocation();
  const hasLocalSession = authService.isAuthenticated();
  const [sessionState, setSessionState] = useState<"checking" | "valid" | "invalid" | "error">(
    hasLocalSession ? "valid" : "invalid",
  );
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Dynamically inject strict noindex meta tag to prevent search indexing
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow, noarchive, nosnippet";
  }, []);

  useEffect(() => {
    if (!hasLocalSession) {
      setSessionState("invalid");
      return;
    }

    let cancelled = false;
    authService.verifySession().then((isValid) => {
      if (!cancelled) setSessionState(isValid ? "valid" : "invalid");
    }).catch((error) => {
      console.warn("Could not verify the administrator session:", error);
      if (!cancelled && !authService.isAuthenticated()) {
        setSessionState("error");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasLocalSession, retryCount]);

  if (!hasLocalSession || sessionState === "invalid") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (sessionState === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          Verifying administrator session…
        </p>
      </main>
    );
  }

  if (sessionState === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <section className="max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <h1 className="font-semibold">Could not verify your session</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The authentication service is unavailable. Your session has not been discarded.
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Retry session check
          </button>
        </section>
      </main>
    );
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
