import './components/editorStyles.css'
import { Button } from '@/components/ui/button';
import PQRS_SERVICES from '../../../services/pqrs_main.service'
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component'
import { Icon } from '@/components/icon';
import { swalError } from '@/app/utils/swalAdapter';

export const ACESS_EDIT = (props) => {

    const { swaMsg, currentItem, translation } = props;

    const showSessionError = () => {
        swalError({
            title: swaMsg.generic_eror_title,
            text: 'La sesión no está activa o expiró. Inicie sesión nuevamente antes de gestionar este PQRS.',
        });
    }

    const access = (e) => {
        e.preventDefault();

        const token = localStorage.getItem('dovela_token');
        const userId = window.user?.id;

        if (!token || !userId) {
            showSessionError();
            return;
        }

        var formData = new FormData()
        formData.set('email', userId);
        let password_user = document.getElementById("user_password").value
        formData.set('password', password_user);

        PQRS_SERVICES.login_access(formData)
            .then(response => {
                if (response.data === 'OK') {
                    props.editMaster1()
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: 'Acceso denegado' });
                }
            })
            .catch(error => {
                if (error?.response?.status === 401) {
                    showSessionError();
                    return;
                }

                swalError({
                    title: swaMsg.generic_eror_title,
                    text: 'No fue posible validar el acceso. Inténtelo nuevamente.',
                });
            })
    }

    return <>
        <h2 className='text-center'>ACCESO A LA EDICIÓN ESPECIAL</h2>
        <fieldset className="p-3 border border-info mb-2">
            <p>En esta vista se podrá tener acceso a la edición de la petición ya cerrada, por lo cual se deben tener en cuenta los siguientes ítems:</p>
            <ul>
                <li>Únicamente editar la petición en caso de que sea necesario.</li>
                <li>Ingresar la contraseña.</li>
                <li>Una vez ingresada la contraseña, se podrá tener acceso para editar la información.</li>
            </ul>
            <div className='container col-5 opacity-100'>
                <div className="row d-flex justify-content-center">
                    <div className="col">
                        <label htmlFor="user_password">Contraseña</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="key" size={16} />
                            </span>
                            <input type='password' className='form-control' id='user_password' required></input>
                        </div>
                    </div>
                </div>
                <div className='text-center py-3'>
                    <Button size="sm" onClick={access}>ACCEDER <Icon name="sign-in-alt" size={16} /></Button>
                </div>
            </div>
        </fieldset>
    
        <PQRS_MODULE_NAV
            translation={translation}
            currentItem={currentItem}
            FROM={"editable"}
            NAVIGATION={props.NAVIGATION}
        />
    </>
}
