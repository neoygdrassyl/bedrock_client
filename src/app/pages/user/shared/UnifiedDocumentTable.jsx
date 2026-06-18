import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import {
    DOCUMENT_ORIGIN_META,
    DOCUMENT_ORIGIN_STATE,
} from './expediente-documental.constants';
import {
    DOCUMENT_PREVIEW_MEDIUM,
    INTERNAL_REPORT_VR_FILTER,
    LEGAL_FORM_FILTER,
    buildDocumentTableRows,
    decorateDocumentTableRowsWithLegalForm,
    filterDocumentTableRows,
    getDocumentVrDisplayValue,
    isInternalReportVr,
    summarizeLegalFormRequirements,
} from './expediente-documental.utils';
import UnifiedDocumentEntryModal from './UnifiedDocumentEntryModal';

const ROWS_PER_PAGE = 12;
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

function LegalFormStatusPill({ children, className = '' }) {
    return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold leading-none ${className}`.trim()}>{children}</span>;
}

function Switch({ checked, onChange, label, id }) {
    return <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/30">
        <span className="relative inline-flex h-4 w-7 items-center">
            <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
            <span className="absolute inset-0 rounded-full bg-muted-foreground/40 transition-colors peer-checked:bg-primary" />
            <span className="absolute left-0.5 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-3" />
        </span>
        {label}
    </label>;
}

function HeaderFilterInput({ value, onChange, placeholder, className = '' }) {
    return <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${className}`.trim()}
    />;
}

function HeaderFilterSelect({ value, onChange, children, className = '' }) {
    return <select
        value={value}
        onChange={onChange}
        className={`h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-normal text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${className}`.trim()}
    >
        {children}
    </select>;
}

function getLegalFormToneClass(status = '') {
    if (status === LEGAL_FORM_FILTER.MISSING) return 'border-destructive/40 bg-destructive/10 text-foreground';
    if (status === LEGAL_FORM_FILTER.PENDING_SCAN) return 'border-warning/40 bg-warning/10 text-foreground';
    if (status === LEGAL_FORM_FILTER.PRESENT) return 'border-accent/40 bg-accent/10 text-foreground';
    return 'border-border bg-muted/30 text-muted-foreground';
}

