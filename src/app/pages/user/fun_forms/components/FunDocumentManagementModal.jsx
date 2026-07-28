import { useEffect, useMemo, useState } from 'react';

import DataTable from '@/components/data-table-bridge';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { ProtectedDocumentPreview } from '@/app/components/ProtectedDocument';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import { downloadProtectedFile, toProtectedApiPath } from '@/app/utils/pdfDownload';

import FUN_SERVICE from '../../../../services/fun.service';

const MODAL_STYLES = {
    overlay: {
        backgroundColor: 'rgba(15, 23, 42, 0.48)',
        zIndex: 1060,
    },
    content: {
        inset: '3vh 3vw',
        padding: 0,
        borderRadius: '20px',
        border: '1px solid rgba(148, 163, 184, 0.25)',
        overflow: 'hidden',
    },
};

const FULLSCREEN_PREVIEW_MODAL_STYLES = {
    overlay: {
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        zIndex: 1070,
    },
    content: {
        inset: '1.5vh 1.5vw',
        maxWidth: 'none',
        padding: 0,
        borderRadius: '24px',
        border: '1px solid rgba(148, 163, 184, 0.22)',
        overflow: 'hidden',
    },
};

function createInitialHistoryForm(date = '') {
    return {
        detail: '',
        date: date || '',
        state: '0',
    };
}

function getDocumentExtension(documentItem) {
    const filename = documentItem?.filename || '';
    return String(filename).split('.').pop()?.toLowerCase() || '';
}

function getPreviewPath(documentItem) {
    if (!documentItem?.path || !documentItem?.filename) {
        return '';
    }

    return `${documentItem.path}/${documentItem.filename}`;
}

function isPreviewableImage(extension) {
    return ['png', 'jpg', 'jpeg', 'webp'].includes(extension);
}

function getHistoryStateLabel(value) {
    return Number(value) === 0 ? 'EN ARCHIVO' : 'FUERA DE ARCHIVO';
}

function downloadDocument(source, filename) {
    if (!source) return Promise.resolve();
    const protectedPath = toProtectedApiPath(source);
    if (protectedPath) return downloadProtectedFile(protectedPath, filename);
    const link = document.createElement('a');
    link.href = source;
    link.download = filename;
    link.rel = 'noopener noreferrer';
    link.click();
    return Promise.resolve();
}

