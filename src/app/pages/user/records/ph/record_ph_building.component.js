
import { useState, useEffect } from 'react';
import DataTable from '@/components/data-table-bridge';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import { Icon } from '@/components/icon';

const MySwal = withReactContent(Swal);

function RECORD_PH_BUILDING({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, CATEGORY, requestUpdateRecord }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);

    useEffect(() => {
        if (edit !== false) {
            var _ITEM = edit;

            document.getElementById("r_ph_g_1_edit").value = _ITEM.number;
            document.getElementById("r_ph_g_2_edit").value = _ITEM.predial;
            document.getElementById("r_ph_g_3_edit").value = _ITEM.matricula;
            document.getElementById("r_ph_g_4_edit").value = _ITEM.nomenclature;
            document.getElementById("r_ph_g_5_edit").value = _ITEM.area;
        }
    }, [edit]);

        // DATA GETTERS
        let _GET_CHILD_BUILDINGS = () => {
            var _CHILD = currentRecord.record_ph_buildings;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        // DATA CONVERTERS

        // COMPONENT JSX
        let _CHILD_LICENCE_LIST = () => {
            let _LIST = _GET_CHILD_BUILDINGS();
            const columns = [
                {
                    name: 'PREDIO N°',
                    selector: row => row.number,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{row.number}</span>
                },
                {
                    name: 'PREDIAL',
                    selector: row => row.predial,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{row.predial}</span>
                },
                {
                    name: 'MATRICULA',
                    selector: row => row.matricula,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{row.matricula}</span>
                },
                {
                    name: 'NOMENCLATURA',
                    selector: row => row.nomenclature,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label >{row.nomenclature}</label>
                },
                {
                    name: 'AREA Y LINDEROS',
                    selector: row => row.area,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label >{row.area} m2</label>
                },
                {
                    name: 'ACCIÓN',
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
                        <label>Predio N°</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                            <Icon name="hashtag" size={16} />
                            </span>
                            <input type="number" className="form-control" id={"r_ph_g_1" + edit} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Área y Linderos (m2)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                            <Icon name="ruler" size={16} />
                            </span>
                            <input type="number" step="0.01" className="form-control" id={"r_ph_g_5" + edit} />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-4">
                        <label>Número Predial</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="home" size={16} />
                            </span>
                            <input type="text" className="form-control" id={"r_ph_g_2" + edit} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Matricula</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="home" size={16} />
                            </span>
                            <input type="text" className="form-control" id={"r_ph_g_3" + edit} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Nomenclatura</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="home" size={16} />
                            </span>
                            <input type="text" className="form-control" id={"r_ph_g_4" + edit} />
                        </div>

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

            let number = document.getElementById("r_ph_g_1").value;
            if (number) formData.set('number', number);
            let predial = document.getElementById("r_ph_g_2").value;
            if (number) formData.set('predial', predial);
            let matricula = document.getElementById("r_ph_g_3").value;
            if (matricula) formData.set('matricula', matricula);
            let nomenclature = document.getElementById("r_ph_g_4").value;
            if (nomenclature) formData.set('nomenclature', nomenclature);
            let area = document.getElementById("r_ph_g_5").value;
            if (area) formData.set('area', area);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.create_building(formData)
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
                        document.getElementById('form_ph_building_new').reset();
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
                    RECORD_PH_SERVICE.delete_building(id)
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

            let number = document.getElementById("r_ph_g_1_edit").value;
            if (number) formData.set('number', number);
            let predial = document.getElementById("r_ph_g_2_edit").value;
            if (number) formData.set('predial', predial);
            let matricula = document.getElementById("r_ph_g_3_edit").value;
            if (matricula) formData.set('matricula', matricula);
            let nomenclature = document.getElementById("r_ph_g_4_edit").value;
            if (nomenclature) formData.set('nomenclature', nomenclature);
            let area = document.getElementById("r_ph_g_5_edit").value;
            if (area) formData.set('area', area);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.update_building(edit.id, formData)
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
                        document.getElementById('form_ph_building_edit').reset();
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
                <label className="app-p lead fw-bold">DATOS DE PREDIO(S)</label>

                <div className="form-check ms-5">
                    <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Nuevo Predio
                    </label>
                </div>
                {isNew
                    ? <>
                        <form id="form_ph_building_new" onSubmit={new_item}>
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
                {edit
                    ? <>
                        <form id="form_ph_building_edit" onSubmit={edit_item}>
                            <h3 className="my-3 text-center">Actualizar Predio</h3>
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

export default RECORD_PH_BUILDING;