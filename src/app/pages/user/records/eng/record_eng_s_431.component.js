import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'

const MySwal = withReactContent(Swal);

class RECORD_ENG_STEP_431 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        if (!this.props.isP) this.setState({ showSection: true });
        else this.setState({ showSelect: true });
        this.checkForStudy();
    }
    checkForStudy() {
        var _CHILD = this.props.currentRecord.record_eng_steps;
        var STEP = null;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == this.props.currentVersionR && _CHILD[i].id_public == 'sp') {
                STEP = _CHILD[i];
                break;
            }
        }
        if (STEP) {
            //document.getElementById('r_e_p_select').value = STEP.check
            if (STEP.check == 1) this.setState({ showSection: true });
            if (STEP.check == 0) this.setState({ showSection: false });
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.currentRecord !== prevProps.currentRecord) this.checkForStudy();

    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, isP } = this.props;
        const { } = this.state;
        const SUBCATEGORIES = currentRecord.subcategory ? currentRecord.subcategory.split(';') : [];
        //  CONST
        const STEP_01_SUPPORT = {
            BAJA: {
                niveles: 'Hasta 3 niveles',
                cargas: 'Menor de 800 kN',
                profundidad: 'Mínima 6 m.',
                sondeos: 'Mínimo 3',
                supervicion: 'No necesaria',
            },
            MEDIA: {
                niveles: 'Nivel entre 4 y 10',
                cargas: 'De 801 y 4000 kN',
                profundidad: 'Mínima 15 m.',
                sondeos: 'Mínimo 4',
                supervicion: 'SI Ing. civil geot.',
            },
            ALTA: {
                niveles: 'Nivel entre 11 y 20',
                cargas: 'De 4001 y 8000 kN',
                profundidad: 'Mínima 25 m.',
                sondeos: 'Mínimo 4',
                supervicion: 'SI Ing. civil geot.',
            },
            ESPECIAL: {
                niveles: 'Mayor 20 niveles',
                cargas: 'Mayor de 8000 kN',
                profundidad: 'Mínima 30 m.',
                sondeos: 'Mínimo 5',
                supervicion: 'SI Ing. civil geot.',
            },
        }
        const STEP_03_tipo_perfil = {
            '-': {
                velocidad: '',
                golpepie: '',
                resistencia: '',
                su: '',
            },
            A: {
                velocidad: 'Perfil roca competente',
                golpepie: 'Vs = > 1500 m/s',
                resistencia: '0.00',
                su: '0.00',
            },
            B: {
                velocidad: 'Perfil roca rigidez media',
                golpepie: 'Vs = (760 y 1500) m/s',
                resistencia: '0.00',
                su: '0.00',
            },
            C: {
                velocidad: 'Perfil denso o roca blanda ',
                golpepie: 'Vs = (360 y 760) m/s',
                resistencia: 'N = >  50 g/p',
                su: 'Su = > 100 KPa ',
            },
            D: {
                velocidad: 'Perfil de suelo rígido',
                golpepie: 'Vs = (180 y 360) m/s',
                resistencia: 'N = (15 y 50) g/p',
                su: 'Su = (100 y 50) KPa',
            },
            E: {
                velocidad: 'Mas de 3m arcillas blandas',
                golpepie: 'Vs < 180 m/s IP>20 W>40%',
                resistencia: 'N = menor 15 g/p ',
                su: 'Su = Menor de 50 KPa',
            },
            F: {
                velocidad: 'F1 Colapsables, licuables, sensitivos',
                golpepie: 'F2 = Arcillas orgánicas e>3 m',
                resistencia: 'F3 = arcillas alta plasticidad e>7.5m IP>75 ',
                su: 'F4 Arcillas Blandas H=36m.',
            },
        }
        const H2221 = [
            'Nombre, plano de localización, objetivo del estudio, descripción general, sistema estructural y evaluación de cargas.',
            'Resumen del reconocimiento de campo, morfología del terreno, origen geológico, características físico mecánicas y descripción de los niveles freáticos o aguas subterráneas',
            'De cada unidad geológica o de suelo, se hará su identificación, su espesor, su distribución y los parámetros obtenidos en las pruebas y ensayos de campo',
            'Cumple el número de unidades de construcción a la cual se le realiza la exploración geotécnica',
            '¿Se presenta la clasificación de la edificación de acuerdo a su categoría?',
            '¿Presenta la localización, número y profundidad de los sondeos realizados?',
            'Registro de los sondeos',
            '¿Presenta la clasificación del tipo de suelo? (A.2.4.4)',
            '¿Presenta los parámetros de diseño sísmico?',
            '¿Presenta la caracterización del suelo? (A.2.4.4)',
            '¿Realiza el cálculo de capacidad de carga del suelo?',
            '¿Presenta la recomendación de tipo de cimentación y profundidad?',
            '¿Se realizó el análisis de estabilidad de taludes?',
            '¿Se realizó el cálculo de asentamientos?',
            '¿Incluye recomendaciones proceso constructivo?',
            '¿Incluye recomendaciones protección de edificaciones vecinas?',
            '¿Incluye anexos, ensayos, laboratorios, etc?'
        ]
        const _gravity = 9.80665;
        const _golpie_matrix_base = [
            [0.6, 1.69],
            [1, 1.65],
            [1.5, 1.6],
            [2, 1.5],
            [3, 1.35],
            [4, 1.2],
            [5, 1],
            [10, 0.7],
            [15, 0.55],
            [20, 0.5]
        ]

        // FUNCTIONS & VARIABLES
        let _golpie_matrix = () => {
            let matrix = _golpie_matrix_base;
            matrix[0][2] = 1.75
            for (var i = 1; i < matrix.length; i++) {
                let a0 = _golpie_matrix_base[i - 1][0];
                let b0 = _golpie_matrix_base[i - 1][1];
                let a1 = _golpie_matrix_base[i][0];
                let b1 = _golpie_matrix_base[i][1];
                matrix[i][2] = ((b0 - b1) / (a1 - a0) * (a1 - var_a121()) + b1).toFixed(3)
            }
            return matrix;
        }
        let _search_golpie_matrix = () => {
            var value = Math.trunc(Math.round(var_a121()))
            let matrix = _golpie_matrix();
            for (var i = 0; i < matrix.length; i++) {
                if (matrix[i][0] == value || matrix[i][1] == value) return matrix[i][2]
            }
            return 0;
        }

        let var_a121 = () => Number(document.getElementById('i53').value) ?? 0
        let var_a122 = () => Number(document.getElementById('e53').value) ?? 0
        let var_a123 = () => Number(document.getElementById('i54').value) ?? 0
        let var_a125 = () => Math.round(var_a122() * var_b120() * var_d129()).toFixed(2)
        let var_b120 = () => _search_golpie_matrix();
        let var_d129 = () => 0.75;

        let _set_e54 = () => {
            if (!var_a123()) document.getElementById('e54').value = null
            let op = 0;
            if (var_a123() > 1.29) op = 0.8 * var_a125() * Math.pow((var_a123() + 0.3) / var_a123(), 2);
            else op = 1.2 * var_a125();
            op = (op * _gravity).toFixed(2);
            document.getElementById('e54').value = op;
        }
        let _set_e56 = () => {
            let op = Number(var_a122()) / 5.5;
            op = op.toFixed(2)
            document.getElementById('e56').value = op;
        }
        let _set_i56 = () => {
            let e55 = Number(document.getElementById('e55').value) ?? 0;
            let op = Math.pow(Math.tan(degrees_to_radians(45 - e55 / 2)), 2);
            op = op.toFixed(2)
            document.getElementById('i56').value = op;
        }
        let _set_i57 = () => {
            let e55 = Number(document.getElementById('e55').value) ?? 0;
            let op = Math.pow(Math.tan(degrees_to_radians(45 + e55 / 2)), 2);
            op = op.toFixed(2)
            document.getElementById('i57').value = op;
        }

        let update_values = () => {
            _set_e54();
            _set_e56();
            _set_i56();
            _set_i57();
        }
        // DATA GETTERS
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_eng_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_REVIEW = () => {
            var _CHILD = currentRecord.record_eng_reviews;
            var _CURRENT_VERSION = currentVersionR - 1;
            var _CHILD_VARS = {
                id: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].id : false,
                check: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].check : "",
                check_2: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].check_2 : "",
                date: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].date : "",
                desc: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].desc : "",
                detail: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].detail : "",
                detail_2: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].detail_2 : "",
                worker_id: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].worker_id : "",
                worker_name: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].worker_name : "",
                version: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].version : "",
            }
            return _CHILD_VARS;
        }

        // DATA CONVERTERS
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (!_VALUE) {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == '0') {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == '1') {
                return 'form-select text-success form-control form-control-sm';
            }
            if (_VALUE == '2') {
                return 'form-select text-warning form-control form-control-sm';
            } else {
                return 'form-select form-control form-control-sm';
            }
        }
        let _SET_VALUES = (value) => {
            if (!value) return {}
            const newValue = STEP_01_SUPPORT[value];
            document.getElementById('recprd_eng_s01_1').value = newValue.niveles;
            document.getElementById('recprd_eng_s01_2').value = newValue.cargas;
            document.getElementById('recprd_eng_s01_3').value = newValue.profundidad;
            document.getElementById('recprd_eng_s01_4').value = newValue.sondeos;
            document.getElementById('recprd_eng_s01_5').value = newValue.supervicion;
        }
        let _SET_VALUES_03 = (value) => {
            if (!value) return {}
            const newValue = STEP_03_tipo_perfil[value];
            document.getElementById('recprd_eng_s03_1').value = newValue.velocidad;
            document.getElementById('recprd_eng_s03_2').value = newValue.golpepie;
            document.getElementById('recprd_eng_s03_3').value = newValue.resistencia;
            document.getElementById('recprd_eng_s03_4').value = newValue.su;
            manage_step_01()
        }
        let _GET_STEP_TYPE_INDEX = (_id_public, _type, _index) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return null;
            var value = STEP[_type]
            if (!value) return [];
            value = value.split(';');
            return value[_index]
        }
        let degrees_to_radians = (degrees) => {
            var pi = Math.PI;
            return degrees * (pi / 180);
        }
        // COMPONENT JSX
        let COMPONENT_01 = () => {
            return <>
                <div className="row">
                    <div className="col-5">
                        <div class="input-group my-0">
                            <span class="input-group-text bg-info text-white">
                                Categoría Construcción (H.3.1)
                            </span>
                            <select class="form-select form-control form-control-sm" id="recprd_eng_s01_select" onChange={(e) => _SET_VALUES(e.target.value)}
                                defaultValue={_GET_STEP_TYPE_INDEX('s4311', 'value', 5) ?? 'BAJA'} onBlur={(e) => manage_step_01(e)}>
                                <option>BAJA</option>
                                <option>MEDIA</option>
                                <option>ALTA</option>
                                <option>ESPECIAL</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-5">
                        <div class="input-group my-0">
                            <span class="input-group-text bg-info text-white">
                                Segun los Niveles
                            </span>
                            <input type="text" disabled className="form-control" id="recprd_eng_s01_1" defaultValue={_GET_STEP_TYPE_INDEX('s4311', 'value', 0) ?? 'Hasta 3 niveles'} />
                        </div>
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4311', 'check', 0) ?? 1)} id="r_e_select_s4311_1"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4311', 'check', 0) ?? 1} onBlur={(e) => manage_step_01(e)}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">N/A</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-5">
                        <div class="input-group my-0">
                            <span class="input-group-text bg-info text-white">
                                Numero de Sondeos
                            </span>
                            <input type="text" disabled className="form-control" id="recprd_eng_s01_2" defaultValue={_GET_STEP_TYPE_INDEX('s4311', 'value', 1) ?? 'Mínimo 3'} />
                        </div>
                    </div>
                    <div className="col-5">
                        <div class="input-group my-0">
                            <span class="input-group-text bg-info text-white">
                                Profundidad (h.3.2.1)
                            </span>
                            <input type="text" disabled className="form-control" id="recprd_eng_s01_3" defaultValue={_GET_STEP_TYPE_INDEX('s4311', 'value', 2) ?? 'Mínima 6 m.'} />
                        </div>
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4311', 'check', 1) ?? 1)} id="r_e_select_s4311_2"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4311', 'check', 1) ?? 1} onBlur={(e) => manage_step_01(e)}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">N/A</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-5">
                        <div class="input-group my-0">
                            <span class="input-group-text bg-info text-white">
                                Cargas en Columna
                            </span>
                            <input type="text" disabled className="form-control" id="recprd_eng_s01_4" defaultValue={_GET_STEP_TYPE_INDEX('s4311', 'value', 3) ?? 'Menor de 800 kN'} />
                        </div>
                    </div>
                    <div className="col-5">
                        <div class="input-group my-0">
                            <span class="input-group-text bg-info text-white">
                                Supersivisíon Técnica
                            </span>
                            <input type="text" disabled className="form-control" id="recprd_eng_s01_5" defaultValue={_GET_STEP_TYPE_INDEX('s4311', 'value', 4) ?? 'No necesaria'} />
                        </div>
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4311', 'check', 2) ?? 1)} id="r_e_select_s4311_3"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4311', 'check', 2) ?? 1} onBlur={(e) => manage_step_01(e)}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">N/A</option>
                        </select>
                    </div>
                </div>
            </>
        }
        let COMPONENT_02 = () => {
            return <>
                {H2221.map((value, i) => (
                    <div className="row border my-0">
                        <div className="col-10">
                            <div class="input-group my-0">
                                <label>{value}</label>
                            </div>
                        </div>
                        <div className="col-2">
                            <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4312', 'check', i) ?? 1)} name="recprd_eng_s02_2"
                                defaultValue={_GET_STEP_TYPE_INDEX('s4312', 'check', i) ?? 1} onBlur={(e) => manage_step_01(e)}>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                                <option value="2" className="text-warning">N/A</option>
                            </select>
                        </div>
                    </div>
                ))}
            </>
        }
        let COMPONENT_03 = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-3">
                        <label>Numero Golpes/Pie</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" id='e53' onChange={() => update_values()} onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 0) ?? ''} />
                    </div>
                    <div className="col-3">
                        <label>Profundidad captación (ml)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" id='i53' onChange={() => update_values()} onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 1) ?? ''} />
                    </div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Presión o capacidad portante (kPa)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" disabled id='e54'
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 2) ?? ''} />
                    </div>
                    <div className="col-3">
                        <label>Ancho del cimiento (ml)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01" id='i54'
                            className="form-control" name="recprd_eng_s03" onChange={() => update_values()} onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 3) ?? ''} />
                    </div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Angulo Fricción interna (Grados)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" id='e55' onChange={() => update_values()} onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 4) ?? ''} />
                    </div>
                    <div className="col-3"></div>
                    <div className="col-2"></div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Módulo de Balasto  Ks (kg/cm<sup>3</sup>)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" disabled id='e56'
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 5) ?? ''} />
                    </div>
                    <div className="col-3">
                        <label>Coef. presión activa  Ka</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" disabled id='i56'
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 6) ?? ''} />
                    </div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Nivel freático  NF (m)</label>
                    </div>
                    <div className="col-2">
                        <input type="text"
                            className="form-control" name="recprd_eng_s03" id='e57' onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 7) ?? ''} />
                    </div>
                    <div className="col-3">
                        <label>Coef. presión pasiva Kp</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" disabled id='i57'
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 8) ?? ''} />
                    </div>
                    <div className="col-2"></div>
                </div>

                <label className="app-p fw-bold my-2">Características sísmicas</label>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Aa Acele. pico efectiva (A.2.2)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" id='e60' onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 9) ?? ''} />
                    </div>
                    <div className="col-3">
                        <label>Av Velocidad pico efectiva</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" id='j60' onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 10) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4313', 'check', 0) ?? 1)}
                            name="recprd_eng_s03_check" onChange={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'check', 0) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">N/A</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Zona amenaza sísmica (A.2.3)</label>
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4313', 'value', 1) ?? 'ALTA')}
                            name="recprd_eng_s03" id='e61' onChange={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 0) ?? 1}>
                            <option>ALTA</option>
                            <option>MEDIA</option>
                            <option>BAJA</option>
                        </select>
                    </div>
                    <div className="col-3">
                        <label>Ae Vel reducida (A.10.3)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" id='j61' onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 12) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4313', 'check', 1) ?? 1)}
                            name="recprd_eng_s03_check" onChange={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'check', 1) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">N/A</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3"></div>
                    <div className="col-2"></div>
                    <div className="col-3">
                        <label>Ad Vel umbral daño (A.12.2)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" id='j62' onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 13) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4313', 'check', 2) ?? 1)}
                            name="recprd_eng_s03_check" onChange={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'check', 2) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">N/A</option>
                        </select>
                    </div>
                </div>

                <label className="app-p fw-bold my-2">Tipo perfil</label>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Tipo perfil de suelo (A.2.4.2)</label>
                    </div>
                    <div className="col-2">
                        <select className='form-select'
                            name="recprd_eng_s03" id='e63' onChange={(e) => _SET_VALUES_03(e.target.value)}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 14) ?? '-'}>
                            <option>-</option>
                            <option>A</option>
                            <option>B</option>
                            <option>C</option>
                            <option>D</option>
                            <option>E</option>
                            <option>F</option>
                        </select>
                    </div>
                    <div className="col-3"></div>
                    <div className="col-2"></div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Descripción suelo</label>
                    </div>
                    <div className="col-3">
                        <input type="text"
                            className="form-control" name="recprd_eng_s03" disabled id='recprd_eng_s03_1'
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 15) ?? ''} />
                    </div>
                    <div className="col-3">
                        <label>Vel. onda cortante</label>
                    </div>
                    <div className="col-3">
                        <input type="text"
                            className="form-control" name="recprd_eng_s03" disabled id='recprd_eng_s03_2'
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 16) ?? ''} />
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Núm. golpes/pie</label>
                    </div>
                    <div className="col-3">
                        <input type="text"
                            className="form-control" name="recprd_eng_s03" disabled id='recprd_eng_s03_3'
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 17) ?? ''} />
                    </div>
                    <div className="col-3">
                        <label>Resist. No drenada</label>
                    </div>
                    <div className="col-3">
                        <input type="text"
                            className="form-control" name="recprd_eng_s03" disabled id='recprd_eng_s03_4'
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 18) ?? ''} />
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Fa = Periodos cortos</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" id='e66' onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 19) ?? ''} />
                    </div>
                    <div className="col-3">
                        <label>Fv= Periodos intermedios</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s03" id='j66' onBlur={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'value', 20) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4313', 'check', 3) ?? 1)}
                            name="recprd_eng_s03_check" onChange={() => manage_step_01()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4313', 'check', 3) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">N/A</option>
                        </select>
                    </div>
                </div>
            </>
        }
        let COMPONENT_DETAIL = () => {
            return <div>
                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Resumen</label>
                    </div>
                </div>
                <textarea className="input-group" id="record_eng_detail" maxLength={4000}
                    defaultValue={_GET_STEP_TYPE_INDEX('s4313d', 'value', 0) ?? ''} onBlur={() => manage_step_01()} rows="3"></textarea>
                <label>(Máximo 4000 Caracteres)</label>
            </div>
        }
        // FUNCTIONS AND APIS
        //var formData = new FormData();

        let manage_step_01 = (e) => {
            if (e) e.preventDefault();
            var formData = new FormData();
            let values = [];
            if (document.getElementById('recprd_eng_s01_1')) values.push(document.getElementById('recprd_eng_s01_1').value)
            if (document.getElementById('recprd_eng_s01_2')) values.push(document.getElementById('recprd_eng_s01_2').value)
            if (document.getElementById('recprd_eng_s01_3')) values.push(document.getElementById('recprd_eng_s01_3').value)
            if (document.getElementById('recprd_eng_s01_4')) values.push(document.getElementById('recprd_eng_s01_4').value)
            if (document.getElementById('recprd_eng_s01_5')) values.push(document.getElementById('recprd_eng_s01_5').value)
            if (document.getElementById('recprd_eng_s01_select')) values.push(document.getElementById('recprd_eng_s01_select').value)

            formData.set('value', values.join(';'));

            let checks = [];
            if (document.getElementById('r_e_select_s4311_1')) checks.push(document.getElementById('r_e_select_s4311_1').value)
            if (document.getElementById('r_e_select_s4311_2')) checks.push(document.getElementById('r_e_select_s4311_2').value)
            if (document.getElementById('r_e_select_s4311_3')) checks.push(document.getElementById('r_e_select_s4311_3').value)

            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's4311');
            if (SUBCATEGORIES[0] == '1') save_step('s4311', false, formData);

            formData = new FormData();
            checks = [];
            var checks_2 = document.getElementsByName('recprd_eng_s02_2');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }

            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's4312');
            save_step('s4312', false, formData);


            formData = new FormData();
            checks = [];
            checks_2 = document.getElementsByName('recprd_eng_s03_check');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            values = [];
            var values_2 = document.getElementsByName('recprd_eng_s03');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }
            formData.set('value', values.join(';'));


            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's4313');
            save_step('s4313', false, formData);

            formData = new FormData();
            let detail;
            if (document.getElementById('record_eng_detail')) detail = document.getElementById('record_eng_detail').value;
            formData.set('value', detail);
            formData.set('id_public', 's4313d');
            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            if (detail)   save_step('s4313d', false, formData);
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
        let manage_review = (useSwal, formData) => {
            var _CHILD = _GET_REVIEW();
            if (useSwal) MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {
                RECORD_ENG_SERVICE.update_review(_CHILD.id, formData)
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
            } else {
                RECORD_ENG_SERVICE.create_review(formData)
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
        let manage_p = (value) => {
            var formData = new FormData();
            var check = value;
            formData.set('check', check);

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'sp');
            save_step('sp', false, formData);

        }
        return (
            <div className="record_eng_desc container">
                {SUBCATEGORIES[0] == '1' ?
                    <>
                        <legend className="my-2 px-3 text-uppercase bg-light" id="record_eng_431">
                            <label className="app-p lead fw-normal text-uppercase">4.3.1 ESTUDIO GEOTÉCNICO</label>
                        </legend>
                        {COMPONENT_01()}
                        <label className="app-p fw-bold text-uppercase my-2">Contenido del estudio geotécnico definitivo (H.2.2.2.1)</label>
                        {COMPONENT_02()}
                    </>
                    : ""}
                <hr />
                {COMPONENT_03()}
                <hr />
                {SUBCATEGORIES[0] == '1' ?
                    <>
                        <label className="app-p fw-bold text-uppercase my-2">Resumen del estudio Geotécnico</label>
                        {COMPONENT_DETAIL()}
                    </>
                    : ""}
            </div >
        );
    }
}

export default RECORD_ENG_STEP_431;