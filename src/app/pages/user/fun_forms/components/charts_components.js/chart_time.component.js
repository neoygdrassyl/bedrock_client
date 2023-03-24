import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Crosshair, CustomSVGSeries, Hint, HorizontalGridLines, MarkSeries, VerticalGridLines, XAxis, XYPlot, YAxis } from 'react-vis';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { dateParser_dateDiff, formsParser1, formsParser1_exlucde2, regexChecker_isOA } from '../../../../../components/customClasses/typeParse';
import { infoCud } from '../../../../../components/jsons/vars';
import SERVICE_FUN from '../../../../../services/fun.service'

const MySwal = withReactContent(Swal);
const _tickValues = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200];
const YtickValues = [0, 1, 2, 3, 4, 5];
const BUILD_AREAS = ['OBRA NUEVA', 'AMPLIADA', 'ADECUADA', 'MODIFICADA', 'RESTAURADA', 'REFORZADA', 'DEMOLIDA TOTAL', 'DEMOLIDA PARCIAL', 'RECONSTRUIDA', 'REFORZADA', 'RECONOCIDA']
export default function FUN_CHART_TIME(props) {
    var [hovered, setHovered] = useState(false);

    var [filterId, SetFilterId] = useState([`${infoCud.nomen}${moment().subtract(1, 'year').format('YY')}-0000`, `${infoCud.nomen}${moment().format('YY')}-9999`]);
    var [filterD, SetFilterD] = useState([0, 200]);
    var [date_1, SetDate_1] = useState(moment().subtract(1, 'y').startOf('year').format('YYYY-MM-DD'));
    var [date_2, SetDate_2] = useState(moment().format('YYYY-MM-DD'));

    var [items, setItems] = useState([]);

    var [seeValid1, setSeeValid1] = useState(false);
    var [seeValid2, setSeeValid2] = useState(false);

    var [seeNotValid1, setNotValid1] = useState(false);
    var [seeNotValid2, setNotValid2] = useState(false);

    // ------------------ LICENCE TIME --------------------- // 
    var [build, setBuild] = useState(Array(11).fill(0));
    var [data, setData] = useState([]);
    var [datan, setDatan] = useState(Array(5).fill(0));
    var [datano, setDatano] = useState([]);
    var [dataType, setDataTy] = useState([]);

    var [total, setTotal] = useState(0);
    var [valid, setValid] = useState(0);
    var [load, setLoad] = useState(0);

    var [mean, setMn] = useState(0);
    var [media, setMe] = useState(0);
    var [mode, setMo] = useState(0);

    var [meanC, setMnC] = useState(Array(5).fill(0));
    var [mediaC, setMeC] = useState(Array(5).fill(0));
    var [modeC, setMoC] = useState(Array(5).fill(0));

    var [variance, setVar] = useState(0); // VARIANZA ESTADISTICA
    var [deviation, setDev] = useState(0); // Desviación típica
    var [varIndex, setVai] = useState(0); // Coefficient of variation 
    var [range, setRange] = useState(0); // Range 

    var [varianceC, setVarC] = useState(Array(5).fill(0)); // VARIANZA ESTADISTICA
    var [deviationC, setDevC] = useState(Array(5).fill(0)); // Desviación típica
    var [varIndexC, setVaiC] = useState(Array(5).fill(0)); // Coefficient of variation 
    var [rangeC, setRangeC] = useState(Array(5).fill(0)); // Range 


    // ------------------ STUDY TIME --------------------- // 
    //var [build2, setBuild2] = useState(Array(11).fill(0));
    var [data2, setData2] = useState([]);
    var [datan2, setDatan2] = useState(Array(5).fill(0));
    var [datano2, setDatano2] = useState([]);
    //var [dataType2, setDataTy2] = useState([]);

    var [total2, setTotal2] = useState(0);
    var [valid2, setValid2] = useState(0);
    //var [load2, setLoad2] = useState(0);

    var [mean2, setMn2] = useState(0);
    var [media2, setMe2] = useState(0);
    var [mode2, setMo2] = useState(0);

    var [meanC2, setMnC2] = useState(Array(5).fill(0));
    var [mediaC2, setMeC2] = useState(Array(5).fill(0));
    var [modeC2, setMoC2] = useState(Array(5).fill(0));

    var [variance2, setVar2] = useState(0); // VARIANZA ESTADISTICA
    var [deviation2, setDev2] = useState(0); // Desviación típica
    var [varIndex2, setVai2] = useState(0); // Coefficient of variation 
    var [range2, setRange2] = useState(0); // Range 

    var [varianceC2, setVarC2] = useState(Array(5).fill(0)); // VARIANZA ESTADISTICA
    var [deviationC2, setDevC2] = useState(Array(5).fill(0)); // Desviación típica
    var [varIndexC2, setVaiC2] = useState(Array(5).fill(0)); // Coefficient of variation 
    var [rangeC2, setRangeC2] = useState(Array(5).fill(0)); // Range 


    useEffect(() => {
        if (load == 0) loadData();
        if (load == 1 && data.length == 0) { curateData(); curateData2(); }
        if (load == 2 && data.length > 0) { curateData(); curateData2(); }
    }, [load, filterD, filterId, date_1, date_2]);

    // ***************************  DATA GETTERS *********************** //


    // *************************  DATA CONVERTERS ********************** //
    let _ADD_MARK = (_new_mark, _newData) => {
        var marks = _newData;
        for (var i = 0; i < marks.length; i++) {
            if (marks[i].x == _new_mark.x && marks[i].y == _new_mark.y) {
                marks[i].name = marks[i].name + "\n" + _new_mark.name;
                marks[i].group.push(_new_mark.name);
                return _newData;
            }
        }
        marks.push(_new_mark);
        return marks;
    }


    function curateData() {
        let newData = [];
        let newDatano = [];
        let values = [];
        let valuesC = Array(5).fill('');
        let newTypes = [];
        let newBuild = Array(11).fill(0);

        let newTotal = 0;
        let newValid = 0;
        let newAvg = 0;
        let newMed = 0;
        let newVariance = 0;

        let newTotalC = Array(5).fill(0);
        let newAvgC = Array(5).fill(0);
        let newMedC = Array(5).fill(0);
        let newVarianceC = Array(5).fill(0);

        items.map(row => {
            if (!regexChecker_isOA(row)) {
                newTotal++;
                if (row.id_public > filterId[1]) return;
                if (row.id_public < filterId[0]) return;
                if(!row.clock_license || !row.clock_date) {
                    newDatano.push(row.id_public);
                    return;
                };
                if (!moment(row.clock_license).isBetween(date_1, date_2, undefined, '[]')) return;

                let time_process = dateParser_dateDiff(row.clock_license, row.clock_date);
                let _x = time_process > 200 ? 200 : time_process;
                if (_x < filterD[0]) return;
                if (_x > filterD[1]) return;

                // ----------------------- AREAS ------------------
                let areas = row.r33a_build ? row.r33a_build.split('&&') : false;
                if (areas) {
                    areas.map(area =>
                        area.split(',').map((a, i) => newBuild[i] += Number(a))
                    )
                }

                // ----------------------- TYPES ------------------
                let Newtype = formsParser1(row);
                let type = newTypes.find((data) => data.type == Newtype);
                if (type) {
                    newTypes = newTypes.map(data => {
                        if (data.type == Newtype)
                            return { type: data.type, n: data.n + 1, ids: [...data.ids, row.id_public.slice(-7)] };
                        else return data;
                    })
                }
                else {
                    Newtype = { type: Newtype, n: 1, ids: [row.id_public.slice(-7)] };
                    newTypes.push(Newtype)
                }

                // ----------------------- TIMES ------------------

                newValid++;
                values.push(_x);
                newAvg += _x;
                let _y = 1;
                if (row.type == 'i') { newAvgC[0] += _x; newTotalC[0] += 1; valuesC[0] += _x + ' '; _y = 2; }
                else if (row.type == 'ii') { newAvgC[1] += _x; newTotalC[1] += 1; valuesC[1] += _x + ' '; _y = 3; }
                else if (row.type == 'iii') { newAvgC[2] += _x; newTotalC[2] += 1; valuesC[2] += _x + ' '; _y = 4; }
                else if (row.type == 'iv') { newAvgC[3] += _x; newTotalC[3] += 1; valuesC[3] += _x + ' '; _y = 5; }
                else { newAvgC[4] += _x; newTotalC[4] += 1; valuesC[4] += _x + ' '; }

                newData = _ADD_MARK({
                    x: _x,
                    y: _y,
                    size: 1,
                    name: row.id_public,
                    id: row,
                    group: [row.id_public],
                    titleHint: 'LICENCIA',
                }, newData);
            }
        })
        newTypes.sort((a, b) => {
            if (a.type < b.type) { return -1; }
            if (a.type > b.type) { return 1; }
            return 0;
        })

        setBuild(newBuild)
        setDataTy(newTypes);
        setTotal(newTotal);
        setValid(newValid);
        setData(newData);
        setDatan(newTotalC);
        setDatano(newDatano);

        values.sort((prev, next) => prev - next);
        // ---------------- MEAN -----------------
        newAvg = Number(newAvg / values.length).toFixed(2)
        newAvgC = newAvgC.map((avg, i) => Number(avg / newTotalC[i]).toFixed(2))
        setMn(newAvg);
        setMnC(newAvgC);

        // --------------- MEDIAN ------------------
        if (values.length % 2 == 0) {
            newMed = (values[values.length / 2] + values[values.length / 2 + 1]) / 2;
            newMed = Number(newMed.toFixed(1))
        } else {
            newMed = values[(values.length + 1) / 2];
        }
        setMe(newMed);

        valuesC = valuesC.map(_values => {
            let _valuesA = _values.trim().split(' ');
            let newValuesA = _valuesA.slice(0, _valuesA.length);
            newValuesA.sort((a, b) => a - b);
            return newValuesA;
        })


        newMedC = valuesC.map(_values => {
            let newMed;
            if (_values.length % 2 == 0) {
                newMed = (Number(_values[_values.length / 2]) + Number(_values[_values.length / 2 + 1])) / 2;
                newMed = Number(newMed.toFixed(1));
            } else {
                newMed = _values[(_values.length + 1) / 2];
            }
            return newMed;
        });

        setMeC(newMedC);
        // --------------- MODE ------------------
        var mode = a => {
            a = a.slice().sort((x, y) => x - y);

            var bestStreak = 1;
            var bestElem = a[0];
            var currentStreak = 1;
            var currentElem = a[0];

            for (let i = 1; i < a.length; i++) {
                if (a[i - 1] !== a[i]) {
                    if (currentStreak > bestStreak) {
                        bestStreak = currentStreak;
                        bestElem = currentElem;
                    }

                    currentStreak = 0;
                    currentElem = a[i];
                }

                currentStreak++;
            }

            return currentStreak > bestStreak ? currentElem : bestElem;
        };

        setMo(mode(values))
        setMoC(valuesC.map(values => mode(values)))
        // --------------- RANGE ------------------
        setRange(values[values.length - 1] - values[0]);
        setRangeC(valuesC.map(values => values[values.length - 1] - values[0]));
        // ---------------| VARIANCE | DEVIATION | INDEX | ------------------
        values.map(value => { newVariance += Math.pow((value - newAvg), 2); });
        valuesC.map((values, i) => values.map((value, j) => { newVarianceC[i] += Math.pow((value - newAvgC[i]), 2); }));

        let newDev = Number(Math.sqrt(newVariance / values.length)).toFixed(2)
        let newDevC = newVarianceC.map((newVariance, i) => Number(Math.sqrt(newVariance / valuesC[i].length)).toFixed(2));

        setVar(Number(newVariance).toFixed(2));
        setVarC(newVarianceC.map(newVariance => Number(newVariance).toFixed(2)));
        setDev(newDev);
        setDevC(newDevC);

        let newVarIndex = Number(newDev / Math.abs(newAvg) * 100).toFixed(2);
        let newVarIndexC = newDevC.map((newDev, i) => Number(newDev / Math.abs(newAvgC[i]) * 100).toFixed(2))
        setVai(newVarIndex);
        setVaiC(newVarIndexC);
        // ---------------------------------
        setLoad(2);
    }

    function curateData2() {
        let newData = [];
        let newDatano = [];
        let values = [];
        let valuesC = Array(5).fill('');
        //let newTypes = [];
        //let newBuild = Array(11).fill(0);

        let newTotal = 0;
        let newValid = 0;
        let newAvg = 0;
        let newMed = 0;
        let newVariance = 0;

        let newTotalC = Array(5).fill(0);
        let newAvgC = Array(5).fill(0);
        let newMedC = Array(5).fill(0);
        let newVarianceC = Array(5).fill(0);



        items.map(row => {
            if (!regexChecker_isOA(row)) {
                newTotal++;
                if (row.id_public > filterId[1]) return;
                if (row.id_public < filterId[0]) return;
                if(!row.clock_acto || !row.clock_date) {
                    newDatano.push(row.id_public);
                    return;
                };
                if (!moment(row.clock_acto).isBetween(date_1, date_2, undefined, '[]')) return;

                let time_process = dateParser_dateDiff(row.clock_acto, row.clock_date);
                let _x = time_process > 200 ? 200 : time_process;
                if (_x < filterD[0]) return;
                if (_x > filterD[1]) return;


                // ----------------------- TIMES ------------------

                newValid++;
                values.push(_x);
                newAvg += _x;
                let _y = 1;
                if (row.type == 'i') { newAvgC[0] += _x; newTotalC[0] += 1; valuesC[0] += _x + ' '; _y = 2; }
                else if (row.type == 'ii') { newAvgC[1] += _x; newTotalC[1] += 1; valuesC[1] += _x + ' '; _y = 3; }
                else if (row.type == 'iii') { newAvgC[2] += _x; newTotalC[2] += 1; valuesC[2] += _x + ' '; _y = 4; }
                else if (row.type == 'iv') { newAvgC[3] += _x; newTotalC[3] += 1; valuesC[3] += _x + ' '; _y = 5; }
                else { newAvgC[4] += _x; newTotalC[4] += 1; valuesC[4] += _x + ' '; }

                newData = _ADD_MARK({
                    x: _x,
                    y: _y,
                    size: 1,
                    name: row.id_public,
                    id: row,
                    group: [row.id_public],
                    titleHint: 'LICENCIA',
                }, newData);
            }
        })


        //setBuild2(newBuild)
        //setDataTy2(newTypes);
        setTotal2(newTotal);
        setValid2(newValid);
        setData2(newData);
        setDatan2(newTotalC);
        setDatano2(newDatano);

        values.sort((prev, next) => prev - next);
        // ---------------- MEAN -----------------
        newAvg = Number(newAvg / values.length).toFixed(2)
        newAvgC = newAvgC.map((avg, i) => Number(avg / newTotalC[i]).toFixed(2))
        setMn2(newAvg);
        setMnC2(newAvgC);

        // --------------- MEDIAN ------------------
        if (values.length % 2 == 0) {
            newMed = (values[values.length / 2] + values[values.length / 2 + 1]) / 2;
            newMed = Number(newMed.toFixed(1))
        } else {
            newMed = values[(values.length + 1) / 2];
        }
        setMe2(newMed);

        valuesC = valuesC.map(_values => {
            let _valuesA = _values.trim().split(' ');
            let newValuesA = _valuesA.slice(0, _valuesA.length);
            newValuesA.sort((a, b) => a - b);
            return newValuesA;
        })


        newMedC = valuesC.map(_values => {
            let newMed;
            if (_values.length % 2 == 0) {
                newMed = (Number(_values[_values.length / 2]) + Number(_values[_values.length / 2 + 1])) / 2;
                newMed = Number(newMed.toFixed(1));
            } else {
                newMed = _values[(_values.length + 1) / 2];
            }
            return newMed;
        });

        setMeC2(newMedC);
        // --------------- MODE ------------------
        var mode = a => {
            a = a.slice().sort((x, y) => x - y);

            var bestStreak = 1;
            var bestElem = a[0];
            var currentStreak = 1;
            var currentElem = a[0];

            for (let i = 1; i < a.length; i++) {
                if (a[i - 1] !== a[i]) {
                    if (currentStreak > bestStreak) {
                        bestStreak = currentStreak;
                        bestElem = currentElem;
                    }

                    currentStreak = 0;
                    currentElem = a[i];
                }

                currentStreak++;
            }

            return currentStreak > bestStreak ? currentElem : bestElem;
        };

        setMo2(mode(values))
        setMoC2(valuesC.map(values => mode(values)))
        // --------------- RANGE ------------------
        setRange2(values[values.length - 1] - values[0]);
        setRangeC2(valuesC.map(values => values[values.length - 1] - values[0]));
        // ---------------| VARIANCE | DEVIATION | INDEX | ------------------
        values.map(value => { newVariance += Math.pow((value - newAvg), 2); });
        valuesC.map((values, i) => values.map((value, j) => { newVarianceC[i] += Math.pow((value - newAvgC[i]), 2); }));

        let newDev = Number(Math.sqrt(newVariance / values.length)).toFixed(2)
        let newDevC = newVarianceC.map((newVariance, i) => Number(Math.sqrt(newVariance / valuesC[i].length)).toFixed(2));

        setVar2(Number(newVariance).toFixed(2));
        setVarC2(newVarianceC.map(newVariance => Number(newVariance).toFixed(2)));
        setDev2(newDev);
        setDevC2(newDevC);

        let newVarIndex = Number(newDev / Math.abs(newAvg) * 100).toFixed(2);
        let newVarIndexC = newDevC.map((newDev, i) => Number(newDev / Math.abs(newAvgC[i]) * 100).toFixed(2))
        setVai2(newVarIndex);
        setVaiC2(newVarIndexC);
        // ---------------------------------
    }
    // ******************************* JSX ***************************** // 
    let _GET_HOOVER_BOX_CONTENT = _HOOVER => {
        return <>
            <label className="fw-bold">
                {_HOOVER.titleHint}<br />
                {_HOOVER.name} <br />
                {_HOOVER.x} dia(s) </label>
        </>
    }

    let _FILTER_COMPONENT = () => {
        return <>
            <div className='row text-center my-1'>
            <div className='col'>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1">FECHAS</span>
                        </div>
                        <input type="date" class="form-control text-end" id="date_1" defaultValue={date_1} />
                        <input type="date" class="form-control text-end" id="date_2" defaultValue={date_2} />
                    </div>
                </div>
                <div className='col'>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1">RADICADOS</span>
                        </div>
                        <input type="text" class="form-control text-end" id="ids_1" defaultValue={filterId[0]} />
                        <input type="text" class="form-control text-end" id="ids_2" defaultValue={filterId[1]} />
                    </div>
                </div>

                <div className='col'>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1">RANGO DE DÍAS</span>
                        </div>
                        <input type="text" class="form-control text-end" id="d_1" defaultValue={filterD[0]} />
                        <input type="text" class="form-control text-end" id="d_2" defaultValue={filterD[1]} />
                    </div>
                </div>

                <div className='col-2 text-center'>
                    <MDBBtn rounded outline onClick={() => {
                        SetFilterId([document.getElementById("ids_1").value, document.getElementById("ids_2").value]);
                        SetFilterD([document.getElementById("d_1").value, document.getElementById("d_2").value]);
                        SetDate_1(document.getElementById("date_1").value);
                        SetDate_2(document.getElementById("date_2").value);
                    }}>FILTRAR</MDBBtn>
                </div>

            </div>
        </>
    }

    let _TIMPE_COMPONENT = () => {
        return <>
            <div className='row text-center my-1'>
                <div className='col'>
                    <h3><label className='fw-bold'> GRÁFICO DE TIEMPOS MEDIOS DE LICENCIAMIENTO (TOTALES: {total})</label></h3>
                </div>
            </div>
            <div className="chart-clock mx-2" style={{ width: '2500px' }}>
                <XYPlot width={2000} height={300} margin={{ bottom: 45, left: 50, right: 50 }}
                    yPadding={20} xDomain={[filterD[0], filterD[1]]} yDomain={[0, 5]}>

                    <VerticalGridLines
                        tickValues={_tickValues}
                        tickTotal={_tickValues.length}
                    />
                    <HorizontalGridLines
                        tickValues={YtickValues}
                        tickTotal={YtickValues.length}
                    />

                    <XAxis tickFormat={function tickFormat(value) {
                        return value + ' d';
                    }}
                        tickValues={_tickValues}
                        style={{ fontSize: 12 }}
                    />


                    <YAxis tickValues={[1, 2, 3, 4, 5]} tickFormat={tick => {
                        if (tick == 5) return ' IV '
                        if (tick == 4) return ' III '
                        if (tick == 3) return ' II '
                        if (tick == 2) return ' I '
                        if (tick == 1) return ' NC '
                    }}
                    />

                    <MarkSeries
                        sizeRange={[1, 5]}
                        data={data}
                        color={'DodgerBlue'}
                        onValueMouseOver={e => setHovered(e)}
                        onValueMouseOut={e => setHovered(false)}
                        onValueClick={(e) => props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                    <Crosshair values={[{ x: mean }]} >
                        <div style={{ background: 'black', background: 'rgba(0,0,0,0.65)', marginTop: '0%', width: '120px', fontSize: 'small' }}>
                            <p className='ms-1'>Media: {mean}</p>
                        </div>
                    </Crosshair>

                    {hovered ?
                        <Hint value={hovered}>
                            <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', marginTop: '0%', width: '200px', fontSize: 'small' }}>
                                {_GET_HOOVER_BOX_CONTENT(hovered)}
                            </div>
                        </Hint>
                        : null}
                </XYPlot>
            </div >
            <div className='row text-center my-1 mx-1'>
                <div className='col'>
                    <div className='fw-bold'> MEDIDAS DE PROMEDIO </div>
                    <div className='row fw-bold'>
                        <div className='col border'></div>
                        <div className='col border'>TODOS</div>
                        <div className='col border'>NC</div>
                        <div className='col border'>I</div>
                        <div className='col border'>II</div>
                        <div className='col border'>III</div>
                        <div className='col border'>IV</div>
                    </div>
                    <div className='row'>
                        <div className='col fw-bold border'>N</div>
                        <div className='col border'>{valid}</div>
                        <div className='col border'>{datan[4]}</div>
                        <div className='col border'>{datan[0]}</div>
                        <div className='col border'>{datan[1]}</div>
                        <div className='col border'>{datan[2]}</div>
                        <div className='col border'>{datan[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col fw-bold border'>MEDIA</div>
                        <div className='col border'>{mean}</div>
                        <div className='col border'>{meanC[4]}</div>
                        <div className='col border'>{meanC[0]}</div>
                        <div className='col border'>{meanC[1]}</div>
                        <div className='col border'>{meanC[2]}</div>
                        <div className='col border'>{meanC[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col border fw-bold'>MEDIANA</div>
                        <div className='col border'>{media}</div>
                        <div className='col border'>{mediaC[4]}</div>
                        <div className='col border'>{mediaC[0]}</div>
                        <div className='col border'>{mediaC[1]}</div>
                        <div className='col border'>{mediaC[2]}</div>
                        <div className='col border'>{mediaC[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col border fw-bold'>MODA</div>
                        <div className='col border'>{mode}</div>
                        <div className='col border'>{modeC[4]}</div>
                        <div className='col border'>{modeC[0]}</div>
                        <div className='col border'>{modeC[1]}</div>
                        <div className='col border'>{modeC[2]}</div>
                        <div className='col border'>{modeC[3]}</div>
                    </div>
                </div>
                <div className='col'>
                    <div className='fw-bold'> MEDIDAS DE DISPERSIÓN </div>
                    <div className='row fw-bold'>
                        <div className='col border'></div>
                        <div className='col border'>TODOS</div>
                        <div className='col border'>NC</div>
                        <div className='col border'>I</div>
                        <div className='col border'>II</div>
                        <div className='col border'>III</div>
                        <div className='col border'>IV</div>
                    </div>
                    <div className='row'>
                        <div className='col fw-bold border'>RANGO</div>
                        <div className='col border'>{range}</div>
                        <div className='col border'>{rangeC[4]}</div>
                        <div className='col border'>{rangeC[0]}</div>
                        <div className='col border'>{rangeC[1]}</div>
                        <div className='col border'>{rangeC[2]}</div>
                        <div className='col border'>{rangeC[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col border fw-bold'>VARIANZA</div>
                        <div className='col border'>{variance}</div>
                        <div className='col border'>{varianceC[4]}</div>
                        <div className='col border'>{varianceC[0]}</div>
                        <div className='col border'>{varianceC[1]}</div>
                        <div className='col border'>{varianceC[2]}</div>
                        <div className='col border'>{varianceC[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col border fw-bold'>DESVIACIÓN TÍPICA</div>
                        <div className='col border'>{deviation}</div>
                        <div className='col border'>{deviationC[4]}</div>
                        <div className='col border'>{deviationC[0]}</div>
                        <div className='col border'>{deviationC[1]}</div>
                        <div className='col border'>{deviationC[2]}</div>
                        <div className='col border'>{deviationC[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col border fw-bold'>COEFICIENTE VARIACIÓN</div>
                        <div className='col border'>{varIndex}%</div>
                        <div className='col border'>{varIndexC[4]}%</div>
                        <div className='col border'>{varIndexC[0]}%</div>
                        <div className='col border'>{varIndexC[1]}%</div>
                        <div className='col border'>{varIndexC[2]}%</div>
                        <div className='col border'>{varIndexC[3]}%</div>
                    </div>
                </div>
            </div>
            <div className='row text-center my-1'>
                <div className='col fw-bold'> VALIDOS: {valid}  <MDBBtn floating tag='a' color='primary' size='sm' outline={!seeValid1} onClick={() => setSeeValid1(!seeValid1)} >
                    <MDBIcon fas icon='eye' /></MDBBtn></div>
            </div>
            {seeValid1 ?
                <div className='row text-center my-1'>
                    <div className='col'>
                        <div class="d-flex flex-wrap">
                            {data.map(value => <div class="input-group-prepend border border-success">
                                <div class="input-group-text">
                                    <label>{(value.name.slice(-7))}</label></div>
                            </div>)}
                        </div>
                    </div>
                </div>
                : ''}

            {datano.length > 0 ?
                <div className='row text-center my-1'>
                    <div className='col'>
                        <div className='fw-bold'> NO VALIDOS: {datano.length} <MDBBtn floating tag='a' color='primary' size='sm' outline={!seeNotValid1} onClick={() => setNotValid1(!seeNotValid1)} >
                            <MDBIcon fas icon='eye' /></MDBBtn></div>
                        {seeNotValid1 ?
                            <div class="d-flex flex-wrap">
                                {datano.map(value => <div class="input-group-prepend border border-primary">
                                    <div class="input-group-text">
                                        <label>{(value.slice(-7))}</label></div>
                                </div>)}
                            </div>

                            : ''}
                    </div>
                </div>
                : ' '}
        </>
    }

    let _STUDY_COMPONENT = () => {
        return <>
            <div className='row text-center my-1'>
                <div className='col'>
                    <h3><label className='fw-bold'> GRÁFICO DE TIEMPOS MEDIOS DE ESTUDIOS (TOTALES: {total2})</label></h3>
                </div>
            </div>
            <div className="chart-clock mx-2" style={{ width: '2500px' }}>
                <XYPlot width={2000} height={300} margin={{ bottom: 45, left: 50, right: 50 }}
                    yPadding={20} xDomain={[filterD[0], filterD[1]]} yDomain={[0, 5]}>

                    <VerticalGridLines
                        tickValues={_tickValues}
                        tickTotal={_tickValues.length}
                    />
                    <HorizontalGridLines
                        tickValues={YtickValues}
                        tickTotal={YtickValues.length}
                    />

                    <XAxis tickFormat={function tickFormat(value) {
                        return value + ' d';
                    }}
                        tickValues={_tickValues}
                        style={{ fontSize: 12 }}
                    />

                    <CustomSVGSeries
                        className="custom-marking"
                        customComponent="square"
                        data={[
                            { x: 90, y: 1, customComponent: () => { return <g><text x={0} y={0} style={{ fontSize: '30px', fill: 'SlateGrey' }}><tspan x="-14" y="8">&#9733;</tspan></text></g> } },
                            { x: 45, y: 1, customComponent: () => { return <g><text x={0} y={0} style={{ fontSize: '30px', fill: 'Orange' }}><tspan x="-14" y="8">&#9733;</tspan></text></g> } },
                            { x: 65, y: 2, customComponent: () => { return <g><text x={0} y={0} style={{ fontSize: '30px', fill: 'SlateGrey' }}><tspan x="-14" y="8">&#9733;</tspan></text></g> } },
                            { x: 20, y: 2, customComponent: () => { return <g><text x={0} y={0} style={{ fontSize: '30px', fill: 'Orange' }}><tspan x="-14" y="8">&#9733;</tspan></text></g> } },
                            { x: 70, y: 3, customComponent: () => { return <g><text x={0} y={0} style={{ fontSize: '30px', fill: 'SlateGrey' }}><tspan x="-14" y="8">&#9733;</tspan></text></g> } },
                            { x: 25, y: 3, customComponent: () => { return <g><text x={0} y={0} style={{ fontSize: '30px', fill: 'Orange' }}><tspan x="-14" y="8">&#9733;</tspan></text></g> } },
                            { x: 80, y: 4, customComponent: () => { return <g><text x={0} y={0} style={{ fontSize: '30px', fill: 'SlateGrey' }}><tspan x="-14" y="8">&#9733;</tspan></text></g> } },
                            { x: 35, y: 4, customComponent: () => { return <g><text x={0} y={0} style={{ fontSize: '30px', fill: 'Orange' }}><tspan x="-14" y="8">&#9733;</tspan></text></g> } },
                            { x: 90, y: 5, customComponent: () => { return <g><text x={0} y={0} style={{ fontSize: '30px', fill: 'SlateGrey' }}><tspan x="-14" y="8">&#9733;</tspan></text></g> } },
                            { x: 45, y: 5, customComponent: () => { return <g><text x={0} y={0} style={{ fontSize: '30px', fill: 'Orange' }}><tspan x="-14" y="8">&#9733;</tspan></text></g> } },
                        ]}
                    />


                    <YAxis tickValues={[1, 2, 3, 4, 5]} tickFormat={tick => {
                        if (tick == 5) return ' IV '
                        if (tick == 4) return ' III '
                        if (tick == 3) return ' II '
                        if (tick == 2) return ' I '
                        if (tick == 1) return ' NC '
                    }}
                    />

                    <MarkSeries
                        sizeRange={[1, 5]}
                        data={data2}
                        color={'ForestGreen'}
                        onValueMouseOver={e => setHovered(e)}
                        onValueMouseOut={e => setHovered(false)}
                        onValueClick={(e) => props._UPDATE_FILTERS_IDPUBIC(e.group)} />

                    <Crosshair values={[{ x: mean2 }]} >
                        <div style={{ background: 'black', background: 'rgba(0,0,0,0.65)', marginTop: '0%', width: '120px', fontSize: 'small' }}>
                            <p className='ms-1'>Media: {mean2}</p>
                        </div>
                    </Crosshair>

                    {hovered ?
                        <Hint value={hovered}>
                            <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', marginTop: '0%', width: '200px', fontSize: 'small' }}>
                                {_GET_HOOVER_BOX_CONTENT(hovered)}
                            </div>
                        </Hint>
                        : null}
                </XYPlot>
            </div >
            <div className='row text-center my-1 mx-1'>
                <div className='col'>
                    <div className='fw-bold'> MEDIDAS DE PROMEDIO </div>
                    <div className='row fw-bold'>
                        <div className='col border'></div>
                        <div className='col border'>TODOS</div>
                        <div className='col border'>NC</div>
                        <div className='col border'>I</div>
                        <div className='col border'>II</div>
                        <div className='col border'>III</div>
                        <div className='col border'>IV</div>
                    </div>
                    <div className='row'>
                        <div className='col fw-bold border'>DIAS NORMA</div>
                        <div className='col border'> - </div>
                        <div className='col border'>45 | 90</div>
                        <div className='col border'>20 | 65</div>
                        <div className='col border'>25 | 70</div>
                        <div className='col border'>35 | 80</div>
                        <div className='col border'>45 | 90</div>
                    </div>
                    <div className='row'>
                        <div className='col fw-bold border'>N</div>
                        <div className='col border'>{valid2}</div>
                        <div className='col border'>{datan2[4]}</div>
                        <div className='col border'>{datan2[0]}</div>
                        <div className='col border'>{datan2[1]}</div>
                        <div className='col border'>{datan2[2]}</div>
                        <div className='col border'>{datan2[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col fw-bold border'>MEDIA</div>
                        <div className='col border'>{mean2}</div>
                        <div className='col border'>{meanC2[4]}</div>
                        <div className='col border'>{meanC2[0]}</div>
                        <div className='col border'>{meanC2[1]}</div>
                        <div className='col border'>{meanC2[2]}</div>
                        <div className='col border'>{meanC2[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col border fw-bold'>MEDIANA</div>
                        <div className='col border'>{media2}</div>
                        <div className='col border'>{mediaC2[4]}</div>
                        <div className='col border'>{mediaC2[0]}</div>
                        <div className='col border'>{mediaC2[1]}</div>
                        <div className='col border'>{mediaC2[2]}</div>
                        <div className='col border'>{mediaC2[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col border fw-bold'>MODA</div>
                        <div className='col border'>{mode2}</div>
                        <div className='col border'>{modeC2[4]}</div>
                        <div className='col border'>{modeC2[0]}</div>
                        <div className='col border'>{modeC2[1]}</div>
                        <div className='col border'>{modeC2[2]}</div>
                        <div className='col border'>{modeC2[3]}</div>
                    </div>
                </div>
                <div className='col'>
                    <div className='fw-bold'> MEDIDAS DE DISPERSIÓN </div>
                    <div className='row fw-bold'>
                        <div className='col border'></div>
                        <div className='col border'>TODOS</div>
                        <div className='col border'>NC</div>
                        <div className='col border'>I</div>
                        <div className='col border'>II</div>
                        <div className='col border'>III</div>
                        <div className='col border'>IV</div>
                    </div>
                    <div className='row'>
                        <div className='col fw-bold border'>RANGO</div>
                        <div className='col border'>{range2}</div>
                        <div className='col border'>{rangeC2[4]}</div>
                        <div className='col border'>{rangeC2[0]}</div>
                        <div className='col border'>{rangeC2[1]}</div>
                        <div className='col border'>{rangeC2[2]}</div>
                        <div className='col border'>{rangeC2[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col border fw-bold'>VARIANZA</div>
                        <div className='col border'>{variance2}</div>
                        <div className='col border'>{varianceC2[4]}</div>
                        <div className='col border'>{varianceC2[0]}</div>
                        <div className='col border'>{varianceC2[1]}</div>
                        <div className='col border'>{varianceC2[2]}</div>
                        <div className='col border'>{varianceC2[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col border fw-bold'>DESVIACIÓN TÍPICA</div>
                        <div className='col border'>{deviation2}</div>
                        <div className='col border'>{deviationC2[4]}</div>
                        <div className='col border'>{deviationC2[0]}</div>
                        <div className='col border'>{deviationC2[1]}</div>
                        <div className='col border'>{deviationC2[2]}</div>
                        <div className='col border'>{deviationC2[3]}</div>
                    </div>
                    <div className='row'>
                        <div className='col border fw-bold'>COEFICIENTE VARIACIÓN</div>
                        <div className='col border'>{varIndex2}%</div>
                        <div className='col border'>{varIndexC2[4]}%</div>
                        <div className='col border'>{varIndexC2[0]}%</div>
                        <div className='col border'>{varIndexC2[1]}%</div>
                        <div className='col border'>{varIndexC2[2]}%</div>
                        <div className='col border'>{varIndexC2[3]}%</div>
                    </div>
                </div>
            </div>
            <div className='row text-center my-1'>
                <div className='col fw-bold'> VALIDOS: {valid2} <MDBBtn floating tag='a' color='primary' size='sm' outline={!seeValid2} onClick={() => setSeeValid2(!seeValid2)} >
                    <MDBIcon fas icon='eye' /></MDBBtn></div>
            </div>
            {seeValid2 ?
                <div className='row text-center my-1'>
                    <div className='col'>
                        <div class="d-flex flex-wrap">
                            {data2.map(value => <div class="input-group-prepend border border-success">
                                <div class="input-group-text">
                                    <label>{(value.name.slice(-7))}</label></div>
                            </div>)}
                        </div>
                    </div>
                </div>
                : ''}

            {datano2.length > 0 ?
                <div className='row text-center my-1'>
                    <div className='col'>
                        <div className='fw-bold'> NO VALIDOS: {datano2.length} <MDBBtn floating tag='a' color='primary' size='sm' outline={!seeNotValid2} onClick={() => setNotValid2(!seeNotValid2)} >
                            <MDBIcon fas icon='eye' /></MDBBtn></div>
                        {seeNotValid2 ?
                            <div class="d-flex flex-wrap">
                                {datano2.map(value => <div class="input-group-prepend border border-primary">
                                    <div class="input-group-text">
                                        <label>{(value.slice(-7))}</label></div>
                                </div>)}
                            </div>
                            : ''}
                    </div>
                </div>
                : ' '}
        </>
    }

    let _TYPE_COMPONENT = () => {
        return <>
            <div className='row text-center mx-1 pt-3'>
                <div className='col border bg-info'>
                    <h3><label className='fw-bold my-1 text-light'> TABLA DE LICENCIAS</label></h3>
                </div>
            </div>
            {dataType.map(data => {
                return <div className='row mx-1'>
                    <div className='col border'>{data.type}</div>
                    <div className='col-4 border'>{data.ids.join(' | ')}</div>
                    <div className='col-1 border'>{data.n}</div>
                </div>
            })}
            <div className='row mx-1'>
                <div className='col border fw-bold text-end'>TOTAL</div>
                <div className='col-1 border'>{dataType.reduce((total, num) => Number(total) + Number(num.n), 0)}</div>
            </div>
        </>
    }

    let _AREAS_COMPONENT = () => {
        return <>
            <div className="d-flex justify-content-center" >
                <div style={{ width: '40%' }}>
                    <div className='row text-center mx-1 pt-3'>
                        <div className='col border bg-info'>
                            <h3><label className='fw-bold my-1 text-light'> TABLA DE AREAS</label></h3>
                        </div>
                    </div>
                    {build.map((b, i) => {
                        return <div className='row mx-1'>
                            <div className='col border'>{BUILD_AREAS[i]}</div>
                            <div className='col-2 border'>{b.toFixed(2)}</div>
                        </div>
                    })}
                    <div className='row mx-1'>
                        <div className='col border fw-bold text-end'>TOTAL</div>
                        <div className='col-2 border'>{build.reduce((total, num) => Number(total) + Number(num), 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </>
    }
    // ******************************* APIS **************************** // 
    function loadData() {
        SERVICE_FUN.reportsPublicData()
            .then(response => {
                setItems(response.data);
                setLoad(1);
            })
            .catch(e => {
                console.log(e);
            });
    }

    return (
        <>
            {_FILTER_COMPONENT()}

            <hr className='my-3' />

            {_TIMPE_COMPONENT()}

            <hr className='my-3' />

            {_STUDY_COMPONENT()}

            <hr className='my-3' />

            {_TYPE_COMPONENT()}

            <hr className='my-3' />

            {_AREAS_COMPONENT()}
        </>
    );
}
