import { MDBBtn } from 'mdb-react-ui-kit';
import React, { useState } from 'react';
import Modal from 'react-modal';
import { infoCud } from '../../../components/jsons/vars';
import { _CALCULATE_EXPENSES } from '../../../components/customClasses/typeParse';

const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const customStylesForModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 2,
    },
    content: {
        position: 'absolute',
        top: '15%',
        left: '30%',
        right: '30%',
        bottom: '',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',

    }
};

const PORUIS_DATA = {
    name: 'Estampilla PRO-UIS',
    subrules: [
        { name: 'Estrao 3 y 4', mult: 1300, round: true, },
        { name: 'Estrao 5 y 6', mult: 2600, round: true, },
    ]
}
const cur_matrix = [
    {
        name: 'Construcción o reconocimiento',
        subrules: [
            { name: 'Obra nueva', },
            { name: 'Ampliación', },
            { name: 'Modificación', },
            { name: 'Reforzamiento estructural', },
            { name: 'Adecuación (con obras)', },
            { name: 'Adecuación (sin obras)', },
            { name: 'Demolición total', },
            { name: 'Demolición parcial', },
            { name: 'Cerramiento', },
            { name: 'Restauración', },
            { name: 'Reconstrucción', },
            { name: 'Reconocimiento', },
        ]
    },
    {
        name: 'Urbanismo',
        subrules: [
            { name: 'Desarrollo', },
            { name: 'Saneamiento', },
            { name: 'Reurbanización', },
        ]
    },
    {
        name: 'Parcelación',
        subrules: [
            { name: 'Parcelación', },
        ]
    },

]
const old_2022 = [
    {
        name: 'Construcción o reconocimiento',
        subrules: [
            { name: 'Vivienda estrato 1', mult: 2120.60, preFix: '2002', },
            { name: 'Vivienda estrato 2', mult: 2968.84, preFix: '2002', },
            { name: 'Vivienda estrato 3', mult: 3817.08, preFix: '2003', },
            { name: 'Vivienda estrato 4', mult: 5937.68, preFix: '2004', },
            { name: 'Vivienda estrato 5', mult: 9754.76, preFix: '2005', },
            { name: 'Vivienda estrato 6', mult: 12723.60, preFix: '2006', },
            { name: 'Comercio o servicios en sector urbano', mult: 7634.16, preFix: '2007', },
            { name: 'Comercio o servicios en suelo rural, suburbano y expansión urbana', mult: 16964.80, preFix: '2007', },
            { name: 'Institucional o dotacional', mult: 6841, preFix: '2007', },
            { name: 'Industrial', mult: 15202, preFix: '2007', },
        ]
    },
    {
        name: 'Licencia de cerramiento',
        subrules: [
            { name: 'Por metro lineal', mult: 4241, preFix: '2015', },
        ]
    },
    {
        name: 'Urbanismo',
        subrules: [
            { name: 'Vivienda estrato 1', mult: 1520, preFix: '2018', },
            { name: 'Vivienda estrato 2', mult: 1520, preFix: '2018', },
            { name: 'Vivienda estrato 3', mult: 2660, preFix: '2019', },
            { name: 'Vivienda estrato 4', mult: 3800, preFix: '2020', },
            { name: 'Vivienda estrato 5', mult: 4941, preFix: '2021', },
            { name: 'Vivienda estrato 6', mult: 5701, preFix: '2022', },
            { name: 'Comercio o servicios en sector urbano', mult: 8741, preFix: '2023', },
            { name: 'Comercio o servicios en suelo rural, suburbano y expansión urbana', mult: 7981, preFix: '2023', },
            { name: 'Inst/serv/comercio/ind', mult: 6081, preFix: '2023', },
            { name: 'Industrial', mult: 7601, preFix: '2023', },
        ]
    },
    {
        name: 'Parcelación',
        subrules: [
            { name: 'Vivienda estrato 1', mult: 1520, preFix: '2025', },
            { name: 'Vivienda estrato 2', mult: 1520, preFix: '2025', },
            { name: 'Vivienda estrato 3', mult: 2660, preFix: '2026', },
            { name: 'Vivienda estrato 4', mult: 3800, preFix: '2027', },
            { name: 'Vivienda estrato 5', mult: 4941, preFix: '2028', },
            { name: 'Vivienda estrato 6', mult: 5701, preFix: '2029', },
            { name: 'Comercio o servicios en suelo rural, suburbano y expansión urbana', mult: 7981, preFix: '2030', },
            { name: 'Inst/serv/comercio/ind', mult: 6081, preFix: '2030', },
            { name: 'Industrial', mult: 7601, preFix: '2030', },
        ]
    },
    {
    name: 'Estampilla PRO-UIS',
    subrules: [
        { name: 'Estrao 3 y 4', mult: 1160, round: true, },
        { name: 'Estrao 5 y 6', mult: 2320, round: true, },
    ]},

]

