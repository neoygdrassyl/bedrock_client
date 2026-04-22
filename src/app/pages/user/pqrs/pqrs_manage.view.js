import { useState, useEffect, useRef } from 'react';
import DataTable from '@/components/data-table-bridge';
import PQRS_Service from '../../../services/pqrs_main.service';
import USERS_Service from '../../../services/users.service'

import { dateParser, dateParser_finalDate } from '../../../components/customClasses/typeParse'
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component';
import PQRS_EMAILS from './components/pqrs_emails.component';
import PQRS_WORKERS_EMAILS from './components/pqrs_workersEmails.component';
import PQRS_COMPONENT_ATTACH_PROFESIONAL from './components/pqrs_attach_pro.component';
import Collapsible from '../../../components/Collapsible';
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

import dayjs from 'dayjs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { swalClose, swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

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
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
                setLoad(true)
            });
        USERS_Service.getAll()
            .then(response => {
                SetUsers_list(response.data);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
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
        return `Me permite Comunicarle que el ${dateParser(dayjs(currentItem.pqrs_time.creation.split(" ")[0]).format('YYYY-MM-DD'))} 
        a las ${dayjs(currentItem.pqrs_time.creation, 'YYYY-MM-DD HH:mm').format('HH:mm')} se ha registrado con éxito su
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
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="user-circle" size={16} />
                        </span>
                        <select className="form-control" id="pqrs_worker_2" onChange={(e) => _SET_PROFESION(e.target.value)}>
                            {_array_workers_names.map(function (name) {
                                return <option>{name}</option>;
                            })}
                        </select>
                    </div>
                </div>
                <div className="col-4">
                    <label>Fecha Asignación</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="calendar-alt" size={16} />
                        </span>
                        <input id="pqrs_worker_1" className="form-control" type="date" required />
                    </div>
                </div>
                <div className="col-4">
                    <label>Competencia</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="briefcase" size={16} />
                        </span>
                        <input className="form-control" id="pqrs_worker_3" autoComplete="false" defaultValue={_GET_USERS()[0].role_name} />
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
                name: 'PROFESIONAL',
                selector: row => row.name,
                minWidth: '180px',
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm">{row.name}</span>
            },
            {
                name: 'COMPETENCIA',
                selector: row => row.competence,
                minWidth: '150px',
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm">{row.competence}</span>
            },
            {
                name: 'FECHA ASIGNACIÓN',
                selector: row => row.asign,
                minWidth: '180px',
                sortable: true,
                filterable: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{dateParser(row.asign)}</span>
            },
            {
                name: 'FECHA RESPUESTA',
                selector: row => row.date_reply,
                minWidth: '180px',
                sortable: true,
                filterable: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{dateParser(row.date_reply)}</span>
            },
            {
                name: 'FECHA LÍMITE',
                selector: row => row.date_reply,
                minWidth: '180px',
                sortable: true,
                filterable: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{(dateParser(dateParser_finalDate(row.asign, business_days()))) ?? ''}</span>
            },
            {
                name: 'DÍAS HÁBILES',
                minWidth: '150px',
                center: true,
                sortable: true,
                filterable: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{business_days() ? business_days() : ''}</span>
            },
            {
                name: '¿NOTIFICÓ EMAIL?',
                center: true,
                minWidth: '150px',
                cell: row => row.sent_email_notify ? <Badge className="text-[10px] bg-accent text-accent-foreground">Sí</Badge> : <Badge variant="secondary" className="text-[10px]">No</Badge>
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '150px',
                cell: row => <>
                    <Button variant="destructive" size="sm" className="mx-0 px-2" title="Desasignar Profesional" onClick={() => removeAsign(row.id)}>
                            <Icon name="user-minus" size={16} /></Button>
                    <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 mx-0 px-2" title="Enviar Correo" onClick={() => setCurrentItemAsign(row)}>
                            <Icon name="paper-plane" size={16} /></Button>
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
                name: 'PROFESIONAL',
                selector: row => row.name,
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm">{row.name}</span>
            },
            {
                name: 'COMPETENCIA',
                selector: row => row.competence,
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm">{row.competence}</span>
            },
            {
                name: 'FECHA ASIGNACIÓN',
                sortable: true,
                filterable: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{dateParser(row.asign)}</span>
            },
            {
                name: 'VISTO BUENO',
                center: true,
                cell: row => row.feedback == 1 ? <Badge className="text-[10px] bg-accent text-accent-foreground">Sí</Badge> : row.feedback == 0 ? <Badge variant="destructive" className="text-[10px]">No</Badge> : ''
            },
            {
                name: 'FECHA VISTO BUENO',
                sortable: true,
                filterable: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{dateParser(row.feedback_date)}</span>
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '150px',
                cell: row => <>
                    <Button size="sm" title="Confirmar visto bueno" hidden={window.user.id != row.worker_id} onClick={() => setViewform(row)}>
                            <Icon name="check-square" size={16} /></Button>
                </>,
            },
        ];

        function ExpandedComponent({ data }) {
            var Array = [...JSON.parse(data.history) ?? ''];
            return <>
                <fieldset className="p-3 border border-success mb-2">
                    <table className="table table-sm table-hover">
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="envelope" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Lista de Correos" defaultValue={_getEmailList()} id="pqrs_confirmation_email_list" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>Lista de Solicitantes</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Lista de Solicitantes" defaultValue={_getSolicitorlList()} id="pqrs_confirmation_solicitor_list" />
                        </div>
                    </div>
                </div>
                <label>Cuerpo del Documento</label>
                <textarea className="form-control mb-3" rows="3" maxlength="1024" id="pqrs_confirmation_doc_body"
                    defaultValue={_GET_DOC_BODY()}></textarea>
                <table className="table table-sm table-hover table-bordered">
                    <tbody>
                        <tr>
                            <th><label className="app-p">Generar y descargar documento de confirmación.</label></th>
                            <td><Button variant="destructive" size="sm" onClick={() => request_dpfConfirmation()}><Icon name="cloud-download-alt" size={16} /></Button></td>
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.createWorker(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                        clearForm();
                        loadData(currentId)
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        } else {
            swalError({ title: "NO ES POSIBLE ASIGNAR", text: "Este profesional ya fue asignado a esta solicitud, los profesionales solo pueden ser asignador una vez por solicitud." });
        }
    };

    let removeAsign = (id) => {
        swalConfirm({ title: "REMOVER PROFESIONAL ", text: "¿Esta seguro de remover este profesional de la Peticion?", icon: 'warning', confirmButtonText: "REMOVER" }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                PQRS_Service.deleteWorker(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            clearForm();
                            loadData(currentId)
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        PQRS_Service.request_pdfConfirmation(formData)
            .then(response => {
                if (response.data === 'OK') {
                    swalClose();
                    window.open(import.meta.env.VITE_API_URL + "/pdf/reply/" + "Oficio_" + currentItem.id_reply + ".pdf");
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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
        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        PQRS_Service.informalReply(formData)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                    loadData(currentItem.id);
                    retrievePublish()
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
            });
    };

    let deteleAttach = (id) => {
        swalConfirm({ title: "ELIMINAR ÍTEM", text: "¿Esta seguro de eliminar este ítem de forma permanente?", icon: 'warning', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                PQRS_Service.deleteAttach(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            retrieveItem(currentItem.id)
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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
                    <label className="app-p lead text-start fw-normal">DOCUMENTO ANEXO N° {i + 1}</label>
                    <div className="input-group">
                        <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                        <input type="file" className="form-control" name="files_informal" accept="application/pdf, image/png, image/jpeg" />
                    </div>
                    <div className="input-group">
                        <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                        <input type="text" className="form-control" name="files_informal_names" placeholder="Nombre documento (nombre o corta descripcion)" />
                    </div>
                </div>
            </div>)
        }

        return <div>{_COMPONENT}</div>;
    }
    let lockPQRS = (e) => {
        e.preventDefault();
        swalConfirm({ title: "CERRAR PETICION ", text: "¿Esta seguro de cerrar esta peticion?", icon: 'warning', confirmButtonText: "CERRAR" }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
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
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            loadData(currentItem.id)
                            refreshList()
                            props.closeModal();
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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
                name: 'NOMBRE',
                selector: row => row.name,
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm">{row.public_name}</span>
            },
            {
                name: 'TIPO',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm">{row.type}</span>
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '150px',
                cell: row => <>
                    <a className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-7 px-2 mx-1" target="_blank" href={import.meta.env.VITE_API_URL + '/files/pqrs/' + row.name}><Icon name="cloud-download-alt" size={16} /></a>
                    <Button variant="destructive" size="sm" onClick={() => deteleAttach(row.id)}><Icon name="trash-alt" size={16} /></Button>
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
                    <label className="app-p lead text-start fw-normal">DOCUMENTO ANEXO N° {i + 1}</label>
                    <div className="input-group">
                        <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                        <input type="file" className="form-control" name="files_close" accept="image/png, image/jpeg application/pdf" />
                    </div>
                    <div className="input-group">
                        <span className="input-group-text bg-primary text-primary-foreground" id="name"><Icon name="paperclip" size={16} /></span>
                        <input type="text" className="form-control" name="files_close_names" placeholder="Nombre documento (nombre o corta descripcion)" />
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
        <div>

            {currentItem != null ? <>
                {load ? <>

                    <fieldset className="p-3 border border-info mb-2">
                        <h2 className=" px-4 app-p lead fw-normal"><b>1.DOCUMENTOS SOPORTE INGRESO <Icon name="folder" size={16} /></b></h2>
                        <PQRS_EDIT_ATTACH
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={loadData}
                        />

                    </fieldset>

                    <fieldset className="p-3 border border-info mb-2">
                        <div>

                            <label className="px-4 app-p lead fw-normal"><b>2. CONFIRMAR A PETICIONARIO <Icon name="check-circle" size={16} /></b></label>
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

                        <h2 className=" px-4 app-p lead fw-normal"><b>3. CONTACTO DE PETICIONARIO(S) PARA NOTIFICACIONES <Icon name="info-circle" size={16} /> </b></h2>

                        <PQRS_EDIT_SOLICITORS
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={loadData}
                        />
                        <br></br>
                        <hr></hr>
                        <h5 className=" px-4"><b>CONTACTO DE PETICIONARIO(S) <Icon name="address-card" size={16} /> </b> </h5>
                        <PQRS_EDIT_CONTACT
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={loadData}
                        />
                        <br></br>
                        <hr></hr>
                        <h5 className=" px-4"><b>LA PQRS ESTÁ RELACIONADA CON ALGUNA ACTUACIÓN Y/O SOLICITUD URBANÍSTICA <Icon name="bookmark" size={16} /></b></h5>
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
                        <h2 className=" px-4 app-p lead fw-normal"><b>4. DESCRIPCIÓN DE LA SOLICITUD <Icon name="prescription-bottle" size={16} /></b></h2>
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
                        <h2 className=" px-4 app-p lead fw-normal"><b>5. CONTROL DE TIEMPOS <Icon name="calendar-check" size={16} /></b></h2>
                        <div className='px-4'>
                            <PQRS_COMPONENT_CLOCKS
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                            />
                        </div>
                    </fieldset>

                    <fieldset className="p-3 border border-info mb-2">
                        <form onSubmit={asignPQRS} id="app-formAsign">

                            <label className="px-4 app-p lead fw-normal"><b>6. ASIGNAR PROFESIONALES </b> <Icon name="user-plus" size={16} /></label>

                            <div className="form-check ms-5">
                                <input className="form-check-input" type="checkbox" onChange={(e) => setnewAsign(e.target.checked)} />
                                <label className="form-check-label" htmlFor="flexCheckDefault">
                                    Asignar Profesional
                                </label>
                            </div>
                            {newAsign
                                ? <>
                                    {_WORKERS_COMPONENT()}
                                    <div className="text-center py-4 mt-3">
                                        <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90"><Icon name="user-plus" size={14} /> Asignar</Button>
                                    </div>
                                </> : ""}
                        </form>

                        <div className="my-2 px-3 bg-body-secondary" id="pqrs_info_1">
                            <label className="app-p lead text-start fw-normal">PROFESIONALES ASIGNADOS</label>
                        </div>
                        <div className="mb-2">
                            {_ASIGN_COMPOENTN()}
                            {/*<p>{console.log(currentItem.pqrs_time.time)}</p>*/}
                        </div>
                        {currentItemAsign
                            ? <>
                                <label className="text-center py-2 fw-bold">Enviar Correo a Profesional</label>
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

                        <label className="px-4 app-p lead fw-normal"><b>7. RESPUESTA DE LOS PROFESIONALES ASIGNADOS <Icon name="comment-medical" size={16} /> </b></label>

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

                                <label className="px-4 app-p lead fw-normal"><Icon name="arrow-right" size={16} /> {+i} {value.name}</label>
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
                                        className="form-control mb-3"
                                        rows="5"
                                        maxlength="409675"

                                    />

                                </div>
                                {!funcion1(window.user.id, value.worker_id) ?
                                    <>
                                        <hr className="my-3" />
                                        <label className="app-p lead text-start fw-bold">ANEXAR DOCUMENTO</label>
                                        <div className="text-end m-3" >
                                            {stateadd > 0
                                                ? <Button variant="outline" size="sm" className="mx-3" onClick={() => minusAttach()}><Icon name="minus-circle" size={16} /> REMOVER ULTIMO </Button>
                                                : ""}
                                            <Button variant="outline" size="sm" onClick={() => addAttach()}><Icon name="plus-circle" size={16} /> AÑADIR OTRO </Button>
                                        </div>
                                        {_ATTACHS_COMPONENT()}

                                        <hr className="my-3" />
                                        <div className="row" hidden={funcion1(window.user.id, value.worker_id)}>

                                            <div className="col-lg-6 col-md-6">
                                                <input type="text" className="form-control" placeholder="  ESTA RESPUESTA A LA SOLICITUD SE DA PARA LA FECHA:" disabled />
                                                <div className="input-group mb-3">
                                                    <span className="input-group-text bg-primary text-primary-foreground">
                                                        <Icon name="calendar-alt" size={16} />
                                                    </span>
                                                    <input type="date" max="2100-01-01" className="form-control" id="pqrs_informal_time" defaultValue={value.date_reply ?? dayjs().format('YYYY-MM-DD')} required />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center py-4 mt-3">
                                            <Button size="sm" onClick={() => informalReplyPQRS(i, value.id)}><Icon name="reply" size={16} /> RESPONDER </Button>

                                        </div>
                                        <hr></hr>
                                    </> : ''}

                            </>
                        })}
                    </fieldset>
                    <fieldset className="p-3 border border-info mb-2">
                        <label className="px-4 app-p lead fw-normal"><b>8. RESPUESTA FORMAL DE LA PETICION <Icon name="envelope-open-text" size={16} /></b></label>
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
                                        <label className="text-center py-2 fw-bold">CONFIRMACION VISTO BUENO</label>
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
                            <label className="px-4 app-p lead fw-normal"><b>9. CERRAR PETICIÓN <Icon name="expeditedssl" size={16} /></b></label><br></br>
                            <label className="px-4"><span className="h5">GUIÁ PARA EL CIERRE DE LA PETICIÓN</span></label>
                            <ul>
                                <li className="app-p"><strong>Asegurar envío con copia del email o guiá de envío de recibido por parte del peticionario, digitalizar y anexar.</strong></li>
                                <li className="app-p"><strong>Digitalizar Copias de los correos y anexos enviados al documento de respuesta.</strong></li>
                            </ul>
                            {_checkForOutputDocsClass2()
                                ? <table className="table table-sm table-hover table-bordered">
                                    <tbody>
                                        <tr className="bg-warning">
                                            <th><label className="app-p lead text-start fw-normal">DOCUMENTOS DE CIERRE ANEXADOS</label></th>
                                        </tr>
                                        {_ATTACHSCLOSE_COMPONENT()}
                                    </tbody>
                                </table>
                                : <div className="text-start"><label className="app-p fw-bold text-danger">NO SE ENCONTRARON DOCUMENTOS ANEXOS DE CIERRE PARA ESA SOLICITUD</label></div>}

                            <p className="app-p lead text-end fw-bold">ANEXAR DOCUMENTO DE CIERRE</p>
                            <div className="text-end m-3">
                                {stateadd2 > 0
                                    ? <Button variant="outline" size="sm" className="mx-3" onClick={() => minusAttach2()}><Icon name="minus-circle" size={16} /> REMOVER ULTIMO </Button>
                                    : ""}
                                <Button variant="outline" size="sm" onClick={() => addAttach2()}><Icon name="plus-circle" size={16} /> AÑADIR </Button>
                            </div>
                            {_ATTACHS_COMPONENT2()}

                            <hr />
                            <div className="text-center m-3">
                                <Button size="sm"><Icon name="lock" size={16} /> CERRAR PETICIÓN</Button>
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
            <PQRS_MODULE_NAV
                translation={translation}
                currentItem={currentItem}
                FROM={currentItem.status == 0 ? "manage" : "editable"}
                NAVIGATION={props.NAVIGATION}
            />
        </div >
    )
}