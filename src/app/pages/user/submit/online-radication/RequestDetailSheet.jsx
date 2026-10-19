import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { FilePreviewDialog } from './components/FilePreviewDialog';
import { DetailBody } from './detail/DetailBody';
import { DetailFooter } from './detail/DetailFooter';
import { DetailHeader } from './detail/DetailHeader';
import { RadicateDialog } from './dialogs/RadicateDialog';
import { ReceiveEntryDialog } from './dialogs/ReceiveEntryDialog';
import { RejectDialog } from './dialogs/RejectDialog';
import { useOnlineRadicationDetail } from './hooks/useOnlineRadicationDetail';
import { ONLINE_RADICATION_SCOPE } from './onlineRadicationScope';
import { getDocumentEntries, plural } from './onlineRadicationModel';

/**
 * Right-side sheet with the full request (sticky header and footer, scrollable body), the
 * decision dialogs (request and document entries) and the file viewer. Shows the list summary
 * while the detail loads. Every decision refreshes the detail and, through `onChanged`, the
 * list and the counters.
 */
export function RequestDetailSheet({ open, onOpenChange, summary, now, onChanged }) {
  const id = summary?.id ?? null;
  const detail = useOnlineRadicationDetail(id);
  const item = detail.item || summary;
  const [dialog, setDialog] = useState(null);
  const [activeEntry, setActiveEntry] = useState(null);
  const [preview, setPreview] = useState({ open: false, file: null });
  const [liveMessage, setLiveMessage] = useState('');
  const titleRef = useRef(null);
  const primaryRef = useRef(null);
  const wasOpenRef = useRef(open);
  const { reload } = detail;
  const loadedId = detail.item?.id;

  // Reopening the same request re-reads it (another operator may have decided meanwhile).
  useEffect(() => {
    if (open && !wasOpenRef.current && loadedId && loadedId === id) reload();
    if (!open) {
      setDialog(null);
      setLiveMessage('');
      setPreview((current) => (current.open ? { ...current, open: false } : current));
    }
    wasOpenRef.current = open;
  }, [open, id, loadedId, reload]);

  function handleRadicated(updated) {
    const initial = (getDocumentEntries(item) || []).find((entry) => entry.kind === 'initial' && entry.status === 'pending');
    detail.replace(updated);
    const reference = [updated.funIdPublic && `Expediente ${updated.funIdPublic}`, updated.vr].filter(Boolean).join(' · ');
    const documents = initial ? ` ${plural(initial.documents.length, 'documento inicial recibido', 'documentos iniciales recibidos')} con el mismo VR.` : '';
    setLiveMessage(`Solicitud radicada. ${reference}.${documents}`);
    toast.success('Solicitud radicada', { description: `${reference || updated.publicCode}.${documents}` });
    onChanged?.(updated);
  }

  function applyEntryResult(updated) {
    if (updated?.id) detail.replace(updated);
    else reload();
    onChanged?.(updated || undefined);
  }

  function handleEntryReceived(updated, entry) {
    applyEntryResult(updated);
    const documents = plural(entry?.documents?.length ?? 0, 'documento');
    setLiveMessage(`Entrada de documentos recibida como ${entry?.vr}.`);
    toast.success('Entrada recibida', { description: `${entry?.vr} · ${documents} en Ventanilla.` });
  }

  function handleEntryRejected(updated) {
    applyEntryResult(updated);
    setLiveMessage('Entrada de documentos rechazada.');
    toast.success('Entrada rechazada', { description: 'La ciudadanía verá el motivo en el portal.' });
  }

  function openEntryDialog(kind, entry) {
    setActiveEntry(entry);
    setDialog(kind);
  }

  function handleRejected(updated) {
    detail.replace(updated);
    setLiveMessage('Solicitud rechazada.');
    toast.success('Solicitud rechazada', { description: updated.publicCode });
    onChanged?.(updated);
  }

  function handleStale() {
    reload();
    onChanged?.();
  }

  const focusPrimary = () => window.requestAnimationFrame(() => (primaryRef.current || titleRef.current)?.focus());
  const focusTitle = () => window.requestAnimationFrame(() => titleRef.current?.focus());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        overlayClassName="bg-black/50"
        className={cn(ONLINE_RADICATION_SCOPE, 'flex w-full max-w-none flex-col gap-0 bg-background p-0 sm:max-w-[52rem]')}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          titleRef.current?.focus();
        }}
      >
        {item ? (
          <>
            <DetailHeader item={item} titleRef={titleRef} now={now} />
            <ScrollArea className="min-h-0 flex-1 bg-muted/30">
              <DetailBody
                item={item}
                now={now}
                loaded={Boolean(detail.item)}
                loading={detail.loading}
                error={detail.error}
                onRetry={reload}
                entryActionsDisabled={!detail.item}
                onReceiveEntry={(entry) => openEntryDialog('receive-entry', entry)}
                onRejectEntry={(entry) => openEntryDialog('reject-entry', entry)}
                onViewFile={(file) => setPreview({ open: true, file })}
              />
            </ScrollArea>
            <DetailFooter
              item={item}
              disabled={!detail.item}
              primaryRef={primaryRef}
              onRadicate={() => setDialog('radicate')}
              onReject={() => setDialog('reject')}
            />
            <RadicateDialog
              open={dialog === 'radicate'}
              onOpenChange={(next) => setDialog(next ? 'radicate' : null)}
              request={item}
              onRadicated={handleRadicated}
              onStale={handleStale}
              onSuccessFocus={focusPrimary}
            />
            <RejectDialog
              open={dialog === 'reject'}
              onOpenChange={(next) => setDialog(next ? 'reject' : null)}
              request={item}
              onRejected={handleRejected}
              onStale={handleStale}
              onSuccessFocus={focusPrimary}
            />
            <ReceiveEntryDialog
              open={dialog === 'receive-entry'}
              onOpenChange={(next) => setDialog(next ? 'receive-entry' : null)}
              request={item}
              entry={activeEntry}
              onReceived={handleEntryReceived}
              onStale={handleStale}
              onSuccessFocus={focusTitle}
            />
            <RejectDialog
              open={dialog === 'reject-entry'}
              onOpenChange={(next) => setDialog(next ? 'reject-entry' : null)}
              request={item}
              entry={activeEntry}
              onRejected={handleEntryRejected}
              onStale={handleStale}
              onSuccessFocus={focusTitle}
            />
            <FilePreviewDialog
              open={preview.open}
              file={preview.file}
              onOpenChange={(next) => setPreview((current) => ({ ...current, open: next }))}
            />
          </>
        ) : null}
        <div className="sr-only" role="status" aria-live="polite">{liveMessage}</div>
      </SheetContent>
    </Sheet>
  );
}
