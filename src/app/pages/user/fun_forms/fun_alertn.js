import React, { Component } from 'react';
import FUNService from '../../../services/fun.service'
import { MDBBtn, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from 'moment';

import FUN6DATALIST from './components/fun_6_datalist';
import FUN_VERSION_NAV from './components/fun_versionNav';
import FUN_MODULE_NAV from './components/fun_moduleNav';
import FUN_ALERT_NEIGHBOUR from './components/fun_alertNeighbour';
import FUN_SERVICE from '../../../services/fun.service';

import FUN_3_G_VIEW from './components/fun_3_g_view';
import VIZUALIZER from '../../../components/vizualizer.component';
import PQRS_Service from '../../../services/pqrs_main.service';
import FUN_SIGN_PDF from './components/fun_sign_pdf.component';
import { _MANAGE_IDS } from '../../../components/customClasses/typeParse';

import CubXVrDataService from '../../../services/cubXvr.service'

const MySwal = withReactContent(Swal);
class FUN_ALERT extends Component {
    constructor(props) {
        super(props);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.state = {
            new_neighbour: false,
            confirm: false,
            edit_type: false,
            currentItem: null,
            cb: false,
            pqrsxfun: false,
            vr: null,
            cubSelected: null,
            idCUBxVr: null
        };
    }
    requestUpdate(id) {
        this.retrieveItem(id);
    }
    componentDidMount() {
        this.retrieveItem(this.props.currentId);
    }

    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                })
                this.SET_DEFAULT_OBJECT();
                this.retrievePQRSxFUN(response.data.id_public);
                this.retrieveCubXvrs(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    retrievePQRSxFUN(id_public) {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                this.setState({
                    pqrsxfun: response.data,
                })
            })
            .catch(e => {
                console.log(e);
            });
    }
    async retrieveCubXvrs(id_public) {
        const response = await CubXVrDataService.getByFUN(id_public)
        const data = response.data.find(item => item.process === 'PUBLICIDAD COMUNICACION A VECINOS')
        
        if (data) this.setState({ vr: data.vr, cubSelected: data.cub, idCUBxVr: data.id })
    }
    SET_DEFAULT_OBJECT() {
        let _CHILD = this.state.currentItem.fun_3s[0];
        if (_CHILD) {
            if (_CHILD.alters_info) {
                document.getElementById('confirm_cb').checked = true;
                this.setState({ cb0: true })
                if (_CHILD.alters_info) {
                    document.getElementById('confirm_cb_2').checked = true;
                    this.setState({ cb: true })
                    if (_CHILD.alters_info.includes('ALERT_1')) {
                        document.getElementById('cb1').checked = true;
                        this.setState({ cb_1: true })
                    }
                    if (_CHILD.alters_info.includes('ALERT_2')) {
                        document.getElementById('cb2').checked = true;
                        this.setState({ cb_2: true })
                    }
                    if (_CHILD.alters_info.includes('ALERT_3')) {
                        document.getElementById('cb3').checked = true;
                        this.setState({ cb_3: true })
                    }
                    if (_CHILD.alters_info.includes('ALERT_4')) {
                        document.getElementById('cb4').checked = true;
                        this.setState({ cb_4: true })
                    }
                }
            }
        }

    }
    componentDidUpdate(prevState) {
        // SET THE INITIAL STATE OF THE PLETHORA OF CHECKBOXES, I DON'T KNOW WHY I DID THIS, I HATE MYSELF NOW...

        if (this.state.cb0 !== prevState.cb0 && this.state.cb0) {
            document.getElementById('confirm_cb').checked = true;
            if (this.state.cb !== prevState.cb && this.state.cb) {
                document.getElementById('confirm_cb_2').checked = true;
            } else {
                document.getElementById('confirm_cb_2').checked = false;
            }

        } else {
            document.getElementById('confirm_cb').checked = false;
        }



        if (this.state.cb && this.state.cb0) {
            if (this.state.cb_1 !== prevState.cb_1 && this.state.cb_1) {
                let _ID = document.getElementById('alert_id_3').value;
                let _CHILD = this.state.currentItem.fun_3s[_ID];
                if (_CHILD) {
                    let ALERTS = _CHILD.alters_info;
                    if (ALERTS) {
                        ALERTS = ALERTS.split(',');
                        for (var i = 0; i < ALERTS.length; i++) {
                            if (ALERTS[i].includes('ALERT_1')) {
                                document.getElementById('cb1').checked = true;
                                let _DATA = ALERTS[i].split('&');
                                document.getElementById('cb1_ni').value = _DATA[2]
                                document.getElementById('cb1_nd').value = _DATA[1]
                            }
                        }
                    }
                }
            }
            if (this.state.cb_2 !== prevState.cb_2 && this.state.cb_2) {
                let _ID = document.getElementById('alert_id_3').value;
                let _CHILD = this.state.currentItem.fun_3s[_ID];
                if (_CHILD) {
                    let ALERTS = _CHILD.alters_info;
                    if (ALERTS) {
                        ALERTS = ALERTS.split(',');
                        for (var i = 0; i < ALERTS.length; i++) {
                            if (ALERTS[i].includes('ALERT_2')) {
                                document.getElementById('cb2').checked = true;
                                let _DATA = ALERTS[i].split('&');
                                document.getElementById('cb2_ni').value = _DATA[2]
                                document.getElementById('cb2_nd').value = _DATA[1]
                            }
                        }
                    }
                }
            }
            if (this.state.cb_3 !== prevState.cb_3 && this.state.cb_3) {
                let _ID = document.getElementById('alert_id_3').value;
                let _CHILD = this.state.currentItem.fun_3s[_ID];
                if (_CHILD) {
                    let ALERTS = _CHILD.alters_info;
                    if (ALERTS) {
                        ALERTS = ALERTS.split(',');
                        for (var i = 0; i < ALERTS.length; i++) {
                            if (ALERTS[i].includes('ALERT_3')) {
                                document.getElementById('cb3').checked = true;
                                let _DATA = ALERTS[i].split('&');
                                document.getElementById('cb3_ni').value = _DATA[2]
                                document.getElementById('cb3_nd').value = _DATA[1]
                            }
                        }
                    }
                }
            }
            if (this.state.cb_4 !== prevState.cb_4 && this.state.cb_4) {
                let _ID = document.getElementById('alert_id_3').value;
                let _CHILD = this.state.currentItem.fun_3s[_ID];
                if (_CHILD) {
                    let ALERTS = _CHILD.alters_info;
                    if (ALERTS) {
                        ALERTS = ALERTS.split(',');
                        for (var i = 0; i < ALERTS.length; i++) {
                            if (ALERTS[i].includes('ALERT_4')) {
                                document.getElementById('cb4').checked = true;
                                let _DATA = ALERTS[i].split('&');
                                document.getElementById('cb4_ni').value = _DATA[2]
                                document.getElementById('cb4_nd').value = _DATA[1]
                            }
                        }
                    }
                }
            }
        }

    }
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { currentItem } = this.state;

        // DATA GETTERS
        let _SET_CHILD_3 = () => {
            var _CHILD = currentItem.fun_3s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                sign: null,
                new_type: null,
                publish_neighbour: null,
                alters_info: [],
            }
            if (_CHILD) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.sign = _CHILD.sign;
                _CHILD_VARS.new_type = _CHILD.new_type;
                _CHILD_VARS.publish_neighbour = _CHILD.publish_neighbour;
                _CHILD_VARS.alters_info = _CHILD.alters_info ? _CHILD.alters_info : [];
            }
            return _CHILD_VARS;
        }

        // DATA CONVERTERS
        let _GET_CHILD_3 = (_id) => {
            var _CHILD = _SET_CHILD_3();
            var _CHILD_VARS = {
                id6_cub: _CHILD[_id] ? _CHILD[_id].id6_cub : "",
                id_cub: _CHILD[_id] ? _CHILD[_id].id_cub : "",
                id6: _CHILD[_id] ? _CHILD[_id].id6 : "",
                id_alerted: _CHILD[_id] ? _CHILD[_id].id_alerted : "",
                alerted: _CHILD[_id] ? _CHILD[_id].alerted : "",
            }
            return _CHILD_VARS;
        }
        let _CHILD_3_SELECT_ID = () => {
            let _LIST = _SET_CHILD_3();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                // FIX: Added key prop for list items
                _COMPONENT.push(<option key={_LIST[i].id || i} value={i}>{_LIST[i].direccion_2}</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _CHILD_3_CONFIRMED = () => {
            let _LIST = _SET_CHILD_3();
            let _CONFIRMED = [0, 0, 0]; // COFIRMED - NOT POSSIBLE - TOTAL
            if (_LIST.length) {
                _CONFIRMED[2] = _LIST.length;
                for (var i = 0; i < _LIST.length; i++) {
                    if (_LIST[i].id_alerted === "-1") _CONFIRMED[1]++
                    else if (typeof _LIST[i].id_alerted === "string") _CONFIRMED[0]++

                }
            }
            return _CONFIRMED;
        }
        let _CHILD_6_SELECT = () => {
            let _LIST = _SET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                // FIX: Added key prop for list items
                _COMPONENT.push(<option key={_LIST[i].id || i} value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _GET_SIGN = () => {
            var _CHILD = _SET_CHILD_LAW()
            var sign = [];
            if (_CHILD.sign) {
                sign = _CHILD.sign.split(',')
            }
            return sign;
        }
        let _FIND_6 = (_ID) => {
            let _LIST = _SET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    _CHILD = _LIST[i];
                    break;
                }
            }
            return _CHILD;
        }
        let _GET_LAST_ID = () => {
            let new_id = "";
            PQRS_Service.getlascub()
                .then(response => {
                    new_id = response.data[0].cub;
                    new_id = _MANAGE_IDS(new_id, 'end')
                    document.getElementById('alert_id_cub').value = new_id;
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el consecutivo, inténtelo nuevamente.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }
        let _SET_OBJECT = (_id) => {
            let _CHILD = _SET_CHILD_3()[_id];

            document.getElementById('alert_id6_cub').value = _CHILD.id6_cub ?? 0;
            document.getElementById('alert_id_cub').value = _CHILD.id_cub;
            document.getElementById('alert_address_id').value = _CHILD.id_6 ?? 0;
            document.getElementById('alert_id_alert').value = _CHILD.id_alerted != -1 ? _CHILD.id_alerted : "";
            document.getElementById('alert_date_confirm').value = _CHILD.alerted;

            if (_CHILD.alters_info) {
                this.setState({ cb0: true })
                if (_CHILD.alters_info) {
                    this.setState({ cb: true })
                    if (_CHILD.alters_info.includes('ALERT_1')) {
                        this.setState({ cb_1: true })
                    } else {
                        this.setState({ cb_1: false })
                    }
                    if (_CHILD.alters_info.includes('ALERT_2')) {
                        this.setState({ cb_2: true })
                    } else {
                        this.setState({ cb_2: false })
                    }
                    if (_CHILD.alters_info.includes('ALERT_3')) {
                        this.setState({ cb_3: true })
                    } else {
                        this.setState({ cb_3: false })
                    }
                    if (_CHILD.alters_info.includes('ALERT_4')) {
                        this.setState({ cb_4: true })
                    } else {
                        this.setState({ cb_4: false })
                    }
                } else {
                    this.setState({ cb: false })
                }
            } else {
                this.setState({ cb0: false })
            }

        }

        // COMPONENT JSX
        let _CONFIRM_COMPONENT = () => {
            const _CONFIRMED = _CHILD_3_CONFIRMED();
            let _CHILD = _GET_CHILD_3(0);
            return <>
                <form id="form_alter_address">
                    <ul>
                        <li><label className="fw-bold">Hay un total de {_CONFIRMED[2]} direcciones</label></li>
                        {_CONFIRMED[2] - _CONFIRMED[1] - _CONFIRMED[0] > 0
                            ? <li><label className="fw-bold text-danger">Faltan  {_CONFIRMED[2] - _CONFIRMED[1] - _CONFIRMED[0]} direcciones(s) pendiente(s)</label></li>
                            : ""}
                        {_CONFIRMED[0] > 0
                            ? <li><label className="fw-bold text-success">Hay {_CONFIRMED[0]} direcciones(s) con CITACIÓN POSITIVA</label></li>
                            : ""}
                        {_CONFIRMED[1] > 0
                            ? <li><label className="fw-bold text-warning">Hay {_CONFIRMED[1]} direcciones(s) con CITACIÓN NEGATIVA</label></li>
                            : ""}
                    </ul>

                    <div className="row mb-3">
                        <div className="col-4">
                            <label>2.2.1 Vecino Colindante</label>
                            <select class="form-select" required id="alert_id_3"
                                onChange={(e) => _SET_OBJECT(e.target.value)} >
                                {_CHILD_3_SELECT_ID()}
                            </select>
                        </div>

                    </div>


                    <div className="row mb-3">
                        <div className="col-6">
                            <label>2.2.2 Relacionar documento: Carta</label>
                            <select class="form-select" required id="alert_id6_cub"
                                defaultValue={_CHILD.id6_cub} >
                                <option value="0">SIN DOCUMENTO</option>
                                <option value="-1">APORTADO FÍSICAMENTE</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                        <div className="col-4">
                            <label>2.2.3 Consecutivo de Salida</label>
                            <div class="input-group my-1">
                                <input type="text" class="form-control" id="alert_id_cub"
                                    defaultValue={_CHILD.id_cub || this.state.cubSelected || ""} />
                                   <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID()}>GENERAR</button>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-6">
                            <label>2.2.4 Relacionar documento: Guía de confirmación</label>
                            <select class="form-select" required id="alert_address_id"
                                defaultValue={_CHILD.id6}>
                                <option value="0">SIN DOCUMENTO</option>
                                <option value="-1">APORTADO FÍSICAMENTE</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                        <div className="col-3">
                            <label>2.2.5 Guía de Confirmación</label>
                            <input type="text" class="form-control mb-3" id="alert_id_alert"
                                defaultValue={_CHILD.id_alerted != -1 ? _CHILD.id_alerted : ""} />
                        </div>
                        <div className="col-3">
                            <label>2.2.6 Fecha de Confirmación</label>
                            <input type="date" class="form-control mb-3" max='2100-01-01' id="alert_date_confirm" required
                                defaultValue={_CHILD.alerted ?? moment().format('YYYY-MM-DD')} />
                        </div>
                    </div>

                    <div class="form-check my-3 px-5">
                        <input class="form-check-input" type="checkbox" id="confirm_cb" onChange={(e) => this.setState({ cb0: e.target.checked })}
                        />
                        <p class="form-check-label text-start" > NO FUE POSIBLE CITAR (Se negó a recibir - no reside - no se encontró dirección - otra)</p>
                    </div>
                    {this.state.cb0
                        ? <>
                            <div class="form-check my-3 px-5">
                                <input class="form-check-input" type="checkbox" id="confirm_cb_2" onChange={(e) => this.setState({ cb: e.target.checked })} />
                                <p class="form-check-label text-start" > Se realizó publicación en:</p>
                            </div>
                            {this.state.cb
                                ? <>
                                    <div className="row">
                                        <div className="col-3">
                                            <div class="form-check ms-3 px-5">
                                                <input class="form-check-input" type="checkbox" id={'cb1'} onChange={(e) => this.setState({ cb_1: e.target.checked })} />
                                                <label class="form-check-label text-start" > Periódico</label>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div class="form-check ms-3 px-5">
                                                <input class="form-check-input" type="checkbox" id={'cb2'} onChange={(e) => this.setState({ cb_2: e.target.checked })} />
                                                <label class="form-check-label text-start" > Radio</label>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div class="form-check ms-3 px-5">
                                                <input class="form-check-input" type="checkbox" id={'cb3'} onChange={(e) => this.setState({ cb_3: e.target.checked })} />
                                                <label class="form-check-label text-start" >Pagina Web</label>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div class="form-check ms-3 px-5">
                                                <input class="form-check-input" type="checkbox" id={'cb4'} onChange={(e) => this.setState({ cb_4: e.target.checked })} />
                                                <label class="form-check-label text-start" > Físico</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-3">
                                            {this.state.cb_1
                                                ? <>
                                                    <label>Fecha Periódico</label>
                                                    <input type="hidden" readOnly value="ALERT_1" name="neighbbour_inforalert_name" />
                                                    <input type="date" class="form-control mb-3" max='2100-01-01' name="neighbbour_inforalert_date" id="cb1_nd" />
                                                    <label>Soporte Periódico</label>
                                                    <select class="form-select" name="neighbbour_inforalert_id6" id="cb1_ni"  >
                                                        <option value="-1">APORTADO FÍSICAMENTE</option>
                                                        <option value="0">SIN DOCUMENTO</option>
                                                        {_CHILD_6_SELECT()}
                                                    </select>
                                                </> : ""}
                                        </div>
                                        <div className="col-3">
                                            {this.state.cb_2
                                                ? <>
                                                    <label>Fecha Radio</label>
                                                    <input type="hidden" readOnly value="ALERT_2" name="neighbbour_inforalert_name" />
                                                    <input type="date" class="form-control mb-3" max='2100-01-01' name="neighbbour_inforalert_date" id="cb2_nd" />
                                                    <label>Soporte Radio</label>
                                                    <select class="form-select" name="neighbbour_inforalert_id6" id="cb2_ni" >
                                                        <option value="-1">APORTADO FÍSICAMENTE</option>
                                                        <option value="0">SIN DOCUMENTO</option>
                                                        {_CHILD_6_SELECT()}
                                                    </select>
                                                </> : ""}
                                        </div>
                                        <div className="col-3">
                                            {this.state.cb_3
                                                ? <>
                                                    <label>Fecha Pagina Web</label>
                                                    <input type="hidden" readOnly value="ALERT_3" name="neighbbour_inforalert_name" />
                                                    <input type="date" class="form-control mb-3" max='2100-01-01' name="neighbbour_inforalert_date" id="cb3_nd" />
                                                    <label>Soporte Pagina Web</label>
                                                    <select class="form-select" name="neighbbour_inforalert_id6" id="cb3_ni"  >
                                                        <option value="-1">APORTADO FÍSICAMENTE</option>
                                                        <option value="0">SIN DOCUMENTO</option>
                                                        {_CHILD_6_SELECT()}
                                                    </select>
                                                </> : ""}
                                        </div>
                                        <div className="col-3">
                                            {this.state.cb_4
                                                ? <>
                                                    <label>Fecha Físico</label>
                                                    <input type="hidden" readOnly value="ALERT_4" name="neighbbour_inforalert_name" />
                                                    <input type="date" class="form-control mb-3" max='2100-01-01' name="neighbbour_inforalert_date" id="cb4_nd" />
                                                    <label>Soporte Físico</label>
                                                    <select class="form-select" name="neighbbour_inforalert_id6" id="cb4_ni" >
                                                        <option value="-1">APORTADO FÍSICAMENTE</option>
                                                        <option value="0">SIN DOCUMENTO</option>
                                                        {_CHILD_6_SELECT()}
                                                    </select>
                                                </> : ""}
                                        </div>
                                    </div>

                                </> : ""}
                        </> : ""}

                    <div className="row text-center">
                        <div className="col-12">
                            <MDBBtn className="btn btn-warning btn-lg my-3" onClick={() => alertAddress()}><i class="far fa-check-square"></i> CONFIRMAR</MDBBtn>
                        </div>
                    </div>
                </form>
            </>
        }
        let _COMPONENT_FUNXPQRS = () => {
            var objectsPQRS = this.state.pqrsxfun;
            var map = objectsPQRS.map((value, index) => { // FIX: Added index parameter for key
                var solicitors = {
                    names: value.solicitors_names ? value.solicitors_names.split(';') : [],
                    types: value.solicitors_types ? value.solicitors_types.split(';') : [],
                    types_id: value.solicitors_types_id ? value.solicitors_types_id.split(';') : [],
                    id_numers: value.solicitors_id_numers ? value.solicitors_id_numers.split(';') : [],
                }
                var contacts = {
                    notfies: value.contacts_notifies ? value.contacts_notifies.split(';') : [],
                    emails: value.contacts_emails ? value.contacts_emails.split(';') : [],
                    addresses: value.contacts_addresses ? value.contacts_addresses.split(';') : [],
                    phones: value.contacts_phones ? value.contacts_phones.split(';') : [],
                }

                return <React.Fragment key={value.id || value.id_publico || index}> {/* FIX: Added key prop */}
                    <div className="row border mx-2 py-1 bg-info mt-2">
                        <div className="col text-center text-white">
                            <label className="fw-bold">{value.id_publico}</label>
                        </div>

                    </div>
                    <div className="row border mx-2 py-1">
                        <div className="col">
                            <label>NUMERO CATASTRAL</label>
                        </div>
                        <div className="col">
                            <label className="fw-bold">{value.catastral}</label>
                        </div>
                        <div className="col">
                            <label>REFERENTE FRENTE A LA SOLICITUD</label>
                        </div>
                        <div className="col">
                            <label className="fw-bold">{value.person}</label>
                        </div>
                    </div>
                    <div className="row border mx-2 py-1 border-line border-info">
                        <div className="col">
                            <label className="fw-bold">SOLICITANTE</label>
                        </div>
                        <div className="col">
                            <label className="fw-bold">TIPO PERSONA</label>
                        </div>
                        <div className="col">
                            <label className="fw-bold">IDENTIFICACIÓN</label>
                        </div>
                        <div className="col">
                            <label className="fw-bold">TIPO IDEN.</label>
                        </div>
                    </div>
                    {solicitors.names.map((value, index) => {

                        return <div key={index} className="row border mx-2 py-1"> {/* FIX: Added key prop */}
                            <div className="col">
                                <label>{solicitors.names[index]}</label>
                            </div>
                            <div className="col">
                                <label>{solicitors.types[index]}</label>
                            </div>
                            <div className="col">
                                <label>{solicitors.id_numers[index]}</label>
                            </div>
                            <div className="col">
                                <label>{solicitors.types_id[index]}</label>
                            </div>
                        </div>
                    })}
                    <div className="row border mx-2 py-1 border-line border-info">
                        <div className="col">
                            <label className="fw-bold">DIRECCIÓN</label>
                        </div>
                        <div className="col">
                            <label className="fw-bold">EMAIL</label>
                        </div>
                        <div className="col">
                            <label className="fw-bold">TELÉFONO</label>
                        </div>
                        <div className="col-2">
                            <label className="fw-bold" >¿NOTIFICA?</label>
                        </div>
                    </div>
                    {contacts.notfies.map((value, index) => {
                        return <div key={index} className="row border mx-2 py-1"> {/* FIX: Added key prop */}
                            <div className="col">
                                <label>{contacts.addresses[index]}</label>
                            </div>
                            <div className="col">
                                <label>{contacts.emails[index]}</label>
                            </div>
                            <div className="col">
                                <label>{contacts.phones[index]}</label>
                            </div>
                            <div className="col-2 text-center">
                                <label>{contacts.notfies[index] ? <i class="fas fa-check text-success"></i> : <i class="fas fa-times text-danger"></i>}</label>
                            </div>
                        </div>
                    })}
                </React.Fragment>
                {/* FIX: Changed from fragment to React.Fragment to support key */}
            })
            return <>
                {map}
            </>
        }
        // FUNCTIONS & APIS
        var formData = new FormData();

        let uploadSign = (e) => {
            e.preventDefault();
            formData = new FormData();
            // FILE DATA

            formData.set('fun0Id', currentItem.id);
            let sign = []
            sign.push(document.getElementById("alert_sign_select").value);
            sign.push(document.getElementById("alert_sign_date").value);
            formData.set('sign', sign.join());
            if (currentItem.fun_law) {
                let law_id = currentItem.fun_law.id;
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                FUNService.update_sign(law_id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.generic_success_title,
                                text: swaMsg.generic_success_text,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            document.getElementById("form_alter_address").reset();
                            this.requestUpdate(currentItem.id);
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
                FUNService.create_sign(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.generic_success_title,
                                text: swaMsg.generic_success_text,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.requestUpdate(currentItem.id);
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

        };
        let new_3 = (e) => {
            e.preventDefault();
            let fun0Id = null;
            //
            formData = new FormData();
            fun0Id = currentItem.id;
            formData.set('fun0Id', fun0Id);
            let direccion_1 = document.getElementById("alert_3_1").value;
            formData.set('direccion_1', direccion_1);
            let direccion_2 = document.getElementById("alert_3_2").value;
            formData.set('direccion_2', direccion_2);
            formData.set('extra', 1);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.create_fun3(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        document.getElementById("app-form_neighbour").reset();
                        this.requestUpdate(currentItem.id);
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

        let createVRxCUB_relation = (cub_selected) => {
            let cub = cub_selected;
            let formatData = new FormData();

            formatData.set('vr', this.state.vr);
            formatData.set('cub', cub);
            formatData.set('fun', currentItem.id_public);
            formatData.set('process', 'PUBLICIDAD COMUNICACION A VECINOS');

            if (this.state.idCUBxVr) {
                CubXVrDataService.updateCubVr(this.state.idCUBxVr, formatData)
                    .then((response) => {
                        if (response.data === 'OK') {
                            // Refrescar la UI
                            this.props.requestUpdate(currentItem.id, true);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
            else {
                // Crear relación
                CubXVrDataService.createCubXVr(formatData)
                    .then((response) => {
                        if (response.data === 'OK') {
                            // Refrescar la UI
                            this.props.requestUpdate(currentItem.id, true);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        }

        let alertAddress = () => {
            console.log(document.getElementById(''));
            console.log("--------------------");
            console.log(document.getElementById('alert_address'));
            let formData = new FormData();
            formData.set('fun0Id', currentItem.id);
            let child_i = document.getElementById("alert_id_3").value;
            if (!_SET_CHILD_3()[child_i]) {
                MySwal.fire({
                    title: "NO SE ENCUENTRA VECINO",
                    text: "Asegurese de que el vecino seleccionado sea valido",
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
                return 1;
            }

            let id = _SET_CHILD_3()[child_i].id;


            let id6_cub = document.getElementById("alert_id6_cub").value;
            formData.set('id6_cub', id6_cub);

            let new_id = document.getElementById('alert_id_cub').value;
            formData.set('new_id', new_id || false);
            let prev_id = _SET_CHILD_3()[child_i].id_cub;
            formData.set('prev_id', prev_id);

            createVRxCUB_relation(new_id)


            let alerted = document.getElementById("alert_date_confirm").value;
            if (alerted) formData.set('alerted', alerted);
            let id_6 = document.getElementById("alert_address_id").value;
            if (id_6) formData.set('id_6', id_6);
            let id_alerted = document.getElementById("alert_id_alert").value;
            let cb = document.getElementById("confirm_cb").checked;
            if (cb) {
                formData.set('id_alerted', id_alerted);
                formData.set('state', 2);
            } else if (alerted && id_alerted) {
                formData.set('id_alerted', id_alerted);
                formData.set('state', 1);
                formData.set('alters_info', "");
            }

            let cb_2 = document.getElementById("confirm_cb_2");
            if (cb_2) {
                if (cb_2.checked) {
                    let _alerts_names = document.getElementsByName('neighbbour_inforalert_name');
                    let _alerts_dates = document.getElementsByName('neighbbour_inforalert_date');
                    let _alerts_id6s = document.getElementsByName('neighbbour_inforalert_id6');

                    let alters_info = [];

                    for (var i = 0; i < _alerts_dates.length; i++) {
                        alters_info.push(_alerts_names[i].value + "&" + _alerts_dates[i].value + "&" + _alerts_id6s[i].value);
                    }
                    formData.set('alters_info', alters_info.join());
                }
            }

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.update_3(id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.requestUpdate(currentItem.id)
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACION",
                            text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                    else {
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
            this.retrieveItem(this.props.currentId);
        }

        return (
            <div>
                {currentItem != null ? <>
                    <FUN6DATALIST />
                    <h2 class="text-uppercase text-center py-2" id="fund_1">PUBLICIDAD</h2>
                    <fieldset className="p-3">
                        <legend className="my-2 px-3 text-uppercase Collapsible" id="fun_alert_1">
                            <label className="app-p lead fw-normal text-uppercase">1. VALLA O AVISO</label>
                        </legend>
                        <form onSubmit={uploadSign} id="app-form_sign">
                            <div className="row mb-3">
                                <div className="col-7">
                                    <label>1.1 Foto de Valla o aviso</label>
                                    <select class="form-select" required id="alert_sign_select" defaultValue={_GET_SIGN()[0]} >
                                        <option value="-1">APORTADO FISICAMENTE</option>
                                        <option value="0">SIN DOCUMENTO</option>
                                        {_CHILD_6_SELECT()}
                                    </select>
                                </div>
                                <div className="col-4">
                                    <label>1.2. Fecha de Radicación</label>
                                    <input type="date" class="form-control" max="2100-01-01" id="alert_sign_date" defaultValue={_GET_SIGN()[1]}
                                        required />
                                </div>
                                <div className="col-1">
                                    <br />
                                    {_GET_SIGN()[0] > 0
                                        ?
                                        <VIZUALIZER url={_FIND_6(_GET_SIGN()[0]).path + "/" + _FIND_6(_GET_SIGN()[0]).filename}
                                            apipath={'/files/'} />
                                        : ""}
                                </div>
                            </div>
                            {_SET_CHILD_LAW().sign
                                ? <><label className="text-success fw-bold my-2">YA SE HA RELACIONADO EL AVISO  A ESTA SOLICITUD, REPETIR ESTA ACCIÓN REEMPLAZARÁ EL AVISO ANTERIOR</label>
                                </>
                                : <label className="text-danger fw-bold my-2">NO SE HA RELACIONADO LA FOTO DE LA VALLA A ESTA SOLICITUD</label>
                            }

                            <div className="row text-center">
                                <div className="col-12">
                                    <button className="btn btn-warning btn-lg my-3" id="btn-review" ><i class="far fa-file-alt"></i> ANEXAR AVISO</button>
                                </div>
                            </div>
                        </form>

                        <div class="form-check my-3 px-5">
                            <input class="form-check-input" type="checkbox" name="licence_checkbox" onChange={(e) => this.setState({ sign_pdf: e.target.checked })} />
                            <p class="form-check-label text-start" >Generar PDF de la Valla.</p>
                        </div>

                        {this.state.sign_pdf
                            ? <FUN_SIGN_PDF
                                translation={translation}
                                swaMsg={swaMsg}
                                globals={globals}
                                currentItem={currentItem}
                                currentVersion={currentVersion}
                            />
                            : ""}
                    </fieldset>
                    <fieldset className="p-3">
                        <legend className="my-2 px-3 text-uppercase Collapsible" id="fun_alert_2">
                            <label className="app-p lead fw-normal text-uppercase">2. COMUNICACIÓN A VECINOS</label>
                        </legend>
                        <FUN_3_G_VIEW
                            _FUN_3={_SET_CHILD_3()}
                            _FUN_6={_SET_CHILD_6()}
                        />


                        <div class="form-check my-3 px-5">
                            <input class="form-check-input" type="checkbox" name="licence_checkbox" onChange={() => this.setState({ new_neighbour: !this.state.new_neighbour })} />
                            <p class="form-check-label text-start" >Añadir nuevos vecinos a esta solicitud.</p>
                        </div>
                        {this.state.new_neighbour
                            ? <> <form onSubmit={new_3} id="app-form_neighbour">
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label >Dirección del Predio</label>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-map-marked-alt"></i>
                                            </span>
                                            <input type="text" class="form-control" id="alert_3_1" />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label>Dirección de correspondencia</label>
                                        <div class="input-group my-1">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="fas fa-map-marked-alt"></i>
                                            </span>
                                            <input type="text" class="form-control" id="alert_3_2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3 text-center">
                                    <div className="col-12">
                                        <button className="btn btn-warning my-3"><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                    </div>
                                </div>
                            </form>
                            </> : ""}

                        <label className="app-p lead fw-normal text-uppercase my-3" id="fun_alert_21">2.1 GENERAR DOCUMENTOS DE CITACIÓN</label>
                        <FUN_ALERT_NEIGHBOUR
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            vr={this.state.vr}
                            setVr={(item) => this.setState({ vr: item })}
                        />

                        <label className="app-p lead fw-normal text-uppercase my-3" id="fun_alert_22">2.2 CONFIRMACIÓN DE AVISOS</label>
                        {_CONFIRM_COMPONENT()}


                    </fieldset>

                    {this.state.pqrsxfun.length
                        ? <>
                            <fieldset className="p-3">
                                <legend className="my-2 px-3 text-uppercase Collapsible" id="fun_alert_2">
                                    <label className="app-p lead fw-normal text-uppercase">3. PETICIONES RELACIONADAS</label>
                                </legend>
                                {_COMPONENT_FUNXPQRS()}
                            </fieldset>

                        </>
                        : ""}
                    {/* <NAV_FUNA /> */}
                    <FUN_VERSION_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        NAVIGATION_VERSION={this.props.NAVIGATION_VERSION}

                    />
                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"alert"}
                        NAVIGATION={this.props.NAVIGATION}
                        pqrsxfun={this.state.pqrsxfun}
                    />
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACION...</h3></div>
                </fieldset>}
            </div>
        );
    }
}
/*
const NAV_FUNA = () => {
    return (
        <div className="btn-navpqrs">
            <MDBCard className="container-primary" border='dark'>
                <MDBCardBody className="p-1">
                    <legend className="px-3 pt-2 text-uppercase bg-light text-center">
                        <h6>Menu de Navegacion</h6>
                    </legend>
                    <br />
                    <a href="#fun_alert_1">
                        <legend className="px-3 text-uppercase btn-info">
                            <h6>1. VALLA O AVISO</h6>
                        </legend>
                    </a>
                    <br />
                    <a href="#fun_alert_2">
                        <legend className="px-3 text-uppercase btn-info">
                            <h6>2. COMUNICACION A VECINOS</h6>
                        </legend>
                    </a>
                    <br />
                    <a href="#fun_alert_21">
                        <legend className="px-3 text-uppercase btn-info">
                            <h6>2.1 GENERAR DOCUMENTOS DE CITACION</h6>
                        </legend>
                    </a>
                    <br />
                    <a href="#fun_alert_22">
                        <legend className="px-3 text-uppercase btn-info">
                            <h6>2.2 CONFIRMACIÓN DE AVISOS</h6>
                        </legend>
                    </a>

                </MDBCardBody>
            </MDBCard>
        </div>
    );
}
    */

export default FUN_ALERT;