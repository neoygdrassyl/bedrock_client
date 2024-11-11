import React, { Component } from 'react';
import { MDBBtn, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { PDFDocument, StandardFonts } from 'pdf-lib';

import FUN_SERVICE from '../../../services/fun.service';
import RECORD_REVIEW_SERVICE from '../../../services/record_review.service';
import FUN_VERSION_NAV from '../fun_forms/components/fun_versionNav';
import FUN_MODULE_NAV from '../fun_forms/components/fun_moduleNav';
import FUN_G_REPORTS from '../fun_forms/components/fun_g_reports.component';
import { dateParser_finalDate, dateParser_timeLeft, regexChecker_isOA_2, _MANAGE_IDS, dateParser_dateDiff } from '../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../components/vizualizer.component';
import FunService from '../../../services/fun.service';
import { cities, domains_number, infoCud } from '../../../components/jsons/vars';
import moment from 'moment';
import { handleArchCheck, handleEnghCheck, handleLAWhCheck } from '../../../components/customClasses/pdfCheckHandler';
import RECORD_DOC_LETTER from './record_letter.component';
import RECORD_DOC_LETTER_2 from './record_letter_2.component';
import Collapsible from 'react-collapsible';
import PQRS_Service from '../../../services/pqrs_main.service';
import SubmitService from '../../../services/submit.service';
import CubXVrDataService from '../../../services/cubXvr.service'



const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

class RECORD_REVIEW extends Component {
    constructor(props) {
        super(props);
        this.setItem_Record = this.setItem_Record.bind(this);
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
            currentStepIndex: 0,
            pqrsxfun: false,
            vrsRelated: []
        };
    }
    componentDidMount() {
        this.setItem_Record();
        this.retrieveItem(this.props.currentId);
    }
    setItem_Record() {
        RECORD_REVIEW_SERVICE.getRecord(this.props.currentId)
            .then(response => {
                if (response.data.length < 1) {
                    this.setState({
                        currentRecord: null,
                        currentVersionR: null,
                        loaded: true,
                    });
                } else {
                    this.setState({
                        currentRecord: response.data[0],
                        currentVersionR: response.data[0].version,
                        loaded: true,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: this.props.swaMsg.generic_eror_title,
                    text: this.props.swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    requestUpdateRecord(id) {
        RECORD_REVIEW_SERVICE.getRecord(id)
            .then(response => {
                this.setState({
                    currentRecord: response.data[0],
                    currentVersionR: response.data[0].version,
                    loaded: true,
                });
            })
            .catch(e => {
                console.log(e);
            });
    }
    requestUpdate(id) {
        this.props.requestUpdate(id);
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
                this.retrievePQRSxFUN(response.data.id_public);
                SubmitService.getIdRelated(response.data.id_public).then(resres => {
                    this.setState({ vrsRelated: resres.data })
                })
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    retrievePQRSxFUN(id_public) {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                this.setState({
                    pqrsxfun: response.data,
                })
            })
            .catch(e => {
                console.log(e);
            });
    }

    async CREATE_CHECK(_detail, chekcs, _currentItem, _headers) {
        let swaMsg = this.props.swaMsg;
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });

        // ****************** CREATES NEW PDF DOC AND PASTE THE OLD PDF ON TOP *********** //
        const mergedPdf = await PDFDocument.create();

        var formUrl = process.env.REACT_APP_API_URL + "/pdf/recordlawextra";
        var formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDocLaw = await PDFDocument.load(formPdfBytes);
        const copiedPagesA = await mergedPdf.copyPages(pdfDocLaw, pdfDocLaw.getPageIndices());
        copiedPagesA.forEach((page) => mergedPdf.addPage(page));

        formUrl = process.env.REACT_APP_API_URL + "/pdf/recordarcextra";
        formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDocArc = await PDFDocument.load(formPdfBytes);
        const copiedPagesB = await mergedPdf.copyPages(pdfDocArc, pdfDocArc.getPageIndices());
        copiedPagesB.forEach((page) => mergedPdf.addPage(page));

        formUrl = process.env.REACT_APP_API_URL + "/pdf/recordengextra";
        formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDocEng = await PDFDocument.load(formPdfBytes);
        const copiedPagesC = await mergedPdf.copyPages(pdfDocEng, pdfDocEng.getPageIndices());
        copiedPagesC.forEach((page) => mergedPdf.addPage(page));

        const currentItem = _currentItem
        const id_public = currentItem.id_public;

        let page = mergedPdf.getPage(0)
        const helveticaFont = await mergedPdf.embedFont(StandardFonts.Helvetica)
        page.setFont(helveticaFont)


        handleLAWhCheck(mergedPdf, page, chekcs[0], _detail[0], 0, 1);
        handleArchCheck(mergedPdf, page, chekcs[1], _detail[1], 2, 3);
        handleEnghCheck(mergedPdf, page, chekcs[2], _detail[2], 4, 5);


        let _city = _headers.city;
        let _number = _headers.number;

        let pageCount = mergedPdf.getPageCount();

        for (let i = 0; i < pageCount; i++) {
            page = mergedPdf.getPage(i);
            page.moveTo(215, 783)
            page.drawText(_number, { size: 14 })
            page.moveTo(100, 770)
            page.drawText(_city, { size: 9 })
            page.moveTo(420, 830)
            page.drawText(id_public, { size: 14 })
        }

        mergedPdf.setAuthor("CURADURIA URBANA 1 DE BUCARAMANGA");
        mergedPdf.setCreationDate(moment().toDate());
        mergedPdf.setCreator('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        mergedPdf.setKeywords(['formulario', 'unico', 'nacional', 'curaduria', 'planeacion', 'construccion', 'obra', 'proyecto', 'informe', 'acta', 'juridico']);
        mergedPdf.setLanguage('es-co');
        mergedPdf.setProducer('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        mergedPdf.setTitle('FORMATO DE REVISIÓN E INFORMACIÓN DEPROYECTOS - ' + id_public)

        var pdfBytes = await mergedPdf.save();
        var fileDownload = require('js-file-download');
        fileDownload(pdfBytes, 'FORMATO DE REVISIÓN E INFORMACIÓN DEPROYECTOS ' + id_public + '.pdf');
        MySwal.close();


    }

    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { loaded, currentRecord, currentVersionR, currentItem, currentStepIndex, vrsRelated } = this.state;
        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                description: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CLOCK = () => {
            var _CHILD = currentItem ? currentItem.fun_clocks : [];
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
        let _GET_LAW = () => {
            var _RECORD = currentItem.record_law ? currentItem.record_law : {};
            return _RECORD;
        }
        let _GET_ARC = () => {
            var _RECORD = currentItem.record_arc ? currentItem.record_arc : {};
            return _RECORD;
        }
        let _GET_ENG = () => {
            var _RECORD = currentItem.record_eng ? currentItem.record_eng : {};
            return _RECORD;
        }

        let _GET_REVIEW_LAW = () => {
            var _RECORD = currentItem.record_law ? currentItem.record_law : false;
            var _CHILD = _RECORD ? _RECORD.record_law_reviews ? _RECORD.record_law_reviews : false : false;
            var _CURRENT_VERSION = _RECORD ? _RECORD.version - 1 : -1;
            var _CHILD_VARS = {
                id: "",
                worker_id: "",
                worker_name: _RECORD.worker_name ?? '',
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
        let _GET_REVIEW_ARC = () => {
            var _RECORD = currentItem.record_arc ? currentItem.record_arc : false;
            var _CHILD = _RECORD ? _RECORD.record_arc_38s ? _RECORD.record_arc_38s : false : false;
            var _CURRENT_VERSION = _RECORD ? _RECORD.version - 1 : -1;
            var _CHILD_VARS = {
                id: "",
                worker_id: "",
                worker_name: "",
                check: "",
                date: "",
                detail: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.id = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.detail = _CHILD[_CURRENT_VERSION].detail;
                    _CHILD_VARS.worker_id = _CHILD[_CURRENT_VERSION].worker_id;
                    _CHILD_VARS.worker_name = _CHILD[_CURRENT_VERSION].worker_name;
                    _CHILD_VARS.check = _CHILD[_CURRENT_VERSION].check;
                    _CHILD_VARS.date = _CHILD[_CURRENT_VERSION].date ? _CHILD[_CURRENT_VERSION].date : "";
                }
            }
            return _CHILD_VARS;
        }
        let _GET_REVIEW_ENG = () => {
            var _RECORD = currentItem.record_eng ? currentItem.record_eng : false;
            var _CHILD = _RECORD ? _RECORD.record_eng_reviews ? _RECORD.record_eng_reviews : false : false;
            var _CURRENT_VERSION = _RECORD ? _RECORD.version : -1;
            var _CHILD_VARS = {
                id: false,
                version: 1,
                check: "",
                check_2: "",
                date: "",
                desc: '',
                detail: '',
                detail_2: '',
                detail_3: '',
                worker_id: '',
                worker_name: '',
                check_context: '',
                check_2_cotext: '',
            }
            if (_CHILD) {
                for (let i = 0; i < _CHILD.length; i++) {
                    const element = _CHILD[i];
                    if (element.version == _CURRENT_VERSION) {
                        _CHILD_VARS.id = element.id;
                        _CHILD_VARS.version = element.version;
                        _CHILD_VARS.check = element.check;
                        _CHILD_VARS.check_2 = element.check_2;
                        _CHILD_VARS.date = element.date ?? "";
                        _CHILD_VARS.desc = element.desc ?? "";
                        _CHILD_VARS.detail = element.detail ?? "";
                        _CHILD_VARS.detail_2 = element.detail_2 ?? "";
                        _CHILD_VARS.detail_3 = element.detail_3 ?? "";
                        _CHILD_VARS.worker_id = element.worker_id ?? "";
                        _CHILD_VARS.worker_name = element.worker_name ?? "";
                        _CHILD_VARS.check_context = element.check_context ?? "";
                        _CHILD_VARS.check_2_cotext = element.check_2_cotext ?? "";
                    }
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_REVIEW = () => {
            var _CHILD = currentItem.fun_rs;
            var _CURRENT_VERSION = currentItem.version;
            var VAR = false;
            if (_CHILD) {
                for (let i = 0; i < _CHILD.length; i++) {
                    const element = _CHILD[i];
                    if (element.version == _CURRENT_VERSION) VAR = _CHILD[i]
                }
            }
            return VAR;
        }
        let LOAD_STEP = (_id_public, _parent) => {
            var _CHILD = currentItem[_parent]
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == 1 && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type, _parent) => {
            var STEP = LOAD_STEP(_id_public, _parent);
            if (!STEP.id) return [];
            var value = STEP[_type]
            if (!value) return [];
            value = value.split(';');
            return value
        }
        let _GET_LAST_ID = (_id) => {
            let new_id = "";
            PQRS_Service.getlascub()
                .then(response => {
                    new_id = response.data[0].cub;
                    new_id = _MANAGE_IDS(new_id, 'end')
                    document.getElementById(_id).value = new_id;
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el concecutivo, intentelo nuevamnte.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }
        // DATA CONVERTERS
        let _GET_CLOCK_STATE_VERSION = (_state, _version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_CLOCK_STATE = (_state) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }
        let _CHECK_LAW_REPORT = () => {
            var _CHILD = currentItem.record_law;
            if (!_CHILD) return false;
            _CHILD = _CHILD.record_law_reviews;
            if (!_CHILD.length) return false;
            let revision = currentItem.record_law.version;
            revision = Number(revision) - 1;
            if (!_CHILD[revision]) return false;

            let _review = _CHILD[revision].check ?? false;
            let _date = _CHILD[revision].date ?? false;

            if (_review !== false && _date !== false) return true
            return false;
        }
        let _CHECK_ENG_REPORT = () => {
            var _CHILD = currentItem.record_eng;
            if (!_CHILD) return false;
            _CHILD = _CHILD.record_eng_reviews;
            if (!_CHILD.length) return false;
            let revision = currentItem.record_law.version;
            revision = Number(revision) - 1;
            if (!_CHILD[revision]) return false;

            let _review = _CHILD[revision].check ?? false;
            let _date = _CHILD[revision].date ?? false;

            if (_review !== false && _date !== false) return true
            return false;
        }
        let _CHECK_ARC_REPORT = () => {
            var _CHILD = currentItem.record_arc;
            if (!_CHILD) return false;
            _CHILD = _CHILD.record_arc_38s;
            if (!_CHILD.length) return false;
            let revision = currentItem.record_law.version;
            revision = Number(revision) - 1;

            if (!_CHILD[revision]) return false;

            let _review = _CHILD[revision].check ?? false;
            let _date = _CHILD[revision].date ?? false;

            if (_review !== false && _date !== false) return true
            return false;
        }
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
        let get_clockExistIcon = (state) => {
            var _CHILD = _GET_CLOCK_STATE(state);
            if (_CHILD) return <i class="far fa-check-circle text-success"></i>
            return <i class="far fa-dot-circle"></i>
        }
        let pro = () => {
            return _GET_CLOCK_STATE(34).date_start ?? false;
        }
        const record_clocks = [
            { state: 31, limit: 5, limit_id: [30], name: 'Citación (Observaciones)', types: ['PERSONAL', 'CERTIFICADO', 'ELECTRÓNICO'], desc: 'Citación del acta de Observaciones' },
            { state: 32, limit: 5, limit_id: [31], name: 'Notificación (Observaciones)', types: ['PERSONAL', 'CERTIFICADO', 'ELECTRÓNICO'], desc: 'Notificación al solicitante, ya sea personal, electrónico o por correo certificado' },
            { state: 33, limit: 10, limit_id: [31], name: 'Notificación por aviso (Observaciones)', types: ['CERTIFICADO', 'ELECTRÓNICO'], desc: 'Notificación por medio de Aviso' },
            { alert: 'SI REQUIERE ACTA DE CORRECCIONES', },
            { state: false, limit: 1, limit_id: [32, 33], name: 'Reanudación De Términos Solicitante', types: false, desc: false },
            { state: 34, limit: 30, limit_id: [32, 33], name: 'Presentación De Prórroga', types: false, desc: 'Presenta la prórroga para extender el plazo para entregar correcciones' },
            { state: 35, limit: pro() ? 45 : 30, limit_id: [32, 33], name: 'Presentación De Correcciones', types: false, desc: 'Presenta formalmente las correcciones para el acta de Observaciones' },
            { alert: 'TERMINA PROCESO DE CORRECCIÓN', },
            { state: false, limit: pro() ? 46 : 31, limit_id: [32, 33], name: 'Reanudación De Términos Curaduria', types: false, desc: false, alt: [32, 33, 35] },
        ]
        let get_map_clock = (_array) => {
            let clock = false;
            for (let i = 0; i < _array.length; i++) {
                const element = _GET_CLOCK_STATE(_array[i]);
                if (element.date_start) clock = element
            }
            return clock
        }

        // JSX CONTROLLERS
        let _CHILD_6_SELECT = () => {
            let _LIST = _GET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _CHANGE_VALUES = (_type, _reviews, _i) => {
            document.getElementById('record_pdf_worker_name_' + _type).value = _reviews[_i].worker;
            document.getElementById('record_pdf_check_' + _type).value = _reviews[_i].check == 1 ? 'VIABLE' : 'NO VIABLE';
            document.getElementById('record_pdf_date_' + _type).value = _reviews[_i].date;
        }
        let _CHANGE_VALUES_ENG = (_reviews, i) => {
            document.getElementById('record_pdf_worker_name_eng').value = _reviews[i].worker;
            document.getElementById('record_pdf_date_eng').value = _reviews[i].date;

            document.getElementById('record_pdf_check_1_v_eng').value = _reviews[i].check == 1 ? 'VIABLE' : 'NO VIABLE';
            document.getElementById('record_pdf_check_2_v_eng').value = _reviews[i].check2 == 1 ? 'VIABLE' : _reviews[i].check2 == 2 ? 'NO APLICA' : 'NO VIABLE';
            document.getElementById('record_pdf_check_1_c_eng').value = _reviews[i].c1;
            document.getElementById('record_pdf_check_2_c_eng').value = _reviews[i].c2;
        }
        // COMPONENT JSX
        let _NOTY_TYPE_COMPONENENT = () => {
            return <>
                <div className='row mx-5 my-3'>
                    <strong>TIPO DE NOTIFICACIÓN</strong>

                    <div className="col-4">
                        <select className='form-select' id="type_not" onChange={(e) => this.setState({ 'tn': e.target.value })}>
                            <option value="0">NO USAR</option>
                            <option value="1">NOTIFICACIÓN PRESENCIAL</option>
                            <option value="2">NOTIFICACIÓN ELECTRÓNICA - SIN RECURSO</option>
                            <option value="3">NOTIFICACIÓN ELECTRÓNICA - CON RECURSO</option>
                        </select>
                    </div>
                    {this.state.tn == 2 || this.state.tn == 3 ?
                        <>
                            <div className="col-4">
                                <div class="input-group my-1">
                                    <input type="text" class="form-control" id="type_not_name" placeholder='Sujeto Notificación' />
                                </div>
                            </div>
                            <div className="col-4">
                                <div class="input-group my-1">
                                    <input type="text" class="form-control" id="type_not_email" placeholder='Correo Notificación' />
                                </div>
                            </div>
                        </>
                        : ''}
                </div>
            </>
        }
        let _COMPONENT_REVIEW = () => {
            const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
            const evaDefaultTime = _fun_0_type_time[currentItem.type] ?? 45
            let limit_1 = dateParser_finalDate(_GET_CLOCK_STATE(5).date_start, evaDefaultTime)
            let notTime = dateParser_dateDiff(_GET_CLOCK_STATE(31).date_start, _GET_CLOCK_STATE(32).date_start || _GET_CLOCK_STATE(33).date_start)
            let acta2Time = (evaDefaultTime) + (30) + (_GET_CLOCK_STATE(35).date_start ? 15 : 0) + (5)
            let limit_2 = dateParser_finalDate(_GET_CLOCK_STATE(5).date_start, acta2Time)

            let is_Outdate_1 = dateParser_dateDiff(limit_1, currentRecord.date, true)
            let is_Outdate_2 = dateParser_dateDiff(limit_2, currentRecord.date_2, true)

            return <>
                <div className="row">
                    <div className="col-2">
                        <br />
                        <label className='fw-bold'>Fecha limite: </label> {limit_1} {is_Outdate_1 < 0 ? <label className='fw-bold text-danger'>EXTEMPORÁNEO</label> : ''}
                    </div>
                    <div className="col-5">
                        <label>Fecha del acta de observaciones</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" id="record_review_2" max="2100-01-01"
                                defaultValue={currentRecord.date ?? ''} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Resultado</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <select class="form-select" id="record_review_3" defaultValue={currentRecord.check ?? 2} >
                                <option value="0" className="text-danger">TIENE OBSERVACIONES</option>
                                <option value="1" className="text-success">CUMPLE CON TODO</option>
                                <option value="2" className="text-warning">SIN REVISAR</option>
                            </select>
                        </div>
                    </div>

                </div>
                <div className="row">
                    <div className="col-2">
                        <br />
                        <label className='fw-bold'>Fecha limite: </label>  {limit_2} {is_Outdate_2 < 0 ? <label className='fw-bold text-danger'>EXTEMPORÁNEO</label> : ''}
                    </div>
                    <div className="col-5">
                        <label>Fecha del acta de Correcciones</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" id="record_review_4" max="2100-01-01"
                                defaultValue={currentRecord.date_2 ?? ''} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Resultado</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <select class="form-select" id="record_review_5" defaultValue={currentRecord.check_2 ?? 2} >
                                <option value="0" className="text-danger">NO CUMPLE (NEGADO)</option>
                                <option value="1" className="text-success">CUMPLE CON TODO (APROBADO)</option>
                                <option value="2" className="text-warning">SIN REVISAR</option>
                                <option value="-1" className="text-danger">DESISTIDO</option>
                            </select>
                        </div>
                    </div>

                </div>
            </>
        }
        let _COMPOANENT_PAST_REIEWS = () => {
            let _chceks_prev = currentRecord.checks_prev;
            if (_chceks_prev) {
                let _reviews = _chceks_prev.split('&');
                return _reviews.map((array, index) => {
                    let values = array.split(';');
                    return <>
                        <div className="row">
                            <legend className="my-2 px-3 text-uppercase bg-light" id="record_ph_2">
                                <label className="app-p lead fw-normal text-uppercase">HISTORIAL DE REVISIONES DE ACTAS</label>
                            </legend>
                        </div>
                        <div className="row">
                            <div className="col-4">
                                <label className="fw-bold">Resultado de la revisión {index + 1}</label>
                            </div>
                            <div className="col-4">
                                <label>Fecha del acta de observaciones</label>
                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="far fa-calendar-alt"></i>
                                    </span>
                                    <input type="date" class="form-control" id="record_ph_worker_arc_2" required
                                        defaultValue={values[1]} />
                                </div>
                            </div>
                            <div className="col-4">
                                <label>Aprobado</label>
                                <div class="input-group my-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="far fa-check-square"></i>
                                    </span>
                                    <select class="form-control" id="recprd_ph_final_check" defaultValue={values[0]} >
                                        <option value="0" className="text-danger">NO</option>
                                        <option value="1" className="text-success">SI</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </>
                })

            }
        }
        let _COMPONENT_NOTIFICATION_OBS = () => {
            return <>

                <div className="row mx-2 bg-info text-white">
                    <div className="col-3 text-center">
                        <label className="fw-bold mt-1">EVENTO</label>
                    </div>
                    <div className="col text-center">
                        <label className="fw-bold mt-1">FECHA EVENTO</label>
                    </div>
                    <div className="col text-center">
                        <label className="fw-bold mt-1">FECHA LIMITE</label>
                    </div>
                    <div className="col text-center">
                        <label className="fw-bold mt-1">FORMA</label>
                    </div>
                    <div className="col text-center">
                        <label className="fw-bold mt-1">ANEXO</label>
                    </div>
                    <div className="col-1 text-center">
                    </div>
                </div>

                <div className="row mx-2 my-0">
                    <div className="col-3 border">
                        <label className="fw-bold mt-2 ">{get_clockExistIcon(30)} Acta de Observaciones</label>
                    </div>
                    <div className="col border py-1 text-center">
                        <label className="fw-bold mt-2 ">{_GET_CLOCK_STATE(30).date_start ?? <label className='text-danger'>NO HAY ACTA DE OBS.</label>}</label>
                    </div>
                    <div className="col text-center border py-1">
                    </div>
                    <div className="col border py-1">
                    </div>

                    <div className="col border py-1">
                    </div>

                    <div className="col-1 border py-1">
                        {(_GET_CLOCK_STATE(30).resolver_id6 ?? 0) > 0
                            ?
                            <VIZUALIZER url={_FIND_6(_GET_CLOCK_STATE(30).resolver_id6).path + "/" + _FIND_6(_GET_CLOCK_STATE(30).resolver_id6).filename} apipath={'/files/'}
                            />
                            : ""}
                    </div>
                </div>
                {_COMPONENT_CLOCK_LIST()}
            </>
        }
        let _COMPONENT_CLOCK_LIST = () => {


            return record_clocks.map((value, i) => <>
                {value.alert ? <div className="row mx-2 my-0 text-center">
                    <div className="col border border-danger">
                        <label className="fw-bold mt-2 "> {value.alert}</label>
                    </div>
                </div>

                    : <div className="row mx-2 my-0">
                        <div className="col-3 border">
                            <label className="fw-bold mt-2">{value.state ? get_clockExistIcon(value.state) : ''} {value.name}</label>
                        </div>
                        <div className="col border py-1">
                            {value.state ?
                                <input type="date" class="form-control" id={'clock_acta_date_' + i} max="2100-01-01"
                                    defaultValue={_GET_CLOCK_STATE(value.state).date_start ?? ''} onBlur={(e) => save_clock2(value, i)} />
                                : ''}
                        </div>
                        <div className="col text-center border py-1">
                            {value.limit != undefined && value.alt == undefined ? dateParser_finalDate(get_map_clock(value.limit_id).date_start, value.limit) : ''}
                            {value.limit != undefined && value.alt ? dateParser_finalDate(get_map_clock(value.alt).date_start, 1) : ''}
                        </div>
                        <div className="col border py-1">
                            {value.types
                                ? <select className='form-select' id={'clock_acta_res_' + i} defaultValue={_GET_CLOCK_STATE(value.state).resolver_context ?? 0}
                                    onChange={(e) => save_clock2(value, i)}>
                                    {value.types.map(value => <option>{value}</option>)}
                                </select>
                                : ''}
                        </div>

                        <div className="col border py-1">
                            <select className='form-select' id={'clock_acta_id6_' + i} defaultValue={_GET_CLOCK_STATE(value.state).resolver_id6 ?? 0}
                                onChange={(e) => save_clock2(value, i)}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>

                        <div className="col-1 border py-1">
                            {(_GET_CLOCK_STATE(value.state).resolver_id6 ?? 0) > 0
                                ?
                                <VIZUALIZER url={_FIND_6(_GET_CLOCK_STATE(value.state).resolver_id6).path + "/" + _FIND_6(_GET_CLOCK_STATE(value.state).resolver_id6).filename} apipath={'/files/'}
                                />
                                : ""}
                        </div>
                    </div>}


            </>)
        }
        let PDF_GEN_ACTA = () => {
            let _RR = currentRecord;
            let CLOCKS_R;
            CLOCKS_R = _RR.check == 0 ? ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Acta Correcciones',] : ['Acta Observaciones',]
            // ***************** LAW ***************** // 
            let _REVIEW_LAW_DELTA = _GET_REVIEW_LAW();
            let _REVIEW_LAW_WORER = _GET_LAW().worker_name ?? _REVIEW_LAW_DELTA.worker_name;
            let _REVIEWS_LAW = _GET_CLOCK_STATE_VERSION(11, 200).resolver_context ? _GET_CLOCK_STATE_VERSION(11, 200).resolver_context.split(';') : [];
            let _REVIEWS_DATES_LAW = _GET_CLOCK_STATE_VERSION(11, 200).date_start ? _GET_CLOCK_STATE_VERSION(11, 200).date_start.split(';') : [];
            let reviews_law = [
                { worker: '', check: 0, date: '', },
                { worker: '', check: 0, date: '', },
                { worker: '', check: 0, date: '', },
                { worker: '', check: 0, date: '', },
            ]
            // ***************** ARC ***************** // 
            let _REVIEW_ARC_DELTA = _GET_REVIEW_ARC();
            let _REVIEW_ARC_WORER = _GET_ARC().worker_name ?? _REVIEW_ARC_DELTA.worker_name;
            let _REVIEWS_ARC = _GET_CLOCK_STATE_VERSION(13, 200).resolver_context ? _GET_CLOCK_STATE_VERSION(13, 200).resolver_context.split(';') : [];
            let _REVIEWS_DATES_ASC = _GET_CLOCK_STATE_VERSION(13, 200).date_start ? _GET_CLOCK_STATE_VERSION(13, 200).date_start.split(';') : [];
            let reviews_arc = [
                { worker: '', check: 0, date: '', },
                { worker: '', check: 0, date: '', },
                { worker: '', check: 0, date: '', },
                { worker: '', check: 0, date: '', },
            ]
            // ***************** ENG ***************** // 
            let _REVIEW_ENG_DELTA = _GET_REVIEW_ENG();
            let _REVIEW_ENG_WORER = _GET_ENG().worker_name ?? _REVIEW_ENG_DELTA.worker_name;
            let _REVIEWS_ENG = _GET_CLOCK_STATE_VERSION(12, 200).resolver_context ? _GET_CLOCK_STATE_VERSION(12, 200).resolver_context.split(';') : [];
            let _REVIEWS_DATES_ENG = _GET_CLOCK_STATE_VERSION(12, 200).date_start ? _GET_CLOCK_STATE_VERSION(12, 200).date_start.split(';') : [];
            let _REVIEWS_DESC_ENG = _GET_CLOCK_STATE_VERSION(12, 200).desc ? _GET_CLOCK_STATE_VERSION(12, 200).desc.split(';') : [];
            let reviews_eng = [
                { worker: '', check: 0, check2: 0, c1: '', c2: '', date: '', },
                { worker: '', check: 0, check2: 0, c1: '', c2: '', date: '', },
                { worker: '', check: 0, check2: 0, c1: '', c2: '', date: '', },
                { worker: '', check: 0, check2: 0, c1: '', c2: '', date: '', },
            ]
            // ************************************** // 
            for (let i = 0; i < CLOCKS_R.length; i++) {
                let eng_checks = _REVIEWS_ENG[i] ? _REVIEWS_ENG[i].split(',') : [];
                let eng_checks_desc = _REVIEWS_DESC_ENG[i] ? _REVIEWS_DESC_ENG[i].split('&&') : [];
                if (i == 0) {
                    reviews_law[i].worker = _REVIEW_LAW_WORER;
                    reviews_law[i].check = _REVIEW_LAW_DELTA.check || (_REVIEWS_LAW[i] ? _REVIEWS_LAW[i] : 0);
                    reviews_law[i].date = _REVIEW_LAW_DELTA.date || (_REVIEWS_DATES_LAW[i] ? _REVIEWS_DATES_LAW[i] : '');

                    reviews_arc[i].worker = _REVIEW_ARC_WORER;
                    reviews_arc[i].check = _REVIEW_ARC_DELTA.check || (_REVIEWS_ARC[i] ? _REVIEWS_ARC[i] : 0);
                    reviews_arc[i].date = _REVIEW_ARC_DELTA.date || (_REVIEWS_DATES_ASC[i] ? _REVIEWS_DATES_ASC[i] : '');

                    reviews_eng[i].worker = _REVIEW_ENG_WORER;
                    reviews_eng[i].check = _REVIEW_ENG_DELTA.check || (eng_checks[0] ? eng_checks[0] : 0);
                    reviews_eng[i].check2 = _REVIEW_ENG_DELTA.check_2 || (eng_checks[1] ? eng_checks[1] : 0);
                    reviews_eng[i].date = _REVIEW_ENG_DELTA.date || (_REVIEWS_DATES_ENG[i] ? _REVIEWS_DATES_ENG[i] : '');
                    reviews_eng[i].c1 = _REVIEW_ENG_DELTA.check_context || (eng_checks_desc[0] ? eng_checks_desc[0] : '');
                    reviews_eng[i].c2 = _REVIEW_ENG_DELTA.check_2_cotext || (eng_checks_desc[1] ? eng_checks_desc[1] : '');
                } else {
                    reviews_law[i].worker = _REVIEW_LAW_WORER;
                    reviews_law[i].check = _REVIEWS_LAW[i] ? _REVIEWS_LAW[i] : 0;
                    reviews_law[i].date = _REVIEWS_DATES_LAW[i] ? _REVIEWS_DATES_LAW[i] : '';

                    reviews_arc[i].worker = _REVIEW_ARC_WORER;
                    reviews_arc[i].check = _REVIEWS_ARC[i] ? _REVIEWS_ARC[i] : 0;
                    reviews_arc[i].date = _REVIEWS_DATES_ASC[i] ? _REVIEWS_DATES_ASC[i] : '';

                    reviews_eng[i].worker = _REVIEW_ENG_WORER;
                    reviews_eng[i].check = eng_checks[0] ? eng_checks[0] : 0;
                    reviews_eng[i].check2 = (eng_checks[1] ? eng_checks[1] : 0);
                    reviews_eng[i].date = _REVIEWS_DATES_ENG[i] ? _REVIEWS_DATES_ENG[i] : '';
                    reviews_eng[i].c1 = (eng_checks_desc[0] ? eng_checks_desc[0] : '');
                    reviews_eng[i].c2 = (eng_checks_desc[1] ? eng_checks_desc[1] : '');
                }
            }
            return <>
                <div className="row mb-3">
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
                        <label>Fecha expedición</label>
                        <div class="input-group my-1">
                            <input type="date" max="2100-01-01" class="form-control me-1" id="record_date"
                                defaultValue={moment().format('YYYY-MM-DD')} />
                        </div>
                    </div>
                </div>
                <div className="row mb-1 text-center">
                    <div className="col"> <label className='fw-bold'>INFORME</label> </div>
                    <div className="col"> <label className='fw-bold'>REVISION</label> </div>
                    <div className="col"> <label className='fw-bold'>PROFESIONAL</label> </div>
                    <div className="col"> <label className='fw-bold'>RESULTADO</label> </div>
                    <div className="col"> <label className='fw-bold'>FECHA</label> </div>
                    <div className="col-1"> <label className='fw-bold'>PEND.</label> </div>
                </div>
                <div className="row mb-1">
                    <div className="col text-center pt-1"> <label className='fw-bold'><i class="fas fa-balance-scale"></i> JUR.</label> </div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <select class="form-select me-1" id={"record_pdf_version"} onChange={(e) => _CHANGE_VALUES('law', reviews_law, e.target.value)}>
                                {CLOCKS_R.map((op, i) => <option value={i}>{op}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <input className='form-control' id={"record_pdf_worker_name_law"} disabled defaultValue={reviews_law[0].worker} />
                        </div>
                    </div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <input className='form-control' id={"record_pdf_check_law"} disabled defaultValue={reviews_law[0].check == 1 ? 'VIABLE' : 'NO VIABLE'} />
                        </div>
                    </div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <input className='form-control' id={"record_pdf_date_law"} disabled defaultValue={reviews_law[0].date} />
                        </div>
                    </div>
                    <div className="col-1 d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_law_pending" />
                        </div>
                    </div>

                </div>
                <div className="row mb-1">
                    <div className="col text-center pt-1"> <label className='fw-bold'><i class="far fa-building"></i>  ARQ.</label> </div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <select class="form-select me-1" id={"record_pdf_version"} onChange={(e) => _CHANGE_VALUES('arc', reviews_arc, e.target.value)}>
                                {CLOCKS_R.map((op, i) => <option value={i}>{op}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <input className='form-control' id={"record_pdf_worker_name_arc"} disabled defaultValue={reviews_arc[0].worker} />
                        </div>
                    </div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <input className='form-control' id={"record_pdf_check_arc"} disabled defaultValue={reviews_arc[0].check == 1 ? 'VIABLE' : 'NO VIABLE'} />
                        </div>
                    </div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <input className='form-control' id={"record_pdf_date_arc"} disabled defaultValue={reviews_arc[0].date} />
                        </div>
                    </div>
                    <div className="col-1 d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_arc_pending" />
                        </div>
                    </div>

                </div>
                <div className="row mb-1">
                    <div className="col text-center pt-1"> <label className='fw-bold'><i class="fas fa-cogs"></i> EST.</label> </div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <select class="form-select me-1" id={"record_pdf_version_eng"} onChange={(e) => _CHANGE_VALUES_ENG(reviews_eng, e.target.value)}>
                                {CLOCKS_R.map((op, i) => <option value={i}>{op}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <input className='form-control' id={"record_pdf_worker_name_eng"} disabled defaultValue={reviews_eng[0].worker} />
                        </div>
                    </div>
                    <div className="col"></div>
                    <div className="col">
                        <div class="input-group input-group-sm">
                            <input className='form-control' id={"record_pdf_date_eng"} disabled defaultValue={reviews_eng[0].date} />
                        </div>
                    </div>
                    <div className="col-1 d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_eng_pending" />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col"></div>
                    <div className="col">
                        <h5 className='fw-normal'>Resultado 1 Contexto:</h5>
                        <input className='form-control form-control-sm' id={"record_pdf_check_1_c_eng"} disabled defaultValue={reviews_eng[0].c1} />
                    </div>
                    <div className="col">
                        <h5 className='fw-normal'>Resultado 1:</h5>
                        <input className='form-control form-control-sm' id={"record_pdf_check_1_v_eng"} disabled defaultValue={reviews_eng[0].check == 1 ? 'VIABLE' : 'NO VIABLE'} />
                    </div>
                    <div className="col">
                        <h5 className='fw-normal'>Resultado 2 Contexto:</h5>
                        <input className='form-control form-control-sm' id={"record_pdf_check_2_c_eng"} disabled defaultValue={reviews_eng[0].c2} />
                    </div>
                    <div className="col">
                        <h5 className='fw-normal'>Resultado 2:</h5>
                        <input className='form-control form-control-sm' id={"record_pdf_check_2_v_eng"} disabled defaultValue={reviews_eng[0].check2 == 1 ? 'VIABLE' : reviews_eng[0].check2 == 2 ? 'NO APLICA' : 'NO VIABLE'} />
                    </div>
                </div>

                {_NOTY_TYPE_COMPONENENT()}
                {/**
                 *  <div className="row mb-1">
                    <div className="col-2 d-flex justify-content-end">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_rew_notdig" onChange={() => { this.setState({ notdig: !this.state.notdig }) }} />
                            <label class="form-check-label">Not. Digital</label>
                        </div>
                    </div>
                    <div className="col-2">
                        <input type="text" className='form-control form-control-sm' id={"record_rew_notdig_pro"} disabled={!this.state.notdig} defaultValue={'Señor(a)'} />
                    </div>
                    <div className="col">
                        <input type="text" className='form-control form-control-sm' id={"record_rew_notdig_names"} disabled={!this.state.notdig} defaultValue={''} placeholder={'nombres separados por coma'} />
                    </div>
                </div>
                 * 
                 */}

                <div className="row my-3">
                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_rew_simple" />
                            <label class="form-check-label" for="exampleCheck1">Acta simple</label>
                        </div>
                    </div>
                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_rew_footer" defaultChecked={'true'} />
                            <label class="form-check-label" for="exampleCheck1" >Usar Pie de pagina</label>
                        </div>
                    </div>
                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_rew_pagination" />
                            <label class="form-check-label" for="exampleCheck1">Usar Paginación</label>
                        </div>
                    </div>
                </div>

                <div className="row my-3">
                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_eng_diagnostic" />
                            <label class="form-check-label" for="exampleCheck1">Diagnostico NSR-10</label>
                        </div>
                    </div>
                </div>

                <div className="row my-3 text-center">
                    <div className="col">
                        <button className="btn btn-danger me-1 btn-sm" onClick={() => creae_pdf()}> <i class="far fa-file-pdf"></i> DESCARGAR ACTA</button>
                    </div>
                    <div className="col text-center">
                        <button className="btn btn-danger btn-sm" onClick={() => CREATE_PDF_CHECK()}> <i class="far fa-file-pdf"></i> DESCARGAR CHEKEO</button>
                    </div>
                </div>
            </>
        }
        let _BTN_GEN_ID = () => {
            return <>
                <div className='row'>
                    <div className="col-2">
                    </div>
                    <div className="col-5">
                        <label className="mt-2">{infoCud.serials.end} de Acta de Observaciones y Correcciones</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="rev_cub"
                                defaultValue={currentRecord.id_public ?? ''} />
                            <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID('rev_cub')}>GENERAR</button>
                        </div>
                    </div>
                    <div className="col-4" >
                        <label className="mt-1">{infoCud.serials.start}</label>
                        <div class="input-group ">
                            <select class="form-select" defaultValue={""} id="vr_selected">
                                {vrsRelated && vrsRelated.map((value, key) => (
                                    <option key={value.id} value={value.id_public}>
                                        {value.id_public}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }

        // APIS
        var formData = new FormData();

        let new_record_review = () => {
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);
            formData.set('version', 1);
            RECORD_REVIEW_SERVICE.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.requestUpdateRecord(currentItem.id)
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
        let new_version = () => {
            let lawId = _CHECK_LAW_REPORT();
            let engId = _CHECK_ENG_REPORT();
            let arcId = _CHECK_ARC_REPORT();

            if (currentItem.version >= 2) return MySwal.fire({
                title: "MAXIMO NUMERO DE REVISIONES ALCANZADO",
                text: `Esta solicitud ya tiene 2 revisiones, el sistema no puede generar mas.`,
                icon: 'warning',
                confirmButtonText: "CONTINUAR",
            })

            if (!lawId || !engId || !arcId) return MySwal.fire({
                title: "FALTAN INFORMES",
                text: `Para poder generar una nueva revision, se debe de tener los informes ya revisados.`,
                icon: 'error',
                confirmButtonText: "REVISAR",
            })


            MySwal.fire({
                title: "NUEVA REVISION",
                text: `¿Esta seguro de generar una nueva revision (${currentItem.version + 1}) de esta solicitud?`,
                icon: 'question',
                confirmButtonText: "REVISAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    MySwal.fire({
                        title: swaMsg.title_wait,
                        text: swaMsg.text_wait,
                        icon: 'info',
                        showConfirmButton: false,
                    });
                    formData = new FormData();
                    formData.set('fun0Id', currentItem.id);
                    formData.set('version', currentItem.version);

                    formData.set('lawId', currentItem.record_law.id);
                    formData.set('engId', currentItem.record_eng.id);
                    formData.set('arcId', currentItem.record_arc.id);

                    RECORD_REVIEW_SERVICE.newVersion(formData)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.requestUpdateRecord(currentItem.id);
                                this.retrieveItem(currentItem.id)
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
            });
        }

        let review = () => {
            let lawId = _CHECK_LAW_REPORT();
            let engId = _CHECK_ENG_REPORT();
            let arcId = _CHECK_ARC_REPORT();

            /*
            if (window.user.roleId != 1) {
                if ((!lawId || !engId || !arcId)) return MySwal.fire({
                    title: "FALTAN INFORMES",
                    text: `Para poder generar la revicion, se debe de tener los informes ya revisados.`,
                    icon: 'error',
                    confirmButtonText: "REVISAR",
                })
            }*/


            MySwal.fire({
                title: "REALIZAR REVISION",
                text: `¿Esta seguro de realizar la revision ${currentItem.version} del ACTA DE CORRECIONES / OBSERVACIONES?`,
                icon: 'question',
                confirmButtonText: "REVISAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    save_review();
                    save_clock();
                    createVRxCUB_relation();
                }
            });
        }

        let save_review = () => {
            formData = new FormData();

            let date = document.getElementById("record_review_2").value;
            let check = document.getElementById("record_review_3").value;
            if (check != 2) {
                formData.set('check', check);
                formData.set('date', date);
            }
            let date_2 = document.getElementById("record_review_4").value;
            let check_2 = document.getElementById("record_review_5").value;
            if (check_2 != 2) {
                formData.set('check_2', check_2);

                formData.set('date_2', date_2);
            }

            let id_public = document.getElementById("rev_cub").value;
            //let id_public = currentItem.id_public;
            formData.set('id_public', id_public);
            formData.set('new_cub', id_public);
            formData.set('prev_cub', currentRecord.id_public);

            manage_review(true);
        }
        let manage_review = (useMySwal) => {
            let _CHILD = currentRecord;
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            RECORD_REVIEW_SERVICE.update(_CHILD.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                        this.requestUpdateRecord(currentItem.id)
                        this.retrieveItem(currentItem.id)
                        this.requestUpdate(currentItem.id)
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACION",
                            text: `El concecutivo ${infoCud.serials.end} de este formulario ya existe, debe de elegir un concecutivo nuevo`,
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    } else {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                });
        }

        let save_clock_exp = () => {
            var formDataClock = new FormData();

            formDataClock.set('state', 50);
            formDataClock.set('date_start', document.getElementById('record_review_next').value)
            formDataClock.set('name', 'Entra en proceso de expedición');
            formDataClock.set('desc', 'La solicitud cumple con todos los requisitos satisfactoriamente.');

            manage_clock(false, 50, false, formDataClock)
        }
        let save_clock = () => {
            var formDataClock = new FormData();

            //let state = 30 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS
            let version = currentItem.version;


            let date = document.getElementById("record_review_2").value;
            let date_2 = document.getElementById("record_review_4").value;
            let review_1 = document.getElementById("record_review_3").value;
            let review_2 = document.getElementById("record_review_5").value;
            let desc_1 = review_1 == 1 ? "CUMPLE" : "NO CUMPLE";
            let desc_2 = review_2 == 1 ? "CUMPLE" : "NO CUMPLE";

            if (review_1 != 2) {
                formDataClock = new FormData();
                let state = 30;
                formDataClock.set('date_start', date);
                formDataClock.set('name', "ACTA PARTE 1 OBSERVACIONES, revision # " + version);
                formDataClock.set('desc', `ACTA PARTE 1 OBSERVACIONES: ${desc_1}`);
                formDataClock.set('state', state);
                formDataClock.set('version', version);

                manage_clock(false, state, version, formDataClock);
            }
            if (review_2 != 2) {
                formDataClock = new FormData();
                let state = 49;
                formDataClock.set('date_start', date_2);
                formDataClock.set('name', "ACTA PARTE 2 CORRECCIONES, revision # " + version);
                formDataClock.set('desc', `ACTA PARTE 2 CORRECCIONES: ${desc_2}`);
                formDataClock.set('state', state);
                formDataClock.set('version', version);

                manage_clock(false, state, version, formDataClock);
            }

        }
        let save_clock2 = (value, i) => {
            var formDataClock = new FormData();

            let date_start = document.getElementById("clock_acta_date_" + i) ? document.getElementById("clock_acta_date_" + i).value : '';
            let resolver_context = document.getElementById("clock_acta_res_" + i) ? document.getElementById("clock_acta_res_" + i).value : false;
            let resolver_id6 = document.getElementById("clock_acta_id6_" + i).value;

            formDataClock.set('date_start', date_start);
            if (resolver_context) formDataClock.set('resolver_context', resolver_context);
            formDataClock.set('resolver_id6', resolver_id6);
            formDataClock.set('state', value.state);
            let desc = value.desc;
            if (resolver_context) desc = desc + ': ' + resolver_context;
            formDataClock.set('desc', desc);
            formDataClock.set('name', value.name);

            manage_clock(false, value.state, false, formDataClock)

        }
        let manage_clock = (useMySwal, findOne, version, formDataClock) => {
            var _CHILD = version ? _GET_CLOCK_STATE_VERSION(findOne, version) : _GET_CLOCK_STATE(findOne);

            formDataClock.set('fun0Id', currentItem.id);
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }

            if (_CHILD.id) {
                FUN_SERVICE.update_clock(_CHILD.id, formDataClock)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                            this.requestUpdateRecord(currentItem.id)
                            this.retrieveItem(currentItem.id)
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }
            else {
                FUN_SERVICE.create_clock(formDataClock)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                            this.requestUpdateRecord(currentItem.id)
                            this.retrieveItem(currentItem.id)
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }

        }

        let update_fun_0 = (e) => {
            e.preventDefault();
            let acta1 = [currentRecord.date, currentRecord.check];
            let acta2 = [currentRecord.date_2, currentRecord.check_2];

            if (!(acta1[1] == 1 || (acta1[1] == 0 && acta2[1] == 1))) MySwal.fire({
                title: "ADVERTENCIA",
                text: `No hay valores validos para el Acta, si realmente desea continuar, realicé la revision.`,
                icon: 'info',
                confirmButtonText: "CONTINUAR",
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    MySwal.fire({
                        title: "¿PROSEGUIR A EXPEDICIÓN?",
                        text: `¿Esta seguro de seguir al proceso de Expedición de esta solicitud?`,
                        icon: 'question',
                        confirmButtonText: "PROSEGUIR",
                        showCancelButton: true,
                        cancelButtonText: "CANCELAR"
                    }).then(SweetAlertResult => {
                        if (SweetAlertResult.isConfirmed) {
                            manage_fun_0();
                            save_clock_exp();
                        }
                    });
                }
            });
            else MySwal.fire({
                title: "¿PROSEGUIR A EXPEDICIÓN?",
                text: `¿Esta seguro de seguir al proceso de Expedición de esta solicitud?`,
                icon: 'question',
                confirmButtonText: "PROSEGUIR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    manage_fun_0();
                    save_clock_exp();
                }
            });



        }

        let manage_fun_0 = () => {
            formData = new FormData();
            formData.set('state', 50);
            FunService.update(currentItem.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.requestUpdateRecord(currentItem.id)
                        this.retrieveItem(currentItem.id)
                        this.requestUpdate(currentItem.id)
                        this.props.closeModal();

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

        let creae_pdf = () => {
            var formData = new FormData();
            formData.set('id', currentItem.id);
            formData.set('version', currentItem.version);

            formData.set('type_not', document.getElementById("type_not").value);
            if (document.getElementById("type_not_name")) formData.set('type_not_name', document.getElementById("type_not_name").value);
            if (document.getElementById("type_not_email")) formData.set('type_not_email', document.getElementById("type_not_email").value);

            let r_footer = document.getElementById("record_rew_footer").checked;
            formData.set('r_footer', r_footer);
            let r_pagination = document.getElementById("record_rew_pagination").checked;
            formData.set('r_pagination', r_pagination);
            let r_simple = document.getElementById("record_rew_simple").checked;
            formData.set('r_simple', r_simple);
            //let r_notdig = document.getElementById("record_rew_notdig").checked;
            //formData.set('r_notdig', r_notdig);
            //let r_notdig_pro = document.getElementById("record_rew_notdig_pro").value;
            //formData.set('r_notdig_pro', r_notdig_pro);
            //let r_notdig_names = document.getElementById("record_rew_notdig_names").value;
            //formData.set('r_notdig_names', r_notdig_names);

            let type = document.getElementById("record_version").value;
            formData.set('type_rev', type);
            let record_date = document.getElementById("record_date").value;
            formData.set('record_date', record_date);

            let r_arc_pending = document.getElementById("record_arc_pending").checked;
            formData.set('r_arc_pending', r_arc_pending);
            let r_engc_pending = document.getElementById("record_eng_pending").checked;
            formData.set('r_engc_pending', r_engc_pending);
            let r_law_pending = document.getElementById("record_law_pending").checked;
            formData.set('r_law_pending', r_law_pending);

            let r_worker_law = document.getElementById("record_pdf_worker_name_law").value;
            formData.set('r_worker_law', r_worker_law);
            let r_check_law = document.getElementById("record_pdf_check_law").value;
            formData.set('r_check_law', r_check_law);
            let r_date_law = document.getElementById("record_pdf_date_law").value;
            formData.set('r_date_law', r_date_law);

            let r_worker_arc = document.getElementById("record_pdf_worker_name_arc").value;
            formData.set('r_worker_arc', r_worker_arc);
            let r_check_arc = document.getElementById("record_pdf_check_arc").value;
            formData.set('r_check_arc', r_check_arc);
            let r_date_arc = document.getElementById("record_pdf_date_arc").value;
            formData.set('r_date_arc', r_date_arc);

            let r_worker_eng = document.getElementById("record_pdf_worker_name_eng").value;
            formData.set('r_worker_eng', r_worker_eng);
            let r_date_eng = document.getElementById("record_pdf_date_eng").value;
            formData.set('r_date_eng', r_date_eng);

            let r_check_eng = document.getElementById("record_pdf_check_1_v_eng").value;
            formData.set('r_check_eng', r_check_eng);
            let r_check_2_eng = document.getElementById("record_pdf_check_2_v_eng").value;
            formData.set('r_check_2_eng', r_check_2_eng);

            let r_check_c_eng = document.getElementById("record_pdf_check_1_c_eng").value;
            formData.set('r_check_c_eng', r_check_c_eng);
            let r_check_2_c_eng = document.getElementById("record_pdf_check_2_c_eng").value;
            formData.set('r_check_2_c_eng', r_check_2_c_eng);

            let r_eng_diagnostic = document.getElementById("record_eng_diagnostic").checked;
            formData.set('r_eng_diagnostic', r_eng_diagnostic);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_REVIEW_SERVICE.pdfgen(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/recordrew/" + "ACTA OBSERVACIONES Y CORECCIONES " + currentItem.id_public + ".pdf");
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
        let CREATE_PDF_CHECK = () => {

            let _CHECKS = [];
            let _RESUME = [];

            // *************** LAW ***************//
            let checks = [];
            let _child = _GET_CHILD_REVIEW();
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




            let _resume = [];
            let values_1 = _GET_STEP_TYPE('s1', 'value', 'record_law_steps');
            let values_f53 = _GET_STEP_TYPE('f53', 'value', 'record_law_steps');
            let values_law = _GET_STEP_TYPE('flaw', 'value', 'record_law_steps');
            let _detail = _GET_REVIEW_LAW().detail;
            let _details = '';

            if (values_1[0]) _details = _details + values_1[0] + '\n';
            if (values_f53[0]) _details = _details + values_f53[0] + '\n';
            if (values_law[0]) _details = _details + values_law[0] + '\n';

            if (values_1[0]) _resume.push(`- Observaciones (Documentos aportados): \n${values_1[0]}`)
            if (values_f53[0]) _resume.push(`- Observaciones (Formulario Único Nacional): \n${values_f53[0]}`)
            if (values_law[0]) _resume.push(`- Observaciones (Publicidad): \n${values_law[0]}`)
            if (_detail) _resume.push(`- Observaciones finales: \n${_detail}`)

            if (_resume) _resume = _resume.join('\n\n')

            _RESUME.push(_resume);
            _CHECKS.push(checks)
            // *************** ARC ***************//

            if (_GLOBAL_ID === 'cb1') {
                const value33_detail = _GET_STEP_TYPE('s33', 'value', 'record_arc_steps');
                const value34_detail = _GET_STEP_TYPE('s34', 'value', 'record_arc_steps');
                const value35_detail = _GET_STEP_TYPE('s35', 'value', 'record_arc_steps');
                const value36_detail = _GET_STEP_TYPE('s36', 'value', 'record_arc_steps');
                _child = _GET_REVIEW_ARC();
                _resume = [];
                if (value33_detail[2]) _resume.push(`- Observaciones (Descripcion de la Actuacion Urbanistica): \n${value33_detail[2]}`)
                if (value34_detail[14]) _resume.push(`- Observaciones (Analisis de las determinantes urbanas del predio): \n${value34_detail[14]}`)
                if (value35_detail[1]) _resume.push(`- Observaciones (Parqueaderos): \n${value35_detail[1]}`)
                if (value36_detail[8]) _resume.push(`- Observaciones (Espacio Publico): \n${value36_detail[8]}`)
                if (_child.detail) _resume.push(`- Observaciones fianles: \n${_child.detail}`)
                if (_resume) _resume = _resume.join('\n\n')

                checks = _GET_STEP_TYPE('s33', 'check', 'record_arc_steps');
            } else {
                _child = _GET_REVIEW_ARC();
                _resume = [];
                if (_child.detail) _resume.push(`- Observaciones y conclusiones: \n${_child.detail}`)
                if (_resume) _resume = _resume.join('\n\n')

                checks = [];

                let partialChecks = _GET_STEP_TYPE('rar_1', 'check', 'record_arc_steps'); // Rótulo
                checks.push(partialChecks[1]); // 0
                checks.push(partialChecks[2]); // 1
                checks.push(partialChecks[3]); // 2
                checks.push(partialChecks[4]); // 3

                partialChecks = _GET_STEP_TYPE('rar_2', 'check', 'record_arc_steps'); // Características del predio
                checks.push(partialChecks[1]); // 4
                checks.push(partialChecks[2]); // 5
                checks.push(partialChecks[3]); // 6
                checks.push(partialChecks[4]); // 7
                checks.push(partialChecks[5]); // 8

                partialChecks = _GET_STEP_TYPE('rar_3', 'check', 'record_arc_steps'); // Cuadro de áreas
                checks.push(partialChecks[1]); // 9

                partialChecks = _GET_STEP_TYPE('rar_4', 'check', 'record_arc_steps'); // Plantas arquitectónicas por piso, sótano o semisótano cubiertas
                checks.push(partialChecks[1]); // 10
                checks.push(partialChecks[2]); // 11
                checks.push(partialChecks[3]); // 12
                checks.push(partialChecks[4]); // 13
                checks.push(partialChecks[5]); // 14
                checks.push(partialChecks[6]); // 15

                partialChecks = _GET_STEP_TYPE('rar_5', 'check', 'record_arc_steps'); // Cortes
                checks.push(partialChecks[1]); // 16
                checks.push(partialChecks[2]); // 17
                checks.push(partialChecks[3]); // 18
                checks.push(partialChecks[4]); // 19
                checks.push(partialChecks[5]); // 20

                partialChecks = _GET_STEP_TYPE('rar_6', 'check', 'record_arc_steps'); // Fachadas
                checks.push(partialChecks[1]); // 21
                checks.push(partialChecks[2]); // 22
                checks.push(partialChecks[3]); // 23

                partialChecks = _GET_STEP_TYPE('rar_7', 'check', 'record_arc_steps');
                checks.push(partialChecks[1]); // 24

                partialChecks = _GET_STEP_TYPE('rar_8', 'check', 'record_arc_steps');
                checks.push(partialChecks[1]); // 25

                partialChecks = _GET_STEP_TYPE('rar_5', 'check', 'record_arc_steps');
                checks.push(partialChecks[7]); // 26

                partialChecks = _GET_STEP_TYPE('rar_0', 'check', 'record_arc_steps');
                checks.push(partialChecks[1]); // 27
            }



            _RESUME.push(_resume);
            _CHECKS.push(checks)
            // *************** ENG ***************//
            _child = _GET_REVIEW_ENG();
            _resume = [];
            _resume.push(_child.detail_2)

            checks = _GET_STEP_TYPE('s44_check', 'check', 'record_eng_steps');

            if (_resume) _resume = _resume.join('\n\n')

            _RESUME.push(_resume);
            _CHECKS.push(checks)

            // *************** END ***************//
            let _city = document.getElementById('func_pdf_0_2').value;
            let _number = document.getElementById('func_pdf_0_1').value;
            var headers = {};
            headers.city = _city;
            headers.number = _number

            this.CREATE_CHECK(_RESUME, _CHECKS, currentItem, headers)
        }
        let createVRxCUB_relation = () => {
            let vr = document.getElementById("vr_selected").value;
            console.log(vr)
            let cub = document.getElementById("rev_cub").value;
            let formatData = new FormData();    

            formatData.set('vr', vr);
            formatData.set('cub', cub);
            formatData.set('fun', currentItem.id);
            formatData.set('process', 'OBSERVACIONES Y CORRECIONES');

            // let date = document.getElementById('record_review_2').value;
            // formatData.set('date', date);

            CubXVrDataService.createCubXVr(formatData)
                .then(response => {
                    if (response.data !== null) {

                    } else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACION",
                            text: `El consecutivo ${infoCud.serials.end} de este formulario ya existe, debe de elegir un consecutivo nuevo`,
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
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

        let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : {})
        let rules = currentItem ? currentItem.rules ? currentItem.rules.split(';') : [] : [];
        return (
            <div className="record_ph container">
                {currentItem != null ? <>
                    {loaded ? <>
                        {currentRecord
                            ? <>
                                <div>

                                    <FUN_G_REPORTS
                                        id={'record_review_title_1'}
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        nomenclature={'1.'}
                                        textAlign={'text-center'}
                                        noEng={conOA() || rules[1] == 1}
                                    />

                                    <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="record_review_title_2">
                                        <label className="app-p lead fw-normal text-uppercase">2. DECLARACIÓN DEL ACTA</label>
                                    </legend>

                                    <Collapsible className='bg-light border border-info text-center' openedClassName='bg-light border border-info text-center' trigger={<label className="fw-normal text-info">2.1 CARTA DE RATIFICACIÓN</label>}>
                                        <div className='text-start'>
                                            <RECORD_DOC_LETTER
                                                translation={translation}
                                                swaMsg={swaMsg}
                                                globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                requestUpdate={this.requestUpdate}
                                                edit />
                                        </div>
                                    </Collapsible>
                                    <Collapsible className='bg-light border border-info text-center' openedClassName='bg-light border border-info text-center' trigger={<label className="fw-normal text-info">2.2 CARTA DE AMPLIACIÓN DE TERMINOS</label>}>
                                        <div className='text-start'>
                                            <RECORD_DOC_LETTER_2
                                                translation={translation}
                                                swaMsg={swaMsg}
                                                globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                requestUpdate={this.requestUpdate}
                                                edit />
                                        </div>
                                    </Collapsible>

                                    <h3 className='text-center my-3'>2.3 CONTROL DEL ACTA DE OBSERVACIONES Y CORRECIONES</h3>

                                    {_COMPONENT_REVIEW()}
                                    {_COMPOANENT_PAST_REIEWS()}
                                    {_BTN_GEN_ID()}

                                    <div className="row mb-3 text-center">
                                        {currentItem.state > -5
                                            ? <>
                                                <div className="col">
                                                    <MDBBtn className="btn btn-danger my-3" onClick={() => review()}><i class="far fa-check-square"></i> REALIZAR REVISIÓN </MDBBtn>
                                                </div>
                                            </>
                                            : <label className="app-p lead fw-normal text-uppercase text-danger">ESTA SOLICITUD SE ENCUENTRA EN UN PROCESO DE DESISTIEMIENTO,
                                                NO SE PUEDE REALIZAR REVISIONES HASTA QUE EL PROCESO TERMINE TOTALMENTE</label>}
                                    </div>




                                    {/**
                                     * 
                                     *  <div className="row border">
                                        <div className="col-3 text-center">
                                            <label className="fw-bold mt-2">Número de revisiones : {currentItem.version}</label>
                                        </div>

                                        {currentRecord.check == 0
                                            ? <>
                                                <div className="col text-center">
                                                    <MDBBtn className="btn btn-secondary my-3" onClick={() => new_version()} ><i class="fas fa-plus-circle"></i> NUEVA REVISION</MDBBtn>
                                                </div>
                                                <div className="col">
                                                    <label>Genera una nueva version de esta solicitud, guardando la información anterior.</label>
                                                </div>
                                            </> : ""}

                                    </div>
                                     * 
                                     */}
                                    <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="record_review_title_3">
                                        <label className="app-p lead fw-normal text-uppercase">3. DESCARGAR ACTA</label>
                                    </legend>
                                    {PDF_GEN_ACTA()}


                                    <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="record_review_title_3">
                                        <label className="app-p lead fw-normal text-uppercase">4. PROCESO DE NOTIFICACIÓN</label>
                                    </legend>

                                    {_COMPONENT_NOTIFICATION_OBS()}


                                    <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="record_review_title_4">
                                        <label className="app-p lead fw-normal text-uppercase">5. PROSEGUIR A EXPEDICIÓN</label>
                                    </legend>
                                    {currentItem.state > 0
                                        ?
                                        currentItem.state < 50
                                            ?
                                            <>

                                                <form id="form_record_review_next" onSubmit={update_fun_0}>
                                                    <div className="row">
                                                        <div className="col text-end">
                                                            <label className="fw-bold mt-1">Fecha de evento:</label>
                                                        </div>
                                                        <div className="col">
                                                            <input type="date" class="form-control" id="record_review_next" max="2100-01-01"
                                                                defaultValue={_GET_CLOCK_STATE(51).date_start ?? ''} required />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col text-center">

                                                            <button className="btn btn-danger my-3"><i class="far fa-check-square"></i> PROSEGUIR A EXPEDICIÓN </button>
                                                        </div>
                                                    </div>
                                                </form>

                                            </>
                                            : <div className="row">
                                                <div className="col text-center">
                                                    <label className="app-p lead fw-normal text-uppercase text-success">ESTA SOLICITUD YA SE ENCUENTRA EN EXPEDICIÓN</label>
                                                </div>
                                            </div>
                                        :
                                        <label className="app-p lead fw-normal text-uppercase text-danger">ESTA SOLICITUD SE ENCUENTRA EN UN PROCESO DE DESISTIMIENTO,
                                            NO SE PUEDE PROSEGUIR HASTA QUE EL PROCESO TERMINE TOTALMENTE</label>}
                                </div>
                                {/* {NAV_FUNA()} */}
                            </> : <>

                                <fieldset className="p-3">
                                    <div className="text-center">
                                        <button className="btn btn-info btn-lg" onClick={() => new_record_review()}> GENERAR ACTA EN BLANCO</button>
                                    </div>
                                </fieldset>

                            </>}
                    </> : <div className="text-center">
                        <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3>
                    </div>}
                    <FUN_VERSION_NAV
                        translation={translation}
                        currentItem={currentRecord}
                        currentVersion={currentVersionR}
                        NAVIGATION_VERSION={this.navigation_version}
                        _RECORD
                    />
                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"record_review"}
                        NAVIGATION={this.props.NAVIGATION}
                        pqrsxfun={this.state.pqrsxfun}
                    />
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACION...</h3></div>
                </fieldset>}
            </div >
        );
    }
}

const NAV_FUNA = (_CHILD) => {
    return (
        <div className="btn-navpqrs">
            <div className="fung_nav">
                <MDBCard className="container-primary" border='dark'>
                    <MDBCardBody className="p-1">
                        <legend className="px-3 pt-2 text-uppercase bg-light text-center">
                            <h6>Menu de Navegacion</h6>
                        </legend>
                        <br />
                        <a href="#record_review_title_1">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>1. INFORMES</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#fung_report_jur">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>9.1 INFORME JURIDICO</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#fung_repor_arc">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>9.2 INFORME ARQUITECTONICO</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#fung_repor_eng">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>9.3 INFORME ESTRUCTURAL</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_review_title_2">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>2. DECLARACION DEL ACTA</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_review_title_3">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3. PROCESO DE NOTIFICACIÓNL</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_review_title_4">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>4. PROSEGUIR A EXPEDICION</h6>
                            </legend>
                        </a>
                    </MDBCardBody>
                </MDBCard>
            </div>
        </div>
    );
}

export default RECORD_REVIEW;