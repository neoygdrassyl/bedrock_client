import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { DOCUMENT_ORIGIN_META, DOCUMENT_ORIGIN_STATE } from './expediente-documental.constants';

const EMPTY_EVALUATION_TEXT = 'Evaluación documental pendiente de definir para esta entrada.';

function buildPreviewUrl(entry) {
    if (!entry?.path || !entry?.filename) {
        return '';
    }

    return `${import.meta.env.VITE_API_URL}/files/${entry.path}/${entry.filename}`;
}

function getEntryTitle(entry) {
    return [entry?.documentName, entry?.documentCode].filter(Boolean).join(' · ') || 'Documento sin nombre';
}

function UnifiedDocumentEntryModal({
    open,
    group,
    mode = 'history',
    canManage = false,
    onClose,
    onEditEntry,
    onDeleteEntry,
}) {
    const sortedEntries = useMemo(() => group?.entries || [], [group]);
    const [selectedEntryId, setSelectedEntryId] = useState('');
    const selectedEntry = sortedEntries.find((entry) => entry.entryId === selectedEntryId) || sortedEntries[0] || null;
    const selectedOrigin = selectedEntry?.originState || DOCUMENT_ORIGIN_STATE.PHYSICAL;
    const originMeta = DOCUMENT_ORIGIN_META[selectedOrigin] || DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.PHYSICAL];
    const previewUrl = buildPreviewUrl(selectedEntry);
    const isEditMode = mode === 'edit';
    const isEvaluationMode = mode === 'evaluation';

    if (!open || !group) {
        return null;
    }

    return <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/45 px-4 py-5" role="dialog" aria-modal="true">
        <div className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
                <div>
                    <p className="mb-0 text-base font-semibold text-foreground">{group.documentName}</p>
                    <p className="mb-0 text-xs text-muted-foreground">{group.entryCount} entrada(s) · VR reciente: {group.latestVr || 'Sin VR'}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar detalle documental">
                    <Icon name="times" size={14} />
                </Button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
                <div className="min-h-0 overflow-auto border-r border-border p-3">
                    <div className="overflow-hidden rounded-xl border border-border">
                        <table className="w-full table-fixed text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 text-left">Fecha</th>
                                    <th className="px-3 py-2 text-left">VR</th>
                                    <th className="px-3 py-2 text-left">Folios</th>
                                    <th className="px-3 py-2 text-left">Origen</th>
                                    <th className="px-3 py-2 text-left">Medio</th>
                                    <th className="px-3 py-2 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedEntries.map((entry) => {
                                    const meta = DOCUMENT_ORIGIN_META[entry.originState] || originMeta;
                                    const selected = selectedEntry?.entryId === entry.entryId;
                                    const editable = canManage && entry.canEdit;

                                    return <tr key={entry.entryId} className={selected ? 'bg-primary/5' : 'bg-background'}>
                                        <td className="px-3 py-2 text-xs font-mono">{entry.date || 'Sin fecha'} {entry.time || ''}</td>
                                        <td className="truncate px-3 py-2" title={entry.vr || 'Sin VR'}>{entry.vr || 'Sin VR'}</td>
                                        <td className="px-3 py-2 text-xs font-mono">{entry.pages || 'Sin dato'}</td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${meta.activeClassName}`} title={meta.tooltip}>
                                                <Icon name={meta.icon} size={12} /> {meta.label}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-muted-foreground">{entry.receptionMediumLabel || ''}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-center gap-1">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedEntryId(entry.entryId)} title="Ver esta entrada">
                                                    <Icon name="eye" size={13} />
                                                </Button>
                                                {isEditMode && editable ? <Button type="button" variant="ghost" size="sm" onClick={() => onEditEntry?.(entry.raw || entry)} title="Editar entrada digital">
                                                    <Icon name="edit" size={13} />
                                                </Button> : null}
                                                {isEditMode && editable && entry.canDelete ? <Button type="button" variant="ghost" size="sm" onClick={() => onDeleteEntry?.(entry.raw || entry)} title="Eliminar entrada digital">
                                                    <Icon name="trash" size={13} />
                                                </Button> : null}
                                            </div>
                                        </td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="min-h-0 overflow-auto p-3">
                    <div className="mb-3 rounded-xl border border-border bg-muted/20 p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Icon name={originMeta.icon} size={14} /> {getEntryTitle(selectedEntry)}
                        </div>
                        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                            <span>VR: <b className="text-foreground">{selectedEntry?.vr || 'Sin VR'}</b></span>
                            <span>Folios: <b className="text-foreground">{selectedEntry?.pages || 'Sin dato'}</b></span>
                            <span>Fecha: <b className="text-foreground">{selectedEntry?.date || 'Sin fecha'}</b></span>
                            <span>Origen: <b className="text-foreground">{selectedEntry?.originLabel || originMeta.label}</b></span>
                            <span>Medio de recepción: <b className="text-foreground">{selectedEntry?.receptionMediumLabel || 'Sin registrar'}</b></span>
                        </div>
                    </div>

                    {isEvaluationMode ? <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                        <p className="mb-2 font-semibold text-foreground">Resultado de evaluación</p>
                        <p className="mb-0">{selectedEntry?.evaluationSummary?.status || EMPTY_EVALUATION_TEXT}</p>
                    </div> : previewUrl ? <iframe
                        title={`Vista previa ${selectedEntry?.documentName || 'documento'}`}
                        src={previewUrl}
                        className="h-[58vh] w-full rounded-xl border border-border bg-muted"
                    /> : <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-center text-sm text-muted-foreground">
                        Esta entrada no tiene archivo digital para previsualizar.
                    </div>}
                </div>
            </div>
        </div>
    </div>;
}

export default UnifiedDocumentEntryModal;
