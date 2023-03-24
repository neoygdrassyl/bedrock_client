import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { _FUN_101_PARSER, _FUN_102_PARSER, _FUN_1_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER, _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER } from '../../../../components/customClasses/funCustomArrays';
import Record_lawService from '../../../../services/record_law.service';
import Modal from 'react-modal';
import { MDBBtn } from 'mdb-react-ui-kit';
import FUNN1 from '../../fun_forms/fun_n_1'


export default function RECORD_LAW_FUN_1(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, quickModalStyle } = props;
    const fun1Null = {
        id: false,
        tipo: "",
        tramite: "",
        m_urb: "",
        m_sub: "",
        m_lic: "",
        usos: "",
        area: "",
        vivienda: "",
        cultural: "",
        regla_1: "",
        regla_2: "",
        description: "",
    }
    const MySwal = withReactContent(Swal);
    var [Fun1, setFun1] = useState(fun1Null);
    var [load, setLod] = useState(false);
    var [modal, setModal] = useState(false);

    useEffect(() => {
        _GET_CHILD_1();
    }, [currentItem.fun_1s]);

    // *********************** DATA GETTERS ************************** // 
    let _GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = fun1Null;
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.id = _CHILD[_CURRENT_VERSION].id;
                _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo;
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb;
                _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub;
                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic;
                _CHILD_VARS.usos = _CHILD[_CURRENT_VERSION].usos;
                _CHILD_VARS.area = _CHILD[_CURRENT_VERSION].area;
                _CHILD_VARS.vivienda = _CHILD[_CURRENT_VERSION].vivienda;
                _CHILD_VARS.cultural = _CHILD[_CURRENT_VERSION].cultural;
                _CHILD_VARS.regla_1 = _CHILD[_CURRENT_VERSION].regla_1;
                _CHILD_VARS.regla_2 = _CHILD[_CURRENT_VERSION].regla_2;
                _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description;
            }
        }
        setFun1(_CHILD_VARS);
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
    // ************************** JSX COMPONENTS *********************** // 
    let COMPONENT = () => {
        let values = _GET_STEP_TYPE('s23', 'value');
        let checks = _GET_STEP_TYPE('s23', 'check');
        //let fun_1 = _GET_CHILD_1();
        let FUNModel = currentItem.model
        return <>

            <div className='row  border bg-info text-light text-center fwb-bold py-1'>
                <div className='col'>
                    <label>1. IDENTIFICACION DE LA SOLICITUD</label> {_EDIT_BTN()}
                </div>
            </div>

            <div className='row  border  bg-info text-light text-center fwb-bold py-1'>
                <div className='col'>
                    <label>DATOS FORMULARIO</label>
                </div>
                <div className='col-2'>
                    <label>VERIFICACIÓN</label>
                </div>
                <div className='col-2'>
                    <label>EVALUACIÓN</label>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.1 Tipo De tramite</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_1_PARSER(Fun1.tipo)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[0]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[0]} onChange={() => manage_rl_s23()}>
                       <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[1])} name="s_23_checks"
                        defaultValue={checks[1]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.2 Objeto</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_2_PARSER(Fun1.tramite)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[1]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[1]} onChange={() => manage_rl_s23()}>
                       <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[2])} name="s_23_checks"
                        defaultValue={checks[2]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.3 Modalidad Licencia de Urbanización</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_3_PARSER(Fun1.m_urb)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[2]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[2]} onChange={() => manage_rl_s23()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[3])} name="s_23_checks"
                        defaultValue={checks[3]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>



            <div className='row  border py-0'>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.4 Modalidad Licencia de Subdivisión</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_4_PARSER(Fun1.m_sub)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[3]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[3]} onChange={() => manage_rl_s23()}>
                       <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[4])} name="s_23_checks"
                        defaultValue={checks[4]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.5 Modalidad Licencia de Construcción</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_5_PARSER(Fun1.m_lic)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[4]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[4]} onChange={() => manage_rl_s23()}>
                       <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[5])} name="s_23_checks"
                        defaultValue={checks[5]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.6 Usos</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_6_PARSER(Fun1.usos)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[5]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[5]} onChange={() => manage_rl_s23()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[6])} name="s_23_checks"
                        defaultValue={checks[6]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.7 Área Construida</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_7_PARSER(Fun1.area)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[6]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[6]} onChange={() => manage_rl_s23()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[7])} name="s_23_checks"
                        defaultValue={checks[7]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.8 Tipo de Vivienda</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_8_PARSER(Fun1.vivienda)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[7]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[7]} onChange={() => manage_rl_s23()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[8])} name="s_23_checks"
                        defaultValue={checks[8]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.9 Bien de Interés Cultural</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_9_PARSER(Fun1.cultural)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[6]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[6]} onChange={() => manage_rl_s23()}>
                       <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[9])} name="s_23_checks"
                        defaultValue={checks[9]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0' hidden={FUNModel != 2021}>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.10.1 Declaración sobre medidas de construcción sostenible</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_101_PARSER(Fun1.regla_1)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[9]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[9]} onChange={() => manage_rl_s23()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[10])} name="s_23_checks"
                        defaultValue={checks[10]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0' hidden={FUNModel != 2021}>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-5'>
                            <label>1.10.2 Zónificacion Climática</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_102_PARSER(Fun1.regla_2)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_23_values"
                        defaultValue={values[10]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[10]} onChange={() => manage_rl_s23()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[11])} name="s_23_checks"
                        defaultValue={checks[11]} onChange={() => manage_rl_s23()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-danger">NO APLICA</option>
                    </select>
                </div>
            </div>
        </>
    }
    let _COMPONENT_CHECK = () => {
        const _CHECK_ARRAY = _GET_STEP_TYPE('s23', 'check');
        const _LIST = {
            "0": { desc: "El Formulario Único Nacional está debidamente diligenciado" },
        }
        var _COMPONENT = [];

        for (const item in _LIST) {
            _COMPONENT.push(<>
                <div className="col-9 my-1"><h3 className='fw-bold'>{parseInt(item, 10) + 1}. {_LIST[item].desc}</h3> </div>
                <div className="col-3 my-1"><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item])} name="s_23_checks"
                    defaultValue={_CHECK_ARRAY[item]} onChange={() => manage_rl_s23()} >
                    <option value="0" className="text-danger">NO CUMPLE</option>
                    <option value="1" className="text-success">CUMPLE</option>
                    <option value="2" className="text-danger">NO APLICA</option>

                </select> </div>
            </>)
        }
        return <div className="row">{_COMPONENT}</div>
    }
    let _EDIT_BTN = () => {
        return <>
            <button className='btn btn-sm btn-light m-0 p-1 shadow-none' onClick={() => setModal(!modal)}><i class="far fa-edit" style={{ fontSize: '150%' }}></i></button>

            <Modal contentLabel="EDIT FUN 1"
                isOpen={modal}
                style={quickModalStyle}
                ariaHideApp={false}
            >
                <div className="my-4 d-flex justify-content-between">
                    <label className="fw-bold align-middle"> <i class="far fa-edit" style={{ fontSize: '150%' }}></i>ACTUALIZACIÓN RÁPIDA</label>
                    <MDBBtn className='btn-close' color='none' onClick={() => setModal(!modal)}></MDBBtn>
                </div>

                <FUNN1
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={currentItem}
                    currentVersion={currentVersion}
                    requestUpdate={props.requestUpdate} />


            </Modal>
        </>
    }
    // ******************************* APIS **************************** // 
    var formData = new FormData();
    let manage_rl_s23 = (e) => {
        if (e) e.preventDefault();

        let checks = [];
        let values = [];

        formData = new FormData();

        var checks_html = document.getElementsByName('s_23_checks');
        for (var i = 0; i < checks_html.length; i++) {
            checks.push(checks_html[i].value)
        }
        formData.set('check', checks.join(';'));

        var values_html = document.getElementsByName('s_23_values');
        for (var i = 0; i < values_html.length; i++) {
            values.push(values_html[i].value)
        }
        formData.set('value', values.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordLawId', currentRecord.id);
        formData.set('id_public', 's23');

        save_step('s23', false, formData);

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


    return (
        <div>
            <div className='py-3'>
                {_COMPONENT_CHECK()}
            </div>
            <div className='py-1'>
                {COMPONENT()}
            </div>

        </div>

    );
}