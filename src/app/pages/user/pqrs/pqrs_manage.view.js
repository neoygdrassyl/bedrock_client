import React, { useState, useEffect, useRef } from 'react';
import DataTable, { ExpanderComponentProps } from 'react-data-table-component';
import PQRS_Service from '../../../services/pqrs_main.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import USERS_Service from '../../../services/users.service'
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import { dateParser, dateParser_finalDate } from '../../../components/customClasses/typeParse'
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component';
import PQRS_LAYOUT_WRAPPER from './components/pqrs_layoutWrapper.component';
import PQRS_EMAILS from './components/pqrs_emails.component';
import PQRS_WORKERS_EMAILS from './components/pqrs_workersEmails.component';
import PQRS_COMPONENT_ATTACH_PROFESIONAL from './components/pqrs_attach_pro.component';
import Collapsible from 'react-collapsible';
import { PQRS_SET_REPLY1 } from './components/pqrs_setReply2.component';
import JoditEditor from "jodit-pro-react";
import SUBMIT_SINGLE_VIEW from '../submit/submit_view.component';
import PQRS_COMPONENT_INFO from './components/pqrs_gen.component';
import PQRS_COMPONENT_CLOCKS from './components/pqrs_clock.component';
import PQRS_COMPONENT_LICENCE from './components/pqrs_licence.component';
import PQRS_EDIT_SOLICITORS from './components/pqrs_manage_solicitors.component';
import PQRS_EDIT_CONTACT from './components/pqrs_manage_contact.component';
import PQRS_EDIT_FUN from './components/pqrs_manage_fun.component';
import PQRS_EDIT_INFO from './components/pqrs_manage_info.component';
import PQRS_EDIT_ATTACH from './components/pqrs_manage_attachs.component';
import { SEEN_COMPONENT_FORM } from './components/pqrs.senn.component';
import { PQRS_SEND_DATE } from './components/pqrs_send_date.component';
import { HISTORY_PQRS_INFO } from './components/pqrs_histoy.component';
import { PQRS_ID_CONFIRM } from './components/pqrs_id_confitm.component';
import cubXvrService from '../../../services/cubXvr.service';

const moment = require('moment');

const MySwal = withReactContent(Swal);

