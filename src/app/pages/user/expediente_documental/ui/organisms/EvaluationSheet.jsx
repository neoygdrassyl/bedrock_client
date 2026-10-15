import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { documentaryError } from '@/app/services/documentary.service';
import { getCanonicalVersions, saveCanonicalControl, saveCanonicalReview } from '@/app/services/documentaryOperations.service';
import { clearLegalFormVr, isRevisionConflict, legalFormErrorCode, legalFormErrorMessage, selectionRevisionOf, selectLegalFormVr } from '@/app/services/documentaryLegalForm.service';
import { Tag } from '../atoms/Tag';
import { useLegalForm } from '../../hooks/useLegalForm';
import { DOCUMENTAL_SCOPE } from '../documentalScope';
import { fieldClass, FormField } from '../molecules/FormField';
import { EvaluationStatus } from '../molecules/EvaluationStatus';
import { ControlDecisionFields, ErrorMessage } from './CanonicalDocumentForms';
import { evaluationOf, formatDocumentaryDate, rowCode, rowName } from '../../canonicalDocumentaryModel';
import { instancesByKey, reviewedByLine, selectedByLine } from '../../legalFormModel';

export const REVIEW_REASON = 'Revisión de legal y debida forma';
const CONTROL_REASON = 'Revisión de Legal y debida forma';
const VR_REASON = 'Elección del VR para legal y debida forma';
const FOLIO_RANGE_MAX = 120;
const OBSERVATION_MAX = 4000;
const textOf = (value) => String(value ?? '').trim();

/** Error text of an evaluation command: known rule codes first, then the documentary message. */
export const commandErrorText = (failure) => legalFormErrorMessage(failure) || documentaryError(failure);

const VERDICT_OPTIONS = [
  { value: 'complies', label: 'Cumple' },
  { value: 'does_not_comply', label: 'No cumple' },
  { value: 'not_applicable', label: 'No aplica' },
];

