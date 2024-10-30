import { MDBBtn } from 'mdb-react-ui-kit';
import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { dateParser, dateParser_finalDate } from '../../../../components/customClasses/typeParse';
import PQRS_Service from '../../../../services/pqrs_main.service';
import USERS_Service from '../../../../services/users.service';
import { PQRS_SEND_DATE } from './pqrs_send_date.component';

const moment = require('moment');
const MySwal = withReactContent(Swal);
class PQRS_EMAILS extends Component {
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
                this._GET_EMAIL_BODY(this.props.email_types[0]);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
                this.setState({
                    load: false
                })
            });
    }

    minusAttachEmail() {
        this.setState({ attachsForEmails: this.state.attachsForEmails - 1 })
    }
    addAttachEmail() {
        this.setState({ attachsForEmails: this.state.attachsForEmails + 1 })
    }

    _GET_USER = (_id) => {
        let _users = this.state.users_list;
        for (var i = 0; i < _users.length; i++) {
            if (_users[i].id == _id) return _users[i]
        }
        return false;
    }
    _GET_SOLICITORS_NAMES = () => {
        let _SOLICITORS = this.props.currentItem.pqrs_solocitors;
        let _LIST = [];
        for (var i = 0; i < _SOLICITORS.length; i++) {
            _LIST.push(_SOLICITORS[i].name);
        }
        return _LIST.join(', ');
    }
    
   


    _GET_EMAIL_BODY = (_body) => {
        let _email_body = "";
        let CURRENT_ITEM = this.props.currentItem;
        let _SOLICITORS = this._GET_SOLICITORS_NAMES();
        // CONFIRMACION 1
        if (_body == 0 || _body == null) {
            _email_body = `
            Respetuosamente nos permitimos manifestarle que, el código de ingreso de su solicitud a
            través de la ventanilla única es el  ${CURRENT_ITEM.id_global}. Ahora bien, por tratarse de una petición, se
            asigna además el código  ${CURRENT_ITEM.id_publico}. El equipo interdisciplinario de la curaduría urbana No.
            1 de Bucaramanga, estudiará su petición y dará respuesta a la dirección electrónica y/o
            física indicada en su escrito. La respuesta a la misma se dará según la modalidad de la
            petición y cumpliendo los términos establecidos en el artículo 14 de la ley 1755 de 2015,
            en concordancia con el decreto legislativo 491 de 2020 artículo 5.
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
           `.replace(/[\n\r]+ */g, ' ');
        }
        // EXTENSION
        if (_body == 1) {

            let _EXTENSION_REASON = CURRENT_ITEM.pqrs_law.extension_reason
            let _FINAL_DATE = dateParser_finalDate(CURRENT_ITEM.pqrs_time.legal, CURRENT_ITEM.pqrs_time.time);
            _email_body = `
            Cordial saludo,
            Respetuosamente y de manera atenta nos permitimos informar que, su petición de radicado ${CURRENT_ITEM.id_publico}, 
            se encuentra en estudio y proyección de respuesta. Ahora bien, debido a la complejidad de
            esta, no es posible entregar una respuesta de fondo, completa y congruente, en el término
            inicialmente señalado, por esto me permito manifestarle que, su petición se resolverá el día ${dateParser(_FINAL_DATE)}. 
            Lo anterior de conformidad con lo contemplado en el parágrafo del artículo 14 de la ley
            1755 de 2015.
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
            `.replace(/[\n\r]+ */g, ' ');
        }
        // CONFIRMACION 2
        if (_body == 2) {
            _email_body = `
            Respetuosamente nos permitimos manifestarle que, el código de ingreso de su solicitud a
            través de la ventanilla única es el ${CURRENT_ITEM.id_global}. Ahora bien, una vez analizados los
            documentos allegados se evidencia que, se trata de una solicitud de licencia que no
            cumple con los requisitos legales contemplados en el decreto 1077 de 2015, resolución
            462 y 463 de 2017 y demás normas concordantes, no siendo posible su radicación como
            solicitud de licencia y/u otras actuaciones, ni asignarle un radicado. Por lo anterior, se
            tramitará como petición incompleta y de conformidad con el artículo 17 de la ley 1755 de
            2015, se le REQUIERE para que la complete en el término máximo de un (1) mes, so pena
            del desistimiento y archivo de esta. El código de la presente petición es el ${CURRENT_ITEM.id_publico}.
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
           `.replace(/[\n\r]+ */g, ' ');
        }
        // FORMAL REPLY
        if (_body == 3) {
            _email_body = `
            Cordial saludo,
            De manera respetuosa me permito adjuntar el escrito de respuesta a su petición de código ${CURRENT_ITEM.id_global} 
            ${CURRENT_ITEM.id_publico}, 
            con sus anexos, según el caso. Quedando atenta a cualquier comentario y
            requerimiento.
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
            `.replace(/[\n\r]+ */g, ' ');
        }
        // CONFIRMACION 3
        if (_body == 4) {
            _email_body = `
            Respetuosamente nos permitimos manifestarle que, el código de ingreso de su solicitud a
            través de la ventanilla única es el ${CURRENT_ITEM.id_global}. Por evidenciarse que los documentos
            allegados corresponden a los solicitados o requeridos dentro de su solicitud de licencia No.
            68001-1-XX-XXXX, estos serán radicados dentro del expediente y serán evaluados por el
            equipo interdisciplinario de la curaduría, y de requerirse corrección y/o complementación
            alguna se le comunicará a través de este mismo medio.
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
           `.replace(/[\n\r]+ */g, ' ');
        }
        document.getElementById('pqrs_email_2').value = _email_body;
    }
    render() {
        const { translation, swaMsg, globals, currentItem, attachs } = this.props;
        const { load, attachsForEmails } = this.state;


        // DATA GETTERS 
        let _GET_CONTACTS = () => {
            return currentItem.pqrs_contacts;
        }

        // DATA CONVERTERS
        let _GET_EMAIL_TYPES = () => {
            let _COMPONENT = [];
            let email_types = this.props.email_types;
            for (var i = 0; i < email_types.length; i++) {
                if (email_types[i] == 0) _COMPONENT.push(<option value="0">CONFIRMACIÓN DE RECIBIDO</option>)
                if (email_types[i] == 1) _COMPONENT.push(<option value="1">PRORROGA</option>)
                if (email_types[i] == 2) _COMPONENT.push(<option value="2">CONFIRMACIÓN DE RECIBIDO - PETICIÓN INCOMPLETA</option>)
                if (email_types[i] == 3) _COMPONENT.push(<option value="3">RESPUESTA A PETICIONARIO</option>)
                if (email_types[i] == 4) _COMPONENT.push(<option value="4">CONFIRMACIÓN DE RECIBIDO - LICENCIA</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _GET_EMAILS_TO_NOTIFY = () => {
            let _LIST = [];
            let _CONTACTS = _GET_CONTACTS();
            for (var i = 0; i < _CONTACTS.length; i++) {
                if (_CONTACTS[i].notify == 1) {
                    _LIST.push(_CONTACTS[i].email);
                }
            }
            return _LIST.join(', ');
        }
        // COMPONENT JSX
        let _EMAIL_COMPONENT = () => {
            let _EMAILS = _GET_EMAILS_TO_NOTIFY();
            return <>
                <label className="fw-bold text-success text-warning">Enviar Correo</label>
                <div className="row">
                    <div className="col-6">
                        <label>Lista de Correos (Separados por coma)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" id="pqrs_email_1"
                                defaultValue={_EMAILS} required />
                            <button type="submit" class="btn btn-warning shadow-none" disabled>ENVIAR CORREO</button>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>Tipo de Correo</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <select class="form-control" id="pqrs_email_3" onChange={(e) => this._GET_EMAIL_BODY(e.target.value)}>
                                {_GET_EMAIL_TYPES()}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label>Cuerpo del Email (Modifique este texto debidamente)</label>
                        <textarea class="form-control mb-3" rows="3" id="pqrs_email_2"></textarea>
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
        let _ALERTS = () => {
            let _COMPONENT = [];
            if (attachs) {
                let email_type = document.getElementById('pqrs_email_3') ? document.getElementById('pqrs_email_3').value : null;
                if (email_type == 0) {
                    if (attachsForEmails == 0) _COMPONENT.push(<label className="text-danger fw-bold">Para el email de confirmación se requiere el documento PDF de confimacion anexado</label>)
                }
            }
            return <>{_COMPONENT}</>
        }

        // FUNCTIONS & APIS
        var formData = new FormData();

        let email = (e) => {
            e.preventDefault();
            formData = new FormData();
            let email_list = document.getElementById("pqrs_email_1").value;
            formData.set('email_list', email_list);
            let email_body = document.getElementById("pqrs_email_2").value;
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

            let email_type = document.getElementById('pqrs_email_3').value;

            if (email_type == 0) email_confirmation();
            if (email_type == 1) email_extension();
            if (email_type == 2) return 1
            if (email_type == 3) email_reply();
        }

        let email_extension = () => {
            PQRS_Service.sendEmailExtension(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.refreshCurrentItem(currentItem.id);
                        this.setState({ attachsForEmails: 0 })
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
        }
        let email_confirmation = () => {
            PQRS_Service.sendEmailConfirmation(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.refreshCurrentItem(currentItem.id);
                        this.setState({ attachsForEmails: 0 })
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
        }
        let email_reply = () => {

            let time_reply_formal = document.getElementById("pqrs_formal_time").value;
            formData.set('reply_formal', time_reply_formal);
            formData.set('id_time', currentItem.pqrs_time.id);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.sendEmailReply(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.refreshCurrentItem(currentItem.id);
                        this.setState({ attachsForEmails: 0 })
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
                });
        };
        const UPDATE_PQRS = () => {
            var form = new FormData();
    
            const id_confirm = document.getElementById("pqrs_master_id_confirm").value
            form.set('id_confirm', id_confirm);
            form.set('id_old', currentItem.id_confirm);
    
            PQRS_Service.update(currentItem.id, form)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                } else if (response.data === 'ERROR_DUPLICATE') {
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
            });
        }

        return (
            <div>
                {load
                    ? <>
                        <form id="form_extension_email" onSubmit={email}>
                            <div className="" >
                                {_EMAIL_COMPONENT()}
                                {attachs
                                    ? <>
                                        <div className="text-end m-3">
                                            <p className="lead text-end fw-bold text-uppercase">Anexar Documento</p>
                                            {attachsForEmails > 0
                                                ? <MDBBtn className="btn btn-secondary btn-sm mx-3" onClick={() => this.minusAttachEmail()}><i class="fas fa-minus-circle"></i> REMOVER ULTIMO </MDBBtn>
                                                : ""}
                                            <MDBBtn className="btn btn-secondary btn-sm" onClick={() => this.addAttachEmail()}><i class="fas fa-plus-circle"></i> AÑADIR </MDBBtn>
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

export default PQRS_EMAILS;