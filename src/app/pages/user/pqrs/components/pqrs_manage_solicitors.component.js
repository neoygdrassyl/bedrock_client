import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import DataTable from 'react-data-table-component';
import { MDBTooltip } from 'mdb-react-ui-kit';

const MySwal = withReactContent(Swal);
class PQRS_EDIT_SOLICITORS extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            var _ITEM = this.state.edit;
            document.getElementById("pqrs_edit_solicitor_1_edit").value = _ITEM.name;
            document.getElementById("pqrs_edit_solicitor_2_edit").value = _ITEM.type;
            document.getElementById("pqrs_edit_solicitor_3_edit").value = _ITEM.id_number;
            document.getElementById("pqrs_edit_solicitor_4_edit").value = _ITEM.type_id;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const {} = this.state;

        //DATA GETTERS
        let _GET_SOLICITORS = () => {
            return currentItem.pqrs_solocitors;
        }

        // COMPONENTS JSX
        let _SOLICITORS_COMPONENT = () => {
            var _LIST = _GET_SOLICITORS();
            const columns = [
                {
                    name: <label>NOMBRE</label>,
                    selector: 'name',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.name}</label>,
                },
                {
                    name: <label>TIPO PERSONA</label>,
                    selector: 'competence',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.type}</label>,
                },
                {
                    name: <label>TIPO DOCUMENTO</label>,
                    selector: 'asign',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.type_id}</label>,
                },
                {
                    name: <label>DOCUMENTO</label>,
                    cell: row => <label>{row.id_number}</label>,
                },
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <MDBTooltip title='Modificar item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                            <button onClick={() => this.setState({ edit: row })} className="btn btn-sm btn-secondary m-0 p-2 shadow-none">
                                <i class="far fa-edit "></i></button></MDBTooltip>
                        <MDBTooltip title='Eliminar item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                            <button onClick={() => delete_item(row.id)} className="btn btn-sm btn-danger m-0 p-2 shadow-none">
                                <i class="far fa-trash-alt "></i></button></MDBTooltip>
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
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-user"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Nombre Completo" id={"pqrs_edit_solicitor_1"+_edit} />
                    </div>

                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-user"></i>
                        </span>
                        <select class="form-select" id={"pqrs_edit_solicitor_2"+_edit}>
                            <option>NATURAL</option>
                            <option>JURIDICO</option>
                            <option>ESTABLECIMIENTO DE COMERCIO</option>
                            <option>MENOR DE EDAD/ADOLECENTE</option>
                        </select>
                    </div>
                </div>
                <div className="col-lg-6 col-md-6">
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-id-card"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Numero de Documento" id={"pqrs_edit_solicitor_3"+_edit} />
                    </div>

                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-id-card"></i>
                        </span>
                        <select class="form-select" id={"pqrs_edit_solicitor_4"+_edit}>
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


            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.create_solicitor(formData)
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
                        document.getElementById("form_pqrs_edit_solicitor_new").reset();
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
            let name = document.getElementById("pqrs_edit_solicitor_1_edit").value;
            formData.set('name', name);
            let type = document.getElementById("pqrs_edit_solicitor_2_edit").value;
            formData.set('type', type);
            let id_number = document.getElementById("pqrs_edit_solicitor_3_edit").value;
            formData.set('id_number', id_number);
            let type_id = document.getElementById("pqrs_edit_solicitor_4_edit").value;
            formData.set('type_id', type_id);


            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.update_solicito(this.state.edit.id, formData)
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
                    PQRS_Service.delete_solicitor(id)
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
                        Añadir Peticionario
                    </label>
                </div>
                {this.state.new
                    ? <form id="form_pqrs_edit_solicitor_new" onSubmit={new_item}>
                        {_COMPONENT_MANAGE("")}
                        <div className="text-center">
                            <button className="btn btn-sm btn-success my-3">
                                <i class="far fa-share-square"></i> AÑADIR ITEM
                            </button>
                        </div>
                    </form>
                    : ""}
                {_SOLICITORS_COMPONENT()}
                {this.state.edit
                    ? <form id="form_pqrs_edit_solicitor_edit" onSubmit={edit_item}>
                        <div className="text-center">
                            <label className="fw-bold py-2">Editar Item</label>
                        </div>
                        {_COMPONENT_MANAGE("_edit")}
                        <div className="text-center">
                            <button className="btn btn-sm btn-success my-3">
                                <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                            </button>
                        </div>
                    </form>
                    : ""}
            </div>
        );
    }
}

export default PQRS_EDIT_SOLICITORS;