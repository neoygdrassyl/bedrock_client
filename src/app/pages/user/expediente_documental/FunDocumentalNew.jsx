import { useCallback, useState } from 'react';
import { FileText, RotateCcw, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectDocumentConfigurationPanel from '../document_requirements/ProjectDocumentConfigurationPanel';
import UnifiedDocumentEntryModal from '../shared/UnifiedDocumentEntryModal';
import { useExpedienteDocumental } from './hooks/useExpedienteDocumental';
import { useCentralProjectLegalForm } from './hooks/useCentralProjectLegalForm';
import { DocumentalTable } from './ui/organisms/DocumentalTable';
import { LegalFormProjectContext } from './ui/organisms/LegalFormProjectContext';
import { LegalFormVrDialog } from './ui/organisms/LegalFormVrDialog';

function DocumentSummary({ summary }) {
  const items = [
    ['Unidades documentales', summary.totalGroups],
    ['Asientos', summary.totalEntries],
    ['Físicos', summary.physical],
    ['Digitales', summary.digital],
    ['Escaneados', summary.scanned],
  ];

  return (
    <div className="flex flex-wrap gap-2" aria-label="Resumen documental">
      {items.map(([label, value]) => (
        <Badge key={label} variant="outline" className="gap-1.5 rounded-full px-3 py-1">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-mono text-foreground">{value}</span>
        </Badge>
      ))}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-end gap-2" aria-label="Paginación documental">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </Button>
      <span className="text-xs text-muted-foreground">
        Página <strong className="text-foreground">{page}</strong> de {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </Button>
    </nav>
  );
}

export function FunDocumentalNew({
  currentId,
  currentPublic,
  canManage = false,
}) {
  const [activeTab, setActiveTab] = useState('documents');
  const [legalFormDialogOpen, setLegalFormDialogOpen] = useState(false);
  const [draftLegalFormVr, setDraftLegalFormVr] = useState('');

  const centralProject = useCentralProjectLegalForm({ currentPublic });
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

  const openLegalFormDialog = useCallback(() => {
    centralProject.clearSaveError();
    setDraftLegalFormVr(centralProject.defaultVr);
    setLegalFormDialogOpen(true);
  }, [centralProject]);

  const handleRowAction = useCallback((row, action) => {
    if (action === 'history') {
      documental.entrySheet.openWith(row, 'history');
      return;
    }

    if (action === 'legal-form' && canEditLegalForm) openLegalFormDialog();
  }, [canEditLegalForm, documental.entrySheet, openLegalFormDialog]);

  const handleConfigurationChange = useCallback(() => {
    centralProject.refresh();
    documental.refresh();
  }, [centralProject, documental]);

  const saveLegalFormVr = useCallback(async (vrIdPublic) => {
    const saved = await centralProject.saveSelection(vrIdPublic);
    if (!saved) return;
    setLegalFormDialogOpen(false);
    documental.refresh();
  }, [centralProject, documental]);

  return (
    <section className="space-y-4" aria-labelledby="documental-workspace-title">
      <Card className="shadow-none">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 p-4">
          <div>
            <CardTitle id="documental-workspace-title" className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Gestión documental
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentPublic || 'Expediente sin radicado'} · una fila por unidad documental
            </p>
          </div>
          <DocumentSummary summary={documental.summary} />
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid h-auto w-full grid-cols-2 sm:w-auto sm:min-w-[420px]">
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="legal-form">Legal y debida forma</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-3">
          {documental.error ? (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {documental.error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {documental.filteredCount} unidad(es) documental(es)
            </p>
            {documental.hasFilters ? (
              <Button type="button" variant="ghost" size="sm" onClick={documental.resetFilters}>
                <RotateCcw aria-hidden="true" />
                Limpiar filtros
              </Button>
            ) : null}
          </div>

          <DocumentalTable
            rows={documental.visibleRows}
            loading={documental.loading}
            canManage={canEditLegalForm}
            filters={documental.filters}
            vrOptions={documental.vrOptions}
            onFilterChange={documental.setFilter}
            onRowAction={handleRowAction}
          />

          <Pagination
            page={documental.page}
            totalPages={documental.totalPages}
            onPageChange={documental.setPage}
          />
        </TabsContent>

        <TabsContent value="legal-form" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Contexto documental del proyecto</h2>
              <p className="text-xs text-muted-foreground">
                Requisitos, grupos, evidencias y advertencias resueltos desde Dovela Central.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canEditLegalForm || !centralProject.options.length}
              onClick={openLegalFormDialog}
            >
              <Scale aria-hidden="true" />
              Editar VR LyF
            </Button>
          </div>

          {canManage ? (
            <ProjectDocumentConfigurationPanel
              currentPublic={currentPublic}
              compact
              onConfigurationChange={handleConfigurationChange}
            />
          ) : null}

          <LegalFormProjectContext
            projectContext={centralProject.projectContext}
            fallbackResult={documental.legal.result}
            evidenceRows={documental.rows}
            selectedVr={effectiveLegalFormVr}
            sourceLabel={centralProject.sourceLabel}
            loading={centralProject.loading}
            error={centralProject.error}
          />
        </TabsContent>
      </Tabs>

      <UnifiedDocumentEntryModal
        open={documental.entrySheet.open}
        group={documental.entrySheet.group}
        mode="history"
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

export default FunDocumentalNew;
