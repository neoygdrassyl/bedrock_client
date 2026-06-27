import { useState, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LegendItem = ({ item, onClick }) => (
    <span style={{ cursor: 'pointer', marginRight: '10px' }} onClick={() => onClick(item.group)}>
        <span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: item.color, marginRight: 4 }} />
        <span style={{ fontSize: 'small' }}>{item.title}</span>
    </span>
);

function FUN_CHART_RECORD_1({ translation, swaMsg, globals, items, _UPDATE_FILTERS }) {
    const [hovered, setHovered] = useState(false);
    const [hovered2, setHovered2] = useState(false);

    const safeItems = Array.isArray(items) ? items : [];

    let getFuns = () => {
        let fun = []
        for (var i = 0; i < safeItems.length; i++) {
            if (safeItems[i].state >= 5) {
                fun.push(safeItems[i])
            }
        }
        return fun;
    }

    let getExp = () => {
        let fun = []
        for (var i = 0; i < safeItems.length; i++) {
            if (safeItems[i].state >= 5) {
                let con1 = safeItems[i].rec_review == 1 && (safeItems[i].rec_review_2 != 0)
                let con2 = safeItems[i].rec_review == 0 && safeItems[i].rec_review_2 == 1;
                let con3 = safeItems[i].rec_review == null && (safeItems[i].rec_review_2 == 1);

                if (con1 || con2 || con3) {
                    fun.push(safeItems[i])
                }
            }
        }
        return fun;
    }

    let myData = () => {
        var val_1 = 0;
        var val_2 = 0;
        var val_31 = 0;
        var val_32 = 0;

        let itemsFun = getFuns();

        for (var i = 0; i < itemsFun.length; i++) {
            const item = itemsFun[i];
            if (item.rec_review == null && item.rec_review_2 == null) val_1++;

            if (item.rec_review != null || item.rec_review_2 != null) val_2++;

            let con1 = item.rec_review == 1 && (item.rec_review_2 != 0);
            let con2 = item.rec_review == 0 && (item.rec_review_2 == 1);
            let con3 = item.rec_review == null && (item.rec_review_2 == 1);

            if (con1 || con2 || con3) {
                val_31++;
            }

            con1 = item.rec_review == 0 && (item.rec_review_2 != 1);
            con2 = item.rec_review == 1 && (item.rec_review_2 == 0);

            if (con1 || con2) {
                val_32++;
            }

        }

        let total = getFuns().length;
        let val_1_p = val_1 / total * 100;
        let val_2_p = val_2 / total * 100;
        let val_31_p = val_31 / total * 100;
        let val_32_p = val_32 / total * 100;


        return [
            { y: 0, x: val_2_p, group: 'acta:1*', val: val_2, val_p: val_2_p, color: 'DarkMagenta', title: `CON ACTA: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
            { y: 0, x: val_1_p, group: 'acta:0*', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN ACTA: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },

            { y: 0.5, x: val_31_p, group: 'acta:si*', val: val_31, val_p: val_31_p, color: '#45008b', title: `VIABLE: ${val_31} (${val_31_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
            { y: 0.5, x: val_32_p, group: 'acta:no*', val: val_32, val_p: val_32_p, color: '#008b8b', title: `NO VIABLE: ${val_32} (${val_32_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
            { y: 0.5, x: val_1_p, group: 'acta:0*', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN ACTA: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
        ]
    }
    let myDataExp = () => {
        var val_4 = 0;

        var val_5 = 0;
        var val_6 = 0;
        var val_7 = 0;
        var val_8 = 0;

        let itemsFun = getExp();

        for (var i = 0; i < itemsFun.length; i++) {
            const item = itemsFun[i];
            //if (item.clock_not_1 != null || item.clock_not_2 != null || item.clock_not_3 != null || item.clock_not_4 != null) val_4++;

            if (item.clock_pay2) val_5++;
            if (item.clock_resolution) val_6++;
            //if (item.clock_eje) val_7++;
            if (item.clock_license) val_8++;

        }

        let total = getExp().length;
        let val_4_p = val_4 / total * 100;

        let val_5_p = val_5 / total * 100;
        let val_6_p = val_6 / total * 100;
        let val_7_p = val_7 / total * 100;
        let val_8_p = val_8 / total * 100;




        return [
            //{ y: 0, x: val_4_p, group: 'acta:not', val: val_4, val_p: val_4_p, color: 'MidnightBlue', title: `NOTIFICADO: ${val_4} (${val_4_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
            //{ y: 0, x: 100 - val_4_p, group: '!acta:not', val: total - val_4, val_p: 100 - val_4_p, color: 'Gainsboro', title: `SIN NOTIFICAR: ${total - val_4} (${(100 - val_4_p).toFixed(2)}%)`, strokeWidth: 10, hintText: '' },

            { y: 0, x: val_5_p, group: 'exp:via', val: val_5, val_p: val_5_p, color: '#b3f562', title: `ACTO VIABILIDAD: ${val_5} (${val_5_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
            { y: 0, x: 100 - val_5_p, group: '!exp:via', val: total - val_5, val_p: 100 - val_5_p, color: 'Gainsboro', title: `SIN ACTO VIABILIDAD: ${total - val_5} (${(100 - val_5_p).toFixed(2)}%)`, strokeWidth: 10, hintText: '' },

            { y: 1, x: val_6_p, group: 'exp:res', val: val_6, val_p: val_6_p, color: '#F5EE62', title: `RESOLUCIÓN: ${val_6} (${val_6_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
            { y: 1, x: 100 - val_6_p, group: '!exp:res', val: total - val_6, val_p: 100 - val_6_p, color: 'Gainsboro', title: `SIN RESOLUCIÓN: ${total - val_6} (${(100 - val_6_p).toFixed(2)}%)`, strokeWidth: 10, hintText: '' },

            //{ y: 1.5, x: val_7_p, group: 'exp:eje', val: val_7, val_p: val_7_p, color: '#707019', title: `EJECUTORIA: ${val_7} (${val_7_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
            //{ y: 1.5, x: 100 - val_7_p, group: '!exp:eje', val: total - val_7, val_p: 100 - val_7_p, color: 'Gainsboro', title: `SIN EJECUTORIA: ${total - val_7} (${(100 - val_7_p).toFixed(2)}%)`, strokeWidth: 10, hintText: '' },

            { y: 2, x: val_8_p, group: 'exp:lic', val: val_8, val_p: val_8_p, color: '#f5a562', title: `LICENCIA: ${val_8} (${val_8_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
            { y: 2, x: 100 - val_8_p, group: '!exp:lic', val: total - val_8, val_p: 100 - val_8_p, color: 'Gainsboro', title: `SIN LICENCIA: ${total - val_8} (${(100 - val_8_p).toFixed(2)}%)`, strokeWidth: 10, hintText: '' },


        ]
    }

    // Build chart data for first chart (ACTAS) - 2 rows: ACTA. (y=0), REV. (y=0.5)
    const dataItems1 = myData();
    const chartData1 = [
        { name: 'ACTA.', ...Object.fromEntries(dataItems1.filter(d => d.y === 0).map((d, i) => [`seg_0_${i}`, d.x])) },
        { name: 'REV.', ...Object.fromEntries(dataItems1.filter(d => d.y === 0.5).map((d, i) => [`seg_05_${i}`, d.x])) },
    ];

    // Build chart data for second chart (EXPEDICION) - 3 rows: VIA. (y=0), RES. (y=1), LIC. (y=2)
    const dataItems2 = myDataExp();
    const chartData2 = [
        { name: 'VIA.', ...Object.fromEntries(dataItems2.filter(d => d.y === 0).map((d, i) => [`seg_0_${i}`, d.x])) },
        { name: 'RES.', ...Object.fromEntries(dataItems2.filter(d => d.y === 1).map((d, i) => [`seg_1_${i}`, d.x])) },
        { name: 'LIC.', ...Object.fromEntries(dataItems2.filter(d => d.y === 2).map((d, i) => [`seg_2_${i}`, d.x])) },
    ];

    const CustomTooltip1 = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const dataKey = payload[0].dataKey;
            const item = dataItems1.find(d => d.key === dataKey);
            if (item) {
                return (
                    <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', width: '200px', fontSize: 'small' }}>
                        <label className="fw-bold">{item.title}</label>
                    </div>
                );
            }
        }
        return null;
    };

    const CustomTooltip2 = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const dataKey = payload[0].dataKey;
            const item = dataItems2.find(d => d.key === dataKey);
            if (item) {
                return (
                    <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', width: '200px', fontSize: 'small' }}>
                        <label className="fw-bold">{item.title}</label>
                    </div>
                );
            }
        }
        return null;
    };

    // Assign unique keys for Bar dataKeys
    const row0Items1 = dataItems1.filter(d => d.y === 0);
    const row05Items1 = dataItems1.filter(d => d.y === 0.5);
    row0Items1.forEach((d, i) => { d.key = `seg_0_${i}`; });
    row05Items1.forEach((d, i) => { d.key = `seg_05_${i}`; });

    const row0Items2 = dataItems2.filter(d => d.y === 0);
    const row1Items2 = dataItems2.filter(d => d.y === 1);
    const row2Items2 = dataItems2.filter(d => d.y === 2);
    row0Items2.forEach((d, i) => { d.key = `seg_0_${i}`; });
    row1Items2.forEach((d, i) => { d.key = `seg_1_${i}`; });
    row2Items2.forEach((d, i) => { d.key = `seg_2_${i}`; });

    const allBars1 = [...row0Items1, ...row05Items1];
    const allBars2 = [...row0Items2, ...row1Items2, ...row2Items2];

    return (
        <div className="border p-2">
            <div className="row text-center my-2">
                <label className="fw-bold">ACTAS ({getFuns().length} LEGAL Y DEBIDA FORMA)</label>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <ResponsiveContainer width={500} height={100}>
                        <BarChart layout="vertical" data={chartData1} stackOffset="none">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => value + '%'} />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip content={<CustomTooltip1 />} />
                            {allBars1.map((item) => (
                                <Bar
                                    key={item.key}
                                    dataKey={item.key}
                                    stackId="stack"
                                    fill={item.color}
                                    onClick={() => _UPDATE_FILTERS(item.group)}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-left">
                    {[dataItems1[2], dataItems1[3], dataItems1[4]].filter(Boolean).map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>
                <div className="col d-flex justify-content-left">
                    {[dataItems1[0], dataItems1[1]].filter(Boolean).map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>
            </div>


            <div className="row text-center my-2">
                <label className="fw-bold">EXPEDICION ({getExp().length} CON ACTA VIABLE)</label>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <ResponsiveContainer width={500} height={120}>
                        <BarChart layout="vertical" data={chartData2} stackOffset="none">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => value + '%'} />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip content={<CustomTooltip2 />} />
                            {allBars2.map((item) => (
                                <Bar
                                    key={item.key}
                                    dataKey={item.key}
                                    stackId="stack"
                                    fill={item.color}
                                    onClick={() => _UPDATE_FILTERS(item.group)}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-left">
                    {[dataItems2[4], dataItems2[5]].filter(Boolean).map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>
                <div className="col d-flex justify-content-left">
                    {[dataItems2[2], dataItems2[3]].filter(Boolean).map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>

                <div className="col d-flex justify-content-left">
                    {[dataItems2[0], dataItems2[1]].filter(Boolean).map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>
            </div>

        </div >
    );
}

export default memo(FUN_CHART_RECORD_1);
