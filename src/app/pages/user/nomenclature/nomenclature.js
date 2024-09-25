import React, { Component } from 'react';
import { MDBBtn, MDBBreadcrumb, MDBBreadcrumbItem, MDBTooltip, MDBCard, MDBCardBody, MDBCardTitle } from 'mdb-react-ui-kit';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';

// SERVICES
import Nomenclature_Service from '../../../services/nomeclature.service'
import { dateParser } from '../../../components/customClasses/typeParse'

// COMPONENT
import NOMENCLATURE_NEW from './new_nomenclature';
import moment from 'moment';

const MySwal = withReactContent(Swal);

class NOMENCLATURE extends Component {
    constructor(props) {
        super(props);
        this.retrievePublish = this.retrievePublish.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.refreshItem = this.refreshItem.bind(this);
        this.toggle_new = this.toggle_new.bind(this);
        this.toggle = this.toggle.bind(this)
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
        Nomenclature_Service.getAll()
            .then(response => {
                this.asignList(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }
    retrieveSearch(field, string) {
        Nomenclature_Service.getSearch(field, string)
            .then(response => {
                this.asignList(response.data);
                MySwal.close();
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
        Nomenclature_Service.get(id).then(response => {
            let item = response.data
            this.setState({
                currentItem: item,
            })
        })
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
            currentId: item.id_public,
            currentItem: item,
        });
        else this.setState({
            currentId: null,
            currentItem: null,
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
        const { translation, swaMsg, globals, breadCrums } = this.props;
        const { currentItem, isLoaded, list } = this.state;

        const columns = [
            {
                name: <label>No. RADICACIÓN</label>,
                selector: 'id_public',
                sortable: true,
                filterable: true,
                cell: row => <label>{row.id_public}</label>
            },
            {
                name: <label>TIPO</label>,
                selector: 'type',
                sortable: true,
                filterable: true,
                cell: row => <label>{row.type}</label>
            },
            {
                name: <label>FECHA RADICACIÓN</label>,
                selector: 'date_start',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{dateParser(row.date_start)}</label>
            },
            {
                name: <label>FECHA EXPEDICIÓN</label>,
                selector: 'date_end',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{dateParser(row.date_end)}</label>
            },
            {
                name: <label>DOCUMENTO</label>,
                selector: 'nome_doc',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.nome_doc
                    ? <i class="text-success fas fa-check fa-2x"></i>
                    : <i class="text-danger fas fa-times fa-2x"></i>}</label>
            },
            {
                name: <label>ACCIÓN</label>,
                button: true,
                minWidth: '100px',
                cell: row => <>
                    <MDBTooltip title='Ver detalles' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                        <button onClick={() => this.toggle(row)} className="btn btn-sm btn-info m-0 p-2 shadow-none">
                            <i class="far fa-folder-open fa-2x" ></i></button></MDBTooltip>

                    <MDBTooltip title='Eliminar' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                        <button onClick={() => delete_nomenclature(row.id)} className="btn btn-sm btn-danger  m-0 p-2 shadow-none">
                            <i class="far fa-trash-alt fa-2x"></i></button></MDBTooltip>
                </>,
            },
        ]

        // CUSTOM STYLES FOR THE MODAL
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
                left: '5%',
                right: '5%',
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

        // CREATES A NEW LICENCE
        let delete_nomenclature = (id) => {
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
                    Nomenclature_Service.delete(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.refreshList();
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
        };

        let search = () => {
            let field = document.getElementById("nomen_search_0").value;
            let string = document.getElementById("nomen_search_1").value;
            if (string) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                this.retrieveSearch(field, string);
            } else {
                this.refreshList();
                this.setState({
                    list_search: [],
                    isLoadedSearch: false,
                })
            }
        };

        let get_cvs = (e) => {
            e.preventDefault();
            let date_a = document.getElementById("nomenclature_cvs_gen_1").value;
            let date_b = document.getElementById("nomenclature_cvs_gen_2").value;
            var date_start = date_a;
            var date_end = date_b;
            if (moment(date_a).diff(date_b) >= 0) {
                date_start = date_b;
                date_end = date_a;
            }
            this.setState({ date_start: date_start, date_end: date_end })

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });

            Nomenclature_Service.getExcellData(date_start, date_end)
                .then(response => {
                    if (response.data.length) {
                        gen_cvs(response.data)
                    } else {
                        MySwal.fire({
                            title: "NO SE ENCONTRÓ INFORMACIÓN",
                            text: `Para las fechas ${date_start} y ${date_end} no se encontró información, verifique las fechas de búsqueda.`,
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

        let gen_cvs = (data) => {
            let _data = data;
            const rows = [];

            const headRows = [
                "Nr PREDIAL",
                'Nr BOLETÍN',
                'DIRECCIÓN',
                'Nr DE NOMENCLATURAS A EXPEDIR',
                'FECHA DE RADICACIÓN',
                'FECHA DE EXPEDICIÓN',
                'ACCESO',
                'DESTINO',
                'USO',
            ];

            rows.push(headRows);
            for (var i = 0; i < _data.length; i++) {
                let row = [];
                row.push(_data[i].predial);
                row.push(_data[i].id_public);
                row.push(_data[i].address);
                row.push(_data[i].number);
                row.push(_data[i].date_start);
                row.push(_data[i].date_end);
                row.push(_data[i].details ? _data[i].details.replace(/[\r\n]+ */g, ' ') : ' ');
                row.push('Servicios Públicos y Notariales');
                row.push(_data[i].use);

                rows.push(row)
            }

            let csvContent = ""
                + rows.map(e => e.join(";")).join("\n");

            var csvData = new Blob([csvContent], { type: 'text/csv' }); //new way
            var csvUrl = URL.createObjectURL(csvData);

            var link = document.createElement("a");
            link.setAttribute("href", csvUrl);
            link.setAttribute("download", `REPORTE DE NOMENCLATURAS ${this.state.date_start} - ${this.state.date_end}.csv`);
            document.body.appendChild(link); // Required for FF
            MySwal.close()
            link.click();
        }
        return (
            <div className="Nomenclature container">
                <div className="row my-4 d-flex justify-content-center">
                    <MDBBreadcrumb className="mx-5">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem>
                            <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u9}</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>
                </div >

                <div className="row d-flex justify-content-center">
                    <div className="col-10">
                        <h1 className="text-center my-4">GESTIÓN DE NOMENCLATURAS</h1>
                        <hr />

                        <h2 class="text-uppercase text-center pb-2">ACCIONES</h2>
                        <div className="row">
                            <div className="col-4">
                                <div class="text-center py-4 mt-3">
                                    <button className="btn btn-success" onClick={() => this.toggle_new()} styes={{ zIndex: -1 }} l><i class="fas fa-plus-circle"></i> CREAR NOMENCLATURA </button>
                                </div>
                            </div>
                            <div className="col-4">
                                <MDBCard className="bg-card mb-3">
                                    <MDBCardBody>
                                        <MDBCardTitle className="text-center"> <h4>CONSULTAR NOMENCLATURA</h4></MDBCardTitle>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-info-circle"></i>
                                            </span>
                                            <select class="form-select" id="nomen_search_0" required>
                                                <option value="1">Numero de Radicado</option>
                                                <option value="2">Numero de Matricula Inmobiliaria</option>
                                                <option value="3">Numero de Identificación Predial/Catastral</option>
                                                <option value="4">Dirección Actual</option>
                                                <option value="5">C.C o NIT</option>
                                                <option value="6">Nombre Solicitante</option>
                                            </select>
                                        </div>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="far fa-comment-dots"></i>
                                            </span>
                                            <input type="text" class="form-control" id="nomen_search_1" placeholder="Buscar..." />
                                        </div>
                                        <div className="text-center py-2">
                                            <button type="button" className="btn btn-secondary shadow-none" onClick={() => search()}><i class="fas fa-search-plus"></i> CONSULTAR </button>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            </div>
                            <div className="col-4">
                                <MDBCard className="bg-card mb-3">
                                    <MDBCardBody>
                                        <MDBCardTitle className="text-center"> <h4>GENERAR EXCEL</h4></MDBCardTitle>
                                        <form onSubmit={get_cvs} id="fun_form_nomenclature_cvs_gen">
                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="far fa-calendar-alt"></i>
                                                </span>
                                                <input type="date" class="form-control" id="nomenclature_cvs_gen_1" required
                                                    defaultValue={moment().subtract(8, 'days').format('YYYY-MM-DD')} />
                                            </div>
                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="far fa-calendar-alt"></i>
                                                </span>
                                                <input type="date" class="form-control" id="nomenclature_cvs_gen_2" required
                                                    defaultValue={moment().format('YYYY-MM-DD')} />
                                            </div>
                                            <div className="text-center py-2">
                                                <button className="btn btn-success"><i class="far fa-file-excel"></i> DESCARGAR </button>
                                            </div>
                                        </form>
                                    </MDBCardBody>
                                </MDBCard>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row d-flex justify-content-center">
                    <div className="col-10">
                        <h2 class="text-uppercase text-center pb-2">Lista de Nomenclaturas</h2>
                        <div className="text-center">
                            {isLoaded ? (
                                <DataTable
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent={<h4 className="fw-bold">NO HAY INFORMACIÓN</h4>}
                                    striped="true"
                                    columns={columns}
                                    data={list}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[20, 50, 100]}
                                    className="data-table-component"
                                    noHeader
                            
                                />
                            ) : (
                                <div className="text-center">
                                    <h4 className="fw-bold">CARGANDO INFORMACIÓN...</h4>
                                </div>)}
                        </div>
                    </div>
                </div>

                <Modal contentLabel="VIEW/EDIT"
                    isOpen={this.state.modal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3><i class="far fa-edit"></i> ACTUALIZAR NOMENCLATURA: {this.state.currentId} </h3>
                        <MDBBtn className='btn-close' color='none' onClick={this.toggle}></MDBBtn>
                    </div>
                    <NOMENCLATURE_NEW
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        refreshList={this.refreshList}
                        closeModal={this.toggle_new}
                        currentItem={currentItem} />

                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => this.toggle()}><i class="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="NEW VIEW"
                    isOpen={this.state.new_modal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3><i class="fas fa-plus-circle"></i> NUEVA NOMENCLATURA </h3>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_new()}></MDBBtn>
                    </div>
                    <NOMENCLATURE_NEW
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        refreshList={this.refreshList}
                        closeModal={this.toggle_new} />
                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => this.toggle_new()}><i class="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

            </div >
        );
    }
}

export default NOMENCLATURE;