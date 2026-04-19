import profesionalsService from '../../../services/profesionals.service';
import { Button } from '@/components/ui/button';
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import React, { useRef } from 'react';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

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
            return swalLoading({ title: "Información Incompleta", text: "Asegurese que de usted no sea un robot <[O.O]>" });
        }
        let email = document.getElementById('email').value;
        swalLoading({ title: 'ENVIANDO SOLICITUD', text: 'Se esta procesando el formulario, esto puede tardar unos segundos' });
        profesionalsService.sentEmail(email)
            .then(response => {
                swalSuccess({ title: 'EMAIL ENVIADO', text: 'El formulario se proceso correctamente y un email ha sido enviado al correo proveído, este correo puede tardar unos minutos en llegar y puede llegar a su bandeja de SPAM. A partir de ahora tiene 15 minutos para actualizar la hoja de vida.' });
            })
            .catch(e => {
                console.log(e);
                swalError({ title: 'ERROR', text: 'Se han presentado errores en la acción, por favor inténtelo mas tarde.', icon: 'warning' });
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
                                <Button type="submit" size="sm">ENVIAR</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
