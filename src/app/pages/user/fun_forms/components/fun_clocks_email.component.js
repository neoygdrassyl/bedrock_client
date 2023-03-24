import { MDBBtn } from 'mdb-react-ui-kit';
import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { dateParser, dateParser_finalDate } from '../../../../components/customClasses/typeParse';
import FUN_SERVICE from '../../../../services/fun.service'
import USERS_Service from '../../../../services/users.service';

const moment = require('moment');
const MySwal = withReactContent(Swal);
class FUN_CLOCKS_EMAILS extends Component {
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
    _GET_SOLICITOR = () => {
        var _CHILD = this.props.currentItem.fun_53s;
        var _CURRENT_VERSION = this.props.currentItem.version - 1;
        var _CHILD_VARS = {
            item_530: "",
            item_5311: "",
            item_5312: "",
            item_532: "",
            item_533: "",
            item_534: "",
            item_535: "",
            item_536: "",
            docs: "",
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.item_530 = _CHILD[_CURRENT_VERSION].id;
                _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name;
                _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname;
                _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number;
                _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role;
                _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number;
                _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email;
                _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address;
                _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs;
            }
        }
        return _CHILD_VARS;
    }


    _GET_EMAIL_BODY = (_body) => {
        let _email_body = "";
        let CURRENT_ITEM = this.props.currentItem;



        if (_body == 3 || _body == null) {
            _email_body = `
           Recordatorio Inicial
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
           `.replace(/[\n\r]+ */g, ' ');
        }
        if (_body == 4 || _body == null) {
            _email_body = `
            Recordar ratificación
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
           `.replace(/[\n\r]+ */g, ' ');
        }
        // NOTIFICACION 1
        if (_body == 6 || _body == null) {
            _email_body = `
            Email de notiificacion 1.
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
           `.replace(/[\n\r]+ */g, ' ');
        }
        // NOTIFICACION 1 - AVISO
        if (_body == 8 || _body == null) {
            _email_body = `
            Email de notiificacion 1 por aviso.
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
           `.replace(/[\n\r]+ */g, ' ');
        }
        // CURADURIA REPLY
        if (_body == 17) {
            _email_body = `
           Email de respuesta.
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
            `.replace(/[\n\r]+ */g, ' ');
        }
        // NOTIFICACION 2
        if (_body == 20) {
            _email_body = `
           Notificacion 2
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
            `.replace(/[\n\r]+ */g, ' ');
        }
        // NOTIFICACION 2
        if (_body == 22) {
            _email_body = `
           Notificacion 2, el solicitante no se presento y se informa por email
            <br/>  <br/>
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
            `.replace(/[\n\r]+ */g, ' ');
        }
        if (_body == 99) {
            _email_body = `
            Agradeciendo su comprensión,  <br/>
            Curaduría Urbana No. 1 de Bucaramanga  <br/>
            curaduriaurbana1@gmail.com  <br/>
            teléfono:  680 3596 <br/>
            página web: https://www.curaduria1bucaramanga.com/ <br/>
            `.replace(/[\n\r]+ */g, ' ');
        }
        // FORMAL REPLY

        document.getElementById('fun_email_2').value = _email_body;
    }
    render() {
        const { translation, swaMsg, globals, currentItem, attachs } = this.props;
        const { load, attachsForEmails } = this.state;

        // DATA GETTERS 4
        let _GET_CHILD_53 = () => {
            var _CHILD = currentItem.fun_53s;
            var _CURRENT_VERSION = currentItem.version - 1;
            var _CHILD_VARS = {
                item_530: "",
                item_5311: "",
                item_5312: "",
                item_532: "",
                item_533: "",
                item_534: "",
                item_535: "",
                item_536: "",
                docs: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.id = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.name = _CHILD[_CURRENT_VERSION].name;
                    _CHILD_VARS.surname = _CHILD[_CURRENT_VERSION].surname;
                    _CHILD_VARS.id_number = _CHILD[_CURRENT_VERSION].id_number;
                    _CHILD_VARS.role = _CHILD[_CURRENT_VERSION].role;
                    _CHILD_VARS.number = _CHILD[_CURRENT_VERSION].number;
                    _CHILD_VARS.email = _CHILD[_CURRENT_VERSION].email;
                    _CHILD_VARS.address = _CHILD[_CURRENT_VERSION].address;
                    _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs;
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CONTACTS = () => {
            return [_GET_CHILD_53()];
        }
        let _GET_CHILD_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        // DATA CONVERTERS
        let _GET_EMAIL_TYPES = () => {
            let _COMPONENT = [];
            let email_types = this.props.email_types;
            for (var i = 0; i < email_types.length; i++) {
                if (email_types[i] == 3) _COMPONENT.push(<option value="3">RECORDATORIO INICIAL</option>)
                if (email_types[i] == 4) _COMPONENT.push(<option value="4">RECORDATORIO RATIFICACIÓN</option>)
                if (email_types[i] == 6) _COMPONENT.push(<option value="6">NOTIFICACIÓN INICIAL</option>)
                if (email_types[i] == 8) _COMPONENT.push(<option value="8">NOTIFICACIÓN POR AVISO</option>)
                if (email_types[i] == 17) _COMPONENT.push(<option value="17">CURADURIA DA RESPUESTA</option>)
                if (email_types[i] == 20) _COMPONENT.push(<option value="20">NOTIFICACIÓN FINAL</option>)
                if (email_types[i] == 22) _COMPONENT.push(<option value="22">NOTIFICACIÓN FINAL POR AVISO</option>)
            }
            _COMPONENT.push(<option value="99">OTRO</option>)
            return <>{_COMPONENT}</>
        }
        let _GET_EMAILS_TO_NOTIFY = () => {
            let _LIST = [];
            let _CONTACTS = _GET_CONTACTS();
            for (var i = 0; i < _CONTACTS.length; i++) {
                _LIST.push(_CONTACTS[i].email);
            }
            return _LIST.join(', ');
        }
        let _GET_CLOCK_STATE_VERSION = (_state, _version) => {
            var _CLOCK = _GET_CHILD_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_ONGOING_PROCESS = () => {
            let OngoingProcess = 0;
            if (_GET_CLOCK_STATE_VERSION(-5, -1) && !_GET_CLOCK_STATE_VERSION(-30, -1)) OngoingProcess = -1;
            if (_GET_CLOCK_STATE_VERSION(-5, -2) && !_GET_CLOCK_STATE_VERSION(-30, -2)) OngoingProcess = -2;
            if (_GET_CLOCK_STATE_VERSION(-5, -3) && !_GET_CLOCK_STATE_VERSION(-30, -3)) OngoingProcess = -3;
            if (_GET_CLOCK_STATE_VERSION(-5, -4) && !_GET_CLOCK_STATE_VERSION(-30, -4)) OngoingProcess = -4;
            return OngoingProcess;
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
                            <input type="text" class="form-control" id="fun_email_1"
                                defaultValue={_EMAILS} required />
                            <button type="submit" class="btn btn-warning shadow-none">ENVIAR CORREO</button>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>Tipo de Correo</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <select class="form-control" id="fun_email_3" onChange={(e) => this._GET_EMAIL_BODY(e.target.value)}>
                                {_GET_EMAIL_TYPES()}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label>Cuerpo del Email (Modifique este texto debidamente)</label>
                        <textarea class="form-control mb-3" rows="3" id="fun_email_2"></textarea>
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
                let email_type = document.getElementById('fun_email_3') ? document.getElementById('fun_email_3').value : null;
                if (email_type == 0) {
                    if (attachsForEmails == 0) _COMPONENT.push(<label className="text-danger fw-bold">Para el email de confirmacion se requiere el documento PDF de confimacion anexado</label>)
                }
            }
            return <>{_COMPONENT}</>
        }

        // FUNCTIONS & APIS
        var formData = new FormData();

        let email = (e) => {
            e.preventDefault();
            formData = new FormData();
            let email_list = document.getElementById("fun_email_1").value;
            formData.set('email_list', email_list);
            let email_body = document.getElementById("fun_email_2").value;
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

            let email_type = document.getElementById('fun_email_3').value;

            if (email_type == 6) email_manage('-6');
            if (email_type == 8) email_manage('-8');
            if (email_type == 17) email_manage('-17');
            if (email_type == 20) email_manage('-20');
            if (email_type == 22) email_manage('-22');
        }

        let email_manage = (_state) => {
            let OngoingProcess = _GET_ONGOING_PROCESS();
            let _clock = _GET_CLOCK_STATE_VERSION(_state, OngoingProcess);
            if (_clock) MySwal.fire({
                title: "ESTA ACCION HA SE REALIZÓ",
                text: "Este paso del proceso de desistimiento ya se ha realizado posteriormente, repetir el paso nuevamente no actualizará ningnu valor.",
                icon: 'warning',
                confirmButtonText: swaMsg.text_btn,
            });

            FUN_SERVICE.sendEmailNegative_6(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        if (!_clock) this.props.processCheck(_state);
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
        return (
            <div>
                {load
                    ? <>
                        <form id="form_extension_email" onSubmit={email}>
                            <div className="border border-muted p-3" >
                                {_EMAIL_COMPONENT()}
                                {_ALERTS()}
                                {attachs
                                    ? <>
                                        <div className="text-end m-3">
                                            <p className="lead text-end fw-bold text-uppercase">Anexar Documento</p>
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

export default FUN_CLOCKS_EMAILS;