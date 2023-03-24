import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_LAW_SERVICE from '../../../../services/record_law.service';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import moment from 'moment';
import { cities, domains_number } from '../../../../components/jsons/vars';
import { handleLAWhCheck } from '../../../../components/customClasses/pdfCheckHandler';
const MySwal = withReactContent(Swal);

class RECORD_LAW_PDF extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    _GET_CHILD_REVIEW() {
        var _CHILD = this.props.currentItem.fun_rs;
        var _CURRENT_VERSION = document.getElementById('record_version').value;
        var VAR = false;
        if (_CHILD) {
            for (let i = 0; i < _CHILD.length; i++) {
                const element = _CHILD[i];
                if (element.version == _CURRENT_VERSION) VAR = _CHILD[i]
            }
        }
        return VAR;
    }
    _GET_CHILD_RECORD_REVIEW = () => {
        var _CHILD = this.props.currentRecord.record_law_reviews;
        var _CURRENT_VERSION = document.getElementById('record_version').value;
        var _CHILD_VARS = {
            id: "",
            worker_id: "",
            worker_name: "",
            check: "",
            date: "",
            detail: '',
        }
        if (_CHILD) {
            for (let i = 0; i < _CHILD.length; i++) {
                const element = _CHILD[i];
                if (element.version == _CURRENT_VERSION) {
                    _CHILD_VARS.id = element.id;
                    _CHILD_VARS.worker_id = element.worker_id;
                    _CHILD_VARS.worker_name = element.worker_name;
                    _CHILD_VARS.check = element.check;
                    _CHILD_VARS.date = element.date ? element.date : "";
                    _CHILD_VARS.detail = element.detail ? element.detail : "";
                }
            }
        }
        return _CHILD_VARS;
    }
    LOAD_STEP(_id_public) {
        let currentRecord = this.props.currentRecord
        var _CHILD = currentRecord.record_law_steps || [];
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == document.getElementById('record_version').value && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }
    _GET_STEP_TYPE(_id_public, _type) {
        var STEP = this.LOAD_STEP(_id_public);
        if (!STEP.id) return [];
        var value = STEP[_type] ?? []
        if (!value.length) return [];
        value = value.split(';');
        return value
    }
    WordWrap(text, maxLength) {
        if (!text) return false;

        const strWords = text.split(' ');
        let tempWord = '';
        let lineLength = 0;

        return strWords.reduce((acc, word) => {
            lineLength += word.length;

            if (lineLength > maxLength) {
                lineLength = 0;
                tempWord = word;
                return `${acc} \n`
            } else {
                const withTempWord = `${acc} ${tempWord} ${word}`;
                tempWord = '';
                return withTempWord;
            }
        }, '');
    };
    async CREATE_CHECK(_detail, chekcs, _currentItem, _headers) {
        let swaMsg = this.props.swaMsg;
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        var formUrl = process.env.REACT_APP_API_URL + "/pdf/recordlawextra";
        var formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDoc = await PDFDocument.load(formPdfBytes);

        const currentItem = this.props.currentItem;
        const id_public = currentItem.id_public;

        let page = pdfDoc.getPage(0)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        page.setFont(helveticaFont)
        // WIDTH = 612, HEIGHT = 936




        let _city = _headers.city;
        let _number = _headers.number;
        let pageCount = pdfDoc.getPageCount();
        for (let i = 0; i < pageCount; i++) {
            page = pdfDoc.getPage(i);
            page.moveTo(215, 783)
            page.drawText(_number, { size: 14 })
            page.moveTo(100, 770)
            page.drawText(_city, { size: 9 })
            page.moveTo(420, 830)
            page.drawText(id_public, { size: 14 })
        }

        handleLAWhCheck(pdfDoc, page, chekcs, _detail, 0, 1)



        pdfDoc.setAuthor("CURADURIA URBANA 1 DE BUCARAMANGA");
        pdfDoc.setCreationDate(moment().toDate());
        pdfDoc.setCreator('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setKeywords(['formulario', 'unico', 'nacional', 'curaduria', 'planeacion', 'construccion', 'obra', 'proyecto', 'informe', 'acta', 'juridico']);
        pdfDoc.setLanguage('es-co');
        pdfDoc.setProducer('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setTitle('INFORME JURIDICO - ' + id_public)

        var pdfBytes = await pdfDoc.save();
        var fileDownload = require('js-file-download');
        fileDownload(pdfBytes, 'INFORME JURIDICO ' + id_public + '.pdf');
        MySwal.close();


    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CLOCK_STATE_VERSION = (_state, version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_RECORD_REVIEW = () => {
            var _CHILD = currentItem.record_review;
            return _CHILD ?? {};
        }
        let _GET_CHILD_REVIEW = () => {
            var _CHILD = currentRecord.record_law_reviews;
            var _CURRENT_VERSION = currentVersionR - 1;
            var _CHILD_VARS = {
                id: "",
                worker_id: "",
                worker_name: "",
                check: "",
                date: "",
                detail: '',
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.id = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.worker_id = _CHILD[_CURRENT_VERSION].worker_id;
                    _CHILD_VARS.worker_name = _CHILD[_CURRENT_VERSION].worker_name;
                    _CHILD_VARS.check = _CHILD[_CURRENT_VERSION].check;
                    _CHILD_VARS.date = _CHILD[_CURRENT_VERSION].date ? _CHILD[_CURRENT_VERSION].date : "";
                    _CHILD_VARS.detail = _CHILD[_CURRENT_VERSION].detail ? _CHILD[_CURRENT_VERSION].detail : "";
                }
            }
            return _CHILD_VARS;
        }
        let CREATE_PDF = () => {
            var formData = new FormData();
            formData.set('id', currentItem.id);
            let version = document.getElementById("record_version").value;
            formData.set('version', version);
            let type = document.getElementById("record_version").value;
            formData.set('type_rev', type);
            let header = document.getElementById("record_header").value;
            formData.set('header', header);
            let r_worker = document.getElementById("record_pdf_worker_name").value;
            formData.set('r_worker', r_worker);
            let r_check = document.getElementById("record_pdf_check").value;
            formData.set('r_check', r_check);
            let r_date = document.getElementById("record_pdf_date").value;
            formData.set('r_date', r_date);
            let r_law_pending = document.getElementById("record_law_pending").checked;
            formData.set('r_law_pending', r_law_pending);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_LAW_SERVICE.pdfgen(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/recordlaw/" + "INFORME JURIDICO " + currentItem.id_public + ".pdf");
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
        let _CHILD = _GET_CHILD_REVIEW();
        let _WORKER_NAME =  currentRecord.worker_name;
        let _RR = _GET_RECORD_REVIEW();

        let _REVIEWS = _GET_CLOCK_STATE_VERSION(11, 200).resolver_context ? _GET_CLOCK_STATE_VERSION(11, 200).resolver_context.split(';') : [];
        let _REVIEWS_DATES = _GET_CLOCK_STATE_VERSION(11, 200).date_start ? _GET_CLOCK_STATE_VERSION(11, 200).date_start.split(';') : [];

        let CLOCKS_R;
        CLOCKS_R = _RR.check == 0 ? ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Acta Correcciones',] : ['Acta Observaciones',]

        let reviews = [
            { worker: '', check: 0, date: '', },
            { worker: '', check: 0, date: '', },
            { worker: '', check: 0, date: '', },
            { worker: '', check: 0, date: '', },
        ]



        for (let i = 0; i < CLOCKS_R.length; i++) {
            if (i == 0) {
                reviews[i].worker = _WORKER_NAME;
                reviews[i].check = _CHILD.check || (_REVIEWS[i] ? _REVIEWS[i] : 0);
                reviews[i].date = _CHILD.date || (_REVIEWS_DATES[i] ? _REVIEWS_DATES[i] : '');
            } else {
                reviews[i].worker = _WORKER_NAME;
                reviews[i].check = _REVIEWS[i] ? _REVIEWS[i] : 0;
                reviews[i].date = _REVIEWS_DATES[i] ? _REVIEWS_DATES[i] : '';
            }
        }

        let _CHANGE_VALUES = (i) => {
            if (i == 3) document.getElementById('record_version').value = 2
            else document.getElementById('record_version').value = 1
            document.getElementById('record_pdf_worker_name').value = reviews[i].worker;
            document.getElementById('record_pdf_check').value = reviews[i].check == 1 ? 'VIABLE' : 'NO VIABLE';
            document.getElementById('record_pdf_date').value = reviews[i].date;
        }
        let CREATE_PDF_CHECK = () => {
            let _RESUME = [];

            let values_1 = this._GET_STEP_TYPE('s1', 'value');
            let values_f53 = this._GET_STEP_TYPE('f53', 'value');
            let values_law = this._GET_STEP_TYPE('flaw', 'value');
            let _detail = this._GET_CHILD_RECORD_REVIEW().detail;
            let _details = '';

            if (values_1[0]) _details = _details + values_1[0] + '\n';
            if (values_f53[0]) _details = _details + values_f53[0] + '\n';
            if (values_law[0]) _details = _details + values_law[0] + '\n';

            if (values_1[0]) _RESUME.push(`- Observaciones (Documentos aportados): \n${values_1[0]}`)
            if (values_f53[0]) _RESUME.push(`- Observaciones (Formulario Único Nacional): \n${values_f53[0]}`)
            if (values_law[0]) _RESUME.push(`- Observaciones (Publicidad): \n${values_law[0]}`)
            if (_detail) _RESUME.push(`- Observaciones finales: \n${_detail}`)

            if (_RESUME) _RESUME = _RESUME.join('\n\n')
            let checks = [];
            let _child = this._GET_CHILD_REVIEW();
            let _code = _child.code ?? '';
            let _check = _child.checked ?? '';

            _code = _code.split(',');
            _check = _check.split(',');
            let index = null;
            // 6.1
            index = _code.indexOf('511');
            checks.push({ index: _check[index], Y: 682, offset: [0, 0, -4] })

            index = _code.indexOf('518');
            checks.push({ index: _check[index], Y: 646 })

            index = _code.indexOf('513');
            checks.push({ index: _check[index], Y: 597, offset: [0, 0, -4] })

            index = _code.indexOf('512');
            checks.push({ index: _check[index], Y: 547 })

            index = _code.indexOf('517');
            checks.push({ index: _check[index], Y: 506 })

            index = _code.indexOf('6610');
            checks.push({ index: _check[index], Y: 456 })

            index = _code.indexOf('516');
            checks.push({ index: _check[index], Y: 394 })

            index = _code.indexOf('6614');
            checks.push({ index: _check[index], Y: 344 })

            index = _code.indexOf('6609');
            checks.push({ index: _check[index], Y: 303 })

            var indexS = [_code.indexOf('624'), _code.indexOf('636'), _code.indexOf('653'), _code.indexOf('683')];
            index = -1;
            for (let i = 0; i < indexS.length; i++) {
                const currentIndex = indexS[i];
                if (currentIndex > -1) { index = currentIndex; break; }
            }
            checks.push({ index: _check[index], Y: 266 })



            let _city = document.getElementById('func_pdf_0_2').value;
            let _number = document.getElementById('func_pdf_0_1').value;

            var headers = {};
            headers.city = _city;
            headers.number = _number

            this.CREATE_CHECK(_RESUME, checks, currentItem, headers)
        }
        return (
            <>
                <div className='row'>
                    <div className="py-3">
                        <div className="row mb-3" hidden={this.props.noReport}>
                            <div className="col">
                                <label>Autoridad Competente</label>
                                <div class="input-group my-1">
                                    <select class="form-select me-1" id={"func_pdf_0_1"}>
                                        {domains_number}
                                    </select>
                                </div>
                            </div>
                            <div className="col">
                                <label>Ciudad</label>
                                <div class="input-group my-1">
                                    <select class="form-select me-1" id={"func_pdf_0_2"}>
                                        {cities}
                                    </select>
                                </div>
                            </div>
                            <div className="col">
                                <label>Acta</label>
                                <div class="input-group my-1">
                                    <select class="form-select me-1" id={"record_version"}>
                                        <option value={1}>OBSERVACIONES</option>
                                        <option value={2}>CORRECCIONES</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col">
                                <label>Cabecera</label>
                                <div class="input-group my-1">
                                    <select class="form-select me-1" id={"record_header"}>
                                        <option value={1}>USAR CABECERA</option>
                                        <option value={0}>NO USAR CABECERA</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3" hidden={this.props.noReport}>
                            <div className="col">
                                <label>Revision</label>
                                <div class="input-group my-1">
                                    <select class="form-select me-1" id={"record_pdf_version"} onChange={(e) => _CHANGE_VALUES(e.target.value)}>
                                        {CLOCKS_R.map((op, i) => <option value={i}>{op}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col">
                                <label>Profesional</label>
                                <div class="input-group my-1">
                                    <input className='form-control' id={"record_pdf_worker_name"} disabled defaultValue={reviews[0].worker} />
                                </div>
                            </div>
                            <div className="col">
                                <label>Resultado</label>
                                <div class="input-group my-1">
                                    <input className='form-control' id={"record_pdf_check"} disabled defaultValue={reviews[0].check == 1 ? 'VIABLE' : 'NO VIABLE'} />
                                </div>
                            </div>
                            <div className="col">
                                <label>Fecha</label>
                                <div class="input-group my-1">
                                    <input className='form-control' id={"record_pdf_date"} disabled defaultValue={reviews[0].date} />
                                </div>
                            </div>
                            <div className="col-2">
                                <br />
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="record_law_pending" />
                                    <label class="form-check-label" for="exampleCheck1">Pendiente</label>
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3 text-center">
                            <div className="col" hidden={this.props.noReport}>
                                <button className="btn btn-danger me-1" onClick={() => CREATE_PDF()}> <i class="far fa-file-pdf"></i> DESCARGAR INFORME</button>
                            </div>
                            <div className="col">
                                <button className="btn btn-danger" onClick={() => CREATE_PDF_CHECK()}> <i class="far fa-check-square"></i> DESCARGAR CHECKEO</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default RECORD_LAW_PDF;