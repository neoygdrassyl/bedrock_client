import { useEffect, useMemo, useState } from 'react';
import FUNService from '../../../services/fun.service'

import DataTable from '@/components/data-table-bridge';
import dayjs from 'dayjs';
import FUN_SERVICE from '../../../services/fun.service';
import VIZUALIZER from '../../../components/vizualizer.component';
import DOCS_LIST from './components/docs_list.component';
import FUN_6_HISTORY from './components/fun_6_history.component';
import submitService from '../../../services/submit.service';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import { Button } from '@/components/ui/button';
import {
    buildUnifiedDocumentRows,
    filterUnifiedDocumentRows,
    normalizeVentanillaDocs,
    summarizeUnifiedDocumentRows,
} from '../shared/expediente-documental.utils';

const SOURCE_META = {
    all: { label: 'Todo', className: 'border-border bg-background text-foreground' },
    both: { label: 'Ambas', className: 'border-primary/20 bg-primary/10 text-primary' },
    digital: { label: 'Solo digitalizados', className: 'border-accent/20 bg-accent/10 text-accent' },
    ventanilla: { label: 'Solo ventanilla', className: 'border-warning/20 bg-warning/10 text-warning' },
};

const DIGITIZATION_META = {
    all: { label: 'Todos' },
    digitized: { label: 'Digitalizados' },
    pending: { label: 'Pendientes' },
};

