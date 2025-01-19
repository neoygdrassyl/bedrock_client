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
import Modal from 'react-modal';
import PqrsForm from './forms/pqrs_form';
import { modalStyles, pqrsFormStyles, pqrsRequestStyles } from './utils/styles/modalStyles';
import PqrsBreadcrumb from './components/pqrs_dashboard/pqrs_breadcrumbs.component';
import PqrsStats from './components/pqrs_dashboard/pqrs_stadistics.component';
import PqrsDataRequest from './forms/pqrs_data_request';

const PQRSDashboard = (props) => {
    //pqrs
    const [pqrs, setPQRS] = useState([]);
    // itemSelected
    const [currentItem, setCurrentItem] = useState(null)
    //Table management
    const [selectedRow, setSelectedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('all');

    //Modals
    const [pqrsRequest, setPqrsRequest] = useState(false);
    const [pqrsNewModal, setPqrsNewModal] = useState(false);

    //api call
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
    //visual
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
                    {/* <MDBTooltip tag="span" title="Eliminar">
                        <MDBBtn color="link" onClick={() => handleDelete(row.id)}>
                            <i className="fas fa-trash-alt"></i>
                        </MDBBtn>
                    </MDBTooltip> */}
                </div>
            )
        }
    ];

    // Actions

    //initial data to pqrs_form
    const [data, setData] = useState({})
    const handleOpenRequest = () => {
        setPqrsRequest((status) => !status); // Open the modal
    }
    const handleNewPqrs = () => {
        setPqrsNewModal((status) => !status); // Open the modal
        setPqrsRequest(false); // Close the modal
    }

    const handleEdit = async(id) => {
        setCurrentItem(id)
        setPqrsNewModal((status) => !status)
        console.log(id)
    };
    const rowSelectedStyle = {
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
    };
    // ---- //
    return (
        <div className="container mt-5">
            {/* Modals */}
            {/* 1 STEP */}
            <Modal contentLabel="GENERAR SOLCITUD PQRS"
                isOpen={pqrsRequest}
                style={pqrsRequestStyles}
                ariaHideApp={false}
            >
                <div className="my-4 d-flex justify-content-between">
                    <h2>CREAR NUEVA PETICIÓN</h2>

                    <div className='btn-close' color='none' onClick={() => handleOpenRequest()}></div>
                </div>
                <hr />
                <PqrsDataRequest continueToForm={handleNewPqrs} setData={setData} />
                <hr />
                <div className="text-end py-4 mt-3">
                    <button className="btn btn-lg btn-info" onClick={() => handleOpenRequest()}><i class="fas fa-times-circle"></i> CERRAR </button>
                </div>
            </Modal>
            {/* PQRS FORM */}

            <Modal contentLabel="GENERAR SOLCITUD PQRS"
                isOpen={pqrsNewModal}
                style={pqrsFormStyles}
                ariaHideApp={false}
            >
                <div className="my-4 d-flex justify-content-between">
                    {
                        data.id ? <h2>GESTIONAR SOLICITUD PQRS</h2> : <h2>CREAR NUEVA PETICIÓN</h2>
                    }
                    <div className='btn-close' color='none' onClick={() => handleNewPqrs()}></div>
                </div>
                <hr />
                <PqrsForm id={currentItem} creationData={data} />
                <hr />
                <div className="text-end py-4 mt-3">
                    <button className="btn btn-lg btn-info" onClick={() => handleNewPqrs()}><i class="fas fa-times-circle"></i> CERRAR </button>
                </div>
            </Modal>

            <PqrsBreadcrumb breadCrums={props.breadCrums} />
            <PqrsStats pqrs={pqrs} />

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
                                <MDBBtn color="primary" onClick={() => handleOpenRequest()}>
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
