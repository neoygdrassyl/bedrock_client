import React from 'react'
import PQRS_SERVICES from '../../../../services/pqrs_main.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const moment = require('moment');
const MySwal = withReactContent(Swal);




export const SEEN_COMPONENT_FORM = (props) => {
    const { swaMsg, worker, retrieveItem, closeComponent, retrievePublish, currentItem, } = props;

    let _GET_HISTORY_JSON = () => {
        const json = [];
        if (worker.history) json.push(...JSON.parse(worker.history));
        console.log(json)
        return json;
    }
    var _HISTORY1 = _GET_HISTORY_JSON()

    const update = (e) => {
        e.preventDefault();
        var form = new FormData();
        let pqrsvisto1 = document.getElementById("pqrs_visto_worker_1") ? document.getElementById("pqrs_visto_worker_1").value : '';
        form.set('feedback', pqrsvisto1);
        let pqrsvisto2 = document.getElementById("pqrs_visto_worker_2") ? document.getElementById("pqrs_visto_worker_2").value : '';
        form.set('feedback_date', pqrsvisto2);
        let pqrsvisto3 = document.getElementById("pqrs_visto_worker_3") ? document.getElementById("pqrs_visto_worker_3").value : '';
        form.set('feedback_argument', pqrsvisto3);

        // se implementa la historia de usuario

        var _HISTORY = {
            date: moment().format('YYYY-MM-DD'),
            time: moment().format('hh-mm'),
            id: worker.id,
            feedback_argument: pqrsvisto3,
            feedback: pqrsvisto1,
        }
        var array = [_HISTORY, ..._HISTORY1]
        form.set('history', JSON.stringify(array));

        PQRS_SERVICES.updateWorker(worker.id, form)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    retrieveItem()
                    closeComponent()
                    retrievePublish()
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
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });

    }
    return <>
        <div className="row">
            <div className="col-6">
                <label>VISTO BUENO</label>
                <div class="input-group my-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-envelope"></i>
                    </span>
                    <select class="form-control" id="pqrs_visto_worker_1" defaultValue={worker.feedback}>
                        <option value={1}>SI</option>
                        <option value={0}>NO</option>
                    </select>
                </div>
            </div>
            <div className="col-6">
                <label>FECHA CONFIRMACION</label>
                <div class="input-group my-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="fas fa-calendar-alt"></i>
                    </span>
                    <input type='date' class="form-control mb-" rows="3" id="pqrs_visto_worker_2" defaultValue={worker.feedback_date ?? moment().format('YYYY-MM-DD')} required></input>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <label>ARGUMENTO</label>
                <textarea class="form-control mb-3" rows="3" id="pqrs_visto_worker_3" defaultValue={worker.feedback_argument}></textarea>
            </div>
        </div>
        <div className='text-center'>
            <button type="button" class="btn btn-sm btn-success" onClick={update}>Confirmar <i class="fas fa-check"></i></button>
        </div>


    </>

}
