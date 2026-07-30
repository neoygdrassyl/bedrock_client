import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ChevronRight,
  CornerDownRight,
  FileText,
  GitBranch,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ActuationAssociationsWorkspace from './ActuationAssociationsWorkspace.jsx';
import DocumentEvaluationWorkspace from './DocumentEvaluationWorkspace.jsx';
import SeriesManagementDialog from './SeriesManagementDialog.jsx';
import './LegalConfigInitialPage.css';

const empty = {
  actuations: [], typologies: [], labels: [], documents: [], documentLabels: [], labelTypologies: [],
  actuationTypologies: [], actuationLabels: [], directDocuments: [],
  conditions: [], conditionFields: [], conditionDocuments: [], actuationConditions: [],
  documentScope: { section: '', subsection: '' },
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

const visualTone = (value) => {
  const hash = [...String(value || '')].reduce((total, character) => total + character.charCodeAt(0), 0);
  return (hash % 5) + 1;
};

const documentFormFrom = (document, documentLabels, documents) => {
  const classificationSource = document?.parent_document_id
    ? documents.find((item) => item.id === document.parent_document_id) || document
    : document;
  return ({
  ...emptyDocumentForm,
  name: document?.name || '',
  code: document?.code || '',
  description: document?.description || '',
  typology_id: classificationSource?.typology_id || '',
  label_ids: documentLabels
    .filter((row) => row.document_id === classificationSource?.id)
    .map((row) => row.label_id),
  parent_document_id: document?.parent_document_id || '',
  is_active: document?.is_active !== false,
  sort_order: Number(document?.sort_order || 0),
  });
};

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

function CatalogueManagerDialog({ open, onOpenChange, tab, onTabChange, values, typologies, labelTypologies, onCreate, onToggleActive, onSaveLabelTypologies, saving }) {
  const [name, setName] = useState('');
  const [selectedLabelId, setSelectedLabelId] = useState('');
  const [selectedTypologyIds, setSelectedTypologyIds] = useState([]);
  const isTypology = tab === 'typologies';
  const catalogueLabel = isTypology ? 'tipología' : 'etiqueta';
  const title = isTypology ? 'Tipologías' : 'Etiquetas';
  const activeLabels = useMemo(
    () => values.labels.filter((item) => item.is_active !== false),
    [values.labels],
  );

  useEffect(() => {
    if (!open || tab !== 'labels') return;
    const nextLabelId = activeLabels.some((item) => item.id === selectedLabelId) ? selectedLabelId : activeLabels[0]?.id || '';
    setSelectedLabelId(nextLabelId);
    setSelectedTypologyIds(labelTypologies.filter((item) => item.label_id === nextLabelId).map((item) => item.typology_id));
  }, [activeLabels, labelTypologies, open, selectedLabelId, tab]);

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

        {!isTypology && (
          <section className="legal-config-label-typologies" aria-label="Tipologías contenidas por la etiqueta">
            <div>
              <strong>Tipologías contenidas</strong>
              <small>La etiqueta agrupa tipologías; sigue existiendo aunque aún no esté asociada a una actuación.</small>
            </div>
            <label>
              <span>Etiqueta</span>
              <select
                aria-label="Etiqueta a configurar"
                value={selectedLabelId}
                onChange={(event) => {
                  const labelId = event.target.value;
                  setSelectedLabelId(labelId);
                  setSelectedTypologyIds(labelTypologies.filter((item) => item.label_id === labelId).map((item) => item.typology_id));
                }}
                disabled={saving || !activeLabels.length}
              >
                {activeLabels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <CatalogueSelect
              label="Tipologías de la etiqueta"
              values={typologies}
              value={selectedTypologyIds}
              onChange={setSelectedTypologyIds}
              multiple
              creatable={false}
              disabled={saving || !selectedLabelId}
            />
            <button
              type="button"
              className="legal-config-button legal-config-button--primary"
              onClick={() => onSaveLabelTypologies(selectedLabelId, selectedTypologyIds)}
              disabled={saving || !selectedLabelId}
            >
              Guardar tipologías
            </button>
          </section>
        )}

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
    setForm(document ? documentFormFrom(document, documentLabels, documents) : emptyDocumentForm);
    setSubmitError('');
  }, [document, documentLabels, documents, open]);

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

function ActuationEditorDialog({ open, onOpenChange, actuations, onSave, saving }) {
  const [form, setForm] = useState({ name: '', parent_id: '', suffix: '' });
  const [submitError, setSubmitError] = useState('');
  const instanceId = useId().replace(/:/g, '');
  const parents = actuations.filter((item) => item.is_active !== false && ['category', 'actuation'].includes(item.node_kind || 'actuation'));
  const parent = parents.find((item) => item.id === form.parent_id);
  const nodeKind = parent ? ((parent.node_kind || 'actuation') === 'category' ? 'actuation' : 'modality') : 'category';
  const nodeLabel = nodeKind === 'category' ? 'Categoría' : (nodeKind === 'actuation' ? 'Actuación' : 'Modalidad');
  const canSave = Boolean(form.name.trim() && (!parent || form.suffix.trim()) && !saving);

  useEffect(() => {
    if (!open) return;
    setForm({ name: '', parent_id: '', suffix: '' });
    setSubmitError('');
  }, [open]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!canSave) return;
    setSubmitError('');
    const result = await onSave({
      name: form.name.trim(),
      parent_id: form.parent_id || null,
      node_kind: nodeKind,
      code: parent ? `${parent.code}${form.suffix.trim()}` : form.name.trim(),
    });
    if (result?.ok) onOpenChange(false);
    else setSubmitError(result?.message || 'No fue posible guardar el nodo documental.');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="legal-config-actuation-dialog" aria-describedby={`${instanceId}-description`}>
        <DialogHeader className="legal-config-document-dialog__header">
          <DialogTitle><GitBranch size={18} aria-hidden="true" /> Nueva categoría, actuación o modalidad</DialogTitle>
          <DialogDescription id={`${instanceId}-description`}>
            El árbol se organiza como Categoría → Actuación → Modalidad. El nodo hijo conserva las asociaciones de su padre.
          </DialogDescription>
        </DialogHeader>
        <form className="actuation-editor" onSubmit={submit}>
          {submitError && <p className="document-editor__error" role="alert">{submitError}</p>}
          <label htmlFor={`${instanceId}-name`}>
            <span>Nombre <b aria-hidden="true">*</b></span>
            <input id={`${instanceId}-name`} required autoFocus value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Ej. Licencias urbanísticas" disabled={saving} />
          </label>
          <label htmlFor={`${instanceId}-parent`}>
            <span>Ubicación en el árbol</span>
            <select id={`${instanceId}-parent`} value={form.parent_id} onChange={(event) => setForm((current) => ({ ...current, parent_id: event.target.value, suffix: '' }))} disabled={saving}>
              <option value="">Nueva categoría</option>
              {parents.map((item) => <option key={item.id} value={item.id}>{(item.node_kind || 'actuation') === 'category' ? `Actuación dentro de ${item.name}` : `Modalidad dentro de ${item.name}`}</option>)}
            </select>
            <small>Se creará como <strong>{nodeLabel}</strong>{parent ? ` dentro de ${parent.name}.` : '.'}</small>
          </label>
          {parent && (
            <label className="actuation-editor__suffix" htmlFor={`${instanceId}-suffix`}>
              <span>Sufijo del código <b aria-hidden="true">*</b></span>
              <span><code>{parent.code}</code><input id={`${instanceId}-suffix`} required value={form.suffix} onChange={(event) => setField('suffix', event.target.value)} placeholder="_01" disabled={saving} /></span>
              <small>Código resultante: <code>{`${parent.code}${form.suffix || '…'}`}</code></small>
            </label>
          )}
          <DialogFooter className="document-editor__footer">
            <button type="button" className="legal-config-button" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</button>
            <button type="submit" className="legal-config-button legal-config-button--primary" disabled={!canSave}>{saving ? 'Creando…' : `Crear ${nodeLabel.toLowerCase()}`}</button>
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
  const [evaluation, setEvaluation] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [evaluationSaving, setEvaluationSaving] = useState(false);
  const [evaluationError, setEvaluationError] = useState('');

  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState('');
  const documentModalTriggerRef = useRef(null);
  const newDocumentButtonRef = useRef(null);

  const [actuationModalOpen, setActuationModalOpen] = useState(false);
  const [actuationQuery, setActuationQuery] = useState('');
  const [expandedSeries, setExpandedSeries] = useState({});
  const [actuationSaving, setActuationSaving] = useState(false);
  const actuationModalTriggerRef = useRef(null);
  const [catalogueModalOpen, setCatalogueModalOpen] = useState(false);
  const [catalogueTab, setCatalogueTab] = useState('typologies');
  const [catalogueSaving, setCatalogueSaving] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [conditionSaving, setConditionSaving] = useState(false);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [seriesSaving, setSeriesSaving] = useState(false);
  const seriesModalTriggerRef = useRef(null);
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

  const loadEvaluation = useCallback(async () => {
    if (!selected) {
      setEvaluation(null);
      setEvaluationError('');
      return;
    }
    setEvaluationLoading(true);
    setEvaluationError('');
    try {
      const response = await LegalConfigService.evaluationConfig(selected);
      setEvaluation(response?.data || null);
    } catch (loadError) {
      setEvaluation(null);
      setEvaluationError(loadError?.response?.status === 404
        ? 'La evaluación contextual aún no está disponible en el servicio. Puedes preparar la configuración y volver a intentar cargarla.'
        : `No fue posible cargar la evaluación contextual. ${errorMessage(loadError)}`);
    } finally {
      setEvaluationLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  const saveEvaluation = useCallback(async (config) => {
    if (!selected || evaluationSaving) return { ok: false };
    setEvaluationSaving(true);
    setEvaluationError('');
    try {
      const response = await LegalConfigService.updateEvaluationConfig(selected, { evaluation_config: config });
      setEvaluation(response?.data || ((current) => ({ ...current, own_config: config })));
      return { ok: true };
    } catch (saveError) {
      setEvaluationError(saveError?.response?.status === 404
        ? 'La evaluación contextual aún no está disponible para guardar. El resto de la configuración sigue operativo.'
        : `No fue posible guardar la evaluación contextual. ${errorMessage(saveError)}`);
      return { ok: false };
    } finally {
      setEvaluationSaving(false);
    }
  }, [evaluationSaving, selected]);

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

  async function saveLabelTypologies(labelId, typologyIds) {
    if (!labelId || catalogueSaving) return null;
    setCatalogueSaving(true);
    try {
      await LegalConfigService.update('labels', labelId, { typology_ids: typologyIds });
      await load();
      setError('');
      setNotice('Tipologías de la etiqueta actualizadas.');
      return true;
    } catch (saveError) {
      setNotice('');
      setError(errorMessage(saveError));
      return null;
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

  async function saveActuation(payload) {
    if (!payload?.name || actuationSaving) return { ok: false, message: 'El nombre de la actuación es obligatorio.' };
    setActuationSaving(true);
    try {
      const response = await LegalConfigService.create('actuations', payload);
      setSelected(response.data.id);
      await load();
      setError('');
      const createdLabel = payload.node_kind === 'category' ? 'Categoría' : (payload.node_kind === 'modality' ? 'Modalidad' : 'Actuación');
      setNotice(`${createdLabel} creada. Ya puedes configurar sus asociaciones y evaluación.`);
      return { ok: true };
    } catch (saveError) {
      const message = errorMessage(saveError);
      setNotice('');
      setError(message);
      return { ok: false, message };
    } finally { setActuationSaving(false); }
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
      return { ok: true };
    } catch (saveError) {
      const message = errorMessage(saveError);
      setNotice('');
      setError(message);
      return { ok: false, message };
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

  const changeSeriesModalOpen = useCallback((nextOpen) => {
    setSeriesModalOpen(nextOpen);
    if (!nextOpen) {
      window.requestAnimationFrame(() => seriesModalTriggerRef.current?.focus());
    }
  }, []);

  const changeActuationModalOpen = useCallback((nextOpen) => {
    setActuationModalOpen(nextOpen);
    if (!nextOpen) window.requestAnimationFrame(() => actuationModalTriggerRef.current?.focus());
  }, []);

  const visibleActuations = useMemo(() => {
    const query = actuationQuery.trim().toLocaleLowerCase('es');
    if (!query) return data.actuations;
    const byId = new Map(data.actuations.map((item) => [item.id, item]));
    const childrenByParent = new Map();
    data.actuations.forEach((item) => {
      if (!item.parent_id) return;
      childrenByParent.set(item.parent_id, [...(childrenByParent.get(item.parent_id) || []), item]);
    });
    const visibleIds = new Set();

    const includeAncestors = (item) => {
      let parent = byId.get(item.parent_id);
      while (parent) {
        visibleIds.add(parent.id);
        parent = byId.get(parent.parent_id);
      }
    };

    const includeDescendants = (item) => {
      (childrenByParent.get(item.id) || []).forEach((child) => {
        visibleIds.add(child.id);
        includeDescendants(child);
      });
    };

    data.actuations.forEach((item) => {
      const searchable = `${item.name || ''} ${item.code || ''}`.toLocaleLowerCase('es');
      if (!searchable.includes(query)) return;
      visibleIds.add(item.id);
      includeAncestors(item);
      includeDescendants(item);
    });
    return data.actuations.filter((item) => visibleIds.has(item.id));
  }, [actuationQuery, data.actuations]);

  const actuationAssociationCounts = useMemo(() => {
    const counts = new Map();
    [
      data.actuationTypologies,
      data.actuationLabels,
      data.directDocuments,
      data.actuationConditions,
    ].forEach((links) => {
      links.forEach((link) => {
        counts.set(link.actuation_id, (counts.get(link.actuation_id) || 0) + 1);
      });
    });
    return counts;
  }, [data.actuationConditions, data.actuationLabels, data.actuationTypologies, data.directDocuments]);

  const actuationHierarchyStats = useMemo(() => ({
    series: data.actuations.filter((item) => !item.parent_id).length,
    subseries: data.actuations.filter((item) => item.parent_id).length,
  }), [data.actuations]);

  const documentRows = useMemo(() => {
    const decorate = (document) => {
      const parent = data.documents.find((item) => item.id === document.parent_document_id);
      const classificationSource = parent || document;
      const labelNames = data.documentLabels
      .filter((row) => row.document_id === classificationSource.id)
      .map((row) => data.labels.find((item) => item.id === row.label_id)?.name)
      .filter(Boolean);
      return {
        ...document,
        parent_name: parent?.name || '',
        variant_search: byParent(data.documents, document.id)
          .map((variant) => `${variant.name || ''} ${variant.code || ''} variante`)
          .join(' '),
        typology_name: data.typologies.find((item) => item.id === classificationSource.typology_id)?.name || '',
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
      accessorFn: (document) => `${document.name} ${document.parent_name} ${document.variant_search} ${document.parent_document_id ? 'variante' : 'principal'}`,
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
      cell: ({ row }) => row.original.typology_name ? (
        <span className={`document-table__typology document-table__tone--${visualTone(row.original.typology_name)}`}>
          {row.original.typology_name}
        </span>
      ) : <span className="document-table__muted">Sin tipología</span>,
    },
    {
      id: 'labels',
      header: 'Etiquetas',
      accessorFn: (document) => document.label_names.join(' ') || 'Sin etiquetas',
      cell: ({ row }) => {
        const names = row.original.label_names;
        if (!names.length) return <span className="document-table__muted">Sin etiquetas</span>;
        const badges = (
          <span className="document-table__labels">
            {names.slice(0, names.length > 1 ? 1 : 2).map((name) => (
              <span className={`document-table__tone--${visualTone(name)}`} key={name}>{name}</span>
            ))}
            {names.length > 1 && <span className="document-table__labels-more">+{names.length - 1}</span>}
          </span>
        );
        if (names.length === 1) return badges;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="document-table__labels-trigger" tabIndex={0} aria-label={`${names.length} etiquetas. Ver lista completa`}>
                {badges}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="document-table__labels-tooltip">
              <strong>Etiquetas asociadas</strong>
              <ul>{names.map((name) => <li key={name}>{name}</li>)}</ul>
            </TooltipContent>
          </Tooltip>
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
        await load();
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
    const associationCount = actuationAssociationCounts.get(item.id) || 0;
    return (
      <button
        type="button"
        className={`actuation-list__item${isSelected ? ' selected' : ''}${isChild ? ' is-child' : ''}`}
        key={item.id}
        onClick={() => setSelected(item.id)}
        disabled={loading || relationSavePending.current}
        aria-pressed={isSelected}
        aria-label={`${item.name}${item.code ? `, código ${item.code}` : ''}, ${associationCount} ${associationCount === 1 ? 'asociación' : 'asociaciones'}`}
      >
        {isChild && <CornerDownRight size={13} className="actuation-list__child-icon" aria-hidden="true" />}
        <span className="actuation-list__body">
          <span className="actuation-list__name" title={item.name}>{item.name}</span>
          {!item.is_active && <span className="actuation-list__inactive">Inactiva</span>}
        </span>
        <span className="actuation-list__meta">
          <code title={`Código: ${item.code || 'sin código'}`}>{item.code || '—'}</code>
          <span title={`${associationCount} ${associationCount === 1 ? 'asociación' : 'asociaciones'}`}>{associationCount}</span>
        </span>
      </button>
    );
  }

  function renderActuationBranch(item, depth = 0) {
    const children = visibleActuations.filter((candidate) => candidate.parent_id === item.id);
    const hasChildren = children.length > 0;
    const isOpen = hasChildren && (Boolean(actuationQuery.trim()) || expandedSeries[item.id] !== false);

    return (
      <div className="actuation-list__group" key={item.id}>
        <div className={`actuation-list__row${item.id === selected ? ' is-selected' : ''}`}>
          {hasChildren ? (
            <button
              type="button"
              className="actuation-list__disclosure"
              aria-expanded={isOpen}
              aria-label={`${isOpen ? 'Ocultar' : 'Mostrar'} niveles dependientes de ${item.name}`}
              onClick={() => setExpandedSeries((current) => ({ ...current, [item.id]: !isOpen }))}
              disabled={loading}
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          ) : <span className="actuation-list__disclosure-spacer" aria-hidden="true"><span /></span>}
          {renderActuationItem(item, depth > 0)}
        </div>
        {isOpen && (
          <div className="actuation-list__children" role="group" aria-label={`Niveles dependientes de ${item.name}`}>
            {children.map((child) => renderActuationBranch(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }


  return (
    <main
      className="legal-config-workspace"
      aria-labelledby={activeSection === 'actuations' ? undefined : 'legal-config-title'}
      aria-label={activeSection === 'actuations' ? workspaceTitle : undefined}
    >
      {activeSection !== 'actuations' && <header className="legal-config-header">
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
      </header>}

      <div className="legal-config-feedback" aria-live="polite">
        {error && <p className="legal-config-error" role="alert"><AlertCircle size={16} aria-hidden="true" />{error}</p>}
        {notice && <p className="legal-config-notice" role="status">{notice}</p>}
        {loading && <p className="legal-config-loading" role="status"><LoaderCircle className="is-spinning" size={16} aria-hidden="true" />Cargando configuración…</p>}
      </div>

      <div className={`legal-config-grid legal-config-grid--${activeSection}`}>
        {showActuations && (
          <section className="legal-config-panel legal-config-actuations" aria-labelledby="legal-config-actuations-title">
          <header className="actuation-panel-header">
            <div className="actuation-panel-header__heading">
              <span className="actuation-panel-header__icon"><GitBranch size={17} aria-hidden="true" /></span>
              <h3 id="legal-config-actuations-title">Actuaciones</h3>
              <span className="actuation-panel-header__metric"><strong>{actuationHierarchyStats.series}</strong> series</span>
              <span className="actuation-panel-header__metric"><strong>{actuationHierarchyStats.subseries}</strong> subseries</span>
            </div>
            <div className="actuation-panel-header__actions">
              <button ref={seriesModalTriggerRef} className="legal-config-button" type="button" onClick={() => changeSeriesModalOpen(true)} disabled={loading || seriesSaving}>
                <Library size={15} aria-hidden="true" /> Gestionar series
              </button>
              <button
                className="legal-config-button"
                type="button"
                ref={actuationModalTriggerRef}
                onClick={() => changeActuationModalOpen(true)}
                aria-label="Nueva actuación o modalidad"
                title="Nueva actuación o modalidad"
                disabled={loading || actuationSaving}
              >
                <Plus size={15} aria-hidden="true" />
                <span>Nueva actuación</span>
              </button>
            </div>
          </header>

          <div className="actuation-search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              aria-label="Buscar actuación"
              value={actuationQuery}
              onChange={(event) => setActuationQuery(event.target.value)}
              placeholder="Buscar por nombre o código"
              disabled={loading}
            />
            {actuationQuery && (
              <button type="button" aria-label="Limpiar búsqueda" onClick={() => setActuationQuery('')}>
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="actuation-list__legend" aria-hidden="true">
            <span />
            <span>Serie / subserie</span>
            <span>Código</span>
            <span>Asoc.</span>
          </div>

          <nav className="actuation-list" aria-label="Series y subseries de actuaciones">
            {visibleActuations.filter((item) => !item.parent_id).map((item) => renderActuationBranch(item))}
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
                <button type="button" onClick={() => changeActuationModalOpen(true)}>Crear la primera actuación</button>
              </div>
            )}
          </nav>
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
            <TooltipProvider delayDuration={180}>
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
            </TooltipProvider>
          </div>
          </section>
        )}

        {showActuations && (
          <ActuationAssociationsWorkspace
            actuation={selectedActuation}
            data={data}
            relations={actuationRelations}
            loading={loading}
            saving={relationsSaving}
            conditionSaving={conditionSaving}
            onChange={saveRelations}
            onCreateCondition={() => setConditionModalOpen(true)}
            onRefresh={load}
          />
        )}
      </div>
      {showActuations && (
        <DocumentEvaluationWorkspace
          actuation={selectedActuation}
          actuations={data.actuations}
          documents={data.documents}
          typologies={data.typologies}
          evaluation={evaluation}
          loading={evaluationLoading}
          saving={evaluationSaving}
          error={evaluationError}
          onLoad={loadEvaluation}
          onSave={saveEvaluation}
        />
      )}
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
          typologies={data.typologies}
          labelTypologies={data.labelTypologies}
          onCreate={createManagedCatalogue}
          onToggleActive={toggleCatalogue}
          onSaveLabelTypologies={saveLabelTypologies}
          saving={catalogueSaving}
        />
      )}
      {showActuations && (
        <ActuationEditorDialog
          open={actuationModalOpen}
          onOpenChange={changeActuationModalOpen}
          actuations={data.actuations}
          onSave={saveActuation}
          saving={actuationSaving}
        />
      )}
      {showActuations && (
        <SeriesManagementDialog
          open={seriesModalOpen}
          onOpenChange={changeSeriesModalOpen}
          actuations={data.actuations}
          documentScope={data.documentScope}
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
