import { Fragment, useId, useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  FileText,
  Layers3,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from 'lucide-react';
import './ActuationAssociationsWorkspace.css';

const CATALOGUE_TABS = Object.freeze([
  { id: 'typologies', label: 'Tipologías', singular: 'Tipología', relationKey: 'typology_ids', icon: Layers3 },
  { id: 'labels', label: 'Etiquetas', singular: 'Etiqueta', relationKey: 'label_ids', icon: Tag },
  { id: 'documents', label: 'Documentos directos', singular: 'Documento directo', relationKey: 'document_ids', icon: FileText },
  { id: 'conditions', label: 'Condiciones', singular: 'Condición', relationKey: 'condition_ids', icon: SlidersHorizontal },
]);

const asList = (value) => (Array.isArray(value) ? value : []);

function pluralizeDocuments(count) {
  return `${count} ${count === 1 ? 'documento' : 'documentos'}`;
}

function missingItem(id) {
  return {
    id,
    code: id,
    name: 'Elemento no disponible',
    isMissing: true,
  };
}

function conditionSummary(condition, fields) {
  const field = fields.find((item) => item.key === condition?.source_key);
  const valueLabels = asList(condition?.expected_values)
    .map((expected) => field?.values?.find((item) => item.value === expected)?.label || expected)
    .filter(Boolean);
  const source = field?.label || condition?.source_key || 'Regla sin campo';
  const values = valueLabels.length ? valueLabels.join(', ') : 'sin valores definidos';
  return `${source}: ${values} · ${condition?.effect === 'exclude' ? 'Excluye' : 'Añade'}`;
}

function documentPreview(documents) {
  if (!documents.length) return 'Sin documentos vinculados';
  const names = documents.slice(0, 3).map((item) => item.name || item.code || 'Documento');
  const remainder = documents.length - names.length;
  return `${names.join(' · ')}${remainder > 0 ? ` · +${remainder}` : ''}`;
}

export default function ActuationAssociationsWorkspace({
  actuation,
  data,
  relations,
  loading = false,
  saving = false,
  conditionSaving = false,
  onChange,
  onCreateCondition,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState(CATALOGUE_TABS[0].id);
  const [query, setQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const instanceId = useId().replace(/:/g, '');
  const disabled = loading || saving;

  const primaryDocuments = useMemo(
    () => asList(data.documents).filter((item) => !item.parent_document_id),
    [data.documents],
  );

  const catalogueConfigs = useMemo(() => CATALOGUE_TABS.map((tab) => {
    let items = [];
    if (tab.id === 'typologies') items = asList(data.typologies);
    if (tab.id === 'labels') items = asList(data.labels);
    if (tab.id === 'documents') items = primaryDocuments;
    if (tab.id === 'conditions') items = asList(data.conditions);
    return {
      ...tab,
      items,
      relationIds: asList(relations[tab.relationKey]),
    };
  }), [data.conditions, data.labels, data.typologies, primaryDocuments, relations]);

  const documentsFor = useMemo(() => {
    const byTypology = new Map();
    const byLabel = new Map();
    const byCondition = new Map();
    const typologyIdsByLabel = new Map();

    primaryDocuments.forEach((document) => {
      if (document.typology_id) {
        const current = byTypology.get(document.typology_id) || [];
        current.push(document);
        byTypology.set(document.typology_id, current);
      }
    });

    asList(data.labelTypologies).forEach((link) => {
      const current = typologyIdsByLabel.get(link.label_id) || [];
      current.push(link.typology_id);
      typologyIdsByLabel.set(link.label_id, current);
    });

    asList(data.documentLabels).forEach((link) => {
      const document = primaryDocuments.find((item) => item.id === link.document_id);
      if (!document) return;
      const current = byLabel.get(link.label_id) || [];
      current.push(document);
      byLabel.set(link.label_id, current);
    });

    asList(data.conditionDocuments).forEach((link) => {
      const document = primaryDocuments.find((item) => item.id === link.document_id);
      if (!document) return;
      const current = byCondition.get(link.condition_id) || [];
      current.push(document);
      byCondition.set(link.condition_id, current);
    });

    typologyIdsByLabel.forEach((typologyIds, labelId) => {
      const inherited = typologyIds.flatMap((typologyId) => byTypology.get(typologyId) || []);
      const direct = byLabel.get(labelId) || [];
      byLabel.set(labelId, [...new Map([...direct, ...inherited].map((item) => [item.id, item])).values()]);
    });

    return { byTypology, byLabel, byCondition };
  }, [data.conditionDocuments, data.documentLabels, data.labelTypologies, primaryDocuments]);

  function relatedDocuments(kind, item) {
    if (kind === 'typologies') return documentsFor.byTypology.get(item.id) || [];
    if (kind === 'labels') return documentsFor.byLabel.get(item.id) || [];
    if (kind === 'documents') return item.isMissing ? [] : [item];
    if (kind === 'conditions') return documentsFor.byCondition.get(item.id) || [];
    return [];
  }

  function itemSummary(kind, item, documents) {
    if (item.isMissing) return 'La referencia sigue asociada, pero el catálogo no la devolvió.';
    if (kind === 'documents') return item.code ? `Código ${item.code}` : 'Documento principal';
    if (kind === 'conditions') return conditionSummary(item, asList(data.conditionFields));
    return documentPreview(documents);
  }

  const associatedRows = useMemo(() => catalogueConfigs.flatMap((config) => (
    config.relationIds.map((id) => {
      const item = config.items.find((candidate) => candidate.id === id) || missingItem(id);
      const documents = relatedDocuments(config.id, item);
      return {
        id: `${config.id}-${id}`,
        itemId: id,
        kind: config.id,
        relationKey: config.relationKey,
        relationIds: config.relationIds,
        typeLabel: config.singular,
        item,
        documents,
        summary: itemSummary(config.id, item, documents),
      };
    })
  )), [catalogueConfigs, data.conditionFields, documentsFor]);

  const activeConfig = catalogueConfigs.find((config) => config.id === activeTab) || catalogueConfigs[0];
  const normalizedQuery = query.trim().toLocaleLowerCase('es');
  const availableItems = activeConfig.items
    .filter((item) => item.is_active !== false)
    .filter((item) => {
      if (!normalizedQuery) return true;
      return `${item.name || ''} ${item.code || ''}`.toLocaleLowerCase('es').includes(normalizedQuery);
    });

  function changeTab(tabId) {
    setActiveTab(tabId);
    setQuery('');
  }

  function navigateTabs(event, index) {
    const lastIndex = catalogueConfigs.length - 1;
    let nextIndex = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index === 0 ? lastIndex : index - 1;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = lastIndex;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextConfig = catalogueConfigs[nextIndex];
    changeTab(nextConfig.id);
    window.requestAnimationFrame(() => document.getElementById(`${instanceId}-${nextConfig.id}-tab`)?.focus());
  }

  function addAssociation(itemId) {
    if (disabled || activeConfig.relationIds.includes(itemId)) return;
    onChange(activeConfig.relationKey, [...activeConfig.relationIds, itemId]);
  }

  function removeAssociation(row) {
    if (disabled) return;
    onChange(row.relationKey, row.relationIds.filter((id) => id !== row.itemId));
  }

  function toggleRow(rowId) {
    setExpandedRows((current) => ({ ...current, [rowId]: !current[rowId] }));
  }

  if (!actuation) {
    return (
      <section className="actuation-association-workspace actuation-association-workspace--empty" aria-label="Configuración de asociaciones">
        <Layers3 size={28} aria-hidden="true" />
        <strong>Selecciona una actuación</strong>
        <p>Elige una serie o subserie para revisar su configuración.</p>
      </section>
    );
  }

  return (
    <section className="actuation-association-workspace" aria-label={`Configuración de ${actuation.name}`} aria-busy={saving}>
      <header className="actuation-context-card">
        <div className="actuation-context-card__copy">
          <p>Configurando</p>
          <div>
            <h3>{actuation.name}</h3>
            {actuation.code && <code>{actuation.code}</code>}
          </div>
        </div>
        <div className="actuation-context-card__actions">
          <div className="actuation-context-card__metrics" aria-label="Resumen de asociaciones">
            {catalogueConfigs.map((config) => (
              <span key={config.id}>
                <strong>{config.relationIds.length}</strong>{' '}
                {(config.relationIds.length === 1 ? config.singular : config.label).toLowerCase()}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="actuation-context-card__refresh"
            onClick={onRefresh}
            disabled={loading || saving}
            aria-label="Actualizar configuración"
            title="Actualizar configuración"
          >
            <RefreshCw className={loading ? 'is-spinning' : ''} size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <section className="association-current-card" aria-labelledby={`${instanceId}-current-title`}>
        <header className="association-card-header">
          <h3 id={`${instanceId}-current-title`}>Asociaciones vigentes</h3>
          <span>{associatedRows.length}</span>
        </header>

        {saving && (
          <p className="association-save-status" role="status">
            <LoaderCircle className="is-spinning" size={15} aria-hidden="true" /> Guardando asociaciones…
          </p>
        )}

        {associatedRows.length ? (
          <div className="association-current-table-wrap">
            <table className="association-current-table">
              <thead>
                <tr>
                  <th scope="col">Elemento</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Documentos</th>
                  <th scope="col"><span className="association-workspace__sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {associatedRows.map((row) => {
                  const expandable = row.kind !== 'documents' && row.documents.length > 0;
                  const expanded = Boolean(expandedRows[row.id]);
                  const detailId = `${instanceId}-${row.id}-documents`;
                  return (
                    <Fragment key={row.id}>
                      <tr className={row.item.isMissing ? 'is-missing' : ''}>
                        <td>
                          <div className="association-current-table__element">
                            {expandable ? (
                              <button
                                type="button"
                                className="association-current-table__toggle"
                                aria-expanded={expanded}
                                aria-controls={detailId}
                                onClick={() => toggleRow(row.id)}
                              >
                                <ChevronRight size={14} aria-hidden="true" />
                                <span className="association-workspace__sr-only">
                                  {expanded ? 'Ocultar' : 'Mostrar'} documentos de {row.item.name}
                                </span>
                              </button>
                            ) : <span className="association-current-table__toggle-spacer" aria-hidden="true" />}
                            <span>
                              <strong>{row.item.name}</strong>
                              <small>{row.summary}</small>
                            </span>
                          </div>
                        </td>
                        <td><span className={`association-type-badge is-${row.kind}`}>{row.typeLabel}</span></td>
                        <td>{row.kind === 'documents' ? '—' : pluralizeDocuments(row.documents.length)}</td>
                        <td>
                          <button
                            type="button"
                            className="association-remove-button"
                            onClick={() => removeAssociation(row)}
                            disabled={disabled}
                            aria-label={`Quitar ${row.item.name}`}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                      {expandable && expanded && (
                        <tr className="association-current-table__detail-row">
                          <td colSpan="4">
                            <div id={detailId} className="association-current-table__details">
                              <FileText size={15} aria-hidden="true" />
                              <ul>
                                {row.documents.map((document) => (
                                  <li key={document.id}>
                                    <strong>{document.name}</strong>
                                    {document.code && <code>{document.code}</code>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="association-card-empty">
            <Layers3 size={24} aria-hidden="true" />
            <strong>Sin asociaciones</strong>
            <p>Usa el catálogo inferior para agregar el primer elemento.</p>
          </div>
        )}
      </section>

      <section className="association-catalogue-card" aria-labelledby={`${instanceId}-catalogue-title`}>
        <header className="association-card-header">
          <h3 id={`${instanceId}-catalogue-title`}>Agregar a esta actuación</h3>
          {activeTab === 'conditions' && (
            <button
              type="button"
              className="association-new-condition"
              onClick={onCreateCondition}
              disabled={disabled || conditionSaving}
            >
              <Plus size={15} aria-hidden="true" /> Nueva condición
            </button>
          )}
        </header>

        <div className="association-catalogue-tabs" role="tablist" aria-label="Catálogo disponible">
          {catalogueConfigs.map((config, index) => {
            const selected = config.id === activeTab;
            const activeCount = config.items.filter((item) => item.is_active !== false).length;
            return (
              <button
                key={config.id}
                id={`${instanceId}-${config.id}-tab`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${instanceId}-${config.id}-panel`}
                tabIndex={selected ? 0 : -1}
                className={selected ? 'is-active' : ''}
                onClick={() => changeTab(config.id)}
                onKeyDown={(event) => navigateTabs(event, index)}
              >
                {config.label} <span>{activeCount}</span>
              </button>
            );
          })}
        </div>

        <div
          id={`${instanceId}-${activeConfig.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${instanceId}-${activeConfig.id}-tab`}
          className="association-catalogue-panel"
        >
          <label className="association-catalogue-search">
            <Search size={16} aria-hidden="true" />
            <span className="association-workspace__sr-only">Buscar en {activeConfig.label.toLowerCase()}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar en ${activeConfig.label.toLowerCase()}`}
              disabled={loading}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </label>

          <div className="association-catalogue-list">
            {availableItems.map((item) => {
              const documents = relatedDocuments(activeConfig.id, item);
              const associated = activeConfig.relationIds.includes(item.id);
              return (
                <article className={`association-catalogue-row${associated ? ' is-associated' : ''}`} key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{itemSummary(activeConfig.id, item, documents)}</small>
                  </div>
                  {associated ? (
                    <span className="association-catalogue-row__associated">
                      <Check size={14} aria-hidden="true" /> Ya asociado
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="association-catalogue-row__add"
                      onClick={() => addAssociation(item.id)}
                      disabled={disabled}
                      aria-label={`Agregar ${item.name}`}
                    >
                      <Plus size={14} aria-hidden="true" /> Agregar
                    </button>
                  )}
                </article>
              );
            })}

            {!availableItems.length && (
              <div className="association-card-empty is-compact">
                <Search size={21} aria-hidden="true" />
                <strong>{normalizedQuery ? 'Sin coincidencias' : 'Catálogo vacío'}</strong>
                <p>{normalizedQuery ? 'Prueba con otro nombre o código.' : 'No hay elementos activos en este catálogo.'}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
