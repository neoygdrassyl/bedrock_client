import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  FileText,
  Plus,
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LegalConfigService from '../../../services/legal_config.service.js';
import './LegalConfigInitialPage.css';

const EMPTY_DATA = {
  actuationTypes: [],
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

function resolveRuleItems(rules = [], catalog = [], idKey) {
  return rules
    .map((rule) => {
      const item = catalog.find((entry) => entry.id === rule[idKey]);
      return item ? { key: rule.id || `${rule[idKey]}-${rule.actuation_type_id}`, ...item } : null;
    })
    .filter(Boolean);
}

/** Deriva, desde los datos reales del backend (`data.rules`), las relaciones
 * directas y por etiqueta de una actuación — fuente única para el panel de
 * relaciones y el modal de previsualización. */
function getActuationRelations(actuationId, data) {
  if (!actuationId) return { documents: [], texts: [] };
  const rules = data.rules || {};

  const directDocuments = (rules.actuation_documents || []).filter((rule) => rule.actuation_type_id === actuationId);
  const labelDocuments = (rules.actuation_documents_by_labels || []).filter((rule) => rule.actuation_type_id === actuationId);
  const directTexts = (rules.actuation_texts || []).filter((rule) => rule.actuation_type_id === actuationId);
  const labelTexts = (rules.actuation_texts_by_labels || []).filter((rule) => rule.actuation_type_id === actuationId);

  return {
    documents: [
      ...resolveRuleItems(directDocuments, data.documents, 'document_id').map((entry) => ({ ...entry, via: 'directo' })),
      ...resolveRuleItems(labelDocuments, data.labels, 'label_id').map((entry) => ({ ...entry, via: 'etiqueta' })),
    ],
    texts: [
      ...resolveRuleItems(directTexts, data.texts, 'text_id').map((entry) => ({ ...entry, via: 'directo' })),
      ...resolveRuleItems(labelTexts, data.labels, 'label_id').map((entry) => ({ ...entry, via: 'etiqueta' })),
    ],
  };
}

function CreateTypeModal({ open, actuations, onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', parentId: actuations[0]?.id || '', nodeType: 'actuation' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ name: '', parentId: actuations[0]?.id || '', nodeType: 'actuation' });
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

function ActuationPreviewModal({ open, node, data, onClose }) {
  const [tab, setTab] = useState('document');

  useEffect(() => {
    if (open) setTab('document');
  }, [open, node?.id]);

  const relations = useMemo(() => getActuationRelations(node?.id, data), [node, data]);
  const items = tab === 'document' ? relations.documents : relations.texts;
  const emptyMessage = tab === 'document'
    ? 'Sin documentos relacionados para esta actuación.'
    : 'Sin textos jurídicos relacionados para esta actuación.';

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{node?.name || 'Actuación'}</DialogTitle>
        </DialogHeader>

        <nav className="legal-config-preview-tabs" aria-label="Relaciones de la actuación">
          <DovelaButton type="button" tone={tab === 'document' ? 'primary' : 'neutral'} onClick={() => setTab('document')} aria-pressed={tab === 'document'}>
            Documentos
          </DovelaButton>
          <DovelaButton type="button" tone={tab === 'text' ? 'primary' : 'neutral'} onClick={() => setTab('text')} aria-pressed={tab === 'text'}>
            Textos legales
          </DovelaButton>
        </nav>

        {items.length ? (
          <div className="legal-config-preview-list">
            {items.map((item) => (
              <DovelaCard as="article" tone="subtle" className="legal-config-preview-item" key={item.key}>
                <DovelaBadge tone="info">{item.via === 'etiqueta' ? 'Por etiqueta' : 'Directo'}</DovelaBadge>
                <strong>{getItemName(item)}</strong>
              </DovelaCard>
            ))}
          </div>
        ) : (
          <p className="legal-config-preview-empty">{emptyMessage}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ActuationGraph({ nodes, selectedId, onNodeClick, zoom, setZoom }) {
  const layout = useMemo(() => buildGraphRows(nodes), [nodes]);
  const { width: nodeWidth, height: nodeHeight } = GRAPH_NODE;

  return (
    <DovelaCard as="section" className="actuation-graph-card">
      <header className="actuation-graph-card__header">
        <div>
          <h3>Árbol de actuaciones</h3>
          <span>Vista izquierda a derecha desde la configuración guardada</span>
        </div>
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
              </button>
            );
          })}
        </div>
      </div>
    </DovelaCard>
  );
}

function ActionPanel({ selectedNode, onOpen, quickRelationsProps, relations }) {
  return (
    <DovelaCard as="aside" className="legal-config-action-panel">
      <DovelaCard tone="subtle" className="legal-config-selected-card">
        <span>Actuación seleccionada</span>
        <strong>{selectedNode?.name || 'Selecciona una actuación'}</strong>
        <small>{selectedNode ? getNodeTypeLabel(selectedNode.node_type) : 'Sin selección'}</small>
      </DovelaCard>

      <div className="legal-config-action-stack">
        <DovelaButton tone="neutral" fullWidth leadingIcon={Plus} onClick={() => onOpen('create')}>
          Crear tipo
        </DovelaButton>
        <DovelaButton tone="neutral" fullWidth leadingIcon={BookOpen} onClick={() => onOpen('text')} disabled={!selectedNode}>
          Asociar texto jurídico
        </DovelaButton>
        <DovelaButton tone="neutral" fullWidth leadingIcon={FileText} onClick={() => onOpen('document')} disabled={!selectedNode}>
          Asociar documento
        </DovelaButton>
        <DovelaButton tone="neutral" fullWidth leadingIcon={Tags} onClick={() => onOpen('label')} disabled={!selectedNode}>
          Asociar etiqueta
        </DovelaButton>
      </div>

      <QuickRelations {...quickRelationsProps} />
      <RelationList relations={relations} />
    </DovelaCard>
  );
}

function QuickRelations({ documents, texts, labels, onRelate, disabled }) {
  const [values, setValues] = useState({ document: '', text: '', label: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      await onRelate(values);
      setValues({ document: '', text: '', label: '' });
    } catch (submitError) {
      setError(extractErrorMessage(submitError, 'No fue posible relacionar los elementos seleccionados.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DovelaCard as="section" className="legal-config-quick-relations" data-testid="actuation-quick-relations">
      <header>
        <h3>Relaciones disponibles</h3>
        <DovelaBadge tone="outline">Backend</DovelaBadge>
      </header>

      {error && <DovelaInlineAlert tone="danger">{error}</DovelaInlineAlert>}

      <div className="legal-config-quick-relations__grid">
        <DovelaField label="Documento">
          <select
            id="quick-relation-document"
            className="legal-config-native-select"
            value={values.document}
            onChange={(event) => update('document', event.target.value)}
            disabled={disabled}
          >
            <option value="">Seleccionar documento</option>
            {documents.map((item) => <option key={item.id} value={item.id}>{getItemName(item)}</option>)}
          </select>
        </DovelaField>
        <DovelaField label="Texto jurídico">
          <select
            id="quick-relation-text"
            className="legal-config-native-select"
            value={values.text}
            onChange={(event) => update('text', event.target.value)}
            disabled={disabled}
          >
            <option value="">Seleccionar texto</option>
            {texts.map((item) => <option key={item.id} value={item.id}>{getItemName(item)}</option>)}
          </select>
        </DovelaField>
        <DovelaField label="Etiqueta">
          <select
            id="quick-relation-label"
            className="legal-config-native-select"
            value={values.label}
            onChange={(event) => update('label', event.target.value)}
            disabled={disabled}
          >
            <option value="">Seleccionar etiqueta</option>
            {labels.map((item) => <option key={item.id} value={item.id}>{getItemName(item)}</option>)}
          </select>
        </DovelaField>
        <DovelaButton
          type="button"
          tone="primary"
          fullWidth
          loading={submitting}
          onClick={submit}
          disabled={disabled || submitting || (!values.document && !values.text && !values.label)}
        >
          Relacionar seleccionados
        </DovelaButton>
      </div>
    </DovelaCard>
  );
}

function RelationList({ relations }) {
  return (
    <DovelaCard as="section" className="legal-config-relation-list" data-testid="actuation-relation-list">
      <header>
        <h3>Relaciones configuradas</h3>
        <span>{relations.length} activa{relations.length === 1 ? '' : 's'}</span>
      </header>
      {relations.length ? (
        <div className="legal-config-relation-list__items">
          {relations.map((relation) => (
            <DovelaCard as="article" tone="subtle" className="legal-config-relation-card" key={relation.key}>
              <DovelaBadge tone="info">{relation.typeLabel}</DovelaBadge>
              <strong>{relation.name}</strong>
              <small>{relation.actuationName}</small>
            </DovelaCard>
          ))}
        </div>
      ) : (
        <div className="legal-config-empty-compact">Aún no hay relaciones configuradas para esta actuación.</div>
      )}
    </DovelaCard>
  );
}

export default function LegalConfigInitialPage() {
  const [data, setData] = useState(EMPTY_DATA);
  const [activePane, setActivePane] = useState(ACTUATIONS_PANE);
  const [selectedActuationId, setSelectedActuationId] = useState('');
  const [modal, setModal] = useState(null);
  const [previewNode, setPreviewNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [zoom, setZoom] = useState(1);
  const loadRequestIdRef = useRef(0);

  const allActuations = data.actuationTypes;
  const selectedNode = useMemo(() => allActuations.find((item) => item.id === selectedActuationId) || allActuations[0] || null, [allActuations, selectedActuationId]);
  const relationItemsByType = { document: data.documents, text: data.texts, label: data.labels };
  const activeRelationType = relationItemsByType[modal] ? modal : 'document';

  const visibleRelations = useMemo(() => {
    if (!selectedNode) return [];
    const { documents, texts } = getActuationRelations(selectedNode.id, data);
    return [
      ...documents.map((item) => ({
        key: `doc-${item.key}`,
        typeLabel: item.via === 'etiqueta' ? 'Documento (etiqueta)' : 'Documento',
        name: getItemName(item),
        actuationName: selectedNode.name,
      })),
      ...texts.map((item) => ({
        key: `text-${item.key}`,
        typeLabel: item.via === 'etiqueta' ? 'Texto jurídico (etiqueta)' : 'Texto jurídico',
        name: getItemName(item),
        actuationName: selectedNode.name,
      })),
    ];
  }, [selectedNode, data]);

  async function loadData() {
    const requestId = ++loadRequestIdRef.current;
    setLoading(true);
    setErrorMessage('');
    try {
      const [actuations, documents, labels, texts, contracts, assertions, rules] = await Promise.all([
        LegalConfigService.listActuationTypes({ is_active: true }),
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
        documents: responseData(documents, []),
        labels: responseData(labels, []),
        texts: responseData(texts, []),
        readContracts: responseData(contracts, []),
        assertions: responseData(assertions, []),
        rules: responseData(rules, {}),
      };
      setData(nextData);
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

  async function addQuickRelations(values) {
    const mapping = [
      ['document', data.documents.find((item) => item.id === values.document)],
      ['text', data.texts.find((item) => item.id === values.text)],
      ['label', data.labels.find((item) => item.id === values.label)],
    ].filter(([, item]) => item);
    let refreshed = true;
    try {
      for (const [type, item] of mapping) {
        // eslint-disable-next-line no-await-in-loop
        await saveRelation(type, item);
      }
    } finally {
      // Algunas relaciones pueden haberse guardado antes de un fallo a mitad
      // de camino; refrescar siempre evita que la UI quede desincronizada
      // del backend aunque el usuario vea el error de la que falló.
      refreshed = await loadData();
    }
    if (!refreshed) throw new Error('Las relaciones se guardaron, pero no fue posible actualizar la vista. Usa "Actualizar".');
  }

  function handleNodeClick(node) {
    setSelectedActuationId(node.id);
    if (node.node_type === 'group') setPreviewNode(node);
  }

  return (
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

      {activePane !== ACTUATIONS_PANE && (
        <DovelaInlineAlert tone="info" icon={Scale} title={activePane}>
          Ventana reservada para la siguiente fase.
        </DovelaInlineAlert>
      )}

      {activePane === ACTUATIONS_PANE && (
        <main className="legal-config-actuation-layout">
          <ActuationGraph nodes={allActuations} selectedId={selectedNode?.id || ''} onNodeClick={handleNodeClick} zoom={zoom} setZoom={setZoom} />
          <ActionPanel
            selectedNode={selectedNode}
            onOpen={setModal}
            relations={visibleRelations}
            quickRelationsProps={{
              documents: data.documents,
              texts: data.texts,
              labels: data.labels,
              disabled: !selectedNode,
              onRelate: addQuickRelations,
            }}
          />
        </main>
      )}

      <CreateTypeModal
        open={modal === 'create'}
        actuations={allActuations}
        onClose={() => setModal(null)}
        onCreate={createType}
      />
      <RelationModal
        open={['document', 'text', 'label'].includes(modal)}
        relationType={activeRelationType}
        items={relationItemsByType[activeRelationType]}
        onClose={() => setModal(null)}
        onSave={addRelation}
      />
      <ActuationPreviewModal
        open={Boolean(previewNode)}
        node={previewNode}
        data={data}
        onClose={() => setPreviewNode(null)}
      />
    </section>
  );
}
