import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { MDBBadge } from 'mdb-react-ui-kit';
import { dateParser_yearsPassed } from '../../../../components/customClasses/typeParse';
const MySwal = withReactContent(Swal);

class RECORD_LAW_PROFESIONALS extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, _FUN_1, _FUN_52 } = this.props;
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

        //  DATA CONVERTES
        let _FIND_PROFESIOANL = (_role) => {
            for (var i = 0; i < _FUN_52.length; i++) {
                if (_FUN_52[i].role.includes(_role)) return true;
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
                        : <label className="text-danger">{years} año(s) de 5 años requeridos - Insuficinte</label>
                }
                else return <label className="text-warning">No requiere</label>
            }
            return <label className="text-danger">FALTA INFORMACION</label>;
        }

        let _REGEX_MATCH_PH = (_string) => {
            let regex = /p\.h/i;
            let regex2 = /PROPIEDAD.*HORIZONTAL/i;
            if(regex.test(_string) || regex2.test(_string)) return true;
            return false
        }
        let _REGEX_MATCH_MT = (_string) => {
            let regex = /movimiento\s+[a-zA-Z]+\s+tierra/i;
            return regex.test(_string);
        }
        let _REGEX_MATCH_AP = (_string) => {
            let regex = /piscina/i;
            return regex.test(_string);
        }

        // COMPONENT JSX
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
            <div className="record_lar_profesional_evaluation container">
                {_FUN_1.item_1.includes('A')
                    ? <><ul class="list-group mb-3">
                        <li class="list-group-item"><label className="fw-bold">A. MODALIDAD DE LICENCIA URBANISTICA</label></li>
                        {COMPONENT_PROFESIONAL_RULES(['URBANIZADOR O CONSTRUCTOR RESPONSABLE', 'ARQUITECTO PROYECTISTA', 'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO'])}
                    </ul> </> : ""}
                {_FUN_1.item_1.includes('B')
                    ? <><ul class="list-group mb-3">
                        <li class="list-group-item"><label className="fw-bold">B. MODALIDAD DE PARCELACION</label></li>
                        {COMPONENT_PROFESIONAL_RULES(['URBANIZADOR O CONSTRUCTOR RESPONSABLE', 'ARQUITECTO PROYECTISTA', 'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO'])}
                    </ul> </> : ""}
                {_FUN_1.item_1.includes('C')
                    ? <><ul class="list-group mb-3">
                        <li class="list-group-item"><label className="fw-bold">C. MODALIDAD DE SUBDIVICION</label></li>
                        {COMPONENT_PROFESIONAL_RULES(['ARQUITECTO PROYECTISTA', 'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO'])}
                    </ul> </> : ""}
                {_FUN_1.item_1.includes('D')
                    ? <><ul class="list-group mb-3">
                        <li class="list-group-item"><label className="fw-bold">D. MODALIDAD DE CONSTRUCCION</label></li>
                        {COMPONENT_PROFESIONAL_RULES(['URBANIZADOR O CONSTRUCTOR RESPONSABLE', 'ARQUITECTO PROYECTISTA', 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'])}
                        {_FUN_1.item_5.includes('A')
                            ? <>
                                <li class="list-group-item"><label className="fw-bold">D. MODALIDAD DE CONSTRUCCION - A. OBRA NUEVA</label></li>
                                {COMPONENT_PROFESIONAL_RULES(['DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES', 'INGENIERO CIVIL GEOTECNISTA'])}
                            </> : ""}
                        {_FUN_1.item_5.includes('B')
                            ? <>
                                <li class="list-group-item"><label className="fw-bold">D. MODALIDAD DE CONSTRUCCION - B. AMPLIACION</label></li>
                                {COMPONENT_PROFESIONAL_RULES(['DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES'])}
                            </> : ""}
                    </ul> </> : ""}
                    {(_FUN_1.item_1.includes('A') || _FUN_1.item_1.includes('D')) &&  (_FUN_1.item_7.includes('B') || _FUN_1.item_7.includes('C') )
                    ? <><ul class="list-group mb-3">
                        <li class="list-group-item"><label className="fw-bold">MODALIDADES DE URBANISTICA O CONSTRUCCION QUE SUPERA 2000 m2 DE AREA </label></li>
                        {COMPONENT_PROFESIONAL_RULES(['REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES'])}
                    </ul> </> : ""}
                {_FUN_1.item_1.includes('F') && !_FUN_1.item_1.includes('D')
                    ? <><ul class="list-group mb-3">
                        <li class="list-group-item"><label className="fw-bold">F. MODALIDAD DE RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACION </label></li>
                        {COMPONENT_PROFESIONAL_RULES(['ARQUITECTO PROYECTISTA', 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'])}
                    </ul> </> : ""}
                {_FUN_1.item_1.includes('G')
                    ? <> <ul class="list-group mb-3">
                        {_FUN_1.item_2 == 'B' ? <>
                            <li class="list-group-item"><label className="fw-bold">G. OTRAS ACTUACIONES - B. PRORROGA</label></li>
                            {COMPONENT_PROFESIONAL_RULES(['URBANIZADOR O CONSTRUCTOR RESPONSABLE'])}
                        </> : ""}
                        {_FUN_1.item_2 == 'D' ? <>
                            <li class="list-group-item"><label className="fw-bold">G. OTRAS ACTUACIONES - D. REVALISACION</label></li>
                            {COMPONENT_PROFESIONAL_RULES(['URBANIZADOR O CONSTRUCTOR RESPONSABLE'])}
                        </> : ""}
                        {_REGEX_MATCH_PH(_FUN_1.item_2) ? <>
                            <li class="list-group-item"><label className="fw-bold">G. OTRAS ACTUACIONES - OTRAS - P.H.</label></li>
                            {COMPONENT_PROFESIONAL_RULES(['ARQUITECTO PROYECTISTA'])}
                        </> : ""}
                        {_REGEX_MATCH_MT(_FUN_1.item_2) ? <>
                            <li class="list-group-item"><label className="fw-bold">G. OTRAS ACTUACIONES - OTRAS - MOVIMIENTO TIERRAS</label></li>
                            {COMPONENT_PROFESIONAL_RULES(['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'])}
                        </> : ""}
                        {_REGEX_MATCH_AP(_FUN_1.item_2) ? <>
                            <li class="list-group-item"><label className="fw-bold">G. OTRAS ACTUACIONES - OTRAS - APROBACION PISCINAS</label></li>
                            {COMPONENT_PROFESIONAL_RULES(['ARQUITECTO PROYECTISTA', 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'])}
                        </> : ""}
                    </ul> </> : ""}
            </div >
        );
    }
}

export default RECORD_LAW_PROFESIONALS;