import React, { useEffect, useState } from 'react';
import FUN_SERVICE from '../../../../services/fun.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MDBBtn, MDBPopover, MDBPopoverBody } from 'mdb-react-ui-kit';
import { dateParser_dateDiff, dateParser_finalDate, dateParser_timeLeft, dateParser_timePassed, regexChecker_isOA_2, regexChecker_isOA_3, regexChecker_isPh, VR_DOCUMENTS_OF_INTEREST, _SET_PRIORITY, formsParser1 } from '../../../../components/customClasses/typeParse';
import FUN_CHART_MACRO_GRANTT from './charts_components.js/chart_macroGant.component';
import { nomens } from '../../../../components/jsons/vars';

export default function FUN_DAILY_COMPONENT(props) {
    const { swaMsg, translation, globals } = props;
    const TYPE_TIME = { 'iv': 45, 'iii': 35, 'ii': 25, 'i': 20, 'oa': 15 }
    const MySwal = withReactContent(Swal);
    const moment = require('moment');
    const defaultData = {
        inc: [],
        other: [],
        law: [],
        arc: [],
        eng: [],
        rec: [],
        check: [],
        cor: [],
        res: [],
        lic: [],
        lic2: [],
        pay: [],
        pay2: [],
        neg: [],
        neg2: [],
        rsc: [],
        rsc2: [],
        rsc3: [],
        gen: [],
    }
    const VRDI = VR_DOCUMENTS_OF_INTEREST;
    var [id1, setId1] = useState(`${nomens}${moment().subtract(1, 'year').format('YY')}-0000`);
    var [id2, setId2] = useState(`${nomens}${moment().format('YY')}-9999`);
    var [data, setData] = useState([])
    var [datac, setDatac] = useState(defaultData)
    var [load, setLoad] = useState(false)
    var [load2, setLoad2] = useState(false)
    var [selectedBtn, setSbtn] = useState(null)
    var [filter, setFilter] = useState('')

    useEffect(() => {
        if (!load) retrieveMacro()
        //if (data.length > 0 && !load2) curateData()
        if (data.length == 0 && load) setLoad2(true)
    }, [data, load, load2]);


    // ***************************  DATA GETTERS *********************** //
    function retrieveMacro() {

        FUN_SERVICE.loadMacroRange(id1, id2)
            .then(response => {
                setLoad(true);
                if (response.data.length > 0) curateData(response.data);
                //setData(response.data);

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
    // *************************  DATA CONVERTERS ********************** //
    function _con_law(row) {
        let review_primal = row.jur_review;
        let asgin_primal = row.asign_law_date;
        let asigns = row.clock_asign_law ? row.clock_asign_law.split(';') : [];
        let reviews = row.clock_review_law_c ? row.clock_review_law_c.split(';') : [];

        let con1;
        let con2;
        let process = 1;
        if (row.rec_review == 0) process = 4;
        for (let i = 0; i < process; i++) {

            if (i == 0) {
                con1 = asigns[0] ? asigns[0] : asgin_primal;
                con2 = reviews[0] ? reviews[0] == null : review_primal == null;
            }
            else {
                con1 = asigns[i];
                con2 = reviews[i] == null;
            }

            if (con1 || !con2) return false
        }
        return true;
    }

    function _con_arc(row) {
        let review_primal = row.arc_review;
        let asgin_primal = row.asign_arc_date;
        let asigns = row.clock_asign_arc ? row.clock_asign_arc.split(';') : [];
        let reviews = row.clock_review_arc_c ? row.clock_review_arc_c.split(';') : [];

        let process = 1;
        let con1;
        let con2;
        if (row.rec_review == 0) process = 4;
        for (let i = 0; i < process; i++) {

            if (i == 0) {
                con1 = asigns[0] ? asigns[0] : asgin_primal;
                con2 = reviews[0] ? reviews[0] == null : review_primal == null;
            }
            else {
                con1 = asigns[i];
                con2 = reviews[i] == null;
            }
            if (con1 || !con2) return false
        }

        return true;
    }

    function _con_eng(row) {
        let review_primal = [row.eng_review, row.eng_review_2];
        let asgin_primal = row.asign_eng_date;
        let asigns = row.clock_asign_eng ? row.clock_asign_eng.split(';') : [];
        let reviews = row.clock_review_eng_c ? row.clock_review_eng_c.split(';') : [];

        let process = 1;
        if (row.rec_review == 0) process = 4;
        for (let i = 0; i < process; i++) {
            let con1;
            let con2;
            let reviews_eng;
            if (i == 0) {
                con1 = asigns[0] ? asigns[0] : asgin_primal;
                reviews_eng = reviews[0] ? reviews[0].split(',') : review_primal;
                con2 = reviews_eng[0] == null && reviews_eng[1] == null;
            }
            else {
                con1 = asigns[i];
                reviews_eng = reviews[i] ? reviews[i].split(',') : [null, null];
                con2 = reviews_eng[0] == null && reviews_eng[1] == null;
            }

            if (con1 || !con2) return false
        }
        return true;
    }

    function _con_check(row, scope, lastVR, docsInerest) {
        if (row.vrdocs.length == 0) return -1;
        let review_primal;
        let asgin_primal;
        let review_d_primal;
        let asigns;
        let reviews;
        let reviews_d;
        let process = 1;
        let con1;
        let con2;
        let con2d;
        let con3;
        let conAsist = false;
        let days_asign;
        let lastR;
        let lastRD;
        let lastD;
        let lastAi;
        let lastRi;

        if (row.rec_review == 0) process = 4;

        if (scope == 'law') {
            lastR = null;
            lastRD = null;
            lastD = null;
            con1 = null;
            con2 = null;
            con3 = false;

            review_primal = row.jur_review;
            review_d_primal = row.clock_review_law;
            asgin_primal = row.jur_date;
            asigns = row.clock_asign_law ? row.clock_asign_law.split(';') : [];
            reviews = row.clock_review_law_c ? row.clock_review_law_c.split(';') : [];
            reviews_d = row.clock_review_law ? row.clock_review_law.split(';') : [];
            for (let i = 0; i < process; i++) {
                if (i == 0) {
                    con1 = asigns[0] || asgin_primal;
                    con2 = reviews[0] || review_primal;
                    con2d = reviews_d[0] || review_d_primal;
                }
                else {
                    con1 = asigns[i];
                    con2 = reviews[i];
                    con2d = reviews_d[i];
                }
                if (con1) { days_asign = dateParser_timePassed(con1); lastD = con1; lastAi = i }
                if (con2 != null || con2 != undefined) lastR = con2
                if (con2d != null || con2d != undefined) { lastRD = con2d; lastRi = i }
            }

            con3 = true;
            conAsist = false;
            if (!lastRD || !lastVR.date) con3 = false;

            if (con3 && lastAi == lastRi) {
                row.vrdocs.map(vr => {
                    if (conAsist) return;
                    let condDate = moment(lastRD).isBefore(vr.date)
                    if (condDate) {
                        conAsist = vr.codes.some(code => docsInerest.includes(',' + code + ','))
                    }
                })
            }
            if (lastR == 0 && !conAsist) { return 'law' }
            if (lastR == 0 && conAsist) { return 'law2' }
        }

        if (scope == 'arc') {
            review_primal = row.arc_review;
            asgin_primal = row.asign_arc_date;
            review_d_primal = row.arc_date;
            asigns = row.clock_asign_arc ? row.clock_asign_arc.split(';') : [];
            reviews = row.clock_review_arc_c ? row.clock_review_arc_c.split(';') : [];
            reviews_d = row.clock_review_arc ? row.clock_review_arc.split(';') : [];

            lastR = null;
            lastRD = null;
            lastD = null;
            con1 = null;
            con2 = null;
            con3 = false;
            lastAi = null;
            lastRi = null;


            for (let i = 0; i < process; i++) {
                if (i == 0) {
                    con1 = asigns[0] || asgin_primal;
                    con2 = reviews[0] || review_primal;
                    con2d = reviews_d[0] || review_d_primal;
                }
                else {
                    con1 = asigns[i];
                    con2 = reviews[i];
                    con2d = reviews_d[i];
                }
                if (con1) { days_asign = dateParser_timePassed(con1); lastD = con1; lastAi = i }
                if (con2 != null || con2 != undefined) lastR = con2
                if (con2d != null || con2d != undefined) { lastRD = con2d; lastRi = i }
            }

            con3 = true;
            conAsist = false;
            if ((lastRD == undefined || lastRD == null) || !lastVR.date) con3 = false;

            if (con3 && lastAi == lastRi) {
                row.vrdocs.map(vr => {
                    if (conAsist) return;
                    let condDate = moment(lastRD).isBefore(vr.date)
                    if (condDate) {
                        conAsist = vr.codes.some(code => docsInerest.includes(code))
                    }
                })
            }

            if (lastR == 0 && !conAsist) { return 'arc' }
            if (lastR == 0 && conAsist) { return 'arc2' }
        }

        if (scope == 'eng') {
            review_primal = [row.eng_review, row.eng_review_2];
            asgin_primal = row.asign_eng_date;
            review_d_primal = row.eng_date;
            asigns = row.clock_asign_eng ? row.clock_asign_eng.split(';') : [];
            reviews = row.clock_review_eng_c ? row.clock_review_eng_c.split(';') : [];
            reviews_d = row.clock_review_eng ? row.clock_review_eng.split(';') : [];

            lastR = [null, null];
            lastRD = null;
            lastD = null;
            con1 = null;
            con2 = null;
            con3 = false;
            lastAi = null;
            lastRi = null;

            for (let i = 0; i < process; i++) {
                if (i == 0) {
                    con1 = asigns[0] || asgin_primal;
                    con2 = reviews[0] ? reviews[0].split(',') : review_primal;
                    con2d = reviews_d[0] || review_d_primal;
                }
                else {
                    con1 = asigns[i];
                    con2 = reviews[i] ? reviews[i].split(',') : [null, null];
                    con2d = reviews_d[i];
                }
                if (con1) { days_asign = dateParser_timePassed(con1); lastD = con1; lastAi = i }
                if (con1) days_asign = dateParser_timePassed(con1);
                if (con2.every(i => i != null || i != undefined)) lastR = con2
                if (con2d != null || con2d != undefined) { lastRD = con2d; lastRi = i; }
            }

            con3 = true;
            conAsist = false;
            if (!lastRD || !lastVR.date) con3 = false;
            if (con3 && lastAi == lastRi) {
                row.vrdocs.map(vr => {
                    if (conAsist) return;
                    let condDate = moment(lastRD).isBefore(vr.date)
                    if (condDate) {
                        conAsist = vr.codes.some(code => docsInerest.includes(code))
                    }
                })
            }

            if ((lastR[0] == 0 || (lastR[1] == 0)) && !conAsist) { return 'eng' }
            if ((lastR[0] == 0 || (lastR[1] == 0)) && conAsist) { return 'eng2' }


        }

        return -1;
    }

    function _con_check_2(row, type) {
        let review_primal;
        let asgin_primal;
        let asigns;
        let reviews;
        let informs;
        let process = 1;
        let con1;
        let con2;

        let date_asgin;

        let lastR = null;
        let lastI = null;

        /*
          let days_pay = dateParser_timePassed(row.clock_payment);
        let days_ldf = dateParser_timePassed(row.clock_date);
        let lastVR = days_ldf || days_pay || 100;
        let submit_dates_array = row.submit_dates ? row.submit_dates.split(';') : [];
        submit_dates_array.map(value => {
            let date = value.split(' ')[0];
            let days = dateParser_timePassed(date);
            if (days < lastVR) lastVR = days;
        })
        */
        if (row.rec_review == 0) process = 4;

        if (type == 'law') {
            review_primal = row.jur_review;
            asgin_primal = row.asign_law_date;
            asigns = row.clock_asign_law ? row.clock_asign_law.split(';') : [];
            reviews = row.clock_review_law_c ? row.clock_review_law_c.split(';') : [];
            informs = row.clock_inform_law ? row.clock_inform_law.split(';') : [];
            for (let i = 0; i < process; i++) {
                if (i == 0) {
                    con1 = asigns[0] || asgin_primal;
                    con2 = reviews[0] || review_primal;
                }
                else {
                    con1 = asigns[i];
                    con2 = reviews[i];
                }
                if (con1) date_asgin = con1
                if (con2 != null || con2 != undefined) lastR = con2
                if (con2 != null || con2 != undefined) lastI = informs[i]
            }

            return { asign: date_asgin, rev: lastR, inf: lastI }
        }

        if (type == 'arc') {
            review_primal = row.arc_review;
            asgin_primal = row.asign_arc_date;
            asigns = row.clock_asign_arc ? row.clock_asign_arc.split(';') : [];
            reviews = row.clock_review_arc_c ? row.clock_review_arc_c.split(';') : [];
            informs = row.clock_inform_arc ? row.clock_inform_arc.split(';') : [];

            lastR = null;
            lastI = null;
            con1 = null;
            for (let i = 0; i < process; i++) {
                if (i == 0) {
                    con1 = asigns[0] || asgin_primal;
                    con2 = reviews[0] || review_primal;
                }
                else {
                    con1 = asigns[i];
                    con2 = reviews[i]
                }
                if (con1) date_asgin = con1
                if (con2 != null || con2 != undefined) lastR = con2
                if (con2 != null || con2 != undefined) lastI = informs[i]
            }

            return { asign: date_asgin, rev: lastR, inf: lastI }
        }

        if (type == 'eng') {
            review_primal = [row.eng_review, row.eng_review_2];
            asgin_primal = row.asign_eng_date;
            asigns = row.clock_asign_eng ? row.clock_asign_eng.split(';') : [];
            reviews = row.clock_review_eng_c ? row.clock_review_eng_c.split(';') : [];
            informs = row.clock_inform_eng ? row.clock_inform_eng.split(';') : [];
            lastR = [null, null]
            lastI = null;
            con1 = null;
            for (let i = 0; i < process; i++) {
                if (i == 0) {
                    con1 = asigns[0] || asgin_primal;
                    con2 = reviews[0] ? reviews[0].split(',') : review_primal;
                }
                else {
                    con1 = asigns[i];
                    con2 = reviews[i] ? reviews[i].split(',') : [null, null];
                }
                if (con1) date_asgin = con1
                if (con2.every(i => i != null || i != undefined)) lastR = con2
                if (con2.every(i => i != null || i != undefined)) lastI = informs[i]
            }

            return { asign: date_asgin, rev: lastR, inf: lastI }
        }

        return -1
    }

    function _con_rec(row) {
        let review_primal_law = row.jur_review;
        let reviews_law = row.clock_review_law_c ? row.clock_review_law_c.split(';') : [];

        let review_primal_arc = row.arc_review;
        let reviews_arc = row.clock_review_arc_c ? row.clock_review_arc_c.split(';') : [];

        let review_primal_eng = [row.eng_review, row.eng_review_2];
        let reviews_eng = row.clock_review_eng_c ? row.clock_review_eng_c.split(';') : [];

        let con_law;
        let con_arc;
        let con_eng;

        let process = 1;
        if (row.rec_review == 0) process = 4;

        for (let i = 0; i < process; i++) {
            if (i == 0) {
                con_law = reviews_law[0] ? reviews_law[0] : review_primal_law;
                con_arc = reviews_arc[0] ? reviews_arc[0] : review_primal_arc;
                con_eng = reviews_eng[0] ? reviews_eng[0].split(',') : review_primal_eng;
            }
            else {
                if (reviews_law[i] != undefined) con_law = reviews_law[i];
                if (reviews_arc[i] != undefined) con_arc = reviews_arc[i];
                let re = reviews_eng[i] ? reviews_eng[i].split(',') : [undefined, undefined]
                if (reviews_eng[0] != undefined && reviews_eng[1] != undefined) con_eng = re;
            }
        }
        return { law: con_law, arc: con_arc, eng: con_eng, rec: row.rec_review, rec2: row.rec_review_2, not_1: row.clock_not_1, not_2: row.clock_not_2 }
    }

    function _con_corr(row) {
        //let days_acta = dateParser_dateDiff(row.clock_date, row.clock_not_1 ?? row.clock_not_2);
        let days_corr = dateParser_timePassed(row.clock_not_1 ?? row.clock_not_2 ?? false) || false;
        return { cor: days_corr, ext: row.clock_record_postpone }

    }

    function _con_pay2(row) {
        let pay_var = row.clock_pay_62;
        let pay_mun = row.clock_pay_63;
        let pay_uis = row.clock_pay_64;
        let pay_urba = row.clock_pay_65;
        let payments = [pay_var, pay_mun];

        if (row.clock_pay_62_c != 'NA') payments.push(pay_var);
        if (row.clock_pay_63_c != 'NA') payments.push(pay_mun);
        if (row.clock_pay_64_c != 'NA') payments.push(pay_uis);
        if (row.clock_pay_65_c != 'NA') payments.push(pay_urba);

        let pay_days = dateParser_timePassed(row.clock_pay_not_1 ?? row.clock_pay_not_2) || false;
        let limit = dateParser_dateDiff(row.clock_pay_not_1 ?? row.clock_pay_not_2, row.clock_pay_69) || 30
        let timeLeft = dateParser_timeLeft(row.clock_pay_not_1 ?? row.clock_pay_not_2, limit)
        return { pay: payments, pay_days: pay_days, timeLeft: timeLeft };
    }

    function _con_res(row) {
        let pay = row.clock_pay_69;
        return pay;
    }

    function _con_lic(row) {
        let con1 = row.clock_not_1_res || row.clock_not_2_res;
        let con2 = row.clock_publication;
        let con3 = row.clock_not_3_res;
        let con_rec = row.tipo ? row.tipo.includes('F') : false;
        if (con_rec) return (con1 && con3) || con2
        return con1 || con2
    }

    function _con_neg(row) {
        let con1 = row.clock_license;
        return con1
    }

    function curateData(load_data) {
        let _datac = datac;
        load_data.map((row, i) => {

            if (row.state >= 100) return;

           

            let con1 = row.state >= 5 && row.state < 100
            let con2 = row.rec_review != 1 && (row.rec_review_2 != 1 || row.rec_review_2 == 2)
            let con21 = row.rec_review != null && row.rec_review != 1 && row.rec_review_2 != 1
            let con22 = row.rec_review == null && row.rec_review_2 != 1
            let con3 = row.clock_license;
            let con10 = !row.clock_license_2;
            let conOA = regexChecker_isOA_2(row)
            let conRevPro = regexChecker_isOA_3(row)

            

            let worker_law = row.asign_law_worker_name ?? row.asign_ph_law_worker_name ?? '';
            let worker_arc = row.asign_arc_worker_name ?? row.asign_ph_arc_worker_name ?? '';
            let worker_est = row.asign_eng_worker_name ?? '';
            let namesFowDataGen = [false, false, false]

            worker_law = worker_law.split(" ").map((n) => n[0]).join("");
            worker_arc = worker_arc.split(" ").map((n) => n[0]).join("");
            worker_est = worker_est.split(" ").map((n) => n[0]).join("");

            let rowDataen = { ...row };
            if (namesFowDataGen[0]) rowDataen = { ...rowDataen, wnl: worker_law };
            if (namesFowDataGen[1]) rowDataen = { ...rowDataen, wna: worker_arc };
            if (namesFowDataGen[2] && rules[1] != 1) rowDataen = { ...rowDataen, wne: worker_est };
            if (row.state < 100) _datac.gen.push({ ...rowDataen })

            let rules = row.rules ? row.rules.split(';') : [];

            if(conRevPro && (row.state == 1 || row.state == 5)) {
                let days_rad = 30 - dateParser_timePassed(row.clock_payment)
                let revColor = 'primary';
                if (row.state == 5) {
                    revColor = 'warning';
                    days_rad = 30 - dateParser_timePassed(row.clock_date)
                }
                return _datac.other.push({ ...row, contextTest: days_rad, color:revColor }) /** OTHER */
            }
            if (con1 && !con3) {
                let rowCon_law = _con_law(row, 'law')
                let rowCon_arc = _con_arc(row, 'arc')
                let rowCon_eng = _con_eng(row, 'eng')

                if (rowCon_law) { _datac.law.push({ ...row, color: 'success', wn: worker_law, }); namesFowDataGen[0] = true } /** JUR */
                if (rowCon_arc && !conOA) { _datac.arc.push({ ...row, color: 'success', wn: worker_arc, }); namesFowDataGen[1] = true } /** ARC */
                if (rowCon_eng && !conOA && rules[1] != 1) { _datac.eng.push({ ...row, color: 'success', wn: worker_est, }); namesFowDataGen[2] = true }/** EST */

                if (rowCon_eng || rowCon_arc || rowCon_law) return;

                let lastVR = { date: row.clock_payment || row.clock_date, codes: [], type: 0 };

                row.vrdocs.map(doc => {
                    if (moment(doc.date).isSameOrAfter(lastVR.date)) lastVR = doc;
                })


                if (con2) {

                    rowCon_law = _con_check(row, 'law', lastVR, VRDI.law2)
                    rowCon_arc = _con_check(row, 'arc', lastVR, VRDI.arc)
                    rowCon_eng = _con_check(row, 'eng', lastVR, VRDI.eng)

                    let color_review = 'warning';
                    if (lastVR.type == 3) color_review = 'primary'

                    //if (rowCon_law === 'law' && con2) { _datac.law.push({ ...row, color: 'primary', wn: worker_law, }); namesFowDataGen[0] = true }
                    //if (rowCon_arc === 'arc' && con2 && !conOA) { _datac.arc.push({ ...row, color: 'primary', wn: worker_arc, }); namesFowDataGen[1] = true }
                    //if (rowCon_eng === 'eng' && con2 && !conOA) { _datac.eng.push({ ...row, color: 'primary', wn: worker_est, }); namesFowDataGen[2] = true }
                    if (rowCon_law === 'law2') { _datac.law.push({ ...row, color: color_review, wn: worker_law, }); namesFowDataGen[0] = true }
                    if (rowCon_arc === 'arc2' && !conOA) { _datac.arc.push({ ...row, color: color_review, wn: worker_arc, }); namesFowDataGen[1] = true }
                    if (rowCon_eng === 'eng2' && !conOA && rules[1] != 1) { _datac.eng.push({ ...row, color: color_review, wn: worker_est, }); namesFowDataGen[2] = true }
                }


                /** check */
                let check_law = _con_check_2(row, 'law')
                let check_arc = _con_check_2(row, 'arc')
                let check_eng = _con_check_2(row, 'eng')

                let textCntx = '';
                let con_rx1 = check_law.rev == 0 && con21 && !check_law.inf;
                let con_rx2 = check_arc.rev == 0 && con21 && !check_arc.inf;
                let con_rx3 = check_eng.rev[1] == 0 && (check_eng.rev[1] == 0 || check_eng.rev[1] == 2) && con21 && !check_eng.inf;
                if (con_rx1) textCntx += 'J';
                if (con_rx2) textCntx += 'A';
                if (con_rx3 && rules[1] != 1) textCntx += 'E';
                if (con_rx1 || con_rx2 || con_rx3) _datac.check.push({ ...row, color: 'success', contextTest: textCntx })


                /** rec */
                let rowCon = _con_rec(row);
                let con4 = rowCon.arc != null && rowCon.law != null && ((rowCon.eng[0] != null && rowCon.eng[1] != null) || rules[1] == 1);
                let conNot = rowCon.not_1 || rowCon.not_2;
                let conActaNot = row.clock_not_1 || row.clock_not_2;
                if ((rowCon.rec == null || rowCon.rec == undefined) && con4) _datac.rec.push({ ...row })
                if ((rowCon.rec != null || rowCon.rec != undefined) && con4 && !conActaNot) _datac.rec.push({ ...row, color: 'success' })


                /** pay */

                let con5 = row.clock_pay_not_1 || row.clock_pay_not_2;
                let con6 = rowCon.arc == 1 && rowCon.law == 1 && rowCon.eng[0] == 1 && ((rowCon.eng[1] == 1 || rowCon.eng[1] == 2) || rules[1] == 1);
                let con71 = rowCon.rec == 1 && (rowCon.rec2 != 0);
                let con72 = rowCon.rec == 0 && (rowCon.rec2 == 1);
                let con73 = rowCon.rec == null && (rowCon.rec2 == 1);
                let con7 = con71 || con72 || con73
                rowCon = _con_pay2(row);
                if (con7 && !con5 && !con3 && !row.clock_pay2) _datac.pay.push({ ...row, })
                if (con7 && !con5 && !con3 && row.clock_pay2) _datac.pay.push({ ...row, color: 'success' })
                //if (con7 && con6 && con5 && !con3 && rowCon.pay.some(value => value == null)) _datac.pay.push({ ...row, color: 'success' })

                /** corr */
                //rowCon = _con_corr(row);
                let clock_ext = row.clock_record_postpone
                let limit_part_1 = TYPE_TIME[row.type || 'iii'];
                let limit_part_2 = row.clock_corrections ? (clock_ext ? 45 : 30) : 0;
                let limit = con22 ? limit_part_1 : clock_ext ? 45 : 30;

                let timeEva1 = dateParser_dateDiff(row.clock_record_p1, row.clock_date);

                let limit_timeEva2 = dateParser_finalDate(row.clock_corrections, (limit_part_1 - timeEva1));
                //let timeEva2 = dateParser_dateDiff(row.clock_corrections, row.clock_pay2 || moment().format('YYYY-MM-DD'));

                let dayEva = dateParser_timeLeft(row.clock_not_1 || row.clock_not_2 || row.clock_record_p1 || row.clock_date || row.clock_payment, row.clock_corrections || moment().format('YYYY-MM-DD'));
                //let limitDate = dateParser_finalDate(row.clock_not_1 || row.clock_not_2, clock_ext ? 45 : 30)
                let dayEva2 = dateParser_timeLeft(limit_timeEva2, row.clock_corrections || moment().format('YYYY-MM-DD'));


                //let con8 = rowCon.cor
                let con9 = dayEva2 || (limit - Math.abs(dayEva));
                let conPro = con9 <= 5 && !clock_ext;
                if (conActaNot && con2 && !con3 && con9 > 0) _datac.cor.push({ ...row, color: con9 < 0 ? 'danger' : (con9 < 10 ? (conPro ? 'secondary' : 'warning') : 'primary'), contextTest: con9 })
                /** neg 2 -  2,3 */
                if (con2 && !con3 && con9 <= 0) _datac.neg.push({ ...row, color: 'warning' })
                if (con7 && !con3) {


                    /** pay2 */
                    rowCon = _con_pay2(row);
                    if ((row.clock_pay_not_1 || row.clock_pay_not_2) && !row.clock_pay_69) {
                        let paymentTime = dateParser_dateDiff(row.clock_pay_not_1 ?? row.clock_pay_not_2, moment().format('YYYY-MM-DD'));
                        let _color = 30 - paymentTime >= 10 ? 'primary' : 30 - paymentTime > 0 ? 'warning' : 'danger'
                        if (paymentTime <= 30) _datac.pay2.push({ ...row, color: _color, contextTest: 30 - paymentTime })
                        /** neg 2 -  4 */
                        if (paymentTime > 30) _datac.neg.push({ ...row, color: 'warning' })
                    }

                    /** res */
                    let conRes = _con_res(row)
                    let conClockRes = row.clock_resolution
                    let resContext = row.clock_resolution_c;
                    let conContext = resContext == 'OTORGA' || resContext == 'CONCEDE'
                    let resNot = _con_lic(row);
                    if (!conClockRes && conRes && resContext == null && !resNot) _datac.res.push({ ...row, color: 'primary' })
                    if (conClockRes && conRes && conContext && !resNot) _datac.res.push({ ...row, color: 'success' })
                    if (conClockRes && conRes && conContext && resNot) _datac.res.push({ ...row, color: 'secondary' })


                    /** rsc2 */
                    conContext = resContext == 'NIEGA'
                    //if (!resContext &&  _con_res(row) && con7 && !con3 && conContext  && !resNot) _datac.res.push({ ...row, color: 'primary' })
                    if (conClockRes && conRes && conContext && !resNot) _datac.rsc2.push({ ...row, color: 'success' })
                    if (conClockRes && conRes && conContext && resNot) _datac.rsc2.push({ ...row, color: 'secondary' })

                    conContext = resContext == 'DESISTE'
                    //if (!resContext &&  _con_res(row) && con7 && !con3 && conContext  && !resNot) _datac.res.push({ ...row, color: 'primary' })
                    if (conClockRes && conRes && conContext && !resNot) _datac.neg.push({ ...row, color: 'success' })
                    if (conClockRes && conRes && conContext && resNot) _datac.neg.push({ ...row, color: 'secondary' })


                    /** rsc */
                    let conRsc = row.clock_resource
                    let conRscOut = row.clock_resource_solve
                    let daysRsc = moment().diff(conRsc, 'days');
                    if (conClockRes && conRes && resNot && conRsc && daysRsc <= 60 && !conRscOut) _datac.rsc.push({ ...row })
                    if (conClockRes && conRes && resNot && conRsc && daysRsc > 60 && !conRscOut) _datac.rsc.push({ ...row, color: 'warning' })


                    /** lic */
                    let licCon1 = row.clock_resource_solve  // RECURSO RESUELTO ->  row.clock_resource_solve 
                    let licCon2 = row.clock_forgave_terms // RENUNCIA TERMINOS ->  row.clock_forgave_terms 
                    let licCon3 = row.clock_not_1_res || row.clock_not_2_res || row.clock_publication; // NOTIFICACION RESO / PUBLICACION -> row.clock_not_1_res || row.clock_not_2_res || row.clock_publication || row.clock_publication;
                    conRes = licCon1 || licCon2 || licCon3
                    let conTime = dateParser_timePassed(conRes);
                    //let licConA = row.clock_license  // FECHA LICENCIA  -> row.clock_license 
                    if (conTime > 10) _datac.lic.push({ ...row })

                }

            } else {
                if (con3 && con10) _datac.lic2.push({ ...row }) /** lic2 */
                if (con3 && !con10 && !row.clock_archive) _datac.lic2.push({ color: 'success', ...row }) /** lic2 */
                if (row.state < -100) _datac.neg.push({ ...row, color: 'danger' }) /** neg */

                if (row.state == 1 || row.state == -1) {
                    let days_rad = conOA ? dateParser_dateDiff(dateParser_finalDate(row.clock_prorroga, -30), moment().format('YYYY-MM-DD'), true ) : (30 - dateParser_timePassed(row.clock_payment));
                    /** inc */
                    let color = !row.clock_payment ? 'danger' : days_rad < 0 ? 'danger' : days_rad < 10 ? 'warning' : 'primary';
                    if (conOA) color = !row.clock_prorroga ? 'danger' :  days_rad < 0 ? 'danger' : days_rad < 10 ? 'warning' : 'primary';
                    let inc_text = ""
                    if (conOA) inc_text += 'PROG\n';
                    if (row.clock_payment) inc_text += days_rad;

                    if (days_rad >= 0) {
                        _datac.inc.push({ ...row, contextTest: inc_text, color: color })

                        /** LAW, ARQ, ENG */
                        let rowCon_law = _con_law(row, 'law')
                        let rowCon_arc = _con_arc(row, 'arc')
                        let rowCon_eng = _con_eng(row, 'eng')
                        if (rowCon_law) { _datac.law.push({ ...row, color: 'dark', wn: worker_law, }); namesFowDataGen[0] = true } /** JUR */
                        if (rowCon_arc && !conOA) { _datac.arc.push({ ...row, color: 'dark', wn: worker_arc, }); namesFowDataGen[1] = true } /** ARC */
                        if (rowCon_eng && !conOA && rules[1] != 1) { _datac.eng.push({ ...row, color: 'dark', wn: worker_est, }); namesFowDataGen[2] = true }/** EST */


                        /** check */
                        let check_law = _con_check_2(row, 'law')
                        let check_arc = _con_check_2(row, 'arc')
                        let check_eng = _con_check_2(row, 'eng')

                        let textCntx = '';
                        let con_rx1 = !check_law.inf && !check_law.rev == null;
                        let con_rx2 = !check_arc.inf && !check_arc.rev == null;
                        let con_rx3 = !check_eng.inf && !check_eng.rev[0] == null && !check_eng.rev[1] == null;
                        if (con_rx1) textCntx += 'J';
                        if (con_rx2) textCntx += 'A';
                        if (con_rx3 && rules[1] != 1) textCntx += 'E';
                        if (con_rx1 || con_rx2 || con_rx3) _datac.check.push({ ...row, color: 'dark', contextTest: textCntx })

                    }
                    /** neg 2 -  1 */
                    if (days_rad < 0) _datac.neg.push({ ...row, color: 'warning' })
                }

            }


        })

        _datac.law = _SET_PRIORITY(_datac.law, true);
        _datac.eng = _SET_PRIORITY(_datac.eng, true);
        _datac.arc = _SET_PRIORITY(_datac.arc, true);
        //_datac.check = _SET_PRIORITY(_datac.check, true);
        //_datac.cor = _SET_PRIORITY(_datac.cor, true);
        //_datac.res = _SET_PRIORITY(_datac.res, true);
        //_datac.lic = _SET_PRIORITY(_datac.lic, true);
        //_datac.pay = _SET_PRIORITY(_datac.pay, true);
        //_datac.pay2 = _SET_PRIORITY(_datac.pay2, true);
        //_datac.neg = _SET_PRIORITY(_datac.neg, true);
        //_datac.neg2 = _SET_PRIORITY(_datac.neg2, true);
        setDatac(_datac)
        setLoad2(true)
        //console.log('end set')
    }

    let _filter = (item) => {
        let filterArray = filter.split(',')
        let con1 = item.id_public;
        let con2 = filterArray.some(_filterStr => {
            let check1 = item.id_public.toLowerCase();
            let check2 = item.wn || '';
            let check3 = [(item.wna || '').toLowerCase(), (item.wna || '').toLowerCase(), (item.wne || '').toLowerCase()]
            check2 = check2.toLowerCase()

            let con = (_filterStr).toLowerCase().trim()

            return check1.includes(con) || check2.includes(con) || check3.includes(con)
        })
        return con1 && con2
    }
    // ******************************* JSX ***************************** // 
    const subHeaderComponentMemo = () => {
        return (
            <div class="input-group mb-2">
                <span class="input-group-text bg-light">
                    <i class="fas fa-search"></i>
                </span>
                <input type='text' className='form-control' placeholder='Busqueda...' id="ti-search"
                    onChange={(e) => setFilter(e.target.value)} defaultValue={filter} />
                {filter ?
                    <MDBBtn link color="danger" size="sm" onClick={() => { setFilter(''); document.getElementById('ti-search').value = '' }}><i class="fas fa-times"></i> </MDBBtn>
                    : ''}

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
                    setDatac(defaultData);
                    //retrieveMacro();
                }}>CARGAR</MDBBtn>
            </div>
        );
    }
    let _INFO_POP = (title, text, colors = {}) => {
        return <MDBPopoverBody>
            <h6 className='fw-bold'>{title}</h6>
            <p>{text}</p>
            {colors.primary ? <h6 className='text-primary'>{colors.primary}</h6> : ''}
            {colors.warning ? <h6 className='text-warning'>{colors.warning}</h6> : ''}
            {colors.success ? <h6 className='text-success'>{colors.success}</h6> : ''}
            {colors.info ? <h6 className='text-info'>{colors.info}</h6> : ''}
            {colors.secondary ? <h6 className='text-secondary'>{colors.secondary}</h6> : ''}
            {colors.danger ? <h6 className='text-danger'>{colors.danger}</h6> : ''}
            {colors.dark ? <h6 className='text-dark'>{colors.dark}</h6> : ''}
        </MDBPopoverBody>
    }
    let _MODULE_BTN_POP = (row) => {
        const isOA = regexChecker_isOA_2(row);
        let rules = row.rules ? row.rules.split(';') : [];
        return <MDBPopoverBody>
            <>
                {row.priority_index ?
                    <div class="list-group list-group-flush">
                        <label>INDICE DE PRIORIDAD: {row.priority_index}</label>
                    </div>
                    : ' '}

                <div class="list-group list-group-flush">
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
            </>
        </MDBPopoverBody>
    }
    let text_context_btn = (row) => {
        if ((!row.priority_index && !row.wn) && row.contextTest == null) return ''
        let contextTest
        if (row.contextTest != null) contextTest = row.contextTest
        else if (row.constants & row.state >= 5) contextTest = row.constants[1] - row.constants[3]
        else contextTest = '';

        if (row.wn) contextTest = row.wn + ' ' + contextTest
        let component = <h6 className={selectedBtn != row.id_public ? 'text-dark fw-normal my-0 py-0' : 'text-light my-0 py-0'}>{contextTest}</h6>
        return component;
    }
    let TABLE_BTNS = (datas) => {
        return <div className='row'>
            {datas.map(btn => {
                return <>
                    <div className='col-4 mx-0 px-0' style={{ marginTop: '1px' }}>
                        <MDBPopover size='sm' color={btn.color ?? 'primary'} placement='bottom' dismiss rounded
                            outline={selectedBtn != btn.id_public}
                            btnChildren={<>
                                {text_context_btn(btn)}
                                <h6 className={selectedBtn != btn.id_public ? ('text-dark fw-normal my-0 py-0') : 'text-light my-0 py-0'}>{(btn.id_public).slice(-7)}</h6>
                            </>}
                            onClick={() => setSbtn(btn.id_public)}>
                            {_MODULE_BTN_POP(btn)}
                        </MDBPopover>
                    </div>
                </>
            })}
        </div>
    }
    const TABLE_HEADER = () => {
        return <>

            <div className="row border bg-info py-1 text-white fw-bold" style={{ position: 'sticky', top: 0 }} >
                <div className="col text-center m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>RADICACIÓN ({datac.inc.length})</h6>} >
                        {_INFO_POP('RADICACIÓN', 'Solicitudes radicadas, incompletas con termino para estar en LyDF',
                            { primary: 'AZUL = Término mayor a 10 días', warning: 'AMARILLO = A 10 días habiles de terminar', danger: 'ROJO = Sin fecha de pago' })}
                    </MDBPopover>
                </div>
                <div className="col text-center m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>OTROS ({datac.other.length})</h6>} >
                        {_INFO_POP('OTROS', 'Revalidaciones',
                            { })}
                    </MDBPopover>
                </div>
                <div className="col text-center m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>JURÍDICO ({datac.law.length})</h6>} >
                        {_INFO_POP('JURÍDICO', 'Solicitudes programadas para revisión y/o asignadas (Clave de revisor y tiempo)',
                            { success: 'VERDE = Observaciones / Primera Revisión', dark: 'NEGRO = Solicitud Incompleta', warning: 'AMARILLO = Asistencia técnica', primary: 'AZUL = Entrega de correciones' })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark' >ARQUITECTÓNICO  ({datac.arc.length})</h6>}>
                        {_INFO_POP('ARQUITECTÓNICO', 'Solicitudes en LyDF, programadas para revisión y/o asignadas (Clave de revisor y tiempo)',
                            { success: 'VERDE = Observaciones / Primera Revisión', dark: 'NEGRO = Solicitud Incompleta', warning: 'AMARILLO = Asistencia técnica', primary: 'AZUL = Entrega de correciones' })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>ESTRUCTURAL ({datac.eng.length})</h6>}>
                        {_INFO_POP('ESTRUCTURAL', 'Solicitudes en LyDF, programadas para revisión y/o asignadas (Clave de revisor y tiempo)',
                            { success: 'VERDE = Observaciones / Primera Revisión', dark: 'NEGRO = Solicitud Incompleta', warning: 'AMARILLO = Asistencia técnica', primary: 'AZUL = Entrega de correciones' })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>INFORMAR REVISIONES ({datac.check.length})</h6>}>
                        {_INFO_POP('INFORMAR REVISIONES', 'Solicitudes con revision no viable y que no han sido informadas al solicitante. J = Juridico, A = Arquitectoico, E = Estructural',
                            { success: 'VERDE = Solicitud en LyDF', dark: 'NEGRO = Solicitud Incompleta', })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>ACTA DE OBSERVACIONES ({datac.rec.length})</h6>}>
                        {_INFO_POP('ACTA DE OBSERVACIONES', 'Parte 1 Observaciones',
                            { success: 'VERDE = En proceso de notificación', primary: 'AZUL = Para generar, informes conciliados', })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>NOTIFICADO Y SUSPENDIDO (CORRECCIONES) ({datac.cor.length})</h6>}>
                        {_INFO_POP('NOTIFICADO Y SUSPENDIDO (CORRECCIONES)', 'Solicitudes cuya Acta ya fue notificada y están en proceso de correcciones.',
                            { primary: 'AZUL = Término mayor a 10 días', warning: 'AMARILLO = A 10 días habiles de terminar', secondary: 'MORADO = A 5 días de cumplir termino y debe solicitar prorroga' })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>ACTO DE VIABILIDAD ({datac.pay.length})</h6>}>
                        {_INFO_POP('ACTO DE VIABILIDAD', 'Acta de correcciones - liquidación',
                            { primary: 'AZUL = Sin generar acta de viabilidad', success: 'VERDE = En proceso de notificación del acta', })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>NOTIFICADO Y SUSPENDIDO (PAGOS) ({datac.pay2.length})</h6>}>
                        {_INFO_POP('NOTIFICADO Y SUSPENDIDO (PAGOS)', 'Solicitudes con viabilidad notificada y en espera de radicación de pagos',
                            { primary: 'AZUL = Término mayor a 10 días', warning: 'AMARILLO = A 10 días habiles de terminar', })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>RESOLUCIÓN (CONCEDE) ({datac.res.length})</h6>}>
                        {_INFO_POP('RESOLUCIÓN  (CONCEDE)', '',
                            { success: 'VERDE = Resolución generada y en proceso de notificacion', secondary: 'MORADO = Generada y notificada', primary: 'AZUL = Resolucion sin generar' })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>RESOLUCIÓN (NEGADO) ({datac.rsc2.length})</h6>}>
                        {_INFO_POP('RESOLUCIÓN (NEGADO)', '',
                            { success: 'VERDE = Resolución generada y en proceso de notificacion', secondary: 'MORADO = Generada y notificada', primary: 'AZUL = Resolucion sin generar' })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>RESOLUCIÓN (DESISTIDO)   ({datac.neg.length})</h6>}>
                        {_INFO_POP('RESOLUCIÓN (DESISTIDO) ', 'Solicitudes que han sido declaradas como desistidas, estan en proceso de desistimiento o cumplen los requisitos para desistir.',
                            { primary: 'AZUL = Resolución generada y en proceso de notificacion', secondary: 'MORADO = Generada y notificada', warning: 'AMARILLO = Cumplen requisitos para desistir de forma voluntaria, no radicó los pagos, Su resultado no subsanó las observaciones, no radicó en LyDF, no radicó fotografia valla ', danger: 'ROJO = En proceso de desistimiento' })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>RECURSO  ({datac.rsc.length})</h6>}>
                        {_INFO_POP('RECURSO ', 'Recursos en tramite, con notificacion de la resolucion y aun en 60 dias calendario.',
                            { primary: 'AZUL = En 60 dias calendario', warning: 'AMARILLO = Fuera de los 60 dias calendario' })}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>EJECUTORIA (LICENCIA) ({datac.lic.length})</h6>}>
                        {_INFO_POP('EJECUTORIA (LICENCIA)', 'Cuando queda en firme la resolución. (10 días después de la notificación, publicación, renuncia de terminos o recurso resuelto)',)}
                    </MDBPopover>
                </div>
                <div className="col text-center  m-0 p-0">
                    <MDBPopover size='sm' color={'link'} placement='top' dismiss rounded
                        btnChildren={<h6 className='m-0 p-0 text-dark'>ENTREGA DE LICENCIA ({datac.lic2.length})</h6>}>
                        {_INFO_POP('ENTREGA DE LICENCIA', 'Solicitudes que YA se expidió la ejecutoria y NO se han entregado los documentos.',
                            { success: 'VERDE = Con documentos entregados y en espera de cerrar/archivar el proceso', primary: 'AZUL = Por entregar documentos', })}
                    </MDBPopover>
                </div>
            </div>
        </>
    }
    const TABLE_MAIN_HEADER = () => {
        return <>
            <div className="row text-white fw-bold mx-0 px-0"  >
                <div className="col-5 text-center m-0 p-0 border border-ligh bg-info" style={{ width: '220px' }}>
                    <h5 className='m-0 p-0 text-dark'>RADICACION </h5>
                </div>
                <div className="col-5 text-center m-0 p-0 border border-ligh bg-info" style={{ width: '1410px' }}>
                    <h5 className='m-0 p-0 text-dark'>ACTA </h5>
                </div>
                <div className="col-5 text-center  m-0 p-0 border border-light bg-info" style={{ width: '1850px' }} >
                    <h5 className='m-0 p-0 text-dark'>EXPEDICIÓN </h5>
                </div>
            </div>
        </>
    }

    const TABLE_BODY = (datas) => {
        return <div className="row  px-1 ">
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Inncompleta {'>='} 10 días ({datas.inc.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.inc.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))}  {/** inc */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Incompleta {'<'} 10 días ({datas.inc.filter(item => _filter(item)).filter(item => item.color == 'warning').length})</h5>
                        {TABLE_BTNS(datas.inc.filter(item => _filter(item)).filter(item => item.color == 'warning'))}  {/** inc */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Sin Pago expensas fijas ({datas.inc.filter(item => _filter(item)).filter(item => item.color == 'danger').length})</h5>
                        {TABLE_BTNS(datas.inc.filter(item => _filter(item)).filter(item => item.color == 'danger'))}  {/** inc */}
                    </div>
                </div>
            </div>

            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Revalidaciones - Inncompleta ({datas.other.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.other.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))}  {/** rev - inc */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Revalidaciones - LyDF ({datas.other.filter(item => _filter(item)).filter(item => item.color == 'warning').length})</h5>
                        {TABLE_BTNS(datas.other.filter(item => _filter(item)).filter(item => item.color == 'warning'))}  {/** rev - lydf */}
                    </div>
                </div>


            </div>

            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Primera revisión ({datas.law.filter(item => _filter(item)).filter(item => item.color == 'success').length})</h5>
                        {TABLE_BTNS(datas.law.filter(item => _filter(item)).filter(item => item.color == 'success'))}  {/** JUR */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Revisión técnica ({datas.law.filter(item => _filter(item)).filter(item => item.color == 'warning').length})</h5>
                        {TABLE_BTNS(datas.law.filter(item => _filter(item)).filter(item => item.color == 'warning'))}  {/** JUR */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Correcciones ({datas.law.filter(item => _filter(item)).filter(item => item.color == 'primary').length})</h5>
                        {TABLE_BTNS(datas.law.filter(item => _filter(item)).filter(item => item.color == 'primary'))}  {/** JUR */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Incompleta ({datas.law.filter(item => _filter(item)).filter(item => item.color == 'dark').length})</h5>
                        {TABLE_BTNS(datas.law.filter(item => _filter(item)).filter(item => item.color == 'dark'))}  {/** JUR */}
                    </div>
                </div>

            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Primera revisión ({datas.arc.filter(item => _filter(item)).filter(item => item.color == 'success').length})</h5>
                        {TABLE_BTNS(datas.arc.filter(item => _filter(item)).filter(item => item.color == 'success'))}  {/** ARC */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Revisión técnica ({datas.arc.filter(item => _filter(item)).filter(item => item.color == 'warning').length})</h5>
                        {TABLE_BTNS(datas.arc.filter(item => _filter(item)).filter(item => item.color == 'warning'))}  {/** ARC */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Correcciones ({datas.arc.filter(item => _filter(item)).filter(item => item.color == 'primary').length})</h5>
                        {TABLE_BTNS(datas.arc.filter(item => _filter(item)).filter(item => item.color == 'primary'))}  {/** ARC */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Incompleta ({datas.arc.filter(item => _filter(item)).filter(item => item.color == 'dark').length})</h5>
                        {TABLE_BTNS(datas.arc.filter(item => _filter(item)).filter(item => item.color == 'dark'))}  {/** ARC */}
                    </div>
                </div>

            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Primera revisión ({datas.eng.filter(item => _filter(item)).filter(item => item.color == 'success').length})</h5>
                        {TABLE_BTNS(datas.eng.filter(item => _filter(item)).filter(item => item.color == 'success'))} {/** EST */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Revisión técnica ({datas.eng.filter(item => _filter(item)).filter(item => item.color == 'warning').length})</h5>
                        {TABLE_BTNS(datas.eng.filter(item => _filter(item)).filter(item => item.color == 'warning'))} {/** EST */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Correcciones ({datas.eng.filter(item => _filter(item)).filter(item => item.color == 'primary').length})</h5>
                        {TABLE_BTNS(datas.eng.filter(item => _filter(item)).filter(item => item.color == 'primary'))} {/** EST */}
                    </div>
                </div>

                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Incompleta ({datas.eng.filter(item => _filter(item)).filter(item => item.color == 'dark').length})</h5>
                        {TABLE_BTNS(datas.eng.filter(item => _filter(item)).filter(item => item.color == 'dark'))} {/** EST */}
                    </div>
                </div>

            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>LyDF ({datas.check.filter(item => _filter(item)).filter(item => item.color == 'success').length})</h5>
                        {TABLE_BTNS(datas.check.filter(item => _filter(item)).filter(item => item.color == 'success'))}  {/** check  */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Incompleta ({datas.check.filter(item => _filter(item)).filter(item => item.color == 'dark').length})</h5>
                        {TABLE_BTNS(datas.check.filter(item => _filter(item)).filter(item => item.color == 'dark'))}  {/** check  */}
                    </div>
                </div>

            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Sin Acta ({datas.rec.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.rec.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))}   {/** rec */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Notificando ({datas.rec.filter(item => _filter(item)).filter(item => item.color == 'success').length})</h5>
                        {TABLE_BTNS(datas.rec.filter(item => _filter(item)).filter(item => item.color == 'success'))}   {/** rec */}
                    </div>
                </div>

            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Correciones {'>='} 10 días ({datas.cor.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.cor.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))}   {/** corr */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Correciones {'<'} 10 días ({datas.cor.filter(item => _filter(item)).filter(item => item.color == 'warning').length})</h5>
                        {TABLE_BTNS(datas.cor.filter(item => _filter(item)).filter(item => item.color == 'warning'))}   {/** corr */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Correciones {'<'} 5 días, debe pedir prórroga ({datas.cor.filter(item => _filter(item)).filter(item => item.color == 'secondary').length})</h5>
                        {TABLE_BTNS(datas.cor.filter(item => _filter(item)).filter(item => item.color == 'secondary'))}   {/** corr */}
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Sin Viabilidad ({datas.pay.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.pay.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))}   {/** pay */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Notificando  ({datas.pay.filter(item => _filter(item)).filter(item => item.color == 'success').length})</h5>
                        {TABLE_BTNS(datas.pay.filter(item => _filter(item)).filter(item => item.color == 'success'))}   {/** pay */}
                    </div>
                </div>

            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Pagos {'>='} 10 días ({datas.pay2.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.pay2.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))}   {/** pay2 */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Pagos {'<'} 10 días ({datas.pay2.filter(item => _filter(item)).filter(item => item.color == 'warning').length})</h5>
                        {TABLE_BTNS(datas.pay2.filter(item => _filter(item)).filter(item => item.color == 'warning'))}   {/** pay2 */}
                    </div>
                </div>

            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Sin resolución ({datas.res.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.res.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))}   {/** res */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Notificando ({datas.res.filter(item => _filter(item)).filter(item => item.color == 'warning').length})</h5>
                        {TABLE_BTNS(datas.res.filter(item => _filter(item)).filter(item => item.color == 'warning'))}   {/** res */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Generada y Notificada ({datas.res.filter(item => _filter(item)).filter(item => item.color == 'secondary').length})</h5>
                        {TABLE_BTNS(datas.res.filter(item => _filter(item)).filter(item => item.color == 'secondary'))}   {/** res */}
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Sin resolución ({datas.rsc2.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.rsc2.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))}   {/** rsc2 */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Notificando ({datas.rsc2.filter(item => _filter(item)).filter(item => item.color == 'secondary').length})</h5>
                        {TABLE_BTNS(datas.rsc2.filter(item => _filter(item)).filter(item => item.color == 'secondary'))}   {/** rsc2 */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Generada y Notificada ({datas.rsc2.filter(item => _filter(item)).filter(item => item.color == 'secondary').length})</h5>
                        {TABLE_BTNS(datas.rsc2.filter(item => _filter(item)).filter(item => item.color == 'secondary'))}   {/** rsc2 */}
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Sin resolución ({datas.neg.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.neg.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))}   {/** rsc3 / neg */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Generada y Notificada ({datas.neg.filter(item => _filter(item)).filter(item => item.color == 'secondary').length})</h5>
                        {TABLE_BTNS(datas.neg.filter(item => _filter(item)).filter(item => item.color == 'secondary'))}   {/** rsc3 / neg */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Debe desistir ({datas.neg.filter(item => _filter(item)).filter(item => item.color == 'warning').length})</h5>
                        {TABLE_BTNS(datas.neg.filter(item => _filter(item)).filter(item => item.color == 'warning'))}   {/** rsc3 / neg */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Desistida ({datas.neg.filter(item => _filter(item)).filter(item => item.color == 'danger').length})</h5>
                        {TABLE_BTNS(datas.neg.filter(item => _filter(item)).filter(item => item.color == 'danger'))}   {/** rsc3 / neg */}
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Recurso {'<='} 60 días ({datas.rsc.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.rsc.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))}   {/** rsc */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Recurso {'>'} 60 días ({datas.rsc.filter(item => _filter(item)).filter(item => item.color == 'warning').length})</h5>
                        {TABLE_BTNS(datas.rsc.filter(item => _filter(item)).filter(item => item.color == 'warning'))}   {/** rsc */}
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'></h5>
                        {TABLE_BTNS(datas.lic.filter(item => _filter(item)))} {/** lic */}
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Por entregar ({datas.lic2.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null).length})</h5>
                        {TABLE_BTNS(datas.lic2.filter(item => _filter(item)).filter(item => item.color == 'primary' || item.color == null))} {/** lic2 */}
                    </div>
                </div>
                <div className="row">
                    <div className="col border border-info py-1">
                        <h5 className='fw-bold'>Por cerrar/archivar ({datas.lic2.filter(item => _filter(item)).filter(item => item.color == 'success').length})</h5>
                        {TABLE_BTNS(datas.lic2.filter(item => _filter(item)).filter(item => item.color == 'success'))} {/** lic2 */}
                    </div>
                </div>
            </div>
        </div>
    }

    let TOP_PAGE = () => {
        return <>
            <div className="row border p-1 text-white fw-bold" >
                <div className='col'>
                    {subHeaderComponentMemo()}
                </div>
                <div className='col'>
                    {idHeaderComponent()}
                </div>
            </div>
        </>
    }

    let CHART_GANTT = () => {

        return <>
            <div className='row'>
                <FUN_CHART_MACRO_GRANTT
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    items={datac.gen.filter(item => _filter(item))}
                    _UPDATE_FILTERS={(v) => {
                        setFilter(v.join(','));
                        document.getElementById('ti-search').value = v.join(',')
                    }}
                    _UPDATE_FILTERS_IDPUBIC={(v) => {
                        setFilter(v.join(','));
                        document.getElementById('ti-search').value = v.join(',')
                    }}
                    margin={{ bottom: 45, left: 400 }}
                />
            </div>
        </>
    }

    let TABLE = (datas) => {
        return <>
            {TABLE_MAIN_HEADER()}
            {TABLE_HEADER()}
            {TABLE_BODY(datas)}
        </>
    }

    // ******************************* APIS **************************** // 


    return <>
        {TOP_PAGE()}

        {load ?
            <>
                {load2 ?
                    <>
                        <div className='chart-clock'>
                            <div className='row mx-1  px-1' style={{ width: '3500px', maxHeight: '500px', minHeight: '100px' }} >
                                {TABLE(datac)}
                            </div>
                        </div>
                    </>
                    : <div className='row text-center' > <label className='fw-normal lead text-muted'>FILTRANDO...</label></div>}
                {CHART_GANTT()}
            </>
            : <div className='row text-center' > <label className='fw-normal lead text-muted'>CARGANDO...</label></div>}

    </>;
}
