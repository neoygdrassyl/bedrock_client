import { MDBBtn } from 'mdb-react-ui-kit';
import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import USERS_Service from '../../../../services/users.service';

const moment = require('moment');
const MySwal = withReactContent(Swal);
class PQRS_WORKERS_EMAILS extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users_list: [],
            attachsForEmails: 0,
            load: false,
        };
    }
    componentDidMount() {
        this.retrieveuUsers();
    }
    retrieveuUsers() {
        USERS_Service.getAll()
            .then(response => {
                this.setState({
                    users_list: response.data,
                    load: true
                })
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este ítem, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
                this.setState({
                    load: false
                })
            });
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.worker !== prevProps.worker && this.props.worker != false) {
            var _ITEM = this.props.worker;
            this._SET_FORM(_ITEM);
        }
        if (this.state.load == true) {
            var _ITEM = this.props.worker;
            this._SET_FORM(_ITEM);
        }
    }

    minusAttachEmail() {
        this.setState({ attachsForEmails: this.state.attachsForEmails - 1 })
    }
    addAttachEmail() {
        this.setState({ attachsForEmails: this.state.attachsForEmails + 1 })
    }

    _SET_FORM = (_ITEM) => {
        let USER = this._GET_USER(_ITEM.worker_id);
        document.getElementById("pqrs_email_notify_worker_1").value = USER.email;
        this._GET_EMAIL_BODY_WORKER_NOTIFY(this.props.email_types[0]);
    }
    _GET_USER = (_id) => {
        let _users = this.state.users_list;
        for (var i = 0; i < _users.length; i++) {
            if (_users[i].id == _id) return _users[i]
        }
        return false;
    }
    _GET_EMAIL_BODY_WORKER_NOTIFY = (_body) => {
        let _email_body = "";
        let CURRENT_ITEM = this.props.currentItem;
        let USER = this._GET_USER(this.props.worker.worker_id);
        // ASIGN 
        if (_body == 0 || _body == null) {
            _email_body = `
            Respetado profesional,  <br/>
            De manera atenta me permito manifestarle que, se le asignó la presente
            petición: ${CURRENT_ITEM.id_publico} la cual puede consultar con más detalles en la página, 
            (https://www.curaduria1bucaramanga.com/pqrsadmin), elevada a la Curaduria N°1 de Bucaramanga. 
            Lo anterior, por cuanto que, en virtud de su contenido, es
            necesaria su intervención en la construcción de la respuesta de fondo a la misma. Al momento de
            dar la respuesta, lo invito a ser lo más contundente posible, citando de manera completa los
            fundamentos que sirvieron para la elaboración de la misma. IMPORTANTE: CUENTA CON UN
            TÉRMINO DE 5 DÍAS PARA DAR RESPUESTA, DE REQUERIR UN TIEMPO ADICIONAL DEBERÁ 
            COMUNICARLO AL ÁREA JURÍDICA, ANTES DEL VENCIMIENTO DEL TÉRMINO INICIAL; ESTA
            SOLICITUD DE PRÓRROGA DEBERÁ ESTAR DEBIDAMENTE MOTIVADA Y/O FUNDAMENTADA. <br/>
            Agradeciendo su atención y quedando atenta a su respuesta,
            Asesora jurídica – Curaduría Urbana No. 01 de Bucaramanga.
            `.replace(/[\n\r]+ */g, ' ');
        }
        // REMEMBER ASIGN
        if (_body == 1) {
            _email_body = `
            Respetado profesional, <br/>
            La suscrita asesora jurídica evidencia que, se venció el término para allegar la respuesta requerida
            y asignada para la petición ${CURRENT_ITEM.id_publico} la cual puede consultar con más detalles en la página, 
            (https://www.curaduria1bucaramanga.com/pqrsadmin), y esta no fue recibida, así como tampoco solicitud de prórroga del
            término para dar respuesta, debidamente fundamentada. Por lo anterior, me permito
            REQUERIRLO a fin de que indique el motivo por el cual no ha dado contestación y en todo caso,
            SOLICITARLE que allegue respuesta de fondo a la petición en el término de un (1) día, contado a
            partir de la recepción de este correo.  <br/>
            Agradeciendo su atención y quedando atenta a su respuesta,
            Asesora jurídica – Curaduría Urbana No. 01 de Bucaramanga.
            `.replace(/[\n\r]+ */g, ' ');
        }
        // ASK FOR REVIEW
        if (_body == 2) {
            _email_body = `
            Respetado profesional,<br/>
            De manera atenta, y en virtud de su participación e intervención en la elaboración y/o proyección
            de la respuesta de la petición ${CURRENT_ITEM.id_publico} la cual puede consultar con más detalles en la página, 
            (https://www.curaduria1bucaramanga.com/pqrsadmin), amablemente SOLICITO su visto bueno al documento final
            de respuesta al peticionario; este documento contiene la totalidad de las respuestas requeridas
            para la petición, compiladas por la suscrita asesora jurídica, quien en virtud de las funciones
            propias, procedió a darle la redacción y orden adecuada, así como a aplicar las reglas ortográficas
            y normas de citación. Así mismo de no estar de acuerdo con lo consignado en dicho documento,
            deberá seleccionar la opción NO APRUEBO, indicando de manera detallada el motivo de su
            renuencia. Una vez seleccione la opción de VISTO BUENO, estará indicando que aprueba el
            documento y que su nombre y firma queden consignados en él, dentro de los profesionales que
            revisaron la misma. <br/>
            Cordialmente, <br/>
            Asesora jurídica – Curaduría Urbana No. 01 de Bucaramanga
            `.replace(/[\n\r]+ */g, ' ');
        }
        document.getElementById('pqrs_email_notify_worker_2').value = _email_body;
    }
    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { load, attachsForEmails } = this.state;


        // DATA GETTERS 
        // DATA CONVERTERS
        let _GET_EMAIL_TYPES = () => {
            let _COMPONENT = [];
            let email_types = this.props.email_types;
            for (var i = 0; i < email_types.length; i++) {
                if (email_types[i] == 0) _COMPONENT.push(<option value="0">CORREO DE NOTIFICACIÓN DE ASIGNACIÓN</option>)
                if (email_types[i] == 1) _COMPONENT.push(<option value="1">CORREO DE REITERACIÓN DE ASIGNACIÓN</option>)
                if (email_types[i] == 2) _COMPONENT.push(<option value="2">CORREO DE SOLICITUD DE VISTO BUENO</option>)
            }
            return <>{_COMPONENT}</>
        }

        // COMPONENT JSX
        let _EMAIL_NOTIFY_WORKER = () => {
            return <>

                <div className="row">
                    <div className="col-6">
                        <label>Correo del Profesional</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" id="pqrs_email_notify_worker_1" disabled required />
                            <button type="submit" class="btn btn-warning shadow-none">ENVIAR CORREO</button>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>Tipo de Correo</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <select class="form-control" id="pqrs_email_notify_worker_3" onChange={(e) => this._GET_EMAIL_BODY_WORKER_NOTIFY(e.target.value)}>
                                {_GET_EMAIL_TYPES()}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label>Cuerpo del Email (Modifique este texto debidamente)</label>
                        <textarea class="form-control mb-3" rows="3" id="pqrs_email_notify_worker_2"></textarea>
                    </div>
                </div>

            </>
        }
        let _ATTACHSFOREMAIL_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < attachsForEmails; i++) {
                _COMPONENT.push(<div className="row d-flex justify-content-center my-2">
                    <div className="col-lg-8 col-md-8 ">
                        <label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTO ANEXO N° {i + 1}</label>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                            <input type="file" class="form-control" name="files_foremail" accept="image/png, image/jpeg application/pdf" />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        // FUNCTIONS & APIS
        var formData = new FormData();
        let notifyEmail = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('id', this.props.worker.id);
            formData.set('sent_email_notify', moment().format('YYYY-MM-DD'));

            let email_list = document.getElementById("pqrs_email_notify_worker_1").value;
            formData.set('email_list', email_list);
            let email_body = document.getElementById("pqrs_email_notify_worker_2").value;
            formData.set('email_body', email_body);


            // GET DATA OF ATTACHS
            if (attachsForEmails) {
                let files = document.getElementsByName("files_foremail");
                formData.set('attachs_length', attachsForEmails);
                for (var i = 0; i < attachsForEmails; i++) {
                    formData.append('file', files[i].files[0], "undefined_" + files[i].files[0].name)
                }
            }

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.sendEmailWorkerNotification(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.retrieveItem(currentItem.id);
                        this.props.closeComponent()
                    } else {
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
        }

        return (
            <div>
                {load
                    ? <>
                        <form id="form_extension_email" onSubmit={notifyEmail}>
                            <div className="border border-warning p-3" >
                                {_EMAIL_NOTIFY_WORKER()}
                                {this.props.email_types.indexOf(2) > -1
                                    ? <>
                                        <div className="text-end m-3">
                                            <p className="text-end fw-bold text-uppercase">Anexar Documento</p>
                                            {attachsForEmails > 0
                                                ? <MDBBtn className="btn btn-secondary mx-3" onClick={() => this.minusAttachEmail()}><i class="fas fa-minus-circle"></i> REMOVER ULTIMO </MDBBtn>
                                                : ""}
                                            <MDBBtn className="btn btn-secondary" onClick={() => this.addAttachEmail()}><i class="fas fa-plus-circle"></i> AÑADIR </MDBBtn>
                                            {_ATTACHSFOREMAIL_COMPONENT()}
                                        </div>
                                    </>
                                    : ""}
                            </div >
                        </form> </>
                    : ""}

            </div>
        );
    }
}

export default PQRS_WORKERS_EMAILS;