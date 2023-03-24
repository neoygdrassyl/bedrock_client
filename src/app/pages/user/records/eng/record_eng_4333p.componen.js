import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'

const MySwal = withReactContent(Swal);

class RECORD_ENG_STEP_433P extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;
        const SUBCATEGORIES = currentRecord.subcategory ? currentRecord.subcategory.split(';') : [];
        // FUNCTIONS & VARIABLES
        // DATA GETTERS
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_eng_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }

        // DATA CONVERTERS
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (!_VALUE) {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == '0') {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == '1') {
                return 'form-select text-success form-control form-control-sm';
            }
            if (_VALUE == '2') {
                return 'form-select text-warning form-control form-control-sm';
            } else {
                return 'form-select form-control form-control-sm';
            }
        }
        let _GET_STEP_TYPE_INDEX = (_id_public, _type, _index) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return null;
            var value = STEP[_type]
            value = value.split(';');
            return value[_index]
        }
        // COMPONENT JSX
        let COMPONENT_03 = () => {
            return <>


                <div className="row  py-0">
                    <div className="col-10">
                        <label className="">Coherencia técnica del peritaje con los planos arquitectónicos</label>
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433p', 'check', 0) ?? 1)} name="r_e_select_s433p"
                            defaultValue={_GET_STEP_TYPE_INDEX('s433p', 'check', 0) ?? 1} onChange={() => manage_step_433p()}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>


                <div className="row  py-0">
                    <div className="col-10">
                        <label className="">Presenta antigüedad de la construcción</label>
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433p', 'check', 1) ?? 1)} name="r_e_select_s433p"
                            defaultValue={_GET_STEP_TYPE_INDEX('s433p', 'check', 1) ?? 1} onChange={() => manage_step_433p()}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>


                <div className="row  py-0">
                    <div className="col-10">
                        <label className="">Descripción del peritaje técnico</label>
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433p', 'check', 2) ?? 1)} name="r_e_select_s433p"
                            defaultValue={_GET_STEP_TYPE_INDEX('s433p', 'check', 2) ?? 1} onChange={() => manage_step_433p()}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>


            </>
        }
        // FUNCTIONS AND APIS
        //var formData = new FormData();

        let manage_step_433p = (e) => {
            if (e) e.preventDefault();
            var formData = new FormData();

            let checks = [];
            formData = new FormData();
            checks = [];
            var checks_2 = document.getElementsByName('r_e_select_s433p');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's433p');
            save_step('s433p', false, formData);

        }
        let save_step = (_id_public, useSwal, formData) => {
            var STEP = LOAD_STEP(_id_public);

            if (useSwal) MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (STEP.id) {
                RECORD_ENG_SERVICE.update_step(STEP.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
            else {
                RECORD_ENG_SERVICE.create_step(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
        }


        return (
            <div className="record_eng_desc container">
                {SUBCATEGORIES[1] == '1' ? <>
                    <legend className="my-3 px-3 text-uppercase bg-light" id="record_eng_432P">
                        <label className="app-p lead fw-normal text-uppercase">4.3.2 Peritaje Estructural</label>
                    </legend>
                    {COMPONENT_03()}
                </> : ""}
            </div >
        );
    }
}

export default RECORD_ENG_STEP_433P;