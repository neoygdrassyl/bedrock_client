import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import VIZUALIZER from '../../../components/vizualizer.component';
import FUN_SERVICE from '../../../services/fun.service';
import { dateParser_dateDiff, dateParser_finalDate, regexChecker_isOA_2 } from '../../../components/customClasses/typeParse';
import moment from 'moment';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

export default function EXP_CLOCKS(props) {
  const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, outCodes } = props;
  const [isFull, setIsFull] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [clocksData, setClocksData] = useState([]);

  const stepsToCheck = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];
  const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
  const NegativePRocessTitle = {
    '-1': 'INCOMPLETO',
    '-2': 'FALTA VALLA INFORMATIVA',
    '-3': 'NO CUMPLE ACTA CORRECCIONES',
    '-4': 'NO PAGA EXPENSAS',
    '-5': 'VOLUNTARIO',
    '-6': 'NEGADA',
  }

  // *************** EFECTO PARA REFRESCAR AUTOMÁTICAMENTE **************** //
  useEffect(() => {
    if (currentItem?.fun_clocks) {
      setClocksData([...currentItem.fun_clocks]);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [currentItem?.fun_clocks]);

  // *************** DATA GETTERS **************** //
  // Usar SIEMPRE la copia local clocksData para refresco inmediato
  let _GET_CLOCK = () => clocksData || [];
  let _GET_CHILD_6 = () => currentItem.fun_6s || [];
  let _GET_CHILD_1 = () => {
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
  let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)
  let conGI = _GLOBAL_ID === 'cb1'
  let namePayment = _GLOBAL_ID === 'cb1' ? 'Impuestos Municipales' : 'Impuesto Delineacion'

  // *************** CONVERTERS ****************** //
  let _GET_CLOCK_STATE = (_state) => {
    var _CLOCK = _GET_CLOCK();
    if (_state == null) return false;
    for (var i = 0; i < _CLOCK.length; i++) {
      if (_CLOCK[i].state == _state) return _CLOCK[i];
    }
    return false;
  }
  let _GET_CHILD_CLOCK = () => _GET_CLOCK();
  let _FIND_6 = (_ID) => {
    let _LIST = _GET_CHILD_6();
    for (var i = 0; i < _LIST.length; i++) if (_LIST[i].id == _ID) return _LIST[i];
    return null;
  }
  let _CHILD_6_SELECT = () => _GET_CHILD_6().map(f => <option key={f.id} value={f.id}>{f.description}</option>)
  let _GET_CLOCK_STATE_VERSION = (_state, _version) => {
    var _CLOCK = _GET_CHILD_CLOCK();
    if (_state == null) return false;
    for (var i = 0; i < _CLOCK.length; i++) {
      if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
    }
    return false;
  }

  // *************** SISTEMA SIMPLIFICADO DE SUSPENSIONES (SOLO 300 Y 301) ****************** //
  let _GET_SUSPENSION_PRE_ACTA = () => {
    const startClock = _GET_CLOCK_STATE(300);
    const endClock = _GET_CLOCK_STATE(350);
    return {
      exists: startClock && startClock.date_start,
      start: startClock,
      end: endClock,
      days: startClock?.date_start && endClock?.date_start
        ? dateParser_dateDiff(startClock.date_start, endClock.date_start)
        : (startClock?.date_start ? dateParser_dateDiff(startClock.date_start, moment().format('YYYY-MM-DD')) : 0)
    };
  }

  let _GET_SUSPENSION_POST_ACTA = () => {
    const startClock = _GET_CLOCK_STATE(301);
    const endClock = _GET_CLOCK_STATE(351);
    return {
      exists: startClock && startClock.date_start,
      start: startClock,
      end: endClock,
      days: startClock?.date_start && endClock?.date_start
        ? dateParser_dateDiff(startClock.date_start, endClock.date_start)
        : (startClock?.date_start ? dateParser_dateDiff(startClock.date_start, moment().format('YYYY-MM-DD')) : 0)
    };
  }

  let _GET_TOTAL_SUSPENSION_DAYS = () => {
    const preSusp = _GET_SUSPENSION_PRE_ACTA();
    const postSusp = _GET_SUSPENSION_POST_ACTA();
    return (preSusp.days || 0) + (postSusp.days || 0);
  }

  // *************** LÓGICA UNIFICADA PARA BOTÓN DE SUSPENSIÓN ****************** //
  let _CAN_ADD_SUSPENSION = () => {
    const totalDays = _GET_TOTAL_SUSPENSION_DAYS();
    const preSusp = _GET_SUSPENSION_PRE_ACTA();
    const postSusp = _GET_SUSPENSION_POST_ACTA();
    const act_2 = _GET_CLOCK_STATE(49);
    const ldfTime = _GET_CLOCK_STATE(5);
    if (totalDays >= 10) return false;
    if (preSusp.exists && postSusp.exists) return false;
    if (act_2?.date_start || !ldfTime?.date_start) return false;
    return true;
  }

  let _GET_AVAILABLE_SUSPENSION_TYPES = () => {
    const preSusp = _GET_SUSPENSION_PRE_ACTA();
    const postSusp = _GET_SUSPENSION_POST_ACTA();
    const acta1 = _GET_CLOCK_STATE(30);
    const types = [];
    if (!preSusp.exists) {
      types.push({ value: 'pre', label: 'Antes del Acta de Observaciones', available: true });
    }
    if (!postSusp.exists && acta1?.date_start) {
      types.push({ value: 'post', label: 'Después del Acta de Observaciones', available: true });
    }
    return types;
  }

  // *************** SISTEMA AISLADO DE PRÓRROGAS ****************** //
  let _GET_EXTENSION = () => {
    const startClock = _GET_CLOCK_STATE(400);
    const endClock = _GET_CLOCK_STATE(401);
    return {
      exists: startClock && startClock.date_start,
      start: startClock,
      end: endClock,
      days: startClock?.date_start && endClock?.date_start ? dateParser_dateDiff(startClock.date_start, endClock.date_start) : 22
    };
  }

  let _CAN_ADD_EXTENSION = () => {
    const extension = _GET_EXTENSION();
    const act_2 = _GET_CLOCK_STATE(49);
    const ldfTime = _GET_CLOCK_STATE(5);
    if (act_2?.date_start || !ldfTime?.date_start) return false;
    return !extension.exists;
  }

  // *************** CÁLCULO DE DÍAS RESTANTES DE CURADURÍA ****************** //
  let _GET_CURADURIA_REMAINING_DAYS = () => {
    // Si ya hay Acta Parte 2 o Acto de Viabilidad, este primer contador finalizó
    const acta2Clock = _GET_CLOCK_STATE(49);
    const actViav = _GET_CLOCK_STATE(61);
    if (acta2Clock?.date_start || actViav?.date_start) return null;

    const evaDefaultTime = _fun_0_type_time[currentItem.type] ?? 45;

    // Fechas base
    const acta1Time = (_GET_CLOCK_STATE(30) || {}).date_start; // Acta Parte 1
    const ldfTime   = (_GET_CLOCK_STATE(5)  || {}).date_start; // Legal y Debida Forma
    const corrTime  = (_GET_CLOCK_STATE(35) || {}).date_start; // Radicación de correcciones

    // Suspensiones y prórroga
    const preSusp = _GET_SUSPENSION_PRE_ACTA();
    const postSusp = _GET_SUSPENSION_POST_ACTA();
    const extension = _GET_EXTENSION();

    const totalSuspensionDays = _GET_TOTAL_SUSPENSION_DAYS();
    const extensionDays = extension.exists ? extension.days : 0;

    // Total disponible = base + suspensiones + prórroga
    const baseTotal = evaDefaultTime + totalSuspensionDays + extensionDays;

    // Si NO hay LDF, el reloj de curaduría aún no inicia.
    if (!ldfTime) {
      return {
        total: baseTotal,
        used: 0,
        remaining: baseTotal,   // aún no corre
        reference: null,
        from: 'NOT_STARTED',
        today: moment().format('YYYY-MM-DD'),
        suspensions: totalSuspensionDays,
        extension: extensionDays,
        preActaUsed: 0,
        preFirstEventUsed: 0,
        preFirstEventExtra: 0,
        paused: false,
        notStarted: true,
        firstEventDate: null,
        firstEventType: null,
      };
    }

    // DÍAS PRE-ACTA: restar SIEMPRE (cuando existan ambas fechas) los días hábiles entre LDF (5) y Acta 1 (30)
    const preActaUsed = (ldfTime && acta1Time) ? dateParser_dateDiff(ldfTime, acta1Time) : 0;

    // NUEVO: identificar la "primera suspensión/corrección" DESDE LDF
    const firstEventCandidates = [];
    if (preSusp?.start?.date_start) firstEventCandidates.push({ date: preSusp.start.date_start, type: 'SUSP_PRE_START(300)' });
    if (postSusp?.start?.date_start) firstEventCandidates.push({ date: postSusp.start.date_start, type: 'SUSP_POST_START(301)' });
    if (corrTime)                    firstEventCandidates.push({ date: corrTime,                 type: 'CORR_35' });

    const validFirsts = firstEventCandidates.filter(c =>
      c.date && (moment(c.date).isAfter(ldfTime) || moment(c.date).isSame(ldfTime))
    );

    let firstEvent = null;
    if (validFirsts.length) {
      validFirsts.sort((a, b) => (moment(a.date).isBefore(b.date) ? -1 : 1));
      firstEvent = validFirsts[0];
    }

    const preFirstEventUsed = firstEvent ? dateParser_dateDiff(ldfTime, firstEvent.date) : 0;
    const preFirstEventExtra = Math.max(0, preFirstEventUsed - preActaUsed);

    // Candidatos para referencia
    const candidates = [];
    if (acta1Time) {
      if (postSusp?.end?.date_start)   candidates.push({ date: postSusp.end.date_start,   from: 'SUSP_POST_END(351)' });
      if (postSusp?.start?.date_start) candidates.push({ date: postSusp.start.date_start, from: 'SUSP_POST_START(301)' });
      if (corrTime)                     candidates.push({ date: corrTime,                  from: 'CORR_35' });
    } else {
      if (preSusp?.end?.date_start)    candidates.push({ date: preSusp.end.date_start,    from: 'SUSP_PRE_END(350)' });
      if (preSusp?.start?.date_start)  candidates.push({ date: preSusp.start.date_start,  from: 'SUSP_PRE_START(300)' });
      if (ldfTime)                     candidates.push({ date: ldfTime,                    from: 'LDF_5' });
    }

    if (!candidates.length) {
      if (acta1Time) {
        const remainingPaused = baseTotal - (preActaUsed + preFirstEventExtra);
        return {
          total: baseTotal,
          used: preActaUsed + preFirstEventExtra,
          remaining: remainingPaused,
          reference: null,
          from: 'PAUSED',
          today: moment().format('YYYY-MM-DD'),
          suspensions: totalSuspensionDays,
          extension: extensionDays,
          preActaUsed,
          preFirstEventUsed,
          preFirstEventExtra,
          paused: true,
          notStarted: false,
          firstEventDate: firstEvent?.date || null,
          firstEventType: firstEvent?.type || null,
        };
      }
      return {
        total: baseTotal,
        used: 0,
        remaining: baseTotal,
        reference: null,
        from: 'NOT_STARTED',
        today: moment().format('YYYY-MM-DD'),
        suspensions: totalSuspensionDays,
        extension: extensionDays,
        preActaUsed: 0,
        preFirstEventUsed: 0,
        preFirstEventExtra: 0,
        paused: false,
        notStarted: true,
        firstEventDate: firstEvent?.date || null,
        firstEventType: firstEvent?.type || null,
      };
    }

    candidates.sort((a, b) => (moment(a.date).isAfter(b.date) ? -1 : 1));
    const lastRef = candidates[0];

    // Suspensión activa posterior a la referencia => congelar en su inicio
    let effectiveToday = moment().format('YYYY-MM-DD');
    if (acta1Time) {
      if (postSusp.exists && !postSusp.end?.date_start && postSusp.start?.date_start) {
        if (moment(postSusp.start.date_start).isAfter(lastRef.date)) {
          effectiveToday = postSusp.start.date_start;
        }
      }
    } else {
      if (preSusp.exists && !preSusp.end?.date_start && preSusp.start?.date_start) {
        if (moment(preSusp.start.date_start).isAfter(lastRef.date)) {
          effectiveToday = preSusp.start.date_start;
        }
      }
    }

    const usedAfterRef = dateParser_dateDiff(lastRef.date, effectiveToday);
    const used = preActaUsed + preFirstEventExtra + usedAfterRef;

    const remaining = baseTotal - used;

    return {
      total: baseTotal,
      used,
      remaining,
      reference: lastRef.date,
      from: lastRef.from,
      today: effectiveToday,
      suspensions: totalSuspensionDays,
      extension: extensionDays,
      preActaUsed,
      preFirstEventUsed,
      preFirstEventExtra,
      paused: false,
      notStarted: false,
      firstEventDate: firstEvent?.date || null,
      firstEventType: firstEvent?.type || null,
    };
  }

  let get_clockExistIcon = (state, icon = "") => {
    var _CHILD = _GET_CLOCK_STATE(state);
    if (_CHILD && icon !== "empty") {
      if (_CHILD.date_start || _CHILD.name === "RADICACIÓN") return <i className="far fa-check-circle text-success"></i>
      return <i className="far fa-dot-circle text-warning"></i>
    }
    return <i className="far fa-dot-circle"></i>
  }

  let get_newestDate = (states) => {
    let newDate = null;
    states.forEach((element) => {
      const st = _GET_CLOCK_STATE(element);
      const date = st ? st.date_start : null;
      if (!newDate && date) newDate = date;
      else if (date && moment(date).isAfter(newDate)) newDate = date;
    });
    return newDate;
  }

  // ************** CATEGORÍAS (color/ícono) ************** //
  const catForTitle = (title = '') => {
    title = title.toUpperCase();
    if (title.includes('DESISTIDO')) return { color: '#F93154', icon: 'fa-exclamation-circle' };
    if (title.includes('RADICACIÓN')) return { color: '#5bc0de', icon: 'fa-inbox' };
    if (title.includes('OBSERVACIONES')) return { color: '#fd7e14', icon: 'fa-clipboard-list' };
    if (title.includes('CORRECCIONES')) return { color: '#20c997', icon: 'fa-tools' };
    if (title.includes('VIABILIDAD')) return { color: '#6f42c1', icon: 'fa-compass' };
    if (title.includes('PAGOS')) return { color: '#198754', icon: 'fa-money-bill' };
    if (title.includes('RESOLUCIÓN')) return { color: '#0b5ed7', icon: 'fa-file-signature' };
    if (title.includes('RECURSO')) return { color: '#d63384', icon: 'fa-exclamation-circle' };
    if (title.includes('LICENCIA')) return { color: '#157347', icon: 'fa-id-card' };
    if (title.includes('SUSPENSIÓN')) return { color: '#ffc107', icon: 'fa-pause' };
    if (title.includes('PRÓRROGA')) return { color: '#17a2b8', icon: 'fa-clock' };
    return { color: '#5bc0de', icon: 'fa-folder-open' };
  };

  // *************** BARRA DE CONTROL MEJORADA ****************** //
  const ControlBar = () => {
    const extension = _GET_EXTENSION();
    const totalSuspensionDays = _GET_TOTAL_SUSPENSION_DAYS();
    const canAddSusp = _CAN_ADD_SUSPENSION();
    const canAddExt = _CAN_ADD_EXTENSION();

    // Curaduría (cálculo relativo a HOY)
    const curDetails = _GET_CURADURIA_REMAINING_DAYS();
    const acta2Clock = _GET_CLOCK_STATE(49);
    const actoViab = _GET_CLOCK_STATE(61);

    // Desistimiento
    const _GET_DESIST_EVENTS = () => {
      const all = _GET_CLOCK();
      return (all || []).filter(c => c?.date_start && stepsToCheck.includes(String(c.state)));
    };
    const desistEvents = _GET_DESIST_EVENTS();
    const isDesisted = desistEvents.length > 0;

    // Estados de curaduría
    const finalized = !!(acta2Clock?.date_start || actoViab?.date_start || curDetails === null);
    const notStarted = !!(curDetails && curDetails.notStarted);
    const paused = !!(curDetails && curDetails.paused);
    const expired = !!(curDetails && !paused && !notStarted && curDetails.remaining < 0);
    const inCourse = !!(curDetails && !paused && !notStarted && curDetails.remaining >= 0);

    const getDesistReason = () => {
      const preferred = desistEvents.find(e => String(e.state) === '-5' || String(e.state) === '-6');
      const any = preferred || desistEvents[0];
      if (!any) return null;
      return NegativePRocessTitle?.[String(any.version)] || null;
    };

    const showDesistModal = () => {
      const reason = getDesistReason();
      const ordered = [...desistEvents].sort((a, b) => (moment(a.date_start).isAfter(b.date_start) ? -1 : 1));
      const rows = ordered.map(e => {
        const lbl = NegativePRocessTitle?.[String(e.version)] || `Estado ${e.state}`;
        return `<tr>
          <td>${lbl}</td>
          <td>${e.date_start}</td>
          <td>${e.version ?? '-'}</td>
        </tr>`;
      }).join('');

      MySwal.fire({
        title: 'Detalle de desistimiento',
        html: `
          <div class="text-start">
            ${reason ? `<div class="mb-2"><strong>Motivo principal:</strong> ${reason}</div>` : ''}
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Motivo/Estado</th>
                    <th>Fecha</th>
                    <th>Versión</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
            <div class="small text-muted">Las acciones y métricas de tiempo se ocultan mientras el proceso esté desistido.</div>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        width: 680,
      });
    };

    const FROM_LABEL = {
      'SUSP_POST_END(351)': 'Fin de Suspensión (Post-Acta)',
      'SUSP_POST_START(301)': 'Inicio de Suspensión (Post-Acta)',
      'SUSP_PRE_END(350)': 'Fin de Suspensión (Pre-Acta)',
      'SUSP_PRE_START(300)': 'Inicio de Suspensión (Pre-Acta)',
      'CORR_35': 'Radicación de Correcciones (35)',
      'LDF_5': 'Legal y Debida Forma (5)',
      'PAUSED': 'Tiempo corriendo para el solicitante',
      'NOT_STARTED': 'No iniciado',
    };

    const handleShowCuraduriaDetails = () => {
      if (curDetails == null) return;

      let stateChip = '<span class="badge bg-secondary">Sin estado</span>';
      if (notStarted) stateChip = '<span class="badge bg-secondary">No iniciado</span>';
      else if (paused) stateChip = '<span class="badge bg-warning text-dark">Pausado</span>';
      else if (expired) stateChip = '<span class="badge bg-danger">Vencido</span>';
      else if (inCourse) stateChip = '<span class="badge bg-primary">En curso</span>';

      const remainingClass = curDetails.remaining < 0 ? 'text-danger' : 'text-success';
      const fromText = FROM_LABEL[curDetails.from] || curDetails.from || '-';

      MySwal.fire({
        title: 'Detalle de Curaduría',
        html: `
          <div class="text-start">
            <div class="mb-2">${stateChip}</div>
            <div class="row g-2">
              <div class="col-12">
                <strong>Referencia:</strong> ${fromText}
                <div class="small text-muted">Fecha referencia: ${curDetails.reference || '-'}</div>
              </div>
              <div class="col-12">
                <strong>Fecha de corte:</strong> ${curDetails.today || '-'}
                <div class="small text-muted">Cálculo relativo a hoy (días hábiles)</div>
              </div>
              <hr class="my-2" />
              <div class="col-6"><strong>Base:</strong> ${curDetails.total - curDetails.suspensions - curDetails.extension}</div>
              <div class="col-6"><strong>Usados pre-Acta (5→30):</strong> ${curDetails.preActaUsed ?? 0}</div>
              <div class="col-6"><strong>Usados desde ref.:</strong> ${Math.max((curDetails.used ?? 0) - (curDetails.preActaUsed ?? 0), 0)}</div>
              <div class="col-6"><strong>Suspensiones:</strong> ${curDetails.suspensions}</div>
              <div class="col-6"><strong>Prórroga:</strong> ${curDetails.extension}</div>
              <div class="col-6"><strong>Total:</strong> ${curDetails.total}</div>
              <div class="col-6"><strong>Restantes:</strong> <span class="${remainingClass}">${curDetails.remaining}</span></div>
            </div>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        width: 640,
      });
    };

    return (
      <div className="control-bar mb-1">
        <div className="d-flex align-items-center p-2 bg-light rounded-3 shadow-sm bar-inner">
          {/* Acciones */}
          <div className="actions d-flex gap-2 flex-wrap align-items-center">
            {!isDesisted && canAddSusp && (
              <button type="button" className="btn btn-warning btn-sm" onClick={() => addTimeControl('suspension')}>
                <i className="fas fa-pause me-2"></i>
                Añadir Suspensión
              </button>
            )}
            {!isDesisted && canAddExt && (
              <button type="button" className="btn btn-info btn-sm" onClick={() => addTimeControl('extension')}>
                <i className="fas fa-clock me-2"></i>
                Prórroga por Complejidad
              </button>
            )}
            {!isFull && (
              <button type="button" className="btn btn-sm btn-light ms-1 exp-full-btn" title="Pantalla completa" onClick={() => setIsFull(true)}>
                <i className="fas fa-expand"></i>
              </button>
            )}
          </div>

          {/* Métricas */}
          <div className="control-meta ms-auto small text-end">
            {isDesisted ? (
              <div className="text-danger">
                <i className="fas fa-ban me-1"></i>
                Proceso desistido
                <button type="button" className="btn btn-link btn-sm p-0 ms-2 align-baseline" onClick={showDesistModal}>
                  Ver motivo
                </button>
              </div>
            ) : (
              <>
                {/* Chips de estado */}
                <div className="status-chips d-flex justify-content-end flex-wrap gap-2 mb-1">
                  {finalized && (
                    <span className="badge bg-success">
                      <i className="fas fa-check-circle me-1"></i> Finalizado
                    </span>
                  )}
                  {!finalized && curDetails?.notStarted && (
                    <span className="badge bg-secondary">
                      <i className="fas fa-circle me-1"></i> No iniciado
                    </span>
                  )}
                  {!finalized && !curDetails?.notStarted && curDetails?.paused && (
                    <span className="badge bg-warning text-dark">
                      <i className="fas fa-pause me-1"></i> Pausado
                    </span>
                  )}
                  {!finalized && !curDetails?.notStarted && !curDetails?.paused && curDetails && curDetails.remaining < 0 && (
                    <span className="badge bg-danger">
                      <i className="fas fa-exclamation-circle me-1"></i> Vencido
                    </span>
                  )}
                  {!finalized && !curDetails?.notStarted && !curDetails?.paused && curDetails && curDetails.remaining >= 0 && (
                    <span className="badge bg-primary">
                      <i className="fas fa-hourglass-half me-1"></i> En curso
                    </span>
                  )}
                </div>

                {/* Línea de curaduría */}
                {finalized ? (
                  <div className="text-success">
                    <i className="fas fa-check-circle me-1"></i>
                    Curaduría: Finalizado
                  </div>
                ) : curDetails?.notStarted ? (
                  <div className="text-muted">
                    <i className="fas fa-circle me-1"></i>
                    Curaduría: No iniciado
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 ms-2 align-baseline"
                      onClick={handleShowCuraduriaDetails}
                    >
                      Más info
                    </button>
                  </div>
                ) : curDetails ? (
                  <div className={curDetails.paused ? 'text-warning' : (curDetails.remaining < 0 ? 'text-danger' : 'text-primary')}>
                    <i className={`me-1 ${curDetails.paused ? 'fas fa-pause' : 'fas fa-hourglass-half'}`}></i>
                    Curaduría: {curDetails.paused ? 'Pausado' : `${curDetails.remaining} días restantes`}
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 ms-2 align-baseline"
                      onClick={handleShowCuraduriaDetails}
                    >
                      Ver detalle
                    </button>
                  </div>
                ) : (
                  <div className="text-muted">Control de tiempos adicionales</div>
                )}

                {/* Chips de métricas */}
                <div className="d-flex justify-content-end flex-wrap gap-2 mt-1">
                  {_GET_TOTAL_SUSPENSION_DAYS() > 0 && (
                    <span className="badge bg-warning text-dark">
                      <i className="fas fa-pause me-1"></i>
                      Suspensiones: {_GET_TOTAL_SUSPENSION_DAYS()}/10
                    </span>
                  )}
                  {extension.exists && (
                    <span className="badge bg-info text-dark">
                      <i className="fas fa-clock me-1"></i>
                      Prórroga: {extension.days} d
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // *************** FUNCIÓN PARA MOSTRAR INFORMACIÓN DE SUSPENSIÓN ****************** //
  const showSuspensionInfo = (suspensionData, type) => {
    const typeText = type === 'pre' ? 'Antes del Acta' : 'Después del Acta';
    MySwal.fire({
      title: `Suspensión ${typeText}`,
      html: `
        <div class="text-start">
          <p><strong>Ubicación:</strong> ${typeText}</p>
          <p><strong>Fecha de Inicio:</strong> ${suspensionData.start?.date_start || 'No definida'}</p>
          <p><strong>Fecha de Fin:</strong> ${suspensionData.end?.date_start || 'Pendiente por definir'}</p>
          <p><strong>Días de Suspensión:</strong> ${suspensionData.days || 'Pendiente'}</p>
          ${suspensionData.start?.desc ? `<p><strong>Información:</strong><br>${suspensionData.start.desc}</p>` : ''}
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  };

  // *************** FUNCIÓN UNIFICADA PARA CONTROLES DE TIEMPO ****************** //
  const addTimeControl = (type) => {
    if (type === 'suspension') {
      const availableTypes = _GET_AVAILABLE_SUSPENSION_TYPES();
      const availableDays = 10 - _GET_TOTAL_SUSPENSION_DAYS();
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
          const startState = isPreActa ? 300 : 301;

          const formDataStart = new FormData();
          formDataStart.set('fun0Id', currentItem.id);
          formDataStart.set('state', startState);
          formDataStart.set('date_start', startDate);
          formDataStart.set('desc', info || `Suspensión ${isPreActa ? 'antes' : 'después'} del acta`);
          formDataStart.set('name', `Inicio Suspensión ${isPreActa ? 'Pre-Acta' : 'Post-Acta'}`);

          // Actualización local optimista
          applyLocalClockChange(startState, {
            date_start: startDate,
            desc: formDataStart.get('desc'),
            name: formDataStart.get('name'),
            state: startState,
          });

          manage_clock(false, startState, false, formDataStart, true);
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
          formDataStart.set('fun0Id', currentItem.id);
          formDataStart.set('state', 400);
          formDataStart.set('date_start', startDate);
          formDataStart.set('desc', 'Prórroga por complejidad técnica');
          formDataStart.set('name', 'Inicio Prórroga por Complejidad');

          // Actualización local optimista
          applyLocalClockChange(400, {
            date_start: startDate,
            desc: 'Prórroga por complejidad técnica',
            name: 'Inicio Prórroga por Complejidad',
            state: 400,
          });

          manage_clock(false, 400, false, formDataStart, true);
        }
      });
    }
  };

  // *********************** JSX ************************** //
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

  let _COMPONENT_CLOCKS = () => (
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
            <ControlBar />
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

  let _COMPONENT_CLOCK_LIST = () => {
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

      // *************** CÁLCULO COMPLETADO DE LÍMITES DINÁMICOS ****************** //
      // Mantener lógica existente (limitValues) para casos como Acta Parte 2
      if (value.limitValues) {
        let corrTime = (_GET_CLOCK_STATE(35) || {}).date_start;

        let extension = _GET_EXTENSION();
        let postSusp = _GET_SUSPENSION_POST_ACTA();

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

      // Cálculo del límite para Acta Parte 1 (state 30) con orden:
      // 1) Usar PRIMERA opción disponible entre fin de prórroga (401) o fin de suspensión (350) más reciente
      // 2) Si no, usar inicio de prórroga (400) o inicio de suspensión (300) más reciente
      // 3) Si no, usar LDF (5)
      // La fecha límite = fechaBase + días restantes (baseDays - usadosHastaBase + prórroga si aplica)
      const renderActa1LimitSmart = () => {
        if (value.state !== 30) return null;

        const ldf = (_GET_CLOCK_STATE(5) || {}).date_start;
        if (!ldf) return <span className="text-danger">-</span>;
        const baseDays = _fun_0_type_time[currentItem.type] ?? 45;

        const ext = _GET_EXTENSION();
        const pre = _GET_SUSPENSION_PRE_ACTA();

        const finishCandidates = [];
        if (ext?.end?.date_start) finishCandidates.push({ date: ext.end.date_start, kind: 'EXT_END' });
        if (pre?.end?.date_start) finishCandidates.push({ date: pre.end.date_start, kind: 'SUSP_PRE_END' });

        const startCandidates = [];
        if (ext?.start?.date_start) startCandidates.push({ date: ext.start.date_start, kind: 'EXT_START' });
        if (pre?.start?.date_start) startCandidates.push({ date: pre.start.date_start, kind: 'SUSP_PRE_START' });

        const pickMostRecent = (arr) => {
          const sorted = [...arr].sort((a, b) => (moment(a.date).isAfter(b.date) ? -1 : 1));
          return sorted[0];
        };

        let baseChoice = null;
        if (finishCandidates.length) baseChoice = pickMostRecent(finishCandidates);
        else if (startCandidates.length) baseChoice = pickMostRecent(startCandidates);
        else baseChoice = { date: ldf, kind: 'LDF' };

        // Días usados hasta la base (excluyendo tiempo en suspensión si base es fin de suspensión)
        let usedBeforeBase = 0;
        if (baseChoice.kind === 'SUSP_PRE_END' && pre?.start?.date_start) {
          usedBeforeBase = dateParser_dateDiff(ldf, pre.start.date_start);
        } else {
          usedBeforeBase = dateParser_dateDiff(ldf, baseChoice.date);
        }

        // Días de prórroga aplicables si ya inició antes de la Acta 1
        const extDays = (ext?.exists && ext.start?.date_start && moment(ext.start.date_start).isSameOrAfter(ldf)) ? ext.days : 0;

        let remainingDays = baseDays - usedBeforeBase + extDays;
        if (remainingDays < 0) remainingDays = 0;

        const limitDate = dateParser_finalDate(baseChoice.date, remainingDays);
        const tip = `Base: ${baseChoice.kind} | Usados hasta base: ${usedBeforeBase} | Prórroga: ${extDays} | Restantes: ${remainingDays}`;

        return (
          <span className="text-primary" title={tip}>
            {limitDate}
          </span>
        );
      };

      // Cálculo de días restantes para FIN DE SUSPENSIÓN (350/351)
      const renderSuspensionRemainingLimit = () => {
        const isEndPre = value.state === 350;
        const isEndPost = value.state === 351;
        if (!isEndPre && !isEndPost) return null;

        const pre = _GET_SUSPENSION_PRE_ACTA();
        const post = _GET_SUSPENSION_POST_ACTA();
        const today = moment().format('YYYY-MM-DD');

        const otherUsed = isEndPre
          ? (post?.start?.date_start && post?.end?.date_start ? post.days : 0)
          : (pre?.start?.date_start && pre?.end?.date_start ? pre.days : 0);

        const thisStart = isEndPre ? pre?.start?.date_start : post?.start?.date_start;
        if (!thisStart) return <span className="text-muted">-</span>;

        const thisEnd = currentClock?.date_start || '';
        const usedThis = thisEnd
          ? dateParser_dateDiff(thisStart, thisEnd)
          : dateParser_dateDiff(thisStart, today);

        const remaining = 10 - otherUsed - usedThis;
        const remainingClamped = remaining < 0 ? 0 : remaining;

        return <span className={remaining < 0 ? 'text-danger' : 'text-primary'}>{remainingClamped} días</span>;
      };

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
      const cat = catForTitle(lastTitle);

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
                  {/* LÍMITE: reglas especiales */}
                  {(value.state === 350 || value.state === 351) ? (
                    renderSuspensionRemainingLimit()
                  ) : value.state === 30 ? (
                    renderActa1LimitSmart()
                  ) : value.calculatedLimit ? (
                    <span className="text-primary" title={`Calculado desde: ${value.limitBaseDate}`}>
                      {value.calculatedLimit}
                    </span>
                  ) : value.limit ? (
                    Array.isArray(value.limit[0])
                      ? dateParser_finalDate(get_newestDate(value.limit[0]), value.limit[1])
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

  // *************** APIS CON TRIGGER DE ACTUALIZACIÓN ******************* //
  // Helper: actualización local inmediata de reloj
  const applyLocalClockChange = (state, changes) => {
    setClocksData(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const idx = arr.findIndex(c => c.state == state);
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...changes, state };
      } else {
        arr.push({ ...changes, state });
      }
      return arr;
    });
    setRefreshTrigger(p => p + 1);
  };

  let save_clock = (value, i) => {
    if (value.state === false || value.state == null) return;
    var formDataClock = new FormData();

    const dateInput = document.getElementById("clock_exp_date_" + i);
    const resolverSelect = document.getElementById("clock_exp_res_" + i);
    const id6Select = document.getElementById("clock_exp_id6_" + i);
    const idRelatedInput = document.getElementById("clock_exp_id_related_" + i);

    const dateVal = dateInput ? String(dateInput.value || '').trim() : '';
    let resolver_context = resolverSelect ? resolverSelect.value : false;
    let resolver_id6 = id6Select ? id6Select.value : 0;
    let id_related = idRelatedInput ? idRelatedInput.value : '';

    // Evitar sobreescrituras con string vacío
    if (dateVal) formDataClock.set('date_start', dateVal);
    if (resolver_context) formDataClock.set('resolver_context', resolver_context);
    formDataClock.set('resolver_id6', resolver_id6);
    formDataClock.set('state', value.state);
    formDataClock.set('id_related', id_related);

    // Descripción, con ajuste para FIN de suspensión (350/351)
    let descBase = value.desc || '';
    if ((value.state === 350 || value.state === 351) && dateVal) {
      const isEndPre = value.state === 350;
      const startSusp = isEndPre ? _GET_SUSPENSION_PRE_ACTA().start?.date_start : _GET_SUSPENSION_POST_ACTA().start?.date_start;
      if (startSusp) {
        const daysUsed = dateParser_dateDiff(startSusp, dateVal);
        descBase = `Fin de suspensión (${daysUsed} días)`;
      }
    }
    if (resolver_context) descBase = (descBase ? (descBase + ': ') : '') + resolver_context;

    formDataClock.set('desc', descBase);
    formDataClock.set('name', value.name);

    // Actualización local optimista (tabla re-calcula sin salir)
    const optimistic = {};
    if (dateVal) optimistic.date_start = dateVal;
    optimistic.resolver_context = resolver_context || '';
    optimistic.resolver_id6 = resolver_id6;
    optimistic.id_related = id_related || '';
    optimistic.desc = descBase;
    optimistic.name = value.name;

    applyLocalClockChange(value.state, optimistic);

    manage_clock(false, value.state, false, formDataClock, true);
  }

  let manage_clock = (useMySwal, findOne, version, formDataClock, triggerUpdate = false) => {
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

    const onOk = () => {
      if (useMySwal) {
        MySwal.fire({
          title: swaMsg.publish_success_title,
          text: swaMsg.publish_success_text,
          footer: swaMsg.text_footer,
          icon: 'success',
          confirmButtonText: swaMsg.text_btn,
        });
      }
      // Disparar recalculo en padre y refresco local
      props.requestUpdate(currentItem.id);
      setRefreshTrigger(p => p + 1);
      if (triggerUpdate) {
        setTimeout(() => {
          props.requestUpdate(currentItem.id);
        }, 150);
      }
    }
    const onErr = (e) => {
      console.log(e);
      if (useMySwal) {
        MySwal.fire({
          title: swaMsg.generic_eror_title,
          text: swaMsg.generic_error_text,
          icon: 'warning',
          confirmButtonText: swaMsg.text_btn,
        });
      }
    }

    if (_CHILD && _CHILD.id) {
      FUN_SERVICE.update_clock(_CHILD.id, formDataClock).then(r => r.data === 'OK' ? onOk() : onErr(r)).catch(onErr);
    } else {
      FUN_SERVICE.create_clock(formDataClock).then(r => r.data === 'OK' ? onOk() : onErr(r)).catch(onErr);
    }
  }

  // *************** CLOCKS ACTUALIZADOS ****************** //
  const viaTime = () => {
    const evaDefaultTime = _fun_0_type_time[currentItem.type] ?? 45;
    let ldfTime = (_GET_CLOCK_STATE(5) || {}).date_start;
    let actaTime = (_GET_CLOCK_STATE(30) || {}).date_start;
    let acta2Time = (_GET_CLOCK_STATE(49) || {}).date_start;
    let corrTime = (_GET_CLOCK_STATE(35) || {}).date_start;

    const totalSuspensionDays = _GET_TOTAL_SUSPENSION_DAYS();
    const extension = _GET_EXTENSION();
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
    let actaClock = _GET_CLOCK_STATE(30);
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

  // *************** FUNCIONES SIMPLIFICADAS PARA SUSPENSIONES Y PRÓRROGAS ****************** //
  let getSuspList = (version = 1) => {
    const acta1 = _GET_CLOCK_STATE(30);
    const suspList = [];

    if (version === 1) {
      const preSusp = _GET_SUSPENSION_PRE_ACTA();
      if (preSusp.exists) {
        suspList.push({ title: 'SUSPENSIÓN ANTES DEL ACTA' });
        suspList.push({
          state: 300,
          name: 'Inicio de Suspensión',
          desc: preSusp.start.desc || "Suspensión antes del acta",
          editableDate: true,
          hasConsecutivo: false,
          hasAnnexSelect: true,
          suspensionInfo: { data: preSusp, type: 'pre' }
        });
        suspList.push({
          state: 350,
          name: 'Fin de Suspensión',
          desc: preSusp.end?.desc || `Fin de suspensión (${preSusp.days} días)`,
          editableDate: true,
          hasConsecutivo: false,
          hasAnnexSelect: true,
        });
      }
    } else {
      const postSusp = _GET_SUSPENSION_POST_ACTA();
      if (postSusp.exists && acta1 && postSusp.start.date_start >= acta1.date_start) {
        suspList.push({ title: 'SUSPENSIÓN DESPUÉS DEL ACTA' });
        suspList.push({
          state: 301,
          name: 'Inicio de Suspensión',
          desc: postSusp.start.desc || "Suspensión después del acta",
          editableDate: true,
          hasConsecutivo: false,
          hasAnnexSelect: true,
          suspensionInfo: { data: postSusp, type: 'post' }
        });
        suspList.push({
          state: 351,
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
    const extension = _GET_EXTENSION();
    if (!extension.exists) return [];

    const acta1 = _GET_CLOCK_STATE(30);
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
        state: 400,
        name: 'Inicio de Prórroga',
        desc: extension.start.desc || "Prórroga por complejidad técnica",
        editableDate: true,
        hasConsecutivo: false,
        hasAnnexSelect: true,
      }
    ];

    if (extension.end && extension.end.date_start) {
      extList.push({
        state: 401,
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
      { title: `DESISTIDO POR: ${NegativePRocessTitle[version] || 'MOTIVO NO ESPECIFICADO'}` },
      {
        state: stepsToCheck,
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
      { state: 5, name: 'Legal y debida forma', desc: false, editableDate: false, limit: regexChecker_isOA_2(_GET_CHILD_1()) ? [[4, false], -30] : [[3, false], 30], hasConsecutivo: false, hasAnnexSelect: false },
      ...desistClocks(-1),
      ...desistClocks(-2),
      ...getSuspList(1),
      ...getExtList(1),
      { title: 'ACTA PARTE 1: OBSERVACIONES' },
      // IMPORTANTE: el límite real para Acta 1 (30) se recalcula en renderActa1LimitSmart
      { state: 30, name: 'Acta Parte 1: Observaciones', desc: "Acta de Observaciones inicial", limit: [[5, false], _fun_0_type_time[currentItem.type] ?? 45], },
      { state: 31, name: 'Citación (Observaciones)', desc: "Citación para Observaciones", limit: [[30, false],5], hasConsecutivo: false, hasAnnexSelect: false, },
      { state: 32, name: 'Notificación (Observaciones)', desc: "Notificación de Observaciones", limit: [31, 5], info: ['PERSONAL', 'ELECTRÓNICO'], },
      { state: 33, name: 'Notificación por aviso (Observaciones)', desc: "Notificación por aviso de Observaciones", limit: [31, 10], icon: "empty", info: ['CERTIFICADO', 'ELECTRÓNICO'], },
      { state: 34, name: 'Prórroga correcciones', desc: "Prórroga para presentar correcciones", limit: [[33, 32], [30, 30]], icon: "empty", hasConsecutivo: false, hasAnnexSelect: false, },
      { state: 35, name: 'Radicación de Correcciones', desc: requereCorr() ? "Radicación de documentos corregidos" : false, limit: [[33, 32], presentExt() ? [45, 35, 40] : [30, 35, 40]], icon: requereCorr() ? undefined : "empty", hasConsecutivo: false, hasAnnexSelect: false, },
      ...getSuspList(2),
      ...getExtList(2),
      { title: 'ACTA PARTE 2: CORRECCIONES' },
      { state: 49, name: 'Acta Parte 2: Correcciones', desc: requereCorr() ? "Acta de revisión de correcciones" : false, limit: [[35, false], 50], limitValues: viaTime(), icon: requereCorr() ? undefined : "empty", },
      ...desistClocks(-3),
      ...desistClocks(-4),
      ...desistClocks(-5),
      { title: 'ACTA DE VIABILIDAD' },
      { state: 61, name: 'Acto de Tramite de Licencia (Viabilidad)', desc: "Tramite de viabilidad Licencia", limit: false, },
      { state: 55, name: 'Citación (Viabilidad)', desc: "Comunicación o Requerimiento para el tramite de viabilidad de Licencia", limit: [61, 5], info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'], },
      { state: 56, name: 'Notificación (Viabilidad)', desc: "Se le notifica al solicitante del Tramite de viabilidad Licencia", limit: [55, 5], info: ['PERSONAL', 'ELECTRÓNICO'], },
      { state: 57, show: false, name: 'Notificación por aviso (Viabilidad)', desc: "El solicitante NO se presento para el Tramite de viabilidad Licencia, fue informado por otros medios", limit: [55, 10], icon: "empty", info: ['CERTIFICADO', 'ELECTRÓNICO'], },
    ]
  }

  const paymentsClocks = [
    { title: 'PAGOS' },
    { state: 62, name: 'Expensas Variables', desc: "Pago de Expensas Variables", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: conOA() },
    { state: 63, name: namePayment, desc: "Pago de Impuestos Municipales", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: conOA() },
    { state: 64, name: 'Estampilla PRO-UIS', desc: "Pago de Estampilla PRO-UIS", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'] },
    { state: 65, name: 'Deberes Urbanísticos', desc: "Pago de Deberes Urbanísticos", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: !conGI },
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

  return (
    <div className="exp-wrapper">
      <ControlBar />
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