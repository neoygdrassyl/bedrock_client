import React, { Component } from 'react';
import FUNService from '../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MDBBtn } from 'mdb-react-ui-kit';

const MySwal = withReactContent(Swal);
class FUNN1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dis_m_urb: true,
            dis_m_sub: true,
            dis_m_lic: true,
        };
    }

    componentDidMount() {
        let _CHILD = this.props.currentItem.fun_1s ? this.props.currentItem.fun_1s[0] : {};
        if (_CHILD && _CHILD.tipo) {
            if (_CHILD.tipo.includes('A')) this.setState({ dis_m_urb: false });
            if (_CHILD.tipo.includes('C')) this.setState({ dis_m_sub: false });
            if (_CHILD.tipo.includes('D')) this.setState({ dis_m_lic: false });
        }
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;

        var formData = new FormData();

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
                    _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                    _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                    _CHILD_VARS.item_6 = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                    _CHILD_VARS.item_7 = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
                    _CHILD_VARS.item_8 = _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "";
                    _CHILD_VARS.item_9 = _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "";
                    _CHILD_VARS.item_101 = _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "";
                    _CHILD_VARS.item_102 = _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "";
                }
            }
            return _CHILD_VARS;
        }

        let _CHILD_0 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <input type="hidden" id="f_10" defaultValue={_CHILD_VARS.item_0} />
        }
        let _CHILD_11 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <td>
                <label>1.1 Tipo de Solicitud</label>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('A') ? true : false} onChange={e => this.setState({ dis_m_urb: !e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Licencia de Urbanización
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('B') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Licencia de Parcelación
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('C') ? true : false} onChange={e => this.setState({ dis_m_sub: !e.target.checked })} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Licencia de Subdivisión
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('D') ? true : false} onChange={e => this.setState({ dis_m_lic: !e.target.checked })} />
                    <label class="form-check-label" for="flexCheckChecked">
                        D. Licencia de Construcción
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('E') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        E. Intervención y ocupación del espacio Público
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="F" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('F') ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        F. Reconocimiento de la existencia de una edificación
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
                <label>1.2 Objeto del Tramite</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_12"
                        defaultChecked={_CHILD_VARS.item_2 == 'A' ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Inicial
                    </label>
                </div>
                {currentItem.model == 2021 ?
                    <div class="form-check">
                        <input class="form-check-input" type="radio" value="B" name="f_12"
                            defaultChecked={_CHILD_VARS.item_2 == 'B' ? true : false} />
                        <label class="form-check-label" for="flexCheckChecked">
                            B. Prórroga
                        </label>
                    </div>
                    : currentItem.model == 2022 ?
                        ''
                        : ''}

                <div class="form-check">
                    <input class="form-check-input" type="radio" value="C" name="f_12"
                        defaultChecked={_CHILD_VARS.item_2 == 'C' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Modificación de Licencia Vigente
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="D" name="f_12"
                        defaultChecked={_CHILD_VARS.item_2 == 'D' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        D. Revalidación
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
            let disabled = this.state.dis_m_urb;

            return <td>
                <label>1.3 Modalidad Licencia de Urbanización</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_13"
                        defaultChecked={_CHILD_VARS.item_3 == 'A' ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Desarrollo
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="B" name="f_13"
                        defaultChecked={_CHILD_VARS.item_3 == 'B' ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Saneamiento
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="C" name="f_13"
                        defaultChecked={_CHILD_VARS.item_3 == 'C' ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Reurbanización
                    </label>
                </div>
            </td>
        }
        let _CHILD_14 = () => {
            let _CHILD_VARS = _SET_CHILD_1();
            let disabled =  this.state.dis_m_sub;

            return <td>
                <label>1.4 Modalidad Licencia de Subdivisión</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_14"
                        defaultChecked={_CHILD_VARS.item_4 == 'A' ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Subdivisión rural
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="B" name="f_14"
                        defaultChecked={_CHILD_VARS.item_4 == 'B' ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Subdivisión urbana
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="C" name="f_14"
                        defaultChecked={_CHILD_VARS.item_4 == 'C' ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Reloteo
                    </label>
                </div>
            </td>
        }
        let _CHILD_15 = () => {
            let _CHILD_VARS = _SET_CHILD_1();
            let disabled =  this.state.dis_m_lic;

            return <td>
                <label>1.5 Modalidad Licencia de Construcción</label>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="A" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('A') ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Obra Nueva
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="B" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('B') ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        B. Ampliación
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="C" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('C') ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        C. Adecuación
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="D" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('D') ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        D. Modificación
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="E" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('E') ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        E. Restauración
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="F" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('F') ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        F. Reforzamiento Estructural
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="G" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('G') ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        G.1 Demolición: Total
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="g" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('g') ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        G.2 Demolición Parcial
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="H" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('H') ? true : false} disabled={disabled} />
                    <label class="form-check-label" for="flexCheckChecked">
                        H. Reconstrucción
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="I" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('I') ? true : false} disabled={disabled} />
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
                        B. Comercio y/o Servicios
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
                <label>1.7 Área Construida</label>
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
                        C. Alcanza o supera mediante ampliación los 2000 m2
                    </label>
                </div>
                {currentItem.model == 2021 ?
                    ''
                    : currentItem.model == 2022 ?
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="D" name="f_17"
                                defaultChecked={_CHILD_VARS.item_7 == 'D' ? true : false} />
                            <label class="form-check-label" for="flexCheckChecked">
                                D. Genera 5 o más unidades de vivienda para transferir a terceros
                            </label>
                        </div>
                        : ''}
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
                <label>1.9  Bien de Interés Cultural</label>
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
            let JSXC = <td colSpan="2">
                <label >1.10.1  Declaración sobre medidas de construcción sostenible</label>
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
            return currentItem.model == 2021 ?
                JSXC
                : currentItem.model == 2022 ?
                    ''
                    : ''
        }
        let _CHILD_102 = () => {
            let _CHILD_VARS = _SET_CHILD_1();
            let JSXC = <td>
                <label >1.10.2  Zónificacion Climática</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="A" name="f_102"
                        defaultChecked={_CHILD_VARS.item_102 == 'A' ? true : false} />
                    <label class="form-check-label" for="flexCheckDefault">
                        A. Frío
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
                        C. Cálido Seco
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" value="D" name="f_102"
                        defaultChecked={_CHILD_VARS.item_102 == 'D' ? true : false} />
                    <label class="form-check-label" for="flexCheckChecked">
                        D. Cálido Húmedo
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
            return currentItem.model == 2021 ?
                JSXC
                : currentItem.model == 2022 ?
                    ''
                    : ''
        }
        let _RESET_FORM_1 = () => {
            let _array = []
            //_array = document.getElementsByName("f_11");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];

            _array = document.getElementsByName("f_12");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_13");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_14");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            //_array = document.getElementsByName("f_15");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            //_array = document.getElementsByName("f_16");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_17");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_18");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_19");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_101");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_102");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            if (document.getElementById('f_12_o')) document.getElementById('f_12_o').value = "";
            document.getElementById('f_16_o').value = "";
            if (document.getElementById('f_102_o')) document.getElementById('f_102_o').value = "";
        }

        let new_1 = () => {
            formData = new FormData();
            let fun1Id = document.getElementById("f_10").value;
            let version = currentVersion;
            let fun0Id = currentItem.id;
            formData.set('version', version);
            formData.set('fun0Id', fun0Id);

            let value = null;
            let checkbox = null;
            let radios = null;
            let otherOption = null;
            // SET OF THE VARIABLES

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

            // 1.7 
            radios = document.getElementsByName("f_17");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('area', value);
            value = "";

            // 1.8
            radios = document.getElementsByName("f_18");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('vivienda', value);
            value = "";

            // 1.9
            radios = document.getElementsByName("f_19");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('cultural', value);
            value = "";

            // 1.10.1
            radios = document.getElementsByName("f_101");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('regla_1', value);
            value = "";

            // 1.10.2 CAN BE OTHERS
            otherOption = document.getElementById("f_102_o");
            if (otherOption) {
                if (otherOption.value) {
                    value = otherOption.value
                } else {
                    radios = document.getElementsByName("f_102");  // USES OTHER OPTION
                    for (var i = 0; i < radios.length; i++) {
                        if (radios[i].checked == true) {
                            value = radios[i].value
                        }
                    }
                } formData.set('regla_2', value);
            }


            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });

            if (currentItem.fun_1s[currentVersion - 1] == null) {
                FUNService.create_fun1(formData)
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
            } else {
                FUNService.update_1(fun1Id, formData)
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
                            if (response.status == 500) {
                                MySwal.close();
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    });
            }

        }
        return (<>
            {_CHILD_0()}
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_1">
                    <label className="app-p lead fw-normal text-uppercase">1. Identificación de la Solicitud</label>
                </legend>
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
                <div className="row mb-3">
                    <div className="col-6">
                        {_CHILD_17()}
                    </div>
                    <div className="col-6">
                        {_CHILD_18()}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        {_CHILD_19()}
                    </div>
                    <div className="col-6">
                        {_CHILD_102()}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-12">
                        {_CHILD_101()}
                    </div>
                </div>
                <div className="row mb-3 text-center">
                    <div className="col-6">
                        <MDBBtn className="btn btn-success my-3" onClick={() => new_1()}><i class="far fa-file-alt"></i> ACTUALIZAR </MDBBtn>
                    </div>
                    <div className="col-6">
                        <MDBBtn className="btn btn-warning my-3" onClick={() => _RESET_FORM_1()}><i class="fas fa-eraser"></i> LIMPIAR </MDBBtn>
                    </div>
                </div>
            </fieldset>
        </>);
    }
}

export default FUNN1;