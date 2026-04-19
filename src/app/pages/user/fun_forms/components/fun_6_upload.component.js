
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import FunService from '../../../../services/fun.service';
import DOCS_LIST from './docs_list.component';
import FUN6DATALIST from './fun_6_datalist';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';


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
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white"><Icon name="paperclip" size={16} /></span>
                            <input type="file" className="form-control" name="files_fun6s" accept="image/png, image/jpeg application/pdf" required />
                        </div>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white"><Icon name="paperclip" size={16} /></span>
                            <input list="fun_6_docs_list" name="fun6_descriptions" id={'fun6_descriptions_' + i} className="form-control" placeholder="Descripcion del documento" />
                            <DOCS_LIST idRef={i} setValues={setValues} text={'VER LISTA'} />
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-start">
                    <div className="col">
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white"><Icon name="hashtag" size={16} /></span>
                            <input type="text" className="form-control" id={'fun6_codes_' + i} placeholder="Codigo" name="fun6_codes" />
                        </div>
                    </div>
                    <div className="col">
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white"><Icon name="sticky-note" size={16} /></span>
                            <input type="number" className="form-control" placeholder="Folios" step="1" min="0" name="fun6_pages" />
                        </div>
                    </div>

                    <div className="col-4">
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white"><Icon name="calendar-alt" size={16} />&nbsp;Fecha Radicación</span>
                            <input type="date" className="form-control" max="2100-01-01" defaultValue={dayjs().format('YYYY-MM-DD')} name="fun6_dates" />
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

        let _creationYear = dayjs(currentItem.createdAt).format('YY');
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

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        FunService.create_fun6(formData)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                    setAttachs(0)
                    props.requestUpdate(currentItem.id);
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
            });

    }
    return (
        <div className='p-2'>
            <div className="row">
                <div className="col text-end m-2">

                    {attachs > 0
                        ? <button type="button" className="btn btn-sm btn-secondary mx-3" onClick={() => setAttachs(attachs - 1)}><Icon name="minus-circle" size={16} /> REMOVER ULTIMO </button>
                        : ""}
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setAttachs(attachs + 1)}><Icon name="plus-circle" size={16} /> AÑADIR </button>
                </div>
            </div>

            <form id="form_fun6" onSubmit={addDocument} enctype="multipart/form-data">
                {_ATTACHS_COMPONENT()}
                <FUN6DATALIST />
                {attachs > 0
                    ? <div className="row text-center my-2">
                        <div className="col-12">
                            <button className="btn btn-success btn-sm"><Icon name="file-alt" size={16} /> AÑADIR {attachs} DOCUMENTO(S)</button>
                        </div>
                    </div> : ""}
            </form>
        </div>
    );
}
