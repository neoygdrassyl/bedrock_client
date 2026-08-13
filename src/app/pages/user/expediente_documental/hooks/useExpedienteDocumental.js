import { useCallback, useEffect, useMemo, useState } from 'react';
import FUNService from '../../../../services/fun.service';
import {
    LEGAL_FORM_FILTER,
    DOCUMENT_PREVIEW_MEDIUM,
    buildDocumentTableRows,
    decorateDocumentTableRowsWithLegalForm,
    filterDocumentTableRows,
    summarizeLegalFormRequirements,
    getDocumentVrDisplayValue,
    isInternalReportVr,
    INTERNAL_REPORT_VR_FILTER,
} from '../../shared/expediente-documental.utils';

const DEFAULT_FILTERS = { document: '', vr: '', mediums: [], statuses: [], legalForm: LEGAL_FORM_FILTER.ALL };
const DEFAULT_ENTRY_SHEET = { open: false, mode: 'history', group: null };
const ENTRIES_FETCH_ERROR_MESSAGE = 'No fue posible consultar el expediente documental unificado.';
const LEGAL_FORM_FETCH_ERROR_MESSAGE = 'No fue posible consultar Legal y Debida Forma.';

function areFiltersEqual(filters, other) {
    return filters.document === other.document
        && filters.vr === other.vr
        && filters.legalForm === other.legalForm
        && filters.mediums.length === other.mediums.length
        && filters.mediums.every((medium) => other.mediums.includes(medium))
        && filters.statuses.length === other.statuses.length
        && filters.statuses.every((status) => other.statuses.includes(status));
}

function getSummary(rows) {
    return rows.reduce((summary, row) => {
        const nextSummary = {
            ...summary,
            totalGroups: summary.totalGroups + 1,
            totalEntries: summary.totalEntries + row.entryCount,
        };

        if (row.mediumPresence?.[DOCUMENT_PREVIEW_MEDIUM.PHYSICAL] || row.medium === DOCUMENT_PREVIEW_MEDIUM.PHYSICAL) nextSummary.physical += 1;
        if (row.mediumPresence?.[DOCUMENT_PREVIEW_MEDIUM.DIGITAL] || row.medium === DOCUMENT_PREVIEW_MEDIUM.DIGITAL) nextSummary.digital += 1;
        if (row.scanned?.value) nextSummary.scanned += 1;

        return nextSummary;
    }, {
        totalGroups: 0,
        totalEntries: 0,
        physical: 0,
        digital: 0,
        scanned: 0,
    });
}

function getAvailableVrOptions(rows) {
    const optionsByValue = new Map();

    rows.forEach((row) => {
        const vrValues = [row.latestVr, ...(row.vrValues || [])]
            .filter(Boolean)
            .map((value) => String(value).trim())
            .filter(Boolean);

        vrValues.forEach((value) => {
            const optionValue = isInternalReportVr(value) ? INTERNAL_REPORT_VR_FILTER : value;
            const label = getDocumentVrDisplayValue(value);
            const currentOption = optionsByValue.get(optionValue);

            if (currentOption) {
                currentOption.count += 1;
                return;
            }

            optionsByValue.set(optionValue, { value: optionValue, label, count: 1 });
        });
    });

    return Array.from(optionsByValue.values())
        .sort((firstOption, secondOption) => firstOption.label.localeCompare(secondOption.label, 'es', { numeric: true }));
}

/**
 * Owns fetch -> derive -> filter -> paginate -> legal-mode -> KPI -> entry-sheet
 * state for the expediente documental unificado view. Pure domain rules
 * (`buildDocumentTableRows`, `decorateDocumentTableRowsWithLegalForm`,
 * `filterDocumentTableRows`) are reused unmodified from
 * `../../shared/expediente-documental.utils`.
 */
