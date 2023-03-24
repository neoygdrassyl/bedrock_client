import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { MDBBadge, MDBTooltip } from 'mdb-react-ui-kit';
import VIZUALIZER from '../../../../components/vizualizer.component';
const MySwal = withReactContent(Swal);

class RECORD_PH_PROFESIONALS extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, _FUN_52, _FUN_6, currentRecord } = this.props;
        const { } = this.state;

        // DATA GETTERS
        /*  ROLES LIST
            URBANIZADOR O CONSTRUCTOR RESPONSABLE
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
                if (_role == 'URBANIZADOR O CONSTRUCTOR RESPONSABLE') {
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
            return <label className="text-danger">FALTA INFORMACIÓN</label>;
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
                ?   <MDBTooltip title='HOJA DE VIDA Y CERTIFICADOS' tag='a' >
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

        // COMPONENT JSX
        let _PROFESIOAL_INFO_COMPONENT = () =>{
            var PROFESIONAL = _FIND_PROFESIOANL('ARQUITECTO PROYECTISTA');
            if(PROFESIONAL){
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
                        <div className="col-2">¿Sancionado?: <label className="fw-bold">{PROFESIONAL.sanction ? "SI": "NO"} </label></div>
                    </div>
               </>
            }
            return ""
        }
        let COMPONENT_PROFESIONAL_RULES = (_roles) => {
            let _COMPONENT = [];
            for (var i = 0; i < _roles.length; i++) {
                _COMPONENT.push(<>
                    <li class="list-group-item">{_PROFESIONAL_JSX(_roles[i])}</li>
                </>)
            }
            return <>{_COMPONENT}</>
        }
        let _PROFESIONAL_JSX = (_role) => {
            return <>
                <label> {_FIND_PROFESIOANL(_role)
                    ? <MDBBadge color='success'>DILIGENCIADO</MDBBadge>
                    : <MDBBadge color='danger'>SIN DILIGENCIAR</MDBBadge>} <label className="">{_role}</label> - Experiencia: {_CECK_EXPERIENCE(_role)}</label>
            </>
        }

        return (
            <div className="record_ph_profesional_evaluation container">
                <li class="list-group-item"><label className="fw-bold">PROFESIONAL RESPONSABLE DE LOS PLANOS</label></li>
                {COMPONENT_PROFESIONAL_RULES(['ARQUITECTO PROYECTISTA'])}
                {_PROFESIOAL_INFO_COMPONENT()}
            </div >
        );
    }
}

export default RECORD_PH_PROFESIONALS;