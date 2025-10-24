/**
 * EXP_CLOCKS Component - Refactored with layered architecture
 * Manages expedition clocks with optimistic updates and proper business logic separation
 */

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

import VIZUALIZER from '../../../components/vizualizer.component';
import { dateParser_dateDiff, dateParser_finalDate, regexChecker_isOA_2 } from '../../../components/customClasses/typeParse';

// New architecture imports
import { 
  STEPS_TO_CHECK, 
  FUN_TYPE_TIME, 
  NEGATIVE_PROCESS_TITLE,
  getCategoryForTitle,
  STATE_CODES,
  MAX_SUSPENSION_DAYS 
} from './clocks/constants/clocksConstants';
import {
  getClockState,
  getClockStateVersion,
  getSuspensionPreActa,
  getSuspensionPostActa,
  getExtension,
  getTotalSuspensionDays,
  getNewestDate,
  canAddSuspension,
  canAddExtension,
  getAvailableSuspensionTypes,
  getDesistEvents
} from './clocks/selectors/clocksSelectors';
import { useClocksData } from './clocks/hooks/useClocksData';
import { useCuraduria } from './clocks/hooks/useCuraduria';
import { useLimits } from './clocks/hooks/useLimits';
import ControlBar from './clocks/components/ControlBar';
import { showSuspensionInfo } from './clocks/components/ClockModals';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

