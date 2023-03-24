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

class FUN_CHART_RECORD_1 extends Component {
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

        let getFuns = () => {
            let fun = []
            for (var i = 0; i < items.length; i++) {
                if (items[i].state >= 5) {
                    fun.push(items[i])
                }
            }
            return fun;
        }

        let getExp = () => {
            let fun = []
            for (var i = 0; i < items.length; i++) {
                if (items[i].state >= 5) {
                    let con1 = items[i].rec_review == 1 && (items[i].rec_review_2 != 0)
                    let con2 = items[i].rec_review == 0 && items[i].rec_review_2 == 1;
                    let con3 = items[i].rec_review == null && (items[i].rec_review_2 == 1);

                    if (con1 || con2 || con3) {
                        fun.push(items[i])
                    }
                }
            }
            return fun;
        }

        let myData = () => {
            var val_1 = 0;
            var val_2 = 0;
            var val_31 = 0;
            var val_32 = 0;

            let itemsFun = getFuns();

            for (var i = 0; i < itemsFun.length; i++) {
                const item = itemsFun[i];
                if (item.rec_review == null && item.rec_review_2 == null) val_1++;

                if (item.rec_review != null || item.rec_review_2 != null) val_2++;

                let con1 = item.rec_review == 1 && (item.rec_review_2 != 0);
                let con2 = item.rec_review == 0 && (item.rec_review_2 == 1);
                let con3 = item.rec_review == null && (item.rec_review_2 == 1);

                if (con1 || con2 || con3) {
                    val_31++;
                }

                con1 = item.rec_review == 0 && (item.rec_review_2 != 1);
                con2 = item.rec_review == 1 && (item.rec_review_2 == 0);

                if (con1 || con2) {
                    val_32++;
                }

            }

            let total = getFuns().length;
            let val_1_p = val_1 / total * 100;
            let val_2_p = val_2 / total * 100;
            let val_31_p = val_31 / total * 100;
            let val_32_p = val_32 / total * 100;


            return [
                { y: 0, x: val_2_p, group: 'acta:1*', val: val_2, val_p: val_2_p, color: 'DarkMagenta', title: `CON ACTA: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
                { y: 0, x: val_1_p, group: 'acta:0*', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN ACTA: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },

                { y: 0.5, x: val_31_p, group: 'acta:si*', val: val_31, val_p: val_31_p, color: '#45008b', title: `VIABLE: ${val_31} (${val_31_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
                { y: 0.5, x: val_32_p, group: 'acta:no*', val: val_32, val_p: val_32_p, color: '#008b8b', title: `NO VIABLE: ${val_32} (${val_32_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
                { y: 0.5, x: val_1_p, group: 'acta:0*', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN ACTA: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
            ]
        }
        let myDataExp = () => {
            var val_4 = 0;

            var val_5 = 0;
            var val_6 = 0;
            var val_7 = 0;
            var val_8 = 0;

            let itemsFun = getExp();

            for (var i = 0; i < itemsFun.length; i++) {
                const item = itemsFun[i];
                //if (item.clock_not_1 != null || item.clock_not_2 != null || item.clock_not_3 != null || item.clock_not_4 != null) val_4++;

                if (item.clock_pay2) val_5++;
                if (item.clock_resolution) val_6++;
                //if (item.clock_eje) val_7++;
                if (item.clock_license) val_8++;

            }

            let total = getExp().length;
            let val_4_p = val_4 / total * 100;

            let val_5_p = val_5 / total * 100;
            let val_6_p = val_6 / total * 100;
            let val_7_p = val_7 / total * 100;
            let val_8_p = val_8 / total * 100;




            return [
                //{ y: 0, x: val_4_p, group: 'acta:not', val: val_4, val_p: val_4_p, color: 'MidnightBlue', title: `NOTIFICADO: ${val_4} (${val_4_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
                //{ y: 0, x: 100 - val_4_p, group: '!acta:not', val: total - val_4, val_p: 100 - val_4_p, color: 'Gainsboro', title: `SIN NOTIFICAR: ${total - val_4} (${(100 - val_4_p).toFixed(2)}%)`, strokeWidth: 10, hintText: '' },

                { y: 0, x: val_5_p, group: 'exp:via', val: val_5, val_p: val_5_p, color: '#b3f562', title: `ACTO VIABILIDAD: ${val_5} (${val_5_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
                { y: 0, x: 100 - val_5_p, group: '!exp:via', val: total - val_5, val_p: 100 - val_5_p, color: 'Gainsboro', title: `SIN ACTO VIABILIDAD: ${total - val_5} (${(100 - val_5_p).toFixed(2)}%)`, strokeWidth: 10, hintText: '' },

                { y: 1, x: val_6_p, group: 'exp:res', val: val_6, val_p: val_6_p, color: '#F5EE62', title: `RESOLUCIÓN: ${val_6} (${val_6_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
                { y: 1, x: 100 - val_6_p, group: '!exp:res', val: total - val_6, val_p: 100 - val_6_p, color: 'Gainsboro', title: `SIN RESOLUCIÓN: ${total - val_6} (${(100 - val_6_p).toFixed(2)}%)`, strokeWidth: 10, hintText: '' },

                //{ y: 1.5, x: val_7_p, group: 'exp:eje', val: val_7, val_p: val_7_p, color: '#707019', title: `EJECUTORIA: ${val_7} (${val_7_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
                //{ y: 1.5, x: 100 - val_7_p, group: '!exp:eje', val: total - val_7, val_p: 100 - val_7_p, color: 'Gainsboro', title: `SIN EJECUTORIA: ${total - val_7} (${(100 - val_7_p).toFixed(2)}%)`, strokeWidth: 10, hintText: '' },

                { y: 2, x: val_8_p, group: 'exp:lic', val: val_8, val_p: val_8_p, color: '#f5a562', title: `LICENCIA: ${val_8} (${val_8_p.toFixed(2)}%)`, strokeWidth: 10, hintText: '' },
                { y: 2, x: 100 - val_8_p, group: '!exp:lic', val: total - val_8, val_p: 100 - val_8_p, color: 'Gainsboro', title: `SIN LICENCIA: ${total - val_8} (${(100 - val_8_p).toFixed(2)}%)`, strokeWidth: 10, hintText: '' },


            ]
        }
        return (
            <div className="border p-2">
                <div className="row text-center my-2">
                    <label className="fw-bold">ACTAS ({getFuns().length} LEGAL Y DEBIDA FORMA)</label>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center">

                        <XYPlot width={500} height={100} xDomain={[0, 100]} yDomain={[0, 0.5]}
                            stackBy="x">
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <XAxis tickFormat={(value) => value + '%'} />
                            <YAxis tickValues={[0, 0.5, 1, 1.5, 2, 2.5, 3]} tickFormat={tick => {
                                if (tick == 0) return 'ACTA.'
                                if (tick == 0.5) return 'REV.'
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
                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myData()[2], myData()[3], , myData()[4]]}
                        />
                    </div>
                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myData()[0], myData()[1]]}
                        />
                    </div>

                </div>


                <div className="row text-center my-2">
                    <label className="fw-bold">EXPEDICION ({getExp().length} CON ACTA VIABLE)</label>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center">

                        <XYPlot width={500} height={120} xDomain={[0, 100]} yDomain={[0, 2]}
                            stackBy="x">
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <XAxis tickFormat={(value) => value + '%'} />
                            <YAxis tickValues={[0, 0.5, 1, 1.5, 2]} tickFormat={tick => {
                                //if (tick == 0) return 'NOT.'
                                if (tick == 0) return 'VIA.'
                                if (tick == 1) return 'RES.'
                                //if (tick == 1.5) return 'EJE.'
                                if (tick == 2) return 'LIC.'

                            }}
                            />
                            <HorizontalBarSeries
                                colorType="literal"
                                data={myDataExp()}
                                onValueMouseOver={e => this.setState({ hovered2: e })}
                                onValueMouseOut={e => this.setState({ hovered2: false })}
                                onValueClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            />

                            {this.state.hovered2 ?
                                <Hint value={this.state.hovered2}>
                                    <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', marginTop: '0%', width: '200px', fontSize: 'small' }}>
                                        {_GET_HOOVER_BOX_CONTENT(this.state.hovered2)}
                                    </div>
                                </Hint>
                                : null}
                        </XYPlot>
                    </div>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataExp()[4], myDataExp()[5]]}
                        />
                    </div>
                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataExp()[2], myDataExp()[3]]}
                        />
                    </div>

                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataExp()[0], myDataExp()[1]]}
                        />
                    </div>
                </div>

            </div >
        );
    }
}

export default FUN_CHART_RECORD_1;