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
import RECORD_ARC_AREAS_2 from './record_arc_areas_2.component';

const MySwal = withReactContent(Swal);

class RECORD_ARC_CONTROL extends Component {
    constructor(props) {
        super(props);
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
            var _CHILD = currentRecord.record_arc_steps || [];
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
        }
        // COMPONENTS JSX 



        let _COMPONENT_AREAS = () => {
            return <>
                <RECORD_ARC_AREAS_2
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    currentItem={currentItem}
                    currentVersion={currentVersion}
                    currentRecord={currentRecord}
                    currentVersionR={currentVersionR}
                    requestUpdateRecord={this.props.requestUpdateRecord}
                    requestUpdate={this.props.requestUpdate}
                />
            </>
        }

        let _COMPONENT_5_GEO = () => {
            const _STEP = _GET_STEP_TYPE('geo', 'value');
            return <div className='row'>
                <div className="col my-1 text-end"><label>Norte</label> </div>
                <div className="col my-1"><input type="text" class="form-control" name="ra_s_geo" defaultValue={_STEP[0] ?? ''}
                    onBlur={() => manage_ra_33(false)} /> </div>
                <div className="col my-1 text-end"><label>Este</label> </div>
                <div className="col my-1"><input type="text" class="form-control" name="ra_s_geo" defaultValue={_STEP[1] ?? ''}
                    onBlur={() => manage_ra_33(false)} /> </div>
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
            ]

            return <>
                <div className="row border text-center fw-bold">
                    <div className='col-8'><label>PLANO</label></div>
                    <div className='col'><label>CANT.</label></div>
                    <div className='col'><label>EVA.</label></div>
                </div>

                {LIST.map(item => {
                    return <div className="row border">
                        <div className='col-8'><label className=''>{item.name}</label></div>
                        <div className='col'><input type="number" step={1} min="0" onBlur={() => manage_ra_33(false)} className="form-control form-control-sm"
                            name="blue_prints_values" id={"blue_prints_values_" + item.v} defaultValue={_VALUE_ARRAY[item.v] ?? 0} /></div>
                        <div className='col'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item.c])}
                            name="blue_prints_checks" id={"blue_prints_checks_" + item.c}
                            defaultValue={_CHECK_ARRAY[item.c] || 2} onChange={() => manage_ra_33(false)} >
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select> </div>
                    </div>
                })}</>
        }
        let _COMPONENT_CONTROL = () => {
            const json = _GET_STEP_TYPE_JSON('arc_control');
            const control = getJSONFull(json);
            return <>
                <div className="row">
                    <div className='col'>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">N° Parqueaderos</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_0" min="0" step="0.01"
                                    defaultValue={control.n_parking} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">m2 Área predio</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control form-control-sm" id="ra_control_data_1" min="0" step="0.01"
                                    defaultValue={control.m2_predio} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="staticEmail" class="col-sm-8 col-form-label">Uso Principal</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control form-control-sm" id="ra_control_data_2"
                                    defaultValue={control.main_use} onBlur={() => manage_ra_33_control('pym')} />
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


        let manage_ra_33 = (useSwal) => {

            let checks = [];
            let values = [];

            formData = new FormData();

            var checks_html;
            var values_html;

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

            save_step('geo', useSwal, formData);

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

            save_step('blue_prints', useSwal, formData);
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
            this.setState({ [state]: 1 })
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
                            this.setState({ [state]: 2 })
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.setState({ [state]: 3 })
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
                        this.setState({ [state]: 3 })
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
                            this.setState({ [state]: 2 })
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.setState({ [state]: 3 })
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
                        this.setState({ [state]: 3 })
                    });
            }
        }

        return (
            <div className="record_arc_32 container">
                <div className="row">
                    <h3 className="my-3">3.3.1 Planos aportados</h3>
                    {_COMPONENT_BLUEPRINTS()}

                    <h3 className="my-3">3.3.2 Cuadro de Areas</h3>
                    {_COMPONENT_AREAS()}

                    <h3 className="my-3">3.3.3 Cuadro de Usos</h3>
                    <EXP_AREAS_RECORD
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        requestUpdateRecord={this.props.requestUpdateRecord}
                        requestUpdate={this.props.requestUpdate}
                    />

                    <h3 className="my-3">3.3.4 Información Geográfica de Coordenadas</h3>
                    {_COMPONENT_5_GEO()}

                    <h3 className="my-3">3.3.5 Control para Entidades (Planeación y Ministerio de vivienda) {_SAVING_STATE(this.state.pym)}</h3>
                    {_COMPONENT_CONTROL()}
                </div>
            </div >
        );
    }
}

export default RECORD_ARC_CONTROL;