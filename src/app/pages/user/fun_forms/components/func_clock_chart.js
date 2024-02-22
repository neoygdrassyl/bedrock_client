import React, { Component } from 'react';
import moment from 'moment';
import { dateParser, dateParser_dateDiff, dateParser_finalDate, dateParser_timePassed, formsParser1 } from '../../../../components/customClasses/typeParse';
import {
    XYPlot,
    XAxis,
    YAxis,
    VerticalGridLines,
    HorizontalGridLines,
    Hint,
    Crosshair,
    MarkSeries,
    HorizontalRectSeries,
    DiscreteColorLegend
} from 'react-vis';
import 'react-vis/dist/style.css';

//var momentB = require('moment-business-days');

class FUN_CLOCK_CHART extends Component {
    constructor(props) {
        super(props);
        this.state = {
            calendar_Data: [],
            hovered: false,
            crosshairValues: [],
            expand: true,
        };
    }
    componentDidMount() {
        this.setCalendarData();
    }
    setCalendarData() {
        var calendar_clocks = [];
        var dates_bundle = {
            today: moment().format('YYYY/MM/DD'),

            creation: moment(this.props.currentItem.date),
            payment: this._GET_CLOCKS_STATE(3).date_start,
            legal: this._GET_CLOCK_STATE_VERSION(5, this.props.currentItem.version).date_start,
            archive: this._GET_CLOCKS_STATE(100).date_start,

            incomplete_1: this._GET_CLOCK_STATE_VERSION(-5, -1).date_start,
            incomplete_2: this._GET_CLOCK_STATE_VERSION(-5, -2).date_start,
            incomplete_3: this._GET_CLOCK_STATE_VERSION(-5, -3).date_start,
            incomplete_4: this._GET_CLOCK_STATE_VERSION(-5, -4).date_start,

        }

        // SETTING MAIN EVENTS

        // THE MAIN EVENTS ARE GENERALLY DATE RANGES, THEY START AT DATE A AND END AT DATE B, GENERALLY SPEAKING, THIS VALUES CAN BE
        // EITHER SET OR VARIABLE DEPENDING ON THE CLOCKS.

        // THE GENERAL INNER WORKINGS OF THE CLOCKS ARE THE FOLLOWING

        // CREATION -> PAYMENT -> INCOMPLETE_1 ->            LEGAL -> INCOMPLETE_2        -> [TODO] -> INCMOPLETE_3 -> [TODO] -> INCOMPLETE_4 -> [TODO] -> ARCHIVE
        //                                     -> ARVHIVE          -> ARVHIVE FOR PH ONLY                           -> ARVHIVE                -> ARVHIVE

        // ALL STATE OF INCOMPLETE CAN LEAD DIRECTLY TO ARVHICE IN SOME CASES
        // THE PREVIOUS STEP IS GOING TO END AT THE START OF THE NEXT STEP, IF THE STEP DOES NOT EXISTS, IS LOOKS FOR THE NEXT CLOSES
        // THE INCOMPLETE STEPS ARE WITHITNG THEMSELVES STEPS ALSO, THAT STOPS THE PROCESS IF THEY ARE NOT COMPLETTED YET
        // THE INNER WORKIGS OF THE INCOMPLETE STEPS ARE THE FOLLOWING:

        // -5  -> -6  -> -7 ->  -10  ->                  -17 ->  -18  ->         -20 ->  -21  -> -30
        //               -8 ->          -11 -> ARVHICE           -19 -> ARCHIVE       -> -22  ->

        // FIRST IF LOOPS THROUGH dates_bundle AND REMOVES THE INDEXES OF _clock_stepper THAT ARE FALSE IN dates_bunble
        // THE INDEX creation IS ALWAYS PRESENT SO THIS ONE IS EXCEMPT FROM THIS INITIAL PROCESS

        // RECORD REVIEWS

        let fun_1 = this.props.currentItem.fun_1s[this.props.currentItem.version - 1];
        let type = formsParser1(fun_1);
        let isPH = this._REGEX_MATCH_PH(type);


        var _clock_stepper = ['payment', 'incomplete_1', 'legal', , 'incomplete_2', 'incomplete_3', 'incomplete_4', 'archive'];
        var _index = -1;
        if (!dates_bundle.payment) {
            _index = _clock_stepper.indexOf('payment')
            _clock_stepper.splice(_index, 1);
        }
        if (!dates_bundle.legal) {
            _index = _clock_stepper.indexOf('legal')
            _clock_stepper.splice(_index, 1);
        }
        if (!dates_bundle.archive) {
            _index = _clock_stepper.indexOf('archive')
            _clock_stepper.splice(_index, 1);
        }
        if (!dates_bundle.incomplete_1) {
            _index = _clock_stepper.indexOf('incomplete_1')
            _clock_stepper.splice(_index, 1);
        }
        if (!dates_bundle.incomplete_2) {
            _index = _clock_stepper.indexOf('incomplete_2')
            _clock_stepper.splice(_index, 1);
        }
        if (!dates_bundle.incomplete_3) {
            _index = _clock_stepper.indexOf('incomplete_3')
            _clock_stepper.splice(_index, 1);
        }
        if (!dates_bundle.incomplete_4) {
            _index = _clock_stepper.indexOf('incomplete_4')
            _clock_stepper.splice(_index, 1);
        }


        // THE CLOCK WILL ONLY SHOW THE PROCESS ONCE A PAYMENT HAS BEEN PROPERLY SET (DATE)
        let finishedNegative = true
        let isArchived = false
        if (_clock_stepper.includes('payment')) {
            let start = dates_bundle.payment;
            let end = dateParser_finalDate(start, 31);
            let next_Step = _clock_stepper[1]
            if (next_Step == 'incomplete_1') {
                end = dates_bundle.incomplete_1;
                let diff;
                if (end) {
                    diff = dateParser_dateDiff(start, end);
                    if (diff > 31) diff = 31
                    end = dateParser_finalDate(start, diff);
                }
                diff = moment(end).diff(start, 'days');
                for (var i = 1; i < diff; i++) {
                    let next_day = moment(start).add(i, 'days')
                    calendar_clocks.push({ date: next_day, state: 4 })
                }

                calendar_clocks = this.addClock(calendar_clocks, moment(dates_bundle.incomplete_1), -1, ', DECLARADO INCOMPLETO')
            }
            if (next_Step == 'legal') {
                let diff = moment(dates_bundle.legal).diff(start, 'days');
                if (diff > 0) {
                    if (diff > 46) diff = 46
                    for (var i = 1; i < diff; i++) {
                        let next_day = moment(start).add(i, 'days')
                        calendar_clocks.push({ date: next_day, state: 4 })
                    }
                }
            }
        }


        if (_clock_stepper.includes('incomplete_1')) {
            calendar_clocks = this.setCalendarNegative(calendar_clocks, -1);
            let _clock = this._GET_CLOCK_STATE_VERSION(-30, -1);
            isArchived = this._GET_CLOCK_STATE_VERSION(-11, -1);
            if (!isArchived) isArchived = this._GET_CLOCK_STATE_VERSION(-19, -1);
            if (!_clock) finishedNegative = false;
        }

        let daysPassed = 0;
        if (_clock_stepper.includes('legal') && finishedNegative && !isArchived) {
            let start = dates_bundle.legal;
            let end = dateParser_finalDate(start, 46);
            if (isPH && dates_bundle.archive) end = dates_bundle.archive;
            if (_clock_stepper.includes('incomplete_2')) end = dates_bundle.incomplete_2;
            let diff;
            if (end) {
                diff = dateParser_dateDiff(start, end);
                if (diff > 46) diff = 46
                end = dateParser_finalDate(start, diff);
                daysPassed = diff;
            }
            diff = moment(end).diff(start, 'days');

            for (var i = 1; i < diff; i++) {
                let next_day = moment(start).add(i, 'days')
                calendar_clocks.push({ date: next_day, state: 6 })
            }
            calendar_clocks = this.addClock(calendar_clocks, moment(dates_bundle.legal), 5, ', LYDF')
        }

        if (_clock_stepper.includes('incomplete_2') && finishedNegative && !isArchived) {
            calendar_clocks = this.setCalendarNegative(calendar_clocks, -2);
            let _clock = this._GET_CLOCK_STATE_VERSION(-30, -2);
            isArchived = this._GET_CLOCK_STATE_VERSION(-11, -2);
            if (!isArchived) isArchived = this._GET_CLOCK_STATE_VERSION(-19, -2);
            if (!_clock) finishedNegative = false;
        }

        if (finishedNegative && _clock_stepper.includes('incomplete_2') && !isArchived) {
            let start = this._GET_CLOCK_STATE_VERSION(-30, -2).date_start;
            let end = dateParser_finalDate(start, 46 - daysPassed);
            if (_clock_stepper.includes('incomplete_3')) end = dates_bundle.incomplete_3;
            let diff;
            if (end) {
                diff = dateParser_dateDiff(start, end);
                if (diff > 46 - daysPassed) diff = 46 - daysPassed;
                end = dateParser_finalDate(start, diff);
                daysPassed += diff;
            }
            diff = moment(end).diff(start, 'days');
            for (var i = 1; i < diff; i++) {
                let next_day = moment(start).add(i, 'days')
                calendar_clocks.push({ date: next_day, state: 6 })
            }
        }

        if (_clock_stepper.includes('incomplete_3') && finishedNegative && !isArchived) {
            calendar_clocks = this.setCalendarNegative(calendar_clocks, -3);
            let _clock = this._GET_CLOCK_STATE_VERSION(-30, -3);
            isArchived = this._GET_CLOCK_STATE_VERSION(-11, -3);
            if (!isArchived) isArchived = this._GET_CLOCK_STATE_VERSION(-19, -3);
            if (!_clock) finishedNegative = false;
        }

        if (finishedNegative && _clock_stepper.includes('incomplete_3') && !isArchived) {
            let start = this._GET_CLOCK_STATE_VERSION(-30, -3).date_start;
            let end = dateParser_finalDate(start, 46 - daysPassed);
            let diff;
            if (end) {
                diff = dateParser_dateDiff(start, end);
                if (diff > 46 - daysPassed) diff = 46 - daysPassed;
                end = dateParser_finalDate(start, diff);
            }
            diff = moment(end).diff(start, 'days');
            for (var i = 1; i < diff; i++) {
                let next_day = moment(start).add(i, 'days')
                calendar_clocks.push({ date: next_day, state: 6 })
            }
        }

        // SETTING MINOR EVENTS

        // SIGN
        if (this.props.currentItem.fun_law) {
            if (this.props.currentItem.fun_law.sign) {
                let _sign = this.props.currentItem.fun_law.sign.split(',')
                if (_sign[1]) calendar_clocks = this.addClock(calendar_clocks, moment(_sign[1]).format('YYYY/MM/DD'), 7, ', nRADICACION VALLA')
            }
        }

        // NEIGHBOURS
        let _neighbours = this.props.currentItem.fun_3s;
        for (var i = 0; i < _neighbours.length; i++) {
            if (_neighbours[i].alerted) calendar_clocks = this.addClock(calendar_clocks, moment(_neighbours[i].alerted), 8, ', VECINO ALERTADO')
        }



        if (isPH) {
            let ph = this.props.currentItem.record_ph;
            if (ph) {
                //calendar_clocks.push({ date: moment(ph.createdAt), state: 14, event: '\nINICIO REVISION P.H.' })
                if (ph.date_law_review) calendar_clocks = this.addClock(calendar_clocks, moment(ph.date_law_review), 14, ', REVISION JUR. P.H.')
                if (ph.date_arc_review) calendar_clocks = this.addClock(calendar_clocks, moment(ph.date_arc_review), 14, ', REVISION ARQ. P.H.')
            }
        } else {
            let law = this.props.currentItem.record_law;
            if (law) {
                let law_review = law.record_law_reviews[law.version - 1];
                if (law_review) calendar_clocks = this.addClock(calendar_clocks, moment(law_review.date), 14, ', REVISION JURIDICA')
            }
            let arc = this.props.currentItem.record_arc;
            if (arc) {
                let arc_review = arc.record_arc_38s[arc.version - 1];
                if (arc_review) calendar_clocks = this.addClock(calendar_clocks, moment(arc_review.date), 14, ', REVISION ARQUITECTONICA')
            }
        }


        if (dates_bundle.creation) calendar_clocks = this.addClock(calendar_clocks, dates_bundle.creation, 1, ', CREACION VIRTUAL')
        if (dates_bundle.payment) calendar_clocks = this.addClock(calendar_clocks, moment(dates_bundle.payment), 3, ', PAGO EXPENSAS FIJAS')
        if (dates_bundle.archive) calendar_clocks = this.addClock(calendar_clocks, moment(dates_bundle.archive), 100, ', ARCHIVADO')
        calendar_clocks = this.addClock(calendar_clocks, dates_bundle.today, 99, ', HOY')


        let _startDate = dates_bundle.payment ? dates_bundle.payment : dates_bundle.creation;
        let _endDate = dates_bundle.payment ? moment(dates_bundle.payment, 'YYYY-MM-DD').add(1, 'years') : moment(this.props.currentItem.date, 'YYYY-MM-DD').add(1, 'years')
        this.setState({ endDate: _endDate, startDate: _startDate, calendar_Data: calendar_clocks })
    }

