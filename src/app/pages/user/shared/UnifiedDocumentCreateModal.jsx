import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { Input } from '@/components/ui/input';
import ListJson from '@/app/components/jsons/fun6DocsList.json';
import {
    DOCUMENT_ORIGIN_LABEL,
    DOCUMENT_ORIGIN_STATE,
    DOCUMENT_RECEPTION_MEDIUM_OPTIONS,
} from './expediente-documental.constants';

function buildDocumentOptions() {
    return Object.entries(ListJson).map(([code, name]) => ({ code, name }));
}

function createRow(source = 'manual', base = {}) {
    const rowId = `${source}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return {
        id: rowId,
        selected: source === 'manual',
        source,
        documentCode: base.documentCode || base.code || '',
        documentName: base.documentName || base.name || '',
        vr: base.vr || '',
        pages: base.pages || base.page || '',
        date: base.date || '',
        originState: base.originState || DOCUMENT_ORIGIN_STATE.SCANNED,
        receptionMedium: base.receptionMedium || '',
        file: null,
    };
}

function DocsComboboxInline({ rowId, code, name, onSelect }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const documentOptions = useMemo(() => buildDocumentOptions(), []);
    const normalizedSearch = search.trim().toLowerCase();
    const filteredOptions = useMemo(() => {
        if (!normalizedSearch) return documentOptions.slice(0, 60);
        return documentOptions
            .filter((option) => option.code.toLowerCase().includes(normalizedSearch) || option.name.toLowerCase().includes(normalizedSearch))
            .slice(0, 80);
    }, [documentOptions, normalizedSearch]);

    const displayValue = [code, name].filter(Boolean).join(' · ');

    return <div className="relative min-w-[300px]">
        <button
            type="button"
            className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => setOpen((current) => !current)}
            title={displayValue || 'Seleccionar documento'}
        >
            <span className="line-clamp-2 leading-snug">{displayValue || 'Seleccionar documento'}</span>
            <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} className="shrink-0 text-muted-foreground" />
        </button>
        {open ? <div className="absolute left-0 top-[calc(100%+4px)] z-40 w-[min(720px,70vw)] rounded-xl border border-border bg-background p-2 shadow-2xl">
            <div className="relative mb-2">
                <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por código o nombre"
                    className="pl-9 text-sm"
                    autoFocus
                />
            </div>
            <div className="max-h-72 overflow-auto rounded-lg border border-border">
                {filteredOptions.length ? filteredOptions.map((option) => <button
                    key={`${rowId}-${option.code}`}
                    type="button"
                    className="flex w-full gap-3 border-b border-border/70 px-3 py-2 text-left text-xs last:border-b-0 hover:bg-muted/50 focus:bg-muted/60 focus:outline-none"
                    onClick={() => {
                        onSelect(option);
                        setSearch('');
                        setOpen(false);
                    }}
                    title={`${option.code} · ${option.name}`}
                >
                    <span className="w-16 shrink-0 font-mono text-muted-foreground">{option.code}</span>
                    <span className="min-w-0 whitespace-normal leading-snug text-foreground">{option.name}</span>
                </button>) : <div className="px-3 py-8 text-center text-xs text-muted-foreground">No hay documentos para esa búsqueda</div>}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{filteredOptions.length} resultado(s) visibles</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cerrar</Button>
            </div>
        </div> : null}
    </div>;
}

function groupPendingDocuments(pendingPhysicalDocs = []) {
    const groups = new Map();

    pendingPhysicalDocs.forEach((entry) => {
        const key = entry.documentCode || entry.documentName || entry.entryId;
        const currentGroup = groups.get(key) || {
            key,
            documentCode: entry.documentCode || '',
            documentName: entry.documentName || 'Documento sin nombre',
            vrs: [],
            entries: [],
        };

        if (entry.vr && !currentGroup.vrs.includes(entry.vr)) {
            currentGroup.vrs.push(entry.vr);
        }

        currentGroup.entries.push(entry);
        groups.set(key, currentGroup);
    });

    return Array.from(groups.values()).sort((firstGroup, secondGroup) => firstGroup.documentName.localeCompare(secondGroup.documentName));
}

function UnifiedDocumentCreateModal({
    open,
    onClose,
    currentItem,
    currentId,
    vrList = [],
    ventanillaDocs = [],
    pendingPhysicalDocs = [],
    pendingLoading = false,
    saving = false,
    onSave,
}) {
    const [rows, setRows] = useState([createRow('manual')]);
    const [selectedVrValues, setSelectedVrValues] = useState([]);
    const pendingGroups = useMemo(() => groupPendingDocuments(pendingPhysicalDocs), [pendingPhysicalDocs]);
    const selectedCount = rows.filter((row) => row.selected).length;

    useEffect(() => {
        if (open) {
            setRows([createRow('manual')]);
            setSelectedVrValues([]);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const updateRow = (rowId, patch) => {
        setRows((currentRows) => currentRows.map((row) => {
            if (row.id !== rowId) return row;
            const nextRow = { ...row, ...patch };
            if (patch.originState && patch.originState !== DOCUMENT_ORIGIN_STATE.DIGITAL) {
                nextRow.receptionMedium = '';
            }
            return nextRow;
        }));
    };

    const removeRow = (rowId) => {
        setRows((currentRows) => currentRows.length <= 1 ? currentRows : currentRows.filter((row) => row.id !== rowId));
    };

    const toggleVr = (vr) => {
        setSelectedVrValues((currentValues) => currentValues.includes(vr)
            ? currentValues.filter((value) => value !== vr)
            : [...currentValues, vr]);
    };

    const addRowsFromVr = () => {
        if (!selectedVrValues.length) return;
        const vrRows = ventanillaDocs
            .filter((entry) => selectedVrValues.includes(entry.id_public || entry.vr))
            .map((entry) => createRow('vr', {
                documentCode: entry.code || entry.documentCode,
                documentName: entry.name || entry.documentName,
                vr: entry.id_public || entry.vr,
                pages: '',
                date: '',
                originState: DOCUMENT_ORIGIN_STATE.SCANNED,
            }));

        if (!vrRows.length) return;
        setRows((currentRows) => [...currentRows, ...vrRows]);
    };

    const saveRows = () => {
        const selectedRows = rows.filter((row) => row.selected);
        if (!selectedRows.length) return;
        onSave?.(selectedRows);
    };

    return <div className="fixed inset-0 z-[1065] flex items-center justify-center bg-black/50 px-4 py-5" role="dialog" aria-modal="true">
        <div className="flex max-h-[90dvh] w-[min(92vw,1680px)] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
                <div>
                    <p className="mb-0 text-base font-semibold text-foreground">Crear entrada de documentos</p>
                    <p className="mb-0 text-xs text-muted-foreground">{currentItem?.id_public || currentId || 'Expediente'} · filas seleccionadas: {selectedCount}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar creación documental" disabled={saving}>
                    <Icon name="times" size={14} />
                </Button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
                <section className="min-h-0 overflow-auto border-r border-border p-3">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="mb-0 text-sm font-semibold text-foreground">Documentos a cargar</p>
                            <p className="mb-0 text-xs text-muted-foreground">Las filas manuales se guardan por defecto; las importadas desde VR quedan sin marcar.</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => setRows((currentRows) => [...currentRows, createRow('manual')])}>
                            <Icon name="plus" size={14} /> Agregar fila
                        </Button>
                    </div>

                    <div className="overflow-auto rounded-xl border border-border">
                        <table className="w-full min-w-[1180px] text-sm">
                            <thead className="sticky top-0 z-20 bg-muted text-xs uppercase text-muted-foreground shadow-sm">
                                <tr>
                                    <th className="w-12 px-2 py-2 text-center">Guardar</th>
                                    <th className="w-[34%] px-2 py-2 text-left">Nombre</th>
                                    <th className="w-28 px-2 py-2 text-left">VR</th>
                                    <th className="w-24 px-2 py-2 text-left">Folios</th>
                                    <th className="w-36 px-2 py-2 text-left">Fecha</th>
                                    <th className="w-44 px-2 py-2 text-left">Origen</th>
                                    <th className="w-44 px-2 py-2 text-left">Medio de recepción</th>
                                    <th className="w-56 px-2 py-2 text-left">Archivo</th>
                                    <th className="w-12 px-2 py-2 text-center">Quitar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => {
                                    const isDigitalReception = row.originState === DOCUMENT_ORIGIN_STATE.DIGITAL;
                                    return <tr key={row.id} className="border-t border-border align-top hover:bg-muted/30">
                                        <td className="px-2 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={row.selected}
                                                onChange={(event) => updateRow(row.id, { selected: event.target.checked })}
                                                aria-label="Guardar fila"
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <DocsComboboxInline
                                                rowId={row.id}
                                                code={row.documentCode}
                                                name={row.documentName}
                                                onSelect={(option) => updateRow(row.id, { documentCode: option.code, documentName: option.name })}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <Input value={row.vr} onChange={(event) => updateRow(row.id, { vr: event.target.value })} className="h-10 text-xs" placeholder="VR" />
                                        </td>
                                        <td className="px-2 py-2">
                                            <Input value={row.pages} onChange={(event) => updateRow(row.id, { pages: event.target.value })} className="h-10 text-xs" type="number" min="0" placeholder="0" />
                                        </td>
                                        <td className="px-2 py-2">
                                            <Input value={row.date} onChange={(event) => updateRow(row.id, { date: event.target.value })} className="h-10 text-xs" type="date" />
                                        </td>
                                        <td className="px-2 py-2">
                                            <select className="h-10 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground" value={row.originState} onChange={(event) => updateRow(row.id, { originState: event.target.value })}>
                                                <option value={DOCUMENT_ORIGIN_STATE.SCANNED}>Digitalizar documento</option>
                                                <option value={DOCUMENT_ORIGIN_STATE.DIGITAL}>Enviado por medio digital</option>
                                            </select>
                                        </td>
                                        <td className="px-2 py-2">
                                            <select
                                                className="h-10 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                value={row.receptionMedium}
                                                onChange={(event) => updateRow(row.id, { receptionMedium: event.target.value })}
                                                disabled={!isDigitalReception}
                                            >
                                                <option value="">Sin registrar</option>
                                                {DOCUMENT_RECEPTION_MEDIUM_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,application/pdf"
                                                className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-2 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
                                                onChange={(event) => updateRow(row.id, { file: event.target.files?.[0] || null })}
                                            />
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(row.id)} disabled={rows.length <= 1} aria-label="Quitar fila">
                                                <Icon name="trash" size={13} />
                                            </Button>
                                        </td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={() => setRows((currentRows) => [...currentRows, createRow('manual')])}>
                            <Icon name="plus" size={14} /> Agregar fila
                        </Button>
                    </div>
                </section>

                <aside className="min-h-0 overflow-auto bg-muted/20 p-3">
                    <div className="mb-4 rounded-xl border border-border bg-background p-3">
                        <p className="mb-2 text-sm font-semibold text-foreground">Cargar desde VR</p>
                        <div className="mb-3 max-h-40 overflow-auto rounded-lg border border-border p-2">
                            {vrList.length ? vrList.map((vr) => <label key={vr} className="mb-1 flex cursor-pointer items-center gap-2 text-xs text-foreground">
                                <input type="checkbox" checked={selectedVrValues.includes(vr)} onChange={() => toggleVr(vr)} />
                                <span className="font-mono">{vr}</span>
                            </label>) : <p className="mb-0 px-2 py-4 text-center text-xs text-muted-foreground">No hay VR asociados</p>}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={addRowsFromVr} disabled={!selectedVrValues.length}>
                            <Icon name="download" size={14} /> Cargar documentos de VR
                        </Button>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="mb-0 text-sm font-semibold text-foreground">Pendientes físicos</p>
                            <span className="rounded-full border border-warning/30 bg-warning/15 px-2 py-1 text-[11px] font-semibold text-warning">{pendingGroups.length}</span>
                        </div>
                        {pendingLoading ? <p className="mb-0 px-2 py-4 text-center text-xs text-muted-foreground">Cargando pendientes...</p> : null}
                        {!pendingLoading && !pendingGroups.length ? <p className="mb-0 px-2 py-4 text-center text-xs text-muted-foreground">No hay documentos físicos pendientes por digitalizar</p> : null}
                        <div className="space-y-2">
                            {!pendingLoading && pendingGroups.map((group) => <div key={group.key} className="rounded-lg border border-border bg-muted/20 p-2">
                                <p className="mb-1 line-clamp-3 text-xs font-semibold text-foreground" title={group.documentName}>{group.documentName}</p>
                                {group.documentCode ? <p className="mb-2 font-mono text-[11px] text-muted-foreground">{group.documentCode}</p> : null}
                                <div className="flex flex-wrap gap-1">
                                    {group.vrs.map((vr) => <span key={vr} className="rounded-full border border-border bg-background px-2 py-1 text-[10px] font-mono text-muted-foreground">{vr}</span>)}
                                </div>
                            </div>)}
                        </div>
                    </div>
                </aside>
            </div>

            <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>{selectedCount} fila(s) marcada(s) para guardar · Origen por defecto: {DOCUMENT_ORIGIN_LABEL[DOCUMENT_ORIGIN_STATE.SCANNED]}</span>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button type="button" size="sm" onClick={saveRows} disabled={saving || !selectedCount}>
                        <Icon name={saving ? 'loader' : 'save'} size={14} /> {saving ? 'Guardando...' : 'Guardar seleccionados'}
                    </Button>
                </div>
            </div>
        </div>
    </div>;
}

export default UnifiedDocumentCreateModal;
