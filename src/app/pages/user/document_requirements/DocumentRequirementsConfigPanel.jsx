import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, FlaskConical, Loader2, RefreshCcw, Save, UploadCloud } from 'lucide-react';
import {
  DovelaBadge,
  DovelaButton,
  DovelaCard,
  DovelaCardContent,
  DovelaField,
  DovelaInlineAlert,
  DovelaPageHeader,
  DovelaSectionPanel,
  DovelaTextarea,
} from '@/components/dovela-ui';
import { getDocumentRequirementErrorMessage, useDocumentRequirementConfig } from './useDocumentRequirementConfig.js';
import './DocumentRequirementsConfigPanel.css';

const EMPTY_CONFIG_TEXT = JSON.stringify({
  schemaVersion: 1,
  groups: [],
  documents: [],
  rules: [],
}, null, 2);

function stringifyConfig(config) {
  if (!config) return EMPTY_CONFIG_TEXT;
  return JSON.stringify(config, null, 2);
}

function getCollectionCount(config, key) {
  const value = config?.[key];
  return Array.isArray(value) ? value.length : 0;
}

function formatVersion(configPayload) {
  if (!configPayload?.configVersion) return 'No disponible';
  return `v${configPayload.configVersion}`;
}

function formatDate(value) {
  if (!value) return 'No disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function SummaryCard({ label, value, description }) {
  return (
    <DovelaCard className="min-h-[118px]">
      <DovelaCardContent className="flex h-full flex-col gap-1.5 pt-[var(--card-padding)]">
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
        <strong className="text-lg font-semibold leading-5 text-foreground">{value}</strong>
        <span className="text-[0.78rem] leading-5 text-muted-foreground">{description}</span>
      </DovelaCardContent>
    </DovelaCard>
  );
}

function InlineAlert({ type = 'info', children, onClose }) {
  const tone = {
    success: 'success',
    danger: 'danger',
    warning: 'warning',
    info: 'info',
  }[type] || 'info';

  return (
    <DovelaInlineAlert tone={tone} onDismiss={onClose}>
      {children}
    </DovelaInlineAlert>
  );
}

function StatusIndicator({ type, children }) {
  const tone = {
    draft: 'warning',
    published: 'success',
    missing: 'danger',
  }[type] || 'neutral';
  const Icon = type === 'published' ? CheckCircle2 : type === 'missing' ? AlertTriangle : FileText;

  return (
    <DovelaBadge tone={tone} icon={Icon}>
      {children}
    </DovelaBadge>
  );
}