    // RETURNS AN ARRAY OF CLOCKS THAT INCLUDES ALL THE PROPER CONFIGURATION FOR THE NEGATIVE PROCESS
    setCalendarNegative(clocks, version) {
        // -5  -> -6  -> -7 ->  -10  ->                  -17 ->  -18  ->         -20 ->  -21  -> -30
        //               -8 ->          -11 -> ARVHICE           -19 -> ARCHIVE       -> -22  ->

        var _clocks = clocks;
        var _check_clocks = this._GET_CLOCKS_VERSION(version);
        var steps = [];
        var index = -1;
        var index_2 = -1
        var arhive = false;
        for (var i = 0; i < _check_clocks.length; i++) {
            steps.push(_check_clocks[i].state);
        }

        if (steps.includes(-6)) {
            index = steps.indexOf(-6);
            if (steps.includes(-7)) index_2 = steps.indexOf(-7);
            if (steps.includes(-8)) index_2 = steps.indexOf(-8);

            if (index_2 > 0) {
                let start = _check_clocks[index].date_start;
                let end = _check_clocks[index_2].date_start;
                let diff = dateParser_dateDiff(start, end);
                if (diff > 5) diff = 5
                end = dateParser_finalDate(start, diff);
                diff = moment(end).diff(start, 'days');
                for (var i = 1; i < diff; i++) {
                    let next_day = moment(start).add(i, 'days')
                    _clocks.push({ date: next_day, state: 69 })
                }
            }
            index_2 = -1
        }

        if (steps.includes(-7) || steps.includes(-8)) {
            steps.indexOf(-7) == -1 ? index = steps.indexOf(-8) : index = steps.indexOf(-7);
            if (steps.includes(-10)) index_2 = steps.indexOf(-10);
            if (steps.includes(-11)) index_2 = steps.indexOf(-11);

            if (index_2 > 0) {
                let start = _check_clocks[index].date_start;
                let end = _check_clocks[index_2].date_start;
                let diff = dateParser_dateDiff(start, end);
                if (diff > 10) diff = 10
                end = dateParser_finalDate(start, diff);
                diff = moment(end).diff(start, 'days');
                for (var i = 1; i < diff; i++) {
                    let next_day = moment(start).add(i, 'days')
                    _clocks.push({ date: next_day, state: 69 })
                }
            }
            index_2 = -1
        }

        if (steps.includes(-10)) {
            index = steps.indexOf(-10);
            if (steps.includes(-17)) index_2 = steps.indexOf(-17);

            if (index_2 > 0) {
                let start = _check_clocks[index].date_start;
                let end = _check_clocks[index_2].date_start;
                let diff = dateParser_dateDiff(start, end);
                if (diff > 45) diff = 45
                end = dateParser_finalDate(start, diff);
                diff = moment(end).diff(start, 'days');
                for (var i = 1; i < diff; i++) {
                    let next_day = moment(start).add(i, 'days')
                    _clocks.push({ date: next_day, state: -2 })
                }
            }
            index_2 = -1
        }

        if (steps.includes(-11)) {
            index = steps.indexOf(-11);
            if (steps.includes(-30)) index_2 = steps.indexOf(-30);
            arhive = true;

            if (index_2 > 0) {
                let start = _check_clocks[index].date_start;
                let end = _check_clocks[index_2].date_start;
                let diff = moment(end).diff(start, 'days');
                if (diff > 0) {
                    for (var i = 1; i < diff; i++) {
                        let next_day = moment(start).add(i, 'days')
                        _clocks.push({ date: next_day, state: -2 })
                    }
                }
            }
            index_2 = -1
        }

        if (!arhive) {
            if (steps.includes(-17)) {
                index = steps.indexOf(-17);
                if (steps.includes(-20)) index_2 = steps.indexOf(-20);

                if (index_2 > 0) {
                    let start = _check_clocks[index].date_start;
                    let end = _check_clocks[index_2].date_start;
                    //let diff = dateParser_dateDiff(start, end);
                    //if (diff > 5) diff = 5
                    //end = momentB(start).businessAdd(diff).format('YYYY-MM-DD')
                    let diff = moment(end).diff(start, 'days');
                    for (var i = 1; i < diff; i++) {
                        let next_day = moment(start).add(i, 'days')
                        _clocks.push({ date: next_day, state: -2 })
                    }
                }
                index_2 = -1
            }

            if (steps.includes(-20)) {
                index = steps.indexOf(-20);
                if (steps.includes(-21)) index_2 = steps.indexOf(-21);
                if (steps.includes(-22)) index_2 = steps.indexOf(-22);
                if (steps.includes(-30)) index_2 = steps.indexOf(-30);

                if (index_2 > 0) {
                    let start = _check_clocks[index].date_start;
                    let end = _check_clocks[index_2].date_start;
                    let diff = dateParser_dateDiff(start, end);
                    if (diff > 6) diff = 6
                    end = dateParser_finalDate(start, diff);
                    diff = moment(end).diff(start, 'days');
                    for (var i = 1; i < diff; i++) {
                        let next_day = moment(start).add(i, 'days')
                        _clocks.push({ date: next_day, state: 69 })
                    }
                }
                index_2 = -1
            }

        }

        for (var i = 0; i < _check_clocks.length; i++) {
            let text = '';
            if (_check_clocks[i].state == -5) text = ', CITACION PARA NOTIFICACION PERSONAL (1° Vez)';
            if (_check_clocks[i].state == -6) text = ', ENVIO DE EMAIL (1° Vez)';
            if (_check_clocks[i].state == -7) text = ', EL SOLICITANTE SE PRESENTA (1° Vez)';
            if (_check_clocks[i].state == -8) text = ', NOTIFICACION POR AVISO (1° Vez)';
            if (_check_clocks[i].state == -10) text = ', SE INTERPONE RECURSO';
            if (_check_clocks[i].state == -11) text = ', RECURSO NO INTERPONIDO';
            if (_check_clocks[i].state == -17) text = ', LA CURADURIA DA RESPUESTA';
            if (_check_clocks[i].state == -18) text = ', DECLARA : CONTINUA';
            if (_check_clocks[i].state == -19) text = ', DECLARA : NO CONTINUA';
            if (_check_clocks[i].state == -20) text = ', CITACION PARA NOTIFICACION PERSONAL (2° Vez)';
            if (_check_clocks[i].state == -21) text = ', ENVIO DE EMAIL (2° Vez)';
            if (_check_clocks[i].state == -22) text = ', EL SOLICITANTE SE PRESENTA (2° Vez)';
            if (_check_clocks[i].state == -30) text = ', FINALIZACION';

            if (text) _clocks = this.addClock(_clocks, moment(_check_clocks[i].date_start), -1, text);
        }

        return _clocks;

    }

