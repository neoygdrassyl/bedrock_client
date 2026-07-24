import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DovelaBadge, DovelaCard, DovelaInlineAlert, DovelaPageHeader } from '@/components/dovela-ui';
import { useDocumentRequirementExplorer } from './useDocumentRequirementExplorer.js';
import RequirementExplorerTree from './RequirementExplorerTree.jsx';
import RequirementExplanationPanel from './RequirementExplanationPanel.jsx';
import RequirementScenarioSimulator from './RequirementScenarioSimulator.jsx';
import { buildRequirementExplorerState } from './requirementExplorerState.js';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileQuestion,
  FileWarning,
  FolderTree,
  Info,
  ListChecks,
  Lock,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import './DocumentRequirementsExplorerPage.css';

function countRequirements(requirements = [], key) {
  return requirements.filter((requirement) => requirement?.[key] === 'true').length;
}

function ExplorerSkeleton() {
  return (
    <div className="doc-explorer-page__skeleton" data-testid="explorer-skeleton">
      <Skeleton className="doc-explorer-page__skeleton-block" />
      <Skeleton className="doc-explorer-page__skeleton-block" />
      <Skeleton className="doc-explorer-page__skeleton-line" />
      <Skeleton className="doc-explorer-page__skeleton-line" />
    </div>
  );
}

function NoDocumentsState() {
  return (
    <div className="doc-explorer-page__placeholder" data-testid="explorer-empty-state">
      <FileQuestion size={48} strokeWidth={1} className="doc-explorer-page__placeholder-icon" />
      <h3>Sin documentos configurados</h3>
      <p>Esta actuación no tiene requisitos documentales configurados en la configuración vigente.</p>
    </div>
  );
}

function NoSelectionState() {
  return (
    <div className="doc-explorer-page__placeholder" data-testid="explorer-no-selection">
      <BookOpen size={48} strokeWidth={1} className="doc-explorer-page__placeholder-icon" />
      <h3>Explorador de requisitos</h3>
      <p>Selecciona una actuación para ver qué documentos se solicitan y por qué.</p>
    </div>
  );
}

function ForbiddenError() {
  return (
    <DovelaInlineAlert
      tone="danger"
      title="No tienes permisos"
      icon={Lock}
      data-testid="explorer-403"
    >
      No tienes permisos para consultar esta configuración documental.
    </DovelaInlineAlert>
  );
}

function LegacyWarning() {
  return (
    <DovelaInlineAlert
      tone="warning"
      title="Regla heredada detectada"
      icon={AlertTriangle}
      data-testid="explorer-legacy-warning"
    >
      Se detectó una regla heredada. Puede consultarse aquí, pero aún no editarse desde esta vista.
    </DovelaInlineAlert>
  );
}

function MissingFieldWarning() {
  return (
    <DovelaInlineAlert
      tone="warning"
      title="Campo faltante para evaluar"
      icon={FileWarning}
      data-testid="explorer-missing-field"
    >
      Esta regla existe, pero falta nombrar el dato de radicación que la activa.
    </DovelaInlineAlert>
  );
}

function EditorExpectedMessage() {
  return (
    <DovelaInlineAlert
      tone="info"
      icon={ShieldAlert}
      data-testid="explorer-readonly-banner"
    >
      Esta versión es solo de consulta. La edición de reglas se implementará en una fase posterior.
    </DovelaInlineAlert>
  );
}

function FlowStatusBadge({ tone, icon: Icon, label }) {
  const badgeTone = tone === 'complete' ? 'success' : tone === 'warning' ? 'warning' : 'outline';

  return (
    <DovelaBadge tone={badgeTone} icon={Icon} className="doc-explorer-page__step-status">
      {label}
    </DovelaBadge>
  );
}

function FlowPanelHeader({ icon: Icon, stepNumber, title, description }) {
  return (
    <header className="doc-explorer-page__panel-header">
      <div className="doc-explorer-page__panel-icon-wrap">
        <Icon size={18} className="doc-explorer-page__panel-icon" />
      </div>
      <div className="doc-explorer-page__panel-copy">
        <span className="doc-explorer-page__panel-step">Paso {stepNumber}</span>
        <h3 className="doc-explorer-page__panel-title">{title}</h3>
        <p className="doc-explorer-page__panel-description">{description}</p>
      </div>
    </header>
  );
}

