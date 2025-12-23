import React, { Component } from 'react';
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import { MDBDataTable } from 'mdbreact';
import Modal from 'react-modal';
import { dateParser } from '../../../../components/customClasses/typeParse';
import FUN_SERVICE from '../../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import './fun_modal_shared.css';

const MySwal = withReactContent(Swal);
class FUN_6_HISTORY extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            list: [],
            load: false,
        };
    }
    componentDidMount() {

    }
    componentDidUpdate(prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            let ITEM = this.state.edit;
            document.getElementById('fun_6_h_1_edit').value = ITEM.detail ?? '';
            document.getElementById('fun_6_h_2_edit').value = ITEM.date ?? '';
            document.getElementById('fun_6_h_3_edit').value = ITEM.state ?? '';

        }
    }
    retrieveItem() {
        FUN_SERVICE.getAll_fun_6_h(this.props.fun6.id)
            .then(response => {
                this.setState({
                    list: response.data,
                    load: true
                })
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    render() {
        const { translation, swaMsg, globals, fun6 } = this.props;
        const { list, load } = this.state;
        const customStylesForModal = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                zIndex: 1051,
            },
            content: {
                position: 'absolute',
                top: '15%',
                left: 'var(--fun-sidebar-width)',
                right: '30%',
                bottom: '15%',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                marginRight: 'auto',

            }
        };

        let toggle = (state) => {
            if (state) this.retrieveItem();
            else this.setState({ load: false })
            this.setState({
                modal: !this.state.modal,
            });
        }

        // COMPONENT JSX
        let COMPONENT_HISTORY = () => {
            const columns = [
                {
                    name: <label className="text-center">DETALLES</label>,
                    cell: row => <label>{row.detail}</label>
                },
                {
                    name: <label>FECHA</label>,
                    selector: row => row.date, // FIX: v7→v8 column selector
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.date}</label>
                },
                {
                    name: <label>ESTADO FINAL</label>,
                    selector: row => row.state, // FIX: v7→v8 column selector
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.state == 0 ? "EN ARCHIVO" : "FUERA DE ARCHIVO"}</label>
                },
                {
                    name: <label>ACCION</label>,
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-secondary m-0 p-2 shadow-none" onClick={() => this.setState({ edit: row })}>
                                <i class="far fa-edit fa-2x "></i></MDBBtn>
                        </MDBTooltip>
                        <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-danger btn-sm  m-0 p-2 shadow-none" onClick={() => delete_6_h(row.id)}>
                                <i class="far fa-trash-alt fa-2x"></i></MDBBtn>
                        </MDBTooltip>
                    </>
                },
            ]

            return <>
                <div className="row mx-2 text-center">
                    <div className="col border border-dark bg-primary py-2"><label className="fw-bold text-white">Anexo</label></div>
                    <div className="col border border-dark bg-primary py-2"><label className="fw-bold text-white">{dateParser(fun6.date)}</label></div>
                </div>
                <DataTable
                    noDataComponent="No hay Items"
                    striped="true"
                    columns={columns}
                    data={list}
                    highlightOnHover
                    className="data-table-component"
                    noHeader
                />
            </>
        }
        let _COMPONENT_MANAGE = (edit = "") => {
            return <>
                <div className="row">
                    <div className="col-4">
                        <label>Detalles</label>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-comment-dots"></i>
                            </span>
                            <input type="text" class="form-control" id={"fun_6_h_1" + edit} required />
                        </div>
                    </div>

                    <div className="col-4">
                        <label>Fecha</label>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" max="2100-01-01" class="form-control" id={"fun_6_h_2" + edit} required />
                        </div>
                    </div>

                    <div className="col-4">
                        <label>Estado Final</label>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <select className="form-select" id={"fun_6_h_3" + edit} required >
                                <option value="0">EN ARCHIVO</option>
                                <option value="1">FUERA DE ARCHIVO</option>
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }

        // FUNCTIONS & APIS
        var formData = new FormData();
        let new_item = (e) => {
            e.preventDefault();
            formData = new FormData();

            let detail = document.getElementById("fun_6_h_1").value;
            formData.set('detail', detail);

            let date = document.getElementById("fun_6_h_2").value;
            formData.set('date', date);

            let state = document.getElementById("fun_6_h_3").value;
            formData.set('state', state);

            formData.set('fun6Id', fun6.id);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUN_SERVICE.create_fun6_h(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.retrieveItem();
                        document.getElementById('fun_6_h_new').reset();
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
        let edit_6_h = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData = new FormData();

            let detail = document.getElementById("fun_6_h_1_edit").value;
            formData.set('detail', detail);

            let date = document.getElementById("fun_6_h_2_edit").value;
            formData.set('date', date);

            let state = document.getElementById("fun_6_h_3_edit").value;
            formData.set('state', state);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUN_SERVICE.update_6_h(this.state.edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.setState({ edit: false });
                        this.retrieveItem();
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
        let delete_6_h = (id) => {
            formData = new FormData();
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
                    FUN_SERVICE.delete_6_h(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.retrieveItem();
                                this.setState({ edit: false })
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
                <MDBTooltip title='Ver Historial' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 ms-1">
                    {/* FIX: Changed from MDBBtn to span to avoid nested button issues */}
                    <span 
                        role="button" 
                        tabIndex={0} 
                        className="btn shadow-none p-1" 
                        onClick={() => toggle(true)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(true); }}
                        style={{cursor: 'pointer'}}>
                        <i className="fas fa-history" style={{fontSize: '150%'}}></i>
                    </span>
                </MDBTooltip>

                <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={this.state.modal}
                    style={customStylesForModal}
                    ariaHideApp={false}
                >


                    <div className="my-4 d-flex justify-content-between">
                        <label className="fw-bold align-middle"> <i class="fas fa-history fa-2x"></i> HISTORIA DEL DOCUMENTO</label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle()}></MDBBtn>
                    </div>

                    <div class="form-check ms-5">
                        <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new: e.target.checked })} />
                        <label class="form-check-label" for="flexCheckDefault">
                            Nueva entrada
                        </label>
                    </div>
                    {this.state.new
                        ? <>
                            <form id="fun_6_h_new" onSubmit={new_item}>
                                {_COMPONENT_MANAGE()}
                                <div className="row mb-3 text-center">
                                    <div className="col-12">
                                        <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                    </div>
                                </div>
                            </form>
                        </>
                        : ""}


                    {load
                        ? <>
                            {COMPONENT_HISTORY()}

                            {this.state.edit
                                ? <>
                                    <form id="fun_6_d_edit" onSubmit={edit_6_h} className="py-3">
                                        {_COMPONENT_MANAGE('_edit')}
                                        <div className="row text-center">
                                            <div className="col-12">
                                                <button className="btn btn-lg btn-success"><i class="fas fa-archive"></i> GUARDAR CAMBIOS </button>
                                            </div>
                                        </div>
                                    </form></> : ""}
                        </>
                        : <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACION...</h3></div>}


                    <div className="text-end py-4 mt-3">
                        <MDBBtn className="btn btn-lg btn-info" onClick={() => toggle()}><i class="fas fa-times-circle"></i> CERRAR</MDBBtn>
                    </div>
                </Modal>

            </div>
        );
    }
}

export default FUN_6_HISTORY;