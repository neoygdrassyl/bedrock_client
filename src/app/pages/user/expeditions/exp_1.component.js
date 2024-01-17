import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import EXPEDITION_SERVICE from '../../../services/expedition.service';
import PQRS_Service from '../../../services/pqrs_main.service';
import JSONObjectParser from '../../../components/jsons/jsonReplacer';
import { axis, infoCud, zones, zonesTable } from '../../../components/jsons/vars'
import { regexChecker_isOA_2, _MANAGE_IDS, _CALCULATE_EXPENSES, formsParser1, regexChecker_isPh } from '../../../components/customClasses/typeParse';
import EXP_CALC from './exp_calc.component';
import { _FUN_6_PARSER } from '../../../components/customClasses/funCustomArrays';
import moment from 'moment'

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
class EXP_1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_EXPEDITION_JSON = (field) => {
            let json = currentRecord[field];
            if (!json) return {}
            let object = JSON.parse(JSON.parse(json))
            return object
        }
        let _GET_LAST_ID = (_id) => {
            let new_id = "";
            PQRS_Service.getlascub()
                .then(response => {
                    new_id = response.data[0].cub;
                    new_id = _MANAGE_IDS(new_id, 'end')
                    document.getElementById(_id).value = new_id;
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el concecutivo, intentelo nuevamnte.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                tramite: "",
                tipo: "",
                m_urb: "",
                m_sub: "",
                m_lic: "",
                area: "",
                description: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
                    _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                    _CHILD_VARS.usos = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                    _CHILD_VARS.area = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
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
                item_267: "",
                item_268: "",
            }
            if (_CHILD) {
                _CHILD_VARS.item_20 = _CHILD.id;
                _CHILD_VARS.item_211 = _CHILD.direccion;
                _CHILD_VARS.item_212 = _CHILD.direccion_ant;
                _CHILD_VARS.item_22 = _CHILD.matricula;
                _CHILD_VARS.item_23 = _CHILD.catastral;
                _CHILD_VARS.item_232 = _CHILD.catastral_2;
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
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentItem.record_arc_steps || [];
            var VERSIONR = currentItem.record_arc ? currentItem.record_arc.version : 0;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == VERSIONR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ? STEP[_type] : []
            if (!value) return [];
            value = value.split(';');
            return value
        }
        let _GET_STEP_TYPE_JSON = (_id_public) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return {};
            var value = STEP['json']
            if (!value) return {};
            value = JSON.parse(JSON.parse(value));
            return value
        }
        let _GET_EXP_AREAS = () => {
            var _CHILD = currentRecord.exp_areas;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CLOCK = (_state) => {
            var _CLOCK = _GET_CHILD_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }
        let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)
        let isPH = () => regexChecker_isPh(currentItem ? _GET_CHILD_1() : false, true)

        // DATA CONVERTERS

        let _GET_EXP_VAR_COST = () => {
            let _areas = _GET_EXP_AREAS();
            let sum = 0;
            _areas.map(area => {
                if (area.payment == 0) {
                    if (_GLOBAL_ID == "cp1") sum += Number(area.area * area.charge);
                    else if (_GLOBAL_ID == "cb1") sum += Number(area.charge);
                    else if (_GLOBAL_ID == "fl2") sum += Number(area.charge);
                    else sum += Number(area.charge);

                }
            })
            return Math.round(sum).toFixed(0)
        }

        let _GET_EXP_SECOND_COST = () => {
            let _areas = _GET_EXP_AREAS();
            let sum = 0;
            _areas.map(area => {
                if (area.payment == 1) {
                    if (_GLOBAL_ID == "cp1") sum += Number(area.area * area.charge);
                    else if (_GLOBAL_ID == "cb1") sum += Number(area.charge);
                    else if (_GLOBAL_ID == "fl2") sum += Number(area.charge);
                    else sum += Number(area.charge);

                }
            })
            return Math.round(sum).toFixed(0)
        }

        let _GET_EXP_VAR_AREA = () => {
            let _areas = _GET_EXP_AREAS();
            let sum = 0.0;
            _areas.map(area => {
                if (area.payment == 0) sum += Number(area.area)
            })
            return (sum).toFixed(2)
        }
        let _GET_EXPENSES = (area) => {
            var rule = formsParser1(_GET_CHILD_1());
            var subrule = formsParser1(_GET_CHILD_1());
            var use = _FUN_6_PARSER(_GET_CHILD_1().usos, true);
            var st = _GET_CHILD_2().item_267 - 1;
            var Q = area || _GET_EXPEDITION_JSON('taxes').id_payment_0_area || false;
            var year = moment(_GET_CLOCK(3).date_start).format('YYYY')

            var expenses = _CALCULATE_EXPENSES(rule, subrule, use, st, Q, year)
            return expenses
        }

        // COMPONENT JSX
        let _COMPONENT_GENERAL = () => {
            const value35 = _GET_STEP_TYPE('s35', 'value');
            const json34 = _GET_STEP_TYPE_JSON('s34');
            const CLOCK_FIX_PAYMENT = _GET_CLOCK(3);
            let epenses = _GET_EXPENSES();
            let taxes = _GET_EXPEDITION_JSON('taxes');
            let mun_tax = zonesTable[_GET_EXPEDITION_JSON('tmp').zone] ?? 0.1;
            let mun_1 = _GET_EXP_SECOND_COST();

            return <>
                <div class="card border border-dark mb-3">
                    <div class="card-header text-uppercase">Expensas Fijas</div>
                    <div class="card-body text-dark">
                        <div className="row">
                            <div className="col">
                                <label className="mt-1">Area (m2)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="expedition_25" min="0" step="0.01"
                                        defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_0_area ?? ''} onChange={(e) => document.getElementById("exxp_fix_1").value = _GET_EXPENSES(e.target.value).cf} />
                                </div>

                            </div>
                            <div className="col">
                                <label className="mt-1">Valor (COP)</label>
                                <input type="text" class="form-control" id="exxp_fix_1" disabled value={epenses.cf ?? 0} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Valor Pagado (COP)</label>
                                <input type="number" step={1} class="form-control" id="expedition_27" defaultValue={taxes.id_payment_0_real ?? ''} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Fecha</label>
                                <input type="text" class="form-control" id="exxp_fix_2" disabled value={CLOCK_FIX_PAYMENT.date_start} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Factura #</label>
                                <input type="text" class="form-control" id="exxp_fix_3" disabled value={currentItem.id_payment} />
                            </div>
                        </div>
                    </div>
                </div>

            {!isPH() ?<>
                <div class="card border border-dark mb-3">
                    <div class="card-header text-uppercase">Expensas variables</div>
                    <div class="card-body text-dark">
                        <div className="row">
                            <div className="col">
                                <label className="mt-1">Area (m2)</label>
                                <input type="text" class="form-control" id="exp_var_0" disabled value={_GET_EXP_VAR_AREA()} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Valor (COP)</label>
                                <input type="text" class="form-control" id="exp_var_1" disabled value={_GET_EXP_VAR_COST()} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Valor Pagado (COP)</label>
                                <input type="number" step={1} class="form-control" id="expedition_26" defaultValue={taxes.id_payment_1_real ?? ''} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Fecha</label>
                                <input type="date" class="form-control" id="expedition_24" max="2100-01-01"
                                    defaultValue={taxes.id_payment_1_date ?? ''} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Factura #</label>
                                <input type="text" class="form-control" id="expedition_18" defaultValue={taxes.id_payment_1 ?? ''} />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border border-dark mb-3">
                    <div class="card-header text-uppercase">Acto de tramite de licencia</div>
                    <div class="card-body text-dark">
                        <div className="row">
                            <div className="col-3">
                                <label className="mt-1">Fecha</label>
                                <input type="date" class="form-control" id="expedition_1" max="2100-01-01"
                                    defaultValue={currentRecord.date ?? ''} />
                            </div>
                            <div className="col-3">
                                <label className="mt-1">Ajuste Cargo Fijo</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="expedition_23"
                                        defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_fix ?? 0} />
                                </div>
                            </div>
                            <div className="col-3">
                                <label className="mt-1">{infoCud.serials.end} Acto</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="expedition_2"
                                        defaultValue={currentRecord.cub1 ?? ''} />
                                    <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID('expedition_2')}>GENERAR</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </> : null}
               


                {!conOA() && _GLOBAL_ID === 'cb1' && !isPH() ? <>

                    <div class="card border border-dark mb-3">
                        <div class="card-header text-uppercase">Impuestos, tasas y estampillas</div>
                        <div class="card-body text-dark">
                            <div className="row">
                                <div className="col">
                                    <label className="mt-1">Tratamiento</label>
                                    <select className="form-select" id="expedition_4" defaultValue={_GET_EXPEDITION_JSON('tmp').type ?? 'TD - Desarrollo'} >
                                        <option>SIN TRATAMIENTO</option>
                                        <option>TD - Desarrollo</option>
                                        <option>TC-1 - Consolidacion Urbana</option>
                                        <option>TC-2 - Consolidacion con generacion de espacio publico</option>
                                        <option>TRD - Redesarrollo</option>
                                        <option>TRA-1 - Reactivacion</option>
                                        <option>TRA-2 - Reactivacion</option>
                                        <option>TRA-3 - Reactivacion de sector urbano especial</option>
                                        <option>TMI-1 - Complementario</option>
                                        <option>TMI-2 - Reordenamiento</option>
                                        <option>TCoU - Para inmuebles de interes cultural del grupo urbano</option>
                                        <option>TCoA-1 - Para inmuebles de interes cultural del grupo arquitectonico agrupacion</option>
                                        <option>TCoA-2 - Para inmuebles de interes cultural del grupo arquitectonico individual</option>
                                    </select>
                                </div>
                                <div className="col">
                                    <label className="mt-1">Zona</label>
                                    <select className="form-select" id="expedition_16" defaultValue={_GET_EXPEDITION_JSON('tmp').zone ?? '0'} >
                                        {zones}
                                    </select>
                                </div>
                                <div className="col">
                                    <label className="mt-1">Eje</label>
                                    <select className="form-select" id="expedition_17" defaultValue={_GET_EXPEDITION_JSON('tmp').axis ?? '5'} >
                                        {axis}
                                    </select>
                                </div>
                                <div className="col">
                                    <label className="mt-1">Factura #</label>
                                    <input type="text" class="form-control" id="expedition_21"
                                        defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_4 ?? ''} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card border border-dark mb-3">
                        <div class="card-header text-uppercase">Impuestos Municipales</div>
                        <div class="card-body text-dark">
                            <div className="row">
                                <div className="col">
                                    <label className="mt-1">Delineación y Urbanismo</label>
                                    <input type="number" step={1} class="form-control" id="expedition_28" defaultValue={taxes.muni_deli || mun_1 || ''} />
                                </div>
                                <div className="col">
                                    <label className="mt-1">Uso y excavación subsuelo</label>
                                    <input type="number" step={1} class="form-control" id="expedition_29" defaultValue={taxes.muni_uso || (Math.ceil(mun_1 * mun_tax / 50) * 50).toFixed(0) || ''} />
                                </div>
                                <div className="col">
                                    <label className="mt-1">Fondo de embellecimiento</label>
                                    <input type="number" step={1} class="form-control" id="expedition_30" defaultValue={taxes.muni_enb ?? ''} />
                                </div>
                            </div>
                        </div>
                    </div>
                </> : ''}

                <div class="card border border-dark mb-3">
                    <div class="card-header text-uppercase">Estampilla PRO-UIS (SI ESTRATO {'>'} 2)</div>
                    <div class="card-body text-dark">
                        <div className="row">
                            <div className="col">
                                <label className="mt-1">Area Intervenida</label>
                                <div class="input-group">
                                    <EXP_CALC
                                        ranslation={translation} swaMsg={swaMsg} globals={globals}
                                        domArea={'expedition_8'}
                                        domMt={'expedition_9'}
                                        compact
                                    />
                                    <input type="number" class="form-control" id="expedition_8" min="0" step="0.01"
                                        defaultValue={_GET_EXPEDITION_JSON('tmp').uis ?? ''} />
                                </div>
                            </div>
                            <div className="col">
                                <label className="mt-1">Valor (COP)</label>
                                <input type="number" class="form-control" id="expedition_9" min="0" step="1"
                                    defaultValue={_GET_EXPEDITION_JSON('taxes').uis ?? ''} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Extra Valor (%)</label>
                                <input type="text" class="form-control" id="expedition_22"
                                    defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_2_p ?? (_GLOBAL_ID == 'cb1' ? 0 : 10)} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Documento Soporte #</label>
                                <input type="text" class="form-control" id="expedition_19"
                                    defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_2 ?? ''} />
                            </div>
                        </div>
                    </div>
                </div>


                {_GLOBAL_ID === 'cb1' ?
                    <>

                        <div class="card border border-dark mb-3">
                            <div class="card-header text-uppercase">Deberes Urbanísticos (SI ESTRATO {'>'} 2)</div>
                            <div class="card-body text-dark">

                                <div className="row">
                                    <div className="col-3">
                                        <label className="mt-1">Fecha</label>
                                        <input type="date" class="form-control" id="expedition_10" max="2100-01-01"
                                            defaultValue={currentRecord.date2 ?? ''} />
                                    </div>
                                    <div className="col-3">
                                        <label className="mt-1">{infoCud.serials.end}</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="expedition_11"
                                                defaultValue={currentRecord.cub2 ?? ''} />
                                            <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID('expedition_11')}>GENERAR</button>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <label className="mt-1">Factura #</label>
                                        <input type="text" class="form-control" id="expedition_20"
                                            defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_3 ?? ''} />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col">
                                        <label className="mt-1">Unidades Vivienda</label>
                                        <input type="number" class="form-control" id="expedition_12" min="0" step="1"
                                            defaultValue={_GET_EXPEDITION_JSON('duty').units || value35[2] || ''} />
                                    </div>
                                    <div className="col">
                                        <label className="mt-1">Áreas uso Comercio</label>
                                        <input type="number" class="form-control" id="expedition_13" min="0" step="0.01"
                                            defaultValue={_GET_EXPEDITION_JSON('duty').comerce || value35[0] || ''} />
                                    </div>
                                    <div className="col">
                                        <label className="mt-1">Valor ZGU m2 (COP)</label>
                                        <input type="number" class="form-control" id="expedition_14" min="0" step="0.01"
                                            defaultValue={_GET_EXPEDITION_JSON('duty').charge || json34.zugm || ''} />
                                    </div>
                                    <div className="col-2">
                                        <label className="mt-1">ZGU</label>
                                        <input type="text" class="form-control" id="expedition_15"
                                            defaultValue={_GET_EXPEDITION_JSON('duty').zgu || json34.zgu || ''} />
                                    </div>
                                </div>

                            </div>
                        </div>


                    </> : ''}


                {_GLOBAL_ID === 'cp1' ? <>
                    <div class="card border border-dark mb-3">
                        <div class="card-header text-uppercase">Delineación Urbana</div>
                        <div class="card-body text-dark">
                            <div className="row">

                                <div className="col-3">
                                    <label className="mt-1">Valor (COP)</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="del_4" defaultValue={taxes.muni_deli || mun_1 || ''} disabled />
                                    </div>
                                </div>
                                <div className="col-3">
                                    <label className="mt-1">Valor Pagado (COP)</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="del_pay" defaultValue={_GET_EXPEDITION_JSON('taxes').del_pay ?? ''} />
                                    </div>
                                </div>
                                <div className="col-3">
                                    <label className="mt-1">Fecha Factura</label>
                                    <input type="date" class="form-control" id="del_date" max="2100-01-01" defaultValue={_GET_EXPEDITION_JSON('taxes').del_date ?? ''} />
                                </div>
                                <div className="col-3">
                                    <label className="mt-1">Factura #</label>
                                    <input type="text" class="form-control" id="del_number" defaultValue={_GET_EXPEDITION_JSON('taxes').del_number ?? ''} />
                                </div>
                            </div>
                        </div>
                    </div>
                </> : null}

            </>
        }
        // FUNCTIONS AND APIS Tipología edificatoria Aislad. /Plataforma Continua Artículo 471° POT

        var formData = new FormData();

        let save_exp = (e) => {
            if (e) e.preventDefault();
            formData = new FormData();

            let date = document.getElementById("expedition_1") ? document.getElementById("expedition_1").value : false;
            if (date) formData.set('date', date);
            let cub1 = document.getElementById("expedition_2") ? document.getElementById("expedition_2").value : false;
            formData.set('cub1', cub1);
            formData.set('prev_cub1', currentRecord.cub1);

            let tmp = _GET_EXPEDITION_JSON('tmp');

            if (document.getElementById("expedition_4")) tmp.type = document.getElementById("expedition_4").value;
            if (document.getElementById("expedition_8")) tmp.uis = document.getElementById("expedition_8").value;
            if (document.getElementById("expedition_16")) tmp.zone = document.getElementById("expedition_16").value;
            if (document.getElementById("expedition_17")) tmp.axis = document.getElementById("expedition_17").value;

            formData.set('tmp', JSONObjectParser(tmp));

            let taxes = _GET_EXPEDITION_JSON('taxes');

            if (document.getElementById("expedition_9")) taxes.uis = document.getElementById("expedition_9").value;

            if (document.getElementById("expedition_19")) taxes.id_payment_2 = document.getElementById("expedition_19").value;
            if (document.getElementById("expedition_22")) taxes.id_payment_2_p = document.getElementById("expedition_22").value;
            if (document.getElementById("expedition_20")) taxes.id_payment_3 = document.getElementById("expedition_20").value;
            if (document.getElementById("expedition_21")) taxes.id_payment_4 = document.getElementById("expedition_21").value;
            if (document.getElementById("expedition_23")) taxes.id_payment_fix = document.getElementById("expedition_23").value;

            // VARIABLE EXPENSES
            if (document.getElementById("expedition_18")) taxes.id_payment_1 = document.getElementById("expedition_18").value;
            if (document.getElementById("expedition_24")) taxes.id_payment_1_date = document.getElementById("expedition_24").value;
            if (document.getElementById("expedition_26")) taxes.id_payment_1_real = document.getElementById("expedition_26").value;

            // FIXED EXPENSES
            if (document.getElementById("expedition_25")) taxes.id_payment_0_area = document.getElementById("expedition_25").value;
            if (document.getElementById("expedition_27")) taxes.id_payment_0_real = document.getElementById("expedition_27").value;

            // TAXES MUNICIPALES
            if (document.getElementById("expedition_28")) taxes.muni_deli = document.getElementById("expedition_28").value;
            if (document.getElementById("expedition_29")) taxes.muni_uso = document.getElementById("expedition_29").value;
            if (document.getElementById("expedition_30")) taxes.muni_enb = document.getElementById("expedition_30").value;

            // TAXES DELINEACION URBANA
            if (document.getElementById("del_pay")) taxes.del_pay = document.getElementById("del_pay").value;
            if (document.getElementById("del_date")) taxes.del_date = document.getElementById("del_date").value;
            if (document.getElementById("del_number")) taxes.del_number = document.getElementById("del_number").value;

            formData.set('taxes', JSONObjectParser(taxes));

            let date2 = document.getElementById("expedition_10") ? document.getElementById("expedition_10").value : false;
            if (date2) formData.set('date2', date2);
            let cub2 = document.getElementById("expedition_11") ? document.getElementById("expedition_11").value : '';
            formData.set('cub2', cub2);
            formData.set('prev_cub2', currentRecord.cub2);

            let duty = _GET_EXPEDITION_JSON('duty');

            if (document.getElementById("expedition_12")) duty.units = document.getElementById("expedition_12").value;
            if (document.getElementById("expedition_13")) duty.comerce = document.getElementById("expedition_13").value;
            if (document.getElementById("expedition_14")) duty.charge = document.getElementById("expedition_14").value;
            if (document.getElementById("expedition_15")) duty.zgu = document.getElementById("expedition_15").value;

            formData.set('duty', JSONObjectParser(duty));


            manage_exp();
        }

        let manage_exp = () => {
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.update(currentRecord.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });

                        this.props.requestUpdateRecord(currentItem.id);
                        this.props.requestUpdate(currentItem.id);
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACION",
                            text: `El concecutivo ${infoCud.serials.end} de este formulario ya existe, debe de elegir un concecutivo nuevo`,
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                    else {
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
        return (
            <div className="record_ph_gen container">
                <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="nav_expedition_1">
                    <label className="app-p lead fw-normal">INFORMACION GENERAL</label>
                </legend>
                <form id="form_expedition" onSubmit={save_exp}>
                    {_COMPONENT_GENERAL()}
                    <div className="row text-center">
                        <div className="col">
                            <button className="btn btn-success my-3"><i class="far fa-check-square"></i>GUARDAR CAMBIOS </button>
                        </div>
                    </div>
                </form>
            </div >
        );
    }
}

export default EXP_1;