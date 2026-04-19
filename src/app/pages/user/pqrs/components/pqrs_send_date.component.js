import dayjs from 'dayjs';
import PQRS_Service from '../../../../services/pqrs_main.service';
import { Icon } from '@/components/icon';
import { swalError, swalSuccess } from '@/app/utils/swalAdapter';


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
                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                props.retrieveItem(currentItem.id);
                props.refreshList();
                retrievePublish()

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
    }
    
    var validations = currentItem.pqrs_time  ? currentItem.pqrs_time.reply_formal : null
   
    return <>
        <div className="row">
            <div className="col-">
                <label>Fecha envio respuesta</label>
                <div className="input-group my-1">
                    <span className="input-group-text bg-info text-white">
                        <Icon name="calendar-alt" size={16} />
                    </span>
                    <input type='date' className="form-control mb-" rows="3" id="pqrs_visto_worker_1" defaultValue={validations ?? dayjs().format('YYYY-MM-DD')} onBlur={crearteReply} required></input>
                </div>
            </div>
        </div>
    </>
}
