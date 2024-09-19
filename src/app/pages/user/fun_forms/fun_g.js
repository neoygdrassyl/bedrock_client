import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import {
    _FUN_1_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER,
    _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER, _FUN_101_PARSER, _FUN_102_PARSER, _FUN_24_PARSER, _FUN_25_PARSER
} from '../../../components/customClasses/funCustomArrays'
import { dateParser, dateParser_yearsPassed, regexChecker_isOA_2 } from '../../../components/customClasses/typeParse';
import FUNG_CHECKLIST from './fun_g_checklist';
import FUNG_NAV from './components/fun_g_nav';
import FUN_MODULE_NAV from './components/fun_moduleNav';
import FUN_VERSION_NAV from './components/fun_versionNav';
import FUN_SERVICE from '../../../services/fun.service';
import FUN_3_G_VIEW from './components/fun_3_g_view';
import VIZUALIZER from '../../../components/vizualizer.component';
import FUN_G_MIX from './components/fun_g_mix.component';
import FUN_G_REPORTS from './components/fun_g_reports.component';
import FUN_ARCHIVE from './components/fun_archive.component';
import FUN_G_REPORT_MASTER from './components/fun_g_reportMaster.compoentn';
import FUN_CHECKLIST_N from './components/fun_checklist_n';
import ARCHIVE_FUN_VIEW from '../archive/arcXfun_view.component';

