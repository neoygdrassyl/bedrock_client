import React, { Component } from 'react';

import {
    Hint,
    RadialChart,
    DiscreteColorLegend,
    Sankey
} from 'react-vis';
import 'react-vis/dist/style.css';

class FUN_CHART_TYPE2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeLink: null,
            activeLink2: null,
        };
    }
    componentDidMount() {
    }
    render() {
        const { translation, swaMsg, globals, items, itemsNegative, itemsOA, itemsNegativeFull } = this.props;
        const { activeLink, activeLink2 } = this.state;

        const BLURRED_LINK_OPACITY = 0.3;
        const FOCUSED_LINK_OPACITY = 0.8;

        // COMPONENT JSX
        let _GET_HOOVER_BOX_CONTENT = _HOOVER => {
            return <>
                <label className="fw-bold">{_HOOVER.title}</label>
            </>
        }

        let nodesData = () => {
            let nodeValues = new Array(31).fill(0);
            let nodeValues_p = new Array(31).fill(0);

            nodeValues[0] = items.length + itemsOA.length;
            nodeValues[1] = items.length;
            nodeValues[2] = itemsOA.length;

            nodeValues[3] = itemsNegative.length; // NEGATIVE ON PROCESS
            nodeValues[17] = itemsNegativeFull.length; // TOTAL
            nodeValues[18] = itemsNegativeFull.length - itemsNegative.length; // NEGATIVE FINISHED

            // *************** NEGATIVE ************** // 
            let neg_1 = [];
            let neg_2 = [];
            let neg_3 = [];
            let neg_4 = [];
            let neg_5 = [];

            for (var i = 0; i < itemsNegative.length; i++) {
                const element = itemsNegative[i];
                let con = element.state;
                if (con == '-101') neg_1.push(element);
                if (con == '-103') neg_3.push(element);
                if (con == '-104') neg_4.push(element);
                if (con == '-105') neg_5.push(element);
            }

            nodeValues[12] = neg_1.length;
            nodeValues[13] = neg_3.length;
            nodeValues[14] = neg_4.length;
            nodeValues[15] = neg_5.length;

            let neg_6_cont = [];
            let neg_6_closed = [];

            for (var i = 0; i < itemsNegativeFull.length; i++) {
                const element = itemsNegativeFull[i];
                //let con = element.state;
                if (element.clock_30) {
                    if (element.state > 200) neg_6_closed.push(element);
                    else neg_6_cont.push(element);
                }
            }
            nodeValues[19] = neg_6_cont.length;
            nodeValues[20] = neg_6_closed.length;

            let neg_1_cont = [];
            let neg_2_cont = [];
            let neg_3_cont = [];
            let neg_4_cont = [];
            let neg_5_cont = [];

            for (var i = 0; i < neg_6_cont.length; i++) {
                const element = neg_6_cont[i];
                let con = element.clock_cause;
                if (con == '-1') neg_1_cont.push(element);
                if (con == '-2') neg_2_cont.push(element);
                if (con == '-3') neg_3_cont.push(element);
                if (con == '-4') neg_4_cont.push(element);
                if (con == '-5') neg_5_cont.push(element);
            }

            nodeValues[21] = neg_1_cont.length;
            nodeValues[22] = neg_2_cont.length;
            nodeValues[23] = neg_3_cont.length;
            nodeValues[24] = neg_4_cont.length;
            nodeValues[25] = neg_5_cont.length;


            let neg_1_close = [];
            let neg_2_close = [];
            let neg_3_close = [];
            let neg_4_close = [];
            let neg_5_close = [];

            for (var i = 0; i < neg_6_closed.length; i++) {
                const element = neg_6_closed[i];
                let con = element.clock_cause;
                if (con == '-1') neg_1_close.push(element);
                if (con == '-2') neg_2_close.push(element);
                if (con == '-3') neg_3_close.push(element);
                if (con == '-4') neg_4_close.push(element);
                if (con == '-5') neg_5_close.push(element);
            }

            nodeValues[26] = neg_1_close.length;
            nodeValues[27] = neg_2_close.length;
            nodeValues[28] = neg_3_close.length;
            nodeValues[29] = neg_4_close.length;
            nodeValues[30] = neg_5_close.length;

            // *************** LDF && INC ************** // 
            let list_inc = [];
            let list_ldf = [];

            for (var i = 0; i < items.length; i++) {
                if (items[i].state >= 5) list_ldf.push(items[i])
                else list_inc.push(items[i])
            }

            nodeValues[4] = list_ldf.length;
            nodeValues[5] = list_inc.length;

            // *************** REV && NOREV ************** // 
            let acta = [];
            let acta_0 = [];

            let acta_si = [];
            let acta_no = [];

            for (var i = 0; i < list_ldf.length; i++) {
                const element = list_ldf[i];
                let con = element.rec_review == null && (element.rec_review_2 == null)
                if (con) acta_0.push(element)
                else acta.push(element)

                let con1 = element.rec_review == 1 && (element.rec_review_2 != 0)
                let con2 = element.rec_review == 0 && element.rec_review_2 == 1;
                let con3 = element.rec_review == null && (element.rec_review_2 == 1);
                let con4 = element.rec_review == 0 && element.rec_review_2 != 1  
                let con5 = (element.rec_review == 1 && element.rec_review_2 == 0)

                if (con1 || con2 || con3) acta_si.push(element)
                if (con4 || con5 )acta_no.push(element)
            }

            nodeValues[6] = acta.length;
            nodeValues[7] = acta_0.length;

            nodeValues[8] = acta_si.length;
            nodeValues[9] = acta_no.length;


            // *************** EXPEDITION ************** // 

            let exp_via = [];
            let exp_via0 = [];
            let exp_res = [];

            for (var i = 0; i < acta_si.length; i++) {
                const element = acta_si[i];
                let con = element.clock_pay2;
                let con2 = element.clock_resolution;
                if (con) exp_via.push(element)
                else exp_via0.push(element)
                if (con2) exp_res.push(element)

            }

            nodeValues[10] = exp_via.length;
            nodeValues[11] = exp_via0.length;
            nodeValues[16] = exp_res.length;

            return { nodeValues: nodeValues, nodeValues_p: nodeValues_p }
        }


        let myData = () => {
            let data = nodesData();
            let nodeValues = data.nodeValues
            let nodeValues_p = data.nodeValues_p


            return [
                { name: `CURADURIA ${nodeValues[0]}`, key: '0', val: nodeValues[0], group: 'relax', color: '#6269f5', title: `CURADURIA: ${nodeValues[0]} (${(nodeValues_p[0]).toFixed(2)}%)` },

                { name: `LIC. ${nodeValues[1]}`, key: '1', val: nodeValues[1], group: 'rad', color: '#6269f5', title: `LIC: ${nodeValues[1]} (${(nodeValues_p[1]).toFixed(2)}%)` },
                { name: `OA. ${nodeValues[2]}`, key: '2', val: nodeValues[2], group: 'lic:oa', color: '#6269f5', title: `OA: ${nodeValues[2]} (${(nodeValues_p[2]).toFixed(2)}%)` },

                { name: `LDF. ${nodeValues[4]}`, key: '5', val: nodeValues[4], group: 'ldf', color: '#6269f5', title: `LDF: ${nodeValues[4]} (${(nodeValues_p[4]).toFixed(2)}%)` },
                { name: `INC. ${nodeValues[5]}`, key: '4', val: nodeValues[5], group: 'rad', color: '#6269f5', title: `INC: ${nodeValues[5]} (${(nodeValues_p[5]).toFixed(2)}%)` },

                { name: `SIN ACTA. ${nodeValues[7]}`, key: '6', val: nodeValues[7], group: 'acta:1*', color: '#6269f5', title: `SIN ACTA: ${nodeValues[7]} (${(nodeValues_p[7]).toFixed(2)}%)` },
                { name: `ACTA ${nodeValues[6]}`, key: '7', val: nodeValues[6], group: 'acta:0*', color: '#6269f5', title: `ACTA: ${nodeValues[6]} (${(nodeValues_p[6]).toFixed(2)}%)` },

                { name: `A. VIABLE ${nodeValues[8]}`, key: '8', val: nodeValues[8], group: 'acta:si*', color: '#6269f5', title: `VIABLE: ${nodeValues[8]} (${(nodeValues_p[8]).toFixed(2)}%)` },
                { name: `A. NO VIABLE ${nodeValues[9]}`, key: '9', val: nodeValues[9], group: 'acta:no*', color: '#6269f5', title: `NO VIABLE: ${nodeValues[9]} (${(nodeValues_p[9]).toFixed(2)}%)` },

                { name: `ACTO VIA. ${nodeValues[10]}`, key: '10', val: nodeValues[10], group: 'exp:via', color: '#6269f5', title: `VIABILIDAD: ${nodeValues[10]} (${(nodeValues_p[10]).toFixed(2)}%)` },
                { name: `SIN ACTO VIA. ${nodeValues[11]}`, key: '11', val: nodeValues[11], group: '!exp:via', color: '#6269f5', title: `SIN VIABILIDAD: ${nodeValues[11]} (${(nodeValues_p[11]).toFixed(2)}%)` },

                { name: `RESOLUCIÓN. ${nodeValues[16]}`, key: '16', val: nodeValues[16], group: 'exp:via', color: '#6269f5', title: `RESOLUCIÓN: ${nodeValues[16]} (${(nodeValues_p[10]).toFixed(2)}%)` },

            ]
        }

        let myLinks = () => {
            var links = [];
            let data = nodesData();
            let nodeValues = data.nodeValues

            var newObject = { source: 0, target: 1, value: nodeValues[1], color: '#b3f562', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 1, target: 4, value: nodeValues[5], color: '#597a31', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 1, target: 3, value: nodeValues[4], color: '#b3f562', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 3, target: 6, value: nodeValues[6], color: '#b3f562', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 3, target: 5, value: nodeValues[7], color: '#597a31', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 6, target: 7, value: nodeValues[8], color: '#b3f562', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 6, target: 8, value: nodeValues[9], color: '#597a31', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 7, target: 9, value: nodeValues[10], color: '#b3f562', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 7, target: 10, value: nodeValues[11], color: '#597a31', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 0, target: 2, value: nodeValues[2], color: '#F5EE62', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 9, target: 11, value: nodeValues[16], color: '#b3f562', opacity: 0.5, };
            links.push(newObject)

            return links;
        }

        let DataNegative = () => {
            let data = nodesData();
            let nodeValues = data.nodeValues
            let nodeValues_p = data.nodeValues_p


            return [
                { name: `TOTAL. ${nodeValues[17]}`, key: '3', val: nodeValues[17], group: 'relax', color: '#6269f5', title: `DES: ${nodeValues[17]} (${(nodeValues_p[17]).toFixed(2)}%)` },

                { name: nodeValues[12] > 0 ? `INCOMPLETO. ${nodeValues[12]}` : '', key: '12', val: nodeValues[12], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[12]} (${(nodeValues_p[12]).toFixed(2)}%)` },
                { name: nodeValues[13] > 0 ? `NO CUMPLE ACTA CORR. ${nodeValues[13]}` : '', key: '12', val: nodeValues[13], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[13]} (${(nodeValues_p[13]).toFixed(2)}%)` },
                { name: nodeValues[14] > 0 ? `NO PAGO EXPENSAS. ${nodeValues[14]}` : '', key: '12', val: nodeValues[14], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[14]} (${(nodeValues_p[14]).toFixed(2)}%)` },
                { name: nodeValues[15] > 0 ? `VOLUNTARIO. ${nodeValues[15]}` : '', key: '12', val: nodeValues[15], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[15]} (${(nodeValues_p[15]).toFixed(2)}%)` },

                { name: nodeValues[3] > 0 ? `EN CURSO. ${nodeValues[3]}` : '', key: '3', val: nodeValues[3], group: 'relax', color: '#6269f5', title: `DES: ${nodeValues[3]} (${(nodeValues_p[3]).toFixed(2)}%)` },
                { name: nodeValues[18] > 0 ? `FINALIZADA. ${nodeValues[18]}` : '', key: '3', val: nodeValues[18], group: 'relax', color: '#6269f5', title: `DES: ${nodeValues[18]} (${(nodeValues_p[18]).toFixed(2)}%)` },

                { name: nodeValues[19] > 0 ? `SUBSANADOS. ${nodeValues[19]}` : '', key: '3', val: nodeValues[19], group: 'relax', color: '#6269f5', title: `DES: ${nodeValues[19]} (${(nodeValues_p[19]).toFixed(2)}%)` },
                { name: nodeValues[20] > 0 ? `ARCHIVADOS. ${nodeValues[20]}` : '', key: '3', val: nodeValues[20], group: 'relax', color: '#6269f5', title: `DES: ${nodeValues[20]} (${(nodeValues_p[20]).toFixed(2)}%)` },

                { name: nodeValues[21] > 0 ? `INCOMPLETO. ${nodeValues[21]}` : '', key: '12', val: nodeValues[21], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[21]} (${(nodeValues_p[21]).toFixed(2)}%)` },
                { name: nodeValues[23] > 0 ? `NO CUMPLE ACTA CORR. ${nodeValues[23]}` : '', key: '12', val: nodeValues[23], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[23]} (${(nodeValues_p[23]).toFixed(2)}%)` },
                { name: nodeValues[24] > 0 ? `NO PAGO EXPENSAS. ${nodeValues[24]}` : '', key: '12', val: nodeValues[24], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[24]} (${(nodeValues_p[24]).toFixed(2)}%)` },
                { name: nodeValues[25] > 0 ? `VOLUNTARIO. ${nodeValues[25]}` : '', key: '12', val: nodeValues[25], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[25]} (${(nodeValues_p[25]).toFixed(2)}%)` },

                { name: nodeValues[26] > 0 ? `INCOMPLETO. ${nodeValues[26]}` : '', key: '12', val: nodeValues[26], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[26]} (${(nodeValues_p[26]).toFixed(2)}%)` },
                { name: nodeValues[28] > 0 ? `NO CUMPLE ACTA CORR. ${nodeValues[28]}` : '', key: '12', val: nodeValues[28], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[28]} (${(nodeValues_p[28]).toFixed(2)}%)` },
                { name: nodeValues[29] > 0 ? `NO PAGO EXPENSAS. ${nodeValues[29]}` : '', key: '12', val: nodeValues[29], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[29]} (${(nodeValues_p[29]).toFixed(2)}%)` },
                { name: nodeValues[30] > 0 ? `VOLUNTARIO. ${nodeValues[30]}` : '', key: '12', val: nodeValues[30], group: 'lic:A', color: '#6269f5', title: `URBANIZACIÓN: ${nodeValues[30]} (${(nodeValues_p[30]).toFixed(2)}%)` },

            ]
        }

        let myLinksNegative = () => {
            var links = [];
            let data = nodesData();
            let nodeValues = data.nodeValues

            var newObject = { source: 5, target: 1, value: nodeValues[12], color: '#f34a53', opacity: 0.5, };
            if (nodeValues[12] > 0) links.push(newObject)

            newObject = { source: 5, target: 2, value: nodeValues[13], color: '#f34a53', opacity: 0.5, };
            if (nodeValues[13] > 0) links.push(newObject)

            newObject = { source: 5, target: 3, value: nodeValues[14], color: '#f34a53', opacity: 0.5, };
            if (nodeValues[14] > 0) links.push(newObject)

            newObject = { source: 5, target: 4, value: nodeValues[15], color: '#f34a53', opacity: 0.5, };
            if (nodeValues[15] > 0) links.push(newObject)

            newObject = { source: 0, target: 5, value: nodeValues[3], color: '#f34a53', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 0, target: 6, value: nodeValues[18], color: '#f34a53', opacity: 0.5, };
            links.push(newObject)

            newObject = { source: 6, target: 7, value: nodeValues[19], color: '#f34a53', opacity: 0.5, };
            if (nodeValues[19] > 0) links.push(newObject)

            newObject = { source: 6, target: 8, value: nodeValues[20], color: '#792529', opacity: 0.5, };
            if (nodeValues[20] > 0) links.push(newObject)

            newObject = { source: 7, target: 9, value: nodeValues[21], color: '#f34a53', opacity: 0.5, };
            if (nodeValues[21] > 0) links.push(newObject)

            newObject = { source: 7, target: 10, value: nodeValues[23], color: '#f34a53', opacity: 0.5, };
            if (nodeValues[23] > 0) links.push(newObject)

            newObject = { source: 7, target: 11, value: nodeValues[24], color: '#f34a53', opacity: 0.5, };
            if (nodeValues[24] > 0) links.push(newObject)

            newObject = { source: 7, target: 12, value: nodeValues[25], color: '#f34a53', opacity: 0.5, };
            if (nodeValues[25] > 0) links.push(newObject)

            newObject = { source:8, target: 13, value: nodeValues[26], color: '#792529', opacity: 0.5, };
            if (nodeValues[26] > 0) links.push(newObject)

            newObject = { source:8, target: 14, value: nodeValues[28], color: '#792529', opacity: 0.5, };
            if (nodeValues[28] > 0) links.push(newObject)

            newObject = { source:8, target: 15, value: nodeValues[29], color: '#792529', opacity: 0.5, };
            if (nodeValues[29] > 0) links.push(newObject)

            newObject = { source:8, target: 16, value: nodeValues[30], color: '#792529', opacity: 0.5, };
            if (nodeValues[30] > 0) links.push(newObject)

            return links;
        }

        return (
            <div className="border p-2">
                <div className="row text-center my-2">
                    <label className="fw-bold">DISTRIBUICIÓN DE LICENCIAS</label>
                </div>
                <div className="row">
                    <div className='row text-center'>
                        <div className='col'>
                            {activeLink
                                ? `${activeLink.value} SELECCIONADO`
                                : ''}
                            {activeLink2
                                ? `${activeLink2.value} SELECCIONADO`
                                : ''}
                            {activeLink2 == null && activeLink == null
                                ? `SIN SELECCIÓN`
                                : ''}
                        </div>

                    </div>
                    <div className="col-7 d-flex justify-content-left chart-clock border">
                        <Sankey
                            nodes={myData().map(d => ({ ...d }))}
                            links={myLinks().map((d, i) => ({
                                ...d,
                                opacity:
                                    activeLink && i === activeLink.index
                                        ? FOCUSED_LINK_OPACITY
                                        : BLURRED_LINK_OPACITY
                            }))}
                            width={1200}
                            height={400}
                            nodePadding={20}
                            nodeWidth={10}
                            layout={50}
                            align="left"
                            colorType="literal"
                            onValueMouseOver={(e) => this.setState({ hovered: e })}
                            onValueMouseOut={() => this.setState({ hovered: false })}
                            //onValueClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            onLinkMouseOver={node => { this.setState({ activeLink: node }) }}
                            onLinkMouseOut={() => this.setState({ activeLink: null })}
                        >
                            {this.state.hovered ?
                                <Hint value={this.state.hovered}>
                                    <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', marginTop: '0%', width: '200px', fontSize: 'small' }}>
                                        {_GET_HOOVER_BOX_CONTENT(this.state.hovered)}
                                    </div>
                                </Hint>
                                : null}

                        </Sankey>
                    </div>
                    <div className="col-5 d-flex justify-content-left chart-clock border">
                        <Sankey
                            nodes={DataNegative().map(d => ({ ...d }))}
                            links={myLinksNegative().map((d, i) => ({
                                ...d,
                                opacity:
                                    activeLink2 && i === activeLink2.index
                                        ? FOCUSED_LINK_OPACITY
                                        : BLURRED_LINK_OPACITY
                            }))}
                            width={1000}
                            height={400}
                            nodePadding={20}
                            nodeWidth={10}
                            layout={50}
                            align="left"
                            colorType="literal"
                            onValueMouseOver={(e) => this.setState({ hovered2: e })}
                            onValueMouseOut={() => this.setState({ hovered2: false })}
                            //onValueClick={(e) => this.props._UPDATE_FILTERS(e.group)}
                            onLinkMouseOver={node => { this.setState({ activeLink2: node }) }}
                            onLinkMouseOut={() => this.setState({ activeLink2: null })}
                        >
                            {this.state.hovered2 ?
                                <Hint value={this.state.hovered2}>
                                    <div className="text-white p-2 m-2" style={{ background: 'rgba(0,0,0,0.75)', marginTop: '0%', width: '200px', fontSize: 'small' }}>
                                        {_GET_HOOVER_BOX_CONTENT(this.state.hovered2)}
                                    </div>
                                </Hint>
                                : null}

                        </Sankey>
                    </div>
                </div>

            </div >
        );
    }
}

export default FUN_CHART_TYPE2;