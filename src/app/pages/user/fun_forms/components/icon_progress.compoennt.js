import React from 'react';

import Icon from '@/components/icon';
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
            var iconSize = small ? 16 : 24;
            var iconSpacing = small ? '' : 'me-1';
            let rules = row.rules ? row.rules.split(';') : [];

            if (row.id_payment && row.clock_payment) _COMPONENT.push(<span title="EXPENSAS FIJA PAGADAS"><Icon name="dollar-sign" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)
            else if (!row.id_payment && !row.clock_payment) _COMPONENT.push(<span title="FALTA DECLARAR PAGO DE EXPENSAS FIJAS"><Icon name="dollar-sign" size={iconSize} className={iconSpacing} style={{ color: 'Crimson' }} /></span>)
            else if (row.id_payment || row.clock_payment) _COMPONENT.push(<span title="EXPENSAS FIJA PAGADAS - FALTAN DETALLES"><Icon name="dollar-sign" size={iconSize} className={iconSpacing} style={{ color: 'Gold' }} /></span>)

            if (row.state <= -100) _COMPONENT.push(<span title="EN DESISTIMIENTO"><Icon name="window-close" size={iconSize} className={iconSpacing} style={{ color: 'Crimson' }} /></span>)
            if (row.state == -1) _COMPONENT.push(<span title="INCOMPLETO"><Icon name="check-square" size={iconSize} className={iconSpacing} style={{ color: 'Crimson' }} /></span>)
            if (row.state == 1) _COMPONENT.push(<span title="EN REVISION"><Icon name="check-square" size={iconSize} className={iconSpacing} /></span>)
            if (row.state >= 5 && row.clock_date) _COMPONENT.push(<span title="EN LYDF"><Icon name="check-square" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)
            if (row.state >= 5 && !row.clock_date) _COMPONENT.push(<span title="FALTA DECLARAR LYDF"><Icon name="check-square" size={iconSize} className={iconSpacing} style={{ color: 'Gold' }} /></span>)

            if (!regexChecker_isPh(row, true) && !isOA && rules[0] != 1) {
                if (row.neighbours == 0) _COMPONENT.push(<span title="VECINOS SIN DEFINIR"><Icon name="user" size={iconSize} className={iconSpacing} /></span>)
                if (row.neighbours > 0 && row.neighbours > row.alerted) _COMPONENT.push(<span title="FALTAN VECINOS POR CITAR"><Icon name="user" size={iconSize} className={iconSpacing} style={{ color: 'Crimson' }} /></span>)
                if (row.neighbours > 0 && row.neighbours == row.alerted) _COMPONENT.push(<span title="TODOS LOS VECINOS CITADOS"><Icon name="user" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)

                if (row.sign) {
                    let sign = [];
                    sign = row.sign.split(',')

                    if (sign[1] != undefined) _COMPONENT.push(<span title="VALLA RADICADA"><Icon name="sign" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)
                    else _COMPONENT.push(<span title="VALLA SIN RADICAR"><Icon name="sign" size={iconSize} className={iconSpacing} style={{ color: 'var(--bs-body-color)' }} /></span>)
                } else _COMPONENT.push(<span title="VALLA SIN RADICAR"><Icon name="sign" size={iconSize} className={iconSpacing} style={{ color: 'var(--bs-body-color)' }} /></span>)
            }

            let report_data = _GET_LAW_REPORT_DATA_ICON(row);
            if (report_data == 1) {
                if (row.report_data) {
                    let report_data_array = row.report_data.split(',')
                    if (row.report_cub && report_data_array[5]) _COMPONENT.push(<span title="REPORTE PLANEACION ENVIADO Y RESPONDIDO"><Icon name="clipboard-list" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)
                    else if (row.report_cub && !report_data_array[5]) _COMPONENT.push(<span title="REPORTE PLANEACION ENVIADO PERO NO RESPONDIDO"><Icon name="clipboard-list" size={iconSize} className={iconSpacing} style={{ color: 'Gold' }} /></span>)
                }
                else {
                    _COMPONENT.push(<span title="FALTA REPORTE PLANEACION"><Icon name="clipboard-list" size={iconSize} className={iconSpacing} style={{ color: 'Crimson' }} /></span>)
                }
            }

            if (_GLOBAL_ID == "cb1") {
                if (row.seal) _COMPONENT.push(<span title="SELLO CREADO"><Icon name="wpforms" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)
                else _COMPONENT.push(<span title="SELLO NO CREADO"><Icon name="wpforms" size={iconSize} className={iconSpacing} style={{ color: 'var(--bs-body-color)' }} /></span>)
            }

            if (regexChecker_isPh(row, true)) {
                if (row.ph_review == null) _COMPONENT.push(<span title="FALTA REVISION"><Icon name="pencil-ruler" size={iconSize} className={iconSpacing} /></span>)
                if (row.ph_review == 0) _COMPONENT.push(<span title="DECLARADO NO VIABLE"><Icon name="pencil-ruler" size={iconSize} className={iconSpacing} style={{ color: 'Crimson' }} /></span>)
                if (row.ph_review == 1) _COMPONENT.push(<span title="DECLARADO VIABLE"><Icon name="pencil-ruler" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)

            } else {

                let law_rew = row.clock_law_rew ?? row.law_review ?? '';
                law_rew = String(law_rew).split(';');
                let last_law_rew = law_rew.findLast(r => r == "0" || r == "1");

                if (last_law_rew == undefined) _COMPONENT.push(<span title="FALTA REVISION JURIDICA"><Icon name="balance-scale" size={iconSize} className={iconSpacing} /></span>)
                if (last_law_rew == 0) _COMPONENT.push(<span title="JURIDICO DECLARADO NO VIABLE"><Icon name="balance-scale" size={iconSize} className={iconSpacing} style={{ color: 'Crimson' }} /></span>)
                if (last_law_rew == 1) _COMPONENT.push(<span title="JURIDICO DECLARADO VIABLE"><Icon name="balance-scale" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)

                if (!isOA) {
                    let arc_rew = row.clock_arc_rew ?? row.arc_review ?? '';
                    arc_rew = String(arc_rew).split(';');
                    let last_arc_rew = arc_rew.findLast(r => r == "0" || r == "1");

                    if (last_arc_rew == undefined) _COMPONENT.push(<span title="FALTA REVISION ARQUITECTONICA"><Icon name="building" size={iconSize} className={iconSpacing} /></span>)
                    if (last_arc_rew == 0) _COMPONENT.push(<span title="ARQUITECTONICA DECLARADO NO VIABLE"><Icon name="building" size={iconSize} className={iconSpacing} style={{ color: 'Crimson' }} /></span>)
                    if (last_arc_rew == 1) _COMPONENT.push(<span title="ARQUITECTONICA DECLARADO VIABLE"><Icon name="building" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)

                    if (rules[1] != 1) {
                        let eng_rew = row.clock_eng_rew ? row.clock_eng_rew : row.eng_review + ',' + row.eng_review_2;
                        eng_rew = String(eng_rew).split(';');
                        let last_eng_rew = [];
                        eng_rew.map(r => last_eng_rew = String(r).split(','));

                        if (last_eng_rew[0] == undefined && last_eng_rew[1] == undefined) _COMPONENT.push(<span title="FALTA REVISION INGENIERIA"><Icon name="cogs" size={iconSize} className={iconSpacing} /></span>)
                        if (last_eng_rew[0] == null && last_eng_rew[1] == null) _COMPONENT.push(<span title="FALTA REVISION INGENIERIA"><Icon name="cogs" size={iconSize} className={iconSpacing} /></span>)
                        if (last_eng_rew[0] == 'null' && last_eng_rew[1] == 'null') _COMPONENT.push(<span title="FALTA REVISION INGENIERIA"><Icon name="cogs" size={iconSize} className={iconSpacing} /></span>)
                        if (last_eng_rew[0] == 0 && last_eng_rew[1] == 0) _COMPONENT.push(<span title="INGENIERIA DECLARADO NO VIABLE"><Icon name="cogs" size={iconSize} className={iconSpacing} style={{ color: 'Crimson' }} /></span>)
                        if (last_eng_rew[0] == 0 && last_eng_rew[1] == 2) _COMPONENT.push(<span title="INGENIERIA DECLARADO NO VIABLE"><Icon name="cogs" size={iconSize} className={iconSpacing} style={{ color: 'Crimson' }} /></span>)
                        if (last_eng_rew[0] == 1 && last_eng_rew[1] == 1) _COMPONENT.push(<span title="INGENIERIA DECLARADO VIABLE"><Icon name="cogs" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)
                        if (last_eng_rew[0] == 1 && last_eng_rew[1] == 2) _COMPONENT.push(<span title="INGENIERIA DECLARADO VIABLE"><Icon name="cogs" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)
                        if (last_eng_rew[0] == 1 && last_eng_rew[1] == 0) _COMPONENT.push(<span title="INGENIERIA DECLARADO VIABLE Y NO VIABLE"><Icon name="cogs" size={iconSize} className={iconSpacing} style={{ color: 'Gold' }} /></span>)
                        if (last_eng_rew[0] == 0 && last_eng_rew[1] == 1) _COMPONENT.push(<span title="INGENIERIA DECLARADO VIABLE Y NO VIABLE"><Icon name="cogs" size={iconSize} className={iconSpacing} style={{ color: 'Gold' }} /></span>)
                    }
                    if (row.rec_review == null && row.rec_review_2 == null) _COMPONENT.push(<span title="FALTA ACTA"><Icon name="file-contract" size={iconSize} className={iconSpacing} /></span>)
                    else if ((row.rec_review == 0) && (row.rec_review_2 != 1 && row.rec_review_2 != 0)) _COMPONENT.push(<span title="FALTA ACTA DE CORRECCIONES"><Icon name="file-contract" size={iconSize} className={iconSpacing} style={{ color: 'Gold' }} /></span>)
                    else if (row.rec_review == 1 || row.rec_review_2 == 1) _COMPONENT.push(<span title="CON ACTA EXPEDIDA"><Icon name="file-contract" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)

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

                if (stepCount == 0) _COMPONENT.push(<span title="EXPEDICION: FALTA INFORMACION"><Icon name="file-invoice" size={iconSize} className={iconSpacing} /></span>)

                if (stepCount > 0 && stepCount < 2) _COMPONENT.push(<span title={expSteps}>
                    <Icon name="file-invoice" size={iconSize} className={iconSpacing} style={{ color: 'Gold' }} /></span>)

                if (stepCount >= 2) _COMPONENT.push(<span title={expSteps}>
                    <Icon name="file-invoice" size={iconSize} className={iconSpacing} style={{ color: 'Green' }} /></span>)

            }

            return <>{_COMPONENT.map((item, i) => React.cloneElement(item, { key: i }))}</>
        }
        return (
            <div className={small ? "flex min-w-max flex-nowrap items-center gap-1 whitespace-nowrap" : "flex flex-wrap items-center gap-1"}>
                {_PROGRESS_COMPONENT(currentItem)}
            </div>
        );
}

export default FUN_ICON_PROGRESS;