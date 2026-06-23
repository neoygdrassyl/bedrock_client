import { useState, useEffect, useCallback } from 'react';

import PQRS_Service from '../../../services/pqrs_main.service';
import DataTable from '@/components/data-table-bridge';
import PQRS_COMPONENT_REPLIES_PROFESIONAL_2 from './components/pqrs_replies_3.component';
import PQRS_COMPONENT_INFO from './components/pqrs_gen.component';
import PQRS_COMPONENT_CLOCKS from './components/pqrs_clock.component';
import PQRS_COMPONENT_LICENCE from './components/pqrs_licence.component';
import PQRS_COMPONENT_SOLICITORS from './components/pqrs_solicitors.component';
import PQRS_COMPONENT_CONTACTS from './components/pqrs_contancts.component';
import PQRS_COMPONENT_ATTACH_PROFESIONAL from './components/pqrs_attach_pro.component';
import PQRS_COMPONENT_REPLIES_TOSOLICITOR from './components/pqrs_replies_2.component';
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component';
import PQRS_COMPONENT_WORKER_FEEDBACK from './components/pqrs_worker_feedback.component';
import PQRS_EMAILS from './components/pqrs_emails.component';
import PQRS_PDFGEN_REPLY from './components/pqrs_genPDF_reply.component';
import RTE_PQRS from './components/pqrs_rteReply.component';
import Collapsible from '../../../components/Collapsible';

