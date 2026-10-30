import { FilePlus2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { pendingEntriesLabel } from '../onlineRadicationModel';

/** Subtle "N entrada(s) nueva(s)" marker for requests with document entries waiting. */
export function PendingEntriesBadge({ count, className }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full border-[1px] border-solid border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold leading-4 text-[hsl(var(--primary))]',
        className,
      )}
    >
      <FilePlus2 className="h-3 w-3 shrink-0" aria-hidden="true" />
      {pendingEntriesLabel(count)}
    </span>
  );
}
