import { Item } from '../../../components/ui';
import profesionalsService from '../../../services/profesionals.service';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import ReCAPTCHA from "react-google-recaptcha";
import React, { useRef } from 'react';

const MySwal = withReactContent(Swal);

export default function PROFESIONALS_EMAIL(props) {
    const { translation, swaMsg, globals, breadCrums } = props;
    const recaptchaRef = useRef(null);

    // ***************************  DATA GETTERS *********************** //
    // *************************  DATA CONVERTERS ********************** //
    // ******************************* JSX ***************************** // 
    // ******************************* APIS **************************** // 
    function sendEmail(e) {
        e.preventDefault();
        const recaptchaValue = recaptchaRef.current.getValue();
        // if (false) { 
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
        let email = document.getElementById('email').value;
        MySwal.fire({
            title: 'ENVIANDO SOLICITUD',
            text: 'Se esta procesando el formulario, esto puede tardar unos segundos',
            icon: 'info',
            showConfirmButton: false,
        });
        profesionalsService.sentEmail(email)
            .then(response => {
                MySwal.fire({
                    title: 'EMAIL ENVIADO',
                    text: 'El formulario se proceso correctamente y un email ha sido enviado al correo proveído, este correo puede tardar unos minutos en llegar y puede llegar a su bandeja de SPAM. A partir de ahora tiene 15 minutos para actualizar la hoja de vida.',
                    icon: 'success',
                    confirmButtonText: 'CONTINUAR',
                });
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: 'ERROR',
                    text: 'Se han presentado errores en la acción, por favor inténtelo mas tarde.',
                    icon: 'warning',
                    confirmButtonText: 'CONTINUAR',
                });
            })
    }

    return (
        <div className='space-y-6'>
            <div>
                <h1 className="text-xl font-bold text-foreground">Correo Profesionales</h1>
                <p className="text-sm text-muted-foreground mt-1">Actualización de hoja de vida de profesionales</p>
            </div>

            <h5 className="text-center my-4">Digite su correo electrónico para enviar un Link con el cual poder actualizar su hoja de vida</h5>

            <div className="d-flex justify-content-center">
                <div className="bg-card w-25">
                    <div className="card-body">
                        <form onSubmit={sendEmail}>
                            <div className='row'>
                                <div className='col'>
                                    <label htmlFor="name" className="form-label">Email</label>
                                    <input type="text" className="form-control" id="email" required />
                                </div>
                            </div>
                            <div className="row d-flex justify-content-center my-2">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={import.meta.env.VITE_GOOGLE_CAPTCHA_HTML}
                                />
                            </div>
                            <div className="text-center my-2">
                                <button type="submit" className="btn btn-info ">ENVIAR</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
