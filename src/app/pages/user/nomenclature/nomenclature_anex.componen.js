import { useCallback } from 'react';
// SERVICES
import Nomenclature_Service from '../../../services/nomeclature.service'
import dayjs from 'dayjs';
import VIZUALIZER from '../../../components/vizualizer.component';

import { cities } from '../../../components/jsons/vars';
import { Icon } from '@/components/icon';
import { swalClose, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function NOMENCLATURE_ANEX({ translation, swaMsg, globals, currentItem, refreshList, refreshItem }) {
        var formData = new FormData();

        // DATA GETTER
        let _GET_DOC = () => {
            var _CHILD = currentItem.nome_doc;
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
            url = url.replace("docs/nomenclature/", "");
            return url;
        }

        // FUNCTIONS & APIS
        let addDocument = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('nomenclatureId', currentItem.id);

            let _creationYear = dayjs(currentItem.createdAt).format('YY');
            let _folder = currentItem.id_public;

            // GET DATA OF ATTACHS
            let file = document.getElementById("file_nomen");
            if (file.files[0]) {
                formData.append('file', file.files[0], "nomenclature_" + _creationYear + "_" + _folder + "_" + file.files[0].name)
            }

            let id_public = document.getElementById("nomen_anex_2").value;
            formData.set('id_public', id_public);
            let pages = document.getElementById("nomen_anex_3").value;
            formData.set('pages', pages);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

            manageDoc();
        }

        let manageDoc = () => {
            if (currentItem.nome_doc) {
                Nomenclature_Service.update_anex(_GET_DOC().id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            refreshItem(currentItem.id);
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            } else {
                Nomenclature_Service.create_anex(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            refreshItem(currentItem.id);
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            }

        }

        let pdf_gen = () => {
            formData = new FormData();

            let date = document.getElementById("nomen_pdf_date").value;
            formData.set('date', date);
            let fontSize = document.getElementById("nomen_pdf_fontsize").value;
            formData.set('fontSize', fontSize);
            let city = document.getElementById("nomen_pdf_city").value;
            formData.set('city', city);

            formData.set('id_public', currentItem.id_public);
            let type = currentItem.type;
            if (type == "CERTIFICADO") type = "CERTIFICADO DE NOMENCLATURA"
            if (type == "RECTIFICACION") type = "RECTIFICACIÓN DE NOMENCLATURA"
            formData.set('type', type);
            formData.set('predial', currentItem.predial);
            formData.set('matricula', currentItem.matricula);
            formData.set('neighbour', currentItem.neighbour);
            formData.set('name', currentItem.name);
            formData.set('surname', currentItem.surname);
            formData.set('number_id', currentItem.number_id);
            formData.set('details', currentItem.details);
            formData.set('note', currentItem.note);
            formData.set('use', currentItem.use);
            formData.set('date_start', currentItem.date_start);
            formData.set('date_end', currentItem.date_end);
            formData.set('vr', currentItem.vr);
            formData.set('oa', currentItem.oa);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            Nomenclature_Service.gen_doc_nomenclature(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalClose();
                        window.open(import.meta.env.VITE_API_URL + "/pdf/nomenclaure/" + "Nomenclature " + currentItem.id_public + ".pdf");
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });

        }
        return (
            <div className="nomenclature_anex container">
                <label className="fw-bold my-2">GENERAR DOCUMENTO</label>
                <div className="row">

                    <div className="col-3">
                        <label>Fecha del Documento</label>
                        <div className="input-group mb-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="calendar-alt" size={16} />
                            </span>
                            <input type="date" max="2100-01-01" className="form-control" id="nomen_pdf_date" required
                                defaultValue={dayjs().format('YYYY-MM-DD')} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Tamaño letra 14.</label>
                        <div className="input-group mb-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="text-height" size={16} />
                            </span>
                            <input type="number" max="14" min="8" step="1" className="form-control" id="nomen_pdf_fontsize" required
                                defaultValue={12} />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Ciudad</label>
                        <div className="input-group">
                            <select className="form-select me-1" id={"nomen_pdf_city"}>
                                {cities}
                            </select>
                        </div>
                    </div>
                </div>
                <button type="button" className="btn btn-danger my-3" onClick={() => pdf_gen()}><Icon name="file-pdf" size={16} /> GENERAR PDF </button>
                <hr className="my-3" />
                <label className="fw-bold my-2">ANEXAR DOCUMENTO</label>
                <br />
                {_GET_DOC().id
                    ? <>
                        <Icon name="check" size={16} className="text-success" /> <label>Documento Anexado {_GET_DOC().id
                            ? <VIZUALIZER url={_GET_CURATED_URL()} apipath={'/files/nomen/'} />
                            : ""}</label>
                    </>
                    : <>
                        <label><Icon name="times" size={16} className="text-danger" /> No hay documento anexo</label>
                    </>}

                <form id="form_nomen_anex" onSubmit={addDocument} enctype="multipart/form-data">
                    <div className="row">

                        <div className="col-6">
                            <label >Documento</label>
                            <div className="input-group mb-1">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="paperclip" size={16} />
                                </span>
                                <input type="file" className="form-control" id="file_nomen" accept="image/png, image/jpeg application/pdf" />
                            </div>
                        </div>

                        <div className="col-4">
                            <label >Consecutivo</label>
                            <div className="input-group mb-1">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="hashtag" size={16} />
                                </span>
                                <input type="text" className="form-control" id="nomen_anex_2" required
                                    defaultValue={_GET_DOC().id_public} />
                            </div>
                        </div>

                        <div className="col-2">
                            <label ># Folios</label>
                            <div className="input-group mb-1">
                                <span className="input-group-text bg-primary text-primary-foreground">
                                    <Icon name="file" size={16} />
                                </span>
                                <input type="number" min="1" step="1" className="form-control" id="nomen_anex_3" required
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
            </div >
        );
}

export default NOMENCLATURE_ANEX;