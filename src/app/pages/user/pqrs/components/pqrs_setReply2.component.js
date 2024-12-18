import React, { useState, useRef } from 'react'
import moment from 'moment';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import { infoCud } from '../../../../components/jsons/vars';
import JoditEditor from "jodit-pro-react";
import { dateParser } from '../../../../components/customClasses/typeParse';
import CubXVrDataService from '../../../../services/cubXvr.service'
//const moment = require('moment');

const MySwal = withReactContent(Swal);
export const PQRS_SET_REPLY1 = (props) => {
    const { currentItem } = props;

    const [state, setState] = useState({});
    const editor = useRef(null)
    const [content, setContent] = useState('')
    const funcion3 = () => {
        const x = currentItem.pqrs_solocitors.map(function (value) { return ` ${value.name}` })
        return x.join(', ');
    }
    const get_email = () => {
        const y = currentItem.pqrs_contacts.map(function (value) { return `${value.email ? value.email : ''}` }).join(', ')
        return y;
    }
    const get_address = () => {
        const y = currentItem.pqrs_contacts.map(function (value) { return `${value.address ? value.address : ''}` }).join(', ')
        return y;
    }

    const fontSize = "font-size: 12px;"

    const textdefauld = (conten) => (`
    <p style="margin-left: 150px; line-height: 1.5;"><span style="font-family: arial, helvetica, sans-serif;"><br></span></p> 
    <p style="margin-left: 80px; line-height: 1.5;"><span style="font-family: arial, helvetica, sans-serif;"><br></span></p> 
    <p style="margin-left: 80px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; ${fontSize};">${infoCud.city}, ${dateParser(moment().format('YYYY-MM-DD'))}</span></p>
    <p style="text-align: center; margin-left: 470px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; ${fontSize};"><strong>${currentItem.id_reply ?? ''}</strong></span></p>
    <p style="margin-left: 80px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; ${fontSize};, margin-left: 30px;"><strong>Peticionario: </strong></span></p>
    ${get_email() ? `<p style="margin-left: 80px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; ${fontSize};, margin-left: 30px;"><strong>${get_email()}</strong></span></p>` : ""}
    ${get_address() ? `<p style="margin-left: 80px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; ${fontSize};, margin-left: 30px;"><strong>${get_address()} </strong></span></p>` : ""}    
    <p style="margin-left: 80px; line-height: 0.5;"><strong><br></strong></p>
    <table style="margin-left: 80px; margin-right: 80px; border: none; font-family: arial, helvetica, sans-serif; ${fontSize};">
        <tr>
            <td style="width: 25%;"><strong> Radicado interno: </strong></td>
            <td> ${currentItem.id_global || currentItem.id_publico || ''} </td>
        </tr>
        <tr>
            <td><strong> Fecha de radicado: </strong></td>
            <td> ${dateParser(currentItem.pqrs_time.legal)} </td>
        </tr>
        <tr>
            <td><strong> Referencia: </strong></td>
            <td> Respuesta a petición ${currentItem.id_global || currentItem.id_publico || ''} </td>
        </tr>
        <tr>
            <td><strong> Peticionario: </strong></td>
            <td> ${funcion3()} </td>
        </tr>
        <tr>
            <td><strong> Asunto: </strong></td>
            <td> ${currentItem.content} </td>
        </tr>
        ${currentItem.pqrs_fun ? `<tr>
            <td><strong> Asociado a un proyecto: </strong></td>
            <td> ${currentItem.pqrs_fun.id_public} </td>
        </tr>`: ''}
        <tr>
            <td><strong> Término: </strong></td>
            <td> ${currentItem.pqrs_time.time} días hábiles</td>
        </tr>
    </table> 
    <p style="margin-left: 80px; line-height: 0.5;"><strong><br></strong></p> 
    <p style="margin-left: 80px; line-height: 0.5;"><strong>Cordial saludo,</strong></p> 
    <p style="margin-left: 80px; line-height: 0.5;"><strong><br></strong></p> 
    <p style="margin-left: 80px; line-height: 0.5;  font-family: arial, helvetica, sans-serif;">${conten}</p>
    <p><br></p>
    <p style="margin-left: 80px; line-height: 0.5;"><br></p>
    <p style="margin-left: 80px; line-height: 0.5;"><br></p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif; ${fontSize};">Cordialmente, </span></strong></p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif;"><strong style="font-family: arial, helvetica, sans-serif; ${fontSize};"><br></strong></span></strong></p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif;"><strong style="font-family: arial, helvetica, sans-serif; ${fontSize};"><br></strong></span></strong></p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif;"><strong style="font-family: arial, helvetica, sans-serif; ${fontSize};"><br></strong></span></strong></p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif; ${fontSize};"><strong>ARQ. </strong><strong>${infoCud.dir}</strong> </span></strong></p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif;"><strong style="font-family: arial, helvetica, sans-serif; ${fontSize};">${infoCud.job}</strong></span></strong></p>
    <p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif;"><strong style="font-family: arial, helvetica, sans-serif; ${fontSize};">Revisado por:</strong></span></strong></p>
`)

    const fgs = () => (`
    
    `)

    const [cargar, setCargar] = useState(currentItem.pqrs_info ? currentItem.pqrs_info.reply ?? textdefauld('') : textdefauld(''))

    const funcion5 = () => {
        var y = currentItem.pqrs_workers.map(function (value) { return ` ${value.reply ?? ' '} ` })
        y = y.join('.<br> ')
        setCargar(textdefauld(y))
    }




    const config = {
        readonly: false, // all options from https://xdsoft.net/jodit/doc/,
        uploader: {
            url: 'https://xdsoft.net/jodit/finder/?action=fileUpload'
        },
        filebrowser: {
            ajax: {
                url: 'https://xdsoft.net/jodit/finder/'
            },
            height: 580,
        },
        language: 'es',
        "readonly": false,
        controls: {
            lineHeight: {
                list: ([0.5, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 2, 3, 3.5])

            }
        }
    }

    const componentDidMount = () => {
        retrieveItem(props.currentId);
    }
    var retrieveItem = (id) => {
        PQRS_Service.get(id)
            .then(response => {
                setState({
                    currentItem: response.data,
                    load: true
                })
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este ítem, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
                setState({
                    load: false
                })
            });
    }

    var refreshList = () => {
        props.refreshList()
    }

    const { translation, swaMsg, globals, hardReset } = props;
    const { } = state;
    var formData = new FormData();

    // SUBMIT  NEW 1. ENTRY
    let replyPQRS = (e) => {
        e.preventDefault();
        formData = new FormData();
        formData.set('id_master', currentItem.id);
        formData.set('info_id', currentItem.pqrs_info.id);
        formData.set('time_id', currentItem.pqrs_time.id);
        console.log(currentItem.id, currentItem.pqrs_info.id, currentItem.pqrs_time.id)

        let reply_doc_date = document.getElementById("pqrs_reply_time_formalReply").value;
        if (reply_doc_date) formData.set('reply_doc_date', reply_doc_date);
        let info_reply = document.getElementById("pqrs_info_reply").value;
        formData.set('info_reply', info_reply);

        let prev_id = currentItem.id_reply;
        formData.set('prev_id', prev_id);
        let new_id = document.getElementById("pqrs_master_idreply").value;
        formData.set('new_id', new_id);

        if (new_id) {
            var array_solicitor = [];
            for (var i = 0; i < currentItem.pqrs_solocitors.length; i++) {
                array_solicitor.push(currentItem.pqrs_solocitors[i].name)
            }
            formData.set('solicitors_name', array_solicitor.join());
            
            createVRxCUB_relation(new_id);
            PQRS_Service.formalReply(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.retrieveItem(currentItem.id);
                        props.refreshList();
                        if (hardReset) {
                            //props.closeModal();
                        }

                    } else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACIÓN",
                            text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                    else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                });

        } else {
            MySwal.fire({
                title: "NO HAY CONSECUTIVO DE SALIDA",
                text: "Se debe de espeficiar primero el consecutivo de Salida.",
                icon: 'error',
            });
        }

    };

    let _GET_LAST_ID = () => {
        let new_id = "";
        PQRS_Service.getlascub()
            .then(response => {
                new_id = response.data[0].cub;
                let concecutive;
                if (response.data[0].cub == null) {
                    let res1 = infoCud.serials.end;
                    concecutive = + 1;
                    if (concecutive < 1000) concecutive = "0" + concecutive
                    if (concecutive < 100) concecutive = "0" + concecutive
                    if (concecutive < 10) concecutive = "0" + concecutive
                    new_id = res1 + (moment().format('YY')).split('-')[0] + "-" + concecutive
                    document.getElementById('pqrs_master_idreply').value = new_id;
                } else {
                    concecutive = new_id.split('-')[1];
                    concecutive = Number(concecutive) + 1
                    if (concecutive < 1000) concecutive = "0" + concecutive
                    if (concecutive < 100) concecutive = "0" + concecutive
                    if (concecutive < 10) concecutive = "0" + concecutive
                    new_id = new_id.split('-')[0] + "-" + concecutive
                    document.getElementById('pqrs_master_idreply').value = new_id;
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar el concecutivo, intentelo nuevamnte.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
            });
    }
    let createVRxCUB_relation = (cub_selected) => {
        let vr = currentItem.id_global
        let cub = cub_selected;
        let formatData = new FormData();

        formatData.set('vr', vr);
        formatData.set('cub', cub);
        formatData.set('process', 'RESPUESTA FORMAL DE LA PETICION');
        // let desc = document.getElementById('geng_type').value;
        // formatData.set('desc', desc);
        formatData.set('pqrs',1);
        let date = document.getElementById('pqrs_reply_time_formalReply').value;
        formatData.set('date', date);
        /*
        // Mostrar mensaje inicial de espera
        // MySwal.fire({
        //     title: swaMsg.title_wait,
        //     text: swaMsg.text_wait,
        //     icon: 'info',
        //     showConfirmButton: false,
        // });
        // Crear relación
        CubXVrDataService.createCubXVr(formatData)

            .then((response) => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    // Refrescar la UI
                    this.props.requestUpdate(currentItem.id, true);
                } else if (response.data === 'ERROR_DUPLICATE') {
                    MySwal.fire({
                        title: "ERROR DE DUPLICACIÓN",
                        text: `El consecutivo ya existe, debe de elegir un consecutivo nuevo`,
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                } else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
            */

    };
    var validar = currentItem.pqrs_time ? currentItem.pqrs_time.reply_doc_date : null
    return (
        <div>
            <form onSubmit={replyPQRS} id="app-formReply">

                <div className="row">
                    <div className="col-5">
                        <label className='text-start'>Consecutivo de Salida</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" defaultValue={currentItem.id_reply}
                                id="pqrs_master_idreply" require />
                            <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID()}>GENERAR</button>
                        </div>
                    </div>

                    <div className="col-3">
                        <label>Fecha creación documento</label>
                        <div class="input-group my-1 ">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="date" max="2100-01-01" class="form-control"
                                defaultValue={validar ?? moment().format('YYYY-MM-DD')}
                                id="pqrs_reply_time_formalReply" require />
                        </div>
                    </div>

                </div>

                <JoditEditor
                    ref={editor}
                    value={cargar}
                    config={config}
                    disabled={true}
                    tabIndex={1} // tabIndex of textarea
                    onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                    onChange={newContent => { }}
                    class="form-control mb-3"
                    rows="5"
                    maxlength="4096"
                    id="pqrs_info_reply"
                />

                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-3">
                            <div className="text-center m-3">
                                <button type="button" class="btn btn-sm btn-info" onClick={funcion5}><i class="fas fa-exchange-alt"></i> CARGAR INFORMACIÓN</button>
                            </div>
                        </div>
                        <div class="col-3">
                            <div className="text-center m-3">
                                <button className="btn btn-sm btn-success" ><i class="fas fa-edit"></i> GUARDAR RESPUESTA </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

        </div>
    )
}
