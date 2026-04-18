import { useState, useEffect } from 'react';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../services/pqrs_main.service';
import USERS_Service from '../../../services/users.service'
import DataTable from 'react-data-table-component';
import { dateParser } from '../../../components/customClasses/typeParse'
import PQRS_COMPONENT_SOLICITORS from './components/pqrs_solicitors.component';
import PQRS_COMPONENT_CONTACTS from './components/pqrs_contancts.component';
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component';
import PQRS_EMAILS from './components/pqrs_emails.component';
import PQRS_PDFGEN_CONFIRM from './components/pqrs_genPDF_confirm.component';
import PQRS_WORKERS_EMAILS from './components/pqrs_workersEmails.component';

import dayjs from 'dayjs';
const MySwal = withReactContent(Swal);

function PQRSASIGN({ translation, swaMsg, globals, translation_form, currentId, refreshList: refreshListProp, NAVIGATION }) {
    const [currentItem, setCurrentItem] = useState(null);
    const [load, setLoad] = useState(false);
    const [users_list, setUsersList] = useState([]);
    const [asign, setAsign] = useState(false);
    const [worker, setWorker] = useState(false);

    useEffect(() => {
        retrieveItem(currentId);
    }, []);

    const retrieveItem = (id) => {
        PQRS_Service.get(id)
            .then(response => {
                setCurrentItem(response.data);
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
                setLoad(false);
            });
        USERS_Service.getAll()
            .then(response => {
                setUsersList(response.data);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
                setLoad(false);
            });
    };

    const refreshList = () => {
        refreshListProp();
    };

    const clearForm = () => {
        document.getElementById("app-formAsign").reset()
    };
        var formData = new FormData();

        // DATA GETTERS 
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

        // DATA CONVERTERS
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
            return `Me permito comunicarle que el ${dateParser(dayjs(currentItem.pqrs_time.creation.split(" ")[0]).format('YYYY-MM-DD'))} 
            a las ${dayjs(currentItem.pqrs_time.creation, 'YYYY-MM-DD HH:mm').format('HH:mm')} se ha registrado con éxito su
            solicitud con el número ${currentItem.id_publico}. A partir de este momento, la Curaduría Urbana Estudiará
            su peticion y en el termino de ${currentItem.pqrs_time.time} días hábiles le dará respuesta de manera clara, precisa y
            de fondo. No obstante de requerir un mayor término para lograr este cometido la Curaduría
            Urbana Uno de Bucaramanga le informará por este medio de esta situacion.`.replace(/[\n\r]+ */g, ' ');

        }

        // COMPONENT JSX
        let _WORKERS_COMPONENT = () => {
            let _array_workers_names = _GET_USERS_ARRAY();
            return <>
                <div className="row">
                    <input type="hidden" id="pqrs_worker_0" defaultValue={_GET_USERS()[0].id} />
                    <div className="col-4">
                        <label>Profesional</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <i className="far fa-user-circle"></i>
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
                            <span className="input-group-text bg-info text-white">
                                <i className="far fa-calendar-alt"></i>
                            </span>
                            <input id="pqrs_worker_1" className="form-control" type="date" required />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Competencia</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <i className="fas fa-briefcase"></i>
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
                    name: <label>PROFESIONAL</label>,
                    selector: row => row.name,
                    sortable: true,
                    filterable: true,
                    cell: row => <p className="pt-3 text-center">{row.name}</p>
                },
                {
                    name: <label>COMPETENCIA</label>,
                    selector: row => row.competence,
                    sortable: true,
                    filterable: true,
                    cell: row => <p className="pt-3 text-center">{row.competence}</p>
                },
                {
                    name: <label>FECHA ASIGNACIÓN</label>,
                    selector: row => row.asign,
                    sortable: true,
                    filterable: true,
                    cell: row => <p className="pt-3 text-center">{dateParser(row.asign)}</p>
                },
                {
                    name: <label>¿NOTIFICO EMAIL?</label>,
                    cell: row => <p className="pt-3 text-center">{row.sent_email_notify ? "SI" : "NO"}</p>
                },
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <button title="Desasignar Profesional" className="btn btn-danger btn-sm mx-0 px-2 shadow-none" onClick={() => removeAsign(row.id)}>
                                <i className="fas fa-user-minus fa-2x"></i></button>
                        <button title="Enviar Correo" className="btn btn-warning btn-sm mx-0 px-2 shadow-none" onClick={() => setWorker(row)}>
                                <i className="far fa-paper-plane fa-2x"></i></button>
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
        let _GEN_CONFIRM_PDF_COMPONENT = () => {
            return <>
                <div className="border border-success p-2">
                    <label className="fw-bold text-success text-start">Documento de Confirmación</label>
                    <div className="row">
                        <div className="col-6">
                            <label>Lista de Correos</label>
                            <div className="input-group my-1">
                                <span className="input-group-text bg-info text-white">
                                    <i className="far fa-envelope"></i>
                                </span>
                                <input type="text" className="form-control" placeholder="Lista de Correos" defaultValue={_getEmailList()} id="pqrs_confirmation_email_list" />
                            </div>
                        </div>
                        <div className="col-6">
                            <label>Lista de Solicitantes</label>
                            <div className="input-group my-1">
                                <span className="input-group-text bg-info text-white">
                                    <i className="far fa-user"></i>
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
                                <td><button type="button" className="btn btn-sm btn-danger" onClick={() => request_dpfConfirmation()}><i className="fas fa-cloud-download-alt fa-2x"></i></button></td>
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
                text: "¿Está seguro de remover este profesional de la Peticion?",
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
                        window.open(import.meta.env.VITE_API_URL + "/pdf/reply/" + "Oficio_" + currentItem.id_reply + ".pdf");
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
                {currentItem != null ? <>
                    {load ? <>
                        <fieldset className="p-3">
                            <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                <label className="app-p lead fw-normal text-uppercase">INFORMACIÓN DE SOLICITANTE(S)</label>
                            </legend>
                            <PQRS_COMPONENT_SOLICITORS
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                            />
                        </fieldset>

                        <fieldset className="p-3">
                            <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                <label className="app-p lead fw-normal text-uppercase">INFORMACION DE SOLICITANTE(S)</label>
                            </legend>
                            <PQRS_COMPONENT_CONTACTS
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                            />
                        </fieldset>

                        <fieldset className="p-3">
                            <form onSubmit={asignPQRS} id="app-formAsign">
                                <h2 className="text-uppercase text-center pb-2">ASIGNAR PROFESIONALES</h2>
                                <div className="form-check ms-5">
                                    <input className="form-check-input" type="checkbox" onChange={(e) => setAsign(e.target.checked)} />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                        Asignar Profesional
                                    </label>
                                </div>
                                {asign
                                    ? <>
                                        {_WORKERS_COMPONENT()}
                                        <div className="text-center py-4 mt-3">
                                            <button className="btn btn-lg btn-warning"><i className="fas fa-user-plus"></i> ASIGNAR </button>
                                        </div>
                                    </> : ""}
                            </form>

                            <legend className="my-2 px-3 text-uppercase bg-warning" id="pqrs_info_1">
                                <label className="app-p lead text-start fw-normal text-uppercase">PROFESIONALES ASIGNADOS</label>
                            </legend>
                            <div className="mb-2">
                                {_ASIGN_COMPOENTN()}
                            </div>
                            {worker
                                ? <>
                                    <label className="text-center py-2 fw-bold">Enviar Correo a Profesional</label>
                                    <PQRS_WORKERS_EMAILS
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        worker={worker}
                                        email_types={[0, 1]}
                                        retrieveItem={retrieveItem}
                                        closeComponent={() => setWorker(false)}
                                    />
                                </> : ""}

                        </fieldset>

                        <h2 className="text-uppercase text-center pb-2">CONFIRMAR A PETICIONRIO</h2>
                        <p className="app-p">GUIA PARA ENVIAR LA CONFIRMACION POR EMAIL</p>
                        <ul>
                            <li className="app-p">Escriba el cuerpo del email.</li>
                            <li className="app-p">Verifique los correos a los que se enviará el email, es posible añadir o quitar correos de la lista separandolos por coma (,)</li>
                            <li className="app-p">Verifique emails y solicitantes con los que se generara el documento de confirmacion, es posible añadir o quitar elementos de la lista separandolos por coma (,)</li>
                            <li className="app-p">Genere y anexe el documento de Confirmacion en la seccion de abajo y cualquier otro documeto que sea necesario.</li>
                        </ul>
                        <label className="fw-bold text-success text-start">Documento de Confirmación</label>
                        <div className="border border-success mb-2">
                            <PQRS_PDFGEN_CONFIRM
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                            />
                        </div>
                        <div className="pb-2">
                            <PQRS_EMAILS
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                                email_types={[0, 2, 4]}
                                refreshCurrentItem={retrieveItem}
                                attachs={true}
                            />
                        </div>

                    </>
                        : <fieldset className="p-3" id="fung_0">
                            <div className="text-center"> <h3 className="fw-bold text-danger">NO HA SIDO POSIBLE CARGAR LA INFORACION, INTENTELO NUEVAMENTE</h3></div>
                        </fieldset>}
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACION...</h3></div>
                </fieldset>}

                <PQRS_MODULE_NAV
                    translation={translation}
                    currentItem={currentItem}
                    FROM={"start"}
                    NAVIGATION={NAVIGATION}
                />
            </div>
        );
}

export default PQRSASIGN;