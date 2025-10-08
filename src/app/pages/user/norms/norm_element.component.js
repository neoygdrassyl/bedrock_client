import React, { Suspense, useEffect, useState, } from 'react';
import Norms_Service from "../../../services/norm.service"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import PERFILES from "./PERFILES.json"
import { ELEMENTS } from './norm.vars'

const MySwal = withReactContent(Swal);

export default function NORM_ELEMENT(props) {
    const { translation, swaMsg, globals, perfil } = props;

    const [load, setLoad] = useState(0);
    const [data, setData] = useState([]);
    const [newItem, setNewItem] = useState(false);
    const [editItem, setEditItem] = useState(false);

    useEffect(() => {
        if (load == 0 || !perfil) loadData();
    }, [load, perfil]);

    // ************************** APIS ************************ //
    function loadData() {
        setLoad(0)
        Norms_Service.getAll_element(perfil.id)
            .then(response => {
                setData(response.data)
                setLoad(1)
                setNewItem(false)
                document.getElementById("cb_new_element").checked = false
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

        let element = document.getElementById("elelment_element").value;
        formData.set('element', element);
        let dimension_n = document.getElementById("elelment_dimension_n").value;
        formData.set('dimension_n', dimension_n);
        let dimension_p = document.getElementById("elelment_dimension_p").value;
        formData.set('dimension_p', dimension_p);

        formData.set('normPerfilId', perfil.id);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Norms_Service.create_element(formData)
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
                        text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
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

        let element = document.getElementById("elelment_element_edit").value;
        formData.set('element', element);
        let dimension_n = document.getElementById("elelment_dimension_n_edit").value;
        formData.set('dimension_n', dimension_n);
        let dimension_p = document.getElementById("elelment_dimension_p_edit").value;
        formData.set('dimension_p', dimension_p);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Norms_Service.update_element(editItem.id, formData)
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
                        text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
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
                Norms_Service.delete_element(id)
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
    function get_element_norm_data(ele, edit) {
        const CARD = perfil.card;
        const NAME = perfil.perfil;
        let norm_value = 0

        let find_perfil = PERFILES.find(p => p.name == NAME)
        if (find_perfil) {
            if (CARD == "sn") {
                norm_value = find_perfil[ele + '_2'] ?? find_perfil[ele]
            }
            else {
                norm_value = find_perfil[ele]
            }
        }

        document.getElementById("elelment_dimension_n" + edit).value = norm_value
    }

    // ***************************  JXS *********************** //
    const columns = [
        {
            name: <label className="text-center">ELEMENTO</label>,
            selector: row => row.element,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => ELEMENTS.find(ele => ele.value == row.element) ? ELEMENTS.find(ele => ele.value == row.element).name : 'OTRO ELEMENTO'
        },
        {
            name: <label className="text-center">DIMENSION NORMA</label>,
            center: true,
            cell: row => row.dimension_n
        },
        {
            name: <label className="text-center">DIMENSION SITIO</label>,
            center: true,
            cell: row => row.dimension_p
        },
        {
            name: <label className="text-center">RETROCESO EXIGIDO</label>,
            center: true,
            cell: row => (Number(row.dimension_n)- Number(row.dimension_p)).toFixed(2)
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
        noDataComponent="NO HAY ELEMENTOS"
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
                    <label>Elemento</label>
                    <div class="input-group input-group-sm my-1">
                        <select class="form-select" defaultValue={editItem ? editItem.element : ""} id={"elelment_element" + edit}
                            onChange={(e) => get_element_norm_data(e.target.value, edit)}>
                            {ELEMENTS.map(ele => <option value={ele.value}>{ele.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label>Dirección Norma</label>
                    <div class="input-group input-group-sm my-1">
                        <input type="number" min="0" step="0.01" defaultValue={editItem ? editItem.dimension_n : ""} class="form-control" id={"elelment_dimension_n" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Dimension Sitio</label>
                    <div class="input-group input-group-sm my-1">
                        <input type="number" min="0" step="0.01" defaultValue={editItem ? editItem.dimension_p : ""} class="form-control" id={"elelment_dimension_p" + edit} />
                    </div>
                </div>
            </div>

        </>
    }

    const NEW_ITEM = <>
        <div class="form-check ms-5">
            <input class="form-check-input" type="checkbox" id="cb_new_element" onChange={(e) => setNewItem(e.target.checked)} />
            <label class="form-check-label" for="flexCheckDefault">
                Nuevo Elemento
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
                <div className='border p-2'>
                    <h4 class="text-uppercase pb-2">ELEMENTOS: {perfil.perfil}</h4>
                    {NEW_ITEM}
                    {TABLE}
                    {EDIT_ITEM}
                </div>
            </Suspense>

        </>
    );
}