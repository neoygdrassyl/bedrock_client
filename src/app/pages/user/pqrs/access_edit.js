import React from 'react'
import './components/editorStyles.css'
import PQRS_SERVICES from '../../../services/pqrs_main.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component'
let sha256 = require('js-sha256');

const MySwal = withReactContent(Swal);


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
                }

                else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: 'Acceso denegado',
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })


    }


    return <>
        <h2 className='text-center'>ACCESO A LA EDICIÓN ESPECIAL</h2>
        <fieldset className="p-3 border border-info mb-2">
            <p>En esta vista se podrá tener acceso a la edición de la petición ya cerrada por lo cual se debe tener en cuanta los siguientes ítems.</p>
            <ul>
                <li>Únicamente editar la petición en caso de que sea necesario.</li>
                <li>Ingresar la contraseña.</li>
                <li>Una vez ingreso la contraseña se podrá tener acceso a editar la información.</li>
            </ul>
            <div className='container col-5 opacity-100'>
                <div className="row d-flex justify-content-center">
                    <div className="col">
                        <label>Contraseña</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-key"></i>
                            </span>
                            <input type='password' className='form-control' id='user_password' required></input>
                        </div>
                    </div>
                </div>
                <div className='text-center py-3'>
                    <button type="button" class="btn btn-sm btn-info" onClick={access}>ACCEDER <i class="fas fa-sign-in-alt"></i></button>
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
