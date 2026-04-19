import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import PQRS_Service from '../../../../services/pqrs_main.service';
import { infoCud } from '../../../../components/jsons/vars';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';


function PQRS_SET_REPLY({ translation, swaMsg, globals, hardReset, currentItem, currentId, refreshList, retrieveItem: parentRetrieveItem, closeModal }) {
    const [currentItemData, setCurrentItemData] = useState(null);
    const [load, setLoad] = useState(false);

    useEffect(() => {
        const fetchItem = (id) => {
            PQRS_Service.get(id)
                .then(response => {
                    setCurrentItemData(response.data);
                    setLoad(true);
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
                    setLoad(false);
                });
        };
        fetchItem(currentId);
    }, []);
        var formData = new FormData();

        // SUBMIT  NEW 1. ENTRY
        let replyPQRS = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('id_master', currentItem.id);
            formData.set('info_id', currentItem.pqrs_info.id);
            formData.set('time_id', currentItem.pqrs_time.id);

            let reply_formal = document.getElementById("pqrs_reply_time_formalReply").value;
            formData.set('reply_formal', reply_formal);
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

                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                PQRS_Service.formalReply(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
parentRetrieveItem(currentItem.id);
                        refreshList();
                        if (hardReset) {
                            closeModal();
                            }

                        } else if (response.data === 'ERROR_DUPLICATE') {
                            swalError({ title: "ERROR DE DUPLICACION", text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo" });
                        }
                        else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    });
            } else {
                swalError({ title: "NO HAY CONSECUTIVO DE SALIDA", text: "Se debe de espeficiar primero el consecutivo de Salida." });
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
                        concecutive = 1
                        if (concecutive < 1000) concecutive = "0" + concecutive
                        if (concecutive < 100) concecutive = "0" + concecutive
                        if (concecutive < 10) concecutive = "0" + concecutive
                        new_id = res1+(dayjs().format('YY')).split('-')[0] + "-" + concecutive
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
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte." });
                });

        }
        return (
            <div>
                <form onSubmit={replyPQRS} id="app-formReply">

                    <div className="row">
                        <div className="col-6">
                            <label className='text-start'>consecutivo de Salida</label>
                            <div className="input-group my-1">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="hashtag" size={16} />
                                </span>
                                <input type="text" className="form-control" defaultValue={currentItem.id_reply}
                                    id="pqrs_master_idreply" require />
                                <button type="button" className="btn btn-info shadow-none" onClick={() => _GET_LAST_ID()}>GENERAR</button>
                            </div>
                        </div>

                        <div className="col-6">
                            <label>Fecha de Respuesta</label>
                            <div className="input-group my-1">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="hashtag" size={16} />
                                </span>
                                <input type="date" max="2100-01-01" className="form-control"
                                    defaultValue={currentItem.pqrs_time ? currentItem.pqrs_time.reply_formal : dayjs().format('YYYY-MM-DD')}
                                    id="pqrs_reply_time_formalReply" require />
                            </div>
                        </div>

                    </div>

                    <label>Respuesta de Oficio (Máximo 4000 Caracteres)</label>
                    <textarea className="form-control mb-3" rows="5" maxlength="4096" id="pqrs_info_reply" defaultValue={currentItem.pqrs_info ? currentItem.pqrs_info.reply : ''}></textarea>
                    <div className="text-center m-3">
                        <button className="btn btn-sm btn-success my-2" ><Icon name="edit" size={16} /> GUARDAR RESPUESTA </button>
                    </div>
                </form>
            </div>
        );
}

export default PQRS_SET_REPLY;