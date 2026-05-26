import React, { useEffect, useMemo, useState } from 'react';

import FUNService from '../../../../services/fun.service';
import {
    buildCorrelatedRequirementRows,
    getRequirementVisualState,
} from '../utils/correlatedDocumentControl.utils';

const EMPTY_ARRAY = [];

const visualStateClasses = {
    success: 'border-accent/40 bg-accent/10 text-foreground',
    warning: 'border-warning/40 bg-warning/10 text-foreground',
    destructive: 'border-destructive/40 bg-destructive/10 text-foreground',
    muted: 'border-border bg-muted/60 text-muted-foreground',
};

const previewLabels = {
    available: 'Preview disponible',
    physical_only: 'Soporte físico sin preview',
    not_previewable: 'Registrado sin preview',
    not_uploaded: 'Sin documento o VR',
};

const sourceLabels = {
    digital: 'Documento digital',
    physical: 'Documento físico',
};

function getEvidenceSourceLabel(entry = {}) {
    return sourceLabels[entry.sourceType] || 'Fuente documental';
}

function getEntryPreviewUrl(entry = {}) {
    if (!entry || entry.sourceType === 'physical' || !entry.canPreview) return '';
    return entry.previewUrl || entry.downloadUrl || '';
}

function getInitialSelectedEntryId(row = {}) {
    const evidence = row.evidence || EMPTY_ARRAY;
    const previewableEntry = evidence.find((entry) => getEntryPreviewUrl(entry));
    return (previewableEntry || evidence[0])?.id || '';
}

function getSelectedEntry(row = {}, selectedEntryId = '') {
    const evidence = row.evidence || EMPTY_ARRAY;
    return evidence.find((entry) => entry.id === selectedEntryId)
        || evidence.find((entry) => getEntryPreviewUrl(entry))
        || evidence[0]
        || null;
}

function getNoPreviewMessage(entry = {}) {
    if (entry?.sourceType === 'physical') return 'Documento físico: no tiene previsualización digital';
    return 'Esta entrada no tiene archivo digital para previsualizar';
}

function getUnifiedEntriesFromResponse(response) {
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.entries)) return data.entries;
    return EMPTY_ARRAY;
}

