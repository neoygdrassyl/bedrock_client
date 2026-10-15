import { useEffect, useId, useRef, useState } from 'react';
import fileDownload from 'js-file-download';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { documentaryError } from '@/app/services/documentary.service';
import { saveCanonicalControl } from '@/app/services/documentaryOperations.service';
import { findCanonicalRow, isRevisionConflict, legalFormErrorCode, legalFormErrorMessage, saveLegalFormChecklist, saveLegalFormReview } from '@/app/services/documentaryLegalForm.service';
import { activeAuthority, activeCity } from '@/app/components/jsons/vars';
import { buildChecklistPdf, CHECKLIST_CODES } from '../../../fun_forms/components/checklistPdf';
import { DOCUMENTAL_SCOPE } from '../documentalScope';
import { fieldClass, FormField } from '../molecules/FormField';
import { ControlDecisionFields, ErrorMessage } from './CanonicalDocumentForms';
import { CHECKLIST_MARKS, checklistDefaultMarks, checklistInitialMarks, checklistReviewOf, instanceKeyFor, reviewedByLine } from '../../legalFormModel';

export const REVIEW_REASON = 'Revisión de legal y debida forma';
export const CHECKLIST_REASON = 'Lista de chequeo de legal y debida forma';
const CONTROL_REASON = 'Revisión de Legal y debida forma';
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

/** "Revisado por {name} · {date}" of a previous decision; nothing when there is none. */
function ReviewedBy({ name, id, at }) {
  const line = reviewedByLine({ name, id, at });
  return line ? <p className="mb-0 text-[11px] leading-4 text-muted-foreground">{line}</p> : null;
}

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
            {instance.review ? <ReviewedBy name={instance.review.reviewedByName} id={instance.review.reviewedBy} at={instance.review.reviewedAt} /> : null}
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

const textOf = (value) => String(value ?? '').trim();

/**
 * One form for every Central control of a delivery: one footer, and "Guardar" sends one command per
 * control whose result or observation changed (sequentially, stopping at the first failure).
 */
export function ControlsForm({ origin, row, canReview, onSaved, onConflict, onCancel }) {
  const ids = useId();
  const initial = (control) => ({ value: control.review?.selectedSourceValueId || '', observation: control.review?.observation || '' });
  const [drafts, setDrafts] = useState(() => Object.fromEntries(row.controls.map((control) => [control.controlId, initial(control)])));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [invalidId, setInvalidId] = useState(null);
  // Last saved state per control: a retry after a partial failure must not resend (nor 409 on) what already went through.
  const baseline = useRef(Object.fromEntries(row.controls.map((control) => [control.controlId, { ...initial(control), revision: control.review?.resultRevision || 0, stale: control.review?.current === false }])));
  const commands = useRef(new Map());
  const changed = (control) => {
    const draft = drafts[control.controlId]; const base = baseline.current[control.controlId];
    if (!draft.value) return false;
    return draft.value !== base.value || textOf(draft.observation) !== textOf(base.observation) || base.stale;
  };
  const pending = row.controls.filter(changed);
  function update(controlId, patch) {
    commands.current.clear(); setInvalidId(null);
    setDrafts((current) => ({ ...current, [controlId]: { ...current[controlId], ...patch } }));
  }
  function validate() {
    for (const control of row.controls) {
      const draft = drafts[control.controlId];
      if (!draft.value && textOf(draft.observation) && textOf(draft.observation) !== textOf(baseline.current[control.controlId].observation)) return { id: control.controlId, message: `Seleccione el resultado de «${control.title}».` };
      const effect = control.values.find((item) => item.sourceValueId === draft.value)?.effect;
      if (changed(control) && effect === 'does_not_comply' && !textOf(draft.observation)) return { id: control.controlId, message: `Escriba la observación de «${control.title}»: es obligatoria cuando no cumple.` };
    }
    return null;
  }
  async function save(event) {
    event.preventDefault();
    if (busy || !canReview) return;
    const problem = validate();
    if (problem) { setInvalidId(problem.id); setError(problem.message); return; }
    if (!pending.length) { setError('No hay cambios por guardar.'); return; }
    setBusy(true); setError(''); setInvalidId(null);
    try {
      for (const control of pending) {
        const draft = drafts[control.controlId]; const base = baseline.current[control.controlId];
        if (!commands.current.has(control.controlId)) {
          commands.current.set(control.controlId, { selectedSourceValueId: draft.value, observation: textOf(draft.observation) || null,
            expectedEvidenceRevision: row.receipt.evidenceRevision, expectedResultRevision: base.revision, idempotencyKey: crypto.randomUUID(), reason: CONTROL_REASON });
        }
        try {
          await saveCanonicalControl(origin.project.fun0Id, row.receivedDocumentRowId, control.controlId, commands.current.get(control.controlId));
        } catch (failure) {
          // A server answer invalidates the command; a network failure keeps it for an idempotent retry.
          if (failure.response) commands.current.delete(control.controlId);
          throw Object.assign(failure, { controlId: control.controlId });
        }
        commands.current.delete(control.controlId);
        baseline.current[control.controlId] = { value: draft.value, observation: draft.observation, revision: base.revision + 1, stale: false };
      }
      onSaved('Revisión guardada.');
    } catch (failure) {
      if (failure.response?.status === 409) onConflict(); else { setInvalidId(failure.controlId ?? null); setError(commandErrorText(failure)); }
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} className="flex min-h-0 flex-1 flex-col" aria-label="Revisión de controles" noValidate>
      <fieldset disabled={busy} className="m-0 flex min-h-0 min-w-0 flex-1 flex-col p-0 !border-0">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-[1.25rem]">
          <div className="flex flex-col divide-y [&>*:first-child]:pt-0 [&>*:last-child]:pb-0 [&>*]:py-[0.75rem]">
            {row.controls.map((control) => (
              <div key={control.controlId} className="flex flex-col gap-[0.75rem]">
                <ControlDecisionFields idPrefix={`${ids}-${control.controlId}`} control={control} value={drafts[control.controlId].value} observation={drafts[control.controlId].observation}
                  onValueChange={(value) => update(control.controlId, { value })} onObservationChange={(observation) => update(control.controlId, { observation })} disabled={busy || !canReview} invalid={invalidId === control.controlId} />
              </div>
            ))}
          </div>
          <ErrorMessage error={error} className="mt-[0.75rem]" />
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-muted/30 px-6 py-[0.75rem]">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>{canReview ? 'Cancelar' : 'Cerrar'}</Button>
          {canReview ? <Button type="submit" size="sm" disabled={busy || !pending.length}>{busy ? 'Guardando…' : 'Guardar'}</Button> : null}
        </div>
      </fieldset>
    </form>
  );
}