export default function PQRS_MANAGE_COMPONENT(props) {
    const { currentId, globals, swaMsg, translation, retrieveItem, translation_form, retrievePublish, worker } = props;
    var formData = new FormData();
    // ** CONSTS ** //
    const cont1 = { a: 'a' };

    // ** USE CONSTS ** //
    var [currentItem, setCurrentItem] = useState({});
    var [newAsign, setnewAsign] = useState(null);
    var [currentItemAsign, setCurrentItemAsign] = useState(null);
    var [viewform, setViewform] = useState(null);
    var [load, setLoad] = useState(false);
    var [users_list, SetUsers_list] = useState({})
    var [stateadd, setStateadd] = useState(0);
    var [stateadd2, setStateadd2] = useState(0);
    var [idCUBxVr, setIdCUBxVr] = useState(null);
    var [idCUBxVr2, setIdCUBxVr2] = useState(null);
    const editor = useRef(null)
    const [content, setContent] = useState('')
    //const [state, setState] = useState({ attachs: 0 })

    // SAME AS componentDidMount AND componentDidUpdate
    useEffect(() => {
        if (!load) loadData()
    }, [currentItem]);


    const config = (edit) => {
        return {
            readonly: false, // all options from https://xdsoft.net/jodit/doc/,
            uploader: {
                url: 'https://xdsoft.net/jodit/finder/?action=fileUpload'
            },
            filebrowser: {
                ajax: {
                    url: 'https://xdsoft.net/jodit/finder/'
                },
                height: 580,
            },
            language: 'es',
            "readonly": edit,
            "toolbar": !edit,
            "disablePlugins": "clipboard",
            "disablePlugins": "xpath",
            minHeight: edit ? 150 : 400,
            removeButtons: ['xpath'],
            controls: {
                lineHeight: {
                    list: ([0.5, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 2, 3, 3.5])
                }
            }
        }
    }

    // ** DATA GETTERS ** //
    // CALL THE API FUNCTIONS TO LOAD DATA
    function loadData() {
        PQRS_Service.get(currentId)
            .then(response => {
                setCurrentItem(response.data);
                loadVRs(response.data.id_global)
                setLoad(true);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
                setLoad(true)
            });
        USERS_Service.getAll()
            .then(response => {
                SetUsers_list(response.data);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
                setLoad(true)
            });
    }

    const loadVRs = async (id_global) => {
        const response = await cubXvrService.getByVR(id_global)
        const data = response.data.find(item => item.process === 'ENVIAR CONFIRMACION POR EMAIL')
        const data2 = response.data.find(item => item.process === 'RESPUESTA FORMAL DE LA PETICION')
        if (data) setIdCUBxVr(data.id)
        if (data2) setIdCUBxVr2(data2.id)
    }

    const refreshList = () => {
        props.refreshList()
    }
    const clearForm = () => {
        document.getElementById("app-formAsign").reset()
    }
    const addAttach = () => {
        setStateadd(stateadd + 1)
    }
    const minusAttach = () => {
        setStateadd(stateadd - 1)
    }

    const addAttach2 = () => {
        setStateadd2(stateadd2 + 1)
    }
    const minusAttach2 = () => {
        setStateadd2(stateadd2 - 1)
    }

    const funcion1 = (userId, workerId) => {
        if (workerId == userId) {
            return false;
        } else if (workerId != userId) {
            return true;
        }
    }
    var business_days = () => {
        var x = currentItem.pqrs_time ? currentItem.pqrs_time.time : null;
        return (Math.round((x / 2) - 1))

    }
    let _GET_USERS = () => {
        var _USERS = [];
        if (users_list.length) {
            _USERS = users_list;
        }
        return _USERS;
    }
    let _GET_WORKERS = () => {
        return currentItem.pqrs_workers;
    }

    let _GET_USERS_ARRAY = () => {
        let _users = _GET_USERS();
        let _array = [];
        for (var i = 0; i < _users.length; i++) {
            _array.push(_users[i].name + " " + _users[i].surname)
        }

        return _array;
    }
    let _SET_PROFESION = (_name) => {
        let _users = _GET_USERS();
        let _profesion = "";
        let _worker_id = 0;
        for (var i = 0; i < _users.length; i++) {
            if (_users[i].name + " " + _users[i].surname == _name) {
                _profesion = _users[i].role_name;
                _worker_id = _users[i].id;
                break;
            }
        }
        document.getElementById('pqrs_worker_3').value = _profesion
        document.getElementById('pqrs_worker_0').value = _worker_id
    }
    let _CHECK_FOR_REPEATED_WORKER = (_id) => {
        let _WORKERS = _GET_WORKERS();
        for (var i = 0; i < _WORKERS.length; i++) {
            if (_WORKERS[i].worker_id == _id) return true;
        }
        return false;
    }
    let _GET_DOC_BODY = () => {
        return `Me permite Comunicarle que el ${dateParser(moment(currentItem.pqrs_time.creation.split(" ")[0]).format('YYYY-MM-DD'))} 
        a las ${moment(currentItem.pqrs_time.creation, 'YYYY-MM-DD HH:mm').format('HH:mm')} se ha registrado con éxito su
        Solicitud con el numero ${currentItem.id_publico}. A partir de este momento la Curaduría Urbana Estudiará
        su peticion y en el termino de ${currentItem.pqrs_time.time} días hábiles le dará respuesta de manera clara, precisa y
        de fondo. No obstante de requerir un mayor término para lograr este cometido la Curaduría
        Urbana Uno de Bucaramanga le informará por este medio de esta situacion.`.replace(/[\n\r]+ */g, ' ');

    }


    let _WORKERS_COMPONENT = () => {
        let _array_workers_names = _GET_USERS_ARRAY();
        return <>
            <div className="row">
                <input type="hidden" id="pqrs_worker_0" defaultValue={_GET_USERS()[0].id} />
                <div className="col-4">
                    <label>Profesional</label>
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-user-circle"></i>
                        </span>
                        <select class="form-control" id="pqrs_worker_2" onChange={(e) => _SET_PROFESION(e.target.value)}>
                            {_array_workers_names.map(function (name) {
                                return <option>{name}</option>;
                            })}
                        </select>
                    </div>
                </div>
                <div className="col-4">
                    <label>Fecha Asignación</label>
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-calendar-alt"></i>
                        </span>
                        <input id="pqrs_worker_1" class="form-control" type="date" required />
                    </div>
                </div>
                <div className="col-4">
                    <label>Competencia</label>
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-briefcase"></i>
                        </span>
                        <input class="form-control" id="pqrs_worker_3" autoComplete="false" defaultValue={_GET_USERS()[0].role_name} />
                    </div>
                </div>
            </div>
        </>
    }

    let _ASIGN_COMPOENTN = () => {
        var _LIST = [];
        for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
            _LIST.push(currentItem.pqrs_workers[i])
        }
        const columns = [
            {
                name: <label><b>PROFESIONAL</b></label>,
                selector: 'name',
                minWidth: '180px',
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3 text-center">{row.name}</h6>
            },
            {
                name: <label><b>COMPETENCIA</b></label>,
                selector: row => row.competence,
                minWidth: '150px',
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3 text-center">{row.competence}</h6>
            },
            {
                name: <label><b>FECHA ASIGNACIÓN</b></label>,
                selector: 'asign',
                minWidth: '180px',
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3 text-center">{dateParser(row.asign)}</h6>
            },
            {
                name: <label><b>FECHA RESPUESTA</b></label>,
                selector: 'date_reply',
                minWidth: '180px',
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3 text-center">{dateParser(row.date_reply)}</h6>
            },
            {
                name: <label><b>FECHA LIMITE </b></label>,
                selector: 'date_reply',
                minWidth: '180px',
                sortable: true,
                filterable: true,
                cell: row => <h6 className="pt-3 text-center">{(dateParser(dateParser_finalDate(row.asign, business_days()))) ?? ''}</h6>
            },
            {
                name: <label><b>DIAS HABILES</b></label>,
                selector: '',
                minWidth: '150px',
                center: true,
                sortable: true,
                filterable: true,
                cell: row => <label>{business_days() ? business_days() : ''}</label>
            },
            {
                name: <label><b>¿NOTIFICO EMAIL?</b></label>,
                center: true,
                minWidth: '150px',
                cell: row => <h6 className="pt-3 text-center">{row.sent_email_notify ? "SI" : "NO"}</h6>
            },
            {
                name: <label><b>ACCIÓN</b></label>,
                button: true,
                minWidth: '150px',
                cell: row => <>
                    <MDBTooltip title='Desasignar Profesional' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                        <button className="btn btn-danger btn-sm mx-0 px-2 shadow-none" onClick={() => removeAsign(row.id)}>
                            <i class="fas fa-user-minus"></i></button>
                    </MDBTooltip>
                    <MDBTooltip title='Enviar Correo' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                        <button className="btn btn-warning btn-sm mx-0 px-2 shadow-none" onClick={() => setCurrentItemAsign(row)}>
                            <i class="far fa-paper-plane"></i></button>
                    </MDBTooltip>
                </>,
            },
        ]

        var _COMPONENT = <DataTable
            paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Página:', rangeSeparatorText: 'de' }}
            noDataComponent="No hay mensajes"
            striped="true"
            columns={columns}
            data={_LIST}
            highlightOnHover
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[20, 50, 100]}
            className="data-table-component"
            noHeader
        />
        return _COMPONENT;
    }


    function _SEEN_COMPOENTN() {
        var _LIST = [];
        for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
            _LIST.push(currentItem.pqrs_workers[i]);
        }
        const columns = [
            {
                name: <label><b>PROFESIONAL</b></label>,
                selector: 'name',
                sortable: true,
                filterable: true,
                cell: row => <h6 className="text-center">{row.name}</h6>
            },
            {
                name: <label><b>COMPETENCIA</b></label>,
                selector: row => row.competence,
                sortable: true,
                filterable: true,
                cell: row => <h6 className="text-center">{row.competence}</h6>
            },
            {
                name: <label><b>FECHA ASIGNACIÓN</b></label>,
                sortable: true,
                filterable: true,
                cell: row => <h6 className="text-center">{dateParser(row.asign)}</h6>
            },
            {
                name: <label><b>VISTO BUENO</b></label>,
                center: true,
                cell: row => <h6 className=" text-center">{row.feedback == 1 ? <label className="fw-bold text-success">SI</label> : row.feedback == 0 ? <label className="fw-bold text-danger">NO</label> : ''}</h6>
            },
            {
                name: <label><b>FECHA VISTO BUENO</b></label>,
                sortable: true,
                filterable: true,
                cell: row => <h6 className="text-center">{dateParser(row.feedback_date)}</h6>
            },
            {
                name: <label><b>ACCIÓN</b></label>,
                button: true,
                minWidth: '150px',
                cell: row => <>
                    <MDBTooltip title='Confirmar visto bueno' wrapperProps={{ center: true, color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                        <button hidden={window.user.id != row.worker_id} onClick={() => setViewform(row)} className="btn btn-info btn-sm mx-0 px-2 shadow-none">
                            <i class="fas fa-check-square"></i></button>
                    </MDBTooltip>
                </>,
            },
        ];

        function ExpandedComponent({ data }) {
            var Array = [...JSON.parse(data.history) ?? ''];
            return <>
                <fieldset className="p-3 border border-success mb-2">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr className='table-success'>
                                <th scope="col">Fecha y hora</th>
                                <th scope="col">Argumento</th>
                                <th scope="col">Visto bueno</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.map(function (value) {
                                return (
                                    <tr>
                                        <td><h6>{dateParser(value.date)} - {value.time}</h6></td>
                                        <td><h6>{value.feedback_argument}</h6></td>
                                        <td>{value.feedback == 1 ? <h6>Si</h6> : <h6>No</h6>}</td>
                                    </tr>
                                );
                            })}

                        </tbody>
                    </table>
                </fieldset>
            </>;
        }

        var _COMPONENT = <DataTable
            paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
            noDataComponent="No hay mensajes"
            striped="true"
            columns={columns}
            data={_LIST}
            expandableRows expandableRowsComponent={ExpandedComponent}
            highlightOnHover
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[20, 50, 100]}
            className="data-table-component"
            noHeader />;
        return _COMPONENT;
    }


    let _GEN_CONFIRM_PDF_COMPONENT = () => {
        return <>
            <div className="border border-success p-2">
                <label className="fw-bold text-success text-start">Documento de Confirmación</label>
                <div className="row">
                    <div className="col-6">
                        <label>Lista de Correos</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Lista de Correos" defaultValue={_getEmailList()} id="pqrs_confirmation_email_list" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>Lista de Solicitantes</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-user"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Lista de Solicitantes" defaultValue={_getSolicitorlList()} id="pqrs_confirmation_solicitor_list" />
                        </div>
                    </div>
                </div>
                <label>Cuerpo del Documento</label>
                <textarea class="form-control mb-3" rows="3" maxlength="1024" id="pqrs_confirmation_doc_body"
                    defaultValue={_GET_DOC_BODY()}></textarea>
                <table className="table table-sm table-hover table-bordered">
                    <tbody>
                        <tr>
                            <th><label className="app-p">Generar y descargar documento de confirmación.</label></th>
                            <td><MDBBtn className="btn btn-sm btn-danger" onClick={() => request_dpfConfirmation()}><i class="fas fa-cloud-download-alt fa-2x"></i></MDBBtn></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    }
    let _getEmailList = () => {
        var array_contact_list = [];
        for (var i = 0; i < currentItem.pqrs_contacts.length; i++) {
            array_contact_list.push(currentItem.pqrs_contacts[i].email)
        }
        return array_contact_list.join();
    }
    let _getSolicitorlList = () => {
        var array_list = [];
        for (var i = 0; i < currentItem.pqrs_solocitors.length; i++) {
            array_list.push(currentItem.pqrs_solocitors[i].name)
        }
        return array_list.join();
    }

    // FUNCTIONS & APIS
    let asignPQRS = (e) => {
        e.preventDefault();
        let worker_id = document.getElementById('pqrs_worker_0').value;

        if (!_CHECK_FOR_REPEATED_WORKER(worker_id)) {
            formData = new FormData();

            formData.set('pqrsMasterId', currentItem.id);
            formData.set('worker_id', worker_id);
            let name = document.getElementById('pqrs_worker_2').value;
            formData.set('name', name);
            let asign = document.getElementById('pqrs_worker_1').value;
            formData.set('asign', asign);
            let competence = document.getElementById('pqrs_worker_3').value;
            formData.set('competence', competence);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.createWorker(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        clearForm();
                        loadData(currentId)
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
        } else {
            MySwal.fire({
                title: "NO ES POSIBLE ASIGNAR",
                text: "Este profesional ya fue asignado a esta solicitud, los profesionales solo pueden ser asignador una vez por solicitud.",
                icon: 'error',
            });
        }
    };

    let removeAsign = (id) => {
        MySwal.fire({
            title: "REMOVER PROFESIONAL ",
            text: "¿Esta seguro de remover este profesional de la Peticion?",
            icon: 'warning',
            confirmButtonText: "REMOVER",
            cancelButtonText: "CANCELAR",
            showCancelButton: true
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                PQRS_Service.deleteWorker(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.generic_success_title,
                                text: swaMsg.generic_success_text,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            clearForm();
                            loadData(currentId)
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
            }
        })
    }


    let request_dpfConfirmation = () => {
        formData = new FormData();
        var array = [];
        for (var i = 0; i < currentItem.pqrs_contacts.length; i++) {
            array.push(currentItem.pqrs_contacts[i].address)
        }
        formData.set('addresses', array.join());
        let solicitors = document.getElementById("pqrs_confirmation_solicitor_list").value;
        formData.set('solicitors', solicitors);
        let emails = document.getElementById("pqrs_confirmation_email_list").value;
        formData.set('emails', emails);
        let body = document.getElementById("pqrs_confirmation_doc_body").value;
        formData.set('body', body);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        PQRS_Service.request_pdfConfirmation(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.close();
                    window.open(process.env.REACT_APP_API_URL + "/pdf/reply/" + "Oficio_" + currentItem.id_reply + ".pdf");
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


    let informalReplyPQRS = (u, worker_id) => {

        formData = new FormData();
        formData.set('id', worker_id);
        //console.log(worker_id)
        formData.set('id_master', currentId);
        let reply = document.getElementsByName("pqrs_informal_reply")[u].value;

        formData.set('reply', reply);
        // console.log([i], reply, worker_id)
        //console.log(reply)
        let date_reply = document.getElementById("pqrs_informal_time").value;
        formData.set('date_reply', date_reply);
        // GET DATA OF ATTACHS
        let files = document.getElementsByName("files_informal");
        console.log(stateadd)
        formData.set('attachs_length', stateadd);
        for (var i = 0; i < stateadd; i++) {
            console.log(files[i].files[0])
            formData.append('file', files[i].files[0], "pqrsout_" + files[i].files[0].name)
        }

        let array_form = [];
        let array_html = [];

        array_html = document.getElementsByName("files_informal_names");
        for (var i = 0; i < array_html.length; i++) {
            array_form.push(array_html[i].value)
        }
        formData.set('files_names', array_form);

        // Display the key/value pairs
        /*
        for (var pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }
        */
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        PQRS_Service.informalReply(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.generic_success_title,
                        text: swaMsg.generic_success_text,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    loadData(currentItem.id);
                    retrievePublish()
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

    let deteleAttach = (id) => {
        MySwal.fire({
            title: "ELIMINAR ÍTEM",
            text: "¿Esta seguro de eliminar este ítem de forma permanente?",
            icon: 'warning',
            confirmButtonText: "ELIMINAR",
            cancelButtonText: "CANCELAR",
            showCancelButton: true
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                PQRS_Service.deleteAttach(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.generic_success_title,
                                text: swaMsg.generic_success_text,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            retrieveItem(currentItem.id)
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
            }
        });
    }

    let _ATTACHS_COMPONENT = () => {
        var _COMPONENT = [];
        for (var i = 0; i < stateadd; i++) {
            _COMPONENT.push(<div className="row d-flex justify-content-center my-2">
                <div className="col-lg-8 col-md-8 ">
                    <label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTO ANEXO N° {i + 1}</label>
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                        <input type="file" class="form-control" name="files_informal" accept="application/pdf, image/png, image/jpeg" />
                    </div>
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                        <input type="text" class="form-control" name="files_informal_names" placeholder="Nombre documento (nombre o corta descripcion)" />
                    </div>
                </div>
            </div>)
        }

        return <div>{_COMPONENT}</div>;
    }
    let lockPQRS = (e) => {
        e.preventDefault();
        MySwal.fire({
            title: "CERRAR PETICION " + currentItem.id_publico,
            text: "¿Esta seguro de cerrar esta peticion?",
            icon: 'warning',
            confirmButtonText: "CERRAR",
            cancelButtonText: "CANCELAR",
            showCancelButton: true
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                formData = new FormData();
                formData.set('id_master', currentItem.id);
                formData.set('id_reply', currentItem.id_reply);
                formData.set('time_id', currentItem.pqrs_time.id);



                let files = document.getElementsByName("files_close");

                formData.set('attachs_length', stateadd2);
                for (var i = 0; i < stateadd2; i++) {
                    formData.append('file', files[i].files[0], "pqrsout_" + files[i].files[0].name)
                }
                let array_form = [];
                let array_html = [];
                array_html = document.getElementsByName("files_close_names");
                for (var i = 0; i < array_html.length; i++) {
                    array_form.push(array_html[i].value)
                }
                formData.set('files_names', array_form);

                PQRS_Service.close(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.generic_success_title,
                                text: swaMsg.generic_success_text,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            loadData(currentItem.id)
                            refreshList()
                            props.closeModal();
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
            }
        });
    };

    let _checkForOutputDocsClass2 = () => {
        for (var i = 0; i < currentItem.pqrs_attaches.length; i++) {
            if (currentItem.pqrs_attaches[i].class == 2) {
                return true;
            }
        }
        return false;
    }

    let _ATTACHSCLOSE_COMPONENT = () => {
        var _LIST = [];
        for (var i = 0; i < currentItem.pqrs_attaches.length; i++) {
            if (currentItem.pqrs_attaches[i].class == 2) {
                _LIST.push(currentItem.pqrs_attaches[i]);
            }
        }
        const columns = [
            {
                name: <h3>NOMBRE</h3>,
                selector: 'name',
                sortable: true,
                filterable: true,
                cell: row => <p className="pt-3 text-center">{row.public_name}</p>
            },
            {
                name: <h3>TIPO</h3>,
                selector: 'type',
                sortable: true,
                filterable: true,
                cell: row => <p className="pt-3">{row.type}</p>
            },
            {
                name: <h3>ACCIÓN</h3>,
                button: true,
                minWidth: '150px',
                cell: row => <>
                    <a className="btn btn-sm btn-danger mx-1" target="_blank" href={process.env.REACT_APP_API_URL + '/files/pqrs/' + row.name}><i class="fas fa-cloud-download-alt fa-2x"></i></a>
                    <MDBBtn className="btn btn-sm btn-danger" onClick={() => deteleAttach(row.id)}><i class="far fa-trash-alt fa-2x"></i></MDBBtn>
                </>,
            },
        ]
        var _COMPONENT = <DataTable
            paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
            noDataComponent="No hay mensajes"
            striped="true"
            columns={columns}
            data={_LIST}
            highlightOnHover
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[20, 50, 100]}
            className="data-table-component"
            noHeader
        />
        return <>{_COMPONENT}</>;
    }


    let _ATTACHS_COMPONENT2 = () => {
        var _COMPONENT = [];
        for (var i = 0; i < stateadd2; i++) {
            _COMPONENT.push(<div className="row d-flex justify-content-center my-2">
                <div className="col-lg-8 col-md-8 ">
                    <label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTO ANEXO N° {i + 1}</label>
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                        <input type="file" class="form-control" name="files_close" accept="image/png, image/jpeg application/pdf" />
                    </div>
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                        <input type="text" class="form-control" name="files_close_names" placeholder="Nombre documento (nombre o corta descripcion)" />
                    </div>
                </div>
            </div>)
        }

        return <div>{_COMPONENT}</div>;
    }



    // ** DATA CONVERTERS ** //
    // TRANSFORM AND PROCESS DATA
    function compareData() { }



    // ** JSX ELEMENTS ** //
    // SMALL OR SINGLE JSX ELEMENTS
    let jsx_e = () => {
        return <>
        </>
    }


    // ** JSX COMPONENTS ** //
    // BIG OR COMPOSED JSX ELEMENTS
    let jsx_c = () => {
        return <>
        </>
    }
    // ** APIS ** //
    // CALLS THE SERVICE FUNCTIONS
    let service = () => { }

    // ** DATA TABLE  ** //

    return (
        <PQRS_LAYOUT_WRAPPER
            currentItem={currentItem}
            translation={translation}
            swaMsg={swaMsg}
            globals={globals}
        >
            {currentItem != null ? <>
                {load ? <>


                    <fieldset className="p-3 border border-info mb-2">
                        <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>1.DOCUMENTOS SOPORTE INGRESO <i class="fas fa-folder"></i></b></h2>
                        <PQRS_EDIT_ATTACH
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={loadData}
                        />

                    </fieldset>



                    <fieldset className="p-3 border border-info mb-2">
                        <div>

                            <label className="px-4 app-p lead fw-normal text-uppercase"><b>2. CONFIRMAR A PETICIONARIO <i class="fas fa-check-circle"></i></b></label>
                            <br></br>
                            <br></br>
                            <h5 className="px-2"><b>GUÍA PARA ENVIAR LA CONFIRMACIÓN POR EMAIL</b></h5>
                            <ul>
                                <li className="app-p"><h5>Escriba el cuerpo del email.</h5></li>
                                <li className="app-p"><h5>Verifique los correos a los que se enviará el email, es posible añadir o quitar correos de la lista separandolos por coma (,)</h5></li>
                                <li className="app-p"><h5>Verifique emails y solicitantes con los que se generara el documento de confirmacion, es posible añadir o quitar elementos de la lista separandolos por coma (,)</h5></li>
                                <li className="app-p"><h5>Genere y anexe el documento de Confirmacion en la seccion de abajo y cualquier otro documeto que sea necesario.</h5></li>
                            </ul>
                            <hr></hr>
                            {/*<Collapsible className='bg-warning  border border-info text-center' openedClassName='bg-light text-center' trigger={<><label className="fw-normal text-dark text-center">DOCUMENTO DE CONFIRMACION</label></>}>
                                <div className='text-start'>
                                    <label className="fw-bold text-success text-start px-2">Documento de Confirmación</label>

                                    <PQRS_PDFGEN_CONFIRM
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                    />
                                </div>
                            </Collapsible>*/}
                        </div>
                        <Collapsible className='bg-warning  border border-info text-center' openedClassName='bg-light text-center' trigger={<><label className="fw-normal text-dark text-center">ENVIAR CONFIRMACION POR EMAIL</label></>}>
                            <div className="pb-2 text-start">
                                <PQRS_EMAILS
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    email_types={[0, 2, 4]}
                                    refreshCurrentItem={loadData}
                                    attachs={true}
                                />
                                <div className="row justify-content-center">
                                    <div className="col-4 mx-auto">
                                        <PQRS_ID_CONFIRM
                                        translation={translation} 
                                        swaMsg={swaMsg} 
                                        globals={globals}
                                        currentItem={currentItem}
                                        requestUpdate={loadData}
                                        idCUBxVr={idCUBxVr}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Collapsible>
                    </fieldset>

                    <fieldset className="p-3 border border-info mb-2">

                        <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>3. CONTACTO DE PETICIONARIO(S) PARA NOTIFICACIONES <i class="fas fa-info-circle"></i> </b></h2>

                        <PQRS_EDIT_SOLICITORS
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={loadData}
                        />
                        <br></br>
                        <hr></hr>
                        <h5 className=" px-4"><b>CONTACTO DE PETICIONARIO(S) <i class="fas fa-address-card"></i> </b> </h5>
                        <PQRS_EDIT_CONTACT
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={loadData}
                        />
                        <br></br>
                        <hr></hr>
                        <h5 className=" px-4"><b>LA PQRS ESTÁ RELACIONADA CON ALGUNA ACTUACIÓN Y/O SOLICITUD URBANÍSTICA <i class="fas fa-bookmark"></i></b></h5>
                        <PQRS_EDIT_FUN
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={loadData}
                        />
                        <hr></hr>
                        <h3 className='px-4'>HISTORIAL RELACIONADO</h3>
                        <HISTORY_PQRS_INFO
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={loadData}
                        />
                    </fieldset>

                    <fieldset className="p-3 border border-info mb-2">
                        <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>4. DESCRIPCIÓN DE LA SOLICITUD <i class="fas fa-prescription-bottle"></i></b></h2>
                        <Collapsible className='bg-warning  border border-info text-center' openedClassName='bg-light text-center' trigger={<><label className="fw-normal text-dark text-center">DESCRIPCIÓN</label></>}>
                            <div className="pb-2 text-start">
                                <PQRS_EDIT_INFO
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    translation_form={translation_form}
                                    currentItem={currentItem}
                                    refreshCurrentItem={loadData}
                                    refreshList={refreshList}
                                />
                            </div>
                        </Collapsible>

                    </fieldset>

                    <fieldset className="p-3 border border-info mb-2">
                        <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>5. CONTROL DE TIEMPOS <i class="fas fa-calendar-check"></i></b></h2>
                        <div className='px-4'>
                            <PQRS_COMPONENT_CLOCKS
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                            />
                        </div>
                    </fieldset>

                    <fieldset className="p-3 border border-info mb-2">
                        <form onSubmit={asignPQRS} id="app-formAsign">

                            <label className="px-4 app-p lead fw-normal text-uppercase"><b>6. ASIGNAR PROFESIONALES </b> <i class="fas fa-user-plus"></i></label>

                            <div class="form-check ms-5">
                                <input class="form-check-input" type="checkbox" onChange={(e) => setnewAsign(e.target.checked)} />
                                <label class="form-check-label" for="flexCheckDefault">
                                    Asignar Profesional
                                </label>
                            </div>
                            {newAsign
                                ? <>
                                    {_WORKERS_COMPONENT()}
                                    <div className="text-center py-4 mt-3">
                                        <button className="btn btn-lg btn-warning"><i class="fas fa-user-plus"></i> ASIGNAR </button>
                                    </div>
                                </> : ""}
                        </form>

                        <div className="my-2 px-3 text-uppercase bg-white" id="pqrs_info_1">
                            <label className="app-p lead text-start fw-normal text-uppercase">PROFESIONALES ASIGNADOS</label>
                        </div>
                        <div className="mb-2">
                            {_ASIGN_COMPOENTN()}
                            {/*<p>{console.log(currentItem.pqrs_time.time)}</p>*/}
                        </div>
                        {currentItemAsign
                            ? <>
                                <label class="text-center py-2 fw-bold">Enviar Correo a Profesional</label>
                                <PQRS_WORKERS_EMAILS
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    worker={currentItemAsign}
                                    email_types={[0, 1]}
                                    retrieveItem={loadData}
                                    closeComponent={() => setCurrentItemAsign(null)}
                                />
                            </> : ""}
                    </fieldset>




                    {/* DE LA VARIABLE currentItem.pqrs_workers, realizar un map por cada elemento del array, y geerar un formulario.
                      A cada formulario asociar el Jd del worker
                      Si el Id del worker coincide con el Id del winow.user.Id, hablitar ese form, de lo contrario, desabilitar el form
                    */}


                    <fieldset className="p-3 border border-info mb-2">

                        <label className="px-4 app-p lead fw-normal text-uppercase"><b>7. RESPUESTA DE LOS PROFESIONALES ASIGNADOS <i class="fas fa-comment-medical"></i> </b></label>

                        <h5 className="px-4">Instrucciones para dar respuesta a la solicitud: </h5>
                        <ul>
                            <li><h5>Escribir la respuesta en la caja de texto seguida de las instrucciones.</h5></li>
                            <li><h5>Incluir una breve descripción de la solicitud.</h5></li>
                            <li><h5>Argumentar la respuesta, citando fuentes.</h5></li>
                        </ul>

                        <h5 className=" px-4"><b>DOCUMENTOS ANEXADOS POR PROFESIONAL(ES)</b></h5>
                        <PQRS_COMPONENT_ATTACH_PROFESIONAL
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                        />

                        {currentItem.pqrs_workers.map((value, i) => {
                            var edit = funcion1(window.user.id, value.worker_id)
                            //console.log(value.id)
                            //console.log(window.user.id)
                            const funcion2 = () => {
                                if (funcion1(window.user.id, value.worker_id) == false) {
                                    return i;

                                }
                            }

                            return <>

                                <label className="px-4 app-p lead fw-normal text-uppercase"><i class="fas fa-arrow-right"></i> {+i} {value.name}</label>
                                <div className="text-center m-3">
                                    <JoditEditor
                                        ref={editor}
                                        value={value.reply}
                                        key={funcion2()}
                                        config={config(edit)}
                                        name="pqrs_informal_reply"
                                        tabIndex={1} // tabIndex of textarea
                                        onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                                        onChange={newContent => { }}
                                        class="form-control mb-3"
                                        rows="5"
                                        maxlength="409675"

                                    />

                                </div>
                                {!funcion1(window.user.id, value.worker_id) ?
                                    <>
                                        <hr className="my-3" />
                                        <label className="app-p lead text-start fw-bold text-uppercase">ANEXAR DOCUMENTO</label>
                                        <div className="text-end m-3" >
                                            {stateadd > 0
                                                ? <MDBBtn className="btn btn-sm btn-secondary mx-3" onClick={() => minusAttach()}><i class="fas fa-minus-circle"></i> REMOVER ULTIMO </MDBBtn>
                                                : ""}
                                            <MDBBtn className="btn btn-sm btn-secondary" onClick={() => addAttach()}><i class="fas fa-plus-circle"></i> AÑADIR OTRO </MDBBtn>
                                        </div>
                                        {_ATTACHS_COMPONENT()}

                                        <hr className="my-3" />
                                        <div className="row" hidden={funcion1(window.user.id, value.worker_id)}>

                                            <div className="col-lg-6 col-md-6">
                                                <input type="text" class="form-control" placeholder="  ESTA RESPUESTA A LA SOLICITUD SE DA PARA LA FECHA:" disabled />
                                                <div class="input-group mb-3">
                                                    <span class="input-group-text bg-info text-white">
                                                        <i class="far fa-calendar-alt"></i>
                                                    </span>
                                                    <input type="date" max="2100-01-01" class="form-control" id="pqrs_informal_time" defaultValue={value.date_reply ?? moment().format('YYYY-MM-DD')} required />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center py-4 mt-3">
                                            <button className="btn btn-sm btn-success" onClick={() => informalReplyPQRS(i, value.id)}><i class="fas fa-reply"></i> RESPONDER </button>

                                        </div>
                                        <hr></hr>
                                    </> : ''}

                            </>
                        })}
                    </fieldset>
                    <fieldset className="p-3 border border-info mb-2">
                        <label className="px-4 app-p lead fw-normal text-uppercase"><b>8. RESPUESTA FORMAL DE LA PETICION <i class="fas fa-envelope-open-text"></i></b></label>
                        <Collapsible className='bg-warning  border border-info text-center' openedClassName='bg-light text-center' trigger={<><label className="fw-normal text-dark text-center">RESPONDER PETICION</label></>}>
                            <div className='text-start'>
                                <PQRS_SET_REPLY1
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    retrieveItem={loadData}
                                    refreshList={refreshList}
                                    hardReset
                                    requestUpdate={loadData}
                                    idCUBxVr={idCUBxVr2}
                                />
                            </div>
                        </Collapsible>

                        <Collapsible className='bg-warning  border border-info text-center' openedClassName='bg-light text-center' trigger={<><label className="fw-normal text-dark text-center">VISTO BUENO</label></>}>
                            <div className='text-start'>
                                {_SEEN_COMPOENTN()}

                                {viewform
                                    ? <>
                                        <label class="text-center py-2 fw-bold">CONFIRMACION VISTO BUENO</label>
                                        <SEEN_COMPONENT_FORM
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            worker={viewform}
                                            retrieveItem={loadData}
                                            retrievePublish={retrievePublish}
                                            closeComponent={() => setViewform(null)}
                                        />
                                    </> : ""}
                            </div>
                        </Collapsible>

                        <Collapsible className='bg-warning  border border-info text-center' openedClassName='bg-light border border-info text-center' trigger={<><label className="fw-normal text-dark text-center">ENVIAR RESPUESTA POR EMAIL</label></>}>
                            <div className='text-start'>
                                <PQRS_EMAILS
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    email_types={[3]}
                                    refreshCurrentItem={loadData}
                                    attachs={true}
                                />
                                <div className="col-6">
                                    <PQRS_SEND_DATE
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                    />
                                </div>
                            </div>
                        </Collapsible>
                    </fieldset>
                    <fieldset className="p-3 border border-info mb-2">
                        <form onSubmit={lockPQRS} id="app-formReply">
                            <label className="px-4 app-p lead fw-normal text-uppercase"><b>9. CERRAR PETICIÓN <i class="fab fa-expeditedssl"></i></b></label><br></br>
                            <label className="px-4"><h5><p>GUIÁ PARA EL CIERRE DE LA PETICIÓN</p></h5></label>
                            <ul>
                                <li className="app-p"><h5>Asegurar envío con copia del email o guiá de envío de recibido por parte del peticionario, digitalizar y anexar.</h5></li>
                                <li className="app-p"><h5>Digitalizar Copias de los correos y anexos enviados al documento de respuesta.</h5></li>
                            </ul>
                            {_checkForOutputDocsClass2()
                                ? <table className="table table-sm table-hover table-bordered">
                                    <tbody>
                                        <tr className="bg-warning">
                                            <th><label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTOS DE CIERRE ANEXADOS</label></th>
                                        </tr>
                                        {_ATTACHSCLOSE_COMPONENT()}
                                    </tbody>
                                </table>
                                : <div className="text-start"><label className="app-p fw-bold text-uppercase text-danger">NO SE ENCONTRARON DOCUMENTOS ANEXOS DE CIERRE PARA ESA SOLICITUD</label></div>}

                            <p className="app-p lead text-end fw-bold text-uppercase">ANEXAR DOCUMENTO DE CIERRE</p>
                            <div className="text-end m-3">
                                {stateadd2 > 0
                                    ? <MDBBtn className="btn btn-sm btn-secondary mx-3" onClick={() => minusAttach2()}><i class="fas fa-minus-circle"></i> REMOVER ULTIMO </MDBBtn>
                                    : ""}
                                <MDBBtn className="btn btn-sm btn-secondary" onClick={() => addAttach2()}><i class="fas fa-plus-circle"></i> AÑADIR </MDBBtn>
                            </div>
                            {_ATTACHS_COMPONENT2()}

                            <hr />
                            <div className="text-center m-3">
                                <button className="btn btn-sm btn-success" ><i class="fas fa-lock"></i> CERRAR PETICIÓN</button>
                            </div>

                        </form>
                    </fieldset>

                </>
                    : <fieldset className="p-3" id="fung_0">
                        <div className="text-center"> <h3 className="fw-bold text-danger">NO HA SIDO POSIBLE CARGAR LA INFORMACIÓN, INTENTELO NUEVAMENTE</h3></div>
                    </fieldset>}
            </> : <fieldset className="p-3" id="fung_0">
                <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
            </fieldset>
            }
            {/* Original navigation kept for functionality - visually hidden by new sidebar */}
            {currentItem && (
                <div style={{ display: 'none' }}>
                    <PQRS_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        FROM={currentItem.status == 0 ? "manage" : "editable"}
                        NAVIGATION={props.NAVIGATION}
                    />
                </div>
            )}
        </PQRS_LAYOUT_WRAPPER>
    )
}