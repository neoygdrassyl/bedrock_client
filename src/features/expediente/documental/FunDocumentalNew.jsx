import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { CircleAlert, CircleCheck, ClipboardCheck, FileOutput, FilePlus2, Inbox, Scale, Settings2, TriangleAlert } from 'lucide-react';
import DataService from '@/shared/api/data.service';
import { canManageDocumentaryConfiguration } from '@/features/expediente/documental/documentaryConfigurationAccess';
import { cn } from '@/shared/lib/utils';
import { Tag } from './ui/atoms/Tag';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import UnifiedDocumentEntryModal from './shared/UnifiedDocumentEntryModal';
import { useExpedienteDocumental } from './hooks/useExpedienteDocumental';
import { DocumentalWorkspaceHeader } from './ui/organisms/DocumentalWorkspaceHeader';
import { DocumentalReviewTable } from './ui/organisms/DocumentalReviewTable';
import { useDocumentaryOrigin } from './hooks/useDocumentaryOrigin';
import { OriginCaption, OriginNotices } from './ui/organisms/DocumentaryOriginStatus';
import { CanonicalDocumentaryWorkspace } from './ui/organisms/CanonicalDocumentaryWorkspace';
import { DocumentaryGovernance } from './ui/organisms/DocumentaryGovernance';
import { LegacyMigrationPanel } from './ui/organisms/LegacyMigrationPanel';
import { IssuedDocumentsPanel } from './ui/organisms/IssuedDocumentsPanel';
import { useIssuedDocuments } from './hooks/useIssuedDocuments';
import { EXPEDIENTE_MODE, isCanonicalMode, useExpedienteMode } from './expedienteMode';
import { DOCUMENTAL_SCOPE } from './ui/documentalScope';
import { focusFunAnchor } from './funFormAnchor';

// The generators pull PDF tooling; load them only when the tab is opened.
const DocumentGeneratorsPanel = lazy(() => import('./ui/organisms/DocumentGeneratorsPanel'));
const LegalFormPanel = lazy(() => import('./ui/organisms/LegalFormPanel'));
const TechnicalEvaluationPanel = lazy(() => import('./ui/organisms/TechnicalEvaluationPanel'));

function LegacyDocumentalWorkspace({
  currentId,
  currentPublic,
  canManage = false,
  onCountChange,
}) {
  const documental = useExpedienteDocumental({
    funId: currentId,
    idRelated: currentPublic,
    canManage,
  });
  const legacyCount = documental.loading ? undefined : documental.summary?.totalGroups;
  useEffect(() => {
    if (Number.isFinite(legacyCount)) onCountChange?.(legacyCount);
  }, [legacyCount, onCountChange]);

  const handleRowAction = useCallback((row, action) => {
    if (action === 'history' || action === 'evaluation') {
      documental.entrySheet.openWith(row, action);
    }
  }, [documental.entrySheet]);

  return (
    <section className="flex min-w-0 flex-col gap-[0.75rem]" aria-label="Documentos recibidos">
      {documental.error ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertDescription className="min-w-0 flex-1">{documental.error}</AlertDescription>
        </Alert>
      ) : null}

      <DocumentalReviewTable
        rows={documental.visibleRows}
        loading={documental.loading}
        filters={documental.filters}
        vrOptions={documental.vrOptions}
        resultCount={documental.filteredCount}
        hasFilters={documental.hasFilters}
        page={documental.page}
        pageSize={documental.pageSize}
        totalPages={documental.totalPages}
        onFilterChange={documental.setFilter}
        onResetFilters={documental.resetFilters}
        onPageChange={documental.setPage}
        onRowAction={handleRowAction}
        summary={<DocumentalWorkspaceHeader variant="chips" currentPublic={currentPublic} summary={documental.summary} loading={documental.loading} />}
      />
      <UnifiedDocumentEntryModal
        open={documental.entrySheet.open}
        group={documental.entrySheet.group}
        mode={documental.entrySheet.mode}
        canManage={false}
        onClose={documental.entrySheet.close}
      />
    </section>
  );
}

