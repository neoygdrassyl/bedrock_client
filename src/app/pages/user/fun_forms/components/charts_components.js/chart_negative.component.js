import React, { Component } from 'react';

import {
    Hint,
    DiscreteColorLegend,
    VerticalGridLines,
    XYPlot,
    HorizontalGridLines,
    XAxis,
    YAxis,
    HorizontalBarSeries,
    ContinuousColorLegend
} from 'react-vis';
import 'react-vis/dist/style.css';

class FUN_CHART_NEGATIVE extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
    }
    render() {
        const { translation, swaMsg, globals, items } = this.props;
        const { } = this.state;
        // COMPONENT JSX
        let _GET_HOOVER_BOX_CONTENT = _HOOVER => {
            return <>
                <label className="fw-bold">{_HOOVER.title}</label>
            </>
        }

        let myData = () => {
            var val_1 = 0;
            var val_2 = 0;
            var val_3 = 0;
            var val_4 = 0;
            var val_5 = 0;
            var val_6 = 0;


            for (var i = 0; i < items.length; i++) {
                let element = items[i];
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

        let total = () => {
            let data = myData();
            return data[0].val + data[1].val + data[2].val + data[3].val 
        }

        return (
            <div className="border p-2">
                <div className="row">
                    <div className="row text-center my-2">
                        <label className="fw-bold">DESISTIMIENTOS EN CURSO ({total()})</label>
                    </div>
                    <div className="col d-flex justify-content-center">

                        <XYPlot width={500} height={100} xDomain={[0, 100]} yDomain={[0.5, 1.5]}
                            stackBy="x">
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <XAxis tickFormat={(value) => value + '%'} />
                            <YAxis tickValues={[1]} tickFormat={tick => {
                                if (tick == 1) return 'DES'
                            }}
                            />
                            <HorizontalBarSeries
                                colorType="literal"
                                data={myData()}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            />

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
                <div className="row">
                    <div className="row d-flex justify-content-center">
                        <div className='col'>
                            <DiscreteColorLegend
                                orientation="horizontal"
                                onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                                items={[myData()[0], myData()[1]]}
                            />
                        </div>
                        <div className='col'>
                            <DiscreteColorLegend
                                orientation="horizontal"
                                onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                                items={[myData()[2], myData()[3]]}
                            />
                        </div>

                    </div>
                </div>

            </div >
        );
    }
}

export default FUN_CHART_NEGATIVE;