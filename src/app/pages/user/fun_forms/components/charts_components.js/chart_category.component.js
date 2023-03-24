import React, { Component } from 'react';

import {
    Hint,
    RadialChart,
    DiscreteColorLegend
} from 'react-vis';
import 'react-vis/dist/style.css';

class FUN_CHART_CATEGORY extends Component {
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
                if(items[i].tipo){
                    if ((items[i].tipo).includes('D') || (items[i].tipo).includes('F')) {
                        if (items[i].type == 'i') val_1++;
                        if (items[i].type == 'ii') val_2++;
                        if (items[i].type == 'iii') val_3++;
                        if (items[i].type == 'iv') val_4++;
                        //if (items[i].type == 'oa') val_5++;
                        if (items[i].type == 0 || items[i].type == null ) val_6++;
                    }
                }
            }

            let total = val_1 + val_2 + val_3 + val_4 + val_5 + val_6;
            let val_1_p = val_1 / total * 100;
            let val_2_p = val_2 / total * 100;
            let val_3_p = val_3 / total * 100;
            let val_4_p = val_4 / total * 100;
            //let val_5_p = val_5 / total * 100;
            let val_6_p = val_6 / total * 100;

            return [
                { angle: val_1, group: 'c1', val: val_1, val_p: val_1_p, color: 'CornflowerBlue', title: `I: ${val_1} (${val_1_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'CATEGORIA I: ' + val_1 },
                { angle: val_2, group: 'c2', val: val_2, val_p: val_2_p, color: 'Coral', title: `II: ${val_2} (${val_2_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'CATEGORIA II: ' + val_2 },
                { angle: val_3, group: 'c3', val: val_3, val_p: val_3_p, color: 'LightGreen', title: `III: ${val_3} (${val_3_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'CATEGORIA III: ' + val_3 },
                { angle: val_4, group: 'c4', val: val_4, val_p: val_4_p, color: 'DarkKhaki', title: `IV: ${val_4} (${val_4_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'CATEGORIA VI: ' + val_4 },
                { angle: val_6, group: 'nc*', val: val_6, val_p: val_6_p, color: 'Gainsboro', title: `SIN CATEGORIA: ${val_6} (${val_6_p.toFixed(2)}%)`, strokeWidth: 10, hintText: 'SIN CATEGORIA: ' + val_6 },
            ]
        }

        let totalList = () => {
            let list = myData();
            return list[0].val + list[1].val +list[2].val +list[3].val +list[4].val
        }


        return (
            <div className="border p-2">
                <div className="row text-center my-2">
                    <label className="fw-bold">CATEGORIAS ({totalList()}) SOLO LIC. CON Y/O LIC. REC</label>
                </div>
                <div className="row">
                <div className="col d-flex justify-content-center">
                        <DiscreteColorLegend
                            orientation="vertical"
                            onItemClick={(e) =>  this.props._UPDATE_FILTERS(e.group)}
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
                            onValueClick={(e) =>  this.props._UPDATE_FILTERS(e.group)}
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

export default FUN_CHART_CATEGORY;