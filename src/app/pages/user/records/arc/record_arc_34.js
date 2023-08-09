import React, { Component } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';

import { zones } from '../../../../components/jsons/vars'
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import { dateParser, getJSONFull, getJSON_Simple } from '../../../../components/customClasses/typeParse';
import JSONObjectParser from '../../../../components/jsons/jsonReplacer';
import parkingData from '../../../../components/jsons/parkingData.json'
import { SUBMIT_ARC_AMENAZA, SUBMIT_ARC_AREA_ACTIVIDAD, SUBMIT_ARC_TRATAMIENTO_URBANISTICO, SUBMIT_ARC_ZONS_RESTRICCION } from '../../../../components/vars.global';

const MySwal = withReactContent(Swal);
class RECORD_ARC_34 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            new_gen: false,
            new_k: false,
            edit_k: false,
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.edit_k !== prevState.edit_k && this.state.edit_k != false) {
            var _ITEM = this.state.edit_k;
            document.getElementById("r_a_34_k_1_edit").value = _ITEM.name;
            document.getElementById("r_a_34_k_2_edit").value = _ITEM.index;
            document.getElementById("r_a_34_k_4_edit").value = _ITEM.proyect;
            document.getElementById("r_a_34_k_5_edit").value = _ITEM.type
            document.getElementById("r_a_34_k_6_edit").value = _ITEM.exception
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;


        // DATA GETERS

        let _GET_CHILD_34_GEN = () => {
            var _CHILD = currentRecord.record_arc_34_gens;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_34_K = () => {
            var _CHILD = currentRecord.record_arc_34_ks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _FIND_CHILD_34_K = (index) => {
            let _LIST = _GET_CHILD_34_K();
            for (let i = 0; i < _LIST.length; i++) {
                const item = _LIST[i];
                if (item.name == index) return item;
            }
            return false;
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
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (_VALUE === '0' || _VALUE === 'NO CUMPLE') {
                return 'form-select text-danger form-select-sm';
            }
            if (_VALUE === '1' || _VALUE === 'CUMPLE') {
                return 'form-select text-success form-select-sm';
            }
            if (_VALUE === '2' || _VALUE === 'NO APLICA') {
                return 'form-select text-warning form-select-sm';
            }
            return 'form-select form-select-sm';
        }
        let _GET_EVALUATION_K = (_ITEM, _AREA) => {
            if (!_ITEM.index || !_AREA || !_ITEM.proyect) return <label className="text-danger fw-bold">VALOR INVALIDO</label>;
            var _DIFF = (_ITEM.proyect - _PARSER_NORM(_ITEM, _AREA)).toFixed(2);
            if (_DIFF == 0) return "P = N";
            if (_DIFF < 0) return "P <= N";
            if (_DIFF > 0) return "P >= N";
        }
        let _PARSER_NORM = (_ITEM, _AREA) => {
            if (!_ITEM.index || !_AREA) return <label className="text-danger fw-bold">VALOR INVALIDO</label>;
            if (_ITEM.name == "Indice de Ocupacion" || _ITEM.name == "Indice de Construccion") return _ITEM.index * _AREA;
            return _ITEM.index / _ITEM.proyect;
        }
        let _PARSER_DIFF = (_ITEM, _AREA) => {
            if (!_ITEM.index || !_AREA || !_ITEM.proyect) return <label className="text-danger fw-bold">VALOR INVALIDO</label>;
            return (_ITEM.proyect - _PARSER_NORM(_ITEM, _AREA)).toFixed(2);
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_arc_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let LOAD_STEP_JUR = (_id_public) => {
            var _CHILD = currentItem.record_law_steps ? currentItem.record_law_steps : [];
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == 1 && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type]
            if (!value) return [];
            value = value.split(';');
            return value
        }
        let _GET_STEP_TYPE_JUR = (_id_public, _type) => {
            var STEP = LOAD_STEP_JUR(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ?? []
            if (!value.length) return [];
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
        let _SET_SESION_P = (session) => {
            let sl = document.getElementById('sesion_l').value;
            let sc = document.getElementById('sesion_c').value;
            let sp = document.getElementById('sesion_p');

            let sla = document.getElementById('sesion_l_a');
            let sca = document.getElementById('sesion_c_a');
            let spa = document.getElementById('sesion_p_a');

            sp.value = (1 - sl - sc).toFixed(2);
            sla.value = (sl * session).toFixed(2);
            sca.value = (sc * session).toFixed(2);
            spa.value = ((1 - sl - sc) * session).toFixed(2);

        }
        let _GET_SESION_P = () => {
            let EQUIP = _GET_STEP_TYPE('equip', 'value');


            let sl = document.getElementById('sesion_l') ? document.getElementById('sesion_l').value : (EQUIP[0] ?? 0);
            let sc = document.getElementById('sesion_c') ? document.getElementById('sesion_c').value : (EQUIP[1] ?? 0);
            let sp = (1 - sl - sc);

            return [Number(sl).toFixed(2), Number(sc).toFixed(2), Number(sp).toFixed(2)];
        }
        let _ADD_AREAS = (_array) => {
            if (!_array) return 0;
            var areas = _array.split(",");
            var sum = 0;
            for (var i = 0; i < areas.length; i++) {
                sum += Number(areas[i])
            }
            return sum.toFixed(2);
        }
        let _GET_CHILD_33_AREAS = () => {
            var _CHILD = currentRecord.record_arc_33_areas;
            var _AREAS = [];
            if (_CHILD) {
                for (var i = 0; i < _CHILD.length; i++) {
                    if (_CHILD[i].type == "area") {
                        _AREAS.push(_CHILD[i])
                    }
                }
            }
            return _AREAS;
        }
        let _GET_AREA_BY_FLOOR = (_floor) => {
            let areas = _GET_CHILD_33_AREAS();
            for (let i = 0; i < areas.length; i++) {
                const area = areas[i];
                let con_floor = area.floor ? area.floor : '';
                if ((con_floor).toLowerCase() == (_floor).toLowerCase()) return area;
            }
            return false;
        }
        let _GET_TOTAL_AREA = (_build, _historic) => {
            if (!_build) return 0;
            var build = _build.split(",");
            var area_1 = 0;
            var area_5 = 0
            var historic = _GET_HISTORIC(_historic)
            var ajustes = _GET_AJUSTES(_historic)
            if (build[0] > 0) area_1 += Number(build[0]);
            if (build[1] > 0) area_1 += Number(build[1]);
            if (build[10] > 0) area_1 += Number(build[10]);
            //if (build[6] > 0) area_5 = Number(build[6]);
            if (build[7] > 0) area_5 += Number(build[7]);
            var _TOTAL_AREA = Number(historic) + Number(ajustes) + area_1 - area_5;
            return (_TOTAL_AREA).toFixed(2);
        }

        let _GET_HISTORIC = (_historic) => {
            let STEP = LOAD_STEP('a_config');
            let json = STEP ? STEP.json ?? {} : {};
            json = getJSON_Simple(json)
            let tagsH = json.tagh ? json.tagh.split(';') : [];
            var historic = _historic ? _historic.split(';') : [];
            let reduced = historic.filter((_h, i) => {
                if (!tagsH[i]) return false
                let tag = tagsH[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                return tag.includes('historic');
            })
            let sum = 0;
            reduced.map((r) => sum += Number(r))
            return sum;
        }

        let _GET_AJUSTES = (_historic) => {
            let STEP = LOAD_STEP('a_config');
            let json = STEP ? STEP.json ?? {} : {};
            json = getJSON_Simple(json)
            let tagsH = json.tagh ? json.tagh.split(';') : [];
            var historic = _historic ? _historic.split(';') : [];
            let reduced = historic.filter((_h, i) => {
                if (!tagsH[i]) return false
                let tag = tagsH[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                return tag.includes('ajuste');
            })
            let sum = 0;
            reduced.map((r) => sum += Number(r))
            return sum;
        }

        let _GET_NET_INDEX = (_build, _destroy, _historic) => {
            if (!_build) return 0;
            var build = _build.split(",");
            var destroy = Number(_ADD_AREAS(_destroy));
            var areaToBuild = 0;
            var area_5 = 0
            var historic = _GET_HISTORIC(_historic)
            if (build[0] > 0) areaToBuild = Number(build[0]);
            if (build[10] > 0) areaToBuild = Number(build[10]);
            if (build[1] > 0) areaToBuild = Number(build[1]);
            //if (build[6] > 0) area_5 = Number(build[6]);
            if (build[7] > 0) area_5 += Number(build[7]);
            var _NET_IDEX = Number(historic) + areaToBuild - destroy - area_5;
            return (_NET_IDEX).toFixed(2);
        }
        function array_sort(a, b) {
            let A = a.floor ? a.floor.split(' ') : '';
            let B = b.floor ? b.floor.split(' ') : '';
            let strPartA = A[0] ? A[0].toLowerCase() : '';
            let strPartB = B[0] ? B[0].toLowerCase() : '';
            let nunPartA = Number(A[1]) ?? Infinity;
            let nunPartB = Number(B[1]) ?? Infinity;


            if (strPartA < strPartB) { return -1; }
            if (strPartA > strPartB) { return 1; }

            if (strPartA[0] && strPartA[0].toLowerCase() == 's') {
                if (nunPartA < nunPartB) { return -1; }
                if (nunPartA > nunPartB) { return 1; }
            } else {
                if (nunPartA < nunPartB) { return 1; }
                if (nunPartA > nunPartB) { return -1; }
            }

            return 0;
        }
        let _GET_SUM_LEVEL_BY_FLOOR = (_floor) => {
            let DA_RULE = '1';
            let floor_c = _floor ? String(_floor) : ' ';
            let con = floor_c[0].toLowerCase() == 's';

            let areas = _GET_CHILD_33_AREAS();
            areas.sort((a, b) => array_sort(a, b));

            let new_areas = areas.filter(item => {
                if (con) {
                    let floor = item.floor ? item.floor : ' ';
                    let con2 = floor[0].toLowerCase() == 's';
                    if (con2) return true;
                    return false
                } else {
                    let floor = item.floor ? item.floor : ' ';
                    let con1 = (floor).toLowerCase().includes('cubierta');
                    let con3 = (floor).toLowerCase().includes('piso');
                    let con4 = (floor).replace(/^\D+/g, '');
                    let con2 = floor[0].toLowerCase() == 's';
                    if (con2 || (con3 && con4 == 1)) return false;
                    return true
                }
            });
            let floor_index = -1;
            let sum = 0;
            if (con) new_areas.reverse();

            new_areas.map((item, i) => { if (_floor == item.floor) floor_index = i; })
            if (floor_index != -1) {
                if (DA_RULE == '1') {
                    let inferior_i = -1;
                    new_areas.map((item, i) => {
                        if (_floor == item.floor) {
                            sum = item.level ? Number(item.level.split('&')[1]) : 0;
                            inferior_i = i + 1;
                        }
                    })
                    if (inferior_i > -1) {
                        let prev = new_areas[inferior_i] ? Number(new_areas[inferior_i].level.split('&')[1]) : 0;
                        sum = sum - prev;
                    }
                } else {
                    new_areas.map((item, i) => {
                        if (floor_index < i) {
                            let level = item.level ? item.level.split('&')[1] : 0;
                            sum += Number(level);
                        }
                    });
                }

            }

            return sum.toFixed(2);
        }
        let _SAVING_STATE = (state) => {
            if (!state) return '';
            if (state == 1) return <label className='text-warning fw-bold'><i class="fas fa-save"></i></label>;
            if (state == 2) return <label className='text-success fw-bold'><i class="fas fa-save"></i></label>;
            if (state == 3) return <label className='text-danger fw-bold'><i class="fas fa-save"></i></label>;
        }

        const value34 = _GET_STEP_TYPE('s34', 'value');
        const check34 = _GET_STEP_TYPE('s34', 'check');
        const json34 = _GET_STEP_TYPE_JSON('s34');

        // COMPONENTS JSX
        let _COMPONENT_1 = () => {
            return <>
                <div className="row">
                    <input type="hidden" id="r_a_34_" />
                    <div className="col-3 p-1">
                        <label>Norma Urbana CUB</label>
                        <div class="input-group">
                            <input type="text" class="form-control me-1" id="r_a_34_gen_1" />
                        </div>
                    </div>
                    <div className="col-4 p-1">
                        <label>Descripción</label>
                        <div class="input-group">
                            <input type="text" class="form-control me-1" id="r_a_34_gen_2" />
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <label>Fecha</label>
                        <div class="input-group">
                            <input type="date" class="form-control me-1" max="2100-01-01" id="r_a_34_gen_3" />
                        </div>
                    </div>
                    <div className="col-2 p-1">
                        <label>Folios</label>
                        <div class="input-group">
                            <input type="number" min="0" step="1" class="form-control me-1" id="r_a_34_gen_4" />
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_1_LIST = () => {
            let _LIST = _GET_CHILD_34_GEN();
            const columns = [
                {
                    name: <label>Norma Urbana CUB</label>,
                    selector: 'norm',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.norm}</label>
                },
                {
                    name: <label>Descripción</label>,
                    selector: 'desc',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.desc}</label>
                },
                {
                    name: <label>Fecha</label>,
                    selector: 'date',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{dateParser(row.date)}</label>
                },
                {
                    name: <label>Folios</label>,
                    selector: 'pages',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.pages}</label>
                },
                {
                    name: <label>ESTADO</label>,
                    button: true,
                    center: true,
                    cell: row =>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setActive_34_gen(row)} />
                        </div>
                },
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    center: true,
                    minWidth: '100px',
                    cell: row => <>
                        <MDBBtn className="btn btn-danger btn-sm" onClick={() => delete_34_gen(row.id)}><i class="far fa-trash-alt fa-2x"></i></MDBBtn>
                    </>,
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }
        let _COMPONENT_A = () => {
            let _CHILD_2 = _SET_CHILD_2();
            let loc = currentItem.expedition ? currentItem.expedition : null;
            if (loc) loc = loc.tmp ? loc.tmp : null;
            if (loc) loc = getJSONFull(loc);
            if (loc) loc = loc.zone;

            return <>
                <div className="row">
                    <div className="col-3 p-1 text-start">
                        <br /> <br /> <br />
                        <h3 className="mt-3">a. Generalidades</h3>
                    </div>

                    <div className="col-3 p-1">
                        <label>Ficha Normativa</label>
                        <div class="input-group">
                            <input type="number" min='1' max='14' class="form-control me-1" name="r_a_34_a-1"
                                defaultValue={json34.ficha ?? 1} onBlur={() => manage_ra_34('a41')} />
                        </div>
                        <label>Sector</label>
                        <div class="input-group">
                            <input type="text" class="form-control me-1" name="r_a_34_a"
                                defaultValue={json34.sector} onBlur={() => manage_ra_34('a41')} />
                        </div>
                        <label>Subsector</label>
                        <div class="input-group">
                            <input type="text" class="form-control me-1" name="r_a_34_a"
                                defaultValue={json34.subsector} onBlur={() => manage_ra_34('a41')} />
                        </div>
                    </div>

                    <div className="col-3 p-1">
                        <label>Estrato</label>
                        <div class="input-group">
                            <input type="number" class="form-control me-1" min="1" step="1" name="r_a_34_a"
                                defaultValue={_CHILD_2.item_267} disabled />
                        </div>
                        <label>ZGU N°</label>
                        <div class="input-group">
                            <input type="text" class="form-control me-1" name="r_a_34_a"
                                defaultValue={json34.zgu} onBlur={() => manage_ra_34('a41')} />
                        </div>
                        <label>$m<sup>2</sup> ZGU</label>
                        <div class="input-group">
                            <input type="number" step="0.01" class="form-control me-1" name="r_a_34_a"
                                defaultValue={json34.zugm} onBlur={() => manage_ra_34('a41')} />
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <label>Área predio (m<sup>2</sup>)</label>
                        <div class="input-group">
                            <input type="number" min="0" step="0.01" class="form-control me-1" name="r_a_34_a"
                                defaultValue={json34.m2} onBlur={() => manage_ra_34('a41')} />
                        </div>
                        <label>Frente del predio (m)</label>
                        <div class="input-group">
                            <input type="number" min="0" step="0.01" class="form-control me-1" name="r_a_34_a"
                                defaultValue={json34.m1} onBlur={() => manage_ra_34('a41')} />
                        </div>
                        <label>Localización</label>

                        <div class="input-group">
                            <select
                                className="form-select" defaultValue={loc || json34.local} name="r_a_34_a" onChange={() => manage_ra_34('a41')}>
                                {zones}
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_BJ = () => {
            let uu = [];
            for (const key in parkingData) {
                let text = "";
                text += key;
                for (const key2 in parkingData[key]) {
                    let text2 = text + ': ' + key2 + ' - ' + parkingData[key][key2].u_units.join(', ');
                    uu.push(text2)
                    text2 = "";
                }
                text = "";
            };

            const _CHECK_ARRAY_JUR = _GET_STEP_TYPE_JUR('sc1', 'check');
            const g_dv = `${_CHECK_ARRAY_JUR[14]} ${_CHECK_ARRAY_JUR[15]} ${_CHECK_ARRAY_JUR[16]}`;

            return <>
                <div className="row">
                    <div className="col-3 mt-2 text-start">
                        <span class="align-middle"><h3>b. Clase de Suelo</h3></span>
                    </div>

                    <div className="col-6 p-1">
                        <div class="input-group">
                            <select className="form-select" name="s_34_values" defaultValue={value34[2]} onChange={() => manage_ra_34('a41')}>
                                <option>Urbano</option>
                                <option>Rural</option>
                                <option>Expansión</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-3 p-1">
                        <input type='hidden' name='s_34_checks' defaultValue={check34[0]} />
                        {/**
                     *  <select hidden
                            className={_GET_SELECT_COLOR_VALUE(check34[0])} defaultValue={check34[0]} name="s_34_checks"
                            onChange={() => manage_ra_34('a41')}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                     * 
                     */}

                    </div>
                </div>
                <div className="row">
                    <input type='hidden' name='s_34_values' />
                    <input type='hidden' name='s_34_checks' />

                    {/**
                     * 
                     *  <div className="col-3 mt-2 text-start">
                        <span class="align-middle"><h3>c. Tratamiento 1</h3></span>
                    </div>

                    <div className="col-6 p-1">
                        <div class="input-group">
                            <select className="form-select" name="s_34_values" defaultValue={value34[1]} onChange={() => manage_ra_34()}>
                                <option>Desarrollo</option>
                                <option>Consolidación</option>
                                <option>Renovación</option>
                                <option>Mejoramiento Integral</option>
                                <option>Conservación</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <select
                            className={_GET_SELECT_COLOR_VALUE(check34[1])} defaultValue={check34[1]} name="s_34_checks" onChange={() => manage_ra_34()}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                    </div>
                     * 
                     */}

                </div>
                <div className="row">
                    <div className="col-3 mt-2 text-start">
                        <span class="align-middle"><h3>c. Tratamiento</h3></span>
                    </div>

                    <div className="col-6 p-1">
                        <div class="input-group">
                            <select className="form-select" name="s_34_values" defaultValue={value34[2]} onChange={() => manage_ra_34('a41')}>
                                {SUBMIT_ARC_TRATAMIENTO_URBANISTICO.map(op => <option>{op}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <input type='hidden' name='s_34_checks' defaultValue={check34[2]} />
                        {/**
                     *  <select
                            className={_GET_SELECT_COLOR_VALUE(check34[2])} defaultValue={check34[2]} name="s_34_checks" onChange={() => manage_ra_34('a41')}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                     * 
                     */}

                    </div>
                </div>
                <div className="row">
                    <div className="col-3 mt-2 text-start">
                        <span class="align-middle"><h3>d. Unidad de Uso</h3></span>
                    </div>

                    <div className="col-6 p-1">
                        <div class="input-group">
                            <input className="form-select" list="u_uses" name="s_34_values" defaultValue={value34[3]} onBlur={() => manage_ra_34('a41')} />
                            <datalist id="u_uses">
                                {uu.map(u => <option>{u}</option>)}
                            </datalist>
                            {/**
                            *  <input type="text" class="form-control me-1" name="s_34_values"
                                defaultValue={value34[3]} onBlur={() => manage_ra_34('a41')} />
                            */}
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <input type='hidden' name='s_34_checks' defaultValue={check34[3]} />
                        {/**
                     * <select
                            className={_GET_SELECT_COLOR_VALUE(check34[3])} defaultValue={check34[3]} name="s_34_checks" onChange={() => manage_ra_34('a41')}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                     */}

                    </div>
                </div>
                <div className="row">
                    <div className="col-3 mt-2 text-start">
                        <span class="align-middle"><h3>e. Área de actividad </h3></span>
                    </div>

                    <div className="col-6 p-1">
                        <div class="input-group">
                            <select className="form-select" name="s_34_values" defaultValue={value34[4]} onChange={() => manage_ra_34('a41')}>
                                {SUBMIT_ARC_AREA_ACTIVIDAD.map(op => <option>{op}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <input type='hidden' name='s_34_checks' defaultValue={check34[4]} />
                        {/**
                     * <select
                            className={_GET_SELECT_COLOR_VALUE(check34[4])} defaultValue={check34[4]} name="s_34_checks" onChange={() => manage_ra_34('a41')}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                     */}
                    </div>
                </div>
                <div className="row">
                    <div className="col-3 mt-2 text-start">
                        <span class="align-middle"><h3> Escala Urbana</h3></span>
                    </div>

                    <div className="col-6 p-1">
                        <div class="input-group">
                            <input className="form-select" list="escala" name="s_34_values" defaultValue={value34[5]} onBlur={() => manage_ra_34('a41')} />
                            <datalist id="escala">
                                <option>Local (A)</option>
                                <option>Local</option>
                                <option>Zonal</option>
                                <option>Metropolitana</option>
                            </datalist>
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <select
                            className={_GET_SELECT_COLOR_VALUE(check34[5])} defaultValue={check34[5]} name="s_34_checks" onChange={() => manage_ra_34('a41')}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-3 mt-2 text-start">
                        <span class="align-middle"><h3>f. Zona de restricción</h3></span>
                    </div>

                    <div className="col-6 p-1">
                        <div class="input-group">
                            <select className="form-select" name="s_34_values" defaultValue={value34[6]} onChange={() => manage_ra_34('a41')}>
                                {SUBMIT_ARC_ZONS_RESTRICCION.map(op => <option>{op}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <select
                            className={_GET_SELECT_COLOR_VALUE(check34[6])} defaultValue={check34[6]} name="s_34_checks" onChange={() => manage_ra_34('a41')}>
                            <option value="0" className="text-danger">CON RESTRICCIÓN</option>
                            <option value="1" className="text-success">SIN RESTRICCIÓN</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-3 mt-2 text-start">
                        <span class="align-middle"><h3>g. Utilidad Pública</h3></span>
                    </div>

                    <div className="col-6 p-1">
                        <div class="input-group">
                            <input type="text" class="form-control me-1" name="s_34_values" onBlur={() => manage_ra_34('a41')}
                                defaultValue={value34[7] || g_dv} />
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <select
                            className={_GET_SELECT_COLOR_VALUE(check34[7])} defaultValue={check34[7]} name="s_34_checks" onChange={() => manage_ra_34('a41')}>
                            <option value="0" className="text-danger">CON RESTRICCIÓN</option>
                            <option value="1" className="text-success">SIN RESTRICCIÓN</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-3 mt-2 text-start">
                        <span class="align-middle"><h3>h. Amenaza y Riesgo</h3></span>
                    </div>

                    <div className="col-6 p-1">
                        <div class="input-group">
                            <select className="form-select" name="s_34_values" defaultValue={value34[8]} onChange={() => manage_ra_34('a41')}>
                                {SUBMIT_ARC_AMENAZA.map(op => <option>{op}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <select
                            className={_GET_SELECT_COLOR_VALUE(check34[8])} defaultValue={check34[8]} name="s_34_checks" onChange={() => manage_ra_34('a41')}>
                            <option value="0" className="text-danger">CON RESTRICCIÓN</option>
                            <option value="1" className="text-success">SIN RESTRICCIÓN</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-3 mt-2 text-start">
                        <span class="align-middle"><h3>i. BIC</h3></span>
                    </div>

                    <div className="col-6 p-1">
                        <div class="input-group">
                            <select className="form-select" name="s_34_values" defaultValue={value34[9]} onChange={() => manage_ra_34('a41')}>
                                <option>No BIC</option>
                                <option>BIC</option>
                                <option>Zona de Influencia</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-3 p-1">
                        <select
                            className={_GET_SELECT_COLOR_VALUE(check34[9])} defaultValue={check34[9]} name="s_34_checks" onChange={() => manage_ra_34('a41')}>
                            <option value="0" className="text-danger">CON RESTRICCIÓN</option>
                            <option value="1" className="text-success">SIN RESTRICCIÓN</option>
                        </select>
                    </div>
                </div>
            </>
        }
        let _GET_MFHF = () => {
            let areas = _GET_CHILD_33_AREAS();
            let maxfloor = 0;
            let heighFloor = 0;
            let height = 0;

            let level_areas = [];
            let LEVEL_RULE = _GET_STEP_TYPE('a_config', 'check')[0]

            if (LEVEL_RULE == 0) areas.map(a => level_areas.push({ use: a.use, floor: a.floor, level: a.level, }))
            if (LEVEL_RULE == 1) areas.map(a => {
                level_areas.push({ use: a.use, level: _GET_SUM_LEVEL_BY_FLOOR(a.floor), floor: a.floor, level_2: a.level })
            })

            level_areas.map(area => {
                let floor = area.floor ?? '';
                let con_p = (floor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('piso');

                let level;
                if (LEVEL_RULE == 1) level = level;
                else level = area.level ? Number(area.level.split('&')[1]) : 0;

                let use = area.use ?? '';
                let con_v = (use).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('vivienda') || (use).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('residencia');
                let con_o = !(use).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('vivienda') && !(use).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('residencia');

                if (con_p) {
                    let currentFloor = Number(floor.replace(/^\D+/g, ''));
                    if (maxfloor < currentFloor) maxfloor = currentFloor;

                    if (con_v) {
                        let resto = Math.trunc(level / 3.6);
                        heighFloor += (resto + 1);
                    }
                    if (con_o) {
                        let resto = Math.trunc(level / 4.5);
                        heighFloor += (resto + 1);
                    }
                    height += Number(level);
                }
            })
            return [maxfloor, heighFloor, (height).toFixed(2)]
        }

        let _COMPONENT_INDEX_CALC = () => {
            let pvma = 0;
            let poma = 0;
            let pvmi = Infinity;
            let pomi = Infinity;

            let sevm = Infinity;
            let seom = Infinity;

            let sovm = Infinity;
            let soom = Infinity;

            let level_areas = [];
            let areas = _GET_CHILD_33_AREAS();
            let LEVEL_RULE = _GET_STEP_TYPE('a_config', 'check')[0]

            if (LEVEL_RULE == 0) areas.map(a => level_areas.push({ use: a.use, floor: a.floor, level: a.level }))
            if (LEVEL_RULE == 1) areas.map(a => {
                level_areas.push({ use: a.use, floor: a.floor, level: _GET_SUM_LEVEL_BY_FLOOR(a.floor), })
            })

            level_areas.map(area => {
                let level;
                if (LEVEL_RULE == 1) level = level;
                else level = area.level ? Number(area.level.split('&')[1]) : 0;
                // let level = area.level ? Number(area.level.split('&')[1]) : 0;
                let use = area.use ?? '';
                let con_v = (use).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('vivienda') || (use).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('residencia');
                let con_o = !(use).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('vivienda') && !(use).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('residencia');
                let floor = area.floor ?? '';
                let con_p = (floor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('piso');
                let con_se = (floor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('semisotano');
                let con_so = (floor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('sotano');

                if (con_v) {
                    if (con_p && level > 0) {
                        if (pvma < level) pvma = level;
                        if (level < pvmi) pvmi = level;
                    }
                    if (con_se) {
                        if (level < sevm) sevm = level;
                    }
                    if (con_so) {
                        if (level < sovm) sovm = level;
                    }
                }

                if (con_o) {
                    if (con_p && level > 0) {
                        if (poma < level) poma = level;
                        if (level < pomi) pomi = level;
                    }
                    if (con_se) {
                        if (level < seom) seom = level;
                    }
                    if (con_so) {
                        if (level < soom) soom = level;
                    }
                }

            })

            pvmi = pvmi == Infinity ? 0 : pvmi;
            pomi = pomi == Infinity ? 0 : pomi;

            sevm = sevm == Infinity ? 0 : sevm;
            seom = seom == Infinity ? 0 : seom;

            sovm = sovm == Infinity ? 0 : sovm;
            soom = soom == Infinity ? 0 : soom;

            return <div className='my-2 border border-dark px-3'>
                <div className="row text-center">
                    <div className="col-3 px-0 pe-1 border">
                        <h5 className='mb-0'>Altura Máxima / Mínima de Pisos</h5>
                    </div>
                    < div className="col px-0 pe-1 border">
                        <h5 className='mb-0'>Vivienda</h5>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <h5 className=' mb-0'>Otros</h5>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col-3 px-0 pe-1 border">
                        <h5 className='mb-0'>Tipo</h5>
                    </div>
                    < div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='mb-0'>Mínimo</h5>
                        </div>
                        <div className='row'>
                            <h5 className='col mb-0'>Norma</h5>
                            <h5 className='col mb-0'>Proyecto</h5>
                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className=' mb-0'>Máximo</h5>
                        </div>
                        <div className='row'>
                            <h5 className='col mb-0'>Norma</h5>
                            <h5 className='col mb-0'>Proyecto</h5>
                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='mb-0'>Mínimo</h5>
                        </div>
                        <div className='row'>
                            <h5 className='col mb-0'>Norma</h5>
                            <h5 className='col mb-0'>Proyecto</h5>
                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className=' mb-0'>Máximo</h5>
                        </div>
                        <div className='row'>
                            <h5 className='col mb-0'>Norma</h5>
                            <h5 className='col mb-0'>Proyecto</h5>
                        </div>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col-3 px-0 pe-1 border">
                        <h5 className='mb-0'>Pisos</h5>
                    </div>
                    < div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'> 2.40</h5>
                            <h5 className='col mb-0  fw-normal'><label className={pvmi < 2.4 ? 'text-danger' : ''}>{pvmi}</label></h5>

                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'>3.60</h5>
                            <h5 className='col mb-0  fw-normal'><label className={pvma > 3.6 ? 'text-danger' : ''}>{pvma}</label></h5>
                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'>2.40</h5>
                            <h5 className='col mb-0  fw-normal'><label className={pomi < 2.4 ? 'text-danger' : ''}>{pomi}</label></h5>
                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'>4.50</h5>
                            <h5 className='col mb-0  fw-normal'><label className={poma > 4.5 ? 'text-danger' : ''}>{poma}</label></h5>
                        </div>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col-3 px-0 pe-1 border">
                        <h5 className='mb-0'>Semisótano</h5>
                    </div>
                    < div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'> 2.40</h5>
                            <h5 className='col mb-0  fw-normal'><label className={sevm < 2.4 ? 'text-danger' : ''}>{sevm}</label></h5>

                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'> - </h5>
                            <h5 className='col mb-0  fw-normal'> - </h5>
                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'>2.40</h5>
                            <h5 className='col mb-0  fw-normal'><label className={seom < 2.4 ? 'text-danger' : ''}>{seom}</label></h5>

                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'> - </h5>
                            <h5 className='col mb-0  fw-normal'> - </h5>
                        </div>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col-3 px-0 pe-1 border">
                        <h5 className='mb-0'>Sótanos</h5>
                    </div>
                    < div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'> 2.40</h5>
                            <h5 className='col mb-0  fw-normal'><label className={sovm < 2.4 ? 'text-danger' : ''}>{sovm}</label></h5>

                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'> - </h5>
                            <h5 className='col mb-0  fw-normal'> - </h5>
                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'>2.40</h5>
                            <h5 className='col mb-0  fw-normal'><label className={soom < 2.4 ? 'text-danger' : ''}>{soom}</label></h5>

                        </div>
                    </div>
                    <div className="col px-0 pe-1 border">
                        <div className='row'>
                            <h5 className='col mb-0  fw-normal'> - </h5>
                            <h5 className='col mb-0  fw-normal'> - </h5>
                        </div>
                    </div>
                </div>
            </div>
        }
        let _COMPONENT_INDEX_CALC_2 = () => {
            var values = _GET_MFHF()
            let maxfloor = values[0];
            let heighFloor = values[1];
            let height = values[2];
            return <>
                <div className='my-2 border border-dark px-3 py-1'>
                    <div className="row text-center">
                        <div className="col-3 px-0 pe-1 border">
                            <h5 className='mb-0'>Número de Pisos</h5>
                        </div>
                        < div className="col px-0 pe-1 border">
                            <h5 className='mb-0 fw-normal'>En Cuadro de áreas: <label className={maxfloor != heighFloor ? 'text-danger' : ''}>{maxfloor}</label></h5>
                        </div>
                        <div className="col px-0 pe-1 border">
                            <h5 className=' mb-0 fw-normal'>Segun altura util: <label className={maxfloor != heighFloor ? 'text-danger' : ''}>{heighFloor}</label></h5>
                        </div>
                    </div>
                    <div className="row text-center">
                        <div className="col-3 px-0 pe-1 border">
                            <h5 className='mb-0'>Número de Pisos Maximo</h5>
                        </div>
                        < div className="col px-0 pe-1 border">
                            <h5 className='mb-0 fw-normal'>Altura :  <label className="fw-bold">{height}m</label></h5>
                        </div>
                        < div className="col px-0 pe-1 border">
                            <h5 className='mb-0 fw-normal'>2.4m :  <label className="fw-bold">{Math.trunc(height / 2.4)}</label></h5>
                        </div>
                        <div className="col px-0 pe-1 border">
                            <h5 className=' mb-0 fw-normal'>3.6m :  <label className="fw-bold">{Math.trunc(height / 3.6)}</label></h5>
                        </div>
                        <div className="col px-0 pe-1 border">
                            <h5 className=' mb-0 fw-normal'>4.6m : <label className="fw-bold">{Math.trunc(height / 4.6)}</label></h5>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_K_TIPOLOGY = () => {
            const vt = _GET_STEP_TYPE('s_34_te', 'value');
            const ct = _GET_STEP_TYPE('s_34_te', 'check');
            const area = _GET_AREA_BY_FLOOR('piso 1');
            let total_area = '';
            if (area) total_area = _GET_TOTAL_AREA(area.build, area.historic_areas);
            let sum_net_area = 0;
            let areas = _GET_CHILD_33_AREAS();
            areas.map(area => sum_net_area += Number(_GET_NET_INDEX(area.build, area.destroy, area.historic_areas)))
            sum_net_area = sum_net_area.toFixed(2);
            let areaPredio = json34.m2;

            let _vpjct_dv = _GET_MFHF()[0] || 0;
            // MAX VALUE 82
            let excs = [
                'NO',
                'Art. 471° Reconocimiento',
                'Empate Volumetrico',
                'Hasta 3 pisos',
                'Bien de Interest Culural',
                'Plan especial de manejor de patrimonio',
                'Indice licencia previa',
                'Historico',
                'Bonificación',
                'Orden judicial',
                'Art. 305° Prgf. 1',
                'Art. 313° - Plan parcial',
                'Art. 313° - TRA-3',
                'Art. 313° - M2',
                'Art. 313° - Prgf. 2',
                'Art. 313° M2, comercio, piso 1 á 3',
                'Art. 471° Reconocimiento',
                'Causa: Plazas/plazoletas en predio esquinero',
                'Causa: Plazas/plazoletas en predio medianero',
                'Causa: Pasaje comercial',
                'Causa: Construción de espacio público por cosatdo manzana',
            ]
            let typologies = [
                {
                    title: 'Tipologia Edificatoria', ci: 0, vnorm: 0, vpjct: 1, vexc: 2, vob: 68,
                    useObs: false, useObs: true,
                    norm: ['Continua', 'Aislada', 'Aislada con plataforma desde 4° piso', 'Pareado'],
                    proyect: ['Continua', 'Aislada', 'Aislada con plataforma desde 4° piso', 'Pareado'],
                    exc: excs,
                },
                {
                    title: 'Indice Ocupación', ci: 1, vnorm: 3, vpjct: 4, vexc: 5, vind: 6, vob: 14,
                    index: null, useIndex: true, useObs: true,
                    norm: total_area * (vt[6] || 1),
                    proyect: area,
                    exc: excs,
                },
                {
                    title: 'Indice Construcción', ci: 2, vnorm: 7, vpjct: 8, vexc: 9, vind: 10, vob: 15,
                    index: null, useIndex: true, useObs: true,
                    norm: areaPredio * (vt[10] || 1),
                    proyect: sum_net_area,
                    exc: excs,
                },
                {
                    title: 'Número de pisos', ci: 3, vnorm: 11, vpjct: 12, vexc: 13, vind: 17, vob: 16, vpjct_dv: _vpjct_dv,
                    index: ['Vivienda', 'Otros', 'Vivienda y Otros',], useIndex: true, nameIndex: 'Tipo', useObs: true,
                    norm: null,
                    proyect: null,
                    exc: excs,
                },
                {
                    title: 'Semisótano', ci: 4, vnorm: 18, vpjct: 19, vind: 21, vob: 20,
                    index: null, useIndex: true, useObs: true,
                    norm: null,
                    proyect: null,
                    exc: false,
                },
                {
                    title: 'Sótanos', ci: 5, vnorm: 22, vpjct: 23, vind: 24, vob: 25,
                    index: null, useIndex: true, useObs: true,
                    norm: null,
                    proyect: null,
                    exc: false,
                },
                {
                    title: 'Aislamiento Frontal (1)', ci: 6, vnorm: 26, vpjct: 27, vind: 28, vob: 29, vexc: 62, titlev: 69,
                    index: null, useIndex: false, useObs: true,
                    norm: [' - ', '0m', '2m', '3m', '4m'],
                    proyect: null,
                    exc: excs,
                },
                {
                    title: 'Aislamiento Frontal (2)', ci: 7, vnorm: 30, vpjct: 31, vind: 32, vob: 33, vexc: 63, titlev: 70,
                    index: null, useIndex: false, useObs: true,
                    norm: [' - ', '0m', '2m', '3m', '4m'],
                    proyect: null,
                    exc: excs,
                },
                {
                    title: 'Aislamiento Lateral (1)', ci: 8, vnorm: 34, vpjct: 35, vind: 36, vob: 37, vexc: 64, titlev: 71,
                    index: null, useIndex: false, useObs: true,
                    norm: ['0m', '3m', '4m', '5m', '6m'],
                    proyect: null,
                    exc: excs,
                },
                {
                    title: 'Aislamiento Lateral (2)', ci: 9, vnorm: 38, vpjct: 39, vind: 40, vob: 41, vexc: 65, titlev: 72,
                    index: null, useIndex: false, useObs: true,
                    norm: ['0m', '3m', '4m', '5m', '6m'],
                    proyect: null,
                    exc: excs,
                },
                {
                    title: 'Aislamiento Lateral (3)', ci: 10, vnorm: 42, vpjct: 43, vind: 44, vob: 45, vexc: 66, titlev: 73,
                    index: null, useIndex: false, useObs: true,
                    norm: ['0m', '3m', '4m', '5m', '6m'],
                    proyect: null,
                    hide: true, // LET THIS ONE LIKE THIS
                    exc: excs,
                },
                {
                    title: 'Aislamiento Posterior', ci: 11, vnorm: 46, vpjct: 47, vind: 48, vob: 49, vexc: 67, titlev: 74,
                    index: null, useIndex: false, useObs: true,
                    norm: ['0m', '3m', '3.5m', '4m', '5m', '6m', '7m', '8m', '9m'],
                    proyect: null,
                    exc: excs,
                },
                {
                    title: 'Antejardin (1)', ci: 12, vnorm: 50, vpjct: 51, vind: 52, vob: 53, titlev: 75,
                    index: null, useIndex: true, useObs: true,
                    norm: null,
                    proyect: null,
                    exc: false,
                },
                {
                    title: 'Antejardin (2)', ci: 13, vnorm: 54, vpjct: 55, vind: 56, vob: 57, titlev: 76,
                    index: null, useIndex: true, useObs: true,
                    norm: null,
                    proyect: null,
                    exc: false,
                },
                {
                    title: 'Antejardin (3)', ci: 14, vnorm: 58, vpjct: 59, vind: 60, vob: 61, titlev: 77,
                    index: null, useIndex: true, useObs: true,
                    norm: null,
                    proyect: null,
                    exc: false,
                },
                {
                    title: 'Antejardin (4)', ci: 15, vnorm: 82, vpjct: 79, vind: 80, vob: 81, titlev: 78,
                    index: null, useIndex: true, useObs: true,
                    norm: null,
                    proyect: null,
                    exc: false,
                },
            ]

            return <>
                <div className="row pb-2 text-center">
                    <div className="col-3 px-0 pe-1">
                        <h5 className='mb-0'>Descripción</h5>
                    </div>
                    < div className="col px-0 pe-1">
                        <h5 className='mb-0'>{'Datos'}</h5>
                    </div>
                    <div className="col px-0 pe-1">
                        <h5 className=' mb-0'>Norma</h5>
                    </div>
                    <div className="col px-0 pe-1">
                        <h5 className='mb-0'>Proyecto</h5>
                    </div>
                    <div className="col-1 px-0 pe-1">
                        <h5 className='mb-0'>P ; N</h5>
                    </div>
                    <div className="col px-0 pe-1">
                        <h5 className='mb-0'>Excepción</h5>
                    </div>
                    <div className="col-1 px-0 pe-1">
                        <h5 className='mb-0'>Evaluación</h5>
                    </div>
                </div>
                {typologies.map(tip => {
                    return <div className="row">
                        <div className="col-3 px-0 pe-1">
                            <input type={tip.hide ? 'hidden' : "text"} class="form-control form-control-sm mx-0" disabled={!tip.titlev}
                                defaultValue={vt[tip.titlev] || tip.title} onBlur={() => manage_ra_34_te('edi')} name={tip.titlev ? 's_34_t_v' : 'NO'} id={tip.titlev ? 's_34_t_v_' + tip.titlev : 'NO'}
                            />
                        </div>
                        < div className="col px-0 pe-1">
                            {tip.useIndex
                                ? <>
                                    {Array.isArray(tip.index) ?
                                        <select className={_GET_SELECT_COLOR_VALUE(vt[tip.vind])} defaultValue={vt[tip.vind]} hidden={tip.hide}
                                            onBlur={() => manage_ra_34_te('edi')} name={'s_34_t_v'} id={'s_34_t_v_' + tip.vind}>
                                            {tip.index.map(v => <option>{v}</option>)}
                                        </select>
                                        : <input type={tip.hide ? 'hidden' : "text"} class="form-control form-control-sm" name={'s_34_t_v'} id={'s_34_t_v_' + tip.vind}
                                            defaultValue={vt[tip.vind] || tip.index} onBlur={() => manage_ra_34_te('edi')} />}
                                </>
                                : ''}
                        </div>
                        <div className="col px-0 pe-1">
                            {Array.isArray(tip.norm) ?
                                <select className={_GET_SELECT_COLOR_VALUE(vt[tip.vnorm])} defaultValue={vt[tip.vnorm]} hidden={tip.hide}
                                    onBlur={() => manage_ra_34_te('edi')} name={'s_34_t_v'} id={'s_34_t_v_' + tip.vnorm}>
                                    {tip.norm.map(v => <option>{v}</option>)}
                                </select>
                                : <input type={tip.hide ? 'hidden' : "text"} class="form-control form-control-sm" name={'s_34_t_v'} id={'s_34_t_v_' + tip.vnorm}
                                    defaultValue={vt[tip.vnorm] || tip.norm} onBlur={() => manage_ra_34_te('edi')} />}

                        </div>
                        <div className="col px-0 pe-1">
                            {Array.isArray(tip.proyect) ?
                                <select className={_GET_SELECT_COLOR_VALUE(vt[tip.vpjct])} defaultValue={vt[tip.vpjct]} hidden={tip.hide}
                                    onBlur={() => manage_ra_34_te('edi')} name={'s_34_t_v'} id={'s_34_t_v_' + tip.vpjct}>
                                    {tip.proyect.map(v => <option>{v}</option>)}
                                </select>
                                : <input type={tip.hide ? 'hidden' : "text"} class="form-control form-control-sm" name={'s_34_t_v'} id={'s_34_t_v_' + tip.vpjct}
                                    defaultValue={vt[tip.vpjct] || tip.proyect} onBlur={() => manage_ra_34_te('edi')} />}

                        </div>
                        <div className="col-1 px-0 pe-1">
                            {tip.useObs ?
                                <>
                                    <select className={_GET_SELECT_COLOR_VALUE(vt[tip.vob])} defaultValue={vt[tip.vob]} hidden={tip.hide}
                                        onBlur={() => manage_ra_34_te('edi')} name={'s_34_t_v'} id={'s_34_t_v_' + tip.vob}>
                                        <option value={'P+N'}>P {'<'} N</option>
                                        <option>P = N</option>
                                        <option value={'P-N'}>P {'>'} N</option>
                                        <option>P != N</option>
                                    </select>
                                </>
                                : ''}
                        </div>
                        <div className="col px-0 pe-1">
                            {tip.exc ?
                                <>
                                    {Array.isArray(tip.exc) ?
                                        <select className={_GET_SELECT_COLOR_VALUE(vt[tip.vexc])} defaultValue={vt[tip.vexc]} hidden={tip.hide}
                                            onBlur={() => manage_ra_34_te('edi')} name={'s_34_t_v'} id={'s_34_t_v_' + tip.vexc}>
                                            {tip.exc.map(v => <option>{v}</option>)}
                                        </select>
                                        : <input type={tip.hide ? 'hidden' : "text"} class="form-control form-control-sm" name={'s_34_t_v'} id={'s_34_t_v_' + tip.vexc}
                                            defaultValue={vt[tip.vexc]} onBlur={() => manage_ra_34_te('edi')} />}
                                </>
                                : <input type={'hidden'} class="form-control form-control-sm" name={'s_34_t_v'} id={'s_34_t_v_' + tip.vexc}
                                    defaultValue={vt[tip.vexc]} />}
                        </div>
                        <div className="col-1 px-0 pe-1">
                            <select className={_GET_SELECT_COLOR_VALUE(ct[tip.ci])} defaultValue={ct[tip.ci]} hidden={tip.hide}
                                onBlur={() => manage_ra_34_te('edi')} name={'s_34_t_c'} id={'s_34_t_c_' + tip.ci}>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                                <option value="2" className="text-warning">NO APLICA</option>
                            </select>
                        </div>
                    </div>
                })
                }
            </>
        }
        let _COMPONENT_VOLADISOS = () => {
            const vt = _GET_STEP_TYPE('s_34_vo', 'value');
            const ct = _GET_STEP_TYPE('s_34_vo', 'check');
            let voladizos = [
                {
                    vPerfil: 0, vAnt: 1, vData: 2, vTitle: 3, check: 0,
                },
                {
                    vPerfil: 4, vAnt: 5, vData: 6, vTitle: 7, check: 1,
                },
                {
                    vPerfil: 8, vAnt: 9, vData: 10, vTitle: 11, check: 2,
                },
                {
                    vPerfil: 12, vAnt: 13, vData: 14, vTitle: 15, check: 3,
                },
            ]

            return <>
                <div className="row pb-2 text-center">
                    <div className="col px-0 pe-1">
                        <h5 className='mb-0'>Descripción</h5>
                    </div>
                    < div className="col px-0 pe-1">
                        <h5 className='mb-0'>Perfil</h5>
                    </div>
                    <div className="col px-0 pe-1">
                        <h5 className=' mb-0'>Antejardin</h5>
                    </div>
                    <div className="col px-0 pe-1">
                        <h5 className='mb-0'>Dato</h5>
                    </div>
                    <div className="col-2 px-0 pe-1">
                        <h5 className='mb-0'>Evaluación</h5>
                    </div>
                </div>
                {voladizos.map((vol, i) => {
                    return <div className="row pb-1">
                        <div className="col px-0 pe-1">
                            <input type={"text"} class="form-control form-control-sm mx-0"
                                defaultValue={vt[vol.vTitle] || `Voladizo (${i + 1})`}
                                onBlur={() => manage_ra_34_vol('vol')}
                                name={'s_34_vol_v'} id={'s_34_vol_v_' + vol.vTitle}
                            />
                        </div>
                        < div className="col px-0 pe-1">
                            <select className={'form-select form-select-sm'} defaultValue={vt[vol.vPerfil]}
                                onBlur={() => manage_ra_34_vol('vol')} name={'s_34_vol_v'} id={'s_34_vol_v_' + vol.vPerfil}>
                                <option>PVP {'<_'} a 9,00 mts</option>
                                <option>PVP {'>'} a 9,00 mts</option>
                                <option>PVV {'<_'} a 9,60 mts</option>
                                <option>PVV {'>'} a 9,60 mts y {'<'} a 16,00mts</option>
                                <option>PVV {'>_'} a 16,00 mts y {'<'} a 2100mts</option>
                                <option>PVV {'>_'} a 21,00mts</option>
                            </select>
                        </div>
                        <div className="col px-0 pe-1">
                            <select className={'form-select form-select-sm'} defaultValue={vt[vol.vAnt]}
                                onBlur={() => manage_ra_34_vol('vol')} name={'s_34_vol_v'} id={'s_34_vol_v_' + vol.vAnt}>
                                <option value="CON">CON ANTEJARDIN</option>
                                <option value="SIN">SIN ANTEJARDIN</option>
                            </select>
                        </div>
                        <div className="col px-0 pe-1">
                            <select className={'form-select form-select-sm'} defaultValue={vt[vol.vData]}
                                onBlur={() => manage_ra_34_vol('vol')} name={'s_34_vol_v'} id={'s_34_vol_v_' + vol.vData}>
                                <option>NO</option>
                                <option>0.6</option>
                                <option>0.8</option>
                                <option>1.0</option>
                                <option>1.2</option>
                                <option>1.5</option>
                                <option>NA</option>
                            </select>
                        </div>
                        <div className="col-2 px-0 pe-1">
                            <select className={_GET_SELECT_COLOR_VALUE(ct[vol.check])} defaultValue={ct[vol.check]}
                                onBlur={() => manage_ra_34_vol('vol')} name={'s_34_vol_c'} id={'s_34_vol_c_' + vol.check}>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                                <option value="2" className="text-warning">NO APLICA</option>
                            </select>
                        </div>
                    </div>
                })
                }
            </>
        }
        let _COMPONENENT_EMPATE = () => {
            const _CHECK_ARRAY = _GET_STEP_TYPE('s34_ev', 'check');
            const _VALUE_ARRAY = _GET_STEP_TYPE('s34_ev', 'value');

            const LIST = [
                {
                    c: 0, title: 'Empate Volumétrico',
                    items: [
                        { v: 0, desc: 'empata en los vacíos internos de la planta arquitectónica', },
                        { v: 1, desc: 'empata en el aislamiento posterior', },
                        { v: 2, desc: 'empata en el numero de pisos', },
                        { v: 3, desc: 'empata en la altura total de las dos edificaciones', },
                        { v: 4, desc: 'empata en el voladizo', },
                    ]
                },
            ]
            return LIST.map((list, i) => {
                return <div className="row border">
                    {list.title ? <div className='col-3 text-center '><label className='fw-bold'>{list.title}</label></div> : ''}
                    <div className='col'>
                        {list.items.map((item, j) => {
                            return <>
                                <div className='row border'>
                                    <div className='col'><label>{item.desc}</label></div>
                                    <div className='col-3'>
                                        {item.open ?
                                            <input type="text" class="form-control form-control-sm" name="s_34_ev_values"
                                                defaultValue={_VALUE_ARRAY[item.v]} onBlur={() => manage_ra_34(false)} />
                                            : <select className={_GET_SELECT_COLOR_VALUE(_VALUE_ARRAY[item.v])} name="s_34_ev_values"
                                                defaultValue={_VALUE_ARRAY[item.v]} onChange={() => manage_ra_34(false)} >
                                                <option className="text-danger">NO</option>
                                                <option className="text-success">SI</option>
                                                <option className="text-warning">NA</option>
                                            </select>}
                                    </div>
                                </div>
                            </>
                        })}
                    </div>
                    <div className='col-2 text-center'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[list.c])} name="s_34_ev_checks"
                        defaultValue={_CHECK_ARRAY[list.c]} onChange={() => manage_ra_34(false)} >
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select></div>
                </div>
            })
        }
        let _COMPONENT_CORRECTIONS = () => {
            return <div className="row">
                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Observaciones análisis de determinantes de predio</label>
                    </div>
                </div>
                <textarea className="input-group" maxLength="2000" name="s_34_values" rows="4"
                    defaultValue={value34[10]} onBlur={() => manage_ra_34()}></textarea>
                <label> (maximo 2000 caracteres)</label>
            </div>
        }


        let _COMPONENT_HABITABILITY = () => {
            const _CHECK_ARRAY = _GET_STEP_TYPE('s34_hs', 'check');
            const _VALUE_ARRAY = _GET_STEP_TYPE('s34_hs', 'value');
            const LIST = [
                {
                    c: 0, title: 'Área mínima de la vivienda',
                    items: [
                        { v: 0, desc: 'VIS: La unidad de vivienda debe tener como mínimo zona social, una alcoba,un baño completo, cocina y zona para ropas', },
                    ]
                },
                {
                    c: 1, title: 'Condiciones mínimas iluminación y ventilación',
                    items: [
                        { v: 1, desc: 'Todos los espacios habitables, áreas sociales, baños, cocinas  alcobas pueden ventilarse e iluminarse directamente o a través de fachadas o patios', },
                        { v: 2, desc: 'Las áreas de servicio garajes, cuantos técnicos y depósitos están iluminados y ventilados artificialmente o por ductos o buitrones o por medios mecánicos', },
                        { v: 3, desc: 'Vacíos interiores en función de la altura de la edificación', },
                    ]
                },
                {
                    c: 2, title: 'Sótanos y semisótanos Art 273° POT',
                    items: [
                        { v: 4, desc: 'presenta medios naturales y/o mecánicos para iluminación y/o ventilación', },
                        { v: 5, desc: 'Altura mínima de 2,40m', },
                        { v: 6, desc: 'Sótano o semisótano no se encuentra sobre antejardin', },
                        { v: 7, desc: 'Sótano o semisótano se encuentra construido en el retroceso frontal', },
                    ]
                },
                {
                    c: 3, title: 'Volumetria y altura de la edificación Art 274° a 282° POT',
                    items: [
                        { v: 8, desc: 'Uso del predio', open: true, },
                        { v: 9, desc: 'Altura máxima para uso', open: true, },
                        { v: 10, desc: 'Número de frentes del predio', open: true, },
                        { v: 11, desc: 'Número de pisos por norma', open: true },
                        { v: 12, desc: 'Número de pisos por frente según proyecto', open: true },
                        { v: 13, desc: 'Volumetria resultante de la correcta aplicación de la norma', },
                        { v: 14, desc: 'Culatas se encuentran frisadas y pintadas o trasladadas con los mismos materiales y acabados de las fachadas / mural artístico', },
                        { v: 15, desc: 'Existe servidumbre de vista con los edificios vecinos y/o edificios del conjunto edificio', },
                    ]
                },
                {
                    c: 4, title: 'Equipos edificaciones e instalaciones Art 285° POT',
                    items: [
                        { v: 16, desc: 'El edificio tiene más de 5 pisos de altura', },
                        { v: 17, desc: 'Presenta ascensor', },
                        { v: 18, desc: 'Número de ascensores por unidad construida', open: true, },
                        { v: 19, desc: 'Planta eléctrica o de emergencia; Tiene espacio para estos equipos en el sótano', },
                    ]
                },
            ]

            return LIST.map((list, i) => {
                return <div className="row border">
                    {list.title ? <div className='col-3 text-center '><label className='fw-bold'>{list.title}</label></div> : ''}
                    <div className='col'>
                        {list.items.map((item, j) => {
                            return <>
                                <div className='row border'>
                                    <div className='col'><label>{item.desc}</label></div>
                                    <div className='col-3'>
                                        {item.open ?
                                            <input type="text" class="form-control form-control-sm" name="s_34_hs_values"
                                                defaultValue={_VALUE_ARRAY[item.v]} onBlur={() => manage_ra_34_hs(false)} />
                                            : <select className={_GET_SELECT_COLOR_VALUE(_VALUE_ARRAY[item.v])} name="s_34_hs_values"
                                                defaultValue={_VALUE_ARRAY[item.v]} onChange={() => manage_ra_34_hs(false)} >
                                                <option className="text-danger">NO</option>
                                                <option className="text-success">SI</option>
                                                <option className="text-warning">NA</option>
                                            </select>}
                                    </div>
                                </div>
                            </>
                        })}
                    </div>
                    <div className='col-2 text-center'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[list.c])} name="s_34__hs_checks"
                        defaultValue={_CHECK_ARRAY[list.c]} onChange={() => manage_ra_34_hs(false)} >
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select></div>
                </div>
            })
        }

        let _COMPONENT_SESSION_B = () => {
            const _CHECK_ARRAY = _GET_STEP_TYPE('session_b', 'check');
            const _VALUE_ARRAY = _GET_STEP_TYPE('session_b', 'value');
            const value35 = _GET_STEP_TYPE('s35', 'value');
            const LIST = [
                { name: 'Presenta Zona Comunes', c: 0 },
                { name: 'El proyect tiene mas de 10 unidades de vivienda', c: 1 },
                { name: 'El area construida de otros usos que no sean vivienda es mayor a 1000 m2', c: 2 },
            ]

            var sumAreas = Number(value35[2] > 10 ? ((_VALUE_ARRAY[1] ?? 0) * 0.185) : 0) +
                Number(value35[0] > 1000 ? ((_VALUE_ARRAY[2] ?? 0) * 0.25) : 0) +
                Number(value35[0] > 1000 ? ((_VALUE_ARRAY[3] ?? 0) * 0.15) : 0);
            sumAreas = sumAreas.toFixed(2)
            return <>
                <div className="row">
                    <div className='col'>
                        {LIST.map(item => {
                            return <div className="row border">
                                <div className='col-10'><label className=''>{item.name}</label></div>
                                <div className='col'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item.c])}
                                    name="session_b_checks" id={"session_b_checks_" + item.c}
                                    defaultValue={_CHECK_ARRAY[item.c]} onChange={() => manage_ra_34(false)} >
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">NA</option>
                                </select> </div>
                            </div>
                        })}
                    </div>
                    <div className='col-2'>
                        <select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[3])}
                            name="session_b_checks" id={"session_b_checks_" + 3}
                            defaultValue={_CHECK_ARRAY[3]} onChange={() => manage_ra_34(false)} >
                            <option value="1" className="text-success">APLICA</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                    </div>

                </div>

                <div className='border border-dark p-1 my-3'>
                    <div className='row'>
                        <div className='col-3 text-center fw-bold'>Área Base Indice Construcción</div>
                        <div className='col text-center fw-bold'>m2 por Actividad</div>
                    </div>
                    <div className='row'>
                        <div className='col-3 mx-3'>
                            <div className='row '>
                                <label>Área de otro uso (No vivienda): <label className='fw-bold'>{value35[0]}</label></label>
                            </div>
                            <div className='row'>
                                <label>N° de viviendas: <label className='fw-bold'>{value35[2]}</label></label>
                            </div>
                        </div>
                        <div className='col'>
                            <div className='row text-center fw-bold'>
                                <div className='col'><label>Evaluación</label></div>
                                <div className='col'><label>Residencial</label></div>
                                <div className='col'><label>Comercio</label></div>
                                <div className='col'><label>Ind. / Dot.</label></div>
                            </div>
                            <div className='row text-center fw-bold'>
                                <div className='col'><label>Área</label></div>
                                <div className='col'><input type="number" step={0.01} min="0" onBlur={() => manage_ra_34(false)} className="form-control form-control-sm"
                                    name="session_b_values" id={"session_b_values_" + 1} defaultValue={_VALUE_ARRAY[1] ?? 0} /></div>
                                <div className='col'><input type="number" step={0.01} min="0" onBlur={() => manage_ra_34(false)} className="form-control form-control-sm"
                                    name="session_b_values" id={"session_b_values_" + 2} defaultValue={_VALUE_ARRAY[2] ?? 0} /></div>
                                <div className='col'><input type="number" step={0.01} min="0" onBlur={() => manage_ra_34(false)} className="form-control form-control-sm"
                                    name="session_b_values" id={"session_b_values_" + 3} defaultValue={_VALUE_ARRAY[3] ?? 0} /></div>
                            </div>
                            <div className='row text-center'>
                                <div className='col  fw-bold'><label>Porcentaje</label></div>
                                <div className='col'><label>18.75%</label></div>
                                <div className='col'><label>25%</label></div>
                                <div className='col'><label>15%</label></div>
                            </div>
                            <div className='row text-center '>
                                <div className='col fw-bold'><label>Norma</label></div>
                                <div className='col'><label>{value35[2] > 10 ? ((_VALUE_ARRAY[1] ?? 0) * 0.1875).toFixed(2) : 'NA'}</label></div>
                                <div className='col'><label>{value35[0] > 1000 ? ((_VALUE_ARRAY[2] ?? 0) * 0.25).toFixed(2) : 'NA'}</label></div>
                                <div className='col'><label>{value35[0] > 1000 ? ((_VALUE_ARRAY[3] ?? 0) * 0.15).toFixed(2) : 'NA'}</label></div>
                            </div>
                            <div className='row text-center '>
                                <div className='col fw-bold'><label>Proyecto</label></div>
                                <div className='col'><input type="text" onBlur={() => manage_ra_34(false)} className="form-control form-control-sm"
                                    name="session_b_values" id={"session_b_values_" + 4} defaultValue={_VALUE_ARRAY[4] ?? 0} /></div>
                                <div className='col'><input type="text" onBlur={() => manage_ra_34(false)} className="form-control form-control-sm"
                                    name="session_b_values" id={"session_b_values_" + 5} defaultValue={_VALUE_ARRAY[5] ?? 0} /></div>
                                <div className='col'><input type="text" onBlur={() => manage_ra_34(false)} className="form-control form-control-sm"
                                    name="session_b_values" id={"session_b_values_" + 0} defaultValue={_VALUE_ARRAY[0] ?? 0} /></div>
                            </div>
                            <div className='row text-center '>
                                <div className='col fw-bold'><label>Cumple</label></div>
                                <div className='col'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[5])}
                                    name="session_b_checks" id={"session_b_checks_" + 5}
                                    defaultValue={_CHECK_ARRAY[5]} onChange={() => manage_ra_34(false)} >
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">NA</option>
                                </select> </div>
                                <div className='col'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[6])}
                                    name="session_b_checks" id={"session_b_checks_" + 6}
                                    defaultValue={_CHECK_ARRAY[6]} onChange={() => manage_ra_34(false)} >
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">NA</option>
                                </select></div>
                                <div className='col'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[7])}
                                    name="session_b_checks" id={"session_b_checks_" + 7}
                                    defaultValue={_CHECK_ARRAY[7]} onChange={() => manage_ra_34(false)} >
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">NA</option>
                                </select></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='border border-dark p-1 my-3'>
                    <div className='row'>
                        <div className='col text-center fw-bold'>Relación Area</div>
                    </div>
                    <div className='row text-center fw-bold'>
                        <div className='col'><label></label></div>
                        <div className='col'><label>Libre Minima</label></div>
                        <div className='col'><label>Construida Maxima</label></div>
                        <div className='col'><label>Parqueo adicional Compl.</label></div>
                    </div>
                    <div className='row text-center fw-bold'>
                        <div className='col-3'><label>Evaluación</label></div>
                        <div className='col'><label>Área</label></div>
                        <div className='col'><label>Porcentaje</label></div>
                        <div className='col'><label>Área</label></div>
                        <div className='col'><label>Porcentaje</label></div>
                        <div className='col'><label>Área</label></div>
                        <div className='col'><label>Porcentaje</label></div>
                    </div>
                    <div className='row text-center'>
                        <div className='col-3  fw-bold'><label>Norma</label></div>
                        <div className='col'><label>{(sumAreas * 0.5).toFixed(2)} - {(sumAreas * 0.85).toFixed(2)}</label></div>
                        <div className='col'><label>50% - 85%</label></div>
                        <div className='col'><label>{(sumAreas * 0.01).toFixed(2)} - {(sumAreas * 0.15).toFixed(2)}</label></div>
                        <div className='col'><label>1% - 15%</label></div>
                        <div className='col'><label>0 - {(sumAreas * 0.35).toFixed(2)}</label></div>
                        <div className='col'><label>0% - 35%</label></div>
                    </div>
                    <div className='row text-center'>
                        <div className='col-3  fw-bold'><label>Proyecto</label></div>
                        <div className='col'><input type="text" onBlur={() => manage_ra_34(false)} className="form-control form-control-sm"
                            name="session_b_values" id={"session_b_values_" + 6} defaultValue={_VALUE_ARRAY[6] ?? 0} /></div>
                        <div className='col'><label>{((_VALUE_ARRAY[6] ?? 0) / sumAreas * 100).toFixed(2)}%</label></div>
                        <div className='col'><label><input type="text" onBlur={() => manage_ra_34(false)} className="form-control form-control-sm"
                            name="session_b_values" id={"session_b_values_" + 7} defaultValue={_VALUE_ARRAY[7] ?? 0} /></label></div>
                        <div className='col'><label>{((_VALUE_ARRAY[7] ?? 0) / sumAreas * 100).toFixed(2)}%</label></div>
                        <div className='col'><label><input type="text" onBlur={() => manage_ra_34(false)} className="form-control form-control-sm"
                            name="session_b_values" id={"session_b_values_" + 8} defaultValue={_VALUE_ARRAY[8] ?? 0} /></label></div>
                        <div className='col'><label>{((_VALUE_ARRAY[8] ?? 0) / sumAreas * 100).toFixed(2)}%</label></div>
                    </div>
                    <div className='row text-center'>
                        <div className='col-3  fw-bold'><label>Cumple</label></div>
                        <div className='col'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[8])}
                            name="session_b_checks" id={"session_b_checks_" + 8}
                            defaultValue={_CHECK_ARRAY[8]} onChange={() => manage_ra_34(false)} >
                            <option value="0" className="text-danger">NO</option>
                            <option value="1" className="text-success">SI</option>
                            <option value="2" className="text-warning">NA</option>
                        </select></div>
                        <div className='col'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[9])}
                            name="session_b_checks" id={"session_b_checks_" + 9}
                            defaultValue={_CHECK_ARRAY[9]} onChange={() => manage_ra_34(false)} >
                            <option value="0" className="text-danger">NO</option>
                            <option value="1" className="text-success">SI</option>
                            <option value="2" className="text-warning">NA</option>
                        </select></div>
                        <div className='col'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[4])}
                            name="session_b_checks" id={"session_b_checks_" + 4}
                            defaultValue={_CHECK_ARRAY[4]} onChange={() => manage_ra_34(false)} >
                            <option value="0" className="text-danger">NO</option>
                            <option value="1" className="text-success">SI</option>
                            <option value="2" className="text-warning">NA</option>
                        </select></div>
                    </div>
                </div>
            </>
        }
        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();

        let new_ra_34_gen = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('recordArcId', currentRecord.id);
            formData.set('active', 1);

            let norm = document.getElementById("r_a_34_gen_1").value;
            formData.set('norm', norm);
            let desc = document.getElementById("r_a_34_gen_2").value;
            formData.set('desc', desc);
            let date = document.getElementById("r_a_34_gen_3").value;
            formData.set('date', date);
            let pages = document.getElementById("r_a_34_gen_4").value;
            formData.set('pages', pages);


            RECORD_ARCSERVICE.create_arc_34_gen(formData)
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
                        document.getElementById("form_ra_34_gen").reset();
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
        let delete_34_gen = (id) => {
            MySwal.fire({
                title: "ELIMINAR ESTE ITEM",
                text: "¿Esta seguro de eliminar de forma permanente este item?",
                icon: 'question',
                confirmButtonText: "ELIMINAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    MySwal.fire({
                        title: swaMsg.title_wait,
                        text: swaMsg.text_wait,
                        icon: 'info',
                        showConfirmButton: false,
                    });
                    RECORD_ARCSERVICE.delete_34_gen(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.requestUpdateRecord(currentItem.id)
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
            });
        }
        let setActive_34_gen = (item) => {
            formData = new FormData();
            let id = item.id
            let active = item.active;
            active = active == 1 ? 0 : 1;
            formData.set('active', active);
            RECORD_ARCSERVICE.update_arc_34_gen(id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        this.props.requestUpdateRecord(currentItem.id);
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

        let manage_ra_34 = (state) => {
            if (state) this.setState({ [state]: 1 })

            let checks = [];
            let values = [];

            formData = new FormData();

            var checks_html = document.getElementsByName('s_34_checks');
            for (var i = 0; i < checks_html.length; i++) {
                checks.push(checks_html[i].value)
            }
            formData.set('check', checks.join(';'));

            var values_html = document.getElementsByName('s_34_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value.replaceAll(';', ','))
            }
            var values_html = document.getElementsByName('s_34_values_2');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value.replaceAll(';', ','))
            }
            formData.set('value', values.join(';'));

            let json = json34;

            json.ficha = document.getElementsByName("r_a_34_a-1")[0].value;
            json.sector = document.getElementsByName("r_a_34_a")[0].value;
            json.subsector = document.getElementsByName("r_a_34_a")[1].value;
            json.zgu = document.getElementsByName("r_a_34_a")[3].value;
            json.zugm = document.getElementsByName("r_a_34_a")[4].value;
            json.m2 = document.getElementsByName("r_a_34_a")[5].value;
            json.m1 = document.getElementsByName("r_a_34_a")[6].value;
            json.local = document.getElementsByName("r_a_34_a")[7].value;
            json.mainuse = json.mainuse;
            json.tipo = json.tipo;

            formData.set('json', JSONObjectParser(json));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's34');

            save_step('s34', false, formData, state);

            formData = new FormData();
            values = [];
            if (document.getElementById("sesion_l")) values.push(document.getElementById("sesion_l").value);
            if (document.getElementById("sesion_c")) values.push(document.getElementById("sesion_c").value);
            if (document.getElementById("sesion_l_a")) values.push(document.getElementById("sesion_l_a").value);
            if (document.getElementById("sesion_c_a")) values.push(document.getElementById("sesion_c_a").value);

            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 'equip');

            save_step('equip', false, formData);

            formData = new FormData();
            checks = [];
            checks_html = document.getElementsByName('s_34_t_c');
            for (var i = 0; i < checks_html.length; i++) {
                let ele = document.getElementById('s_34_t_c_' + i)
                checks.push(ele ? ele.value : '')
            }

            values = [];
            values_html = document.getElementsByName('s_34_t_v');
            for (var i = 0; i < values_html.length; i++) {
                let ele = document.getElementById('s_34_t_v_' + i)
                values.push(ele ? ele.value : '')
            }

            formData.set('value', values.join(';'));
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's_34_te');

            save_step('s_34_te', false, formData);


            formData = new FormData();
            checks = [];
            checks_html = document.getElementsByName('s_34_ev_checks');
            for (var i = 0; i < checks_html.length; i++) {
                checks.push(checks_html[i].value)
            }

            values = [];
            values_html = document.getElementsByName('s_34_ev_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value)
            }

            formData.set('value', values.join(';'));
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's34_ev');

            save_step('s34_ev', false, formData);

            formData = new FormData();
            checks = [];
            values = [];

            checks_html = [];
            values_html = [];

            values_html = document.getElementsByName('session_b_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(document.getElementById('session_b_values_' + i).value)
            }
            formData.set('value', values.join(';'));

            checks_html = document.getElementsByName('session_b_checks');
            for (var i = 0; i < checks_html.length; i++) {
                checks.push(document.getElementById('session_b_checks_' + i).value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 'session_b');

            save_step('session_b', false, formData);
        }

        let manage_ra_34_hs = (e) => {
            if (e) e.preventDefault();

            let checks = [];
            let values = [];
            var checks_html;
            var values_html;

            formData = new FormData();


            checks = [];
            checks_html = document.getElementsByName('s_34__hs_checks');
            for (var i = 0; i < checks_html.length; i++) {
                checks.push(checks_html[i].value)
            }

            values = [];
            values_html = document.getElementsByName('s_34_hs_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value)
            }

            formData.set('value', values.join(';'));
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's34_hs');

            save_step('s34_hs', false, formData);
        }
        let manage_ra_34_te = (state) => {
            if (state) this.setState({ [state]: 1 })

            let checks = [];
            let values = [];
            var checks_html;
            var values_html;

            formData = new FormData();


            formData = new FormData();
            checks = [];
            checks_html = document.getElementsByName('s_34_t_c');
            for (var i = 0; i < checks_html.length; i++) {
                let ele = document.getElementById('s_34_t_c_' + i)
                checks.push(ele.value)
            }

            values = [];
            values_html = document.getElementsByName('s_34_t_v');
            for (var i = 0; i < values_html.length; i++) {
                let ele = document.getElementById('s_34_t_v_' + i)
                values.push(ele ? ele.value : '')
            }

            formData.set('value', values.join(';'));
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's_34_te');

            save_step('s_34_te', false, formData, state);
        }

        let manage_ra_34_vol = (state) => {
            if (state) this.setState({ [state]: 1 })

            let checks = [];
            let values = [];
            var checks_html;
            var values_html;

            formData = new FormData();
            checks = [];
            checks_html = document.getElementsByName('s_34_vol_c');
            for (var i = 0; i < checks_html.length; i++) {
                let ele = document.getElementById('s_34_vol_c_' + i)
                checks.push(ele.value)
            }

            values = [];
            values_html = document.getElementsByName('s_34_vol_v');
            for (var i = 0; i < values_html.length; i++) {
                let ele = document.getElementById('s_34_vol_v_' + i)
                values.push(ele.value)
            }

            formData.set('value', values.join(';'));
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's_34_vo');

            save_step('s_34_vo', false, formData, state);
        }

        let save_step = (_id_public, useSwal, formData, state) => {
            var STEP = LOAD_STEP(_id_public);

            if (useSwal) MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (STEP.id) {
                RECORD_ARCSERVICE.update_step(STEP.id, formData)
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
                            if (state) this.setState({ [state]: 2 })
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            if (state) this.setState({ [state]: 3 })
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
                        if (state) this.setState({ [state]: 3 })
                    });
            }
            else {
                RECORD_ARCSERVICE.create_step(formData)
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
                            if (state) this.setState({ [state]: 2 })
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            if (state) this.setState({ [state]: 3 })
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
                        if (state) this.setState({ [state]: 3 })
                    });
            }
        }

        return (
            <div className="record_arc_32 container">

                <h3 className="py-3" >3.4.1 Información General  {_SAVING_STATE(this.state.a41)}</h3>

                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new_gen: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Añadir Nueva Norma Urbana
                    </label>
                </div>
                {this.state.new_gen
                    ? <form id="form_ra_34_gen" onSubmit={new_ra_34_gen}>
                        {_COMPONENT_1()}
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> AÑADIR NORMA
                            </button>
                        </div>
                    </form>
                    : ""}
                {_COMPONENT_1_LIST()}

                <hr className="my-3" />

                {_COMPONENT_A()}
                {_COMPONENT_BJ()}

                <h3 className="py-3" >Edificabilidad  {_SAVING_STATE(this.state.edi)}</h3>
                {_COMPONENT_INDEX_CALC()}
                {_COMPONENT_INDEX_CALC_2()}
                {_COMPONENT_K_TIPOLOGY()}

                <h3 className="py-3" >Voladizos  {_SAVING_STATE(this.state.vol)}</h3>
                {_COMPONENT_VOLADISOS()}

                <h3 className="my-3">3.4.2 Estudio de habitabilidad</h3>
                {_COMPONENT_HABITABILITY()}

                <h3 className="py-3" >3.4.3 Empate volumétrico</h3>
                {_COMPONENENT_EMPATE()}


                <h3 className="py-3" >3.4.4 Cesion tipo B</h3>
                {_COMPONENT_SESSION_B()}

                <h3 className="py-3" >3.4.5 Observaciones</h3>
                {_COMPONENT_CORRECTIONS()}
            </div >
        );
    }
}

export default RECORD_ARC_34;