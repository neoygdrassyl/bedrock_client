import { MDBBtn } from 'mdb-react-ui-kit';
import React, { useState } from 'react';
import Modal from 'react-modal';
import { infoCud } from '../../../components/jsons/vars';

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
        ]
    },

]


const rules_matrix = _GLOBAL_ID == 'cb1' ? [] : [
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
            { name: 'Construcción  obra nueva uso comercio o servicios en suelo rural, suburbano y expansión urbana; y otras modalidades', mult: 19085.40, preFix: '2007', },
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
        ]
    },

]

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
        var matrix = mode == 'cur' ? cur_matrix : rules_matrix;
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

    function CALCULATE_VALUE_CUR() {
        var rule = document.getElementById("exp_calc_rule").value;
        var subrule = document.getElementById("exp_calc_subrule").value;
        var use = document.getElementById("exp_calc_use").value;
        var st = document.getElementById("exp_calc_strata").value;
        var Q = document.getElementById("exp_calc_area").value;

        if (!rule) return;
        if (!subrule) return;
        if (use.includes('Seleccione')) return;
        if (st.includes('Seleccione')) st = 0;;
        if (!Q) return;



        const m = infoCud.m; // Factor m
        const iva = 0.16;
        var i;
        var j;
        var q_strata = [0.5, 0.5, 1, 1.5, 2, 2.5]; // base on strata
        var q_use = [2.9, 3.2, 4]; // base on use
        var UVT = 42412;
        var cfi = 10.01;
        var cvi = 20.02;
        var cf = UVT * cfi;
        var cv = UVT * cvi;

        let h = use == 1 ? 2 : 1;
        let r1 = subrule == 'Modificacion' || subrule == 'Reforzamiento' || subrule == 'Restauracion' ? 0.3 : 1;
        let r2 = subrule == 'Adecuacion (Sin Obras)' ? 0.5 : 1;
        let r21 = subrule == 'Adecuacion (Sin Obras)' ? 0 : 1;


        /*    
            e = (cf * i x m) + (cv * i * j * m)
            Q is the area express in m2
            Q < 100                   -> j = 0.45
            100 < Q < 11.000          -> j = (3.8/(0.12+(800/Q))) 
            Q > 11.000                -> j = (2.2/(0.018+(800/Q))) 
            Uranismo and Parcelacion  -> j = (4/(0.025+(2000/Q)))
        */

        // i
        if (use >= 3) {
            if (Q <= 300) i = 2.9;
            if (Q > 300 && Q <= 1000) i = 3.2;
            if (Q > 1000) i = 4;
        }
        else i = q_strata[st];

        // j
        if (rule == 'Urbanismo' || rule == 'Parcelación') j = 4 / (0.025 + (2000 / Q));
        else if (Q <= 100) j = 0.45;
        else if (Q > 100 && Q < 11000) j = j = (3.8 / (0.12 + (800 / Q)))
        else if (Q >= 11000) j = j = (2.2 / (0.018 + (800 / Q)))

        let _subtotal_cf = Math.round((cf * r1 * r2) * i * m);
        let _subtotal_cv = Math.round(((cv * r1 * r21) / h * i * j * m));

        setMf(_subtotal_cf);
        setMv(_subtotal_cv);
        setMt(_subtotal_cf + _subtotal_cv);
    }
    function CALCULATE_VALUE_OTHER() {
        let value = document.getElementById("exp_calc_area").value;
        if (!value) return;
        let rule_elm = document.getElementById("exp_calc_rule").value;
        let subrule_elm = document.getElementById("exp_calc_subrule").value;
        let perc = document.getElementById('exp_calc_perc').value;

        let rule = rules_matrix.find(_rule => _rule.name == rule_elm);
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

            let preFix_1 = rules_matrix.find(r => r.name == rule).subrules.find(r => r.name == subrule).preFix;

            if (domArea) document.getElementById(domArea).value = area;
            if (domTipe && rule) document.getElementById(domTipe).value = (preFix_1 + ' ' ?? '') + rule;
            if (domUse && subrule) document.getElementById(domUse).value = subrule;
            if (domM2) document.getElementById(domM2).value = str_m2;
            if (domMt) document.getElementById(domMt).value = str_mt;
        }
        if (type == 'cur') {
            let area = document.getElementById("exp_calc_area").value;
            let rule = document.getElementById("exp_calc_rule").value;
            let subrule = document.getElementById("exp_calc_subrule").value;
            let use = document.getElementById("exp_calc_use").value;

            let type = rule + ' modalidad ' + subrule

            if (domArea) document.getElementById(domArea).value = area;
            if (domTipe) document.getElementById(domTipe).value = type;
            if (domUse) document.getElementById(domUse).value = CUR_USES[use];
            if (domM2) document.getElementById(domM2).value = (str_mv / area).toFixed(4);
            if (domMt) document.getElementById(domMt).value = str_mt;
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
                    <MDBBtn size='sm' outline onClick={() => COPY_TO_DOM('cur')}><i class="far fa-copy"></i> COPIAR</MDBBtn>
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
                        {rules_matrix.map(rule => <option>{rule.name}</option>)}
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
