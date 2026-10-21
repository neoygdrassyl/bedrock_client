import PQRS_SERVICES from '../../../../services/pqrs_main.service';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { Icon } from '@/components/icon';
import { swalError, swalSuccess } from '@/app/utils/swalAdapter';
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
            date: dayjs().format('YYYY-MM-DD'),
            time: dayjs().format('hh-mm'),
            id: worker.id,
            feedback_argument: pqrsvisto3,
            feedback: pqrsvisto1,
        }
        var array = [_HISTORY, ..._HISTORY1]
        form.set('history', JSON.stringify(array));

        PQRS_SERVICES.updateWorker(worker.id, form)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    retrieveItem()
                    closeComponent()
                    retrievePublish()
                }
                else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });

    }
    return <>
        <div className="row">
            <div className="col-6">
                <label>VISTO BUENO</label>
                <div className="input-group my-1">
                    <span className="input-group-text bg-primary text-primary-foreground">
                        <Icon name="envelope" size={16} />
                    </span>
                    <select className="form-control" id="pqrs_visto_worker_1" defaultValue={worker.feedback}>
                        <option value={1}>SI</option>
                        <option value={0}>NO</option>
                    </select>
                </div>
            </div>
            <div className="col-6">
                <label>FECHA CONFIRMACION</label>
                <div className="input-group my-1">
                    <span className="input-group-text bg-primary text-primary-foreground">
                        <Icon name="calendar-alt" size={16} />
                    </span>
                    <input type='date' className="form-control mb-" rows="3" id="pqrs_visto_worker_2" defaultValue={worker.feedback_date ?? dayjs().format('YYYY-MM-DD')} required></input>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <label>ARGUMENTO</label>
                <textarea className="form-control mb-3" rows="3" id="pqrs_visto_worker_3" defaultValue={worker.feedback_argument}></textarea>
            </div>
        </div>
        <div className='text-center'>
            <Button size="sm" onClick={update}>Confirmar <Icon name="check" size={16} /></Button>
        </div>


    </>

}
