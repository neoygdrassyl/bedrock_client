import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { MDBBreadcrumb, MDBBreadcrumbItem, MDBBtn } from 'mdb-react-ui-kit';
import Solicitors_service from '../../../services/solicitors.service.js';
import SubmitService from '../../../services/submit.service.js';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Modal from 'react-modal';
import NEW_SOLICITOR from './solicitor_create.js';
const moment = require('moment');
const MySwal = withReactContent(Swal);



class Manage_User extends Component {
    constructor(props) {
        super(props);
        this.refreshList = this.refreshList.bind(this);
        this.retrievePublish = this.retrievePublish.bind(this);

        this.state = {
            error: null,
            isLoaded: false,
            isLoadedSearch: false,
            currentItem: null,

            modal: false,
            new_modal: false,

            list_search: [],
            list: [],
        };
    }
    componentDidMount() {
        this.retrievePublish();
    }
    retrievePublish() {
        Solicitors_service.getAll()
            .then(response => {
                response.data.createdAt = response.data.createdAt = new Date()
                response.data.createdAt.toLocaleDateString()
                this.asignList(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }
    refreshList(id) {
        this.retrievePublish();
        if (id) this.refreshItem(id)
    }

    refreshItem(id) {
        SubmitService.get(id).then(response => {
            let item = response.data
            this.setState({
                currentItem: item,
                currentId: item.id
            })
        })
    }
    retrieveSearch(field, string) {
        SubmitService.getSearch(field, string)
            .then(response => {
                this.asignList(response.data);
                MySwal.close();
            })
            .catch(e => {
                console.log(e);
            });
    }
    asignList(_LIST) {
        this.setState({
            list: _LIST,
            isLoaded: true,
        });
    }
    //  MODAL CONTROLS
    toggle(item) {
        this.setState({
            modal: !this.state.modal,
        });
        if (item) this.setState({
            currentItem: item,
            currentId: item.id,
            currentIdPublic: item.id_public
        });
        else this.setState({
            currentId: null,
            currentItem: null,
            currentIdPublic: null,
        });
    }
    getToggle = () => {
        return this.state.modal;
    }
    toggle_new() {
        this.setState({
            new_modal: !this.state.new_modal,
        });
    }
    getToggle_new = () => {
        return this.state.new_modal;
    }



    render() {
        const columns = [
            {
                name: <label className="text-center">Nr. Identificación</label>,
                selector: 'id_public',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_public}</label>
            },
            {
                name: <label className="text-center">Tipo de documento</label>,
                selector: 'document_type',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.document_type}</label>
            },
            {
                name: <label className="text-center">Nombre</label>,
                selector: 'name',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.name}</label>
            },
            {
                name: <label className="text-center">Email</label>,
                selector: 'id_related',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.email}</label>
            },
            {
                name: <label className="text-center">Tipo de solicitante</label>,
                selector: 'role',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.role}</label>
            },
            {
                name: <label className="text-center">Fecha de Registro</label>,
                selector: 'createdAt',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => {
                    row.createdAt = row.createdAt = new Date()
                    return < label > {
                        row.createdAt.toLocaleDateString()
                    }</label >
                }
            }
        ]

        const { translation, globals, swaMsg, breadCrums } = this.props;
        const { currentItem, currentId, isLoaded, list } = this.state;
        const customStyles = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                zIndex: 2,
            },
            content: {
                position: 'absolute',
                top: '40px',
                left: '15%',
                right: '15%',
                bottom: '40px',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                marginRight: 'auto',
            }
        };

        // const { currentItem, isLoaded, items } = this.state;

        return (

            <div className="Solictors container">
                <div className="row my-4 d-flex justify-content-center">
                    <MDBBreadcrumb className="mx-5">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem>
                            <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u6}</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>
                    <div className="col-lg-8 col-md-10">
                        <h1 className="text-center my-4">GESTIONAR USUARIOS</h1>
                        <hr />
                        <div className='my-5'>
                            <button className='btn text-white p-2' style={{ backgroundColor: '#2651A8' }} onClick={() => this.toggle_new()}>
                                <i className='fas fa-user-plus'></i> Registrar Usuario
                            </button>
                        </div>
                        <hr />
                        <div className="text-center">
                            {isLoaded ? (
                                <DataTable
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent={<h4 className="fw-bold">NO HAY INFORMACION</h4>}
                                    striped="true"
                                    columns={columns}
                                    data={list}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[20, 50, 100]}
                                    className="data-table-component"
                                    noHeader

                                    dense
                                    defaultSortFieldId={1}
                                    defaultSortAsc={false}
                                />
                            ) : (
                                <div className="text-center">
                                    <h4 className="fw-bold">CARGANDO INFORMACION...</h4>
                                </div>)}
                        </div>
                        <Modal contentLabel="NEW VIEW"
                            isOpen={this.state.new_modal}
                            style={customStyles}
                            ariaHideApp={false}
                        >
                            <div className="my-4 d-flex justify-content-between">
                                <h3><i class="fas fa-plus-circle"></i> NUEVA ENTRADA | {moment().format('YYYY-MM-DD')}</h3>
                                <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_new()}></MDBBtn>
                            </div>
                            <div>
                            </div>
                            <NEW_SOLICITOR
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                refreshList={this.refreshList}
                                closeModal={this.toggle_new} />
                            <div className="text-end py-4 mt-3">
                                <button className="btn btn-lg btn-info" onClick={() => this.toggle_new()}><i class="fas fa-times-circle"></i> CERRAR </button>
                            </div>
                        </Modal>


                    </div>
                </div>

            </div >
        );
    }
}

export default Manage_User;