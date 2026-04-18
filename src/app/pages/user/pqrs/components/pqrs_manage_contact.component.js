import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import DataTable from '@/components/data-table-bridge';

import { dateParser } from '../../../../components/customClasses/typeParse';
import { Icon } from '@/components/icon';

const MySwal = withReactContent(Swal);
function PQRS_EDIT_CONTACT({ translation, swaMsg, globals, currentItem, refreshCurrentItem }) {
    const [edit, setEdit] = useState(false);
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        if (edit && edit !== false) {
            document.getElementById("pqrs_con_edit_1_edit").value = edit.address;
            document.getElementById("pqrs_con_edit_2_edit").value = edit.neighbour;
            document.getElementById("pqrs_con_edit_3_edit").value = edit.phone;
            document.getElementById("pqrs_con_edit_4_edit").value = edit.state;
            document.getElementById("pqrs_con_edit_5_edit").value = edit.county;
            document.getElementById("pqrs_con_edit_6_edit").value = edit.email;
            document.getElementById("pqrs_con_edit_7_edit").checked = edit.notify;
            if (currentItem.pqrs_law.extension) {
                document.getElementById("pqrs_con_edit_8").value = edit.notify_extension ? edit.notify_extension : 0;
                document.getElementById("pqrs_con_edit_9").value = edit.notify_extension_date;
            }
            document.getElementById("pqrs_con_edit_101").value = edit.notify_confirm ? edit.notify_confirm : 0;
            document.getElementById("pqrs_con_edit_102").value = edit.notify_confirm_date;
            document.getElementById("pqrs_con_edit_111").value = edit.notify_reply ? edit.notify_reply : 0;
            document.getElementById("pqrs_con_edit_112").value = edit.notify_date;
        }
    }, [edit]);

        //DATA GETTERS
        let _GET_CONTACTS = () => {
            return currentItem.pqrs_contacts;
        }
        let u=0;

        let _GET_NOTIFY_CONTEXT = (_value, _date) => {
            if (_value == 0) return <label className="text-warning">PENDIENTE</label>
            if (_value == 1) return <label className="text-success">SI CONSTANCIA FISICA DE RADICACION - {dateParser(_date)}</label>
            if (_value == 2) return <label className="text-success">SI - CORREO ELECTRONICO DE RECIBIDO</label>
            if (_value == 3) return <label className="text-danger">NO</label>
            if (_value == 4) return <label className="text-success">SI CONSTANCIA FISICA DE OFICIO - {dateParser(_date)}</label>
            if (_value == 5) return <label className="text-success">SI - CORREO ELECTRONICO</label>

        }
        // COMPONENTS JSX
        let _CONTACTS_COMPONENT = () => {
            var _LIST = _GET_CONTACTS();
            const columns = [
                {
                    name: 'DIRECCION',
                    selector: row => row.name,
                    minWidth: '210px',
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.address}</span>,
                },
                {
                    name: 'BARRIO',
                    selector: row => row.competence,
                    minWidth: '180px',
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.neighbour}</span>,
                },
                {
                    name: 'MUNICIPIO',
                    minWidth: '180px',
                    cell: row => <span className="text-sm">{row.county}</span>,
                },
                {
                    name: 'TÉLEFONO',
                    selector: row => row.asign,
                    minWidth: '180px',
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.phone}</span>,
                },
                {
                    name: 'CONTACTO',
                    minWidth: '199px',
                    cell: row => <span className="text-sm">{row.email}</span>,
                },

                {
                    name: '¿AUTORIZA NOTIFICACIÓN POR CORREO?',
                    center: true,
                    minWidth: '290px',
                    cell: row => <span className="text-sm">{row.notify ? <label className="text-success fw-bold">SI</label> : "NO"}</span>,
                },
                {
                    name: 'ACCIÓN',
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <button title="Modificar item" onClick={() => setEdit(row)} className="btn btn-sm btn-secondary m-0 p-2 shadow-none">
                                <Icon name="edit" size={16} /></button>
                        <button title="Eliminar item" onClick={() => delete_item(row.id)} className="btn btn-sm btn-danger m-0 p-2 shadow-none">
                                <Icon name="trash-alt" size={16} /></button>
                    </>,
                },
            ]
            var _COMPONENT = <DataTable
                noDataComponent="No hay conactos"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
            return _COMPONENT;
        }
        var validations_pqrs_law = currentItem.pqrs_law ? currentItem.pqrs_law.extension : ''

        let _COMPONENT_MANAGE = (_edit) => {
            var _COMPONENT = [];
            _COMPONENT.push(<div className="row">
                <div className="col-lg-6 col-md-6">
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="map-signs" size={16} />
                        </span>
                        <input type="text" className="form-control" placeholder="Direccion Fisica" id={"pqrs_con_edit_1" + _edit} />
                    </div>

                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="map-marked-alt" size={16} />
                        </span>
                        <input type="text" className="form-control" placeholder="Barrio" id={"pqrs_con_edit_2" + _edit} />
                    </div>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="phone-alt" size={16} />
                        </span>
                        <input type="text" className="form-control" placeholder="Numero de Contacto" id={"pqrs_con_edit_3" + _edit} />
                    </div>
                    <div className="form-check mx-5 my-3">
                        <input className="form-check-input" type="checkbox" value="" id={"pqrs_con_edit_7" + _edit} />
                        <p className="form-check-label text-justify" >¿Autoriza repuesta por Email?</p>
                    </div>
                </div>
                <div className="col-lg-6 col-md-6">
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="globe-americas" size={16} />
                        </span>
                        <input type="text" className="form-control" placeholder="Departamenteo" id={"pqrs_con_edit_4" + _edit} />
                    </div>

                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="globe-americas" size={16} />
                        </span>
                        <input type="text" className="form-control" placeholder="Municipio" id={"pqrs_con_edit_5" + _edit} />
                    </div>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="envelope" size={16} />
                        </span>
                        <input type="text" className="form-control" placeholder="Correo Electronico" id={"pqrs_con_edit_6" + _edit} />
                    </div>
                </div>

                {_edit
                    ? <>
                        <div className="row border border-secondary p-2 mb-2 mx-auto">
                            <div className="col-6">
                                <label>¿se confirmó recepción de la solicitud?</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text bg-info text-white">
                                        <Icon name="comment-dots" size={16} />
                                    </span>
                                    <select className="form-select" id="pqrs_con_edit_101">
                                        <option value="0">PENDIENTE</option>
                                        <option value="1">SI-CONSTANCIA FÍSICA DE RADICACIÓN</option>
                                        <option value="2">SI-CORREO ELECTRÓNICO DE RECIBIDO</option>
                                        <option value="3">NO</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-6">
                                <label>Fecha de evento</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text bg-info text-white">
                                        <Icon name="calendar-alt" size={16} />
                                    </span>
                                    <input type="date" max="2100-01-01" className="form-control" id="pqrs_con_edit_102" />
                                </div>
                            </div>
                        </div>
                    </>
                    : ""}

                {validations_pqrs_law && _edit
                    ? <>
                        <div className="row border border-secondary p-2 mb-2 mx-auto">
                            <div className="col-6">
                                <label>¿Fue posible notificar extesion?</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text bg-info text-white">
                                        <Icon name="comment-dots" size={16} />
                                    </span>
                                    <select className="form-select" id="pqrs_con_edit_8">
                                        <option value="0">PENDIENTE</option>
                                        <option value="1">SI-CONSTANCIA FÍSICA DE RADICACIÓN</option>
                                        <option value="2">SI-CORREO ELECTRÓNICO DE RECIBIDO</option>
                                        <option value="3">NO</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-6">
                                <label>Fecha de evento</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text bg-info text-white">
                                        <Icon name="calendar-alt" size={16} />
                                    </span>
                                    <input type="date" max="2100-01-01" className="form-control" id="pqrs_con_edit_9" />
                                </div>
                            </div>
                        </div>
                    </> : ""}

                {_edit
                    ? <>
                        <div className="row border border-secondary p-2 mb-2 mx-auto">
                            <div className="col-6">
                                <label>Se confirmó el oficio de respuesta?</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text bg-info text-white">
                                        <Icon name="comment-dots" size={16} />
                                    </span>
                                    <select className="form-select" id="pqrs_con_edit_111">
                                        <option value="0">PENDIENTE</option>
                                        <option value="4">SI-CONSTANCIA FÍSICA DE OFICIO</option>
                                        <option value="5">SI-CORREO ELECTRÓNICO</option>
                                        <option value="3">NO</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-6">
                                <label>Fecha de evento</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text bg-info text-white">
                                        <Icon name="calendar-alt" size={16} />
                                    </span>
                                    <input type="date" max="2100-01-01" className="form-control" id="pqrs_con_edit_112" />
                                </div>
                            </div>
                        </div>
                    </>
                    : ""}

            </div>)

            return <div>{_COMPONENT}</div>;
        }
        // FUNCTIONS & APIS
        var formData = new FormData();

        let new_item = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('pqrsMasterId', currentItem.id);

            let address = document.getElementById("pqrs_con_edit_1").value;
            formData.set('address', address);
            let neighbour = document.getElementById("pqrs_con_edit_2").value;
            formData.set('neighbour', neighbour);
            let phone = document.getElementById("pqrs_con_edit_3").value;
            formData.set('phone', phone);
            let state = document.getElementById("pqrs_con_edit_4").value;
            formData.set('state', state);
            let county = document.getElementById("pqrs_con_edit_5").value;
            formData.set('county', county);
            let email = document.getElementById("pqrs_con_edit_6").value;
            formData.set('email', email);
            let notify = document.getElementById("pqrs_con_edit_7").checked;
            formData.set('notify', notify == true ? 1 : 0);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.create_contact(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        refreshCurrentItem(currentItem.id)
                        document.getElementById("form_pqrs_edit_contact_new").reset();
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
        let edit_item = (e) => {
            e.preventDefault();
            formData = new FormData();
            let address = document.getElementById("pqrs_con_edit_1_edit").value;
            formData.set('address', address);
            let neighbour = document.getElementById("pqrs_con_edit_2_edit").value;
            formData.set('neighbour', neighbour);
            let phone = document.getElementById("pqrs_con_edit_3_edit").value;
            formData.set('phone', phone);
            let state = document.getElementById("pqrs_con_edit_4_edit").value;
            formData.set('state', state);
            let county = document.getElementById("pqrs_con_edit_5_edit").value;
            formData.set('county', county);
            let email = document.getElementById("pqrs_con_edit_6_edit").value;
            formData.set('email', email);
            let notify = document.getElementById("pqrs_con_edit_7_edit").checked;
            console.log(notify)
            formData.set('notify', notify == true ? 1 : 0);

            if (currentItem.pqrs_law.extension) {
                let notify_extension = document.getElementById("pqrs_con_edit_8").value;
                formData.set('notify_extension', notify_extension);
                let notify_extension_date = document.getElementById("pqrs_con_edit_9").value;
                if (notify_extension_date) formData.set('notify_extension_date', notify_extension_date);
            }

            let notify_confirm = document.getElementById("pqrs_con_edit_101").value;
            formData.set('notify_confirm', notify_confirm);
            let notify_confirm_date = document.getElementById("pqrs_con_edit_102").value;
            if (notify_confirm_date) formData.set('notify_confirm_date', notify_confirm_date);

            let notify_reply = document.getElementById("pqrs_con_edit_111").value;
            formData.set('notify_reply', notify_reply);
            let notify_date = document.getElementById("pqrs_con_edit_112").value;
            if (notify_date) formData.set('notify_date', notify_date);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.update_contact(edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        refreshCurrentItem(currentItem.id)
                        setEdit(false);
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
        let delete_item = (id) => {
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
                    PQRS_Service.delete_contact(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                refreshCurrentItem(currentItem.id)
                                setEdit(false);
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
            });
        }
        return (
            <div>
                <div className="form-check ms-5">
                    <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Añadir Contacto
                    </label>
                </div>
                {isNew
                    ? <form id="form_pqrs_edit_contact_new" onSubmit={new_item}>
                        {_COMPONENT_MANAGE("")}
                        <div className="text-center">
                            <button className="btn btn-sm btn-success my-3">
                                <Icon name="share-square" size={16} /> AÑADIR ITEM
                            </button>
                        </div>
                    </form>
                    : ""}
                {_CONTACTS_COMPONENT()}
                {edit
                    ? <form id="form_pqrs_edit_contact_edit" onSubmit={edit_item}>
                        <div className="text-center">
                            <label className="fw-bold py-2">Editar Item</label>
                        </div>
                        {_COMPONENT_MANAGE("_edit")}
                        <div className="text-center">
                            <button className="btn btn-sm btn-success my-3">
                                <Icon name="share-square" size={16} /> GUARDAR CAMBIOS
                            </button>
                        </div>
                    </form>
                    : ""}
            </div>
        );
}

export default PQRS_EDIT_CONTACT;