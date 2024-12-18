import React, { Component } from 'react';
import { MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBBtn, MDBBreadcrumb, MDBBreadcrumbItem, MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent, MDBTabsPane } from 'mdb-react-ui-kit';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Modal from 'react-modal';

// SERVICES
import FUNService from '../../services/fun.service'

// FUN FAMILY!
import FUNC from './fun_forms/fun_c'
import FUNG from './fun_forms/fun_g'
import FUNN from './fun_forms/fun_n'
import FUND from './fun_forms/components/fun_docs'
import FUN_ALERT from './fun_forms/fun_alertn';
import FUNCLOCK from './fun_forms/fun_clock';

import { regexChecker_isPh, regexChecker_isOA } from '../../components/customClasses/typeParse';

// RECORDS
import RECORD_ARC from './records/record_arc';
import RECORD_LAW from './records/record_law';
import FUN_MACROTABLE from './fun_forms/fun_macrotable.';
import SUBMIT_X_FUN from './submit/submit_x_fun.component';
import RECORD_PH from './records/record_ph';
import RECORD_ENG from './records/record_eng';
import FUN_WORKER_ASIGN from './fun_forms/components/fun_worker_asign.component';
import RECORD_REVIEW from './records/record_review';
import EXPEDITION from './expeditions/expedition.page';
import FUN_REPORT_GEN from './fun_forms/fun_reports/fun_gen.report';

import FUN_DAILY_COMPONENT from './fun_forms/components/fun_daily.component';
import FUN_ASIGNS_COMPONENT from './fun_forms/components/fun_asign.component';

// JSONS
const moment = require('moment');
const MySwal = withReactContent(Swal);

