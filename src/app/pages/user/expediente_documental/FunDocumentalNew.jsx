import { useCallback, useMemo, useState } from 'react';
import { Scale, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ProjectDocumentConfigurationPanel from '../document_requirements/ProjectDocumentConfigurationPanel';
import UnifiedDocumentEntryModal from '../shared/UnifiedDocumentEntryModal';
import { useExpedienteDocumental } from './hooks/useExpedienteDocumental';
import { useCentralProjectLegalForm } from './hooks/useCentralProjectLegalForm';
import { DocumentalWorkspaceHeader } from './ui/organisms/DocumentalWorkspaceHeader';
import { DocumentalReviewTable } from './ui/organisms/DocumentalReviewTable';
import { LegalFormControls } from './ui/organisms/LegalFormControls';
import { LegalFormVrDialog } from './ui/organisms/LegalFormVrDialog';
import { useDocumentaryOrigin } from './hooks/useDocumentaryOrigin';
import { DocumentaryOriginStatus, PublishedDocumentCatalogue } from './ui/organisms/DocumentaryOriginStatus';
import { CanonicalDocumentaryWorkspace } from './ui/organisms/CanonicalDocumentaryWorkspace';
import { DocumentaryGovernance } from './ui/organisms/DocumentaryGovernance';

function LegacyDocumentalWorkspace({
  currentId,
  currentPublic,
  canManage = false,
  centralLinked = false,
  onOriginChange,
}) {
  const [legalFormDialogOpen, setLegalFormDialogOpen] = useState(false);
  const [draftLegalFormVr, setDraftLegalFormVr] = useState('');

  const centralProject = useCentralProjectLegalForm({ currentPublic: centralLinked ? currentPublic : null });
  const centralDocumentMetadata = Array.isArray(centralProject.projectContext?.documentCatalog)
    ? centralProject.projectContext.documentCatalog
    : Array.isArray(centralProject.projectContext?.requirements?.documents)
      ? centralProject.projectContext.requirements.documents
      : [];
  const authoritativeVrOptions = Array.isArray(centralProject.projectContext?.legalForm?.options)
    ? centralProject.projectContext.legalForm.options
    : [];
  const documental = useExpedienteDocumental({
    funId: currentId,
    idRelated: currentPublic,
    canManage,
    documentMetadata: centralDocumentMetadata,
    authoritativeVrOptions,
  });
  const canEditLegalForm = canManage && Boolean(centralProject.projectContext);
  const effectiveLegalFormVr = centralProject.selectedVr
    || centralProject.defaultVr
    || documental.latestVr;
  const hasApplicableLegalControls = useMemo(() => (
    (centralProject.legalForm?.controls || []).some((document) => (document.controls || []).length > 0)
  ), [centralProject.legalForm]);

  const openLegalFormDialog = useCallback(() => {
    centralProject.clearSaveError();
    setDraftLegalFormVr(centralProject.defaultVr);
    setLegalFormDialogOpen(true);
  }, [centralProject]);

  const handleRowAction = useCallback((row, action) => {
    if (action === 'history' || action === 'evaluation') {
      documental.entrySheet.openWith(row, action);
      return;
    }

    if (action === 'legal-form' && canEditLegalForm) openLegalFormDialog();
  }, [canEditLegalForm, documental.entrySheet, openLegalFormDialog]);

  const handleConfigurationChange = useCallback(() => {
    onOriginChange?.();
    centralProject.refresh();
    documental.refresh();
  }, [centralProject, documental, onOriginChange]);

  const saveLegalFormVr = useCallback(async (vrIdPublic) => {
    const saved = await centralProject.saveSelection(vrIdPublic);
    if (!saved) return;
    setLegalFormDialogOpen(false);
    documental.refresh();
  }, [centralProject, documental]);

  return (
    <section className="space-y-3" aria-labelledby="documental-workspace-title">
      <DocumentalWorkspaceHeader
        currentPublic={currentPublic}
        summary={documental.summary}
        loading={documental.loading}
        configuration={canManage ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Configuración documental del expediente" title="Configuración documental del expediente">
                <Settings2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[420px] max-w-[90vw] max-h-[70vh] overflow-y-auto p-0">
              <ProjectDocumentConfigurationPanel currentPublic={currentPublic} compact onConfigurationChange={handleConfigurationChange} />
            </PopoverContent>
          </Popover>
        ) : null}
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

        {hasApplicableLegalControls ? (
          <section className="space-y-3 border-t border-border pt-4" aria-labelledby="legal-form-section-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="legal-form-section-title" className="text-sm font-semibold text-foreground">Legal y debida forma</h2>
                <p className="text-xs text-muted-foreground">Controles aplicables a los documentos de este expediente.</p>
              </div>
              {canEditLegalForm ? (
                <Button type="button" variant="outline" size="sm" disabled={!centralProject.options.length} onClick={openLegalFormDialog}>
                  <Scale aria-hidden="true" />
                  Seleccionar VR
                </Button>
              ) : null}
            </div>
            <LegalFormControls
              controls={centralProject.legalForm?.controls || []}
              selectedVr={effectiveLegalFormVr}
              canManage={canEditLegalForm}
              saving={centralProject.saving}
              onSave={centralProject.saveReview}
            />
          </section>
        ) : null}
      </div>
      <UnifiedDocumentEntryModal
        open={documental.entrySheet.open}
        group={documental.entrySheet.group}
        mode={documental.entrySheet.mode}
        canManage={false}
        onClose={documental.entrySheet.close}
      />

      <LegalFormVrDialog
        open={legalFormDialogOpen}
        options={centralProject.options}
        value={draftLegalFormVr}
        selectedVr={centralProject.selectedVr}
        sourceLabel={centralProject.sourceLabel}
        saving={centralProject.saving}
        error={centralProject.saveError}
        onOpenChange={(open) => {
          setLegalFormDialogOpen(open);
          if (!open) centralProject.clearSaveError();
        }}
        onValueChange={setDraftLegalFormVr}
        onSave={saveLegalFormVr}
      />
    </section>
  );
}

function ProjectDocumentaryWorkspace(props) {
  const source = useDocumentaryOrigin({ fun0Id: props.currentId });
  const { origin } = source;
  return (
    <div className="space-y-3">
      <DocumentaryOriginStatus origin={source.origin} error={source.error} loading={source.loading} refresh={source.refresh} />
      {origin?.mode === 'canonical' ? <CanonicalDocumentaryWorkspace key={origin.publication.configurationId} origin={origin} canManage={props.canManage} onOriginChange={source.refresh} /> : null}
      {origin && origin.mode !== 'canonical' && props.canManage ? <DocumentaryGovernance origin={origin} canManage onSaved={source.refresh} onConflict={source.refresh} /> : null}
      {origin?.mode === 'central-linked' ? <details><summary className="cursor-pointer py-2 text-sm">Consultar catálogo publicado en Central</summary><PublishedDocumentCatalogue origin={origin} /></details> : null}
      {origin?.mode === 'central-linked' || origin?.mode === 'traditional'
        ? <LegacyDocumentalWorkspace {...props} centralLinked={origin.mode === 'central-linked'} onOriginChange={source.refresh} /> : null}
    </div>
  );
}

export function FunDocumentalNew(props) {
  return <ProjectDocumentaryWorkspace key={props.currentId} {...props} />;
}

export default FunDocumentalNew;
