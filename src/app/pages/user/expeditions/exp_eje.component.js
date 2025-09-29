import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import SubmitService from '../../../services/submit.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Collapsible from 'react-collapsible';


import EXPEDITION_SERVICE from '../../../services/expedition.service';
import PQRS_Service from '../../../services/pqrs_main.service';
import FUN_SERVICE from '../../../services/fun.service';
import '../../../../styles/docs-expediente.css';

import { cities, domains_number, infoCud, zonesTable } from '../../../components/jsons/vars';
import { MDBBtn } from 'mdb-react-ui-kit';
import { dateParser, regexChecker_isOA_2, _ADDRESS_SET_FULL, _MANAGE_IDS } from '../../../components/customClasses/typeParse';
import { _FUN_1_PARSER, _FUN_4_PARSER, _FUN_6_PARSER } from '../../../components/customClasses/funCustomArrays';
import EXP_RES_2 from './exp_res_2.component';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
export default function EXP_EJEC(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, recordArc } = props;
    const [resDocData, setResDocData] = useState(null);

    let _GET_EXPEDITION_JSON = (field) => {
                let json = currentRecord[field];
                if (!json) return {}
                let object = JSON.parse(JSON.parse(json))
                return object
    }
    let _GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        if (!_CHILD[_CURRENT_VERSION]) return { tipo: '' };
        var _CHILD_VARS = {
            item_0: _CHILD[_CURRENT_VERSION].id,
            tipo: _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "",
            tramite: _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "",
            m_urb: _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "",
            m_sub: _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "",
            m_lic: _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "",
            item_6: _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "",
            item_7: _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "",
            item_8: _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "",
            item_9: _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "",
            item_101: _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "",
            item_102: _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "",
        }
        return _CHILD_VARS;
    }
    let _GET_CLOCK = () => {
        var _CHILD = currentItem.fun_clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CLOCK_STATE = (_state, _version) => {
        var _CLOCK = _GET_CLOCK();
        if (_state === null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state === _state) return _CLOCK[i];
        }
        return false;
    }
    let _RES_PARSER_1 = (fun_1) => {
        let parse = [];
        let licences = [];
        let mods = [];
        const _FUN_1_P = {
            'A': 'URBANIZACION',
            'B': 'PARCELACION',
            'C': 'SUBDIVISION',
            'D': 'CONSTRUCCION',
            'E': 'INTERVENCION Y OCUPACION DEL ESPACIO PUBLICO',
            'G': 'OTRAS ACTUACIONES',
        };
        const _FUN_1_3_p = {
            'A': 'DESARROLLO',
            'B': 'SANEAMIENTO',
            'C': 'RECUPERACION'
        };
        const _FUN_1_4_P = {
            'A': 'SUBDIVISION RURAL',
            'B': 'SUBDIVISION URBANA',
            'C': 'RELOTEO'
        };
        const _FUN_1_5 = {
            'A': 'OBRA NUEVA',
            'B': 'AMPLIACION',
            'C': 'ADECUACION',
            'D': 'MODIFICACION',
            'E': 'RESTAURACION',
            'F': 'REFORZAMIENTO ESTRUCTURAL',
            'G': 'DEMOLICION TOTAL',
            'g': 'DEMOLICION PARCIAL',
            'H': 'RECONSTRUCCION',
            'I': 'CERRAMIENTO'
        };
        let tipoArray = fun_1.tipo ? fun_1.tipo.split(',') : [];
        let fun_13_Array = fun_1.tipo ? fun_1.m_urb.split(',') : [];
        let fun_14_Array = fun_1.tipo ? fun_1.m_sub.split(',') : [];
        let fun_15_Array = fun_1.tipo ? fun_1.m_lic.split(',') : [];

        if (tipoArray.includes('F')) {
            parse.push('RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACION')
        }
        if (tipoArray.length > 1) parse.push('JUNTO CON LICENCIA DE')
        else { parse.push('LICENCIA DE') }

        tipoArray.map(value => { if (_FUN_1_P[value]) licences.push(_FUN_1_P[value]) });
        licences = licences.join(', ')
        parse.push(licences);

        parse.push('EN LA MODALIDAD DE')

        fun_13_Array.map(value => { if (_FUN_1_3_p[value]) mods.push(_FUN_1_3_p[value]) });
        fun_14_Array.map(value => { if (_FUN_1_4_P[value]) mods.push(_FUN_1_4_P[value]) });
        fun_15_Array.map(value => { if (_FUN_1_5[value]) mods.push(_FUN_1_5[value]) });
        mods = mods.join(', ')
        parse.push(mods);

        return parse.join(' ')
    }
    let LOAD_STEP = (_id_public, _record) => {
        var _CHILD = [];
        if (_record === 'arc') _CHILD = currentItem.record_arc_steps || [];
        if (_record === 'eng') _CHILD = currentItem.record_eng_steps || [];
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].id_public === _id_public) return _CHILD[i]
        }
        return []
    }
    let _GET_STEP_TYPE = (_id_public, _type, _record = 'arc') => {
        var STEP = LOAD_STEP(_id_public, _record);
        if (!STEP.id) return [];
        var value = STEP[_type] ? STEP[_type] : []
        if (!value) return [];
        value = value.split(';');
        return value
    }
    let _GET_CHILD_2 = () => {
        var _CHILD = currentItem.fun_2;
        if (!_CHILD) return {
            item_20: false,
            item_211: '',
            item_212: '',
            item_22: '',
            item_23: '',
            item_232: '',
            item_24: '',// PARSER
            item_25: '',// PARSER

            item_261: '',
            item_262: '',
            item_263: '',
            item_264: '',
            item_265: '',
            item_266: '',
            item_267: '',
            item_268: '',
        };
        var _CHILD_VARS = {
            item_20: _CHILD.id ?? false,
            item_211: _CHILD.direccion || '',
            item_212: _CHILD.direccion_ant ?? '',
            item_22: _CHILD.matricula || '',
            item_23: _CHILD.catastral || '',
            item_232: _CHILD.catastral2 || '',
            item_24: _CHILD.suelo ?? '',// PARSER
            item_25: _CHILD.lote_pla ?? '',// PARSER

            item_261: _CHILD.barrio ?? '',
            item_262: _CHILD.vereda ?? '',
            item_263: _CHILD.comuna ?? '',
            item_264: _CHILD.sector ?? '',
            item_265: _CHILD.corregimiento ?? '',
            item_266: _CHILD.lote ?? '',
            item_267: _CHILD.estrato ?? '',
            item_268: _CHILD.manzana ?? '',
        }
        return _CHILD_VARS;
    }

    let _MODEL_SELECTOR_EXEC = () => {
        var default_model = currentRecord.model_exec || 'eje_open';
        let models = [
            { value: 'eje_open', label: 'EJECUTORIA MODELO OTORGADO' },
            { value: 'eje_des', label: 'EJECUTORIA MODELO DESISTIDO' },
            { value: 'eje_neg', label: 'EJECUTORIA MODELO NEGADO' },
        ];

        return <>
            <div className="row">
                <div className="col">
                    <label className="mt-2">ACTO</label>
                    <div class="input-group">
                        <select className="form-select" id="expedition_doc_eje_model" defaultValue={default_model} onChange={(e) => {setResDocData(null); update_model_exec(e.target.value)}}>
                            {models.map(model => {
                                if (model.omit) return ''
                                if (model.group)
                                    return <optgroup label={model.group}>
                                        {model.items.map(m => <option value={m.value}>{m.label}</option>)}
                                    </optgroup>
                                else return <option value={model.value}>{model.label}</option>
                            })}
                        </select>
                    </div>
                </div>
            </div>
        </>
    }

    let _COMPONENT_EJE = () => {
        var reso = _GET_EXPEDITION_JSON('reso');
        var _CHILD_1 = _GET_CHILD_1();
        let type = reso.type || _RES_PARSER_1(_CHILD_1);

        const reso_vig_date_dv = reso.vig ? reso.vig.date : '';
        const reso_vig_n_dv = reso.vig ? reso.vig.n : '12';

        const reso_pot_dv = reso.pot ?? infoCud.pot;

        return <>
            <div className="row">
                <div className="col">
                    <label className="mt-2">Modalidad</label>
                    <input type="text" class="form-control" id="expedition_eje_type"
                        defaultValue={type} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label className="mt-1">Consecutivo</label>
                    <div class="input-group">
                        <input type="text" class="form-control" disabled id="expedition_eje_id_res"
                            value={currentRecord.id_public} />
                    </div>
                </div>
                <div className="col">
                    <label className="mt-1">POT</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_eje_pot" disabled
                            value={reso_pot_dv} />
                    </div>
                </div>
                <div className="col">
                    <label className="mt-1">Estado</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_eje_state" disabled
                            value={'EJECUTORIADA'} readOnly />

                    </div>
                </div>
                <div className="col">
                    <label className="mt-1"># Radicacion</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_eje_id_public" disabled
                            value={currentItem.id_public} readOnly />
                    </div>
                </div>
            </div>

            <hr />
            <div className="pdf-config clean-ui card p-3 shadow-sm pdf-edit">
                {/* UNA SOLA FILA: 3 tarjetas iguales */}
                <div className="row-equal">

                    {/* 1) MÁRGENES */}
                    <section className="card-box">
                    <header className="card-title">Márgenes (cm)</header>
                    <div className="fields vertical">
                        <div className="field">
                        <label className="field_label">Superior</label>
                        <input type="number" defaultValue={1.2} className="form-control form-control-sm" id="record_maring_top_exec" />
                        </div>
                        <div className="field">
                        <label className="field_label">Inferior</label>
                        <input type="number" defaultValue={1.2} className="form-control form-control-sm" id="record_maring_bot_exec" />
                        </div>
                        <div className="field">
                        <label className="field_label">Izquierdo</label>
                        <input type="number" defaultValue={1.9} className="form-control form-control-sm" id="record_maring_left_exec" />
                        </div>
                        <div className="field">
                        <label className="field_label">Derecho</label>
                        <input type="number" defaultValue={1.9} className="form-control form-control-sm" id="record_maring_right_exec" />
                        </div>
                    </div>
                    </section>

                    {/* 2) OPCIONES */}
                    <section className="card-box">
                    <header className="card-title">Opciones</header>
                    <div className="fields vertical">

                        <label className="field">
                            <span className="field_label">Paginación</span>
                            <input type="checkbox" className="form-check-input" id="record_rew_pages_exec" defaultChecked />
                        </label>

                        <div className="field">
                            <label className="field_label">Espaciado encabezado</label>
                            <input
                                type="number"
                                defaultValue={6}
                                className="form-control form-control-sm"
                                id="record_header_spacing_exec"
                            />
                        </div>

                        <div className="field">
                            <label className="field_label">
                                Fuente Cuerpo
                                <span className="badge bg-primary ms-2">pt</span>
                            </label>
                            <input
                                type="number"
                                defaultValue={14}
                                className="form-control form-control-sm"
                                id="record_font_size_body_exec"
                            />
                        </div>

                        <div className="field">
                        <label className="field_label">
                            Fuente Encabezado
                            <span className="badge bg-primary ms-2">pt</span>
                        </label>
                        <input
                            type="number"
                            defaultValue={10}
                            className="form-control form-control-sm"
                            id="record_font_size_header_exec"
                        />
                        </div>
                        
                    </div>
                    </section>

                    {/* 3) LOGO */}
                    <section className="card-box">
                    <header className="card-title">Logo</header>
                    <div className="fields vertical">
                        <div className="field">
                            <label className="field_label">Mostrar logo</label>
                            <select size={1} className="form-select form-select-sm" id="logo_pages_exec">
                                <option value="impar">Pág Impares</option>
                                <option value="par">Pág Pares</option>
                                <option value="all" selected>Todas las pág.</option>
                                <option value="none">No mostrar</option>
                            </select>
                        </div>

                        <div className="field">
                            <label className="field_label">Espaciado horizontal</label>
                            <input type="number" defaultValue={55} className="form-control form-control-sm" id="distance_icon_x_exec" />
                        </div>

                        <div className="field">
                            <label className="field_label">Espaciado vertical</label>
                            <input type="number" defaultValue={66} className="form-control form-control-sm" id="distance_icon_y_exec" />
                        </div>

                        <div className="field">
                            <label className="field_label">Autenticidad</label>
                            <select size={1} className="form-select form-select-sm" id="autenticidad_exec">
                                <option value="Original" selected>Original</option>
                                <option value="Copia">Copia</option>
                                <option value="Vacio">Vacío</option>
                            </select>
                        </div>
                    </div>
                    </section>
                </div>

                {/* Mensaje + botón */}
                <p className="text-muted small mt-3 mb-2 text-center">
                    Ajusta las opciones y usa “Editar PDF” para ver los cambios.
                </p>
            </div>

            <hr />
            <div className="row text-center">
                <div className="col">
                    <MDBBtn className="btn btn-success my-3" onClick={() => save_eje()}><i class="far fa-share-square"></i> GUARDAR CAMBIOS </MDBBtn>
                </div>
                <div className="col">
                    {process.env.REACT_APP_GLOBAL_ID === 'cb1' && (
                        <MDBBtn className="btn my-3" color="primary" onClick={() => pd_eje(true)}>
                            <i className="fas fa-edit me-2" />
                            Editar PDF
                        </MDBBtn>
                    )}
                </div>
            </div>
        </>
    }

    var formData = new FormData();

    let save_eje = () => {
        formData = new FormData();
        setResDocData(null);

        const reso = _GET_EXPEDITION_JSON('reso') || {};
        reso.vig = reso.vig || {};

        reso.vig.date = document.getElementById('expedition_eje_date')?.value || '';
        reso.vig.n    = document.getElementById('expedition_eje_vign')?.value || '12';

        formData.set('reso', JSON.stringify(reso));

        function applyPdfFormData(formData, suffix = 'desist') {
            const buildId = (base) => `${base}_${suffix}`;

            const getEl = (base) => {
                const id = buildId(base);
                let el = document.getElementById(id);
                if (!el) {
                el = document.getElementById(base);
                if (!el) {
                    console.warn(`[applyPdfFormData] No se encontró elemento con id="${id}" ni id="${base}"`);
                } else {
                    console.info(`[applyPdfFormData] Usando fallback id="${base}" (no encontró "${id}")`);
                }
                }
                return el;
            };

            const getSelectSingle = (base, def) => {
                const el = getEl(base);
                if (!el) return def;
                if (el.multiple) {
                const val = el.selectedOptions?.[0]?.value;
                return val || def;
                }
                const v = el.value;
                return (v == null || v === '') ? def : v;
            };

            const getNumber = (base, def) => {
                const el = getEl(base);
                if (!el) return def;
                const raw = String(el.value ?? '').trim();
                const n = Number(raw.replace(',', '.'));
                if (!Number.isFinite(n)) {
                console.warn(`[applyPdfFormData] Valor inválido en "${el.id}": "${raw}", usando default=${def}`);
                }
                return Number.isFinite(n) ? n : def;
            };

            const getCheck = (base, def = false) => {
                const el = getEl(base);
                if (!el) return def;
                return !!el.checked;
            };

            // === SELECTS (single) ===
            formData.set('logo_pages',   getSelectSingle('logo_pages',   'impar'));
            formData.set('autenticidad', getSelectSingle('autenticidad', 'Vacio'));

            // === NÚMEROS / CHECKS ===
            formData.set('font_size_body',        getNumber('record_font_size_body',   12));
            formData.set('font_size_header',      getNumber('record_font_size_header', 10));
            formData.set('distance_icon_x',       getNumber('distance_icon_x',         55));
            formData.set('distance_icon_y',       getNumber('distance_icon_y',         66));
            formData.set('record_header_spacing', getNumber('record_header_spacing',    6));

            formData.set('m_top',   getNumber('record_maring_top',   2.5));
            formData.set('m_bot',   getNumber('record_maring_bot',   2.5));
            formData.set('m_left',  getNumber('record_maring_left',  1.7));
            formData.set('m_right', getNumber('record_maring_right', 1.7));

            formData.set('r_pages',  getCheck('record_rew_pages')); // Si hay paginacion o no
        }

        applyPdfFormData(formData, 'exec');

        manage_exp();
    };

    let pd_eje = (editDocument = null) => {
        formData = new FormData();
        const reso = _GET_EXPEDITION_JSON('reso') || {};

        function applyPdfFormData(formData, suffix = 'desist') {
            const buildId = (base) => `${base}_${suffix}`;

            const getEl = (base) => {
                const id = buildId(base);
                let el = document.getElementById(id);
                if (!el) {
                el = document.getElementById(base);
                if (!el) {
                    console.warn(`[applyPdfFormData] No se encontró elemento con id="${id}" ni id="${base}"`);
                } else {
                    console.info(`[applyPdfFormData] Usando fallback id="${base}" (no encontró "${id}")`);
                }
                }
                return el;
            };

            const getSelectSingle = (base, def) => {
                const el = getEl(base);
                if (!el) return def;
                if (el.multiple) {
                const val = el.selectedOptions?.[0]?.value;
                return val || def;
                }
                const v = el.value;
                return (v == null || v === '') ? def : v;
            };

            const getNumber = (base, def) => {
                const el = getEl(base);
                if (!el) return def;
                const raw = String(el.value ?? '').trim();
                const n = Number(raw.replace(',', '.'));
                if (!Number.isFinite(n)) {
                console.warn(`[applyPdfFormData] Valor inválido en "${el.id}": "${raw}", usando default=${def}`);
                }
                return Number.isFinite(n) ? n : def;
            };

            const getCheck = (base, def = false) => {
                const el = getEl(base);
                if (!el) return def;
                return !!el.checked;
            };

            // === SELECTS (single) ===
            formData.set('logo_pages',   getSelectSingle('logo_pages',   'impar'));
            formData.set('autenticidad', getSelectSingle('autenticidad', 'Vacio'));

            // === NÚMEROS / CHECKS ===
            formData.set('font_size_body',        getNumber('record_font_size_body',   12));
            formData.set('font_size_header',      getNumber('record_font_size_header', 10));
            formData.set('distance_icon_x',       getNumber('distance_icon_x',         55));
            formData.set('distance_icon_y',       getNumber('distance_icon_y',         66));
            formData.set('record_header_spacing', getNumber('record_header_spacing',    6));

            formData.set('m_top',   getNumber('record_maring_top',   2.5));
            formData.set('m_bot',   getNumber('record_maring_bot',   2.5));
            formData.set('m_left',  getNumber('record_maring_left',  1.7));
            formData.set('m_right', getNumber('record_maring_right', 1.7));

            formData.set('r_pages',  getCheck('record_rew_pages')); // Si hay paginacion o no
        }

        applyPdfFormData(formData, 'exec');

        const rew_name = String(window.user.role_short + ' ' + window.user.name_full).toUpperCase();
        formData.set('r_simple_name', rew_name);
        formData.set('type_not', document.getElementById('expedition_eje_type')?.value ?? '');
        formData.set('tipo',     document.getElementById('expedition_eje_type')?.value ?? '');
        formData.set('date',     document.getElementById('expedition_eje_date')?.value ?? '');

        formData.set('dante',    document.getElementById('expedition_eje_vign')?.value ?? '12');

        const vRaw = document.getElementById('expedition_eje_vign')?.value ?? '12';
        const vigs = {
            '0': 'CERO (0) MESES',
            '12': 'DOCE (12) MESES',
            '24': 'VEINTICUATRO (24) MESES',
            '36': 'TREINTA Y SEIS (36) MESES',
            '48': 'CUARENTA Y OCHO (48) MESES',
        };
        formData.set('vn', vigs[vRaw] ?? vigs['12']);

        formData.set('reso_id',   document.getElementById('expedition_eje_id_res')?.value      ?? '');
        formData.set('id_public', document.getElementById('expedition_eje_id_public')?.value   ?? '');
        formData.set('reso_pot',  document.getElementById('expedition_eje_pot')?.value         ?? '');
        formData.set('reso_state',document.getElementById('expedition_eje_state')?.value       ?? '');

        formData.set('reso_date', reso.date ?? '');
        formData.set('lic_date',  _GET_CLOCK_STATE(3, false)?.date_start || false);

        formData.set('curaduria', infoCud.job);
        formData.set('ciudad',    infoCud.city);
        formData.set('record_version', 1);
        formData.set('id', currentItem.id);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        let fd = Object.fromEntries(formData.entries())

        EXPEDITION_SERVICE.gen_doc_eje(formData)
            .then(response => {
            if (response.data.status === 'OK') {
                if (editDocument) {
                const data = {
                    ...(response.data || {}),
                    fun_2_child: _GET_CHILD_2(),
                    formData: fd,
                };
                setResDocData(data);
                MySwal.close();
                } else {
                MySwal.close();
                window.open(
                    process.env.REACT_APP_API_URL + "/pdf/expdoceje/" + "Ejecutoria " + currentItem.id_public + ".pdf"
                );
                }
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
    };

    let update_model_exec = (model) => {
        formData = new FormData();
        formData.set('model_exec', model);
        manage_exp();
    };

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

                    props.requestUpdateRecord(currentItem.id);
                    props.requestUpdate(currentItem.id);
                } else if (response.data === 'ERROR_DUPLICATE') {
                    MySwal.fire({
                        title: "ERROR DE DUPLICACION",
                        text: "El concecutivo CUB de este formulario ya existe, debe de elegir un concecutivo nuevo",
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
    };


    return (
            <div>
                <div>
                    {_MODEL_SELECTOR_EXEC()}
                    <hr />
                    {_COMPONENT_EJE()}
    
                    <div>
                        {process.env.REACT_APP_GLOBAL_ID === 'cb1' && resDocData && (
                            <EXP_RES_2 data={resDocData} swaMsg={swaMsg} currentItem={currentItem} currentModel={currentRecord.model_exec || 'eje_open'}/>
                        )}
                    </div>  
                    
                </div>
            </div>
        );

}