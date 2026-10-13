import { useEffect, useId, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { documentaryError } from '@/app/services/documentary.service';
import { createCanonicalSubmit, documentaryReceiptRuleError, getCanonicalVersionSubmitIds, receiveCanonicalDocument, saveCanonicalControl, updateCanonicalEvidence } from '@/app/services/documentaryOperations.service';
import { CatalogueDocumentPicker } from '../molecules/CatalogueDocumentPicker';
import { CHANNEL_LABELS, CLASS_LABELS, CONTRIBUTOR_LABELS, documentClassOf } from '../../canonicalDocumentaryModel';

const MAX_FILE_BYTES = 52428800;
const FILE_TYPES = 'application/pdf,image/jpeg,image/png';
export const fieldClass = 'mt-1 block min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60';
const labelClass = 'block text-sm font-medium';
const hintClass = 'text-xs text-muted-foreground';
const effectLabels = { complies: 'Cumple', does_not_comply: 'No cumple', not_applicable: 'No aplica', no_decision: 'Sin decisión', pending: 'Pendiente', stale: 'Requiere nueva revisión', review_unavailable: 'Revisión no disponible', no_configured_controls: 'Sin controles configurados', unreviewed: 'Pendiente de revisión' };
export const effectLabel = (value) => effectLabels[value] || 'Pendiente de revisión';
export const NO_VR_LEFT_MESSAGE = 'Este documento ya tiene una versión en todas las VR del expediente. Cree una VR nueva para registrar otra entrega.';

export function ErrorMessage({ error }) {
  return error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null;
}

const EMPTY_DRAFT = { title: '', reason: '', pages: '', location: '', hasDigital: false };

/** Values of the uncontrolled receipt fields that gate the submit button. */
function readReceiptDraft(form) {
  const data = new FormData(form);
  return {
    title: String(data.get('title') || ''),
    reason: String(data.get('reason') || ''),
    pages: String(data.get('pages') || ''),
    location: String(data.get('location') || ''),
    hasDigital: Boolean(data.get('digital')?.size),
  };
}

function failureHandler(command, setError, onConflict) {
  return (failure) => {
    // A server answer invalidates the command; a network failure keeps it for an idempotent retry.
    if (failure.response) command.current = null;
    if (failure.response?.status === 409) onConflict(); else setError(documentaryError(failure));
  };
}

/**
 * Inline VR creation. Not a <form>: it lives inside the receipt form, so Enter is handled here.
 */
export function VrCreateInline({ origin, onCreated, onConflict, onCancel }) {
  const inputId = useId();
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const command = useRef(null);
  async function create() {
    const vrLabel = label.trim();
    if (busy) return;
    if (!vrLabel) { setError('Indique el consecutivo de la VR.'); return; }
    setBusy(true); setError('');
    try {
      command.current ||= { vrLabel, reason: 'Apertura de VR para recepción documental', idempotencyKey: crypto.randomUUID() };
      await createCanonicalSubmit(origin.project.fun0Id, command.current);
      onCreated(vrLabel);
    } catch (failure) { failureHandler(command, setError, onConflict)(failure); }
    finally { setBusy(false); }
  }
  return (
    <div className="space-y-2 rounded-md border border-dashed border-border bg-muted/20 p-3" role="group" aria-label="Crear VR">
      <label htmlFor={inputId} className={labelClass}>Consecutivo de la nueva VR</label>
      <div className="flex flex-wrap gap-2">
        <input
          id={inputId}
          name="vrLabel"
          className={`${fieldClass} mt-0 flex-1`}
          maxLength={160}
          value={label}
          disabled={busy}
          onChange={(event) => { command.current = null; setLabel(event.target.value); }}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); create(); } }}
        />
        <Button type="button" size="sm" className="min-h-10" disabled={busy} onClick={create}>{busy ? 'Creando…' : 'Crear VR'}</Button>
        {onCancel ? <Button type="button" size="sm" variant="ghost" className="min-h-10" disabled={busy} onClick={onCancel}>Cancelar</Button> : null}
      </div>
      <ErrorMessage error={error} />
    </div>
  );
}

