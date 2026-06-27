import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, FlaskConical, Loader2, RefreshCcw, Save, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <article className="document-requirements-panel__summary-card">
      <span className="document-requirements-panel__summary-label">{label}</span>
      <strong className="document-requirements-panel__summary-value">{value}</strong>
      <span className="document-requirements-panel__summary-description">{description}</span>
    </article>
  );
}

function InlineAlert({ type = 'info', children, onClose }) {
  return (
    <div className={`document-requirements-panel__alert document-requirements-panel__alert--${type}`} role={type === 'danger' ? 'alert' : 'status'}>
      <span>{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Cerrar mensaje">
          ×
        </button>
      )}
    </div>
  );
}

function StatusIndicator({ type, children }) {
  const Icon = type === 'published' ? CheckCircle2 : FileText;
  return (
    <span className={`document-requirements-panel__status document-requirements-panel__status--${type}`}>
      <Icon size={14} aria-hidden="true" />
      {children}
    </span>
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
        <div className="settings-panel__header">
          <h2>Requisitos documentales</h2>
          <p>Cargando configuración documental versionada…</p>
        </div>
        <InlineAlert>
          <Loader2 size={14} className="document-requirements-panel__spinner" aria-hidden="true" />
          Consultando borrador y versión publicada.
        </InlineAlert>
      </div>
    );
  }

  return (
    <div className="document-requirements-panel" data-testid="document-requirements-panel">
      <div className="settings-panel__header">
        <h2>Requisitos documentales</h2>
        <p>
          Configura en fase uno la estructura JSON de grupos, documentos y reglas por actuación. La seguridad y validación final permanecen en backend.
        </p>
      </div>

      <div className="document-requirements-panel__meta" aria-label="Estado de configuración documental">
        {draft && <StatusIndicator type="draft">Borrador</StatusIndicator>}
        {published && <StatusIndicator type="published">Publicada</StatusIndicator>}
        {!draft && !published && <StatusIndicator type="missing">Sin configuración cargada</StatusIndicator>}
        <Badge variant="outline">Edición estructurada JSON</Badge>
        <Badge variant="secondary">Fuente backend</Badge>
      </div>

      <div className="document-requirements-panel__notice">
        <strong>Alcance de esta fase:</strong> edita el JSON estructurado aprobado. El constructor visual de reglas y la simulación con preview corresponden a la siguiente tarea.
      </div>

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

      <div className="document-requirements-panel__toolbar">
        <Button
          type="button"
          size="sm"
          onClick={handleSaveDraft}
          disabled={saving || publishing || !dirty || !draftText.trim()}
          aria-label="Guardar borrador de requisitos documentales"
        >
          {saving ? <Loader2 size={14} className="document-requirements-panel__spinner" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
          {saving ? 'Guardando…' : 'Guardar borrador'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handlePublish}
          disabled={saving || publishing || loading || !draft?.config}
          aria-label="Publicar configuración documental"
        >
          {publishing ? <Loader2 size={14} className="document-requirements-panel__spinner" aria-hidden="true" /> : <UploadCloud size={14} aria-hidden="true" />}
          {publishing ? 'Publicando…' : 'Publicar configuración'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleSimulate}
          aria-label="Simular reglas documentales"
        >
          <FlaskConical size={14} aria-hidden="true" />
          Simular reglas
        </Button>
        <span className="document-requirements-panel__toolbar-spacer" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={refetch}
          disabled={loading || saving || publishing}
          aria-label="Recargar configuración documental"
        >
          <RefreshCcw size={14} aria-hidden="true" />
          Recargar
        </Button>
      </div>

      <section className="document-requirements-panel__editor-card" aria-labelledby="document-requirements-editor-title">
        <div className="document-requirements-panel__editor-header">
          <div>
            <h3 id="document-requirements-editor-title">Borrador estructurado</h3>
            <p>Conserva `schemaVersion`, `groups`, `documents` y `rules`. Los errores de validación del backend se muestran aquí sin ocultar el panel.</p>
          </div>
          <AlertTriangle size={18} aria-hidden="true" />
        </div>
        <label className="document-requirements-panel__editor-label" htmlFor="document-requirements-editor">
          Editor JSON del borrador documental
        </label>
        <textarea
          id="document-requirements-editor"
          className="document-requirements-panel__editor"
          value={draftText}
          onChange={handleEditorChange}
          spellCheck="false"
          rows={18}
          aria-describedby="document-requirements-editor-help"
        />
        <p id="document-requirements-editor-help" className="document-requirements-panel__editor-help">
          Esta edición es deliberadamente técnica para la fase inicial: pega JSON válido y guarda el borrador antes de publicar.
        </p>
      </section>
    </div>
  );
}
