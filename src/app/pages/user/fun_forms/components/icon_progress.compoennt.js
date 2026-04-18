import React from 'react';

import { regexChecker_isOA_2, regexChecker_isPh } from '../../../../components/customClasses/typeParse';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;
function FUN_ICON_PROGRESS({ translation, globals, currentItem, small }) {

        // DATA CONVERTERS
        let _GET_LAW_REPORT_DATA_ICON = (_ITEM) => {
            if (!_ITEM.tipo) return 2;
            if (_ITEM.tipo.includes('F')) return 1
            return 2;
        }
        // COMPONENT JSX
        let _PROGRESS_COMPONENT = (row) => {
            const isOA = regexChecker_isOA_2(row)
            var _COMPONENT = [];
            var size = small ? 'fa-1x me-1' : 'fa-2x me-1';
            const fontSize = '150%';
            let rules = row.rules ? row.rules.split(';') : [];

            if (row.id_payment && row.clock_payment) _COMPONENT.push(<span title="EXPENSAS FIJA PAGADAS"><i className={`fas fa-dollar-sign ${size} `} style={{ color: 'Green', fontSize: fontSize }}></i></span>)
            else if (!row.id_payment && !row.clock_payment) _COMPONENT.push(<span title="FALTA DECLARAR PAGO DE EXPENSAS FIJAS"><i className={`fas fa-dollar-sign ${size} `} style={{ color: 'Crimson', fontSize: fontSize }}></i></span>)
            else if (row.id_payment || row.clock_payment) _COMPONENT.push(<span title="EXPENSAS FIJA PAGADAS - FALTAN DETALLES"><i className={`fas fa-dollar-sign ${size} `} style={{ color: 'Gold', fontSize: fontSize }}></i></span>)

            if (row.state <= -100) _COMPONENT.push(<span title="EN DESISTIMIENTO"><i className={`far fa-window-close ${size} `} style={{ color: 'Crimson', fontSize: fontSize }}></i></span>)
            if (row.state == -1) _COMPONENT.push(<span title="INCOMPLETO"><i className={`far fa-check-square ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></span>)
            if (row.state == 1) _COMPONENT.push(<span title="EN REVISION"><i className={`far fa-check-square ${size} `} style={{ fontSize: fontSize }}></i></span>)
            if (row.state >= 5 && row.clock_date) _COMPONENT.push(<span title="EN LYDF"><i className={`far fa-check-square ${size} `} style={{ color: 'Green', fontSize: fontSize }} ></i></span>)
            if (row.state >= 5 && !row.clock_date) _COMPONENT.push(<span title="FALTA DECLARAR LYDF"><i className={`far fa-check-square ${size} `} style={{ color: 'Gold', fontSize: fontSize }} ></i></span>)

            if (!regexChecker_isPh(row, true) && !isOA && rules[0] != 1) {
                if (row.neighbours == 0) _COMPONENT.push(<span title="VECINOS SIN DEFINIR"><i className={`far fa-user ${size}`} style={{ fontSize: fontSize }}></i></span>)
                if (row.neighbours > 0 && row.neighbours > row.alerted) _COMPONENT.push(<span title="FALTAN VECINOS POR CITAR"><i className={`far fa-user ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></span>)
                if (row.neighbours > 0 && row.neighbours == row.alerted) _COMPONENT.push(<span title="TODOS LOS VECINOS CITADOS"><i className={`far fa-user ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)

                if (row.sign) {
                    let sign = [];
                    sign = row.sign.split(',')

                    if (sign[1] != undefined) _COMPONENT.push(<span title="VALLA RADICADA"><i className={`fas fa-sign ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)
                    else _COMPONENT.push(<span title="VALLA SIN RADICAR"><i className={`fas fa-sign ${size}`} style={{ color: 'var(--bs-body-color)', fontSize: fontSize }}></i></span>)
                } else _COMPONENT.push(<span title="VALLA SIN RADICAR"><i className={`fas fa-sign ${size}`} style={{ color: 'var(--bs-body-color)', fontSize: fontSize }}></i></span>)
            }

            let report_data = _GET_LAW_REPORT_DATA_ICON(row);
            if (report_data == 1) {
                if (row.report_data) {
                    let report_data_array = row.report_data.split(',')
                    if (row.report_cub && report_data_array[5]) _COMPONENT.push(<span title="REPORTE PLANEACION ENVIADO Y RESPONDIDO"><i className={`fas fa-clipboard-list ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)
                    else if (row.report_cub && !report_data_array[5]) _COMPONENT.push(<span title="REPORTE PLANEACION ENVIADO PERO NO RESPONDIDO"><i className={`fas fa-clipboard-list ${size}`} style={{ color: 'Gold', fontSize: fontSize }}></i></span>)
                }
                else {
                    _COMPONENT.push(<span title="FALTA REPORTE PLANEACION"><i className={`fas fa-clipboard-list ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></span>)
                }
            }

            if (_GLOBAL_ID == "cb1") {
                if (row.seal) _COMPONENT.push(<span title="SELLO CREADO"><i className={`fab fa-wpforms ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)
                else _COMPONENT.push(<span title="SELLO NO CREADO"><i className={`fab fa-wpforms ${size}`} style={{ color: 'var(--bs-body-color)', fontSize: fontSize }}></i></span>)
            }

            if (regexChecker_isPh(row, true)) {
                if (row.ph_review == null) _COMPONENT.push(<span title="FALTA REVISION"><i className={`fas fa-pencil-ruler ${size}`} style={{ fontSize: fontSize }}></i></span>)
                if (row.ph_review == 0) _COMPONENT.push(<span title="DECLARADO NO VIABLE"><i className={`fas fa-pencil-ruler ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></span>)
                if (row.ph_review == 1) _COMPONENT.push(<span title="DECLARADO VIABLE"><i className={`fas fa-pencil-ruler ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)

            } else {

                let law_rew = row.clock_law_rew ?? row.law_review ?? '';
                law_rew = String(law_rew).split(';');
                let last_law_rew = law_rew.findLast(r => r == "0" || r == "1");

                if (last_law_rew == undefined) _COMPONENT.push(<span title="FALTA REVISION JURIDICA"><i className={`fas fa-balance-scale ${size}`} style={{ fontSize: fontSize }}></i></span>)
                if (last_law_rew == 0) _COMPONENT.push(<span title="JURIDICO DECLARADO NO VIABLE"><i className={`fas fa-balance-scale ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></span>)
                if (last_law_rew == 1) _COMPONENT.push(<span title="JURIDICO DECLARADO VIABLE"><i className={`fas fa-balance-scale ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)

                if (!isOA) {
                    let arc_rew = row.clock_arc_rew ?? row.arc_review ?? '';
                    arc_rew = String(arc_rew).split(';');
                    let last_arc_rew = arc_rew.findLast(r => r == "0" || r == "1");

                    if (last_arc_rew == undefined) _COMPONENT.push(<span title="FALTA REVISION ARQUITECTONICA"><i className={`far fa-building ${size}`} style={{ fontSize: fontSize }}></i></span>)
                    if (last_arc_rew == 0) _COMPONENT.push(<span title="ARQUITECTONICA DECLARADO NO VIABLE"><i className={`far fa-building ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></span>)
                    if (last_arc_rew == 1) _COMPONENT.push(<span title="ARQUITECTONICA DECLARADO VIABLE"><i className={`far fa-building ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)

                    if (rules[1] != 1) {
                        let eng_rew = row.clock_eng_rew ? row.clock_eng_rew : row.eng_review + ',' + row.eng_review_2;
                        eng_rew = String(eng_rew).split(';');
                        let last_eng_rew = [];
                        eng_rew.map(r => last_eng_rew = String(r).split(','));

                        if (last_eng_rew[0] == undefined && last_eng_rew[1] == undefined) _COMPONENT.push(<span title="FALTA REVISION INGENIERIA"><i className={`fas fa-cogs ${size}`} style={{ fontSize: fontSize }}></i></span>)
                        if (last_eng_rew[0] == null && last_eng_rew[1] == null) _COMPONENT.push(<span title="FALTA REVISION INGENIERIA"><i className={`fas fa-cogs ${size}`} style={{ fontSize: fontSize }}></i></span>)
                        if (last_eng_rew[0] == 'null' && last_eng_rew[1] == 'null') _COMPONENT.push(<span title="FALTA REVISION INGENIERIA"><i className={`fas fa-cogs ${size}`} style={{ fontSize: fontSize }}></i></span>)
                        if (last_eng_rew[0] == 0 && last_eng_rew[1] == 0) _COMPONENT.push(<span title="INGENIERIA DECLARADO NO VIABLE"><i className={`fas fa-cogs ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></span>)
                        if (last_eng_rew[0] == 0 && last_eng_rew[1] == 2) _COMPONENT.push(<span title="INGENIERIA DECLARADO NO VIABLE"><i className={`fas fa-cogs ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></span>)
                        if (last_eng_rew[0] == 1 && last_eng_rew[1] == 1) _COMPONENT.push(<span title="INGENIERIA DECLARADO VIABLE"><i className={`fas fa-cogs ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)
                        if (last_eng_rew[0] == 1 && last_eng_rew[1] == 2) _COMPONENT.push(<span title="INGENIERIA DECLARADO VIABLE"><i className={`fas fa-cogs ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)
                        if (last_eng_rew[0] == 1 && last_eng_rew[1] == 0) _COMPONENT.push(<span title="INGENIERIA DECLARADO VIABLE Y NO VIABLE"><i className={`fas fa-cogs ${size}`} style={{ color: 'Gold', fontSize: fontSize }}></i></span>)
                        if (last_eng_rew[0] == 0 && last_eng_rew[1] == 1) _COMPONENT.push(<span title="INGENIERIA DECLARADO VIABLE Y NO VIABLE"><i className={`fas fa-cogs ${size}`} style={{ color: 'Gold', fontSize: fontSize }}></i></span>)
                    }
                    if (row.rec_review == null && row.rec_review_2 == null) _COMPONENT.push(<span title="FALTA ACTA"><i className={`fas fa-file-contract ${size}`} style={{ fontSize: fontSize }}></i></span>)
                    else if ((row.rec_review == 0) && (row.rec_review_2 != 1 && row.rec_review_2 != 0)) _COMPONENT.push(<span title="FALTA ACTA DE CORRECCIONES"><i className={`fas fa-file-contract ${size}`} style={{ color: 'Gold', fontSize: fontSize }}></i></span>)
                    else if (row.rec_review == 1 || row.rec_review_2 == 1) _COMPONENT.push(<span title="CON ACTA EXPEDIDA"><i className={`fas fa-file-contract ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)

                }

                let expSteps = '';
                let stepCount = 0;
                expSteps = expSteps + 'VIABILIAD: '
                if (row.clock_pay2) { expSteps = expSteps + 'EXPEDIDA'; stepCount++ }
                else expSteps = expSteps + 'FALTA'
                expSteps = expSteps + '\n'

                expSteps = expSteps + 'RESOLUCION: '
                if (row.clock_license) { expSteps = expSteps + 'EXPEDIDA'; stepCount++ }
                else expSteps = expSteps + 'FALTA'
                expSteps = expSteps + '\n'

                /*
                expSteps = expSteps + '-LICENCIA: '
                if (row.clock_license) { expSteps = expSteps + 'EXPEDIDA'; stepCount++ }
                else expSteps = expSteps + 'FALTA'
                */

                if (stepCount == 0) _COMPONENT.push(<span title="EXPEDICION: FALTA INFORMACION"><i className={`fas fa-file-invoice ${size}`} style={{ fontSize: fontSize }}></i></span>)

                if (stepCount > 0 && stepCount < 2) _COMPONENT.push(<span title={expSteps}>
                    <i className={`fas fa-file-invoice ${size}`} style={{ color: 'Gold', fontSize: fontSize }}></i></span>)

                if (stepCount >= 2) _COMPONENT.push(<span title={expSteps}>
                    <i className={`fas fa-file-invoice ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></span>)

            }

            return <>{_COMPONENT.map((item, i) => React.cloneElement(item, { key: i }))}</>
        }
        return (
            <div>
                {_PROGRESS_COMPONENT(currentItem)}
            </div>
        );
}

export default FUN_ICON_PROGRESS;