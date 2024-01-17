import { MDBBtn } from 'mdb-react-ui-kit';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import FunService from '../../../../services/fun.service';
import DOCS_LIST from './docs_list.component';
import FUN6DATALIST from './fun_6_datalist';


const MySwal = withReactContent(Swal);

export default function FUN_6_UPLOAD(props) {
    const { translation, swaMsg, globals, currentItem } = props;

    var [attachs, setAttachs] = useState(0);

    // ***************************  DATA CONVERTER *********************** //
    let setValues = (refs, values) => {
        document.getElementById('fun6_codes_' + refs).value = values[0];
        document.getElementById('fun6_descriptions_' + refs).value = values[1];
    }

    // ***************************  JXS *********************** //
    let _ATTACHS_COMPONENT = () => {
        var _COMPONENT = [];
        for (var i = 0; i < attachs; i++) {
            _COMPONENT.push(<>
                <div className="row">
                    <div className="col-12">
                        <label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTO ANEXO N° {i + 1}</label>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white"><i class="fas fa-paperclip"></i></span>
                            <input type="file" class="form-control" name="files_fun6s" accept="image/png, image/jpeg application/pdf" required />
                        </div>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white"><i class="fas fa-paperclip"></i></span>
                            <input list="fun_6_docs_list" name="fun6_descriptions" id={'fun6_descriptions_' + i} class="form-control" placeholder="Descripcion del documento" />
                            <DOCS_LIST idRef={i} setValues={setValues} text={'VER LISTA'} />
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-start">
                    <div className="col">
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white"><i class="fas fa-hashtag"></i></span>
                            <input type="text" class="form-control" id={'fun6_codes_' + i} placeholder="Codigo" name="fun6_codes" />
                        </div>
                    </div>
                    <div className="col">
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white"><i class="far fa-sticky-note"></i></span>
                            <input type="number" class="form-control" placeholder="Folios" step="1" min="0" name="fun6_pages" />
                        </div>
                    </div>

                    <div className="col-4">
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white"><i class="far fa-calendar-alt"></i>&nbsp;Fecha Radicación</span>
                            <input type="date" class="form-control" max="2100-01-01" defaultValue={moment().format('YYYY-MM-DD')} name="fun6_dates" />
                        </div>
                    </div>
                </div>
            </>)
        }

        return <div>{_COMPONENT}</div>;
    }

    // ***************************  DATATABLES *********************** //


    // ***************************  APIS *********************** //
    let addDocument = (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.set('fun0Id', currentItem.id);

        let _creationYear = moment(currentItem.createdAt).format('YY');
        let _folder = currentItem.id_public;

        // GET DATA OF ATTACHS
        let files = document.getElementsByName("files_fun6s");
        formData.set('attachs_length', attachs);
        for (var i = 0; i < attachs; i++) {
            if (files[i].files[0]) {
                formData.append('file', files[i].files[0], "fun6_" + _creationYear + "_" + _folder + "_" + files[i].files[0].name)
            }
        }

        let array_form = [];
        let array_html = [];

        array_html = document.getElementsByName("fun6_descriptions");
        for (var i = 0; i < array_html.length; i++) {
            array_form.push(array_html[i].value)
        }
        formData.set('descriptions', array_form.join());
        array_form = [];

        array_html = document.getElementsByName("fun6_codes");
        for (var i = 0; i < array_html.length; i++) {
            array_form.push(array_html[i].value)
        }
        formData.set('codes', array_form.join());
        array_form = [];

        array_html = document.getElementsByName("fun6_pages");
        for (var i = 0; i < array_html.length; i++) {
            array_form.push(array_html[i].value)
        }
        formData.set('pages', array_form.join());
        array_form = [];

        array_html = document.getElementsByName("fun6_dates");
        for (var i = 0; i < array_html.length; i++) {
            array_form.push(array_html[i].value)
        }
        formData.set('dates', array_form.join());
        array_form = [];

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        FunService.create_fun6(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.generic_success_title,
                        text: swaMsg.generic_success_text,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    setAttachs(0)
                    props.requestUpdate(currentItem.id);
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
        <div className='p-2'>
            <div className="row">
                <div className="col text-end m-2">

                    {attachs > 0
                        ? <MDBBtn className="btn btn-sm btn-secondary mx-3" onClick={() => setAttachs(attachs - 1)}><i class="fas fa-minus-circle"></i> REMOVER ULTIMO </MDBBtn>
                        : ""}
                    <MDBBtn className="btn btn-sm btn-secondary" onClick={() => setAttachs(attachs + 1)}><i class="fas fa-plus-circle"></i> AÑADIR </MDBBtn>
                </div>
            </div>

            <form id="form_fun6" onSubmit={addDocument} enctype="multipart/form-data">
                {_ATTACHS_COMPONENT()}
                <FUN6DATALIST />
                {attachs > 0
                    ? <div className="row text-center my-2">
                        <div className="col-12">
                            <button className="btn btn-success btn-sm"><i class="far fa-file-alt"></i> AÑADIR {attachs} DOCUMENTO(S)</button>
                        </div>
                    </div> : ""}
            </form>
        </div>
    );
}
