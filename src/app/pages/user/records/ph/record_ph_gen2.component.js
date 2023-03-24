import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'

const MySwal = withReactContent(Swal);

class RECORD_PH_GEN_2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_REVIEW_GEN = () => {
            var _CHILD = currentRecord.review_check;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD.split(';');
            }
            return _LIST;
        }
        // DATA CONVERTERS
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (!_VALUE) {
                return 'form-select text-danger';
            }
            if (_VALUE == 0) {
                return 'form-select text-danger';
            }
            if (_VALUE == 1) {
                return 'form-select text-success';
            }
            if (_VALUE == 2) {
                return 'form-select text-warning';
            } else {
                return 'form-select';
            }
        }
        // COMPONENT JSX
        let _COMPONENT_3 = () => {
            var _CHILD = _GET_CHILD_REVIEW_GEN()
            return <>
                <div className="row border p-2 ms-2">
                    <div className="col-6">
                        <label>01. Los PLANOS para visto bueno concuerdan con los planos aprobados en la licencia urbanística.</label>
                    </div>
                    <div className="col-6">
                        <div className="row mb-1">
                            <div className="col-8">
                                <label>Área construida</label>
                            </div>
                            <div className="col-4">
                                <select className={_GET_SELECT_COLOR_VALUE(_CHILD[1])} name="review_check_2" defaultValue={_CHILD[1]} >
                                    <option value="1" className="text-warning">SI</option>
                                    <option value="0" className="text-danger">NO</option>
                                </select>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col-8">
                                <label>Unidades Privada</label>
                            </div>
                            <div className="col-4">
                                <select className={_GET_SELECT_COLOR_VALUE(_CHILD[2])} name="review_check_2" defaultValue={_CHILD[2]} >
                                    <option value="1" className="text-warning">SI</option>
                                    <option value="0" className="text-danger">NO</option>
                                </select>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col-8">
                                <label>Espacios Comunes</label>
                            </div>
                            <div className="col-4">
                                <select className={_GET_SELECT_COLOR_VALUE(_CHILD[3])} name="review_check_2" defaultValue={_CHILD[3]} >
                                    <option value="1" className="text-warning">SI</option>
                                    <option value="0" className="text-danger">NO</option>
                                </select>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col-8">
                                <label>Área del Predio</label>
                            </div>
                            <div className="col-4">
                                <select className={_GET_SELECT_COLOR_VALUE(_CHILD[4])} name="review_check_2" defaultValue={_CHILD[4]} >
                                    <option value="1" className="text-warning">SI</option>
                                    <option value="0" className="text-danger">NO</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row border p-2 ms-2">
                    <div className="col-6">
                        <label>02. Los PLANOS para visto bueno presentados identifican con claridad los tipos de bienes: Privados y Comunes</label>
                    </div>
                    <div className="col-6">
                        <div className="row mb-1">
                            <div className="col-8">
                                <label>Diferenciados con color/áreas</label>
                            </div>
                            <div className="col-4">
                                <select className={_GET_SELECT_COLOR_VALUE(_CHILD[5])} name="review_check_2" defaultValue={_CHILD[5]} >
                                    <option value="1" className="text-warning">SI</option>
                                    <option value="0" className="text-danger">NO</option>
                                </select>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col-8">
                                <label>Presentan alinderamiento</label>
                            </div>
                            <div className="col-4">
                                <select className={_GET_SELECT_COLOR_VALUE(_CHILD[6])} name="review_check_2" defaultValue={_CHILD[6]} >
                                    <option value="1" className="text-warning">SI</option>
                                    <option value="0" className="text-danger">NO</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row border p-2 ms-2">
                    <div className="col-6">
                        <label>03. La suma de los bienes privados y comunes coincide con el área total construida por:</label>
                    </div>
                    <div className="col-6">
                        <div className="row mb-1">
                            <div className="col-8">
                                <label>Piso por piso</label>
                            </div>
                            <div className="col-4">
                                <select className={_GET_SELECT_COLOR_VALUE(_CHILD[7])} name="review_check_2" defaultValue={_CHILD[7]} >
                                    <option value="1" className="text-warning">SI</option>
                                    <option value="0" className="text-danger">NO</option>
                                </select>
                            </div>
                        </div>
                        <div className="row mb-1">
                            <div className="col-8">
                                <label>Total construida</label>
                            </div>
                            <div className="col-4">
                                <select className={_GET_SELECT_COLOR_VALUE(_CHILD[8])} name="review_check_2" defaultValue={_CHILD[8]} >
                                    <option value="1" className="text-warning">SI</option>
                                    <option value="0" className="text-danger">NO</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_DETAILS_1 = () => {
            let _CHILD = currentRecord.detail;

            return <div className="row py-2">
                <div className="col-12">
                    <label>Descripción del Proyecto, separe cada punto con (solo) un salto de linea. (Máximo 2000 caracteres)</label>
                    <textarea className="input-group" maxLength="2000" id="review_ph_detail_1" rows="4"
                        defaultValue={_CHILD}></textarea>
                </div>
            </div>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let manage_item = (e) => {
            e.preventDefault();
            formData = new FormData();
            let review_check = [];

            let detail = document.getElementById("review_ph_detail_1").value;
            if (detail) formData.set('detail', detail);

            let review_check_2 = document.getElementsByName("review_check_2");
            // 0 => VIGENTE PROFESIONAL
            // 1 => 1.1 Área construida
            // 2 => 1.2 Unidades Privada
            // 3 =>  1.3 Espacios Comunes
            // 4 =>  1.4 Área del Predio
            // 5 =>  2.1 Diferenciados con color/áreas
            // 6 =>  2.2 Presentan alineamiento
            // 7 =>  3.1 Piso por piso
            // 8 =>  3.2 Total construida
            
            for (var i = 0; i < review_check_2.length; i++) {
                review_check.push(review_check_2[i].value)
            }
            if(review_check.length == 8) review_check.unshift(0)
            formData.set('review_check', review_check.join(';'));

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.update(currentRecord.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.requestUpdateRecord(currentItem.id);
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
        return (
            <div className="record_ph_gen container">
                <form id="form_manage_ph_gen_2" onSubmit={manage_item}>
                    <div className="row">
                        <label className="app-p lead fw-bold my-2">OBSERVACIONES A LA INFORMACIÓN PLANIMÉTRICA</label>
                        {_COMPONENT_3()}
                        {_COMPONENT_DETAILS_1()}
                        <div className="row mb-3 text-center">
                            <div className="col-12">
                                <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div >
        );
    }
}

export default RECORD_PH_GEN_2;