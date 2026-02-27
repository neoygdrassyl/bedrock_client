import { useReducer, useEffect, useRef } from 'react';
import { MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBBtn, MDBBreadcrumb, MDBBreadcrumbItem, MDBTooltip, MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent, MDBTabsPane, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBDropdownLink, MDBPopover, MDBPopoverBody } from '../../components/ui';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';
import IMG_SEARCH_ICON from '../../img/pqrs/Buscaricono-01.png'

// SERVICES
import FUNService from '../../services/fun.service'
import USER_SERVICE from '../../services/users.service';

// FUN FAMILY!
import FUNC from './fun_forms/fun_c'
import FUNG from './fun_forms/fun_g'
import FUNN from './fun_forms/fun_n'
import FUND from './fun_forms/components/fun_docs'
import FUN_ALERT from './fun_forms/fun_alertn';
import FUNCLOCK from './fun_forms/fun_clock';

import { dateParser, dateParser_finalDate, dateParser_timePassed, dateParser_timeLeft, formsParser1, regexChecker_isPh, regexChecker_isOA, regexChecker_isOA_2 } from '../../components/customClasses/typeParse';

// RECORDS
import RECORD_ARC from './records/record_arc';
import RECORD_LAW from './records/record_law';
import RECORD_PH from './records/record_ph';
import RECORD_ENG from './records/record_eng';
import FUN_ICON_PROGRESS from './fun_forms/components/icon_progress.compoennt';
import FUN_WORKER_ASIGN from './fun_forms/components/fun_worker_asign.component';
import RECORD_REVIEW from './records/record_review';
import EXPEDITION from './expeditions/expedition.page';
import FUN_REPORT_GEN from './fun_forms/fun_reports/fun_gen.report';
import { nomens } from '../../components/jsons/vars';
import SUBMIT_X_FUN from './submit/submit_x_fun.component';
import TABLE_COMPONENT_EXPANDED from './fun_forms/components/table_components/table.component_expanded';


// JSONS
const moment = require('moment');
const momentB = require('moment-business-days');
const MySwal = withReactContent(Swal);

