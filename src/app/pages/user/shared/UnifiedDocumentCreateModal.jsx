import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dayjs from 'dayjs';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ListJson from '@/app/components/jsons/fun6DocsList.json';
import {
    DOCUMENT_ORIGIN_LABEL,
    DOCUMENT_ORIGIN_STATE,
    DOCUMENT_RECEPTION_MEDIUM_OPTIONS,
} from './expediente-documental.constants';

const ACCEPTED_DOCUMENT_FILE_TYPES = new Set(['image/png', 'image/jpeg', 'application/pdf']);
const ACCEPTED_DOCUMENT_FILE_LABEL = 'PDF, JPG o PNG';
const STICKY_SELECT_COLUMN_CLASS = 'sticky left-0 z-20 w-[84px] min-w-[84px] bg-background shadow-[1px_0_0_hsl(var(--border))]';
const STICKY_NAME_COLUMN_CLASS = 'sticky left-[84px] z-10 w-[380px] min-w-[380px] bg-background shadow-[1px_0_0_hsl(var(--border))]';
const STICKY_VR_COLUMN_CLASS = 'sticky left-[464px] z-10 w-[240px] min-w-[240px] bg-background shadow-[1px_0_0_hsl(var(--border))]';
const DOCUMENT_SELECTOR_POPOVER_Z_INDEX = 10050;

function normalizeFileList(fileList) {
    return Array.from(fileList || []);
}

function fileKey(file) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

function mergeFiles(currentFiles = [], incomingFiles = []) {
    const filesByKey = new Map();
    currentFiles.forEach((file) => {
        filesByKey.set(fileKey(file), file);
    });
    incomingFiles.forEach((file) => {
        filesByKey.set(fileKey(file), file);
    });
    return Array.from(filesByKey.values());
}

function formatFileSize(size = 0) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function hasDraggedFiles(event) {
    return Array.from(event.dataTransfer?.types || []).includes('Files');
}

function isPdfFile(file) {
    return file?.type === 'application/pdf' || String(file?.name || '').toLowerCase().endsWith('.pdf');
}

function isImageFile(file) {
    return ['image/png', 'image/jpeg'].includes(file?.type)
        || /\.(png|jpe?g)$/i.test(String(file?.name || ''));
}

async function countFilePages(file) {
    if (!file) return '';

    if (isImageFile(file)) {
        return 1;
    }

    if (!isPdfFile(file)) {
        return '';
    }

    const buffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer);
    return pdfDoc.getPages().length;
}

async function buildFilePageCounts(files = []) {
    const entries = await Promise.all(files.map(async (file) => {
        try {
            return [fileKey(file), await countFilePages(file)];
        } catch (error) {
            console.warn('No fue posible contar los folios del archivo.', file?.name, error);
            return [fileKey(file), ''];
        }
    }));

    return Object.fromEntries(entries);
}

function getFilesPageTotal(files = [], pageCounts = {}) {
    const values = files
        .map((file) => Number(pageCounts[fileKey(file)]))
        .filter((value) => Number.isFinite(value) && value > 0);

    if (!values.length) return '';
    return String(values.reduce((total, value) => total + value, 0));
}

function getFilePreviewKind(file) {
    if (isPdfFile(file)) return 'pdf';
    if (isImageFile(file)) return 'image';
    return '';
}

function buildDocumentOptions() {
    return Object.entries(ListJson).map(([code, name]) => ({ code, name }));
}

