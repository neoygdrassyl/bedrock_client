import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { _FUN_101_PARSER, _FUN_102_PARSER, _FUN_1_PARSER, _FUN_24_PARSER, _FUN_25_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER, _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER } from '../../../../components/customClasses/funCustomArrays';
import VIZUALIZER from '../../../../components/vizualizer.component';
import Record_lawService from '../../../../services/record_law.service';
import FUN_SERVICE from '../../../../services/fun.service';
import RECORD_LAW_SERVICE from '../../../../services/record_law.service';
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service';
import RECORD_ARC_SERVICE from '../../../../services/record_arc.service';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service';
import { dateParser_finalDate, formsParser1, regexChecker_isPh } from '../../../../components/customClasses/typeParse';
import { MDBTooltip } from 'mdb-react-ui-kit';
import FUN_ICON_PROGRESS from './icon_progress.compoennt';

export default function FUN_MACROTABLE_CLOCKS(props) {
    const { translation, swaMsg, globals, dataFilter, selectedRow, hide_jur, hide_arc, hide_ing, worker_list } = props;
    const MySwal = withReactContent(Swal);
    const rowSelectedStyle = [
        {
            when: row => row.id == selectedRow,
            style: {
                backgroundColor: 'BlanchedAlmond',
            },
        },
    ];
    const _fun_0_type = { '0': 'SIN CATEGORIZAR', 'i': 'CATEGORIA I', 'ii': "CATEGORIA II", 'iii': "CATEGORIA III", 'iv': "CATEGORIA IV", 'oa': "OTRAS ACTUACIONES" }
    let _fun_0_state = _state => {
        if (_state < -100) return <label className="fw-bold text-danger">DESISTIMIENTO</label>;
        if (_state == -1) return <label className="fw-bold text-danger">INCOMPLETO</label>
        if (_state == 1) return 'RADICACION'
        if (_state == 5) return 'LYDF'
        if (_state == 50) return 'EXPEDICION'
        if (_state == 100) return <label className='fw-bold text-primary'>EXPEDIDA</label>
        if (_state == 101) return <label className='fw-bold text-primary'>ARCHIVADA</label>
        return _state;
    }
    const _fun_0_type_days = { 'i': 4, 'ii': 6, 'iii': 8, 'iv': 10, 'oa': 2 };
    const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
    const conditionalCellStylesJUR = [
        {
            when: row => row.id == selectedRow,
            style: { backgroundColor: 'BlanchedAlmond' }
        },
        {
            when: row => row.id != selectedRow,
            style: { backgroundColor: 'LemonChiffon' }
        }
    ];
    const conditionalCellStylesENG = [
        {
            when: row => row.id == selectedRow,
            style: { backgroundColor: 'BlanchedAlmond' }
        },
        {
            when: row => row.id != selectedRow,
            style: { backgroundColor: 'LavenderBlush' }
        }
    ];
    const conditionalCellStylesARQ = [
        {
            when: row => row.id == selectedRow,
            style: { backgroundColor: 'BlanchedAlmond' }
        },
        {
            when: row => row.id != selectedRow,
            style: { backgroundColor: 'LightCyan' }
        }
    ];
    const nullIcon = <i class="fas fa-minus text-danger"></i>
  
    // *********************** DATA GETTERS ************************** // 
    let _PARSE_FUN_1 = (_ITEM) => {
        var _CHILD_VARS = {
            tipo: _ITEM.tipo,
            tramite: _ITEM.tramite,
            m_urb: _ITEM.m_urb,
            m_sub: _ITEM.m_sub,
            m_lic: _ITEM.m_lic,
        }
        return formsParser1(_CHILD_VARS)

    }
    let _GET_WORKER_BY_ID = (_ID) => {
        let _workers = worker_list;
        for (var i = 0; i < _workers.length; i++) {
            if (_workers[i].id == _ID) return `${_workers[i].name} ${_workers[i].surname}`
        }
        return '';
    }
    // ************************ DATA CONVERTERS ************************ // 
    let _GET_REVIEW = (_REVIEW) => {
        if (_REVIEW == null) return <label className="">SIN EVALUAR</label>
        if (_REVIEW == 0) return <label className="fw-bold text-danger">NO VIABLE</label>
        if (_REVIEW == 1) return <label className="fw-bold text-success">VIABLE</label>
    }
    let GET_REVIEW_ENG = (_REVIEW) => {
        if (_REVIEW == null) return <label className="">SIN EVALUAR</label>
        if (_REVIEW == 0) return <label className="fw-bold text-danger">NO CUMPLE</label>
        if (_REVIEW == 1) return <label className="fw-bold text-success">CUMPLE</label>
        if (_REVIEW == 2) return <label className="fw-bold text-warning">NO APLICA</label>
    }
    // ************************** JSX COMPONENTS *********************** // 
    let _WORKERS_SELECT = (_defaultValue, parentId, reportType, row, roleFilter = []) => {
        return <select className='form-select form-select-sm' defaultValue={_defaultValue} onChange={(e) => asignWorker(e.target.value, parentId, reportType, row)}>
            <option value="">SIN ASIGNAR</option>
            {worker_list.map((value) => {
                if (roleFilter.length > 0) {
                    if (roleFilter.includes(value.roleId)) return <option value={value.id}>{value.name} {value.surname}</option>
                }
                else return <option value={value.id}>{value.name} {value.surname}</option>
            })}
        </select>
    }
    let _RECORD_DATE = (_defaultValue, parentId, reportType, row) => {
        return <input type="date" class="form-control form-control-sm" max="2100-01-01" defaultValue={_defaultValue}
            onChange={(e) => asigDate(e.target.value, parentId, reportType, row)} />
    }
    // ************************** TABLE COMPONENTS ********************* // 
    const columns = [
        {
            name: <label>No. RADICACION</label>,
            selector: 'id_public',
            sortable: true,
            filterable: true,
            minWidth: '150px',
            cell: row => <label>{row.id_public}</label>
        },
        {
            name: <label>INFO</label>,
            button: true,
            cell: row => <MDBTooltip title='Informacion solicitud' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                <button className="btn btn-sm btn-info m-0 p-1 shadow-none"
                    onClick={() => props.NAVIGATION_GEN(row)}>
                    <i class="far fa-folder-open" ></i></button></MDBTooltip>
        },
        {
            name: <label>ACTUACION</label>,
            selector: row => _PARSE_FUN_1(row),
            sortable: true,
            filterable: true,
            minWidth: '300px',
            cell: row => <label>{row.usos == 'A' ? <u>{_PARSE_FUN_1(row)}</u> : _PARSE_FUN_1(row)}</label>
        },
        {
            name: <label className="text-center">ESTADO</label>,
            selector: 'state',
            sortable: true,
            filterable: true,
            center: true,
            minWidth: '200px',
            cell: row => <label>{_fun_0_state(row.state)}</label>
        },
        {
            name: <label className="text-center">CATEGORIA</label>,
            selector: 'type',
            sortable: true,
            filterable: true,
            center: true,
            minWidth: '200px',
            cell: row => <label>{_fun_0_type[row.type]}</label>
        },
        {
            name: <label className="fw-bold text-primary text-center">EXPENSAS FIJAS <i class={`fas fa-dollar-sign`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_3,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="fw-bold text-primary">{row.clock_3} </label>
        },
        {
            name: <label className="text-center">INCOMPLETO <i class={`far fa-window-close`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_01,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_01}</label>
        },
        {
            name: <label className="fw-bold text-primary text-center">LYDF <i class={`far fa-check-square`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_5,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="fw-bold text-primary text-center">{row.clock_5}</label>
        },
        {
            name: <label className="text-center">RADICACIÓN VALLA <i class={`fas fa-sign`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.sign ? row.sign.split(',')[1] : '',
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.sign ? row.sign.split(',')[1] : ''}</label>
        },
        {
            name: <label>JUR. PROF. ASIG. <i class={`fas fa-balance-scale`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => !regexChecker_isPh(row, true) ? row.asign_law_worker_id : row.sign_ph_law_worker_id,
            sortable: true,
            filterable: true,
            minWidth: '160px',
            conditionalCellStyles: conditionalCellStylesJUR,
            center: true,
            omit: hide_jur,
            cell: row =>  <>{_WORKERS_SELECT(
                    !regexChecker_isPh(row, true) ? row.asign_law_worker_id : row.sign_ph_law_worker_id,
                    !regexChecker_isPh(row, true) ? row.law_id : row.ph_id,
                    !regexChecker_isPh(row, true) ? 'law' : 'phl',
                    row, [2, 5]
                )}</>
        },
        {
            name: <label>JUR. FECHA ASIG.  <i class={`fas fa-balance-scale`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => !regexChecker_isPh(row, true) ? row.asign_law_date : row.asign_ph_law_date,
            sortable: true,
            filterable: true,
            minWidth: '160px',
            conditionalCellStyles: conditionalCellStylesJUR,
            center: true,
            omit: hide_jur,
            cell: row => <>{_RECORD_DATE(
                    !regexChecker_isPh(row, true) ? row.asign_law_date : row.asign_ph_law_date,
                    !regexChecker_isPh(row, true) ? row.law_id : row.ph_id,
                    !regexChecker_isPh(row, true) ? 'law' : 'phl',
                    row
                )}</>
                
        },
        {
            name: <label className="text-center">JUR. PROFESIONAL <i class={`fas fa-balance-scale`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.lawr_workername,
            sortable: true,
            filterable: true,
            minWidth: '120px',
            conditionalCellStyles: conditionalCellStylesJUR,
            center: true,
            omit: hide_jur,
            cell: row => !regexChecker_isPh(row, true)
                ? row.law_id ? <label>{row.lawr_workername}</label> : nullIcon
                : row.ph_id ? <label>{row.ph_lawwname}</label> : nullIcon
        },
        {
            name: <label className="text-center">JUR. FECHA REVISIÓN <i class={`fas fa-balance-scale`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.lawr_date,
            sortable: true,
            filterable: true,
            conditionalCellStyles: conditionalCellStylesJUR,
            center: true,
            omit: hide_jur,
            cell: row => !regexChecker_isPh(row, true)
                ? row.law_id ? <label className="">{row.lawr_date}</label> : nullIcon
                : row.ph_id ? <label>{row.ph_lawdate}</label> : nullIcon
        },
        {
            name: <label className="text-center">JUR. REVISIÓN <i class={`fas fa-balance-scale`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.arcr_check,
            sortable: true,
            filterable: true,
            minWidth: '120px',
            conditionalCellStyles: conditionalCellStylesJUR,
            center: true,
            omit: hide_jur,
            cell: row => !regexChecker_isPh(row, true)
                ? row.law_id ? <label>{_GET_REVIEW(row.arcr_check)}</label> : nullIcon
                : row.ph_id ? <label>{_GET_REVIEW(row.ph_lawcheck)}</label> : nullIcon
        },
        {
            name: <label className="text-center">ARQ. PROFESIONAL <i class={`far fa-building`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.arcr_workername,
            sortable: true,
            filterable: true,
            minWidth: '120px',
            conditionalCellStyles: conditionalCellStylesARQ,
            center: true,
            omit: hide_arc,
            cell: row => !regexChecker_isPh(row, true)
                ? row.arc_id ? <label>{row.arcr_workername}</label> : nullIcon
                : row.ph_id ? <label>{row.ph_arcwname}</label> : nullIcon
        },
        {
            name: <label className="text-center">ARQ. FECHA REVISIÓN <i class={`far fa-building`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.lawr_date,
            sortable: true,
            filterable: true,
            conditionalCellStyles: conditionalCellStylesARQ,
            center: true,
            omit: hide_arc,
            cell: row => !regexChecker_isPh(row, true)
                ? row.arc_id ? <label className="">{row.lawr_date}</label> : nullIcon
                : row.ph_id ? <label>{row.ph_arcdate}</label> : nullIcon
        },
        {
            name: <label className="text-center">ARQ. REVISIÓN <i class={`far fa-building`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.arcr_check,
            sortable: true,
            filterable: true,
            minWidth: '120px',
            conditionalCellStyles: conditionalCellStylesARQ,
            center: true,
            omit: hide_arc,
            cell: row => !regexChecker_isPh(row, true)
                ? row.arc_id ? <label>{_GET_REVIEW(row.arcr_check)}</label> : nullIcon
                : row.ph_id ? <label>{_GET_REVIEW(row.ph_arccheck)}</label> : nullIcon
        },
        {
            name: <label className="text-center">EST. PROFESIONAL <i class={`fas fa-cogs`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.engr_workername,
            sortable: true,
            filterable: true,
            minWidth: '120px',
            conditionalCellStyles: conditionalCellStylesENG,
            center: true,
            omit: hide_ing,
            cell: row => !regexChecker_isPh(row, true)
                ? row.eng_id ? <label>{row.engr_workername}</label> : nullIcon
                : <i class="fas fa-minus"></i>

        },
        {
            name: <label className="text-center">EST. FECHA REVISIÓN <i class={`fas fa-cogs`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.engr_date,
            sortable: true,
            filterable: true,
            conditionalCellStyles: conditionalCellStylesENG,
            center: true,
            omit: hide_ing,
            cell: row => !regexChecker_isPh(row, true)
                ? row.eng_id ? <label className="">{row.engr_date}</label> : nullIcon
                : <i class="fas fa-minus"></i>

        },
        {
            name: <label className="text-center">EST. REVISIÓN <i class={`fas fa-cogs`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.engr_check,
            sortable: true,
            filterable: true,
            minWidth: '200px',
            conditionalCellStyles: conditionalCellStylesENG,
            center: true,
            omit: hide_ing,
            cell: row => !regexChecker_isPh(row, true)
                ? row.eng_id ? <label>Revision 1: {GET_REVIEW_ENG(row.engr_check)}<br />Revision 2: {GET_REVIEW_ENG(row.engr_check_2)}</label> : nullIcon
                : <i class="fas fa-minus"></i>

        },
        {
            name: <label className="text-center">ACTA P.1 <i class={`fas fa-file-contract`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_30,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_30}</label>
        },
        {
            name: <label className="text-center">NOT. PERSONAL <i class={`fas fa-envelope`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_32,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_32}</label>
        },
        {
            name: <label className="text-center">NOT. AVISO <i class={`fas fa-envelope`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_33,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_33}</label>
        },
        {
            name: <label className="text-center">ACTA P.2 <i class={`fas fa-file-contract`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_49,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_49}</label>
        },
        {
            name: <label className="fw-bold text-primary text-center">EXPEDICIÓN <i class={`fas fa-file-contract`} style={{ fontSize: '150%' }}></i></label>,
            center: true,
            cell: row => <label className="fw-bold text-primary text-center">{'XOXO'}</label>
        },
        {
            name: <label className="text-center">TRAMITE LICENCIA <i class={`fas fa-dollar-sign`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_61,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_61}</label>
        },
        {
            name: <label className="text-center">EXPENSAS VARIABLES <i class={`fas fa-dollar-sign`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_62,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_62}</label>
        },
        {
            name: <label className="text-center">IMPUESTOS MUNICIPALES <i class={`fas fa-dollar-sign`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_63,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_63}</label>
        },
        {
            name: <label className="text-center">ESTAMPILLA PRO-UIS <i class={`fas fa-dollar-sign`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_64,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_64}</label>
        },
        {
            name: <label className="text-center">DEBERES URBANISTICOS <i class={`fas fa-dollar-sign`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_65,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_65}</label>
        },
        {
            name: <label className="text-center">ACTO ADMI. / RESOLUCIÓN <i class={`fas fa-file-invoice`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_70,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_70}</label>
        },
        {
            name: <label className="text-center">NOT. PERSONAL <i class={`fas fa-envelope`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_72,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_72}</label>
        },
        {
            name: <label className="text-center">NOT. AVISO <i class={`fas fa-envelope`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_73,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_73}</label>
        },
        {
            name: <label className="text-center">EJECUTORIA <i class={`fas fa-file-invoice`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_80,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className="">{row.clock_80}</label>
        },
        {
            name: <label className="text-center text-primary fw-bold">LICENCIA <i class={`fas fa-file-invoice`} style={{ fontSize: '150%' }}></i></label>,
            selector: row => row.clock_90,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <label className=" text-primary fw-bold">{row.clock_90}</label>
        },


    ]
    // ******************************* APIS **************************** // 
    var formData = new FormData();

    function asignWorker(workerId, childId, reportType, row) {
        formData = new FormData();
        if (!childId) {
            formData.set('fun0Id', row.id);
            formData.set('version', 1);
        }
        if (reportType == 'phl') {
            formData.set('worker_asign_law_id', workerId);
            formData.set('worker_asign_law_name', _GET_WORKER_BY_ID(workerId));
            manage_record_ph(childId);
        }
        else if (reportType == 'pha') {
            formData.set('worker_asign_arc_id', workerId);
            formData.set('worker_asign_arc_name', _GET_WORKER_BY_ID(workerId));
            manage_record_ph(childId);
        } else {
            formData.set('worker_id', workerId);
            formData.set('worker_name', _GET_WORKER_BY_ID(workerId));
            if (reportType == 'law') manage_record_law(childId);
            if (reportType == 'eng') manage_record_eng(childId);
            if (reportType == 'arc') manage_record_arc(childId);
        }
    }
    function asigDate(date, childId, reportType, row) {
        formData = new FormData();
        if (!childId) {
            formData.set('fun0Id', row.id);
            formData.set('version', 1);
        }
        if (reportType == 'phl') {
            formData.set('date_asign_law', date);
            manage_record_ph(childId);
        } else if (reportType == 'pha') {
            formData.set('date_asign_arc', date);
            manage_record_ph(childId);
        } else {
            formData.set('date_asign', date);
            if (reportType == 'law') manage_record_law(childId);
            if (reportType == 'eng') manage_record_eng(childId);
            if (reportType == 'arc') manage_record_arc(childId);
        }
    }

    let manage_record_ph = (childId) => {
        if (childId) {
            RECORD_PH_SERVICE.update(childId, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        props.retrieveMacroClocks();
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        } else {
            RECORD_PH_SERVICE.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        props.retrieveMacroClocks();
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }

    }
    let manage_record_law = (childId) => {
        if (childId) {
            RECORD_LAW_SERVICE.update(childId, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        props.retrieveMacroClocks();
                        props.retrieveMacro(false);
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        } else {
            RECORD_LAW_SERVICE.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        props.retrieveMacroClocks();
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }

    }
    let manage_record_eng = (childId) => {
        if (childId) {
            RECORD_ENG_SERVICE.update(childId, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        props.retrieveMacroClocks();
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        } else {
            RECORD_ENG_SERVICE.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        props.retrieveMacroClocks();
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }

    }
    let manage_record_arc = (childId) => {
        if (childId) {
            RECORD_ARC_SERVICE.update(childId, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        props.retrieveMacroClocks();
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        } else {
            RECORD_ARC_SERVICE.create(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        props.retrieveMacroClocks();
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }

    }
    return (
        <div className="">
            {props.load ? (
                <DataTable
                    conditionalRowStyles={rowSelectedStyle}
                    noDataComponent={<h4 className="fw-bold">NO HAY INFORMACION</h4>}
                    striped="true"
                    columns={columns}
                    data={dataFilter}
                    highlightOnHover
                    pagination
                    paginationPerPage={50}
                    paginationRowsPerPageOptions={[50, 100, 200]}
                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                    className="data-table-component"
                    noHeader
                    dense
                    onRowClicked={(e) => props.setSelectedRow(e.id)}
                />
            ) : (
                <div className="text-center">
                    <h4 className="fw-bold">CARGANDO INFORMACION...</h4>
                </div>)}
        </div>
    );
}