const MySwal = withReactContent(Swal);
class FUNG extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load: false,
            currentItem: null,
            pqrsxfun: false,
        };
    }
    componentDidMount() {
        this.retrieveItem(this.props.currentId);
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
                this.retrievePQRSxFUN(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    retrievePQRSxFUN(id_public) {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                this.setState({
                    pqrsxfun: response.data,
                })
            })
            .catch(e => {
                console.log(e);
            });
    }
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { currentItem } = this.state;

        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                description: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_53 = () => {
            var _CHILD = currentItem.fun_53s;
            var _CURRENT_VERSION = currentItem.version - 1;
            var _CHILD_VARS = {
                item_530: "",
                item_5311: "",
                item_5312: "",
                item_532: "",
                item_533: "",
                item_534: "",
                item_535: "",
                item_536: "",
                docs: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_530 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name;
                    _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname;
                    _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number;
                    _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role;
                    _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number;
                    _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email;
                    _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address;
                    _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs;
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                id: "",
                sign: "",
                new_type: "",
                publish_neighbour: "",
                id6payment: "",
            }
            if (_CHILD != null) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.new_type = _CHILD.new_type;
                _CHILD_VARS.sign = _CHILD.sign;
                _CHILD_VARS.id6payment = _CHILD.id6payment;
            }
            return _CHILD_VARS;
        }
        // DATA CONVERTERS
        let _GET_DOCS_BTNS = (_item) => {
            if (!_item) return "";
            var _array = _item.split(',');
            var _COMPONENT = [];

            _COMPONENT.push(<>{_array[0] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'}
                    icon={'far fa-id-card fa-2x'} color={'DeepSkyBlue'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                    icon={'far fa-file-alt fa-2x'} color={'DarkOrchid'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[2] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[2]).path + "/" + _FIND_6(_array[2]).filename} apipath={'/files/'}
                    icon={'far fa-file-alt fa-2x'} color={'GoldenRod'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[3] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[3]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                    icon={'far fa-file-alt fa-2x'} color={'LimeGreen'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[4] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[4]).path + "/" + _FIND_6(_array[4]).filename} apipath={'/files/'}
                    icon={'far fa-file-alt fa-2x'} color={'tomato'} />
                : ""}</>)

            return <>{_COMPONENT}</>
        }
        let _GET_DOC_VALUE = (_index) => {
            var _CHILD = _GET_CHILD_53();
            if (!_CHILD.docs) return false
            var _array = _CHILD.docs.split(',');

            return _array[_index]
        }
        let _GET_CLOCK_STATE = (_state) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }
        let _FIND_6 = (_ID) => {
            let _LIST = _SET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }
        let _GET_DOCS_BTNS_FUN51 = (_item) => {
            if (!_item) return "";
            var _array = _item.split(',');
            var _COMPONENT = [];

            _COMPONENT.push(<>{_array[0] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'}
                    icon={'far fa-id-card fa-2x me-1'} color={'DeepSkyBlue'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ? <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                    icon={'far fa-id-badge fa-2x me-1'} color={'DarkOrchid'} />
                : ""}</>)


            return <>{_COMPONENT}</>
        }
        let _GET_NEIGHBOUR_STATE = (_state) => {
            if (!_state) return <label className="fw-bold text-danger">PENDIENTE</label>
            else if (_state == 1) return <label className="fw-bold text-success">CITACIÓN POSITIVA</label>
            else if (_state == 2) return <label className="fw-bold text-warning">CITACIÓN NEGATIVA</label>
        }
        // COMPONENT JSX

        let _SET_CHILD_0 = () => {
            var _CHILD = _GET_CLOCK_STATE(3);
            var _CHILD_LAW = _GET_CHILD_LAW();
            var _fun_0_type = { '0': 'SIN CATEGORIZAR', 'i': 'CATEGORIA I', 'ii': "CATEGORIA II", 'iii': "CATEGORIA III", 'iv': "CATEGORIA IV", 'oa': "OTRAS ACTUACIONES" }
            if (!_CHILD) _CHILD = "";
            return <>
                <div className="row py-2">
                    <div className="col-6">
                        <label>Fecha de Pago: </label>
                        <label className="mx-3 fw-bold">{dateParser(_CHILD.date_start)}</label>
                        {_CHILD_LAW.id6payment > 0
                            ?
                            <VIZUALIZER url={_FIND_6(_CHILD_LAW.id6payment).path + "/" + _FIND_6(_CHILD_LAW.id6payment).filename}
                                apipath={'/files/'} />

                            : ""}
                    </div>
                    <div className="col-6">
                        <label>Consecutivo de Pago: </label>
                        <label className="mx-3 fw-bold">{currentItem.id_payment}</label>
                    </div>
                </div>
                <div className="row my-2">
                    <div className="col">
                        <label>Categorización: <label className="fw-bold">{_fun_0_type[currentItem.type]}</label></label>

                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label>Descripción del Proyecto</label>
                        <textarea className="input-group" maxLength="2000" rows="4" disabled
                            defaultValue={_GET_CHILD_1().description}></textarea>
                    </div>
                </div>
            </>
        }
        let _SET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
                item_6: "",
                item_7: "",
                item_8: "",
                item_9: "",
                item_101: "",
                item_102: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_1 = _FUN_1_PARSER(_CHILD[_CURRENT_VERSION].tipo);
                    _CHILD_VARS.item_2 = _FUN_2_PARSER(_CHILD[_CURRENT_VERSION].tramite);
                    _CHILD_VARS.item_3 = _FUN_3_PARSER(_CHILD[_CURRENT_VERSION].m_urb);
                    _CHILD_VARS.item_4 = _FUN_4_PARSER(_CHILD[_CURRENT_VERSION].m_sub);
                    _CHILD_VARS.item_5 = _FUN_5_PARSER(_CHILD[_CURRENT_VERSION].m_lic);
                    _CHILD_VARS.item_6 = _FUN_6_PARSER(_CHILD[_CURRENT_VERSION].usos);
                    _CHILD_VARS.item_7 = _FUN_7_PARSER(_CHILD[_CURRENT_VERSION].area);
                    _CHILD_VARS.item_8 = _FUN_8_PARSER(_CHILD[_CURRENT_VERSION].vivienda);
                    _CHILD_VARS.item_9 = _FUN_9_PARSER(_CHILD[_CURRENT_VERSION].cultural);
                    _CHILD_VARS.item_101 = _FUN_101_PARSER(_CHILD[_CURRENT_VERSION].regla_1);
                    _CHILD_VARS.item_102 = _FUN_102_PARSER(_CHILD[_CURRENT_VERSION].regla_2);
                }
            }
            return <>
                <div className="row">
                    <div className="col-6">
                        <label>1.1 Tipo de Solicitud</label>
                        <textarea class="form-control mb-3" rows="3" value={_CHILD_VARS.item_1} disabled></textarea>
                    </div>
                    <div className="col-6">
                        <label>1.2 Objeto del Trámite</label>
                        <input type="text" class="form-control" value={_CHILD_VARS.item_2} disabled />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>1.3 Modalidad Licencia de Urbanización</label>
                        <input type="text" class="form-control" value={_CHILD_VARS.item_3} disabled />
                    </div>
                    <div className="col-6">
                        <label >1.4 Modalidad Licencia de Subdivisión</label>
                        <input type="text" class="form-control" value={_CHILD_VARS.item_4} disabled />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>1.5 Modalidad Licencia de Construcción</label>
                        <textarea class="form-control mb-3" rows="3" value={_CHILD_VARS.item_5} disabled></textarea>
                    </div>
                    <div className="col-6">
                        <label>1.6 Usos</label>
                        <textarea class="form-control mb-3" rows="3" value={_CHILD_VARS.item_6} disabled></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>1.7 Área Construida</label>
                        <input type="text" class="form-control  mb-3" value={_CHILD_VARS.item_7} disabled />
                    </div>
                    <div className="col-6">
                        <label>1.8 Tipo de Vivienda</label>
                        <input type="text" class="form-control  mb-3" value={_CHILD_VARS.item_8} disabled />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>1.9  Bien de Interés Cultural</label>
                        <input type="text" class="form-control  mb-3" value={_CHILD_VARS.item_9} disabled />
                    </div>
                    <div className="col-6">
                        <label>1.10.2  Zonificación Climática</label>
                        <input type="text" class="form-control  mb-3" value={_CHILD_VARS.item_101} disabled />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label>1.10.1  Declaración de medidas de construcción sostenible</label>
                        <input type="text" class="form-control  mb-3" value={_CHILD_VARS.item_102} disabled />
                    </div>
                </div>
            </>
        }
        let _SET_CHILD_2 = () => {
            var _CHILD = currentItem.fun_2;
            var _CHILD_VARS = {
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
                _CHILD_VARS.item_211 = _CHILD.direccion;
                _CHILD_VARS.item_212 = _CHILD.direccion_ant;
                _CHILD_VARS.item_22 = _CHILD.matricula;
                _CHILD_VARS.item_23 = _CHILD.catastral;
                _CHILD_VARS.item_24 = _FUN_24_PARSER(_CHILD.suelo); // PARSER
                _CHILD_VARS.item_25 = _FUN_25_PARSER(_CHILD.lote_pla);// PARSER

                _CHILD_VARS.item_261 = _CHILD.barrio;
                _CHILD_VARS.item_262 = _CHILD.vereda;
                _CHILD_VARS.item_263 = _CHILD.comuna;
                _CHILD_VARS.item_264 = _CHILD.sector;
                _CHILD_VARS.item_265 = _CHILD.corregimiento;
                _CHILD_VARS.item_266 = _CHILD.lote;
                _CHILD_VARS.item_267 = _CHILD.estrato;
                _CHILD_VARS.item_268 = _CHILD.manzana;
            }
            return <>
                <div className="row">
                    <div className="col-6">
                        <label>2.1 Dirección o Nomenclatura actual</label>
                        <textarea type="text" class="form-control mb-3" rows="3" defaultValue={_CHILD_VARS.item_211} disabled ></textarea>
                    </div>
                    <div className="col-6">
                        <label>2.1 Dirección(es) Anterior(es)</label>
                        <textarea type="text" class="form-control mb-3" rows="3" defaultValue={_CHILD_VARS.item_212} disabled ></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>2.2 No. Matrícula Inmobiliaria</label>
                        <input type="text" class="form-control mb-3" defaultValue={_CHILD_VARS.item_22} disabled />
                    </div>
                    <div className="col-6">
                        <label>2.3 Identificación Catastral</label>
                        <input type="text" class="form-control mb-3" defaultValue={_CHILD_VARS.item_23} disabled />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>2.4 Clasificación del Suelo</label>
                        <input type="text" class="form-control mb-3" defaultValue={_CHILD_VARS.item_24} id="p_24" disabled />
                    </div>
                    <div className="col-6">
                        <label>2.5 Planimetria del Lote</label>
                        <input type="text" class="form-control mb-3" defaultValue={_CHILD_VARS.item_25} id="p_25" disabled />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label>2.6 Información General</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Barrio o Urbanización
                            </span>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_261} disabled />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Comuna
                            </span>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_263} disabled />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Estrato
                            </span>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_267} disabled />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Manzana No.
                            </span>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_268} disabled />
                        </div>
                    </div>

                    <div className="col-6">
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Vereda
                            </span>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_262} disabled />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Sector
                            </span>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_264} disabled />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Corregimiento
                            </span>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_265} disabled />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Lote No.
                            </span>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_266} disabled />
                        </div>
                    </div>
                </div>
            </>
        }
        let _SET_CHILD_3 = () => {
            var _CHILD = currentItem.fun_3s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SET_CHILD_4 = () => {
            var _CHILD = currentItem.fun_4s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            const columns_4 = [
                {
                    name: <label>LINDEROS</label>,
                    selector: 'coord',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.coord}</label>
                },
                {
                    name: <label>LONGITUD</label>,
                    selector: 'longitud',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.longitud}</label>
                },
                {
                    name: <label>COLINDA CON</label>,
                    selector: 'colinda',
                    cell: row => <label>{row.colinda}</label>
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_4}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 15]}
                className="data-table-component"
                noHeader
            />
        }
        let _SET_CHILD_51 = () => {
            var _CHILD = currentItem.fun_51s;
            var _LIST = [];
            // SETTING 5.1 RETRIEVE ONLY THE ONES ACTIVES
            if (_CHILD) {
                for (var i = 0; i < _CHILD.length; i++) {
                    if (_CHILD[i].active == 1) {
                        _LIST.push(_CHILD[i]);
                    }
                }
            }
            const columns_51 = [
                {
                    name: <label>TIPO</label>,
                    selector: 'type',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.type}</label>
                },
                {
                    name: <label>NOMBRE</label>,
                    selector: 'name',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.name + " " + row.surname}</label>
                },
                {
                    name: <label>CC/NIT</label>,
                    selector: 'id_number',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.id_number}</label>
                },
                {
                    name: <label>NOMBRE REP. LEGAL</label>,
                    selector: 'rep_name',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.rep_name}</label>
                },
                {
                    name: <label>C.C. REP. LEGAL</label>,
                    selector: 'rep_id_number',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.rep_id_number}</label>
                },
                {
                    name: <label>TELÉFONO/ CELULAR</label>,
                    selector: 'nunber',
                    center: true,
                    cell: row => <label >{row.nunber}</label>
                },
                {
                    name: <label>CORREO</label>,
                    selector: 'email',
                    center: true,
                    cell: row => <label>{row.email}</label>
                },
                {
                    name: <label>ROL</label>,
                    selector: 'role',
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.role}</label>
                },
                {
                    name: <label>DOCUMENTOS</label>,
                    button: true,
                    center: true,
                    center: true,
                    cell: row => <> {_GET_DOCS_BTNS_FUN51(row.docs)}</>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_51}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }
        let _SET_CHILD_52 = () => {
            var _CHILD = currentItem.fun_52s;
            var _LIST = [];
            // SETTING 5.1 RETRIEVE ONLY THE ONES ACTIVES
            if (_CHILD) {
                for (var i = 0; i < _CHILD.length; i++) {
                    if (_CHILD[i].active == 1) {
                        _LIST.push(_CHILD[i]);
                    }
                }
            }
            const columns_52 = [
                {
                    name: <label>NOMBRE</label>,
                    selector: 'surname',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.name + " " + row.surname}</label>
                },
                {
                    name: <label>CC/NIT</label>,
                    selector: 'id_number',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.id_number}</label>
                },
                {
                    name: <label>TELÉFONO/ CELULAR</label>,
                    selector: 'number',
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.number}</label>
                },
                {
                    name: <label>CORREO</label>,
                    selector: 'email',
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.email}</label>
                },
                {
                    name: <label>PROFESIÓN</label>,
                    selector: 'role',
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.role}</label>
                },
                {
                    name: <label>MATRICULA</label>,
                    selector: 'registration',
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.registration}</label>
                },
                {
                    name: <label>EXP. MATRICULA</label>,
                    selector: 'registration_date',
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{dateParser(row.registration_date)}</label>
                },
                {
                    name: <label>EXPERIENCIA</label>,
                    selector: 'expirience',
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{Math.trunc(row.expirience / 12)} año(s)</label>
                },
                {
                    name: <label>¿SANCIONADO?</label>,
                    selector: 'sanction',
                    center: true,
                    cell: row => <label>{row.sanction ? <label className="text-danger fw-bold">SI</label> : "NO"}</label>
                },
                {
                    name: <label>SUPERVISIÓN</label>,
                    selector: 'supervision',
                    center: true,
                    cell: row => <label>{row.supervision}</label>
                },
                {
                    name: <label>DOCUMENTOS</label>,
                    button: true,
                    center: true,
                    cell: row => <> {_GET_DOCS_BTNS(row.docs)}</>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_52}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }
        let _SET_CHILD_53 = () => {
            var _CHILD_VARS = _GET_CHILD_53();
            return <>
                <div className="row mx-2 px-2">
                    <div className="col-6 border p-2">
                        <label className="mx-3">5.3.1 Nombre y Apellido(s)</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_5311 + " " + _CHILD_VARS.item_5312}</label>
                    </div>
                    <div className="col-6 border p-2">
                        <label className="mx-3">5.3.2 Cédula</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_532}</label>
                    </div>
                </div>
                <div className="row mx-2 px-2">
                    <div className="col-6 border p-2">
                        <label className="mx-3">3.5.3 NÚmero de Contacto</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_534}</label>
                    </div>
                    <div className="col-6 border p-2">
                        <label className="mx-3">3.5.4 Correo Electrónico</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_535}</label>
                    </div>
                </div>
                <div className="row mx-2 px-2">
                    <div className="col-6 border p-2">
                        <label className="mx-3">3.5.5 Dirección de Correspondencia</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_536}</label>
                    </div>
                    <div className="col-6 border p-2">
                        <label className="mx-3">5.3.6 En calidad de:</label>
                        <label className="mx-3 fw-bold">{_CHILD_VARS.item_533}</label>
                    </div>
                </div>
                <div className="row m-2 py-2">
                    <label>3.5.7 Documentos</label>
                    <div className="col-6 border p-2">
                        <label className="mx-3">Documentos de Identidad: </label>
                        {_GET_DOC_VALUE(0) > 0
                            ? <VIZUALIZER url={_FIND_6(_GET_DOC_VALUE(0)).path + "/" + _FIND_6(_GET_DOC_VALUE(0)).filename}
                                apipath={'/files/'} />
                            : <label className="text-warning fw-bold">SIN DOCUMENTO</label>}
                    </div>
                    <div className="col-6 border p-2">
                        <label className="mx-3">Poder o autorización: </label>
                        {_GET_DOC_VALUE(1) > 0
                            ?
                            <VIZUALIZER url={_FIND_6(_GET_DOC_VALUE(1)).path + "/" + _FIND_6(_GET_DOC_VALUE(1)).filename} apipath={'/files/'}
                            />
                            : <label className="text-warning fw-bold">SIN DOCUMENTO</label>}
                    </div>
                </div>
            </>
        }
        let _SET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SET_CHILD_C = () => {
            var _CHILD = currentItem.fun_cs;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_c0: "",
                item_c1: "",
                item_c2: "",
                item_c3: "",
                item_c4: "",
                item_c5: "",
                item_c6: "",
                item_c7: "",
                item_c8: "",
                item_c9: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_c0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_c1 = _CHILD[_CURRENT_VERSION].worker;
                    _CHILD_VARS.item_c2 = _CHILD[_CURRENT_VERSION].date;
                    _CHILD_VARS.item_c3 = _CHILD[_CURRENT_VERSION].condition;
                    _CHILD_VARS.item_c4 = _CHILD[_CURRENT_VERSION].details;
                    _CHILD_VARS.item_c5 = _CHILD[_CURRENT_VERSION].reciever_name;
                    _CHILD_VARS.item_c6 = _CHILD[_CURRENT_VERSION].reciever_date;
                    _CHILD_VARS.item_c7 = _CHILD[_CURRENT_VERSION].reciever_id;
                    _CHILD_VARS.item_c8 = _CHILD[_CURRENT_VERSION].reciever_actor;
                    _CHILD_VARS.item_c9 = _CHILD[_CURRENT_VERSION].legal_date;
                }
            }
            return <>
                <legend className="my-2 px-3 text-uppercase bg-light" id="fung_c1"><h4 className="mt-2">C.1 IDENTIFICACIÓN DEL ENCARGADO DE LA REVISION</h4></legend>
                <div className="row">
                    <div className="col-6">
                        <label>Nombre Encargado de Revision</label>
                        <input type="text" class="form-control mb-3" id="c_31" disabled
                            value={_CHILD_VARS.item_c1} />
                    </div>
                    <div className="col-6">
                        <label>No. Radicado</label>
                        <input type="text" class="form-control mb-3" id="c_33" disabled
                            value={currentItem.id_public} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>Fecha de Revision</label>
                        <input type="date" class="form-control mb-3" max='2100-01-01' id="c_32" disabled
                            value={_CHILD_VARS.item_c2} />
                    </div>
                </div>



                <legend className="my-2 px-3 text-uppercase bg-light" id="fung_c2"><h4 className="mt-2">C.2 CONDICIÓN DE LA RADICACIÓN</h4></legend>
                <div className="row  mb-3">
                    <div className="col-6">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="1" name="c_41" readOnly
                                checked={_CHILD_VARS.item_c3 == '1' ? true : false} />
                            <label class="form-check-label" for="flexCheckDefault">
                                RADICACIÓN EN LEGAL Y DEBIDA FORA
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="0" name="c_41" readOnly
                                checked={_CHILD_VARS.item_c3 == '0' ? true : false} />
                            <label class="form-check-label" for="flexCheckChecked">
                                RADICACIÓN INCOMPLETA
                            </label>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>Actuador</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="A" name="c_42" readOnly
                                checked={_CHILD_VARS.item_c8 == 'A' ? true : false} />
                            <label class="form-check-label" for="flexCheckDefault">
                                SOLICITANTE
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="B" name="c_42" readOnly
                                checked={_CHILD_VARS.item_c8 == 'B' ? true : false} />
                            <label class="form-check-label" for="flexCheckChecked">
                                APODERADO
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="C" name="c_42" readOnly
                                checked={_CHILD_VARS.item_c8 == 'C' ? true : false} />
                            <label class="form-check-label" for="flexCheckChecked">
                                MANDATARIO
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>Nombre</label>
                        <input type="text" class="form-control mb-3" id="c_43" disabled
                            value={_CHILD_VARS.item_c5} />
                    </div>
                    <div className="col-6">
                        <label>Fecha incompleto</label>
                        <input type="date" class="form-control mb-3" id="c_44" max='2100-01-01' disabled
                            value={_CHILD_VARS.item_c6} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>CC/NIT</label>
                        <input type="text" class="form-control mb-3" id="c_45" disabled
                            value={_CHILD_VARS.item_c7} />
                    </div>
                    <div className="col-6">
                        <label>Fecha legal y debida forma</label>
                        <input type="date" class="form-control mb-3" id="c_44" max='2100-01-01' disabled
                            value={_CHILD_VARS.item_c9} />
                    </div>
                    <div className="col-12">
                        <label>Observaciones</label>
                        <textarea class="form-control mb-3" rows="3" id="c_46" disabled
                            value={_CHILD_VARS.item_c4}></textarea>
                    </div>
                </div>

            </>
        }

        let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : {})
        let rules = currentItem ? currentItem.rules ? currentItem.rules.split(';') : [] : [];
        return (
            <div className="py-3">
                {currentItem != null ? <>
                    <h2 className="text-center">RESUMEN DE LA SOLICITUD</h2>
                    <fieldset className="p-3" id="fung_0">
                        <legend className="my-2 px-3 text-uppercase bg-success">
                            <label className="app-p lead fw-normal text-uppercase text-light">0. Metadatos de la Solicitud</label>
                        </legend>
                        {_SET_CHILD_0()}
                        <legend className="my-2 px-3 text-uppercase bg-light" id="fun_arch">
                            <label className="app-p lead fw-normal text-uppercase">ARCHIVO</label>
                        </legend>
                        <ARCHIVE_FUN_VIEW
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                        />
                    </fieldset>
                    <fieldset className="p-3" id="fung_1">
                        <legend className="my-2 px-3 text-uppercase Collapsible">
                            <label className="app-p lead fw-normal text-uppercase">1. Identificación de la Solicitud</label>
                        </legend>
                        {_SET_CHILD_1()}
                    </fieldset>
                    <fieldset className="p-3" id="fung_2">
                        <legend className="my-2 px-3 text-uppercase Collapsible">
                            <label className="app-p lead text-center fw-normal text-uppercase">2. Información del Predio</label>
                        </legend>
                        {_SET_CHILD_2()}
                    </fieldset>
                    <fieldset className="p-3" id="fung_3">
                        <legend className="my-2 px-3 text-uppercase Collapsible">
                            <label className="app-p lead fw-normal text-uppercase">3. Información de Vecinos Colindantes</label>
                        </legend>
                        <FUN_3_G_VIEW
                            _FUN_3={_SET_CHILD_3()}
                            _FUN_6={_SET_CHILD_6()}
                        />
                    </fieldset>
                    <fieldset className="p-3" id="fung_4">
                        <legend className="my-2 px-3 text-uppercase Collapsible">
                            <label className="app-p lead text-center fw-normal text-uppercase">4. Linderos, Dimensiones y Áreas</label>
                        </legend>
                        {_SET_CHILD_4()}
                    </fieldset>
                    <legend className="my-2 px-3 text-uppercase Collapsible" id="fun_pdf">
                        <label>5 Titulares y profesionales responsables </label>
                    </legend>
                    <fieldset className="p-3" id="fung_51">
                        <legend className="my-2 px-3 text-uppercase Collapsible">
                            <label className="app-p lead text-center fw-normal text-uppercase">5.1 Titular(es) de la Licencia</label>
                        </legend>
                        {_SET_CHILD_51()}
                        <div className="border p-2 m-2">
                            <label className="me-2">LEYENDA:</label>
                            <label className="me-2"><i class="far fa-id-card fa-2x" style={{ color: "DeepSkyBlue" }}></i> : Documento de Identidad,</label>
                            <label className="me-2"><i class="far fa-id-badge fa-2x" style={{ color: 'DarkOrchid' }}></i>: Certificado de Existencia y Representación Legal</label>
                        </div>
                    </fieldset>
                    <fieldset className="p-3" id="fung_52">
                        <legend className="my-2 px-3 text-uppercase Collapsible">
                            <label className="app-p lead text-center fw-normal text-uppercase">5.2 Profesionales Responsables</label>
                        </legend>
                        {_SET_CHILD_52()}
                        <div className="border p-2 m-2">
                            <label className="me-2">LEYENDA:</label>
                            <label className="me-2"><a><i class="far fa-id-card fa-2x" style={{ "color": "DeepSkyBlue" }}></i></a> : C.C.,</label>
                            <label className="me-2"><a><i class="far fa-file-alt fa-2x" style={{ "color": "DarkOrchid" }}></i></a> : Matrícula,</label>
                            <label className="me-2"><a><i class="far fa-file-alt fa-2x" style={{ "color": "GoldenRod" }}></i></a> : Vigencia Matricular,</label>
                            <label className="me-2"><a><i class="far fa-file-alt fa-2x" style={{ "color": "LimeGreen" }}></i></a> : Hoja de vida y Certificados</label>
                            <label className="me-2"><a><i class="far fa-file-alt fa-2x" style={{ "color": "tomato" }}></i></a> : Estudios de postgrado</label>
                        </div>
                    </fieldset>
                    <fieldset className="p-3" id="fung_53">
                        <legend className="my-2 px-3 text-uppercase Collapsible">
                            <label className="app-p lead text-center fw-normal text-uppercase">5.3 Responsable de la Solicitud</label>
                        </legend>
                        {_SET_CHILD_53()}
                    </fieldset>

                    <fieldset className="p-3" id="fung_c">
                        <legend className="my-2 px-3 text-uppercase bg-success text-white">
                            <label className="app-p lead text-center fw-normal text-uppercase">Lista de Checkeo</label>
                        </legend>
                        {_SET_CHILD_C()}
                        <FUN_CHECKLIST_N
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={this.retrieveItem}
                            readOnly
                        />
                    </fieldset>

                    <FUN_G_MIX
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                    />

                    <FUN_G_REPORTS
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        nomenclature={'9.'}
                        noArc={conOA()}
                        noEng={conOA() || rules[1] == 1}
                    />

                    <FUN_G_REPORT_MASTER
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        nomenclature={'9.'}
                    />

{/* 
                    <FUNG_NAV
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                    /> */}
                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"general"}
                        NAVIGATION={this.props.NAVIGATION}
                        pqrsxfun={this.state.pqrsxfun}
                    />
                    <FUN_VERSION_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        NAVIGATION_VERSION={this.props.NAVIGATION_VERSION}
                        ON
                    />
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACION...</h3></div>
                </fieldset>}
            </div>
        );
    }
}

export default FUNG;