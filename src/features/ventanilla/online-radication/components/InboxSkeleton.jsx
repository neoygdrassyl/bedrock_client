import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { ONLINE_RADICATION_SCOPE } from '../onlineRadicationScope';

const BONE = 'motion-reduce:animate-none';

/** Placeholder rows matching the inbox table columns. */
export function InboxRowsSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-border/70" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="grid grid-cols-[13fr_13fr_15fr_15fr_15fr_9fr_14fr_6fr] items-center gap-x-[1rem] px-[1rem] py-[0.875rem]">
          <Skeleton className={cn('h-4 w-36', BONE)} />
          <Skeleton className={cn('h-4 w-16', BONE)} />
          <div className="space-y-1.5">
            <Skeleton className={cn('h-4 w-40 max-w-full', BONE)} />
            <Skeleton className={cn('h-3 w-24', BONE)} />
          </div>
          <Skeleton className={cn('h-4 w-52 max-w-full', BONE)} />
          <div className="flex gap-1">
            <Skeleton className={cn('h-5 w-20', BONE)} />
            <Skeleton className={cn('h-5 w-12', BONE)} />
          </div>
          <Skeleton className={cn('h-4 w-24', BONE)} />
          <Skeleton className={cn('h-5 w-20 rounded-full', BONE)} />
          <Skeleton className={cn('ml-auto h-7 w-16', BONE)} />
        </div>
      ))}
    </div>
  );
}

/** Suspense fallback of the lazy inbox: card frame + toolbar + rows. */
export function InboxSkeleton() {
  return (
    <div className={cn(ONLINE_RADICATION_SCOPE, 'overflow-hidden rounded-xl border bg-[hsl(var(--card))] shadow-sm')} aria-busy="true">
      <p role="status" className="sr-only">Cargando la bandeja de solicitudes en línea…</p>
      <div className="flex items-center gap-[0.75rem] px-[1.25rem] py-[1rem]" aria-hidden="true">
        <Skeleton className={cn('h-9 w-9 rounded-lg', BONE)} />
        <div className="space-y-1.5">
          <Skeleton className={cn('h-4 w-72', BONE)} />
          <Skeleton className={cn('h-3 w-96 max-w-full', BONE)} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-[1rem] border-y bg-muted/20 px-[1.25rem] py-[0.75rem]" aria-hidden="true">
        <Skeleton className={cn('h-9 w-96 max-w-full rounded-lg', BONE)} />
        <Skeleton className={cn('h-9 w-80 max-w-full', BONE)} />
      </div>
      <InboxRowsSkeleton />
    </div>
  );
}
