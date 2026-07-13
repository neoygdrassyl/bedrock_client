import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  FileText,
  FolderTree,
  Info,
  Layers,
  Plus,
  PowerOff,
  Trash2,
  RefreshCw,
  Scale,
  Tags,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  DovelaBadge,
  DovelaButton,
  DovelaCard,
  DovelaField,
  DovelaInlineAlert,
  DovelaInput,
  DovelaPageHeader,
} from '@/components/dovela-ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LegalConfigService from '../../../services/legal_config.service.js';
import './LegalConfigInitialPage.css';

const EMPTY_DATA = {
  actuationTypes: [],
  documentCodes: [],
  documents: [],
  labels: [],
  texts: [],
  readContracts: [],
  assertions: [],
  rules: {},
};

const ACTUATIONS_PANE = 'Actuaciones';
const PANES = [ACTUATIONS_PANE, 'Documentos', 'Resolución'];

const NODE_TYPE_LABELS = {
  group: 'Grupo',
  actuation: 'Actuación',
  sub_actuation: 'Subactuación',
  modality: 'Modalidad',
  sub_modality: 'Submodalidad',
};

const RELATION_META = {
  document: {
    title: 'Asociar documento',
    label: 'Documento disponible',
    empty: 'No hay documentos disponibles',
    typeLabel: 'Documento',
  },
  text: {
    title: 'Asociar texto jurídico',
    label: 'Texto jurídico disponible',
    empty: 'No hay textos jurídicos disponibles',
    typeLabel: 'Texto jurídico',
  },
  typology: {
    title: 'Asociar tipología',
    label: 'Tipología disponible',
    empty: 'No hay tipologías disponibles',
    typeLabel: 'Tipología',
  },
  label: {
    title: 'Asociar etiqueta',
    label: 'Etiqueta disponible',
    empty: 'No hay etiquetas disponibles',
    typeLabel: 'Etiqueta',
  },
};

function responseData(response, fallback) {
  return response?.data ?? fallback;
}

function getNodeTypeLabel(type) {
  return NODE_TYPE_LABELS[type] || 'Actuación';
}

function getItemName(item, fallback = 'Elemento disponible') {
  return item?.name || item?.title || item?.display_name || item?.slug || fallback;
}

function slugify(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}


