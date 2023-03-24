import React, { Component } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import { dateParser } from '../../../../components/customClasses/typeParse'
import { cities } from '../../../../components/jsons/vars';


const moment = require('moment');
const MySwal = withReactContent(Swal);
class PQRS_PDFGEN_CONFIRM extends Component {
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
        let get_PQRS_TIME = () => {
            if (currentItem.pqrs_time) return currentItem.pqrs_time;
            return {
                creation: '',
                creation: false, 
                time: 30,
            }
        }

        // DATA CONVERTERS
        let _GET_DOC_BODY = () => {
            let pTime = get_PQRS_TIME();
            return `Me permite Comunicarle que el ${moment(pTime.creation, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD')} 
            a las ${moment(pTime.creation, 'YYYY-MM-DD HH:mm').format('HH:mm')} se ha registrado con éxito su
            Solicitud con el número ${currentItem.id_publico}. A partir de este momento la Curaduría Urbana Estudiará
            su petición y en el término de ${pTime.time} días hábiles le dará respuesta de manera clara, precisa y
            de fondo. No obstante de requerir un mayor término para lograr este cometido la Curaduría
            Urbana Uno de Bucaramanga le informará por este medio de esta situación.`.replace(/[\n\r]+ */g, ' ');

        }

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


        // COMPONENT JSX
        let _GEN_CONFIRM_PDF_COMPONENT = () => {
            return <>
                <div className="p-2">
                    <div className="row">
                        <div className="col-4">
                            <label>Fecha Documento</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-calendar-alt"></i>
                                </span>
                                <input type="date" max="2100-01-01" class="form-control" id="pqrs_confirmation_date"
                                    defaultValue={moment().format('YYYY-MM-DD')} required />
                            </div>
                        </div>
                        <div className="col-4">
                            <label>Consecutivo</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" id="pqrs_confirmation_id_public"
                                    defaultValue={currentItem.id_publico} disabled />
                            </div>
                        </div>
                        <div className="col">
                            <label className="mt-1">Ciudad</label>
                            <div class="input-group">
                                <select class="form-select me-1" id={"pqrs_confirmation_city"}>
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
                                <input list="titles" class="form-select" id="pqrs_confirmation_titles" />
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
                                    defaultValue={_getSolicitorlList()} id="pqrs_confirmation_solicitor_list" />
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
                                    defaultValue={_getEmailList()} id="pqrs_confirmation_email_list" />
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
                                    defaultValue={_getAdresslList()} id="pqrs_confirmation_address_list" />
                            </div>
                        </div>
                    </div>

                    <label>Cuerpo del Documento</label>
                    <textarea class="form-control mb-3" rows="3" maxlength="1024" id="pqrs_confirmation_doc_body"
                        defaultValue={_GET_DOC_BODY()}></textarea>
                    <table className="table table-sm table-hover table-bordered">
                        <tbody>
                            <tr>
                                <th><label className="app-p">Generar y descargar documento de confirmación.</label></th>
                                <td>
                                    <i class="fas fa-cloud-download-alt fa-2x" onClick={() => request_dpfConfirmation()} style={{ color: "Crimson" }}></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </>
        }

        // FUNCTIONS & APIS
        let request_dpfConfirmation = () => {
            formData = new FormData();

            let title = document.getElementById("pqrs_confirmation_titles").value;
            formData.set('title', title);
            let addresses = document.getElementById("pqrs_confirmation_address_list").value;
            formData.set('addresses', addresses);
            let solicitors = document.getElementById("pqrs_confirmation_solicitor_list").value;
            formData.set('solicitors', solicitors);
            let emails = document.getElementById("pqrs_confirmation_email_list").value;
            formData.set('emails', emails);
            let body = document.getElementById("pqrs_confirmation_doc_body").value;
            formData.set('body', body);

            let date = document.getElementById("pqrs_confirmation_date").value;
            formData.set('date', date);
            let id_public = document.getElementById("pqrs_confirmation_id_public").value;
            formData.set('id_public', id_public);
            let city = document.getElementById("pqrs_confirmation_city").value;
            formData.set('city', city);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.request_pdfConfirmation(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/reply/" + "Oficio_Confirmacion_" + currentItem.id_publico + ".pdf");
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
                {_GEN_CONFIRM_PDF_COMPONENT()}
            </div>
        );
    }
}

export default PQRS_PDFGEN_CONFIRM;