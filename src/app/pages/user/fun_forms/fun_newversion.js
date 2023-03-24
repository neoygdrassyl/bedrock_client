import React, { Component } from 'react';
import Swal from 'sweetalert2'
import { MDBBtn } from 'mdb-react-ui-kit';
import withReactContent from 'sweetalert2-react-content'
import FUNService from '../../../services/fun.service'
import { formsParser1, dateParser } from '../../../components/customClasses/typeParse'


class FUN_NEWVERSION extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, toCreate, aim } = this.props;
        const { } = this.state;
        var formData = new FormData();
        const MySwal = withReactContent(Swal);

        let _COPY_CHILD = () => {
            formData = new FormData();

            let _CHILD_VARS = _SET_CHILD_1();
            formData.set('tipo', _CHILD_VARS.item_1);
            formData.set('tramite', _CHILD_VARS.item_2);
            formData.set('m_urb', _CHILD_VARS.item_3);
            formData.set('m_sub', _CHILD_VARS.item_4);
            formData.set('m_lic', _CHILD_VARS.item_5);
            formData.set('usos', _CHILD_VARS.item_6);
            formData.set('area', _CHILD_VARS.item_7);
            formData.set('vivienda', _CHILD_VARS.item_8);
            formData.set('cultural', _CHILD_VARS.item_9);
            formData.set('regla_1', _CHILD_VARS.item_101);
            formData.set('regla_2', _CHILD_VARS.item_102);

            _CHILD_VARS = _SET_CHILD_2();
            formData.set('direccion', _CHILD_VARS.item_211);
            formData.set('direccion_ant', _CHILD_VARS.item_212);
            formData.set('matricula', _CHILD_VARS.item_22);
            formData.set('catastral', _CHILD_VARS.item_23);
            formData.set('suelo', _CHILD_VARS.item_24);
            formData.set('lote_pla', _CHILD_VARS.item_25);
            formData.set('barrio', _CHILD_VARS.item_261);
            formData.set('vereda', _CHILD_VARS.item_262);
            formData.set('comuna', _CHILD_VARS.item_263);
            formData.set('sector', _CHILD_VARS.item_264);
            formData.set('corregimiento', _CHILD_VARS.item_265);
            formData.set('lote', _CHILD_VARS.item_266);
            formData.set('estrato', _CHILD_VARS.item_267);
            formData.set('manzana', _CHILD_VARS.item_268);

            _CHILD_VARS = _SET_CHILD_53();
            formData.set('name', _CHILD_VARS.item_5311);
            formData.set('surname', _CHILD_VARS.item_5312);
            formData.set('id_number', _CHILD_VARS.item_532);
            formData.set('role', _CHILD_VARS.item_533);
            formData.set('number', _CHILD_VARS.item_534);
            formData.set('email', _CHILD_VARS.item_535);
            formData.set('address', _CHILD_VARS.item_536);

            _CHILD_VARS = _SET_CHILD_C();
            formData.set('worker', _CHILD_VARS.item_c1);
            formData.set('date', _CHILD_VARS.item_c2);
            formData.set('condition', _CHILD_VARS.item_c3);
            formData.set('details', _CHILD_VARS.item_c4);
            formData.set('reciever_name', _CHILD_VARS.item_c5);
            formData.set('reciever_date', _CHILD_VARS.item_c6);
            formData.set('reciever_id', _CHILD_VARS.item_c7);
            formData.set('reciever_actor', _CHILD_VARS.item_c8);

            _CHILD_VARS = _SET_CHILD_R();
            formData.set('checked', _CHILD_VARS.item_r1);
            formData.set('code', _CHILD_VARS.item_r2);

        }

        let _SET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
                item_6: "",
                item_7: "",
                item_8: "",
                item_9: "",
                item_101: "",
                item_102: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo;
                    _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb;
                    _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub;
                    _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic;
                    _CHILD_VARS.item_6 = _CHILD[_CURRENT_VERSION].usos;
                    _CHILD_VARS.item_7 = _CHILD[_CURRENT_VERSION].area;
                    _CHILD_VARS.item_8 = _CHILD[_CURRENT_VERSION].vivienda;
                    _CHILD_VARS.item_9 = _CHILD[_CURRENT_VERSION].cultural;
                    _CHILD_VARS.item_101 = _CHILD[_CURRENT_VERSION].regla_1;
                    _CHILD_VARS.item_102 = _CHILD[_CURRENT_VERSION].regla_2;
                }
            }
            return _CHILD_VARS;
        }
        let _SET_CHILD_2 = () => {
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
        let _SET_CHILD_53 = () => {
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
                }
            }
            return _CHILD_VARS;
        }
        let _SET_CHILD_C = () => {
            var _CHILD = currentItem.fun_cs;
            var _CURRENT_VERSION = currentItem.version - 1;
            var _CHILD_VARS = {
                item_c0: "",
                item_c1: "",
                item_c2: "",
                item_c3: "",
                item_c4: "",
                item_c5: "",
                item_c6: "",
                item_c7: "",
                item_c8: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_c0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_c1 = _CHILD[_CURRENT_VERSION].worker;
                    _CHILD_VARS.item_c2 = _CHILD[_CURRENT_VERSION].date;
                    _CHILD_VARS.item_c3 = _CHILD[_CURRENT_VERSION].condition;
                    _CHILD_VARS.item_c4 = _CHILD[_CURRENT_VERSION].details;
                    _CHILD_VARS.item_c5 = _CHILD[_CURRENT_VERSION].reciever_name;
                    _CHILD_VARS.item_c6 = _CHILD[_CURRENT_VERSION].reciever_date;
                    _CHILD_VARS.item_c7 = _CHILD[_CURRENT_VERSION].reciever_id;
                    _CHILD_VARS.item_c8 = _CHILD[_CURRENT_VERSION].reciever_actor;
                }
            }

            return _CHILD_VARS;
        }
        let _SET_CHILD_R = () => {
            var _CHILD = currentItem.fun_rs;
            var _CURRENT_VERSION = currentItem.version - 1;
            var _CHILD_VARS = {
                item_c0: "",
                item_c1: "",
                item_c2: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_r0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_r1 = _CHILD[_CURRENT_VERSION].checked;
                    _CHILD_VARS.item_r2 = _CHILD[_CURRENT_VERSION].code;
                }
            }

            return _CHILD_VARS;
        }
        let _SET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                sign: null,
                new_type: null,
                publish_neighbour: null,
            }
            if (_CHILD) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.sign = _CHILD.sign;
                _CHILD_VARS.new_type = _CHILD.new_type;
                _CHILD_VARS.publish_neighbour = _CHILD.publish_neighbour;
            }
            return _CHILD_VARS;
        }

        let _CHILD_11 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td>
                <input type="hidden" id="f_10" defaultValue={_CHILD_VARS.item_0} />
                <label>1.1 Tipo de Solicitud</label>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('A') ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Licencia Urbanistica
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('B') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Licencia de Parcelacion
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('C') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Licencia de Subdivicion
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('D') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        D. Licencia de Construccion
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('E') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        E. Intervencion y ocupacon del espacio Publico
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="F" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('F') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        F. Reconocimiento de la existencia de una edificacion
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="G" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('G') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        G. Otras Actuaciones
                    </label>
                </div>
            </td>
        }
        let _CHILD_12 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td>
                <label>1.2 Objecto del Tramite</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_12"
                        defaultChecked={_CHILD_VARS.item_2 == 'A' ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Inicial
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="B" name="f_12"
                        defaultChecked={_CHILD_VARS.item_2 == 'B' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Prórroga
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="C" name="f_12"
                        defaultChecked={_CHILD_VARS.item_2 == 'C' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Modificacion de Licencia Vigente
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="D" name="f_12"
                        defaultChecked={_CHILD_VARS.item_2 == 'D' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        D. Revalidacion
                    </label>
                </div>
                <div class="input-group my-3">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-question-circle"></i>
                    </span>
                    <input type="text" class="form-control" placeholder="Otras Actuaciones, ¿Cual?"
                        defaultValue={_CHILD_VARS.item_2 != 'A' && _CHILD_VARS.item_2 != 'B' && _CHILD_VARS.item_2 != 'C'
                            && _CHILD_VARS.item_2 != 'D' ? _CHILD_VARS.item_2 : ""} id="f_12_o" />
                </div>
            </td>
        }
        let _CHILD_13 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td>
                <label>1.3 Modalidad Licencia de Urbanizacion</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_13"
                        defaultChecked={_CHILD_VARS.item_3 == 'A' ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Desarrollo
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="B" name="f_13"
                        defaultChecked={_CHILD_VARS.item_3 == 'B' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Saneamiento
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="C" name="f_13"
                        defaultChecked={_CHILD_VARS.item_3 == 'C' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Recuperacion
                    </label>
                </div>
            </td>
        }
        let _CHILD_14 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td>
                <label>1.4 Modalidad Licencia de Subdivicion</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_14"
                        defaultChecked={_CHILD_VARS.item_4 == 'A' ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Subdivision rural
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="B" name="f_14"
                        defaultChecked={_CHILD_VARS.item_4 == 'B' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Subdivision urbana
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="C" name="f_14"
                        defaultChecked={_CHILD_VARS.item_4 == 'C' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Reloteo
                    </label>
                </div>
            </td>
        }
        let _CHILD_15 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td>
                <label>1.5 Modalidad Licencia de Construccion</label>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('A') ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Obra Nueva
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('B') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Ampliacion
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('C') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Adecuacion
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('D') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        D. Modificacion
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('E') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        E. Restauracion
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="F" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('F') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        F. Reforzamiento Estructural
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="G" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('G') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        G.1 Demolicion: Total
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="g" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('g') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        G.2 Demolicion Parcial
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="H" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('H') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        H. Reconstruccion
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="I" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('I') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        I. Cerramiento
                    </label>
                </div>
            </td>
        }
        let _CHILD_16 = () => {
            let _CHILD_VARS = _SET_CHILD_1();
            let _arrayHelper = ['ABCD', 'ABC', 'ABD', 'ACD', 'AB', 'AC', 'AD', 'BC', 'BD', 'CD', 'A', 'B', 'C', 'D'];
            let _arrayPretty = "";
            let _otherValue = "";
            if (_CHILD_VARS.item_6) {
                _arrayPretty = _CHILD_VARS.item_6.replace(',', "");
                _otherValue = "";
                let flag = false;
                for (var i = 0; i < _arrayHelper.length; i++) {
                    if (_arrayPretty.includes(_arrayHelper[i])) {
                        flag = true;
                        break
                    }
                }
                if (!flag) {
                    _arrayPretty = "";
                    _otherValue = _CHILD_VARS.item_6;
                }
            }
            return <td>
                <label>1.6 Usos</label>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="f_16"
                        defaultChecked={_arrayPretty.includes('A') ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Vivienda
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="f_16"
                        defaultChecked={_arrayPretty.includes('B') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Comercio y/o Servicio
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="f_16"
                        defaultChecked={_arrayPretty.includes('C') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Institucional
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="f_16"
                        defaultChecked={_arrayPretty.includes('D') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        D. Industrial
                    </label>
                </div>
                <div class="input-group my-3">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-question-circle"></i>
                    </span>
                    <input type="text" class="form-control" placeholder="Otro, ¿Cual?"
                        id="f_16_o" defaultValue={_otherValue} />
                </div>
            </td>
        }
        let _CHILD_17 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td>
                <label>1.7 Area Construida</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_17"
                        defaultChecked={_CHILD_VARS.item_7 == 'A' ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Menor a 2000 m2
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="B" name="f_17"
                        defaultChecked={_CHILD_VARS.item_7 == 'B' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Igual o Mayor a 2000 m2
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="C" name="f_17"
                        defaultChecked={_CHILD_VARS.item_7 == 'C' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Alcanza o supera mmediamente apliacion los 2000 m2
                    </label>
                </div>
            </td>
        }
        let _CHILD_18 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td>
                <label>1.8 Tipo de Vivienda</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_18"
                        defaultChecked={_CHILD_VARS.item_8 == 'A' ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. VIP
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="B" name="f_18"
                        defaultChecked={_CHILD_VARS.item_8 == 'B' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. VIS
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="C" name="f_18"
                        defaultChecked={_CHILD_VARS.item_8 == 'C' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. NO VIS
                    </label>
                </div>
            </td>
        }
        let _CHILD_19 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td>
                <label>1.9  Bien de Interes Cultura</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_19"
                        defaultChecked={_CHILD_VARS.item_9 == 'A' ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. SI
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="B" name="f_19"
                        defaultChecked={_CHILD_VARS.item_9 == 'B' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. NO
                    </label>
                </div>
            </td>
        }
        let _CHILD_101 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td colSpan="2">
                <label >1.10.1  Declaracion sobre medidas de construccion sostenible</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_101"
                        defaultChecked={_CHILD_VARS.item_101 == 'A' ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Medidas Pasivas
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="B" name="f_101"
                        defaultChecked={_CHILD_VARS.item_101 == 'B' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Medidas Activas
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="C" name="f_101"
                        defaultChecked={_CHILD_VARS.item_101 == 'C' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Medidas Activas y Pasivas
                    </label>
                </div>
            </td>
        }
        let _CHILD_102 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td>
                <label >1.10.2  Zonificacion Climatica</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_102"
                        defaultChecked={_CHILD_VARS.item_102 == 'A' ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Frio
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="B" name="f_102"
                        defaultChecked={_CHILD_VARS.item_102 == 'B' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Templado
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="C" name="f_102"
                        defaultChecked={_CHILD_VARS.item_102 == 'C' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Calido Seco
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="D" name="f_102"
                        defaultChecked={_CHILD_VARS.item_102 == 'D' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        D. Calido Humedo
                    </label>
                </div>
                <div class="input-group my-3">
                    <span class="input-group-text bg-info text-white">
                        <i class="far fa-question-circle"></i>
                    </span>
                    <input type="text" class="form-control" placeholder="Otro clima, ¿Cual?" id="f_102_o"
                        defaultValue={_CHILD_VARS.item_102 != 'A' && _CHILD_VARS.item_102 != 'B' && _CHILD_VARS.item_102 != 'C'
                            && _CHILD_VARS.item_102 != 'D' ? _CHILD_VARS.item_102 : ""} />
                </div>
            </td>
        }

        let create_version = () => {
            formData.set('fun2Id', _SET_CHILD_2().item_20);
            formData.set('law_id', _SET_CHILD_LAW().id);
            FUNService.create_version(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.requestUpdate(currentItem.id)
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }

        let update_version = () => {
            formData.set('fun1Id', _SET_CHILD_1().item_0);
            formData.set('fun2Id', _SET_CHILD_2().item_20);
            formData.set('fun53Id', _SET_CHILD_53().item_530);
            formData.set('funcId', _SET_CHILD_C().item_c0);
            formData.set('funrId', _SET_CHILD_R().item_r0);
            formData.set('law_id', _SET_CHILD_LAW().id);
            FUNService.update_version(currentItem.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.requestUpdate(currentItem.id)
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }

        let manage_version = () => {
            _COPY_CHILD();
            let version = currentItem.version;
            let fun0Id = currentItem.id;

            formData.set('fun0Id', fun0Id);
            formData.set('state', currentItem.state);

            let value = null;
            let checkbox = null;
            let radios = null;
            let otherOption = null;
            // SET OF THE VARIABLES

            if (toCreate.fun_1_type) {
                // 1.1 CAN BE MULTIPLE
                value = []
                checkbox = document.getElementsByName("f_11");
                for (var i = 0; i < checkbox.length; i++) {
                    if (checkbox[i].checked) {
                        value.push(checkbox[i].value)
                    }
                } formData.set('tipo', value);
                value = "";

                // 1.2 CAN BE OTHERS
                otherOption = document.getElementById("f_12_o");
                if (otherOption.value) {
                    value = otherOption.value
                } else {
                    radios = document.getElementsByName("f_12"); // USES OTHER OPTION
                    for (var i = 0; i < radios.length; i++) {
                        if (radios[i].checked == true) {
                            value = radios[i].value
                        }
                    }
                } formData.set('tramite', value);
                otherOption = null;
                value = "";

                // 1.3
                radios = document.getElementsByName("f_13");
                for (var i = 0; i < radios.length; i++) {
                    if (radios[i].checked == true) {
                        value = radios[i].value
                    }
                } formData.set('m_urb', value);
                value = "";

                // 1.4
                radios = document.getElementsByName("f_14");
                for (var i = 0; i < radios.length; i++) {
                    if (radios[i].checked == true) {
                        value = radios[i].value
                    }
                } formData.set('m_sub', value);
                value = "";

                // 1.5 CAN BE MULTIPLE
                value = []
                checkbox = document.getElementsByName("f_15");
                for (var i = 0; i < checkbox.length; i++) {
                    if (checkbox[i].checked) {
                        value.push(checkbox[i].value)
                    }
                } formData.set('m_lic', value);
                value = "";

                // 1.6 CAN BE MULTIPLE && CAN BE OTHERS
                value = []
                otherOption = document.getElementById("f_16_o");
                if (otherOption.value) {
                    value.push(otherOption.value)
                } else {
                    checkbox = document.getElementsByName("f_16"); // USES OTHER OPTION
                    for (var i = 0; i < checkbox.length; i++) {
                        if (checkbox[i].checked) {
                            value.push(checkbox[i].value)
                        }
                    }
                } formData.set('usos', value);
                otherOption = null;
                value = "";
            }

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });


            switch (aim) {
                case "NT":
                    formData.set('new_type', true);
                    if (currentItem.fun_law.new_type) {
                        formData.set('version', version);
                        update_version()
                    } else {
                        formData.set('version', version +1);
                        create_version();
                    }
                default:
                    break;
            }


        }

        return (<>
            {toCreate.fun_1_type
                ? <>
                    <div className="row mb-3">
                        <div className="col-6">
                            {_CHILD_11()}
                        </div>
                        <div className="col-6">
                            {_CHILD_12()}
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-6">
                            {_CHILD_13()}
                        </div>
                        <div className="col-6">
                            {_CHILD_14()}
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-6">
                            {_CHILD_15()}
                        </div>
                        <div className="col-6">
                            {_CHILD_16()}
                        </div>
                    </div>
                </> : ""}
            <div className="row mb-3 text-center">
                <div className="col-12">
                    <MDBBtn className="btn btn-warning btn-lg my-3" onClick={() => manage_version()} ><i class="far fa-file-alt"></i> ACTUALIZAR VERSION</MDBBtn>
                </div>
            </div>
        </>);
    }
}


export default FUN_NEWVERSION;