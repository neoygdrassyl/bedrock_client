import React, { useEffect, useState } from 'react';
import {
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBBreadcrumb,
    MDBBreadcrumbItem,
    MDBTooltip,
    MDBBtn,
    MDBTabs,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsPane,
    MDBTabsContent,
    MDBTypography
} from 'mdb-react-ui-kit';
import { Link } from "react-router-dom";
import new_pqrsService from '../../../../services/new_pqrs.service';
import DataTable from 'react-data-table-component';
import  Modal  from 'react-modal';
import PQRS from './PQRS'
import { modalStyles } from './utils/styles/modalStyles';

const PQRSDashboard = (props) => {
    const [pqrs, setPQRS] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('all');

    const [modalOpen, setModalOpen] = useState(false);


    useEffect(() => {
        const loadPQRS = () => {
            new_pqrsService.getAll()
                .then(response => {
                    console.log(response.data);
                    setPQRS(response.data);
                });
        };
        loadPQRS();
    }, []);
    
    //filter
    const filteredPQRS = pqrs.filter(pqrs => {
        const matchesSearch = pqrs.id_public?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pqrs.subject?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || pqrs.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const handleTabClick = (tabId) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
            setStatusFilter(tabId);
        }
    };

    const columnsSearch = [
        {
            name: 'ID',
            selector: row => row.id,
            sortable: true
        },
        {
            name: 'Tipo',
            selector: row => row.new_pqrs_clasifications[0]?.petition_type,
            sortable: true
        },
        {
            name: 'Asunto',
            selector: row => row.petition,
            sortable: true
        },
        {
            name: 'Estado',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <span className={`badge ${row.status === 'ABIERTA' ? 'bg-success' : 'bg-secondary'}`}>
                    {row.status}
                </span>
            )
        },
        {
            name: 'Fecha',
            selector: row => row.createdAt,
            sortable: true
        },
        {
            name: 'Día Hábil',
            selector: row => row.diaHabil,
            sortable: true
        },
        {
            name: 'Eficiencia',
            selector: row => row.efficiency,
            sortable: true
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="btn-group btn-group-sm">
                    <MDBTooltip tag="span" title="Editar">
                        <MDBBtn color="link" onClick={() => handleEdit(row.id)}>
                            <i className="fas fa-edit"></i>
                        </MDBBtn>
                    </MDBTooltip>
                    <MDBTooltip tag="span" title="Eliminar">
                        <MDBBtn color="link" onClick={() => handleDelete(row.id)}>
                            <i className="fas fa-trash-alt"></i>
                        </MDBBtn>
                    </MDBTooltip>
                </div>
            )
        }
    ];

    // Function for handling edit action
    const handleEdit = (id) => {
        setModalOpen(true); // Open the modal
    };

    // Function for handling delete action
    const handleDelete = (id) => {
        console.log("Deleting PQRS with ID:", id);
    };
    const handleClose = () => {
        setModalOpen(false);
    }

    const rowSelectedStyle = {
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
    };

    return (
        <div className="container mt-5">
            <Modal contentLabel="GENERAR SOLCITUD PQRS"
                isOpen={modalOpen}
                style={modalStyles}
                ariaHideApp={false}
            >
                <div className="my-4 d-flex justify-content-between">
                    <h2>CREAR NUEVA PETICIÓN</h2>

                    <div className='btn-close' color='none' onClick={() => handleClose()}></div>
                </div>
                <hr />
                <PQRS/>
                <hr />
                <div className="text-end py-4 mt-3">
                    <button className="btn btn-lg btn-info" onClick={() => handleClose()}><i class="fas fa-times-circle"></i> CERRAR </button>
                </div>
            </Modal>
            <MDBBreadcrumb className="mx-5">
                <MDBBreadcrumbItem>
                    <Link to={'/home'}><i className="fas fa-home"></i> <label className="text-uppercase">{props.breadCrums.bc_01}</label></Link>
                </MDBBreadcrumbItem>
                <MDBBreadcrumbItem>
                    <Link to={'/dashboard'}><i className="far fa-bookmark"></i> <label className="text-uppercase">{props.breadCrums.bc_u1}</label></Link>
                </MDBBreadcrumbItem>
                <MDBBreadcrumbItem active><i className="fas fa-file-alt"></i>  <label className="text-uppercase">{props.breadCrums.bc_u7}</label></MDBBreadcrumbItem>
            </MDBBreadcrumb>

            <MDBRow className="mb-4">
                <MDBCol md="4">
                    <MDBCard>
                        <MDBCardBody>
                            <MDBCardTitle>Total PQRS</MDBCardTitle>
                            <MDBTypography tag="h2">{pqrs.length}</MDBTypography>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
                <MDBCol md="4">
                    <MDBCard>
                        <MDBCardBody>
                            <MDBCardTitle>PQRS Abiertos</MDBCardTitle>
                            <MDBTypography tag="h2">
                                {pqrs.filter(p => p.status === 'ABIERTA').length}
                            </MDBTypography>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
                <MDBCol md="4">
                    <MDBCard>
                        <MDBCardBody>
                            <MDBCardTitle>Eficiencia Promedio</MDBCardTitle>
                            <MDBTypography tag="h2">0.85</MDBTypography>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>

            <MDBCard className="mb-4">
                <MDBCardBody>
                    <MDBRow className="mb-3">
                        <MDBCol md="6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por ID o asunto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </MDBCol>
                        <MDBCol md="6" className="d-flex justify-content-end">
                            <MDBTooltip tag="span" title="Agregar nuevo PQRS">
                                <MDBBtn color="primary">
                                    <i className="fas fa-plus me-2"></i> Nuevo PQRS
                                </MDBBtn>
                            </MDBTooltip>
                        </MDBCol>
                    </MDBRow>

                    <MDBTabs className="mb-3">
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleTabClick('all')} active={activeTab === 'all'}>
                                Todos
                            </MDBTabsLink>
                        </MDBTabsItem>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleTabClick('abierta')} active={activeTab === 'abierta'}>
                                Abierta
                            </MDBTabsLink>
                        </MDBTabsItem>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleTabClick('cerrada')} active={activeTab === 'cerrada'}>
                                Cerrada
                            </MDBTabsLink>
                        </MDBTabsItem>
                    </MDBTabs>

                    <MDBTabsContent>
                        <MDBTabsPane show={activeTab === 'all' || activeTab === 'abierta' || activeTab === 'cerrada'}>
                            <DataTable
                                title="TABLA DE BÚSQUEDA"
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Página:', rangeSeparatorText: 'de' }}
                                noDataComponent="No hay mensajes"
                                striped
                                columns={columnsSearch}
                                data={filteredPQRS} // Pass filtered data instead of full data
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                onRowClicked={(e) => setSelectedRow(e.id)} // handle row click
                                conditionalRowStyles={[
                                    {
                                        when: row => row.id === selectedRow, // Apply custom style for selected row
                                        style: rowSelectedStyle,
                                    },
                                ]}
                                customStyles={{
                                    headCells: {
                                        style: {
                                            backgroundColor: '#1266f1',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }

                                    }
                                }}
                            />
                        </MDBTabsPane>
                    </MDBTabsContent>
                </MDBCardBody>
            </MDBCard>
        </div>
    );
};

export default PQRSDashboard;
