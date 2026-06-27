import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/icon';
import DocumentRequirementService from '@/app/services/document_requirement.service.js';
import SimulatorSelectionPanel from './SimulatorSelectionPanel';
import SimulatorResults from './SimulatorResults';
import {
  buildDocumentRequirementPreviewPayload,
  evaluateDocumentRequirements,
  getInitialSimulatorSelection,
  normalizeDocumentRequirementPreviewResponse,
} from './simulatorDocumentEngine';

const EMPTY_RESULT = {
  checklistItems: [],
  applicableCodes: [],
  groupedDocuments: {},
  selectionSummary: getInitialSimulatorSelection(),
  warnings: [],
};

const PREVIEW_STATUSES = new Set(['draft', 'published']);

function hasAnySelection(selection) {
  return Boolean(
    selection.tipo.length
    || selection.tramite
    || selection.m_urb
    || selection.m_sub
    || selection.m_lic.length
    || selection.area
    || selection.cultural
    || selection.usos.length
    || selection.vivienda,
  );
}

function getMissingSelectionMessages(selection) {
  const messages = [];

  if (!selection.tipo.length) messages.push('Selecciona al menos un tipo de actuación.');
  if (!selection.tramite) messages.push('Define el objeto del trámite o una actuación personalizada.');
  if (selection.tipo.includes('A') && !selection.m_urb) messages.push('Falta modalidad de urbanización para el tipo A.');
  if (selection.tipo.includes('C') && !selection.m_sub) messages.push('Falta modalidad de subdivisión para el tipo C.');
  if (selection.tipo.includes('D') && !selection.m_lic.length) messages.push('Falta modalidad de construcción para el tipo D.');
  if (selection.tipo.includes('D') && !selection.area) messages.push('Falta condición de área para evaluar construcción.');
  if (!selection.cultural) messages.push('Indica si el predio o inmueble es bien de interés cultural.');
  if (!selection.usos.length) messages.push('Los usos propuestos están sin seleccionar; algunas reglas pueden depender de este dato.');
  if (!selection.vivienda) messages.push('El tipo de vivienda está sin seleccionar; se mantiene visible porque puede incidir en requisitos.');

  return messages;
}

function getPreviewConfigStatus() {
  if (typeof window === 'undefined') return 'published';

  const params = new URLSearchParams(window.location.search);
  const requestedStatus = params.get('configStatus') || params.get('status');
  if (PREVIEW_STATUSES.has(requestedStatus)) return requestedStatus;

  const referrer = document.referrer || '';
  if (referrer.includes('/configuracion') && referrer.includes('requisitos-documentales')) {
    return 'draft';
  }

  return 'published';
}

function getPreviewErrorMessage(error) {
  return error?.response?.data?.message
    || error?.response?.data?.error
    || error?.message
    || 'No fue posible consultar el preview documental configurado.';
}

function getResultStatus(selection, result, missingMessages, previewError, isLoading) {
  if (previewError) return 'error';
  if (isLoading) return 'loading';
  if (!hasAnySelection(selection)) return 'initial';
  if (!result) return 'empty';
  if (missingMessages.length) return 'partial';
  if ((result?.applicableCodes || []).length === 0) return 'empty';
  return 'ready';
}

export default function DocumentosSimulatorPage() {
  const [selection, setSelection] = useState(() => getInitialSimulatorSelection());
  const [previewState, setPreviewState] = useState(() => ({
    result: null,
    error: '',
    loading: false,
    source: getPreviewConfigStatus(),
  }));

  const localEvaluation = useMemo(() => {
    try {
      return {
        result: evaluateDocumentRequirements(selection),
        error: '',
      };
    } catch (error) {
      return {
        result: { ...EMPTY_RESULT, selectionSummary: selection },
        error: error instanceof Error ? error.message : 'No fue posible evaluar la selección simulada.',
      };
    }
  }, [selection]);

  useEffect(() => {
    const configStatus = getPreviewConfigStatus();

    if (!hasAnySelection(selection)) {
      setPreviewState({
        result: null,
        error: '',
        loading: false,
        source: configStatus,
      });
      return undefined;
    }

    let active = true;
    const payload = buildDocumentRequirementPreviewPayload(selection, configStatus);

    setPreviewState((currentState) => ({
      ...currentState,
      error: '',
      loading: true,
      source: configStatus,
    }));

    DocumentRequirementService.previewRequirements(payload)
      .then((response) => {
        if (!active) return;
        const responseData = response?.data || response || {};
        const result = normalizeDocumentRequirementPreviewResponse(responseData, selection);
        setPreviewState({
          result,
          error: '',
          loading: false,
          source: result.source || configStatus,
        });
      })
      .catch((error) => {
        if (!active) return;
        setPreviewState({
          result: null,
          error: getPreviewErrorMessage(error),
          loading: false,
          source: 'error',
        });
      });

    return () => {
      active = false;
    };
  }, [selection]);

  const missingMessages = useMemo(() => getMissingSelectionMessages(selection), [selection]);
  const status = getResultStatus(selection, previewState.result, missingMessages, previewState.error, previewState.loading);
  const displayResult = status === 'initial' || previewState.error ? EMPTY_RESULT : previewState.result;

  return (
    <main className="w-full space-y-4 animate-fade-in-up" aria-labelledby="sim-doc-page-title">
      <header className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/70 bg-muted/30 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="SearchCheck" size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 id="sim-doc-page-title" className="mb-1 text-xl font-semibold tracking-tight text-foreground">
                Simulador de documentos y requisitos
              </h1>
              <p className="mb-0 text-sm leading-6 text-muted-foreground">
                Simula Documentos para licencias usando las reglas configuradas del backend sin persistir cambios en expedientes.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge rounded-pill text-bg-light border">Preview backend</span>
            <span className="badge rounded-pill text-bg-light border">Sin cambios al expediente</span>
            <span className="badge rounded-pill text-bg-light border">Diagnóstico local colapsado</span>
          </div>
        </div>
        <div className="px-4 py-3 text-xs leading-5 text-muted-foreground">
          Selecciona los mismos campos conceptuales de Actualizar: tipo, trámite, modalidades, área, BIC, usos y vivienda. Las ausencias de datos se muestran de forma explícita.
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)]">
        <SimulatorSelectionPanel
          selection={selection}
          onChange={setSelection}
          onReset={() => setSelection(getInitialSimulatorSelection())}
        />
        <SimulatorResults
          result={displayResult}
          status={status}
          missingMessages={missingMessages}
          evaluationError={previewState.error}
          previewSource={previewState.source}
          localDiagnosticResult={localEvaluation.result}
          localDiagnosticError={localEvaluation.error}
        />
      </div>
    </main>
  );
}
