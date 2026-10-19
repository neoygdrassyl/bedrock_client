import { useEffect, useId, useRef, useState } from 'react';
import { Archive, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, ClipboardList, FileText, Files, History, Info, Monitor, Plus, RefreshCw, RotateCcw, ScanLine, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import DataService from '@/app/services/data.service';
import { documentaryError } from '@/app/services/documentary.service';
import { getCanonicalDocumentRow, getCanonicalDocuments, getCanonicalHistory } from '@/app/services/documentaryOperations.service';
import { canManageDocumentaryConfiguration } from '@/app/utils/documentaryConfigurationAccess';
import { DOCUMENTAL_SCOPE } from '../documentalScope';
import { DocumentalWorkspaceHeader } from './DocumentalWorkspaceHeader';
import { DocumentalSearchField } from '../molecules/DocumentalSearchField';
import { DocumentalQuickFilters } from '../molecules/DocumentalQuickFilters';
import { ColumnFilterField } from '../molecules/ColumnFilterField';
import { CanonicalDocumentsTable, canEvaluateTechnicalRow, INPUT_COLUMNS, ISSUED_COLUMNS, LEGAL_FORM_COLUMNS, TECHNICAL_COLUMNS } from './CanonicalDocumentsTable';
import { EvaluationSheet } from './EvaluationSheet';
import { CanonicalDocumentDetail, DocumentFiles } from './CanonicalDocumentDetail';
import { CanonicalRequirementBanner } from './CanonicalRequirementBanner';
import { ErrorMessage, EvidenceForm, ReceiptForm } from './CanonicalDocumentForms';
import { filterByReadiness, READINESS_FILTER, sortByReadiness } from '../../legalFormModel';
import { CLASS_SHORT_LABELS, canonicalMetrics, filterCanonicalRows, formatDocumentaryDate, groupRowsByList, listOptions, rowName, scanCounts, SCAN_FILTER } from '../../canonicalDocumentaryModel';
import { filterRowsByTechnicalTags } from '../../technicalEvaluationModel';

const CONFLICT_MESSAGE = 'Los datos cambiaron. Revise el estado actualizado y confirme nuevamente su decisión.';
const CLASS_OPTIONS = Object.entries(CLASS_SHORT_LABELS).map(([value, label]) => ({ value, label }));
const EMPTY_FILTERS = { search: '', list: '', documentClass: '', scan: SCAN_FILTER.ALL };
const EVENT_LABELS = { received: 'Documento recibido', evidence_updated: 'Evidencia actualizada', control_decided: 'Revisión de legal y debida forma', submit_created: 'VR creada', source_updated: 'Datos del expediente actualizados', configuration_changed: 'Catálogo documental cambiado' };

// What each use of the workspace loads and shows. `input` is Radicación; `legalForm` embeds the same table in
// Legal y debida forma (requirements only, row action "Evaluar"); `technical` embeds it in Evaluación técnica (requirements with
// Central technical controls, decided per tag layer); `issued` lists the expedidos of the expediente.
export const WORKSPACE_VARIANTS = {
  input: { scope: 'input', documentClass: '', columns: INPUT_COLUMNS, label: 'Documentos recibidos', detail: true, banner: true, history: true, metrics: true, scanFilter: true, classFilter: true, receive: true, refreshButton: true, rowEvaluate: false,
    emptyText: 'Aún no hay documentos recibidos', emptyHint: 'Los documentos que se reciban en este expediente aparecerán aquí.', countNoun: ['documento', 'documentos'] },
  legalForm: { scope: 'input', documentClass: 'requirement', columns: LEGAL_FORM_COLUMNS, label: 'Documentos de legal y debida forma', detail: false, banner: false, history: false, metrics: false, scanFilter: false, classFilter: false, receive: false, refreshButton: false, rowEvaluate: true, readinessFilter: true, loadAll: true,
    emptyText: 'Aún no hay requisitos recibidos', emptyHint: 'Los requisitos que se reciban en este expediente aparecerán aquí para evaluarlos.', countNoun: ['requisito', 'requisitos'] },
  technical: { scope: 'input', documentClass: 'requirement', columns: TECHNICAL_COLUMNS, label: 'Documentos de evaluación técnica', detail: false, banner: false, history: false, metrics: false, scanFilter: false, classFilter: false, receive: false, refreshButton: true, rowEvaluate: true, loadAll: true, layer: 'technical',
    emptyText: 'Aún no hay requisitos con controles técnicos', emptyHint: 'Los requisitos recibidos que tengan controles técnicos en Central aparecerán aquí para evaluarlos.', countNoun: ['requisito', 'requisitos'] },
  issued: { scope: 'issued', documentClass: '', columns: ISSUED_COLUMNS, label: 'Documentos expedidos', detail: true, banner: false, history: false, metrics: false, scanFilter: false, classFilter: false, receive: false, refreshButton: true, rowEvaluate: false,
    emptyText: 'Aún no hay documentos expedidos para este expediente.', emptyHint: 'Los documentos que se expidan en este expediente aparecerán aquí.', countNoun: ['documento', 'documentos'] },
};
// Pages loaded at most when a variant lists every row (the requirement list is bounded; this only stops a runaway cursor).
const MAX_PAGES = 40;
/** Every page of the view concatenated into one view (counts and capabilities come from the first page). */
async function loadAllPages(origin, signal, options) {
  const first = await getCanonicalDocuments(origin, 0, signal, options);
  const rows = [...first.rows];
  let next = first.pagination.nextAfterId;
  for (let page = 1; next && page < MAX_PAGES; page += 1) {
    const view = await getCanonicalDocuments(origin, next, signal, options);
    rows.push(...view.rows);
    next = view.pagination.nextAfterId && view.pagination.nextAfterId !== next ? view.pagination.nextAfterId : null;
  }
  return { ...first, rows, pagination: { ...first.pagination, nextAfterId: null } };
}
const FILTER_SELECT_CLASS = 'h-9 min-w-[10rem] flex-1 text-sm sm:w-auto sm:flex-none';

function AuditHistory({ origin }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true); setError('');
    try {
      const next = await getCanonicalHistory(origin.project.fun0Id, page?.nextAfterId || 0);
      setPage({ nextAfterId: next.nextAfterId, events: [...new Map([...(page?.events || []), ...next.events].map((event) => [event.id, event])).values()] });
    } catch (failure) { setError(documentaryError(failure)); }
    finally { setBusy(false); }
  }
  return (
    <section className="overflow-hidden rounded-lg border bg-[hsl(var(--card))] shadow-sm">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-2 bg-transparent px-[1rem] py-[0.75rem] text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none">
        <span className="flex items-center gap-2"><History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />Historial documental</span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform motion-reduce:transition-none', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open ? (
        <div className="flex flex-col gap-[0.75rem] border-t px-[1rem] py-[0.75rem]">
          {page?.events.length ? (
            <ol className="m-0 flex list-none flex-col gap-[0.75rem] p-0">
              {page.events.map((event) => (
                <li key={event.id} className="flex flex-col gap-1.5 border-l-2 pl-[0.75rem]">
                  <p className="mb-0 text-sm font-medium leading-5 text-foreground">{EVENT_LABELS[event.eventType] || event.eventType}<span className="ml-2 text-xs font-normal text-muted-foreground">{formatDocumentaryDate(event.occurredAt)}</span></p>
                  {event.reason ? <p className="mb-0 text-xs leading-5 text-muted-foreground">{event.reason}</p> : null}
                  {event.receivedDocumentRowId ? [event.beforeJson?.manifest, event.afterJson?.manifest].filter(Boolean).map((manifest, index) => (
                    <div key={`${event.id}:${index}`} className="flex flex-col gap-1">
                      <p className="mb-0 text-xs text-muted-foreground">Evidencia {manifest.evidenceRevision}</p>
                      <DocumentFiles origin={origin} receipt={{ id: event.receivedDocumentRowId, files: manifest.files }} onError={setError} />
                    </div>
                  )) : null}
                </li>
              ))}
            </ol>
          ) : null}
          {page && !page.events.length ? <p className="mb-0 text-sm text-muted-foreground">Aún no hay movimientos documentales.</p> : null}
          {!page || page.nextAfterId ? <div><Button type="button" variant="outline" size="sm" disabled={busy} onClick={load}>{busy ? 'Consultando…' : page ? 'Más eventos' : 'Cargar historial'}</Button></div> : null}
          <ErrorMessage error={error} />
        </div>
      ) : null}
    </section>
  );
}

