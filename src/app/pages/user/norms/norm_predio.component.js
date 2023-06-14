import React, { Suspense, useEffect, useState, } from 'react';
import Norms_Service from "../../../services/norm.service"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';

const MySwal = withReactContent(Swal);
export default function NORM_PREDIOS(props) {
    const { translation, swaMsg, globals, id } = props;

    const [load, setLoad] = useState(0);
    const [data, setData] = useState([]);
    const [newItem, setNewItem] = useState(false);
    const [editItem, setEditItem] = useState(false);

    useEffect(() => {
        if (load == 0 || !id) loadData();
    }, [load, id]);

    // ************************** APIS ************************ //
    function loadData() {
        setLoad(0)
        Norms_Service.getAll_predio(id)
            .then(response => {
                setData(response.data)
                setLoad(1)
                setNewItem(false)
                document.getElementById("cb_new").checked = false
                setEditItem(false)
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



    function create_item(event) {
        event.preventDefault();

        let formData = new FormData();
        let predial = document.getElementById("predio_predial").value;
        formData.set('predial', predial);
        let dir = document.getElementById("predio_dir").value;
        formData.set('dir', dir);
        let area = document.getElementById("predio_area").value;
        formData.set('area', area);
        let front = document.getElementById("predio_front").value;
        formData.set('front', front);

        formData.set('normId', id);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Norms_Service.create_predio(formData)
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

    function edit_item(event) {
        event.preventDefault();

        let formData = new FormData();
        let predial = document.getElementById("predio_predial_edit").value;
        formData.set('predial', predial);
        let dir = document.getElementById("predio_dir_edit").value;
        formData.set('dir', dir);
        let area = document.getElementById("predio_area_edit").value;
        formData.set('area', area);
        let front = document.getElementById("predio_front_edit").value;
        formData.set('front', front);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Norms_Service.update_predio(editItem.id, formData)
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
                Norms_Service.delete_predio(id)
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
    // ***************************  DATA GETTER *********************** //


    // ***************************  JXS *********************** //
    const columns = [
        {
            name: <label className="text-center">No. PREDIAL</label>,
            selector: row => row.predial,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => row.predial
        },
        {
            name: <label className="text-center">DIRECCIÓN</label>,
            selector: row => row.dir,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => row.dir
        },
        {
            name: <label className="text-center">AREA</label>,
            center: true,
            cell: row => row.area
        },
        {
            name: <label className="text-center">FRENTE</label>,
            center: true,
            cell: row => row.front
        },
        {
            name: <label className="text-center">ACCIÓN</label>,
            button: true,
            center: true,
            minWidth: '80px',
            cell: row => <>
                <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 me-1">
                    <MDBBtn className="btn btn-secondary m-0 p-1 shadow-none" onClick={() => setEditItem(editItem ? false : row)}><i class="far fa-edit"></i></MDBBtn>
                </MDBTooltip>
                <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0">
                    <MDBBtn className="btn btn-danger m-0 p-1 shadow-none" onClick={() => delete_item(row.id)}><i class="far fa-trash-alt"></i></MDBBtn>
                </MDBTooltip>
            </>,
        },
    ]

    const TABLE = <DataTable
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="NO HAY PREDIOS"
        striped="true"
        columns={columns}
        data={data}
        highlightOnHover
        pagination={false}
        paginationPerPage={20}
        paginationRowsPerPageOptions={[20, 50, 100]}
        className="data-table-component"
        noHeader
        dense
        progressPending={!load}
        progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
    />

    let _COMPONENT_MANAGE = (edit = "") => {
        return <>
            <div className="row">
                <div className="col">
                    <label>Nr. Predial</label>
                    <div class="input-group my-1">
                        <input type="text" class="form-control" defaultValue={editItem ? editItem.predial : ""} id={"predio_predial" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Dirección</label>
                    <div class="input-group my-1">
                        <input type="text" defaultValue={editItem ? editItem.dir : ""} class="form-control" id={"predio_dir" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Area (m2)</label>
                    <div class="input-group my-1">
                        <input type="number" min="0" step="0.01" defaultValue={editItem ? editItem.area : ""} class="form-control" id={"predio_area" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Frente (m)</label>
                    <div class="input-group my-1">
                        <input type="number" min="0" step="0.01" defaultValue={editItem ? editItem.front : ""} class="form-control" id={"predio_front" + edit} />
                    </div>
                </div>
            </div>

        </>
    }

    const NEW_ITEM = <>
        <div class="form-check ms-5">
            <input class="form-check-input" type="checkbox" id="cb_new" onChange={(e) => setNewItem(e.target.checked)} />
            <label class="form-check-label" for="flexCheckDefault">
                Nuevo Predio
            </label>
        </div>
        {newItem ?
            <form onSubmit={create_item} id="new-predio-form">
                {_COMPONENT_MANAGE("")}
                <div className="row my-3 text-center">
                    <div className="col">
                        <button className="btn btn-success btn-sm" ><i class="fas fa-plus-circle"></i> AÑADIR ITEM </button>
                    </div>
                </div>
            </form>
            : null}

    </>

    const EDIT_ITEM = <>
        {editItem ?
            <form onSubmit={edit_item} id="edit-predio-form">
                {_COMPONENT_MANAGE("_edit")}
                <div className="row my-3 text-center">
                    <div className="col">
                        <button className="btn btn-success btn-sm" ><i class="fas fa-edit"></i> ACTUALIZAR ITEM </button>
                    </div>
                </div>
            </form>
            : null}

    </>
    return (
        <>
            <Suspense fallback={<label className='fw-normal lead text-muted'>CARGANDO...</label>}>
                <h3 class="text-uppercase pb-2">2. INFORMACIÓN PREDIO(S):</h3>
                {NEW_ITEM}
                {TABLE}
                {EDIT_ITEM}
                <hr />
            </Suspense>

        </>
    );
}