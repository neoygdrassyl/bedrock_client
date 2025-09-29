import { MDBBtn } from 'mdb-react-ui-kit';
import moment from 'moment';
import React, { Component } from 'react';

import {
    Hint,
    DiscreteColorLegend,
    VerticalGridLines,
    XYPlot,
    HorizontalGridLines,
    XAxis,
    YAxis,
    HorizontalBarSeries,
    HorizontalRectSeries,
    MarkSeries,
    FlexibleXYPlot
} from 'react-vis';
import 'react-vis/dist/style.css';
import { dateParser_dateDiff, dateParser_finalDate, dateParser_timeLeft, dateParser_timePassed, regexChecker_isOA_2 } from '../../../../../components/customClasses/typeParse';

var _emptyData = {
    rad: [],
    eva: [],
    exp: [],
    end: [],

    des1: [],
    des2: [],
    des3: [],
    des4: [],
    des5: [],

    neg1: [],
    neg2: [],
    neg3: [],
    neg4: [],
}
const _tickValues = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200];
const _tickValues_2 = [0, 50, 100, 150, 200];
const YtickValues = [0, 1, 2, 3];
const reviewTimes = [
    [20, 25], [15, 20], [10, 20], [10, 15]
]
const TYPE_TIME = { 'iv': 45, 'iii': 35, 'ii': 25, 'i': 20, 'oa': 15 };

class FUN_CHART_MACRO_GRANTT extends Component {
    constructor(props) {
        super(props);
        this.state = {
            total: 0,
            data: _emptyData,
            bt_scope: 2,
        };
    }
    componentDidUpdate(prevProps) {
        if (prevProps.items.length != this.props.items.length) {
            this.setList();
        }
    }
    componentDidMount() {
        //this.setList();
    }

