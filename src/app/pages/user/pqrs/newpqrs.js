import React, { Component } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../services/pqrs_main.service';
import HolyDays from '../../../components/holydays.list.json'
import SubmitService from '../../../services/submit.service.js';


const moment = require('moment');
const momentB = require('moment-business-days');
const MySwal = withReactContent(Swal);
class PQRSNEW extends Component {
    constructor(props) {
        super(props);
        this.state = {
            solicitors: 1,
            contacts: 1,
            licence: false,
            attachs: 0,
            solicitorVR: null,
        };
    }
    clearForm() {
        document.getElementById("app-formNew").reset()
    }
    addSolicitor() {
        this.setState({ solicitors: this.state.solicitors + 1 })
    }
    minusSolicitor() {
        this.setState({ solicitors: this.state.solicitors - 1 })
    }
    addContact() {
        this.setState({ contacts: this.state.contacts + 1 })
    }
    minusContact() {
        this.setState({ contacts: this.state.contacts - 1 })
    }
    addAttach() {
        this.setState({ attachs: this.state.attachs + 1 })
    }
    minusAttach() {
        this.setState({ attachs: this.state.attachs - 1 })
    }
    toggleLicense() {
        this.setState({
            licence: !this.state.licence
        });
    }
    render() {
        const { translation, swaMsg, globals, translation_form, } = this.props;
        const { solicitors, contacts, licence, attachs, solicitorVR } = this.state;
        var formData = new FormData();

        let _SOLICITORS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < solicitors; i++) {
                _COMPONENT.push(<div className="row">
                    <label className="app-p lead text-start fw-normal text-uppercase">SOLICITANTE N° {i + 1}</label>

                    <div className="col-lg-6 col-md-6">
                        <label class="m-0">Nombre:</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Nombre Completo" name="pqrs_sol_1" defaultValue={solicitorVR && solicitorVR.name && i === 0 ? solicitorVR.name : ''} />
                        </div>
                        <label class="m-0">Tipo de persona:</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <select class="form-select" name="pqrs_sol_2" defaultValue={solicitorVR && solicitorVR.person_type && i === 0 ? solicitorVR.person_type : ''}>
                                <option>NATURAL</option>
                                <option>JURIDICO</option>
                                <option>ESTABLECIMIENTO DE COMERCIO</option>
                                <option>MENOR DE EDAD/ADOLECENTE</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                        <label class='m-0'>Tipo de documento: </label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-id-card"></i>
                            </span>
                            <select class="form-select" name="pqrs_sol_4" defaultValue={solicitorVR && solicitorVR.document_type && i === 0 ? solicitorVR.document_type : ''}>
                                <option>CEDULA DE CIUDADANIA</option>
                                <option>NIT</option>
                                <option>CEDULA DE EXTRANJERIA</option>
                                <option>REGISTRO CIVIL</option>
                                <option>TARJETA DE IDENTIDAD</option>
                                <option>OTRO</option>
                            </select>
                        </div>
                        <label class='m-0'>Numero de documento: </label>
                        <div class="input-group my-1">


                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-id-card"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Numero de Documento" name="pqrs_sol_3" defaultValue={solicitorVR && solicitorVR.id_doc && i === 0 ? solicitorVR.id_doc : ''} />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        let _CONTACTS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < contacts; i++) {
                _COMPONENT.push(<div className="row">
                    <label className="app-p lead text-start fw-normal text-uppercase">DATOS PARA NOTIFICACIÓN N° {i + 1}</label>
                    <div className="col-lg-6 col-md-6">
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-signs"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Direccion Fisica" name="pqrs_con_1" defaultValue={solicitorVR && solicitorVR.address && i === 0 ? solicitorVR.address : ''} />
                        </div>

                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Barrio" name="pqrs_con_2" defaultValue={solicitorVR && solicitorVR.neighborhood && i === 0 ? solicitorVR.neighborhood : ''} />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Numero de Contacto" name="pqrs_con_3" defaultValue={solicitorVR && solicitorVR.phone && i === 0 ? solicitorVR.phone : ''} />
                        </div>
                        <div class="form-check mx-5 my-3">
                            <input class="form-check-input" type="checkbox" value="" name="pqrs_con_7" />
                            <p class="form-check-label text-justify" >¿Autoriza respuesta por email?</p>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-globe-americas"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Departamento" name="pqrs_con_4" defaultValue={solicitorVR && solicitorVR.department && i === 0 ? solicitorVR.department : ''} />
                        </div>

                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-globe-americas"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Municipio" name="pqrs_con_5" defaultValue={solicitorVR && solicitorVR.town && i === 0 ? solicitorVR.town : ''} />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Correo Electronico" name="pqrs_con_6" defaultValue={solicitorVR && solicitorVR.email && i === 0 ? solicitorVR.email : ''} />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        let _ATTACHS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < attachs; i++) {
                _COMPONENT.push(<div className="row d-flex justify-content-center my-2">
                    <div className="col-lg-12 col-md-8 ">
                        <label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTO ANEXO N° {i + 1}</label>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                            <input type="file" class="form-control" name="files" accept="image/png, image/jpeg application/pdf" />
                        </div>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                            <input type="text" class="form-control" name="files_names" placeholder="Nombre documento (nombre o corta descripcion)" />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        // WORKING SELECTS
        const selectTypeChannel = translation_form.form_radication_chanel.map(function (item) {
            return <option>{item}</option>
        })

        // SUBMIT  NEW 1. ENTRY
        let generatePQRS = (e) => {
            e.preventDefault();
            formData = new FormData();
            let array_form = [];
            let array_html = [];

            // GET DATA OF MASTER
            let worker_creator = document.getElementById("pqrs_mas_worker_creator").value;
            formData.set('worker_creator', worker_creator);
            let master_id_publico = document.getElementById("pqrs_mas_1").value;
            formData.set('master_id_publico', master_id_publico);
            let master_id_global = document.getElementById("pqrs_mas_6").value;
            formData.set('master_id_global', master_id_global);
            let master_content = document.getElementById("pqrs_mas_4").value;
            formData.set('master_content', master_content);
            let master_type = document.getElementById("pqrs_mas_2").value;
            formData.set('master_type', master_type);
            let info_radication_chanel = document.getElementById("pqrs_mas_3").value;
            formData.set('info_radication_chanel', info_radication_chanel);
            let master_keywords = document.getElementById("pqrs_mas_5").value;
            formData.set('master_keywords', master_keywords);

            // GET DATA OF TIME
            let time_creation = document.getElementById("pqrs_time_1").value;
            let time_creation_time = document.getElementById("pqrs_time_10").value;
            time_creation = time_creation + " " + time_creation_time
            formData.set('time_creation', time_creation);
            let time_legal = document.getElementById("pqrs_time_2").value;
            formData.set('time_legal', time_legal);
            let time_time = document.getElementById("pqrs_time_time").value;
            formData.set('time_time', time_time);


            // GET DATA OF SOLICITORS
            formData.set('solicitors_length', solicitors);
            array_html = document.getElementsByName("pqrs_sol_1");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('solicitor_name', array_form);
            array_form = [];
            array_html = [];

            array_html = document.getElementsByName("pqrs_sol_2");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('solicitor_type', array_form);
            array_form = [];
            array_html = [];

            array_html = document.getElementsByName("pqrs_sol_3");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('solicitor_id_number', array_form);
            array_form = [];
            array_html = [];

            array_html = document.getElementsByName("pqrs_sol_4");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('solicitor_type_id', array_form);
            array_form = [];
            array_html = [];



            // GET DATA OF CONTACTS
            formData.set('contacts_length', contacts);
            array_html = document.getElementsByName("pqrs_con_1");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('contact_address', array_form);
            array_form = [];
            array_html = [];

            array_html = document.getElementsByName("pqrs_con_2");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('contact_neighbour', array_form);
            array_form = [];
            array_html = [];

            array_html = document.getElementsByName("pqrs_con_3");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('contact_phone', array_form);
            array_form = [];
            array_html = [];

            array_html = document.getElementsByName("pqrs_con_4");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('contact_state', array_form);
            array_form = [];
            array_html = [];

            array_html = document.getElementsByName("pqrs_con_5");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('contact_county', array_form);
            array_form = [];
            array_html = [];

            array_html = document.getElementsByName("pqrs_con_6");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('contact_email', array_form);
            array_form = [];
            array_html = [];

            array_html = document.getElementsByName("pqrs_con_7");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].checked)
            }
            formData.set('contact_check', array_form);
            array_form = [];
            array_html = [];

            // GET DATA OF FUN
            array_html = document.getElementsByName("licence_checkbox");
            formData.set('licence_check', array_html[0].checked);
            if (array_html[0].checked) {
                let fun_id_public = document.getElementById("pqrs_fun_1").value;
                formData.set('fun_id_public', fun_id_public);
                let fun_catastral = document.getElementById("pqrs_fun_2").value;
                formData.set('fun_catastral', fun_catastral);
                let fun_person = document.getElementById("pqrs_fun_3").value;
                formData.set('fun_person', fun_person);
            }

            // GET DATA OF ATTACHS
            let files = document.getElementsByName("files");
            formData.set('attachs_length', attachs);
            for (var i = 0; i < attachs; i++) {
                formData.append('file', files[i].files[0], "pqrs_" + files[i].files[0].name)
            }
            array_html = document.getElementsByName("files_names");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('files_names', array_form);
            array_form = [];
            array_html = [];

            // Display the key/value pairs
            /*
            for (var pair of formData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
            */

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.clearForm();
                        this.props.refreshRequested();
                    }
                    else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACION",
                            text: "El concecutivo de radicado de este formulario ya existe, debe de elegir un concecutivo nuevo",
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                    else {
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
        };

        let _GET_LAST_ID = () => {
            let new_id = "";
            PQRS_Service.getlastid()
                .then(response => {
                    new_id = response.data[0].id_publico;
                    let concecutive = new_id.split('-')[1];
                    concecutive = Number(concecutive) + 1
                    if (concecutive < 1000) concecutive = "0" + concecutive
                    if (concecutive < 100) concecutive = "0" + concecutive
                    if (concecutive < 10) concecutive = "0" + concecutive
                    new_id = new_id.split('-')[0] + "-" + concecutive
                    document.getElementById('pqrs_mas_1').value = new_id;
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el concecutivo, intentelo nuevamnte.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }

        let _SET_LEGAL_TIME = () => {
            let _date = document.getElementById('pqrs_time_1').value;
            let _legal_date = _date;
            let _time = document.getElementById('pqrs_time_10').value;

            let _now = moment().format('YYYY-MM-DD');
            _now = _now + " " + _time;
            let _hour = moment(_now).format('HH');
            if (momentB(_date).isBusinessDay()) {
                if (_hour < 17) document.getElementById('pqrs_time_2').value = _legal_date;
                else document.getElementById('pqrs_time_2').value = _GET_NEXT_BUSSINESS_DAY(_date)
            } else document.getElementById('pqrs_time_2').value = _GET_NEXT_BUSSINESS_DAY(_date)
        }

        let _GET_NEXT_BUSSINESS_DAY = (_date) => {
            let date = _date;
            date = momentB(date).nextBusinessDay();
            let _year = moment(date).format('YYYY');
            let _month = moment(date).format('MM') - 1;
            let _day = moment(date).format('D');
            if (HolyDays[_year][_month][_day]) return _GET_NEXT_BUSSINESS_DAY(date)
            return moment(date).format('YYYY-MM-DD');
        }

        let _SET_REPLY_TIME = () => {
            let type = document.getElementById('pqrs_mas_2').value;
            let time_element = document.getElementById('pqrs_time_time');
            if (type == 'Peticion General') { time_element.value = 15; }
            else if (type == 'Peticion de documentos y de información') { time_element.value = 10; }
            else if (type == 'Peticion de consulta') { time_element.value = 30; }
            else if (type == 'Peticiones de autoridades y entes de control') { time_element.value = 5; }
            else if (type == 'Entrega de Copias') { time_element.value = 3; }
            else time_element.disabled = false
        }

        let _REQUIRES_REPLY = (value) => {
            switch (value) {
                case 'aqui va tipo de peticion': return true;

            }

        }

        let getSolicitorById = (e) => {
            e.preventDefault();
            let valueVR = document.getElementById("VR_search").value;
            console.log(valueVR)
            SubmitService.getSearch(1, valueVR)
                .then(response => {
                    if (response.status == 200 && response.data) {
                        console.log(response.data)
                        this.setState({
                            solicitorVR: response.data[0].submitSolicitors[0].solicitor,
                        });
                        document.getElementById("pqrs_mas_6").value = response.data[0].id_public

                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                    else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
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
                <form onSubmit={getSolicitorById} className="row">
                    <div className="col-lg-10 col-md-6 d-flex align-items-end">
                        <div className='me-2'>
                            <label class="my-1">Buscar registro (VR):</label>
                            <div className="input-group">
                                <span className="input-group-text bg-info text-white">
                                    <i className="fas fa-hashtag"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control USER_VR"
                                    id="VR_search"
                                    placeholder="Número de Documento"
                                />
                            </div>
                        </div>
                        {
                            solicitorVR ? <button className='ms-1 rounded-circle' style={{
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer'
                            }}
                                onClick={() => {
                                    this.setState({
                                        solicitorVR: null
                                    })
                                    document.getElementById('VR_search').value = ''
                                    document.getElementById("pqrs_mas_6").value = '';

                                }
                                }><i className="fas fa-regular fa-trash"></i></button> : ''
                        }
                    </div>
                </form >
                <form onSubmit={generatePQRS} id="app-formNew" enctype="multipart/form-data">
                    <div className="row my-4 d-flex justify-content-center">

                        <div className="row">
                            <div className="col-lg-3 col-md-12">
                                <label className="app-p lead text-start fw-bold text-uppercase">
                                    1.1 IDENTIFICACIÓN DEL PETICIONARIO
                                </label>
                                <div className="text-end m-3">
                                    {(solicitors && contacts) > 1 ? (
                                        <MDBBtn
                                            className="btn btn-xs btn-secondary mx-3"
                                            onClick={() => (this.minusSolicitor(), this.minusContact())}
                                        >
                                            <i class="fas fa-minus-circle"></i> REMOVER ÚLTIMO
                                        </MDBBtn>
                                    ) : (
                                        ""
                                    )}
                                    <MDBBtn
                                        className="btn btn-xs btn-secondary"
                                        onClick={() => (this.addSolicitor(), this.addContact())}
                                    >
                                        <i class="fas fa-plus-circle"></i> AÑADIR OTRO
                                    </MDBBtn>
                                </div>
                                {_SOLICITORS_COMPONENT()}
                                <hr className="my-3" />

                                <label className="app-p lead text-start fw-bold text-uppercase">
                                    1.2 DATOS PARA NOTIFICACION
                                </label>
                                <div className="text-end m-3">
                                    {/* {contacts > 1
                      ? <MDBBtn className="btn btn-xs btn-secondary mx-3" onClick={() => this.minusContact()}><i class="fas fa-minus-circle"></i> REMOVER ÚLTIMO </MDBBtn>
                      : ""}
                  <MDBBtn className="btn btn-xs btn-secondary" onClick={() => this.addContact()}><i class="fas fa-plus-circle"></i> AÑADIR OTRO </MDBBtn> */}
                                </div>
                                {_CONTACTS_COMPONENT()}
                            </div>
                            <div className="col-lg-5 col-md-12 mx-lg-5">
                                <label className="app-p lead text-start fw-bold text-uppercase">
                                    1.3 CASOS DE ACTUACIONES Y LICENCIAS
                                </label>
                                <div class="form-check my-3 px-5">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        name="licence_checkbox"
                                        onChange={() => this.toggleLicense()}
                                    />
                                    <p class="form-check-label text-start">
                                        ¿Esta es una solicitud relacionada con una actuación urbanistica o licencia?
                                    </p>
                                </div>
                                {licence ? (
                                    <div className="row">
                                        <div className="col-lg-6 col-md-6">
                                            <div class="input-group my-1">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-map-signs"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    class="form-control"
                                                    placeholder="Numero de Radicacion"
                                                    id="pqrs_fun_1"
                                                />
                                            </div>
                                            <div class="input-group my-1">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-map-marked-alt"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    class="form-control"
                                                    placeholder="N° Predial / Catastral"
                                                    id="pqrs_fun_2"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-lg-6 col-md-6">
                                            <div class="input-group my-1">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-user"></i>
                                                </span>
                                                <select class="form-select" id="pqrs_fun_3">
                                                    <option>TITULAR DE LA ACTUACIÓN</option>
                                                    <option>INSTITUCIÓN DE CONTROL</option>
                                                    <option>VECINO COLINDANTE</option>
                                                    <option>INTERESADO</option>
                                                    <option>OTRO</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    ""
                                )}

                                <label className="app-p lead text-start fw-bold text-uppercase">
                                    1.4 DESCRIPCIÓN DE LA SOLICITUD
                                </label>
                                <div className="row">
                                    <div className="col-lg-6 col-md-6">
                                        <label>Número de registro Ventanilla Unica</label>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-hashtag"></i>
                                            </span>
                                            <input type="text" class="form-control" id="pqrs_mas_6" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <label>Número de registro de caso(histórico año 2021)</label>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-hashtag"></i>
                                            </span>
                                            <input type="text" class="form-control" id="pqrs_mas_1" />
                                            <button
                                                type="button"
                                                class="btn btn-info shadow-none"
                                                onClick={() => _GET_LAST_ID()}
                                            >
                                                GENERAR
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <label>Clasificación de la Petición</label>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-check-square"></i>
                                            </span>
                                            <input
                                                list="browsers"
                                                id="pqrs_mas_2"
                                                class="form-control"
                                                onChange={() => _SET_REPLY_TIME()}
                                                autoComplete="false"
                                            />
                                            <datalist id="browsers">
                                                <option value="Peticion General" />
                                                <option value="Peticion de documentos y de información" />
                                                <option value="Peticion de consulta" />
                                                <option value="Peticiones de autoridades y entes de control" />
                                                <option value="Entrega de Copias" />
                                            </datalist>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <label>Canal de radicación original</label>
                                        <div class="input-group mb-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-check-square"></i>
                                            </span>
                                            <select class="form-select" id="pqrs_mas_3">
                                                {selectTypeChannel}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <label>Palabras Clave (Separadas por coma)</label>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-font"></i>
                                            </span>
                                            <input
                                                type="text"
                                                class="form-control"
                                                maxLength="200"
                                                id="pqrs_mas_5"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <label>Fecha de radicación</label>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="far fa-calendar-alt"></i>
                                            </span>
                                            <input
                                                type="date"
                                                max="2100-01-01"
                                                class="form-control"
                                                id="pqrs_time_1"
                                                required
                                                onChange={() => _SET_LEGAL_TIME()}
                                            />
                                            <input
                                                type="time"
                                                class="form-control"
                                                id="pqrs_time_10"
                                                required
                                                onChange={() => _SET_LEGAL_TIME()}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <label>Fecha inicio de términos</label>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white" id="type-pqrs">
                                                <i class="far fa-calendar-alt"></i>
                                            </span>
                                            <input
                                                type="date"
                                                max="2100-01-01"
                                                class="form-control"
                                                id="pqrs_time_2"
                                                disabled
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <label>Termino legal de respuesta</label>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="far fa-calendar-alt"></i>
                                            </span>
                                            <input
                                                type="number"
                                                step="1"
                                                min="1"
                                                class="form-control"
                                                placeholder="Termino legal de respuesta"
                                                id="pqrs_time_time"
                                                defaultValue={"15"}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <label>Contenido o descripción de la Solicitud (Maximo 2000 Caracteres)</label>
                                        <textarea
                                            class="form-control mb-3"
                                            rows="3"
                                            maxLength="2000"
                                            id="pqrs_mas_4"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>


                            <div className="col-lg-3 col-md-12">
                                <label className="app-p lead text-start fw-bold text-uppercase">
                                    1.5 DOCUMENTOS ANEXOS
                                </label>
                                <div className="text-end m-3">
                                    {attachs > 0 ? (
                                        <MDBBtn
                                            className="btn btn-xs btn-secondary mx-3"
                                            onClick={() => this.minusAttach()}
                                        >
                                            <i class="fas fa-minus-circle"></i> REMOVER ÚLTIMO
                                        </MDBBtn>
                                    ) : (
                                        ""
                                    )}
                                    <MDBBtn
                                        className="btn btn-xs btn-secondary"
                                        onClick={() => this.addAttach()}
                                    >
                                        <i class="fas fa-plus-circle"></i> AÑADIR OTRO
                                    </MDBBtn>
                                </div>
                                {_ATTACHS_COMPONENT()}
                                <hr className="my-3" />
                                <label className="app-p lead text-start fw-bold text-uppercase m-3">
                                    1.6 INFORMACIÓN DEL PROFESIONAL
                                </label>
                                <div className="col-lg-12 col-md-12">
                                    <input
                                        type="text"
                                        class="form-control"
                                        placeholder="Profesional que Generar esta Solicitud"
                                        disabled
                                    />
                                    <div class="input-group mb-1">
                                        <span class="input-group-text bg-info text-white">
                                            <i class="fas fa-user"></i>
                                        </span>
                                        <input
                                            type="text"
                                            class="form-control"
                                            defaultValue={window.user.name + " " + window.user.surname}
                                            id="pqrs_mas_worker_creator"
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-12">
                                    <input
                                        type="text"
                                        class="form-control"
                                        placeholder="Fecha en la cual se genera esta Solicitud"
                                        disabled
                                    />
                                    <div class="input-group mb-1">
                                        <span class="input-group-text bg-info text-white">
                                            <i class="far fa-calendar-alt"></i>
                                        </span>
                                        <input
                                            type="date"
                                            class="form-control"
                                            defaultValue={moment().format("YYYY-MM-DD")}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="text-center py-4 mt-3">
                            <button className="btn btn-xs btn-success">
                                <i class="fas fa-folder-plus"></i> GENERAR
                            </button>
                        </div>
                    </div>
                </form>
            </div>

        );
    }
}

export default PQRSNEW;