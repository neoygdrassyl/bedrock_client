
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { dateParser, dateParser_finalDate } from '../../../../components/customClasses/typeParse';
import PQRS_Service from '../../../../services/pqrs_main.service';
import USERS_Service from '../../../../services/users.service';
import { PQRS_SEND_DATE } from './pqrs_send_date.component';

import dayjs from 'dayjs';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
function PQRS_EMAILS({ translation, swaMsg, globals, currentItem, attachs, email_types, refreshCurrentItem, closeComponent }) {
    const [usersList, setUsersList] = useState([]);
    const [attachsForEmails, setAttachsForEmails] = useState(0);
    const [load, setLoad] = useState(false);
    const [emailList, setEmailList] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [selectedEmailType, setSelectedEmailType] = useState(String(email_types?.[0] ?? 0));

    useEffect(() => {
        retrieveUsers();
    }, []);
    const retrieveUsers = () => {
        USERS_Service.getAll()
            .then(response => {
                setUsersList(response.data);
                setLoad(true);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
                setLoad(false);
            });
    };

    useEffect(() => {
        setSelectedEmailType(String(email_types?.[0] ?? 0));
    }, [email_types]);

    useEffect(() => {
        if (!load) return;
        setEmailList(_GET_EMAILS_TO_NOTIFY());
    }, [load, currentItem]);

    useEffect(() => {
        if (!load) return;
        setEmailBody(_GET_EMAIL_BODY(selectedEmailType));
    }, [load, selectedEmailType, currentItem]);

    const minusAttachEmail = () => {
        setAttachsForEmails(prev => prev - 1);
    };
    const addAttachEmail = () => {
        setAttachsForEmails(prev => prev + 1);
    };

    const _GET_USER = (_id) => {
        for (var i = 0; i < usersList.length; i++) {
            if (usersList[i].id == _id) return usersList[i]
        }
        return false;
    }
    const _GET_SOLICITORS_NAMES = () => {
        let _SOLICITORS = currentItem.pqrs_solocitors;
        let _LIST = [];
        for (var i = 0; i < _SOLICITORS.length; i++) {
            _LIST.push(_SOLICITORS[i].name);
        }
        return _LIST.join(', ');
    }
    
   

    const _GET_EMAIL_BODY = (_body) => {
        let _email_body = "";
        let CURRENT_ITEM = currentItem;
        let _SOLICITORS = _GET_SOLICITORS_NAMES();
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
        return _email_body;
    }

        // DATA GETTERS 
        let _GET_CONTACTS = () => {
            return currentItem.pqrs_contacts;
        }

        // DATA CONVERTERS
        let _GET_EMAIL_TYPES = () => {
            let _COMPONENT = [];
            for (var i = 0; i < email_types.length; i++) {
                if (email_types[i] == 0) _COMPONENT.push(<option key="email-type-0" value="0">CONFIRMACIÓN DE RECIBIDO</option>)
                if (email_types[i] == 1) _COMPONENT.push(<option key="email-type-1" value="1">PRORROGA</option>)
                if (email_types[i] == 2) _COMPONENT.push(<option key="email-type-2" value="2">CONFIRMACIÓN DE RECIBIDO - PETICIÓN INCOMPLETA</option>)
                if (email_types[i] == 3) _COMPONENT.push(<option key="email-type-3" value="3">RESPUESTA A PETICIONARIO</option>)
                if (email_types[i] == 4) _COMPONENT.push(<option key="email-type-4" value="4">CONFIRMACIÓN DE RECIBIDO - LICENCIA</option>)
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="envelope" size={16} />
                            </span>
                            <input type="text" className="form-control" id="pqrs_email_1"
                                value={emailList} onChange={(e) => setEmailList(e.target.value)} required />
                            <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90" type="submit" disabled>ENVIAR CORREO</Button>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>Tipo de Correo</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="envelope" size={16} />
                            </span>
                            <select className="form-control" id="pqrs_email_3" value={selectedEmailType} onChange={(e) => setSelectedEmailType(e.target.value)}>
                                {_GET_EMAIL_TYPES()}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label>Cuerpo del Email (Modifique este texto debidamente)</label>
                        <textarea className="form-control mb-3" rows="3" id="pqrs_email_2" value={emailBody} onChange={(e) => setEmailBody(e.target.value)}></textarea>
                    </div>
                </div>

            </>
        }
        let _ATTACHSFOREMAIL_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < attachsForEmails; i++) {
                _COMPONENT.push(<div key={`pqrs-email-attach-${i}`} className="row d-flex justify-content-center my-2">
                    <div className="col-lg-8 col-md-8 ">
                        <label className="app-p lead text-start fw-normal">DOCUMENTO ANEXO N° {i + 1}</label>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                            <input type="file" className="form-control" name="files_foremail" accept="image/png, image/jpeg application/pdf" />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        let _ALERTS = () => {
            let _COMPONENT = [];
            if (attachs) {
                let email_type = selectedEmailType;
                if (email_type == 0) {
                    if (attachsForEmails == 0) _COMPONENT.push(<label key="pqrs-email-alert-attach" className="text-danger fw-bold">Para el email de confirmación se requiere el documento PDF de confimacion anexado</label>)
                }
            }
            return <>{_COMPONENT}</>
        }

        // FUNCTIONS & APIS
        var formData = new FormData();

        let email = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('email_list', emailList);
            formData.set('email_body', emailBody);

            // GET DATA OF ATTACHS
            if (attachsForEmails) {
                let files = document.getElementsByName("files_foremail");
                formData.set('attachs_length', attachsForEmails);
                for (var i = 0; i < attachsForEmails; i++) {
                    formData.append('file', files[i].files[0], "undefined_" + files[i].files[0].name)
                }
            }

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

            let email_type = selectedEmailType;

            if (email_type == 0) email_confirmation();
            if (email_type == 1) email_extension();
            if (email_type == 2) return 1
            if (email_type == 3) email_reply();
        }

        let email_extension = () => {
            PQRS_Service.sendEmailExtension(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        refreshCurrentItem(currentItem.id);
                        setAttachsForEmails(0)
                    }
                    else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });
        }
        let email_confirmation = () => {
            PQRS_Service.sendEmailConfirmation(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        refreshCurrentItem(currentItem.id);
                        setAttachsForEmails(0)
                    }
                    else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });
        }
        let email_reply = () => {

            let time_reply_formal = document.getElementById("pqrs_formal_time").value;
            formData.set('reply_formal', time_reply_formal);
            formData.set('id_time', currentItem.pqrs_time.id);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.sendEmailReply(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                        refreshCurrentItem(currentItem.id);
                        setAttachsForEmails(0)
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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
                    swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                } else if (response.data === 'ERROR_DUPLICATE') {
                    swalError({ title: "ERROR DE DUPLICACION", text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo" });
                }
                else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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
                                            <p className="lead text-end fw-bold">Anexar Documento</p>
                                            {attachsForEmails > 0
                                                ? <Button variant="outline" size="sm" className="mx-3" onClick={() => minusAttachEmail()}><Icon name="minus-circle" size={16} /> REMOVER ULTIMO </Button>
                                                : ""}
                                            <Button variant="outline" size="sm" onClick={() => addAttachEmail()}><Icon name="plus-circle" size={16} /> AÑADIR </Button>
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

export default PQRS_EMAILS;
