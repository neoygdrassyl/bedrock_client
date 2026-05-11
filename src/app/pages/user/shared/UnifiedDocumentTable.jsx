import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import {
    DOCUMENT_ORIGIN_META,
    DOCUMENT_ORIGIN_ORDER,
    DOCUMENT_ORIGIN_STATE,
} from './expediente-documental.constants';
import { filterDocumentEntryGroups, groupDocumentEntries } from './expediente-documental.utils';
import UnifiedDocumentEntryModal from './UnifiedDocumentEntryModal';

const ROWS_PER_PAGE = 12;
const FILTER_LABEL = {
    document: 'Documento',
    vr: 'VR',
    origins: 'Origen',
};

function getSummary(groups) {
    return groups.reduce((summary, group) => {
        const nextSummary = {
            ...summary,
            totalGroups: summary.totalGroups + 1,
            totalEntries: summary.totalEntries + group.entryCount,
        };

        DOCUMENT_ORIGIN_ORDER.forEach((originState) => {
            if (group.originPresence?.[originState]) {
                nextSummary.origins[originState] += 1;
            }
        });

        return nextSummary;
    }, {
        totalGroups: 0,
        totalEntries: 0,
        origins: DOCUMENT_ORIGIN_ORDER.reduce((origins, originState) => ({ ...origins, [originState]: 0 }), {}),
    });
}

function FilterButton({ type, activeFilter, activePopover, setActivePopover }) {
    const isOpen = activePopover === type;
    const active = type === 'origins' ? activeFilter?.length : Boolean(activeFilter);

    return <button
        type="button"
        className={`ml-1 rounded border px-1.5 py-0.5 text-[10px] transition-colors ${active ? 'border-primary/30 bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}`}
        onClick={(event) => {
            event.stopPropagation();
            setActivePopover(isOpen ? '' : type);
        }}
        title={`Filtrar por ${FILTER_LABEL[type]}`}
    >
        <Icon name={active ? 'filter' : 'chevron-down'} size={10} />
    </button>;
}

