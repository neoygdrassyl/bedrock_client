import dayjs from 'dayjs';
import PQRS_Service from '../../../../services/pqrs_main.service';
import { infoCud } from '../../../../components/jsons/vars';
import CubXVrDataService from '../../../../services/cubXvr.service'
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { swalError, swalSuccess } from '@/app/utils/swalAdapter';

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
                    new_id = res1 + (dayjs().format('YY')).split('-')[0] + "-" + concecutive
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
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte." });
            });

    }
    const UPDATE_PQRS = () => {
        var form = new FormData();

        const id_confirm = document.getElementById("pqrs_master_id_confirm").value
        form.set('id_confirm', id_confirm);
        form.set('id_old', currentItem.id_confirm);

        createVRxCUB_relation(id_confirm)
        PQRS_Service.update(currentItem.id, form)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
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

    let createVRxCUB_relation = (cub_selected) => {
        let vr = currentItem.id_global;
        let cub = cub_selected;
        let formatData = new FormData();
        console.log(currentItem)
        formatData.set('vr', vr);
        formatData.set('cub', cub);
        formatData.set('process', 'ENVIAR CONFIRMACION POR EMAIL');
        formatData.set('pqrs', 1);

        let desc = "Email"
        formatData.set('desc', desc);
        formatData.set('date', new Date().toISOString().slice(0, 10));

        if (props.idCUBxVr) {
            CubXVrDataService.updateCubVr(props.idCUBxVr, formatData)
                .then((response) => {
                    if (response.data === 'OK') {
                        // Refrescar la UI
                        props.requestUpdate(currentItem.id, true);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            // Crear relación
            CubXVrDataService.createCubXVr(formatData)
                .then((response) => {
                    if (response.data === 'OK') {
                        // Refrescar la UI
                        props.requestUpdate(currentItem.id, true);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }

    };



    return (
        <div className="text-center">
            <label className="mt-0 center-text"> {infoCud.serials.end}</label>
            <div className="input-group my-1">
                <span className="input-group-text bg-primary text-primary-foreground">
                    <Icon name="hashtag" size={16} />
                </span>
                <input type="text" className="form-control" defaultValue={currentItem.id_confirm}
                    id="pqrs_master_id_confirm" require />
                <button type="button" className="btn btn-info shadow-none" onClick={() => _GET_LAST_ID()}>GENERAR</button>
            </div>
            <div className="d-flex justify-content-center">
                <Button type="button" size="sm" className="shadow-none mt-5" onClick={() => UPDATE_PQRS()}>
                    Guardar
                </Button>
            </div>
        </div>

    )
}
