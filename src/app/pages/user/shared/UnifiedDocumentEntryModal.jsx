import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { DOCUMENT_ORIGIN_META, DOCUMENT_ORIGIN_STATE } from './expediente-documental.constants';
import { buildDocumentDownloadUrl, buildDocumentPreviewUrl } from './expediente-documental.utils';

const EMPTY_EVALUATION_TEXT = 'Evaluación documental pendiente de definir para esta entrada.';

function getEntryTitle(entry) {
    return [entry?.documentName, entry?.documentCode].filter(Boolean).join(' · ') || 'Documento sin nombre';
}

function getSourceEntries(group) {
    return (group?.entries || []).flatMap((entry, entryIndex) => {
        if (!entry?.isConsolidated || !Array.isArray(entry.sources) || !entry.sources.length) {
            return [{ ...entry, sourceLabel: entry.originLabel || 'Entrada documental' }];
        }

        return entry.sources.map((source, sourceIndex) => {
            const originState = source.originState || entry.originState || DOCUMENT_ORIGIN_STATE.PHYSICAL;
            const originMeta = DOCUMENT_ORIGIN_META[originState] || DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.PHYSICAL];

            return {
                ...source,
                entryId: source.entryId || `${entry.entryId || entryIndex}:source:${sourceIndex}`,
                sourceTable: source.sourceTable,
                documentCode: source.documentCode || entry.documentCode,
                documentName: source.documentName || entry.documentName,
                vr: source.vr || entry.vr,
                date: source.date || '',
                time: source.time || '',
                pages: source.pages ?? '',
                filename: source.filename || '',
                path: source.path || '',
                originState,
                originLabel: source.originLabel || originMeta.label,
                receptionMedium: source.receptionMedium || '',
                receptionMediumLabel: source.receptionMediumLabel || '',
                canPreview: Boolean(source.canPreview || source.previewUrl),
                canEdit: Boolean(source.canEdit),
                canDelete: Boolean(source.canDelete),
                evaluationSummary: source.evaluationSummary || entry.evaluationSummary,
                raw: source.raw || source,
                sourceId: source.sourceId || source.raw?.id || source.id,
                sourceLabel: source.source === 'scanned' ? 'Escaneo' : source.source === 'digital' ? 'Digital' : 'VR físico',
                previewUrl: buildDocumentPreviewUrl(source),
                downloadUrl: buildDocumentDownloadUrl(source),
            };
        });
    });
}

function toEditableDocument(entry) {
    return {
        ...(entry?.raw || {}),
        id: entry?.raw?.id || entry?.sourceId || entry?.id,
        description: entry?.raw?.description || entry?.documentName || '',
        id_public: entry?.raw?.id_public || entry?.documentCode || '',
        id_replace: entry?.raw?.id_replace || entry?.vr || '',
        pages: entry?.raw?.pages ?? entry?.pages ?? '',
        date: entry?.raw?.date || entry?.date || '',
        origin_state: entry?.originState || entry?.raw?.origin_state || '',
        medio_recepcion: entry?.receptionMedium || entry?.raw?.medio_recepcion || '',
    };
}

