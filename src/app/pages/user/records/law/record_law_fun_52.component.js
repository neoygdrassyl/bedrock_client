import React, { useEffect, useState } from 'react';
import ReactHTMLDatalist from "react-html-datalist";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { _FUN_101_PARSER, _FUN_102_PARSER, _FUN_1_PARSER, _FUN_24_PARSER, _FUN_25_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER, _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER } from '../../../../components/customClasses/funCustomArrays';
import VIZUALIZER from '../../../../components/vizualizer.component';
import Record_lawService from '../../../../services/record_law.service';
import Modal from 'react-modal';
import { MDBBtn } from 'mdb-react-ui-kit';
import FUNService from '../../../../services/fun.service';
import moment from 'moment';
import { Divider } from 'rsuite';

export default function RECORD_LAW_FUN_52(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, quickModalStyle } = props;
    const MySwal = withReactContent(Swal);

    var [Fun52, setFun52] = useState([]);
    var [load, setLod] = useState(false)
    var [modal, setModal] = useState(false);
    var [dataListPrfesionals, setDataP] = useState([]);
    var [searchingP, setSearchingP] = useState(false);

    useEffect(() => {
        _GET_CHILD_52();
    }, [currentItem.fun_52s]);

    // *********************** DATA GETTERS ************************** // 
    let _GET_CHILD_51_L = () => {
        var _CHILD = currentItem.fun_51s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST
    }
    let _GET_CHILD_52_L = () => {
        var _CHILD = currentItem.fun_52s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST
    }
    let _GET_CHILD_52 = () => {
        var _CHILD = currentItem.fun_52s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        setFun52(_LIST);
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

    let process_dataList = (inputText, dataList, _scope) => {
        profSearch(inputText);
        if (dataList) {
            let worker = JSON.parse(dataList);
            document.getElementById("f_5211" + _scope).value = worker.name;
            document.getElementById("f_5212" + _scope).value = worker.surname;
            document.getElementById("f_522" + _scope).value = worker.id_number;
            document.getElementById("f_524" + _scope).value = worker.number;
            document.getElementById("f_523" + _scope).value = worker.email;
            document.getElementById("f_526" + _scope).value = worker.registration;
            document.getElementById("f_527" + _scope).value = worker.registration_date;
            document.getElementById("f_5210" + _scope).value = worker.sanction ? 1 : 0;

            if (worker.registration_date) {
                _GET_YEARS_EXPERIENCE(_scope)
            }
        }
    }

    let profSearch = (val) => {
        if (val.length) {
            setSearchingP(true)
            FUNService.consult_Profesional(val)
                .then(response => {
                    if (response.data.length) {
                        setDataP(response.data)
                        setSearchingP(false)
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
        else setSearchingP(false)
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
        if (_id < 1 || _id == null || _id == undefined) return ''
        let ColorIndex = ['DeepSkyBlue', 'DarkOrchid', 'GoldenRod', 'LimeGreen', 'tomato', 'gray'];
        let IconIndex = ['far fa-id-card fa-2x', 'far fa-file-alt fa-2x', 'far fa-file-alt fa-2x', 'far fa-file-alt fa-2x', 'far fa-file-alt fa-2x', 'far fa-file-alt fa-2x']
        return <VIZUALIZER url={_FIND_6(_id).path + "/" + _FIND_6(_id).filename} apipath={'/files/'}
            icon={IconIndex[typeIndex]} color={ColorIndex[typeIndex]} />
    }
    let _GET_YEARS_EXPERIENCE = (id) => {
        let idate = document.getElementById('f_527' + id).value;
        let date = moment(idate).format('YYYY-MM-DD');
        let today = moment().format('YYYY-MM-DD');
        let timePassed = moment(today).diff(date, 'months');
        let years = Math.trunc(timePassed / 12);
        let months = Math.trunc(timePassed % 12);
        document.getElementById('f_529' + id).value = years;
        document.getElementById('f_529m' + id).value = months;
    }
    let _COMPY_COMPONENT = (_scope) => {
        return <>
            <div className="row">
                <div className="col">
                    <label>Busqueda de Profesional. {searchingP ? <label className='fw-bold'>Buscando...</label> : ''}</label>
                    <div class="input-group my-1">
                        <span class="input-group-text bg-success text-white">
                            <i class="fas fa-search"></i>
                        </span>
                        <ReactHTMLDatalist
                            name={"search_52"}
                            onChange={(e) => process_dataList(e.target.text, e.target.value, _scope)}
                            classNames={"form-control"}
                            options={dataListPrfesionals.map(v => {
                                let searchTerm = (v.name + ' ' + v.surname).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
                                return { text: searchTerm, value: JSON.stringify(v) }
                            })}
                        />
                    </div>
                </div>
            </div>
        </>

    }
    // ************************** JSX COMPONENTS *********************** // 
    let COMPONENT = () => {
        //let values = _GET_STEP_TYPE('f52', 'check');
        let original_f52 = Fun52.map((f52, i) => { return { ...f52, index: i } });
        let fl = {
            'URBANIZADOR/PARCELADOR': 0,
            'URBANIZADOR O CONSTRUCTOR RESPONSABLE': 1,
            'DIRECTOR DE LA CONSTRUCCION': 1,
            'ARQUITECTO PROYECTISTA': 2,
            'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL': 3,
            'DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES': 4,
            'INGENIERO CIVIL GEOTECNISTA': 5,
            'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO': 6,
            'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES': 7,
            'OTROS PROFESIONALES ESPECIALISTAS': 8,
        };
        original_f52.sort((a, b) => fl[a.role] - fl[b.role]);
        return <>
            <div className='row  border bg-info text-light text-center fwb-bold py-1 '>
                <div className='col'>
                    <label>5.2. PROFESIONALES RESPONSABLES:</label>
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

            {original_f52.map((value, index) => {
                let docsValues = value.docs ? value.docs.split(',') : [0, 0, 0, 0, 0]
                return <>
                    <div className='row  border border-dark py-0 text-center fw-bold'>
                        <div className='col'>
                            <label>Profesional No. {index + 1}</label> {_EDIT_BTN(value)}
                        </div>
                    </div>
                    <div className='row  border-dark border py-0 text-center fw-bold' style={{ 'backgroundColor': 'lightgray' }}>
                        <div className='col'>
                            <label>Responsabilidad: {value.role}</label>
                        </div>
                    </div>
                    <div className='row border border-dark'>
                        <div className='col'>
                            <div className='row  border py-0'>
                                <div className='col-4'>
                                    <label>Profesional</label>
                                </div>
                                <div className='col'>
                                    <label>Datos Formulario</label>
                                </div>
                            </div>
                            <div className='row  border py-0'>
                                <div className='col-4'>
                                    <label>Nombre</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.name + ' ' + value.surname}</label>
                                </div>
                            </div>
                            <div className='row  border py-0'>
                                <div className='col-4'>
                                    <label>Matrícula</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.registration} Expedida: {value.registration_date}</label>
                                </div>
                            </div>

                            <div className='row  border py-0'>
                                <div className='col-4'>
                                    <label>Cédula</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.id_number}</label>
                                </div>
                            </div>
                            <div className='row  border py-0'>
                                <div className='col-4'>
                                    <label>Correo</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.email}</label>
                                </div>
                            </div>
                            <div className='row  border py-0'>
                                <div className='col-4'>
                                    <label>Experiencia</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{Math.trunc(value.expirience / 12)} Año(s)</label>
                                </div>
                            </div>
                            <div className='row  border py-0'>
                                <div className='col-4'>
                                    <label>Sanciones</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.sanction ? 'SI' : 'NO'}</label>
                                </div>
                            </div>
                            <div className='row  border py-0'>
                                <div className='col-4'>
                                    <label>Supervisión Técnica</label>
                                </div>
                                <div className='col'>
                                    <label className='fw-bold'>{value.supervision}</label>
                                </div>
                            </div>
                        </div>
                        <div className='col'>
                            <div className='row  border py-0'>
                                <div className='col'>
                                    <div className='row text-center fw-bold'>
                                        <div className='col'>
                                            <label>Documentos aportados y consulta consejo profesional CP</label>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col'>
                                            <label>Cédula</label>
                                        </div>
                                        <div className='col-2'>
                                            {_GET_DOCS_BTN(docsValues[0], 0)}
                                        </div>
                                        <div className='col'>
                                            <label className='fw-bold'>{docsValues[0] >= 1 || docsValues[0] == -1 ? 'SI APORTO' : 'NO APORTO'}</label>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col'>
                                            <label>Matricula</label>
                                        </div>
                                        <div className='col-2'>
                                            {_GET_DOCS_BTN(docsValues[1], 1)}
                                        </div>
                                        <div className='col'>
                                            <label className='fw-bold'>{docsValues[1] >= 1 || docsValues[1] == -1 ? 'SI APORTO' : 'NO APORTO'}</label>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col'>
                                            <label>Certificado de Vigencia</label>
                                        </div>
                                        <div className='col-2'>
                                            {_GET_DOCS_BTN(docsValues[2], 2)}
                                        </div>
                                        <div className='col'>
                                            <label className='fw-bold'>{docsValues[2] >= 1 || docsValues[2] == -1 ? 'SI APORTO' : 'NO APORTO'}</label>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col'>
                                            <label> Hoja de vida</label>
                                        </div>
                                        <div className='col-2'>
                                            {_GET_DOCS_BTN(docsValues[3], 3)}
                                        </div>
                                        <div className='col'>
                                            <label className='fw-bold'>{docsValues[3] >= 1 || docsValues[3] == -1 ? 'SI APORTO' : 'NO APORTO'}</label>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col'>
                                            <label> Estudios de postgrado</label>
                                        </div>
                                        <div className='col-2'>
                                            {_GET_DOCS_BTN(docsValues[4], 4)}
                                        </div>
                                        <div className='col'>
                                            <label className='fw-bold'>{docsValues[4] >= 1 || docsValues[4] == -1 ? 'SI APORTO' : 'NO APORTO'}</label>
                                        </div>
                                    </div>
                                     <div className='row'>
                                        <div className='col'>
                                            <label> Certificados</label>
                                        </div>
                                        <div className='col-2'>
                                            {_GET_DOCS_BTN(docsValues[5], 5)}
                                        </div>
                                        <div className='col'>
                                            <label className='fw-bold'>{docsValues[5] >= 1 || docsValues[5] == -1 ? 'SI APORTO' : 'NO APORTO'}</label>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            {_COMPONENT_CHECK(value.index)}
                        </div>
                    </div>


                </>
            })}



        </>
    }
    let _COMPONENT_CHECK = (index) => {
        const _CHECK_ARRAY = _GET_STEP_TYPE('f52', 'check');
        const _LIST = [
            { desc: "Acreditó experiencia", j: 2 },
            { desc: "Firma original en el FUN", alt: false, j: 1 },
            { desc: "Matricula profesional vigente", j: 0 },
        ]
        return _LIST.map((value, i) => {
            let ci = index * 3 + value.j
            return <>
                <div className='row'>
                    <div className="col-8 py-0"><label> <label className='fw-bold'>{i + 1}. </label>{value.desc}</label> </div>
                    <div className="col-4 py-0 ">
                        <div class="input-group input-group-sm">

                            <select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[ci])} name="s_f52_checks" id={'s_f52_check_' + ci}
                                defaultValue={_CHECK_ARRAY[ci]} onChange={() => manage_rl_sf52(false)}>
                                {value.alt
                                    ? <>
                                        <option value="0" className="text-danger">{value.alt[0]}</option>
                                        <option value="1" className="text-success">{value.alt[1]}</option>
                                    </>
                                    : <>
                                        <option value="0" className="text-danger">NO</option>
                                        <option value="1" className="text-success">SI</option>
                                        <option value="2" className="text-success">NA</option>
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

            <Modal contentLabel="EDIT FUN 52"
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

        let experience_m = item.expirience;
        let experience_months_left = experience_m % 12;
        let experience_y = Math.trunc(experience_m / 12);

        return <>
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_52">
                    <label className="app-p lead text-center fw-normal text-uppercase">5.2 Profesionales Responsables</label>
                </legend>

                {_COMPY_COMPONENT('')}

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.1 Nombre</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5211" defaultValue={item.name} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.1 Apellido(s)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5212" defaultValue={item.surname} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.2 Cédula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-id-card"></i>
                            </span>
                            <input type="text" class="form-control" id="f_522" defaultValue={item.id_number}
                                onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.3 Correo Electrónico</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" id="f_523" defaultValue={item.email} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-12">
                        <label>5.2.5 Rol que Desempeña (Puede seleccionar multiples usando la tecla ctrl)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user-graduate"></i>
                            </span>
                            <select class="form-select" id="f_525" defaultValue={item.role}>
                                <option>URBANIZADOR/PARCELADOR</option>
                                <option value={'URBANIZADOR O CONSTRUCTOR RESPONSABLE'}>(2021) URBANIZADOR O CONSTRUCTOR RESPONSABLE</option>
                                <option value={'DIRECTOR DE LA CONSTRUCCION'}>(2022) DIRECTOR DE LA CONSTRUCCION</option>
                                <option>ARQUITECTO PROYECTISTA</option>
                                <option>INGENIERO CIVIL DISEÑADOR ESTRUCTURAL</option>
                                <option>DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES</option>
                                <option>INGENIERO CIVIL GEOTECNISTA</option>
                                <option>INGENIERO TOPOGRAFO Y/O TOPÓGRAFO</option>
                                <option>REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES</option>
                                <option>OTROS PROFESIONALES ESPECIALISTAS</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.4 Teléfono de Contacto</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_524" defaultValue={item.number} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.6 No. Matrícula Profesional</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-file-contract"></i>
                            </span>
                            <input type="text" class="form-control" id="f_526" defaultValue={item.registration} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.7 Fecha expedición Matrícula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" max="2100-01-01" id="f_527" defaultValue={item.registration_date}
                                onChange={() => _GET_YEARS_EXPERIENCE('')} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.8 ¿Sancionado?</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <select class="form-select" id="f_5210" defaultValue={item.sanction}>
                                <option value="0">NO</option>
                                <option value="1">SI</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.9 Tiempo de Experiencia (Años y meses)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                Años:
                            </span>
                            <input type="number" step="1" min="0" id="f_529" placeholder="Años" class="form-control" defaultValue={experience_y} />
                            <span class="input-group-text bg-info text-white ms-1">
                                Meses:
                            </span>
                            <input type="number" step="1" min="0" id="f_529m" placeholder="Meses" class="form-control" defaultValue={experience_months_left} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.10 Supervisión técnica</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-eye"></i>
                            </span>
                            <select class="form-select" id="f_528" defaultValue={item.supervision}>
                                <option selected>N/A</option>
                                <option>SI</option>
                                <option>NO</option>
                            </select>
                        </div>
                    </div>

                </div>

                <Divider>DOCUMENTOS</Divider>

                <div className="row mb-2">
                    <div className="col-6">
                        <label>5.2.11.1 Hoja de Vida</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_114" defaultValue={docs[3]}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.2 Relacionar Documento: Documento de Identidad</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_111" defaultValue={docs[0]}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.3 Relacionar Documento: Matricula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_112" defaultValue={docs[1]}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.4 Relacionar Documento: Vigencia Matricular</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_113" defaultValue={docs[2]}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.5 Relacionar Documento: Estudios de postgrado</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_115" defaultValue={docs[4]}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                     <div className="col-6">
                        <label>5.2.11.6 Relacionar Documento: Certificados</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_116" defaultValue={docs[5]}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>

                </div>

                <div className="text-center">
                    <button className="btn btn-success my-3" onClick={() => edit_52(item)}>
                        <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                    </button>
                </div>
            </fieldset>
        </>
    }
    // ******************************* APIS **************************** // 
    var formData = new FormData();
    let manage_rl_sf52 = (useSwal) => {
        let checks = [];
        let values = [];
        let n = Fun52.length * 3;

        formData = new FormData();

        for (let i = 0; i < n; i++) {
            const element = document.getElementById('s_f52_check_' + i);
            checks.push(element.value)
        }
        formData.set('check', checks.join(';'));

        var values_html = document.getElementsByName('s_f52_values');
        for (var i = 0; i < values_html.length; i++) {
            values.push(values_html[i].value)
        }
        formData.set('value', values.join(';'));


        formData.set('version', currentVersionR);
        formData.set('recordLawId', currentRecord.id);
        formData.set('id_public', 'f52');

        save_step('f52', useSwal, formData);

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
    let edit_52 = (item) => {

        formData = new FormData();

        let name = document.getElementById("f_5211").value;
        formData.set('name', name);
        let surname = document.getElementById("f_5212").value;
        formData.set('surname', surname);
        let id_number = document.getElementById("f_522").value;
        formData.set('id_number', id_number);
        let number = document.getElementById("f_524").value;
        formData.set('number', number);
        let email = document.getElementById("f_523").value;
        formData.set('email', email);

        // 5.2.5 THIS IS A SELECT THAT CAN BE MULTIPLE
        let role = [];
        let select = document.getElementById("f_525").selectedOptions;
        for (var option of select) {
            role.push(option.value)
        }
        formData.set('role', role);

        let registration = document.getElementById("f_526").value;
        formData.set('registration', registration);
        let registration_date = document.getElementById("f_527").value; // THIS IS A DATE
        formData.set('registration_date', registration_date);
        let supervision = document.getElementById("f_528").value; // THIS IS A SELECT
        formData.set('supervision', supervision);

        let expirience_y = document.getElementById("f_529").value;
        let expirience_m = document.getElementById("f_529m").value;
        let expirience = parseInt((expirience_y ? expirience_y * 12 : 0) + parseInt(expirience_m ? expirience_m : 0));
        formData.set('expirience', expirience);
        let sanction = document.getElementById("f_5210").value;
        formData.set('sanction', sanction);

        let docs = [];
        docs.push(document.getElementById("f_52_111").value);
        docs.push(document.getElementById("f_52_112").value);
        docs.push(document.getElementById("f_52_113").value);
        docs.push(document.getElementById("f_52_114").value);
        docs.push(document.getElementById("f_52_115").value);
        docs.push(document.getElementById("f_52_116").value);
        formData.set('docs', docs.join());

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        FUNService.update_52(item.id, formData)
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
        <div className='mt-4'>
            {COMPONENT()}
        </div>

    );
}
