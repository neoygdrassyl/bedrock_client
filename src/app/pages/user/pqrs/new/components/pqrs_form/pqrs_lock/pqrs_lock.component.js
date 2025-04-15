import { MDBBtn } from "mdb-react-ui-kit";
import DataTable from "react-data-table-component";
import PQRS_Service from "../../../../../../../services/pqrs_main.service";
import PQRS_New_Service from "../../../../../../../services/new_pqrs.service";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useState } from "react";

const LockComponent = ({ swaMsg, currentItem, reloadPQR }) => {
    const [stateadd2, setStateadd2] = useState(1)
    const MySwal = withReactContent(Swal);

    const deteleAttach = (id) => {
        MySwal.fire({
            title: "ELIMINAR ÍTEM",
            text: "¿Esta seguro de eliminar este ítem de forma permanente?",
            icon: 'warning',
            confirmButtonText: "ELIMINAR",
            cancelButtonText: "CANCELAR",
            showCancelButton: true
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                PQRS_Service.deleteAttach(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.generic_success_title,
                                text: swaMsg.generic_success_text,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            reloadPQR(currentItem.id)
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
                    });
            }
        });
    }
    const lockPQRS = () => {
        MySwal.fire({
            title: "CERRAR PETICION " + currentItem.id_publico,
            text: "¿Esta seguro de cerrar esta peticion?",
            icon: 'warning',
            confirmButtonText: "CERRAR",
            cancelButtonText: "CANCELAR",
            showCancelButton: true
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                const formData = new FormData();
                formData.set('id_master', currentItem.id);

                let files = document.getElementsByName("files_close");

                formData.set('attachs_length', stateadd2);
                for (var i = 0; i < stateadd2; i++) {
                    formData.append('file', files[i].files[0], "pqrsout_" + files[i].files[0].name)
                }
                let array_form = [];
                let array_html = [];
                array_html = document.getElementsByName("files_close_names");
                for (var i = 0; i < array_html.length; i++) {
                    array_form.push(array_html[i].value)
                }
                formData.set('files_names', array_form);
                console.log("formData")
                for (var pair of formData.entries()) {
                    console.log(pair[0] + ', ' + pair[1]);
                }

                PQRS_New_Service.close(formData)
                    .then(response => {
                        console.log(response.data)
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.generic_success_title,
                                text: swaMsg.generic_success_text,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            reloadPQR(currentItem.id)
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
                    });
            }
        });
    };
    const _checkForOutputDocsClass2 = () => {
        // for (var i = 0; i < currentItem.pqrs_attaches.length; i++) {
        //     if (currentItem.pqrs_attaches[i].class == 2) {
        //         return true;
        //     }
        // }
        return false;
    }
    const _ATTACHSCLOSE_COMPONENT = () => {
        var _LIST = [];
        for (var i = 0; i < currentItem.pqrs_attaches.length; i++) {
            if (currentItem.pqrs_attaches[i].class == 2) {
                _LIST.push(currentItem.pqrs_attaches[i]);
            }
        }
        const columns = [
            {
                name: <h3>NOMBRE</h3>,
                selector: 'name',
                sortable: true,
                filterable: true,
                cell: row => <p className="pt-3 text-center">{row.public_name}</p>
            },
            {
                name: <h3>TIPO</h3>,
                selector: 'type',
                sortable: true,
                filterable: true,
                cell: row => <p className="pt-3">{row.type}</p>
            },
            {
                name: <h3>ACCIÓN</h3>,
                button: true,
                minWidth: '150px',
                cell: row => <>
                    <a className="btn btn-sm btn-danger mx-1" target="_blank" rel="noreferrer" href={process.env.REACT_APP_API_URL + '/files/pqrs/' + row.name}><i class="fas fa-cloud-download-alt fa-2x"></i></a>
                    <MDBBtn className="btn btn-sm btn-danger" onClick={() => deteleAttach(row.id)}><i class="far fa-trash-alt fa-2x"></i></MDBBtn>
                </>,
            },
        ]
        var _COMPONENT = <DataTable
            paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
            noDataComponent="No hay mensajes"
            striped="true"
            columns={columns}
            data={_LIST}
            highlightOnHover
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[20, 50, 100]}
            className="data-table-component"
            noHeader
        />
        return <>{_COMPONENT}</>;
    }
    const _ATTACHS_COMPONENT2 = () => {
        var _COMPONENT = [];
        for (var i = 0; i < stateadd2; i++) {
            _COMPONENT.push(<div className="row d-flex justify-content-center my-2">
                <div className="col-lg-8 col-md-8 ">
                    <label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTO ANEXO N° {i + 1}</label>
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                        <input type="file" class="form-control" name="files_close" accept="image/png, image/jpeg application/pdf" />
                    </div>
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                        <input type="text" class="form-control" name="files_close_names" placeholder="Nombre documento (nombre o corta descripcion)" />
                    </div>
                </div>
            </div>)
        }

        return <div>{_COMPONENT}</div>;
    }
    const addAttach2 = () => {
        setStateadd2(stateadd2 + 1)
    }
    const minusAttach2 = () => {
        setStateadd2(stateadd2 - 1)
    }
    return (
        <section>
            <label className="px-4 app-p lead fw-normal text-uppercase"><b>9. CERRAR PETICIÓN <i class="fab fa-expeditedssl"></i></b></label><br></br>
            <label className="px-4"><h5><p>GUIÁ PARA EL CIERRE DE LA PETICIÓN</p></h5></label>
            <ul>
                <li className="app-p"><h5>Asegurar envío con copia del email o guiá de envío de recibido por parte del peticionario, digitalizar y anexar.</h5></li>
                <li className="app-p"><h5>Digitalizar Copias de los correos y anexos enviados al documento de respuesta.</h5></li>
            </ul>
            {_checkForOutputDocsClass2()
                ? <table className="table table-sm table-hover table-bordered">
                    <tbody>
                        <tr className="bg-warning">
                            <th><label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTOS DE CIERRE ANEXADOS</label></th>
                        </tr>
                        {_ATTACHSCLOSE_COMPONENT()}
                    </tbody>
                </table>
                : <div className="text-start"><label className="app-p fw-bold text-uppercase text-danger">NO SE ENCONTRARON DOCUMENTOS ANEXOS DE CIERRE PARA ESA SOLICITUD</label></div>}

            <p className="app-p lead text-end fw-bold text-uppercase">ANEXAR DOCUMENTO DE CIERRE</p>
            <div className="text-end m-3">
                {stateadd2 > 0
                    ? <MDBBtn className="btn btn-sm btn-secondary mx-3" onClick={() => minusAttach2()}><i class="fas fa-minus-circle"></i> REMOVER ULTIMO </MDBBtn>
                    : ""}
                <MDBBtn className="btn btn-sm btn-secondary" onClick={() => addAttach2()}><i class="fas fa-plus-circle"></i> AÑADIR </MDBBtn>
            </div>
            {_ATTACHS_COMPONENT2()}

            <hr />
            <div className="text-center m-3">
                <button type="button" onClick={() => lockPQRS()} className="btn btn-sm btn-success" ><i class="fas fa-lock"></i> CERRAR PETICIÓN</button>
            </div>

        </section>
    )
}
export default LockComponent