/** Success or conflict notice after a command; conflicts ask the user to review the new state. */
function WorkspaceNotice({ message }) {
  const conflict = message === CONFLICT_MESSAGE;
  const Icon = conflict ? TriangleAlert : CircleCheck;
  return (
    <Alert role="status" variant={conflict ? 'warning' : 'success'} className="py-2.5">
      <Icon aria-hidden="true" />
      <AlertDescription className="min-w-0 flex-1">{message}</AlertDescription>
    </Alert>
  );
}

function InfoNotice({ children }) {
  return (
    <Alert role="status" variant="neutral" className="py-2.5">
      <Info aria-hidden="true" />
      <AlertDescription className="min-w-0 flex-1">{children}</AlertDescription>
    </Alert>
  );
}

/**
 * Catalogue-based Radicación workspace (container). Props are kept backward compatible:
 * `origin`, `canManage`, `fixedSubmitId` (VR screen) and the optional `onCountChange`.
 * `embedded` hides the module title when the workspace lives inside the Documentos new tabs.
 * `tagFilter` (technical variant) keeps only the rows with a technical control tagged with one of the given tags.
 */
export function CanonicalDocumentaryWorkspace({ origin, canManage = false, fixedSubmitId, onCountChange, onRequirementsRefreshed, embedded = false, variant = 'input', reloadKey = 0, onEvaluationSaved, legalForm, instances, openRequest, tagFilter }) {
  const ids = useId();
  const config = WORKSPACE_VARIANTS[variant] || WORKSPACE_VARIANTS.input;
  const layer = config.layer || 'checking';
  const technical = layer === 'technical';
  const [evaluating, setEvaluating] = useState(null); // { row, nonce }
  const [revision, setRevision] = useState(0);
  const [cursors, setCursors] = useState([0]);
  const [result, setResult] = useState(null);
  const [sheet, setSheet] = useState(null); // { kind: 'receive' | 'evidence', row, nonce }
  const [notice, setNotice] = useState('');
  const [fileError, setFileError] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [readiness, setReadiness] = useState(READINESS_FILTER.ALL);
  const [selectedKey, setSelectedKey] = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);
  const afterId = cursors[cursors.length - 1];
  const requestKey = `${variant}:${origin.project.fun0Id}:${origin.publication.configurationId}:${origin.publication.checksum}:${afterId}:${revision}:${reloadKey}`;
  useEffect(() => {
    const controller = new AbortController();
    const options = { scope: config.scope, documentClass: config.documentClass };
    (config.loadAll ? loadAllPages(origin, controller.signal, options) : getCanonicalDocuments(origin, afterId, controller.signal, options))
      .then((view) => { if (!controller.signal.aborted) setResult({ key: requestKey, view }); })
      .catch((failure) => { if (!controller.signal.aborted) setResult({ key: requestKey, error: documentaryError(failure) }); });
    return () => controller.abort();
  }, [origin, afterId, requestKey]); // eslint-disable-line react-hooks/exhaustive-deps -- config is constant per variant
  const loading = result?.key !== requestKey;
  // While reloading, the last view stays visible (busy) so open forms keep their input.
  const view = result?.view;
  const error = loading ? '' : result?.error;
  const total = view?.counts?.canonicalDocuments;
  useEffect(() => { if (Number.isFinite(total)) onCountChange?.(total); }, [total, onCountChange]);

  function reload(message = '') { setNotice(message); setFileError(''); setRevision((value) => value + 1); }
  function refresh(message = '') { setSheet(null); reload(message); }
  function conflict() { refresh(CONFLICT_MESSAGE); }
  function setFilter(key, value) { setFilters((current) => ({ ...current, [key]: value })); }
  function resetFilters() { setFilters(EMPTY_FILTERS); setReadiness(READINESS_FILTER.ALL); }
  function changePage(next) { setSheet(null); setSelectedKey(null); setCursors(next); }

  const submitMatches = !fixedSubmitId || Boolean(view?.submits.some((submit) => submit.id === Number(fixedSubmitId)));
  const canReceive = Boolean(config.receive && canManage && view && !view.readOnly && view.capabilities.createDocument && submitMatches);
  const canReview = Boolean(canManage && view && !view.readOnly && (technical ? view.capabilities.reviewTechnical : view.capabilities.review));
  // The technical layer only lists rows with technical controls (of the chosen tags when a filter is active).
  const rows = technical ? filterRowsByTechnicalTags(view?.rows, tagFilter) : (view?.rows || []);
  const filteredRows = filterCanonicalRows(rows, filters);
  // Legal y debida forma: unresolved rows first (rejected, unevaluated, approved without a chosen VR), then the ready ones.
  // The legalForm variant loads every row, so the order and the chips apply to the whole list.
  const readinessView = config.readinessFilter ? filterByReadiness(filteredRows, readiness, instances) : null;
  const visibleRows = readinessView ? sortByReadiness(readinessView.rows, instances) : filteredRows;
  const groups = groupRowsByList(visibleRows);
  const hasFilters = Object.entries(filters).some(([key, value]) => value !== EMPTY_FILTERS[key]) || readiness !== READINESS_FILTER.ALL;
  const selected = visibleRows.find((row) => row.rowKey === selectedKey) || visibleRows[0] || null;
  const metrics = canonicalMetrics(view, { firstPage: cursors.length === 1 });
  const pageHint = metrics.partial ? 'Contado en la página actual' : undefined;
  const scans = scanCounts(rows);
  const headerMetrics = [
    { label: 'Documentos', value: metrics.documents, icon: Files },
    { label: 'Recepciones', value: metrics.deliveries, icon: History, hint: 'Cada entrega de un documento en una VR' },
    { label: 'Físicos', value: metrics.physical, icon: Archive, hint: pageHint },
    { label: 'Digitales', value: metrics.digital, icon: Monitor, hint: pageHint },
    { label: 'Escaneados', value: metrics.scanned, icon: ScanLine, hint: pageHint },
    ...(metrics.missing === null ? [] : [{ label: 'Faltantes', value: metrics.missing, icon: ClipboardList }]),
  ];

  function selectRow(row) {
    setSelectedKey(row.rowKey);
    setExpandedKey((current) => (current === row.rowKey ? null : row.rowKey));
  }
  function openEvaluation(row) { setNotice(''); setEvaluating({ row, nonce: Date.now() }); }
  // After an evaluation the table reloads and the host (e.g. Legal y debida forma) refreshes what depends on it.
  function evaluationSaved(message) { setEvaluating(null); reload(message); onEvaluationSaved?.(); }
  function evaluationConflict() { setEvaluating(null); reload(CONFLICT_MESSAGE); onEvaluationSaved?.(); }
  // Changing the chosen VR does not close the sheet: the table reloads behind it.
  function selectionChanged() { reload(); }
  function openSheet(kind, row = null) { setNotice(''); setSheet({ kind, row, nonce: Date.now() }); }

  // A host asks to open the evaluation of a document (e.g. a pending item of Legal y debida forma).
  const handledRequest = useRef(null);
  useEffect(() => {
    if (!openRequest || !view || handledRequest.current === openRequest.nonce) return;
    handledRequest.current = openRequest.nonce;
    const documentKey = openRequest.documentKey;
    const open = (row) => { setNotice(''); setEvaluating({ row, nonce: Date.now() }); };
    const target = rows.find((row) => row.documentKey === documentKey);
    if (target) { open(target); return; }
    // Not on the loaded page: ask the server for the current row of that document.
    getCanonicalDocumentRow(origin, documentKey)
      .then((row) => { if (row) open(row); else setNotice('El documento ya no tiene una entrega vigente. Actualice la vista.'); })
      .catch((failure) => setNotice(documentaryError(failure)));
  }, [openRequest, view, rows, origin]);

  return (
    <section
      className={cn(DOCUMENTAL_SCOPE, 'flex min-w-0 flex-col gap-[0.75rem]')}
      {...(embedded ? { 'aria-label': config.label } : { 'aria-labelledby': `${ids}-title` })}
    >
      {embedded ? null : (
        <DocumentalWorkspaceHeader
          variant="title"
          titleId={`${ids}-title`}
          currentPublic={origin.project.idPublic || view?.project?.idPublic}
          subtitle="Documentos recibidos del expediente"
        />
      )}
      {notice ? <WorkspaceNotice message={notice} /> : null}
      <ErrorMessage error={error || fileError} />
      {view && config.banner ? (
        <>
          <CanonicalRequirementBanner
            view={view}
            fun0Id={origin.project.fun0Id}
            canRefresh={Boolean(canManage && !view.readOnly && canManageDocumentaryConfiguration(DataService.getUserData()))}
            onRefreshed={() => { reload('Evaluación de requisitos actualizada.'); onRequirementsRefreshed?.(); }}
            onConflict={conflict}
          />
          {view.readOnly ? <InfoNotice>Puede consultar los documentos. La recepción y la revisión aún no están habilitadas para este expediente.</InfoNotice> : null}
          {!submitMatches ? <InfoNotice>Este VR aún no tiene vínculo operativo con el expediente. No se pueden registrar documentos en él.</InfoNotice> : null}
        </>
      ) : null}

      {!view && !error ? <p role="status" className="sr-only">Consultando documentos del expediente…</p> : null}
      {view || !error ? (
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border bg-[hsl(var(--card))] shadow-sm" data-testid="canonical-documentary-workspace">
          <div className="shrink-0 border-b bg-[hsl(var(--card))]">
            <div className="flex flex-wrap items-center gap-2 px-[1rem] py-[0.75rem]">
              <DocumentalSearchField id={`${ids}-search`} value={filters.search} onChange={(value) => setFilter('search', value)} />
              <ColumnFilterField type="select" id={`${ids}-list-filter`} value={filters.list} options={listOptions(rows)} allLabel="Todas las listas" onChange={(value) => setFilter('list', value)} aria-label="Filtrar por lista" className={FILTER_SELECT_CLASS} />
              {config.classFilter ? <ColumnFilterField type="select" id={`${ids}-class-filter`} value={filters.documentClass} options={CLASS_OPTIONS} allLabel="Todas las clases" onChange={(value) => setFilter('documentClass', value)} aria-label="Filtrar por clase" className={FILTER_SELECT_CLASS} /> : null}
              {hasFilters ? <Button type="button" variant="ghost" size="sm" className="px-2.5 text-muted-foreground" onClick={resetFilters}><RotateCcw aria-hidden="true" />Limpiar</Button> : null}
              <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto">
                <span className="mr-1 text-xs text-muted-foreground" aria-live="polite">
                  <strong className="font-semibold tabular-nums text-foreground">{visibleRows.length}</strong> {config.countNoun[visibleRows.length === 1 ? 0 : 1]}
                </span>
                {config.refreshButton ? (
                  <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => refresh()}>
                    <RefreshCw className={cn(loading && view && 'animate-spin motion-reduce:animate-none')} aria-hidden="true" />Actualizar documentos
                  </Button>
                ) : null}
                {canReceive ? <Button type="button" size="sm" onClick={() => openSheet('receive')}><Plus aria-hidden="true" />Recibir documento</Button> : null}
              </div>
            </div>
            {config.metrics || config.scanFilter ? (
              <div className="flex flex-wrap items-center justify-between gap-x-[1rem] gap-y-1 pr-[1rem]">
                {config.scanFilter ? (
                  <DocumentalQuickFilters
                    label="Accesos rápidos de escaneo"
                    options={[{ value: SCAN_FILTER.ALL, label: 'Todos', count: rows.length }, { value: SCAN_FILTER.PENDING, label: 'Por escanear', count: scans.pending }, { value: SCAN_FILTER.SCANNED, label: 'Escaneados', count: scans.scanned }]}
                    value={filters.scan}
                    onChange={(value) => setFilter('scan', value)}
                  />
                ) : <span />}
                {config.metrics ? (
                  <div className="min-w-0 py-1.5 pl-[1rem] sm:pl-0">
                    <DocumentalWorkspaceHeader variant="chips" metrics={headerMetrics} loading={!view} />
                  </div>
                ) : null}
              </div>
            ) : null}
            {readinessView ? (
              <div className="flex flex-wrap items-center justify-between gap-x-[1rem]">
                <DocumentalQuickFilters
                  label="Estado de los requisitos"
                  options={[{ value: READINESS_FILTER.ALL, label: 'Todos', count: readinessView.counts.all }, { value: READINESS_FILTER.UNRESOLVED, label: 'Por resolver', count: readinessView.counts.unresolved }, { value: READINESS_FILTER.READY, label: 'Listos', count: readinessView.counts.ready }]}
                  value={readiness}
                  onChange={setReadiness}
                />
              </div>
            ) : null}
          </div>
          <div className={cn('grid min-h-0 min-w-0', config.detail && 'lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]')}>
            <div className="max-h-[65dvh] min-h-[16rem] min-w-0 overflow-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" tabIndex={0} role="region" aria-label="Tabla documental desplazable">
              <CanonicalDocumentsTable
                groups={groups}
                selectedKey={selected?.rowKey}
                expandedKey={expandedKey}
                onSelect={selectRow}
                loading={!view}
                hasFilters={hasFilters}
                onResetFilters={resetFilters}
                idPrefix={ids}
                columns={config.columns}
                ariaLabel={config.label}
                emptyText={config.emptyText}
                emptyHint={config.emptyHint}
                onEvaluate={config.rowEvaluate && canReview ? openEvaluation : undefined}
                rowEvaluable={technical ? canEvaluateTechnicalRow : undefined}
                instances={instances}
              />
            </div>
            {!config.detail ? null : view && selected ? (
              <div className="grid max-h-[65dvh] min-h-0 min-w-0">
                <CanonicalDocumentDetail
                  key={selected.rowKey}
                  origin={origin}
                  row={selected}
                  canReceive={canReceive}
                  canReview={canReview}
                  headingId={`${ids}-detail`}
                  onReceiveVersion={(row) => openSheet('receive', row)}
                  onUpdateEvidence={(row) => openSheet('evidence', row)}
                  onEvaluate={openEvaluation}
                />
              </div>
            ) : !view ? (
              <div className="flex flex-col gap-[0.75rem] border-t bg-muted/20 p-[1rem] lg:border-l lg:border-t-0" aria-hidden="true">
                <div className="flex items-center gap-[0.75rem]">
                  <Skeleton className="h-9 w-9 shrink-0" />
                  <Skeleton className="h-5 flex-1" />
                </div>
                <Skeleton className="h-36 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : (
              <aside className="flex flex-col items-center justify-center gap-[0.75rem] border-t bg-muted/20 p-8 text-center lg:border-l lg:border-t-0">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mb-0 max-w-[16rem] text-xs leading-5 text-muted-foreground">Seleccione un documento para consultar sus entregas y archivos.</p>
              </aside>
            )}
          </div>
          {view && (cursors.length > 1 || view.pagination.nextAfterId) ? (
            <nav className="flex min-h-12 shrink-0 items-center justify-end gap-1 border-t px-[1rem] py-2" aria-label="Paginación documental">
              <span className="mr-2 text-xs text-muted-foreground">Página {cursors.length}</span>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Página anterior" disabled={cursors.length === 1 || loading} onClick={() => changePage(cursors.slice(0, -1))}><ChevronLeft aria-hidden="true" /></Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Página siguiente" disabled={!view.pagination.nextAfterId || loading} onClick={() => changePage([...cursors, view.pagination.nextAfterId])}><ChevronRight aria-hidden="true" /></Button>
            </nav>
          ) : null}
        </div>
      ) : null}

      {view && config.history ? <AuditHistory key={`history:${revision}`} origin={origin} /> : null}

      <EvaluationSheet
        target={evaluating}
        origin={origin}
        canEvaluate={canReview}
        layer={layer}
        tagFilter={tagFilter}
        legalForm={legalForm}
        onSelectionChanged={selectionChanged}
        onClose={() => setEvaluating(null)}
        onSaved={evaluationSaved}
        onPartialSave={() => { reload(); onEvaluationSaved?.(); }}
        onConflict={evaluationConflict}
      />

      <Sheet open={Boolean(sheet && view && canReceive)} onOpenChange={(open) => { if (!open) setSheet(null); }}>
        <SheetContent side="right" className={cn(DOCUMENTAL_SCOPE, 'flex w-full flex-col gap-0 p-0 sm:max-w-xl')}>
          {sheet && view ? (
            <>
              <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-[1rem] pr-12 text-left">
                <SheetTitle className="mb-0 text-base leading-6">{sheet.kind === 'evidence' ? 'Actualizar evidencia' : sheet.row ? 'Recibir nueva versión' : 'Recibir documento'}</SheetTitle>
                <SheetDescription className="mb-0 text-xs leading-4">{sheet.row ? rowName(sheet.row) : 'Registre un documento entregado para este expediente.'}</SheetDescription>
              </SheetHeader>
              {sheet.kind === 'evidence' ? (
                <EvidenceForm key={sheet.nonce} origin={origin} row={sheet.row} onSaved={refresh} onConflict={conflict} onCancel={() => setSheet(null)} />
              ) : (
                <ReceiptForm
                  key={sheet.nonce}
                  origin={origin}
                  view={view}
                  fixedSubmitId={fixedSubmitId}
                  previous={sheet.row}
                  canCreateSubmit={canReceive && !fixedSubmitId}
                  onSubmitCreated={(label) => reload(`VR ${label} creada.`)}
                  onReceiveVersion={(row) => openSheet('receive', row)}
                  onSaved={(message) => { setCursors([0]); refresh(message); }}
                  onCancel={() => setSheet(null)}
                  onConflict={conflict}
                />
              )}
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  );
}

export default CanonicalDocumentaryWorkspace;
