import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'

const MySwal = withReactContent(Swal);

class RECORD_ENG_STEP_4323 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list_159: ['-', '-', '-', '-', '-']
        };
    }
    componentDidMount() {
        let value = document.getElementById('f159') ? document.getElementById('f159').value : 0;
        const analSismic = {
            'Fuerza horizontal equivalente': [
                'Regulares e irregulares, amenaza sísmica baja',
                'Regulares e irregulares, uso I, localizadas amenaza intermedia',
                'Regulares HASTA (20 niveles 60 m) SIN zona, excepto perfil D,E,F con periodo > 2Tc',
                'Irregulares HASTA (6 nivelas 18 m) de la base',
                'Estructuras flexibles apoyadas sobre más rígida VER(A.3.24)'
            ],
            'Análisis dinámico elástico': [
                'Edificaciones MAS (20 niveles 60 m) aun en zona ALTA',
                'Irregularidades Verticales 1aA, 1bA, 2A, 3A, pisos flexibles, masas y geometría',
                'Irregularidades no descritas en (A.3.3.4) planta y (A.3.3.5) altura ',
                'MAS (5 Niveles 20 m) amenaza alta y cambio de sistema estructural',
                'Regulares e irregulares con perfil D,E,F o periodo > 2Tc VER Cap 7'
            ],
            'Análisis dinámico inelástico': [
                'Fallas en la capacidad de disipar energía en el rango inelástico',
                'Revisión por 2 profesionales, independientes del diseñador idóneos',
                'Memorial con procedimientos empleados y que lo diseñado debe ser similar',
                'A una edificación diseñada por métodos del reglamento en sismos con intensidad',
                'Similar al del diseño, este documento forma parte de la licencia de construcción'
            ],
            'Estático análisis alternos plastificación progresiva': [
                'Plastificación progresiva',
                'Cumplir apéndice A-3',
                'Este procedimiento no tiene carácter obligatorio en el reglamento',
                'Analiza la respuesta no lineal de estructuras en movimientos sísmicos fuertes ',
                'Debe ser revisado por dos ingenieros en el criterio sísmico utilizado en el sitio y en el desplazamiento objetivo y la resistencia efectiva de la estructura'
            ],
            'No': [
                '-',
                '-',
                '-',
                '-',
                '-'
            ]
        }
        const newValue = analSismic[value];
        this.setState({ list_159: newValue })

        let j183 = document.getElementById('j183') ? document.getElementById('j183').value : 0;
        let j186 = document.getElementById('j186') ? document.getElementById('j186').value : 0;
        let j189 = document.getElementById('j189') ? document.getElementById('j189').value : 0;
        let j195 = document.getElementById('j195') ? document.getElementById('j195').value : 0;

        let op = '';
        if (j195 < j183) op = "2,5*Aa*Fa*I*(0,4+0,6*T/To)";
        else if (j195 < j186) op = "2,5*Aa*Fa*I";
        else if (j195 < j189) op = "1,2*Av*Fv*I/T";
        else op = "1,2*Av*Fv*TL*I/T^2"

        if (document.getElementById('h196')) document.getElementById('h196').value = op
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;
        const SUBCATEGORIES = currentRecord.subcategory ? currentRecord.subcategory.split(';') : [];
        //  CONST
        const coelfmpor = {
            'Ocupación normal': {
                grupo: 'I',
                coeficiente: 1.00
            },
            'Ocupación especial': {
                grupo: 'II',
                coeficiente: 1.10
            },
            'Atención a comunidad': {
                grupo: 'III',
                coeficiente: 1.25
            },
            'Edificios indispensables': {
                grupo: 'IV',
                coeficiente: 1.50
            },
        }
        const irregPlanta = {
            '1aP = 0.90': {
                axis: 'Ejes A1 < 1.4((A1+A2)/2)  1aP = 0.90',
                n: 0.9,
                p: '1aP'
            },
            '1bP = 0.80': {
                axis: 'Ejes ext. A1 > 1.4((A1+A2)/2)  1bP = 0.80',
                n: 0.8,
                p: '1bP'
            },
            '2P= 0.90': {
                axis: 'Retro. esquinas R > 0.15Largo 2P= 0.90',
                n: 0.9,
                p: '2P'
            },
            '3P= 0.90': {
                axis: 'Huecos diafra. 0.5*Área > Hueco 3P= 0.90',
                n: 0.9,
                p: '3P'
            },
            '4P = 0.80': {
                axis: 'Volados sin apoyo 4P = 0.80',
                n: 0.8,
                p: '4P'
            },
            '5P = 0.90': {
                axis: 'Ejes no paralelos 5P = 0.90',
                n: 0.9,
                p: '5P'
            },
            'No': {
                axis: 'No',
                n: 1,
                p: ''
            },
        }
        const irreAltura = {
            '1aA= 0.90': {
                axis: 'piso flex. 0.6 Rigidez3 < rigidez2  1aA= 0.90',
                n: 0.9,
                p: '1aA'
            },
            '1bA= 0.80': {
                axis: 'piso flex. Rigidez2 < 0.6rigidez3  1bA= 0.80',
                n: 0.8,
                p: '1bA'
            },
            '2A= 0.90': {
                axis: 'Masa3 > 1.5M2 de piso 2A= 0.90',
                n: 0.9,
                p: '2A'
            },
            '3A= 0.90': {
                axis: 'Geométrica ancho > 1.3resto 3A= 0.90',
                n: 0.9,
                p: '3A'
            },
            '4A= 0.80': {
                axis: 'Desplazamiento vertical eje 4A= 0.80',
                n: 0.8,
                p: '4A'
            },
            '5aA= 0.90': {
                axis: 'Piso débil 0.65Resist3 < resist2 5aA= 0.90',
                n: 0.9,
                p: '5aA'
            },
            'No': {
                axis: 'No',
                n: 1,
                p: ''
            },
        }
        const irreRedundancia = {
            '2R': {
                axis: 'Soporte en dos ejes de Col 2R = 0.75',
                n: 0.75,
                p: '2R'
            },
            '3R': {
                axis: 'Soporte en tres ejes de Col 3R = 0.86',
                n: 0.86,
                p: '3R'
            },
            'No': {
                axis: 'No',
                n: 1,
                p: ''
            },
        }
        const analSismic = {
            'Fuerza horizontal equivalente': [
                'Regulares e irregulares, amenaza sísmica baja',
                'Regulares e irregulares, uso I, localizadas amenaza intermedia',
                'Regulares HASTA (20 niveles 60 m) SIN zona, excepto perfil D,E,F con periodo > 2Tc',
                'Irregulares HASTA (6 nivelas 18 m) de la base',
                'Estructuras flexibles apoyadas sobre más rígida VER(A.3.24)'
            ],
            'Análisis dinámico elástico': [
                'Edificaciones MAS (20 niveles 60 m) aun en zona ALTA',
                'Irregularidades Verticales 1aA, 1bA, 2A, 3A, pisos flexibles, masas y geometría',
                'Irregularidades no descritas en (A.3.3.4) planta y (A.3.3.5) altura ',
                'MAS (5 Niveles 20 m) amenaza alta y cambio de sistema estructural',
                'Regulares e irregulares con perfil D,E,F o periodo > 2Tc VER Cap 7'
            ],
            'Análisis dinámico inelástico': [
                'Fallas en la capacidad de disipar energía en el rango inelástico',
                'Revisión por 2 profesionales, independientes del diseñador idóneos',
                'Memorial con procedimientos empleados y que lo diseñado debe ser similar',
                'A una edificación diseñada por métodos del reglamento en sismos con intensidad',
                'Similar al del diseño, este documento forma parte de la licencia de construcción'
            ],
            'Estático análisis alternos plastificación progresiva': [
                'Plastificación progresiva',
                'Cumplir apéndice A-3',
                'Este procedimiento no tiene carácter obligatorio en el reglamento',
                'Analiza la respuesta no lineal de estructuras en movimientos sísmicos fuertes ',
                'Debe ser revisado por dos ingenieros en el criterio sísmico utilizado en el sitio y en el desplazamiento objetivo y la resistencia efectiva de la estructura'
            ],
            'No': [
                '-',
                '-',
                '-',
                '-',
                '-'
            ]
        }
        const step07_1 = {
            'Concreto estructural reforzado': [0.047, 0.9],
            'Estructuras Metálicas sin diagonales': [0.072, 0.8],
            'Pórtico arriostrados de acero con diagonales': [0.073, 0.75],
            'Muros concreto y mampostería estructural': [0.049, 0.75],
            'Sistema de muros reforzados o mampostería': [0, 1],
            'Mampostería estructural': [0, 1],
            'No': [0, 0],
        }

        const ro_values = {
            'Muros de cargar A.3.2.1.1': 7,
            'Pórticos A.3.2.1.3': 7,
            'Combinado A.3.2.1.2': 7,
            'Combinado A.3.2.1.3': 7,
            'Sistema Dual A.3.2.1.4': 8,
            'No': 2,
        }
        // FUNCTIONS & VARIABLES
        let _set_step4_values = (value) => {
            const newValue = coelfmpor[value];
            document.getElementById('h135').value = newValue.grupo;
            document.getElementById('h136').value = newValue.coeficiente;
            update_values();
        }
        let _set_irregPlanta = (value) => {
            const newValue = irregPlanta[value];
            document.getElementById('h151').value = newValue.n;
            update_values();
        }
        let _set_irreAltura = (value) => {
            const newValue = irreAltura[value];
            document.getElementById('h152').value = newValue.n;
            update_values();
        }
        let _set_irreRedundancia_1 = (value) => {
            const newValue = irreRedundancia[value];
            document.getElementById('h153').value = newValue.n;
            update_values();
        }
        let _set_irreRedundancia_2 = (value) => {
            const newValue = irreRedundancia[value];
            document.getElementById('h154').value = newValue.n;
            update_values();
        }
        let _set_analSismic = (value) => {
            const newValue = analSismic[value];
            this.setState({ list_159: newValue })
        }

        let _LIST_F159 = () => {
            let list = this.state.list_159 ?? [];
            return <>
                {list.map((value, i) => (
                    <li class="list-group-item">{value}</li>
                ))}
            </>
        }
        let _set_h137 = () => {
            let e127 = document.getElementById('e127') ? document.getElementById('e127').value : null;
            let e61 = e127 ?? _GET_STEP_TYPE_INDEX('s4313', 'value', 11) ?? '';
            let op = '';
            if (e61 == 'ALTA') op = 'DES';
            else if (e61 == 'BAJA') op = 'DMI';
            else op = 'DMO';

            return op;
        }
        let _set_h137_2 = () => {
            let e127 = document.getElementById('e127') ? document.getElementById('e127').value : null;
            let e61 = e127 ?? _GET_STEP_TYPE_INDEX('s4313', 'value', 11) ?? '';
            let op = '';
            if (e61 == 'ALTA') op = 'DES';
            else if (e61 == 'BAJA') op = 'DMI';
            else op = 'DMO';

            if (document.getElementById('h137')) document.getElementById('h137').value = op;
        }
        let _set_h156 = () => {
            let h149 = document.getElementById('h149') ? document.getElementById('h149').value : 0;
            let h151 = document.getElementById('h151') ? document.getElementById('h151').value : 0;
            let h152 = document.getElementById('h152') ? document.getElementById('h152').value : 0;
            let h153 = document.getElementById('h153') ? document.getElementById('h153').value : 0;
            let op = h149 * h151 * h152 * h153;

            op = Number(op).toFixed(2)
            if (document.getElementById('h156')) document.getElementById('h156').value = op;
        }
        let _set_h157 = () => {
            let h149 = document.getElementById('h149') ? document.getElementById('h149').value : 0;
            let h151 = document.getElementById('h151') ? document.getElementById('h151').value : 0;
            let h152 = document.getElementById('h152') ? document.getElementById('h152').value : 0;
            let h154 = document.getElementById('h154') ? document.getElementById('h154').value : 0;
            let op = h149 * h151 * h152 * h154;

            op = Number(op).toFixed(2)
            if (document.getElementById('h157')) document.getElementById('h157').value = op;
        }
        let _set_e1712 = () => {
            let h143 = (document.getElementById('h143') ? document.getElementById('h143').value : 'No');
            const newValue = { ...step07_1 };
            if (document.getElementById('e171')) document.getElementById('e171').value = newValue[h143][0];
            if (document.getElementById('e172')) document.getElementById('e172').value = newValue[h143][1];
        }
        let _set_h149 = () => {
            let sistema_est = (document.getElementById('sistema_est') ? document.getElementById('sistema_est').value : 'No');
            const ro_value = { ...ro_values };
            if (document.getElementById('h149')) document.getElementById('h149').value = ro_value[sistema_est];
        }
        let _set_j175 = () => {
            let e172 = document.getElementById('e172') ? document.getElementById('e172').value : 0;
            let e171 = document.getElementById('e171') ? document.getElementById('e171').value : 0;
            let e173 = document.getElementById('e173') ? document.getElementById('e173').value : 0;

            let op = 0;
            if (e172 == 0) op = 0;
            else op = e171 * Math.pow(e173, e172);

            op = Number(op).toFixed(3)
            if (document.getElementById('j175')) document.getElementById('j175').value = op
        }
        let _set_j176 = () => {
            let j60 = _GET_STEP_TYPE_INDEX('s4313', 'value', 10) ?? 0;
            let j66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 20) ?? 0;

            let op = 1.75 - 1.2 * j60 * j66;

            op = Number(op).toFixed(3)
            if (document.getElementById('j176')) document.getElementById('j176').value = op
        }
        let _set_j177 = () => {
            let j176 = document.getElementById('j176') ? document.getElementById('j176').value : 0;

            let op = 0;
            if (j176 < 1.2) op = 1.2;
            else op = j176;

            op = Number(op).toFixed(3)
            if (document.getElementById('j177')) document.getElementById('j177').value = op
        }
        let _set_j178 = () => {
            let j177 = document.getElementById('j177') ? document.getElementById('j177').value : 0;
            let j175 = document.getElementById('j175') ? document.getElementById('j175').value : 0;
            let op = j177 * j175;

            op = Number(op).toFixed(3)
            if (document.getElementById('j178')) document.getElementById('j178').value = op
        }
        let _set_j179 = () => {
            let j178 = document.getElementById('j178') ? document.getElementById('j178').value : 0;
            let j175 = document.getElementById('j175') ? document.getElementById('j175').value : 0;

            let op = 0;
            if (j175 > j178) op = j178;
            else op = j175;

            op = Number(op).toFixed(3)
            if (document.getElementById('j179')) document.getElementById('j179').value = op
        }
        let _set_j180 = () => {
            let e174 = document.getElementById('e174') ? document.getElementById('e174').value : 0;

            let op = e174 * 0.1;

            op = Number(op).toFixed(3)
            if (document.getElementById('j180')) document.getElementById('j180').value = op
        }
        let _set_j183 = () => {
            let e60 = _GET_STEP_TYPE_INDEX('s4313', 'value', 9) ?? 0;
            let e66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 19) ?? 0;
            let j60 = _GET_STEP_TYPE_INDEX('s4313', 'value', 10) ?? 0;
            let j66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 20) ?? 0;

            let op = 0.1 * j60 * j66 / (e60 * e66);
            console.log(op)
            op = Number(op).toFixed(3)
            if (document.getElementById('j183')) document.getElementById('j183').value = op
        }
        let _set_j184 = () => {
            let e60 = _GET_STEP_TYPE_INDEX('s4313', 'value', 9) ?? 0;
            let e66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 19) ?? 0;
            let h136 = document.getElementById('h136') ? document.getElementById('h136').value : 0;

            let op = 2.5 * e60 * e66 * h136;

            op = Number(op).toFixed(3)
            if (document.getElementById('j184')) document.getElementById('j184').value = op
        }
        let _set_j186 = () => {
            let e60 = _GET_STEP_TYPE_INDEX('s4313', 'value', 9) ?? 0;
            let e66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 19) ?? 0;
            let j60 = _GET_STEP_TYPE_INDEX('s4313', 'value', 10) ?? 0;
            let j66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 20) ?? 0;

            let op = 0.48 * (j60 * j66) / (e66 * e60);

            op = Number(op).toFixed(3)
            if (document.getElementById('j186')) document.getElementById('j186').value = op
        }
        let _set_j187 = () => {
            let e60 = _GET_STEP_TYPE_INDEX('s4313', 'value', 9) ?? 0;
            let e66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 19) ?? 0;
            let h136 = document.getElementById('h136') ? document.getElementById('h136').value : 0;

            let op = 2.5 * e60 * e66 * h136;

            op = Number(op).toFixed(3)
            if (document.getElementById('j187')) document.getElementById('j187').value = op
        }
        let _set_j189 = () => {
            let j66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 20) ?? 0;

            let op = 2.4 * j66;

            op = Number(op).toFixed(3)
            if (document.getElementById('j189')) document.getElementById('j189').value = op
        }
        let _set_j190 = () => {
            let j60 = _GET_STEP_TYPE_INDEX('s4313', 'value', 10) ?? 0;
            let j66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 20) ?? 0;
            let h136 = document.getElementById('h136') ? document.getElementById('h136').value : 0;
            let j179 = document.getElementById('j179') ? document.getElementById('j179').value : 0;

            let op = (1.2 * j60 * j66 * h136) / j179;

            op = Number(op).toFixed(3)
            if (document.getElementById('j190')) document.getElementById('j190').value = op
        }
        let _set_j192 = () => {
            let j66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 20) ?? 0;

            let op = 2.4 * j66;

            op = Number(op).toFixed(3)
            if (document.getElementById('j192')) document.getElementById('j192').value = op
        }
        let _set_j193 = () => {
            let j60 = _GET_STEP_TYPE_INDEX('s4313', 'value', 10) ?? 0;
            let j66 = _GET_STEP_TYPE_INDEX('s4313', 'value', 20) ?? 0;
            let h136 = document.getElementById('h136') ? document.getElementById('h136').value : 0;
            let j179 = document.getElementById('j179') ? document.getElementById('j179').value : 0;
            let j189 = document.getElementById('j189') ? document.getElementById('j189').value : 0;

            let op = (1.2 * j60 * j66 * j189 * h136) / Math.pow(j179, 2)

            op = Number(op).toFixed(3)
            if (document.getElementById('j193')) document.getElementById('j193').value = op
        }
        let _set_j195 = () => {
            let j179 = document.getElementById('j179') ? document.getElementById('j179').value : 0;

            let op = j179;

            op = Number(op).toFixed(3)
            document.getElementById('j195').value = op
        }
        let _set_h_196_text = () => {
            let j183 = document.getElementById('j183') ? document.getElementById('j183').value : 0;
            let j186 = document.getElementById('j186') ? document.getElementById('j186').value : 0;
            let j189 = document.getElementById('j189') ? document.getElementById('j189').value : 0;
            let j195 = document.getElementById('j195') ? document.getElementById('j195').value : 0;

            let op = '';
            if (j195 < j183) op = "2,5*Aa*Fa*I*(0,4+0,6*T/To)";
            else if (j195 < j186) op = "2,5*Aa*Fa*I";
            else if (j195 < j189) op = "1,2*Av*Fv*I/T";
            else op = "1,2*Av*Fv*TL*I/T^2"

            if (document.getElementById('h196')) document.getElementById('h196').value = op
        }
        let _set_j196 = () => {
            let j183 = document.getElementById('j183') ? document.getElementById('j183').value : 0;
            let j184 = document.getElementById('j184') ? document.getElementById('j184').value : 0;
            let j186 = document.getElementById('j186') ? document.getElementById('j186').value : 0;
            let j187 = document.getElementById('j187') ? document.getElementById('j187').value : 0;
            let j189 = document.getElementById('j189') ? document.getElementById('j189').value : 0;
            let j190 = document.getElementById('j190') ? document.getElementById('j190').value : 0;
            let j192 = document.getElementById('j192') ? document.getElementById('j192').value : 0;
            let j195 = document.getElementById('j195') ? document.getElementById('j195').value : 0;

            let op = 0;
            if (j195 < j183) op = j184;
            else if (j195 < j186) op = j187;
            else if (j195 < j189) op = j190;
            else op = j192;

            op = Number(op).toFixed(3)
            if (document.getElementById('j196')) document.getElementById('j196').value = op
        }
        let update_values = () => {
            _set_h137();
            _set_h137_2();
            _set_h149();
            _set_h156();
            _set_h157();
            _set_e1712();
            _set_j175();
            _set_j176();
            _set_j177();
            _set_j178();
            _set_j179();
            _set_j180();
            _set_j183();
            _set_j184();
            _set_j186();
            _set_j187();
            _set_j189();
            _set_j190();
            _set_j192();
            _set_j193();
            _set_j195();
            _set_h_196_text();
            _set_j196();
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
                return 'form-select text-danger';
            }
            if (_VALUE == '0') {
                return 'form-select text-danger';
            }
            if (_VALUE == '1') {
                return 'form-select text-success';
            }
            if (_VALUE == '2') {
                return 'form-select text-warning';
            } else {
                return 'form-select';
            }
        }
        let _GET_STEP_TYPE_INDEX = (_id_public, _type, _index) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP) return null;
            if (!STEP['id']) return null;
            var value = STEP[_type]
            if (!value) return null;
            value = value.split(';');
            return value[_index]
        }
        // COMPONENT JSX
        let COMPONENT_STEP_03 = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-3">
                        <label>Aa Acele. pico efectiva (A.2.2)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s4233" id='e126' onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4233', 'value', 0) ?? _GET_STEP_TYPE_INDEX('s4313', 'value', 9) ?? ''} />
                    </div>
                    <div className="col-3">
                        <label>Av Velocidad pico efectiva</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s4233" id='i126' onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4233', 'value', 1) ?? _GET_STEP_TYPE_INDEX('s4313', 'value', 10) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4233', 'check', 0) ?? 1)}
                            name="recprd_eng_s4233_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4233', 'check', 0) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Zona amenaza sísmica (A.2.3)</label>
                    </div>
                    <div className="col-2">
                        <select className="form-control form-select"
                            name="recprd_eng_s4233" id='e127' onChange={() => update_values()} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4233', 'value', 2) ?? _GET_STEP_TYPE_INDEX('s4313', 'value', 11) ?? 'ALTA'} >
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
                            className="form-control" name="recprd_eng_s4233" id='i126' onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4233', 'value', 3) ?? _GET_STEP_TYPE_INDEX('s4313', 'value', 12) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4233', 'check', 1) ?? 1)}
                            name="recprd_eng_s4233_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4233', 'check', 1) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
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
                            className="form-control" name="recprd_eng_s4233" id='i126' onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4233', 'value', 4) ?? _GET_STEP_TYPE_INDEX('s4313', 'value', 13) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4233', 'check', 2) ?? 1)}
                            name="recprd_eng_s4233_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4233', 'check', 2) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>
            </>
        }
        let COMPONENT_STEP_04 = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-7">
                        <label className="fw-bold">Uso edificio (A.2.5):</label>
                    </div>
                    <div className="col-3">
                        <select className='form-select'
                            name="recprd_eng_s4234_value" onChange={(e) => _set_step4_values(e.target.value)} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4234', 'value', 0) ?? 'Ocupación normal'}>
                            <option>Ocupación normal</option>
                            <option>Ocupación especial</option>
                            <option>Atención a comunidad</option>
                            <option>Edificios indispensables</option>
                        </select>
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4234', 'check', 0) ?? 1)}
                            name="recprd_eng_s4234_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4234', 'check', 0) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-8">
                        <label className="fw-bold">Grupo de Uso:</label>
                    </div>
                    <div className="col-2">
                        <input type="text"
                            className="form-control" name="recprd_eng_s4234_value" id='h135' disabled
                            value={_GET_STEP_TYPE_INDEX('s4234', 'value', 1) ?? 'I'} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4234', 'check', 1) ?? 1)}
                            name="recprd_eng_s4234_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4234', 'check', 1) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-8">
                        <label className="fw-bold">Coeficiente de importancia:</label>
                    </div>
                    <div className="col-2">
                        <input type="text"
                            className="form-control" name="recprd_eng_s4234_value" id='h136' disabled
                            value={_GET_STEP_TYPE_INDEX('s4234', 'value', 2) ?? '1'} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4234', 'check', 2) ?? 1)}
                            name="recprd_eng_s4234_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4234', 'check', 2) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-8">
                        <label className="fw-bold">(A.3.1.3) Capacidad de disipación energía mínima requerida.</label>
                    </div>
                    <div className="col-2">
                        <input type="text"
                            className="form-control" name="recprd_eng_s4234_value" id='h137' disabled
                            value={_GET_STEP_TYPE_INDEX('s4234', 'value', 3) ?? 'DES'} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4234', 'check', 3) ?? 1)}
                            name="recprd_eng_s4234_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4234', 'check', 3) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>
            </>
        }
        let COMPONENT_STEP_05 = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-7">
                        <label className="fw-bold">Sistema estructural usado (A.3.2)</label>
                    </div>
                    <div className="col-3">
                        <select className='form-select'
                            name="recprd_eng_s4235_value" id="sistema_est" onChange={() => update_values()} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4235', 'value', 0) ?? 'Muros de cargar A.3.2.1.1'}>
                            <option>Muros de cargar A.3.2.1.1</option>
                            <option>Pórticos A.3.2.1.3</option>
                            <option>Combinado A.3.2.1.2</option>
                            <option>Combinado A.3.2.1.3</option>
                            <option>Sistema Dual A.3.2.1.4</option>
                            <option>No</option>
                        </select>
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4235', 'check', 0) ?? 1)}
                            name="recprd_eng_s4235_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4235', 'check', 0) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-7">
                        <label className="fw-bold">Material estructural empleado:</label>
                    </div>
                    <div className="col-3">
                        <select className='form-select'
                            name="recprd_eng_s4235_value" id='h143' onChange={() => update_values()} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4235', 'value', 1) ?? 'Concreto estructural reforzado'}>
                            <option>Concreto estructural reforzado</option>
                            <option>Estructuras Metálicas sin diagonales</option>
                            <option>Pórtico arriostrados de acero con diagonales</option>
                            <option>Muros concreto y mampostería estructural</option>
                            <option>Sistema de muros reforzados o mampostería</option>
                            <option>Mampostería estructural</option>
                            <option>No</option>
                        </select>
                    </div>
                    <div className="col-2"></div>
                </div>

            </>
        }
        let COMPONENT_STEP_06 = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-6">
                        <label>Coeficiente de capacidad de disipación de energía básico (R0)</label>
                    </div>
                    <div className="col-2"></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s4236_value" id='h149' onChange={() => update_values()} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 0) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4236', 'check', 0) ?? 1)}
                            name="recprd_eng_s4236_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'check', 0) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>(A.3.3) Verificación irregularidades</label>
                    </div>
                    <div className="col-2 fw-bold text-center">TIPO</div>
                    <div className="col-2"></div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>(A.3.3.4) Configuración en planta.</label>
                    </div>
                    <div className="col-2">
                        <select className='form-select'
                            name="recprd_eng_s4236_value" onChange={(e) => _set_irregPlanta(e.target.value)} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 1) ?? 'No'}>
                            <option>1aP = 0.90</option>
                            <option>1bP = 0.80</option>
                            <option>2P= 0.90</option>
                            <option>3P= 0.90</option>
                            <option>4P = 0.80</option>
                            <option>5P = 0.90</option>
                            <option>No</option>
                        </select>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s4236_value" id='h151' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 2) ?? 1} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4236', 'check', 1) ?? 1)}
                            name="recprd_eng_s4236_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'check', 1) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>(A.3.3.5) Configuración en la altura</label>
                    </div>
                    <div className="col-2">
                        <select className='form-select'
                            name="recprd_eng_s4236_value" onChange={(e) => _set_irreAltura(e.target.value)} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 3) ?? 'No'}>
                            <option>1aA= 0.90</option>
                            <option>1bA= 0.80</option>
                            <option>2A= 0.90</option>
                            <option>3A= 0.90</option>
                            <option>4A= 0.80</option>
                            <option>5aA= 0.90</option>
                            <option>No</option>
                        </select>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s4236_value" id='h152' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 4) ?? 1} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4236', 'check', 2) ?? 1)}
                            name="recprd_eng_s4236_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'check', 2) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>


                <div className="row mb-1">
                    <div className="col-6">
                        <label>(A.3.3.8) Ausencia de redundancia. (x)</label>
                    </div>
                    <div className="col-2">
                        <select className='form-select'
                            name="recprd_eng_s4236_value" onChange={(e) => _set_irreRedundancia_1(e.target.value)} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 5) ?? 'No'}>
                            <option>2R</option>
                            <option>3R</option>
                            <option>No</option>
                        </select>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s4236_value" id='h153' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 6) ?? 1} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4236', 'check', 3) ?? 1)}
                            name="recprd_eng_s4236_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'check', 3) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>(A.3.3.8) Ausencia de redundancia. (y)</label>
                    </div>
                    <div className="col-2">
                        <select className='form-select'
                            name="recprd_eng_s4236_value" onChange={(e) => _set_irreRedundancia_2(e.target.value)} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 7) ?? 'No'}>
                            <option>2R</option>
                            <option>3R</option>
                            <option>No</option>
                        </select>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s4236_value" id='h154' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 8) ?? 1} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4236', 'check', 4) ?? 1)}
                            name="recprd_eng_s4236_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'check', 4) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1 mt-4">
                    <div className="col-6">
                        <label>Coeficiente de capacidad de disipación de energía de diseño (R) (x)</label>
                    </div>
                    <div className="col-2"></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s4236_value" id='h156' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 9) ?? 1} />
                    </div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>Coeficiente de capacidad de disipación de energía de diseño (R) (y)</label>
                    </div>
                    <div className="col-2"></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s4236_value" id='h157' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 10) ?? 1} />
                    </div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1 mt-4">
                    <div className="col-6">
                        <label className="fw-bol">MÉTODO DE ANÁLISIS SÍSMICO (A.3.4)</label>
                    </div>
                    <div className="col-4">
                        <select className='form-select' id='f159'
                            name="recprd_eng_s4236_value" onChange={(e) => _set_analSismic(e.target.value)} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'value', 11) ?? 'No'}>
                            <option>Fuerza horizontal equivalente</option>
                            <option>Análisis dinámico elástico</option>
                            <option>Análisis dinámico inelástico</option>
                            <option>Estático análisis alternos plastificación progresiva</option>
                            <option>No</option>
                        </select>
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4236', 'check', 5) ?? 1)}
                            name="recprd_eng_s4236_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4236', 'check', 5) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-10">
                        <ul class="list-group" id="f159_list">
                            {_LIST_F159()}
                        </ul>
                    </div>
                </div>
            </>
        }
        let COMPONENT_STEP_07 = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-6">
                        <label className="fw-bold">(A,4,2) PERIODO FUNDAMENTAL DE LA EDIFICACIÓN</label>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Valor Ct</label>
                    </div>
                    <div className="col-2">
                        <input step="0.01"
                            className="form-control" name="recprd_eng_s07" id='e171' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 0) ?? ''} />
                    </div>
                    <div className="col-3"></div>
                    <div className="col-2"> </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4237', 'check', 0) ?? 1)}
                            name="recprd_eng_s07_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'check', 0) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Valor de α</label>
                    </div>
                    <div className="col-2">
                        <input step="0.01"
                            className="form-control" name="recprd_eng_s07" id='e172' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 1) ?? ''} />
                    </div>
                    <div className="col-3"></div>
                    <div className="col-2"> </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4237', 'check', 1) ?? 1)}
                            name="recprd_eng_s07_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'check', 1) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Altura edificio</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='e173' onChange={() => update_values()} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 2) ?? ''} />
                    </div>
                    <div className="col-3"></div>
                    <div className="col-2"> </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4237', 'check', 2) ?? 1)}
                            name="recprd_eng_s07_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'check', 2) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Número de pisos</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='e174' onChange={() => update_values()} onBlur={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 3) ?? ''} />
                    </div>
                    <div className="col-3"></div>
                    <div className="col-2"> </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4237', 'check', 3) ?? 1)}
                            name="recprd_eng_s07_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'check', 3) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-5">
                        <label>Periodo fundamental Aprox Ta = Ct x h^a</label>
                    </div>
                    <div className="col-3">(A.4.2-3)</div>
                    <div className="col-2"><input type="number" step="0.01"
                        className="form-control" name="recprd_eng_s07" id='j175' disabled
                        defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 4) ?? ''} /></div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4237', 'check', 4) ?? 1)}
                            name="recprd_eng_s07_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'check', 4) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-5">
                        <label>Calculo de Cu = 1.75-1.2 x Av x Fv</label>
                    </div>
                    <div className="col-3">(A.4.2-2)</div>
                    <div className="col-2"><input type="number" step="0.01"
                        className="form-control" name="recprd_eng_s07" id='j176' disabled
                        defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 5) ?? ''} /></div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-5">
                        <label>Pero Cu no puede ser menor de 1.20</label>
                    </div>
                    <div className="col-3">Cu</div>
                    <div className="col-2"><input type="number" step="0.01"
                        className="form-control" name="recprd_eng_s07" id='j177' disabled
                        defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 6) ?? ''} /></div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-3"><label>El valor de T no debe exceder a Cu*Ta </label></div>
                    <div className="col-2"><label>Tmax = Cu*Ta</label></div>
                    <div className="col-3"><label>(A.4.2.1)</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j178' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 7) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4237', 'check', 5) ?? 1)}
                            name="recprd_eng_s07_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'check', 5) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3"></div>
                    <div className="col-2"></div>
                    <div className="col-3"><label>Ta Usado</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j179' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 8) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4237', 'check', 6) ?? 1)}
                            name="recprd_eng_s07_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'check', 6) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3"></div>
                    <div className="col-2"></div>
                    <div className="col-3"><label>Periodo Funda. aprox.Ta = 0.1*N</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j180' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 9) ?? ''} />
                    </div>
                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s4237', 'check', 7) ?? 1)}
                            name="recprd_eng_s07_check" onChange={() => manage_step_4323()}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'check', 7) ?? 1}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label className="fw-bold">ESPECTRO DE DISEÑO (A.2.6)</label>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-5"><label className="fw-bold">Periodo menores de Tc (A.2.6-6)</label></div>
                    <div className="col-3"><label className="fw-bold">To = 0.1 x Av x Fv / (Aa x Fa)</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j183' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 10) ?? ''} />
                    </div>
                    <div className="col-2">
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-5"><label>Espectro de diseño (A.2.6-7)</label></div>
                    <div className="col-3"><label>Sa = 2.5 x Aa x Fa x I x (0.4 + 0.6*T/To)</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j184' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 11) ?? ''} />
                    </div>
                    <div className="col-2">
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-5"><label className="fw-bold">Periodo vibración {'<'} Tc (A.2.6-2)</label></div>
                    <div className="col-3"><label className="fw-bold">Tc = (0.48 x Av x Fv) / (Aa x Fa)</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j186' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 12) ?? ''} />
                    </div>
                    <div className="col-2">
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-5"><label>Espectro de aceleraciones (A.2.6-3)</label></div>
                    <div className="col-3"><label>Sa = 2.5 x Aa x Fa x I</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j187' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 13) ?? ''} />
                    </div>
                    <div className="col-2">
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-5"><label className="fw-bold">Periodo de vibración {'<'} TL (A.2.6-4) </label></div>
                    <div className="col-3"><label className="fw-bold">TL = 2.4 x Fv</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j189' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 14) ?? ''} />
                    </div>
                    <div className="col-2">
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-5"><label>Espectro de aceleraciones (A.2.6-5)</label></div>
                    <div className="col-3"><label>Sa = (1.2 x Av x Fv x I) / T</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j190' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 15) ?? ''} />
                    </div>
                    <div className="col-2">
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-5"><label className="fw-bold">Periodo de vibración {'>'} TL (A.2.6-4) </label></div>
                    <div className="col-3"><label className="fw-bold">TL = 2.4 x Fv</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j192' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 16) ?? ''} />
                    </div>
                    <div className="col-2">
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-5"><label>Espectro de aceleraciones (A.2.6-5)</label></div>
                    <div className="col-3"><label>Sa = (1.2 x Av x Fv x TL x I) / T^2</label></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j193' disabled
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 17) ?? ''} />
                    </div>
                    <div className="col-2">
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3"><label>Periodo Fundamental (A.2.6) </label></div>
                    <div className="col-2"><label>Ta =</label></div>
                    <div className="col-3"></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j195' disabled style={{ background: 'DarkKhaki' }}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 18) ?? ''} />
                    </div>
                    <div className="col-2">
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-3"><label>Espectro de aceleraciones (A.2.6.1)</label></div>
                    <div className="col-2"><label>Sa =</label></div>
                    <div className="col-3"><input type="text" name="recprd_eng_s07" className="form-control" id='h196' disabled
                        defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 19) ?? ''} /></div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s07" id='j196' disabled style={{ background: 'DarkKhaki' }}
                            defaultValue={_GET_STEP_TYPE_INDEX('s4237', 'value', 20) ?? ''} />
                    </div>
                    <div className="col-2">
                    </div>
                </div>
            </>
        }
        let COMPONENT_STEP_MATERIALS = () => {
            return <>
                <div className="row border border-dark bg-info mx-2 p-2 mt-5">
                    <div className="col text-center text-white">
                        <label className="fw-bold">ESPECIFICACIONES DE MATERIALES</label>
                    </div>
                </div>
                <div className="row border border-dark mx-2 p-2">
                    <div className="col">
                        <label className="fw-bold">ESTRUCTURAS EN CONCRETO</label>
                    </div>
                </div>
                <div className="row mx-2">
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Fundaciones</label></div>
                    <div className="col border border-dark px-2 text-center"><label>f'c</label></div>
                    <div className="col border border-dark px-2">  <input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='e202' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 0) ?? 21} /></div>
                    <div className="col border border-dark px-2 text-center"><label>MPa</label></div>
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Placas y vigas</label></div>
                    <div className="col border border-dark px-2 text-center"><label>f'c</label></div>
                    <div className="col border border-dark px-2">  <input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='k202' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 1) ?? 21} /></div>
                    <div className="col border border-dark px-2 text-center"><label>MPa</label></div>
                </div>
                <div className="row mx-2">
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Columnas</label></div>
                    <div className="col border border-dark px-2 text-center"><label>f'c</label></div>
                    <div className="col border border-dark px-2">  <input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='e203' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 2) ?? 21} /></div>
                    <div className="col border border-dark px-2 text-center"><label>MPa</label></div>
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Muros estructurales</label></div>
                    <div className="col border border-dark px-2 text-center"><label>f'c</label></div>
                    <div className="col border border-dark px-2">  <input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='k203' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 3) ?? 21} /></div>
                    <div className="col border border-dark px-2 text-center"><label>MPa</label></div>
                </div>
                <div className="row border border-dark mx-2 p-2">
                    <div className="col">
                        <label className="fw-bold">REFUERZO</label>
                    </div>
                </div>
                <div className="row mx-2">
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Longitudinal   ≥  3/8"</label></div>
                    <div className="col border border-dark px-2 text-center"><label>f'y</label></div>
                    <div className="col border border-dark px-2">  <input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='e206' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 4) ?? 420} /></div>
                    <div className="col border border-dark px-2 text-center"><label>MPa</label></div>
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Secundario (Estri/temp)</label></div>
                    <div className="col border border-dark px-2 text-center"><label>f'yt</label></div>
                    <div className="col border border-dark px-2">  <input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='k206' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 5) ?? 420} /></div>
                    <div className="col border border-dark px-2 text-center"><label>MPa</label></div>
                </div>
                <div className="row border border-dark mx-2 p-2">
                    <div className="col">
                        <label className="fw-bold">MUROS EN MAMPOSTERIA</label>
                    </div>
                </div>
                <div className="row mx-2">
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">A compresión </label></div>
                    <div className="col border border-dark px-2 text-center"><label>f'm</label></div>
                    <div className="col border border-dark px-2">  <input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='e209' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 6) ?? ''} /></div>
                    <div className="col border border-dark px-2 text-center"><label>MPa</label></div>
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">A compresión  unitaria</label></div>
                    <div className="col border border-dark px-2 text-center"><label>f'm</label></div>
                    <div className="col border border-dark px-2">  <input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='k209' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 7) ?? ''} /></div>
                    <div className="col border border-dark px-2 text-center"><label>MPa</label></div>
                </div>
                <div className="row mx-2">
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Mortero de pega</label></div>
                    <div className="col border border-dark px-2 text-center"><label>f'cp</label></div>
                    <div className="col border border-dark px-2">  <input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='e210' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 8) ?? ''} /></div>
                    <div className="col border border-dark px-2 text-center"><label>MPa</label></div>
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Mortero de relleno</label></div>
                    <div className="col border border-dark px-2 text-center"><label>f'cp</label></div>
                    <div className="col border border-dark px-2">  <input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='k210' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 9) ?? ''} /></div>
                    <div className="col border border-dark px-2 text-center"><label>MPa</label></div>
                </div>
                <div className="row border border-dark mx-2 p-2">
                    <div className="col">
                        <label className="fw-bold">ESTRUCTURAS METÁLICAS</label>
                    </div>
                </div>
                <div className="row mx-2">
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Platinas</label></div>
                    <div className="col border border-dark px-2 text-center"><label>ASTM</label></div>
                    <div className="col border border-dark px-2"><input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='e213' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 10) ?? ''} /></div>
                    <div className="col border border-dark px-2 text-center"></div>
                    <div className="col-6"></div>
                </div>
                <div className="row mx-2">
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Perfiles</label></div>
                    <div className="col border border-dark px-2 text-center"><label>ASTM</label></div>
                    <div className="col border border-dark px-2"><input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='e214' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 11) ?? ''} /></div>
                    <div className="col border border-dark px-2 text-center"></div>
                    <div className="col-6"></div>
                </div>
                <div className="row mx-2">
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Pernos</label></div>
                    <div className="col border border-dark px-2 text-center"><label>ASTM</label></div>
                    <div className="col border border-dark px-2"><input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='e215' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 12) ?? ''} /></div>
                    <div className="col border border-dark px-2 text-center"></div>
                    <div className="col-6"></div>
                </div>
                <div className="row mx-2">
                    <div className="col-2 border border-dark px-2"><label className="fw-bold">Soldaduras</label></div>
                    <div className="col border border-dark px-2 text-center"><label>ASTM</label></div>
                    <div className="col border border-dark px-2"><input type="number" step="0.01"
                        className="form-control my-1" name="recprd_eng_s0m" id='e216' onBlur={() => manage_step_4323()}
                        defaultValue={_GET_STEP_TYPE_INDEX('s423m', 'value', 13) ?? ''} /></div>
                    <div className="col border border-dark px-2 text-center"></div>
                    <div className="col-6"></div>
                </div>
            </>
        }
        // FUNCTIONS AND APIS
        //var formData = new FormData();

        let manage_step_4323 = (e) => {
            if (e) e.preventDefault();

            // s4233

            var formData = new FormData();
            var checks = [];
            var checks_2 = document.getElementsByName('recprd_eng_s4233_check');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            var values = [];
            var values_2 = document.getElementsByName('recprd_eng_s4233');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }
            formData.set('value', values.join(';'));


            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's4233');
            save_step('s4233', false, formData);

            // s4234

            formData = new FormData();
            checks = [];
            checks_2 = document.getElementsByName('recprd_eng_s4234_check');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            values = [];
            values_2 = document.getElementsByName('recprd_eng_s4234_value');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }
            formData.set('value', values.join(';'));


            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's4234');
            save_step('s4234', false, formData);

            // s4235

            formData = new FormData();
            checks = [];
            checks_2 = document.getElementsByName('recprd_eng_s4235_check');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            values = [];
            values_2 = document.getElementsByName('recprd_eng_s4235_value');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }
            formData.set('value', values.join(';'));


            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's4235');
            save_step('s4235', false, formData);

            // s4236

            formData = new FormData();
            checks = [];
            checks_2 = document.getElementsByName('recprd_eng_s4236_check');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            values = [];
            values_2 = document.getElementsByName('recprd_eng_s4236_value');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }
            formData.set('value', values.join(';'));


            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's4236');
            save_step('s4236', false, formData);

            // s4237

            formData = new FormData();
            checks = [];
            checks_2 = document.getElementsByName('recprd_eng_s07_check');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            values = [];
            values_2 = document.getElementsByName('recprd_eng_s07');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }
            formData.set('value', values.join(';'));


            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's4237');
            save_step('s4237', false, formData);

            // s423m

            formData = new FormData();
            values = [];
            values_2 = document.getElementsByName('recprd_eng_s0m');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }
            formData.set('value', values.join(';'));


            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's423m');
            save_step('s423m', false, formData);

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
                <hr />
                {SUBCATEGORIES[4] == 1 ? <>
                    <label className="app-p fw-bold text-uppercase my-2">Paso 3: Obtención del nivel de amenaza sísmica y valores de Aa y Av.  Consiste en ubicar el lugar de la edificación dentro de los mapas de zonificación sísmica, (Cap. A-2), y determinar los valores de Aa y Av para determinar la amenaza sísmica, según sea (Alta, intermedia y baja). </label>
                    <label className="app-p fw-bold my-2">Características sísmicas</label>
                    {COMPONENT_STEP_03()}
                    <hr />
                </> : ""}
                {SUBCATEGORIES[5] == 1 ? <>
                    <label className="app-p fw-bold text-uppercase my-2">Paso 4: Movimiento sísmicos de diseño. Debe tomarse en cuenta, la amenaza sísmica para el lugar determinado, parámetros Aa y Av, las características de la estratificación del suelo coeficientes Fa y Fv., la importancia del edificio para la recuperación por la comunidad con posterioridad a la ocurrencia de un sismo, Coeficiente de importancia.</label>
                    {COMPONENT_STEP_04()}
                    <hr />
                </> : ""}
                {SUBCATEGORIES[6] == 1 ? <>
                    <label className="app-p fw-bold text-uppercase my-2">Paso 5: Características de la estructuración y del material estructural empleado. </label>
                    {COMPONENT_STEP_05()}
                    <hr />
                </> : ""}
                {SUBCATEGORIES[7] == 1 ? <>
                    <label className="app-p fw-bold text-uppercase my-2">Paso 6, Grado de irregularidad de la estructura y procedimiento de análisis. Se realiza la revisión de los factores de irregularidad para determinar el método de análisis sísmico.</label>
                    {COMPONENT_STEP_06()}
                    <hr />
                </> : ""}
                {SUBCATEGORIES[8] == 1 ? <>
                    <label className="app-p fw-bold text-uppercase my-2">Paso 7, Determinación de las fuerzas sísmicas. El valor de las fuerzas sísmicas, en base a los parámetros sísmicos del paso 4.</label>
                    {COMPONENT_STEP_07()}
                    {COMPONENT_STEP_MATERIALS()}
                </> : ""}
            </div >
        );
    }
}

export default RECORD_ENG_STEP_4323;