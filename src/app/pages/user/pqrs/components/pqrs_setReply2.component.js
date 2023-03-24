import React, { useState, useRef, useEffect } from 'react'
import moment from 'moment';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import { infoCud } from '../../../../components/jsons/vars';
import JoditEditor from "jodit-pro-react";
import { dateParser } from '../../../../components/customClasses/typeParse';
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
    const funcion4 = () => {
        const y = currentItem.pqrs_contacts.map(function (value) { return ` ${value.email ? value.email : value.address ? value.address : ''} ` })
        return y;
    }


    const textdefauld = (conten) => (`
    <p style="margin-left: 150px; line-height: 1.5;"><span style="font-family: arial, helvetica, sans-serif;"><br></span></p> <p
    style="margin-left: 80px; line-height: 1.5;"><span style="font-family: arial, helvetica, sans-serif;"><br></span></p> <p
     style="margin-left: 80px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; font-size: 14px; ">${infoCud.city}, ${dateParser(moment().format('YYYY-MM-DD'))}</span></p><p style="text-align: center; margin-left: 470px; line-height: 0.5;"><span style="font-family: arial,
       helvetica, sans-serif; font-size: 14px;"><strong>${currentItem.id_reply ?? ''}</strong></span></p><p style="margin-left: 80px; line-height: 0.5;"><span
        style="font-family: arial, helvetica, sans-serif; font-size: 14px;, margin-left: 30px;"><strong>Peticionario: </strong></span></p><p
         style="margin-left: 80px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; font-size: 14px;, margin-left:
          30px;"><strong>${funcion3()}</strong></span></p><p style="margin-left: 80px; line-height: 0.5;"><strong>${funcion4()}
           </strong></p><p style="margin-left: 80px; line-height: 0.5;"><strong><br></strong></p> <p style="margin-left: 80px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; font-size: 14px;"><strong style="font-size: 14px;"><br></strong></span></p><p style="margin-left: 80px; line-height: 0.5;"><span style="font-family: arial, helvetica, sans-serif; font-size: 14px;"><strong style="font-size: 14px;">Asunto:</strong><strong>&nbsp;Respuesta a su petición ${currentItem.id_global || currentItem.id_publico || ''}</strong></span></p><p style="margin-left: 80px; line-height: 0.5;"><br></p><p style="margin-left: 80px; line-height: 0.5;"><br></p><p style="margin-left: 80px; line-height: 0.5;">${conten}</p><p><br></p><p style="margin-left: 80px; line-height: 0.5;"><br></p><p style="margin-left: 80px; line-height: 0.5;"><br></p><p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif; font-size: 14px;">Cordialmente, </span></strong></p><p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif;"><strong style="font-family: arial, helvetica, sans-serif; font-size: 14px;"><br></strong></span></strong></p><p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif;"><strong style="font-family: arial, helvetica, sans-serif; font-size: 14px;"><br></strong></span></strong></p><p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif;"><strong style="font-family: arial, helvetica, sans-serif; font-size: 14px;"><br></strong></span></strong></p><p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif; font-size: 14px;"><strong>ARQ. </strong><strong>${infoCud.dir}</strong> </span></strong></p><p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif;"><strong style="font-family: arial, helvetica, sans-serif; font-size: 14px;">${infoCud.job}</strong></span></strong></p><p style="margin-left: 80px; line-height: 0.5;"><strong><span style="font-family: arial, helvetica, sans-serif;"><strong style="font-family: arial, helvetica, sans-serif; font-size: 14px;">Revisado por:</strong></span></strong></p><p><br></p>
    `)

    const fgs = ()=>(`
    
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
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
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

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
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
                            title: "ERROR DE DUPLICACION",
                            text: "El concecutivo de radicado de este formulario ya existe, debe de elegir un concecutivo nuevo",
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
                title: "NO HAY CONCECUTIVO DE SALIDA",
                text: "Se debe de espeficiar primero el concecutivo de Salida.",
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
    var validar = currentItem.pqrs_time  ? currentItem.pqrs_time.reply_doc_date : null
    return (
        <div>
            <form onSubmit={replyPQRS} id="app-formReply">

                <div className="row">
                    <div className="col-6">
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

                    <div className="col-6">
                        <label>Fecha creacion documento</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="date" max="2100-01-01" class="form-control"
                                defaultValue={validar ?? moment().format('YYYY-MM-DD')}
                                id="pqrs_reply_time_formalReply" require />
                        </div>
                    </div>

                </div>

                <label>Respuesta de Oficio (Máximo 4000 Caracteres)</label>
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
                                <button type="button" class="btn btn-sm btn-info" onClick={funcion5}><i class="fas fa-exchange-alt"></i> CARGAR INFORMACION</button>
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
