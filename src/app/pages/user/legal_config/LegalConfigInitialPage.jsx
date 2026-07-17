import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ChevronRight,
  CornerDownRight,
  FileText,
  GitBranch,
  Layers3,
  Link2,
  Library,
  ListChecks,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import LegalConfigService from '@/app/services/legal_config.service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/data-table';
import './LegalConfigInitialPage.css';

const empty = {
  actuations: [], typologies: [], labels: [], documents: [], documentLabels: [],
  actuationTypologies: [], actuationLabels: [], directDocuments: [],
  conditions: [], conditionFields: [], conditionDocuments: [], actuationConditions: [],
};

const emptyDocumentForm = {
  name: '', code: '', description: '', typology_id: '', label_ids: [], parent_document_id: '',
  is_active: true, sort_order: 0,
};

const errorMessage = (error) => (
  error?.response?.data?.message || error?.message || 'No fue posible guardar el cambio.'
);

const byParent = (rows, parentId = null) => (
  rows.filter((row) => (row.parent_document_id || null) === parentId)
);

const documentFormFrom = (document, documentLabels) => ({
  ...emptyDocumentForm,
  name: document?.name || '',
  code: document?.code || '',
  description: document?.description || '',
  typology_id: document?.typology_id || '',
  label_ids: documentLabels
    .filter((row) => row.document_id === document?.id)
    .map((row) => row.label_id),
  parent_document_id: document?.parent_document_id || '',
  is_active: document?.is_active !== false,
  sort_order: Number(document?.sort_order || 0),
});

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

