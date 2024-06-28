import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Solicitors_service from '../../../services/solicitors.service.js';

const moment = require('moment');
const momentB = require('moment-business-days');
const MySwal = withReactContent(Swal);

class NEW_SOLICITOR extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            showOtherInput: false,
            actionDone: false,
            user: null
        };
        this.handleSolicitorTypeChange = this.handleSolicitorTypeChange.bind(this);
    }
    handleSolicitorTypeChange(e) {
        const selectedType = e.target.value;
        this.setState({ showOtherInput: selectedType === 'OTRO' });
    }
    render() {
        const { translation, swaMsg, globals, translation_form, } = this.props;

        const clearForm = () => {
            document.getElementById("app-formNewSolicitor").reset()
        }
        const { showOtherInput, user, actionDone } = this.state;
        var formData = new FormData();
        // SUBMIT
        let generateSOLICITOR = (e) => {
            e.preventDefault();
            console.log(formData);
            // GET DATA OF PERSONAL INFO
            let solicitor_id = document.getElementById("solicitor_id").value;
            formData.set('id_doc', solicitor_id);
            let solicitor_document_type = document.getElementById("solicitor_document_type").value;
            formData.set('document_type', solicitor_document_type);

            let solicitor_name = document.getElementById("solicitor_name").value;
            formData.set('name', solicitor_name);

            let solicitor_person = document.getElementById("solicitor_person").value;
            formData.set('person_type', solicitor_person);

            let solicitor_type = document.getElementById("solicitor_type").value;
            formData.set('role', solicitor_type);
            if (solicitor_type === 'OTRO') {
                let otherSolicitorType = document.getElementById("other_solicitor_type").value;
                formData.set('role', otherSolicitorType);
            }

            //GET DATA OF ADRESS
            let solicitor_dep = document.getElementById("solicitor_dep").value;
            formData.set('department', solicitor_dep);
            let solicitor_mun = document.getElementById("solicitor_mun").value;
            formData.set('town', solicitor_mun);
            let solicitor_barr = document.getElementById("solicitor_barr").value;
            formData.set('neighborhood', solicitor_barr);
            let solicitor_address = document.getElementById("solicitor_address").value;
            formData.set('address', solicitor_address);

            // GET DATA OF CONTACT
            let solicitor_email = document.getElementById("solicitor_email").value;
            formData.set('email', solicitor_email);

            let solicitor_phone = document.getElementById("solicitor_phone").value;
            formData.set('phone', solicitor_phone);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            formData.forEach(i => formData.get(i))
            if (user) {
                MySwal.fire({
                    title: swaMsg.generic_success_title,
                    text: swaMsg.generic_success_text,
                    icon: 'success',
                    confirmButtonText: swaMsg.text_btn,
                });
                this.setState({
                    actionDone: true
                })
                console.log()
                document.getElementById('step_1_circle').style.backgroundColor = 'green'
                document.getElementById('step_2').removeAttribute('hidden')


                return true
            }
            Solicitors_service.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.setState({
                            user: formData,
                            actionDone: true,
                        })
                        this.props.refreshList();
                        document.getElementById('step_1_circle').style.backgroundColor = 'green'
                        document.getElementById('step_2').removeAttribute('hidden')


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
        let getSolicitorById = (e) => {
            e.preventDefault();
            let solicitor_id = document.getElementById("solicitor_id_search").value;
            console.log(solicitor_id)
            Solicitors_service.getById(solicitor_id)
                .then(response => {
                    if (response.status == 200) {
                        console.log(response.data)
                        this.setState({
                            user: response.data,
                            userRegistered: true,
                            getInfoView: false,
                            createUserView: true,
                        });
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                    else {
                        this.setState({
                            userRegistered: false,
                            getInfoView: false,
                            createUserView: true,
                        });
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

        if (true) {
            return (
                <> <div className='my-2'><form onSubmit={getSolicitorById} className="row">
                    <div className="col-lg-10 col-md-6 d-flex align-items-end">
                        <div className='me-2'>
                            <label class="my-1">Buscar registro:</label>
                            <div className="input-group">
                                <span className="input-group-text bg-info text-white">
                                    <i className="fas fa-hashtag"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control USER"
                                    id="solicitor_id_search"
                                    placeholder="Número de Documento"
                                />
                            </div>
                        </div>
                        {
                            user ? <button className='ms-1 rounded-circle' style={{
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer'
                            }}
                                onClick={() => {
                                    this.setState({
                                        user: null,
                                        actionDone: false
                                    })
                                    document.getElementById('solicitor_id_search').value = ''
                                }
                                }><i className="fas fa-regular fa-trash"></i></button> : ''
                        }
                    </div>
                </form >
                </div >

                    <hr className="my-3" />
                    <div>
                        <form onSubmit={generateSOLICITOR} id="app-formNewSolicitor">
                            {/* {user.name !== null ? user.name : 'fhgh'} */}
                            <div className="row d-flex justify-content-center">
                                <label className="app-p lead text-start fw-bold text-uppercase m-2">TIPO DE USUARIO</label>
                                <div className="row">
                                    <div className="col-lg-6 col-md-6">
                                        <label class="m-0">Tipo de solicitante:</label>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-user"></i>
                                            </span>
                                            <select class="form-select" id="solicitor_type" defaultValue={user && user.role ? user.role : 'OPCION 0'} onChange={this.handleSolicitorTypeChange} >
                                                <option value='OPCION 0' >OPCION 0</option>
                                                <option value='OPCION 1'>OPCION 1</option>
                                                <option value='OPCION 1' >OPCION 2</option>
                                                <option value='OPCION 1'>OPCION 3</option>
                                                <option value='OTRO' >OTRO</option>
                                            </select>
                                        </div>
                                    </div>
                                    {showOtherInput && (
                                        <div className="col-lg-6 col-md-6">
                                            <label className="m-0">Especifique otro tipo:</label>
                                            <div className="input-group my-1">
                                                <span className="input-group-text bg-info text-white">
                                                    <i className="fas fa-user"></i>
                                                </span>
                                                <input type="text" className="form-control" placeholder="Especifique otro tipo" id="other_solicitor_type" />
                                            </div>
                                        </div>

                                    )}
                                </div>

                                <div className="my-3" />
                                <label className="app-p lead text-start fw-bold text-uppercase m-2">INFORMACIÓN PERSONAL</label>
                                <div className="row">
                                    <div className="col-lg-6 col-md-6">
                                        <label class="m-0">Nombre:</label>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-user"></i>
                                            </span>
                                            <input type="text" class="form-control" placeholder="Nombre Completo" id="solicitor_name" defaultValue={user && user.name ? user.name : ''} />
                                        </div>
                                        <label class="m-0">Tipo de persona:</label>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-user"></i>
                                            </span>
                                            <select class="form-select" id="solicitor_person" defaultValue={user && user.person_type ? user.person_type : ''}>
                                                <option value='NATURAL'>NATURAL</option>
                                                <option value='JURIDICO'>JURIDICO</option>
                                                <option value='ESTABLECIMIENTO DE COMERCIO'>ESTABLECIMIENTO DE COMERCIO</option>
                                                <option value='MENOR DE EDAD/ADOLECENTE'>MENOR DE EDAD/ADOLECENTE</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <label class='m-0'>Tipo de documento: </label>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="far fa-id-card"></i>
                                            </span>
                                            <select class="form-select" id="solicitor_document_type" defaultValue={user && user.document_type ? user.document_type : ''}>
                                                <option value='CEDULA DE CIUDADANIA'>CEDULA DE CIUDADANIA</option>
                                                <option value='NIT'>NIT</option>
                                                <option value='CEDULA DE EXTRANJERIA' >CEDULA DE EXTRANJERIA</option>
                                                <option value='REGISTRO CIVIL'>REGISTRO CIVIL</option>
                                                <option value='TARJETA DE IDENTIDAD'>TARJETA DE IDENTIDAD</option>
                                                <option value='OTRO'>OTRO</option>
                                            </select>
                                        </div>
                                        <label class='m-0'>Numero de documento: </label>
                                        <div class="input-group my-1">


                                            <span class="input-group-text bg-info text-white">
                                                <i class="far fa-id-card"></i>
                                            </span>
                                            <input type="number" class="form-control" placeholder="Numero de Documento" id="solicitor_id" defaultValue={user && user.id_doc ? user.id_doc : ''} />
                                        </div>
                                    </div>
                                </div>
                                <div className="my-3" />

                                <label className="app-p lead text-start fw-bold text-uppercase m-2">INFORMACIÓN DE CONTACTO</label>

                                <div className="row">
                                    <div className="col-lg-6 col-md-6">
                                        <label>Física</label>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-globe-americas"></i>
                                            </span>
                                            <input type="text" class="form-control" placeholder="Departamento" id="solicitor_dep" defaultValue={user && user.department ? user.department : ''} />
                                        </div>

                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-globe-americas"></i>
                                            </span>
                                            <input type="text" class="form-control" placeholder="Municipio" id="solicitor_mun" defaultValue={user && user.town ? user.town : ''} />
                                        </div>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-map-marked-alt"></i>
                                            </span>
                                            <input type="text" class="form-control" placeholder="Barrio" id="solicitor_barr" defaultValue={user && user.neighborhood ? user.neighborhood : ''} />
                                        </div>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-map-signs"></i>
                                            </span>
                                            <input type="text" class="form-control" placeholder="Direccion Fisica" id="solicitor_address" defaultValue={user && user.address ? user.address : ''} />
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <label >Electrónica</label>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-phone-alt"></i>
                                            </span>
                                            <input type="number" class="form-control" placeholder="Numero de Contacto" id="solicitor_phone" defaultValue={user && user.phone ? user.phone : ''} />
                                        </div>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="far fa-envelope"></i>
                                            </span>
                                            <input type="text" class="form-control" placeholder="Correo Electrónico" id="solicitor_email" defaultValue={user && user.email ? user.email : ''} />
                                        </div>
                                    </div>
                                </div>
                                {
                                    !actionDone ? <div className="text-center py-4 mt-3">
                                        <button className="btn btn-xs btn-success" id='step'><i class="fas fa-folder-plus"></i> CONTINUAR </button>
                                    </div> : ''
                                    // if ! user ? crear : update
                                    //luego el boton disabled.

                                }

                            </div>
                        </form>
                    </div>
                </>

            );
        }
    }
}

export default NEW_SOLICITOR;