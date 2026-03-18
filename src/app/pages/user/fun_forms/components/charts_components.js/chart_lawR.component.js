import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LegendItem = ({ item, onClick }) => (
    <span style={{ cursor: 'pointer', marginRight: '10px' }} onClick={() => onClick(item.group)}>
        <span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: item.color, marginRight: 4 }} />
        <span style={{ fontSize: 'small' }}>{item.title}</span>
    </span>
);

function FUN_CHART_LAW_R({ translation, swaMsg, globals, items, _UPDATE_FILTERS }) {
    const [hovered, setHovered] = useState(false);

    const safeItems = Array.isArray(items) ? items : [];

    let myData = () => {
        var val_1 = 0;
        var val_2 = 0;
        var val_3 = 0;


        for (var i = 0; i < safeItems.length; i++) {
            if (safeItems[i].ph_review_law != null) {
                if (safeItems[i].ph_review_law == 0) val_2++;
                if (safeItems[i].ph_review_law == 1) val_3++;
            } else {
                if (safeItems[i].jur_review == null) val_1++;
                if (safeItems[i].jur_review == 0) val_2++;
                if (safeItems[i].jur_review == 1) val_3++;
            }

        }

        let total = val_1 + val_2 + val_3;
        let val_1_p = val_1 / total * 100;
        let val_2_p = val_2 / total * 100;
        let val_3_p = val_3 / total * 100;

        return [
            { y: 1, x: val_3_p, group: 'inf:jur:si', val: val_3, val_p: val_3_p, color: 'Gold', title: `VIABLE JUR: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'VIABLE: ' + val_3 },
            { y: 1, x: val_2_p, group: 'inf:jur:no', val: val_2, val_p: val_2_p, color: 'DarkKhaki', title: `NO VIABLE JUR: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO VIABLE: ' + val_2 },
            { y: 1, x: val_1_p, group: 'inf:jur:0', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN EVALUAR JUR: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'SIN EVALUAR: ' + val_1 },
        ]
    }
    let myDataArc = () => {
        var val_1 = 0;
        var val_2 = 0;
        var val_3 = 0;


        for (var i = 0; i < safeItems.length; i++) {
            if (safeItems[i].ph_review != null) {
                if (safeItems[i].ph_review == 0) val_2++;
                if (safeItems[i].ph_review == 1) val_3++;
            } else {
                if (safeItems[i].arc_review == null) val_1++;
                if (safeItems[i].arc_review == 0) val_2++;
                if (safeItems[i].arc_review == 1) val_3++;
            }

        }

        let total = val_1 + val_2 + val_3;
        let val_1_p = val_1 / total * 100;
        let val_2_p = val_2 / total * 100;
        let val_3_p = val_3 / total * 100;

        return [
            { y: 0.5, x: val_3_p, group: 'inf:arq:si', val: val_3, val_p: val_3_p, color: 'Aqua', title: `VIABLE ARQ: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'VIABLE: ' + val_3 },
            { y: 0.5, x: val_2_p, group: 'inf:arq:no', val: val_2, val_p: val_2_p, color: 'DarkCyan', title: `NO VIABLE ARQ: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO VIABLE: ' + val_2 },
            { y: 0.5, x: val_1_p, group: 'inf:arq:0', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN EVALUAR ARQ: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'SIN EVALUAR: ' + val_1 },
        ]
    }
    let myDataEng = () => {
        var val_1 = 0;
        var val_2 = 0;
        var val_3 = 0;

        for (var i = 0; i < safeItems.length; i++) {
            if (safeItems[i].eng_review == null || safeItems[i].eng_review_2 == null) val_1++;
            if (safeItems[i].eng_review == 0 || safeItems[i].eng_review_2 == 0) val_2++;
            if (safeItems[i].eng_review == 1 && (safeItems[i].eng_review_2 == 1 || safeItems[i].eng_review_2 == 2)) val_3++;
        }

        let total = val_1 + val_2 + val_3;
        let val_1_p = val_1 / total * 100;
        let val_2_p = val_2 / total * 100;
        let val_3_p = val_3 / total * 100;

        return [
            { y: 0, x: val_3_p, group: 'inf:e:si', val: val_3, val_p: val_3_p, color: 'Red', title: `CUMPLE EST: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'CUMPLE: ' + val_3 },
            { y: 0, x: val_2_p, group: 'inf:e:no', val: val_2, val_p: val_2_p, color: 'DarkRed', title: `NO CUMPLE EST: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO CUMPLE: ' + val_2 },
            { y: 0, x: val_1_p, group: 'inf:e:0', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN EVALUAR EST: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'SIN EVALUAR: ' + val_1 },
        ]
    }

    // Combined data: 3 rows - EST (y=0), ARQ (y=0.5), JUR (y=1)
    const engItems = myDataEng();
    const arcItems = myDataArc();
    const jurItems = myData();

    engItems.forEach((d, i) => { d.key = `seg_0_${i}`; });
    arcItems.forEach((d, i) => { d.key = `seg_05_${i}`; });
    jurItems.forEach((d, i) => { d.key = `seg_1_${i}`; });

    const allDataItems = [...engItems, ...arcItems, ...jurItems];

    const chartData = [
        { name: 'EST', ...Object.fromEntries(engItems.map(d => [d.key, d.x])) },
        { name: 'ARQ', ...Object.fromEntries(arcItems.map(d => [d.key, d.x])) },
        { name: 'JUR', ...Object.fromEntries(jurItems.map(d => [d.key, d.x])) },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const dataKey = payload[0].dataKey;
            const item = allDataItems.find(d => d.key === dataKey);
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

    return (
        <div className="border p-2">
            <div className="row">
                <div className="row text-center my-2">
                    <label className="fw-bold">INFORMES ({safeItems.length})</label>
                </div>
                <div className="col d-flex justify-content-center">
                    <ResponsiveContainer width={500} height={120}>
                        <BarChart layout="vertical" data={chartData} stackOffset="none">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => value + '%'} />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip content={<CustomTooltip />} />
                            {allDataItems.map((item) => (
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

                <div className="row d-flex justify-content-center">
                    <div className='col'>
                        {jurItems.map((item, i) => (
                            <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                        ))}
                    </div>
                </div>


                <div className="row d-flex justify-content-center">
                    {arcItems.map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>


                <div className="row d-flex justify-content-center">
                    <div className='col'>
                        {engItems.map((item, i) => (
                            <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                        ))}
                    </div>
                </div>
            </div>

        </div >
    );
}

export default FUN_CHART_LAW_R;
