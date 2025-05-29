import React, { Component } from 'react';
import { MDBBtn, MDBCard, MDBCardBody, MDBTypography } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import FUN_SERVICE from '../../../services/fun.service';

import RECORD_ARCSERVICE from '../../../services/record_arc.service';
import RECORD_LAW_SERVICE from '../../../services/record_law.service';
import RECORD_ENG_SERVICE from '../../../services/record_eng.service';

import FUN_VERSION_NAV from '../fun_forms/components/fun_versionNav';
import FUN_MODULE_NAV from '../fun_forms/components/fun_moduleNav';
import RECORD_ENG_PROFESIONALS from './eng/record_eng_profesionals.component';
import RECORD_ENG_DESC from './eng/record_eng_desc.component';
import RECORD_ENG_STEP_431 from './eng/record_eng_s_431.component';
import RECORD_ENG_STEP_432 from './eng/record_eng_s_432.component';
import RECORD_ENG_STEP_4323 from './eng/record_eng_4323.component';
import RECORD_ENG_SISMIC from './eng/record_eng_sismic.component'
import RECORD_ENG_REVIEW from './eng/record_eng_review.component';
import RECORD_ENG_STEP_433 from './eng/record_eng_433.component';
import RECORD_ENG_STEP_44 from './eng/record_eng_44.component';
import RECORD_ENG_STEP_433P from './eng/record_eng_4333p.componen';
import RECORD_ENG_DOCS_CHECK from './eng/record_eng_docs_check.component';
import RECORD_ENG_43 from './eng/record_eng_43.component';
import FUN_G_REPORTS from '../fun_forms/components/fun_g_reports.component';
import RECORD_LAW_DOCSCHECK from './law/record_law_docs_check';
import RECORD_ENG_DOCS_DESC from './eng/record_eng_docsDetail.component';
import RECORD_ENG_STEP_430 from './eng/record_eng_430.component';
import SUBMIT_SINGLE_VIEW from '../submit/submit_view.component';
import FUN_6_VIEW from '../fun_forms/fun_6.view';
import RECORDS_BINNACLE from './records_binnacles.component';
import funService from '../../../services/fun.service';
import { ENG_MANPOSTERIA } from './eng/recprd_eng_mamporteria';

// RECORDS


const MySwal = withReactContent(Swal);

