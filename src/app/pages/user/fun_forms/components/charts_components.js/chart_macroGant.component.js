
import dayjs from 'dayjs';
import { useState, useEffect, useRef, memo } from 'react';
import { Button } from '@/components/ui/button';

import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceArea, Legend, ZAxis
} from 'recharts';
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

function LegacyMacroGanttLoading() {
    return (
        <div
            className="d-flex flex-column justify-content-center gap-3 py-4"
            style={{ minHeight: 280 }}
            data-testid="legacy-macro-gantt-loading"
        >
            <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Cargando gráfico de dispersión…</span>
                </div>
                <div className="ms-3">
                    <div className="fw-semibold text-dark">Cargando gráfico de dispersión…</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                        Preparando la dispersión temporal y sus divisiones.
                    </div>
                </div>
            </div>

            <div
                className="progress overflow-hidden"
                style={{ height: 10, backgroundColor: '#e2e8f0' }}
                aria-label="Progreso de carga del gráfico de dispersión"
            >
                <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                    role="progressbar"
                    style={{ width: '100%' }}
                    aria-valuenow={100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>

            <div className="d-flex justify-content-between text-muted" style={{ fontSize: 12 }}>
                <span>Clasificando licencias</span>
                <span>Renderizando puntos</span>
            </div>
        </div>
    );
}

function FUN_CHART_MACRO_GRANTT(props) {
    const { translation, swaMsg, globals, items, margin, hideExp, _UPDATE_FILTERS, _UPDATE_FILTERS_IDPUBIC } = props;
    const [data, setData] = useState(_emptyData);
    const [bt_scope, setBt_scope] = useState(2);
    const [hovered, setHovered] = useState(false);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const safeItems = Array.isArray(items) ? items : [];

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        const timer = setTimeout(() => {
            if (cancelled) return;
            setList();
            setLoading(false);
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [safeItems]);

    function setList() {
        let items = safeItems;
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
                let _x = dateParser_dateDiff(dayjs().format('YYYY-MM-DD'), row.clock_payment) > 200 ? 200 : dateParser_dateDiff(dayjs().format('YYYY-MM-DD'), row.clock_payment)

                let _y = 0;
                if (row.type == 'iii' && row.state > -100) _y += 1;
                if (row.type == 'ii' && row.state > -100) _y += 2;
                if (row.type == 'i' && row.state > -100) _y += 3;

                if (row.state == -1 || row.state == 1) {
                    let conOA = regexChecker_isOA_2(row)
                    let days_rad = conOA ? dateParser_dateDiff(dateParser_finalDate(row.clock_prorroga, -30), dayjs().format('YYYY-MM-DD'), true) : 30 - dateParser_timePassed(row.clock_payment);
                    if (days_rad >= 0) _ADD_MARK('rad', {
                        x: _x,
                        y: _y + 0.2,
                        size: 1,
                        name: row.id_public,
                        id: row,
                        group: [row.id_public],
                        titleHint: 'RADICACION',
                    })
                    else _ADD_MARK('neg1', {
                        x: _x,
                        y: 4.2,
                        size: 1,
                        name: row.id_public,
                        id: row,
                        group: [row.id_public],
                        titleHint: 'RADICACION INCOMPLETA',
                    })
                }

                if (row.state == 5) {
                    let rowCon = _con_rec(row);
                    let con22 = row.rec_review == null && row.rec_review_2 != 1
                    let con71 = rowCon.rec == 1 && (rowCon.rec2 != 0);
                    let con72 = rowCon.rec == 0 && (rowCon.rec2 == 1);
                    let con73 = rowCon.rec == null && (rowCon.rec2 == 1);
                    let con7 = con71 || con72 || con73
                    rowCon = dateParser_dateDiff(row.clock_not_1 || row.clock_not_2 || row.clock_date || row.clock_payment, row.clock_corrections || dayjs().format('YYYY-MM-DD'));
                    let clock_ext = row.clock_record_postpone
                    let limit_part_1 = TYPE_TIME[row.type || 'iii'];
                    let limit_part_2 = row.clock_corrections ? (clock_ext ? 45 : 30) : 0;

                    let dayEva = dateParser_timeLeft(row.clock_not_1 || row.clock_not_2 || row.clock_date || row.clock_payment, row.clock_corrections || dayjs().format('YYYY-MM-DD'));
                    let limitDate = dateParser_finalDate(row.clock_not_1 || row.clock_not_2, clock_ext ? 45 : 30)
                    let dayEva2 = dateParser_timeLeft(limitDate, row.clock_corrections || dayjs().format('YYYY-MM-DD'));

                    let limit = con22 ? limit_part_1 : clock_ext ? 45 : 30;
                    let con8 = rowCon || _x;
                    let acta2Time = (limit_part_1) + (30) + (row.clock_corrections ? 15 : 0) + (5)
                    let limit_2 = dateParser_finalDate(row.clock_date, acta2Time)
                    let con9 = dateParser_dateDiff(limit_2, row.rec_review_2 || dayjs().format('YYYY-MM-DD'), true)

                    if (rowCon) {
                        if (con9 > 0) _ADD_MARK('eva', {
                            x: _x,
                            y: _y + 0.4,
                            size: 1,
                            name: row.id_public,
                            id: row,
                            group: [row.id_public],
                            titleHint: 'EVALUACION',
                        })
                        else if (con7) {
                            _ADD_MARK('exp', {
                                x: _x,
                                y: _y + 0.6,
                                size: 1,
                                name: row.id_public,
                                id: row,
                                group: [row.id_public],
                                titleHint: 'EXPEDICION',
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
                        let paymentTime = dateParser_dateDiff(row.clock_pay_not_1 || row.clock_pay_not_2, dayjs().format('YYYY-MM-DD'));
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
                                titleHint: 'EXPEDICION',
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
                                    titleHint: 'EXPEDICION',
                                })
                            } else {
                                let rowCon = _con_rec(row);
                                let con22 = row.rec_review == null && row.rec_review_2 != 1
                                let con71 = rowCon.rec == 1 && (rowCon.rec2 != 0);
                                let con72 = rowCon.rec == 0 && (rowCon.rec2 == 1);
                                let con73 = rowCon.rec == null && (rowCon.rec2 == 1);
                                let con7 = con71 || con72 || con73
                                rowCon = dateParser_dateDiff(row.clock_not_1 || row.clock_not_2 || row.clock_date || row.clock_payment, row.clock_corrections || dayjs().format('YYYY-MM-DD'));
                                let clock_ext = row.clock_record_postpone
                                let limit_part_1 = TYPE_TIME[row.type || 'iii'];
                                let limit_part_2 = row.clock_corrections ? (clock_ext ? 45 : 30) : 0;

                                let dayEva = dateParser_timeLeft(row.clock_not_1 || row.clock_not_2 || row.clock_date || row.clock_payment, row.clock_corrections || dayjs().format('YYYY-MM-DD'));
                                let limitDate = dateParser_finalDate(row.clock_not_1 || row.clock_not_2, clock_ext ? 45 : 30)
                                let dayEva2 = dateParser_timeLeft(limitDate, row.clock_corrections || dayjs().format('YYYY-MM-DD'));

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
                                        titleHint: 'EVALUACION',
                                    })
                                    else if (con7) {
                                        _ADD_MARK('exp', {
                                            x: _x,
                                            y: _y + 0.6,
                                            size: 1,
                                            name: row.id_public,
                                            id: row,
                                            group: [row.id_public],
                                            titleHint: 'EXPEDICION',
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
        setData(newData)
    }

    let _GET_HOOVER_BOX_CONTENT = _HOOVER => {
        return <>
            <label className="fw-bold">
                {_HOOVER.titleHint}<br />
                {_HOOVER.name} <br />
                {_HOOVER.x} dia(s) </label>
        </>
    }

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
            { angle: val_1, group: 'inc', val: val_1, val_p: val_1_p, color: 'DodgerBlue', title: 'RADICACION: ' + val_1, strokeWidth: 10 },
            { angle: val_2, group: 'ldf', val: val_2, val_p: val_2_p, color: 'ForestGreen', title: 'EVALUACION: ' + val_2, strokeWidth: 10 },
            { angle: val_3, group: 'via', val: val_3, val_p: val_3_p, color: 'Gold', title: 'EXPEDICION: ' + val_3, strokeWidth: 10 },
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

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const item = payload[0]?.payload;
            if (item && item.titleHint) {
                return (
                    <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', width: '200px', fontSize: 'small' }}>
                        <label className="fw-bold">
                            {item.titleHint}<br />
                            {item.name}<br />
                            {item.x} dia(s)
                        </label>
                    </div>
                );
            }
        }
        return null;
    }

    const handleScatterClick = (entry) => {
        if (_UPDATE_FILTERS_IDPUBIC && entry && entry.group) {
            _UPDATE_FILTERS_IDPUBIC(entry.group);
        }
    }

    // Build reference areas for the background time blocks
    const buildReferenceAreas = () => {
        const areas = [];
        reviewTimes.forEach((v, i) => {
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

            areas.push(
                <ReferenceArea key={`rad-${i}`} x1={0} x2={rad_time} y1={i} y2={i + 1}
                    fill="rgba(30, 144, 235, 0.70)" fillOpacity={1} ifOverflow="visible" />
            );
            areas.push(
                <ReferenceArea key={`eva1-${i}`} x1={rad_time} x2={rad_time + v[0] + eva_time} y1={i} y2={i + 1}
                    fill="rgba(34, 139, 34, 0.70)" fillOpacity={1} ifOverflow="visible" />
            );
            areas.push(
                <ReferenceArea key={`blank1-${i}`} x1={rad_time + v[0] + eva_time} x2={rad_time + v[0] + eva_time + blank_time} y1={i} y2={i + 1}
                    fill="rgba(220, 220, 220, 0.70)" fillOpacity={1} ifOverflow="visible" />
            );
            areas.push(
                <ReferenceArea key={`eva2-${i}`} x1={rad_time + v[0] + eva_time + blank_time} x2={rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2} y1={i} y2={i + 1}
                    fill="rgba(34, 139, 34, 0.70)" fillOpacity={1} ifOverflow="visible" />
            );
            areas.push(
                <ReferenceArea key={`via1-${i}`} x1={rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2} x2={rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 5} y1={i} y2={i + 1}
                    fill="rgba(173, 255, 47, 0.70)" fillOpacity={1} ifOverflow="visible" />
            );
            areas.push(
                <ReferenceArea key={`via2-${i}`} x1={rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 5} x2={rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 10} y1={i} y2={i + 1}
                    fill="rgba(255, 215, 0, 0.70)" fillOpacity={1} ifOverflow="visible" />
            );
            areas.push(
                <ReferenceArea key={`blank2-${i}`} x1={rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 10} x2={rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 10 + blank_time_2} y1={i} y2={i + 1}
                    fill="rgba(220, 220, 220, 0.70)" fillOpacity={1} ifOverflow="visible" />
            );
            areas.push(
                <ReferenceArea key={`pay-${i}`} x1={rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 10 + blank_time_2} x2={rad_time + v[0] + eva_time + blank_time + v[1] + eva_time_2 + 10 + blank_time_2 + 20} y1={i} y2={i + 1}
                    fill="rgba(255, 215, 0, 0.70)" fillOpacity={1} ifOverflow="visible" />
            );
        });
        return areas;
    }

    const scatterSeries = [
        { dataKey: 'rad', color: 'DodgerBlue' },
        { dataKey: 'eva', color: 'ForestGreen' },
        { dataKey: 'exp', color: 'Orange' },
        { dataKey: 'end', color: 'Violet' },
        { dataKey: 'neg1', color: 'tomato' },
        { dataKey: 'neg3', color: 'tomato' },
        { dataKey: 'neg4', color: 'tomato' },
        { dataKey: 'des1', color: 'Crimson' },
        { dataKey: 'des2', color: 'Crimson' },
        { dataKey: 'des3', color: 'Crimson' },
        { dataKey: 'des4', color: 'Crimson' },
        { dataKey: 'des5', color: 'Crimson' },
    ];

    const legendPayload = myData().map(item => ({
        value: item.title,
        type: 'line',
        color: item.color,
        id: item.group,
    }));

    const yTickFormatter = (value) => {
        if (value === 0.5) return ' IV ';
        if (value === 1.5) return ' III ';
        if (value === 2.5) return ' II ';
        if (value === 3.5) return ' I ';
        return '';
    };

    if (loading) {
        return <LegacyMacroGanttLoading />;
    }

    return (
        <div>
            <div className="row mx-0 align-items-center g-2 text-center my-2">
                <div className='col-12 col-md'>
                    <label className="fw-bold">TIEMPO DE SOLICITUDES ({totalList()})</label>
                </div>
                <div className='col-12 col-md-auto d-flex justify-content-center justify-content-md-end'>
                    <div className="d-flex flex-wrap justify-content-center gap-1" role="group" aria-label="Rango de tiempo">
                        <Button variant={bt_scope != 0 ? "outline" : "default"} size="sm"
                            onClick={() => { setBt_scope(0) }}>OPTIMO</Button>
                        <Button variant={bt_scope != 1 ? "outline" : "default"} size="sm"
                            onClick={() => { setBt_scope(1) }}>PROMEDIO</Button>
                        <Button variant={bt_scope != 2 ? "outline" : "default"} size="sm"
                            onClick={() => { setBt_scope(2) }}>LIMITE</Button>
                    </div>
                </div>
            </div>

            <div className="row g-0">
                <div className="col-12 p-0">
                    <div className="d-flex w-100">
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height={400}>
                                <ScatterChart margin={{ left: 36, right: 10, top: 10, bottom: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" dataKey="x" domain={[0, 200]}
                                        allowDataOverflow={true}
                                        ticks={_tickValues}
                                        tickFormatter={v => v}
                                        style={{ fontSize: 12 }} />
                                    <YAxis type="number" dataKey="y" domain={[0, 6]}
                                        ticks={[0.5, 1.5, 2.5, 3.5]}
                                        tickFormatter={yTickFormatter}
                                        style={{ fontSize: 12 }} />
                                    <ZAxis range={[10, 50]} />
                                    <Tooltip content={<CustomTooltip />} />

                                    {buildReferenceAreas()}

                                    {scatterSeries.map(s => {
                                        const safeData = Array.isArray(data[s.dataKey]) ? data[s.dataKey] : [];
                                        if (safeData.length === 0) return null;
                                        return (
                                            <Scatter key={s.dataKey} name={s.dataKey}
                                                data={safeData}
                                                fill={s.color}
                                                isAnimationActive={false}
                                                animationDuration={0}
                                                onClick={handleScatterClick}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        );
                                    })}
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {myData().map((item, i) => (
                            <div key={i}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: 16, marginBottom: 4 }}
                                onClick={() => _UPDATE_FILTERS && _UPDATE_FILTERS(item.group)}>
                                <div style={{ width: 10, height: 10, backgroundColor: item.color, marginRight: 6 }} />
                                <span style={{ fontSize: 'small' }}>{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(FUN_CHART_MACRO_GRANTT);
