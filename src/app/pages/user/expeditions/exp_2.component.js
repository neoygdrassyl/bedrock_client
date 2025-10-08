import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import EXPEDITION_SERVICE from '../../../services/expedition.service';
import RECORD_ARCSERVICE from '../../../services/record_arc.service';
import PQRS_Service from '../../../services/pqrs_main.service';
import JSONObjectParser from '../../../components/jsons/jsonReplacer';
import { axis, infoCud, zones } from '../../../components/jsons/vars'
import { getJSONFull, regexChecker_isOA_2, _MANAGE_IDS } from '../../../components/customClasses/typeParse';
import EXP_CALC from './exp_calc.component';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
class EXP_2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
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
                        text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte.",
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
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentItem.record_arc_steps;
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
        let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)
        let _GET_CHILD_35_PARKING = () => {
            let arc = currentItem.record_arc ? currentItem.record_arc : false;
            let _CHILD = arc ? arc.record_arc_35_parkings : [];
            let _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        // DATA CONVERTERS
        let _SAVING_STATE = (state) => {
            if (!state) return '';
            if (state == 1) return <label className='text-warning fw-bold'><i class="fas fa-save"></i></label>;
            if (state == 2) return <label className='text-success fw-bold'><i class="fas fa-save"></i></label>;
            if (state == 3) return <label className='text-danger fw-bold'><i class="fas fa-save"></i></label>;
        }
        // COMPONENT JSX
        let _COMPONENT_GENERAL = () => {
            let json = currentRecord.control;
            let control = getJSONFull(json);

            const jsonArc = _GET_STEP_TYPE_JSON('arc_control');
            const controlArc = getJSONFull(jsonArc);

            //Default Values brought by others parts of the code

            const json34 = _GET_STEP_TYPE_JSON('s34');

            let m2 = json34.m2;
            let mainuse = json34.mainuse;
            let parkings = _GET_CHILD_35_PARKING().reduce((sum, next) => sum += next.project || 0, 0);
            return <>
                <div className="container">
                    <label className='fw-bold fs-5'>Planeación</label>
                    <div className="row">
                        <div className="col-md-3">
                            <label className="mt-1">N° Folios Licencia</label>
                            <input type="number" className="form-control form-control-sm" id="exp_2_1" min="0" step="1"
                                defaultValue={control.n_lic} onBlur={() => save_exp()} />
                        </div>
                        <div className="col-md-3">
                            <label className="mt-1">N° Folios de Resolución</label>
                            <input type="number" className="form-control form-control-sm" id="exp_2_2" min="0" step="1"
                                defaultValue={control.n_res} onBlur={() => save_exp()} />
                        </div>
                        <div className="col-md-3">
                            <label className="mt-1">Norma</label>
                            <input type="text" className="form-control form-control-sm" id="exp_2_3"
                                defaultValue={control.norm} onBlur={() => save_exp()} />
                        </div>
                        <div className="col-md-3">
                            <label className="mt-1">Fecha Norma</label>
                            <input type="date" className="form-control form-control-sm" id="exp_2_4" max={'2100-12-31'}
                                defaultValue={control.date_norm} onBlur={() => save_exp()} />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-md-3">
                            <label className="mt-1">N° Folios Norma</label>
                            <input type="text" className="form-control form-control-sm" id="exp_2_5" min="0" step="1"
                                defaultValue={control.n_norm} onBlur={() => save_exp()} />
                        </div>
                        <div className="col-md-3">
                            <label className="mt-1">N° Parqueaderos</label>
                            <input type="number" className="form-control form-control-sm" id="exp_2_6" min="0" step="1"
                                defaultValue={control.n_parq} onBlur={() => save_exp()} />
                        </div>
                        <div className="col-md-3">
                            <label className="mt-1">m2 Área predio</label>
                            <input type="text" className="form-control form-control-sm" id="exp_2_7"
                                defaultValue={control.area_predio} onBlur={() => save_exp()} />
                        </div>
                        <div className="col-md-3">
                            <label className="mt-1">Uso Principal</label>
                            <input type="text" className="form-control form-control-sm" id="exp_2_8"
                                defaultValue={control.uso_principal} onBlur={() => save_exp()} />
                        </div>
                        
                        <div className="col-md-3">
                            <label className="mt-1">Número de Subdivisión</label>
                            <input type="number" class="form-control form-control-sm" id="ra_control_data_3"
                                defaultValue={controlArc.n_sub} onBlur={() => manage_ra_33_control('pym')} />
                        </div>
                    </div>
                    <div className="mt-3"></div>
                </div>
            </>
        }

        let _COMPONENT_CONTROL = () => {
            const json = _GET_STEP_TYPE_JSON('arc_control');
            const control = getJSONFull(json);

            //Default Values brought by others parts of the code
            return <>
                <div className="row">


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
                    </div>

                    <div className='col'>
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

        var formData = new FormData();

        let save_exp = (e) => {
            formData = new FormData();

            let control = {};

            let json = currentRecord.control;
            control = getJSONFull(json);

            control.n_lic = document.getElementById('exp_2_1').value;
            control.n_res = document.getElementById('exp_2_2').value;
            control.norm = document.getElementById('exp_2_3').value;
            control.date_norm = document.getElementById('exp_2_4').value;
            control.n_norm = document.getElementById('exp_2_5').value;

            formData.set('control', JSONObjectParser(control));

            manage_exp(false);
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

            formData.set('version', 1);
            formData.set('recordArcId', currentItem.record_arc.id);
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

        let manage_exp = (useMySwal) => {
            if (useMySwal) MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.update(currentRecord.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });

                        this.props.requestUpdateRecord(currentItem.id);
                        this.props.requestUpdate(currentItem.id);
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        if (useMySwal) MySwal.fire({
                            title: "ERROR DE DUPLICACION",
                            text: "El consecutivo CUB de este formulario ya existe, debe de elegir un consecutivo nuevo",
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                    else {
                        if (useMySwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }
        return (
            <div className="record_ph_gen container p-3">
                <legend className="my-2 px-3 text-uppercase bg-light" id="nav_expedition_10">
                    <label className="app-p lead fw-normal">Control para Entidades Supervisoras {_SAVING_STATE(this.state.pym)}</label>
                </legend>

                {currentItem.record_arc ? <>
                    {_COMPONENT_GENERAL()}

                    {_COMPONENT_CONTROL()}
                </> :
                    <h4 className='fw-bold text-danger text-center my-4'>SE DEBE CREAR PRIMERO EL INFORME DE ARQUITECTURA</h4>}

            </div >
        );
    }
}

export default EXP_2;