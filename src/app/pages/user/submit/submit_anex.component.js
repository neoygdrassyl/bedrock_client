import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// SERVICES
import Submit_Service from '../../../services/submit.service'
import moment from 'moment';
import VIZUALIZER from '../../../components/vizualizer.component';
import { MDBBtn } from 'mdb-react-ui-kit';


const MySwal = withReactContent(Swal);

class SUBMIT_ANEX extends Component {
    constructor(props) {
        super(props);
        this.refreshList = this.refreshList.bind(this);
        this.refreshItem = this.refreshItem.bind(this);
        this.state = {
        };
    }
    refreshList() {
        this.props.refreshList();
    }
    refreshItem(id) {
        this.props.refreshItem(id);
    }


    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;
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

        // FUNCTIONS & APIS
        let addDocument = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('submitId', currentItem.id);

            let _creationYear = moment(currentItem.createdAt).format('YY');
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
                            this.refreshList(currentItem.id);
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
                            this.refreshItem(currentItem.id);
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
                        window.open(process.env.REACT_APP_API_URL + "/pdf/submit/" + "Control Ingreso Documentos " + currentItem.id_public + ".pdf");
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
                    <MDBBtn className="btn btn-danger my-3" onClick={() => pdf_gen()}><i class="far fa-file-pdf"></i> GENERAR PDF </MDBBtn>
                </div>
                <hr className="my-3" />
                <label className="fw-bold my-2">ANEXAR DOCUMENTO</label>
                <br />
                {_GET_DOC().id
                    ? <>
                        <i class="text-success fas fa-check"></i> <label>Documento Anexado {_GET_DOC().id
                            ? <VIZUALIZER url={_GET_CURATED_URL()} apipath={'/files/submit/'} />
                            : ""}</label>
                    </>
                    : <>
                    <label><i class="text-danger fas fa-times"></i> No hay documento anexo</label>
                    </>}



                <form id="form_submit_anex" onSubmit={addDocument} enctype="multipart/form-data">
                    <div className="row">

                        <div className="col-6">
                            <label >Documento</label>
                            <div class="input-group mb-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-paperclip"></i>
                                </span>
                                <input type="file" class="form-control" id="file_nomen" accept="image/png, image/jpeg application/pdf" />
                            </div>
                        </div>

                        <div className="col-4">
                            <label >Consecutivo</label>
                            <div class="input-group mb-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" id="submit_anex_2" required
                                    defaultValue={_GET_DOC().id_public} />
                            </div>
                        </div>

                        <div className="col-2">
                            <label ># Folios</label>
                            <div class="input-group mb-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-file"></i>
                                </span>
                                <input type="number" min="1" step="1" class="form-control" id="submit_anex_3" required
                                    defaultValue={_GET_DOC().pages} />
                            </div>
                        </div>

                    </div>
                    <div className="row mb-3 text-center">

                        <div className="col-12">
                            <button className="btn btn-success my-3"><i class="far fa-edit"></i> ANEXAR DOCUMENTO </button>
                        </div>
                    </div>

                </form>
            </div >
        );
    }
}

export default SUBMIT_ANEX;