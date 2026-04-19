import { useState, useEffect } from 'react';
import PQRS_Service from '../../../../services/pqrs_main.service';
import DataTable from '@/components/data-table-bridge';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function PQRS_EDIT_SOLICITORS({ translation, swaMsg, globals, currentItem, refreshCurrentItem }) {
    const [edit, setEdit] = useState(false);
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        if (edit && edit !== false) {
            document.getElementById("pqrs_edit_solicitor_1_edit").value = edit.name;
            document.getElementById("pqrs_edit_solicitor_2_edit").value = edit.type;
            document.getElementById("pqrs_edit_solicitor_3_edit").value = edit.id_number;
            document.getElementById("pqrs_edit_solicitor_4_edit").value = edit.type_id;
        }
    }, [edit]);

        //DATA GETTERS
        let _GET_SOLICITORS = () => {
            return currentItem.pqrs_solocitors;
        }

        // COMPONENTS JSX
        let _SOLICITORS_COMPONENT = () => {
            var _LIST = _GET_SOLICITORS();
            const columns = [
                {
                    name: 'NOMBRE',
                    selector: row => row.name,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.name}</span>,
                },
                {
                    name: 'TIPO PERSONA',
                    selector: row => row.competence,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.type}</span>,
                },
                {
                    name: 'TIPO DOCUMENTO',
                    selector: row => row.asign,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.type_id}</span>,
                },
                {
                    name: 'DOCUMENTO',
                    cell: row => <span className="text-sm">{row.id_number}</span>,
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
                noDataComponent="No hay solicitantes"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
            return _COMPONENT;
        }
        let _COMPONENT_MANAGE = (_edit) => {
            var _COMPONENT = [];
            _COMPONENT.push(<div className="row">
                <div className="col-lg-6 col-md-6">
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="user" size={16} />
                        </span>
                        <input type="text" className="form-control" placeholder="Nombre Completo" id={"pqrs_edit_solicitor_1"+_edit} />
                    </div>

                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="user" size={16} />
                        </span>
                        <select className="form-select" id={"pqrs_edit_solicitor_2"+_edit}>
                            <option>NATURAL</option>
                            <option>JURIDICO</option>
                            <option>ESTABLECIMIENTO DE COMERCIO</option>
                            <option>MENOR DE EDAD/ADOLECENTE</option>
                        </select>
                    </div>
                </div>
                <div className="col-lg-6 col-md-6">
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="id-card" size={16} />
                        </span>
                        <input type="text" className="form-control" placeholder="Numero de Documento" id={"pqrs_edit_solicitor_3"+_edit} />
                    </div>

                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="id-card" size={16} />
                        </span>
                        <select className="form-select" id={"pqrs_edit_solicitor_4"+_edit}>
                            <option>CEDULA DE CIUDADANIA</option>
                            <option>NIT</option>
                            <option>CEDULA DE EXTRANJERIA</option>
                            <option>REGISTRO CIVIL</option>
                            <option>TARJETA DE IDENTIDAD</option>
                            <option>OTRO</option>
                        </select>
                    </div>
                </div>
            </div>)

            return <div>{_COMPONENT}</div>;
        }
        // FUNCTIONS & APIS
        var formData = new FormData();

        let new_item = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('pqrsMasterId', currentItem.id);

            let name = document.getElementById("pqrs_edit_solicitor_1").value;
            formData.set('name', name);
            let type = document.getElementById("pqrs_edit_solicitor_2").value;
            formData.set('type', type);
            let id_number = document.getElementById("pqrs_edit_solicitor_3").value;
            formData.set('id_number', id_number);
            let type_id = document.getElementById("pqrs_edit_solicitor_4").value;
            formData.set('type_id', type_id);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.create_solicitor(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        refreshCurrentItem(currentItem.id)
                        document.getElementById("form_pqrs_edit_solicitor_new").reset();
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });
        }
        let edit_item = (e) => {
            e.preventDefault();
            formData = new FormData();
            let name = document.getElementById("pqrs_edit_solicitor_1_edit").value;
            formData.set('name', name);
            let type = document.getElementById("pqrs_edit_solicitor_2_edit").value;
            formData.set('type', type);
            let id_number = document.getElementById("pqrs_edit_solicitor_3_edit").value;
            formData.set('id_number', id_number);
            let type_id = document.getElementById("pqrs_edit_solicitor_4_edit").value;
            formData.set('type_id', type_id);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.update_solicito(edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        refreshCurrentItem(currentItem.id)
                        setEdit(false);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });
        }
        let delete_item = (id) => {
            swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    PQRS_Service.delete_solicitor(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                refreshCurrentItem(currentItem.id)
                                setEdit(false);
                            } else {
                                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        });
                }
            });
        }
        return (
            <div>
                <div className="form-check ms-5">
                    <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Añadir Peticionario
                    </label>
                </div>
                {isNew
                    ? <form id="form_pqrs_edit_solicitor_new" onSubmit={new_item}>
                        {_COMPONENT_MANAGE("")}
                        <div className="text-center">
                            <button className="btn btn-sm btn-success my-3">
                                <Icon name="share-square" size={16} /> AÑADIR ITEM
                            </button>
                        </div>
                    </form>
                    : ""}
                {_SOLICITORS_COMPONENT()}
                {edit
                    ? <form id="form_pqrs_edit_solicitor_edit" onSubmit={edit_item}>
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

export default PQRS_EDIT_SOLICITORS;