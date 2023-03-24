import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { _FUN_101_PARSER, _FUN_102_PARSER, _FUN_1_PARSER, _FUN_24_PARSER, _FUN_25_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER, _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER } from '../../../../components/customClasses/funCustomArrays';
import { dateParser_dateDiff } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';
import FUNService from '../../../../services/fun.service';
import Record_lawService from '../../../../services/record_law.service';
import FUN_3_G_VIEW from '../../fun_forms/components/fun_3_g_view';

export default function RECORD_LAW_FUN_LAW(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    const FunLawNull = {
        id: false,
        sign: [],
        new_type: "",
        publish_neighbour: "",
        id6payment: 0,
    }
    const MySwal = withReactContent(Swal);
    var [FunLaw, setFunLaw] = useState(FunLawNull);
    var [load, setLod] = useState(false)

    useEffect(() => {
        _GET_CHILD_LAW();
    }, [currentItem.fun_law]);

    // *********************** DATA GETTERS ************************** // 
    let _GET_CHILD_3 = () => {
        var _CHILD = currentItem.fun_3s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CHILD_LAW = () => {
        var _CHILD = currentItem.fun_law;
        var _CHILD_VARS = FunLawNull;
        if (_CHILD) {
            _CHILD_VARS.id = _CHILD.id;
            _CHILD_VARS.sign = _CHILD.sign ? _CHILD.sign.split(',') : [];
            _CHILD_VARS.new_type = _CHILD.new_type ?? '';
            _CHILD_VARS.publish_neighbour = _CHILD.publish_neighbour ?? '';
            _CHILD_VARS.id6payment = _CHILD.id6payment ?? 0;
        }
        setFunLaw(_CHILD_VARS);
        setLod(true);
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
    let _GET_CHILD_6 = () => {
        var _CHILD = currentItem.fun_6s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
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
    let _GET_CLOCK = () => {
        var _CHILD = currentItem.fun_clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CLOCK_STATE = (_state) => {
        var _CLOCK = _GET_CLOCK();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }
    // ************************ DATA CONVERTERS ************************ // 
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
    let _CHILD_6_SELECT = () => {
        let _LIST = _GET_CHILD_6();
        let _COMPONENT = [];
        for (var i = 0; i < _LIST.length; i++) {
            _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
        }
        return <>{_COMPONENT}</>
    }
    // ************************** JSX COMPONENTS *********************** // 
    let COMPONENT = () => {
        let values = _GET_STEP_TYPE('flaw', 'check');
        return <>
            <div className='row  border border-dark bg-info text-light text-center fwb-bold py-2'>
                <div className='col'>
                    <label>Valla informativa</label>
                </div>
            </div>

            <div className='row  border border-dark bg-info text-light text-center fwb-bold py-2'>
                <div className='col'>
                    <label>DATOS FORMULARIO</label>
                </div>
                <div className='col'>
                    <label>VERIFICACION CURADURIA URBANA</label>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-5'>
                    <div className='row'>
                        <div className='col-6'>
                            <label>Radicación Fotografiá</label>
                        </div>
                        <div className='col'>
                            <input type="date" class="form-control form-control-sm" max="2100-01-01" id="alert_sign_date_rl" defaultValue={FunLaw.sign[1]} onBlur={() => uploadSign()} />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-6'>
                            <label>Radicación LyDF</label>
                        </div>
                        <div className='col'>
                        <label>{_GET_CLOCK_STATE(5).date_start}</label>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-6'>
                            <label>Diferencia</label>
                        </div>
                        <div className='col'>
                        <label>{dateParser_dateDiff(FunLaw.sign[1], _GET_CLOCK_STATE(5).date_start, true)} dia(s) hábiles</label>
                        </div>
                    </div>
                </div>
                <div className='col'>
                    {_COMPONENT_CHECK_CMP(values[0], 'El registro fotográfico fue radicado en los 5 días siguientes a la radicación')}
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-5'>
                    <div className='row'>
                        <div className='col-6'>
                            <label>Foto</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{FunLaw.sign[0] > 0
                                ? <VIZUALIZER url={_FIND_6(FunLaw.sign[0]).path + "/" + _FIND_6(FunLaw.sign[0]).filename}
                                    apipath={'/files/'} /> : FunLaw.sign[0] == 0 ? 'NO APORTADA' : 'APORTADA FÍSICAMENTE'}</label>
                        </div>
                    </div>
                </div>
                <div className='col'>
                    {_COMPONENT_CHECK_CMP(values[1], 'La valla contiene la información requerida (número y fecha de radicación, datos curaduria, uso, características básicas)')}
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-5'>
                    <select class="form-select form-control form-control-sm" required id="alert_sign_select_rl" defaultValue={FunLaw.sign[0]} onChange={() => uploadSign()} >
                        <option value="-1">APORTADO FISICAMENTE</option>
                        <option value="0">SIN DOCUMENTO</option>
                        {_CHILD_6_SELECT()}
                    </select>
                </div>
                <div className='col'>
                    {_COMPONENT_CHECK_CMP(values[2], 'Con la fotográfica puede verificarse su visibilidad desde el espacio publico')}
                </div>
            </div>
        </>
    }
    let _COMPONENT_CHECK_CMP = (_defaultValue, desc, alt = false) => {
        return <> <div className='row'>
            <div className="col-8 my-1"><label>{desc}</label> </div>
            <div className="col-4 my-1"><select className={_GET_SELECT_COLOR_VALUE(_defaultValue)} name="s_flaw_checks"
                defaultValue={_defaultValue} onChange={() => manage_rl_flaw(false)}>
                {alt
                    ? <>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </>
                    : <>
                        <option value="0" className="text-danger">NO</option>
                        <option value="1" className="text-success">SI</option>
                        <option value="2" className="text-warning">NA</option>
                    </>}

            </select> </div></div>
        </>

    }
    let _COMPOENTN_DETAIL = () => {
        let values = _GET_STEP_TYPE('flaw', 'value');
        return <>
            <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                <div className='col'>
                    <label>OBSERVACIONES ACCIONES DE PUBLICIDAD DE PROCESO</label>
                </div>
            </div>
            <div className="row">
                <div className="col-12">

                    <textarea className="input-group" maxLength="4096" name="s_flaw_values" rows="3"
                        defaultValue={values[0]} onBlur={() => manage_rl_flaw(false)}></textarea>
                    <label>(maximo 4000 caracteres)</label>
                </div>
            </div>
        </>
    }
    // ******************************* APIS **************************** // 
    var formData = new FormData();
    let manage_rl_flaw = (useSwal) => {
        let checks = [];
        let values = [];

        formData = new FormData();

        var checks_html = document.getElementsByName('s_flaw_checks');
        for (var i = 0; i < checks_html.length; i++) {
            checks.push(checks_html[i].value)
        }
        formData.set('check', checks.join(';'));

        var values_html = document.getElementsByName('s_flaw_values');
        for (var i = 0; i < values_html.length; i++) {
            values.push(values_html[i].value)
        }
        formData.set('value', values.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordLawId', currentRecord.id);
        formData.set('id_public', 'flaw');

        save_step('flaw', useSwal, formData);

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
            Record_lawService.update_step(STEP.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.requestUpdateRecord(currentItem.id);
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
            Record_lawService.create_step(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.requestUpdateRecord(currentItem.id);
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
    let uploadSign = () => {
        formData = new FormData();
        // FILE DATA

        formData.set('fun0Id', currentItem.id);
        let sign = []
        sign.push(document.getElementById("alert_sign_select_rl").value);
        sign.push(document.getElementById("alert_sign_date_rl").value);
        formData.set('sign', sign.join());

        if (currentItem.fun_law) {
            let law_id = currentItem.fun_law.id;
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.update_sign(law_id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.requestUpdate(currentItem.id);
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
        } else {
            FUNService.create_sign(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.requestUpdate(currentItem.id);
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

    };

    return (
        <div>
            {COMPONENT()}
            <div className='row  border border-dark bg-info text-light text-center fwb-bold py-2'>
                <div className='col'>
                    <label>Vecinos colindantes</label>
                </div>
            </div>
            <FUN_3_G_VIEW
                _FUN_3={_GET_CHILD_3()}
                _FUN_6={_GET_CHILD_6()}
            />
            {_COMPOENTN_DETAIL()}
        </div>

    );
}
