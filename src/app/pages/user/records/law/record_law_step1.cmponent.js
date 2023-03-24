import React, { Component } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Record_lawService from '../../../../services/record_law.service';

const MySwal = withReactContent(Swal);

class RECORD_LAW_STEP_1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;
        // DATA GETERS

        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (!_VALUE) {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == 0) {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == 1) {
                return 'form-select text-success form-control form-control-sm';
            }
            if (_VALUE == 2) {
                return 'form-select text-warning form-control form-control-sm';
            } else {
                return 'form-select form-control form-control-sm';
            }
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_law_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ?? []
            if (!value) return [];
            if (value.length == 0) return [];
            value = value.split(';');
            return value
        }
        // COMPONENTS JSX 
        let _COMPONENT_4 = () => {
            const _CHECK_ARRAY = _GET_STEP_TYPE('s1', 'check');
            const _LIST = {
                "0": { desc: "La documentación aportada es la requerida para tramitar la actuación urbanística" },
                "1": { desc: "Al momento de esta evaluación  jurídica se ratifica la condición de la radicación", alt: true },
            }
            var _COMPONENT = [];

            for (const item in _LIST) {
                _COMPONENT.push(<>
                    <div className="col-9 my-1"><label>{parseInt(item, 10) + 1}. {_LIST[item].desc}</label> </div>
                    <div className="col-3 my-1"><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item])} name="s_1_checks"
                        defaultValue={_CHECK_ARRAY[item]} onChange={() => manage_rl_s1()} >
                        {_LIST[item].alt
                            ? <>
                                <option value="0" className="text-danger">INCOMPLETA</option>
                                <option value="1" className="text-success">LEGAL Y DEBIDA FORMA</option>
                            </>
                            : <>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </>}

                    </select> </div>
                </>)
            }
            return <div className="row">{_COMPONENT}</div>
        }
        let _COMPONENT_CORRECTIONS = () => {
            let values = _GET_STEP_TYPE('s1', 'value');
            return <>
            <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                <div className='col'>
                    <label>OBSERVACIONES INVENTARIO DE INFORMACIÓN APORTADA</label>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                   
                    <textarea className="input-group" maxLength="4096" name="s_1_values" rows="4"
                        defaultValue={values[0]} onBlur={() => manage_rl_s1()}></textarea>
                         <label>(maximo 4000 caracteres)</label>
                </div>
            </div></>
        }
        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();
        let manage_rl_s1 = (e) => {
            if (e) e.preventDefault();

            let checks = [];
            let values = [];

            formData = new FormData();

            var checks_html = document.getElementsByName('s_1_checks');
            for (var i = 0; i < checks_html.length; i++) {
                checks.push(checks_html[i].value)
            }
            formData.set('check', checks.join(';'));

            var values_html = document.getElementsByName('s_1_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value)
            }
            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordLawId', currentRecord.id);
            formData.set('id_public', 's1');

            save_step('s1', false, formData);

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
                Record_lawService.update_step(STEP.id, formData)
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
                Record_lawService.create_step(formData)
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
            <div className="record_law_step_1 container">
                <h3 className='fw-bold py-3 text-center'> Análisis de la información</h3>
                {_COMPONENT_4()}
                {_COMPONENT_CORRECTIONS()}
            </div >
        );
    }
}

export default RECORD_LAW_STEP_1;