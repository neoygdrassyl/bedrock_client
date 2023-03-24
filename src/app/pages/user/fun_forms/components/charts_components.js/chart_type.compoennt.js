import React, { Component } from 'react';

import {
    Hint,
    RadialChart,
    DiscreteColorLegend
} from 'react-vis';
import 'react-vis/dist/style.css';

class FUN_CHART_TYPE extends Component {
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
            var val_7 = 0;
            var val_8 = 0;
            var val_9 = 0;
            var val_10 = 0;

            for (var i = 0; i < items.length; i++) {
                if (items[i].tipo == 'A') val_1++;
                else if (items[i].tipo == 'B') val_2++;
                else if (items[i].tipo == 'C') val_3++;
                else if (items[i].tipo == 'D') val_4++;
                else if (items[i].tipo == 'D,F') val_5++;
                else if (items[i].tipo == 'D,G') val_6++;
                else if (items[i].tipo == 'F') val_7++;
                else if (items[i].tipo == 'G') val_8++;
                else if (items[i].tramite == 'B' || items[i].tramite == 'C' || items[i].tramite == 'D' ) val_9++;
                else val_10++;
            }

            let total = val_1 + val_2 + val_3 + val_4 + val_5 + val_6 + val_7 + val_8 + val_9+ val_10;
            let val_1_p = val_1 / total * 100;
            let val_2_p = val_2 / total * 100;
            let val_3_p = val_3 / total * 100;
            let val_4_p = val_4 / total * 100;
            let val_5_p = val_5 / total * 100;
            let val_6_p = val_6 / total * 100;
            let val_7_p = val_7 / total * 100;
            let val_8_p = val_8 / total * 100;
            let val_9_p = val_9 / total * 100;
            let val_10_p = val_10 / total * 100;

            return [
                { angle: val_1, group: 'lic:urb', val: val_1, val_p: val_1_p, color: '#FF9A42', title: `URBANIZACIÓN: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10 },
                { angle: val_2, group: 'lic:par', val: val_2, val_p: val_2_p, color: '#E8514D', title: `PARCELACIÓN: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10 },
                { angle: val_3, group: 'lic:sub', val: val_3, val_p: val_3_p, color: '#DA62FF', title: `SUBDIVISIÓN: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10 },
                { angle: val_4, group: 'lic:con', val: val_4, val_p: val_4_p, color: '#4D56E8', title: `CONSTRUCCIÓN: ${val_4} (${val_4_p.toFixed(2)}%)`, strokeWidth: 10 },
                { angle: val_5, group: 'lic:con,rec', val: val_5, val_p: val_5_p, color: '#54E6FF', title: `CONST + REC: ${val_5} (${val_5_p.toFixed(2)}%)`, strokeWidth: 10 },
                { angle: val_6, group: 'lic:con,oa', val: val_6, val_p: val_6_p, color: '#3DFF74', title: `CONST + OA: ${val_6} (${val_6_p.toFixed(2)}%)`, strokeWidth: 10 },
                { angle: val_7, group: 'lic:rec', val: val_7, val_p: val_7_p, color: '#5BD95B', title: `RECONOCIMIENTO: ${val_7} (${val_7_p.toFixed(2)}%)`, strokeWidth: 10 },
                { angle: val_8, group: 'lic:oa', val: val_8, val_p: val_8_p, color: '#B1E82C', title: `OTRAS ACTUACIONES: ${val_8} (${val_8_p.toFixed(2)}%)`, strokeWidth: 10 },
                { angle: val_9, group: 'lic:pro,rev,mlv', val: val_9, val_p: val_9_p, color: '#FFD130', title: `PRORRO. | REVALI. | MOD LIC.: ${val_9} (${val_9_p.toFixed(2)}%)`, strokeWidth: 10 },
                { angle: val_10, group: 'lic:no', val: val_10, val_p: val_10_p, color: 'Gainsboro', title: `OTROS: ${val_10} (${val_10_p.toFixed(2)}%)`, strokeWidth: 10 },
            ]
        }

        let totalList = () => {
            let list = myData();
            return list[0].val + list[1].val + list[2].val + list[3].val + list[4].val + list[5].val + list[6].val + list[7].val + list[8].val  + list[9].val;
        }


        return (
            <div className="border p-2">
                <div className="row text-center my-2">
                    <label className="fw-bold">TIPO DE LICENCIA ({totalList()})</label>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center">
                        <DiscreteColorLegend
                            orientation="vertical"
                            onItemClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            items={myData()}
                        />

                    </div>
                    <div className="col d-flex justify-content-center">
                        <RadialChart
                            data={myData()}
                            width={300}
                            height={300}
                            innerRadius={100}
                            radius={150}
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

                        </RadialChart>
                    </div>
                </div>

            </div >
        );
    }
}

export default FUN_CHART_TYPE;