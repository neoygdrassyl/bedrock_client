import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';

const MySwal = withReactContent(Swal);
class PQRS_EDIT_FUN extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;

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
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-map-signs"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Numero de Radicacion" id="pqrs_fun_1_edit"
                            defaultValue={_CHILD.id_public} />
                    </div>
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-map-marked-alt"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="N° Predial / Catastral" id="pqrs_fun_2_edit"
                            defaultValue={_CHILD.catastral} />
                    </div>

                </div>

                <div className="col-lg-6 col-md-6">
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-user"></i>
                        </span>
                        <select class="form-select" id="pqrs_fun_3_edit" defaultValue={_CHILD.person}>
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

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {
                PQRS_Service.update_fun(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.refreshCurrentItem(currentItem.id)
                        } else {
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
            } else {
                PQRS_Service.create_fun(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.refreshCurrentItem(currentItem.id)
                        } else {
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
        }
        return (
            <div>
                <form id="form_pqrs_edit_fun_edit" onSubmit={manage_item}>
                    {_FUN_COMPONENT()}
                    <div className="text-center">
                        <button className="btn btn-sm btn-success my-3">
                            <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

export default PQRS_EDIT_FUN;