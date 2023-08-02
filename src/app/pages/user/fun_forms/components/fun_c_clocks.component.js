
import React from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { dateParser_finalDate, regexChecker_isOA_2 } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';
import FUN_SERVICE from '../../../../services/fun.service';

const MySwal = withReactContent(Swal);
export default function FUN_C_CLOCKS(props) {
    const { swaMsg, translation, globals, currentItem, currentVersion } = props;

    const PRO_CLOCK = { state: 4, limit: 30, limit_id: null, name: 'Vencimiento Licencia Inicial', types: null, desc: 'Vencimiento Licencia Inicial' }
    const record_clocks = [
        { state: 6, limit: 5, limit_id: [5], name: 'Citación (LyDF)', types: ['PERSONAL', 'CERTIFICADO', 'ELECTRÓNICO'], desc: 'Citación del LyDF' },
        { state: 7, limit: 5, limit_id: [6], name: 'Notificación (LyDF)', types: ['PERSONAL', 'CERTIFICADO', 'ELECTRÓNICO'], desc: 'Notificación al solicitante, ya sea personal, electrónico o por correo certificado' },
        { state: 8, limit: 10, limit_id: [6], name: 'Notificación por aviso (LyDF)', types: ['CERTIFICADO', 'ELECTRÓNICO'], desc: 'Notificación por medio de Aviso' },
    ]

    // ***************************  DATA GETTERS *********************** //
    let _GET_CLOCK = () => {
        var _CHILD = currentItem ? currentItem.fun_clocks : [];
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
            tramite: "",
            tipo: "",
            m_urb: "",
            m_sub: "",
            m_lic: "",
            area: "",
            description: "",
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
                _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                _CHILD_VARS.usos = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                _CHILD_VARS.area = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
            }
        }
        return _CHILD_VARS;
    }

    let _GET_CHILD_6 = () => {
        var _CHILD = currentItem.fun_6s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
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
    // *************************  DATA CONVERTERS ********************** //
    let _GET_CLOCK_STATE = (_state) => {
        var _CLOCK = _GET_CLOCK();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }
    let get_clockExistIcon = (state) => {
        var _CHILD = _GET_CLOCK_STATE(state);
        if (_CHILD) return <i class="far fa-check-circle text-success"></i>
        return <i class="far fa-dot-circle"></i>
    }

    let get_map_clock = (_array) => {
        let clock = false;
        for (let i = 0; i < _array.length; i++) {
            const element = _GET_CLOCK_STATE(_array[i]);
            if (element.date_start) clock = element
        }
        return clock
    }
    // ******************************* JSX ***************************** // 
    let _CHILD_6_SELECT = () => {
        let _LIST = _GET_CHILD_6();
        let _COMPONENT = [];
        for (var i = 0; i < _LIST.length; i++) {
            _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
        }
        return <>{_COMPONENT}</>
    }

    let _COMPONENT_CLOCK_LIST = () => {
        return record_clocks.map((value, i) => <>
            {value.alert ? <div className="row mx-2 my-0 text-center">
                <div className="col border border-danger">
                    <label className="fw-bold mt-2 "> {value.alert}</label>
                </div>
            </div>

                : <div className="row mx-2 my-0">
                    <div className="col-3 border">
                        <label className="fw-bold mt-2">{value.state ? get_clockExistIcon(value.state) : ''} {value.name}</label>
                    </div>
                    <div className="col border py-1">
                        {value.state ?
                            <input type="date" class="form-control" id={'clock_acta_date_' + i} max="2100-01-01"
                                defaultValue={_GET_CLOCK_STATE(value.state).date_start ?? ''} onBlur={(e) => save_clock2(value, i)} />
                            : ''}
                    </div>
                    <div className="col text-center border py-1">
                        {value.limit != undefined
                            ? dateParser_finalDate(get_map_clock(value.limit_id).date_start, value.limit)
                            : ''}
                    </div>
                    <div className="col border py-1">
                        {value.types
                            ? <select className='form-select' id={'clock_acta_res_' + i} defaultValue={_GET_CLOCK_STATE(value.state).resolver_context ?? 0}
                                onChange={(e) => save_clock2(value, i)}>
                                {value.types.map(value => <option>{value}</option>)}
                            </select>
                            : ''}
                    </div>

                    <div className="col border py-1">
                        <select className='form-select' id={'clock_acta_id6_' + i} defaultValue={_GET_CLOCK_STATE(value.state).resolver_id6 ?? 0}
                            onChange={(e) => save_clock2(value, i)}>
                            <option value="-1">APORTADO FISICAMENTE</option>
                            <option value="0">SIN DOCUMENTO</option>
                            {_CHILD_6_SELECT()}
                        </select>
                    </div>

                    <div className="col-1 border py-1">
                        {(_GET_CLOCK_STATE(value.state).resolver_id6 ?? 0) > 0
                            ?
                            <VIZUALIZER url={_FIND_6(_GET_CLOCK_STATE(value.state).resolver_id6).path + "/" + _FIND_6(_GET_CLOCK_STATE(value.state).resolver_id6).filename} apipath={'/files/'}
                            />
                            : ""}
                    </div>
                </div>}


        </>)
    }

    let _COMPONENT_CLOCK_PRO = () => {
        return <div className="row mx-2 my-0">
        <div className="col-3 border">
            <label className="fw-bold mt-2">{get_clockExistIcon(4)} Vencimiento Licencia Inicial</label>
        </div>
        <div className="col border py-1">
        <input type="date" class="form-control" id={'clock_acta_date_' + 'pro'} max="2100-01-01"
                    defaultValue={_GET_CLOCK_STATE(4).date_start ?? ''} onBlur={(e) => save_clock2(PRO_CLOCK, 'pro')} />
        </div>
        <div className="col text-center border py-1">
          {dateParser_finalDate(get_map_clock(5).date_start, 30)}
        </div>
        <div className="col border py-1">
           
        </div>

        <div className="col border py-1">
            <select className='form-select' id={'clock_acta_id6_' + 'pro'} defaultValue={_GET_CLOCK_STATE(4).resolver_id6 ?? 0}
                onChange={(e) => save_clock2(PRO_CLOCK, 'pro')}>
                <option value="-1">APORTADO FISICAMENTE</option>
                <option value="0">SIN DOCUMENTO</option>
                {_CHILD_6_SELECT()}
            </select>
        </div>

        <div className="col-1 border py-1">
            {(_GET_CLOCK_STATE(4).resolver_id6 ?? 0) > 0
                ?
                <VIZUALIZER url={_FIND_6(_GET_CLOCK_STATE(4).resolver_id6).path + "/" + _FIND_6(_GET_CLOCK_STATE(4).resolver_id6).filename} apipath={'/files/'}
                />
                : ""}
        </div>
    </div>
    }

    let _BODY_COMPONENT = () => {
        return <>
            <div className="row mx-2 bg-info text-white">
                <div className="col-3 text-center">
                    <label className="fw-bold mt-1">EVENTO</label>
                </div>
                <div className="col text-center">
                    <label className="fw-bold mt-1">FECHA EVENTO</label>
                </div>
                <div className="col text-center">
                    <label className="fw-bold mt-1">FECHA LIMITE</label>
                </div>
                <div className="col text-center">
                    <label className="fw-bold mt-1">FORMA</label>
                </div>
                <div className="col text-center">
                    <label className="fw-bold mt-1">ANEXO</label>
                </div>
                <div className="col-1 text-center">
                </div>
            </div>

       
        {regexChecker_isOA_2(_GET_CHILD_1()) ? _COMPONENT_CLOCK_PRO(): null}

            <div className="row mx-2 my-0">
                <div className="col-3 border">
                    <label className="fw-bold mt-2 ">{get_clockExistIcon(5)} LyDF</label>
                </div>
                <div className="col border py-1 text-center">
                    <label className="fw-bold mt-2 ">{_GET_CLOCK_STATE(5).date_start ?? <label className='text-danger'>NO ESTA EN LyDF</label>}</label>
                </div>
                <div className="col text-center border py-1">
                {regexChecker_isOA_2(_GET_CHILD_1()) ? dateParser_finalDate(_GET_CLOCK_STATE(4).date_start, -30) : null}
                </div>
                <div className="col border py-1">
                </div>

                <div className="col border py-1">
                </div>

                <div className="col-1 border py-1">
                    {(_GET_CLOCK_STATE(5).resolver_id6 ?? 0) > 0
                        ?
                        <VIZUALIZER url={_FIND_6(_GET_CLOCK_STATE(5).resolver_id6).path + "/" + _FIND_6(_GET_CLOCK_STATE(5).resolver_id6).filename} apipath={'/files/'}
                        />
                        : ""}
                </div>
            </div>

            {_COMPONENT_CLOCK_LIST()}
        </>
    }
   

    // ******************************* APIS **************************** // 
    let save_clock2 = (value, i) => {
        var formDataClock = new FormData();

        let date_start = document.getElementById("clock_acta_date_" + i).value;
        let resolver_context = document.getElementById("clock_acta_res_" + i) ? document.getElementById("clock_acta_res_" + i).value : false;
        let resolver_id6 = document.getElementById("clock_acta_id6_" + i).value;

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
        var _CHILD = _GET_CLOCK_STATE(findOne);

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

    return <>
        {_BODY_COMPONENT()}
    </>;
}