/** Reviewer verdict of ONE delivery (a VR version) of a document without Central controls. */
export function ReviewForm({ fun0Id, row, canReview = true, onSaved, onConflict, onCancel, after }) {
  const ids = useId();
  const evaluation = evaluationOf(row);
  // A verdict given on superseded evidence shows as pending: keep the notes but ask for the verdict again.
  const stale = evaluation.status === 'pending' && Boolean(evaluation.verdict);
  const [verdict, setVerdict] = useState(stale ? '' : evaluation.verdict || '');
  const [folioRange, setFolioRange] = useState(evaluation.folioRange || '');
  const [observation, setObservation] = useState(evaluation.observation || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const command = useRef(null);
  const needsObservation = verdict === 'does_not_comply' && !observation.trim();
  const reviewedBy = reviewedByLine({ name: evaluation.reviewedByName, id: evaluation.reviewedBy, at: evaluation.reviewedAt });
  async function save(event) {
    event.preventDefault();
    if (busy || !canReview) return;
    if (!verdict) { setError('Seleccione el veredicto.'); return; }
    if (needsObservation) { setError('Escriba la observación: es obligatoria cuando el documento no cumple.'); return; }
    setBusy(true); setError('');
    try {
      command.current ||= { verdict, folioRange: folioRange.trim() || null, observation: observation.trim() || null,
        expectedReviewRevision: evaluation.reviewRevision || 0, idempotencyKey: crypto.randomUUID(), reason: REVIEW_REASON };
      await saveCanonicalReview(fun0Id, row.receivedDocumentRowId, command.current);
      onSaved('Evaluación guardada.');
    } catch (failure) {
      if (failure.response) command.current = null;
      if (isRevisionConflict(legalFormErrorCode(failure))) onConflict(); else setError(commandErrorText(failure));
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} onChange={() => { command.current = null; }} className="flex min-h-0 flex-1 flex-col" aria-label="Evaluación del documento" noValidate>
      <fieldset disabled={busy || !canReview} className="m-0 flex min-h-0 min-w-0 flex-1 flex-col p-0 !border-0">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-[1.25rem]">
          <div className="flex flex-col gap-[1rem]">
            {reviewedBy ? <p className="mb-0 text-[11px] leading-4 text-muted-foreground">{reviewedBy}</p> : null}
            {stale ? <p role="status" className="mb-0 text-xs font-medium leading-4 text-[hsl(var(--operational-warning-text))]">La entrega cambió desde la última revisión. Confirme nuevamente el veredicto.</p> : null}
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
          {after}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-muted/30 px-6 py-[0.75rem]">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>{canReview ? 'Cancelar' : 'Cerrar'}</Button>
          {canReview ? <Button type="submit" size="sm" disabled={busy || !verdict || needsObservation}>{busy ? 'Guardando…' : 'Guardar evaluación'}</Button> : null}
        </div>
      </fieldset>
    </form>
  );
}

/**
 * One form for every Central control of a delivery: one footer, and "Guardar" sends one command per
 * control whose result or observation changed (sequentially, stopping at the first failure).
 * A control whose previous decision is stale starts with an empty result and is only sent once the
 * user picks one. `onControlSaved` fires after each command that went through (partial progress).
 */
export function ControlsForm({ origin, row, canReview, onSaved, onControlSaved, onConflict, onCancel, after }) {
  const ids = useId();
  const initial = (control) => ({ value: control.review?.current === false ? '' : control.review?.selectedSourceValueId || '', observation: control.review?.observation || '' });
  const [drafts, setDrafts] = useState(() => Object.fromEntries(row.controls.map((control) => [control.controlId, initial(control)])));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [invalidId, setInvalidId] = useState(null);
  // Last saved state per control: a retry after a partial failure must not resend (nor 409 on) what already went through.
  const baseline = useRef(Object.fromEntries(row.controls.map((control) => [control.controlId, { ...initial(control), revision: control.review?.resultRevision || 0 }])));
  const commands = useRef(new Map()); // idempotent command per controlId
  const changed = (control) => {
    const draft = drafts[control.controlId]; const base = baseline.current[control.controlId];
    if (!draft.value) return false;
    return draft.value !== base.value || textOf(draft.observation) !== textOf(base.observation);
  };
  const pending = row.controls.filter(changed);
  function update(controlId, patch) {
    commands.current.delete(controlId); setInvalidId(null);
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
        baseline.current[control.controlId] = { value: draft.value, observation: draft.observation, revision: base.revision + 1 };
        onControlSaved?.();
      }
      onSaved('Evaluación guardada.');
    } catch (failure) {
      // A 409 with a known rule (e.g. the expediente is already declared) is explained; any other 409 means the data moved.
      if (failure.response?.status === 409 && !legalFormErrorMessage(failure)) onConflict(); else { setInvalidId(failure.controlId ?? null); setError(commandErrorText(failure)); }
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} className="flex min-h-0 flex-1 flex-col" aria-label="Evaluación de controles" noValidate>
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
          {after}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-muted/30 px-6 py-[0.75rem]">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>{canReview ? 'Cancelar' : 'Cerrar'}</Button>
          {canReview ? <Button type="submit" size="sm" disabled={busy || !pending.length}>{busy ? 'Guardando…' : 'Guardar'}</Button> : null}
        </div>
      </fieldset>
    </form>
  );
}

const byVersionDesc = (left, right) => (right.versionSequence ?? 0) - (left.versionSequence ?? 0);

