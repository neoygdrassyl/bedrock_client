import React, { Component } from 'react';
import AppointmentService from '../../services/appointments.service'
import UserslDataService from '../../services/users.service'
import {
    MDBRow, MDBCol, MDBCard, MDBCardBody,
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter, MDBBreadcrumb, MDBBreadcrumbItem
} from 'mdb-react-ui-kit';
import { Link } from "react-router-dom";
import DataTable from 'react-data-table-component';
import Collapsible from 'react-collapsible';
import Modal from 'react-modal';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { dateParser } from '../../components/customClasses/typeParse'


const moment = require('moment');
const MySwal = withReactContent(Swal)

class Appointments extends Component {
    constructor(props) {
        super(props);
        this.retrievePublish = this.retrievePublish.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.loadUsers = this.loadUsers.bind(this);
        this.state = {
            error: null,
            isLoaded: false,
            currentItem: null,
            currentIndex: -1,
            modal: false,
            modal_edit: false,
            items: [],
            items_2: [],
            items_3: [],
            users: [],
        };
    }
    componentDidMount() {
        this.retrievePublish();
        this.loadUsers();

    }
    retrievePublish() {
        AppointmentService.getAll()
            .then(response => {
                let list = [];
                let list_2 = [];
                let list_3 = [];
                response.data.map((item, i) => {
                    let today = moment().format("YYYY-MM-DD")
                    if (moment(today).diff(item.date, 'days') < 0) {
                        list.push(item);
                    }
                    if (moment(today).diff(item.date, 'days') == 0) {
                        list_2.push(item);
                    }
                    if (moment(today).diff(item.date, 'days') > 0) {
                        list_3.push(item);
                    }
                });
                this.setState({
                    items: list,
                    items_2: list_2,
                    items_3: list_3,
                    isLoaded: true,
                });
            })
            .catch(e => {
                console.log(e);
            });
    }
    refreshList() {
        this.retrievePublish();
        this.setState({
            currentItem: null,
            currentIndex: -1,
        });
    }
    loadUsers() {
        UserslDataService.getAllWorkers()
        .then(response => {
            if(response.data) this.setState({users: response.data.filter(user => user.active == 1)})
        })
        .catch(console.log);

    }
    toggle = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    getToggle = () => {
        return this.state.modal;
    }
    setItem(item) {
        this.setState({
            currentItem: item,
            modal: !this.state.modal,
        });
    }
    toggle_edit = () => {
        this.setState({
            modal_edit: !this.state.modal_edit
        });
    }
    getToggle_edit = () => {
        return this.state.modal_edit;
    }
    setItem_edit(item) {
        this.setState({
            currentItem: item,
        });
        this.toggle_edit()
    }
    render() {
        const { translation, globals, breadCrums, swaMsg } = this.props;
        const { currentItem, isLoaded, items, items_2, items_3, users } = this.state;
        const columns = [
            {
                name: <h4>CONSECUTIVO</h4>,
                selector: 'id',
                sortable: true,
                filterable: true,
                minWidth: '40px',
                center: true,
                cell: row => <label>{row.id}</label>
            },
            {
                name: <h4>FECHA</h4>,
                selector: 'date',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{dateParser(row.date)}</label>
            },
            {
                name: <h4>HORA</h4>,
                selector: 'time',
                sortable: true,
                center: true,
                cell: row => <label>{row.time}</label>
            },
            {
                name: <h4>PROFESIONAL</h4>,
                selector: 'profesional',
                sortable: true,
                center: true,
                cell: row => <label>{row.profesional}</label>
            },
            {
                name: <h4>OBSERVACIONES</h4>,
                selector: 'profesional',
                sortable: true,
                center: true,
                minWidth: '100px',
                cell: row => <label>{row.details}</label>
            },
            {
                name: <h4>ASISTENCIA SEÑAS</h4>,
                selector: 'profesional',
                sortable: true,
                center: true,
                minWidth: '250px',
                cell: row => <label>{row.accesibility == true ? <label className='text-success fw-bold'>Si</label> : 'No'}</label>
            },
            {
                name: <h4>ACCIÓN</h4>,
                button: true,
                minWidth: '120px',
                ignoreCSV: true,
                cell: row => <>
                    {moment().diff(row.date, 'days') <= 0
                        ? <button className="btn btn-secondary btn-sm me-1" onClick={() => this.setItem_edit(row)}><i class="far fa-edit fa-2x"></i></button>
                        : ""}
                    <button className="btn btn-info btn-sm" onClick={() => this.setItem(row)}><i class="fas fa-info-circle fa-2x"></i></button>
                </>
                ,
            },
        ]
        const customStyles = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.75)'
            },
            content: {
                position: 'absolute',
                top: '40px',
                left: '20%',
                right: 'auto',
                bottom: '40px',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                marginRight: '20%',
                width: '1000px',

            }, zIndex: '4'
        };

        let app_edit = (e) => {
            e.preventDefault();
            var formData = new FormData();

            const profesional = document.getElementById("app_worker").value;
            formData.set('profesional', profesional);

            if (profesional == 'LUIS PARRA') formData.set('profesional_id', 0);
            if (profesional == 'CARLOS ULLOA') formData.set('profesional_id', 1);
            if (profesional == 'MARIA MARGARITA') formData.set('profesional_id', 2);
            if (profesional == 'MAYRA CEPEDA') formData.set('profesional_id', 3);

            const date = document.getElementById("app_date").value;
            formData.set('date', date);
            const time = document.getElementById("app_time").value;
            formData.set('time', time);
            const appointment_type = document.getElementById("app_type").value;
            formData.set('appointment_type', appointment_type);
            const motive = document.getElementById("app_motive").value;
            formData.set('motive', motive);
            const content = document.getElementById("app_content").value;
            formData.set('content', content);
            const details = document.getElementById("app_detail").value;
            formData.set('details', details);

            AppointmentService.update(currentItem.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.scheduling_success_title,
                            text: swaMsg.scheduling_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        })
                        this.toggle_edit();
                        this.retrievePublish();
                    } else {
                        MySwal.fire({
                            title: swaMsg.scheduling_error_title,
                            text: swaMsg.text_error,
                            footer: swaMsg.text_footer,
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    MySwal.fire({
                        title: swaMsg.scheduling_error_title,
                        text: swaMsg.text_error,
                        footer: swaMsg.text_footer,
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });

        }
      
        let generateCVS = (_data, _name) => {
            var rows = [];
            let _columns = [...columns]
            const headRows = _columns.filter(c => c.ignoreCSV == undefined).map(c => { return c.name.props.children })
            rows = _data.map(d =>
                _columns.filter(c => c.ignoreCSV == undefined).map(c => {
                    if (c.cvsCB) return (String(c.cvsCB(d) ?? '')).replace(/[\n\r]+ */g, ' ')
                    else return (String(c.cell(d).props.children ?? '')).replace(/[\n\r]+ */g, ' ')
                }
                )
            );

            rows.unshift(headRows);

            let csvContent = "data:text/csv;charset=utf-8,"
                + rows.map(e => e.join(";")).join("\n");


            var encodedUri = encodeURI(csvContent);
            const fixedEncodedURI = encodedUri.replaceAll('#', '%23').replaceAll('°', 'r');

            var link = document.createElement("a");
            link.setAttribute("href", fixedEncodedURI);
            link.setAttribute("download", `${_name ?? 'LICENCIAS URBANISTICAS'}.csv`);
            document.body.appendChild(link); // Required for FF

            link.click();
        }

        return (

            <div className="Publish container">
                <div className="row my-4 d-flex justify-content-center">
                    <MDBBreadcrumb className="mx-5">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem>
                            <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u5}</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>
                    <div className="col-lg-12 col-md-10">
                        <h1 className="text-center my-4">CALENDARIO DE CITAS</h1>
                        <hr />

                        <div className="text-center">
                            <h2 className="text-center my-4">Citas para hoy</h2>
                            {isLoaded ? (
                                <DataTable
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent="No hay citas para este dia"
                                    striped="true"
                                    columns={columns}
                                    data={items_2}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[20, 50, 100]}
                                    className="data-table-component"
                                    noHeader
                                   
                                />
                            ) : (
                                <div>
                                    <h4>No Data Retrieved</h4>
                                </div>)}
                        </div>
                        <hr />
                        <div className="text-center">
                            <h2 className="text-center my-4">Citas en proximidad</h2>
                            {isLoaded ? (
                                <DataTable
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent="No hay citas proximas"
                                    striped="true"
                                    columns={columns}
                                    data={items}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[20, 50, 100]}
                                    className="data-table-component"
                                    noHeader
                                />
                            ) : (
                                <div>
                                    <h4>No Data Retrieved</h4>
                                </div>)}
                        </div>
                        <hr />
                        <div className="text-center">
                            <h2 className="text-center my-4">Citas pasadas</h2>
                            <Collapsible trigger={<><label className="m-2"> </label>
                                <button className="btn btn-warning btn-sm my-2"><i class="fas fa-plus"></i> Ver Lista</button></>}>
                                {isLoaded ? (
                                    <>
                                    <DataTable
                                        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                        noDataComponent="No hay citas pasadas"
                                        striped="true"
                                        columns={columns}
                                        data={items_3}
                                        highlightOnHover
                                        pagination
                                        paginationPerPage={20}
                                        paginationRowsPerPageOptions={[20, 50, 100]}
                                        className="data-table-component"
                                        defaultSortFieldId={1}
                                        defaultSortAsc={false}
                                        title={
                                            <div class="d-flex justify-content-between">
                                                <div><h5>CITAS PASADAS</h5></div>
                                                <div><MDBBtn outline color='success' size="sm" onClick={() => { generateCVS(items_3, 'CITAS') }}
                                                ><i class="fas fa-file-csv"></i> DESCARGAR CSV</MDBBtn></div>
                                            </div>
                                        }
                                    />
                                    </>
                                ) : (
                                    <div>
                                        <h4>No Data Retrieved</h4>
                                    </div>)}
                            </Collapsible>
                        </div>
                    </div>
                </div>
                <MDBModal show={this.getToggle()} tabIndex='-2' staticBackdrop >
                    <MDBModalDialog size="lg">
                        <MDBModalContent className="container-primary">
                            <MDBModalHeader>
                                <MDBModalTitle><h2 className="text-center"><i class="far fa-file-alt"></i> DETALLES DE LA CITA {currentItem ? currentItem.id : ''} </h2></MDBModalTitle>
                                <MDBBtn className='btn-close' color='none' onClick={this.toggle}></MDBBtn>
                            </MDBModalHeader>
                            <MDBModalBody>
                                <MDBCard className="bg-card">
                                    <MDBCardBody>
                                        <MDBRow>
                                            <MDBCol md="6">
                                                <table className="table table-bordered table-sm table-hover  text-start table-light">
                                                    <tbody>
                                                        {currentItem ? <>
                                                            <tr className="Collapsible text-center">
                                                                <th colSpan="2" ><label>Información del Solicitante</label></th>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Nombre y Apellido(s)</label></td>
                                                                <td><label className="fw-bold">{currentItem.name}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Tipo de Documentos</label></td>
                                                                <td><label className="fw-bold">{globals.form_type_id[currentItem.type_id]}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Número de Documento</label></td>
                                                                <td><label className="fw-bold">{currentItem.number_id}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Email de Contacto</label></td>
                                                                <td><label className="fw-bold">{currentItem.email}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Número de Contacto</label></td>
                                                                <td><label className="fw-bold">{currentItem.number_mobile}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Requiere asistencia por señas</label></td>
                                                                <td><label className="fw-bold">{currentItem.accesibility == true ? <label className='text-success'>Si</label> : 'No'}</label></td>
                                                            </tr>
                                                        </> : ""}
                                                    </tbody>
                                                </table>
                                            </MDBCol>
                                            <MDBCol md="6">
                                                <table className="table table-bordered table-sm table-hover  text-start table-light">
                                                    <tbody>
                                                        {currentItem ? <>
                                                            <tr className="Collapsible text-center">
                                                                <th colSpan="2" ><label>Información de la cita</label></th>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Nombre Profesional</label></td>
                                                                <td><label className="fw-bold">{currentItem.profesional}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Fecha</label></td>
                                                                <td><label className="fw-bold">{dateParser(currentItem.date)}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Hora</label></td>
                                                                <td><label className="fw-bold">{currentItem.time}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Presentación</label></td>
                                                                <td><label className="fw-bold">{currentItem.appointment_type ? "Presencial" : "Virtual"}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Tipo de Cita</label></td>
                                                                <td><label className="fw-bold">{currentItem.motive}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="2"><label>Descripción</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="2"><label className="fw-bold">{currentItem.content}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="2"><label>Observaciones</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="2"><label className="fw-bold">{currentItem.details}</label></td>
                                                            </tr>
                                                        </> : ""}
                                                    </tbody>
                                                </table>
                                            </MDBCol>
                                        </MDBRow>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBModalBody>
                            <MDBModalFooter>
                                <MDBBtn color='info' onClick={this.toggle}>
                                    <h4 className="pt-2"><i class="fas fa-times-circle"></i> Cerrar</h4>
                                </MDBBtn>
                            </MDBModalFooter>
                        </MDBModalContent>
                    </MDBModalDialog>
                </MDBModal>

                <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={this.state.modal_edit}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-file-alt"></i>ACTUALIZAR LA CITA {currentItem ? currentItem.id : ''} </label>
                        <MDBBtn className='btn-close' color='none' onClick={this.toggle_edit}></MDBBtn>
                    </div>
                    <form id="appointment_edit" onSubmit={app_edit}>
                        <MDBRow>
                            <MDBCol md="6">
                                <table className="table table-bordered table-sm table-hover  text-start table-light">
                                    <tbody>
                                        {currentItem ? <>
                                            <tr className="Collapsible text-center">
                                                <th colSpan="2" ><label>Información del Solicitante</label></th>
                                            </tr>
                                            <tr>
                                                <td><label>Nombre y Apellido(s)</label></td>
                                                <td><label className="fw-bold">{currentItem.name}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Tipo de Documentos</label></td>
                                                <td><label className="fw-bold">{globals.form_type_id[currentItem.type_id]}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Número de Documento</label></td>
                                                <td><label className="fw-bold">{currentItem.number_id}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Email de Contacto</label></td>
                                                <td><label className="fw-bold">{currentItem.email}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Número de Contacto</label></td>
                                                <td><label className="fw-bold">{currentItem.number_mobile}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Requiere asistencia por señas</label></td>
                                                <td><label className="fw-bold">{currentItem.accesibility == true ? <label className='text-success fw-bold'>Si</label> : 'No'}</label></td>
                                            </tr>
                                        </> : ""}
                                    </tbody>
                                </table>
                            </MDBCol>
                            <MDBCol md="6">
                                <table className="table table-bordered table-sm table-hover  text-start table-light">
                                    <tbody>
                                        {currentItem ? <>
                                            <tr className="Collapsible text-center">
                                                <th colSpan="2" ><label>Información de la cita</label></th>
                                            </tr>
                                            <tr>
                                                <td><label>Nombre Profesional</label></td>
                                                <td>
                                                    <select class="form-select" id="app_worker" defaultValue={(currentItem.profesional).normalize("NFD").replace(/[\u0300-\u036f]/g, "")}>
                                                        {users.map(user => <option>{`${user.name.toUpperCase()} ${user.surname.toUpperCase()}`}</option>)}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><label>Fecha</label></td>
                                                <td>
                                                    <input type="date" max="2100-01-01" class="form-control" id="app_date"
                                                        defaultValue={currentItem.date} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><label>Hora</label></td>
                                                <td>
                                                    <input type="time" class="form-control" id="app_time"
                                                        defaultValue={moment(currentItem.time, 'hh:mm').format("HH:mm")} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><label>Presentación</label></td>
                                                <td>
                                                    <select class="form-select" id="app_type" defaultValue={currentItem.appointment_type ? 1 : 0}>
                                                        <option value="0">{translation.form_appointment_type_0}</option>
                                                        <option value="1">{translation.form_appointment_type_1}</option>
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><label>Tipo de Cita</label></td>
                                                <td>
                                                    <select class="form-select" id="app_motive" defaultValue={currentItem.motive}>
                                                        <option>{translation.form_motive_0}</option>
                                                        <option>{translation.form_motive_1}</option>
                                                        <option>{translation.form_motive_2}</option>
                                                        <option>{translation.form_motive_3}</option>
                                                        <option>{translation.form_motive_4}</option>
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2"><label>Descripción</label></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2">
                                                    <textarea rows="3" defaultValue={currentItem.content} id="app_content" class="form-control"></textarea>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2"><label>Observaciones</label></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2">
                                                    <textarea rows="3" defaultValue={currentItem.details} id="app_detail" class="form-control"></textarea>
                                                </td>
                                            </tr>
                                        </> : ""}
                                    </tbody>
                                </table>
                            </MDBCol>
                        </MDBRow>

                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-secondary me-1"><i class="far fa-edit"></i> GUARDAR CAMBIOS </button>
                            <MDBBtn className="btn btn-lg btn-info" onClick={() => this.toggle_edit()}><i class="fas fa-times-circle"></i> CERRAR </MDBBtn>
                        </div>
                    </form>
                </Modal>

            </div >
        );
    }
}

export default Appointments;