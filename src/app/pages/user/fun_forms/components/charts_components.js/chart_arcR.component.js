import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FUN_CHART_ARC_R = ({ items, _UPDATE_FILTERS }) => {
    const [hovered, setHovered] = useState(null);
    const safeItems = Array.isArray(items) ? items : [];

    const myData = () => {
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
            { y: 0.5, x: val_3_p, group: 'arq:si', val: val_3, val_p: val_3_p, color: 'Aqua', title: `VIABLE: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'VIABLE: ' + val_3 },
            { y: 0.5, x: val_2_p, group: 'arq:no', val: val_2, val_p: val_2_p, color: 'DarkCyan', title: `NO VIABLE: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO VIABLE: ' + val_2 },
            { y: 0.5, x: val_1_p, group: 'arq:0', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN EVALUAR: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'SIN EVALUAR: ' + val_1 },
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
                <label className="fw-bold">INFORMES ARQUITECTONICOS ({safeItems.length})</label>
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

export default FUN_CHART_ARC_R;
