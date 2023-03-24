import React, { Component } from 'react';

import {
    Hint,
    RadialChart,
    DiscreteColorLegend,
    VerticalGridLines,
    XYPlot,
    HorizontalGridLines,
    XAxis,
    YAxis,
    VerticalBarSeries,
    HorizontalBarSeries
} from 'react-vis';
import 'react-vis/dist/style.css';

class FUN_CHART_ENG_R extends Component {
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

            for (var i = 0; i < items.length; i++) {
                if (items[i].eng_review == null || items[i].eng_review_2 == null) val_1++;
                if (items[i].eng_review == 0 || items[i].eng_review_2 == 0) val_2++;
                if (items[i].eng_review == 1 && items[i].eng_review_2 == 1) val_3++;
            }

            let total = val_1 + val_2 + val_3;
            let val_1_p = val_1 / total * 100;
            let val_2_p = val_2 / total * 100;
            let val_3_p = val_3 / total * 100;

            return [
                { y: 0.5, x: val_3_p, group: 'ing:si', val: val_3, val_p: val_3_p, color: 'Red', title: `CUMPLE: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'CUMPLE: ' + val_3 },
                { y: 0.5, x: val_2_p, group: 'ing:no', val: val_2, val_p: val_2_p, color: 'DarkRed', title: `NO CUMPLE: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO CUMPLE: ' + val_2 },
                { y: 0.5, x: val_1_p, group: 'ing:0', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN EVALUAR: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'SIN EVALUAR: ' + val_1 },
            ]
        }

        return (
            <div className="border p-2">
                <div className="row text-center my-2">
                    <label className="fw-bold">INFORMES ESTRUCTURALES ({items.length})</label>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center">

                        <XYPlot width={300} height={100} xDomain={[0, 100]} yDomain={[0, 1, 2]}
                            stackBy="x">
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <XAxis tickFormat={(value) => value+'%'}/>
                            <YAxis tickValues={[0, 1, 2]} tickFormat={() => ''}
                            />
                            <HorizontalBarSeries
                                colorType="literal"
                                data={myData()}
                                onValueMouseOver={e => this.setState({ hovered: e })}
                                onValueMouseOut={e => this.setState({ hovered: false })}
                                onValueClick={(e) =>  this.props._UPDATE_FILTERS(e.group)}
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
                            onItemClick={(e) =>  this.props._UPDATE_FILTERS(e.group)}
                            items={myData()}
                        />
                    </div>
                </div>

            </div >
        );
    }
}

export default FUN_CHART_ENG_R;