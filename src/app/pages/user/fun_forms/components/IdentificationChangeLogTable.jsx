function formatChangeDate(value, fallback = 'Pendiente de guardar') {
  if (!value) return fallback;

  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(new Date(value));
  } catch {
    return fallback;
  }
}

import { Icon } from '@/components/icon';

const CHANGE_CATEGORIES = [
  ['CORRECCION', 'CORRECCIÓN'],
  ['MODIFICACION', 'MODIFICACION'],
  ['ADICION', 'ADICIÓN'],
];

function EditableCell({ entry, field, onDraftChange, onPersistedInputChange, onPersistedChange }) {
  const value = entry[field] || '';
  const label = `${field} de cambio ${entry.targetId}`;
  const inputClassName = `h-7 rounded-md border border-border bg-background px-2 text-[11px] text-slate-900 dark:text-slate-100 ${field === 'updateDetail' || field === 'support' || field === 'category' ? 'w-full' : field === 'vr' ? 'w-20' : 'min-w-28'}`;

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

  if (entry.isDraft) {
    return <input
      aria-label={label}
      className={inputClassName}
      maxLength={field === 'vr' ? 9 : undefined}
      value={value}
      onChange={(event) => {
        event.stopPropagation();
        onDraftChange(entry.targetKey, field, event.target.value);
      }}
    />;
  }

  return <input
    aria-label={label}
    className={inputClassName}
    maxLength={field === 'vr' ? 9 : undefined}
    value={value}
    onChange={(event) => {
      event.stopPropagation();
      onPersistedInputChange(entry.id, field, event.target.value);
    }}
    onBlur={(event) => {
      event.stopPropagation();
      onPersistedChange(entry.id, field, event.target.value);
    }}
  />;
}

export default function IdentificationChangeLogTable({ entries, drafts, loading, error, requestResponsibleName, deletingEntryId, onDraftChange, onPersistedInputChange, onPersistedChange, onDelete }) {
  const persistedEntries = Array.isArray(entries) ? entries : [];
  const draftEntries = Array.isArray(drafts) ? drafts : [];
  const rows = [
    ...draftEntries.map((entry) => ({ ...entry, isDraft: true })),
    ...persistedEntries.map((entry) => ({ ...entry, isDraft: false })),
  ];

  if (!loading && !error && !rows.length) return null;

  return <section className="mt-4" data-identification-change-log aria-label="Bitácora de cambios de Identificación">
    <div className="mb-2">
      <h3 className="mb-1 text-sm font-semibold">Bitácora de cambios de Identificación</h3>
      <p className="mb-0 text-xs text-muted-foreground">Los cambios detectados se registran al actualizar la solicitud.</p>
    </div>
    {error ? <p className="mb-2 text-xs text-destructive" role="alert">{error}</p> : null}
    {loading && !rows.length ? <p className="px-3 py-2 text-xs text-muted-foreground" role="status">Cargando bitácora de cambios...</p> : null}
    {rows.length ? <div className="overflow-auto rounded-md border border-border">
      <table className="min-w-full border-separate border-spacing-0 text-[11px] text-foreground">
        <thead className="bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            {['ID', 'FECHA', 'VR', 'RESPONSABLE', 'CATEGORÍA', 'ACTUALIZACIÓN', 'SOPORTE', 'RADICACIÓN', 'ACCIÓN'].map((column) => (
               <th key={column} className={`border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase last:border-r-0 dark:border-slate-600 ${column === 'VR' ? 'w-24' : column === 'CATEGORÍA' ? 'w-32' : column === 'ACCIÓN' ? 'w-16' : ''}`}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((entry) => <tr key={entry.isDraft ? `draft-${entry.targetKey}` : entry.id}>
            <td className="border-b border-r border-border px-2 py-1 text-center font-semibold">{entry.targetId}</td>
            <td className="border-b border-r border-border px-2 py-1 whitespace-nowrap">{formatChangeDate(entry.createdAt || entry.detectedAt)}</td>
            <td className="w-24 border-b border-r border-border px-2 py-1 text-center"><EditableCell entry={entry} field="vr" onDraftChange={onDraftChange} onPersistedInputChange={onPersistedInputChange} onPersistedChange={onPersistedChange} /></td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{requestResponsibleName || entry.responsibleName || 'Sin responsable registrado'}</td>
            <td className="w-32 border-b border-r border-border px-2 py-1"><EditableCell entry={entry} field="category" onDraftChange={onDraftChange} onPersistedInputChange={onPersistedInputChange} onPersistedChange={onPersistedChange} /></td>
            <td className="border-b border-r border-border px-2 py-1"><EditableCell entry={entry} field="updateDetail" onDraftChange={onDraftChange} onPersistedInputChange={onPersistedInputChange} onPersistedChange={onPersistedChange} /></td>
            <td className="border-b border-r border-border px-2 py-1"><EditableCell entry={entry} field="support" onDraftChange={onDraftChange} onPersistedInputChange={onPersistedInputChange} onPersistedChange={onPersistedChange} /></td>
            <td className="border-b border-border px-2 py-1 text-center font-semibold">{entry.receiptStatus || 'SIN DEFINIR'}</td>
            <td className="w-16 border-b border-border px-2 py-1 text-center">
              {entry.isDraft ? <span className="text-muted-foreground">-</span> : <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Eliminar cambio ${entry.targetId}`}
                title="Eliminar cambio"
                disabled={deletingEntryId === entry.id}
                onClick={() => onDelete(entry.id)}
              ><Icon name="trash-alt" size={14} /></button>}
            </td>
          </tr>)}
        </tbody>
      </table>
    </div> : null}
  </section>;
}