function getLegalFormRowClass(status = '', isPreviewRow = false) {
    if (isPreviewRow && status === LEGAL_FORM_FILTER.MISSING) return 'bg-destructive/5';
    if (isPreviewRow && status === LEGAL_FORM_FILTER.PENDING_SCAN) return 'bg-warning/5';
    if (status === LEGAL_FORM_FILTER.PRESENT) return 'bg-accent/5';
    return '';
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
    legalFormResult = null,
    legalFormLoading = false,
    legalFormError = '',
}) {
    const legalSummary = useMemo(() => summarizeLegalFormRequirements(legalFormResult), [legalFormResult]);
    const hasLegalData = Boolean(legalFormLoading || legalFormError || legalSummary.source || legalSummary.totalRequired);
    const [legalMode, setLegalMode] = useState(hasLegalData);
    const [filters, setFilters] = useState({ document: '', vr: '', mediums: [], statuses: [], legalForm: LEGAL_FORM_FILTER.ALL });
    const [page, setPage] = useState(1);
    const [modalState, setModalState] = useState({ open: false, mode: 'history', group: null });
    const baseRows = useMemo(() => buildDocumentTableRows(entries), [entries]);
    const rows = useMemo(() => decorateDocumentTableRowsWithLegalForm(baseRows, legalFormResult), [baseRows, legalFormResult]);
    const filteredRows = useMemo(() => filterDocumentTableRows(rows, filters), [rows, filters]);
    const summary = useMemo(() => getSummary(rows), [rows]);
    const vrOptions = useMemo(() => getAvailableVrOptions(rows), [rows]);
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
    const visibleRows = filteredRows.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
    const hasFilters = Boolean(filters.document || filters.vr || filters.mediums.length || filters.statuses.length || filters.legalForm !== LEGAL_FORM_FILTER.ALL);

    const openModal = (group, mode) => setModalState({ open: true, group, mode });
    const closeModal = () => setModalState({ open: false, group: null, mode: 'history' });
    const resetFilters = () => setFilters({ document: '', vr: '', mediums: [], statuses: [], legalForm: LEGAL_FORM_FILTER.ALL });
    const updateFilter = (key, value) => {
        setPage(1);
        setFilters((current) => ({ ...current, [key]: value }));
    };
    const toggleLegalMode = (value) => {
        setLegalMode(value);
        setPage(1);
        if (!value) {
            setFilters((current) => ({ ...current, legalForm: LEGAL_FORM_FILTER.ALL }));
        }
    };
    const toggleMediumKpi = (medium) => setFilters((current) => {
        setPage(1);
        const isOnlyActiveMedium = current.mediums.length === 1 && current.mediums[0] === medium && !current.document && !current.vr && !current.statuses.length && current.legalForm === LEGAL_FORM_FILTER.ALL;
        return isOnlyActiveMedium
            ? { document: '', vr: '', mediums: [], statuses: [], legalForm: LEGAL_FORM_FILTER.ALL }
            : { document: '', vr: '', mediums: [medium], statuses: [], legalForm: LEGAL_FORM_FILTER.ALL };
    });
    const toggleScannedKpi = () => setFilters((current) => {
        setPage(1);
        const isOnlyScanned = current.statuses.length === 1 && current.statuses[0] === 'scanned' && !current.document && !current.vr && !current.mediums.length && current.legalForm === LEGAL_FORM_FILTER.ALL;
        return isOnlyScanned
            ? { document: '', vr: '', mediums: [], statuses: [], legalForm: LEGAL_FORM_FILTER.ALL }
            : { document: '', vr: '', mediums: [], statuses: ['scanned'], legalForm: LEGAL_FORM_FILTER.ALL };
    });
    const toggleLegalFormKpi = (status) => setFilters((current) => {
        setPage(1);
        return {
            ...current,
            legalForm: current.legalForm === status ? LEGAL_FORM_FILTER.ALL : status,
        };
    });

    return <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-1 flex-wrap items-center gap-2 text-xs">
                {legalMode && hasLegalData ? <>
                        <KpiFilterButton
                            className={getLegalFormToneClass(LEGAL_FORM_FILTER.PRESENT)}
                            title="Filtrar documentos presentes"
                            active={filters.legalForm === LEGAL_FORM_FILTER.PRESENT}
                            onClick={() => toggleLegalFormKpi(LEGAL_FORM_FILTER.PRESENT)}
                        >
                            Presentes <b>{legalSummary.present}</b>
                        </KpiFilterButton>
                        <KpiFilterButton
                            className={getLegalFormToneClass(LEGAL_FORM_FILTER.MISSING)}
                            title="Filtrar documentos faltantes"
                            active={filters.legalForm === LEGAL_FORM_FILTER.MISSING}
                            onClick={() => toggleLegalFormKpi(LEGAL_FORM_FILTER.MISSING)}
                        >
                            Faltantes <b>{legalSummary.missing}</b>
                        </KpiFilterButton>
                        <KpiFilterButton
                            className={getLegalFormToneClass(LEGAL_FORM_FILTER.PENDING_SCAN)}
                            title="Filtrar documentos pendientes de escaneo"
                            active={filters.legalForm === LEGAL_FORM_FILTER.PENDING_SCAN}
                            onClick={() => toggleLegalFormKpi(LEGAL_FORM_FILTER.PENDING_SCAN)}
                        >
                            Pendientes escaneo <b>{legalSummary.pendingScan}</b>
                        </KpiFilterButton>
                    </> : <>
                        <span className="rounded-lg border border-border bg-muted/20 px-3 py-2" title="Cantidad total de entradas registradas">Entradas: <b>{summary.totalEntries}</b></span>
                        <KpiFilterButton
                            className={DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.PHYSICAL].activeClassName}
                            title="Filtrar filas con entrada física de ventanilla"
                            active={filters.mediums.length === 1 && filters.mediums[0] === DOCUMENT_PREVIEW_MEDIUM.PHYSICAL && !filters.document && !filters.vr && !filters.statuses.length && filters.legalForm === LEGAL_FORM_FILTER.ALL}
                            onClick={() => toggleMediumKpi(DOCUMENT_PREVIEW_MEDIUM.PHYSICAL)}
                        >
                            Físicos: <b>{summary.physical}</b>
                        </KpiFilterButton>
                        <KpiFilterButton
                            className={DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.DIGITAL].activeClassName}
                            title="Filtrar filas con soporte digital"
                            active={filters.mediums.length === 1 && filters.mediums[0] === DOCUMENT_PREVIEW_MEDIUM.DIGITAL && !filters.document && !filters.vr && !filters.statuses.length && filters.legalForm === LEGAL_FORM_FILTER.ALL}
                            onClick={() => toggleMediumKpi(DOCUMENT_PREVIEW_MEDIUM.DIGITAL)}
                        >
                            Digitales: <b>{summary.digital}</b>
                        </KpiFilterButton>
                        <KpiFilterButton
                            className={DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.SCANNED].activeClassName}
                            title="Filtrar filas físicas que tienen archivo escaneado asociado por VR"
                            active={filters.statuses.length === 1 && filters.statuses[0] === 'scanned' && !filters.document && !filters.vr && !filters.mediums.length && filters.legalForm === LEGAL_FORM_FILTER.ALL}
                            onClick={toggleScannedKpi}
                        >
                            Escaneados: <b>{summary.scanned}</b>
                        </KpiFilterButton>
                    </>}
                    {canManage ? <Button type="button" size="sm" onClick={onAddDocument}>
                        <Icon name="plus" size={13} /> Añadir
                    </Button> : null}
            </div>
            {hasLegalData ? <Switch
                id="legal-mode-switch"
                checked={legalMode}
                onChange={toggleLegalMode}
                label="Modo evaluación legal y debida forma"
            /> : null}
        </div>

        {legalMode && hasLegalData ? <div className="space-y-2">
            {legalFormLoading ? <div className="rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                Consultando Legal y Debida Forma...
            </div> : null}
            {legalFormError ? <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground" role="alert">{legalFormError}</div> : null}
            {legalSummary.showSourceWarning && legalSummary.sourceMessage ? <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground" role="alert">{legalSummary.sourceMessage}</div> : null}
            {!legalFormLoading ? <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {legalSummary.source ? <LegalFormStatusPill className="border-primary/30 bg-primary/10 text-primary">{legalSummary.sourceLabel}</LegalFormStatusPill> : null}
                {legalFormResult?.snapshotId ? <LegalFormStatusPill className="border-border bg-background text-foreground">snapshotId: {legalFormResult.snapshotId}</LegalFormStatusPill> : null}
                {legalFormResult?.configVersionId ? <LegalFormStatusPill className="border-border bg-background text-foreground">configVersionId: {legalFormResult.configVersionId}</LegalFormStatusPill> : null}
            </div> : null}
        </div> : null}

        <div className="max-h-[calc(100vh-280px)] min-h-[260px] overflow-auto rounded-xl border border-border">
            <table className="min-w-[1180px] w-full table-fixed text-sm">
                <thead className="sticky top-0 z-10 bg-muted shadow-sm">
                    <tr className="text-muted-foreground">
                        <th className="w-[27%] px-3 py-2 text-left align-top">
                            <div className="space-y-1">
                                <div className="text-[11px] font-semibold uppercase tracking-wide">Documento</div>
                                <div className="relative">
                                    <Icon name="search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <HeaderFilterInput
                                        value={filters.document}
                                        onChange={(event) => updateFilter('document', event.target.value)}
                                        placeholder="Buscar..."
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                        </th>
                        <th className="w-[14%] px-3 py-2 text-left align-top">
                            <div className="space-y-1">
                                <div className="text-[11px] font-semibold uppercase tracking-wide">VR</div>
                                <HeaderFilterSelect value={filters.vr} onChange={(event) => updateFilter('vr', event.target.value)}>
                                    <option value="">Todos</option>
                                    {vrOptions.map((option) => <option key={option.value} value={option.value}>{option.label} ({option.count})</option>)}
                                </HeaderFilterSelect>
                            </div>
                        </th>
                        <th className="w-[12%] px-3 py-2 text-left align-top">
                            <div className="space-y-1">
                                <div className="text-[11px] font-semibold uppercase tracking-wide">Medio</div>
                                <HeaderFilterSelect value={filters.mediums.length === 1 ? filters.mediums[0] : ''} onChange={(event) => updateFilter('mediums', event.target.value ? [event.target.value] : [])}>
                                    <option value="">Todos</option>
                                    <option value={DOCUMENT_PREVIEW_MEDIUM.PHYSICAL}>Físico</option>
                                    <option value={DOCUMENT_PREVIEW_MEDIUM.DIGITAL}>Digital</option>
                                </HeaderFilterSelect>
                            </div>
                        </th>
                        <th className="w-[14%] px-3 py-2 text-left align-top">
                            <div className="text-[11px] font-semibold uppercase tracking-wide">Fecha último documento</div>
                        </th>
                        <th className="w-[12%] px-3 py-2 text-left align-top">
                            <div className="space-y-1">
                                <div className="text-[11px] font-semibold uppercase tracking-wide">¿Está escaneado?</div>
                                <HeaderFilterSelect value={filters.statuses.length === 1 ? filters.statuses[0] : ''} onChange={(event) => updateFilter('statuses', event.target.value ? [event.target.value] : [])}>
                                    <option value="">Todos</option>
                                    {SCANNED_STATUS_FILTERS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </HeaderFilterSelect>
                            </div>
                        </th>
                        <th className="w-[16%] px-3 py-2 text-left align-top" title="Folios digitales / folios físicos">
                            <div className="text-[11px] font-semibold uppercase tracking-wide">Folios digitales / físicos</div>
                        </th>
                        <th className="w-[10%] px-3 py-2 text-center align-top">
                            <div className="space-y-1">
                                <div className="text-[11px] font-semibold uppercase tracking-wide">Acciones</div>
                                {hasFilters ? <Button type="button" variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
                                    <Icon name="x" size={12} /> Limpiar
                                </Button> : <span className="inline-block h-8" aria-hidden="true" />}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? <tr><td className="px-3 py-8 text-center text-muted-foreground" colSpan={7}>CARGANDO...</td></tr> : null}
                    {!loading && visibleRows.length === 0 ? <tr><td className="px-3 py-8 text-center text-muted-foreground" colSpan={7}>No hay documentos registrados</td></tr> : null}
                    {!loading && visibleRows.map((group) => <tr key={group.id} className={`border-t border-border align-middle hover:bg-muted/30 ${getLegalFormRowClass(group.legalForm?.status, group.isPreviewRow)}`.trim()}>
                        <td className="px-3 py-2">
                            <div className="font-medium leading-snug text-foreground" title={group.documentName}>{group.documentName}</div>
                            {group.documentCode ? <div className="text-xs font-mono text-muted-foreground">{group.documentCode}</div> : null}
                            {group.legalForm ? <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <LegalFormStatusPill className={getLegalFormToneClass(group.legalForm.status)}>{group.legalForm.statusLabel}</LegalFormStatusPill>
                                <LegalFormStatusPill className="border-border bg-background text-foreground">{group.legalForm.sourceLabel}</LegalFormStatusPill>
                                {group.isPreviewRow ? <LegalFormStatusPill className="border-border bg-muted/40 text-muted-foreground">Fila sintética</LegalFormStatusPill> : null}
                            </div> : null}
                            {group.legalForm?.statusReason ? <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{group.legalForm.statusReason}</div> : null}
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
