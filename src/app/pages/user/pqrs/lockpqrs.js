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
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
                setLoad(false);
            });
    }, [swaMsg]);

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

    var formData = new FormData();

        let _ATTACHS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < attachs; i++) {
                _COMPONENT.push(<div className="row d-flex justify-content-center my-2">
                    <div className="col-lg-8 col-md-8 ">
                        <label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTO ANEXO N° {i + 1}</label>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white" id="name"><Icon name="paperclip" size={16} /></span>
                            <input type="file" className="form-control" name="files_close" accept="image/png, image/jpeg application/pdf" />
                        </div>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white" id="name"><Icon name="paperclip" size={16} /></span>
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
                        <a className="btn btn-sm btn-danger mx-1" target="_blank" href={import.meta.env.VITE_API_URL + '/files/pqrs/' + row.name}><Icon name="cloud-download-alt" size={16} /></a>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => deteleAttach(row.id)}><Icon name="trash-alt" size={16} /></button>
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
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    formData = new FormData();
                    formData.set('id_master', currentItem.id);
                    formData.set('id_reply', currentItem.id_reply);
                    formData.set('time_id', currentItem.pqrs_time.id);
                    let reply_formal = document.getElementById('pqrs_formal_time').value
                    formData.set('reply_formal', reply_formal);

                    let files = document.getElementsByName("files_close");

                    formData.set('attachs_length', attachs);
                    for (var i = 0; i < attachs; i++) {
                        formData.append('file', files[i].files[0], "pqrsout_" + files[i].files[0].name)
                    }
                    let array_form = [];
                    let array_html = [];
                    array_html = document.getElementsByName("files_close_names");
                    for (var i = 0; i < array_html.length; i++) {
                        array_form.push(array_html[i].value)
                    }
                    formData.set('files_names', array_form);

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
                        });
                }
            });
        };

        let addAttachsClose = () => {
            formData = new FormData();
            formData.set('id_master', currentItem.id);
            // GET DATA OF ATTACHS
            let files = document.getElementsByName("files_close");

            formData.set('attachs_length', attachs);
            for (var i = 0; i < attachs; i++) {
                formData.append('file', files[i].files[0], "pqrsout_" + files[i].files[0].name)
            }
            let array_form = [];
            let array_html = [];
            array_html = document.getElementsByName("files_close_names");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('files_names', array_form);

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
                            <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                <label className="app-p lead fw-normal text-uppercase">INFORMACIÓN DE LA PQRS</label>
                            </legend>
                            <PQRS_COMPONENT_INFO
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                translation_form={translation_form}
                                currentItem={currentItem}
                            />
                        </fieldset>

                        <fieldset className="p-3">
                            <legend className="my-2 px-3 text-uppercase bg-warning" id="pqrs_info_1">
                                <label className="app-p lead fw-normal text-uppercase">INFORMACIÓN DE RESPUESTAS</label>
                            </legend>
                            <PQRS_COMPONENT_REPLIES_PROFESIONAL_2
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                translation_form={translation_form}
                                currentItem={currentItem}
                            />
                        </fieldset>

                        {_checkForOutputDocs()
                            ? <>
                                <legend className="my-2 px-3 text-uppercase bg-warning" id="pqrs_info_1">
                                    <label className="app-p lead fw-normal text-uppercase">DOCUMENTOS ANEXADOS POR PROFESIONAL(ES)</label>
                                </legend>
                                <PQRS_COMPONENT_ATTACH_PROFESIONAL
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                />

                            </> : ""}

                        <fieldset className="p-3">
                            <legend className="my-2 px-3 text-uppercase bg-warning" id="pqrs_info_1">
                                <label className="app-p lead fw-normal text-uppercase">RESPUESTA AL PETICIONARIO</label>
                            </legend>
                            <PQRS_COMPONENT_REPLIES_TOSOLICITOR
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                translation_form={translation_form}
                                currentItem={currentItem}
                            />
                            <legend className="my-2 px-3 text-uppercase bg-warning" id="pqrs_info_1">
                                <label className="app-p lead fw-normal text-uppercase">VISTO BUENO PROFESIONALES</label>
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
                                    <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                        <label className="app-p lead fw-normal text-uppercase">CONTROL DE TIEMPOS</label>
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
                                        <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                            <label className="app-p lead fw-normal text-uppercase">SOLICITUD RELACIONADA</label>
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
                            <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                <label className="app-p lead fw-normal text-uppercase">INFORMACIÓN DE SOLICITANTE(S)</label>
                            </legend>
                            <PQRS_COMPONENT_SOLICITORS
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                            />
                        </fieldset>

                        <fieldset className="p-3">
                            <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                <label className="app-p lead fw-normal text-uppercase">INFORMACIÓN CONTACTO(S)</label>
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

                                    <Collapsible className="bg-success" trigger={<label className="m-2 text-uppercase">Generar Documento Oficio de Respuesta</label>}>
                                        <PQRS_PDFGEN_REPLY
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                        />
                                    </Collapsible>

                                    {/**
                                     *    <Collapsible className="bg-success" trigger={<label className="m-2 text-uppercase">Generar Documento Oficio de Respuesta TEST</label>}>
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
                                                        <th><label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTOS DE CIERRE ANEXADOS</label></th>
                                                    </tr>
                                                    {_ATTACHSCLOSE_COMPONENT()}
                                                </tbody>
                                            </table>
                                            : <div className="text-start"><label className="app-p fw-bold text-uppercase text-danger">NO SE ENCONTRARON DOCUMENTOS ANEXOS DE CIERRE PARA ESA SOLICITUD</label></div>}

                                        <p className="app-p lead text-end fw-bold text-uppercase">ANEXAR DOCUMENTO DE CIERRE</p>
                                        <div className="text-end m-3">
                                            {attachs > 0
                                                ? <button type="button" className="btn btn-lg btn-secondary mx-3" onClick={() => minusAttach()}><Icon name="minus-circle" size={16} /> REMOVER ULTIMO </button>
                                                : ""}
                                            <button type="button" className="btn btn-lg btn-secondary" onClick={() => addAttach()}><Icon name="plus-circle" size={16} /> AÑADIR </button>
                                        </div>
                                        {_ATTACHS_COMPONENT()}
                                        {
                                            /**
                                             * 
                                             *    <div className="text-center m-3">
                                            {attachs > 0 ? <button type="button" className="btn btn-lg btn-warning my-2" onClick={() => addAttachsClose()}><Icon name="paperclip" size={16} /> ANEXAR {attachs} DOCUMENTOS </button> : ""}
                                        </div>
                                             */
                                        }
                                        <hr />
                                        <div className="text-center m-3">
                                            <button className="btn btn-lg btn-success" ><Icon name="lock" size={16} /> CERRAR PETICIÓN</button>
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