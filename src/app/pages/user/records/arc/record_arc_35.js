import React, { Component } from 'react';
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';

import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import parkingData from '../../../../components/jsons/parkingData.json'

const MySwal = withReactContent(Swal);

class RECORD_ARC_35 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            new_parking: false,
            new_location: false,
            edit_parking: false,
            edit_location: false,
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.edit_parking !== prevState.edit_parking && this.state.edit_parking != false) {
            var _ITEM = this.state.edit_parking;
            document.getElementById("r_a_35_parking_1_edit").value = _ITEM.use;
            document.getElementById("r_a_35_parking_2_edit").value = _ITEM.name;

            let _SELECT = document.getElementById("r_a_35_parking_3_edit");
            let _LIST = parkingData;
            let _DATA = _LIST[_ITEM.use];
            _SELECT.innerHTML = "";
            for (var _JSON in _DATA) {
                var _OPTION = document.createElement('option');
                _OPTION.innerHTML = _JSON;
                _SELECT.appendChild(_OPTION)
            }

            document.getElementById("r_a_35_parking_3_edit").value = _ITEM.type;
            document.getElementById("r_a_35_parking_4_edit").value = _ITEM.norm;
            document.getElementById("r_a_35_parking_5_edit").value = _ITEM.project;

            _SELECT = document.getElementById("r_a_35_parking_6_edit");
            _LIST = parkingData;
            _DATA = _LIST[_ITEM.use][_ITEM.type].u_units;
            _SELECT.innerHTML = "";
            for (var i = 0; i < _DATA.length; i++) {
                var _OPTION = document.createElement('option');
                _OPTION.innerHTML = _DATA[i];
                _SELECT.appendChild(_OPTION)
            }

            document.getElementById("r_a_35_parking_6_edit").value = _ITEM.pos;
        }
        if (this.state.edit_location !== prevState.edit_location && this.state.edit_location != false) {
            var _ITEM = this.state.edit_location;
            document.getElementById("r_a_35_location_1_edit").value = _ITEM.floor;
            let _VAR_ARRAY = _ITEM.diensions.split(",")
            let _COMPONENTS = document.getElementsByName("r_a_35_parking_dientions_edit");
            for (var i = 0; i < _VAR_ARRAY.length; i++) {
                _COMPONENTS[i].value = _VAR_ARRAY[i];
            }

        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;


        // DATA GETERS
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
        let _ADD_AREAS = (_array, ss = ",", index = false) => {
            if (!_array) return 0;
            var areas = _array.split(ss);
            var sum = 0;
            if(index !== false){
                sum += Number(areas[index])
            }
            else {
                for (var i = 0; i < areas.length; i++) {
                    sum += Number(areas[i])
                }
            }
            
            return sum.toFixed(2);
        }
        let _GET_TOTAL_UNIS_INDEX = (index) => {
            let areas = _GET_CHILD_33_AREAS();
            let uv = 0;
            areas.map(area => {
                uv += Number(_ADD_AREAS(area.units, ';', 0));
            })

            return uv;
        }
        let _GET_CHILD_35_PARKING = () => {
            var _CHILD = currentRecord.record_arc_35_parkings;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_35_LOCATION = () => {
            var _CHILD = currentRecord.record_arc_35_locations;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (_VALUE == 0) {
                return 'form-select text-danger form-select-sm';
            }
            if (_VALUE == 1) {
                return 'form-select text-success form-select-sm';
            }
            if (_VALUE == 2) {
                return 'form-select text-warning form-select-sm';
            }
            return 'form-select form-select-sm';
        }
        let _GET_EVALUATION = (_NORM, _PROYECT, _ALT) => {
            var _DIFF = _PROYECT - _NORM;
            if (_DIFF == 0) return _ALT ? 1 : "P = N";
            if (_DIFF < 0) return _ALT ? 1 : "P <= N";
            if (_DIFF > 0) return _ALT ? 0 : "P >= N";
        }
        let _GET_LOCATION_INDEX = (_ITEM, _INDEX) => {
            var _NEW_ARRAY = _ITEM.split(',');
            return _NEW_ARRAY[_INDEX];
        }
        let _GET_LOCATION_PERCENTAGES = () => {
            let _LIST = _GET_CHILD_35_LOCATION();
            var total_m1 = 0;
            var total_m2 = 0;
            var total_m3 = 0;
            var total_m4 = 0;
            var total_m5 = 0;
            var total_m6 = 0;

            for (var i = 0; i < _LIST.length; i++) {
                var diensions = _LIST[i].diensions;
                total_m1 += parseInt(_GET_LOCATION_INDEX(diensions, 0));
                total_m2 += parseInt(_GET_LOCATION_INDEX(diensions, 1));
                total_m3 += parseInt(_GET_LOCATION_INDEX(diensions, 2));
                total_m4 += parseInt(_GET_LOCATION_INDEX(diensions, 3));
                total_m5 += parseInt(_GET_LOCATION_INDEX(diensions, 4));
                total_m6 += parseInt(_GET_LOCATION_INDEX(diensions, 5));
            }
            var _ARRAY_TOTALS = [];
            _ARRAY_TOTALS.push(total_m1);
            _ARRAY_TOTALS.push(total_m2);
            _ARRAY_TOTALS.push(total_m3);
            _ARRAY_TOTALS.push(total_m4);
            _ARRAY_TOTALS.push(total_m5);
            _ARRAY_TOTALS.push(total_m6);
            return _ARRAY_TOTALS;
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_arc_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ? STEP[_type] : [];
            if (!value.length) return [];
            value = value.split(';');
            return value
        }

        const value35 = _GET_STEP_TYPE('s35', 'value');
        const check35 = _GET_STEP_TYPE('s35', 'check');
        // DATA CONVERTER

        let _FIND_M = (_STRATA) => {
            let _LIST = _GET_CHILD_35_PARKING();
            let string = _GET_CHILD_2().item_267;
            if (!string) return <label className="fw-bold text-danger">ESTRATO INVALIDO</label>
            _GET_CHILD_2().item_267 >= 3 ? string = "Visitantes (V)" : string = "Residentes (R)"
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].type == string) return _LIST[i].norm
            }
            return <label className="fw-bold text-danger">NO HAY RESIDENTES O VISITANTES</label>
        }
        let _GET_NORM = (_OBJECT) => {
            let _VALUE = 0;
            if (_OBJECT.use == "Vivienda") {
                if (!value35[2]) return -1
                _VALUE = Number(value35[2]);
                if (_OBJECT.type == "Motocicletas (M)") {
                    var result = _FIND_M();
                    if (!Number(result)) return 0;
                    else {
                        let strata = _GET_CHILD_2().item_267;
                        if (strata == 1) _VALUE = Math.round(3 / (7 * result));
                        if (strata == 2) _VALUE = Math.round(3 / (5 * result));
                        if (strata == 3) _VALUE = Math.round(3 / (3 * result));
                        if (strata == 4) _VALUE = Math.round(3 / (3 * result));
                        if (strata == 5) _VALUE = Math.round(1 / (5 * result));
                        if (strata == 6) _VALUE = Math.round(1 / (5 * result));
                        return _VALUE;
                    }
                } else {
                    _VALUE = Math.round(_VALUE / _OBJECT.norm);
                    return _VALUE;
                }
            }
            else {
                if (!value35[0]) return -1
                _VALUE = value35[0];
                _VALUE = Math.round(_VALUE / _OBJECT.norm);
                return _VALUE;
            }
        }
        let _GET_USE_SELECT = () => {
            let _LIST = parkingData;
            let _COMPONENT = [];
            for (var _JSON in _LIST) {
                _COMPONENT.push(<option>{_JSON}</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _SET_OPTIONS_TYPE = (_VALUE, _INDEX, isEdit) => {
            let _SELECT = document.getElementById("r_a_35_parking_3" + isEdit)
            let _LIST = parkingData;
            let _DATA = _LIST[_VALUE];
            _SELECT.innerHTML = "";
            for (var _JSON in _DATA) {
                var _OPTION = document.createElement('option');
                _OPTION.innerHTML = _JSON;
                _SELECT.appendChild(_OPTION)
            }
            if (!_INDEX) _SET_OPTIONS_RELACION(_VALUE, 0, isEdit)
            else _SET_OPTIONS_RELACION(_VALUE, _INDEX, isEdit)
        }
        let _SET_OPTIONS_RELACION = (_VALUE, _INDEX, isEdit) => {
            if (!_GET_CHILD_2().item_267) return document.getElementById("r_a_35_parking_2" + isEdit).value = "ESTRATO INVALIDO"
            var _index = _INDEX ? _INDEX : 0;
            var _STRATA = _GET_CHILD_2().item_267;
            let _LIST = parkingData;
            let _USE = document.getElementById("r_a_35_parking_1" + isEdit).value

            var _DATA = _LIST[_USE];
            var _OBJECT = _DATA[Object.keys(_DATA)[_index]];
            let _SELECT_STR = _OBJECT.relacion_str;
            let _SELECT_VALUE = _OBJECT.relacion;
            let _SELECT_UNITS = _OBJECT.u_units;

            let _RELATION = document.getElementById("r_a_35_parking_2" + isEdit);
            _RELATION.value = _SELECT_STR[_STRATA - 1];
            let _RELATION_VALUE = document.getElementById("r_a_35_parking_4" + isEdit);
            let _UNIT_USE_VALUE = document.getElementById("r_a_35_parking_6" + isEdit);
            let _SELECT_V = document.getElementById("r_a_35_parking_3" + isEdit).value
            let _nobj = {
                use: _USE,
                type: _SELECT_V,
                norm: _SELECT_VALUE[_STRATA - 1],
            }
            let _NORM = _GET_NORM(_nobj);
            _RELATION_VALUE.value = _NORM;
            _UNIT_USE_VALUE.innerHTML = "";
            for (let i = 0; i < _SELECT_UNITS.length; i++) {
                var _OPTION = document.createElement('option');
                _OPTION.innerHTML = _SELECT_UNITS[i];
                _UNIT_USE_VALUE.appendChild(_OPTION)
            }
        }

        
        // COMPONENTS JSX
        let _COMPONENT_0 = () => {
            let UV = _GET_TOTAL_UNIS_INDEX();
            return <>
                <div className="row">
                    <div className="col-3 p-1">
                        <label>Área diferente a vivienda</label>
                        <div class="input-group">
                            <input type="number" min="0" step="0.01" class="form-control me-1" name="s_35_values"
                                defaultValue={value35[0]} onBlur={() => save_ra_35()} />
                        </div>
                    </div>
                    <div className="col-2 p-1">
                        <label>N° de viviendas</label>

                        <div class="input-group">
                            <input type="number" min="0" step="1" class="form-control me-1" name="s_35_values_2"
                                defaultValue={value35[2] || UV} onBlur={() => save_ra_35()} />
                        </div>
                    </div>
                    <div className="col-2 p-1">
                        <label>Estrato</label>
                        <div class="input-group">
                            <input type="number" min="0" step="0.01" class="form-control me-1" disabled
                                defaultValue={_GET_CHILD_2().item_267} />
                        </div>
                    </div>
                </div>
            </>

        }
        let _COMPONENT_1 = (edit) => {
            return <>
                <div className="row">
                    <input type="hidden" id="r_a_34_" />
                    <div className="col p-1">
                        <label>Uso</label>
                        <div class="input-group">
                            <select className="form-control" id={"r_a_35_parking_1" + edit} required
                                onChange={(e) => _SET_OPTIONS_TYPE(e.target.value, 0, edit)}>
                                <option value="" disabled selected>Seleccione un uso</option>
                                {_GET_USE_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-1 p-1">
                        <label>Estrato</label>
                        <div class="input-group">
                            <input type="text" class="form-control me-1" disabled defaultValue={_GET_CHILD_2().item_267} />
                        </div>
                    </div>
                    <div className="col-2 p-1">
                        <label>Tipo</label>
                        <div class="input-group">
                            <select className="form-control" id={"r_a_35_parking_3" + edit} required
                                onChange={(e) => _SET_OPTIONS_RELACION(e.target.value, e.target.selectedIndex, edit)}>
                                <option value="" disabled selected>Seleccione un uso</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-2 p-1">
                        <label>Relación</label>
                        <div class="input-group">
                            <input type="text" class="form-control me-1" id={"r_a_35_parking_2" + edit} disabled />
                        </div>
                    </div>
                    <div className="col-1 p-1">
                        <label>Norma</label>
                        <div class="input-group">
                            <input type="number" min="0" step="1" class="form-control me-1" id={"r_a_35_parking_4" + edit} />
                        </div>
                    </div>
                    <div className="col-1 p-1">
                        <label>Proyecto</label>
                        <div class="input-group">
                            <input type="number" min="0" step="1" class="form-control me-1" id={"r_a_35_parking_5" + edit} />
                        </div>
                    </div>
                    <div className="col-1 p-1">
                        <label>U. Uso</label>
                        <div class="input-group">
                            <select className="form-control" id={"r_a_35_parking_6" + edit}>
                                <option value="" disabled selected>Seleccione un uso</option>
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_1_LIST = () => {
            let _LIST = _GET_CHILD_35_PARKING();
            const columns = [
                {
                    name: <label>Uso</label>,
                    selector: 'use',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.use}</label>
                },
                {
                    name: <label>Tipo</label>,
                    selector: 'type',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '120px',
                    cell: row => <label>{row.type}</label>
                },
                {
                    name: <label>Unidad Uso</label>,
                    selector: 'pos',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '120px',
                    cell: row => <label>{row.pos}</label>
                },
                {
                    name: <label>Relación</label>,
                    selector: 'name',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.name}</label>
                },
                {
                    name: <label>Norma</label>,
                    selector: 'norm',
                    sortable: true,
                    filterable: true,
                    center: true,
                    compact: true,
                    minWidth: '40px',
                    cell: row => <label>{row.norm}</label>
                },
                {
                    name: <label>Proyecto</label>,
                    selector: 'project',
                    sortable: true,
                    filterable: true,
                    center: true,
                    compact: true,
                    minWidth: '40px',
                    cell: row => <label>{row.project}</label>
                },
                {
                    name: <label>Dif.</label>,
                    center: true,
                    compact: true,
                    minWidth: '40px',
                    cell: row => <label>{row.project - row.norm}</label>
                },
                {
                    name: <label>Observación</label>,
                    center: true,
                    compact: true,
                    minWidth: '50px',
                    cell: row => <label>{_GET_EVALUATION(row.norm, row.project)}</label>
                },
                {
                    name: <label>Evaluación</label>,
                    button: true,
                    center: true,
                    minWidth: '140px',
                    cell: row => <div class="input-group input-group-sm"><select
                        className={_GET_SELECT_COLOR_VALUE(row.check)} defaultValue={row.check ? _GET_EVALUATION(row.norm, row.project, true): 0}
                        onChange={(e) => setCheck_35_parking(row.id, e.target.value)}>
                        <option value="0" className="text-danger">NO CUMPLE</option>0
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select></div>
                },
                /**
                 *  {
                    name: <label>ESTADO</label>,
                    button: true,
                    center: true,
                    cell: row =>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setActive_35_parking(row)} />
                        </div>
                },
                 * 
                 */
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    center: true,
                    minWidth: '110px',
                    cell: row => <>
                        <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-secondary btn-sm m-0 px-2 shadow-none" onClick={() => this.setState({ edit_parking: row })}><i class="far fa-edit "></i></MDBBtn>
                        </MDBTooltip>
                        <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-danger btn-sm m-0 px-2 shadow-none" onClick={() => delete_35_parking(row.id)}><i class="far fa-trash-alt"></i></MDBBtn>
                        </MDBTooltip>
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
                dense
            />
        }
        let _COMPONENT_2 = () => {
            return <>
                <div className="row">
                    <div className="col-2">
                        <h5>Piso/Sótano</h5>
                    </div>
                    <div className="col-10">
                        <div className="row">
                            <div className="col-2 px-0">
                                <h5>D -m- (2.20*4.50)</h5>
                            </div>
                            <div className="col-2 px-0">
                                <h5>D -m- (2.50*5.00)</h5>
                            </div>
                            <div className="col-2 px-0">
                                <h5>D -m- (3.30*5.00)</h5>
                            </div>
                            <div className="col-2 px-0">
                                <h5>Carga (3.50*7.00)</h5>
                            </div>
                            <div className="col-2 px-0">
                                <h5>Motos (2.00*7.00)</h5>
                            </div>
                            <div className="col-2 px-0">
                                <h5>Bicicletas (0.50*2.50)</h5>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                        <div class="input-group">
                            <input type="text" class="form-control me-1" id="r_a_35_location_1" />
                        </div>
                    </div>
                    <div className="col-10">
                        <div className="row">
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions"
                                        defaultValue="0" required />
                                </div>
                            </div>
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions"
                                        defaultValue="0" required />
                                </div>
                            </div>
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions"
                                        defaultValue="0" required />
                                </div>
                            </div>
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions"
                                        defaultValue="0" required />
                                </div>
                            </div>
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions"
                                        defaultValue="0" required />
                                </div>
                            </div>
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions"
                                        defaultValue="0" required />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_2_EDIT = () => {
            return <>
                <div className="row">
                    <div className="col-2">
                        <h5>Piso/Sótano</h5>
                    </div>
                    <div className="col-10">
                        <div className="row">
                            <div className="col-2 px-0">
                                <h5>D -m- (2.20*4.50)</h5>
                            </div>
                            <div className="col-2 px-0">
                                <h5>D -m- (2.50*5.00)</h5>
                            </div>
                            <div className="col-2 px-0">
                                <h5>D -m- (3.30*5.00)</h5>
                            </div>
                            <div className="col-2 px-0">
                                <h5>Carga (3.50*7.00)</h5>
                            </div>
                            <div className="col-2 px-0">
                                <h5>Motos (2.00*7.00)</h5>
                            </div>
                            <div className="col-2 px-0">
                                <h5>Bicicletas (0.50*2.50)</h5>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                        <div class="input-group">
                            <input type="text" class="form-control me-1" id="r_a_35_location_1_edit" />
                        </div>
                    </div>
                    <div className="col-10">
                        <div className="row">
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions_edit"
                                        defaultValue="0" required />
                                </div>
                            </div>
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions_edit"
                                        defaultValue="0" required />
                                </div>
                            </div>
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions_edit"
                                        defaultValue="0" required />
                                </div>
                            </div>
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions_edit"
                                        defaultValue="0" required />
                                </div>
                            </div>
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions_edit"
                                        defaultValue="0" required />
                                </div>
                            </div>
                            <div className="col-2 px-0">
                                <div class="input-group">
                                    <input type="number" min="0" step="1" class="form-control me-1" name="r_a_35_parking_dientions_edit"
                                        defaultValue="0" required />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_2_LIST = () => {
            let _LIST = _GET_CHILD_35_LOCATION();
            const columns = [
                {
                    name: <label>Piso / Sótano</label>,
                    selector: 'floor',
                    sortable: true,
                    filterable: true,
                    center: true,
                    compact: true,
                    minWidth: '50px',
                    cell: row => <label>{row.floor}</label>
                },
                {
                    name: <label>D -m- (2.20*4.50)</label>,
                    center: true,
                    compact: true,
                    minWidth: '50px',
                    cell: row => <label>{_GET_LOCATION_INDEX(row.diensions, 0)}</label>
                },
                {
                    name: <label>D -m- (2.50*5.00)</label>,
                    center: true,
                    compact: true,
                    minWidth: '50px',
                    cell: row => <label>{_GET_LOCATION_INDEX(row.diensions, 1)}</label>
                },
                {
                    name: <label>D -m- (3.30*5.00)</label>,
                    center: true,
                    compact: true,
                    minWidth: '50px',
                    cell: row => <label>{_GET_LOCATION_INDEX(row.diensions, 2)}</label>
                },
                {
                    name: <label>Total</label>,
                    center: true,
                    compact: true,
                    minWidth: '50px',
                    cell: row => <label className="text-success">{parseInt(_GET_LOCATION_INDEX(row.diensions, 1)) + parseInt(_GET_LOCATION_INDEX(row.diensions, 2)) + parseInt(_GET_LOCATION_INDEX(row.diensions, 0))}</label>
                },
                {
                    name: <label>Carga (3.50*7.00)</label>,
                    center: true,
                    compact: true,
                    minWidth: '50px',
                    cell: row => <label>{_GET_LOCATION_INDEX(row.diensions, 3)}</label>
                },
                {
                    name: <label>Motos (2.00*7.00)</label>,
                    center: true,
                    compact: true,
                    minWidth: '50px',
                    cell: row => <label>{_GET_LOCATION_INDEX(row.diensions, 4)}</label>
                },
                {
                    name: <label>Bicicletas (0.50*2.50)</label>,
                    center: true,
                    compact: true,
                    minWidth: '50px',
                    cell: row => <label>{_GET_LOCATION_INDEX(row.diensions, 5)}</label>
                },
                {
                    name: <label>Evaluación</label>,
                    button: true,
                    center: true,
                    minWidth: '140px',
                    cell: row => <div class="input-group input-group-sm"><select
                        className={_GET_SELECT_COLOR_VALUE(row.check)} defaultValue={row.check}
                        onChange={(e) => setCheck_35_location(row.id, e.target.value)}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select></div>
                },
                /**
                 *  {
                    name: <label>ESTADO</label>,
                    button: true,
                    center: true,
                    cell: row =>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setActive_35_location(row)} />
                        </div>
                },
                 */

                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    center: true,
                    minWidth: '120px',
                    cell: row => <>
                        <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-secondary btn-sm m-0 px-2 shadow-none" onClick={() => this.setState({ edit_location: row })}><i class="far fa-edit"></i></MDBBtn>
                        </MDBTooltip>
                        <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-danger btn-sm m-0 px-2 shadow-none" onClick={() => delete_35_location(row.id)}><i class="far fa-trash-alt"></i></MDBBtn>
                        </MDBTooltip>
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
                dense
            />
        }
        let _COMPONENT_2_TOTALS = () => {
            let _TOTALS = _GET_LOCATION_PERCENTAGES();
            function get_percentage(_value) {
                let _RESULT = (_value / (_TOTALS[0] + _TOTALS[1] + _TOTALS[2]) * 100);
                if (_RESULT) return _RESULT;
                else return 0;
            }

            return <>
                <div className="row border">
                    <div className="col-2 p-1">
                        <label></label>
                    </div>
                    <div className="col-10 p-1">
                        <div className="row">
                            <div className="col p-1 text-center">
                                <label className="fw-bold">D -m- (2.20*4.50)</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label className="fw-bold">D -m- (2.50*5.00)</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label className="fw-bold">D -m- (3.30*5.00)</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label className="fw-bold">D -m- (Totales)</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label className="fw-bold">Carga (3.50*7.00)</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label className="fw-bold">Motos (2.00*7.00)</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label className="fw-bold">Bicicletas (0.50*2.50)</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row border">
                    <div className="col-2 p-1">
                        <label className="fw-bold">Totales</label>
                    </div>
                    <div className="col-10 p-1">
                        <div className="row">
                            <div className="col p-1 text-center">
                                <label>{_TOTALS[0]}</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label>{_TOTALS[1]}</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label>{_TOTALS[2]}</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label>{(_TOTALS[0] + _TOTALS[1] + _TOTALS[2])}</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label>{_TOTALS[3]}</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label>{_TOTALS[4]}</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label>{_TOTALS[5]}</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row border">
                    <div className="col-2 p-1">
                        <label className="fw-bold">Porcentajes</label>
                    </div>
                    <div className="col-10 p-1">
                        <div className="row">
                            <div className="col p-1 text-center">
                                <label>{get_percentage(_TOTALS[0]).toFixed(2)}%</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label>{get_percentage(_TOTALS[1]).toFixed(2)}%</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label>{get_percentage(_TOTALS[2]).toFixed(2)}%</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label>{get_percentage(_TOTALS[0] + _TOTALS[1] + _TOTALS[2]).toFixed(2)}%</label>
                            </div>
                            <div className="col p-1 text-center">
                                <label></label>
                            </div>
                            <div className="col p-1 text-center">
                                <label></label>
                            </div>
                            <div className="col p-1 text-center">
                                <label></label>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_3 = () => {
            const _CHECK_ARRAY = check35;
            const _LIST = [
                { c: 0, desc: 'Se localalizan dentro de paramento de construccion' },
                { c: 1, desc: 'Separados fisicamente de zona de actividad: C, D e I' },
                { c: 2, desc: 'Parqueo movilidad reducida (PMR) 2% del total de cupos' },
                { c: 3, desc: 'PMR esta señalizado y presenta dimensiones normativas' },
                { c: 4, desc: 'Parqueo sin servidumbre (Excepto vivienda estrato 6)' },
                { c: 5, desc: 'Parqueo indentificado como residente o visitante' },
                { c: 6, desc: 'Uso de equipos mecánico o hidraúlico plan de movilidad' },
                {
                    desc: 'Rampa', className: 'text-center fw-bold',
                    items: [
                        { v: 10, desc: 'Acceso a parqueaderos >= 5,00 / 3,00m en ingreso nivel', options: ['NO', 'SI', 'NA'] },
                        { v: 11, desc: 'Vias internas del parqeadero 5,00m', options: ['NO', 'SI', 'NA'] },
                        { v: 12, desc: 'Ancho de la rampa mínimo 5,00 y máximo 7,00m', options: ['NO', 'SI', 'NA'] },
                        { v: 13, desc: 'Pendiente de rampa máximo 18%', options: ['NO', 'SI', 'NA'] },
                        { v: 14, desc: 'Radio de giro interior de la rampa igual a 5,00m', options: ['NO', 'SI', 'NA'] },
                        { v: 15, desc: 'Rampa dentro del paramento de la construcción', options: ['NO', 'SI', 'NA'] },
                        { v: 16, desc: 'Rampa despues del antejardin', options: ['NO', 'SI', 'NA'] },
                        { v: 17, desc: 'Rampa en aislamiento lateroal o posterior h <= 1,40m', options: ['NO', 'SI', 'NA'] },
                    ]
                },
                {
                    desc: 'Forma de Provisión de cupos de Parqueadero', className: 'text-center fw-bold',
                    items: [
                        { v: 3, desc: 'En el sitio', options: ['NO', 'SI', 'NA'], },
                        { v: 4, desc: 'Compensación', options: false, c: 7, },
                        { v: 5, desc: 'Gestión asociada', options: false, c: 8, },
                    ]
                },
                {
                    desc: 'Excepciones exigencia cupos de parqueadero al momento del licenciamiento', className: 'text-center fw-bold',
                    items: [
                        { v: 6, desc: 'Bien de interes cultural', options: ['NO', 'SI', 'NA'] },
                        { v: 7, desc: 'Predio uso residencial rodeado de vias peatonales', options: ['NO', 'SI', 'NA'] },
                        { v: 8, desc: 'VIP y VIS unifamiliar en predio individual en estratos 1 y 2', options: ['NO', 'SI', 'NA'] },
                        { v: 9, desc: 'Acto de reconocimiento y licencia de modificación', options: ['NO', 'SI', 'NA'] },
                    ]
                },
            ]
            return _LIST.map((item, i) => {
                return <>
                    <div className="row border">
                        <div className="col">
                            <div className={item.className ?? ''}>
                                <label>{item.desc}</label>
                            </div>
                        </div>

                        {item.items ?
                            <>  <div className='col-8'>
                                {item.items.map((it, j) => {
                                    return <>
                                        <div className='row'>
                                            <div className="col"><label>{it.desc}</label> </div>
                                            {it.v != undefined ?
                                                <div className="col-3">
                                                    {it.options ?
                                                        <>
                                                            <select className={_GET_SELECT_COLOR_VALUE(value35[it.v])}
                                                                name="s_35_values_n" id={"s_35_values_n_" + it.v}
                                                                onChange={() => save_ra_35()} defaultValue={value35[it.v]} >
                                                                {it.options.map(op => <option className>{op}</option>)}
                                                            </select>
                                                        </>
                                                        : <>
                                                            <input type="text" class="form-control form-control-sm" name="s_35_values_n" id={"s_35_values_n_" + it.v}
                                                                defaultValue={value35[it.v]} onBlur={() => save_ra_35(false)} />
                                                        </>}
                                                </div>
                                                : ''}
                                            {it.c != undefined ?
                                                <div className="col-3">
                                                    <select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[it.c])}
                                                        name="s_35_checks_n" id={"s_35_checks_n_" + it.c}
                                                        onChange={() => save_ra_35()} defaultValue={_CHECK_ARRAY[it.c]} >
                                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                                        <option value="1" className="text-success">CUMPLE</option>
                                                        <option value="2" className="text-warning">NO APLICA</option>
                                                    </select>
                                                </div>
                                                : ''}
                                        </div>

                                    </>
                                })}

                            </div>
                            </>

                            : ''}
                        {item.c != undefined ?
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item.c])}
                                    name="s_35_checks_n" id={"s_35_checks_n_" + item.c}
                                    onChange={() => save_ra_35()} defaultValue={_CHECK_ARRAY[item.c]} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">NO APLICA</option>
                                </select>
                            </div>
                            : ''}
                    </div>

                </>
            })
        }
        let _COMPONENT_CORRECTIONS = () => {
            return <div className="row">
                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Observaciones parqueaderos</label>
                    </div>
                </div>

                <textarea className="input-group" maxLength="2000" name="s_35_values" rows="4"
                    defaultValue={value35[1]} onBlur={() => save_ra_35()}></textarea>
                <label>(máximo 2000 caracteres)</label>
            </div>
        }
        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();

        let save_ra_35 = (e) => {
            if (e) e.preventDefault();

            let checks = [];
            let values = [];

            formData = new FormData();

            var dom;

            var values_html = document.getElementsByName('s_35_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value.replaceAll(';', ','))
            }

            var values_html = document.getElementsByName('s_35_values_2');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value.replaceAll(';', ','))
            }

            var checks_html = document.getElementsByName('s_35_checks_n');
            for (var i = 0; i < checks_html.length; i++) {
                dom = document.getElementById('s_35_checks_n_' + i).value;
                checks.push(dom)
            }
            formData.set('check', checks.join(';'));

            let offset = values.length;
            var values_html = document.getElementsByName('s_35_values_n');
            for (var i = 0; i < values_html.length; i++) {
                let pos = offset + i;
                dom = document.getElementById('s_35_values_n_' + pos).value;
                values.push(dom)
            }

            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's35');

            save_step('s35', false, formData);

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

        let new_ra_35_parking = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('recordArcId', currentRecord.id);
            formData.set('active', 1);

            let use = document.getElementById("r_a_35_parking_1").value;
            formData.set('use', use);
            let name = document.getElementById("r_a_35_parking_2").value;
            formData.set('name', name);
            let type = document.getElementById("r_a_35_parking_3").value;
            formData.set('type', type);
            let norm = document.getElementById("r_a_35_parking_4").value;
            formData.set('norm', norm);
            let project = document.getElementById("r_a_35_parking_5").value;
            formData.set('project', project);
            let pos = document.getElementById("r_a_35_parking_6").value;
            formData.set('pos', pos);

            RECORD_ARCSERVICE.create_arc_35_parking(formData)
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
                        document.getElementById("form_ra_35_parking").reset();
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
        let edit_ra_35_parking = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('recordArcId', currentRecord.id);

            let use = document.getElementById("r_a_35_parking_1_edit").value;
            formData.set('use', use);
            let name = document.getElementById("r_a_35_parking_2_edit").value;
            formData.set('name', name);
            let type = document.getElementById("r_a_35_parking_3_edit").value;
            formData.set('type', type);
            let norm = document.getElementById("r_a_35_parking_4_edit").value;
            formData.set('norm', norm);
            let project = document.getElementById("r_a_35_parking_5_edit").value;
            formData.set('project', project);
            let pos = document.getElementById("r_a_35_parking_6_edit").value;
            formData.set('pos', pos);

            RECORD_ARCSERVICE.update_arc_35_parking(this.state.edit_parking.id, formData)
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
                        this.setState({ edit_parking: false });
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
        let delete_35_parking = (id) => {
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
                    RECORD_ARCSERVICE.delete_35_parking(id)
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
                                this.setState({ edit_parking: false });;
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
        let setActive_35_parking = (item) => {
            formData = new FormData();
            let id = item.id
            let active = item.active;
            active = active == 1 ? 0 : 1;
            formData.set('active', active);
            RECORD_ARCSERVICE.update_arc_35_parking(id, formData)
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
        let setCheck_35_parking = (id, value) => {
            formData = new FormData();
            formData.set('check', value);
            RECORD_ARCSERVICE.update_arc_35_parking(id, formData)
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

        let new_ra_35_location = (e) => {
            e.preventDefault();
            //return console.log(currentRecord.id)
            formData = new FormData();
            formData.set('recordArcId', currentRecord.id);
            formData.set('active', 1);

            let floor = document.getElementById("r_a_35_location_1").value;
            formData.set('floor', floor);
            var diensions = []
            let array = document.getElementsByName("r_a_35_parking_dientions");
            for (var i = 0; i < array.length; i++) {
                diensions.push(array[i].value)
            }
            formData.set('diensions', diensions.join());

            RECORD_ARCSERVICE.create_arc_35_location(formData)
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
                        document.getElementById("form_ra_35_location").reset();
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
        let edit_ra_35_location = (e) => {
            e.preventDefault();
            formData = new FormData();
            //formData.set('recordArcId', currentRecord.id);

            let floor = document.getElementById("r_a_35_location_1_edit").value;
            formData.set('floor', floor);
            var diensions = []
            let array = document.getElementsByName("r_a_35_parking_dientions_edit");
            for (var i = 0; i < array.length; i++) {
                diensions.push(array[i].value)
            }
            formData.set('diensions', diensions.join());

            RECORD_ARCSERVICE.update_arc_35_location(this.state.edit_location.id, formData)
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
                        this.setState({ edit_location: false });
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
        let delete_35_location = (id) => {
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
                    RECORD_ARCSERVICE.delete_35_location(id)
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
                                this.setState({ edit_location: false });
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
        let setActive_35_location = (item) => {
            formData = new FormData();
            let id = item.id
            let active = item.active;
            active = active == 1 ? 0 : 1;
            formData.set('active', active);
            RECORD_ARCSERVICE.update_arc_35_location(id, formData)
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
        let setCheck_35_location = (id, value) => {
            formData = new FormData();
            formData.set('check', value);

            RECORD_ARCSERVICE.update_arc_35_location(id, formData)
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
        return (
            <div className="record_arc_32 container">


                <h3 className="py-3" >3.5.1 Cupos en Sitio</h3>
                {_COMPONENT_0()}

                <div class="form-check ms-5 my-3">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new_parking: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Añadir Nuevo Parqueadero
                    </label>
                </div>

                {this.state.new_parking
                    ? <form id="form_ra_35_parking" onSubmit={new_ra_35_parking}>
                        {_COMPONENT_1('')}
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> AÑADIR PARQUEADERO
                            </button>
                        </div>
                    </form>
                    : ""}
                {_COMPONENT_1_LIST()}
                {this.state.edit_parking
                    ? <form id="form_ra_35_parking_edit" onSubmit={edit_ra_35_parking}>
                        <h3 className="my-3 text-center">Actualizar Parqueadero</h3>
                        {_COMPONENT_1('_edit')}
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                            </button>
                        </div>
                    </form>
                    : ""}

                <h3 className="py-3" >3.5.2 Cuadro de Localizacion de Parqueadero de dimensiones libres de estructuras</h3>
                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new_location: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Añadir Nueva localizacion de parqueadero
                    </label>
                </div>

                {this.state.new_location
                    ? <form id="form_ra_35_location" onSubmit={new_ra_35_location}>
                        {_COMPONENT_2()}
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> AÑADIR LOCALIZACION
                            </button>
                        </div>
                    </form>
                    : ""}
                {_COMPONENT_2_LIST()}
                {this.state.edit_location
                    ? <form id="form_ra_35_location_edit" onSubmit={edit_ra_35_location}>
                        <h3 className="my-3 text-center">Actualizar Localizacion</h3>
                        {_COMPONENT_2_EDIT()}
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                            </button>
                        </div>
                    </form>
                    : ""}
                <div className="py-3">
                    {_COMPONENT_2_TOTALS()}
                </div>

                <h3 className="py-3" >3.5.3 Parámetro de revisión parqueaderos en sitio</h3>
                {_COMPONENT_3()}

                <h3 className="py-3" >3.5.4 Observaciones: Parqueaderos</h3>
                {_COMPONENT_CORRECTIONS()}
            </div >
        );
    }
}

export default RECORD_ARC_35;