const old_2023 = [
    {
        name: 'Construcción obra nueva',
        subrules: [
            { name: 'Residencial estrato 1 y otras modalidades', mult: 2120.60, preFix: '2002', },
            { name: 'Residencial estrato 2 y otras modalidades', mult: 2968.84, preFix: '2002', },
            { name: 'Residencial estrato 3 y otras modalidades', mult: 3817.08, preFix: '2003', },
            { name: 'Residencial estrato 4 y otras modalidades', mult: 5937.68, preFix: '2004', },
            { name: 'Residencial estrato 5 y otras modalidades', mult: 9754.76, preFix: '2005', },
            { name: 'Residencial estrato 6 y otras modalidades', mult: 12723.60, preFix: '2006', },
            { name: 'Construcción obra nueva uso comercio o servicios en sector urbano y otras modalidades', mult: 9754.56, preFix: '2007', },
            { name: 'Construcción obra nueva uso comercio o servicios en suelo rural, suburbano y expansion urbana, y otras modalidades', mult: 19085.40, preFix: '2007', },
            { name: 'Construcción obra nueva uso institucional o dotacional y otras modalidades', mult: 7634.16, preFix: '2007', },
            { name: 'Construcción obra nueva uso industrial y otras modalidades', mult: 16964.8, preFix: '2007', },
            { name: 'Licencia de cerramiento por metro lineal', mult: 4241.2, preFix: '2015', },

        ]
    },
    {
        name: 'Estampilla PRO-UIS',
        subrules: [
            { name: 'Estrao 3 y 4', mult: 1160, round: true, },
            { name: 'Estrao 5 y 6', mult: 2320, round: true, },
        ]},
]

const UVT = 47065;
const rules_matrix = () => {

    if (_GLOBAL_ID == 'cb1') return []
    if (_GLOBAL_ID == 'cp1') return [
        {
            name: 'Construcción obra nueva',
            subrules: [
                { name: 'Residencial estrato 1 y otras modalidades', mult: 2353.25, preFix: '2002', },
                { name: 'Residencial estrato 2 y otras modalidades', mult: 3294.55, preFix: '2002', },
                { name: 'Residencial estrato 3 y otras modalidades', mult: 4235.85, preFix: '2003', },
                { name: 'Residencial estrato 4 y otras modalidades', mult: 6589.10, preFix: '2004', },
                { name: 'Residencial estrato 5 y otras modalidades', mult: 10824.95, preFix: '2005', },
                { name: 'Residencial estrato 6 y otras modalidades', mult: 14119.50, preFix: '2006', },
                { name: 'Construcción obra nueva uso comercio o servicios en sector urbano y otras modalidades', mult: 10824.95, preFix: '2007', },
                { name: 'Construcción obra nueva uso comercio o servicios en suelo rural, suburbano y expansion urbana, y otras modalidades', mult: 21179.25, preFix: '2007', },
                { name: 'Construcción obra nueva uso institucional o dotacional y otras modalidades', mult: 8471.70, preFix: '2007', },
                { name: 'Construcción obra nueva uso industrial y otras modalidades', mult: 18826.00, preFix: '2007', },
                { name: 'Licencia de cerramiento por metro lineal', mult: 4707, preFix: '2015', },

            ]
        },
        PORUIS_DATA,
    ]
    if (_GLOBAL_ID == 'fl2') return [
        {
            name: 'Impuesto delineacion',
            subrules: [
                { name: 'Residencial estrato 1', mult: UVT * 0.04, preFix: '', },
                { name: 'Residencial estrato 2', mult: UVT * 0.06, preFix: '', },
                { name: 'Residencial estrato 3', mult: UVT * 0.09, preFix: '', },
                { name: 'Residencial estrato 4', mult: UVT * 0.13, preFix: '', },
                { name: 'Residencial estrato 5', mult: UVT * 0.23, preFix: '', },
                { name: 'Residencial estrato 6', mult: UVT * 0.37, preFix: '', },
                { name: 'Industrial', mult: UVT * 0.09, preFix: '', },
                { name: 'Comercial y de servicios', mult: UVT * 0.18, preFix: '', },
                { name: 'Institucional o dotacional', mult: UVT * 0.18, preFix: '', },
                { name: 'Suelo suburbano', mult: UVT * 0.09, preFix: '', },
                { name: 'Suelo rural', mult: UVT * 0.04, preFix: '', },
            ]
        },
        PORUIS_DATA,
    ]
}

