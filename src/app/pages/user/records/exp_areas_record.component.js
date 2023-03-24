import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import EXPEDITION_SERVICE from '../../../services/expedition.service';
import EXP_CALC from '../expeditions/exp_calc.component';


const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

export default function EXP_AREAS_RECORD(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion } = props;


    const [currentRecord, setRecord] = useState(null);
    const [currentVersionR, setRecordV] = useState(null);
    const [load, setLoad] = useState(false);
    const [newA, setNewA] = useState(false);
    const [edit, setEdit] = useState(false);

    useEffect(() => {
        if (load == false) get_exp_record();
        if (edit != false) _SET_EDIT_DATA(edit);
    }, [load, edit]);


    // DATA GETTERS
    function _GET_CHILD_AREAS() {
        var _CHILD = currentRecord.exp_areas;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    function _SET_EDIT_DATA(_ITEM) {
        document.getElementById("expedition_area_1_edit").value = _ITEM.area;
        document.getElementById("expedition_area_3_edit").value = _ITEM.use;
        document.getElementById("expedition_area_4_edit").value = _ITEM.desc;
        document.getElementById("expedition_area_5_edit").value = _ITEM.units;
    }
    // ****************** JSX ******************* //
    let _COMPONENT_MANAGE = (edit = "") => {
        return <>
            <div className="row mb-1">
                <div className="col">
                    <label>Area</label>
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-cube"></i>
                        </span>
                        <input type="number" min="0" step="0.01" class="form-control" id={"expedition_area_1" + edit} />
                    </div>

                </div>
                <div className="col">
                    <label>Unidades</label>
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-cube"></i>
                        </span>
                        <input type="number" min="0" step="1" class="form-control" id={"expedition_area_5" + edit} />
                    </div>

                </div>
                <div className="col">
                    <label>Uso</label>
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-home"></i>
                        </span>
                        <input list="exp_uses_datalist" className="form-select" id={"expedition_area_3" + edit} autoComplete="off" />

                        <datalist id="exp_uses_datalist">
                            <option value="Residencial (NO VIS)" />
                            <option value="Residencial (VIS)" />
                            <option value="Residencial (VIP)" />
                            <option value="Comercial y de Servicios" />
                            <option value="Dotacional" />
                            <option value="Industrial" />
                            <option value="Multiple" />
                        </datalist>
                    </div>
                </div>
                <div className="col">
                    <label>Modalidad</label>
                    <div class="input-group my-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-question-circle"></i>
                        </span>
                        <input type="text" class="form-control" id={"expedition_area_4" + edit} />
                    </div>
                </div>
            </div>

        </>
    }
    let _CHILD_AREA_LIST = () => {
        let _LIST = _GET_CHILD_AREAS();
        const columns = [
            {
                name: <label className="text-center">AREA</label>,
                selector: row => row.area,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '80px',
                cell: row => <label>{row.area}</label>
            },
            {
                name: <label className="text-center">UNIDADES</label>,
                selector: row => row.area,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '80px',
                cell: row => <label>{row.units}</label>
            },
            {
                name: <label className="text-center">USO</label>,
                selector: row => row.use,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '60px',
                cell: row => <label>{row.use}</label>
            },
            {
                name: <label className="text-center">Modalidad</label>,
                selector: row => row.desc,
                sortable: true,
                filterable: true,
                compact: true,
                cell: row => <label>{row.desc}</label>
            },
            {
                name: <label>ACCION</label>,
                button: true,
                maxWidth: '50px',
                cell: row => <>
                    <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 me-1">
                        <MDBBtn className="btn btn-secondary m-0 p-1 shadow-none" onClick={() => setEdit(row)}><i class="far fa-edit"></i></MDBBtn>
                    </MDBTooltip>
                    <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0">
                        <MDBBtn className="btn btn-danger m-0 p-1 shadow-none" onClick={() => delete_item(row.id)}><i class="far fa-trash-alt"></i></MDBBtn>
                    </MDBTooltip>
                </>
            },
        ]
        return <DataTable
            noDataComponent="No hay Items"
            striped="true"
            columns={columns}
            data={_LIST}
            highlightOnHover
            noHeader
            dense
        />
    }

    // ****************** APIS ******************* //

    function get_exp_record() {
        EXPEDITION_SERVICE.getRecord(props.currentItem.id)
            .then(response => {
                if (!response.data[0]) return;
                setRecord(response.data[0]);
                setRecordV(response.data[0].version ?? null);
                setLoad(true);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: props.swaMsg.generic_eror_title,
                    text: props.swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: props.swaMsg.text_btn,
                });
            });
    }

    function new_expedition() {
        let formData = new FormData();
        formData.set('fun0Id', currentItem.id);
        EXPEDITION_SERVICE.create(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    setLoad(0);
                } else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    setLoad(0);
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

    function new_item(e) {
        e.preventDefault();
        let formData = new FormData();

        formData.set('expeditionId', currentRecord.id);

        let area = document.getElementById("expedition_area_1").value;
        if (area) formData.set('area', area);
        let use = document.getElementById("expedition_area_3").value;
        formData.set('use', use);
        let desc = document.getElementById("expedition_area_4").value;
        if (desc) formData.set('desc', desc);
        let units = document.getElementById("expedition_area_5").value;
        if (units) formData.set('units', units);


        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        EXPEDITION_SERVICE.create_exp_area(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    document.getElementById('form_expedition_area').reset();
                    setLoad(0)
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
                EXPEDITION_SERVICE.delete_exp_area(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            props.requestUpdateRecord(currentItem.id);
                            setEdit(false);
                            setLoad(0);
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
    }
    function edit_item(e) {
        e.preventDefault();
        let formData = new FormData();

        let area = document.getElementById("expedition_area_1_edit").value;
        formData.set('area', area);
        let use = document.getElementById("expedition_area_3_edit").value;
        formData.set('use', use);
        let desc = document.getElementById("expedition_area_4_edit").value;
        formData.set('desc', desc);
        let units = document.getElementById("expedition_area_5_edit").value;
        formData.set('units', units);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        EXPEDITION_SERVICE.update_exp_area(edit.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    document.getElementById('form_expedition_area_edit').reset();
                    setEdit(false);
                    setLoad(0);
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
    return (
        <div>
            {currentRecord == null ?
                <>
                    <div className='row'>
                        <label className='text-danger fw-bold'>NO SE ENCONTRARON AREAS DE COBRO</label>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <MDBBtn onClick={() => new_expedition()}>CREAR CUADRO DE AREAS</MDBBtn>
                        </div>
                    </div>

                </> :
                <>
                    <div class="form-check ms-5">
                        <input class="form-check-input" type="checkbox" onChange={(e) => setNewA(!newA)} />
                        <label class="form-check-label" for="flexCheckDefault">
                            Nueva Área
                        </label>
                    </div>
                    {newA
                        ? <>
                            <form id="form_expedition_area" onSubmit={new_item}>
                                {_COMPONENT_MANAGE()}
                                <div className="row mb-3 text-center">
                                    <div className="col">
                                        <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                    </div>
                                </div>
                            </form>
                        </>
                        : ""}
                    {_CHILD_AREA_LIST()}
                    {edit
                        ? <>
                            <form id="form_expedition_area_edit" onSubmit={edit_item}>
                                <h3 className="my-3 text-center">Actualizar Área</h3>
                                {_COMPONENT_MANAGE('_edit')}
                                <div className="row mb-3 text-center">
                                    <div className="col-12">
                                        <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                                    </div>
                                </div>
                            </form>
                        </>
                        : ""}
                </>}
        </div >
    );
}