function getMetadata(row) {
  if (!row?.metadata) return {};
  if (typeof row.metadata === 'string') {
    try { return JSON.parse(row.metadata) || {}; } catch { return {}; }
  }
  return row.metadata || {};
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeDocumentDefinition(definition, documentCodes) {
  const catalogCode = documentCodes.find((item) => item.id === definition.document_code_id)?.code;
  return {
    ...definition,
    code: definition.code || catalogCode || '',
    label_ids: parseJsonArray(definition.label_ids),
    validation_config: parseJsonObject(definition.validation_config),
    metadata: parseJsonObject(definition.metadata),
  };
}

function normalizeTypologyPayload(payload = {}) {
  return {
    code: String(payload.code || '').trim().toUpperCase(),
    name: String(payload.name || '').trim(),
    description: payload.description?.trim() || null,
    metadata: parseJsonObject(payload.metadata),
    is_active: payload.is_active !== false,
    sort_order: Number(payload.sort_order || 0),
  };
}

function normalizeLabelPayload(payload = {}) {
  const name = String(payload.name || '').trim();
  return {
    name,
    slug: slugify(payload.slug || name),
    description: payload.description?.trim() || null,
    label_scope: payload.label_scope || 'document',
    document_code_id: payload.document_code_id || null,
    default_rule_config: parseJsonObject(payload.default_rule_config),
    validation_config: parseJsonObject(payload.validation_config),
    metadata: parseJsonObject(payload.metadata),
    is_active: payload.is_active !== false,
    sort_order: Number(payload.sort_order || 0),
  };
}

function getRuleConditionSummary(rule) {
  const conditions = rule?.config?.conditions || {};
  const active = Object.entries(conditions)
    .filter(([, value]) => Array.isArray(value) && value.length)
    .map(([key, value]) => `${key}: ${value.join(', ')}`);
  return active.length ? active.join(' · ') : 'Sin condición adicional';
}


function InfoTooltip({ label, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="legal-config-help-trigger" aria-label={label}>
          <Info aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="legal-config-tooltip-content">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

function CompactTitle({ title, help, kicker }) {
  return (
    <div className="legal-config-compact-title">
      {kicker && <span className="legal-config-kicker">{kicker}</span>}
      <div className="legal-config-compact-title__row">
        <h3>{title}</h3>
        {help && <InfoTooltip label={`Ayuda: ${title}`}>{help}</InfoTooltip>}
      </div>
    </div>
  );
}

const GRAPH_NODE = { width: 220, height: 68, gapX: 60, gapY: 36 };
const GRAPH_COLUMN_STEP = GRAPH_NODE.width + GRAPH_NODE.gapX;
const GRAPH_ROW_STEP = GRAPH_NODE.height + GRAPH_NODE.gapY;

function buildGraphRows(actuations = []) {
  const byParent = new Map();
  const byId = new Map();

  actuations.forEach((item) => {
    byId.set(item.id, item);
    const parentKey = item.parent_id || '__root__';
    if (!byParent.has(parentKey)) byParent.set(parentKey, []);
    byParent.get(parentKey).push(item);
  });

  byParent.forEach((items) => {
    items.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || getItemName(a).localeCompare(getItemName(b)));
  });

  const rows = [];
  const visit = (parentId = '__root__', depth = 0) => {
    (byParent.get(parentId) || []).forEach((item) => {
      rows.push({ ...item, depth, row: rows.length });
      visit(item.id, depth + 1);
    });
  };

  visit('__root__');

  const positioned = rows.map((item) => ({
    ...item,
    x: 32 + item.depth * GRAPH_COLUMN_STEP,
    y: 34 + item.row * GRAPH_ROW_STEP,
  }));

  return {
    nodes: positioned,
    byId,
    byPositionId: new Map(positioned.map((item) => [item.id, item])),
    width: Math.max(860, 360 + (Math.max(0, ...positioned.map((item) => item.depth)) + 1) * GRAPH_COLUMN_STEP),
    height: Math.max(420, 120 + positioned.length * GRAPH_ROW_STEP),
  };
}

function resolveRuleItems(rules = [], catalog = [], idKey, targetType) {
  return rules
    .filter((rule) => rule.is_active !== false)
    .map((rule) => {
      const item = catalog.find((entry) => entry.id === rule[idKey]);
      if (!item) return null;
      return {
        key: rule.id || `${rule[idKey]}-${rule.actuation_type_id}`,
        ruleId: rule.id,
        ruleType: targetType,
        required: rule.is_required !== false,
        inherits: rule.applies_to_descendants !== false,
        inclusionMode: rule.inclusion_mode || 'include',
        priority: Number(rule.priority || 0),
        ...item,
      };
    })
    .filter(Boolean);
}

/** Deriva, desde los datos reales del backend (`data.rules`), las relaciones
 * directas y por etiqueta de una actuación — fuente única para los modales de
 * gobierno visual. */
function getActuationRelations(actuationId, data) {
  if (!actuationId) return { documents: [], texts: [] };
  const rules = data.rules || {};

  const directDocuments = (rules.actuation_documents || []).filter((rule) => rule.actuation_type_id === actuationId);
  const labelDocuments = (rules.actuation_documents_by_labels || []).filter((rule) => rule.actuation_type_id === actuationId);
  const directTexts = (rules.actuation_texts || []).filter((rule) => rule.actuation_type_id === actuationId);
  const labelTexts = (rules.actuation_texts_by_labels || []).filter((rule) => rule.actuation_type_id === actuationId);

  return {
    documents: [
      ...resolveRuleItems(directDocuments, data.documents, 'document_id', 'actuation_documents').map((entry) => ({ ...entry, via: 'Documento directo' })),
      ...resolveRuleItems(labelDocuments, data.labels, 'label_id', 'actuation_documents_by_labels').map((entry) => ({ ...entry, via: 'Etiqueta documental' })),
    ],
    texts: [
      ...resolveRuleItems(directTexts, data.texts, 'text_id', 'actuation_texts').map((entry) => ({ ...entry, via: 'Texto directo' })),
      ...resolveRuleItems(labelTexts, data.labels, 'label_id', 'actuation_texts_by_labels').map((entry) => ({ ...entry, via: 'Etiqueta de resolución' })),
    ],
  };
}

function DovelaDataTable({ ariaLabel, columns, rows, emptyMessage }) {
  return (
    <div className="dovela-data-table-wrap">
      <table className="dovela-data-table" aria-label={ariaLabel}>
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key}>{column.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row.key}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="dovela-data-table__empty">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CreateTypeModal({ open, actuations, defaultParentId, onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', parentId: defaultParentId || actuations[0]?.id || '', nodeType: 'actuation' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ name: '', parentId: defaultParentId || actuations[0]?.id || '', nodeType: 'actuation' });
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultParentId]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await onCreate({
        name: form.name.trim(),
        slug: slugify(form.name),
        parent_id: form.parentId || null,
        node_type: form.nodeType,
      });
      onClose();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, 'No fue posible crear el tipo de actuación.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear tipo de actuación</DialogTitle>
          <DialogDescription>Agrega un nodo nuevo al árbol jerárquico de actuaciones.</DialogDescription>
        </DialogHeader>
        <form className="legal-config-modal-form" onSubmit={submit}>
          {error && <DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert>}

          <DovelaField label="Nombre del tipo">
            <DovelaInput
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Ej. Nueva modalidad"
              autoFocus
            />
          </DovelaField>

          <DovelaField label="Depende de">
            <select
              id="create-type-parent"
              className="legal-config-native-select"
              value={form.parentId}
              onChange={(event) => update('parentId', event.target.value)}
            >
              <option value="">Sin actuación padre (raíz)</option>
              {actuations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </DovelaField>

          <DovelaField label="Clasificación">
            <select
              id="create-type-node-type"
              className="legal-config-native-select"
              value={form.nodeType}
              onChange={(event) => update('nodeType', event.target.value)}
            >
              {Object.entries(NODE_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </DovelaField>

          <DialogFooter>
            <DovelaButton type="button" tone="neutral" onClick={onClose} disabled={submitting}>Cancelar</DovelaButton>
            <DovelaButton type="submit" tone="primary" loading={submitting}>Agregar al árbol</DovelaButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RelationModal({ open, relationType, items, onClose, onSave }) {
  const meta = RELATION_META[relationType];
  const [selectedId, setSelectedId] = useState(items[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const selectedItem = items.find((item) => item.id === selectedId);

  useEffect(() => {
    if (open) {
      setSelectedId(items[0]?.id || '');
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, relationType]);

  async function submit(event) {
    event.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    setError('');
    try {
      await onSave(relationType, selectedItem);
      onClose();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, 'No fue posible guardar la relación.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>Selecciona un elemento disponible para relacionarlo con la actuación actual.</DialogDescription>
        </DialogHeader>
        <form className="legal-config-modal-form" onSubmit={submit}>
          {error && <DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert>}

          <DovelaField label={meta.label}>
            <select
              id="relation-item"
              className="legal-config-native-select"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              disabled={!items.length}
            >
              {items.length
                ? items.map((item) => <option key={item.id} value={item.id}>{getItemName(item)}</option>)
                : <option value="">{meta.empty}</option>}
            </select>
          </DovelaField>

          <DialogFooter>
            <DovelaButton type="button" tone="neutral" onClick={onClose} disabled={submitting}>Cancelar</DovelaButton>
            <DovelaButton type="submit" tone="primary" loading={submitting} disabled={!selectedItem}>Guardar relación</DovelaButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function ActuationInfoGrid({ node, parent }) {
  const items = [
    { label: 'Tipo', value: getNodeTypeLabel(node?.node_type) },
    { label: 'Actuación padre', value: parent?.name || 'Raíz' },
    { label: 'Estado', value: node?.is_active === false ? 'Desactivada' : 'Activa' },
    { label: 'Uso en selección', value: node?.is_selectable === false ? 'Agrupador' : 'Seleccionable' },
  ];

  return (
    <dl className="legal-config-node-info-grid">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DeactivateActuationModal({ open, node, data, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const relations = useMemo(() => getActuationRelations(node?.id, data), [node, data]);
  const parent = data.actuationTypes.find((item) => item.id === node?.parent_id);
  const children = useMemo(
    () => data.actuationTypes.filter((item) => item.parent_id === node?.id),
    [data.actuationTypes, node?.id],
  );
  const relationCount = relations.documents.length + relations.texts.length;

  useEffect(() => {
    if (open) setError('');
  }, [open, node?.id]);

  async function submit() {
    if (!node) return;
    setSubmitting(true);
    setError('');
    try {
      await onConfirm(node);
      onClose();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, 'No fue posible desactivar la actuación.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desactivar actuación</DialogTitle>
          <DialogDescription>
            La actuación dejará de aparecer como activa. Sus relaciones no se eliminan; se conservan para trazabilidad salvo que se quiten desde las tablas.
          </DialogDescription>
        </DialogHeader>

        {error && <DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert>}
        <DovelaInlineAlert tone="warning" icon={AlertTriangle} title={node?.name || 'Actuación seleccionada'}>
          <div className="legal-config-deactivate-summary">
            <span><strong>{children.length}</strong> hijas directas</span>
            <span><strong>{relationCount}</strong> relaciones directas</span>
          </div>
          <p>Esta acción desactiva solo la actuación. Si necesitas retirar documentos, etiquetas o textos, hazlo en “Gestionar relaciones”.</p>
        </DovelaInlineAlert>

        <DialogFooter>
          <DovelaButton type="button" tone="neutral" onClick={onClose} disabled={submitting}>Cancelar</DovelaButton>
          <DovelaButton type="button" tone="danger" leadingIcon={PowerOff} loading={submitting} onClick={submit}>Desactivar actuación</DovelaButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActuationDetailModal({ open, node, data, onClose, onOpenRelation, onDeactivateActuation, onDeleteRelation }) {
  const [tab, setTab] = useState('documents');
  const [relationBusyId, setRelationBusyId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTab('documents');
      setError('');
      setRelationBusyId('');
    }
  }, [open, node?.id]);

  const relations = useMemo(() => getActuationRelations(node?.id, data), [node, data]);
  const parent = data.actuationTypes.find((item) => item.id === node?.parent_id);

  async function removeRelation(row) {
    if (!row?.ruleId) return;
    setRelationBusyId(row.ruleId);
    setError('');
    try {
      await onDeleteRelation(row.ruleType, row.ruleId);
    } catch (deleteError) {
      setError(extractErrorMessage(deleteError, 'No fue posible quitar la relación.'));
    } finally {
      setRelationBusyId('');
    }
  }

  const relationColumns = [
    { key: 'name', header: 'Elemento', render: (row) => <strong>{getItemName(row)}</strong> },
    { key: 'via', header: 'Relación', render: (row) => <DovelaBadge tone="info">{row.via}</DovelaBadge> },
    { key: 'required', header: 'Obligatorio', render: (row) => (row.required ? 'Sí' : 'No') },
    { key: 'inherits', header: 'Hereda', render: (row) => (row.inherits ? 'Sí' : 'No') },
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => (
        <DovelaButton
          type="button"
          tone="neutral"
          size="sm"
          leadingIcon={Trash2}
          loading={relationBusyId === row.ruleId}
          disabled={!row.ruleId || Boolean(relationBusyId)}
          aria-label={`Quitar ${getItemName(row)}`}
          onClick={() => removeRelation(row)}
        >
          Quitar
        </DovelaButton>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="legal-config-detail-dialog">
        <DialogHeader>
          <DialogTitle>{node?.name || 'Actuación'}</DialogTitle>
          <DialogDescription>Gobierna la actuación seleccionada y consulta sus relaciones sin saturar el gráfico principal.</DialogDescription>
        </DialogHeader>

        <ActuationInfoGrid node={node} parent={parent} />

        {error && <DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert>}

        <div className="legal-config-node-actions">
          <DovelaButton type="button" tone="primary" leadingIcon={Plus} onClick={() => onOpenRelation('create')}>Crear hija</DovelaButton>
          <DovelaButton type="button" tone="neutral" leadingIcon={FileText} onClick={() => onOpenRelation('document')}>Asociar documento</DovelaButton>
          <DovelaButton type="button" tone="neutral" leadingIcon={BookOpen} onClick={() => onOpenRelation('text')}>Asociar texto jurídico</DovelaButton>
          <DovelaButton type="button" tone="neutral" leadingIcon={Tags} onClick={() => onOpenRelation('label')}>Asociar etiqueta</DovelaButton>
          <DovelaButton type="button" tone="danger" leadingIcon={PowerOff} onClick={() => onDeactivateActuation(node)}>Desactivar actuación</DovelaButton>
        </div>



        <nav className="legal-config-preview-tabs" aria-label="Relaciones de la actuación">
          <DovelaButton type="button" tone={tab === 'documents' ? 'primary' : 'neutral'} onClick={() => setTab('documents')} aria-pressed={tab === 'documents'}>
            Documentos relacionados
          </DovelaButton>
          <DovelaButton type="button" tone={tab === 'resolution' ? 'primary' : 'neutral'} onClick={() => setTab('resolution')} aria-pressed={tab === 'resolution'}>
            Resolución relacionada
          </DovelaButton>
        </nav>

        {tab === 'documents' ? (
          <DovelaDataTable
            ariaLabel="Relaciones documentales"
            columns={relationColumns}
            rows={relations.documents}
            emptyMessage="Esta actuación todavía no tiene documentos ni etiquetas documentales relacionadas."
          />
        ) : (
          <DovelaDataTable
            ariaLabel="Relaciones de resolución"
            columns={relationColumns}
            rows={relations.texts}
            emptyMessage="Esta actuación todavía no tiene textos ni etiquetas de resolución relacionadas."
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ActuationGraph({ nodes, selectedNode, selectedId, onNodeClick, onDeactivateSelected, zoom, setZoom }) {
  const layout = useMemo(() => buildGraphRows(nodes), [nodes]);
  const { width: nodeWidth, height: nodeHeight } = GRAPH_NODE;

  return (
    <DovelaCard as="section" className="actuation-graph-card">
      <header className="actuation-graph-card__header">
        <div>
          <h3>Mapa jerárquico de actuaciones</h3>
          <span>Selecciona un nodo para gobernar su estructura y sus reglas</span>
        </div>
        <div className="actuation-graph-toolbar">
          <DovelaButton
            tone="danger"
            size="sm"
            leadingIcon={PowerOff}
            aria-label="Desactivar actuación seleccionada"
            title="Desactivar actuación seleccionada"
            disabled={!selectedNode}
            onClick={() => onDeactivateSelected(selectedNode)}
          />
          <div className="actuation-graph-controls" aria-label="Controles del gráfico">
            <DovelaButton
              tone="neutral"
              size="sm"
              leadingIcon={ZoomOut}
              aria-label="Alejar"
              onClick={() => setZoom((current) => Math.max(0.75, Number((current - 0.1).toFixed(2))))}
            />
          <strong>{Math.round(zoom * 100)}%</strong>
          <DovelaButton
              tone="neutral"
              size="sm"
              leadingIcon={ZoomIn}
              aria-label="Acercar"
              onClick={() => setZoom((current) => Math.min(1.35, Number((current + 0.1).toFixed(2))))}
            />
          </div>
        </div>
      </header>

      <div className="actuation-graph-canvas" data-testid="actuation-graph-canvas">
        <div
          className="actuation-graph-stage"
          style={{ width: layout.width, height: layout.height, transform: `scale(${zoom})` }}
        >
          <svg className="actuation-graph-lines" width={layout.width} height={layout.height} aria-hidden="true">
            {layout.nodes.map((node) => {
              const parent = node.parent_id ? layout.byPositionId.get(node.parent_id) : null;
              if (!parent) return null;
              const startX = parent.x + nodeWidth;
              const startY = parent.y + nodeHeight / 2;
              const endX = node.x;
              const endY = node.y + nodeHeight / 2;
              const midX = startX + Math.max(34, (endX - startX) / 2);
              return <path key={`${parent.id}-${node.id}`} d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`} />;
            })}
          </svg>

          {layout.nodes.map((node) => {
            const isSelected = selectedId === node.id;
            return (
              <button
                key={node.id}
                type="button"
                className={`actuation-graph-node${isSelected ? ' is-selected' : ''}`}
                style={{ left: node.x, top: node.y, width: nodeWidth, minHeight: nodeHeight }}
                onClick={() => onNodeClick(node)}
              >
                <strong>{node.name}</strong>
                <span>{getNodeTypeLabel(node.node_type)}</span>
                {isSelected && <em>Seleccionada</em>}
              </button>
            );
          })}
        </div>
      </div>
    </DovelaCard>
  );
}

function ActionPanel({ selectedNode, data, typologies, onOpen, onOpenDetail, onSelectNode }) {
  const relations = useMemo(() => getActuationRelations(selectedNode?.id, data), [selectedNode, data]);
  const children = useMemo(
    () => data.actuationTypes.filter((item) => item.parent_id === selectedNode?.id),
    [data.actuationTypes, selectedNode?.id],
  );
  const parent = data.actuationTypes.find((item) => item.id === selectedNode?.parent_id);
  const relatedTypologies = selectedNode?.document_typologies || [];
  const hasRelations = relations.documents.length + relations.texts.length + relatedTypologies.length > 0;

  return (
    <DovelaCard as="aside" className="legal-config-action-panel">
      <div className="legal-config-inspector-kicker">Inspector de actuación</div>

      <DovelaCard tone="subtle" className="legal-config-selected-card">
        <div className="legal-config-selected-card__head">
          <span>{selectedNode ? getNodeTypeLabel(selectedNode.node_type) : 'Sin selección'}</span>
          {selectedNode && <DovelaBadge tone="outline">{selectedNode.is_selectable === false ? 'Agrupador' : 'Seleccionable'}</DovelaBadge>}
        </div>
        <strong>{selectedNode?.name || 'Selecciona una actuación'}</strong>
        <small>{selectedNode ? `Padre: ${parent?.name || 'Raíz'}` : 'El mapa es el punto de partida.'}</small>
      </DovelaCard>

      <div className="legal-config-inspector-metrics" aria-label="Resumen de impacto de la actuación">
        <div><strong>{children.length}</strong><span>Hijas</span></div>
        <div><strong>{relations.documents.length}</strong><span>Documentos</span></div>
        <div><strong>{relations.texts.length}</strong><span>Resolución</span></div>
        <div><strong>{relatedTypologies.length}</strong><span>Tipologías</span></div>
      </div>

      <DovelaInlineAlert tone={hasRelations ? 'success' : 'info'}>
        {selectedNode
          ? hasRelations
            ? 'Esta actuación ya tiene reglas asociadas. Revisa el detalle para decidir si heredan o aplican directamente.'
            : 'Esta actuación no tiene relaciones directas: crea hijas o agrega documentos, tipologías o textos según el modelo.'
          : 'Selecciona una actuación para ver su impacto y acciones.'}
      </DovelaInlineAlert>

      <div className="legal-config-action-stack" aria-label="Acciones de gobierno de actuación">
        <DovelaButton tone="primary" fullWidth leadingIcon={Plus} onClick={() => onOpen('create')}>
          Crear hija / tipo
        </DovelaButton>
        <DovelaButton tone="neutral" fullWidth leadingIcon={FileText} disabled={!selectedNode} onClick={() => onOpenDetail(selectedNode)}>
          Gestionar relaciones
        </DovelaButton>
        <div className="legal-config-action-grid">
          <DovelaButton tone="neutral" size="sm" leadingIcon={FileText} disabled={!selectedNode} onClick={() => onOpen('document')}>Documento</DovelaButton>
          <DovelaButton tone="neutral" size="sm" leadingIcon={BookOpen} disabled={!selectedNode} onClick={() => onOpen('text')}>Texto</DovelaButton>
          <DovelaButton tone="neutral" size="sm" leadingIcon={Layers} disabled={!selectedNode} onClick={() => onOpen('typology')}>Tipología</DovelaButton><DovelaButton tone="neutral" size="sm" leadingIcon={Tags} disabled={!selectedNode} onClick={() => onOpen('label')}>Etiqueta</DovelaButton>
        </div>
      </div>

      {children.length > 0 && (
        <div className="legal-config-child-list">
          <span>Hijas directas</span>
          {children.slice(0, 5).map((child) => (
            <button key={child.id} type="button" onClick={() => onSelectNode(child)}>
              <strong>{child.name}</strong>
              <small>{getNodeTypeLabel(child.node_type)}</small>
            </button>
          ))}
        </div>
      )}
    </DovelaCard>
  );
}

function LabelPicker({ labels, value, onChange, onCreate }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const documentLabels = labels.filter((label) => ['document', 'mixed'].includes(label.label_scope || 'mixed'));
  const available = documentLabels.filter((label) => label.is_active !== false);
  const matches = available.filter((label) => label.name.toLocaleLowerCase().includes(normalizedQuery));
  const selected = value.map((id) => documentLabels.find((label) => label.id === id) || { id, name: `Etiqueta no disponible (${id})`, is_active: false, missing: true });
  function removeLast() {
    if (!query && value.length) onChange(value.slice(0, -1));
  }
  function select(label) {
    if (!value.includes(label.id) && label.is_active !== false) onChange([...value, label.id]);
    setQuery('');
    setOpen(false);
  }
  const canCreate = Boolean(normalizedQuery) && !available.some((label) => label.name.toLocaleLowerCase() === normalizedQuery);
  const optionCount = matches.length + (canCreate ? 1 : 0);
  const optionId = activeIndex >= 0 && activeIndex < matches.length ? `document-label-option-${matches[activeIndex].id}` : activeIndex === matches.length && canCreate ? 'document-label-create-option' : undefined;
  return <div className="legal-config-label-picker">
    <label htmlFor="document-label-picker">Etiquetas</label>
    <div className="legal-config-label-picker__chips" aria-live="polite">
      {selected.map((label) => <span key={label.id} className={`legal-config-label-chip${label.is_active === false ? ' is-inactive' : ''}`}>{label.name}{label.is_active === false && <small>Inactiva</small>}<button type="button" aria-label={`Quitar ${label.name}`} onClick={() => onChange(value.filter((id) => id !== label.id))}>×</button></span>)}
    </div>
    <input id="document-label-picker" className="legal-config-native-select" value={query} placeholder="Buscar o crear etiqueta" role="combobox" aria-label="Buscar etiquetas documentales" aria-autocomplete="list" aria-expanded={open} aria-controls="document-label-options" aria-activedescendant={open ? optionId : undefined} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(-1); }} onKeyDown={(event) => { if (event.key === 'Backspace' && !query) removeLast(); if (event.key === 'Escape') { setOpen(false); setActiveIndex(-1); } if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActiveIndex((current) => optionCount ? Math.min(current + 1, optionCount - 1) : -1); } if (event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setActiveIndex((current) => optionCount ? Math.max(current - 1, 0) : -1); } if (event.key === 'Enter' && activeIndex >= 0) { event.preventDefault(); if (activeIndex < matches.length) select(matches[activeIndex]); else if (canCreate) onCreate(query.trim()); } }} />
    {open && <div id="document-label-options" role="listbox" className="legal-config-label-options">
      {matches.map((label, index) => <button id={`document-label-option-${label.id}`} key={label.id} type="button" role="option" aria-selected={index === activeIndex} className={index === activeIndex ? 'is-active' : ''} onMouseMove={() => setActiveIndex(index)} onClick={() => select(label)}>{label.name}</button>)}
      {canCreate && <button id="document-label-create-option" type="button" role="option" aria-selected={activeIndex === matches.length} className={activeIndex === matches.length ? 'is-active' : ''} onMouseMove={() => setActiveIndex(matches.length)} onClick={() => onCreate(query.trim())}>Crear etiqueta “{query.trim()}”</button>}
      {!matches.length && !normalizedQuery && <span>No hay etiquetas activas disponibles.</span>}
    </div>}
  </div>;
}

function CreateLabelModal({ name, open, onClose, onCreate }) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [draftName, setDraftName] = useState('');
  useEffect(() => { if (open) { setError(''); setDraftName(name); } }, [open, name]);
  async function submit(event) {
    event.preventDefault();
    if (!draftName.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await onCreate({ name: draftName.trim(), slug: slugify(draftName), label_scope: 'document' });
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'No fue posible crear la etiqueta. Corrige el nombre e intenta nuevamente.'));
    } finally { setSubmitting(false); }
  }
  const preview = draftName.trim() || 'Nueva etiqueta';
  return <Dialog open={open} onOpenChange={(next) => { if (!next && !submitting) onClose(); }}><DialogContent className="legal-config-creation-dialog"><DialogHeader className="legal-config-creation-hero"><span className="legal-config-creation-eyebrow">Catálogo documental</span><DialogTitle>Crear etiqueta</DialogTitle><DialogDescription>Clasifica documentos sin alterar su tipología ni su código.</DialogDescription></DialogHeader><form className="legal-config-modal-form legal-config-creation-form" onSubmit={submit}>{error && <DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert>}<DovelaField label="Nombre de la etiqueta" required><DovelaInput aria-label="Nombre de la etiqueta" value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="Ej. Control técnico" autoFocus required /><small className="legal-config-field-help">Use un nombre corto que facilite filtrar y agrupar documentos.</small></DovelaField><section className="legal-config-creation-preview" aria-label="Vista previa de la etiqueta"><span>Vista previa</span><div><DovelaBadge tone="outline">{preview}</DovelaBadge><small>Disponible para documentos</small></div></section><DialogFooter><DovelaButton type="button" tone="neutral" onClick={onClose} disabled={submitting}>Cancelar</DovelaButton><DovelaButton type="submit" tone="primary" loading={submitting} disabled={!draftName.trim()}>Crear etiqueta</DovelaButton></DialogFooter></form></DialogContent></Dialog>;
}
function LabelManagerModal({ open, labels, documents, onClose, onUpdate, onCreate }) {
  const [query, setQuery] = useState(''); const [draft, setDraft] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const visible = labels.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  async function save() { if (!draft?.name?.trim()) return; setBusy(true); setError(''); try { if (draft.id) await onUpdate(draft, { name: draft.name.trim(), slug: slugify(draft.name) }); else await onCreate({ name: draft.name.trim(), slug: slugify(draft.name), label_scope: 'document' }); setDraft(null); } catch (err) { setError(extractErrorMessage(err, 'No fue posible guardar la etiqueta.')); } finally { setBusy(false); } }
  async function deactivate(item) { if (!window.confirm(`¿Desactivar la etiqueta “${item.name}”? Sus vínculos históricos se conservan.`)) return; setBusy(true); setError(''); try { await onUpdate(item, { is_active: false }); } catch (err) { setError(extractErrorMessage(err, 'No fue posible desactivar la etiqueta.')); } finally { setBusy(false); } }
  return <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}><DialogContent className="legal-config-detail-dialog legal-config-manager-dialog"><DialogHeader><DialogTitle>Gestionar etiquetas</DialogTitle><DialogDescription>Crea, edita o desactiva etiquetas sin abrir ventanas encima de esta.</DialogDescription></DialogHeader>{error && <DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert>}<div className="legal-config-manager-toolbar"><DovelaInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar etiqueta" aria-label="Buscar etiqueta"/><DovelaButton tone="primary" size="sm" onClick={() => { setError(''); setDraft({ name: '' }); }}>Nueva etiqueta</DovelaButton></div>{draft && <section className="legal-config-manager-editor"><DovelaInput autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Nombre de la etiqueta" aria-label="Nombre de la etiqueta"/><div><DovelaButton size="sm" tone="neutral" onClick={() => setDraft(null)}>Cancelar</DovelaButton><DovelaButton size="sm" tone="primary" loading={busy} onClick={save}>{draft.id ? 'Guardar' : 'Crear'}</DovelaButton></div></section>}<DovelaDataTable ariaLabel="Etiquetas documentales" emptyMessage="No hay etiquetas." rows={visible.map((item) => ({ ...item, key: item.id }))} columns={[{ key:'name', header:'Etiqueta', render:(item)=><strong>{item.name}</strong> }, { key:'documents', header:'En documentos', render:(item)=>documents.filter((doc)=>(doc.label_ids||[]).includes(item.id)).length }, { key:'is_active', header:'Estado', render:(item)=>item.is_active===false?'Desactivada':'Activa' }, { key:'actions', header:'Acciones', render:(item)=><div className="legal-config-definition-row-actions"><DovelaButton tone="neutral" size="sm" disabled={busy} onClick={()=>setDraft(item)}>Editar</DovelaButton><DovelaButton tone="danger" size="sm" disabled={busy||item.is_active===false} onClick={()=>deactivate(item)}>Desactivar</DovelaButton></div> }]} /><DialogFooter><DovelaButton tone="neutral" onClick={onClose} disabled={busy}>Cerrar</DovelaButton></DialogFooter></DialogContent></Dialog>;
}

function DocumentDefinitionModal({ open, mode: initialMode = 'standalone', parent, typologies, definition, labels, createdLabel, onClose, onCreate, onUpdate, onRequestCreateLabel, onCreatedLabelApplied }) {
  const [form, setForm] = useState({ name: '', description: '', labelIds: [], isRecord: false, supportNote: '', code: '', typologyId: '', suffix: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    const validationConfig = definition?.validation_config || {};
    setForm({
      name: definition?.name || '',
      description: definition?.description || '',
      labelIds: definition?.label_ids || [],
      isRecord: Boolean(definition?.is_record),
      supportNote: validationConfig.expected_support_note || '',
      code: definition?.code || '',
      typologyId: definition?.typology_id || '',
      suffix: definition?.code_suffix || '',
    });
    setError('');
    setFieldErrors({});
  }, [open, initialMode, parent?.id, definition?.id]);

  useEffect(() => {
    if (createdLabel?.id) {
      setForm((current) => current.labelIds.includes(createdLabel.id) ? current : { ...current, labelIds: [...current.labelIds, createdLabel.id] });
      onCreatedLabelApplied();
    }
  }, [createdLabel?.id, onCreatedLabelApplied]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.name),
        description: form.description.trim() || null,
        label_ids: form.labelIds,
        is_record: form.isRecord,
        validation_config: { expected_support_note: form.supportNote.trim() || null },
        metadata: { ...(definition?.metadata || {}), source: 'legal-config-documentos-ui' },
      };
      if (!definition) {
        payload.mode = initialMode;
        if (initialMode === 'variant') {
          payload.parent_definition_id = parent?.id;
          payload.code_suffix = form.suffix.trim();
        } else {
          payload.code = form.code.trim().toUpperCase();
          payload.typology_id = form.typologyId || null;
        }
      }
      if (definition) await onUpdate(definition, payload);
      else await onCreate(payload);
      onClose();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, 'No fue posible guardar el documento. Corrige los campos marcados e intenta nuevamente.'));
      const errors = submitError?.response?.data?.errors || [];
      setFieldErrors(Object.fromEntries(errors.map((item) => [item.field, item.message || item.code || 'Valor inválido'])));
    } finally {
      setSubmitting(false);
    }
  }

  const isVariant = (initialMode === 'variant' && !definition) || Boolean(definition?.parent_definition_id);
  const title = definition ? 'Editar documento' : isVariant ? 'Nueva variante' : 'Nuevo documento';
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="legal-config-document-code-dialog">
        <DialogHeader>
          <DialogTitle className="legal-config-dialog-title-row">{title}</DialogTitle>
          <DialogDescription>{definition ? `${definition.code} · el código no se modifica.` : isVariant ? 'Crea una variante a partir del documento seleccionado.' : 'Registra el documento y luego clasifícalo, si corresponde.'}</DialogDescription>
        </DialogHeader>
        <form className="legal-config-modal-form" onSubmit={submit}>
          {error && <div aria-live="assertive"><DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert></div>}
          {definition && <DovelaField label="Código inmutable"><DovelaInput value={definition.code || ''} readOnly /></DovelaField>}
          {isVariant && <><DovelaField label="Documento padre"><DovelaInput value={parent?.code || ''} readOnly /></DovelaField><DovelaField label="Sufijo numérico" required><DovelaInput value={form.suffix} onChange={(event) => update('suffix', event.target.value)} aria-label="Sufijo numérico" inputMode="numeric" required autoFocus />{fieldErrors.code_suffix && <small role="alert">{fieldErrors.code_suffix}</small>}</DovelaField></>}
          {!definition && !isVariant && <DovelaField label="Código del documento" required><DovelaInput value={form.code} onChange={(event) => update('code', event.target.value)} aria-label="Código del documento" aria-invalid={Boolean(fieldErrors.code)} required autoFocus />{fieldErrors.code && <small role="alert">{fieldErrors.code}</small>}</DovelaField>}
          <DovelaField label="Nombre del documento" required><DovelaInput aria-label="Nombre del documento" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ej. Plano topográfico firmado" required={!definition} /></DovelaField>
          {!isVariant && <DovelaField label="Tipología del documento"><select className="legal-config-native-select" value={form.typologyId} onChange={(event) => update('typologyId', event.target.value)} aria-label="Tipología del documento" disabled={Boolean(definition)}><option value="">Sin tipología</option>{typologies.filter((item) => item.is_active !== false).map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select>{fieldErrors.typology_id && <small role="alert">{fieldErrors.typology_id}</small>}</DovelaField>}
          <LabelPicker labels={labels} value={form.labelIds} onChange={(labelIds) => update('labelIds', labelIds)} onCreate={onRequestCreateLabel} />
          <DovelaField label="Descripción de validación"><textarea className="legal-config-textarea" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Qué debe contener o cómo se reconoce este documento." rows={3} /></DovelaField>
          <DovelaField label="Nota de soporte esperado"><DovelaInput value={form.supportNote} onChange={(event) => update('supportNote', event.target.value)} placeholder="Ej. PDF firmado, plano legible, certificado vigente" /></DovelaField>
          <div className="legal-config-definition-switches"><label><input type="checkbox" checked={form.isRecord} onChange={(event) => update('isRecord', event.target.checked)} /> Es expediente/registro</label></div>
          <DialogFooter><DovelaButton type="button" tone="neutral" onClick={onClose} disabled={submitting}>Cancelar</DovelaButton><DovelaButton type="submit" tone="primary" loading={submitting} disabled={submitting || (isVariant && !parent?.code)}>{definition ? 'Guardar cambios' : isVariant ? 'Crear variante' : 'Crear documento'}</DovelaButton></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function TypologyManagerModal({ open, typologies, onClose, onCreate, onUpdate }) {
  const [query, setQuery] = useState(''); const [draft, setDraft] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const visible = typologies.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(query.toLowerCase()));
  async function save() { if (!draft?.code?.trim() || !draft?.name?.trim()) return; setBusy(true); setError(''); try { if (draft.id) await onUpdate(draft, { name:draft.name.trim(), description:draft.description?.trim()||null }); else await onCreate({ code:draft.code.trim().toUpperCase(), name:draft.name.trim(), description:draft.description?.trim()||null }); setDraft(null); } catch(err) { setError(extractErrorMessage(err,'No fue posible guardar la tipología.')); } finally { setBusy(false); } }
  async function deactivate(item) { if(!window.confirm(`¿Desactivar “${item.name}”?`)) return; setBusy(true); try { await onUpdate(item,{is_active:false}); } catch(err) { setError(extractErrorMessage(err,'No fue posible desactivar la tipología.')); } finally { setBusy(false); } }
  return <Dialog open={open} onOpenChange={(next)=>{if(!next&&!busy)onClose();}}><DialogContent className="legal-config-detail-dialog legal-config-manager-dialog"><DialogHeader><DialogTitle>Gestionar tipologías</DialogTitle><DialogDescription>Administra el catálogo en esta única ventana.</DialogDescription></DialogHeader>{error&&<DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert>}<div className="legal-config-manager-toolbar"><DovelaInput value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar tipología" aria-label="Buscar tipología"/><DovelaButton tone="primary" size="sm" onClick={()=>{setError('');setDraft({code:'',name:'',description:''});}}>Nueva tipología</DovelaButton></div>{draft&&<section className="legal-config-manager-editor"><DovelaInput autoFocus value={draft.code} disabled={Boolean(draft.id)} onChange={(e)=>setDraft({...draft,code:e.target.value})} placeholder="Prefijo" aria-label="Prefijo"/><DovelaInput value={draft.name} onChange={(e)=>setDraft({...draft,name:e.target.value})} placeholder="Nombre" aria-label="Nombre de tipología"/><div><DovelaButton size="sm" tone="neutral" onClick={()=>setDraft(null)}>Cancelar</DovelaButton><DovelaButton size="sm" tone="primary" loading={busy} onClick={save}>{draft.id?'Guardar':'Crear'}</DovelaButton></div></section>}<DovelaDataTable ariaLabel="Tipologías documentales" emptyMessage="No hay tipologías." rows={visible.map((item)=>({...item,key:item.id}))} columns={[{key:'code',header:'Prefijo'},{key:'name',header:'Tipología',render:(item)=><strong>{item.name}</strong>},{key:'is_active',header:'Estado',render:(item)=>item.is_active===false?'Desactivada':'Activa'},{key:'actions',header:'Acciones',render:(item)=><div className="legal-config-definition-row-actions"><DovelaButton tone="neutral" size="sm" disabled={busy} onClick={()=>setDraft(item)}>Editar</DovelaButton><DovelaButton tone="danger" size="sm" disabled={busy||item.is_active===false} onClick={()=>deactivate(item)}>Desactivar</DovelaButton></div> }]} /><DialogFooter><DovelaButton tone="neutral" onClick={onClose} disabled={busy}>Cerrar</DovelaButton></DialogFooter></DialogContent></Dialog>;
}

function DocumentsPane({ data, typologies, onCreateDefinition, onCreateVariant, onEdit, onDeactivate, onManageTypologies, onManageLabels }) {
  const [documentSearch, setDocumentSearch] = useState('');
  const [expanded, setExpanded] = useState([]);
  const documents = (data.documents || []).filter((item) => item.is_active !== false);
  const query = documentSearch.trim().toLowerCase();
  const visibleDocuments = documents.filter((item) => !query || [item.code, item.name, item.description].filter(Boolean).join(' ').toLowerCase().includes(query));
  const roots = visibleDocuments.filter((item) => !item.parent_definition_id);
  const typologyById = new Map(typologies.map((item) => [item.id, item]));
  const labelById = new Map((data.labels || []).map((item) => [item.id, item]));
  const variantsFor = (document) => documents.filter((item) => item.parent_definition_id === document.id);
  return <main className="legal-config-documents-layout legal-config-documents-layout--definitions" data-testid="legal-config-documents-pane"><DovelaCard as="section" className="legal-config-document-catalog"><header className="legal-config-document-catalog__header"><CompactTitle title="Documentos" help="Cada documento puede tener una tipología y una o varias etiquetas, de forma independiente." /><DovelaButton tone="primary" leadingIcon={Plus} onClick={() => onCreateDefinition('standalone')}>Nuevo documento</DovelaButton></header><div className="legal-config-document-toolbar"><DovelaInput value={documentSearch} onChange={(event) => setDocumentSearch(event.target.value)} placeholder="Buscar por código o nombre" aria-label="Buscar documentos" /><DovelaBadge tone="outline">{documents.length} activas</DovelaBadge></div><div className="legal-config-document-table-wrap"><table className="legal-config-document-table" aria-label="Documentos activos"><thead><tr><th>Código</th><th>Documento</th><th>Tipología</th><th>Etiquetas</th><th>Estado</th><th>Variantes</th><th>Acciones</th></tr></thead><tbody>{roots.length ? roots.flatMap((document) => {
    const variants = variantsFor(document);
    const isExpanded = expanded.includes(document.id);
    const context = document.typology_id ? typologyById.get(document.typology_id)?.name || 'Tipología no disponible' : 'Sin tipología';
    const row = <tr key={document.id}><td><strong>{document.code}</strong></td><td className="legal-config-document-table__name"><strong title={document.name}>{document.name}</strong></td><td>{context}</td><td className="legal-config-document-table__labels">{(document.label_ids || []).map((id, index) => <span key={id}>{index ? ' · ' : ''}{labelById.get(id)?.name || 'Etiqueta histórica'}</span>)}</td><td><span className="legal-config-document-table__status">Activa</span></td><td>{variants.length ? <DovelaButton tone="neutral" size="sm" aria-expanded={isExpanded} aria-label={`${isExpanded ? 'Ocultar' : 'Ver'} variantes de ${document.name}`} onClick={() => setExpanded((current) => current.includes(document.id) ? current.filter((id) => id !== document.id) : [...current, document.id])}>{variants.length} {variants.length === 1 ? 'variante' : 'variantes'}</DovelaButton> : <span className="legal-config-no-variants">—</span>}</td><td><span className="legal-config-definition-row-actions"><DovelaButton tone="neutral" size="sm" onClick={() => onEdit(document)}>Editar</DovelaButton><DovelaButton tone="neutral" size="sm" onClick={() => onCreateVariant(document)} aria-label={`Agregar variante a ${document.name}`}>Agregar variante</DovelaButton><DovelaButton tone="danger" size="sm" onClick={() => onDeactivate(document)}>Desactivar</DovelaButton></span></td></tr>;
    const variantRows = isExpanded ? [<tr key={`${document.id}-variants`} className="legal-config-variants-list-row"><td colSpan={7}><ul className="legal-config-variants-list" aria-label={`Variantes de ${document.name}`}>{variants.map((variant) => <li key={variant.id}><code>{variant.code}</code><div><strong>{variant.name}</strong><small>Variante de {document.code}</small></div><span className="legal-config-definition-row-actions"><DovelaButton tone="neutral" size="sm" onClick={() => onEdit(variant)}>Editar variante</DovelaButton><DovelaButton tone="danger" size="sm" onClick={() => onDeactivate(variant)}>Desactivar variante</DovelaButton></span></li>)}</ul></td></tr>] : [];
    return [row, ...variantRows];
  }) : <tr><td colSpan={7} className="dovela-data-table__empty">No hay documentos activos. Crea el primer documento para comenzar.</td></tr>}</tbody></table></div></DovelaCard><DovelaCard as="aside" className="legal-config-document-inspector"><CompactTitle title="Catálogos" kicker="Documentos" /><DovelaInlineAlert tone="info">Tipología y etiquetas son campos independientes de cada documento.</DovelaInlineAlert><div className="legal-config-document-action-stack"><DovelaButton tone="neutral" fullWidth leadingIcon={Layers} onClick={onManageTypologies}>Gestionar tipologías</DovelaButton><DovelaButton tone="neutral" fullWidth leadingIcon={Tags} onClick={onManageLabels}>Gestionar etiquetas</DovelaButton></div></DovelaCard></main>;
}
export default function LegalConfigInitialPage() {
  const [data, setData] = useState(EMPTY_DATA);
  const [activePane, setActivePane] = useState(ACTUATIONS_PANE);
  const [selectedActuationId, setSelectedActuationId] = useState('');
  const [modal, setModal] = useState(null);
  const [detailNode, setDetailNode] = useState(null);
  const [deactivateCandidate, setDeactivateCandidate] = useState(null);
  const [definitionCode, setDefinitionCode] = useState(null);
  const [editingDefinition, setEditingDefinition] = useState(null);
  const [labelNameToCreate, setLabelNameToCreate] = useState('');
  const [createdLabel, setCreatedLabel] = useState(null);
  const [labelsManagerOpen, setLabelsManagerOpen] = useState(false);
  const [typologiesManagerOpen, setTypologiesManagerOpen] = useState(false);
  const [documentMode, setDocumentMode] = useState('standalone');
  const [documentParent, setDocumentParent] = useState(null);
  const [documentDeactivateCandidate, setDocumentDeactivateCandidate] = useState(null);
  const [documentDeactivateError, setDocumentDeactivateError] = useState('');
  const [typologies, setTypologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [zoom, setZoom] = useState(1);
  const loadRequestIdRef = useRef(0);

  const allActuations = data.actuationTypes;
  const selectedNode = useMemo(() => allActuations.find((item) => item.id === selectedActuationId) || allActuations[0] || null, [allActuations, selectedActuationId]);
  const relationItemsByType = { document: data.documents, text: data.texts, typology: typologies, label: data.labels };
  const activeRelationType = relationItemsByType[modal] ? modal : 'document';


  async function loadData() {
    const requestId = ++loadRequestIdRef.current;
    setLoading(true);
    setErrorMessage('');
    try {
      const responses = await Promise.allSettled([
        LegalConfigService.listActuationTypes({ is_active: true }),
        LegalConfigService.listDocumentDefinitions({ is_active: true }),
        LegalConfigService.listDocumentCodes({ is_active: true }),
        LegalConfigService.listConfigurationLabels(),
        LegalConfigService.listLegalTexts({ is_active: true }),
        LegalConfigService.listReadContracts({ is_active: true }),
        LegalConfigService.listAssertions({ is_active: true }),
        LegalConfigService.listRules(),
        LegalConfigService.listDocumentTypologies({ is_active: true }),
      ]);
      const [actuations, documents, labels, texts, contracts, assertions, rules, nextTypologies] = responses.map((result) => result.status === 'fulfilled' ? result.value : null);
      const failures = responses.filter((result) => result.status === 'rejected');
      if (!documents) throw failures[0]?.reason || new Error('No fue posible cargar el catálogo documental.');

      // Una respuesta puede resolver fuera de orden si se dispara un loadData()
      // nuevo (crear tipo, relacionar, "Actualizar") antes de que termine uno
      // anterior. Si ya no somos la llamada más reciente, no pisamos el estado.
      if (requestId !== loadRequestIdRef.current) return true;

      const nextDocumentCodes = responseData(documentCodes, []);
      const nextData = {
        actuationTypes: responseData(actuations, []),
        documentCodes: nextDocumentCodes,
        documents: responseData(documents, []).map((definition) => normalizeDocumentDefinition(definition, nextDocumentCodes)),
        labels: responseData(labels, []),
        texts: responseData(texts, []),
        readContracts: responseData(contracts, []),
        assertions: responseData(assertions, []),
        rules: responseData(rules, {}),
      };
      setData(nextData);
      setTypologies(responseData(nextTypologies, []));
      setSelectedActuationId((current) => current || nextData.actuationTypes[0]?.id || '');
      return true;
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) return true;
      setErrorMessage(extractErrorMessage(error, 'No fue posible cargar la configuración.'));
      return false;
    } finally {
      if (requestId === loadRequestIdRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createType(payload) {
    const response = await LegalConfigService.createActuationType(payload);
    const refreshed = await loadData();
    const createdId = response?.data?.id;
    if (createdId) setSelectedActuationId(createdId);
    if (!refreshed) throw new Error('El tipo se creó, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }


  async function createDocumentDefinition(payload) {
    const response = await LegalConfigService.createDocumentDefinition(payload);
    const refreshed = await loadData();
    if (!refreshed) throw new Error('La definición se creó, pero no fue posible actualizar la vista. Usa "Actualizar".');
    return response;
  }

  async function proposeDocumentCode(payload) {
    return LegalConfigService.proposeDocumentCode(payload);
  }

  async function createDocumentTypology(payload) {
    await LegalConfigService.createDocumentTypology(normalizeTypologyPayload(payload));
    if (!await loadData()) throw new Error('La tipología se creó, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }

  async function updateDocumentTypology(typology, payload) {
    await LegalConfigService.updateDocumentTypology(typology.id, payload);
    if (!await loadData()) throw new Error('La tipología se actualizó, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }

  async function createConfigurationLabel(payload) {
    const response = await LegalConfigService.createConfigurationLabel(normalizeLabelPayload(payload));
    const label = response?.data;
    if (label) setData((current) => ({ ...current, labels: [...current.labels, label] }));
    return label;
  }

  async function createQuickLabel(name) {
    const label = await createConfigurationLabel({ name: name.trim(), slug: slugify(name), label_scope: 'document' });
    if (label) setCreatedLabel(label);
    return label;
  }

  async function updateConfigurationLabel(label, payload) {
    await LegalConfigService.updateConfigurationLabel(label.id, payload);
    const refreshed = await loadData();
    if (!refreshed) throw new Error('La etiqueta se actualizó, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }

  function openDefinitionModal(mode = 'standalone', parent = null) {
    setDocumentMode(mode);
    setDocumentParent(parent);
    setDefinitionCode(null);
    setModal('document-definition');
  }

  function editDocumentDefinitionFromTable(definition) {
    setEditingDefinition(definition);
    setDocumentMode(definition.parent_definition_id ? 'variant' : definition.typology_id ? 'typology' : 'standalone');
    setDocumentParent(data.documents.find((item) => item.id === definition.parent_definition_id) || null);
    setModal('document-definition');
  }


  async function deactivateDocumentDefinition(definition) {
    if (!definition?.id) return;
    const variants = data.documents.filter((item) => item.parent_definition_id === definition.id && item.is_active !== false);
    if (variants.length) throw new Error('Desactiva primero las variantes activas de este documento.');
    await LegalConfigService.updateDocumentDefinition(definition.id, { is_active: false });
    const refreshed = await loadData();
    if (!refreshed) throw new Error('La definición se desactivó, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }


  async function updateDocumentDefinition(definition, payload) {
    await LegalConfigService.updateDocumentDefinition(definition.id, payload);
    const refreshed = await loadData();
    if (!refreshed) throw new Error('La definición se actualizó, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }


  async function replaceDocumentDefinition(previous, next) {
    if (!previous?.id || !next?.id) return;
    await LegalConfigService.updateDocumentDefinition(previous.id, {
      is_active: false,
      metadata: {
        ...(previous.metadata || {}),
        lifecycle: { status: 'replaced', replaced_by_definition_id: next.id, replaced_at: new Date().toISOString() },
      },
    });
    const refreshed = await loadData();
    if (!refreshed) throw new Error('La definición se reemplazó, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }

  async function saveRelation(type, item) {
    if (!selectedNode || !item) return;
    const basePayload = { actuation_type_id: selectedNode.id };
    if (type === 'document') {
      await LegalConfigService.createActuationDocumentRule({ ...basePayload, document_id: item.id });
    } else if (type === 'text') {
      await LegalConfigService.createActuationTextRule({ ...basePayload, text_id: item.id });
    } else if (type === 'typology') {
      const typologyIds = Array.from(new Set([...(selectedNode.document_typologies || []).map((typology) => typology.id), item.id]));
      await LegalConfigService.updateActuationType(selectedNode.id, {
        name: selectedNode.name, slug: selectedNode.slug || slugify(selectedNode.name), description: selectedNode.description || null,
        parent_id: selectedNode.parent_id || null, node_type: selectedNode.node_type || 'actuation',
        is_selectable: selectedNode.is_selectable !== false, is_active: selectedNode.is_active !== false,
        sort_order: Number(selectedNode.sort_order || 0), incompatible_actuation_type_ids: selectedNode.incompatible_actuation_type_ids || [],
        metadata: getMetadata(selectedNode), typology_ids: typologyIds,
      });
    } else if (type === 'label') {
      if (item.label_scope === 'text') {
        await LegalConfigService.createActuationTextsByLabelRule({ ...basePayload, label_id: item.id });
      } else {
        await LegalConfigService.createActuationDocumentsByLabelRule({ ...basePayload, label_id: item.id });
      }
    }
  }

  async function addRelation(type, item) {
    await saveRelation(type, item);
    const refreshed = await loadData();
    if (!refreshed) throw new Error('La relación se guardó, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }

  async function deactivateActuation(node) {
    const payload = {
      name: node.name,
      slug: node.slug || slugify(node.name),
      description: node.description || null,
      parent_id: node.parent_id || null,
      node_type: node.node_type || 'actuation',
      is_selectable: node.is_selectable !== false,
      is_active: false,
      sort_order: Number(node.sort_order || 0),
      incompatible_actuation_type_ids: node.incompatible_actuation_type_ids || [],
      metadata: node.metadata || {},
    };
    await LegalConfigService.updateActuationType(node.id, payload);
    const refreshed = await loadData();
    if (!refreshed) throw new Error('La actuación se desactivó, pero no fue posible actualizar la vista. Usa "Actualizar".');
    setSelectedActuationId((current) => (current === node.id ? '' : current));
  }

  async function deleteRelation(ruleType, ruleId) {
    await LegalConfigService.deleteRule(ruleType, ruleId);
    const refreshed = await loadData();
    if (!refreshed) throw new Error('La relación se quitó, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }


  function handleNodeClick(node) {
    setSelectedActuationId(node.id);
  }

  function openDetail(node = selectedNode) {
    if (!node) return;
    setSelectedActuationId(node.id);
    setDetailNode(node);
  }

  return (
    <TooltipProvider delayDuration={180}>
    <section className="legal-config-page legal-config-page--simple" data-testid="legal-config-page">
      <DovelaPageHeader
        eyebrow="Configuración aislada"
        title="Configuración de actuaciones"
        actions={
          <DovelaButton tone="neutral" leadingIcon={RefreshCw} loading={loading} onClick={loadData}>
            Actualizar
          </DovelaButton>
        }
      />

      <nav className="legal-config-pane-nav" aria-label="Ventanas de configuración">
        {PANES.map((pane) => (
          <DovelaButton
            key={pane}
            tone={activePane === pane ? 'primary' : 'neutral'}
            className={activePane === pane ? 'is-active' : ''}
            onClick={() => setActivePane(pane)}
            aria-pressed={activePane === pane}
          >
            {pane}
          </DovelaButton>
        ))}
      </nav>

      {errorMessage && (
        <DovelaInlineAlert tone="danger" icon={AlertTriangle}>
          {errorMessage}
        </DovelaInlineAlert>
      )}

      {activePane === 'Resolución' && (
        <DovelaInlineAlert tone="info" icon={Scale} title={activePane}>
          Ventana reservada para la siguiente fase.
        </DovelaInlineAlert>
      )}

      {activePane === ACTUATIONS_PANE && (
        <main className="legal-config-actuation-layout">
          <ActuationGraph nodes={allActuations} selectedNode={selectedNode} selectedId={selectedNode?.id || ''} onNodeClick={handleNodeClick} onDeactivateSelected={setDeactivateCandidate} zoom={zoom} setZoom={setZoom} />
          <ActionPanel
            selectedNode={selectedNode}
            data={data}
            typologies={typologies}
            onOpen={setModal}
            onOpenDetail={openDetail}
            onSelectNode={handleNodeClick}
          />
        </main>
      )}

      {activePane === 'Documentos' && (
        <DocumentsPane
          data={data}
          typologies={typologies}
          onCreateDefinition={(mode) => openDefinitionModal(mode)}
          onCreateVariant={(parent) => openDefinitionModal('variant', parent)}
          onEdit={editDocumentDefinitionFromTable}
          onDeactivate={(definition) => { setDocumentDeactivateError(''); setDocumentDeactivateCandidate(definition); }}
          onManageTypologies={() => setTypologiesManagerOpen(true)}
          onManageLabels={() => setLabelsManagerOpen(true)}
        />
      )}

      <CreateTypeModal
        open={modal === 'create'}
        actuations={allActuations}
        defaultParentId={selectedNode?.id || ''}
        onClose={() => setModal(null)}
        onCreate={createType}
      />
      <DocumentDefinitionModal
        open={modal === 'document-definition'}
        mode={documentMode}
        parent={documentParent}
        typologies={typologies}
        definition={editingDefinition}
        labels={data.labels}
        createdLabel={createdLabel}
        onClose={() => { setModal(null); setEditingDefinition(null); setCreatedLabel(null); setDocumentParent(null); }}
        onCreate={createDocumentDefinition}
        onUpdate={updateDocumentDefinition}
        onProposeCode={proposeDocumentCode}
        onRequestCreateLabel={(name) => createQuickLabel(name)}
        onCreatedLabelApplied={() => setCreatedLabel(null)}
      />
      <CreateLabelModal open={Boolean(labelNameToCreate)} name={labelNameToCreate} onClose={() => setLabelNameToCreate('')} onCreate={async (payload) => { const label = await createConfigurationLabel(payload); setCreatedLabel(label); }} />
      <LabelManagerModal open={labelsManagerOpen} labels={data.labels} documents={data.documents} onClose={() => setLabelsManagerOpen(false)} onUpdate={updateConfigurationLabel} />
      <TypologyManagerModal open={typologiesManagerOpen} typologies={typologies} onClose={() => setTypologiesManagerOpen(false)} onCreate={createDocumentTypology} onUpdate={updateDocumentTypology} />
      <Dialog open={Boolean(documentDeactivateCandidate)} onOpenChange={(next) => { if (!next) setDocumentDeactivateCandidate(null); }}><DialogContent><DialogHeader><DialogTitle>Desactivar definición</DialogTitle><DialogDescription>La definición dejará de estar activa, pero se conserva para trazabilidad.</DialogDescription></DialogHeader>{documentDeactivateError && <div aria-live="assertive"><DovelaInlineAlert tone="danger">{documentDeactivateError}</DovelaInlineAlert></div>}<DialogFooter><DovelaButton tone="neutral" onClick={() => setDocumentDeactivateCandidate(null)}>Cancelar</DovelaButton><DovelaButton tone="danger" onClick={async () => { try { await deactivateDocumentDefinition(documentDeactivateCandidate); setDocumentDeactivateCandidate(null); } catch (error) { setDocumentDeactivateError(extractErrorMessage(error, 'No fue posible desactivar la definición. Intenta nuevamente.')); } }}>Desactivar definición</DovelaButton></DialogFooter></DialogContent></Dialog>
      <RelationModal
        open={['document', 'text', 'typology', 'label'].includes(modal)}
        relationType={activeRelationType}
        items={relationItemsByType[activeRelationType]}
        onClose={() => setModal(null)}
        onSave={addRelation}
      />
      <ActuationDetailModal
        open={Boolean(detailNode)}
        node={detailNode}
        data={data}
        onClose={() => setDetailNode(null)}
        onOpenRelation={setModal}
        onDeactivateActuation={setDeactivateCandidate}
        onDeleteRelation={deleteRelation}
      />
      <DeactivateActuationModal
        open={Boolean(deactivateCandidate)}
        node={deactivateCandidate}
        data={data}
        onClose={() => setDeactivateCandidate(null)}
        onConfirm={deactivateActuation}
      />
    </section>
    </TooltipProvider>
  );
}
