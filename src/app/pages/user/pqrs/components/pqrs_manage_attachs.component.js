import { useState, useEffect } from 'react';
import PQRS_Service from '../../../../services/pqrs_main.service';
import DataTable from '@/components/data-table-bridge';

import VIZUALIZER from '../../../../components/vizualizer.component';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function PQRS_EDIT_ATTACH({ translation, swaMsg, globals, currentItem, refreshCurrentItem }) {
    const [edit, setEdit] = useState(false);
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        if (edit && edit !== false) {
            document.getElementById("file_name_edit").value = edit.public_name;
        }
    }, [edit]);

        //DATA GETTERS
        let _GET_ATTACHS = () => {
            return currentItem.pqrs_attaches;
        }

        // COMPONENTS JSX
        let _ATTACHES_COMPONENT = () => {
            var _LIST = _GET_ATTACHS();
            const columns = [
                {
                    name: 'NOMBRE',
                    selector: row => row.name,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.public_name}</span>,
                },
                {
                    name: 'TIPO',
                    selector: row => row.competence,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.type}</span>,
                },
                {
                    name: 'ACCIÓN',
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <VIZUALIZER url={row.name} apipath={row.class == 0 ?  '/files/pqrsa/': '/files/pqrs/'}/>
                        <button title="Modificar item" onClick={() => setEdit(row)} className="btn btn-sm btn-secondary m-0 p-2 shadow-none">
                                <Icon name="edit" size={16} /></button>
                        <button title="Eliminar item" onClick={() => delete_item(row.id)} className="btn btn-sm btn-danger m-0 p-2 shadow-none">
                                <Icon name="trash-alt" size={16} /></button>
                    </>,
                },
            ]
            var _COMPONENT = <DataTable
                noDataComponent="No hay Anexos"
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
            _COMPONENT.push(<div className="row d-flex justify-content-center my-2">
                <div className="col-6">
                    <div className="input-group">
                        <span className="input-group-text bg-info text-white"><Icon name="paperclip" size={16} /></span>
                        <input type="text" className="form-control" id={"file_name" + _edit} placeholder="Nombre documento (nombre o corta descripcion)" required />
                    </div>
                </div>
                <div className="col-6 ">
                    <div className="input-group">
                        <span className="input-group-text bg-info text-white"><Icon name="paperclip" size={16} /></span>
                        <input type="file" className="form-control" id={"file" + _edit} accept="image/png, image/jpeg application/pdf" required={_edit ? false: true} />
                    </div>
                    {_edit
                        ? <label className="text-secondary fw-bold">Si el campo de anexo se deja vacío, el sistema no reemplazara ningún documento</label>
                        : ""}
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

            let public_name = document.getElementById("file_name").value;
            formData.set('public_name', public_name);

            let file = document.getElementById("file").files;
            formData.append('file', file[0], "pqrs_" + file[0].name)

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.create_attach(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        refreshCurrentItem(currentItem.id)
                        document.getElementById("form_pqrs_edit_attach").reset();
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
            
            let public_name = document.getElementById("file_name_edit").value;
            formData.set('public_name', public_name);

            let file = document.getElementById("file_edit").files;
            if (file.length){
                formData.append('file', file[0], "pqrs_" + file[0].name)
            }

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            PQRS_Service.update_attach(edit.id, formData)
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
                    PQRS_Service.deleteAttach(id)
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
                        Añadir Anexo
                    </label>
                </div>
                {isNew
                    ? <form id="form_pqrs_edit_attach" onSubmit={new_item} enctype="multipart/form-data">
                        {_COMPONENT_MANAGE("")}
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <Icon name="share-square" size={16} /> AÑADIR ITEM
                            </button>
                        </div>
                    </form>
                    : ""}
                {_ATTACHES_COMPONENT()}
                {edit
                    ? <form id="form_pqrs_new_attach" onSubmit={edit_item} enctype="multipart/form-data">
                        <div className="text-center">
                            <label className="fw-bold py-2">Editar Item</label>
                        </div>
                        {_COMPONENT_MANAGE("_edit")}
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <Icon name="share-square" size={16} /> GUARDAR CAMBIOS
                            </button>
                        </div>
                    </form>
                    : ""}
            </div>
        );
}

export default PQRS_EDIT_ATTACH;