import React, { useState, useEffect } from 'react';
import FUNService from '../../../services/fun.service'

import dayjs from 'dayjs';

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
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';


function FUN_ALERT({ translation, swaMsg, globals, currentVersion, currentId, NAVIGATION_VERSION, NAVIGATION, requestUpdate: requestUpdateProp }) {
    const [new_neighbour, setNewNeighbour] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [edit_type, setEditType] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [cb, setCb] = useState(false);
    const [pqrsxfun, setPqrsxfun] = useState(false);
    const [vr, setVr] = useState(null);
    const [cubSelected, setCubSelected] = useState(null);
    const [idCUBxVr, setIdCUBxVr] = useState(null);
    const [cb0, setCb0] = useState(false);
    const [cb_1, setCb1] = useState(false);
    const [cb_2, setCb2] = useState(false);
    const [cb_3, setCb3] = useState(false);
    const [cb_4, setCb4] = useState(false);
    const [sign_pdf, setSignPdf] = useState(false);

    const requestUpdate = (id) => {
        retrieveItem(id);
    };

    useEffect(() => {
        retrieveItem(currentId);
    }, []);

    const retrieveItem = (id) => {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
                SET_DEFAULT_OBJECT(response.data);
                retrievePQRSxFUN(response.data.id_public);
                retrieveCubXvrs(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    };

    const retrievePQRSxFUN = (id_public) => {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                setPqrsxfun(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    };

    const retrieveCubXvrs = async (id_public) => {
        const response = await CubXVrDataService.getByFUN(id_public)
        const data = response.data.find(item => item.process === 'PUBLICIDAD COMUNICACION A VECINOS')
        if (data) {
            setVr(data.vr);
            setCubSelected(data.cub);
            setIdCUBxVr(data.id);
        }
    };

    const SET_DEFAULT_OBJECT = (item) => {
        let _CHILD = item.fun_3s[0];
        if (_CHILD) {
            if (_CHILD.alters_info) {
                document.getElementById('confirm_cb').checked = true;
                setCb0(true);
                if (_CHILD.alters_info) {
                    document.getElementById('confirm_cb_2').checked = true;
                    setCb(true);
                    if (_CHILD.alters_info.includes('ALERT_1')) {
                        document.getElementById('cb1').checked = true;
                        setCb1(true);
                    }
                    if (_CHILD.alters_info.includes('ALERT_2')) {
                        document.getElementById('cb2').checked = true;
                        setCb2(true);
                    }
                    if (_CHILD.alters_info.includes('ALERT_3')) {
                        document.getElementById('cb3').checked = true;
                        setCb3(true);
                    }
                    if (_CHILD.alters_info.includes('ALERT_4')) {
                        document.getElementById('cb4').checked = true;
                        setCb4(true);
                    }
                }
            }
        }
    };
    // Sync checkboxes when cb0/cb change
    useEffect(() => {
        const confirmCb = document.getElementById('confirm_cb');
        const confirmCb2 = document.getElementById('confirm_cb_2');
        if (!confirmCb) return;
        if (cb0) {
            confirmCb.checked = true;
            if (confirmCb2) {
                confirmCb2.checked = cb ? true : false;
            }
        } else {
            confirmCb.checked = false;
        }
    }, [cb0, cb]);

    // Populate alert form fields when cb_N flags change
    useEffect(() => {
        if (!cb || !cb0 || !currentItem) return;
        const alertId3El = document.getElementById('alert_id_3');
        if (!alertId3El) return;
        const _ID = alertId3El.value;
        const _CHILD = currentItem.fun_3s[_ID];
        if (!_CHILD) return;
        let ALERTS = _CHILD.alters_info;
        if (!ALERTS) return;
        const alertsArr = ALERTS.split(',');
        const checkboxMap = [
            { flag: cb_1, prefix: 'ALERT_1', cbId: 'cb1' },
            { flag: cb_2, prefix: 'ALERT_2', cbId: 'cb2' },
            { flag: cb_3, prefix: 'ALERT_3', cbId: 'cb3' },
            { flag: cb_4, prefix: 'ALERT_4', cbId: 'cb4' },
        ];
        for (const { flag, prefix, cbId } of checkboxMap) {
            if (flag) {
                for (let i = 0; i < alertsArr.length; i++) {
                    if (alertsArr[i].includes(prefix)) {
                        const el = document.getElementById(cbId);
                        if (el) el.checked = true;
                        let _DATA = alertsArr[i].split('&');
                        const niEl = document.getElementById(cbId + '_ni');
                        const ndEl = document.getElementById(cbId + '_nd');
                        if (niEl) niEl.value = _DATA[2];
                        if (ndEl) ndEl.value = _DATA[1];
                    }
                }
            }
        }
    }, [cb, cb0, cb_1, cb_2, cb_3, cb_4, currentItem]);

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
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar el consecutivo, inténtelo nuevamente." });
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
                setCb0(true);
                if (_CHILD.alters_info) {
                    setCb(true);
                    if (_CHILD.alters_info.includes('ALERT_1')) {
                        setCb1(true);
                    } else {
                        setCb1(false);
                    }
                    if (_CHILD.alters_info.includes('ALERT_2')) {
                        setCb2(true);
                    } else {
                        setCb2(false);
                    }
                    if (_CHILD.alters_info.includes('ALERT_3')) {
                        setCb3(true);
                    } else {
                        setCb3(false);
                    }
                    if (_CHILD.alters_info.includes('ALERT_4')) {
                        setCb4(true);
                    } else {
                        setCb4(false);
                    }
                } else {
                    setCb(false);
                }
            } else {
                setCb0(false);
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
                            <select className="form-select" required id="alert_id_3"
                                onChange={(e) => _SET_OBJECT(e.target.value)} >
                                {_CHILD_3_SELECT_ID()}
                            </select>
                        </div>

                    </div>

                    <div className="row mb-3">
                        <div className="col-6">
                            <label>2.2.2 Relacionar documento: Carta</label>
                            <select className="form-select" required id="alert_id6_cub"
                                defaultValue={_CHILD.id6_cub} >
                                <option value="0">SIN DOCUMENTO</option>
                                <option value="-1">APORTADO FÍSICAMENTE</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                        <div className="col-4">
                            <label>2.2.3 Consecutivo de Salida</label>
                            <div className="input-group my-1">
                                <input type="text" className="form-control" id="alert_id_cub"
                                    defaultValue={_CHILD.id_cub || cubSelected || ""} />
                                   <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors" onClick={() => _GET_LAST_ID()}>GENERAR</button>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-6">
                            <label>2.2.4 Relacionar documento: Guía de confirmación</label>
                            <select className="form-select" required id="alert_address_id"
                                defaultValue={_CHILD.id6}>
                                <option value="0">SIN DOCUMENTO</option>
                                <option value="-1">APORTADO FÍSICAMENTE</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                        <div className="col-3">
                            <label>2.2.5 Guía de Confirmación</label>
                            <input type="text" className="form-control mb-3" id="alert_id_alert"
                                defaultValue={_CHILD.id_alerted != -1 ? _CHILD.id_alerted : ""} />
                        </div>
                        <div className="col-3">
                            <label>2.2.6 Fecha de Confirmación</label>
                            <input type="date" className="form-control mb-3" max='2100-01-01' id="alert_date_confirm" required
                                defaultValue={_CHILD.alerted ?? dayjs().format('YYYY-MM-DD')} />
                        </div>
                    </div>

                    <div className="form-check my-3 px-5">
                        <input className="form-check-input" type="checkbox" id="confirm_cb" onChange={(e) => setCb0(e.target.checked)}
                        />
                        <p className="form-check-label text-start" > NO FUE POSIBLE CITAR (Se negó a recibir - no reside - no se encontró dirección - otra)</p>
                    </div>
                    {cb0
                        ? <>
                            <div className="form-check my-3 px-5">
                                <input className="form-check-input" type="checkbox" id="confirm_cb_2" onChange={(e) => setCb(e.target.checked)} />
                                <p className="form-check-label text-start" > Se realizó publicación en:</p>
                            </div>
                            {cb
                                ? <>
                                    <div className="row">
                                        <div className="col-3">
                                            <div className="form-check ms-3 px-5">
                                                <input className="form-check-input" type="checkbox" id={'cb1'} onChange={(e) => setCb1(e.target.checked)} />
                                                <label className="form-check-label text-start" > Periódico</label>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div className="form-check ms-3 px-5">
                                                <input className="form-check-input" type="checkbox" id={'cb2'} onChange={(e) => setCb2(e.target.checked)} />
                                                <label className="form-check-label text-start" > Radio</label>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div className="form-check ms-3 px-5">
                                                <input className="form-check-input" type="checkbox" id={'cb3'} onChange={(e) => setCb3(e.target.checked)} />
                                                <label className="form-check-label text-start" >Pagina Web</label>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div className="form-check ms-3 px-5">
                                                <input className="form-check-input" type="checkbox" id={'cb4'} onChange={(e) => setCb4(e.target.checked)} />
                                                <label className="form-check-label text-start" > Físico</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-3">
                                            {cb_1
                                                ? <>
                                                    <label>Fecha Periódico</label>
                                                    <input type="hidden" readOnly value="ALERT_1" name="neighbbour_inforalert_name" />
                                                    <input type="date" className="form-control mb-3" max='2100-01-01' name="neighbbour_inforalert_date" id="cb1_nd" />
                                                    <label>Soporte Periódico</label>
                                                    <select className="form-select" name="neighbbour_inforalert_id6" id="cb1_ni"  >
                                                        <option value="-1">APORTADO FÍSICAMENTE</option>
                                                        <option value="0">SIN DOCUMENTO</option>
                                                        {_CHILD_6_SELECT()}
                                                    </select>
                                                </> : ""}
                                        </div>
                                        <div className="col-3">
                                            {cb_2
                                                ? <>
                                                    <label>Fecha Radio</label>
                                                    <input type="hidden" readOnly value="ALERT_2" name="neighbbour_inforalert_name" />
                                                    <input type="date" className="form-control mb-3" max='2100-01-01' name="neighbbour_inforalert_date" id="cb2_nd" />
                                                    <label>Soporte Radio</label>
                                                    <select className="form-select" name="neighbbour_inforalert_id6" id="cb2_ni" >
                                                        <option value="-1">APORTADO FÍSICAMENTE</option>
                                                        <option value="0">SIN DOCUMENTO</option>
                                                        {_CHILD_6_SELECT()}
                                                    </select>
                                                </> : ""}
                                        </div>
                                        <div className="col-3">
                                            {cb_3
                                                ? <>
                                                    <label>Fecha Pagina Web</label>
                                                    <input type="hidden" readOnly value="ALERT_3" name="neighbbour_inforalert_name" />
                                                    <input type="date" className="form-control mb-3" max='2100-01-01' name="neighbbour_inforalert_date" id="cb3_nd" />
                                                    <label>Soporte Pagina Web</label>
                                                    <select className="form-select" name="neighbbour_inforalert_id6" id="cb3_ni"  >
                                                        <option value="-1">APORTADO FÍSICAMENTE</option>
                                                        <option value="0">SIN DOCUMENTO</option>
                                                        {_CHILD_6_SELECT()}
                                                    </select>
                                                </> : ""}
                                        </div>
                                        <div className="col-3">
                                            {cb_4
                                                ? <>
                                                    <label>Fecha Físico</label>
                                                    <input type="hidden" readOnly value="ALERT_4" name="neighbbour_inforalert_name" />
                                                    <input type="date" className="form-control mb-3" max='2100-01-01' name="neighbbour_inforalert_date" id="cb4_nd" />
                                                    <label>Soporte Físico</label>
                                                    <select className="form-select" name="neighbbour_inforalert_id6" id="cb4_ni" >
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
                            <Button type="button" size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 my-3" onClick={() => alertAddress()}><Icon name="check-square" size={14} /> Confirmar</Button>
                        </div>
                    </div>
                </form>
            </>
        }
        let _COMPONENT_FUNXPQRS = () => {
            var objectsPQRS = Array.isArray(pqrsxfun) ? pqrsxfun : [];
            if (objectsPQRS.length === 0) return <label className="fw-bold">No hay solicitudes PQRS asociadas a este trámite.</label>;
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
                    <div className="row border mx-2 py-1 bg-primary text-primary-foreground mt-2">
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
                                <label>{contacts.notfies[index] ? <Icon name="check" size={16} className="text-success" /> : <Icon name="times" size={16} className="text-danger" />}</label>
                            </div>
                        </div>
                    })}
                </React.Fragment>
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
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                FUNService.update_sign(law_id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            document.getElementById("form_alter_address").reset();
                            requestUpdate(currentItem.id);
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    });
            } else {
                FUNService.create_sign(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                            requestUpdate(currentItem.id);
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUNService.create_fun3(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        document.getElementById("app-form_neighbour").reset();
                        requestUpdate(currentItem.id);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                });
        }

        let createVRxCUB_relation = (cub_selected) => {
            let cub = cub_selected;
            let formatData = new FormData();

            formatData.set('vr', vr);
            formatData.set('cub', cub);
            formatData.set('fun', currentItem.id_public);
            formatData.set('process', 'PUBLICIDAD COMUNICACION A VECINOS');

            if (idCUBxVr) {
                CubXVrDataService.updateCubVr(idCUBxVr, formatData)
                    .then((response) => {
                        if (response.data === 'OK') {
                            // Refrescar la UI
                            requestUpdateProp(currentItem.id, true);
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
                            requestUpdateProp(currentItem.id, true);
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
                swalError({ title: "NO SE ENCUENTRA VECINO", text: "Asegurese de que el vecino seleccionado sea valido" });
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUNService.update_3(id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        requestUpdate(currentItem.id)
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        swalError({ title: "ERROR DE DUPLICACION", text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo" });
                    }
                    else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                });
            retrieveItem(currentId);
        };

        return (
            <div>
                {currentItem != null ? <>
                    <FUN6DATALIST />
                    <h2 className="text-center py-2" id="fund_1">PUBLICIDAD</h2>
                    <fieldset className="p-3">
                        <legend className="my-2 px-3 Collapsible" id="fun_alert_1">
                            <label className="app-p lead fw-normal">1. VALLA O AVISO</label>
                        </legend>
                        <form onSubmit={uploadSign} id="app-form_sign">
                            <div className="row mb-3">
                                <div className="col-7">
                                    <label>1.1 Foto de Valla o aviso</label>
                                    <select className="form-select" required id="alert_sign_select" defaultValue={_GET_SIGN()[0]} >
                                        <option value="-1">APORTADO FISICAMENTE</option>
                                        <option value="0">SIN DOCUMENTO</option>
                                        {_CHILD_6_SELECT()}
                                    </select>
                                </div>
                                <div className="col-4">
                                    <label>1.2. Fecha de Radicación</label>
                                    <input type="date" className="form-control" max="2100-01-01" id="alert_sign_date" defaultValue={_GET_SIGN()[1]}
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
                                    <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 my-3" id="btn-review"><Icon name="file-alt" size={14} /> Anexar aviso</Button>
                                </div>
                            </div>
                        </form>

                        <div className="form-check my-3 px-5">
                            <input className="form-check-input" type="checkbox" name="licence_checkbox" onChange={(e) => setSignPdf(e.target.checked)} />
                            <p className="form-check-label text-start" >Generar PDF de la Valla.</p>
                        </div>

                        {sign_pdf
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
                        <legend className="my-2 px-3 Collapsible" id="fun_alert_2">
                            <label className="app-p lead fw-normal">2. COMUNICACIÓN A VECINOS</label>
                        </legend>
                        <FUN_3_G_VIEW
                            _FUN_3={_SET_CHILD_3()}
                            _FUN_6={_SET_CHILD_6()}
                        />

                        <div className="form-check my-3 px-5">
                            <input className="form-check-input" type="checkbox" name="licence_checkbox" onChange={() => setNewNeighbour(!new_neighbour)} />
                            <p className="form-check-label text-start" >Añadir nuevos vecinos a esta solicitud.</p>
                        </div>
                        {new_neighbour
                            ? <> <form onSubmit={new_3} id="app-form_neighbour">
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label >Dirección del Predio</label>
                                        <div className="input-group my-1">
                                            <span className="input-group-text bg-primary text-primary-foreground">
                                                <Icon name="map-marked-alt" size={16} />
                                            </span>
                                            <input type="text" className="form-control" id="alert_3_1" />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label>Dirección de correspondencia</label>
                                        <div className="input-group my-1">
                                            <span className="input-group-text bg-primary text-primary-foreground">
                                                <Icon name="map-marked-alt" size={16} />
                                            </span>
                                            <input type="text" className="form-control" id="alert_3_2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3 text-center">
                                    <div className="col-12">
                                        <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 my-3"><Icon name="file-alt" size={16} /> AÑADIR ITEM </Button>
                                    </div>
                                </div>
                            </form>
                            </> : ""}

                        <label className="app-p lead fw-normal my-3" id="fun_alert_21">2.1 GENERAR DOCUMENTOS DE CITACIÓN</label>
                        <FUN_ALERT_NEIGHBOUR
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            vr={vr}
                            setVr={(item) => setVr(item)}
                        />

                        <label className="app-p lead fw-normal my-3" id="fun_alert_22">2.2 CONFIRMACIÓN DE AVISOS</label>
                        {_CONFIRM_COMPONENT()}

                    </fieldset>

                    {pqrsxfun.length
                        ? <>
                            <fieldset className="p-3">
                                <legend className="my-2 px-3 Collapsible" id="fun_alert_2">
                                    <label className="app-p lead fw-normal">3. PETICIONES RELACIONADAS</label>
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
                        NAVIGATION_VERSION={NAVIGATION_VERSION}

                    />
                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"alert"}
                        NAVIGATION={NAVIGATION}
                        pqrsxfun={pqrsxfun}
                    />
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACION...</h3></div>
                </fieldset>}
            </div>
        );
}
/*
const NAV_FUNA = () => {
    return (
        <div className="btn-navpqrs">
            <div className="rounded-lg border bg-card p-4 container-primary">
                <div>
                    <legend className="px-3 pt-2 bg-light text-center">
                        <h6>Menu de Navegacion</h6>
                    </legend>
                    <br />
                    <a href="#fun_alert_1">
                        <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                            <h6>1. VALLA O AVISO</h6>
                        </legend>
                    </a>
                    <br />
                    <a href="#fun_alert_2">
                        <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                            <h6>2. COMUNICACION A VECINOS</h6>
                        </legend>
                    </a>
                    <br />
                    <a href="#fun_alert_21">
                        <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                            <h6>2.1 GENERAR DOCUMENTOS DE CITACION</h6>
                        </legend>
                    </a>
                    <br />
                    <a href="#fun_alert_22">
                        <legend className="px-3 rounded text-sm font-medium bg-primary text-primary-foreground">
                            <h6>2.2 CONFIRMACIÓN DE AVISOS</h6>
                        </legend>
                    </a>

                </div>
            </div>
        </div>
    );
}
    */

export default FUN_ALERT;