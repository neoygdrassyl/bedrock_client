import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Eye, FileText, LoaderCircle, Play, SlidersHorizontal } from 'lucide-react';
import { DovelaBadge } from '@/components/dovela-ui/dovela-badge';
import './ActuationDocumentPreview.css';

const asList = (value) => (Array.isArray(value) ? value : []);

function reasonLabel(reason) {
  return ({ direct: 'Directo', typology: 'Tipología', label: 'Etiqueta', label_typology: 'Etiqueta / tipología', condition: 'Condición' }[reason] || reason);
}

function DocumentRow({ document, excluded = false }) {
  const pending = asList(document.condition_decisions).some((decision) => decision.status === 'pending_context');
  return (
    <li className={`actuation-document-preview__document${excluded ? ' is-excluded' : ''}`}>
      <div className="actuation-document-preview__document-copy">
        <strong>{document.name}</strong>
        {document.code && <code>{document.code}</code>}
      </div>
      <div className="actuation-document-preview__badges">
        {asList(document.reasons).map((reason) => <DovelaBadge key={reason} tone="neutral">{reasonLabel(reason)}</DovelaBadge>)}
        {pending && <DovelaBadge tone="warning">Dato pendiente</DovelaBadge>}
        {excluded && <DovelaBadge tone="neutral">Excluido</DovelaBadge>}
      </div>
    </li>
  );
}

export default function ActuationDocumentPreview({ actuation, fields = [], conditions = [], conditionIds = [], loading = false, error = '', onPreview }) {
  const [context, setContext] = useState({});
  const [result, setResult] = useState(null);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setContext({});
    setResult(null);
    setLocalError('');
  }, [actuation?.id]);

  const activeFields = useMemo(() => {
    const activeConditionIds = new Set(asList(conditionIds));
    const usedKeys = new Set(asList(conditions)
      .filter((condition) => activeConditionIds.has(condition.id) && condition.is_active !== false)
      .map((condition) => condition.source_key)
      .filter(Boolean));
    return asList(fields).filter((field) => field?.key && asList(field.values).length && usedKeys.has(field.key));
  }, [conditionIds, conditions, fields]);

  function updateField(fieldKey, event) {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setContext((current) => ({ ...current, [fieldKey]: values }));
  }

  async function preview() {
    if (!actuation || loading) return;
    setLocalError('');
    try {
      const response = await onPreview?.(context);
      if (response) setResult(response);
    } catch (previewError) {
      setLocalError(previewError?.message || 'No fue posible calcular la vista previa.');
    }
  }

  if (!actuation) return null;

  return (
    <section className="actuation-document-preview" aria-label={`Vista previa de documentos de ${actuation.name}`}>
      <header className="actuation-document-preview__header">
        <span className="actuation-document-preview__icon"><Eye size={16} aria-hidden="true" /></span>
        <div>
          <h3>Vista previa de documentos exigidos</h3>
          <p>Consulta qué aplicaría con los datos seleccionados. Esta simulación no modifica la configuración ni el expediente.</p>
        </div>
      </header>

      <div className="actuation-document-preview__fields">
        <div className="actuation-document-preview__fields-heading"><SlidersHorizontal size={14} aria-hidden="true" /><span>Datos para simular</span></div>
        <div className="actuation-document-preview__field-grid">
          {activeFields.map((field) => (
            <label key={field.key}>
              <span>{field.label}</span>
              <select multiple value={asList(context[field.key])} onChange={(event) => updateField(field.key, event)} disabled={loading} aria-label={field.label}>
                {asList(field.values).map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}
              </select>
            </label>
          ))}
        </div>
        {!activeFields.length && <p className="actuation-document-preview__empty">Esta actuación no tiene condiciones activas que requieran datos; el cálculo usará sus relaciones directas.</p>}
        <button type="button" className="actuation-document-preview__run" onClick={preview} disabled={loading}>
          {loading ? <LoaderCircle className="is-spinning" size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          {loading ? 'Calculando…' : 'Calcular documentos'}
        </button>
      </div>

      {(error || localError) && <p className="actuation-document-preview__error" role="alert"><AlertCircle size={15} aria-hidden="true" />{error || localError}</p>}
      {result && (
        <div className="actuation-document-preview__result" aria-live="polite">
          <div className="actuation-document-preview__summary"><FileText size={15} aria-hidden="true" /><strong>{asList(result.documents).length}</strong><span>documentos aplican con esta selección</span></div>
          {asList(result.documents).length ? <ul>{asList(result.documents).map((document) => <DocumentRow key={document.id} document={document} />)}</ul> : <p className="actuation-document-preview__empty">No se encontraron documentos aplicables con los datos seleccionados.</p>}
          {asList(result.excluded_documents).length > 0 && <details><summary>{result.excluded_documents.length} documentos excluidos por condición</summary><ul>{result.excluded_documents.map((document) => <DocumentRow key={document.id} document={document} excluded />)}</ul></details>}
        </div>
      )}
    </section>
  );
}