function FunDocumentManagementModal({
    open,
    onClose,
    documentItem,
    canManage,
    swaMsg,
    onEditDocument,
    onDeleteDocument,
}) {
    const [historyRows, setHistoryRows] = useState([]);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [historyMode, setHistoryMode] = useState(null);
    const [historyForm, setHistoryForm] = useState(createInitialHistoryForm());
    const [editingHistoryId, setEditingHistoryId] = useState(null);
    const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

    const previewPath = useMemo(() => getPreviewPath(documentItem), [documentItem]);
    const previewUrl = useMemo(
        () => (previewPath ? `/files/${previewPath}` : ''),
        [previewPath]
    );
    const documentExtension = useMemo(() => getDocumentExtension(documentItem), [documentItem]);
    const defaultHistoryDate = documentItem?.date || '';

    const resetHistoryForm = (date = defaultHistoryDate) => {
        setHistoryMode(null);
        setEditingHistoryId(null);
        setHistoryForm(createInitialHistoryForm(date));
    };

    const loadHistory = async () => {
        if (!documentItem?.id) {
            setHistoryRows([]);
            setHistoryLoaded(true);
            return;
        }

        setHistoryLoaded(false);
        try {
            const response = await FUN_SERVICE.getAll_fun_6_h(documentItem.id);
            setHistoryRows(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            console.log(error);
            setHistoryRows([]);
            swalError({ title: 'ERROR AL CARGAR', text: 'No fue posible consultar el histórico del documento.' });
        } finally {
            setHistoryLoaded(true);
        }
    };

    useEffect(() => {
        if (!open) {
            setIsPreviewFullscreen(false);
            resetHistoryForm(documentItem?.date || '');
            return;
        }

        resetHistoryForm(documentItem?.date || '');
        loadHistory();
    }, [open, documentItem?.id]);

    const canOpenPreviewFullscreen = Boolean(previewPath) && (documentExtension === 'pdf' || isPreviewableImage(documentExtension));

    const historyColumns = useMemo(() => {
        const baseColumns = [
            {
                name: 'DETALLE',
                selector: (row) => row.detail,
                sortable: true,
                grow: 2,
                cell: (row) => <span className="text-sm">{row.detail || 'Sin detalle'}</span>,
            },
            {
                name: 'FECHA',
                selector: (row) => row.date,
                sortable: true,
                minWidth: '110px',
                cell: (row) => <span className="text-sm font-mono">{row.date || 'Sin fecha'}</span>,
            },
            {
                name: 'ESTADO',
                selector: (row) => row.state,
                sortable: true,
                minWidth: '130px',
                cell: (row) => <span className="text-xs font-semibold text-muted-foreground">{getHistoryStateLabel(row.state)}</span>,
            },
        ];

        if (!canManage) {
            return baseColumns;
        }

        return [
            ...baseColumns,
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '120px',
                cell: (row) => <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="px-2"
                        onClick={() => {
                            setEditingHistoryId(row.id);
                            setHistoryMode('edit');
                            setHistoryForm({
                                detail: row.detail || '',
                                date: row.date || '',
                                state: String(row.state ?? '0'),
                            });
                        }}
                    >
                        <Icon name="edit" size={14} />
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="px-2"
                        onClick={() => {
                            swalConfirm({
                                title: 'ELIMINAR ESTE ITEM',
                                text: '¿Está seguro de eliminar este movimiento del histórico?',
                                icon: 'question',
                                confirmButtonText: 'ELIMINAR',
                            }).then(async (result) => {
                                if (!result.isConfirmed) {
                                    return;
                                }

                                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

                                try {
                                    const response = await FUN_SERVICE.delete_6_h(row.id);
                                    if (response?.data === 'OK') {
                                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                        resetHistoryForm(documentItem?.date || '');
                                        await loadHistory();
                                        return;
                                    }

                                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                                } catch (error) {
                                    console.log(error);
                                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                                }
                            });
                        }}
                    >
                        <Icon name="trash-alt" size={14} />
                    </Button>
                </div>,
            },
        ];
    }, [canManage, documentItem?.date, swaMsg]);

    const handleHistorySubmit = async (event) => {
        event.preventDefault();

        if (!documentItem?.id) {
            return;
        }

        const formData = new FormData();
        formData.set('detail', historyForm.detail);
        formData.set('date', historyForm.date || '');
        formData.set('state', historyForm.state);

        if (historyMode === 'new') {
            formData.set('fun6Id', documentItem.id);
        }

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

        try {
            const response = historyMode === 'edit'
                ? await FUN_SERVICE.update_6_h(editingHistoryId, formData)
                : await FUN_SERVICE.create_fun6_h(formData);

            if (response?.data === 'OK') {
                swalSuccess({
                    title: historyMode === 'edit' ? swaMsg.generic_success_title : swaMsg.publish_success_title,
                    text: historyMode === 'edit' ? swaMsg.generic_success_text : swaMsg.publish_success_text,
                    footer: historyMode === 'edit' ? undefined : swaMsg.text_footer,
                });
                resetHistoryForm(documentItem?.date || '');
                await loadHistory();
                return;
            }

            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
        } catch (error) {
            console.log(error);
            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
        }
    };

    const handleDownload = () => {
        if (!previewUrl) {
            return;
        }

        downloadDocument(previewUrl, documentItem?.filename || 'documento').catch((error) => {
            swalError({ title: 'ERROR AL DESCARGAR', text: error?.message || 'No fue posible descargar el documento.' });
        });
    };

    const renderPreview = ({ fullscreen = false } = {}) => {
        if (!previewPath) {
            return <div className="flex h-full min-h-[16rem] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                Este documento no tiene un archivo disponible para previsualización.
            </div>;
        }

        if (documentExtension === 'pdf') {
            return <div className="rounded-xl border border-border bg-background p-3">
                <ProtectedDocumentPreview
                    key={`${previewPath}-${fullscreen ? 'fullscreen' : 'inline'}`}
                    source={previewUrl}
                    title={documentItem?.description || 'Documento digitalizado'}
                    className={fullscreen ? 'h-[calc(100vh-14rem)] w-full bg-muted/10' : 'h-[min(60vh,48rem)] min-h-[24rem] w-full bg-muted/10'}
                />
            </div>;
        }

        if (isPreviewableImage(documentExtension)) {
            return <div className={`flex items-center justify-center rounded-xl border border-border bg-muted/20 p-3 ${fullscreen ? 'h-[calc(100vh-14rem)]' : 'min-h-[24rem] max-h-[min(60vh,48rem)] overflow-auto'}`}>
                <ProtectedDocumentPreview
                    source={previewUrl}
                    kind="img"
                    alt={documentItem?.description || 'Documento digitalizado'}
                    className={`rounded-lg object-contain ${fullscreen ? 'max-h-full max-w-full' : 'max-h-[min(56vh,44rem)] w-full'}`}
                />
            </div>;
        }

        return <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="text-sm text-muted-foreground">Este formato no tiene previsualización embebida.</p>
            <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                <Icon name="Download" size={14} /> Descargar archivo
            </Button>
        </div>;
    };

    return <>
        <Modal
            contentLabel="GESTION DOCUMENTO DIGITALIZADO"
            isOpen={open}
            onRequestClose={onClose}
            style={MODAL_STYLES}
            ariaHideApp={false}
            className="fun-modal-content"
        >
            <div className="flex h-full flex-col bg-background text-foreground">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon name="Search" size={16} />
                        </div>
                        <div>
                            <h2 className="m-0 text-base font-semibold">Gestión del documento</h2>
                            <p className="m-0 text-sm text-muted-foreground">Previsualización y trazabilidad documental en una sola superficie.</p>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 font-semibold text-foreground">
                            {documentItem?.description || 'Documento sin descripción'}
                        </span>
                        {documentItem?.id_public ? <span className="rounded-full border border-border px-2.5 py-1 font-mono">Código {documentItem.id_public}</span> : null}
                        {documentItem?.id_replace ? <span className="rounded-full border border-border px-2.5 py-1">VR {documentItem.id_replace}</span> : null}
                        {documentItem?.date ? <span className="rounded-full border border-border px-2.5 py-1">{documentItem.date}</span> : null}
                        {documentItem?.pages ? <span className="rounded-full border border-border px-2.5 py-1">{documentItem.pages} folios</span> : null}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {previewPath ? <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                        <Icon name="Download" size={14} /> Descargar
                    </Button> : null}
                    {canManage ? <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onClose?.();
                            onEditDocument?.(documentItem);
                        }}
                    >
                        <Icon name="edit" size={14} /> Editar documento
                    </Button> : null}
                    {canManage ? <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            onClose?.();
                            onDeleteDocument?.(documentItem);
                        }}
                    >
                        <Icon name="trash-alt" size={14} /> Eliminar
                    </Button> : null}
                    <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar modal de gestión documental">
                        <Icon name="X" size={16} />
                    </Button>
                </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 overflow-auto p-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
                <section className="min-w-0 rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                            <h3 className="m-0 text-sm font-semibold">Previsualización</h3>
                            <p className="m-0 text-xs text-muted-foreground">Consulta inmediata del archivo digitalizado.</p>
                        </div>
                        {canOpenPreviewFullscreen ? <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPreviewFullscreen(true)}
                            aria-label="Abrir previsualización en pantalla completa"
                            data-testid="document-preview-fullscreen-trigger"
                        >
                            <Icon name="expand-arrows-alt" size={14} /> Pantalla completa
                        </Button> : null}
                    </div>
                    <div className="min-w-0 overflow-hidden">{renderPreview()}</div>
                </section>

                <section className="min-w-0 rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="m-0 text-sm font-semibold">Histórico documental</h3>
                            <p className="m-0 text-xs text-muted-foreground">Movimientos registrados para este soporte digitalizado.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground">
                                {historyRows.length} registro{historyRows.length === 1 ? '' : 's'}
                            </span>
                            {canManage ? <Button
                                type="button"
                                variant={historyMode === 'new' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setHistoryMode('new');
                                    setEditingHistoryId(null);
                                    setHistoryForm(createInitialHistoryForm(documentItem?.date || ''));
                                }}
                            >
                                <Icon name="plus-circle" size={14} /> Nueva entrada
                            </Button> : null}
                        </div>
                    </div>

                    <DataTable
                        noDataComponent="No hay movimientos registrados"
                        striped
                        columns={historyColumns}
                        data={historyRows}
                        highlightOnHover
                        dense
                        noHeader
                        load={historyLoaded}
                        progressPending={!historyLoaded}
                        progressComponent={<label className="fw-normal lead text-muted">CARGANDO...</label>}
                    />

                    {historyMode ? <form className="mt-4 space-y-3 rounded-xl border border-border/70 bg-background p-3" onSubmit={handleHistorySubmit}>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Detalle</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                value={historyForm.detail}
                                onChange={(event) => setHistoryForm((currentValue) => ({ ...currentValue, detail: event.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Fecha</label>
                                <input
                                    type="date"
                                    max="2100-01-01"
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                    value={historyForm.date}
                                    onChange={(event) => setHistoryForm((currentValue) => ({ ...currentValue, date: event.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Estado final</label>
                                <select
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                                    value={historyForm.state}
                                    onChange={(event) => setHistoryForm((currentValue) => ({ ...currentValue, state: event.target.value }))}
                                >
                                    <option value="0">EN ARCHIVO</option>
                                    <option value="1">FUERA DE ARCHIVO</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" size="sm" onClick={() => resetHistoryForm(documentItem?.date || '')}>
                                <Icon name="X" size={14} /> Cancelar
                            </Button>
                            <Button type="submit" size="sm">
                                <Icon name={historyMode === 'edit' ? 'archive' : 'file-alt'} size={14} />
                                {historyMode === 'edit' ? 'Guardar cambios' : 'Añadir movimiento'}
                            </Button>
                        </div>
                    </form> : null}
                </section>
            </div>
            </div>
        </Modal>

        <Modal
            contentLabel="PREVISUALIZACION DOCUMENTO PANTALLA COMPLETA"
            isOpen={open && isPreviewFullscreen}
            onRequestClose={() => setIsPreviewFullscreen(false)}
            style={FULLSCREEN_PREVIEW_MODAL_STYLES}
            ariaHideApp={false}
            className="fun-modal-content"
        >
            <div data-testid="document-preview-fullscreen-modal" className="flex h-full flex-col bg-background text-foreground">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                    <div className="min-w-0">
                        <h2 className="m-0 text-base font-semibold">Vista completa del documento</h2>
                        <p className="m-0 text-sm text-muted-foreground">Previsualización inmersiva sin perder el contexto del expediente.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {previewPath ? <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                            <Icon name="Download" size={14} /> Descargar
                        </Button> : null}
                        <Button type="button" variant="ghost" size="icon" onClick={() => setIsPreviewFullscreen(false)} aria-label="Cerrar previsualización en pantalla completa">
                            <Icon name="X" size={16} />
                        </Button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden p-4">
                    {renderPreview({ fullscreen: true })}
                </div>
            </div>
        </Modal>
    </>;
}

export default FunDocumentManagementModal;
