import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { _FUN_101_PARSER, _FUN_102_PARSER, _FUN_1_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER, _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER } from '../../../../components/customClasses/funCustomArrays';
import VIZUALIZER from '../../../../components/vizualizer.component';
import Record_lawService from '../../../../services/record_law.service';
import Modal from 'react-modal';
import { MDBBtn } from 'mdb-react-ui-kit';
import FUNN53 from '../../fun_forms/fun_n_53'

export default function RECORD_LAW_FUN_53(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, quickModalStyle } = props;
    const fun53Null = {
        id: false,
        name: "",
        surname: "",
        id_number: "",
        role: "",
        number: "",
        email: "",
        address: "",
        docs: [],
    }
    const MySwal = withReactContent(Swal);
    var [Fun53, setFun53] = useState(fun53Null);
    var [load, setLod] = useState(false)
    var [modal, setModal] = useState(false);

    useEffect(() => {
        _GET_CHILD_53();
    }, [currentItem.fun_53s]);

    // *********************** DATA GETTERS ************************** // 
    let _GET_CHILD_53 = () => {
        var _CHILD = currentItem.fun_53s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = fun53Null;
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.id = _CHILD[_CURRENT_VERSION].id ?? false;
                _CHILD_VARS.name = _CHILD[_CURRENT_VERSION].name ?? '';
                _CHILD_VARS.surname = _CHILD[_CURRENT_VERSION].surname ?? '';
                _CHILD_VARS.id_number = _CHILD[_CURRENT_VERSION].id_number ?? '';
                _CHILD_VARS.role = _CHILD[_CURRENT_VERSION].role ?? '';
                _CHILD_VARS.number = _CHILD[_CURRENT_VERSION].number ?? '';
                _CHILD_VARS.email = _CHILD[_CURRENT_VERSION].email ?? '';
                _CHILD_VARS.address = _CHILD[_CURRENT_VERSION].address ?? '';
                _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs ? _CHILD[_CURRENT_VERSION].docs.split(',') : [];
            }
        }
        setFun53(_CHILD_VARS);
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
    // ************************ DATA CONVERTERS ************************ // 
    let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
        if (!_VALUE) {
            return 'form-select text-danger';
        }
        if (_VALUE == 0 || _VALUE == 'NO') {
            return 'form-select text-danger';
        }
        if (_VALUE == 1 || _VALUE == 'SI') {
            return 'form-select text-success';
        }
        if (_VALUE == 2 || _VALUE == 'NA') {
            return 'form-select text-warning';
        } else {
            return 'form-select';
        }
    }
    let _GET_DOCS_BTN = (_id, typeIndex) => {
        if (_id < 1 || !_id) return ''
        let ColorIndex = ['DeepSkyBlue', 'DarkOrchid', 'GoldenRod', 'LimeGreen'];
        let IconIndex = ['far fa-id-card fa-2x me-1', 'far fa-id-badge fa-2x me-1', 'fas fa-book fa-2x me-1', 'fas fa-file-invoice fa-2x me-1']
        return <VIZUALIZER url={_FIND_6(_id).path + "/" + _FIND_6(_id).filename} apipath={'/files/'}
            icon={IconIndex[typeIndex]} color={ColorIndex[typeIndex]} />
    }
    // ************************** JSX COMPONENTS *********************** // 
    let COMPONENT = () => {
        let docsValues = Fun53.docs;
        return <>

            <div className='row  border bg-info text-light text-center fwb-bold py-1'>
                <div className='col'>
                    <label>5.3 RESPONSABLE DE LA SOLICITUD</label> {_EDIT_BTN()}
                </div>
            </div>

            <div className='row  border bg-info text-light text-center fwb-bold py-1'>
                <div className='col'>
                    <label>DATOS FORMULARIO</label>
                </div>
                <div className='col'>
                    <label>VERIFICACION CURADURIA URBANA</label>
                </div>
            </div>

            <div className='row'>
                <div className='col'>

                    <div className='row border py-0'>
                        <div className='col-4'>
                            <label>Nombre</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{Fun53.name + ' ' + Fun53.surname}</label>
                        </div>
                    </div>
                    <div className='row border py-0'>
                        <div className='col-4'>
                            <label>En Calidad de:</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{Fun53.role}</label>
                        </div>
                    </div>
                    <div className='row border py-0'>
                        <div className='col-4'>
                            <label>Cedula</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{Fun53.id_number}</label>
                        </div>
                    </div>
                    <div className='row border py-0'>
                        <div className='col-4'>
                            <label>Dirección correspondencia</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{Fun53.address}</label>
                        </div>
                    </div>
                    <div className='row border py-0'>
                        <div className='col-4'>
                            <label>Correo electrónico</label>
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{Fun53.email}</label>
                        </div>
                    </div>
                    <div className='row text-center fw-bold'>
                        <div className='col'>
                            <label>Documentos</label>
                        </div>
                    </div>
                    <div className='row border py-0'>
                        <div className='col'>
                            <label>Doc. de Identidad
                            </label>
                        </div>
                        <div className='col-2'>
                            {_GET_DOCS_BTN(docsValues[0], 0)}
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{docsValues[0] != 0 ? 'SI APORTO' : 'NO APORTO'}</label>
                        </div>
                    </div>
                    <div className='row border py-0'>
                        <div className='col'>
                            <label>Poder, mandato o autorización debidamente otorgado
                            </label>
                        </div>
                        <div className='col-2'>
                            {_GET_DOCS_BTN(docsValues[1], 1)}
                        </div>
                        <div className='col'>
                            <label className='fw-bold'>{docsValues[1] != 0 ? 'SI APORTO' : 'NO APORTO'}</label>
                        </div>
                    </div>
                </div>

                <div className='col'>
                    {_COMPONENT_CHECK()}
                </div>
            </div>

        </>
    }
    let _COMPONENT_CHECK = () => {
        //let _CHECK_ARRAY = _GET_STEP_TYPE('f53', 'check');
        let _VALUE_ARRAY = _GET_STEP_TYPE('f53', 'check');
        const _LIST = [
            {
                desc: "El poder está Debidamente notariado", ind: 0,
                subItems: ['Con nota de presentación personal', ]
            },
            { desc: "Señala el mandato", ind: 6, },
            { desc: "Firmado por el poderdante y el apoderado", ind: 7, },
            { desc: "Tipo de Poder", alt: ['GENERAL', 'ESPECIAL', 'MANDATO', 'NO APLICA'], className: "form-select", ind: 4, },
            { desc: "(Si el tipo de poder es GENERAL) Aporta certificado de vigencia, fecha de expedición inferior a un mes", alt: ['NO', 'SI', 'NA'], ind: 5, },
            { desc: "Firma original en el FUN", ind: 1, },
            { desc: "¿Quien firma legitimado para ello?", ind: 2, },
            { desc: "Autorizó notificación electrónica", ind: 3, },
        ]
        return _LIST.map((value, i) => {
            return <>
                <div className='row'>
                    <div className="col-8 py-0"><label> <label className='fw-bold'>{i + 1}. </label>{value.desc}</label> </div>
                    <div className="col-4 py-0 ">
                        <div class="input-group input-group-sm">

                            <select className={value.className ?? _GET_SELECT_COLOR_VALUE(_VALUE_ARRAY[value.ind])} name="s_f53_checks"
                                defaultValue={_VALUE_ARRAY[value.ind]} onChange={() => manage_rl_f53(false)} id={'s_f53_checks_' + value.ind}>
                                {value.alt
                                    ? <>
                                        {value.alt.map((value2, j) => <option value={j}>{value2}</option>)}
                                    </>
                                    : <>
                                        <option value="0" className="text-danger">NO</option>
                                        <option value="1" className="text-success">SI</option>
                                        <option value="2" className="text-danger">NA</option>
                                    </>}
                            </select>
                        </div>

                    </div>
                </div>
                {value.subItems ?
                    value.subItems.map(v => <div className='row'><div className="col-8 py-0 "><label>- {v} </label> </div></div>)
                    : ''}

            </>
        })
    }
    let _COMPOENTN_DETAIL = () => {
        let values = _GET_STEP_TYPE('f53', 'value');
        return <>
            <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                <div className='col'>
                    <label>OBSERVACIONES FORMULARIO ÚNICO NACIONAL</label>
                </div>
            </div>
            <div className="row">
                <div className="col-12">

                    <textarea className="input-group" maxLength="4096" name="s_f53_values" rows="3"
                        defaultValue={values[0]} onBlur={() => manage_rl_f53(false)}></textarea>
                    <label>(maximo 4000 caracteres)</label>
                </div>
            </div></>
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

                <FUNN53
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
    let manage_rl_f53 = (useSwal) => {
        let checks = [];
        let values = [];

        formData = new FormData();

        var checks_html = document.getElementsByName('s_f53_values');
        for (var i = 0; i < checks_html.length; i++) {
            values.push(checks_html[i].value)
        }
        formData.set('value', values.join(';'));

        checks_html = document.getElementsByName('s_f53_checks');
        for (var i = 0; i < checks_html.length; i++) {
            let element = document.getElementById('s_f53_checks_' + i)
            checks.push(element.value)
        }
        formData.set('check', checks.join(';'));



        formData.set('version', currentVersionR);
        formData.set('recordLawId', currentRecord.id);
        formData.set('id_public', 'f53');

        save_step('f53', useSwal, formData);

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
        <div className='mt-4'>
            {COMPONENT()}
            {_COMPOENTN_DETAIL()}
        </div>

    );
}
