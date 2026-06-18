import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import FUN_SERVICE from "../../../../services/fun.service"

import FUNService from '../../../../services/fun.service';
import PQRS_Service from '../../../../services/pqrs_main.service';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { handleArchCheck } from '../../../../components/customClasses/pdfCheckHandler';
import Collapsible from '../../../../components/Collapsible';
import { cities, domains_number, infoCud } from '../../../../components/jsons/vars';
import { getJSONFull, _MANAGE_IDS } from '../../../../components/customClasses/typeParse';
import { REVIEW_DOCS } from '../../../../components/jsons/arcReviewDocs';
import SubmitService from '../../../../services/submit.service'
import CubXVrDataService from '../../../../services/cubXvr.service'
import { Icon } from '@/components/icon';
import { swalClose, swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import usePHSave from './hooks/usePHSave';
import { savePHStep } from './utils/phSaveStep';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

function RECORD_PH_REVIEW({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord, requestUpdate, requestRefresh, closeModal }) {
    const [vrsRelated, setVrsRelated] = useState([]);
    const [cubSelected, setCubSelected] = useState(null);
    const [idCUBxVr, setIdCUBxVr] = useState(null);
    const [cubSelected_ph, setCubSelected_ph] = useState(null);
    const [idCUBxVr_ph, setIdCUBxVr_ph] = useState(null);
    const { isSaving, execute } = usePHSave(swaMsg);

    useEffect(() => {
        retrieveItem();
    }, []);

    async function retrieveItem() {
        try {
            await SubmitService.getIdRelated(currentItem.id_public).then(response => {
                setVrsRelated(response.data)
            })
            const responseCubXVr = await CubXVrDataService.getByFUN(currentItem.id_public);
            const data = responseCubXVr.data.find(item => item.process === 'DOCUMENTOS PH / CITACIÓN PARA NOTIFICACIÓN');
            setCubSelected(data?.cub ?? null);
            setIdCUBxVr(data?.id ?? null);
            const data_ph = responseCubXVr.data.find(item => item.process === 'PROPIEDAD HORIZONTAL');
            setCubSelected_ph(data_ph?.cub ?? null);
            setIdCUBxVr_ph(data_ph?.id ?? null);
        } catch (error) {
            console.log(error);
        }
    }
    async function CREATE_CHECK(_detail, chekcs, _currentItem, _headers) {
        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        var formUrl = import.meta.env.VITE_API_URL + "/pdf/recordarcextra";
        var formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDoc = await PDFDocument.load(formPdfBytes);

        const currentItem = _currentItem;
        const id_public = currentItem.id_public;

        let page = pdfDoc.getPage(0)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        page.setFont(helveticaFont)
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
        pdfDoc.setCreationDate(dayjs().toDate());
        pdfDoc.setCreator('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setKeywords(['formulario', 'unico', 'nacional', 'curaduria', 'planeacion', 'construccion', 'obra', 'proyecto', 'informe', 'acta', 'estructural', 'ingenieria']);
        pdfDoc.setLanguage('es-co');
        pdfDoc.setProducer('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setTitle('CHECKEO INFORME ARQUITECTÓNICO - ' + id_public)

        var pdfBytes = await pdfDoc.save();
        var fileDownload = require('js-file-download');
        fileDownload(pdfBytes, 'CHECKEO INFORME ARQUITECTÓNICO ' + id_public + '.pdf');
        swalClose();

    }

    // render body starts here

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
        let _REGEX_IDNUMBER = (value) => {
            let regex = /^[0-9]+$/i;
            let test = regex.test(value);
            if (test) {
                var _value = Number(value).toLocaleString();
                _value = _value.replaceAll(',', '.');
                return _value;
            }
            return value;
        }
        let _GET_CLOCK_STATE = (_state, _version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_LAST_OA = () => {
            FUNService.getLastOA()
                .then(response => {
                    if (response.data.length) {
                        let new_id = response.data[0].id;
                        if (new_id) {
                            let _id = new_id.split('-')
                            let concecutive = _id[1];
                            concecutive = Number(concecutive) + 1
                            if (concecutive < 1000) concecutive = "0" + concecutive
                            if (concecutive < 100) concecutive = "0" + concecutive
                            if (concecutive < 10) concecutive = "0" + concecutive
                            new_id = `${_id[0]}-${concecutive}`
                            setActa(prev => ({ ...prev, id_public: new_id }));
                        } else setActa(prev => ({ ...prev, id_public: "OA" + dayjs().format('YY') + "-0001" }));
                    } else setActa(prev => ({ ...prev, id_public: "OA" + dayjs().format('YY') + "-0001" }));
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte." });
                });

        }
        let _GET_LAST_ID = () => {
            PQRS_Service.getlascub()
                .then(response => {
                    let new_id = response.data[0].cub;
                    new_id = _MANAGE_IDS(new_id, 'end')
                    setNotif(prev => ({ ...prev, phnot_cub: new_id }));
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar el consecutivo, inténtelo nuevamente." });
                });

        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = Array.isArray(currentRecord.record_ph_steps) ? currentRecord.record_ph_steps : [];
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

        // ====== FORM STATE ======
        const _NOT_VALUES = _GET_STEP_TYPE('phnd', 'value');
        const _PH_DETAIL_VALUES = _GET_STEP_TYPE('ph_details', 'value');
        const _CHILD_53 = _GET_CHILD_53();
        const _JSON = getJSONFull(currentRecord.cub_json);

        const [acta, setActa] = useState({
            detail_2: currentRecord.detail_2 || '',
            detail_3: currentRecord.detail_3 || '',
            worker_arc_id: currentRecord.worker_arc_id || window.user.id,
            worker_arc_name: currentRecord.worker_arc_name || `${window.user.name} ${window.user.surname}`,
            date_arc_review: currentRecord.date_arc_review || dayjs().format('YYYY-MM-DD'),
            check: currentRecord.check || '0',
            id_public: currentRecord.id_public || '',
        });

        const [config, setConfig] = useState({
            type_not: '0',
            exp_pdf_reso_1: '',
            exp_pdf_reso_2: '',
            exp_pdf_reso_record_version: _NOT_VALUES[3] || '0',
            exp_pdf_reso_logo: 'no',
            record_rew_pagesi: false,
            record_rew_pagesn: true,
            record_maring_top: 2.5,
            record_maring_bot: 2.5,
            record_maring_left: 1.7,
            record_maring_right: 1.7,
            pdf_check_number: '',
            pdf_check_city: '',
        });

        const [notifDetails, setNotifDetails] = useState({
            ph_not_det_1: _NOT_VALUES[0] || '',
            ph_not_det_2: _NOT_VALUES[1] || '',
            ph_not_det_3: _NOT_VALUES[2] || '',
        });

        const [phDetails, setPhDetails] = useState({
            area: _PH_DETAIL_VALUES[0] || '',
            history: _PH_DETAIL_VALUES[1] || '',
        });

        const [notif, setNotif] = useState({
            phnot_date_doc: _JSON.date_doc || dayjs().format('YYYY-MM-DD'),
            phnot_cub: currentRecord.cub || '',
            phnot_city: _JSON.city || capitalize(infoCud.city.toLowerCase()),
            phnot_name: _JSON.name || `${_CHILD_53.item_5311} ${_CHILD_53.item_5312}`,
            phnot_address: _JSON.address || _CHILD_53.item_536,
            phnot_email: _JSON.email || _CHILD_53.item_535,
        });

        let _NOTY_TYPE_COMPONENENT = () => {
            return <>
                <div className='row mx-5 my-3 text-start'>
                    <strong>TIPO DE NOTIFICACIÓN</strong>

                    <div className="col-4">
                        <select className='form-select' id="type_not" value={config.type_not} onChange={(e) => setConfig(prev => ({ ...prev, type_not: e.target.value }))}>
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
                    <input type="hidden" id="record_ph_worker_arc_0" value={acta.worker_arc_id} />
                    <div className="col-6">
                        <label>Profesional</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="record_ph_worker_arc_1"
                                value={acta.worker_arc_name} onChange={(e) => setActa(prev => ({ ...prev, worker_arc_name: e.target.value }))} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Fecha de la revisón</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="calendar-alt" size={16} />
                            </span>
                            <input type="date" className="form-control" id="record_ph_worker_arc_2" required
                                value={acta.date_arc_review} onChange={(e) => setActa(prev => ({ ...prev, date_arc_review: e.target.value }))} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Aprobado</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="check-square" size={16} />
                            </span>
                            <select className="form-control" id="recprd_ph_final_check" value={acta.check} onChange={(e) => setActa(prev => ({ ...prev, check: e.target.value }))}>
                                <option value="0" className="text-danger">NO</option>
                                <option value="1" className="text-success">SI</option>
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_DETAILS_3 = () => {
            return <div className="row py-2">
                <label className='fw-bold'>Observaciones</label>
                <div className="col-12">
                    <p>a.  El presente acto aprueba los planos de alineamiento y el cuadro de área de propiedad horizontal, de acuerdo con  lo exigido en la ley
                        675 de 2001.</p>
                    <p>b. El presente visto bueno se expide de acuerdo con los planos de propiedad horizontal presentando con la  solicitud, los cuales
                        corresponden a los planos arquitectónicos aprobados en: </p>
                    <input type="text" className="form-control" id="review_ph_detail_3" value={acta.detail_3} onChange={(e) => setActa(prev => ({ ...prev, detail_3: e.target.value }))} />
                </div>
            </div>
        }
        let _COMPONENT_DETAILS_2 = () => {
            return <div className="row py-2">
                <div className="col-12">
                    <label>Observaciones, separe cada punto con (solo) un salto de linea. (máximo 5000 caracteres)</label>
                    <textarea className="input-group" maxLength="5000" id="review_ph_detail_2" rows="4"
                        value={acta.detail_2} onChange={(e) => setActa(prev => ({ ...prev, detail_2: e.target.value }))}></textarea>
                </div>
            </div>
        }
        let _COMPONENT_DETAILS_4 = () => {
            return <>
                <div className="row py-2">
                    <div className="col-3">
                        <label>Área del predio</label>
                        <input type="number" step={0.01} className="form-control" id="review_ph_detail_area" value={phDetails.area} onChange={(e) => setPhDetails(prev => ({ ...prev, area: e.target.value }))} />
                    </div>
                    <div className="col-12">
                        <label>Actos administrativos que anteceden y/o licencia(s) de gestión</label>
                        <textarea className="input-group" maxLength="2000" id="review_ph_detail_beofre" rows="4"
                            value={phDetails.history} onChange={(e) => setPhDetails(prev => ({ ...prev, history: e.target.value }))}></textarea>
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
                    <div className='row  border border-dark bg-primary text-primary-foreground fwb-bold py-1 mx-0 mt-3'>
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
            return <>
                <div className="row mb-3">
                    <div className="col">
                        <label>Fecha del documento</label>
                        <input type="date" className="form-control mb-3" max='2100-01-01' id="phnot_date_doc" required
                            value={notif.phnot_date_doc} onChange={(e) => setNotif(prev => ({ ...prev, phnot_date_doc: e.target.value }))} />
                    </div>

                    <div className="col">
                        <label>Consecutivo de Entrada</label>
                        <input type="text" className="form-control mb-3" id="phnot_id_public" disabled
                            value={currentItem.id_public} />
                    </div>
                    <div className="col">
                        <label> {infoCud.serials.end} Carta Citación</label>
                        <div className="input-group">
                            <input type="text" className="form-control" id="phnot_cub"
                                value={notif.phnot_cub} onChange={(e) => setNotif(prev => ({ ...prev, phnot_cub: e.target.value }))} />
                            <Button size="sm" onClick={() => _GET_LAST_ID()}>GENERAR</Button>
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label>Ciudad</label>
                        <input type="text" className="form-control mb-3" id="phnot_city"
                            value={notif.phnot_city} onChange={(e) => setNotif(prev => ({ ...prev, phnot_city: e.target.value }))} />
                    </div>
                    <div className="col">
                        <label>Consecutivo de Salida</label>
                        <input type="text" className="form-control mb-3" id="phnot_res_public" disabled
                            value={currentRecord.id_public} />
                    </div>
                    <div className="col">
                        <label>Fecha de Revision</label>
                        <input type="date" className="form-control mb-3" max='2100-01-01' id="phnot_date_res" disabled
                            value={_JSON.date || currentRecord.date_arc_review} />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label>Responsable</label>
                        <input type="text" className="form-control mb-3" id="phnot_name"
                            value={notif.phnot_name} onChange={(e) => setNotif(prev => ({ ...prev, phnot_name: e.target.value }))} />
                    </div>
                    <div className="col">
                        <label>Dirección</label>
                        <div className="input-group">
                            <input type="text" className="form-control" id="phnot_address"
                                value={notif.phnot_address} onChange={(e) => setNotif(prev => ({ ...prev, phnot_address: e.target.value }))} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Email</label>
                        <div className="input-group">
                            <input type="text" className="form-control" id="phnot_email"
                                value={notif.phnot_email} onChange={(e) => setNotif(prev => ({ ...prev, phnot_email: e.target.value }))} />
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_NOT_DETAILS = () => {
            return <>
                <div className="row">
                    <div className="col-4">
                        <label>Fecha entrega</label>
                        <div className="input-group mb-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="calendar-alt" size={16} />
                            </span>
                            <input type="date" className="form-control" id="ph_not_det_1"
                                value={notifDetails.ph_not_det_1} onChange={(e) => { setNotifDetails(prev => ({ ...prev, ph_not_det_1: e.target.value })); save_not_data(); }} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Persona que recibe</label>
                        <div className="input-group mb-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="ph_not_det_2"
                                value={notifDetails.ph_not_det_2} onChange={(e) => { setNotifDetails(prev => ({ ...prev, ph_not_det_2: e.target.value })); save_not_data(); }} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Documento que recibe</label>
                        <div className="input-group mb-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="id-card" size={16} />
                            </span>
                            <input type="text" className="form-control" id="ph_not_det_3"
                                value={notifDetails.ph_not_det_3} onChange={(e) => { setNotifDetails(prev => ({ ...prev, ph_not_det_3: e.target.value })); save_not_data(); }} onBlur={() => setNotifDetails(prev => ({ ...prev, ph_not_det_3: _REGEX_IDNUMBER(prev.ph_not_det_3) }))} />
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
                        <div className="input-group mb-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="hashtag" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_01_ph"
                                value={currentItem.id_public} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Salida</label>
                        <div className="input-group mb-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="hashtag" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_02_ph"
                                value={acta.id_public} onChange={(e) => setActa(prev => ({ ...prev, id_public: e.target.value }))} />
                            <Button size="sm" onClick={() => _GET_LAST_OA()}>GENERAR</Button>
                        </div>
                    </div>
                </div>

                <div className="row mb-2">

                    {_NOTY_TYPE_COMPONENENT()}

                    <div className="col">
                        <label>Autoridad Competente</label>
                        <div className="input-group my-1">
                            <select className="form-select me-1" id={"exp_pdf_reso_1"} value={config.exp_pdf_reso_1} onChange={(e) => setConfig(prev => ({ ...prev, exp_pdf_reso_1: e.target.value }))}>
                                {domains_number}
                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <label>Ciudad</label>
                        <div className="input-group my-1">
                            <select className="form-select me-1" id={"exp_pdf_reso_2"} value={config.exp_pdf_reso_2} onChange={(e) => setConfig(prev => ({ ...prev, exp_pdf_reso_2: e.target.value }))}>
                                {cities}
                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <label>Vigencia</label>
                        <div className="input-group my-1">
                            <select className="form-select" id="exp_pdf_reso_record_version" value={config.exp_pdf_reso_record_version} onChange={(e) => { setConfig(prev => ({ ...prev, exp_pdf_reso_record_version: e.target.value })); save_not_data(); }}>
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
                        <div className="input-group my-1">
                            <select className="form-select me-1" id={"exp_pdf_reso_logo"} value={config.exp_pdf_reso_logo} onChange={(e) => setConfig(prev => ({ ...prev, exp_pdf_reso_logo: e.target.value }))}>
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

                    <div className="col d-flex justify-content-center">
                        <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="record_rew_pagesi" checked={config.record_rew_pagesi} onChange={(e) => setConfig(prev => ({ ...prev, record_rew_pagesi: e.target.checked }))} />
                            <label className="form-check-label">Usar pie de pagina</label>
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="record_rew_pagesn" checked={config.record_rew_pagesn} onChange={(e) => setConfig(prev => ({ ...prev, record_rew_pagesn: e.target.checked }))} />
                            <label className="form-check-label">Usar paginación</label>
                        </div>
                    </div>
                </div>

                <div className="row mb-2 text-center">

                    <div className="col ">
                        <div className="input-group-sm my-1">
                            <label className="form-check-label">Margen Superior (cm)</label>
                            <input type="number" min={0} step={0.01} className="form-control-sm" id="record_maring_top" value={config.record_maring_top} onChange={(e) => setConfig(prev => ({ ...prev, record_maring_top: e.target.value }))} />
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div className="input-group-sm my-1">
                            <label className="form-check-label">Margen Inferior (cm)</label>
                            <input type="number" min={0} step={0.01} className="form-control-sm" id="record_maring_bot" value={config.record_maring_bot} onChange={(e) => setConfig(prev => ({ ...prev, record_maring_bot: e.target.value }))} />
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div className="input-group-sm my-1">
                            <label className="form-check-label">Margen Izquierdo (cm)</label>
                            <input type="number" min={0} step={0.01} className="form-control-sm" id="record_maring_left" value={config.record_maring_left} onChange={(e) => setConfig(prev => ({ ...prev, record_maring_left: e.target.value }))} />
                        </div>
                    </div>

                    <div className="col d-flex justify-content-center">
                        <div className="input-group-sm my-1">
                            <label className="form-check-label">Margen Derecho (cm)</label>
                            <input type="number" min={0} step={0.01} className="form-control-sm" id="record_maring_right" value={config.record_maring_right} onChange={(e) => setConfig(prev => ({ ...prev, record_maring_right: e.target.value }))} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3 text-center">
                    <div className="col">
                        <Button size="sm" className="my-3" disabled={isSaving}><Icon name="file-alt" size={16} /> GUARDAR CAMBIOS </Button>
                    </div>
                    <div className="col">
                        <Button variant="destructive" size="sm" className="my-3" onClick={() => pdf_gen()} ><Icon name="file-pdf" size={16} /> GENERAR PDF </Button>
                    </div>
                    <div className="col">
                        <label>NUMERO DE DOMINIO</label>
                        <select className="form-select form-select-sm" id="func_pdf_0_1" value={config.pdf_check_number} onChange={(e) => setConfig({ ...config, pdf_check_number: e.target.value })}>
                            <option value="">No aplica</option>
                            <option value="1">PRIMERO</option>
                            <option value="2">SEGUNDO</option>
                            <option value="3">TERCERO</option>
                            <option value="4">CUARTO</option>
                            <option value="5">QUINTO</option>
                            <option value="6">SEXTO</option>
                            <option value="7">SEPTIMO</option>
                            <option value="8">OCTAVO</option>
                            <option value="9">NOVENO</option>
                        </select>
                    </div>
                    <div className="col">
                        <label>CURADURÍA</label>
                        <select className="form-select form-select-sm" id="func_pdf_0_2" value={config.pdf_check_city} onChange={(e) => setConfig({ ...config, pdf_check_city: e.target.value })}>
                            <option value="">No aplica</option>
                            <option value="Bogotá">Bogotá</option>
                            <option value="Soacha">Soacha</option>
                            <option value="Otra">Otra</option>
                        </select>
                    </div>
                    <div className="col">
                        <Button variant="destructive" size="sm" className="my-3" onClick={() => CREATE_PDF_CHECK()} disabled={isSaving}><Icon name="file-pdf" size={16} /> GENERAR CHECKEO </Button>
                    </div>
                </div>
            </>
        }
        let manage_item = async (e) => {
            if (e) e.preventDefault();
            const formData = new FormData();

            formData.set('detail_2', acta.detail_2);
            formData.set('detail_3', acta.detail_3);
            formData.set('worker_arc_id', acta.worker_arc_id);
            formData.set('worker_arc_name', acta.worker_arc_name);
            formData.set('date_arc_review', acta.date_arc_review);
            formData.set('check', acta.check);
            formData.set('id_public', acta.id_public);
            formData.set('new_id', acta.id_public);
            formData.set('prev_id', currentRecord.id_public);

            const notDataResult = await save_not_data();
            if (!notDataResult.ok) return;

            const vrResult = await createVRxCUB_relation_PH();
            if (!vrResult.ok) {
                await swalConfirm({
                    title: 'Relación CUBxVR no actualizada',
                    text: 'El informe se guardará de todos modos. Revise la relación del consecutivo si necesita trazabilidad CUBxVR exacta.',
                    confirmButtonText: 'Continuar',
                    showCancelButton: false,
                });
            }

            const result = await execute(RECORD_PH_SERVICE.update(currentRecord.id, formData), {
                operationName: 'guardar acta de revisión',
            });

            if (result.ok) {
                requestUpdateRecord(currentItem.id);
                requestUpdate(currentItem.id);
            }
        }

        let review = async () => {
            const clockResult = await save_clock();
            if (!clockResult.ok) return;
            await manage_item();
        }

        let save_clock = async () => {
            const formDataClock = new FormData();

            let state = 14

            let worker = acta.worker_arc_name;
            let date = acta.date_arc_review;
            let review = acta.check;
            let desc = review == 1 ? "APROBADO" : "NO APROBADO"

            formDataClock.set('date_start', date);
            formDataClock.set('name', "Revision P.H., revision " + currentVersionR);
            formDataClock.set('desc', "Fue declarada como: " + desc + " por " + worker);
            formDataClock.set('state', state);
            formDataClock.set('version', currentVersion);
            formDataClock.set('fun0Id', currentItem.id);

            return await manage_clock(formDataClock, state);
        }

        let manage_clock = async (formDataClock, findOne) => {
            var _CHILD = _GET_CLOCK_STATE(findOne, currentItem);

            if (_CHILD.id) {
                return await execute(FUN_SERVICE.update_clock(_CHILD.id, formDataClock), {
                    operationName: 'guardar reloj de revisión',
                    loading: false,
                    success: false,
                });
            } else {
                return await execute(FUN_SERVICE.create_clock(formDataClock), {
                    operationName: 'crear reloj de revisión',
                    loading: false,
                    success: false,
                });
            }
        }

        let save_archive = async () => {
            const formDataClock = new FormData();

            let state = 101

            let worker = window.user.name + " " + window.user.surname;

            let date_arc_review = acta.date_arc_review;
            let date = date_arc_review ?? dayjs().format('YYYY-MM-DD');

            formDataClock.set('date_start', date);
            formDataClock.set('name', "ARCHIVACIÓN");
            formDataClock.set('desc', "Fue enviado al archivo por: " + worker);
            formDataClock.set('state', state);
            formDataClock.set('version', currentVersion);
            formDataClock.set('fun0Id', currentItem.id);

            return await manage_clock(formDataClock, state);
        }

        let save_close = async () => {
            const formDataClock = new FormData();

            let state = 100

            let worker = window.user.name + " " + window.user.surname;
            let date = dayjs().format('YYYY-MM-DD');

            formDataClock.set('date_start', date);
            formDataClock.set('name', "CERRADA");
            formDataClock.set('desc', "Fue cerrada por: " + worker);
            formDataClock.set('state', state);
            formDataClock.set('version', currentVersion);
            formDataClock.set('fun0Id', currentItem.id);

            return await manage_clock(formDataClock, state);
        }

        let pdf_gen = async () => {
            const formData = new FormData();
            let altId = currentItem.id_public;
            formData.set('id', currentItem.id);
            formData.set('altId', altId);

            formData.set('r_pagesi', config.record_rew_pagesi);
            formData.set('r_pagesn', config.record_rew_pagesn);
            formData.set('r_vig', config.exp_pdf_reso_record_version);
            formData.set('logo', config.exp_pdf_reso_logo);

            formData.set('type_not', config.type_not);

            formData.set('m_top', config.record_maring_top || 2.5);
            formData.set('m_bot', config.record_maring_bot || 2.5);
            formData.set('m_left', config.record_maring_left || 1.7);
            formData.set('m_right', config.record_maring_right || 1.7);

            const result = await execute(RECORD_PH_SERVICE.gen_doc_ph(formData), {
                operationName: 'generar PDF',
                success: false,
            });

            if (result.ok) {
                swalClose();
                window.open(import.meta.env.VITE_API_URL + "/pdf/recordph/" + "Informe Revision Propiedad Horizontal " + (currentRecord.id_public ?? currentItem.id_public) + ".pdf");
            }
        }

        let close = async () => {
            const confirmResult = await swalConfirm({ title: "CERRAR SOLICITUD", text: "¿Esta seguro de cerra esta Solicitud? \nSI SE PODRÁ realizar cambios mas adelantes.", icon: 'question', confirmButtonText: "CERRAR" });
            if (!confirmResult.isConfirmed) return;

            const formDataClock = new FormData();
            formDataClock.set('state', 100);

            const result = await execute(FUN_SERVICE.update(currentItem.id, formDataClock), {
                operationName: 'cerrar solicitud',
            });

            if (result.ok) {
                const closeResult = await save_close();
                if (closeResult.ok) {
                    requestRefresh(currentItem.id);
                }
            }
        }

        let archive = async () => {
            const confirmResult = await swalConfirm({ title: "ARCHIVAR SOLICITUD", text: "¿Esta seguro de archivar esta Solicitud? \nNO SE PODRÁ modificar de ninguna forma.", icon: 'question', confirmButtonText: "ARCHIVAR" });
            if (!confirmResult.isConfirmed) return;

            const formDataClock = new FormData();
            formDataClock.set('state', 101);

            const result = await execute(FUN_SERVICE.update(currentItem.id, formDataClock), {
                operationName: 'archivar solicitud',
            });

            if (result.ok) {
                const archiveResult = await save_archive();
                if (archiveResult.ok) {
                    requestRefresh(currentItem.id);
                    closeModal();
                }
            }
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

            let _city = config.pdf_check_city;
            let _number = config.pdf_check_number;

            var headers = {};
            headers.city = _city;
            headers.number = _number

            CREATE_CHECK(_RESUME, checks, currentItem, headers)
        }

        let createVRxCUB_relation_PH = async () => {
            let formatData = new FormData();
            formatData.set('vr', currentItem.id_public);
            formatData.set('cub', acta.id_public);
            formatData.set('fun', currentItem.id_public);
            formatData.set('process', 'PROPIEDAD HORIZONTAL');

            if (idCUBxVr_ph) {
                return await execute(CubXVrDataService.updateCubVr(idCUBxVr_ph, formatData), {
                    operationName: 'actualizar relación CUBxVR PH',
                    loading: false,
                    success: false,
                    error: false,
                });
            } else {
                return await execute(CubXVrDataService.createCubXVr(formatData), {
                    operationName: 'crear relación CUBxVR PH',
                    loading: false,
                    success: false,
                    error: false,
                });
            }
        };

        let save_not_data = async () => {
            const value = [
                notifDetails.ph_not_det_1,
                notifDetails.ph_not_det_2,
                notifDetails.ph_not_det_3,
                config.exp_pdf_reso_record_version,
            ];

            const formData = new FormData();
            formData.set('value', value.join(';'));
            formData.set('version', currentVersionR);
            formData.set('recordPhId', currentRecord.id);
            formData.set('id_public', 'phnd');

            const step = LOAD_STEP('phnd');
            const result = await execute(savePHStep(RECORD_PH_SERVICE, step, formData), {
                operationName: 'guardar detalles de notificación',
                loading: false,
                success: false,
            });

            if (!result.ok) return result;

            if (phDetails.area || phDetails.history) {
                const formData2 = new FormData();
                const value2 = [phDetails.area, phDetails.history];
                formData2.set('value', value2.join(';'));
                formData2.set('version', currentVersionR);
                formData2.set('recordPhId', currentRecord.id);
                formData2.set('id_public', 'ph_details');

                const step2 = LOAD_STEP('ph_details');
                return await execute(savePHStep(RECORD_PH_SERVICE, step2, formData2), {
                    operationName: 'guardar detalles adicionales PH',
                    loading: false,
                    success: false,
                });
            }

            return result;
        }

        let createVRxCUB_relation = async (cub_selected) => {
            let formatData = new FormData();
            formatData.set('vr', currentItem.id_public);
            formatData.set('cub', cub_selected);
            formatData.set('fun', currentItem.id_public);
            formatData.set('process', 'DOCUMENTOS PH / CITACIÓN PARA NOTIFICACIÓN');
            formatData.set('desc', 'Citacion Notificación Resolución de Aprovación de Plano de Propiedad Horizontal');
            formatData.set('date', notif.phnot_date_doc);

            if (idCUBxVr) {
                return await execute(CubXVrDataService.updateCubVr(idCUBxVr, formatData), {
                    operationName: 'actualizar relación CUBxVR notificación',
                    loading: false,
                    success: false,
                });
            } else {
                return await execute(CubXVrDataService.createCubXVr(formatData), {
                    operationName: 'crear relación CUBxVR notificación',
                    loading: false,
                    success: false,
                });
            }
        };

        let save_cub = async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.set('new_cub', notif.phnot_cub);
            formData.set('prev_cub', currentRecord.cub);

            let cub_json = getJSONFull(currentRecord.cub_json);
            cub_json.date_doc = notif.phnot_date_doc;
            cub_json.city = notif.phnot_city;
            cub_json.name = notif.phnot_name;
            cub_json.address = notif.phnot_address;
            cub_json.email = notif.phnot_email;

            formData.set('cub_json', JSON.stringify(cub_json));

            const vrResult = await createVRxCUB_relation(notif.phnot_cub);
            if (!vrResult.ok) return;

            const result = await execute(RECORD_PH_SERVICE.update(currentRecord.id, formData), {
                operationName: 'guardar notificación',
            });

            if (result.ok) {
                requestUpdateRecord(currentItem.id);
                requestUpdate(currentItem.id);
            }
        }

        let pdfnot_gen = async () => {
            const formData = new FormData();
            formData.set('date_doc', notif.phnot_date_doc);
            formData.set('cub', notif.phnot_cub);
            formData.set('city', notif.phnot_city);
            formData.set('ph_id', currentRecord.id_public);
            formData.set('ph_date', currentRecord.date_arc_review);
            formData.set('name', notif.phnot_name);
            formData.set('address', notif.phnot_address);
            formData.set('email', notif.phnot_email);
            formData.set('id_public', currentItem.id_public);

            const result = await execute(RECORD_PH_SERVICE.gen_doc_not(formData), {
                operationName: 'generar PDF de notificación',
                success: false,
            });

            if (result.ok) {
                swalClose();
                window.open(import.meta.env.VITE_API_URL + "/pdf/recordphnot/" + "CITACIÓN PARA NOTIFICACIÓN " + (currentRecord.id_public ?? currentItem.id_public) + ".pdf");
            }
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
                                        <Button variant="destructive" size="sm" className="my-3" onClick={() => review()} disabled={isSaving}><Icon name="check-square" size={16} /> REALIZAR REVISIÓN </Button>
                                    </div>

                                    {!_GET_CLOCK_STATE(100, currentVersion)
                                        ? <div className="col">
                                            <Button size="sm" className="my-3" onClick={() => close()} disabled={isSaving}><Icon name="file-archive" size={16} /> CERRAR</Button>
                                        </div>
                                        : ""}
                                    {_GET_CLOCK_STATE(100, currentVersion)
                                        ? <div className="col">
                                            <Button size="sm" className="my-3" onClick={() => archive()} disabled={isSaving}><Icon name="file-archive" size={16} /> ARCHIVAR</Button>
                                        </div>
                                        : ""}
                                </>
                                : <label className="app-p lead fw-normal text-danger">ESTA SOLICITUD SE ENCUENTRA EN UN PROCESO DE DESISTIMIENTO,
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
                                <Button size="sm" className="my-3" disabled={isSaving}><Icon name="share-square" size={16} /> GUARDAR CAMBIOS </Button>
                            </div>
                            <div className="col">
                                <Button variant="destructive" size="sm" className="my-3" onClick={() => pdfnot_gen()} disabled={isSaving}><Icon name="file-pdf" size={16} /> GENERAR PDF </Button>
                            </div>
                        </div>
                    </form>
                </Collapsible>

                {_COMPONENT_NOT_DETAILS()}
            </div >
        );
}

export default RECORD_PH_REVIEW;
