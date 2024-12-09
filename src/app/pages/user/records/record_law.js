import React, { Component } from 'react';
import { MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import FUN_SERVICE from '../../../services/fun.service';
import submitService from '../../../services/submit.service';

import RECORD_ARCSERVICE from '../../../services/record_arc.service';
import RECORD_LAW_SERVICE from '../../../services/record_law.service';
import RECORD_ENG_SERVICE from '../../../services/record_eng.service';

import FUN_VERSION_NAV from '../fun_forms/components/fun_versionNav';
import FUN_MODULE_NAV from '../fun_forms/components/fun_moduleNav';
import RECORD_LAW_EVALUATION from './law/record_law_review';
import CLOCKS_CONTROL from '../fun_forms/components/clocks_control.component';
import SHORT_INFO from '../fun_forms/components/shot_info.component';
import RECORD_ARC_32 from './arc/record_arc_32';
import RECORD_LAW_DOCSCHECK from './law/record_law_docs_check';
import RECORD_LAW_STEP_1 from './law/record_law_step1.cmponent';
import RECORD_LAW_FUN_1 from './law/record_law_fun_1.component';
import RECORD_LAW_FUN_2 from './law/record_law_fun_2.component';
import RECORD_LAW_GEN2_11 from './law/record_law_gen2_11';
import RECORD_LAW_FUN_51 from './law/record_law_fun_51.component';
import RECORD_LAW_FUN_52 from './law/record_law_fun_52.component';
import RECORD_LAW_FUN_53 from './law/record_law_fun_53.component';
import RECORD_LAW_FUN_LAW from './law/record_law_fun_law.component';
import SUBMIT_SINGLE_VIEW from '../submit/submit_view.component';
import FUN_6_VIEW from '../fun_forms/fun_6.view';
import RECORDS_BINNACLE from './records_binnacles.component';
import funService from '../../../services/fun.service';


// RECORDS


const MySwal = withReactContent(Swal);

class RECORD_LAW extends Component {
    constructor(props) {
        super(props);
        this.setItem_RecordArc = this.setItem_RecordArc.bind(this);
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.retrievePQRSxFUN = this.retrievePQRSxFUN.bind(this);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
            pqrsxfun: false,
            currentItem: null,
        };
    }
    componentDidMount() {
        this.setItem_RecordArc();
        this.retrieveItem(this.props.currentId);
    }
    setItem_RecordArc() {
        RECORD_LAW_SERVICE.getRecord(this.props.currentId)
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
        RECORD_LAW_SERVICE.getRecord(id)
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
        const { loaded, currentRecord, currentVersionR, currentItem } = this.state;
        const rules = currentItem ? currentItem.rules ? currentItem.rules.split(';') : [] : [];
        var formData = new FormData();
        const quickModalStyle = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                zIndex: 2,
            },
            content: {
                position: 'absolute',
                top: '15%',
                left: '25%',
                right: '25%',
                bottom: '15%',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                marginRight: 'auto',

            }
        };
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
        let new_record_law = () => {
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);
            formData.set('version', 1);
            RECORD_LAW_SERVICE.create(formData)
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

        let save_fun0 = () => {
            var formData0 = new FormData();
            let currentRules = rules;

            currentRules[0] = document.getElementById('fun_0_rules').checked ? 1 : 0;

            formData0.set('rules', currentRules.join(';'));

            funService.update(currentItem.id, formData0).then(response => {
                if (response.data === 'OK') this.retrieveItem(currentItem.id)
            });
        }
        return (
            <div className="record_arc container">
                {currentItem != null ? <>
                    {loaded ? <>
                        {currentRecord
                            ? <>

                                <legend className="my-2 px-3 text-uppercase Collapsible" id="record_law_gen">
                                    <label className="app-p lead fw-normal text-uppercase">I. CONTROL DEL DEBIDO PROCESO DE LA SOLICITUD</label>
                                </legend>
                                {
                                    /**
                                     * <SHORT_INFO translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion} />
                                     * 
                                     * 
                                     */

                                }

                                <CLOCKS_CONTROL translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                />



                                <legend className="my-2 px-3 text-uppercase Collapsible" id="record_law_gen_2">
                                    <label className="app-p lead fw-normal text-uppercase">II. Observaciones Jurídicas</label>
                                </legend>

                                <legend className="my-2 px-3 text-uppercase bg-light" id="record_law_21">
                                    <label className="app-p lead fw-normal text-uppercase">2.1 TIPO DE SOLICITUD</label>
                                </legend>
                                <RECORD_ARC_32 translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion} />
                                <RECORDS_BINNACLE translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    SERVICE={RECORD_LAW_SERVICE}
                                    requestUpdateRecord={this.requestUpdateRecord}
                                    AIM={"Jurídico"}
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
                                    readOnly />

                                <legend className="my-2 px-3 text-uppercase bg-light" id="record_law_22">
                                    <label className="app-p lead fw-normal text-uppercase">2.2 Inventario de Información Aportada</label>
                                </legend>

                                <RECORD_LAW_DOCSCHECK
                                    _FUN_1={_GET_CHILD_1()}
                                    _FUN_6={_GET_CHILD_6()}
                                    _FUN_R={_GET_CHILD_REVIEW()}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    requestUpdate={this.requestUpdate}
                                    docsScope={'law'} />



                                <legend className="my-2 px-3 text-uppercase bg-light" id="record_law_23">
                                    <label className="app-p lead fw-normal text-uppercase">2.3 DOCUMENTOS DIGITALIZADOS</label>
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

                                <legend className="my-2 px-3 text-uppercase bg-light" id="record_law_24">
                                    <label className="app-p lead fw-normal text-uppercase">2.4 DOCUMENTOS APORTADOS POR VENTANILLA ÚNICA</label>
                                </legend>
                                <SUBMIT_SINGLE_VIEW
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    id_related={currentItem.id_public}
                                />


                                <legend className="my-2 px-3 text-uppercase bg-light" id="record_law_25">
                                    <label className="app-p lead fw-normal text-uppercase">2.5 Formulario Único Nacional</label>
                                </legend>

                                <RECORD_LAW_STEP_1
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={this.requestUpdate}
                                    requestUpdateRecord={this.requestUpdateRecord}
                                />

                                <RECORD_LAW_FUN_1
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={this.requestUpdate}
                                    requestUpdateRecord={this.requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                />

                                <RECORD_LAW_FUN_2
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={this.requestUpdate}
                                    requestUpdateRecord={this.requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                />


                                <RECORD_LAW_FUN_51
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={this.requestUpdate}
                                    requestUpdateRecord={this.requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                />

                                <RECORD_LAW_FUN_52
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={this.requestUpdate}
                                    requestUpdateRecord={this.requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                />

                                <RECORD_LAW_FUN_53
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={this.requestUpdate}
                                    requestUpdateRecord={this.requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                />


                                <RECORD_LAW_GEN2_11
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={this.requestUpdate}
                                    requestUpdateRecord={this.requestUpdateRecord}
                                    quickModalStyle={quickModalStyle}
                                />

                                <legend className="my-2 px-3 text-uppercase bg-light" id="record_law_26">
                                    <label className="app-p lead fw-normal text-uppercase">2.6 ACCIONES DE PUBLICIDAD DEL PROCESO</label>
                                </legend>


                                <div className="row border my-2 py-4 border border-warning" style={{ backgroundColor: 'Gainsboro', borderWidth: '3px' }}>
                                    <div className="col-4"></div>
                                    <div className="col-4">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" value="1" id="fun_0_rules" defaultChecked={rules[0] == 1} 
                                            onChange={() => save_fun0()}/>
                                            <h2 class="form-check-label">No usar Publicidad</h2>
                                        </div>
                                    </div>
                                </div>

                                {rules[0] != 1 ? <>
                                    <RECORD_LAW_FUN_LAW
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        requestUpdate={this.requestUpdate}
                                        requestUpdateRecord={this.requestUpdateRecord}
                                        quickModalStyle={quickModalStyle}
                                    />
                                </> : ''}



                                <legend className="my-2 px-3 text-uppercase Collapsible" id="record_law_gen_3">
                                    <label className="app-p lead fw-normal text-uppercase">III. Viabilidad Jurídica</label>
                                </legend>
                                <RECORD_LAW_EVALUATION
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    currentRecord={currentRecord}
                                    currentVersionR={currentVersionR}
                                    requestUpdate={this.requestUpdate}
                                    requestUpdateRecord={this.requestUpdateRecord}
                                />

                                {/* {NAV_FUNA(_GET_CHILD_1())} */}
                            </> : <>

                                <fieldset className="p-3">
                                    <div className="text-center">
                                        <button className="btn btn-info btn-lg" onClick={() => new_record_law()}> GENERAR INFORME EN BLANCO</button>
                                    </div>
                                </fieldset>

                            </>}
                    </> : <div className="text-center">
                        <h3 className="fw-bold ">CARGANDO INFORMACION...</h3>
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
                        FROM={"record_law"}
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
    let _REGEX_MATCH_PH = (_string) => {
        let regex0 = /p\.\s+h/i;
        let regex1 = /p\.h/i;
        let regex2 = /PROPIEDAD\s+HORIZONTAL/i;
        if (regex0.test(_string) || regex2.test(_string) || regex1.test(_string)) return true;
        return false
    }
    return (
        <div className="btn-navpqrs">
            <div className="fung_nav">
                <MDBCard className="container-primary" border='dark'>
                    <MDBCardBody className="p-1">
                        <legend className="px-3 pt-2 text-uppercase bg-light text-center">
                            <h6>Menu de Navegación</h6>
                        </legend>
                        <br />
                        <a href="#record_law_gen">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>I. CONTROL DEL DEBIDO PROCESO DE LA SOLICITUD</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_gen_2">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>II. Observaciones Jurídicas</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_21">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>2.1 TIPO DE SOLICITUD</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_22">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>2.2 Inventario de Información Aportada</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_23">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>2.3 DOCUMENTOS DIGITALIZADOS</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_24">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>2.4 DOCUMENTOS APORTADOS POR VENTANILLA ÚNICA</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_law_25">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>2.5 Formulario Único Nacional</h6>
                            </legend>
                        </a>
                        <a href="#record_law_26">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>2.6 ACCIONES DE PUBLICIDAD DEL PROCESO</h6>
                            </legend>
                        </a>
                        <a href="#record_law_gen_3">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>III. Viabilidad Jurídica</h6>
                            </legend>
                        </a>

                    </MDBCardBody>
                </MDBCard>
            </div>
        </div>
    );
}

export default RECORD_LAW;