function DocumentEditorDialog({
  open,
  onOpenChange,
  document,
  documents,
  typologies,
  labels,
  documentLabels,
  onSave,
  saving,
}) {
  const [form, setForm] = useState(emptyDocumentForm);
  const [submitError, setSubmitError] = useState('');
  const instanceId = useId().replace(/:/g, '');
  const editing = Boolean(document);
  const selectedParent = documents.find((item) => item.id === form.parent_document_id);
  const isVariant = Boolean(form.parent_document_id);
  const inheritedTypology = typologies.find((item) => item.id === form.typology_id)?.name || 'Sin tipología';
  const inheritedLabels = form.label_ids
    .map((id) => labels.find((item) => item.id === id)?.name)
    .filter(Boolean);
  const parentOptions = byParent(documents).filter((item) => item.is_active !== false);
  const canSave = Boolean(form.name.trim() && form.code.trim() && !saving);

  useEffect(() => {
    if (!open) return;
    setForm(document ? documentFormFrom(document, documentLabels) : emptyDocumentForm);
    setSubmitError('');
  }, [document, documentLabels, open]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectParent(parentId) {
    const parent = documents.find((item) => item.id === parentId);
    if (!parent) {
      setForm((current) => ({
        ...current,
        parent_document_id: '',
        typology_id: '',
        label_ids: [],
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      parent_document_id: parentId,
      typology_id: parent.typology_id || '',
      label_ids: documentLabels
        .filter((row) => row.document_id === parent.id)
        .map((row) => row.label_id),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!canSave) return;
    setSubmitError('');
    const result = await onSave(form, document);
    if (result?.ok) onOpenChange(false);
    else setSubmitError(result?.message || 'No fue posible guardar el documento.');
  }

  function changeOpen(nextOpen) {
    if (saving) return;
    if (!nextOpen) setSubmitError('');
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="legal-config-document-dialog" aria-describedby={`${instanceId}-dialog-description`}>
        <DialogHeader className="legal-config-document-dialog__header">
          <DialogTitle>
            {editing ? <Pencil size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
            {editing ? 'Editar documento' : 'Nuevo documento'}
          </DialogTitle>
          <DialogDescription id={`${instanceId}-dialog-description`}>
            {editing
              ? 'Actualiza los datos administrables. El código y la relación con el documento principal permanecen estables.'
              : 'Registra un documento principal o una variante dentro del catálogo documental.'}
          </DialogDescription>
        </DialogHeader>

        <form className="document-editor" onSubmit={submit}>
          {submitError && <p className="document-editor__error" role="alert">{submitError}</p>}

          <div className="document-editor__grid">
            <label className="document-editor__field document-editor__field--full" htmlFor={`${instanceId}-name`}>
              <span>Nombre <b aria-hidden="true">*</b></span>
              <input
                id={`${instanceId}-name`}
                required
                autoFocus
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                placeholder="Ej. Certificado de tradición"
                disabled={saving}
              />
            </label>

            <label className="document-editor__field" htmlFor={`${instanceId}-code`}>
              <span>{!editing && isVariant ? 'Sufijo del código' : 'Código'} <b aria-hidden="true">*</b></span>
              <input
                id={`${instanceId}-code`}
                required
                value={form.code}
                onChange={(event) => setField('code', event.target.value)}
                placeholder={!editing && isVariant ? 'Ej. ANEXO' : 'Ej. DOC-101'}
                readOnly={editing}
                aria-readonly={editing}
                disabled={saving}
              />
              {editing && <small>Identificador estable; no se modifica después de crear el documento.</small>}
            </label>

            {editing ? (
              <div className="document-editor__static-field" aria-label="Tipo de documento">
                <span>{isVariant ? 'Variante de' : 'Tipo de documento'}</span>
                <strong>{isVariant ? (selectedParent?.name || 'Documento principal no disponible') : 'Documento principal'}</strong>
              </div>
            ) : (
              <label className="document-editor__field" htmlFor={`${instanceId}-parent`}>
                <span>Variante de</span>
                <select
                  id={`${instanceId}-parent`}
                  value={form.parent_document_id}
                  onChange={(event) => selectParent(event.target.value)}
                  disabled={saving}
                >
                  <option value="">Documento principal</option>
                  {parentOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <small>Selecciona un documento principal solo si este registro es una variante.</small>
              </label>
            )}

            {!editing && selectedParent && (
              <div className="document-editor__variant-preview" aria-label="Vista previa de la variante">
                <span><small>Documento principal</small><strong>{selectedParent.name}</strong></span>
                <CornerDownRight size={16} aria-hidden="true" />
                <span><small>Código resultante</small><code>{selectedParent.code}-{form.code || '…'}</code></span>
              </div>
            )}

            <label className="document-editor__field document-editor__field--full" htmlFor={`${instanceId}-description`}>
              <span>Descripción</span>
              <textarea
                id={`${instanceId}-description`}
                value={form.description}
                onChange={(event) => setField('description', event.target.value)}
                placeholder="Describe el propósito o alcance del documento"
                disabled={saving}
              />
            </label>

            {isVariant ? (
              <div className="document-editor__inherited" aria-label="Clasificación heredada del documento principal">
                <span><small>Tipología heredada</small><strong>{inheritedTypology}</strong></span>
                <span><small>Etiquetas heredadas</small><strong>{inheritedLabels.join(', ') || 'Sin etiquetas'}</strong></span>
              </div>
            ) : (
              <>
                <CatalogueSelect
                  label="Tipología"
                  values={typologies}
                  value={form.typology_id}
                  onChange={(typologyId) => setField('typology_id', typologyId)}
                  creatable={false}
                  disabled={saving}
                />
                <CatalogueSelect
                  label="Etiquetas"
                  values={labels}
                  value={form.label_ids}
                  multiple
                  onChange={(labelIds) => setField('label_ids', labelIds)}
                  creatable={false}
                  disabled={saving}
                />
              </>
            )}

            <label className="document-editor__field" htmlFor={`${instanceId}-status`}>
              <span>Estado</span>
              <select
                id={`${instanceId}-status`}
                value={form.is_active ? 'active' : 'inactive'}
                onChange={(event) => setField('is_active', event.target.value === 'active')}
                disabled={saving}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </label>

            <label className="document-editor__field" htmlFor={`${instanceId}-order`}>
              <span>Orden</span>
              <input
                id={`${instanceId}-order`}
                type="number"
                min="0"
                step="1"
                value={form.sort_order}
                onChange={(event) => setField('sort_order', Number(event.target.value || 0))}
                disabled={saving}
              />
              <small>Los valores menores aparecen primero.</small>
            </label>
          </div>

          <DialogFooter className="document-editor__footer">
            <button type="button" className="legal-config-button" onClick={() => changeOpen(false)} disabled={saving}>Cancelar</button>
            <button type="submit" className="legal-config-button legal-config-button--primary" disabled={!canSave}>
              {saving ? 'Guardando…' : (editing ? 'Guardar cambios' : 'Crear documento')}
            </button>
          </DialogFooter>
        </form>
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

function SeriesDialog({ open, onOpenChange, actuations, onSave, onReload, saving }) {
  const [codes, setCodes] = useState({});
  const [newSubserie, setNewSubserie] = useState({});
  const [subserieSavingId, setSubserieSavingId] = useState('');
  const [subserieError, setSubserieError] = useState('');
  const roots = actuations.filter((item) => !item.parent_id);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) { wasOpen.current = false; return; }
    const justOpened = !wasOpen.current;
    wasOpen.current = true;
    const rootCodes = Object.fromEntries(roots.map((item) => [item.id, item.code || '']));
    // Solo se inicializa por completo al abrir; mientras sigue abierto, un reload de fondo (p. ej. tras
    // crear una subserie) únicamente agrega códigos para filas nuevas, sin pisar ediciones en curso.
    setCodes((current) => {
      const next = justOpened ? {} : { ...current };
      actuations.forEach((item) => {
        if (!justOpened && next[item.id] !== undefined) return;
        if (!item.parent_id) { next[item.id] = item.code || ''; return; }
        const parentCode = rootCodes[item.parent_id] || '';
        const existing = item.code || '';
        next[item.id] = parentCode && existing.startsWith(parentCode) && existing.length > parentCode.length
          ? existing.slice(parentCode.length)
          : '';
      });
      return next;
    });
    if (justOpened) { setNewSubserie({}); setSubserieError(''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actuations, open]);

  function composedCode(item) {
    if (!item.parent_id) return codes[item.id] || '';
    return `${codes[item.parent_id] || ''}${codes[item.id] || ''}`;
  }

  const changes = actuations.filter((item) => {
    if (item.parent_id && !(codes[item.id] || '').trim()) return false;
    return composedCode(item).trim() !== (item.code || '');
  });

  async function submit(event) {
    event.preventDefault();
    const saved = await onSave(changes.map((item) => ({ ...item, code: composedCode(item).trim() })));
    if (saved) onOpenChange(false);
  }

  async function createSubserie(seriesId, name, suffix) {
    const series = actuations.find((item) => item.id === seriesId);
    const payload = { name: name.trim(), code: `${series.code}${suffix.trim()}`, parent_id: seriesId };
    return LegalConfigService.create('actuations', payload);
  }

  function updateDraft(seriesId, field, value) {
    setNewSubserie((current) => ({ ...current, [seriesId]: { ...(current[seriesId] || { name: '', suffix: '' }), [field]: value } }));
  }

  async function submitSubserie(seriesId) {
    const draft = newSubserie[seriesId] || { name: '', suffix: '' };
    if (!draft.name.trim() || !draft.suffix.trim() || subserieSavingId) return;
    setSubserieSavingId(seriesId);
    setSubserieError('');
    try {
      await createSubserie(seriesId, draft.name, draft.suffix);
      setNewSubserie((current) => ({ ...current, [seriesId]: { name: '', suffix: '' } }));
      await onReload();
    } catch (createError) {
      setSubserieError(errorMessage(createError));
    } finally {
      setSubserieSavingId('');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="legal-config-series-dialog" aria-label="Series y subseries" aria-describedby={undefined}>
        <DialogHeader className="legal-config-series-dialog__header">
          <DialogTitle><Library size={18} aria-hidden="true" /> Series y subseries</DialogTitle>
        </DialogHeader>
        {subserieError && <p className="series-form__error" role="alert">{subserieError}</p>}
        <form className="series-form" onSubmit={submit}>
          <div className="series-form__list">
            {roots.map((series) => {
              const subseries = actuations.filter((item) => item.parent_id === series.id);
              const draft = newSubserie[series.id] || { name: '', suffix: '' };
              const seriesCode = codes[series.id] || '';
              const canCreateSubserie = Boolean(draft.name.trim() && draft.suffix.trim()) && !saving && subserieSavingId !== series.id;
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
                  {subseries.map((item) => {
                    const hintId = `series-form-hint-${item.id}`;
                    return (
                      <label className="series-form__row is-subseries" key={item.id}>
                        <span><small>Subserie</small><strong>{item.name}</strong></span>
                        <span className="series-form__code-field">
                          <span className="series-form__code-prefix" aria-hidden="true">{seriesCode || '—'}</span>
                          <input
                            aria-label={`Código de subserie para ${item.name}`}
                            aria-describedby={hintId}
                            value={codes[item.id] || ''}
                            onChange={(event) => setCodes((current) => ({ ...current, [item.id]: event.target.value }))}
                            disabled={saving}
                          />
                        </span>
                        <small id={hintId} className="series-form__code-hint">Código resultante: {composedCode(item).trim() || '—'}</small>
                      </label>
                    );
                  })}
                  <div className="series-form__create-subserie">
                    <label>
                      <span>Nueva subserie</span>
                      <input
                        aria-label={`Nombre de subserie nueva para ${series.name}`}
                        value={draft.name}
                        onChange={(event) => updateDraft(series.id, 'name', event.target.value)}
                        placeholder="Nombre de la subserie"
                        disabled={saving || subserieSavingId === series.id}
                      />
                    </label>
                    <span className="series-form__code-field">
                      <span className="series-form__code-prefix" aria-hidden="true">{seriesCode || '—'}</span>
                      <input
                        aria-label={`Código de subserie nueva para ${series.name}`}
                        value={draft.suffix}
                        onChange={(event) => updateDraft(series.id, 'suffix', event.target.value)}
                        placeholder="-01"
                        disabled={saving || subserieSavingId === series.id}
                      />
                    </span>
                    <button
                      type="button"
                      className="legal-config-button legal-config-button--compact"
                      onClick={() => submitSubserie(series.id)}
                      disabled={!canCreateSubserie}
                    >
                      {subserieSavingId === series.id ? 'Agregando…' : 'Agregar subserie'}
                    </button>
                  </div>
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

export default function LegalConfigInitialPage({ section = 'all' }) {
  const activeSection = ['documents', 'actuations'].includes(section) ? section : 'all';
  const showActuations = activeSection !== 'documents';
  const showDocuments = activeSection !== 'actuations';
  const workspaceTitle = activeSection === 'documents'
    ? 'Catálogo documental'
    : (activeSection === 'actuations' ? 'Actuaciones' : 'Documentos y actuaciones');
  const workspaceEyebrow = activeSection === 'documents' ? 'Configuración documental' : 'Matriz de configuración';
  const [data, setData] = useState(empty);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [relationsSaving, setRelationsSaving] = useState(false);
  const [documentSaving, setDocumentSaving] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState('');
  const documentModalTriggerRef = useRef(null);
  const newDocumentButtonRef = useRef(null);

  const [showActuationForm, setShowActuationForm] = useState(false);
  const [actuationName, setActuationName] = useState('');
  const [actuationQuery, setActuationQuery] = useState('');
  const [expandedSeries, setExpandedSeries] = useState({});
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

  async function saveDocument(form, document) {
    if (documentSaving) return { ok: false, message: 'Ya hay un documento guardándose.' };
    setDocumentSaving(true);
    try {
      const commonPayload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        is_active: form.is_active !== false,
        sort_order: Number(form.sort_order || 0),
      };

      if (document) {
        await LegalConfigService.update('documents', document.id, {
          ...commonPayload,
          ...(!document.parent_document_id ? {
            typology_id: form.typology_id || null,
            label_ids: form.label_ids || [],
          } : {}),
        });
      } else {
        await LegalConfigService.create('documents', {
          ...commonPayload,
          code: form.code.trim(),
          typology_id: form.typology_id || null,
          label_ids: form.label_ids || [],
          parent_document_id: form.parent_document_id || null,
          ...(form.parent_document_id ? { variant_code: form.code.trim() } : {}),
        });
      }

      setError('');
      setNotice(document ? 'Documento actualizado.' : 'Documento creado.');
      await load();
      return { ok: true };
    } catch (saveError) {
      const message = errorMessage(saveError);
      setNotice('');
      setError(message);
      return { ok: false, message };
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
      const roots = changes.filter((item) => !item.parent_id);
      const subseries = changes.filter((item) => item.parent_id);
      for (const item of [...roots, ...subseries]) {
        await LegalConfigService.update('actuations', item.id, {
          name: item.name,
          code: item.code,
          is_active: item.is_active,
          sort_order: item.sort_order || 0,
        });
      }
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
  const editingDocument = data.documents.find((item) => item.id === editingDocumentId);
  const openNewDocument = useCallback((event) => {
    documentModalTriggerRef.current = event?.currentTarget || newDocumentButtonRef.current;
    setEditingDocumentId('');
    setDocumentModalOpen(true);
  }, []);
  const openDocumentEditor = useCallback((documentId, event) => {
    documentModalTriggerRef.current = event?.currentTarget || newDocumentButtonRef.current;
    setEditingDocumentId(documentId);
    setDocumentModalOpen(true);
  }, []);
  const changeDocumentModalOpen = useCallback((nextOpen) => {
    setDocumentModalOpen(nextOpen);
    if (!nextOpen) {
      setEditingDocumentId('');
      window.requestAnimationFrame(() => {
        const trigger = documentModalTriggerRef.current;
        const focusTarget = trigger?.isConnected ? trigger : newDocumentButtonRef.current;
        focusTarget?.focus();
      });
    }
  }, []);

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

  const documentRows = useMemo(() => {
    const decorate = (document) => {
      const parent = data.documents.find((item) => item.id === document.parent_document_id);
      const labelNames = data.documentLabels
      .filter((row) => row.document_id === document.id)
      .map((row) => data.labels.find((item) => item.id === row.label_id)?.name)
      .filter(Boolean);
      return {
        ...document,
        parent_name: parent?.name || '',
        typology_name: data.typologies.find((item) => item.id === document.typology_id)?.name || '',
        label_names: labelNames,
        variant_count: byParent(data.documents, document.id).length,
      };
    };

    const grouped = [];
    const included = new Set();
    byParent(data.documents).forEach((parent) => {
      grouped.push(decorate(parent));
      included.add(parent.id);
      byParent(data.documents, parent.id).forEach((variant) => {
        grouped.push(decorate(variant));
        included.add(variant.id);
      });
    });
    data.documents.filter((item) => !included.has(item.id)).forEach((item) => grouped.push(decorate(item)));
    return grouped;
  }, [data.documentLabels, data.documents, data.labels, data.typologies]);

  const documentTableColumns = useMemo(() => [
    {
      accessorKey: 'code',
      header: 'Código',
      cell: ({ row }) => <code className="document-table__code">{row.original.code}</code>,
    },
    {
      id: 'document',
      header: 'Documento',
      accessorFn: (document) => `${document.name} ${document.parent_name} ${document.parent_document_id ? 'variante' : 'principal'}`,
      cell: ({ row }) => {
        const document = row.original;
        return (
          <div className={`document-table__name${document.parent_document_id ? ' is-variant' : ''}`}>
            <span>
              {document.parent_document_id && <CornerDownRight size={14} aria-hidden="true" />}
              <strong>{document.name}</strong>
            </span>
            <small>
              {document.parent_document_id
                ? `Variante de ${document.parent_name || 'documento principal'}`
                : (document.variant_count
                  ? `${document.variant_count} ${document.variant_count === 1 ? 'variante' : 'variantes'}`
                  : 'Documento principal')}
            </small>
          </div>
        );
      },
    },
    {
      id: 'typology',
      header: 'Tipología',
      accessorFn: (document) => document.typology_name || 'Sin tipología',
      cell: ({ row }) => <span className={!row.original.typology_name ? 'document-table__muted' : ''}>{row.original.typology_name || 'Sin tipología'}</span>,
    },
    {
      id: 'labels',
      header: 'Etiquetas',
      accessorFn: (document) => document.label_names.join(' ') || 'Sin etiquetas',
      cell: ({ row }) => {
        const names = row.original.label_names;
        if (!names.length) return <span className="document-table__muted">Sin etiquetas</span>;
        return (
          <span className="document-table__labels" title={names.join(', ')}>
            {names.slice(0, 2).map((name) => <span key={name}>{name}</span>)}
            {names.length > 2 && <span>+{names.length - 2}</span>}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Estado',
      accessorFn: (document) => document.is_active === false ? 'Inactivo' : 'Activo',
      cell: ({ row }) => (
        <span className={`document-table__status${row.original.is_active === false ? ' is-inactive' : ''}`}>
          {row.original.is_active === false ? 'Inactivo' : 'Activo'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <button
          type="button"
          className="legal-config-button legal-config-button--compact document-table__edit"
          onClick={(event) => openDocumentEditor(row.original.id, event)}
          aria-label={`Editar ${row.original.name}`}
        >
          <Pencil size={14} aria-hidden="true" /> Editar
        </button>
      ),
    },
  ], [openDocumentEditor]);

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

  function renderActuationItem(item, isChild = false) {
    const isSelected = item.id === selected;
    return (
      <button
        type="button"
        className={`actuation-list__item${isSelected ? ' selected' : ''}${isChild ? ' is-child' : ''}`}
        key={item.id}
        onClick={() => setSelected(item.id)}
        disabled={loading || relationSavePending.current}
        aria-pressed={isSelected}
        aria-label={item.name}
      >
        {isChild && <CornerDownRight size={13} className="actuation-list__child-icon" aria-hidden="true" />}
        <span className="actuation-list__body">
          <span className="actuation-list__name">{item.name}</span>
          <span className="actuation-list__code">{item.code || '—'}</span>
        </span>
        {!item.is_active && <span className="actuation-list__inactive">Inactiva</span>}
      </button>
    );
  }


  return (
    <main className="legal-config-workspace" aria-labelledby="legal-config-title">
      <header className="legal-config-header">
        <div className="legal-config-header__copy">
          <p className="legal-config-eyebrow">{workspaceEyebrow}</p>
          <h2 id="legal-config-title">{workspaceTitle}</h2>
        </div>
        <div className="legal-config-header__actions">
          <div className="legal-config-metrics" aria-label="Resumen del catálogo">
            {showActuations && <span><strong>{data.actuations.length}</strong> actuaciones</span>}
            {showDocuments && <span><strong>{data.documents.length}</strong> documentos</span>}
            {showDocuments && <span><strong>{data.typologies.length}</strong> tipologías</span>}
            {showActuations && <span><strong>{data.conditions.length}</strong> condiciones</span>}
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

      <div className={`legal-config-grid legal-config-grid--${activeSection}`}>
        {showActuations && (
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
            {visibleActuations.filter((item) => !item.parent_id).map((series) => {
              const children = visibleActuations.filter((item) => item.parent_id === series.id);
              const hasChildren = children.length > 0;
              const isOpen = hasChildren && (Boolean(actuationQuery.trim()) || expandedSeries[series.id] !== false);
              return (
                <div className="actuation-list__group" key={series.id}>
                  <div className="actuation-list__row">
                    {hasChildren ? (
                      <button
                        type="button"
                        className="actuation-list__disclosure"
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? 'Ocultar' : 'Mostrar'} subseries de ${series.name}`}
                        onClick={() => setExpandedSeries((current) => ({ ...current, [series.id]: !isOpen }))}
                        disabled={loading}
                      >
                        <ChevronRight size={14} aria-hidden="true" />
                      </button>
                    ) : <span className="actuation-list__disclosure-spacer" aria-hidden="true" />}
                    {renderActuationItem(series)}
                  </div>
                  {isOpen && children.map((item) => renderActuationItem(item, true))}
                </div>
              );
            })}
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
        )}

        {showDocuments && (
          <section className="legal-config-panel legal-config-documents" aria-labelledby="legal-config-documents-title">
          <div className="panel-title">
            <div className="panel-title__copy">
              <span className="panel-title__icon"><FileText size={17} aria-hidden="true" /></span>
              <span className="panel-title__heading">
                <h3 id="legal-config-documents-title">Documentos</h3>
                <small>Administra documentos principales y sus variantes.</small>
              </span>
            </div>
            <div className="panel-title__actions">
              <span className="legal-config-count">{data.documents.length}</span>
              <button className="legal-config-button" type="button" onClick={() => setCatalogueModalOpen(true)} disabled={loading}>
                <Settings2 size={14} aria-hidden="true" /> Gestionar catálogos
              </button>
              <button ref={newDocumentButtonRef} className="legal-config-button legal-config-button--primary" type="button" onClick={openNewDocument} disabled={loading || documentSaving}>
                <Plus size={15} aria-hidden="true" /> Nuevo documento
              </button>
            </div>
          </div>
          <div className="document-catalogue-content">
            <DataTable
              className="legal-config-document-table"
              columns={documentTableColumns}
              data={documentRows}
              searchable
              searchLabel="Buscar documentos"
              searchPlaceholder="Buscar por código, documento, tipología o etiqueta"
              pagination
              pageSize={10}
              pageSizeOptions={[10, 20, 50]}
              compact
              loading={loading}
              emptyMessage="Aún no hay documentos. Crea el primero para iniciar el catálogo."
            />
          </div>
          </section>
        )}

        {showActuations && (
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
              {relationsSaving && <p aria-live="polite">Guardando asociaciones…</p>}
               <CatalogueSelect label="Tipologías" values={data.typologies} value={actuationRelations.typology_ids} multiple creatable={false} onChange={(ids) => saveRelations('typology_ids', ids)} disabled={loading || relationsSaving} />
               <CatalogueSelect label="Etiquetas" values={data.labels} value={actuationRelations.label_ids} multiple creatable={false} onChange={(ids) => saveRelations('label_ids', ids)} disabled={loading || relationsSaving} />
               <CatalogueSelect label="Documentos directos" values={byParent(data.documents)} value={actuationRelations.document_ids} multiple creatable={false} onChange={(ids) => saveRelations('document_ids', ids)} disabled={loading || relationsSaving} />
               <div className="condition-associations">
                 <CatalogueSelect label="Condiciones" values={data.conditions} value={actuationRelations.condition_ids} multiple creatable={false} onChange={(ids) => saveRelations('condition_ids', ids)} disabled={loading || relationsSaving} />
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
        )}
      </div>
      {showDocuments && (
        <DocumentEditorDialog
          open={documentModalOpen}
          onOpenChange={changeDocumentModalOpen}
          document={editingDocument}
          documents={data.documents}
          typologies={data.typologies}
          labels={data.labels}
          documentLabels={data.documentLabels}
          onSave={saveDocument}
          saving={documentSaving}
        />
      )}
      {showDocuments && (
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
      )}
      {showActuations && (
        <SeriesDialog
          open={seriesModalOpen}
          onOpenChange={setSeriesModalOpen}
          actuations={data.actuations}
          onSave={saveSeries}
          onReload={load}
          saving={seriesSaving}
        />
      )}
      {showActuations && selectedActuation && (
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
