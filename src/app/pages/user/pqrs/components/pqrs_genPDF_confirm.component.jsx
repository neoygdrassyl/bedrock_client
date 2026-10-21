
import PQRS_Service from '../../../../services/pqrs_main.service';
import { dateParser } from '../../../../components/customClasses/typeParse'
import { cities } from '../../../../components/jsons/vars';

import dayjs from 'dayjs';
import { Icon } from '@/components/icon';
import { swalClose, swalError, swalLoading } from '@/app/utils/swalAdapter';
import { downloadProtectedPdf } from '@/app/utils/pdfDownload';
function PQRS_PDFGEN_CONFIRM({ translation, swaMsg, globals, currentItem }) {
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
            return `Me permite Comunicarle que el ${dayjs(pTime.creation, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD')} 
            a las ${dayjs(pTime.creation, 'YYYY-MM-DD HH:mm').format('HH:mm')} se ha registrado con éxito su
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
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="calendar-alt" size={16} />
                                </span>
                                <input type="date" max="2100-01-01" className="form-control" id="pqrs_confirmation_date"
                                    defaultValue={dayjs().format('YYYY-MM-DD')} required />
                            </div>
                        </div>
                        <div className="col-4">
                            <label>Consecutivo</label>
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="hashtag" size={16} />
                                </span>
                                <input type="text" className="form-control" id="pqrs_confirmation_id_public"
                                    defaultValue={currentItem.id_publico} disabled />
                            </div>
                        </div>
                        <div className="col">
                            <label className="mt-1">Ciudad</label>
                            <div className="input-group">
                                <select className="form-select me-1" id={"pqrs_confirmation_city"}>
                                    {cities}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-4">
                            <label>Titulo referido</label>
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="user" size={16} />
                                </span>
                                <input list="titles" className="form-select" id="pqrs_confirmation_titles" />
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
                            <div className="input-group my-1">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="user" size={16} />
                                </span>
                                <input type="text" className="form-control" placeholder="Lista de Solicitantes"
                                    defaultValue={_getSolicitorlList()} id="pqrs_confirmation_solicitor_list" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <label>Lista de Correos</label>
                            <div className="input-group my-1">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="envelope" size={16} />
                                </span>
                                <input type="text" className="form-control" placeholder="Lista de Correos"
                                    defaultValue={_getEmailList()} id="pqrs_confirmation_email_list" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <label>Lista de Direcciones</label>
                            <div className="input-group my-1">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="home" size={16} />
                                </span>
                                <input type="text" className="form-control" placeholder="Lista de Correos"
                                    defaultValue={_getAdresslList()} id="pqrs_confirmation_address_list" />
                            </div>
                        </div>
                    </div>

                    <label>Cuerpo del Documento</label>
                    <textarea className="form-control mb-3" rows="3" maxLength="1024" id="pqrs_confirmation_doc_body"
                        defaultValue={_GET_DOC_BODY()}></textarea>
                    <table className="table table-sm table-hover table-bordered">
                        <tbody>
                            <tr>
                                <th><label className="app-p">Generar y descargar documento de confirmación.</label></th>
                                <td>
                                    <Icon name="cloud-download-alt" size={24} className="cursor-pointer" onClick={() => request_dpfConfirmation()} style={{ color: "Crimson" }} />
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.request_pdfConfirmation(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalClose();
                        const filename = "Oficio_Confirmacion_" + currentItem.id_publico + ".pdf";
                        return downloadProtectedPdf(`/pdf/reply/${encodeURIComponent(filename)}`, filename);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });
        }
        return (
            <div className="pb-2">
                {_GEN_CONFIRM_PDF_COMPONENT()}
            </div>
        );
}

export default PQRS_PDFGEN_CONFIRM;
