import React, { Component } from 'react';
import { MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import FUN_SERVICE from '../../../services/fun.service';
import RECORD_PH_SERVICE from '../../../services/record_ph.service';
import FUN_VERSION_NAV from '../fun_forms/components/fun_versionNav';
import FUN_MODULE_NAV from '../fun_forms/components/fun_moduleNav';
import RECORD_PH_LAW from './ph/record_ph_law.component';
import RECORD_PH_GEN from './ph/record_ph_gen.component';
import RECORD_PH_BUILDING from './ph/record_ph_building.component';
import RECORD_PH_PROFESIONALS from './ph/record_ph_profesional.component';
import RECORD_PH_BLUEPRINT from './ph/record_ph_blueprint.component';
import RECORD_PH_GEN_2 from './ph/record_ph_gen2.component';
import RECORD_PH_FLOOR from './ph/record_ph_floor.component';
import RECORD_PH_REVIEW from './ph/record_ph_review.component';
import RECORD_LAW_DOCSCHECK from './law/record_law_docs_check';
import FUN_6_VIEW from '../fun_forms/fun_6.view';
import SUBMIT_SINGLE_VIEW from '../submit/submit_view.component';
import RECORD_PH_GEN_REVIEW from './ph/record_ph_gen_arc_review.component';
import RECORD_PH_CHECK_LIST from './ph/record_ph_check_list.component';

// RECORDS

const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const MySwal = withReactContent(Swal);

class RECORD_PH extends Component {
    constructor(props) {
        super(props);
        this.setItem_RecordArc = this.setItem_RecordArc.bind(this);
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
        };
    }
    componentDidMount() {
        this.setItem_RecordArc();
        this.retrieveItem(this.props.currentId);
    }
    setItem_RecordArc() {
        RECORD_PH_SERVICE.getRecord(this.props.currentId)
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
        RECORD_PH_SERVICE.getRecord(id)
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
    closeModal() {
        this.props.closeModal();
        this.props.requesRefresh();
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
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
        let new_record_ph = () => {
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);
            formData.set('version', 1);
            RECORD_PH_SERVICE.create(formData)
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
        return (
            <div className="record_ph container">
                {currentItem != null ? <>
                    {loaded ? <>
                        {currentRecord
                            ? <>
                                <div>

                                    <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="record_ph_1">
                                        <label className="app-p lead fw-normal text-uppercase">1. ANÁLISIS JURÍDICO</label>
                                    </legend>

                                    <RECORD_LAW_DOCSCHECK
                                        _FUN_1={_GET_CHILD_1()}
                                        _FUN_6={_GET_CHILD_6()}
                                        _FUN_R={_GET_CHILD_REVIEW()}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
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


                                    <RECORD_PH_LAW
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        _FUN_1={_GET_CHILD_1()}
                                        _FUN_6={_GET_CHILD_6()}
                                        _FUN_R={_GET_CHILD_REVIEW()}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        requestUpdate={this.requestUpdate}
                                        requestUpdateRecord={this.requestUpdateRecord} />


                                    <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="record_ph_2">
                                        <label className="app-p lead fw-normal text-uppercase">2. ANÁLISIS ARQUITECTÓNICO</label>
                                    </legend>
                                    {_GLOBAL_ID == 'cb1' ?
                                        <>
                                            <legend className="my-2 px-3 text-uppercase Collapsible" id="record_ph_21">
                                                <label className="app-p lead fw-normal text-uppercase">2.1 INFORMACIÓN GENERAL</label>
                                            </legend>
                                            <RECORD_PH_BUILDING
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={this.requestUpdate}
                                                requestUpdateRecord={this.requestUpdateRecord} />

                                            <RECORD_PH_GEN
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={this.requestUpdate}
                                                requestUpdateRecord={this.requestUpdateRecord} />

                                            <legend className="my-2 px-3 text-uppercase Collapsible" id="record_ph_22">
                                                <label className="app-p lead fw-normal text-uppercase">2.2 DESCRIPCIÓN DEL PROYECTO</label>
                                            </legend>
                                            <RECORD_PH_PROFESIONALS
                                                _FUN_52={_GET_CHILD_52()}
                                                _FUN_6={_GET_CHILD_6()}
                                                currentRecord={currentRecord} />

                                            <RECORD_PH_BLUEPRINT
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={this.requestUpdate}
                                                requestUpdateRecord={this.requestUpdateRecord} />

                                            <RECORD_PH_GEN_2
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={this.requestUpdate}
                                                requestUpdateRecord={this.requestUpdateRecord} />

                                            <RECORD_PH_FLOOR
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={this.requestUpdate}
                                                requestUpdateRecord={this.requestUpdateRecord} />


                                            <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="record_ph_2">
                                                <label className="app-p lead fw-normal text-uppercase">2.3 Observaciones a la planimetria revisada. Formato de revisión e información de proyectos</label>
                                            </legend>
                                            <RECORD_PH_CHECK_LIST
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdateRecord={this.requestUpdateRecord}
                                                requestUpdate={this.requestUpdate}
                                            />


                                        </> :
                                        <>
                                            <RECORD_PH_GEN_REVIEW
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdateRecord={this.requestUpdateRecord}
                                                requestUpdate={this.requestUpdate}
                                            />

                                            <hr />
                                            <RECORD_PH_BLUEPRINT
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={this.requestUpdate}
                                                requestUpdateRecord={this.requestUpdateRecord} />

                                            <hr />
                                            <RECORD_PH_FLOOR
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={this.requestUpdate}
                                                requestUpdateRecord={this.requestUpdateRecord} />
                                        </>}



                                    <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="record_ph_3">
                                        <label className="app-p lead fw-normal text-uppercase">3. APROBACIÓN</label>
                                    </legend>

                                    <RECORD_PH_REVIEW
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        requestUpdate={this.retrieveItem}
                                        closeModal={this.closeModal}
                                        requestUpdateRecord={this.requestUpdateRecord}
                                        requestRefresh={this.retrieveItem} />

                                </div>
                                {/* {NAV_FUNA(_GET_CHILD_1())} */}
                            </> : <>

                                <fieldset className="p-3">
                                    <div className="text-center">
                                        <button className="btn btn-info btn-lg" onClick={() => new_record_ph()}> GENERAR INFORME EN BLANCO</button>
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
                        FROM={"record_ph"}
                        NAVIGATION={this.props.NAVIGATION}
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
            <div className="fung_nav">
                <MDBCard className="container-primary" border='dark'>
                    <MDBCardBody className="p-1">
                        <legend className="px-3 pt-2 text-uppercase bg-light text-center">
                            <h6>Menu de Navegación</h6>
                        </legend>
                        <br />
                        <a href="#record_ph_1">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>1. ANÁLISIS JURÍDICO</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_ph_2">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>2. ANÁLISIS ARQUITECTÓNICO</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_ph_21">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>2.1 INFORMACIÓN GENERAL</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_ph_22">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>2.1 DESCRIPCIÓN PROYECTO</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#record_ph_3">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>3. APROBACIÓN</h6>
                            </legend>
                        </a>
                    </MDBCardBody>
                </MDBCard>
            </div>
        </div>
    );
}

export default RECORD_PH;