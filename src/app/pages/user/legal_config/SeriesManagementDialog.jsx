import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ChevronRight,
  GitBranch,
  Hash,
  Library,
  LoaderCircle,
  Plus,
  Search,
  X,
} from 'lucide-react';
import LegalConfigService from '@/app/services/legal_config.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import './SeriesManagementDialog.css';

const emptySubseriesDraft = { name: '', suffix: '' };

const errorMessage = (error) => (
  error?.response?.data?.message || error?.message || 'No fue posible guardar el cambio.'
);

function normalizedSearch(value) {
  return String(value || '').trim().toLocaleLowerCase('es');
}

export default function SeriesManagementDialog({
  open,
  onOpenChange,
  actuations,
  documentScope,
  onSave,
  onReload,
  saving,
}) {
  const [codes, setCodes] = useState({});
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [query, setQuery] = useState('');
  const [newSubseries, setNewSubseries] = useState({});
  const [createOpen, setCreateOpen] = useState(false);
  const [subseriesSavingId, setSubseriesSavingId] = useState('');
  const [subseriesError, setSubseriesError] = useState('');
  const [scope, setScope] = useState({ section: '100', subsection: '.01' });
  const [scopeSaving, setScopeSaving] = useState(false);
  const wasOpen = useRef(false);

  const roots = useMemo(
    () => actuations.filter((item) => !item.parent_id),
    [actuations],
  );

  const childrenByParent = useMemo(() => {
    const groups = new Map(roots.map((item) => [item.id, []]));
    actuations.forEach((item) => {
      if (item.parent_id && groups.has(item.parent_id)) groups.get(item.parent_id).push(item);
    });
    return groups;
  }, [actuations, roots]);

  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }

    const justOpened = !wasOpen.current;
    wasOpen.current = true;
    const rootCodes = Object.fromEntries(roots.map((item) => [item.id, item.code || '']));

    setCodes((current) => {
      const next = justOpened ? {} : { ...current };
      actuations.forEach((item) => {
        if (!justOpened && next[item.id] !== undefined) return;
        if (!item.parent_id) {
          next[item.id] = item.code || '';
          return;
        }

        const parentCode = rootCodes[item.parent_id] || '';
        const existing = item.code || '';
        next[item.id] = parentCode && existing.startsWith(parentCode) && existing.length > parentCode.length
          ? existing.slice(parentCode.length)
          : '';
      });
      return next;
    });

    setSelectedSeriesId((current) => (
      roots.some((item) => item.id === current) ? current : (roots[0]?.id || '')
    ));

    if (justOpened) {
      setQuery('');
      setNewSubseries({});
      setCreateOpen(false);
      setSubseriesError('');
      setScope({
        section: documentScope?.section || '100',
        subsection: documentScope?.subsection || '.01',
      });
    }
  }, [actuations, documentScope, open, roots]);

  async function saveScope() {
    if (!scope.section.trim() || !scope.subsection.trim() || scopeSaving) return;
    setScopeSaving(true);
    try {
      await LegalConfigService.updateDocumentScope({ section: scope.section.trim(), subsection: scope.subsection.trim() });
      await onReload();
    } catch (saveError) {
      setSubseriesError(errorMessage(saveError));
    } finally { setScopeSaving(false); }
  }

  function draftCode(item) {
    if (codes[item.id] !== undefined) return codes[item.id];
    if (!item.parent_id) return item.code || '';
    const parent = roots.find((candidate) => candidate.id === item.parent_id);
    const parentCode = parent?.code || '';
    return parentCode && item.code?.startsWith(parentCode) ? item.code.slice(parentCode.length) : '';
  }

  function composedCode(item) {
    if (!item.parent_id) return draftCode(item);
    const parent = roots.find((candidate) => candidate.id === item.parent_id);
    return `${parent ? draftCode(parent) : ''}${draftCode(item)}`;
  }

  const changes = actuations.filter((item) => {
    if (item.parent_id && !draftCode(item).trim()) return false;
    return composedCode(item).trim() !== (item.code || '');
  });

  const selectedSeries = roots.find((item) => item.id === selectedSeriesId) || null;
  const selectedChildren = selectedSeries ? (childrenByParent.get(selectedSeries.id) || []) : [];
  const selectedSeriesCode = selectedSeries ? draftCode(selectedSeries) : '';
  const selectedDraft = selectedSeries
    ? (newSubseries[selectedSeries.id] || emptySubseriesDraft)
    : emptySubseriesDraft;
  const prefixHasPendingChange = Boolean(
    selectedSeries && selectedSeriesCode.trim() !== (selectedSeries.code || ''),
  );
  const busy = saving || Boolean(subseriesSavingId);
  const scopeCode = `${scope.section.trim()}${scope.subsection.trim()}`;
  const scopeHasChanges = scope.section.trim() !== (documentScope?.section || '')
    || scope.subsection.trim() !== (documentScope?.subsection || '');
  const canCreateSubseries = Boolean(
    selectedSeries
    && selectedDraft.name.trim()
    && selectedDraft.suffix.trim()
    && !prefixHasPendingChange
    && !busy,
  );

  const filteredRoots = useMemo(() => {
    const normalizedQuery = normalizedSearch(query);
    if (!normalizedQuery) return roots;
    return roots.filter((series) => {
      const children = childrenByParent.get(series.id) || [];
      return normalizedSearch(`${series.name} ${series.code}`).includes(normalizedQuery)
        || children.some((item) => normalizedSearch(`${item.name} ${item.code}`).includes(normalizedQuery));
    });
  }, [childrenByParent, query, roots]);

  function selectSeries(seriesId) {
    setSelectedSeriesId(seriesId);
    setCreateOpen(false);
    setSubseriesError('');
  }

  function updateSubseriesDraft(field, value) {
    if (!selectedSeries) return;
    setNewSubseries((current) => ({
      ...current,
      [selectedSeries.id]: {
        ...(current[selectedSeries.id] || emptySubseriesDraft),
        [field]: value,
      },
    }));
  }

  async function submitSubseries() {
    if (!selectedSeries || !selectedDraft.name.trim() || !selectedDraft.suffix.trim() || busy) return;
    if (prefixHasPendingChange) {
      setSubseriesError('Guarda primero el nuevo código de la serie para usarlo como prefijo de la subserie.');
      return;
    }

    setSubseriesSavingId(selectedSeries.id);
    setSubseriesError('');
    try {
      await LegalConfigService.create('actuations', {
        name: selectedDraft.name.trim(),
        code: `${selectedSeries.code || ''}${selectedDraft.suffix.trim()}`,
        parent_id: selectedSeries.id,
      });
      setNewSubseries((current) => ({
        ...current,
        [selectedSeries.id]: emptySubseriesDraft,
      }));
      await onReload();
      setCreateOpen(false);
    } catch (createError) {
      setSubseriesError(errorMessage(createError));
    } finally {
      setSubseriesSavingId('');
    }
  }

  function handleCreateKeyDown(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    submitSubseries();
  }

  async function submit(event) {
    event.preventDefault();
    if (!changes.length || saving) return;
    setSubseriesError('');
    const result = await onSave(changes.map((item) => ({
      ...item,
      code: composedCode(item).trim(),
    })));
    if (result === true || result?.ok) onOpenChange(false);
    else if (result?.message) setSubseriesError(result.message);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="series-manager-dialog">
        <DialogHeader className="series-manager-dialog__header">
          <span className="series-manager-dialog__title-icon"><Library size={19} aria-hidden="true" /></span>
          <span className="series-manager-dialog__title-copy">
            <DialogTitle>Series y subseries</DialogTitle>
            <DialogDescription className="sr-only">
              Selecciona una serie para editar su código y administrar sus subseries.
            </DialogDescription>
          </span>
          <span className="series-manager-dialog__metric"><strong>{roots.length}</strong> series</span>
          <span className="series-manager-dialog__metric"><strong>{actuations.length - roots.length}</strong> subseries</span>
        </DialogHeader>

        {subseriesError && (
          <p className="series-manager-dialog__error" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{subseriesError}</span>
          </p>
        )}

        <form className="series-manager" onSubmit={submit}>
          <section className="series-manager__global-scope" aria-label="Alcance global documental">
            <div className="series-manager__global-scope-copy">
              <span className="series-manager__global-scope-icon"><Hash size={17} aria-hidden="true" /></span>
              <span>
                <strong>Clasificación documental</strong>
                <small>Metadatos globales para identificar la sección y subsección.</small>
              </span>
            </div>
            <div className="series-manager__global-scope-fields">
              <label>
                <span>Sección</span>
                <input
                  value={scope.section}
                  onChange={(event) => setScope((current) => ({ ...current, section: event.target.value }))}
                  placeholder="100"
                  disabled={busy || scopeSaving}
                />
              </label>
              <span className="series-manager__scope-separator" aria-hidden="true">+</span>
              <label>
                <span>Subsección</span>
                <input
                  value={scope.subsection}
                  onChange={(event) => setScope((current) => ({ ...current, subsection: event.target.value }))}
                  placeholder=".01"
                  disabled={busy || scopeSaving}
                />
              </label>
              <span className="series-manager__scope-equals" aria-hidden="true">=</span>
              <output className="series-manager__scope-preview" aria-label={`Código resultante: ${scopeCode || 'sin definir'}`}>
                <small>Código resultante</small>
                <code>{scopeCode || '—'}</code>
              </output>
              <button
                type="button"
                className="legal-config-button legal-config-button--primary"
                onClick={saveScope}
                disabled={!scope.section.trim() || !scope.subsection.trim() || !scopeHasChanges || busy || scopeSaving}
              >
                {scopeSaving ? 'Guardando…' : 'Guardar metadatos'}
              </button>
            </div>
          </section>
          <div className="series-manager__workspace">
            <aside className="series-manager__navigator" aria-label="Series documentales">
              <div className="series-manager__navigator-heading">
                <span>Series documentales</span>
                <strong>{roots.length}</strong>
              </div>

              <label className="series-manager__search">
                <Search size={15} aria-hidden="true" />
                <span className="sr-only">Buscar series o subseries</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por nombre o código"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </label>

              <nav className="series-manager__series-list" aria-label="Seleccionar serie documental">
                {filteredRoots.map((series) => {
                  const selected = series.id === selectedSeriesId;
                  const children = childrenByParent.get(series.id) || [];
                  return (
                    <button
                      type="button"
                      key={series.id}
                      className={`series-manager__series-item${selected ? ' is-active' : ''}`}
                      aria-current={selected ? 'true' : undefined}
                      onClick={() => selectSeries(series.id)}
                    >
                      <span className="series-manager__series-glyph"><GitBranch size={16} aria-hidden="true" /></span>
                      <span className="series-manager__series-copy">
                        <strong title={series.name}>{series.name}</strong>
                        <small>
                          <code>{draftCode(series) || '—'}</code>
                          <span>{children.length} {children.length === 1 ? 'subserie' : 'subseries'}</span>
                          {series.is_active === false && <span className="is-inactive">Inactiva</span>}
                        </small>
                      </span>
                      <ChevronRight size={15} aria-hidden="true" />
                    </button>
                  );
                })}

                {!filteredRoots.length && (
                  <div className="series-manager__no-results">
                    <Search size={20} aria-hidden="true" />
                    <strong>Sin coincidencias</strong>
                    <button type="button" onClick={() => setQuery('')}>Limpiar búsqueda</button>
                  </div>
                )}
              </nav>
            </aside>

            {selectedSeries ? (
              <section className="series-manager__detail" aria-labelledby={`series-manager-title-${selectedSeries.id}`}>
                <header className="series-manager__detail-header">
                  <span>
                    <small>Serie documental</small>
                    <h3 id={`series-manager-title-${selectedSeries.id}`}>{selectedSeries.name}</h3>
                  </span>
                  <span className={`series-manager__status${selectedSeries.is_active === false ? ' is-inactive' : ''}`}>
                    {selectedSeries.is_active === false ? 'Inactiva' : 'Activa'}
                  </span>
                </header>

                <div className="series-manager__detail-scroll">
                  <section className="series-manager__code-panel" aria-labelledby={`series-code-label-${selectedSeries.id}`}>
                    <span className="series-manager__code-icon"><Hash size={18} aria-hidden="true" /></span>
                    <label>
                      <span id={`series-code-label-${selectedSeries.id}`}>Código de la serie</span>
                      <input
                        value={selectedSeriesCode}
                        onChange={(event) => setCodes((current) => ({
                          ...current,
                          [selectedSeries.id]: event.target.value,
                        }))}
                        aria-describedby={`series-code-help-${selectedSeries.id}`}
                        disabled={busy}
                        required
                        autoComplete="off"
                      />
                    </label>
                    <p id={`series-code-help-${selectedSeries.id}`}>
                      Este código funciona como prefijo de sus {selectedChildren.length} {selectedChildren.length === 1 ? 'subserie' : 'subseries'}.
                    </p>
                  </section>

                  <section className="series-manager__subseries" aria-labelledby={`subseries-title-${selectedSeries.id}`}>
                    <header className="series-manager__subseries-header">
                      <span>
                        <h4 id={`subseries-title-${selectedSeries.id}`}>Subseries</h4>
                        <strong>{selectedChildren.length}</strong>
                      </span>
                      <button
                        type="button"
                        className="legal-config-button series-manager__add-trigger"
                        onClick={() => {
                          setCreateOpen((current) => !current);
                          setSubseriesError('');
                        }}
                        aria-expanded={createOpen}
                        disabled={busy}
                      >
                        {createOpen ? <X size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
                        {createOpen ? 'Cerrar' : 'Nueva subserie'}
                      </button>
                    </header>

                    {createOpen && (
                      <div className="series-manager__create-panel" onKeyDown={handleCreateKeyDown}>
                        <label>
                          <span>Nombre de la subserie</span>
                          <input
                            value={selectedDraft.name}
                            onChange={(event) => updateSubseriesDraft('name', event.target.value)}
                            placeholder="Ej. Desarrollo"
                            disabled={busy}
                            autoFocus
                          />
                        </label>
                        <label>
                          <span>Sufijo del código</span>
                          <span className="series-manager__composed-field">
                            <code>{selectedSeriesCode || '—'}</code>
                            <input
                              value={selectedDraft.suffix}
                              onChange={(event) => updateSubseriesDraft('suffix', event.target.value)}
                              placeholder="_01"
                              disabled={busy}
                              aria-label={`Sufijo para la nueva subserie de ${selectedSeries.name}`}
                            />
                          </span>
                        </label>
                        <button
                          type="button"
                          className="legal-config-button legal-config-button--primary"
                          onClick={submitSubseries}
                          disabled={!canCreateSubseries}
                        >
                          {subseriesSavingId === selectedSeries.id
                            ? <><LoaderCircle className="is-spinning" size={15} aria-hidden="true" />Agregando…</>
                            : <><Plus size={15} aria-hidden="true" />Agregar</>}
                        </button>
                        {prefixHasPendingChange && (
                          <p className="series-manager__create-note">
                            Guarda el nuevo prefijo antes de crear una subserie.
                          </p>
                        )}
                      </div>
                    )}

                    {selectedChildren.length ? (
                      <div className="series-manager__table-wrap">
                        <table className="series-manager__table">
                          <thead>
                            <tr>
                              <th>Subserie</th>
                              <th>Sufijo</th>
                              <th>Código resultante</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedChildren.map((item) => {
                              const resultCode = composedCode(item).trim() || '—';
                              return (
                                <tr key={item.id}>
                                  <td data-label="Subserie"><strong>{item.name}</strong></td>
                                  <td data-label="Sufijo">
                                    <span className="series-manager__composed-field">
                                      <code>{selectedSeriesCode || '—'}</code>
                                      <input
                                        value={draftCode(item)}
                                        onChange={(event) => setCodes((current) => ({
                                          ...current,
                                          [item.id]: event.target.value,
                                        }))}
                                        aria-label={`Sufijo de código para ${item.name}`}
                                        disabled={busy}
                                        autoComplete="off"
                                      />
                                    </span>
                                  </td>
                                  <td data-label="Código resultante"><code className="series-manager__result-code" title={resultCode}>{resultCode}</code></td>
                                  <td data-label="Estado">
                                    <span className={`series-manager__status${item.is_active === false ? ' is-inactive' : ''}`}>
                                      {item.is_active === false ? 'Inactiva' : 'Activa'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="series-manager__empty-subseries">
                        <GitBranch size={24} aria-hidden="true" />
                        <strong>Esta serie aún no tiene subseries</strong>
                        <button type="button" onClick={() => setCreateOpen(true)}>Crear la primera subserie</button>
                      </div>
                    )}
                  </section>
                </div>
              </section>
            ) : (
              <div className="series-manager__empty-detail">
                <Library size={28} aria-hidden="true" />
                <strong>No hay series documentales</strong>
              </div>
            )}
          </div>

          <DialogFooter className="series-manager-dialog__footer">
            <span className={`series-manager-dialog__change-summary${changes.length ? ' has-changes' : ''}`} aria-live="polite">
              <span aria-hidden="true" />
              {changes.length
                ? `${changes.length} ${changes.length === 1 ? 'cambio pendiente' : 'cambios pendientes'}`
                : 'Sin cambios pendientes'}
            </span>
            <span className="series-manager-dialog__actions">
              <button type="button" className="legal-config-button" onClick={() => onOpenChange(false)} disabled={busy}>
                Cancelar
              </button>
              <button type="submit" className="legal-config-button legal-config-button--primary" disabled={!changes.length || busy}>
                {saving
                  ? <><LoaderCircle className="is-spinning" size={15} aria-hidden="true" />Guardando…</>
                  : 'Guardar cambios'}
              </button>
            </span>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
