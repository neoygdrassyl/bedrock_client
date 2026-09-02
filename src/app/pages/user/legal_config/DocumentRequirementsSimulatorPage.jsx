import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, LoaderCircle, PlaySquare, RefreshCw } from 'lucide-react';
import LegalConfigService from '@/app/services/legal_config.service';
import ActuationDocumentPreview from './ActuationDocumentPreview.jsx';
import './DocumentRequirementsSimulatorPage.css';

const emptyWorkspace = { actuations: [], conditions: [], conditionFields: [], actuationConditions: [] };

function errorMessage(error) {
  return error?.response?.data?.message || error?.message || 'No fue posible cargar el emulador.';
}

export default function DocumentRequirementsSimulatorPage() {
  const [workspace, setWorkspace] = useState(emptyWorkspace);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await LegalConfigService.workspace();
      const data = { ...emptyWorkspace, ...(response.data || {}) };
      setWorkspace(data);
      setSelectedId((current) => data.actuations.some((item) => item.id === current && item.is_active !== false)
        ? current
        : (data.actuations.find((item) => item.is_active !== false)?.id || ''));
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedActuation = useMemo(() => workspace.actuations.find((item) => item.id === selectedId) || null, [selectedId, workspace.actuations]);
  const conditionIds = useMemo(() => workspace.actuationConditions.filter((item) => item.actuation_id === selectedId).map((item) => item.condition_id), [selectedId, workspace.actuationConditions]);

  async function preview(context) {
    if (!selectedId || previewLoading) return null;
    setPreviewLoading(true);
    setError('');
    try {
      const response = await LegalConfigService.previewDocuments(selectedId, context);
      return response?.data || null;
    } catch (previewError) {
      setError(errorMessage(previewError));
      return null;
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <main className="document-requirements-simulator" aria-labelledby="document-requirements-simulator-title">
      <header className="document-requirements-simulator__header">
        <div>
          <p>Consulta de configuración</p>
          <h2 id="document-requirements-simulator-title"><PlaySquare size={19} aria-hidden="true" /> Emulador de requisitos</h2>
          <span>Selecciona una actuación y valores de condición para ver la lista de documentos que la configuración actual solicitaría.</span>
        </div>
        <button type="button" onClick={load} disabled={loading || previewLoading} aria-label="Actualizar datos del emulador" title="Actualizar datos"><RefreshCw className={loading ? 'is-spinning' : ''} size={16} aria-hidden="true" /></button>
      </header>
      {error && <p className="document-requirements-simulator__error" role="alert"><AlertCircle size={15} aria-hidden="true" />{error}</p>}
      {loading ? <p className="document-requirements-simulator__loading" role="status"><LoaderCircle className="is-spinning" size={16} aria-hidden="true" /> Cargando actuaciones y condiciones…</p> : <>
        <label className="document-requirements-simulator__actuation"><span>Actuación a emular</span><select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{workspace.actuations.filter((item) => item.is_active !== false).map((item) => <option key={item.id} value={item.id}>{item.code ? `${item.code} · ` : ''}{item.name}</option>)}</select></label>
        <ActuationDocumentPreview actuation={selectedActuation} fields={workspace.conditionFields} conditions={workspace.conditions} conditionIds={conditionIds} loading={previewLoading} onPreview={preview} />
      </>}
    </main>
  );
}
