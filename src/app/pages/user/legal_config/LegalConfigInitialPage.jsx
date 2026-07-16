import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CornerDownRight,
  FileText,
  GitBranch,
  Layers3,
  Link2,
  Library,
  ListChecks,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import LegalConfigService from '@/app/services/legal_config.service';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/data-table';
import DataTableBridge from '@/components/data-table-bridge';
import './LegalConfigInitialPage.css';

const empty = {
  actuations: [], typologies: [], labels: [], documents: [], documentLabels: [],
  actuationTypologies: [], actuationLabels: [], directDocuments: [], legacyActuationTypes: [],
  conditions: [], conditionFields: [], conditionDocuments: [], actuationConditions: [],
};

const emptyDocumentForm = {
  name: '', code: '', typology_id: '', label_ids: [], parent_document_id: '',
};

const errorMessage = (error) => (
  error?.response?.data?.message || error?.message || 'No fue posible guardar el cambio.'
);

const byParent = (rows, parentId = null) => (
  rows.filter((row) => (row.parent_document_id || null) === parentId)
);

function CatalogueSelect({ label, values, value, onChange, onCreate, multiple = false, creatable = true, disabled = false }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const instanceId = useId().replace(/:/g, '');
  const labelId = `catalogue-label-${instanceId}`;
  const listId = `catalogue-list-${instanceId}`;
  const selectedItem = multiple ? null : values.find((item) => item.id === value);
  const matches = values.filter((item) => (
    item.is_active
    && (!multiple || !(value || []).includes(item.id))
    && item.name.toLowerCase().includes(text.toLowerCase())
  ));

  function select(id) {
    onChange(multiple ? [...new Set([...(value || []), id])] : id);
    setText('');
    setOpen(false);
    setActive(-1);
  }

  async function create() {
    if (creatable && text.trim()) {
      const created = await onCreate(text.trim());
      if (created) select(created.id);
    }
  }

  function keyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index < 0 ? 0 : Math.min(index + 1, Math.max(matches.length - 1, 0))));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.max(index - 1, 0));
    }

    if (event.key === 'Escape') {
      setOpen(false);
      setText('');
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (open && matches[active]) select(matches[active].id);
      else if (creatable) create();
    }
  }

  return (
    <label className="catalogue-select">
      <span id={labelId}>{label}</span>
      <div className="catalogue-select__control">
        {multiple && (value || []).map((id) => {
          const item = values.find((candidate) => candidate.id === id);
          return item && (
            <button
              type="button"
              key={id}
              aria-label={`Quitar ${item.name}`}
              onClick={() => onChange(value.filter((candidate) => candidate !== id))}
              disabled={disabled}
            >
              {item.name} ×
            </button>
          );
        })}
        <input
          value={multiple || open ? text : (selectedItem?.name || text)}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            setText('');
            setActive(-1);
          }}
          onKeyDown={keyDown}
          placeholder={creatable ? `Buscar o crear ${label.toLowerCase()}` : `Buscar ${label.toLowerCase()}`}
           role="combobox"
           aria-labelledby={labelId}
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && matches[active] ? `${listId}-${matches[active].id}` : undefined}
          aria-autocomplete="list"
          disabled={disabled}
        />
      </div>
      {open && (
        <div id={listId} className="catalogue-select__menu" role="listbox">
          {matches.map((item, index) => (
            <button
              type="button"
              role="option"
              aria-selected={multiple ? value?.includes(item.id) : value === item.id}
              id={`${listId}-${item.id}`}
              className={index === active ? 'is-active' : ''}
              key={item.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(item.id)} disabled={disabled}
            >
              {item.name}
            </button>
          ))}
          {creatable && text && !matches.some((item) => item.name.toLowerCase() === text.toLowerCase()) && (
              <button type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={create} disabled={disabled}>
              Crear “{text}”
            </button>
          )}
        </div>
      )}
    </label>
  );
}

