import './components/editorStyles.css'
import PQRS_SERVICES from '../../../services/pqrs_main.service'
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component'
import { Icon } from '@/components/icon';
import { swalError } from '@/app/utils/swalAdapter';
let sha256 = require('js-sha256');

export const ACESS_EDIT = (props) => {

    const { swaMsg, currentItem, translation } = props;

    const access = (e) => {
        e.preventDefault();
        var formData = new FormData()
        formData.set('email', window.user.id);
        let password_user = document.getElementById("user_password").value
        formData.set('password', sha256(password_user));

        PQRS_SERVICES.login_access(formData)
            .then(response => {
                if (response.data === 'OK') {
                    props.editMaster1()
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: 'Acceso denegado' });
                }
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
                        <label>Contraseña</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="key" size={16} />
                            </span>
                            <input type='password' className='form-control' id='user_password' required></input>
                        </div>
                    </div>
                </div>
                <div className='text-center py-3'>
                    <button type="button" className="btn btn-sm btn-info" onClick={access}>ACCEDER <Icon name="sign-in-alt" size={16} /></button>
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
