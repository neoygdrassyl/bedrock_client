import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { MDBBadge, MDBTooltip } from 'mdb-react-ui-kit';
import VIZUALIZER from '../../../../components/vizualizer.component';
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'
const MySwal = withReactContent(Swal);

const profs = [
    ['URBANIZADOR O CONSTRUCTOR RESPONSABLE', 'DIRECTOR DE LA CONSTRUCCION'],
    ['ARQUITECTO PROYECTISTA'],

    ['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'],
    ['DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES'],
    ['INGENIERO CIVIL GEOTECNISTA'],
    ['INGENIERO TOPOGRAFO Y/O TOPÓGRAFO'],
]

class RECORD_ENG_PROFESIONALS extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, _FUN_52, _FUN_6, currentItem, currentRecord, profs, useCB } = this.props;
        const { } = this.state;

        // DATA GETTERS
        /*  ROLES LIST
            URBANIZADOR O CONSTRUCTOR RESPONSABLE (2021)
            DIRECTOR DE LA CONSTRUCCION (2022)
            ARQUITECTO PROYECTISTA
            INGENIERO CIVIL DISEÑADOR ESTRUCTURAL
            DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES
            INGENIERO CIVIL GEOTECNISTA
            INGENIERO TOPOGRAFO Y/O TOPÓGRAFO
            REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES
            OTROS PROFESIONALES ESPECIALISTAS
        */
        let _GET_CHILD_6 = () => {
            var _CHILD = _FUN_6;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_REVIEW_GEN = () => {
            var _CHILD = currentRecord.review_check;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD.split(';');
            }
            return _LIST;
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_eng_steps || [];
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        //  DATA CONVERTES
        let _FIND_PROFESIOANL = (_role) => {
            for (var i = 0; i < _FUN_52.length; i++) {
                if (_FUN_52[i].role.includes(_role)) return _FUN_52[i];
            }
            return false;
        }
        let _FIND_EXPERIENCE = (_role) => {
            for (var i = 0; i < _FUN_52.length; i++) {
                if (_FUN_52[i].role.includes(_role)) return _FUN_52[i].expirience;
            }
            return false;
        }
        let _CECK_EXPERIENCE = (_role) => {
            let experience = _FIND_EXPERIENCE(_role);
            if (experience) {
                let years = Math.trunc(experience / 12);
                if (_role == 'URBANIZADOR O CONSTRUCTOR RESPONSABLE' || _role == 'DIRECTOR DE LA CONSTRUCCION') {
                    return years >= 3
                        ? <label className="text-success">{years} año(s) de 3 años requeridos - CUMPLE</label>
                        : <label className="text-danger">{years} año(s) de 3 años requeridos - NO CUMPLE</label>
                }
                else if (_role == 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL') {
                    return years >= 5
                        ? <label className="text-success">{years} año(s) de 5 años requeridos - CUMPLE</label>
                        : <label className="text-danger">{years} año(s) de 5 años requeridos - NO CUMPLE</label>
                }
                else if (_role == 'DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES') {
                    return years >= 3
                        ? <label className="text-success">{years} año(s) de 3 años requeridos - CUMPLE</label>
                        : <label className="text-danger">{years} año(s) de 3 años requeridos - NO CUMPLE</label>
                }
                else if (_role == 'INGENIERO CIVIL GEOTECNISTA') {
                    return years >= 5
                        ? <label className="text-success">{years} año(s) de 5 años requeridos - CUMPLE</label>
                        : <label className="text-danger">{years} año(s) de 5 años requeridos - NO CUMPLE</label>
                }
                else if (_role == 'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES') {
                    return years >= 5
                        ? <label className="text-success">{years} año(s) de 5 años requeridos - Suficiente</label>
                        : <label className="text-danger">{years} año(s) de 5 años requeridos - Insuficiente</label>
                }
                else return <label className="text-warning">No requiere</label>
            }
            return <label className="text-danger">FALTA INFORMACION</label>;
        }
        let _GET_DOCS_BTNS = (_item) => {
            if (!_item) return "";
            var _array = _item.split(',');
            var _COMPONENT = [];

            _COMPONENT.push(<>{_array[0] > 0
                ?
                <MDBTooltip title='CEDULA DE CIUDADANIA' tag='a' >
                    <VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'}
                        icon={'far fa-id-card fa-2x me-1'} color={'DeepSkyBlue'} /> </MDBTooltip>
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ?
                <MDBTooltip title='MATRICULA' tag='a' >
                    <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                        icon={'far fa-id-badge fa-2x me-1'} color={'DarkOrchid'} /> </MDBTooltip>
                : ""}</>)

            _COMPONENT.push(<>{_array[2] > 0
                ?
                <MDBTooltip title='FICHA COPNIA' tag='a' >
                    <VIZUALIZER url={_FIND_6(_array[2]).path + "/" + _FIND_6(_array[2]).filename} apipath={'/files/'}
                        icon={'fas fa-book fa-2x me-1'} color={'GoldenRod'} /> </MDBTooltip>
                : ""}</>)

            _COMPONENT.push(<>{_array[2] > 0
                ? <MDBTooltip title='HOJA DE VIDA Y CERTIFICADOS' tag='a' >
                    <VIZUALIZER url={_FIND_6(_array[3]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                        icon={'fas fa-file-invoice fa-2x me-1'} color={'LimeGreen'} /> </MDBTooltip>
                : ""}</>)

            return <>{_COMPONENT}</>
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
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ?? []
            if (!value.length) return [];
            value = value.split(';');
            return value
        }
        // COMPONENT JSX
        let _PROFESIOAL_INFO_COMPONENT = () => {
            var PROFESIONAL = _FIND_PROFESIOANL('INGENIERO CIVIL GEOTECNISTA');
            if (PROFESIONAL) {
                return <>
                    <div className="row border p-2">
                        <div className="col-6">
                            <label className="fw-bold"> {PROFESIONAL.name + " " + PROFESIONAL.surname} {_GET_DOCS_BTNS(PROFESIONAL.docs)}</label>
                        </div>
                        <div className="col-2">Matricula: <label className="fw-bold">{PROFESIONAL.registration_date} </label></div>
                        <div className="col-2">¿Vigente?:
                            <select className='form-select' name="review_check_2" defaultValue={_GET_CHILD_REVIEW_GEN()[0]} >
                                <option value="1" className="text-success">SI</option>
                                <option value="0" className="text-danger">NO</option>
                            </select>
                        </div>
                        <div className="col-2">¿Sancionado?: <label className="fw-bold">{PROFESIONAL.sanction ? "SI" : "NO"} </label></div>
                    </div>
                </>
            }
            return ""
        }
        let COMPONENT_PROFESIONAL_RULES = (_rolesArray) => {
            return <>
                {_rolesArray.map((roles, i) => {
                    if (roles.length > 1) {
                        let role = roles[0];
                        roles.map(r => { if (_FIND_PROFESIOANL(r)) role = r });
                        return <li class="list-group-item">{_PROFESIONAL_JSX(role, i)}</li>
                    } else {
                        return <li class="list-group-item">{_PROFESIONAL_JSX(roles[0], i)}</li>
                    }
                })}
            </>
        }
        let _PROFESIONAL_JSX = (_role, i) => {
            let VALUES = _GET_STEP_TYPE('cb_profs', 'value');
            let CHECKS = _GET_STEP_TYPE('cb_profs', 'check');
            let dc = CHECKS[i] == 1 ? true : false;
            return <>
                {useCB ? <input class="form-check-input mx-2" type="checkbox" value={_role} name="cb_profs" defaultChecked={dc || false}
                    onChange={() => manage_step()} /> : ''}
                {_FIND_PROFESIOANL(_role)
                    ? <MDBBadge color='success'>DILIGENCIADO</MDBBadge>
                    : <MDBBadge color='danger'>SIN DILIGENCIAR</MDBBadge>}
                <label>&nbsp;{_role}:</label>
                <label className='fw-bold'>&nbsp;{_FIND_PROFESIOANL(_role).name} {_FIND_PROFESIOANL(_role).surname}</label>
                <label>&nbsp; - Experiencia: {_CECK_EXPERIENCE(_role)}</label>
            </>
        }


        // APIS
        let manage_step = (e) => {
            if (e) e.preventDefault();
            var formData = new FormData();

            let checks = [];
            let values = [];
            var html = document.getElementsByName('cb_profs');
            for (var i = 0; i < html.length; i++) {
                checks.push(html[i].checked ? 1 : 0)
                values.push(html[i].value)
            }
            formData.set('check', checks.join(';'));
            formData.set('value', values.join(';'));

            formData.set('version', 1);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'cb_profs');
            save_step('cb_profs', false, formData);


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
                            this.props.requestUpdate(currentItem.id);
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
                            this.props.requestUpdate(currentItem.id);
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
            <div className="record_ph_profesional_evaluation container">
                <li class="list-group-item"><label className="fw-bold">PROFESIONALES</label></li>
                {COMPONENT_PROFESIONAL_RULES(profs)}
                {_PROFESIOAL_INFO_COMPONENT()}
            </div >
        );
    }
}

export default RECORD_ENG_PROFESIONALS;