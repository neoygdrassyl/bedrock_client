import profesionalsService from '../../../services/profesionals.service';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useParams } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import React, { useRef } from 'react';
import { Icon } from '@/components/icon';
const Divider = ({ children }) => <div className="dvl-divider text-center my-2"><span className="text-muted small">{children}</span></div>;
const MySwal = withReactContent(Swal);

export default function PROFESIONALS_PUBLIC(props) {
    const { translation, swaMsg, globals, breadCrums } = props;
    const recaptchaRef = useRef(null);

    const { urlParams } = useParams();


    // ***************************  DATA GETTERS *********************** //
    // *************************  DATA CONVERTERS ********************** //
    function _REGEX_IDNUMBER(e) {
        let regex = /^[0-9]+$/i;
        let text = String(e.target.value).trim().replace(/\D/g, "")
        let test = regex.test(text);
        if (test) {
            var _value = Number(text).toLocaleString();
            _value = _value.replaceAll(',', '.');
            document.getElementById(e.target.id).value = _value;
        }
    }
    // ******************************* JSX ***************************** // 

    // ******************************* APIS **************************** // 
    function getData(e) {
        e.preventDefault();
        const recaptchaValue = recaptchaRef.current.getValue();
        //if (false) {
        if (!recaptchaValue) {
            return MySwal.fire({
                toast: true,
                position: 'center-center',
                timer: 4000,
                timerProgressBar: true,
                title: "Información Incompleta",
                text: "Asegurese que de usted no sea un robot <[O.O]>",
                icon: 'warning',
                showConfirmButton: false,
            });
        }


        let formData = new FormData();

        let names = document.getElementById('name').value;
        names = names.trim();
        let name = names.split(' ')[0];
        let name_2 = names.split(' ')[1] || '';
        let surnames = document.getElementById('surname').value;
        surnames = surnames.trim();
        let surname = surnames.split(' ')[0];
        let surname_2 = surnames.split(' ')[1] || '';

        let id_number = document.getElementById('id_number').value;
        let registration = document.getElementById('reg_number').value;
        let title = document.getElementById('title').value;
        let email = document.getElementById('email').value;
        let number = document.getElementById('number').value;
        let registration_date = document.getElementById('date').value;

        formData.set('name', name.toUpperCase());
        formData.set('surname', surname.toUpperCase());
        formData.set('name_2', name_2.toUpperCase());
        formData.set('surname_2', surname_2.toUpperCase());
        formData.set('id_number', id_number);
        formData.set('registration', registration);
        formData.set('title', title);
        formData.set('email', email);
        formData.set('number', number);
        formData.set('registration_date', registration_date);

        formData.set('token', urlParams);

        formData.set('concent', 1);

        let attach_id = document.getElementById("attach_id").files[0];
        formData.set('attach_id', attach_id);
        let attach_cv = document.getElementById("attach_cv").files[0];
        formData.set('attach_cv', attach_cv);
        let attach_reg = document.getElementById("attach_reg").files[0];
        formData.set('attach_reg', attach_reg);

        profesionalsService.updatePublic(formData)
            .then(response => {
                if (response.data == 'OK') {
                    MySwal.fire({
                        title: 'HOJA DE VIDA ACTUALIZADA',
                        text: 'La hoja de vida se ha actualizado de forma exitosa en el sistema.',
                        icon: 'success',
                        confirmButtonText: 'CONTINUAR',
                    })
                        .then(SweetAlertResult => {
                            if (SweetAlertResult.isConfirmed) window.location.href = "https://www.curaduria1bucaramanga.com/";
                        });

                }
            })
            .catch(e => {
                if (e.response) {
                    if (e.response.data.message == "jwt expired") MySwal.fire({
                        title: 'LINK CADUCADO',
                        text: 'Este link a caducado y ya no se puede actualizar la hoja de vida, solicite un nuevo link en: https://www.curaduria1bucaramanga.com/profesional',
                        icon: 'warning',
                        confirmButtonText: 'CONTINUAR',
                    });
                    else if (e.response.data.message == "jwt malformed") MySwal.fire({
                        title: 'NO SE PUDO ACTUALIZAR',
                        text: 'Este link a caducado y ya no se puede actualizar la hoja de vida, solicite un nuevo link en: https://www.curaduria1bucaramanga.com/profesional',
                        icon: 'warning',
                        confirmButtonText: 'CONTINUAR',
                    });
                    else if (e.response.data.message == "created") MySwal.fire({
                        title: 'NO SE PUDO ACTUALIZAR',
                        text: 'Esta hoja de vida ya fue actualizada anteriormente, asegúrese de que los valores sean correctos, en caso tal de que requiera actualizar otra vez esta hoja de vida comuníquese con la Curaduria 1 de Bucaramanga.',
                        icon: 'warning',
                        confirmButtonText: 'CONTINUAR',
                    });
                    else MySwal.fire({
                        title: 'ERROR',
                        text: 'Se han presentado errores en la acción, por favor inténtelo mas tarde.',
                        icon: 'warning',
                        confirmButtonText: 'CONTINUAR',
                    });
                }
                else MySwal.fire({
                    title: 'ERROR',
                    text: 'Se han presentado errores en la acción, por favor inténtelo mas tarde.',
                    icon: 'warning',
                    confirmButtonText: 'CONTINUAR',
                });
            })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-foreground">Directorio Público</h1>
                <p className="text-sm text-muted-foreground mt-1">Actualización de hoja de vida de profesionales</p>
            </div>

            <div className="d-flex justify-content-center">
                <form onSubmit={getData} className=" border border-info m-2 p-2">
                    <Divider >INFORMACIÓN GENEAL</Divider>
                    <div className='row'>
                        <div className='col'>
                            <label htmlFor="name" className="form-label"><label className='text-danger'>*</label> Nombre</label>
                            <div className="input-group">
                                <span className="input-group-text text-white bg-info">
                                    <Icon name="user" size={16} />
                                </span>
                                <input type="text" className="form-control" id="name" required />
                            </div>

                        </div>
                        <div className='col'>
                            <label htmlFor="surname" className="form-label"><label className='text-danger'>*</label> Apellidos</label>
                            <div className="input-group">
                                <span className="input-group-text text-white bg-info">
                                    <Icon name="user" size={16} />
                                </span>
                                <input type="text" className="form-control" id="surname" required />
                            </div>

                        </div>
                        <div className='col'>
                            <label htmlFor="id_number" className="form-label"><label className='text-danger'>*</label> Nro. Documento</label>
                            <div className="input-group">
                                <span className="input-group-text text-white bg-info">
                                    <Icon name="id-card" size={16} />
                                </span>
                                <input type="text" className="form-control" id="id_number" onBlur={(e) => _REGEX_IDNUMBER(e)} required />
                            </div>
                        </div>
                        <div className='col'>
                            <label htmlFor="reg_number" className="form-label"><label className='text-danger'>*</label> Nro. matricula/tarjeta</label>
                            <div className="input-group">
                                <span className="input-group-text text-white bg-info">
                                    <Icon name="id-card" size={16} />
                                </span>
                                <input type="text" className="form-control" id="reg_number" required />
                            </div>
                        </div>
                    </div>
                    <div className='row mt-3'>
                        <div className='col'>
                            <label htmlFor="title" className="form-label"><label className='text-danger'>*</label> Titulo</label>
                            <div className="input-group">
                                <span className="input-group-text text-white bg-info">
                                    <Icon name="hard-hat" size={16} />
                                </span>
                                <select className="form-select" id={"title"}>
                                    <option value="arq">ARQUITECTO</option>
                                    <option value="eng">INGENIERO</option>
                                    <option value="law">ABOGADO</option>
                                    <option value="oth">OTRO</option>
                                </select>
                            </div>
                        </div>
                        <div className='col'>
                            <label htmlFor="email" className="form-label"><label className='text-danger'>*</label> Correo de Contacto</label>
                            <div className="input-group">
                                <span className="input-group-text text-white bg-info">
                                    <Icon name="envelope" size={16} />
                                </span>
                                <input type="text" className="form-control" id="email" />
                            </div>
                        </div>
                        <div className='col'>
                            <label htmlFor="number" className="form-label"><label className='text-danger'>*</label> Número de Contacto</label>
                            <div className="input-group">
                                <span className="input-group-text text-white bg-info">
                                    <Icon name="phone-alt" size={16} />
                                </span>
                                <input type="text" className="form-control" id="number" />
                            </div>
                        </div>
                        <div className='col'>
                            <label htmlFor="date" className="form-label"><label className='text-danger'>*</label> Fecha de matricula/tarjeta</label>
                            <div className="input-group">
                                <span className="input-group-text text-white bg-info">
                                    <Icon name="calendar-check" size={16} />
                                </span>
                                <input type="date" className="form-control" id="date" required />
                            </div>
                        </div>
                    </div>
                    <Divider >DOCUMENTOS</Divider>

                    <div className="row mb-2">
                        <div className="col">
                            <label>Hoja de Vida y Certificados</label>
                            <div className="input-group my-1">
                                <span className="input-group-text bg-info text-white">
                                    <Icon name="file" size={16} />
                                </span>
                                <input type="file" className="form-control" id="attach_cv" accept="image/png, image/jpeg image/pjg application/pdf" />
                            </div>
                        </div>
                        <div className="col">
                            <label>Documento de Identidad</label>
                            <div className="input-group my-1">
                                <span className="input-group-text bg-info text-white">
                                    <Icon name="file" size={16} />
                                </span>
                                <input type="file" className="form-control" id="attach_id" accept="image/png, image/jpeg image/pjg application/pdf" />
                            </div>
                        </div>
                    </div>
                    <div className="row mb-2">
                        <div className="col">
                            <label>Matricula</label>
                            <div className="input-group my-1">
                                <span className="input-group-text bg-info text-white">
                                    <Icon name="file" size={16} />
                                </span>
                                <input type="file" className="form-control" id="attach_reg" accept="image/png, image/jpeg image/pjg application/pdf" />
                            </div>
                        </div>
                        <div className="col"></div>
                    </div>

                    <Divider >TÉRMINOS Y CONDICIONES</Divider>
                    <div className="row text-center">
                        <div className="col-12">
                            <div className="form-check mx-5 my-3">
                                <input className="form-check-input" type="checkbox" value="" name="concent" required />
                                <p className="app-p mb-2 text-justify" ><small> <label className='text-danger'>*</label> Acepto los Términos y Condiciones de tratamiento de datos  basada en Ley Estatutaria del Habeas Data (Ley 1581 del 2012)</small></p>
                            </div>
                        </div>
                    </div>
                    <div className='row mt-3'>
                        <div className='col'></div>
                        <div className='col'>
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={import.meta.env.VITE_GOOGLE_CAPTCHA_HTML}
                            />
                        </div>
                        <div className='col'></div>
                    </div>
                    <div className="text-center py-4 mt-3">
                        <button type="submit" className="btn btn-primary ">ENVIAR</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
