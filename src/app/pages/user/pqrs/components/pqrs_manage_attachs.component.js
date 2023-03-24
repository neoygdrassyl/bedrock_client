import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import DataTable from 'react-data-table-component';
import { MDBTooltip } from 'mdb-react-ui-kit';
import VIZUALIZER from '../../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);
class PQRS_EDIT_ATTACH extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            var _ITEM = this.state.edit;
            document.getElementById("file_name_edit").value = _ITEM.public_name;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;

        //DATA GETTERS
        let _GET_ATTACHS = () => {
            return currentItem.pqrs_attaches;
        }

        // COMPONENTS JSX
        let _ATTACHES_COMPONENT = () => {
            var _LIST = _GET_ATTACHS();
            const columns = [
                {
                    name: <label>NOMBRE</label>,
                    selector: 'name',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.public_name}</label>,
                },
                {
                    name: <label>TIPO</label>,
                    selector: 'competence',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.type}</label>,
                },
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <VIZUALIZER url={row.name} apipath={row.class == 0 ?  '/files/pqrsa/': '/files/pqrs/'}/>
                        <MDBTooltip title='Modificar item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                            <button onClick={() => this.setState({ edit: row })} className="btn btn-sm btn-secondary m-0 p-2 shadow-none">
                                <i class="far fa-edit "></i></button></MDBTooltip>
                        <MDBTooltip title='Eliminar item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                            <button onClick={() => delete_item(row.id)} className="btn btn-sm btn-danger m-0 p-2 shadow-none">
                                <i class="far fa-trash-alt"></i></button></MDBTooltip>
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
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white"><i class="fas fa-paperclip"></i></span>
                        <input type="text" class="form-control" id={"file_name" + _edit} placeholder="Nombre documento (nombre o corta descripcion)" required />
                    </div>
                </div>
                <div className="col-6 ">
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white"><i class="fas fa-paperclip"></i></span>
                        <input type="file" class="form-control" id={"file" + _edit} accept="image/png, image/jpeg application/pdf" required={_edit ? false: true} />
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


            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.create_attach(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.refreshCurrentItem(currentItem.id)
                        document.getElementById("form_pqrs_edit_attach").reset();
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
            
            let public_name = document.getElementById("file_name_edit").value;
            formData.set('public_name', public_name);

            let file = document.getElementById("file_edit").files;
            if (file.length){
                formData.append('file', file[0], "pqrs_" + file[0].name)
            }

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.update_attach(this.state.edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.refreshCurrentItem(currentItem.id)
                        this.setState({ edit: false });
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
                    PQRS_Service.deleteAttach(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.refreshCurrentItem(currentItem.id)
                                this.setState({ edit: false });
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
                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Añadir Anexo
                    </label>
                </div>
                {this.state.new
                    ? <form id="form_pqrs_edit_attach" onSubmit={new_item} enctype="multipart/form-data">
                        {_COMPONENT_MANAGE("")}
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> AÑADIR ITEM
                            </button>
                        </div>
                    </form>
                    : ""}
                {_ATTACHES_COMPONENT()}
                {this.state.edit
                    ? <form id="form_pqrs_new_attach" onSubmit={edit_item} enctype="multipart/form-data">
                        <div className="text-center">
                            <label className="fw-bold py-2">Editar Item</label>
                        </div>
                        {_COMPONENT_MANAGE("_edit")}
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                            </button>
                        </div>
                    </form>
                    : ""}
            </div>
        );
    }
}

export default PQRS_EDIT_ATTACH;