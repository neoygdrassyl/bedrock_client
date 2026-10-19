import { useId, useState } from 'react';
import {
  Ban,
  ChevronDown,
  CircleCheck,
  CircleX,
  Clock3,
  Eye,
  FileCheck2,
  FileImage,
  FilePlus2,
  FileStack,
  FileText,
  Info,
  Send,
} from 'lucide-react';
import { DovelaBadge, DovelaButton } from '@/components/dovela-ui';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { RelativeTime } from '../components/RelativeTime';
import {
  ENTRY_KIND_LABELS,
  ENTRY_STATUS_META,
  formatBytes,
  formatDateTime,
  getDocumentEntries,
  hasValue,
  plural,
} from '../onlineRadicationModel';
import { CountPill, DetailCard, EmptyNote } from './DetailPrimitives';

const WARNING_TEXT = 'text-[hsl(var(--operational-warning-text))] dark:text-[hsl(var(--warning))]';
// The primitive `border` is Bootstrap's !important utility, so tone borders use `border-[1px]`.
const DANGER_OUTLINE = 'border-[1px] border-solid border-[hsl(var(--destructive)/0.45)] bg-transparent text-[hsl(var(--destructive))] shadow-none hover:bg-[hsl(var(--destructive)/0.08)] hover:text-[hsl(var(--destructive))]';
const STATUS_ICONS = { pending: Clock3, received: CircleCheck, rejected: CircleX };
const STATUS_ICON_CLASSES = {
  pending: WARNING_TEXT,
  received: 'text-[hsl(var(--accent))]',
  rejected: 'text-[hsl(var(--destructive))]',
};
// Timeline node per status: tinted disc + matching ring (icon + text carry the meaning too).
const NODE_CLASSES = {
  pending: cn('border-[hsl(var(--warning)/0.55)] bg-[hsl(var(--warning)/0.14)]', WARNING_TEXT),
  received: 'border-[hsl(var(--accent)/0.45)] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]',
  rejected: 'border-[hsl(var(--destructive)/0.4)] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))]',
};

function byLine(user) {
  return user?.name ? ` por ${user.name}` : '';
}

function EntryStatusBadge({ status }) {
  const meta = ENTRY_STATUS_META[status] || { label: status ? String(status) : 'Sin estado', tone: 'neutral' };
  const Icon = STATUS_ICONS[status];
  return (
    <DovelaBadge tone={meta.tone} className="shrink-0 whitespace-nowrap">
      {Icon ? <Icon className={cn('h-3 w-3', STATUS_ICON_CLASSES[status])} aria-hidden="true" /> : null}
      {meta.label}
    </DovelaBadge>
  );
}

function EntryDocumentRow({ doc, onView }) {
  const isImage = String(doc.mimeType || '').startsWith('image/');
  const Icon = isImage ? FileImage : FileText;
  const name = doc.originalName || 'Archivo sin nombre';
  const title = doc.label || doc.documentCode || 'Documento sin clasificar';
  const meta = [doc.instanceLabel ? `Instancia: ${doc.instanceLabel}` : null, formatBytes(doc.byteSize)].filter(hasValue);
  return (
    <li className="flex items-center gap-[0.75rem] py-2 first:pt-0 last:pb-0">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-0 flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-sm font-medium leading-5 text-foreground">
          <span className="min-w-0">{title}</span>
          {doc.documentCode && doc.label ? <span className="font-mono text-xs font-normal text-muted-foreground">{doc.documentCode}</span> : null}
        </p>
        <p className="mb-0 mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs leading-5 text-muted-foreground">
          <span className="break-all">{name}</span>
          {meta.map((value) => (
            <span key={value} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true">·</span>
              {value}
            </span>
          ))}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onView}
        aria-label={`Ver ${name}`}
        className="h-8 shrink-0 gap-1.5 px-2.5 text-xs font-semibold text-[hsl(var(--primary))] hover:bg-primary/10 hover:text-[hsl(var(--primary))] [&_svg]:size-3.5"
      >
        <Eye aria-hidden="true" />
        Ver
      </Button>
    </li>
  );
}