function FUN_6_VIEW({
    translation,
    swaMsg,
    globals,
    currentItem,
    currentId,
    readOnly,
    title,
    VREdit,
    parentLoad,
    updateParentLoad,
    mergeVentanilla = false,
    onVentanillaRowsChange,
}) {
    const [attachs, setAttachs] = useState(0);
    const [edit, setEdit] = useState(false);
    const [item, setItem] = useState(null);
    const [show_doc_1, setShowDoc1] = useState(false);
    const [modal_searchList, setModalSearchList] = useState(false);
    const [currentItem6, setCurrentItem6] = useState([]);
    const [VRList, setVRList] = useState([]);
    const [ventanillaDocs, setVentanillaDocs] = useState([]);
    const [documentsLoaded, setDocumentsLoaded] = useState(false);
    const [ventanillaLoaded, setVentanillaLoaded] = useState(false);
    const [sourceFilter, setSourceFilter] = useState('all');
    const [digitizationFilter, setDigitizationFilter] = useState('all');
    const [searchValue, setSearchValue] = useState('');

    const isLoaded = documentsLoaded && ventanillaLoaded;
    const unifiedRows = useMemo(
        () => buildUnifiedDocumentRows(currentItem6, ventanillaDocs),
        [currentItem6, ventanillaDocs]
    );
    const filteredUnifiedRows = useMemo(
        () => filterUnifiedDocumentRows(unifiedRows, {
            source: sourceFilter,
            digitization: digitizationFilter,
            search: searchValue,
        }),
        [unifiedRows, sourceFilter, digitizationFilter, searchValue]
    );
    const unifiedSummary = useMemo(() => summarizeUnifiedDocumentRows(unifiedRows), [unifiedRows]);

    const requestUpdate = (id) => {
        retrieveItem(id);
    };
    const retrieveItemVR = (id) => {
        submitService.getIdRelated(id)
            .then((response) => {
                const currentList = Array.isArray(response.data) ? response.data : [];
                const normalizedDocs = normalizeVentanillaDocs(currentList);
                const vrList = currentList
                    .map((value) => value?.id_public)
                    .filter(Boolean)
                    .filter((value, index, list) => list.indexOf(value) === index);

                setVRList(vrList);
                setVentanillaDocs(normalizedDocs);
                setVentanillaLoaded(true);
                if (onVentanillaRowsChange) {
                    onVentanillaRowsChange(normalizedDocs);
                }
            })
            .catch((error) => {
                console.log(error);
                setVRList([]);
                setVentanillaDocs([]);
                setVentanillaLoaded(true);
                if (onVentanillaRowsChange) {
                    onVentanillaRowsChange([]);
                }
            });
    };
    const retrieveItem = (id) => {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem6(response.data.fun_6s);
                setDocumentsLoaded(true);
            })
            .catch(e => {
                console.log(e);
                setCurrentItem6([]);
                setDocumentsLoaded(true);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    };

    useEffect(() => {
        if (!currentId) {
            return;
        }

        setDocumentsLoaded(false);
        retrieveItem(currentId);
    }, [currentId]);

    useEffect(() => {
        if (item != null) {
            document.getElementById('fun6_descriptions_edit').value = item.description;
            document.getElementById('fun6_codes_edit').value = item.id_public;
            document.getElementById('fun6_pages_edit').value = item.pages;
            document.getElementById('fun6_dates_edit').value = item.date;
        }
    }, [item]);

    useEffect(() => {
        if (!currentItem?.id_public) {
            setVRList([]);
            setVentanillaDocs([]);
            setVentanillaLoaded(true);
            if (onVentanillaRowsChange) {
                onVentanillaRowsChange([]);
            }
            return;
        }

        setVentanillaLoaded(false);
        retrieveItemVR(currentItem.id_public);
    }, [currentItem?.id_public, onVentanillaRowsChange]);

    useEffect(() => {
        if (parentLoad == 0 && parentLoad != undefined) {
            setDocumentsLoaded(false);
            retrieveItem(currentId);
            if (currentItem?.id_public) {
                setVentanillaLoaded(false);
                retrieveItemVR(currentItem.id_public);
            }
            updateParentLoad(1);
        }
    }, [parentLoad, currentId, currentItem?.id_public, updateParentLoad]);

        var formData = new FormData();

        const isRewDoc = (id) => (id || '').includes('law') || (id || '').includes('eng') || (id || '').includes('arc');

        const renderActionButtons = (digitalDoc) => {
            if (!digitalDoc) {
                return <span className="text-xs font-semibold text-warning">Pendiente de digitalizar</span>;
            }

            return <>
                <VIZUALIZER url={digitalDoc.path + "/" + digitalDoc.filename} apipath={'/files/'}
                    icon='Search'
                    iconWrapper='inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8'
                    iconStyle={{ fontSize: '150%' }} />
                <FUN_6_HISTORY translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    fun6={digitalDoc} />
                {readOnly ? '' :
                    window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 2 ?
                        <>
                            <span title="Modificar Item"><Button variant="outline" size="sm" className="m-0 p-1" onClick={() => set_edit_6(digitalDoc)}>
                                    <Icon name="edit" size={16} style={{ fontSize: '150%' }} /></Button></span>
                            <span title="Eliminar Item"><Button variant="destructive" size="sm" className="m-0 p-1" onClick={() => delete_6(digitalDoc.id)}>
                                    <Icon name="trash-alt" size={16} style={{ fontSize: '150%' }} /></Button></span>
                        </>
                        : ''
                }
            </>;
        };

        const renderReferenceCell = (row) => {
            if (row.digitalDoc && VREdit && !isRewDoc(row.digitalDoc.id_replace || '')) {
                return <div className="space-y-1">
                    <select className='form-select form-select-sm' id="f_6_vr" defaultValue={row.digitalDoc.id_replace || ''}
                        onChange={(event) => edit_6_vr(row.digitalDoc.id, event.target.value)}>
                        <option value="">SIN VR</option>
                        {VRList.map((vr) => <option key={vr}>{vr}</option>)}
                    </select>
                    {row.ventanillaEntries.length ? <div className="text-xs text-muted-foreground">VU: {row.ventanillaEntries.map((entry) => entry.id_public).join(', ')}</div> : null}
                </div>;
            }

            if (row.digitalDoc && isRewDoc(row.digitalDoc.id_replace || '')) {
                return <span className="text-xs font-semibold text-muted-foreground">INFORME</span>;
            }

            return <div className="space-y-1">
                <div className="text-sm font-medium">{row.vrValues.length ? row.vrValues.join(', ') : 'Sin referencia'}</div>
                {!row.isDigitized ? <div className="text-xs text-warning">Sin soporte digitalizado</div> : null}
            </div>;
        };

        const _UNIFIED_LIST = () => {
            const columns = [
                {
                    name: 'DOCUMENTO',
                    selector: (row) => row.documentName,
                    sortable: true,
                    filterable: true,
                    minWidth: '260px',
                    cell: (row) => <div>
                        <div className="text-sm font-medium">{row.documentName}</div>
                        {row.ventanillaEntries[0]?.category ? <div className="text-xs text-muted-foreground">{row.ventanillaEntries[0].category}</div> : null}
                    </div>
                },
                {
                    name: 'ORIGEN',
                    selector: (row) => row.source,
                    sortable: true,
                    filterable: true,
                    minWidth: '120px',
                    cell: (row) => <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${SOURCE_META[row.source].className}`}>
                        {SOURCE_META[row.source].label}
                    </span>
                },
                {
                    name: 'VR / VU',
                    selector: (row) => row.vrValues.join(', '),
                    sortable: true,
                    filterable: true,
                    minWidth: '190px',
                    cell: (row) => renderReferenceCell(row)
                },
                {
                    name: 'CODIGO',
                    selector: (row) => row.code,
                    sortable: true,
                    filterable: true,
                    minWidth: '90px',
                    cell: (row) => <span className="text-sm font-mono">{row.code || '—'}</span>
                },
                {
                    name: 'FOLIOS',
                    selector: (row) => row.digitalPages ?? row.ventanillaPages,
                    sortable: true,
                    minWidth: '90px',
                    cell: (row) => <div className="space-y-1 text-xs font-mono">
                        {row.digitalPages != null ? <div>DG {row.digitalPages}</div> : null}
                        {row.ventanillaPages != null ? <div className="text-muted-foreground">VU {row.ventanillaPages}</div> : null}
                    </div>
                },
                {
                    name: 'FECHA',
                    selector: (row) => row.digitalDate || row.ventanillaDate,
                    sortable: true,
                    minWidth: '120px',
                    cell: (row) => <div className="space-y-1 text-xs font-mono">
                        {row.digitalDate ? <div>DG {row.digitalDate}</div> : null}
                        {row.ventanillaDate ? <div className="text-muted-foreground">VU {row.ventanillaDate}</div> : null}
                    </div>
                },
                {
                    name: 'ACCION',
                    button: true,
                    minWidth: '170px',
                    cell: (row) => renderActionButtons(row.digitalDoc)
                },
            ];

            return <div className="space-y-3">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Expediente documental unificado</p>
                            <p className="text-xs text-muted-foreground">Una sola tabla para digitalizados y ventanilla única, con filtros visibles y foco operativo.</p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
                                <div className="text-muted-foreground">Total</div>
                                <div className="text-sm font-semibold">{unifiedSummary.total}</div>
                            </div>
                            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
                                <div className="text-muted-foreground">Ambas</div>
                                <div className="text-sm font-semibold">{unifiedSummary.both}</div>
                            </div>
                            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
                                <div className="text-muted-foreground">Solo digital</div>
                                <div className="text-sm font-semibold">{unifiedSummary.digital}</div>
                            </div>
                            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
                                <div className="text-muted-foreground">Solo ventanilla</div>
                                <div className="text-sm font-semibold">{unifiedSummary.ventanilla}</div>
                            </div>
                            <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
                                <div className="text-muted-foreground">Pendientes</div>
                                <div className="text-sm font-semibold text-warning">{unifiedSummary.pendingDigitization}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(SOURCE_META).map(([key, value]) => <button
                                key={key}
                                type="button"
                                onClick={() => setSourceFilter(key)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${sourceFilter === key ? value.className : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}
                            >
                                {value.label}
                            </button>)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(DIGITIZATION_META).map(([key, value]) => <button
                                key={key}
                                type="button"
                                onClick={() => setDigitizationFilter(key)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${digitizationFilter === key ? 'border-primary/20 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}
                            >
                                {value.label}
                            </button>)}
                        </div>
                    </div>

                    <div className="mt-3">
                        <input
                            type="search"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0"
                            placeholder="Buscar por documento, codigo o VR"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                    noDataComponent="No hay documentos registrados"
                    striped="true"
                    columns={columns}
                    data={filteredUnifiedRows}
                    highlightOnHover
                    pagination
                    paginationPerPage={12}
                    paginationRowsPerPageOptions={[12, 24, 48]}
                    className="data-table-component"
                    noHeader

                    load={isLoaded}
                    progressPending={!isLoaded}
                    progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
                    dense
                />
            </div>;
        };

        let _CHILD_6_LIST = () => {
            let _LIST = currentItem6;
            const columns = [
                {
                    name: 'DESCRIPCIÓN',
                    selector: row => row.description,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.description}</span>
                },
                {
                    name: 'VR',
                    selector: row => row.id_replace,
                    sortable: true,
                    filterable: true,
                    minWidth: '50px',
                    maxWidth: '150px',
                    cell: row => VREdit && !isRewDoc(row.id_replace || '') ? <select className='form-select form-select-sm' id="f_6_vr" defaultValue={row.id_replace || ''}
                        onChange={(e) => edit_6_vr(row.id, e.target.value)}>
                        <option value="">SIN VR</option>
                        {VRList.map(vr => <option key={vr}>{vr}</option>)}
                    </select> : isRewDoc(row.id_replace || '') ? 'INFORME' : <label>{row.id_replace}</label>
                },
                {
                    name: 'CÓDIGO',
                    selector: row => row.id_public,
                    sortable: true,
                    filterable: true,
                    maxWidth: '50px',
                    cell: row => <span className="text-sm">{row.id_public}</span>
                },
                {
                    name: 'FOLIOS',
                    selector: row => row.pages,
                    sortable: true,
                    filterable: true,
                    maxWidth: '40px',
                    cell: row => <span className="text-sm">{row.pages}</span>
                },
                {
                    name: 'FECHA RADICACIÓN',
                    selector: row => row.date,
                    sortable: true,
                    filterable: true,
                    maxWidth: '100px',
                    cell: row => <span className="text-sm">{row.date}</span>
                },
                /**
                 * {
                    name: 'ESTADO',
                    button: true,
                    maxWidth: '50px',
                    omit: readOnly ? true : false,
                    cell: row =>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setChecked6(row)} />
                        </div>
                },
                 * 
                 */
                {
                    name: 'ACCIÓN',
                    button: true,
                    minWidth: '150px',
                    cell: row => renderActionButtons(row)
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={15}
                paginationRowsPerPageOptions={[15, 30, 60]}
                className="data-table-component"
                title={'DOCUMENTOS DIGITALIZADOS'}
                noHeader={!title}

                load={isLoaded}
                progressPending={!isLoaded}
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                dense
            />
        }
        let setValues_edit = (refs, values) => {
            document.getElementById('fun6_codes_edit').value = values[0];
            document.getElementById('fun6_descriptions_edit').value = values[1];
        }
        let _EDIT_COMPONENT = () => {
            return <><h3 className="text-center py-3" id="fund_edit">ACTUALIZAR DOCUMENTO</h3>
                <div className="row">
                    <div className="col-12">
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground"><Icon name="paperclip" size={16} /></span>
                            <input type="file" className="form-control" id="file_fun6s_edit" accept="image/png, image/jpeg application/pdf" />
                        </div>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground"><Icon name="paperclip" size={16} /></span>
                            <input list="fun_6_docs_list" id="fun6_descriptions_edit" className="form-control" required />
                            <DOCS_LIST idRef={''} setValues={setValues_edit} text={'VER LISTA'} />
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-start mb-3">
                    <div className="col-3">
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground"><Icon name="hashtag" size={16} /></span>
                            <input type="text" className="form-control" id="fun6_codes_edit" />
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground"><Icon name="sticky-note" size={16} /></span>
                            <input type="number" className="form-control" step="1" min="0" id="fun6_pages_edit" required />
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground"><Icon name="calendar-alt" size={16} />&nbsp;Fecha Anexo</span>
                            <input type="date" className="form-control" max="2100-01-01" id="fun6_dates_edit" required />
                        </div>
                    </div>
                </div>
            </>
        }
        let setChecked6 = (item) => {
            formData = new FormData();
            let id = item.id
            let active = item.active;
            active = active == 1 ? 0 : 1;
            formData.set('active', active);
            FUNService.update_6(id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        requestUpdate(currentItem.id);
                    } else {
                        if (response.status == 500) {
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }
        let delete_6 = (id) => {
            formData = new FormData();
            swalConfirm({
                title: "ELIMINAR ESTE ITEM",
                text: "¿Esta seguro de eliminar de forma permanente este item?",
                icon: 'question',
                confirmButtonText: "ELIMINAR",
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    FUNService.delete_6(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                requestUpdate(currentItem.id);
                                setEdit(false)
                            } else {
                                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        });
                }
            });
        }
        let set_edit_6 = (_item) => {
            setItem(_item);
            setEdit(true);
        }
        let edit_6 = (e) => {
            e.preventDefault();
            formData = new FormData();
            // FILE DATA
            let _creationYear = dayjs(currentItem.createdAt).format('YY');
            let _folder = currentItem.id_public;
            let file = document.getElementById('file_fun6s_edit').files[0];
            if (file) {
                formData.append('file', file, "fun6_" + _creationYear + "_" + _folder + "_" + file.name);
                formData.set('attached', true);

            } else {
                formData.set('attached', false);
            }

            let description = document.getElementById('fun6_descriptions_edit').value;
            formData.set('description', description);
            let id_public = document.getElementById('fun6_codes_edit').value;
            formData.set('id_public', id_public);
            let pages = document.getElementById('fun6_pages_edit').value;
            formData.set('pages', pages);
            formData.set('id_public', id_public);
            let date = document.getElementById('fun6_dates_edit').value;

            if (!date) date = null;
            formData.set('date', date);
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUNService.update_6(item.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                        setEdit(false); setItem(null);
                        requestUpdate(currentItem.id);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                });

        }
        let edit_6_vr = (id, new_vr) => {
            formData = new FormData();
            formData.set('id_replace', new_vr);
            FUNService.update_6(id, formData)
                .then(response => {
                    if (response.data === 'OK') {

                        setEdit(false); setItem(null);
                        requestUpdate(currentItem.id);
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }

        return (
            <div>
                {mergeVentanilla ? _UNIFIED_LIST() : _CHILD_6_LIST()}
                {edit
                    ? <>
                        <form id="fun_6_d_edit" onSubmit={edit_6} className="py-3">
                            {_EDIT_COMPONENT()}
                            <div className="row text-center">
                                <div className="col-12">
                                    <Button type="submit" variant="default" size="sm"><Icon name="archive" size={14} /> Guardar cambios</Button>
                                </div>
                            </div>
                        </form></> : ""}
            </div>
        );
}

export default FUN_6_VIEW;