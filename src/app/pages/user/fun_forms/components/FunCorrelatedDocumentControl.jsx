import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import FUNService from '../../../../services/fun.service';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import {
    buildCorrelatedRequirementRows,
    getRequirementVisualState,
    normalizeEvidenceEntry,
    parseFunReviewMap,
} from '../utils/correlatedDocumentControl.utils';

const EMPTY_ARRAY = [];

const visualStateClasses = {
    success: 'border-accent/40 bg-accent/10 text-foreground',
    warning: 'border-warning/40 bg-warning/10 text-foreground',
    destructive: 'border-destructive/40 bg-destructive/10 text-foreground',
    muted: 'border-border bg-muted/60 text-muted-foreground',
};

const documentStateLabels = {
    available: 'Documento aportado con VR',
    physical_only: 'Documento aportado físico',
    not_previewable: 'Documento aportado sin archivo digital',
    not_uploaded: 'No aportado con VR',
};

const sourceLabels = {
    digital: 'Documento digital',
    physical: 'Documento físico',
};

function getEvidenceSourceLabel(entry = {}) {
    return sourceLabels[entry.sourceType] || 'Fuente documental';
}

function getEntryConsultUrl(entry = {}) {
    if (!entry || entry.sourceType === 'physical' || !entry.canPreview) return '';
    return entry.previewUrl || entry.downloadUrl || '';
}

function getUnifiedEntriesFromResponse(response) {
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.entries)) return data.entries;
    return EMPTY_ARRAY;
}

function getSelectedEntry(row = {}, selectedEntryId = '', allEntries = EMPTY_ARRAY) {
    const evidence = row.evidence || EMPTY_ARRAY;
    const allDocumentEntries = allEntries || EMPTY_ARRAY;
    return evidence.find((entry) => entry.id === selectedEntryId)
        || allDocumentEntries.find((entry) => entry.id === selectedEntryId)
        || evidence.find((entry) => getEntryConsultUrl(entry))
        || evidence[0]
        || null;
}

function getEntryOptionLabel(index) {
    return `Opción ${index + 1}`;
}

function getSelectedEntryOptionLabel(selectedEntry, row = {}, allEntries = EMPTY_ARRAY) {
    if (!selectedEntry) return '';

    const relatedIndex = (row.evidence || EMPTY_ARRAY).findIndex((entry) => entry.id === selectedEntry.id);
    if (relatedIndex >= 0) return getEntryOptionLabel(relatedIndex);

    const sameCodeEntries = (allEntries || EMPTY_ARRAY).filter((entry) => entry.code === selectedEntry.code);
    const sameCodeIndex = sameCodeEntries.findIndex((entry) => entry.id === selectedEntry.id);
    return sameCodeIndex >= 0 ? getEntryOptionLabel(sameCodeIndex) : '';
}