    addClock(clocks, _date, _state, _text) {
        var _clocks = clocks;
        for (var i = 0; i < _clocks.length; i++) {
            if (moment(_clocks[i].date).isSame(_date)) {
                let old_text = _clocks[i].event ? _clocks[i].event : "";
                _clocks[i] = { date: _date, state: _state, event: old_text + _text };
                return _clocks;
            }
        }
        _clocks.push({ date: _date, state: _state, event: _text });
        return _clocks;
    }
    _GET_CHILD_CLOCK() {
        var _CHILD = this.props.currentItem.fun_clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    _GET_CLOCKS_STATE(_state) {
        var _CLOCK = this._GET_CHILD_CLOCK();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }
    _GET_CLOCKS_VERSION(_version) {
        var _CLOCK = this._GET_CHILD_CLOCK();
        var _CLOCKS = [];
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].version == _version) _CLOCKS.push(_CLOCK[i]);
        }
        return _CLOCKS;
    }
    _GET_CLOCK_STATE_VERSION(_state, _version) {
        var _CLOCK = this._GET_CHILD_CLOCK();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
        }
        return false;
    }
    _REGEX_MATCH_PH(_string) {
        let regex0 = /p\.\s+h/i;
        let regex1 = /p\.h/i;
        let regex2 = /PROPIEDAD\s+HORIZONTAL/i;
        let regex3 = /p\s+h/i;
        if (regex0.test(_string) || regex2.test(_string) || regex1.test(_string) || regex3.test(_string)) return true;
        return false
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { expand } = this.state
        const date_start = this._GET_CLOCKS_STATE(3) ? this._GET_CLOCKS_STATE(3).date_start : moment(this.props.currentItem.date);
        const stepsToCheck = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];
        const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
        const _fun_0_type_text = { 'i': 'I', 'ii': 'II', 'iii': 'III', 'iv': 'IV', 'oa': 'OA' };
        const evaDefaultTime = _fun_0_type_time[currentItem.type] ?? 45;
        const evaCorTime = this._GET_CLOCKS_STATE(34).date_start ? 50 : 35;
        const viaTime = () => {
            let ldfTime = this._GET_CLOCKS_STATE(5).date_start;
            let actaTime = this._GET_CLOCKS_STATE(30).date_start;
            let acta2Time = this._GET_CLOCKS_STATE(49).date_start;
            let corrTime = this._GET_CLOCKS_STATE(35).date_start;

            let time = 1;

            if (ldfTime && actaTime) {
                if (acta2Time && corrTime) {
                    time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime) - dateParser_dateDiff(acta2Time, corrTime);
                } else {
                    time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime);
                }
            }
            if (time < 1) time = 1;
            return time;
        }
        const corrTime = () => {
            let s1 = this._GET_CLOCKS_STATE(5).date_start;
            let f1 = this._GET_CLOCKS_STATE(30).date_start;

            let eva_1_time = dateParser_dateDiff(f1, s1);
            return evaDefaultTime - eva_1_time;

        }
        const requereCorr = () => {
            let actaClock = this._GET_CLOCKS_STATE(30);
            let con = false;
            if (actaClock.desc) {
                if (actaClock.desc.includes('NO CUMPLE')) con = true;
            }
            return con;
        }
        const colorUser = "rgba(60, 179, 113, 0.75)";
        const colorCom = "rgba(135, 206, 235, 0.75)";
        const colorNeg = "rgba(139 ,0, 0, 0.75)";
        const clocksBars = [
            { id: 'rad', title: 'RADICACIÓN', color: colorUser, s: [3, false], f1: [-5, -1], f2: [5, false], dLenght: 30, required: true, },
            { id: 'de1', title: 'DES. INCOMPLETO', color: colorNeg, s: [-5, -1], f1: [5, false], f2: false, dLenght: 45, required: false, },
            { id: 'eva', title: 'EVALUACIÓN', color: colorCom, s: [5, false], f1: [30, false], f2: false, dLenght: evaDefaultTime, required: true, },

            { id: 'neve', title: 'NOT. ACTA', color: colorCom, s: [31, false], f1: [32, false], f2: [33, false], dLenght: 15, required: true, },

            { id: 'cor', title: 'CORRECCIONES', color: colorUser, s: [32, false], s2: [33, false], f1: [-5, -3], f2: [35, false], dLenght: evaCorTime, required: requereCorr(), },
           
            { id: 'de3', title: 'DES. NO CUMPLE CORRECCIONES', color: colorNeg, s: [-5, -3], f1: [49, false], f2: false, dLenght: 45, required: false, },
            //{ id: 'eva2', title: 'EVALUACIÓN (p.2)', color: colorCom, s: [35, false], f1: [49, false], f2: false, dLenght: corrTime(), required: requereCorr(), },
            
            { id: 'via', title: 'VIABILIDAD', color: colorCom, s: [49, false], s2: [35, false], f1: [61, false], f2: false, dLenght: viaTime(), required: true, }, 

            { id: 'nvia', title: 'NOT. VIABILIDAD', color: colorCom, s: [55, false], f1: [55, false], f2: [57, false], dLenght: 15, required: true, },

            { id: 'pay', title: 'PAGOS', color: colorUser, s: [56, false], s2: [57, false], f1: [-5, -4], f2: [69, false], dLenght: 30, required: true, },
            { id: 'de4', title: 'DES. FALTA PAGOS', color: colorNeg, s: [-5, -4], f1: [-30, -4], f2: false, dLenght: 45, required: false, },
            { id: 'res', title: 'RESOLUCIÓN', color: colorCom, s: [69, false], f1: [70, false], f2: false, dLenght: 5, required: true, },

            { id: 'nres', title: 'NOT. RESOLUCIÓN', color: colorCom, s: [751, false], f1: [752, false], f2: [753, false], dLenght: 15, required: true, },

            { id: 'lic', title: 'LICENCIA', color: colorCom, s: [70, false], f1: [99, false], f2: false, dLenght: 10, required: true, },
        ]


        // DATA CONVERTER

        let _ADD_MARK = (_marks, _new_mark) => {
            var marks = _marks;
            for (var i = 0; i < marks.length; i++) {
                if (marks[i].date == _new_mark.date && marks[i].y == _new_mark.y) {
                    marks[i].name = marks[i].name + "\n" + _new_mark.name;
                    return marks
                }
            }
            marks.push(_new_mark)
            return marks
        }
        let GET_TIME_CLOCK = (_state, _version) => {
            var _clock = this._GET_CLOCK_STATE_VERSION(_state, _version);
            if (!_clock) return null;
            if (!this._GET_CLOCKS_STATE(3)) return null
            let time = Math.abs(dateParser_dateDiff(_clock.date_start, this._GET_CLOCKS_STATE(3).date_start));
            return time;
        }
        let _GET_DAYS_CLOCK = (_state, _version) => {
            var startClock = this._GET_CLOCKS_STATE(3).date_start;
            if (!startClock) return false;
            if (_version) {
                var clock = this._GET_CLOCK_STATE_VERSION(_state, _version).date_start;
                if (clock) return dateParser_dateDiff(startClock, clock)
                else return false
            } else {
                var clock = this._GET_CLOCKS_STATE(_state).date_start;
                if (clock) return dateParser_dateDiff(startClock, clock)
                else return false
            }
        }
        let _GET_Y_EXPAND = (I) => {
            var y = 0;
            var yFinal = { rad: 0, de1: 0.5, eva: 1, cor: 1.5, de2: 2.5, pay: 3, de3: 3.5, exp: 4 }
            clocksBars.map((value) => {
                var start = _GET_DAYS_CLOCK(value.s[0], value.s[1]);
                var end = _GET_DAYS_CLOCK(value.f1[0], value.f1[1]);
                if (!end) end = _GET_DAYS_CLOCK(value.f2[0], value.f2[1]);
                if (start !== false && end !== false) {
                    yFinal[value.id] = y;
                    y += 0.5
                }
            })
            return yFinal[I] + 0.25;
        }
        let _GET_LAST_STEP = () => {
            let clocks = clocksBars;
            let lastClock = false;
            clocks.map((clock, i) => {
                let checkClock = false;
                let clockEnd = false;

                let clock_start = clock.s;
                let clock_end = clock.f1;


                if (clock_start[1]) checkClock = this._GET_CLOCK_STATE_VERSION(clock_start[0], clock_start[1]).date_start;
                else checkClock = this._GET_CLOCKS_STATE(clock_start[0]).date_start;

                clock_start = clock.s2;
                if (!checkClock && clock_start) {
                    if (clock_start[1]) checkClock = this._GET_CLOCK_STATE_VERSION(clock_start[0], clock_start[1]).date_start;
                    else checkClock = this._GET_CLOCKS_STATE(clock_start[0]).date_start;
                }

                if (clock_end[1]) { clockEnd = this._GET_CLOCK_STATE_VERSION(clock_end[0], clock_end[1]).date_start; }
                else clockEnd = this._GET_CLOCKS_STATE(clock_end[0]).date_start;

                clock_end = clock.f2;
                if (!clockEnd && clock_end) {
                    if (clock_end[1]) { clockEnd = this._GET_CLOCK_STATE_VERSION(clock_end[0], clock_end[1]).date_start; }
                    else clockEnd = this._GET_CLOCKS_STATE(clock_end[0]).date_start;
                }

                if (checkClock && clockEnd) lastClock = { i: i, ...clock };
            })
            return lastClock;
        }
        let _GET_NEXT_STEP = () => {
            let nextClock = _GET_LAST_STEP();
            let si = nextClock.i;
            for (let i = si + 1; i < clocksBars.length; i++) {
                const clock = clocksBars[i];
                if (clock.required) {
                    nextClock = clock;
                    break;
                }
            }
            return nextClock;
        }
        let _GET_YAXIS_DATA = () => {
            let clocks = clocksBars;
            let data = [];
            clocks.map((clock, i) => {
                let state = clock.s[0] ?? clock.s2[0];
                let version = clock.s[1] ?? clock.s2[1];

                let state_end = clock.f1[0] ?? clock.f2[0];
                let version_end = clock.f1[1] ?? clock.f2[1];

                let checkClock = false;
                let clockEnd = false;

                if (state && version) { checkClock = this._GET_CLOCK_STATE_VERSION(state, version).date_start; }
                else checkClock = this._GET_CLOCKS_STATE(state).date_start;

                if (state_end && version_end) { clockEnd = this._GET_CLOCK_STATE_VERSION(state_end, version_end).date_start; }
                else clockEnd = this._GET_CLOCKS_STATE(state_end).date_start;

                if ((checkClock && clockEnd) || clock.required) data.push(clock.title)
            })
            return data;
        }
        let _GET_CUMDAYS = () => {
            let days = [0, 0, 0];
            days[0] = _GET_DAYS_CLOCK(30, false) - _GET_DAYS_CLOCK(5, false);
            days[1] = (_GET_DAYS_CLOCK(32, false) ?? _GET_DAYS_CLOCK(33, false)) - _GET_DAYS_CLOCK(31, false);
            days[2] = _GET_DAYS_CLOCK(61, false) - (requereCorr() ? _GET_DAYS_CLOCK(49, false) : _GET_DAYS_CLOCK(30, false));

            if (days[0] && days[1] && days[2]) return days.reduce((prev, curr) => prev + curr)
        }

        let _GET_TIME_BETWEEN_TWO_STATES = (state_1, state_2) => {
            let today = this._GET_CLOCKS_STATE(3).date_start
            if (!today) return 'NaN'
            let time_1 = this._GET_CLOCKS_STATE(state_1).date_start
            if (time_1) time_1 = dateParser_dateDiff(time_1, today);
            if (!time_1) return 'NaN'
            let time_2 = this._GET_CLOCKS_STATE(state_2).date_start
            if (time_2) time_2 = dateParser_dateDiff(time_2, today);
            if (!time_2) return 'NaN'
            return Number(time_2 - time_1)
        }
        // HINST AND CROSSHAIR COMPONENTS
        let _GET_HINT_BODY = (item) => {
            let title = item.title;
            let start_date = this._GET_CLOCKS_STATE(3).date_start;
            return <>
                <div className="row">
                    <label><label className="fw-bold"> {title}</label></label>
                </div>
                <div className="row">
                    <label>Fecha Inicial: <label className="fw-bold">{item.x > 0 ? dateParser_finalDate(start_date, item.x) : start_date}</label> </label>
                </div>
                <div className="row">
                    <label>Fecha Final:  <label className="fw-bold">{dateParser_finalDate(start_date, item.x0)}</label> </label>
                </div>
                <div className="row">
                    <label>Total:  <label className="fw-bold">{dateParser_dateDiff(item.x > 0 ? dateParser_finalDate(start_date, item.x) : start_date, dateParser_finalDate(start_date, item.x0))} Dias habiles</label> </label>
                </div>
            </>
        }

        // MARKS
        let _CHART_MARKS_BLUE = () => {

            return <MarkSeries
                className="mark-series"
                sizeRange={[1, 5]}
                data={_blueMarks(1.5)}
                color={'blue'}
                onValueMouseOver={v => this.setState({ hoveredCell: v })}
                onValueMouseOut={() => this.setState({ hoveredCell: false })} />
        }
        let _CHART_MARKS_GREEN = () => {

            return <MarkSeries
                className="mark-series"
                sizeRange={[1, 5]}
                data={_GreenMarks(2)}
                color={'green'}
                onValueMouseOver={v => this.setState({ hoveredCell: v })}
                onValueMouseOut={() => this.setState({ hoveredCell: false })} />
        }
        let _CHART_MARKS_RED = () => {

            return <MarkSeries
                className="mark-series"
                sizeRange={[1, 5]}
                data={_RedMarks(2.5)}
                color={'red'}
                onValueMouseOver={v => this.setState({ hoveredCell: v })}
                onValueMouseOut={() => this.setState({ hoveredCell: false })} />
        }
        let _blueMarks = (_y) => {
            let _marks = [];
            // SIGN

            if (currentItem.fun_law) {
                if (currentItem.fun_law.sign) {
                    let _sign = currentItem.fun_law.sign.split(',')
                    if (_sign[1]) {
                        var y = _y;
                        if (this.state.expand) y = _GET_Y_EXPAND('eva');
                        _marks = _ADD_MARK(_marks,
                            {
                                x: dateParser_dateDiff(_sign[1], this._GET_CLOCKS_STATE(3).date_start),
                                y: y,
                                size: 1,
                                name: 'RADICACION DE LA VALLA',
                                date: _sign[1]
                            })
                    }
                }
            }

            // NEIGHBOURS
            let _neighbours = currentItem.fun_3s;
            for (var i = 0; i < _neighbours.length; i++) {
                if (_neighbours[i].alerted) {
                    var y = _y;
                    if (this.state.expand) y = _GET_Y_EXPAND('eva');
                    _marks = _ADD_MARK(_marks,
                        {
                            x: dateParser_dateDiff(_neighbours[i].alerted, this._GET_CLOCKS_STATE(3).date_start),
                            y: y,
                            size: 1,
                            name: 'VECINO NOTIFICADO: ' + _neighbours[i].direccion_1,
                            date: _neighbours[i].alerted
                        })
                }
            }

            //  REPORTS & RECORDS
            var _CLOCK = this._GET_CHILD_CLOCK();
            for (var i = 0; i < _CLOCK.length; i++) {
                if ((_CLOCK[i].state > 10 && _CLOCK[i].state < 15)) {
                    var y = _y;
                    if (this.state.expand) y = _GET_Y_EXPAND('eva');
                    _ADD_MARK(_marks,
                        {
                            x: dateParser_dateDiff(_CLOCK[i].date_start, this._GET_CLOCKS_STATE(3).date_start),
                            y: y,
                            size: 1,
                            name: _CLOCK[i].name,
                            date: _CLOCK[i].date_start
                        })
                }

            }

            let rr_states = [30, 31, 49]; // RECORD REVIEW STATES
            for (var i = 0; i < rr_states.length; i++) {
                if (this._GET_CLOCKS_STATE(rr_states[i])) {
                    {
                        var y = _y;
                        if (this.state.expand) y = _GET_Y_EXPAND('eva');
                        let _clock = this._GET_CLOCKS_STATE(rr_states[i])
                        _ADD_MARK(_marks,
                            {
                                x: dateParser_dateDiff(_clock.date_start, this._GET_CLOCKS_STATE(3).date_start),
                                y: y,
                                size: 1,
                                name: _clock.name,
                                date: _clock.date_start
                            })
                    }

                }
            }

            rr_states = [70, 71, 72, 73, 74, 75, 80, 99]; // RECORD REVIEW STATES
            for (var i = 0; i < rr_states.length; i++) {
                if (this._GET_CLOCKS_STATE(rr_states[i])) {
                    {
                        var y = _y;
                        if (this.state.expand) y = _GET_Y_EXPAND('exp');
                        let _clock = this._GET_CLOCKS_STATE(rr_states[i])
                        _ADD_MARK(_marks,
                            {
                                x: dateParser_dateDiff(_clock.date_start, this._GET_CLOCKS_STATE(3).date_start),
                                y: y,
                                size: 1,
                                name: _clock.name,
                                date: _clock.date_start
                            })
                    }

                }
            }

            return _marks;
        }
        let _GreenMarks = (_y) => {
            let _marks = [];
            //  RECORD REVIEW PROCESS NOTIFICATION
            let rr_states = [32, 33, 34, 35, 41, 42, 43]; // RECORD REVIEW STATES
            for (var i = 0; i < rr_states.length; i++) {
                if (this._GET_CLOCKS_STATE(rr_states[i])) {
                    var y = _y;
                    if (this.state.expand) y = _GET_Y_EXPAND('cor');
                    let _clock = this._GET_CLOCKS_STATE(rr_states[i])
                    _ADD_MARK(_marks,
                        {
                            x: dateParser_dateDiff(_clock.date_start, this._GET_CLOCKS_STATE(3).date_start),
                            y: y,
                            size: 1,
                            name: _clock.name,
                            date: _clock.date_start
                        })
                }
            }

            rr_states = [61, 62, 63, 64, 65]; // RECORD REVIEW STATES
            for (var i = 0; i < rr_states.length; i++) {
                if (this._GET_CLOCKS_STATE(rr_states[i])) {
                    var y = _y;
                    if (this.state.expand) y = _GET_Y_EXPAND('pay');
                    let _clock = this._GET_CLOCKS_STATE(rr_states[i])
                    _ADD_MARK(_marks,
                        {
                            x: dateParser_dateDiff(_clock.date_start, this._GET_CLOCKS_STATE(3).date_start),
                            y: y,
                            size: 1,
                            name: _clock.name,
                            date: _clock.date_start
                        })
                }
            }

            return _marks;
        }
        let _RedMarks = (_y) => {
            let _marks = [];
            const history = [];
            const versions = ['-1', '-3', '-4'];
            versions.map(_version => {
                for (var i = 0; i < stepsToCheck.length; i++) {
                    if (GET_TIME_CLOCK(stepsToCheck[i], _version)) history.push(stepsToCheck[i])
                }

                for (var i = 0; i < history.length; i++) {
                    var y = _y;
                    var type = { '-1': 'de1', '-3': 'de3', '-4': 'de4' }
                    if (this.state.expand) y = _GET_Y_EXPAND(type[_version]);
                    if (GET_TIME_CLOCK(history[i], _version)) _marks = _ADD_MARK(_marks, { x: GET_TIME_CLOCK(history[i], _version), y: y, size: 1, name: this._GET_CLOCK_STATE_VERSION(history[i], _version).name, date: this._GET_CLOCK_STATE_VERSION(history[i], _version).date_start })
                }
            })

            return _marks;
        }
        // BARS
        let _CHART_PROGRESS_BAR = () => {
            var expandY = 0;
            var lastRealClock = 0;
            return clocksBars.map((value) => {
                let startValues = value.s;
                var start = _GET_DAYS_CLOCK(startValues[0], startValues[1]);

                if (!start && value.s2) {
                    startValues = value.s2;
                    start = _GET_DAYS_CLOCK(startValues[0], startValues[1]);
                }

                //if (start && lastRealClock == 0) lastRealClock = start;

                let finalValues = value.f1;
                var end = _GET_DAYS_CLOCK(finalValues[0], finalValues[1]);
                if (!end && value.f2) {
                    finalValues = value.f2;
                    end = _GET_DAYS_CLOCK(finalValues[0], finalValues[1]);
                }

                let data = [];

                if (start !== false && end !== false) {
                    let endLimit = end;
                    if (end - start > value.dLenght) endLimit = start + value.dLenght
                    data.push({
                        x: start,
                        x0: endLimit,
                        y: expand ? expandY : 0,
                        y0: expand ? expandY + 0.5 : 1,
                        title: value.title
                    })
                    lastRealClock = endLimit;
                } else if (start == false && lastRealClock && value.required) {
                    data.push({
                        x: lastRealClock,
                        x0: lastRealClock + value.dLenght,
                        y: expand ? expandY : 0,
                        y0: expand ? expandY + 0.5 : 1,
                        title: value.title
                    })
                    lastRealClock = lastRealClock + value.dLenght;
                } else if (start !== false && end == false && lastRealClock && value.required) {
                    data.push({
                        x: start,
                        x0: start + value.dLenght,
                        y: expand ? expandY : 0,
                        y0: expand ? expandY + 0.5 : 1,
                        title: value.title
                    })
                    lastRealClock = start + value.dLenght;
                }

                if (expand && data.length) expandY += 0.5;
                if (data.length) return <HorizontalRectSeries
                    data={data}
                    color={start !== false && end !== false ? value.color : 'rgba(176, 176, 176, 0.75)'}
                    onValueMouseOver={d => { this.setState({ hovered: d }) }}
                    onValueMouseOut={d => this.setState({ hovered: false })}
                />
            })
        }

        const _tickValues = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200];
        const _tickValues_2 = [0, 50, 100, 150, 200];
        const YtickValues = [0, 1, 2, 3, 4];
        const _today = dateParser_dateDiff(date_start, moment().format('YYYY-MM-DD'));

        return (
            <div>
                {true ?
                    <>
                        <div class="input-group my-1 ">
                            <div class="input-group-prepend">
                                <div class="input-group-text">
                                    <input type="checkbox" class="form-check-input my-1"
                                        onChange={() => this.setState({ expand: !this.state.expand })} />
                                </div>
                            </div>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <label> UNIR BARRAS DE TIEMPOS</label>
                                </div>
                            </div>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <label> CATEGORIA: {_fun_0_type_text[currentItem.type] ?? 'SIN CATEGORIA'} - {_fun_0_type_time[currentItem.type] ?? 45} dias</label>
                                </div>
                            </div>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <label> DIAS ACUMULADOS: {_GET_CUMDAYS() ?? 'NaN'}</label>
                                </div>
                            </div>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <label> INDICE EFICIENCIA: {(_GET_CUMDAYS() / _fun_0_type_time[currentItem.type] ?? 45).toFixed(2) ?? 'NaN'}</label>
                                </div>
                            </div>
                        </div>
                        <div class="input-group my-1 ">
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <label>TIMEPO DE OBSERVACIONES {_GET_TIME_BETWEEN_TWO_STATES(5, 31)}</label>
                                </div>
                            </div>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <label> INDICE OBSERVACIONES: {Number(_GET_TIME_BETWEEN_TWO_STATES(5, 31) / _fun_0_type_time[currentItem.type] ?? 45).toFixed(2) ?? 'NaN'}</label>
                                </div>
                            </div>
                        </div>
                        <div class="input-group my-1 ">
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <label>TIMEPO DE CORRECCIONES {_GET_TIME_BETWEEN_TWO_STATES(32, 32)}</label>
                                </div>
                            </div>
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <label> INDICE CORRECCIONES: {Number(_GET_TIME_BETWEEN_TWO_STATES(32, 32) / Math.abs((_fun_0_type_time[currentItem.type] ?? 45) - _GET_TIME_BETWEEN_TWO_STATES(5, 31))).toFixed(2) ?? 'NaN'}</label>
                                </div>
                            </div>
                        </div>

                        <div className="row text-center">
                            <label className="fw-bold"> DIAGRAMA DE GANTT.</label>
                        </div>
                        <div className="chart-clock">
                            <XYPlot width={2000} height={290} margin={{ bottom: 90, left: 100 }}
                                yPadding={20} xDomain={[0, 200]} yDomain={[0, 7]}
                                onMouseLeave={() => this.setState({ crosshairValues: [] })}

                            >
                                <VerticalGridLines
                                    tickValues={_tickValues}
                                    tickTotal={_tickValues.length}
                                />
                                <HorizontalGridLines
                                    tickValues={YtickValues}
                                    tickTotal={YtickValues.length}
                                />

                                <XAxis tickFormat={function tickFormat(value) {
                                    const date = dateParser_finalDate(date_start, value);
                                    if (value == 0) return moment(date_start, 'YYYY-MM-DD').format('MM-DD');
                                    return moment(date, 'YYYY-MM-DD').format('MM-DD');
                                }}
                                    tickValues={_tickValues}
                                    tickLabelAngle={-15}
                                    marginTop={40}
                                    style={{ fontSize: 12 }}
                                />
                                <XAxis tickFormat={function tickFormat(value) {
                                    const date = dateParser_finalDate(date_start, value);
                                    if (value == 0) return moment(date_start, 'YYYY-MM-DD').format('YYYY');
                                    return moment(date, 'YYYY-MM-DD').format('YYYY');
                                }}
                                    tickValues={_tickValues_2}
                                    tickLabelAngle={-15}
                                    marginTop={70}
                                    style={{ fontSize: 12 }}
                                />

                                <XAxis tickFormat={function tickFormat(value) {
                                    return value + ' d';
                                }}
                                    tickValues={_tickValues}
                                    style={{ fontSize: 12 }}
                                />

                                <YAxis tickValues={[0.25, 0.75, 1.25, 1.75, 2.25, 2.75, 3.25, 3.75, 4.25, 4.75, 5.25, 5.75, 6.25, 6.75]} tickFormat={(tick, i) => {
                                    let textArray = _GET_YAXIS_DATA();
                                    let text = textArray[i] ? textArray[i] : "";
                                    if (expand) {
                                        return text;
                                    }
                                }} />

                                {_CHART_PROGRESS_BAR()}
                                {/**
                                 *   {_CHART_MARKS_BLUE()}
                                {_CHART_MARKS_GREEN()}
                                {_CHART_MARKS_RED()}
                                 * 
                                 */}


                                <Crosshair values={[{ x: _today, y: 1 }]} style={{ line: { color: 'purple', width: '1px' } }}>
                                    <div className="text-white p-1" style={{ background: 'rgba(0,0,0,0.75)', width: '200px' }}>
                                        <div className="row">
                                            <label className="fw-bold">HOY</label>
                                            <label className="">En espera de: {_GET_NEXT_STEP().title}</label>
                                        </div>
                                    </div>
                                </Crosshair>

                                {GET_TIME_CLOCK(5, 1) ?
                                    <Crosshair values={[{ x: GET_TIME_CLOCK(5, 1), y: 1 }]} style={{ line: { color: 'purple', width: '1px' } }}>
                                        <div className="text-white p-1" style={{ background: 'rgba(0,0,0,0.75)', width: '200px', marginTop: '51px' }}>
                                            <div className="row">
                                                <label className="fw-bold">LyDF: {this._GET_CLOCKS_STATE(5).date_start}</label>
                                            </div>
                                        </div>
                                    </Crosshair>
                                    : null}

                                {GET_TIME_CLOCK(31, 1) ?
                                    <Crosshair values={[{ x: GET_TIME_CLOCK(31, 1), y: 1 }]} style={{ line: { color: 'purple', width: '1px' } }}>
                                        <div className="text-white p-1" style={{ background: 'rgba(0,0,0,0.75)', width: '200px', marginTop: '78px' }}>
                                            <div className="row">
                                                <label className="fw-bold">Not. Acta:  {this._GET_CLOCKS_STATE(31).date_start}</label>
                                            </div>
                                        </div>
                                    </Crosshair>
                                    : null}

                                {GET_TIME_CLOCK(49, 1) ?
                                    <Crosshair values={[{ x: GET_TIME_CLOCK(49, 1), y: 1 }]} style={{ line: { color: 'purple', width: '1px' } }}>
                                        <div className="text-white p-1" style={{ background: 'rgba(0,0,0,0.75)', width: '200px', marginTop: '105px' }}>
                                            <div className="row">
                                                <label className="fw-bold">Viavilidad:  {this._GET_CLOCKS_STATE(49).date_start}</label>
                                            </div>
                                        </div>
                                    </Crosshair>
                                    : null}


                                {this.state.hovered ?
                                    <Hint value={this.state.hovered}>
                                        {this.state.hovered.type != 'dest'
                                            ? <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', marginTop: '0%', width: '200px', fontSize: 'small' }}>
                                                {_GET_HINT_BODY(this.state.hovered ?? "")}
                                            </div>
                                            : <div />}
                                    </Hint>
                                    : null}

                                {this.state.hoveredCell ? (
                                    <Hint value={this.state.hoveredCell}>
                                        <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', fontSize: 'small' }}>
                                            <div className="row">
                                                {(this.state.hoveredCell.name).split('\n').map(function (name, index) {
                                                    return <div className="row"><label>{'>'} {name}</label></div>
                                                })}
                                            </div>
                                            <div className="row">
                                                <label>{dateParser(this.state.hoveredCell.date)}</label>
                                            </div>
                                        </div>
                                    </Hint>
                                ) : null}


                            </XYPlot>
                        </div>
                        <div className="row">
                            <div className="col d-flex justify-content-center">
                                <DiscreteColorLegend
                                    orientation="horizontal"
                                    items={[
                                        { color: 'ForestGreen', title: 'TIEMPO USUARIO', strokeWidth: 10 },
                                        { color: 'DodgerBlue', title: 'TIEMPO CURADURIA', strokeWidth: 10 },
                                        //{ color: 'Gold', title: 'EXPEDICION: ', strokeWidth: 10 },
                                        { color: 'Crimson', title: 'TIEMPO DESISTIMIENTO:', strokeWidth: 10 },
                                        { color: 'Darkgrey', title: `TIEMPO PROYECTADO:`, strokeWidth: 10 },
                                    ]}
                                />

                            </div>
                        </div>
                    </> : ""}

            </div >
        );
    }
}

export default FUN_CLOCK_CHART;