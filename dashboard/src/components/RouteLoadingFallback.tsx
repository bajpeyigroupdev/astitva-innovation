export const RouteLoadingFallback = () => (
  <div className="w-full space-y-5 py-4 text-foreground" aria-busy="true">
    <div role="status" aria-live="polite" className="mx-auto max-w-6xl space-y-5">
      <span className="sr-only">Loading dashboard page…</span>
      <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-muted/70" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-muted/50" />
    </div>
  </div>
);

export default RouteLoadingFallback;