function StatusBadge({ children, className = '', ...props }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none ${className}`.trim()}
            {...props}
        >
            {children}
        </span>
    );
}

function getCheckValueForForm(row) {
    if (row.checkValue === 'SI') return '1';
    if (row.checkValue === 'NO') return '0';
    if (row.checkValue === 'N/A') return '2';
    return '';
}

function getDocumentSelectionValue(row = {}, evaluationContext = {}) {
    const savedValue = String(evaluationContext[row.code]?.entryId || row.selectedEvaluationEntry || '');
    if (savedValue) return savedValue;
    const consultableEntry = (row.evidence || EMPTY_ARRAY).find((entry) => getEntryConsultUrl(entry));
    return String((consultableEntry || row.evidence?.[0])?.id || '0');
}

function getEvaluationValue(row = {}, evaluationContext = {}) {
    return String(evaluationContext[row.code]?.status || row.evaluationStatus || getCheckValueForForm(row));
}

function buildReviewCsv(rows, evaluationContext) {
    return rows
        .map((row) => `${row.code}&${getEvaluationValue(row, evaluationContext)}`)
        .join();
}

function buildId6Csv(rows, evaluationContext) {
    return rows
        .map((row) => `${row.code}&${getDocumentSelectionValue(row, evaluationContext) || '0'}`)
        .join();
}

function buildAllDocumentEntries(unifiedEntries = EMPTY_ARRAY, legacyFun6Docs = EMPTY_ARRAY) {
    const seen = new Set();
    return [...unifiedEntries, ...legacyFun6Docs]
        .map(normalizeEvidenceEntry)
        .filter((entry) => entry.code)
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))
        .filter((entry) => {
            const key = `${entry.code}:${entry.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

function getSelectedDocumentDisplay(row, evaluationContext, allEntries) {
    const selectedValue = getDocumentSelectionValue(row, evaluationContext);
    const selectedEntry = getSelectedEntry(row, selectedValue, allEntries);
    const optionLabel = getSelectedEntryOptionLabel(selectedEntry, row, allEntries);

    if (selectedEntry?.id === selectedValue) {
        return {
            name: optionLabel ? `${optionLabel} · ${selectedEntry.name}` : selectedEntry.name,
            meta: `VR ${selectedEntry.vr || 'Sin VR'} · ${getEvidenceSourceLabel(selectedEntry)}`,
            entry: selectedEntry,
        };
    }

    if (selectedValue === '-1') {
        return {
            name: 'Documento aportado físicamente',
            meta: 'Soporte físico sin archivo digital asociado',
            entry: null,
        };
    }

    if (!selectedValue || selectedValue === '0') {
        return {
            name: 'Sin documento asociado',
            meta: 'La ausencia queda visible para revisión legal',
            entry: null,
        };
    }

    return {
        name: `Documento asociado previamente (${selectedValue})`,
        meta: 'VR/documento heredado de fun_r anterior',
        entry: null,
    };
}

function groupOtherDocumentEntries(allEntries, row, labels) {
    return allEntries
        .filter((entry) => entry.code !== row.code)
        .reduce((groups, entry) => {
            const currentGroup = groups.find((group) => group.code === entry.code);
            if (currentGroup) {
                currentGroup.entries.push(entry);
                return groups;
            }
            return [
                ...groups,
                {
                    code: entry.code,
                    title: labels[entry.code] || `Requisito ${entry.code}`,
                    entries: [entry],
                },
            ];
        }, []);
}

function DocumentEntryTable({ entries, selectedValue, readOnly, onSelectEntry, emptyMessage }) {
    if (!entries.length) {
        return (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-xs leading-5 text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
            <table className="w-full border-collapse text-xs">
                <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    <tr>
                        <th className="px-3 py-2 font-semibold" scope="col">Entrada</th>
                        <th className="w-28 px-3 py-2 font-semibold" scope="col">VR</th>
                        <th className="w-32 px-3 py-2 font-semibold" scope="col">Soporte</th>
                        <th className="w-40 px-3 py-2 font-semibold" scope="col">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry, index) => {
                        const selected = selectedValue === entry.id;
                        const optionLabel = getEntryOptionLabel(index);
                        const actionText = selected ? 'Usado en chequeo' : 'Seleccionar para chequeo';
                        return (
                            <tr key={`${entry.code}-${entry.id}`} className="border-t border-border align-top">
                                <td className="px-3 py-2">
                                    <span className="mb-1 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold leading-none text-foreground">
                                        {optionLabel}
                                    </span>
                                    <span className="block text-xs font-medium leading-5 text-foreground">{entry.name}</span>
                                    <span className="block text-[11px] leading-5 text-muted-foreground">
                                        Código {entry.code}{entry.date ? ` · ${entry.date}` : ''}{entry.pages ? ` · ${entry.pages} folios` : ''}
                                    </span>
                                </td>
                                <td className="px-3 py-2 font-mono text-[11px] text-foreground">{entry.vr || 'Sin VR'}</td>
                                <td className="px-3 py-2">
                                    <StatusBadge className="border-border bg-muted/30 text-foreground">
                                        {getEvidenceSourceLabel(entry)}
                                    </StatusBadge>
                                </td>
                                <td className="px-3 py-2">
                                    <Button
                                        type="button"
                                        variant={selected ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-8 w-full px-2 text-xs"
                                        disabled={readOnly || selected}
                                        aria-label={`${actionText} ${optionLabel} ${entry.name} ${entry.vr || 'Sin VR'}`}
                                        onClick={() => onSelectEntry(entry.id)}
                                    >
                                        {actionText}
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function ManagementModal({ row, allEntries, labels, selectedValue, readOnly, onSelectEntry, onClose }) {
    if (!row) return null;

    const selectedEntry = getSelectedEntry(row, selectedValue, allEntries);
    const selectedEntryOptionLabel = getSelectedEntryOptionLabel(selectedEntry, row, allEntries);
    const selectedEntryDisplayName = selectedEntry
        ? `${selectedEntryOptionLabel ? `${selectedEntryOptionLabel} · ` : ''}${selectedEntry.name}`
        : 'Entrada sin seleccionar';
    const consultUrl = getEntryConsultUrl(selectedEntry);
    const relatedEntries = row.evidence || EMPTY_ARRAY;
    const otherGroups = groupOtherDocumentEntries(allEntries, row, labels);

    return (
        <Dialog open={Boolean(row)} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                className="max-h-[92vh] max-w-[min(96vw,72rem)] overflow-hidden p-0 sm:rounded-xl"
            >
                <DialogHeader className="border-b border-border bg-card px-4 py-3 text-left">
                    <DialogTitle className="text-base font-semibold text-foreground">
                        Gestionar documento {row.code}
                    </DialogTitle>
                    <DialogDescription className="text-xs leading-5 text-muted-foreground">
                        {row.label}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid max-h-[calc(92vh-5rem)] gap-3 overflow-y-auto bg-background p-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
                    <div className="space-y-3">
                        <section className="rounded-xl border border-border bg-card/70 p-3">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <h4 className="mb-0 text-sm font-semibold text-foreground">Entradas relacionadas</h4>
                                <StatusBadge className={visualStateClasses[getRequirementVisualState(row)]}>
                                    {documentStateLabels[row.previewState] || row.evidenceSummary.label}
                                </StatusBadge>
                            </div>
                            <DocumentEntryTable
                                entries={relatedEntries}
                                selectedValue={selectedValue}
                                readOnly={readOnly}
                                onSelectEntry={onSelectEntry}
                                emptyMessage="No hay documento ni VR asociado a este requisito; la ausencia queda visible como información para revisión legal."
                            />
                        </section>

                        <section className="rounded-xl border border-border bg-card/70 p-3">
                            <h4 className="mb-2 text-sm font-semibold text-foreground">Otros documentos adjuntos</h4>
                            {otherGroups.length ? otherGroups.map((group) => (
                                <div key={group.code} className="mb-3 last:mb-0">
                                    <p className="mb-2 text-xs font-semibold leading-5 text-muted-foreground">
                                        {group.code} · {group.title}
                                    </p>
                                    <DocumentEntryTable
                                        entries={group.entries}
                                        selectedValue={selectedValue}
                                        readOnly={readOnly}
                                        onSelectEntry={onSelectEntry}
                                        emptyMessage="No hay documentos en este grupo."
                                    />
                                </div>
                            )) : (
                                <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-xs leading-5 text-muted-foreground">
                                    No hay otros documentos adjuntos disponibles para asociar a este requisito.
                                </div>
                            )}
                        </section>
                    </div>

                    <section className="min-w-0 rounded-xl border border-border bg-card/70 p-3" aria-label="Vista previa del documento seleccionado">
                        <div className="mb-3 rounded-lg border border-border bg-background px-3 py-2">
                            <p className="mb-1 text-sm font-semibold leading-5 text-foreground">
                                {selectedEntryDisplayName}
                            </p>
                            <p className="mb-0 text-xs leading-5 text-muted-foreground">
                                VR: <span className="font-semibold text-foreground">{selectedEntry?.vr || 'Sin VR'}</span>
                                {selectedEntry ? ` · ${getEvidenceSourceLabel(selectedEntry)}` : ''}
                            </p>
                        </div>

                        {consultUrl ? (
                            <iframe
                                title={`Documento aportado ${selectedEntryDisplayName}`}
                                src={consultUrl}
                                className="h-[min(58vh,38rem)] min-h-[20rem] w-full rounded-lg border border-border bg-muted/20"
                            />
                        ) : (
                            <div className="flex min-h-[20rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
                                <p className="mb-0 text-sm font-semibold text-foreground">
                                    {selectedEntry ? 'Esta entrada no tiene archivo digital consultable.' : 'Seleccione una entrada para consultar su soporte.'}
                                </p>
                                <p className="mb-0 max-w-md text-xs leading-5 text-muted-foreground">
                                    Los soportes físicos o heredados siguen visibles como referencia del chequeo aunque no tengan previsualización digital.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function FunCorrelatedDocumentControl({
    currentItem,
    currentVersion,
    codes = EMPTY_ARRAY,
    sections = EMPTY_ARRAY,
    labels = {},
    getCheckValue = () => 'sin_definir',
    isRequirementApplicable = () => false,
    currentReview = null,
    readOnly = false,
    requestUpdate = () => {},
    swaMsg = {},
}) {
    const [unifiedEntries, setUnifiedEntries] = useState(EMPTY_ARRAY);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [actionRowCode, setActionRowCode] = useState('');
    const [evaluationContext, setEvaluationContext] = useState({});
    const funId = currentItem?.id;
    const relatedId = currentItem?.id_public || currentItem?.id;

    useEffect(() => {
        setEvaluationContext(parseFunReviewMap(currentReview || {}));
        setActionRowCode('');
    }, [currentReview]);

    useEffect(() => {
        let isMounted = true;
        setUnifiedEntries(EMPTY_ARRAY);
        setLoadError('');
        setActionRowCode('');

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
                setLoadError('No fue posible cargar documentos unificados. Puede continuar con los datos locales disponibles.');
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [funId, relatedId]);

    const rows = useMemo(() => buildCorrelatedRequirementRows({
        codes,
        sections,
        labels,
        getCheckValue,
        isRequirementApplicable,
        unifiedEntries,
        legacyFun6Docs: currentItem?.fun_6s || EMPTY_ARRAY,
        existingEvaluationContext: evaluationContext,
        onlyApplicable: true,
    }), [codes, sections, labels, getCheckValue, isRequirementApplicable, unifiedEntries, currentItem?.fun_6s, evaluationContext]);

    const groupedRows = useMemo(() => rows.reduce((groups, row) => {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup?.id === row.section) {
            lastGroup.rows.push(row);
            return groups;
        }
        return [...groups, { id: row.section, title: row.sectionTitle || row.section, rows: [row] }];
    }, []), [rows]);

    const allDocumentEntries = useMemo(() => buildAllDocumentEntries(
        unifiedEntries,
        currentItem?.fun_6s || EMPTY_ARRAY,
    ), [unifiedEntries, currentItem?.fun_6s]);

    const selectedActionRow = useMemo(() => {
        if (!actionRowCode) return null;
        return rows.find((row) => row.code === actionRowCode) || null;
    }, [actionRowCode, rows]);

    const updateDocumentSelection = (code, entryId) => {
        setEvaluationContext((current) => ({
            ...current,
            [code]: {
                ...current[code],
                entryId,
            },
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (readOnly) return;

        const formData = new FormData();
        formData.set('review', buildReviewCsv(rows, evaluationContext));
        formData.set('id6', buildId6Csv(rows, evaluationContext));
        formData.set('version', currentVersion);
        formData.set('fun0Id', currentItem?.id || '');
        formData.set('code', currentReview?.code || rows.map((row) => row.code).join());
        formData.set('checked', currentReview?.checked || rows.map(getCheckValueForForm).join());

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

        const request = currentReview?.id
            ? FUNService.update_r(currentReview.id, formData)
            : FUNService.create_funr(formData);

        request
            .then((response) => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                    requestUpdate(currentItem?.id, true);
                    return;
                }
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
            })
            .catch((error) => {
                console.log(error);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
            });
    };

    return (
        <section
            className="rounded-xl border border-border bg-card/90 p-3 text-foreground shadow-sm"
            aria-labelledby="fun-correlated-control-title"
        >
            <div className="mb-3 flex items-center justify-between gap-3">
                <h3 id="fun-correlated-control-title" className="mb-0 text-base font-semibold leading-tight text-foreground">
                    Control documental FUN
                </h3>
                <div className="flex shrink-0 items-center gap-2">
                    {isLoading ? (
                        <StatusBadge className="border-border bg-muted/60 text-muted-foreground" role="status" aria-live="polite">
                            Cargando documentos
                        </StatusBadge>
                    ) : null}
                </div>
            </div>

            {loadError ? (
                <div className="mb-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-5 text-foreground" role="status">
                    {loadError}
                </div>
            ) : null}

            <form onSubmit={handleSubmit}>
                <div
                    className="max-h-[min(54vh,42rem)] overflow-y-auto rounded-lg border border-border bg-background/70"
                    data-testid="fun-correlated-table-scroll"
                >
                    <table className="w-full table-fixed border-collapse text-xs">
                        <caption className="sr-only">
                            Control documental FUN
                        </caption>
                        <thead className="sticky top-0 z-10 bg-muted/80 text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground shadow-sm">
                            <tr>
                                <th className="w-[44%] px-2.5 py-2 font-semibold" scope="col">Requisito</th>
                                <th className="w-[36%] px-2.5 py-2 font-semibold" scope="col">Documento seleccionado</th>
                                <th className="w-[20%] px-2.5 py-2 font-semibold" scope="col">Gestionar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedRows.length ? groupedRows.map((group) => (
                                <FragmentGroup
                                    key={group.id}
                                    group={group}
                                    evaluationContext={evaluationContext}
                                    allDocumentEntries={allDocumentEntries}
                                    setActionRowCode={setActionRowCode}
                                />
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-3 py-6 text-center text-sm text-muted-foreground">
                                        No hay requisitos aplicables para la actuación seleccionada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-3 flex justify-end">
                    <Button type="submit" size="sm" disabled={readOnly || !rows.length}>
                        Guardar control documental
                    </Button>
                </div>
            </form>

            {selectedActionRow ? (
                <ManagementModal
                    row={selectedActionRow}
                    allEntries={allDocumentEntries}
                    labels={labels}
                    selectedValue={getDocumentSelectionValue(selectedActionRow, evaluationContext)}
                    readOnly={readOnly}
                    onSelectEntry={(entryId) => updateDocumentSelection(selectedActionRow.code, entryId)}
                    onClose={() => setActionRowCode('')}
                />
            ) : null}
        </section>
    );
}

function FragmentGroup({ group, evaluationContext, allDocumentEntries, setActionRowCode }) {
    return (
        <>
            <tr className="border-t border-border bg-muted/30">
                <th colSpan={3} scope="colgroup" className="px-2.5 py-2 text-left text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                    {group.title}
                </th>
            </tr>
            {group.rows.map((row) => {
                const visualState = getRequirementVisualState(row);
                const documentDisplay = getSelectedDocumentDisplay(row, evaluationContext, allDocumentEntries);
                const actionLabel = `Gestionar documento ${row.code}`;

                return (
                    <tr key={row.code} className="border-t border-border align-top transition-colors hover:bg-muted/30">
                        <th className="px-2.5 py-2 text-left font-normal" scope="row">
                            <span className="block text-xs font-medium leading-5 text-foreground">{row.code} · {row.label}</span>
                            {row.supersededByNewVR ? (
                                <span className="mt-1 inline-flex rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                                    Usado en chequeo con VR anterior; hay actualización posterior.
                                </span>
                            ) : null}
                        </th>
                        <td className="px-2.5 py-2">
                            <StatusBadge className={visualStateClasses[visualState]}>
                                {documentStateLabels[row.previewState] || row.evidenceSummary.label}
                            </StatusBadge>
                            <div data-testid={`selected-document-${row.code}`} className="mt-2 rounded-md border border-border bg-muted/20 px-2 py-1.5">
                                <span className="block truncate text-xs font-medium leading-5 text-foreground">{documentDisplay.name}</span>
                                <span className="block truncate text-[11px] leading-5 text-muted-foreground">{documentDisplay.meta}</span>
                            </div>
                        </td>
                        <td className="px-2.5 py-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-full px-2 text-xs"
                                aria-label={actionLabel}
                                onClick={() => setActionRowCode(row.code)}
                            >
                                Gestionar
                            </Button>
                        </td>
                    </tr>
                );
            })}
        </>
    );
}
