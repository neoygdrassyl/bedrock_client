import { useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown, CircleAlert, CircleCheck, ListChecks, Lock, RefreshCw, Scale, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import FUN_SERVICE from '@/features/expediente/api/fun.service';
import { declareLegalForm, listTypologySelections, revokeLegalForm, SUBJECT_STORAGE_MESSAGE, updateLegalFormDeclaration } from '@/features/expediente/api/documentaryLegalForm.service';
import { refreshRequirementsFor } from '@/features/expediente/api/documentaryRequirements.service';
import { Tag } from '../atoms/Tag';
import { ChecklistDialog, CommandDialog, TypologySelectionDialog } from './LegalFormDialogs';
import { CanonicalDocumentaryWorkspace } from './CanonicalDocumentaryWorkspace';
import { LdfParties } from './LdfParties';
import { LdfChecklist } from './LdfChecklist';
import { LdfRequirementContext, LdfRequirementSheet } from './LdfRequirementDetail';
import { useLegalForm } from '../../hooks/useLegalForm';
import { formatDocumentaryDate } from '../../canonicalDocumentaryModel';
import { buildSections, instancesByKey, LEGAL_FORM_STATE_META, missingFactLabels, MUTED_ALTERNATIVE_TEXT, SECTION_STATE_META, SELECTION_SOURCE_LABELS, VERDICT_META } from '../../legalFormModel';
import { buildLdfChecklist, partiesOf, primaryInstance, requirementOfDocumentKey } from '../../ldfChecklistModel';

const CONFLICT_MESSAGE = 'Los datos cambiaron. Revise el estado actualizado y confirme nuevamente su decisión.';
/** " por {name}" / " por el usuario {id}" of an actor, or nothing when unknown. */
const personSuffix = (name, id) => (name ? ` por ${name}` : id != null ? ` por el usuario ${id}` : '');
const ITEM_ERROR = 'No fue posible cargar el expediente para generar el formato. Cierre e intente nuevamente.';

/** State line of the expediente and the warning of an incomplete evaluation; the pending items live in the checklist. */
function StateBanner({ data }) {
  const meta = LEGAL_FORM_STATE_META[data.state] || LEGAL_FORM_STATE_META.not_ready;
  const incomplete = (data.warnings || []).some((warning) => warning.code === 'REQUIREMENTS_INCOMPLETE');
  const missing = missingFactLabels(data);
  return (
    <div className="flex flex-col gap-2 border-b px-[1rem] py-[0.75rem]" role="region" aria-label="Estado de legal y debida forma">
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone={meta.tone} data-testid="legal-form-state">{meta.label}</Tag>
        <p className="mb-0 min-w-0 flex-1 text-sm leading-5 text-foreground">{meta.text}</p>
      </div>
      {incomplete || missing.length ? (
        <div className="flex flex-col gap-1.5" data-testid="legal-form-warning">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="warning">Evaluación incompleta</Tag>
            <p className="mb-0 min-w-0 flex-1 text-xs leading-5 text-muted-foreground">Faltan datos del FUN; los documentos de esas tipologías no se listan todavía:</p>
          </div>
          {missing.length ? <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Datos del FUN faltantes">{missing.map((label) => <li key={label}><Tag tone="neutral">{label}</Tag></li>)}</ul> : null}
        </div>
      ) : null}
    </div>
  );
}

/** One requirement line of a section: code, title and verdict; muted when an alternative already satisfies its group. */
function SectionRequirement({ requirement, muted }) {
  const verdict = requirement.delivered ? VERDICT_META[requirement.verdict] || VERDICT_META.pending : null;
  return (
    <li className={cn('flex flex-wrap items-center gap-x-2 gap-y-0.5 py-1 text-xs leading-5', muted && 'opacity-60')} data-testid={`legal-form-section-item-${requirement.documentCode}`}>
      <span className="w-12 shrink-0 font-mono text-foreground">{requirement.documentCode}</span>
      <span className="min-w-0 flex-1 text-foreground">{requirement.title || 'Documento sin nombre'}</span>
      {muted ? <span className="text-muted-foreground">{MUTED_ALTERNATIVE_TEXT}</span>
        : verdict ? <Tag tone={verdict.tone}>{verdict.label}</Tag>
          : <Tag tone={requirement.required ? 'warning' : 'neutral'}>{requirement.required ? 'Sin entregar' : 'Opcional'}</Tag>}
    </li>
  );
}

/**
 * Requirements grouped by typology section (typology name, chosen options with their source, state) and inside each
 * by option group. Renders nothing unless a typology section exists. `selectable(typologyCode)` tells
 * whether the "Elegir opción" action applies to a section.
 */
function RequirementSections({ data, selectable, onChoose }) {
  const sections = buildSections(data);
  const [closed, setClosed] = useState(() => new Set());
  // Without typology sections (older backend or no typology applies) the panel stays as before: the table lists the documents.
  if (!sections.some((section) => section.typologyCode)) return null;
  const toggle = (key) => setClosed((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  return (
    <div className="flex flex-col divide-y border-b" data-testid="legal-form-sections">
      {sections.map((section) => {
        const meta = section.state ? SECTION_STATE_META[section.state] : null;
        const open = !closed.has(section.key);
        const bodyId = `legal-form-section-${section.key}`;
        return (
          <section key={section.key} className="px-[1rem] py-2" aria-label={section.title || 'Requisitos'} data-testid={`legal-form-section-${section.key}`}>
            {section.title ? (
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="flex min-w-0 items-center gap-1.5 bg-transparent p-0 text-left text-sm font-semibold leading-5 text-foreground" aria-expanded={open} aria-controls={bodyId} onClick={() => toggle(section.key)}>
                  <ChevronDown aria-hidden="true" className={cn('h-3.5 w-3.5 shrink-0 transition-transform motion-reduce:transition-none', !open && '-rotate-90')} />
                  {section.title}
                </button>
                {section.optionLabels.map((label) => <Tag key={label} tone="info">{label}</Tag>)}
                {section.selectionSource ? <Tag tone="slate" title="Origen de la selección">{SELECTION_SOURCE_LABELS[section.selectionSource] || section.selectionSource}</Tag> : null}
                {meta ? <Tag tone={meta.tone} data-testid={`legal-form-section-state-${section.key}`}>{meta.label}</Tag> : null}
                {section.typologyCode && selectable(section.typologyCode) ? (
                  <Button type="button" variant="outline" size="sm" className="ml-auto h-7 px-2 text-xs" onClick={() => onChoose(section.typologyCode)}>Elegir opción</Button>
                ) : null}
              </div>
            ) : null}
            {open ? (
              <div id={bodyId} className={cn('flex flex-col gap-1.5', section.title && 'mt-1.5 pl-5')}>
                {section.options.map((option) => (
                  <div key={option.key} className="flex flex-col">
                    {option.label || option.statusLabel ? (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {option.label ? <span>{option.label}</span> : null}
                        {option.statusLabel ? <Tag tone={option.group?.satisfied === false ? 'warning' : 'neutral'}>{option.statusLabel}</Tag> : null}
                      </div>
                    ) : null}
                    {option.items.length ? (
                      <ul className="m-0 flex list-none flex-col p-0">
                        {option.items.map(({ requirement, muted }) => <SectionRequirement key={`${requirement.documentId || requirement.documentCode}`} requirement={requirement} muted={muted} />)}
                      </ul>
                    ) : null}
                  </div>
                ))}
                {section.state === 'selection_required' && !section.options.some((option) => option.items.length) ? (
                  <p className="mb-0 text-xs leading-5 text-muted-foreground">Debe elegirse una opción para conocer los documentos exigidos de esta tipología.</p>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

/** Secondary block of the panel, closed by default; its content stays mounted (hidden) so what it hosts keeps working. */
function Disclosure({ title, hint, testId, children, className }) {
  const bodyId = useId();
  const [open, setOpen] = useState(false);
  return (
    <section className={cn('flex flex-col', className)} data-testid={testId}>
      <button type="button" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-1.5 bg-transparent px-[1rem] py-2 text-left text-sm font-semibold leading-5 text-foreground transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none">
        <ChevronDown aria-hidden="true" className={cn('h-3.5 w-3.5 shrink-0 transition-transform motion-reduce:transition-none', !open && '-rotate-90')} />
        {title}
        {hint ? <span className="truncate text-xs font-normal text-muted-foreground">· {hint}</span> : null}
      </button>
      <div id={bodyId} hidden={!open}>{children}</div>
    </section>
  );
}

/** Read-only legal-form summary of a traditional expediente (declaration and clock of the legacy module). */
function LegacyConsult({ legacy }) {
  const declared = Boolean(legacy?.declared);
  const state = legacy?.state;
  return (
    <div className="flex flex-col gap-[0.75rem] px-[1rem] py-[1rem]" data-testid="legal-form-legacy" role="region" aria-label="Legal y debida forma de la documentación tradicional">
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone={declared ? 'info' : 'neutral'}>
          {declared ? `Declarada el ${formatDocumentaryDate(legacy.declaredAt)}` : 'No declarada'}
        </Tag>
        {state != null && state !== '' ? <span className="text-xs text-muted-foreground">Estado actual del expediente: <span className="font-medium text-foreground">{String(state)}</span></span> : null}
      </div>
      {legacy?.clockName || legacy?.clockDesc ? (
        <dl className="m-0 grid gap-x-[1rem] gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-xs font-medium text-muted-foreground">Término</dt>
          <dd className="mb-0 text-foreground">{[legacy.clockName, legacy.clockDesc].filter(Boolean).join(' · ')}</dd>
        </dl>
      ) : null}
      <p className="mb-0 text-xs leading-5 text-muted-foreground">Este expediente usa la documentación tradicional: la evaluación de los documentos se hace en el módulo «Chequeo». Aquí solo puede consultar el resultado.</p>
    </div>
  );
}

/**
 * "Legal y debida forma" tab: state, the declaration, the parties of the request (applicants and professionals,
 * completed in the FUN before their documents are evaluated) and ONE document checklist ("Solicitud" and one group
 * per person). A row opens its detail: why it is required (typology and option, with the per-person option picker) and,
 * when delivered, the shared evaluation sheet of its controls. The typology sections and the documents table of
 * Radicación (deliveries and versions) stay available, collapsed. Traditional expedientes only get a read-only consult
 * card of the legacy declaration. `onDeclarationChanged` lets the module reload origin, inventory and the expediente
 * state; `onOpenFunForm(form)` navigates to the FUN form (5.1 / 5.2 / 5.3) of a party.
 * The "Lista de chequeo" action needs `currentVersion` (hidden without it); the FUN it prints is
 * `currentItem` or, when absent, loaded from the expediente when the dialog opens.
 */
export function LegalFormPanel({ origin, canManage = false, onDeclarationChanged, currentItem = null, currentVersion = null, swaMsg, onOpenFunForm }) {
  const titleId = useId();
  const fun0Id = origin?.project?.fun0Id;
  const legal = useLegalForm(fun0Id) || { status: 'loading', data: null, error: '', reload: () => {} };
  const [dialog, setDialog] = useState(null); // 'declare' | 'revoke' | 'update'
  const [notice, setNotice] = useState('');
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [loadedItem, setLoadedItem] = useState(null);
  const [itemError, setItemError] = useState('');
  // Bumped when the legal-form state is refreshed so the documents table reloads with it.
  const [tableRevision, setTableRevision] = useState(0);
  // GET /typology-selections (null while unknown or unavailable: older backends answer 404) and the open picker
  // ({ typologyCode, subjectId }: subjectId for per-person typologies).
  const [selections, setSelections] = useState(null);
  const [choosing, setChoosing] = useState(null);
  // Detail of a checklist row without an evaluation to open (not delivered, alternatives, typology option).
  const [detail, setDetail] = useState(null);
  // Asks the documents table to open the evaluation sheet of a document (pending panel item).
  const [openRequest, setOpenRequest] = useState(null);
  const openEvaluation = (documentKey) => setOpenRequest({ documentKey, nonce: Date.now() });
  // Asks the documents table to open the receipt form preselected ({ documentId, subjectId, nonce }).
  const [receiveRequest, setReceiveRequest] = useState(null);
  const data = legal.data;
  const traditional = data?.mode === 'traditional';
  const actions = data?.actions || {};
  const parties = useMemo(() => partiesOf(data), [data]);
  const checklist = useMemo(() => buildLdfChecklist(data), [data]);
  // Parties with pending data gate the evaluation: the documents of each person depend on them.
  const gated = Boolean(parties?.gated);
  const canReview = Boolean(canManage && actions.review && !gated);
  const canDeclare = Boolean(canManage && actions.declare && data?.state === 'ready');
  const declared = Boolean(data?.declaration);
  const instances = useMemo(() => instancesByKey(data), [data]);
  const sheetLegalForm = useMemo(() => ({ data, reload: legal.reload }), [data, legal.reload]);

  // Typology options can be chosen by managers until the declaration; the list follows each legal-form load.
  const selectionsEnabled = Boolean(fun0Id && canManage && data && !traditional && !declared);
  useEffect(() => {
    if (!selectionsEnabled) { setSelections(null); return undefined; }
    const controller = new AbortController();
    listTypologySelections(fun0Id, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setSelections(result); })
      .catch(() => { if (!controller.signal.aborted) setSelections(null); });
    return () => controller.abort();
  }, [selectionsEnabled, fun0Id, data]);
  const findTypology = (code, subjectId = null) => selections?.typologies?.find((item) => item.typologyCode === code && (item.subjectId || null) === (subjectId || null)) || null;
  /** Whether the option of a typology (of a person) can be chosen here: { available, reason }. */
  function optionState(code, subjectId = null) {
    if (!code || !canManage || traditional) return { available: false, reason: null };
    if (declared) return { available: false, reason: 'Anule la declaración para cambiar opciones.' };
    const typology = findTypology(code, subjectId);
    if (!selectionsEnabled || !typology?.options?.length) return { available: false, reason: null };
    if (subjectId && selections?.subjectSelectionAvailable === false) return { available: false, reason: SUBJECT_STORAGE_MESSAGE };
    if (gated) return { available: false, reason: 'Complete primero las partes de la solicitud.' };
    return { available: true, reason: null };
  }
  const selectableTypology = (code) => optionState(code, null).available;
  const choosingTypology = choosing ? findTypology(choosing.typologyCode, choosing.subjectId) : null;
  const choose = (typologyCode, subjectId = null) => { setNotice(''); setDetail(null); setChoosing({ typologyCode, subjectId: subjectId || null }); };
  // A checklist row: a delivered document opens the evaluation of its first instance needing work; the rest open the detail sheet.
  function openRow(row) {
    setNotice('');
    const instance = row.type === 'document' && row.delivered && origin?.publication ? primaryInstance(row.requirement) : null;
    if (instance) { setDetail(null); openEvaluation(instance.documentKey); return; }
    setDetail({ row, nonce: Date.now() });
  }
  const openInstance = (documentKey) => { setDetail(null); openEvaluation(documentKey); };
  // "Recibir a nombre de …": the receipt form of the documents table, with the document and its person chosen.
  const receiveFor = (row) => { setNotice(''); setDetail(null); setReceiveRequest({ documentId: row.requirement.documentId, subjectId: row.subjectId || null, nonce: Date.now() }); };
  // On top of the evaluation sheet: why Legal y debida forma requires the document of that row.
  const evaluationContext = (viewRow) => {
    const requirement = requirementOfDocumentKey(data, viewRow?.documentKey);
    if (!requirement) return null;
    const row = { type: 'document', requirement, members: [requirement], group: null, subjectId: requirement.subjectId || null, typologyCode: requirement.section?.typologyCode || null };
    return (
      <>
        {gated ? <p role="status" className="mb-2 flex items-center gap-2 text-xs leading-5 text-[hsl(var(--operational-warning-text))]"><Lock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />Completa las partes para evaluar los documentos de cada persona.</p> : null}
        <LdfRequirementContext data={data} row={row} optionState={optionState} onChoose={choose} onOpenInstance={openEvaluation} activeDocumentKey={viewRow.documentKey} />
      </>
    );
  };
  async function selectionSaved(result) {
    setChoosing(null);
    // The backend re-evaluates in the same command; a stale answer asks for the ordinary refresh.
    if (result?.cacheState === 'stale' && selections?.inputRevision != null) {
      try { await refreshRequirementsFor(fun0Id, result.inputRevision ?? selections.inputRevision, 'Actualización tras elegir opción de tipología'); } catch (_) { /* the state banner reports a stale evaluation */ }
    }
    refresh('Selección de tipología guardada.');
  }

  // The checklist PDF prints the FUN: use the given one or load a fresh copy each time the dialog opens.
  useEffect(() => {
    if (!checklistOpen || currentItem) return undefined;
    let ignore = false;
    setLoadedItem(null); setItemError('');
    FUN_SERVICE.get(fun0Id)
      .then((response) => { if (!ignore) setLoadedItem(response.data); })
      .catch(() => { if (!ignore) setItemError(ITEM_ERROR); });
    return () => { ignore = true; };
  }, [checklistOpen, currentItem, fun0Id]);

  function refresh(message = '') { setNotice(message); legal.reload(); setTableRevision((value) => value + 1); }
  // An evaluation saved in the table: the table reloads itself, the legal-form state follows.
  const evaluationSaved = () => legal.reload();
  // A rejected declaration command (409) means the state moved: reload it behind the dialog.
  async function run(command, values, message) {
    try { await command(fun0Id, values); } catch (failure) { if (failure.response?.status === 409) legal.reload(); throw failure; }
    setDialog(null); refresh(message); onDeclarationChanged?.();
  }
  const declare = (values) => run(declareLegalForm, values, 'Expediente declarado en legal y debida forma.');
  const revoke = (values) => run(revokeLegalForm, values, 'Declaración anulada.');
  // Updating keeps the state and the legal clock: only this panel reloads, the module has nothing to refresh.
  async function updateDeclaration(values) {
    let result;
    try { result = await updateLegalFormDeclaration(fun0Id, values); } catch (failure) { if (failure.response?.status === 409) legal.reload(); throw failure; }
    setDialog(null); refresh(result?.wasOutdated === false ? 'La declaración ya estaba al día.' : 'Declaración actualizada.');
  }

  const conflictNotice = notice === CONFLICT_MESSAGE;
  return (
    <section aria-labelledby={titleId} className="flex min-w-0 flex-col gap-[0.75rem]">
      {notice ? (
        <Alert role="status" variant={conflictNotice ? 'warning' : 'success'} className="py-2.5">
          {conflictNotice ? <TriangleAlert aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
          <AlertDescription className="min-w-0 flex-1">{notice}</AlertDescription>
        </Alert>
      ) : null}
      <div className="overflow-hidden rounded-lg border bg-[hsl(var(--card))] shadow-sm">
        <header className="flex flex-wrap items-center gap-[0.75rem] border-b bg-muted/30 px-[1rem] py-[0.75rem]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-[1px] border-solid border-primary/20 bg-primary/10 text-[hsl(var(--primary))]">
            <Scale className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 id={titleId} className="mb-0 min-w-0 flex-1 text-[15px] font-semibold leading-5 text-foreground">Legal y debida forma</h2>
          {data && !traditional && currentVersion != null ? (
            <Button type="button" variant="outline" size="sm" onClick={() => { setNotice(''); setChecklistOpen(true); }}>
              <ListChecks aria-hidden="true" />Lista de chequeo
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" disabled={legal.status === 'loading'} onClick={() => refresh()}>
            <RefreshCw aria-hidden="true" className={cn(legal.status === 'loading' && data && 'animate-spin motion-reduce:animate-none')} />Actualizar
          </Button>
          {traditional ? null : declared ? (
            <>
              {actions.update && canManage ? <Button type="button" size="sm" onClick={() => setDialog('update')}>Actualizar legal y debida forma</Button> : null}
              {actions.revoke && canManage ? <Button type="button" variant="outline" size="sm" onClick={() => setDialog('revoke')}>Anular declaración</Button> : null}
            </>
          ) : data ? (
            <Button type="button" size="sm" disabled={!canDeclare} onClick={() => setDialog('declare')}>Declarar legal y debida forma</Button>
          ) : null}
        </header>

        {legal.error ? (
          <div className="p-[1rem]">
            <Alert variant="destructive" className="flex-wrap items-center">
              <CircleAlert aria-hidden="true" />
              <AlertDescription className="min-w-0 flex-1">{legal.error}</AlertDescription>
              <Button type="button" variant="outline" size="sm" className="h-8 bg-background" onClick={() => refresh()}>Reintentar</Button>
            </Alert>
          </div>
        ) : null}

        {!data && !legal.error ? (
          <div className="flex flex-col gap-2 p-[1rem]" aria-hidden="true"><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></div>
        ) : null}

        {traditional ? <LegacyConsult legacy={data.legacy} /> : null}

        {data && !traditional ? (
          <>
            <StateBanner data={data} />
            {declared ? (
              <div className="flex flex-col gap-0.5 border-b px-[1rem] py-2 text-xs leading-5 text-muted-foreground">
                <p className="mb-0" data-testid="legal-form-declaration">
                  Declarada el {formatDocumentaryDate(data.declaration.at)}{personSuffix(data.declaration.byName, data.declaration.by)}.
                </p>
                {data.declaration.updatedAt ? (
                  <p className="mb-0" data-testid="legal-form-declaration-updated">
                    Actualizada el {formatDocumentaryDate(data.declaration.updatedAt)}{personSuffix(data.declaration.updatedByName, data.declaration.updatedBy)}.
                  </p>
                ) : null}
                {data.outdated ? <p role="status" className="mb-0 font-medium text-[hsl(var(--operational-warning-text))]" data-testid="legal-form-outdated">Hay entregas más recientes que las declaradas.</p> : null}
              </div>
            ) : null}
            {data.checklist ? (
              <p className="mb-0 border-b px-[1rem] py-2 text-[11px] leading-4 text-muted-foreground" data-testid="legal-form-checklist-line">
                Lista de chequeo guardada por {data.checklist.updatedByName || (data.checklist.updatedBy != null ? `usuario ${data.checklist.updatedBy}` : 'un usuario')} · {formatDocumentaryDate(data.checklist.updatedAt)}
              </p>
            ) : null}
            <LdfParties parties={parties} onOpenForm={onOpenFunForm} />
            <LdfChecklist checklist={checklist} onOpen={openRow} gated={gated} />
            {buildSections(data).some((section) => section.typologyCode) ? (
              <Disclosure title="Tipologías y opciones" hint="Requisitos agrupados por tipología" testId="legal-form-sections-disclosure" className="border-b">
                <RequirementSections data={data} selectable={selectableTypology} onChoose={(code) => choose(code)} />
              </Disclosure>
            ) : null}
          </>
        ) : null}
      </div>

      {data && !traditional && origin?.publication ? (
        <Disclosure title="Entregas y versiones" hint="Documentos recibidos, VR en uso y versiones" testId="legal-form-deliveries" className="overflow-hidden rounded-lg border bg-[hsl(var(--card))] shadow-sm">
          <div className="border-t p-[0.75rem]">
            <CanonicalDocumentaryWorkspace
              origin={origin}
              canManage={canReview}
              variant="legalForm"
              embedded
              reloadKey={tableRevision}
              onEvaluationSaved={evaluationSaved}
              legalForm={sheetLegalForm}
              instances={instances}
              openRequest={openRequest}
              evaluationContext={evaluationContext}
              receiveRequest={receiveRequest}
              receiveOnRequest={Boolean(canManage)}
              parties={data.parties || null}
              onReceived={(message) => refresh(message)}
            />
          </div>
        </Disclosure>
      ) : null}

      {currentVersion != null && data && !traditional ? (
        <ChecklistDialog
          open={checklistOpen}
          data={data}
          fun0Id={fun0Id}
          currentItem={currentItem || loadedItem}
          itemError={itemError}
          currentVersion={currentVersion}
          swaMsg={swaMsg}
          canEdit={Boolean(canManage && actions.checklist)}
          onClose={() => setChecklistOpen(false)}
          onSaved={(message) => { setChecklistOpen(false); refresh(message); }}
          onConflict={() => { setChecklistOpen(false); refresh(CONFLICT_MESSAGE); }}
        />
      ) : null}
      <LdfRequirementSheet
        target={detail}
        data={data}
        optionState={optionState}
        onChoose={choose}
        onOpenInstance={origin?.publication ? openInstance : undefined}
        onReceive={canManage && origin?.publication ? receiveFor : undefined}
        onClose={() => setDetail(null)}
      />
      <TypologySelectionDialog
        open={Boolean(choosingTypology)}
        typology={choosingTypology}
        fun0Id={fun0Id}
        onClose={() => setChoosing(null)}
        onSaved={selectionSaved}
        onConflict={() => { setChoosing(null); refresh(CONFLICT_MESSAGE); }}
      />
      <CommandDialog
        open={dialog === 'declare'}
        title="Declarar legal y debida forma"
        description="El expediente pasa al estado de legal y debida forma y se registra el término correspondiente."
        confirmLabel="Declarar"
        withDate
        onConfirm={declare}
        onClose={() => setDialog(null)}
      />
      <CommandDialog
        open={dialog === 'update'}
        title="Actualizar legal y debida forma"
        description="La declaración pasa a usar las entregas más recientes. El estado del expediente y el término no cambian."
        confirmLabel="Actualizar declaración"
        onConfirm={updateDeclaration}
        onClose={() => setDialog(null)}
      />
      <CommandDialog
        open={dialog === 'revoke'}
        title="Anular declaración"
        description="El expediente vuelve al estado anterior a la declaración."
        confirmLabel="Anular declaración"
        destructive
        onConfirm={revoke}
        onClose={() => setDialog(null)}
      />
    </section>
  );
}

export default LegalFormPanel;
