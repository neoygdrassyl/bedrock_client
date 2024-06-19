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
            currentItem: false,
            showOtherInput: false // Estado para controlar la visibilidad del input
        };
        this.handleSolicitorTypeChange = this.handleSolicitorTypeChange.bind(this);
    }
    handleSolicitorTypeChange(e) {
        const selectedType = e.target.value;
        this.setState({ showOtherInput: selectedType === 'OTRO' });
    }
    render() {
        const { translation, swaMsg, globals, translation_form, } = this.props;
        const solicitor_type = [
            {

            }
        ]

        const clearForm = () => {
            document.getElementById("app-formNewSolicitor").reset()
        }
        const { showOtherInput } = this.state;
        var formData = new FormData();
        // SUBMIT
        let generateSOLICITOR = (e) => {
            e.preventDefault();
            console.log(formData);
            // GET DATA OF PERSONAL INFO
            let solicitor_id = document.getElementById("solicitor_id").value;
            formData.set('id_public', solicitor_id);
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
                formData.set('other_role', otherSolicitorType);
            }

            //GET DATA OF ADRESS
            let solicitor_dep = document.getElementById("solicitor_dep").value;
            formData.set('department', solicitor_dep);
            let solicitor_mun = document.getElementById("solicitor_mun").value;
            formData.set('town', solicitor_mun);
            let solicitor_barr = document.getElementById("solicitor_barr").value;
            formData.set('neighborhood', solicitor_barr);
            let solicitor_adress = document.getElementById("solicitor_adress").value;
            formData.set('address', solicitor_adress);

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
            Solicitors_service.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        clearForm();
                        this.props.refreshList();
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
        return (
            <div>
                <form onSubmit={generateSOLICITOR} id="app-formNewSolicitor">

                    <div className="row my-4 d-flex justify-content-center">
                        <label className="app-p lead text-start fw-bold text-uppercase m-2">1.TIPO DE USUARIO</label>
                        <div className="row">
                            <div className="col-lg-6 col-md-6">
                                <label class="m-0">Tipo de solicitante:</label>
                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="fas fa-user"></i>
                                    </span>
                                    <select class="form-select" id="solicitor_type" onChange={this.handleSolicitorTypeChange}>
                                        <option>OPCION 0</option>
                                        <option>OPCION 1</option>
                                        <option>OPCION 2</option>
                                        <option>OPCION 3</option>
                                        <option>OTRO</option>
                                    </select>
                                </div>
                            </div>
                            {showOtherInput && (
                                <div className="row my-2">
                                    <div className="col-lg-6 col-md-6">
                                        <label className="m-0">Especifique otro tipo:</label>
                                        <div className="input-group my-1">
                                            <span className="input-group-text bg-info text-white">
                                                <i className="fas fa-user"></i>
                                            </span>
                                            <input type="text" className="form-control" placeholder="Especifique otro tipo" id="other_solicitor_type" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="my-3" />
                        <label className="app-p lead text-start fw-bold text-uppercase m-2">2.INFORMACIÓN PERSONAL</label>
                        <div className="row">
                            <div className="col-lg-6 col-md-6">
                                <label class="m-0">Nombre:</label>
                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="fas fa-user"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Nombre Completo" id="solicitor_name" />
                                </div>
                                <label class="m-0">Tipo de persona:</label>
                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="fas fa-user"></i>
                                    </span>
                                    <select class="form-select" id="solicitor_person">
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
                                    <select class="form-select" id="solicitor_document_type">
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
                                    <input type="number" class="form-control" placeholder="Numero de Documento" id="solicitor_id" />
                                </div>
                            </div>
                        </div>
                        <hr className="my-3" />

                        <label className="app-p lead text-start fw-bold text-uppercase m-2">3. INFORMACIÓN DE CONTACTO</label>

                        <div className="row">
                            <div className="col-lg-6 col-md-6">
                                <label class="lead">Física</label>
                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="fas fa-globe-americas"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Departamento" id="solicitor_dep" />
                                </div>

                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="fas fa-globe-americas"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Municipio" id="solicitor_mun" />
                                </div>
                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="fas fa-map-marked-alt"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Barrio" id="solicitor_barr" />
                                </div>
                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="fas fa-map-signs"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Direccion Fisica" id="solicitor_adress" />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6">
                                <label class="lead">Electrónica</label>
                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="fas fa-phone-alt"></i>
                                    </span>
                                    <input type="number" class="form-control" placeholder="Numero de Contacto" id="solicitor_phone" />
                                </div>
                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="far fa-envelope"></i>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Correo Electrónico" id="solicitor_email" />
                                </div>
                            </div>
                        </div>
                        <div className="text-center py-4 mt-3">
                            <button className="btn btn-xs btn-success"><i class="fas fa-folder-plus"></i> CREAR </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

export default NEW_SOLICITOR;