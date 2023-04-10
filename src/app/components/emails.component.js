import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import EmailsService from '../services/emails.service';
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import { Uploader } from 'rsuite';
import VIEWER from './viewer.component';

const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const MySwal = withReactContent(Swal);
const EMAIL_TPES = [
    { value: 'rad', label: 'REGISTRO de radicación' },
    { value: 'ldf', label: 'CERTIFICACIÓN de legal y debida forma' },
    { value: 'via', label: 'CERTIFICACIÓN de viabilidad' },

    { value: 'pro', label: 'SOLICITUD para ampliación de plazo de revisión' },

    { value: 'ldf0', label: 'RECORDATORIO de radicación incompleta' },
    { value: 'rew1r', label: 'RECORDATORIO para notificarse del acta de observaciones' },

    { value: 'rew1', label: 'CITACIÓN para notificarse del acta de observaciones' },
    { value: 'via0', label: 'CITACIÓN de viabilidad' },
    { value: 'res', label: 'CITACIÓN de resolución de licencia/reconocimiento' },
    { value: 'rec', label: 'CITACIÓN para notificar recursos' },
    { value: 'rev', label: 'CITACIÓN para notificar revocación' },

    { value: 'neg1', label: 'DESISTE por radicación incompleta' },
    { value: 'neg2', label: 'DESISTE no radico valla' },
    { value: 'neg3', label: 'DESISTE no presento correcciones' },
    { value: 'neg4', label: 'DESISTE no realizo pagos' },
    { value: 'neg5', label: 'DESISTE de forma voluntaria' },

    { value: 'pqrs', label: 'RESPUESTA a petición' },
]

const EMAIL_TPES_LB = {
    'rad': 'REGISTRO de radicación',
    'ldf0': 'RECORDATORIO de radicación incompleta',
    'neg1': 'DESISTE por radicación incompleta',
    'ldf': 'CERTIFICACIÓN de legal y debida forma',
    'neg1': 'DESISTE no radico valla',
    'rew1': 'CITACIÓN para notificarse del acta de observaciones',
    'rew1r': 'RECORDATORIO para notificarse del acta de observaciones',
    'neg3': 'DESISTE no presento correcciones',
    'pro': 'SOLICITUD para ampliación de plazo de revisión',
    'via0': 'CITACIÓN de viabilidad',
    'via': 'CERTIFICACIÓN de viabilidad',
    'neg4': 'DESISTE no realizo pagos',
    'res': 'CITACIÓN de resolución de licencia/reconocimiento',
    'pqrs': 'RESPUESTA a petición',
    'rec': 'CITACIÓN para notificar recursos',
    'rev': 'CITACIÓN para notificar revocación',
    'neg5': 'DESISTE de forma voluntaria',
}

