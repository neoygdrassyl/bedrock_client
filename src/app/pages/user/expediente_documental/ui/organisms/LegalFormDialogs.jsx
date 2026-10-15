import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { documentaryError } from '@/app/services/documentary.service';
import { findCanonicalRow, isRevisionConflict, legalFormErrorCode, legalFormErrorMessage, saveLegalFormReview } from '@/app/services/documentaryLegalForm.service';
import { DOCUMENTAL_SCOPE } from '../documentalScope';
import { fieldClass, FormField } from '../molecules/FormField';
import { ControlDecision, ErrorMessage } from './CanonicalDocumentForms';
import { instanceKeyFor } from '../../legalFormModel';

export const REVIEW_REASON = 'Revisión de legal y debida forma';
const FOLIO_RANGE_MAX = 120;
const OBSERVATION_MAX = 4000;
const pad = (value) => String(value).padStart(2, '0');
export function todayIso(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Error text of a legal-form command: known rule codes first, then the documentary message. */
export const commandErrorText = (failure) => legalFormErrorMessage(failure) || documentaryError(failure);

function SheetFrame({ open, onClose, title, description, children }) {
  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetContent side="right" className={cn(DOCUMENTAL_SCOPE, 'flex w-full flex-col gap-0 p-0 sm:max-w-xl')}>
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-[1rem] pr-12 text-left">
          <SheetTitle className="mb-0 text-base leading-6">{title}</SheetTitle>
          <SheetDescription className="mb-0 text-xs leading-4">{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}

const VERDICT_OPTIONS = [
  { value: 'complies', label: 'Cumple' },
  { value: 'does_not_comply', label: 'No cumple' },
  { value: 'not_applicable', label: 'No aplica' },
];

/** Reviewer verdict of one delivered instance of a document without Central controls. */
export function ReviewForm({ fun0Id, requirement, instance, onSaved, onConflict, onCancel }) {
  const ids = useId();
  const review = instance.review && !instance.review.stale ? instance.review : null;
  const [verdict, setVerdict] = useState(review?.verdict || '');
  const [folioRange, setFolioRange] = useState(instance.review?.folioRange || '');
  const [observation, setObservation] = useState(instance.review?.observation || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const command = useRef(null);
  const needsObservation = verdict === 'does_not_comply' && !observation.trim();
  async function save(event) {
    event.preventDefault();
    if (busy) return;
    if (!verdict) { setError('Seleccione el veredicto.'); return; }
    if (needsObservation) { setError('Escriba la observación: es obligatoria cuando el documento no cumple.'); return; }
    setBusy(true); setError('');
    try {
      const documentKey = instanceKeyFor(requirement, instance);
      command.current ||= { ...(documentKey ? { documentKey } : {}), verdict, folioRange: folioRange.trim() || null, observation: observation.trim() || null,
        expectedReviewRevision: instance.reviewRevision || 0, idempotencyKey: crypto.randomUUID(), reason: REVIEW_REASON };
      await saveLegalFormReview(fun0Id, requirement.documentCode, command.current);
      onSaved('Revisión guardada.');
    } catch (failure) {
      if (failure.response) command.current = null;
      if (isRevisionConflict(legalFormErrorCode(failure))) onConflict(); else setError(commandErrorText(failure));
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} onChange={() => { command.current = null; }} className="flex min-h-0 flex-1 flex-col" aria-label="Revisión del documento" noValidate>
      <fieldset disabled={busy} className="m-0 flex min-h-0 min-w-0 flex-1 flex-col p-0 !border-0">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-[1.25rem]">
          <div className="flex flex-col gap-[1rem]">
            {instance.review?.stale ? <p role="status" className="mb-0 text-xs font-medium leading-4 text-[hsl(var(--operational-warning-text))]">La entrega cambió desde la última revisión. Confirme nuevamente el veredicto.</p> : null}
            <FormField id={`${ids}-verdict`} label="Veredicto">
              <select id={`${ids}-verdict`} name="verdict" className={fieldClass} value={verdict} onChange={(event) => setVerdict(event.target.value)}>
                <option value="">Seleccione el veredicto</option>
                {VERDICT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </FormField>
            <FormField id={`${ids}-folios`} label="Rango de folios" hint="Opcional. Ejemplo: 1-12.">
              <Input id={`${ids}-folios`} name="folioRange" className="text-sm" maxLength={FOLIO_RANGE_MAX} value={folioRange} onChange={(event) => setFolioRange(event.target.value)} aria-describedby={`${ids}-folios-hint`} />
            </FormField>
            <FormField id={`${ids}-observation`} label={verdict === 'does_not_comply' ? 'Observación (obligatoria)' : 'Observación'} error={verdict === 'does_not_comply' && needsObservation && error ? 'Obligatoria cuando no cumple.' : undefined}>
              <textarea id={`${ids}-observation`} name="observation" rows={4} className={cn(fieldClass, 'min-h-[5rem] resize-y')} maxLength={OBSERVATION_MAX}
                value={observation} onChange={(event) => setObservation(event.target.value)} aria-required={verdict === 'does_not_comply'} aria-invalid={Boolean(error) && needsObservation} />
            </FormField>
            <ErrorMessage error={error} />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-muted/30 px-6 py-[0.75rem]">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" size="sm" disabled={busy || !verdict || needsObservation}>{busy ? 'Guardando…' : 'Guardar revisión'}</Button>
        </div>
      </fieldset>
    </form>
  );
}

export function ReviewSheet({ target, fun0Id, onClose, onSaved, onConflict }) {
  const label = target ? [target.requirement.documentCode, target.requirement.title, target.instance.instanceLabel].filter(Boolean).join(' · ') : '';
  return (
    <SheetFrame open={Boolean(target)} onClose={onClose} title="Revisar documento" description={label}>
      {target ? <ReviewForm key={target.instance.documentKey} fun0Id={fun0Id} requirement={target.requirement} instance={target.instance} onSaved={onSaved} onConflict={onConflict} onCancel={onClose} /> : null}
    </SheetFrame>
  );
}

/**
 * Central controls of one delivery, decided with the same ControlDecision form of the ficha
 * documental. The view row is loaded by its current row id (any page of the view).
 */
export function ControlsSheet({ target, origin, canReview, onClose, onSaved, onConflict }) {
  const [state, setState] = useState(null);
  const [nonce, setNonce] = useState(0);
  const rowId = target?.instance.currentRowId;
  useEffect(() => {
    if (!rowId) return undefined;
    const controller = new AbortController();
    setState((current) => (current?.rowId === rowId ? current : null));
    findCanonicalRow(origin, rowId, controller.signal)
      .then((found) => { if (!controller.signal.aborted) setState({ rowId, found, error: found ? '' : 'La entrega ya no está vigente. Actualice la vista.' }); })
      .catch((failure) => { if (!controller.signal.aborted) setState({ rowId, found: null, error: documentaryError(failure) }); });
    return () => controller.abort();
  }, [origin, rowId, nonce]);
  const current = state?.rowId === rowId ? state : null;
  const row = current?.found?.row;
  const view = current?.found?.view;
  const allowed = Boolean(canReview && view && !view.readOnly && view.capabilities.review && row?.actions?.review !== false);
  const label = target ? [target.requirement.documentCode, target.requirement.title, target.instance.instanceLabel].filter(Boolean).join(' · ') : '';
  function saved(message) { setNonce((value) => value + 1); onSaved(message); }
  return (
    <SheetFrame open={Boolean(target)} onClose={onClose} title="Revisar controles" description={label}>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-[1.25rem]">
        {!current ? (
          <div className="flex flex-col gap-2" aria-hidden="true"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
        ) : null}
        <ErrorMessage error={current?.error} />
        {row ? (
          <div className="flex flex-col divide-y [&>*:first-child]:pt-0 [&>*:last-child]:pb-0 [&>*]:py-[0.75rem]">
            {row.controls.map((control) => (
              <ControlDecision key={`${control.controlId}:${control.review?.resultRevision || 0}`} origin={origin} row={row} control={control} canReview={allowed} onSaved={saved} onConflict={onConflict} />
            ))}
          </div>
        ) : null}
      </div>
    </SheetFrame>
  );
}

/**
 * Confirmation of a declaration command: motive (always) and legal date (declare only).
 * `onConfirm({ legalDate, reason, idempotencyKey })` rejects with the server failure.
 */
export function CommandDialog({ open, title, description, confirmLabel, destructive = false, withDate = false, onConfirm, onClose }) {
  const ids = useId();
  const [legalDate, setLegalDate] = useState(todayIso);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const key = useRef(null);
  useEffect(() => { if (open) { setLegalDate(todayIso()); setReason(''); setError(''); key.current = null; } }, [open]);
  async function confirm(event) {
    event.preventDefault();
    if (busy) return;
    if (!reason.trim()) { setError('Indique el motivo.'); return; }
    if (withDate && !/^\d{4}-\d{2}-\d{2}$/.test(legalDate)) { setError('Indique la fecha legal.'); return; }
    setBusy(true); setError('');
    try {
      key.current ||= crypto.randomUUID();
      await onConfirm({ ...(withDate ? { legalDate } : {}), reason: reason.trim(), idempotencyKey: key.current });
    } catch (failure) {
      if (failure.response) key.current = null;
      setError(commandErrorText(failure));
    } finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
      <DialogContent className={cn(DOCUMENTAL_SCOPE, 'max-w-md')}>
        <form onSubmit={confirm} onChange={() => { key.current = null; }} className="flex flex-col gap-[1rem]" noValidate>
          <DialogHeader>
            <DialogTitle className="mb-0 text-base">{title}</DialogTitle>
            <DialogDescription className="mb-0 text-xs">{description}</DialogDescription>
          </DialogHeader>
          {withDate ? (
            <FormField id={`${ids}-date`} label="Fecha legal">
              <Input id={`${ids}-date`} type="date" className="text-sm" value={legalDate} max="2100-01-01" onChange={(event) => setLegalDate(event.target.value)} required />
            </FormField>
          ) : null}
          <FormField id={`${ids}-reason`} label="Motivo" hint="Queda en el historial documental del expediente.">
            <Input id={`${ids}-reason`} className="text-sm" maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} required aria-describedby={`${ids}-reason-hint`} />
          </FormField>
          <ErrorMessage error={error} />
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" variant={destructive ? 'destructive' : 'default'} disabled={busy || !reason.trim()}>{busy ? 'Guardando…' : confirmLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
