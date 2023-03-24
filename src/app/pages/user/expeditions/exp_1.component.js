import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import EXPEDITION_SERVICE from '../../../services/expedition.service';
import PQRS_Service from '../../../services/pqrs_main.service';
import JSONObjectParser from '../../../components/jsons/jsonReplacer';
import { axis, infoCud, zones } from '../../../components/jsons/vars'
import { regexChecker_isOA_2, _MANAGE_IDS } from '../../../components/customClasses/typeParse';
import EXP_CALC from './exp_calc.component';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
class EXP_1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_EXPEDITION_JSON = (field) => {
            let json = currentRecord[field];
            if (!json) return {}
            let object = JSON.parse(JSON.parse(json))
            return object
        }
        let _GET_LAST_ID = (_id) => {
            let new_id = "";
            PQRS_Service.getlascub()
                .then(response => {
                    new_id = response.data[0].cub;
                    new_id = _MANAGE_IDS(new_id, 'end')
                    document.getElementById(_id).value = new_id;
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el concecutivo, intentelo nuevamnte.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

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
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentItem.record_arc_steps || [];
            var VERSIONR = currentItem.record_arc ? currentItem.record_arc.version : 0;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == VERSIONR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ? STEP[_type] : []
            if (!value) return [];
            value = value.split(';');
            return value
        }
        let _GET_STEP_TYPE_JSON = (_id_public) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return {};
            var value = STEP['json']
            if (!value) return {};
            value = JSON.parse(JSON.parse(value));
            return value
        }
        let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)
        // DATA CONVERTERS

        // COMPONENT JSX
        let _COMPONENT_GENERAL = () => {
            const value35 = _GET_STEP_TYPE('s35', 'value');
            const json34 = _GET_STEP_TYPE_JSON('s34');
            return <>
                <label className="fw-bold mt-2 text-uppercase">Acto de tramite de licencia</label>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Fecha Acto de tramite de licencia</label>
                        <input type="date" class="form-control" id="expedition_1" max="2100-01-01"
                            defaultValue={currentRecord.date ?? ''} />
                    </div>
                    <div className="col">
                        <label className="mt-1">Ajuste Cargo Fijo</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_23"
                                defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_fix ?? 0} />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">{infoCud.serials.end} Acto de tramite de licencia</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_2"
                                defaultValue={currentRecord.cub1 ?? ''} />
                            <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID('expedition_2')}>GENERAR</button>
                        </div>
                    </div>

                </div>
                {!conOA() && _GLOBAL_ID === 'cb1' ? <>
                    <label className="fw-bold mt-2 text-uppercase">Impuestos Municipales</label>
                    <div className="row">
                        <div className="col">
                            <label className="mt-1">Tratamiento</label>
                            <select className="form-select" id="expedition_4" defaultValue={_GET_EXPEDITION_JSON('tmp').type ?? 'TD - Desarrollo'} >
                                <option>SIN TRATAMIENTO</option>
                                <option>TD - Desarrollo</option>
                                <option>TC-1 - Consolidacion Urbana</option>
                                <option>TC-2 - Consolidacion con generacion de espacio publico</option>
                                <option>TRD - Redesarrollo</option>
                                <option>TRA-1 - Reactivacion</option>
                                <option>TRA-2 - Reactivacion</option>
                                <option>TRA-3 - Reactivacion de sector urbano especial</option>
                                <option>TMI-1 - Complementario</option>
                                <option>TMI-2 - Reordenamiento</option>
                                <option>TCoU - Para inmuebles de interes cultural del grupo urbano</option>
                                <option>TCoA-1 - Para inmuebles de interes cultural del grupo arquitectonico agrupacion</option>
                                <option>TCoA-2 - Para inmuebles de interes cultural del grupo arquitectonico individual</option>
                            </select>
                        </div>
                        <div className="col">
                            <label className="mt-1">Zona</label>
                            <select className="form-select" id="expedition_16" defaultValue={_GET_EXPEDITION_JSON('tmp').zone ?? '0'} >
                                {zones}
                            </select>
                        </div>
                        <div className="col">
                            <label className="mt-1">Eje</label>
                            <select className="form-select" id="expedition_17" defaultValue={_GET_EXPEDITION_JSON('tmp').axis ?? '5'} >
                                {axis}
                            </select>
                        </div>
                        <div className="col">
                            <label className="mt-1">Factura # Expensas</label>
                            <input type="text" class="form-control" id="expedition_18"
                                defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_1 ?? ''} />
                        </div>
                        <div className="col">
                            <label className="mt-1">Factura # Municipales</label>
                            <input type="text" class="form-control" id="expedition_21"
                                defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_4 ?? ''} />
                        </div>
                    </div>
                </> : ''}
                <label className="fw-bold mt-2 text-uppercase">Estampilla PRO-UIS (SI ESTRATO {'>'} 2)</label>
                <div className="row">
                    <div className="col">
                        <label className="mt-1">Area Intervenida</label>
                        <div class="input-group">
                            <EXP_CALC
                                ranslation={translation} swaMsg={swaMsg} globals={globals}
                                domArea={'expedition_8'}
                                domMt={'expedition_9'}
                                compact
                            />
                            <input type="number" class="form-control" id="expedition_8" min="0" step="0.01"
                                defaultValue={_GET_EXPEDITION_JSON('tmp').uis ?? ''} />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Valor Estanpilla (COP)</label>
                        <input type="number" class="form-control" id="expedition_9" min="0" step="1"
                            defaultValue={_GET_EXPEDITION_JSON('taxes').uis ?? ''} />
                    </div>
                    <div className="col-2">
                        <label className="mt-1">Extra Valor (%)</label>
                        <input type="text" class="form-control" id="expedition_22"
                            defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_2_p ?? (_GLOBAL_ID == 'cb1' ? 0 : 10)} />
                    </div>
                    <div className="col">
                        <label className="mt-1">Factura #</label>
                        <input type="text" class="form-control" id="expedition_19"
                            defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_2 ?? ''} />
                    </div>
                </div>
                {_GLOBAL_ID === 'cb1' ?
                    <>
                        <label className="fw-bold mt-2 text-uppercase">Deberes Urbanísticos (SI ESTRATO {'>'} 2)</label>
                        <div className="row">
                            <div className="col">
                                <label className="mt-2">Fecha Deber Urbanistico</label>
                                <input type="date" class="form-control" id="expedition_10" max="2100-01-01"
                                    defaultValue={currentRecord.date2 ?? ''} />
                            </div>
                            <div className="col">
                                <label className="mt-1">{infoCud.serials.end} Deber Urbanístico</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="expedition_11"
                                        defaultValue={currentRecord.cub2 ?? ''} />
                                    <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID('expedition_11')}>GENERAR</button>
                                </div>
                            </div>
                            <div className="col">
                                <label className="mt-1">Factura #</label>
                                <input type="text" class="form-control" id="expedition_20"
                                    defaultValue={_GET_EXPEDITION_JSON('taxes').id_payment_3 ?? ''} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <label className="mt-1">Unidades Vivienda</label>
                                <input type="number" class="form-control" id="expedition_12" min="0" step="1"
                                    defaultValue={_GET_EXPEDITION_JSON('duty').units || value35[2] || ''} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Áreas uso Comercio</label>
                                <input type="number" class="form-control" id="expedition_13" min="0" step="0.01"
                                    defaultValue={_GET_EXPEDITION_JSON('duty').comerce || value35[0] || ''} />
                            </div>
                            <div className="col">
                                <label className="mt-1">Valor ZGU m2 (COP)</label>
                                <input type="number" class="form-control" id="expedition_14" min="0" step="0.01"
                                    defaultValue={_GET_EXPEDITION_JSON('duty').charge || json34.zugm || ''} />
                            </div>
                            <div className="col-2">
                                <label className="mt-1">ZGU</label>
                                <input type="text" class="form-control" id="expedition_15"
                                    defaultValue={_GET_EXPEDITION_JSON('duty').zgu || json34.zgu || ''} />
                            </div>
                        </div>
                    </> : ''}

            </>
        }
        // FUNCTIONS AND APIS Tipología edificatoria Aislad. /Plataforma Continua Artículo 471° POT

        var formData = new FormData();

        let save_exp = (e) => {
            if (e) e.preventDefault();
            formData = new FormData();

            let date = document.getElementById("expedition_1") ? document.getElementById("expedition_1").value : false;
            if (date) formData.set('date', date);
            let cub1 = document.getElementById("expedition_2") ? document.getElementById("expedition_2").value : false;
            formData.set('cub1', cub1);
            formData.set('prev_cub1', currentRecord.cub1);

            let tmp = _GET_EXPEDITION_JSON('tmp');

            if (document.getElementById("expedition_4")) tmp.type = document.getElementById("expedition_4").value;
            if (document.getElementById("expedition_8")) tmp.uis = document.getElementById("expedition_8").value;
            if (document.getElementById("expedition_16")) tmp.zone = document.getElementById("expedition_16").value;
            if (document.getElementById("expedition_17")) tmp.axis = document.getElementById("expedition_17").value;

            formData.set('tmp', JSONObjectParser(tmp));

            let taxes = _GET_EXPEDITION_JSON('taxes');

            if (document.getElementById("expedition_9")) taxes.uis = document.getElementById("expedition_9").value;
            if (document.getElementById("expedition_18")) taxes.id_payment_1 = document.getElementById("expedition_18").value;
            if (document.getElementById("expedition_19")) taxes.id_payment_2 = document.getElementById("expedition_19").value;
            if (document.getElementById("expedition_22")) taxes.id_payment_2_p = document.getElementById("expedition_22").value;
            if (document.getElementById("expedition_20")) taxes.id_payment_3 = document.getElementById("expedition_20").value;
            if (document.getElementById("expedition_21")) taxes.id_payment_4 = document.getElementById("expedition_21").value;
            if (document.getElementById("expedition_23")) taxes.id_payment_fix = document.getElementById("expedition_23").value;

            formData.set('taxes', JSONObjectParser(taxes));

            let date2 = document.getElementById("expedition_10") ? document.getElementById("expedition_10").value : false;
            if (date2) formData.set('date2', date2);
            let cub2 = document.getElementById("expedition_11") ? document.getElementById("expedition_11").value : '';
            formData.set('cub2', cub2);
            formData.set('prev_cub2', currentRecord.cub2);

            let duty = _GET_EXPEDITION_JSON('duty');

            if (document.getElementById("expedition_12")) duty.units = document.getElementById("expedition_12").value;
            if (document.getElementById("expedition_13")) duty.comerce = document.getElementById("expedition_13").value;
            if (document.getElementById("expedition_14")) duty.charge = document.getElementById("expedition_14").value;
            if (document.getElementById("expedition_15")) duty.zgu = document.getElementById("expedition_15").value;

            formData.set('duty', JSONObjectParser(duty));

            manage_exp();
        }

        let manage_exp = () => {
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            EXPEDITION_SERVICE.update(currentRecord.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });

                        this.props.requestUpdateRecord(currentItem.id);
                        this.props.requestUpdate(currentItem.id);
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACION",
                            text: `El concecutivo ${infoCud.serials.end} de este formulario ya existe, debe de elegir un concecutivo nuevo`,
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
        }
        return (
            <div className="record_ph_gen container">
                <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="nav_expedition_1">
                    <label className="app-p lead fw-normal">INFORMACION GENERAL</label>
                </legend>
                <form id="form_expedition" onSubmit={save_exp}>
                    {_COMPONENT_GENERAL()}
                    <div className="row text-center">
                        <div className="col">
                            <button className="btn btn-success my-3"><i class="far fa-check-square"></i>GUARDAR CAMBIOS </button>
                        </div>
                    </div>
                </form>
            </div >
        );
    }
}

export default EXP_1;