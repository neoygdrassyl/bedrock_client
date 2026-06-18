import { useEffect, useMemo, useState } from 'react';
import FUNService from '../../../services/fun.service'

import DataTable from '@/components/data-table-bridge';
import dayjs from 'dayjs';
import FUN_SERVICE from '../../../services/fun.service';
import DOCS_LIST from './components/docs_list.component';
import submitService from '../../../services/submit.service';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import { Button } from '@/components/ui/button';
import FunDocumentManagementModal from './components/FunDocumentManagementModal';
import UnifiedDocumentTable from '../shared/UnifiedDocumentTable';
import UnifiedDocumentCreateModal from '../shared/UnifiedDocumentCreateModal';
import { buildDocumentEntriesFromLegacyData, normalizeVentanillaDocs } from '../shared/expediente-documental.utils';
import { DOCUMENT_ORIGIN_STATE, DOCUMENT_RECEPTION_MEDIUM_OPTIONS } from '../shared/expediente-documental.constants';

function fileKey(file) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

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
    const [managementDocument, setManagementDocument] = useState(null);
    const [managementModalOpen, setManagementModalOpen] = useState(false);
    const [currentItem6, setCurrentItem6] = useState([]);
    const [VRList, setVRList] = useState([]);
    const [ventanillaDocs, setVentanillaDocs] = useState([]);
    const [documentsLoaded, setDocumentsLoaded] = useState(false);
    const [ventanillaLoaded, setVentanillaLoaded] = useState(false);
    const [documentEntries, setDocumentEntries] = useState([]);
    const [documentEntriesLoaded, setDocumentEntriesLoaded] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createDocumentsSaving, setCreateDocumentsSaving] = useState(false);
    const [pendingPhysicalDocs, setPendingPhysicalDocs] = useState([]);
    const [pendingPhysicalDocsLoaded, setPendingPhysicalDocsLoaded] = useState(false);
    const [missingDocumentsResult, setMissingDocumentsResult] = useState(null);
    const [missingDocumentsLoaded, setMissingDocumentsLoaded] = useState(false);
    const [missingDocumentsError, setMissingDocumentsError] = useState('');
    const [rawSubmitList, setRawSubmitList] = useState([]);

    const isLoaded = documentsLoaded && ventanillaLoaded;
    const localDocumentEntries = useMemo(
        () => buildDocumentEntriesFromLegacyData(currentItem6, ventanillaDocs),
        [currentItem6, ventanillaDocs],
    );
    const shouldUseLocalDocumentEntries = mergeVentanilla && documentEntriesLoaded && !documentEntries.length && localDocumentEntries.length;
    const displayedDocumentEntries = shouldUseLocalDocumentEntries
        ? localDocumentEntries
        : documentEntries;
    const unifiedDocumentsLoading = !documentEntriesLoaded || (mergeVentanilla && documentEntriesLoaded && !documentEntries.length && !isLoaded);
    const currentUser = typeof window === 'undefined' ? null : window.user;
    const canManageDocuments = !readOnly && (
        Number(currentUser?.id) === 1
        || [1, 2, 3].includes(Number(currentUser?.roleId))
    );

    const requestUpdate = (id) => {
        retrieveItem(id);
        if (mergeVentanilla && currentItem?.id_public) {
            retrieveItemVR(currentItem.id_public);
            retrieveUnifiedDocumentEntries(id, currentItem.id_public);
            retrievePendingPhysicalDocuments(id, currentItem.id_public);
            retrieveMissingDocuments(id, currentItem.id_public);
        }
    };
    const requestDocumentUpdate = (id) => {
        if (mergeVentanilla && currentItem?.id_public) {
            retrieveUnifiedDocumentEntries(id, currentItem.id_public);
            retrievePendingPhysicalDocuments(id, currentItem.id_public);
            retrieveMissingDocuments(id, currentItem.id_public);
            return;
        }

        setDocumentsLoaded(false);
        retrieveItem(id);
    };
    const retrieveUnifiedDocumentEntries = (funId, idRelated) => {
        if (!funId || !idRelated) {
            setDocumentEntries([]);
            setDocumentEntriesLoaded(true);
            return;
        }

        setDocumentEntriesLoaded(false);
        FUN_SERVICE.getUnifiedDocumentEntries(funId, idRelated)
            .then((response) => {
                setDocumentEntries(Array.isArray(response.data) ? response.data : []);
                setDocumentEntriesLoaded(true);
            })
            .catch((error) => {
                console.warn('No fue posible consultar el expediente documental unificado; se usará respaldo local.', error);
                setDocumentEntries([]);
                setDocumentEntriesLoaded(true);
            });
    };
    const retrievePendingPhysicalDocuments = (funId, idRelated) => {
        if (!funId || !idRelated) {
            setPendingPhysicalDocs([]);
            setPendingPhysicalDocsLoaded(true);
            return;
        }

        setPendingPhysicalDocsLoaded(false);
        FUN_SERVICE.getPendingPhysicalDocuments(funId, idRelated)
            .then((response) => {
                setPendingPhysicalDocs(Array.isArray(response.data) ? response.data : []);
                setPendingPhysicalDocsLoaded(true);
            })
            .catch((error) => {
                console.warn('No fue posible consultar los documentos físicos pendientes.', error);
                setPendingPhysicalDocs([]);
                setPendingPhysicalDocsLoaded(true);
            });
    };
    const retrieveMissingDocuments = (funId, idRelated) => {
        if (!funId || !idRelated) {
            setMissingDocumentsResult(null);
            setMissingDocumentsError('');
            setMissingDocumentsLoaded(true);
            return;
        }

        setMissingDocumentsLoaded(false);
        setMissingDocumentsError('');
        FUN_SERVICE.getMissingDocuments(funId, idRelated)
            .then((response) => {
                setMissingDocumentsResult(response?.data || null);
                setMissingDocumentsLoaded(true);
            })
            .catch((error) => {
                console.warn('No fue posible consultar Legal y Debida Forma.', error);
                setMissingDocumentsResult(null);
                setMissingDocumentsError('No fue posible consultar Legal y Debida Forma.');
                setMissingDocumentsLoaded(true);
            });
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
                setRawSubmitList(currentList);
                setVentanillaLoaded(true);
                if (onVentanillaRowsChange) {
                    onVentanillaRowsChange(normalizedDocs);
                }
            })
            .catch((error) => {
                console.log(error);
                setVRList([]);
                setVentanillaDocs([]);
                setRawSubmitList([]);
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
        if (!mergeVentanilla) {
            setDocumentEntriesLoaded(true);
            return;
        }

        if (!currentId || !currentItem?.id_public) {
            setDocumentEntries([]);
            setDocumentEntriesLoaded(true);
            return;
        }

        retrieveUnifiedDocumentEntries(currentId, currentItem.id_public);
    }, [mergeVentanilla, currentId, currentItem?.id_public]);

    useEffect(() => {
        if (!mergeVentanilla) {
            setPendingPhysicalDocsLoaded(true);
            return;
        }

        if (!currentId || !currentItem?.id_public) {
            setPendingPhysicalDocs([]);
            setPendingPhysicalDocsLoaded(true);
            return;
        }

        retrievePendingPhysicalDocuments(currentId, currentItem.id_public);
    }, [mergeVentanilla, currentId, currentItem?.id_public]);

    useEffect(() => {
        if (!mergeVentanilla) {
            setMissingDocumentsLoaded(true);
            return;
        }

        if (!currentId || !currentItem?.id_public) {
            setMissingDocumentsResult(null);
            setMissingDocumentsError('');
            setMissingDocumentsLoaded(true);
            return;
        }

        retrieveMissingDocuments(currentId, currentItem.id_public);
    }, [mergeVentanilla, currentId, currentItem?.id_public]);

    useEffect(() => {
        if (item != null) {
            document.getElementById('fun6_descriptions_edit').value = item.description;
            document.getElementById('fun6_codes_edit').value = item.id_public;
            document.getElementById('fun6_pages_edit').value = item.pages;
            document.getElementById('fun6_dates_edit').value = item.date;
            const originField = document.getElementById('fun6_origin_state_edit');
            const mediumField = document.getElementById('fun6_medio_recepcion_edit');
            if (originField) originField.value = item.origin_state || DOCUMENT_ORIGIN_STATE.SCANNED;
            if (mediumField) mediumField.value = item.medio_recepcion || '';
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
                if (mergeVentanilla) {
                    retrieveUnifiedDocumentEntries(currentId, currentItem.id_public);
                    retrievePendingPhysicalDocuments(currentId, currentItem.id_public);
                }
            }
            updateParentLoad(1);
        }
    }, [parentLoad, currentId, currentItem?.id_public, mergeVentanilla, updateParentLoad]);

        const saveCreatedDocuments = (rowsToSave = []) => {
            if (!rowsToSave.length) {
                swalError({ title: 'Sin filas seleccionadas', text: 'Marca al menos una fila para guardar.' });
                return;
            }

            const batchFormData = new FormData();
            const fun0Id = currentId || currentItem?.id;
            const creationYear = dayjs(currentItem?.createdAt || new Date()).format('YY');
            const folder = currentItem?.id_public || String(fun0Id || 'documentos');
            const buildPayloadRow = (row, fileField = '', pagesOverride = row.pages) => ({
                fun0Id,
                selected: true,
                documentCode: row.documentCode,
                documentName: row.documentName,
                vr: row.vr,
                pages: pagesOverride,
                date: row.date,
                originState: row.originState,
                receptionMedium: row.receptionMedium,
                fileField,
            });

            const payloadRows = rowsToSave.flatMap((row) => {
                const rowFiles = Array.isArray(row.files) && row.files.length
                    ? row.files.filter(Boolean)
                    : (row.file ? [row.file] : []);

                if (!rowFiles.length) {
                    return [buildPayloadRow(row)];
                }

                return rowFiles.map((file, fileIndex) => {
                    const fileField = `file_${row.id}_${fileIndex}`;
                    const filePages = row.filePageCounts?.[fileKey(file)] || row.pages;
                    batchFormData.append(fileField, file, `fun6_${creationYear}_${folder}_${fileIndex + 1}_${file.name}`);

                    return buildPayloadRow(row, fileField, filePages);
                });
            });

            batchFormData.set('fun0Id', fun0Id);
            batchFormData.set('rows', JSON.stringify(payloadRows));
            setCreateDocumentsSaving(true);
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

            FUN_SERVICE.createDocumentEntriesBatch(batchFormData)
                .then((response) => {
                    if (response.data?.status === 'OK' || response.data === 'OK') {
                        swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                        setCreateModalOpen(false);
                        requestDocumentUpdate(fun0Id);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch((error) => {
                    console.log(error);
                    swalError({ title: swaMsg.generic_eror_title, text: error.response?.data?.message || swaMsg.generic_error_text });
                })
                .finally(() => {
                    setCreateDocumentsSaving(false);
                });
        };

        var formData = new FormData();

        const isRewDoc = (id) => (id || '').includes('law') || (id || '').includes('eng') || (id || '').includes('arc');
        const openManagementModal = (digitalDoc) => {
            if (!digitalDoc) {
                return;
            }

            setManagementDocument(digitalDoc);
            setManagementModalOpen(true);
        };
        const closeManagementModal = () => {
            setManagementModalOpen(false);
            setManagementDocument(null);
        };

        const renderActionButtons = (digitalDoc) => {
            if (!digitalDoc) {
                return <span className="text-xs font-semibold text-warning">Pendiente de digitalizar</span>;
            }

            return <Button type="button" size="sm" onClick={() => openManagementModal(digitalDoc)}>
                <Icon name="Search" size={14} /> Gestionar
            </Button>;
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
                <div className="row d-flex justify-content-start mb-3">
                    <div className="col-4">
                        <label className="form-label text-muted">Origen</label>
                        <select className="form-select" id="fun6_origin_state_edit" defaultValue={item?.origin_state || DOCUMENT_ORIGIN_STATE.SCANNED}>
                            <option value={DOCUMENT_ORIGIN_STATE.SCANNED}>Digitalizar documento</option>
                            <option value={DOCUMENT_ORIGIN_STATE.DIGITAL}>Enviado por medio digital</option>
                        </select>
                    </div>
                    <div className="col-4">
                        <label className="form-label text-muted">Medio de recepción</label>
                        <select className="form-select" id="fun6_medio_recepcion_edit" defaultValue={item?.medio_recepcion || ''}>
                            <option value="">Sin registrar</option>
                            {DOCUMENT_RECEPTION_MEDIUM_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
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
            const originState = document.getElementById('fun6_origin_state_edit')?.value || DOCUMENT_ORIGIN_STATE.SCANNED;
            const receptionMedium = originState === DOCUMENT_ORIGIN_STATE.DIGITAL
                ? (document.getElementById('fun6_medio_recepcion_edit')?.value || '')
                : '';
            formData.set('origin_state', originState);
            formData.set('medio_recepcion', receptionMedium);
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

        const saveDigitalEntryFromModal = async (digitalDoc, values = {}) => {
            if (!digitalDoc?.id) {
                swalError({ title: swaMsg.generic_eror_title, text: 'No fue posible identificar la entrada digital a actualizar.' });
                return;
            }

            const modalFormData = new FormData();
            modalFormData.set('attached', false);
            modalFormData.set('description', digitalDoc.description || 'Documento sin nombre');
            modalFormData.set('id_public', digitalDoc.id_public || '');
            modalFormData.set('pages', values.pages ?? digitalDoc.pages ?? '');
            modalFormData.set('date', digitalDoc.date || '');
            modalFormData.set('id_replace', values.vr ?? digitalDoc.id_replace ?? '');
            modalFormData.set('origin_state', digitalDoc.origin_state || DOCUMENT_ORIGIN_STATE.SCANNED);
            modalFormData.set('medio_recepcion', digitalDoc.medio_recepcion || '');

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

            try {
                const response = await FUNService.update_6(digitalDoc.id, modalFormData);
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                    setEdit(false);
                    setItem(null);
                    requestUpdate(currentItem.id);
                    return;
                }

                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
            } catch (error) {
                console.log(error);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                throw error;
            }
        };

        return (
            <div>
                {mergeVentanilla ? <UnifiedDocumentTable
                    entries={displayedDocumentEntries}
                    loading={unifiedDocumentsLoading}
                    canManage={canManageDocuments}
                    onAddDocument={() => setCreateModalOpen(true)}
                    onEditEntry={() => {}}
                    onSaveDigitalEntry={saveDigitalEntryFromModal}
                    onDeleteEntry={(digitalDoc) => delete_6(digitalDoc.id)}
                    vrList={VRList}
                    legalFormResult={missingDocumentsResult}
                    legalFormLoading={!missingDocumentsLoaded}
                    legalFormError={missingDocumentsError}
                /> : _CHILD_6_LIST()}
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

                <FunDocumentManagementModal
                    open={managementModalOpen}
                    onClose={closeManagementModal}
                    documentItem={managementDocument}
                    canManage={canManageDocuments}
                    swaMsg={swaMsg}
                    onEditDocument={(digitalDoc) => {
                        set_edit_6(digitalDoc);
                    }}
                    onDeleteDocument={(digitalDoc) => {
                        delete_6(digitalDoc.id);
                    }}
                />
                <UnifiedDocumentCreateModal
                    open={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    currentItem={currentItem}
                    currentId={currentId}
                    vrList={VRList}
                    ventanillaDocs={ventanillaDocs}
                    pendingPhysicalDocs={pendingPhysicalDocs}
                    pendingLoading={!pendingPhysicalDocsLoaded}
                    saving={createDocumentsSaving}
                    onSave={saveCreatedDocuments}
                />
            </div>
        );
}

export default FUN_6_VIEW;
