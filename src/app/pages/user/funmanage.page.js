import { useState, useEffect, useCallback, useRef } from 'react';
import { MDBTabsContent, MDBTabsPane } from '../../components/ui';
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
import dayjs from 'dayjs';
const MySwal = withReactContent(Swal);

function FUN_MANAGE({ translation, swaMsg, globals, breadCrums, urlParams }) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoadedSearch, setIsLoadedSearch] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const [modal, setModal] = useState(false);
    const [modal_c, setModal_c] = useState(false);
    const [modal_n, setModal_n] = useState(false);
    const [modal_d, setModal_d] = useState(false);
    const [modal_alert, setModal_alert] = useState(false);
    const [modal_clocK, setModal_clocK] = useState(false);
    const [modal_record_arc, setModal_record_arc] = useState(false);
    const [modal_record_law, setModal_record_law] = useState(false);
    const [modal_record_eng, setModal_record_eng] = useState(false);
    const [modal_record_ph, setModal_record_ph] = useState(false);
    const [modal_record_review, setModal_record_review] = useState(false);
    const [modal_exp, setModal_exp] = useState(false);
    const [modal_macro, setModal_macro] = useState(false);
    const [modal_report, setModal_report] = useState(false);

    const [items, setItemsList] = useState([]);
    const [currentMetaData, setCurrentMetaData] = useState([]);
    const [currentVersion, setCurrentVersion] = useState(null);
    const [currentId, setCurrentId] = useState(null);
    const [currentLastVersion, setCurrentLastVersion] = useState(null);
    const [currentDate, setCurrentDate] = useState(null);
    const [currentPublic, setCurrentPublic] = useState(null);

    const [list_complete, setList_complete] = useState([]);
    const [list_search, setList_search] = useState([]);
    const [list_started, setList_started] = useState([]);
    const [list_incomplete, setList_incomplete] = useState([]);
    const [list_legal, setList_legal] = useState([]);
    const [list_profesional, setList_profesional] = useState([]);
    const [list_expedition, setList_expedition] = useState([]);
    const [list_archive, setList_archive] = useState([]);

    const [selectedRow, setSelectedRow] = useState(null);
    const [submitItems, setSubmitItems] = useState([]);

    const [fillActive, setFillActive] = useState('4');
    const [fillActive2, setFillActive2] = useState('1');
    const [clocks, setClocks] = useState([]);
    const [date_start, setDate_start] = useState(null);
    const [date_end, setDate_end] = useState(null);
    const [defaultFilter, setDefaultFilter] = useState(false);
    const [mountedTabs, setMountedTabs] = useState({ '4': true });

    const prevUrlParamsRef = useRef(urlParams);

    useEffect(() => {
        retrievePublish();
        if (urlParams) LOAD_BY_URL();
    }, []);

    useEffect(() => {
        if (urlParams !== prevUrlParamsRef.current && urlParams != null) {
            console.log(urlParams);
            LOAD_BY_URL();
        }
        prevUrlParamsRef.current = urlParams;
    }, [urlParams]);
    const retrievePublish = () => {
        FUNService.getAll_fun()
            .then(response => {
                asignList(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }
    const retrievSingle = (id) => {
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        FUNService.get(id)
            .then(response => {
                MySwal.close()
                toggle_d(response.data);
            })
            .catch(e => {
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
                console.log(e);
            });
    }
    const retrieveSearch = (field, string) => {
        FUNService.getSearch(field, string)
            .then(response => {
                setList_search(response.data);
                setIsLoadedSearch(false);
                MySwal.close();
            })
            .catch(e => {
                console.log(e);
            });
    }
    const refreshList = () => {
        retrievePublish();
        setCurrentItem(null);
        setCurrentIndex(-1);
    }
    const asignList = (_LIST) => {
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
        setItemsList(_LIST);
        setList_started(statrted);
        setList_incomplete(incomplete);
        setList_legal(legal);
        setList_expedition(expedition);
        setList_profesional(profesonal);
        setList_archive(archive);
        setList_complete(_LIST);
        setIsLoaded(true);
    }
    //  MODAL CONTROLS
    const openModal = (item, TO) => {
        navigation(item, TO, '');
    }

    const toggle = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal(prev => !prev);
        setModal_macro(false);
    }
    const toggle_NEGATIVE = (item) => {
        if (item) {
            setCurrentVersion(item.version);
            setCurrentId(item.id_sistem);
            setCurrentLastVersion(item.version);
            setCurrentDate(item.date);
            setCurrentPublic(item.id_public);
            setSelectedRow(item.id_sistem);
        }
        setModal(prev => !prev);
        setModal_macro(false);
    }
    const getToggle = () => {
        return modal;
    }
    const getToggle_c = () => {
        return modal_c;
    }
    const toggle_c = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_c(prev => !prev);
    }
    const getToggle_n = () => {
        return modal_n;
    }
    const toggle_n = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_n(prev => !prev);
    }
    const getToggle_d = () => {
        return modal_d;
    }
    const toggle_d = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_d(prev => !prev);
    }
    const getToggle_alert = () => {
        return modal_alert;
    }
    const toggle_alert = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_alert(prev => !prev);
    }
    const getToggle_recordArc = () => {
        return modal_record_arc;
    }
    const toggle_recordArc = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_record_arc(prev => !prev);
    }
    const getToggle_recordLaw = () => {
        return modal_record_law;
    }
    const toggle_recordLaw = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_record_law(prev => !prev);
    }
    const toggle_recordEng = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_record_eng(prev => !prev);
    }
    const getToggle_recordEng = () => {
        return modal_record_eng;
    }
    const getToggle_recordPH = () => {
        return modal_record_ph;
    }
    const toggle_recordPH = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_record_ph(prev => !prev);
    }
    const toggle_recordReview = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_record_review(prev => !prev);
    }
    const getToggle_recordReview = () => {
        return modal_record_review;
    }
    const toggle_exp = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_exp(prev => !prev);
    }
    const getToggle_clock = () => {
        return modal_clocK;
    }
    const toggle_clock = (item) => {
        if (item) {
            setItemData(item);
        }
        setModal_clocK(prev => !prev);
    }
    const getToggle_macro = () => {
        return modal_macro;
    }
    const toggle_macro = (item) => {
        setModal_macro(prev => !prev);
        if (item) {
            setSelectedRow(item.id);
        } else {
            setSelectedRow(null);
        }
    }
    const toggle_report = (item) => {
        setModal_report(prev => !prev);
        if (item) {
            setSelectedRow(item.id);
        } else {
            setSelectedRow(null);
        }
    }
    // NAVIGATION
    const navigation = (item, TO, FROM) => {
        switch (FROM) {
            case "general":
                toggle(false)
                break;
            case "edit":
                toggle_n(false)
                break;
            case "archive":
                toggle_d(false)
                break;
            case "check":
                toggle_c(false)
                break;
            case "alert":
                toggle_alert(false)
                break;
            case "clock":
                toggle_clock(false)
                break;
            case "record_arc":
                toggle_recordArc(false)
                break;
            case "record_law":
                toggle_recordLaw(false)
                break;
            case "record_eng":
                toggle_recordEng(false)
                break;
            case "record_ph":
                toggle_recordPH(false)
                break;
            case "record_review":
                toggle_recordReview(false)
                break;
            case "expedition":
                toggle_exp(false)
                break;
            case "macro":
                toggle_macro(false)
                break;

        }
        switch (TO) {
            case "general":
                toggle(item)
                break;
            case "edit":
                toggle_n(item)
                break;
            case "archive":
                toggle_d(item)
                break;
            case "check":
                toggle_c(item)
                break;
            case "alert":
                toggle_alert(item)
                break;
            case "clock":
                toggle_clock(item)
                break;
            case "record_arc":
                toggle_recordArc(item)
                break;
            case "record_law":
                toggle_recordLaw(item)
                break;
            case "record_eng":
                toggle_recordEng(item)
                break;
            case "record_ph":
                toggle_recordPH(item)
                break;
            case "record_review":
                toggle_recordReview(item)
                break;
            case "expedition":
                toggle_exp(item)
                break;
            case "macro":
                setDate_start(dayjs(document.getElementById('load_macro_date_1').value).format('YYYY-MM-DD'));
                setDate_end(dayjs(document.getElementById('load_macro_date_2').value).format('YYYY-MM-DD'));
                toggle_macro(item)
                break;
        }
    }
    const navigation_version = (STEP) => {
        switch (STEP) {
            case "minus":
                setCurrentVersion(prev => prev - 1);
                break;
            case "plus":
                setCurrentVersion(prev => prev + 1);
                break;
        }
    }
    // END MODAL CONTROLS
    const setItemData = (item) => {
        setCurrentVersion(item.version);
        setCurrentId(item.id);
        setCurrentLastVersion(item.version);
        setCurrentDate(item.clock_payment ?? <label className='fw-bold text-danger'>FECHA PENDIENTE</label>);
        setCurrentPublic(item.id_public);
        setSelectedRow(item.id);
    }

    const requestUpdate = (id) => {
        FUNService.get(id).then(response => {
            let item = response.data
            setCurrentItem(item);
            setCurrentId(item.id);
            setCurrentVersion(item.version);
            retrievePublish();
        })
    }
    const handleDuplicateSuccess = (newId) => {
        toggle(); // close current general modal
        FUNService.get(newId)
            .then(response => {
                toggle(response.data); // re-open with new project
                retrievePublish();
            })
            .catch(e => {
                console.log(e);
            });
    }
    // HELPER FUNCTIONS
    const setSubtmitRows = (items) => {
        setSubmitItems(items);
    }
    const _REGEX_MATCH_PH = (_string) => {
        let regex0 = /p\.\s+h/i;
        let regex1 = /p\.h/i;
        let regex2 = /propiedad\s+horizontal/i;
        let regex3 = /p\s+h/i;
        if (regex0.test(_string) || regex2.test(_string) || regex1.test(_string) || regex3.test(_string)) return true;
        return false
    }

    const modalHeader = <div className="my-3 d-flex justify-content-between">
            <label>ULTIMA VERSIÓN :{currentLastVersion}</label>
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
            toggle_macro();
            let date_a = document.getElementById("load_macro_date_1").value;
            let date_b = document.getElementById("load_macro_date_2").value;
            var date_start_val = date_a;
            var date_end_val = date_b;
            if (dayjs(date_a).diff(date_b) >= 0) {
                date_start_val = date_b;
                date_end_val = date_a;
            }
            setDate_start(date_start_val);
            setDate_end(date_end_val);
        }
        const handleFillClick = (state) => {
            setFillActive(prev => (prev === state ? prev : state));
            setMountedTabs(prev => (prev[state] ? prev : { ...prev, [state]: true }));
        };
        let openReport = (event) => {
            event.preventDefault();
            let date_a = document.getElementById("load_macro_date_1_s").value;
            let date_b = document.getElementById("load_macro_date_2_s").value;
            var date_start = date_a;
            var date_end = date_b;
            if (dayjs(date_a).diff(date_b) >= 0) {
                date_start = date_b;
                date_end = date_a;
            }
            setDate_start(date_start);
            setDate_end(date_end)
            toggle_report()
        };
        return (
            <div className="Publish container p-0">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Gestión de Licencias</h1>
                    <p className="text-sm text-muted-foreground mt-1">Detalle y administración de trámites de licencias urbanísticas</p>
                </div>

                <div className="row mb-4 d-flex justify-content-center">
                    <div className="col-lg-11 col-md-12">
                        <h1 className="text-center my-4">GESTIÓN DE SOLICITUDES</h1>
                        <hr />
                    </div>

                    <SUBMIT_X_FUN translation={translation} globals={globals}
                        setSubtmitRows={setSubtmitRows}
                        type={"LIC"} simple hide
                        retrievSingle={retrievSingle}
                        openModal={openModal} />

                    <FUN_WORKER_ASIGN translation={translation} globals={globals}
                        type={"law"}
                        openModal={openModal} />
                    <FUN_WORKER_ASIGN translation={translation} globals={globals}
                        type={"arc"}
                        openModal={openModal} />
                    <FUN_WORKER_ASIGN translation={translation} globals={globals}
                        type={"eng"}
                        openModal={openModal} />

                    <div className="row">
                        <h2 className="text-uppercase text-center pb-2">ACCIONES</h2>
                        <div className="col-md-6">
                            <div className="rounded-lg border bg-card p-4 bg-card mb-3">
                                <div>
                                    <h4 className="text-center font-semibold mb-3">CARGAR MACROTABLA</h4>
                                    <form onSubmit={loadMacro} id="fun_form_macro_table">
                                        <div className='row'>
                                            <div className='col'>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-info text-white">
                                                        <i className="far fa-calendar-alt"></i>
                                                    </span>
                                                    <input type="date" className="form-control" id="load_macro_date_1" required
                                                        defaultValue={dayjs().subtract(12, 'months').format('YYYY-MM-DD')} />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-info text-white">
                                                        <i className="far fa-calendar-alt"></i>
                                                    </span>
                                                    <input type="date" className="form-control" id="load_macro_date_2" required
                                                        defaultValue={dayjs().format('YYYY-MM-DD')} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <button className="btn btn-danger mt-1"><i className="fas fa-th"></i> CARGAR </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="rounded-lg border bg-card p-4 bg-card mb-3">
                                <div>
                                    <h4 className="text-center font-semibold mb-3">REPORTES</h4>
                                    <form onSubmit={openReport} id="fun_form_macro_table">
                                        <div className='row'>
                                            <div className='col'>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-info text-white">
                                                        <i className="far fa-calendar-alt"></i>
                                                    </span>
                                                    <input type="date" className="form-control" id="load_macro_date_1_s" required
                                                        defaultValue={dayjs().startOf('month').format('YYYY-MM-DD')} />
                                                </div>
                                            </div>
                                            <div className='col'>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-info text-white">
                                                        <i className="far fa-calendar-alt"></i>
                                                    </span>
                                                    <input type="date" className="form-control" id="load_macro_date_2_s" required
                                                        defaultValue={dayjs().endOf('month').format('YYYY-MM-DD')} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <button className="btn btn-primary mt-1"><i className="fas fa-file-alt"></i> CARGAR </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="nav nav-tabs">
                        
                            <button type="button" className={`nav-link ${fillActive === '4' ? "active" : ""}`} onClick={() => handleFillClick('4')}>
                                <label className="upper-case">PROCESOS DIARIOS</label>
                            </button>
                        

                        
                            <button type="button" className={`nav-link ${fillActive === '2' ? "active" : ""}`} onClick={() => handleFillClick('2')}>
                                <label className="upper-case">ENTRADA DE DOCUMENTOS </label>
                            </button>
                        
                        
                            <button type="button" className={`nav-link ${fillActive === '3' ? "active" : ""}`} onClick={() => handleFillClick('3')}>
                                <label className="upper-case">CARGA PROFESIONAL </label>
                            </button>
                        

                    </nav>

                    <MDBTabsContent>
                        <MDBTabsPane show={fillActive === '4'}>
                            {mountedTabs['4'] && <FUN_DAILY_COMPONENT translation={translation} swaMsg={swaMsg} globals={globals}
                                NAVIGATION_GEN={navigation}
                                requestUpdate={requestUpdate}
                                requesRefresh={retrievePublish}
                            />}
                        </MDBTabsPane>

                        <MDBTabsPane show={fillActive === '2'}>
                            {mountedTabs['2'] && <SUBMIT_X_FUN translation={translation} globals={globals}
                                setSubtmitRows={setSubtmitRows}
                                type={"LIC"}
                                retrievSingle={retrievSingle}
                                openModal={openModal}
                                listIncomplete={list_started} />}
                        </MDBTabsPane>
                        <MDBTabsPane show={fillActive === '3'}>
                            {mountedTabs['3'] && <FUN_ASIGNS_COMPONENT translation={translation} swaMsg={swaMsg} globals={globals}
                                NAVIGATION_GEN={navigation}
                                requestUpdate={requestUpdate}
                                requesRefresh={retrievePublish}
                            />}
                        </MDBTabsPane>
                    </MDBTabsContent>

                </div >

                {modal && <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={modal}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >

                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="far fa-file-alt"></i> DETALLES DE LA SOLICITUD - No. Radicación : {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle()} />
                    </div>
                    {modalHeader}

                    <FUNG
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version}
                        onDuplicateSuccess={handleDuplicateSuccess}
                    />

                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggle()}><i className="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>}

                {modal_c && <Modal contentLabel="FUN CHECKEO"
                    isOpen={modal_c}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="far fa-check-square"></i> LISTA DE CHECKEO : No. Radicación :  {currentPublic}</label>
                        <button type="button" className="btn-close" onClick={() => toggle_c()} />
                    </div>
                    {modalHeader}

                    <FUNC translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        requesRefresh={retrievePublish}
                        closeModal={toggle_c}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_c}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_n && <Modal contentLabel="FUN NEW/UPDATE"
                    isOpen={modal_n}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="fas fa-file-signature"></i> ACTUALIZACIÓN DE SOLICITUD - No. Radicación : {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle_n()} />
                    </div>
                    {modalHeader}

                    <FUNN translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        requesRefresh={retrievePublish}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_n}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_d && <Modal contentLabel="FUN DOC CONTROL"
                    isOpen={modal_d}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="fas fa-archive"></i> GESTIÓN DOCUMENTAL - No. Radicación :  {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle_d()} />
                    </div>
                    {modalHeader}

                    <FUND translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_d}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_alert && <Modal contentLabel="FUN ALERTA A VECINOS"
                    isOpen={modal_alert}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="fas fa-sign"></i> AVISOS A VECINOS - No. Radicación :  {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle_alert()} />
                    </div>
                    {modalHeader}

                    <FUN_ALERT translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        closeModal={toggle_alert}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_alert}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_clocK && <Modal contentLabel="FUN CLOCK"
                    isOpen={modal_clocK}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="far fa-clock"></i> CONTROL DE TIEMPO DE PROCESO - No. Radicación : {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle_clock()} />
                    </div>
                    {modalHeader}

                    <FUNCLOCK translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requesRefresh={retrievePublish}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_clock}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_record_arc && <Modal contentLabel="RECORDS ARCHITECTURE"
                    isOpen={modal_record_arc}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="far fa-building"></i> INFORME ARQUITECTÓNICO - No. Radicación :  {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle_recordArc()} />
                    </div>
                    {modalHeader}

                    <RECORD_ARC translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        requesRefresh={retrievePublish}
                        closeModal={toggle_recordArc}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_recordArc}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_record_law && <Modal contentLabel="RECORDS LAW"
                    isOpen={modal_record_law}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="fas fa-balance-scale"></i> INFORME JURIDICO - No. Radicación :  {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle_recordLaw()} />
                    </div>
                    {modalHeader}

                    <RECORD_LAW translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        closeModal={toggle_recordLaw}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_recordLaw}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_record_ph && <Modal contentLabel="RECORDS PH"
                    isOpen={modal_record_ph}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="fas fa-pencil-ruler"></i> INFORME PROPIEDAD HORIZONTAL - No. Radicación :  {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle_recordPH()} />
                    </div>
                    {modalHeader}

                    <RECORD_PH translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        requesRefresh={retrievePublish}
                        closeModal={toggle_recordPH}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_recordPH}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_record_eng && <Modal contentLabel="RECORDS ENG"
                    isOpen={modal_record_eng}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="fas fa-cogs"></i> INFORME ESTRUCTURAL - No. Radicación :  {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle_recordEng()} />
                    </div>
                    {modalHeader}

                    <RECORD_ENG translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        closeModal={toggle_recordLaw}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_recordEng}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_record_review && <Modal contentLabel="RECORDS REVIEW"
                    isOpen={modal_record_review}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="fas fa-file-contract"></i>ACTA DE OBSERVACIONES / CORRECCIONES - No. Radicación :  {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle_recordReview()} />
                    </div>
                    {modalHeader}

                    <RECORD_REVIEW translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        closeModal={toggle_recordReview}
                        NAVIGATION={navigation} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_recordReview}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_exp && <Modal contentLabel="EXPEDITION"
                    isOpen={modal_exp}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="far fa-file-alt"></i> EXPEDICIÓN DE LA LICENCIA:  {currentPublic} </label>
                        <button type="button" className="btn-close" onClick={() => toggle_exp()} />
                    </div>
                    {modalHeader}

                    <EXPEDITION translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requesRefresh={retrievePublish}
                        closeModal={toggle_exp}
                        NAVIGATION={navigation} />

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={toggle_exp}>
                            <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
                        </button>
                    </div>
                </Modal>}

                {modal_macro && <Modal contentLabel="MACRO TABLE"
                    isOpen={modal_macro}
                    style={customStylesForModalMacro()}
                    ariaHideApp={false}
                    className="macro-modal-content"
                    overlayClassName="macro-modal-overlay"
                >
                    <div className="my-1 d-flex justify-content-between">
                        <label><i className="fas fa-th"></i> Macro tabla de seguimiento: Desde {date_start} hasta {date_end}</label>
                        <button type="button" className="btn-close" onClick={() => toggle_macro()} />
                    </div>

                    <FUN_MACROTABLE translation={translation} swaMsg={swaMsg} globals={globals}
                        closeModal={toggle_macro}
                        NAVIGATION={navigation}
                        NAVIGATION_GEN={navigation}
                        NAVIGATION_GEN_NEGATIVE={toggle_NEGATIVE}
                        date_start={date_start}
                        date_end={date_end}
                        selectedRow={selectedRow}
                        setSelectedRow={(id) => setSelectedRow(id)}
                        defaultFilter={defaultFilter ?? false}
                    />

                </Modal>}

                {modal_report && <Modal contentLabel="REPORT"
                    isOpen={modal_report}
                    style={customStylesForModalMacro()}
                    ariaHideApp={false}
                    className="macro-modal-content"
                    overlayClassName="macro-modal-overlay"
                >
                    <div className="my-4 d-flex justify-content-around">
                        <div className='row'>
                            <div className='col'>

                            </div>
                        </div>

                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="form-group row">
                                <label className='col-form-label col-3'><i className="fas fa-file-alt"></i> REPORTE GENERAL DE SOLICITUDES </label>
                                <label className='col-form-label col-1 text-end'>FECHAS: </label>
                                <div className="col">
                                    <input type='date' max="2100-01-01" className='form-control form-control-sm mt-2' defaultValue={date_start} onBlur={(e) => setDate_start(e.target.value)} />
                                </div>
                                <div className="col">
                                    <input type='date' max="2100-01-01" className='form-control form-control-sm mt-2' defaultValue={date_end} onBlur={(e) => setDate_end(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="col-1 text-end"><button type="button" className="btn-close" onClick={() => toggle_report()} /></div>
                    </div>

                    <hr />

                    <FUN_REPORT_GEN translation={translation} swaMsg={swaMsg} globals={globals}
                        data={list_complete}
                        date_i={date_start}
                        date_f={date_end}
                    />

                </Modal>}
            </div >
        );
}

export default FUN_MANAGE;