export default function DocumentRequirementsConfigPanel() {
  const {
    published,
    draft,
    loading,
    saving,
    publishing,
    errorMessage,
    refetch,
    saveDraft,
    publishConfig,
  } = useDocumentRequirementConfig();
  const [draftText, setDraftText] = useState(EMPTY_CONFIG_TEXT);
  const [dirty, setDirty] = useState(false);
  const [editorError, setEditorError] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (draft?.config) {
      setDraftText(stringifyConfig(draft.config));
      setDirty(false);
      setEditorError('');
    }
  }, [draft]);

  const summary = useMemo(() => {
    const activeConfig = draft?.config || published?.config || null;
    const lastUpdated = draft?.updatedAt || published?.updatedAt || null;
    return {
      groups: getCollectionCount(activeConfig, 'groups'),
      rules: getCollectionCount(activeConfig, 'rules'),
      lastUpdated,
    };
  }, [draft, published]);

  const handleEditorChange = (event) => {
    setDraftText(event.target.value);
    setDirty(true);
    setEditorError('');
    setNotice(null);
  };

  const handleSaveDraft = async () => {
    let parsedConfig;
    try {
      parsedConfig = JSON.parse(draftText);
    } catch (err) {
      setEditorError(`JSON inválido: ${err?.message || 'revisa la estructura del borrador.'}`);
      return;
    }

    try {
      setNotice(null);
      await saveDraft(parsedConfig);
      setDirty(false);
      setNotice({ type: 'success', text: 'Borrador guardado. Puedes publicarlo cuando la revisión jurídica esté lista.' });
    } catch (err) {
      setNotice({ type: 'danger', text: getDocumentRequirementErrorMessage(err, 'Error al guardar el borrador documental.') });
    }
  };

  const handlePublish = async () => {
    try {
      setNotice(null);
      await publishConfig();
      setDirty(false);
      setNotice({ type: 'success', text: 'Configuración publicada. Versiones actualizadas desde el backend.' });
    } catch (err) {
      setNotice({ type: 'danger', text: getDocumentRequirementErrorMessage(err, 'Error al publicar la configuración documental.') });
    }
  };

  const handleSimulate = () => {
    window.location.assign('/simulador/documentos');
  };

  if (loading && !draft && !published) {
    return (
      <div className="document-requirements-panel" data-testid="document-requirements-panel">
        <DovelaPageHeader
          eyebrow="Configuración operativa"
          title="Requisitos documentales"
          description="Cargando configuración documental versionada..."
        />
        <DovelaInlineAlert icon={Loader2} iconClassName="document-requirements-panel__spinner">
          Consultando borrador y versión publicada.
        </DovelaInlineAlert>
      </div>
    );
  }

  return (
    <div className="document-requirements-panel" data-testid="document-requirements-panel">
      <DovelaPageHeader
        eyebrow="Configuración operativa"
        title="Requisitos documentales"
        description="Configura en fase uno la estructura JSON de grupos, documentos y reglas por actuación. La seguridad y validación final permanecen en backend."
        meta={(
          <>
            {draft && <StatusIndicator type="draft">Borrador</StatusIndicator>}
            {published && <StatusIndicator type="published">Publicada</StatusIndicator>}
            {!draft && !published && <StatusIndicator type="missing">Sin configuración cargada</StatusIndicator>}
            <DovelaBadge tone="outline">Edición estructurada JSON</DovelaBadge>
            <DovelaBadge tone="neutral">Fuente backend</DovelaBadge>
          </>
        )}
      />

      <DovelaInlineAlert tone="warning" title="Alcance de esta fase">
        Edita el JSON estructurado aprobado. El constructor visual de reglas y la simulación con preview corresponden a la siguiente tarea.
      </DovelaInlineAlert>

      {errorMessage && (
        <InlineAlert type="danger">
          {errorMessage}
        </InlineAlert>
      )}

      {notice && (
        <InlineAlert type={notice.type} onClose={() => setNotice(null)}>
          {notice.text}
        </InlineAlert>
      )}

      {editorError && (
        <InlineAlert type="danger" onClose={() => setEditorError('')}>
          {editorError}
        </InlineAlert>
      )}

      <section className="document-requirements-panel__summary" aria-label="Resumen de configuración documental">
        <SummaryCard label="Versión publicada" value={formatVersion(published)} description={published ? 'Publicada activa para resolución' : 'Aún no disponible'} />
        <SummaryCard label="Versión borrador" value={formatVersion(draft)} description={draft ? 'Borrador editable' : 'Aún no disponible'} />
        <SummaryCard label="Total grupos" value={summary.groups} description="Agrupaciones visibles de documentos" />
        <SummaryCard label="Total reglas" value={summary.rules} description="Reglas configuradas por actuación" />
        <SummaryCard label="Última actualización" value={formatDate(summary.lastUpdated)} description="Fecha reportada por backend" />
      </section>

      <DovelaCard tone="subtle">
        <DovelaCardContent className="document-requirements-panel__toolbar pt-[var(--card-padding)]">
          <DovelaButton
            type="button"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saving || publishing || !dirty || !draftText.trim()}
            aria-label="Guardar borrador de requisitos documentales"
            leadingIcon={Save}
            loading={saving}
            loadingLabel="Guardando..."
          >
            Guardar borrador
          </DovelaButton>
          <DovelaButton
            type="button"
            size="sm"
            tone="success"
            onClick={handlePublish}
            disabled={saving || publishing || loading || !draft?.config}
            aria-label="Publicar configuración documental"
            leadingIcon={UploadCloud}
            loading={publishing}
            loadingLabel="Publicando..."
          >
            Publicar configuración
          </DovelaButton>
          <DovelaButton
            type="button"
            size="sm"
            tone="ghost"
            onClick={handleSimulate}
            aria-label="Simular reglas documentales"
            leadingIcon={FlaskConical}
          >
            Simular reglas
          </DovelaButton>
          <span className="document-requirements-panel__toolbar-spacer" />
          <DovelaButton
            type="button"
            size="sm"
            tone="ghost"
            onClick={refetch}
            disabled={loading || saving || publishing}
            aria-label="Recargar configuración documental"
            leadingIcon={RefreshCcw}
          >
            Recargar
          </DovelaButton>
        </DovelaCardContent>
      </DovelaCard>

      <DovelaSectionPanel
        title="Borrador estructurado"
        description="Conserva `schemaVersion`, `groups`, `documents` y `rules`. Los errores de validación del backend se muestran aquí sin ocultar el panel."
        actions={<AlertTriangle size={18} aria-hidden="true" />}
        headerClassName="document-requirements-panel__editor-header"
        contentClassName="px-0 pb-0 pt-0"
      >
        <DovelaField
          label="Editor JSON del borrador documental"
          helperText="Esta edición es deliberadamente técnica para la fase inicial: pega JSON válido y guarda el borrador antes de publicar."
          className="document-requirements-panel__editor-field"
        >
          <DovelaTextarea
            id="document-requirements-editor"
            density="editor"
            className="document-requirements-panel__editor"
            value={draftText}
            onChange={handleEditorChange}
            spellCheck="false"
            rows={18}
          />
        </DovelaField>
      </DovelaSectionPanel>
    </div>
  );
}
