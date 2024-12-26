import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import { dateParser, dateParser_dateDiff, dateParser_finalDate, dateParser_timeLeft, dateParser_timePassed, formsParser1, getJSONFull, regexChecker_isOA, regexChecker_isOA_2, regexChecker_isPh, _SET_PRIORITY } from '../../../components/customClasses/typeParse';
import { MDBBadge, MDBBtn, MDBCollapse, MDBDropdown, MDBDropdownItem, MDBDropdownLink, MDBDropdownMenu, MDBDropdownToggle, MDBPopover, MDBPopoverBody, MDBPopoverHeader, MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane, MDBTooltip } from 'mdb-react-ui-kit';
import ReactTagInput from "@pathofdev/react-tag-input";
import Collapsible from 'react-collapsible';
import "@pathofdev/react-tag-input/build/index.css";

import {
    _FUN_1_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER,
    _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER, _FUN_101_PARSER, _FUN_102_PARSER, _FUN_24_PARSER, _FUN_25_PARSER
} from '../../../components/customClasses/funCustomArrays'

import FUN_SERVICE from '../../../services/fun.service';
import USER_SERVICE from '../../../services/users.service';
import RECORD_LAW_SERVICE from '../../../services/record_law.service';
import RECORD_ENG_SERVICE from '../../../services/record_eng.service';
import RECORD_ARC_SERVICE from '../../../services/record_arc.service';
import RECORD_PH_SERVICE from '../../../services/record_ph.service';

import FUN_CHART_STATE from './components/charts_components.js/chart_state.component';
import FUN_CHART_CATEGORY from './components/charts_components.js/chart_category.component';

import FUN_CHART_LAW_R from './components/charts_components.js/chart_lawR.component';

import FUN_CHART_MACRO_GRANTT from './components/charts_components.js/chart_macroGant.component';
import FUN_CHART_TYPE from './components/charts_components.js/chart_type.compoennt';
import FUN_ICON_PROGRESS from './components/icon_progress.compoennt';
import FUN_CHART_WORKER from './components/charts_components.js/chart_worker.component';
import FUN_CHART_PAYMENT_1 from './components/charts_components.js/chart_payment.component';
import FUN_CHART_RECORD_1 from './components/charts_components.js/chart_record1.component';

import FUN_CHART_TYPE2 from './components/charts_components.js/chart_type2.compoennt';
import TABLE_COMPONENT_EXPANDED from './components/table_components/table.component_expanded';
import FUN_MACROTABLE_FILTERLIST from './components/fun_macro_filterList.component';
import FUN_CHART_NEGATIVE from './components/charts_components.js/chart_negative.component';
import FUN_CHART_TIME from './components/charts_components.js/chart_time.component';


