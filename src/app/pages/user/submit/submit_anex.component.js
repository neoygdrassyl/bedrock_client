import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// SERVICES
import Submit_Service from '../../../services/submit.service'
import funService from '../../../services/fun.service';
import dayjs from 'dayjs';
import VIZUALIZER from '../../../components/vizualizer.component';

import DataTable from '@/components/data-table-bridge';
import { Icon } from '@/components/icon';

const MySwal = withReactContent(Swal);

function SUBMIT_ANEX({ translation, swaMsg, globals, currentItem, refreshList: propRefreshList, refreshItem: propRefreshItem }) {
    const [fun6, setFun6] = useState([]);

    useEffect(() => {
        loadFun6();
    }, []);

    function refreshList() {
        propRefreshList();
        loadFun6();
    }

    function refreshItem(id) {
        propRefreshItem(id);
        loadFun6();
    }

    function loadFun6() {
        funService.getAll_VrFun(currentItem.id_related, currentItem.id_public)
        .then(response => {
            setFun6(response.data)
        })
    }

    var formData = new FormData();

    // DATA GETTER
        let _GET_DOC = () => {
            var _CHILD = currentItem.sub_doc;
            var _VARS = {
                id: _CHILD ? _CHILD.id : 0,
                id_public: _CHILD ? _CHILD.id_public : null,
                pages: _CHILD ? _CHILD.pages : null,
                filename: _CHILD ? _CHILD.filename : null,
                path: _CHILD ? _CHILD.path : null,
            }
            return _VARS
        }
        let _GET_CURATED_URL = () => {
            let url = _GET_DOC().path + '/' + _GET_DOC().filename;
            url = url.replace("docs/submit/", "");
            return url;
        }

        let _CHILD_6_LIST = () => {
            let _LIST = fun6;
            const columns = [
                {
                    name: 'Descripción',
                    selector: row => row.description,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.description}</span>
                },
                {
                    name: 'Código',
                    selector: row => row.id_public,
                    sortable: true,
                    filterable: true,
                    maxWidth: '50px',
                    cell: row => <span className="text-sm font-mono">{row.id_public}</span>
                },
                {
                    name: 'Folios',
                    selector: row => row.pages,
                    sortable: true,
                    filterable: true,
                    maxWidth: '40px',
                    cell: row => <span className="text-sm font-mono">{row.pages}</span>
                },
                {
                    name: 'FECHA RADICACIÓN',
                    selector: row => row.date,
                    sortable: true,
                    filterable: true,
                    maxWidth: '100px',
                    cell: row => <span className="text-xs font-mono tabular-nums">{row.date}</span>
                },
                {
                    name: 'ACCIÓN',
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <VIZUALIZER url={row.path + "/" + row.filename} apipath={'/files/'}
                            icon='fas fa-search'
                            iconWrapper='btn btn-sm btn-info m-0 p-1 shadow-none'
                            iconStyle={{ fontSize: '150%' }} />
                    </>
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={15}
                paginationRowsPerPageOptions={[15, 30, 60]}
                className="data-table-component"
                title={'DOCUMENTOS DIGITALIZADOS'}
                noHeader
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                dense
            />
        }

        // FUNCTIONS & APIS
        let addDocument = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('submitId', currentItem.id);

            let _creationYear = dayjs(currentItem.createdAt).format('YY');
            let _folder = currentItem.id_public;

            // GET DATA OF ATTACHS
            let file = document.getElementById("file_nomen");
            if (file.files[0]) {
                formData.append('file', file.files[0], "submit_" + _creationYear + "_" + _folder + "_" + file.files[0].name)
            }

            let id_public = document.getElementById("submit_anex_2").value;
            formData.set('id_public', id_public);
            let pages = document.getElementById("submit_anex_3").value;
            formData.set('pages', pages);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });

            manageDoc();
        }

        let manageDoc = () => {
            if (_GET_DOC().id) {
                Submit_Service.update_anex(_GET_DOC().id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.generic_success_title,
                                text: swaMsg.generic_success_text,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            refreshList(currentItem.id);
                        } 
                        else {
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
            } else {
                Submit_Service.create_anex(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.generic_success_title,
                                text: swaMsg.generic_success_text,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            refreshItem(currentItem.id);
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

        }

        let pdf_gen = () => {
            formData = new FormData();

            formData.set('id', currentItem.id);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            Submit_Service.gen_doc_submit(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(import.meta.env.VITE_API_URL + "/pdf/submit/" + "Control Ingreso Documentos " + currentItem.id_public + ".pdf");
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
            <div className="nomenclature_anex container">
                <label className="fw-bold my-2">GENERAR DOCUMENTO</label>
                <div className="col-3">
                    <button type="button" className="btn btn-danger my-3" onClick={() => pdf_gen()}><Icon name="file-pdf" size={16} /> GENERAR PDF </button>
                </div>
                <hr className="my-3" />
                <label className="fw-bold my-2">ANEXAR DOCUMENTO</label>
                <br />
                {_GET_DOC().id
                    ? <>
                        <Icon name="check" size={16} className="text-success" /> <label>Documento Anexado {_GET_DOC().id
                            ? <VIZUALIZER url={_GET_CURATED_URL()} apipath={'/files/submit/'} />
                            : ""}</label>
                    </>
                    : <>
                    <label><Icon name="times" size={16} className="text-danger" /> No hay documento anexo</label>
                    </>}

                <form id="form_submit_anex" onSubmit={addDocument} enctype="multipart/form-data">
                    <div className="row">

                        <div className="col-6">
                            <label >Documento</label>
                            <div className="input-group mb-1">
                                <span className="input-group-text bg-info text-white">
                                    <Icon name="paperclip" size={16} />
                                </span>
                                <input type="file" className="form-control" id="file_nomen" accept="image/png, image/jpeg application/pdf" />
                            </div>
                        </div>

                        <div className="col-4">
                            <label >Consecutivo</label>
                            <div className="input-group mb-1">
                                <span className="input-group-text bg-info text-white">
                                    <Icon name="hashtag" size={16} />
                                </span>
                                <input type="text" className="form-control" id="submit_anex_2" required
                                    defaultValue={_GET_DOC().id_public} />
                            </div>
                        </div>

                        <div className="col-2">
                            <label ># Folios</label>
                            <div className="input-group mb-1">
                                <span className="input-group-text bg-info text-white">
                                    <Icon name="file" size={16} />
                                </span>
                                <input type="number" min="1" step="1" className="form-control" id="submit_anex_3" required
                                    defaultValue={_GET_DOC().pages} />
                            </div>
                        </div>

                    </div>
                    <div className="row mb-3 text-center">

                        <div className="col-12">
                            <button className="btn btn-success my-3"><Icon name="edit" size={16} /> ANEXAR DOCUMENTO </button>
                        </div>
                    </div>

                </form>

                <hr className="my-3" />
                <label className="fw-bold my-2">DOCUMENTOS DIGITALIZADOS EN PROYECTO</label>

                {_CHILD_6_LIST()}

            </div >
        );
}

export default SUBMIT_ANEX;