const CUR_USES = [
    'Residencial (NO VIS)',
    'Residencial (VIS)',
    'Residencial (VIP)',
    'Comercial y de Servicios',
    'Dotacional',
    'Industrial',
    'Multiple'
]
export default function EXP_CALC(props) {
    const { translation, swaMsg, globals, domArea, domM2, domMt, domUse, domTipe, compact } = props;
    var [modal, setModal] = useState(false);
    var [mode, setMode] = useState('cur');

    var [str_m2, setM2] = useState('0');
    var [str_mf, setMf] = useState('0');
    var [str_mv, setMv] = useState('0');
    var [str_mt, setMt] = useState('0');

    // ***************************  DATA CONVERTER *********************** //

    function UPDATE_SUBRULE_SELECT(_selected) {
        var subrule_elm = document.getElementById("exp_calc_subrule");
        var matrix = mode == 'cur' ? cur_matrix : rules_matrix();
        var options = matrix.find(rule => rule.name == _selected).subrules;
        subrule_elm.innerHTML = '';

        var option = document.createElement("option");
        option.text = 'Seleccione uso...';
        option.disabled = true;
        option.selected = true;
        subrule_elm.add(option);

        options.map(op => {
            var option = document.createElement("option");
            option.text = op.name;
            subrule_elm.add(option);
        })
    }

    function GET_EXP_DATA() {
        var rule = document.getElementById("exp_calc_rule") ? document.getElementById("exp_calc_rule").value : false;
        var subrule = document.getElementById("exp_calc_subrule") ? document.getElementById("exp_calc_subrule").value : false;;
        var use = document.getElementById("exp_calc_use") ? document.getElementById("exp_calc_use").value : false;;
        var st = document.getElementById("exp_calc_strata") ? document.getElementById("exp_calc_strata").value : false;;
        var Q = document.getElementById("exp_calc_area") ? document.getElementById("exp_calc_area").value : false;;

        if (!rule) return;
        if (!subrule) return;
        if (use.includes('Seleccione')) return;
        if (st.includes('Seleccione')) st = 0;;
        if (!Q) return;

        var expenses = _CALCULATE_EXPENSES(rule, subrule, use, st, Q)
        return expenses
    }

    function CALCULATE_VALUE_CUR() {
        var expenses = GET_EXP_DATA()

        if (!expenses) return;

        setMf(expenses.cf);
        setMv(expenses.cv);
        setMt(expenses.ct);
    }
    function CALCULATE_VALUE_OTHER() {
        let value = document.getElementById("exp_calc_area").value;
        if (!value) return;
        let rule_elm = document.getElementById("exp_calc_rule").value;
        let subrule_elm = document.getElementById("exp_calc_subrule").value;
        let perc = document.getElementById('exp_calc_perc').value;

        let rule = rules_matrix().find(_rule => _rule.name == rule_elm);
        if (!rule) return;
        let subrule = rule.subrules.find(_subrule => _subrule.name == subrule_elm);
        if (!subrule) return;

        setM2(subrule.mult * (perc / 100));
        let mValue = (subrule.mult * value) * (perc / 100);
        if (subrule.round) setMt((Math.ceil(mValue / 1000) * 1000).toFixed(0));
        else setMt((mValue).toFixed(0));
    }

    function COPY_TO_DOM(type) {
        if (type == 'other') {
            let area = document.getElementById("exp_calc_area").value;
            let rule = document.getElementById("exp_calc_rule").value;
            let subrule = document.getElementById("exp_calc_subrule").value;

            let preFix_1 = rules_matrix().find(r => r.name == rule).subrules.find(r => r.name == subrule).preFix;

            if (domArea) document.getElementById(domArea).value = area;
            if (domTipe && rule) document.getElementById(domTipe).value = (preFix_1 + ' ' ?? '') + rule;
            if (domUse && subrule) document.getElementById(domUse).value = subrule;
            if (domM2 && _GLOBAL_ID == "cp1") document.getElementById(domM2).value = str_m2
            if (domM2 && _GLOBAL_ID == "cb1") document.getElementById(domM2).value = str_m2
            if (domM2 && _GLOBAL_ID == "fl2") document.getElementById(domM2).value = (str_m2 * area).toFixed(0)
            if (domMt) document.getElementById(domMt).value = str_mt;
        }
        if (type == 'cur_fix') {
            let area = document.getElementById("exp_calc_area").value;
            let rule = document.getElementById("exp_calc_rule").value;
            let subrule = document.getElementById("exp_calc_subrule").value;
            let use = document.getElementById("exp_calc_use").value;

            let type = rule + ' modalidad ' + subrule

            if (domArea) document.getElementById(domArea).value = area;
            if (domTipe) document.getElementById(domTipe).value = type;
            if (domUse) document.getElementById(domUse).value = CUR_USES[use];
            if (domM2 && _GLOBAL_ID == "cp1") document.getElementById(domM2).value = (str_mf / area).toFixed(4);
            if (domM2 && _GLOBAL_ID == "cb1") document.getElementById(domM2).value = str_mf
            if (domM2 && _GLOBAL_ID == "fl2") document.getElementById(domM2).value = str_mf
            if (domMt) document.getElementById(domMt).value = str_mf;
        }
        if (type == 'cur_var') {
            let area = document.getElementById("exp_calc_area").value;
            let rule = document.getElementById("exp_calc_rule").value;
            let subrule = document.getElementById("exp_calc_subrule").value;
            let use = document.getElementById("exp_calc_use").value;

            let type = rule + ' modalidad ' + subrule

            if (domArea) document.getElementById(domArea).value = area;
            if (domTipe) document.getElementById(domTipe).value = type;
            if (domUse) document.getElementById(domUse).value = CUR_USES[use];
            if (domM2 && _GLOBAL_ID == "cp1") document.getElementById(domM2).value = (str_mv / area).toFixed(4);
            if (domM2 && _GLOBAL_ID == "cb1") document.getElementById(domM2).value = str_mv
            if (domM2 && _GLOBAL_ID == "fl2") document.getElementById(domM2).value = str_mv
            if (domMt) document.getElementById(domMt).value = str_mv;
        }

        setModal(!modal);
    }

    // ***************************  JXS *********************** //
    let _JSX_MODE_CUR = () => {
        return <>
            <div className='row'>
                <div className='col-6'>
                    <label className='fw-bold'>Entrada de datos</label>
                    <select className="form-select form-select-sm my-1" id="exp_calc_rule"
                        onChange={(e) => UPDATE_SUBRULE_SELECT(e.target.value)}>
                        <option disabled selected>Seleccione tipo de actuación...</option>
                        {cur_matrix.map(rule => <option>{rule.name}</option>)}
                    </select>
                    <select className="form-select form-select-sm my-1" id="exp_calc_subrule" onChange={e => CALCULATE_VALUE_CUR()}>
                        <option disabled selected>Seleccione modalidad...</option>
                    </select>
                    <select className="form-select form-select-sm my-1" id="exp_calc_use" onChange={e => CALCULATE_VALUE_CUR()}>
                        <option disabled selected>Seleccione uso...</option>
                        {CUR_USES.map((u, i) => <option value={i}>{u}</option>)}
                    </select>
                    <select className="form-select form-select-sm my-1" id="exp_calc_strata" onChange={e => CALCULATE_VALUE_CUR()}>
                        <option disabled selected>Seleccione estrato...</option>
                        <option value={0}>1</option>
                        <option value={1}>2</option>
                        <option value={2}>3</option>
                        <option value={3}>4</option>
                        <option value={4}>5</option>
                        <option value={5}>6</option>
                    </select>
                    <input type="number" step={0.01} min={0} onChange={e => CALCULATE_VALUE_CUR()}
                        class="form-control form-control-sm my-1" id="exp_calc_area" placeholder='Área total' />
                </div>

                <div className='col-6'>
                    <label className='fw-bold'>Salida de datos</label>
                    <div className='row my-2'>
                        <h5 className='fw-normal'> Cargo fijo:  <label className='fw-bold'>{str_mf}</label></h5>
                    </div>
                    <div className='row my-2'>
                        <h5 className='fw-normal'> Cargo variable:  <label className='fw-bold'>{str_mv}</label></h5>
                    </div>
                    <div className='row my-2'>
                        <h5 className='fw-normal'> Cobro total:  <label className='fw-bold'>{str_mt}</label></h5>
                    </div>
                    <MDBBtn size='sm' className='my-1' outline onClick={() => COPY_TO_DOM('cur_fix')}><i class="far fa-copy"></i> COPIAR CARGO FIJO</MDBBtn>
                    <MDBBtn size='sm' outline onClick={() => COPY_TO_DOM('cur_var')}><i class="far fa-copy"></i> COPIAR CARGO VARIABLE</MDBBtn>
                </div>
            </div>
            <hr />
            <div className='row'>
                <label className='fw-bold'>Calculo de expensas : e = (cf * i x m) + (cv * i * j * m)</label>
                <div className='col-6'>
                    <label className='row mx-5'>cf = {GET_EXP_DATA() ? GET_EXP_DATA().cfi.toFixed(2) : ''}</label>
                    <label className='row mx-5'>cv = {GET_EXP_DATA() ? GET_EXP_DATA().cvi.toFixed(2) : ''}</label>
                </div>
                <div className='col-6'>
                    <label className='row mx-5'>m = {infoCud.m}</label>
                    <label className='row mx-5'>i = {GET_EXP_DATA() ? GET_EXP_DATA().i.toFixed(2) : ''}</label>
                    <label className='row mx-5'>j = {GET_EXP_DATA() ? GET_EXP_DATA().j.toFixed(2) : ''}</label>
                </div>
            </div>
        </>
    }

    let _JSX_MODE_OTHER = () => {
        return <>
            <div className='row'>
                <div className='col-6'>
                    <label className='fw-bold'>Entrada de datos</label>
                    <select className="form-select form-select-sm my-1" id="exp_calc_rule"
                        onChange={(e) => UPDATE_SUBRULE_SELECT(e.target.value)}>
                        <option disabled selected>Seleccione tipo de actuación...</option>
                        {rules_matrix().map(rule => <option>{rule.name}</option>)}
                    </select>
                    <select className="form-select form-select-sm my-1" id="exp_calc_subrule" onChange={e => CALCULATE_VALUE_OTHER()}>
                        <option disabled selected>Seleccione uso...</option>
                    </select>
                    <input type="number" step={0.01} min={0} onChange={e => CALCULATE_VALUE_OTHER()}
                        class="form-control form-control-sm my-1" id="exp_calc_area" placeholder='Área total' />

                    <div class="input-group input-group-sm my-1">
                        <input type="text" step={1} min={0} max={100} defaultValue={100} onChange={e => CALCULATE_VALUE_OTHER()}
                            class="form-control form-control-sm" id="exp_calc_perc" placeholder='Cobro %' />
                        <div class="input-group-append">
                            <span class="input-group-text" id="basic-addon2">%</span>
                        </div>
                    </div>

                </div>

                <div className='col-6'>
                    <label className='fw-bold'>Salida de datos</label>
                    <div className='row my-2'>
                        <h5 className='fw-normal'> Cobro * m2/U:  <label className='fw-bold'>{str_m2}</label></h5>

                    </div>
                    <div className='row my-2'>
                        <h5 className='fw-normal'> Cobro total:  <label className='fw-bold'>{str_mt}</label></h5>
                    </div>
                    <MDBBtn size='sm' outline onClick={() => COPY_TO_DOM('other')}><i class="far fa-copy"></i> COPIAR</MDBBtn>
                </div>
            </div>
        </>
    }


    return (
        <>
            <MDBBtn size='sm' onClick={() => setModal(!modal)}><i class="fas fa-calculator"></i> {compact ? '' : 'CALCULADORA'}</MDBBtn>

            <Modal contentLabel="EXP CALC"
                isOpen={modal}
                style={customStylesForModal}
                ariaHideApp={false}
            >
                <div className="my-2 d-flex justify-content-between ">
                    <div className='row'>
                        <div class="input-group">
                            <label className=''><i class="fas fa-calculator"></i> CALCULADORA DE LIQUIDACIONES</label>
                            <select className="form-select form-select-sm ms-2 border-primary"
                                onChange={(e) => setMode(e.target.value)}>
                                <option value={'cur'}>CURADURIA</option>
                                <option value={'other'}>OTROS</option>
                            </select>
                        </div>
                    </div>


                    <MDBBtn className='btn-close' color='none' onClick={() => setModal(!modal)}></MDBBtn>
                </div>
                <hr />

                {mode == 'cur' ? _JSX_MODE_CUR() : ''}
                {mode == 'other' ? _JSX_MODE_OTHER() : ''}

                <hr />
                <div className="text-end py-2">
                    <MDBBtn className="btn btn-sm btn-info" onClick={() => setModal(!modal)}><i class="fas fa-times-circle"></i> CERRAR</MDBBtn>
                </div>
            </Modal>
        </>
    );
}
