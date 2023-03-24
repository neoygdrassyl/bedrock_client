import React, { Component } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import RECORD_ARCSERVICE from '../../../../services/record_arc.service';

import { dateParser, dateParser_finalDate } from '../../../../components/customClasses/typeParse';

const MySwal = withReactContent(Swal);

class RECORD_ARC_31 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {

    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_FUN_52 = () => {
            var _CHILD = currentItem.fun_52s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SELECT_FUN_52_ID = () => {
            let _LIST = _GET_CHILD_FUN_52();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].active == 1) _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].name + " " + _LIST[i].surname}</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        // DATA CONVERTERS
        let _GET_CLOCK_STATE_V = (_state, _version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_CLOCK_STATE = (_state, _version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_arc_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type]
            if (!value) return [];
            value = value.split(';');
            return value
        }
        const value31 = _GET_STEP_TYPE('s31', 'value');
        // COMPONENT JSX
        let _SELECT_PROFESIONAL = () => {
            return <>
                <label>TRAER PROFESIONAL DE LA SOLICITUD</label>
                <select class="form-select" required id="r_a_31_select_profesional" onChange={(e) => updateWorker(e.target.value)} >
                    <option value="0">NUEVO PROFESIONAL</option>
                    {_SELECT_FUN_52_ID()}
                </select>
            </>
        }
        let _COMPONENT = () => {
            return <>
                <input type="hidden" name="s_31_values" defaultValue={value31[0]} />
                <label >3.1.1 Arquitecto Responsable</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-user"></i>
                    </span>
                    <input type="text" class="form-control" name="s_31_values"
                        defaultValue={value31[1]} />
                </div>
                <label >3.1.2 Matricula Profesional</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-address-card"></i>
                    </span>
                    <input type="text" class="form-control" name="s_31_values"
                        defaultValue={value31[2]} />
                </div>
                <label >3.1.3 Teléfono Contacto</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="fas fa-phone-alt"></i>
                    </span>
                    <input type="text" class="form-control" name="s_31_values"
                        defaultValue={value31[3]} />
                </div>
                <label >3.1.4 Email contacto</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-envelope"></i>
                    </span>
                    <input type="text" class="form-control" name="s_31_values"
                        defaultValue={value31[4]} />
                </div>
                <label >3.1.5 Dirección Contacto</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="fas fa-map-marked-alt"></i>
                    </span>
                    <input type="text" class="form-control" name="s_31_values"
                        defaultValue={value31[5]} />
                </div>
            </>
        }
        let _COMPONENT_DATES = () => {
            let _CLOCK_3 = _GET_CLOCK_STATE(3)
            let _CLOCK_11 = _GET_CLOCK_STATE_V(11, currentVersionR)
            return <>
                <label >Fecha de Inicio</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-calendar-times"></i>
                    </span>
                    <input type="text" class="form-control" id="r_a_31_date_1" disabled
                        defaultValue={dateParser(currentItem.date)} />
                </div>
                <label >Fecha de Radicado</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-calendar-times"></i>
                    </span>
                    <input type="text" class="form-control" id="r_a_31_date_2" disabled
                        defaultValue={dateParser(_CLOCK_3.date_start)} />
                </div>
                <label >Fecha de Revision: {currentVersionR}</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-calendar-times"></i>
                    </span>
                    <input type="text" class="form-control" id="r_a_31_date_2" disabled
                        defaultValue={dateParser(_CLOCK_11.date_start)} />
                </div>
                <label >Fecha de Desistimiento</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-calendar-times"></i>
                    </span>
                    <input type="text" class="form-control" id="r_a_31_date_2" disabled
                        defaultValue={dateParser(dateParser_finalDate(_CLOCK_3.date_start, 45))} />
                </div>
            </>
        }
        let updateWorker = (_id) => {
            let _LIST = _GET_CHILD_FUN_52();
            document.getElementById("r_a_31_1").value = "";
            document.getElementById("r_a_31_2").value = "";
            document.getElementById("r_a_31_3").value = "";
            document.getElementById("r_a_31_4").value = "";
            document.getElementById("r_a_31_5").value = "";
            document.getElementById("r_a_31_52").value = "";
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _id) {
                    document.getElementById("r_a_31_1").value = _LIST[i].name + " " + _LIST[i].surname;
                    document.getElementById("r_a_31_2").value = _LIST[i].registration;
                    document.getElementById("r_a_31_3").value = _LIST[i].number;
                    document.getElementById("r_a_31_4").value = _LIST[i].email;
                    document.getElementById("r_a_31_52").value = _LIST[i].id;
                    break;
                }
            }
        }

        // FUNCTIONS AND APIS
        var formData = new FormData();

        let save_ra_31 = (e) => {
            if (e) e.preventDefault();

            let checks = [];
            let values = [];

            formData = new FormData();

            var values_html = document.getElementsByName('s_31_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value)
            }
            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's31');

            save_step('s31', true, formData);

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
                <div className="row">
                    <div className="col-6">
                        {_SELECT_PROFESIONAL()}
                        {_COMPONENT()}
                        <div className="text-center">
                            <MDBBtn className="btn btn-success my-3" onClick={() => save_ra_31()}>
                                <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                            </MDBBtn>
                        </div>
                    </div>
                    <div className="col-6">
                        {_COMPONENT_DATES()}
                    </div>
                </div>
            </div >
        );
    }
}

export default RECORD_ARC_31;