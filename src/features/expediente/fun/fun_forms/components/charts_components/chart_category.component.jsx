import { useState, memo } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const FUN_CHART_CATEGORY = ({ translation, swaMsg, globals, items, _UPDATE_FILTERS }) => {
    const [hovered, setHovered] = useState(null);
    const safeItems = Array.isArray(items) ? items : [];

    let myData = () => {
        var val_1 = 0;
        var val_2 = 0;
        var val_3 = 0;
        var val_4 = 0;
        var val_5 = 0;
        var val_6 = 0;

        for (var i = 0; i < safeItems.length; i++) {
            if(safeItems[i].tipo){
                if ((safeItems[i].tipo).includes('D') || (safeItems[i].tipo).includes('F')) {
                    if (safeItems[i].type == 'i') val_1++;
                    if (safeItems[i].type == 'ii') val_2++;
                    if (safeItems[i].type == 'iii') val_3++;
                    if (safeItems[i].type == 'iv') val_4++;
                    //if (safeItems[i].type == 'oa') val_5++;
                    if (safeItems[i].type == 0 || safeItems[i].type == null ) val_6++;
                }
            }
        }

        let total = val_1 + val_2 + val_3 + val_4 + val_5 + val_6;
        let val_1_p = val_1 / total * 100;
        let val_2_p = val_2 / total * 100;
        let val_3_p = val_3 / total * 100;
        let val_4_p = val_4 / total * 100;
        //let val_5_p = val_5 / total * 100;
        let val_6_p = val_6 / total * 100;

        return [
            { angle: val_1, group: 'c1', val: val_1, val_p: val_1_p, color: 'CornflowerBlue', title: `I: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'CATEGORIA I: ' + val_1 },
            { angle: val_2, group: 'c2', val: val_2, val_p: val_2_p, color: 'Coral', title: `II: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'CATEGORIA II: ' + val_2 },
            { angle: val_3, group: 'c3', val: val_3, val_p: val_3_p, color: 'LightGreen', title: `III: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'CATEGORIA III: ' + val_3 },
            { angle: val_4, group: 'c4', val: val_4, val_p: val_4_p, color: 'DarkKhaki', title: `IV: ${val_4} (${val_4_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'CATEGORIA VI: ' + val_4 },
            { angle: val_6, group: 'nc*', val: val_6, val_p: val_6_p, color: 'Gainsboro', title: `SIN CATEGORIA: ${val_6} (${val_6_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'SIN CATEGORIA: ' + val_6 },
        ]
    }

    let totalList = () => {
        let list = myData();
        return list[0].val + list[1].val +list[2].val +list[3].val +list[4].val
    }

    const data = myData();
    const pieData = data.map(d => ({ name: d.title, value: d.angle, fill: d.color, group: d.group }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            return (
                <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', width: '200px', fontSize: 'small' }}>
                    <label className="fw-bold">{payload[0].name}</label>
                </div>
            );
        }
        return null;
    };

    const LegendItem = ({ item, onClick }) => (
        <span style={{ cursor: 'pointer', marginRight: '10px', display: 'inline-flex', alignItems: 'center' }} onClick={() => onClick(item.group)}>
            <span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: item.color, marginRight: 4 }} />
            <span style={{ fontSize: 'small' }}>{item.title}</span>
        </span>
    );

    return (
        <div className="border p-2">
            <div className="row text-center my-2">
                <label className="fw-bold">CATEGORIAS ({totalList()}) SOLO LIC. CON Y/O LIC. REC</label>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {data.map((item, i) => (
                            <LegendItem key={i} item={item} onClick={_UPDATE_FILTERS} />
                        ))}
                    </div>
                </div>
                <div className="col d-flex justify-content-center">
                    <PieChart width={300} height={300}>
                        <Pie data={pieData} dataKey="value" nameKey="name"
                            innerRadius={100} outerRadius={150} cx="50%" cy="50%"
                            onClick={(entry) => _UPDATE_FILTERS(entry.group)}>
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} cursor="pointer" />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </div>
            </div>
        </div >
    );
}

export default memo(FUN_CHART_CATEGORY);