function CatalogueManagerDialog({ open, onOpenChange, tab, onTabChange, values, onCreate, onToggleActive, saving }) {
  const [name, setName] = useState('');
  const isTypology = tab === 'typologies';
  const catalogueLabel = isTypology ? 'tipología' : 'etiqueta';
  const title = isTypology ? 'Tipologías' : 'Etiquetas';

  async function submit(event) {
    event.preventDefault();
    const created = await onCreate(tab, name.trim());
    if (created) setName('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="legal-config-catalogue-dialog"
        aria-label="Tipologías y etiquetas"
        aria-describedby={undefined}
      >
        <DialogHeader className="legal-config-catalogue-dialog__header">
          <DialogTitle><Settings2 size={18} aria-hidden="true" /> Tipologías y etiquetas</DialogTitle>
        </DialogHeader>

        <div className="legal-config-catalogue-tabs" role="tablist" aria-label="Catálogos documentales">
          {['typologies', 'labels'].map((catalogue) => {
            const selectedTab = catalogue === tab;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={selectedTab}
                className={selectedTab ? 'is-active' : ''}
                onClick={() => onTabChange(catalogue)}
                key={catalogue}
              >
                {catalogue === 'typologies' ? 'Tipologías' : 'Etiquetas'}
                <span>{catalogue === 'typologies' ? values.typologies.length : values.labels.length}</span>
              </button>
            );
          })}
        </div>

        <form className="legal-config-catalogue-create" onSubmit={submit}>
          <label htmlFor="catalogue-new-name">Nuevo nombre</label>
          <div>
            <input
              id="catalogue-new-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`Ej. ${isTypology ? 'Planos' : 'Obligatorio'}`}
              disabled={saving}
            />
            <button className="legal-config-button legal-config-button--primary" type="submit" disabled={!name.trim() || saving}>
              {saving ? 'Guardando…' : `Crear ${catalogueLabel}`}
            </button>
          </div>
        </form>

        <DataTable
          className="legal-config-catalogue-table"
          columns={[
            { accessorKey: 'name', header: 'Nombre' },
            {
              id: 'status',
              header: 'Estado',
              accessorFn: (item) => item.is_active ? 'Activa' : 'Inactiva',
              cell: ({ row }) => row.original.is_active ? 'Activa' : 'Inactiva',
            },
            {
              id: 'actions',
              header: 'Acciones',
              enableSorting: false,
              cell: ({ row }) => {
                const item = row.original;
                return (
                  <button
                    type="button"
                    className="legal-config-button legal-config-button--compact"
                    onClick={() => onToggleActive(tab, item)}
                    disabled={saving}
                    aria-label={`${item.is_active ? 'Desactivar' : 'Activar'} ${item.name}`}
                  >
                    {item.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                );
              },
            },
          ]}
          data={values[tab]}
          searchable
          searchPlaceholder={`Buscar ${title.toLowerCase()}`}
          pagination
          pageSize={8}
          compact
          emptyMessage={`No hay ${title.toLowerCase()} registradas.`}
        />

        <DialogFooter className="legal-config-catalogue-dialog__footer">
          <button type="button" className="legal-config-button" onClick={() => onOpenChange(false)}>Cerrar</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConditionDialog({ open, onOpenChange, fields, documents, actuation, onSave, saving }) {
  const [name, setName] = useState('');
  const [sourceKey, setSourceKey] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [effect, setEffect] = useState('include');
  const [documentIds, setDocumentIds] = useState([]);
  const selectedField = fields.find((field) => field.key === sourceKey);

  useEffect(() => {
    if (!open) return;
    const firstField = fields[0];
    setName('');
    setSourceKey(firstField?.key || '');
    setExpectedValue(firstField?.values?.[0]?.value || '');
    setEffect('include');
    setDocumentIds([]);
  }, [fields, open]);

  function changeField(nextKey) {
    const nextField = fields.find((field) => field.key === nextKey);
    setSourceKey(nextKey);
    setExpectedValue(nextField?.values?.[0]?.value || '');
  }

  async function submit(event) {
    event.preventDefault();
    const saved = await onSave({
      name: name.trim(),
      code: name.trim(),
      source_key: sourceKey,
      operator: selectedField?.operator || 'includes_any',
      expected_values: [expectedValue],
      effect,
      document_ids: documentIds,
      actuation_ids: [actuation.id],
    });
    if (saved) onOpenChange(false);
  }

  const canSave = Boolean(name.trim() && sourceKey && expectedValue && documentIds.length && actuation && !saving);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="legal-config-condition-dialog" aria-label="Nueva condición" aria-describedby={undefined}>
        <DialogHeader className="legal-config-condition-dialog__header">
          <DialogTitle><ListChecks size={18} aria-hidden="true" /> Nueva condición</DialogTitle>
          <span>{actuation?.name}</span>
        </DialogHeader>
        <form className="condition-form" onSubmit={submit}>
          <label>
            Nombre de la condición
            <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. El predio es BIC" disabled={saving} autoFocus />
          </label>
          <div className="condition-form__rule">
            <label>
              Dato del FUN
              <select value={sourceKey} onChange={(event) => changeField(event.target.value)} disabled={saving}>
                {fields.map((field) => <option key={field.key} value={field.key}>{field.label}</option>)}
              </select>
            </label>
            <label>
              Valor
              <select value={expectedValue} onChange={(event) => setExpectedValue(event.target.value)} disabled={saving}>
                {(selectedField?.values || []).map((value) => <option key={value.value} value={value.value}>{value.label}</option>)}
              </select>
            </label>
            <label>
              Resultado
              <select value={effect} onChange={(event) => setEffect(event.target.value)} disabled={saving}>
                <option value="include">Añadir documentos</option>
                <option value="exclude">No incluir documentos</option>
              </select>
            </label>
          </div>
          <CatalogueSelect label="Documentos" values={documents} value={documentIds} multiple creatable={false} onChange={setDocumentIds} disabled={saving} />
          <DialogFooter className="legal-config-condition-dialog__footer">
            <button type="button" className="legal-config-button" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</button>
            <button type="submit" className="legal-config-button legal-config-button--primary" disabled={!canSave}>{saving ? 'Creando…' : 'Crear condición'}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SeriesDialog({ open, onOpenChange, actuations, onSave, saving }) {
  const [codes, setCodes] = useState({});
  const roots = actuations.filter((item) => !item.parent_id);

  useEffect(() => {
    if (!open) return;
    setCodes(Object.fromEntries(actuations.map((item) => [item.id, item.code || ''])));
  }, [actuations, open]);

  const changes = actuations.filter((item) => (codes[item.id] || '').trim() !== (item.code || ''));

  async function submit(event) {
    event.preventDefault();
    const saved = await onSave(changes.map((item) => ({ ...item, code: codes[item.id].trim() })));
    if (saved) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="legal-config-series-dialog" aria-label="Series y subseries" aria-describedby={undefined}>
        <DialogHeader className="legal-config-series-dialog__header">
          <DialogTitle><Library size={18} aria-hidden="true" /> Series y subseries</DialogTitle>
        </DialogHeader>
        <form className="series-form" onSubmit={submit}>
          <div className="series-form__list">
            {roots.map((series) => {
              const subseries = actuations.filter((item) => item.parent_id === series.id);
              return (
                <section className="series-form__group" key={series.id}>
                  <label className="series-form__row">
                    <span><small>Serie documental</small><strong>{series.name}</strong></span>
                    <input
                      aria-label={`Código de serie para ${series.name}`}
                      value={codes[series.id] || ''}
                      onChange={(event) => setCodes((current) => ({ ...current, [series.id]: event.target.value }))}
                      disabled={saving}
                      required
                    />
                  </label>
                  {subseries.map((item) => (
                    <label className="series-form__row is-subseries" key={item.id}>
                      <span><small>Subserie</small><strong>{item.name}</strong></span>
                      <input
                        aria-label={`Código de subserie para ${item.name}`}
                        value={codes[item.id] || ''}
                        onChange={(event) => setCodes((current) => ({ ...current, [item.id]: event.target.value }))}
                        disabled={saving}
                        required
                      />
                    </label>
                  ))}
                </section>
              );
            })}
          </div>
          <DialogFooter className="legal-config-series-dialog__footer">
            <button type="button" className="legal-config-button" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</button>
            <button type="submit" className="legal-config-button legal-config-button--primary" disabled={!changes.length || saving}>{saving ? 'Guardando…' : 'Guardar series'}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function LegalConfigInitialPage() {
  const [data, setData] = useState(empty);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mappingError, setMappingError] = useState('');
  const [loading, setLoading] = useState(true);
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm);
  const [relationsSaving, setRelationsSaving] = useState(false);
  const [documentSaving, setDocumentSaving] = useState(false);
  const [mappingSaving, setMappingSaving] = useState(false);
  const [showActuationForm, setShowActuationForm] = useState(false);
  const [actuationName, setActuationName] = useState('');
  const [actuationQuery, setActuationQuery] = useState('');
  const [documentQuery, setDocumentQuery] = useState('');
  const [actuationSaving, setActuationSaving] = useState(false);
  const [catalogueModalOpen, setCatalogueModalOpen] = useState(false);
  const [catalogueTab, setCatalogueTab] = useState('typologies');
  const [catalogueSaving, setCatalogueSaving] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [conditionSaving, setConditionSaving] = useState(false);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [seriesSaving, setSeriesSaving] = useState(false);
  const savingRelations = useRef(Promise.resolve());
  const relationSavePending = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await LegalConfigService.workspace();
      const nextData = { ...empty, ...(response.data || {}) };
      setData(nextData);
      setSelected((current) => {
        if (nextData.actuations.some((item) => item.id === current && item.is_active !== false)) return current;
        return nextData.actuations.find((item) => item.is_active !== false)?.id || nextData.actuations[0]?.id || '';
      });
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createCatalogue(catalogue, name) {
    try {
      const response = await LegalConfigService.create(catalogue, { name, code: name });
      await load();
      setError('');
      return response.data;
    } catch (createError) {
      setNotice('');
      setError(errorMessage(createError));
      return null;
    }
  }

  async function createManagedCatalogue(catalogue, name) {
    if (!name || catalogueSaving) return null;
    setCatalogueSaving(true);
    try {
      return await createCatalogue(catalogue, name);
    } finally { setCatalogueSaving(false); }
  }

  async function toggleCatalogue(catalogue, item) {
    if (catalogueSaving) return null;
    setCatalogueSaving(true);
    try {
      const response = await LegalConfigService.update(catalogue, item.id, { is_active: !item.is_active });
      setData((current) => ({
        ...current,
        [catalogue]: current[catalogue].map((candidate) => candidate.id === item.id ? response.data : candidate),
      }));
      setError('');
      setNotice(`${catalogue === 'typologies' ? 'Tipología' : 'Etiqueta'} ${item.is_active ? 'desactivada' : 'activada'}.`);
      return response.data;
    } catch (saveError) {
      setNotice('');
      setError(errorMessage(saveError));
      return null;
    } finally { setCatalogueSaving(false); }
  }

  async function saveDocument(event) {
    event.preventDefault();
    if (documentSaving) return;
    setDocumentSaving(true);
    try {
      const payload = {
        ...documentForm,
        typology_id: documentForm.typology_id || null,
        label_ids: documentForm.label_ids || [],
        ...(documentForm.parent_document_id ? { variant_code: documentForm.code } : {}),
      };
      await LegalConfigService.create('documents', payload);
      setDocumentForm(emptyDocumentForm);
      setError('');
      setNotice('Documento guardado.');
      await load();
    } catch (saveError) {
      setNotice('');
      setError(errorMessage(saveError));
    } finally { setDocumentSaving(false); }
  }

  async function saveActuation(event) {
    event.preventDefault();
    const name = actuationName.trim();
    if (!name || actuationSaving) return;
    setActuationSaving(true);
    const created = await createCatalogue('actuations', name);
    if (created) {
      setSelected(created.id);
      setActuationName('');
      setShowActuationForm(false);
      setNotice('Actuación creada. Ya puedes configurar sus asociaciones.');
    }
    setActuationSaving(false);
  }

  async function createCondition(payload) {
    if (conditionSaving) return null;
    setConditionSaving(true);
    try {
      const response = await LegalConfigService.create('conditions', payload);
      await load();
      setError('');
      setNotice('Condición creada.');
      return response.data;
    } catch (createError) {
      setNotice('');
      setError(errorMessage(createError));
      return null;
    } finally { setConditionSaving(false); }
  }

  async function saveSeries(changes) {
    if (!changes.length || seriesSaving) return false;
    setSeriesSaving(true);
    try {
      await Promise.all(changes.map((item) => LegalConfigService.update('actuations', item.id, {
        name: item.name,
        code: item.code,
        is_active: item.is_active,
        sort_order: item.sort_order || 0,
      })));
      await load();
      setError('');
      setNotice('Series y subseries guardadas.');
      return true;
    } catch (saveError) {
      setNotice('');
      setError(errorMessage(saveError));
      return false;
    } finally { setSeriesSaving(false); }
  }

  const actuationRelations = useMemo(() => ({
    typology_ids: data.actuationTypologies
      .filter((row) => row.actuation_id === selected)
      .map((row) => row.typology_id),
    label_ids: data.actuationLabels
      .filter((row) => row.actuation_id === selected)
      .map((row) => row.label_id),
    document_ids: data.directDocuments
      .filter((row) => row.actuation_id === selected)
      .map((row) => row.document_id),
    condition_ids: data.actuationConditions
      .filter((row) => row.actuation_id === selected)
      .map((row) => row.condition_id),
  }), [data, selected]);

  const selectedActuation = data.actuations.find((item) => item.id === selected);
  const selectedParentDocument = data.documents.find((item) => item.id === documentForm.parent_document_id);
  const canSaveDocument = Boolean(
    documentForm.name.trim()
    && documentForm.code.trim()
    && !loading
    && !documentSaving
  );
  const visibleActuations = useMemo(() => {
    const query = actuationQuery.trim().toLocaleLowerCase('es');
    if (!query) return data.actuations;
    const visibleIds = new Set();
    data.actuations.forEach((item) => {
      const searchable = `${item.name || ''}`.toLocaleLowerCase('es');
      if (!searchable.includes(query)) return;
      visibleIds.add(item.id);
      if (item.parent_id) visibleIds.add(item.parent_id);
      else data.actuations.forEach((candidate) => {
        if (candidate.parent_id === item.id) visibleIds.add(candidate.id);
      });
    });
    return data.actuations.filter((item) => visibleIds.has(item.id));
  }, [actuationQuery, data.actuations]);

  const documentGroups = useMemo(() => {
    const query = documentQuery.trim().toLocaleLowerCase('es');
    const labelNames = (document) => data.documentLabels
      .filter((row) => row.document_id === document.id)
      .map((row) => data.labels.find((item) => item.id === row.label_id)?.name)
      .filter(Boolean);
    const matches = (document) => [
      document.code,
      document.name,
      data.typologies.find((item) => item.id === document.typology_id)?.name,
      ...labelNames(document),
    ].filter(Boolean).join(' ').toLocaleLowerCase('es').includes(query);

    return byParent(data.documents)
      .map((parent) => ({
        ...parent,
        variants: byParent(data.documents, parent.id),
      }))
      .filter((parent) => !query || matches(parent) || parent.variants.some(matches));
  }, [data.documentLabels, data.documents, data.labels, data.typologies, documentQuery]);

  const documentTableColumns = useMemo(() => [
    { name: 'Código', selector: (document) => document.code, sortable: true, width: '120px' },
    {
      name: 'Documento',
      selector: (document) => document.name,
      sortable: true,
      cell: (document) => (
        <span className="legal-config-document-name">
          <span><strong>{document.name}</strong>{document.variants.length > 0 && <small>{document.variants.length} {document.variants.length === 1 ? 'variante' : 'variantes'} · {document.variants.map((item) => item.name).join(' · ')}</small>}</span>
        </span>
      ),
    },
    {
      name: 'Tipología',
      selector: (document) => data.typologies.find((item) => item.id === document.typology_id)?.name || 'Sin tipología',
      sortable: true,
    },
    {
      name: 'Etiquetas',
      selector: (document) => data.documentLabels
        .filter((row) => row.document_id === document.id)
        .map((row) => data.labels.find((item) => item.id === row.label_id)?.name)
        .filter(Boolean)
        .join(', ') || 'Sin etiquetas',
      sortable: true,
    },
    {
      name: 'Estado',
      selector: (document) => document.is_active === false ? 'Inactivo' : 'Activo',
      sortable: true,
      width: '110px',
    },
  ], [data.documentLabels, data.labels, data.typologies]);

  function DocumentVariants({ data: parent }) {
    const variants = parent.variants.filter((variant) => !documentQuery.trim() || `${variant.code} ${variant.name}`.toLocaleLowerCase('es').includes(documentQuery.trim().toLocaleLowerCase('es')));
    return (
      <div className="legal-config-document-variants" aria-label={`Variantes de ${parent.name}`}>
        {variants.map((variant) => <span key={variant.id}><CornerDownRight size={14} aria-hidden="true" /><code>{variant.code}</code><strong>{variant.name}</strong></span>)}
      </div>
    );
  }

  function selectParentDocument(parent_document_id) {
    const parent = data.documents.find((item) => item.id === parent_document_id);
    if (!parent) {
      setDocumentForm((current) => ({ ...current, parent_document_id: '' }));
      return;
    }
    const label_ids = data.documentLabels
      .filter((row) => row.document_id === parent.id)
      .map((row) => row.label_id);
    setDocumentForm((current) => ({
      ...current,
      parent_document_id,
      typology_id: parent.typology_id || '',
      label_ids,
    }));
  }

  function saveRelations(key, relationIds) {
    if (relationSavePending.current || !selectedActuation) return;
    const actuationId = selected;
    const revision = selectedActuation.revision;
    const payload = { ...actuationRelations, [key]: relationIds, revision };

    relationSavePending.current = true;
    setRelationsSaving(true);
    savingRelations.current = savingRelations.current
      .catch(() => undefined)
      .then(async () => {
        const response = await LegalConfigService.saveAssociations(actuationId, payload);

        setData((current) => ({
          ...current,
          actuations: current.actuations.map((item) => (
            item.id === actuationId ? { ...item, revision: response.data.revision } : item
          )),
          actuationTypologies: current.actuationTypologies
            .filter((row) => row.actuation_id !== actuationId)
            .concat(payload.typology_ids.map((typology_id) => ({ actuation_id: actuationId, typology_id }))),
          actuationLabels: current.actuationLabels
            .filter((row) => row.actuation_id !== actuationId)
            .concat(payload.label_ids.map((label_id) => ({ actuation_id: actuationId, label_id }))),
          directDocuments: current.directDocuments
            .filter((row) => row.actuation_id !== actuationId)
            .concat(payload.document_ids.map((document_id) => ({ actuation_id: actuationId, document_id }))),
          actuationConditions: current.actuationConditions
            .filter((row) => row.actuation_id !== actuationId)
            .concat(payload.condition_ids.map((condition_id) => ({ actuation_id: actuationId, condition_id }))),
        }));
        setError('');
        setNotice('Asociaciones guardadas.');
      })
      .catch(async (saveError) => {
        setNotice('');
        if (saveError?.response?.status === 409) {
          await load();
          setError('La configuración se actualizó y el cambio de asociación no se guardó. Revisa los datos actuales antes de intentarlo de nuevo.');
          return;
        }
        setError(errorMessage(saveError));
      }).finally(() => { relationSavePending.current = false; setRelationsSaving(false); });
  }

  async function saveLegacyActuationType(event) {
    if (mappingSaving) return;
    setMappingSaving(true);
    const legacy_actuation_type_id = event.target.value || null;
    try {
      const response = await LegalConfigService.update('actuations', selected, { legacy_actuation_type_id, revision: selectedActuation?.revision });
      setData((current) => ({ ...current, actuations: current.actuations.map((item) => item.id === selected ? response.data : item) }));
      setMappingError('');
      setError('');
      setNotice('Vínculo con actuación heredada guardado.');
    } catch (saveError) {
      setNotice('');
      const stale = saveError?.response?.status === 409;
      if (stale) await load();
      const message = stale
        ? 'La configuración se actualizó y el vínculo heredado no se guardó. Revisa los datos actuales antes de intentarlo de nuevo.'
        : errorMessage(saveError);
      setError(message);
      setMappingError(message);
    } finally { setMappingSaving(false); }
  }

  return (
    <main className="legal-config-workspace" aria-labelledby="legal-config-title">
      <header className="legal-config-header">
        <div className="legal-config-header__copy">
          <p className="legal-config-eyebrow">Matriz de configuración</p>
          <h2 id="legal-config-title">Documentos y actuaciones</h2>
        </div>
        <div className="legal-config-header__actions">
          <div className="legal-config-metrics" aria-label="Resumen del catálogo">
            <span><strong>{data.actuations.length}</strong> actuaciones</span>
            <span><strong>{data.documents.length}</strong> documentos</span>
            <span><strong>{data.typologies.length}</strong> tipologías</span>
            <span><strong>{data.conditions.length}</strong> condiciones</span>
          </div>
          <button className="legal-config-button legal-config-button--secondary" type="button" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? 'is-spinning' : ''} size={16} aria-hidden="true" /> Actualizar
          </button>
        </div>
      </header>

      <div className="legal-config-feedback" aria-live="polite">
        {error && <p className="legal-config-error" role="alert"><AlertCircle size={16} aria-hidden="true" />{error}</p>}
        {notice && <p className="legal-config-notice" role="status">{notice}</p>}
        {loading && <p className="legal-config-loading" role="status"><LoaderCircle className="is-spinning" size={16} aria-hidden="true" />Cargando configuración…</p>}
      </div>

      <div className="legal-config-grid">
        <section className="legal-config-panel legal-config-actuations" aria-labelledby="legal-config-actuations-title">
          <div className="panel-title">
            <div className="panel-title__copy">
              <span className="panel-title__icon"><GitBranch size={17} aria-hidden="true" /></span>
              <h3 id="legal-config-actuations-title">Actuaciones</h3>
            </div>
            <div className="panel-title__actions">
              <button className="legal-config-button legal-config-button--compact" type="button" onClick={() => setSeriesModalOpen(true)} disabled={loading || seriesSaving}>
                <Library size={14} aria-hidden="true" /> Series y subseries
              </button>
              <button
                className="legal-config-button legal-config-button--compact"
                type="button"
                onClick={() => setShowActuationForm((current) => !current)}
                aria-expanded={showActuationForm}
                disabled={loading || actuationSaving}
              >
                {showActuationForm ? <X size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
                {showActuationForm ? 'Cancelar' : 'Nueva actuación'}
              </button>
            </div>
          </div>

          {showActuationForm && (
            <form className="actuation-create-form" onSubmit={saveActuation}>
              <label htmlFor="new-actuation-name">Nombre de la actuación</label>
              <div>
                <input
                  id="new-actuation-name"
                  autoFocus
                  required
                  value={actuationName}
                  onChange={(event) => setActuationName(event.target.value)}
                  disabled={actuationSaving}
                  placeholder="Ej. Reconocimiento"
                />
                <button className="legal-config-button legal-config-button--primary" type="submit" disabled={!actuationName.trim() || actuationSaving}>
                  {actuationSaving ? 'Creando…' : 'Crear actuación'}
                </button>
              </div>
            </form>
          )}

          <div className="actuation-search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              aria-label="Buscar actuación"
              value={actuationQuery}
              onChange={(event) => setActuationQuery(event.target.value)}
              placeholder="Buscar por nombre"
              disabled={loading}
            />
            {actuationQuery && (
              <button type="button" aria-label="Limpiar búsqueda" onClick={() => setActuationQuery('')}>
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="actuation-list">
            {visibleActuations.map((item) => (
              <button
                type="button"
                className={`${item.id === selected ? 'selected' : ''}${item.parent_id ? ' is-child' : ''}`.trim()}
                key={item.id}
                onClick={() => setSelected(item.id)}
                disabled={loading || relationSavePending.current || mappingSaving}
                aria-pressed={item.id === selected}
                aria-label={item.name}
              >
                <span className="actuation-list__name">
                  {item.parent_id && <CornerDownRight size={13} aria-hidden="true" />}
                  {item.name}
                </span>
                {!item.is_active && <span className="actuation-list__meta">Inactiva</span>}
              </button>
            ))}
            {!loading && data.actuations.length > 0 && visibleActuations.length === 0 && (
              <div className="legal-config-empty-state legal-config-empty-state--compact">
                <Search size={22} aria-hidden="true" />
                <strong>Sin coincidencias</strong>
                <p>Prueba con otro nombre de actuación.</p>
                <button type="button" onClick={() => setActuationQuery('')}>Limpiar búsqueda</button>
              </div>
            )}
            {!loading && data.actuations.length === 0 && (
              <div className="legal-config-empty-state">
                <GitBranch size={22} aria-hidden="true" />
                <strong>Aún no hay actuaciones</strong>
                <p>Crea una actuación para empezar a relacionar tipologías, etiquetas y documentos.</p>
                {!showActuationForm && <button type="button" onClick={() => setShowActuationForm(true)}>Crear la primera actuación</button>}
              </div>
            )}
          </div>
        </section>

        <section className="legal-config-panel legal-config-documents" aria-labelledby="legal-config-documents-title">
          <div className="panel-title">
            <div className="panel-title__copy">
              <span className="panel-title__icon"><FileText size={17} aria-hidden="true" /></span>
              <h3 id="legal-config-documents-title">Catálogo documental</h3>
            </div>
            <div className="panel-title__actions">
              <span className="legal-config-count">{data.documents.length}</span>
              <button className="legal-config-button legal-config-button--compact" type="button" onClick={() => setCatalogueModalOpen(true)} disabled={loading}>
                <Settings2 size={14} aria-hidden="true" /> Gestionar catálogos
              </button>
            </div>
          </div>
          <form onSubmit={saveDocument} className="document-form">
            <label>
              Nombre
              <input required disabled={loading || documentSaving} value={documentForm.name} placeholder="Ej. Certificado de tradición" onChange={(event) => setDocumentForm({ ...documentForm, name: event.target.value })} />
            </label>
            <label>
              Código
              <input required disabled={loading || documentSaving} value={documentForm.code} placeholder="Ej. DOC-101" onChange={(event) => setDocumentForm({ ...documentForm, code: event.target.value })} />
            </label>
             <CatalogueSelect label="Tipología" values={data.typologies} value={documentForm.typology_id} onChange={(typology_id) => setDocumentForm({ ...documentForm, typology_id })} creatable={false} disabled={loading || documentSaving || Boolean(selectedParentDocument)} />
             <CatalogueSelect label="Etiquetas" values={data.labels} value={documentForm.label_ids} multiple onChange={(label_ids) => setDocumentForm({ ...documentForm, label_ids })} creatable={false} disabled={loading || documentSaving || Boolean(selectedParentDocument)} />
            <label>
              Variante de
               <select disabled={loading || documentSaving} value={documentForm.parent_document_id} onChange={(event) => selectParentDocument(event.target.value)}>
                <option value="">Documento principal</option>
                {byParent(data.documents).map((document) => <option key={document.id} value={document.id}>{document.name}</option>)}
              </select>
            </label>
            {selectedParentDocument && (
              <div className="document-form__variant-preview" aria-label="Vista previa de variante">
                <span><small>Documento base</small><strong>{selectedParentDocument.name}</strong></span>
                <CornerDownRight size={16} aria-hidden="true" />
                <span><small>Código resultante</small><code>{selectedParentDocument.code}-{documentForm.code || '…'}</code></span>
              </div>
            )}
             <button className="legal-config-button legal-config-button--primary document-form__submit" type="submit" disabled={!canSaveDocument}>{documentSaving ? 'Guardando documento…' : 'Guardar documento'}</button>
            {documentSaving && <p className="document-form__status" aria-live="polite">Guardando documento…</p>}
          </form>
          <label className="document-catalogue-search">
            <Search size={15} aria-hidden="true" />
            <span className="sr-only">Buscar documentos</span>
            <input
              type="search"
              aria-label="Buscar documentos"
              value={documentQuery}
              onChange={(event) => setDocumentQuery(event.target.value)}
              placeholder="Buscar por código, documento o tipología"
              disabled={loading}
            />
          </label>
          <DataTableBridge
            className="legal-config-document-table"
            columns={documentTableColumns}
            data={documentGroups}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 50]}
            dense
            highlightOnHover
            expandableRows
            expandableRowsComponent={DocumentVariants}
            expandableRowDisabled={(document) => !document.variants.length}
            progressPending={loading}
            noDataComponent="Aún no hay documentos"
          />
        </section>

        <aside className="legal-config-panel legal-config-associations" aria-labelledby="legal-config-associations-title">
          <div className="panel-title">
            <div className="panel-title__copy">
              <span className="panel-title__icon"><Link2 size={17} aria-hidden="true" /></span>
              <h3 id="legal-config-associations-title">Asociaciones</h3>
            </div>
            <button className="legal-config-button legal-config-button--compact" type="button" onClick={() => setConditionModalOpen(true)} disabled={loading || !selectedActuation || conditionSaving}>
              <Plus size={14} aria-hidden="true" /> Nueva condición
            </button>
          </div>
          {selectedActuation ? (
            <div className="association-editor">
              <div className="association-editor__context">
                <Layers3 size={16} aria-hidden="true" />
                <span><small>Configurando</small><strong>{selectedActuation.name}</strong></span>
              </div>
              <label className="catalogue-bridge-field">
                <span>Actuación heredada para generación</span>
                 <select value={selectedActuation.legacy_actuation_type_id || ''} onChange={saveLegacyActuationType} disabled={loading || mappingSaving || relationsSaving} aria-label="Actuación heredada para generación" aria-describedby={`legacy-actuation-help${mappingError ? ' legacy-actuation-error' : ''}`}>
                  <option value="">Sin vínculo: conservar generación heredada</option>
                  {data.legacyActuationTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <small id="legacy-actuation-help">El catálogo suma documentos solo para esta actuación; no se vincula por nombre ni hereda de actuaciones padre.</small>
                {mappingError && <small id="legacy-actuation-error">{mappingError}</small>}
                {mappingSaving && <small aria-live="polite">Guardando vínculo…</small>}
              </label>
              {relationsSaving && <p aria-live="polite">Guardando asociaciones…</p>}
               <CatalogueSelect label="Tipologías" values={data.typologies} value={actuationRelations.typology_ids} multiple creatable={false} onChange={(ids) => saveRelations('typology_ids', ids)} disabled={loading || relationsSaving || mappingSaving} />
               <CatalogueSelect label="Etiquetas" values={data.labels} value={actuationRelations.label_ids} multiple creatable={false} onChange={(ids) => saveRelations('label_ids', ids)} disabled={loading || relationsSaving || mappingSaving} />
               <CatalogueSelect label="Documentos directos" values={byParent(data.documents)} value={actuationRelations.document_ids} multiple creatable={false} onChange={(ids) => saveRelations('document_ids', ids)} disabled={loading || relationsSaving || mappingSaving} />
               <div className="condition-associations">
                 <CatalogueSelect label="Condiciones" values={data.conditions} value={actuationRelations.condition_ids} multiple creatable={false} onChange={(ids) => saveRelations('condition_ids', ids)} disabled={loading || relationsSaving || mappingSaving} />
                 {actuationRelations.condition_ids.map((conditionId) => {
                   const condition = data.conditions.find((item) => item.id === conditionId);
                   const field = data.conditionFields.find((item) => item.key === condition?.source_key);
                   const values = (condition?.expected_values || []).map((expected) => field?.values?.find((item) => item.value === expected)?.label || expected);
                   const documentCount = data.conditionDocuments.filter((item) => item.condition_id === conditionId).length;
                   if (!condition) return null;
                   return (
                     <div className="condition-associations__row" key={condition.id}>
                       <span><strong>{condition.name}</strong><small>{field?.label || condition.source_key}: {values.join(', ')}</small></span>
                       <span>{condition.effect === 'exclude' ? 'Excluye' : 'Añade'} {documentCount}</span>
                     </div>
                   );
                 })}
               </div>
            </div>
          ) : (
            <div className="legal-config-empty-state">
              <Link2 size={22} aria-hidden="true" />
              <strong>Sin actuación seleccionada</strong>
              <p>Selecciona una actuación para asociar catálogos y documentos.</p>
            </div>
          )}
        </aside>
      </div>
      <CatalogueManagerDialog
        open={catalogueModalOpen}
        onOpenChange={setCatalogueModalOpen}
        tab={catalogueTab}
        onTabChange={setCatalogueTab}
        values={{ typologies: data.typologies, labels: data.labels }}
        onCreate={createManagedCatalogue}
        onToggleActive={toggleCatalogue}
        saving={catalogueSaving}
      />
      <SeriesDialog
        open={seriesModalOpen}
        onOpenChange={setSeriesModalOpen}
        actuations={data.actuations}
        onSave={saveSeries}
        saving={seriesSaving}
      />
      {selectedActuation && (
        <ConditionDialog
          open={conditionModalOpen}
          onOpenChange={setConditionModalOpen}
          fields={data.conditionFields}
          documents={byParent(data.documents)}
          actuation={selectedActuation}
          onSave={createCondition}
          saving={conditionSaving}
        />
      )}
    </main>
  );
}
