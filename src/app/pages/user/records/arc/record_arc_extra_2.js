import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import FUN_REPORT_DATA from '../../fun_forms/components/fun_report_data';

const MySwal = withReactContent(Swal);

class RECORD_ARC_EXTRA_2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETERS
        let _GET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                report_data: [],
            }
            if (_CHILD != null) {
                _CHILD_VARS.report_data = _CHILD.report_data ? _CHILD.report_data : []; 
            }
            return _CHILD_VARS;
        }
        let _GET_LAW_REPORT_DATA = () => {
            var _CHILD = _GET_CHILD_LAW();
            if (_CHILD.report_data.length) {
                return _CHILD.report_data.split(",");
            }
            return [];
        }
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
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_arc_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        // DATA CONVERTER
        
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type]
            if (!value) return [];
            value = value.split(';');
            return value
        }
        const value35u = _GET_STEP_TYPE('s35u', 'value');
        const check35u = _GET_STEP_TYPE('s35u', 'check');
        // COMPONENT JSX
        let _COMPONENT_2 = () => {
            const _CHECK_ARRAY =check35u;
            const _LIST = {
                "0": { desc: "b) El levantamiento arquitectónico de la construcción coincide con lo construido en el sitio." },
                "1": { desc: "c) La construcción ocupa total o parcialmente el espacio público: antejardín, componente del perfil vial" },
                "2": { desc: "d) Se desarrollan construcciones en el aislamiento posterior" },
                "3": { desc: "d) e) Cumple con el Decreto 1077 de 2015 (Uso del suelo)" },
            }
            var _COMPONENT = [];

            for (const item in _LIST) {
                _COMPONENT.push(<>
                    <div className="col-9 my-1"><label>{_LIST[item].desc}</label> </div>
                    <div className="col-3 my-1"><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item])} name="s_35u_checks"
                        defaultValue={_CHECK_ARRAY[item]} >
                        <option value="0" className="text-danger">NO</option>
                        <option value="1" className="text-success">SI</option>
                        <option value="2" className="text-warning">SIN DATO</option>
                    </select> </div>
                </>)
            }
            return <div className="row">{_COMPONENT}</div>
        }
        let _COMPONENT_3 = () => {
            return <div className="row">
                <div className="col-3 p-1">
                    <label>Conclusión SPM</label>
                </div>
                <div className="col-9 p-1">
                    <textarea className="input-group" defaultValue={value35u[0]} rows="2"name="s_35u_values"></textarea>
                </div>
            </div>
        }
        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();

        let save_ra_35u = (e) => {
            if (e) e.preventDefault();

            let checks = [];
            let values = [];

            formData = new FormData();
            
            var checks_html = document.getElementsByName('s_35u_checks');
            for (var i = 0; i < checks_html.length; i++) {
                checks.push(checks_html[i].value)
            }
            formData.set('check', checks.join(';'));

            var values_html = document.getElementsByName('s_35u_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value)
            }
            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's35u');

            save_step('s35u', true, formData);

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
                RECORD_ARCSERVICE.update_step(STEP.id, formData)
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
                RECORD_ARCSERVICE.create_step(formData)
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
            <div className="record_arc_31 container">
                <FUN_REPORT_DATA
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={currentItem} />
                <hr className="my-3" />
                <p className="text-justify">El acto de reconocimiento de edificaciones existentes se rige en el municipio de Bucaramanga por el artículo 471 de Acuerdo 011 de 2014, en virtud de ello, el ente territorial se pronunció a través del oficio {_GET_LAW_REPORT_DATA()[5] ? <label className="fw-bold">{_GET_LAW_REPORT_DATA()[5]}</label> : <label className="text-danger fw-bold">-No se ha generado oficio por planeación-</label>} emitiendo el siguiente resultado de procedibilidad en los términos de los literales b), c), d) y e) del numeral 1 del artículo ibídem para el literal:</p>
                {_COMPONENT_2()}
                {_COMPONENT_3()}
                <div className="text-center">
                    <button className="btn btn-success my-3" onClick={() => save_ra_35u()}>
                        <i class="far fa-share-square"></i> GUARDAR INFORMACIÓN
                    </button>
                </div>
            </div >
        );
    }
}

export default RECORD_ARC_EXTRA_2;