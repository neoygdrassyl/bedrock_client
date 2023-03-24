import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_LAW_SERVICE from '../../../../services/record_law.service'

import { dateParser } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';
const MySwal = withReactContent(Swal);

class RECORD_LAW_GEN2_11 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            new: false,
            edit: false,
            new_tax: false,
            edit_tax: false,
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            var _ITEM = this.state.edit;

            document.getElementById("r_lg_liberty_1_edit").value = _ITEM.id_public;
            document.getElementById("r_lg_liberty_2_edit").value = _ITEM.date;
            document.getElementById("r_lg_liberty_3_edit").value = _ITEM.predial;
            document.getElementById("r_lg_liberty_32_edit").value = _ITEM.predial_2;
            document.getElementById("r_lg_liberty_4_edit").value = _ITEM.address;
            document.getElementById("r_lg_liberty_6_edit").value = _ITEM.lastnotify;
            document.getElementById("r_lg_liberty_7_edit").value = _ITEM.specify;
            document.getElementById("r_lg_liberty_8_edit").value = _ITEM.subject;
            document.getElementById("r_lg_liberty_9_edit").value = _ITEM.subject_id;
            document.getElementById("r_lg_liberty_10_edit").value = _ITEM.desc;
            document.getElementById("r_lg_liberty_11_edit").value = _ITEM.id_6;

            let boundary = _ITEM.boundary;
            var array = [];
            if (boundary) {
                array = boundary.split(',')
            }
            document.getElementById("r_lg_liberty_51_edit").value = array[0];
            document.getElementById("r_lg_liberty_52_edit").value = array[1];
            document.getElementById("r_lg_liberty_53_edit").value = array[2];
            document.getElementById("r_lg_liberty_54_edit").value = array[3];
            document.getElementById("r_lg_liberty_55_edit").value = array[4];
        }
        if (this.state.edit_tax !== prevState.edit_tax && this.state.edit_tax != false) {
            var _ITEM = this.state.edit_tax;

            document.getElementById("r_lg_tax_1_edit").value = _ITEM.id_public;
            document.getElementById("r_lg_tax_2_edit").value = _ITEM.date;
            document.getElementById("r_lg_tax_3_edit").value = _ITEM.predial;
            document.getElementById("r_lg_tax_32_edit").value = _ITEM.predial_2;
            document.getElementById("r_lg_tax_4_edit").value = _ITEM.address;
            document.getElementById("r_lg_tax_5_edit").value = _ITEM.strata;
            document.getElementById("r_lg_tax_6_edit").value = _ITEM.destiny;
            document.getElementById("r_lg_tax_7_edit").value = _ITEM.id_6;
            document.getElementById("r_lg_tax_8_edit").value = _ITEM.type;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_2 = () => {
            var _CHILD = currentItem.fun_2 ?? {};
            var _CHILD_VARS = {};
            if (_CHILD) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.direccion = _CHILD.direccion;
                _CHILD_VARS.direccion_ant = _CHILD.direccion_ant;
                _CHILD_VARS.matricula = _CHILD.matricula;
                _CHILD_VARS.catastral = _CHILD.catastral;
                _CHILD_VARS.catastral_2 = _CHILD.catastral_2;
                _CHILD_VARS.suelo = _CHILD.suelo; // PARSER
                _CHILD_VARS.lote_pla = _CHILD.lote_pla;// PARSER

                _CHILD_VARS.barrio = _CHILD.barrio;
                _CHILD_VARS.vereda = _CHILD.vereda;
                _CHILD_VARS.comuna = _CHILD.comuna;
                _CHILD_VARS.sector = _CHILD.sector;
                _CHILD_VARS.corregimiento = _CHILD.corregimiento;
                _CHILD_VARS.lote = _CHILD.lote;
                _CHILD_VARS.estrato = _CHILD.estrato;
                _CHILD_VARS.manzana = _CHILD.manzana;
            }
            return _CHILD;
        }
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_11_LIBERTY = () => {
            var _CHILD = currentRecord.record_law_11_liberties;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_11_TAX = () => {
            var _CHILD = currentRecord.record_law_11_taxes;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _PARSE_AREAS = (_item) => {
            if (!_item) return "";
            var _array = _item.split(",");
            return <>
                <label className="mx-1">N: {_array[0]}</label>
                <label className="mx-1">S: {_array[1]}</label>
                <label className="mx-1">Or: {_array[2]}</label>
                <label className="mx-1">Oc: {_array[3]}</label>
            </>
        }
        let _PARSE_M = (_item) => {
            if (!_item) return "";
            var _array = _item.split(",");
            var m = _array[4];
            if (m) return <label className="mx-1">{m}m<sup>2</sup></label>
            return <label className="fw-bold text-danger">NO HAY AREA</label>
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_law_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ?? []
            if (!value.length) return [];
            value = value.split(';');
            return value
        }
        // DATA CONVERTERS
        let _CHILD_6_SELECT = () => {
            let _LIST = _GET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _FIND_6 = (_ID) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }
        let _REGEX_PREDIAL = (e) => {
            let regex = /^[0-9]+$/i;
            let _value = e.target.value
            let _id = e.target.id
            let test = regex.test(_value);
            if (test) {
                var _new_value = "";
                if (_value.length == 15) {
                    _new_value += _value.substring(0, 2);
                    _new_value += "-";
                    _new_value += _value.substring(2, 4);
                    _new_value += "-";
                    _new_value += _value.substring(4, 8);
                    _new_value += "-";
                    _new_value += _value.substring(8, 12);
                    _new_value += "-";
                    _new_value += _value.substring(12, 15);
                    document.getElementById(_id).value = _new_value;
                } else document.getElementById(_id).value = _value;
            } else {
                document.getElementById(_id).value = _value.slice(0, _value.length - 1);
            }
        }
        let _REGEX_MATRICULA = (e) => {
            let _keyPressed = e.key;
            let regex = /^[0-9]+$/i;
            let _value = e.target.value;
            let _id = e.target.id
            let test = regex.test(_keyPressed);
            if (test) {
                var _new_value = "";
                if (_value.length == 4) {
                    _new_value += _value.substring(0, 3);
                    _new_value += "-";
                    _new_value += _value.substring(3, _value.length + 1);
                    document.getElementById(_id).value = _new_value;
                } else document.getElementById(_id).value = _value;
            } else {
                document.getElementById(_id).value = _value.slice(0, _value.length - 1);
            }
        }
        let _REGEX_IDNUMBER = (e) => {
            let regex = /^[0-9]+$/i;
            let test = regex.test(e.target.value);
            if (test) {
                var _value = Number(e.target.value).toLocaleString();
                _value = _value.replaceAll(',', '.');
                document.getElementById(e.target.id).value = _value;
            }
        }
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (!_VALUE) {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == 0) {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == 1) {
                return 'form-select text-success form-control form-control-sm';
            }
            if (_VALUE == 2) {
                return 'form-select text-warning form-control form-control-sm';
            } else {
                return 'form-select form-control form-control-sm';
            }
        }
        // COMPONENT JSX
        let _CHILD_LIBERTY_LIST = () => {
            let _LIST = _GET_CHILD_11_LIBERTY();
            const columns = [
                {
                    name: <label>MATRICULAR</label>,
                    selector: 'id_public',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.id_public}</label>
                },
                {
                    name: <label>FECHA</label>,
                    selector: 'date',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{dateParser(row.date)}</label>
                },
                {
                    name: <label>CODIGO CATASTRAL</label>,
                    selector: 'predial',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.predial}</label>
                },
                {
                    name: <label>DIRECCION</label>,
                    selector: 'address',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label >{row.address}</label>
                },
                {
                    name: <label>CABIDA</label>,
                    center: true,
                    cell: row => <label >{_PARSE_M(row.boundary)}</label>
                },
                {
                    name: <label>LINDEROS</label>,
                    center: true,
                    cell: row => <label >{_PARSE_AREAS(row.boundary)}</label>
                },
                {
                    name: <label>ULTIMA ANOTACION</label>,
                    center: true,
                    cell: row => <label >{row.lastnotify}</label>
                },
                {
                    name: <label>ESPECIFICACION</label>,
                    center: true,
                    cell: row => <label >{row.specify}</label>
                },
                {
                    name: <label>TITULAR DERECHO REAL</label>,
                    selector: 'subject',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label >{row.subject}</label>
                },
                {
                    name: <label>CEDULA TITULAR</label>,
                    selector: 'subject_id',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label >{row.subject_id}</label>
                },
                {
                    name: <label>ANOTACIONES</label>,
                    center: true,
                    cell: row => <label >{row.desc}</label>
                },
                {
                    name: <label>DOCUMENTO</label>,
                    center: true,
                    cell: row => <>{row.id_6 > 0
                        ?
                        <VIZUALIZER url={_FIND_6(row.id_6).path + "/" + _FIND_6(row.id_6).filename}
                            apipath={'/files/'} />
                        : ""}</>
                },
                {
                    name: <label>ACCION</label>,
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-secondary m-0 p-2 shadow-none" onClick={() => this.setState({ edit: row })}>
                                <i class="far fa-edit fa-2x"></i></MDBBtn>
                        </MDBTooltip>
                        <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-danger btn-sm m-0 p-2 shadow-none" onClick={() => delete_gen(row.id)}><i class="far fa-trash-alt fa-2x"></i></MDBBtn>
                        </MDBTooltip>

                    </>
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
        let _COMPONENT_NEW_LIBERTY = () => {
            let f2 = _GET_CHILD_2();
            return <>
                <div className="row mb-1">

                    <div className="col-4">
                        <label>Matrícula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_1" onKeyPress={(e) => _REGEX_MATRICULA(e)}
                                defaultValue={f2.matricula} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Fecha</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-times"></i>

                            </span>
                            <input type="date" max="2100-01-01" class="form-control" id="r_lg_liberty_2" />

                        </div>
                    </div>
                    <div className="col-4">
                        <label>Código Predial/Catastral (Viejo)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_3" defaultValue={f2.catastral} />
                        </div>
                        <label>Código Predial/Catastral (Nuevo 30 dígitos)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_32" defaultValue={f2.catastral_2} />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-4 mt-4">
                        <label>Dirección</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_4" defaultValue={f2.direccion} />
                        </div>
                    </div>
                    <div className="col-8">
                        <div className="row mx-0">
                            <label>Cabida y linderos (m<sup>2</sup>)</label>
                            <div className="col-2 mx-0 px-0">
                                <label>Metros</label>
                                <input type="number" min="0" step="0.01" class="form-control mx-0" id="r_lg_liberty_55" />
                            </div>
                            <div className="col-2 mx-0 px-0">
                                <label>Norte</label>
                                <input type="number" min="0" step="0.01" class="form-control mx-0 " id="r_lg_liberty_51" />
                            </div>
                            <div className="col-2 mx-0 px-0">
                                <label>Sur</label>
                                <input type="number" min="0" step="0.01" class="form-control mx-0" id="r_lg_liberty_52" />
                            </div>
                            <div className="col-2 mx-0 px-0">
                                <label>Oriente</label>
                                <input type="number" min="0" step="0.01" class="form-control mx-0" id="r_lg_liberty_53" />
                            </div>
                            <div className="col-2 mx-0 px-0">
                                <label>Occidente</label>
                                <input type="number" min="0" step="0.01" class="form-control mx-0" id="r_lg_liberty_54" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-4">
                        <label>Última anotación</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_6" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Especificación</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_7" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Titular Derecho Real (Separar varios con coma (,))</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_8" />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-4">
                        <label>Documento Titular (Separar varios con coma (,))</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_9" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Anotaciones Urbanas</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_10" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Relacionar Documento</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-paperclip"></i>
                            </span>
                            <select className='form-select' id="r_lg_liberty_11">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_EDIT_LIBERTY = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-4">
                        <label>Matricula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_1_edit" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Fecha</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-times"></i>

                            </span>
                            <input type="date" max="2100-01-01" class="form-control" id="r_lg_liberty_2_edit" />

                        </div>
                    </div>
                    <div className="col-4">
                        <label>Codigo Catastral (Viejo)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_3_edit" />
                        </div>
                        <label>Código Predial/Catastral (Nuevo 30 dígitos)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_32_edit" />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-4 mt-4">
                        <label>Direccion</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_4_edit" />
                        </div>
                    </div>
                    <div className="col-8">
                        <div className="row mx-0">
                            <label>Cabida y linderos (m<sup>2</sup>)</label>
                            <div className="col-2 mx-0 px-0">
                                <label>Metros</label>
                                <input type="number" min="0" step="0.01" class="form-control mx-0" id="r_lg_liberty_55_edit" />
                            </div>
                            <div className="col-2 mx-0 px-0">
                                <label>Norte</label>
                                <input type="number" min="0" step="0.01" class="form-control mx-0" id="r_lg_liberty_51_edit" />
                            </div>
                            <div className="col-2 mx-0 px-0">
                                <label>Sur</label>
                                <input type="number" min="0" step="0.01" class="form-control mx-0" id="r_lg_liberty_52_edit" />
                            </div>
                            <div className="col-2 mx-0 px-0">
                                <label>Oriente</label>
                                <input type="number" min="0" step="0.01" class="form-control mx-0" id="r_lg_liberty_53_edit" />
                            </div>
                            <div className="col-2 mx-0 px-0">
                                <label>Occidente</label>
                                <input type="number" min="0" step="0.01" class="form-control mx-0" id="r_lg_liberty_54_edit" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-4">
                        <label>Ultima anoatacion</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_6_edit" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Especificacion</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_7_edit" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Titilar Derecho Real (Separar varios con coma (,))</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_8_edit" />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-4">
                        <label>Documento Titular (Separar varios con coma (,))</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_9_edit" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Anotaciones Urbanas</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_liberty_10_edit" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Relacionar Documento</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-paperclip"></i>
                            </span>
                            <select className='form-select' id="r_lg_liberty_11_edit">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _CHILD_TAX_LIST = () => {
            let _LIST = _GET_CHILD_11_TAX();
            const columns = [
                {
                    name: <label>TIPO DOCUMENTO</label>,
                    selector: 'type',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.type}</label>
                },
                {
                    name: <label>No. RECIBO</label>,
                    selector: 'id_public',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.id_public}</label>
                },
                {
                    name: <label>FECHA</label>,
                    selector: 'date',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{dateParser(row.date)}</label>
                },
                {
                    name: <label>CODIGO CATASTRAL</label>,
                    selector: 'predial',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.predial}</label>
                },
                {
                    name: <label>DIRECCION</label>,
                    selector: 'address',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label >{row.address}</label>
                },
                {
                    name: <label>ESTRATO</label>,
                    center: true,
                    cell: row => <label >{row.strata}</label>
                },
                {
                    name: <label>DESTINO</label>,
                    center: true,
                    cell: row => <label >{row.destiny}</label>
                },
                {
                    name: <label>DOCUMENTO</label>,
                    center: true,
                    cell: row => <>{row.id_6 > 0
                        ?
                        <VIZUALIZER url={_FIND_6(row.id_6).path + "/" + _FIND_6(row.id_6).filename}
                            apipath={'/files/'} />
                        : ""}</>
                },
                {
                    name: <label>ACCION</label>,
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-secondary m-0 p-2 shadow-none" onClick={() => this.setState({ edit_tax: row })}><i class="far fa-edit fa-2x"></i></MDBBtn>
                        </MDBTooltip>
                        <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-danger m-0 p-2 shadow-none" onClick={() => delete_tax(row.id)}><i class="far fa-trash-alt fa-2x"></i></MDBBtn>
                        </MDBTooltip>
                    </>
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
        let _COMPONENT_NEW_TAX = () => {
            let f2 = _GET_CHILD_2();
            return <>
                <div className="row mb-1">
                    <div className="col-4">
                        <label>Tipo de Documento</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-file-invoice"></i>
                            </span>
                            <select className='form-select' id="r_lg_tax_8">
                                <option>Declaración privada impuesto predial</option>
                                <option>Estado de cuenta impuesto predial</option>
                                <option>Certificado de estratificación</option>
                                <option>Boletín de nomenclatura</option>
                                <option>Escritura pública</option>
                                <option>Plano georreferenciado</option>
                                <option>Otros</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-4">
                        <label>No. de Recibo</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_tax_1" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Fecha</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-times"></i>
                            </span>
                            <input type="date" max="2100-01-01" class="form-control" id="r_lg_tax_2" require />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-4">
                        <label>Código Predial/Catastral (Viejo)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_tax_3" defaultValue={f2.catastral} />
                        </div>
                        <label>Código Predial/Catastral (Nuevo 30 dígitos)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_tax_32" defaultValue={f2.catastral_2} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Dirección</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_tax_4" defaultValue={f2.direccion} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Estrato</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="number" min="1" max="6" step="1" class="form-control" id="r_lg_tax_5" defaultValue={f2.estrato} />
                        </div>
                    </div>

                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>Destino</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_tax_6" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>Relacionar Documento</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-paperclip"></i>
                            </span>
                            <select className='form-select' id="r_lg_tax_7">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_EDIT_TAX = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-4">
                        <label>Tipo de Documento</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-file-invoice"></i>
                            </span>
                            <select className='form-select' id="r_lg_tax_8_edit">
                                <option>Declaración privada impuesto predial</option>
                                <option>Estado de cuenta impuesto predial</option>
                                <option>Certificado de estratificación</option>
                                <option>Boletín de nomenclatura</option>
                                <option>Escritura pública</option>
                                <option>Plano georreferenciado</option>
                                <option>Otros</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Nr. de Recibo</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_tax_1_edit" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Fecha</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-times"></i>
                            </span>
                            <input type="date" max="2100-01-01" class="form-control" id="r_lg_tax_2_edit" require />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-4">
                        <label>Codigo Predial/Catastral (Viejo)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_tax_3_edit" />
                        </div>
                        <label>Código Predial/Catastral (Nuevo 30 dígitos)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_tax_32_edit" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Direccion</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_tax_4_edit" />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Estrato</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="number" min="1" max="6" step="1" class="form-control" id="r_lg_tax_5_edit" />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-6">
                        <label>Destino</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="text" class="form-control" id="r_lg_tax_6_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>Relacionar Documento</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-paperclip"></i>
                            </span>
                            <select className='form-select' id="r_lg_tax_7_edit">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_CHECK_1 = () => {
            const _CHECK_ARRAY = _GET_STEP_TYPE('sc1', 'check');
            const _LIST = {
                "0": { desc: "Cumple tiempo solicitado en el Decreto 1077 de 2015." },
                "1": {
                    desc: "Presenta anotación sobre: Bien de interés cultural BIC", alt: ['SI', 'NO'],
                    subText: 'Si 2. = SI', subItems: [
                        { desc: 'Presenta anteproyecto e la entidad competente', alt: ['NO', 'SI', 'NA'], idOffSet: 1 },
                    ]
                },
                "2": { desc: "Presenta anotación sobre: Utilidad pública", alt: ['SI', 'NO'] },
                "3": { desc: "Presenta anotación sobre: Algún litigio", alt: ['SI', 'NO'] },
                "4": {
                    desc: "Presenta anotación sobre: Prohibición y/o restricción urbana", alt: ['SI', 'NO'],
                    subItems: [
                        { desc: 'Nombre', open: true, idOffSet: 6 },
                        { desc: 'Área', open: true, idOffSet: 7 },
                        { desc: 'Año declaración', open: true, idOffSet: 8 },
                    ]
                },
                "5": {
                    desc: "El área y los linderos están debidamente descritos en el certificado y/o el titulo de propiedad aportado (escritura, sentencia, etc)",
                    subText: 'Si 6. = NO', subItems: [
                        { desc: 'El área puede calcularse de la operación aritmética de los linderos', alt: ['SI', 'NO', 'NA'], idOffSet: 2, },
                        { desc: 'Del area y los linderos se evidencia que requiere adelantar tramite ante el AMB de aclaración y/o rectificación', alt: ['NO', 'SI', 'NA'], idOffSet: 3 }
                    ]
                },
                "6": {
                    desc: "Presenta Anotación de reglamento de P.H.",
                    subItems: [
                        { desc: 'Presenta escritura publica de la constitución, reformas y/o adiciones del reglamento', alt: ['NO', 'SI', 'NA'], idOffSet: 4 },
                        { desc: 'Presenta acta del máximo órgano de administración (asamblea, consejo o administrador)', alt: ['NO', 'SI', 'NA'], idOffSet: 5 },
                    ]
                },
                "7": { desc: "señala limitación para la actuación urbanística.", alt: ['SI', 'NO'] },
                "8": { desc: "Con la información del área y linderos es posible adelantar la actuación urbanística" },
            }
            var _COMPONENT = [];

            for (const item in _LIST) {
                _COMPONENT.push(<>
                    <div className='row border'>
                        <div className="col-10 py-0"><label> <label className='fw-bold'>{parseInt(item, 10) + 1}.</label> {_LIST[item].desc}</label> </div>
                        <div className="col-2 py-0"><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item])} name="s_sc1_checks" id={"s_sc1_checks_" + item}
                            defaultValue={_CHECK_ARRAY[item]} onChange={() => manage_rl_sc('sc1')}>
                            {_LIST[item].alt
                                ? <>
                                    {_LIST[item].alt.map((value2, j) => <option value={j}>{value2}</option>)}
                                </>
                                : <>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-success">NA</option>
                                </>}0
                        </select> </div>
                    </div>
                    {_LIST[item].subText ?
                        <div className='row border'><div className="col-12 py-0"><label className='ms-4  fw-bold'>{_LIST[item].subText} </label> </div></div>
                        : ''}
                    {_LIST[item].subItems ?
                        _LIST[item].subItems.map((v, i) => <>

                            {v.open ?
                                <div className='row border'>
                                    <div className="col-10 py-0"><label className='ms-4'><label className='fw-bold'>{parseInt(item, 10) + 1}.{i + 1}</label> {v.desc}</label> </div>
                                    <div className="col-2">
                                        <input className='form-control' name="s_sc1_checks_extra" id={"s_sc1_checks_extra_" + (v.idOffSet - 1)}
                                            defaultValue={_CHECK_ARRAY[8 + v.idOffSet]} onBlur={() => manage_rl_sc('sc1')} />
                                    </div>
                                </div>
                                : <div className='row border'>
                                    <div className="col-10 py-0"><label className='ms-4'><label className='fw-bold'>{parseInt(item, 10) + 1}.{i + 1}</label> {v.desc}</label> </div>
                                    <div className="col-2 py-0"><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[8 + v.idOffSet])} name="s_sc1_checks_extra" id={"s_sc1_checks_extra_" + (v.idOffSet - 1)}
                                        defaultValue={_CHECK_ARRAY[8 + v.idOffSet]} onChange={() => manage_rl_sc('sc1')}>
                                        {v.alt
                                            ? <>
                                                {v.alt.map((value2, j) => <option value={j}>{value2}</option>)}
                                            </>
                                            : <>
                                                <option value="0" className="text-danger">NO</option>
                                                <option value="1" className="text-success">SI</option>
                                            </>}
                                    </select> </div>
                                </div>}

                        </>)
                        : ''}

                </>)
            }
            return <div className="row">{_COMPONENT}</div>
        }
        let _COMPONENT_CHECK_2 = () => {
            const _CHECK_ARRAY = _GET_STEP_TYPE('sc2', 'check');
            const _LIST = {
                "0": { desc: "Cumple tiempo solicitado en el Decreto 1077 de 2015" },
                "1": { desc: "Es clara la nomenclatura" },
                "2": { desc: "Es coherente con lo consignado en los demás documentos (FUN, certificados LyTd, escritura, planos, etc)", },
            }
            var _COMPONENT = [];

            for (const item in _LIST) {
                _COMPONENT.push(<>
                    <div className="col-10 py-0"><label><label className='fw-bold'>{parseInt(item, 10) + 1}.</label> {_LIST[item].desc}</label> </div>
                    <div className="col-2 py-0"><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item])} name="s_sc2_checks" id={"s_sc2_checks_" + item}
                        defaultValue={_CHECK_ARRAY[item]} onChange={() => manage_rl_sc('sc2')}>
                        {_LIST[item].alt
                            ? <>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </>
                            : <>
                                <option value="0" className="text-danger">NO</option>
                                <option value="1" className="text-success">SI</option>
                            </>}
                    </select> </div>
                </>)
            }
            return <div className="row">{_COMPONENT}</div>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let new_liberty = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('recordLawId', currentRecord.id);
            let id_public = document.getElementById("r_lg_liberty_1").value;
            formData.set('id_public', id_public);
            let date = document.getElementById("r_lg_liberty_2").value;
            if (date) formData.set('date', date);
            let predial = document.getElementById("r_lg_liberty_3").value;
            formData.set('predial', predial);
            let predial_2 = document.getElementById("r_lg_liberty_32").value;
            formData.set('predial_2', predial_2);
            let address = document.getElementById("r_lg_liberty_4").value;
            formData.set('address', address);

            let boundary = [];
            boundary.push(document.getElementById("r_lg_liberty_51").value);
            boundary.push(document.getElementById("r_lg_liberty_52").value);
            boundary.push(document.getElementById("r_lg_liberty_53").value);
            boundary.push(document.getElementById("r_lg_liberty_54").value);
            boundary.push(document.getElementById("r_lg_liberty_55").value);
            formData.set('boundary', boundary.join());

            let lastnotify = document.getElementById("r_lg_liberty_6").value;
            formData.set('lastnotify', lastnotify);
            let specify = document.getElementById("r_lg_liberty_7").value;
            formData.set('specify', specify);
            let subject = document.getElementById("r_lg_liberty_8").value;
            formData.set('subject', subject);
            let subject_id = document.getElementById("r_lg_liberty_9").value;
            formData.set('subject_id', subject_id);
            let desc = document.getElementById("r_lg_liberty_10").value;
            formData.set('desc', desc);
            let id_6 = document.getElementById("r_lg_liberty_11").value;
            formData.set('id_6', id_6);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_LAW_SERVICE.create_law_11liberty(formData)
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
                        document.getElementById('form_rl_gen_11_new').reset();
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
        let delete_gen = (id) => {
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
                    RECORD_LAW_SERVICE.delete_law_11liberty(id)
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
                                this.setState({ edit: false });
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
        let edit_liberty = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('recordLawId', currentRecord.id);
            let id_public = document.getElementById("r_lg_liberty_1_edit").value;
            formData.set('id_public', id_public);
            let date = document.getElementById("r_lg_liberty_2_edit").value;
            if (date) formData.set('date', date);
            let predial = document.getElementById("r_lg_liberty_3_edit").value;
            formData.set('predial', predial);
            let predial_2 = document.getElementById("r_lg_liberty_32_edit").value;
            formData.set('predial_2', predial_2);
            let address = document.getElementById("r_lg_liberty_4_edit").value;
            formData.set('address', address);

            let boundary = [];
            boundary.push(document.getElementById("r_lg_liberty_51_edit").value);
            boundary.push(document.getElementById("r_lg_liberty_52_edit").value);
            boundary.push(document.getElementById("r_lg_liberty_53_edit").value);
            boundary.push(document.getElementById("r_lg_liberty_54_edit").value);
            boundary.push(document.getElementById("r_lg_liberty_55_edit").value);
            formData.set('boundary', boundary.join());

            let lastnotify = document.getElementById("r_lg_liberty_6_edit").value;
            formData.set('lastnotify', lastnotify);
            let specify = document.getElementById("r_lg_liberty_7_edit").value;
            formData.set('specify', specify);
            let subject = document.getElementById("r_lg_liberty_8_edit").value;
            formData.set('subject', subject);
            let subject_id = document.getElementById("r_lg_liberty_9_edit").value;
            formData.set('subject_id', subject_id);
            let desc = document.getElementById("r_lg_liberty_10_edit").value;
            formData.set('desc', desc);
            let id_6 = document.getElementById("r_lg_liberty_11_edit").value;
            formData.set('id_6', id_6);


            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_LAW_SERVICE.update_law_11liberty(this.state.edit.id, formData)
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
                        document.getElementById('form_rl_gen_11_edit').reset();
                        this.setState({ edit: false });
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

        let new_tax = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('recordLawId', currentRecord.id);
            let id_public = document.getElementById("r_lg_tax_1").value;
            formData.set('id_public', id_public);
            let date = document.getElementById("r_lg_tax_2").value;
            formData.set('date', date);
            let predial = document.getElementById("r_lg_tax_3").value;
            formData.set('predial', predial);
            let predial_2 = document.getElementById("r_lg_tax_32").value;
            formData.set('predial_2', predial_2);
            let address = document.getElementById("r_lg_tax_4").value;
            formData.set('address', address);
            let strata = document.getElementById("r_lg_tax_5").value;
            formData.set('strata', strata);
            let destiny = document.getElementById("r_lg_tax_6").value;
            formData.set('destiny', destiny);
            let id_6 = document.getElementById("r_lg_tax_7").value;
            formData.set('id_6', id_6);
            let type = document.getElementById("r_lg_tax_8").value;
            formData.set('type', type);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_LAW_SERVICE.create_law_11tax(formData)
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
                        document.getElementById('form_rl_gen_11_new_tax').reset();
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
        let delete_tax = (id) => {
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
                    RECORD_LAW_SERVICE.delete_law_11tax(id)
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
                                this.setState({ edit_tax: false });
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
        let edit_tax = (e) => {
            e.preventDefault();
            formData = new FormData();

            let id_public = document.getElementById("r_lg_tax_1_edit").value;
            formData.set('id_public', id_public);
            let date = document.getElementById("r_lg_tax_2_edit").value;
            formData.set('date', date);
            let predial = document.getElementById("r_lg_tax_3_edit").value;
            formData.set('predial', predial);
            let predial_2 = document.getElementById("r_lg_tax_32_edit").value;
            formData.set('predial_2', predial_2);
            let address = document.getElementById("r_lg_tax_4_edit").value;
            formData.set('address', address);
            let strata = document.getElementById("r_lg_tax_5_edit").value;
            formData.set('strata', strata);
            let destiny = document.getElementById("r_lg_tax_6_edit").value;
            formData.set('destiny', destiny);
            let id_6 = document.getElementById("r_lg_tax_7_edit").value;
            formData.set('id_6', id_6);
            let type = document.getElementById("r_lg_tax_8_edit").value;
            formData.set('type', type);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_LAW_SERVICE.update_law_11tax(this.state.edit_tax.id, formData)
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
                        document.getElementById('form_rl_gen_11_edit_tax').reset();
                        this.setState({ edit_tax: false });
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

        let manage_rl_sc = (_id) => {
            let checks = [];
            let checks_extras = [];
            let values = [];

            formData = new FormData();

            var checks_html = document.getElementsByName(`s_${_id}_checks`);
            for (var i = 0; i < checks_html.length; i++) {
                let ele = document.getElementById(`s_${_id}_checks_${i}`)
                checks.push(ele.value)
            }

            var checks_html = document.getElementsByName(`s_${_id}_checks_extra`);
            for (var i = 0; i < checks_html.length; i++) {
                let ele = document.getElementById(`s_${_id}_checks_extra_${i}`)
                checks_extras.push(ele.value)
            }

            formData.set('check', checks.concat(checks_extras).join(';'));

            var values_html = document.getElementsByName(`s_${_id}_values`);
            for (var i = 0; i < values_html.length; i++) {
                let ele = document.getElementById(`s_${_id}_values_${i}`)
                values.push(ele.value)
            }
            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordLawId', currentRecord.id);
            formData.set('id_public', _id);

            save_step(_id, false, formData);

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
                RECORD_LAW_SERVICE.update_step(STEP.id, formData)
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
                RECORD_LAW_SERVICE.create_step(formData)
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
            <div className="record_law_gen_11 container my-2">
                <div className='row  border border-dark bg-info text-light text-center fwb-bold py-2'>
                    <div className='col'>
                        <label>CERTIFICADOS</label>
                    </div>
                </div>
                <h3 className="py-3" >Certificado de tradición matrícula inmobiliaria</h3>
                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Nuevo certificado de tradición
                    </label>
                </div>
                {this.state.new
                    ? <>
                        <form id="form_rl_gen_11_new" onSubmit={new_liberty}>
                            {_COMPONENT_NEW_LIBERTY()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
                {_CHILD_LIBERTY_LIST()}
                {this.state.edit
                    ? <>
                        <form id="form_rl_gen_11_edit" onSubmit={edit_liberty}>
                            <h3 className="my-3 text-center">Actualizar certificado de tradición</h3>
                            {_COMPONENT_EDIT_LIBERTY()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}

                {_COMPONENT_CHECK_1()}

                <h3 className="py-3" >Documento Oficial de Nomenclatura</h3>
                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new_tax: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Nuevo documento
                    </label>
                </div>
                {this.state.new_tax
                    ? <>
                        <form id="form_rl_gen_11_new_tax" onSubmit={new_tax}>
                            {_COMPONENT_NEW_TAX()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
                {_CHILD_TAX_LIST()}
                {this.state.edit_tax
                    ? <>
                        <form id="form_rl_gen_11_edit_tax" onSubmit={edit_tax}>
                            <h3 className="my-3 text-center">Actualizar documento</h3>
                            {_COMPONENT_EDIT_TAX()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
                {_COMPONENT_CHECK_2()}
            </div >
        );
    }
}

export default RECORD_LAW_GEN2_11;