function UnifiedDocumentEntryModal({
    open,
    group,
    mode = 'history',
    canManage = false,
    onClose,
    onEditEntry,
    onSaveDigitalEntry,
    onDeleteEntry,
    vrList = [],
}) {
    const sortedEntries = useMemo(() => getSourceEntries(group), [group]);
    const [selectedEntryId, setSelectedEntryId] = useState('');
    const [editForm, setEditForm] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
    const selectedEntry = sortedEntries.find((entry) => entry.entryId === selectedEntryId) || sortedEntries[0] || null;
    const selectedOrigin = selectedEntry?.originState || DOCUMENT_ORIGIN_STATE.PHYSICAL;
    const originMeta = DOCUMENT_ORIGIN_META[selectedOrigin] || DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.PHYSICAL];
    const previewUrl = buildDocumentPreviewUrl(selectedEntry);
    const downloadUrl = buildDocumentDownloadUrl(selectedEntry);
    const isEditMode = mode === 'edit';
    const isEvaluationMode = mode === 'evaluation';

    useEffect(() => {
        setEditForm(null);
        setSelectedEntryId('');
        setIsPreviewFullscreen(false);
    }, [open, group?.id, mode]);

    useEffect(() => {
        if (!editForm || !selectedEntry) {
            return;
        }

        setEditForm((current) => current ? {
            ...current,
            pages: selectedEntry.pages || '',
            vr: selectedEntry.vr || '',
        } : current);
    }, [selectedEntry?.entryId]);

    const startInlineEdit = (entry) => {
        setSelectedEntryId(entry.entryId);
        setEditForm({
            pages: entry.pages || '',
            vr: entry.vr || '',
        });
        onEditEntry?.(toEditableDocument(entry));
    };

    const saveInlineEdit = async () => {
        if (!selectedEntry || !editForm || !onSaveDigitalEntry) {
            return;
        }

        setSavingEdit(true);
        try {
            await onSaveDigitalEntry(toEditableDocument(selectedEntry), editForm);
            setEditForm(null);
        } finally {
            setSavingEdit(false);
        }
    };

    if (!open || !group) {
        return null;
    }

    return <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/45 px-4 py-5" role="dialog" aria-modal="true">
        <div className="flex h-[min(90dvh,920px)] w-[min(96vw,1680px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
                <div>
                    <p className="mb-0 text-base font-semibold text-foreground">{group.documentName}</p>
                    <p className="mb-0 text-xs text-muted-foreground">{group.entryCount} entrada(s) · VR reciente: {group.latestVr || 'Sin VR'}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar detalle documental">
                    <Icon name="times" size={14} />
                </Button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
                <div className="min-h-0 overflow-auto border-r border-border p-3">
                    <div className="overflow-hidden rounded-xl border border-border">
                        <table className="min-w-[820px] w-full table-fixed text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="w-[20%] px-3 py-2 text-left">Fecha</th>
                                    <th className="w-[16%] px-3 py-2 text-left">VR</th>
                                    <th className="w-[10%] px-3 py-2 text-left">Folios</th>
                                    <th className="w-[18%] px-3 py-2 text-left">Origen</th>
                                    <th className="w-[16%] px-3 py-2 text-left">Medio</th>
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
                                        <td className="px-3 py-2 font-mono text-xs leading-snug" title={entry.vr || 'Sin VR'}>{entry.vr || 'Sin VR'}</td>
                                        <td className="px-3 py-2 text-xs font-mono">{entry.pages || 'Sin dato'}</td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${meta.activeClassName}`} title={meta.tooltip}>
                                                <Icon name={meta.icon} size={12} /> {meta.label}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-muted-foreground">{entry.receptionMediumLabel || ''}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-center gap-1">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedEntryId(entry.entryId)} title="Ver esta entrada" aria-label="Ver esta entrada">
                                                    <Icon name="eye" size={13} />
                                                </Button>
                                                {isEditMode && editable ? <Button type="button" variant="ghost" size="sm" onClick={() => startInlineEdit(entry)} title="Editar entrada digital" aria-label="Editar entrada digital">
                                                    <Icon name="edit" size={13} />
                                                </Button> : null}
                                                {isEditMode && editable && entry.canDelete ? <Button type="button" variant="ghost" size="sm" onClick={() => onDeleteEntry?.(entry.raw || entry)} title="Eliminar entrada digital" aria-label="Eliminar entrada digital">
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
                            <span>Fuente: <b className="text-foreground">{selectedEntry?.sourceLabel || selectedEntry?.sourceTable || 'Sin dato'}</b></span>
                        </div>
                    </div>

                    {isEditMode && editForm && selectedEntry?.canEdit ? <div className="mb-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <p className="mb-2 text-sm font-semibold text-foreground">Editar entrada digital</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-xs font-medium text-muted-foreground">
                                Folios digitalizados
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                                    value={editForm.pages}
                                    onChange={(event) => setEditForm((current) => ({ ...current, pages: event.target.value }))}
                                />
                            </label>
                            <label className="text-xs font-medium text-muted-foreground">
                                VR relacionado
                                <select
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                                    value={editForm.vr}
                                    onChange={(event) => setEditForm((current) => ({ ...current, vr: event.target.value }))}
                                >
                                    <option value="">SIN VR</option>
                                    {vrList.map((vr) => <option key={vr} value={vr}>{vr}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditForm(null)} disabled={savingEdit}>Cancelar</Button>
                            <Button type="button" size="sm" onClick={saveInlineEdit} disabled={savingEdit || !onSaveDigitalEntry}>
                                <Icon name="archive" size={13} /> {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </div> : null}

                    {isEvaluationMode ? <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                        <p className="mb-2 font-semibold text-foreground">Resultado de evaluación</p>
                        <p className="mb-0">{selectedEntry?.evaluationSummary?.status || EMPTY_EVALUATION_TEXT}</p>
                    </div> : <>
                        {previewUrl ? <iframe
                            title={`Vista previa ${selectedEntry?.documentName || 'documento'}`}
                            src={previewUrl}
                            className="h-[54vh] w-full rounded-xl border border-border bg-muted"
                        /> : <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-center text-sm text-muted-foreground">
                            Esta entrada no tiene archivo digital para previsualizar.
                        </div>}
                {previewUrl ? <div className="mt-3 flex flex-wrap justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" aria-label="Ver archivo previsualizado en pantalla completa" onClick={() => setIsPreviewFullscreen(true)}>
                                <Icon name="expand-arrows-alt" size={14} /> Pantalla completa
                            </Button>
                            {downloadUrl ? <Button type="button" variant="outline" size="sm" aria-label="Descargar archivo previsualizado" onClick={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')}>
                                 <Icon name="Download" size={14} /> Descargar archivo
                             </Button> : null}
                         </div> : null}
                    </>}
                </div>
            </div>
        </div>

        {isPreviewFullscreen && previewUrl ? <div className="fixed inset-0 z-[1080] flex flex-col bg-slate-950/85 p-4" role="dialog" aria-modal="true" aria-label="Previsualización documental en pantalla completa">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                    <div className="min-w-0">
                        <p className="mb-0 truncate text-sm font-semibold text-foreground">{getEntryTitle(selectedEntry)}</p>
                        <p className="mb-0 text-xs text-muted-foreground">Vista en pantalla completa · no descarga el archivo</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsPreviewFullscreen(false)} aria-label="Cerrar previsualización en pantalla completa">
                        <Icon name="times" size={14} /> Cerrar
                    </Button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden p-4">
                    <iframe
                        title={`Vista completa ${selectedEntry?.documentName || 'documento'}`}
                        src={previewUrl}
                        className="h-full min-h-[calc(100vh-10rem)] w-full rounded-xl border border-border bg-muted"
                    />
                </div>
            </div>
        </div> : null}
    </div>;
}

export default UnifiedDocumentEntryModal;
