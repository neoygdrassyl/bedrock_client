import { ChevronRight, Hourglass } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { MISSING, formatDateTime, formatRelative, hasValue, pendingEntryCount } from '../onlineRadicationModel';
import { actuationLabels, documentsRatio, formatNumericDate, needsAction, rowStatus, waitInfo } from '../inboxModel';
import { ChipList } from './Chips';
import { CopyButton } from './CopyButton';
import { ExpedienteLink } from './ExpedienteLink';
import { PendingEntriesBadge } from './PendingEntriesBadge';
import { StatusBadge } from './StatusBadge';

/*
 * Cell contents shared by the table rows (wide inbox) and the stacked cards (narrow inbox), so
 * both layouts show the same data with the same wording.
 */

export const WARNING_TEXT = 'text-[hsl(var(--operational-warning-text))] dark:text-[hsl(var(--warning))]';
const PRIMARY = 'block truncate text-[13px] font-medium leading-5 text-foreground';
const SECONDARY = 'block truncate text-[11px] leading-4 text-muted-foreground';

/** Portal code (mono, copyable) with the actuations as chips under it. */
export function RequestCode({ item, maxChips = 1 }) {
  return (
    <span className="block min-w-0">
      <span className="flex min-w-0 items-center gap-0.5">
        <span title={item.publicCode || undefined} className="truncate font-mono text-[12px] font-semibold leading-5 tracking-tight text-foreground">
          {item.publicCode || MISSING}
        </span>
        <CopyButton
          value={item.publicCode}
          label={`Copiar código ${item.publicCode}`}
          className="h-6 w-6 opacity-60 group-hover:opacity-100 focus-visible:opacity-100 [&_svg]:h-3 [&_svg]:w-3"
        />
      </span>
      <ChipList values={actuationLabels(item)} max={maxChips} dense className="mt-px" emptyLabel="Sin actuaciones" />
    </span>
  );
}

export function Applicant({ item }) {
  return (
    <span className="block min-w-0">
      <span className={PRIMARY} title={item.applicantName || undefined}>{item.applicantName || MISSING}</span>
      <span className={cn(SECONDARY, 'font-mono tabular-nums')} title={item.applicantDocument || undefined}>
        {item.applicantDocument || 'Sin documento'}
      </span>
    </span>
  );
}

/** Property address (truncated, full text on hover) and the request object or procedure. */
export function Property({ item }) {
  const detail = item.requestObject || item.procedureLabel;
  return (
    <span className="block min-w-0">
      {hasValue(item.propertyAddress)
        ? <span className={PRIMARY} title={item.propertyAddress}>{item.propertyAddress}</span>
        : <span className={cn(PRIMARY, 'font-normal text-muted-foreground')}>Sin dirección</span>}
      {hasValue(detail) ? <span className={SECONDARY} title={detail}>{detail}</span> : null}
    </span>
  );
}

/** dd/mm/aaaa plus "hace N días", or the business-day wait in warning when it is overdue. */
export function Received({ item, now }) {
  const date = formatNumericDate(item.receivedAt);
  if (!date) return <span className="text-[13px] text-muted-foreground">{MISSING}</span>;
  const wait = waitInfo(item, now);
  const full = formatDateTime(item.receivedAt);
  return (
    <span className="block min-w-0">
      <time dateTime={item.receivedAt} title={full} className="block whitespace-nowrap font-mono text-[12px] leading-5 tabular-nums text-foreground">
        {date}
      </time>
      {wait.overdue ? (
        <span
          data-overdue=""
          title={`${wait.label} en espera de revisión`}
          className={cn('flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold leading-4', WARNING_TEXT)}
        >
          <Hourglass className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{wait.days} d. háb.<span className="sr-only"> ({wait.label}) en espera</span></span>
        </span>
      ) : (
        <span className={SECONDARY}>{formatRelative(item.receivedAt, now)}</span>
      )}
    </span>
  );
}

/** "4/4" (mono) with a warning tint when fewer than required, plus new entries waiting. */
export function Documents({ item, align = 'end' }) {
  const docs = documentsRatio(item);
  const entries = pendingEntryCount(item);
  return (
    <span className={cn('flex min-w-0 flex-col gap-px', align === 'end' ? 'items-end' : 'items-start')}>
      <span
        title={docs.text}
        data-below-required={docs.below ? '' : undefined}
        className={cn(
          'whitespace-nowrap rounded px-1 font-mono text-[12px] font-semibold leading-5 tabular-nums',
          docs.below ? cn('bg-[hsl(var(--warning)/0.14)]', WARNING_TEXT) : 'text-foreground',
        )}
      >
        <span aria-hidden="true">{docs.short}</span>
        <span className="sr-only">{docs.text}</span>
      </span>
      <PendingEntriesBadge count={entries} compact />
    </span>
  );
}

/** One status badge (request + liquidation stage) and the outcome reference under it. */
export function Status({ item }) {
  const status = rowStatus(item.status, item);
  let detail = null;
  if (item.status === 'radicated' && (item.funIdPublic || item.vr)) {
    detail = (
      <span className="flex min-w-0 items-center gap-1 text-[11px] leading-4 text-muted-foreground">
        {item.funIdPublic ? <ExpedienteLink funIdPublic={item.funIdPublic} className="truncate text-[11px]" /> : null}
        {item.vr ? <span className="truncate font-mono" title={`VR ${item.vr}`}><span className="sr-only">VR </span>{item.vr}</span> : null}
      </span>
    );
  } else if (item.status === 'rejected' && item.rejectedAt) {
    detail = (
      <span className={SECONDARY} title={item.rejectionReason || undefined}>
        el <span className="font-mono tabular-nums">{formatNumericDate(item.rejectedAt)}</span>
      </span>
    );
  } else if (status.liquidation && status.hint) {
    detail = <span className="sr-only">{status.hint}</span>;
  }
  return (
    <span className="flex min-w-0 flex-col items-start gap-0.5">
      <StatusBadge status={item.status} liquidation={item} showHint />
      {detail}
    </span>
  );
}

/** Compact row action: "Revisar" when Ventanilla has something to do, "Ver" otherwise. */
export function OpenAction({ item, onOpen, tabIndex, className }) {
  const review = needsAction(item);
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      onClick={(event) => { event.stopPropagation(); onOpen(item); }}
      aria-label={`${review ? 'Revisar' : 'Ver'} solicitud ${item.publicCode || ''}`.trim()}
      className={cn(
        'inline-flex h-7 shrink-0 cursor-pointer items-center gap-0.5 whitespace-nowrap rounded-md border-0 bg-transparent px-2 text-[12px] font-semibold',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        review
          ? 'text-[hsl(var(--primary))] hover:bg-primary/10'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        className,
      )}
    >
      {review ? 'Revisar' : 'Ver'}
      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </button>
  );
}
