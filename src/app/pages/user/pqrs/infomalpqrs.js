import { useState, useEffect } from 'react';

import PQRS_Service from '../../../services/pqrs_main.service';
import PQRS_COMPONENT_INFO from './components/pqrs_gen.component';
import PQRS_COMPONENT_CLOCKS from './components/pqrs_clock.component';
import PQRS_COMPONENT_LICENCE from './components/pqrs_licence.component';
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component';

import dayjs from 'dayjs';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
function PQRSINFORMAL({ translation, swaMsg, globals, translation_form, currentId, currentItemAsign, refreshList: refreshListProp, closeModal, NAVIGATION }) {
    const [currentItem, setCurrentItem] = useState(null);
    const [load, setLoad] = useState(false);
    const [attachs, setAttachs] = useState(0);

    useEffect(() => {
        retrieveItem(currentId);
    }, []);

    const retrieveItem = (id) => {
        PQRS_Service.get(id)
            .then(response => {
                setCurrentItem(response.data);
                setLoad(true);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este ítem, inténtelo nuevamente." });
                setLoad(false);
            });
    };

    const refreshList = () => {
        refreshListProp();
    };

    const clearForm = () => {
        document.getElementById("app-formInformal").reset()
    };

    const addAttach = () => {
        setAttachs(attachs + 1);
    };

    const minusAttach = () => {
        setAttachs(attachs - 1);
    };
        var formData = new FormData();

        let _ATTACHS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < attachs; i++) {
                _COMPONENT.push(<div className="row d-flex justify-content-center my-2">
                    <div className="col-lg-8 col-md-8 ">
                        <label className="app-p lead text-start fw-normal">DOCUMENTO ANEXO N° {i + 1}</label>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                            <input type="file" className="form-control" name="files_informal" accept="image/png, image/jpeg application/pdf" />
                        </div>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                            <input type="text" className="form-control" name="files_informal_names" placeholder="Nombre documento (nombre o corta descripcion)" />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        let informalReplyPQRS = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('id', currentItemAsign);
            let reply = document.getElementById("pqrs_informal_reply").value;
            formData.set('reply', reply);
            let date_reply = document.getElementById("pqrs_informal_time").value;
            formData.set('date_reply', date_reply);
            // GET DATA OF ATTACHS
            let files = document.getElementsByName("files_informal");

            formData.set('attachs_length', attachs);
            for (var i = 0; i < attachs; i++) {
                formData.append('file', files[i].files[0], "pqrsout_" + files[i].files[0].name)
            }

            let array_form = [];
            let array_html = [];

            array_html = document.getElementsByName("files_informal_names");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('files_names', array_form);

            // Display the key/value pairs
            /*
            for (var pair of formData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
            */
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.informalReply(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                        clearForm();
                        retrieveItem(currentItem.id);
                        refreshList();
                        closeModal()
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        };
        return (
            <div>
                {currentItemAsign && currentItem
                    ? <>
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
                            <div className="row">
                                <div className="col-6">
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
                                <div className="col-6">
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

                            <form onSubmit={informalReplyPQRS} id="app-formInformal" className="py-3">

                                <legend className="my-2 px-3 Collapsible" id="pqrs_info_1">
                                    <label className="app-p lead fw-normal">RESPUESTA INFORMAL DE PETICIÓN</label>
                                </legend>
                                <p className="app-p">ESTA RESPUESTA SERÁ DADA COMO EL PROFESIONAL : <label className="fw-bold">{currentItemAsign.name}</label></p>
                                <p className="app-p">Instrucciones para dar respuesta a la solicitud: </p>
                                <ul>
                                    <li>Escribir la respuesta en la caja de texto seguida de las instrucciones.</li>
                                    <li>Incluir una breve descripción de la solicitud.</li>
                                    <li>Argumentar la respuesta, citando fuentes.</li>
                                    <li>Si el peticionario ha solicitado copia de documentos, identificarlos y enumerarlos en esta caja de texto y seguidamente anexarlos en el siguiente paso.</li>
                                    <li>Si la CUB1 no es competente orientar al peticionario y recomendar el traslado de la PQRS.</li>
                                </ul>
                                <div className="text-center m-3">
                                    <textarea className="form-control m-3" rows="5" maxlength="4096" id="pqrs_informal_reply"></textarea>
                                </div>
                                <hr className="my-3" />
                                <label className="app-p lead text-start fw-bold">ANEXAR DOCUMENTO</label>
                                <div className="text-end m-3">
                                    {attachs > 0
                                        ? <button type="button" className="btn btn-lg btn-secondary mx-3" onClick={() => minusAttach()}><Icon name="minus-circle" size={16} /> REMOVER ÚLTIMO </button>
                                        : ""}
                                    <button type="button" className="btn btn-lg btn-secondary" onClick={() => addAttach()}><Icon name="plus-circle" size={16} /> AÑADIR OTRO </button>
                                </div>
                                {_ATTACHS_COMPONENT()}

                                <hr className="my-3" />
                                <div className="row">

                                    <div className="col-lg-6 col-md-6">
                                        <input type="text" className="form-control" placeholder="  ESTA RESPUESTA A LA SOLICITUD SE DA PARA LA FECHA:" disabled />
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-primary text-primary-foreground">
                                                <Icon name="calendar-alt" size={16} />
                                            </span>
                                            <input type="date" max="2100-01-01" className="form-control" id="pqrs_informal_time" defaultValue={dayjs().format('YYYY-MM-DD')} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center py-4 mt-3">
                                    <button className="btn btn-lg btn-success"><Icon name="reply" size={16} /> RESPONDER </button>
                                </div>
                            </form></> : <fieldset className="p-3" id="fung_0">
                            <div className="text-center"> <h3 className="fw-bold text-danger">NO HA SIDO POSIBLE CARGAR LA INFORMACIÓN, INTÉNTELO NUEVAMENTE</h3></div>
                        </fieldset>}
                    </> : <fieldset className="p-3" id="fung_0">
                        <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                    </fieldset>}

                    <PQRS_MODULE_NAV
                    translation={translation}
                    currentItem={currentItem}
                    FROM={"informal"}
                    NAVIGATION={NAVIGATION}
                />
            </div>
        );
}

export default PQRSINFORMAL;