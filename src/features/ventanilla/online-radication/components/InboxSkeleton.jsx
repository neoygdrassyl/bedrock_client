import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { ONLINE_RADICATION_SCOPE } from '../onlineRadicationScope';

const BONE = 'motion-reduce:animate-none';
export const INBOX_CARD = 'rounded-2xl border border-border/70 bg-[hsl(var(--card))] shadow-[shadow:var(--elevation-floating)]';

// Same tracks as the table: three flexible text columns, then the fixed ones (see INBOX_COLUMNS).
const TABLE_TRACKS = 'grid-cols-[24%_1fr_1fr_8.5rem_7rem_11.5rem_6rem]';

/** Placeholder rows matching the inbox table (wide) and the stacked cards (narrow). */
export function InboxRowsSkeleton({ rows = 6 }) {
  const list = Array.from({ length: rows }, (_, index) => index);
  return (
    <div className="or-inbox-body" aria-hidden="true">
      <div className="or-inbox-table">
        <div className="h-9 border-b border-border/70" />
        {list.map((index) => (
          <div key={index} className={cn('grid h-12 items-center border-b border-border/60 last:border-b-0', TABLE_TRACKS)}>
            <div className="space-y-1.5 pl-[1.25rem] pr-[0.75rem]">
              <Skeleton className={cn('h-3.5 w-32 max-w-full', BONE)} />
              <Skeleton className={cn('h-3 w-20', BONE)} />
            </div>
            <div className="space-y-1.5 px-[0.75rem]">
              <Skeleton className={cn('h-3.5 w-36 max-w-full', BONE)} />
              <Skeleton className={cn('h-3 w-20', BONE)} />
            </div>
            <div className="px-[0.75rem]"><Skeleton className={cn('h-3.5 w-44 max-w-full', BONE)} /></div>
            <div className="space-y-1.5 px-[0.75rem]">
              <Skeleton className={cn('h-3.5 w-20', BONE)} />
              <Skeleton className={cn('h-3 w-14', BONE)} />
            </div>
            <div className="px-[0.75rem]"><Skeleton className={cn('ml-auto h-3.5 w-8', BONE)} /></div>
            <div className="px-[0.75rem]"><Skeleton className={cn('h-5 w-24 rounded-full', BONE)} /></div>
            <div className="pr-[1rem]"><Skeleton className={cn('ml-auto h-6 w-16', BONE)} /></div>
          </div>
        ))}
      </div>
      <div className="or-inbox-cards divide-y divide-border/60">
        {list.slice(0, 4).map((index) => (
          <div key={index} className="space-y-2 px-[1rem] py-[0.75rem]">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className={cn('h-3.5 w-32', BONE)} />
              <Skeleton className={cn('h-5 w-20 rounded-full', BONE)} />
            </div>
            <Skeleton className={cn('h-3.5 w-48 max-w-full', BONE)} />
            <Skeleton className={cn('h-3 w-36 max-w-full', BONE)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Suspense fallback of the lazy inbox: card frame + header + toolbar + rows. */
export function InboxSkeleton() {
  return (
    <div className={cn(ONLINE_RADICATION_SCOPE, INBOX_CARD, 'overflow-hidden')} aria-busy="true">
      <p role="status" className="sr-only">Cargando la bandeja de solicitudes en línea…</p>
      <div className="flex items-center gap-[0.75rem] px-[1.25rem] pb-2 pt-[0.875rem]" aria-hidden="true">
        <Skeleton className={cn('h-8 w-8 rounded-lg', BONE)} />
        <div className="space-y-1.5">
          <Skeleton className={cn('h-4 w-72 max-w-full', BONE)} />
          <Skeleton className={cn('h-3 w-96 max-w-full', BONE)} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-[1.25rem] py-2.5" aria-hidden="true">
        <Skeleton className={cn('h-9 w-[34rem] max-w-full rounded-lg', BONE)} />
        <Skeleton className={cn('h-8 w-80 max-w-full', BONE)} />
      </div>
      <InboxRowsSkeleton />
    </div>
  );
}
