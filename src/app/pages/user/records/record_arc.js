import React, { Component } from 'react';
import { MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBBtn, MDBBreadcrumb, MDBBreadcrumbItem } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import RECORD_ARCSERVICE from '../../../services/record_arc.service';
import RECORD_LAW_SERVICE from '../../../services/record_law.service';
import RECORD_ENG_SERVICE from '../../../services/record_eng.service';

import FUN_VERSION_NAV from '../fun_forms/components/fun_versionNav';
import FUN_MODULE_NAV from '../fun_forms/components/fun_moduleNav';
import FUN_SERVICE from '../../../services/fun.service';

// RECORDS
import RECORD_ARC_31 from './arc/record_arc_31';
import RECORD_ARC_32 from './arc/record_arc_32';
import RECORD_ARC_33 from './arc/record_arc_33';
import RECORD_ARC_34 from './arc/record_arc_34';
import RECORD_ARC_35 from './arc/record_arc_35';
import RECORD_ARC_36 from './arc/record_arc_36';
import RECORD_ARC_38 from './arc/record_arc_38';
import RECORD_ARC_EXTRA_1 from './arc/record_arc_extra_1';
import RECORD_ARC_EXTRA_2 from './arc/record_arc_extra_2';
import RECORD_ARC_37 from './arc/record_arc_37';
import RECORD_ENG_PROFESIONALS from './eng/record_eng_profesionals.component';
import RECORD_LAW_DOCSCHECK from './law/record_law_docs_check';
import FUN_6_VIEW from '../fun_forms/fun_6.view';
import SUBMIT_SINGLE_VIEW from '../submit/submit_view.component';
import RECORD_ARC_GEN_REVIEW from './arc/record_arc_gen_review.component';
import RECORDS_BINNACLE from './records_binnacles.component';
import RECORD_ARC_AREAS from './arc/record_arc_areas.component';
import RECORD_ARC_DESC from './arc/record_arc_desc';
import RECORD_ARC_CONTROL from './arc/record_arc_control.component';
import RECORD_ARC_GEN_2_REVIEW from './arc/record_arc_gem2_review.component';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

