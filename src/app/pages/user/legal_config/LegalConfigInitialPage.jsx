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


const DOCUMENT_CATEGORY_LABELS = {
  common: 'Común',
  technical: 'Técnico',
  legal: 'Jurídico',
  predial: 'Predial',
  payment: 'Pago / expensas',
  form: 'Formulario',
  other: 'Otro',
};

const DOCUMENT_SCOPE_LABELS = {
  general: 'General',
  subdivision: 'Subdivisión',
  construction: 'Construcción',
  parcelacion: 'Parcelación',
  reconocimiento: 'Reconocimiento',
  urbanismo: 'Urbanismo',
  other: 'Otro',
};

const SUPPORT_TYPE_LABELS = {
  pdf: 'PDF',
  plan: 'Plano',
  form: 'Formulario',
  receipt: 'Recibo',
  certificate: 'Certificado',
  image: 'Imagen',
  physical: 'Físico',
  other: 'Otro',
};

function getMetadata(row) {
  if (!row?.metadata) return {};
  if (typeof row.metadata === 'string') {
    try { return JSON.parse(row.metadata) || {}; } catch { return {}; }
  }
  return row.metadata || {};
}

function getDocumentCodeStatus(code) {
  const metadata = getMetadata(code);
  if (code?.is_active === false) return 'desactivado';
  if (metadata.status === 'replaced') return 'reemplazado';
  return 'activo';
}

function getDocumentCodeLabel(code) {
  return code ? `${code.code} · ${code.name}` : 'Sin código documental';
}


function getLabelMetadata(label) {
  return getMetadata(label);
}