class RECORD_ENG extends Component {
    constructor(props) {
        super(props);
        this.setItem_RecordArc = this.setItem_RecordArc.bind(this);
        this.loadArcSteps = this.loadArcSteps.bind(this);
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
            pqrsxfun: false,
            arcSteps: [],
        };
    }
    componentDidMount() {
        this.setItem_RecordArc();
        this.retrieveItem(this.props.currentId);
        this.loadArcSteps(this.props.currentId)
    }
    loadArcSteps(id) {
        RECORD_ARCSERVICE.getSteps(id)
            .then(response => {
                if (response.data.length < 1) {
                    this.setState({
                        arcSteps: [],
                    });
                } else {
                    this.setState({
                        arcSteps: response.data.record_arc_steps,
                    });
                }
            })
            .catch(e => {
                console.log(e);
            });
    }
    setItem_RecordArc() {
        RECORD_ENG_SERVICE.findIdRelated(this.props.currentId)
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
        RECORD_ENG_SERVICE.findIdRelated(id)
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
        this.retrieveItem(id);
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
                this.retrievePQRSxFUN(response.data.id_public);
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
    navigation_version = (STEP) => {
        switch (STEP) {
            case "minus":
                this.setState({ currentVersionR: this.state.currentVersionR - 1 });
                break;
            case "plus":
                this.setState({ currentVersionR: this.state.currentVersionR + 1 });
                break;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { loaded, currentRecord, currentVersionR, currentItem, arcSteps } = this.state;
        const title = { 0: '', 1: 'ESTUDIO', 2: 'CERTIFICACIÓN' }
        var formData = new FormData();
        const STEP_PROVIDER = () => {
            let steps = [
                { 'Estudio Geotécnico / Suelos': 1 },
                { 'Peritaje Estructural': 1 },
                { 'Paso 1: Pre dimensionamiento y coordinación con otros profesionales': 1 },
                { 'Paso 2: Evaluación de las solicitudes definitivas': 1 },
                { 'Paso 3: Obtención del nivel de amenaza sísmica y valores de Aa y Av': 1 },
                { 'Paso 4: Movimiento sísmicos de diseño': 1 },
                { 'Paso 5: Características de la estructuración y del material estructural empleado': 1 },
                { 'Paso 6: Grado de irregularidad de la estructura y procedimiento de análisis': 1 },
                { 'Paso 7: Determinación de las fuerzas sísmicas': 1 },
                { 'Paso 8: Análisis sísmico de la estructura. Aplicación de los movimientos sísmicos de diseño (Cap. A.3)': 1 },
                { 'Paso 9: Desplazamientos horizontales. Se evalúan los desplazamientos horizontales': 1 },
                { 'Paso 10: Verificación de las derivas. Comprobar que las derivas no excedan los límites del (Cap. A.6)': 1 },
                { 'Paso 11: Combinación de las diferentes solicitudes': 1 },
                { 'Paso 12: Diseño de los elementos estructurales': 1 },
            ];
            if (currentRecord.category === 3) steps.push({ 'Paso 13: Revisión de los elementos de concreto contra la resistencia al fuego': 1 });
            steps.push({ 'Planos Estructurales': 1 });
            if (currentRecord.category === 3) steps.push({ 'Edificaciones de Mamposterías Titulo E': 1 });
            return steps
        }


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
        let _GET_CHILD_52 = () => {
            var _CHILD = currentItem.fun_52s;
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
        let new_record_eng = () => {
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);
            formData.set('version', 1);
            RECORD_ENG_SERVICE.create(formData)
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
        let selectCategory = () => {
            formData = new FormData();
            let formData0 = new FormData();
            let value = document.getElementById('r_e_select_category').value

            let currentRules = currentItem ? currentItem.rules ? currentItem.rules.split(';') : [] : [];;
            if (value == 'rule') {
                currentRules[1] = 1;
                value = 0;
            }
            else currentRules[1] = 0;
            formData0.set('rules', currentRules.join(';'));

            funService.update(currentItem.id, formData0).then(response => {
                if (response.data === 'OK') this.retrieveItem(currentItem.id)
            });

            formData.set('category', value);
            RECORD_ENG_SERVICE.update(currentRecord.id, formData)
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
        let selectSubCategory = (useSwal) => {
            formData = new FormData();
            var checks = [];
            var checks_2 = document.getElementsByName('subcategory_check');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].checked ? 1 : 0)
            }
            formData.set('subcategory', checks.join(';'));
            RECORD_ENG_SERVICE.update(currentRecord.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.requestUpdateRecord(currentItem.id)
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
        let PARENT_STEP_PROVIDER = () => {
            const SUBCATEGORIES = currentRecord.subcategory ? currentRecord.subcategory.split(';') : [];
            return <div className="p-2">
                {STEP_PROVIDER().map((value, index) => {
                    let cbdv = SUBCATEGORIES[index] == '1' ?? true;
                    return <div className="row border">
                        <div className="col-1">
                            <div class="custom-control custom-switch">
                                <div class="form-check form-switch text-end">
                                    <input class="form-check-input" type="checkbox" defaultChecked={cbdv}
                                        name={'subcategory_check'} onChange={() => selectSubCategory(false)} />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div class="input-group">
                                <label className="fw-bold">{Object.keys(value)}</label>
                            </div>
                        </div>

                    </div>
                })}
            </div>
        }

        return (
            <div className="record_eng container">
                {currentItem != null ? <>
                    {loaded ? <>
                        {currentRecord
                            ? <>



                                <legend className="my-2 px-3 text-uppercase Collapsible text-start" id="record_eng_41">
                                    <label className="app-p lead fw-normal text-uppercase">4.1 Revisión Documentos y profesionales requeridos para la actuación urbanística solicitada.</label>
                                </legend>

                                <legend className="my-2 px-3 text-uppercase bg-light" id="record_eng_410">
                                    <label className="app-p lead fw-normal text-uppercase">4.1.1 LISTA DE CHECKEO</label>
                                </legend>

                                <RECORD_LAW_DOCSCHECK
                                    _FUN_1={_GET_CHILD_1()}
                                    _FUN_6={_GET_CHILD_6()}
                                    _FUN_R={_GET_CHILD_REVIEW()}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    requestUpdate={this.requestUpdate}
                                    readOnly={false}
                                    docsScope={'eng'} />

                                <RECORD_ENG_PROFESIONALS
                                    _FUN_52={_GET_CHILD_52()}
                                    _FUN_6={_GET_CHILD_6()}
                                    currentItem={currentItem}
                                    currentRecord={currentRecord}
                                    requestUpdate={this.requestUpdate}
                                    useCB
                                    profs={[
                                        ['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'],
                                        ['DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES'],
                                        ['INGENIERO CIVIL GEOTECNISTA'],
                                        ['INGENIERO TOPOGRAFO Y/O TOPÓGRAFO'],
                                        ['REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES'],
                                    ]}
                                />

                                <legend className="my-2 px-3 text-uppercase bg-light" id="record_eng_411">
                                    <label className="app-p lead fw-normal text-uppercase">4.1.2 DOCUMENTOS DIGITALIZADOS</label>
                                </legend>


                                <FUN_6_VIEW
                                    translation={translation}
                                    swaMsg={swaMsg}
                                    globals={globals}
                                    currentItem={currentItem}
                                    currentId={this.props.currentId}
                                    currentVersion={currentVersion}
                                    requestUpdate={this.requestUpdate}
                                    readOnly
                                />

                                <legend className="my-2 px-3 text-uppercase bg-light" id="record_eng_412">
                                    <label className="app-p lead fw-normal text-uppercase">4.1.3 DOCUMENTOS APORTADOS POR VENTANILLA ÚNICA</label>
                                </legend>

                                <SUBMIT_SINGLE_VIEW
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    id_related={currentItem.id_public}
                                />



                                <FUN_G_REPORTS
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion} noLaw noArc
                                />

                                <legend className="my-2 px-3 text-uppercase bg-light" id="record_eng_430">
                                    <label className="app-p lead fw-normal text-uppercase">4.1.4 REVISION DE PLANOS, ESTUDIOS Y MEMORIAS</label>
                                </legend>

                                <RECORD_ENG_STEP_430
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={this.requestUpdate}
                                    requestUpdateRecord={this.requestUpdateRecord}
                                />

                                <div className="row border my-2 py-4 border border-warning" id="re_cc" style={{ backgroundColor: 'Gainsboro', borderWidth: '3px' }}>
                                    <div className="col-5 p-1 mt-1 text-end">
                                        <h3 className="fw-bold text-uppercase">CATEGORIA DEL INFORME </h3>
                                    </div>
                                    <div className="col-4">
                                        <select className="form-select" defaultValue={currentRecord.category ?? 0} id="r_e_select_category"
                                            onChange={() => selectCategory()}>
                                            <option selected={currentRecord.category == null ? true : false} disabled value="0">SELECCIONE UNA CATEGORIA...</option>
                                            <option value="rule">NO REQUIERE ESTUDIO</option>
                                            <option value="2">CERTIFICACIÓN</option>
                                            <option value="1">ESTUDIO</option>
                                           
                                            {
                                                //  <option value="3">ESTUDIO 2.0</option>
                                            }
                                        </select>
                                    </div>
                                </div>

                                <legend className="my-2 px-3 text-uppercase Collapsible text-center">
                                    <label className="app-p lead fw-normal text-uppercase">{title[currentRecord.category] ?? 'DEBE SELECCIONAR UNA CATEGORIA'}</label>
                                </legend>

                                {currentRecord.category != null
                                    ?
                                    <>



                                        <legend className="my-2 px-3 text-uppercase Collapsible" id="record_eng_42">
                                            <label className="app-p lead fw-normal text-uppercase">4.2 DESCRIPCIÓN DEL PROYECTO</label>
                                        </legend>
                                        <RECORD_ENG_DESC
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            requestUpdate={this.requestUpdate}
                                            requestUpdateRecord={this.requestUpdateRecord}
                                            category={currentRecord.category}
                                            arcSteps={arcSteps}
                                        />
                                        <RECORDS_BINNACLE translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            SERVICE={RECORD_LAW_SERVICE}
                                            requestUpdateRecord={this.requestUpdateRecord}
                                            AIM={"Jurídico"}
                                            readOnly
                                        />
                                        <RECORDS_BINNACLE translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            SERVICE={RECORD_ARCSERVICE}
                                            requestUpdateRecord={this.requestUpdateRecord}
                                            AIM={"Arquitectura"}
                                            PATH={"record_arc"}
                                            readOnly
                                        />
                                        <RECORDS_BINNACLE translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            SERVICE={RECORD_ENG_SERVICE}
                                            requestUpdateRecord={this.requestUpdateRecord}
                                            AIM={"Estructural"}
                                        />
                                        {currentRecord.category == 0
                                            ?
                                            <>
                                                <legend className="my-2 px-3 text-uppercase Collapsible" id="record_eng_43">
                                                    <label className="app-p lead fw-normal text-uppercase">4.3 Revisión general</label>
                                                </legend>

                                                <RECORD_ENG_43
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                />
                                            </>
                                            : ""}

                                        {currentRecord.category == 1
                                            ?
                                            <>

                                                <legend className="my-2 px-3 text-uppercase Collapsible" id="record_eng_43">
                                                    <label className="app-p lead fw-normal text-uppercase">4.3 REVISIÓN DEL PROYECTO</label>
                                                </legend>
                                                {PARENT_STEP_PROVIDER()}





                                                <RECORD_ENG_STEP_431
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                />

                                                <RECORD_ENG_STEP_433P
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                />

                                                <RECORD_ENG_STEP_432
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                />
                                                <RECORD_ENG_STEP_4323
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                />

                                                <RECORD_ENG_SISMIC
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                />
                                                <RECORD_ENG_STEP_433
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                />

                                                <legend className="my-2 px-3 text-uppercase Collapsible" id="record_eng_44">
                                                    <label className="app-p lead fw-normal text-uppercase">4.4 REVISIÓN DEL PROYECTO</label>
                                                </legend>
                                                <RECORD_ENG_STEP_44
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                />
                                            </>
                                            : ""}

                                        {currentRecord.category == 3
                                            ?
                                            <>

                                                <legend className="my-2 px-3 text-uppercase Collapsible" id="record_eng_43">
                                                    <label className="app-p lead fw-normal text-uppercase">4.3 REVISIÓN DEL PROYECTO</label>
                                                </legend>
                                                {PARENT_STEP_PROVIDER()}

                                                <RECORD_ENG_STEP_431
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                    version={2}
                                                />

                                                {
                                                    // 4.3.2 Peritaje Estructural
                                                }
                                                <RECORD_ENG_STEP_433P
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                />

                                                {
                                                    // Paso 1
                                                    // Paso 2
                                                }
                                                <RECORD_ENG_STEP_432
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                    version={2}
                                                />

                                                {
                                                    // Paso 3
                                                    // Paso 4
                                                    // Paso 5
                                                    // Paso 6
                                                    // Paso 7
                                                }
                                                <RECORD_ENG_STEP_4323
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                    version={2}
                                                />

                                                {
                                                    // Paso 8
                                                }
                                                <RECORD_ENG_SISMIC
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                    version={2}
                                                />

                                                {
                                                    // 4.3.3 Planos Estructurales
                                                }
                                                <RECORD_ENG_STEP_433
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                    version={2}
                                                />

                                                <ENG_MANPOSTERIA
                                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                                    currentItem={currentItem}
                                                    currentVersion={currentVersion}
                                                    currentRecord={currentRecord}
                                                    currentVersionR={currentVersionR}
                                                    requestUpdate={this.requestUpdate}
                                                    requestUpdateRecord={this.requestUpdateRecord}
                                                    version={2}
                                                />

                                            </>
                                            : ""}


                                        <legend className="my-2 px-3 text-uppercase Collapsible" id="record_eng_45">
                                            <label className="app-p lead fw-normal text-uppercase">4.5 APROBACIÓN</label>
                                        </legend>

                                        <RECORD_ENG_REVIEW
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            requestUpdate={this.requestUpdate}
                                            requestUpdateRecord={this.requestUpdateRecord}
                                        />
                                    </>

                                    : ""}



                                {/* {NAV_FUNA(currentRecord)} */}
                            </> : <>

                                <fieldset className="p-3">
                                    <div className="text-center">
                                        <button className="btn btn-info btn-lg" onClick={() => new_record_eng()}> GENERAR INFORME EN BLANCO</button>
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
                        FROM={"record_eng"}
                        NAVIGATION={this.props.NAVIGATION}
                        pqrsxfun={this.state.pqrsxfun}
                    />
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                </fieldset>}
            </div >
        );
    }
}

const NAV_FUNA = (currentRecord) => {
    return (
        <div className="btn-navpqrs">
            <div className="fung_nav">
                <MDBCard className="container-primary" border='dark'>
                    <MDBCardBody className="p-1">
                        <legend className="px-3 pt-2 text-uppercase bg-light text-center">
                            <h6>Menu de Navegación</h6>
                        </legend>
                        <br />
                        <a href="#record_eng_41">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>4.1 Revisión Documentos</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#re_cc">
                            <legend className="px-3 text-uppercase btn-warning">
                                <h6>CATEGORIA DEL INFORME</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_eng_42">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>4.2 DESCRIPCIÓN DEL PROYECTO</h6>
                            </legend>
                        </a>
                        <br />
                        {currentRecord.category != null
                            ?
                            <>
                                {currentRecord.category == 1
                                    ?
                                    <>
                                        <a href="#record_eng_43">
                                            <legend className="px-3 text-uppercase btn-info">
                                                <h6>4.3 REVISIÓN DEL PROYECTO</h6>
                                            </legend>
                                        </a>
                                        <br />
                                        <a href="#record_eng_430">
                                            <legend className="px-3 text-uppercase btn-light">
                                                <h6>4.3.0 REVISION DE PLANOS, ESTUDIOS Y MEMORIAS</h6>
                                            </legend>
                                        </a>
                                        <br />
                                        <a href="#record_eng_431">
                                            <legend className="px-3 text-uppercase btn-light">
                                                <h6>4.3.1 ESTUDIO GEOTÉCNICO</h6>
                                            </legend>
                                        </a>
                                        <br />
                                        <a href="#record_eng_432">
                                            <legend className="px-3 text-uppercase btn-light">
                                                <h6>4.3.2 MEMORIAS DE CALCULO</h6>
                                            </legend>
                                        </a>
                                        <br />
                                        <a href="#record_eng_432P">
                                            <legend className="px-3 text-uppercase btn-light">
                                                <h6>4.3.2 Peritaje Estructural</h6>
                                            </legend>
                                        </a>
                                        <br />
                                        <a href="#record_eng_433">
                                            <legend className="px-3 text-uppercase btn-light">
                                                <h6>4.3.3 Planos Estructurales</h6>
                                            </legend>
                                        </a>
                                        <br />
                                        <a href="#record_eng_44">
                                            <legend className="px-3 text-uppercase btn-info">
                                                <h6>4.4 Revisión Proyecto</h6>
                                            </legend>
                                        </a>
                                        <br />
                                    </>
                                    : ""}
                            </>
                            : ""}

                        <a href="#record_eng_45">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>4.5 APROBACIÓN</h6>
                            </legend>
                        </a>
                    </MDBCardBody>
                </MDBCard>
            </div>
        </div>
    );
}

export default RECORD_ENG;