class RECORD_ARC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
            pqrsxfun: false,
            currentItem: null,
        };
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.retrievePQRSxFUN = this.retrievePQRSxFUN.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.setItem_RecordArc = this.setItem_RecordArc.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
    }
    componentDidMount() {
        this.setItem_RecordArc();
        this.retrieveItem(this.props.currentId);
    }

    setItem_RecordArc(id) {
        RECORD_ARCSERVICE.getRecord(id || this.props.currentId)
            .then(response => {
                let record_arc = response.data.record_arc
                record_arc.record_arc_steps = response.data.record_arc_steps;
                record_arc.record_arc_33_areas = response.data.record_arc_33_areas;
                record_arc.record_arc_34_ks = response.data.record_arc_34_ks;
                record_arc.record_arc_34_gens = response.data.record_arc_34_gens;
                record_arc.record_arc_35_parkings = response.data.record_arc_35_parkings;
                record_arc.record_arc_36_infos = response.data.record_arc_36_infos;
                record_arc.record_arc_37s = response.data.record_arc_37s;
                record_arc.record_arc_35_locations = response.data.record_arc_35_locations;
                record_arc.record_arc_38s = response.data.record_arc_38s;
                
                this.setState({
                    currentRecord: record_arc,
                    currentVersionR: record_arc.version,
                    loaded: true,
                });
               
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
        this.setItem_RecordArc(id);
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

    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    loaded: true
                });
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
    requestUpdate(id) {
        this.retrieveItem(id);
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
        const { loaded, currentRecord, currentVersionR, currentItem } = this.state;
        var formData = new FormData();
        let subc = currentRecord ? currentRecord.subcategory ? currentRecord.subcategory.split(',') : [0, 0, 0, 0] : [0, 0, 0, 0]
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
        let _SUBCATEGORY_COMPONENT = () => {

            let subcategories = [
                { desc: 'ANÁLISIS DE LAS DETERMINANTES URBANAS DEL PREDIO', v: subc[0], id: 0, },
                { desc: 'PARQUEADEROS', v: subc[1], id: 1, },
                { desc: 'ESPACIO PUBLICO', v: subc[2], id: 2, },
                { desc: 'NSR10', v: subc[3], id: 3, },
            ]
            return <>
                <div className='row'>
                    <div className='col-10 ms-5'>
                        <label className='fw-bold text-uppercase'>3.2. Identificación de la Solicitud</label>
                    </div>
                    <div className='col text-end'>
                        <div class="custom-control custom-switch">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" checked readOnly disabled />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-10 ms-5'>
                        <label className='fw-bold text-uppercase'>3.3 Descripción de la Actuación Urbanística</label>
                    </div>
                    <div className='col'>
                        <div class="custom-control custom-switch">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" checked readOnly disabled />
                            </div>
                        </div>
                    </div>
                </div>
                {_GET_CHILD_1().item_1.includes("F")
                    ? <>
                        <div className='row'>
                            <div className='col-10 ms-5'>
                                <label className='fw-bold text-uppercase'>CONSIDERACIONES DECRETO 1077 DE 2015 FRENTE A LA PROCEDIBILIDAD DEL RECONOCIMIENTO</label>
                            </div>
                            <div className='col text-end'>
                                <div class="custom-control custom-switch">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" checked readOnly disabled />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-10 ms-5'>
                                <label className='fw-bold text-uppercase'>INTERVENCIÓN DE LA SECRETARIA DE PLANEACIÓN MUNICIPAL</label>
                            </div>
                            <div className='col'>
                                <div class="custom-control custom-switch">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" checked readOnly disabled />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </> : ''}
                {subcategories.map((itemm, i) => {
                    return <>
                        <div className='row'>
                            <div className='col-10 ms-5'>
                                <label className='fw-bold'>3.{i + 4}. {itemm.desc}</label>
                            </div>
                            <div className='col text-end'>
                                <div class="custom-control custom-switch">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" defaultChecked={itemm.v == '1' ? true : false}
                                            name={'sc_checbox'} onChange={() => update_subcategory(false)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                })}
                <div className='row'>
                    <div className='col-10 ms-5'>
                        <label className='fw-bold text-uppercase'>3.8 VIABILIDAD ARQUITECTÓNICA</label>
                    </div>
                    <div className='col'>
                        <div class="custom-control custom-switch">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" checked readOnly disabled />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        }


        let new_record_arc = () => {
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);
            formData.set('version', 1);
            RECORD_ARCSERVICE.create(formData)
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
        let update_subcategory = (useSwal) => {
            formData = new FormData();
            let sub_html = document.getElementsByName('sc_checbox');
            let subcategory = [];
            for (let i = 0; i < sub_html.length; i++) {
                const sub = sub_html[i];
                subcategory.push(sub.checked ? 1 : 0);
            }
            formData.set('subcategory', subcategory.join());
            RECORD_ARCSERVICE.update(currentRecord.id, formData)
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
        return (
            <div className="record_arc container">
                {currentItem != null ? <>
                    {loaded ? <>
                        {currentRecord
                            ? <>
                                <fieldset className="p-3">
                                    <legend className="my-2 px-3 text-uppercase Collapsible" id="record_arc_31">
                                        <label className="app-p lead fw-normal text-uppercase">3.1 DOCUMENTACIÓN Y PROFESIONALES DEL PROYECTO</label>
                                    </legend>
                                    <RECORD_LAW_DOCSCHECK
                                        _FUN_1={_GET_CHILD_1()}
                                        _FUN_6={_GET_CHILD_6()}
                                        _FUN_R={_GET_CHILD_REVIEW()}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        requestUpdate={this.requestUpdate}
                                        requestUpdateRecord={this.requestUpdateRecord}
                                        readOnly={false}
                                        docsScope={'arc'} />


                                    <RECORD_ENG_PROFESIONALS
                                        _FUN_52={_GET_CHILD_52()}
                                        _FUN_6={_GET_CHILD_6()}
                                        currentRecord={currentRecord}
                                        profs={[
                                            ['URBANIZADOR O CONSTRUCTOR RESPONSABLE', 'DIRECTOR DE LA CONSTRUCCION'],
                                            ['ARQUITECTO PROYECTISTA'],
                                        ]}
                                    />

                                    <legend className="my-2 px-3 text-uppercase bg-light" id="record_eng_411">
                                        <label className="app-p lead fw-normal text-uppercase">DOCUMENTOS DIGITALIZADOS</label>
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

                                    <legend className="my-2 px-3 text-uppercase bg-light" id="record_eng_411">
                                        <label className="app-p lead fw-normal text-uppercase">DOCUMENTOS APORTADOS POR VENTANILLA ÚNICA</label>
                                    </legend>

                                    <SUBMIT_SINGLE_VIEW
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        id_related={currentItem.id_public}
                                    />

                                </fieldset>
                                {_GLOBAL_ID == 'cb1' ?
                                    <fieldset className="p-3">
                                        <legend className="my-2 px-3 text-uppercase bg-success" id="record_arc_sub">
                                            <label className="app-p lead fw-normal text-light">CONTROL DE CONTENIDO</label>
                                        </legend>
                                        {_SUBCATEGORY_COMPONENT()}
                                    </fieldset>
                                    : ''}

                                <fieldset className="p-3">
                                    <legend className="my-2 px-3 text-uppercase Collapsible" id="record_arc_32">
                                        <label className="app-p lead fw-normal text-uppercase">3.2 Identificación de la Solicitud</label>
                                    </legend>
                                    <RECORD_ARC_32
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                    />
                                    <RECORDS_BINNACLE translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        SERVICE={RECORD_LAW_SERVICE}
                                        requestUpdateRecord={this.requestUpdateRecord}
                                        AIM={"Jurídico"}
                                        readOnly />
                                    <RECORDS_BINNACLE translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        SERVICE={RECORD_ARCSERVICE}
                                        requestUpdateRecord={this.requestUpdateRecord}
                                        AIM={"Arquitectura"}
                                        PATH={"record_arc"}
                                    />
                                    <RECORDS_BINNACLE translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        SERVICE={RECORD_ENG_SERVICE}
                                        requestUpdateRecord={this.requestUpdateRecord}
                                        AIM={"Estructural"}
                                        readOnly />


                                </fieldset>
                                {_GLOBAL_ID == 'cb1' ?
                                    <>

                                        <fieldset className="p-3">
                                            <legend className="my-2 px-3 text-uppercase Collapsible" id="record_arc_33">
                                                <label className="app-p lead fw-normal text-uppercase">3.3 Descripción de la Actuación Urbanística</label>
                                            </legend>
                                            <RECORD_ARC_33
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdateRecord={this.requestUpdateRecord}
                                                requestUpdate={this.requestUpdate}
                                                _FUN_R={_GET_CHILD_REVIEW()}
                                            />
                                        </fieldset>
                                        {_GET_CHILD_1().item_1.includes("F")
                                            ? <>
                                                <fieldset className="p-3">
                                                    <legend className="my-2 px-3 text-uppercase bg-success" id="record_arc_extra_1">
                                                        <label className="app-p lead fw-normal text-uppercase text-light">CONSIDERACIONES DECRETO 1077 DE 2015 FRENTE A LA PROCEDIBILIDAD DEL RECONOCIMIENTO. OBLIGATORIO</label>
                                                    </legend>
                                                    <RECORD_ARC_EXTRA_1
                                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                                        currentItem={currentItem}
                                                        currentVersion={currentVersion}
                                                        currentRecord={currentRecord}
                                                        currentVersionR={currentVersionR}
                                                        requestUpdateRecord={this.requestUpdateRecord}
                                                    />
                                                </fieldset>
                                                <fieldset className="p-3">
                                                    <legend className="my-2 px-3 text-uppercase bg-success" id="record_arc_extra_2">
                                                        <label className="app-p lead fw-normal text-uppercase text-light">INTERVENCIÓN DE LA SECRETARIA DE PLANEACIÓN MUNICIPAL. -SPM- INFORME VISITA AL PREDIO</label>
                                                    </legend>
                                                    <RECORD_ARC_EXTRA_2
                                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                                        currentItem={currentItem}
                                                        currentVersion={currentVersion}
                                                        currentRecord={currentRecord}
                                                        currentVersionR={currentVersionR}
                                                        requestUpdateRecord={this.requestUpdateRecord}
                                                    />
                                                </fieldset>

                                            </> : ""}
                                        {subc[0] == '1'
                                            ? <>
                                                <fieldset className="p-3">
                                                    <legend className="my-2 px-3 text-uppercase Collapsible" id="record_arc_34">
                                                        <label className="app-p lead fw-normal text-uppercase">3.4 ANÁLISIS DE LAS DETERMINANTES URBANAS DEL PREDIO</label>
                                                    </legend>
                                                    <RECORD_ARC_34
                                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                                        currentItem={currentItem}
                                                        currentVersion={currentVersion}
                                                        currentRecord={currentRecord}
                                                        currentVersionR={currentVersionR}
                                                        requestUpdateRecord={this.requestUpdateRecord}
                                                    />
                                                </fieldset>
                                            </>
                                            : ''}
                                        {subc[1] == '1'
                                            ? <>
                                                <fieldset className="p-3">
                                                    <legend className="my-2 px-3 text-uppercase Collapsible" id="record_arc_35">
                                                        <label className="app-p lead fw-normal text-uppercase">3.5 PARQUEADEROS</label>
                                                    </legend>
                                                    <RECORD_ARC_35
                                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                                        currentItem={currentItem}
                                                        currentVersion={currentVersion}
                                                        currentRecord={currentRecord}
                                                        currentVersionR={currentVersionR}
                                                        requestUpdateRecord={this.requestUpdateRecord}
                                                    />
                                                </fieldset>
                                            </>
                                            : ''}
                                        {subc[2] == '1'
                                            ? <>
                                                <fieldset className="p-3">
                                                    <legend className="my-2 px-3 text-uppercase Collapsible" id="record_arc_36">
                                                        <label className="app-p lead fw-normal text-uppercase">3.6 ESPACIO PUBLICO</label>
                                                    </legend>
                                                    <RECORD_ARC_36
                                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                                        currentItem={currentItem}
                                                        currentVersion={currentVersion}
                                                        currentRecord={currentRecord}
                                                        currentVersionR={currentVersionR}
                                                        requestUpdateRecord={this.requestUpdateRecord}
                                                    />
                                                </fieldset>
                                            </>
                                            : ''}
                                        {subc[3] == '1'
                                            ? <>
                                                <fieldset className="p-3">
                                                    <legend className="my-2 px-3 text-uppercase Collapsible" id="record_arc_37">
                                                        <label className="app-p lead fw-normal text-uppercase">3.7 NSR10</label>
                                                    </legend>
                                                    <RECORD_ARC_37
                                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                                        currentItem={currentItem}
                                                        currentVersion={currentVersion}
                                                        currentRecord={currentRecord}
                                                        currentVersionR={currentVersionR}
                                                        requestUpdateRecord={this.requestUpdateRecord}
                                                        requestUpdate={this.requestUpdate}
                                                    />
                                                </fieldset>
                                            </>
                                            : ''}
                                    </>
                                    :
                                    <fieldset className="p-3">

                                        <legend className="my-2 px-3 text-uppercase Collapsible" id="record_arc_32">
                                            <label className="app-p lead fw-normal text-uppercase">3.2.1 Antecedentes y Descripción del Proyecto a licencias</label>
                                        </legend>

                                        <RECORD_ARC_DESC
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            requestUpdateRecord={this.requestUpdateRecord}
                                            requestUpdate={this.requestUpdate}
                                        />
                                        <legend className="my-2 px-3 text-uppercase Collapsible mt-5" id="record_arc_34">
                                            <label className="app-p lead fw-normal text-uppercase">3.3 DATOS DE CONTROL</label>
                                        </legend>
                                        <RECORD_ARC_CONTROL
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            requestUpdateRecord={this.requestUpdateRecord}
                                            requestUpdate={this.requestUpdate}
                                            _FUN_R={_GET_CHILD_REVIEW()}
                                        />


                                        <legend className="my-2 px-3 text-uppercase Collapsible mt-5" id="record_arc_34">
                                            <label className="app-p lead fw-normal text-uppercase">3.4 EVALUACIÓN</label>
                                        </legend>
                                        <RECORD_ARC_GEN_REVIEW
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            requestUpdateRecord={this.requestUpdateRecord}
                                            requestUpdate={this.requestUpdate}
                                        />

                                        <RECORD_ARC_GEN_2_REVIEW
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            requestUpdateRecord={this.requestUpdateRecord}
                                            requestUpdate={this.requestUpdate}
                                        />
                                    </fieldset>
                                }



                                <fieldset className="p-3">
                                    <legend className="my-2 px-3 text-uppercase Collapsible" id="record_arc_38">
                                        <label className="app-p lead fw-normal text-uppercase">3.8 VIABILIDAD ARQUITECTÓNICA</label>
                                    </legend>
                                    <RECORD_ARC_38
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        requestUpdateRecord={this.requestUpdateRecord}
                                        requestUpdate={this.requestUpdate}
                                    />
                                </fieldset>

                                {/* {NAV_FUNA(_GET_CHILD_1())} */}
                            </> : <>

                                <fieldset className="p-3">
                                    <div className="text-center">
                                        <button className="btn btn-info btn-lg" onClick={() => new_record_arc()}> GENERAR INFORME EN BLANCO</button>
                                    </div>
                                </fieldset>

                            </>}
                    </> : <fieldset className="p-3" id="fung_0">
                        <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                    </fieldset>}
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
                        FROM={"record_arc"}
                        NAVIGATION={this.props.NAVIGATION}
                        pqrsxfun={this.state.pqrsxfun}
                        toggleSidebar={this.props.toggleSidebar}
                    />
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                </fieldset>}
            </div >
        );
    }
}

const NAV_FUNA = (_CHILD) => {
    return (
        <div className="btn-navpqrs">
            <div className="">
                <MDBCard className="container-primary" border='dark'>
                    <MDBCardBody className="p-1">
                        <legend className="px-3 pt-2 text-uppercase bg-light text-center">
                            <h6>Menu de Navegación</h6>
                        </legend>
                        <br />
                        <a href="#record_arc_31">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3.1 DOCUMENTACIÓN Y PROFESIONALES DEL PROYECTO</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_arc_32">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3.2 Identificación de la Solicitud</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_arc_33">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3.3 Descripción de la Actuación</h6>
                            </legend>
                        </a>
                        {_CHILD.item_1.includes("F")
                            ? <>
                                <br />
                                <a href="#record_arc_extra_1">
                                    <legend className="px-3 text-uppercase btn-success">
                                        <h6>CONSIDERACIONES DECRETO 1077</h6>
                                    </legend>
                                </a>
                                <br />
                                <a href="#record_arc_extra_2">
                                    <legend className="px-3 text-uppercase btn-success">
                                        <h6>INTERVENCIÓN DE LA SECRETARIA</h6>
                                    </legend>
                                </a>
                            </> : ""}
                        <br />
                        <a href="#record_arc_34">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3.4 ANÁLISIS DETERMINANTES URBANAS</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_arc_35">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3.5 PARQUEADEROS</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_arc_36">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3.6 ESPACIO PUBLICO</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_arc_37">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3.7 NSR10</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_arc_38">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3.8 VIABILIDAD ARQUITECTÓNICA</h6>
                            </legend>
                        </a>
                    </MDBCardBody>
                </MDBCard>
            </div>
        </div>
    );
}

export default RECORD_ARC;