import React, { Component } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import { dateParser } from '../../../../components/customClasses/typeParse'
import { cities } from '../../../../components/jsons/vars';


const moment = require('moment');
const MySwal = withReactContent(Swal);
class PQRS_PDFGEN_REPLY extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;
        var formData = new FormData();

        // DATA GETTERS 

        // DATA CONVERTERS
        let _getEmailList = () => {
            var array_contact_list = [];
            for (var i = 0; i < currentItem.pqrs_contacts.length; i++) {
                if (currentItem.pqrs_contacts[i].notify) array_contact_list.push(currentItem.pqrs_contacts[i].email)
            }
            return array_contact_list.join();
        }
        let _getSolicitorlList = () => {
            var array_list = [];
            for (var i = 0; i < currentItem.pqrs_solocitors.length; i++) {
                array_list.push(currentItem.pqrs_solocitors[i].name)
            }
            return array_list.join();
        }
        let _getAdresslList = () => {
            var array_list = [];
            for (var i = 0; i < currentItem.pqrs_contacts.length; i++) {
                if (currentItem.pqrs_contacts[i].notify) array_list.push(currentItem.pqrs_contacts[i].address)
            }
            return array_list.join();
        }
        let _getWorkersIds = () => {
            var array_list = [];
            for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
                array_list.push(currentItem.pqrs_workers[i].worker_id)
            }
            return array_list.join();
        }
        let _getWorkersFeeback = () => {
            var array_list = [];
            for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
                array_list.push(currentItem.pqrs_workers[i].feedback)
            }
            return array_list.join();
        }
        // COMPONENT JSX
        let _GEN_REPLY_PDF_COMPONENT = () => {
            return <>
                <div className="p-2">
                    <div className="row">
                        <div className="col">
                            <label>Fecha Documento</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-calendar-alt"></i>
                                </span>
                                <input type="date" max="2100-01-01" class="form-control" id="pqrs_reply_date" 
                                defaultValue={moment().format('YYYY-MM-DD')} required />
                            </div>
                        </div>
                        <div className="col">
                            <label>Consecutivo Entrada</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" id="pqrs_reply_id_public" 
                                defaultValue={currentItem.id_publico} disabled />
                            </div>
                        </div>
                        <div className="col">
                            <label>Consecutivo Salida</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" id="pqrs_reply_id_reply" 
                                defaultValue={currentItem.id_reply} disabled />
                            </div>
                        </div>
                        <div className="col">
                            <label className="mt-1">Ciudad</label>
                            <div class="input-group">
                                <select class="form-select me-1" id={"pqrs_reply_city"}>
                                    {cities}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-4">
                            <label>Titulo referido</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                <i class="far fa-user"></i>
                                </span>
                                <input list="titles" class="form-select" id="pqrs_reply_titles" />
                                <datalist id="titles">
                                    <option value="Señor" />
                                    <option value="Señora" />
                                    <option value="Señores" />
                                    <option value="Señoras" />
                                    <option value="Peticionario" />
                                    <option value="Peticionaria" />
                                    <option value="Peticionarios" />
                                    <option value="Peticionarias" />
                                    <option value="Dr." />
                                    <option value="Dra." />
                                </datalist>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <label>Lista de Solicitantes</label>
                            <div class="input-group my-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-user"></i>
                                </span>
                                <input type="text" class="form-control" placeholder="Lista de Solicitantes" 
                                defaultValue={_getSolicitorlList()} id="pqrs_reply_solicitor_list" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <label>Lista de Correos</label>
                            <div class="input-group my-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-envelope"></i>
                                </span>
                                <input type="text" class="form-control" placeholder="Lista de Correos" 
                                defaultValue={_getEmailList()} id="pqrs_reply_email_list" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <label>Lista de Direcciones</label>
                            <div class="input-group my-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-home"></i>
                                </span>
                                <input type="text" class="form-control" placeholder="Lista de Correos" 
                                defaultValue={_getAdresslList()} id="pqrs_reply_address_list" />
                            </div>
                        </div>
                    </div>

                    <label>Cuerpo del Documento</label>
                    <textarea class="form-control mb-3" rows="3" maxlength="1024" id="pqrs_reply_doc_body"
                        defaultValue={currentItem.pqrs_info.reply}></textarea>
                    <table className="table table-sm table-hover table-bordered">
                        <tbody>
                            <tr>
                                <th><label className="app-p">Generar y descargar oficio de respuesta.</label></th>
                                <td><i class="fas fa-cloud-download-alt fa-2x" onClick={() => request_dpf()} style={{color: "Crimson"}}></i></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </>
        }

        // FUNCTIONS & APIS
        let request_dpf = () => {
            formData = new FormData();

            formData.set('workers_id', _getWorkersIds());
            formData.set('workers_feedback', _getWorkersFeeback());
            let title = document.getElementById("pqrs_reply_titles").value;
            formData.set('title', title);
            let addresses = document.getElementById("pqrs_reply_address_list").value;
            formData.set('addresses', addresses);
            let solicitors = document.getElementById("pqrs_reply_solicitor_list").value;
            formData.set('solicitors', solicitors);
            let emails = document.getElementById("pqrs_reply_email_list").value;
            formData.set('emails', emails);
            let body = document.getElementById("pqrs_reply_doc_body").value;
            formData.set('body', body);

            let date = document.getElementById("pqrs_reply_date").value;
            formData.set('date', date);
            let id_reply = document.getElementById("pqrs_reply_id_reply").value;
            formData.set('id_reply', id_reply);
            formData.set('id_publico', currentItem.id_publico);
            let city = document.getElementById("pqrs_reply_city").value;
            formData.set('city', city);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.request_pdfReply(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/reply/" + "Oficio_" + currentItem.id_reply + ".pdf");
                    } else {
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
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }
        return (
            <div className="pb-2">
                {_GEN_REPLY_PDF_COMPONENT()}
            </div>
        );
    }
}

export default PQRS_PDFGEN_REPLY;