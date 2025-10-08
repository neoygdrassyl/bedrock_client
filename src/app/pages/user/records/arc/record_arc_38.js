import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import FUN_SERVICE from '../../../../services/fun.service'
import moment from 'moment';
import { cities, domains_number } from '../../../../components/jsons/vars';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { MDBBtn, MDBTypography } from 'mdb-react-ui-kit';
import { handleArchCheck } from '../../../../components/customClasses/pdfCheckHandler';
import { REVIEW_DOCS } from '../../../../components/jsons/arcReviewDocs';
import { GEM_CODE_LIST, VR_DOCUMENTS_OF_INTEREST } from '../../../../components/customClasses/typeParse';
import submitService from '../../../../services/submit.service';
import RECORD_DOCUMENT_VERSION from '../record_docVersion.component';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

class RECORD_ARC_38 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            new_element: false,
            new_location: false,
            VRDocs: [],
            load: false
        };
    }
    componentDidMount() {
        this.setVRList(this.props.currentItem ? this.props.currentItem.id_public : false);
    }
    setVRList(id_public) {
        if (!id_public) return;
        if (this.state.load) return;
        submitService.getIdRelated(this.props.currentItem.id_public).then(response => {
            let newList = [];
            let List = response.data;
            List.map((value, i) => {
                let subList = value.sub_lists;
                subList.map(valuej => {
                    let name = valuej.list_name ? valuej.list_name.split(";") : []
                    let category = valuej.list_category ? valuej.list_category.split(",") : []
                    let code = valuej.list_code ? valuej.list_code.split(",") : []
                    let page = valuej.list_pages ? valuej.list_pages.split(",") : []
                    let review = valuej.list_review ? valuej.list_review.split(",") : []

                    review.map((valuek, k) => {
                        if (valuek === 'SI') newList.push({
                            id_public: value.id_public,
                            date: value.date,
                            time: value.time,
                            name: name[k],
                            category: category[k],
                            page: page[k],
                            code: code[k],
                        })
                    })
                })
            })
            this.setState({ VRDocs: newList, load: true })
        })

    };
    async CREATE_CHECK(_detail, chekcs, _currentItem, _headers, _date) {
        let swaMsg = this.props.swaMsg;
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });

        const currentItem = _currentItem;
        const id_public = currentItem.id_public;

        let model = currentItem.model
        if (!model) return MySwal.fire({
            title: 'SOLICITUD SIN MODELO',
            text: 'Para poder generar el PDF de esta solicitud, se debe de definir el modelo.',
            icon: 'error',
            showConfirmButton: true,
            confirmButtonText: 'CONTINUAR',
        });

        var formUrl = process.env.REACT_APP_API_URL + "/pdf/recordarcextra";
        if (Number(model) === 2021) formUrl = process.env.REACT_APP_API_URL + "/pdf/recordarcextra";
        if (Number(model) >= 2022) formUrl = process.env.REACT_APP_API_URL + "/pdf/recordarcextra2022";

        var formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDoc = await PDFDocument.load(formPdfBytes);

        let page = pdfDoc.getPage(0)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        page.setFont(helveticaFont)
        // WIDTH = 612, HEIGHT = 936

        handleArchCheck(pdfDoc, page, chekcs, _detail, 0, 1, model)


        let _city = _headers.city;
        if (_date && _GLOBAL_ID === 'cb1') _city = _headers.city + ", radicado el " + _date;
        let _number = _headers.number;
        let pageCount = pdfDoc.getPageCount();

        for (let i = 0; i < pageCount; i++) {
            if (Number(model) === 2021 || i > 0) {
                page = pdfDoc.getPage(i);
                page.moveTo(215, 783)
                page.drawText(_number, { size: 14 })
                page.moveTo(100, 770)
                page.drawText(_city, { size: 9 })
                page.moveTo(420, 830)
                page.drawText(id_public, { size: 14 })
            }

            // THIS IS DONE BECAUSE THE SIZE OF THE PAGES ARE DIFERENT, ONE IS LETTER, OTHER IS LEGAL
            if (Number(model) >= 2022 && i === 0) {
                page = pdfDoc.getPage(i);
                page.moveTo(200, 783 - 150)
                page.drawText(_number, { size: 14 })
                page.moveTo(100, 770 - 150)
                page.drawText(_city, { size: 9 })
                page.moveTo(450, 830 - 165)
                page.drawText(id_public, { size: 14 })
            }
        }

        pdfDoc.setAuthor("CURADURIA URBANA 1 DE BUCARAMANGA");
        pdfDoc.setCreationDate(moment().toDate());
        pdfDoc.setCreator('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setKeywords(['formulario', 'unico', 'nacional', 'curaduria', 'planeacion', 'construccion', 'obra', 'proyecto', 'informe', 'acta', 'estructural', 'ingenieria']);
        pdfDoc.setLanguage('es-co');
        pdfDoc.setProducer('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setTitle('CHECKEO INFORME ARQUITECTÓNICO - ' + id_public)

        var pdfBytes = await pdfDoc.save();
        var fileDownload = require('js-file-download');
        fileDownload(pdfBytes, 'CHECKEO INFORME ARQUITECTÓNICO ' + id_public + '.pdf');
        MySwal.close();


    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { VRDocs } = this.state;


        // DATA GETERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
                item_6: "",
                item_7: "",
                item_8: "",
                item_9: "",
                item_101: "",
                item_102: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                    _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                    _CHILD_VARS.item_6 = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                    _CHILD_VARS.item_7 = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
                    _CHILD_VARS.item_8 = _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "";
                    _CHILD_VARS.item_9 = _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "";
                    _CHILD_VARS.item_101 = _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "";
                    _CHILD_VARS.item_102 = _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "";
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_38 = () => {
            var _CHILD = currentRecord.record_arc_38s;
            var _CURRENT_VERSION = currentVersionR - 1;
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
        let _GET_CHILD_EXTRA = () => {
            var _CHILD = currentRecord.record_arc_extras;
            var _CURRENT_VERSION = currentVersionR - 1;
            var _CHILD_VARS = {
                check: [],
                check_34u: [],
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.check = _CHILD[_CURRENT_VERSION].check ?? [];
                    _CHILD_VARS.check_34u = _CHILD[_CURRENT_VERSION].check_34u ?? [];
                }
            }
            return _CHILD_VARS;
        }
        let _GET_PROFESIONAL_NAME = () => {
            var _ROLEID = window.user.roleId;
            return window.user.name + " " + window.user.surname
            //THIS ROLES ARE PROGRAMER MASTER, CURATOR AND ARCHITEC
            if (_ROLEID === 1 || _ROLEID === 2 || _ROLEID === 6) {
                return window.user.name + " " + window.user.surname
            } else {
                return "NO ESTA AUTORIZADO A REALIZAR ESTA ACCION"
            }
        }
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_RECORD_REVIEW = () => {
            var _CHILD = currentItem.record_review;
            return _CHILD ?? {};
        }
        let _GET_FUN_R = () => {
            var _CHILD = currentItem.fun_rs;
            var _CURRENT_VERSION = currentVersion - 1;
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD = _CHILD[_CURRENT_VERSION]
                } else {
                    _CHILD = false
                }
            }
            return _CHILD;
        };
        //  DATA CONVERTERS
        let _FIND_IN_VRDOCS = (code) => {
            if (!code) return false;
            let FOUND_CODE = VRDocs.find(vr => code.includes(vr.code));
            return FOUND_CODE;
        }
        let BUILD_LIST = (concat) => {
            const _FUN_1 = _GET_CHILD_1();
            let list = GEM_CODE_LIST(_FUN_1, concat)
            return list
        }
        let _ALLOW_REVIEW = () => {
            const _docsScope = VR_DOCUMENTS_OF_INTEREST['arc'];
            let FUN_R = _GET_FUN_R();
            if (!FUN_R) return false;
            let CHECK = FUN_R.checked ? FUN_R.checked.split(',') : [];
            let REVIEWS = FUN_R.review ? FUN_R.review.split(',') : [];
            let R_CODES = FUN_R.code ? FUN_R.code.split(',') : [];
            let CODES = BUILD_LIST(true);
            let _ALLOW = CODES.every((c, i) => {
                let DOC = _docsScope.find(d => d.includes(c));
                if (!DOC) return true;
                let R = REVIEWS.find((r) => { return r.includes(c); })
                let r_i = R_CODES.findIndex(r => r.includes(c));
                //if (!R) return true;
                let eva = R ? R.split('&') : [];
                if (CHECK[r_i] === 2) return true;
                let vr = _FIND_IN_VRDOCS(R);
                let cond1 = eva[1] === 1 || eva[1] === 2;
                let cond2 = CHECK[r_i] === 1 || CHECK[r_i] === 2 || vr;
                return cond1 && cond2;
            })
            return _ALLOW;
        }
        let _GET_CLOCK_STATE = (_state, _version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state === null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state === _state && _CLOCK[i].version === _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_CLOCK_STATE_VERSION = (_state, version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state === null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state === _state && _CLOCK[i].version === version) return _CLOCK[i];
            }
            return false;
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_arc_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version === currentVersionR && _CHILD[i].id_public === _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type]
            if (!value) return [];
            value = value.split(';');
            return value
        }
        const value33_detail = _GET_STEP_TYPE('s33', 'value');
        const value34_detail = _GET_STEP_TYPE('s34', 'value');
        const value35_detail = _GET_STEP_TYPE('s35', 'value');
        const value36_detail = _GET_STEP_TYPE('s36', 'value');
        // COMPONENTS JSX
        let _COMPONENT_0 = () => {
            let _RESUME = `-Observaciones (Descripcion de la Actuacion Urbanistica): \n${value33_detail[2] ?? ''}\n\n-Observaciones (Analisis de las determinantes urbanas del predio): \n${value34_detail[10] ?? ''}\n\n-Observaciones (Parqueaderos): \n${value35_detail[1] ?? ''}\n\n-Observaciones (Espacio Publico): \n${value36_detail[8] ?? ''}`;

            return <>
                <div className="row py-3">
                    <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                        <div className='col'>
                            <label>Observaciones totales</label>
                        </div>
                    </div>
                    <textarea className="input-group" rows="8" style={{ backgroundColor: 'gainsboro' }}
                        readOnly value={_RESUME}></textarea>
                </div>
            </>
        }

        let _COMPONENT_0_CP1 = () => {
            let _RESUME = ``;
            let nomen = 1;

            REVIEW_DOCS.map(re => {
                let _value = _GET_STEP_TYPE(re.pid, 'value');
                let _check = _GET_STEP_TYPE(re.pid, 'check');
                let _check2 = _GET_STEP_TYPE(re.pid, 'check');
                let _context = _GET_STEP_TYPE(re.pid + '_c', 'value');

                _check2.shift();

                if (_check2.includes('0')) {
                    if (_value[0] != 'false') _RESUME += ` - ${_value[0]}\n`
                    _check.map((c, i) => {
                        {
                            if (c === 0 && _context[i] && i != 0) {
                                _RESUME += `${nomen}. ${_context[i]}\n`;
                                nomen++;
                            }
                        }
                    })
                    _RESUME += `\n`
                }
            })

            return <>
                <div className="row py-3">
                    <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                        <div className='col'>
                            <label>Observaciones totales</label>
                        </div>
                    </div>
                    <textarea className="input-group" rows="8" style={{ backgroundColor: 'gainsboro' }}
                        readOnly value={_RESUME}></textarea>
                </div>
            </>
        }
        let _COMPONENT_1 = () => {
            let _CHILD = _GET_CHILD_38();

            return <>
                <div className="row">
                    <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                        <div className='col'>
                            <label>Observaciones finales del Proyecto</label>
                        </div>
                    </div>
                    <textarea className="input-group" maxLength="8000" id="r_a_38_1" rows="4"
                        defaultValue={_CHILD.detail} onBlur={() => save_ra_38(false)}></textarea>
                    <label>(Máximo 8000 caracteres)</label>
                </div>
            </>
        }
        let _COMPONENT_2 = () => {
            let _CHILD = _GET_CHILD_38();
            let _RR = _GET_RECORD_REVIEW();

            let _PRIMAL_ASIGN = { date_asign: currentRecord.date_asign, worker_name: currentRecord.worker_name }
            let _ASIGNS = _GET_CLOCK_STATE_VERSION(13, 100).date_start ? _GET_CLOCK_STATE_VERSION(13, 100).date_start.split(';') : [];
            let _REVIEWS = _GET_CLOCK_STATE_VERSION(13, 200).resolver_context ? _GET_CLOCK_STATE_VERSION(13, 200).resolver_context.split(';') : [];
            let _REVIEWS_DATES = _GET_CLOCK_STATE_VERSION(13, 200).date_start ? _GET_CLOCK_STATE_VERSION(13, 200).date_start.split(';') : [];

            let CLOCKS_R;
            CLOCKS_R = _RR.check === 0 ? ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Acta Correcciones',] : ['Acta Observaciones',]

            const REW_STR = [<label className='text-danger fw-bold'>NO ES VIABLE</label>,
            <label className='text-success fw-bold'>SI ES VIABLE</label>,
            <label className='text-warning fw-bold'>NO APLICA</label>]

            const ALLOW_REVIEW = _ALLOW_REVIEW();

            return <>
                {!ALLOW_REVIEW ? <MDBTypography note noteColor='danger'>
                    <h3 className="text-justify text-dark">ADVERTENCIA</h3>
                    NO ES POSIBLE EVALUAR EL INFORME COMO "SI ES VIABLE" POR QUE HAY DOCUMENTOS QUE NO CUMPLEN, PARA PODER EVALUAR COMO "SI ES VIABLE" LOS DOCUMENTOS EN EL PUNTO 3.1 DEBEN ESTAR DECLARAROS COMO "CUMPLE" EN SU EVALUACIÓN
                </MDBTypography> : ''}
                <div className="row border bg-info py-1 text-white fw-bold">
                    <div className="col">
                        <label>REVISION</label>
                    </div>
                    <div className="col-3 text-center">
                        <label>PROFESIONAL</label>
                    </div>
                    <div className="col text-center">
                        <label>FECHA ASIGNACIÓN</label>
                    </div>
                    <div className="col text-center">
                        <label>RESULTADO</label>
                    </div>
                    <div className="col text-center">
                        <label>FECHA RESULTADO</label>
                    </div>
                    <div className="col-1">
                    </div>
                </div>
                {CLOCKS_R.map((value, i) => {
                    let iasing = i === 0 ? (_PRIMAL_ASIGN.date_asign ?? _ASIGNS[i]) : _ASIGNS[i];
                    let ireview = i === 0 ? (_CHILD.check ?? _REVIEWS[i]) : _REVIEWS[i];
                    let idate = i === 0 ? (_CHILD.date ?? _REVIEWS_DATES[i]) : _REVIEWS_DATES[i];
                    let iworker = _PRIMAL_ASIGN.worker_name || _CHILD.worker_name || '';

                    let isPrimal = i === 0;
                    let allowReview = iasing != null && iasing != undefined && iasing != '';

                    return <>
                        <div className="row border">
                            <div className="col">
                                <label className='fw-bold'>{value}</label>
                            </div>
                            <div className="col-3 text-center">
                                {this.state['REW' + i]
                                    ? <input type="text" class="form-control me-1" id={"r_a_38_2_" + i}
                                        defaultValue={iworker} disabled />
                                    : <label>{iworker}</label>
                                }
                            </div>
                            <div className="col text-center">
                                <label>{iasing}</label>
                            </div>
                            <div className="col text-center">
                                {this.state['REW' + i]
                                    ? <select className="form-select form-control form-control-sm" defaultValue={ireview} id={"r_a_38_3_" + i}>
                                        <option value="0" className="text-danger">NO ES VIABLE</option>
                                        {ALLOW_REVIEW ? <option value="1" className="text-success">SI ES VIABLE</option> : ''}
                                    </select>
                                    : <label>{REW_STR[ireview] ?? ''}</label>
                                }
                            </div>
                            <div className="col text-center">
                                {this.state['REW' + i]
                                    ? <input type="date" class="form-control form-control-sm" id={"r_a_38_4_" + i} max="2100-01-01"
                                        defaultValue={idate} />
                                    : <label>{idate ?? ''}</label>
                                }
                            </div>
                            <div className="col-1">
                                {allowReview ? <MDBBtn floating tag='a' size='sm' color='secondary' outline={this.state['REW' + i]}
                                    onClick={() => this.setState({ ['REW' + i]: !this.state['REW' + i] })}><i class="far fa-edit"></i></MDBBtn>
                                    : ''}
                                {this.state['REW' + i]
                                    ? <MDBBtn floating tag='a' size='sm' color='success' className='ms-1'
                                        onClick={() => review_r(isPrimal, i, iasing)}><i class="fas fa-check"></i></MDBBtn>
                                    : ""
                                }
                                {true ?
                                    <RECORD_DOCUMENT_VERSION
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        requestUpdate={this.props.requestUpdate}
                                        swaMsg={swaMsg}
                                        id6={"arc" + i} />
                                    : ''
                                }
                            </div>
                        </div>
                    </>
                })}
            </>
        }
        let _COMPOENT_PDF = () => {
            let _CHILD = _GET_CHILD_38();
            let _WORKER_NAME = currentRecord.worker_name;
            let _RR = _GET_RECORD_REVIEW();

            let _REVIEWS = _GET_CLOCK_STATE_VERSION(13, 200).resolver_context ? _GET_CLOCK_STATE_VERSION(13, 200).resolver_context.split(';') : [];
            let _REVIEWS_DATES = _GET_CLOCK_STATE_VERSION(13, 200).date_start ? _GET_CLOCK_STATE_VERSION(13, 200).date_start.split(';') : [];

            let CLOCKS_R;
            CLOCKS_R = _RR.check === 0 ? ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Acta Correcciones',] : ['Acta Observaciones',]

            let reviews = [
                { worker: '', check: 0, date: '', },
                { worker: '', check: 0, date: '', },
                { worker: '', check: 0, date: '', },
                { worker: '', check: 0, date: '', },
            ]

            for (let i = 0; i < CLOCKS_R.length; i++) {
                const clock = CLOCKS_R[i];
                if (i === 0) {
                    reviews[i].worker = _WORKER_NAME;
                    reviews[i].check = _CHILD.check ?? (_REVIEWS[i] ? _REVIEWS[i] : 0);
                    reviews[i].date = _CHILD.date ?? (_REVIEWS_DATES[i] ? _REVIEWS_DATES[i] : '');
                } else {
                    reviews[i].worker = _WORKER_NAME;
                    reviews[i].check = _REVIEWS[i] ? _REVIEWS[i] : 0;
                    reviews[i].date = _REVIEWS_DATES[i] ? _REVIEWS_DATES[i] : '';
                }
            }

            let _CHANGE_VALUES = (i) => {
                if (i === 3) document.getElementById('record_version').value = 2
                else document.getElementById('record_version').value = 1
                document.getElementById('record_pdf_worker_name').value = reviews[i].worker;
                document.getElementById('record_pdf_check').value = reviews[i].check === 1 ? 'VIABLE' : 'NO VIABLE';
                document.getElementById('record_pdf_date').value = reviews[i].date;
            }
            return <div className='row'>
                <div className="py-3">
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
                            <label>Cabecera</label>
                            <div class="input-group my-1">
                                <select class="form-select me-1" id={"record_header"}>
                                    <option value={1}>USAR CABECERA</option>
                                    <option value={0}>NO USAR CABECERA</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3">
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
                                <input className='form-control' id={"record_pdf_check"} disabled defaultValue={reviews[0].check === 1 ? 'VIABLE' : 'NO VIABLE'} />
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
                                <input type="checkbox" class="form-check-input" id="record_arc_pending" />
                                <label class="form-check-label" for="exampleCheck1">Pendiente</label>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3 text-center">
                        <div className="col">
                            <button className="btn btn-danger me-1" onClick={() => CREATE_PDF()}> <i class="far fa-file-pdf"></i> DESCARGAR INFORME</button>
                        </div>
                        <div className="col">
                            <button className="btn btn-danger" onClick={() => CREATE_PDF_CHECK()}> <i class="far fa-check-square"></i> DESCARGAR CHECKEO</button>
                        </div>
                    </div>
                </div>
            </div>
        }
        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();
        let review_r = (isPrimal, i, iasing) => {
            MySwal.fire({
                title: "REALIZAR REVISION",
                text: `¿Esta seguro de realizar la revision ${currentVersionR} de este Informe?`,
                icon: 'question',
                confirmButtonText: "REVISAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    save_review(isPrimal);
                    save_clock(i, iasing);
                }
            });
        }
        let review = () => {
            MySwal.fire({
                title: "REALIZAR REVISION",
                text: `¿Esta seguro de realizar la revision ${currentVersionR} de este Informe?`,
                icon: 'question',
                confirmButtonText: "REVISAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    save_review();
                    save_clock();
                }
            });
        }

        let manage_ra_38 = (useMySwal) => {
            let _CHILD = _GET_CHILD_38();
            formData.set('recordArcId', currentRecord.id);
            formData.set('version', currentVersionR);
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            if (_CHILD.id) {
                RECORD_ARCSERVICE.update_arc_38(_CHILD.id, formData)
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
                            this.props.requestUpdateRecord(currentItem.id)
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
                RECORD_ARCSERVICE.create_arc_38(formData)
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
                            this.props.requestUpdateRecord(currentItem.id)
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
        let save_ra_38 = (useMySwal) => {
            formData = new FormData();

            let detail = document.getElementById("r_a_38_1").value.replaceAll(';', ',');
            formData.set('detail', detail);

            manage_ra_38(useMySwal);
        }
        let save_review = (isPrimal) => {
            if (isPrimal) {
                let i = '_0'
                formData = new FormData();
                let worker_name = document.getElementById("r_a_38_2" + i).value;
                formData.set('worker_name', worker_name);
                let date = document.getElementById("r_a_38_4" + i).value;
                formData.set('date', date);
                let check = document.getElementById("r_a_38_3" + i).value;
                formData.set('check', check);
                formData.set('worker_id', window.user.id);
                manage_review(true);
            }
        }
        let manage_review = (useMySwal) => {
            let _CHILD = _GET_CHILD_38();
            formData.set('recordArcId', currentRecord.id);
            formData.set('version', currentVersionR);
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            if (_CHILD.id) {
                RECORD_ARCSERVICE.update_arc_38(_CHILD.id, formData)
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
                            this.props.requestUpdateRecord(currentItem.id);
                            this.setState({ ['REW0']: false })
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
                RECORD_ARCSERVICE.create_arc_38(formData)
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
                            this.props.requestUpdateRecord(currentItem.id);
                            this.setState({ ['REW0']: false })
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

        let manage_clock = (useMySwal, findOne, formDataclock, altVersion, closeIndex) => {
            var _CHILD = _GET_CLOCK_STATE(findOne, altVersion ?? currentVersionR);
            formDataclock.set('fun0Id', currentItem.id);
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }

            if (_CHILD.id) {
                FUN_SERVICE.update_clock(_CHILD.id, formDataclock)
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
                            this.props.requestUpdate(currentItem.id);
                            if (Number(closeIndex)) this.setState({ ['REW' + closeIndex]: false })
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
                FUN_SERVICE.create_clock(formDataclock)
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
                            this.props.requestUpdate(currentItem.id);
                            if (Number(closeIndex)) this.setState({ ['REW' + closeIndex]: false })
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
        let save_clock = (isIndex, iasing) => {
            let formDataclock = new FormData();

            let state = 13 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS
            let i = isIndex ? '_' + isIndex : '_0';
            let worker = document.getElementById("r_a_38_2" + i).value;
            let date = document.getElementById("r_a_38_4" + i).value;
            let review = document.getElementById("r_a_38_3" + i).value;
            let desc = review === 1 ? "SI ES VIABLE" : "NO ES VIABLE"

            formDataclock.set('date_start', date);
            formDataclock.set('name', "Revision ARQUITECTONICA, revision " + currentVersionR);
            formDataclock.set('desc', "Fue declarada como: " + desc + " por " + worker);
            formDataclock.set('state', state);
            formDataclock.set('version', currentVersionR);

            save_clock_asign(state, isIndex)
            manage_clock(false, state, formDataclock);
        }
        let save_clock_asign = (state, index) => {
            var _CLOCK_ASIGN = _GET_CLOCK_STATE(state, 100);
            var _CLOCK = _GET_CLOCK_STATE(state, 200);
            let j = index ? '_' + index : '_0';
            let review = document.getElementById("r_a_38_3" + j).value;
            let date = document.getElementById("r_a_38_4" + j).value;
            let asign_length = _CLOCK_ASIGN ? _CLOCK_ASIGN.date_start ? _CLOCK_ASIGN.date_start.split(';').length : 0 : 0;

            var date_start = _CLOCK ? _CLOCK.date_start ? _CLOCK.date_start.split(';') : [] : [];
            var resolver_context = _CLOCK ? _CLOCK.resolver_context ? _CLOCK.resolver_context.split(';') : [] : [];
            for (let i = 0; i < asign_length; i++) {
                date_start[i] = date_start[i] ?? '';
                resolver_context[i] = resolver_context[i] ?? '';
                if (index === i) date_start[i] = date;
                if (index === i) resolver_context[i] = review;
            }

            let formDataClock = new FormData();
            formDataClock.set('date_start', date_start.join(';'));
            formDataClock.set('resolver_context', resolver_context.join(';'));
            formDataClock.set('state', state);
            formDataClock.set('version', 200);

            manage_clock(false, state, formDataClock, 200, index);
        }

        // pdf gen
        let CREATE_PDF = () => {
            var formData = new FormData();
            formData.set('id', currentItem.id);
            formData.set('version', 1);
            let header = document.getElementById("record_header").value;
            formData.set('header', header);
            let type = document.getElementById("record_version").value;
            formData.set('type_rev', type);
            let r_worker = document.getElementById("record_pdf_worker_name").value;
            formData.set('r_worker', r_worker);
            let r_check = document.getElementById("record_pdf_check").value;
            formData.set('r_check', r_check);
            let r_date = document.getElementById("record_pdf_date").value;
            formData.set('r_date', r_date);
            let r_arc_pending = document.getElementById("record_arc_pending").checked;
            formData.set('r_arc_pending', r_arc_pending);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_ARCSERVICE.pdfgen(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/recordarc/" + "INFORME ARQUITECTONICO " + currentItem.id_public + ".pdf");
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
            let CLOCK_3 = _GET_CLOCK_STATE(3, 1)
            let _CHILD = _GET_CHILD_38();
            let _RESUME = [];
            let checks;
            if (_GLOBAL_ID === 'cb1') {
                const value33_detail = _GET_STEP_TYPE('s33', 'value', 'record_arc_steps');
                const value34_detail = _GET_STEP_TYPE('s34', 'value', 'record_arc_steps');
                const value35_detail = _GET_STEP_TYPE('s35', 'value', 'record_arc_steps');
                const value36_detail = _GET_STEP_TYPE('s36', 'value', 'record_arc_steps');

                if (value33_detail[2]) _RESUME.push(`- Observaciones (Descripcion de la Actuacion Urbanistica): \n${value33_detail[2]}`)
                if (value34_detail[14]) _RESUME.push(`- Observaciones (Analisis de las determinantes urbanas del predio): \n${value34_detail[14]}`)
                if (value35_detail[1]) _RESUME.push(`- Observaciones (Parqueaderos): \n${value35_detail[1]}`)
                if (value36_detail[8]) _RESUME.push(`- Observaciones (Espacio Publico): \n${value36_detail[8]}`)
                if (_CHILD.detail) _RESUME.push(`- Observaciones fianles: \n${_CHILD.detail}`)
                if (_RESUME) _RESUME = _RESUME.join('\n\n')

                checks = _GET_STEP_TYPE('s33', 'check', 'record_arc_steps');
            } else {
                if (_CHILD.detail) _RESUME.push(`- Observaciones y conclusiones: \n${_CHILD.detail}`)
                if (_RESUME) _RESUME = _RESUME.join('\n\n')

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

            let _city = document.getElementById('func_pdf_0_2').value;
            let _number = document.getElementById('func_pdf_0_1').value;

            var headers = {};
            headers.city = _city;
            headers.number = _number

            this.CREATE_CHECK(_RESUME, checks, currentItem, headers, CLOCK_3.date_start)
        }
        let _VERSIONS_SELECT = () => {
            var _COMPONENT = [];
            for (let i = 0; i < currentItem.version; i++) {
                _COMPONENT.push(<option value={i + 1}>Revision {i + 1}</option>)
            }
            return <select class="form-select" id="record_version">{_COMPONENT}</select>
        }
        return (
            <div className="record_arc_32 container">

                <h3 className="py-3" >3.8.1 Detalles y Observaciones</h3>
                {_GLOBAL_ID === 'cb1' ? _COMPONENT_0() : _COMPONENT_0_CP1()}

                {_COMPONENT_1()}

                <div className='row'>
                    {_COMPOENT_PDF()}
                </div>
                <h3 className="py-3" >3.8.2 Evaluacion de Viabilidad</h3>
                {_COMPONENT_2()}
            </div>
        );
    }
}

export default RECORD_ARC_38;