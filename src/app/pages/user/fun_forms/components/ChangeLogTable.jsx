import { Icon } from '@/components/icon';

const CHANGE_CATEGORIES = [
  ['CORRECCION', 'CORRECCIÓN'],
  ['MODIFICACION', 'MODIFICACION'],
  ['ADICION', 'ADICIÓN'],
];

function formatChangeDate(value, fallback = 'Pendiente de guardar') {
  if (!value) return fallback;
  try {
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(value));
  } catch {
    return fallback;
  }
}

function EditableCell({ entry, field, onDraftChange, onPersistedInputChange, onPersistedChange }) {
  const value = entry[field] || '';
  const label = `${field} de cambio ${entry.targetId}`;
  const inputClassName = `h-7 rounded-md border border-border bg-background px-2 text-[11px] text-slate-900 dark:text-slate-100 ${field === 'updateDetail' || field === 'support' || field === 'category' ? 'w-full' : 'min-w-28'}`;

  if (field === 'category') {
    const categoryValue = CHANGE_CATEGORIES.some(([category]) => category === value) ? value : '';
    const onChange = (event) => {
      event.stopPropagation();
      const category = event.target.value;
      if (entry.isDraft) return onDraftChange(entry.targetKey, field, category);
      onPersistedInputChange(entry.id, field, category);
      onPersistedChange(entry.id, field, category);
    };
    return <select aria-label={label} className={inputClassName} value={categoryValue} onChange={onChange}>
      <option value="">SIN CATEGORÍA</option>
      {CHANGE_CATEGORIES.map(([category, text]) => <option key={category} value={category}>{text}</option>)}
    </select>;
  }

  const onChange = (event) => {
    event.stopPropagation();
    if (entry.isDraft) return onDraftChange(entry.targetKey, field, event.target.value);
    onPersistedInputChange(entry.id, field, event.target.value);
  };
  return <input
    aria-label={label}
    className={inputClassName}
    value={value}
    onChange={onChange}
    onBlur={entry.isDraft ? undefined : (event) => {
      event.stopPropagation();
      onPersistedChange(entry.id, field, event.target.value);
    }}
  />;
}

function ChangeLogCell({ column, entry, requestResponsibleName, deletingEntryId, onDraftChange, onPersistedInputChange, onPersistedChange, onDelete }) {
  if (column.key === 'targetId') return entry.targetId;
  if (column.key === 'date') return formatChangeDate(entry.createdAt || entry.detectedAt);
  if (column.key === 'responsibleName') return requestResponsibleName || (column.useEntryResponsibleFallback !== false && entry.responsibleName) || 'Sin responsable registrado';
  if (column.key === 'receiptStatus') return entry.receiptStatus || 'SIN DEFINIR';
  if (column.key === 'action') {
    if (entry.isDraft) return <span className="text-muted-foreground">-</span>;
    return <button
      type="button"
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={`Eliminar cambio ${entry.targetId}`}
      title="Eliminar cambio"
      disabled={deletingEntryId === entry.id}
      onClick={() => onDelete(entry.id)}
    ><Icon name="trash-alt" size={14} /></button>;
  }
  return <EditableCell entry={entry} field={column.key} onDraftChange={onDraftChange} onPersistedInputChange={onPersistedInputChange} onPersistedChange={onPersistedChange} />;
}

export default function ChangeLogTable({ title, description, ariaLabel, columns, entries, drafts, loading, error, requestResponsibleName, deletingEntryId, onDraftChange, onPersistedInputChange, onPersistedChange, onDelete, sectionProps = {}, keepVisible = false }) {
  const rows = [
    ...(Array.isArray(drafts) ? drafts : []).map((entry) => ({ ...entry, isDraft: true })),
    ...(Array.isArray(entries) ? entries : []).map((entry) => ({ ...entry, isDraft: false })),
  ];
  if (!keepVisible && !loading && !error && !rows.length) return null;

  return <section {...sectionProps} className="mt-4" aria-label={ariaLabel}>
    <div className="mb-2">
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <p className="mb-0 text-xs text-muted-foreground">{description}</p>
    </div>
    {error ? <p className="mb-2 text-xs text-destructive" role="alert">{error}</p> : null}
    {loading && !rows.length ? <p className="px-3 py-2 text-xs text-muted-foreground" role="status">Cargando bitácora de cambios...</p> : null}
    {keepVisible && !loading && !error && !rows.length ? <p className="px-3 py-2 text-xs text-muted-foreground" role="status">No hay cambios registrados.</p> : null}
    {rows.length ? <div className="overflow-auto rounded-md border border-border">
      <table className="min-w-full border-separate border-spacing-0 text-[11px] text-foreground">
        <thead className="bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300"><tr>
          {columns.map((column) => <th key={column.key} className={`border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase last:border-r-0 dark:border-slate-600 ${column.className || ''}`}>{column.label}</th>)}
        </tr></thead>
        <tbody>{rows.map((entry) => <tr key={entry.isDraft ? `draft-${entry.targetKey}` : entry.id}>
          {columns.map((column) => <td key={column.key} className={`border-b border-r border-border px-2 py-1 last:border-r-0 ${column.cellClassName || ''}`}><ChangeLogCell column={column} entry={entry} requestResponsibleName={requestResponsibleName} deletingEntryId={deletingEntryId} onDraftChange={onDraftChange} onPersistedInputChange={onPersistedInputChange} onPersistedChange={onPersistedChange} onDelete={onDelete} /></td>)}
        </tr>)}</tbody>
      </table>
    </div> : null}
  </section>;
}
