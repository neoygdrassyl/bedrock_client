
import PQRS_Service from '../../../../services/pqrs_main.service';
import { dateParser } from '../../../../components/customClasses/typeParse'
import { cities } from '../../../../components/jsons/vars';

import dayjs from 'dayjs';
import { Icon } from '@/components/icon';
import { swalClose, swalError, swalLoading } from '@/app/utils/swalAdapter';
function PQRS_PDFGEN_REPLY({ translation, swaMsg, globals, currentItem }) {
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
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="calendar-alt" size={16} />
                                </span>
                                <input type="date" max="2100-01-01" className="form-control" id="pqrs_reply_date" 
                                defaultValue={dayjs().format('YYYY-MM-DD')} required />
                            </div>
                        </div>
                        <div className="col">
                            <label>Consecutivo Entrada</label>
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="hashtag" size={16} />
                                </span>
                                <input type="text" className="form-control" id="pqrs_reply_id_public" 
                                defaultValue={currentItem.id_publico} disabled />
                            </div>
                        </div>
                        <div className="col">
                            <label>Consecutivo Salida</label>
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="hashtag" size={16} />
                                </span>
                                <input type="text" className="form-control" id="pqrs_reply_id_reply" 
                                defaultValue={currentItem.id_reply} disabled />
                            </div>
                        </div>
                        <div className="col">
                            <label className="mt-1">Ciudad</label>
                            <div className="input-group">
                                <select className="form-select me-1" id={"pqrs_reply_city"}>
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
                                <input list="titles" className="form-select" id="pqrs_reply_titles" />
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
                                defaultValue={_getSolicitorlList()} id="pqrs_reply_solicitor_list" />
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
                                defaultValue={_getEmailList()} id="pqrs_reply_email_list" />
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
                                defaultValue={_getAdresslList()} id="pqrs_reply_address_list" />
                            </div>
                        </div>
                    </div>

                    <label>Cuerpo del Documento</label>
                    <textarea className="form-control mb-3" rows="3" maxlength="1024" id="pqrs_reply_doc_body"
                        defaultValue={currentItem.pqrs_info.reply}></textarea>
                    <table className="table table-sm table-hover table-bordered">
                        <tbody>
                            <tr>
                                <th><label className="app-p">Generar y descargar oficio de respuesta.</label></th>
                                <td><Icon name="cloud-download-alt" size={24} className="cursor-pointer" onClick={() => request_dpf()} style={{color: "Crimson"}} /></td>
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.request_pdfReply(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalClose();
                        window.open(import.meta.env.VITE_API_URL + "/pdf/reply/" + "Oficio_" + currentItem.id_reply + ".pdf");
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
                {_GEN_REPLY_PDF_COMPONENT()}
            </div>
        );
}

export default PQRS_PDFGEN_REPLY;