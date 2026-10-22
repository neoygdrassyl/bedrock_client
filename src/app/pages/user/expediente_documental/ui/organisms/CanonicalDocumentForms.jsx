import { useEffect, useId, useRef, useState } from 'react';
import { CircleAlert, ListChecks, Plus, TriangleAlert, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import { documentaryError } from '@/app/services/documentary.service';
import { createCanonicalSubmit, documentaryReceiptRuleError, getCanonicalVersionSubmitIds, receiveCanonicalDocument, updateCanonicalEvidence } from '@/app/services/documentaryOperations.service';
import { CatalogueDocumentPicker } from '../molecules/CatalogueDocumentPicker';
import { CheckboxField, fieldClass, fileFieldClass, FormField, FormFieldset, FormSection, hintClass } from '../molecules/FormField';
import { Tag } from '../atoms/Tag';
import { CHANNEL_LABELS, CLASS_LABELS, CONTRIBUTOR_LABELS, documentClassOf, formatDocumentaryDate } from '../../canonicalDocumentaryModel';
import { reviewedByLine, VERDICT_META } from '../../legalFormModel';

export { fieldClass };

const MAX_FILE_BYTES = 52428800;
const FILE_TYPES = 'application/pdf,image/jpeg,image/png';
const FILE_HINT = 'PDF, JPG o PNG; máximo 50 MB.';
const effectLabels = { complies: 'Cumple', does_not_comply: 'No cumple', not_applicable: 'No aplica', no_decision: 'Sin decisión', pending: 'Pendiente', stale: 'Requiere nueva revisión', review_unavailable: 'Revisión no disponible', no_configured_controls: 'Sin controles configurados', unreviewed: 'Pendiente de revisión' };
export const effectLabel = (value) => effectLabels[value] || 'Pendiente de revisión';
/** Tone of an effect tag (shares the verdict palette of Legal y debida forma). */
export const effectTone = (value) => VERDICT_META[value]?.tone || (value === 'no_decision' ? 'slate' : 'neutral');

/**
 * Read-only answer of the applicant for one control (portal self-assessment, informative only: it never
 * alters the curaduría verdict). Rendered under the decision fields of that control.
 */
export function ApplicantAssessmentNote({ item, className }) {
  if (!item) return null;
  const when = item.assessedAt ? formatDocumentaryDate(item.assessedAt) : null;
  return (
    <div className={cn('flex flex-col gap-1 rounded-md border-[1px] border-dashed bg-muted/30 px-[0.75rem] py-2', className)} role="note" aria-label={`Autoevaluación del solicitante: ${item.title || ''}`.trim()}>
      <p className="mb-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />Autoevaluación del solicitante
      </p>
      <p className="mb-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-4 text-foreground">
        <Tag tone={effectTone(item.effect)}>{effectLabel(item.effect)}</Tag>
        {item.valueLabel ? <span>{item.valueLabel}</span> : null}
        {when ? <span className="text-[11px] text-muted-foreground">{when}</span> : null}
      </p>
      {item.observation ? <p className="mb-0 whitespace-pre-line text-xs leading-4 text-muted-foreground">{item.observation}</p> : null}
    </div>
  );
}

/** Applicant answers whose control is not among the ones the curaduría decides on this delivery. */
export function ApplicantOtherAnswers({ items, className }) {
  if (!items?.length) return null;
  return (
    <section className={cn('flex flex-col gap-2 border-t pt-[0.75rem]', className)} aria-label="Otras respuestas del solicitante">
      <h3 className="mb-0 text-xs font-semibold leading-4 text-foreground">Otras respuestas del solicitante</h3>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {items.map((item, index) => (
          <li key={`${item.controlId || 'item'}-${index}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-4 text-muted-foreground">
            <span className="text-foreground">{item.title || item.controlId || 'Control no identificado'}</span>
            <Tag tone={effectTone(item.effect)}>{effectLabel(item.effect)}</Tag>
            {item.valueLabel ? <span>{item.valueLabel}</span> : null}
            {item.observation ? <span className="w-full whitespace-pre-line">{item.observation}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
export const NO_VR_LEFT_MESSAGE = 'Este documento ya tiene una versión en todas las VR del expediente. Cree una VR nueva para registrar otra entrega.';

/** Inline error of a documentary command or query. */
export function ErrorMessage({ error, className }) {
  if (!error) return null;
  return (
    <Alert variant="destructive" className={cn('px-[0.75rem] py-2', className)}>
      <CircleAlert aria-hidden="true" />
      <AlertDescription className="min-w-0 flex-1 break-words">{error}</AlertDescription>
    </Alert>
  );
}

/** Scrollable form body plus the footer with the actions, pinned to the bottom of the sheet. */
function SheetFormLayout({ children, actions }) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-[1.25rem]">
        <div className="flex flex-col gap-[1.25rem]">{children}</div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-muted/30 px-6 py-[0.75rem]">{actions}</div>
    </>
  );
}

// The outer fieldset only disables the whole form while saving; it must not draw the global fieldset box.
const FORM_FIELDSET_CLASS = 'm-0 flex min-h-0 min-w-0 flex-1 flex-col p-0 !border-0';

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
    <div className="flex flex-col gap-2 rounded-lg border-[1px] border-dashed border-[hsl(var(--primary)/0.35)] bg-primary/5 p-[0.75rem]" role="group" aria-label="Crear VR">
      <FormField id={inputId} label="Consecutivo de la nueva VR" hint="La VR se crea en el expediente y queda seleccionada para esta recepción.">
        <div className="flex flex-wrap gap-2">
          <Input
            id={inputId}
            name="vrLabel"
            className="h-9 min-w-[10rem] flex-1 text-sm"
            maxLength={160}
            value={label}
            disabled={busy}
            aria-describedby={`${inputId}-hint`}
            onChange={(event) => { command.current = null; setLabel(event.target.value); }}
            onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); create(); } }}
          />
          <Button type="button" size="sm" disabled={busy} onClick={create}>{busy ? 'Creando…' : 'Crear VR'}</Button>
          {onCancel ? <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onCancel}>Cancelar</Button> : null}
        </div>
      </FormField>
      <ErrorMessage error={error} />
    </div>
  );
}

const INSTANCE_CHOICE = { instance: 'instance', version: 'version' };

/**
 * Current rows (loaded page of the view) of the catalogue document being received. A document that
 * allows multiple instances may get a new instance or a new version of one of them.
 */
export function existingInstancesOf(view, documentId) {
  if (!documentId) return [];
  // Rows from backends without the allowsMultipleInstances flag keep the previous behaviour (no choice).
  return (view.rows || []).filter((row) => documentClassOf(row) === 'requirement' && row.documentId === documentId && typeof row.allowsMultipleInstances === 'boolean');
}

/** Choice between a new instance and a new version of an existing one (multi-instance documents). */
function InstanceChoice({ ids, instances, multiple, choice, onChoice, versionKey, onVersionKey, onReceiveVersion }) {
  const target = instances.find((row) => row.rowKey === versionKey) || null;
  if (!multiple) {
    const row = instances[0];
    return (
      <Alert role="note" variant="warning" className="flex-wrap items-center">
        <TriangleAlert aria-hidden="true" />
        <AlertDescription className="min-w-0 flex-1">Este documento ya fue recibido y no admite otra instancia. Registre una nueva versión.</AlertDescription>
        {onReceiveVersion && row?.actions?.replace ? <Button type="button" variant="outline" size="sm" onClick={() => onReceiveVersion(row)}>Recibir nueva versión</Button> : null}
      </Alert>
    );
  }
  return (
    <FormFieldset legend="Instancias del documento" description={`Ya hay ${instances.length} ${instances.length === 1 ? 'instancia recibida' : 'instancias recibidas'}.`}>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Tipo de recepción">
        {[{ value: INSTANCE_CHOICE.instance, label: 'Nueva instancia' }, { value: INSTANCE_CHOICE.version, label: 'Nueva versión de una instancia existente' }].map((option) => (
          <div key={option.value} className="flex items-center gap-2.5">
            <input id={`${ids}-choice-${option.value}`} type="radio" name="instanceChoice" value={option.value} checked={choice === option.value} onChange={() => onChoice(option.value)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
            <label htmlFor={`${ids}-choice-${option.value}`} className="text-sm leading-5 text-foreground">{option.label}</label>
          </div>
        ))}
      </div>
      {choice === INSTANCE_CHOICE.version ? (
        <div className="flex flex-wrap items-end gap-2">
          <FormField id={`${ids}-version-of`} label="Instancia" className="min-w-[12rem] flex-1">
            <select id={`${ids}-version-of`} className={fieldClass} value={versionKey} onChange={(event) => onVersionKey(event.target.value)}>
              <option value="">Seleccione la instancia</option>
              {instances.map((row) => <option key={row.rowKey} value={row.rowKey} disabled={!row.actions?.replace}>{row.instanceLabel || 'Sin identificación'} · {row.receipt.vrLabel || 'VR'}</option>)}
            </select>
          </FormField>
          <Button type="button" size="sm" className="mb-0.5" disabled={!target} onClick={() => onReceiveVersion?.(target)}>Continuar</Button>
        </div>
      ) : null}
    </FormFieldset>
  );
}

/** Receives a new document or a new version (`previous`) of an existing one. */
export function ReceiptForm({ origin, view, fixedSubmitId, previous, canCreateSubmit = false, onSubmitCreated, onSaved, onCancel, onConflict, onReceiveVersion }) {
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
  const [instanceChoice, setInstanceChoice] = useState(INSTANCE_CHOICE.instance);
  const [versionKey, setVersionKey] = useState('');
  const [instanceLabel, setInstanceLabel] = useState('');
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
  const instances = previous || isAnnex ? [] : existingInstancesOf(view, selected?.documentId);
  const multipleInstances = instances.some((row) => row.allowsMultipleInstances === true);
  // A received single-instance document only accepts new versions; a new instance needs its own label.
  const newInstance = instances.length > 0 && multipleInstances && instanceChoice === INSTANCE_CHOICE.instance;
  const usedLabels = new Set(instances.map((row) => String(row.instanceLabel || '').trim().toLowerCase()));
  const labelTaken = newInstance && usedLabels.has(instanceLabel.trim().toLowerCase());
  const instanceBlocked = instances.length > 0 && (!multipleInstances || instanceChoice === INSTANCE_CHOICE.version);
  const availableSubmits = previous ? view.submits.filter((submit) => !usedSubmits.has(submit.id)) : view.submits;
  const noVrLeft = !fixedSubmitId && (previous ? availableSubmits.length === 0 : view.submits.length === 0);
  const blocked = noVrLeft || submitUsed || instanceBlocked;
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
    newInstance && !instanceLabel.trim() && 'Indique la identificación de la nueva instancia (por ejemplo, «Hoja 2»).',
    labelTaken && 'Ya existe una instancia con esa identificación.',
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
    if (newInstance && (!instanceLabel.trim() || labelTaken)) { setError('Indique una identificación nueva para la instancia.'); return; }
    if (!physical && !digital?.size) { setError('Registre el soporte físico o adjunte un archivo digital.'); return; }
    if ([digital, scan].some((file) => file?.size > MAX_FILE_BYTES)) { setError('Cada archivo debe pesar como máximo 50 MB.'); return; }
    setBusy(true); setError('');
    try {
      command.current ||= { documentClass, ...(isAnnex ? {} : { documentId: selected.documentId }), submitId: Number(chosenSubmitId), title,
        instanceLabel: previous ? previous.instanceLabel || null : instanceLabel.trim() || null, documentKey: previous?.documentKey || null,
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
  const showMissing = missing.length > 0 && !blocked;
  return (
    <form onSubmit={save} onChange={(event) => { command.current = null; setDraft(readReceiptDraft(event.currentTarget)); }} className="flex min-h-0 flex-1 flex-col" aria-label={previous ? 'Recibir nueva versión' : 'Recibir documento'}>
      <fieldset disabled={busy} className={FORM_FIELDSET_CLASS}>
        <SheetFormLayout
          actions={(
            <>
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={busy || blocked || missing.length > 0} aria-describedby={showMissing ? `${ids}-missing` : undefined}>{busy ? 'Guardando…' : 'Guardar recepción'}</Button>
            </>
          )}
        >
          <FormSection title="Documento" description={previous ? 'La nueva versión queda asociada al mismo documento.' : 'Elija el documento del catálogo o registre un anexo con título libre.'}>
            {previous ? (
              <div className="rounded-lg border bg-muted/30 px-[0.75rem] py-2.5">
                <p className="mb-0 text-xs text-muted-foreground">{CLASS_LABELS[previousClass] || 'Documento'}</p>
                <p className="mb-0 mt-0.5 text-sm font-medium text-foreground">{[previous.catalogueDisplay?.code || previous.documentCode, previous.catalogueDisplay?.name || previous.title].filter(Boolean).join(' · ')}</p>
              </div>
            ) : (
              <FormField id={`${ids}-class`} label="Tipo de documento">
                <select id={`${ids}-class`} name="documentClass" className={fieldClass} value={documentClass} onChange={(event) => setDocumentClass(event.target.value)}>
                  <option value="requirement">{CLASS_LABELS.requirement} (del catálogo)</option><option value="annex">{CLASS_LABELS.annex} (título libre)</option>
                </select>
              </FormField>
            )}
            {previous ? null : isAnnex
              ? <FormField id={`${ids}-title`} label="Título del anexo"><Input id={`${ids}-title`} className="text-sm" name="title" maxLength={255} required /></FormField>
              : <CatalogueDocumentPicker id={`${ids}-catalogue`} documents={documents} value={documentId} onChange={setDocumentId} applicableIds={applicableIds} />}
            {instances.length ? (
              <InstanceChoice ids={ids} instances={instances} multiple={multipleInstances} choice={instanceChoice} onChoice={setInstanceChoice}
                versionKey={versionKey} onVersionKey={setVersionKey} onReceiveVersion={onReceiveVersion} />
            ) : null}
            {!isAnnex && selected && !previous ? <p className={hintClass}>Lista: {selected.listKey || 'Sin lista'} · Categorías: {origin.catalogue.classifications.filter((item) => selected.classificationIds?.includes(item.id)).map((item) => item.name).join(' · ') || 'Sin categoría'}</p> : null}
          </FormSection>

          <FormSection title="Entrega" description="VR en la que se recibe el documento y quién lo aporta.">
            <div className="flex flex-wrap items-end gap-2">
              <FormField id={`${ids}-submit`} label="VR de recepción" className="min-w-[12rem] flex-1">
                <select id={`${ids}-submit`} name="submitId" className={fieldClass} required disabled={Boolean(fixedSubmitId) || noVrLeft} value={chosenSubmitId} onChange={(event) => setSubmitId(event.target.value)}>
                  <option value="">Seleccione la VR</option>{view.submits.map((submit) => <option key={submit.id} value={submit.id} disabled={Boolean(previous) && usedSubmits.has(submit.id)}>{submit.idPublic}{previous && usedSubmits.has(submit.id) ? ' · ya tiene versión' : ''}</option>)}
                </select>
              </FormField>
              {noVrLeft || !vrAction ? null : <div className="pb-0.5">{vrAction}</div>}
            </div>
            {noVrLeft ? (
              <Alert role="alert" variant="warning" className="flex-wrap items-center">
                <TriangleAlert aria-hidden="true" />
                <AlertDescription className="min-w-0 flex-1">{previous ? NO_VR_LEFT_MESSAGE : 'El expediente aún no tiene VR. Cree una VR para registrar la entrega.'}</AlertDescription>
                {vrAction}
              </Alert>
            ) : null}
            {submitUsed ? <p role="alert" className="mb-0 text-xs leading-4 text-destructive">Este documento ya tiene una versión en la VR seleccionada. Una nueva versión debe recibirse en otra VR; para corregir la misma entrega use «Actualizar evidencia».</p> : null}
            {creatingVr ? <VrCreateInline origin={origin} onCreated={vrCreated} onConflict={onConflict} onCancel={() => setCreatingVr(false)} /> : null}
            {createdLabel && !createdSubmit ? <p role="status" className={hintClass}>Cargando la VR {createdLabel}…</p> : null}
            <div className="grid gap-[0.75rem] sm:grid-cols-2">
              <FormField id={`${ids}-contributor`} label="Aportado por">
                <select id={`${ids}-contributor`} className={fieldClass} name="contributor" defaultValue={previous?.receipt.contributor || 'applicant'}>
                  {Object.entries(CONTRIBUTOR_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </FormField>
              <FormField id={`${ids}-channel`} label="Medio de recepción">
                <select id={`${ids}-channel`} className={fieldClass} name="channel" defaultValue="counter">
                  {Object.entries(CHANNEL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </FormField>
              {previous ? null : (
                <FormField id={`${ids}-instance`} label={newInstance ? 'Identificación de la instancia' : 'Identificación adicional (opcional)'} hint={newInstance ? 'Por ejemplo, «Hoja 2».' : undefined}
                  error={labelTaken ? 'Ya existe una instancia con esa identificación.' : undefined} className="sm:col-span-2">
                  <Input id={`${ids}-instance`} className="text-sm" name="instanceLabel" maxLength={255} value={instanceLabel} onChange={(event) => setInstanceLabel(event.target.value)}
                    required={newInstance} aria-invalid={labelTaken} aria-describedby={newInstance ? `${ids}-instance-hint` : undefined} />
                </FormField>
              )}
            </div>
          </FormSection>

          {view.capabilities.receivePhysical || view.capabilities.receiveDigital ? (
            <FormSection title="Soportes" description="Registre el soporte físico, el archivo digital o ambos.">
              {view.capabilities.receivePhysical ? (
                <FormFieldset legend="Soporte físico" description="Marque la casilla si el documento se entregó en papel; así podrá registrar los folios y dónde quedó archivado.">
                  <CheckboxField id={`${ids}-physical`} name="hasPhysical" label="Se recibió soporte físico" checked={physical} onChange={(event) => setPhysical(event.target.checked)} />
                  <div className="grid gap-[0.75rem] sm:grid-cols-2">
                    <FormField id={`${ids}-pages`} label="Folios físicos" hint="Número entero mayor que cero.">
                      <Input id={`${ids}-pages`} className="text-sm" name="pages" type="number" min={1} step={1} required={physical} disabled={!physical} aria-describedby={`${ids}-pages-hint`} />
                    </FormField>
                    <FormField id={`${ids}-location`} label="Ubicación o referencia física" hint="Caja, carpeta o estante.">
                      <Input id={`${ids}-location`} className="text-sm" name="location" maxLength={512} required={physical} disabled={!physical} aria-describedby={`${ids}-location-hint`} />
                    </FormField>
                    <FormField id={`${ids}-scan`} label="Escaneado del físico (opcional)" hint={FILE_HINT} className="sm:col-span-2">
                      <input id={`${ids}-scan`} className={fileFieldClass} name="scan" type="file" accept={FILE_TYPES} disabled={!physical} aria-describedby={`${ids}-scan-hint`} />
                    </FormField>
                  </div>
                </FormFieldset>
              ) : null}
              {view.capabilities.receiveDigital ? (
                <FormField id={`${ids}-digital`} label="Archivo digital (opcional si hay físico)" hint={FILE_HINT}>
                  <input id={`${ids}-digital`} className={fileFieldClass} name="digital" type="file" accept={FILE_TYPES} aria-describedby={`${ids}-digital-hint`} />
                </FormField>
              ) : null}
            </FormSection>
          ) : null}

          <FormField id={`${ids}-reason`} label="Nota de recepción" hint="Queda en el historial documental del expediente.">
            <Input id={`${ids}-reason`} className="text-sm" name="reason" maxLength={1000} required aria-describedby={`${ids}-reason-hint`} />
          </FormField>

          <ErrorMessage error={error} />
          {showMissing ? (
            <Alert id={`${ids}-missing`} role="status" variant="neutral" aria-live="polite" className="py-2.5">
              <ListChecks aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <AlertTitle className="text-xs">Para guardar la recepción:</AlertTitle>
                <ul className="mb-0 mt-1 list-disc pl-4 text-xs leading-5 text-muted-foreground">{missing.map((hint) => <li key={hint}>{hint}</li>)}</ul>
              </div>
            </Alert>
          ) : null}
        </SheetFormLayout>
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
    <form onSubmit={save} onChange={() => { command.current = null; }} className="flex min-h-0 flex-1 flex-col" aria-label="Actualizar evidencia">
      <fieldset disabled={busy} className={FORM_FIELDSET_CLASS}>
        <SheetFormLayout
          actions={(
            <>
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={!sameContent}>Guardar evidencia</Button>
            </>
          )}
        >
          <Alert role="note" variant="default" className="flex-col gap-2">
            <p className="mb-0 text-sm leading-5">Corrige los archivos o el soporte físico de la entrega en la VR {row.receipt.vrLabel || 'actual'}. Si el contenido cambió o llegó en otra VR, registre una nueva versión.</p>
            <CheckboxField id={`${ids}-same`} name="sameContent" label="Confirmo que corresponde al mismo contenido y a la misma VR" checked={sameContent} onChange={(event) => setSameContent(event.target.checked)} />
          </Alert>
          <FormFieldset legend="Soporte físico">
            <CheckboxField id={`${ids}-physical`} name="keepPhysical" label="Conservar o completar soporte físico" checked={physical} onChange={(event) => setPhysical(event.target.checked)} />
            <div className="grid gap-[0.75rem] sm:grid-cols-2">
              <FormField id={`${ids}-pages`} label="Folios de esta evidencia"><Input id={`${ids}-pages`} className="text-sm" name="pages" type="number" min={1} required={physical} disabled={!physical} defaultValue={row.receipt.pagesPhysical || 1} /></FormField>
              <FormField id={`${ids}-location`} label="Ubicación de esta evidencia"><Input id={`${ids}-location`} className="text-sm" name="location" maxLength={512} disabled={!physical} defaultValue={row.receipt.location || ''} /></FormField>
              <FormField id={`${ids}-reference`} label="Referencia física"><Input id={`${ids}-reference`} className="text-sm" name="reference" maxLength={255} disabled={!physical} defaultValue={row.receipt.reference || ''} /></FormField>
              <FormField id={`${ids}-scan`} label="Nuevo escaneado" hint={FILE_HINT}><input id={`${ids}-scan`} className={fileFieldClass} name="scan" type="file" accept={FILE_TYPES} disabled={!physical} aria-describedby={`${ids}-scan-hint`} /></FormField>
            </div>
          </FormFieldset>
          <FormField id={`${ids}-digital`} label="Representación digital del mismo contenido" hint={FILE_HINT}>
            <input id={`${ids}-digital`} className={fileFieldClass} name="digital" type="file" accept={FILE_TYPES} aria-describedby={`${ids}-digital-hint`} />
          </FormField>
          <FormField id={`${ids}-reason`} label="Motivo de la actualización" hint="Queda en el historial documental del expediente.">
            <Input id={`${ids}-reason`} className="text-sm" name="reason" required maxLength={1000} aria-describedby={`${ids}-reason-hint`} />
          </FormField>
          <ErrorMessage error={error} />
        </SheetFormLayout>
      </fieldset>
    </form>
  );
}

/**
 * Presentational fields of one control decision: title, status, previous reviewer, result select
 * and observation. `children` render inside the (disabled-while-busy) fieldset, e.g. a save button.
 */
export function ControlDecisionFields({ idPrefix, control, value, observation, onValueChange, onObservationChange, disabled = false, invalid = false, children }) {
  const stale = control.review?.current === false;
  const reviewedBy = reviewedByLine({ name: control.review?.actorName, id: control.review?.actorId, at: control.review?.decidedAt });
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="mb-0 text-sm font-medium leading-5 text-foreground">{control.title}</p>
        <p className={cn('mb-0 text-xs leading-4', stale ? 'font-medium text-[hsl(var(--operational-warning-text))]' : 'text-muted-foreground')}>
          {stale ? 'La evidencia cambió. Revise nuevamente este control.' : effectLabel(control.review?.effect)}
        </p>
        {reviewedBy ? <p className="mb-0 text-[11px] leading-4 text-muted-foreground">{reviewedBy}</p> : null}
      </div>
      <fieldset disabled={disabled} className="m-0 flex min-w-0 flex-col gap-[0.75rem] p-0 !border-0">
        <FormField id={`${idPrefix}-result`} label="Resultado">
          <select id={`${idPrefix}-result`} name="result" className={fieldClass} required value={value} onChange={(event) => onValueChange(event.target.value)}>
            <option value="">Seleccione un resultado</option>
            {control.values.map((item) => <option key={item.sourceValueId} value={item.sourceValueId}>{item.label}</option>)}
          </select>
        </FormField>
        <FormField id={`${idPrefix}-observation`} label="Observación">
          <textarea id={`${idPrefix}-observation`} name="observation" rows={3} className={cn(fieldClass, 'min-h-[4.5rem] resize-y')} maxLength={4000} value={observation} onChange={(event) => onObservationChange(event.target.value)}
            required={control.values.find((item) => item.sourceValueId === value)?.effect === 'does_not_comply'} aria-invalid={invalid || undefined} />
        </FormField>
        {children}
      </fieldset>
    </>
  );
}
