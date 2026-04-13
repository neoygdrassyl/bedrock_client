import { useState, useEffect, useCallback } from 'react';
import MailboxService from '../../services/mailbox.service'
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
} from '../../components/ui';
import { Link } from "react-router-dom";
import DataTable from 'react-data-table-component';
import Collapsible from '../../components/Collapsible';
const moment = require('moment');

function Mail({ translation, globals, breadCrums }) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [modal, setModal] = useState(false);
    const [items, setItems] = useState([]);

    const retrievePublish = useCallback(() => {
        MailboxService.getAll()
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
    };
        const columns = [
            {
                name: <h3># CONSECUTIVO</h3>,
                selector: row => row.id,
                sortable: true,
                filterable: true,
                cell: row => <p className="pt-3">{row.id}</p>
            },
            {
                name: <h3>NOMBRE</h3>,
                selector: row => row.name,
                sortable: true,
                filterable: true,
                cell: row => <p className="pt-3">{row.name}</p>
            },
            {
                name: <h3>FECHA</h3>,
                selector: row => row.createdAt,
                sortable: true,
                filterable: true,
                cell: row => <p className="pt-3">{moment(row.createdAt).format("DD-MM-YYYY")}</p>
            },
            {
                name: <h3>ASUNTO</h3>,
                selector: row => row.subject,
                cell: row => <p className="pt-3 text-center">{row.subject}</p>
            },
            {
                name: <h3>ACCIÓN</h3>,
                button: true,
                cell: row =>
                    <button className="btn btn-danger btn-sm" onClick={() => setItem(row)}><i class="fas fa-file-alt"></i> Ver</button>
                ,
            },
        ]

        return (

            <div className="Publish container">
                <div className="col-12 d-flex justify-content-start p-0">
                    <MDBBreadcrumb className="mb-0 p-0 ms-0">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem>
                            <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u6}</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>
                </div>
                <div className="row mb-4 d-flex justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <h1 className="text-center my-4">BUZÓN DE MENSAJES</h1>
                        <hr />

                        <div className="text-center">
                            {isLoaded ? (
                                <DataTable
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent="No hay mensajes"
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
                        
                        
                    </div>
                </div>
                <MDBModal show={getToggle()} tabIndex='-2' staticBackdrop >
                    <MDBModalDialog size="lg">
                        <MDBModalContent className="container-primary">
                            <MDBModalHeader>
                                <MDBModalTitle><h2 className="text-center"><i class="far fa-file-alt"></i> DETALLES DEL MENSAJE {currentItem ? currentItem.id : ''} </h2></MDBModalTitle>
                                <MDBBtn className='btn-close' color='none' onClick={toggle}></MDBBtn>
                            </MDBModalHeader>
                            <MDBModalBody>
                                <MDBCard className="bg-card">
                                    <MDBCardBody>
                                        <MDBRow>
                                            <MDBCol md="12">
                                            <table className="table table-bordered table-sm table-hover  text-start table-light">
                                                    <tbody>
                                                        {currentItem ? <>
                                                            <tr className="Collapsible text-center">
                                                                <th colSpan="2" ><label>Información del mensaje</label></th>
                                                            </tr>
                                                            <tr>
                                                                <td><label># Consecutivo</label></td>
                                                                <td><label className="fw-bold">{currentItem.id}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Nombre</label></td>
                                                                <td><label className="fw-bold">{currentItem.name}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Fecha de Expedicion</label></td>
                                                                <td><label className="fw-bold">{moment(currentItem.createdAt).format("DD-MM-YYYY HH:mm")}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Email de Contacto</label></td>
                                                                <td><label className="fw-bold">{currentItem.email}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Numero de Contacto</label></td>
                                                                <td><label className="fw-bold">{currentItem.number}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td><label>Asunto</label></td>
                                                                <td><label className="fw-bold">{currentItem.subject}</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="2"><label>Mensaje</label></td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="2"><label className="fw-bold">{currentItem.message}</label></td>
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

export default Mail;