import { useEffect, useId, useState } from 'react';
import { Archive, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, FileText, Files, History, Monitor, Plus, RefreshCw, RotateCcw, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import DataService from '@/app/services/data.service';
import { documentaryError } from '@/app/services/documentary.service';
import { getCanonicalDocuments, getCanonicalHistory } from '@/app/services/documentaryOperations.service';
import { canManageDocumentaryConfiguration } from '@/app/utils/documentaryConfigurationAccess';
import { DocumentalWorkspaceHeader } from './DocumentalWorkspaceHeader';
import { DocumentalSearchField } from '../molecules/DocumentalSearchField';
import { DocumentalQuickFilters } from '../molecules/DocumentalQuickFilters';
import { ColumnFilterField } from '../molecules/ColumnFilterField';
import { CanonicalDocumentsTable } from './CanonicalDocumentsTable';
import { CanonicalDocumentDetail, DocumentFiles } from './CanonicalDocumentDetail';
import { CanonicalRequirementBanner } from './CanonicalRequirementBanner';
import { ErrorMessage, EvidenceForm, ReceiptForm } from './CanonicalDocumentForms';
import { CLASS_SHORT_LABELS, canonicalMetrics, filterCanonicalRows, formatDocumentaryDate, groupRowsByList, listOptions, rowName, scanCounts, SCAN_FILTER } from '../../canonicalDocumentaryModel';

const CONFLICT_MESSAGE = 'Los datos cambiaron. Revise el estado actualizado y confirme nuevamente su decisión.';
const CLASS_OPTIONS = Object.entries(CLASS_SHORT_LABELS).map(([value, label]) => ({ value, label }));
const EMPTY_FILTERS = { search: '', list: '', documentClass: '', scan: SCAN_FILTER.ALL };
const EVENT_LABELS = { received: 'Documento recibido', evidence_updated: 'Evidencia actualizada', control_decided: 'Revisión de legal y debida forma', submit_created: 'VR creada', source_updated: 'Datos del expediente actualizados', configuration_changed: 'Catálogo documental cambiado' };

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
    <section className="rounded-xl border border-border bg-[hsl(var(--card))]">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-2 rounded-xl bg-transparent px-[1rem] py-3 text-left text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="flex items-center gap-2"><History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />Historial documental</span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform motion-reduce:transition-none', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border px-[1rem] py-3">
          {page?.events.map((event) => (
            <article key={event.id} className="space-y-1.5 border-l-2 border-border pl-3 text-sm">
              <p className="m-0 font-medium">{EVENT_LABELS[event.eventType] || event.eventType}<span className="ml-2 text-xs font-normal text-muted-foreground">{formatDocumentaryDate(event.occurredAt)}</span></p>
              {event.reason ? <p className="m-0 text-muted-foreground">{event.reason}</p> : null}
              {event.receivedDocumentRowId ? [event.beforeJson?.manifest, event.afterJson?.manifest].filter(Boolean).map((manifest, index) => (
                <div key={`${event.id}:${index}`} className="space-y-1">
                  <p className="m-0 text-xs text-muted-foreground">Evidencia {manifest.evidenceRevision}</p>
                  <DocumentFiles origin={origin} receipt={{ id: event.receivedDocumentRowId, files: manifest.files }} onError={setError} />
                </div>
              )) : null}
            </article>
          ))}
          {page && !page.events.length ? <p className="m-0 text-sm text-muted-foreground">Aún no hay movimientos documentales.</p> : null}
          {!page || page.nextAfterId ? <Button type="button" variant="outline" size="sm" disabled={busy} onClick={load}>{busy ? 'Consultando…' : page ? 'Más eventos' : 'Cargar historial'}</Button> : null}
          <ErrorMessage error={error} />
        </div>
      ) : null}
    </section>
  );
}

/**
 * Catalogue-based Radicación workspace (container). Props are kept backward compatible:
 * `origin`, `canManage`, `fixedSubmitId` (VR screen) and the optional `onCountChange`.
 */
