import { useCallback, useId, useState } from 'react';
import DataService from '@/app/services/data.service';
import { canManageDocumentaryConfiguration } from '@/app/utils/documentaryConfigurationAccess';
import { cn } from '@/lib/utils';
import UnifiedDocumentEntryModal from '../shared/UnifiedDocumentEntryModal';
import { useExpedienteDocumental } from './hooks/useExpedienteDocumental';
import { DocumentalWorkspaceHeader } from './ui/organisms/DocumentalWorkspaceHeader';
import { DocumentalReviewTable } from './ui/organisms/DocumentalReviewTable';
import { useDocumentaryOrigin } from './hooks/useDocumentaryOrigin';
import { DocumentaryOriginStatus } from './ui/organisms/DocumentaryOriginStatus';
import { CanonicalDocumentaryWorkspace } from './ui/organisms/CanonicalDocumentaryWorkspace';
import { DocumentaryGovernance } from './ui/organisms/DocumentaryGovernance';

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

const TAB_DOCUMENTS = 'documents';
const TAB_CONFIGURATION = 'configuration';
const TABS = [
  { key: TAB_DOCUMENTS, label: 'Documentos' },
  { key: TAB_CONFIGURATION, label: 'Configuración documental' },
];
const CONFLICT_NOTICE = 'Los datos cambiaron. Revise el estado actualizado y confirme nuevamente su decisión.';

function DocumentaryTabs({ idPrefix, active, onChange }) {
  const tabId = (key) => `${idPrefix}-tab-${key}`;
  function handleKeyDown(event) {
    const index = TABS.findIndex((tab) => tab.key === active);
    let next = null;
    if (event.key === 'ArrowRight') next = TABS[(index + 1) % TABS.length];
    else if (event.key === 'ArrowLeft') next = TABS[(index - 1 + TABS.length) % TABS.length];
    else if (event.key === 'Home') next = TABS[0];
    else if (event.key === 'End') next = TABS[TABS.length - 1];
    if (!next) return;
    event.preventDefault();
    onChange(next.key);
    document.getElementById(tabId(next.key))?.focus();
  }
  return (
    <div role="tablist" aria-label="Secciones del módulo documental" className="flex overflow-x-auto border-b border-border" onKeyDown={handleKeyDown}>
      {TABS.map((tab) => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={tabId(tab.key)}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.key}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={cn(
              'whitespace-nowrap border-0 border-b-2 bg-transparent px-4 py-2.5 text-sm font-medium transition-colors',
              selected
                ? 'border-b-primary text-primary'
                : 'border-b-transparent text-muted-foreground hover:border-b-border hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function ProjectDocumentaryWorkspace(props) {
  const source = useDocumentaryOrigin({ fun0Id: props.currentId });
  const { origin } = source;
  const idPrefix = useId();
  const [activeTab, setActiveTab] = useState(TAB_DOCUMENTS);
  // Bumped after a configuration command so the Documentos tab and the selector reload.
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState('');
  // Viewing and changing the Central configuration version is limited to abogado,
  // curador and programador; the tab (and its requests) must not exist for other roles.
  const canConfigure = canManageDocumentaryConfiguration(DataService.getUserData());
  const showTabs = canConfigure && Boolean(origin);
  const configurationActive = showTabs && activeTab === TAB_CONFIGURATION;

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
    <div className="space-y-3">
      <DocumentaryOriginStatus origin={source.origin} error={source.error} loading={source.loading} refresh={source.refresh} />
      {showTabs ? <DocumentaryTabs idPrefix={idPrefix} active={activeTab} onChange={selectTab} /> : null}
      {origin ? (
        <div
          id={`${idPrefix}-panel-${TAB_DOCUMENTS}`}
          role={showTabs ? 'tabpanel' : undefined}
          aria-labelledby={showTabs ? `${idPrefix}-tab-${TAB_DOCUMENTS}` : undefined}
          hidden={configurationActive}
          className="space-y-3"
        >
          {origin.mode === 'canonical' ? <CanonicalDocumentaryWorkspace key={`${origin.publication.configurationId}:${revision}`} origin={origin} canManage={props.canManage} /> : null}
          {origin.mode === 'traditional' ? <LegacyDocumentalWorkspace {...props} /> : null}
        </div>
      ) : null}
      {configurationActive ? (
        <div
          id={`${idPrefix}-panel-${TAB_CONFIGURATION}`}
          role="tabpanel"
          aria-labelledby={`${idPrefix}-tab-${TAB_CONFIGURATION}`}
          className="space-y-3"
        >
          {notice ? <p role="status" className="text-sm">{notice}</p> : null}
          <DocumentaryGovernance
            key={`governance:${revision}`}
            origin={origin}
            canManage={Boolean(props.canManage)}
            defaultOpen
            onSaved={handleSaved}
            onConflict={handleConflict}
          />
        </div>
      ) : null}
    </div>
  );
}

export function FunDocumentalNew(props) {
  return <ProjectDocumentaryWorkspace key={props.currentId} {...props} />;
}

export default FunDocumentalNew;
