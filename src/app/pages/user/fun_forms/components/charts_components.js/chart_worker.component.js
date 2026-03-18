import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { regexChecker_isPh } from '../../../../../components/customClasses/typeParse';

const Colors = ['#FF9A42', '#E8514D', '#DA62FF', '#4D56E8', '#54E6FF', '#3DFF74', '#B1E82C', '#FFD130'];

function loppJump(array, Iterator) {
    let aLength = array.length;
    let counter = 0;
    for (var i = 0; i <= Iterator; i++) {
        if (i > aLength) {
            i = 0
        }
        counter++;
        if (counter > Iterator) return array[i];
    }
    return array[0];
}

function FUN_CHART_WORKER(props) {
    const { translation, swaMsg, globals, items, workers, _UPDATE_FILTERS } = props;
    const [hovered, setHovered] = useState(false);

    const safeItems = Array.isArray(items) ? items : [];
    const safeWorkers = Array.isArray(workers) ? workers : [];

    let reduceWorkerList = (array) => {
        const safeArray = Array.isArray(array) ? array : [];
        let newList = [];
        for (let i = 0; i < safeArray.length; i++) {
            if (safeArray[i].role_name == 'Ingeniero' || safeArray[i].role_name == 'Abogado' || safeArray[i].role_name == 'Arquitecto') {
                newList.push(safeArray[i])
            }
        }
        return newList;
    }

    let myData = (_condition, _id, _config = {}) => {
        var val_1 = 0; // JUR
        var val_2 = 0; // ARC
        var val_3 = 0; // ENG

        for (var i = 0; i < safeItems.length; i++) {
            if (regexChecker_isPh(safeItems[i], true)) {
                if (safeItems[i].sign_ph_law_worker_id == null) val_1++;
                if (safeItems[i].sign_ph_arc_worker_id == null) val_2++;
            } else {
                if (safeItems[i].asign_law_worker_id == null) val_1++;
                if (safeItems[i].asign_eng_worker_id == null) val_3++;
                if (safeItems[i].asign_arc_worker_id == null) val_2++;
            }
        }

        let total = val_1 + val_2 + val_3;
        let val_1_p = val_1 / total * 100;
        let val_2_p = val_2 / total * 100;
        let val_3_p = val_3 / total * 100;
        return {
            JUR: { val: val_1, val_p: val_1_p, group: 'i:j:nap', title: `JURIDICO SIN ASIGNAR : ${val_1} (${val_1_p.toFixed(2)}%)` },
            ARQ: { val: val_2, val_p: val_2_p, group: 'i:q:nap', title: `ARQUITECTONICO  SIN ASIGNAR: ${val_2} (${val_2_p.toFixed(2)}%)` },
            EST: { val: val_3, val_p: val_3_p, group: 'i:e:nap', title: `ESTRUCTURAL SIN ASIGNAR: ${val_3} (${val_3_p.toFixed(2)}%)` },
        }
    }

    let myDataWorkers = () => {
        const workersNames_bundle = []
        var vals = [];
        var vals_p = []
        let _workers = reduceWorkerList(safeWorkers);

        for (var i = 0; i < _workers.length; i++) {
            workersNames_bundle.push(_workers[i].name + ' ' + _workers[i].surname);
            vals.push(0);
            vals_p.push(0);
        }

        for (var i = 0; i < safeItems.length; i++) {
            var workersNames_bundle_toCheck = [];
            if (regexChecker_isPh(safeItems[i], true)) {
                if (safeItems[i].asign_ph_law_worker_name) workersNames_bundle_toCheck.push(safeItems[i].asign_ph_law_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                if (safeItems[i].asign_ph_arc_worker_name) workersNames_bundle_toCheck.push(safeItems[i].asign_ph_arc_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
            } else {
                if (safeItems[i].asign_law_worker_name) workersNames_bundle_toCheck.push(safeItems[i].asign_law_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                if (safeItems[i].asign_eng_worker_name) workersNames_bundle_toCheck.push(safeItems[i].asign_eng_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                if (safeItems[i].asign_arc_worker_name) workersNames_bundle_toCheck.push(safeItems[i].asign_arc_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
            }
            for (var j = 0; j < workersNames_bundle.length; j++) {
                let nameToCheck = workersNames_bundle[j].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
                if (workersNames_bundle_toCheck.includes(nameToCheck)) vals[j]++;
            }
        }

        for (var i = 0; i < vals_p.length; i++) {
            vals_p[i] = vals[i] / safeItems.length * 100;
        }

        let data = [];
        for (var i = 0; i < workersNames_bundle.length; i++) {
            let _x = 1;
            if (_workers[i].role_name.includes('Abogad')) _x = 1;
            if (_workers[i].role_name.includes('Arquitect')) _x = 2;
            if (_workers[i].role_name.includes('Ingenier')) _x = 3;
            data.push({
                x: _x, y: vals[i], group: `prof:${_workers[i].name} ${_workers[i].surname}`,
                val: vals[i], val_p: vals_p[i], color: loppJump(Colors, i),
                title: `${_workers[i].name} ${_workers[i].surname}: ${vals[i]} (${vals_p[i].toFixed(2)}%)`, strokeWidth: 10
            })
        }

        return data;
    }

    // Build recharts data: each category (JUR/ARQ/EST) is a row, each worker is a stacked bar key
    const buildChartData = () => {
        const workersData = myDataWorkers();
        const unassigned = myData();
        const _workers = reduceWorkerList(safeWorkers);
        const categories = ['JUR', 'ARQ', 'EST'];
        const xMap = { JUR: 1, ARQ: 2, EST: 3 };

        const rows = categories.map(cat => {
            const row = { name: cat };
            // Add worker values for this category
            for (let i = 0; i < workersData.length; i++) {
                const w = workersData[i];
                const key = `worker_${i}`;
                row[key] = w.x === xMap[cat] ? w.val : 0;
            }
            // Add unassigned
            row['unassigned'] = unassigned[cat] ? unassigned[cat].val : 0;
            return row;
        });
        return rows;
    }

    const getBarKeys = () => {
        const workersData = myDataWorkers();
        const keys = workersData.map((_, i) => `worker_${i}`);
        keys.push('unassigned');
        return keys;
    }

    const getBarColor = (key) => {
        if (key === 'unassigned') return 'Gainsboro';
        const idx = parseInt(key.replace('worker_', ''));
        return loppJump(Colors, idx);
    }

    const getGroupForKey = (key, catName) => {
        if (key === 'unassigned') {
            const xMap = { JUR: 'i:j:nap', ARQ: 'i:q:nap', EST: 'i:e:nap' };
            return xMap[catName] || '';
        }
        const workersData = myDataWorkers();
        const idx = parseInt(key.replace('worker_', ''));
        return workersData[idx] ? workersData[idx].group : '';
    }

    const chartData = buildChartData();
    const barKeys = getBarKeys();
    const workersLegendData = myDataWorkers();

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const item = payload[0];
            return (
                <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', width: '200px', fontSize: 'small' }}>
                    <label className="fw-bold">{item.name}: {item.value}</label>
                </div>
            );
        }
        return null;
    }

    const handleBarClick = (data, key) => {
        if (_UPDATE_FILTERS && data && data.activePayload) {
            const catName = data.activePayload[0]?.payload?.name;
            const group = getGroupForKey(key, catName);
            _UPDATE_FILTERS(group);
        }
    }

    const handleLegendClick = (item) => {
        if (_UPDATE_FILTERS && item && item.group) {
            _UPDATE_FILTERS(item.group);
        }
    }

    return (
        <div className="border p-2">
            <div className="row text-center my-2">
                <label className="fw-bold">ASIGNACION DE INFORMES ({safeItems.length})</label>
            </div>
            <div className="row">
                <div className="col-3 d-flex justify-content-center">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {workersLegendData.map((item, i) => (
                            <div key={i}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: 4 }}
                                onClick={() => handleLegendClick(item)}>
                                <div style={{ width: 10, height: 10, backgroundColor: item.color, marginRight: 8 }} />
                                <span style={{ fontSize: 'small' }}>{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col d-flex justify-content-center">
                    <ResponsiveContainer width={400} height={300}>
                        <BarChart data={chartData} margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" domain={[0, safeItems.length + 10]} />
                            <YAxis yAxisId="right" orientation="right"
                                tickFormatter={(value) => (value / safeItems.length * 100).toFixed(0) + "%"}
                                domain={[0, safeItems.length + 10]} />
                            <Tooltip content={<CustomTooltip />} />
                            {barKeys.map((key) => (
                                <Bar key={key} dataKey={key} stackId="a" yAxisId="left"
                                    fill={getBarColor(key)}
                                    onClick={(data) => {
                                        if (_UPDATE_FILTERS) {
                                            const catName = data?.name;
                                            const group = getGroupForKey(key, catName);
                                            _UPDATE_FILTERS(group);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default FUN_CHART_WORKER;
