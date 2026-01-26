import React, { Component } from 'react';
import FUNService from '../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import { dateParser } from '../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);
class FUNN3 extends Component {
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
            document.getElementById("f_31_edit").value = _ITEM.direccion_1;
            document.getElementById("f_32_edit").value = _ITEM.direccion_2;
            document.getElementById("f_33a_edit").value = _ITEM.part;
            document.getElementById("f_33b_edit").value = _ITEM.part_id;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;

        var formData = new FormData();

        // DARA GETTERS
        let _SET_CHILD_3 = () => {
            var _CHILD = currentItem.fun_3s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        // DATA CONVERTERS
        let _FIND_6 = (_ID) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }
        let _GET_NEIGHBOUR_STATE = (_state) => {
            if (!_state) return <label className="fw-bold text-danger">PENDIENTE</label>
            else if (_state == 1) return <label className="fw-bold text-success">CITACION POSITIVA</label>
            else if (_state == 2) return <label className="fw-bold text-warning">CITACION NEGATIVA</label>
        }
        let _GET_NEIGHBOUR_ALERTS = (_alerts_info) => {
            if (!_alerts_info) return "";
            let _alerts_array = _alerts_info;
            _alerts_array = _alerts_array.split(',');
            let _ALERT = [];
            for (var i = 0; i < _alerts_array.length; i++) {
                if (_alerts_array[i].includes("ALERT_1"))
                    if (_alerts_array[i].split('&')[1]) _ALERT.push(<><label>Periódico el {dateParser(_alerts_array[i].split('&')[1])}</label><br /></>);
                if (_alerts_array[i].includes("ALERT_2"))
                    if (_alerts_array[i].split('&')[1]) _ALERT.push(<><label>Radio el {dateParser(_alerts_array[i].split('&')[1])}</label><br /></>);
                if (_alerts_array[i].includes("ALERT_3"))
                    if (_alerts_array[i].split('&')[1]) _ALERT.push(<><label>Pagina Web el {dateParser(_alerts_array[i].split('&')[1])}</label><br /></>);
                if (_alerts_array[i].includes("ALERT_4"))
                    if (_alerts_array[i].split('&')[1]) _ALERT.push(<><label>Físico el {dateParser(_alerts_array[i].split('&')[1])}</label><br /></>);
            }
            return <>{_ALERT}</>
        }
        let _GET_NEIGHBOUR_ALERTS_ID6 = (_alerts_info) => {
            if (!_alerts_info) return "";
            let _alerts_array = _alerts_info;
            _alerts_array = _alerts_array.split(',');
            let _ALERT = [];
            for (var i = 0; i < _alerts_array.length; i++) {
                if (_alerts_array[i].includes("ALERT_1")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Pediódico:
                        <a target="_blank"
                            href={process.env.REACT_APP_API_URL + '/files/' + _alerts_array[i].split('&')[2].path + "/" + _alerts_array[i].split('&')[2].filename} >
                            <i class="fas fa-cloud-download-alt" style={{ "color": "Crimson" }}></i></a>
                        <br />
                    </>);
                }
                if (_alerts_array[i].includes("ALERT_2")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Radio:
                        <a target="_blank"
                            href={process.env.REACT_APP_API_URL + '/files/' + _alerts_array[i].split('&')[2].path + "/" + _alerts_array[i].split('&')[2].filename} >
                            <i class="fas fa-cloud-download-alt" style={{ "color": "Crimson" }}></i></a>
                        <br />
                    </>);
                }
                if (_alerts_array[i].includes("ALERT_3")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Pagina Web:
                        <a target="_blank"
                            href={process.env.REACT_APP_API_URL + '/files/' + _alerts_array[i].split('&')[2].path + "/" + _alerts_array[i].split('&')[2].filename} >
                            <i class="fas fa-cloud-download-alt" style={{ "color": "Crimson" }}></i></a>
                        <br />
                    </>);
                }
                if (_alerts_array[i].includes("ALERT_4")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Físico:
                        <a target="_blank"
                            href={process.env.REACT_APP_API_URL + '/files/' + _alerts_array[i].split('&')[2].path + "/" + _alerts_array[i].split('&')[2].filename} >
                            <i class="fas fa-cloud-download-alt" style={{ "color": "Crimson" }}></i></a>
                    </>);
                }
            }
            return <>{_ALERT}</>
        }

        // COMPONENT JSX
        let _CHILD_3_LIST = () => {
            let _LIST = _SET_CHILD_3();
            const columns_3 = [
                {
                    name: <label>DIRECCION DEL PREDIO</label>,
                    selector: row => row.direccion_1, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.direccion_1}</label>
                },
                {
                    name: <label>DIRECCIÓN DE CORRESPONDENCIA</label>,
                    selector: row => row.direccion_2, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.direccion_2}</label>
                },
                {
                    name: <label>ORIGEN DATO</label>,
                    cell: row => <label>{row.extra ? <label className="text-warning fw-bold">Añadido por la Curaduria</label> : "Diligenciado por el solicitante"}</label>
                },
                {
                    name: <label>¿SE DECLARÓ PARTE?</label>,
                    cell: row => <label>{row.part} - {row.part_id}</label>
                },
                {
                    name: <label>ESTADO CITACIÓN</label>,
                    selector: row => row.state, // FIX: react-data-table v7→v8 (was 'row.state')
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{_GET_NEIGHBOUR_STATE(row.state)}</label>
                },
                {
                    name: <label>CUB RELACIONADO</label>,
                    selector: row => row.id_cub, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.id_cub}</label>
                },
                {
                    name: <label>GUIA DE CONFIRMACION</label>,
                    selector: row => row.id_alerted, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.id_alerted == "-1"
                        ? ""
                        : row.id_alerted}</label>
                },
                {
                    name: <label>FECHA RECIBIDO</label>,
                    selector: row => row.alerted, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.state == 1 ? dateParser(row.alerted) : ""}</label>
                },
                {
                    name: <label>METODOS DE PUBLICACION</label>,
                    minWidth: '250px',
                    cell: row => <label>{_GET_NEIGHBOUR_ALERTS(row.alters_info)}</label>
                },
                {
                    name: <label>SOPORTES DE PUBLICACION</label>,

                    minWidth: '200px',
                    cell: row => <label>{_GET_NEIGHBOUR_ALERTS_ID6(row.alters_info)}</label>
                },
                {
                    name: <label>DOCUMENTO</label>,
                    button: true,
                    minWidth: '150px',
                    cell: row =>  <>
                    {row.id_6
                        ? 
                        <VIZUALIZER url={_FIND_6(row.id_6).path + "/" + _FIND_6(row.id_6).filename}
                        apipath={'/files/'} />
                        : ""}</>
                },
                {
                    name: <label>ACCION</label>,
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                        <MDBBtn className="btn btn-secondary btn-sm m-0 p-2 shadow-none" onClick={() => this.setState({ edit: row })}>
                            <i class="far fa-edit fa-2x"></i></MDBBtn>
                        </MDBTooltip>
                        <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                        <MDBBtn className="btn btn-danger btn-sm m-0 p-2 shadow-none" onClick={() => delete_3(row.id)}>
                            <i class="far fa-trash-alt fa-2x"></i></MDBBtn>
                        </MDBTooltip>
                    </>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_3}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }
        let _COMPONENT_NEW_FUN_3 = () => {
            return <>
                <div className="row mb-3">
                    <div className="col-6">
                        <label >3.1 Dirección del Predio</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_31" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>3.2 Dirección de correspondencia</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_32" />
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label >3.3 ¿Se declaró parte? Nombre</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_33a" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>3.3 ¿Se declaró parte? No. de CUB</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="f_33b" />
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_EDIT_FUN_3 = () => {
            return <>
                <div className="row mb-3">
                    <div className="col-6">
                        <label >3.1 Dirección del Predio</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_31_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>3.2 Dirección de correspondencia</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_32_edit" />
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label >3.3 ¿Se declaró parte? Nombre</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_33a_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>3.3 ¿Se declaró parte? No. Radicación</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="f_33b_edit" />
                        </div>
                    </div>
                </div>
            </>
        }

        // FUNCTIONS & APIS
        let new_3 = (e) => {
            e.preventDefault();
            let fun0Id = null;
            //
            formData = new FormData();
            fun0Id = currentItem.id;
            formData.set('fun0Id', fun0Id);
            let direccion_1 = document.getElementById("f_31").value;
            formData.set('direccion_1', direccion_1);
            let direccion_2 = document.getElementById("f_32").value;
            formData.set('direccion_2', direccion_2);
            let part = document.getElementById("f_33a").value;
            formData.set('part', part);
            let part_id = document.getElementById("f_33b").value;
            formData.set('part_id', part_id);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.create_fun3(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        document.getElementById('form_fun_3_new').reset();
                        this.props.requestUpdate(currentItem.id);
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
        let delete_3 = (id) => {
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
                    FUNService.delete_3(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.requestUpdate(currentItem.id);
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
        let edit_3 = (e) => {
            e.preventDefault();
            formData = new FormData();
            let direccion_1 = document.getElementById("f_31_edit").value;
            formData.set('direccion_1', direccion_1);
            let direccion_2 = document.getElementById("f_32_edit").value;
            formData.set('direccion_2', direccion_2);
            let part = document.getElementById("f_33a_edit").value;
            formData.set('part', part);
            let part_id = document.getElementById("f_33b_edit").value;
            formData.set('part_id', part_id);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.update_3(this.state.edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.requestUpdate(currentItem.id);
                        document.getElementById('form_fun_3_edit').reset();
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

        return (<>
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_3">
                    <label className="app-p lead text-center fw-normal text-uppercase">3. Información de Vecinos Colindantes</label>
                </legend>
                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Añadir Vecino Colidante
                    </label>
                </div>
                {this.state.new
                    ? <>
                        <form id="form_fun_3_new" onSubmit={new_3}>
                            {_COMPONENT_NEW_FUN_3()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3"><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                </div>
                            </div>
                        </form>
                    </> : ""}
                {_CHILD_3_LIST()}
                {this.state.edit
                    ? <>
                        <form id="form_fun_3_edit" onSubmit={edit_3}>
                            <h3 className="my-3 text-center">Actualizar Vecino</h3>
                            {_COMPONENT_EDIT_FUN_3()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
            </fieldset>
        </>);
    }
}

export default FUNN3;