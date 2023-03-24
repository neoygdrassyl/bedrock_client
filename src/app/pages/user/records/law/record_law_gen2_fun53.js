import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import VIZUALIZER from '../../../../components/vizualizer.component';

import FUN_Service from '../../../../services/fun.service'


const MySwal = withReactContent(Swal);

class RECORD_LAW_GEN_2_FUN53 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_53 = () => {
            var _CHILD = currentItem.fun_53s;
            var _CURRENT_VERSION = currentItem.version - 1;
            var _CHILD_VARS = {
                item_530: "",
                item_5311: "",
                item_5312: "",
                item_532: "",
                item_533: "",
                item_534: "",
                item_535: "",
                item_536: "",
                docs: "",
                check: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_530 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name;
                    _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname;
                    _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number;
                    _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role;
                    _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number;
                    _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email;
                    _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address;
                    _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs;
                    _CHILD_VARS.check = _CHILD[_CURRENT_VERSION].check;
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
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
        let _FIND_6 = (_ID) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }
    
        let _GET_DOC_VALUE_FUN53 = (_index) => {
            var _CHILD = _GET_CHILD_53();
            if (!_CHILD.docs) return false
            var _array = _CHILD.docs.split(',');

            return _array[_index]
        }
        let _GET_CHECK_VALUE_FUN53 = (_index) => {
            var _CHILD = _GET_CHILD_53();
            if (!_CHILD.check) return false
            var _array = _CHILD.check.split(',');
            return _array[_index]
        }

        // COMPONENT JSX
            let _COMPONENT_5_FUN_53 = () => {
            let _CHILD_VARS = _GET_CHILD_53();
            let _check = [];
            _check[0] = _GET_CHECK_VALUE_FUN53(0);
            _check[1] = _GET_CHECK_VALUE_FUN53(1);
            return <>
                <div className="row mx-2 px-2">
                    <div className="col-6 border p-2">
                        <label className="mx-3">5.1 Nombre y Apelido(s)</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_5311 + " " + _CHILD_VARS.item_5312}</label>
                    </div>
                    <div className="col-6 border p-2">
                        <label className="mx-3">5.2 No. Cédula</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_532}</label>
                    </div>
                </div>
                <div className="row mx-2 px-2">
                    <div className="col-6 border p-2">
                        <label className="mx-3">5.3 Número de Contacto</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_534}</label>
                    </div>
                    <div className="col-6 border p-2">
                        <label className="mx-3">5.4 Correo Eletrónico</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_535}</label>
                    </div>
                </div>
                <div className="row mx-2 px-2">
                    <div className="col-6 border p-2">
                        <label className="mx-3">5.5 Dirección de Correspondencia</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_536}</label>
                    </div>
                    <div className="col-6 border p-2">
                        <label className="mx-3">5.6 En calidad de:</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_533}</label>
                    </div>
                </div>
                <div className="row m-2 py-2">
                    <label>5.7 Documentos</label>
                    <div className="col-6 border p-2">
                        <label className="mx-3 py-2">Documento de Identidad: </label>
                        {_GET_DOC_VALUE_FUN53(0) > 0
                            ? 
                            <VIZUALIZER url={_FIND_6(_GET_DOC_VALUE_FUN53(0)).path + "/" + _FIND_6(_GET_DOC_VALUE_FUN53(0)).filename}
                            apipath={'/files/'} />
                            : <><br/><label className="text-warning fw-bold my-2">SIN DOCUMENTO</label></>}

                        <select className={_GET_SELECT_COLOR_VALUE( _check[0])} id="r_l_g2_fun53_doc1"
                            defaultValue={ _check[0]} onChange={() => fun_53_check()} >
                            <option value="0">NO CUMPLE</option>
                            <option value="1">CUMPLE</option>
                            <option value="2">NO APLICA</option>
                        </select>
                    </div>
                    <div className="col-6 border p-2">
                        <label className="mx-3 my-2">Poder, mandato o autorización: </label>
                        {_GET_DOC_VALUE_FUN53(1) > 0
                            ? <VIZUALIZER url={_FIND_6(_GET_DOC_VALUE_FUN53(1)).path + "/" + _FIND_6(_GET_DOC_VALUE_FUN53(1)).filename}
                            apipath={'/files/'} />
                            : <label className="text-warning fw-bold my-2">SIN DOCUMENTO</label>}

                        <select className={_GET_SELECT_COLOR_VALUE(_check[1])} id="r_l_g2_fun53_doc2"
                            defaultValue={_check[1]} onChange={() => fun_53_check()} >
                            <option value="0">NO CUMPLE</option>
                            <option value="1">CUMPLE</option>
                            <option value="2">NO APLICA</option>
                        </select>
                    </div>
                </div>

            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let manage_53 = (useMySwal) => {
            var _CHILD = _GET_CHILD_53();

            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }


            if (_CHILD.item_530) {
                FUN_Service.update_53(_CHILD.item_530, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                            this.props.requestUpdate(currentItem.id)
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            } else {
                FUN_Service.create_fun53(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                            this.props.requestUpdate(currentItem.id)
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }
        }

        let fun_53_check = () => {
            formData = new FormData();

            var check = [];
            check.push(document.getElementById("r_l_g2_fun53_doc1").value);
            check.push(document.getElementById("r_l_g2_fun53_doc2").value);
            formData.set('check', check.join());

            manage_53(false);
        }
        return (
            <div className="record_lar_gen2_fun53 container">
                {_COMPONENT_5_FUN_53()}
            </div >
        );
    }
}

export default RECORD_LAW_GEN_2_FUN53;