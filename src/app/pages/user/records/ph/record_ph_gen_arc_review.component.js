import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { REVIEW_DOCS } from '../../../../components/jsons/arcReviewDocs';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'

const MySwal = withReactContent(Swal);

export default function RECORD_PH_GEN_REVIEW(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    var _SAVE_STEPS = 0;
    const REVIEWS_TYPES = [
        { name: 'CONSTRUCCIÓN', id: 'con' },
        { name: 'LOTEO, PARCELACIÓN, SUBDIVISIÓN Y URBANISMO', id: 'sub' },
        { name: 'CERRAMIENTO', id: 'cer' },
    ]
    const REVIEW = REVIEW_DOCS;
    // ******************* DATA GETERS ********************* //
    let LOAD_STEP = (_id_public) => {
        var _CHILD = currentRecord.record_ph_steps;
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
    let _MASTER_LIST_COMPONENT = () => {
        const value = _GET_STEP_TYPE('rar_t', 'value');
        return <>
            <div className='row py-3' style={{ backgroundColor: 'silver' }}>
                <div className='col text-center'>
                    <label className='fw-bold'>TIPO DE REVISION:</label>
                </div>
                <div className='col'>
                    <select
                        className={'form-select'} defaultValue={value[0]} name="rar_t_value"
                        onChange={() => manage_rar()}>
                        <option value='0' disabled>Seleccione tipo...</option>
                        {REVIEWS_TYPES.map(it => <option value={it.id}>{it.name}</option>)}
                    </select>
                </div>
            </div>

        </>
    }
    let _REVIEW_LIST_COMPONENT = () => {
        const value = 'ph';
        return REVIEW.map(re => {
            let _value = _GET_STEP_TYPE(re.pid, 'value');
            let _check = _GET_STEP_TYPE(re.pid, 'check');
            let _context = _GET_STEP_TYPE(re.pid + '_c', 'value');

            if (re.rtype.includes(value)) return <>
                <div className='row border'>
                    {re.title ? <div className='col-3 text-center fw-bold'>{re.title}</div> : ''}
                    <input type='hidden' value={re.items.length} name={'rar_limits'} id={'rar_limit_' + re.pid} />
                    <input type='hidden' value={re.title} name={'rar_parents'} id={'rar_parent_' + re.pid} />
                    <div className='col'>
                        {re.items.map(it => {
                            if (it.rtype.includes(value)) return <>
                                {it.hide ? <>
                                    <input type='hidden' value={it.name} name={'rar_values_' + re.pid} id={'rar_values_' + re.pid + '_' + it.v} />
                                    <input type='hidden' value={2} name={'rar_checks_' + re.pid} id={'rar_checks_' + re.pid + '_' + it.c} />
                                </>
                                    : <div className='row border'>
                                        <div className='col'>
                                            <label className={it.className ?? ''}>{it.name}</label>
                                            {_check[it.c] == 0
                                                ? <input type="text" defaultValue={_context[it.v]} name={'rar_context_' + re.pid} id={'rar_context_' + re.pid + '_' + it.v}
                                                    class="form-control form-control-sm" onBlur={() => manage_rar_context()} style={{backgroundColor: 'LightPink'}} />
                                                : <input type='hidden' value={''} name={'rar_context_' + re.pid} id={'rar_context_' + re.pid + '_' + it.v} />
                                            }
                                        </div>
                                        <input type='hidden' value={it.name} name={'rar_values_' + re.pid} id={'rar_values_' + re.pid + '_' + it.v} />
                                        <div className='col-2 text-center'><select className={_GET_SELECT_COLOR_VALUE(_check[it.c])}
                                            name={"rar_checks_" + re.pid} id={'rar_checks_' + re.pid + '_' + it.c}
                                            defaultValue={_check[it.c] ?? 1} onChange={() => manage_rar_rew(false)} >
                                            <option value="0" className="text-danger">NO CUMPLE</option>
                                            <option value="1" className="text-success">CUMPLE</option>
                                            <option value="2" className="text-warning">NO APLICA</option>
                                        </select></div>
                                    </div>}
                            </>
                        })}
                    </div>
                </div>
            </>
        })

    }


    // ******************* APIS ******************* //
    let manage_rar = (e) => {
        if (e) e.preventDefault();
        let formData = new FormData();
        let checks = [];
        let checks_html;
        let values = [];

        let values_html = document.getElementsByName('rar_t_value');
        for (var i = 0; i < values_html.length; i++) {
            values.push(values_html[i].value)
        }

        formData.set('value', values.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordPhId', currentRecord.id);
        formData.set('id_public', 'rar_t');

        save_step('rar_t', false, formData);
    }

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

        _rev_master.map(rew => {
            formData = new FormData();
            values = [];
            checks = [];
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

                    if (value_html) {
                        values.push(value_html.value);
                        checks.push(check_html.value);
                    } else {
                        values.push('');
                        checks.push('2');
                    }
                })

                formData.set('json', rew.rtype.join(';'));
                formData.set('value', values.join(';'));
                formData.set('check', checks.join(';'));

                formData.set('version', currentVersionR);
                formData.set('recordPhId', currentRecord.id);
                formData.set('id_public', rew.pid);
            }
            if (conParent) save_step(rew.pid, false, formData, _SAVE_STEPS, _LIMIT_STEPS);

        })



    }

    let manage_rar_context = (e) => {
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

        _rev_master.map(rew => {
            formData = new FormData();
            values = [];
            checks = [];
            let conParent = document.getElementById('rar_parent_' + rew.pid)
            // FATHER VAR
            if (conParent) {
                _SAVE_STEPS++;
                let _v = conParent.value;
                //let _c = document.getElementById('rar_checks_' + rew.pid + '_' + c).value;
                values.push(_v);
                //checks.push('0');

                rew.items.map(it => {
                    value_html = document.getElementById('rar_context_' + rew.pid + '_' + it.v);

                    if (value_html) {
                        values.push(value_html.value);
                    } else {
                        values.push('');
                    }
                })


                formData.set('value', values.join(';'));

                formData.set('version', currentVersionR);
                formData.set('recordPhId', currentRecord.id);
                formData.set('id_public', rew.pid + '_c');
            }
            if (conParent) save_step(rew.pid + '_c', false, formData, _SAVE_STEPS, _LIMIT_STEPS);

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
            RECORD_PH_SERVICE.update_step(STEP.id, formData)
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
            RECORD_PH_SERVICE.create_step(formData)
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
            {_REVIEW_LIST_COMPONENT()}
            <div className='row border'>
                <div className='col'>
                    <label className={'text-primary'}>* ITEMS DE LA LISTA DE CHECKEO</label>
                </div>
            </div>
        </div >
    );
}
