import React, { Component } from 'react';
import { MDBBtn, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import FUN_SERVICE from '../../../services/fun.service';
import EXPEDITION_SERVICE from '../../../services/expedition.service';
import RECORD_LAW_SERVICE from '../../../services/record_law.service';
import FUN_VERSION_NAV from '../fun_forms/components/fun_versionNav';
import FUN_MODULE_NAV from '../fun_forms/components/fun_moduleNav';
import CUSTOM_DATA_SERVICE from '../../../services/custom.service';
import EXP_1 from './exp_1.component';
import EXP_AREAS from './exp_areas.component';
import EXP_DOCS from './exp_docs.component';
import EXP_CLOCKS from './exp_clocks.component';
import EXP_LIC from './exp_lic.component';
import { regexChecker_isOA_2, regexChecker_isPh } from '../../../components/customClasses/typeParse';
import EXP_2 from './exp_2.component';



const MySwal = withReactContent(Swal);

class EXPEDITION extends Component {
   
    constructor(props) {
        super(props);
        this.setItem_Record = this.setItem_Record.bind(this);
        this.requestUpdateRecord = this.requestUpdateRecord.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.setItem_RecordArc = this.setItem_RecordArc.bind(this);
        this.requestOutCodes = this.requestOutCodes.bind(this);
        this.state = {
            currentRecord: null,
            currentVersionR: null,
            loaded: false,
            currentStepIndex: 0,
            pqrsxfun: false,
            recordArc: null,
            outCodes : [],
        };
    }
    componentDidMount() {
        this.setItem_Record();
        this.retrieveItem(this.props.currentId);
        this.setItem_RecordArc();
    }
    requestOutCodes(id) {
        CUSTOM_DATA_SERVICE.loadDictionary_cub_id(id)
            .then(response => {
                this.setState({
                    outCodes: response.data,
                });
            })
            .catch(e => {
                console.log(e);
            });
    }
    setItem_Record() {
        EXPEDITION_SERVICE.getRecord(this.props.currentId)
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
        EXPEDITION_SERVICE.getRecord(id)
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
    setItem_RecordArc() {
        RECORD_LAW_SERVICE.getRecord(this.props.currentId)
            .then(response => {
                if (response.data.length < 1) {
                    this.setState({
                        recordArc: {},
                    });
                } else {
                    this.setState({
                        recordArc: response.data[0],
                    });
                }
            })
            .catch(e => {
                console.log(e);
            });
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
                this.retrievePQRSxFUN(response.data.id_public);
                this.requestOutCodes(response.data.id_public)
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
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { loaded, currentRecord, currentVersionR, currentItem, recordArc } = this.state;

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
                    _CHILD_VARS = {
                        item_0: _CHILD[_CURRENT_VERSION].id,
                        tipo: _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "",
                        tramite: _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "",
                        m_urb: _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "",
                        m_sub: _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "",
                        m_lic: _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "",
                        item_6: _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "",
                        item_7: _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "",
                        item_8: _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "",
                        item_9: _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "",
                        item_101: _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "",
                        item_102: _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "",
                    }
                }
            }
            return _CHILD_VARS;
        }
        let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)
        let isPH = () => regexChecker_isPh(currentItem ? _GET_CHILD_1() : false, true)
        // DATA CONVERTERS
        // JSX CONTROLLERS

        // COMPONENT JSX

        // APIS
        var formData = new FormData();

        let new_expedition = () => {
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);
            EXPEDITION_SERVICE.create(formData)
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
                                <>
                                    <EXP_1
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                        currentRecord={currentRecord}
                                        currentVersionR={currentVersionR}
                                        requestUpdate={this.requestUpdate}
                                        requestUpdateRecord={this.requestUpdateRecord} />

                                    {!conOA() && !isPH() ? <>
                                        <EXP_AREAS
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            currentRecord={currentRecord}
                                            currentVersionR={currentVersionR}
                                            requestUpdate={this.requestUpdate}
                                            requestUpdateRecord={this.requestUpdateRecord} />
                                    </> : ''}

                                    {!isPH() ?
                                        <>
                                            <EXP_2
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={this.requestUpdate}
                                                requestUpdateRecord={this.requestUpdateRecord} />


                                            <EXP_DOCS
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                recordArc={recordArc}
                                                requestUpdate={this.requestUpdate}
                                                requestUpdateRecord={this.requestUpdateRecord} />

                                            <EXP_CLOCKS
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={this.requestUpdate}
                                                outCodes={this.state.outCodes}
                                            />

                                            <EXP_LIC
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                                currentRecord={currentRecord}
                                                currentVersionR={currentVersionR}
                                                requestUpdate={this.requestUpdate}
                                                closeModal={this.closeModal}
                                            />
                                        </> : null}

                                    {NAV_FUNA()}

                                </>
                            </> : <>
                                <fieldset className="p-3">
                                    <div className="text-center">
                                        <button className="btn btn-info btn-lg" onClick={() => new_expedition()}> GENERAR EXPEDICION EN BLANCO</button>
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
                        FROM={"expedition"}
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
                            <h6>Menu de Navegación</h6>
                        </legend>
                        <br />
                        <a href="#nav_expedition_1">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>INFORMACIÓN GENERAL</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_10">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>AREAS</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_20">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>PAGOS</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_21">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>Acto de tramite de licencia</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_22">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>Liquidación de Expensas</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_23">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>Impuestos Municipales</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_24">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>Estampilla PRO-UIS</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_25">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>Deberes Urbanísticos</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_26">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>DOCUMENTOS</h6>
                            </legend>
                        </a>

                        <a href="#nav_expedition_28">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>Acto Administrativo / Resolución</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_27">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>CERTIFICACIÓN DE EJECUTORIA</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_29">
                            <legend className="px-3 text-uppercase btn-light">
                                <h6>Licencia</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_3">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>EXPEDICIÓN</h6>
                            </legend>
                        </a>
                        <br />
                        <a href="#nav_expedition_4">
                            <legend className="px-3 text-uppercase btn-info">
                                <h6>CERRAR SOLICITUD</h6>
                            </legend>
                        </a>
                        <br />
                    </MDBCardBody>
                </MDBCard>
            </div>
        </div>
    );
}

export default EXPEDITION;