    setList() {

        let items = this.props.items;
        let newData = {
            rad: [],
            eva: [],
            exp: [],
            end: [],

            des1: [],
            des2: [],
            des3: [],
            des4: [],
            des5: [],

            neg1: [],
            neg2: [],
            neg3: [],
            neg4: [],
        };
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
                    con_law = reviews_law[i];
                    con_arc = reviews_arc[i];
                    con_eng = reviews_eng[i] ? reviews_eng[i].split(',') : [null, null];;
                }
            }
            return { law: con_law, arc: con_arc, eng: con_eng, rec: row.rec_review, rec2: row.rec_review_2, not_1: row.clock_not_1, not_2: row.clock_not_2 }
        }
        let _ADD_MARK = (index, _new_mark) => {
            var marks = newData[index];
            for (var i = 0; i < marks.length; i++) {
                if (marks[i].x == _new_mark.x) {
                    marks[i].name = marks[i].name + "\n" + _new_mark.name;
                    marks[i].group.push(_new_mark.name);
                    return;
                }
            }
            newData[index].push(_new_mark)
        }
        items.map(row => {
            if (row.clock_payment) {
                let _x = dateParser_dateDiff(row.clock_payment, moment().format('YYYY-MM-DD')) > 200 ? 200 : dateParser_dateDiff(row.clock_payment, moment().format('YYYY-MM-DD'))

                let _y = 0;
                if (row.type == 'iii' && row.state > -100) _y += 1;
                if (row.type == 'ii' && row.state > -100) _y += 2;
                if (row.type == 'i' && row.state > -100) _y += 3;

                if (row.state == -1 || row.state == 1) {
                    let conOA = regexChecker_isOA_2(row)
                    let days_rad =  conOA ? dateParser_dateDiff(dateParser_finalDate(row.clock_prorroga, -30), moment().format('YYYY-MM-DD'), true ) : 30 - dateParser_timePassed(row.clock_payment);
                    if (days_rad >= 0) _ADD_MARK('rad', {
                        x: _x,
                        y: _y + 0.2,
                        size: 1,
                        name: row.id_public,
                        id: row,
                        group: [row.id_public],
                        titleHint: 'RADICACIÓN',
                    })
                    else _ADD_MARK('neg1', {
                        x: _x,
                        y: 4.2,
                        size: 1,
                        name: row.id_public,
                        id: row,
                        group: [row.id_public],
                        titleHint: 'RADICACIÓN INCOMPLETA',
                    })
                }

                if (row.state == 5) {
                    let rowCon = _con_rec(row);
                    let con22 = row.rec_review == null && row.rec_review_2 != 1
                    let con71 = rowCon.rec == 1 && (rowCon.rec2 != 0);
                    let con72 = rowCon.rec == 0 && (rowCon.rec2 == 1);
                    let con73 = rowCon.rec == null && (rowCon.rec2 == 1);
                    let con7 = con71 || con72 || con73
                    rowCon = dateParser_dateDiff(row.clock_not_1 || row.clock_not_2 || row.clock_date || row.clock_payment, row.clock_corrections || moment().format('YYYY-MM-DD'));
                    let clock_ext = row.clock_record_postpone
                    let limit_part_1 = TYPE_TIME[row.type || 'iii'];
                    let limit_part_2 = row.clock_corrections ? (clock_ext ? 45 : 30) : 0;

                    let dayEva = dateParser_timeLeft(row.clock_not_1 || row.clock_not_2 || row.clock_date || row.clock_payment, row.clock_corrections || moment().format('YYYY-MM-DD'));
                    let limitDate = dateParser_finalDate(row.clock_not_1 || row.clock_not_2, clock_ext ? 45 : 30)
                    let dayEva2 = dateParser_timeLeft(limitDate, row.clock_corrections || moment().format('YYYY-MM-DD'));

                    let limit = con22 ? limit_part_1 : clock_ext ? 45 : 30;
                    let con8 = rowCon || _x;
                    let acta2Time =   (limit_part_1) + (30) + (row.clock_corrections ? 15: 0) + (5)
                    let limit_2 = dateParser_finalDate(row.clock_date, acta2Time )
                    let con9 = dateParser_dateDiff(limit_2,  row.rec_review_2 || moment().format('YYYY-MM-DD'), true)

                    if (rowCon) {
                        if (con9 > 0) _ADD_MARK('eva', {
                            x: _x,
                            y: _y + 0.4,
                            size: 1,
                            name: row.id_public,
                            id: row,
                            group: [row.id_public],
                            titleHint: 'EVALUACIÓN',
                        })
                        else if (con7) {
                            _ADD_MARK('exp', {
                                x: _x,
                                y: _y + 0.6,
                                size: 1,
                                name: row.id_public,
                                id: row,
                                group: [row.id_public],
                                titleHint: 'EXPEDICIÓN',
                            })
                        }
                        else if (con9 <= 0) _ADD_MARK('neg3', {
                            x: _x,
                            y: 4.4,
                            size: 1,
                            name: row.id_public,
                            id: row,
                            group: [row.id_public],
                            titleHint: 'NO PRESENTARON CORRECCIONES',
                        })
                    }

                }

                if (row.state == 50) {
                    if (row.clock_license) {
                        _ADD_MARK('end', {
                            x: _x,
                            y: _y + 0.8,
                            size: 1,
                            name: row.id_public,
                            id: row,
                            group: [row.id_public],
                            titleHint: 'EXPEDIDA',
                        })
                    } else {
                        let paymentTime = dateParser_dateDiff(row.clock_pay_not_1 || row.clock_pay_not_2, moment().format('YYYY-MM-DD'));
                        if ((row.clock_pay_not_1 || row.clock_pay_not_2) && !row.clock_pay_69) {
                            if ((paymentTime > 30)) _ADD_MARK('neg4', {
                                x: _x,
                                y: 4.6,
                                size: 1,
                                name: row.id_public,
                                id: row,
                                group: [row.id_public],
                                titleHint: 'NO PAGO EXPENSAS',
                            })
                            else _ADD_MARK('exp', {
                                x: _x,
                                y: _y + 0.6,
                                size: 1,
                                name: row.id_public,
                                id: row,
                                group: [row.id_public],
                                titleHint: 'EXPEDICIÓN',
                            })
                        }
                        else {
                            if (row.clock_pay2 || row.clock_pay_69 || row.clock_resolution) {
                                _ADD_MARK('exp', {
                                    x: _x,
                                    y: _y + 0.6,
                                    size: 1,
                                    name: row.id_public,
                                    id: row,
                                    group: [row.id_public],
                                    titleHint: 'EXPEDICIÓN',
                                })
                            } else {
                                let rowCon = _con_rec(row);
                                let con22 = row.rec_review == null && row.rec_review_2 != 1
                                let con71 = rowCon.rec == 1 && (rowCon.rec2 != 0);
                                let con72 = rowCon.rec == 0 && (rowCon.rec2 == 1);
                                let con73 = rowCon.rec == null && (rowCon.rec2 == 1);
                                let con7 = con71 || con72 || con73
                                rowCon = dateParser_dateDiff(row.clock_not_1 || row.clock_not_2 || row.clock_date || row.clock_payment, row.clock_corrections || moment().format('YYYY-MM-DD'));
                                let clock_ext = row.clock_record_postpone
                                let limit_part_1 = TYPE_TIME[row.type || 'iii'];
                                let limit_part_2 = row.clock_corrections ? (clock_ext ? 45 : 30) : 0;

                                let dayEva = dateParser_timeLeft(row.clock_not_1 || row.clock_not_2 || row.clock_date || row.clock_payment, row.clock_corrections || moment().format('YYYY-MM-DD'));
                                let limitDate = dateParser_finalDate(row.clock_not_1 || row.clock_not_2, clock_ext ? 45 : 30)
                                let dayEva2 = dateParser_timeLeft(limitDate, row.clock_corrections || moment().format('YYYY-MM-DD'));

                                let limit = con22 ? limit_part_1 : clock_ext ? 45 : 30;
                                let con8 = rowCon || _x;
                                let con9 = dayEva2 || (limit - Math.abs(dayEva));

                                if (rowCon) {
                                    if (con9 > 0) _ADD_MARK('eva', {
                                        x: _x,
                                        y: _y + 0.4,
                                        size: 1,
                                        name: row.id_public,
                                        id: row,
                                        group: [row.id_public],
                                        titleHint: 'EVALUACIÓN',
                                    })
                                    else if (con7) {
                                        _ADD_MARK('exp', {
                                            x: _x,
                                            y: _y + 0.6,
                                            size: 1,
                                            name: row.id_public,
                                            id: row,
                                            group: [row.id_public],
                                            titleHint: 'EXPEDICIÓN',
                                        })
                                    }
                                    else if (con9 <= 0) _ADD_MARK('neg3', {
                                        x: _x,
                                        y: 4.4,
                                        size: 1,
                                        name: row.id_public,
                                        id: row,
                                        group: [row.id_public],
                                        titleHint: 'NO PRESENTARON CORRECCIONES',
                                    })
                                }
                            }

                        }
                    }


                }

                if (row.state >= 100) {
                    _ADD_MARK('end', {
                        x: _x,
                        y: _y + 0.8,
                        size: 1,
                        name: row.id_public,
                        id: row,
                        group: [row.id_public],
                        titleHint: 'EXPEDIDA',
                    })
                }

                if (row.state <= -100) {
                    if (row.state == -101) _ADD_MARK('des1', {
                        x: _x,
                        y: 5.15,
                        size: 1,
                        name: row.id_public,
                        id: row,
                        group: [row.id_public],
                        titleHint: 'DESISTIDO: INCOMPLETO',
                    })

                    if (row.state == -102) _ADD_MARK('des2', {
                        x: _x,
                        y: 5.35,
                        size: 1,
                        name: row.id_public,
                        id: row,
                        group: [row.id_public],
                        titleHint: 'DESISTIDO: NO RADICO VALLA',
                    })

                    if (row.state == -103) _ADD_MARK('des3', {
                        x: _x,
                        y: 5.55,
                        size: 1,
                        name: row.id_public,
                        id: row,
                        group: [row.id_public],
                        titleHint: 'DESISTIDO: NO SUBSANO ACTA OBSERVACIONES',
                    })

                    if (row.state == -104) _ADD_MARK('des4', {
                        x: _x,
                        y: 5.75,
                        size: 1,
                        name: row.id_public,
                        id: row,
                        group: [row.id_public],
                        titleHint: 'DESISTIDO: NO PAGO EXPENSAS',
                    })

                    if (row.state == -105) _ADD_MARK('des5', {
                        x: _x,
                        y: 5.95,
                        size: 1,
                        name: row.id_public,
                        id: row,
                        group: [row.id_public],
                        titleHint: 'DESISTIDO: VOLUNTARIO',
                    })
                }
            }
        })
        this.setState({ data: newData })
    }
    render() {
        const { translation, swaMsg, globals, items, margin, hideExp } = this.props;
        const { data, bt_scope } = this.state;
        // COMPONENT JSX
        let _GET_HOOVER_BOX_CONTENT = _HOOVER => {
            return <>
                <label className="fw-bold">
                    {_HOOVER.titleHint}<br />
                    {_HOOVER.name} <br />
                    {_HOOVER.x} dia(s) </label>
            </>
        }

        // DES FUNCTIONS 

        let myData = () => {
            var val_1 = 0;
            var val_2 = 0;
            var val_3 = 0;
            var val_4 = 0;
            var val_5 = 0;
            var val_6 = 0;

            let items = data;

            val_1 += items.rad.length;
            val_2 += items.eva.length;
            val_3 += items.exp.length;
            val_4 += items.neg1.length + items.neg2.length + items.neg3.length + items.neg4.length;
            val_5 += items.des1.length + items.des2.length + items.des3.length + items.des4.length + items.des5.length;
            val_6 += items.end.length;

            let total = val_1 + val_2 + val_3 + val_4 + val_5 + val_6;
            let val_1_p = val_1 / total * 100;
            let val_2_p = val_2 / total * 100;
            let val_3_p = val_3 / total * 100;
            let val_4_p = val_4 / total * 100;
            let val_5_p = val_5 / total * 100;
            let val_6_p = val_6 / total * 100;


            var legends = [
                { angle: val_1, group: 'inc', val: val_1, val_p: val_1_p, color: 'DodgerBlue', title: 'RADICACIÓN: ' + val_1, strokeWidth: 10 },
                { angle: val_2, group: 'ldf', val: val_2, val_p: val_2_p, color: 'ForestGreen', title: 'EVALUACIÓN: ' + val_2, strokeWidth: 10 },
                { angle: val_3, group: 'via', val: val_3, val_p: val_3_p, color: 'Gold', title: 'EXPEDICIÓN: ' + val_3, strokeWidth: 10 },
                { angle: val_4, group: 'des', val: val_4, val_p: val_4_p, color: 'tomato', title: 'DEBE DESISTIR: ' + val_4, strokeWidth: 10 },
                { angle: val_5, group: 'des', val: val_5, val_p: val_5_p, color: 'Crimson', title: 'DESISTIDO: ' + val_5, strokeWidth: 10 },
            ]

            if (val_6) legends.push({ angle: val_6, group: 'end', val: val_6, val_p: val_6_p, color: 'Violet', title: `EXPEDIDA: ${val_6}`, strokeWidth: 10 },)
            return legends;
        }
        let totalList = () => {
            let list = myData();
            let sum = 0;
            list.map(v => sum += v.val)
            return sum
        }

        const maxTick = Math.max(..._tickValues); 
        
        return (
            <div >
                <div className="row text-center my-2">
                    <div className='col'>
                        <label className="fw-bold">TIEMPO DE SOLICITUDES ({totalList()})</label>
                    </div>
                    <div className='col-3 text-end'>
                        <div class="btn-group btn-group-sm" role="group" aria-label="...">
                            <MDBBtn color='primary' outline={bt_scope != 0} size='sm'
                                onClick={() => { this.setState({ bt_scope: 0 }) }}>OPTIMO</MDBBtn>
                            <MDBBtn color='primary' outline={bt_scope != 1} size='sm'
                                onClick={() => { this.setState({ bt_scope: 1 }) }}>PROMEDIO</MDBBtn>
                            <MDBBtn color='primary' outline={bt_scope != 2} size='sm'
                                onClick={() => { this.setState({ bt_scope: 2 }) }}>LIMITE</MDBBtn>
                        </div>
                    </div>
                </div>


                <div className="row g-0">
                    <div className="col-12 p-0">
                        <div className="d-flex w-100"> 
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <FlexibleXYPlot
                                    height={400}
                                    margin={{ left: 36, right: 10, top: 10, bottom: 30 }}
                                    yPadding={10}
                                    xDomain={[0, 180]}
                                    yDomain={[0, 6]}
                                >
                                <VerticalGridLines tickValues={_tickValues} tickTotal={_tickValues.length} />
                                <HorizontalGridLines tickValues={YtickValues} tickTotal={YtickValues.length} />
                                <YAxis
                                    tickValues={[0.5, 1.5, 2.5, 3.5]}
                                    tickFormat={t => (t===0.5?' IV ':t===1.5?' III ':t===2.5?' II ':t===3.5?' I ':'')}
                                    style={{ text: { fontSize: 12 } }}
                                />
                                <XAxis
                                    tickValues={_tickValues}
                                    tickFormat={v => v}
                                    style={{ text: { fontSize: 12 } }}
                                />


                            {reviewTimes.map((v, i) => {
                                let scopes = [
                                    { blank_time: 0, blank_time_2: 0, rad_time: 30, eva_time: -5, eva_time_2: -5 },
                                    { blank_time: 30, blank_time_2: 20, rad_time: 30, eva_time: 0, eva_time_2: -5 },
                                    { blank_time: 45, blank_time_2: 30, rad_time: 30, eva_time: 0, eva_time_2: 0 },
                                ]

                                let blank_time = scopes[bt_scope].blank_time;
                                let blank_time_2 = scopes[bt_scope].blank_time_2;
                                let rad_time = scopes[bt_scope].rad_time;
                                let eva_time = scopes[bt_scope].eva_time;
                                let eva_time_2 = scopes[bt_scope].eva_time_2;


                                let bars = [];

                                bars.push(<HorizontalRectSeries
                                    data={[{ x: 0, x0: rad_time, y: i, y0: i + 1 }]}
                                    color="rgba(30, 144, 235, 0.70)"
                                />)

                                bars.push(<HorizontalRectSeries // CHANGE THIS
                                    data={[{ x: rad_time, x0: rad_time + v[0] + eva_time, y: i, y0: i + 1 }]}
                                    color="rgba(34, 139, 34, 0.70)"
                                />)

                                bars.push(<HorizontalRectSeries
                                    data={[{ x: rad_time + v[0] + eva_time, x0: rad_time + v[0] + eva_time + blank_time, y: i, y0: i + 1 }]}
                                    color="rgba(220, 220, 220, 0.70)"
                                />)

                                bars.push(<HorizontalRectSeries  // AND THIS
                                    data={[{ x: rad_time + v[0] + eva_time + blank_time, x0: rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2, y: i, y0: i + 1 }]}
                                    color="rgba(34, 139, 34, 0.70)"
                                />)

                                bars.push(<HorizontalRectSeries
                                    data={[{ x: rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2, x0: rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 5, y: i, y0: i + 1 }]}
                                    color="rgba(173, 255, 47, 0.70)"
                                />)

                                bars.push(<HorizontalRectSeries
                                    data={[{ x: rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 5, x0: rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 10, y: i, y0: i + 1 }]}
                                    color="rgba(255, 215, 0, 0.70)"
                                />)

                                bars.push(<HorizontalRectSeries
                                    data={[{ x: rad_time + v[0] + eva_time + eva_time + blank_time + v[1] + eva_time_2 + 10, x0: rad_time + v[0] + eva_time + eva_time + blank_time + v[1] + eva_time_2 + 10 + blank_time_2, y: i, y0: i + 1 }]}
                                    color="rgba(220, 220, 220, 0.70)"
                                />)

                                bars.push(<HorizontalRectSeries
                                    data={[{ x: rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 10 + blank_time_2, x0: rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 10 + blank_time_2 + 20, y: i, y0: i + 1 }]}
                                    color="rgba(255, 215, 0, 0.70)"
                                />)

                                return bars.map(b => b)
                            })

                            }

                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.rad}
                                color={'DodgerBlue'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.eva}
                                color={'ForestGreen'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.exp}
                                color={'Orange'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.end}
                                color={'Violet'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                            {/** NEGATIVE */}
                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.neg1}
                                color={'tomato'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.neg3}
                                color={'tomato'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.neg4}
                                color={'tomato'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />


                            {/** NEGATIVE */}
                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.des1}
                                color={'Crimson'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.des2}
                                color={'Crimson'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.des3}
                                color={'Crimson'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.des4}
                                color={'Crimson'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                            <MarkSeries
                                sizeRange={[1, 5]}
                                data={data.des5}
                                color={'Crimson'}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS_IDPUBIC(e.group)} />


                            {this.state.hovered ?
                                <Hint value={this.state.hovered}>
                                    <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', marginTop: '0%', width: '200px', fontSize: 'small' }}>
                                        {_GET_HOOVER_BOX_CONTENT(this.state.hovered)}
                                    </div>
                                </Hint>
                                : null}
                        </FlexibleXYPlot>
                    </div></div></div>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={myData()}
                        />

                    </div>
                </div>

            </div >
        );
    }
}

export default FUN_CHART_MACRO_GRANTT;