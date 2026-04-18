import { useState } from 'react';

import DataTable from 'react-data-table-component';
import VIZUALIZER from '../../../../components/vizualizer.component';
import PQRS_Service from '../../../../services/pqrs_main.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Icon } from '@/components/icon';

const MySwal = withReactContent(Swal);
function PQRS_COMPONENT_ATTACHS({ translation, swaMsg, globals, currentItem, add, retrieveItem }) {
    const [attachs, setAttachs] = useState(0);

    const addAttach = () => {
        setAttachs(attachs + 1);
    };
    const minusAttach = () => {
        setAttachs(attachs - 1);
    };
        const fileType = {
            '0': 'ANEXO',
            '1': 'ANEXO',
            '2': 'SALIDA',
        }
        //DATA GETTERS
        let _GET_ATTACHS = () => {
            return currentItem.pqrs_attaches;
        }

        // COMPONENTS JSX
        let _ATTACHES_COMPONENT = () => {
            var _LIST = _GET_ATTACHS();
            const columns = [
                {
                    name: <label>NOMBRE</label>,
                    selector: row => row.public_name,
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.public_name}</label>,
                },
                {
                    name: <label>TIPO</label>,
                    selector: row => row.class,
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{fileType[row.class ?? 0]}</label>,
                },
                {
                    name: <label>FORMATO</label>,
                    selector: row => row.type,
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.type}</label>,
                },

                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <VIZUALIZER url={row.name} apipath={row.path.includes('input') ? '/files/pqrsa/' : '/files/pqrs/'} />
                        {add ? <button type="button" className="btn btn-sm btn-danger mx-1 p-2" onClick={() => deteleAttach(row.id)}><Icon name="trash-alt" size={16} /></button> : ''}
                    </>,
                },
            ]
            var _COMPONENT = <DataTable
                noDataComponent="No hay Anexos"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
                dense
            />
            return _COMPONENT;
        }
        let _ATTACHS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < attachs; i++) {
                _COMPONENT.push(<div className="row d-flex justify-content-center my-2">
                    <div className="col-lg-8 col-md-8 ">
                        <label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTO ANEXO N° {i + 1}</label>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white" id="name"><Icon name="paperclip" size={16} /></span>
                            <input type="file" className="form-control" name="files_close" accept="image/png, image/jpeg application/pdf" />
                        </div>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white" id="name"><Icon name="paperclip" size={16} /></span>
                            <input type="text" className="form-control" name="files_close_names" placeholder="Nombre documento (nombre o corta descripcion)" />
                            <select className="form-select"  name="files_class">
                                <option value={'0'}>DOCUMENTO DE ENTRADA / ANEXO</option>
                                <option value={'2'}>DOCUMENTO DE RESPUESTA / SALIDA</option>
                            </select>
                        </div>
                    </div>
                </div>)
            }

            return <div>
                <p className="lead text-end fw-bold text-uppercase">ANEXAR DOCUMENTO</p>
                <div className="text-end m-3">
                    {attachs > 0 ? <button type="button" className="btn btn-sm btn-success" onClick={() => addAttachsClose()}><Icon name="paperclip" size={16} /> ANEXAR {attachs} DOCUMENTOS </button> : ""}
                    {attachs > 0
                        ? <button type="button" className="btn btn-sm btn-secondary mx-3" onClick={() => minusAttach()}><Icon name="minus-circle" size={16} /> REMOVER ULTIMO </button>
                        : ""}
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => addAttach()}><Icon name="plus-circle" size={16} /> AÑADIR </button>
                </div>
                {_COMPONENT}

            </div>;
        }

        let addAttachsClose = () => {
            let formData = new FormData();
            formData.set('id_master', currentItem.id);
            // GET DATA OF ATTACHS
            let files = document.getElementsByName("files_close");

            formData.set('attachs_length', attachs);
            for (var i = 0; i < attachs; i++) {
                formData.append('file', files[i].files[0], "pqrsout_" + files[i].files[0].name)
            }
            let array_form = [];
            let array_html = [];
            array_html = document.getElementsByName("files_close_names");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('files_names', array_form);

            array_form = [];
            array_html = document.getElementsByName("files_class");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('files_class', array_form.join());

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.addAttachsClose(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        retrieveItem(currentItem.id)
                        setAttachs(0);
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

        let deteleAttach = (id) => {
            MySwal.fire({
                title: "ELIMINAR ITEM",
                text: "¿Esta seguro de eliminar este item de forma permanente?",
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
                                retrieveItem(currentItem.id)
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
    return (
        <div>
            {add ? _ATTACHS_COMPONENT() : ""}

            {_ATTACHES_COMPONENT()}
        </div>
    );
}

export default PQRS_COMPONENT_ATTACHS;