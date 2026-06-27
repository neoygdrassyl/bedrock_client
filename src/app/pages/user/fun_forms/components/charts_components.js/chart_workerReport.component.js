import { useState, memo } from 'react';
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

function FUN_CHART_WORKER_REPORT(props) {
    const { translation, swaMsg, globals, items, workers, _UPDATE_FILTERS } = props;
    const [hovered, setHovered] = useState(false);

    const safeItems = Array.isArray(items) ? items : [];
    const safeWorkers = Array.isArray(workers) ? workers : [];

    let reduceWorkerList = () => {
        let array = safeWorkers;
        let newList = [];
        for (let i = 0; i < array.length; i++) {
            if (array[i].role_name == 'Ingeniero' || array[i].role_name == 'Abogada' || array[i].role_name == 'Arquitecta') {
                newList.push(array[i])
            }
        }
        return newList;
    }

    let myDataWorkers = () => {
        const workersNames_bundle = []
        var vals = [];
        var vals_p = [];
        let workers = reduceWorkerList();
        for (var i = 0; i < workers.length; i++) {
            workersNames_bundle.push(workers[i].name + ' ' + workers[i].surname);
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
            data.push({
                x: i, y: vals[i], group: `prof:${workers[i].name} ${workers[i].surname}`,
                val: vals[i], val_p: vals_p[i], color: loppJump(Colors, i),
                title: `${workers[i].name} ${workers[i].surname}: ${vals[i]} (${vals_p[i].toFixed(2)}%)`, strokeWidth: 10,
                initials: workers[i].name[0] + '' + workers[i].surname[0],
                name: workers[i].name[0] + '' + workers[i].surname[0],
            })
        }

        return data;
    }

    const chartData = myDataWorkers();

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length > 0) {
            const item = payload[0]?.payload;
            if (item) {
                return (
                    <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', width: '200px', fontSize: 'small' }}>
                        <label className="fw-bold">{item.title}</label>
                    </div>
                );
            }
        }
        return null;
    }

    const handleLegendClick = (item) => {
        if (_UPDATE_FILTERS && item && item.group) {
            _UPDATE_FILTERS(item.group);
        }
    }

    return (
        <div className="border p-2">
            <div className="row text-center my-2">
                <label className="fw-bold">ASIGNACION DE PROFESIONALES ({safeItems.length})</label>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {chartData.map((item, i) => (
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
                    <ResponsiveContainer width={600} height={300}>
                        <BarChart data={chartData} margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, safeItems.length + 10]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="val"
                                onClick={(data) => {
                                    if (_UPDATE_FILTERS && data && data.group) {
                                        _UPDATE_FILTERS(data.group);
                                    }
                                }}
                                style={{ cursor: 'pointer' }}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default memo(FUN_CHART_WORKER_REPORT);