const TAB_INPUT = 'radicacion';
const TAB_ISSUED = 'expedidos';
const TAB_LEGAL_FORM = 'legal';
const TAB_TECHNICAL = 'tecnica';
const TAB_GENERATORS = 'generar';
const TAB_CONFIGURATION = 'configuracion';
const CONFLICT_NOTICE = 'Los datos cambiaron. Revise el estado actualizado y confirme nuevamente su decisión.';
// Segmented control with the same rhythm as the expediente module navigation (h-8, text-xs, icon 14px).
// Underline tabs: the active section is marked by a 2px primary rule sitting on the bar's bottom border.
const TRIGGER_CLASS = "group relative h-10 flex-none gap-1.5 rounded-none border-0 bg-transparent px-2.5 py-0 text-[13px] font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:ring-offset-0 after:pointer-events-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent after:content-[''] after:transition-colors data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-[hsl(var(--primary))] [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 data-[state=active]:[&>svg]:text-[hsl(var(--primary))]";

function TabCount({ value, label }) {
  if (!Number.isFinite(value)) return null;
  return (
    <Tag pill className="tabular-nums group-data-[state=active]:border-transparent group-data-[state=active]:bg-[hsl(var(--primary)/0.12)] group-data-[state=active]:text-[hsl(var(--primary))]" aria-label={`${value} ${label}`}>
      {value}
    </Tag>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-[0.75rem]" aria-hidden="true">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  );
}

function ProjectDocumentaryWorkspace(props) {
  // "Completar en 5.x" of a party in Legal y debida forma: the FUN edit section ("Actualizar"), focused on that form.
  const openFunForm = props.NAVIGATION ? (form) => { props.NAVIGATION(null, 'edit'); focusFunAnchor(form?.anchor); } : undefined;
  const source = useDocumentaryOrigin({ fun0Id: props.currentId });
  const { origin } = source;
  const mode = useExpedienteMode(null, origin);
  const issued = useIssuedDocuments(props.currentPublic || origin?.project?.idPublic);
  const [activeTab, setActiveTab] = useState(TAB_INPUT);
  // Bumped after a configuration command so the Radicación tab and the selector reload.
  const [revision, setRevision] = useState(0);
  // Bumped when the requirement evaluation or the origin changed, to reload the panels that
  // fetch on their own (governance, Legal y debida forma, generators) without touching Radicación.
  const [syncRevision, setSyncRevision] = useState(0);
  const [notice, setNotice] = useState('');
  // Bumped when Legal y debida forma changed documentary data (typology selection, receipt, evaluation, refresh). The
  // Radicación table (kept mounted) applies it only when its tab is shown, so several saves cost one reload.
  const [dataRevision, setDataRevision] = useState(0);
  const [inputRevision, setInputRevision] = useState(0);
  const [inputCount, setInputCount] = useState(null);
  // Expedidos of the new model (view scope=issued); the CUB registry count is added to it.
  const [issuedCount, setIssuedCount] = useState(null);
  // Viewing and changing the Central configuration version is limited to abogado,
  // curador and programador; the tab (and its requests) must not exist for other roles.
  const canConfigure = canManageDocumentaryConfiguration(DataService.getUserData()) && Boolean(origin);
  // Last loaded origin: a refresh (e.g. after a declaration) must not unmount the open tab.
  const [lastOrigin, setLastOrigin] = useState(null);
  if (origin && origin !== lastOrigin) setLastOrigin(origin);
  const stableOrigin = origin || lastOrigin;
  const currentTab = activeTab === TAB_CONFIGURATION && !canConfigure ? TAB_INPUT : activeTab;
  if (currentTab === TAB_INPUT && inputRevision !== dataRevision) setInputRevision(dataRevision);
  const handleDataChanged = useCallback(() => setDataRevision((value) => value + 1), []);

  function selectTab(key) {
    setNotice('');
    setActiveTab(key);
  }
  function handleSaved(message, originChanged) {
    setNotice(message || '');
    setRevision((value) => value + 1);
    if (originChanged) { setSyncRevision((value) => value + 1); source.refresh(); }
  }
  // Refreshing the requirements from the Radicación banner: the workspace reloads itself;
  // the origin, governance, Legal y debida forma and generators must follow.
  function handleRequirementsRefreshed() {
    setSyncRevision((value) => value + 1);
    source.refresh();
  }
  function handleConflict() {
    setNotice(CONFLICT_NOTICE);
    setRevision((value) => value + 1);
    source.refresh();
  }
  // A declaration changes the expediente state (minState 5 generators) and the inventory verdicts.
  function handleDeclarationChanged() {
    setRevision((value) => value + 1);
    source.refresh();
  }
  const conflictNotice = notice === CONFLICT_NOTICE;

  return (
    <Tabs value={currentTab} onValueChange={selectTab} className={cn(DOCUMENTAL_SCOPE, 'flex min-w-0 flex-col gap-[0.75rem]')}>
      <div className="flex min-w-0 items-end gap-x-[1rem] border-b border-border">
        <TabsList aria-label="Secciones del módulo documental" className="h-auto min-w-0 flex-1 justify-start gap-1 overflow-x-auto rounded-none border-0 bg-transparent p-0 shadow-none [scrollbar-width:none]">
          <TabsTrigger value={TAB_INPUT} className={TRIGGER_CLASS}>
            <Inbox aria-hidden="true" />
            Radicación
            <TabCount value={inputCount} label="documentos recibidos" />
          </TabsTrigger>
          <TabsTrigger value={TAB_ISSUED} className={TRIGGER_CLASS}>
            <FileOutput aria-hidden="true" />
            Expedidos
            {issued.loading || issued.error ? null : <TabCount value={issued.rows.length + (isCanonicalMode(mode) && Number.isFinite(issuedCount) ? issuedCount : 0)} label="documentos expedidos" />}
          </TabsTrigger>
          <TabsTrigger value={TAB_LEGAL_FORM} className={TRIGGER_CLASS}>
            <Scale aria-hidden="true" />
            Legal y debida forma
          </TabsTrigger>
          <TabsTrigger value={TAB_TECHNICAL} className={TRIGGER_CLASS}>
            <ClipboardCheck aria-hidden="true" />
            Evaluación técnica
          </TabsTrigger>
          <TabsTrigger value={TAB_GENERATORS} className={TRIGGER_CLASS}>
            <FilePlus2 aria-hidden="true" />
            Generar documentos
          </TabsTrigger>
          {canConfigure ? (
            <TabsTrigger value={TAB_CONFIGURATION} className={TRIGGER_CLASS}>
              <Settings2 aria-hidden="true" />
              Configuración documental
            </TabsTrigger>
          ) : null}
        </TabsList>
        <OriginCaption origin={source.origin} error={source.error} className="hidden h-10 shrink-0 md:inline-flex" />
      </div>
      <OriginNotices origin={source.origin} error={source.error} refresh={source.refresh} />

      {/* Kept mounted so filters, pagination and open forms survive tab switches. */}
      <TabsContent value={TAB_INPUT} forceMount className="mt-0 flex min-w-0 flex-col gap-[0.75rem] data-[state=inactive]:hidden">
        {!origin && !source.error ? <WorkspaceSkeleton /> : null}
        {isCanonicalMode(mode) ? <CanonicalDocumentaryWorkspace key={`${origin.publication.configurationId}:${revision}`} origin={origin} canManage={props.canManage} onCountChange={setInputCount} onRequirementsRefreshed={handleRequirementsRefreshed} reloadKey={inputRevision} embedded /> : null}
        {mode === EXPEDIENTE_MODE.traditional ? <LegacyDocumentalWorkspace {...props} onCountChange={setInputCount} /> : null}
      </TabsContent>

      <TabsContent value={TAB_ISSUED} className="mt-0 min-w-0">
        {isCanonicalMode(mode) ? (
          <div className="flex min-w-0 flex-col gap-[0.75rem]">
            <CanonicalDocumentaryWorkspace key={`issued:${origin.publication.configurationId}:${revision}`} origin={origin} canManage={props.canManage} variant="issued" onCountChange={setIssuedCount} embedded />
            <IssuedDocumentsPanel rows={issued.rows} loading={issued.loading} error={issued.error} onRetry={issued.refresh} title="Consecutivos de salida (CUB)" note="Consecutivos de salida registrados para el expediente." hideWhenEmpty />
          </div>
        ) : (
          <IssuedDocumentsPanel rows={issued.rows} loading={issued.loading} error={issued.error} onRetry={issued.refresh} />
        )}
      </TabsContent>

      {/* Every expediente has the tab: canonical ones evaluate here, traditional ones only consult the legacy declaration. */}
      <TabsContent value={TAB_LEGAL_FORM} className="mt-0 min-w-0">
        {stableOrigin ? (
          <Suspense fallback={<WorkspaceSkeleton />}>
            <LegalFormPanel key={`legal:${syncRevision}`} origin={stableOrigin} canManage={Boolean(props.canManage)} onDeclarationChanged={handleDeclarationChanged} currentVersion={props.currentVersion} swaMsg={props.swaMsg} onOpenFunForm={openFunForm} onDataChanged={handleDataChanged} />
          </Suspense>
        ) : <WorkspaceSkeleton />}
      </TabsContent>

      {/* Technical controls only exist in the Central catalogue: traditional expedientes get a visible note instead of an empty table. */}
      <TabsContent value={TAB_TECHNICAL} className="mt-0 min-w-0">
        {!origin && !source.error ? <WorkspaceSkeleton /> : isCanonicalMode(mode) && origin ? (
          <Suspense fallback={<WorkspaceSkeleton />}>
            <TechnicalEvaluationPanel key={`technical:${origin.publication.configurationId}:${revision}`} origin={origin} canManage={Boolean(props.canManage)} reloadKey={syncRevision} />
          </Suspense>
        ) : (
          <Alert role="note" variant="neutral" className="py-2.5">
            <CircleAlert aria-hidden="true" />
            <AlertDescription className="min-w-0 flex-1">No disponible para expedientes tradicionales.</AlertDescription>
          </Alert>
        )}
      </TabsContent>

      {/* Mounted only while active: it loads the expediente (state) and its generators on demand. */}
      <TabsContent value={TAB_GENERATORS} className="mt-0 min-w-0">
        <Suspense fallback={<WorkspaceSkeleton />}>
          <DocumentGeneratorsPanel
            key={`generators:${revision}:${syncRevision}`}
            currentId={props.currentId}
            currentVersion={props.currentVersion}
            translation={props.translation}
            swaMsg={props.swaMsg}
            globals={props.globals}
          />
        </Suspense>
      </TabsContent>

      {canConfigure ? (
        <TabsContent value={TAB_CONFIGURATION} className="mt-0 flex min-w-0 flex-col gap-[0.75rem]">
          {notice ? (
            <Alert role="status" variant={conflictNotice ? 'warning' : 'success'} className="py-2.5">
              {conflictNotice ? <TriangleAlert aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
              <AlertDescription className="min-w-0 flex-1">{notice}</AlertDescription>
            </Alert>
          ) : null}
          <DocumentaryGovernance
            key={`governance:${revision}:${syncRevision}`}
            origin={origin}
            canManage={Boolean(props.canManage)}
            defaultOpen
            onSaved={handleSaved}
            onConflict={handleConflict}
            onFixFun={props.NAVIGATION ? () => props.NAVIGATION(null, 'edit') : undefined}
          />
          {mode === EXPEDIENTE_MODE.traditional ? <LegacyMigrationPanel key={`legacy-migration:${revision}`} fun0Id={origin.project.fun0Id} onMigrated={(message) => handleSaved(message, true)} /> : null}
        </TabsContent>
      ) : null}
    </Tabs>
  );
}

export function FunDocumentalNew(props) {
  return <ProjectDocumentaryWorkspace key={props.currentId} {...props} />;
}

export default FunDocumentalNew;
