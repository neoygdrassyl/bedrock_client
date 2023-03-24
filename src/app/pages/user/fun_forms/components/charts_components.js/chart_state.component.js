import React, { Component } from 'react';

import {
    Hint,
    RadialChart,
    DiscreteColorLegend,
    Sunburst
} from 'react-vis';
import 'react-vis/dist/style.css';

class FUN_CHART_STATE extends Component {
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
            var val_11 = 0;
            var val_12 = 0;
            var val_2 = 0;
            var val_3 = 0;
            var val_4 = 0;
            var val_41 = 0;
            var val_42 = 0;
            var val_43 = 0;
            var val_44 = 0;
            var val_5 = 0;
            var val_6 = 0;
            var val_61 = 0;
            var val_62 = 0;
            var val_7 = 0;

            for (var i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.state < -100) {
                    val_7++;
                    continue;
                }
                if (item.state >= 100) {
                    val_6++;
                    if (item.state == 100) val_61++;
                    if (item.state == 101) val_62++;
                    continue;
                }
                if (item.clock_license) {
                    val_5++;
                    continue;
                }
                if (item.clock_resolution) {
                    val_4++;
                    if (item.clock_resolution_c == 'OTORGA') val_41++;
                    if (item.clock_resolution_c == 'NIEGA') val_42++;
                    if (item.clock_resolution_c == 'DESISTE') val_43++;
                    if (item.clock_resolution_c == 'OTRO') val_44++;
                    continue;
                }
                if (item.clock_pay2) {
                    val_3++;
                    continue;
                }
                if (item.clock_record_p2 || item.clock_record_p1 || item.state == 50) {
                    val_2++;
                    continue;
                }
                if (item.state == -1 || item.state == 1 || item.state == 5) {
                    val_1++;
                    if (item.state == -1 || item.state == 1) val_11++;
                    if (item.state == 5) val_12++;
                    continue;
                }
            }

            let total = val_1 + val_2 + val_3 + val_4 + val_5 + val_6 + val_7;
            let val_1_p = val_1 / total * 100;
            let val_11_p = val_11 / val_1 * 100;
            let val_12_p = val_12 / val_1 * 100;
            let val_2_p = val_2 / total * 100;
            let val_3_p = val_3 / total * 100;
            let val_4_p = val_4 / total * 100;
            let val_41_p = val_41 / val_4 * 100;
            let val_42_p = val_42 / val_4 * 100;
            let val_43_p = val_43 / val_4 * 100;
            let val_44_p = val_44 / val_4 * 100;
            let val_5_p = val_5 / total * 100;
            let val_6_p = val_6 / total * 100;
            let val_61_p = val_61 / val_6 * 100;
            let val_62_p = val_62 / val_6 * 100;
            let val_7_p = val_7 / total * 100;

            return {
                "title": "ESTADOS",
                "children": [
                    {
                        group: 'inc', val: val_1, val_p: val_1_p, color: '#FF9A42', title: `RADICACIÓN: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10,
                        children: [
                            { size: val_11, group: 'inc', color: '#B26B2E', val: val_11, val_p: val_11_p, title: `INCOMPLETO: ${val_11}/${val_1} (${(val_11_p || 0).toFixed(2)}%)`, strokeWidth: 10, },
                            { size: val_12, group: 'ldf', color: '#7F4C20', val: val_12, val_p: val_12_p, title: `LDF: ${val_12}/${val_1} (${(val_12_p || 0).toFixed(2)}%)`, strokeWidth: 10, },
                        ]
                    },
                    { size: val_2, group: 'acta', val: val_2, val_p: val_2_p, color: '#FFD130', title: `ACTA: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10 },
                    { size: val_3, group: 'via', val: val_3, val_p: val_3_p, color: '#DA62FF', title: `VIABILIDAD: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10 },
                    {
                        group: 'res', val: val_4, val_p: val_4_p, color: '#4D56E8', title: `RESOLUCION: ${val_4} (${val_4_p.toFixed(2)}%)`, strokeWidth: 10,
                        children: [
                            { size: val_41, group: 'exp:res:OTORGA', color: '#3d44b9', val: val_41, val_p: val_41_p, title: `OTORGA: ${val_41}/${val_4} (${(val_41_p || 0).toFixed(2)}%)`, strokeWidth: 10, },
                            { size: val_42, group: 'exp:res:NIEGA', color: '#2e338b', val: val_42, val_p: val_42_p, title: `NIEGA: ${val_42}/${val_4} (${(val_42_p || 0).toFixed(2)}%)`, strokeWidth: 10, },
                            { size: val_43, group: 'exp:res:DESISTE', color: '#1e225c', val: val_43, val_p: val_43_p, title: `DESISTE: ${val_43}/${val_4} (${(val_43_p || 0).toFixed(2)}%)`, strokeWidth: 10, },
                            { size: val_44, group: 'exp:res', color: '#0b0d22', val: val_44, val_p: val_44_p, title: `OTRO: ${val_44}/${val_4} (${(val_44_p || 0).toFixed(2)}%)`, strokeWidth: 10, },

                        ]
                    },
                    { size: val_5, group: 'lic', val: val_5, val_p: val_5_p, color: '#54E6FF', title: `LICENCIA: ${val_5} (${val_5_p.toFixed(2)}%)`, strokeWidth: 10 },
                    {
                        group: 'end', val: val_6, val_p: val_6_p, color: '#3DFF74', title: `EXPEDIDA: ${val_6} (${val_6_p.toFixed(2)}%)`, strokeWidth: 10,
                        children: [
                            { size: val_61, group: 'cer', color: '#30CC5C', val: val_61, val_p: val_61_p, title: `CERRADO: ${val_61}/${val_6} (${(val_61_p || 0).toFixed(2)}%)`, strokeWidth: 10, },
                            { size: val_62, group: 'ach', color: '#249945', val: val_62, val_p: val_62_p, title: `ARCHIVADO: ${val_62}/${val_6} (${(val_62_p || 0).toFixed(2)}%)`, strokeWidth: 10, },
                        ]
                    },
                    { size: val_7, group: 'des', val: val_7, val_p: val_7_p, color: '#E8514D', title: `DESISTIMIENTO: ${val_7} (${val_7_p.toFixed(2)}%)`, strokeWidth: 10 },
                ],
            }
        }

        let totalList = () => {
            let list = myData().children;
            return list[0].val + list[1].val + list[2].val + list[3].val + list[4].val + list[5].val + list[6].val;
        }
        let myDataLegend = () => {
            var data = myData().children;
            var newChildren1 = data[0].children;
            var newChildren6 = data[5].children;
            var newChildren4 = data[3].children;

            data.splice(6, 0, ...newChildren6)
            data.splice(4, 0, ...newChildren4)
            data.splice(1, 0, ...newChildren1)
            return data;
        }

        return (
            <div className="border p-2">
                <div className="row text-center my-2">
                    <label className="fw-bold">ESTADOS ({totalList()})</label>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center">
                        <Sunburst
                            hideRootNode
                            data={myData()}
                            style={{ stroke: '#fff' }}
                            height={300}
                            width={350}
                            margin={{ top: 50, bottom: 50, left: 50, right: 50 }}
                            padAngle={() => 0.00}
                            colorType="literal"
                            onValueMouseOver={(e) => this.setState({ hovered: e })}
                            onValueMouseOut={() => this.setState({ hovered: false })}
                            onValueClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                        >

                            {this.state.hovered ?
                                <Hint value={this.state.hovered}>
                                    <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', marginTop: '0%', width: '200px', fontSize: 'small' }}>
                                        {_GET_HOOVER_BOX_CONTENT(this.state.hovered)}
                                    </div>
                                </Hint>
                                : null}

                        </Sunburst>
                    </div>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataLegend()[0], myDataLegend()[1],myDataLegend()[2],]}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataLegend()[3]]}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-left" >
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataLegend()[4]]}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataLegend()[5], myDataLegend()[6], myDataLegend()[7], myDataLegend()[8], myDataLegend()[9]]}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataLegend()[10]]}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-left">
                        <DiscreteColorLegend
                            orientation="horizontal"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={[myDataLegend()[11], myDataLegend()[12], myDataLegend()[13]]}
                        />
                    </div>
                </div>
            </div >
        );
    }
}

export default FUN_CHART_STATE;