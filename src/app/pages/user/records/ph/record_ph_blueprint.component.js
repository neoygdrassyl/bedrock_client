
import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import { Icon } from '@/components/icon';

const MySwal = withReactContent(Swal);

function RECORD_PH_BLUEPRINT({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);

    useEffect(() => {
        if (edit !== false) {
            var _ITEM = edit;

            document.getElementById("r_ph_bl_1_edit").value = _ITEM.id_public;
            document.getElementById("r_ph_bl_2_edit").value = _ITEM.floor;
            document.getElementById("r_ph_bl_3_edit").value = _ITEM.area;
            document.getElementById("r_ph_bl_5_edit").value = _ITEM.units_other;

            let units = _ITEM.units;
            if (units) {
                units = units.split(';');
                let items = document.getElementsByName("r_ph_bl_4_edit");
                for (var i = 0; i < units.length; i++) {
                    items[i].value = units[i]
                }
            }
        }
    }, [edit]);

        // DATA GETTERS
        let _GET_CHILD_BLUEPRINTS = () => {
            var _CHILD = currentRecord.record_ph_blueprints;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        // DATA CONVERTERS

        // COMPONENT JSX
        let _CHILD_LICENCE_LIST = () => {
            let _LIST = _GET_CHILD_BLUEPRINTS();
            const columns = [
                {
                    name: <label className="text-center">ID Plano</label>,
                    selector: row => row.id_public,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.id_public}</label>
                },
                {
                    name: <label className="text-center">Sótano / Piso</label>,
                    selector: row => row.floor,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.floor}</label>
                },
                {
                    name: <label className="text-center">Área total construida m2</label>,
                    selector: row => row.area,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.area}</label>
                },
                {
                    name: <label className="text-center">Vivienda / Aptos.</label>,
                    selector: row => (row.units).split(";")[0],
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{(row.units).split(";")[0]}</label>
                },
                {
                    name: <label className="text-center">Locales / Lockers</label>,
                    selector: row => (row.units).split(";")[1],
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{(row.units).split(";")[1]}</label>
                },
                {
                    name: <label className="text-center">Parcelas / Lotes</label>,
                    selector: row => (row.units).split(";")[2],
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{(row.units).split(";")[2]}</label>
                },
                {
                    name: <label className="text-center">Paqrueos</label>,
                    selector: row => (row.units).split(";")[3],
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{(row.units).split(";")[3]}</label>
                },
                {
                    name: <label className="text-center">Oficinas</label>,
                    selector: row => (row.units).split(";")[4],
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{(row.units).split(";")[4]}</label>
                },
                {
                    name: <label className="text-center">Bodegas</label>,
                    selector: row => (row.units).split(";")[5],
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{(row.units).split(";")[5]}</label>
                },
                {
                    name: <label className="text-center">Número Parqueos</label>,
                    selector: row => (row.units).split(";")[6],
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{(row.units).split(";")[6]}</label>
                },
                {
                    name: <label className="text-center">Descripción otros bienes (espacios)</label>,
                    selector: row => row.units_other,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: "180px",
                    cell: row => <label >{row.units_other}</label>
                },
                {
                    name: <label>ACCION</label>,
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <span title="Modificar Item"><button type="button" className="btn btn-secondary m-0 p-2 shadow-none" onClick={() => setEdit(row)}><Icon name="edit" size={16} /></button></span>
                        <span title="Eliminar Item"><button type="button" className="btn btn-danger m-0 p-2 shadow-none" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></button></span>
                    </>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }
        let _COMPONENT_MANAGE = (edit = "") => {
            return <>
                <div className="row mb-1">
                    <div className="col-3">
                        <label>ID Plano</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="hashtag" size={16} />
                            </span>
                            <input type="text" className="form-control" id={"r_ph_bl_1" + edit} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Sótano / Piso</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="home" size={16} />
                            </span>
                            <input type="text" className="form-control" id={"r_ph_bl_2" + edit} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Área total Construida m2</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="ruler" size={16} />
                            </span>
                            <input type="number" min="0" step="0.01" className="form-control" id={"r_ph_bl_3" + edit} />
                        </div>
                    </div>
                </div>
                <div className="row border border-info p-2">
                    <label className="fw-bold">Número de unidades privadas</label>
                    <div className="col">
                        <label>Viviendas/ Apartamentos</label>
                        <div className="input-group my-1">
                            <input type="number" min="0" className="form-control" name={"r_ph_bl_4" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Locales / Lockers</label>
                        <div className="input-group my-1">
                            <input type="number" min="0" className="form-control" name={"r_ph_bl_4" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Parcelas / Lotes</label>
                        <div className="input-group my-1">
                            <input type="number" min="0" className="form-control" name={"r_ph_bl_4" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Parqueos</label>
                        <div className="input-group my-1">
                            <input type="number" min="0" className="form-control" name={"r_ph_bl_4" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Oficinas</label>
                        <div className="input-group my-1">
                            <input type="number" min="0" className="form-control" name={"r_ph_bl_4" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Bodegas</label>
                        <div className="input-group my-1">
                            <input type="number" min="0" className="form-control" name={"r_ph_bl_4" + edit} />
                        </div>
                    </div>
                </div>

                <div className="row  border border-info p-2">
                    <label className="fw-bold">Bienes comunes (Espacios)</label>
                    <div className="col-3">
                        <label>Número Parqueos</label>
                        <div className="input-group my-1">
                            <input type="number" min="0" className="form-control" name={"r_ph_bl_4" + edit} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>Descripción otros bienes (espacios)</label>
                        <div className="input-group my-1">
                            <input type="text" className="form-control" id={"r_ph_bl_5" + edit} />
                        </div>
                    </div>
                </div>

            </>
        }
        let _COMPONENT_TOTAL = () => {
            let _LIST = _GET_CHILD_BLUEPRINTS();
            let _area = 0;
            let _units = [0, 0, 0, 0, 0, 0, 0]
            for (var i = 0; i < _LIST.length; i++) {
                _area += Number(_LIST[i].area);
                let split = (_LIST[i].units).split(';');
                _units[0] += Number(split[0] ?? 0);
                _units[1] += Number(split[1] ?? 0);
                _units[2] += Number(split[2] ?? 0);
                _units[3] += Number(split[3] ?? 0);
                _units[4] += Number(split[4] ?? 0);
                _units[5] += Number(split[5] ?? 0);
                _units[6] += Number(split[6] ?? 0);
            }
            return <>
                <div className="row">
                    <div className="col-12 border p-2 text-center">
                        <label className="fw-bold">Totales:</label>
                    </div>
                </div>
                <div className="row border p-2">
                    <div className="col-12">
                        <label>Construido: </label> <label className="fw-bold">{(_area).toFixed(2)} m2</label>
                    </div>
                </div>
                <div className="row border p-2">
                    <div className="col">
                        <label>Vivienda / Aptos: </label>  <label className="fw-bold">{_units[0]}</label>
                    </div>
                    <div className="col">
                        <label>Locales / Lockers: </label>  <label className="fw-bold">{_units[1]}</label>
                    </div>
                    <div className="col">
                        <label>Parcelas Lotes: </label>  <label className="fw-bold">{_units[2]}</label>
                    </div>
                    <div className="col">
                        <label>Parqueos: </label>   <label className="fw-bold">{_units[3]}</label>
                    </div>
                    <div className="col">
                        <label>Oficinas:  </label>  <label className="fw-bold">{_units[4]}</label>
                    </div>
                    <div className="col">
                        <label>Bodegas: </label>  <label className="fw-bold">{_units[5]}</label>
                    </div>
                    <div className="col">
                        <label>Número Parqueos: </label>  <label className="fw-bold">{_units[6]}</label>
                    </div>
                </div>
            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let new_item = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('recordPhId', currentRecord.id);

            let id_public = document.getElementById("r_ph_bl_1").value;
            if (id_public) formData.set('id_public', id_public);
            let floor = document.getElementById("r_ph_bl_2").value;
            if (floor) formData.set('floor', floor);
            let area = document.getElementById("r_ph_bl_3").value;
            if (area) formData.set('area', area);
            let units_other = document.getElementById("r_ph_bl_5").value;
            if (units_other) formData.set('units_other', units_other);

            let units = [];

            let items = document.getElementsByName("r_ph_bl_4");
            for (var i = 0; i < items.length; i++) {
                units.push(items[i].value);
            }
            formData.set('units', units.join(';'));

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.create_blueprint(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        requestUpdateRecord(currentItem.id);
                        document.getElementById('form_ph_blueprint_new').reset();
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
        let delete_item = (id) => {
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
                    RECORD_PH_SERVICE.delete_blueprint(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                requestUpdateRecord(currentItem.id);
                                setEdit(false);
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
        let edit_item = (e) => {
            e.preventDefault();
            formData = new FormData();

            let id_public = document.getElementById("r_ph_bl_1_edit").value;
            formData.set('id_public', id_public);
            let floor = document.getElementById("r_ph_bl_2_edit").value;
            formData.set('floor', floor);
            let area = document.getElementById("r_ph_bl_3_edit").value;
            formData.set('area', area);
            let units_other = document.getElementById("r_ph_bl_5_edit").value;
            formData.set('units_other', units_other);

            let units = [];

            let items = document.getElementsByName("r_ph_bl_4_edit");
            for (var i = 0; i < items.length; i++) {
                units.push(items[i].value);
            }
            if (units.length) formData.set('units', units.join(';'));

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.update_blueprint(edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        requestUpdateRecord(currentItem.id);
                        document.getElementById('form_ph_blueprint_edit').reset();
                        setEdit(false);
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
            <div className="record_law_gen_11 container my-2">
                <label className="app-p lead fw-bold">RELACIÓN DE PLANOS PRESENTADOS</label>

                <div className="form-check ms-5">
                    <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Nuevo Plano
                    </label>
                </div>
                {isNew
                    ? <>
                        <form id="form_ph_blueprint_new" onSubmit={new_item}>
                            {_COMPONENT_MANAGE()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><Icon name="file-alt" size={16} /> AÑADIR ITEM </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
                {_CHILD_LICENCE_LIST()}
                {_COMPONENT_TOTAL()}
                {edit
                    ? <>
                        <form id="form_ph_blueprint_edit" onSubmit={edit_item}>
                            <h3 className="my-3 text-center">Actualizar Plano</h3>
                            {_COMPONENT_MANAGE('_edit')}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><Icon name="file-alt" size={16} /> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
            </div >
        );
}

export default RECORD_PH_BLUEPRINT;