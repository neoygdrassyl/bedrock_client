import { useState, useEffect } from 'react';
import FUNService from '../../../services/fun.service'
import DataTable from '@/components/data-table-bridge';

import { dateParser } from '../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../components/vizualizer.component';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

const FUNN3 = ({ translation, swaMsg, globals, currentItem, currentVersion, requestUpdate }) => {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);

    useEffect(() => {
        if (edit !== false) {
            var _ITEM = edit;
            document.getElementById("f_31_edit").value = _ITEM.direccion_1;
            document.getElementById("f_32_edit").value = _ITEM.direccion_2;
            document.getElementById("f_33a_edit").value = _ITEM.part;
            document.getElementById("f_33b_edit").value = _ITEM.part_id;
        }
    }, [edit]);

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
                            href={import.meta.env.VITE_API_URL + '/files/' + _alerts_array[i].split('&')[2].path + "/" + _alerts_array[i].split('&')[2].filename} >
                            <Icon name="cloud-download-alt" size={16} style={{ "color": "Crimson" }} /></a>
                        <br />
                    </>);
                }
                if (_alerts_array[i].includes("ALERT_2")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Radio:
                        <a target="_blank"
                            href={import.meta.env.VITE_API_URL + '/files/' + _alerts_array[i].split('&')[2].path + "/" + _alerts_array[i].split('&')[2].filename} >
                            <Icon name="cloud-download-alt" size={16} style={{ "color": "Crimson" }} /></a>
                        <br />
                    </>);
                }
                if (_alerts_array[i].includes("ALERT_3")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Pagina Web:
                        <a target="_blank"
                            href={import.meta.env.VITE_API_URL + '/files/' + _alerts_array[i].split('&')[2].path + "/" + _alerts_array[i].split('&')[2].filename} >
                            <Icon name="cloud-download-alt" size={16} style={{ "color": "Crimson" }} /></a>
                        <br />
                    </>);
                }
                if (_alerts_array[i].includes("ALERT_4")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Físico:
                        <a target="_blank"
                            href={import.meta.env.VITE_API_URL + '/files/' + _alerts_array[i].split('&')[2].path + "/" + _alerts_array[i].split('&')[2].filename} >
                            <Icon name="cloud-download-alt" size={16} style={{ "color": "Crimson" }} /></a>
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
                    name: 'DIRECCION DEL PREDIO',
                    selector: row => row.direccion_1, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.direccion_1}</span>
                },
                {
                    name: 'DIRECCIÓN DE CORRESPONDENCIA',
                    selector: row => row.direccion_2, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.direccion_2}</span>
                },
                {
                    name: 'ORIGEN DATO',
                    cell: row => <span className="text-sm">{row.extra ? <label className="text-warning fw-bold">Añadido por la Curaduria</label> : "Diligenciado por el solicitante"}</span>
                },
                {
                    name: '¿SE DECLARÓ PARTE?',
                    cell: row => <label>{row.part} - {row.part_id}</label>
                },
                {
                    name: 'ESTADO CITACIÓN',
                    selector: row => row.state, // FIX: react-data-table v7→v8 (was 'row.state')
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{_GET_NEIGHBOUR_STATE(row.state)}</span>
                },
                {
                    name: 'CUB RELACIONADO',
                    selector: row => row.id_cub, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.id_cub}</span>
                },
                {
                    name: 'GUIA DE CONFIRMACION',
                    selector: row => row.id_alerted, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.id_alerted == "-1"
                        ? ""
                        : row.id_alerted}</span>
                },
                {
                    name: 'FECHA RECIBIDO',
                    selector: row => row.alerted, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.state == 1 ? dateParser(row.alerted) : ""}</span>
                },
                {
                    name: 'METODOS DE PUBLICACION',
                    minWidth: '250px',
                    cell: row => <span className="text-sm">{_GET_NEIGHBOUR_ALERTS(row.alters_info)}</span>
                },
                {
                    name: 'SOPORTES DE PUBLICACION',

                    minWidth: '200px',
                    cell: row => <span className="text-sm">{_GET_NEIGHBOUR_ALERTS_ID6(row.alters_info)}</span>
                },
                {
                    name: 'DOCUMENTO',
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
                    name: 'ACCION',
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <span title="Modificar Item"><button type="button" className="btn btn-secondary btn-sm m-0 p-2 shadow-none" onClick={() => setEdit(row)}>
                            <Icon name="edit" size={16} /></button></span>
                        <span title="Eliminar Item"><button type="button" className="btn btn-danger btn-sm m-0 p-2 shadow-none" onClick={() => delete_3(row.id)}>
                            <Icon name="trash-alt" size={16} /></button></span>
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="map-marked-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_31" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>3.2 Dirección de correspondencia</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="map-marked-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_32" />
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label >3.3 ¿Se declaró parte? Nombre</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_33a" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>3.3 ¿Se declaró parte? No. de CUB</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="hashtag" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_33b" />
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="map-marked-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_31_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>3.2 Dirección de correspondencia</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="map-marked-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_32_edit" />
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label >3.3 ¿Se declaró parte? Nombre</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_33a_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>3.3 ¿Se declaró parte? No. Radicación</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="hashtag" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_33b_edit" />
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUNService.create_fun3(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        document.getElementById('form_fun_3_new').reset();
                        requestUpdate(currentItem.id);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
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
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    FUNService.delete_3(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                requestUpdate(currentItem.id);
                                setEdit(false);
                            } else {
                                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUNService.update_3(edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        requestUpdate(currentItem.id);
                        document.getElementById('form_fun_3_edit').reset();
                        setEdit(false);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                });
        }

        return (<>
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_3">
                    <label className="app-p lead text-center fw-normal text-uppercase">3. Información de Vecinos Colindantes</label>
                </legend>
                <div className="form-check ms-5">
                    <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Añadir Vecino Colidante
                    </label>
                </div>
                {isNew
                    ? <>
                        <form id="form_fun_3_new" onSubmit={new_3}>
                            {_COMPONENT_NEW_FUN_3()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3"><Icon name="file-alt" size={16} /> AÑADIR ITEM </button>
                                </div>
                            </div>
                        </form>
                    </> : ""}
                {_CHILD_3_LIST()}
                {edit
                    ? <>
                        <form id="form_fun_3_edit" onSubmit={edit_3}>
                            <h3 className="my-3 text-center">Actualizar Vecino</h3>
                            {_COMPONENT_EDIT_FUN_3()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><Icon name="file-alt" size={16} /> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
            </fieldset>
        </>);
};

export default FUNN3;