function SummaryChip({ icon: Icon, label, value }) {
  return (
    <DovelaCard as="article" className="doc-explorer-page__summary-chip">
      <div className="doc-explorer-page__summary-icon-wrap">
        <Icon size={16} className="doc-explorer-page__summary-icon" />
      </div>
      <div className="doc-explorer-page__summary-copy">
        <span className="doc-explorer-page__summary-value">{value}</span>
        <span className="doc-explorer-page__summary-label">{label}</span>
      </div>
    </DovelaCard>
  );
}

function decorateDuplicateDocumentLabels(documents = []) {
  const labelCounts = documents.reduce((accumulator, document) => {
    const labelKey = typeof document?.label === 'string' ? document.label.trim().toLowerCase() : '';
    if (!labelKey) return accumulator;
    accumulator.set(labelKey, (accumulator.get(labelKey) || 0) + 1);
    return accumulator;
  }, new Map());

  return documents.map((document) => {
    const baseLabel = typeof document?.label === 'string' ? document.label.trim() : document?.label;
    const labelKey = typeof baseLabel === 'string' ? baseLabel.toLowerCase() : '';
    const hasDuplicateLabel = labelKey && labelCounts.get(labelKey) > 1;

    if (!hasDuplicateLabel || !document?.documentCode) {
      return {
        ...document,
        baseLabel,
      };
    }

    return {
      ...document,
      baseLabel,
      label: `${baseLabel} · Cód. ${document.documentCode}`,
    };
  });
}

function LastValidPreviewNotice() {
  return (
    <DovelaInlineAlert
      tone="warning"
      icon={AlertTriangle}
      data-testid="explorer-last-valid-preview"
    >
      <DovelaBadge tone="outline" className="mr-1">Último resultado válido</DovelaBadge>
      <span>Se mantiene la última simulación exitosa mientras se restablece la consulta.</span>
    </DovelaInlineAlert>
  );
}

function NotApplicableDocumentState() {
  return (
    <div className="doc-explorer-page__placeholder" data-testid="explorer-document-not-applicable">
      <FileQuestion size={32} />
      <p>Este documento no aplica con los datos actuales.</p>
    </div>
  );
}

function TechnicalDetails({ explorer }) {
  const [open, setOpen] = useState(false);

  if (!explorer) return null;

  return (
    <div className="doc-explorer-page__tech-details" data-testid="explorer-tech-details">
      <button
        type="button"
        className="doc-explorer-page__tech-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Ver detalles técnicos
      </button>
      {open && (
        <pre className="doc-explorer-page__tech-content" data-testid="explorer-tech-content">
          {JSON.stringify(
            {
              schemaVersion: explorer.schemaVersion,
              status: explorer.status,
              version: explorer.version,
              rules: explorer.rules?.length ?? 0,
              warnings: explorer.warnings?.length ?? 0,
            },
            null,
            2
          )}
        </pre>
      )}
    </div>
  );
}

