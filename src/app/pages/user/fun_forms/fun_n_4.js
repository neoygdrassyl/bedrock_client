import React, { Component } from 'react';
import FUNService from '../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import { MDBBtn } from 'mdb-react-ui-kit';

const MySwal = withReactContent(Swal);
class FUNN4 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;

        var formData = new FormData();

        let _SET_CHILD_4 = () => {
            var _CHILD = currentItem.fun_4s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _CHILD_4_LIST = () => {
            let _LIST = _SET_CHILD_4();
            const columns_4 = [
                {
                    name: <label>LINDEROS</label>,
                    selector: 'coord',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.coord}</label>
                },
                {
                    name: <label>LONGITUD</label>,
                    selector: 'longitud',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.longitud}</label>
                },
                {
                    name: <label>COLINDA CON</label>,
                    selector: 'colinda',
                    cell: row => <label>{row.colinda}</label>
                },
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    cell: row => <MDBBtn className="btn btn-sm btn-danger" onClick={() => delete_4(row.id)}><i class="far fa-trash-alt fa-2x"></i></MDBBtn>
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_4}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 15]}
                className="data-table-component"
                noHeader
            />
        }

        let new_4 = () => {
            let fun0Id = null;
            //
            formData = new FormData();
            fun0Id = currentItem.id;
            formData.set('fun0Id', fun0Id);
            let coord = document.getElementById("f_41").value;
            formData.set('coord', coord);
            let colinda = document.getElementById("f_43").value;
            formData.set('colinda', colinda);
            let longitud = document.getElementById("f_42").value;
            formData.set('longitud', longitud);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.create_fun4(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.requestUpdate(currentItem.id)
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
        let delete_4 = (id) => {
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
                    FUNService.delete_4(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.requestUpdate(currentItem.id)
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

        return (<>
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_4">
                    <label className="app-p lead text-center fw-normal text-uppercase">4. Linderos, Dimensiones y Áreas</label>
                </legend>
                <div className="row mb-3">
                    <div className="col-4">
                        <label>4.1 Linderos</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-compass"></i>
                            </span>
                            <select class="form-select" required id="f_41" >
                                <option>NORTE</option>
                                <option>SUR</option>
                                <option>ORIENTE</option>
                                <option>OCCIDENTE</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-4">
                        <label>4.2 Longitud (en m)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-ruler"></i>
                            </span>
                            <input type="text" class="form-control" id="f_42" />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>4.3 Colinda con </label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="text" class="form-control" id="f_43" />
                        </div>
                    </div>
                </div>
                <div className="row mb-3 text-center">
                    <div className="col-12">
                        <MDBBtn className="btn btn-success my-3" onClick={() => new_4()}><i class="far fa-file-alt"></i> AÑADIR ITEM </MDBBtn>
                    </div>
                </div>
                {_CHILD_4_LIST()}
            </fieldset>
        </>);
    }
}

export default FUNN4;