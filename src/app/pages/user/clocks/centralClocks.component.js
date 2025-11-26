import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

import { useClocksManager, useScheduleConfig } from './hooks/useClocksManager';
import { generateClocks } from './config/clocks.definitions';
import { ClockRow } from './components/ClockRow';
import { SidebarInfo } from './components/SidebarInfo';
import { HolidayCalendar } from './components/HolidayCalendar';
import { ControlBar } from './components/ControlBar';
import { calcularDiasHabiles } from './hooks/useClocksManager';

import FUN_SERVICE from '../../../services/fun.service';
import { dateParser_dateDiff } from '../../../components/customClasses/typeParse';

import './centralClocks.css';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

export default function EXP_CLOCKS(props) {
  const { swaMsg, currentItem, currentVersion, outCodes } = props;
  const [clocksData, setClocksData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarHeight, setSidebarHeight] = useState('auto');
  
  // --- NUEVO ESTADO: Controlar visibilidad del Time Travel ---
  const [showTimeTravel, setShowTimeTravel] = useState(false);
  
  const [systemDate, setSystemDate] = useState(moment().format('YYYY-MM-DD'));
  
  const sidebarRef = useRef(null);

  const { scheduleConfig, saveScheduleConfig, clearScheduleConfig, hasSchedule } = useScheduleConfig(currentItem?.id);

  useEffect(() => {
    if (currentItem?.fun_clocks) {
      setClocksData([...currentItem.fun_clocks]);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [currentItem?.fun_clocks]);

  const manager = useClocksManager(currentItem, clocksData, currentVersion, systemDate);

  useEffect(() => {
    const handleResize = () => {
      if (sidebarRef.current) {
        // Ajuste dinámico si la barra está visible u oculta
        const controlBarHeight = showTimeTravel ? 60 : 0; 
        const toolStripHeight = showTimeTravel ? 0 : 40; // Espacio aproximado del botón de activar
        setSidebarHeight(sidebarRef.current.offsetHeight - 44 - controlBarHeight - toolStripHeight);
      }
    };
    
    handleResize(); 
    const timer = setTimeout(handleResize, 200); 

    window.addEventListener('resize', handleResize);
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
    };
  }, [clocksData, manager.canAddExtension, manager.canAddSuspension, systemDate, showTimeTravel]);
  
  const { getClock, getClockVersion, availableSuspensionTypes, totalSuspensionDays, suspensionPreActa, suspensionPostActa, FUN_0_TYPE_TIME } = manager;

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
      if (startSusp) {
        const days = calcularDiasHabiles(startSusp, dateVal);
        descBase = `Fin de suspensión (${days} días hábiles)`;
      }
    }
    if (value.state === 401 && dateVal) {
        const startExt = manager.extension.start?.date_start;
        if (startExt) {
          const days = calcularDiasHabiles(startExt, dateVal);
          descBase = `Fin de prórroga (${days} días hábiles)`;
        }
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

  const delete_clock = (value) => {
    MySwal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la fecha del evento "${value.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const formDataClock = new FormData();
        
        formDataClock.set('state', value.state);
        if (value.version !== undefined) {
          formDataClock.set('version', value.version);
        }

        formDataClock.set('date_start', '');
        formDataClock.set('desc', value.desc || '');
        
        applyLocalClockChange(value.state, { 
            date_start: '',
            desc: value.desc || ''
        }, value.version);

        manage_clock(false, value.state, value.version, formDataClock, true);
      }
    });
  };

  const addTimeControl = (type) => {
    if (type === 'suspension') {
      const availableDays = 10 - totalSuspensionDays;
      if (availableSuspensionTypes.length === 0) return MySwal.fire({ title: 'No disponible', text: 'No hay espacios para añadir suspensiones', icon: 'warning' });
      
      const typeSelectHtml = availableSuspensionTypes.length > 1
        ? `<div class="col-12"><label class="form-label">Ubicación</label><select id="susp_type" class="form-select">${availableSuspensionTypes.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}</select></div>`
        : `<input type="hidden" id="susp_type" value="${availableSuspensionTypes[0].value}">`;

      MySwal.fire({
        title: 'Nueva Suspensión de Términos',
        html: `<div class="row g-3">
            <div class="col-12"><div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>Días disponibles: <strong>${availableDays}</strong></div></div>
            ${typeSelectHtml}
            <div class="col-12"><label class="form-label">Fecha de Inicio</label><input type="date" id="susp_start" class="form-control" value="${systemDate}"/></div>
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
                <div class="col-12"><div class="alert alert-info"><i class="fas fa-clock me-2"></i>Otorga hasta <strong>22 días hábiles</strong> adicionales.</div></div>
                <div class="col-12"><label class="form-label">Fecha de Inicio</label><input type="date" id="ext_start" class="form-control" value="${systemDate}"/></div>
                <div class="col-12"><label class="form-label">Fecha de Fin (Opcional)</label><input type="date" id="ext_end" class="form-control"/></div>
            </div>`,
            showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const startDate = document.getElementById('ext_start').value;
                const endDate = document.getElementById('ext_end').value;
                if (!startDate) { Swal.showValidationMessage('La fecha de inicio es obligatoria'); return false; }
                if (endDate && moment(endDate).isBefore(startDate)) {
                    Swal.showValidationMessage('La fecha de fin no puede ser anterior a la fecha de inicio');
                    return false;
                }
                return { startDate, endDate };
            }
        }).then(result => {
            if (result.isConfirmed) {
                const { startDate, endDate } = result.value;
                
                const formDataStart = new FormData();
                formDataStart.set('state', 400);
                formDataStart.set('date_start', startDate);
                formDataStart.set('desc', 'Prórroga por complejidad técnica');
                formDataStart.set('name', 'Inicio Prórroga por Complejidad');
                applyLocalClockChange(400, { date_start: startDate, desc: 'Prórroga por complejidad técnica', name: 'Inicio Prórroga por Complejidad' });
                manage_clock(false, 400, false, formDataStart, true);

                if (endDate) {
                    const days = dateParser_dateDiff(startDate, endDate);
                    const formDataEnd = new FormData();
                    formDataEnd.set('state', 401);
                    formDataEnd.set('date_start', endDate);
                    formDataEnd.set('desc', `Fin de prórroga (${days} días)`);
                    formDataEnd.set('name', 'Fin Prórroga por Complejidad');
                    applyLocalClockChange(401, { date_start: endDate, desc: `Fin de prórroga (${days} días)`, name: 'Fin Prórroga por Complejidad' });
                    setTimeout(() => manage_clock(false, 401, false, formDataEnd, true), 200);
                }
            }
        });
    }
  };

  const openScheduleModal = () => {
    const baseDays = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
    const totalDays = baseDays + totalSuspensionDays + (manager.extension.exists && manager.extension.end?.date_start ? manager.extension.days : 0);
    
    const currentPhase1 = scheduleConfig?.phase1Days || Math.floor(totalDays * 0.6);
    const currentPhase2 = scheduleConfig?.phase2Days || (totalDays - currentPhase1);

    MySwal.fire({
      title: 'Programar Tiempos del Proceso',
      html: `
        <div class="schedule-modal-content">
          <div class="alert alert-info mb-3">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Días hábiles totales disponibles:</strong> ${totalDays} días
            <br><small class="text-muted">Base: ${baseDays} + Suspensiones: ${totalSuspensionDays} + Prórroga: ${manager.extension.exists && manager.extension.end?.date_start ? manager.extension.days : 0}</small>
          </div>

          <div class="phase-config mb-4">
            <label class="form-label fw-bold">
              <i class="fas fa-clipboard-list me-2 text-warning"></i>
              Fase 1: Legal → Acta Parte 1
            </label>
            <div class="input-group">
              <input type="number" id="phase1_days" class="form-control" min="1" max="${totalDays}" value="${currentPhase1}" />
              <span class="input-group-text">días hábiles</span>
            </div>
            <div class="slider-wrapper mt-2">
              <input type="range" class="form-range" id="phase1_slider" min="1" max="${totalDays}" value="${currentPhase1}" />
            </div>
          </div>

          <div class="phase-config mb-3">
            <label class="form-label fw-bold">
              <i class="fas fa-compass me-2 text-purple"></i>
              Fase 2: Correcciones → Viabilidad
            </label>
            <div class="input-group">
              <input type="number" id="phase2_days" class="form-control" min="1" max="${totalDays}" value="${currentPhase2}" />
              <span class="input-group-text">días hábiles</span>
            </div>
            <div class="slider-wrapper mt-2">
              <input type="range" class="form-range" id="phase2_slider" min="1" max="${totalDays}" value="${currentPhase2}" />
            </div>
          </div>

          <div class="alert alert-secondary small">
            <i class="fas fa-lightbulb me-2"></i>
            <strong>Nota:</strong> La distribución de días es flexible y te permite planificar internamente sin afectar los límites legales.
          </div>
        </div>
      `,
      width: 600,
      showCancelButton: true,
      showDenyButton: hasSchedule,
      confirmButtonText: 'Guardar Programación',
      cancelButtonText: 'Cancelar',
      denyButtonText: 'Eliminar Programación',
      didOpen: () => {
        // ... (Lógica del modal se mantiene igual)
        const phase1Input = document.getElementById('phase1_days');
        const phase2Input = document.getElementById('phase2_days');
        const phase1Slider = document.getElementById('phase1_slider');
        const phase2Slider = document.getElementById('phase2_slider');

        phase1Input.addEventListener('input', (e) => {
          const val = parseInt(e.target.value) || 1;
          phase1Slider.value = val;
          phase2Input.value = totalDays - val;
          phase2Slider.value = totalDays - val;
        });

        phase1Slider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value);
          phase1Input.value = val;
          phase2Input.value = totalDays - val;
          phase2Slider.value = totalDays - val;
        });

        phase2Input.addEventListener('input', (e) => {
          const val = parseInt(e.target.value) || 1;
          phase2Slider.value = val;
          phase1Input.value = totalDays - val;
          phase1Slider.value = totalDays - val;
        });

        phase2Slider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value);
          phase2Input.value = val;
          phase1Input.value = totalDays - val;
          phase1Slider.value = totalDays - val;
        });
      },
      preConfirm: () => {
        const phase1 = parseInt(document.getElementById('phase1_days').value);
        const phase2 = parseInt(document.getElementById('phase2_days').value);

        if (phase1 + phase2 !== totalDays) {
          Swal.showValidationMessage(`La suma debe ser ${totalDays} días (actualmente: ${phase1 + phase2})`);
          return false;
        }

        return { phase1Days: phase1, phase2Days: phase2 };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        saveScheduleConfig(result.value);
        setRefreshTrigger(prev => prev + 1);
        
        MySwal.fire({
          title: 'Programación Guardada',
          html: `<div class="text-start">
              <p><strong>Fase 1:</strong> ${result.value.phase1Days} días hábiles</p>
              <p><strong>Fase 2:</strong> ${result.value.phase2Days} días hábiles</p>
              <p class="text-muted small mb-0">La nueva columna "Límite Programado" mostrará las fechas calculadas.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Entendido'
        });
      } else if (result.isDenied) {
        clearScheduleConfig();
        setRefreshTrigger(prev => prev + 1);
        
        MySwal.fire({
          title: 'Programación Eliminada',
          text: 'Se ha eliminado la configuración de programación del proceso.',
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }
    });
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
  
  // --- ACCIONES PARA LA BARRA DE CONTROL DE TIEMPO ---
  const handleDateChange = (newDate) => {
    setSystemDate(newDate);
  };
  
  const handleDateShift = (days) => {
    setSystemDate(prevDate => moment(prevDate).add(days, 'days').format('YYYY-MM-DD'));
  };

  const resetDate = () => {
    setSystemDate(moment().format('YYYY-MM-DD'));
  };
  
  const Header = () => (
    <div className="exp-head d-flex align-items-center justify-content-between">
      <div className="small w-100"><div className="row g-2 m-0 fw-bold">
        <div className="col-5 cell-border">Evento</div>
        <div className="col-2 text-center cell-border">Fecha Evento</div>
        <div className="col-3 text-center cell-border">Límite Legal</div>
        <div className="col-2 text-center">Límite Programado</div>
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
            key={`row-${i}-${value.state ?? 'no-state'}-${value.version ?? 'no-version'}-${refreshTrigger}-${systemDate}`}
            value={value} i={i} clock={clock} onSave={save_clock} onDelete={delete_clock} cat={cat}
            outCodes={outCodes} _CHILD_6_SELECT={_CHILD_6_SELECT} _FIND_6={_FIND_6}
            helpers={{ getClock, getNewestDate, ...manager, currentItem }}
            scheduleConfig={scheduleConfig}
          />
        );
    });
  }

  return (
    <div className="exp-wrapper">
      {/* BARRA DE HERRAMIENTAS DE TIEMPO - CONTROL DINÁMICO */}
      {showTimeTravel ? (
         <ControlBar 
            timeTravel={{
                systemDate,
                onDateChange: handleDateChange,
                onDateShift: handleDateShift,
                onDateReset: resetDate,
            }}
            onClose={() => setShowTimeTravel(false)}
          />
      ) : (
          <div className="d-flex justify-content-end mb-2">
             <button 
                className="btn btn-sm btn-time-travel-toggle" 
                onClick={() => setShowTimeTravel(true)}
                title="Activar máquina del tiempo"
             >
                 <i className="fas fa-user-clock me-2"></i>
                 Modificar fecha del sistema
             </button>
          </div>
      )}

      <div className="exp-container">
        <div className="exp-main-content">
          <div className="card exp-card">
            <Header />
            <div className="exp-scroll" style={{ height: sidebarHeight, maxHeight: sidebarHeight }}>{renderClockList()}</div>
          </div>
        </div>
        
        <div className="exp-sidebar" ref={sidebarRef}>
          <SidebarInfo 
             manager={manager} 
             actions={{ 
               onAddTimeControl: addTimeControl,
               onOpenScheduleModal: openScheduleModal
             }} 
          />
          <HolidayCalendar />
        </div>
      </div>
    </div>
  );
}