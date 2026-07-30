import { useState } from 'react';
import { Button } from '@/components/ui/button';

import PQRS_Service from '../../../services/pqrs_main.service';
import { DiasHabilesColombia } from '../../../utils/BusinessDaysCol';
import dayjs from 'dayjs';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
function PQRSNEW({ translation, swaMsg, globals, translation_form, refreshRequested }) {
    const [solicitors, setSolicitors] = useState(1);
    const [contacts, setContacts] = useState(1);
    const [licence, setLicence] = useState(false);
    const [attachs, setAttachs] = useState(0);

    const clearForm = () => {
        document.getElementById("app-formNew").reset()
    };

    const addSolicitor = () => {
        setSolicitors(solicitors + 1);
    };

    const minusSolicitor = () => {
        setSolicitors(solicitors - 1);
    };

    const addContact = () => {
        setContacts(contacts + 1);
    };

    const minusContact = () => {
        setContacts(contacts - 1);
    };

    const addAttach = () => {
        setAttachs(attachs + 1);
    };

    const minusAttach = () => {
        setAttachs(attachs - 1);
    };

    const toggleLicense = () => {
        setLicence(prev => !prev);
    };
        var formData = new FormData();

        let _SOLICITORS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < solicitors; i++) {
                _COMPONENT.push(<div key={`new-pqrs-solicitor-${i}`} className="row">
                    <label className="app-p lead text-start fw-normal">SOLICITANTE N° {i + 1}</label>

                    <div className="col-lg-6 col-md-6">
                        <label className="m-0">Nombre:</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Nombre Completo" name="pqrs_sol_1" />
                        </div>
                        <label className="m-0">Tipo de persona:</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user" size={16} />
                            </span>
                            <select className="form-select" name="pqrs_sol_2">
                                <option>NATURAL</option>
                                <option>JURIDICO</option>
                                <option>ESTABLECIMIENTO DE COMERCIO</option>
                                <option>MENOR DE EDAD/ADOLECENTE</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                        <label className='m-0'>Tipo de documento: </label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="id-card" size={16} />
                            </span>
                            <select className="form-select" name="pqrs_sol_4">
                                <option>CEDULA DE CIUDADANIA</option>
                                <option>NIT</option>
                                <option>CEDULA DE EXTRANJERIA</option>
                                <option>REGISTRO CIVIL</option>
                                <option>TARJETA DE IDENTIDAD</option>
                                <option>OTRO</option>
                            </select>
                        </div>
                        <label className='m-0'>Número de documento: </label>
                        <div className="input-group my-1">

                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="id-card" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Numero de Documento" name="pqrs_sol_3" />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        let _CONTACTS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < contacts; i++) {
                _COMPONENT.push(<div key={`new-pqrs-contact-${i}`} className="row">
                    <label className="app-p lead text-start fw-normal">DATOS PARA NOTIFICACIÓN N° {i + 1}</label>
                    <div className="col-lg-6 col-md-6">
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="map-signs" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Direccion Fisica" name="pqrs_con_1" />
                        </div>

                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="map-marked-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Barrio" name="pqrs_con_2" />
                        </div>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="phone-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Numero de Contacto" name="pqrs_con_3" />
                        </div>
                        <div className="form-check mx-5 my-3">
                            <input className="form-check-input" type="checkbox" value="" name="pqrs_con_7" />
                            <p className="form-check-label text-justify" >¿Autoriza respuesta por email?</p>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="globe-americas" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Departamento" name="pqrs_con_4" />
                        </div>

                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="globe-americas" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Municipio" name="pqrs_con_5" />
                        </div>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="envelope" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Correo Electronico" name="pqrs_con_6" />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        let _ATTACHS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < attachs; i++) {
                _COMPONENT.push(<div key={`new-pqrs-attach-${i}`} className="row d-flex justify-content-center my-2">
                    <div className="col-lg-8 col-md-8 ">
                        <label className="app-p lead text-start fw-normal">DOCUMENTO ANEXO N° {i + 1}</label>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                            <input type="file" className="form-control" name="files" accept="image/png, image/jpeg application/pdf" />
                        </div>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                            <input type="text" className="form-control" name="files_names" placeholder="Nombre documento (nombre o corta descripcion)" />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        // WORKING SELECTS
        const selectTypeChannel = translation_form.form_radication_chanel.map(function (item) {
            return <option key={item}>{item}</option>
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
                const file = files[i]?.files?.[0];
                if (file) formData.append('file', file, "pqrs_" + file.name)
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                        clearForm();
                        refreshRequested();
                    }
                    else if (response.data === 'ERROR_DUPLICATE') {
                        swalError({ title: "ERROR DE DUPLICACION", text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo" });
                    }
                    else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }

                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte." });
                });

        }

        const _bd = new DiasHabilesColombia();
        let _SET_LEGAL_TIME = () => {
            let _date = document.getElementById('pqrs_time_1').value;
            let _legal_date = _date;
            let _time = document.getElementById('pqrs_time_10').value;

            let _now = dayjs().format('YYYY-MM-DD');
            _now = _now + " " + _time;
            let _hour = dayjs(_now).format('HH');
            if (_bd.esHabil(_date)) {
                if (_hour < 17) document.getElementById('pqrs_time_2').value = _legal_date;
                else document.getElementById('pqrs_time_2').value = _bd.siguienteDiaHabil(_date)
            } else document.getElementById('pqrs_time_2').value = _bd.siguienteDiaHabil(_date)
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
            switch(value){
                case 'aqui va tipo de peticion': return true;

            }
            
        }
        return (
            <div>
                <form onSubmit={generatePQRS} id="app-formNew" encType="multipart/form-data">
                    <div className="row my-4 d-flex justify-content-center">
                        <label className="app-p lead text-start fw-bold">1.1 IDENTIFICACIÓN DEL PETICIONARIO</label>
                        <div className="text-end m-3">

                            {(solicitors && contacts)  > 1
                                ? <Button variant="outline" size="sm" className="mx-3" onClick={() => (minusSolicitor(), minusContact())}><Icon name="minus-circle" size={16} /> REMOVER ÚLTIMO </Button>
                                : ""}
                            <Button variant="outline" size="sm" onClick={() => (addSolicitor(), addContact())}
                            ><Icon name="plus-circle" size={16} /> AÑADIR OTRO </Button>
                        </div>
                        {_SOLICITORS_COMPONENT()}
                        <hr className="my-3" />

                        <label className="app-p lead text-start fw-bold">1.2 DATOS PARA NOTIFICACIÓN</label>
                        <div className="text-end m-3">
                            {/* {contacts > 1
                                ? <Button variant="outline" size="sm" className="mx-3" onClick={() => minusContact()}><Icon name="minus-circle" size={16} /> REMOVER ÚLTIMO </Button>
                                : ""}
                            <Button variant="outline" size="sm" onClick={() => addContact()}><Icon name="plus-circle" size={16} /> AÑADIR OTRO </Button> */}
                        </div>
                        {_CONTACTS_COMPONENT()}
                        <hr className="my-3" />

                        <label className="app-p lead text-start fw-bold">1.3 CASOS DE ACTUACIONES Y LICENCIAS</label>
                        <div className="form-check my-3 px-5">
                            <input className="form-check-input" type="checkbox" name="licence_checkbox" onChange={() => toggleLicense()} />
                            <p className="form-check-label text-start" >¿Esta es una solicitud relacionada con una actuación urbanistica o licencia?</p>
                        </div>
                        {licence
                            ? <div className="row">
                                <div className="col-lg-6 col-md-6">
                                    <div className="input-group my-1">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="map-signs" size={16} />
                                        </span>
                                        <input type="text" className="form-control" placeholder="Numero de Radicacion" id="pqrs_fun_1" />
                                    </div>
                                    <div className="input-group my-1">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="map-marked-alt" size={16} />
                                        </span>
                                        <input type="text" className="form-control" placeholder="N° Predial / Catastral" id="pqrs_fun_2" />
                                    </div>

                                </div>

                                <div className="col-lg-6 col-md-6">
                                    <div className="input-group my-1">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="user" size={16} />
                                        </span>
                                        <select className="form-select" id="pqrs_fun_3">
                                            <option>TITULAR DE LA ACTUACIÓN</option>
                                            <option>INSTITUCIÓN DE CONTROL</option>
                                            <option>VECINO COLINDANTE</option>
                                            <option>INTERESADO</option>
                                            <option>OTRO</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            : ""}
                        <hr className="my-3" />

                        <label className="app-p lead text-start fw-bold">1.4 DESCRIPCIÓN DE LA SOLICITUD</label>

                        <div className="row">
                            <div className="col-lg-6 col-md-6">
                                <label>Número de registro Ventanilla Única</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="hashtag" size={16} />
                                    </span>
                                    <input type="text" className="form-control" id="pqrs_mas_6" />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6">
                                <label>Número de registro de caso(histórico año 2021)</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="hashtag" size={16} />
                                    </span>
                                    <input type="text" className="form-control" id="pqrs_mas_1" />
                                    <Button size="sm" onClick={() => _GET_LAST_ID()}>GENERAR</Button>
                                </div>
                            </div>

                        </div>

                        <div className="row">

                            <div className="col-lg-6 col-md-6">
                                <label>Clasificación de la Petición</label>
                                <div className="input-group mb-3">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="check-square" size={16} />
                                    </span>
                                    <input list="browsers" id="pqrs_mas_2" className="form-control" onChange={() => _SET_REPLY_TIME()}
                                        autoComplete='false' />
                                    <datalist id="browsers">
                                        <option value="Peticion General" />
                                        <option value="Peticion de documentos y de información" />
                                        <option value="Peticion de consulta" />
                                        <option value="Peticiones de autoridades y entes de control" />
                                        <option value="Entrega de Copias" />
                                    </datalist>
                                </div>
                            </div>

                        </div>

                        <div className="row">

                            <div className="col-lg-6 col-md-6">
                                <label>Canal de radicación original</label>
                                <div className="input-group mb-1">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="check-square" size={16} />
                                    </span>
                                    <select className="form-select" id="pqrs_mas_3">
                                        {selectTypeChannel}
                                    </select>
                                </div>

                            </div>
                            <div className="col-lg-6 col-md-6">
                                <label>Palabras Clave (Separadas por coma)</label>
                                <div className="input-group mb-3">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="font" size={16} />
                                    </span>
                                    <input type="text" className="form-control" maxLength="200" id="pqrs_mas_5" />
                                </div>
                            </div>

                        </div>

                        <div className="row">
                            <div className="col-lg-6 col-md-6">
                                <label> Fecha de radicación</label>
                                <div className="input-group mb-3">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="calendar-alt" size={16} />
                                    </span>
                                    <input type="date" max="2100-01-01" className="form-control" id="pqrs_time_1" required
                                        onChange={() => _SET_LEGAL_TIME()} />
                                    <input type="time" className="form-control" id="pqrs_time_10" required
                                        onChange={() => _SET_LEGAL_TIME()} />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6">
                                <label>Fecha inicio de términos</label>
                                <div className="input-group mb-3">
                                    <span className="input-group-text bg-primary text-primary-foreground" id="type-pqrs">
                                        <Icon name="calendar-alt" size={16} />
                                    </span>
                                    <input type="date" max="2100-01-01" className="form-control" id="pqrs_time_2" disabled required />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-6 col-md-6">
                                <label>Termino legal de respuesta </label>
                                <div className="input-group mb-3">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="calendar-alt" size={16} />
                                    </span>
                                    <input type="number" step="1" min="1" className="form-control"
                                        placeholder="Termino legal de respuesta" id="pqrs_time_time" defaultValue={'15'} />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <label>Contenido o descripción de la Solicitud (Maximo 2000 Caracteres)</label>
                                <textarea className="form-control mb-3" rows="3" maxLength="2000" id="pqrs_mas_4"></textarea>
                            </div>
                        </div>
                        <hr className="my-3" />

                        <label className="app-p lead text-start fw-bold">1.5 DOCUMENTOS ANEXOS</label>
                        <div className="text-end m-3">
                            {attachs > 0
                                ? <Button type="button" variant="outline" size="sm" className="mx-3" onClick={() => minusAttach()}><Icon name="minus-circle" size={16} /> REMOVER ÚLTIMO </Button>
                                : ""}
                            <Button type="button" variant="outline" size="sm" onClick={() => addAttach()}><Icon name="plus-circle" size={16} /> AÑADIR OTRO </Button>
                        </div>
                        {_ATTACHS_COMPONENT()}
                        <hr className="my-3" />
                        <label className="app-p lead text-start fw-bold m-3">1.6 INFORMACIÓN DEL PROFESIONAL</label>
                        <div className="col-lg-6 col-md-6">
                            <input type="text" className="form-control" placeholder="Profesional que Generar esta Solicitud" disabled />
                            <div className="input-group mb-1">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="user" size={16} />
                                </span>
                                <input type="text" className="form-control" defaultValue={window.user.name + " " + window.user.surname} id="pqrs_mas_worker_creator" disabled />
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                            <input type="text" className="form-control" placeholder="Fecha en la cual se genera esta Solicitud" disabled />
                            <div className="input-group mb-1">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="calendar-alt" size={16} />
                                </span>
                                <input type="date" className="form-control" defaultValue={dayjs().format('YYYY-MM-DD')} disabled />
                            </div>
                        </div>
                        <div className="text-center py-4 mt-3">
                            <Button size="sm"><Icon name="folder-plus" size={16} /> GENERAR </Button>
                        </div>
                    </div>
                </form>
            </div>
        );
}

export default PQRSNEW;
