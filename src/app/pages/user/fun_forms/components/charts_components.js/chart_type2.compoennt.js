import { useState } from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';

function FUN_CHART_TYPE2(props) {
    const { translation, swaMsg, globals, items, itemsNegative, itemsOA, itemsNegativeFull } = props;
    const [activeLink, setActiveLink] = useState(null);
    const [activeLink2, setActiveLink2] = useState(null);

    const safeItems = Array.isArray(items) ? items : [];
    const safeItemsNegative = Array.isArray(itemsNegative) ? itemsNegative : [];
    const safeItemsOA = Array.isArray(itemsOA) ? itemsOA : [];
    const safeItemsNegativeFull = Array.isArray(itemsNegativeFull) ? itemsNegativeFull : [];

    let nodesData = () => {
        let nodeValues = new Array(31).fill(0);
        let nodeValues_p = new Array(31).fill(0);

        nodeValues[0] = safeItems.length + safeItemsOA.length;
        nodeValues[1] = safeItems.length;
        nodeValues[2] = safeItemsOA.length;

        nodeValues[3] = safeItemsNegative.length; // NEGATIVE ON PROCESS
        nodeValues[17] = safeItemsNegativeFull.length; // TOTAL
        nodeValues[18] = safeItemsNegativeFull.length - safeItemsNegative.length; // NEGATIVE FINISHED

        // *************** NEGATIVE ************** //
        let neg_1 = [];
        let neg_2 = [];
        let neg_3 = [];
        let neg_4 = [];
        let neg_5 = [];

        for (var i = 0; i < safeItemsNegative.length; i++) {
            const element = safeItemsNegative[i];
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

        for (var i = 0; i < safeItemsNegativeFull.length; i++) {
            const element = safeItemsNegativeFull[i];
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

        for (var i = 0; i < safeItems.length; i++) {
            if (safeItems[i].state >= 5) list_ldf.push(safeItems[i])
            else list_inc.push(safeItems[i])
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
            if (con4 || con5) acta_no.push(element)
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
            { name: `CURADURIA ${nodeValues[0]}` },
            { name: `LIC. ${nodeValues[1]}` },
            { name: `OA. ${nodeValues[2]}` },
            { name: `LDF. ${nodeValues[4]}` },
            { name: `INC. ${nodeValues[5]}` },
            { name: `SIN ACTA. ${nodeValues[7]}` },
            { name: `ACTA ${nodeValues[6]}` },
            { name: `A. VIABLE ${nodeValues[8]}` },
            { name: `A. NO VIABLE ${nodeValues[9]}` },
            { name: `ACTO VIA. ${nodeValues[10]}` },
            { name: `SIN ACTO VIA. ${nodeValues[11]}` },
            { name: `RESOLUCION. ${nodeValues[16]}` },
        ]
    }

    let myLinks = () => {
        var links = [];
        let data = nodesData();
        let nodeValues = data.nodeValues

        links.push({ source: 0, target: 1, value: nodeValues[1] || 0.001 })
        links.push({ source: 1, target: 4, value: nodeValues[5] || 0.001 })
        links.push({ source: 1, target: 3, value: nodeValues[4] || 0.001 })
        links.push({ source: 3, target: 6, value: nodeValues[6] || 0.001 })
        links.push({ source: 3, target: 5, value: nodeValues[7] || 0.001 })
        links.push({ source: 6, target: 7, value: nodeValues[8] || 0.001 })
        links.push({ source: 6, target: 8, value: nodeValues[9] || 0.001 })
        links.push({ source: 7, target: 9, value: nodeValues[10] || 0.001 })
        links.push({ source: 7, target: 10, value: nodeValues[11] || 0.001 })
        links.push({ source: 0, target: 2, value: nodeValues[2] || 0.001 })
        links.push({ source: 9, target: 11, value: nodeValues[16] || 0.001 })

        return links;
    }

    let DataNegative = () => {
        let data = nodesData();
        let nodeValues = data.nodeValues

        return [
            { name: `TOTAL. ${nodeValues[17]}` },
            { name: nodeValues[12] > 0 ? `INCOMPLETO. ${nodeValues[12]}` : '' },
            { name: nodeValues[13] > 0 ? `NO CUMPLE ACTA CORR. ${nodeValues[13]}` : '' },
            { name: nodeValues[14] > 0 ? `NO PAGO EXPENSAS. ${nodeValues[14]}` : '' },
            { name: nodeValues[15] > 0 ? `VOLUNTARIO. ${nodeValues[15]}` : '' },
            { name: nodeValues[3] > 0 ? `EN CURSO. ${nodeValues[3]}` : '' },
            { name: nodeValues[18] > 0 ? `FINALIZADA. ${nodeValues[18]}` : '' },
            { name: nodeValues[19] > 0 ? `SUBSANADOS. ${nodeValues[19]}` : '' },
            { name: nodeValues[20] > 0 ? `ARCHIVADOS. ${nodeValues[20]}` : '' },
            { name: nodeValues[21] > 0 ? `INCOMPLETO. ${nodeValues[21]}` : '' },
            { name: nodeValues[23] > 0 ? `NO CUMPLE ACTA CORR. ${nodeValues[23]}` : '' },
            { name: nodeValues[24] > 0 ? `NO PAGO EXPENSAS. ${nodeValues[24]}` : '' },
            { name: nodeValues[25] > 0 ? `VOLUNTARIO. ${nodeValues[25]}` : '' },
            { name: nodeValues[26] > 0 ? `INCOMPLETO. ${nodeValues[26]}` : '' },
            { name: nodeValues[28] > 0 ? `NO CUMPLE ACTA CORR. ${nodeValues[28]}` : '' },
            { name: nodeValues[29] > 0 ? `NO PAGO EXPENSAS. ${nodeValues[29]}` : '' },
            { name: nodeValues[30] > 0 ? `VOLUNTARIO. ${nodeValues[30]}` : '' },
        ]
    }

    let myLinksNegative = () => {
        var links = [];
        let data = nodesData();
        let nodeValues = data.nodeValues

        if (nodeValues[12] > 0) links.push({ source: 5, target: 1, value: nodeValues[12] })
        if (nodeValues[13] > 0) links.push({ source: 5, target: 2, value: nodeValues[13] })
        if (nodeValues[14] > 0) links.push({ source: 5, target: 3, value: nodeValues[14] })
        if (nodeValues[15] > 0) links.push({ source: 5, target: 4, value: nodeValues[15] })

        links.push({ source: 0, target: 5, value: nodeValues[3] || 0.001 })
        links.push({ source: 0, target: 6, value: nodeValues[18] || 0.001 })

        if (nodeValues[19] > 0) links.push({ source: 6, target: 7, value: nodeValues[19] })
        if (nodeValues[20] > 0) links.push({ source: 6, target: 8, value: nodeValues[20] })
        if (nodeValues[21] > 0) links.push({ source: 7, target: 9, value: nodeValues[21] })
        if (nodeValues[23] > 0) links.push({ source: 7, target: 10, value: nodeValues[23] })
        if (nodeValues[24] > 0) links.push({ source: 7, target: 11, value: nodeValues[24] })
        if (nodeValues[25] > 0) links.push({ source: 7, target: 12, value: nodeValues[25] })
        if (nodeValues[26] > 0) links.push({ source: 8, target: 13, value: nodeValues[26] })
        if (nodeValues[28] > 0) links.push({ source: 8, target: 14, value: nodeValues[28] })
        if (nodeValues[29] > 0) links.push({ source: 8, target: 15, value: nodeValues[29] })
        if (nodeValues[30] > 0) links.push({ source: 8, target: 16, value: nodeValues[30] })

        return links;
    }

    const sankeyData1 = {
        nodes: myData(),
        links: myLinks(),
    };

    const sankeyData2 = {
        nodes: DataNegative(),
        links: myLinksNegative(),
    };

    return (
        <div className="border p-2">
            <div className="row text-center my-2">
                <label className="fw-bold">DISTRIBUICION DE LICENCIAS</label>
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
                            ? `SIN SELECCION`
                            : ''}
                    </div>
                </div>
                <div className="col-7 d-flex justify-content-left chart-clock border">
                    <ResponsiveContainer width="100%" height={400}>
                        <Sankey
                            data={sankeyData1}
                            width={1200}
                            height={400}
                            nodePadding={20}
                            nodeWidth={10}
                            link={{ stroke: '#6269f5' }}
                        >
                            <Tooltip />
                        </Sankey>
                    </ResponsiveContainer>
                </div>
                <div className="col-5 d-flex justify-content-left chart-clock border">
                    <ResponsiveContainer width="100%" height={400}>
                        <Sankey
                            data={sankeyData2}
                            width={1000}
                            height={400}
                            nodePadding={20}
                            nodeWidth={10}
                            link={{ stroke: '#f34a53' }}
                        >
                            <Tooltip />
                        </Sankey>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default FUN_CHART_TYPE2;
