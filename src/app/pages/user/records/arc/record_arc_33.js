import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';

import FUN_SERVICE from '../../../../services/fun.service'
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import VIZUALIZER from '../../../../components/vizualizer.component';
import RECORD_ARC_AREAS from './record_arc_areas.component';
import EXP_AREAS_RECORD from '../exp_areas_record.component';
import RECORD_ARC_DESC from './record_arc_desc';
import { getJSONFull } from '../../../../components/customClasses/typeParse';
import JSONObjectParser from '../../../../components/jsons/jsonReplacer';
import RECORD_ARC_AREAS_2 from './record_arc_areas_2.component.js';

const MySwal = withReactContent(Swal);

class RECORD_ARC_33 extends Component {
    constructor(props) {
        super(props);
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.state = {
            new_area: false,
            new_blueprint: false,
            edit_area: false,
            edit_blueprint: false,
            sort: 'asc',
            sort2: 'asc',
            fillActive: 'tab2',
        };
    }

    requestUpdateRecord(id) {
        this.props.requestUpdateRecord(id)
    }

    requestUpdate(id) {
        this.props.requestUpdate(id)
    }

    componentDidUpdate(prevState) {
        if (this.state.edit_blueprint !== prevState.edit_blueprint && this.state.edit_blueprint != false) {
            var _ITEM = this.state.edit_blueprint;
            document.getElementById("r_a_33_blueprint_1_edit").value = _ITEM.id_public;
            document.getElementById("r_a_33_blueprint_2_edit").value = _ITEM.use;
            document.getElementById("r_a_33_blueprint_3_edit").value = _ITEM.scale;
            //document.getElementById("r_a_33_blueprint_4_edit").value = _ITEM.category
            document.getElementById("r_a_33_blueprint_5_edit").value = _ITEM.id6_blueprint ? _ITEM.id6_blueprint : 0;
            //document.getElementById("r_a_33_blueprint_6_edit").value = _ITEM.active == 1 ? 1 : 0;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, _FUN_R } = this.props;
        // DATA GETERS
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
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
                    _CHILD = _LIST[i];
                    break;
                }
            }
            return _CHILD;
        }


        let _GET_CHILD_33_AREAS = () => {
            var _CHILD = currentRecord.record_arc_33_areas;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_33_AREAS_BLUEPRINTS = () => {
            var _LIST = _GET_CHILD_33_AREAS();
            var _AREAS = [];
            if (_LIST) {
                for (var i = 0; i < _LIST.length; i++) {
                    if (_LIST[i].type == "blueprint") {
                        _AREAS.push(_LIST[i])
                    }
                }
            }
            return _AREAS;
        }

        let _GET_CHILD_35_PARKING = () => {
            var _CHILD = currentRecord.record_arc_35_parkings;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (_VALUE == '0') {
                return 'form-select text-danger form-select-sm';
            }
            if (_VALUE == '1') {
                return 'form-select text-success form-select-sm';
            }
            if (_VALUE == '2') {
                return 'form-select text-warning form-select-sm';
            }
            return 'form-select form-select-sm';

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
            var value = STEP[_type] ? STEP[_type] : []
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
        let _SAVING_STATE = (state) => {
            if (!state) return '';
            if (state == 1) return <label className='text-warning fw-bold'><i class="fas fa-save"></i></label>;
            if (state == 2) return <label className='text-success fw-bold'><i class="fas fa-save"></i></label>;
            if (state == 3) return <label className='text-danger fw-bold'><i class="fas fa-save"></i></label>;
        }
        // COMPONENTS JSX 


        let _COMPONENT_3 = (edit = '') => {
            return <>
                <div className="row">
                    <div className="col-1">
                        <div class="form-group">
                            <label>ID</label>
                            <input type="text" class="form-control form-control-sm" id={"r_a_33_blueprint_1" + edit} placeholder="ID" />
                        </div>
                    </div>
                    <div className="col-1">
                        <div class="form-group">
                            <label>Escala</label>
                            <input type="text" class="form-control form-control-sm" id={"r_a_33_blueprint_3" + edit} placeholder="Escala" />
                        </div>
                    </div>
                    <div className="col">
                        <div class="form-group">
                            <label>Contenido documento</label>
                            <input type="text" class="form-control form-control-sm" id={"r_a_33_blueprint_2" + edit} placeholder="Descripcion" />
                        </div>
                    </div>
                    <div className="col">
                        <div class="form-group">
                            <label>Relacionar documento</label>
                            <select class="form-select form-select-sm" id={"r_a_33_blueprint_5" + edit} >
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row">

                </div>
            </>
        }
        let _COMPONENT_3_LIST = () => {
            let _LIST = _GET_CHILD_33_AREAS_BLUEPRINTS();
            const columns = [
                {
                    name: <label>ID</label>,
                    center: true,
                    maxWidth: '40px',
                    maxWidth: '40px',
                    cell: row => this.state['qedit_bp_' + row.id]
                        ? <div class="input-group input-group-sm">
                            <input type="text" class="form-control me-1" id={"r_a_33_blueprint_1_edit_" + row.id} defaultValue={row.id_public} />
                        </div> : <label>{row.id_public}</label>
                },
                {
                    name: <label>Escala</label>,
                    center: true,
                    maxWidth: '40px',
                    maxWidth: '40px',
                    cell: row => this.state['qedit_bp_' + row.id]
                        ? <div class="input-group input-group-sm">
                            <input type="text" class="form-control me-1" id={"r_a_33_blueprint_2_edit_" + row.id} defaultValue={row.scale} />
                        </div> : <label className='text-center'>{row.scale}</label>
                },
                {
                    name: <label>Descripción</label>,
                    center: true,
                    cell: row => this.state['qedit_bp_' + row.id]
                        ? <div class="input-group input-group-sm">
                            <input type="text" class="form-control me-1" id={"r_a_33_blueprint_3_edit_" + row.id} defaultValue={row.use} />
                        </div> : <label className='text-center'>{row.use}</label>
                },
                {
                    name: <label>Documento</label>,
                    center: true,
                    cell: row => this.state['qedit_bp_' + row.id]
                        ? <div class="input-group input-group-sm">
                            <select class="form-select" id={"r_a_33_blueprint_5_edit_" + row.id} defaultValue={row.id6_blueprint}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div> : row.id6_blueprint > 0
                            ? <VIZUALIZER url={_FIND_6(row.id6_blueprint).path + "/" + _FIND_6(row.id6_blueprint).filename}
                                apipath={'/files/'} />
                            : ""
                },
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    center: true,
                    minWidth: '120px',
                    cell: row => {
                        return <>
                            <button type="button" onClick={() => this.setState({ edit_blueprint: row })} className="btn btn-sm btn-secondary px-2 me-1"><i class="fas fa-edit"></i></button>
                            <button type="button" onClick={() => delete_33_area(row.id, 'blueprint')} className="btn btn-sm btn-danger px-2"><i class="fas fa-trash-alt"></i></button>
                        </>
                    },
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST.sort((a, b) => {
                    let custtomSortArray = {
                        'Georreferenciado / Localizacion': 9,
                        'Urbanos': 8,
                        'Parcelacion': 7,
                        'Arquitectonico': 6,
                        'Cortes y Fachadas': 5,
                        'NSR10 Seguridad Humana': 4,
                        'No estructural': 3,
                        'Topograficos': 2,
                        'Otros': 1,
                    }
                    return custtomSortArray[b.category] - custtomSortArray[a.category]
                })}
                highlightOnHover
                className="data-table-component"
                noHeader
                dense
            />
        }
        let _COMPONENT_AREAS = () => {
            return <>
                <RECORD_ARC_AREAS_2
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    currentItem={currentItem}
                    currentVersion={currentVersion}
                    currentRecord={currentRecord}
                    currentVersionR={currentVersionR}
                    requestUpdateRecord={this.requestUpdateRecord}
                    requestUpdate={this.requestUpdate}
                />
            </>
        }

        let _COMPONENT_4 = () => {
            const _CHECK_ARRAY = _GET_STEP_TYPE('s33', 'check');
            const LIST = [
                { title: 'Planos arquitectónicos', items: [] },
                {
                    title: false, items: [
                        { desc: 'Anteproyecto de intervención en BIENES DE INTERÉS CULTURAL (BIC) o en inmuebles colindantes o localizados dentro de su área de influencia', i: 27 },
                    ]
                },
                {
                    title: 'Rótulo', items: [
                        { desc: 'Dirección', i: 0 },
                        { desc: 'Firma del arquitecto responsable (indispensable validez)', i: 1 },
                        { desc: 'Número de matricula del arquitecto', i: 2 },
                        { desc: 'Escala', i: 3 },
                        { desc: 'Modalidad de licencia', i: 28 },
                    ]
                },
                {
                    title: 'Características del predio', items: [
                        { desc: 'Plano de localización e identificación (georreferenciado art 365 POT)', i: 4 },
                        { desc: 'Sección vial', i: 5 },
                        { desc: 'Nomenclatura vial', i: 6 },
                        { desc: 'Linderos del predio', i: 7 },
                        { desc: 'Norte', i: 8 },
                    ]
                },
                {
                    title: 'Cuadro de áreas', items: [
                        { desc: 'Cuadro general de las áreas del proyecto arquitectónico', i: 9 },
                    ]
                },
                {
                    title: 'Plantas arquitectónicas por piso, sótano o semisótano  cubiertas', items: [
                        { desc: 'Primera planta relacionada con el espacio público', i: 10 },
                        { desc: 'Cotas totales y parciales del proyecto', i: 11 },
                        { desc: 'Ejes y elementos estructurales proyectados (Sistema estructural)', i: 12 },
                        { desc: 'Niveles', i: 13 },
                        { desc: 'Usos', i: 14 },
                        { desc: 'Indicación cortes (longitudinal, transversal relacionad con E.Público)', i: 15 },
                        { desc: 'Planta de cubierta', i: 26 },
                    ]
                },
                {
                    title: 'Cortes', items: [
                        { desc: 'Relación con el espacio público y privado', i: 16 },
                        { desc: 'Indicación de la pendiente del terreno', i: 17 },
                        { desc: 'Niveles por piso', i: 18 },
                        { desc: 'Cotas totales y parciales', i: 19 },
                        { desc: 'Ejes estructurales', i: 20 },
                    ]
                },
                {
                    title: 'Fachadas', items: [
                        { desc: 'Indicación de la pendiente el terreno', i: 21 },
                        { desc: 'Niveles por piso', i: 22 },
                        { desc: 'Cotas totales y parciales', i: 23 },
                    ]
                },
                {
                    title: false, items: [
                        { desc: 'Plantas, cortes y fachas a la misma escala', i: 24 },
                    ]
                },
                {
                    title: false, items: [
                        { desc: 'Planos arquitectónicos para el reconocimiento de la existencia de edificaciones', i: 25 },
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
                                    <div className='col-2'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item.i])}
                                        name="s_33_checks" id={"s_33_checks_" + item.i}
                                        defaultValue={_CHECK_ARRAY[item.i]} onChange={() => manage_ra_33(false)} >
                                        <option value="0" className="text-danger">NO</option>
                                        <option value="1" className="text-success">SI</option>
                                        <option value="2" className="text-warning">NA</option>
                                    </select></div>
                                </div>
                            </>
                        })}
                    </div>
                </div>
            })
        }
        let _COMPONENT_4_EXTRA = () => {
            let fun_r = _FUN_R ? _FUN_R.code ? _FUN_R.code.split(',') : [] : [];
            let fun_rc = _FUN_R ? _FUN_R.review ?? "" : "";

            let print = fun_r.includes('6603');
            let index_6003;
            let check_6003;
            if (print) index_6003 = fun_rc.lastIndexOf('6603&') + 5;
            if (print) check_6003 = fun_rc[index_6003];
            if (print) return <>
                <div className="row border" style={{ backgroundColor: 'lightgray' }}>
                    <div className='col '><label className='fw-bold'>6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN - Proyecto Arquitectónico (6603)</label></div>
                    <div className='col-2'><select className={_GET_SELECT_COLOR_VALUE(check_6003)}
                        id={"fun_r_6003"}
                        value={check_6003} onChange={() => save_fun_r(false)} >
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">SI CUMPLE</option>
                    </select></div>
                </div>
            </>
        }
        let _COMPONENT_4_EXTRA_2 = () => {
            const _CHECK_ARRAY = _GET_STEP_TYPE('s33_2', 'check');
            const LIST = [
                {
                    title: false, items: [
                        { i: 0, desc: 'Los planos permiten entender el proyecto y por tanto su construcción', },
                        { i: 1, desc: 'El proyecto tiene diseñado el espacio público', },
                        { i: 2, desc: 'La suma del cuadro de áreas es correcta por cada actuación urbanística solicitada', },
                        { i: 3, desc: 'La solicitud señalada es el FUN y la valla corresponder con lo revisado', },
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
                                    <div className='col-2'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item.i])}
                                        name="s_33_2_checks" id={"s_33_2_checks_" + item.i}
                                        defaultValue={_CHECK_ARRAY[item.i]} onChange={() => manage_ra_33(false)} >
                                        <option value="0" className="text-danger">NO</option>
                                        <option value="1" className="text-success">SI</option>
                                        <option value="2" className="text-warning">NA</option>
                                    </select></div>
                                </div>
                            </>
                        })}
                    </div>
                </div>
            })
        }
        let _COMPONENT_CORRECTIONS = () => {
            let values = _GET_STEP_TYPE('s33', 'value');
            return <div className="row">
                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Observaciones generales</label>
                    </div>
                </div>
                <textarea className="input-group" maxLength="2000" name="s_33_values" rows="4"
                    defaultValue={values[2]} onBlur={() => { this.setState({ det: '1' }); manage_ra_33(false, 'det') }}></textarea>
                <label> (maximo 2000 caracteres) {_SAVING_STATE(this.state.det)}</label>
            </div>
        }
        let _COMPONENT_5_GEO = () => {
            const _STEP = _GET_STEP_TYPE('geo', 'value');
            return <div className='row'>
                <div className="col my-1 text-end"><label>Norte</label> </div>
                <div className="col my-1"><input type="text" class="form-control" name="ra_s_geo" defaultValue={_STEP[0] ?? ''}
                    onBlur={() => manage_ra_33(false, 'coord')} /> </div>
                <div className="col my-1 text-end"><label>Este</label> </div>
                <div className="col my-1"><input type="text" class="form-control" name="ra_s_geo" defaultValue={_STEP[1] ?? ''}
                    onBlur={() => manage_ra_33(false, 'coord')} /> </div>
            </div>
        }
        let _COMPONENT_BLUEPRINTS = () => {
            const _CHECK_ARRAY = _GET_STEP_TYPE('blue_prints', 'check');
            const _VALUE_ARRAY = _GET_STEP_TYPE('blue_prints', 'value');
            const LIST = [
                { name: 'Arquitectónicos', v: 0, c: 0 },
                { name: 'Georreferenciado', v: 1, c: 1 },
                { name: 'Loteo', v: 2, c: 2 },
                { name: 'Parcelación', v: 3, c: 3 },
                { name: 'Seguridad Humana (J y K)', v: 4, c: 4 },
                { name: 'Subdivisión', v: 5, c: 5 },
                { name: 'Topográficos', v: 6, c: 6 },
                { name: 'Urbanístico General', v: 7, c: 7 },
                { name: 'Urbanísticos', v: 8, c: 8 },
                { name: 'Observaciones adicionales', v: 9, c: false, open: true },
            ]

            return <>
                <div className="row border text-center fw-bold">
                    <div className='col-8'><label>PLANO</label></div>
                    <div className='col'><label>CANT.</label></div>
                    <div className='col'><label>EVA.</label></div>
                </div>

                {LIST.map(item => {
                    return <div className="row border">
                        {item.open ?
                            <div className='col-8'>
                                <input type="text" onBlur={() => manage_ra_33(false)} className="form-control form-control-sm"
                                    name="blue_prints_values" id={"blue_prints_values_" + item.v} defaultValue={_VALUE_ARRAY[item.v] ?? ''}
                                    placeholder={item.name} />
                            </div>
                            : <div className='col-8'><label className=''>{item.name}</label></div>}

                        {!item.open ?
                            <div className='col'>
                                <input type="number" step={1} min="0" onBlur={() => manage_ra_33(false)} className="form-control form-control-sm"
                                    name="blue_prints_values" id={"blue_prints_values_" + item.v} defaultValue={_VALUE_ARRAY[item.v] ?? 0} />
                            </div>
                            : false}
                        {item.c !== false ?
                            <div className='col'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item.c])}
                                name="blue_prints_checks" id={"blue_prints_checks_" + item.c}
                                defaultValue={_CHECK_ARRAY[item.c] || 2} onChange={() => manage_ra_33(false)} >
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                                <option value="2" className="text-warning">NO APLICA</option>
                            </select> </div>
                            : false}

                    </div>
                })}</>
        }
        let _COMPONENT_CONTROL = () => {
            const json = _GET_STEP_TYPE_JSON('arc_control');
            const control = getJSONFull(json);

            //Default Values brought by others parts of the code

            const json34 = _GET_STEP_TYPE_JSON('s34');

            let m2 = json34.m2;
            let mainuse = json34.mainuse;
            let parkings = _GET_CHILD_35_PARKING().reduce((sum, next) => sum += next.project || 0, 0);


            return <>
                <div className="row">

                    <div className='col'>
                        <label className='fw-bold'>Planeación</label>
                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">N° Parqueaderos</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_0" min="0" step="0.01"
                                    defaultValue={control.n_parking || parkings} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">m2 Área predio</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_1" min="0" step="0.01"
                                    defaultValue={control.m2_predio || m2} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Uso Principal</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control form-control-sm" id="ra_control_data_2"
                                    defaultValue={control.main_use || mainuse} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Número de Subdivisión</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_3"
                                    defaultValue={control.n_sub} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                    </div>
                    <div className='col'>
                        <label className='fw-bold'>Ministerio de vivienda</label>
                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Área Bruta m2</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_4" min="0" step="0.01"
                                    defaultValue={control.m2_brute} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Área Neta m2</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_5" min="0" step="0.01"
                                    defaultValue={control.m2_net} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Área Util m2</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_6" min="0" step="0.01"
                                    defaultValue={control.m2_useful} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                    </div>
                    <div className='col'>
                        <label className='fw-bold'>Ministerio de vivienda, Modalidad Urbanización</label>
                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Área Util VIS</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_7" min="0" step="0.01"
                                    defaultValue={control.m2_vis} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Área Util VIP</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_8" min="0" step="0.01"
                                    defaultValue={control.m2_vip} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Área Util NO VIS</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_9" min="0" step="0.01"
                                    defaultValue={control.m2_novis} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>
                        <label className='fw-bold'>Ministerio de vivienda, Modalidad Urbanización  y Parcelación</label>
                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Área Util Industrial</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_10" min="0" step="0.01"
                                    defaultValue={control.m2_ind} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Área Util Com./Serv.</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_11" min="0" step="0.01"
                                    defaultValue={control.m2_com} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Área Util Dotacional</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_12" min="0" step="0.01"
                                    defaultValue={control.m2_dot} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                    </div>
                </div>
            </>
        }


        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();

        let new_ra_33_blueprint = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('recordArcId', currentRecord.id);
            formData.set('type', "blueprint");

            let id_public = document.getElementById("r_a_33_blueprint_1").value;
            formData.set('id_public', id_public);
            let scale = document.getElementById("r_a_33_blueprint_3").value;
            formData.set('scale', scale);
            let use = document.getElementById("r_a_33_blueprint_2").value;
            formData.set('use', use);
            //let category = document.getElementById("r_a_33_blueprint_4").value;
            formData.set('category', 'cortes');
            let id6_blueprint = document.getElementById("r_a_33_blueprint_5").value;
            formData.set('id6_blueprint', id6_blueprint);
            //let active = document.getElementById("r_a_33_blueprint_6").value;
            //formData.set('active', active);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_ARCSERVICE.create_arc_33_area(formData)
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
                        document.getElementById("form_ra_33_blueprint").reset();
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
        let edit_ra_33_blueprint = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('recordArcId', currentRecord.id);
            formData.set('type', "blueprint");

            let id_public = document.getElementById("r_a_33_blueprint_1_edit").value;
            formData.set('id_public', id_public);
            let scale = document.getElementById("r_a_33_blueprint_3_edit").value;
            formData.set('scale', scale);
            let use = document.getElementById("r_a_33_blueprint_2_edit").value;
            formData.set('use', use);
            //let category = document.getElementById("r_a_33_blueprint_4_edit").value;
            formData.set('category', 'cortes');
            let id6_blueprint = document.getElementById("r_a_33_blueprint_5_edit").value;
            formData.set('id6_blueprint', id6_blueprint);
            //let pos = document.getElementById("r_a_33_blueprint_6_edit").value;
            //formData.set('pos', 1);

            //let active = document.getElementById("r_a_33_blueprint_6_edit").value;
            //formData.set('active', active);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_ARCSERVICE.update_arc_33_area(this.state.edit_blueprint.id, formData)
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
                        this.setState({ edit_blueprint: false });
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
        let delete_33_area = (id, type) => {
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
                    RECORD_ARCSERVICE.delete_33_area(id, this.state.sort, currentRecord.id, type)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.setState({ edit_blueprint: false });
                                this.props.requestUpdateRecord(currentItem.id);
                                this.setState({ edit_area: false });
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

        let manage_ra_33 = (useSwal, state) => {

            let checks = [];
            let values = [];

            formData = new FormData();

            var checks_html = document.getElementsByName('s_33_checks');
            for (var i = 0; i < checks_html.length; i++) {
                let value = document.getElementById('s_33_checks_' + i).value
                checks.push(value)
            }
            formData.set('check', checks.join(';'));

            var values_html = document.getElementsByName('s_33_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value.replaceAll(';', ','))
            }

            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's33');

            save_step('s33', useSwal, formData, state);

            formData = new FormData();
            checks = [];
            values = [];

            values = document.getElementsByName('ra_s_geo');
            for (var i = 0; i < values.length; i++) {
                checks.push(values[i].value)
            }
            formData.set('value', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 'geo');

            save_step('geo', useSwal, formData, state);

            formData = new FormData();
            checks = [];
            values = [];

            values = document.getElementsByName('s_33_2_checks');
            for (var i = 0; i < values.length; i++) {
                checks.push(values[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's33_2');

            save_step('s33_2', useSwal, formData, state);

            formData = new FormData();
            checks = [];
            values = [];

            checks_html = [];
            values_html = [];

            values_html = document.getElementsByName('blue_prints_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(document.getElementById('blue_prints_values_' + i).value)
            }
            formData.set('value', values.join(';'));

            checks_html = document.getElementsByName('blue_prints_checks');
            for (var i = 0; i < checks_html.length; i++) {
                checks.push(document.getElementById('blue_prints_checks_' + i).value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 'blue_prints');

            save_step('blue_prints', useSwal, formData, state);
        }

        let manage_ra_33_control = (state) => {
            formData = new FormData();

            const json = _GET_STEP_TYPE_JSON('arc_control');
            const control = getJSONFull(json);

            control.n_parking = document.getElementById('ra_control_data_0').value;
            control.m2_predio = document.getElementById('ra_control_data_1').value;
            control.main_use = document.getElementById('ra_control_data_2').value;
            control.n_sub = document.getElementById('ra_control_data_3').value;
            control.m2_brute = document.getElementById('ra_control_data_4').value;
            control.m2_net = document.getElementById('ra_control_data_5').value;
            control.m2_useful = document.getElementById('ra_control_data_6').value;
            control.m2_vis = document.getElementById('ra_control_data_7').value;
            control.m2_vip = document.getElementById('ra_control_data_8').value;
            control.m2_novis = document.getElementById('ra_control_data_9').value;
            control.m2_ind = document.getElementById('ra_control_data_10').value;
            control.m2_com = document.getElementById('ra_control_data_11').value;
            control.m2_dot = document.getElementById('ra_control_data_12').value;

            formData.set('json', JSONObjectParser(control));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 'arc_control');

            save_step('arc_control', false, formData, state);


        }


        let save_step = (_id_public, useSwal, formData, state) => {
            if (state) this.setState({ [state]: 1 })
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

        let save_fun_r = () => {
            function replaceAtIndex(_string, _index, _newValue) {
                if (_index > _string.length - 1) {
                    return _string
                }
                else {
                    return _string.substring(0, _index) + _newValue + _string.substring(_index + 1)
                }
            }

            var formData = new FormData();
            let _reivew = document.getElementById('fun_r_6003').value;

            let fun_r = _FUN_R ? _FUN_R.code ? _FUN_R.code.split(',') : [] : [];
            let fun_rc = _FUN_R ? _FUN_R.review ?? "" : "";
            let print = fun_r.includes('6603');
            if (print) {
                let check_6003 = fun_rc.lastIndexOf('6603&');
                let review = replaceAtIndex(fun_rc, check_6003 + 5, _reivew);
                formData.set('review', review);
                manage_fun_r(false, formData);
            }
        }
        let manage_fun_r = (useMySwal, formData) => {
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            if (_FUN_R) {
                FUN_SERVICE.update_r(_FUN_R.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                            this.props.requestUpdate(currentItem.id);
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }
        }
        return (
            <div className="record_arc_32 container">
                <div className="row">
                    <h3 >3.3.1 Antecedentes y Descripción del Proyecto a licencias</h3>
                    <RECORD_ARC_DESC
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        currentRecord={currentRecord}
                        currentVersionR={currentVersionR}
                        requestUpdateRecord={this.props.requestUpdateRecord}
                        requestUpdate={this.props.requestUpdate}
                    />

                    <h3 className="my-3">3.3.2 Planos aportados</h3>
                    {_COMPONENT_BLUEPRINTS()}

                    <h3 className="my-3">3.3.3 Información de Areas</h3>
                    {_COMPONENT_AREAS()}

                    <h3 className="my-3">3.3.4 Cortes y Fachadas</h3>


                    <div class="form-check ms-5 mb-3">
                        <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new_blueprint: e.target.checked })} />
                        <label class="form-check-label" for="flexCheckDefault">
                            Añadir nuevo Plano
                        </label>
                    </div>
                    {this.state.new_blueprint
                        ? <form id="form_ra_33_blueprint" onSubmit={new_ra_33_blueprint}>
                            {_COMPONENT_3()}
                            <div className="text-center">
                                <button className="btn btn-success my-3">
                                    <i class="far fa-share-square"></i> AÑADIR PLANO
                                </button>
                            </div>
                        </form>
                        : ""}
                    {_COMPONENT_3_LIST()}
                    {this.state.edit_blueprint
                        ? <form id="form_ra_33_blueprint_edit" onSubmit={edit_ra_33_blueprint}>
                            <h3 className="my-3 text-center">Actualizar Plano</h3>
                            {_COMPONENT_3('_edit')}
                            <div className="text-center">
                                <button className="btn btn-success my-3">
                                    <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                                </button>
                            </div>
                        </form>
                        : ""}

                    {/**
                     * 
                     * <h3 className="my-3">3.3.5 Áreas para liquidación</h3>
                    <EXP_AREAS_RECORD
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                    />
                     */}

                    <h3 className="my-3">3.3.5 Observaciones a la planimetria revisada. Formato de revisión e información de proyectos</h3>
                    {_COMPONENT_4()}
                    <hr className='my-2' />
                    {_COMPONENT_4_EXTRA_2()}

                    <h3 className="my-3">3.3.6 Información Geográfica de Coordenadas  {_SAVING_STATE(this.state.coord)}</h3>
                    {_COMPONENT_5_GEO()}

                    {/**
                     <h3 className="my-3">3.3.8 Control para Entidades (Planeación y Ministerio de vivienda) {_SAVING_STATE(this.state.pym)}</h3>
                    {_COMPONENT_CONTROL()}
                    */}

                    <h3 className="my-3">3.3.7 Observaciones generales de: Descripción de la actuación urbanística</h3>
                    {_COMPONENT_CORRECTIONS()}
                </div>
            </div >
        );
    }
}

export default RECORD_ARC_33;