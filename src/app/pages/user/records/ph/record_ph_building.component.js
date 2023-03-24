import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'

const MySwal = withReactContent(Swal);

class RECORD_PH_BUILDING extends Component {
    constructor(props) {
        super(props);
        this.state = {
            new: false,
            edit: false,
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            var _ITEM = this.state.edit;

            document.getElementById("r_ph_g_1_edit").value = _ITEM.number;
            document.getElementById("r_ph_g_2_edit").value = _ITEM.predial;
            document.getElementById("r_ph_g_3_edit").value = _ITEM.matricula;
            document.getElementById("r_ph_g_4_edit").value = _ITEM.nomenclature;
            document.getElementById("r_ph_g_5_edit").value = _ITEM.area;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, CATEGORY } = this.props;
        const { } = this.state;

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
                    name: <label className="text-center">PREDIO N°</label>,
                    selector: 'number',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.number}</label>
                },
                {
                    name: <label className="text-center">PREDIAL</label>,
                    selector: 'predial',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.predial}</label>
                },
                {
                    name: <label className="text-center">MATRICULA</label>,
                    selector: 'matricula',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.matricula}</label>
                },
                {
                    name: <label className="text-center">NOMENCLATURA</label>,
                    selector: 'nomenclature',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label >{row.nomenclature}</label>
                },
                {
                    name: <label className="text-center">AREA Y LINDEROS</label>,
                    selector: 'area',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label >{row.area} m2</label>
                },
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-secondary m-0 p-2 shadow-none" onClick={() => this.setState({ edit: row })}><i class="far fa-edit fa-2x"></i></MDBBtn>
                        </MDBTooltip>
                        <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <MDBBtn className="btn btn-danger m-0 p-2 shadow-none" onClick={() => delete_item(row.id)}><i class="far fa-trash-alt fa-2x"></i></MDBBtn>
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
                className="data-table-component"
                noHeader
            />
        }
        let _COMPONENT_MANAGE = (edit = "") => {
            return <>
                <div className="row mb-1">
                    <div className="col-3">
                        <label>Predio N°</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                            <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="number" class="form-control" id={"r_ph_g_1" + edit} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Área y Linderos (m2)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                            <i class="fas fa-ruler"></i>
                            </span>
                            <input type="number" step="0.01" class="form-control" id={"r_ph_g_5" + edit} />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-4">
                        <label>Número Predial</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="text" class="form-control" id={"r_ph_g_2" + edit} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Matricula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="text" class="form-control" id={"r_ph_g_3" + edit} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Nomenclatura</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="text" class="form-control" id={"r_ph_g_4" + edit} />
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
                        this.props.requestUpdateRecord(currentItem.id);
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
                                this.props.requestUpdateRecord(currentItem.id);
                                this.setState({ edit: false });
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
            RECORD_PH_SERVICE.update_building(this.state.edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.requestUpdateRecord(currentItem.id);
                        document.getElementById('form_ph_building_edit').reset();
                        this.setState({ edit: false });
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

                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Nuevo Predio
                    </label>
                </div>
                {this.state.new
                    ? <>
                        <form id="form_ph_building_new" onSubmit={new_item}>
                            {_COMPONENT_MANAGE()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
                {_CHILD_LICENCE_LIST()}
                {this.state.edit
                    ? <>
                        <form id="form_ph_building_edit" onSubmit={edit_item}>
                            <h3 className="my-3 text-center">Actualizar Predio</h3>
                            {_COMPONENT_MANAGE('_edit')}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
            </div >
        );
    }
}

export default RECORD_PH_BUILDING;