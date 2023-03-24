import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { _FUN_101_PARSER, _FUN_102_PARSER, _FUN_1_PARSER, _FUN_24_PARSER, _FUN_25_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER, _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER } from '../../../../components/customClasses/funCustomArrays';
import VIZUALIZER from '../../../../components/vizualizer.component';
import Record_lawService from '../../../../services/record_law.service';
import Modal from 'react-modal';
import { MDBBtn } from 'mdb-react-ui-kit';
import FUNService from '../../../../services/fun.service';

export default function RECORD_LAW_FUN_51(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, quickModalStyle } = props;
    const MySwal = withReactContent(Swal);

    var [Fun51, setFun51] = useState([]);
    var [load, setLod] = useState(false);
    var [modal, setModal] = useState({});

    useEffect(() => {
        _GET_CHILD_51();
    }, [currentItem.fun_51s]);

    // *********************** DATA GETTERS ************************** // 
    let _GET_CHILD_51 = () => {
        var _CHILD = currentItem.fun_51s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        setFun51(_LIST);
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
    let _CHILD_6_SELECT = () => {
        let _LIST = _GET_CHILD_6();
        let _COMPONENT = [];
        for (var i = 0; i < _LIST.length; i++) {
            _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
        }
        return <>{_COMPONENT}</>
    }
    let _REGEX_IDNUMBER = (e) => {
        let regex = /^[0-9]+$/i;
        let test = regex.test(e.target.value);
        if (test) {
            var _value = Number(e.target.value).toLocaleString();
            _value = _value.replaceAll(',', '.');
            document.getElementById(e.target.id).value = _value;
        }
    }
    let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
        if (!_VALUE) {
            return 'form-select text-danger';
        }
        if (_VALUE == 0) {
            return 'form-select text-danger';
        }
        if (_VALUE == 1) {
            return 'form-select text-success';
        }
        if (_VALUE == 2) {
            return 'form-select text-warning';
        } else {
            return 'form-select';
        }
    }
    let _GET_DOCS_BTN = (_id, typeIndex) => {
        if (_id < 1) return ''
        let ColorIndex = ['DeepSkyBlue', 'DarkOrchid', 'GoldenRod', 'LimeGreen'];
        let IconIndex = ['far fa-id-card fa-2x me-1', 'far fa-id-badge fa-2x me-1', 'fas fa-book fa-2x me-1', 'fas fa-file-invoice fa-2x me-1']
        return <VIZUALIZER url={_FIND_6(_id).path + "/" + _FIND_6(_id).filename} apipath={'/files/'}
            icon={IconIndex[typeIndex]} color={ColorIndex[typeIndex]} />
    }

    // ************************** JSX COMPONENTS *********************** // 
    let COMPONENT = () => {
        return <>
            <div className='row  border bg-info text-light text-center fwb-bold py-1'>
                <div className='col'>
                    <label>5.1. TITULARES DE LA LICENCIA</label>
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

            {Fun51.map((value, index) => {
                let docsValues = value.docs ? value.docs.split(',') : [0, 0]
                return <>
                    <div className='row  border border-dark py-1 text-center fw-bold'>
                        <div className='col'>
                            <label>Titular No. {index + 1}</label> {_EDIT_BTN(value)}
                        </div>
                    </div>
                    <div className='row  border border-dark py-1'>
                        <div className='col'>
                            <div className='row border py-0' >
                                <div className='col-4'>
                                    <label>Nombre</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.name + ' ' + value.surname}</label>
                                </div>
                            </div>
                            <div className='row border py-0' >
                                <div className='col-4'>
                                    <label>CC / NIT</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.id_number}</label>
                                </div>
                            </div>
                            <div className='row border py-0'>
                                <div className='col-4'>
                                    <label>Teléfono</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.nunber}</label>
                                </div>
                            </div>
                            <div className='row border py-0'>
                                <div className='col-4'>
                                    <label>Correo</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.email}</label>
                                </div>
                            </div>
                            <div className='row border py-0'>
                                <div className='col-4'>
                                    <label>En Calidad de:</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.role}</label>
                                </div>
                            </div>
                            {value.rep_name ?
                                <>
                                    <div className='row border py-0'>
                                        <div className='col-4'>
                                            <label>Representante Legal</label>
                                        </div>
                                        <div className='col'>
                                            <label className='fw-bold'>{value.rep_name}</label>
                                        </div>
                                    </div>
                                    <div className='row border py-0'>
                                        <div className='col-4'>
                                            <label>CC. Representante Legal</label>
                                        </div>
                                        <div className='col'>
                                            <label className='fw-bold'>{value.rep_id_number}</label>
                                        </div>
                                    </div>

                                </>
                                : ''}
                            <div className='row border py-0'>
                                <div className='row text-center fw-bold'>
                                    <div className='col'>
                                        <label>Documentos</label>
                                    </div>
                                </div>
                                <div className='row'>
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
                                <div className='row'>
                                    <div className='col'>
                                        <label>Certificado de Existencia y Representación Legal
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
                        </div>
                        <div className='col'>
                            <div className='row'>
                                {_COMPONENT_CHECK(index)}
                            </div>
                        </div>
                    </div>
                </>
            })}



        </>
    }

    let _COMPONENT_CHECK = (index) => {
        let _CHECK_ARRAY = _GET_STEP_TYPE('f51', 'check');
        const _LIST = [
            { desc: "Certificado de Tradición. Titular del dominio", },
            { desc: "Coincide el número de cedula con certificado de tradición", },
            { desc: "Aporto copia de la cedula de ciudadanía", },
            { desc: "Firma original en el FUN", },
            { desc: "¿Quien firma esta legitimado para ello?",  },

        ]
        return _LIST.map((value, i) => {
            let ci = i + index * 5
            return <>
                <div className='row'>
                    <div className="col-8 py-0"><label> <label className='fw-bold'>{i + 1}. </label>{value.desc}</label> </div>
                    <div className="col-4 py-0 ">
                        <div class="input-group input-group-sm">

                            <select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[ci])} name="s_f51_checks"
                                defaultValue={_CHECK_ARRAY[ci]} onChange={() => manage_rl_sf51(false)}>
                                {value.alt
                                    ? <>
                                        <option value="0" className="text-danger">{value.alt[0]}</option>
                                        <option value="1" className="text-success">{value.alt[1]}</option>
                                    </>
                                    : <>
                                        <option value="0" className="text-danger">NO</option>
                                        <option value="1" className="text-success">SI</option>
                                    </>}
                            </select>
                        </div>
                    </div>
                </div>

            </>
        })
    }
    let _EDIT_BTN = (item) => {
        return <>
            <button className='btn btn-sm btn-light m-0 p-1 shadow-none' onClick={() => setModal({ [item.id]: true })}><i class="far fa-edit" style={{ fontSize: '150%' }}></i></button>

            <Modal contentLabel="EDIT FUN 1"
                isOpen={modal[item.id]}
                style={quickModalStyle}
                ariaHideApp={false}
            >
                <div className="my-4 d-flex justify-content-between">
                    <label className="fw-bold align-middle"> <i class="far fa-edit" style={{ fontSize: '150%' }}></i>ACTUALIZACIÓN RÁPIDA</label>
                    <MDBBtn className='btn-close' color='none' onClick={() => setModal({ [item.id]: false })}></MDBBtn>
                </div>
                {_EDIT_COMPONENT(item)}


            </Modal>
        </>
    }
    let _EDIT_COMPONENT = (item) => {
        let docs = item.docs;
        if (!docs) docs = "";
        docs = docs.split(',');
        let isLegalPerson = item.type == 'PERSONA JURIDICA';
        return <>
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_51">
                    <label className="app-p lead text-center fw-normal text-uppercase">5.1 Titular(es) de la Licencia</label>
                </legend>
                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.0 Tipo de Persona</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <select className='form-select' id="f_51_type" defaultValue={item.type}
                                onChange={(e) => {
                                    if (e.target.value == 'PERSONA JURIDICA') {
                                        document.getElementById('f_51_rep_name').disabled = false;
                                        document.getElementById('f_51_rep_idnumber').disabled = false;
                                        document.getElementById('f_51_doc2').disabled = false;
                                    } else {
                                        document.getElementById('f_51_rep_name').disabled = true;
                                        document.getElementById('f_51_rep_idnumber').disabled = true;
                                        document.getElementById('f_51_doc2').disabled = true;
                                    }
                                }}>
                                <option>PERSONA NATURAL</option>
                                <option>PERSONA JURIDICA</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.0.1 Nombre y Apellidos (Representante Legal)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_51_rep_name" disabled={!isLegalPerson} defaultValue={item.rep_name} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.0.2 Cédula (Representante Legal)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_51_rep_idnumber" disabled={!isLegalPerson} defaultValue={item.rep_id_number}
                                onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.1 Nombre</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5111" defaultValue={item.name} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.1 Apellido(s)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5112" defaultValue={item.surname} />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.2 CC o NIT</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-id-card"></i>
                            </span>
                            <input type="text" class="form-control" id="f_512" defaultValue={item.id_number}
                                onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.3 Correo Electrónico</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" id="f_513" defaultValue={item.email} />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.4 Teléfono de Contacto</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_514" defaultValue={item.nunber} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.5 Tipo de Titular</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
                            </span>
                            <select className='form-select' id="f_515" defaultValue={item.role}>
                                <option>PROPIETARIO</option>
                                <option>PROPIETARIO COMUNEROS</option>
                                <option>PROPIETARIO FIDUCIARIA</option>
                                <option>FIDEICOMITENTE</option>
                                <option>USUFRUCTUARIO</option>
                                <option>NACION U OTRA ENTIDAD</option>
                                <option>POSEEDOR</option>
                                <option>OTRO</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.6 Relacionar Documento: Documento de Identidad</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_51_doc1" defaultValue={docs[0]}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.7 Relacionar Documento: Certificado de Existencia y Representación Legal </label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_51_doc2" disabled={!isLegalPerson} defaultValue={docs[1]}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row mb-3 text-center">
                    <div className="col-12">
                        <button className="btn btn-success my-3" onClick={() => edit_51(item)} ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                    </div>
                </div>
            </fieldset>
        </>
    }
    // ******************************* APIS **************************** // 
    var formData = new FormData();
    let manage_rl_sf51 = (e) => {

        let checks = [];
        let values = [];

        formData = new FormData();

        var checks_html = document.getElementsByName('s_f51_checks');
        for (var i = 0; i < checks_html.length; i++) {
            checks.push(checks_html[i].value)
        }
        formData.set('check', checks.join(';'));


        formData.set('version', currentVersionR);
        formData.set('recordLawId', currentRecord.id);
        formData.set('id_public', 'f51');

        save_step('f51', false, formData);

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
    let edit_51 = (item) => {
        formData = new FormData();

        let type = document.getElementById("f_51_type").value;
        formData.set('type', type);
        if (type == "PERSONA JURIDICA") {
            let rep_name = document.getElementById("f_51_rep_name").value;
            formData.set('rep_name', rep_name);
            let rep_id_number = document.getElementById("f_51_rep_idnumber").value;
            formData.set('rep_id_number', rep_id_number);
        } else {
            formData.set('rep_name', "");
            formData.set('rep_id_number', "");
        }

        let name = document.getElementById("f_5111").value;
        formData.set('name', name);
        let surname = document.getElementById("f_5112").value;
        formData.set('surname', surname);
        let id_number = document.getElementById("f_512").value;
        formData.set('id_number', id_number);
        let email = document.getElementById("f_513").value;
        formData.set('email', email);
        let nunber = document.getElementById("f_514").value;
        formData.set('nunber', nunber);
        let role = document.getElementById("f_515").value;
        formData.set('role', role);

        let docs = [];
        docs.push(document.getElementById("f_51_doc1").value);
        docs.push(document.getElementById("f_51_doc2").value);
        formData.set('docs', docs.join());

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        FUNService.update_51(item.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
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

    return (
        <div>
            {COMPONENT()}
        </div>

    );
}
