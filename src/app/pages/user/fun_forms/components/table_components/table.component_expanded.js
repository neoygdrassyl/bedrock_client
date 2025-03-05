import ReactTagInput from '@pathofdev/react-tag-input';
import React, { useEffect, useState } from 'react';
import FUN_SERVICE from '../../../../../services/fun.service';
import USER_SERVICE from '../../../../../services/users.service';
import RECORD_LAW_SERVICE from '../../../../../services/record_law.service';
import RECORD_ENG_SERVICE from '../../../../../services/record_eng.service';
import RECORD_ARC_SERVICE from '../../../../../services/record_arc.service';
import RECORD_PH_SERVICE from '../../../../../services/record_ph.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { dateParser_dateDiff, dateParser_finalDate, dateParser_timePassed, regexChecker_isOA, regexChecker_isOA_2, regexChecker_isPh } from '../../../../../components/customClasses/typeParse';
import { MDBBtn } from 'mdb-react-ui-kit';


const MySwal = withReactContent(Swal);
const moment = require('moment')

export default function TABLE_COMPONENT_EXPANDED(props) {
    const { currentItem, swaMsg, worker_list, lenghtL, dataL, date_start, date_end } = props;

    var [clocks, setClocks] = useState([])
    var [ncl, setncl] = useState(false)
    var [nca, setnca] = useState(false)
    var [nce, setnce] = useState(false)
    var [load, setLoad] = useState(0)
    var [editDate, setEditsDates] = useState([])
    var [loadItem, setLoadItem] = useState(false)
    var [loadWorkers, setLoadWorkers] = useState(worker_list)
    const getTags = () => loadItem ? loadItem.tags ? loadItem.tags.split(',') : [] : [];
    var [tags, setTags] = useState(getTags())

    const rules = loadItem ? loadItem.rules ? loadItem.rules.split(';') : [] : [];
    const row = loadItem;
    const CellStylesJUR = { backgroundColor: 'LemonChiffon' }
    const CellStylesENG = { backgroundColor: 'LavenderBlush' }
    const CellStylesARQ = { backgroundColor: 'LightCyan' }
    const _fun_0_type_days_matrix = {
        'i': { 'law': 1, 'arc': 2, 'eng': 2 },
        'ii': { 'law': 1, 'arc': 3, 'eng': 3 },
        'iii': { 'law': 1, 'arc': 4, 'eng': 4 },
        'iv': { 'law': 1, 'arc': 5, 'eng': 5 },
        'oa': { 'law': 1, 'arc': 1, 'eng': 0 },
        '0': { 'law': 1, 'arc': 1, 'eng': 0 },
    }
    const _fun_0_type_days = { 'i': 4, 'ii': 6, 'iii': 8, 'iv': 10, 'oa': 2, '0': 10 };
    const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15, '0': 45 };
    const ci = row => !_fun_0_type_days[row.type] ? <label className='fw-bold text-danger'>?</label> : '';

    useEffect(() => {
        if (load === 0) {
            setLoad(1)
            loadAsignClocks(currentItem.id);
            getCurrentItem(currentItem.id);
        }
    }, [clocks, load, loadItem]);

    // ***************************  DATA GETTERS *********************** //
    let _GET_CLOCK = () => {
        var _CHILD = clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_WORKER_BY_ID = (_ID) => {
        let _workers = loadWorkers;
        for (var i = 0; i < _workers.length; i++) {
            if (_workers[i].id == _ID) return `${_workers[i].name} ${_workers[i].surname}`
        }
        return '';
    }
    let myDataWorkers = () => {
        const workersNames_bundle = []
        var vals = [];
        var vals_p = []
        let _workers = loadWorkers;
        let items = dataL;

        for (var i = 0; i < _workers.length; i++) {
            workersNames_bundle.push(_workers[i].name + ' ' + _workers[i].surname);
            vals.push(0);
            vals_p.push(0);
        }

        for (var i = 0; i < items.length; i++) {
            var workersNames_bundle_toCheck = [];
            if (regexChecker_isPh(items[i], true)) {
                if (items[i].asign_ph_law_worker_name) workersNames_bundle_toCheck.push(items[i].asign_ph_law_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                if (items[i].asign_ph_arc_worker_name) workersNames_bundle_toCheck.push(items[i].asign_ph_arc_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
            } else {
                if (items[i].asign_law_worker_name) workersNames_bundle_toCheck.push(items[i].asign_law_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                if (items[i].asign_eng_worker_name) workersNames_bundle_toCheck.push(items[i].asign_eng_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                if (items[i].asign_arc_worker_name) workersNames_bundle_toCheck.push(items[i].asign_arc_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
            }
            for (var j = 0; j < workersNames_bundle.length; j++) {
                let nameToCheck = workersNames_bundle[j].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
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
    function retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                setLoadItem(response.data)
            })
            .catch(e => {
                console.log(e);
                setLoad(false)
            });
    }
    // *************************  DATA CONVERTERS ********************** //
    let _GET_CLOCK_STATE = (_state) => {
        var _CLOCK = _GET_CLOCK();
        if (_state == null) return false;
        console.log(_CLOCK)
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }
    let _GET_CLOCK_STATE_VERSION = (_state, version) => {
        var _CLOCK = _GET_CLOCK();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state && _CLOCK[i].version == version) return _CLOCK[i];
        }
        return false;
    }
    let prof = (state, isOA) => {
        if (state == 11 && isOA) return loadItem.asign_ph_law_worker_name;
        if (state == 11 && !isOA) return loadItem.asign_law_worker_name;

        if (state == 13 && isOA) return loadItem.asign_ph_arc_worker_name;
        if (state == 13 && !isOA) return loadItem.asign_arc_worker_name;

        if (state == 12) return loadItem.asign_eng_worker_name;
    }

    let _GET_REVIEW = (_REVIEW) => {
        let res = {
            '-1': <label className=" me-1"><i class="far fa-dot-circle" style={{ fontSize: '150%' }}></i></label>,
            '0': <label className="fw-bold text-danger me-1"><i class="far fa-times-circle" style={{ fontSize: '150%' }}></i></label>,
            '1': <label className="fw-bold text-success  me-1"><i class="far fa-check-circle" style={{ fontSize: '150%' }}></i></label>,
            '2': <label className="fw-bold text-warning  me-1"><i class="far fa-stop-circle" style={{ fontSize: '150%' }}></i></label>,
        }

        return res[_REVIEW] ?? res['-1']
    }
    let _GET_REVIEW_ENG = (_REVIEW) => {
        let revies = _REVIEW ? Array.isArray(_REVIEW) ? _REVIEW : _REVIEW.split(',') : ['-1', '-1'];
        let res = {
            '-1': <label className=" me-1"><i class="far fa-dot-circle"></i></label>,
            '0': <label className="fw-bold text-danger  me-1"><i class="far fa-times-circle"></i></label>,
            '1': <label className="fw-bold text-success  me-1"><i class="far fa-check-circle"></i></label>,
            '2': <label className="fw-bold text-warning  me-1"><i class="far fa-stop-circle"></i></label>,
        }
        return revies.map((value, index) => <label>R. {index + 1}: {res[value] ?? res['-1']}</label>)

    }
    let _GET_MAX_DATE = (row, value, index, state) => {
        let type = row.type ?? 0
        let days;
        let start_date = value || row.clock_date

        let daysRev = _fun_0_type_time[loadItem.type] ?? 45;
        let daysActa = dateParser_dateDiff(loadItem.clock_date, loadItem.clock_not_1 ?? loadItem.clock_not_2 ?? false);
        let daysLeft = 0;
        if (daysActa) daysLeft = daysRev - daysActa

        if (index == 0) {
            if (state == 11) days = _fun_0_type_days_matrix[type]['law'];
            if (state == 12) days = _fun_0_type_days_matrix[type]['eng'];
            if (state == 13) days = _fun_0_type_days_matrix[type]['arc'];
        };
        if (index == 1) { start_date = row.clock_not_1 ?? row.clock_not_2 ?? false; days = 13 }
        if (index == 2) { start_date = row.clock_not_1 ?? row.clock_not_2 ?? false; days = 26 }
        if (index == 3) { start_date = row.clock_not_1 ?? row.clock_not_2 ?? false; days = (row.clock_record_postpone ? 30 : 45) + daysLeft }

        return <>{dateParser_finalDate(start_date, days)}</>
    }
    let _GET_DAYS = (value, review, index, state) => {
        let type = row.type ?? 0
        let days;
        let start_date = value ?? row.clock_date
        if (index == 0) {
            if (state == 11) days = _fun_0_type_days_matrix[type]['law'];
            if (state == 12) days = _fun_0_type_days_matrix[type]['eng'];
            if (state == 13) days = _fun_0_type_days_matrix[type]['arc'];
        };
        if (index == 1) { start_date = row.clock_not_0; days = 13 }
        if (index == 2) { start_date = row.clock_not_0; days = 13 }
        if (index == 3) { start_date = row.clock_not_0; days = row.clock_record_postpone ? 20 : 4 }
        let diff = dateParser_dateDiff(review, value, true)
        return <>
            <label> <label className={diff < 0 ? 'text-success fw-bold' : diff > days ? 'text-danger' : ''}>{diff}</label>
                / {days}
            </label>
        </>
    }

    let _TABLE_GET_VERSION = (row, state) => {
        if (state == 11) return regexChecker_isPh(row, true) ? row.ph_version : row.clock_asign_law ? row.clock_asign_law.split(';').length : row.jur_version;
        if (state == 12) return row.clock_asign_eng ? row.clock_asign_eng.split(';').length : row.eng_version;
        if (state == 13) return regexChecker_isPh(row, true) ? row.ph_version : row.clock_asign_arc ? row.clock_asign_arc.split(';').length : row.arc_version;
    }
    let _TABLE_GET_ASIGN_ID = (row, state) => {
        if (state == 11) return regexChecker_isPh(row, true) ? row.sign_ph_law_worker_id : row.asign_law_worker_id;
        if (state == 12) return row.asign_eng_worker_id;
        if (state == 13) return regexChecker_isPh(row, true) ? row.sign_ph_arc_worker_id : row.asign_arc_worker_id;
    }
    let _TABLE_GET_ASIGN_NAME = (row, state) => {
        if (state == 11) return regexChecker_isPh(row, true) ? row.asign_ph_law_worker_name : row.asign_law_worker_name;
        if (state == 12) return row.asign_eng_worker_name;
        if (state == 13) return regexChecker_isPh(row, true) ? row.asign_ph_arc_worker_name : row.asign_arc_worker_name;
    }
    let _TABLE_GET_ASIGN_DATE = (row, state) => {
        if (state == 11) return regexChecker_isPh(row, true) ? row.asign_ph_law_date : row.asign_law_date;
        if (state == 12) return row.asign_eng_date;
        if (state == 13) return regexChecker_isPh(row, true) ? row.asign_ph_arc_date : row.asign_arc_date;
    }
    let _TABLE_GET_DATE_MAX = (row, state) => {
        if (state == 11) return !regexChecker_isPh(row, true)
            ? dateParser_finalDate(row.asign_law_date, _fun_0_type_days[row.type] ?? 5)
            : dateParser_finalDate(row.asign_ph_law_date, _fun_0_type_days[row.type] ?? 5);
        if (state == 12) return dateParser_finalDate(row.asign_eng_date, _fun_0_type_days[row.type] ?? 5);
        if (state == 13) return !regexChecker_isPh(row, true)
            ? dateParser_finalDate(row.asign_arc_date, _fun_0_type_days[row.type] ?? 5)
            : dateParser_finalDate(row.asign_ph_arc_date, _fun_0_type_days[row.type] ?? 5);
    }
    let _TABLE_GET_DATE_REV = (row, state) => {
        if (state == 11) return regexChecker_isPh(row, true) ? row.ph_date_law : row.jur_date
        if (state == 12) return row.eng_date;
        if (state == 13) return regexChecker_isPh(row, true) ? row.ph_date_arc : row.arc_date;
    }
    let _TABLE_GET_DAYS = (row, state) => {
        if (state == 11) {
            let diff = dateParser_dateDiff(
                regexChecker_isPh(row, true) ? row.ph_date_law : row.jur_date,
                regexChecker_isPh(row, true) ? row.asign_ph_law_date : row.asign_law_date
                , true)
            return diff
        };
        if (state == 12) return dateParser_dateDiff(row.eng_date, row.asign_eng_date, true);
        if (state == 13) {
            let diff = dateParser_dateDiff(
                regexChecker_isPh(row, true) ? row.ph_date_arc : row.arc_date,
                regexChecker_isPh(row, true) ? row.asign_ph_arc_date : row.asign_arc_date
                , true)
            return diff
        };
    }
    let _TABLE_GET_REV = (row, state) => {
        if (state == 11) return regexChecker_isPh(row, true) ? _GET_REVIEW(row.ph_review_law) : _GET_REVIEW(row.jur_review);
        if (state == 12) return _GET_REVIEW_ENG([row.eng_review, row.eng_review_2]);
        if (state == 13) return regexChecker_isPh(row, true) ? _GET_REVIEW(row.ph_review) : _GET_REVIEW(row.arc_review);
    }
    // ******************************* JSX ***************************** // 
    let REVIEW_HEADER = (title, style, state) => {
        let roleFilter = [];
        if (state == 11) roleFilter = [2, 5];
        if (state == 12) roleFilter = [2, 4];
        if (state == 13) roleFilter = [2, 6];

        return <>
            <div className='row text-center' style={style}>
                <div className='col'>
                    <h5 className=''>{title}:</h5>
                </div>
                <div className='col'>
                    <div class="input-group input-group-sm">
                        {state ? _WORKERS_SELECT(_TABLE_GET_ASIGN_ID(loadItem, state), state, loadItem, roleFilter) : ''}
                    </div>
                </div>
            </div>
        </>
    }
    let REVIEW_CLOCKS = (state) => {
        var clocks_asign = _GET_CLOCK_STATE_VERSION(state, 100);
        var clocks_reviews = _GET_CLOCK_STATE_VERSION(state, 200);
        var clocks_inform = _GET_CLOCK_STATE_VERSION(state, 300);
        var defaultRevew = false;

        var asigns = clocks_asign.date_start ? clocks_asign.date_start.split(';') : [_TABLE_GET_ASIGN_DATE(loadItem, state)];
        var informs = clocks_inform.date_start ? clocks_inform.date_start.split(';') : [];


        if (state == 11) defaultRevew = regexChecker_isPh(row, true) ? row.ph_review_law : row.jur_review;
        if (state == 13) defaultRevew = regexChecker_isPh(row, true) ? row.ph_review : row.arc_review;
        if (state == 12) defaultRevew = !regexChecker_isPh(row, true) ? [row.eng_review, row.eng_review_2] : false;


        var clocks_process = ['Acta Observaciones',]
        if (row.rec_review == 0) clocks_process = ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Revision de Correcciones',]
        var reviews_date = clocks_reviews.date_start ? clocks_reviews.date_start.split(';') : [_TABLE_GET_DATE_REV(loadItem, state)];
        var reviews_check = clocks_reviews.resolver_context ? clocks_reviews.resolver_context.split(';') : [_TABLE_GET_REV(loadItem, state)];

        return <>
            <div className='row text-center'>
                <div className='col-1 border'><h6 className='py-1'> # </h6></div>
                <div className='col border'><h6 className='py-1'> EVENTO </h6></div>
                <div className='col border'><h6 className='py-1'> PROFESIONAL </h6></div>
                <div className='col border'><h6 className='py-1'>FECHA ASI</h6></div>
                <div className='col border'><h6 className='py-1'>FECHA MAX</h6></div>
                <div className='col border'><h6 className='py-1'>FECHA REV</h6></div>
                <div className='col-1 border'><h6 className='py-1'>DÍAS</h6></div>
                <div className='col-1 border'><h6 className='py-1'>RESULTADO</h6></div>
                <div className='col border'><h6 className='py-1'>FECHA INF</h6></div>
                <div className='col-1 border'><h6 className='py-1'>ACCIÓN</h6></div>
            </div>
            {clocks_process.map((value, index) => {
                let asignDate = asigns[index]
                let inforDate = informs[index]
                return <div className='row text-center'>
                    <div className='col-1 border'><h6 className='py-1 fw-normal'>{index + 1} </h6></div>
                    <div className='col border'><h6 className='py-1 fw-normal'> {value} </h6></div>
                    <div className='col border'><h6 className='py-1 fw-normal'> {prof(state, regexChecker_isPh(row, true))}</h6></div>
                    <div className='col border'><h6 className='py-1 fw-normal'>{editDate[index + '_' + state] ?
                        <div class="input-group input-group-sm">
                            <input type="date" class="form-control input-sm" id={'new_asign_date_' + state} defaultValue={asignDate}
                                onBlur={(e) => edit_clock(state, asigns, e.target.value, index, 100)} />
                        </div>
                        : asignDate}</h6></div>
                    <div className='col border'><h6 className='py-1 fw-normal'>{_GET_MAX_DATE(loadItem, asignDate, index, state)} {ci(row)}</h6></div>
                    <div className='col border'><h6 className='py-1 fw-normal'>{reviews_date[index] ?? ''}   {ci(row)}</h6></div>
                    <div className='col-1 border'><h6 className='py-1 fw-normal'>{_GET_DAYS(asignDate, reviews_date[index], index, state)}   {ci(row)}</h6></div>
                    <div className='col-1 border'><h6 className='py-1 fw-normal'>{
                        state == 12
                            ? _GET_REVIEW_ENG(index == 0 ? defaultRevew ?? reviews_check[index] : reviews_check[index])
                            : _GET_REVIEW(index == 0 ? defaultRevew ?? reviews_check[index] : reviews_check[index])}</h6></div>
                    <div className='col border'><h6 className='py-1 fw-normal'>{editDate[index + '_' + state] ?
                        <div class="input-group input-group-sm">
                            <input type="date" class="form-control input-sm" id={'new_inform_date_' + state} defaultValue={inforDate}
                                onBlur={(e) => edit_clock(state, informs, e.target.value, index, 300)} />
                        </div>
                        : inforDate}</h6></div>
                    <div className='col-1 border'>
                        <MDBBtn floating tag='a' size='sm' className='me-1' color='secondary' outline={editDate[index + '_' + state]}
                            onClick={() => setEditsDates({ [index + '_' + state]: !editDate[index + '_' + state] })}><i class="far fa-edit"></i></MDBBtn>
                    </div>
                </div>
            })}
        </>
    }

    let NEW_CLOCK = (state) => {
        return <>
            <div className='row text-center py-1'>
                <div className='col'>
                    <button className='btn btn-sm btn-info' onClick={() => {
                        if (state == 11) setncl(!ncl);
                        if (state == 12) setnce(!nce);
                        if (state == 13) setnca(!nca);
                    }}><label><i class="fas fa-plus-circle"></i> NUEVA</label></button>
                </div>
                <div className='col-4'>
                    {(state == 11 && ncl) || (state == 12 && nce) || (state == 13 && nca) ?
                        <div className='row text-center py-2'>
                            <div className='col'>
                                <div class="input-group input-group-sm"> <div class="input-group-prepend">
                                    <span class="input-group-text">Fecha Asignación</span>
                                </div><input type="date" class="form-control input-sm" id={'asign_date_' + state} /></div>
                            </div>
                        </div>
                        : ''}
                </div>
                <div className='col'>
                    {(state == 11 && ncl) || (state == 12 && nce) || (state == 13 && nca) ?
                        <button className='btn btn-sm btn-success' onClick={() => {
                            var date = document.getElementById('asign_date_' + state).value;
                            if (!date) return;
                            save_clock(state, date)
                        }}><label><i class="fas fa-life-ring"></i> ASIGNAR</label></button>
                        : ''}

                </div>
                <div className='col'>
                    {(state == 11 && ncl) || (state == 12 && nce) || (state == 13 && nca) ?
                        <button className='btn btn-sm btn-danger' onClick={() => {
                            if (state == 11) setncl(false);
                            if (state == 12) setnce(false);
                            if (state == 13) setnca(false);
                        }}><label><i class="fas fa-times-circle"></i> CANCELAR</label></button>
                        : ''}

                </div>
            </div>


        </>
    }
    let INFO = () => {
        let daysActa = dateParser_dateDiff(loadItem.clock_date, loadItem.clock_not_1 ?? loadItem.clock_not_2 ?? moment().format('YYYY-MM-DD'));
        let daysRev = _fun_0_type_time[loadItem.type] ?? 45
        return <>
            {REVIEW_HEADER('INFORMACIÓN GENERAL ' + loadItem.id_public, { backgroundColor: 'Gainsboro' })}
            <div className='row text-center'>
                <div className='col border '><h6 className='py-1 fw-normal'> FECHA LyDF</h6></div>
                <div className='col border'><h6 className='py-1 fw-bold'>{loadItem.clock_date}</h6></div>
            </div>
            <div className='row text-center'>
                <div className='col border '><h6 className='py-1 fw-normal'> FECHA MAX ACTA</h6></div>
                <div className='col border'><h6 className='py-1 fw-bold'>{
                    <>
                        <label>{dateParser_finalDate(loadItem.clock_date, daysRev)}</label>
                        {!_fun_0_type_days[loadItem.type] ? <label className='fw-bold text-danger'>?</label> : ''}
                    </>
                }</h6></div>
            </div>
            <div className='row text-center'>
                <div className='col border '><h6 className='py-1 fw-normal'> FECHA ACTA</h6></div>
                <div className='col border'><h6 className='py-1 fw-bold'>{
                    <>
                        <label>{loadItem.clock_record_p1}</label>
                    </>
                }</h6></div>
            </div>
            <div className='row text-center'>
                <div className='col border '><h6 className='py-1 fw-normal'> DÍAS ACTA OBS</h6></div>
                <div className='col border'><h6 className='py-1 fw-bold'>
                    <label>
                        <label className={daysActa > daysRev ? 'text-danger' : ''}>{daysActa}</label>
                        / {daysRev}
                        {!_fun_0_type_days[loadItem.type] ? <label className='fw-bold text-danger'>?</label> : ''}</label>
                </h6></div>
            </div>
            <div className='row text-center'>
                <div className='col border '><h6 className='py-1 fw-normal'>FECHA DE NOTIFICACIÓN</h6></div>
                <div className='col border'><h6 className='py-1 fw-bold'>{
                    loadItem.clock_not_1 ??
                    loadItem.clock_not_2 ??
                    <label className='text-danger'>NO SE HA NOTIFICADO EL ACTA DE OBSERVACIONES</label>
                }</h6></div>
            </div>
            {loadItem.rec_review == 0 ?
                <>
                    <div className='row text-center'>
                        <div className='col border '><h6 className='py-1 fw-normal'>DÍAS RESTANTES ACTA DE CORR.</h6></div>
                        <div className='col border'><h6 className='py-1 fw-bold'>
                            <label>
                                <label className={daysActa > daysRev ? 'text-danger' : ''}>{(daysRev) - daysActa}</label>
                                {!_fun_0_type_days[loadItem.type] ? <label className='fw-bold text-danger'>?</label> : ''}</label>
                        </h6></div>
                    </div>

                    <div className='row text-center'>
                        <div className='col border '><h6 className='py-1 fw-normal'>FECHA LIMITE ENTREGA CORR.</h6></div>
                        <div className='col border'><h6 className='py-1 fw-bold'>
                            <label>
                                {dateParser_finalDate(loadItem.clock_not_1 ?? loadItem.clock_not_2 ?? false, _GET_CLOCK_STATE(34).date_start ? 45 : 30)}
                            </label>
                        </h6></div>
                    </div>

                    <div className='row text-center'>
                        <div className='col border '><h6 className='py-1 fw-normal'>¿PRORROGA?</h6></div>
                        <div className='col border'><h6 className='py-1 fw-bold'>{
                            _GET_CLOCK_STATE(34).date_start ?? 'NO'
                        }</h6></div>
                    </div>

                    <div className='row text-center'>
                        <div className='col border '><h6 className='py-1 fw-normal'>ENTREGA CORRECCIONES</h6></div>
                        <div className='col border'><h6 className='py-1 fw-bold'>{
                            _GET_CLOCK_STATE(35).date_start ?? 'NO'
                        }</h6></div>
                    </div>

                    {(_GET_CLOCK_STATE(32).date_start ?? _GET_CLOCK_STATE(33).date_start) && _GET_CLOCK_STATE(35).date_start ?
                        <div className='row text-center'>
                            <div className='col border '><h6 className='py-1 fw-normal'>TIEMPO EN ENTREGAR CORRECCIONES</h6></div>
                            <div className='col border'><h6 className='py-1 fw-bold'>{
                                dateParser_dateDiff(_GET_CLOCK_STATE(32).date_start ?? _GET_CLOCK_STATE(33).date_start, _GET_CLOCK_STATE(35).date_start)
                            }</h6></div>
                        </div>

                        : ''}

                </> : ''}

            <div className='row text-center'>
                <div className='col border '><h6 className='py-1 fw-normal'>ETIQUETAS</h6></div>
                <div className='col border'><h6 className='py-1 fw-bold'>{
                    <ReactTagInput
                        tags={tags}
                        onChange={(newTags) => saveTags(newTags)}
                        placeholder="Etiquetas de la solicitud"
                        removeOnBackspace={true}
                    />
                }</h6></div>
            </div>


        </>
    }


    let REVIEW_LAW = () => {

        return <>
            {REVIEW_HEADER('REVISION JURÍDICA', CellStylesJUR, 11)}
            {REVIEW_CLOCKS(11)}
        </>
    }

    let REVIEW_ARC = () => {

        return <>
            {REVIEW_HEADER('REVISION ARQUITECTÓNICA', CellStylesARQ, 13)}
            {REVIEW_CLOCKS(13)}
        </>
    }

    let REVIEW_ENG = () => {

        return <>
            {REVIEW_HEADER('REVISION ESTRUCTURAL', CellStylesENG, 12)}
            {REVIEW_CLOCKS(12)}
        </>
    }

    let _WORKERS_SELECT = (_defaultValue, state, row, roleFilter = []) => {
        let reportType = '';
        if (state == 11) regexChecker_isPh(row, true) ? reportType = 'phl' : reportType = 'law';
        if (state == 12) reportType = 'eng';
        if (state == 13) regexChecker_isPh(row, true) ? reportType = 'pha' : reportType = 'arc';

        let paretnId = null;
        if (state == 11) regexChecker_isPh(row, true) ? paretnId = row.ph_id : paretnId = row.jur_id;
        if (state == 12) paretnId = row.end_id;
        if (state == 13) regexChecker_isPh(row, true) ? paretnId = row.ph_id : paretnId = row.arc_id;
        return <select className='form-select' defaultValue={_defaultValue} onChange={(e) => asignWorker(e.target.value, paretnId, reportType, row)}>
            <option value="">SIN ASIGNAR</option>
            {loadWorkers.map((value) => {
                if (value.active == 0) return;

                let workerLoad = 0;
                let workerLoad_p = 0;
                let total = lenghtL ?? 0
                let workersLoad = myDataWorkers();
                let workerName = value.name + ' ' + value.surname
                workersLoad.map(value2 => { if (value2.name.includes(workerName)) workerLoad = value2.val; })
                workerLoad_p = (workerLoad / total * 100).toFixed(2)

                if (roleFilter.length > 0) {
                    if (roleFilter.includes(value.roleId)) return <option value={value.id}>{workerName}</option>
                }
                else return <option value={value.id}>{workerName}</option>
            })}
        </select>
    }

    // ******************************* APIS **************************** // 
    function retrieveWorkerList() {
        USER_SERVICE.getAll()
            .then(response => {
                setLoadWorkers(response.data)
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
            });
    }


    let getCurrentItem = (id) => {
        FUN_SERVICE.loadMacroSingle(date_start, date_end, id)
            .then(response => {
                console.log(response.data)
                setLoadItem(response.data[0]);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
            });
    }

    let saveTags = (tags, useMySwal = false) => {
        let formData = new FormData();
        setTags(tags)
        formData.set('tags', tags.join(','));

        if (useMySwal) MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        FUN_SERVICE.update(loadItem.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    if (useMySwal) MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    getCurrentItem(loadItem.id);
                } else {
                    if (useMySwal) MySwal.fire({
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

    let loadAsignClocks = (id) => {
        FUN_SERVICE.loadAllClocks(id)
            .then(response => {
                if (response.data) {
                    setClocks(response.data)
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
                setLoad(true)
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });

    }

    let save_clock = (state, date) => {
        var _CLOCK = _GET_CLOCK_STATE_VERSION(state, 100);


        if (!prof(state)) return MySwal.fire({
            title: 'NO SE PUEDE ASIGNAR',
            text: 'Para asignar esta solicitud se debe asignar a un profesional primero',
            icon: 'error',
            confirmButtonText: swaMsg.text_btn,
        });

        var date_start = [];
        if (_CLOCK) date_start = _CLOCK.date_start.split(';');
        date_start.push(date)
        let formDataClock = new FormData();
        formDataClock.set('date_start', date_start.join(';'));
        formDataClock.set('name', "Asignacion de solicitud");
        formDataClock.set('desc', `Esta solicitud ha sido asignada al profesional ${prof(state)}`);
        formDataClock.set('state', state);
        formDataClock.set('version', 100);

        manage_clock(true, state, formDataClock);
    }

    let edit_clock = (state, clocks, date, index, version) => {
        let newClocks = clocks;
        newClocks[index] = date;
        //return console.log(newClocks)
        let formDataClock = new FormData();
        formDataClock.set('date_start', newClocks.join(';'));

        manage_clock(false, state, formDataClock, version, false);
    }

    let delete_asgin = (index, clocks, state, reviews) => {
        MySwal.fire({
            title: "ELIMINAR ESTE ITEM",
            text: "¿Esta seguro de eliminar de forma permanente este item?",
            icon: 'question',
            confirmButtonText: "ELIMINAR",
            showCancelButton: true,
            cancelButtonText: "CANCELAR"
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                let oldClocks = clocks;
                let newClocks = oldClocks.splice(index, 1);
                let formDataClock = new FormData();
                //return console.log(index, newClocks, oldClocks)
                formDataClock.set('date_start', oldClocks.join(';'));
                manage_clock(true, state, formDataClock)

                let oldClocksR = reviews[0];
                oldClocksR.splice(index, 1);
                let oldClocksC = reviews[1];
                oldClocksC.splice(index, 1);

                formDataClock = new FormData();
                formDataClock.set('date_start', oldClocks.join(';'));
                formDataClock.set('resolver_context', oldClocksC.join(';'));
                manage_clock(false, state, formDataClock, 200)
            }
        });

    }


    let manage_clock = (useMySwal, findOne, formDataClock, version = 100, reloadPage = true) => {
        var _CHILD = _GET_CLOCK_STATE_VERSION(findOne, version);

        formDataClock.set('fun0Id', loadItem.id);
        if (useMySwal) {
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
        }

        if (_CHILD.id) {
            FUN_SERVICE.update_clock(_CHILD.id, formDataClock)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                        getCurrentItem(currentItem.id);
                        loadAsignClocks(currentItem.id);
                    } else {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                });
        }
        else {
            formDataClock.set('version', version);
            formDataClock.set('state', findOne);
            FUN_SERVICE.create_clock(formDataClock)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                        getCurrentItem(currentItem.id);
                        loadAsignClocks(currentItem.id);
                    } else {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                });
        }

    }
    var formData = new FormData();
    function asignWorker(workerId, childId, reportType, row) {
        formData = new FormData();
        if (!childId) {
            formData.set('fun0Id', row.id);
            formData.set('version', 1);
        }
        if (reportType == 'phl') {
            formData.set('worker_asign_law_id', workerId);
            formData.set('worker_asign_law_name', _GET_WORKER_BY_ID(workerId));
            manage_record_ph(childId, true);
        }
        else if (reportType == 'pha') {
            formData.set('worker_asign_arc_id', workerId);
            formData.set('worker_asign_arc_name', _GET_WORKER_BY_ID(workerId));
            manage_record_ph(childId, true);
        } else {
            formData.set('worker_id', workerId);
            formData.set('worker_name', _GET_WORKER_BY_ID(workerId));
            if (reportType == 'law') manage_record_law(childId, true);
            if (reportType == 'eng') manage_record_eng(childId, true);
            if (reportType == 'arc') manage_record_arc(childId, true);
        }
    }

    let manage_record_ph = (childId, reloadPage) => {
        if (childId) {
            RECORD_PH_SERVICE.update(childId, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        getCurrentItem(currentItem.id);
                        loadAsignClocks(currentItem.id);
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
        } else {
            RECORD_PH_SERVICE.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (reloadPage) getCurrentItem(loadItem.id);
                        retrieveWorkerList();
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

    }
    let manage_record_law = (childId, reloadPage) => {
        if (childId) {
            RECORD_LAW_SERVICE.update(childId, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        getCurrentItem(currentItem.id);
                        loadAsignClocks(currentItem.id);
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
        } else {
            RECORD_LAW_SERVICE.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (reloadPage) getCurrentItem(loadItem.id);
                        retrieveWorkerList();
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

    }
    let manage_record_eng = (childId, reloadPage) => {
        if (childId) {
            RECORD_ENG_SERVICE.update(childId, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        getCurrentItem(currentItem.id);
                        loadAsignClocks(currentItem.id);
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
        } else {
            RECORD_ENG_SERVICE.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (reloadPage) getCurrentItem(loadItem.id);
                        retrieveWorkerList();
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

    }
    let manage_record_arc = (childId, reloadPage) => {
        if (childId) {
            RECORD_ARC_SERVICE.update(childId, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        getCurrentItem(currentItem.id);
                        loadAsignClocks(currentItem.id);
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
        } else {
            RECORD_ARC_SERVICE.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (reloadPage) getCurrentItem(loadItem.id);
                        retrieveWorkerList();
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

    }

    return (<div className=''>
        <div className='row' >
            {loadItem ? <>
                {INFO()}
                <div className='row'>
                    {REVIEW_LAW()}
                </div>
                <div className='row'>
                {!regexChecker_isOA_2(loadItem)?
                    REVIEW_ARC()
                    : ''}
                </div>
                {!regexChecker_isPh(loadItem, true) && !regexChecker_isOA_2(loadItem) && rules[1] != 1 ?
                    <div className='row'>
                        {REVIEW_ENG()}
                    </div> : ''}
            </> : <label className='fw-bold ms-5'>CARGANDO...</label>}

        </div>
    </div>);
}
