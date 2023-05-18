import React, { Suspense, useEffect, useState, } from 'react';
import Norms_Service from "../../../services/norm.service"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';

const MySwal = withReactContent(Swal);
export default function NORM_NEIGHBORS(props) {
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
        Norms_Service.getAll_neighbor(id)
            .then(response => {
                setData(response.data)
                setLoad(1)
                setNewItem(false)
                document.getElementById("cb_new_neighbor").checked = false
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
        let card = document.getElementById("predio_card").value;
        formData.set('card', card);
        let floors = document.getElementById("predio_floors").value;
        formData.set('floors', floors);
        let voladizo = document.getElementById("predio_voladizo").value;
        formData.set('voladizo', voladizo);
        let material = document.getElementById("predio_material").value;
        formData.set('material', material);
        let fun6id = document.getElementById("predio_fun6id").value;
        formData.set('fun6id', fun6id);

        formData.set('normId', id);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Norms_Service.create_neighbor(formData)
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
        let card = document.getElementById("predio_card_edit").value;
        formData.set('card', card);
        let floors = document.getElementById("predio_floors_edit").value;
        formData.set('floors', floors);
        let voladizo = document.getElementById("predio_voladizo_edit").value;
        formData.set('voladizo', voladizo);
        let material = document.getElementById("predio_material_edit").value;
        formData.set('material', material);
        let fun6id = document.getElementById("predio_fun6id_edit").value;
        formData.set('fun6id', fun6id);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Norms_Service.update_neighbor(editItem.id, formData)
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
                Norms_Service.delete_neighbor(id)
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
            name: <label className="text-center">CARDINALIDAD</label>,
            center: true,
            cell: row => row.card
        },
        {
            name: <label className="text-center">PISOS</label>,
            center: true,
            cell: row => row.floors
        },
        {
            name: <label className="text-center">VOLADIZO</label>,
            center: true,
            cell: row => row.voladizo
        },
        {
            name: <label className="text-center">MATERIAL</label>,
            center: true,
            cell: row => row.material
        },
        {
            name: <label className="text-center">IMAGE</label>,
            center: true,
            cell: row => row.fun6id
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
        noDataComponent="NO HAY VECINOS"
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
                    <label>Cardinalidad</label>
                    <div class="input-group my-1">
                        <input type="text" class="form-control" defaultValue={editItem ? editItem.card : ""} id={"predio_card" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Pisos</label>
                    <div class="input-group my-1">
                        <input type="number" min="0" step="1" defaultValue={editItem ? editItem.floors : ""} class="form-control" id={"predio_floors" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Voladizo</label>
                    <div class="input-group my-1">
                        <input  type="text" defaultValue={editItem ? editItem.voladizo : ""} class="form-control" id={"predio_voladizo" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Material</label>
                    <div class="input-group my-1">
                        <input  type="text" defaultValue={editItem ? editItem.material : ""} class="form-control" id={"predio_material" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Imagen</label>
                    <div class="input-group my-1">
                        <input  type="text" defaultValue={editItem ? editItem.fun6id : ""} class="form-control" id={"predio_fun6id" + edit} />
                    </div>
                </div>
            </div>

        </>
    }

    const NEW_ITEM = <>
        <div class="form-check ms-5">
            <input class="form-check-input" type="checkbox" id="cb_new_neighbor" onChange={(e) => setNewItem(e.target.checked)} />
            <label class="form-check-label" for="flexCheckDefault">
                Nuevo Vecino
            </label>
        </div>
        {newItem ?
            <form onSubmit={create_item} id="new-neighbor-form">
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
            <form onSubmit={edit_item} id="edit-neighbor-form">
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
                <h3 class="text-uppercase pb-2">3. INFORMACIÓN VECINOS:</h3>
                {NEW_ITEM}
                {TABLE}
                {EDIT_ITEM}
                <hr />
            </Suspense>

        </>
    );
}