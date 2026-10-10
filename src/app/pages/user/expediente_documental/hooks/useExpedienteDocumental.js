import { useCallback, useEffect, useMemo, useState } from 'react';
import FUNService from '../../../../services/fun.service';
import {
    LEGAL_FORM_FILTER,
    DOCUMENT_PREVIEW_MEDIUM,
    buildDocumentTableRows,
    filterDocumentTableRows,
    getDocumentVrDisplayValue,
    isInternalReportVr,
    INTERNAL_REPORT_VR_FILTER,
} from '../../shared/expediente-documental.utils';
import {
    getDocumentSeatCount,
    getLatestDocumentVr,
    matchesDocumentalColumnFilters,
    mergeDocumentRowsByStableUnit,
    prepareDocumentEntriesForStableUnits,
} from '../documentalViewModel';

const DEFAULT_FILTERS = {
    document: '',
    vr: '',
    mediums: [],
    date: '',
    statuses: [],
    folios: '',
    legalForm: LEGAL_FORM_FILTER.ALL,
};
const DEFAULT_ENTRY_SHEET = { open: false, mode: 'history', group: null };
const ENTRIES_FETCH_ERROR_MESSAGE = 'No fue posible consultar el expediente documental unificado.';

function areFiltersEqual(filters, other) {
    return filters.document === other.document
        && filters.vr === other.vr
        && filters.date === other.date
        && filters.folios === other.folios
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
            totalEntries: summary.totalEntries + getDocumentSeatCount(row),
        };

        if (row.mediumPresence?.physical || row.medium === DOCUMENT_PREVIEW_MEDIUM.PHYSICAL) nextSummary.physical += 1;
        if (row.mediumPresence?.digital || row.medium === DOCUMENT_PREVIEW_MEDIUM.DIGITAL) nextSummary.digital += 1;
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

function getAvailableVrOptions(rows, { includeHistory = false } = {}) {
    const optionsByValue = new Map();

    rows.forEach((row) => {
        const vrValues = [row.latestVr, ...(includeHistory ? (row.vrValues || []) : [])]
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
 * Owns fetch -> derive -> filter -> paginate -> KPI -> entry-sheet state for the
 * traditional expediente documental view. The shared build/filter rules are
 * reused from `../../shared/expediente-documental.utils`.
 * Missing requirements are not derived here: they only exist for projects
 * activated with a Dovela Central publication (documentary API).
 */
export function useExpedienteDocumental({
    funId,
    idRelated,
    canManage = false,
    pageSize = 12,
} = {}) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);
    const [entrySheet, setEntrySheet] = useState(DEFAULT_ENTRY_SHEET);

    const refresh = useCallback(() => {
        if (!funId || !idRelated) {
            setEntries([]);
            setLoading(false);
            setError('');
            return undefined;
        }

        setLoading(true);
        setError('');

        return FUNService.getUnifiedDocumentEntries(funId, idRelated)
            .then((response) => {
                setEntries(Array.isArray(response?.data) ? response.data : []);
            })
            .catch((reason) => {
                console.warn(ENTRIES_FETCH_ERROR_MESSAGE, reason);
                setEntries([]);
                setError(ENTRIES_FETCH_ERROR_MESSAGE);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [funId, idRelated]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const baseRows = useMemo(
        () => mergeDocumentRowsByStableUnit(
            buildDocumentTableRows(prepareDocumentEntriesForStableUnits(entries)),
        ),
        [entries],
    );
    // Rows only contain stable units backed by real expediente entries.
    const rows = baseRows;
    const filteredRows = useMemo(
        () => filterDocumentTableRows(rows, filters)
            .filter((row) => matchesDocumentalColumnFilters(row, filters)),
        [rows, filters],
    );
    const summary = useMemo(() => getSummary(rows), [rows]);
    const vrOptions = useMemo(() => getAvailableVrOptions(rows), [rows]);
    const latestVr = useMemo(() => getLatestDocumentVr(rows), [rows]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const visibleRows = useMemo(
        () => filteredRows.slice((page - 1) * pageSize, page * pageSize),
        [filteredRows, page, pageSize],
    );
    const hasFilters = Boolean(
        filters.document
        || filters.vr
        || filters.mediums.length
        || filters.date
        || filters.statuses.length
        || filters.folios
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

    const openEntrySheetWith = useCallback((group, mode = 'history') => {
        setEntrySheet({ open: true, group, mode });
    }, []);

    const closeEntrySheet = useCallback(() => {
        setEntrySheet(DEFAULT_ENTRY_SHEET);
    }, []);

    return {
        rows,
        visibleRows,
        filteredCount: filteredRows.length,
        summary,
        vrOptions,
        latestVr,
        loading,
        error,
        filters,
        setFilter,
        resetFilters,
        hasFilters,
        page,
        pageSize,
        totalPages,
        setPage,
        kpi: {
            toggleMedium,
            toggleScanned,
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
