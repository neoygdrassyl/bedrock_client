import React, { Component } from 'react';

import {
    Hint,
    DiscreteColorLegend,
    VerticalGridLines,
    XYPlot,
    HorizontalGridLines,
    XAxis,
    YAxis,
    HorizontalBarSeries
} from 'react-vis';
import 'react-vis/dist/style.css';

class FUN_CHART_RECORD_2 extends Component {
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


            for (var i = 0; i < items.length; i++) {
                if (items[i].state >= 5){
                    if (items[i].clock_not_1 == null && items[i].clock_not_2 == null && items[i].clock_not_3 == null && items[i].clock_not_4 == null) val_1++;
                    if (items[i].clock_not_1 != null || items[i].clock_not_2 != null || items[i].clock_not_3 != null || items[i].clock_not_4 != null) val_2++;
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

        return (
            <div className="border p-2">
                <div className="row text-center my-2">
                    <label className="fw-bold">ACTAS NOTIFICADAS ({myData().reduce((prev, next) => prev.val + next.val )})</label>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center">

                        <XYPlot width={300} height={100} xDomain={[0, 100]} yDomain={[0, 1, 2]}
                            stackBy="x">
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <XAxis tickFormat={(value) => value + '%'} />
                            <YAxis tickValues={[0, 1, 2]} tickFormat={() => ''}
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
                    <div className="col d-flex justify-content-center">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={myData()}
                        />

                    </div>
                </div>

            </div >
        );
    }
}

export default FUN_CHART_RECORD_2;