/** Receives a new document or a new version (`previous`) of an existing one. */
export function ReceiptForm({ origin, view, fixedSubmitId, previous, canCreateSubmit = false, onSubmitCreated, onSaved, onCancel, onConflict }) {
  const ids = useId();
  const previousClass = previous ? documentClassOf(previous) : null;
  const [documentClass, setDocumentClass] = useState(previousClass || 'requirement');
  const [documentId, setDocumentId] = useState(previous?.documentId || '');
  const [submitId, setSubmitId] = useState(String(fixedSubmitId || ''));
  const [createdLabel, setCreatedLabel] = useState('');
  const [creatingVr, setCreatingVr] = useState(false);
  const [physical, setPhysical] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // A new version must come from a VR not used by the previous versions of the document.
  const [usedSubmits, setUsedSubmits] = useState(() => new Set(previous && Number.isInteger(previous.receipt.submitId) ? [previous.receipt.submitId] : []));
  const command = useRef(null);
  useEffect(() => {
    if (!previous || (previous.versionCount ?? 1) <= 1) return undefined;
    let active = true;
    getCanonicalVersionSubmitIds(origin.project.fun0Id, previous)
      .then((used) => { if (active) setUsedSubmits((current) => new Set([...current, ...used])); })
      .catch(() => {}); // The server still rejects a repeated VR with VERSION_VR_CONFLICT.
    return () => { active = false; };
  }, [origin.project.fun0Id, previous]);
  const isAnnex = documentClass === 'annex';
  const documents = origin.catalogue.documents.filter((document) => document.documentId && (document.isActive === true || document.isActive === 1));
  const selected = documents.find((document) => document.documentId === documentId);
  const applicableIds = new Set((view.requirements?.documents || []).map((document) => document.documentId));
  // A VR created from this form is preselected once the reloaded view lists it.
  const createdSubmit = createdLabel ? view.submits.find((submit) => submit.idPublic === createdLabel) : null;
  const chosenSubmitId = submitId || (createdSubmit ? String(createdSubmit.id) : '');
  const submitUsed = Boolean(previous) && usedSubmits.has(Number(chosenSubmitId));
  const availableSubmits = previous ? view.submits.filter((submit) => !usedSubmits.has(submit.id)) : view.submits;
  const noVrLeft = !fixedSubmitId && (previous ? availableSubmits.length === 0 : view.submits.length === 0);
  const blocked = noVrLeft || submitUsed;
  const hasTitle = isAnnex ? Boolean(String(previous?.title || draft.title).trim()) : Boolean(selected);
  const hasSubmit = view.submits.some((submit) => submit.id === Number(chosenSubmitId));
  const pages = Number(draft.pages);
  const missing = [
    !hasTitle && (isAnnex ? 'Indique el título del anexo.' : 'Seleccione un documento del catálogo.'),
    !hasSubmit && 'Seleccione la VR de recepción.',
    physical && !(Number.isInteger(pages) && pages >= 1) && 'Indique los folios físicos (número entero mayor que cero).',
    physical && !draft.location.trim() && 'Indique la ubicación o referencia física.',
    !physical && !draft.hasDigital && 'Registre el soporte físico o adjunte un archivo digital.',
    !draft.reason.trim() && 'Escriba la nota de recepción.',
  ].filter(Boolean);
  function vrCreated(label) {
    setCreatedLabel(label); setSubmitId(''); setCreatingVr(false);
    onSubmitCreated?.(label);
  }
  async function save(event) {
    event.preventDefault(); if (busy) return;
    const data = new FormData(event.currentTarget);
    const digital = data.get('digital'); const scan = data.get('scan');
    const title = isAnnex ? String(previous?.title || data.get('title') || '').trim() : selected?.name;
    if ((isAnnex ? !title : !selected) || !view.submits.some((submit) => submit.id === Number(chosenSubmitId))) { setError(isAnnex ? 'Indique el título del anexo y una VR del expediente.' : 'Seleccione un documento del catálogo y una VR del expediente.'); return; }
    if (submitUsed) { setError('Este documento ya tiene una versión en esa VR. Seleccione una VR diferente a las de las versiones anteriores.'); return; }
    if (!physical && !digital?.size) { setError('Registre el soporte físico o adjunte un archivo digital.'); return; }
    if ([digital, scan].some((file) => file?.size > MAX_FILE_BYTES)) { setError('Cada archivo debe pesar como máximo 50 MB.'); return; }
    setBusy(true); setError('');
    try {
      command.current ||= { documentClass, ...(isAnnex ? {} : { documentId: selected.documentId }), submitId: Number(chosenSubmitId), title,
        instanceLabel: String(data.get('instanceLabel') || '').trim() || null, documentKey: previous?.documentKey || null,
        previousVersionId: previous?.receivedDocumentRowId || null, expectedRowVersion: previous?.receipt.rowVersion || null,
        contributor: String(data.get('contributor') || '') || null, channel: String(data.get('channel') || 'counter'),
        receivedAt: new Date().toISOString(), physical: physical ? { pages: Number(data.get('pages')), location: String(data.get('location')).trim(), reference: null } : null,
        pagesDigital: null, idempotencyKey: crypto.randomUUID(), reason: String(data.get('reason')).trim() };
      await receiveCanonicalDocument(origin.project.fun0Id, command.current, digital?.size ? digital : null, scan?.size ? scan : null);
      onSaved(previous ? 'Nueva versión recibida. Su revisión de legal y debida forma queda pendiente.' : 'Documento recibido.');
    } catch (failure) {
      if (failure.response) command.current = null;
      const ruleError = documentaryReceiptRuleError(failure);
      if (ruleError) setError(ruleError); else if (failure.response?.status === 409) onConflict(); else setError(documentaryError(failure));
    }
    finally { setBusy(false); }
  }
  const vrAction = canCreateSubmit && !fixedSubmitId && !creatingVr
    ? <Button type="button" variant="outline" size="sm" onClick={() => setCreatingVr(true)}><Plus aria-hidden="true" />Crear VR</Button>
    : null;
  return (
    <form onSubmit={save} onChange={(event) => { command.current = null; setDraft(readReceiptDraft(event.currentTarget)); }} className="space-y-4" aria-label={previous ? 'Recibir nueva versión' : 'Recibir documento'}>
      <fieldset disabled={busy} className="space-y-4">
        {previous ? (
          <div className="rounded-md bg-muted/40 p-3 text-sm">
            <p className="m-0 text-xs text-muted-foreground">{CLASS_LABELS[previousClass] || 'Documento'}</p>
            <p className="m-0 font-medium">{[previous.catalogueDisplay?.code || previous.documentCode, previous.catalogueDisplay?.name || previous.title].filter(Boolean).join(' · ')}</p>
          </div>
        ) : (
          <div>
            <label htmlFor={`${ids}-class`} className={labelClass}>Tipo de documento</label>
            <select id={`${ids}-class`} name="documentClass" className={fieldClass} value={documentClass} onChange={(event) => setDocumentClass(event.target.value)}>
              <option value="requirement">{CLASS_LABELS.requirement} (del catálogo)</option><option value="annex">{CLASS_LABELS.annex} (título libre)</option>
            </select>
          </div>
        )}
        {previous ? null : isAnnex
          ? <div><label htmlFor={`${ids}-title`} className={labelClass}>Título del anexo</label><input id={`${ids}-title`} className={fieldClass} name="title" maxLength={255} required /></div>
          : <CatalogueDocumentPicker id={`${ids}-catalogue`} documents={documents} value={documentId} onChange={setDocumentId} applicableIds={applicableIds} />}
        {!isAnnex && selected && !previous ? <p className={hintClass}>Lista: {selected.listKey || 'Sin lista'} · Categorías: {origin.catalogue.classifications.filter((item) => selected.classificationIds?.includes(item.id)).map((item) => item.name).join(' · ') || 'Sin categoría'}</p> : null}

        <div className="space-y-2">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-0 flex-1">
              <label htmlFor={`${ids}-submit`} className={labelClass}>VR de recepción</label>
              <select id={`${ids}-submit`} name="submitId" className={fieldClass} required disabled={Boolean(fixedSubmitId) || noVrLeft} value={chosenSubmitId} onChange={(event) => setSubmitId(event.target.value)}>
                <option value="">Seleccione la VR</option>{view.submits.map((submit) => <option key={submit.id} value={submit.id} disabled={Boolean(previous) && usedSubmits.has(submit.id)}>{submit.idPublic}{previous && usedSubmits.has(submit.id) ? ' · ya tiene versión' : ''}</option>)}
              </select>
            </div>
            {noVrLeft ? null : vrAction}
          </div>
          {noVrLeft ? (
            <div role="alert" className="space-y-2 rounded-md border border-[hsl(var(--operational-warning-text)/0.25)] bg-[hsl(var(--operational-warning-bg))] p-3 text-sm text-[hsl(var(--operational-warning-text))]">
              <p className="m-0">{previous ? NO_VR_LEFT_MESSAGE : 'El expediente aún no tiene VR. Cree una VR para registrar la entrega.'}</p>
              {vrAction}
            </div>
          ) : null}
          {submitUsed ? <p role="alert" className="text-xs text-destructive">Este documento ya tiene una versión en la VR seleccionada. Una nueva versión debe recibirse en otra VR; para corregir la misma entrega use «Actualizar evidencia».</p> : null}
          {creatingVr ? <VrCreateInline origin={origin} onCreated={vrCreated} onConflict={onConflict} onCancel={() => setCreatingVr(false)} /> : null}
          {createdLabel && !createdSubmit ? <p role="status" className={hintClass}>Cargando la VR {createdLabel}…</p> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${ids}-contributor`} className={labelClass}>Aportado por</label>
            <select id={`${ids}-contributor`} className={fieldClass} name="contributor" defaultValue={previous?.receipt.contributor || 'applicant'}>
              {Object.entries(CONTRIBUTOR_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`${ids}-channel`} className={labelClass}>Medio de recepción</label>
            <select id={`${ids}-channel`} className={fieldClass} name="channel" defaultValue="counter">
              {Object.entries(CHANNEL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label htmlFor={`${ids}-instance`} className={labelClass}>Identificación adicional (opcional)</label><input id={`${ids}-instance`} className={fieldClass} name="instanceLabel" maxLength={255} /></div>
        </div>

        {view.capabilities.receivePhysical ? (
          <fieldset className="space-y-3 rounded-md border border-border p-3">
            <legend className="px-1 text-sm font-semibold">Soporte físico</legend>
            <div className="flex items-center gap-2 text-sm"><input id={`${ids}-physical`} name="hasPhysical" type="checkbox" checked={physical} onChange={(event) => setPhysical(event.target.checked)} /><label htmlFor={`${ids}-physical`}>Se recibió soporte físico</label></div>
            <p className={hintClass}>Marque la casilla si el documento se entregó en papel; así podrá registrar los folios y dónde quedó archivado.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label htmlFor={`${ids}-pages`} className={labelClass}>Folios físicos</label><input id={`${ids}-pages`} className={fieldClass} name="pages" type="number" min={1} step={1} required={physical} disabled={!physical} /></div>
              <div><label htmlFor={`${ids}-location`} className={labelClass}>Ubicación o referencia física</label><input id={`${ids}-location`} className={fieldClass} name="location" maxLength={512} required={physical} disabled={!physical} /></div>
              <div className="sm:col-span-2"><label htmlFor={`${ids}-scan`} className={labelClass}>Escaneado del físico (opcional)</label><input id={`${ids}-scan`} className={fieldClass} name="scan" type="file" accept={FILE_TYPES} disabled={!physical} /></div>
            </div>
          </fieldset>
        ) : null}
        {view.capabilities.receiveDigital ? <div><label htmlFor={`${ids}-digital`} className={labelClass}>Archivo digital (opcional si hay físico)</label><input id={`${ids}-digital`} className={fieldClass} name="digital" type="file" accept={FILE_TYPES} /></div> : null}
        <div><label htmlFor={`${ids}-reason`} className={labelClass}>Nota de recepción</label><input id={`${ids}-reason`} className={fieldClass} name="reason" maxLength={1000} required /></div>
        <p className={hintClass}>Archivos PDF, JPG o PNG; máximo 50 MB cada uno.</p>
        <ErrorMessage error={error} />
        {missing.length && !blocked ? (
          <div id={`${ids}-missing`} className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground" aria-live="polite">
            <p className="m-0 font-medium text-foreground">Para guardar la recepción:</p>
            <ul className="mb-0 mt-1 list-disc pl-4">{missing.map((hint) => <li key={hint}>{hint}</li>)}</ul>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy || blocked || missing.length > 0} aria-describedby={missing.length && !blocked ? `${ids}-missing` : undefined}>{busy ? 'Guardando…' : 'Guardar recepción'}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </fieldset>
    </form>
  );
}

/** Same-VR correction of the evidence of the current version. */
export function EvidenceForm({ origin, row, onSaved, onConflict, onCancel }) {
  const ids = useId();
  const [sameContent, setSameContent] = useState(false);
  const [physical, setPhysical] = useState(Boolean(row.receipt.hasPhysical));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const command = useRef(null);
  async function save(event) {
    event.preventDefault(); if (busy || !sameContent) return;
    const form = event.currentTarget; const data = new FormData(form);
    const digital = form.elements.digital?.files?.[0] || null; const scan = form.elements.scan?.files?.[0] || null;
    if ([digital, scan].some((file) => file?.size > MAX_FILE_BYTES)) { setError('Cada archivo debe pesar como máximo 50 MB.'); return; }
    setBusy(true); setError('');
    try {
      command.current ||= { expectedRowVersion: row.receipt.rowVersion, expectedEvidenceRevision: row.receipt.evidenceRevision, sameContent: true,
        physical: physical ? { pages: Number(data.get('pages')), location: String(data.get('location')).trim() || null, reference: String(data.get('reference') || '').trim() || null } : null,
        pagesDigital: row.receipt.pagesDigital ?? null, idempotencyKey: crypto.randomUUID(), reason: String(data.get('reason')).trim() };
      await updateCanonicalEvidence(origin.project.fun0Id, row.receivedDocumentRowId, command.current, digital, scan);
      onSaved('Evidencia actualizada. Revise nuevamente la revisión de legal y debida forma de este documento.');
    } catch (failure) { failureHandler(command, setError, onConflict)(failure); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} onChange={() => { command.current = null; }} className="space-y-4" aria-label="Actualizar evidencia">
      <p className={hintClass}>Corrige los archivos o el soporte físico de la entrega en la VR {row.receipt.vrLabel || 'actual'}. Si el contenido cambió o llegó en otra VR, registre una nueva versión.</p>
      <fieldset disabled={busy} className="space-y-4">
        <div className="flex gap-2 text-sm"><input id={`${ids}-same`} name="sameContent" type="checkbox" checked={sameContent} onChange={(event) => setSameContent(event.target.checked)} /><label htmlFor={`${ids}-same`}>Confirmo que corresponde al mismo contenido y a la misma VR</label></div>
        <fieldset className="space-y-3 rounded-md border border-border p-3">
          <legend className="px-1 text-sm font-semibold">Soporte físico</legend>
          <div className="flex gap-2 text-sm"><input id={`${ids}-physical`} name="keepPhysical" type="checkbox" checked={physical} onChange={(event) => setPhysical(event.target.checked)} /><label htmlFor={`${ids}-physical`}>Conservar o completar soporte físico</label></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label htmlFor={`${ids}-pages`} className={labelClass}>Folios de esta evidencia</label><input id={`${ids}-pages`} className={fieldClass} name="pages" type="number" min={1} required={physical} disabled={!physical} defaultValue={row.receipt.pagesPhysical || 1} /></div>
            <div><label htmlFor={`${ids}-location`} className={labelClass}>Ubicación de esta evidencia</label><input id={`${ids}-location`} className={fieldClass} name="location" maxLength={512} disabled={!physical} defaultValue={row.receipt.location || ''} /></div>
            <div><label htmlFor={`${ids}-reference`} className={labelClass}>Referencia física</label><input id={`${ids}-reference`} className={fieldClass} name="reference" maxLength={255} disabled={!physical} defaultValue={row.receipt.reference || ''} /></div>
            <div><label htmlFor={`${ids}-scan`} className={labelClass}>Nuevo escaneado</label><input id={`${ids}-scan`} className={fieldClass} name="scan" type="file" accept={FILE_TYPES} disabled={!physical} /></div>
          </div>
        </fieldset>
        <div><label htmlFor={`${ids}-digital`} className={labelClass}>Representación digital del mismo contenido</label><input id={`${ids}-digital`} className={fieldClass} name="digital" type="file" accept={FILE_TYPES} /></div>
        <div><label htmlFor={`${ids}-reason`} className={labelClass}>Motivo de la actualización</label><input id={`${ids}-reason`} className={fieldClass} name="reason" required maxLength={1000} /></div>
        <ErrorMessage error={error} />
        <div className="flex flex-wrap gap-2"><Button type="submit" disabled={!sameContent}>Guardar evidencia</Button><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button></div>
      </fieldset>
    </form>
  );
}

/** Legal y debida forma decision for one control of the current evidence. */
export function ControlDecision({ origin, row, control, canReview, onSaved, onConflict }) {
  const ids = useId();
  const [value, setValue] = useState(control.review?.selectedSourceValueId || '');
  const [observation, setObservation] = useState(control.review?.observation || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const command = useRef(null);
  async function save(event) {
    event.preventDefault();
    if (busy || !canReview) return;
    setBusy(true); setError('');
    try {
      command.current ||= { selectedSourceValueId: value, observation: observation.trim() || null,
        expectedEvidenceRevision: row.receipt.evidenceRevision, expectedResultRevision: control.review?.resultRevision || 0,
        idempotencyKey: crypto.randomUUID(), reason: 'Revisión de Legal y debida forma' };
      await saveCanonicalControl(origin.project.fun0Id, row.receivedDocumentRowId, control.controlId, command.current);
      onSaved('Revisión guardada.');
    } catch (failure) { failureHandler(command, setError, onConflict)(failure); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} onChange={() => { command.current = null; }} className="space-y-2 rounded-md border border-border p-3">
      <p className="m-0 text-sm font-medium">{control.title}</p>
      <p className="m-0 text-xs text-muted-foreground">{control.review?.current === false ? 'La evidencia cambió. Revise nuevamente este control.' : effectLabel(control.review?.effect)}</p>
      <fieldset disabled={busy || !canReview} className="space-y-2">
        <div>
          <label htmlFor={`${ids}-result`} className="block text-sm">Resultado</label>
          <select id={`${ids}-result`} name="result" className={fieldClass} required value={value} onChange={(event) => setValue(event.target.value)}>
            <option value="">Seleccione un resultado</option>
            {control.values.map((item) => <option key={item.sourceValueId} value={item.sourceValueId}>{item.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${ids}-observation`} className="block text-sm">Observación</label>
          <textarea id={`${ids}-observation`} name="observation" className={fieldClass} maxLength={4000} value={observation} onChange={(event) => setObservation(event.target.value)} required={control.values.find((item) => item.sourceValueId === value)?.effect === 'does_not_comply'} />
        </div>
        {canReview ? <Button type="submit" size="sm" disabled={busy}>{busy ? 'Guardando…' : 'Guardar revisión'}</Button> : null}
      </fieldset>
      <ErrorMessage error={error} />
    </form>
  );
}
