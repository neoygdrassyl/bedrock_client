import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import RECORD_LAW_SERVICE from '../../../../services/record_law.service'
import FUN_SERVICE from '../../../../services/fun.service'

import moment from 'moment';
import RECORD_LAW_PDF from './record_law_pdf';
import { MDBBtn, MDBTypography } from 'mdb-react-ui-kit';
import { GEM_CODE_LIST, VR_DOCUMENTS_OF_INTEREST} from '../../../../components/customClasses/typeParse';
import submitService from '../../../../services/submit.service';
import RECORD_DOCUMENT_VERSION from '../record_docVersion.component';
const MySwal = withReactContent(Swal);

class RECORD_LAW_EVALUATION extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
                        if (valuek == 'SI') newList.push({
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
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { VRDocs } = this.state;

        // DATA GETTERS
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
        // DATA CONVERTERS
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
            const _docsScope = VR_DOCUMENTS_OF_INTEREST['law'];
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
                if (CHECK[r_i] == 2) return true;
                let cond1 = eva[1] == 1 || eva[1] == 2;
                let vr = _FIND_IN_VRDOCS(R);
                let cond2 = CHECK[r_i] == 1 || CHECK[r_i] == 2 || vr;
                return cond1 && cond2;
            })
            return _ALLOW;
        }
        let _GET_PROFESIONAL_NAME = () => {
            var _ROLEID = window.user.roleId;
            return window.user.name + " " + window.user.surname
            //THIS ROLES ARE PROGRAMER MASTER, CURATOR AND ARCHITEC
            if (_ROLEID == 1 || _ROLEID == 2 || _ROLEID == 6) {

            } else {
                return "NO ESTA AUTORIZADO A REALIZAR ESTA ACCION"
            }
        }
        let _GET_CLOCK_STATE = (_state, _version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_CLOCK_STATE_VERSION = (_state, version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == version) return _CLOCK[i];
            }
            return false;
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_law_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ?? []
            if (!value.length) return [];
            value = value.split(';');
            return value
        }
        // COMPONENT JSX

        let _COMPONENT_CORRECTIONS = () => {
            let _CHILD = _GET_CHILD_REVIEW();

            return <>
                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>OBSERVACIONES FINALES ADICIONALES</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <textarea className="input-group" maxLength="8176" id="r_l_g_corrections" rows="4"
                            defaultValue={_CHILD.detail} onBlur={() => save_doc_corrections()}></textarea>
                        <label>(maximo 8000 caracteres)</label>
                    </div>
                </div></>
        }
        let _COMPOENTN_CORRECTIONS_HISTORIC = () => {
            let values_1 = _GET_STEP_TYPE('s1', 'value');
            let values_f53 = _GET_STEP_TYPE('f53', 'value');
            let values_law = _GET_STEP_TYPE('flaw', 'value');
            let _details = '';
            let _RESUME = [];
            if (values_1[0]) _details = _details + values_1[0] + '\n';
            if (values_f53[0]) _details = _details + values_f53[0] + '\n';
            if (values_law[0]) _details = _details + values_law[0] + '\n';

            if (values_1[0]) _RESUME.push(`- Observaciones (Documentos aportados): \n${values_1[0]}`)
            if (values_f53[0]) _RESUME.push(`- Observaciones (Formulario Único Nacional): \n${values_f53[0]}`)
            if (values_law[0]) _RESUME.push(`- Observaciones (Publicidad): \n${values_law[0]}`)

            if (_RESUME) _RESUME = _RESUME.join('\n\n')
            return <>
                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>OBSERVACIONES TOTALES</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <textarea className="input-group" maxLength="10100" name="s_flaw_values" rows="8" readOnly disabled style={{ 'backgroundColor': 'gainsboro' }}
                            value={`${_RESUME}`}></textarea>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_REVIEW = () => {
            let _CHILD = _GET_CHILD_REVIEW();
            let _RR = _GET_RECORD_REVIEW();

            let _PRIMAL_ASIGN = { date_asign: currentRecord.date_asign, worker_name: currentRecord.worker_name }
            let _ASIGNS = _GET_CLOCK_STATE_VERSION(11, 100).date_start ? _GET_CLOCK_STATE_VERSION(11, 100).date_start.split(';') : [];
            let _REVIEWS = _GET_CLOCK_STATE_VERSION(11, 200).resolver_context ? _GET_CLOCK_STATE_VERSION(11, 200).resolver_context.split(';') : [];
            let _REVIEWS_DATES = _GET_CLOCK_STATE_VERSION(11, 200).date_start ? _GET_CLOCK_STATE_VERSION(11, 200).date_start.split(';') : [];

            let CLOCKS_R;
            CLOCKS_R = _RR.check == 0 ? ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Acta Correcciones',] : ['Acta Observaciones',]

            const REW_STR = [<label className='text-danger fw-bold'>NO ES VIABLE</label>,
            <label className='text-success fw-bold'>SI ES VIABLE</label>,
            <label className='text-warning fw-bold'>NO APLICA</label>]

            const ALLOW_REVIEW = _ALLOW_REVIEW();
            return <>

                {!ALLOW_REVIEW ? <MDBTypography note noteColor='danger'>
                    <h3 className="text-justify text-dark">ADVERTENCIA</h3>
                    NO ES POSIBLE EVALUAR EL INFORME COMO "SI ES VIABLE" POR QUE HAY DOCUMENTOS QUE NO CUMPLEN, PARA PODER EVALUAR COMO "SI ES VIABLE" LOS DOCUMENTOS EN EL PUNTO 2.2 DEBEN ESTAR DECLARAROS COMO "CUMPLE" EN SU EVALUACIÓN
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
                    let iasing = i == 0 ? (_ASIGNS[i] ?? _PRIMAL_ASIGN.date_asign) : _ASIGNS[i];
                    let ireview = i == 0 ? (_REVIEWS[i] ?? _CHILD.check) : _REVIEWS[i];
                    let idate = i == 0 ? (_REVIEWS_DATES[i] ?? _CHILD.date) : _REVIEWS_DATES[i];
                    let iworker = _PRIMAL_ASIGN.worker_name || _CHILD.worker_name || '';

                    let isPrimal = i == 0;
                    let allowReview = iasing != null && iasing != undefined && iasing != '';

                    return <>
                        <div className="row border">
                            <div className="col">
                                <label className='fw-bold'>{value}</label>
                            </div>
                            <div className="col-3 text-center">
                                {this.state['REW' + i]
                                    ? <input type="text" class="form-control me-1" id={"r_l_review_1_" + i}
                                        defaultValue={iworker} disabled />
                                    : <label>{iworker}</label>
                                }
                            </div>
                            <div className="col text-center">
                                <label>{iasing}</label>
                            </div>
                            <div className="col text-center">
                                {this.state['REW' + i]
                                    ? <select className="form-select form-control form-control-sm" defaultValue={ireview} id={"r_l_review_2_" + i}>
                                        <option value="0" className="text-danger">NO ES VIABLE</option>
                                        {ALLOW_REVIEW ? <option value="1" className="text-success">SI ES VIABLE</option> : ''}
                                    </select>
                                    : <label>{REW_STR[ireview] ?? ''}</label>
                                }
                            </div>
                            <div className="col text-center">
                                {this.state['REW' + i]
                                    ? <input type="date" class="form-control form-control-sm" id={"r_l_review_3_" + i} max="2100-01-01"
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
                                        id6={"law" + i} />
                                    : ''
                                }
                            </div>
                        </div>
                    </>
                })}
            </>
        }

        // FUNCTIONS AND APIS
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

        let save_doc_corrections = () => {
            formData = new FormData();
            var detail = document.getElementById("r_l_g_corrections").value;
            formData.set('detail', detail);

            manage_review(false);
        }
        let save_review = (isPrimal) => {
            if (isPrimal) {
                let i = '_0';
                formData = new FormData();
                let worker_name = document.getElementById("r_l_review_1" + i).value;
                formData.set('worker_name', worker_name);
                let date = document.getElementById("r_l_review_3" + i).value;
                formData.set('date', date);
                let check = document.getElementById("r_l_review_2" + i).value;
                formData.set('check', check);
                formData.set('worker_id', window.user.id);
                manage_review(true, isPrimal);
            }
        }
        let manage_review = (useMySwal, isPrimal) => {
            let _CHILD = _GET_CHILD_REVIEW();
            formData.set('recordLawId', currentRecord.id);
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
                RECORD_LAW_SERVICE.update_law_review(_CHILD.id, formData)
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
                RECORD_LAW_SERVICE.create_law_review(formData)
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

        let save_clock = (isIndex, iasing) => {
            let state = 11 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS
            let i = isIndex ? '_' + isIndex : '_0';
            let worker = document.getElementById("r_l_review_1" + i).value;
            let date = document.getElementById("r_l_review_3" + i).value;
            let review = document.getElementById("r_l_review_2" + i).value;
            let desc = review == 1 ? "SI ES VIABLE" : "NO ES VIABLE"
            let formDataClock = new FormData();
            formDataClock.set('date_start', date);
            formDataClock.set('name', "Revision JURIDICA, revision " + currentVersionR);
            formDataClock.set('desc', "Fue declarada como: " + desc + " por " + worker);
            formDataClock.set('state', state);
            formDataClock.set('version', currentVersionR);

            save_clock_asign(state, isIndex)
            manage_clock(false, state, formDataClock);
        }
        let save_clock_asign = (state, index) => {
            var _CLOCK_ASIGN = _GET_CLOCK_STATE_VERSION(state, 100);
            var _CLOCK = _GET_CLOCK_STATE_VERSION(state, 200);
            let j = index ? '_' + index : '_0';
            let review = document.getElementById("r_l_review_2" + j).value;
            let date = document.getElementById("r_l_review_3" + j).value;
            let asign_length = _CLOCK_ASIGN ? _CLOCK_ASIGN.date_start ? _CLOCK_ASIGN.date_start.split(';').length : 0 : 0;

            var date_start = _CLOCK ? _CLOCK.date_start ? _CLOCK.date_start.split(';') : [] : [];
            var resolver_context = _CLOCK ? _CLOCK.resolver_context ? _CLOCK.resolver_context.split(';') : [] : [];
            for (let i = 0; i < asign_length; i++) {
                date_start[i] = date_start[i] ?? '';
                resolver_context[i] = resolver_context[i] ?? '';
                if (index == i) date_start[i] = date;
                if (index == i) resolver_context[i] = review;
            }

            let formDataClock = new FormData();
            formDataClock.set('date_start', date_start.join(';'));
            formDataClock.set('resolver_context', resolver_context.join(';'));
            formDataClock.set('state', state);
            formDataClock.set('version', 200);

            manage_clock(false, state, formDataClock, 200, index);
        }

        let manage_clock = (useMySwal, findOne, formDataClock, altVersion, closeIndex) => {
            var _CHILD = _GET_CLOCK_STATE_VERSION(findOne, altVersion ?? currentVersionR);

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
        return (
            <div className="record_lar_evaluation container">
                <h3 className="py-3" >3.1. Observaciones</h3>
                {_COMPOENTN_CORRECTIONS_HISTORIC()}
                {_COMPONENT_CORRECTIONS()}
                <div className="row text-center">
                    <label className='fw-bold my-2'>GENERAR PDFS</label>
                    <div className="col">
                        <RECORD_LAW_PDF
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            currentRecord={currentRecord}
                            currentVersionR={currentVersionR}
                            swaMsg={swaMsg} />
                    </div>
                </div>
                <h3 className="py-3" >3.2. Evaluar Viabilidad</h3>
                {_COMPONENT_REVIEW()}
            </div >
        );
    }
}

export default RECORD_LAW_EVALUATION;