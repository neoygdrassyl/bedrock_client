import React, { Component } from 'react';
import FUNService from '../../../services/fun.service'
import { MDBBtn, MDBCard, MDBCardBody, MDBTypography } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DCO_LIS from '../../../components/jsons/fun6DocsList.json'
import { _FUN_1_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER } from '../../../components/customClasses/funCustomArrays'

import FUN_DOC_CONFIRMLEGAL from './components/fun_doc_confirmlegal';
import FUN_MODULE_NAV from './components/fun_moduleNav';
import FUN_VERSION_NAV from './components/fun_versionNav';
import FUN_CHECKLIST_N from './components/fun_checklist_n';
import FUN_PDF_CHECK from './components/fun_pdf_check';
import FUN_SERVICE from '../../../services/fun.service';
import Collapsible from 'react-collapsible';
import FUN_DOC_CONFIRM_INCOMPLETE from './components/fun_doc_confirminc';
import FUN_C_CLOCKS from './components/fun_c_clocks.component';
import moment from 'moment';
import submitService from '../../../services/submit.service';
import { GEM_CODE_LIST } from '../../../components/customClasses/typeParse';

const MySwal = withReactContent(Swal);
class FUNC extends Component {
    constructor(props) {
        super(props);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.state = {
            pqrsxfun: false,
            VRDocs: [],
            load: false,
            loadVR: false
        };
    }
    requestUpdate(id, isGlobal) {
        if (isGlobal) this.retrieveItem(id);
        else this.props.requestUpdate(id);
    }
    componentDidMount() {
        this.retrieveItem(this.props.currentId);
        
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
                this.retrievePQRSxFUN(response.data.id_public);
                this.setVRList(response.data.id_public);
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
    setVRList(id_public) {
        if (!id_public) return;
        if (this.state.loadVR) return;
        submitService.getIdRelated(id_public).then(response => {
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
                            type: value.list_type || 0,
                        })
                    })
                })
            })
            this.setState({ VRDocs: newList, load: true })
        })

    };
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { currentItem, VRDocs } = this.state;
        const MySwal = withReactContent(Swal);

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
        let _SET_CHILD_C = () => {
            var _CHILD = currentItem.fun_cs;
            var _CURRENT_VERSION = currentItem.version - 1;
            var _CHILD_VARS = {
                item_c0: "",
                item_c1: "",
                item_c2: "",
                item_c3: "",
                item_c4: "",
                item_c5: "",
                item_c6: "",
                item_c7: "",
                item_c8: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_c0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_c1 = _CHILD[_CURRENT_VERSION].worker;
                    _CHILD_VARS.item_c2 = _CHILD[_CURRENT_VERSION].date;
                    _CHILD_VARS.item_c3 = _CHILD[_CURRENT_VERSION].condition;
                    _CHILD_VARS.item_c4 = _CHILD[_CURRENT_VERSION].details;
                    _CHILD_VARS.item_c5 = _CHILD[_CURRENT_VERSION].reciever_name;
                    _CHILD_VARS.item_c6 = _CHILD[_CURRENT_VERSION].reciever_date;
                    _CHILD_VARS.item_c7 = _CHILD[_CURRENT_VERSION].reciever_id;
                    _CHILD_VARS.item_c8 = _CHILD[_CURRENT_VERSION].reciever_actor;
                }
            }

            return _CHILD_VARS;
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
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_REVIEW = () => {
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
        }
        // DATA CONVERTER
        let _FIND_IN_VRDOCS = (code) => {
            if(!code) return false;
            let FOUND_CODE = VRDocs.find(vr => code.includes(vr.code));
            return FOUND_CODE;
        }
        let BUILD_LIST = (concat) => {
            const _FUN_1 = _GET_CHILD_1();
            let list = GEM_CODE_LIST(_FUN_1, concat)
            return list
        }
        let _ALLOW_REVIEW = () => {
            let FUN_R = _GET_FUN_R();
            if (!FUN_R) return false;
            let CHECK = FUN_R.checked ? FUN_R.checked.split(',') : [];
            let REVIEWS = FUN_R.review ? FUN_R.review.split(',') : [];
            let R_CODES = FUN_R.code ? FUN_R.code.split(',') : [];
            let CODES = BUILD_LIST(true);
            let _ALLOW = CODES.every((c, i) => {
                let R = REVIEWS.find((r) => { return r.includes(c); })
                let r_i = R_CODES.findIndex(r => r.includes(c));
                if (CHECK[r_i] == 2) return true;
                let vr = _FIND_IN_VRDOCS(R);
                let cond2 = CHECK[r_i] == 1 || CHECK[r_i] == 2 || vr;
                return cond2;
               
            })
            return _ALLOW;
            
            
            //let FUN_R = _GET_FUN_R();
            //if (!FUN_R) return false;
            //let CHECK = FUN_R.checked ? FUN_R.checked.split(',') : [];
            
            //return CHECK.every(c => c == 1 || c == 2);
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
        let _FIND_LAST_VRDOCS = () => {
            let last_date = false;
            VRDocs.map(vr => {
                if(vr.type != 1) return
                if (last_date && moment(vr.date).isAfter(last_date)) last_date = vr.date;
                if (!last_date) last_date = vr.date;
            })
            return last_date;
        }
        let _GET_CLOCK_STATE = (_state) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }

        function _SET_MISSING_FUN_R() {
            let _FUN_R = _GET_CHILD_REVIEW();
            let fun_r = _FUN_R ? _FUN_R.code ? _FUN_R.code.split(',') : [] : [];
            let fun_rc = _FUN_R ? _FUN_R.checked ? _FUN_R.checked.split(',') : [] : [];
            let dooc_sting = '';
            let _i = 1;

            fun_rc.map((rew, i) => {
                if (rew == 0) {
                    let str = DCO_LIS[fun_r[i]];
                    dooc_sting += `${_i}. ${str}.\n`;
                    _i++;
                }
            })

            let text_area_html = document.getElementById('c_46');
            text_area_html.value = dooc_sting;
        }
        //  MIX COMPONENT AND JSX, MAYBE IN THE FUTURE I WILL BE ORGANISING THIS, MAYBE NOT...
        let _SET_CHILD_1_C = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_1 = _FUN_1_PARSER(_CHILD[_CURRENT_VERSION].tipo);
                    _CHILD_VARS.item_2 = _FUN_2_PARSER(_CHILD[_CURRENT_VERSION].tramite);
                    _CHILD_VARS.item_3 = _FUN_3_PARSER(_CHILD[_CURRENT_VERSION].m_urb);
                    _CHILD_VARS.item_4 = _FUN_4_PARSER(_CHILD[_CURRENT_VERSION].m_sub);
                    _CHILD_VARS.item_5 = _FUN_5_PARSER(_CHILD[_CURRENT_VERSION].m_lic);
                }
            }
            return <>
                <fieldset className="p-3">
                    <legend className="my-2 px-3 text-uppercase Collapsible" id="func_1"><h4 className="mt-2">1. Identificación de la Solicitud</h4></legend>
                    <div className="row mb-3">
                        <div className="col-6">
                            <label>1.1 Tipo de Solicitud</label>
                            <textarea class="form-control" rows="3" defaultValue={_CHILD_VARS.item_1} disabled></textarea>
                        </div>
                        <div className="col-6">
                            <label>1.2 Objeto del Tramite</label>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_2} disabled />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-6">
                            <label>1.3 Modalidad Licencia de Urbanización</label>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_3} disabled />
                        </div>
                        <div className="col-6">
                            <label>1.4 Modalidad Licencia de Subdivisión</label>
                            <input type="text" class="form-control" defaultValue={_CHILD_VARS.item_4} disabled />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-6">
                            <label>1.5 Modalidad Licencia de Construcción</label>
                            <textarea class="form-control" rows="3" defaultValue={_CHILD_VARS.item_5} disabled></textarea>
                        </div>
                        <div className="col-6">

                        </div>
                    </div>
                </fieldset>
            </>
        }

        let _SET_CHILD_53_C = () => {
            var _CHILD = currentItem.fun_53s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_530: "",
                item_5311: "",
                item_5312: "",
                item_532: "",
                item_533: "",
                item_534: "",
                item_535: "",
                item_536: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_530 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name;
                    _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname;
                    _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number;
                    _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role;
                    _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number;
                    _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email;
                    _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address;
                }
            }

            return <>
                <fieldset className="p-3">
                    <legend className="my-2 px-3 text-uppercase Collapsible" id="func_2"><h4 className="mt-2">2. IDENTIFICACIÓN DEL SOLICITANTE</h4></legend>
                    <div className="row mb-3">
                        <div className="col-6">
                            <label>Nombres</label>
                            <input type="text" class="form-control" id="c_531" disabled
                                defaultValue={_CHILD_VARS.item_5311 + " " + _CHILD_VARS.item_5312} />
                        </div>
                        <div className="col-6 ">
                            <label>Número de Contacto</label>
                            <input type="text" class="form-control" id="c_536" disabled
                                defaultValue={_CHILD_VARS.item_534} />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-6">
                            <label>Dirección de Correspondencia</label>
                            <input type="text" class="form-control" id="c_534" disabled
                                defaultValue={_CHILD_VARS.item_536} />
                        </div>
                        <div className="col-6">
                            <label>Correo Electrónico</label>
                            <input type="text" class="form-control" id="c_535" disabled
                                defaultValue={_CHILD_VARS.item_535} />
                        </div>
                    </div>
                </fieldset>
            </>
        }

        let _SET_CHILD_C_C = () => {
            var _CHILD = currentItem.fun_cs;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_c0: "",
                item_c1: "",
                item_c2: "",
                item_c3: "",
                item_c4: "",
                item_c5: "",
                item_c6: "",
                item_c7: "",
                item_c8: "",
                item_c9: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_c0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_c1 = _CHILD[_CURRENT_VERSION].worker;
                    _CHILD_VARS.item_c2 = _CHILD[_CURRENT_VERSION].date;
                    _CHILD_VARS.item_c3 = _CHILD[_CURRENT_VERSION].condition;
                    _CHILD_VARS.item_c4 = _CHILD[_CURRENT_VERSION].details;
                    _CHILD_VARS.item_c5 = _CHILD[_CURRENT_VERSION].reciever_name;
                    _CHILD_VARS.item_c6 = _CHILD[_CURRENT_VERSION].reciever_date;
                    _CHILD_VARS.item_c7 = _CHILD[_CURRENT_VERSION].reciever_id;
                    _CHILD_VARS.item_c8 = _CHILD[_CURRENT_VERSION].reciever_actor;
                    _CHILD_VARS.item_c9 = _CHILD[_CURRENT_VERSION].legal_date;
                }
            }
            const ALLOW_REVIEW = _ALLOW_REVIEW();
            const LAST_VR_DATE = _FIND_LAST_VRDOCS();
            const LYDF_DATE = _CHILD_VARS.item_c9 || null;

            return <> <input type="hidden" id="f_c0" defaultValue={_CHILD_VARS.item_c0} />
                <fieldset className="p-3">
                    <legend className="my-2 px-3 text-uppercase Collapsible" id="func_3"><h4 className="mt-2">3. IDENTIFICACIÓN DEL ENCARGADO DE LA REVISIÓN</h4></legend>
                    <div className="row">
                        <div className="col-6">
                            <label>Nombre Encargado de Revisión</label>
                            <input class="form-control mb-3" id="c_31" defaultValue={_CHILD_VARS.item_c1} />
                        </div>
                        <div className="col-6">
                            <label>No. Radicación</label>
                            <input type="text" class="form-control mb-3" id="c_33" disabled
                                defaultValue={currentItem.id_public} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <label>Fecha de Revisión</label>
                            <input type="date" class="form-control mb-3" max='2100-01-01' id="c_32"
                                defaultValue={_CHILD_VARS.item_c6} />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="p-3">
                    <legend className="my-2 px-3 text-uppercase Collapsible" id="func_4"><h4 className="mt-2">4. CONDICIÓN DE LA RADICACIÓN</h4></legend>
                    <div className="row  mb-3">
                        <div className="col-6">
                            <label>Estado de la radicación</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" value="1" name="c_41" required disabled={!ALLOW_REVIEW}
                                    defaultChecked={_CHILD_VARS.item_c3 == '1' ? true : false} />
                                <label class="form-check-label" for="flexCheckDefault">
                                    RADICACIÓN EN LEGAL Y DEBIDA FORMA
                                </label>
                            </div>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio" value="0" name="c_41"
                                    defaultChecked={_CHILD_VARS.item_c3 == '0' ? true : false} />
                                <label class="form-check-label" for="flexCheckChecked">
                                    RADICACIÓN INCOMPLETA
                                </label>
                            </div>
                            {!ALLOW_REVIEW ? <MDBTypography note noteColor='danger'>
                                <h3 className="text-justify text-dark">ADVERTENCIA</h3>
                                NO ES POSIBLE DECLARAR EN "LYDF" POR QUE FALTAN DOCUMENTOS POR APORTAR EN EL PUNTO 6
                            </MDBTypography> : ''}
                        </div>
                        <div className="col-6">
                            <label>Solicitante</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" value="A" name="c_42"
                                    defaultChecked={_CHILD_VARS.item_c8 == 'A' ? true : false} />
                                <label class="form-check-label" for="flexCheckDefault">
                                    TITULAR
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" value="B" name="c_42"
                                    defaultChecked={_CHILD_VARS.item_c8 == 'B' ? true : false} />
                                <label class="form-check-label" for="flexCheckChecked">
                                    APODERADO
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" value="C" name="c_42"
                                    defaultChecked={_CHILD_VARS.item_c8 == 'C' ? true : false} />
                                <label class="form-check-label" for="flexCheckChecked">
                                    MANDATARIO
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <label>Nombre</label>
                            <input type="text" class="form-control mb-3" id="c_43"
                                defaultValue={_CHILD_VARS.item_c5} />
                        </div>
                        <div className="col-6">
                            <label>Fecha Incompleto</label>
                            <input type="date" class="form-control mb-3" id="c_44" max='2100-01-01'
                                defaultValue={_CHILD_VARS.item_c2} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <label>CC/NIT</label>
                            <input type="text" class="form-control mb-3" id="c_45" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }}
                                defaultValue={_CHILD_VARS.item_c7} />
                        </div>
                        <div className="col-6">
                            <label>Fecha Legal y Debida Forma</label>
                            <input type="date" class="form-control mb-3" id="c_47" max='2100-01-01'
                                defaultValue={LYDF_DATE} />
                        </div>
                        <div className="col-12">
                            <label>Observaciones (Max 2000 Caracteres)</label>
                            <textarea class="form-control mb-3" rows="3" id="c_46" maxLength="2000"
                                defaultValue={_CHILD_VARS.item_c4}></textarea>
                        </div>
                    </div>
                </fieldset>
            </>
        }

        // COMPONENT JSX


        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();
        var formDataclock = new FormData();

        let save_c = (e) => {
            e.preventDefault();
            formData = new FormData();
            let version = currentVersion;
            let fun0Id = document.getElementById("f_0_c").value;
            formData.set('version', version);
            formData.set('fun0Id', fun0Id);
            let worker = document.getElementById("c_31").value;
            formData.set('worker', worker);
            let reciever_date = document.getElementById("c_32").value;
            if (reciever_date) formData.set('reciever_date', reciever_date);



            //  THESE ARE RADIOS
            let value = null;
            let radios = null;
            let condition;
            radios = document.getElementsByName("c_41");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    condition = radios[i].value
                }
            } formData.set('condition', condition);

            radios = document.getElementsByName("c_42");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('reciever_actor', value);

            //
            let reciever_name = document.getElementById("c_43").value;
            formData.set('reciever_name', reciever_name);
            let reciever_id = document.getElementById("c_45").value;
            formData.set('reciever_id', reciever_id);
            let details = document.getElementById("c_46").value;
            formData.set('details', details);
            let date = document.getElementById("c_44").value;
            if (date) formData.set('date', date);
            let legal_date = document.getElementById("c_47").value;
            if (legal_date) formData.set('legal_date', legal_date);

            manage_c(true);
            save_review(condition);
            save_clock(date, -1);
            save_clock(legal_date, 5);
        }
        let manage_c = (useMySwal) => {
            let _CHILD = _SET_CHILD_C();

            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            if (_CHILD.item_c0) {
                FUNService.update_c(_CHILD.item_c0, formData)
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
                            this.requestUpdate(currentItem.id, true);
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
                formData.set('fun0Id', currentItem.id);
                formData.set('version', currentVersion);
                FUNService.create_func(formData)
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
                            this.requestUpdate(currentItem.id, true);
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


        let save_review = (condition) => {
            if (currentItem.state >= -1 && currentItem.state <= 5) {
                formData = new FormData();
                let state = condition == 1 ? 5 : 1;
                formData.set('state', state);
                update_fun_0(true, false);
            }

        }
        let update_fun_0 = (useMySwal, closeModal) => {
            FUNService.update(currentItem.id, formData)
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
                            this.requestUpdate(currentItem.id);
                            this.props.requesRefresh();
                            if (closeModal) this.props.closeModal();
                        }
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

        let save_clock = (date, state) => {
            if (date) {
                let worker = document.getElementById("c_31").value;
                let desc = state == 5 ? "LEGAL Y DEBIDA FORMA" : "INCOMPLETO";

                formDataclock = new FormData();

                formDataclock.set('date_start', date);
                formDataclock.set('name', "Revision CHECKEO, revision " + currentVersion);
                formDataclock.set('desc', "Fue declarada como: " + desc + " por " + worker);
                formDataclock.set('state', state);

                manage_clock(false, state);
            }

        }
        let manage_clock = (useMySwal, findOne) => {
            var _CHILD = _GET_CLOCK_STATE(findOne);
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
                FUNService.update_clock(_CHILD.id, formDataclock)
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
                                this.requestUpdate(currentItem.id);
                                this.props.requesRefresh();
                            }
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
                FUNService.create_clock(formDataclock)
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
                            this.requestUpdate(currentItem.id);
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
            <div>
                {currentItem != null ? <>
                    <form onSubmit={save_c} id="app-form_c">
                        <input type="hidden" value={currentItem ? currentItem.id : ""} id="f_0_c" />
                        {_SET_CHILD_1_C()}
                        {_SET_CHILD_53_C()}
                        {_SET_CHILD_C_C()}
                        <div className="row text-center my-2">
                            <div className="col">
                                <button className="btn btn-success btn-sm"><i class="far fa-share-square"></i> GUARDAR CAMBIOS</button>
                            </div>
                            <div className="col">
                                <MDBBtn className="btn btn-primary btn-sm" onClick={() => _SET_MISSING_FUN_R()}><i class="fas fa-tasks"></i> CARGAR FALTANTES</MDBBtn>
                            </div>
                        </div>

                    </form>

                    <fieldset className="p-3">
                        <legend className='my-2 px-3 text-uppercase Collapsible' id="func_5">
                            <label className="app-p lead fw-normal text-uppercase">5. CONTROL DE LYDF</label>
                        </legend>

                        <FUN_C_CLOCKS
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={this.requestUpdate}
                        />

                        <Collapsible className='bg-light border border-info text-center' openedClassName='bg-light border border-info text-center' trigger={<label className="fw-normal text-info">CARTA - LEGAL Y DEBIDA FORMA</label>}>
                            <div className='text-start'>
                                <FUN_DOC_CONFIRMLEGAL
                                    translation={translation}
                                    swaMsg={swaMsg}
                                    globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    requestUpdate={this.requestUpdate}
                                    alert={true}
                                    edit />
                            </div>
                        </Collapsible>
                        <Collapsible className='bg-light border border-info text-center' openedClassName='bg-light border border-info text-center' trigger={<label className="fw-normal text-info">CARTA - INCOMPLETO</label>}>
                            <div className='text-start'>
                                <FUN_DOC_CONFIRM_INCOMPLETE
                                    translation={translation}
                                    swaMsg={swaMsg}
                                    globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    requestUpdate={this.requestUpdate}
                                    edit />
                            </div>
                        </Collapsible>
                    </fieldset>
                    <h3 class="text-uppercase text-center py-3" id="func_6">6. LISTA GENERAL DE CHEQUEO DE DOCUMENTOS</h3>
                    <FUN_CHECKLIST_N
                        translation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                    />
                    <fieldset className="p-3">
                        <legend className="my-2 px-3 text-uppercase bg-danger" id="func_pdf">
                            <label className="app-p lead fw-normal text-uppercase text-light">DESCARGAR PDF</label>
                        </legend>
                        <FUN_PDF_CHECK
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                        />
                    </fieldset>

                    {NAV_FUNC(currentItem.state)}
                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"check"}
                        NAVIGATION={this.props.NAVIGATION}
                        pqrsxfun={this.state.pqrsxfun}
                    />
                    <FUN_VERSION_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        NAVIGATION_VERSION={this.props.NAVIGATION_VERSION}

                    />
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACION...</h3></div>
                </fieldset>}
            </div>
        );
    }
}

const NAV_FUNC = (state) => {
    return (
        <div className="btn-navpqrs ">
            <div className="fung_nav">
                <MDBCard className="container-primary" border='dark'>
                    <MDBCardBody className="p-1">
                        <legend className="px-3 pt-2 text-uppercase bg-light text-center">
                            <h6>Menu de Navegacion</h6>
                        </legend>
                        <br />
                        <a href="#func_1">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>1. Identificacion de la Solicitud</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#func_2">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>2. IDENTIFICACION DEL SOLICITANTE</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#func_3">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3. ENCARGADO DE LA REVISION</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#func_4">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>4. CONDICION DE LA RADICACION</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#func_5">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>5. Generar Documento de Confirmacion</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#func_6">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>6. LISTA DE CHEQUEO DE DOCUMENTOS</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#func_pdf" >
                            <legend className="px-3 text-uppercase btn-danger">
                                <h6>DESCARGAR PDF</h6>
                            </legend>
                        </a>
                    </MDBCardBody>
                </MDBCard>
            </div>
        </div>
    );
}

export default FUNC;