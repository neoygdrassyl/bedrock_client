import React, { Component } from 'react';
import { MDBBreadcrumb, MDBBreadcrumbItem, MDBBtn, MDBCard, MDBCardBody, MDBCardTitle, MDBTooltip } from 'mdb-react-ui-kit';
import { Link } from 'react-router-dom';
import SubmitService from '../../../services/submit.service';
import DataTable from 'react-data-table-component';
import { dateParser } from '../../../components/customClasses/typeParse';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import SUBTMIT_MANAGE from './submit_manage'
import Modal from 'react-modal';
import moment from 'moment';
import ListsCodes from '../../../components/jsons/fun6DocsList.json'

const MySwal = withReactContent(Swal);

class SUBMIT extends Component {
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
        SubmitService.getAll()
            .then(response => {
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
        const { translation, swaMsg, globals, breadCrums } = this.props;
        const { currentItem, currentId, isLoaded, list } = this.state;

        const columns = [
            {
                name: <label className="text-center">Nr. RADICACIÓN</label>,
                selector: 'id_public',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_public}</label>
            },
            {
                name: <label className="text-center">Nr. Licencia / Solicitud</label>,
                selector: 'id_related',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_related}</label>
            },
            {
                name: <label className="text-center">TIPO</label>,
                selector: 'type',
                sortable: true,
                filterable: true,
                minWidth: '300px',
                center: true,
                cell: row => <label>{row.type}</label>
            },
            {
                name: <label className="text-center">FECHA RADICACIÓN</label>,
                selector: row => row.date + ' - ' + row.time,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.date} - {row.time}</label>
            },
            {
                name: <label className="text-center">DOCUMENTO</label>,
                selector: 'sub_doc',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '60px',
                cell: row => <label>{row.sub_doc
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
                        <button onClick={() => delete_submit(row.id)} className="btn btn-sm btn-danger  m-0 p-2 shadow-none">
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
                zIndex: 1050,
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
        let delete_submit = (id) => {
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
                    SubmitService.delete(id)
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
            let field = document.getElementById("submit_search_0").value;
            let string = document.getElementById("submit_search_1").value;
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
            }
        };

        let generateCVS = () => {
            let _data = list;
            let limit_1 = document.getElementById('csv_limit_1').value;
            let limit_2 = document.getElementById('csv_limit_2').value;
            let state = [
                'OTRO',
                'RADICACIÓN SOLICITUD',
                'ASESORÍA TÉCNICA',
                'CORRECCIONES SOLICITUD',
                'TRAMITE',
                'PQRS',
            ]
            const rows = [];

            const headRows = [
                "No. Radicación",
                'No. Solicitud',
                'Tipo',
                'Tipo de Radicación',
                'Fecha y hora de ingreso',
                'Propietario',
                'Persona que entrega',
                'Número de Folios',
                'Descripción',
            ];

            rows.push(headRows);
            _data.map(d => {
                let id = d.id_public;
                let con = limit_1 <= id && id <= limit_2;
                let folios = 0
                let docs = [];
                if (d.sub_lists && d.sub_lists.length) {
                    for (let i = 0; i < d.sub_lists.length; i++) {
                        const element = d.sub_lists[i].list_pages;
                        var pages = element ? element.split(",") : [];
                        pages.map(p => folios += Number(p));

                        const doc_codes =  d.sub_lists[i].list_code;
                         var codes = doc_codes ? doc_codes.split(",") : [];
                         codes.map(c => {
                            if ( ListsCodes[c] ) docs.push(ListsCodes[c])
                         });
                        

                    }
                }

                if (con) {
                    let row = [];
                    row.push(d.id_public);
                    row.push(d.id_related);
                    row.push(d.type);
                    row.push(state[d.list_type] ?? '');
                    row.push(`${d.date} - ${d.time ?? ''}`);
                    row.push(d.owner);
                    row.push(d.name_retriever);
                    row.push(folios > 0 ? folios : "");
                    row.push(docs.join(", "));
                    rows.push(row)
                }
            })

            let csvContent = "data:text/csv;charset=utf-8,"
                + rows.map(e => e.join(";")).join("\n");

            var encodedUri = encodeURI(csvContent);
            const fixedEncodedURI = encodedUri.replaceAll('#', '%23').replaceAll('°', 'r');

            var link = document.createElement("a");
            link.setAttribute("href", fixedEncodedURI);
            link.setAttribute("download", `REPORTE_VENTANILLA_UNICA_${limit_1}_${limit_2}.csv`);
            document.body.appendChild(link); // Required for FF

            link.click();
        }
        return (
            <div className="submit  container">
                <div className="col-12 d-flex justify-content-start p-0">
                    <MDBBreadcrumb className="mb-0 p-0 ms-0">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem>
                            <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u10}</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>
                </div >

                <div className="row d-flex justify-content-center">
                    <div className="col-10">
                        <h1 className="text-center my-4">VENTANILLA ÚNICA</h1>
                        <hr />
                        <h2 class="text-uppercase text-center pb-2">ACCIONES</h2>

                        <div className="row">
                            <div className="col-4">
                                <div class="text-center py-4 mt-3">
                                    <button className="btn btn-success" onClick={() => this.toggle_new()} styes={{ zIndex: -1 }} l><i class="fas fa-plus-circle"></i> NUEVA ENTRADA </button>
                                </div>
                            </div>
                            <div className="col-4">
                                <MDBCard className="bg-card mb-3">
                                    <MDBCardBody>
                                        <MDBCardTitle className="text-center"> <h4>CONSULTAR</h4></MDBCardTitle>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-info-circle"></i>
                                            </span>
                                            <select class="form-select" id="submit_search_0" required>
                                                <option value="1">Número de radicado VR</option>
                                                <option value="2">Número de Licencia / Solicitud</option>
                                                <option value="3">Propietario</option>
                                                <option value="4">Persona que Entrega</option>
                                                <option value="5">C.C Persona que Entrega</option>
                                            </select>
                                        </div>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="far fa-comment-dots"></i>
                                            </span>
                                            <input type="text" class="form-control" id="submit_search_1" placeholder="Buscar..." />
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
                                        <MDBCardTitle className="text-center"> <h4>DOCUMENTO CSV</h4></MDBCardTitle>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-hashtag"></i>
                                            </span>
                                            <input type="text" class="form-control" id="csv_limit_1" placeholder="Limite inferior"
                                                defaultValue={`VR${moment().format('YY')}-0001`} />
                                        </div>
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-hashtag"></i>
                                            </span>
                                            <input type="text" class="form-control" id="csv_limit_2" placeholder="Limite superior"
                                                defaultValue={`VR${moment().format('YY')}-9999`} />
                                        </div>
                                        <div className="text-center py-2">
                                            <button type="button" className="btn btn-success shadow-none" onClick={() => generateCVS()}><i class="fas fa-table"></i> GENERAR CSV </button>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            </div>
                        </div>

                    </div >
                    <div className="row d-flex justify-content-center">
                        <div className="col-12">
                            <h2 class="text-uppercase text-center pb-2">Lista de entradas</h2>
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
                                        <h4 className="fw-bold">CARGANDO INFORMACIÓN...</h4>
                                    </div>)}
                            </div>

                        </div >
                    </div >
                </div >

                <Modal contentLabel="VIEW/EDIT"
                    isOpen={this.state.modal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3><i class="far fa-edit"></i> ACTUALIZAR ENTRADA: {this.state.currentIdPublic} </h3>
                        <MDBBtn className='btn-close' color='none' onClick={this.toggle}></MDBBtn>
                    </div>
                    <SUBTMIT_MANAGE
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        refreshList={this.refreshList}
                        closeModal={this.toggle_new}
                        currentId={currentId}
                        edit />

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
                        <h3><i class="fas fa-plus-circle"></i> NUEVA ENTRADA </h3>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_new()}></MDBBtn>
                    </div>
                    <SUBTMIT_MANAGE
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

export default SUBMIT;