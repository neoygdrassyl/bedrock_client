import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { addDecimalPoints, formsParser1, getJSONFull, regexChecker_isOA_2, _ADDRESS_SET_FULL, _MANAGE_IDS } from '../../../components/customClasses/typeParse';
import { _FUN_1_PARSER, _FUN_4_PARSER, _FUN_6_PARSER } from '../../../components/customClasses/funCustomArrays';
import EXPEDITION_SERVICE from '../../../services/expedition.service';
import { cities, axisVar, zonesVar, zonesTable, axisTable, domains_number, infoCud, nomens } from '../../../components/jsons/vars';
import { MDBBtn, MDBCollapse } from 'mdb-react-ui-kit';
import Collapsible from 'react-collapsible';
import PQRS_Service from '../../../services/pqrs_main.service';
import moment from 'moment';
import EXP_RES from './exp._res.component';

const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const MySwal = withReactContent(Swal);
var writtenNumber = require('written-number');
const IVA = 0.19;
class EXP_DOCS extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, recordArc } = this.props;
        const { } = this.state;
        // DATA GETTERS


        let _GET_EXPEDITION_JSON = (field) => {
            let json = currentRecord[field];
            if (!json) return {}
            let object = JSON.parse(JSON.parse(json))
            return object
        }
        let _GET_CHILD_AREAS = () => {
            var _CHILD = currentRecord.exp_areas;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            if (!_CHILD[_CURRENT_VERSION]) return { tipo: '' };
            var _CHILD_VARS = {
                item_0: _CHILD[_CURRENT_VERSION].id,
                tipo: _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "",
                tramite: _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "",
                m_urb: _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "",
                m_sub: _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "",
                m_lic: _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "",
                item_6: _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "",
                item_7: _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "",
                item_8: _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "",
                item_9: _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "",
                item_101: _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "",
                item_102: _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "",
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_2 = () => {
            var _CHILD = currentItem.fun_2;
            if (!_CHILD) return {
                item_20: false,
                item_211: '',
                item_212: '',
                item_22: '',
                item_23: '',
                item_24: '',// PARSER
                item_25: '',// PARSER

                item_261: '',
                item_262: '',
                item_263: '',
                item_264: '',
                item_265: '',
                item_266: '',
                item_267: '',
                item_268: '',
            };
            var _CHILD_VARS = {
                item_20: _CHILD.id ?? false,
                item_211: _CHILD.direccion ?? '',
                item_212: _CHILD.direccion_ant ?? '',
                item_22: _CHILD.matricula ?? '',
                item_23: _CHILD.catastral ?? '',
                item_24: _CHILD.suelo ?? '',// PARSER
                item_25: _CHILD.lote_pla ?? '',// PARSER

                item_261: _CHILD.barrio ?? '',
                item_262: _CHILD.vereda ?? '',
                item_263: _CHILD.comuna ?? '',
                item_264: _CHILD.sector ?? '',
                item_265: _CHILD.corregimiento ?? '',
                item_266: _CHILD.lote ?? '',
                item_267: _CHILD.estrato ?? '',
                item_268: _CHILD.manzana ?? '',
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_51 = () => {
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
            if (!_CHILD[_CURRENT_VERSION]) return {
                item_5311: '',
                item_5312: '',
                item_532: '',
                item_533: '',
            };
            var _CHILD_VARS = {
                item_530: _CHILD[_CURRENT_VERSION].id ?? false,
                item_5311: _CHILD[_CURRENT_VERSION].name ?? '',
                item_5312: _CHILD[_CURRENT_VERSION].surname ?? '',
                item_532: _CHILD[_CURRENT_VERSION].id_number ?? '',
                item_533: _CHILD[_CURRENT_VERSION].role ?? '',
                item_534: _CHILD[_CURRENT_VERSION].number ?? '',
                item_535: _CHILD[_CURRENT_VERSION].email ?? '',
                item_536: _CHILD[_CURRENT_VERSION].address ?? '',
                docs: _CHILD[_CURRENT_VERSION].docs ?? '',
            }
            return _CHILD_VARS;
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
                        text: "No ha sido posible cargar el consecutivo, inténtelo nuevamente.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CLOCK_STATE = (_state, _version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }
        let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)
        //  DATA CONVERTERS

        let _GET_FUN_51_BY_TITLE = (_role) => {
            let fun_51 = _GET_CHILD_51();
            for (let i = 0; i < fun_51.length; i++) {
                const fun51 = fun_51[i];
                if (fun51.role == _role) return fun51;
            }
            return false;
        }
        let _RES_PARSER_1 = (fun_1) => {
            let parse = [];
            let licences = [];
            let mods = [];
            const _FUN_1_P = {
                'A': 'URBANIZACION',
                'B': 'PARCELACION',
                'C': 'SUBDIVISION',
                'D': 'CONSTRUCCION',
                'E': 'INTERVENCION Y OCUPACION DEL ESPACIO PUBLICO',
                'G': 'OTRAS ACTUACIONES',
            };
            const _FUN_1_3_p = {
                'A': 'DESARROLLO',
                'B': 'SANEAMIENTO',
                'C': 'RECUPERACION'
            };
            const _FUN_1_4_P = {
                'A': 'SUBDIVISION RURAL',
                'B': 'SUBDIVISION URBANA',
                'C': 'RELOTEO'
            };
            const _FUN_1_5 = {
                'A': 'OBRA NUEVA',
                'B': 'AMPLIACION',
                'C': 'ADECUACION',
                'D': 'MODIFICACION',
                'E': 'RESTAURACION',
                'F': 'REFORZAMIENTO ESTRUCTURAL',
                'G': 'DEMOLICION TOTAL',
                'g': 'DEMOLICION PARCIAL',
                'H': 'RECONSTRUCCION',
                'I': 'CERRAMIENTO'
            };
            let tipoArray = fun_1.tipo ? fun_1.tipo.split(',') : [];
            let fun_13_Array = fun_1.tipo ? fun_1.m_urb.split(',') : [];
            let fun_14_Array = fun_1.tipo ? fun_1.m_sub.split(',') : [];
            let fun_15_Array = fun_1.tipo ? fun_1.m_lic.split(',') : [];

            if (tipoArray.includes('F')) {
                parse.push('RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACION')
            }
            if (tipoArray.length > 1) parse.push('JUNTO CON LICENCIA DE')
            else { parse.push('LICENCIA DE') }

            tipoArray.map(value => { if (_FUN_1_P[value]) licences.push(_FUN_1_P[value]) });
            licences = licences.join(', ')
            parse.push(licences);

            parse.push('EN LA MODALIDAD DE')

            fun_13_Array.map(value => { if (_FUN_1_3_p[value]) mods.push(_FUN_1_3_p[value]) });
            fun_14_Array.map(value => { if (_FUN_1_4_P[value]) mods.push(_FUN_1_4_P[value]) });
            fun_15_Array.map(value => { if (_FUN_1_5[value]) mods.push(_FUN_1_5[value]) });
            mods = mods.join(', ')
            parse.push(mods);

            return parse.join(' ')
        }
        let LOAD_STEP = (_id_public, _record) => {
            var _CHILD = [];
            if (_record == 'arc') _CHILD = currentItem.record_arc_steps || [];
            if (_record == 'eng') _CHILD = currentItem.record_eng_steps || [];
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type, _record = 'arc') => {
            var STEP = LOAD_STEP(_id_public, _record);
            if (!STEP.id) return [];
            var value = STEP[_type] ? STEP[_type] : []
            if (!value) return [];
            value = value.split(';');
            return value
        }
        function capitalize(s) {
            return s && s[0].toUpperCase() + s.slice(1);
        }
        // COMPONENT JSX
        const _names = _GET_CHILD_51().map((value) => value.name + ' ' + value.surname).join('\n');
        const _namesid = _GET_CHILD_51().map((value) => value.id_number).join('\n');
        let _NOTY_TYPE_COMPONENENT = () => {
            return <>
                <div className='row mx-5 my-3'>
                    <strong>TIPO DE NOTIFICACIÓN</strong>

                    <div className="col-4">
                        <select className='form-select' id="type_not">
                            <option value="0">NO USAR</option>
                            <option value="1">NOTIFICACIÓN PRESENCIAL</option>
                            <option value="2">NOTIFICACIÓN ELECTRÓNICA - SIN RECURSO</option>
                            <option value="3">NOTIFICACIÓN ELECTRÓNICA - CON RECURSO</option>
                        </select>
                    </div>
                </div>
            </>
        }

        let _COMPONENT_DOC_1 = () => {
            return <>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Fecha Acto de tramite de licencia</label>
                        <input type="date" class="form-control" id="expedition_doc_1_1" max="2100-01-01"
                            defaultValue={currentRecord.date ?? ''} />
                    </div>
                    <div className="col">
                        <label className="mt-1">Consecutivo Acto de tramite de licencia</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_1_2" disabled
                                value={currentRecord.cub1 ?? ''} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1"># Radicación</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_1_3" disabled
                                value={currentItem.id_public} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Ciudad</label>
                        <div class="input-group">
                            <select class="form-select me-1" id={"expedition_doc_1_8"}>
                                {cities}
                            </select>
                        </div>
                    </div>


                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Titular(es)</label>
                        <div className="col">
                            <textarea class="form-control" id="expedition_doc_1_4" disabled readOnly >
                                {_names}
                            </textarea>
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Dirección Responsable</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_1_5" disabled
                                value={_GET_CHILD_53().item_536} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Dirección Predio</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_1_6"
                                defaultValue={_GET_CHILD_2().item_211} />
                            <button className='btn btn-info' type='button' onClick={() => _ADDRESS_SET_FULL("expedition_doc_1_6", _GET_CHILD_2())}><i class="fas fa-home"></i></button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Modalidad</label>
                        <input type="text" class="form-control" id="expedition_doc_1_7" disabled
                            value={formsParser1(_GET_CHILD_1())} />
                    </div>
                </div>
                {_NOTY_TYPE_COMPONENENT()}

            </>
        }
        let _COMPONENT_DOC_2 = () => {
            let _COMPONENT = [];
            let _areas = _GET_CHILD_AREAS();
            let sum = 0;
            for (var i = 0; i < _areas.length; i++) {
                if (_areas[i].payment == 0 || _areas[i].payment == 2) {
                    sum += Number(_areas[i].charge)
                    _COMPONENT.push(<>
                        <div className="row mb-1">
                            <div className="col">
                                <input type="text" class="form-control" name="expedition_doc_2_descs" disabled
                                    value={_areas[i].desc} readOnly />
                            </div>
                            <div className="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="expedition_doc_2_uses" disabled
                                        value={_areas[i].use} readOnly />
                                </div>
                            </div>
                            <div className="col">
                                <input type="text" class="form-control" name="expedition_doc_2_areas" disabled
                                    value={_areas[i].area} readOnly />
                            </div>
                            <div className="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="expedition_doc_2_charges" disabled
                                        value={addDecimalPoints(_areas[i].charge ?? 0)} readOnly />
                                </div>
                            </div>
                        </div>
                    </>)
                }


            }

            return <>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Modalidad</label>
                        <input type="text" class="form-control" id="expedition_doc_2_1" disabled
                            value={formsParser1(_GET_CHILD_1())} readOnly />
                    </div>
                    <div className="col-3">
                        <label className="mt-1"># Radicación</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_2_2" disabled
                                value={currentItem.id_public} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Destinación</label>
                        <input type="text" class="form-control" id="expedition_doc_2_3" disabled
                            value={_FUN_6_PARSER(_GET_CHILD_1().item_6, true)} readOnly />
                    </div>
                    <div className="col">
                        <label className="mt-1"># Predial / Catastral</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_2_4" disabled
                                value={(_GET_CHILD_2().item_23).replaceAll('-', '')} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Dirección Predio</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_2_5"
                                defaultValue={_GET_CHILD_2().item_211} />
                            <button className='btn btn-info' type='button' onClick={() => _ADDRESS_SET_FULL("expedition_doc_2_5", _GET_CHILD_2())}><i class="fas fa-home"></i></button>
                        </div>
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Estrato</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_2_6" disabled
                                value={_GET_CHILD_2().item_267} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Titular(es)</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Cedula(s) / NIT(s) </label>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_2_7" disabled readOnly >
                            {_names}
                        </textarea>
                    </div>
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_2_8" disabled readOnly >
                            {_namesid}
                        </textarea>
                        <div class="input-group">
                        </div>
                    </div>
                </div>

                <label className="my-2 fw-bold">Áreas</label>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Tipo de Actuación</label>
                    </div>
                    <div className="col">
                        <label className="mt-2">Uso</label>
                    </div>
                    <div className="col">
                        <label className="mt-2">Area de Intervención</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Cargo Variable</label>
                    </div>
                </div>
                {_COMPONENT}
                <div className="row mb-1">
                    <div className="col">
                        <input type="text" class="form-control" disabled
                            value={'SUBTOTAL'} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_2_11" disabled
                                value={addDecimalPoints(sum)} readOnly />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col">
                        <input type="text" class="form-control" disabled
                            value={`IVA (${IVA * 100}%)`} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_2_10" disabled
                                value={addDecimalPoints(Math.round(sum * IVA))} readOnly />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col">
                        <input type="text" class="form-control" disabled
                            value={'TOTAL EXPENSAS'} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_2_9" disabled
                                value={addDecimalPoints(Math.round(sum * (1 + IVA)))} readOnly />
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_DOC_3 = () => {
            let _COMPONENT = [];
            let _areas = _GET_CHILD_AREAS();
            let _totalArea = () => {
                let sum = 0;
                for (let i = 0; i < _areas.length; i++) {
                    const area = _areas[i];
                    if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                        sum += Number(area.area);
                    }

                }
                return sum.toFixed(2)
            }
            let sum = 0;
            let taxCharge = 0;
            sum += Number(_GET_EXPEDITION_JSON('taxes').tax1) + Number(_GET_EXPEDITION_JSON('taxes').tax2) + Number(_GET_EXPEDITION_JSON('taxes').tax3);
            let tax1 = zonesTable[_GET_EXPEDITION_JSON('tmp').zone] ?? 0.1;
            let tax2 = () => {
                if (!axisVar[_GET_EXPEDITION_JSON('tmp').axis]) return 0;
                if (_totalArea() > axisTable[_GET_EXPEDITION_JSON('tmp').axis]) return 0.6
                return 0
            };

            let muni_deli = _GET_EXPEDITION_JSON('taxes').muni_deli;
            let muni_uso = _GET_EXPEDITION_JSON('taxes').muni_uso;
            let muni_enb = _GET_EXPEDITION_JSON('taxes').muni_enb;

            let value_deli = (Number(muni_deli || taxCharge).toFixed(0));
            let value_uso = (Number(muni_uso) || Number(Math.ceil((taxCharge) * tax1 / 50) * 50).toFixed(0))
            let value_emb = (Number(muni_enb) || Number(Math.ceil(taxCharge * tax2() / 50) * 50).toFixed(0))
            let value_total = (Number(value_deli) + Number(value_uso) + Number(value_emb)).toFixed(0)

            for (var i = 0; i < _areas.length; i++) {
                if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                    taxCharge += _areas[i].charge;
                    _COMPONENT.push(<>
                        <div className="row mb-1">
                            <div className="col">
                                <input type="text" class="form-control" name="expedition_doc_3_descs" disabled
                                    value={_areas[i].desc} readOnly />
                            </div>
                            <div className="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="expedition_doc_3_uses" disabled
                                        value={_areas[i].use} readOnly />
                                </div>
                            </div>
                            <div className="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="expedition_doc_3_areas" disabled
                                        value={_areas[i].area} readOnly />
                                </div>
                            </div>
                        </div>
                    </>)
                }


            }

            let _ADD_TOTAL = (value) => {
                let value_1 = document.getElementById('expedition_doc_3_16').value;
                let value_2 = document.getElementById('expedition_doc_3_13').value;
                let value_3 = document.getElementById('expedition_doc_3_19').value;

                let new_value = addDecimalPoints(Number(value_1.replaceAll('.', '')) + Number(value_2.replaceAll('.', '')) + Number(value_3.replaceAll('.', '')));
                document.getElementById('expedition_doc_3_20').value = new_value;

                document.getElementById('expedition_doc_3_16').value = addDecimalPoints(value_1);
                document.getElementById('expedition_doc_3_13').value = addDecimalPoints(value_2);
                document.getElementById('expedition_doc_3_19').value = addDecimalPoints(value_3);
            }

            return <>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Modalidad</label>
                        <input type="text" class="form-control" id="expedition_doc_3_1" disabled
                            value={formsParser1(_GET_CHILD_1())} readOnly />
                    </div>
                    <div className="col-3">
                        <label className="mt-1"># Radicación</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_2" disabled
                                value={currentItem.id_public} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Destinación</label>
                        <input type="text" class="form-control" id="expedition_doc_3_3" disabled
                            value={_FUN_6_PARSER(_GET_CHILD_1().item_6, true)} readOnly />
                    </div>
                    <div className="col">
                        <label className="mt-1"># Predial / Catastral</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_4" disabled
                                value={(_GET_CHILD_2().item_23).replaceAll('-', '')} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Dirección Predio</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_5"
                                defaultValue={_GET_CHILD_2().item_211} />
                            <button className='btn btn-info' type='button' onClick={() => _ADDRESS_SET_FULL("expedition_doc_3_5", _GET_CHILD_2())}><i class="fas fa-home"></i></button>
                        </div>
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Estrato</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_6" disabled
                                value={_GET_CHILD_2().item_267} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Titular(es)</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Cedula(s) / NIT(s) </label>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_3_7" disabled readOnly >
                            {_names}
                        </textarea>
                    </div>
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_3_8" disabled readOnly >
                            {_namesid}
                        </textarea>
                        <div class="input-group">
                        </div>
                    </div>
                </div>

                <label className="my-2 fw-bold">Áreas</label>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Tipo de Actuación</label>
                    </div>
                    <div className="col">
                        <label className="mt-2">Uso</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Area de Intervencion</label>
                    </div>
                </div>
                {_COMPONENT}

                <div className="row">
                    <div className="col-4">
                        <label className="mt-1">Tratamiento</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_10" disabled
                                value={_GET_EXPEDITION_JSON('tmp').type ?? ''} readOnly />
                        </div>
                    </div>
                    <div className="col-4">
                        <label className="mt-1">Zona</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_21" disabled
                                value={_GET_EXPEDITION_JSON('tmp').zone ? zonesVar[_GET_EXPEDITION_JSON('tmp').zone] : ''} readOnly />
                        </div>
                    </div>
                    <div className="col-4">
                        <label className="mt-1">Eje</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_22" disabled
                                value={_GET_EXPEDITION_JSON('tmp').axis ? axisVar[_GET_EXPEDITION_JSON('tmp').axis] : ''} readOnly />
                        </div>
                    </div>
                </div>

                <label className="my-2 fw-bold">Liquidación de Impuestos</label>
                <div className="row">
                    <div className="col-3">
                        <label className="mt-2">Codigo</label>
                    </div>
                    <div className="col">
                        <label className="mt-2">Cuenta</label>
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Valor</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-3">
                        <input type="text" class="form-control" id="expedition_doc_3_11" disabled
                            defaultValue={'002'} />
                    </div>
                    <div className="col">
                        <input type="text" class="form-control" id="expedition_doc_3_12" disabled
                            defaultValue={"Impuesto de Delineación y Urbanismo"} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_13" onBlur={(e) => _ADD_TOTAL(e.target.value)}
                                defaultValue={addDecimalPoints(value_deli)} />
                        </div>
                    </div>
                </div>
                <div className="row mt-1">
                    <div className="col-3">
                        <input type="text" class="form-control" id="expedition_doc_3_14" disabled
                            defaultValue={'007'} />
                    </div>
                    <div className="col">
                        <input type="text" class="form-control" id="expedition_doc_3_15" disabled
                            defaultValue={"Impuesto de Uso y Escavación del subsuelo"} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_16" onBlur={(e) => _ADD_TOTAL(e.target.value)}
                                defaultValue={addDecimalPoints(value_uso)} />
                        </div>
                    </div>
                </div>
                <div className="row mt-1">
                    <div className="col-3">
                        <input type="text" class="form-control" id="expedition_doc_3_17" disabled
                            defaultValue={'601'} />
                    </div>
                    <div className="col">
                        <input type="text" class="form-control" id="expedition_doc_3_18" disabled
                            defaultValue={"Fonto de Embellecimiento Urbano"} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_19" onBlur={(e) => _ADD_TOTAL(e.target.value)}
                                defaultValue={addDecimalPoints(value_emb)} />
                        </div>
                    </div>
                </div>
                <div className="row mt-1">
                    <div className="col">
                        <input type="text" class="form-control" disabled
                            value={'TOTAL IMPUESTOS'} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_3_20"
                                defaultValue={addDecimalPoints(value_total)} />
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_DOC_4 = () => {
            let puisst = _GET_EXPEDITION_JSON('taxes').uis ?? 0;
            let puisp = (_GET_EXPEDITION_JSON('taxes').uis ?? 0) / 100 * (_GET_EXPEDITION_JSON('taxes').id_payment_2_p ?? 100);
            let puist = Number(puisst) + Number(puisp)
            return <>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Modalidad</label>
                        <input type="text" class="form-control" id="expedition_doc_4_1" disabled
                            value={formsParser1(_GET_CHILD_1())} readOnly />
                    </div>
                    <div className="col-3">
                        <label className="mt-1"># Radicacion</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_4_2" disabled
                                value={currentItem.id_public} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Destinacion</label>
                        <input type="text" class="form-control" id="expedition_doc_4_3" disabled
                            value={_FUN_6_PARSER(_GET_CHILD_1().item_6, true)} readOnly />
                    </div>
                    <div className="col">
                        <label className="mt-1"># Predial / Catastral</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_4_4" disabled
                                value={(_GET_CHILD_2().item_23).replaceAll('-', '')} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Direccion Predio</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_4_5"
                                defaultValue={_GET_CHILD_2().item_211} />
                            <button className='btn btn-info' type='button' onClick={() => _ADDRESS_SET_FULL("expedition_doc_4_5", _GET_CHILD_2())}><i class="fas fa-home"></i></button>
                        </div>
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Estrato</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_4_6" disabled
                                value={_GET_CHILD_2().item_267} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Titular(es)</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Cedula(s) / NIT(s) </label>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_4_7" disabled readOnly >
                            {_names}
                        </textarea>
                    </div>
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_4_8" disabled readOnly >
                            {_namesid}
                        </textarea>
                        <div class="input-group">
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-3">
                        <label className="mt-2">Área intervención</label>
                        <input type="text" class="form-control" id="expedition_doc_4_9" disabled
                            value={_GET_EXPEDITION_JSON('tmp').uis ?? ''} readOnly />
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Valor Estampilla PRO-UIS</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_4_10" disabled
                                value={addDecimalPoints(puisst)} readOnly />
                        </div>
                    </div>
                    <div className="col-4">
                        <label className="mt-1">Valor Extra</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_4_11" disabled
                                value={addDecimalPoints(_GET_EXPEDITION_JSON('taxes').id_payment_2_p + '%' ?? '')} readOnly />
                            <input type="text" class="form-control" id="expedition_doc_4_12" disabled
                                value={addDecimalPoints(puisp.toFixed(0))} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Total</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_4_13" disabled
                                value={addDecimalPoints(puist.toFixed(0))} readOnly />
                        </div>
                    </div>
                </div>

            </>
        }
        let _COMPONENT_DOC_5 = () => {
            writtenNumber.defaults.lang = 'es';
            let strata = _GET_CHILD_2().item_267;
            var nV = strata > 4 ? 6 : 4;
            var uV = _GET_EXPEDITION_JSON('duty').units;
            var mC = _GET_EXPEDITION_JSON('duty').comerce;
            var charge = _GET_EXPEDITION_JSON('duty').charge;
            var total1 = 0;
            var total2 = 0;
            if (uV > 0) total1 = nV * uV * charge;
            if (mC > 0) total2 = 0.06 * mC * charge;
            total1 = total1.toFixed(0)
            total2 = total2.toFixed(0)
            var total = Number(total1) + Number(total2)
            return <>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Fecha Deber Urbanistico</label>
                        <input type="date" class="form-control" id="expedition_doc_5_1" max="2100-01-01"
                            defaultValue={currentRecord.date2 ?? ''} />
                    </div>
                    <div className="col">
                        <label className="mt-1">Consecutivo Deber Urbanistico</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_5_2" disabled
                                value={currentRecord.cub2 ?? ''} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Ciudad</label>
                        <div class="input-group">
                            <select class="form-select me-1" id={"expedition_doc_5_26"}>
                                {cities}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Modalidad</label>
                        <input type="text" class="form-control" id="expedition_doc_5_3" disabled
                            value={formsParser1(_GET_CHILD_1())} readOnly />
                    </div>
                    <div className="col-3">
                        <label className="mt-1"># Radicacion</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_5_4" disabled
                                value={currentItem.id_public} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Destinacion</label>
                        <input type="text" class="form-control" id="expedition_doc_5_6" disabled
                            value={_FUN_6_PARSER(_GET_CHILD_1().item_6, true)} readOnly />
                    </div>
                    <div className="col">
                        <label className="mt-1"># Predial / Catastral</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_5_7" disabled
                                value={(_GET_CHILD_2().item_23).replaceAll('-', '')} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Direccion Predio</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_5_8"
                                defaultValue={_GET_CHILD_2().item_211} />
                            <button className='btn btn-info' type='button' onClick={() => _ADDRESS_SET_FULL("expedition_doc_5_8", _GET_CHILD_2())}><i class="fas fa-home"></i></button>
                        </div>
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Estrato</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_5_9" disabled
                                value={_GET_CHILD_2().item_267} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-3">
                        <label className="mt-1">Matricula</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_5_5" disabled
                                value={_GET_CHILD_2().item_22} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Tratamiento</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_5_26" disabled
                                value={_GET_EXPEDITION_JSON('tmp').type ?? ''} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Titular(es)</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Cedula(s) / NIT(s) </label>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_5_10" disabled readOnly >
                            {_names}
                        </textarea>
                    </div>
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_5_11" disabled readOnly >
                            {_namesid}
                        </textarea>
                        <div class="input-group">
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-1">Unidades Vivienda</label>
                        <input type="number" class="form-control" id="expedition_doc_5_12" disabled readOnly
                            value={_GET_EXPEDITION_JSON('duty').units ?? ''} />
                    </div>
                    <div className="col">
                        <label className="mt-1">Áreas uso Comercio</label>
                        <input type="number" class="form-control" id="expedition_doc_5_13" disabled readOnly
                            value={_GET_EXPEDITION_JSON('duty').comerce ?? ''} />
                    </div>
                    <div className="col">
                        <label className="mt-1">Valor m2 (COP)</label>
                        <input type="number" class="form-control" id="expedition_doc_5_14" disabled readOnly
                            value={addDecimalPoints(_GET_EXPEDITION_JSON('duty').charge) ?? 0} />
                    </div>
                    <div className="col-2">
                        <label className="mt-1">ZGU</label>
                        <input type="text" class="form-control" id="expedition_doc_5_15" disabled readOnly
                            value={_GET_EXPEDITION_JSON('duty').zgu ?? ''} />
                    </div>
                </div>
                {Number(uV) > 0
                    ?
                    <div className="row">
                        <label className="my-2 fw-bold">Liquidación de Proyectos de Vivienda (Unidades {'>'} 0)</label>
                        <div className="col-2">
                            <label className="mt-1">m2 por Viv.</label>
                            <input type="number" class="form-control" id="expedition_doc_5_16" disabled readOnly
                                value={nV} />
                        </div>
                        <div className="col-2">
                            <label className="mt-1">Numero</label>
                            <input type="number" class="form-control" id="expedition_doc_5_17" disabled readOnly
                                value={uV} />
                        </div>
                        <div className="col-2">
                            <label className="mt-1">Valor (COP)</label>
                            <input type="number" class="form-control" id="expedition_doc_5_18" disabled readOnly
                                value={addDecimalPoints(charge)} />
                        </div>
                        <div className="col">
                            <label className="mt-1">Total (COP)</label>
                            <input type="text" class="form-control" id="expedition_doc_5_19" disabled readOnly
                                value={addDecimalPoints(total1)} />
                        </div>
                    </div>
                    : ""}

                {Number(mC) > 0
                    ?
                    <div className="row">
                        <label className="my-2 fw-bold">Liquidación para uso de comercio, servicio, industrial, dotacional (Áreas uso Comercio {'>'} 0)</label>
                        <div className="col-2">
                            <label className="mt-1">6 m2 * 100m2</label>
                            <input type="number" class="form-control" id="expedition_doc_5_20" disabled readOnly
                                value={'0.06'} />
                        </div>
                        <div className="col-2">
                            <label className="mt-1">m2</label>
                            <input type="number" class="form-control" id="expedition_doc_5_21" disabled readOnly
                                value={mC} />
                        </div>
                        <div className="col-2">
                            <label className="mt-1">Valor (COP)</label>
                            <input type="number" class="form-control" id="expedition_doc_5_22" disabled readOnly
                                value={addDecimalPoints(charge)} />
                        </div>
                        <div className="col">
                            <label className="mt-1">Total (COP)</label>
                            <input type="text" class="form-control" id="expedition_doc_5_23" disabled readOnly
                                value={addDecimalPoints(total2)} />
                        </div>
                    </div>

                    : ""}


                <div className="row">
                    <div className="col">
                        <label className="mt-1">Total (Letras)</label>
                        <input type="text" class="form-control" id="expedition_doc_5_24" disabled readOnly
                            value={writtenNumber(total).toUpperCase() + ' MCTE'} />
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Total (COP) (Numeros)</label>
                        <input type="text" class="form-control" id="expedition_doc_5_25" disabled readOnly
                            value={addDecimalPoints(total)} />
                    </div>
                </div>

            </>
        }
        let _COMPONENT_DOC_6 = () => {
            let _COMPONENT = [];
            let _areas = _GET_CHILD_AREAS();
            let _totalArea = () => {
                let sum = 0;
                for (let i = 0; i < _areas.length; i++) {
                    const area = _areas[i];
                    if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                        if (_GLOBAL_ID == "cb1") sum += Number(area.charge);
                        if (_GLOBAL_ID == "cp1") sum += Number(area.area * area.charge);
                        if (_GLOBAL_ID == "fl2") sum += Number(area.charge);

                    }

                }
                return Math.round(sum).toFixed(0)
            }
            for (var i = 0; i < _areas.length; i++) {
                if (_areas[i].payment == 1 || _areas[i].payment == 2) {

                    let axc = 0
                    if (_GLOBAL_ID == "cb1") axc = Math.round((Number(_areas[i].charge) ?? 0))
                    if (_GLOBAL_ID == "cp1") axc = Math.round((Number(_areas[i].charge) ?? 0) * (Number(_areas[i].area) ?? 0))
                    if (_GLOBAL_ID == "fl2") axc = Math.round((Number(_areas[i].charge) ?? 0))

                    _COMPONENT.push(<>
                        <div className="row mb-1">
                            <div className="col">
                                <input type="text" class="form-control" name="expedition_doc_6_descs" disabled
                                    value={_areas[i].desc} readOnly />
                            </div>
                            <div className="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="expedition_doc_6_uses" disabled
                                        value={_areas[i].use} readOnly />
                                </div>
                            </div>
                            <div className="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="expedition_doc_6_charges" disabled
                                        value={_areas[i].charge} readOnly />
                                </div>
                            </div>
                            <div className="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="expedition_doc_6_areas" disabled
                                        value={addDecimalPoints(_areas[i].area)} readOnly />
                                </div>
                            </div>
                            <div className="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="expedition_doc_6_sums" disabled
                                        value={addDecimalPoints(axc)} readOnly />
                                </div>
                            </div>
                        </div>
                    </>)
                }


            }

            return <>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Modalidad</label>
                        <input type="text" class="form-control" id="expedition_doc_6_1" disabled
                            value={formsParser1(_GET_CHILD_1())} readOnly />
                    </div>
                    <div className="col-3">
                        <label className="mt-1"># Radicación</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_6_2" disabled
                                value={currentItem.id_public} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Destinación</label>
                        <input type="text" class="form-control" id="expedition_doc_6_3" disabled
                            value={_FUN_6_PARSER(_GET_CHILD_1().item_6, true)} readOnly />
                    </div>

                    <div className="col-6">
                        <label className="mt-1">Dirección Predio</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_6_5"
                                defaultValue={_GET_CHILD_2().item_211} />
                            <button className='btn btn-info' type='button' onClick={() => _ADDRESS_SET_FULL("expedition_doc_6_5", _GET_CHILD_2())}><i class="fas fa-home"></i></button>
                        </div>
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Estrato</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_6_6" disabled
                                value={_GET_CHILD_2().item_267} readOnly />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label className="mt-1"># Predial / Catastral</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_6_4" disabled
                                value={(_GET_CHILD_2().item_23).replaceAll('-', '')} readOnly />
                        </div>
                    </div>

                    <div className="col">
                        <label className="mt-1">Matricula</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_6_mat" value={_GET_CHILD_2().item_22} readOnly />
                        </div>
                    </div>

                </div>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Titular(es)</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Cedula(s) / NIT(s) </label>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_6_7" disabled readOnly >
                            {_names}
                        </textarea>
                    </div>
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_6_8" disabled readOnly >
                            {_namesid}
                        </textarea>
                        <div class="input-group">
                        </div>
                    </div>
                </div>

                <label className="my-2 fw-bold">Áreas</label>

                {_GLOBAL_ID === 'fl2' ?
                    <div className="row">
                        <div className="col-4">
                            <label className="mt-1">Área del predio</label>
                            <div class="input-group">
                                <input type="number" step={0.01} class="form-control" id="expedition_doc_6_area" defaultValue="0.00" />
                            </div>
                        </div>

                    </div>
                    : null}

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Tipo de Actuación</label>
                    </div>
                    <div className="col">
                        <label className="mt-2">Uso</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Valor m2</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Cantidad m2</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Valor total</label>
                    </div>
                </div>
                {_COMPONENT}

                <div className="row">
                    <div className="col">
                        <input type="text" class="form-control" id="expedition_doc_6_12" disabled
                            defaultValue={"Total"} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_6_13" disabled
                                value={addDecimalPoints(_totalArea())} readOnly />
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_DOC_7 = () => {
            let _COMPONENT = [];
            let taxes = _GET_EXPEDITION_JSON('taxes')
            let _areas = _GET_CHILD_AREAS();
            let fun_51_p = _GET_FUN_51_BY_TITLE('PROPIETARIO')
            let _totalArea = () => {
                let sum = 0;
                for (let i = 0; i < _areas.length; i++) {
                    const area = _areas[i];
                    if (_areas[i].payment == 0 || _areas[i].payment == 2) {
                        sum += Number(area.area * area.charge);
                    }

                }
                return Math.round(sum).toFixed(0)
            }
            for (var i = 0; i < _areas.length; i++) {
                if (_areas[i].payment == 0 || _areas[i].payment == 2) {
                    let axc = Math.round((Number(_areas[i].charge) ?? 0) * (Number(_areas[i].area) ?? 0))
                    _COMPONENT.push(<>
                        <div className="row mb-1">
                            <div className="col">
                                <input type="text" class="form-control" name="expedition_doc_7_descs" disabled
                                    value={_areas[i].desc} readOnly />
                            </div>
                            <div className="col">
                                <input type="text" class="form-control" name="expedition_doc_7_uses" disabled
                                    value={_areas[i].use} readOnly />
                            </div>
                            <div className="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="expedition_doc_7_areas" disabled
                                        value={_areas[i].area} readOnly />
                                </div>
                            </div>
                            <div className="col-3">
                                <div class="input-group">
                                    <input type="text" class="form-control" name="expedition_doc_7_sums" disabled
                                        value={addDecimalPoints(axc)} readOnly />
                                </div>
                            </div>
                        </div>
                    </>)
                }


            }

            return <>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Modalidad</label>
                        <input type="text" class="form-control" id="expedition_doc_7_1" disabled
                            value={formsParser1(_GET_CHILD_1())} readOnly />
                    </div>
                    <div className="col-3">
                        <label className="mt-1"># Radicación</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_7_2" disabled
                                value={currentItem.id_public} readOnly />
                        </div>
                    </div>
                </div>



                <div className="row">
                    <div className="col">
                        <label className="mt-2">Destinación</label>
                        <input type="text" class="form-control" id="expedition_doc_7_3" disabled
                            value={_FUN_6_PARSER(_GET_CHILD_1().item_6, true)} readOnly />
                    </div>
                    <div className="col">
                        <label className="mt-1"># Predial / Catastral</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_7_4" disabled
                                value={(_GET_CHILD_2().item_23).replaceAll('-', '')} readOnly />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Dirección Predio</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_7_5"
                                defaultValue={_GET_CHILD_2().item_211} />
                            <button className='btn btn-info' type='button' onClick={() => _ADDRESS_SET_FULL("expedition_doc_6_5", _GET_CHILD_2())}><i class="fas fa-home"></i></button>
                        </div>
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Estrato</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_7_6" disabled
                                value={_GET_CHILD_2().item_267} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-2">Propietario</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Cedula / NIT </label>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <input type="text" class="form-control" id="expedition_doc_7_7" disabled
                            value={fun_51_p.name + ' ' + fun_51_p.surname} readOnly />
                    </div>
                    <div className="col">
                        <input type="text" class="form-control" id="expedition_doc_7_8" disabled
                            value={fun_51_p.id_number} readOnly />
                        <div class="input-group">
                        </div>
                    </div>
                </div>

                <label className="my-2 fw-bold">Áreas</label>
                <div className="row">
                    <div className="col">
                        <label className="mt-1">Descripción</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Destino</label>
                    </div>
                    <div className="col">
                        <label className="mt-1">Cantidad m2</label>
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Cargo Variable</label>
                    </div>
                </div>
                {_COMPONENT}

                <div className="row mb-1 ">
                    <div className="col">
                        <input type="text" class="form-control" disabled
                            defaultValue={"Ajuste cargo Fijo"} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_7_12" disabled
                                value={addDecimalPoints(taxes.id_payment_fix ?? 0)} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col">
                        <input type="text" class="form-control" disabled
                            defaultValue={"Total expensas"} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_7_9" disabled
                                value={addDecimalPoints(_totalArea())} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col">
                        <input type="text" class="form-control" disabled
                            defaultValue={"Sub Total"} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_7_13" disabled
                                value={addDecimalPoints(Number(taxes.id_payment_fix ?? 0) + Number(_totalArea()))} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col">
                        <input type="text" class="form-control" disabled
                            defaultValue={"Iva"} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_7_10" disabled
                                value={addDecimalPoints((_totalArea() * IVA).toFixed(0))} readOnly />
                        </div>
                    </div>
                </div>
                <div className="row mb-1 ">
                    <div className="col">
                        <input type="text" class="form-control" disabled
                            defaultValue={"Total"} />
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_7_11" disabled
                                value={addDecimalPoints(
                                    (
                                        Number(taxes.id_payment_fix ?? 0) +
                                        Number(_totalArea()) +
                                        _totalArea() * IVA
                                    ).toFixed(0))} readOnly />
                        </div>
                    </div>
                </div>
            </>
        }


        let _COMPOENEN_DOC_FINAL_NOT = () => {
            var _CHILD_53 = _GET_CHILD_53();
            let _JSON = getJSONFull(currentRecord.cub3_json)
            let RES_JSON = getJSONFull(currentRecord.reso)
            return <>
                <div className="row mb-3">
                    <div className="col">
                        <label>Fecha del documento</label>
                        <input type="date" class="form-control mb-3" max='2100-01-01' id="exodfb_date_doc" required
                            defaultValue={_JSON.date_doc || moment().format('YYYY-MM-DD')} />
                    </div>

                    <div className="col">
                        <label>Número de Radicación</label>
                        <input type="text" class="form-control mb-3" id="exodfb_id_public" disabled
                            defaultValue={currentItem.id_public} />
                    </div>
                    <div className="col">
                        <label className="mt-1"> {infoCud.serials.end} Carta Citación</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="exodfb_cub3_exp"
                                defaultValue={currentRecord.cub3 || ''} />
                            <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID('exodfb_cub3_exp')}>GENERAR</button>
                        </div>
                        <div className="col" >
                            <label className="mt-1">{infoCud.serials.start}</label>
                            <div class="input-group ">
                                <select class="form-select" defaultValue={""}>
                                    <option value=''>Seleccione una opción</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label>Ciudad</label>
                        <input type="text" class="form-control mb-3" id="exodfb_city"
                            defaultValue={_JSON.city || capitalize(infoCud.city.toLowerCase())} />
                    </div>
                    <div className="col">
                        <label>Número de Resolución</label>
                        <input type="text" class="form-control mb-3" id="exodfb_res_public" disabled
                            defaultValue={currentRecord.id_public} />
                    </div>
                    <div className="col">
                        <label>Fecha de Resolución</label>
                        <input type="date" class="form-control mb-3" max='2100-01-01' id="exodfb_date_res" disabled
                            defaultValue={RES_JSON.date || ''} />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label>Responsable</label>
                        <input type="text" class="form-control mb-3" id="exodfb_name"
                            defaultValue={_JSON.name || _CHILD_53.item_5311 + " " + _CHILD_53.item_5312} />
                    </div>
                    <div className="col">
                        <label>Dirección</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="exodfb_address"
                                defaultValue={_JSON.address || _CHILD_53.item_536} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Email</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="exodfb_email"
                                defaultValue={_JSON.email || _CHILD_53.item_535} />
                        </div>
                    </div>
                </div>

            </>
        }
        let _COMPONENT_EJE = () => {
            var reso = _GET_EXPEDITION_JSON('reso');
            var _CHILD_1 = _GET_CHILD_1();
            let type = reso.type || _RES_PARSER_1(_CHILD_1);

            const reso_vig_date_dv = reso.vig ? reso.vig.date : '';
            const reso_vig_p1_dv = reso.vig ? reso.vig.p1 : '1';
            const reso_vig_vp_dv = reso.vig ? reso.vig.vp : '1';
            const reso_vig_n_dv = reso.vig ? reso.vig.n : '12';
            const arts_cb = reso.vig ? reso.vig.arts_cb ? reso.vig.arts_cb.split(',') : [1, 1] : [1, 1];

            const reso_pot_dv = reso.pot ?? infoCud.pot;

            const art_4_1_dv = _GET_STEP_TYPE('s33', 'value')[0] || '';
            const art_4_2_dv = _GET_STEP_TYPE('s33', 'value')[1] || '';

            return <>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Modalidad</label>
                        <input type="text" class="form-control" id="expedition_eje_type"
                            defaultValue={type} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label className="mt-1">Fecha Vigencia</label>
                        <div class="input-group">
                            <input type="date" class="form-control" id="expedition_eje_date"
                                defaultValue={reso_vig_date_dv} required />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Consecutivo</label>
                        <div class="input-group">
                            <input type="text" class="form-control" disabled id="expedition_eje_id_res"
                                value={currentRecord.id_public} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Vigencia Tiempo</label>
                        <div class="input-group my-1">
                            <select class="form-select" id="expedition_eje_vign" defaultValue={reso_vig_n_dv}>
                                <option value={0}>SIN VIGENCIA</option>
                                <option value={12}>DOCE (12) MESES</option>
                                <option value={24}>VEINTE Y CUATRO (24) MESES</option>
                                <option value={36}>TREINTA Y SEIS (36) MESES</option>
                                <option value={48}>CUARENTA Y OCHO (48) MESES</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label className="mt-1">POT</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_eje_pot" disabled
                                value={reso_pot_dv} />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Estado</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_eje_state" disabled
                                value={'EJECUTORIADA'} readOnly />

                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1"># Radicacion</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_eje_id_public" disabled
                                value={currentItem.id_public} readOnly />
                        </div>
                    </div>
                </div>

                <div className="row my-2">
                    <label>Parrafo 1</label>
                    <div className="col text-start">
                        <select class="form-select me-1" id={"expedition_eje_p1"} defaultValue={reso_vig_p1_dv}>
                            <option value={1}>al haber concluido los términos de ley sin haberse interpuesto ningún recurso</option>
                            <option value={2} >al haber renunciado expresamente a los términos de ley para interponer los recursos</option>
                            <option value={3} >NO USAR</option>
                        </select>
                    </div>
                </div>

                <div className="row my-2">
                    <label>Vigencia</label>
                    <div className="col text-start">
                        <select class="form-select me-1" id={"expedition_eje_vig"} defaultValue={reso_vig_vp_dv}>
                            <option value={1}>Conceder con fundamento en los articulos 2.2.6.1.4.1 y 2.2.6.4.2.5 del decreto 1077 de 2015.</option>
                            <option value={2}>La modificación de licencia vigente no amplía la vigencia establecida en la licencia de construcción inicial objeto de modificación.</option>
                        </select>
                    </div>
                </div>

                <div className="row my-2">
                    <div className="row mb-1">
                        <div className="col text-start">
                            <p>Autorizar las obras e intervenciones que a continuación se describen.</p>
                            <p className='text-primary fw-bold'>Procedencia de los datos: </p>
                            <p className='text-primary fw-bold'>INFO. ARQ. -{'>'} 3.3 Descripción de la Actuación Urbanística -{'>'} 3.3.1 Antecedentes y Descripción del Proyecto a licencias</p>
                        </div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-2">
                            <div class="form-check form-check-inline mt-5">
                                <label> 1. Antecedentes</label>
                                <input class="form-check-input" type="checkbox" defaultChecked={arts_cb[0] == 1 ? true : false} name="eje_pdf_arts_cb" />
                            </div>
                        </div>
                        <div className="col">
                            <textarea class="form-control" id="eje_pdf_art_4_1_dv" rows={'3'} defaultValue={art_4_1_dv}></textarea>
                        </div>
                    </div>

                    <div className="row mb-1">
                        <div className="col-2">
                            <div class="form-check form-check-inline mt-5">
                                <label> 2. Descripción</label>
                                <input class="form-check-input" type="checkbox" defaultChecked={arts_cb[1] == 1 ? true : false} name="eje_pdf_arts_cb" />
                            </div>
                        </div>

                        <div className="col">
                            <textarea class="form-control" id="eje_pdf_art_4_2_dv" rows={'4'} defaultValue={art_4_2_dv}></textarea>
                        </div>
                    </div>
                </div>


                <div className="row mb-2">
                    <div className="col">
                        <label>Alineción firma curador</label>
                        <div class="input-group my-1">
                            <select class="form-select me-1" id={"eje_pdf_reso_1"}>
                                <option value={'center'}>CENTRO</option>
                                <option value={'left'}>IZQUIERDA</option>
                                <option value={'right'}>DERECHA</option>
                            </select>
                        </div>
                    </div>


                    <div className="col">
                        <label>Logo</label>
                        <div class="input-group my-1">
                            <select class="form-select me-1" id={"eje_pdf_reso_logo"}>
                                <option value={'no'}>SIN LOGO</option>
                                <option value={'left'}>IZQUIERDA</option>
                                <option value={'left2'}>IZQUIERDA ENTRESALTO</option>
                                <option value={'right'}>DERECHA</option>
                                <option value={'right2'}>DERECHA ENTRESALTO</option>

                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-2 text-center">

                    <div className="col ">
                        <div class="input-group-sm my-1">
                            <label class="form-check-label">Margen Superior (cm)</label>
                            <input type="number" min={0} step={0.01} class="form-control-sm" id="eje_maring_top" defaultValue={2.5} />
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="input-group-sm my-1">
                            <label class="form-check-label">Margen Inferior (cm)</label>
                            <input type="number" min={0} step={0.01} class="form-control-sm" id="eje_maring_bot" defaultValue={2.5} />
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="input-group-sm my-1">
                            <label class="form-check-label">Margen Izquierdo (cm)</label>
                            <input type="number" min={0} step={0.01} class="form-control-sm" id="eje_maring_left" defaultValue={1.7} />
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="input-group-sm my-1">
                            <label class="form-check-label">Margen Derecho (cm)</label>
                            <input type="number" min={0} step={0.01} class="form-control-sm" id="eje_maring_right" defaultValue={1.7} />
                        </div>
                    </div>
                </div>
                <div className="row mb-2">

                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="eje_pdf_rew_simple" />
                            <label class="form-check-label">Usar nombre revisor</label>
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="eje_pdf_rew_signs" />
                            <label class="form-check-label">Usar firma profesionales</label>
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="eje_pdf_rew_pagesi" />
                            <label class="form-check-label">Usar pie de pagina</label>
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="eje_pdf_rew_pagesn" defaultChecked="true" />
                            <label class="form-check-label">Usar paginación</label>
                        </div>
                    </div>
                </div>
                <div className="row m-3">
                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="eje_pdf_rew_pagesx" defaultChecked={false} />
                            <label class="form-check-label">Paginacion Arriba</label>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="row text-center">
                    <div className="col">
                        <MDBBtn className="btn btn-success my-3" onClick={() => save_eje()}><i class="far fa-share-square"></i> GUARDAR CAMBIOS </MDBBtn>
                    </div>
                    <div className="col">
                        <MDBBtn className="btn btn-danger my-3" onClick={() => pd_eje()}><i class="far fa-file-pdf"></i> GENERAR PDF </MDBBtn>
                    </div>
                </div>
            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();
        let pdf_gen_1 = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('date', document.getElementById('expedition_doc_1_1').value);
            formData.set('cub', document.getElementById('expedition_doc_1_2').value);
            formData.set('id_public', document.getElementById('expedition_doc_1_3').value);

            formData.set('name', document.getElementById('expedition_doc_1_4').value);
            formData.set('addressn', document.getElementById('expedition_doc_1_5').value);
            formData.set('address', document.getElementById('expedition_doc_1_6').value);

            formData.set('type', document.getElementById('expedition_doc_1_7').value);
            formData.set('city', document.getElementById('expedition_doc_1_8').value);

            formData.set('type_not', document.getElementById("type_not").value);


            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.gen_doc_1(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/expdoc1/" + "Acto de tramite de licencia " + currentItem.id_public + ".pdf");
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
        let pdf_gen_2 = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('type', document.getElementById('expedition_doc_2_1').value);
            formData.set('id_public', document.getElementById('expedition_doc_2_2').value);

            formData.set('destination', document.getElementById('expedition_doc_2_3').value);
            formData.set('catastral', document.getElementById('expedition_doc_2_4').value);
            formData.set('address', document.getElementById('expedition_doc_2_5').value);
            formData.set('strata', document.getElementById('expedition_doc_2_6').value);

            formData.set('name', document.getElementById('expedition_doc_2_7').value);
            formData.set('nameid', document.getElementById('expedition_doc_2_8').value);

            // AREAS
            let _areas = document.getElementsByName('expedition_doc_2_areas');
            let areas = [];
            for (var i = 0; i < _areas.length; i++) { areas.push(_areas[i].value) }
            // USES
            let _uses = document.getElementsByName('expedition_doc_2_uses');
            let uses = [];
            for (var i = 0; i < _uses.length; i++) { uses.push(_uses[i].value) }
            // CHARGES
            let _charges = document.getElementsByName('expedition_doc_2_charges');
            let charges = [];
            for (var i = 0; i < _charges.length; i++) { charges.push(_charges[i].value) }
            // DESC
            let _descs = document.getElementsByName('expedition_doc_2_descs');
            let descs = [];
            for (var i = 0; i < _descs.length; i++) { descs.push(_descs[i].value) }

            formData.set('areas', areas.join(';'));
            formData.set('uses', uses.join(';'));
            formData.set('charges', charges.join(';'));
            formData.set('descs', descs.join(';'));

            formData.set('total', document.getElementById('expedition_doc_2_9').value);
            formData.set('iva', document.getElementById('expedition_doc_2_10').value);
            formData.set('subtotal', document.getElementById('expedition_doc_2_11').value);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.gen_doc_2(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/expdoc2/" + "Liquidacion de Expensas " + currentItem.id_public + ".pdf");
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
        let pdf_gen_3 = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('type', document.getElementById('expedition_doc_3_1').value);
            formData.set('id_public', document.getElementById('expedition_doc_3_2').value);

            formData.set('destination', document.getElementById('expedition_doc_3_3').value);
            formData.set('catastral', document.getElementById('expedition_doc_3_4').value);
            formData.set('address', document.getElementById('expedition_doc_3_5').value);
            formData.set('strata', document.getElementById('expedition_doc_3_6').value);

            formData.set('name', document.getElementById('expedition_doc_3_7').value);
            formData.set('nameid', document.getElementById('expedition_doc_3_8').value);

            // AREAS
            let _areas = document.getElementsByName('expedition_doc_3_areas');
            let areas = [];
            for (var i = 0; i < _areas.length; i++) { areas.push(_areas[i].value) }
            // USES
            let _uses = document.getElementsByName('expedition_doc_3_uses');
            let uses = [];
            for (var i = 0; i < _uses.length; i++) { uses.push(_uses[i].value) }
            // DESC
            let _descs = document.getElementsByName('expedition_doc_3_descs');
            let descs = [];
            for (var i = 0; i < _descs.length; i++) { descs.push(_descs[i].value) }

            formData.set('areas', areas.join(';'));
            formData.set('uses', uses.join(';'));
            formData.set('descs', descs.join(';'));

            formData.set('treatment', document.getElementById('expedition_doc_3_10').value);
            formData.set('zone', document.getElementById('expedition_doc_3_21').value);
            formData.set('axis', document.getElementById('expedition_doc_3_22').value);

            formData.set('cod1', document.getElementById('expedition_doc_3_11').value);
            formData.set('account1', document.getElementById('expedition_doc_3_12').value);
            formData.set('tax1', document.getElementById('expedition_doc_3_13').value);
            formData.set('cod2', document.getElementById('expedition_doc_3_14').value);
            formData.set('account2', document.getElementById('expedition_doc_3_15').value);
            formData.set('tax2', document.getElementById('expedition_doc_3_16').value);
            formData.set('cod3', document.getElementById('expedition_doc_3_17').value);
            formData.set('account3', document.getElementById('expedition_doc_3_18').value);
            formData.set('tax3', document.getElementById('expedition_doc_3_19').value);

            formData.set('total', document.getElementById('expedition_doc_3_20').value);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.gen_doc_3(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/expdoc3/" + "Impuestos Minicipales " + currentItem.id_public + ".pdf");
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
        let pdf_gen_4 = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('type', document.getElementById('expedition_doc_4_1').value);
            formData.set('id_public', document.getElementById('expedition_doc_4_2').value);

            formData.set('destination', document.getElementById('expedition_doc_4_3').value);
            formData.set('catastral', document.getElementById('expedition_doc_4_4').value);
            formData.set('address', document.getElementById('expedition_doc_4_5').value);
            formData.set('strata', document.getElementById('expedition_doc_4_6').value);

            formData.set('name', document.getElementById('expedition_doc_4_7').value);
            formData.set('nameid', document.getElementById('expedition_doc_4_8').value);

            formData.set('uis1', document.getElementById('expedition_doc_4_9').value);
            formData.set('uis2', document.getElementById('expedition_doc_4_10').value);

            formData.set('uis2_p', document.getElementById('expedition_doc_4_11').value);
            formData.set('uis2_v', document.getElementById('expedition_doc_4_12').value);
            formData.set('uis2_t', document.getElementById('expedition_doc_4_13').value);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.gen_doc_4(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/expdoc4/" + "Estampilla PRO-UIS " + currentItem.id_public + ".pdf");
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
        let pdf_gen_5 = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('date', document.getElementById('expedition_doc_5_1').value);
            formData.set('cub', document.getElementById('expedition_doc_5_2').value);

            formData.set('type', document.getElementById('expedition_doc_5_3').value);
            formData.set('id_public', document.getElementById('expedition_doc_5_4').value);

            formData.set('matricula', document.getElementById('expedition_doc_5_5').value);
            formData.set('destination', document.getElementById('expedition_doc_5_6').value);
            formData.set('catastral', document.getElementById('expedition_doc_5_7').value);
            formData.set('address', document.getElementById('expedition_doc_5_8').value);
            formData.set('strata', document.getElementById('expedition_doc_5_9').value);
            formData.set('treatment', document.getElementById('expedition_doc_5_26').value);

            formData.set('name', document.getElementById('expedition_doc_5_10').value);
            formData.set('nameid', document.getElementById('expedition_doc_5_11').value);

            formData.set('units', document.getElementById('expedition_doc_5_12').value);
            formData.set('comerce', document.getElementById('expedition_doc_5_13').value);
            formData.set('charge', document.getElementById('expedition_doc_5_14').value);
            formData.set('zgu', document.getElementById('expedition_doc_5_15').value);

            if (document.getElementById('expedition_doc_5_16')) formData.set('v11', document.getElementById('expedition_doc_5_16').value);
            if (document.getElementById('expedition_doc_5_17')) formData.set('v12', document.getElementById('expedition_doc_5_17').value);
            if (document.getElementById('expedition_doc_5_18')) formData.set('v13', document.getElementById('expedition_doc_5_18').value);
            if (document.getElementById('expedition_doc_5_19')) formData.set('v14', document.getElementById('expedition_doc_5_19').value);

            if (document.getElementById('expedition_doc_5_20')) formData.set('v21', document.getElementById('expedition_doc_5_20').value);
            if (document.getElementById('expedition_doc_5_21')) formData.set('v22', document.getElementById('expedition_doc_5_21').value);
            if (document.getElementById('expedition_doc_5_22')) formData.set('v23', document.getElementById('expedition_doc_5_22').value);
            if (document.getElementById('expedition_doc_5_23')) formData.set('v24', document.getElementById('expedition_doc_5_23').value);

            formData.set('totalw', document.getElementById('expedition_doc_5_24').value);
            formData.set('totaln', document.getElementById('expedition_doc_5_25').value);

            formData.set('city', document.getElementById('expedition_doc_5_26').value);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.gen_doc_5(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/expdoc5/" + "Deber Urbanistico " + currentItem.id_public + ".pdf");
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
        let pdf_gen_6 = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('type', document.getElementById('expedition_doc_6_1').value);
            formData.set('id_public', document.getElementById('expedition_doc_6_2').value);

            formData.set('destination', document.getElementById('expedition_doc_6_3').value);
            formData.set('catastral', document.getElementById('expedition_doc_6_4').value);
            formData.set('matricula', document.getElementById('expedition_doc_6_mat').value);
            formData.set('address', document.getElementById('expedition_doc_6_5').value);
            formData.set('strata', document.getElementById('expedition_doc_6_6').value);

            formData.set('name', document.getElementById('expedition_doc_6_7').value);
            formData.set('nameid', document.getElementById('expedition_doc_6_8').value);

            if (document.getElementById('expedition_doc_6_area')) formData.set('area', document.getElementById('expedition_doc_6_area').value);

            // AREAS
            let _areas = document.getElementsByName('expedition_doc_6_areas');
            let areas = [];
            for (var i = 0; i < _areas.length; i++) { areas.push(_areas[i].value) }
            // USES
            let _uses = document.getElementsByName('expedition_doc_6_uses');
            let uses = [];
            for (var i = 0; i < _uses.length; i++) { uses.push(_uses[i].value) }
            // CHARGES
            let _chages = document.getElementsByName('expedition_doc_6_charges');
            let charges = [];
            for (var i = 0; i < _chages.length; i++) { charges.push(_chages[i].value) }
            // SUM
            let _sum = document.getElementsByName('expedition_doc_6_sums');
            let sum = [];
            for (var i = 0; i < _sum.length; i++) { sum.push(_sum[i].value) }
            // DESC
            let _descs = document.getElementsByName('expedition_doc_6_descs');
            let descs = [];
            for (var i = 0; i < _descs.length; i++) { descs.push(_descs[i].value) }

            formData.set('areas', areas.join(';'));
            formData.set('sum', sum.join(';'));
            formData.set('uses', uses.join(';'));
            formData.set('descs', descs.join(';'));
            formData.set('charges', charges.join(';'));

            formData.set('total', document.getElementById('expedition_doc_6_13').value);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.gen_doc_6(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/expdoc6/" + "Impuestos Delineación Urbana " + currentItem.id_public + ".pdf");
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
        let pdf_gen_7 = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('type', document.getElementById('expedition_doc_7_1').value);
            formData.set('id_public', document.getElementById('expedition_doc_7_2').value);

            formData.set('destination', document.getElementById('expedition_doc_7_3').value);
            formData.set('catastral', document.getElementById('expedition_doc_7_4').value);
            formData.set('address', document.getElementById('expedition_doc_7_5').value);
            formData.set('strata', document.getElementById('expedition_doc_7_6').value);

            formData.set('name', document.getElementById('expedition_doc_7_7').value);
            formData.set('nameid', document.getElementById('expedition_doc_7_8').value);

            // AREAS
            let _areas = document.getElementsByName('expedition_doc_7_areas');
            let areas = [];
            for (var i = 0; i < _areas.length; i++) { areas.push(_areas[i].value) }
            // SUM
            let _sum = document.getElementsByName('expedition_doc_7_sums');
            let sum = [];
            for (var i = 0; i < _sum.length; i++) { sum.push(_sum[i].value) }
            // DESC
            let _descs = document.getElementsByName('expedition_doc_7_descs');
            let descs = [];
            for (var i = 0; i < _descs.length; i++) { descs.push(_descs[i].value) }
            // USES
            let _uses = document.getElementsByName('expedition_doc_7_uses');
            let uses = [];
            for (var i = 0; i < _uses.length; i++) { uses.push(_uses[i].value) }

            formData.set('areas', areas.join(';'));
            formData.set('sum', sum.join(';'));
            formData.set('descs', descs.join(';'));
            formData.set('uses', uses.join(';'));

            formData.set('fix', document.getElementById('expedition_doc_7_12').value);
            formData.set('subtotal', document.getElementById('expedition_doc_7_9').value);
            formData.set('subtotal_2', document.getElementById('expedition_doc_7_13').value);
            formData.set('iva', document.getElementById('expedition_doc_7_10').value);
            formData.set('total', document.getElementById('expedition_doc_7_11').value);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.gen_doc_7(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/expdoc7/" + "Liquidación Expensas " + currentItem.id_public + ".pdf");
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

        let pdf_gen_final_not = () => {
            formData = new FormData();
            let date_doc = document.getElementById("exodfb_date_doc").value;
            formData.set('date_doc', date_doc);
            let cub = document.getElementById("exodfb_cub3_exp").value;
            formData.set('cub', cub);
            let city = document.getElementById("exodfb_city").value;
            formData.set('city', city);
            let res_id = document.getElementById("exodfb_res_public").value;
            formData.set('res_id', res_id);
            let res_date = document.getElementById("exodfb_date_res").value;
            formData.set('res_date', res_date);
            let name = document.getElementById("exodfb_name").value;
            formData.set('name', name);
            let address = document.getElementById("exodfb_address").value;
            formData.set('address', address);
            let email = document.getElementById("exodfb_email").value;
            formData.set('email', email);

            formData.set('id_public', currentItem.id_public);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.gen_doc_final_not(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/expdocfinalnot/" + "Citacio para Notificacion Resolucsion " + currentItem.id_public + ".pdf");
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
        let save_exp_doc_final_not = (e) => {
            e.preventDefault();
            formData = new FormData();
            let cub3 = document.getElementById("exodfb_cub3_exp").value;
            formData.set('cub3', cub3);
            formData.set('prev_cub3', currentRecord.cub3);

            let cub3_json = getJSONFull(currentRecord.cub3_json);

            cub3_json.date_doc = document.getElementById("exodfb_date_doc").value;
            cub3_json.city = document.getElementById("exodfb_city").value;
            cub3_json.name = document.getElementById("exodfb_name").value;
            cub3_json.address = document.getElementById("exodfb_address").value;
            cub3_json.email = document.getElementById("exodfb_email").value;

            formData.set('cub3_json', JSON.stringify(cub3_json));
            manage_exp();
        }
        let save_eje = () => {
            formData = new FormData();
            let reso = _GET_EXPEDITION_JSON('reso');

            reso.vig = reso.vig || {};
            reso.vig.date = document.getElementById('expedition_eje_date').value;
            reso.vig.p1 = document.getElementById('expedition_eje_p1').value;
            reso.vig.vp = document.getElementById('expedition_eje_vig').value;
            reso.vig.n = document.getElementById('expedition_eje_vign').value;



            let values = []
            let values_html = document.getElementsByName('eje_pdf_arts_cb');
            for (let i = 0; i < values_html.length; i++) {
                const html = values_html[i];
                values.push(html.checked ? 1 : 0);
            }
            reso.vig.arts_cb = values.join(',');

            formData.set('reso', JSON.stringify(reso));
            manage_exp();
        }
        let pd_eje = () => {
            formData = new FormData();
            var reso = _GET_EXPEDITION_JSON('reso');

            let rew_name = String(window.user.role_short + ' ' + window.user.name_full).toUpperCase();
            formData.set('r_simple_name', rew_name);
            formData.set('r_simple', document.getElementById("eje_pdf_reso_1").checked);
            formData.set('r_signs', document.getElementById("eje_pdf_rew_signs").checked);
            formData.set('r_pagesi', document.getElementById("eje_pdf_rew_pagesi").checked);
            formData.set('r_pagesn', document.getElementById("eje_pdf_rew_pagesn").checked);
            formData.set('r_pagesx', document.getElementById("eje_pdf_rew_pagesx").checked);
            formData.set('r_sign_align', document.getElementById('eje_pdf_reso_1').value);
            formData.set('logo', document.getElementById('eje_pdf_reso_logo').value);

            formData.set('m_top', document.getElementById("eje_maring_top").value ? document.getElementById("eje_maring_top").value : 2.5);
            formData.set('m_bot', document.getElementById("eje_maring_bot").value ? document.getElementById("eje_maring_bot").value : 2.5);
            formData.set('m_left', document.getElementById('eje_maring_left').value ? document.getElementById("eje_maring_left").value : 1.7);
            formData.set('m_right', document.getElementById('eje_maring_right').value ? document.getElementById("eje_maring_right").value : 1.7);

            formData.set('type_not', document.getElementById("expedition_eje_type").value);
            formData.set('tipo', document.getElementById("expedition_eje_type").value);
            formData.set('date', document.getElementById('expedition_eje_date').value);
            formData.set('p1', document.getElementById('expedition_eje_p1').value);
            formData.set('vp', document.getElementById('expedition_eje_vig').value);
            formData.set('dante', document.getElementById('expedition_eje_vign').value);
            formData.set('reso_id', document.getElementById('expedition_eje_id_res').value);
            formData.set('id_public', document.getElementById('expedition_eje_id_public').value);
            formData.set('reso_pot', document.getElementById('expedition_eje_pot').value);
            formData.set('reso_state', document.getElementById('expedition_eje_state').value);

            formData.set('reso_date', reso.date);
            formData.set('lic_date', _GET_CLOCK_STATE(3, false).date_start || false);

            let vigs = {
                '0': 'CERO (0) MESES',
                '12': 'DOCE (12) MESES',
                '24': 'VEINTICUATRO (24) MESES',
                '36': 'TREINTA Y SEIS (36) MESES',
                '48': 'CUARENTA Y OCHO (48) MESES',
            };
            formData.set('vn', vigs[document.getElementById('expedition_eje_vign').value || '12']);

            if (document.getElementById('eje_pdf_art_4_1_dv')) formData.set('art_4_1', document.getElementById('eje_pdf_art_4_1_dv').value);
            if (document.getElementById('eje_pdf_art_4_2_dv')) formData.set('art_4_2', document.getElementById('eje_pdf_art_4_2_dv').value);

            let values = []
            let values_html = document.getElementsByName('eje_pdf_arts_cb');
            for (let i = 0; i < values_html.length; i++) {
                const html = values_html[i];
                values.push(html.checked ? 1 : 0);
            }
            formData.set('arts_cb', values.join(','));


            formData.set('curaduria', infoCud.job);
            formData.set('ciudad', infoCud.city);
            formData.set('record_version', 1);
            formData.set('id', currentItem.id);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.gen_doc_eje(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/expdoceje/" + "Ejecutoria " + currentItem.id_public + ".pdf");
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
                            text: "El concecutivo CUB de este formulario ya existe, debe de elegir un concecutivo nuevo",
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
                <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="nav_expedition_20">
                    <label className="app-p lead fw-normal">PAGOS</label>
                </legend>


                <MDBBtn tag='a' outline color='info' className={'my-2 px-3 text-uppercase bg-light btn-block'} id="nav_expedition_21"
                    onClick={() => this.setState({ showCollapse_expedition_21: !this.state.showCollapse_expedition_21 })}>
                    <label className="app-p lead fw-normal text-info">Acto de tramite de licencia</label>
                </MDBBtn>
                <MDBCollapse show={this.state.showCollapse_expedition_21}>
                    <fieldset className="p-3">
                        <form id="form_expedition_1" onSubmit={pdf_gen_1}>
                            {_COMPONENT_DOC_1()}
                            <div className="row text-center">
                                <div className="col">
                                    <button className="btn btn-danger my-3"><i class="far fa-file-pdf"></i> GENERAR PDF </button>
                                </div>
                            </div>
                        </form>
                    </fieldset>
                </MDBCollapse>

                {_GLOBAL_ID === 'cp1' ?
                    <>
                        <MDBBtn tag='a' outline color='info' className={'my-2 px-3 text-uppercase bg-light btn-block'} id="nav_expedition_27"
                            onClick={() => this.setState({ showCollapse_expedition_27: !this.state.showCollapse_expedition_27 })}>
                            <label className="app-p lead fw-normal text-info">Liquidación de Expensas</label>
                        </MDBBtn>
                        <MDBCollapse show={this.state.showCollapse_expedition_27}>
                            <fieldset className="p-3">
                                <form id="form_expedition_4" onSubmit={pdf_gen_7}>
                                    {_COMPONENT_DOC_7()}
                                    <div className="row text-center">
                                        <div className="col">
                                            <button className="btn btn-danger my-3"><i class="far fa-file-pdf"></i> GENERAR PDF </button>
                                        </div>
                                    </div>
                                </form>
                            </fieldset>
                        </MDBCollapse>
                    </>
                    : ''}


                {!conOA() && _GLOBAL_ID === 'cb1' || _GLOBAL_ID === 'fl2' ? <>
                    <MDBBtn tag='a' outline color='info' className={'my-2 px-3 text-uppercase bg-light btn-block'} id="nav_expedition_22"
                        onClick={() => this.setState({ showCollapse_expedition_22: !this.state.showCollapse_expedition_22 })}>
                        <label className="app-p lead fw-normal text-info">Liquidacion de Expensas</label>
                    </MDBBtn>
                    <MDBCollapse show={this.state.showCollapse_expedition_22}>
                        <fieldset className="p-3">
                            <form id="form_expedition_2" onSubmit={pdf_gen_2}>
                                {_COMPONENT_DOC_2()}
                                <div className="row text-center">
                                    <div className="col">
                                        <button className="btn btn-danger my-3"><i class="far fa-file-pdf"></i> GENERAR PDF </button>
                                    </div>
                                </div>
                            </form>
                        </fieldset>
                    </MDBCollapse>
                </> : null}

                {!conOA() && _GLOBAL_ID === 'cb1' ? <>
                    <MDBBtn tag='a' outline color='info' className={'my-2 px-3 text-uppercase bg-light btn-block'} id="nav_expedition_23"
                        onClick={() => this.setState({ showCollapse_expedition_23: !this.state.showCollapse_expedition_23 })}>
                        <label className="app-p lead fw-normal text-info">Impuestos Municipales</label>
                    </MDBBtn>
                    <MDBCollapse show={this.state.showCollapse_expedition_23}>

                        <fieldset className="p-3">
                            <form id="form_expedition_3" onSubmit={pdf_gen_3}>
                                {_COMPONENT_DOC_3()}
                                <div className="row text-center">
                                    <div className="col">
                                        <button className="btn btn-danger my-3"><i class="far fa-file-pdf"></i> GENERAR PDF </button>
                                    </div>
                                </div>
                            </form>
                        </fieldset>
                    </MDBCollapse>
                </> : null}


                <MDBBtn tag='a' outline color='info' className={'my-2 px-3 text-uppercase bg-light btn-block'} id="nav_expedition_24"
                    onClick={() => this.setState({ showCollapse_expedition_24: !this.state.showCollapse_expedition_24 })}>
                    <label className="app-p lead fw-normal text-info">Estampilla PRO-UIS</label>
                </MDBBtn>
                <MDBCollapse show={this.state.showCollapse_expedition_24}>
                    <fieldset className="p-3">
                        <form id="form_expedition_4" onSubmit={pdf_gen_4}>
                            {_COMPONENT_DOC_4()}
                            <div className="row text-center">
                                <div className="col">
                                    <button className="btn btn-danger my-3"><i class="far fa-file-pdf"></i> GENERAR PDF </button>
                                </div>
                            </div>
                        </form>
                    </fieldset>
                </MDBCollapse>

                {_GET_CHILD_2().item_267 > 2 && _GLOBAL_ID === 'cb1'
                    ? <>
                        <MDBBtn tag='a' outline color='info' className={'my-2 px-3 text-uppercase bg-light btn-block'} id="nav_expedition_25"
                            onClick={() => this.setState({ showCollapse_expedition_25: !this.state.showCollapse_expedition_25 })}>
                            <label className="app-p lead fw-normal text-info">Deberes Urbanisticos - Estrato: {_GET_CHILD_2().item_267 ?? <label className="fw-bold text-danger">SIN DEFINIR</label>}</label>
                        </MDBBtn>
                        <MDBCollapse show={this.state.showCollapse_expedition_25}>
                            <fieldset className="p-3">
                                <form id="form_expedition_4" onSubmit={pdf_gen_5}>
                                    {_COMPONENT_DOC_5()}
                                    <div className="row text-center">
                                        <div className="col">
                                            <button className="btn btn-danger my-3"><i class="far fa-file-pdf"></i> GENERAR PDF </button>
                                        </div>
                                    </div>
                                </form>
                            </fieldset>
                        </MDBCollapse>



                    </>
                    : ""}

                {_GLOBAL_ID === 'cp1' || _GLOBAL_ID === 'fl2' ?
                    <>
                        <MDBBtn tag='a' outline color='info' className={'my-2 px-3 text-uppercase bg-light btn-block'} id="nav_expedition_26"
                            onClick={() => this.setState({ showCollapse_expedition_26: !this.state.showCollapse_expedition_26 })}>
                            <label className="app-p lead fw-normal text-info">Impuesto Delineación Urbana</label>
                        </MDBBtn>
                        <MDBCollapse show={this.state.showCollapse_expedition_26}>
                            <fieldset className="p-3">
                                <form id="form_expedition_4" onSubmit={pdf_gen_6}>
                                    {_COMPONENT_DOC_6()}
                                    <div className="row text-center">
                                        <div className="col">
                                            <button className="btn btn-danger my-3"><i class="far fa-file-pdf"></i> GENERAR PDF </button>
                                        </div>
                                    </div>
                                </form>
                            </fieldset>
                        </MDBCollapse>
                    </>
                    : ''}


                <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="nav_expedition_26">
                    <label className="app-p lead fw-normal">DOCUMENTOS</label>
                </legend>

                <Collapsible className='bg-light border border-info text-center my-1' openedClassName='my-1 bg-light border border-info text-center' trigger={<><label className="fw-normal text-info text-center">Acto Administrativo / RESOLUCION</label></>}>
                    <EXP_RES
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        currentRecord={currentRecord}
                        currentVersionR={currentVersionR}
                        requestUpdate={this.props.requestUpdate}
                        requestUpdateRecord={this.props.requestUpdateRecord}
                        recordArc={recordArc}
                    />
                </Collapsible>


                <Collapsible className='bg-light border border-info text-center my-1' openedClassName='my-1 bg-light border border-info text-center' trigger={<><label className="fw-normal text-info text-center">CITACIÓN PARA NOTIFICACIÓN</label></>}>
                    <form id="form_expedition_4" onSubmit={save_exp_doc_final_not}>
                        {_COMPOENEN_DOC_FINAL_NOT()}
                        <div className="row text-center">
                            <div className="col">
                                <button className="btn btn-success my-3"><i class="far fa-share-square"></i> GUARDAR CAMBIOS </button>
                            </div>
                            <div className="col">
                                <MDBBtn className="btn btn-danger my-3" onClick={() => pdf_gen_final_not()}><i class="far fa-file-pdf"></i> GENERAR PDF </MDBBtn>
                            </div>
                        </div>
                    </form>
                </Collapsible>

                <Collapsible className='bg-light border border-info text-center my-1' openedClassName='my-1 bg-light border border-info text-center' trigger={<><label className="fw-normal text-info text-center">EJECUTORIA</label></>}>
                    {_COMPONENT_EJE()}
                </Collapsible>


            </div >
        );
    }
}

export default EXP_DOCS;