import dayjs from 'dayjs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
function PQRSLOCK({ currentId, translation, swaMsg, globals, translation_form, refreshList: propRefreshList, NAVIGATION }) {
    const [attachs, setAttachs] = useState(0);
    const [attachsForEmails, setAttachsForEmails] = useState(0);
    const [edit, setEdit] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [load, setLoad] = useState(undefined);

    const retrieveItem = useCallback((id) => {
        PQRS_Service.get(id)
            .then(response => {
                setCurrentItem(response.data);
                setLoad(true);
            })
            .catch(e => {
                console.log(e);
                const message = "No ha sido posible cargar este item, intentelo nuevamente.";
                swalError({
                    title: "ERROR AL CARGAR",
                    text: message,
                    reportContext: buildCloseReportContext(message, 'pqrs-close-load'),
                });
                setLoad(false);
            });
    }, [currentId, swaMsg]);

    useEffect(() => {
        retrieveItem(currentId);
    }, [currentId, retrieveItem]);

    const refreshList = () => {
        propRefreshList();
    };

    const clearForm = () => {
        document.getElementById("app-formReply").reset();
    };

    const addAttach = () => {
        setAttachs(prev => prev + 1);
    };

    const minusAttach = () => {
        setAttachs(prev => prev - 1);
    };

    const addAttachEmail = () => {
        setAttachsForEmails(prev => prev + 1);
    };

    const minusAttachEmail = () => {
        setAttachsForEmails(prev => prev - 1);
    };

    const buildCloseReportContext = useCallback((message, source = 'pqrs-close') => ({
        expediente: {
            radicado: currentItem?.id_publico || currentItem?.id_global || String(currentItem?.id || currentId || ''),
            identifiers: {
                id: currentItem?.id ?? currentId ?? null,
                idPublico: currentItem?.id_publico ?? null,
                idGlobal: currentItem?.id_global ?? null,
            },
        },
        lastError: {
            source,
            error: { message },
        },
    }), [currentId, currentItem]);

    const collectCloseAttachments = useCallback(() => {
        const fileInputs = Array.from(document.getElementsByName("files_close"));
        const nameInputs = Array.from(document.getElementsByName("files_close_names"));
        const attachments = [];

        for (let index = 0; index < attachs; index += 1) {
            const file = fileInputs[index]?.files?.[0];
            const publicName = nameInputs[index]?.value?.trim() || '';

            if (!file && !publicName) {
                continue;
            }

            if (!file) {
                return { error: 'Cada documento de cierre agregado debe incluir un archivo antes de continuar.' };
            }

            attachments.push({ file, publicName });
        }

        return { attachments };
    }, [attachs]);

    const appendCloseAttachments = useCallback((nextFormData, attachments = []) => {
        nextFormData.set('attachs_length', attachments.length);
        nextFormData.set('files_names', attachments.map((attachment) => attachment.publicName));

        attachments.forEach(({ file }) => {
            nextFormData.append('file', file, `pqrsout_${file.name}`);
        });
    }, []);

    var formData = new FormData();

        let _ATTACHS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < attachs; i++) {
                _COMPONENT.push(<div key={`lock-attach-${i}`} className="row d-flex justify-content-center my-2">
                    <div className="col-lg-8 col-md-8 ">
                        <label className="app-p lead text-start fw-normal">DOCUMENTO ANEXO N° {i + 1}</label>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                            <input type="file" className="form-control" name="files_close" accept="image/png, image/jpeg application/pdf" />
                        </div>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                            <input type="text" className="form-control" name="files_close_names" placeholder="Nombre documento (nombre o corta descripcion)" />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        let _ATTACHSCLOSE_COMPONENT = () => {
            var _LIST = [];
            for (var i = 0; i < currentItem.pqrs_attaches.length; i++) {
                if (currentItem.pqrs_attaches[i].class == 2) {
                    _LIST.push(currentItem.pqrs_attaches[i]);
                }
            }
            const columns = [
                {
                    name: <h3>NOMBRE</h3>,
                    selector: row => row.name,
                    sortable: true,
                    filterable: true,
                    cell: row => <p className="pt-3 text-center">{row.public_name}</p>
                },
                {
                    name: <h3>TIPO</h3>,
                    selector: row => row.type,
                    sortable: true,
                    filterable: true,
                    cell: row => <p className="pt-3">{row.type}</p>
                },
                {
                    name: <h3>ACCIÓN</h3>,
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <a className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-7 px-2 mx-1" target="_blank" href={import.meta.env.VITE_API_URL + '/files/pqrs/' + row.name}><Icon name="cloud-download-alt" size={16} /></a>
                        <Button variant="destructive" size="sm" onClick={() => deteleAttach(row.id)}><Icon name="trash-alt" size={16} /></Button>
                    </>,
                },
            ]
            var _COMPONENT = <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay mensajes"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={20}
                paginationRowsPerPageOptions={[20, 50, 100]}
                className="data-table-component"
                noHeader
            />
            return <>{_COMPONENT}</>;
        }
        let _REPLIES_COUNTER_COMPONENT = () => {
            var counter = 0;
            for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
                if (currentItem.pqrs_workers[i].reply) {
                    counter++;
                }
            }
            return counter;
        }
        let _checkForOutputDocs = () => {
            for (var i = 0; i < currentItem.pqrs_attaches.length; i++) {
                if (currentItem.pqrs_attaches[i].class == 1) {
                    return true;
                }
            }
            return false;
        }
        let _checkForOutputDocsClass2 = () => {
            for (var i = 0; i < currentItem.pqrs_attaches.length; i++) {
                if (currentItem.pqrs_attaches[i].class == 2) {
                    return true;
                }
            }
            return false;
        }

        let lockPQRS = (e) => {
            e.preventDefault();
            swalConfirm({ title: "CERRAR PETICION ", text: "¿Esta seguro de cerrar esta peticion?", icon: 'warning', confirmButtonText: "CERRAR" }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    if (!currentItem?.id) {
                        const message = "No ha sido posible cargar este item, intentelo nuevamente.";
                        swalError({
                            title: "ERROR AL CARGAR",
                            text: message,
                            reportContext: buildCloseReportContext(message, 'pqrs-close-load'),
                        });
                        return;
                    }

                    const { attachments, error: attachmentError } = collectCloseAttachments();
                    if (attachmentError) {
                        swalError({
                            title: 'ANEXOS INCOMPLETOS',
                            text: attachmentError,
                            allowReport: true,
                            reportContext: buildCloseReportContext(attachmentError, 'pqrs-close-validation'),
                        });
                        return;
                    }

                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    formData = new FormData();
                    formData.set('id_master', currentItem.id);
                    formData.set('id_reply', currentItem.id_reply ?? 0);

                    if (currentItem?.pqrs_time?.id) {
                        formData.set('time_id', currentItem.pqrs_time.id);
                    }

                    const reply_formal = document.getElementById('pqrs_formal_time')?.value?.trim() || '';
                    if (reply_formal) {
                        formData.set('reply_formal', reply_formal);
                    }
                    appendCloseAttachments(formData, attachments);

                    PQRS_Service.close(formData)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                                retrieveItem(currentItem.id)
                                refreshList()
                            } else {
                                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            const message = e?.response?.data?.message || 'No fue posible cerrar la PQRS. Inténtelo nuevamente.';
                            swalError({
                                title: 'ERROR AL CERRAR',
                                text: message,
                                allowReport: true,
                                reportContext: buildCloseReportContext(message, 'pqrs-close-request'),
                            });
                        });
                }
            });
        };

        let addAttachsClose = () => {
            if (!currentItem?.id) {
                const message = "No ha sido posible cargar este item, intentelo nuevamente.";
                swalError({
                    title: "ERROR AL CARGAR",
                    text: message,
                    reportContext: buildCloseReportContext(message, 'pqrs-close-load'),
                });
                return;
            }

            const { attachments, error: attachmentError } = collectCloseAttachments();
            if (attachmentError) {
                swalError({
                    title: 'ANEXOS INCOMPLETOS',
                    text: attachmentError,
                    allowReport: true,
                    reportContext: buildCloseReportContext(attachmentError, 'pqrs-close-validation'),
                });
                return;
            }

            formData = new FormData();
            formData.set('id_master', currentItem.id);
            appendCloseAttachments(formData, attachments);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.addAttachsClose(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                        retrieveItem(currentItem.id)
                        setAttachs(0);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    const message = e?.response?.data?.message || 'No fue posible anexar los documentos de cierre. Inténtelo nuevamente.';
                    swalError({
                        title: 'ERROR AL ANEXAR',
                        text: message,
                        allowReport: true,
                        reportContext: buildCloseReportContext(message, 'pqrs-close-attachments'),
                    });
                });
        }

        let deteleAttach = (id) => {
            swalConfirm({ title: "ELIMINAR ITEM", text: "¿Esta seguro de eliminar este item de forma permanente?", icon: 'warning', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    PQRS_Service.deleteAttach(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                                retrieveItem(currentItem.id)
                            } else {
                                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                        });
                }
            });
        }
        return (
            <div>
                {currentItem != null ? <>
                    {load ? <>
                        <fieldset className="p-3">
                            <legend className="my-2 px-3 Collapsible" id="pqrs_info_1">
                                <label className="app-p lead fw-normal">INFORMACIÓN DE LA PQRS</label>
                            </legend>
                            <PQRS_COMPONENT_INFO
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                translation_form={translation_form}
                                currentItem={currentItem}
                            />
                        </fieldset>

                        <fieldset className="p-3">
                            <legend className="my-2 px-3 bg-warning" id="pqrs_info_1">
                                <label className="app-p lead fw-normal">INFORMACIÓN DE RESPUESTAS</label>
                            </legend>
                            <PQRS_COMPONENT_REPLIES_PROFESIONAL_2
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                translation_form={translation_form}
                                currentItem={currentItem}
                            />
                        </fieldset>

                        {_checkForOutputDocs()
                            ? <>
                                <legend className="my-2 px-3 bg-warning" id="pqrs_info_1">
                                    <label className="app-p lead fw-normal">DOCUMENTOS ANEXADOS POR PROFESIONAL(ES)</label>
                                </legend>
                                <PQRS_COMPONENT_ATTACH_PROFESIONAL
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                />

                            </> : ""}

                        <fieldset className="p-3">
                            <legend className="my-2 px-3 bg-warning" id="pqrs_info_1">
                                <label className="app-p lead fw-normal">RESPUESTA AL PETICIONARIO</label>
                            </legend>
                            <PQRS_COMPONENT_REPLIES_TOSOLICITOR
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                translation_form={translation_form}
                                currentItem={currentItem}
                            />
                            <legend className="my-2 px-3 bg-warning" id="pqrs_info_1">
                                <label className="app-p lead fw-normal">VISTO BUENO PROFESIONALES</label>
                            </legend>
                            <PQRS_COMPONENT_WORKER_FEEDBACK
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                                retrieveItem={retrieveItem}
                                refreshList={refreshList}
                            />
                        </fieldset>

                        <div className="row p-0 x-0">
                            <div className="col-6 p-0 x-0">
                                <fieldset className="p-3">
                                    <legend className="my-2 px-3 Collapsible" id="pqrs_info_1">
                                        <label className="app-p lead fw-normal">CONTROL DE TIEMPOS</label>
                                    </legend>
                                    <PQRS_COMPONENT_CLOCKS
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                    />
                                </fieldset>
                            </div>
                            <div className="col-6 p-0 x-0">
                                {currentItem.pqrs_fun ?
                                    <fieldset className="p-3">
                                        <legend className="my-2 px-3 Collapsible" id="pqrs_info_1">
                                            <label className="app-p lead fw-normal">SOLICITUD RELACIONADA</label>
                                        </legend>
                                        <PQRS_COMPONENT_LICENCE
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                        />
                                    </fieldset>
                                    : ""}
                            </div>
                        </div>

                        <fieldset className="p-3">
                            <legend className="my-2 px-3 Collapsible" id="pqrs_info_1">
                                <label className="app-p lead fw-normal">INFORMACIÓN DE SOLICITANTE(S)</label>
                            </legend>
                            <PQRS_COMPONENT_SOLICITORS
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                            />
                        </fieldset>

                        <fieldset className="p-3">
                            <legend className="my-2 px-3 Collapsible" id="pqrs_info_1">
                                <label className="app-p lead fw-normal">INFORMACIÓN CONTACTO(S)</label>
                            </legend>
                            <PQRS_COMPONENT_CONTACTS
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                            />
                        </fieldset>
                        {window.user.roleId == 5 || window.user.roleId == 1  || window.user.roleId == 2
                            ? <>
                                <>
                                    <hr />

                                    <p className="app-p text-center fw-bold">ENVIAR RESPUESTA(S)</p>
                                    <p className="app-p">GUÍA PARA ENVIAR LA RESPUESTA POR EMAIL</p>
                                    <ul>
                                        <li className="app-p">Verifique el Oficio de la respuesta, y anexelo en la caja de anexos para el email.</li>
                                        <li className="app-p">Escriba el cuerpo del email.</li>
                                        <li className="app-p">Verifique los correos a los que se enviará el email, es posible añadir o quitar correos de la lista separándoles por coma (,)</li>
                                    </ul>

                                    <Collapsible className="bg-success" trigger={<label className="m-2">Generar Documento Oficio de Respuesta</label>}>
                                        <PQRS_PDFGEN_REPLY
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                        />
                                    </Collapsible>

                                    {/**
                                     *    <Collapsible className="bg-success" trigger={<label className="m-2">Generar Documento Oficio de Respuesta TEST</label>}>
                                        <RTE_PQRS translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem} />
                                    </Collapsible>
                                     * 
                                     */}
                                 

                                    <div className="my-2 p-2">
                                        <PQRS_EMAILS
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            email_types={[3]}
                                            refreshCurrentItem={retrieveItem}
                                            attachs={true}
                                        />
                                    </div>
                                    <form onSubmit={lockPQRS} id="app-formReply">
                                        <hr />
                                        <p className="app-p text-center fw-bold">CERRAR PETICIÓN</p>
                                        <p className="app-p">GUIÁ PARA EL CIERRE DE LA PETICIÓN</p>
                                        <ul>
                                            <li className="app-p">Asegurar envío con copia del email o guiá de envío de recibido por parte del peticionario, digitalizar y anexar.</li>
                                            <li className="app-p">Digitalizar Copias de los correos y anexos enviados al documento de respuesta.</li>
                                        </ul>
                                        {_checkForOutputDocsClass2()
                                            ? <table className="table table-sm table-hover table-bordered">
                                                <tbody>
                                                    <tr className="bg-warning">
                                                        <th><label className="app-p lead text-start fw-normal">DOCUMENTOS DE CIERRE ANEXADOS</label></th>
                                                    </tr>
                                                    {_ATTACHSCLOSE_COMPONENT()}
                                                </tbody>
                                            </table>
                                            : <div className="text-start"><label className="app-p fw-bold text-danger">NO SE ENCONTRARON DOCUMENTOS ANEXOS DE CIERRE PARA ESA SOLICITUD</label></div>}

                                        <p className="app-p lead text-end fw-bold">ANEXAR DOCUMENTO DE CIERRE</p>
                                        <div className="text-end m-3">
                                            {attachs > 0
                                                ? <Button type="button" variant="outline" size="sm" className="mx-3" onClick={() => minusAttach()}><Icon name="minus-circle" size={14} /> Remover último</Button>
                                                : ""}
                                            <Button type="button" variant="outline" size="sm" onClick={() => addAttach()}><Icon name="plus-circle" size={14} /> Añadir</Button>
                                        </div>
                                        {_ATTACHS_COMPONENT()}
                                        {
                                            /**
                                             * 
                                             *    <div className="text-center m-3">
                                            {attachs > 0 ? <Button type="button" size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 my-2" onClick={() => addAttachsClose()}><Icon name="paperclip" size={14} /> Anexar {attachs} documentos</Button> : ""}
                                        </div>
                                             */
                                        }
                                        <hr />
                                        <div className="text-center m-3">
                                            <Button size="sm"><Icon name="lock" size={14} /> Cerrar petición</Button>
                                        </div>

                                    </form> </>
                            </> : ""}
                    </> : <fieldset className="p-3" id="fung_0">
                        <div className="text-center"> <h3 className="fw-bold text-danger">NO HA SIDO POSIBLE CARGAR LA INFORMACIÓN, INTENTELO NUEVAMENTE</h3></div>
                    </fieldset>}

                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                </fieldset>}

                <PQRS_MODULE_NAV
                    translation={translation}
                    currentItem={currentItem}
                    FROM={"lock"}
                    NAVIGATION={NAVIGATION}
                />
            </div>
        );
}

export default PQRSLOCK;
