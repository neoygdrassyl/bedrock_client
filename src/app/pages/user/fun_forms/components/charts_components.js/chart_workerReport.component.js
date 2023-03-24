import React, { Component } from 'react';

import {
    Hint,
    RadialChart,
    DiscreteColorLegend,
    XYPlot,
    VerticalGridLines,
    HorizontalGridLines,
    XAxis,
    YAxis,
    VerticalBarSeries
} from 'react-vis';
import 'react-vis/dist/style.css';
import { regexChecker_isPh } from '../../../../../components/customClasses/typeParse';

class FUN_CHART_WORKER_REPORT extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
    }
    render() {
        const { translation, swaMsg, globals, items, workers } = this.props;
        const { } = this.state;
        var tickValues = [];
        for (var i = 0; i < workers.length; i++) {
            tickValues.push(i)
        }
        let reduceWorkerList = ()=>{
            let array = workers;
            let newList = [];
            for (let i = 0; i < array.length; i++) {
                if(array[i].role_name == 'Ingeniero' || array[i].role_name == 'Abogada' || array[i].role_name == 'Arquitecta') {
                    newList.push(array[i])
                }
            }
            return newList;
        }
        const Colors = ['#FF9A42', '#E8514D', '#DA62FF', '#4D56E8', '#54E6FF', '#3DFF74', '#B1E82C', '#FFD130']
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
        // COMPONENT JSX
        let _GET_HOOVER_BOX_CONTENT = _HOOVER => {
            return <>
                <label className="fw-bold">{_HOOVER.title}</label>
            </>
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

            for (var i = 0; i < items.length; i++) {
                var workersNames_bundle_toCheck = [];
                if (regexChecker_isPh(items[i], true)) {
                    if (items[i].asign_ph_law_worker_name) workersNames_bundle_toCheck.push(items[i].asign_ph_law_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                    if (items[i].asign_ph_arc_worker_name) workersNames_bundle_toCheck.push(items[i].asign_ph_arc_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                } else {
                    if (items[i].asign_law_worker_name) workersNames_bundle_toCheck.push(items[i].asign_law_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                    if (items[i].asign_eng_worker_name) workersNames_bundle_toCheck.push(items[i].asign_eng_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                    if (items[i].asign_arc_worker_name) workersNames_bundle_toCheck.push(items[i].asign_arc_worker_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase());
                }
                for (var j = 0; j < workersNames_bundle.length; j++) {
                    let nameToCheck = workersNames_bundle[j].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
                    if (workersNames_bundle_toCheck.includes(nameToCheck)) vals[j]++;
                }

            }

            for (var i = 0; i < vals_p.length; i++) {
                vals_p[i] = vals[i] / items.length * 100;
            }

            let data = [];
            for (var i = 0; i < workersNames_bundle.length; i++) {
                data.push({
                    x: i, y: vals[i], group: `prof:${workers[i].name} ${workers[i].surname}`,
                    val: vals[i], val_p: vals_p[i], color: loppJump(Colors, i),
                    title: `${workers[i].name} ${workers[i].surname}: ${vals[i]} (${vals_p[i].toFixed(2)}%)`, strokeWidth: 10
                })
            }

            return data;
        }

        return (
            <div className="border p-2">
                <div className="row text-center my-2">
                    <label className="fw-bold">ASIGNACION DE PROFESIONALES ({items.length})</label>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center">
                        <DiscreteColorLegend
                            orientation="vertical"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={myDataWorkers()}
                        />

                    </div>
                    <div className="col d-flex justify-content-center">
                        <XYPlot width={600} height={300} yDomain={[0, items.length + 10]}
                            margin={{ left: 80 }} >
                            <VerticalGridLines />
                            <HorizontalGridLines />

                            <XAxis tickFormat={function tickFormat(value) {
                                let workers = reduceWorkerList();
                                if (value < workers.length) {
                                    return workers[value].name[0] + '' + workers[value].surname[0]
                                }
                                return ''
                            }}
                                tickValues={tickValues} />

                            <VerticalBarSeries colorType="literal" data={myDataWorkers()}
                                onValueMouseOver={e => this.setState({hovered: e})}
                                onValueMouseOut={() => this.setState({hovered: false})}
                                onValueClick={(e) => this.props._UPDATE_FILTERS(e.group)} />

                            {this.state.hovered ?
                                <Hint value={this.state.hovered}>
                                    <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', marginTop: '0%', width: '200px', fontSize: 'small' }}>
                                        {_GET_HOOVER_BOX_CONTENT(this.state.hovered)}
                                    </div>
                                </Hint>
                                : null}
                        </XYPlot>

                    </div>
                </div>

            </div >
        );
    }
}

export default FUN_CHART_WORKER_REPORT;