export default function EXP_CLOCKS(props) {
  const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, outCodes } = props;
  const [isFull, setIsFull] = useState(false);

  // Use new hooks for state management
  const { clocksData, refreshTrigger, applyLocalClockChange, saveClock } = useClocksData(currentItem, props.requestUpdate);
  const { curDetails, finalized, notStarted, paused, expired, inCourse } = useCuraduria(clocksData, currentItem.type);
  const { getLimit } = useLimits(clocksData, currentItem.type);

  // Helper functions using selectors
  const _GET_CLOCK_STATE = (state) => getClockState(clocksData, state);
  const _GET_CLOCK_STATE_VERSION = (state, version) => getClockStateVersion(clocksData, state, version);
  
  const _GET_CHILD_6 = () => currentItem.fun_6s || [];
  const _GET_CHILD_1 = () => {
    var _CHILD = currentItem.fun_1s;
    var _CURRENT_VERSION = currentVersion - 1;
    var _CHILD_VARS = { item_0: "", description: "" }
    if (_CHILD && _CHILD[_CURRENT_VERSION] != null) {
      _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
      _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
      _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
    }
    return _CHILD_VARS;
  }
  
  const conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false);
  const conGI = _GLOBAL_ID === 'cb1';
  const namePayment = _GLOBAL_ID === 'cb1' ? 'Impuestos Municipales' : 'Impuesto Delineacion';

  const _FIND_6 = (_ID) => {
    let _LIST = _GET_CHILD_6();
    for (var i = 0; i < _LIST.length; i++) if (_LIST[i].id == _ID) return _LIST[i];
    return null;
  }
  const _CHILD_6_SELECT = () => _GET_CHILD_6().map(f => <option key={f.id} value={f.id}>{f.description}</option>);

  const get_clockExistIcon = (state, icon = "") => {
    var _CHILD = _GET_CLOCK_STATE(state);
    if (_CHILD && icon !== "empty") {
      if (_CHILD.date_start || _CHILD.name === "RADICACIÓN") return <i className="far fa-check-circle text-success"></i>
      return <i className="far fa-dot-circle text-warning"></i>
    }
    return <i className="far fa-dot-circle"></i>
  }

  // Time control handlers using optimistic updates
  const addTimeControl = (type) => {
    if (type === 'suspension') {
      const availableTypes = getAvailableSuspensionTypes(clocksData);
      const availableDays = MAX_SUSPENSION_DAYS - getTotalSuspensionDays(clocksData);
      
      if (availableTypes.length === 0) {
        MySwal.fire({ title: 'No disponible', text: 'No hay espacios disponibles para añadir suspensiones', icon: 'warning' });
        return;
      }

      let typeSelectHtml = '';
      if (availableTypes.length > 1) {
        typeSelectHtml = `
          <div class="col-12">
            <label class="form-label">Ubicación de la Suspensión</label>
            <select id="susp_type" class="form-select">
              ${availableTypes.map(type => `<option value="${type.value}">${type.label}</option>`).join('')}
            </select>
          </div>
        `;
      } else {
        typeSelectHtml = `<input type="hidden" id="susp_type" value="${availableTypes[0].value}">`;
      }

      MySwal.fire({
        title: 'Nueva Suspensión de Términos',
        html: `
          <div class="row g-3">
            <div class="col-12">
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Días disponibles para suspensión: <strong>${availableDays}</strong>
              </div>
            </div>
            ${typeSelectHtml}
            <div class="col-12">
              <label class="form-label">Fecha de Inicio</label>
              <input type="date" id="susp_start" class="form-control"/>
            </div>
            <div class="col-12">
              <label class="form-label">Información Adicional</label>
              <textarea id="susp_info" class="form-control" rows="3" placeholder="Detalles sobre la suspensión..."></textarea>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const suspType = document.getElementById('susp_type').value;
          const startDate = document.getElementById('susp_start').value;
          const info = document.getElementById('susp_info').value.trim();
          if (!startDate) {
            Swal.showValidationMessage('La fecha de inicio es obligatoria');
            return false;
          }
          return { suspType, startDate, info };
        }
      }).then(result => {
        if (result.isConfirmed) {
          const { suspType, startDate, info } = result.value;
          const isPreActa = suspType === 'pre';
          const startState = isPreActa ? STATE_CODES.SUSP_PRE_START : STATE_CODES.SUSP_POST_START;

          const formDataStart = new FormData();
          formDataStart.set('date_start', startDate);
          formDataStart.set('desc', info || `Suspensión ${isPreActa ? 'antes' : 'después'} del acta`);
          formDataStart.set('name', `Inicio Suspensión ${isPreActa ? 'Pre-Acta' : 'Post-Acta'}`);

          saveClock(startState, formDataStart, false);
        }
      });

    } else if (type === 'extension') {
      MySwal.fire({
        title: 'Nueva Prórroga por Complejidad',
        html: `
          <div class="row g-3">
            <div class="col-12">
              <div class="alert alert-info">
                <i class="fas fa-clock me-2"></i>
                La prórroga por complejidad otorga <strong>22 días hábiles</strong> adicionales
              </div>
            </div>
            <div class="col-12">
              <label class="form-label">Fecha de Inicio</label>
              <input type="date" id="ext_start" class="form-control"/>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const startDate = document.getElementById('ext_start').value;
          if (!startDate) {
            Swal.showValidationMessage('La fecha de inicio es obligatoria');
            return false;
          }
          return { startDate };
        }
      }).then(result => {
        if (result.isConfirmed) {
          const { startDate } = result.value;
          const formDataStart = new FormData();
          formDataStart.set('date_start', startDate);
          formDataStart.set('desc', 'Prórroga por complejidad técnica');
          formDataStart.set('name', 'Inicio Prórroga por Complejidad');

          saveClock(STATE_CODES.EXT_START, formDataStart, false);
        }
      });
    }
  };

  // Save clock handler with optimistic updates
  const save_clock = (value, i) => {
    if (value.state === false || value.state == null) return;
    
    const dateInput = document.getElementById("clock_exp_date_" + i);
    const resolverSelect = document.getElementById("clock_exp_res_" + i);
    const id6Select = document.getElementById("clock_exp_id6_" + i);
    const idRelatedInput = document.getElementById("clock_exp_id_related_" + i);

    const dateVal = dateInput ? String(dateInput.value || '').trim() : '';
    let resolver_context = resolverSelect ? resolverSelect.value : false;
    let resolver_id6 = id6Select ? id6Select.value : 0;
    let id_related = idRelatedInput ? idRelatedInput.value : '';

    const formDataClock = new FormData();
    
    // Only set date_start if it has a value (avoid clearing dates)
    if (dateVal) formDataClock.set('date_start', dateVal);
    if (resolver_context) formDataClock.set('resolver_context', resolver_context);
    formDataClock.set('resolver_id6', resolver_id6);
    formDataClock.set('id_related', id_related);

    // Description, with adjustment for suspension ends (350/351)
    let descBase = value.desc || '';
    if ((value.state === STATE_CODES.SUSP_PRE_END || value.state === STATE_CODES.SUSP_POST_END) && dateVal) {
      const isEndPre = value.state === STATE_CODES.SUSP_PRE_END;
      const suspData = isEndPre ? getSuspensionPreActa(clocksData) : getSuspensionPostActa(clocksData);
      const startSusp = suspData.start?.date_start;
      if (startSusp) {
        const daysUsed = dateParser_dateDiff(startSusp, dateVal);
        descBase = `Fin de suspensión (${daysUsed} días)`;
      }
    }
    if (resolver_context) descBase = (descBase ? (descBase + ': ') : '') + resolver_context;

    formDataClock.set('desc', descBase);
    formDataClock.set('name', value.name);

    saveClock(value.state, formDataClock, false);
  };

  // Clock definitions (kept mostly as original for compatibility)
  const viaTime = () => {
    const evaDefaultTime = FUN_TYPE_TIME[currentItem.type] ?? 45;
    let ldfTime = (_GET_CLOCK_STATE(STATE_CODES.LDF) || {}).date_start;
    let actaTime = (_GET_CLOCK_STATE(STATE_CODES.ACTA_1) || {}).date_start;
    let acta2Time = (_GET_CLOCK_STATE(STATE_CODES.ACTA_2) || {}).date_start;
    let corrTime = (_GET_CLOCK_STATE(STATE_CODES.CORR_RADICACION) || {}).date_start;

    const totalSuspensionDays = getTotalSuspensionDays(clocksData);
    const extension = getExtension(clocksData);
    const extensionDays = extension.exists ? extension.days : 0;

    let time = evaDefaultTime;

    if (ldfTime && actaTime) {
      if (acta2Time && corrTime) {
        time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime) - dateParser_dateDiff(acta2Time, corrTime);
      } else {
        time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime);
      }
      time += totalSuspensionDays + extensionDays;
    }
    if (time < 1) time = 1;
    return time;
  };

  const requereCorr = () => {
    let actaClock = _GET_CLOCK_STATE(STATE_CODES.ACTA_1);
    let con = false;
    if (actaClock && actaClock.desc) {
      if (actaClock.desc.includes('NO CUMPLE')) con = true;
    }
    return con;
  }

  const presentExt = () => {
    let clock34 = _GET_CLOCK_STATE(34);
    return clock34 && clock34.date_start ? true : false;
  }

  // Clock list generators (kept from original)
  let getSuspList = (version = 1) => {
    const acta1 = _GET_CLOCK_STATE(STATE_CODES.ACTA_1);
    const suspList = [];

    if (version === 1) {
      const preSusp = getSuspensionPreActa(clocksData);
      if (preSusp.exists) {
        suspList.push({ title: 'SUSPENSIÓN ANTES DEL ACTA' });
        suspList.push({
          state: STATE_CODES.SUSP_PRE_START,
          name: 'Inicio de Suspensión',
          desc: preSusp.start.desc || "Suspensión antes del acta",
          editableDate: true,
          hasConsecutivo: false,
          hasAnnexSelect: true,
          suspensionInfo: { data: preSusp, type: 'pre' }
        });
        suspList.push({
          state: STATE_CODES.SUSP_PRE_END,
          name: 'Fin de Suspensión',
          desc: preSusp.end?.desc || `Fin de suspensión (${preSusp.days} días)`,
          editableDate: true,
          hasConsecutivo: false,
          hasAnnexSelect: true,
        });
      }
    } else {
      const postSusp = getSuspensionPostActa(clocksData);
      if (postSusp.exists && acta1 && postSusp.start.date_start >= acta1.date_start) {
        suspList.push({ title: 'SUSPENSIÓN DESPUÉS DEL ACTA' });
        suspList.push({
          state: STATE_CODES.SUSP_POST_START,
          name: 'Inicio de Suspensión',
          desc: postSusp.start.desc || "Suspensión después del acta",
          editableDate: true,
          hasConsecutivo: false,
          hasAnnexSelect: true,
          suspensionInfo: { data: postSusp, type: 'post' }
        });
        suspList.push({
          state: STATE_CODES.SUSP_POST_END,
          name: 'Fin de Suspensión',
          desc: postSusp.end?.desc || `Fin de suspensión (${postSusp.days} días)`,
          editableDate: true,
          hasConsecutivo: false,
          hasAnnexSelect: true,
        });
      }
    }

    return suspList;
  }

  let getExtList = (version = 1) => {
    const extension = getExtension(clocksData);
    if (!extension.exists) return [];

    const acta1 = _GET_CLOCK_STATE(STATE_CODES.ACTA_1);
    let isRelevant = false;
    if (version === 2) {
      isRelevant = acta1 && extension.start.date_start >= acta1.date_start;
    } else {
      isRelevant = !acta1 || extension.start.date_start < acta1.date_start;
    }
    if (!isRelevant) return [];

    const extList = [
      { title: 'PRÓRROGA POR COMPLEJIDAD' },
      {
        state: STATE_CODES.EXT_START,
        name: 'Inicio de Prórroga',
        desc: extension.start.desc || "Prórroga por complejidad técnica",
        editableDate: true,
        hasConsecutivo: false,
        hasAnnexSelect: true,
      }
    ];

    if (extension.end && extension.end.date_start) {
      extList.push({
        state: STATE_CODES.EXT_END,
        name: 'Fin de Prórroga',
        desc: extension.end.desc || `Fin de prórroga (${extension.days} días)`,
        editableDate: true,
        hasConsecutivo: false,
        hasAnnexSelect: true,
      });
    }

    return extList;
  }

  let desistClocks = (version) => {
    if (conOA()) return [];
    const hasDesistProcess = _GET_CLOCK_STATE_VERSION(-5, version) || _GET_CLOCK_STATE_VERSION(-6, version);
    if (!hasDesistProcess) return [];
    return [
      { title: `DESISTIDO POR: ${NEGATIVE_PROCESS_TITLE[version] || 'MOTIVO NO ESPECIFICADO'}` },
      {
        state: STEPS_TO_CHECK,
        version: version,
        editableDate: false,
        hasConsecutivo: false,
        hasAnnexSelect: false,
        optional: true
      }
    ];
  }

  let extraClocks = () => {
    if (conOA()) return []
    else return [
      { title: 'RADICACIÓN' },
      { state: false, name: 'Radicación', desc: "Tiempo de Creación en el sistema", manualDate: currentItem.date, editableDate: false, hasConsecutivo: false, hasAnnexSelect: false, },
      { state: 3, name: 'Expensas Fijas', desc: "Pago de Expensas Fijas", editableDate: false, hasConsecutivo: false, hasAnnexSelect: false, },
      { state: -1, name: 'Incompleto', desc: false, editableDate: false, limit: [[3, false], 30], hasConsecutivo: false, hasAnnexSelect: false, icon: "empty" },
      { state: STATE_CODES.LDF, name: 'Legal y debida forma', desc: false, editableDate: false, limit: regexChecker_isOA_2(_GET_CHILD_1()) ? [[4, false], -30] : [[3, false], 30], hasConsecutivo: false, hasAnnexSelect: false },
      ...desistClocks(-1),
      ...desistClocks(-2),
      ...getSuspList(1),
      ...getExtList(1),
      { title: 'ACTA PARTE 1: OBSERVACIONES' },
      { state: STATE_CODES.ACTA_1, name: 'Acta Parte 1: Observaciones', desc: "Acta de Observaciones inicial", limit: [[STATE_CODES.LDF, false], FUN_TYPE_TIME[currentItem.type] ?? 45], },
      { state: 31, name: 'Citación (Observaciones)', desc: "Citación para Observaciones", limit: [[STATE_CODES.ACTA_1, false],5], hasConsecutivo: false, hasAnnexSelect: false, },
      { state: 32, name: 'Notificación (Observaciones)', desc: "Notificación de Observaciones", limit: [31, 5], info: ['PERSONAL', 'ELECTRÓNICO'], },
      { state: 33, name: 'Notificación por aviso (Observaciones)', desc: "Notificación por aviso de Observaciones", limit: [31, 10], icon: "empty", info: ['CERTIFICADO', 'ELECTRÓNICO'], },
      { state: 34, name: 'Prórroga correcciones', desc: "Prórroga para presentar correcciones", limit: [[33, 32], [STATE_CODES.ACTA_1, 30]], icon: "empty", hasConsecutivo: false, hasAnnexSelect: false, },
      { state: STATE_CODES.CORR_RADICACION, name: 'Radicación de Correcciones', desc: requereCorr() ? "Radicación de documentos corregidos" : false, limit: [[33, 32], presentExt() ? [45, 35, 40] : [STATE_CODES.ACTA_1, 35, 40]], icon: requereCorr() ? undefined : "empty", hasConsecutivo: false, hasAnnexSelect: false, },
      ...getSuspList(2),
      ...getExtList(2),
      { title: 'ACTA PARTE 2: CORRECCIONES' },
      { state: STATE_CODES.ACTA_2, name: 'Acta Parte 2: Correcciones', desc: requereCorr() ? "Acta de revisión de correcciones" : false, limit: [[STATE_CODES.CORR_RADICACION, false], 50], limitValues: viaTime(), icon: requereCorr() ? undefined : "empty", },
      ...desistClocks(-3),
      ...desistClocks(-4),
      ...desistClocks(-5),
      { title: 'ACTA DE VIABILIDAD' },
      { state: STATE_CODES.ACTO_VIABILIDAD, name: 'Acto de Tramite de Licencia (Viabilidad)', desc: "Tramite de viabilidad Licencia", limit: false, },
      { state: 55, name: 'Citación (Viabilidad)', desc: "Comunicación o Requerimiento para el tramite de viabilidad de Licencia", limit: [STATE_CODES.ACTO_VIABILIDAD, 5], info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'], },
      { state: 56, name: 'Notificación (Viabilidad)', desc: "Se le notifica al solicitante del Tramite de viabilidad Licencia", limit: [55, 5], info: ['PERSONAL', 'ELECTRÓNICO'], },
      { state: 57, show: false, name: 'Notificación por aviso (Viabilidad)', desc: "El solicitante NO se presento para el Tramite de viabilidad Licencia, fue informado por otros medios", limit: [55, 10], icon: "empty", info: ['CERTIFICADO', 'ELECTRÓNICO'], },
    ]
  }

  const paymentsClocks = [
    { title: 'PAGOS' },
    { state: 62, name: 'Expensas Variables', desc: "Pago de Expensas Variables", limit: [STATE_CODES.ACTA_2, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: conOA() },
    { state: 63, name: namePayment, desc: "Pago de Impuestos Municipales", limit: [STATE_CODES.ACTA_2, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: conOA() },
    { state: 64, name: 'Estampilla PRO-UIS', desc: "Pago de Estampilla PRO-UIS", limit: [STATE_CODES.ACTA_2, 30], info: ['PAGO', 'NO PAGO', 'NA'] },
    { state: 65, name: 'Deberes Urbanísticos', desc: "Pago de Deberes Urbanísticos", limit: [STATE_CODES.ACTA_2, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: !conGI },
    { state: 69, name: 'Radicacion de último pago', desc: "Último pago realizado", limit: [[56, 57], 30] },
    ...desistClocks(-4),
  ];

  const clocks = [
    ...extraClocks(),
    ...paymentsClocks,
    { title: 'RESOLUCIÓN' },
    { state: 70, name: "Acto Administrativo / Resolución ", desc: "Expedición Acto Administrativo ", limit: [69, 5], info: ['OTORGA', 'NIEGA', 'DESISTE', 'RECURSO', 'REVOCATORIA DIRECTA', 'SILENCIO ADMINISTRATIVO', 'ACLARACIONES Y CORRECCIONES', 'INTERNO', 'OTRO'] },
    { state: 71, name: "Comunicación o Requerimiento(Resolución)", desc: "Comunicación para notificar al solicitante de Acto Administrativo", info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'] },
    { state: 72, name: "Notificación (Resolución)", desc: "Se le notifica al solicitante del Acto Administrativo", limit: [71, 5], info: ['PERSONAL', 'ELECTRÓNICO',] },
    { state: 73, name: "Notificación por aviso (Resolución)", desc: "El solicitante NO se presento para el Acto Administrativo, fue informado por otros medios", limit: [71, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'] },
    { state: 731, name: "Notificación (Planeación)", desc: "Se notificar a la oficina de planeación", limit: [71, 5], info: ['PERSONAL', 'ELECTRÓNICO', 'NA'] },
    { state: 730, name: "Renuncia de Términos", desc: "Se renuncia a los términos", },
    { title: 'RECURSO' },
    { state: 74, name: "Recurso", desc: "Se presenta recurso", limit: [71, 15], info: ['REPOSICIÓN', 'APELACIÓN', 'QUEJA'], },
    { state: 75, name: "Resuelve Recurso", desc: "El recurso se resuelve", limit: [74, 30], info: ['CONFIRMA', 'REVOCA - MODIFICA'], requiredClock: 74 },
    { state: 751, name: "Comunicación o Requerimiento(Recurso)", desc: "Comunicación para notificar al solicitante de Recurso", limit: [74, 5], info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'], requiredClock: 74 },
    { state: 752, name: "Notificación (Recurso)", desc: "Se le notifica al solicitante del Recurso", limit: [751, 5], info: ['PERSONAL', 'ELECTRÓNICO',], requiredClock: 74 },
    { state: 733, name: "Notificación por aviso (Recurso)", desc: "El solicitante NO se presento para el Recurso, fue informado por otros medios", limit: [751, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'], requiredClock: 74 },
    { state: 762, name: "Traslado Recurso", desc: "Se traslada el recurso", limit: [75, 5], requiredClock: 74 },
    { state: 76, name: "Apelación (Planeación)", desc: "El recurso se resuelve por planeación", limit: [74, 30], info: ['CONFIRMA', 'REVOCA - MODIFICA'], requiredClock: 74 },
    { state: 761, name: "Recepción Notificación (Planeación)", desc: "Se recibe el recurso de planeación", requiredClock: 74 },
    { title: 'LICENCIA' },
    { state: 85, name: "Publicación", desc: "Se publica la Licencia", info: ['PRENSA', 'PAGINA'] },
    { state: 99, name: "Ejecutoria - Licencia", desc: "Expedición de Licencia", limit: [[72, 73], 10], },
    { state: 98, name: "Entrega de Licencia", desc: "La licencia fue entregada oficialmente", },
  ]

  // Render functions
  const Header = () => (
    <div className="exp-head d-flex align-items-center justify-content-between">
      <div className="small w-100">
        <div className="row g-2 m-0 fw-bold">
          <div className="col-4">EVENTO</div>
          <div className="col-2 text-center">FECHA</div>
          <div className="col-2 text-center">LÍMITE</div>
          <div className="col-2 text-center">INFO</div>
          <div className="col-1 text-center">CONSEC.</div>
          <div className="col-1 text-center">DOC</div>
        </div>
      </div>
    </div>
  );

  const _COMPONENT_CLOCK_LIST = () => {
    const expandedClocks = [];
    clocks.forEach((value, originalIndex) => {
      if (Array.isArray(value.state) && value.version !== undefined) {
        value.state.forEach((stateItem) => {
          expandedClocks.push({ ...value, state: stateItem, originalIndex });
        });
      } else {
        expandedClocks.push({ ...value, originalIndex });
      }
    });

    let lastTitle = '';

    return expandedClocks.map((value, i) => {
      var clock;
      if (value.version !== undefined) clock = _GET_CLOCK_STATE_VERSION(value.state, value.version);
      else clock = _GET_CLOCK_STATE(value.state);

      if (!clock && value.optional) return null;

      // Calculate dynamic limits (kept from original for compatibility)
      if (value.limitValues) {
        let corrTime = (_GET_CLOCK_STATE(STATE_CODES.CORR_RADICACION) || {}).date_start;
        let extension = getExtension(clocksData);
        let postSusp = getSuspensionPostActa(clocksData);

        let baseDate = null;
        let calculatedLimit = null;

        if (extension.exists && corrTime && extension.start.date_start >= corrTime) {
          baseDate = extension.start.date_start;
          calculatedLimit = dateParser_finalDate(baseDate, value.limitValues);
        } else if (postSusp.exists && postSusp.end && corrTime && postSusp.end.date_start >= corrTime) {
          baseDate = postSusp.end.date_start;
          calculatedLimit = dateParser_finalDate(baseDate, value.limitValues);
        } else if (corrTime) {
          baseDate = corrTime;
          calculatedLimit = dateParser_finalDate(baseDate, value.limitValues);
        }

        if (calculatedLimit) {
          value.calculatedLimit = calculatedLimit;
          value.limitBaseDate = baseDate;
        }
      }

      if (value.requiredClock) {
        let needClock = _GET_CLOCK_STATE(value.requiredClock)
        if (!needClock?.date_start) return null;
      }
      if (value.show === false) return null;

      const currentClock = (value.state !== false && value.state != null)
        ? (value.version !== undefined
          ? (_GET_CLOCK_STATE_VERSION(value.state, value.version) || {})
          : (_GET_CLOCK_STATE(value.state) || {}))
        : {};

      const currentDate = currentClock.date_start ?? value.manualDate ?? clock?.date_start ?? '';
      const canEditDate = value.editableDate !== false && value.state !== false;
      const showConsecutivo = value.hasConsecutivo !== false;
      const showAnnexSelect = value.hasAnnexSelect !== false;

      const sentenceCaseEs = (s) => {
        if (typeof s !== 'string') return s;
        const base = s.normalize('NFC').toLocaleLowerCase('es');
        return base.replace(/^(\p{L})/u, c => c.toLocaleUpperCase('es'));
      };

      // Use new limit calculation from useLimits hook
      const limitInfo = getLimit(value.state, currentDate);

      let indentLevel = 0;
      if (value.title) indentLevel = 0;
      else if (value.name && (
        value.name.includes('Comunicación') ||
        value.name.includes('Notificación') ||
        value.name.includes('Citación') ||
        value.name.includes('Prórroga') ||
        value.name.includes('Radicación de Correcciones') ||
        value.name.includes('Traslado') ||
        value.name.includes('Recepción') ||
        value.name.includes('Fin de')
      )) indentLevel = 2;
      else indentLevel = 1;

      if (value.title) lastTitle = value.title;
      const cat = getCategoryForTitle(lastTitle);

      return (
        <React.Fragment key={`row-${i}-${value.state ?? 'no-state'}-${value.version ?? 'no-version'}-${refreshTrigger}`}>
          {value.title ? (
            <div className="exp-section" style={{ '--cat': cat.color }}>
              <div className="d-flex align-items-center mb-1">
                <i className={`fas ${cat.icon} me-2`}></i>
                <strong className="text-uppercase">{value.title}</strong>
              </div>
            </div>
          ) : (
            <div className="exp-row border-bottom" style={{ '--cat': cat.color }}>
              <div className="row g-2 align-items-center px-3 py-2">
                <div className="col-4 mt-0">
                  <div style={{ paddingLeft: `${indentLevel * 1.1}rem` }} className="d-flex align-items-center">
                    {indentLevel > 0 && (
                      <span className="text-muted me-2" style={{ fontSize: '1rem' }}>
                        {indentLevel === 2 ? '└' : '•'}
                      </span>
                    )}
                    <span className="me-2" style={{ minWidth: 16 }}>
                      {get_clockExistIcon(value.state, value.icon)}
                    </span>
                    <span className="">
                      {value.name ?? sentenceCaseEs(clock?.name) ?? ``}
                    </span>
                  </div>
                </div>

                <div className="col-2 px-1">
                  {canEditDate && value.version === undefined ? (
                    <input
                      type="date"
                      className="form-control form-control-sm p-1"
                      id={'clock_exp_date_' + i}
                      max="2100-01-01"
                      defaultValue={currentDate}
                      onBlur={() => save_clock(value, i)}
                    />
                  ) : (
                    <div className="text-center small">
                      {currentDate ? currentDate : <span className='text-danger'>-</span>}
                    </div>
                  )}
                </div>

                <div className="col-2 text-center small">
                  {/* LÍMITE: use new limit calculation */}
                  {limitInfo ? (
                    <span className={limitInfo.className} title={limitInfo.tooltip}>
                      {limitInfo.label}
                    </span>
                  ) : value.calculatedLimit ? (
                    <span className="text-primary" title={`Calculado desde: ${value.limitBaseDate}`}>
                      {value.calculatedLimit}
                    </span>
                  ) : value.limit ? (
                    Array.isArray(value.limit[0])
                      ? dateParser_finalDate(getNewestDate(clocksData, value.limit[0]), value.limit[1])
                      : dateParser_finalDate((_GET_CLOCK_STATE(value.limit[0]) || {}).date_start, value.limit[1])
                  ) : ''}
                </div>

                <div className="col-2 px-1">
                  <div className="d-flex align-items-center gap-1">
                    {value.info ? (
                      <select
                        className='form-select form-select-sm p-1'
                        style={{ minWidth: '80px', flex: '1' }}
                        id={'clock_exp_res_' + i}
                        defaultValue={currentClock.resolver_context ?? ''}
                        onChange={() => save_clock(value, i)}
                        disabled={value.version !== undefined}
                      >
                         <option value="">- Seleccione -</option>
                        {value.info.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : ''}
                    
                    {value.suspensionInfo && (
                      <button
                        type="button"
                        className="btn btn-outline-info btn-suspension-info"
                        title="Ver información de suspensión"
                        onClick={() => showSuspensionInfo(value.suspensionInfo.data, value.suspensionInfo.type)}
                      >
                        <i className="fas fa-question"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="col-1 px-1">
                  {showConsecutivo && (
                    <>
                      <input
                        list="codes_exp"
                        autoComplete='off'
                        className='form-control form-control-sm p-1'
                        id={'clock_exp_id_related_' + i}
                        defaultValue={currentClock.id_related ?? ''}
                        onBlur={() => save_clock(value, i)}
                        disabled={value.version !== undefined}
                      />
                      <datalist id="codes_exp">
                        {outCodes.map((data) => <option key={data.cub} value={data.cub}></option>)}
                      </datalist>
                    </>
                  )}
                </div>

                <div className="col-1 px-1">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    {showAnnexSelect && (
                      <select
                        className='form-select form-select-sm p-1'
                        id={'clock_exp_id6_' + i}
                        defaultValue={currentClock.resolver_id6 ?? 0}
                        onChange={() => save_clock(value, i)}
                        disabled={value.version !== undefined}
                      >
                        <option value="-1">FIS</option>
                        <option value="0">N/A</option>
                        {_CHILD_6_SELECT()}
                      </select>
                    )}

                    {(currentClock.resolver_id6 ?? 0) > 0 ? (() => {
                      const file = _FIND_6(currentClock.resolver_id6);
                      if (file?.path && file?.filename) {
                        return (
                          <VIZUALIZER
                            url={`${file.path}/${file.filename}`}
                            apipath={'/files/'}
                            icon={'fas fa-search'}
                            iconWrapper={'btn btn-sm btn-info p-1 shadow-none'}
                          />
                        )
                      }
                      return null;
                    })() : null}
                  </div>
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      )
    })
  }

  const _COMPONENT_CLOCKS = () => (
    <>
      <div className="card exp-card">
        <Header />
        <div className="exp-scroll">
          {_COMPONENT_CLOCK_LIST()}
        </div>
      </div>

      {isFull && (
        <div className="exp-fullscreen">
          <div className="exp-fullscreen-inner">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="m-0">Reloj del Proceso</h6>
              <button className="btn btn-sm btn-light" onClick={() => setIsFull(false)}>
                <i className="fas fa-compress"></i> Cerrar
              </button>
            </div>
            <ControlBar
              extension={getExtension(clocksData)}
              totalSuspensionDays={getTotalSuspensionDays(clocksData)}
              canAddSusp={canAddSuspension(clocksData)}
              canAddExt={canAddExtension(clocksData)}
              onAddTimeControl={addTimeControl}
              curDetails={curDetails}
              stateFlags={{ finalized, notStarted, paused, expired, inCourse }}
              desistEvents={getDesistEvents(clocksData, STEPS_TO_CHECK)}
              isDesisted={getDesistEvents(clocksData, STEPS_TO_CHECK).length > 0}
              onToggleFull={() => setIsFull(false)}
              isFull={isFull}
            />
            <div className="card exp-card mb-0">
              <Header />
              <div className="exp-scroll exp-scroll-full">
                {_COMPONENT_CLOCK_LIST()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="exp-wrapper">
      <ControlBar
        extension={getExtension(clocksData)}
        totalSuspensionDays={getTotalSuspensionDays(clocksData)}
        canAddSusp={canAddSuspension(clocksData)}
        canAddExt={canAddExtension(clocksData)}
        onAddTimeControl={addTimeControl}
        curDetails={curDetails}
        stateFlags={{ finalized, notStarted, paused, expired, inCourse }}
        desistEvents={getDesistEvents(clocksData, STEPS_TO_CHECK)}
        isDesisted={getDesistEvents(clocksData, STEPS_TO_CHECK).length > 0}
        onToggleFull={() => setIsFull(true)}
        isFull={isFull}
      />
      {_COMPONENT_CLOCKS()}

      <style>{`
        .control-bar .bar-inner { display: flex; width: 100%; }
        .control-bar .actions { flex: 0 0 auto; display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
        .control-bar .control-meta { margin-left: auto; text-align: right; min-width: 280px; }
        .control-bar .status-chips .badge { font-weight: 600; }

        :root { --headH: 44px; }

        .control-bar { position: relative; z-index: 1; }
        .control-bar .btn-sm { padding: .25rem .75rem; font-size: .875rem; }
        .control-bar .bar-inner { display: flex; }
        .control-bar .actions { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
        .control-bar .control-meta { margin-left: auto; text-align: right; }

        .exp-card{
          border-radius: 6px;
          box-shadow: 0 6px 16px rgba(0,0,0,.06);
          overflow: hidden;
          border: 1px solid #e9ecef;
        }

        .exp-head{
          position: sticky; top: 0; z-index: 20;
          height: var(--headH);
          background: #5bc0de; color: #fff;
          padding: .5rem .75rem;
          display: flex;
          border-top-left-radius: 6px; border-top-right-radius: 6px;
        }
        .exp-full-btn{ line-height: 1; }

        .exp-scroll{
          max-height: 80vh;
          overflow-y: auto;
          overflow-x: hidden;
          font-size: .95rem;
        }

        .exp-row{
          background: #fff;
          position: relative;
          transition: background-color .2s;
        }
        .exp-row::before{
          content: ""; position: absolute; left: 0; top: 0; bottom: 0;
          width: 4px; background: var(--cat, #6c757d);
          border-top-left-radius: 6px; border-bottom-left-radius: 6px;
        }
        .exp-row:hover{ background: #eaf3ff; }

        .exp-section{
          background: #f8f9fa;
          border-left: 4px solid var(--cat, #6c757d);
          border-radius: 0 8px 8px 0;
          padding: .35rem .75rem;
          font-size: .95rem; letter-spacing: .4px;
          margin: 0;
          position: static !important;
          top: auto !important;
          z-index: auto !important;
        }

        .form-control-sm, .form-select-sm { height: 30px; padding: .15rem .35rem !important; }

        .btn-suspension-info {
          min-width: 28px; height: 28px; padding: 0;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid #17a2b8; color: #17a2b8;
          background: white; border-radius: 4px; flex-shrink: 0;
        }
        .btn-suspension-info:hover { background-color: #17a2b8; color: white; border-color: #17a2b8; }
        .btn-suspension-info i { font-size: 12px; font-weight: bold; }

        .exp-scroll::-webkit-scrollbar{ width: 8px; }
        .exp-scroll::-webkit-scrollbar-track{ background: #f1f1f1; }
        .exp-scroll::-webkit-scrollbar-thumb{ background: #bdbdbd; border-radius: 4px; }
        .exp-scroll::-webkit-scrollbar-thumb:hover{ background: #9e9e9e; }

        .exp-fullscreen{
          position: fixed; inset: 0;
          background: rgba(0,0,0,.35);
          backdrop-filter: blur(1px);
          z-index: 1050;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .exp-fullscreen-inner{
          width: min(1400px, 96vw);
          height: min(92vh, 900px);
          background: #fff; border-radius: 8px; padding: .75rem;
          box-shadow: 0 10px 30px rgba(0,0,0,.2);
          display: flex; flex-direction: column;
        }
        .exp-scroll-full{ max-height: calc(92vh - 120px); }

        .exp-wrapper{ overflow-x: hidden; }

        .text-primary { color: #0d6efd !important; }
        .text-info { color: #0dcaf0 !important; }
        .text-warning { color: #ffc107 !important; }
        .alert-info { 
          color: #055160; background-color: #cff4fc; border-color: #b6effb; 
        }
      `}</style>
    </div>
  );
}
