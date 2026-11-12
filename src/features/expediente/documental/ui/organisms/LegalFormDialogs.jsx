import { useEffect, useId, useRef, useState } from 'react';
import fileDownload from 'js-file-download';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import { isRevisionConflict, legalFormErrorCode, legalFormErrorMessage, saveLegalFormChecklist, saveTypologySelection } from '@/features/expediente/api/documentaryLegalForm.service';
import { activeAuthority, activeCity } from '@/shared/config/jsons/vars';
import { buildChecklistPdf, CHECKLIST_CODES } from '../../../fun/fun_forms/components/checklistPdf';
import { DOCUMENTAL_SCOPE } from '../documentalScope';
import { fieldClass, FormField } from '../molecules/FormField';
import { ErrorMessage } from './CanonicalDocumentForms';
import { commandErrorText } from './EvaluationSheet';
import { Tag } from '../atoms/Tag';
import { CHECKLIST_MARKS, checklistDefaultMarks, checklistInitialMarks, checklistItemMeta, checklistOverrides, checklistOverridesStored, checklistReviewOf, REQUIREMENT_MODE_LABELS } from '../../legalFormModel';

export const CHECKLIST_REASON = 'Lista de chequeo de legal y debida forma';
const MODEL_ERROR = 'El expediente no tiene el modelo definido, necesario para generar el formato. Defínalo e intente nuevamente.';
const pad = (value) => String(value).padStart(2, '0');
export function todayIso(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export { commandErrorText };

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

/**
 * Option picker of one typology: radios (single) or checkboxes (multiple), each option with its documents and
 * requirement mode; a motive is required. `typology` is an entry of GET /typology-selections.
 * `onSaved(result)` receives the command result; `onConflict()` a revision conflict (409).
 */
export function TypologySelectionDialog({ open, typology, fun0Id, onClose, onSaved, onConflict }) {
  const ids = useId();
  const [selected, setSelected] = useState([]);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const key = useRef(null);
  useEffect(() => { if (open) { setSelected(typology?.selectedOptionIds || []); setReason(''); setError(''); key.current = null; } }, [open, typology]);
  const single = (typology?.selectionMode || 'single') === 'single';
  const toggle = (id) => { key.current = null; setSelected((current) => (single ? [id] : current.includes(id) ? current.filter((item) => item !== id) : [...current, id])); };
  async function submit(event) {
    event.preventDefault();
    if (busy || !typology) return;
    if (!selected.length) { setError(single ? 'Elija una opción.' : 'Elija al menos una opción.'); return; }
    if (!reason.trim()) { setError('Indique el motivo.'); return; }
    setBusy(true); setError('');
    try {
      key.current ||= crypto.randomUUID();
      const result = await saveTypologySelection(fun0Id, typology.typologyCode, { optionIds: selected, expectedSelectionRevision: typology.selectionRevision || 0, reason: reason.trim(), idempotencyKey: key.current,
        ...(typology.subjectId ? { subjectId: typology.subjectId } : {}) });
      onSaved(result);
    } catch (failure) {
      if (failure.response) key.current = null;
      if (isRevisionConflict(legalFormErrorCode(failure))) onConflict(); else setError(legalFormErrorMessage(failure) || commandErrorText(failure));
    } finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
      <DialogContent className={cn(DOCUMENTAL_SCOPE, 'max-w-xl')}>
        <form onSubmit={submit} className="flex min-w-0 flex-col gap-[1rem]" noValidate>
          <DialogHeader>
            <DialogTitle className="mb-0 text-base">Elegir opción · {typology?.typologyName || typology?.typologyCode}{typology?.subjectId ? ` · ${typology.subjectLabel || typology.subjectId}` : ''}</DialogTitle>
            <DialogDescription className="mb-0 text-xs">
              {single ? 'Elija una opción.' : 'Elija una o varias opciones.'} {typology?.subjectId ? 'La opción aplica solo a esta persona. ' : ''}Los documentos exigidos se recalculan al guardar.
            </DialogDescription>
          </DialogHeader>
          <fieldset disabled={busy} className="m-0 flex min-w-0 flex-col gap-2 p-0 !border-0">
            <legend className="sr-only">Opciones de la tipología</legend>
            {(typology?.options || []).map((option) => {
              const checked = selected.includes(option.id);
              return (
                <label key={option.id} className={cn('flex cursor-pointer items-start gap-[0.75rem] rounded-md border px-[0.75rem] py-2 transition-colors motion-reduce:transition-none', checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/50')}>
                  <input type={single ? 'radio' : 'checkbox'} name={`${ids}-option`} className="mt-1" value={option.id} checked={checked} onChange={() => toggle(option.id)} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                      <Tag tone="slate">{REQUIREMENT_MODE_LABELS[option.requirementMode] || option.requirementMode}</Tag>
                    </span>
                    {option.description ? <span className="text-xs leading-4 text-muted-foreground">{option.description}</span> : null}
                    {option.documentCodes?.length ? (
                      <span className="flex flex-wrap gap-1" aria-label="Documentos de la opción">{option.documentCodes.map((code) => <Tag key={code} mono tone="code">{code}</Tag>)}</span>
                    ) : null}
                  </span>
                </label>
              );
            })}
            <FormField id={`${ids}-reason`} label="Motivo" hint="Queda en el historial documental del expediente.">
              <Input id={`${ids}-reason`} className="text-sm" maxLength={1000} value={reason} onChange={(event) => { key.current = null; setReason(event.target.value); }} required aria-describedby={`${ids}-reason-hint`} />
            </FormField>
          </fieldset>
          <ErrorMessage error={error} />
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={busy || !selected.length || !reason.trim()}>{busy ? 'Guardando…' : 'Guardar selección'}</Button>
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
  const meta = checklistItemMeta(data);
  const defaults = checklistDefaultMarks(data, codes);
  const mark = (code, value) => { key.current = null; setMarks((current) => ({ ...current, [code]: value })); };

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (!currentItem) { setError(itemError || 'El expediente aún se está cargando. Intente nuevamente en unos segundos.'); return; }
    // The legacy PDF generator needs the model of the expediente: fail before storing anything.
    if (!currentItem.model) { setError(MODEL_ERROR); return; }
    setBusy(true); setError('');
    let stored = false;
    try {
      // Stored marks are overrides of the server defaults: send only what differs (`{}` clears them) and skip the PUT when nothing changed.
      const overrides = canEdit ? checklistOverrides(data, codes, marks) : null;
      if (canEdit && !checklistOverridesStored(data, overrides)) {
        key.current ||= crypto.randomUUID();
        await saveLegalFormChecklist(fun0Id, { marks: overrides, expectedChecklistRevision: data?.checklist?.checklistRevision || 0, idempotencyKey: key.current, reason: CHECKLIST_REASON });
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
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs text-muted-foreground" title={meta.get(code)?.name || undefined}>{meta.get(code)?.name || code}</span>
                    {meta.get(code)?.hint ? <span className="text-[11px] leading-4 text-muted-foreground/80" data-testid={`checklist-hint-${code}`}>{meta.get(code).hint}</span> : null}
                  </span>
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
