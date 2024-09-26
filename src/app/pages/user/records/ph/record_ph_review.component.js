import moment from 'moment';
import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import FUN_SERVICE from "../../../../services/fun.service"
import { MDBBtn } from 'mdb-react-ui-kit';
import FUNService from '../../../../services/fun.service';
import PQRS_Service from '../../../../services/pqrs_main.service';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { handleArchCheck } from '../../../../components/customClasses/pdfCheckHandler';
import Collapsible from 'react-collapsible';
import { cities, domains_number, infoCud } from '../../../../components/jsons/vars';
import { getJSONFull, _MANAGE_IDS } from '../../../../components/customClasses/typeParse';
import { REVIEW_DOCS } from '../../../../components/jsons/arcReviewDocs';
import SubmitService from '../../../../services/submit.service'

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

class RECORD_PH_REVIEW extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vrsRelated: []
        };  
    }
    componentDidMount() {
        this.retrieveItem();
    }
    retrieveItem() {
        SubmitService.getIdRelated(this.props.currentItem.id_public).then(response => {
            this.setState({ vrsRelated: response.data })
        })
    }
    async CREATE_CHECK(_detail, chekcs, _currentItem, _headers) {
        let swaMsg = this.props.swaMsg;
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        var formUrl = process.env.REACT_APP_API_URL + "/pdf/recordarcextra";
        var formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDoc = await PDFDocument.load(formPdfBytes);

        const currentItem = _currentItem;
        const id_public = currentItem.id_public;

        let page = pdfDoc.getPage(0)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        page.setFont(helveticaFont)
        // WIDTH = 612, HEIGHT = 936

        handleArchCheck(pdfDoc, page, chekcs, _detail, 0, 1)


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
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_53 = () => {
            var _CHILD = currentItem.fun_53s;
            var _CURRENT_VERSION = currentItem.version - 1;
            if (!_CHILD[_CURRENT_VERSION]) return {
                item_5311: '',
                item_5312: '',
                item_532: '',
                item_533: '',
            };
            var _CHILD_VARS = {
                item_530: _CHILD[_CURRENT_VERSION].id ?? false,
                item_5311: _CHILD[_CURRENT_VERSION].name ?? '',
                item_5312: _CHILD[_CURRENT_VERSION].surname ?? '',
                item_532: _CHILD[_CURRENT_VERSION].id_number ?? '',
                item_533: _CHILD[_CURRENT_VERSION].role ?? '',
                item_534: _CHILD[_CURRENT_VERSION].number ?? '',
                item_535: _CHILD[_CURRENT_VERSION].email ?? '',
                item_536: _CHILD[_CURRENT_VERSION].address ?? '',
                docs: _CHILD[_CURRENT_VERSION].docs ?? '',
            }
            return _CHILD_VARS;
        }
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _REGEX_IDNUMBER = (e) => {
            let regex = /^[0-9]+$/i;
            let test = regex.test(e.target.value);
            if (test) {
                var _value = Number(e.target.value).toLocaleString();
                _value = _value.replaceAll(',', '.');
                document.getElementById(e.target.id).value = _value;
            }
        }
        // DATA CONVERTERS
        let _GET_CLOCK_STATE = (_state, _version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_LAST_OA = () => {
            let new_id = "";
            FUNService.getLastOA()
                .then(response => {
                    if (response.data.length) {
                        new_id = response.data[0].id;
                        if (new_id) {
                            let _id = new_id.split('-')
                            let concecutive = _id[1];
                            concecutive = Number(concecutive) + 1
                            if (concecutive < 1000) concecutive = "0" + concecutive
                            if (concecutive < 100) concecutive = "0" + concecutive
                            if (concecutive < 10) concecutive = "0" + concecutive
                            new_id = `${_id[0]}-${concecutive}`
                            document.getElementById('f_02_ph').value = new_id;
                        } else document.getElementById('f_02_ph').value = "OA" + moment().format('YY') + "-0001";
                    } else document.getElementById('f_02_ph').value = "OA" + moment().format('YY') + "-0001";
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
                        text: "No ha sido posible cargar el consecutivo, inténtelo nuevamente.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_ph_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
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
        let _GET_STEP_TYPE_JSON = (_id_public) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return {};
            var value = STEP['json']
            if (!value) return {};
            value = getJSONFull(value);
            return value
        }
        function capitalize(s) {
            return s && s[0].toUpperCase() + s.slice(1);
        }
        // COMPONENT JSX
        let _NOTY_TYPE_COMPONENENT = () => {
            return <>
                <div className='row mx-5 my-3 text-start'>
                    <strong>TIPO DE NOTIFICACIÓN</strong>

                    <div className="col-4">
                        <select className='form-select' id="type_not">
                            <option value="0">NO USAR</option>
                            <option value="1">NOTIFICACIÓN PRESENCIAL</option>
                            <option value="2">NOTIFICACIÓN ELECTRÓNICA - SIN RECURSO</option>
                            <option value="3">NOTIFICACIÓN ELECTRÓNICA - CON RECURSO</option>
                        </select>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_WORKER = () => {
            return <>
                <div className="row">
                    <input type="hidden" id="record_ph_worker_arc_0" defaultValue={currentRecord.worker_arc_id ? currentRecord.worker_arc_id : window.user.id} />
                    <div className="col-6">
                        <label>Profesional</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="record_ph_worker_arc_1"
                                defaultValue={currentRecord.worker_arc_name ? currentRecord.worker_arc_name : window.user.name + " " + window.user.surname} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Fecha de la revisón</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" id="record_ph_worker_arc_2" required
                                defaultValue={currentRecord.date_arc_review ? currentRecord.date_arc_review : moment().format('YYYY-MM-DD')} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Aprobado</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <select class="form-control" id="recprd_ph_final_check" defaultValue={currentRecord.check} >
                                <option value="0" className="text-danger">NO</option>
                                <option value="1" className="text-success">SI</option>
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_DETAILS_3 = () => {
            let _CHILD = currentRecord.detail_3;

            return <div className="row py-2">
                <label className='fw-bold'>Observaciones</label>
                <div className="col-12">
                    <p>a.  El presente acto aprueba los planos de alineamiento y el cuadro de área de propiedad horizontal, de acuerdo con  lo exigido en la ley
                        675 de 2001.</p>
                    <p>b. El presente visto bueno se expide de acuerdo con los planos de propiedad horizontal presentando con la  solicitud, los cuales
                        corresponden a los planos arquitectónicos aprobados en: </p>
                    <input type="text" class="form-control" id="review_ph_detail_3" defaultValue={_CHILD} />
                </div>
            </div>
        }
        let _COMPONENT_DETAILS_2 = () => {
            let _CHILD = currentRecord.detail_2;

            return <div className="row py-2">
                <div className="col-12">
                    <label>Observaciones, separe cada punto con (solo) un salto de linea. (máximo 5000 caracteres)</label>
                    <textarea className="input-group" maxLength="5000" id="review_ph_detail_2" rows="4"
                        defaultValue={_CHILD}></textarea>
                </div>
            </div>
        }
        let _COMPONENT_DETAILS_4 = () => {
            const _VALUES = _GET_STEP_TYPE('ph_details', 'value');
            return <>
                <div className="row py-2">
                    <div className="col-3">
                        <label>Área del predio</label>
                        <input type="number" step={0.01} class="form-control" id="review_ph_detail_area" defaultValue={_VALUES[0]} />
                    </div>
                    <div className="col-12">
                        <label>Actos administrativos que anteceden y/o licencia(s) de gestión</label>
                        <textarea className="input-group" maxLength="2000" id="review_ph_detail_beofre" rows="4"
                            defaultValue={_VALUES[1]}></textarea>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_DETAILS_5 = () => {
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
                            if (c == 0 && _context[i] && i != 0) {
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
        let _COMPONENTN_NOT = () => {
            var _CHILD_53 = _GET_CHILD_53();
            let _JSON = getJSONFull(currentRecord.cub_json)
            return <>
                <div className="row mb-3">
                    <div className="col">
                        <label>Fecha del documento</label>
                        <input type="date" class="form-control mb-3" max='2100-01-01' id="phnot_date_doc" required
                            defaultValue={_JSON.date_doc || moment().format('YYYY-MM-DD')} />
                    </div>

                    <div className="col">
                        <label>Consecutivo de Entrada</label>
                        <input type="text" class="form-control mb-3" id="phnot_id_public" disabled
                            defaultValue={currentItem.id_public} />
                    </div>
                    <div></div>
                    <div className="col">
                        <label className="mt-1"> {infoCud.serials.end} Carta Citación</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="phnot_cub"
                                defaultValue={currentRecord.cub || ''} />
                            <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID('phnot_cub')}>GENERAR</button>
                        </div>
                    </div>
                    <div className="col" >
                        <label className="mt-1">{infoCud.serials.start}</label>
                        <div class="input-group ">
                            <select class="form-select" defaultValue={""}>
                                <option value=''>Seleccione una opción</option>
                                {this.state.vrsRelated.map((value, key) => (
                                    <option key={value.id} value={value.id_public}>
                                        {value.id_public}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label>Ciudad</label>
                        <input type="text" class="form-control mb-3" id="phnot_city"
                            defaultValue={_JSON.city || capitalize(infoCud.city.toLowerCase())} />
                    </div>
                    <div className="col">
                        <label>Consecutivo de Salida</label>
                        <input type="text" class="form-control mb-3" id="phnot_res_public" disabled
                            defaultValue={currentRecord.id_public} />
                    </div>
                    <div className="col">
                        <label>Fecha de Revision</label>
                        <input type="date" class="form-control mb-3" max='2100-01-01' id="phnot_date_res" disabled
                            defaultValue={_JSON.date || currentRecord.date_arc_review} />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label>Responsable</label>
                        <input type="text" class="form-control mb-3" id="phnot_name"
                            defaultValue={_JSON.name || _CHILD_53.item_5311 + " " + _CHILD_53.item_5312} />
                    </div>
                    <div className="col">
                        <label>Dirección</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="phnot_address"
                                defaultValue={_JSON.address || _CHILD_53.item_536} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Email</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="phnot_email"
                                defaultValue={_JSON.email || _CHILD_53.item_535} />
                        </div>
                    </div>
                </div>

            </>
        }
        let _COMPONENT_NOT_DETAILS = () => {
            const _VALUES = _GET_STEP_TYPE('phnd', 'value');
            return <>
                <div className="row">
                    <div className="col-4">
                        <label>Fecha entrega</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" id="ph_not_det_1"
                                defaultValue={_VALUES[0]} onBlur={() => save_not_data()} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Persona que recibe</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="ph_not_det_2"
                                defaultValue={_VALUES[1]} onBlur={() => save_not_data()} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Documento que recibe</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-id-card"></i>
                            </span>
                            <input type="text" class="form-control" id="ph_not_det_3"
                                defaultValue={_VALUES[2]} onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e); save_not_data(); }} />
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_CONFIG = () => {
            const _VALUE = _GET_STEP_TYPE('phnd', 'value');
            return <>
                <div className="row">
                    <div className="col-4">
                        <label>Entrada</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="f_01_ph"
                                defaultValue={currentItem.id_public} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Salida</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="f_02_ph"
                                defaultValue={currentRecord.id_public} />
                            <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_OA()}>GENERAR</button>
                        </div>
                    </div>
                </div>

                <div className="row mb-2">

                    {_NOTY_TYPE_COMPONENENT()}

                    <div className="col">
                        <label>Autoridad Competente</label>
                        <div class="input-group my-1">
                            <select class="form-select me-1" id={"exp_pdf_reso_1"}>
                                {domains_number}
                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <label>Ciudad</label>
                        <div class="input-group my-1">
                            <select class="form-select me-1" id={"exp_pdf_reso_2"}>
                                {cities}
                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <label>Vigencia</label>
                        <div class="input-group my-1">
                            <select class="form-select" id="exp_pdf_reso_record_version" defaultValue={_VALUE[3] || 0}>
                                <option value={0}>NO USAR EJECUTORIA Y FECHA</option>
                                <option value={1}>NO USAR FECHA</option>
                                <option>DOCE (12) MESES</option>
                                <option>VEINTE Y CUATRO (24) MESES</option>
                                <option>TREINTA Y SEIS (36) MESES</option>
                                <option>CUARENTA Y OCHO (48) MESES</option>
                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <label>Logo</label>
                        <div class="input-group my-1">
                            <select class="form-select me-1" id={"exp_pdf_reso_logo"}>
                                <option value={'no'}>SIN LOGO</option>
                                <option value={'left'}>IZQUIERDA</option>
                                <option value={'left2'}>IZQUIERDA ENTRESALTO</option>
                                <option value={'right'}>DERECHA</option>
                                <option value={'right2'}>DERECHA ENTRESALTO</option>

                            </select>
                        </div>
                    </div>
                </div>
                <div className="row mb-2">

                    {/**
                     *  <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_rew_simple" />
                            <label class="form-check-label">Usar nombre revisor</label>
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_rew_signs" />
                            <label class="form-check-label">Usar firma profesionales</label>
                        </div>
                    </div>
                     * 
                     */}

                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_rew_pagesi" />
                            <label class="form-check-label">Usar pie de pagina</label>
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="record_rew_pagesn" defaultChecked="true" />
                            <label class="form-check-label">Usar paginación</label>
                        </div>
                    </div>
                </div>

                <div className="row mb-2 text-center">

                    <div className="col ">
                        <div class="input-group-sm my-1">
                            <label class="form-check-label">Margen Superior (cm)</label>
                            <input type="number" min={0} step={0.01} class="form-control-sm" id="record_maring_top" defaultValue={2.5} />
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="input-group-sm my-1">
                            <label class="form-check-label">Margen Inferior (cm)</label>
                            <input type="number" min={0} step={0.01} class="form-control-sm" id="record_maring_bot" defaultValue={2.5} />
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="input-group-sm my-1">
                            <label class="form-check-label">Margen Izquierdo (cm)</label>
                            <input type="number" min={0} step={0.01} class="form-control-sm" id="record_maring_left" defaultValue={1.7} />
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div class="input-group-sm my-1">
                            <label class="form-check-label">Margen Derecho (cm)</label>
                            <input type="number" min={0} step={0.01} class="form-control-sm" id="record_maring_right" defaultValue={1.7} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3 text-center">
                    <div className="col">
                        <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                    </div>
                    <div className="col">
                        <MDBBtn className="btn btn-danger my-3" onClick={() => pdf_gen()} ><i class="far fa-file-pdf"></i> GENERAR PDF </MDBBtn>
                    </div>
                    <div className="col">
                        <MDBBtn className="btn btn-danger my-3" onClick={() => CREATE_PDF_CHECK()} ><i class="far fa-file-pdf"></i> GENERAR CHECKEO </MDBBtn>
                    </div>
                </div>
            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();
        var formDataClock = new FormData();

        let manage_item = (e) => {
            if (e) e.preventDefault();
            formData = new FormData();

            let detail_2 = document.getElementById("review_ph_detail_2").value;
            formData.set('detail_2', detail_2);
            let detail_3 = document.getElementById("review_ph_detail_3").value;
            formData.set('detail_3', detail_3);

            let worker_arc_id = document.getElementById("record_ph_worker_arc_0").value;
            formData.set('worker_arc_id', worker_arc_id);
            let worker_arc_name = document.getElementById("record_ph_worker_arc_1").value;
            formData.set('worker_arc_name', worker_arc_name);
            let date_arc_review = document.getElementById("record_ph_worker_arc_2").value;
            formData.set('date_arc_review', date_arc_review);

            let check = document.getElementById("recprd_ph_final_check").value;
            formData.set('check', check);

            let id_public = document.getElementById("f_02_ph").value;
            formData.set('id_public', id_public);

            formData.set('new_id', id_public);
            formData.set('prev_id', currentRecord.id_public);

            save_not_data();

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.update(currentRecord.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });

                        this.props.requestUpdateRecord(currentItem.id);
                        this.props.requestUpdate(currentItem.id);
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACIÓN",
                            text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
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
        }

        let review = () => {
            save_clock();
            manage_item();
        }
        let save_clock = () => {
            formDataClock = new FormData();

            let state = 14 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS

            let worker = document.getElementById("record_ph_worker_arc_1").value;
            let date = document.getElementById("record_ph_worker_arc_2").value;
            let review = document.getElementById("recprd_ph_final_check").value;
            let desc = review == 1 ? "APROBADO" : "NO APROBADO"

            formDataClock.set('date_start', date);
            formDataClock.set('name', "Revision P.H., revision " + currentVersionR);
            formDataClock.set('desc', "Fue declarada como: " + desc + " por " + worker);
            formDataClock.set('state', state);
            formDataClock.set('version', currentVersion);

            manage_clock(false, state);
        }
        let manage_clock = (useMySwal, findOne) => {
            var _CHILD = _GET_CLOCK_STATE(findOne, currentItem);

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
                            this.props.requestUpdate(currentItem.id);
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
                            this.props.requestUpdate(currentItem.id);
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
        let save_archive = () => {
            formDataClock = new FormData();

            let state = 101 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS

            let worker = window.user.name + " " + window.user.surname;

            let date_arc_review = document.getElementById("record_ph_worker_arc_2").value;
            formData.set('date_arc_review', date_arc_review);
            let date = date_arc_review ?? moment().format('YYYY-MM-DD');

            formDataClock.set('date_start', date);
            formDataClock.set('name', "ARCHIVACIÓN");
            formDataClock.set('desc', "Fue enviado al archivo por: " + worker);
            formDataClock.set('state', state);
            formDataClock.set('version', currentVersion);

            manage_clock(false, state);
        }
        let save_close = () => {
            formDataClock = new FormData();

            let state = 100 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS

            let worker = window.user.name + " " + window.user.surname;
            let date = moment().format('YYYY-MM-DD');

            formDataClock.set('date_start', date);
            formDataClock.set('name', "CERRADA");
            formDataClock.set('desc', "Fue cerrada por: " + worker);
            formDataClock.set('state', state);
            formDataClock.set('version', currentVersion);

            manage_clock(false, state);
        }
        let pdf_gen = () => {
            formData = new FormData();
            let altId = document.getElementById("f_01_ph").value;
            formData.set('id', currentItem.id);
            formData.set('altId', altId);

            formData.set('r_pagesi', document.getElementById("record_rew_pagesi").checked);
            formData.set('r_pagesn', document.getElementById("record_rew_pagesn").checked);
            formData.set('r_vig', document.getElementById('exp_pdf_reso_record_version').value);
            formData.set('logo', document.getElementById('exp_pdf_reso_logo').value);

            formData.set('type_not', document.getElementById("type_not").value);

            formData.set('m_top', document.getElementById("record_maring_top").value ? document.getElementById("record_maring_top").value : 2.5);
            formData.set('m_bot', document.getElementById("record_maring_bot").value ? document.getElementById("record_maring_bot").value : 2.5);
            formData.set('m_left', document.getElementById('record_maring_left').value ? document.getElementById("record_maring_left").value : 1.7);
            formData.set('m_right', document.getElementById('record_maring_right').value ? document.getElementById("record_maring_right").value : 1.7);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.gen_doc_ph(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/recordph/" + "Informe Revision Propiedad Horizontal " + (currentRecord.id_public ?? currentItem.id_public) + ".pdf");
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

        let close = () => {
            MySwal.fire({
                title: "CERRAR SOLICITUD",
                text: "¿Esta seguro de cerra esta Solicitud? \nSI SE PODRÁ realizar cambios mas adelantes.",
                icon: 'question',
                confirmButtonText: "CERRAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    formData = new FormData();

                    formDataClock.set('state', 100);

                    MySwal.fire({
                        title: swaMsg.title_wait,
                        text: swaMsg.text_wait,
                        icon: 'info',
                        showConfirmButton: false,
                    });
                    FUN_SERVICE.update(currentItem.id, formDataClock)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                save_close();
                                this.props.requestRefresh(currentItem.id);
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

        let archive = () => {
            MySwal.fire({
                title: "ARCHIVAR SOLICITUD",
                text: "¿Esta seguro de archivar esta Solicitud? \nNO SE PODRÁ modificar de ninguna forma.",
                icon: 'question',
                confirmButtonText: "ARCHIVAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    formData = new FormData();

                    formDataClock.set('state', 101);

                    MySwal.fire({
                        title: swaMsg.title_wait,
                        text: swaMsg.text_wait,
                        icon: 'info',
                        showConfirmButton: false,
                    });
                    FUN_SERVICE.update(currentItem.id, formDataClock)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                save_archive();
                                this.props.requestRefresh(currentItem.id);
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
            });
        }

        let CREATE_PDF_CHECK = () => {
            let _CHILD = currentRecord;
            let _RESUME = [];
            let checks;
            const details = currentRecord.detail_2;

            if (details) _RESUME.push(`- Observaciones: \n${details}`)
            if (_RESUME) _RESUME = _RESUME.join('\n\n')


            if (_GLOBAL_ID === 'cb1') {
                checks = _GET_STEP_TYPE('phcl', 'check');
            } else {
                if (_CHILD.detail) _RESUME.push(`- Observaciones y conclusiones: \n${_CHILD.detail}`)
                if (_RESUME) _RESUME = _RESUME.join('\n\n')

                checks = [];

                let partialChecks = _GET_STEP_TYPE('rar_1', 'check', 'record_arc_steps'); // Rótulo
                checks.push(partialChecks[1]); // 0
                checks.push(partialChecks[2]); // 1
                checks.push(partialChecks[3]); // 2
                checks.push(partialChecks[4]); // 3

                let partialValue = _GET_STEP_TYPE('rar_1', 'value');
                let partialNotes = _GET_STEP_TYPE('rar_1_c', 'value')
                let has_note = partialNotes.some((n, i) => i > 0 && n)
                if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                if (has_note) _RESUME += '\n'


                partialChecks = _GET_STEP_TYPE('rar_2', 'check', 'record_arc_steps'); // Características del predio
                checks.push(partialChecks[1]); // 4
                checks.push(partialChecks[2]); // 5
                checks.push(partialChecks[3]); // 6
                checks.push(partialChecks[4]); // 7
                checks.push(partialChecks[5]); // 8

                partialValue = _GET_STEP_TYPE('rar_2', 'value');
                partialNotes = _GET_STEP_TYPE('rar_2_c', 'value')
                has_note = partialNotes.some((n, i) => i > 0 && n)
                if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                if (has_note) _RESUME += '\n'

                partialChecks = _GET_STEP_TYPE('rar_3', 'check', 'record_arc_steps'); // Cuadro de áreas
                checks.push(partialChecks[1]); // 9

                partialValue = _GET_STEP_TYPE('rar_3', 'value');
                partialNotes = _GET_STEP_TYPE('rar_3_c', 'value')
                has_note = partialNotes.some((n, i) => i > 0 && n)
                if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                if (has_note) _RESUME += '\n'

                partialChecks = _GET_STEP_TYPE('rar_4', 'check', 'record_arc_steps'); // Plantas arquitectónicas por piso, sótano o semisótano cubiertas
                checks.push(partialChecks[1]); // 10
                checks.push(partialChecks[2]); // 11
                checks.push(partialChecks[3]); // 12
                checks.push(partialChecks[4]); // 13
                checks.push(partialChecks[5]); // 14
                checks.push(partialChecks[6]); // 15

                partialValue = _GET_STEP_TYPE('rar_4', 'value');
                partialNotes = _GET_STEP_TYPE('rar_4_c', 'value')
                has_note = partialNotes.some((n, i) => i > 0 && n)
                if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                if (has_note) _RESUME += '\n'


                partialChecks = _GET_STEP_TYPE('rar_5', 'check', 'record_arc_steps'); // Cortes
                checks.push(partialChecks[1]); // 16
                checks.push(partialChecks[2]); // 17
                checks.push(partialChecks[3]); // 18
                checks.push(partialChecks[4]); // 19
                checks.push(partialChecks[5]); // 20

                partialValue = _GET_STEP_TYPE('rar_5', 'value');
                partialNotes = _GET_STEP_TYPE('rar_5_c', 'value')
                has_note = partialNotes.some((n, i) => i > 0 && n)
                if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                if (has_note) _RESUME += '\n'

                partialChecks = _GET_STEP_TYPE('rar_6', 'check', 'record_arc_steps'); // Fachadas
                checks.push(partialChecks[1]); // 21
                checks.push(partialChecks[2]); // 22
                checks.push(partialChecks[3]); // 23

                partialValue = _GET_STEP_TYPE('rar_6', 'value');
                partialNotes = _GET_STEP_TYPE('rar_6_c', 'value')
                has_note = partialNotes.some((n, i) => i > 0 && n)
                if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                if (has_note) _RESUME += '\n'


                partialChecks = _GET_STEP_TYPE('rar_7', 'check', 'record_arc_steps');
                checks.push(partialChecks[1]); // 24

                partialValue = _GET_STEP_TYPE('rar_7', 'value');
                partialNotes = _GET_STEP_TYPE('rar_7_c', 'value')
                has_note = partialNotes.some((n, i) => i > 0 && n)
                if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                if (has_note) _RESUME += '\n'



                partialChecks = _GET_STEP_TYPE('rar_8', 'check', 'record_arc_steps');
                checks.push(partialChecks[1]); // 25

                partialValue = _GET_STEP_TYPE('rar_8', 'value');
                partialNotes = _GET_STEP_TYPE('rar_8_c', 'value')
                has_note = partialNotes.some((n, i) => i > 0 && n)
                if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                if (has_note) _RESUME += '\n'



                partialChecks = _GET_STEP_TYPE('rar_5', 'check', 'record_arc_steps');
                checks.push(partialChecks[7]); // 26

                partialValue = _GET_STEP_TYPE('rar_5', 'value');
                partialNotes = _GET_STEP_TYPE('rar_5_c', 'value')
                has_note = partialNotes.some((n, i) => i > 0 && n)
                if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                if (has_note) _RESUME += '\n'



                partialChecks = _GET_STEP_TYPE('rar_0', 'check', 'record_arc_steps');
                checks.push(partialChecks[1]); // 27

                partialValue = _GET_STEP_TYPE('rar_0', 'value');
                partialNotes = _GET_STEP_TYPE('rar_0_c', 'value')
                has_note = partialNotes.some((n, i) => i > 0 && n)
                if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                if (has_note) _RESUME += '\n'

                partialChecks = _GET_STEP_TYPE('rar_9', 'check');
                if (partialChecks) {
                    partialValue = _GET_STEP_TYPE('rar_9', 'value');
                    partialNotes = _GET_STEP_TYPE('rar_9_c', 'value')
                    checks.push(partialChecks[1]);
                    has_note = partialNotes.some((n, i) => i > 0 && n)
                    if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                    partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                    if (has_note) _RESUME += '\n'
                }

                partialChecks = _GET_STEP_TYPE('rar_10', 'check');
                if (partialChecks) {
                    partialValue = _GET_STEP_TYPE('rar_10', 'value');
                    partialNotes = _GET_STEP_TYPE('rar_10_c', 'value')
                    checks.push(partialChecks[1]);
                    has_note = partialNotes.some((n, i) => i > 0 && n)
                    if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                    partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                    if (has_note) _RESUME += '\n'
                }

                partialChecks = _GET_STEP_TYPE('rar_11', 'check');
                if (partialChecks) {
                    partialValue = _GET_STEP_TYPE('rar_11', 'value');
                    partialNotes = _GET_STEP_TYPE('rar_11_c', 'value')
                    checks.push(partialChecks[1]);
                    has_note = partialNotes.some((n, i) => i > 0 && n)
                    if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                    partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                    if (has_note) _RESUME += '\n'
                }

                partialChecks = _GET_STEP_TYPE('rar_12', 'check');
                if (partialChecks) {
                    partialValue = _GET_STEP_TYPE('rar_12', 'value');
                    partialNotes = _GET_STEP_TYPE('rar_12_c', 'value')
                    checks.push(partialChecks[1]);
                    has_note = partialNotes.some((n, i) => i > 0 && n)
                    if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                    partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                    if (has_note) _RESUME += '\n'
                }

                partialChecks = _GET_STEP_TYPE('rar_13', 'check');
                if (partialChecks) {
                    partialValue = _GET_STEP_TYPE('rar_13', 'value');
                    partialNotes = _GET_STEP_TYPE('rar_13_c', 'value')
                    checks.push(partialChecks[1]);
                    has_note = partialNotes.some((n, i) => i > 0 && n)
                    if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                    partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                    if (has_note) _RESUME += '\n'
                }

                partialChecks = _GET_STEP_TYPE('rar_14', 'check');
                if (partialChecks) {
                    partialValue = _GET_STEP_TYPE('rar_14', 'value');
                    partialNotes = _GET_STEP_TYPE('rar_14_c', 'value')
                    checks.push(partialChecks[1]);
                    has_note = partialNotes.some((n, i) => i > 0 && n)
                    if (has_note && partialValue[0] != 'false') _RESUME += `${partialValue[0]}:\n`
                    partialNotes.map((n, i) => { if (i > 0 && n) _RESUME += `- ${partialValue[i]} : ${partialNotes[i]} \n` })
                    if (has_note) _RESUME += '\n'
                }

            }

            let _city = document.getElementById('func_pdf_0_2').value;
            let _number = document.getElementById('func_pdf_0_1').value;

            var headers = {};
            headers.city = _city;
            headers.number = _number

            this.CREATE_CHECK(_RESUME, checks, currentItem, headers)
        }

        let save_not_data = () => {
            let formData = new FormData();
            let date = document.getElementById('ph_not_det_1').value;
            let name = document.getElementById('ph_not_det_2').value;
            let id = document.getElementById('ph_not_det_3').value;

            let eje = document.getElementById('exp_pdf_reso_record_version').value;

            let value = [];
            value.push(date);
            value.push(name);
            value.push(id);
            value.push(eje);

            formData.set('value', value.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordPhId', currentRecord.id);
            formData.set('id_public', 'phnd');

            save_step('phnd', false, formData);


            if (document.getElementById('review_ph_detail_area')) {
                formData = new FormData();
                let area = document.getElementById('review_ph_detail_area').value;
                let history = document.getElementById('review_ph_detail_beofre').value;
                value = [];
                value.push(area);
                value.push(history);

                formData.set('value', value.join(';'));

                formData.set('version', currentVersionR);
                formData.set('recordPhId', currentRecord.id);
                formData.set('id_public', 'ph_details');

                save_step('ph_details', false, formData);
            }

        }

        let save_step = (_id_public, useSwal, formData, start, end) => {
            var STEP = LOAD_STEP(_id_public);

            if (useSwal) MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (STEP.id) {
                RECORD_PH_SERVICE.update_step(STEP.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
            else {
                RECORD_PH_SERVICE.create_step(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
        }

        let save_cub = (e) => {
            e.preventDefault();
            formData = new FormData();
            let cub = document.getElementById("phnot_cub").value;
            formData.set('new_cub', cub);
            formData.set('prev_cub', currentRecord.cub);

            let cub_json = getJSONFull(currentRecord.cub_json);

            cub_json.date_doc = document.getElementById("phnot_date_doc").value;
            cub_json.city = document.getElementById("phnot_city").value;
            cub_json.name = document.getElementById("phnot_name").value;
            cub_json.address = document.getElementById("phnot_address").value;
            cub_json.email = document.getElementById("phnot_email").value;

            formData.set('cub_json', JSON.stringify(cub_json));


            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.update(currentRecord.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });

                        this.props.requestUpdateRecord(currentItem.id);
                        this.props.requestUpdate(currentItem.id);
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACIÓN",
                            text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
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
        }
        let pdfnot_gen = () => {
            formData = new FormData();
            let date_doc = document.getElementById("phnot_date_doc").value;
            formData.set('date_doc', date_doc);
            let cub = document.getElementById("phnot_cub").value;
            formData.set('cub', cub);
            let city = document.getElementById("phnot_city").value;
            formData.set('city', city);
            let res_id = document.getElementById("phnot_res_public").value;
            formData.set('ph_id', res_id);
            let res_date = document.getElementById("phnot_date_res").value;
            formData.set('ph_date', res_date);
            let name = document.getElementById("phnot_name").value;
            formData.set('name', name);
            let address = document.getElementById("phnot_address").value;
            formData.set('address', address);
            let email = document.getElementById("phnot_email").value;
            formData.set('email', email);

            formData.set('id_public', currentItem.id_public);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.gen_doc_not(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/recordphnot/" + "CITACIÓN PARA NOTIFICACIÓN " + (currentRecord.id_public ?? currentItem.id_public) + ".pdf");
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
            <div className="record_ph_gen container">
                <form id="form_manage_ph_review" onSubmit={manage_item}>
                    <div className="row">
                        <label className="app-p lead fw-bold my-2">3.1 DATOS GENERALES</label>
                        {_GLOBAL_ID == 'cp1' ? _COMPONENT_DETAILS_4() : ''}
                        {_COMPONENT_DETAILS_3()}
                        {_GLOBAL_ID == 'cp1' ? _COMPONENT_DETAILS_5() : ''}
                        {_COMPONENT_DETAILS_2()}


                        <label className="app-p lead fw-bold my-2">3.2 CONFIGURACION RESOLUCIÓN</label>
                        {_COMPONENT_CONFIG()}

                        <label className="app-p lead fw-bold my-2">3.3 PROFESIONAL QUE REALIZA LA REVISION ARQUITECTÓNICA</label>
                        {_COMPONENT_WORKER()}

                        <div className="row mb-3 text-center">
                            {currentItem.state > -5
                                ? <>
                                    <div className="col">
                                        <MDBBtn className="btn btn-danger my-3" onClick={() => review()}><i class="far fa-check-square"></i> REALIZAR REVISIÓN </MDBBtn>
                                    </div>

                                    {!_GET_CLOCK_STATE(100, currentVersion)
                                        ? <div className="col">
                                            <MDBBtn className="btn btn-primary my-3" onClick={() => close()} ><i class="far fa-file-archive"></i> CERRAR</MDBBtn>
                                        </div>
                                        : ""}
                                    {_GET_CLOCK_STATE(100, currentVersion)
                                        ? <div className="col">
                                            <MDBBtn className="btn btn-primary my-3" onClick={() => archive()} ><i class="far fa-file-archive"></i> ARCHIVAR</MDBBtn>
                                        </div>
                                        : ""}
                                </>
                                : <label className="app-p lead fw-normal text-uppercase text-danger">ESTA SOLICITUD SE ENCUENTRA EN UN PROCESO DE DESISTIMIENTO,
                                    NO SE PUEDE REALIZAR REVISIONES HASTA QUE EL PROCESO TERMINE TOTALMENTE</label>}
                        </div>



                    </div>
                </form>
                <label className="app-p lead fw-bold my-2">3.4 CONTROL DE ENTREGA</label>

                <Collapsible className='bg-light border border-info text-center my-1' openedClassName='my-1 bg-light border border-info text-center' trigger={<><label className="fw-normal text-info text-center">CARTA - CITACIÓN PARA NOTIFICACIÓN</label></>}>
                    <form id="form_ph_not" onSubmit={save_cub}>
                        {_COMPONENTN_NOT()}
                        <div className="row text-center">
                            <div className="col">
                                <button className="btn btn-success my-3"><i class="far fa-share-square"></i> GUARDAR CAMBIOS </button>
                            </div>
                            <div className="col">
                                <MDBBtn className="btn btn-danger my-3" onClick={() => pdfnot_gen()}><i class="far fa-file-pdf"></i> GENERAR PDF </MDBBtn>
                            </div>
                        </div>
                    </form>
                </Collapsible>

                {_COMPONENT_NOT_DETAILS()}
            </div >
        );
    }
}

export default RECORD_PH_REVIEW;