function createRow(source = 'manual', base = {}) {
    const rowId = `${source}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const hasDate = Object.prototype.hasOwnProperty.call(base, 'date');
    return {
        id: rowId,
        selected: typeof base.selected === 'boolean' ? base.selected : source === 'manual' || source === 'pendingPhysical',
        source,
        pendingEntryId: base.pendingEntryId || '',
        documentCode: base.documentCode || base.code || '',
        documentName: base.documentName || base.name || '',
        vr: base.vr || '',
        pages: base.pages ?? base.page ?? '',
        date: hasDate ? (base.date || '') : dayjs().format('YYYY-MM-DD'),
        originState: base.originState || DOCUMENT_ORIGIN_STATE.SCANNED,
        receptionMedium: base.receptionMedium || '',
        file: null,
        files: [],
        filePageCounts: {},
        filePagesLoading: false,
        fileError: '',
    };
}

function getPendingEntryKey(entry = {}) {
    return String(entry.entryId || entry.sourceId || [
        entry.documentCode || entry.code || '',
        entry.documentName || entry.name || '',
        entry.vr || entry.id_public || '',
        entry.date || '',
        entry.pages ?? entry.page ?? '',
    ].join('|'));
}

function buildPendingPhysicalRow(entry = {}) {
    return createRow('pendingPhysical', {
        pendingEntryId: getPendingEntryKey(entry),
        selected: true,
        documentCode: entry.documentCode || entry.code || '',
        documentName: entry.documentName || entry.name || '',
        vr: entry.vr || entry.id_public || '',
        pages: entry.pages ?? entry.page ?? '',
        date: entry.date || '',
        originState: DOCUMENT_ORIGIN_STATE.SCANNED,
        receptionMedium: '',
    });
}

function DocsComboboxInline({ rowId, code, name, onSelect }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [menuPosition, setMenuPosition] = useState(null);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const searchInputRef = useRef(null);
    const documentOptions = useMemo(() => buildDocumentOptions(), []);
    const normalizedSearch = search.trim().toLowerCase();
    const filteredOptions = useMemo(() => {
        if (!normalizedSearch) return documentOptions.slice(0, 60);
        return documentOptions
            .filter((option) => option.code.toLowerCase().includes(normalizedSearch) || option.name.toLowerCase().includes(normalizedSearch))
            .slice(0, 80);
    }, [documentOptions, normalizedSearch]);

    const displayValue = [code, name].filter(Boolean).join(' · ');

    useEffect(() => {
        if (!open) return undefined;

        const updatePosition = () => {
            const triggerRect = triggerRef.current?.getBoundingClientRect();
            if (!triggerRect) return;

            const viewportPadding = 16;
            const maxWidth = Math.min(720, window.innerWidth - (viewportPadding * 2));
            const width = Math.max(Math.min(maxWidth, Math.max(triggerRect.width, 420)), Math.min(triggerRect.width, maxWidth));
            const left = Math.min(Math.max(triggerRect.left, viewportPadding), window.innerWidth - width - viewportPadding);
            const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
            const top = spaceBelow < 320
                ? Math.max(viewportPadding, triggerRect.top - 340)
                : triggerRect.bottom + 4;

            setMenuPosition({ left, top, width });
        };

        updatePosition();
        window.requestAnimationFrame(() => {
            window.setTimeout(() => {
                searchInputRef.current?.focus();
            }, 0);
        });
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (triggerRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) {
                return;
            }
            setOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [open]);

    const menu = open && typeof document !== 'undefined' ? createPortal(<div
        ref={menuRef}
        className="rounded-xl border border-border bg-background p-2 shadow-2xl"
        style={{
            position: 'fixed',
            top: menuPosition?.top ?? 0,
            left: menuPosition?.left ?? 0,
            width: menuPosition?.width ?? 420,
            zIndex: DOCUMENT_SELECTOR_POPOVER_Z_INDEX,
            visibility: menuPosition ? 'visible' : 'hidden',
        }}
    >
        <div className="mb-2 flex h-11 items-center gap-2 rounded-lg border border-input bg-background px-3 text-foreground ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <Icon name="search" size={15} className="shrink-0 text-muted-foreground" />
            <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por código o nombre"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-none text-foreground outline-none placeholder:text-muted-foreground"
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
    </div>, document.body) : null;

    return <div className="relative min-w-[340px]">
        <button
            ref={triggerRef}
            type="button"
            className="flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-left text-[11px] text-foreground transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => setOpen((current) => !current)}
            title={displayValue || 'Seleccionar documento'}
        >
            <span className="min-w-0 whitespace-normal leading-tight">{displayValue || 'Seleccionar documento'}</span>
            <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} className="shrink-0 text-muted-foreground" />
        </button>
        {menu}
    </div>;
}

function VrSelectInline({ value, vrList = [], onChange }) {
    const options = useMemo(() => {
        const uniqueValues = new Set(vrList.filter(Boolean));
        if (value) uniqueValues.add(value);
        return Array.from(uniqueValues);
    }, [value, vrList]);

    return <select
        className="h-9 w-full min-w-[220px] rounded-md border border-border bg-background px-2 font-mono text-[11px] leading-none text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        title={value || 'SIN VR'}
    >
        <option value="">SIN VR</option>
        {options.map((vr) => <option key={vr} value={vr}>{vr}</option>)}
    </select>;
}

function FileDropCell({ row, onFilesSelected, onFileRemove, onClearFiles, onFilePreview }) {
    const files = Array.isArray(row.files) ? row.files : (row.file ? [row.file] : []);

    return <div className="min-w-[340px] space-y-1.5">
        <label className="flex min-h-[54px] cursor-pointer flex-col justify-center rounded-lg border border-dashed border-border bg-muted/20 px-2.5 py-2 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5">
            <span className="flex items-center gap-2 font-semibold text-foreground">
                <Icon name="upload" size={13} className="text-primary" />
                Arrastra aquí o selecciona archivos
            </span>
            <span>{ACCEPTED_DOCUMENT_FILE_LABEL} · sin límite artificial de previsualización</span>
            <input
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                multiple
                className="sr-only"
                onChange={(event) => {
                    onFilesSelected(row.id, event.target.files);
                    event.target.value = '';
                }}
            />
        </label>
        {row.fileError ? <p className="mb-0 rounded-md border border-warning/30 bg-warning/10 px-2 py-1 text-[10px] font-medium text-warning">{row.fileError}</p> : null}
        {files.length ? <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-border bg-background p-1" title="Archivos seleccionados">
            {files.map((file) => <div key={fileKey(file)} className="flex items-center justify-between gap-2 rounded border border-border/70 bg-muted/20 px-2 py-1 text-[10px] text-foreground">
                <span className="min-w-0 flex-1 truncate" title={file.name}>{file.name}</span>
                <span className="shrink-0 font-mono text-muted-foreground">{formatFileSize(file.size)}</span>
                {row.filePageCounts?.[fileKey(file)] ? <span className="shrink-0 rounded-full border border-border bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                    {row.filePageCounts[fileKey(file)]} folio(s)
                </span> : null}
                {getFilePreviewKind(file) ? <button
                    type="button"
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={() => onFilePreview(file)}
                    aria-label={`Ver ${file.name} en pantalla completa`}
                    title="Pantalla completa"
                >
                    <Icon name="expand-arrows-alt" size={10} />
                </button> : null}
                <button
                    type="button"
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={() => onFileRemove(row.id, fileKey(file))}
                    aria-label={`Quitar ${file.name}`}
                >
                    <Icon name="times" size={10} />
                </button>
            </div>)}
        </div> : <p className="mb-0 text-[10px] text-muted-foreground">Sin archivos adjuntos en esta fila.</p>}
        {row.filePagesLoading ? <p className="mb-0 text-[10px] font-medium text-primary">Calculando folios...</p> : null}
        {files.length ? <button type="button" className="text-[10px] font-semibold text-primary hover:underline" onClick={() => onClearFiles(row.id)}>Limpiar archivos ({files.length})</button> : null}
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
        currentGroup.entries.sort((firstEntry, secondEntry) => String(secondEntry.date || '').localeCompare(String(firstEntry.date || '')) || String(firstEntry.vr || '').localeCompare(String(secondEntry.vr || '')));
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
    const [dragOverRowId, setDragOverRowId] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const pendingGroups = useMemo(() => groupPendingDocuments(pendingPhysicalDocs), [pendingPhysicalDocs]);
    const pendingRowKeys = useMemo(() => new Set(rows.map((row) => row.pendingEntryId).filter(Boolean)), [rows]);
    const selectedCount = rows.filter((row) => row.selected).length;

    useEffect(() => {
        if (open) {
            setRows([createRow('manual')]);
            setSelectedVrValues([]);
            setDragOverRowId(null);
            setPreviewFile(null);
        }
    }, [open]);

    useEffect(() => () => {
        if (previewFile?.url) {
            URL.revokeObjectURL(previewFile.url);
        }
    }, [previewFile?.url]);

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

    const addPendingPhysicalEntry = (entry) => {
        const pendingEntryId = getPendingEntryKey(entry);
        if (pendingRowKeys.has(pendingEntryId)) return;
        setRows((currentRows) => [...currentRows, buildPendingPhysicalRow(entry)]);
    };

    const addPendingPhysicalGroup = (group) => {
        const nextRows = group.entries
            .filter((entry) => !pendingRowKeys.has(getPendingEntryKey(entry)))
            .map((entry) => buildPendingPhysicalRow(entry));
        if (!nextRows.length) return;
        setRows((currentRows) => [...currentRows, ...nextRows]);
    };

    const openFilePreview = (file) => {
        const previewKind = getFilePreviewKind(file);
        if (!previewKind) return;

        setPreviewFile({
            key: fileKey(file),
            name: file.name,
            url: URL.createObjectURL(file),
            kind: previewKind,
        });
    };

    const addFilesToRow = async (rowId, fileList) => {
        const incomingFiles = normalizeFileList(fileList);
        if (!incomingFiles.length) return;

        const acceptedFiles = incomingFiles.filter((file) => ACCEPTED_DOCUMENT_FILE_TYPES.has(file.type));
        const rejectedFiles = incomingFiles.length - acceptedFiles.length;

        setRows((currentRows) => currentRows.map((row) => {
            if (row.id !== rowId) return row;
            const currentFiles = Array.isArray(row.files) ? row.files : (row.file ? [row.file] : []);
            const mergedFiles = mergeFiles(currentFiles, acceptedFiles);
            return {
                ...row,
                selected: true,
                file: mergedFiles[0] || null,
                files: mergedFiles,
                filePagesLoading: acceptedFiles.length > 0,
                fileError: rejectedFiles ? `${rejectedFiles} archivo(s) omitido(s). Solo se aceptan ${ACCEPTED_DOCUMENT_FILE_LABEL}.` : '',
            };
        }));

        if (!acceptedFiles.length) return;

        const incomingPageCounts = await buildFilePageCounts(acceptedFiles);
        setRows((currentRows) => currentRows.map((row) => {
            if (row.id !== rowId) return row;
            const currentFiles = Array.isArray(row.files) ? row.files : (row.file ? [row.file] : []);
            const nextPageCounts = { ...(row.filePageCounts || {}), ...incomingPageCounts };
            const nextPages = getFilesPageTotal(currentFiles, nextPageCounts);

            return {
                ...row,
                pages: nextPages || row.pages,
                filePageCounts: nextPageCounts,
                filePagesLoading: false,
            };
        }));
    };

    const removeFileFromRow = (rowId, keyToRemove) => {
        setRows((currentRows) => currentRows.map((row) => {
            if (row.id !== rowId) return row;
            const currentFiles = Array.isArray(row.files) ? row.files : (row.file ? [row.file] : []);
            const nextFiles = currentFiles.filter((file) => fileKey(file) !== keyToRemove);
            const nextFilePageCounts = { ...(row.filePageCounts || {}) };
            delete nextFilePageCounts[keyToRemove];
            const nextPages = getFilesPageTotal(nextFiles, nextFilePageCounts);
            return {
                ...row,
                file: nextFiles[0] || null,
                files: nextFiles,
                pages: nextPages,
                filePageCounts: nextFilePageCounts,
                fileError: '',
            };
        }));
    };

    const clearFilesFromRow = (rowId) => {
        setRows((currentRows) => currentRows.map((row) => row.id === rowId ? {
            ...row,
            file: null,
            files: [],
            pages: '',
            filePageCounts: {},
            filePagesLoading: false,
            fileError: '',
        } : row));
    };

    const handleRowDragEnter = (event, rowId) => {
        if (!hasDraggedFiles(event)) return;
        event.preventDefault();
        setDragOverRowId(rowId);
    };

    const handleRowDragOver = (event, rowId) => {
        if (!hasDraggedFiles(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setDragOverRowId(rowId);
    };

    const handleRowDragLeave = (event, rowId) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        setDragOverRowId((currentRowId) => currentRowId === rowId ? null : currentRowId);
    };

    const handleRowDrop = (event, rowId) => {
        if (!hasDraggedFiles(event)) return;
        event.preventDefault();
        setDragOverRowId(null);
        addFilesToRow(rowId, event.dataTransfer.files);
    };

    const saveRows = () => {
        const selectedRows = rows.filter((row) => row.selected);
        if (!selectedRows.length) return;
        onSave?.(selectedRows);
    };

    return <>
    <div className="fixed inset-0 z-[1065] flex items-center justify-center bg-black/50 px-4 py-5" role="dialog" aria-modal="true">
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
                            <p className="mb-0 text-xs text-muted-foreground">Las filas manuales y pendientes se guardan por defecto; las importadas desde VR quedan sin marcar.</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => setRows((currentRows) => [...currentRows, createRow('manual')])}>
                            <Icon name="plus" size={14} /> Agregar fila
                        </Button>
                    </div>

                    <div className="max-w-full overflow-x-auto rounded-xl border border-border">
                        <table className="w-full min-w-[1780px] text-xs">
                            <thead className="sticky top-0 z-20 bg-muted text-xs uppercase text-muted-foreground shadow-sm">
                                <tr>
                                    <th className={cn(STICKY_SELECT_COLUMN_CLASS, 'z-40 bg-muted px-2 py-2 text-center')}>Seleccionar</th>
                                    <th className={cn(STICKY_NAME_COLUMN_CLASS, 'z-30 bg-muted px-2 py-2 text-left')}>Nombre</th>
                                    <th className={cn(STICKY_VR_COLUMN_CLASS, 'z-30 bg-muted px-2 py-2 text-left')}>VR</th>
                                    <th className="w-[360px] px-2 py-2 text-left">Archivo</th>
                                    <th className="w-24 px-2 py-2 text-left">Folios</th>
                                    <th className="w-36 px-2 py-2 text-left">Fecha</th>
                                    <th className="w-44 px-2 py-2 text-left">Origen</th>
                                    <th className="w-44 px-2 py-2 text-left">Medio de recepción</th>
                                    <th className="w-12 px-2 py-2 text-center">Quitar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => {
                                    const isDigitalReception = row.originState === DOCUMENT_ORIGIN_STATE.DIGITAL;
                                    const isDraggingFiles = dragOverRowId === row.id;
                                    return <tr
                                        key={row.id}
                                        className={cn(
                                            'border-t border-border align-top transition-colors',
                                            isDraggingFiles ? 'bg-primary/5 shadow-[inset_0_-2px_0_hsl(var(--primary))] ring-1 ring-primary/30' : 'hover:bg-muted/30'
                                        )}
                                        onDragEnter={(event) => handleRowDragEnter(event, row.id)}
                                        onDragOver={(event) => handleRowDragOver(event, row.id)}
                                        onDragLeave={(event) => handleRowDragLeave(event, row.id)}
                                        onDrop={(event) => handleRowDrop(event, row.id)}
                                    >
                                        <td className={cn(STICKY_SELECT_COLUMN_CLASS, 'px-2 py-2 text-center align-top', isDraggingFiles && 'bg-primary/5')}>
                                            <label className="inline-flex min-h-9 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-border bg-background px-2 text-[10px] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground">
                                                <input
                                                    type="checkbox"
                                                    checked={row.selected}
                                                    onChange={(event) => updateRow(row.id, { selected: event.target.checked })}
                                                    aria-label="Seleccionar fila para guardar"
                                                />
                                                Guardar
                                            </label>
                                        </td>
                                        <td className={cn(STICKY_NAME_COLUMN_CLASS, 'px-2 py-2 align-top', isDraggingFiles && 'bg-primary/5')}>
                                            <DocsComboboxInline
                                                rowId={row.id}
                                                code={row.documentCode}
                                                name={row.documentName}
                                                onSelect={(option) => updateRow(row.id, { documentCode: option.code, documentName: option.name })}
                                            />
                                        </td>
                                        <td className={cn(STICKY_VR_COLUMN_CLASS, 'px-2 py-2 align-top', isDraggingFiles && 'bg-primary/5')}>
                                            <VrSelectInline value={row.vr} vrList={vrList} onChange={(value) => updateRow(row.id, { vr: value })} />
                                        </td>
                                        <td className="px-2 py-2 align-top">
                                            <FileDropCell
                                                row={row}
                                                onFilesSelected={addFilesToRow}
                                                onFileRemove={removeFileFromRow}
                                                onClearFiles={clearFilesFromRow}
                                                onFilePreview={openFilePreview}
                                            />
                                        </td>
                                        <td className="px-2 py-2 align-top">
                                            <Input value={row.pages} onChange={(event) => updateRow(row.id, { pages: event.target.value })} className="h-9 min-w-[84px] text-[11px]" type="number" min="0" placeholder="0" />
                                        </td>
                                        <td className="px-2 py-2 align-top">
                                            <Input value={row.date} onChange={(event) => updateRow(row.id, { date: event.target.value })} className="h-9 min-w-[132px] text-[11px]" type="date" />
                                        </td>
                                        <td className="px-2 py-2 align-top">
                                            <select className="h-9 w-full min-w-[160px] rounded-md border border-border bg-background px-2 text-[11px] text-foreground" value={row.originState} onChange={(event) => updateRow(row.id, { originState: event.target.value })}>
                                                <option value={DOCUMENT_ORIGIN_STATE.SCANNED}>Digitalizar documento</option>
                                                <option value={DOCUMENT_ORIGIN_STATE.DIGITAL}>Enviado por medio digital</option>
                                            </select>
                                        </td>
                                        <td className="px-2 py-2 align-top">
                                            <select
                                                className="h-9 w-full min-w-[164px] rounded-md border border-border bg-background px-2 text-[11px] text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                value={row.receptionMedium}
                                                onChange={(event) => updateRow(row.id, { receptionMedium: event.target.value })}
                                                disabled={!isDigitalReception}
                                            >
                                                <option value="">Sin registrar</option>
                                                {DOCUMENT_RECEPTION_MEDIUM_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-2 text-center align-top">
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
                            {!pendingLoading && pendingGroups.map((group) => {
                                const remainingEntries = group.entries.filter((entry) => !pendingRowKeys.has(getPendingEntryKey(entry)));
                                return <div key={group.key} className="rounded-lg border border-border bg-muted/20 p-2">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="mb-1 line-clamp-3 text-xs font-semibold text-foreground" title={group.documentName}>{group.documentName}</p>
                                            {group.documentCode ? <p className="mb-0 font-mono text-[11px] text-muted-foreground">{group.documentCode}</p> : null}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 shrink-0 px-2 text-[10px]"
                                            onClick={() => addPendingPhysicalGroup(group)}
                                            disabled={!remainingEntries.length}
                                        >
                                            <Icon name="plus" size={11} /> Todos
                                        </Button>
                                    </div>
                                    <div className="space-y-1.5">
                                        {group.entries.map((entry) => {
                                            const pendingEntryId = getPendingEntryKey(entry);
                                            const alreadyAdded = pendingRowKeys.has(pendingEntryId);
                                            return <div key={pendingEntryId} className="rounded-md border border-border bg-background p-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 text-[10px] text-muted-foreground">
                                                        <p className="mb-0 font-mono text-foreground">{entry.vr || 'SIN VR'}</p>
                                                        <p className="mb-0">Fecha: {entry.date || 'Sin fecha'} · Folios: {entry.pages ?? entry.page ?? '0'}</p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant={alreadyAdded ? 'ghost' : 'default'}
                                                        size="sm"
                                                        className="h-7 shrink-0 px-2 text-[10px]"
                                                        onClick={() => addPendingPhysicalEntry(entry)}
                                                        disabled={alreadyAdded}
                                                        aria-label={`Agregar pendiente físico ${entry.documentName || group.documentName}`}
                                                    >
                                                        <Icon name={alreadyAdded ? 'check' : 'plus'} size={11} /> {alreadyAdded ? 'Agregado' : 'Agregar'}
                                                    </Button>
                                                </div>
                                            </div>;
                                        })}
                                    </div>
                                </div>;
                            })}
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
    </div>

    {previewFile ? <div className="fixed inset-0 z-[1080] flex flex-col bg-slate-950/85 p-4" role="dialog" aria-modal="true" aria-label="Previsualización en pantalla completa">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                    <p className="mb-0 truncate text-sm font-semibold text-foreground">{previewFile.name}</p>
                    <p className="mb-0 text-xs text-muted-foreground">Vista en pantalla completa · no descarga el archivo</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewFile(null)} aria-label="Cerrar previsualización en pantalla completa">
                    <Icon name="times" size={14} /> Cerrar
                </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-muted/20 p-4">
                {previewFile.kind === 'pdf' ? <iframe
                    title={`Vista previa ${previewFile.name}`}
                    src={previewFile.url}
                    className="h-full min-h-[calc(100vh-10rem)] w-full rounded-xl border border-border bg-background"
                /> : <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
                    <img src={previewFile.url} alt={previewFile.name} className="max-h-[calc(100vh-10rem)] max-w-full rounded-xl object-contain" />
                </div>}
            </div>
        </div>
    </div> : null}
    </>;
}

export default UnifiedDocumentCreateModal;
