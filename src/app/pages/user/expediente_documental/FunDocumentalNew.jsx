import { useCallback, useState } from 'react';
import DataService from '@/app/services/data.service';
import { canManageDocumentaryConfiguration } from '@/app/utils/documentaryConfigurationAccess';
import { cn } from '@/lib/utils';
import { badgeVariants } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnifiedDocumentEntryModal from '../shared/UnifiedDocumentEntryModal';
import { useExpedienteDocumental } from './hooks/useExpedienteDocumental';
import { DocumentalWorkspaceHeader } from './ui/organisms/DocumentalWorkspaceHeader';
import { DocumentalReviewTable } from './ui/organisms/DocumentalReviewTable';
import { useDocumentaryOrigin } from './hooks/useDocumentaryOrigin';
import { DocumentaryOriginStatus } from './ui/organisms/DocumentaryOriginStatus';
import { CanonicalDocumentaryWorkspace } from './ui/organisms/CanonicalDocumentaryWorkspace';
import { DocumentaryGovernance } from './ui/organisms/DocumentaryGovernance';
import { IssuedDocumentsPanel } from './ui/organisms/IssuedDocumentsPanel';
import { useIssuedDocuments } from './hooks/useIssuedDocuments';

function LegacyDocumentalWorkspace({
  currentId,
  currentPublic,
  canManage = false,
}) {
  const documental = useExpedienteDocumental({
    funId: currentId,
    idRelated: currentPublic,
    canManage,
  });

  const handleRowAction = useCallback((row, action) => {
    if (action === 'history' || action === 'evaluation') {
      documental.entrySheet.openWith(row, action);
    }
  }, [documental.entrySheet]);

  return (
    <section className="space-y-3" aria-labelledby="documental-workspace-title">
      <DocumentalWorkspaceHeader
        currentPublic={currentPublic}
        summary={documental.summary}
        loading={documental.loading}
      />

      <div className="space-y-3">
        {documental.error ? (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {documental.error}
          </div>
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
        />

      </div>
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
const TAB_CONFIGURATION = 'configuracion';
const CONFLICT_NOTICE = 'Los datos cambiaron. Revise el estado actualizado y confirme nuevamente su decisión.';
const TRIGGER_CLASS = 'gap-1.5 px-3';

function TabCount({ value, label }) {
  if (!Number.isFinite(value)) return null;
  return (
    <span className={cn(badgeVariants({ variant: 'secondary' }), 'px-1.5 py-0 text-[11px] font-medium tabular-nums')} aria-label={`${value} ${label}`}>
      {value}
    </span>
  );
}

function ProjectDocumentaryWorkspace(props) {
  const source = useDocumentaryOrigin({ fun0Id: props.currentId });
  const { origin } = source;
  const issued = useIssuedDocuments(props.currentPublic || origin?.project?.idPublic);
  const [activeTab, setActiveTab] = useState(TAB_INPUT);
  // Bumped after a configuration command so the Radicación tab and the selector reload.
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState('');
  // Viewing and changing the Central configuration version is limited to abogado,
  // curador and programador; the tab (and its requests) must not exist for other roles.
  const canConfigure = canManageDocumentaryConfiguration(DataService.getUserData()) && Boolean(origin);
  const currentTab = activeTab === TAB_CONFIGURATION && !canConfigure ? TAB_INPUT : activeTab;

  function selectTab(key) {
    setNotice('');
    setActiveTab(key);
  }
  function handleSaved(message, originChanged) {
    setNotice(message || '');
    setRevision((value) => value + 1);
    if (originChanged) source.refresh();
  }
  function handleConflict() {
    setNotice(CONFLICT_NOTICE);
    setRevision((value) => value + 1);
    source.refresh();
  }

  return (
    <Tabs value={currentTab} onValueChange={selectTab} className="space-y-3">
      <DocumentaryOriginStatus origin={source.origin} error={source.error} loading={source.loading} refresh={source.refresh} />
      <TabsList aria-label="Secciones del módulo documental" className="h-auto max-w-full justify-start overflow-x-auto">
        <TabsTrigger value={TAB_INPUT} className={TRIGGER_CLASS}>Radicación</TabsTrigger>
        <TabsTrigger value={TAB_ISSUED} className={TRIGGER_CLASS}>
          Expedidos
          {issued.loading || issued.error ? null : <TabCount value={issued.rows.length} label="documentos expedidos" />}
        </TabsTrigger>
        {canConfigure ? <TabsTrigger value={TAB_CONFIGURATION} className={TRIGGER_CLASS}>Configuración documental</TabsTrigger> : null}
      </TabsList>

      {/* Kept mounted so filters, pagination and open forms survive tab switches. */}
      <TabsContent value={TAB_INPUT} forceMount className="mt-0 space-y-3 data-[state=inactive]:hidden">
        {origin?.mode === 'canonical' ? <CanonicalDocumentaryWorkspace key={`${origin.publication.configurationId}:${revision}`} origin={origin} canManage={props.canManage} /> : null}
        {origin?.mode === 'traditional' ? <LegacyDocumentalWorkspace {...props} /> : null}
      </TabsContent>

      <TabsContent value={TAB_ISSUED} className="mt-0">
        <IssuedDocumentsPanel rows={issued.rows} loading={issued.loading} error={issued.error} onRetry={issued.refresh} />
      </TabsContent>

      {canConfigure ? (
        <TabsContent value={TAB_CONFIGURATION} className="mt-0 space-y-3">
          {notice ? <p role="status" className="text-sm">{notice}</p> : null}
          <DocumentaryGovernance
            key={`governance:${revision}`}
            origin={origin}
            canManage={Boolean(props.canManage)}
            defaultOpen
            onSaved={handleSaved}
            onConflict={handleConflict}
          />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}

export function FunDocumentalNew(props) {
  return <ProjectDocumentaryWorkspace key={props.currentId} {...props} />;
}

export default FunDocumentalNew;
