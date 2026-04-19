import PQRS_Service from '../../../../services/pqrs_main.service';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function PQRS_EDIT_FUN({ translation, swaMsg, globals, currentItem, refreshCurrentItem }) {

        //DATA GETTERS
        let _GET_FUN = () => {
            var _CHILD = currentItem.pqrs_fun;
            var _CHILD_VARS = [];
            if (_CHILD) _CHILD_VARS = {
                id: _CHILD.id ? _CHILD.id : 0,
                id_public: _CHILD.id_public ? _CHILD.id_public : "",
                person: _CHILD.person ? _CHILD.person : "",
                catastral: _CHILD.catastral ? _CHILD.catastral : "",
            }
            return _CHILD_VARS
        }

        // COMPONENTS JSX
        let _FUN_COMPONENT = () => {
            var _CHILD = _GET_FUN()
            return <div className="row">
                <div className="col-lg-6 col-md-6">
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="map-signs" size={16} />
                        </span>
                        <input type="text" className="form-control" placeholder="Numero de Radicacion" id="pqrs_fun_1_edit"
                            defaultValue={_CHILD.id_public} />
                    </div>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="map-marked-alt" size={16} />
                        </span>
                        <input type="text" className="form-control" placeholder="N° Predial / Catastral" id="pqrs_fun_2_edit"
                            defaultValue={_CHILD.catastral} />
                    </div>

                </div>

                <div className="col-lg-6 col-md-6">
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="user" size={16} />
                        </span>
                        <select className="form-select" id="pqrs_fun_3_edit" defaultValue={_CHILD.person}>
                            <option>TITULAR DE LA ACTUACIÓN</option>
                            <option>INSTITUCIÓN DE CONTROL</option>
                            <option>VECINO COLINDANTE</option>
                            <option>INTERESADO</option>
                            <option>OTRO</option>
                        </select>
                    </div>
                </div>
            </div>

        }
        // FUNCTIONS & APIS
        var formData = new FormData();

        let manage_item = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('pqrsMasterId', currentItem.id);

            let address = document.getElementById("pqrs_fun_1_edit").value;
            formData.set('address', address);
            let catastral = document.getElementById("pqrs_fun_2_edit").value;
            formData.set('catastral', catastral);
            let person = document.getElementById("pqrs_fun_3_edit").value;
            formData.set('person', person);

            save_item();
        }

        let save_item = () => {
            var _CHILD = _GET_FUN();

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            if (_CHILD.id) {
                PQRS_Service.update_fun(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            refreshCurrentItem(currentItem.id)
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            } else {
                PQRS_Service.create_fun(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            refreshCurrentItem(currentItem.id)
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            }
        }
        return (
            <div>
                <form id="form_pqrs_edit_fun_edit" onSubmit={manage_item}>
                    {_FUN_COMPONENT()}
                    <div className="text-center">
                        <button className="btn btn-sm btn-success my-3">
                            <Icon name="share-square" size={16} /> GUARDAR CAMBIOS
                        </button>
                    </div>
                </form>
            </div>
        );
}

export default PQRS_EDIT_FUN;