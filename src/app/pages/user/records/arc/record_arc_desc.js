import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';

import FUN_SERVICE from '../../../../services/fun.service'
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import VIZUALIZER from '../../../../components/vizualizer.component';
import RECORD_ARC_AREAS from './record_arc_areas.component';
import EXP_AREAS_RECORD from '../exp_areas_record.component';

const MySwal = withReactContent(Swal);

class RECORD_ARC_DESC extends Component {
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
            document.getElementById("r_a_33_blueprint_4_edit").value = _ITEM.category
            document.getElementById("r_a_33_blueprint_5_edit").value = _ITEM.id6_blueprint ? _ITEM.id6_blueprint : 0;
            //document.getElementById("r_a_33_blueprint_6_edit").value = _ITEM.active == 1 ? 1 : 0;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, _FUN_R } = this.props;
        // DATA GETERS
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
                    _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
                }
            }
            return _CHILD_VARS;
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
            if (!value) return [];
            value = value.split(';');
            return value
        }
        // COMPONENTS JSX 
        let _SAVING_STATE = (state) => {
            if(!state) return '';
            if(state == 1) return <label className='text-warning fw-bold'><i class="fas fa-save"></i></label>;
            if(state == 2) return <label className='text-success fw-bold'><i class="fas fa-save"></i></label>;
            if(state == 3) return <label className='text-danger fw-bold'><i class="fas fa-save"></i></label>;
        }


        let _COMPONENT_1 = () => {
            let values = _GET_STEP_TYPE('s33', 'value');
            return <>
                <div className="row">
                    <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                        <div className='col'>
                            <label>Antecedentes del proyecto</label>
                        </div>
                    </div>

                    <textarea className="input-group" maxLength="8000" name="s_33_values" rows="4"
                        defaultValue={values[0]} onBlur={() => {this.setState({ant: '1'}); manage_ra_33(false, 'ant')}}></textarea>
                    <label>  (maximo 8000 caracteres) {_SAVING_STATE(this.state.ant)}</label>
                </div>

                <div className="row">
                    <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                        <div className='col'>
                            <label>Descripción del proyecto radicado</label>
                        </div>
                    </div>
                    <textarea className="input-group" rows="4" disabled value={_GET_CHILD_1().description} style={{ backgroundColor: 'gainsboro' }}></textarea>
                </div>

                <div className="row">
                    <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                        <div className='col'>
                            <label>Descripción del proyecto Arquitectónica</label>
                        </div>
                    </div>
                    <textarea className="input-group" maxLength="8000" name="s_33_values" rows="4"
                        defaultValue={values[1]} onBlur={() => {this.setState({desc: '1'});  manage_ra_33(false, 'desc')}}></textarea>
                    <label>  (maximo 8000 caracteres) {_SAVING_STATE(this.state.desc)}</label>
                </div>
            </>
        }



        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();
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

        }
        let save_step = (_id_public, useSwal, formData, state) => {
            this.setState({[state]: 1})
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
                            this.setState({[state]: 2})
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.setState({[state]: 3})
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
                        this.setState({[state]: 3})
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
                            this.setState({[state]: 2})
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.setState({[state]: 3})
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
                        this.setState({[state]: 3})
                    });
            }
        }

        return (
                <div className="row">
                    {_COMPONENT_1()}
                </div>
        );
    }
}

export default RECORD_ARC_DESC;