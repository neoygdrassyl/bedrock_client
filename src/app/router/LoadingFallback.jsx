// Suspense fallback shared by the route tree.
const loadingFallbackItems = Array.from({ length: 8 }, (_, index) => `route-loading-card-${index + 1}`);

export default function LoadingFallback() {
  return (
    <div className="space-y-6 p-2 md:p-4 animate-in fade-in duration-300">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted rounded-md animate-pulse" />
        <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
      </div>
      {/* Content skeleton — mimics card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {loadingFallbackItems.map((itemKey, index) => (
          <div key={itemKey} className="rounded-lg border border-border/40 p-4 space-y-3" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted/60 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
