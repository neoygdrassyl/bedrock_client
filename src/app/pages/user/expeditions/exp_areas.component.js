import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { cities, infoCud, rules_opt } from '../../../components/jsons/vars';
import EXPEDITION_SERVICE from '../../../services/expedition.service';
import record_arcService from '../../../services/record_arc.service';
import RECORD_ARC_AREAS_RESUME from '../records/arc/record_arc_areas_resumen.component';
import EXP_CALC from './exp_calc.component';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

class EXP_AREAS extends Component {
    constructor(props) {
        super(props);
        this.setItem_RecordArc = this.setItem_RecordArc.bind(this);
        this.state = {
            new: false,
            edit: false,
            currentRecordArc: null,
            currentVersionRArc: null,
        };
    }
    componentDidMount() {
        this.setItem_RecordArc(this.props.currentItem.id)
    }

    componentDidUpdate(prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            var _ITEM = this.state.edit;

            document.getElementById("expedition_area_1_edit").value = _ITEM.area;
            document.getElementById("expedition_area_2_edit").value = _ITEM.charge;
            document.getElementById("expedition_area_3_edit").value = _ITEM.use;
            document.getElementById("expedition_area_4_edit").value = _ITEM.desc;
            document.getElementById("expedition_area_5_edit").value = _ITEM.payment;
            document.getElementById("expedition_area_6_edit").value = _ITEM.units;
        }
    }

    setItem_RecordArc(id) {
        record_arcService.getRecord(id || this.props.currentItem.id)
            .then(response => {
                let record_arc = response.data.record_arc
                record_arc.record_arc_steps = response.data.record_arc_steps;
                record_arc.record_arc_33_areas = response.data.record_arc_33_areas;
                record_arc.record_arc_34_ks = response.data.record_arc_34_ks;
                record_arc.record_arc_34_gens = response.data.record_arc_34_gens;
                record_arc.record_arc_35_parkings = response.data.record_arc_35_parkings;
                record_arc.record_arc_36_infos = response.data.record_arc_36_infos;
                record_arc.record_arc_37s = response.data.record_arc_37s;
                record_arc.record_arc_35_locations = response.data.record_arc_35_locations;
                record_arc.record_arc_38s = response.data.record_arc_38s;

                this.setState({
                    currentRecordArc: record_arc,
                    currentVersionRArc: record_arc.version,
                    loaded: true,
                });

            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: this.props.swaMsg.generic_eror_title,
                    text: this.props.swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { currentRecordArc, currentVersionRArc } = this.state;

        // DATA GETTERS
        let _GET_CHILD_AREAS = () => {
            var _CHILD = currentRecord.exp_areas;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        // COMPONENT JSX
        let _CHILD_AREA_LIST = () => {
            let _LIST = _GET_CHILD_AREAS();
            const columns = [
                {
                    name: <label className="text-center">AREA</label>,
                    selector: row => row.area,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '40px',
                    cell: row => <label>{row.area}</label>
                },
                {
                    name: <label className="text-center">UNIDADES</label>,
                    selector: row => row.units,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '40px',
                    cell: row => <label>{row.units}</label>
                },
                {
                    name: <label className="text-center">COBRO  * m2/U</label>,
                    selector: row => row.charge,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '40px',
                    omit: _GLOBAL_ID != 'cp1',
                    cell: row => <label>{row.charge}</label>
                },
                {
                    name: <label className="text-center">COBRO TOTAL</label>,
                    selector: row => row.charge * row.area,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '40px',
                    cell: row => <label>{_GLOBAL_ID == 'cp1' ? Math.round(row.charge * row.area) : row.charge}</label>
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
                    name: <label className="text-center">TIPO DE ACTUACIÓN</label>,
                    selector: row => row.desc,
                    sortable: true,
                    filterable: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label>{row.desc}</label>
                },
                {
                    name: <label className="text-center">REGLAS</label>,
                    selector: row => row.payment,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '60px',
                    compact: true,
                    cell: row => <label >{infoCud.exp_rules[row.payment] ?? ''}</label>
                },
                {
                    name: <label>ACCION</label>,
                    button: true,
                    maxWidth: '50px',
                    cell: row => <>
                        <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 me-1">
                            <MDBBtn className="btn btn-secondary m-0 p-1 shadow-none" onClick={() => this.setState({ edit: row })}><i class="far fa-edit"></i></MDBBtn>
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
        let _COMPONENT_MANAGE = (edit = "") => {
            return <>
                <div className="row mb-1">
                    <div className="col">
                        <label>Área</label>
                        <div class="input-group my-1">
                            <input type="number" min="0" step="0.01" class="form-control" id={"expedition_area_1" + edit} required />
                        </div>
                    </div>
                    <div className="col">
                        <label>Unidades</label>
                        <div class="input-group my-1">
                            <input type="number" min="0" step="1" class="form-control" id={"expedition_area_6" + edit} required />
                        </div>
                    </div>
                    <div className="col-2">
                        {_GLOBAL_ID == 'cp1' ?
                            <label>Cobro (COP) x m2</label>
                            : <label>Cobro (COP) Total</label>
                        }

                        <div class="input-group my-1">
                            <input type="number" min="0" step="0.0001" class="form-control" id={"expedition_area_2" + edit} required />
                        </div>
                    </div>
                    <div className="col">
                        <label>Uso</label>
                        <div class="input-group my-1">
                            <input list="exp_uses_datalist" className="form-select" id={"expedition_area_3" + edit} required />

                            <datalist id="exp_uses_datalist">
                                <option value="Residencial (NO VIS)" />
                                <option value="Residencial (VIS)" />
                                <option value="Residencial (VIP)" />
                                <option value="Comercial y de Servicios" />
                                <option value="Dotacional" />
                                <option value="Industrial" />
                                <option value="Multiple" />
                                <option value="Mixto" />
                            </datalist>
                        </div>
                    </div>
                    <div className="col">
                        <label>Tipo de Actuación</label>
                        <div class="input-group my-1">
                            <input type="text" class="form-control" id={"expedition_area_4" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Destino</label>
                        <div class="input-group my-1">
                            <select className="form-select" id={"expedition_area_5" + edit} required >
                                {rules_opt}
                            </select>
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

            formData.set('expeditionId', currentRecord.id);

            let area = document.getElementById("expedition_area_1").value;
            if (area) formData.set('area', area);
            let charge = document.getElementById("expedition_area_2").value;
            if (charge) formData.set('charge', charge);
            let use = document.getElementById("expedition_area_3").value;
            formData.set('use', use);
            let desc = document.getElementById("expedition_area_4").value;
            if (desc) formData.set('desc', desc);
            let payment = document.getElementById("expedition_area_5").value;
            if (payment) formData.set('payment', payment);
            let units = document.getElementById("expedition_area_6").value;
            if (units) formData.set('units', units);
            else formData.set('units', 1);


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
                        this.props.requestUpdateRecord(currentItem.id);
                        document.getElementById('form_expedition_area').reset();
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

            let area = document.getElementById("expedition_area_1_edit").value;
            formData.set('area', area);
            let charge = document.getElementById("expedition_area_2_edit").value;
            formData.set('charge', charge);
            let use = document.getElementById("expedition_area_3_edit").value;
            formData.set('use', use);
            let desc = document.getElementById("expedition_area_4_edit").value;
            formData.set('desc', desc);
            let payment = document.getElementById("expedition_area_5_edit").value;
            formData.set('payment', payment);
            let units = document.getElementById("expedition_area_6_edit").value;
            if (units) formData.set('units', units);
            else formData.set('units', 1);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.update_exp_area(this.state.edit.id, formData)
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
                        document.getElementById('form_expedition_area_edit').reset();
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
            <div className="expedition_areas my-2">
                <legend className="my-2 px-3 text-uppercase bg-light" id="nav_expedition_10">
                    <label className="app-p lead fw-normal">Áreas Y Unidades</label>
                </legend>
                {currentRecordArc ?
                    <>
                        <label className='fw-bold'>RESUMEN DE AREAS</label>
                        <RECORD_ARC_AREAS_RESUME
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            currentRecord={currentRecordArc}
                            currentVersionR={currentVersionRArc}
                        />
                    </>

                    : null}


                <hr />
                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Nueva Área
                    </label>
                </div>
                {this.state.new
                    ? <>
                        <form id="form_expedition_area" onSubmit={new_item}>
                            {_COMPONENT_MANAGE()}
                            <div className="row my-3 text-center">
                                <div className="col">
                                    <button className="btn btn-success btn-sm" ><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                </div>
                                <div className='col'>
                                    <EXP_CALC
                                        ranslation={translation} swaMsg={swaMsg} globals={globals}
                                        domArea={'expedition_area_1'}
                                        domM2={'expedition_area_2'}
                                        domUse={'expedition_area_3'}
                                        domTipe={'expedition_area_4'}
                                    />
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
                {_CHILD_AREA_LIST()}
                {this.state.edit
                    ? <>
                        <form id="form_expedition_area_edit" onSubmit={edit_item}>
                            <h3 className="my-3 text-center">Actualizar Área</h3>
                            {_COMPONENT_MANAGE('_edit')}
                            <div className="row my-2 text-center">
                                <div className="col">
                                    <button className="btn btn-success btn-sm" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                                </div>
                                <div className='col'>
                                    <EXP_CALC
                                        ranslation={translation} swaMsg={swaMsg} globals={globals}
                                        domArea={'expedition_area_1_edit'}
                                        domM2={'expedition_area_2_edit'}
                                        domUse={'expedition_area_3_edit'}
                                        domTipe={'expedition_area_4_edit'}
                                    />
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
            </div >
        );
    }
}

export default EXP_AREAS;