const MySwal = withReactContent(Swal);
const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15, '0': 45 };
const priority_colors = ['4c75a3', '#ed302f ', '#ff4500', '#ffac44', '#25d366']
const _fun_0_type_days = { 'i': 4, 'ii': 6, 'iii': 8, 'iv': 10, 'oa': 2, '0': 10 };
const defaultProcess = {
    "-5": { "name": "CITACIÓN PARA NOTIFICACIÓN PERSONAL", "desc": "Se inicia el desistimiento" },
    "-6": { "name": "ENVÍO DE EMAIL", "desc": "Notificación mediante email" },
    "-7": { "name": "EL SOLICITANTE SE PRESENTA", "desc": "El responsable de la solicitud se ha presentado" },
    "-8": { "name": "NOTIFICACIÓN POR AVISO", "desc": "El solicitante no se presento y se le informo mediante aviso (email / Mensajería)" },
    "-10": { "name": "INTERPONER RECURSO", "desc": "El Solicitante presenta Recurso" },
    "-11": { "name": "RECURSO NO INTERPONIENDO", "desc": "El Solicitante no interpuso el recurso, la solicitud es archivada" },
    "-17": { "name": "LA CURADURÍA DA RESPUESTA", "desc": "La curaduría da respuesta al recurso interponido" },
    "-18": { "name": "DECLARA: CONTINUA", "desc": "La curaduría declara que continuara con el proceso" },
    "-19": { "name": "DECLARA: NO CONTINUA", "desc": "La curaduría declara que NO continuara con el proceso, la solicitud se archiva" },
    "-20": { "name": "CITACIÓN PARA NOTIFICACIÓN PERSONAL (2° Vez)", "desc": "Se cita al solicitante para informarle de la decision (2° Vez)" },
    "-21": { "name": "NOTIFICACIÓN POR AVISO (2° Vez)", "desc": "Notificación mediante email (2° Vez)" },
    "-22": { "name": "EL SOLICITANTE SE PRESENTA (2° Vez)", "desc": "El responsable de la solicitud se ha presentado (2° Vez)" },
    "-30": { "name": "FINALIZADO", "desc": "El proceso de desistimiento ha finalizado oficialmente" }
}
const stepsToCheck = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];
const statesToCheck = ['clock_5', 'clock_6', 'clock_7', 'clock_8', 'clock_10', 'clock_11', 'clock_17', 'clock_18', 'clock_19', 'clock_20', 'clock_21', 'clock_22', 'clock_30'];
const _fun_0_type = { '0': 'SIN CATEGORIZAR', 'i': 'CATEGORIA I', 'ii': "CATEGORIA II", 'iii': "CATEGORIA III", 'iv': "CATEGORIA IV", 'oa': "OTRAS ACTUACIONES" }
const ci = row => !_fun_0_type_days[row.type] ? <label className='fw-bold text-danger'>?</label> : '';
const ci2 = row => !row.clock_not_0 ? <label className='fw-bold text-secondary'>!</label> : '';
const CellStylesJUR = { backgroundColor: 'LemonChiffon' }
const CellStylesENG = { backgroundColor: 'LavenderBlush' }
const CellStylesARQ = { backgroundColor: 'LightCyan' }
let _fun_0_state = (state, simple, row) => {
    let actas = row ? row.clock_record_p1 || row.clock_record_p2 : false;
    let rew_1 = row.rec_review;
    let rew_2 = row.rec_review_2;

    let rew = rew_1 || (!rew_1 && rew_2);

    if (state < '-1' && !simple) return <label className='text-danger text-center'>DESISTIDO (Ejecución)</label>
    if (state < '-1' && simple) return 'DESISTIDO (Ejecución)'
    if (state == '-1') return 'INCOMPLETO'
    if (state == '1') return 'INCOMPLETO'
    if (state == '5' && !actas) return 'LYDF'
    if (state == '5' && actas && !rew) return 'ACTA O&C NO CUMPLE'
    if (state == '5' && actas && rew) return 'ACTA O&C CUMPLE'
    if (state == '50') return 'EXPEDICIÓN'

    if (state == '100' && !simple) return <label className='fw-bold text-center'>CERRADO</label>
    if (state == '101' && !simple) return <label className='fw-bold text-primary'>ARCHIVADO</label>
    if (state == '200' && !simple) return <label className='fw-bold text-center'>CERRADO (Desistido)</label>
    if (state == '201' && !simple) return <label className='text-danger text-center'>DESISTIDO (Incompleto)</label>
    if (state == '202' && !simple) return <label className='text-danger text-center'>DESISTIDO (No radicó valla)</label>
    if (state == '203' && !simple) return <label className='text-danger text-center'>DESISTIDO (No subsanó Acta)</label>
    if (state == '204' && !simple) return <label className='text-danger text-center'>DESISTIDO (No radicó pagos)</label>
    if (state == '205' && !simple) return <label className='text-danger text-center'>DESISTIDO (Voluntario)</label>
    if (state == '206' && !simple) return <label className='text-danger text-center'>DESISTIDO (Negada)</label>

    if (state == '100' && simple) return 'CERRADO'
    if (state == '101' && simple) return 'ARCHIVADO'
    if (state == '200' && simple) return 'CERRADO (Desistido)'
    if (state == '201' && simple) return 'DESISTIDO (Incompleto)'
    if (state == '202' && simple) return 'DESISTIDO (No radicó valla)'
    if (state == '203' && simple) return 'DESISTIDO (No subsanó Acta)'
    if (state == '204' && simple) return 'DESISTIDO (No radicó pagos)'
    if (state == '205' && simple) return 'DESISTIDO (Voluntario)'
    if (state == '206' && simple) return 'DESISTIDO (Negada)'
    return state;
}
const _fun_0_type_days_matrix = {
    'i': { 'law': 1, 'arc': 2, 'eng': 2 },
    'ii': { 'law': 1, 'arc': 3, 'eng': 3 },
    'iii': { 'law': 1, 'arc': 4, 'eng': 4 },
    'iv': { 'law': 1, 'arc': 5, 'eng': 5 },
    'oa': { 'law': 1, 'arc': 1, 'eng': 0 },
    '0': { 'law': 1, 'arc': 1, 'eng': 0 },
}
const moment = require('moment');
class FUN_MACROTABLE extends Component {
    constructor(props) {
        super(props);
        this.tagRef = React.createRef();
        this.retrieveMacro = this.retrieveMacro.bind(this);
        this.retrieveMacroClocks = this.retrieveMacroClocks.bind(this);
        this._UPDATE_FILTERS = this._UPDATE_FILTERS.bind(this);
        this._UPDATE_FILTERS_IDPUBIC = this._UPDATE_FILTERS_IDPUBIC.bind(this);
        this.state = {
            load: false,
            data_include: [],
            data_macro: [],
            data_macro_filter: [],
            data_macro_clocks: [],
            data_macro_clocks_filter: [],
            data_negative: [],
            data_oa: [],
            data_oa_includes: [],
            data_negative_full: [],
            data_negative_simple: [],
            data_clocks: null,

            worker_list: [],
            worker_listForGraps: [],

            hide_jur: false,
            hide_ing: false,
            hide_arc: false,

            fillActive: '1',

            show_charts: false,
            tags: [],
            includeCompelte: false,
            includeEx: false,
        };
    }
    componentDidMount() {
        this.retrieveMacro();
        this.retrieveMacroNegative();
        this.retrieveWorkerList();
        //this.retrieveMacroClocks();
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.state.data_macro !== prevState.data_macro && this.state.data_macro.length > 0) {
            this.setDefaultFilters();
        }
        /*
if ((this.state.data_macro_filter !== prevState.data_macro_filter && this.state.data_macro_filter.length > 0) ||
            (this.state.data_macro_clocks !== prevState.data_macro_clocks && this.state.data_macro_clocks.length > 0)) {
            this.equalizeLists();
        }
        */

    }
    setDefaultFilters() {
        let filter = this.props.defaultFilter;
        if (this.state.tags.length) this._FILTER_LIST(this.state.tags);
        else if (filter) this._UPDATE_FILTERS_IDPUBIC([filter])
        else this._FILTER_LIST([]);
    }
    InitialFilter(_list) {
        var list_f = [];
        var list_oa = [];
        var list_oa_f = [];
        if (this.state.includeCompelte) {
            list_f = _list;
        } else {
            for (let i = 0; i < _list.length; i++) {
                const list = _list[i];
                let con1 = (regexChecker_isOA(list) || regexChecker_isPh(list, true)) && !list.tipo.includes('D')
                let con2 = list.state < 100
                if (con1) { list_oa_f.push(list); }
                if (con1 && con2) { list_oa.push(list); continue; }
                if (list.state < 100) list_f.push(list);
            }
        }
        list_f = _SET_PRIORITY(list_f);

        this.setState({
            data_include: _list,
            data_exlucde: list_f,
            data_macro: list_f,
            data_macro_filter: list_f,
            data_oa: list_oa,
            data_oa_includes: list_oa_f,
            load: true,
        })

        this.setDefaultFilters();

    }
    retrieveMacro(LoadFilter = true) {
        FUN_SERVICE.loadMacro(this.props.date_start, this.props.date_end)
            .then(response => {
                this.InitialFilter(response.data);
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
    retrieveMacroClocks() {
        FUN_SERVICE.loadMacroClocksControl(this.props.date_start, this.props.date_end)
            .then(response => {
                this.setState({ data_macro_clocks: response.data })

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
    retrieveMacroNegative() {
        FUN_SERVICE.loadMacronegative(this.props.date_start, this.props.date_end)
            .then(response => {
                this.asignNegativeList(response.data)
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
    retrieveWorkerList() {
        USER_SERVICE.getAll()
            .then(response => {
                this.setState({ worker_list: response.data })
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
    asignNegativeList(LIST) {
        let negative_list = [];
        let negative_list_full = [];
        for (var i = 0; i < LIST.length; i++) {
            negative_list_full.push(LIST[i]);
            if (LIST[i].state < 0) negative_list.push(LIST[i]);
        }
        this.setState({ data_negative_simple: negative_list, data_negative: negative_list, data_negative_full: negative_list_full })
    }
    changeList = (value) => {
        if (value) this.setState({
            data_macro: this.state.data_include,
            data_macro_filter: this.state.data_include,
            data_oa: this.state.data_oa_includes,
            includeEx: value
        })
        else this.setState({
            data_macro: this.state.data_exlucde,
            data_macro_filter: this.state.data_exlucde,
            includeEx: value,
            data_oa: this.state.data_oa,
        })
        //this.setDefaultFilters();
    }
    equalizeLists() {
        var newData = [];
        console.log("EQUILIZE!")
        this.state.data_macro_filter.map(value => {
            this.state.data_macro_clocks.map(valueJ => {
                if (value.id_public == valueJ.id_public) newData.push(valueJ)
            })
        })
        this.setState({ data_macro_clocks_filter: newData })
    }

    // INPUT TAG WORK FUNCTIONS
    _GET_LAW_REPORT_DATA_ICON(_ITEM) {
        if (!_ITEM.tipo) return 2;
        if (_ITEM.tipo.includes('F')) return 1
        return 2;
    }
    _UPDATE_FILTERS(_FILTER) {
        let _ARRAY_TAGS = this.state.tags;
        if (_ARRAY_TAGS.includes(_FILTER)) _ARRAY_TAGS.splice(_ARRAY_TAGS.indexOf(_FILTER), 1);
        else _ARRAY_TAGS.push(_FILTER);
        this._FILTER_LIST(_ARRAY_TAGS);
    }

    _UPDATE_FILTERS_IDPUBIC(_ARRAY) {
        let _ARRAY_TAGS = this.state.tags;
        let newTag = 'num:' + _ARRAY.join(',')
        _ARRAY_TAGS.push(newTag)
        this._FILTER_LIST(_ARRAY_TAGS);
    }
    _FILTER_LIST(_FILTERS) {
        this.setState({ tags: _FILTERS, load: false });
        if (_FILTERS.length == 0) return this.setState({ data_macro_filter: this.state.data_macro, load: true });
        else if (_FILTERS.length == 1 && _FILTERS[0] == 'relax') return this.setState({ data_macro_filter: this.state.data_macro, load: true });

        let _FULL_LIST = this.state.data_macro;
        let _FILTER_LIST = [];
        let meetConditions = 0;
        let forcedConditions = true

        let _dateBody = {
            rad: item => [item.clock_payment],
            ldf: item => [item.clock_date],
            asg: item => {
                let dates_l_2 = item.clock_asign_law ? item.clock_asign_law.split(',') : []
                let dates_a_2 = item.clock_asign_arc ? item.clock_asign_arc.split(',') : []
                let dates_e_2 = item.clock_asign_eng ? item.clock_asign_eng.split(',') : []

                let dates_l = [item.asign_law_date, item.asign_ph_law_date, ...dates_l_2]
                let dates_a = [item.asign_arc_date, item.asign_ph_arc_date, ...dates_a_2]
                let dates_e = [item.asign_eng_date, ...dates_e_2]

                return [...dates_l, ...dates_a, ...dates_e]
            },
            asgj: item => {
                let dates = item.clock_asign_law ? item.clock_asign_law.split(',') : []
                return [item.asign_law_date, item.asign_ph_law_date, ...dates]
            },
            asga: item => {
                let dates = item.clock_asign_arc ? item.clock_asign_arc.split(',') : []
                return [item.asign_arc_date, item.asign_ph_arc_date, ...dates]
            },
            asge: item => {
                let dates = item.clock_asign_eng ? item.clock_asign_eng.split(',') : []
                return [item.asign_eng_date, ...dates]
            },
            rev: item => {
                let dates_l_2 = item.clock_review_law ? item.clock_review_law.split(',') : []
                let dates_a_2 = item.clock_review_arc ? item.clock_review_arc.split(',') : []
                let dates_e_2 = item.clock_review_eng ? item.clock_review_eng.split(',') : []

                let dates_l = [item.jur_date, item.ph_date_law, ...dates_l_2]
                let dates_a = [item.arc_date, item.ph_date_arc, ...dates_a_2]
                let dates_e = [item.eng_date, ...dates_e_2]

                return [...dates_l, ...dates_a, ...dates_e]
            },
            revj: item => {
                let dates = item.clock_review_law ? item.clock_review_law.split(',') : []
                return [item.jur_date, item.ph_date_law, ...dates]
            },
            reva: item => {
                let dates = item.clock_review_arc ? item.clock_review_arc.split(',') : []
                return [item.arc_date, item.ph_date_arc, ...dates]
            },
            reve: item => {
                let dates = item.clock_review_eng ? item.clock_review_eng.split(',') : []
                return [item.eng_date, ...dates]
            },
            acta1: item => [item.clock_record_p1],
            acta2: item => [item.clock_record_p2],
            anot: item => [item.clock_record_p2, item.clock_not_2],
            aent: item => [item.clock_corrections],
            via: item => [item.clock_pay2],
            res: item => [item.clock_resolution],
            lic: item => [item.clock_license],
            ach: item => [item.clock_archive],
        }

        let _typeBody = {
            a: item => item.tipo ? item.tipo.includes('A') : false,
            urb: item => item.tipo ? item.tipo.includes('A') : false,
            b: item => item.tipo ? item.tipo.includes('B') : false,
            par: item => item.tipo ? item.tipo.includes('B') : false,
            c: item => item.tipo ? item.tipo.includes('C') : false,
            sub: item => item.tipo ? item.tipo.includes('C') : false,
            d: item => item.tipo ? item.tipo.includes('D') : false,
            con: item => item.tipo ? item.tipo.includes('D') : false,
            e: item => item.tipo ? item.tipo.includes('E') : false,
            esp: item => item.tipo ? item.tipo.includes('E') : false,
            f: item => item.tipo ? item.tipo.includes('F') : false,
            rec: item => item.tipo ? item.tipo.includes('F') : false,
            g: item => item.tipo ? item.tipo.includes('G') : false,
            oa: item => item.tipo ? item.tipo.includes('G') : false,

            '2a': item => item.tramite ? item.tramite == ('A') : false,
            ini: item => item.tramite ? item.tramite == ('A') : false,
            '2b': item => item.tramite ? item.tramite == ('B') : false,
            pro: item => item.tramite ? item.tramite == ('B') : false,
            '2C': item => item.tramite ? item.tramite == ('C') : false,
            mlv: item => item.tramite ? item.tramite == ('C') : false,
            '2d': item => item.tramite ? item.tramite == ('D') : false,
            rev: item => item.tramite ? item.tramite == ('D') : false,

            '3a': item => item.m_urb ? item.m_urb.includes('A') : false,
            ude: item => item.m_urb ? item.m_urb.includes('A') : false,
            '3b': item => item.m_urb ? item.m_urb.includes('B') : false,
            usa: item => item.m_urb ? item.m_urb.includes('B') : false,
            '3C': item => item.m_urb ? item.m_urb.includes('C') : false,
            ure: item => item.m_urb ? item.m_urb.includes('C') : false,
            '4a': item => item.m_sub ? item.m_sub.includes('A') : false,
            sru: item => item.m_sub ? item.m_sub.includes('A') : false,
            '4b': item => item.m_sub ? item.m_sub.includes('B') : false,
            sur: item => item.m_sub ? item.m_sub.includes('B') : false,
            '4C': item => item.m_sub ? item.m_sub.includes('C') : false,
            sre: item => item.m_sub ? item.m_sub.includes('C') : false,
            '5a': item => item.m_lic ? item.m_lic.includes('A') : false,
            cob: item => item.m_lic ? item.m_lic.includes('A') : false,
            '5b': item => item.m_lic ? item.m_lic.includes('B') : false,
            cam: item => item.m_lic ? item.m_lic.includes('B') : false,
            '5C': item => item.m_lic ? item.m_lic.includes('C') : false,
            cad: item => item.m_lic ? item.m_lic.includes('C') : false,
            '5d': item => item.m_lic ? item.m_lic.includes('D') : false,
            cmo: item => item.m_lic ? item.m_lic.includes('D') : false,
            '5e': item => item.m_lic ? item.m_lic.includes('E') : false,
            cre: item => item.m_lic ? item.m_lic.includes('E') : false,
            '5f': item => item.m_lic ? item.m_lic.includes('F') : false,
            crf: item => item.m_lic ? item.m_lic.includes('F') : false,
            '5g': item => item.m_lic ? item.m_lic.includes('G') : false,
            cdt: item => item.m_lic ? item.m_lic.includes('G') : false,
            '5gp': item => item.m_lic ? item.m_lic.includes('g') : false,
            cdp: item => item.m_lic ? item.m_lic.includes('g') : false,
            '5h': item => item.m_lic ? item.m_lic.includes('H') : false,
            crc: item => item.m_lic ? item.m_lic.includes('H') : false,
            '5i': item => item.m_lic ? item.m_lic.includes('I') : false,
            cce: item => item.m_lic ? item.m_lic.includes('I') : false,
        }

        let _recordBody = {
            '0': item => item == null ? true : false,
            'si': item => item == 1 ? true : false,
            'no': item => item == 0 ? true : false,
            '2': item => item == 2 ? true : false,
            'naf': item => !item ? true : false,
            'nap': item => !item ? true : false,
        }

        let _actadBody = {
            '0': (rev1, rev2) => (rev1 == null && rev2 == null) ? true : false,
            '1': (rev1, rev2) => (rev1 != null || rev2 != null) ? true : false,
            'si': (rev1, rev2) => ((rev1 == 1 && rev2 != 0) || (rev1 == 0 && rev2 == 1) || (rev1 == null && rev2 == 1)) ? true : false,
            'no': (rev1, rev2) => ((rev1 == 0 && rev2 != 1) || (rev1 == 1 && rev2 == 0)) ? true : false,
            'c': (rev1, rev2) => rev1 == 0 && (rev2 == 1 || rev2 == 0) ? true : false,
            'c0': (rev1, rev2) => rev1 == 0 && (rev2 == null) ? true : false,
        }

        let _desBody = {
            'fin': (row,) => { return row.state > 100 && row.state < 200 },
            'ach': (row) => { return row.state >= 200 },
            'now': (row) => { return row.state < -100 },
            'allcat': (row) => { return row.state >= 100 || row.state <= -100 },
            'inc': (row) => { return row.clocks_version ? row.clocks_version.includes('-1') : false },
            'acta': (row) => { return row.clocks_version ? row.clocks_version.includes('-3') : false },
            'pago': (row) => { return row.clocks_version ? row.clocks_version.includes('-4') : false },
            'vol': (row) => { return row.clocks_version ? row.clocks_version.includes('-5') : false },
            'alltype': (row) => { return row.clocks_version ? row.clocks_version.split(';').some(value => value <= -1) : false },
        }


        for (var i = 0; i < _FULL_LIST.length; i++) {
            for (var j = 0; j < _FILTERS.length; j++) {
                if (_FILTERS[j] == 'relax') forcedConditions = false;
            }
            let inverseCondition = false;
            for (var j = 0; j < _FILTERS.length; j++) {
                let _FILTER = _FILTERS[j]
                if (_FILTER[0] == '!') {
                    inverseCondition = true;
                    _FILTER = _FILTER.slice(1);
                }
                let meetCondition = false;

                const sFILTER = _FILTER.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

                // STATE AND CATEGORY
                let targetState = 0;

                if (sFILTER == 'inc' || sFILTER == 'inc*') targetState = 1;
                if (sFILTER == 'ldf' || sFILTER == 'ldf*') targetState = 2;
                if (sFILTER == 'acta' || sFILTER == 'acta*') targetState = 3;
                if (sFILTER == 'via' || sFILTER == 'via*') targetState = 4;
                if (sFILTER == 'res' || sFILTER == 'res*') targetState = 5;
                if (sFILTER == 'lic' || sFILTER == 'lic*') targetState = 6;
                if (sFILTER == 'end' || sFILTER == 'end*') targetState = 7;
                if (sFILTER == 'cer' || sFILTER == 'cer*') targetState = 7;
                if (sFILTER == 'ach' || sFILTER == 'ach*') targetState = 7;
                if (sFILTER == 'des' || sFILTER == 'des*') targetState = 8;

                let currentState = 0;

                if (_FULL_LIST[i].state == 1 || _FULL_LIST[i].state == -1) currentState = 1;

                if (_FULL_LIST[i].state == 5) currentState = 2;

                if (_FULL_LIST[i].rec_review_2 != null || _FULL_LIST[i].rec_review != null) currentState = 3;

                if (_FULL_LIST[i].clock_pay2) currentState = 4;

                if (_FULL_LIST[i].clock_resolution) currentState = 5;

                if (_FULL_LIST[i].clock_license) currentState = 6;

                if (_FULL_LIST[i].state >= 100) currentState = 7;

                if (_FULL_LIST[i].state == 100) currentState = 7;

                if (_FULL_LIST[i].state == 101) currentState = 7;

                if (_FULL_LIST[i].state < -100) currentState = 8;


                if (targetState > 0 && currentState > 0) {
                    if (sFILTER.includes('*') && currentState >= targetState) meetCondition = true;
                    else if (currentState == targetState) meetCondition = true;
                }

                if (sFILTER == 'c1' && _FULL_LIST[i].type == 'i') meetCondition = true;
                if (sFILTER == 'c2' && _FULL_LIST[i].type == 'ii') meetCondition = true;
                if (sFILTER == 'c3' && _FULL_LIST[i].type == 'iii') meetCondition = true;
                if (sFILTER == 'c4' && _FULL_LIST[i].type == 'vi') meetCondition = true;
                if (sFILTER == 'coa' && _FULL_LIST[i].type == 'oa') meetCondition = true;
                if (sFILTER == 'nc' && (!_FULL_LIST[i].type || _FULL_LIST[i].type == '0')) meetCondition = true;

                if (sFILTER == 'c1*' && _FULL_LIST[i].type == 'i' && (_typeBody['d'](_FULL_LIST[i]) || _typeBody['f'](_FULL_LIST[i]))) meetCondition = true;
                if (sFILTER == 'c2*' && _FULL_LIST[i].type == 'ii' && (_typeBody['d'](_FULL_LIST[i]) || _typeBody['f'](_FULL_LIST[i]))) meetCondition = true;
                if (sFILTER == 'c3*' && _FULL_LIST[i].type == 'iii' && (_typeBody['d'](_FULL_LIST[i]) || _typeBody['f'](_FULL_LIST[i]))) meetCondition = true;
                if (sFILTER == 'c4*' && _FULL_LIST[i].type == 'vi' && (_typeBody['d'](_FULL_LIST[i]) || _typeBody['f'](_FULL_LIST[i]))) meetCondition = true;
                if (sFILTER == 'coa*' && _FULL_LIST[i].type == 'oa' && (_typeBody['d'](_FULL_LIST[i]) || _typeBody['f'](_FULL_LIST[i]))) meetCondition = true;
                if (sFILTER == 'nc*' && (!_FULL_LIST[i].type || _FULL_LIST[i].type == '0') && (_typeBody['d'](_FULL_LIST[i]) || _typeBody['f'](_FULL_LIST[i]))) meetCondition = true;

                // REPORTS
                if (sFILTER.includes('i:') || sFILTER.includes('inf:')) {
                    let _record = sFILTER.split(':');
                    let _recordTypes = _record[1].split(',')
                    let _recordConditions = _record[2].split(',')
                    let _force = sFILTER[sFILTER.length - 1] === '*';
                    let conditions_type = 0;
                    let condition_state = _force ? _FULL_LIST[i].state >= 5 : true;

                    _recordTypes.map(rt => {
                        let isPH = regexChecker_isPh(_FULL_LIST[i], true);
                        let conditions_2 = false;
                        if (String(rt) == 'jur' || String(rt) == 'j') {
                            if (isPH) {
                                _recordConditions.map(con => {
                                    if (con.includes('0') && _recordBody['0'](_FULL_LIST[i].ph_review_law)) conditions_2 = true;
                                    if (con.includes('si') && _recordBody['si'](_FULL_LIST[i].ph_review_law)) conditions_2 = true;
                                    if (con.includes('no') && _recordBody['no'](_FULL_LIST[i].ph_review_law)) conditions_2 = true;
                                    //if (con == 'naf' && _recordBody['naf'](_FULL_LIST[i].sign_ph_law_worker_id)) conditions_2 = true;
                                    if (con.includes('nap') && _recordBody['nap'](_FULL_LIST[i].sign_ph_law_worker_id)) conditions_2 = true;
                                })
                            } else {
                                _recordConditions.map(con => {
                                    if (con.includes('0') && _recordBody['0'](_FULL_LIST[i].jur_review)) conditions_2 = true;
                                    if (con.includes('si') && _recordBody['si'](_FULL_LIST[i].jur_review)) conditions_2 = true;
                                    if (con.includes('no') && _recordBody['no'](_FULL_LIST[i].jur_review)) conditions_2 = true;
                                    //if (con == 'naf' && _recordBody['naf'](_FULL_LIST[i].sign_ph_law_worker_id)) conditions_2 = true;
                                    if (con.includes('nap') && _recordBody['nap'](_FULL_LIST[i].asign_law_worker_id)) conditions_2 = true;
                                })
                            }
                        }
                        if (String(rt) == 'arq' || String(rt) == 'q') {
                            if (isPH) {
                                _recordConditions.map(con => {
                                    if (con.includes('0') && _recordBody['0'](_FULL_LIST[i].ph_review)) conditions_2 = true;
                                    if (con.includes('si') && _recordBody['si'](_FULL_LIST[i].ph_review)) conditions_2 = true;
                                    if (con.includes('no') && _recordBody['no'](_FULL_LIST[i].ph_review)) conditions_2 = true;
                                    //if (con == 'naf' && _recordBody['naf'](_FULL_LIST[i].sign_ph_law_worker_id)) conditions_2 = true;
                                    if (con.includes('nap') && _recordBody['nap'](_FULL_LIST[i].sign_ph_law_worker_id)) conditions_2 = true;
                                })
                            } else {
                                _recordConditions.map(con => {
                                    if (con.includes('0') && _recordBody['0'](_FULL_LIST[i].arc_review)) conditions_2 = true;
                                    if (con.includes('si') && _recordBody['si'](_FULL_LIST[i].arc_review)) conditions_2 = true;
                                    if (con.includes('no') && _recordBody['no'](_FULL_LIST[i].arc_review)) conditions_2 = true;
                                    //if (con == 'naf' && _recordBody['naf'](_FULL_LIST[i].sign_ph_law_worker_id)) conditions_2 = true;
                                    if (con.includes('nap') && _recordBody['nap'](_FULL_LIST[i].asign_arc_worker_id)) conditions_2 = true;
                                })
                            }
                        }

                        if (String(rt) == 'est' || String(rt) == 'e') {
                            _recordConditions.map(con => {
                                if (con.includes('0') && (_recordBody['0'](_FULL_LIST[i].eng_review) || _recordBody['0'](_FULL_LIST[i].eng_review_2))) conditions_2 = true;
                                if (con.includes('si') && (_recordBody['si'](_FULL_LIST[i].eng_review) && (_recordBody['si'](_FULL_LIST[i].eng_review_2) || _recordBody['2'](_FULL_LIST[i].eng_review_2)))) conditions_2 = true;
                                if (con.includes('no') && (_FULL_LIST[i].eng_review == 0 || _FULL_LIST[i].eng_review_2 == 0)) conditions_2 = true;
                                //if (con == 'naf' && _recordBody['naf'](_FULL_LIST[i].sign_ph_law_worker_id)) conditions_2 = true;
                                if (con.includes('nap') && _recordBody['nap'](_FULL_LIST[i].asign_eng_worker_id)) conditions_2 = true;
                            })

                        }

                        if (conditions_2) conditions_type++;

                    })
                    if (conditions_type == _recordTypes.length && condition_state) meetCondition = true;
                }

                // ID

                if (sFILTER.includes('num:') || sFILTER.includes('n:')) {
                    let _lookForId = sFILTER.split(':');
                    let _ids = _lookForId[1].split(',')
                    _ids.map(id => { if (_FULL_LIST[i].id_public.includes(id)) meetCondition = true; })
                }
                // DAYS
                if (sFILTER.includes('dias>') || sFILTER.includes('d>')) {
                    let _lookForDays = sFILTER.split('>');
                    let _daysPassed = dateParser_timePassed(_FULL_LIST[i].clock_payment);
                    if (_daysPassed > 0 && _daysPassed >= _lookForDays[1]) meetCondition = true;
                }
                if (sFILTER.includes('dias<') || sFILTER.includes('d<')) {
                    let _lookForDays = sFILTER.split('<');
                    let _daysPassed = dateParser_timePassed(_FULL_LIST[i].clock_payment);
                    if (_daysPassed > 0 && _daysPassed <= _lookForDays[1]) meetCondition = true;
                }
                // MIX
                // SIGN
                if (sFILTER == 'valla' && _FULL_LIST[i].sign != null) {
                    let sign = [];
                    sign = _FULL_LIST[i].sign.split(',');
                    if (sign[1]) visualViewport = true;
                }
                if (sFILTER == 'vallano' && _FULL_LIST[i].sign == null) meetCondition = true;
                // SEAL
                if (sFILTER == 'sello' && _FULL_LIST[i].seal != null) meetCondition = true;
                if (sFILTER == 'sellono' && _FULL_LIST[i].seal == null) meetCondition = true;
                // REPORT
                if (sFILTER == 'rep') {
                    let reportRequirement = this._GET_LAW_REPORT_DATA_ICON(_FULL_LIST[i]);
                    if (reportRequirement == 1) {
                        if (_FULL_LIST[i].report_cub) meetCondition = true;
                    }
                }
                if (sFILTER == 'repno') {
                    let reportRequirement = this._GET_LAW_REPORT_DATA_ICON(_FULL_LIST[i]);
                    if (reportRequirement == 1) {
                        if (!_FULL_LIST[i].report_cub) meetCondition = true;
                    }
                }
                // NEIGHBOOURS
                if (sFILTER == 'vecino') {
                    let ITEM = _FULL_LIST[i];
                    if (ITEM.neighbours > 0 && !regexChecker_isPh(ITEM, true)) {
                        if (ITEM.neighbours == ITEM.alerted) meetCondition = true;
                    }
                }
                if (sFILTER == 'vecinono') {
                    let ITEM = _FULL_LIST[i];
                    if (ITEM.neighbours > 0 && !regexChecker_isPh(ITEM, true)) {
                        if (ITEM.neighbours != ITEM.alerted) meetCondition = true;
                    }
                }
                // TYPE
                if (sFILTER.includes('lic:') || sFILTER.includes('l:')) {
                    let _lookForId = sFILTER.split(':');
                    let _types = _lookForId[1];
                    if (_types == 'no') {
                        let noCondition = false;
                        if (_FULL_LIST[i].tipo == 'A') noCondition = true;
                        else if (_FULL_LIST[i].tipo == 'B') noCondition = true;
                        else if (_FULL_LIST[i].tipo == 'C') noCondition = true;
                        else if (_FULL_LIST[i].tipo == 'D') noCondition = true;
                        else if (_FULL_LIST[i].tipo == 'D,F') noCondition = true;
                        else if (_FULL_LIST[i].tipo == 'D,G') noCondition = true;
                        else if (_FULL_LIST[i].tipo == 'F') noCondition = true;
                        else if (_FULL_LIST[i].tipo == 'G') noCondition = true;
                        else if (_FULL_LIST[i].tramite == 'B' || _FULL_LIST[i].tramite == 'C' || _FULL_LIST[i].tramite == 'D') noCondition = true;

                        if (noCondition == false) meetCondition = true;
                    } else {
                        _types = _lookForId[1].split(',')
                        let counterConditions = 0;
                        _types.map(type => {
                            let condition;
                            try {
                                condition = _typeBody[type](_FULL_LIST[i]);
                                if (condition) counterConditions++;
                            } catch (error) {
                                condition = false;
                            }

                            if (counterConditions == _types.length) meetCondition = true;
                        })
                    }
                }
                // WORKER
                if (sFILTER.includes('prof:') || sFILTER.includes('r:')) {
                    if (sFILTER === 'prof:no' || sFILTER === 'r:no') {
                        let workerName = "";
                        if (regexChecker_isPh(_FULL_LIST[i], true)) {
                            if (_FULL_LIST[i].asign_ph_law_worker_name) workerName = _FULL_LIST[i].asign_ph_law_worker_name;
                            if (_FULL_LIST[i].asign_ph_arc_worker_name) workerName = _FULL_LIST[i].asign_ph_arc_worker_name;
                        } else {
                            if (_FULL_LIST[i].asign_law_worker_name) workerName = _FULL_LIST[i].asign_law_worker_name;
                            if (_FULL_LIST[i].asign_eng_worker_name) workerName = _FULL_LIST[i].asign_eng_worker_name;
                            if (_FULL_LIST[i].asign_arc_worker_name) workerName = _FULL_LIST[i].asign_arc_worker_name;
                        }
                        if (workerName.length == 0) meetCondition = true;
                    } else {
                        let _lookForName = sFILTER.split(':');
                        let workerName = [];
                        let checkName = _lookForName[1];
                        if (regexChecker_isPh(_FULL_LIST[i], true)) {
                            if (_FULL_LIST[i].asign_ph_law_worker_name) workerName.push(_FULL_LIST[i].asign_ph_law_worker_name);
                            if (_FULL_LIST[i].asign_ph_arc_worker_name) workerName.push(_FULL_LIST[i].asign_ph_arc_worker_name);
                        } else {
                            if (_FULL_LIST[i].asign_law_worker_name) workerName.push(_FULL_LIST[i].asign_law_worker_name);
                            if (_FULL_LIST[i].asign_eng_worker_name) workerName.push(_FULL_LIST[i].asign_eng_worker_name);
                            if (_FULL_LIST[i].asign_arc_worker_name) workerName.push(_FULL_LIST[i].asign_arc_worker_name);
                        }
                        if (workerName.length) {
                            let sCheckName = checkName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

                            let condition = workerName.some(value => {
                                let sWorkname = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                                let condition = sWorkname.includes(sCheckName)
                                return condition;
                            })
                            if (condition) meetCondition = true;
                        }
                    }
                }

                // PAYMENTS
                if (sFILTER.includes('pago:') || sFILTER.includes('p:')) {
                    let _separateFilter = sFILTER.split(':');
                    let _cons = _separateFilter[1].split(',');
                    let counterConditions = 0;
                    _cons.map(type => {
                        let condition;
                        if (type == 'fijo') condition = _FULL_LIST[i].clock_payment;
                        if (type == 'var') condition = _FULL_LIST[i].clock_pay_62;
                        if (type == 'inm') condition = _FULL_LIST[i].clock_pay_63;
                        if (type == 'uis') condition = _FULL_LIST[i].clock_pay_64;
                        if (type == 'deb') condition = _FULL_LIST[i].clock_pay_65;

                        if (condition) counterConditions++;
                    })
                    if (counterConditions > 0) meetCondition = true;
                }
                // REPORT REVIEW
                if (sFILTER.includes('acta:') || sFILTER.includes('a:')) {
                    let _separateFilter = sFILTER.split(':');

                    let _consStr = _separateFilter[1]
                    let counterConditions = 0;
                    let _force = sFILTER[sFILTER.length - 1] === '*';
                    let _cons;
                    if (_force) _cons = _consStr.substring(0, _consStr.length - 1);
                    else _cons = _consStr;
                    _cons = _cons.split(',')

                    let condition_state = _force ? _FULL_LIST[i].state >= 5 : true;
                    _cons.map(type => {
                        let condition;
                        try {
                            if (type == 'not') {
                                condition = (_FULL_LIST[i].clock_not_1 != null || _FULL_LIST[i].clock_not_2 != null || _FULL_LIST[i].clock_not_3 != null || _FULL_LIST[i].clock_not_4 != null)
                            } else {
                                condition = _actadBody[type](_FULL_LIST[i].rec_review, _FULL_LIST[i].rec_review_2);
                            }
                        } catch (error) {
                            condition = false;
                        }
                        if (condition) counterConditions++;
                    })
                    if (counterConditions > 0 && condition_state) meetCondition = true;
                }

                // EXPEDITION
                if (sFILTER.includes('exp:') || sFILTER.includes('e:')) {

                    let _separateFilter = sFILTER.split(':');
                    let _cons = _separateFilter[1].split(',')
                    let _consres = _separateFilter[2]
                    let counterConditions = 0;
                    let _force = sFILTER[sFILTER.length - 1] === '*';
                    let condition_state = _force ? _FULL_LIST[i].state >= 5 : true;
                    _cons.map(type => {
                        let condition;
                        if (type == 'via') condition = _FULL_LIST[i].clock_pay2;
                        if (type == 'eje') condition = _FULL_LIST[i].clock_eje;
                        if (type == 'lic') condition = _FULL_LIST[i].clock_license;
                        if (type == 'res' && !_consres) condition = _FULL_LIST[i].clock_resolution;
                        if (type == 'res' && _consres) {
                            if (_consres == _FULL_LIST[i].clock_resolution_c) condition = true;
                            let splitCon = _consres.split('-');
                            if (splitCon[0] && !splitCon[1]) {
                                if (!isNaN(splitCon[0]) && Number(_FULL_LIST[i].exp_id) == Number(splitCon[0])) condition = true;
                            }
                            if (splitCon[0] && splitCon[1]) {
                                if (!isNaN(splitCon[0]) && Number(_FULL_LIST[i].exp_id) == Number(splitCon[0]) && splitCon[1] == moment(_FULL_LIST[i].clock_resolution, 'YYYY-MM-DD').format('YY', true)) condition = true;
                            }

                        }

                        if (condition) counterConditions++;
                    })
                    if (counterConditions > 0 && condition_state) meetCondition = true;
                }


                // PQRS X FUN 
                if (sFILTER == 'pqrs' && _FULL_LIST[i].pqrs > 0) meetCondition = true;

                // DATES
                if (sFILTER.includes('fecha:') || sFILTER.includes('f:')) {
                    let fiterBody = sFILTER.split(':');
                    if (fiterBody[0] == 'fecha' || fiterBody[0] == 'f') {
                        let type = fiterBody[1];
                        let date1 = fiterBody[2];
                        let date2 = fiterBody[3];
                        let case_1 = date1 && (date2 == undefined);
                        let case_2 = moment(date2, 'YYYY-MM-DD', true).isValid() && moment(date2, 'YYYY-MM-DD', true).isValid();
                        let case_3 = moment(date2, 'YYYY-MM-DD', true).isValid() && !isNaN(date2);
                        let case_4 = date1[0] == '-' && (date1[1] == 'd' || date1[1] == 'w' || date1[1] == 'm' || date1[1] == 'y');

                        let dates;
                        try {
                            dates = _dateBody[type](_FULL_LIST[i]);
                            if (dates == null) continue;
                        } catch (error) {
                            continue;
                        }
                        dates = dates.filter(date => date != null)

                        dates.map(date => {
                            if (case_1) {
                                if (date.includes(date1)) meetCondition = true;
                            }
                            if (case_2) {
                                if (moment(date).isBetween(date1, date2, undefined, '[]')) meetCondition = true;
                            }
                            if (case_3) {
                                let finalDate = dateParser_finalDate(date1, date2)
                                if (moment(date).isBetween(date1, finalDate, undefined, '[]')) meetCondition = true;
                            }
                            if (case_4) {
                                let numberT = date1.substring(2, date1.length)
                                if (numberT.length == 0) numberT = 1;
                                else numberT = Number(numberT);

                                if (!isNaN(numberT)) {
                                    let today = moment();
                                    let lastDate;
                                    if (date1[1] == 'd') {
                                        lastDate = today.subtract(numberT, "days");
                                    }
                                    if (date1[1] == 'w') {
                                        lastDate = today.subtract(numberT, "week");
                                        lastDate.startOf('isoWeek');
                                    }
                                    if (date1[1] == 'm') {
                                        lastDate = today.subtract(numberT, "month");
                                        lastDate.startOf('month');
                                    }
                                    if (date1[1] == 'y') {
                                        lastDate = today.subtract(numberT, "year");
                                        lastDate.startOf('year');
                                    }
                                    if (moment(date).isBetween(lastDate, moment(), undefined, '[]')) meetCondition = true;
                                }
                            }
                        })
                    }


                }
                // TAG
                if ((sFILTER.includes('tag:') || sFILTER.includes('t:')) && sFILTER[0] == 't') {
                    let _lookFor = sFILTER.split(':');
                    let tags = _lookFor[1].split(',');
                    let itemsTags = _FULL_LIST[i].tags ?? [];
                    meetCondition = tags.some(value => { if (String(itemsTags).toLowerCase().includes(value)) return true });
                }

                //NEGATIVE PROCESS
                if (sFILTER.includes('des:') || sFILTER.includes('x:')) {
                    let _lookFor = sFILTER.split(':');
                    let categories = _lookFor[1].split(',');
                    let states = _lookFor[2].split(',');
                    let conditions_type = 0;
                    let clocks_states = _FULL_LIST[i].clocks_state ?? '';
                    let con_ci = clocks_states.includes('-5');
                    let con_cf = clocks_states.includes('-30');
                    if (con_ci) {
                        if (categories == '*') {
                            let conditions_2 = false;
                            let con1 = _desBody['allcat'](_FULL_LIST[i]);
                            if (states == '*') {
                                if (_desBody['alltype'](_FULL_LIST[i])) conditions_2 = true
                            } else {
                                conditions_2 = states.some(state => _desBody[state](_FULL_LIST[i]))
                            }
                            if (conditions_2 && con1) conditions_type++;
                        } else {
                            categories.map(category => {
                                let conditions_2 = false;
                                let con1 = _desBody[category](_FULL_LIST[i]);
                                if (states == '*') {
                                    if (_desBody['alltype'](_FULL_LIST[i])) conditions_2 = true
                                } else {
                                    conditions_2 = states.some(state => _desBody[state](_FULL_LIST[i]))
                                }
                                if (conditions_2 && con1) conditions_type++;
                            })
                        }
                    }
                    if (conditions_type >= categories.length) meetCondition = true;

                }

                //PRIORITY
                if (sFILTER.includes('prio:') || sFILTER == 'prio') {
                    let _lookFor = sFILTER.split(':');
                    let rank = _lookFor[1];
                    //console.log(_FULL_LIST[i].priority_rank, _FULL_LIST[i].priority)
                    if (rank == undefined) {
                        if (_FULL_LIST[i].priority_rank > 0) meetCondition = true;
                    } else {
                        let number = Number(rank)
                        if (_FULL_LIST[i].priority_rank == number) meetCondition = true;
                    }


                }

                //TABLE
                if (sFILTER == 'table') {
                    let arc_tb = getJSONFull(_FULL_LIST[i].arc_cat).tb_ok
                    if (arc_tb) meetCondition = true;
                }

                if (inverseCondition) meetCondition = !meetCondition;
                if (meetCondition) meetConditions++;
            }

            if (forcedConditions) { if (meetConditions >= _FILTERS.length) _FILTER_LIST.push(_FULL_LIST[i]); }
            else { if (meetConditions > 0) _FILTER_LIST.push(_FULL_LIST[i]); }

            meetConditions = 0;
        }

        this.setState({ data_macro_filter: _FILTER_LIST, load: true })
    }
    myDataWorkers = () => {
        const workersNames_bundle = []
        var vals = [];
        var vals_p = []
        let _workers = this.state.worker_list;
        let items = this.state.data_macro_filter;

        for (var i = 0; i < _workers.length; i++) {
            workersNames_bundle.push(_workers[i].name + ' ' + _workers[i].surname);
            vals.push(0);
            vals_p.push(0);
        }

        for (var i = 0; i < items.length; i++) {
            var workersNames_bundle_toCheck = [];
            if (regexChecker_isPh(items[i], true)) {
                if (items[i].asign_ph_law_worker_name) workersNames_bundle_toCheck.push(items[i].asign_ph_law_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
                if (items[i].asign_ph_arc_worker_name) workersNames_bundle_toCheck.push(items[i].asign_ph_arc_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
            } else {
                if (items[i].asign_law_worker_name) workersNames_bundle_toCheck.push(items[i].asign_law_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
                if (items[i].asign_eng_worker_name) workersNames_bundle_toCheck.push(items[i].asign_eng_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
                if (items[i].asign_arc_worker_name) workersNames_bundle_toCheck.push(items[i].asign_arc_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
            }
            for (var j = 0; j < workersNames_bundle.length; j++) {
                let nameToCheck = workersNames_bundle[j].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                if (workersNames_bundle_toCheck.includes(nameToCheck)) vals[j]++;
            }

        }

        for (var i = 0; i < vals_p.length; i++) {
            vals_p[i] = vals[i] / items.length * 100;
        }

        let data = [];
        for (var i = 0; i < workersNames_bundle.length; i++) {
            data.push({
                name: `${_workers[i].name} ${_workers[i].surname}`,
                val: vals[i], val_p: (vals_p[i]).toFixed(2),
            })
        }

        return data;
    }

    _GET_MIN_VALUE(row) {
        let v1a = Number(row.priority_left || 0);
        let v1b = Number(row.priority_rec || 0);
        // let v1c = Number(row.priority_corr || 0);

        let arr1 = [v1b]

        //if (v1c <= 5) arr1.push(v1c)

        if (row.corrections) arr1.push(v1a)
        if (row.state < 5 && row.priority_pay <= 5 && row.priority_pay >= 0) arr1.push(row.priority_pay)

        return Math.min(...arr1)
    }

    render() {
        const { translation, swaMsg, globals, selectedRow, defaultFilter } = this.props;
        const { load } = this.state;
        //  WORIKING CONSTS
        const ExpandedComponent = ({ data }) => <>
            <div style={{ width: '95vw' }} className="m-3">
                <TABLE_COMPONENT_EXPANDED currentItem={data}
                    requestUpdate={() => this.retrieveMacro()}
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    worker_list={this.state.worker_list}
                    lenghtL={this.state.data_macro_filter.length}
                    dataL={this.state.data_macro_filter}
                    date_start={this.props.date_start}
                    date_end={this.props.date_end} />
            </div>
        </>;

        const rowSelectedStyle = [
            {
                when: row => row.id == selectedRow,
                style: {
                    backgroundColor: 'BlanchedAlmond',
                },
            },
        ];
        const rowSelectedStyleNegative = [
            {
                when: row => row.id_sistem == selectedRow,
                style: {
                    backgroundColor: 'BlanchedAlmond',
                },
            },
        ];
        const conditionalCellStylesJUR = [
            {
                when: row => row.id == selectedRow,
                style: { backgroundColor: 'BlanchedAlmond' }
            },
            {
                when: row => row.id != selectedRow,
                style: { backgroundColor: 'LemonChiffon' }
            }
        ];
        const conditionalCellStylesENG = [
            {
                when: row => row.id == selectedRow,
                style: { backgroundColor: 'BlanchedAlmond' }
            },
            {
                when: row => row.id != selectedRow,
                style: { backgroundColor: 'LavenderBlush' }
            }
        ];
        const conditionalCellStylesARQ = [
            {
                when: row => row.id == selectedRow,
                style: { backgroundColor: 'BlanchedAlmond' }
            },
            {
                when: row => row.id != selectedRow,
                style: { backgroundColor: 'LightCyan' }
            }
        ];

        const columns = [
            {
                name: <label>No. RADICACION</label>,
                selector: 'id_public',
                sortable: true,
                filterable: true,
                minWidth: '140px',
                fixed: true,
                cell: row => <label >{row.id_public}</label>
            },
            {
                name: <label>INFO</label>,
                button: true,
                fixed: true,
                minWidth: '80px',
                ignoreCSV: true,
                cell: row => <MDBPopover size='sm' color='info' btnChildren={'MENU'} placement='right' dismiss>
                    {_MODULE_BTN_POP(row)}
                </MDBPopover>
            },
            {
                name: <label>ACTUACION</label>,
                selector: row => formsParser1(row, true),
                sortable: true,
                filterable: true,
                minWidth: '400px',
                allowOverflow: true,
                cvsCB: row => formsParser1(row, true),
                cell: row => <h6 className='fw-normal'>{row.usos == 'A' ? <u>{formsParser1(row, true)}</u> : formsParser1(row, true)}</h6>
            },
            {
                name: <label className="text-center">ESTADO</label>,
                selector: row => _fun_0_state(row.state, true, row),
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '140px',
                cvsCB: row => _fun_0_state(row.state, true, row),
                cell: row => <label>{_fun_0_state(row.state, false, row)}</label>
            },
            {
                name: <label className="text-center">CATEGORIA</label>,
                selector: 'type',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '160px',
                cell: row => <label>{_fun_0_type[row.type]}</label>
            },
            {
                name: <label className="text-center">PROGRESION</label>,
                center: true,
                minWidth: '330px',
                ignoreCSV: true,
                cell: row => <FUN_ICON_PROGRESS translation={translation} globals={globals} currentItem={row} small />
            },
            {
                name: <label className="text-center">FECHA RADICACIÓN</label>,
                selector: row => row.clock_payment,
                sortable: true,
                filterable: true,
                minWidth: '130px',
                cell: row => <label>{row.clock_payment}</label>
            },
            {
                name: <label className="text-center">FECHA MAX LyDF</label>,
                selector: row => row.state == 1 || row.state == -1 ? dateParser_finalDate(row.clock_payment, 30) : '',
                sortable: true,
                filterable: true,
                center: true,
                cvsCB: row => row.state == 1 || row.state == -1 ? dateParser_finalDate(row.clock_payment, 30) : '-',
                cell: row => row.state == 1 || row.state == -1 ?
                    <label>{dateParser_finalDate(row.clock_payment, 30)}</label>
                    : <i class="fas fa-minus"></i>
            },
            {
                name: <label className="text-center">DIAS LyDF</label>,
                selector: row => row.state == 1 || row.state == -1 ? dateParser_timePassed(row.clock_payment) : -1,
                sortable: true,
                filterable: true,
                center: true,
                cvsCB: row => row.state == 1 || row.state == -1 ? dateParser_timePassed(row.clock_payment) > 30 ?
                    dateParser_timePassed(row.clock_payment)
                    : dateParser_timePassed(row.clock_payment) + '/ 30'
                    : '-',
                cell: row => row.state == 1 || row.state == -1 ?
                    <label>{dateParser_timePassed(row.clock_payment) > 30 ?
                        <label className='text-danger'>{dateParser_timePassed(row.clock_payment)}</label>
                        : <label>{dateParser_timePassed(row.clock_payment)}</label>} / 30</label>
                    : <i class="fas fa-minus"></i>
            },
            {
                name: <label className="fw-bold text-primary text-center">LYDF</label>,
                selector: row => row.clock_date,
                sortable: true,
                filterable: true,
                minWidth: '120px',
                cell: row => <label className="fw-bold text-primary">{row.clock_date}</label>
            },
            {
                name: <label className="text-center">FECHA MAX ACTA</label>,
                selector: row => row.clock_record_p1 == null ? dateParser_finalDate(row.clock_date, _fun_0_type_time[row.type] ?? 45) : '',
                sortable: true,
                filterable: true,
                minWidth: '120px',
                cvsCB: row => row.clock_record_p1 == null ? dateParser_finalDate(row.clock_date, _fun_0_type_time[row.type] ?? 45) : '-',
                cell: row => row.clock_record_p1 == null ? <>
                    <label>{dateParser_finalDate(row.clock_date, _fun_0_type_time[row.type] ?? 45)}</label>
                    {ci(row)}</>
                    : <i class="fas fa-minus"></i>
            },
            {
                name: <label className="text-center">T. ACTA</label>,
                selector: row => row.clock_record_p1 == null ? row.days_ldf : row.days_r1,
                sortable: true,
                filterable: true,
                center: true,
                cvsCB: row => row.clock_record_p1 == null ?
                    `${row.days_ldf}/${_fun_0_type_time[row.type] ?? 45}` : `${row.days_r1}/${_fun_0_type_time[row.type] ?? 45}`,
                cell: row => row.clock_record_p1 == null ?
                    <label>
                        <label className={row.days_ldf > (_fun_0_type_time[row.type] ?? 45) ? 'text-danger' : ''}>
                            {row.days_ldf}</label> / {_fun_0_type_time[row.type] ?? 45}
                        {ci(row)}
                    </label>
                    : <label>
                        <label className={row.days_r1 > (_fun_0_type_time[row.type] ?? 45) ? 'text-danger' : ''}>
                            {row.days_r1}</label> / {_fun_0_type_time[row.type] ?? 45}
                        {ci(row)}
                    </label>
            },
            {
                name: <label className="text-center">INDICE PRIORIDAD</label>,
                selector: row => row.priority_index,
                sortable: true,
                filterable: true,
                center: true,
                ignoreCSV: true,
                cell: row => row.priority_index,
            },
            {
                name: <label className="text-center">PRIORIDAD</label>,
                selector: row => row.priority || 9999,
                sortable: true,
                filterable: true,
                center: true,
                ignoreCSV: true,
                cell: row => row.priority > 0 ? <MDBPopover size='sm' clbtnClassName="mx-0" rounded placement='right' dismiss
                    btnChildren={row.priority_rank} style={{ fontSize: '75%', backgroundColor: priority_colors[row.priority_rank] }}>
                    {_PRIORITY_POP(row)}
                </MDBPopover> : ''
            },
            /**
          {
              name: <label>JUR. PROF. ASIG.</label>,
              selector: row => !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.asign_law_worker_name : row.asign_ph_law_worker_name,
              sortable: true,
              filterable: true,
              minWidth: '200px',
              conditionalCellStyles: conditionalCellStylesJUR,
              cellStyle: CellStylesJUR,
              center: true,
              omit: this.state.hide_jur,
              cell: row => this.state['asign_jur_' + row.id]
                  ? <>{_WORKERS_SELECT(
                      !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.asign_law_worker_id : row.asign_ph_law_worker_id,
                      !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.jur_id : row.ph_id,
                      !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? 'law' : 'phl',
                      row, [2, 5]
                  )}</>
                  : <label>{!_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.asign_law_worker_name : row.asign_ph_law_worker_name}</label>
          },
        
           *   {
             name: <label>ASIGNAR</label>,
             omit: (this.state.hide_jur && !(window.user.id == 1 || window.user.roleId == 3)),
             conditionalCellStyles: conditionalCellStylesJUR,
             cellStyle: CellStylesJUR,
             center: true,
             minWidth: '70px',
             cell: row => <div class="form-check">
                 <input class="form-check-input" type="checkbox" defaultChecked={this.state['asign_jur_' + row.id]} onChange={(e) => this.setState({ ['asign_jur_' + row.id]: e.target.checked })} />
             </div>
         },
         {
             name: <label>#</label>,
             omit: this.state.hide_jur,
             minWidth: '70px',
             conditionalCellStyles: conditionalCellStylesJUR,
             cellStyle: CellStylesJUR,
             cell: row => <label>{_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.ph_version : row.clock_asign_law ? row.clock_asign_law.split(';').length : row.jur_version}</label>
         },
         {
             name: <label>JUR. FECHA ASIG.</label>,
             selector: row => !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_ASIGN_DATE(row.asign_law_date, 11, row) : row.asign_ph_law_date,
             sortable: true,
             filterable: true,
             minWidth: '200px',
             conditionalCellStyles: conditionalCellStylesJUR,
             cellStyle: CellStylesJUR,
             center: true,
             omit: this.state.hide_jur,
             cell: row => <label>{!_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_ASIGN_DATE(row.asign_law_date, 11, row) : row.asign_ph_law_date}</label>
         },
         {
             name: <label>JUR. FECHA MAX.</label>,
             selector: row => !_REGEX_MATCH_PH(_PARSE_FUN_1(row))
                 ? dateParser_finalDate(_GET_ASIGN_DATE(row.asign_law_date, 11, row), _fun_0_type_days[row.type] ?? 5)
                 : dateParser_finalDate(row.asign_ph_law_date, _fun_0_type_days[row.type] ?? 5),
             sortable: true,
             filterable: true,
             minWidth: '200px',
             conditionalCellStyles: conditionalCellStylesJUR,
             cellStyle: CellStylesJUR,
             center: true,
             omit: this.state.hide_jur,
             cell: row => <label>{!_REGEX_MATCH_PH(_PARSE_FUN_1(row))
                 ?
                 _GET_ASIGN_DATE(row.asign_law_date, 11, row)
                     ? dateParser_finalDate(moment(_GET_ASIGN_DATE(row.asign_law_date, 11, row)).isSameOrAfter(row.clock_date, 'day') >= 0 ? _GET_ASIGN_DATE(row.asign_law_date, 11, row) : row.clock_date, _fun_0_type_days[row.type] ?? 5)
                     : dateParser_finalDate(row.clock_date, _fun_0_type_days[row.type] ?? 5)
                 : dateParser_finalDate(moment(row.asign_ph_law_date).isSameOrAfter(row.clock_date, 'day') >= 0 ? row.asign_ph_law_date : row.clock_date, _fun_0_type_days[row.type] ?? 5)
             } {!_REGEX_MATCH_PH(_PARSE_FUN_1(row))
                 ? _GET_ASIGN_DATE(row.asign_law_date, 11, row) && !_fun_0_type_days[row.type] ? <label className='fw-bold text-danger'>?</label> : ''
                 : row.asign_ph_law_date && !_fun_0_type_days[row.type] ? <label className='fw-bold text-danger'>?</label> : ''}
             </label>
         },
         {
             name: <label>JUR. FECHA REV.</label>,
             selector: row => _REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.ph_date_law : row.jur_date,
             sortable: true,
             filterable: true,
             minWidth: '150px',
             conditionalCellStyles: conditionalCellStylesJUR,
             cellStyle: CellStylesJUR,
             center: true,
             omit: this.state.hide_jur,
             cell: row => <label>{_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.ph_date_law : row.jur_date}</label>
         },
          {
              name: <label>DIAS</label>,
              selector: row => dateParser_dateDiff(
                  !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.jur_date : row.ph_date_law,
                  !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_ASIGN_DATE(row.asign_law_date, 11, row) ? moment(_GET_ASIGN_DATE(row.asign_law_date, 11, row)).isSameOrAfter(row.clock_date, 'day') >= 0 ? _GET_ASIGN_DATE(row.asign_law_date, 11, row) : row.clock_date : row.clock_date : row.asign_ph_law_date
                  , true),
              sortable: true,
              filterable: true,
              conditionalCellStyles: conditionalCellStylesJUR,
              cellStyle: CellStylesJUR,
              center: true,
              minWidth: '70px',
              omit: this.state.hide_jur,
              cell: row => {
                  let diff = dateParser_dateDiff(
                      !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.jur_date : row.ph_date_law,
                      !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_ASIGN_DATE(row.asign_law_date, 11, row) ? moment(_GET_ASIGN_DATE(row.asign_law_date, 11, row)).isSameOrAfter(row.clock_date, 'day') >= 0 ? _GET_ASIGN_DATE(row.asign_law_date, 11, row) : row.clock_date : row.clock_date : row.asign_ph_law_date
                      , true)
                  return <>
                      <label> <label className={diff < 0 ? 'text-success fw-bold' : diff > (_fun_0_type_days[row.type] ?? 5) ? 'text-danger' : ''}>{diff}</label>
                          / {_fun_0_type_days[row.type] ?? 5}

                          {ci(row)}
                      </label>
                  </>
              }
          },
*/

            {
                name: <label>JUR. REVISION</label>,
                selector: row => _REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_REVIEW(row.ph_review_law) : _GET_REVIEW(row.jur_review),
                sortable: true,
                filterable: true,
                minWidth: '130px',
                conditionalCellStyles: conditionalCellStylesJUR,
                cellStyle: CellStylesJUR,
                center: true,
                omit: this.state.hide_jur,
                cvsCB: row => _REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_REVIEW(row.ph_review_law, false, false, true) : _GET_REVIEW(row.jur_review, row.clock_review_law_c, row.clock_asign_law, true),
                cell: row => <label>{_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_REVIEW(row.ph_review_law) : _GET_REVIEW(row.jur_review, row.clock_review_law_c, row.clock_asign_law)}</label>
            },
            /**
                        {
                            name: <label>ASIGNAR</label>,
                            omit: this.state.hide_arc && !(window.user.id == 1 || window.user.roleId == 3),
                            conditionalCellStyles: conditionalCellStylesARQ,
                            cellStyle: CellStylesARQ,
                            center: true,
                            minWidth: '70px',
                            cell: row => <div class="form-check">
                                <input class="form-check-input" type="checkbox" defaultChecked={this.state['asign_arc_' + row.id]} onChange={(e) => this.setState({ ['asign_arc_' + row.id]: e.target.checked })} />
                            </div>
                        },
                        {
                            name: <label>#</label>,
                            center: true,
                            minWidth: '70px',
                            omit: this.state.hide_arc,
                            conditionalCellStyles: conditionalCellStylesARQ,
                            cellStyle: CellStylesARQ,
                            cell: row => <label>{_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.ph_version : row.clock_asign_arc ? row.clock_asign_arc.split(';').length : row.arc_version}</label>
                        },
                        {
                            name: <label>ARQ. FECHA ASIG.</label>,
                            selector: row => !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_ASIGN_DATE(row.asign_arc_date, 13, row) : row.asign_ph_arc_date,
                            sortable: true,
                            filterable: true,
                            minWidth: '200px',
                            conditionalCellStyles: conditionalCellStylesARQ,
                            cellStyle: CellStylesARQ,
                            center: true,
                            omit: this.state.hide_arc,
                            cell: row => <label>{!_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_ASIGN_DATE(row.asign_arc_date, 13, row) : row.asign_ph_law_date}</label>
                        },
                        {
                            name: <label>ARQ. FECHA MAX.</label>,
                            selector: row => !_REGEX_MATCH_PH(_PARSE_FUN_1(row))
                                ? dateParser_finalDate(_GET_ASIGN_DATE(row.asign_arc_date, 13, row), _fun_0_type_days[row.type] ?? 5)
                                : dateParser_finalDate(row.asign_ph_arc_date, _fun_0_type_days[row.type] ?? 5),
                            sortable: true,
                            filterable: true,
                            minWidth: '200px',
                            conditionalCellStyles: conditionalCellStylesARQ,
                            cellStyle: CellStylesARQ,
                            center: true,
                            omit: this.state.hide_arc,
                            cell: row => <label>{!_REGEX_MATCH_PH(_PARSE_FUN_1(row))
                                ?
                                _GET_ASIGN_DATE(row.asign_arc_date, 13, row)
                                    ? dateParser_finalDate(moment(_GET_ASIGN_DATE(row.asign_arc_date, 13, row)).isSameOrAfter(row.clock_date, 'day') >= 0 ? _GET_ASIGN_DATE(row.asign_arc_date, 13, row) : row.clock_date, _fun_0_type_days[row.type] ?? 5)
                                    : dateParser_finalDate(row.clock_date, _fun_0_type_days[row.type] ?? 5)
                                : dateParser_finalDate(row.asign_ph_arc_date, _fun_0_type_days[row.type] ?? 5)
                            }  {!_REGEX_MATCH_PH(_PARSE_FUN_1(row))
                                ? _GET_ASIGN_DATE(row.asign_arc_date, 13, row) && !_fun_0_type_days[row.type] ? <label className='fw-bold text-danger'>?</label> : ''
                                : row.asign_ph_arc_date && !_fun_0_type_days[row.type] ? <label className='fw-bold text-danger'>?</label> : ''}
                            </label>
                        },
                        {
                            name: <label>ARQ. FECHA REV.</label>,
                            selector: row => _REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.ph_date_arc : row.arc_date,
                            sortable: true,
                            filterable: true,
                            minWidth: '150px',
                            conditionalCellStyles: conditionalCellStylesARQ,
                            cellStyle: CellStylesARQ,
                            center: true,
                            omit: this.state.hide_arc,
                            cell: row => <label>{_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.ph_date_arc : row.arc_date}</label>
                        },
                        {
                name: <label>DIAS</label>,
                selector: row => dateParser_dateDiff(
                    !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.arc_date : row.ph_date_arc,
                    !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_ASIGN_DATE(row.asign_arc_date, 13, row) ? moment(_GET_ASIGN_DATE(row.asign_arc_date, 13, row)).isSameOrAfter(row.clock_date, 'day') >= 0 ? _GET_ASIGN_DATE(row.asign_arc_date, 13, row) : row.clock_date : row.clock_date : row.asign_ph_arc_date
                    , true),
                sortable: true,
                filterable: true,
                conditionalCellStyles: conditionalCellStylesARQ,
                cellStyle: CellStylesARQ,
                center: true,
                minWidth: '70px',
                omit: this.state.hide_arc,
                cell: row => {
                    let diff = dateParser_dateDiff(
                        !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.arc_date : row.ph_date_arc,
                        !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_ASIGN_DATE(row.asign_arc_date, 13, row) ? moment(_GET_ASIGN_DATE(row.asign_arc_date, 13, row)).isSameOrAfter(row.clock_date, 'day') >= 0 ? _GET_ASIGN_DATE(row.asign_arc_date, 13, row) : row.clock_date : row.clock_date : row.asign_ph_arc_date
                        , true)
                    return <>
                        <label> <label className={diff < 0 ? 'text-success fw-bold' : diff > (_fun_0_type_days[row.type] ?? 5) ? 'text-danger' : ''}>{diff} </label>
                            / {_fun_0_type_days[row.type] ?? 5}
                            {ci(row)}</label>

                    </>
                }
            },
           
            {
                name: <label>ARQ. PROF. ASIG.</label>,
                selector: row => !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.asign_arc_worker_name : row.asign_ph_arc_worker_name,
                sortable: true,
                filterable: true,
                minWidth: '200px',
                conditionalCellStyles: conditionalCellStylesARQ,
                cellStyle: CellStylesARQ,
                center: true,
                omit: this.state.hide_arc,
                cell: row => this.state['asign_arc_' + row.id]
                    ? <>{_WORKERS_SELECT(
                        !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.asign_arc_worker_id : row.sign_ph_arc_worker_id,
                        !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.arc_id : row.ph_id,
                        !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? 'arc' : 'pha',
                        row, [2, 6]
                    )}</>
                    : <label>{!_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.asign_arc_worker_name : row.asign_ph_arc_worker_name}</label>
            },
  */
            {
                name: <label>ARQ. REVISION</label>,
                selector: row => _REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_REVIEW(row.ph_review) : _GET_REVIEW(row.arc_review),
                sortable: true,
                filterable: true,
                minWidth: '130px',
                conditionalCellStyles: conditionalCellStylesARQ,
                cellStyle: CellStylesARQ,
                center: true,
                omit: this.state.hide_arc,
                cvsCB: row => _REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_REVIEW(row.ph_review, false, false, true) : _GET_REVIEW(row.arc_review, row.clock_review_arc_c, row.clock_asign_arc, true),
                cell: row => <label>{_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? _GET_REVIEW(row.ph_review) : _GET_REVIEW(row.arc_review, row.clock_review_arc_c, row.clock_asign_arc)}</label>
            },

            /** 

        {
            name: <label>ASIGNAR</label>,
            omit: this.state.hide_ing && !(window.user.id == 1 || window.user.roleId == 3),
            conditionalCellStyles: conditionalCellStylesENG,
            cellStyle: CellStylesENG,
            center: true,
            minWidth: '70px',
            cell: row => !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? <div class="form-check">
                <input class="form-check-input" type="checkbox" defaultChecked={this.state['asign_eng_' + row.id]} onChange={(e) => this.setState({ ['asign_eng_' + row.id]: e.target.checked })} />
            </div> : ""
        },
        {
            name: <label>#</label>,
            omit: this.state.hide_ing,
            conditionalCellStyles: conditionalCellStylesENG,
            cellStyle: CellStylesENG,
            minWidth: '70px',
            cell: row => <label>{!_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.clock_asign_eng ? row.clock_asign_eng.split(';').length : row.eng_version : ""}</label>
        },
      
        {
            name: <label>EST. FECHA ASIG.</label>,
            selector: row => _GET_ASIGN_DATE(row.asign_eng_date, 12, row),
            sortable: true,
            filterable: true,
            minWidth: '200px',
            conditionalCellStyles: conditionalCellStylesENG,
            cellStyle: CellStylesENG,
            center: true,
            omit: this.state.hide_ing,
            cell: row => <label>{_GET_ASIGN_DATE(row.asign_eng_date, 12, row)}</label>
        },
        {
            name: <label>EST. FECHA MAX.</label>,
            selector: row => dateParser_finalDate(_GET_ASIGN_DATE(row.asign_eng_date, 12, row), _fun_0_type_days[row.type] ?? 5),
            sortable: true,
            filterable: true,
            minWidth: '200px',
            conditionalCellStyles: conditionalCellStylesENG,
            cellStyle: CellStylesENG,
            center: true,
            omit: this.state.hide_ing,
            cell: row => !_REGEX_MATCH_PH(_PARSE_FUN_1(row))
                ? <label>{
                    _GET_ASIGN_DATE(row.asign_eng_date, 12, row)
                        ? dateParser_finalDate(moment(_GET_ASIGN_DATE(row.asign_eng_date, 12, row)).isSameOrAfter(row.clock_date, 'day') >= 0 ? _GET_ASIGN_DATE(row.asign_eng_date, 12, row) : row.clock_date, _fun_0_type_days[row.type] ?? 5)
                        : dateParser_finalDate(row.clock_date, _fun_0_type_days[row.type] ?? 5)
                }
                    {_GET_ASIGN_DATE(row.asign_eng_date, 12, row) && !_fun_0_type_days[row.type] ? <label className='fw-bold text-danger'>?</label> : ''}</label>
                : ''
        },
        {
            name: <label>EST. FECHA REV.</label>,
            selector: 'eng_date',
            sortable: true,
            filterable: true,
            minWidth: '150px',
            conditionalCellStyles: conditionalCellStylesENG,
            cellStyle: CellStylesENG,
            center: true,
            omit: this.state.hide_ing,
            cell: row => <label>{!_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? row.eng_date : ""}</label>
        },
        {
                name: <label>DIAS</label>,
                selector: row => dateParser_dateDiff(row.eng_date, _GET_ASIGN_DATE(row.asign_eng_date, 12, row), true),
                sortable: true,
                filterable: true,
                conditionalCellStyles: conditionalCellStylesENG,
                cellStyle: CellStylesENG,
                center: true,
                minWidth: '70px',
                omit: this.state.hide_ing,
                cell: row => {
                    if (!_REGEX_MATCH_PH(_PARSE_FUN_1(row))) {
                        let diff = dateParser_dateDiff(row.eng_date, _GET_ASIGN_DATE(row.asign_eng_date, 12, row), true)
                        return <label>{
                        } <lalbel className={diff < 0 ? 'text-success fw-bold' : diff > (_fun_0_type_days[row.type] ?? 5) ? 'text-danger' : ''}>{diff}</lalbel>
                            / {_fun_0_type_days[row.type] ?? 5}
                            {ci(row)}
                        </label>
                    } else return ""
                }
            },

            {
                name: <label>EST. PROF. ASIG.</label>,
                selector: 'asign_eng_worker_name',
                sortable: true,
                filterable: true,
                minWidth: '200px',
                conditionalCellStyles: conditionalCellStylesENG,
                cellStyle: CellStylesENG,
                center: true,
                omit: this.state.hide_ing,
                cell: row => this.state['asign_eng_' + row.id]
                    ? <>{!_REGEX_MATCH_PH(_PARSE_FUN_1(row))
                        ? <>{_WORKERS_SELECT(
                            row.asign_eng_worker_id,
                            row.end_id,
                            'eng',
                            row, [4]
                        )} </>
                        : ""}
                    </>
                    : <label>{row.asign_eng_worker_name}</label>
            },
*/
            {
                name: <label>EST. REVISION</label>,
                selector: '',
                sortable: true,
                filterable: true,
                minWidth: '150px',
                conditionalCellStyles: conditionalCellStylesENG,
                cellStyle: CellStylesENG,
                center: true,
                omit: this.state.hide_ing,
                cvsCB: row => !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ? GET_REVIEW_ENG([row.eng_review, row.eng_review_2], row.clock_review_eng_c, row.clock_asign_eng, true) : 'NA',
                cell: row => !_REGEX_MATCH_PH(_PARSE_FUN_1(row)) ?
                    <label>{GET_REVIEW_ENG([row.eng_review, row.eng_review_2], row.clock_review_eng_c, row.clock_asign_eng)}</label>
                    : ""
            },


            {
                name: <label className="text-center text-primary fw-bold">FECHA ACTA P.1</label>,
                selector: 'clock_record_p1',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '120px',
                cell: row => <label className="text-primary fw-bold">{row.clock_record_p1}</label>
            },
            {
                name: <label>ACTA P.1 REV.</label>,
                selector: 'rec_review',
                sortable: true,
                filterable: true,
                center: true,
                cvsCB: row => _GET_REVIEW_RECORD(row.rec_review, true),
                cell: row => <label>{_GET_REVIEW_RECORD(row.rec_review)}</label>
            },
            /*{
                name: <label className="text-center">¿REQ. CORRECIONES?</label>,
                selector: 'rec_review',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.rec_review == 0 ? <label className="fw-bold text-danger">SI</label> : row.rec_review == 1 ? <label className="fw-bold text-success">NO</label> : ""}</label>
            },*/
            {
                name: <label className="text-center">FECHA NOTIFICACIÓN</label>,
                selector: row => row.clock_not_1 || row.clock_not_2 || '',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '130px',
                cell: row => <label>{row.clock_not_1 || row.clock_not_2 || ''}</label>
            },
            {
                name: <label className="text-center">FECHA LIMITE ENTREGA</label>,
                selector: row => dateParser_finalDate(row.clock_not_1 || row.clock_not_2 || false, 30),
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{dateParser_finalDate(row.clock_not_1 || row.clock_not_2 || false, 30)}</label>
            },
            {
                name: <label className="text-center">FECHA LIMITE + PRÓRROGA</label>,
                selector: row => dateParser_finalDate(row.clock_not_1 || row.clock_not_2 || false, 45),
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{dateParser_finalDate(row.clock_not_1 || row.clock_not_2 || false, 45)}</label>
            },
            {
                name: <label className="text-center">FECHA ENTREGA CORRECIONES</label>,
                selector: 'clock_corrections',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.clock_corrections}</label>
            },
            {
                name: <label className="text-center text-primary fw-bold">FECHA ACTA P.2</label>,
                selector: 'clock_record_p2',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '120px',
                cell: row => <label className="text-primary fw-bold">{row.clock_record_p2}</label>
            },
            {
                name: <label>ACTA P.2 REV.</label>,
                selector: 'rec_review_2',
                sortable: true,
                filterable: true,
                center: true,
                cvsCB: row => _GET_REVIEW_RECORD(row.rec_review_2, true),
                cell: row => <label>{_GET_REVIEW_RECORD(row.rec_review_2)}</label>
            },
            {
                name: <label className="text-center">CARTA VIABILIDAD</label>,
                selector: 'clock_pay2',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '120px',
                cell: row => <label>{row.clock_pay2}</label>
            },
            {
                name: <label className="text-center">RESOLUCIÓN LIMITE</label>,
                selector: row => dateParser_finalDate(row.clock_pay_69 ?? false, 5),
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '120px',
                cell: row => <label>{dateParser_finalDate(row.clock_pay_69 ?? false, 5)}</label>
            },
            {
                name: <label className="text-center">RESOLUCIÓN</label>,
                selector: 'clock_resolution',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '120px',
                cell: row => <label>{row.clock_pay_69}</label>
            },
            {
                name: <label className="text-center">LICENCIA LIMITE</label>,
                selector: row => dateParser_finalDate(row.clock_not_1_res || row.clock_not_2_res || false, 10),
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '120px',
                cell: row => <label>{dateParser_finalDate(row.clock_not_1_res || row.clock_not_2_res || false, 10)}</label>
            },
            {
                name: <label className="text-center fw-bold text-primary">FECHA LICENCIA</label>,
                selector: 'clock_license',
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '120px',
                cell: row => <label className='text-primary fw-bold'>{row.clock_license}</label>
            },
            {
                name: <label className="text-center fw-bold">CONSECUTIVO LICENCIA</label>,
                selector: 'exp_id',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label className='fw-bold'>{row.exp_id}</label>
            },
            {
                name: <label className="text-center fw-bold">ARCHIVO</label>,
                selector: 'clock_archive',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label className='fw-bold'>{row.clock_archive}</label>
            },
        ]
        const columns_negative = [
            {
                name: <label>No. RADICACION</label>,
                selector: 'id_public',
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{row.id_public}</label>
            },
            {
                name: <label>INFO</label>,
                button: true,
                ignoreCSV: true,
                cell: row => <MDBPopover size='sm' color='info' btnChildren={'MENU'} placement='right' dismiss>
                    {_MODULE_BTN_POP({ ...row, id: row.id_sistem })}
                </MDBPopover>
            },
            {
                name: <label>ACTUACION</label>,
                selector: row => _PARSE_FUN_1(row),
                sortable: true,
                filterable: true,
                minWidth: '300px',
                cvsCB: row => formsParser1(row, true),
                cell: row => <label>{row.usos == 'A' ? <u>{_PARSE_FUN_1(row)}</u> : _PARSE_FUN_1(row)}</label>
            },
            {
                name: <label>CAUSA DESISTIMIENTO</label>,
                selector: row => row.clock_cause,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{_GET_PROCESS_CONTEXT(row.clock_cause)}</label>
            },
            {
                name: <label>ESTADO ACTUAL</label>,
                selector: row => _GET_CURRENT_STEP(row),
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{_GET_CURRENT_STEP(row)}</label>
            },
            {
                name: <label>SIGUIENTE ESTADO</label>,
                selector: row => row.clock_5,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{_GET_NEXT_STEP_STRING(row)}</label>
            },
            {
                name: <label>FECHA LIMITE</label>,
                selector: row => _GET_TIME_FOR_NEGATIVE_PROCESS(row),
                sortable: true,
                filterable: true,
                cell: row => <label>{_GET_TIME_FOR_NEGATIVE_PROCESS(row)}</label>
            },
            {
                name: <label>TIEMPO RESTANTE</label>,
                selector: row => _GET_TIME_FOR_NEGATIVE_PROCESS(row),
                sortable: true,
                filterable: true,
                cell: row => <label>{_GET_TIME_FOR_NEGATIVE_PROCESS(row)
                    ? <label>{dateParser_timeLeft(_GET_TIME_FOR_NEGATIVE_PROCESS(row))} dias</label>
                    : ""}</label>
            },
            {
                name: <label>SUJETO</label>,
                minWidth: '150px',
                cvsCB: row => _GET_SUBJECT(row, true),
                cell: row => <label>{_GET_SUBJECT(row)}</label>
            },
            {
                name: <label>{defaultProcess['-5'].name}</label>,
                selector: row => row.clock_5,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_5)}</label>
            },
            {
                name: <label>{defaultProcess['-6'].name}</label>,
                selector: row => row.clock_6,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_6)}</label>
            },
            {
                name: <label>{defaultProcess['-7'].name}</label>,
                selector: row => row.clock_7,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_7)}</label>
            },
            {
                name: <label>{defaultProcess['-8'].name}</label>,
                selector: row => row.clock_8,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_8)}</label>
            },
            {
                name: <label>{defaultProcess['-10'].name}</label>,
                selector: row => row.clock_10,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_10)}</label>
            },
            {
                name: <label className="text-danger">{defaultProcess['-11'].name}</label>,
                selector: row => row.clock_11,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label className="text-danger">{dateParser(row.clock_11)}</label>
            },
            {
                name: <label>{defaultProcess['-17'].name}</label>,
                selector: row => row.clock_17,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_17)}</label>
            },
            {
                name: <label>{defaultProcess['-18'].name}</label>,
                selector: row => row.clock_18,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_18)}</label>
            },
            {
                name: <label className="text-danger">{defaultProcess['-19'].name}</label>,
                selector: row => row.clock_19,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label className="text-danger">{dateParser(row.clock_19)}</label>
            },
            {
                name: <label>{defaultProcess['-20'].name}</label>,
                selector: row => row.clock_20,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_20)}</label>
            },
            {
                name: <label>{defaultProcess['-21'].name}</label>,
                selector: row => row.clock_21,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_21)}</label>
            },
            {
                name: <label>{defaultProcess['-22'].name}</label>,
                selector: row => row.clock_22,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_22)}</label>
            },
            {
                name: <label className="text-success">{defaultProcess['-30'].name}</label>,
                selector: row => row.clock_30,
                sortable: true,
                filterable: true,
                minWidth: '150px',
                cell: row => <label>{dateParser(row.clock_30)}</label>
            },

        ]
        const handleFillClick = (state) => {
            if (state === this.state.fillActive) {
                return;
            }
            this.setState({ fillActive: state });
        };

        // DATA GETTER
        let _GET_WORKER_BY_ID = (_ID) => {
            let _workers = this.state.worker_list;
            for (var i = 0; i < _workers.length; i++) {
                if (_workers[i].id == _ID) return `${_workers[i].name} ${_workers[i].surname}`
            }
            return '';
        }
        //DATA CONVERTERS
        let _GET_REVIEW = (_REVIEW, _REVIEW_CLOCK, REVIEWS, _SIMPLE) => {
            let res = {
                '-1': <label className=" me-1"><i class="far fa-dot-circle" style={{ fontSize: '150%' }}></i></label>,
                '0': <label className="fw-bold text-danger me-1"><i class="far fa-times-circle" style={{ fontSize: '150%' }}></i></label>,
                '1': <label className="fw-bold text-success  me-1"><i class="far fa-check-circle" style={{ fontSize: '150%' }}></i></label>,
                '2': <label className="fw-bold text-warning  me-1"><i class="far fa-stop-circle" style={{ fontSize: '150%' }}></i></label>,
            }
            let res_simple = { '-1': '', '0': 'NO', '1': 'SI', '2': 'SI', }

            if (REVIEWS) {
                let asigns = REVIEWS.split(';');
                let reviews = _REVIEW_CLOCK ? _REVIEW_CLOCK.split(';') : [_REVIEW];
                return _SIMPLE ?
                    asigns.map((value, index) => {
                        if (index == 0) {
                            return res_simple[reviews[index]] ?? res_simple[_REVIEW] ?? res_simple['-1']
                        }
                        return res[res_simple[index]] ?? res_simple['-1']
                    }).join(' ')
                    : asigns.map((value, index) => {
                        if (index == 0) {
                            return res[reviews[index]] ?? res[_REVIEW] ?? res['-1']
                        }
                        return res[reviews[index]] ?? res['-1']
                    })
            } else return _SIMPLE ? res_simple[_REVIEW] ?? res_simple['-1'] : res[_REVIEW] ?? res['-1']
        }
        let _GET_REVIEW_RECORD = (_REVIEW, _SIMPLE) => {
            let res = {
                '-1': <label className=" me-1"><i class="far fa-dot-circle" style={{ fontSize: '150%' }}></i></label>,
                '0': <label className="fw-bold text-danger me-1"><i class="far fa-times-circle" style={{ fontSize: '150%' }}></i></label>,
                '1': <label className="fw-bold text-success  me-1"><i class="far fa-check-circle" style={{ fontSize: '150%' }}></i></label>,
                '2': <label className="fw-bold text-warning  me-1"><i class="far fa-stop-circle" style={{ fontSize: '150%' }}></i></label>,
            }
            let res_simple = { '-1': '', '0': 'NO', '1': 'SI', '2': 'SI', }
            return _SIMPLE ? res_simple[_REVIEW] ?? res_simple['-1'] : res[_REVIEW] ?? res['-1']
        }
        let GET_REVIEW_ENG = (_REVIEW, _REVIEW_CLOCK, REVIEWS, _SIMPLE) => {
            let revies = _REVIEW ?? [-1, -1]
            let res = {
                '-1': <label className=" me-1"><i class="far fa-dot-circle"></i></label>,
                '0': <label className="fw-bold text-danger  me-1"><i class="far fa-times-circle"></i></label>,
                '1': <label className="fw-bold text-success  me-1"><i class="far fa-check-circle"></i></label>,
                '2': <label className="fw-bold text-warning  me-1"><i class="far fa-stop-circle"></i></label>,
            }
            let res_simple = { '-1': '', '0': 'NO', '1': 'SI', '2': 'SI', }
            if (REVIEWS) {
                let asigns = REVIEWS.split(';');
                let reviews_c = _REVIEW_CLOCK ? _REVIEW_CLOCK.split(';') : [_REVIEW].join(',');
                if (_SIMPLE) return ['R1:', 'R2:'].map((value, index) => {
                    return `${value} ${asigns.map((value2, index2) => {
                        if (index2 == 0) {
                            if (_REVIEW != null) return res_simple[_REVIEW[index]] ?? res_simple['-1']
                        }
                        return res_simple[reviews_c[index2] ? reviews_c[index2].split(',')[index] : '-1'] ?? res_simple['-1']
                    }).join(' ')}
                `}).join(' | ')
                else return ['R1:', 'R2:'].map((value, index) =>
                    <>
                        <label>{value}
                            {asigns.map((value2, index2) => {
                                if (index2 == 0) {
                                    if (_REVIEW != null) return res[_REVIEW[index]] ?? res['-1']
                                }
                                return res[reviews_c[index2] ? reviews_c[index2].split(',')[index] : '-1'] ?? res['-1']
                            })}
                        </label><br />
                    </>)
            } else {
                if (_SIMPLE) return revies.map((value, index) => `R${index + 1}: ${res_simple[value] ?? res_simple['-1']}`).join(' | ')
                else return revies.map((value, index) => <><label>R{index + 1}: {res[value] ?? res['-1']}</label><br /></>)
            }

        }
        let _PARSE_FUN_1 = (_ITEM) => {
            var _CHILD_VARS = {
                tipo: _ITEM.tipo,
                tramite: _ITEM.tramite,
                m_urb: _ITEM.m_urb,
                m_sub: _ITEM.m_sub,
                m_lic: _ITEM.m_lic,
            }
            return formsParser1(_CHILD_VARS)

        }
        let _REGEX_MATCH_PH = (_string) => {
            let regex0 = /p\.\s+h/i;
            let regex1 = /p\.h/i;
            let regex2 = /PROPIEDAD\s+HORIZONTAL/i;
            let regex3 = /p\s+h/i;
            if (regex0.test(_string) || regex2.test(_string) || regex1.test(_string) || regex3.test(_string)) return true;
            return false
        }
        let _GET_PROCESS_CONTEXT = (state) => {
            if (!state) return ""
            if (state == '-1') return "DECLARADO INCOMPLETO"
            if (state == '-2') return "NO CUMPLE ACTA DE OBSERVACIONES"
            if (state == '-3') return "NO CUMPLE ACTA DE CORRECCIONES"
            if (state == '-4') return "NO PAGO EXPENSAS"
            if (state == '-5') return "VOLUNTARIO"
            if (state == '-6') return "NEGADA"
            return "SIN DEFINIR"
        }
        let _GET_CURRENT_STEP = (row) => {
            let currentState = "";
            for (var i = 0; i < statesToCheck.length; i++) {
                if (row[statesToCheck[i]]) currentState = defaultProcess[stepsToCheck[i]].name
            }
            return currentState
        }
        let _GET_NEXT_STEP = (row) => {
            let nextState = [];
            let currentState = -5;
            for (var i = 0; i < statesToCheck.length; i++) {
                if (row[statesToCheck[i]]) currentState = stepsToCheck[i]
            }
            if (currentState == -5) {
                nextState = ['-6']
            }
            if (currentState == -6) {
                nextState = ['-7', '-8']
            }
            if (currentState == -7 || currentState == -8) {
                nextState = ['-10', '-11']
            }
            if (currentState == -10) {
                nextState = ['-17']
            }
            if (currentState == -11) {
                nextState = ['-30']
            }
            if (currentState == -17) {
                nextState = ['-18', '-19']
            }
            if (currentState == -18) {
                nextState = ['-20']
            }
            if (currentState == -19) {
                nextState = ['-30']
            }
            if (currentState == -20) {
                nextState = ['-21']
            }
            if (currentState == -21) {
                nextState = ['-22', '-30']
            }
            if (currentState == -22) {
                nextState = ['-30']
            }
            return nextState;
        }
        let _GET_NEXT_STEP_STRING = (row) => {
            let nextStepString = [];
            let nextState = _GET_NEXT_STEP(row);
            for (var i = 0; i < nextState.length; i++) {
                nextStepString.push(defaultProcess[nextState[i]].name)
            }
            return nextStepString.join(' ó ')
        }
        let _SHOW_NEGATIVE = (value) => {
            if (value) this.setState({ data_negative: this.state.data_negative_full })
            else this.setState({ data_negative: this.state.data_negative_simple })
        }
        let _GET_TIME_FOR_NEGATIVE_PROCESS = (row) => {
            let time = 0
            let date = false;
            let nextState = _GET_NEXT_STEP(row)
            if (nextState.includes('-5') || nextState.includes('-6')) {
                return row.clock_5;
            }
            if (nextState.includes('-7') || nextState.includes('-8')) {
                date = row.clock_5;
                time = 5;
            }
            if (nextState.includes('-10') || nextState.includes('-11')) {
                date = row.clock_7;
                if (!date) date = row.clock_8;
                time = 10;
                if (!date) {
                    date = row.clock_5;
                    time = 15;
                }
            }
            if (nextState.includes('-17') || nextState.includes('-18') || nextState.includes('-19') || nextState.includes('-20')) {
                date = row.clock_10;
                time = 45;
                if (!date) {
                    date = row.clock_5;
                    time = 60;
                }
            }
            if (nextState.includes('-21') || nextState.includes('-22')) {
                date = row.clock_20;
                time = 5
                if (!date) {
                    date = row.clock_5;
                    time = 65;
                }
            }
            if (nextState.includes('-30')) return ""

            return dateParser_finalDate(date, time)
        }
        let _GET_SUBJECT = (row, isString) => {
            let _state = -5;
            let _SUBJECT_0 = <label className="text-danger fw-bold">CURADURIA</label>
            let _SUBJECT_1 = <label className="text-success fw-bold">SOLICITANTE</label>
            if (isString) {
                _SUBJECT_0 = "CURADURIA"
                _SUBJECT_1 = "SOLICITANTE"
            }
            for (var i = 0; i < statesToCheck.length; i++) {
                if (row[statesToCheck[i]]) _state = stepsToCheck[i]
            }
            if (_state == '-5' || _state == '-6') {
                return _SUBJECT_0
            }
            if (_state == '-7' || _state == '-8') {
                return _SUBJECT_1
            }
            if (_state == '-10' || _state == '-11') {
                return _SUBJECT_1
            }
            if (_state == '-17' || _state == '-18' || _state == '-19' || _state == '-20') {
                return _SUBJECT_0
            }
            if (_state == '-22' || _state == '-21') {
                return _SUBJECT_1
            }
            if (_state == '-30') return ""
            return ""
        }


        let _MODULE_BTN_POP = (row) => {
            const isOA = regexChecker_isOA_2(row);
            let rules = row.rules ? row.rules.split(';') : [];
            return <MDBPopoverBody>
                <div class="list-group list-group-flush">
                    <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'general', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-folder-open text-info" ></i> DETALLES</button>
                    <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'clock', 'macro')} class="list-group-item list-group-item-action p-1 m-0 " ><i class="far fa-clock text-secondary" ></i> TIEMPOS</button>
                    <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'archive', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-archive text-secondary" ></i> DOCUMENTOS</button>
                    {row.state != 101 && row.state <= 200 ?
                        <>
                            <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'edit', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-folder-open text-secondary" ></i> ACTUALIZAR</button>
                            <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'check', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-check-square text-warning" ></i> CHECKEO</button>
                            {regexChecker_isPh(row, true) ?
                                <>
                                    <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'record_ph', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-pencil-ruler text-warning" ></i>  INF. P.H.</button>
                                    <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'expedition', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-file-alt text-warning" ></i> EXPEDICION</button>
                                </>
                                :
                                <>
                                    {!isOA && rules[0] != 1 ? <>
                                        <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'alert', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-sign text-warning" ></i>  PUBLICIDAD</button>
                                    </> : ''}
                                    <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'record_law', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-balance-scale text-warning" ></i> INF. JURIDICO</button>
                                    {!isOA ? <>
                                        <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'record_arc', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-building text-warning" ></i> INF. ARQUITECTONICO</button>
                                        {rules[1] != 1 ? <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'record_eng', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-cogs text-warning" ></i> INF. ESTRUCTURAL</button> : ''}
                                        <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'record_review', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-file-contract text-warning" ></i> ACTA</button>
                                    </> : ''}
                                    <button type="button" onClick={() => this.props.NAVIGATION_GEN(row, 'expedition', 'macro')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-file-alt text-warning" ></i> EXPEDICION</button>
                                </>}
                        </> : <></>}
                </div>
            </MDBPopoverBody>
        }
        // COMPONENT JSX
        let _COMPONENT_CHARTS = () => {
            return <div>
                <div className="row my-1">
                    <div className="col text-center">
                        <label className="app-p fw-bold text-uppercase"> GRAFICAS DE SOLICITUDES ({this.state.data_macro_filter.length})</label>
                    </div>
                </div>

                <Collapsible className="bg-info py-0 my-1" trigger={<MDBBtn tag='a' size='sm' outline color={'info'} className={'my-1 py-0 text-uppercase bg-light'}>
                    <label className="fw-normal text-muted my-0 py-0" >
                        <i class="far fa-chart-bar"></i> GRAFICAS GENERALES
                    </label>
                </MDBBtn>}>
                    <div>
                        <div className="row">
                            <div className="col-4">
                                <FUN_CHART_STATE
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    items={this.state.data_macro_filter}
                                    _UPDATE_FILTERS={this._UPDATE_FILTERS} />
                            </div>
                            <div className="col-4">
                                <FUN_CHART_TYPE
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    items={this.state.data_macro_filter}
                                    _UPDATE_FILTERS={this._UPDATE_FILTERS} />
                            </div>
                            <div className="col-4">
                                <FUN_CHART_CATEGORY
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    items={this.state.data_macro_filter}
                                    _UPDATE_FILTERS={this._UPDATE_FILTERS} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <FUN_CHART_TYPE2
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    itemsOA={this.state.data_oa}
                                    itemsNegative={this.state.data_negative_simple}
                                    itemsNegativeFull={this.state.data_negative_full}
                                    items={this.state.data_macro_filter}
                                    _UPDATE_FILTERS={this._UPDATE_FILTERS} />
                            </div>
                        </div>
                    </div>
                </Collapsible>

                <Collapsible className="bg-info py-0 my-1" trigger={<MDBBtn tag='a' size='sm' outline color={'info'} className={'my-1 py-0 text-uppercase bg-light'}>
                    <label className="fw-normal text-muted my-0 py-0" >
                        <i class="far fa-chart-bar"></i> GRAFICA DE ASIGNACION
                    </label>
                </MDBBtn>}>
                    <div>
                        <div className="row">
                            {/**
                         * 
                         * <FUN_CHART_WORKER_REPORT
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            items={this.state.data_macro_filter} workers={this.state.worker_list}
                            _UPDATE_FILTERS={this._UPDATE_FILTERS} />
                         * 
                         */
                            }

                            <div className="col">
                                <FUN_CHART_WORKER
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    items={this.state.data_macro_filter} workers={this.state.worker_list}
                                    _UPDATE_FILTERS={this._UPDATE_FILTERS} />
                            </div>
                        </div>
                    </div>
                </Collapsible>

                <Collapsible className="bg-info py-0 my-1" trigger={<MDBBtn tag='a' size='sm' outline color={'info'} className={'my-1 py-0 text-uppercase bg-light'}>
                    <label className="fw-normal text-muted my-0 py-0" >
                        <i class="far fa-chart-bar"></i> GRAFICAS DE EVALUACION
                    </label>
                </MDBBtn>}>
                    <div>
                        <div className="row">
                            <div className="col-4">

                                <FUN_CHART_PAYMENT_1
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    items={this.state.data_macro_filter}
                                    _UPDATE_FILTERS={this._UPDATE_FILTERS} />
                            </div>
                            <div className="col-4">

                                <FUN_CHART_LAW_R
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    items={this.state.data_macro_filter}
                                    _UPDATE_FILTERS={this._UPDATE_FILTERS} />

                                <FUN_CHART_NEGATIVE
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    items={this.state.data_macro_filter}
                                    itemsNegative={this.state.data_negative}
                                    _UPDATE_FILTERS={this._UPDATE_FILTERS} />
                            </div>
                            <div className="col-4">

                                <FUN_CHART_RECORD_1
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    items={this.state.data_macro_filter}
                                    _UPDATE_FILTERS={this._UPDATE_FILTERS} />
                            </div>
                        </div>
                    </div>
                </Collapsible>

                <Collapsible className="bg-info py-0 my-1" trigger={<MDBBtn tag='a' size='sm' outline color={'info'} className={'my-1 py-0 text-uppercase bg-light'}>
                    <label className="fw-normal text-muted my-0 py-0" >
                        <i class="far fa-chart-bar"></i> GRAFICA DE LICENCIAS EXPEDIDAS
                    </label>
                </MDBBtn>}>
                    <div>
                        <div className="row">
                            <FUN_CHART_TIME
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                items={this.state.data_include}
                                _UPDATE_FILTERS_IDPUBIC={this._UPDATE_FILTERS_IDPUBIC} />
                        </div>
                    </div>
                </Collapsible>
            </div>
        }

        let _COMPONENT_FILTER = () => {
            return <>

                <div className="row">
                    <ReactTagInput
                        tags={this.state.tags}
                        onChange={(newTags) => this._FILTER_LIST(newTags)}
                        placeholder="Filtros de lista..."
                        removeOnBackspace={true}
                    />
                </div>
                <div className="row">
                    <div class="input-group my-1">
                        <div class="input-group-text" style={{ backgroundColor: "lightGray" }}>
                            <label>{`Numero de Solicitudes Filtradas: ${this.state.data_macro_filter.length}`} </label>
                        </div>
                        <div class="input-group-prepend">
                            <button className="btn btn-secondary" onClick={() => this._FILTER_LIST([])}><i class="far fa-window-close"></i> LIMPIAR FILTROS</button>
                        </div>
                        <FUN_MACROTABLE_FILTERLIST idRef={'btn-filter'} setValues={(newTags) => this._UPDATE_FILTERS(newTags)} text={'LISTA DE FILTROS'} />
                        <div class="input-group-prepend">
                            <MDBBtn color='secondary' outline={this.state.includeEx} onClick={(e) => this.changeList(!this.state.includeEx)}><i class="fas fa-database"></i> {this.state.includeEx ? 'EXCLUIR' : 'INCLUIR'} EXPEDIDAS</MDBBtn>
                        </div>
                    </div>
                </div>
            </>
        }
        let _PRIORITY_POP = (row) => {
            return <MDBPopoverBody>
                <MDBPopoverHeader>INDICE DE PRIORIDAD - {row.id_public}</MDBPopoverHeader>
                <div>
                    <div class="row border p-1"><label>ACTAS:  {_GET_REVIEW_RECORD(row.rec_review)} {_GET_REVIEW_RECORD(row.rec_review_2)}</label></div>
                    <div class="row border p-1"><label>Estado: {_fun_0_state(row.state, true, row)}</label></div>
                    <div class="row border p-1"><label>Categoria: {_fun_0_type[row.type]}</label></div>
                    <div class="row border p-1"><label>Formula F(x) = c1 + (c2 - c3) + c4 + c5 + c6</label></div>
                    <div class="row border p-1"><label>Limite de F(x) tiende a -INF</label></div>
                    <div class="row border p-1">
                        <div class="row p-1"><label> c1 :<label className='fw-bold'>{row.constants[0]} </label>  (LDF o INC)</label></div>
                        <div class="row p-1"><label> c2 :<label className='fw-bold'>{row.constants[1]} </label>  (Tiempo de Categoia)</label></div>
                        <div class="row p-1"><label> c3 :<label className={`fw-bold ${row.constants[3] > row.constants[1] ? 'text-danger' : ''}`}>{row.constants[3]} </label>  (Tiempo usado para revision)</label></div>
                        <div class="row p-1"><label> c4 : <label className={`fw-bold ${row.constants[2] < 0 ? 'text-danger' : ''}`}>{row.constants[2]} </label> (Tiempo restante de correccion)</label></div>
                        <div class="row p-1"><label> c5 : <label className='fw-bold'>{row.constants[4]} </label> (Tiempo de entrada de ultimo documento)</label></div>
                        <div class="row p-1"><label> c6 : <label className='fw-bold'>{row.constants[5]} </label> (Inidice de asignacion)</label></div>
                    </div>
                    <div class="row border p-1"><label className='fw-bold'>{row.constants[0]} + ( {row.constants[1]}  -  {row.constants[3]}) + {row.constants[2]} +  {row.constants[4]} +  {row.constants[5]}  = {row.priority_index}</label></div>
                </div>
            </MDBPopoverBody>
        }

        // APIS & FUNCTIONS
        var formData = new FormData();

        let _GET_OLDEST_DATE = (DATES, inTime) => {
            let dates = DATES ? DATES.split(';') : [];
            let oldestDate = moment();
            dates.forEach((element) => {
                if (!moment(element).isSameOrAfter(oldestDate)) {
                    oldestDate = element;
                }
            });
            if (inTime) return dateParser_timePassed(moment(oldestDate).format('YYYY-MM-DD'))
            else return oldestDate;

        }
        let generateCVS = (_data, _name) => {
            var rows = [];
            let extraColumns = [
                {
                    name: <label>JUR. ASIGN OVBSERVACIONES</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_asign_law ? row.clock_asign_law.split(';')[0] : false
                            return date || row.asign_law_date || '';
                        }

                    },
                },
                {
                    name: <label>JUR. ASIGN TEC. 1</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_asign_law ? row.clock_asign_law.split(';')[1] : false
                            return date || '';
                        }

                    },
                },
                {
                    name: <label>JUR. ASIGN TEC. 2</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_asign_law ? row.clock_asign_law.split(';')[2] : false
                            return date || '';
                        }

                    },
                },
                {
                    name: <label>JUR. ASIGN COREECIONES</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return row.asign_ph_law_date || '';
                        else {
                            let date = row.clock_asign_law ? row.clock_asign_law.split(';')[3] : false
                            return date || '';
                        }

                    },
                },
                {
                    name: <label>JUR. REVISION OVBSERVACIONES</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_review_law ? row.clock_review_law.split(';')[0] : false
                            return date || row.jur_date || '';
                        }

                    },
                },
                {
                    name: <label>JUR. REVISION TEC. 1</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_review_law ? row.clock_review_law.split(';')[1] : false
                            return date || '';
                        }

                    },
                },
                {
                    name: <label>JUR. REVISION TEC. 2</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_review_law ? row.clock_review_law.split(';')[2] : false
                            return date || '';
                        }

                    },
                },
                {
                    name: <label>JUR. REVISION COREECIONES</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return row.ph_date_law || '';
                        else {
                            let date = row.clock_review_law ? row.clock_review_law.split(';')[3] : false
                            return date || '';
                        }

                    },
                },


                {
                    name: <label>ARQ. ASIGN OVBSERVACIONES</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_asign_arc ? row.clock_asign_arc.split(';')[0] : false
                            return date || row.asign_arc_date || '';
                        }

                    },
                },
                {
                    name: <label>ARQ. ASIGN TEC. 1</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_asign_arc ? row.clock_asign_arc.split(';')[1] : false
                            return date || '';
                        }

                    },
                },
                {
                    name: <label>ARQ. ASIGN TEC. 2</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_asign_arc ? row.clock_asign_arc.split(';')[2] : false
                            return date || '';
                        }

                    },
                },
                {
                    name: <label>ARQ. ASIGN COREECIONES</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return row.ph_date_arc || '';
                        else {
                            let date = row.clock_asign_arc ? row.clock_asign_arc.split(';')[3] : false
                            return date || '';
                        }

                    },
                },
                {
                    name: <label>ARQ. REVISION OVBSERVACIONES</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_review_arc ? row.clock_review_arc.split(';')[0] : false
                            return date || row.arc_date || '';
                        }

                    },
                },
                {
                    name: <label>ARQ. REVISION TEC. 1</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_review_arc ? row.clock_review_arc.split(';')[1] : false
                            return date || '';
                        }

                    },
                },
                {
                    name: <label>ARQ. REVISION TEC. 2</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return '';
                        else {
                            let date = row.clock_review_arc ? row.clock_review_arc.split(';')[2] : false
                            return date || '';
                        }

                    },
                },
                {
                    name: <label>ARQ. REVISION COREECIONES</label>,
                    cvsCB: row => {
                        let isPH = regexChecker_isPh(row);
                        if (isPH) return row.ph_date_arc || '';
                        else {
                            let date = row.clock_review_arc ? row.clock_review_arc.split(';')[3] : false
                            return date || '';
                        }

                    },
                },

                {
                    name: <label>EST. ASIGN OVBSERVACIONES</label>,
                    cvsCB: row => {
                        let date = row.clock_asign_eng ? row.clock_asign_eng.split(';')[0] : false
                        return date || row.asign_eng_date || '';
                    },
                },
                {
                    name: <label>EST. ASIGN TEC. 1</label>,
                    cvsCB: row => {
                        let date = row.clock_asign_eng ? row.clock_asign_eng.split(';')[1] : false
                        return date || '';
                    },
                },
                {
                    name: <label>EST. ASIGN TEC. 2</label>,
                    cvsCB: row => {
                        let date = row.clock_asign_eng ? row.clock_asign_eng.split(';')[2] : false
                        return date || '';
                    },
                },
                {
                    name: <label>EST. ASIGN COREECIONES</label>,
                    cvsCB: row => {
                        let date = row.clock_asign_arc ? row.clock_asign_arc.split(';')[3] : false
                        return date || '';

                    },
                },
                {
                    name: <label>EST. REVISION OVBSERVACIONES</label>,
                    cvsCB: row => {
                        let date = row.clock_review_eng ? row.clock_review_eng.split(';')[0] : false
                        return date || row.eng_date || '';
                    },
                },
                {
                    name: <label>EST. REVISION TEC. 1</label>,
                    cvsCB: row => {
                        let date = row.clock_review_eng ? row.clock_review_eng.split(';')[1] : false
                        return date || '';
                    },
                },
                {
                    name: <label>EST. REVISION TEC. 2</label>,
                    cvsCB: row => {
                        let date = row.clock_review_eng ? row.clock_review_eng.split(';')[2] : false
                        return date || '';
                    },
                },
                {
                    name: <label>EST. REVISION COREECIONES</label>,
                    cvsCB: row => {
                        let date = row.clock_review_eng ? row.clock_review_eng.split(';')[3] : false
                        return date || '';
                    },
                },
                {
                    name: <label>DIRECCION PREDIO</label>,
                    cvsCB: row => {
                        return row.direccion ?? ''
                    },
                },
                {
                    name: <label>MATRICULA PREDIO</label>,
                    cvsCB: row => {
                        return row.matricula ?? ''
                    },
                },
                {
                    name: <label>PREDIAL PREDIO</label>,
                    cvsCB: row => {
                        return row.catastral ?? row.catastral_2 ?? ''
                    },
                },
                {
                    name: <label>RESPONSABLE NOMBRE</label>,
                    cvsCB: row => {
                        return (row.fun_53s_name ?? '') + (row.fun_53s_surname ?? '')
                    },
                },
                {
                    name: <label>RESPONSABLE IDENTIFICACIÓN</label>,
                    cvsCB: row => {
                        return (row.fun_53s_id_number ?? '')
                    },
                },
                {
                    name: <label>RESPONSABLE CALIDAD</label>,
                    cvsCB: row => {
                        return (row.fun_53s_role ?? '')
                    },
                },
            ]

            let _columns = [...columns, ...extraColumns]
            const headRows = _columns.filter(c => c.ignoreCSV == undefined).map(c => { return c.name.props.children })
            rows = _data.map(d =>
                _columns.filter(c => c.ignoreCSV == undefined).map(c => {
                    if (c.cvsCB) return (String(c.cvsCB(d) ?? '')).replace(/[\n\r]+ */g, ' ')
                    else return (String(c.cell(d).props.children ?? '')).replace(/[\n\r]+ */g, ' ')
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
        let generateCVSNegative = (_data, _name) => {
            var rows = [];
            let _columns = [...columns_negative]
            const headRows = _columns.filter(c => c.ignoreCSV == undefined).map(c => { return c.name.props.children })
            rows = _data.map(d =>
                _columns.filter(c => c.ignoreCSV == undefined).map(c => {
                    if (c.cvsCB) return (String(c.cvsCB(d) ?? '')).replace(/[\n\r]+ */g, ' ')
                    else return (String(c.cell(d).props.children ?? '')).replace(/[\n\r]+ */g, ' ')
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
            <div className="py-3 container-macro-table">

                {_COMPONENT_CHARTS()}
                {_COMPONENT_FILTER()}

                <MDBTabs fill className='m-0 border' pills>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleFillClick('1')} active={this.state.fillActive === '1'}>
                            <label className="upper-case">GENERAL ({this.state.data_macro_filter.length})</label>
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleFillClick('2')} active={this.state.fillActive === '2'}>
                            <label className="upper-case">OTRAS ACTUACIONES ({this.state.data_oa.length})</label>
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleFillClick('-1')} active={this.state.fillActive === '-1'}>
                            <label className="upper-case text-danger">DESISTIMIENTOS ({this.state.data_negative.length})</label>
                        </MDBTabsLink>
                    </MDBTabsItem>

                </MDBTabs>

                <MDBTabsContent>

                    <MDBTabsPane show={this.state.fillActive === '1'}>
                        <div className="row">

                            <DataTable
                                conditionalRowStyles={rowSelectedStyle}
                                noDataComponent={<h4 className="fw-bold">NO HAY INFORMACION</h4>}
                                striped="true"
                                columns={columns}
                                data={(this.state.data_macro_filter)}
                                highlightOnHover
                                pagination
                                paginationPerPage={30}
                                paginationRowsPerPageOptions={[30, 60, 120]}
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                className="data-table-component"
                                title={
                                    <div class="d-flex justify-content-between">
                                        <div><h5>LICENCIAS URBANISTICAS</h5></div>
                                        <div><MDBBtn outline color='success' size="sm" onClick={() => { generateCVS(this.state.data_macro_filter) }}
                                        ><i class="fas fa-file-csv"></i> DESCARGAR CSV</MDBBtn></div>
                                    </div>
                                }
                                dense

                                progressPending={!load}
                                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                                fixedHeader
                                fixedHeaderScrollHeight="700px"
                                //selectableRows
                                //actions={actionsMemo}
                                expandableRows={(window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 2)}
                                expandableRowsComponent={ExpandedComponent}
                                //expandableRowDisabled={row => row.disabled}
                                defaultSortFieldId={1}
                                defaultSortAsc={false}
                                onRowClicked={(e) => this.props.setSelectedRow(e.id)}
                            //onRowDoubleClicked={(row, event) => console.log(row, event)}
                            />

                        </div>
                    </MDBTabsPane>

                    <MDBTabsPane show={this.state.fillActive === '2'}>
                        <div className="row">

                            <DataTable
                                conditionalRowStyles={rowSelectedStyle}
                                noDataComponent={<h4 className="fw-bold">NO HAY INFORMACION</h4>}
                                striped="true"
                                columns={columns}
                                data={this.state.data_oa}
                                highlightOnHover
                                pagination
                                paginationPerPage={30}
                                paginationRowsPerPageOptions={[30, 60, 120]}
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                className="data-table-component"
                                dense
                                title={
                                    <div class="d-flex justify-content-between">
                                        <div><h5>OTRAS ACTUACIONES</h5></div>
                                        <div><MDBBtn outline color='success' size="sm" onClick={() => { generateCVS(this.state.data_oa, "OTRAS ACTUACIONES") }}
                                        ><i class="fas fa-file-csv"></i> DESCARGAR CSV</MDBBtn></div>
                                    </div>
                                }
                                progressPending={!load}
                                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                                fixedHeader
                                fixedHeaderScrollHeight="700px"
                                //selectableRows
                                //actions={actionsMemo}
                                expandableRows={(window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 2)}
                                expandableRowsComponent={ExpandedComponent}
                                //expandableRowDisabled={row => row.disabled}
                                defaultSortFieldId={1}
                                defaultSortAsc={false}
                                onRowClicked={(e) => this.props.setSelectedRow(e.id)}
                            //onRowDoubleClicked={(row, event) => console.log(row, event)}
                            />

                        </div>
                    </MDBTabsPane>

                    <MDBTabsPane show={this.state.fillActive === '-1'}>
                        <div className="row">
                            <div className="col-2">
                                <div class="input-group mb-3">
                                    <div class="input-group-text">
                                        <input class="form-check-input mt-0" type="checkbox" onChange={(e) => _SHOW_NEGATIVE(e.target.checked)} />
                                    </div>
                                    <input type="text" class="form-control" disabled value="Mostrar Finalizados" />
                                </div>
                            </div>
                        </div>

                        <div className="">
                            {load ? (
                                <DataTable
                                    conditionalRowStyles={rowSelectedStyleNegative}
                                    noDataComponent={<h4 className="fw-bold">NO HAY INFORMACION</h4>}
                                    striped="true"
                                    columns={columns_negative}
                                    data={this.state.data_negative}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={50}
                                    paginationRowsPerPageOptions={[50, 100, 200]}
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    className="data-table-component"
                                    title={
                                        <div class="d-flex justify-content-between">
                                            <div><h5>DESISTIDOS / DESISTENDO</h5></div>
                                            <div><MDBBtn outline color='success' size="sm" onClick={() => { generateCVSNegative(this.state.data_negative, "DESISTIDOS") }}
                                            ><i class="fas fa-file-csv"></i> DESCARGAR CSV</MDBBtn></div>
                                        </div>
                                    }
                                    dense
                                    onRowClicked={(e) => this.props.setSelectedRow(e.id_sistem)}
                                />
                            ) : (
                                <div className="text-center">
                                    <h4 className="fw-bold">CARGANDO INFORMACION...</h4>
                                </div>)}
                        </div>

                        <div className="row">

                        </div>
                    </MDBTabsPane>
                    {
                        /*
    
    <MDBTabsPane show={this.state.fillActive === '2'}>
                        <FUN_MACROTABLE_CLOCKS translation={translation} swaMsg={swaMsg} globals={globals}
                            date_start={this.props.date_start}
                            date_end={this.props.date_end}
                            dataFilter={this.state.data_macro_clocks_filter}
                            setSelectedRow={this.props.setSelectedRow}
                            selectedRow={selectedRow}
                            hide_jur={this.state.hide_jur}
                            hide_arc={this.state.hide_arc}
                            hide_ing={this.state.hide_ing}
                            worker_list={this.state.worker_list}
                            NAVIGATION_GEN={this.props.NAVIGATION_GEN}
                            retrieveMacroClocks={this.retrieveMacroClocks}
                            retrieveMacro={this.retrieveMacro}
                            load={load}
                        />
                    </MDBTabsPane>
                        */
                    }


                </MDBTabsContent>
            </div >
        );
    }
}

export default FUN_MACROTABLE;