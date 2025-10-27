import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

import { useClocksManager } from './hooks/useClocksManager';
import { generateClocks } from './config/clocks.definitions';
import { ControlBar } from './components/ControlBar';
import { ClockRow } from './components/ClockRow';

import FUN_SERVICE from '../../../services/fun.service';
import { dateParser_dateDiff, regexChecker_isOA_2 } from '../../../components/customClasses/typeParse';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

export default function EXP_CLOCKS(props) {
  const { swaMsg, currentItem, currentVersion, outCodes } = props;
  const [isFull, setIsFull] = useState(false);
  const [clocksData, setClocksData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (currentItem?.fun_clocks) {
      setClocksData([...currentItem.fun_clocks]);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [currentItem?.fun_clocks]);

  const manager = useClocksManager(currentItem, clocksData, currentVersion);
  
  // CORRECCIÓN PROFUNDA: Se desestructura 'availableSuspensionTypes' y se usará consistentemente.
  const { getClock, getClockVersion, availableSuspensionTypes, totalSuspensionDays, suspensionPreActa, suspensionPostActa } = manager;

  const conGI = _GLOBAL_ID === 'cb1';
  const namePayment = conGI ? 'Impuestos Municipales' : 'Impuesto Delineacion';

  const clocksToShow = generateClocks({
      ...manager,
      currentItem,
      namePayment,
      conGI
  });

  const applyLocalClockChange = (state, changes, version) => {
    setClocksData(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const idx = arr.findIndex(c => String(c.state) === String(state) && (version !== undefined ? String(c.version) === String(version) : true));
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...changes, state, version };
      } else {
        arr.push({ ...changes, state, version });
      }
      return arr;
    });
    setRefreshTrigger(p => p + 1);
  };

  const save_clock = (value, i) => {
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

    if (dateVal) formDataClock.set('date_start', dateVal);
    if (resolver_context) formDataClock.set('resolver_context', resolver_context);
    formDataClock.set('resolver_id6', resolver_id6);
    formDataClock.set('state', value.state);
    formDataClock.set('id_related', id_related);

    let descBase = value.desc || '';
    if ((value.state === 350 || value.state === 351) && dateVal) {
      const startSusp = (value.state === 350) ? suspensionPreActa.start?.date_start : suspensionPostActa.start?.date_start;
      if (startSusp) descBase = `Fin de suspensión (${dateParser_dateDiff(startSusp, dateVal)} días)`;
    }
    if (resolver_context) descBase = (descBase ? (descBase + ': ') : '') + resolver_context;

    formDataClock.set('desc', descBase);
    formDataClock.set('name', value.name);

    applyLocalClockChange(value.state, {
      date_start: dateVal,
      resolver_context: resolver_context || '',
      resolver_id6: resolver_id6,
      id_related: id_related || '',
      desc: descBase,
      name: value.name,
    }, value.version);

    manage_clock(false, value.state, value.version, formDataClock, true);
  }

  const manage_clock = (useMySwal, findOne, version, formDataClock, triggerUpdate = false) => {
    var _CHILD = getClockVersion(findOne, version) || getClock(findOne);
    formDataClock.set('fun0Id', currentItem.id);

    if (useMySwal) MySwal.fire({ title: swaMsg.title_wait, text: swaMsg.text_wait, icon: 'info', showConfirmButton: false });
    
    const onOk = () => {
      if (useMySwal) MySwal.fire({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer, icon: 'success', confirmButtonText: swaMsg.text_btn });
      props.requestUpdate(currentItem.id);
      if (triggerUpdate) setTimeout(() => props.requestUpdate(currentItem.id), 150);
    }
    const onErr = (e) => {
      console.log(e);
      if (useMySwal) MySwal.fire({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning', confirmButtonText: swaMsg.text_btn });
    }

    if (_CHILD && _CHILD.id) {
      FUN_SERVICE.update_clock(_CHILD.id, formDataClock).then(r => r.data === 'OK' ? onOk() : onErr(r)).catch(onErr);
    } else {
      FUN_SERVICE.create_clock(formDataClock).then(r => r.data === 'OK' ? onOk() : onErr(r)).catch(onErr);
    }
  }

  const addTimeControl = (type) => {
    if (type === 'suspension') {
      const availableDays = 10 - totalSuspensionDays;
      // CORRECCIÓN PROFUNDA: Usar 'availableSuspensionTypes' en lugar de 'availableTypes'.
      if (availableSuspensionTypes.length === 0) return MySwal.fire({ title: 'No disponible', text: 'No hay espacios para añadir suspensiones', icon: 'warning' });
      
      const typeSelectHtml = availableSuspensionTypes.length > 1
        ? `<div class="col-12"><label class="form-label">Ubicación</label><select id="susp_type" class="form-select">${availableSuspensionTypes.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}</select></div>`
        : `<input type="hidden" id="susp_type" value="${availableSuspensionTypes[0].value}">`;

      MySwal.fire({
        title: 'Nueva Suspensión de Términos',
        html: `<div class="row g-3">
            <div class="col-12"><div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>Días disponibles: <strong>${availableDays}</strong></div></div>
            ${typeSelectHtml}
            <div class="col-12"><label class="form-label">Fecha de Inicio</label><input type="date" id="susp_start" class="form-control"/></div>
            <div class="col-12"><label class="form-label">Información Adicional</label><textarea id="susp_info" class="form-control" rows="3" placeholder="Detalles..."></textarea></div>
          </div>`,
        showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const suspType = document.getElementById('susp_type').value;
          const startDate = document.getElementById('susp_start').value;
          if (!startDate) { Swal.showValidationMessage('La fecha de inicio es obligatoria'); return false; }
          return { suspType, startDate, info: document.getElementById('susp_info').value.trim() };
        }
      }).then(result => {
        if (result.isConfirmed) {
          const { suspType, startDate, info } = result.value;
          const isPreActa = suspType === 'pre';
          const startState = isPreActa ? 300 : 301;
          const formDataStart = new FormData();
          formDataStart.set('state', startState);
          formDataStart.set('date_start', startDate);
          formDataStart.set('desc', info || `Suspensión ${isPreActa ? 'antes' : 'después'} del acta`);
          formDataStart.set('name', `Inicio Suspensión ${isPreActa ? 'Pre-Acta' : 'Post-Acta'}`);
          applyLocalClockChange(startState, { date_start: startDate, desc: formDataStart.get('desc'), name: formDataStart.get('name') });
          manage_clock(false, startState, false, formDataStart, true);
        }
      });

    } else if (type === 'extension') {
      MySwal.fire({
        title: 'Nueva Prórroga por Complejidad',
        html: `<div class="row g-3">
            <div class="col-12"><div class="alert alert-info"><i class="fas fa-clock me-2"></i>Otorga <strong>22 días hábiles</strong> adicionales.</div></div>
            <div class="col-12"><label class="form-label">Fecha de Inicio</label><input type="date" id="ext_start" class="form-control"/></div>
          </div>`,
        showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const startDate = document.getElementById('ext_start').value;
          if (!startDate) { Swal.showValidationMessage('La fecha de inicio es obligatoria'); return false; }
          return { startDate };
        }
      }).then(result => {
        if (result.isConfirmed) {
          const { startDate } = result.value;
          const formDataStart = new FormData();
          formDataStart.set('state', 400);
          formDataStart.set('date_start', startDate);
          formDataStart.set('desc', 'Prórroga por complejidad técnica');
          formDataStart.set('name', 'Inicio Prórroga por Complejidad');
          applyLocalClockChange(400, { date_start: startDate, desc: 'Prórroga por complejidad técnica', name: 'Inicio Prórroga por Complejidad' });
          manage_clock(false, 400, false, formDataStart, true);
        }
      });
    }
  };

  const _FIND_6 = (id) => (currentItem.fun_6s || []).find(f => f.id == id) || null;
  const _CHILD_6_SELECT = () => (currentItem.fun_6s || []).map(f => <option key={f.id} value={f.id}>{f.description}</option>);
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
  const getNewestDate = (states) => {
    let newDate = null;
    states.forEach((element) => {
      const date = getClock(element)?.date_start;
      if (!newDate && date) newDate = date;
      else if (date && moment(date).isAfter(newDate)) newDate = date;
    });
    return newDate;
  }

  const Header = () => (
    <div className="exp-head d-flex align-items-center justify-content-between">
      <div className="small w-100"><div className="row g-2 m-0 fw-bold">
        <div className="col-4">EVENTO</div><div className="col-2 text-center">FECHA</div>
        <div className="col-2 text-center">LÍMITE</div><div className="col-2 text-center">INFO</div>
        <div className="col-1 text-center">CONSEC.</div><div className="col-1 text-center">DOC</div>
      </div></div>
    </div>
  );

  let lastTitle = '';
  const renderClockList = () => {
    return clocksToShow.map((value, i) => {
        const clock = value.version !== undefined
          ? getClockVersion(value.state, value.version)
          : getClock(value.state);
        
        if (value.title) lastTitle = value.title;
        const cat = catForTitle(lastTitle);

        return (
          <ClockRow
            key={`row-${i}-${value.state ?? 'no-state'}-${value.version ?? 'no-version'}-${refreshTrigger}`}
            value={value} i={i} clock={clock} onSave={save_clock} cat={cat}
            outCodes={outCodes} _CHILD_6_SELECT={_CHILD_6_SELECT} _FIND_6={_FIND_6}
            helpers={{ getClock, getNewestDate, ...manager, currentItem }}
          />
        );
    });
  }

  return (
    <div className="exp-wrapper">
      <ControlBar 
        manager={manager} 
        actions={{ onAddTimeControl: addTimeControl, onSetIsFull: setIsFull, isFull }} 
      />
      
      <div className="card exp-card">
        <Header />
        <div className="exp-scroll">{renderClockList()}</div>
      </div>

      {isFull && (
        <div className="exp-fullscreen">
          <div className="exp-fullscreen-inner">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="m-0">Reloj del Proceso</h6>
              <button className="btn btn-sm btn-light" onClick={() => setIsFull(false)}><i className="fas fa-compress"></i> Cerrar</button>
            </div>
            <ControlBar 
              manager={manager} 
              actions={{ onAddTimeControl: addTimeControl, onSetIsFull: setIsFull, isFull }} 
            />
            <div className="card exp-card mb-0">
              <Header />
              <div className="exp-scroll exp-scroll-full">{renderClockList()}</div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .control-bar .bar-inner { display: flex; width: 100%; }
        .control-bar .actions { flex: 0 0 auto; display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
        .control-bar .control-meta { margin-left: auto; text-align: right; min-width: 280px; }
        .control-bar .status-chips .badge { font-weight: 600; }
        :root { --headH: 44px; }
        .control-bar { position: relative; z-index: 1; }
        .control-bar .btn-sm { padding: .25rem .75rem; font-size: .875rem; }
        .exp-card{ border-radius: 6px; box-shadow: 0 6px 16px rgba(0,0,0,.06); overflow: hidden; border: 1px solid #e9ecef; }
        .exp-head{ position: sticky; top: 0; z-index: 20; height: var(--headH); background: #5bc0de; color: #fff; padding: .5rem .75rem; display: flex; border-top-left-radius: 6px; border-top-right-radius: 6px; }
        .exp-full-btn{ line-height: 1; }
        .exp-scroll{ max-height: 80vh; overflow-y: auto; overflow-x: hidden; font-size: .95rem; }
        .exp-row{ background: #fff; position: relative; transition: background-color .2s; }
        .exp-row::before{ content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--cat, #6c757d); }
        .exp-row:hover{ background: #eaf3ff; }
        .exp-section{ background: #f8f9fa; border-left: 4px solid var(--cat, #6c757d); border-radius: 0 8px 8px 0; padding: .35rem .75rem; font-size: .95rem; letter-spacing: .4px; margin: 0; position: sticky; top: 0; z-index: 10; }
        .form-control-sm, .form-select-sm { height: 30px; padding: .15rem .35rem !important; }
        .btn-suspension-info { min-width: 28px; height: 28px; padding: 0; display: flex; align-items: center; justify-content: center; border: 1.5px solid #17a2b8; color: #17a2b8; background: white; border-radius: 4px; flex-shrink: 0; }
        .btn-suspension-info:hover { background-color: #17a2b8; color: white; border-color: #17a2b8; }
        .btn-suspension-info i { font-size: 12px; font-weight: bold; }
        .exp-scroll::-webkit-scrollbar{ width: 8px; }
        .exp-scroll::-webkit-scrollbar-track{ background: #f1f1f1; }
        .exp-scroll::-webkit-scrollbar-thumb{ background: #bdbdbd; border-radius: 4px; }
        .exp-scroll::-webkit-scrollbar-thumb:hover{ background: #9e9e9e; }
        .exp-fullscreen{ position: fixed; inset: 0; background: rgba(0,0,0,.35); backdrop-filter: blur(1px); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .exp-fullscreen-inner{ width: min(1400px, 96vw); height: min(92vh, 900px); background: #fff; border-radius: 8px; padding: .75rem; box-shadow: 0 10px 30px rgba(0,0,0,.2); display: flex; flex-direction: column; }
        .exp-scroll-full{ max-height: calc(92vh - 120px); }
        .exp-wrapper{ overflow-x: hidden; }
        .text-primary { color: #0d6efd !important; } .text-info { color: #0dcaf0 !important; } .text-warning { color: #ffc107 !important; }
        .alert-info { color: #055160; background-color: #cff4fc; border-color: #b6effb; }
      `}</style>
    </div>
  );
}