function FUN({ translation, swaMsg, globals, breadCrums, urlParams }) {
    const [state, setState] = useReducer(
        (prev, next) => ({ ...prev, ...next }),
        {
            error: null,
            isLoaded: false,
            isLoadedSearch: false,
            currentItem: null,
            currentItemAsignProf: null,
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
            modal_asign_prof: false,

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

            fillActive: '1',
            fillActive2: '1',
            clocks: [],

            worker_list: [],

            currentId: undefined,
            currentLastVersion: undefined,
            currentDate: undefined,
            currentPublic: undefined,
            currentItems: undefined,
            load: undefined,
            date_start: undefined,
            date_end: undefined,
        }
    );

    const prevUrlParamsRef = useRef(urlParams);

    useEffect(() => {
        retrievePublish();
        setSubtmitRows();
        retrieveWorkers();
        if (urlParams) LOAD_BY_URL();
    }, []);

    useEffect(() => {
        if (urlParams !== prevUrlParamsRef.current && urlParams != null) {
            console.log(urlParams);
            LOAD_BY_URL();
        }
        prevUrlParamsRef.current = urlParams;
    }, [urlParams]);

    function LOAD_BY_URL() {
        // Placeholder — urlParams is not currently passed to this component
    }

    function retrieveWorkers() {
        USER_SERVICE.getAll()
            .then(response => {
                setState({ worker_list: response.data })
            })
            .catch(e => {
                console.log(e);
            });
    }
    function retrievePublish() {
        FUNService.getAll_fun()
            .then(response => {
                asignList(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }
    function retrievSingle(id) {
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
    function retrieveMacroSingle(id) {
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        FUNService.loadMacroSingle(null, null, id)
            .then(response => {
                if (response.data.length) setState({ currentItemAsignProf: response.data, modal_asign_prof: true })
                else setState({ currentItemAsignProf: null, modal_asign_prof: null })
                MySwal.close();
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
    function retrieveSearch(field, string) {
        FUNService.getSearch(field, string)
            .then(response => {
                setState({
                    list_search: response.data,
                    isLoadedSearch: false,
                });
                //asignList(response.data);
                MySwal.close();
            })
            .catch(e => {
                console.log(e);
            });
    }
    function refreshList() {
        retrievePublish();
        setState({
            currentItem: null,
            currentIndex: -1,
        });
    }
    function asignList(_LIST) {
        let statrted = [];
        let incomplete = [];
        let legal = [];
        let profesonal = [];
        let expedition = [];
        let archive = [];
        for (const item in _LIST) {
            let itemState = _LIST[item].state
            let object = _LIST[item]
            if (itemState >= 100) {
                archive.push(object)
            }
            else {
                if (regexChecker_isPh(object, true) || regexChecker_isOA(object)) {
                    profesonal.push(object)
                } else {
                    if (itemState < -100) {
                        incomplete.push(object)
                    }
                    if (itemState >= -1 && itemState < 5) {
                        statrted.push(object)
                    }
                    if (itemState >= 5 && itemState < 50) {
                        legal.push(object)
                    }
                    if (itemState >= 50) {
                        expedition.push(object)
                    }
                }
            }


        }
        setState({
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
    function openModal(item, TO) {
        navigation(item, TO, '');
    }

    function toggle(item) {
        if (item) {
            setItem(item)
        }
        setState({
            modal: !state.modal,
            modal_macro: false,
        });
    }
    function toggle_NEGATIVE(item) {
        if (item) {
            setState({
                currentVersion: item.version,
                currentId: item.id_sistem,
                currentLastVersion: item.version,
                currentDate: item.date,
                currentPublic: item.id_public,
                selectedRow: item.id_sistem
            });
        }
        setState({
            modal: !state.modal,
            modal_macro: false,
        });
    }
    const getToggle = () => {
        return state.modal;
    }
    const getToggle_c = () => {
        return state.modal_c;
    }
    const toggle_c = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_c: !state.modal_c
        });
    }
    const getToggle_n = () => {
        return state.modal_n;
    }
    const toggle_n = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_n: !state.modal_n
        });
    }
    const getToggle_d = () => {
        return state.modal_d;
    }
    const toggle_d = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_d: !state.modal_d
        });
    }
    const getToggle_alert = () => {
        return state.modal_alert;
    }
    const toggle_alert = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_alert: !state.modal_alert
        });
    }
    const getToggle_recordArc = () => {
        return state.modal_record_arc;
    }
    const toggle_recordArc = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_record_arc: !state.modal_record_arc
        });
    }
    const toggle_recordLaw = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_record_law: !state.modal_record_law
        });
    }
    const getToggle_recordLaw = () => {
        return state.modal_record_law;
    }
    const toggle_recordEng = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_record_eng: !state.modal_record_eng
        });
    }
    const getToggle_recordEng = () => {
        return state.modal_record_eng;
    }
    const getToggle_recordPH = () => {
        return state.modal_record_ph;
    }
    const toggle_recordPH = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_record_ph: !state.modal_record_ph
        });
    }
    const toggle_recordReview = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_record_review: !state.modal_record_review
        });
    }
    const getToggle_recordReview = () => {
        return state.modal_record_review;
    }
    const toggle_exp = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_exp: !state.modal_exp
        });
    }
    const getToggle_exp = () => {
        return state.modal_exp;
    }
    const getToggle_clock = () => {
        return state.modal_clocK;
    }
    const toggle_clock = (item) => {
        if (item) {
            setItem(item)
        }
        setState({
            modal_clocK: !state.modal_clocK
        });
    }
    const getToggle_macro = () => {
        return state.modal_macro;
    }
    const toggle_macro = (item) => {
        setState({
            modal_macro: !state.modal_macro,
        });
        if (item) {
            setState({
                selectedRow: item.id,

            });
        } else {
            setState({
                selectedRow: null,

            });
        }
    }
    const toggle_report = (item) => {
        setState({
            modal_report: !state.modal_report,
        });
        if (item) {
            setState({
                selectedRow: item.id,

            });
        } else {
            setState({
                selectedRow: null,

            });
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
                setState({
                    date_start: moment(document.getElementById('load_macro_date_1').value).format('YYYY-MM-DD'),
                    date_end: moment(document.getElementById('load_macro_date_2').value).format('YYYY-MM-DD'),
                })
                toggle_macro(item)
                break;
        }
    }
    const navigation_version = (STEP) => {
        switch (STEP) {
            case "minus":
                setState({ currentVersion: state.currentVersion - 1 });
                break;
            case "plus":
                setState({ currentVersion: state.currentVersion + 1 });
                break;
        }
    }
    // END MODAL CONTROLS
    function setItem(item) {
        setState({
            currentVersion: item.version,
            currentId: item.id,
            currentLastVersion: item.version,
            currentDate: item.clock_payment ?? <label className='fw-bold text-danger'>FECHA PENDIENTE</label>,
            currentPublic: item.id_public,
            selectedRow: item.id
        });
    }

    function requestUpdate(id) {
        FUNService.get(id).then(response => {
            let item = response.data
            setState({
                currentItem: item,
                currentId: item.id,
                currentVersion: item.version
            })
            retrievePublish();
        })
    }
    // HELPER FUNCTIONS
    function setSubtmitRows() {
        var end_date = moment().format('YYYY-MM-DD');
        var start_date = momentB(end_date, 'YYYY-MM-DD').businessSubtract(15)._d;
        start_date = moment(start_date).format('YYYY-MM-DD');

        FUNService.loadSubmit2(start_date, end_date)
            .then(response => {
                if (response.data.length) {
                    setState({
                        currentItems: response.data,
                        load: true,
                    })
                    var submitItems = [];
                    for (var i = 0; i < response.data.length; i++) {
                        submitItems.push(response.data[i].id)
                    }
                    setState({ submitItems: submitItems })
                }
            })
            .catch(e => {
                console.log(e);
            });

    }
    function _REGEX_MATCH_PH(_string) {
        let regex0 = /p\.\s+h/i;
        let regex1 = /p\.h/i;
        let regex2 = /propiedad\s+horizontal/i;
        let regex3 = /p\s+h/i;
        if (regex0.test(_string) || regex2.test(_string) || regex1.test(_string) || regex3.test(_string)) return true;
        return false
    }
    // --- RENDER ---
        const { currentItemAsignProf, currentVersion, currentId, isLoaded, list_started, list_incomplete, list_search, worker_list } = state;

        const modalHeader = <div className="my-3 d-flex justify-content-between">
            <label>ULTIMA VERSIÓN :{state.currentLastVersion}</label>
        </div>
        let _GET_MISSING_CONTEXT = (state) => {
            if (state == '-1') return <label className="fw-bold">INCOMPLETO</label>
            if (state == '-101') return <label className="fw-bold text-danger">DESISTIMIENTO POR INCOMPLETO</label>
            if (state == '-102') return <label className="fw-bold text-danger">NO CUMPLE ACTA DE OBSERVACIONES</label>
            if (state == '-103') return <label className="fw-bold text-danger">NO CUMPLE ACTA DE CORRECIONES</label>
            if (state == '-104') return <label className="fw-bold text-danger">NO PAGO EXPENSAS VARIABLES</label>
            if (state == '-105') return <label className="fw-bold text-danger">VOLUNTARIO</label>
            if (state == '-106') return <label className="fw-bold text-danger">NEGADA</label>
        }
        let _GET_MISSING_DATE = (row) => {
            if (row.state == '-1') return false
            if (row.state == '-101') return row.clock_close_1
            if (row.state == '-102') return row.clock_close_2
            if (row.state == '-103') return row.clock_close_3
            if (row.state == '-104') return row.clock_close_4
            if (row.state == '-105') return row.clock_close_5
            if (row.state == '-106') return row.clock_close_6
        }
        let _GET_STATE_STR = (state, isString, row) => {
            if (state < '-1') return isString ? 'DESISTIDO (Ejecución)' : <label className='text-danger text-center'>DESISTIDO (Ejecución)</label>
            if (state == '-1') return 'INCOMPLETO'
            if (state == '1') return 'INCOMPLETO'
            if (state == '5') return 'LYDF'
            if (state == '50') return 'EXPEDICIÓN'
            if (state == '100') return isString ? 'ARCHIVADO' : <label className='fw-bold'>CERRADO</label>
            if (state == '101') return isString ? 'ARCHIVADO' : <label className='fw-bold text-primary'>ARCHIVADO</label>
            if (state == '200') {
                if (isString) {
                    if (row.clock_close_6) return 'NEGADA'
                    if (row.clock_close_5) return 'DESISTIDO (Voluntario)'
                    if (row.clock_close_4) return 'DESISTIDO (No radicó pagos'
                    if (row.clock_close_3) return 'DESISTIDO (No subsanó Acta)'
                    if (row.clock_close_2) return 'DESISTIDO (No radicó valla)'
                    if (row.clock_close_1) return 'DESISTIDO (Incompleto)'
                } else return <label className='fw-bold text-center'>CERRADO (Desistido)</label>
            }
            if (state == '201') return isString ? 'DESISTIDO (Incompleto)' : <label className='text-danger text-center'>DESISTIDO (Incompleto)</label>
            if (state == '202') return isString ? 'DESISTIDO (No radicó valla)' : <label className='text-danger text-center'>DESISTIDO (No radicó valla)</label>
            if (state == '203') return isString ? 'DESISTIDO (No subsanó Acta)' : <label className='text-danger text-center'>DESISTIDO (No subsanó Acta)</label>
            if (state == '204') return isString ? 'DESISTIDO (No radicó pagos)' : <label className='text-danger text-center'>DESISTIDO (No radicó pagos)</label>
            if (state == '205') return isString ? 'DESISTIDO (Voluntario)' : <label className='text-danger text-center'>DESISTIDO (Voluntario)</label>
            if (state == '206') return isString ? 'DESISTIDO (Negada)' : <label className='text-danger text-center'>DESISTIDO (Negada)</label>
            return ''
        }
        const _fun_0_type = { '0': 'NC', 'i': 'I', 'ii': "II", 'iii': "III", 'iv': "IV", 'oa': "OA" }
        const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
        // ----------------------
        const rowSelectedStyle = [
            {
                when: row => (state.submitItems).includes(row.id),
                style: {
                    backgroundColor: 'Skyblue',
                },
            },
            {
                when: row => row.id == state.selectedRow,
                style: {
                    backgroundColor: 'BlanchedAlmond',
                },

            },

        ];

        // ---------------------
        const columns = [
            {
                name: <label className="text-center">No. RADICACIÓN</label>,
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '130px',
                cell: row => <h6 className='fw-normal'>{(row.id_public)}</h6>
            },
            {
                name: <label className="text-center">TIPO</label>,
                minWidth: '350px',
                cell: row => <label>{formsParser1(row, true)}</label>
            },
            {
                name: <label className="text-center">CAT.</label>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <label>{_fun_0_type[row.type]}</label>
            },
            {
                name: <label className="text-center">FECHA PAGO EXPENSAS FIJAS</label>,
                selector: row => row.clock_payment,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{(row.clock_payment)}</label>
            },
            {
                name: <label className="text-center">FECHA LIMITE LyDF</label>,
                selector: row => dateParser_finalDate(row.clock_payment, 30),
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{dateParser_finalDate(row.clock_payment, 30)}</label>
            },
            {
                name: <label className="text-center">TIEMPO RESTANTE</label>,
                selector: row => row.clock_payment,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => {
                    let time = 30 - dateParser_timePassed(row.clock_payment)
                    return <label><label className={time <= 0 ? 'text-danger fw-bold' : ''}>{time}</label> / 30</label>
                }
            },

            {
                name: <label className="text-center">PROGRESIÓN</label>,
                center: true,
                minWidth: '320px',
                cell: row => <FUN_ICON_PROGRESS translation={translation} globals={globals} currentItem={row} />
            },
            {
                name: <label className="text-center">ACCIÓN</label>,
                button: true,
                center: true,
                minWidth: '80px',
                cell: row => <>
                    <MDBPopover size='sm' color='info' btnChildren={'MENU'} placement='right' dismiss>
                        {_MODULE_BTN_POP(row)}
                    </MDBPopover>
                </>,
            },
        ]
        const columns_missing = [
            {
                name: <label className="text-center">No. RADICACIÓN</label>,
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{(row.id_public)}</label>
            },
            {
                name: <label className="text-center">TIPO</label>,
                minWidth: '350px',
                cell: row => <label>{formsParser1(row, true)}</label>
            },
            {
                name: <label className="text-center">CAT.</label>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <label>{_fun_0_type[row.type]}</label>
            },
            {
                name: <label className="text-center">MOTIVO</label>,
                selector: row => _GET_MISSING_CONTEXT(row.state),
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{_GET_MISSING_CONTEXT(row.state)}</label>
            },
            {
                name: <label className="text-center">FECHA PAGO EXPENSAS</label>,
                selector: row => row.clock_payment,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{(row.clock_payment)}</label>
            },
            {
                name: <label className="text-center">PROGRESION</label>,
                center: true,
                minWidth: '320px',
                cell: row => <FUN_ICON_PROGRESS translation={translation} globals={globals} currentItem={row} />
            },
            {
                name: <label>ACCION</label>,
                button: true,
                minWidth: '80px',
                cell: row => <>
                    <MDBPopover size='sm' color='info' btnChildren={'MENU'} placement='right' dismiss>
                        {_MODULE_BTN_POP(row)}
                    </MDBPopover>
                </>,
            },
        ]
        const columns_legal = [
            {
                name: <label>No. RADICACION</label>,
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                cell: row => <label>{row.id_public}</label>
            },
            {
                name: <label className="text-center">TIPO</label>,
                minWidth: '350px',
                cell: row => <label>{formsParser1(row, true)}</label>
            },
            {
                name: <label className="text-center">CAT.</label>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <label>{_fun_0_type[row.type]}</label>
            },
            {
                name: <label className="text-center">FECHA LYDF</label>,
                selector: row => row.clock_date,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{(row.clock_date)}</label>
            },
            {
                name: <label className="text-center">PROGRESION</label>,
                center: true,
                minWidth: '330px',
                cell: row => <FUN_ICON_PROGRESS translation={translation} globals={globals} currentItem={row} />
            },
            {
                name: <label>ACCION</label>,
                button: true,
                minWidth: '100px',
                cell: row => <>
                    <MDBPopover size='sm' color='info' btnChildren={'MENU'} placement='right' dismiss>
                        {_MODULE_BTN_POP(row)}
                    </MDBPopover>
                </>,
            },
        ]
        const columns_exp = [
            {
                name: <label>No. RADICACION</label>,
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                cell: row => <label>{row.id_public}</label>
            },
            {
                name: <label className="text-center">TIPO</label>,
                minWidth: '350px',
                cell: row => <label>{formsParser1(row, true)}</label>
            },
            {
                name: <label className="text-center">CAT.</label>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <label>{_fun_0_type[row.type]}</label>
            },
            {
                name: <label className="text-center">FECHA VIAVILIDAD</label>,
                selector: row => row.clock_pay2,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{(row.clock_pay2)}</label>
            },
            {
                name: <label className="text-center">PROGRESION</label>,
                center: true,
                minWidth: '330px',
                cell: row => <FUN_ICON_PROGRESS translation={translation} globals={globals} currentItem={row} />
            },
            {
                name: <label>ACCION</label>,
                button: true,
                minWidth: '100px',
                cell: row => <>
                    <MDBPopover size='sm' color='info' btnChildren={'MENU'} placement='right' dismiss>
                        {_MODULE_BTN_POP(row)}
                    </MDBPopover>
                </>,
            },
        ]
        const columns_profesional = [
            {
                name: <label>No. RADICACION</label>,
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                cell: row => <label>{row.id_public}</label>
            },
            {
                name: <label className="text-center">TIPO</label>,
                minWidth: '350px',
                cell: row => <label>{formsParser1(row, true)}</label>
            },
            {
                name: <label className="text-center">CAT.</label>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <label>{_fun_0_type[row.type]}</label>
            },
            {
                name: <label className="text-center">FECHA PAGO EXPENSAS</label>,
                selector: row => row.clock_payment,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{(row.clock_payment)}</label>
            },
            {
                name: <label className="text-center">FECHA LYDF</label>,
                selector: row => row.clock_date,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{(row.clock_date)}</label>
            },
            {
                name: <label className="text-center">PROGRESION</label>,
                center: true,
                minWidth: '330px',
                cell: row => <FUN_ICON_PROGRESS translation={translation} globals={globals} currentItem={row} />
            },
            {
                name: <label>ACCION</label>,
                button: true,
                minWidth: '100px',
                cell: row => <>
                    <MDBPopover size='sm' color='info' btnChildren={'MENU'} placement='right' dismiss>
                        {_MODULE_BTN_POP(row)}
                    </MDBPopover>
                </>,
            },
        ]
        const columns_archive = [
            {
                name: <label>No. RADICACION</label>,
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                cell: row => row.id_public
            },
            {
                name: <label className="text-center">TIPO</label>,
                minWidth: '350px',
                cell: row => formsParser1(row, true),
            },
            {
                name: <label className="text-center">CAT.</label>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => _fun_0_type[row.type]

            },
            {
                name: <label>ESTADO</label>,
                selector: row => _GET_STATE_STR(row.state, true, row),
                sortable: true,
                filterable: true,
                center: true,
                cell: row => _GET_STATE_STR(row.state),
                cvsCB: row => _GET_STATE_STR(row.state, true, row)
            },
            {
                name: <label className="text-center">FECHA ARCHIVACIÓN</label>,
                selector: row => row.clock_archive,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => row.clock_archive
            },
            {
                name: <label className="text-center">PROGRESION</label>,
                center: true,
                minWidth: '330px',
                ignoreCSV: true,
                cell: row => <FUN_ICON_PROGRESS translation={translation} globals={globals} currentItem={row} />
            },
            {
                name: <label>ACCION</label>,
                button: true,
                minWidth: '100px',
                ignoreCSV: true,
                cell: row => <>
                    <MDBPopover size='sm' color='info' btnChildren={'MENU'} placement='right' dismiss>
                        {_MODULE_BTN_POP(row)}
                    </MDBPopover>
                </>,
            },
        ]
        const columns_search = [
            {
                name: <label className="text-center">No. RADICACIÓN</label>,
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '130px',
                cell: row => <h6 className='fw-normal'>{(row.id_public)}</h6>
            },
            {
                name: <label className="text-center">TIPO</label>,
                minWidth: '350px',
                cell: row => <label>{formsParser1(row, true)}</label>
            },
            {
                name: <label className="text-center">CAT.</label>,
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <label>{_fun_0_type[row.type]}</label>
            },
            {
                name: <label className="text-center">ESTADO</label>,
                selector: row => row.state,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => _GET_STATE_STR(row.state)
            },
            {
                name: <label className="text-center">PROGRESIÓN</label>,
                center: true,
                minWidth: '320px',
                cell: row => <FUN_ICON_PROGRESS translation={translation} globals={globals} currentItem={row} />
            },
            {
                name: <label className="text-center">ACCIÓN</label>,
                button: true,
                center: true,
                minWidth: '80px',
                cell: row => <>
                    <MDBPopover size='sm' color='info' btnChildren={'MENU'} placement='right' dismiss>
                        {_MODULE_BTN_POP(row)}
                    </MDBPopover>
                </>,
            },
        ]

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
                    zIndex: 1040,
                },
                content: {
                    position: 'absolute',
                    top: '10px',
                    left: '260px',
                    right: '1%',
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
                    zIndex: 1040,
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
        // CHECKS IDS FOR NEW FUN
        let _GET_LAST_ID_PUBLIC = () => {
            let new_id = "";
            FUNService.getLastIdPublic()
                .then(response => {
                    if (response.data.length) {
                        new_id = response.data[0].id;
                        if (new_id) {
                            let _id = new_id.split('-')
                            let concecutive = _id[3];
                            concecutive = Number(concecutive) + 1
                            if (concecutive < 1000) concecutive = "0" + concecutive
                            if (concecutive < 100) concecutive = "0" + concecutive
                            if (concecutive < 10) concecutive = "0" + concecutive
                            new_id = `${_id[0]}-${_id[1]}-${_id[2]}-${concecutive}`
                            document.getElementById('f_02').value = new_id;
                        } else document.getElementById('f_02').value = nomens + moment().format('YY') + "-0001";
                    } else document.getElementById('f_02').value = nomens + moment().format('YY') + "-0001";
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte.",
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });

        }
        let _MODULE_BTN_POP = (row) => {
            const isOA = regexChecker_isOA_2(row)
            let rules = row.rules ? row.rules.split(';') : [];

            return <MDBPopoverBody>
                <div class="list-group list-group-flush">
                    <button type="button" onClick={() => toggle(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-folder-open text-info" ></i> DETALLES</button>
                    <button type="button" onClick={() => toggle_clock(row)} class="list-group-item list-group-item-action p-1 m-0 " ><i class="far fa-clock text-secondary" ></i> TIEMPOS</button>
                    <button type="button" onClick={() => toggle_d(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-archive text-secondary" ></i> DOCUMENTOS</button>
                    {row.state != 101 && row.state <= 200 ?
                        <>
                            <button type="button" onClick={() => toggle_n(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-folder-open text-secondary" ></i> ACTUALIZAR</button>
                            <button type="button" onClick={() => toggle_c(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-check-square text-warning" ></i> CHECKEO</button>
                            {regexChecker_isPh(row, true) ?
                                <>
                                    <button type="button" onClick={() => toggle_recordPH(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-pencil-ruler text-warning" ></i>  INF. P.H.</button>
                                    <button type="button" onClick={() => toggle_exp(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-file-alt text-warning" ></i> EXPEDICIÓN</button>
                                </>
                                :
                                <>
                                    {!isOA && rules[0] != 1 ? <>
                                        <button type="button" onClick={() => toggle_alert(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-sign text-warning" ></i>  PUBLICIDAD</button>
                                    </> : ''}

                                    <button type="button" onClick={() => toggle_recordLaw(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-balance-scale text-warning" ></i> INF. JURIDICO</button>
                                    {!isOA ? <>
                                        <button type="button" onClick={() => toggle_recordArc(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-building text-warning" ></i> INF. ARQUITECTÓNICO</button>
                                        {rules[1] != 1 ? <button type="button" onClick={() => toggle_recordEng(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-cogs text-warning" ></i> INF. ESTRUCTURAL</button> : ''}

                                        <button type="button" onClick={() => toggle_recordReview(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-file-contract text-warning" ></i> ACTA</button>
                                    </> : ''}
                                    <button type="button" onClick={() => toggle_exp(row)} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-file-alt text-warning" ></i> EXPEDICIÓN</button>
                                </>}
                        </> : <></>}
                    {window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 5 || window.user.roleId == 2 ? <>
                        <button type="button" onClick={() => retrieveMacroSingle(row.id)} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-user-clock"></i> ASIGNAR</button>
                    </> : null}
                </div>
            </MDBPopoverBody>
        }

        var formData = new FormData();

        // CREATES A NEW LICENCE
        let handleSubmit = (event) => {
            event.preventDefault();

            formData = new FormData();
            let date = document.getElementById("f_01").value;
            formData.set('date', date);
            let id_public = document.getElementById("f_02").value;
            formData.set('id_public', id_public);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        refreshList();
                    }
                    else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACION",
                            text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                    else {
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
        };

        let search = (event) => {
            event.preventDefault();
            let field = document.getElementById("search_0").value;
            let string = document.getElementById("search_1").value;
            if (string) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                retrieveSearch(field, string);
            } else {
                refreshList();
                setState({
                    list_search: [],
                    isLoadedSearch: false,
                })
            }
        };
        const handleFillClick = (value) => {
            if (value === state.fillActive) {
                return;
            }
            setState({ fillActive: value });
        };

        let generateCVS = (_data, _name) => {
            var rows = [];

            let extraColumns = [
                {
                    name: <label className="text-center">FECHA DE LICENCIA</label>,
                    cell: row => row.clock_license
                }
            ]

            let _columns = [...columns_archive, ...extraColumns]
            const headRows = _columns.filter(c => c.ignoreCSV == undefined).map(c => { return c.name.props.children })
            rows = _data.map(d =>
                _columns.filter(c => c.ignoreCSV == undefined).map(c => {
                    if (c.cvsCB) return (String(c.cvsCB(d) ?? '')).replace(/[\n\r]+ */g, ' ')
                    else return (String(c.cell(d) ?? '')).replace(/[\n\r]+ */g, ' ')
                }
                )
            );

            rows.unshift(headRows);

            let csvContent = "data:text/csv;charset=utf-8,"
                + rows.map(e => e.join(";")).join("\n");


            var encodedUri = encodeURI(csvContent);
            const fixedEncodedURI = encodedUri.replaceAll('#', '%23').replaceAll('°', 'r');

            var link = document.createElement("a");
            link.setAttribute("href", fixedEncodedURI);
            link.setAttribute("download", `${_name ?? 'LICENCIAS URBANISTICAS'}.csv`);
            document.body.appendChild(link); // Required for FF

            link.click();
        }

        return (
            
            <div className="Publish container-fluid p-0 mb-4">
                <div className="row d-flex p-0">

                        <div className="col-12 d-flex justify-content-start p-0">
                            <MDBBreadcrumb className="mb-0 p-0 ms-0">
                                <MDBBreadcrumbItem>
                                <Link to="/home"><i className="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                                </MDBBreadcrumbItem>
                                <MDBBreadcrumbItem>
                                <Link to="/dashboard"><i className="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                                </MDBBreadcrumbItem>
                                <MDBBreadcrumbItem active>
                                <i className="fas fa-file-alt"></i> <label className="text-uppercase">RADICACIÓN DE SOLICITUDES</label>
                                </MDBBreadcrumbItem>
                            </MDBBreadcrumb>
                        </div>
                    <div className="col-lg-11 col-md-12">
                        <h1 className="text-center my-4">RADICACIÓN DE SOLICITUDES</h1>
                        <hr />
                    </div>

                    <FUN_WORKER_ASIGN translation={translation} globals={globals}
                        type={"law"}
                        openModal={openModal} />
                    <FUN_WORKER_ASIGN translation={translation} globals={globals}
                        type={"arc"}
                        openModal={openModal} />
                    <FUN_WORKER_ASIGN translation={translation} globals={globals}
                        type={"eng"}
                        openModal={openModal} />
                    <div style={{ paddingLeft: '175px', paddingRight: '175px' }}>
                        <MDBRow>
                            <h2 class="text-uppercase text-center pb-2">ACCIONES</h2>
                            <MDBCol md="6">
                                <MDBCard className="bg-card mb-3">
                                    <MDBCardBody>
                                        <MDBCardTitle className="text-center"> <h4>GENERAR NUEVA RADICACIÓN</h4></MDBCardTitle>
                                        <form onSubmit={handleSubmit} id="app-form">

                                            <div className='row'>
                                                <div className='col'>
                                                    <div class="input-group">
                                                        <span class="input-group-text bg-info text-white">
                                                            <i class="far fa-calendar-alt"></i>
                                                        </span>
                                                        <input type="date" class="form-control" id="f_01" required />
                                                    </div>
                                                </div>
                                                <div className='col-7'>
                                                    <div class="input-group">
                                                        <span class="input-group-text bg-info text-white">
                                                            <i class="fas fa-hashtag"></i>
                                                        </span>
                                                        <input type="text" class="form-control" defaultValue={nomens} id="f_02" required />
                                                        <MDBBtn class="btn btn-sm btn-info shadow-none m-1"
                                                            onClick={() => _GET_LAST_ID_PUBLIC()}>GENERAR LIC</MDBBtn>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <button className="btn btn btn-success my-1"><i class="fas fa-folder-plus"></i> CREAR </button>
                                            </div>
                                        </form>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                            <MDBCol md="6">
                                <MDBCard className="bg-card mb-3">
                                    <MDBCardBody>
                                        <MDBCardTitle className="text-center"> <h4>CONSULTAR SOLICITUD</h4></MDBCardTitle>
                                        <form onSubmit={search} id="app-form">
                                            <div className='row'>
                                                <div className='col'>
                                                    <div class="input-group">
                                                        <span class="input-group-text bg-info text-white">
                                                            <i class="fas fa-info-circle"></i>
                                                        </span>
                                                        <select class="form-select" id="search_0" required>
                                                            <option value="1">Número de Radicado</option>
                                                            <option value="2">Número de Matricula Inmobiliaria</option>
                                                            <option value="3">Número de Indentificacion Predial/Catastral</option>
                                                            <option value="4">Dirección Actual</option>
                                                            <option value="5">C.C o NIT</option>
                                                            <option value="6">Nombre</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className='col'>
                                                    <div class="input-group">
                                                        <span class="input-group-text bg-info text-white">
                                                            <i class="far fa-comment-dots"></i>
                                                        </span>
                                                        <input type="text" class="form-control" id="search_1" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <button className="btn btn-secondary mt-1"><i class="fas fa-search-plus"></i> CONSULTAR </button>
                                            </div>
                                        </form>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>

                        </MDBRow>
                    </div>
                    {list_search.length > 0 ?
                        <div className="row d-flex justify-content-center">
                            <div className="col-12">

                                <h2 class="text-uppercase text-center pb-2">RESULTADO DE LA BUSQUEDA <img src={IMG_SEARCH_ICON} class="" height="75px" alt="..." /></h2>

                                <DataTable
                                    conditionalRowStyles={rowSelectedStyle}
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent="NO HAY SOLICITUDES"
                                    striped="true"
                                    columns={columns_search}
                                    data={list_search}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[20, 50, 100]}
                                    className="data-table-component"
                                    noHeader
                                    onRowClicked={(e) => setState({ selectedRow: e.id })}
                                    dense
                                    progressPending={!isLoaded}
                                    progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
                                />

                            </div>
                        </div>

                        : ''}

                    <MDBTabs fill className='m-0 border' pills>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('1')} active={state.fillActive === '1'}>
                                <label className="upper-case">Radicación ({list_started.length})</label>
                            </MDBTabsLink>
                        </MDBTabsItem>

                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('5')} active={state.fillActive === '5'}>
                                <label className="upper-case">Evaluacion ({state.list_legal.length})</label>
                            </MDBTabsLink>
                        </MDBTabsItem>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('50')} active={state.fillActive === '50'}>
                                <label className="upper-case">EXPEDICIÓN ({state.list_expedition.length})</label>
                            </MDBTabsLink>
                        </MDBTabsItem>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('10')} active={state.fillActive === '10'}>
                                <label className="upper-case">OTRAS ACTUACIONES ({state.list_profesional.length})</label>
                            </MDBTabsLink>
                        </MDBTabsItem>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('-1')} active={state.fillActive === '-1'}>
                                <label className="upper-case text-danger">Desistimiento ({list_incomplete.length})</label>
                            </MDBTabsLink>
                        </MDBTabsItem>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('100')} active={state.fillActive === '100'}>
                                <label className="upper-case">ARCHIVADAS ({state.list_archive.length})</label>
                            </MDBTabsLink>
                        </MDBTabsItem>
                    </MDBTabs>

                    <MDBTabsContent>
                        <MDBTabsPane show={state.fillActive === '1'}>
                            <DataTable
                                conditionalRowStyles={rowSelectedStyle}
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="NO HAY SOLICITUDES"
                                striped="true"
                                columns={columns}
                                data={list_started}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                noHeader
                                dense
                                onRowClicked={(e) => setState({ selectedRow: e.id })}

                                progressPending={!isLoaded}
                                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
                            />
                        </MDBTabsPane>
                        <MDBTabsPane show={state.fillActive === '-1'}>

                            <DataTable
                                conditionalRowStyles={rowSelectedStyle}
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="NO HAY SOLICITUDES"
                                striped="true"
                                columns={columns_missing}
                                data={list_incomplete}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                noHeader
                                dense
                                onRowClicked={(e) => setState({ selectedRow: e.id })}

                                progressPending={!isLoaded}
                                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
                            />

                        </MDBTabsPane>
                        <MDBTabsPane show={state.fillActive === '5'}>

                            <DataTable
                                conditionalRowStyles={rowSelectedStyle}
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="NO HAY SOLICITUDES"
                                striped="true"
                                columns={columns_legal}
                                data={state.list_legal}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                noHeader
                                dense
                                onRowClicked={(e) => setState({ selectedRow: e.id })}

                                progressPending={!isLoaded}
                                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
                            />

                        </MDBTabsPane>
                        <MDBTabsPane show={state.fillActive === '10'}>

                            <DataTable
                                conditionalRowStyles={rowSelectedStyle}
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="NO HAY SOLICITUDES"
                                striped="true"
                                columns={columns_profesional}
                                data={state.list_profesional}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                noHeader
                                dense
                                onRowClicked={(e) => setState({ selectedRow: e.id })}

                                progressPending={!isLoaded}
                                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
                            />

                        </MDBTabsPane>
                        <MDBTabsPane show={state.fillActive === '50'}>

                            <DataTable
                                conditionalRowStyles={rowSelectedStyle}
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="NO HAY SOLICITUDES"
                                striped="true"
                                columns={columns_exp}
                                data={state.list_expedition}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                noHeader
                                dense
                                onRowClicked={(e) => setState({ selectedRow: e.id })}

                                progressPending={!isLoaded}
                                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
                            />

                        </MDBTabsPane>
                        <MDBTabsPane show={state.fillActive === '100'}>

                            <div className='my-2'><MDBBtn outline color='success' size="sm" onClick={() => { generateCVS(state.list_archive, "LICENCIAS ARCHIVADAS") }}
                            ><i class="fas fa-file-csv"></i> DESCARGAR CSV</MDBBtn></div>

                            <DataTable
                                conditionalRowStyles={rowSelectedStyle}
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="NO HAY SOLICITUDES"
                                striped="true"
                                columns={columns_archive}
                                data={state.list_archive}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                noHeader
                                dense
                                onRowClicked={(e) => setState({ selectedRow: e.id })}

                                progressPending={!isLoaded}
                                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
                            />

                        </MDBTabsPane>
                    </MDBTabsContent>

                </div >

                <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={state.modal}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >

                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-file-alt"></i> DETALLES DE LA SOLICITUD - No. Radicación : {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <FUNG
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version}
                    />

                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggle()}><i class="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="FUN CHECKEO"
                    isOpen={state.modal_c}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-check-square"></i> LISTA DE CHECKEO : No. Radicación :  {state.currentPublic}</label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_c()}></MDBBtn>
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
                        <MDBBtn color='info' onClick={toggle_c}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="FUN NEW/UPDATE"
                    isOpen={state.modal_n}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-file-signature"></i> ACTUALIZACIÓN DE SOLICITUD - No. Radicación : {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_n()}></MDBBtn>
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
                        <MDBBtn color='info' onClick={toggle_n}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="FUN DOC CONTROL"
                    isOpen={state.modal_d}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-archive"></i> GESTIÓN DOCUMENTAL - No. Radicación :  {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_d()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <FUND translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={toggle_d}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="FUN ALERTA A VECINOS"
                    isOpen={state.modal_alert}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-sign"></i> AVISOS A VECINOS - No. Radicación :  {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_alert()}></MDBBtn>
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
                        <MDBBtn color='info' onClick={toggle_alert}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="FUN CLOCK"
                    isOpen={state.modal_clocK}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-clock"></i> CONTROL DE TIEMPO DE PROCESO - No. Radicación : {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_clock()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <FUNCLOCK translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requesRefresh={retrievePublish}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={toggle_clock}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="RECORDS ARCHITECTURE"
                    isOpen={state.modal_record_arc}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-building"></i> INFORME ARQUITECTÓNICO - No. Radicación :  {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_recordArc()}></MDBBtn>
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
                        <MDBBtn color='info' onClick={toggle_recordArc}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="RECORDS LAW"
                    isOpen={state.modal_record_law}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-balance-scale"></i> INFORME JURIDICO - No. Radicación :  {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_recordLaw()}></MDBBtn>
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
                        <MDBBtn color='info' onClick={toggle_recordLaw}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="RECORDS PH"
                    isOpen={state.modal_record_ph}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-pencil-ruler"></i> INFORME PROPIEDAD HORIZONTAL - No. Radicación :  {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_recordPH()}></MDBBtn>
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
                        <MDBBtn color='info' onClick={toggle_recordPH}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="RECORDS ENG"
                    isOpen={state.modal_record_eng}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-cogs"></i> INFORME ESTRUCTURAL - No. Radicación :  {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_recordEng()}></MDBBtn>
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
                        <MDBBtn color='info' onClick={toggle_recordEng}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="RECORDS REVIEW"
                    isOpen={state.modal_record_review}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-file-contract"></i>ACTA DE OBSERVACIONES / CORRECCIONES - No. Radicación :  {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_recordReview()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <RECORD_REVIEW translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        closeModal={toggle_recordReview}
                        NAVIGATION={navigation} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={toggle_recordReview}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="EXPEDITION"
                    isOpen={state.modal_exp}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-file-alt"></i> EXPEDICIÓN DE LA LICENCIA:  {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_exp()}></MDBBtn>
                    </div>
                    {modalHeader}

                    <EXPEDITION translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requesRefresh={retrievePublish}
                        closeModal={toggle_exp}
                        NAVIGATION={navigation} />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={toggle_exp}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="ASIGN PROFS"
                    isOpen={state.modal_asign_prof}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-file-alt"></i> ASIFNACIÓN DE PROFESIONALES:  {state.currentPublic} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => setState({ modal_asign_prof: false })}></MDBBtn>
                    </div>

                    {currentItemAsignProf?.length ? <TABLE_COMPONENT_EXPANDED currentItem={{ ...currentItemAsignProf[0], rec_review: currentItemAsignProf[0].rec_review, rec_review_2: currentItemAsignProf[0].rec_rev_2 }}
                        requestUpdate={null}
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        worker_list={worker_list}
                        lenghtL={currentItemAsignProf.length}
                        dataL={currentItemAsignProf}
                    /> : "Loading..."}

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={() => setState({ modal_asign_prof: false })}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

            </div >
        );
}

export default FUN;