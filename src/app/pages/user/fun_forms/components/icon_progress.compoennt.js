import { MDBTooltip } from 'mdb-react-ui-kit';
import { findLastMatch } from 'pdf-lib';
import React, { Component } from 'react';
import { find } from 'rsuite/esm/utils/ReactChildren';
import { regexChecker_isOA_2, regexChecker_isPh } from '../../../../components/customClasses/typeParse';

const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
class FUN_ICON_PROGRESS extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, globals, currentItem, small } = this.props;
        const { } = this.state;

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

            if (row.id_payment && row.clock_payment) _COMPONENT.push(<MDBTooltip title='EXPENSAS FIJA PAGADAS' tag='a'  >
                <i class={`fas fa-dollar-sign ${size} `} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)
            else if (!row.id_payment && !row.clock_payment) _COMPONENT.push(<MDBTooltip title='FALTA DECLARAR PAGO DE EXPENSAS FIJAS' tag='a' >
                <i class={`fas fa-dollar-sign ${size} `} style={{ color: 'Crimson', fontSize: fontSize }}></i></MDBTooltip>)
            else if (row.id_payment || row.clock_payment) _COMPONENT.push(<MDBTooltip title='EXPENSAS FIJA PAGADAS - FALTAN DETALLES' tag='a' >
                <i class={`fas fa-dollar-sign ${size} `} style={{ color: 'Gold', fontSize: fontSize }}></i></MDBTooltip>)

            if (row.state <= -100) _COMPONENT.push(<MDBTooltip title='EN DESISTIMIENTO' tag='a' >
                <i class={`far fa-window-close ${size} `} style={{ color: 'Crimson', fontSize: fontSize }}></i></MDBTooltip>)
            if (row.state == -1) _COMPONENT.push(<MDBTooltip title='INCOMPLETO' tag='a' >
                <i class={`far fa-check-square ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></MDBTooltip>)
            if (row.state == 1) _COMPONENT.push(<MDBTooltip title='EN REVISION' tag='a' >
                <i class={`far fa-check-square ${size} `} style={{ fontSize: fontSize }}></i></MDBTooltip>)
            if (row.state >= 5 && row.clock_date) _COMPONENT.push(<MDBTooltip title='EN LYDF' tag='a'>
                <i class={`far fa-check-square ${size} `} style={{ color: 'Green', fontSize: fontSize }} ></i></MDBTooltip>)
            if (row.state >= 5 && !row.clock_date) _COMPONENT.push(<MDBTooltip title='FALTA DECLARAR LYDF' tag='a'>
                <i class={`far fa-check-square ${size} `} style={{ color: 'Gold', fontSize: fontSize }} ></i></MDBTooltip>)

            if (!regexChecker_isPh(row, true) && !isOA && rules[0] != 1) {
                if (row.neighbours == 0) _COMPONENT.push(<MDBTooltip title='VECINOS SIN DEFINIR' tag='a' >
                    <i class={`far fa-user ${size}`} style={{ fontSize: fontSize }}></i></MDBTooltip>)
                if (row.neighbours > 0 && row.neighbours > row.alerted) _COMPONENT.push(<MDBTooltip title='FALTAN VECINOS POR CITAR' tag='a' >
                    <i class={`far fa-user ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></MDBTooltip>)
                if (row.neighbours > 0 && row.neighbours == row.alerted) _COMPONENT.push(<MDBTooltip title='TODOS LOS VECINOS CITADOS' tag='a' >
                    <i class={`far fa-user ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)

                if (row.sign) {
                    let sign = [];
                    sign = row.sign.split(',')

                    if (sign[1] != undefined) _COMPONENT.push(<MDBTooltip title='VALLA RADICADA' tag='a' >
                        <i class={`fas fa-sign ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)
                    else _COMPONENT.push(<MDBTooltip title='VALLA SIN RADICAR' tag='a' >
                        <i class={`fas fa-sign ${size}`} style={{ color: 'Black', fontSize: fontSize }}></i></MDBTooltip>)
                } else _COMPONENT.push(<MDBTooltip title='VALLA SIN RADICAR' tag='a' >
                    <i class={`fas fa-sign ${size}`} style={{ color: 'Black', fontSize: fontSize }}></i></MDBTooltip>)
            }

            let report_data = _GET_LAW_REPORT_DATA_ICON(row);
            if (report_data == 1) {
                if (row.report_data) {
                    let report_data_array = row.report_data.split(',')
                    if (row.report_cub && report_data_array[5]) _COMPONENT.push(<MDBTooltip title='REPORTE PLANEACION ENVIADO Y RESPONDIDO' tag='a' >
                        <i class={`fas fa-clipboard-list ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)
                    else if (row.report_cub && !report_data_array[5]) _COMPONENT.push(<MDBTooltip title='REPORTE PLANEACION ENVIADO PERO NO RESPONDIDO' tag='a' >
                        <i class={`fas fa-clipboard-list ${size}`} style={{ color: 'Gold', fontSize: fontSize }}></i></MDBTooltip>)
                }
                else {
                    _COMPONENT.push(<MDBTooltip title='FALTA REPORTE PLANEACION' tag='a' >
                        <i class={`fas fa-clipboard-list ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></MDBTooltip>)
                }
            }

            if (_GLOBAL_ID == "cb1") {
                if (row.seal) _COMPONENT.push(<MDBTooltip title='SELLO CREADO' tag='a' >
                    <i class={`fab fa-wpforms ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)
                else _COMPONENT.push(<MDBTooltip title='SELLO NO CREADO' tag='a' >
                    <i class={`fab fa-wpforms ${size}`} style={{ color: 'Black', fontSize: fontSize }}></i></MDBTooltip>)
            }


            if (regexChecker_isPh(row, true)) {
                if (row.ph_review == null) _COMPONENT.push(<MDBTooltip title='FALTA REVISION' tag='a' >
                    <i class={`fas fa-pencil-ruler ${size}`} style={{ fontSize: fontSize }}></i></MDBTooltip>)
                if (row.ph_review == 0) _COMPONENT.push(<MDBTooltip title='DECLARADO NO VIABLE' tag='a' >
                    <i class={`fas fa-pencil-ruler ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></MDBTooltip>)
                if (row.ph_review == 1) _COMPONENT.push(<MDBTooltip title='DECLARADO VIABLE' tag='a' >
                    <i class={`fas fa-pencil-ruler ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)

            } else {

                let law_rew = row.clock_law_rew ?? row.law_review ?? '';
                law_rew = String(law_rew).split(';');
                let last_law_rew = law_rew.findLast(r => r == "0" || r == "1");

                if (last_law_rew == undefined) _COMPONENT.push(<MDBTooltip title='FALTA REVISION JURIDICA' tag='a' >
                    <i class={`fas fa-balance-scale ${size}`} style={{ fontSize: fontSize }}></i></MDBTooltip>)
                if (last_law_rew == 0) _COMPONENT.push(<MDBTooltip title='JURIDICO DECLARADO NO VIABLE' tag='a' >
                    <i class={`fas fa-balance-scale ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></MDBTooltip>)
                if (last_law_rew == 1) _COMPONENT.push(<MDBTooltip title='JURIDICO DECLARADO VIABLE' tag='a' >
                    <i class={`fas fa-balance-scale ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)

                if (!isOA) {
                    let arc_rew = row.clock_arc_rew ?? row.arc_review ?? '';
                    arc_rew = String(arc_rew).split(';');
                    let last_arc_rew = arc_rew.findLast(r => r == "0" || r == "1");

                    if (last_arc_rew == undefined) _COMPONENT.push(<MDBTooltip title='FALTA REVISION ARQUITECTONICA' tag='a' >
                        <i class={`far fa-building ${size}`} style={{ fontSize: fontSize }}></i></MDBTooltip>)
                    if (last_arc_rew == 0) _COMPONENT.push(<MDBTooltip title='ARQUITECTONICA DECLARADO NO VIABLE' tag='a' >
                        <i class={`far fa-building ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></MDBTooltip>)
                    if (last_arc_rew == 1) _COMPONENT.push(<MDBTooltip title='ARQUITECTONICA DECLARADO VIABLE' tag='a' >
                        <i class={`far fa-building ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)

                    if (rules[1] != 1) {
                        let eng_rew = row.clock_eng_rew ? row.clock_eng_rew : row.eng_review + ',' + row.eng_review_2;
                        eng_rew = String(eng_rew).split(';');
                        let last_eng_rew = [];
                        eng_rew.map(r => last_eng_rew = String(r).split(','));

                        if (last_eng_rew[0] == undefined && last_eng_rew[1] == undefined) _COMPONENT.push(<MDBTooltip title='FALTA REVISION INGENIERIA' tag='a' >
                            <i class={`fas fa-cogs ${size}`} style={{ fontSize: fontSize }}></i></MDBTooltip>)
                        if (last_eng_rew[0] == null && last_eng_rew[1] == null) _COMPONENT.push(<MDBTooltip title='FALTA REVISION INGENIERIA' tag='a' >
                            <i class={`fas fa-cogs ${size}`} style={{ fontSize: fontSize }}></i></MDBTooltip>)
                        if (last_eng_rew[0] == 'null' && last_eng_rew[1] == 'null') _COMPONENT.push(<MDBTooltip title='FALTA REVISION INGENIERIA' tag='a' >
                            <i class={`fas fa-cogs ${size}`} style={{ fontSize: fontSize }}></i></MDBTooltip>)
                        if (last_eng_rew[0] == 0 && last_eng_rew[1] == 0) _COMPONENT.push(<MDBTooltip title='INGENIERIA DECLARADO NO VIABLE' tag='a' >
                            <i class={`fas fa-cogs ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></MDBTooltip>)
                        if (last_eng_rew[0] == 0 && last_eng_rew[1] == 2) _COMPONENT.push(<MDBTooltip title='INGENIERIA DECLARADO NO VIABLE' tag='a' >
                            <i class={`fas fa-cogs ${size}`} style={{ color: 'Crimson', fontSize: fontSize }}></i></MDBTooltip>)
                        if (last_eng_rew[0] == 1 && last_eng_rew[1] == 1) _COMPONENT.push(<MDBTooltip title='INGENIERIA DECLARADO VIABLE' tag='a' >
                            <i class={`fas fa-cogs ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)
                        if (last_eng_rew[0] == 1 && last_eng_rew[1] == 2) _COMPONENT.push(<MDBTooltip title='INGENIERIA DECLARADO VIABLE' tag='a' >
                            <i class={`fas fa-cogs ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)
                        if (last_eng_rew[0] == 1 && last_eng_rew[1] == 0) _COMPONENT.push(<MDBTooltip title='INGENIERIA DECLARADO VIABLE Y NO VIABLE' tag='a' >
                            <i class={`fas fa-cogs ${size}`} style={{ color: 'Gold', fontSize: fontSize }}></i></MDBTooltip>)
                        if (last_eng_rew[0] == 0 && last_eng_rew[1] == 1) _COMPONENT.push(<MDBTooltip title='INGENIERIA DECLARADO VIABLE Y NO VIABLE' tag='a' >
                            <i class={`fas fa-cogs ${size}`} style={{ color: 'Gold', fontSize: fontSize }}></i></MDBTooltip>)
                    }
                    if (row.rec_review == null && row.rec_review_2 == null) _COMPONENT.push(<MDBTooltip title='FALTA ACTA' tag='a' >
                        <i class={`fas fa-file-contract ${size}`} style={{ fontSize: fontSize }}></i></MDBTooltip>)
                    else if ((row.rec_review == 0) && (row.rec_review_2 != 1 && row.rec_review_2 != 0)) _COMPONENT.push(<MDBTooltip title='FALTA ACTA DE CORRECCIONES' tag='a' >
                        <i class={`fas fa-file-contract ${size}`} style={{ color: 'Gold', fontSize: fontSize }}></i></MDBTooltip>)
                    else if (row.rec_review == 1 || row.rec_review_2 == 1) _COMPONENT.push(<MDBTooltip title='CON ACTA EXPEDIDA' tag='a' >
                        <i class={`fas fa-file-contract ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)

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

                if (stepCount == 0) _COMPONENT.push(<MDBTooltip title='EXPEDICION: FALTA INFORMACION' tag='a' >
                    <i class={`fas fa-file-invoice ${size}`} style={{ fontSize: fontSize }}></i></MDBTooltip>)

                if (stepCount > 0 && stepCount < 2) _COMPONENT.push(<MDBTooltip title={expSteps} tag='a' >
                    <i class={`fas fa-file-invoice ${size}`} style={{ color: 'Gold', fontSize: fontSize }}></i></MDBTooltip>)

                if (stepCount >= 2) _COMPONENT.push(<MDBTooltip title={expSteps} tag='a' >
                    <i class={`fas fa-file-invoice ${size}`} style={{ color: 'Green', fontSize: fontSize }}></i></MDBTooltip>)

            }



            return <>{_COMPONENT}</>
        }
        return (
            <div>
                {_PROGRESS_COMPONENT(currentItem)}
            </div>
        );
    }
}


export default FUN_ICON_PROGRESS;