import { useState, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FUN_CHART_NEGATIVE = ({ items, _UPDATE_FILTERS }) => {
    const [hovered, setHovered] = useState(null);
    const safeItems = Array.isArray(items) ? items : [];

    const myData = () => {
        var val_1 = 0;
        var val_2 = 0;
        var val_3 = 0;
        var val_4 = 0;
        var val_5 = 0;
        var val_6 = 0;

        for (var i = 0; i < safeItems.length; i++) {
            let element = safeItems[i];
            if(!element.clocks_version) continue;
            let states = element.clocks_state ?? '';
            if(!states.includes('-5'))  continue;
            if (element.clocks_version.includes('-1') && element.state == '-101') val_1++;
            if (element.clocks_version.includes('-2') && element.state == '-102') val_1++;
            if (element.clocks_version.includes('-3') && element.state == '-103') val_3++;
            if (element.clocks_version.includes('-4') && element.state == '-104') val_4++;
            if (element.clocks_version.includes('-5') && element.state == '-105') val_5++;
            if (element.clocks_version.includes('-6') && element.state == '-106') val_6++;
        }

        let total = val_1 + val_2 + val_3 + val_4 + val_5 + val_6;
        let val_1_p = val_1 / total * 100;
        let val_2_p = val_2 / total * 100;
        let val_3_p = val_3 / total * 100;
        let val_4_p = val_4 / total * 100;
        let val_5_p = val_5 / total * 100;

        return [
            { y: 1, x: val_1_p, group: 'des:now:inc', val: val_1, val_p: val_1_p, color: '#6269f5', title: `INCOMPLETO: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'VOLUNTARIO: ' + val_1 },
            { y: 1, x: val_2_p, group: 'relax', val: val_2, val_p: val_2_p, color: '#6269f5', title: `NO VIABLE JUR: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO VIABLE: ' + val_2 },
            { y: 1, x: val_3_p, group: 'des:now:acta', val: val_3, val_p: val_3_p, color: '#f5a562', title: `NO CUMPLE ACTA CORR.S: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO PAGO EXPENSAS: ' + val_3 },
            { y: 1, x: val_4_p, group: 'des:now:pago', val: val_4, val_p: val_4_p, color: '#F5EE62', title: `NO PAGO EXPENSAS: ${val_4} (${val_4_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO CUMPLE ACTA DE CORRECCIONES: ' + val_4 },
            { y: 1, x: val_5_p, group: 'des:now:vol', val: val_5, val_p: val_5_p, color: '#b3f562', title: `VOLUNTARIO: ${val_5} (${val_5_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'INCOMPLETO: ' + val_5 },
        ]
    }

    const total = () => {
        let data = myData();
        return data[0].val + data[1].val + data[2].val + data[3].val;
    }

    const chartData = () => {
        const data = myData();
        const row = {};
        data.forEach((d, i) => { row[`seg${i}`] = d.x; });
        return [row];
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const entry = payload[0];
            const segIndex = parseInt(entry.dataKey.replace('seg', ''));
            const item = myData()[segIndex];
            return (
                <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', width: '200px', fontSize: 'small' }}>
                    <label className="fw-bold">{item?.title}</label>
                </div>
            );
        }
        return null;
    };

    const data = myData();
    const legendPayloadRow1 = [data[0], data[1]].map((d, i) => ({
        value: d.title, type: 'square', color: d.color, id: `seg${i}`, group: d.group
    }));
    const legendPayloadRow2 = [data[2], data[3]].map((d, i) => ({
        value: d.title, type: 'square', color: d.color, id: `seg${i + 2}`, group: d.group
    }));

    return (
        <div className="border p-2">
            <div className="row">
                <div className="row text-center my-2">
                    <label className="fw-bold">DESISTIMIENTOS EN CURSO ({total()})</label>
                </div>
                <div className="col d-flex justify-content-center">
                    <BarChart layout="vertical" width={500} height={100} data={chartData()}
                        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => v + '%'} />
                        <YAxis type="category" dataKey="" hide />
                        {data.map((d, i) => (
                            <Bar key={i} dataKey={`seg${i}`} stackId="a" fill={d.color}
                                onClick={() => _UPDATE_FILTERS(d.group)}
                                cursor="pointer" />
                        ))}
                        <Tooltip content={<CustomTooltip />} />
                    </BarChart>
                </div>
            </div>
            <div className="row">
                <div className="row d-flex justify-content-center">
                    <div className='col'>
                        <Legend payload={legendPayloadRow1}
                            onClick={(e) => _UPDATE_FILTERS(e.group)} />
                    </div>
                    <div className='col'>
                        <Legend payload={legendPayloadRow2}
                            onClick={(e) => _UPDATE_FILTERS(e.group)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(FUN_CHART_NEGATIVE);
