import React from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import VIZUALIZER from '../../../components/vizualizer.component';
import FUN_SERVICE from '../../../services/fun.service';
import { dateParser_dateDiff, dateParser_finalDate, regexChecker_isOA_2 } from '../../../components/customClasses/typeParse';
import moment from 'moment';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

export default function EXP_CLOCKS(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;

    // ***************************  DATA GETTERS *********************** //


    let _GET_CLOCK = () => {
        var _CHILD = currentItem.fun_clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CHILD_6 = () => {
        var _CHILD = currentItem.fun_6s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = {
            item_0: "",
            description: "",
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
            }
        }
        return _CHILD_VARS;
    }
    let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)
    let conGI = _GLOBAL_ID === 'cb1'
    let namePayment = _GLOBAL_ID === 'cb1' ? 'Impuestos Municipales' : 'Impuesto Delineacion'

    // *************************  DATA CONVERTERS ********************** //
    let _GET_CLOCK_STATE = (_state) => {
        var _CLOCK = _GET_CLOCK();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }
    let _FIND_6 = (_ID) => {
        let _LIST = _GET_CHILD_6();
        let _CHILD = [];
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].id == _ID) {
                return _LIST[i];
            }
        }
        return _CHILD;
    }
    let _CHILD_6_SELECT = () => {
        let _LIST = _GET_CHILD_6();
        let _COMPONENT = [];
        for (var i = 0; i < _LIST.length; i++) {
            _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
        }
        return <>{_COMPONENT}</>
    }
    let get_clockExistIcon = (state) => {
        var _CHILD = _GET_CLOCK_STATE(state);
        if (_CHILD) {
            if (_CHILD.date_start) return <i class="far fa-check-circle text-success"></i>
            return <i class="far fa-dot-circle text-warning"></i>
        }
        return <i class="far fa-dot-circle"></i>
    }
    let get_newestDate = (states) => {
        let newDate = null;
        states.forEach((element) => {
            let date = _GET_CLOCK_STATE(element).date_start;

            if (!newDate && date) newDate = date;
            else {
                if (moment(date).isAfter(newDate) && date) newDate = date;
            }
        });
        return newDate;
    }

    // ******************************* JSX ***************************** // 
    let _COMPONENT_CLOCKS = () => {
        return <>
            <div className="row mx-2 bg-info text-white">
                <div className="col-4 text-center">
                    <label className="fw-bold mt-1">TITULO</label>
                </div>
                <div className="col text-center">
                    <label className="fw-bold mt-1">FECHA EVENTO</label>
                </div>
                <div className="col text-center">
                    <label className="fw-bold mt-1">FECHA LIMITE</label>
                </div>
                <div className="col text-center">
                    <label className="fw-bold mt-1">INFORMACION</label>
                </div>
                <div className="col text-center">
                    <label className="fw-bold mt-1">ANEXO</label>
                </div>
                <div className="col-1 text-center">
                </div>
            </div>
            <div className="row mx-2 my-0">
                <div className="col-4 border">
                    <label className="fw-bold mt-2 ">{get_clockExistIcon(3)} Expensas Fijas</label>
                </div>
                <div className="col border py-1 text-center">
                    <label className="fw-bold mt-2 ">{_GET_CLOCK_STATE(3).date_start ?? <label className='text-danger'>DEBE ESPECIFICAR FECHA</label>}</label>
                </div>
                <div className="col text-center border py-1">
                </div>
                <div className="col border py-1">
                </div>

                <div className="col border py-1">
                </div>

                <div className="col-1 border py-1">
                    {(_GET_CLOCK_STATE(3).resolver_id6 ?? 0) > 0
                        ?
                        <VIZUALIZER url={_FIND_6(_GET_CLOCK_STATE(3).resolver_id6).path + "/" + _FIND_6(_GET_CLOCK_STATE(3).resolver_id6).filename} apipath={'/files/'}
                        />
                        : ""}
                </div>
            </div>
            {_COMPONENT_CLOCK_LIST()}
        </>
    }
    let _COMPONENT_CLOCK_LIST = () => {
        return clocks.map((value, i) => {
            if (value.requiredClock) {
                let needClock = _GET_CLOCK_STATE(value.requiredClock)
                if (!needClock) return;
            }
            if (value.show) return;

            return <>
                {value.title ?
                    <>
                        <div className="row mx-2 my-0">
                            <div className="col border text-center">
                                <label className='fw-bold'>{value.title}</label>
                            </div>
                        </div>
                    </>
                    :
                    <div className="row mx-2 my-0">
                        <div className="col-4 border">
                            <label className="fw-bold mt-2">{get_clockExistIcon(value.state)} {value.name}</label>
                        </div>
                        <div className="col border py-0">
                            <input type="date" class="form-control form-control-sm" id={'clock_exp_date_' + i} max="2100-01-01"
                                defaultValue={_GET_CLOCK_STATE(value.state).date_start ?? ''} onBlur={(e) => save_clock(value, i)} />
                        </div>
                        <div className="col text-center border py-0">
                            {value.limit ?
                                Array.isArray(value.limit[0]) ?
                                    dateParser_finalDate(get_newestDate(value.limit[0]), value.limit[1])
                                    : dateParser_finalDate(_GET_CLOCK_STATE(value.limit[0]).date_start, value.limit[1])
                                : ''}
                        </div>
                        <div className="col border py-0 ">

                            {value.info ?
                                <select className='form-select form-control form-control-sm' id={'clock_exp_res_' + i} defaultValue={_GET_CLOCK_STATE(value.state).resolver_context ?? 0}
                                    onChange={(e) => save_clock(value, i)}>
                                    {value.info.map(value => <option>{value}</option>)}
                                </select>
                                : ''}

                        </div>

                        <div className="col border py-0">
                            <select className='form-select form-control form-control-sm' id={'clock_exp_id6_' + i} defaultValue={_GET_CLOCK_STATE(value.state).resolver_id6 ?? 0}
                                onChange={(e) => save_clock(value, i)}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>

                        <div className="col-1 border py-0">
                            {(_GET_CLOCK_STATE(value.state).resolver_id6 ?? 0) > 0
                                ?
                                <VIZUALIZER url={_FIND_6(_GET_CLOCK_STATE(value.state).resolver_id6).path + "/" + _FIND_6(_GET_CLOCK_STATE(value.state).resolver_id6).filename} apipath={'/files/'}
                                    icon={'fas fa-search'} iconWrapper={'btn btn-sm btn-info m-0 p-1 shadow-none'}
                                />
                                : ""}
                        </div>
                    </div>
                }


            </>
        })
    }
    // ******************************* APIS **************************** // 
    let save_clock = (value, i) => {
        var formDataClock = new FormData();

        let date_start = document.getElementById("clock_exp_date_" + i).value;
        let resolver_context = document.getElementById("clock_exp_res_" + i) ? document.getElementById("clock_exp_res_" + i).value : false;
        let resolver_id6 = document.getElementById("clock_exp_id6_" + i).value;

        formDataClock.set('date_start', date_start);
        if (resolver_context) formDataClock.set('resolver_context', resolver_context);
        formDataClock.set('resolver_id6', resolver_id6);
        formDataClock.set('state', value.state);
        let desc = value.desc;
        if (resolver_context) desc = desc + ': ' + resolver_context;
        formDataClock.set('desc', desc);
        formDataClock.set('name', value.name);

        manage_clock(false, value.state, false, formDataClock)
    }
    let manage_clock = (useMySwal, findOne, version, formDataClock) => {
        var _CHILD = _GET_CLOCK_STATE(findOne)

        formDataClock.set('fun0Id', currentItem.id);
        if (useMySwal) {
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
        }

        if (_CHILD.id) {
            FUN_SERVICE.update_clock(_CHILD.id, formDataClock)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                        props.requestUpdate(currentItem.id)
                    } else {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                });
        }
        else {
            FUN_SERVICE.create_clock(formDataClock)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                        props.requestUpdate(currentItem.id)
                    } else {
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                });
        }

    }
    // ***************************** CLOCKS **************************** //
    const viaTime = () => {
        const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
        const evaDefaultTime = _fun_0_type_time[currentItem.type] ?? 45;
        let ldfTime = _GET_CLOCK_STATE(5).date_start;
        let actaTime = _GET_CLOCK_STATE(30).date_start;
        let acta2Time = _GET_CLOCK_STATE(49).date_start;
        let corrTime = _GET_CLOCK_STATE(35).date_start;

        let time = 1;

        if (ldfTime && actaTime) {
            if (acta2Time && corrTime) {
                time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime) - dateParser_dateDiff(acta2Time, corrTime);
            } else {
                time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime);
            }
        }
        if (time < 1) time = 1;
        return time;
    }
    const clocks = [
        { title: 'ACTA DE VIABILIDAD' },
        { state: 61, name: 'Acto de Tramite de Licencia (Viabilidad)', desc: "Tramite de viabilidad Licencia", limit: [[49, 35], viaTime()], },
        { state: 55, name: 'Citación (Viabilidad)', desc: "Citación para el tramite de viabilidad de Licencia", limit: [61, 5], info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'] },
        { state: 56, name: "Notificación (Viabilidad)", desc: "Se le notifica al solicitante del Tramite de viabilidad Licencia", limit: [55, 5], info: ['PERSONAL', 'ELECTRÓNICO',] },
        { state: 57, name: "Notificación por aviso (Viabilidad)", desc: "El solicitante NO se presento para elTramite de viabilidad Licencia, fue informado por otros medios", limit: [55, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'] },
        { title: 'PAGOS' },
        { state: 62, name: 'Expensas Variables', desc: "Pago de Expensas Variables", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: conOA() },
        { state: 63, name: namePayment, desc: "Pago de Impuestos Municipales", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: conOA() },
        { state: 64, name: 'Estampilla PRO-UIS', desc: "Pago de Estampilla PRO-UIS", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'] },
        { state: 65, name: 'Deberes Urbanísticos', desc: "Pago de Deberes Urbanísticos", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: !conGI },
        { state: 69, name: 'Radicación Pagos', desc: "Radicación de todos los pagos requeridos", limit: [[56, 57], 30] },
        { title: 'RESOLUCIÓN' },
        { state: 70, name: "Acto Administrativo / Resolución ", desc: "Expedición Acto Administrativo ", limit: [69, 5], info: ['OTORGA', 'NIEGA', 'DESISTE', 'RECURSO', 'INTERNO', 'OTRO'] },
        { state: 71, name: "Citación (Resolución)", desc: "Citación para notificar al solicitante de Acto Administrativo", info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'] },
        { state: 72, name: "Notificación (Resolución)", desc: "Se le notifica al solicitante del Acto Administrativo", limit: [71, 5], info: ['PERSONAL', 'ELECTRÓNICO',] },
        { state: 73, name: "Notificación por aviso (Resolución)", desc: "El solicitante NO se presento para el Acto Administrativo, fue informado por otros medios", limit: [71, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'] },
        { state: 731, name: "Notificación (Planeación)", desc: "Se notificar a la oficina de planeación", limit: [71, 5], info: ['PERSONAL', 'ELECTRÓNICO', 'NA'] },
        { state: 730, name: "Renuncia de Términos", desc: "Se renuncia a los términos", },
        { title: 'RECURSO' },
        { state: 74, name: "Recurso", desc: "Se presenta recurso", limit: [71, 15], info: ['REPOSICIÓN', 'APELACIÓN', 'QUEJA'], },
        { state: 75, name: "Resuelve Recurso", desc: "El recurso se resuelve", limit: [74, 30], info: ['CONFIRMA', 'REVOCA - MODIFICA'], requiredClock: 74 },
        { state: 751, name: "Citación (Recurso)", desc: "Citación para notificar al solicitante de Recurso", limit: [74, 5], info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'], requiredClock: 74 },
        { state: 752, name: "Notificación (Recurso)", desc: "Se le notifica al solicitante del Recurso", limit: [751, 5], info: ['PERSONAL', 'ELECTRÓNICO',], requiredClock: 74 },
        { state: 733, name: "Notificación por aviso (Recurso)", desc: "El solicitante NO se presento para el Recurso, fue informado por otros medios", limit: [751, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'], requiredClock: 74 },
        { state: 76, name: "Resuelve Recurso (Planeación)", desc: "El recurso se resuelve por planeación", limit: [74, 30], info: ['CONFIRMA', 'REVOCA - MODIFICA'], requiredClock: 74 },
        { state: 761, name: "Recepción Notificación (Planeación)", desc: "Se recibe el recurso de planeación", requiredClock: 74 },
        //{ state: 80, name: "Certificación de Ejecutoria", desc: "Certificación de Ejecutoria", limit: [[72, 73], 10],},
        { title: 'LICENCIA' },
        { state: 85, name: "Publicación", desc: "Se publica la Licencia", info: ['PRENSA', 'PAGINA'] },
        { state: 99, name: "Ejecutoria - Licencia", desc: "Expedición de Licencia", limit: [[72, 73], 10], },
        { state: 98, name: "Entrega de Licencia", desc: "La licencia fue entregada oficialmente", },
    ]

    return (
        <div>
            <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="nav_expedition_3">
                <label className="app-p lead fw-normal">EXPEDICION</label>
            </legend>

            {_COMPONENT_CLOCKS()}
        </div >
    );
}