function EntryDocuments({ entry, defaultOpen, onViewFile }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  const count = entry.documents.length;
  if (!count) return <EmptyNote>La entrada no trae documentos.</EmptyNote>;
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="min-w-0">
      <CollapsibleTrigger
        aria-controls={contentId}
        className="-ml-1.5 inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-transparent px-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none', !open && '-rotate-90')}
          aria-hidden="true"
        />
        {open ? 'Ocultar documentos' : 'Ver documentos'}
        <CountPill label={plural(count, 'documento')}>{count}</CountPill>
      </CollapsibleTrigger>
      <CollapsibleContent id={contentId} className="mt-2 rounded-lg border bg-background/60 px-[0.75rem] py-2.5">
        <ul className="mb-0 list-none divide-y divide-border/70 p-0" aria-label={`Documentos de la entrada: ${ENTRY_KIND_LABELS[entry.kind] || 'entrada'}`}>
          {entry.documents.map((doc, position) => {
            const index = Number.isInteger(doc.index) ? doc.index : position;
            return (
              <EntryDocumentRow
                key={`${index}-${doc.sha256 || doc.originalName || ''}`}
                doc={doc}
                onView={() => onViewFile({
                  entryId: entry.id,
                  index,
                  name: doc.originalName,
                  label: doc.label || doc.documentCode,
                  mimeType: doc.mimeType,
                  byteSize: doc.byteSize,
                })}
              />
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function EntryOutcome({ entry, requestStatus }) {
  if (entry.status === 'received') {
    const when = formatDateTime(entry.acceptedAt);
    return (
      <p className="mb-0 flex items-start gap-1.5 text-[13px] leading-5 text-muted-foreground">
        <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" aria-hidden="true" />
        <span>
          Recibida como <span className="font-mono font-semibold text-foreground">{entry.vr || '—'}</span>
          {when ? ` el ${when}` : null}
          {byLine(entry.acceptedBy)}.
        </span>
      </p>
    );
  }
  if (entry.status === 'rejected') {
    const when = formatDateTime(entry.rejectedAt);
    return (
      <div className="rounded-md border-[1px] border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.05)] px-[0.75rem] py-2 text-[13px] leading-5">
        {when ? <p className="mb-0.5 text-xs text-muted-foreground">Rechazada el {when}{byLine(entry.rejectedBy)}.</p> : null}
        <p className="mb-0 whitespace-pre-line break-words text-foreground">
          <span className="font-semibold">Motivo: </span>
          {entry.rejectionReason || 'No se registró el motivo.'}
        </p>
      </div>
    );
  }
  if (entry.kind === 'initial') {
    return (
      <p className="mb-0 flex items-start gap-1.5 rounded-md bg-muted/60 px-[0.75rem] py-2 text-[13px] leading-5 text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {requestStatus === 'rejected'
          ? 'La solicitud fue rechazada; estos documentos no se recibirán.'
          : 'Se recibirá con el VR asignado al llevar la solicitud a radicación.'}
      </p>
    );
  }
  return null;
}

function EntryItem({ entry, item, now, isLast, actionsDisabled, onReceive, onReject, onViewFile }) {
  const kindLabel = ENTRY_KIND_LABELS[entry.kind] || 'Entrada de documentos';
  const KindIcon = entry.kind === 'initial' ? Send : FilePlus2;
  const pending = entry.status === 'pending';
  const actionable = pending && entry.kind === 'update' && item.status !== 'rejected';
  const absolute = formatDateTime(entry.receivedAt);

  return (
    <li className="relative flex gap-[0.875rem]">
      {!isLast ? <span aria-hidden="true" className="absolute bottom-0 left-[15px] top-9 w-px bg-border" /> : null}
      <span
        aria-hidden="true"
        className={cn('relative z-[1] mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-[1px]', NODE_CLASSES[entry.status] || 'bg-muted text-muted-foreground')}
      >
        <KindIcon className="h-3.5 w-3.5" />
      </span>

      <article
        className={cn(
          'mb-[1rem] min-w-0 flex-1 rounded-lg border px-[0.875rem] py-[0.75rem]',
          isLast && 'mb-0',
          actionable ? 'border-[hsl(var(--warning)/0.45)] bg-[hsl(var(--warning)/0.05)]' : 'bg-muted/20',
        )}
      >
        <header className="flex flex-wrap items-center justify-between gap-x-[0.75rem] gap-y-1">
          <h4 className="mb-0 text-sm font-semibold leading-5 text-foreground">{kindLabel}</h4>
          <EntryStatusBadge status={entry.status} />
        </header>
        <p className="mb-0 mt-0.5 text-xs leading-5 text-muted-foreground">
          Llegó <RelativeTime value={entry.receivedAt} now={now} className="text-foreground" />
          {absolute ? <span aria-hidden="true"> · {absolute}</span> : null}
        </p>

        <div className="mt-2.5 flex flex-col gap-2.5">
          <EntryOutcome entry={entry} requestStatus={item.status} />
          <EntryDocuments entry={entry} defaultOpen={pending} onViewFile={onViewFile} />
        </div>

        {actionable ? (
          <div className="mt-[0.75rem] flex flex-wrap items-center justify-end gap-2 border-t border-[hsl(var(--warning)/0.3)] pt-[0.75rem]">
            <DovelaButton
              tone="neutral"
              size="sm"
              leadingIcon={Ban}
              disabled={actionsDisabled}
              onClick={() => onReject(entry)}
              className={cn(DANGER_OUTLINE, 'h-8 text-xs [&_svg]:size-3.5')}
            >
              Rechazar
            </DovelaButton>
            <DovelaButton
              tone="primary"
              size="sm"
              leadingIcon={FileCheck2}
              disabled={actionsDisabled}
              onClick={() => onReceive(entry)}
              className="h-8 text-xs [&_svg]:size-3.5"
            >
              Recibir como VR
            </DovelaButton>
          </div>
        ) : null}
      </article>
    </li>
  );
}

/**
 * "Entradas de documentos": timeline (newest first) of the file batches sent by the portal —
 * the initial one with the request and later updates — with their decision and files.
 * Hidden when the backend predates entries (`documentEntries` absent).
 */
export function DocumentEntriesSection({ item, now, actionsDisabled, onReceive, onReject, onViewFile }) {
  const entries = getDocumentEntries(item);
  if (!entries) return null;
  const waiting = entries.filter((entry) => entry.status === 'pending' && entry.kind === 'update').length;
  const viewFile = (file) => onViewFile({ ...file, requestId: item.id });

  return (
    <DetailCard
      icon={FileStack}
      title="Entradas de documentos"
      aside={(
        <>
          {waiting ? (
            <span className={cn('inline-flex h-5 items-center rounded-full bg-[hsl(var(--warning)/0.18)] px-2 text-[11px] font-semibold', WARNING_TEXT)}>
              {waiting === 1 ? '1 por recibir' : `${waiting} por recibir`}
            </span>
          ) : null}
          <CountPill label={plural(entries.length, 'entrada')}>{entries.length}</CountPill>
        </>
      )}
    >
      {entries.length ? (
        <ol className="m-0 list-none p-0" aria-label="Entradas de documentos, de la más reciente a la más antigua">
          {entries.map((entry, position) => (
            <EntryItem
              key={entry.id}
              entry={entry}
              item={item}
              now={now}
              isLast={position === entries.length - 1}
              actionsDisabled={actionsDisabled}
              onReceive={onReceive}
              onReject={onReject}
              onViewFile={viewFile}
            />
          ))}
        </ol>
      ) : (
        <EmptyNote>El portal aún no ha enviado los archivos de esta solicitud.</EmptyNote>
      )}
    </DetailCard>
  );
}