export default function DocumentRequirementsExplorerPage() {
  const {
    explorer,
    loading,
    errorMessage,
    selection,
    setSelection,
    preview,
    previewLoading,
    simulate,
    selectionIsEmpty,
  } = useDocumentRequirementExplorer();

  const [selectedDocumentCode, setSelectedDocumentCode] = useState(null);
  const [previousPreview, setPreviousPreview] = useState(null);

  useEffect(() => {
    if (preview && Array.isArray(preview.requirements)) {
      setPreviousPreview(preview);
    }
  }, [preview]);

  const loadErrorMessage = explorer ? '' : errorMessage;
  const simulationErrorMessage = explorer ? errorMessage : '';
  const usingLastValidPreview = !preview && Boolean(simulationErrorMessage) && Boolean(previousPreview);
  const activePreview = preview || (usingLastValidPreview ? previousPreview : null);

  const explorerState = useMemo(
    () => buildRequirementExplorerState({
      explorer,
      preview: activePreview,
      selection,
      selectedDocumentCode,
    }),
    [activePreview, explorer, selection, selectedDocumentCode],
  );

  const displayDocuments = useMemo(
    () => decorateDuplicateDocumentLabels(explorerState.documents),
    [explorerState.documents],
  );

  const selectedDocumentView = useMemo(
    () => displayDocuments.find((document) => document.documentCode === selectedDocumentCode) || null,
    [displayDocuments, selectedDocumentCode],
  );

  const explorerView = useMemo(() => {
    if (!explorer) return null;
    return {
      ...explorer,
      documents: displayDocuments,
    };
  }, [displayDocuments, explorer]);

  const handleSelectDocument = useCallback((doc) => {
    setSelectedDocumentCode(doc?.documentCode || null);
  }, []);

  const is403 = loadErrorMessage?.toLowerCase().includes('permiso') || loadErrorMessage?.toLowerCase().includes('403');

  const hasLegacyWarnings = explorer?.warnings?.some(
    (w) => w.label?.includes('heredada') || w.label?.includes('legacy'),
  );

  const hasMissingFields = explorer?.warnings?.some(
    (w) => w.label?.includes('falta') || w.detail?.includes('campo'),
  );

  const selectedFieldsCount = Object.keys(selection || {}).length;
  const warningCount = Number(Boolean(hasLegacyWarnings)) + Number(Boolean(hasMissingFields));
  const previewRequirements = activePreview?.requirements || [];
  const hasPreviewRequirements = Array.isArray(activePreview?.requirements);
  const visibleDocumentsCount = previewRequirements.length || explorerState.documents.length;
  const selectedDocumentIsNotApplicable = selectedDocumentView?.visualState === 'not-applicable';

  const flowSteps = [
    {
      key: 'scenario',
      number: '01',
      label: 'Define el escenario',
      hint: selectionIsEmpty
        ? 'Elige los datos que activan la lectura documental.'
        : `${selectedFieldsCount} campo(s) activos en la simulación.`,
        icon: Sliders,
        tone: selectionIsEmpty ? 'pending' : 'complete',
        statusIcon: selectionIsEmpty ? FileQuestion : CheckCircle2,
        statusLabel: selectionIsEmpty ? 'Pendiente' : 'Listo',
    },
    {
      key: 'documents',
      number: '02',
      label: 'Revisa documentos',
      hint: `${visibleDocumentsCount} documento(s) visibles en la lectura actual.`,
      icon: FolderTree,
      tone: visibleDocumentsCount > 0 ? 'complete' : 'pending',
      statusIcon: visibleDocumentsCount > 0 ? CheckCircle2 : FileQuestion,
      statusLabel: visibleDocumentsCount > 0 ? 'Disponible' : 'Pendiente',
    },
    {
      key: 'explanation',
      number: '03',
      label: 'Entiende el requisito',
      hint: explorerState.selectedDocument
        ? 'Ya puedes leer la regla, el alcance y la condición activa.'
        : 'Selecciona un documento para ver su explicación guiada.',
      icon: Info,
      tone: selectedDocumentView ? 'complete' : 'pending',
      statusIcon: selectedDocumentView ? CheckCircle2 : FileQuestion,
      statusLabel: selectedDocumentView ? 'Activo' : 'Espera',
    },
    {
      key: 'warnings',
      number: '04',
      label: 'Valida advertencias',
      hint: warningCount > 0
        ? `${warningCount} advertencia(s) visibles para revisar antes de interpretar la regla.`
        : 'No se detectaron alertas críticas en esta configuración.',
      icon: AlertTriangle,
      tone: warningCount > 0 ? 'warning' : 'complete',
      statusIcon: warningCount > 0 ? AlertTriangle : CheckCircle2,
      statusLabel: warningCount > 0 ? 'Revisar' : 'Claro',
    },
  ];

  const summaryChips = [
      {
        key: 'total',
        icon: ListChecks,
        label: 'Total requisitos',
        value: hasPreviewRequirements ? `${previewRequirements.length}` : 'Pendiente',
      },
      {
        key: 'common',
        icon: CheckCircle2,
        label: 'Fijos',
        value: hasPreviewRequirements ? `${countRequirements(previewRequirements, 'common')}` : 'Pendiente',
      },
      {
        key: 'conditional',
        icon: FolderTree,
        label: 'Condicionales',
        value: hasPreviewRequirements ? `${countRequirements(previewRequirements, 'conditional')}` : 'Pendiente',
      },
      {
        key: 'non-determinable',
        icon: AlertTriangle,
        label: 'No determinables',
        value: hasPreviewRequirements ? `${countRequirements(previewRequirements, 'non-determinable')}` : 'Pendiente',
      },
    ];

  return (
    <div className="doc-explorer-page" data-testid="doc-explorer-page">
      <DovelaPageHeader
        eyebrow="Consulta guiada"
        title="Requisitos documentales por actuación"
        description="Consulta qué documentos se solicitan según la actuación y los datos de la radicación, y entiende por qué aplican."
        meta={<DovelaBadge tone="outline" icon={BookOpen}>Solo consulta</DovelaBadge>}
      />

      <EditorExpectedMessage />

      {loading && <ExplorerSkeleton />}

      {!loading && is403 && <ForbiddenError />}

      {!loading && loadErrorMessage && !is403 && (
        <DovelaInlineAlert
          tone="danger"
          title="Error al cargar"
          icon={FileWarning}
          data-testid="explorer-error"
        >
          {loadErrorMessage}
        </DovelaInlineAlert>
      )}

      {!loading && !loadErrorMessage && explorer && (
        <section className="doc-explorer-page__body">
          <div className="doc-explorer-page__flow">
            <ol className="doc-explorer-page__stepper" data-testid="explorer-stepper" aria-label="Flujo guiado del explorador documental">
              {flowSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <li key={step.key} className={`doc-explorer-page__step doc-explorer-page__step--${step.tone}`}>
                    <div className="doc-explorer-page__step-number">{step.number}</div>
                    <div className="doc-explorer-page__step-copy">
                      <div className="doc-explorer-page__step-title-row">
                        <StepIcon size={16} className="doc-explorer-page__step-icon" />
                        <span className="doc-explorer-page__step-label">{step.label}</span>
                      </div>
                      <p className="doc-explorer-page__step-hint">{step.hint}</p>
                    </div>
                    <FlowStatusBadge tone={step.tone} icon={step.statusIcon} label={step.statusLabel} />
                  </li>
                );
              })}
            </ol>

            <RequirementScenarioSimulator
              fields={explorer.fields}
              selection={selection}
              setSelection={setSelection}
              preview={preview}
              previewLoading={previewLoading}
              simulate={simulate}
              selectionIsEmpty={selectionIsEmpty}
              errorMessage={simulationErrorMessage}
              explorerLoading={loading}
            />

            <section className="doc-explorer-page__summary-bar" data-testid="explorer-summary-bar" aria-label="Resumen del escenario">
              {summaryChips.map((chip) => (
                <SummaryChip key={chip.key} icon={chip.icon} label={chip.label} value={chip.value} />
              ))}
            </section>

            {usingLastValidPreview && <LastValidPreviewNotice />}

            <div className="doc-explorer-page__explorer-layout">
              <section className="doc-explorer-page__tree-panel" data-testid="explorer-tree-panel">
                <FlowPanelHeader
                  icon={FolderTree}
                  stepNumber="02"
                  title="Revisa documentos"
                  description="Abre los grupos y compara qué soportes quedan activos con el escenario actual."
                />
                <RequirementExplorerTree
                  explorer={explorerView}
                  selectedDocument={selectedDocumentView}
                  onSelectDocument={handleSelectDocument}
                  stepLabel="Revisa documentos"
                />
              </section>

              <section className="doc-explorer-page__detail-panel" data-testid="explorer-explanation-panel">
                <FlowPanelHeader
                  icon={Info}
                  stepNumber="03"
                  title="Entiende el requisito"
                  description="Lee la lógica aplicable, el alcance visual y las reglas que justifican el documento."
                />
                {selectedDocumentView ? (
                  selectedDocumentIsNotApplicable ? (
                    <NotApplicableDocumentState />
                  ) : (
                  <RequirementExplanationPanel
                    selectedDocument={selectedDocumentView}
                    explorer={explorerView}
                    stepLabel="Entiende el requisito"
                  />
                  )
                ) : (
                  <div className="doc-explorer-page__placeholder" data-testid="explorer-no-document-selected">
                    <FileQuestion size={32} />
                    <p>Selecciona un documento del árbol para ver sus reglas y requisitos.</p>
                  </div>
                )}
              </section>
            </div>

            <section className="doc-explorer-page__warning-area" data-testid="explorer-warning-area" aria-live="polite">
              <FlowPanelHeader
                icon={AlertTriangle}
                stepNumber="04"
                title="Valida advertencias"
                description="Confirma si existen reglas heredadas o datos faltantes antes de confiar en la lectura automática."
              />

              <div className="doc-explorer-page__warning-list">
                {hasLegacyWarnings && <LegacyWarning />}
                {hasMissingFields && <MissingFieldWarning />}
                {!hasLegacyWarnings && !hasMissingFields && (
                  <DovelaInlineAlert tone="success" title="Sin advertencias críticas" icon={CheckCircle2}>
                    La configuración visible puede revisarse sin alertas pendientes en este escenario.
                  </DovelaInlineAlert>
                )}
              </div>
            </section>
          </div>
        </section>
      )}

      {!loading && !loadErrorMessage && !explorer && (
        <section className="doc-explorer-page__body">
          <NoDocumentsState />
        </section>
      )}

      {!loading && !loadErrorMessage && explorer && (
        <TechnicalDetails explorer={explorerView} />
      )}
    </div>
  );
}

export {
  NoSelectionState,
  NoDocumentsState,
  ForbiddenError,
  LegacyWarning,
  MissingFieldWarning,
  EditorExpectedMessage,
  TechnicalDetails,
};
