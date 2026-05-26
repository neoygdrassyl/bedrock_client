import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import {
    DOCUMENT_ORIGIN_META,
    DOCUMENT_ORIGIN_STATE,
} from './expediente-documental.constants';
import {
    DOCUMENT_PREVIEW_MEDIUM,
    INTERNAL_REPORT_VR_FILTER,
    buildDocumentTableRows,
    filterDocumentTableRows,
    getDocumentVrDisplayValue,
    isInternalReportVr,
} from './expediente-documental.utils';
import UnifiedDocumentEntryModal from './UnifiedDocumentEntryModal';

const ROWS_PER_PAGE = 12;
const FILTER_LABEL = {
    document: 'Documento',
    vr: 'VR',
    mediums: 'Medio',
    statuses: 'Estado',
};
const SCANNED_STATUS_FILTERS = [
    { value: 'scanned', label: 'Sí', description: 'Físicos con archivo escaneado asociado' },
    { value: 'pending_scan', label: 'No', description: 'Físicos pendientes de escanear' },
    { value: 'not_applicable', label: 'No aplica', description: 'Documentos solo digitales' },
];

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

function FilterButton({ type, activeFilter, activePopover, setActivePopover }) {
    const isOpen = activePopover === type;
    const active = Array.isArray(activeFilter) ? activeFilter.length > 0 : Boolean(activeFilter);

    return <button
        type="button"
        data-document-filter-button="true"
        className={`ml-1 rounded border px-1.5 py-0.5 text-[10px] transition-colors ${active ? 'border-primary/30 bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}`}
        onClick={(event) => {
            event.stopPropagation();
            setActivePopover(isOpen ? '' : type);
        }}
        title={`Filtrar por ${FILTER_LABEL[type]}`}
        aria-label={`Filtrar por ${FILTER_LABEL[type]}`}
        aria-expanded={isOpen}
    >
        <Icon name={active ? 'filter' : 'chevron-down'} size={10} />
    </button>;
}

function KpiFilterButton({ children, className, title, active, onClick }) {
    return <button
        type="button"
        className={`rounded-lg border px-3 py-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className} ${active ? 'ring-2 ring-primary/45 ring-offset-1 ring-offset-background' : ''}`}
        title={title}
        aria-pressed={active}
        onClick={onClick}
    >
        {children}
    </button>;
}

function MediumIconSet({ row }) {
    const options = [
        { medium: DOCUMENT_PREVIEW_MEDIUM.PHYSICAL, label: 'Físico', meta: DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.PHYSICAL] },
        { medium: DOCUMENT_PREVIEW_MEDIUM.DIGITAL, label: 'Digital', meta: DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.DIGITAL] },
    ].filter((option) => row.mediumPresence?.[option.medium] || row.medium === option.medium);
    const visibleOptions = options.length ? options : [{ medium: row.medium, label: row.mediumLabel || 'Sin medio', meta: DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.DIGITAL] }];
    const label = row.mediumLabel || visibleOptions.map((option) => option.label).join(' y ');

    return <div className="flex flex-col gap-1" title={label}>
        <div className="flex items-center gap-1.5">
            {visibleOptions.map((option) => <span
                key={option.medium}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${option.meta.activeClassName}`}
                title={option.meta.tooltip}
            >
                <Icon name={option.meta.icon} size={13} />
            </span>)}
        </div>
        <span className="text-[11px] font-medium leading-tight text-muted-foreground">{label}</span>
    </div>;
}

function ScannedStatus({ row }) {
    const meta = DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.SCANNED];

    if (!row.scanned?.applies) {
        return <span className="text-xs text-muted-foreground" title="Solo aplica para documentos físicos con soporte digitalizado asociado por VR">No aplica</span>;
    }

    return <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${row.scanned.value ? meta.activeClassName : meta.inactiveClassName}`}
        title={row.scanned.value ? 'El documento físico tiene archivo escaneado asociado por VR.' : 'No hay archivo escaneado asociado a este VR físico.'}
    >
        <Icon name={meta.icon} size={12} /> {row.scanned.value ? 'Sí' : 'No'}
    </span>;
}

function FolioSplit({ row }) {
    const digital = row.folios?.digital ?? 0;
    const physical = row.folios?.physical ?? 0;

    return <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border text-xs" title="Folios digitales / folios físicos">
        <div className="border-r border-border bg-primary/5 px-2 py-1">
            <div className="text-[10px] uppercase text-muted-foreground">Digitales</div>
            <div className="font-mono font-semibold text-foreground">{digital || 0}</div>
        </div>
        <div className="bg-warning/5 px-2 py-1">
            <div className="text-[10px] uppercase text-muted-foreground">Físicos</div>
            <div className="font-mono font-semibold text-foreground">{physical || 0}</div>
        </div>
    </div>;
}

