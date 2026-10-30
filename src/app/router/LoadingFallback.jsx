// Suspense fallback shared by the route tree: a page-shaped skeleton.
import { useEffect, useState } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';

// Fast chunk loads resolve before this, so the skeleton never flashes.
const SHOW_DELAY_MS = 120;
const statCardKeys = ['route-loading-stat-1', 'route-loading-stat-2', 'route-loading-stat-3', 'route-loading-stat-4'];
const tableRowKeys = Array.from({ length: 6 }, (_, index) => `route-loading-row-${index + 1}`);

export default function LoadingFallback() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return <div className="min-h-[60vh]" aria-busy="true" />;

  return (
    <div className="min-h-[60vh] space-y-6 p-1 animate-in fade-in duration-300" role="status" aria-label="Cargando contenido">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 rounded-lg" />
          <Skeleton className="h-4 w-40 bg-muted/60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCardKeys.map((key) => (
          <div key={key} className="space-y-3 rounded-2xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3 bg-muted/60" />
              </div>
            </div>
            <Skeleton className="h-6 w-1/2" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="ml-auto h-8 w-24 rounded-lg" />
        </div>
        <div className="divide-y divide-border/40">
          {tableRowKeys.map((key) => (
            <div key={key} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20 bg-muted/60" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Cargando contenido…</span>
    </div>
  );
}
