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

class FUN_CHART_PAYMENT_1 extends Component {
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
                if (!items[i].clock_payment) val_1++;
                if (items[i].clock_payment) val_2++;
            }

            let total = val_1 + val_2;
            let val_1_p = val_1 / total * 100;
            let val_2_p = val_2 / total * 100;


            return [
                { y: 0.5, x: val_2_p, group: 'pago:fijo', val: val_2, val_p: val_2_p, color: '#F5EE62', title: `PAGADO: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO VIABLE: ' + val_2 },
                { y: 0.5, x: val_1_p, group: '!pago:fijo', val: val_1, val_p: val_1_p, color: 'Gainsboro', title: `SIN PAGAR: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'SIN EVALUAR: ' + val_1 },
            ]
        }

        let getPayments = () => {
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

        let getStrata = () => {
            let items = getPayments();
            let items2 = 0;
            let itemscub2 = 0;
            items.map(value => {
                if (Number(value.estrato) > 2) items2++;
                if (value.exp_cub2s) itemscub2++;
            })
            return [items2, itemscub2]
        }

        let myDataPayments = () => {
            var val_1 = 0;
            var val_2 = 0;
            var val_3 = 0;
            var val_4 = 0;
            var val_5 = 0;
            var val_5 = 0;
            var val_52 = 0;
            var strata2 = 0;

            let totalPayments = getPayments();
            for (var i = 0; i < totalPayments.length; i++) {
                const item = totalPayments[i];
                if (item.clock_pay_62) val_1++;
                if (item.clock_pay_63) val_2++;
                if (item.clock_pay_64) val_3++;
                if (item.clock_pay_65) val_4++;
                if (item.exp_date) val_5++;

                if (Number(item.estrato) > 2) strata2++;
                if (Number(item.estrato) > 2 && item.exp_date) val_52++;
            }

            let total = totalPayments.length;
            let val_1_p = (val_1 / total * 100) || 0;
            let val_2_p = (val_2 / total * 100) || 0;
            let val_3_p = (val_3 / strata2 * 100) || 0;
            let val_4_p = (val_4 / total * 100) || 0;
            let val_5_p = (val_5 / total * 100) || 0;
            let val_32_p = (val_52 / strata2 * 100) || 0;


            return [
                { y: 0, x: val_1_p, group: 'pago:var', val: val_1, val_p: val_1_p, color: '#b3f562', title: `VAR. PAGADO: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'PAGADO: ' + val_1 },
                { y: 0, x: val_5_p, group: 'pago:var', val: val_5, val_p: val_5_p, color: '#597a31', title: `VAR. LIQUIDADO: ${val_5} (${val_5_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'LIQUIDADO: ' + val_5 },
                { y: 0, x: 100 - val_1_p - val_5_p, group: '!pago:var', val: total - val_1 - val_5, val_p: 100 - val_1_p - val_5_p, color: 'Gainsboro', title: `VAR. NO LIQUIDADO: ${totalPayments.length - val_1 - val_5} (${(100 - val_1_p - val_5_p).toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO LIQUIDADO: ' + total - val_1 - val_5 },

                { y: 0.5, x: val_2_p, group: 'pago:inm', val: val_2, val_p: val_2_p, color: '#F5EE62', title: `IMP. PAGADO: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'PAGADO: ' + val_2 },
                { y: 0.5, x: val_5_p, group: 'pago:inm', val: val_5, val_p: val_5_p, color: '#7a7731', title: `IMP. LIQUIDADO: ${val_5} (${val_5_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'LIQUIDADO: ' + val_5 },
                { y: 0.5, x: 100 - val_2_p - val_5_p, group: '!pago:inm', val: total - val_2 - val_5, val_p: 100 - val_2_p - val_5_p, color: 'Gainsboro', title: `INM. NO LIQUIDADO: ${totalPayments.length - val_2 - val_5} (${(100 - val_2_p - val_5_p).toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO LIQUIDADO: ' + total - val_2 - val_5 },

                { y: 1, x: val_3_p, group: 'pago:uis', val: val_3, val_p: val_3_p, color: '#f5a562', title: `UIS PAGADO: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'PAGADO: ' + val_3 },
                { y: 1, x: val_32_p, group: 'pago:uis', val: val_52, val_p: val_32_p, color: '#7a5231', title: `UIS. LIQUIDADO: ${val_52} (${val_32_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'LIQUIDADO: ' + val_52 },
                { y: 1, x: 100 - val_3_p - val_32_p, group: '!pago:uis', val: strata2 - val_3 - val_52, val_p: 100 - val_3_p - val_32_p, color: 'Gainsboro', title: `UIS. NO LIQUIDADO: ${strata2 - val_3 - val_52} (${(100 - val_3_p - val_32_p).toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO LIQUIDADO: ' + strata2 - val_3 - val_52 },

                { y: 1.5, x: val_4_p, group: 'pago:deb', val: val_4, val_p: val_4_p, color: '#6269f5', title: `DEB. PAGADO.: ${val_4} (${val_4_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'PAGADO: ' + val_4 },
                { y: 1.5, x: val_32_p, group: 'pago:deb', val: val_32_p, val_p: val_52, color: '#31347a', title: `DEBERES. LIQUIDADO: ${val_52} (${val_32_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'LIQUIDADO: ' + val_52 },
                { y: 1.5, x: 100 - val_4_p - val_32_p, group: '!pago:deb', val: strata2 - val_4 - val_52, val_p: 100 - val_4_p - val_32_p, color: 'Gainsboro', title: `DEB. NO LIQUIDADO: ${strata2 - val_4 - val_52} (${(100 - val_4_p - val_32_p).toFixed(2)}%)`, strokeWidth: 10, hintText: 'NO LIQUIDADO: ' + strata2 - val_4 - val_52 },

            ]
        }

        return (
            <div className="border p-2">
                <div className="row text-center my-2">
                    <label className="fw-bold">PAGOS EXPENSAS FIJAS ({items.length})</label>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center">

                        <XYPlot width={500} height={100} xDomain={[0, 100]} yDomain={[0, 1, 2]}
                            stackBy="x">
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <XAxis tickFormat={(value) => value + '%'} />
                            <YAxis tickValues={[0, 0.5, 1, 1.5]} tickFormat={() => ''}
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
                <div className="row text-center my-2">
                    <label className="fw-bold">PAGOS DE EXPEDICIÓN ({getPayments().length} CON ACTA VIABLE) </label>
                    <h5 className="">Estrato {'>'} 2 : {getStrata()[0]}</h5>
                    <h5 className="">Deb. Urb. Generados : {getStrata()[1]}</h5>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center">

                        <XYPlot width={500} height={160} xDomain={[0, 100]} yDomain={[0, 1.5]}
                            stackBy="x">
                            <VerticalGridLines />
                            <HorizontalGridLines />
                            <XAxis tickFormat={(value) => value + '%'} />
                            <YAxis tickValues={[0, 0.5, 1, 1.5]} tickFormat={tick => {
                                if (tick == 0) return 'VAR.'
                                if (tick == 0.5) return 'IMM.'
                                if (tick == 1) return 'UIS.'
                                if (tick == 1.5) return 'DEB.'
                            }}
                            />
                            <HorizontalBarSeries
                                colorType="literal"
                                data={myDataPayments()}
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
                            items={[myDataPayments()[9], myDataPayments()[10], myDataPayments()[11],]}
                        />
                    </div>
                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataPayments()[6], myDataPayments()[7], myDataPayments()[8],]}
                        />
                    </div>

                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataPayments()[3], myDataPayments()[4], myDataPayments()[5],]}
                        />
                    </div>

                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataPayments()[0], myDataPayments()[1], myDataPayments()[2],]}
                        />
                    </div>
                </div>

            </div >
        );
    }
}

export default FUN_CHART_PAYMENT_1;