export function useExpedienteDocumental({ funId, idRelated, canManage = false, pageSize = 12 } = {}) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [missingDocumentsResult, setMissingDocumentsResult] = useState(null);
    const [legalLoading, setLegalLoading] = useState(true);
    const [legalError, setLegalError] = useState('');
    const [legalMode, setLegalModeState] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);
    const [entrySheet, setEntrySheet] = useState(DEFAULT_ENTRY_SHEET);

    const refresh = useCallback(() => {
        if (!funId || !idRelated) {
            setEntries([]);
            setLoading(false);
            setError('');
            setMissingDocumentsResult(null);
            setLegalLoading(false);
            setLegalError('');
            return undefined;
        }

        setLoading(true);
        setError('');
        setLegalLoading(true);
        setLegalError('');

        return Promise.allSettled([
            FUNService.getUnifiedDocumentEntries(funId, idRelated),
            FUNService.getMissingDocuments(funId, idRelated),
        ]).then(([entriesResult, missingResult]) => {
            if (entriesResult.status === 'fulfilled') {
                setEntries(Array.isArray(entriesResult.value?.data) ? entriesResult.value.data : []);
            } else {
                console.warn(ENTRIES_FETCH_ERROR_MESSAGE, entriesResult.reason);
                setEntries([]);
                setError(ENTRIES_FETCH_ERROR_MESSAGE);
            }
            setLoading(false);

            if (missingResult.status === 'fulfilled') {
                setMissingDocumentsResult(missingResult.value?.data || null);
            } else {
                console.warn(LEGAL_FORM_FETCH_ERROR_MESSAGE, missingResult.reason);
                setMissingDocumentsResult(null);
                setLegalError(LEGAL_FORM_FETCH_ERROR_MESSAGE);
            }
            setLegalLoading(false);
        });
    }, [funId, idRelated]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const baseRows = useMemo(() => buildDocumentTableRows(entries), [entries]);
    const rows = useMemo(
        () => decorateDocumentTableRowsWithLegalForm(baseRows, missingDocumentsResult),
        [baseRows, missingDocumentsResult],
    );
    const filteredRows = useMemo(() => filterDocumentTableRows(rows, filters), [rows, filters]);
    const summary = useMemo(() => getSummary(rows), [rows]);
    const vrOptions = useMemo(() => getAvailableVrOptions(rows), [rows]);
    const legalSummary = useMemo(() => summarizeLegalFormRequirements(missingDocumentsResult), [missingDocumentsResult]);
    const legalAvailable = Boolean(legalLoading || legalError || legalSummary.source || legalSummary.totalRequired);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const visibleRows = useMemo(
        () => filteredRows.slice((page - 1) * pageSize, page * pageSize),
        [filteredRows, page, pageSize],
    );
    const hasFilters = Boolean(
        filters.document
        || filters.vr
        || filters.mediums.length
        || filters.statuses.length
        || filters.legalForm !== LEGAL_FORM_FILTER.ALL,
    );

    const setFilter = useCallback((key, value) => {
        setPage(1);
        setFilters((current) => ({ ...current, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setPage(1);
        setFilters(DEFAULT_FILTERS);
    }, []);

    const setLegalMode = useCallback((value) => {
        setLegalModeState(value);
        setPage(1);
        if (!value) {
            setFilters((current) => ({ ...current, legalForm: LEGAL_FORM_FILTER.ALL }));
        }
    }, []);

    const toggleMedium = useCallback((medium) => {
        setPage(1);
        setFilters((current) => {
            const soleActiveFilters = { ...DEFAULT_FILTERS, mediums: [medium] };
            const isOnlyActiveMedium = areFiltersEqual(current, soleActiveFilters);
            return isOnlyActiveMedium ? DEFAULT_FILTERS : soleActiveFilters;
        });
    }, []);

    const toggleScanned = useCallback(() => {
        setPage(1);
        setFilters((current) => {
            const soleActiveFilters = { ...DEFAULT_FILTERS, statuses: ['scanned'] };
            const isOnlyScanned = areFiltersEqual(current, soleActiveFilters);
            return isOnlyScanned ? DEFAULT_FILTERS : soleActiveFilters;
        });
    }, []);

    const toggleLegalForm = useCallback((status) => {
        setPage(1);
        setFilters((current) => ({
            ...current,
            legalForm: current.legalForm === status ? LEGAL_FORM_FILTER.ALL : status,
        }));
    }, []);

    const openEntrySheetWith = useCallback((group, mode = 'history') => {
        setEntrySheet({ open: true, group, mode });
    }, []);

    const closeEntrySheet = useCallback(() => {
        setEntrySheet(DEFAULT_ENTRY_SHEET);
    }, []);

    return {
        visibleRows,
        filteredCount: filteredRows.length,
        summary,
        vrOptions,
        loading,
        error,
        filters,
        setFilter,
        resetFilters,
        hasFilters,
        page,
        totalPages,
        setPage,
        legal: {
            mode: legalMode,
            setMode: setLegalMode,
            available: legalAvailable,
            loading: legalLoading,
            error: legalError,
            summary: legalSummary,
            snapshotId: missingDocumentsResult?.snapshotId ?? null,
            configVersionId: missingDocumentsResult?.configVersionId ?? null,
        },
        kpi: {
            toggleMedium,
            toggleScanned,
            toggleLegalForm,
        },
        entrySheet: {
            open: entrySheet.open,
            mode: entrySheet.mode,
            group: entrySheet.group,
            openWith: openEntrySheetWith,
            close: closeEntrySheet,
        },
        refresh,
    };
}

export default useExpedienteDocumental;
