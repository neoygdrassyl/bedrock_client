import { MDBBtn } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Modal from 'react-modal';
import moment from 'moment';
import FUNService from '../../../services/fun.service';
import { PDFDocument } from 'pdf-lib';
import VIEWER from '../../../components/viewer.component';

const MySwal = withReactContent(Swal);
const customStylesForModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 2,
    },
    content: {
        position: 'absolute',
        top: '15%',
        left: '30%',
        right: '30%',
        bottom: '',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',

    }
};

const VERSION_DESC = {
    'law0': 'Acta Observaciones Jurídico',
    'law1': 'Revision Técnica 1 Jurídico',
    'law2': 'Revision Técnica 2 Jurídico',
    'law3': 'Acta Correcciones Jurídico',
    'arc0': 'Acta Observaciones Arquitectónico',
    'arc1': 'Revision Técnica 1 Arquitectónico',
    'arc2': 'Revision Técnica 2 Arquitectónico',
    'arc3': 'Acta Correcciones Arquitectónico',
    'eng0': 'Acta Observaciones Estructural',
    'eng1': 'Revision Técnica 1 Estructural',
    'eng2': 'Revision Técnica 2 Estructural',
    'eng3': 'Acta Correcciones Estructural',
    'rew1': 'Acta Observaciones',
    'rew2': 'Acta Correcciones',
}
export default function RECORD_DOCUMENT_VERSION(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, id6 } = props;

    const [modal, setModal] = useState(false)
    const [idDoc, setIdDoc] = useState(false)

    useEffect(() => {
    }, [currentItem]);
    // ******************* DATA GETERS ********************* //
    let _GET_CHILD_6 = () => {
        var _CHILD = currentItem.fun_6s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _FIND_6 = (_ID) => {
        let _LIST = _GET_CHILD_6();
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].id == _ID) {
                return _LIST[i];
            }
        }
        return false;
    }
    let _FIND_6_ID_REPLACE = (_ID) => {
        let _LIST = _GET_CHILD_6();
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].id_replace == _ID) {
                return _LIST[i];
            }
        }
        return false;
    }
    // *******************  DATA CONVERTERS ******************* //
    async function readPDF(file) {
        if (file.type == "application/pdf") {
            var path = (window.URL || window.webkitURL).createObjectURL(file);
            const url = path
            const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
            const pdfDoc = await PDFDocument.load(existingPdfBytes)
            const pages = pdfDoc.getPages().length
            document.getElementById('fun6_page').value = pages
        }
    };
    // ******************* COMPONENTS JSX ******************* //
    let FORM_COMPONENT = () => {
        return <form id="form_fun6" onSubmit={addDocument} enctype="multipart/form-data">
            <div className="row">
                <div className="col-12">
                    <div class="input-group">
                        <span class="input-group-text bg-info text-white"><i class="fas fa-paperclip"></i></span>
                        <input type="file" class="form-control" name="files_fun6s" accept="application/pdf" required onChange={(e) => readPDF(e.target.files[0])} />
                    </div>
                    <div class="input-group">
                        <input id={'fun6_description'} class="form-control" value={VERSION_DESC[id6] || 'Documento de Evaluación'} hidden />
                    </div>
                </div>
            </div>
            <div className="row d-flex justify-content-start">
                <div className="col-3">
                    <div class="input-group">
                        <input type="text" class="form-control" id={'fun6_code'} value={id6} hidden />
                    </div>
                </div>
                <div className="col-3">
                    <div class="input-group">
                        <input type="number" class="form-control" step="1" min="0" id={'fun6_page'} hidden />
                    </div>
                </div>
                <div className="col">
                    <div class="input-group">
                        <input type="date" class="form-control" id={'fun6_date'} defaultValue={moment().format('YYYY-MM-DD')} hidden />
                    </div>
                </div>
            </div>

            <div className="text-end py-2">
                <button className="btn btn-sm btn-primary" type='submit'><i class="fas fa-times-circle"></i> SUBIR</button>
            </div>
        </form>
    }

    let BTN_DOWN = <MDBBtn floating tag='a' size='sm' color='primary' className='ms-1'><i class="fas fa-download"></i></MDBBtn>
    let BTN_VIEW = (API, params) => <VIEWER API={API} params={params} ></VIEWER>
    // ******************* APIS ******************* //
    let addDocument = (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.set('fun0Id', currentItem.id);

        let _creationYear = moment(currentItem.createdAt).format('YY');
        let _folder = currentItem.id_public;

        // GET DATA OF ATTACHS
        let files = document.getElementsByName("files_fun6s");
        formData.set('attachs_length', 1);
        for (var i = 0; i < files.length; i++) {
            if (files[i].files[0]) {
                formData.append('file', files[i].files[0], "fun6_" + _creationYear + "_" + _folder + "_" + files[i].files[0].name)
            }
        }

        let desc = document.getElementById("fun6_description").value;
        let code = document.getElementById("fun6_code").value;
        let page = document.getElementById("fun6_page").value || 0;
        let date = document.getElementById("fun6_date").value;
        formData.set('descriptions', desc);
        formData.set('codes', "");
        formData.set('codes2', code);
        formData.set('pages', page);
        formData.set('dates', date);


        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        FUNService.create_fun6(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.generic_success_title,
                        text: swaMsg.generic_success_text,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    props.requestUpdate(currentItem.id);
                    setModal(false)
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

    function getF6Document(f6DocInfo) {
        return FUNService.getFun6Doc(f6DocInfo.path, f6DocInfo.filename)
        .then(response => {
            return response
        }).catch(e => {
            console.log(e);
        });
    }
    return (
        <>
            {!_FIND_6_ID_REPLACE(id6) ? <MDBBtn floating tag='a' size='sm' color='danger' className='ms-1' onClick={() => setModal(true)}><i class="fas fa-upload"></i></MDBBtn> : null}
            {_FIND_6_ID_REPLACE(id6) ? BTN_VIEW(getF6Document, [_FIND_6_ID_REPLACE(id6)]) : null}

            <Modal contentLabel="UPLOAD RECORD DOC"
                isOpen={modal}
                style={customStylesForModal}
                ariaHideApp={false}
            >
                <div className="my-4 d-flex justify-content-between">
                    <label><i class="fas fa-file-upload"></i> SUBIR DOCUMENTO DE EVALUACIÓN: {VERSION_DESC[id6] || 'Documento de Evaluación'}</label>
                    <MDBBtn className='btn-close' color='none' onClick={() => setModal(false)}></MDBBtn>
                </div>
                <hr />

                {FORM_COMPONENT()}

                <hr />
                <div className="text-end py-2">
                    <MDBBtn className="btn btn-sm btn-info" onClick={() => setModal(false)}><i class="fas fa-times-circle"></i> CERRAR</MDBBtn>
                </div>
            </Modal>
        </>
    );
}
