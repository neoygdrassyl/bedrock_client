import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'

const MySwal = withReactContent(Swal);

class RECORD_ENG_STEP_432 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, version } = this.props;
        const { } = this.state;
        const SUBCATEGORIES = currentRecord.subcategory ? currentRecord.subcategory.split(';') : [];
        //  CONST
        const step_01_option = [
            'Coherencia técnica con los planos arquitectónicos.',
            'Coherencia técnica entre el estudio de suelos y el diseño estructural.',
            'Columna fuerte / Viga debil.',
        ]

        const STEEL_DECK = [
            { i: 0, name: 'hcresta (m)', default: 0.05, disabled: false, },
            { i: 1, name: 'htotal (m)', default: 0.16, disabled: false, },
            { i: 2, name: 'wcresta (m)', default: 0.12, disabled: false, },
            { i: 3, name: 'wvalle (m)', default: 0.15, disabled: false, },
            { i: 4, name: 'dcresta (m)', default: 0.31, disabled: false, },
            { i: 5, name: 'Wplaca (kN/m2)', default: 2.62, disabled: true, },
            { i: 6, name: 'Wmetaldeck (kN/m2)', default: 0.15, disabled: true, },
            { i: 7, name: 'Wconc (kN/m2)', default: 0.55, disabled: true, },
            { i: 8, name: 'Wtotal (kN/m2)', default: 3.32, disabled: true, },
        ]

        const CARGA_VIVA_USOS = [
            {
                i: 1, name: 'RESIDENCIAL Y PARQUEADEROS', usos: [
                    { i: 0, name: 'Cuartos', default: 1.8 },
                    { i: 1, name: 'Balcones', default: 5.0 },
                    { i: 2, name: 'Escaleras', default: 3.0 },
                    { i: 3, name: 'Parqueaderos', default: 2.5 },
                    { i: 4, name: 'Cubierta', default: 0.5 },
                ]
            },
            {
                i: 2, name: 'REUNIÓN', usos: [
                    { i: 0, name: 'Silleteria fija', default: 3.0 },
                    { i: 1, name: 'Silleteria móvil', default: 5.0 },
                    { i: 2, name: 'Gimnacios', default: 5.0 },
                    { i: 3, name: 'Vestibulos', default: 5.0 },
                    { i: 4, name: 'Áreas recreativas', default: 5.0 },
                    { i: 5, name: 'Plataformas', default: 5.0 },
                    { i: 6, name: 'Escenarios', default: 7.5 },
                ]
            },
            {
                i: 3, name: 'INSTITUCIONAL', usos: [
                    { i: 0, name: 'Cuartos de cirugía, laboratorios', default: 4.0 },
                    { i: 1, name: 'Cuartos privados', default: 2.0 },
                    { i: 2, name: 'Corredores y escaleras', default: 5.0 },
                ]
            },
            {
                i: 4, name: 'OFICINAS', usos: [
                    { i: 0, name: 'Corredores y escaleras', default: 3.0 },
                    { i: 1, name: 'Oficinas', default: 2.0 },
                    { i: 2, name: 'Restaurantes', default: 5.0 },
                ]
            },
            {
                i: 5, name: 'EDUCATIVOS', usos: [
                    { i: 0, name: 'Salones de clase', default: 2.0 },
                    { i: 1, name: 'Corredores y escaleras', default: 5.0 },
                    { i: 2, name: 'Bibliotecas', default: null },
                    { i: 3, name: 'Salonesd de lectura', default: 2.0 },
                    { i: 4, name: 'Estanterías', default: 7.0 },
                ]
            },
            {
                i: 6, name: 'FÁBRICAS', usos: [
                    { i: 0, name: 'Industrias livianas', default: 5.0 },
                    { i: 1, name: 'Industrias pesadas', default: 10.0 },
                ]
            },
            {
                i: 7, name: 'COMERCIO', usos: [
                    { i: 0, name: 'Minorista', default: 5.0 },
                    { i: 1, name: 'Mayorista', default: 6.0 },
                ]
            },
            {
                i: 8, name: 'ALMACIENAMIENTO', usos: [
                    { i: 0, name: 'Liviano', default: 6.0 },
                    { i: 1, name: 'Mayorista', default: 12.0 },
                ]
            },
            {
                i: 9, name: 'GARAJES', usos: [
                    { i: 0, name: 'Automoviles de pasajeros', default: 2.5 },
                    { i: 1, name: 'capacidad de carga hasta 2ton', default: 5.0 },
                ]
            },
            {
                i: 10, name: 'COLISEOS Y ESTADIOS', usos: [
                    { i: 0, name: 'Graderias', default: 5.0 },
                    { i: 1, name: 'Escaleras', default: 5.0 },
                ]
            },
            {
                i: 0, name: 'NA', usos: []
            },
        ];

        // Orden de los indexes
        const CARGA_VIVA = [0, 1, 2];


        // FUNCTIONS & VARIABLES
        let var_e85 = () => document.getElementById('e85') ? document.getElementById('e85').value : 0;
        let var_e86 = () => document.getElementById('e86') ? document.getElementById('e86').value : 0;
        let var_e87 = () => document.getElementById('e87') ? document.getElementById('e87').value : 0;
        let var_e88 = () => document.getElementById('e88') ? document.getElementById('e88').value : 0;

        let var_f85 = () => document.getElementById('f85') ? document.getElementById('f85').value : 0;
        let var_f86 = () => document.getElementById('f86') ? document.getElementById('f86').value : 0;
        let var_f87 = () => document.getElementById('f87') ? document.getElementById('f87').value : 0;
        let var_f88 = () => document.getElementById('f88') ? document.getElementById('f88').value : 0;

        let var_j92 = () => document.getElementById('j92') ? document.getElementById('j92').value : 0;
        let var_j94 = () => document.getElementById('j94') ? document.getElementById('j94').value : 0;

        let _set_f93 = () => {
            if (var_e85() == 0 && document.getElementById('f93')) document.getElementById('f93').value = '';
            let op = var_e85() / 20;
            op = op.toFixed(2);
            if (document.getElementById('f93')) document.getElementById('f93').value = op;
        }
        let _set_g93 = () => {
            if (var_e86() == 0 && document.getElementById('g93')) document.getElementById('g93').value = '';
            let op = var_e86() / 24;
            op = op.toFixed(2);
            if (document.getElementById('g93')) document.getElementById('g93').value = op;
        }
        let _set_h93 = () => {
            if (var_e87() == 0 && document.getElementById('h93')) document.getElementById('h93').value = '';
            let op = var_e87() / 28;
            op = op.toFixed(2);
            if (document.getElementById('h93')) document.getElementById('h93').value = op;
        }
        let _set_i93 = () => {
            if (var_e88() == 0 && document.getElementById('i93')) document.getElementById('i93').value = '';
            let op = var_e88() / 10;
            op = op.toFixed(2);
            if (document.getElementById('i93')) document.getElementById('i93').value = op;
        }

        let _set_f95 = () => {
            if (var_f85() == 0 && document.getElementById('f95')) document.getElementById('f95').value = '';
            let op = var_f85() / 12;
            op = op.toFixed(2);
            if (document.getElementById('f95')) document.getElementById('f95').value = op;
        }
        let _set_g95 = () => {
            if (var_f86() == 0 && document.getElementById('g95')) document.getElementById('g95').value = '';
            let op = var_f86() / 14;
            op = op.toFixed(2);
            if (document.getElementById('g95')) document.getElementById('g95').value = op;
        }
        let _set_h95 = () => {
            if (var_f87() == 0 && document.getElementById('h95')) document.getElementById('h95').value = '';
            let op = var_f87() / 16;
            op = op.toFixed(2);
            if (document.getElementById('h95')) document.getElementById('h95').value = op;
        }
        let _set_i95 = () => {
            if (var_f88() == 0 && document.getElementById('i95')) document.getElementById('i95').value = '';
            let op = var_f88() / 8;
            op = op.toFixed(2);
            if (document.getElementById('i95')) document.getElementById('i95').value = op;
        }

        let _set_de103 = () => {
            if (var_j94() == 0) {
                document.getElementById('d103').value = '';
                //document.getElementById('e103').value = '';
            }
            let op = Number(var_j94());
            op = op.toFixed(2);
            document.getElementById('d103').value = op;
            //document.getElementById('e103').value = op;
        }
        let _set_d104 = () => {
            let d103 = document.getElementById('d103').value;
            let op = 0;
            if (2.5 * d103 > 1.2) {
                op = 1.2;
            } else {
                op = 2.5 * d103;
            }
            op = op.toFixed(2);
            document.getElementById('d104').value = op;
        }
        let _set_de105 = () => {
            let d104 = document.getElementById('d104').value;
            let op = 0;
            if (d104 / 0.2 > 4.5) {
                op = d104 / 20;
            }
            else {
                op = 0.05
            }
            op = op.toFixed(2);
            document.getElementById('d105').value = op;
            //document.getElementById('e105').value = op;
        }
        let _set_de107 = () => {
            let d103 = document.getElementById('d103').value ?? 0;
            let d105 = document.getElementById('d105').value ?? 0;
            let d106 = document.getElementById('d106').value ?? 0;
            let op = Number(d103) - (Number(d105) + Number(d106));
            op = op.toFixed(2);
            document.getElementById('d107').value = op;
            //document.getElementById('e107').value = op;
        }
        let _set_d108 = () => {
            let d107 = document.getElementById('d107').value;
            let op = 0;
            if (d107 / 0.05 > 10) {
                op = d107 / 5;
            } else {
                op = 0.1;
            }
            op = op.toFixed(2);
            document.getElementById('d108').value = op;
        }
        let _set_de109 = () => {
            let d103 = document.getElementById('d103').value ?? 0;
            let op = 0;
            if (10 * d103 > 4) {
                op = 4;
            } else {
                op = 10 * d103;
            }
            op = op.toFixed(2);
            document.getElementById('d109').value = op;
            //document.getElementById('e109').value = op;
        }

        let _set_def114 = () => {
            let e107 = document.getElementById('e107').value ?? 0;
            let e108 = document.getElementById('e108').value ?? 0;
            let e104 = document.getElementById('e104').value ?? 0;
            let isLCS = document.getElementById('lcs');
            let op = e107 * e108 * 24 / e104;
            op = op.toFixed(2);
            document.getElementById('d114').value = op;
            document.getElementById('e114').value = op;
            if (isLCS && isLCS.value == '1') op = 0;
            document.getElementById('f114').value = op;
        }
        let _set_def115 = () => {
            let e105 = document.getElementById('e105').value ?? 0;
            let e106 = document.getElementById('e106').value ?? 0;
            let isLCS = document.getElementById('lcs');
            let op = (Number(e105) + Number(e106)) * 24;
            op = op.toFixed(2);
            document.getElementById('d115').value = op;
            document.getElementById('e115').value = op;
            if (isLCS && isLCS.value == '1') op = 0;
            document.getElementById('f115').value = op;
        }

        let _set_def116 = () => {
            let op = Number(var_j94());
            op = op.toFixed(2);
            document.getElementById('d116').value = op;
            document.getElementById('e116').value = op;
            let isLCS = document.getElementById('lcs');
            if (isLCS && isLCS.value == '1') op = 0;
            document.getElementById('f116').value = op;
        }

        let _set_def119 = () => {
            let v114 = document.getElementById('d114').value ?? 0;
            let v115 = document.getElementById('d115').value ?? 0;
            let v116 = document.getElementById('d116').value ?? 0;
            let v117 = document.getElementById('d117').value ?? 0;
            let v118 = document.getElementById('d118').value ?? 0;
            let op = Number(v114) + Number(v115) + Number(v116) + Number(v117) + Number(v118);
            op = op.toFixed(2);
            document.getElementById('d119').value = op;

            v114 = document.getElementById('e114').value ?? 0;
            v115 = document.getElementById('e115').value ?? 0;
            v116 = document.getElementById('e116').value ?? 0;
            v117 = document.getElementById('e117').value ?? 0;
            v118 = document.getElementById('e118').value ?? 0;
            op = Number(v114) + Number(v115) + Number(v116) + Number(v117) + Number(v118);
            op = op.toFixed(2);
            document.getElementById('e119').value = op;

            let isLCS = document.getElementById('lcs');
            if (isLCS && isLCS.value == '1') {
                op = 1.35
            } else {
                v114 = document.getElementById('f114').value ?? 0;
                v115 = document.getElementById('f115').value ?? 0;
                v116 = document.getElementById('f116').value ?? 0;
                v117 = document.getElementById('f117').value ?? 0;
                v118 = document.getElementById('f118').value ?? 0;
                op = Number(v114) + Number(v115) + Number(v116) + Number(v117) + Number(v118);
                op = op.toFixed(2);
            }

            document.getElementById('f119').value = op;
        }

        let _setStyles = () => {
            let activeColor = 'LightCoral'
            if (document.getElementById('e85')) document.getElementById('e85').style.backgroundColor = var_e85() > 0 ? activeColor : '';
            if (document.getElementById('e86')) document.getElementById('e86').style.backgroundColor = var_e86() > 0 ? activeColor : '';
            if (document.getElementById('e87')) document.getElementById('e87').style.backgroundColor = var_e87() > 0 ? activeColor : '';
            if (document.getElementById('e88')) document.getElementById('e88').style.backgroundColor = var_e88() > 0 ? activeColor : '';

            if (document.getElementById('f85')) document.getElementById('f85').style.backgroundColor = var_f85() > 0 ? activeColor : '';
            if (document.getElementById('f86')) document.getElementById('f86').style.backgroundColor = var_f86() > 0 ? activeColor : '';
            if (document.getElementById('f87')) document.getElementById('f87').style.backgroundColor = var_f87() > 0 ? activeColor : '';
            if (document.getElementById('f88')) document.getElementById('f88').style.backgroundColor = var_f88() > 0 ? activeColor : '';
        }

        let update_values = () => {
            _set_f93();
            _set_g93();
            _set_h93();
            _set_i93();
            _set_f95();
            _set_g95();
            _set_h95();
            _set_i95();
            _set_de103();
            _set_d104();
            _set_de105();
            _set_de107();
            _set_d108();
            _set_de109();
            _set_def114();
            _set_def115();
            //_set_def116();
            _set_def119();
            _setStyles();
        }

        let set_steel_deck = () => {
            let hcresta = Number(document.getElementById('steel_deck_0').value);
            let htotal = Number(document.getElementById('steel_deck_1').value);
            let wcresta = Number(document.getElementById('steel_deck_2').value);
            let wvalle = Number(document.getElementById('steel_deck_3').value);
            let dcresta = Number(document.getElementById('steel_deck_4').value);

            let Wplaca = (hcresta * htotal) / 24;
            let Wmetaldeck = 0.15;
            let Wconc = ((wcresta + (dcresta - wvalle)) * hcresta / 2) * 24 / dcresta;
            let Wtotal = Wplaca + Wmetaldeck + Wconc;

            document.getElementById('steel_deck_5').value = (Wplaca).toFixed(2);
            document.getElementById('steel_deck_6').value = (Wmetaldeck).toFixed(2);
            document.getElementById('steel_deck_7').value = (Wconc).toFixed(2);
            document.getElementById('steel_deck_8').value = (Wtotal).toFixed(2);

            var formData = new FormData();
            let values = STEEL_DECK.map(item => document.getElementById('steel_deck_' + item.i).value)

            formData.set('value', values.join(';'));
            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'steel_deck');
            save_step('steel_deck', false, formData);
        }

        let set_steel_deck_use = () => {
            let check = document.getElementById('steel_deck_use').value
            let formData = new FormData();
            formData.set('check', check);
            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'steel_deck');
            save_step('steel_deck', false, formData);
        }

        let set_carga_vida = () => {
            CARGA_VIVA.map(i => {
                let id_public = 'carga_vida_' + i 
                let selected_uso = document.getElementById("carga_vida_use_" + i).value;
                let carga = CARGA_VIVA_USOS.find(c => c.i == selected_uso);
                let values = carga.usos.map(uso => {
                    let id = 'carga_vida_' + i + "_" + uso.i;
                    if (document.getElementById(id)) return document.getElementById(id).value;
                    return null
                })
                let formData = new FormData();
                formData.set('value', values.join(';'));
                formData.set('version', currentVersionR);
                formData.set('recordEngId', currentRecord.id);
                formData.set('id_public', id_public);
                save_step(id_public, false, formData);
            })
        }


        let set_carga_vida_use = () => {
            let value = [];
            value = CARGA_VIVA.map(i => document.getElementById("carga_vida_use_" + i).value);
            let formData = new FormData();
            formData.set('value', value.join(';'));
            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'carga_vida_use');
            save_step('carga_vida_use', false, formData);

            CARGA_VIVA.map(i => {
                let selected_uso = document.getElementById("carga_vida_use_" + i).value;
                let carga = CARGA_VIVA_USOS.find(c => c.i == selected_uso);
                carga.usos.map(uso => {
                    let id = 'carga_vida_' + i + "_" + uso.i;
                    if (document.getElementById(id)) document.getElementById(id).value = _GET_STEP_TYPE_INDEX('carga_vida_' + i, 'value', uso.i) || uso.default;
                })
            })
        }
        // DATA GETTERS
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_eng_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
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
        let _GET_STEP_TYPE_INDEX = (_id_public, _type, _index) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return null;
            var value = STEP[_type]
            value = value ? value.split(';') : [];
            return value[_index]
        }
        // COMPONENT JSX
        let COMPONENT_01 = () => {
            return <>
                {step_01_option.map((value, i) => (
                    <div className="row py-0">
                        <div className="col-10">
                            <div class="input-group">
                                <label>{value}</label>
                            </div>
                        </div>
                        <div className="col-2">
                            <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4321', 'check', i) ?? 1)} name="recprd_eng_4321_check"
                                defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'check', i) ?? 1} onChange={() => manage_step_432()} >
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </select>
                        </div>
                    </div>
                ))}
            </>
        }
        let COMPONENT_PREDIMENTIONAL = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-2">
                        <label className="fw-bold">C.9.5</label>
                    </div>
                    <div className="col-2">
                        <label className="fw-bold">NSR-10</label>
                    </div>
                    <div className="col-2 border border-dark text-center">
                        <label className="fw-bold">L=Losa (m)</label>
                    </div>
                    <div className="col-2 border border-dark text-center">
                        <label className="fw-bold">L=Viga (m)</label>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-4">
                        <label className="fw-bold">Luz simplemente apoyados</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01" id='e85'
                            className="form-control" name="recprd_eng_s4321" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 0) ?? ''} />
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01" id='f85'
                            className="form-control" name="recprd_eng_s4321" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 1) ?? ''} />
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-4">
                        <label className="fw-bold">Con un apoyo continuo</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01" id='e86'
                            className="form-control" name="recprd_eng_s4321" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 2) ?? ''} />
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01" id='f86'
                            className="form-control" name="recprd_eng_s4321" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 3) ?? ''} />
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-4">
                        <label className="fw-bold">Ambos apoyos continuos</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01" id='e87'
                            className="form-control" name="recprd_eng_s4321" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 4) ?? ''} />
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01" id='f87'
                            className="form-control" name="recprd_eng_s4321" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 5) ?? ''} />
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-4">
                        <label className="fw-bold">Luz en voladizo</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01" id='e88'
                            className="form-control" name="recprd_eng_s4321" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 6) ?? ''} />
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01" id='f88'
                            className="form-control" name="recprd_eng_s4321" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 7) ?? ''} />
                    </div>
                </div>
            </>
        }
        let COMPONENT_ELEMENTS = () => {
            return <>
                <div className="row text-center bg-info text-white mt-3">
                    <div className="col-4 border border-dark ">
                        <label className="fw-bold">ELEMENTOS</label>
                    </div>
                    <div className="col border border-dark ">
                        <label className="fw-bold">Simpl. apoyo</label>
                    </div>
                    <div className="col border border-dark ">
                        <label className="fw-bold">Un extre contin</label>
                    </div>
                    <div className="col border border-dark ">
                        <label className="fw-bold">Ambos Contin</label>
                    </div>
                    <div className="col border border-dark">
                        <label className="fw-bold">Voladizo</label>
                    </div>
                    <div className="col border border-dark ">
                        <label className="fw-bold">Espesor escogido</label>
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col-4 border border-dark ">
                        <label>Losas macizas en una dirección</label>
                    </div>
                    <div className="col border border-dark ">
                        <label>L/20 (m)</label>
                        <input type="number" step="0.01" id='f93' disabled
                            className="form-control my-1" name="recprd_eng_s4321"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 8) ?? ''} />
                    </div>
                    <div className="col border border-dark ">
                        <label>L/24 (m)</label>
                        <input type="number" step="0.01" id='g93' disabled
                            className="form-control my-1" name="recprd_eng_s4321"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 9) ?? ''} />
                    </div>
                    <div className="col border border-dark ">
                        <label>L/28 (m)</label>
                        <input type="number" step="0.01" id='h93' disabled
                            className="form-control my-1" name="recprd_eng_s4321"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 10) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <label>L/10 (m)</label>
                        <input type="number" step="0.01" id='i93' disabled
                            className="form-control my-1" name="recprd_eng_s4321"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 11) ?? ''} />
                    </div>
                    <div className="col border border-dark ">
                        <input type="number" step="0.01" id='j92' style={{ background: 'Pink' }}
                            className="form-control my-1" name="recprd_eng_s4321" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 12) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col-4 border border-dark ">
                        <label>Vigas o losas nervadas en una dirección</label>
                    </div>
                    <div className="col border border-dark ">
                        <label>L/12 (m)</label>
                        <input type="number" step="0.01" id='f95' disabled
                            className="form-control my-1" name="recprd_eng_s4321"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 13) ?? ''} />
                    </div>
                    <div className="col border border-dark ">
                        <label>L/14 (m)</label>
                        <input type="number" step="0.01" id='g95' disabled
                            className="form-control my-1" name="recprd_eng_s4321"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 14) ?? ''} />
                    </div>
                    <div className="col border border-dark ">
                        <label>L/16 (m)</label>
                        <input type="number" step="0.01" id='h95' disabled
                            className="form-control my-1" name="recprd_eng_s4321"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 15) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <label>L/8 (m)</label>
                        <input type="number" step="0.01" id='i95' disabled
                            className="form-control my-1" name="recprd_eng_s4321"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 16) ?? ''} />
                    </div>
                    <div className="col border border-dark ">
                        <input type="number" step="0.01" id='j94' style={{ background: 'Pink' }}
                            className="form-control my-1" name="recprd_eng_s4321" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4321', 'value', 17) ?? ''} />
                    </div>
                </div>
            </>
        }
        let COMPONENT_LOADOUTS = () => {
            return <>
                <div className="row border-dark border bg-info text-center text-white">
                    <label className="fw-bold my-2">ANÁLISIS DE CARGAS</label>
                </div>
                <div className="row">
                    <div className="col-8">
                        {COMPONENT_TABLE_LIGHT()}
                    </div>
                    <div className="col-4">
                        {version === 2 ? COMPONENT_TABLE_SEETL_DECK() : null}
                    </div>
                </div>
                <div className="row">
                    <div className="col-8">
                        {COMPONENT_TABLE_DEAD()}
                    </div>
                    <div className="col-4">
                        {COMPONENT_TABLE_ALIVE()}
                    </div>
                </div>
                {version === 2 ? <div className="row">
                    <div className="col">
                        {COMPONENT_TABLE_ALIVE_2()}
                    </div>
                </div> : null}

            </>
        }
        let COMPONENT_TABLE_LIGHT = () => {
            return <>
                <div className="row border border-dark text-center">
                    <div className="col-12">
                        <label className="fw-bold">CALCULO LOSA ALIGERADA</label>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Altura total placa H:</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d103' disabled
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 0) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e103'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 1) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Separacion nervios C:</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d104' disabled
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 2) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e104'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 3) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Loseta superior D1:</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d105' disabled
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 4) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e105'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 5) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Loseta inferior D3:</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d106' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 6) ?? 0.02} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e106' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 7) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Alto Casetón D2:</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d107' disabled
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 8) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e107'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 9) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Ancho Vigueta B:</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d108' disabled
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 10) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e108'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 11) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Riostra cada:</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d109' disabled
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 12) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e109'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 13) ?? ''} />
                    </div>
                </div>
            </>
        }
        let COMPONENT_TABLE_DEAD = () => {
            return <>
                <div className="row border border-dark text-center">
                    <div className="col">
                        <label className="fw-bold">CARGA MUERTA</label>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col border border-dark"></div>
                    <div className="col border border-dark">
                        <label className="fw-bold">Parqueaderos</label>
                    </div>
                    <div className="col border border-dark">
                        <label className="fw-bold">Pisos tipo</label>
                    </div>
                    <div className="col border border-dark">
                        <label className="fw-bold">Cubierta</label>
                    </div>
                    <div className="col border border-dark">
                        <label className="fw-bold">Otro</label>
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark" style={{ background: 'lightgray' }}>
                        <label className="fw-bold">Elementos</label>
                    </div>
                    <div className="col border border-dark" style={{ background: 'lightgray' }}>
                        <label className="fw-bold">(kN/m2)</label>
                    </div>
                    <div className="col border border-dark" style={{ background: 'lightgray' }}>
                        <label className="fw-bold">(kN/m2)</label>
                    </div>
                    <div className="col border border-dark" style={{ background: 'lightgray' }}>
                        <label className="fw-bold">(kN/m2)</label>
                    </div>
                    <div className="col border border-dark" style={{ background: 'lightgray' }}>
                        <input type="text"
                            className="form-control my-1" name="recprd_eng_s4322-2"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 38) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Viguetas</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d114'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 14) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e114'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 15) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='f114'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 16) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01"
                            className="form-control my-1" name="recprd_eng_s4322-2"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 39) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Placas</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d115'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 17) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e115'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 18) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='f115'
                            className="form-control my-1" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 19) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01"
                            className="form-control my-1" name="recprd_eng_s4322-2"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 40) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Aligerante</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d116' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 20) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e116' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 21) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='f116' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 22) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01"
                            className="form-control my-1" name="recprd_eng_s4322-2"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 41) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Muros divisorios</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d117' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 23) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e117' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 24) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='f117' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 25) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01"
                            className="form-control my-1" name="recprd_eng_s4322-2"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 42) ?? ''} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className="col border border-dark">
                        <label>Pisos y acabados</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d118' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 26) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e118' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 27) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='f118' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 28) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01"
                            className="form-control my-1" name="recprd_eng_s4322-2"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 43) ?? ''} />
                    </div>
                </div>



                <div className="row text-center">
                    <div className="col border border-dark">
                        <label className="fw-bold">Total</label>
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='d119'
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 29) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='e119'
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 30) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01" id='f119'
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 31) ?? ''} />
                    </div>
                    <div className="col border border-dark">
                        <input type="number" step="0.01"
                            className="form-control my-1" name="recprd_eng_s4322-2"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 44) ?? ''} />
                    </div>
                </div>

            </>
        }
        let COMPONENT_TABLE_ALIVE = () => {
            return <>
                <div className={version >= 2 ? "" : "row border border-dark text-center"} hidden={version >= 2}>
                    <div className="col">
                        <label className="fw-bold">CARGA VIVA</label>
                    </div>
                </div>
                <div className={version >= 2 ? "" : "row border border-dark text-center"} hidden={version >= 2}>
                    <div className="col"><label></label></div>
                </div>
                <div className="row text-center" hidden={version >= 2}>
                    <div className="col border border-dark" style={{ background: 'lightgray' }}>
                        <label className="fw-bold">USO</label>
                    </div>
                    <div className="col border border-dark" style={{ background: 'lightgray' }}>
                        <label className="fw-bold">(kN/m2)</label>
                    </div>
                </div>

                <div className="row text-center">
                    <div className={version >= 2 ? "" : "col border border-dark"}>
                        <label hidden={version >= 2}>Cuartos</label>
                    </div>
                    <div className={version >= 2 ? "" : "col border border-dark"}>
                        <input type={version >= 2 ? "hidden" : "number"} step="0.01" id='i113' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 32) ?? 1.8} />
                    </div>
                </div>

                <div className="row text-center">
                    <div className={version >= 2 ? "" : "col border border-dark"}>
                        <label hidden={version >= 2}>Balcones</label>
                    </div>
                    <div className={version >= 2 ? "" : "col border border-dark"}>
                        <input type={version >= 2 ? "hidden" : "number"} step="0.01" id='i114' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 33) ?? 5} />
                    </div>
                </div>

                <div className={version >= 2 ? "" : "col border border-dark"}>
                    <div className={version >= 2 ? "" : "col border border-dark"}>
                        <label hidden={version >= 2}>Escaleras</label>
                    </div>
                    <div className={version >= 2 ? "" : "col border border-dark"}>
                        <input type={version >= 2 ? "hidden" : "number"} step="0.01" id='i115' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 34) ?? 3} />
                    </div>
                </div>

                <div className={version >= 2 ? "" : "col border border-dark"}>
                    <div className={version >= 2 ? "" : "col border border-dark"}>
                        <label hidden={version >= 2}>Parqueaderos</label>
                    </div>
                    <div className={version >= 2 ? "" : "col border border-dark"}>
                        <input type={version >= 2 ? "hidden" : "number"} step="0.01" id='i116' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 35) ?? 2.5} />
                    </div>
                </div>

                <div className={version >= 2 ? "" : "col border border-dark"}>
                    <div className={version >= 2 ? "" : "col border border-dark"}>
                        <label hidden={version >= 2}>Cubierta</label>
                    </div>
                    <div className={version >= 2 ? "" : "col border border-dark"}>
                        <input type={version >= 2 ? "hidden" : "number"} step="0.01" id='i117' onChange={() => update_values()} onBlur={() => manage_step_432()}
                            className="form-control my-1" name="recprd_eng_s4322"
                            defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 36) ?? 0.5} />
                    </div>
                </div>

                <div className="row  my-2">
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <label class="input-group-text" for="inputGroupSelect01" hidden={version >= 2}>Es cubierta Ligera</label>
                        </div>
                        {version >= 2
                            ? <input type="hidden" id='lcs' name="recprd_eng_s4322" defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 37) ?? 0} />
                            : <select class="form-select" id="lcs" name="recprd_eng_s4322" onChange={() => update_values()} onBlur={() => manage_step_432()}
                                defaultValue={_GET_STEP_TYPE_INDEX('s4322', 'value', 37) ?? 0} >
                                <option value="0">NO</option>
                                <option value="1">SI</option>
                            </select>}

                    </div>
                </div>
            </>
        }
        let COMPONENT_TABLE_ALIVE_2 = () => {
            return <>
                <div className="row border border-dark text-center mt-2">
                    <div className="col">
                        <label className="fw-bold">CARGA VIVA</label>
                    </div>
                </div>
                <div className="row">
                    {CARGA_VIVA.map(i => <div className='col-4'>

                        <div className="row  my-2">
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <label class="input-group-text" for="inputGroupSelect01" >USO {i + 1}</label>
                                </div>
                                <select class="form-select" id={"carga_vida_use_" + i} name="carga_vida_use" onChange={() => set_carga_vida_use()}
                                    defaultValue={_GET_STEP_TYPE_INDEX('carga_vida_use', 'value', i) ?? 0} >
                                    {CARGA_VIVA_USOS.map(carga => <option value={carga.i}>{carga.name}</option>)}
                                </select>

                            </div>
                        </div>
                        <div className="row text-center">
                            <div className="col border border-dark" style={{ background: 'lightgray' }}>
                                <label className="fw-bold">USO</label>
                            </div>
                            <div className="col border border-dark" style={{ background: 'lightgray' }}>
                                <label className="fw-bold">(kN/m2)</label>
                            </div>
                        </div>

                        {CARGA_VIVA_USOS.find(carga => carga.i == (_GET_STEP_TYPE_INDEX('carga_vida_use', 'value', i) ?? 0)).usos.map(uso =>
                            <>
                                <div className="row text-center">
                                    <div className="col border border-dark">
                                        <label >{uso.name}</label>
                                    </div>
                                    <div className="col border border-dark">
                                        <input type="number" step="0.01" id={'carga_vida_' + i + "_" + uso.i}
                                            className="form-control my-1" name="carga_vida" onBlur={() => set_carga_vida()}
                                            defaultValue={_GET_STEP_TYPE_INDEX('carga_vida_' + i, 'value', uso.i) ?? uso.default} />
                                    </div>
                                </div>
                            </>

                        )}
                    </div>)}
                </div>
            </>
        }

        let COMPONENT_TABLE_SEETL_DECK = () => {
            return <>

                <div className="row  my-2">
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <label class="input-group-text" for="inputGroupSelect01" >Usar Steel Deck</label>
                        </div>
                        <select class="form-select" id="steel_deck_use" name="steel_deck_use" onChange={() => set_steel_deck_use()}
                            defaultValue={_GET_STEP_TYPE_INDEX('steel_deck', 'check', 0) ?? 0} >
                            <option value="0">NO</option>
                            <option value="1">SI</option>
                        </select>

                    </div>
                </div>
                {_GET_STEP_TYPE_INDEX('steel_deck', 'check', 0) == 1 ?
                    <>
                        <div className="row border border-dark text-center">
                            <div className="col">
                                <label className="fw-bold">STEEL DECK</label>
                            </div>
                        </div>
                        {STEEL_DECK.map(item => <div className="row text-center">
                            <div className="col border border-dark">
                                <label >{item.name}</label>
                            </div>
                            <div className="col border border-dark">
                                <input type="number" step="0.01" id={'steel_deck_' + item.i} onBlur={() => set_steel_deck()}
                                    className="form-control my-1" name="steel_deck" disabled={item.disabled}
                                    defaultValue={_GET_STEP_TYPE_INDEX('steel_deck', 'value', item.i) ?? item.default} />
                            </div>
                        </div>)}
                    </> : null}


            </>
        }

        // FUNCTIONS AND APIS
        //var formData = new FormData();

        let manage_step_432 = (e) => {
            if (e) e.preventDefault();
            var formData = new FormData();
            var checks = [];
            var checks_2 = document.getElementsByName('recprd_eng_4321_check');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            var values = [];
            var values_2 = document.getElementsByName('recprd_eng_s4321');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }

            formData.set('value', values.join(';'));


            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's4321');
            save_step('s4321', false, formData);

            formData = new FormData();

            values = [];
            values_2 = document.getElementsByName('recprd_eng_s4322');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }
            values_2 = document.getElementsByName('recprd_eng_s4322-2');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }
            formData.set('value', values.join(';'));


            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's4322');
            save_step('s4322', false, formData);

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

        return (
            <div className="record_eng_desc container">

                <legend className="my-2 px-3 text-uppercase bg-light" id="record_eng_432">
                    <label className="app-p lead fw-normal text-uppercase">4.3.2 MEMORIAS DE CALCULO</label>
                </legend>
                {SUBCATEGORIES[2] == 1 ? <>
                    <label className="app-p fw-bold text-uppercase my-2">Paso 1: Pre dimensionamiento y coordinación con otros profesionales.</label>
                    {COMPONENT_01()}
                    <label className="app-p fw-bold text-uppercase my-2">PREDIMENSIONAMIENTO</label>
                    {COMPONENT_PREDIMENTIONAL()}
                    {COMPONENT_ELEMENTS()}
                </> : ""}

                <hr />

                {SUBCATEGORIES[3] == 1 ? <>
                    <label className="app-p fw-bold text-uppercase my-2">Paso 2: Evaluación de las solicitudes definitivas: Se revisan las cargas presentadas en la edificacion debido a los pesos propios de la estructura y los tipos de uso de la misma, con los requisitos del Título B del reglamento.</label>
                    {COMPONENT_LOADOUTS()}
                </> : ""}

            </div >
        );
    }
}

export default RECORD_ENG_STEP_432;