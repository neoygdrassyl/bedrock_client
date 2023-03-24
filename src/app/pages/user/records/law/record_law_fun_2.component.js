import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { _FUN_101_PARSER, _FUN_102_PARSER, _FUN_1_PARSER, _FUN_24_PARSER, _FUN_25_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER, _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER } from '../../../../components/customClasses/funCustomArrays';
import Record_lawService from '../../../../services/record_law.service';
import Modal from 'react-modal';
import { MDBBtn } from 'mdb-react-ui-kit';
import FUNN2 from '../../fun_forms/fun_n_2'

export default function RECORD_LAW_FUN_2(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, quickModalStyle } = props;
    const fun2Null = {
        id: false,
        direccion: "",
        direccion_ant: "",
        matricula: "",
        catastral: "",
        catastral_2: "",
        suelo: "",
        lote_pla: "",

        barrio: "",
        vereda: "",
        comuna: "",
        corregimiento: "",
        lote: "",
        estrato: "",
        manzana: "",
    }
    const MySwal = withReactContent(Swal);
    var [Fun2, setFun2] = useState(fun2Null);
    var [load, setLod] = useState(false);
    var [modal, setModal] = useState(false);

    useEffect(() => {
        _GET_CHILD_2();
    }, [currentItem.fun_2]);

    // *********************** DATA GETTERS ************************** // 
    let _GET_CHILD_2 = () => {
        var _CHILD = currentItem.fun_2;
        var _CHILD_VARS = fun2Null;
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
        setFun2(_CHILD_VARS);
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
        let values = _GET_STEP_TYPE('s24', 'value');
        let checks = _GET_STEP_TYPE('s24', 'check');
        return <>
            <div className='row  border bg-info text-light text-center fwb-bold py-1'>
                <div className='col'>
                    <label>2. INFORMACIÓN SOBRE EL PREDIO</label> {_EDIT_BTN()}
                </div>
            </div>

            <div className='row  border bg-info text-light text-center fwb-bold py-1'>
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
                <div className='col'>
                    <div className='row'>
                        <div className='col-6'>
                            <label>2.1 Dirección o nomenclatura actual</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{Fun2.direccion}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_24_values"
                        defaultValue={values[0]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[0]} onChange={() => manage_rl_s24()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[0])} name="s_24_checks"
                        defaultValue={checks[0]} onChange={() => manage_rl_s24()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col'>
                    <div className='row'>
                        <div className='col-6'>
                            <label>2.1 Dirección o nomenclatura anterior</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{Fun2.direccion_ant}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_24_values"
                        defaultValue={values[1]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[1]} onChange={() => manage_rl_s24()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[1])} name="s_24_checks"
                        defaultValue={checks[1]} onChange={() => manage_rl_s24()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col'>
                    <div className='row'>
                        <div className='col-6'>
                            <label>2.2 Matrícula inmobiliaria</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{Fun2.matricula}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_24_values"
                        defaultValue={values[2]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[2]} onChange={() => manage_rl_s24()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[2])} name="s_24_checks"
                        defaultValue={checks[2]} onChange={() => manage_rl_s24()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select>
                </div>
            </div>
            

            <div className='row  border py-0'>
                <div className='col'>
                    <div className='row'>
                        <div className='col-6'>
                            <label>2.3 Identificación catastral (Viejo)</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{Fun2.catastral}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_24_values"
                        defaultValue={values[3]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[3]} onChange={() => manage_rl_s24()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[3])} name="s_24_checks"
                        defaultValue={checks[3]} onChange={() => manage_rl_s24()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col'>
                    <div className='row'>
                        <div className='col-6'>
                            <label>2.3.2 Identificación catastral (Nuevo)</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{Fun2.catastral_2}</label>
                        </div>
                    </div>
                </div>
                <div className='col-4'>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col'>
                    <div className='row'>
                        <div className='col-6'>
                            <label>2.4 Clasificación del suelo</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_24_PARSER(Fun2.suelo)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_24_values"
                        defaultValue={values[4]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[4]} onChange={() => manage_rl_s24()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[4])} name="s_24_checks"
                        defaultValue={checks[4]} onChange={() => manage_rl_s24()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col'>
                    <div className='row'>
                        <div className='col-6'>
                            <label>2.5 Planimetría del lote</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{_FUN_25_PARSER(Fun2.lote_pla)}</label>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_24_values"
                        defaultValue={values[5]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[5]} onChange={() => manage_rl_s24()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[5])} name="s_24_checks"
                        defaultValue={checks[5]} onChange={() => manage_rl_s24()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row  border py-0'>
                <div className='col'>
                    <div className='row text-center fw-bold'>
                        <div className='col'>
                            <label>2.6 Ubicación</label>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label>2.6.1 Barrio</label>
                        </div>
                        <div className='col'>
                            <div className='row'>
                                <label className='fw-bold'>{Fun2.barrio}</label>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label>2.6.2 Vereda</label>
                        </div>
                        <div className='col'>
                            <div className='row'>
                                <label className='fw-bold'>{Fun2.vereda}</label>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label>2.6.3 Comuna</label>
                        </div>
                        <div className='col'>
                            <div className='row'>
                                <label className='fw-bold'>{Fun2.comuna}</label>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label>2.6.4 Sector</label>
                        </div>
                        <div className='col'>
                            <div className='row'>
                                <label className='fw-bold'>{Fun2.sector}</label>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label>2.6.5 Corregimiento</label>
                        </div>
                        <div className='col'>
                            <div className='row'>
                                <label className='fw-bold'>{Fun2.corregimiento}</label>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label>2.6.6 Lote</label>
                        </div>
                        <div className='col'>
                            <div className='row'>
                                <label className='fw-bold'>{Fun2.lote}</label>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label>2.6.7 Estrato</label>
                        </div>
                        <div className='col'>
                            <div className='row'>
                                <label className='fw-bold'>{Fun2.estrato}</label>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label>2.6.8 Manzana</label>
                        </div>
                        <div className='col'>
                            <div className='row'>
                                <label className='fw-bold'>{Fun2.manzana}</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <select className='form-select form-control form-control-sm' name="s_24_values"
                        defaultValue={values[6]  == 'VERIFICADO' ? 'DILIGENCIADO' : values[6]} onChange={() => manage_rl_s24()}>
                        <option className="text-danger">NO DILIGENCIADO</option>
                        <option className="text-success">DILIGENCIADO</option>
                        <option className="text-warning">NO APLICA</option>
                    </select>
                </div>
                <div className='col-2'>
                    <select className={_GET_SELECT_COLOR_VALUE(checks[6])} name="s_24_checks"
                        defaultValue={checks[6]} onChange={() => manage_rl_s24()}>
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select>
                </div>
            </div>

        </>
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

                <FUNN2
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
    let manage_rl_s24 = (e) => {
        if (e) e.preventDefault();

        let checks = [];
        let values = [];

        formData = new FormData();

        var checks_html = document.getElementsByName('s_24_checks');
        for (var i = 0; i < checks_html.length; i++) {
            checks.push(checks_html[i].value)
        }
        formData.set('check', checks.join(';'));

        var values_html = document.getElementsByName('s_24_values');
        for (var i = 0; i < values_html.length; i++) {
            values.push(values_html[i].value)
        }
        formData.set('value', values.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordLawId', currentRecord.id);
        formData.set('id_public', 's24');

        save_step('s24', false, formData);

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
            {COMPONENT()}
        </div>

    );
}