export default function EMAILS_COMPONENT(props) {
    const { translation, swaMsg, id_public, process, users } = props;

    const [emailList, setEmailList] = useState([]);
    const [newEmail, setNewEmail] = useState(false)
    const [load, setLoad] = useState(0);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (load == 0) loadList();
    }, [load]);

    // **************** COMPONENTS  **************** //
    let CheckMark = (bool) => {
        if (bool) return <i class="fas fa-check text-success"></i>
        else return <i class="fas fa-times text-danger"></i>
    }

    function loadEmals() {
        let emails = [];
        let f52e = users.f52_emails.split(';')
        f52e.map(email => {
            if (!emails.includes(email)) emails.push(email)
        })
        if (!emails.includes(users.f53_email)) emails.push(users.f53_email)

        document.getElementById('to_email').value = emails.join(', ')
    }

    // ******************* JSX  ******************* //
    const EMAIL_FORM = () => {
        return <>
            <form onSubmit={onEmailSent} enctype="multipart/form-data">
                <div className='row'>
                    <div className='col'>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <label><i class="far fa-envelope"></i> Para:</label>
                            </span>
                            <input className='form-control' id="to_email" defaultValue={""} required />
                            <button className='btn btn-sm btn-primary' type='button' onClick={() => loadEmals()}>CARGAR EMAILS</button>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <label><i class="far fa-envelope"></i> CC:</label>
                            </span>
                            <input className='form-control' id="cc" defaultValue={""} />
                        </div>
                    </div>
                    <div className='col'>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <label><i class="far fa-envelope"></i> BCC:</label>
                            </span>
                            <input className='form-control' id="bcc" defaultValue={""} />
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <label><i class="fas fa-star-of-life"></i> Asunto:</label>
                            </span>
                            <input className='form-control' id="subject" defaultValue={""} required />
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-6'>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <label><i class="fas fa-ellipsis-v"></i> Motivo:</label>
                            </span>
                            <select className='form-select' id="subprocess">
                                {EMAIL_TPES.map(item => <option value={item.value}>{item.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className='col-6'>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <label><i class="far fa-calendar-check"></i> Programar:</label>
                            </span>
                            <input className='form-control' id="schedule_date" defaultValue={''} type="datetime-local" />
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                        <label>Cuerpo</label>
                        <textarea rows={4} className='form-control' id="body" defaultValue={""} required />
                    </div>
                </div>

                <div className='row'>
                    <div className='col'>
                        <label>Documentos</label>
                        <Uploader fileList={files} onChange={setFiles}
                            action="//jsonplaceholder.typicode.com/posts/" autoUpload={false}
                            draggable>
                            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: "2px dotted" }}>
                                <span>Arrastre los documento a esta área</span>
                            </div>
                        </Uploader>
                    </div>
                </div>


                <div className='row mt-2'>
                    <div className='col'>
                        <button className='btn btn-sm btn-success' type='submit'><i class="far fa-paper-plane"></i> ENVIAR</button>
                    </div>
                </div>


            </form>
        </>
    }

    const EMAIL_LIST = () => {
        const columns = [
            {
                name: <label>Motivo</label>,
                selector: row => EMAIL_TPES_LB[row.subprocess] || '',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => EMAIL_TPES_LB[row.subprocess] || 'NO DATA',
            },
            {
                name: <label>Enviado</label>,
                selector: row => row.send,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{CheckMark(row.send)} {row.send_date ? moment(row.send_date).format('YYYY-MM-DD HH:mm') : ''}</label>,
            },
            {
                name: <label>Abierto</label>,
                selector: row => row.open,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{CheckMark(row.open)} {row.open_date ? moment(row.open_date).format('YYYY-MM-DD HH:mm') : ''}</label>,
            },
            {
                name: <label>Programado</label>,
                selector: row => row.schedule,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{CheckMark(row.schedule)} {row.schedule_date ? moment(row.schedule_date).format('YYYY-MM-DD HH:mm') : ''}</label>
            },
            {
                name: <label>Acción</label>,
                button: true,
                minWidth: '120px',
                cell: row => !row.send ?
                    <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                        <MDBBtn className="btn btn-danger btn-sm m-0 p-1 shadow-none" onClick={() => delete_email(row.id)}>
                            <i class="far fa-trash-alt"></i></MDBBtn>
                    </MDBTooltip>
                    : null
            },
        ]
        return <DataTable
            noDataComponent="No hay Items"
            striped="true"
            columns={columns}
            data={emailList}
            highlightOnHover
            dense
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[20, 50, 100]}
            className="data-table-component"
            title="Lista de correos"

            expandableRows={true}
            expandableRowsComponent={EXPAND_EMAIL}

        />
    }

    const EXPAND_EMAIL = ({ data }) => {
        let filesPath = data.path ? data.path.split(';') : [];

        return <div className='p-3' style={{ width: '100%' }}>
            <div className='row'>
                <div className='col border border-dark'>
                    <label style={{ color: 'darkgrey' }}>Para: </label> <label className=''>{data.to_email}</label>
                </div>
            </div>
            <div className='row'>
                <div className='col border border-dark'>
                    <label style={{ color: 'darkgrey' }}>Asunto: </label>  <label className=''>{data.subject}</label>
                </div>
            </div>
            <div className='row'>
                <div className='col border border-dark'>
                    <label style={{ color: 'darkgrey' }}>CC: </label> <label className=''>{data.cc}</label>
                </div>
                <div className='col border border-dark'>
                    <label style={{ color: 'darkgrey' }}>BCC: </label> <label className=''>{data.bcc}</label>
                </div>
            </div>
            <div className='row'>
                <div className='col border border-dark'>
                    <label style={{ color: 'darkgrey' }}>Cuerpo del correo:</label>
                    <p>{data.body}</p>
                </div>
            </div>
            <div className='row'>
                <div className='col border border-dark'>
                    <label style={{ color: 'darkgrey' }}>Documentos anexos:</label>
                    {
                        filesPath.map(file => {
                            let fileUrl = `${_GLOBAL_ID}/${data.process}/${data.id_public}/${file}`;
                            return <div><label>{file}: </label><VIEWER API={EmailsService.getDoc} params={[fileUrl]} /></div>
                        })
                    }
                </div>
            </div>
        </div>
    };

    // ******************* APIS ******************* //
    function loadList() {
        EmailsService.getAll(_GLOBAL_ID, process, id_public)
            .then(response => {
                setEmailList(response.data)
                setLoad(1)
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
            });
    }

    function onEmailSent(e) {
        e.preventDefault();

        var formData = new FormData()

        formData.set("to_email", document.getElementById('to_email').value);
        formData.set("subject", document.getElementById('subject').value);
        formData.set("body", document.getElementById('body').value);
        formData.set("cc", document.getElementById('cc').value);
        formData.set("bcc", document.getElementById('bcc').value);

        formData.set("send", 0);
        formData.set("open", 0);
        formData.set("schedule", document.getElementById('schedule_date').value ? 1 : 0);
        if (document.getElementById('schedule_date').value) formData.set("schedule_date", document.getElementById('to_email').value);

        formData.set("company", _GLOBAL_ID);
        formData.set("process", process);
        formData.set("id_public", id_public);
        let subprocess = document.getElementById('subprocess').value
        formData.set("subprocess", subprocess);

        formData.set("f52_names", users.f52_names);
        formData.set("f52_surnames", users.f52_surnames);
        formData.set("f52_emails", users.f52_emails);
        formData.set("f53_name", users.f53_name);
        formData.set("f53_surname", users.f53_surname);
        formData.set("f53_email", users.f53_email);

        if (files.length) {
            let path = []
            files.map(file => {
                formData.append("files", file.blobFile);
                path.push(subprocess + '_' + file.blobFile.name)
            })
            formData.set("path", path.join(';'));
        }

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        EmailsService.create(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    loadList()
                    setNewEmail(false)
                    setFiles([])
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
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
            });
    }

    function delete_email(id) {
        MySwal.fire({
            title: "ELIMINAR ESTE ITEM",
            text: "¿Esta seguro de eliminar de forma permanente este item?",
            icon: 'question',
            confirmButtonText: "ELIMINAR",
            showCancelButton: true,
            cancelButtonText: "CANCELAR"
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                EmailsService.delete(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            loadList()
                        } else if (response.data === 'SEND') {
                            MySwal.fire({
                                title: "CORREO ENVIADO",
                                text: "Este correo ya fue enviado y no puede eliminarse.",
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
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
                            title: "ERROR AL CARGAR",
                            text: "No ha sido posible cargar este item, intentelo nuevamente.",
                            icon: 'error',
                            confirmButtonText: props.swaMsg.text_btn,
                        });
                    });
            }
        });
    }
    return (
        <div>
            <legend className="my-2 px-3 text-uppercase Collapsible" id="fung_emails">
                <label className="app-p lead text-center fw-normal text-uppercase">Herramienta de correos electrónicos</label>
            </legend>

            <MDBBtn rounded outline={!newEmail} color="success" sise="sm" onClick={() => setNewEmail(!newEmail)}><i class="fas fa-plus-circle"></i> NUEVO CORREO</MDBBtn>
            {newEmail ? EMAIL_FORM() : null}

            {EMAIL_LIST()}

        </div >
    );
}