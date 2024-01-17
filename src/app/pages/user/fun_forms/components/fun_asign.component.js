import React, { useEffect, useState, useCallback } from 'react';
import FUN_SERVICE from '../../../../services/fun.service';
import USER_SERVICE from '../../../../services/users.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MDBBtn, MDBPopover, MDBPopoverBody, MDBTooltip } from 'mdb-react-ui-kit';
import { dateParser_dateDiff, dateParser_timePassed, regexChecker_isOA_2, regexChecker_isPh, VR_DOCUMENTS_OF_INTEREST } from '../../../../components/customClasses/typeParse';
import TABLE_COMPONENT_EXPANDED from './table_components/table.component_expanded';
import HeatMap from '@uiw/react-heat-map';
import { infoCud, nomens } from '../../../../components/jsons/vars';
import { Badge, Calendar, Popover, Tag, TagGroup, Whisper } from 'rsuite';
import Modal from 'react-modal';
import FUN_ASIGNS_HISTORY_COMPONENT from './fun_asign_history.component';

const customStylesForModal = {
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
};

export default function FUN_ASIGNS_COMPONENT(props) {
    const { swaMsg, translation, globals } = props;

    const MySwal = withReactContent(Swal);
    const moment = require('moment');
    const Colors = ['#ffc38f', '#ff8f93', '#c38fff', '#8f93ff', '#8ffffb', '#8fffc3', '#cbf071', '#fffb8f']
    const matrixLoad = {
        'i': { law: 1, arc: 2, eng: 2 },
        'ii': { law: 1, arc: 3, eng: 3 },
        'iii': { law: 1, arc: 4, eng: 4 },
        'iv': { law: 1, arc: 5, eng: 5 },
        'oa': { law: 1, arc: 1, eng: 1 },
        '0': { law: 1, arc: 1, eng: 1 },
    }
    const dailyLoad = 4;
    const LoadTitleShort = { 'law': 'J', 'arc': 'A', 'eng': 'E' }
    const LoadTypeShort = { 'i': 'I', 'ii': 'II', 'iii': 'III', 'iv': 'IV', 'oa': 'OA', '0': 'III' }


    var [id1, setId1] = useState(`${nomens}${moment().subtract(1, 'year').format('YY')}-0000`);
    var [id2, setId2] = useState(`${nomens}${moment().format('YY')}-9999`);
    var [data, setData] = useState([])
    var [dataW, setDataW] = useState([])
    var [dataHM, setDataHM] = useState([])
    var [index, setIndex] = useState({})
    var [currenItem, setCurrentItem] = useState(null)
    var [load, setLoad] = useState(false)
    var [load2, setLoad2] = useState(false)
    var [load3, setLoad3] = useState(true)
    var [selectedBtn, setSbtn] = useState(null)
    var [filter, setFilter] = useState('')
    var [filterLaw, setFilterLaw] = useState(true);
    var [filterArc, setFilterArc] = useState(true);
    var [filterEng, setFilterEng] = useState(true);
    var [filterState, setFilterState] = useState(true);
    var [worker_list, setWorker_list] = useState([]);
    var [modal, setModal] = useState(false);
    var [modalF, setModalF] = useState(false);
    var [currentProf, setCurrentProf] = useState('');

    useEffect(() => {
        if (!load) { retrieveMacro(); retrieveWorker() }
        if (data.length > 0 && !load2) curateDataW();
        if (!load3 || filterEng || !filterEng || !filterArc || filterArc || filterLaw || !filterLaw) updateCurateW();
        if (data.length == 0 && load) setLoad2(true)
    }, [data, load, load2, load3, filterEng, filterArc, filterLaw]);


    // ***************************  DATA GETTERS *********************** //
    function retrieveMacro() {
        FUN_SERVICE.loadMacroAsigns(id1, id2)
            .then(response => {
                setData(response.data);
                setLoad(true);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, inténtelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }
    function retrieveWorker() {
        USER_SERVICE.getAll()
            .then(response => {
                setWorker_list(response.data)
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }
    function loppJump(array, Iterator) {
        let aLength = array.length;
        let counter = 0;
        for (var i = 0; i <= Iterator; i++) {
            if (i > aLength) {
                i = 0
            }
            counter++;
            if (counter >= Iterator) return array[i];
        }
        return array[0];
    }
    function _con_law(row, returnOBj = false) {
        let review_primal = row.jur_review ?? row.ph_review_law;
        let asgin_primal = row.asign_law_date ?? row.asign_ph_law_date;
        let asigns = row.clock_asign_law ? row.clock_asign_law.split(';') : [];
        let reviews = row.clock_review_law_c ? row.clock_review_law_c.split(';') : [];
        let con1;
        let con2;
        let process = 1;
        if (row.rec_review == 0) process = 4;
        let lastR = null;
        let lastA = null;
        let rev = null;
        for (let i = 0; i < process; i++) {
            if (i == 0) {
                con1 = asigns[0] ? asigns[0] : asgin_primal;
                con2 = reviews[0] ? reviews[0] == null : review_primal == null;
                rev = reviews[0] ? reviews[0] : review_primal;
                if (con1 == null) lastR = rev;
            }
            else {
                con1 = asigns[i];
                con2 = reviews[i] == null;
                rev = reviews[i];
            }
            if (con1 != null) lastR = rev;
            if (con1 != null) lastA = con1

        }
        let lastATime = lastA ? dateParser_timePassed(lastA) : 0;
        if (returnOBj) return { asign: lastA, rev: lastR }
        if (lastA && lastR == null && lastATime <= 5) return 1; // YES ASIGN, NO REVIEW
        if (lastA && lastR == null && lastATime > 5) return 5; // YES ASIGN, NO REVIEW AND MORE THAN FIVE DAYS FROM ASIGN
        if (!lastA && lastR == 1) return -1; // NO ASIGN, YES REVIEW -> IGNORE
        if (!lastA && lastR == null) return 2; // NO ASIGN, NO REVIEW
        if (lastA && lastR == 0) return 3; // YES ASIGN, REVIEW == 0
        if (!lastA && lastR == 0) return 4; // NO ASIGN, REVIEW == 0
        return 0;
    }
    function _con_arc(row, returnOBj = false) {
        let review_primal = row.arc_review ?? row.ph_review_arc;
        let asgin_primal = row.asign_arc_date ?? row.ph_arc_asign;
        let asigns = row.clock_asign_arc ? row.clock_asign_arc.split(';') : [];
        let reviews = row.clock_review_arc_c ? row.clock_review_arc_c.split(';') : [];
        let con1;
        let con2;
        let process = 1;
        let lastR = null;
        let lastA = null;
        let rev = null;
        if (row.rec_review == 0) process = 4;
        for (let i = 0; i < process; i++) {
            if (i == 0) {
                con1 = asigns[0] ? asigns[0] : asgin_primal;
                con2 = reviews[0] ? reviews[0] == null : review_primal == null;
                rev = reviews[0] ? reviews[0] : review_primal;
                if (con1 == null) lastR = rev;
            }
            else {
                con1 = asigns[i];
                con2 = reviews[i] == null;
                rev = reviews[i];
            }
            if (con1) lastR = rev;
            if (con1) lastA = con1
        }

        let lastATime = lastA ? dateParser_timePassed(lastA) : 0;
        if (returnOBj) return { asign: lastA, rev: lastR }
        if (lastA && lastR == null && lastATime <= 5) return 1; // YES ASIGN, NO REVIEW
        if (lastA && lastR == null && lastATime > 5) return 5; // YES ASIGN, NO REVIEW AND MORE THAN FIVE DAYS FROM ASIGN
        if (!lastA && lastR == 1) return -1; // NO ASIGN, YES REVIEW -> IGNORE
        if (!lastA && lastR == null) return 2; // NO ASIGN, NO REVIEW
        if (lastA && lastR == 0) return 3; // YES ASIGN, REVIEW == 0
        if (!lastA && lastR == 0) return 4; // NO ASIGN, REVIEW == 0
        return 0;
    }
    function _con_eng(row, returnOBj = false) {
        let review_primal = [row.eng_review, row.eng_review_2];
        let asgin_primal = row.asign_eng_date;
        let asigns = row.clock_asign_eng ? row.clock_asign_eng.split(';') : [];
        let reviews = row.clock_review_eng_c ? row.clock_review_eng_c.split(';') : [];
        let con1;
        let con2;
        let process = 1;
        let lastR = [null, null];
        let lastA = null;
        let rev = [null, null];
        if (row.rec_review == 0) process = 4;
        for (let i = 0; i < process; i++) {
            if (i == 0) {
                con1 = asigns[0] ? asigns[0] : asgin_primal;
                let engr = reviews[0] ? reviews[0].split(',') : review_primal;
                con2 = engr[0] == null && engr[1] == null;
                rev = engr
                if (con1 == null) lastR = engr;
            }
            else {
                con1 = asigns[i];
                let engr = reviews[i] ? reviews[i].split(',') : [null, null]
                con2 = engr[0] == null && engr[1] == null;
                rev = engr
            }
            if (con1) lastR = rev;
            if (con1) lastA = con1
        }
        let con3 = lastR[0] == null && (lastR[1] == null || lastR[1] == 2)
        let con4 = lastR[0] == 0 && (lastR[1] == 0 || lastR[1] == 2)

        let lastATime = lastA ? dateParser_timePassed(lastA) : 0;
        if (returnOBj) return { asign: lastA, rev: lastR }
        if (lastA && con3 && lastATime <= 5) return 1; // YES ASIGN, NO REVIEW
        if (lastA && con3 && lastATime > 5) return 5; // YES ASIGN, NO REVIEW AND MORE THAN FIVE DAYS FROM ASIGN
        if (!lastA && !con3) return -1; // NO ASIGN, YES REVIEW -> IGNORE
        if (!lastA && con3) return 2; // NO ASIGN, NO REVIEW
        if (lastA && con4) return 3; // YES ASIGN, REVIEW == 0
        if (!lastA && con4) return 4; // NO ASIGN, REVIEW == 0
        return 0;
    }
    function getRequiredDocs (wType) {
        if (!wType) return [];
        return VR_DOCUMENTS_OF_INTEREST[wType];
    }
    // *************************  DATA CONVERTERS ********************** //
    function curateDataW() {
        let workers = [];
        let idenxes = {};
        let colorCount = 0;
        let _colorI = { 1: 'success', 2: 'danger', 3: 'warning', 4: undefined, 5: 'secondary' }

        data.map((value, i) => {
            let con1 = value.state >= -1 && value.state < 100
            let con2 = value.rec_review == 1 && (value.rec_review_2 != 0)
            let con3 = value.rec_review == 0 && (value.rec_review_2 == 1)
            const isOA = regexChecker_isOA_2(value)
            if (!con1 || (con2 || con3)) return;
            if (!filterState && value.state < 5) return;
            let con_law = value.asign_law_worker_name;
            let con_law_ph = value.asign_ph_law_worker_name;
            let con_arc = value.asign_arc_worker_name;
            let con_arc_ph = value.asign_ph_arc_worker_name;
            let con_eng = value.asign_eng_worker_name;

            let id_law = value.asign_law_worker_id;
            let id_law_ph = value.sign_ph_law_worker_id;
            let id_arc = value.asign_arc_worker_id;
            let id_arc_ph = value.sign_ph_arc_worker_id;
            let id_eng = value.asign_eng_worker_id;

            let conChecks = [
                { name: con_law, type: 'law', icon: <i class="fas fa-balance-scale"></i>, id: id_law},
                { name: con_law_ph, type: 'law', icon: <i class="fas fa-balance-scale"></i>, id:  id_law_ph},
                { name: con_arc, type: 'arc', icon: <i class="far fa-building "></i>, id: id_arc },
                { name: con_arc_ph, type: 'arc', icon: <i class="far fa-building"></i>, id: id_arc_ph },
                { name: con_eng, type: 'eng', icon: <i class="fas fa-cogs"></i>, id: id_eng },
            ]

            conChecks.map(names => {
                if (names.name != null && idenxes[names.name] != undefined) {
                    let rowCon = 0;
                    if (names.type == 'law' && filterLaw) rowCon = _con_law(value)
                    if (names.type == 'arc' && filterArc && !isOA) rowCon = _con_arc(value)
                    if (names.type == 'eng' && filterEng && !isOA) rowCon = _con_eng(value)

                    let _color = value.state == 5 ? _colorI[rowCon] : 'dark';
                    if (rowCon == 1 || rowCon == 2 || rowCon == 3 || rowCon == 5) workers[idenxes[names.name]].datas.push({ ...value, color: _color, con: rowCon })
                }
            })

            let noProf = conChecks.every(names => names.name == null || names.name == undefined);
            if (noProf && idenxes['SIN PROFESIONAL'] != undefined) {
                let rowConLaw = 0;
                let rowConArc = 0;
                let rowConEng = 0;
                rowConLaw = _con_law(value, true).rev == 1
                rowConArc = _con_arc(value, true).rev == 1
                rowConEng = _con_eng(value, true).rev[0] == 1 && (_con_eng(value, true).rev[1] == 1 || _con_eng(value, true).rev[1] == 2)
                let bundleCon = [rowConLaw, rowConArc, rowConEng];
                let _color = value.state == 5 ? 'primary' : 'dark'
                if ((bundleCon.filter(Boolean).length < 3)) workers[idenxes['SIN PROFESIONAL']].datas.push({ ...value, color: _color })
            }

            conChecks.map(names => {
                if (names.name != null && idenxes[names.name] == undefined) {
                    let rowCon = 0;
                    if (names.type == 'law' && filterLaw) rowCon = _con_law(value)
                    if (names.type == 'arc' && filterArc && !isOA) rowCon = _con_arc(value)
                    if (names.type == 'eng' && filterEng && !isOA) rowCon = _con_eng(value)


                    if (rowCon == 1 || rowCon == 2 || rowCon == 3 || rowCon == 5) {
                        let _color = value.state == 5 ? _colorI[rowCon] : 'dark';
                        workers.push({
                            name: names.name,
                            id: names.id,
                            type: names.type,
                            icon: names.icon,
                            datas: [{ ...value, color: _color, con: rowCon }],
                            checked: true,
                            show: true,
                            color: loppJump(Colors, colorCount),
                        })
                        colorCount++;
                        idenxes[names.name] = workers.length - 1;
                    }
                }
            })

            if (noProf && idenxes['SIN PROFESIONAL'] == undefined) {
                let rowConLaw = 0;
                let rowConArc = 0;
                let rowConEng = 0;
                rowConLaw = _con_law(value, true).rev == 1
                rowConArc = _con_arc(value, true).rev == 1
                rowConEng = _con_eng(value, true).rev[0] == 1 && (_con_eng(value, true).rev[1] == 1 || _con_eng(value, true).rev[1] == 2)
                let bundleCon = [rowConLaw, rowConArc, rowConEng];
                value.state == 5 ? value.color = 'primay' : value.color = 'dark'
                if ((bundleCon.filter(Boolean).length < 3)) {
                    workers.push({
                        name: 'SIN PROFESIONAL',
                        id: null,
                        type: null,
                        icon: null,
                        datas: [value],
                        checked: true,
                        show: true,
                        color: 'gainsboro'
                    })
                    idenxes['SIN PROFESIONAL'] = workers.length - 1;
                }
            }
        })
        setDataW(workers);
        setIndex(idenxes)
        setLoad2(true);
    }
    function updateCurateW() {

        let cb = document.getElementsByName('cb_worker') ? [...document.getElementsByName('cb_worker')] : [];
        let newDataW = dataW;
        cb.map(value => {

            let idx = index[value.id];
            newDataW[idx].checked = value.checked;

            let conShow = newDataW[idx].show;
            if (newDataW[idx].type == 'law') conShow = filterLaw;
            if (newDataW[idx].type == 'arc') conShow = filterArc;
            if (newDataW[idx].type == 'eng') conShow = filterEng;

            if (!conShow) {
                value.checked = false;
                value.disabled = true;
                newDataW[idx].show = false;
            }
            else {
                value.disabled = false;
                newDataW[idx].show = true;
            }
        })
        //setDataW(newDataW)
        setLoad3(true)
    }
    function setWorkerChecked(wName) {
        let newWorker = dataW.map(data => {
            if (data.name != wName) return data;
            else return { ...data, checked: !data.checked }
        })
        setDataW(newWorker)
    }
    let _filter = (item) => item.id_public && item.id_public.toLowerCase().includes((filter ?? '').toLowerCase()) && (!filterState ? item.state == 5 : true)
    function checkForNewDocs(wType, item){
        let requiredDocs = getRequiredDocs(wType);
        let vrDocs = item ? item.vrdocs : [];
        let newDoc = false;
        let dateReview = {
            'arc': item.arc_date,
            'law': item.jur_date,
            'eng': item.eng_date,
        }
        //console.log(dateReview[wType] || '')
        newDoc = vrDocs.some(vr => {
            let codes = vr.codes ? vr.codes : [];

            let con_1 = dateReview[wType] ? moment(vr.date).isSameOrAfter(dateReview[wType]) : false;
            let con_2 = codes.some(doc => requiredDocs.includes(doc))

            return con_1 && con_2;
        })
        

        return newDoc;
    }
    // ******************************* JSX ***************************** // 
    const subHeaderComponentMemo = () => {
        return (
            <div class="input-group mb-2">
                <span class="input-group-text bg-light">
                    <i class="fas fa-search"></i>
                </span>
                <input type='text' className='form-control' placeholder='Busqueda...'
                    onChange={(e) => setFilter(e.target.value)} defaultValue={filter} />
            </div>
        );
    }
    const idHeaderComponent = () => {
        return (
            <div class="input-group mb-2">
                <span class="input-group-text bg-light">
                    <i class="fas fa-hashtag"></i>
                </span>
                <input type='text' className='form-control' defaultValue={id1} placeholder='Busqueda...' onChange={(e) => setId1(e.target.value)} />
                <input type='text' className='form-control' defaultValue={id2} placeholder='Busqueda...' onChange={(e) => setId2(e.target.value)} />
                <MDBBtn onClick={() => {
                    setData([]);
                    setLoad(false);

                    setLoad2(false);
                    setDataW([]);
                }}>CARGAR</MDBBtn>
            </div>
        );
    }
    const iconsComponent = () => {
        return (
            <div class="input-group mt-1">
                <MDBBtn link className='m-0 px-2' outline={!filterState} color="dark" size="sm" onClick={() => { setFilterState(!filterState); }}><i class="fas fa-check-square"></i></MDBBtn>
                <MDBBtn link className='m-0 px-2' outline={!filterLaw} size="sm" onClick={() => { setFilterLaw(!filterLaw); setLoad3(false) }}><i class="fas fa-balance-scale"></i></MDBBtn>
                <MDBBtn link className='m-0 px-2' outline={!filterArc} size="sm" onClick={() => { setFilterArc(!filterArc); setLoad3(false) }}> <i class="far fa-building "></i></MDBBtn>
                <MDBBtn link className='m-0 px-2' outline={!filterEng} size="sm" onClick={() => { setFilterEng(!filterEng); setLoad3(false) }}><i class="fas fa-cogs"></i> </MDBBtn>
                {currenItem != null ?
                    <MDBBtn link className='m-0 px-2' color="danger" size="sm" onClick={() => { setCurrentItem(null); setSbtn(null) }}><i class="fas fa-times"></i> </MDBBtn>
                    : ''}
            </div>
        );
    }
    const ExpandedComponent = () => <>
        <TABLE_COMPONENT_EXPANDED currentItem={{ ...currenItem, rec_review: currenItem.rec_review, rec_review_2: currenItem.rec_rev_2 }}
            requestUpdate={() => retrieveMacro()}
            translation={translation} swaMsg={swaMsg} globals={globals}
            worker_list={worker_list}
            lenghtL={data.length}
            dataL={data}
        />
    </>;

    let WORKERS_LIST = () => {
        return <>
            {dataW.map((worker, i) => {

                let wType = worker.type;
                let wCheck = {
                    'law': filterLaw,
                    'arc': filterArc,
                    'eng': filterEng,
                }
                let isSelected = worker.checked && (wCheck[wType] ?? true);
                return <>
                    <di className="row mb-1">
                        <div className='col'>
                            <MDBBtn outline={!isSelected} rounded block size='sm' style={{ backgroundColor: isSelected ? worker.color : 'whitesmoke', color: 'black', borderColor: "white" }}
                                onClick={() => setWorkerChecked(worker.name)} >{worker.icon} {worker.name} ({worker.datas.length})</MDBBtn>
                        </div>
                    </di>
                </>
            })}
            {/**
             *  <ul class="list-group">
                <li class='list-group-item my-0 py-1' style={{ backgroundColor: 'gainsboro', }}>
                    <label>MATRIZ DE CARGA PROFESIONAL</label>
                </li>
                <li class='list-group-item my-0 py-1'>
                    <table className='table table-sm'>
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">JUR</th>
                                <th scope="col">ARC</th>
                                <th scope="col">EST</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">I</th>
                                <td>{matrixLoad.i.law}</td>
                                <td>{matrixLoad.i.arc}</td>
                                <td>{matrixLoad.i.eng}</td>
                            </tr>
                            <tr>
                                <th scope="row">II</th>
                                <td>{matrixLoad.ii.law}</td>
                                <td>{matrixLoad.ii.arc}</td>
                                <td>{matrixLoad.ii.eng}</td>
                            </tr>
                            <tr>
                                <th scope="row">III</th>
                                <td>{matrixLoad.iii.law}</td>
                                <td>{matrixLoad.iii.arc}</td>
                                <td>{matrixLoad.iii.eng}</td>
                            </tr>
                            <tr>
                                <th scope="row">IV</th>
                                <td>{matrixLoad.iv.law}</td>
                                <td>{matrixLoad.iv.arc}</td>
                                <td>{matrixLoad.iv.eng}</td>
                            </tr>
                            <tr>
                                <th scope="row">OA</th>
                                <td>{matrixLoad.oa.law}</td>
                                <td>{matrixLoad.oa.arc}</td>
                                <td>{matrixLoad.oa.eng}</td>
                            </tr>
                        </tbody>
                    </table>
                </li>
                <li class='list-group-item my-0 py-1' >
                    <h5 className='fw-normal'>CARGA DIARIA POR PROFESIONAL = {dailyLoad}</h5>
                </li>
            </ul>
             */}
        </>
    }
    let _MODULE_BTN_POP = (row) => {
        const isOA = regexChecker_isOA_2(row);
        let rules = row.rules ? row.rules.split(';') : [];
        return <MDBPopoverBody>
            <div class="list-group list-group-flush">
                {window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 5 ?
                    <>
                        <button type="button" onClick={() => { setCurrentItem(null); setCurrentItem(row); setModal(true) }} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-user-clock"></i> ASIGNAR</button>
                    </> : null}
                <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'general', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-folder-open text-info" ></i> DETALLES</button>
                <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'clock', '')} class="list-group-item list-group-item-action p-1 m-0 " ><i class="far fa-clock text-secondary" ></i> TIEMPOS</button>
                <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'archive', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-archive text-secondary" ></i> DOCUMENTOS</button>
                {row.state < 101 ?
                    <>
                        <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'edit', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-folder-open text-secondary" ></i> ACTUALIZAR</button>
                        <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'check', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-check-square text-warning" ></i> CHECKEO</button>
                        {regexChecker_isPh(row, true) ?
                            <>
                                <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'record_ph', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-pencil-ruler text-warning" ></i>  INF. P.H.</button>
                                <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'expedition', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-file-alt text-warning" ></i> EXPEDICION</button>
                            </>
                            :
                            <>
                                {!isOA && rules[0] != 1 ? <>
                                    <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'alert', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-sign text-warning" ></i>  PUBLICIDAD</button>
                                </> : ''}
                                <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'record_law', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-balance-scale text-warning" ></i> INF. JURIDICO</button>
                                {!isOA ? <>
                                    <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'record_arc', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-building text-warning" ></i> INF. ARQUITECTONICO</button>
                                    {rules[1] != 1 ? <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'record_eng', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-cogs text-warning" ></i> INF. ESTRUCTURAL</button> : ''}
                                    <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'record_review', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="fas fa-file-contract text-warning" ></i> ACTA</button>
                                </> : ''}
                                <button type="button" onClick={() => props.NAVIGATION_GEN(row, 'expedition', '')} class="list-group-item list-group-item-action p-1 m-0" ><i class="far fa-file-alt text-warning" ></i> EXPEDICION</button>
                            </>}
                    </> : <></>}
            </div>
        </MDBPopoverBody>
    }
    let _COLORS_COMPONENT = () => {
        let colorsLegends = [
            { className: 'text-primary fw-bold', text: 'Sin profesional y en LyDF', title: 'AZUL' },
            { className: 'text-dark fw-bold', text: 'En radicación ó incompleto', title: 'NEGRO' },
            { className: 'text-success fw-bold', text: 'Asignado y esperando revision', title: 'VERDE' },
            { className: 'text-secondary fw-bold', text: 'Asignado y esperando revision por mas de 5 dias', title: 'MORADO' },
            { className: 'text-danger fw-bold', text: 'Requiere Asignar y revisar primera vez', title: 'ROJO' },
            { className: 'text-warning fw-bold', text: 'Requiere Asignar y revisar nuevamnete', title: 'AMARILLO' },

        ]
        return <>
            <ul class="list-group">
                <li class='list-group-item my-0 py-1' style={{ backgroundColor: 'gainsboro', }}>
                    <div className='row'>
                        <div className='col'>
                            COLORES
                        </div>
                    </div>
                </li>
            </ul>
            <ul class="list-group">
                {colorsLegends.map(value => {
                    return <>
                        <li class='list-group-item my-0 py-0'>
                            <div className='row'>
                                <div className='col'>
                                    <h5 className='fw-normal'>
                                        <label className={value.className}>{value.title}</label> = {value.text}
                                    </h5>
                                </div>
                            </div>
                        </li>
                    </>
                })}
            </ul>
        </>
    }
    let LISTS_COMPONENT = () => {

        return <>
            <ul class="list-group">
                {dataW.map((cb, i) => {
                    let worker = cb;
                    let wType = worker.type;
                    let wCheck = {
                        'law': filterLaw,
                        'arc': filterArc,
                        'eng': filterEng,
                    }
                    let isSelected = worker.checked && (wCheck[wType] ?? true);
                    if (!isSelected) return;
                    let classList = 'list-group-item my-0 py-1';
                    return <>
                        <li class={classList} style={{ backgroundColor: worker.color, }}>
                            <div className='row'>
                                <div className='col'>
                                    {worker.icon} {worker.name} ({worker.datas.filter(item => _filter(item)).length}) {worker.icon ? <MDBBtn rounded size='sm' onClick={() => {setModalF(true); setCurrentProf({name: worker.name, type: wType, id: worker.id})}} >Ver historial</MDBBtn>: null}
                                </div>
                            </div>
                        </li>
                        <li class='list-group-item my-0 py-1'>
                            <b>Revisando:</b>
                            <div class="d-flex flex-wrap">
                                {worker.datas.filter(item => _filter(item)).filter(item => item.color == 'success' || item.color == 'secondary').map(btn => {
                                    return <>
                                        <div className='me-1 mb-1'>
                                            <MDBPopover size='sm' color={btn.color ?? 'primary'} placement='bottom' dismiss rounded
                                                outline={selectedBtn != btn.id_public}
                                                btnChildren={<label className={''}>{(btn.id_public).slice(-7)}</label>}
                                                onClick={() => setSbtn(btn.id_public)}>
                                                {_MODULE_BTN_POP(btn)}
                                            </MDBPopover>
                                        </div>
                                    </>
                                })}
                            </div>
                            <b>No Viable (<label className="text-success">Nuevos Documentos</label>)</b>
                            <div class="d-flex flex-wrap">
                                {worker.datas.filter(item => _filter(item)).filter(item => item.color != 'success' && item.color != 'secondary').map(btn => {
                                    let newDocs =  checkForNewDocs(wType, btn)
                                    if(!newDocs) return '';
                                    return <>
                                        <div className='me-1 mb-1'>
                                            <MDBPopover size='sm' color={btn.color ?? 'primary'} placement='bottom' dismiss rounded
                                                outline={selectedBtn != btn.id_public}
                                                btnChildren={<label className={''}>{(btn.id_public).slice(-7)}</label>}
                                                onClick={() => setSbtn(btn.id_public)}>
                                                {_MODULE_BTN_POP(btn)}
                                            </MDBPopover>
                                        </div>
                                    </>
                                })}
                            </div>
                            <b>No Viable (Sin documentos nuevos)</b>
                            <div class="d-flex flex-wrap">
                                {worker.datas.filter(item => _filter(item)).filter(item => item.color != 'success' && item.color != 'secondary').map(btn => {
                                    let newDocs =  checkForNewDocs(wType, btn)
                                    if(newDocs) return '';
                                    return <>
                                        <div className='me-1 mb-1'>
                                            <MDBPopover size='sm' color={btn.color ?? 'primary'} placement='bottom' dismiss rounded
                                                outline={selectedBtn != btn.id_public}
                                                btnChildren={<label className={''}>{(btn.id_public).slice(-7)}</label>}
                                                onClick={() => setSbtn(btn.id_public)}>
                                                {_MODULE_BTN_POP(btn)}
                                            </MDBPopover>
                                        </div>
                                    </>
                                })}
                            </div>
                        </li>
                    </>
                })}
            </ul>
        </>
    }

    let CALENDAR = () => {
        function getTodoList(_date) {
            const date = moment(_date).format('YYYY-MM-DD');

            let dates = [];

            dataW.map(worker => {
                worker.datas.filter(item => _filter(item)).map(item => {
                    let asign_date = false;
                    if (worker.type == "law") {
                        asign_date = item.clock_asign_law || item.ph_date_law;
                    }
                    if (worker.type == "arc") {
                        asign_date = item.clock_asign_arc || item.ph_date_arc;
                    }
                    if (worker.type == "eng") {
                        asign_date = item.clock_asign_eng;
                    }
                    if (asign_date && asign_date.includes(date)) {
                        let find = dates.findIndex(i => i.name == worker.name);

                        if (find > -1) {
                            let new_count = dates[find].count + 1;
                            let new_ids = dates[find].ids + " " + item.id_public;
                            dates[find] = { name: worker.name, count: new_count, ids: new_ids };
                        }
                        else dates.push({ name: worker.name, count: 1, ids: item.id_public });
                    }
                })
            })

            return dates;

        }

        function renderCell(date) {
            const list = getTodoList(date);
            const dateFormat = moment(date).format('YYYY-MM-DD');
            const dayOff = moment(date).weekday();
            const dayOffTag = <Tag color="blue">FESTIVO</Tag>;
            const holyDays = require('../../../../components/jsons/holydaysmoment.json');
            const isDayOff = dayOff === 0 || dayOff === 6 || holyDays.holidays.includes(dateFormat);
            const displayList = list.filter((item, index) => index < 2);
            const shortID = (id) => id.includes(infoCud.nomen) ? id.slice(-7) : id;
            const renderBadges = (n) => {
                let badges = [];
                let _n = n < 4 ? 4 : n;
                for (let i = 0; i < _n; i++) {
                    if (i < n && i < 4) badges.push(<Badge className='me-1' color="green" />)
                    else if (i < _n && n <= 4) badges.push(<Badge className='me-1' style={{ backgroundColor: 'lightgray' }} />)
                    else if (i < _n && n > 4) badges.push(<Badge className='me-1' />)
                }
                return <>{badges}</>
            }

            const renderList = () => {
                const moreCount = list.length - displayList.length;
                const infoText = (name) => (
                    <Whisper
                        placement="top"
                        trigger="click"
                        speaker={
                            <Popover>
                                <b>{name}:</b> <TagGroup>
                                    {list.filter(l => l.name == name).map((item, index) => (
                                        item.ids.split(' ').map(id => <Tag>{shortID(id)}</Tag>)
                                    ))}
                                </TagGroup>

                            </Popover>
                        }
                    >
                        <a>{name}</a>
                    </Whisper>
                )

                const moreItem = (
                    <Whisper
                        placement="top"
                        trigger="click"
                        speaker={
                            <Popover>
                                {list.map((item, index) => (
                                    <p key={index}>
                                        {renderBadges(item.count)} <b>{item.name} {list.filter(l => l.name == item.name).map((item, index) => (
                                        item.ids.split(' ').map(id => <Tag>{shortID(id)}</Tag>)
                                    ))}</b>
                                    </p>
                                ))}
                            </Popover>
                        }
                    >
                        <a className='text-primary'>ver todos</a>
                    </Whisper>
                );

                return (
                    <>
                        {displayList.map((item, index) => (
                            <div key={index}>
                                {renderBadges(item.count)} <b>{infoText(item.name)}</b>
                            </div>
                        ))}
                        {moreCount ? moreItem : null}
                    </>
                );
            }

            return <>
                {isDayOff ? dayOffTag : null}
                {list.length ? renderList() : null}
            </>
        }

        let locale = {
            sunday: 'Domingo',
            monday: 'Lunes',
            tuesday: 'Martes',
            wednesday: 'Miercoles',
            thursday: 'Jueves',
            friday: 'Viernes',
            saturday: 'Sabado',
            ok: 'OK',
            today: 'Hoy',
            yesterday: 'Ayer',
            hours: 'Horas',
            minutes: 'Minutos',
            seconds: 'Segunds',
            formattedMonthPattern: 'MMMM',
            formattedDayPattern: 'dd',
        };

        return <Calendar bordered renderCell={renderCell} locale={locale} />
    }

    let COMPONEN_WORKERS = () => {
        return <>
            <div className='row' >
                <div className="col-3">
                    {WORKERS_LIST()}
                </div>
                <div className="col">
                    {_COLORS_COMPONENT()}
                </div>
            </div>
            <div className='row' >
                <div className="col">
                    {LISTS_COMPONENT()}
                </div>
            </div>
        </>

    }
    let TOP_PAGE = () => {
        return <>
            <div className="row border p-1 text-white fw-bold" >
                <div className='col-5'>
                    {subHeaderComponentMemo()}
                </div>
                <div className='col-2 text-center'>
                    {iconsComponent()}
                </div>
                <div className='col-5'>
                    {idHeaderComponent()}
                </div>
            </div>
        </>
    }
    let BOT_PAGE = () => {
        return <>
            {currenItem ? ExpandedComponent() : ''}
        </>
    }
    // ******************************* APIS **************************** // 


    return <>
        {TOP_PAGE()}
        {CALENDAR()}
        {load ? load2 ?
            <>
                {COMPONEN_WORKERS()}

                <Modal contentLabel="ASIGN PROFS"
                    isOpen={modal}
                    style={customStylesForModal}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-file-alt"></i> ASIFNACIÓN DE PROFESIONALES:  {currenItem ? currenItem.id_public : ''} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => setModal(false)}></MDBBtn>
                    </div>

                    {BOT_PAGE()}

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={() => setModal(false)}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>

                <Modal contentLabel="HISTORY PROFS"
                    isOpen={modalF}
                    style={customStylesForModal}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="far fa-file-alt"></i> HISTORIAL DE ASIGNACIONES:  {currentProf ? currentProf.name : ''} </label>
                        <MDBBtn className='btn-close' color='none' onClick={() => setModalF(false)}></MDBBtn>
                    </div>

                    <FUN_ASIGNS_HISTORY_COMPONENT 
                        name={currentProf.name}
                        id={currentProf.id}
                        type={currentProf.type}
                        swaMsg={swaMsg}
                    />

                    <div className="text-end py-4 mt-3">
                        <MDBBtn color='info' onClick={() => setModalF(false)}>
                            <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
                        </MDBBtn>
                    </div>
                </Modal>
            </>
            : <div className='row text-center' > <label className='fw-normal lead text-muted'>FILTRANDO...</label></div>
            : <div className='row text-center' > <label className='fw-normal lead text-muted'>CARGANDO...</label></div>}
    </>;
}


