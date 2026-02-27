import { useState, useEffect, useCallback } from 'react';
import SealsService from '../../services/seal.service'
import CustomService from '../../services/custom.service'
import {
    MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle,
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter, MDBBreadcrumb, MDBBreadcrumbItem
} from '../../components/ui';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import { formsParser1_exlucde2, dateParser, formsParser1 } from '../../components/customClasses/typeParse'
const moment = require('moment');
const MySwal = withReactContent(Swal);


function Seals({ translation, swaMsg, breadCrums }) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [modal, setModal] = useState(false);
    const [items, setItems] = useState([]);
    const [helpText, setHelpText] = useState(<label className="text-dark">Ingrese numero de radicado</label>);
    const [allowCreate, setAllowCreate] = useState(false);
    const [action, setAction] = useState("create");

    const retrievePublish = useCallback(() => {
        SealsService.getAll()
            .then(response => {
                setItems(response.data);
                setIsLoaded(true);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    useEffect(() => {
        retrievePublish();
    }, [retrievePublish]);

    const retrieveSearch = (field, string) => {
        SealsService.getSearch(field, string)
            .then(response => {
                MySwal.close();
                if (response.data.length) {
                    setItem(response.data[0])
                } else {
                    MySwal.fire({
                        title: "NO SE ENCONTRO SELLO",
                        text: "Asegurese de que el sello que busca existe y cullo numero de radicacion es valido",
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch(e => {
                console.log(e);
            });
    };

    const refreshList = () => {
        retrievePublish();
        setCurrentItem(null);
        setCurrentIndex(-1);
    };

    const toggle = () => {
        setModal(prev => !prev);
    };

    const getToggle = () => {
        return modal;
    };

    const setItem = (item) => {
        setCurrentItem(item);
        setModal(prev => !prev);
        SealsService.getParent(item.fun_0.id_public)
            .then(response => {
                if (response.data.length > 0) {
                    let modalidaObject = response.data[0].fun_1s;
                    if (modalidaObject.length == 0) {
                        document.getElementById("t_11").value = "VACIO, ESTO NO DEBERIA APARECER AQUI, CONTACTAR CON EL INGERNIERO";
                    }
                    if (modalidaObject.length == 1) {
                        let string = formsParser1_exlucde2(modalidaObject[0])
                        document.getElementById("t_11").value = string;
                    }
                    if (modalidaObject.length > 1) {
                        let string = formsParser1_exlucde2(modalidaObject[modalidaObject.length - 1])
                        document.getElementById("t_11").value = string;
                    }
                } else {
                    document.getElementById("t_11").value = "VACIO, ESTO NO DEBERIA APARECER AQUI, CONTACTAR CON EL INGERNIERO";
                }
            })
            .catch(e => {
                document.getElementById("t_11").value = "VACIO, ESTO NO DEBERIA APARECER AQUI, CONTACTAR CON EL INGERNIERO";
                console.log(e);
            });
    };
        const columns = [
            {
                name: <h3>No. Radicado</h3>,
                selector: row => row.id_request,
                sortable: true,
                filterable: true,
                minWidth: '100px',
                cell: row => <p className="pt-3">{row.fun_0.id_public}</p>
            },
            {
                name: <h3>Sello Consecutivo</h3>,
                selector: row => row.id_public,
                sortable: true,
                cell: row => <p className="pt-3">{row.id_public}</p>
            },
            {
                name: <h3>Fecha de Expedición</h3>,
                selector: row => row.date,
                sortable: true,
                cell: row => <p className="pt-3 text-center">{dateParser(row.fun_0.date)}</p>
            },
            {
                name: <h3>Acción</h3>,
                button: true,
                minWidth: '100px',
                cell: row =>
                    <button className="btn btn-danger btn-sm" onClick={() => setItem(row)}><i class="fas fa-file-alt"></i> Ver</button>
                ,
            },
        ]

        var formData = new FormData();

        let handleSubmit = (event) => {
            event.preventDefault();
            formData = new FormData();
            console.log(allowCreate)
            if (allowCreate) {
                let blueprints = document.getElementById("blueprints").value;
                let drives = document.getElementById("drives").value;
                let folders = document.getElementById("folders").value;
                formData.set('blueprints', blueprints);
                formData.set('drives', drives);
                formData.set('folders', folders);
                let area = document.getElementById("s_4").value;
                formData.set('area', area);
                let id_public = document.getElementById("s_0").value;
                formData.set('id_public', id_public);
                let fun0Id = document.getElementById("f_0").value;
                formData.set('fun0Id', fun0Id);
                let date = document.getElementById("f_03").value;
                formData.set('date', date)
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                if(action == "create"){
                SealsService.create(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            document.getElementById("app-form").reset();
                            formData = new FormData();
                            refreshList();
                        } else {
                            // TODO
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    });
                }else if(action == "edit"){
                    let id = document.getElementById("s_1").value
                    SealsService.update(id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            document.getElementById("app-form").reset();
                            formData = new FormData();
                            refreshList();
                        } else {
                            // TODO
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    });
                }
            } else {
                MySwal.fire({
                    title: "ESTA SOLICITUD NO ES VALIDA",
                    text: "Asegurese de que la solicitud solocitada sea valida y correcta.",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
            }

        };

        // GENERATES AND GETS PDF SEAL
        let generate = (type) => {
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            formData = new FormData();
            // DATA FROM THE PARENT
            let id_request = currentItem.fun_0.id_public;
            formData.set('id_request', id_request);
            let mode = document.getElementById("t_11").value
            formData.set('mode', mode);
            let date = document.getElementById("gen_03").value
            formData.set('date', date);
            // DATA ON DEMAND
            let _type = type ? "ORIGINAL" : "TITULAR";
            formData.set('type', _type);
            // DATA FROM THE CURRENT ITEM 
            let area = currentItem.area;
            formData.set('area', area);
            let blueprints = currentItem.blueprints;
            formData.set('blueprints', blueprints);
            let drives = currentItem.drives;
            formData.set('drives', drives);
            let folders = currentItem.folders;
            formData.set('folders', folders);
            let id_public = currentItem.id_public;
            formData.set('id_public', id_public);

            CustomService.generate(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(import.meta.env.VITE_API_URL + "/seal/" + "Sello_" + id_request + ".pdf");
                        document.getElementById("app-form").reset();
                        formData = new FormData();
                        refreshList();
                        MySwal.close();
                    } else {
                        // TODO
                    }
                })
                .catch(e => {
                    console.log(e);
                });
            toggle();
        };

        let loadParent = () => {
            let id_public = document.getElementById("f_02").value;
            setHelpText(<label className="text-warning">Buscando...</label>)
            SealsService.getParent(id_public)
                .then(response => {
                    if (response.data.length > 0) {
                        
                        if (response.data[0].seal) {
                            setHelpText(<label className="text-warning">Ya existe un sello para esta solicitud, si se crea el sello, este será reemplazado por el nuevo sello.</label>);
                            setAllowCreate(true);
                            setAction("edit");
                            document.getElementById("s_1").value = response.data[0].seal.id;
                            document.getElementById("s_4").value = response.data[0].seal.area;
                            document.getElementById("s_0").value = response.data[0].seal.id_public;
                            document.getElementById("blueprints").value = response.data[0].seal.blueprints;
                            document.getElementById("drives").value = response.data[0].seal.drives;
                            document.getElementById("folders").value = response.data[0].seal.folders;
                        } else {
                            setHelpText(<label className="text-success">Se ha encontrado esta Solicitud</label>);
                            setAllowCreate(true);
                            setAction("create");
                            document.getElementById("s_1").value = "";
                            document.getElementById("s_4").value = "";
                            document.getElementById("s_0").value = "";
                            document.getElementById("blueprints").value = "";
                            document.getElementById("drives").value = "";
                            document.getElementById("folders").value = "";
                        }
                        
                            let date = moment(response.data[0].date).format("YYYY-MM-DD");
                            let parent_id = response.data[0].id
                            document.getElementById("f_03").value = date;
                            document.getElementById("f_0").value = parent_id;
                            let modalidaObject = response.data[0].fun_1s;
                            if (modalidaObject.length == 0) {
                                setHelpText(<label className="text-warning">Se ha encontrado esta Solicitud, pero no se ha especificado su modalidad</label>);
                                setAllowCreate(false);
                            }
                            if (modalidaObject.length == 1) {
                                let string = formsParser1_exlucde2(modalidaObject[0])
                                document.getElementById("f_11").value = string;
                            }
                            if (modalidaObject.length > 1) {
                                if (response.data[0].seal) {
                                    setHelpText(<label className="text-success">Se ha encontrado esta Solicitud, con un total de ({modalidaObject.length}) Versiones, se usara su ultima version. Ya existe un sello para esta solicitud, si se crea el sello, este será reemplazado por el nuevo sello.</label>);
                                    setAction("edit");
                                }else{
                                    setHelpText(<label className="text-success">Se ha encontrado esta Solicitud, con un total de ({modalidaObject.length}) Versiones, se usara su ultima version.</label>);
                                    setAction("create");
                                }
                                
                                let string = formsParser1_exlucde2(modalidaObject[modalidaObject.length - 1])
                                document.getElementById("f_11").value = string;
                            }
                        
                    } else {
                        setHelpText(<label className="text-danger">No se encontraron datos para esta solicitud</label>);
                        setAllowCreate(false);
                        document.getElementById("f_03").value = null;
                        document.getElementById("f_11").value = null;
                        document.getElementById("f_0").value = "";
                        document.getElementById("s_1").value = "";
                    }
                })
                .catch(e => {
                    setHelpText(<label className="text-danger">Un error se ha presentado.</label>);
                    setAllowCreate(false);
                    console.log(e);
                });

        }
        let search = (event) => {
            event.preventDefault();
            let field = document.getElementById("search_0").value;
            let string = document.getElementById("search_1").value;
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            retrieveSearch(field, string)

        }
        return (

            <div className="Publish container">
                <div className="row mb-4 d-flex justify-content-center">
                    <div className="col-12 d-flex justify-content-start p-0">
                        <MDBBreadcrumb className="mx-5">
                            <MDBBreadcrumbItem>
                                <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                            </MDBBreadcrumbItem>
                            <MDBBreadcrumbItem>
                                <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                            </MDBBreadcrumbItem>
                            <MDBBreadcrumbItem active><i class="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u4}</label></MDBBreadcrumbItem>
                        </MDBBreadcrumb>
                    </div>
                    <div className="col-lg-11 col-md-12">
                        <h1 className="text-center my-4">SELLOS</h1>
                        <hr />
                        <MDBRow>
                            <MDBCol md="5">

                                <MDBCard className="bg-card">
                                    <MDBCardTitle><h2 className="text-center my-4">Generar Sellos</h2></MDBCardTitle>
                                    <MDBCardBody>
                                        <form onSubmit={handleSubmit} id="app-form">
                                            <input type="hidden" id="f_0" />
                                            <input type="hidden" id="s_1" />
                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-hashtag"></i>
                                                </span>
                                                <input type="text" class="form-control" defaultValue="68001-1-" id="f_02"
                                                    onChange={() => loadParent()} />
                                            </div>
                                            <p className="fw-normal lead"><ul>{helpText}</ul></p>

                                            <div class="input-group mb-1">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="far fa-check-circle"></i>
                                                </span>
                                                <input type="text" class="form-control" value="Modalidad" disabled />
                                            </div>
                                            <textarea class="form-control mb-3" rows="3" id="f_11" ></textarea>

                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="far fa-calendar-alt"></i>
                                                </span>
                                                <input type="date" class="form-control" placeholder="Fecha de Expedicion" id="f_03"
                                                    onChange={(e) => formData.set('date', e.target.value)} />
                                            </div>

                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-cube"></i>
                                                </span>
                                                <input type="number" min="1" step="0.01" class="form-control" placeholder="Area Total" id="s_4"
                                                    required onChange={(e) => formData.set('area', e.target.value)} />
                                            </div>

                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-hashtag"></i>
                                                </span>
                                                <input type="text" class="form-control" placeholder="Consecutivo Sello" id="s_0"
                                                    required onChange={(e) => formData.set('id_public', e.target.value)} />
                                            </div>
                                            <hr />
                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-ruler-combined"></i>
                                                </span>
                                                <input type="number" min="0" step="1" class="form-control" placeholder="Planos" id="blueprints"
                                                    required onChange={(e) => { formData.set('blueprints', e.target.value) }} />
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-database"></i>
                                                </span>
                                                <input type="number" min="0" step="1" class="form-control" placeholder="Memorias" id="drives"
                                                    required onChange={(e) => formData.set('drives', e.target.value)} />
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-file-invoice"></i>
                                                </span>
                                                <input type="number" min="0" step="1" class="form-control" placeholder="Estudios" id="folders"
                                                    required onChange={(e) => formData.set('folders', e.target.value)} />
                                            </div>
                                            <div className="text-center py-4 mt-3">
                                                <button className="btn btn-lg btn-info"><i class="fas fa-file-import"></i> CREAR </button>
                                            </div>

                                        </form>
                                    </MDBCardBody>
                                </MDBCard>

                                <MDBCard className="bg-card my-3">
                                    <MDBCardTitle><h2 className="text-center my-4">Buscar Sellos</h2></MDBCardTitle>
                                    <MDBCardBody>
                                        <form onSubmit={search} id="app-form">
                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-info-circle"></i>
                                                </span>
                                                <select class="form-select" id="search_0" required>
                                                    <option value="1">Numero de Radicado</option>
                                                    <option value="2">Consecutivo Sello</option>
                                                </select>
                                            </div>
                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="far fa-comment-dots"></i>
                                                </span>
                                                <input type="text" class="form-control" id="search_1" required />
                                            </div>
                                            <div className="text-center py-4 mt-3">
                                                <button className="btn btn-lg btn-secondary"><i class="fas fa-search-plus"></i> CONSULTAR </button>
                                            </div>
                                        </form>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                            <MDBCol md="7">
                                <div className="text-center">
                                    <h2 className="text-center my-4">Listado de Sellos</h2>
                                    {isLoaded ? (
                                        <DataTable
                                            paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                            noDataComponent="No hay publicaciones en estos momentos"
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
                            </MDBCol>
                        </MDBRow>
                    </div>
                </div>
                <MDBModal show={getToggle()} tabIndex='-2' staticBackdrop >
                    <MDBModalDialog size="md">
                        <MDBModalContent className="container-primary">
                            <MDBModalHeader>
                                <MDBModalTitle><h2 className="text-center"><i class="far fa-file-alt"></i> DETALLES DE EL SELLO: {currentItem ? currentItem.id_public : ''} </h2></MDBModalTitle>
                                <MDBBtn className='btn-close' color='none' onClick={toggle}></MDBBtn>
                            </MDBModalHeader>
                            <MDBModalBody>
                                <MDBCard className="bg-card">
                                    <MDBCardBody>
                                        <table className="table table-bordered table-sm table-hover  text-start table-light">
                                            <tbody>
                                                {currentItem ? <>
                                                    <tr>
                                                        <td><label >Nr. de Solicitud</label></td>
                                                        <td><label className="fw-bold">{currentItem.fun_0.id_public}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Consecutivo Sello</label></td>
                                                        <td><label className="fw-bold">{currentItem.id_public}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="2"><label>Modalidad</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="2">
                                                            <textarea class="form-control mb-3" rows="3" id="t_11"></textarea>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Area</label></td>
                                                        <td><label className="fw-bold">{currentItem.area}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Fecha</label></td>
                                                        <td><label className="fw-bold">
                                                        <input type="date" class="form-control" placeholder="Fecha de Expedicion" id="gen_03"
                                                         defaultValue={currentItem.fun_0.date} /></label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Planos</label></td>
                                                        <td><label className="fw-bold">{currentItem.blueprints}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Memorias</label></td>
                                                        <td><label className="fw-bold">{currentItem.drives}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Estudios</label></td>
                                                        <td><label className="fw-bold">{currentItem.folders}</label></td>
                                                    </tr>
                                                </> : ""}
                                            </tbody>
                                        </table>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBModalBody>
                            <MDBModalFooter>
                                <MDBBtn color='success' onClick={() => generate(1)}>
                                    <h4 className="pt-2"><i class="far fa-file"></i> GENERAR ORIGINAL</h4>
                                </MDBBtn>
                                <MDBBtn color='success' onClick={() => generate(0)}>
                                    <h4 className="pt-2"><i class="far fa-file"></i> GENERAR TITULAR</h4>
                                </MDBBtn>
                                <MDBBtn color='info' onClick={toggle}>
                                    <h4 className="pt-2"><i class="fas fa-times-circle"></i> Cerrar</h4>
                                </MDBBtn>
                            </MDBModalFooter>
                        </MDBModalContent>
                    </MDBModalDialog>
                </MDBModal>
            </div >
        );
}

export default Seals;