function DateOnly({ value }) {
    const date = String(value || '').split(/[T ]/)[0];
    return <span className="font-mono text-xs" title="Fecha de la última entrada que define el VR mostrado">{date || 'Sin fecha'}</span>;
}

function UnifiedDocumentTable({
    entries = [],
    loading = false,
    canManage = false,
    onAddDocument,
    onEditEntry,
    onSaveDigitalEntry,
    onDeleteEntry,
    vrList = [],
}) {
    const [activePopover, setActivePopover] = useState('');
    const [filters, setFilters] = useState({ document: '', vr: '', mediums: [], statuses: [] });
    const [page, setPage] = useState(1);
    const [modalState, setModalState] = useState({ open: false, mode: 'history', group: null });
    const rows = useMemo(() => buildDocumentTableRows(entries), [entries]);
    const filteredRows = useMemo(() => filterDocumentTableRows(rows, filters), [rows, filters]);
    const summary = useMemo(() => getSummary(rows), [rows]);
    const vrOptions = useMemo(() => getAvailableVrOptions(rows), [rows]);
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
    const visibleRows = filteredRows.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
    const hasFilters = Boolean(filters.document || filters.vr || filters.mediums.length || filters.statuses.length);

    useEffect(() => {
        function handleOutsideClick(event) {
            const target = event.target;
            if (!target?.closest?.('[data-document-filter-popover="true"], [data-document-filter-button="true"]')) {
                setActivePopover('');
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const openModal = (group, mode) => setModalState({ open: true, group, mode });
    const closeModal = () => setModalState({ open: false, group: null, mode: 'history' });
    const resetFilters = () => setFilters({ document: '', vr: '', mediums: [], statuses: [] });
    const updateFilter = (key, value) => {
        setPage(1);
        setFilters((current) => ({ ...current, [key]: value }));
    };
    const toggleMedium = (medium) => setFilters((current) => {
        setPage(1);
        const exists = current.mediums.includes(medium);
        return {
            ...current,
            mediums: exists
                ? current.mediums.filter((value) => value !== medium)
            : [...current.mediums, medium],
        };
    });
    const toggleStatus = (status) => setFilters((current) => {
        setPage(1);
        const exists = current.statuses.includes(status);
        return {
            ...current,
            statuses: exists
                ? current.statuses.filter((value) => value !== status)
                : [...current.statuses, status],
        };
    });
    const toggleMediumKpi = (medium) => setFilters((current) => {
        setPage(1);
        const isOnlyActiveMedium = current.mediums.length === 1 && current.mediums[0] === medium && !current.document && !current.vr && !current.statuses.length;
        return isOnlyActiveMedium
            ? { document: '', vr: '', mediums: [], statuses: [] }
            : { document: '', vr: '', mediums: [medium], statuses: [] };
    });
    const toggleScannedKpi = () => setFilters((current) => {
        setPage(1);
        const isOnlyScanned = current.statuses.length === 1 && current.statuses[0] === 'scanned' && !current.document && !current.vr && !current.mediums.length;
        return isOnlyScanned
            ? { document: '', vr: '', mediums: [], statuses: [] }
            : { document: '', vr: '', mediums: [], statuses: ['scanned'] };
    });

    return <div className="space-y-3 rounded-xl border border-border/70 bg-background p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="mb-0 text-sm font-semibold text-foreground">Expediente documental unificado</p>
                <p className="mb-0 text-xs text-muted-foreground">Documento, VR reciente, medio, fecha, escaneo y folios calculados por backend.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg border border-border bg-muted/20 px-3 py-2" title="Tipos documentales visibles en la tabla">Documentos: <b>{summary.totalGroups}</b></span>
                <span className="rounded-lg border border-border bg-muted/20 px-3 py-2" title="Cantidad total de entradas o copias registradas">Entradas: <b>{summary.totalEntries}</b></span>
                <KpiFilterButton
                    className={DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.PHYSICAL].activeClassName}
                    title="Filtrar filas con entrada física de ventanilla"
                    active={filters.mediums.length === 1 && filters.mediums[0] === DOCUMENT_PREVIEW_MEDIUM.PHYSICAL && !filters.document && !filters.vr && !filters.statuses.length}
                    onClick={() => toggleMediumKpi(DOCUMENT_PREVIEW_MEDIUM.PHYSICAL)}
                >
                    Físicos: <b>{summary.physical}</b>
                </KpiFilterButton>
                <KpiFilterButton
                    className={DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.DIGITAL].activeClassName}
                    title="Filtrar filas con soporte digital"
                    active={filters.mediums.length === 1 && filters.mediums[0] === DOCUMENT_PREVIEW_MEDIUM.DIGITAL && !filters.document && !filters.vr && !filters.statuses.length}
                    onClick={() => toggleMediumKpi(DOCUMENT_PREVIEW_MEDIUM.DIGITAL)}
                >
                    Digitales: <b>{summary.digital}</b>
                </KpiFilterButton>
                <KpiFilterButton
                    className={DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.SCANNED].activeClassName}
                    title="Filtrar filas físicas que tienen archivo escaneado asociado por VR"
                    active={filters.statuses.length === 1 && filters.statuses[0] === 'scanned' && !filters.document && !filters.vr && !filters.mediums.length}
                    onClick={toggleScannedKpi}
                >
                    Escaneados: <b>{summary.scanned}</b>
                </KpiFilterButton>
                {canManage ? <Button type="button" size="sm" onClick={onAddDocument}>
                    <Icon name="plus" size={13} /> Añadir documento
                </Button> : null}
                {hasFilters ? <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                    <Icon name="times" size={12} /> Limpiar filtros
                </Button> : null}
            </div>
        </div>

        <div className="max-h-[calc(100vh-310px)] min-h-[260px] overflow-auto rounded-xl border border-border">
            <table className="min-w-[1280px] w-full table-fixed text-sm">
                <thead className="sticky top-0 z-10 bg-muted text-xs uppercase text-muted-foreground shadow-sm">
                    <tr>
                        <th className="relative w-[27%] px-3 py-2 text-left">
                            Documento
                            <FilterButton type="document" activeFilter={filters.document} activePopover={activePopover} setActivePopover={setActivePopover} />
                            {activePopover === 'document' ? <div data-document-filter-popover="true" className="absolute left-2 top-9 z-20 w-72 rounded-xl border border-border bg-background p-3 shadow-xl">
                                <div className="mb-1 text-[11px] font-semibold normal-case text-muted-foreground">Buscar por nombre o código</div>
                                <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm normal-case text-foreground" value={filters.document} onChange={(event) => updateFilter('document', event.target.value)} placeholder="Nombre o código" />
                            </div> : null}
                        </th>
                        <th className="relative w-[14%] px-3 py-2 text-left">
                            VR
                            <FilterButton type="vr" activeFilter={filters.vr} activePopover={activePopover} setActivePopover={setActivePopover} />
                            {activePopover === 'vr' ? <div data-document-filter-popover="true" className="absolute left-2 top-9 z-20 w-64 rounded-xl border border-border bg-background p-3 text-left normal-case shadow-xl">
                                <div className="mb-2 text-[11px] font-semibold text-muted-foreground">VR disponibles</div>
                                <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                                    {vrOptions.length ? vrOptions.map((option) => <button
                                        key={option.value}
                                        type="button"
                                        className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${filters.vr === option.value ? 'border-primary/40 bg-primary/10 text-primary' : 'border-transparent text-foreground hover:border-border hover:bg-muted/50'}`}
                                        onClick={() => updateFilter('vr', filters.vr === option.value ? '' : option.value)}
                                    >
                                        <span className={option.value === INTERNAL_REPORT_VR_FILTER ? 'font-semibold' : 'font-mono'}>{option.label}</span>
                                        <span className="text-[10px] text-muted-foreground">{option.count}</span>
                                    </button>) : <span className="block rounded-lg border border-border bg-muted/20 px-2.5 py-2 text-xs text-muted-foreground">Sin VR disponibles</span>}
                                </div>
                            </div> : null}
                        </th>
                        <th className="relative w-[12%] px-3 py-2 text-left">
                            Medio
                            <FilterButton type="mediums" activeFilter={filters.mediums} activePopover={activePopover} setActivePopover={setActivePopover} />
                            {activePopover === 'mediums' ? <div data-document-filter-popover="true" className="absolute right-2 top-9 z-20 w-56 rounded-xl border border-border bg-background p-3 text-left normal-case shadow-xl">
                                {[
                                    { value: DOCUMENT_PREVIEW_MEDIUM.PHYSICAL, label: 'Físico', meta: DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.PHYSICAL] },
                                    { value: DOCUMENT_PREVIEW_MEDIUM.DIGITAL, label: 'Digital', meta: DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.DIGITAL] },
                                ].map((option) => <label key={option.value} className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-foreground">
                                    <input type="checkbox" checked={filters.mediums.includes(option.value)} onChange={() => toggleMedium(option.value)} />
                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${option.meta.activeClassName}`}><Icon name={option.meta.icon} size={12} /> {option.label}</span>
                                </label>)}
                            </div> : null}
                        </th>
                        <th className="w-[14%] px-3 py-2 text-left">Fecha último documento</th>
                        <th className="relative w-[12%] px-3 py-2 text-left">
                            ¿Está escaneado?
                            <FilterButton type="statuses" activeFilter={filters.statuses} activePopover={activePopover} setActivePopover={setActivePopover} />
                            {activePopover === 'statuses' ? <div data-document-filter-popover="true" className="absolute right-2 top-9 z-20 w-64 rounded-xl border border-border bg-background p-3 text-left normal-case shadow-xl">
                                {SCANNED_STATUS_FILTERS.map((option) => <label key={option.value} className="mb-2 flex cursor-pointer items-start gap-2 text-sm text-foreground">
                                    <input className="mt-1" type="checkbox" checked={filters.statuses.includes(option.value)} onChange={() => toggleStatus(option.value)} />
                                    <span>
                                        <span className="block text-xs font-semibold">{option.label}</span>
                                        <span className="block text-[11px] leading-snug text-muted-foreground">{option.description}</span>
                                    </span>
                                </label>)}
                            </div> : null}
                        </th>
                        <th className="w-[16%] px-3 py-2 text-left" title="Folios digitales / folios físicos">Folios digitales / físicos</th>
                        <th className="w-[10%] px-3 py-2 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? <tr><td className="px-3 py-8 text-center text-muted-foreground" colSpan={7}>CARGANDO...</td></tr> : null}
                    {!loading && visibleRows.length === 0 ? <tr><td className="px-3 py-8 text-center text-muted-foreground" colSpan={7}>No hay documentos registrados</td></tr> : null}
                    {!loading && visibleRows.map((group) => <tr key={group.id} className="border-t border-border align-middle hover:bg-muted/30">
                        <td className="px-3 py-2">
                            <div className="font-medium leading-snug text-foreground" title={group.documentName}>{group.documentName}</div>
                            {group.documentCode ? <div className="text-xs font-mono text-muted-foreground">{group.documentCode}</div> : null}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs leading-snug" title={getDocumentVrDisplayValue(group.latestVr)}>{getDocumentVrDisplayValue(group.latestVr)}</td>
                        <td className="px-3 py-2"><MediumIconSet row={group} /></td>
                        <td className="px-3 py-2"><DateOnly value={group.latestDocumentDate} /></td>
                        <td className="px-3 py-2"><ScannedStatus row={group} /></td>
                        <td className="px-3 py-2"><FolioSplit row={group} /></td>
                        <td className="px-3 py-2">
                            <div className="flex justify-center gap-1">
                                <Button type="button" variant="ghost" size="sm" title="Consultar entradas históricas" aria-label="Consultar entradas históricas" onClick={() => openModal(group, 'history')}>
                                    <Icon name="search" size={13} />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" title="Editar entradas digitales" aria-label="Editar entradas digitales" onClick={() => openModal(group, 'edit')} disabled={!canManage || !group.entries.some((entry) => entry.canEdit)}>
                                    <Icon name="edit" size={13} />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" title="Ver evaluación documental" aria-label="Ver evaluación documental" onClick={() => openModal(group, 'evaluation')}>
                                    <Icon name="clipboard-check" size={13} />
                                </Button>
                            </div>
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Mostrando {visibleRows.length} de {filteredRows.length} documento(s)</span>
            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</Button>
                <span>Página {page} de {totalPages}</span>
                <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Siguiente</Button>
            </div>
        </div>

        <UnifiedDocumentEntryModal
            open={modalState.open}
            group={modalState.group}
            mode={modalState.mode}
            canManage={canManage}
            onClose={closeModal}
            onEditEntry={onEditEntry}
            onSaveDigitalEntry={onSaveDigitalEntry}
            onDeleteEntry={onDeleteEntry}
            vrList={vrList}
        />
    </div>;
}

export default UnifiedDocumentTable;
