import React from 'react'
import moment from 'moment';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
//const moment = require('moment');


const MySwal = withReactContent(Swal);
export const PQRS_SEND_DATE = (props) => {
    const { currentItem, swaMsg, retrievePublish, } = props;


    var id = currentItem.pqrs_time ? currentItem.pqrs_time.id : null
    const crearteReply = (e) => {
        e.preventDefault();
        var form = new FormData();
        const pqrs_reply_date = document.getElementById("pqrs_visto_worker_1").value
        form.set('reply_formal', pqrs_reply_date);
        PQRS_Service.update_date_reply(id ?? '', form)
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
                retrievePublish()

            } else if (response.data === 'ERROR_DUPLICATE') {
                MySwal.fire({
                    title: "ERROR DE DUPLICACION",
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
    }
    
    var validations = currentItem.pqrs_time  ? currentItem.pqrs_time.reply_formal : null
   
    return <>
        <div className="row">
            <div className="col-">
                <label>Fecha envio respuesta</label>
                <div class="input-group my-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="fas fa-calendar-alt"></i>
                    </span>
                    <input type='date' class="form-control mb-" rows="3" id="pqrs_visto_worker_1" defaultValue={validations ?? moment().format('YYYY-MM-DD')} onBlur={crearteReply} required></input>
                </div>
            </div>
        </div>
    </>
}