function OriginIconSet({ group }) {
    return <div className="flex items-center justify-center gap-1" title="Origen documental disponible para este tipo documental">
        {DOCUMENT_ORIGIN_ORDER.map((originState) => {
            const meta = DOCUMENT_ORIGIN_META[originState];
            const active = Boolean(group.originPresence?.[originState]);

            return <span
                key={originState}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${active ? meta.activeClassName : meta.inactiveClassName}`}
                title={`${meta.label}: ${active ? meta.tooltip : 'No hay entrada registrada con este origen.'}`}
            >
                <Icon name={meta.icon} size={13} />
            </span>;
        })}
    </div>;
}

function UnifiedDocumentTable({
    entries = [],
    loading = false,
    canManage = false,
    onAddDocument,
    onEditEntry,
    onDeleteEntry,
}) {
    const wrapperRef = useRef(null);
    const [activePopover, setActivePopover] = useState('');
    const [filters, setFilters] = useState({ document: '', vr: '', origins: [] });
    const [page, setPage] = useState(1);
    const [modalState, setModalState] = useState({ open: false, mode: 'history', group: null });
    const groups = useMemo(() => groupDocumentEntries(entries), [entries]);
    const filteredGroups = useMemo(() => filterDocumentEntryGroups(groups, filters), [groups, filters]);
    const summary = useMemo(() => getSummary(groups), [groups]);
    const totalPages = Math.max(1, Math.ceil(filteredGroups.length / ROWS_PER_PAGE));
    const visibleGroups = filteredGroups.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
    const hasFilters = Boolean(filters.document || filters.vr || filters.origins.length);

    useEffect(() => {
        setPage(1);
    }, [filters.document, filters.vr, filters.origins]);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setActivePopover('');
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const openModal = (group, mode) => setModalState({ open: true, group, mode });
    const closeModal = () => setModalState({ open: false, group: null, mode: 'history' });
    const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
    const toggleOrigin = (originState) => setFilters((current) => {
        const exists = current.origins.includes(originState);
        return {
            ...current,
            origins: exists
                ? current.origins.filter((value) => value !== originState)
                : [...current.origins, originState],
        };
    });

    return <div ref={wrapperRef} className="space-y-3 rounded-xl border border-border/70 bg-background p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="mb-0 text-sm font-semibold text-foreground">Expediente documental unificado</p>
                <p className="mb-0 text-xs text-muted-foreground">Documento, VR reciente, origen, copias y acciones sobre entradas históricas.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg border border-border bg-muted/20 px-3 py-2" title="Tipos documentales visibles en la tabla">Documentos: <b>{summary.totalGroups}</b></span>
                <span className="rounded-lg border border-border bg-muted/20 px-3 py-2" title="Cantidad total de entradas o copias registradas">Entradas: <b>{summary.totalEntries}</b></span>
                {DOCUMENT_ORIGIN_ORDER.map((originState) => {
                    const meta = DOCUMENT_ORIGIN_META[originState];
                    return <span key={originState} className={`rounded-lg border px-3 py-2 ${meta.activeClassName}`} title={meta.tooltip}>{meta.label}: <b>{summary.origins[originState]}</b></span>;
                })}
                {canManage ? <Button type="button" size="sm" onClick={onAddDocument}>
                    <Icon name="plus" size={13} /> Añadir documento
                </Button> : null}
                {hasFilters ? <Button type="button" variant="outline" size="sm" onClick={() => setFilters({ document: '', vr: '', origins: [] })}>
                    <Icon name="times" size={12} /> Limpiar filtros
                </Button> : null}
            </div>
        </div>

        <div className="max-h-[calc(100vh-310px)] min-h-[260px] overflow-auto rounded-xl border border-border">
            <table className="w-full table-fixed text-sm">
                <thead className="sticky top-0 z-10 bg-muted text-xs uppercase text-muted-foreground shadow-sm">
                    <tr>
                        <th className="relative w-[42%] px-3 py-2 text-left">
                            Documento
                            <FilterButton type="document" activeFilter={filters.document} activePopover={activePopover} setActivePopover={setActivePopover} />
                            {activePopover === 'document' ? <div className="absolute left-2 top-9 z-20 w-72 rounded-xl border border-border bg-background p-3 shadow-xl">
                                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm normal-case" value={filters.document} onChange={(event) => updateFilter('document', event.target.value)} placeholder="Nombre o código" autoFocus />
                            </div> : null}
                        </th>
                        <th className="relative w-[16%] px-3 py-2 text-left">
                            VR
                            <FilterButton type="vr" activeFilter={filters.vr} activePopover={activePopover} setActivePopover={setActivePopover} />
                            {activePopover === 'vr' ? <div className="absolute left-2 top-9 z-20 w-56 rounded-xl border border-border bg-background p-3 shadow-xl">
                                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm normal-case" value={filters.vr} onChange={(event) => updateFilter('vr', event.target.value)} placeholder="Filtrar VR" autoFocus />
                            </div> : null}
                        </th>
                        <th className="relative w-[16%] px-3 py-2 text-center">
                            Origen
                            <FilterButton type="origins" activeFilter={filters.origins} activePopover={activePopover} setActivePopover={setActivePopover} />
                            {activePopover === 'origins' ? <div className="absolute right-2 top-9 z-20 w-64 rounded-xl border border-border bg-background p-3 text-left normal-case shadow-xl">
                                {DOCUMENT_ORIGIN_ORDER.map((originState) => {
                                    const meta = DOCUMENT_ORIGIN_META[originState];
                                    return <label key={originState} className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-foreground">
                                        <input type="checkbox" checked={filters.origins.includes(originState)} onChange={() => toggleOrigin(originState)} />
                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${meta.activeClassName}`}><Icon name={meta.icon} size={12} /> {meta.label}</span>
                                    </label>;
                                })}
                            </div> : null}
                        </th>
                        <th className="w-[10%] px-3 py-2 text-center" title="Cantidad de entradas o copias disponibles para este documento">Copias</th>
                        <th className="w-[16%] px-3 py-2 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? <tr><td className="px-3 py-8 text-center text-muted-foreground" colSpan={5}>CARGANDO...</td></tr> : null}
                    {!loading && visibleGroups.length === 0 ? <tr><td className="px-3 py-8 text-center text-muted-foreground" colSpan={5}>No hay documentos registrados</td></tr> : null}
                    {!loading && visibleGroups.map((group) => <tr key={group.id} className="border-t border-border align-middle hover:bg-muted/30">
                        <td className="px-3 py-2">
                            <div className="font-medium leading-snug text-foreground" title={group.documentName}>{group.documentName}</div>
                            {group.documentCode ? <div className="text-xs font-mono text-muted-foreground">{group.documentCode}</div> : null}
                        </td>
                        <td className="truncate px-3 py-2 font-mono text-xs" title={group.latestVr || 'Sin VR'}>{group.latestVr || 'Sin VR'}</td>
                        <td className="px-3 py-2"><OriginIconSet group={group} /></td>
                        <td className="px-3 py-2 text-center font-mono" title="Cantidad de entradas o copias disponibles para este documento">{group.entryCount}</td>
                        <td className="px-3 py-2">
                            <div className="flex justify-center gap-1">
                                <Button type="button" variant="ghost" size="sm" title="Consultar entradas históricas" onClick={() => openModal(group, 'history')}>
                                    <Icon name="search" size={13} />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" title="Editar entradas digitales" onClick={() => openModal(group, 'edit')} disabled={!canManage || !group.entries.some((entry) => entry.canEdit)}>
                                    <Icon name="edit" size={13} />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" title="Ver evaluación documental" onClick={() => openModal(group, 'evaluation')}>
                                    <Icon name="clipboard-check" size={13} />
                                </Button>
                            </div>
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Mostrando {visibleGroups.length} de {filteredGroups.length} documento(s)</span>
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
            onDeleteEntry={onDeleteEntry}
        />
    </div>;
}

export default UnifiedDocumentTable;
