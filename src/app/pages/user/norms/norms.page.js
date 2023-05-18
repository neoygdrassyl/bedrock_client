import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { MDBBreadcrumb, MDBBreadcrumbItem, MDBBtn, MDBCard, MDBCardBody, MDBCardTitle, MDBCol, MDBRow, MDBTooltip } from 'mdb-react-ui-kit';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import Norms_Service from "../../../services/norm.service"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import NORM_GENERAL from './norm_geeral.component';
import NORM_PREDIOS from './norm_predio.component';
import NORM_NEIGHBORS from './norm_neighbors.component';
import NORM_PERFIL from './norm_perfil.component';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const customStylesForModal = {
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
        top: '10px',
        left: '12%',
        right: '12%',
        bottom: '10px',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',

    }
};
export default function NORMS(props) {
    const { translation, swaMsg, globals, breadCrums } = props;
    const [modal, setModal] = useState(false);
    const [load, setLoad] = useState(0);
    const [data, setData] = useState([]);
    const [dataOg, setDataOg] = useState([]);
    const [selectedId, setSelectedId] = useState(false);
    const [selectedIdPublic, setSelectedIdPublic] = useState("");

    useEffect(() => {
        if (load == 0) loadData();
    }, [load]);

    // ************************** APIS ************************ //
    function loadData() {
        setLoad(0)
        Norms_Service.getAll_norm()
            .then(response => {
                setData(response.data)
                setDataOg(response.data)
                setLoad(1)
            })
            .catch(e => {
                console.error(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function delete_item(id) {
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
                Norms_Service.delete_norm(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            loadData()
                        }
                    })
                    .catch(e => {
                        console.error(e);
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

    function createNorm(event) {
        event.preventDefault();

        let formData = new FormData();
        let id_in = document.getElementById("id_in").value;
        formData.set('id_in', id_in);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Norms_Service.create_norm(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    loadData()
                }
            })
            .catch(e => {
                console.log(e);
                if (e.response.data.message == "Validation error") {
                    MySwal.fire({
                        title: "ERROR DE DUPLICACION",
                        text: "El concecutivo de radicado de este formulario ya existe, debe de elegir un concecutivo nuevo",
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                } else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            });
    };

    function searchNorm(event) {
        event.preventDefault();

        let newFilterList = []
        let search = document.getElementById("search").value;

        if (search == "") {
            setData(dataOg)
        }
        else {
            newFilterList = dataOg.filter(row => {
                let match = false
                if (row.id_in.includes(search)) match = true
                if (row.id_out && row.id_out.includes(search)) match = true
                if (row.solicitor && row.solicitor.includes(search)) match = true
                return match
            })
            setData(newFilterList)
        }


    }

    // ***************************  DATA GETTER *********************** //


    // ***************************  JXS *********************** //
    const NEW_ITEM = <MDBCard className="bg-card mb-3">
        <MDBCardBody>
            <MDBCardTitle className="text-center"> <h4>GENERAR NUEVA NORMA URBANA</h4></MDBCardTitle>
            <form onSubmit={createNorm} id="new-norm-form">

                <div className='row'>
                    <div className='col-12'>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"> <label>Radicación: </label></i>
                            </span>
                            <input type="text" class="form-control" defaultValue={""} id="id_in" required />
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button className="btn btn btn-success my-1"><i class="fas fa-folder-plus"></i> CREAR </button>
                </div>
            </form>
        </MDBCardBody>
    </MDBCard>

    const SEARCH_ITEM = <MDBCard className="bg-card mb-3">
        <MDBCardBody>
            <MDBCardTitle className="text-center"> <h4>BUSCAR NORMA URBANA</h4></MDBCardTitle>
            <form onSubmit={searchNorm} id="app-form">

                <div className='row'>
                    <div className='col-12'>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white">
                                <i class="fa fa-search"> <label>Buscar</label></i>
                            </span>
                            <input type="text" class="form-control" defaultValue={""} id="search" />
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button className="btn btn btn-secondary my-1"><i class="fa fa-search"></i> BUSCAR </button>
                </div>
            </form>
        </MDBCardBody>
    </MDBCard>

    const columns = [
        {
            name: <label className="text-center">No. RADICACIÓN</label>,
            selector: row => row.id_in,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => row.id_in
        },
        {
            name: <label className="text-center">No. EXPEDICIÓN</label>,
            selector: row => row.id_out,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => row.id_out
        },
        {
            name: <label className="text-center">ACCIÓN</label>,
            button: true,
            center: true,
            minWidth: '80px',
            cell: row => <>
                <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 me-1">
                    <MDBBtn className="btn btn-secondary m-0 p-1 shadow-none" onClick={() => {
                        setSelectedId(row.id);
                        setSelectedIdPublic(row.id_in);
                        setModal(!modal);
                    }}><i class="far fa-edit"></i></MDBBtn>
                </MDBTooltip>
                {window.user.id == 1 || window.user.roleId == 3 ?
                    <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0">
                        <MDBBtn className="btn btn-danger m-0 p-1 shadow-none" onClick={() => delete_item(row.id)}><i class="far fa-trash-alt"></i></MDBBtn>
                    </MDBTooltip>
                    : null}
            </>,
        },
    ]

    const TABLE = <DataTable
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="NO HAY NORMAS"
        striped="true"
        columns={columns}
        data={data}
        highlightOnHover
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[20, 50, 100]}
        className="data-table-component"
        noHeader
        dense
        progressPending={!load}
        progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
    />

    return (
        <>

            <div className="Publish container">
                <div className="row my-4 d-flex justify-content-center">
                    <MDBBreadcrumb className="mx-5">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem>
                            <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="fas fa-home"></i>  <label className="text-uppercase">NORMAS URBANAS</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>
                    <div className="col-lg-11 col-md-12">
                        <h1 className="text-center my-4">NORMAS URBANAS</h1>
                        <hr />
                    </div>

                    <MDBRow>
                        <MDBCol md="4">{NEW_ITEM}</MDBCol>
                        <MDBCol md="4">{SEARCH_ITEM}</MDBCol>
                        <MDBCol md="4"></MDBCol>
                    </MDBRow>

                    <h2 class="text-uppercase text-center pb-2">LISTADO DE NORMAS</h2>

                    {TABLE}
                </div>
            </div>

            <Modal contentLabel="EXP CALC"
                isOpen={modal}
                style={customStylesForModal}
                ariaHideApp={false}
            >
                <div className="my-2 d-flex justify-content-between">
                    <h2 class="text-uppercase text-center">NORMA URBANA: {selectedIdPublic}</h2>
                    <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_alert()}></MDBBtn>
                </div>

                <hr />

                <NORM_GENERAL
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    id={selectedId}
                />

                <NORM_PREDIOS
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    id={selectedId}
                />

                <NORM_NEIGHBORS
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    id={selectedId}
                />

                <NORM_PERFIL
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    id={selectedId}
                />

                <div className="text-end py-2">
                    <MDBBtn className="btn btn-sm btn-info" onClick={() => setModal(!modal)}><i class="fas fa-times-circle"></i> CERRAR</MDBBtn>
                </div>
            </Modal>
        </>
    );
}