import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LegendItem = ({ item, onClick }) => (
    <span style={{ cursor: 'pointer', marginRight: '10px' }} onClick={() => onClick(item.group)}>
        <span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: item.color, marginRight: 4 }} />
        <span style={{ fontSize: 'small' }}>{item.title}</span>
    </span>
);

function FUN_CHART_PAYMENT_1({ translation, swaMsg, globals, items, _UPDATE_FILTERS }) {
    const [hovered, setHovered] = useState(false);
    const [hovered2, setHovered2] = useState(false);

    const safeItems = Array.isArray(items) ? items : [];

    let myData = () => {
        var val_1 = 0;
        var val_2 = 0;


        for (var i = 0; i < safeItems.length; i++) {
            if (!safeItems[i].clock_payment) val_1++;
            if (safeItems[i].clock_payment) val_2++;
        }

        let total = val_1 + val_2;
        let val_1_p = val_1 / total * 100;
        let val_2_p = val_2 / total * 100;


        return [
            { y: 0.5, x: val_2_p, group: 'pago:fijo', val: val_2, val_p: val_2_p, color: '#F5EE62', title: `PAGADO: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO VIABLE: ' + val_2 },
            { y: 0.5, x: val_1_p, group: '!pago:fijo', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN PAGAR: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'SIN EVALUAR: ' + val_1 },
        ]
    }

    let getPayments = () => {
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

    let getStrata = () => {
        let items = getPayments();
        let items2 = 0;
        let itemscub2 = 0;
        items.map(value => {
            if (Number(value.estrato) > 2) items2++;
            if (value.exp_cub2s) itemscub2++;
        })
        return [items2, itemscub2]
    }

    let myDataPayments = () => {
        var val_1 = 0;
        var val_2 = 0;
        var val_3 = 0;
        var val_4 = 0;
        var val_5 = 0;
        var val_5 = 0;
        var val_52 = 0;
        var strata2 = 0;

        let totalPayments = getPayments();
        for (var i = 0; i < totalPayments.length; i++) {
            const item = totalPayments[i];
            if (item.clock_pay_62) val_1++;
            if (item.clock_pay_63) val_2++;
            if (item.clock_pay_64) val_3++;
            if (item.clock_pay_65) val_4++;
            if (item.exp_date) val_5++;

            if (Number(item.estrato) > 2) strata2++;
            if (Number(item.estrato) > 2 && item.exp_date) val_52++;
        }

        let total = totalPayments.length;
        let val_1_p = (val_1 / total * 100) || 0;
        let val_2_p = (val_2 / total * 100) || 0;
        let val_3_p = (val_3 / strata2 * 100) || 0;
        let val_4_p = (val_4 / total * 100) || 0;
        let val_5_p = (val_5 / total * 100) || 0;
        let val_32_p = (val_52 / strata2 * 100) || 0;


        return [
            { y: 0, x: val_1_p, group: 'pago:var', val: val_1, val_p: val_1_p, color: '#b3f562', title: `VAR. PAGADO: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'PAGADO: ' + val_1 },
            { y: 0, x: val_5_p, group: 'pago:var', val: val_5, val_p: val_5_p, color: '#597a31', title: `VAR. LIQUIDADO: ${val_5} (${val_5_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'LIQUIDADO: ' + val_5 },
            { y: 0, x: 100 - val_1_p - val_5_p, group: '!pago:var', val: total - val_1 - val_5, val_p: 100 - val_1_p - val_5_p, color: 'Gainsboro', title: `VAR. NO LIQUIDADO: ${totalPayments.length - val_1 - val_5} (${(100 - val_1_p - val_5_p).toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO LIQUIDADO: ' + total - val_1 - val_5 },

            { y: 0.5, x: val_2_p, group: 'pago:inm', val: val_2, val_p: val_2_p, color: '#F5EE62', title: `IMP. PAGADO: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'PAGADO: ' + val_2 },
            { y: 0.5, x: val_5_p, group: 'pago:inm', val: val_5, val_p: val_5_p, color: '#7a7731', title: `IMP. LIQUIDADO: ${val_5} (${val_5_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'LIQUIDADO: ' + val_5 },
            { y: 0.5, x: 100 - val_2_p - val_5_p, group: '!pago:inm', val: total - val_2 - val_5, val_p: 100 - val_2_p - val_5_p, color: 'Gainsboro', title: `INM. NO LIQUIDADO: ${totalPayments.length - val_2 - val_5} (${(100 - val_2_p - val_5_p).toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO LIQUIDADO: ' + total - val_2 - val_5 },

            { y: 1, x: val_3_p, group: 'pago:uis', val: val_3, val_p: val_3_p, color: '#f5a562', title: `UIS PAGADO: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'PAGADO: ' + val_3 },
            { y: 1, x: val_32_p, group: 'pago:uis', val: val_52, val_p: val_32_p, color: '#7a5231', title: `UIS. LIQUIDADO: ${val_52} (${val_32_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'LIQUIDADO: ' + val_52 },
            { y: 1, x: 100 - val_3_p - val_32_p, group: '!pago:uis', val: strata2 - val_3 - val_52, val_p: 100 - val_3_p - val_32_p, color: 'Gainsboro', title: `UIS. NO LIQUIDADO: ${strata2 - val_3 - val_52} (${(100 - val_3_p - val_32_p).toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO LIQUIDADO: ' + strata2 - val_3 - val_52 },

            { y: 1.5, x: val_4_p, group: 'pago:deb', val: val_4, val_p: val_4_p, color: '#6269f5', title: `DEB. PAGADO.: ${val_4} (${val_4_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'PAGADO: ' + val_4 },
            { y: 1.5, x: val_32_p, group: 'pago:deb', val: val_32_p, val_p: val_52, color: '#31347a', title: `DEBERES. LIQUIDADO: ${val_52} (${val_32_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'LIQUIDADO: ' + val_52 },
            { y: 1.5, x: 100 - val_4_p - val_32_p, group: '!pago:deb', val: strata2 - val_4 - val_52, val_p: 100 - val_4_p - val_32_p, color: 'Gainsboro', title: `DEB. NO LIQUIDADO: ${strata2 - val_4 - val_52} (${(100 - val_4_p - val_32_p).toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO LIQUIDADO: ' + strata2 - val_4 - val_52 },

        ]
    }

    // Chart 1: fixed payments - 1 row
    const dataItems1 = myData();
    dataItems1.forEach((d, i) => { d.key = `seg_${i}`; });
    const chartData1 = [
        { name: '', ...Object.fromEntries(dataItems1.map(d => [d.key, d.x])) },
    ];

    // Chart 2: expedition payments - 4 rows
    const dataItems2 = myDataPayments();
    const row0 = dataItems2.filter(d => d.y === 0);
    const row05 = dataItems2.filter(d => d.y === 0.5);
    const row1 = dataItems2.filter(d => d.y === 1);
    const row15 = dataItems2.filter(d => d.y === 1.5);
    row0.forEach((d, i) => { d.key = `seg_0_${i}`; });
    row05.forEach((d, i) => { d.key = `seg_05_${i}`; });
    row1.forEach((d, i) => { d.key = `seg_1_${i}`; });
    row15.forEach((d, i) => { d.key = `seg_15_${i}`; });

    const chartData2 = [
        { name: 'VAR.', ...Object.fromEntries(row0.map(d => [d.key, d.x])) },
        { name: 'IMM.', ...Object.fromEntries(row05.map(d => [d.key, d.x])) },
        { name: 'UIS.', ...Object.fromEntries(row1.map(d => [d.key, d.x])) },
        { name: 'DEB.', ...Object.fromEntries(row15.map(d => [d.key, d.x])) },
    ];

    const allBars2 = [...row0, ...row05, ...row1, ...row15];

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

    return (
        <div className="border p-2">
            <div className="row text-center my-2">
                <label className="fw-bold">PAGOS EXPENSAS FIJAS ({safeItems.length})</label>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <ResponsiveContainer width={500} height={100}>
                        <BarChart layout="vertical" data={chartData1} stackOffset="none">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => value + '%'} />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip content={<CustomTooltip1 />} />
                            {dataItems1.map((item) => (
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
                <div className="col d-flex justify-content-center">
                    {dataItems1.map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>
            </div>
            <div className="row text-center my-2">
                <label className="fw-bold">PAGOS DE EXPEDICIÓN ({getPayments().length} CON ACTA VIABLE) </label>
                <h5 className="">Estrato {'>'} 2 : {getStrata()[0]}</h5>
                <h5 className="">Deb. Urb. Generados : {getStrata()[1]}</h5>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <ResponsiveContainer width={500} height={160}>
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
                    {[dataItems2[9], dataItems2[10], dataItems2[11]].filter(Boolean).map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>
                <div className="col d-flex justify-content-left">
                    {[dataItems2[6], dataItems2[7], dataItems2[8]].filter(Boolean).map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>

                <div className="col d-flex justify-content-left">
                    {[dataItems2[3], dataItems2[4], dataItems2[5]].filter(Boolean).map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>

                <div className="col d-flex justify-content-left">
                    {[dataItems2[0], dataItems2[1], dataItems2[2]].filter(Boolean).map((item, i) => (
                        <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                    ))}
                </div>
            </div>

        </div >
    );
}

export default FUN_CHART_PAYMENT_1;
