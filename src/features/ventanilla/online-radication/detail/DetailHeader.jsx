import { CalendarDays, FolderOpen } from 'lucide-react';
import { SheetDescription, SheetTitle } from '@/shared/ui/sheet';
import { CopyButton } from '../components/CopyButton';
import { ExpedienteLink } from '../components/ExpedienteLink';
import { PendingEntriesBadge } from '../components/PendingEntriesBadge';
import { StatusBadge } from '../components/StatusBadge';
import { MISSING, formatDateTime, formatRelative, getDocumentEntries, pendingEntryCount } from '../onlineRadicationModel';

/** Pending `update` entries: from the detail when loaded, else from the list summary. */
function waitingEntries(item) {
  const entries = getDocumentEntries(item);
  if (!entries) return pendingEntryCount(item);
  return entries.filter((entry) => entry.status === 'pending' && entry.kind === 'update').length;
}

/** Sticky header of the detail sheet: code, status, reception and (when radicated) expediente + VR. */
export function DetailHeader({ item, titleRef, now }) {
  const received = formatDateTime(item.receivedAt);
  const relative = formatRelative(item.receivedAt, now);
  const radicated = item.status === 'radicated' && item.funIdPublic;
  return (
    <header className="shrink-0 border-b bg-[hsl(var(--card))] px-6 pb-[1rem] pr-14 pt-[1.125rem]">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Solicitud de radicación en línea
      </p>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
        <SheetTitle
          ref={titleRef}
          tabIndex={-1}
          className="mb-0 break-all font-mono text-lg font-semibold leading-7 tracking-tight text-foreground outline-none"
        >
          {item.publicCode || 'Solicitud sin código'}
        </SheetTitle>
        <CopyButton value={item.publicCode} label="Copiar código del portal" />
        <StatusBadge status={item.status} size="md" className="ml-1" />
        <PendingEntriesBadge count={waitingEntries(item)} className="px-2.5 py-1 text-xs" />
      </div>
      <SheetDescription asChild>
        <div className="mt-2 flex flex-wrap items-center gap-x-[1.25rem] gap-y-1.5 text-[13px] leading-5 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              Recibida el <span className="text-foreground">{received || MISSING}</span>
              {relative ? <span> · {relative}</span> : null}
            </span>
          </span>
          {radicated ? (
            <span className="inline-flex flex-wrap items-center gap-x-1.5">
              <FolderOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Expediente <ExpedienteLink funIdPublic={item.funIdPublic} />
              {item.vr ? <><span aria-hidden="true">·</span>VR <span className="font-mono font-semibold text-foreground">{item.vr}</span></> : null}
            </span>
          ) : null}
        </div>
      </SheetDescription>
    </header>
  );
}
