import ChartErrorBoundary from '../../components/ChartErrorBoundary';
import { useReducer, useEffect, useRef } from 'react';
import { TabPane } from '@/components/ui/tab-pane';
import { swalLoading, swalSuccess, swalError, swalClose } from '@/app/utils/swalAdapter';
import DataTable from '@/components/data-table-bridge';
import { LegacyModal as Modal } from '@/components/legacy-modal';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

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
import { DiasHabilesColombia } from '../../utils/BusinessDaysCol';

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
import dayjs from 'dayjs';

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
            hasSearchResult: false,
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
            quickPreviewItem: null,
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
        swalLoading({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
        });
        FUNService.get(id)
            .then(response => {
                swalClose()

                toggle_d(response.data);
            })
            .catch(e => {
                swalError({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                });
                console.log(e);
            });
    }
    function retrieveMacroSingle(id) {
        swalLoading({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
        });
        FUNService.loadMacroSingle(null, null, id)
            .then(response => {
                if (response.data.length) setState({ currentItemAsignProf: response.data, modal_asign_prof: true })
                else setState({ currentItemAsignProf: null, modal_asign_prof: null })
                swalClose();
            })
            .catch(e => {
                swalError({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                });
                console.log(e);
            });
    }
    function retrieveSearch(field, string) {
        FUNService.getSearch(field, string)
            .then(response => {
                setState({
                    list_search: response.data,
                    hasSearchResult: true,
                    isLoadedSearch: false,
                });
                //asignList(response.data);
                swalClose();
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
                    date_start: dayjs(document.getElementById('load_macro_date_1').value).format('YYYY-MM-DD'),
                    date_end: dayjs(document.getElementById('load_macro_date_2').value).format('YYYY-MM-DD'),
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
    function handleDuplicateSuccess(newId) {
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
    function setSubtmitRows() {
        var end_date = dayjs().format('YYYY-MM-DD');
        const _bd = new DiasHabilesColombia();
        var start_date = _bd.restarDiasHabiles(end_date, 15);

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
        const { currentItemAsignProf, currentVersion, currentId, isLoaded, list_started, list_incomplete, list_search, worker_list, quickPreviewItem } = state;

        const modalHeader = null; // Legacy variable — replaced by FunModalHeader below

        const FunModalHeader = ({ icon, title, onClose }) => (
            <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                        <Icon name={icon} size={14} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
                        <p className="text-[0.6875rem] text-muted-foreground">Rad. {state.currentPublic} — v{state.currentLastVersion}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md p-1 hover:bg-muted transition-colors"
                    aria-label="Cerrar"
                >
                    <Icon name="X" size={16} className="text-muted-foreground" />
                </button>
            </div>
        );

        const ModalFooter = ({ onClose }) => (
            <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                <Button variant="outline" size="sm" onClick={onClose}>
                    <Icon name="X" size={14} /> Cerrar
                </Button>
            </div>
        );
        let _GET_MISSING_CONTEXT = (state) => {
            if (state == '-1') return <Badge variant="secondary" className="text-[10px]">INCOMPLETO</Badge>
            if (state == '-101') return <Badge variant="destructive" className="text-[10px]">DESIST. INCOMPLETO</Badge>
            if (state == '-102') return <Badge variant="destructive" className="text-[10px]">NO CUMPLE ACTA OBS.</Badge>
            if (state == '-103') return <Badge variant="destructive" className="text-[10px]">NO CUMPLE ACTA CORR.</Badge>
            if (state == '-104') return <Badge variant="destructive" className="text-[10px]">NO PAGO EXPENSAS</Badge>
            if (state == '-105') return <Badge variant="destructive" className="text-[10px]">VOLUNTARIO</Badge>
            if (state == '-106') return <Badge variant="destructive" className="text-[10px]">NEGADA</Badge>
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
            if (state < '-1') return isString ? 'DESISTIDO (Ejecución)' : <Badge variant="destructive" className="text-[10px]">Desistido (Ejecución)</Badge>
            if (state == '-1') return 'INCOMPLETO'
            if (state == '1') return 'INCOMPLETO'
            if (state == '5') return isString ? 'LYDF' : <Badge className="text-[10px] bg-primary">LyDF</Badge>
            if (state == '50') return isString ? 'EXPEDICIÓN' : <Badge className="text-[10px] bg-accent text-accent-foreground">Expedición</Badge>
            if (state == '100') return isString ? 'ARCHIVADO' : <Badge variant="secondary" className="text-[10px]">Cerrado</Badge>
            if (state == '101') return isString ? 'ARCHIVADO' : <Badge variant="outline" className="text-[10px] text-primary border-primary">Archivado</Badge>
            if (state == '200') {
                if (isString) {
                    if (row.clock_close_6) return 'NEGADA'
                    if (row.clock_close_5) return 'DESISTIDO (Voluntario)'
                    if (row.clock_close_4) return 'DESISTIDO (No radicó pagos'
                    if (row.clock_close_3) return 'DESISTIDO (No subsanó Acta)'
                    if (row.clock_close_2) return 'DESISTIDO (No radicó valla)'
                    if (row.clock_close_1) return 'DESISTIDO (Incompleto)'
                } else return <Badge variant="secondary" className="text-[10px]">Cerrado (Desistido)</Badge>
            }
            if (state == '201') return isString ? 'DESISTIDO (Incompleto)' : <Badge variant="destructive" className="text-[10px]">Desist. Incompleto</Badge>
            if (state == '202') return isString ? 'DESISTIDO (No radicó valla)' : <Badge variant="destructive" className="text-[10px]">Desist. Valla</Badge>
            if (state == '203') return isString ? 'DESISTIDO (No subsanó Acta)' : <Badge variant="destructive" className="text-[10px]">Desist. Acta</Badge>
            if (state == '204') return isString ? 'DESISTIDO (No radicó pagos)' : <Badge variant="destructive" className="text-[10px]">Desist. Pagos</Badge>
            if (state == '205') return isString ? 'DESISTIDO (Voluntario)' : <Badge variant="destructive" className="text-[10px]">Desist. Voluntario</Badge>
            if (state == '206') return isString ? 'DESISTIDO (Negada)' : <Badge variant="destructive" className="text-[10px]">Negada</Badge>
            return ''
        }
        const _fun_0_type = { '0': 'NC', 'i': 'I', 'ii': "II", 'iii': "III", 'iv': "IV", 'oa': "OA" }
        const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
        // ----------------------
        const rowSelectedStyle = [
            {
                when: row => (state.submitItems).includes(row.id),
                style: {
                    backgroundColor: 'hsl(var(--primary) / 0.08)',
                },
            },
            {
                when: row => row.id == state.selectedRow,
                style: {
                    backgroundColor: 'hsl(var(--warning) / 0.12)',
                },
            },
        ];

        const renderCompactProgress = (row) => (
            <FUN_ICON_PROGRESS translation={translation} globals={globals} currentItem={row} small />
        );

        const tableBaseProps = {
            conditionalRowStyles: rowSelectedStyle,
            paginationComponentOptions: { rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' },
            noDataComponent: 'NO HAY SOLICITUDES',
            striped: true,
            highlightOnHover: true,
            pagination: true,
            paginationPerPage: 50,
            paginationRowsPerPageOptions: [25, 50, 100],
            className: 'data-table-component',
            noHeader: true,
            dense: true,
            progressPending: !isLoaded,
            progressComponent: <span className='text-sm text-muted-foreground'>Cargando...</span>,
            onRowClicked: openQuickPreview,
        };

        // ---------------------
        const columns = [
            {
                name: 'No. RADICACIÓN',
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '130px',
                cell: row => <span className='text-sm font-medium font-mono'>{row.id_public}</span>
            },
            {
                name: 'TIPO',
                minWidth: '350px',
                cell: row => <span className="text-xs">{formsParser1(row, true)}</span>
            },
            {
                name: 'CAT.',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <Badge variant="outline" className="text-[10px] font-mono">{_fun_0_type[row.type]}</Badge>
            },
            {
                name: 'FECHA PAGO EXPENSAS',
                selector: row => row.clock_payment,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.clock_payment}</span>
            },
            {
                name: 'FECHA LÍMITE LyDF',
                selector: row => dateParser_finalDate(row.clock_payment, 30),
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{dateParser_finalDate(row.clock_payment, 30)}</span>
            },
            {
                name: 'TIEMPO RESTANTE',
                selector: row => row.clock_payment,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => {
                    let time = 30 - dateParser_timePassed(row.clock_payment)
                    return <span className="text-xs"><span className={cn('font-bold tabular-nums', time <= 0 ? 'text-destructive' : time <= 5 ? 'text-warning' : '')}>{time}</span><span className="text-muted-foreground"> / 30</span></span>
                }
            },

            {
                name: 'PROGRESIÓN',
                center: true,
                minWidth: '320px',
                cell: row => renderCompactProgress(row)
            },
            {
                name: 'ACCIÓN',
                button: true,
                center: true,
                minWidth: '80px',
                cell: row => _MODULE_ACTION_MENU(row),
            },
        ]
        const columns_missing = [
            {
                name: 'No. RADICACIÓN',
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className='text-sm font-medium font-mono'>{row.id_public}</span>
            },
            {
                name: 'TIPO',
                minWidth: '350px',
                cell: row => <span className="text-xs">{formsParser1(row, true)}</span>
            },
            {
                name: 'CAT.',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <Badge variant="outline" className="text-[10px] font-mono">{_fun_0_type[row.type]}</Badge>
            },
            {
                name: 'MOTIVO',
                selector: row => _GET_MISSING_CONTEXT(row.state),
                sortable: true,
                filterable: true,
                center: true,
                cell: row => _GET_MISSING_CONTEXT(row.state)
            },
            {
                name: 'FECHA PAGO EXPENSAS',
                selector: row => row.clock_payment,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.clock_payment}</span>
            },
            {
                name: 'PROGRESIÓN',
                center: true,
                minWidth: '320px',
                cell: row => renderCompactProgress(row)
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '80px',
                cell: row => _MODULE_ACTION_MENU(row),
            },
        ]
        const columns_legal = [
            {
                name: 'No. RADICACIÓN',
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                cell: row => <span className='text-sm font-medium font-mono'>{row.id_public}</span>
            },
            {
                name: 'TIPO',
                minWidth: '350px',
                cell: row => <span className="text-xs">{formsParser1(row, true)}</span>
            },
            {
                name: 'CAT.',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <Badge variant="outline" className="text-[10px] font-mono">{_fun_0_type[row.type]}</Badge>
            },
            {
                name: 'FECHA LyDF',
                selector: row => row.clock_date,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.clock_date}</span>
            },
            {
                name: 'PROGRESIÓN',
                center: true,
                minWidth: '330px',
                cell: row => renderCompactProgress(row)
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '80px',
                cell: row => _MODULE_ACTION_MENU(row),
            },
        ]
        const columns_exp = [
            {
                name: 'No. RADICACIÓN',
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                cell: row => <span className='text-sm font-medium font-mono'>{row.id_public}</span>
            },
            {
                name: 'TIPO',
                minWidth: '350px',
                cell: row => <span className="text-xs">{formsParser1(row, true)}</span>
            },
            {
                name: 'CAT.',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <Badge variant="outline" className="text-[10px] font-mono">{_fun_0_type[row.type]}</Badge>
            },
            {
                name: 'FECHA VIABILIDAD',
                selector: row => row.clock_pay2,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.clock_pay2}</span>
            },
            {
                name: 'PROGRESIÓN',
                center: true,
                minWidth: '330px',
                cell: row => renderCompactProgress(row)
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '80px',
                cell: row => _MODULE_ACTION_MENU(row),
            },
        ]
        const columns_profesional = [
            {
                name: 'No. RADICACIÓN',
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                cell: row => <span className='text-sm font-medium font-mono'>{row.id_public}</span>
            },
            {
                name: 'TIPO',
                minWidth: '350px',
                cell: row => <span className="text-xs">{formsParser1(row, true)}</span>
            },
            {
                name: 'CAT.',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <Badge variant="outline" className="text-[10px] font-mono">{_fun_0_type[row.type]}</Badge>
            },
            {
                name: 'FECHA PAGO EXPENSAS',
                selector: row => row.clock_payment,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.clock_payment}</span>
            },
            {
                name: 'FECHA LyDF',
                selector: row => row.clock_date,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.clock_date}</span>
            },
            {
                name: 'PROGRESIÓN',
                center: true,
                minWidth: '330px',
                cell: row => renderCompactProgress(row)
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '80px',
                cell: row => _MODULE_ACTION_MENU(row),
            },
        ]
        const columns_archive = [
            {
                name: 'No. RADICACIÓN',
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                cell: row => <span className='text-sm font-medium font-mono'>{row.id_public}</span>
            },
            {
                name: 'TIPO',
                minWidth: '350px',
                cell: row => <span className="text-xs">{formsParser1(row, true)}</span>,
            },
            {
                name: 'CAT.',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <Badge variant="outline" className="text-[10px] font-mono">{_fun_0_type[row.type]}</Badge>
            },
            {
                name: 'ESTADO',
                selector: row => _GET_STATE_STR(row.state, true, row),
                sortable: true,
                filterable: true,
                center: true,
                cell: row => _GET_STATE_STR(row.state),
                cvsCB: row => _GET_STATE_STR(row.state, true, row)
            },
            {
                name: 'FECHA ARCHIVACIÓN',
                selector: row => row.clock_archive,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.clock_archive}</span>
            },
            {
                name: 'PROGRESIÓN',
                center: true,
                minWidth: '330px',
                ignoreCSV: true,
                cell: row => renderCompactProgress(row)
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '80px',
                ignoreCSV: true,
                cell: row => _MODULE_ACTION_MENU(row),
            },
        ]
        const columns_search = [
            {
                name: 'No. RADICACIÓN',
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '130px',
                cell: row => <span className='text-sm font-medium font-mono'>{row.id_public}</span>
            },
            {
                name: 'TIPO',
                minWidth: '350px',
                cell: row => <span className="text-xs">{formsParser1(row, true)}</span>
            },
            {
                name: 'CAT.',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                maxWidth: '90px',
                cell: row => <Badge variant="outline" className="text-[10px] font-mono">{_fun_0_type[row.type]}</Badge>
            },
            {
                name: 'ESTADO',
                selector: row => row.state,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => _GET_STATE_STR(row.state)
            },
            {
                name: 'PROGRESIÓN',
                center: true,
                minWidth: '320px',
                cell: row => renderCompactProgress(row)
            },
            {
                name: 'ACCIÓN',
                button: true,
                center: true,
                minWidth: '80px',
                cell: row => _MODULE_ACTION_MENU(row),
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
                        } else document.getElementById('f_02').value = nomens + dayjs().format('YY') + "-0001";
                    } else document.getElementById('f_02').value = nomens + dayjs().format('YY') + "-0001";
                })
                .catch(e => {
                    console.log(e);
                    swalError({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte.",
                    });
                });

        }
        let _MODULE_ACTION_MENU = (row) => {
            const isOA = regexChecker_isOA_2(row)
            let rules = row.rules ? row.rules.split(';') : [];
            const canEdit = row.state != 101 && row.state <= 200;
            const isPH = regexChecker_isPh(row, true);
            const canAssign = window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 5 || window.user.roleId == 2;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="fun-action-toggle h-8 w-8" onClick={(event) => event.stopPropagation()}>
                            <Icon name="MoreVertical" size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="fun-action-menu w-56">
                        <DropdownMenuLabel className="flex items-center gap-2">
                            <Icon name="Eye" size={14} /> Consulta
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openQuickPreview(row)}>
                            <Icon name="PanelRightOpen" size={14} className="text-primary" />
                            Vista rápida
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggle(row)}>
                            <Icon name="FolderOpen" size={14} className="text-primary" />
                            Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggle_clock(row)}>
                            <Icon name="Clock" size={14} className="text-muted-foreground" />
                            Tiempos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggle_d(row)}>
                            <Icon name="Archive" size={14} className="text-muted-foreground" />
                            Documentos
                        </DropdownMenuItem>
                        {canEdit && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="flex items-center gap-2">
                                    <Icon name="Pencil" size={14} /> Gestión
                                </DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => toggle_n(row)}>
                                    <Icon name="RefreshCw" size={14} className="text-primary" />
                                    Actualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggle_c(row)}>
                                    <Icon name="CheckSquare" size={14} className="text-accent" />
                                    Checkeo
                                </DropdownMenuItem>
                                {isPH ? (
                                    <DropdownMenuItem onClick={() => toggle_recordPH(row)}>
                                        <Icon name="PenTool" size={14} className="text-warning" />
                                        Inf. P.H.
                                    </DropdownMenuItem>
                                ) : (
                                    <>
                                        {!isOA && rules[0] != 1 && (
                                            <DropdownMenuItem onClick={() => toggle_alert(row)}>
                                                <Icon name="Megaphone" size={14} className="text-warning" />
                                                Publicidad
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => toggle_recordLaw(row)}>
                                            <Icon name="Scale" size={14} className="text-warning" />
                                            Inf. Jurídico
                                        </DropdownMenuItem>
                                        {!isOA && (
                                            <>
                                                <DropdownMenuItem onClick={() => toggle_recordArc(row)}>
                                                    <Icon name="Building" size={14} className="text-warning" />
                                                    Inf. Arquitectónico
                                                </DropdownMenuItem>
                                                {rules[1] != 1 && (
                                                    <DropdownMenuItem onClick={() => toggle_recordEng(row)}>
                                                        <Icon name="Cog" size={14} className="text-warning" />
                                                        Inf. Estructural
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => toggle_recordReview(row)}>
                                                    <Icon name="FileText" size={14} className="text-warning" />
                                                    Acta
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="flex items-center gap-2">
                                    <Icon name="FileOutput" size={14} /> Resolución
                                </DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => toggle_exp(row)}>
                                    <Icon name="FileCheck" size={14} className="text-accent" />
                                    Expedición
                                </DropdownMenuItem>
                            </>
                        )}
                        {canAssign && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => retrieveMacroSingle(row.id)}>
                                    <Icon name="UserCog" size={14} className="text-primary" />
                                    Asignar
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
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

            swalLoading({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
            });
            FUNService.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                        });
                        refreshList();
                    }
                    else if (response.data === 'ERROR_DUPLICATE') {
                        swalError({
                            title: "ERROR DE DUPLICACION",
                            text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                        });
                    }
                    else {
                        swalError({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                    });
                });
        };

        let search = (event) => {
            event.preventDefault();
            let field = document.getElementById("search_0").value;
            let string = document.getElementById("search_1").value;
            if (string) {
                swalLoading({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                });
                retrieveSearch(field, string);
            } else {
                refreshList();
                setState({
                    list_search: [],
                    hasSearchResult: false,
                    isLoadedSearch: false,
                })
            }
        };
        const handleFillClick = (value) => {
            if (value === state.fillActive) {
                return;
            }
            setState({ fillActive: value, quickPreviewItem: null });
        };

        function openQuickPreview(item) {
            if (!item) {
                return;
            }

            setState({
                selectedRow: item.id,
                quickPreviewItem: item,
            });
        }

        function closeQuickPreview() {
            setState({ quickPreviewItem: null });
        }

        function openFullDetailFromPreview() {
            if (!state.quickPreviewItem) {
                return;
            }

            const previewItem = state.quickPreviewItem;
            closeQuickPreview();
            toggle(previewItem);
        }

        let generateCVS = (_data, _name) => {
            var rows = [];

            let extraColumns = [
                {
                name: 'Fecha de Licencia',
                    cell: row => row.clock_license
                }
            ]

            let _columns = [...columns_archive, ...extraColumns]
            const headRows = _columns.filter(c => c.ignoreCSV == undefined).map(c => { return typeof c.name === 'string' ? c.name : (c.name?.props?.children ?? '') })
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
            
            <div className="space-y-6">
                <FUN_WORKER_ASIGN translation={translation} globals={globals}
                    type={"law"}
                    openModal={openModal} />
                <FUN_WORKER_ASIGN translation={translation} globals={globals}
                    type={"arc"}
                    openModal={openModal} />
                <FUN_WORKER_ASIGN translation={translation} globals={globals}
                    type={"eng"}
                    openModal={openModal} />

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border/70 bg-muted/20 px-4 py-3 md:px-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 space-y-1">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Licencias · Radicar</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-lg font-semibold tracking-tight text-foreground">RADICACIÓN DE SOLICITUDES</h1>
                                    <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.12em]">Operación diaria</Badge>
                                </div>
                                <p className="max-w-2xl text-xs text-muted-foreground">Genere, consulte y revise expedientes desde una sola barra de trabajo, con mayor densidad visible y acceso lateral rápido.</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="h-7 rounded-full px-2.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                    Activas {list_started.length + state.list_legal.length + state.list_expedition.length + state.list_profesional.length + list_incomplete.length}
                                </Badge>
                                <Badge variant="outline" className="h-7 rounded-full px-2.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                    Archivadas {state.list_archive.length}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
                        <section className="border-b border-border/70 px-4 py-3 lg:border-b-0 lg:border-r lg:px-5">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon name="FilePlus" size={15} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold tracking-tight text-foreground">Generar Nueva Radicación</h2>
                                    <p className="text-[11px] text-muted-foreground">Consecutivo y fecha en una fila compacta.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} id="app-form" className="grid gap-2 xl:grid-cols-[160px_minmax(0,1fr)_auto] xl:items-end">
                                <div className="space-y-1">
                                    <label htmlFor="f_01" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Fecha</label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="Calendar" size={13} />
                                        </span>
                                        <input type="date" className="form-control" id="f_01" required />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="f_02" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Radicado</label>
                                    <div className="flex gap-2">
                                        <div className="input-group input-group-sm flex-1">
                                            <span className="input-group-text bg-primary text-primary-foreground">
                                                <Icon name="Hash" size={13} />
                                            </span>
                                            <input type="text" className="form-control" defaultValue={nomens} id="f_02" required />
                                        </div>
                                        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0" onClick={() => _GET_LAST_ID_PUBLIC()}>
                                            Generar LIC
                                        </Button>
                                    </div>
                                </div>

                                <Button type="submit" size="sm" className="h-9 bg-accent text-accent-foreground hover:bg-accent/90 xl:min-w-[112px]">
                                    <Icon name="FolderPlus" size={13} /> Crear
                                </Button>
                            </form>
                        </section>

                        <section className="px-4 py-3 lg:px-5">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon name="Search" size={15} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold tracking-tight text-foreground">Consultar Solicitud</h2>
                                    <p className="text-[11px] text-muted-foreground">Filtro de consulta rápida sin salir de la pantalla.</p>
                                </div>
                            </div>

                            <form onSubmit={search} id="app-form" className="grid gap-2 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto] xl:items-end">
                                <div className="space-y-1">
                                    <label htmlFor="search_0" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Buscar por</label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="Info" size={13} />
                                        </span>
                                        <select className="form-select" id="search_0" required>
                                            <option value="1">Número de Radicado</option>
                                            <option value="2">Número de Matricula Inmobiliaria</option>
                                            <option value="3">Número de Indentificacion Predial/Catastral</option>
                                            <option value="4">Dirección Actual</option>
                                            <option value="5">C.C o NIT</option>
                                            <option value="6">Nombre</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="search_1" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Valor</label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="MessageCircle" size={13} />
                                        </span>
                                        <input type="text" className="form-control" id="search_1" placeholder="Ej. 68001-1-25-0292" />
                                    </div>
                                </div>

                                <Button type="submit" variant="secondary" size="sm" className="h-9 xl:min-w-[112px]">
                                    <Icon name="SearchCheck" size={13} /> Consultar
                                </Button>
                            </form>
                        </section>
                    </div>
                </div>

                {/* ── Search results ─────────────────────────────── */}
                {state.hasSearchResult && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-center mb-0 flex items-center justify-center gap-2">
                            <Icon name="SearchCheck" size={15} className="text-primary" />
                            Resultado de la Búsqueda
                        </h3>
                        <DataTable
                            {...tableBaseProps}
                            columns={columns_search}
                            data={list_search}
                        />
                    </div>
                )}

                {/* ── Tab navigation ─────────────────────────────── */}
                <div>
                    <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-sm" role="tablist">
                        {[
                            { key: '1', label: 'Radicación', count: list_started.length, icon: 'FileInput' },
                            { key: '5', label: 'Evaluación', count: state.list_legal.length, icon: 'ClipboardCheck' },
                            { key: '50', label: 'Expedición', count: state.list_expedition.length, icon: 'FileOutput' },
                            { key: '10', label: 'Otras Actuaciones', count: state.list_profesional.length, icon: 'Briefcase' },
                            { key: '-1', label: 'Desistimiento', count: list_incomplete.length, icon: 'XCircle', variant: 'destructive' },
                            { key: '100', label: 'Archivadas', count: state.list_archive.length, icon: 'Archive' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                role="tab"
                                aria-selected={state.fillActive === tab.key}
                                onClick={() => handleFillClick(tab.key)}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap border-0 bg-transparent',
                                    state.fillActive === tab.key
                                        ? 'bg-primary/10 text-primary shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                )}
                            >
                                <Icon name={tab.icon} size={14} />
                                {tab.label}
                                <Badge variant={tab.variant === 'destructive' ? 'destructive' : 'secondary'} className="ml-1 text-[10px] px-1.5 py-0">
                                    {tab.count}
                                </Badge>
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="mt-2">
                        <TabPane show={state.fillActive === '1'}>
                            <DataTable
                                {...tableBaseProps}
                                columns={columns}
                                data={list_started}
                            />
                        </TabPane>
                        <TabPane show={state.fillActive === '-1'}>
                            <DataTable
                                {...tableBaseProps}
                                columns={columns_missing}
                                data={list_incomplete}
                            />
                        </TabPane>
                        <TabPane show={state.fillActive === '5'}>
                            <DataTable
                                {...tableBaseProps}
                                columns={columns_legal}
                                data={state.list_legal}
                            />
                        </TabPane>
                        <TabPane show={state.fillActive === '10'}>
                            <DataTable
                                {...tableBaseProps}
                                columns={columns_profesional}
                                data={state.list_profesional}
                            />
                        </TabPane>
                        <TabPane show={state.fillActive === '50'}>
                            <DataTable
                                {...tableBaseProps}
                                columns={columns_exp}
                                data={state.list_expedition}
                            />
                        </TabPane>
                        <TabPane show={state.fillActive === '100'}>
                            <div className='my-2'>
                                <Button variant="outline" size="sm" onClick={() => { generateCVS(state.list_archive, "LICENCIAS ARCHIVADAS") }}>
                                    <Icon name="FileSpreadsheet" size={14} /> Descargar CSV
                                </Button>
                            </div>
                            <DataTable
                                {...tableBaseProps}
                                columns={columns_archive}
                                data={state.list_archive}
                            />
                        </TabPane>
                    </div>
                </div>

                <Sheet open={Boolean(quickPreviewItem)} onOpenChange={(open) => { if (!open) closeQuickPreview(); }}>
                    <SheetContent side="right" className="w-full border-l border-border bg-background px-0 sm:max-w-md">
                        {quickPreviewItem && (
                            <div className="flex h-full flex-col">
                                <SheetHeader className="gap-2 border-b border-border/70 px-5 pb-4 pt-2 text-left">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-[0.12em]">Consulta rápida</Badge>
                                        {_GET_STATE_STR(quickPreviewItem.state, false, quickPreviewItem)}
                                    </div>
                                    <SheetTitle className="text-lg tracking-tight">{quickPreviewItem.id_public}</SheetTitle>
                                    <SheetDescription className="text-xs leading-5">
                                        Revise el expediente sin salir de la tabla y abra la gestión completa cuando lo necesite.
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                                    <Card className="border-border/70 shadow-none">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Tipo de trámite</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0 text-sm leading-5 text-foreground">
                                            {formsParser1(quickPreviewItem, true)}
                                        </CardContent>
                                    </Card>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Card className="border-border/70 shadow-none">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Categoría</CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <Badge variant="outline" className="text-[10px] font-mono">{_fun_0_type[quickPreviewItem.type] ?? quickPreviewItem.type ?? '—'}</Badge>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border/70 shadow-none">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Fecha clave</CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-0 text-sm font-mono tabular-nums text-foreground">
                                                {quickPreviewItem.clock_pay2 || quickPreviewItem.clock_date || quickPreviewItem.clock_payment || _GET_MISSING_DATE(quickPreviewItem) || quickPreviewItem.clock_archive || 'Sin fecha'}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card className="border-border/70 shadow-none">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Progresión</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            {renderCompactProgress(quickPreviewItem)}
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="border-t border-border/70 px-5 py-4">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Button type="button" size="sm" onClick={openFullDetailFromPreview}>
                                            <Icon name="FolderOpen" size={14} /> Abrir detalles
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={closeQuickPreview}>
                                            <Icon name="TableProperties" size={14} /> Seguir en tabla
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </SheetContent>
                </Sheet>

                {/* ── Modals (react-modal — kept during migration) ── */}
                <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={state.modal}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >

                    <FunModalHeader icon="FileText" title="Detalles de la Solicitud" onClose={toggle} />

                    <FUNG
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version}
                        onDuplicateSuccess={handleDuplicateSuccess}
                    />

                    <ModalFooter onClose={toggle} />
                </Modal>

                <Modal contentLabel="FUN CHECKEO"
                    isOpen={state.modal_c}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="CheckSquare" title="Lista de Checkeo" onClose={toggle_c} />

                    <FUNC translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        requesRefresh={retrievePublish}
                        closeModal={toggle_c}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <ModalFooter onClose={toggle_c} />
                </Modal>

                <Modal contentLabel="FUN NEW/UPDATE"
                    isOpen={state.modal_n}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="FileSignature" title="Actualización de Solicitud" onClose={toggle_n} />

                    <FUNN translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        requesRefresh={retrievePublish}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <ModalFooter onClose={toggle_n} />
                </Modal>

                <Modal contentLabel="FUN DOC CONTROL"
                    isOpen={state.modal_d}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="Archive" title="Gestión Documental" onClose={toggle_d} />

                    <FUND translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <ModalFooter onClose={toggle_d} />
                </Modal>

                <Modal contentLabel="FUN ALERTA A VECINOS"
                    isOpen={state.modal_alert}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="Bell" title="Avisos a Vecinos" onClose={toggle_alert} />

                    <ChartErrorBoundary><FUN_ALERT translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        closeModal={toggle_alert}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} /></ChartErrorBoundary>

                    <ModalFooter onClose={toggle_alert} />
                </Modal>

                <Modal contentLabel="FUN CLOCK"
                    isOpen={state.modal_clocK}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="Clock" title="Control de Tiempo de Proceso" onClose={toggle_clock} />

                    <FUNCLOCK translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requesRefresh={retrievePublish}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <ModalFooter onClose={toggle_clock} />
                </Modal>

                <Modal contentLabel="RECORDS ARCHITECTURE"
                    isOpen={state.modal_record_arc}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="Building2" title="Informe Arquitectónico" onClose={toggle_recordArc} />

                    <RECORD_ARC translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        requesRefresh={retrievePublish}
                        closeModal={toggle_recordArc}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <ModalFooter onClose={toggle_recordArc} />
                </Modal>

                <Modal contentLabel="RECORDS LAW"
                    isOpen={state.modal_record_law}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="Scale" title="Informe Jurídico" onClose={toggle_recordLaw} />

                    <RECORD_LAW translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        closeModal={toggle_recordLaw}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <ModalFooter onClose={toggle_recordLaw} />
                </Modal>

                <Modal contentLabel="RECORDS PH"
                    isOpen={state.modal_record_ph}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="PencilRuler" title="Informe Propiedad Horizontal" onClose={toggle_recordPH} />

                    <RECORD_PH translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        requesRefresh={retrievePublish}
                        closeModal={toggle_recordPH}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <ModalFooter onClose={toggle_recordPH} />
                </Modal>

                <Modal contentLabel="RECORDS ENG"
                    isOpen={state.modal_record_eng}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="Cog" title="Informe Estructural" onClose={toggle_recordEng} />

                    <RECORD_ENG translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        closeModal={toggle_recordLaw}
                        NAVIGATION={navigation}
                        NAVIGATION_VERSION={navigation_version} />

                    <ModalFooter onClose={toggle_recordEng} />
                </Modal>

                <Modal contentLabel="RECORDS REVIEW"
                    isOpen={state.modal_record_review}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="FileCheck" title="Acta de Observaciones / Correcciones" onClose={toggle_recordReview} />

                    <RECORD_REVIEW translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requestUpdate={requestUpdate}
                        closeModal={toggle_recordReview}
                        NAVIGATION={navigation} />

                    <ModalFooter onClose={toggle_recordReview} />
                </Modal>

                <Modal contentLabel="EXPEDITION"
                    isOpen={state.modal_exp}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="FileOutput" title="Expedición de la Licencia" onClose={toggle_exp} />

                    <EXPEDITION translation={translation} swaMsg={swaMsg} globals={globals}
                        currentId={currentId}
                        currentVersion={currentVersion}
                        requesRefresh={retrievePublish}
                        closeModal={toggle_exp}
                        NAVIGATION={navigation} />

                    <ModalFooter onClose={toggle_exp} />
                </Modal>

                <Modal contentLabel="ASIGN PROFS"
                    isOpen={state.modal_asign_prof}
                    style={customStylesForModal()}
                    ariaHideApp={false}
                >
                    <FunModalHeader icon="Users" title="Asignación de Profesionales" onClose={() => setState({ modal_asign_prof: false })} />

                    {currentItemAsignProf?.length ? <TABLE_COMPONENT_EXPANDED currentItem={{ ...currentItemAsignProf[0], rec_review: currentItemAsignProf[0].rec_review, rec_review_2: currentItemAsignProf[0].rec_rev_2 }}
                        requestUpdate={null}
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        worker_list={worker_list}
                        lenghtL={currentItemAsignProf.length}
                        dataL={currentItemAsignProf}
                    /> : "Loading..."}

                    <ModalFooter onClose={() => setState({ modal_asign_prof: false })} />
                </Modal>

            </div >
        );
}

export default FUN;