import React, { useEffect, useState } from 'react'
import moment from 'moment';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import { infoCud } from '../../../../components/jsons/vars';
import SubmitService from '../../../../services/submit.service'

//const moment = require('moment');

const MySwal = withReactContent(Swal);
export const PQRS_ID_CONFIRM = (props) => {

    const { currentItem, swaMsg } = props;
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
                    document.getElementById('pqrs_master_id_confirm').value = new_id;
                } else {
                    concecutive = new_id.split('-')[1];
                    concecutive = Number(concecutive) + 1
                    if (concecutive < 1000) concecutive = "0" + concecutive
                    if (concecutive < 100) concecutive = "0" + concecutive
                    if (concecutive < 10) concecutive = "0" + concecutive
                    new_id = new_id.split('-')[0] + "-" + concecutive
                    document.getElementById('pqrs_master_id_confirm').value = new_id;
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
    
    const [vrsRelated, setVrsRelated] = useState([])
    useEffect(() => {
        let _GET_ALL_VRS_RELATED = () => {
            SubmitService.getIdRelated(currentItem.id_global).then(response => {
                setVrsRelated(response.data)
            })
        }
        _GET_ALL_VRS_RELATED()
    }, [])
    
    const UPDATE_PQRS = () => {
        var form = new FormData();

        const id_confirm = document.getElementById("pqrs_master_id_confirm").value
        form.set('id_confirm', id_confirm);
        form.set('id_old', currentItem.id_confirm);

        PQRS_Service.update(currentItem.id, form)
        .then(response => {
            if (response.data === 'OK') {
                MySwal.fire({
                    title: swaMsg.publish_success_title,
                    text: swaMsg.publish_success_text,
                    footer: swaMsg.text_footer,
                    icon: 'success',
                    confirmButtonText: swaMsg.text_btn,
                });
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
    }
    

    return (
        <div className="text-center">
            <label className="mt-0 center-text"> {infoCud.serials.end}</label>
            <div class="input-group my-1">
                <span class="input-group-text bg-info text-white">
                    <i class="fas fa-hashtag"></i>
                </span>
                <input type="text" class="form-control" defaultValue={currentItem.id_confirm}
                    id="pqrs_master_id_confirm" require />
                <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID()}>GENERAR</button>
                <button type="button" class="btn btn-success shadow-none" onClick={() => UPDATE_PQRS()}>GUARDAR</button>
            </div>
            <div>
                <label className="mt-1">{infoCud.serials.start}</label>
                <div class="input-group ">
                    <select class="form-select" defaultValue={""}>
                        <option value=''>Seleccione una opción</option>
                        {vrsRelated && vrsRelated.map((value, key) => (
                            <option key={value.id} value={value.id_global}>
                                {value.id_global}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
        
    )
}