class FUN_MANAGE extends Component {
    constructor(props) {
        super(props);
        this.retrievePublish = this.retrievePublish.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.retrievSingle = this.retrievSingle.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.navigation = this.navigation.bind(this);
        this.navigation_version = this.navigation_version.bind(this);
        this.setSubtmitRows = this.setSubtmitRows.bind(this);
        this.toggle = this.toggle.bind(this);
        this.openModal = this.openModal.bind(this);
        this.toggle_NEGATIVE = this.toggle_NEGATIVE.bind(this);
        this.state = {
            error: null,
            isLoaded: false,
            isLoadedSearch: false,
            currentItem: null,
            currentIndex: -1,

            modal: false,
            modal_c: false,
            modal_n: false,
            modal_d: false,
            modal_alert: false,
            modal_clocK: false,
            modal_record_arc: false,
            modal_record_law: false,
            modal_record_eng: false,
            modal_record_ph: false,
            modal_record_review: false,
            modal_exp: false,
            modal_macro: false,
            modal_report: false,

            items: [],
            currentMetaData: [],
            currentVersion: null,

            list_complete: [],
            list_search: [],
            list_started: [],
            list_incomplete: [],
            list_legal: [],
            list_profesional: [],
            list_expedition: [],
            list_archive: [],

            selectedRow: null,
            submitItems: [],

            fillActive: '4',
            fillActive2: '1',
            clocks: [],
        };
    }
    componentDidMount() {
        this.retrievePublish();
        if (this.props.urlParams) this.LOAD_BY_URL()
    }
    componentDidUpdate(prevProps) {
        if (this.props.urlParams !== prevProps.urlParams && this.props.urlParams != null) {
            console.log(this.props.urlParams)
            this.LOAD_BY_URL();
        }
    }
    retrievePublish() {
        FUNService.getAll_fun()
            .then(response => {
                this.asignList(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }
    retrievSingle(id) {
        MySwal.fire({
            title: this.props.swaMsg.title_wait,
            text: this.props.swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        FUNService.get(id)
            .then(response => {
                MySwal.close()
                this.toggle_d(response.data);
            })
            .catch(e => {
                MySwal.fire({
                    title: this.props.swaMsg.generic_eror_title,
                    text: this.props.swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
                console.log(e);
            });
    }
    retrieveSearch(field, string) {
        FUNService.getSearch(field, string)
            .then(response => {
                this.setState({
                    list_search: response.data,
                    isLoadedSearch: false,
                });
                //this.asignList(response.data);
                MySwal.close();
            })
            .catch(e => {
                console.log(e);
            });
    }
    refreshList() {
        this.retrievePublish();
        this.setState({
            currentItem: null,
            currentIndex: -1,
        });
    }
    asignList(_LIST) {
        let statrted = [];
        let incomplete = [];
        let legal = [];
        let profesonal = [];
        let expedition = [];
        let archive = [];
        for (const item in _LIST) {
            let state = _LIST[item].state
            let object = _LIST[item]
            if (state >= 100) {
                archive.push(object)
            }
            else {
                if (regexChecker_isPh(object, true) || regexChecker_isOA(object)) {
                    profesonal.push(object)
                } else {
                    if (state < -100) {
                        incomplete.push(object)
                    }
                    if (state >= -1 && state < 5) {
                        statrted.push(object)
                    }
                    if (state >= 5 && state < 50) {
                        legal.push(object)
                    }
                    if (state >= 50) {
                        expedition.push(object)
                    }
                }
            }


        }
        this.setState({
            items: _LIST,
            list_started: statrted,
            list_incomplete: incomplete,
            list_legal: legal,
            list_expedition: expedition,
            list_profesional: profesonal,
            list_archive: archive,
            list_complete: _LIST,
            isLoaded: true,
        });
    }
    //  MODAL CONTROLS
    openModal(item, TO) {
        this.navigation(item, TO, '');
    }

    toggle(item) {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal: !this.state.modal,
            modal_macro: false,
        });
    }
    toggle_NEGATIVE(item) {
        if (item) {
            this.setState({
                currentVersion: item.version,
                currentId: item.id_sistem,
                currentLastVersion: item.version,
                currentDate: item.date,
                currentPublic: item.id_public,
                selectedRow: item.id_sistem
            });
        }
        this.setState({
            modal: !this.state.modal,
            modal_macro: false,
        });
    }
    getToggle = () => {
        return this.state.modal;
    }
    getToggle_c = () => {
        return this.state.modal_c;
    }
    toggle_c = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_c: !this.state.modal_c
        });
    }
    getToggle_n = () => {
        return this.state.modal_n;
    }
    toggle_n = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_n: !this.state.modal_n
        });
    }
    getToggle_d = () => {
        return this.state.modal_d;
    }
    toggle_d = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_d: !this.state.modal_d
        });
    }
    getToggle_alert = () => {
        return this.state.modal_alert;
    }
    toggle_alert = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_alert: !this.state.modal_alert
        });
    }
    getToggle_recordArc = () => {
        return this.state.modal_record_arc;
    }
    toggle_recordArc = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_record_arc: !this.state.modal_record_arc
        });
    }
    getToggle_recordLaw = () => {
        return this.state.modal_record_law;
    }
    toggle_recordLaw = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_record_law: !this.state.modal_record_law
        });
    }
    getToggle_recordLaw = () => {
        return this.state.modal_record_law;
    }
    toggle_recordEng = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_record_eng: !this.state.modal_record_eng
        });
    }
    getToggle_recordEng = () => {
        return this.state.modal_record_eng;
    }
    toggle_recordLaw = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_record_law: !this.state.modal_record_law
        });
    }
    getToggle_recordPH = () => {
        return this.state.modal_record_ph;
    }
    toggle_recordPH = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_record_ph: !this.state.modal_record_ph
        });
    }
    toggle_recordReview = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_record_review: !this.state.modal_record_review
        });
    }
    getToggle_recordReview = () => {
        return this.state.modal_record_review;
    }
    toggle_exp = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_exp: !this.state.modal_exp
        });
    }
    getToggle_recordReview = () => {
        return this.state.modal_exp;
    }
    getToggle_clock = () => {
        return this.state.modal_clocK;
    }
    toggle_clock = (item) => {
        if (item) {
            this.setItem(item)
        }
        this.setState({
            modal_clocK: !this.state.modal_clocK
        });
    }
    getToggle_macro = () => {
        return this.state.modal_macro;
    }
    toggle_macro = (item) => {
        this.setState({
            modal_macro: !this.state.modal_macro,
        });
        if (item) {
            this.setState({
                selectedRow: item.id,

            });
        } else {
            this.setState({
                selectedRow: null,

            });
        }
    }
    toggle_report = (item) => {
        this.setState({
            modal_report: !this.state.modal_report,
        });
        if (item) {
            this.setState({
                selectedRow: item.id,

            });
        } else {
            this.setState({
                selectedRow: null,

            });
        }
    }
    // NAVIGATION
    navigation = (item, TO, FROM) => {
        switch (FROM) {
            case "general":
                this.toggle(false)
                break;
            case "edit":
                this.toggle_n(false)
                break;
            case "archive":
                this.toggle_d(false)
                break;
            case "check":
                this.toggle_c(false)
                break;
            case "alert":
                this.toggle_alert(false)
                break;
            case "clock":
                this.toggle_clock(false)
                break;
            case "record_arc":
                this.toggle_recordArc(false)
                break;
            case "record_law":
                this.toggle_recordLaw(false)
                break;
            case "record_eng":
                this.toggle_recordEng(false)
                break;
            case "record_ph":
                this.toggle_recordPH(false)
                break;
            case "record_review":
                this.toggle_recordReview(false)
                break;
            case "expedition":
                this.toggle_exp(false)
                break;
            case "macro":
                this.toggle_macro(false)
                break;

        }
        switch (TO) {
            case "general":
                this.toggle(item)
                break;
            case "edit":
                this.toggle_n(item)
                break;
            case "archive":
                this.toggle_d(item)
                break;
            case "check":
                this.toggle_c(item)
                break;
            case "alert":
                this.toggle_alert(item)
                break;
            case "clock":
                this.toggle_clock(item)
                break;
            case "record_arc":
                this.toggle_recordArc(item)
                break;
            case "record_law":
                this.toggle_recordLaw(item)
                break;
            case "record_eng":
                this.toggle_recordEng(item)
                break;
            case "record_ph":
                this.toggle_recordPH(item)
                break;
            case "record_review":
                this.toggle_recordReview(item)
                break;
            case "expedition":
                this.toggle_exp(item)
                break;
            case "macro":
                this.setState({
                    date_start: moment(document.getElementById('load_macro_date_1').value).format('YYYY-MM-DD'),
                    date_end: moment(document.getElementById('load_macro_date_2').value).format('YYYY-MM-DD'),
                })
                this.toggle_macro(item)
                break;
        }
    }
    navigation_version = (STEP) => {
        switch (STEP) {
            case "minus":
                this.setState({ currentVersion: this.state.currentVersion - 1 });
                break;
            case "plus":
                this.setState({ currentVersion: this.state.currentVersion + 1 });
                break;
        }
    }
    // END MODAL CONTROLS
    setItem(item) {
        this.setState({
            currentVersion: item.version,
            currentId: item.id,
            currentLastVersion: item.version,
            currentDate: item.clock_payment ?? <label className='fw-bold text-danger'>FECHA PENDIENTE</label>,
            currentPublic: item.id_public,
            selectedRow: item.id
        });
    }

    requestUpdate(id) {
        FUNService.get(id).then(response => {
            let item = response.data
            this.setState({
                currentItem: item,
                currentId: item.id,
                currentVersion: item.version
            })
            this.retrievePublish();
        })
    }
    // HELPER FUNCTIONS
    setSubtmitRows(items) {
        this.setState({ submitItems: items })
    }
    _REGEX_MATCH_PH(_string) {
        let regex0 = /p\.\s+h/i;
        let regex1 = /p\.h/i;
        let regex2 = /propiedad\s+horizontal/i;
        let regex3 = /p\s+h/i;
        if (regex0.test(_string) || regex2.test(_string) || regex1.test(_string) || regex3.test(_string)) return true;
        return false
    }
    render() {
        const { translation, swaMsg, globals, breadCrums } = this.props;
        const { currentVersion, currentId, isLoaded, list_started, list_incomplete, list_search } = this.state;


        const modalHeader = <div className="my-3 d-flex justify-content-between">
            <label>ULTIMA VERSIÓN :{this.state.currentLastVersion}</label>
        </div>


        // CUSTOM STYLES FOR THE MODAL
        const customStylesForModal = () => {
            return {
                overlay: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    zIndex: 2,
                },
                content: {
                    position: 'absolute',
                    top: '10px',
                    left: '20%',
                    right: '15%',
                    bottom: '10px',
                    border: '1px solid #ccc',
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    borderRadius: '4px',
                    outline: 'none',
                    padding: '20px',
                    marginRight: 'auto',

                }
            }
        };
        const customStylesForModalMacro = () => {
            return {
                overlay: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    zIndex: 2,
                },
                content: {
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    right: '0px',
                    bottom: '0px',
                    border: '1px solid #ccc',
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    borderRadius: '4px',
                    outline: 'none',
                    padding: '20px',
                    width: 'auto',
                }
            }
        };

        var formData = new FormData();

        // CREATES A NEW LICENCE
        let loadMacro = (event) => {
            event.preventDefault();
            this.toggle_macro();
            let date_a = document.getElementById("load_macro_date_1").value;
            let date_b = document.getElementById("load_macro_date_2").value;
            var date_start = date_a;
            var date_end = date_b;
            if (moment(date_a).diff(date_b) >= 0) {
                date_start = date_b;
                date_end = date_a;
            }
            this.setState({ date_start: date_start });
            this.setState({ date_end: date_end })
        }
        const handleFillClick = (state) => {
            if (state === this.state.fillActive) {
                return;
            }
            this.setState({ fillActive: state });
        };
        let openReport = (event) => {
            event.preventDefault();
            let date_a = document.getElementById("load_macro_date_1_s").value;
            let date_b = document.getElementById("load_macro_date_2_s").value;
            var date_start = date_a;
            var date_end = date_b;
            if (moment(date_a).diff(date_b) >= 0) {
                date_start = date_b;
                date_end = date_a;
            }
            this.setState({ date_start: date_start });
            this.setState({ date_end: date_end })
            this.toggle_report()
        };
        return (
            <div className="Publish container">
                <div className="row my-4 d-flex justify-content-center">
                    <MDBBreadcrumb className="mx-5">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem>
                            <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u7}</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>
                    <div className="col-lg-11 col-md-12">
                        <h1 className="text-center my-4">GESTIÓN DE SOLICITUDES</h1>
                        <hr />
                    </div>

                    <SUBMIT_X_FUN translation={translation} globals={globals}
                        setSubtmitRows={this.setSubtmitRows}
                        type={"LIC"} simple hide
                        retrievSingle={this.retrievSingle}
                        openModal={this.openModal}
                        listIncomplete={this.state.list_started} />

                    <FUN_WORKER_ASIGN translation={translation} globals={globals}
                        type={"law"}
                        openModal={this.openModal} />
                    <FUN_WORKER_ASIGN translation={translation} globals={globals}
                        type={"arc"}
                        openModal={this.openModal} />
                    <FUN_WORKER_ASIGN translation={translation} globals={globals}
                        type={"eng"}
                        openModal={this.openModal} />

                    <MDBRow>
                        <h2 class="text-uppercase text-center pb-2">ACCIONES</h2>
                        <MDBCol md="6">
                            <MDBCard className="bg-card mb-3">
                                <MDBCardBody>
                                    <MDBCardTitle className="text-center"> <h4>CARGAR MACROTABLA</h4></MDBCardTitle>
                                    <form onSubmit={loadMacro} id="fun_form_macro_table">
                                        <div className='row'>
                                            <div className='col'>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-info text-white">
                                                        <i class="far fa-calendar-alt"></i>
                                                    </span>
                                                    <input type="date" class="form-control" id="load_macro_date_1" required
                                                        defaultValue={moment().subtract(12, 'months').format('YYYY-MM-DD')} />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-info text-white">
                                                        <i class="far fa-calendar-alt"></i>
                                                    </span>
                                                    <input type="date" class="form-control" id="load_macro_date_2" required
                                                        defaultValue={moment().format('YYYY-MM-DD')} />
                                                </div>
                                            </div>
                                        </div>


                                        <div className="text-center">
                                            <button className="btn btn-danger mt-1"><i class="fas fa-th"></i> CARGAR </button>
                                        </div>
                                    </form>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                        <MDBCol md="6">
                            <MDBCard className="bg-card mb-3">
                                <MDBCardBody>
                                    <MDBCardTitle className="text-center"> <h4>REPORTES</h4></MDBCardTitle>
                                    <form onSubmit={openReport} id="fun_form_macro_table">
                                        <div className='row'>
                                            <div className='col'>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-info text-white">
                                                        <i class="far fa-calendar-alt"></i>
                                                    </span>
                                                    <input type="date" class="form-control" id="load_macro_date_1_s" required
                                                        defaultValue={moment().startOf('month').format('YYYY-MM-DD')} />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-info text-white">
                                                        <i class="far fa-calendar-alt"></i>
                                                    </span>
                                                    <input type="date" class="form-control" id="load_macro_date_2_s" required
                                                        defaultValue={moment().endOf('month').format('YYYY-MM-DD')} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <button className="btn btn-primary mt-1"><i class="fas fa-file-alt"></i> CARGAR </button>
                                        </div>
                                    </form>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                    </MDBRow>

                    <MDBTabs fill className='m-2 border' pills>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('4')} active={this.state.fillActive === '4'}>
                                <label className="upper-case">PROCESOS DIARIOS</label>
                            </MDBTabsLink>
                        </MDBTabsItem>

                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('2')} active={this.state.fillActive === '2'}>
                                <label className="upper-case">ENTRADA DE DOCUMENTOS </label>
                            </MDBTabsLink>
                        </MDBTabsItem>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('3')} active={this.state.fillActive === '3'}>
                                <label className="upper-case">CARGA PROFESIONAL </label>
                            </MDBTabsLink>
                        </MDBTabsItem>

                    </MDBTabs>

                    <MDBTabsContent>
                        <MDBTabsPane show={this.state.fillActive === '4'}>
                            <FUN_DAILY_COMPONENT translation={translation} swaMsg={swaMsg} globals={globals}
                                NAVIGATION_GEN={this.navigation}
                                requestUpdate={this.requestUpdate}
                                requesRefresh={this.retrievePublish}
                            />
                        </MDBTabsPane>

                        <MDBTabsPane show={this.state.fillActive === '2'}>
                            <SUBMIT_X_FUN translation={translation} globals={globals}
                                setSubtmitRows={this.setSubtmitRows}
                                type={"LIC"}
                                retrievSingle={this.retrievSingle}
                                openModal={this.openModal}
                                listIncomplete={this.state.list_started} />
                        </MDBTabsPane>
                        <MDBTabsPane show={this.state.fillActive === '3'}>
                            <FUN_ASIGNS_COMPONENT translation={translation} swaMsg={swaMsg} globals={globals}
                                NAVIGATION_GEN={this.navigation}
                                requestUpdate={this.requestUpdate}
                                requesRefresh={this.retrievePublish}
                            />
                        </MDBTabsPane>
                    </MDBTabsContent>

                </div >

                <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={this.state.modal}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >

                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-file-alt"></i> DETALLES DE LA SOLICITUD - No. Radicación : {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <FUNG
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        NAVIGATION={this.navigation}
                        NAVIGATION_VERSION={this.navigation_version}
                    />

                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => this.toggle()}><i class="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="FUN CHECKEO"
                    isOpen={this.state.modal_c}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-check-square"></i> LISTA DE CHECKEO : No. Radicación :  {this.state.currentPublic}</label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_c()}></MDBBtn>
                    </div>
                    {modalHeader}


                    <FUNC translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                        requesRefresh={this.retrievePublish}
                        closeModal={this.toggle_c}
                        NAVIGATION={this.navigation}
                        NAVIGATION_VERSION={this.navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_c}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="FUN NEW/UPDATE"
                    isOpen={this.state.modal_n}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-file-signature"></i> ACTUALIZACIÓN DE SOLICITUD - No. Radicación : {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_n()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <FUNN translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                        requesRefresh={this.retrievePublish}
                        NAVIGATION={this.navigation}
                        NAVIGATION_VERSION={this.navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_n}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="FUN DOC CONTROL"
                    isOpen={this.state.modal_d}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-archive"></i> GESTIÓN DOCUMENTAL - No. Radicación :  {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_d()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <FUND translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                        NAVIGATION={this.navigation}
                        NAVIGATION_VERSION={this.navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_d}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="FUN ALERTA A VECINOS"
                    isOpen={this.state.modal_alert}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-sign"></i> AVISOS A VECINOS - No. Radicación :  {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_alert()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <FUN_ALERT translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                        closeModal={this.toggle_alert}
                        NAVIGATION={this.navigation}
                        NAVIGATION_VERSION={this.navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_alert}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="FUN CLOCK"
                    isOpen={this.state.modal_clocK}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-clock"></i> CONTROL DE TIEMPO DE PROCESO - No. Radicación : {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_clock()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <FUNCLOCK translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requesRefresh={this.retrievePublish}
                        NAVIGATION={this.navigation}
                        NAVIGATION_VERSION={this.navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_clock}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="RECORDS ARCHITECTURE"
                    isOpen={this.state.modal_record_arc}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-building"></i> INFORME ARQUITECTÓNICO - No. Radicación :  {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_recordArc()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <RECORD_ARC translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                        requesRefresh={this.retrievePublish}
                        closeModal={this.toggle_recordArc}
                        NAVIGATION={this.navigation}
                        NAVIGATION_VERSION={this.navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_recordArc}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="RECORDS LAW"
                    isOpen={this.state.modal_record_law}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-balance-scale"></i> INFORME JURIDICO - No. Radicación :  {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_recordLaw()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <RECORD_LAW translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                        closeModal={this.toggle_recordLaw}
                        NAVIGATION={this.navigation}
                        NAVIGATION_VERSION={this.navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_recordLaw}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="RECORDS PH"
                    isOpen={this.state.modal_record_ph}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-pencil-ruler"></i> INFORME PROPIEDAD HORIZONTAL - No. Radicación :  {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_recordPH()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <RECORD_PH translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                        requesRefresh={this.retrievePublish}
                        closeModal={this.toggle_recordPH}
                        NAVIGATION={this.navigation}
                        NAVIGATION_VERSION={this.navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_recordPH}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="RECORDS ENG"
                    isOpen={this.state.modal_record_eng}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-cogs"></i> INFORME ESTRUCTURAL - No. Radicación :  {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_recordEng()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <RECORD_ENG translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                        closeModal={this.toggle_recordLaw}
                        NAVIGATION={this.navigation}
                        NAVIGATION_VERSION={this.navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_recordEng}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="RECORDS REVIEW"
                    isOpen={this.state.modal_record_review}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-file-contract"></i>ACTA DE OBSERVACIONES / CORRECCIONES - No. Radicación :  {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_recordReview()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <RECORD_REVIEW translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                        closeModal={this.toggle_recordReview}
                        NAVIGATION={this.navigation} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_recordReview}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="EXPEDITION"
                    isOpen={this.state.modal_exp}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-file-alt"></i> EXPEDICIÓN DE LA LICENCIA:  {this.state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_exp()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <EXPEDITION translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requesRefresh={this.retrievePublish}
                        closeModal={this.toggle_exp}
                        NAVIGATION={this.navigation} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={this.toggle_exp}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="MACRO TABLE"
                    isOpen={this.state.modal_macro}
                    style={customStylesForModalMacro()}
                    ariaHideApp={false}
                >
                    <div className="my-1 d-flex justify-content-between">
                        <label><i class="fas fa-th"></i> Macro tabla de seguimiento: Desde {this.state.date_start} hasta {this.state.date_end}</label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_macro()}></MDBBtn>
                    </div>

                    <FUN_MACROTABLE translation={translation} swaMsg={swaMsg} globals={globals}
                        closeModal={this.toggle_macro}
                        NAVIGATION={this.navigation}
                        NAVIGATION_GEN={this.navigation}
                        NAVIGATION_GEN_NEGATIVE={this.toggle_NEGATIVE}
                        date_start={this.state.date_start}
                        date_end={this.state.date_end}
                        selectedRow={this.state.selectedRow}
                        setSelectedRow={(id) => this.setState({ selectedRow: id })}
                        defaultFilter={this.state.defaultFilter ?? false}
                    />

                </Modal>

                <Modal contentLabel="REPORT"
                    isOpen={this.state.modal_report}
                    style={customStylesForModalMacro()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-around">
                        <div className='row'>
                            <div className='col'>

                            </div>
                        </div>

                    </div>
                    <div class="row">
                        <div class="col">
                            <div class="form-group row">
                                <label className='col-form-label col-3'><i class="fas fa-file-alt"></i> REPORTE GENERAL DE SOLICITUDES </label>
                                <label className='col-form-label col-1 text-end'>FECHAS: </label>
                                <div class="col">
                                    <input type='date' max="2100-01-01" className='form-control form-control-sm mt-2' defaultValue={this.state.date_start} onBlur={(e) => this.setState({ date_start: e.target.value })} />
                                </div>
                                <div class="col">
                                    <input type='date' max="2100-01-01" className='form-control form-control-sm mt-2' defaultValue={this.state.date_end} onBlur={(e) => this.setState({ date_end: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div class="col-1 text-end"><MDBBtn className='btn-close' color='none' onClick={() => this.toggle_report()}></MDBBtn></div>
                    </div>

                    <hr />

                    <FUN_REPORT_GEN translation={translation} swaMsg={swaMsg} globals={globals}
                        data={this.state.list_complete}
                        date_i={this.state.date_start}
                        date_f={this.state.date_end}
                    />

                </Modal>
            </div >
        );
    }
}

export default FUN_MANAGE;