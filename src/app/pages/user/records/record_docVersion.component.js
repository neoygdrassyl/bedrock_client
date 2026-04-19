
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import dayjs from 'dayjs';
import FUNService from '../../../services/fun.service';
import { PDFDocument } from 'pdf-lib';
import VIEWER from '../../../components/viewer.component';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

const customStylesForModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1050,
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
                    <div className="input-group">
                        <span className="input-group-text bg-primary text-primary-foreground"><Icon name="paperclip" size={16} /></span>
                        <input type="file" className="form-control" name="files_fun6s" accept="application/pdf" required onChange={(e) => readPDF(e.target.files[0])} />
                    </div>
                    <div className="input-group">
                        <input id={'fun6_description'} className="form-control" value={VERSION_DESC[id6] || 'Documento de Evaluación'} hidden />
                    </div>
                </div>
            </div>
            <div className="row d-flex justify-content-start">
                <div className="col-3">
                    <div className="input-group">
                        <input type="text" className="form-control" id={'fun6_code'} value={id6} hidden />
                    </div>
                </div>
                <div className="col-3">
                    <div className="input-group">
                        <input type="number" className="form-control" step="1" min="0" id={'fun6_page'} hidden />
                    </div>
                </div>
                <div className="col">
                    <div className="input-group">
                        <input type="date" className="form-control" id={'fun6_date'} defaultValue={dayjs().format('YYYY-MM-DD')} hidden />
                    </div>
                </div>
            </div>

            <div className="text-end py-2">
                <Button size="sm" type='submit'><Icon name="times-circle" size={16} /> SUBIR</Button>
            </div>
        </form>
    }

    let BTN_DOWN = <Button size="sm" className="ms-1"><Icon name="download" size={16} /></Button>
    let BTN_VIEW = (API, params) => <VIEWER API={API} params={params} ></VIEWER>
    // ******************* APIS ******************* //
    let addDocument = (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.set('fun0Id', currentItem.id);

        let _creationYear = dayjs(currentItem.createdAt).format('YY');
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

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        FUNService.create_fun6(formData)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                    props.requestUpdate(currentItem.id);
                    setModal(false)
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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
            {!_FIND_6_ID_REPLACE(id6) ? <Button variant="destructive" size="sm" className="ms-1" onClick={() => setModal(true)}><Icon name="upload" size={16} /></Button> : null}
            {_FIND_6_ID_REPLACE(id6) ? BTN_VIEW(getF6Document, [_FIND_6_ID_REPLACE(id6)]) : null}

            <Modal contentLabel="UPLOAD RECORD DOC"
                isOpen={modal}
                style={customStylesForModal}
                ariaHideApp={false}
            >
                <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                            <Icon name="file-upload" size={14} className="text-primary" />
                        </div>
                        <h2 className="text-sm font-semibold tracking-tight">Subir documento de evaluación — {VERSION_DESC[id6] || 'Documento de Evaluación'}</h2>
                    </div>
                    <button type="button" onClick={() => setModal(false)} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                        <Icon name="X" size={16} className="text-muted-foreground" />
                    </button>
                </div>
                <hr />

                {FORM_COMPONENT()}

                <hr />
                <div className="text-end py-2">
                    <Button size="sm" onClick={() => setModal(false)}><Icon name="times-circle" size={16} /> CERRAR</Button>
                </div>
            </Modal>
        </>
    );
}
