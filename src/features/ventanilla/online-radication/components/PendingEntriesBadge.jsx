import { FilePlus2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { pendingEntriesLabel } from '../onlineRadicationModel';

/**
 * Subtle "N entrada(s) nueva(s)" marker for requests with document entries waiting. `compact`
 * shows "+N nuevas" (the full label stays in the accessible text and the tooltip).
 */
export function PendingEntriesBadge({ count, compact = false, className }) {
  if (!count) return null;
  const label = pendingEntriesLabel(count);
  return (
    <span
      title={compact ? label : undefined}
      className={cn(
        'inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full border-[1px] border-solid border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold leading-4 text-[hsl(var(--primary))]',
        compact && 'px-1.5 py-0',
        className,
      )}
    >
      <FilePlus2 className="h-3 w-3 shrink-0" aria-hidden="true" />
      {compact ? (
        <>
          <span aria-hidden="true">+{count} {count === 1 ? 'nueva' : 'nuevas'}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : label}
    </span>
  );
}
