import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
// SERVICES
import Submit_Service from '../../../services/submit.service'
import funService from '../../../services/fun.service';
import dayjs from 'dayjs';
import VIZUALIZER from '../../../components/vizualizer.component';
import DOCS_LIST from '../fun_forms/components/docs_list.component';
import { DOCUMENT_ORIGIN_STATE, DOCUMENT_RECEPTION_MEDIUM_OPTIONS } from '../shared/expediente-documental.constants';

import DataTable from '@/components/data-table-bridge';
import { Icon } from '@/components/icon';
import { swalClose, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

const getInitialDigitalDoc = () => ({
    code: '',
    description: '',
    pages: '',
    date: dayjs().format('YYYY-MM-DD'),
    file: null,
    originState: DOCUMENT_ORIGIN_STATE.DIGITAL,
    receptionMedium: '',
});

const getReceptionMediumLabel = (value) => DOCUMENT_RECEPTION_MEDIUM_OPTIONS.find((option) => option.value === value)?.label || '';

function SUBMIT_ANEX({ swaMsg, currentItem, refreshList: propRefreshList, refreshItem: propRefreshItem, variant = 'full', onDigitalCountChange }) {
    const [fun6, setFun6] = useState([]);
    const [digitalFormOpen, setDigitalFormOpen] = useState(false);
    const [digitalDoc, setDigitalDoc] = useState(getInitialDigitalDoc);

    const loadFun6 = useCallback(() => {
        const relatedFunId = currentItem.id_related || currentItem.id_public;
        funService.getAll_VrFun(relatedFunId, currentItem.id_public)
        .then(response => {
            setFun6(Array.isArray(response.data) ? response.data : [])
        })
        .catch(() => {
            setFun6([])
        })
    }, [currentItem.id_related, currentItem.id_public]);

    useEffect(() => {
        loadFun6();
    }, [loadFun6]);

    useEffect(() => {
        onDigitalCountChange?.(fun6.length, fun6);
    }, [fun6, onDigitalCountChange]);

    function refreshList() {
        propRefreshList();
        loadFun6();
    }

    function refreshItem(id) {
        propRefreshItem(id);
        loadFun6();
    }

    const setDigitalDocValues = (_idRef, values) => {
        setDigitalDoc((current) => ({ ...current, code: values[0] || '', description: values[1] || '' }));
    };

    const resetDigitalDoc = () => {
        setDigitalDoc(getInitialDigitalDoc());
    };

    const toggleDigitalForm = () => {
        setDigitalFormOpen((current) => {
            if (current) resetDigitalDoc();
            return !current;
        });
    };

    var formData = new FormData();

    // DATA GETTER
        let _GET_DOC = () => {
            var _CHILD = currentItem.sub_doc;
            var _VARS = {
                id: _CHILD ? _CHILD.id : 0,
                id_public: _CHILD ? _CHILD.id_public : null,
                pages: _CHILD ? _CHILD.pages : null,
                filename: _CHILD ? _CHILD.filename : null,
                path: _CHILD ? _CHILD.path : null,
            }
            return _VARS
        }
        let _GET_CURATED_URL = () => {
            let url = _GET_DOC().path + '/' + _GET_DOC().filename;
            url = url.replace("docs/submit/", "");
            return url;
        }

        let _CHILD_6_LIST = () => {
            let _LIST = fun6;
            const columns = [
                {
                    name: 'Descripción',
                    selector: row => row.description,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.description}</span>
                },
                {
                    name: 'Código',
                    selector: row => row.id_public,
                    sortable: true,
                    filterable: true,
                    maxWidth: '72px',
                    cell: row => <span className="text-xs font-mono">{row.id_public}</span>
                },
                {
                    name: 'Folios',
                    selector: row => row.pages,
                    sortable: true,
                    filterable: true,
                    maxWidth: '64px',
                    cell: row => <span className="text-xs font-mono">{row.pages}</span>
                },
                {
                    name: 'Medio',
                    selector: row => row.medio_recepcion,
                    sortable: true,
                    filterable: true,
                    maxWidth: '112px',
                    cell: row => <span className="text-xs text-muted-foreground">{getReceptionMediumLabel(row.medio_recepcion) || 'Sin registrar'}</span>
                },
                {
                    name: 'FECHA RADICACIÓN',
                    selector: row => row.date,
                    sortable: true,
                    filterable: true,
                    maxWidth: '112px',
                    cell: row => <span className="text-xs font-mono tabular-nums">{row.date}</span>
                },
                {
                    name: 'ACCIÓN',
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <VIZUALIZER url={row.path && row.filename ? `${row.path}/${row.filename}` : ''} apipath={'/files/'}
                            previewUrl={row.previewUrl}
                            downloadUrl={row.downloadUrl}
                            icon='Search'
                            iconWrapper='inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8'
                            iconStyle={{ fontSize: '150%' }} />
                    </>
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
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 40]}
                className="data-table-component"
                title={'DOCUMENTOS DIGITALIZADOS'}
                noHeader
                fixedHeader
                fixedHeaderScrollHeight="46vh"
                progressComponent={<span className='fw-normal lead text-muted'>CARGANDO...</span>}

                dense
            />
        }

        // FUNCTIONS & APIS
        let createDigitalFun6 = () => {
            const documentCode = digitalDoc.code.trim();
            const documentDescription = digitalDoc.description.trim();
            const isDigitalReception = digitalDoc.originState === DOCUMENT_ORIGIN_STATE.DIGITAL;

            if (!digitalDoc.file || !documentCode || !documentDescription || !digitalDoc.pages || Number(digitalDoc.pages) < 1 || !digitalDoc.date) {
                swalError({
                    title: 'Documento digital incompleto',
                    text: 'Debe seleccionar archivo, código, descripción, folios y fecha para crear el documento digital.',
                    icon: 'warning',
                });
                return;
            }

            if (isDigitalReception && !digitalDoc.receptionMedium) {
                swalError({
                    title: 'Medio de recepción requerido',
                    text: 'Seleccione el medio por el cual fue recibido el documento digital.',
                    icon: 'warning',
                });
                return;
            }

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            const relatedFunPublicId = currentItem.id_related || currentItem.id_public;
            const relatedFunRequest = relatedFunPublicId
                ? funService.get_fun_IdPublic(relatedFunPublicId).then((funResponse) => funResponse.data).catch(() => null)
                : Promise.resolve(null);

            relatedFunRequest
                .then(relatedFun => {
                    const creationYear = dayjs(relatedFun?.createdAt || currentItem.createdAt).format('YY');
                    const folder = relatedFun?.id_public || currentItem.id_related || currentItem.id_public;
                    const fileField = 'file_submit_digital_0';
                    let digitalFormData = new FormData();
                    digitalFormData.set('idRelated', currentItem.id_public);
                    if (relatedFun?.id) digitalFormData.set('fun0Id', relatedFun.id);

                    const rowData = {
                        selected: true,
                        documentCode,
                        documentName: documentDescription,
                        vr: currentItem.id_public,
                        pages: digitalDoc.pages,
                        date: digitalDoc.date,
                        originState: digitalDoc.originState,
                        receptionMedium: isDigitalReception ? digitalDoc.receptionMedium : '',
                        fileField,
                        uploadIndex: 0,
                    };
                    if (relatedFun?.id) rowData.fun0Id = relatedFun.id;

                    digitalFormData.set('rows', JSON.stringify([rowData]));
                    digitalFormData.append(fileField, digitalDoc.file, `fun6_${creationYear}_${folder}_${documentCode}-${digitalDoc.file.name}`);

                    return funService.createDocumentEntriesBatch(digitalFormData);
                })
                .then(response => {
                    if (!response) return;
                    if (response.data?.status === 'OK' || response.data === 'OK') {
                        swalSuccess({ title: 'Documento digital creado', text: 'El documento digital se registró correctamente.' });
                        setDigitalFormOpen(false);
                        resetDigitalDoc();
                        loadFun6();
                        return;
                    }
                    if (response.data === 'ERROR_2') {
                        swalError({ title: 'Archivo no permitido', text: 'El archivo debe ser PDF, JPG o PNG.', icon: 'warning' });
                        return;
                    }
                    swalError({ title: 'Error al crear documento digital', text: 'No fue posible crear el documento digital.', icon: 'warning' });
                })
                .catch(() => {
                    swalError({ title: 'Error al crear documento digital', text: 'No fue posible crear el documento digital.', icon: 'warning' });
                });
        }

        let addDocument = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('submitId', currentItem.id);

            let _creationYear = dayjs(currentItem.createdAt).format('YY');
            let _folder = currentItem.id_public;

            // GET DATA OF ATTACHS
            let file = document.getElementById("file_nomen");
            if (file.files[0]) {
                formData.append('file', file.files[0], "submit_" + _creationYear + "_" + _folder + "_" + file.files[0].name)
            }

            let id_public = document.getElementById("submit_anex_2").value;
            formData.set('id_public', id_public);
            let pages = document.getElementById("submit_anex_3").value;
            formData.set('pages', pages);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

            manageDoc();
        }

        let manageDoc = () => {
            if (_GET_DOC().id) {
                Submit_Service.update_anex(_GET_DOC().id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            refreshList(currentItem.id);
                        } 
                        else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            } else {
                Submit_Service.create_anex(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            refreshItem(currentItem.id);
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            }

        }

        let pdf_gen = () => {
            formData = new FormData();

            formData.set('id', currentItem.id);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            Submit_Service.gen_doc_submit(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalClose();
                        window.open(import.meta.env.VITE_API_URL + "/pdf/submit/" + "Control Ingreso Documentos " + currentItem.id_public + ".pdf");
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });

        }
        const renderPrimaryDocumentControls = () => (
            <div className="space-y-2 rounded-lg border border-border/70 bg-background p-2 text-[clamp(0.76rem,0.7rem+0.18vw,0.88rem)] shadow-sm">
                <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2">
                    <div className="min-w-0">
                        <span className="block font-semibold leading-tight text-foreground">Documento de ingreso</span>
                        <span className="block text-[0.78em] leading-snug text-muted-foreground">PDF y anexo principal de la entrada</span>
                    </div>
                    <Button variant="destructive" size="sm" className="h-8 shrink-0 px-2 text-[11px]" onClick={() => pdf_gen()}>
                        <Icon name="file-pdf" size={14} /> GENERAR PDF
                    </Button>
                </div>

                <div className="rounded-md border border-border/70 bg-muted/20 px-2 py-1.5 text-[0.82em] leading-snug text-muted-foreground">
                    {_GET_DOC().id
                        ? <span className="inline-flex items-center gap-1"><Icon name="check" size={14} className="text-success" /> Anexo registrado <VIZUALIZER url={_GET_CURATED_URL()} apipath={'/files/submit/'} /></span>
                        : <span className="inline-flex items-center gap-1"><Icon name="times" size={14} className="text-danger" /> Sin anexo</span>}
                </div>

                <form id="form_submit_anex" onSubmit={addDocument} encType="multipart/form-data" className="space-y-2">
                    <div>
                        <label htmlFor="file_nomen" className="mb-1 block text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Archivo</label>
                        <input type="file" className="form-control form-control-sm" id="file_nomen" accept="image/png, image/jpeg application/pdf" />
                    </div>
                    <div>
                        <label htmlFor="submit_anex_2" className="mb-1 block text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Consecutivo</label>
                        <input type="text" className="form-control form-control-sm" id="submit_anex_2" required defaultValue={_GET_DOC().id_public} />
                    </div>
                    <div className="max-w-[140px]">
                        <label htmlFor="submit_anex_3" className="mb-1 block text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Folios</label>
                        <input type="number" min="1" step="1" className="form-control form-control-sm" id="submit_anex_3" required defaultValue={_GET_DOC().pages} />
                    </div>
                    <Button size="sm" className="h-8 w-full justify-center text-[11px]">
                        <Icon name="edit" size={14} /> ANEXAR DOCUMENTO
                    </Button>
                </form>
            </div>
        );

        const renderDigitalDocuments = () => (
            <section className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-[clamp(0.76rem,0.7rem+0.15vw,0.88rem)]">
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-3 py-2">
                    <span className="font-semibold text-foreground">Digitales ({fun6.length})</span>
                    <Button type="button" variant={digitalFormOpen ? 'outline' : 'default'} size="sm" className="h-8 px-2 text-[11px]" onClick={toggleDigitalForm}>
                        <Icon name={digitalFormOpen ? 'XCircle' : 'PlusCircle'} size={14} />
                        {digitalFormOpen ? 'CANCELAR' : 'AGREGAR DIGITAL'}
                    </Button>
                </div>

                {digitalFormOpen
                    ? <div className="shrink-0 border-b border-border/60 bg-muted/10 p-2">
                        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[180px_minmax(260px,1fr)_minmax(220px,0.8fr)] lg:items-end">
                            <div>
                                <label htmlFor="submit_digital_doc_code_input" className="mb-1 block text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Código</label>
                                <div className="flex flex-col gap-1 sm:flex-row">
                                    <input type="text" className="form-control form-control-sm border-input bg-background text-foreground" id="submit_digital_doc_code_input" value={digitalDoc.code} onChange={(e) => setDigitalDoc((current) => ({ ...current, code: e.target.value }))} />
                                    <DOCS_LIST idRef="submit_digital_doc_code" text="Buscar" setValues={setDigitalDocValues} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="submit_digital_doc_description" className="mb-1 block text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Descripción</label>
                                <input type="text" className="form-control form-control-sm border-input bg-background text-foreground" id="submit_digital_doc_description" value={digitalDoc.description} onChange={(e) => setDigitalDoc((current) => ({ ...current, description: e.target.value }))} />
                            </div>
                            <div>
                                <label htmlFor="submit_digital_doc_file" className="mb-1 block text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Archivo</label>
                                <input type="file" className="form-control form-control-sm border-input bg-background text-foreground" id="submit_digital_doc_file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDigitalDoc((current) => ({ ...current, file: e.target.files[0] || null }))} />
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[110px_150px_minmax(170px,0.8fr)_minmax(170px,0.8fr)_minmax(150px,auto)] lg:col-span-3 lg:items-end">
                                <div>
                                    <label htmlFor="submit_digital_doc_pages" className="mb-1 block text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Folios</label>
                                    <input type="number" min="1" step="1" className="form-control form-control-sm border-input bg-background text-foreground" id="submit_digital_doc_pages" value={digitalDoc.pages} onChange={(e) => setDigitalDoc((current) => ({ ...current, pages: e.target.value }))} />
                                </div>
                                <div>
                                    <label htmlFor="submit_digital_doc_date" className="mb-1 block text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Fecha</label>
                                    <input type="date" className="form-control form-control-sm border-input bg-background text-foreground" id="submit_digital_doc_date" value={digitalDoc.date} onChange={(e) => setDigitalDoc((current) => ({ ...current, date: e.target.value }))} />
                                </div>
                                <div>
                                    <label htmlFor="submit_digital_doc_origin" className="mb-1 block text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Origen</label>
                                    <select
                                        className="form-select form-select-sm border-input bg-background text-foreground"
                                        id="submit_digital_doc_origin"
                                        value={digitalDoc.originState}
                                        onChange={(e) => setDigitalDoc((current) => ({
                                            ...current,
                                            originState: e.target.value,
                                            receptionMedium: e.target.value === DOCUMENT_ORIGIN_STATE.DIGITAL ? current.receptionMedium : '',
                                        }))}
                                    >
                                        <option value={DOCUMENT_ORIGIN_STATE.DIGITAL}>Medio digital</option>
                                        <option value={DOCUMENT_ORIGIN_STATE.SCANNED}>Escaneado</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="submit_digital_doc_medium" className="mb-1 block text-[0.78em] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Medio</label>
                                    <select
                                        className="form-select form-select-sm border-input bg-background text-foreground"
                                        id="submit_digital_doc_medium"
                                        value={digitalDoc.receptionMedium}
                                        disabled={digitalDoc.originState !== DOCUMENT_ORIGIN_STATE.DIGITAL}
                                        onChange={(e) => setDigitalDoc((current) => ({ ...current, receptionMedium: e.target.value }))}
                                    >
                                        <option value="">Sin registrar</option>
                                        {DOCUMENT_RECEPTION_MEDIUM_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                    </select>
                                </div>
                                <Button type="button" size="sm" className="h-8 justify-center px-2 text-[11px]" onClick={createDigitalFun6}>
                                    <Icon name="FilePlus" size={14} /> GUARDAR DIGITAL
                                </Button>
                            </div>
                        </div>
                    </div>
                    : null}

                <div className="min-h-0 flex-1 overflow-hidden p-2">
                    <div className="h-full min-h-0 overflow-hidden rounded-lg border border-border bg-background text-[0.76rem]">
                        {_CHILD_6_LIST()}
                    </div>
                </div>
            </section>
        );

        if (variant === 'primary') return renderPrimaryDocumentControls();
        if (variant === 'digital') return renderDigitalDocuments();

        return (
            <div className="nomenclature_anex container space-y-3">
                {renderPrimaryDocumentControls()}
                {renderDigitalDocuments()}
            </div>
        );
}

export default SUBMIT_ANEX;
