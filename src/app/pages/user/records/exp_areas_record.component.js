
import { useEffect, useState } from 'react';
import DataTable from '@/components/data-table-bridge';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import EXPEDITION_SERVICE from '../../../services/expedition.service';
import EXP_CALC from '../expeditions/exp_calc.component';
import { Icon } from '@/components/icon';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

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
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="cube" size={16} />
                        </span>
                        <input type="number" min="0" step="0.01" className="form-control" id={"expedition_area_1" + edit} />
                    </div>

                </div>
                <div className="col">
                    <label>Unidades</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="cube" size={16} />
                        </span>
                        <input type="number" min="0" step="1" className="form-control" id={"expedition_area_5" + edit} />
                    </div>

                </div>
                <div className="col">
                    <label>Uso</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="home" size={16} />
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
                    <div className="input-group my-1">
                        <span className="input-group-text bg-info text-white">
                            <Icon name="question-circle" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"expedition_area_4" + edit} />
                    </div>
                </div>
            </div>

        </>
    }
    let _CHILD_AREA_LIST = () => {
        let _LIST = _GET_CHILD_AREAS();
        const columns = [
            {
                name: 'AREA',
                selector: row => row.area,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '80px',
                cell: row => <span className="text-sm">{row.area}</span>
            },
            {
                name: 'UNIDADES',
                selector: row => row.area,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '80px',
                cell: row => <span className="text-sm">{row.units}</span>
            },
            {
                name: 'USO',
                selector: row => row.use,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '60px',
                cell: row => <span className="text-sm">{row.use}</span>
            },
            {
                name: 'Modalidad',
                selector: row => row.desc,
                sortable: true,
                filterable: true,
                compact: true,
                cell: row => <span className="text-sm">{row.desc}</span>
            },
            {
                name: 'ACCION',
                button: true,
                maxWidth: '50px',
                cell: row => <>
                    <span title="Modificar Item"><button type="button" className="btn btn-secondary m-0 p-1 shadow-none" onClick={() => setEdit(row)}><Icon name="edit" size={16} /></button></span>
                    <span title="Eliminar Item"><button type="button" className="btn btn-danger m-0 p-1 shadow-none" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></button></span>
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
                            <button type="button" className="btn btn-primary" onClick={() => new_expedition()}>CREAR CUADRO DE AREAS</button>
                        </div>
                    </div>

                </> :
                <>
                    <div className="form-check ms-5">
                        <input className="form-check-input" type="checkbox" onChange={(e) => setNewA(!newA)} />
                        <label className="form-check-label" htmlFor="flexCheckDefault">
                            Nueva Área
                        </label>
                    </div>
                    {newA
                        ? <>
                            <form id="form_expedition_area" onSubmit={new_item}>
                                {_COMPONENT_MANAGE()}
                                <div className="row mb-3 text-center">
                                    <div className="col">
                                        <button className="btn btn-success my-3" ><Icon name="file-alt" size={16} /> AÑADIR ITEM </button>
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
                                        <button className="btn btn-success my-3" ><Icon name="file-alt" size={16} /> GUARDAR CAMBIOS </button>
                                    </div>
                                </div>
                            </form>
                        </>
                        : ""}
                </>}
        </div >
    );
}
