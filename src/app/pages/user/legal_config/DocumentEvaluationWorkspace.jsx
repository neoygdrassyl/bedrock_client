import { useEffect, useId, useMemo, useState } from 'react';
import {
  AlertCircle, Check, ChevronRight, FileCheck2, FileText, GitBranch,
  LoaderCircle, Plus, RefreshCw, Save, ShieldCheck, Trash2,
} from 'lucide-react';
import { DovelaBadge } from '@/components/dovela-ui/dovela-badge';
import './DocumentEvaluationWorkspace.css';

const STATUSES = [
  { value: 'required', label: 'Requerido' },
  { value: 'complementary', label: 'Complementario' },
  { value: 'not_applicable', label: 'No aplica' },
];

const emptyConfig = () => ({ legal_requirements: [], typology_checks: [], document_checks: [] });
const asList = (value) => (Array.isArray(value) ? value : []);
const newId = () => globalThis.crypto?.randomUUID?.() || `evaluation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const newCheck = () => ({ id: newId(), question: '', required: true });

function normalizeConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyConfig();
  return {
    legal_requirements: asList(value.legal_requirements).filter((item) => item?.typology_id && item?.document_id).map((item) => ({
      typology_id: item.typology_id,
      document_id: item.document_id,
      requirement: STATUSES.some((status) => status.value === item.requirement) ? item.requirement : 'required',
    })),
    typology_checks: asList(value.typology_checks).filter((item) => item?.id && item?.typology_id).map((item) => ({
      id: item.id,
      typology_id: item.typology_id,
      question: item.question || '',
      required: item.required !== false,
    })),
    document_checks: asList(value.document_checks).filter((item) => item?.document_id).map((item) => ({
      document_id: item.document_id,
      checks: asList(item.checks).filter((check) => check?.id).map((check) => ({
        id: check.id,
        question: check.question || '',
        required: check.required !== false,
      })),
    })),
  };
}

function statusLabel(value) {
  return STATUSES.find((status) => status.value === value)?.label || 'Requerido';
}

function statusTone(value) {
  if (value === 'complementary') return 'warning';
  if (value === 'not_applicable') return 'neutral';
  return 'info';
}

function QuestionEditor({ checks, onChange, label, disabled }) {
  function update(index, patch) {
    onChange(checks.map((check, checkIndex) => checkIndex === index ? { ...check, ...patch } : check));
  }

  return (
    <div className="document-evaluation-questions">
      <div className="document-evaluation-questions__label">{label}</div>
      {checks.map((check, index) => (
        <div className="document-evaluation-question" key={check.id}>
          <input
            value={check.question}
            onChange={(event) => update(index, { question: event.target.value })}
            placeholder="Escribe una pregunta de evaluación"
            disabled={disabled}
            aria-label={`${label} ${index + 1}`}
          />
          <label className="document-evaluation-question__required" title="Pregunta obligatoria">
            <input type="checkbox" checked={check.required !== false} onChange={(event) => update(index, { required: event.target.checked })} disabled={disabled} />
            <span>Oblig.</span>
          </label>
          <button type="button" onClick={() => onChange(checks.filter((_, checkIndex) => checkIndex !== index))} disabled={disabled} aria-label={`Eliminar pregunta ${index + 1}`}>
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
      <button type="button" className="document-evaluation-add-question" onClick={() => onChange([...checks, newCheck()])} disabled={disabled}>
        <Plus size={14} aria-hidden="true" /> Agregar pregunta
      </button>
    </div>
  );
}

export default function DocumentEvaluationWorkspace({
  actuation, actuations = [], documents = [], typologies = [], evaluation,
  loading = false, saving = false, error = '', onLoad, onSave,
}) {
  const instanceId = useId().replace(/:/g, '');
  const [mode, setMode] = useState('legal');
  const [config, setConfig] = useState(emptyConfig());
  const [selectedTypologyId, setSelectedTypologyId] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setConfig(normalizeConfig(evaluation?.own_config));
    setNotice('');
  }, [evaluation?.own_config, actuation?.id]);

  const activeTypologies = useMemo(() => typologies.filter((item) => item.is_active !== false), [typologies]);
  useEffect(() => {
    setSelectedTypologyId((current) => (activeTypologies.some((item) => item.id === current) ? current : (activeTypologies[0]?.id || '')));
  }, [activeTypologies]);

  const primaryDocuments = useMemo(() => documents.filter((item) => !item.parent_document_id && item.is_active !== false), [documents]);
  const scopedDocuments = useMemo(() => primaryDocuments.filter((item) => item.typology_id === selectedTypologyId), [primaryDocuments, selectedTypologyId]);
  const variantsFor = (documentId) => documents.filter((item) => item.parent_document_id === documentId && item.is_active !== false);
  const parent = actuations.find((item) => item.id === actuation?.parent_id);
  const ancestorLayers = asList(evaluation?.ancestor_layers);
  const effective = normalizeConfig(evaluation?.effective_config);
  const typologyChecks = config.typology_checks.filter((item) => item.typology_id === selectedTypologyId);
  const ownRuleCount = config.legal_requirements.filter((item) => item.typology_id === selectedTypologyId).length + typologyChecks.length;
  const effectiveRuleCount = effective.legal_requirements.filter((item) => item.typology_id === selectedTypologyId).length + effective.typology_checks.filter((item) => item.typology_id === selectedTypologyId).length;
  const disabled = loading || saving;

  function updateConfig(updater) {
    setConfig((current) => (typeof updater === 'function' ? updater(current) : updater));
    setNotice('');
  }

  function requirementFor(documentId) {
    return config.legal_requirements.find((item) => item.typology_id === selectedTypologyId && item.document_id === documentId) || { requirement: 'required' };
  }

  function setRequirement(documentId, requirement) {
    updateConfig((current) => ({
      ...current,
      legal_requirements: [
        ...current.legal_requirements.filter((item) => !(item.typology_id === selectedTypologyId && item.document_id === documentId)),
        { typology_id: selectedTypologyId, document_id: documentId, requirement },
      ],
    }));
  }

  function setTypologyChecks(checks) {
    updateConfig((current) => ({
      ...current,
      typology_checks: [
        ...current.typology_checks.filter((item) => item.typology_id !== selectedTypologyId),
        ...checks.map((check) => ({ ...check, typology_id: selectedTypologyId })),
      ],
    }));
  }

  function checksFor(documentId) {
    return config.document_checks.find((item) => item.document_id === documentId)?.checks || [];
  }

  function setDocumentChecks(documentId, checks) {
    updateConfig((current) => ({
      ...current,
      document_checks: [
        ...current.document_checks.filter((item) => item.document_id !== documentId),
        ...(checks.length ? [{ document_id: documentId, checks }] : []),
      ],
    }));
  }

  async function save() {
    if (!actuation || disabled) return;
    const normalized = {
      legal_requirements: config.legal_requirements,
      typology_checks: config.typology_checks.filter((check) => check.question.trim()).map((check) => ({ ...check, question: check.question.trim() })),
      document_checks: config.document_checks.map((item) => ({
        document_id: item.document_id,
        checks: item.checks.filter((check) => check.question.trim()).map((check) => ({ ...check, question: check.question.trim() })),
      })).filter((item) => item.checks.length),
    };
    const result = await onSave?.(normalized);
    if (result?.ok) setNotice('Configuración de evaluación guardada.');
  }

  if (!actuation) {
    return <section className="document-evaluation-workspace document-evaluation-workspace--empty" aria-label="Evaluación documental"><FileCheck2 size={28} aria-hidden="true" /><strong>Selecciona una actuación</strong><p>Elige una categoría, actuación o modalidad para definir sus requisitos y preguntas.</p></section>;
  }

  return (
    <section className="document-evaluation-workspace" aria-label={`Evaluación documental de ${actuation.name}`} aria-busy={disabled}>
      <header className="document-evaluation-header">
        <div>
          <p>Configuración contextual</p>
          <div className="document-evaluation-breadcrumb" aria-label="Jerarquía de configuración">
            <span><GitBranch size={13} aria-hidden="true" /> {actuation.node_kind === 'category' ? 'Categoría' : 'Categoría / contexto'}</span>
            <ChevronRight size={13} aria-hidden="true" />
            <span>{parent ? `Actuación: ${parent.name}` : `${actuation.node_kind === 'category' ? 'Categoría' : 'Actuación'}: ${actuation.name}`}</span>
            {parent && <><ChevronRight size={13} aria-hidden="true" /><strong>{actuation.node_kind === 'modality' ? `Modalidad: ${actuation.name}` : actuation.name}</strong></>}
          </div>
        </div>
        <div className="document-evaluation-header__actions">
          <button type="button" className="document-evaluation-refresh" onClick={onLoad} disabled={disabled} title="Recargar configuración" aria-label="Recargar configuración"><RefreshCw className={loading ? 'is-spinning' : ''} size={15} aria-hidden="true" /></button>
          <button type="button" className="document-evaluation-save" onClick={save} disabled={disabled}>{saving ? <LoaderCircle className="is-spinning" size={15} aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </header>

      <div className="document-evaluation-tabs" role="tablist" aria-label="Momento de configuración">
        <button id={`${instanceId}-legal-tab`} type="button" role="tab" aria-selected={mode === 'legal'} aria-controls={`${instanceId}-legal-panel`} className={mode === 'legal' ? 'is-active' : ''} onClick={() => setMode('legal')}><ShieldCheck size={15} aria-hidden="true" /> Legal y debida forma</button>
        <button id={`${instanceId}-evaluation-tab`} type="button" role="tab" aria-selected={mode === 'evaluation'} aria-controls={`${instanceId}-evaluation-panel`} className={mode === 'evaluation' ? 'is-active' : ''} onClick={() => setMode('evaluation')}><FileCheck2 size={15} aria-hidden="true" /> Evaluación documental</button>
      </div>

      <div className="document-evaluation-feedback" aria-live="polite">
        {loading && <p className="is-loading" role="status"><LoaderCircle className="is-spinning" size={14} /> Cargando reglas de evaluación…</p>}
        {saving && <p className="is-loading" role="status"><LoaderCircle className="is-spinning" size={14} /> Guardando configuración…</p>}
        {error && <p className="is-error" role="alert"><AlertCircle size={14} /> {error}</p>}
        {notice && <p className="is-success" role="status"><Check size={14} /> {notice}</p>}
      </div>

      <div className="document-evaluation-toolbar">
        <label><span>Tipología</span><select value={selectedTypologyId} onChange={(event) => setSelectedTypologyId(event.target.value)} disabled={disabled || !activeTypologies.length}>{!activeTypologies.length && <option value="">Sin tipologías activas</option>}{activeTypologies.map((typology) => <option key={typology.id} value={typology.id}>{typology.name}</option>)}</select></label>
        <span className="document-evaluation-toolbar__summary"><strong>{ownRuleCount}</strong> reglas propias · <strong>{Math.max(effectiveRuleCount - ownRuleCount, 0)}</strong> heredadas</span>
      </div>

      {mode === 'legal' ? (
        <div id={`${instanceId}-legal-panel`} role="tabpanel" aria-labelledby={`${instanceId}-legal-tab`} className="document-evaluation-legal">
          <section className="document-evaluation-card"><header><span><ShieldCheck size={16} /></span><div><h3>Requisitos legales</h3><p>Define qué unidad documental cumple la tipología en este contexto.</p></div></header>
            {scopedDocuments.map((document) => <div className="document-evaluation-document-group" key={document.id}>{[document, ...variantsFor(document.id)].map((item) => {
              const rule = requirementFor(item.id);
              return <div className={`document-evaluation-requirement${item.parent_document_id ? ' is-variant' : ''}`} key={item.id}><span className="document-evaluation-requirement__name">{item.parent_document_id && <ChevronRight size={13} aria-hidden="true" />}<strong>{item.name}</strong>{item.code && <code>{item.code}</code>}</span><select value={rule.requirement} onChange={(event) => setRequirement(item.id, event.target.value)} disabled={disabled} aria-label={`Exigencia de ${item.name}`}>{STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select><DovelaBadge tone={statusTone(rule.requirement)} className="document-evaluation-status">{statusLabel(rule.requirement)}</DovelaBadge></div>;
            })}</div>)}
            {!scopedDocuments.length && <div className="document-evaluation-empty"><FileText size={22} /><strong>Sin documentos para esta tipología</strong><p>Asocia documentos activos a la tipología para configurar sus requisitos.</p></div>}
          </section>
        </div>
      ) : (
        <div id={`${instanceId}-evaluation-panel`} role="tabpanel" aria-labelledby={`${instanceId}-evaluation-tab`} className="document-evaluation-evaluation">
          <section className="document-evaluation-card"><header><span><FileCheck2 size={16} /></span><div><h3>Preguntas de la tipología</h3><p>Se aplican al conjunto documental de la tipología seleccionada.</p></div></header><QuestionEditor checks={typologyChecks} onChange={setTypologyChecks} label="Pregunta de tipología" disabled={disabled} /></section>
          <section className="document-evaluation-card document-evaluation-card--questions"><header><span><FileText size={16} /></span><div><h3>Preguntas por documento o variante</h3><p>Complementan las preguntas generales cuando la unidad documental lo requiere.</p></div></header>
            {scopedDocuments.map((document) => [document, ...variantsFor(document.id)].map((item) => <div className="document-evaluation-document-question" key={item.id}><div><strong>{item.name}</strong>{item.parent_document_id && <small>Variante</small>}<DovelaBadge tone={statusTone(requirementFor(item.id).requirement)} className="document-evaluation-status">{statusLabel(requirementFor(item.id).requirement)}</DovelaBadge></div><QuestionEditor checks={checksFor(item.id)} onChange={(checks) => setDocumentChecks(item.id, checks)} label={`Preguntas para ${item.name}`} disabled={disabled} /></div>))}
            {!scopedDocuments.length && <div className="document-evaluation-empty"><FileText size={22} /><strong>Sin documentos configurables</strong><p>Crea o asocia documentos a esta tipología para añadir preguntas específicas.</p></div>}
          </section>
        </div>
      )}

      <aside className="document-evaluation-inheritance" aria-label="Herencia de reglas"><header><GitBranch size={16} aria-hidden="true" /><div><h3>Herencia de reglas</h3><p>La configuración efectiva apila categoría, actuación y modalidad.</p></div></header><div className="document-evaluation-inheritance__layers">{ancestorLayers.map((layer) => <div key={layer.id} className="document-evaluation-inheritance__layer"><span>{layer.node_kind === 'modality' ? 'Modalidad' : layer.node_kind === 'category' ? 'Categoría' : 'Actuación'}</span><strong>{layer.name}</strong><small>Heredada</small></div>)}<div className="document-evaluation-inheritance__layer is-own"><span>{actuation.node_kind === 'modality' ? 'Modalidad' : actuation.node_kind === 'category' ? 'Categoría' : 'Actuación'}</span><strong>{actuation.name}</strong><small>Reglas propias</small></div>{!ancestorLayers.length && <p className="document-evaluation-inheritance__empty">No hay capas superiores. Las reglas que definas aquí serán la base de este contexto.</p>}</div></aside>
    </section>
  );
}