/** Versions of the document (newest first once sorted), paged on demand. The state lives above the forms so switching versions does not reload it. */
function useDocumentVersions(origin, row) {
  const [state, setState] = useState({ rows: [], nextAfterId: 0, loaded: false, error: '', busy: false });
  const fun0Id = origin.project.fun0Id;
  const { receivedDocumentRowId, documentKey } = row;
  const load = useCallback(async (afterId) => {
    setState((current) => ({ ...current, busy: true, error: '' }));
    try {
      const page = await getCanonicalVersions(fun0Id, { receivedDocumentRowId, documentKey }, afterId);
      setState((current) => ({ rows: [...(afterId ? current.rows : []), ...page.rows], nextAfterId: page.nextAfterId || 0, loaded: true, error: '', busy: false }));
    } catch (failure) {
      setState((current) => ({ ...current, loaded: true, busy: false, error: documentaryError(failure) }));
    }
  }, [fun0Id, receivedDocumentRowId, documentKey]);
  useEffect(() => { load(0); }, [load]);
  return { ...state, loadMore: () => load(state.nextAfterId) };
}

/**
 * Compact list of the evaluations of every version of the document, with an "Evaluar" link to switch to one.
 * With `choice` (the legal-form instance of the document) each approved version can be chosen as the one legal y
 * debida forma uses; the chosen one is tagged and can be cleared.
 */
