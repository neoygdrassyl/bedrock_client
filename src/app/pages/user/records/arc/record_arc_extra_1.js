import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import RECORD_ARCSERVICE from '../../../../services/record_arc.service';

const MySwal = withReactContent(Swal);

class RECORD_ARC_EXTRA_1 extends Component {
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
                return 'form-select text-danger';
            }
            if (_VALUE == 0) {
                return 'form-select text-success';
            }
            if (_VALUE == 1) {
                return 'form-select text-danger';
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
        const check_34u = _GET_STEP_TYPE('s34u', 'check');
        // COMPONENT JSX
        let _COMPONENT = () => {
            const _CHECK_ARRAY = check_34u;
            const _LIST = {
                "0": { desc: "1. En área de protección ambiental y el suelo clasificado como de protección o en los instrumentos que lo desarrollen o complementen" },
                "1": { desc: "2. Está en las zonas declaradas como de alto riesgo no mitigable identificadas en el POT" },
                "2": { desc: "3. Esta afectado por el artículo 37 de la ley 9 de 1989, o que ocupen total o parcialmente el espacio público" },
            }
            var _COMPONENT = [];

            for (const item in _LIST) {
                _COMPONENT.push(<>
                    <div className="col-9 my-1"><label>{_LIST[item].desc}</label> </div>
                    <div className="col-3 my-1"><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item])} name="s_34u_checks"
                        defaultValue={_CHECK_ARRAY[item]} >
                        <option value="0" className="text-success">NO ESTA</option>
                        <option value="1" className="text-danger">SI ESTA</option>
                    </select> </div>
                </>)
            }
            return <div className="row">{_COMPONENT}</div>
        }

        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();

        let save_ra_34u = (e) => {
            if (e) e.preventDefault();

            let checks = [];
            let values = [];

            formData = new FormData();
            
            var checks_html = document.getElementsByName('s_34u_checks');
            for (var i = 0; i < checks_html.length; i++) {
                checks.push(checks_html[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's34u');

            save_step('s34u', true, formData);

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
                <p className="text-justify">Los actos de reconocimiento de edificación existen además de lo reglamentado por el Decreto 1077 de 2015 y en particular por el artículo 2.2.6.4.1.2 que determina las situaciones en que este no procede; que para el caso de edificio objeto de esta actuación urbanística no se tipifican. En efecto consultado el POT y en particular la ficha normativa donde encuentra el inmueble se encuentra que:</p>
                {_COMPONENT()}
                <div className="text-center">
                    <button className="btn btn-success my-3" onClick={() => save_ra_34u()}>
                        <i class="far fa-share-square"></i> GUARDAR INFORMACIÓN
                    </button>
                </div>
            </div >
        );
    }
}

export default RECORD_ARC_EXTRA_1;