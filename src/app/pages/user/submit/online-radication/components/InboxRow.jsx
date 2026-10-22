import { ChevronRight, Hourglass } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { TableCell, TableRow } from '@/shared/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import {
  MISSING,
  WAITING_WARNING_BUSINESS_DAYS,
  documentsSummary,
  hasValue,
  pendingEntryCount,
  plural,
  waitingBusinessDays,
} from '../onlineRadicationModel';
import { ChipList } from './Chips';
import { CopyButton } from './CopyButton';
import { ExpedienteLink } from './ExpedienteLink';
import { PendingEntriesBadge } from './PendingEntriesBadge';
import { RelativeTime } from './RelativeTime';
import { StatusBadge } from './StatusBadge';

// `p-[…]` replaces the primitive's `p-4`, which Bootstrap's `.p-4` (!important, 1.5rem) would hijack.
export const CELL = 'p-[0.75rem_0.875rem] align-middle';
const WARNING_TEXT = 'text-[hsl(var(--operational-warning-text))] dark:text-[hsl(var(--warning))]';

function TruncatedText({ value, className }) {
  if (!hasValue(value)) return <span className="text-sm text-muted-foreground">{MISSING}</span>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('block cursor-default truncate text-sm text-foreground', className)}>{value}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm text-xs">{value}</TooltipContent>
    </Tooltip>
  );
}

/** One request of the inbox. The whole row opens the detail (click, Enter or Space). */
export function InboxRow({ item, now, onOpen }) {
  const waiting = waitingBusinessDays(item, now);
  const overdue = waiting > WAITING_WARNING_BUSINESS_DAYS;
  const docs = documentsSummary(item);
  const actuations = (Array.isArray(item.actuations) ? item.actuations : []).map((actuation) => actuation?.label || actuation?.code).filter(Boolean);
  const newEntries = pendingEntryCount(item);
  const needsReview = item.status === 'pending' || newEntries > 0;

  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(item);
    }
  }

  return (
    <TableRow
      data-inbox-row=""
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={handleKeyDown}
      className={cn(
        'group cursor-pointer border-border/70 transition-colors hover:bg-muted/40',
        'focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
      )}
    >
      <TableCell className={cn(CELL, 'pl-[1.25rem]', overdue && 'shadow-[inset_3px_0_0_hsl(var(--warning))]')}>
        <span className="flex items-center gap-0.5">
          <span className="whitespace-nowrap font-mono text-xs font-semibold tracking-tight text-foreground">{item.publicCode || MISSING}</span>
          <CopyButton
            value={item.publicCode}
            label={`Copiar código ${item.publicCode}`}
            className="opacity-50 group-hover:opacity-100 focus-visible:opacity-100"
          />
        </span>
      </TableCell>

      <TableCell className={CELL}>
        <RelativeTime value={item.receivedAt} now={now} className="text-sm text-foreground" />
        {overdue ? (
          <span className={cn('mt-0.5 flex items-center gap-1 whitespace-nowrap text-xs font-medium', WARNING_TEXT)}>
            <Hourglass className="h-3 w-3 shrink-0" aria-hidden="true" />
            {plural(waiting, 'día hábil', 'días hábiles')} en espera
          </span>
        ) : null}
      </TableCell>

      <TableCell className={CELL}>
        <span className="block truncate text-sm font-medium text-foreground" title={item.applicantName || undefined}>
          {item.applicantName || MISSING}
        </span>
        <span className="mt-0.5 block truncate text-xs tabular-nums text-muted-foreground">
          {item.applicantDocument || 'Sin documento'}
        </span>
      </TableCell>

      <TableCell className={CELL}>
        <TruncatedText value={item.propertyAddress} />
      </TableCell>

      <TableCell className={CELL}>
        <ChipList values={actuations} max={2} className="max-w-full" />
      </TableCell>

      <TableCell className={cn(CELL, 'whitespace-nowrap')}>
        <span className="block text-sm font-medium text-foreground">{docs.total}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{docs.required}</span>
      </TableCell>

      <TableCell className={CELL}>
        <StatusBadge status={item.status} />
        {item.status === 'radicated' && item.funIdPublic ? (
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            <span className="flex items-center gap-1 whitespace-nowrap">
              Expediente <ExpedienteLink funIdPublic={item.funIdPublic} className="text-xs" />
            </span>
            {item.vr ? <span className="block font-mono font-medium text-foreground"><span className="sr-only">VR </span>{item.vr}</span> : null}
          </span>
        ) : null}
        {item.status === 'rejected' && item.rejectedAt ? (
          <span className="mt-1 block text-xs text-muted-foreground">
            <RelativeTime value={item.rejectedAt} now={now} />
          </span>
        ) : null}
        {newEntries ? <PendingEntriesBadge count={newEntries} className="mt-1.5 flex w-fit" /> : null}
      </TableCell>

      <TableCell className={cn(CELL, 'pr-[1.25rem] text-right')}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          tabIndex={-1}
          onClick={(event) => { event.stopPropagation(); onOpen(item); }}
          aria-label={`${needsReview ? 'Revisar' : 'Ver'} solicitud ${item.publicCode || ''}`.trim()}
          className="h-8 gap-1 px-2.5 text-xs font-semibold text-[hsl(var(--primary))] hover:bg-primary/10 hover:text-[hsl(var(--primary))] [&_svg]:size-3.5"
        >
          {needsReview ? 'Revisar' : 'Ver'}
          <ChevronRight aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