function PreviousEvaluations({ state, activeRowId, canEvaluate, onEvaluate, choice }) {
  const versions = [...state.rows].sort(byVersionDesc);
  const instance = choice?.instance || null;
  const showList = versions.length > 1 || (Boolean(instance) && versions.length > 0);
  return (
    <section className="mt-[1.5rem] flex min-w-0 flex-col gap-2 border-t pt-[1rem]" aria-label="Evaluaciones anteriores">
      <h3 className="mb-0 text-sm font-semibold leading-5 text-foreground">Evaluaciones anteriores</h3>
      {instance && !instance.selection ? <p className="mb-0 text-xs leading-4 text-muted-foreground">Elija la entrega aprobada que se usa para legal y debida forma.</p> : null}
      {!state.loaded ? <div className="flex flex-col gap-2" aria-hidden="true"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div> : null}
      {state.loaded && !state.error && versions.length <= 1 && !showList ? <p className="mb-0 text-xs leading-4 text-muted-foreground">Este documento solo tiene una versión.</p> : null}
      {showList ? (
        <ul className="m-0 flex list-none flex-col divide-y rounded-md border p-0">
          {versions.map((version) => {
            const evaluation = version.evaluation || { status: 'not_applicable' };
            const active = version.id === activeRowId;
            const reviewer = evaluation.reviewedByName || (evaluation.reviewedBy != null ? `usuario ${evaluation.reviewedBy}` : null);
            const when = evaluation.reviewedAt ? formatDocumentaryDate(evaluation.reviewedAt) : null;
            const isApproved = evaluation.status === 'approved';
            const chosen = instance ? instance.selection?.rowId === version.id : Boolean(version.ldfSelected);
            return (
              <li key={version.id} className="flex flex-wrap items-center gap-x-[0.75rem] gap-y-1 px-[0.75rem] py-2" data-testid={`evaluation-version-${version.id}`}>
                <span className="min-w-0 flex-1 text-xs text-foreground">{version.vrLabel || 'Sin VR'} · Versión {version.versionSequence}</span>
                {chosen ? <Tag tone="success" title="Entrega que usa legal y debida forma">VR elegido</Tag> : null}
                <EvaluationStatus evaluation={evaluation} showReviewer={false} />
                {isApproved || evaluation.status === 'rejected' ? <span className="text-[11px] text-muted-foreground">{[reviewer && `por ${reviewer}`, when].filter(Boolean).join(' · ')}</span> : null}
                {active ? <span className="text-[11px] font-medium text-muted-foreground">En evaluación</span> : canEvaluate && evaluation.status !== 'not_applicable' ? (
                  <Button type="button" variant="link" size="sm" className="h-6 px-1 text-xs" aria-label={`Evaluar ${version.vrLabel || 'versión'} versión ${version.versionSequence}`} onClick={() => onEvaluate(version)}>Evaluar</Button>
                ) : null}
                {chosen && instance ? (
                  <div className="flex w-full flex-wrap items-center gap-x-[0.75rem] gap-y-1">
                    <span className="text-[11px] text-muted-foreground">{selectedByLine(instance.selection)}</span>
                    {!isApproved ? <span role="status" className="text-[11px] font-medium text-[hsl(var(--operational-warning-text))]">La entrega elegida ya no está aprobada. Elija otra.</span> : null}
                    {choice.canChange ? <Button type="button" variant="link" size="sm" className="h-6 px-1 text-xs" disabled={choice.busy} onClick={choice.onClear}>Quitar elección</Button> : null}
                  </div>
                ) : null}
                {instance && !chosen && choice.canChange ? (
                  <div className="flex w-full flex-wrap items-center gap-x-[0.75rem] gap-y-1">
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={!isApproved || choice.busy} aria-label={`Usar ${version.vrLabel || 'versión'} versión ${version.versionSequence} para legal y debida forma`} onClick={() => choice.onSelect(version)}>Usar para legal y debida forma</Button>
                    {!isApproved ? <span className="text-[11px] text-muted-foreground">Apruebe esta entrega para poder elegirla</span> : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      {choice?.declared && instance ? <p className="mb-0 text-[11px] leading-4 text-muted-foreground">El expediente está declarado: anule la declaración para cambiar el VR elegido.</p> : null}
      {choice?.message ? <p role="status" className="mb-0 text-xs font-medium leading-4 text-foreground">{choice.message}</p> : null}
      <ErrorMessage error={choice?.error} />
      {state.nextAfterId ? <Button type="button" variant="ghost" size="sm" className="h-8 self-start text-xs text-muted-foreground" disabled={state.busy} onClick={state.loadMore}>{state.busy ? 'Consultando…' : 'Ver más versiones'}</Button> : null}
      <ErrorMessage error={state.error} />
    </section>
  );
}

/**
 * View row shown by the sheet for a chosen version: same document, the version's own receipt,
 * evaluation and Central control decisions (older backends omit `controls` on version rows).
 */
function rowForVersion(baseRow, version) {
  if (!version || version.id === baseRow.receivedDocumentRowId) return baseRow;
  const controls = Array.isArray(version.controls) ? version.controls : baseRow.controls.map((control) => ({ ...control, review: null }));
  return { ...baseRow, receivedDocumentRowId: version.id, receipt: version, versionSequence: version.versionSequence, evaluation: version.evaluation, controls };
}

/**
 * Choice of the VR legal y debida forma uses for this document: state and commands. `legalForm` ({ data, reload }) comes
 * from the host when it already loaded it; otherwise the sheet loads its own copy. Without the legal form (older
 * backend, traditional expediente) there is no choice to make.
 */
function useVrChoice({ origin, baseRow, canEvaluate, legalForm, onChanged }) {
  const fun0Id = origin.project.fun0Id;
  const own = useLegalForm(legalForm ? null : fun0Id);
  const source = legalForm || own;
  const data = source?.data && source.data.mode !== 'traditional' ? source.data : null;
  const instance = data ? instancesByKey(data).get(baseRow.documentKey)?.instance || null : null;
  const [state, setState] = useState({ busy: false, message: '', error: '' });
  async function change(run, message) {
    if (state.busy) return;
    setState({ busy: true, message: '', error: '' });
    try {
      await run();
      setState({ busy: false, message, error: '' });
      source?.reload?.();
      onChanged?.();
    } catch (failure) {
      if (legalFormErrorCode(failure) === 'SELECTION_REVISION_CONFLICT' || failure.response?.status === 409) { source?.reload?.(); onChanged?.(); }
      setState({ busy: false, message: '', error: commandErrorText(failure) });
    }
  }
  const command = (extra) => ({ ...extra, expectedSelectionRevision: selectionRevisionOf(instance), idempotencyKey: crypto.randomUUID(), reason: VR_REASON });
  if (!instance) return null;
  return {
    instance, busy: state.busy, message: state.message, error: state.error,
    declared: Boolean(data.declaration),
    canChange: Boolean(canEvaluate && data.actions?.select && !data.declaration),
    onSelect: (version) => change(() => selectLegalFormVr(fun0Id, baseRow.documentKey, command({ rowId: version.id })), 'VR elegido para legal y debida forma.'),
    onClear: () => change(() => clearLegalFormVr(fun0Id, baseRow.documentKey, command({})), 'Elección del VR quitada.'),
  };
}

function EvaluationBody({ baseRow, origin, canEvaluate, legalForm, onClose, onSaved, onPartialSave, onConflict, onSelectionChanged }) {
  const [version, setVersion] = useState(null);
  const savedAny = useRef(false);
  const row = rowForVersion(baseRow, version);
  const hasControls = row.controls.length > 0;
  const label = [rowCode(row), rowName(row)].filter(Boolean).join(' · ');
  // Closing after some (but not all) controls were saved: the parent must reload what already went through.
  function close() {
    const partial = savedAny.current;
    savedAny.current = false;
    if (partial) onPartialSave?.();
    onClose();
  }
  function saved(message) { savedAny.current = false; onSaved(message); }
  const versions = useDocumentVersions(origin, baseRow);
  const choice = useVrChoice({ origin, baseRow, canEvaluate, legalForm, onChanged: onSelectionChanged });
  const history = <PreviousEvaluations state={versions} activeRowId={row.receivedDocumentRowId} canEvaluate={canEvaluate} onEvaluate={(next) => setVersion(next)} choice={choice} />;
  return (
    <>
      <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-[1rem] pr-12 text-left">
        <SheetTitle className="mb-0 text-base leading-6">Evaluar documento</SheetTitle>
        <SheetDescription className="mb-0 text-xs leading-4">{label} · {row.receipt?.vrLabel || 'Sin VR'} · Versión {row.versionSequence}</SheetDescription>
      </SheetHeader>
      {hasControls ? (
        <ControlsForm key={`${row.receivedDocumentRowId}:${row.receipt.evidenceRevision}:${row.controls.map((control) => control.review?.resultRevision || 0).join(',')}`}
          origin={origin} row={row} canReview={canEvaluate} onSaved={saved} onControlSaved={() => { savedAny.current = true; }}
          onConflict={() => { savedAny.current = false; onConflict(); }} onCancel={close} after={history} />
      ) : (
        <ReviewForm key={`${row.receivedDocumentRowId}:${evaluationOf(row).reviewRevision || 0}`} fun0Id={origin.project.fun0Id} row={row} canReview={canEvaluate}
          onSaved={saved} onConflict={onConflict} onCancel={close} after={history} />
      )}
    </>
  );
}

/**
 * Single evaluation sheet of Radicación and Legal y debida forma. `target` is `{ row, nonce }` with a
 * view row. Rows with Central controls open the single-save controls form; the others open the reviewer
 * verdict. Below, the evaluations of every version, each with an "Evaluar" link to switch the sheet to it.
 * `onSaved(message)` fires after a save; `onPartialSave` when it is closed after some controls went through.
 * The list of versions also lets a manager choose which approved delivery legal y debida forma uses (`legalForm`:
 * optional `{ data, reload }` of the host; `onSelectionChanged` fires after choosing or clearing it).
 */
export function EvaluationSheet({ target, origin, canEvaluate = false, legalForm, onClose, onSaved, onPartialSave, onConflict, onSelectionChanged }) {
  const row = target?.row;
  return (
    <Sheet open={Boolean(target)} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetContent side="right" className={cn(DOCUMENTAL_SCOPE, 'flex w-full flex-col gap-0 p-0 sm:max-w-xl')}>
        {row ? <EvaluationBody key={target.nonce ?? row.rowKey} baseRow={row} origin={origin} canEvaluate={canEvaluate} legalForm={legalForm}
          onClose={onClose} onSaved={onSaved} onPartialSave={onPartialSave} onConflict={onConflict} onSelectionChanged={onSelectionChanged} /> : null}
      </SheetContent>
    </Sheet>
  );
}

export default EvaluationSheet;
