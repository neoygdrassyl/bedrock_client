import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FileCheck2,
  ListChecks,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import LegalConfigService from '../../../services/legal_config.service.js';
import './DocumentReviewChecksPage.css';

const EMPTY_CONFIG = Object.freeze({ schemaVersion: 1, checks: [] });

function parseReviewConfig(value) {
  let parsed = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value); } catch (_) { parsed = null; }
  }
  if (!parsed || Number(parsed.schemaVersion) !== 1 || !Array.isArray(parsed.checks)) return { ...EMPTY_CONFIG, checks: [] };
  return {
    schemaVersion: 1,
    checks: parsed.checks.map((check) => ({
      id: String(check?.id || ''),
      text: String(check?.text || ''),
      active: check?.active !== false,
    })),
  };
}

function createCheckId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `review-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function messageFrom(error) {
  return error?.response?.data?.message || error?.message || 'No fue posible guardar las revisiones.';
}

export default function DocumentReviewChecksPage() {
  const [documents, setDocuments] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await LegalConfigService.documentReviews();
      const nextDocuments = Array.isArray(response?.data) ? response.data : [];
      const nextDrafts = Object.fromEntries(nextDocuments.map((document) => [document.id, parseReviewConfig(document.review_config)]));
      setDocuments(nextDocuments);
      setDrafts(nextDrafts);
      setSelectedId((current) => nextDocuments.some((document) => document.id === current)
        ? current
        : (nextDocuments.find((document) => document.is_active !== false)?.id || nextDocuments[0]?.id || null));
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const selectedDocument = documents.find((document) => document.id === selectedId) || null;
  const currentConfig = selectedId ? (drafts[selectedId] || { ...EMPTY_CONFIG, checks: [] }) : EMPTY_CONFIG;
  const originalConfig = selectedDocument ? parseReviewConfig(selectedDocument.review_config) : EMPTY_CONFIG;
  const isDirty = selectedDocument && JSON.stringify(currentConfig) !== JSON.stringify(originalConfig);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return documents;
    return documents.filter((document) => `${document.code || ''} ${document.name || ''}`.toLocaleLowerCase().includes(query));
  }, [documents, search]);

  const activeCheckCount = documents.reduce((total, document) => (
    total + parseReviewConfig(document.review_config).checks.filter((check) => check.active).length
  ), 0);

  function setCurrentChecks(checks) {
    if (!selectedId) return;
    setDrafts((current) => ({ ...current, [selectedId]: { schemaVersion: 1, checks } }));
    setNotice('');
    setError('');
  }

  function addCheck() {
    const text = newText.trim();
    if (!text || !selectedId) return;
    setCurrentChecks([...currentConfig.checks, { id: createCheckId(), text, active: true }]);
    setNewText('');
  }

  function updateCheck(index, patch) {
    setCurrentChecks(currentConfig.checks.map((check, checkIndex) => checkIndex === index ? { ...check, ...patch } : check));
  }

  function moveCheck(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= currentConfig.checks.length) return;
    const checks = [...currentConfig.checks];
    [checks[index], checks[target]] = [checks[target], checks[index]];
    setCurrentChecks(checks);
  }

  async function saveChecks() {
    if (!selectedDocument || !isDirty || saving) return;
    const normalized = {
      schemaVersion: 1,
      checks: currentConfig.checks.map((check) => ({ ...check, text: check.text.trim() })),
    };
    if (normalized.checks.some((check) => !check.text)) {
      setError('Cada revisión debe tener un enunciado.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await LegalConfigService.updateDocumentReviews(selectedDocument.id, { review_config: normalized });
      const savedDocument = response?.data || { ...selectedDocument, review_config: normalized };
      const savedConfig = parseReviewConfig(savedDocument.review_config);
      setDocuments((current) => current.map((document) => document.id === selectedDocument.id
        ? { ...document, ...savedDocument, review_config: savedConfig }
        : document));
      setDrafts((current) => ({ ...current, [selectedDocument.id]: savedConfig }));
      setNotice('Revisiones guardadas.');
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="document-review-page" aria-label="Revisiones por documento">
      <header className="document-review-header">
        <div className="document-review-header__copy">
          <p>Control documental</p>
          <h2>Revisiones por documento</h2>
        </div>
        <div className="document-review-header__actions">
          <span><strong>{documents.length}</strong> documentos</span>
          <span><strong>{activeCheckCount}</strong> revisiones activas</span>
          <button type="button" onClick={load} disabled={loading || saving} aria-label="Actualizar revisiones">
            <RefreshCw size={15} /> Actualizar
          </button>
        </div>
      </header>

      <div className="document-review-feedback" aria-live="polite">
        {loading && <p role="status"><RefreshCw size={15} className="document-review-spin" /> Cargando documentos…</p>}
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status" className="is-success"><CheckCircle2 size={15} /> {notice}</p>}
      </div>

      <div className="document-review-grid">
        <section className="document-review-documents" aria-label="Documentos">
          <header>
            <span><FileCheck2 size={17} /></span>
            <h3>Documentos</h3>
          </header>
          <label className="document-review-search">
            <Search size={15} />
            <span className="sr-only">Buscar documento</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o código" aria-label="Buscar documento" />
          </label>
          <div className="document-review-document-list">
            {!loading && !filteredDocuments.length && <p className="document-review-empty">No hay documentos que coincidan.</p>}
            {filteredDocuments.map((document) => {
              const count = (drafts[document.id] || parseReviewConfig(document.review_config)).checks.filter((check) => check.active).length;
              return (
                <button
                  key={document.id}
                  type="button"
                  className={document.id === selectedId ? 'is-selected' : ''}
                  aria-pressed={document.id === selectedId}
                  onClick={() => { setSelectedId(document.id); setNewText(''); setError(''); setNotice(''); }}
                >
                  <code>{document.code}</code>
                  <span><strong>{document.name}</strong>{document.parent_document_id && <small>Variante</small>}</span>
                  <b>{count}</b>
                </button>
              );
            })}
          </div>
        </section>

        <section className="document-review-editor" aria-label="Editor de revisiones">
          {selectedDocument ? (
            <>
              <header className="document-review-editor__header">
                <div>
                  <span>{selectedDocument.code}</span>
                  <h3>{selectedDocument.name}</h3>
                </div>
                <button type="button" className="document-review-save" onClick={saveChecks} disabled={!isDirty || saving}>
                  {saving ? 'Guardando…' : 'Guardar revisiones'}
                </button>
              </header>

              <div className="document-review-add">
                <label htmlFor="new-document-review">Nueva revisión</label>
                <div>
                  <input
                    id="new-document-review"
                    value={newText}
                    onChange={(event) => setNewText(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCheck(); } }}
                    placeholder="Ej. ¿El documento está firmado?"
                    aria-label="Nueva revisión"
                    maxLength={500}
                  />
                  <button type="button" onClick={addCheck} disabled={!newText.trim()} aria-label="Añadir revisión"><Plus size={16} /> Añadir</button>
                </div>
              </div>

              <div className="document-review-check-list">
                {!currentConfig.checks.length && (
                  <div className="document-review-empty document-review-empty--editor">
                    <ListChecks size={28} />
                    <p>Este documento todavía no tiene revisiones.</p>
                  </div>
                )}
                {currentConfig.checks.map((check, index) => (
                  <article key={check.id} className={`document-review-check${check.active ? '' : ' is-inactive'}`} role="group" aria-label={`Revisión ${index + 1}`}>
                    <div className="document-review-check__order"><span>{index + 1}</span></div>
                    <div className="document-review-check__body">
                      <label htmlFor={`review-${check.id}`}>Enunciado</label>
                      <input id={`review-${check.id}`} value={check.text} onChange={(event) => updateCheck(index, { text: event.target.value })} maxLength={500} />
                      <div className="document-review-answer-preview" aria-label="Respuestas disponibles">
                        <span>Pendiente</span><span>Sí</span><span>No</span>
                        {!check.active && <em>Inactiva</em>}
                      </div>
                    </div>
                    <div className="document-review-check__actions">
                      <button type="button" onClick={() => moveCheck(index, -1)} disabled={index === 0} aria-label="Subir revisión"><ArrowUp size={15} /></button>
                      <button type="button" onClick={() => moveCheck(index, 1)} disabled={index === currentConfig.checks.length - 1} aria-label="Bajar revisión"><ArrowDown size={15} /></button>
                      <button type="button" onClick={() => updateCheck(index, { active: !check.active })} aria-label={check.active ? 'Desactivar revisión' : 'Activar revisión'}>
                        {check.active ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : !loading && (
            <div className="document-review-empty document-review-empty--editor">
              <FileCheck2 size={32} />
              <p>No hay documentos disponibles para configurar.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
