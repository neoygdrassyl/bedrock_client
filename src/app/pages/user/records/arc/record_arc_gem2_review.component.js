import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { REVIEW_DOCS_2 } from '../../../../components/jsons/arcReviewDocs';
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';

const MySwal = withReactContent(Swal);

export default function RECORD_ARC_GEN_2_REVIEW(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    var _SAVE_STEPS = 0;
    const REVIEW = REVIEW_DOCS_2;
    // ******************* DATA GETERS ********************* //
    let LOAD_STEP = (_id_public) => {
        var _CHILD = currentRecord.record_arc_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }
    // *******************  DATA CONVERTERS ******************* //
    let _GET_STEP_TYPE = (_id_public, _type) => {
        var STEP = LOAD_STEP(_id_public);
        if (!STEP.id) return [];
        var value = STEP[_type]
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
    // ******************* COMPONENTS JSX ******************* //
    let _REVIEW_LIST_COMPONENT = () => {
        const value = _GET_STEP_TYPE('rar_t', 'value');
        return REVIEW.map(re => {
            let _value = _GET_STEP_TYPE(re.pid, 'value');
            let _check = _GET_STEP_TYPE(re.pid, 'check');
            let _json = _GET_STEP_TYPE_JSON(re.pid, 'json');

            if (re.rtype.includes(value[0])) return <>
                <div className='row'>
                    {re.title ? <div className='row'><div className='col text-center fw-bold'>{re.title}</div></div> : ''}
                    <input type='hidden' value={re.items.length} name={'rar_limits'} id={'rar_limit_' + re.pid} />
                    <input type='hidden' value={re.title} name={'rar_parents'} id={'rar_parent_' + re.pid} />

                    <div className='row border bg-info fw-bold mx-2 text-center'>
                        <div className='col'><label>ITEM</label></div>
                        <div className='col-2'><label>NORMA</label></div>
                        <div className='col-2'><label>PROYECTO</label></div>
                        <div className='col-2'><label>EVALUACIÓN</label></div>
                        <div className='col-4'><label>DETALLES/ OBSERVACIONES</label></div>
                    </div>

                    {re.items.map(it => {
                        let localJson = _json[re.pid + '_' + it.v] || {}
                        if (it.rtype.includes(value[0])) return <>
                            {it.hide ? <>
                                <input type='hidden' value={it.name} name={'rar_values_' + re.pid} id={'rar_values_' + re.pid + '_' + it.v} />
                                <input type='hidden' value={2} name={'rar_checks_' + re.pid} id={'rar_checks_' + re.pid + '_' + it.c} />
                            </>
                                : <div className='row border mx-2'>
                                    <div className='col-2'><label>{it.name}</label></div>
                                    <input type='hidden' value={it.name} name={'rar_values_' + re.pid} id={'rar_values_' + re.pid + '_' + it.v} />
                                    <div className='col-2'>
                                        <input type="text" defaultValue={localJson.norm} name={'rar_norm_' + re.pid} id={'rar_norm_' + re.pid + '_' + it.j}
                                            class="form-control form-control-sm" onBlur={() => manage_rar_rew(false)} />
                                    </div>
                                    <div className='col-2'>
                                        <input type="text" defaultValue={localJson.project} name={'rar_project_' + re.pid} id={'rar_project_' + re.pid + '_' + it.j}
                                            class="form-control form-control-sm" onBlur={() => manage_rar_rew(false)} />
                                    </div>
                                    <div className='col-2'>
                                        <select className={_GET_SELECT_COLOR_VALUE(_check[it.c])}
                                            name={"rar_checks_" + re.pid} id={'rar_checks_' + re.pid + '_' + it.c}
                                            defaultValue={_check[it.c] ?? 1} onChange={() => manage_rar_rew(false)} >
                                            <option value="0" className="text-danger">NO CUMPLE</option>
                                            <option value="1" className="text-success">CUMPLE</option>
                                            <option value="2" className="text-warning">NO APLICA</option>
                                        </select>
                                    </div>
                                    <div className='col-4'>
                                        <input type="text" defaultValue={localJson.detail} name={'rar_detail_' + re.pid} id={'rar_detail_' + re.pid + '_' + it.j}
                                            class="form-control form-control-sm" onBlur={() => manage_rar_rew(false)} />
                                    </div>
                                </div>}
                        </>
                    })}

                </div>
            </>
        })

    }


    // ******************* APIS ******************* //
    let manage_rar_rew = (e) => {
        if (e) e.preventDefault();
        let _rev_master = REVIEW;
        _SAVE_STEPS = 0;
        let _LIMIT_STEPS = 0;
        _rev_master.map((rew) => {
            let conParent = document.getElementById('rar_parent_' + rew.pid);
            if (conParent) _LIMIT_STEPS++
        })

        let formData = new FormData();
        let checks = [];
        let check_html;
        let values = [];
        let value_html;
        let jsons = {};

        _rev_master.map(rew => {
            formData = new FormData();
            values = [];
            checks = [];
            jsons = {};
            let conParent = document.getElementById('rar_parent_' + rew.pid)
            // FATHER VAR
            if (conParent) {
                _SAVE_STEPS++;
                let _v = conParent.value;
                //let _c = document.getElementById('rar_checks_' + rew.pid + '_' + c).value;
                values.push(_v);
                checks.push('0');

                rew.items.map(it => {
                    value_html = document.getElementById('rar_values_' + rew.pid + '_' + it.v);
                    check_html = document.getElementById('rar_checks_' + rew.pid + '_' + it.c);
                    let json = {};
                    let norm = document.getElementById('rar_norm_' + rew.pid + '_' + it.j);
                    let project = document.getElementById('rar_project_' + rew.pid + '_' + it.j);
                    let detail = document.getElementById('rar_detail_' + rew.pid + '_' + it.j);
                    if (value_html) {
                        values.push(value_html.value);
                        checks.push(check_html.value);
                        json.norm = norm.value;
                        json.project = project.value;
                        json.detail = detail.value;
                        jsons[rew.pid + '_' + it.j] = json;
                    } else {
                        values.push('');
                        checks.push('2');
                        values.push('');
                    }
                })

                formData.set('json', JSON.stringify(jsons));
                formData.set('value', values.join(';'));
                formData.set('check', checks.join(';'));

                formData.set('version', currentVersionR);
                formData.set('recordArcId', currentRecord.id);
                formData.set('id_public', rew.pid);
            }
            if (conParent) save_step(rew.pid, false, formData, _SAVE_STEPS, _LIMIT_STEPS);

        })



    }

    let save_step = (_id_public, useSwal, formData, start, end) => {
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
                        if (start != undefined) {
                            if (start == end) props.requestUpdateRecord(currentItem.id);
                        }
                        else props.requestUpdateRecord(currentItem.id);
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
                        if (start != undefined) {
                            if (start == end) props.requestUpdateRecord(currentItem.id);
                        }
                        else props.requestUpdateRecord(currentItem.id);
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
        <div>
            <hr/>
            <h3 className='fw-bold py-3'>Evaluación de profundidad</h3>
            {_REVIEW_LIST_COMPONENT()}
        </div >
    );
}
