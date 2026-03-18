import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FUN_CHART_RECORD_2 = ({ items, _UPDATE_FILTERS }) => {
    const [hovered, setHovered] = useState(null);
    const safeItems = Array.isArray(items) ? items : [];

    const myData = () => {
        var val_1 = 0;
        var val_2 = 0;

        for (var i = 0; i < safeItems.length; i++) {
            if (safeItems[i].state >= 5){
                if (safeItems[i].clock_not_1 == null && safeItems[i].clock_not_2 == null && safeItems[i].clock_not_3 == null && safeItems[i].clock_not_4 == null) val_1++;
                if (safeItems[i].clock_not_1 != null || safeItems[i].clock_not_2 != null || safeItems[i].clock_not_3 != null || safeItems[i].clock_not_4 != null) val_2++;
            }
        }

        let total = val_1 + val_2;
        let val_1_p = val_1 / total * 100;
        let val_2_p = val_2 / total * 100;

        return [
            { y: 0.5, x: val_2_p, group: 'acta:not', val: val_2, val_p: val_2_p, color: 'MidnightBlue', title: `NOTIFICADO: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
            { y: 0.5, x: val_1_p, group: '!acta:not', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN NOTIFICAR: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
        ]
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
    const legendPayload = data.map((d, i) => ({
        value: d.title, type: 'square', color: d.color, id: `seg${i}`, group: d.group
    }));

    return (
        <div className="border p-2">
            <div className="row text-center my-2">
                <label className="fw-bold">ACTAS NOTIFICADAS ({myData().reduce((prev, next) => prev.val + next.val)})</label>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <BarChart layout="vertical" width={300} height={100} data={chartData()}
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
                <div className="col d-flex justify-content-center">
                    <Legend payload={legendPayload}
                        onClick={(e) => _UPDATE_FILTERS(e.group)} />
                </div>
            </div>
        </div>
    );
};

export default FUN_CHART_RECORD_2;