function getCodeGroupLabel(code, labels = []) {
  const sourceGroupKey = getMetadata(code).source_group_key;
  const group = labels.find((label) => getLabelMetadata(label).source_group_key === sourceGroupKey);
  return group?.name || sourceGroupKey || 'Sin agrupación V.U.';
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

function ActionPanel({ selectedNode, data, onOpen, onOpenDetail, onSelectNode }) {
  const relations = useMemo(() => getActuationRelations(selectedNode?.id, data), [selectedNode, data]);
  const children = useMemo(
    () => data.actuationTypes.filter((item) => item.parent_id === selectedNode?.id),
    [data.actuationTypes, selectedNode?.id],
  );
  const parent = data.actuationTypes.find((item) => item.id === selectedNode?.parent_id);
  const hasRelations = relations.documents.length + relations.texts.length > 0;

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
        <div><strong>{relations.documents.length}</strong><span>Docs</span></div>
        <div><strong>{relations.texts.length}</strong><span>Resolución</span></div>
      </div>

      <DovelaInlineAlert tone={hasRelations ? 'success' : 'info'}>
        {selectedNode
          ? hasRelations
            ? 'Esta actuación ya tiene reglas asociadas. Revisa el detalle para decidir si heredan o aplican directamente.'
            : 'Esta actuación no tiene relaciones directas: crea hijas o agrega documentos/textos según el modelo.'
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
          <DovelaButton tone="neutral" size="sm" leadingIcon={Tags} disabled={!selectedNode} onClick={() => onOpen('label')}>Etiqueta</DovelaButton>
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

function DocumentCodeModal({ open, codes, defaultParentId, onClose, onCreate }) {
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    parentId: defaultParentId || '',
    category: 'technical',
    scope: 'general',
    supportType: 'pdf',
    normativeSource: '',
    version: '1',
    aliases: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        code: '',
        name: '',
        description: '',
        parentId: defaultParentId || '',
        category: 'technical',
        scope: 'general',
        supportType: 'pdf',
        normativeSource: '',
        version: '1',
        aliases: '',
      });
      setError('');
    }
  }, [open, defaultParentId]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    if (!code || !form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await onCreate({
        code,
        name: form.name.trim(),
        description: form.description.trim() || null,
        parent_id: form.parentId || null,
        metadata: {
          status: 'active',
          category: form.category,
          scope: form.scope,
          support_type: form.supportType,
          normative_source: form.normativeSource.trim() || null,
          version: form.version.trim() || '1',
          aliases: form.aliases.split(',').map((item) => item.trim()).filter(Boolean),
        },
      });
      onClose();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, 'No fue posible crear el código documental.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="legal-config-document-code-dialog">
        <DialogHeader>
          <DialogTitle className="legal-config-dialog-title-row">
            Crear código documental
            <InfoTooltip label="Ayuda sobre código documental">Identificador estable del requisito. Sirve para trazabilidad, migración, reglas y validaciones sin depender del nombre visible.</InfoTooltip>
          </DialogTitle>
          <DialogDescription>Registra el código base del catálogo.</DialogDescription>
        </DialogHeader>
        <form className="legal-config-modal-form" onSubmit={submit}>
          {error && <DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert>}
          <div className="legal-config-document-form-grid">
            <DovelaField label="Código documental">
              <DovelaInput value={form.code} onChange={(event) => update('code', event.target.value)} placeholder="Ej. DOC-SUB-PLA-001" autoFocus />
            </DovelaField>
            <DovelaField label="Nombre visible">
              <DovelaInput value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ej. Plano topográfico de subdivisión" />
            </DovelaField>
            <DovelaField label="Código padre / agrupador">
              <select className="legal-config-native-select" value={form.parentId} onChange={(event) => update('parentId', event.target.value)}>
                <option value="">Sin código padre</option>
                {codes.map((item) => <option key={item.id} value={item.id}>{getDocumentCodeLabel(item)}</option>)}
              </select>
            </DovelaField>
            <DovelaField label="Categoría">
              <select className="legal-config-native-select" value={form.category} onChange={(event) => update('category', event.target.value)}>
                {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </DovelaField>
            <DovelaField label="Ámbito">
              <select className="legal-config-native-select" value={form.scope} onChange={(event) => update('scope', event.target.value)}>
                {Object.entries(DOCUMENT_SCOPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </DovelaField>
            <DovelaField label="Tipo de soporte">
              <select className="legal-config-native-select" value={form.supportType} onChange={(event) => update('supportType', event.target.value)}>
                {Object.entries(SUPPORT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </DovelaField>
            <DovelaField label="Versión">
              <DovelaInput value={form.version} onChange={(event) => update('version', event.target.value)} placeholder="1" />
            </DovelaField>
            <DovelaField label="Fuente normativa">
              <DovelaInput value={form.normativeSource} onChange={(event) => update('normativeSource', event.target.value)} placeholder="Decreto, resolución o manual interno" />
            </DovelaField>
          </div>
          <DovelaField label="Alias o códigos anteriores">
            <DovelaInput value={form.aliases} onChange={(event) => update('aliases', event.target.value)} placeholder="Separados por coma" />
          </DovelaField>
          <DovelaField label="Descripción funcional">
            <textarea className="legal-config-textarea" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Qué exige este documento y cuándo se reconoce como válido." rows={3} />
          </DovelaField>
          <DialogFooter>
            <DovelaButton type="button" tone="neutral" onClick={onClose} disabled={submitting}>Cancelar</DovelaButton>
            <DovelaButton type="submit" tone="primary" loading={submitting}>Crear código</DovelaButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DocumentDefinitionModal({ open, code, definition, labels, onClose, onCreate, onUpdate }) {
  const [form, setForm] = useState({ name: '', description: '', labelIds: [], isRecord: false, supportNote: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      const baseName = definition?.name || code?.name || '';
      const validationConfig = definition?.validation_config || {};
      setForm({
        name: baseName,
        description: definition?.description || '',
        labelIds: definition?.label_ids || [],
        isRecord: Boolean(definition?.is_record),
        supportNote: validationConfig.expected_support_note || '',
      });
      setError('');
    }
  }, [open, code?.id, definition?.id]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleLabel(labelId) {
    setForm((current) => ({
      ...current,
      labelIds: current.labelIds.includes(labelId)
        ? current.labelIds.filter((item) => item !== labelId)
        : [...current.labelIds, labelId],
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!code || !form.name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.name),
        description: form.description.trim() || null,
        document_code_id: code.id,
        label_ids: form.labelIds,
        is_record: form.isRecord,
        validation_config: {
          expected_support_note: form.supportNote.trim() || null,
        },
        metadata: {
          ...(definition?.metadata || {}),
          source: 'legal-config-documentos-ui',
        },
      };
      if (definition) await onUpdate(definition, payload);
      else await onCreate(payload);
      onClose();
    } catch (submitError) {
      setError(extractErrorMessage(submitError, 'No fue posible crear la definición documental.'));
    } finally {
      setSubmitting(false);
    }
  }

  const documentLabels = labels.filter((label) => ['document', 'mixed'].includes(label.label_scope || 'mixed'));

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="legal-config-document-code-dialog">
        <DialogHeader>
          <DialogTitle className="legal-config-dialog-title-row">
            {definition ? 'Editar definición' : 'Nueva definición'}
            <InfoTooltip label="Qué es una definición documental">Describe cómo se pide y valida un documento concreto, colgando del código estable seleccionado.</InfoTooltip>
          </DialogTitle>
          <DialogDescription>{code ? code.code : 'Código documental'} · ficha operativa del documento.</DialogDescription>
        </DialogHeader>
        <form className="legal-config-modal-form" onSubmit={submit}>
          {error && <DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert>}
          <DovelaField label="Nombre de la definición">
            <DovelaInput value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ej. Plano topográfico firmado" autoFocus />
          </DovelaField>
          <DovelaField label="Descripción de validación">
            <textarea className="legal-config-textarea" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Qué debe contener o cómo se reconoce este documento." rows={3} />
          </DovelaField>
          <DovelaField label="Nota de soporte esperado">
            <DovelaInput value={form.supportNote} onChange={(event) => update('supportNote', event.target.value)} placeholder="Ej. PDF firmado, plano legible, certificado vigente" />
          </DovelaField>
          <div className="legal-config-definition-switches">
            <label><input type="checkbox" checked={form.isRecord} onChange={(event) => update('isRecord', event.target.checked)} /> Es expediente/registro</label>
          </div>
          {documentLabels.length > 0 && (
            <div className="legal-config-label-picker">
              <span>Etiquetas</span>
              <div>
                {documentLabels.map((label) => (
                  <button key={label.id} type="button" className={form.labelIds.includes(label.id) ? 'is-selected' : ''} onClick={() => toggleLabel(label.id)}>{label.name}</button>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <DovelaButton type="button" tone="neutral" onClick={onClose} disabled={submitting}>Cancelar</DovelaButton>
            <DovelaButton type="submit" tone="primary" loading={submitting} disabled={!code}>{definition ? 'Guardar cambios' : 'Crear definición'}</DovelaButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DefinitionsManagerModal({ open, code, definitions, onClose, onEdit, onReplace, onDeactivate }) {
  const [candidate, setCandidate] = useState(null);
  const [replacement, setReplacement] = useState(null);
  const activeDefinitions = definitions.filter((item) => item.is_active !== false);

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
        <DialogContent className="legal-config-detail-dialog legal-config-definitions-dialog">
          <DialogHeader>
            <DialogTitle>Definiciones</DialogTitle>
            <DialogDescription>{code ? `${code.code} · ${code.name}` : 'Código documental'} · fichas que precisan el código.</DialogDescription>
          </DialogHeader>
          <DovelaDataTable
            ariaLabel="Definiciones documentales"
            emptyMessage="Este código aún no tiene definiciones activas."
            columns={[
              { key: 'name', header: 'Definición', render: (item) => <div className="legal-config-definition-name"><strong>{item.name}</strong><small>{item.description || 'Sin detalle de validación'}</small></div> },
              { key: 'support', header: 'Soporte', render: (item) => <span>{item.validation_config?.expected_support_note || 'No definido'}</span> },
              { key: 'actions', header: 'Acciones', render: (item) => <div className="legal-config-definition-row-actions"><DovelaButton tone="neutral" size="sm" onClick={() => onEdit(item)}>Editar</DovelaButton><DovelaButton tone="neutral" size="sm" onClick={() => setReplacement(item)}>Reemplazar definición</DovelaButton><DovelaButton tone="danger" size="sm" leadingIcon={PowerOff} onClick={() => setCandidate(item)}>Desactivar definición</DovelaButton></div> },
            ]}
            rows={activeDefinitions.map((item) => ({ ...item, key: item.id }))}
          />
          <DialogFooter><DovelaButton tone="neutral" onClick={onClose}>Cerrar</DovelaButton></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(replacement)} onOpenChange={(nextOpen) => { if (!nextOpen) setReplacement(null); }}>
        <DialogContent className="legal-config-deactivate-dialog">
          <DialogHeader>
            <DialogTitle>Reemplazar definición</DialogTitle>
            <DialogDescription>La definición anterior se desactiva y conserva el vínculo con la nueva. No se elimina historial.</DialogDescription>
          </DialogHeader>
          {replacement && <div className="legal-config-modal-form"><DovelaField label="Nueva definición"><select className="legal-config-native-select" defaultValue="" onChange={(event) => { const next = activeDefinitions.find((item) => item.id === event.target.value); setReplacement((current) => ({ ...current, replacementId: next?.id || '' })); }}><option value="">Selecciona la definición que la reemplaza</option>{activeDefinitions.filter((item) => item.id !== replacement.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></DovelaField></div>}
          <DialogFooter><DovelaButton tone="neutral" onClick={() => setReplacement(null)}>Cancelar</DovelaButton><DovelaButton tone="primary" disabled={!replacement?.replacementId} onClick={async () => { const next = activeDefinitions.find((item) => item.id === replacement.replacementId); await onReplace(replacement, next); setReplacement(null); onClose(); }}>Confirmar reemplazo</DovelaButton></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(candidate)} onOpenChange={(nextOpen) => { if (!nextOpen) setCandidate(null); }}>
        <DialogContent className="legal-config-deactivate-dialog">
          <DialogHeader><DialogTitle>Desactivar definición</DialogTitle><DialogDescription>La definición se conserva para trazabilidad; no se elimina.</DialogDescription></DialogHeader>
          {candidate && <DovelaInlineAlert tone="warning" icon={AlertTriangle}>Se desactivará: <strong>{candidate.name}</strong>.</DovelaInlineAlert>}
          <DialogFooter><DovelaButton tone="neutral" onClick={() => setCandidate(null)}>Cancelar</DovelaButton><DovelaButton tone="danger" leadingIcon={PowerOff} onClick={async () => { await onDeactivate(candidate); setCandidate(null); onClose(); }}>Desactivar</DovelaButton></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DocumentsPane({ data, selectedCodeId, onSelectCode, onCreateCode, onCreateDefinition, onManageDefinitions }) {
  const [documentSearch, setDocumentSearch] = useState('');
  const codes = data.documentCodes || [];
  const selectedCode = codes.find((item) => item.id === selectedCodeId) || codes[0] || null;
  const selectedMetadata = getMetadata(selectedCode);
  const childCodes = codes.filter((item) => item.parent_id === selectedCode?.id);
  const parentCode = codes.find((item) => item.id === selectedCode?.parent_id) || null;
  const selectedGroupLabel = getCodeGroupLabel(selectedCode, data.labels);
  const linkedDocuments = data.documents.filter((item) => item.document_code_id === selectedCode?.id);
  const linkedLabelIds = [...new Set(linkedDocuments.flatMap((item) => item.label_ids || []))];
  const linkedLabels = data.labels.filter((item) => linkedLabelIds.includes(item.id));
  const relationRules = [
    ...(data.rules?.actuation_documents || []),
    ...(data.rules?.actuation_documents_by_labels || []),
  ].filter((rule) => {
    if (rule.document_id) return linkedDocuments.some((doc) => doc.id === rule.document_id) && rule.is_active !== false;
    return false;
  });
  const actuationById = new Map((data.actuationTypes || []).map((item) => [item.id, item]));
  const ruleApplications = relationRules.map((rule) => ({ ...rule, actuation: actuationById.get(rule.actuation_type_id) }));
  const query = documentSearch.trim().toLowerCase();
  const visibleCodes = codes.filter((item) => {
    if (!query) return true;
    const metadata = getMetadata(item);
    return [item.code, item.name, item.description, metadata.category, metadata.scope, ...(metadata.aliases || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  return (
    <main className="legal-config-documents-layout" data-testid="legal-config-documents-pane">
      <DovelaCard as="section" className="legal-config-document-catalog">
        <header className="legal-config-document-catalog__header">
          <CompactTitle
            title="Códigos documentales"
            help="Primero se gobierna el código estable. Después vienen definiciones, etiquetas, reglas por actuación y validaciones."
          />
          <DovelaButton tone="primary" leadingIcon={Plus} onClick={onCreateCode}>Nuevo código</DovelaButton>
        </header>

        <div className="legal-config-document-toolbar">
          <DovelaInput value={documentSearch} onChange={(event) => setDocumentSearch(event.target.value)} placeholder="Buscar por código, nombre, alias o ámbito" />
          <DovelaBadge tone="outline">{codes.length} códigos</DovelaBadge>
        </div>

        <div className="legal-config-document-table-wrap">
          <table className="legal-config-document-table" aria-label="Códigos documentales">
            <thead>
              <tr>
                <th>Código</th>
                <th>Relación</th>
                <th>Documento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {visibleCodes.length ? visibleCodes.map((code) => {
                const metadata = getMetadata(code);
                const isSelected = selectedCode?.id === code.id;
                return (
                  <tr key={code.id} className={isSelected ? 'is-selected' : ''} onClick={() => onSelectCode(code.id)}>
                    <td><button type="button" onClick={() => onSelectCode(code.id)}>{code.code}</button></td>
                    <td><small className="legal-config-code-relation">{code.parent_id ? `Subcódigo de ${codes.find((item) => item.id === code.parent_id)?.code || 'código documental'}` : getCodeGroupLabel(code, data.labels)}</small></td>
                    <td><strong>{code.name}</strong><small>{code.description || 'Sin descripción'}</small></td>
                    <td><DovelaBadge tone={getDocumentCodeStatus(code) === 'activo' ? 'success' : 'warning'}>{getDocumentCodeStatus(code)}</DovelaBadge></td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4} className="dovela-data-table__empty">No hay códigos documentales con ese criterio.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </DovelaCard>

      <DovelaCard as="aside" className="legal-config-document-inspector">
        <CompactTitle
          title="Detalle del código"
          kicker="Documentos"
          help="Resume el código seleccionado sin mezclarlo todavía con toda la administración de reglas."
        />
        <DovelaCard tone="subtle" className="legal-config-selected-card">
          <div className="legal-config-selected-card__head">
            <span>{selectedCode?.code || 'Sin código'}</span>
            {selectedCode && <DovelaBadge tone="outline">{getDocumentCodeStatus(selectedCode)}</DovelaBadge>}
          </div>
          <strong>{selectedCode?.name || 'Selecciona un código documental'}</strong>
          {selectedCode?.description && <small>{selectedCode.description}</small>}
        </DovelaCard>

        <section className="legal-config-document-hierarchy" aria-label="Relación documental">
          <span>{parentCode ? 'Jerarquía documental' : 'Agrupación documental V.U.'}</span>
          <strong>{parentCode ? `Subcódigo de ${parentCode.code}` : selectedGroupLabel}</strong>
          {childCodes.length > 0 && <small>Amplía en: {childCodes.map((item) => item.code).join(', ')}</small>}
        </section>
        <dl className="legal-config-document-info-list">
          <div><dt>Soporte esperado</dt><dd>{SUPPORT_TYPE_LABELS[selectedMetadata.support_type] || 'No definido'}</dd></div>
          <div><dt>Fuente normativa</dt><dd>{selectedMetadata.normative_source || 'Pendiente'}</dd></div>
        </dl>

        <div className="legal-config-inspector-metrics" aria-label="Resumen documental">
          <div><strong>{childCodes.length}</strong><span>Subcódigos</span></div>
          <div><strong>{linkedDocuments.length}</strong><span>Definiciones</span></div>
          <div><strong>{relationRules.length}</strong><span>Reglas</span></div>
        </div>

        {linkedLabels.length > 0 && <section className="legal-config-document-labels" aria-label="Etiquetas documentales"><span>Etiquetas documentales</span><div>{linkedLabels.map((label) => <DovelaBadge key={label.id} tone="outline">{label.name}</DovelaBadge>)}</div></section>}

        <div className="legal-config-quiet-help">
          <FolderTree aria-hidden="true" />
          <span>Código V.U. → definición → reglas por actuación.</span>
          <InfoTooltip label="Modelo documental">Este catálogo está poblado desde la configuración documental vigente: el código V.U. identifica, la definición describe y las reglas muestran dónde aplica.</InfoTooltip>
        </div>

        {ruleApplications.length > 0 && <section className="legal-config-document-applications" aria-label="Aplicación en actuaciones">
          <span>Aplicación en actuaciones</span>
          {ruleApplications.slice(0, 4).map((rule) => <div key={rule.id}><strong>{rule.actuation?.name || 'Actuación configurada'}</strong><small>{getRuleConditionSummary(rule)}{rule.applies_to_descendants ? ' · hereda' : ''}</small></div>)}
          {ruleApplications.length > 4 && <small>+ {ruleApplications.length - 4} reglas adicionales</small>}
        </section>}

        <div className="legal-config-document-action-stack">
          <DovelaButton tone="primary" fullWidth leadingIcon={FileText} disabled={!selectedCode} onClick={() => onCreateDefinition(selectedCode)}>Nueva definición</DovelaButton>
          <DovelaButton tone="neutral" fullWidth leadingIcon={BookOpen} disabled={!selectedCode} onClick={() => onManageDefinitions(selectedCode)}>Gestionar definiciones</DovelaButton>
          <DovelaButton tone="neutral" fullWidth leadingIcon={Layers} onClick={onCreateCode}>Código relacionado</DovelaButton>
        </div>
      </DovelaCard>
    </main>
  );
}

export default function LegalConfigInitialPage() {
  const [data, setData] = useState(EMPTY_DATA);
  const [selectedDocumentCodeId, setSelectedDocumentCodeId] = useState('');
  const [activePane, setActivePane] = useState(ACTUATIONS_PANE);
  const [selectedActuationId, setSelectedActuationId] = useState('');
  const [modal, setModal] = useState(null);
  const [detailNode, setDetailNode] = useState(null);
  const [deactivateCandidate, setDeactivateCandidate] = useState(null);
  const [definitionCode, setDefinitionCode] = useState(null);
  const [definitionsManagerCode, setDefinitionsManagerCode] = useState(null);
  const [editingDefinition, setEditingDefinition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [zoom, setZoom] = useState(1);
  const loadRequestIdRef = useRef(0);

  const allActuations = data.actuationTypes;
  const selectedNode = useMemo(() => allActuations.find((item) => item.id === selectedActuationId) || allActuations[0] || null, [allActuations, selectedActuationId]);
  const relationItemsByType = { document: data.documents, text: data.texts, label: data.labels };
  const activeRelationType = relationItemsByType[modal] ? modal : 'document';


  async function loadData() {
    const requestId = ++loadRequestIdRef.current;
    setLoading(true);
    setErrorMessage('');
    try {
      const [actuations, documentCodes, documents, labels, texts, contracts, assertions, rules] = await Promise.all([
        LegalConfigService.listActuationTypes({ is_active: true }),
        LegalConfigService.listDocumentCodes({ is_active: true }),
        LegalConfigService.listDocumentDefinitions({ is_active: true }),
        LegalConfigService.listConfigurationLabels({ is_active: true }),
        LegalConfigService.listLegalTexts({ is_active: true }),
        LegalConfigService.listReadContracts({ is_active: true }),
        LegalConfigService.listAssertions({ is_active: true }),
        LegalConfigService.listRules(),
      ]);

      // Una respuesta puede resolver fuera de orden si se dispara un loadData()
      // nuevo (crear tipo, relacionar, "Actualizar") antes de que termine uno
      // anterior. Si ya no somos la llamada más reciente, no pisamos el estado.
      if (requestId !== loadRequestIdRef.current) return true;

      const nextData = {
        actuationTypes: responseData(actuations, []),
        documentCodes: responseData(documentCodes, []),
        documents: responseData(documents, []),
        labels: responseData(labels, []),
        texts: responseData(texts, []),
        readContracts: responseData(contracts, []),
        assertions: responseData(assertions, []),
        rules: responseData(rules, {}),
      };
      setData(nextData);
      setSelectedActuationId((current) => current || nextData.actuationTypes[0]?.id || '');
      setSelectedDocumentCodeId((current) => current || nextData.documentCodes[0]?.id || '');
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


  async function createDocumentCode(payload) {
    const response = await LegalConfigService.createDocumentCode(payload);
    const refreshed = await loadData();
    const createdId = response?.data?.id;
    if (createdId) setSelectedDocumentCodeId(createdId);
    if (!refreshed) throw new Error('El código se creó, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }


  async function createDocumentDefinition(payload) {
    const response = await LegalConfigService.createDocumentDefinition(payload);
    const refreshed = await loadData();
    if (!refreshed) throw new Error('La definición se creó, pero no fue posible actualizar la vista. Usa "Actualizar".');
    return response;
  }

  function openDefinitionModal(code) {
    setDefinitionCode(code || data.documentCodes.find((item) => item.id === selectedDocumentCodeId) || null);
    setModal('document-definition');
  }


  async function deactivateDocumentDefinition(definition) {
    if (!definition?.id) return;
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

  function editDocumentDefinition(definition) {
    const code = data.documentCodes.find((item) => item.id === definition.document_code_id) || definitionsManagerCode;
    setDefinitionCode(code);
    setEditingDefinition(definition);
    setDefinitionsManagerCode(null);
    setModal('document-definition');
  }

  async function saveRelation(type, item) {
    if (!selectedNode || !item) return;
    const basePayload = { actuation_type_id: selectedNode.id };
    if (type === 'document') {
      await LegalConfigService.createActuationDocumentRule({ ...basePayload, document_id: item.id });
    } else if (type === 'text') {
      await LegalConfigService.createActuationTextRule({ ...basePayload, text_id: item.id });
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
            onOpen={setModal}
            onOpenDetail={openDetail}
            onSelectNode={handleNodeClick}
          />
        </main>
      )}

      {activePane === 'Documentos' && (
        <DocumentsPane
          data={data}
          selectedCodeId={selectedDocumentCodeId}
          onSelectCode={setSelectedDocumentCodeId}
          onCreateCode={() => setModal('document-code')}
          onCreateDefinition={openDefinitionModal}
          onManageDefinitions={setDefinitionsManagerCode}
        />
      )}

      <CreateTypeModal
        open={modal === 'create'}
        actuations={allActuations}
        defaultParentId={selectedNode?.id || ''}
        onClose={() => setModal(null)}
        onCreate={createType}
      />
      <DocumentCodeModal
        open={modal === 'document-code'}
        codes={data.documentCodes}
        defaultParentId={selectedDocumentCodeId}
        onClose={() => setModal(null)}
        onCreate={createDocumentCode}
      />
      <DocumentDefinitionModal
        open={modal === 'document-definition'}
        code={definitionCode}
        definition={editingDefinition}
        labels={data.labels}
        onClose={() => { setModal(null); setEditingDefinition(null); }}
        onCreate={createDocumentDefinition}
        onUpdate={updateDocumentDefinition}
      />
      <DefinitionsManagerModal
        open={Boolean(definitionsManagerCode)}
        code={definitionsManagerCode}
        definitions={data.documents.filter((item) => item.document_code_id === definitionsManagerCode?.id)}
        onClose={() => setDefinitionsManagerCode(null)}
        onEdit={editDocumentDefinition}
        onReplace={replaceDocumentDefinition}
        onDeactivate={deactivateDocumentDefinition}
      />
      <RelationModal
        open={['document', 'text', 'label'].includes(modal)}
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