function StatusBadge({ children, className = '', ...props }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none ${className}`.trim()}
            {...props}
        >
            {children}
        </span>
    );
}

function getDetailButtonLabel(row, readOnly) {
    if (readOnly) return 'Solo lectura';
    if (row.previewState === 'physical_only') return 'Soporte físico';
    if (row.previewState !== 'available') return 'Sin preview';
    return 'Ver detalle';
}

function DetailPanel({ row, selectedEntryId, onSelectEntry, onClose }) {
    const evidence = row.evidence || EMPTY_ARRAY;
    const selectedEntry = getSelectedEntry(row, selectedEntryId);
    const previewUrl = getEntryPreviewUrl(selectedEntry);

    return (
        <section
            className="mt-4 rounded-xl border border-border bg-muted/20 p-4 text-foreground shadow-sm"
            role="region"
            aria-label={`Detalle documental ${row.code}`}
        >
            <div className="mb-4 flex flex-col gap-3 border-b border-border/70 pb-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 space-y-1">
                    <p className="mb-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Detalle de evidencia
                    </p>
                    <h4 className="mb-0 text-base font-semibold leading-tight text-foreground">
                        {row.code} · {row.label}
                    </h4>
                    <p className="mb-0 text-sm leading-6 text-muted-foreground">
                        Seleccione la entrada física o digital que se evaluará para este requisito.
                    </p>
                </div>
                <button
                    type="button"
                    className="inline-flex min-h-9 items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={onClose}
                    aria-label={`Cerrar detalle documental ${row.code}`}
                >
                    Cerrar
                </button>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="VR relacionadas">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    VR relacionadas
                </span>
                {row.relatedVRs.length ? row.relatedVRs.map((vr) => (
                    <span key={vr} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground">
                        {vr}
                    </span>
                )) : (
                    <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        Sin VR asociada
                    </span>
                )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-2" aria-label="Entradas de evidencia documental">
                    <h5 className="mb-1 text-sm font-semibold text-foreground">Entradas del requisito</h5>
                    {evidence.map((entry) => {
                        const selected = selectedEntry?.id === entry.id;
                        const sourceLabel = getEvidenceSourceLabel(entry);

                        return (
                            <button
                                key={entry.id}
                                type="button"
                                className={[
                                    'w-full rounded-lg border px-3 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                    selected
                                        ? 'border-primary/50 bg-primary/10 text-foreground shadow-sm'
                                        : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/40',
                                ].join(' ')}
                                aria-pressed={selected}
                                onClick={() => onSelectEntry(entry.id)}
                            >
                                <span className="block font-semibold leading-5 text-foreground">{entry.name}</span>
                                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                    VR: {entry.vr || 'Sin VR'} · {sourceLabel}
                                </span>
                                {selected ? (
                                    <span className="mt-2 inline-flex rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold text-foreground">
                                        Entrada seleccionada para evaluación
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                <section className="min-w-0 rounded-xl border border-border bg-background p-3" aria-label="Previsualización de entrada seleccionada">
                    <div className="mb-3 rounded-lg border border-border bg-muted/20 p-3">
                        <p className="mb-1 text-sm font-semibold text-foreground">{selectedEntry?.name || 'Entrada sin seleccionar'}</p>
                        <p className="mb-0 text-xs leading-5 text-muted-foreground">
                            VR: <span className="font-semibold text-foreground">{selectedEntry?.vr || 'Sin VR'}</span> · {getEvidenceSourceLabel(selectedEntry)}
                        </p>
                    </div>

                    {previewUrl ? (
                        <iframe
                            title={`Previsualización documental ${selectedEntry.name}`}
                            src={previewUrl}
                            className="h-[min(64vh,40rem)] min-h-[22rem] w-full rounded-lg border border-border bg-muted/20"
                        />
                    ) : (
                        <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-5 text-center">
                            <p className="mb-1 text-sm font-semibold text-foreground">{getNoPreviewMessage(selectedEntry)}</p>
                            <p className="mb-0 max-w-md text-sm leading-6 text-muted-foreground">
                                Seleccione una entrada digital con archivo disponible si existe para este requisito.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
}

export default function FunCorrelatedDocumentControl({
    currentItem,
    currentVersion,
    codes = EMPTY_ARRAY,
    labels = {},
    getCheckValue = () => 'sin_definir',
    isRequirementApplicable = () => false,
    readOnly = false,
}) {
    const [unifiedEntries, setUnifiedEntries] = useState(EMPTY_ARRAY);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedEntryId, setSelectedEntryId] = useState('');
    const contextKey = `${currentItem?.id || ''}|${currentItem?.id_public || ''}|${currentVersion || ''}`;

    useEffect(() => {
        let isMounted = true;
        const funId = currentItem?.id;
        const relatedId = currentItem?.id_public || currentItem?.id;

        setUnifiedEntries(EMPTY_ARRAY);
        setLoadError('');
        setSelectedRow(null);
        setSelectedEntryId('');

        if (!funId || !relatedId) {
            setIsLoading(false);
            return () => {
                isMounted = false;
            };
        }

        setIsLoading(true);

        FUNService.getUnifiedDocumentEntries(funId, relatedId)
            .then((response) => {
                if (!isMounted) return;
                setUnifiedEntries(getUnifiedEntriesFromResponse(response));
            })
            .catch(() => {
                if (!isMounted) return;
                setUnifiedEntries(EMPTY_ARRAY);
                setLoadError('No fue posible cargar documentos unificados. La tabla sigue disponible con datos locales.');
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [contextKey, currentItem?.id, currentItem?.id_public]);

    const selectedEvaluationContext = useMemo(() => {
        if (!selectedRow?.code || !selectedEntryId) return {};
        return {
            [selectedRow.code]: {
                entryId: selectedEntryId,
                status: selectedRow.evaluationStatus,
            },
        };
    }, [selectedEntryId, selectedRow?.code, selectedRow?.evaluationStatus]);

    const rows = useMemo(() => buildCorrelatedRequirementRows({
        codes,
        labels,
        getCheckValue,
        isRequirementApplicable,
        unifiedEntries,
        legacyFun6Docs: currentItem?.fun_6s || EMPTY_ARRAY,
        existingEvaluationContext: selectedEvaluationContext,
    }), [codes, labels, getCheckValue, isRequirementApplicable, unifiedEntries, currentItem?.fun_6s, selectedEvaluationContext]);

    const summary = useMemo(() => ({
        applicable: rows.filter((row) => row.applicability === 'aplica').length,
        preview: rows.filter((row) => row.previewState === 'available').length,
        physical: rows.filter((row) => row.previewState === 'physical_only').length,
        missing: rows.filter((row) => row.previewState === 'not_uploaded').length,
        updated: rows.filter((row) => row.supersededByNewVR).length,
    }), [rows]);

    const currentSelectedRow = useMemo(() => {
        if (!selectedRow?.code) return null;
        return rows.find((row) => row.code === selectedRow.code) || null;
    }, [rows, selectedRow]);

    const openDetail = (row) => {
        setSelectedRow(row);
        setSelectedEntryId(getInitialSelectedEntryId(row));
    };

    const closeDetail = () => {
        setSelectedRow(null);
        setSelectedEntryId('');
    };

    return (
        <section
            className="rounded-xl border border-border bg-card/90 p-4 text-foreground shadow-sm"
            aria-labelledby="fun-correlated-control-title"
        >
            <div className="mb-4 flex flex-col gap-3 border-b border-border/70 pb-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 space-y-1">
                    <p className="mb-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Control de requisitos FUN
                    </p>
                    <h3 id="fun-correlated-control-title" className="mb-0 text-lg font-semibold leading-tight text-foreground">
                        Control documental correlacionado
                    </h3>
                    <p className="mb-0 max-w-3xl text-sm leading-6 text-muted-foreground">
                        Cruza requisitos por actuación con documentos, VR y evaluación. La ausencia de evidencia se muestra como estado informativo. No bloquea el envío a Legal y debida forma.
                    </p>
                </div>
                {isLoading ? (
                    <StatusBadge className="shrink-0 border-border bg-muted/60 text-muted-foreground" role="status" aria-live="polite">
                        Cargando evidencia
                    </StatusBadge>
                ) : null}
            </div>

            <div className="mb-4 flex flex-wrap gap-2 text-sm" aria-label="Resumen de control documental">
                <StatusBadge className="border-border bg-background text-foreground">Aplicables: {summary.applicable}</StatusBadge>
                <StatusBadge className="border-border bg-background text-foreground">Con preview: {summary.preview}</StatusBadge>
                <StatusBadge className="border-border bg-background text-foreground">Físicos/VR: {summary.physical}</StatusBadge>
                <StatusBadge className="border-warning/40 bg-warning/10 text-foreground">Sin evidencia: {summary.missing}</StatusBadge>
                <StatusBadge className="border-border bg-background text-foreground">Actualizados: {summary.updated}</StatusBadge>
            </div>

            {loadError ? (
                <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm leading-6 text-foreground" role="alert">
                    {loadError}
                </div>
            ) : null}

            <div className="overflow-x-auto rounded-lg border border-border bg-background/70">
                <table className="w-full border-collapse text-sm">
                    <caption className="sr-only">
                        Requisitos correlacionados con documentos, VR, estado de evidencia y disponibilidad de detalle.
                    </caption>
                    <thead className="bg-muted/40 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                        <tr>
                            <th className="px-3 py-3 font-semibold" scope="col">Requisito</th>
                            <th className="px-3 py-3 font-semibold" scope="col">Validación</th>
                            <th className="px-3 py-3 font-semibold" scope="col">Evidencia</th>
                            <th className="px-3 py-3 font-semibold" scope="col">VR / entrada evaluada</th>
                            <th className="px-3 py-3 font-semibold" scope="col">Evaluación</th>
                            <th className="px-3 py-3 font-semibold" scope="col">Detalle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => {
                            const visualState = getRequirementVisualState(row);
                            const canOpenDetail = !readOnly && row.previewState === 'available';
                            const detailButtonLabel = getDetailButtonLabel(row, readOnly);

                            return (
                                <tr key={row.code} className="border-t border-border align-top transition-colors hover:bg-muted/30">
                                    <th className="px-3 py-3 text-left font-normal" scope="row">
                                        <div className="font-semibold text-foreground">{row.code} · {row.label}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">Sección {row.section}</div>
                                    </th>
                                    <td className="px-3 py-3">
                                        <StatusBadge className={row.applicability === 'aplica' ? 'border-accent/40 bg-accent/10 text-foreground' : 'border-border bg-muted/60 text-muted-foreground'}>
                                            {row.applicability === 'aplica' ? 'Aplica' : 'No aplica'}
                                        </StatusBadge>
                                        <div className="mt-2 text-xs text-muted-foreground">Checklist: {row.checkValue}</div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <StatusBadge className={visualStateClasses[visualState]} aria-label={`Estado de evidencia: ${row.evidenceSummary.label}`}>
                                            {row.evidenceSummary.label}
                                        </StatusBadge>
                                        {row.previewState === 'not_uploaded' ? (
                                            <p className="mb-0 mt-2 text-xs leading-5 text-muted-foreground">
                                                Informativo: puede continuar hacia Legal y debida forma.
                                            </p>
                                        ) : null}
                                        {row.supersededByNewVR ? (
                                            <p className="mb-0 mt-2 text-xs font-medium leading-5 text-foreground">
                                                Evaluado con VR anterior; hay actualización posterior.
                                            </p>
                                        ) : null}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-foreground">
                                        {row.relatedVRs.length ? row.relatedVRs.join(', ') : <span className="text-muted-foreground">Sin VR asociada</span>}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-foreground">{row.evaluationStatus}</td>
                                    <td className="px-3 py-3">
                                        <div className="flex flex-col items-start gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {previewLabels[row.previewState] || 'Estado por revisar'}
                                            </span>
                                            <button
                                                type="button"
                                                className="inline-flex min-h-9 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65"
                                                disabled={!canOpenDetail}
                                                aria-label={`${detailButtonLabel} para requisito ${row.code}`}
                                                onClick={() => openDetail(row)}
                                            >
                                                {detailButtonLabel}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {currentSelectedRow ? (
                <DetailPanel
                    row={currentSelectedRow}
                    selectedEntryId={selectedEntryId}
                    onSelectEntry={setSelectedEntryId}
                    onClose={closeDetail}
                />
            ) : null}
        </section>
    );
}
