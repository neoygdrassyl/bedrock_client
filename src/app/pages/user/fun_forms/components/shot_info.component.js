import React, { Component } from 'react';
import { formsParser1 } from '../../../../components/customClasses/typeParse';

class SHORT_INFO extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                id: "",
                tipo: "",
                tramite: "",
                m_urb: "",
                m_sub: "",
                m_lic: "",
                usos: "",
                area: "",
                vivienda: "",
                cultural: "",
                regla_1: "",
                regla_2: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.id = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb;
                    _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub;
                    _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic;
                    _CHILD_VARS.usos = _CHILD[_CURRENT_VERSION].usos;
                    _CHILD_VARS.area = _CHILD[_CURRENT_VERSION].area;
                    _CHILD_VARS.vivienda = _CHILD[_CURRENT_VERSION].vivienda;
                    _CHILD_VARS.cultural = _CHILD[_CURRENT_VERSION].cultural;
                    _CHILD_VARS.regla_1 = _CHILD[_CURRENT_VERSION].regla_1;
                    _CHILD_VARS.regla_2 = _CHILD[_CURRENT_VERSION].regla_2;
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_2 = () => {
            var _CHILD = currentItem.fun_2;
            var _CHILD_VARS = {
                item_20: "",
                item_211: "",
                item_212: "",
                item_22: "",
                item_23: "",
                item_24: "",
                item_25: "",
                item_261: "",
                item_262: "",
                item_263: "",
                item_264: "",
                item_265: "",
                item_266: "",
            }
            if (_CHILD) {
                _CHILD_VARS.item_20 = _CHILD.id;
                _CHILD_VARS.item_211 = _CHILD.direccion;
                _CHILD_VARS.item_212 = _CHILD.direccion_ant;
                _CHILD_VARS.item_22 = _CHILD.matricula;
                _CHILD_VARS.item_23 = _CHILD.catastral;
                _CHILD_VARS.item_24 = _CHILD.suelo; // PARSER
                _CHILD_VARS.item_25 = _CHILD.lote_pla;// PARSER

                _CHILD_VARS.item_261 = _CHILD.barrio;
                _CHILD_VARS.item_262 = _CHILD.vereda;
                _CHILD_VARS.item_263 = _CHILD.comuna;
                _CHILD_VARS.item_264 = _CHILD.sector;
                _CHILD_VARS.item_265 = _CHILD.corregimiento;
                _CHILD_VARS.item_266 = _CHILD.lote;
                _CHILD_VARS.item_267 = _CHILD.estrato;
                _CHILD_VARS.item_268 = _CHILD.manzana;
            }
            return _CHILD_VARS;
        }
        let _SET_CHILD_51 = () => {
            var _CHILD = currentItem.fun_51s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
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
                }
            }
            return _CHILD_VARS;
        }
        // COMPONENTS JSX
        let _COMPONENT = () => {
            return <>
                <div className='row py-1 text-center border border-dark bg-info text-light'>
                    <div className='col'>Responsable de la solicitud</div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col'>Nombre y Apellido(s):</div>
                    <div className='col fw-bold'>{_GET_CHILD_53().item_5311} {_GET_CHILD_53().item_5312}</div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col'>Identificación:</div>
                    <div className='col fw-bold'> {_GET_CHILD_53().item_532} </div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col'>Dirección:</div>
                    <div className='col fw-bold'> {_GET_CHILD_53().item_536} </div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col'>Teléfono: </div>
                    <div className='col fw-bold'> {_GET_CHILD_53().item_534} </div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col'>Correo: </div>
                    <div className='col fw-bold'> {_GET_CHILD_53().item_535} </div>
                </div>
                <div className='row py-1 text-center border border-dark border-dark bg-info text-light'>
                    <div className='col'>Titulares de Actuación</div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col fw-bold'>Nombre y Apellido(s):</div>
                    <div className='col fw-bold'>Identificación: </div>
                    <div className='col fw-bold'>En calidad de: </div>
                </div>
                {_SET_CHILD_51().map(value => <>
                    <div className='row py-1 text-center border border-dark'>
                        <div className='col '>{value.name} {value.surname}</div>
                        <div className='col'>{value.id_number} </div>
                        <div className='col'>{value.role} </div>
                    </div>
                </>)}
                <div className='row py-1 text-center border border-dark border-dark bg-info text-light'>
                    <div className='col'>Informacion General</div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col'>No Actuación Urbanística: </div>
                    <div className='col fw-bold'>{currentItem.id_public} </div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col'>Tipo de Actuación: </div>
                    <div className='col fw-bold'>{formsParser1(_GET_CHILD_1())}</div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col'>Predio Número: </div>
                    <div className='col fw-bold'>{_GET_CHILD_2().item_23}</div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col'>Matricula Inmobiliaria: </div>
                    <div className='col fw-bold'>{_GET_CHILD_2().item_22}</div>
                </div>
                <div className='row py-1 text-center border border-dark'>
                    <div className='col'>Ubicación Predio: </div>
                    <div className='col fw-bold'> {_GET_CHILD_2().item_211} </div>
                </div>
            </>
        }

        // FUNCTIONS AND WORKING ENGINES


        return (
            <div className="row p-1 m-1">
                {_COMPONENT()}
            </div>
        );
    }
}

export default SHORT_INFO;