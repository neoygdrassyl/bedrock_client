import moment from 'moment';
import DataTable from 'react-data-table-component';
import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import FUN_SERVICE from "../../../../services/fun.service"
import FUN_CLOCKS_EMAILS from './fun_clocks_email.component';
import { dateParser_finalDate, dateParser_timePassed } from '../../../../components/customClasses/typeParse';
import { MDBBtn, MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane, MDBTooltip } from 'mdb-react-ui-kit';
import VIZUALIZER from '../../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);

class FUN_CLOCKS_NEGATIVE extends Component {
    constructor(props) {
        super(props);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.manage_clock = this.manage_clock.bind(this);
        this.state = {
            fillActive: null,
        };
    }

    requestUpdate(id) {
        this.props.requestUpdate(id)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            var _ITEM = this.state.edit;
            document.getElementById("f_clock_edit_1").value = _ITEM.resolver_sattus ? _ITEM.resolver_sattus : 0;
            document.getElementById("f_clock_edit_2").value = _ITEM.resolver_id6 ? _ITEM.resolver_id6 : 0;
            document.getElementById("f_clock_edit_3").value = _ITEM.resolver_context;
            document.getElementById("f_clock_edit_4").value = _ITEM.date_start ? _ITEM.date_start : moment().format('YYYY-MM-DD');
        }
        // Verificar si hay nuevos datos para ejecutar la autoguardado
        if (this.props.currentItem !== prevProps.currentItem) {
            this.autoSaveMissingStartClock();
        }
    }

    componentDidMount() {
        this.setState({ fillActive: this.props.currentItem.state });
        this.autoSaveMissingStartClock();
    }

    // --- DATA GETTERS MOVIDOS A METODOS DE CLASE ---
    get_child_clock() {
        var _CHILD = this.props.currentItem.fun_clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    get_clock_state_version(_state, _version) {
        var _CLOCK = this.get_child_clock();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
        }
        return false;
    }

    // --- LOGICA DE AUTOGUARDADO ---
    autoSaveMissingStartClock() {
        const versionsToCheck = [-1, -2, -3, -4, -5, -6]; // Versiones posibles de desistimiento

        versionsToCheck.forEach(version => {
            let clock50 = this.get_clock_state_version(-50, version);
            let clock5 = this.get_clock_state_version(-5, version);

            // SI EXISTE -5 (Citación) PERO NO EXISTE -50 (Inicio Desistimiento)
            if (clock5 && !clock50) {
                // Preparamos la data para guardar automaticamente
                let formDataClock = new FormData();
                
                // Usamos la fecha del -5 como pidió el usuario
                formDataClock.set('date_start', clock5.date_start); 
                formDataClock.set('name', "INICIO DEL PROCESO DE DESISTIMIENTO");
                // Usamos una descripción generica o copiamos la del -5
                formDataClock.set('desc', "Inicio de proceso generado automáticamente desde Citación."); 
                formDataClock.set('state', -50);
                formDataClock.set('version', version);
                formDataClock.set('fun0Id', this.props.currentItem.id);

                // Llamamos a manage_clock en modo silencioso (false)
                this.manage_clock(false, -50, version, formDataClock);
            }
        });
    }

    // --- API ACTION ---
    manage_clock(useMySwal, state, version, formDataClock) {
        const { swaMsg, currentItem } = this.props;
        var _CHILD = this.get_clock_state_version(state, version);

        if (useMySwal) {
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
        }

        const handleResponse = (response) => {
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
                this.props.requestUpdate(currentItem.id);
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
        };

        const handleError = (e) => {
            console.log(e);
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            }
        };

        if (_CHILD && _CHILD.id) {
            FUN_SERVICE.update_clock(_CHILD.id, formDataClock)
                .then(handleResponse)
                .catch(handleError);
        } else {
            FUN_SERVICE.create_clock(formDataClock)
                .then(handleResponse)
                .catch(handleError);
        }
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { fillActive } = this.state;

        const ClockDictionary = {
            '-3': {
                "name": 'RECORDATORIO INICIAL',
                "desc": 'Se enviá un email al solicitante 20 días antes de iniciar el proceso de desistimiento.',
            },
            '-4': {
                "name": 'RECORDATORIO RATIFICACIÓN',
                "desc": 'Se enviá un email al solicitante 10 días antes de iniciar el proceso de desistimiento.',
            },
            '-50': {
                "name": 'INICIO DEL PROCESO DE DESISTIMIENTO',
                "desc": 'Se da inicio formal al proceso de desistimiento. A partir de esta fecha corren los tiempos.',
            },
            "-6": {
                "name": "CREACIÓN DE RESOLUCIÓN",
                "desc": "Notificación mediante email",
            },
            "-5": {
                "name": 'CITACIÓN',
                "desc": 'Se Inicia proceso de desistimiento',
            },
            "-7": {
                "name": "NOTIFICACIÓN",
                "desc": "El responsable de la solicitud es contactado de forma personal, electrónica or certificada",
            },
            "-8": {
                "name": "NOTIFICACIÓN POR AVISO",
                "desc": "El solicitante no se presento y se le informo mediante aviso",
            },
            "-10": {
                "name": "INTERPONER RECURSO",
                "desc": "El Solicitante presenta o no el recurso para determinar si continua con el proceso",
                archive: true,
            },
            "-11": { // DEPRECATED
                "name": "RECURSO NO INTERPUESTO",
                "desc": "El Solicitante no interpuso el recurso, la solicitud es archivada",
                archive: true,
            },
            "-17": {
                "name": "RESOLUCIÓN FRENTE A RECURSO",
                "desc": "La curaduria da respuesta al recurso interpuesto y determina si la solicitud continua su curso o si es enviado al archivo",
                archive: true,
            },
            "-18": { // DEPRECATED
                "name": "DECLARA: CONTINUA",
                "desc": "La curaduria declara que continuara con el proceso",
            },
            "-19": { // DEPRECATED
                "name": "DECLARA: NO CONTINUA",
                "desc": "La curaduria declara que NO continuara con el proceso, la solicitud se archiva",
                archive: true,
            },
            "-20": {
                "name": "CITACIÓN (2° Vez)",
                "desc": "Se cita al solicitante para informarle de la decision (2° Vez)",
            },
            "-22": {
                "name": "NOTIFICACIÓN (2° Vez)",
                "desc": "El responsable de la solicitud es contactado de forma personal, electrónica or certificada (2° Vez)",
            },
            "-21": {
                "name": "NOTIFICACIÓN POR AVISO (2° Vez)",
                "desc": "El solicitante no se presento y se le informo mediante aviso (2° Vez)",
            },
            "-30": {
                "name": "FINALIZACIÓN",
                "desc": "El proceso de desistimiento ha finalizado oficialmente",
                end: true,
                archive: true,
            }
        }

        const NegativePRocessTitle = {
            '-1': 'INCOMPLETO',
            '-2': 'FALTA VALLA INFORMATIVA',
            '-3': 'NO CUMPLE ACTA CORRECCIONES',
            '-4': 'NO PAGA EXPENSAS',
            '-5': 'VOLUNTARIO',
            // '-6': 'NEGADA',
        }
        const resolveStatusIcon = {
            '-1': <i class="far fa-dot-circle text-muted" style={{ fontSize: '150%' }}></i>,
            '0': <i class="far fa-times-circle text-danger" style={{ fontSize: '150%' }}></i>,
            '1': <i class="far fa-check-circle text-success" style={{ fontSize: '150%' }}></i>,
            '2': <i class="fas fa-clock text-primary" style={{ fontSize: '150%' }}></i>,
        }

        // DATA GETTERS
        // Usamos los métodos de clase ahora, pero mantenemos alias locales si es necesario para compatibilidad con el resto del código en render
        let _GET_CHILD_CLOCK = () => this.get_child_clock();
        
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
        // DATA CONVERTERS
        let _GET_CLOCK_STATE_VERSION = (_state, _version) => this.get_clock_state_version(_state, _version);

        let _GET_CLOCK_STATE = (_state) => {
            var _CLOCKS = _GET_CHILD_CLOCK();
            for (var i = 0; i < _CLOCKS.length; i++) {
                if (_CLOCKS[i].state == _state) return _CLOCKS[i];
            }
            return false;
        }

        let _CHECK_IF_PROCESS = () => {
            if ((_GET_CLOCK_STATE_VERSION(-50, -1) || _GET_CLOCK_STATE_VERSION(-5, -1)) && !_GET_CLOCK_STATE_VERSION(-30, -1)) return true;
            if ((_GET_CLOCK_STATE_VERSION(-50, -2) || _GET_CLOCK_STATE_VERSION(-5, -2)) && !_GET_CLOCK_STATE_VERSION(-30, -2)) return true;
            if ((_GET_CLOCK_STATE_VERSION(-50, -3) || _GET_CLOCK_STATE_VERSION(-5, -3)) && !_GET_CLOCK_STATE_VERSION(-30, -3)) return true;
            if ((_GET_CLOCK_STATE_VERSION(-50, -4) || _GET_CLOCK_STATE_VERSION(-5, -4)) && !_GET_CLOCK_STATE_VERSION(-30, -4)) return true;
            if ((_GET_CLOCK_STATE_VERSION(-50, -5) || _GET_CLOCK_STATE_VERSION(-5, -5)) && !_GET_CLOCK_STATE_VERSION(-30, -5)) return true;
            return false;
        }
        let _CHECK_IF_PROCESS_ENDED = (version) => {
            if ((_GET_CLOCK_STATE_VERSION(-50, version) || _GET_CLOCK_STATE_VERSION(-5, version)) && _GET_CLOCK_STATE_VERSION(-30, version)) return true;
            return false;
        }
        let _GET_DEFAULT_PROCESS = () => {
            let OngoingProcess = _GET_ONGOING_PROCESS();
            let _clock = _GET_CLOCK_STATE_VERSION(-5, OngoingProcess)
            const defaultProcess = {
                "-5": { "name": _clock.name, "desc": _clock.desc, "date_start": _clock.date_start, "date_end": '' },
                "-6": { "name": "ENVIO DE EMAIL", "desc": "Notificacion mediante email", "date_start": '', "date_end": _clock.date_start },
                "-7": { "name": "EL SOLICITANTE SE PRESENTA", "desc": "El responsable de la solicitud se ha presentado", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 5) },
                "-8": { "name": "NOTIFICACION POR AVISO", "desc": "El solicitante no se presento y se le informo mediante aviso (email / Mensajeria)", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 5) },
                "-10": { "name": "INTERPONER RECURSO", "desc": "El Solicitante presenta Recurso", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 15) },
                "-11": { "name": "RECURSO NO INTERPONIDO", "desc": "El Solicitante no interpuso el recurso, la solicititud es archivada", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 15) },
                "-17": { "name": "LA CURADURIA DA RESPUESTA", "desc": "La curaduria da respuesta al recurso interponido", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 45) },
                "-18": { "name": "DECLARA: CONTINUA", "desc": "La curaduria declara que continuara con el proceso", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 45) },
                "-19": { "name": "DECLARA: NO CONTINUA", "desc": "La curaduria declara que NO continuara con el proceso, la solicitud se archiva", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 45) },
                "-20": { "name": "CITACION PARA NOTIFICACION PERSONA (2° Vez)", "desc": "Se cita al solicitante para informarle de la secisicion (2° Vez)", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 45) },
                "-21": { "name": "NOTIFICACION POR AVISO (2° Vez)", "desc": "Notificacion mediante email (2° Vez)", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 45) },
                "-22": { "name": "EL SOLICITANTE SE PRESENTA (2° Vez)", "desc": "El responsable de la solicitud se ha presentado (2° Vez)", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 50) },
                "-30": { "name": "FINALIZACION", "desc": "El proceso de desistimiento ha finalizado oficialemnte", "date_start": '', "date_end": dateParser_finalDate(_clock.date_start, 50) }
            }

            return defaultProcess
        }
        let _GET_ONGOING_PROCESS = () => {
            let OngoingProcess = 0;
            if ((_GET_CLOCK_STATE_VERSION(-50, -1) || _GET_CLOCK_STATE_VERSION(-5, -1)) && !_GET_CLOCK_STATE_VERSION(-30, -1)) OngoingProcess = -1;
            if ((_GET_CLOCK_STATE_VERSION(-50, -2) || _GET_CLOCK_STATE_VERSION(-5, -2)) && !_GET_CLOCK_STATE_VERSION(-30, -2)) OngoingProcess = -2;
            if ((_GET_CLOCK_STATE_VERSION(-50, -3) || _GET_CLOCK_STATE_VERSION(-5, -3)) && !_GET_CLOCK_STATE_VERSION(-30, -3)) OngoingProcess = -3;
            if ((_GET_CLOCK_STATE_VERSION(-50, -4) || _GET_CLOCK_STATE_VERSION(-5, -4)) && !_GET_CLOCK_STATE_VERSION(-30, -4)) OngoingProcess = -4;
            if ((_GET_CLOCK_STATE_VERSION(-50, -5) || _GET_CLOCK_STATE_VERSION(-5, -5)) && !_GET_CLOCK_STATE_VERSION(-30, -5)) OngoingProcess = -5;
            return OngoingProcess;
        }
        let _CHILD_6_SELECT = () => {
            let _LIST = _GET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
            return <>{_COMPONENT}</>
        }

        let _GET_LIMITE_DATE = (state, version) => {
            let clock;
            if (state == '-3') {
                if (version == '-1') {
                    clock = _GET_CLOCK_STATE(3);
                    if (clock) return dateParser_finalDate(clock.date_start, 10);
                    return ''
                }
                if (version == '-3') {
                    clock = _GET_CLOCK_STATE(30);
                    if (clock) return dateParser_finalDate(clock.date_start, 10);
                    return ''
                }
                if (version == '-4') {
                    clock = _GET_CLOCK_STATE(61);
                    if (clock) return dateParser_finalDate(clock.date_start, 10);
                    return ''
                }
            }
            if (state == '-4') {
                if (version == '-1') {
                    clock = _GET_CLOCK_STATE(3);
                    if (clock) return dateParser_finalDate(clock.date_start, 20);
                    return ''
                }
                if (version == '-3') {
                    clock = _GET_CLOCK_STATE(30);
                    if (clock) return dateParser_finalDate(clock.date_start, 20);
                    return ''
                }
            }

            let startClock = _GET_CLOCK_STATE_VERSION('-50', version) || _GET_CLOCK_STATE_VERSION('-5', version);
            if (!startClock) return '';

            if (state == '-6' || state == '-5') {
                return dateParser_finalDate(startClock.date_start, 5);
            }
            if (state == '-7' || state == '-8') {
                clock = _GET_CLOCK_STATE_VERSION('-6', version);
                if (clock) return dateParser_finalDate(clock.date_start, 5);
                return ''
            }
            if (state == '-10' || state == '-11') {
                clock = _GET_CLOCK_STATE_VERSION('-7', version);
                if (!clock) clock = _GET_CLOCK_STATE_VERSION('-8', version);
                if (clock) return dateParser_finalDate(clock.date_start, 10);
                return ''
            }
            if (state == '-18' || state == '-19') {
                clock = _GET_CLOCK_STATE_VERSION('-10', version);
                if (clock) return dateParser_finalDate(clock.date_start, 45);
                return ''
            }
            if (state == '-21' || state == '-22') {
                clock = _GET_CLOCK_STATE_VERSION('-20', version);
                if (clock) return dateParser_finalDate(clock.date_start, 5);
                return ''
            }
            return '';
        }
        // JSX COMPONENTS
        let _NEW_PROCESS = () => {
            return <>
                <form id="fun_clocks_negative_new" onSubmit={new_process}>
                    <div className="row">
                        <div className="col">
                            Motivo de Desistimiento
                            <select className='form-select' id="fun_cloclneg_1" required>
                                <option value="-1">RADICACIÓN INCOMPLETA</option>
                                <option value="-2">FALTA VALLA INFORMATIVA</option>
                                <option value="-3">NO CUMPLE CORRECCIONES DEL ACTA</option>
                                <option value="-4">NO PAGO EXPENSAS VARIABLES</option>
                                <option value="-5">DESISTIMIENTO VOLUNTARIO</option>
                                <option value="-6">NEGADA</option>
                            </select>
                        </div>
                        <div className="col">
                            Fecha de Evento
                            <input type="date" class="form-control" max="2100-01-01" id="fun_cloclneg_2"
                                defaultValue={moment().format('YYYY-MM-DD')} required />
                        </div>
                        <div className="col">
                            Profesional que abre proceso
                            <input type="text" class="form-control" id="fun_cloclneg_3" disabled
                                defaultValue={window.user.name + " " + window.user.surname} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col text-center my-2">
                            <button className="btn btn-danger" ><i class="far fa-times-circle"></i> ABRIR PROCESO </button>
                        </div>
                    </div>
                </form>
            </>
        }
        let _CANCEL_PROCESS = () => {
            return <>
                <form id="fun_clocks_negative_new" onSubmit={cancel_process}>
                    <div className="row">
                        <div className="col">
                            NUEVO ESTADO
                            <select className='form-select' id="fun_clock_cancel_1" required>
                                <option value="1">RADICACIÓN</option>
                                <option value="5">LEGAL Y DEBIDA FORMA</option>
                            </select>
                        </div>
                        <div className="col">
                            Fecha de Evento
                            <input type="date" class="form-control" max="2100-01-01" id="fun_clock_cancel_2"
                                defaultValue={moment().format('YYYY-MM-DD')} required />
                        </div>
                        <div className="col">
                            Profesional realiza cambio
                            <input type="text" class="form-control" id="fun_clock_cancel_3" disabled
                                defaultValue={window.user.name + " " + window.user.surname} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col text-center my-2">
                            <button className="btn btn-info" ><i class="far fa-times-circle"></i> CANCELAR PROCESO </button>
                        </div>
                    </div>
                </form>
            </>
        }
        const ExpandedComponent = ({ data }) => {
            let preData = <pre>{JSON.stringify(data, null, 2)}</pre>;
            let state = data.state
            return <>
                <div className="row mb-1">
                    <div className="col">
                        <label>Evento</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <input type="text" class="form-control" disabled
                                defaultValue={data.name} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Resultado evento</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <select className='form-select' id={"f_clock_next_1_" + state} defaultValue={data.resolver_sattus} >
                                <option value="-1">SIN DEFINIR</option>
                                <option value="2">ESPERANDO RESULTADO</option>
                                <option value="1">SE CUMPLIO EXISTOSAMENTE</option>
                                <option value="0">NO SE CUMPLIO</option>
                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <label>Fecha Evento</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" max="2100-01-01" id={"f_clock_next_2_" + state}
                                defaultValue={data.date_start ?? moment().format('YYYY-MM-DD')} required />
                        </div>
                    </div>
                    <div className="col">
                        <label>Soporte: Relacionar Documento </label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id={"f_clock_next_3_" + state} defaultValue={data.resolver_id6}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-12">
                        <label>Contexto u Observaciones al resultado de la acción</label>
                        <textarea class="form-control" id={"f_clock_next_4_" + state} rows="2"
                            defaultValue={data.desc}></textarea>
                    </div>
                </div>


                <div className="row mb-3 text-center">
                    <div className="col">
                        <button className="btn btn-success my-3" onClick={() => save_clock(data)}><i class="far fa-share-square"></i> GUARDAR CAMBIOS </button>
                    </div>
                    {data.end && data.id ?
                       !_GET_CLOCK_STATE_VERSION(200, data.version) ?
                        <div className="col">
                            <button className="btn btn-primary my-3" onClick={() => update_fun_0_atFinalProcess(true, data.version)}><i class="fas fa-angle-double-right"></i> SALVAR PROCESO </button>
                            <p>El proceso continua su curso normal</p>
                        </div>
                        : ''
                        : ''}

                    {data.archive && data.id ?
                        <>
                            {!_GET_CLOCK_STATE_VERSION(200, data.version)
                                ?
                                <div className="col">
                                    <button className="btn btn-danger my-3" onClick={() => close(data.version)}><i class="fas fa-times"></i> CERRAR PROCESO </button>
                                    <p>El proceso NO fue subsanado y se finaliza</p>
                                </div>
                                : ''
                            }

                            {_GET_CLOCK_STATE_VERSION(200, data.version)
                                ?
                                <div className="col">
                                    <button className="btn btn-danger my-3" onClick={() => archive(data.version)}><i class="fas fa-times"></i> ARCHIVAR PROCESO </button>
                                    <p>El proceso NO fue subsanado y se archiva (no se podrá editar)</p>
                                </div>
                                : ''
                            }

                        </>

                        : ''}
                </div>



                {window.user.id == 1 ? preData : ''}
            </>

        };

        let _MANAGE_NEGATIVE_PROCESS = (NegativeState) => {
            let load = false;
            let edit = (currentItem.state == Number(NegativeState) - 100);

            const columns = [
                {
                    name: <label className="text-center">EVENTO</label>,
                    selector: 'name',
                    sortable: true,
                    filterable: true,
                    minWidth: '250px',
                    cell: row => <label>{row.name}</label>
                },
                {
                    name: <label className="text-center">OBSERVACIONES</label>,
                    minWidth: '330px',
                    cell: row => <label>{(row.desc)}</label>
                },
                {
                    name: <label className="text-center">FECHA EVENTO</label>,
                    selector: 'date_start',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{(row.date_start)}</label>
                },
                {
                    name: <label className="text-center">FECHA LIMITE</label>,
                    selector: 'date_start',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{_GET_LIMITE_DATE(row.state, row.version)}</label>
                },
                {
                    name: <label className="text-center">RESULTADO</label>,
                    center: true,
                    cell: row => <label>{resolveStatusIcon[row.resolver_sattus ?? '-1']}</label>
                },
                {
                    name: <label className="text-center">SOPORTE DOCUMENTO</label>,
                    center: true,
                    cell: row => {
                        let id6 = row.resolver_id6;
                        let id6Object = _FIND_6(id6);
                        if (id6Object.id > 0) return <VIZUALIZER url={id6Object.path + "/" + id6Object.filename} apipath={'/files/'}
                            icon='fas fa-search'
                            iconWrapper='btn btn-sm btn-info m-0 p-1 shadow-none'
                            iconStyle={{ fontSize: '150%' }} />
                        return ''
                    }
                },
            ]
            var stepsToCheck = ['-50', '-6', '-5', , '-7', '-8', '-10', '-17', '-20', '-21', '-22', '-30'];
            if (NegativeState == '-1') { stepsToCheck.unshift('-4'); stepsToCheck.unshift('-3') }
            if (NegativeState == '-3') { stepsToCheck.unshift('-4'); stepsToCheck.unshift('-3') }
            if (NegativeState == '-4') { stepsToCheck.unshift('-4'); }
            let EVENT_CLOCKS = [];

            let startClockLegacy = _GET_CLOCK_STATE_VERSION('-5', NegativeState);

            stepsToCheck.map(value => {
                let newClock = {
                    id: null,
                    name: null,
                    desc: null,
                    date_start: null,
                    state: value,
                    fun0Id: currentItem.id,
                    version: NegativeState,
                    resolver_id6: null,
                    resolver_sattus: null,
                    resolver_context: null,
                    disabled: (value == '-4' || value == '-3') ? false : value == '-30' && currentItem.state == 200 && _CHECK_IF_PROCESS_ENDED(NegativeState) ? false : !edit,
                }
                let clock = _GET_CLOCK_STATE_VERSION(value, NegativeState);

                // Handle legacy processes that started with -5
                if (value == '-50' && !clock && startClockLegacy) {
                    clock = { ...startClockLegacy, id: null };
                    // Ya no deshabilitamos, pero esta visualización es solo temporal
                    // hasta que el autoSaveMissingStartClock guarde el dato real en DB
                }

                newClock = { ...newClock, ...ClockDictionary[value] };
                newClock = { ...newClock, ...clock };

                newClock.id = clock.id ?? null
                newClock.name = ClockDictionary[value].name
                newClock.desc = clock.desc ?? ClockDictionary[value].desc
                newClock.date_start = clock.date_start ?? ClockDictionary[value].date_start
                newClock.resolver_id6 = clock.resolver_id6 ?? ClockDictionary[value].resolver_id6 ?? null
                newClock.resolver_sattus = clock.resolver_sattus ?? ClockDictionary[value].resolver_sattus ?? null
                newClock.resolver_context = clock.resolver_context ?? ClockDictionary[value].resolver_context ?? null

                EVENT_CLOCKS.push(newClock)
            })

            load = true;
            let TableTitle = () => {
                let op = _GET_ONGOING_PROCESS();
                let finished = _CHECK_IF_PROCESS_ENDED(NegativeState);
                let ogl = op == NegativeState ? <label className='fw-bold text-danger'>(EN EJECUCIÓN)</label> :
                    finished ? <label className='fw-bold text-success'>FINALIZADO</label> : '';
                return <label>DESISTIDO: {NegativePRocessTitle[NegativeState]} {ogl}</label>
            }
            return <>
                <DataTable
                    title={TableTitle()}
                    striped="true"
                    className="data-table-component"
                    highlightOnHover

                    columns={columns}
                    data={EVENT_CLOCKS}
                    noDataComponent="NO HAY EVENTOS"

                    dense

                    load={load}
                    progressPending={!load}
                    progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                    expandableRows={true}
                    expandableRowsComponent={ExpandedComponent}
                    expandableRowDisabled={row => row.disabled}
                />
            </>
        }
        // APIS & FUNCTIONS
        var formData = new FormData();
        var formDataClock = new FormData();

        let new_process = (e) => {
            e.preventDefault();
            let process = document.getElementById('fun_cloclneg_1').value;
            let worker = document.getElementById('fun_cloclneg_3').value;
            let date = document.getElementById('fun_cloclneg_2').value;

            let alreadyExist = _GET_CLOCK_STATE_VERSION(-50, process) || _GET_CLOCK_STATE_VERSION(-5, process);
            if (alreadyExist) {
                MySwal.fire({
                    title: 'ESTE PROCESO YA EXISTE',
                    text: 'Ya existe un proceso de desestimiento para este esta solicitud que coincide con el motivo de desestimiento.',
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
                return 1;
            }

            let inProcess = _CHECK_IF_PROCESS();
            if (inProcess) {
                MySwal.fire({
                    title: 'YA EXISTE UN PROCESO ABIERTO',
                    text: 'No puede haber mas de un proceso de desestimientos abierto al mismo tiempo.',
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
                return 1;
            }

            formDataClock = new FormData();

            let state = -50
            formDataClock.set('date_start', date);
            formDataClock.set('name', "INICIO DEL PROCESO DE DESISTIMIENTO");
            formDataClock.set('desc', "Inicio de proceso abierto por: " + worker);
            formDataClock.set('state', state);
            formDataClock.set('version', process);
            formDataClock.set('fun0Id', currentItem.id);

            this.manage_clock(true, state, process, formDataClock);

            formData = new FormData();
            let new_state = Number(process) - 100;
            formData.set('state', new_state);
            manage_fun_0(false, formData)
        }
        let cancel_process = (e) => {
            e.preventDefault();
            formData = new FormData();
            let new_state = document.getElementById('fun_clock_cancel_1').value;
            formData.set('state', new_state);
            manage_fun_0(true, formData)

        }

        let save_clock = (data) => {
            formDataClock = new FormData();
            let state = data.state;
            formDataClock.set('name', data.name);

            let resolver_sattus = document.getElementById("f_clock_next_1_" + state).value;
            formDataClock.set('resolver_sattus', resolver_sattus);

            let date_start = document.getElementById("f_clock_next_2_" + state).value;
            formDataClock.set('date_start', date_start);

            let resolver_id6 = document.getElementById("f_clock_next_3_" + state).value;
            formDataClock.set('resolver_id6', resolver_id6);

            let desc = document.getElementById("f_clock_next_4_" + state).value;
            formDataClock.set('desc', desc);

            formDataClock.set('state', data.state);
            formDataClock.set('version', data.version);
            formDataClock.set('fun0Id', currentItem.id);


            this.manage_clock(true, data.state, data.version, formDataClock);
        }
        let save_close = (version) => {
            formDataClock = new FormData();

            let state = 200 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS

            let worker = window.user.name + " " + window.user.surname;
            let date = moment().format('YYYY-MM-DD');

            formDataClock.set('date_start', date);
            formDataClock.set('name', "CERRADOC");
            formDataClock.set('desc', "Fue cerrado por: " + worker);
            formDataClock.set('state', state);
            formDataClock.set('version', version);
            formDataClock.set('fun0Id', currentItem.id);

            this.manage_clock(false, state, currentVersion, formDataClock);

        }
        let save_archive = () => {
            formDataClock = new FormData();

            let state = 101 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS

            let worker = window.user.name + " " + window.user.surname;
            let date = moment().format('YYYY-MM-DD');

            formDataClock.set('date_start', date);
            formDataClock.set('name', "ARCHIVACIÓN");
            formDataClock.set('desc', "Fue enviado al archivo por: " + worker);
            formDataClock.set('state', state);
            formDataClock.set('version', currentVersion);
            formDataClock.set('fun0Id', currentItem.id);

            this.manage_clock(false, state, currentVersion, formDataClock);

        }
        let final_clock = () => {
            formDataClock = new FormData();

            let state = -30 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS
            let OngoingProcess = _GET_ONGOING_PROCESS();
            let date = moment().format('YYYY-MM-DD');
            let defaultProcess = _GET_DEFAULT_PROCESS();
            let processToCheck = defaultProcess[state];

            formDataClock.set('date_start', date);
            formDataClock.set('name', processToCheck.name);
            formDataClock.set('desc', processToCheck.desc);
            formDataClock.set('state', state);
            formDataClock.set('version', OngoingProcess);
            formDataClock.set('fun0Id', currentItem.id);

            this.manage_clock(false, state, OngoingProcess, formDataClock);
        }
        
        // NOTA: Se ha movido manage_clock a un método de clase para ser usado en el ciclo de vida.

        let update_fun_0_atFinalProcess = (useMySwal, version) => {
            formData = new FormData();
            let new_state
            if (version == '-1') new_state = 5
            if (version == '-2') new_state = 5
            if (version == '-3') new_state = 5
            if (version == '-4') new_state = 5
            if (version == '-5') new_state = 5
            formData.set('state', new_state);
            manage_fun_0(useMySwal, formData)
        }
        let manage_fun_0 = (useMySwal, formData) => {
            FUN_SERVICE.update(currentItem.id, formData)
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
                        this.props.requestRefresh();
                        this.props.requestUpdate(currentItem.id)
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
        let close = (version) => {
            MySwal.fire({
                title: "CERRA SOLICITUD",
                text: "¿Esta seguro de archivar esta Solicitud? \nSI SE PODRÁ modificar mas adelante.",
                icon: 'question',
                confirmButtonText: "CERRAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {

                    save_close(version);
                    final_clock();
                    formData = new FormData();

                    formData.set('state', 200);

                    MySwal.fire({
                        title: swaMsg.title_wait,
                        text: swaMsg.text_wait,
                        icon: 'info',
                        showConfirmButton: false,
                    });
                    FUN_SERVICE.update(currentItem.id, formData)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.requestRefresh();
                                this.props.requestUpdate(currentItem.id)
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
            });
        }
        let archive = (version) => {
            MySwal.fire({
                title: "ARCHIVAR SOLICITUD",
                text: "¿Esta seguro de archivar esta Solicitud? \nNO SE PODRÁ modificar de ninguna forma.",
                icon: 'question',
                confirmButtonText: "ARCHIVAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {

                    save_archive();
                    formData = new FormData();

                    formData.set('state', 200 + (Number(version) * -1));

                    MySwal.fire({
                        title: swaMsg.title_wait,
                        text: swaMsg.text_wait,
                        icon: 'info',
                        showConfirmButton: false,
                    });
                    FUN_SERVICE.update(currentItem.id, formData)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.requestRefresh();
                                this.props.requestUpdate(currentItem.id)
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
            });
        }
        const handleFillClick = (state) => {
            if (state === this.state.fillActive) {
                return;
            }
            this.setState({ fillActive: state });
        };
        return (
            <div className="fun_clocks_negative">

                {!_CHECK_IF_PROCESS() && currentItem.state < 100 ?
                    <>
                        {currentItem.state == -1 ?
                            <>
                                <legend className="my-2 px-3 text-uppercase Collapsible text-white" id="new_process">
                                    <label className="app-p lead text-center fw-normal text-uppercase">CANCELAR PROCESO DE DESISTIMIENTO</label>
                                </legend>
                                {_CANCEL_PROCESS()}
                            </>
                            : ""}



                        <legend className="my-2 px-3 text-uppercase bg-danger text-white" id="new_process">
                            <label className="app-p lead text-center fw-normal text-uppercase">NUEVO PROCESO DE DESESTIMIENTO</label>
                        </legend>
                        {_NEW_PROCESS()}
                    </>
                    : ""
                }

                <MDBTabs fill className='mb-3'>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleFillClick('-101')} active={this.state.fillActive == '-101'}>
                            <label className="upper-case">INCOMPLETO</label>
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleFillClick('-102')} active={this.state.fillActive == '-102'}>
                            <label className="upper-case">FALTA VALLA INFORMATIVA</label>
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleFillClick('-103')} active={this.state.fillActive == '-103'}>
                            <label className="upper-case">NO CUMPLE ACTA CORRECIONES</label>
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleFillClick('-104')} active={this.state.fillActive == '-104'}>
                            <label className="upper-case">NO PAGA EXPENSAS</label>
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleFillClick('-105')} active={this.state.fillActive == '-105'}>
                            <label className="upper-case">VOLUNTARIO</label>
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleFillClick('-106')} active={this.state.fillActive == '-106'}>
                        <label className="upper-case">NEGADA</label>
                    </MDBTabsLink>
                </MDBTabsItem>
                </MDBTabs>

                <MDBTabsContent>
                    <MDBTabsPane show={this.state.fillActive == '-101'}>
                        {_MANAGE_NEGATIVE_PROCESS('-1')}
                    </MDBTabsPane>
                    <MDBTabsPane show={this.state.fillActive == '-102'}>
                        {_MANAGE_NEGATIVE_PROCESS('-2')}
                    </MDBTabsPane>
                    <MDBTabsPane show={this.state.fillActive == '-103'}>
                        {_MANAGE_NEGATIVE_PROCESS('-3')}
                    </MDBTabsPane>
                    <MDBTabsPane show={this.state.fillActive == '-104'}>
                        {_MANAGE_NEGATIVE_PROCESS('-4')}
                    </MDBTabsPane>
                    <MDBTabsPane show={this.state.fillActive == '-105'}>
                        {_MANAGE_NEGATIVE_PROCESS('-5')}
                    </MDBTabsPane>
                    <MDBTabsPane show={this.state.fillActive == '-106'}>
                    {_MANAGE_NEGATIVE_PROCESS('-6')}
                </MDBTabsPane>
                </MDBTabsContent>

                {currentItem.state < -100 ? <>
                    <legend className="my-2 px-3 text-uppercase bg-light" id="new_process">
                        <label className="app-p lead text-center fw-normal text-uppercase">ASISTENTE DE CORREOS</label>
                    </legend>
                    <FUN_CLOCKS_EMAILS
                        translation={translation} swaMsg={swaMsg}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        attachs
                        email_types={[3, 4, 6, 8, 17, 20, 22]}
                    />

                </> : ""}
            </div>
        );
    }
}

export default FUN_CLOCKS_NEGATIVE;