/**
 * Central controls of one delivery, decided in a single form (one Guardar for all controls). The view
 * row is loaded by its current row id (any page of the view).
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
      {row ? (
        <ControlsForm key={`${row.receivedDocumentRowId}:${row.receipt.evidenceRevision}:${row.controls.map((control) => control.review?.resultRevision || 0).join(',')}`}
          origin={origin} row={row} canReview={allowed} onSaved={saved} onConflict={onConflict} onCancel={onClose} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-[1.25rem]">
          {!current ? <div className="flex flex-col gap-2" aria-hidden="true"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div> : null}
          <ErrorMessage error={current?.error} />
        </div>
      )}
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

/** SI / NO / N/A radio group of one checklist code. */
function MarkToggle({ code, name, value, disabled, onChange }) {
  return (
    <div role="radiogroup" aria-label={`Marca del documento ${code}`} className="inline-flex shrink-0 overflow-hidden rounded-md border">
      {CHECKLIST_MARKS.map((mark) => {
        const checked = value === mark.value;
        return (
          <label key={mark.value} className={cn('relative min-w-[2.5rem] cursor-pointer select-none px-2.5 py-1 text-center text-[11px] font-semibold leading-4 transition-colors focus-within:z-10 focus-within:ring-2 focus-within:ring-ring motion-reduce:transition-none [&:not(:first-child)]:border-l',
            checked ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted', disabled && 'cursor-not-allowed opacity-60')}>
            <input type="radio" className="sr-only" name={name} value={mark.value} checked={checked} disabled={disabled} aria-label={`${code}: ${mark.label}`} onChange={() => onChange(mark.value)} />
            {mark.label}
          </label>
        );
      })}
    </div>
  );
}

/**
 * Legal-form checklist ("lista de chequeo"): SI / NO / N/A mark per document code of the legacy
 * template. "Guardar y descargar" stores the marks (PUT /legal-form/checklist) and then builds the
 * PDF with the legacy generator. Read-only (`canEdit` false): only "Descargar" with the stored marks.
 * `currentItem` is the expediente (FUN) the PDF template prints; null while it loads.
 */
export function ChecklistDialog({ open, data, fun0Id, currentItem, itemError = '', currentVersion, swaMsg, canEdit, onClose, onSaved, onConflict }) {
  const ids = useId();
  const codes = CHECKLIST_CODES;
  const [marks, setMarks] = useState(() => checklistInitialMarks(data, codes));
  const [city, setCity] = useState(activeCity);
  const [number, setNumber] = useState(activeAuthority.value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const key = useRef(null);
  useEffect(() => { if (open) { setMarks(checklistInitialMarks(data, codes)); setCity(activeCity); setNumber(activeAuthority.value); setError(''); key.current = null; } }, [open]);
  const titles = new Map((data?.requirements || []).filter((item) => item.documentCode).map((item) => [String(item.documentCode).trim(), item.title]));
  const defaults = checklistDefaultMarks(data, codes);
  const mark = (code, value) => { key.current = null; setMarks((current) => ({ ...current, [code]: value })); };

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (!currentItem) { setError(itemError || 'El expediente aún se está cargando. Intente nuevamente en unos segundos.'); return; }
    setBusy(true); setError('');
    let stored = false;
    try {
      if (canEdit) {
        key.current ||= crypto.randomUUID();
        await saveLegalFormChecklist(fun0Id, { marks, expectedChecklistRevision: data?.checklist?.checklistRevision || 0, idempotencyKey: key.current, reason: CHECKLIST_REASON });
        stored = true;
      }
      const pdfBytes = await buildChecklistPdf({ currentItem, currentVersion, review: checklistReviewOf(codes, marks), city, number, swaMsg });
      if (!pdfBytes) { if (stored) onSaved('Lista de chequeo guardada, pero no se pudo generar el PDF.'); return; }
      fileDownload(pdfBytes, `FORMULARIO DE REVISION GENERAL${currentItem.id_public}.pdf`);
      if (stored) onSaved('Lista de chequeo guardada.'); else onClose();
    } catch (failure) {
      if (stored) { onSaved('Lista de chequeo guardada, pero no se pudo generar el PDF.'); return; }
      if (failure.response) key.current = null;
      if (isRevisionConflict(legalFormErrorCode(failure))) onConflict(); else setError(commandErrorText(failure));
    } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
      <DialogContent className={cn(DOCUMENTAL_SCOPE, 'max-w-2xl')}>
        <form onSubmit={submit} className="flex min-w-0 flex-col gap-[1rem]" noValidate>
          <DialogHeader>
            <DialogTitle className="mb-0 text-base">Lista de chequeo</DialogTitle>
            <DialogDescription className="mb-0 text-xs">Marque lo que aplica según los requisitos del expediente y descargue el formato.</DialogDescription>
          </DialogHeader>
          <fieldset disabled={busy} className="m-0 flex min-w-0 flex-col gap-[1rem] p-0 !border-0">
            <div className="grid gap-[0.75rem] sm:grid-cols-2">
              <FormField id={`${ids}-authority`} label="Autoridad competente">
                <select id={`${ids}-authority`} className={fieldClass} value={number} onChange={(event) => setNumber(event.target.value)}>
                  <option value={activeAuthority.value}>{activeAuthority.label}</option>
                </select>
              </FormField>
              <FormField id={`${ids}-city`} label="Ciudad">
                <select id={`${ids}-city`} className={fieldClass} value={city} onChange={(event) => setCity(event.target.value)}>
                  <option>{activeCity}</option>
                </select>
              </FormField>
            </div>
            {!canEdit ? <p className="mb-0 text-xs leading-4 text-muted-foreground">Solo lectura: se usan las marcas guardadas o sugeridas por las revisiones.</p> : null}
            <ul className="m-0 max-h-[50dvh] list-none divide-y overflow-y-auto rounded-md border p-0" aria-label="Documentos de la lista de chequeo">
              {codes.map((code) => (
                <li key={code} className="flex items-center gap-[0.75rem] px-[0.75rem] py-1.5" data-testid={`checklist-row-${code}`}>
                  <span className="w-12 shrink-0 font-mono text-xs text-foreground">{code}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={titles.get(code) || undefined}>{titles.get(code) || code}</span>
                  <MarkToggle code={code} name={`${ids}-${code}`} value={marks[code]} disabled={!canEdit || busy} onChange={(value) => mark(code, value)} />
                </li>
              ))}
            </ul>
          </fieldset>
          <ErrorMessage error={error} />
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onClose}>Cancelar</Button>
            {canEdit ? <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => { key.current = null; setMarks(defaults); }}>Restablecer</Button> : null}
            <Button type="submit" size="sm" disabled={busy || (!currentItem && !itemError)}>{busy ? 'Guardando…' : canEdit ? 'Guardar y descargar' : 'Descargar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