export function CanonicalDocumentaryWorkspace({ origin, canManage = false, fixedSubmitId, onCountChange }) {
  const ids = useId();
  const [revision, setRevision] = useState(0);
  const [cursors, setCursors] = useState([0]);
  const [result, setResult] = useState(null);
  const [sheet, setSheet] = useState(null); // { kind: 'receive' | 'evidence', row, nonce }
  const [notice, setNotice] = useState('');
  const [fileError, setFileError] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedKey, setSelectedKey] = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);
  const afterId = cursors[cursors.length - 1];
  const requestKey = `${origin.project.fun0Id}:${origin.publication.configurationId}:${origin.publication.checksum}:${afterId}:${revision}`;
  useEffect(() => {
    const controller = new AbortController();
    getCanonicalDocuments(origin, afterId, controller.signal)
      .then((view) => { if (!controller.signal.aborted) setResult({ key: requestKey, view }); })
      .catch((failure) => { if (!controller.signal.aborted) setResult({ key: requestKey, error: documentaryError(failure) }); });
    return () => controller.abort();
  }, [origin, afterId, requestKey]);
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
  function changePage(next) { setSheet(null); setSelectedKey(null); setCursors(next); }

  const submitMatches = !fixedSubmitId || Boolean(view?.submits.some((submit) => submit.id === Number(fixedSubmitId)));
  const canReceive = Boolean(canManage && view && !view.readOnly && view.capabilities.createDocument && submitMatches);
  const canReview = Boolean(canManage && view && !view.readOnly && view.capabilities.review);
  const rows = view?.rows || [];
  const visibleRows = filterCanonicalRows(rows, filters);
  const groups = groupRowsByList(visibleRows);
  const hasFilters = Object.entries(filters).some(([key, value]) => value !== EMPTY_FILTERS[key]);
  const selected = visibleRows.find((row) => row.rowKey === selectedKey) || visibleRows[0] || null;
  const metrics = canonicalMetrics(view, { firstPage: cursors.length === 1 });
  const pageHint = metrics.partial ? 'Contado en la página actual' : undefined;
  const scans = scanCounts(rows);
  const headerMetrics = [
    { label: 'Documentos', value: metrics.documents, icon: Files },
    { label: 'Entregas', value: metrics.deliveries, icon: History, hint: 'Versiones recibidas en total' },
    { label: 'Físicos', value: metrics.physical, icon: Archive, hint: pageHint },
    { label: 'Digitales', value: metrics.digital, icon: Monitor, hint: pageHint },
    { label: 'Escaneados', value: metrics.scanned, icon: ScanLine, hint: pageHint },
    ...(metrics.missing === null ? [] : [{ label: 'Faltantes', value: metrics.missing, icon: ClipboardList }]),
  ];

  function selectRow(row) {
    setSelectedKey(row.rowKey);
    setExpandedKey((current) => (current === row.rowKey ? null : row.rowKey));
  }
  function openSheet(kind, row = null) { setNotice(''); setSheet({ kind, row, nonce: Date.now() }); }

  return (
    <section className="space-y-3" aria-labelledby={`${ids}-title`}>
      <DocumentalWorkspaceHeader
        titleId={`${ids}-title`}
        currentPublic={origin.project.idPublic || view?.project?.idPublic}
        subtitle="Documentos recibidos del expediente"
        metrics={headerMetrics}
        loading={!view}
      />
      {notice ? <p role="status" className="m-0 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">{notice}</p> : null}
      <ErrorMessage error={error || fileError} />
      {view ? (
        <>
          <CanonicalRequirementBanner
            view={view}
            fun0Id={origin.project.fun0Id}
            canRefresh={Boolean(canManage && !view.readOnly && canManageDocumentaryConfiguration(DataService.getUserData()))}
            onRefreshed={() => reload('Evaluación de requisitos actualizada.')}
            onConflict={conflict}
          />
          {view.readOnly ? <p role="status" className="m-0 text-sm text-muted-foreground">Puede consultar los documentos. La recepción y la revisión aún no están habilitadas para este expediente.</p> : null}
          {!submitMatches ? <p role="status" className="m-0 text-sm text-muted-foreground">Este VR aún no tiene vínculo operativo con el expediente. No se pueden registrar documentos en él.</p> : null}
        </>
      ) : null}

      {!view && !error ? <p role="status" className="sr-only">Consultando documentos del expediente…</p> : null}
      {view || !error ? (
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-[hsl(var(--card))]" data-testid="canonical-documentary-workspace">
          <div className="shrink-0 border-b border-border bg-[hsl(var(--card))]">
            <div className="flex flex-wrap items-center gap-[0.75rem] px-[1rem] py-[0.75rem]">
              <DocumentalSearchField id={`${ids}-search`} value={filters.search} onChange={(value) => setFilter('search', value)} />
              <ColumnFilterField type="select" value={filters.list} options={listOptions(rows)} allLabel="Todas las listas" onChange={(value) => setFilter('list', value)} aria-label="Filtrar por lista" className="h-9 w-auto min-w-[9rem]" />
              <ColumnFilterField type="select" value={filters.documentClass} options={CLASS_OPTIONS} allLabel="Todas las clases" onChange={(value) => setFilter('documentClass', value)} aria-label="Filtrar por clase" className="h-9 w-auto min-w-[9rem]" />
              {hasFilters ? <Button type="button" variant="ghost" size="sm" className="px-2 text-xs text-muted-foreground" onClick={() => setFilters(EMPTY_FILTERS)}><RotateCcw aria-hidden="true" />Limpiar</Button> : null}
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground" aria-live="polite">
                  <strong className="font-mono font-medium tabular-nums text-foreground">{visibleRows.length}</strong> {visibleRows.length === 1 ? 'documento' : 'documentos'}
                </span>
                <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => refresh()}>
                  <RefreshCw className={cn(loading && view && 'animate-spin motion-reduce:animate-none')} aria-hidden="true" />Actualizar documentos
                </Button>
                {canReceive ? <Button type="button" size="sm" onClick={() => openSheet('receive')}><Plus aria-hidden="true" />Recibir documento</Button> : null}
              </div>
            </div>
            <DocumentalQuickFilters
              label="Accesos rápidos de escaneo"
              options={[{ value: SCAN_FILTER.ALL, label: 'Todos', count: rows.length }, { value: SCAN_FILTER.PENDING, label: 'Por escanear', count: scans.pending }, { value: SCAN_FILTER.SCANNED, label: 'Escaneados', count: scans.scanned }]}
              value={filters.scan}
              onChange={(value) => setFilter('scan', value)}
            />
          </div>
          <div className="grid min-h-0 min-w-0 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]">
            <div className="max-h-[65dvh] min-h-[16rem] min-w-0 overflow-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" tabIndex={0} role="region" aria-label="Tabla documental desplazable">
              <CanonicalDocumentsTable
                groups={groups}
                selectedKey={selected?.rowKey}
                expandedKey={expandedKey}
                onSelect={selectRow}
                loading={!view}
                hasFilters={hasFilters}
                onResetFilters={() => setFilters(EMPTY_FILTERS)}
                idPrefix={ids}
              />
            </div>
            {view && selected ? (
              <div className="grid max-h-[65dvh] min-h-0">
                <CanonicalDocumentDetail
                  key={selected.rowKey}
                  origin={origin}
                  row={selected}
                  canReceive={canReceive}
                  canReview={canReview && Boolean(selected.actions?.review)}
                  headingId={`${ids}-detail`}
                  onReceiveVersion={(row) => openSheet('receive', row)}
                  onUpdateEvidence={(row) => openSheet('evidence', row)}
                  onSaved={refresh}
                  onConflict={conflict}
                />
              </div>
            ) : (
              <aside className="flex flex-col items-center justify-center gap-[0.75rem] border-t border-border bg-muted/15 p-8 text-center lg:border-l lg:border-t-0">
                <FileText className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
                <p className="m-0 text-xs leading-5 text-muted-foreground">Seleccione un documento para consultar sus entregas y archivos.</p>
              </aside>
            )}
          </div>
          {view && (cursors.length > 1 || view.pagination.nextAfterId) ? (
            <nav className="flex min-h-12 shrink-0 items-center justify-end gap-1 border-t border-border px-[1rem] py-2" aria-label="Paginación documental">
              <span className="mr-2 text-xs text-muted-foreground">Página {cursors.length}</span>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Página anterior" disabled={cursors.length === 1 || loading} onClick={() => changePage(cursors.slice(0, -1))}><ChevronLeft aria-hidden="true" /></Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Página siguiente" disabled={!view.pagination.nextAfterId || loading} onClick={() => changePage([...cursors, view.pagination.nextAfterId])}><ChevronRight aria-hidden="true" /></Button>
            </nav>
          ) : null}
        </div>
      ) : null}

      {view ? <AuditHistory key={`history:${revision}`} origin={origin} /> : null}

      <Sheet open={Boolean(sheet && view && canReceive)} onOpenChange={(open) => { if (!open) setSheet(null); }}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {sheet && view ? (
            <>
              <SheetHeader className="mb-4 pr-6">
                <SheetTitle>{sheet.kind === 'evidence' ? 'Actualizar evidencia' : sheet.row ? 'Recibir nueva versión' : 'Recibir documento'}</SheetTitle>
                <SheetDescription>{sheet.row ? rowName(sheet.row) : 'Registre un documento entregado para este expediente.'}</SheetDescription>
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
