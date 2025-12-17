import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

import { useClocksManager, useScheduleConfig } from './hooks/useClocksManager';
import { generateClocks } from './config/clocks.definitions';
import { ClockRow } from './components/ClockRow';
import { SidebarInfo } from './components/SidebarInfo';
import { HolidayCalendar } from './components/HolidayCalendar';
import { ControlBar } from './components/ControlBar';
import { ScheduleModal } from './components/ScheduleModal';
import { AlarmsWidget } from './components/AlarmsWidget'; // Importar el nuevo widget
import { useAlarms } from './hooks/useAlarms'; // Importar el nuevo hook de alarmas
import { calcularDiasHabiles } from './hooks/useClocksManager';
import { buildSchedulePayload, calculateLegalLimit } from './utils/scheduleUtils';

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
  
  const [showTimeTravel, setShowTimeTravel] = useState(false);
  // --- ESTADO: Controla la visibilidad del widget de alarmas flotante ---
  const [showAlarms, setShowAlarms] = useState(false);
  
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

  const conGI = _GLOBAL_ID === 'cb1';
  const namePayment = conGI ? 'Impuestos Municipales' : 'Impuesto Delineacion';

  const clocksToShowRaw = generateClocks({
      ...manager,
      currentItem,
      namePayment,
      conGI
  });

  // --- OBTENEMOS LAS ALARMAS USANDO EL HOOK (PUNTO 4: AHORA PASAMOS systemDate) ---
  const alarms = useAlarms(manager, scheduleConfig, clocksToShowRaw, systemDate);

  // --- PUNTO 1: ELIMINADO EL useEffect QUE ABRÍA AUTOMÁTICAMENTE EL WIDGET ---
  // Ya no se abrirá solo al cargar la página.

  useEffect(() => {
    const handleResize = () => {
      if (sidebarRef.current) {
        setSidebarHeight(sidebarRef.current.offsetHeight - 44);
      }
    };
    
    handleResize(); 
    const timer = setTimeout(handleResize, 200); 

    window.addEventListener('resize', handleResize);
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
    };
  }, [clocksData, manager.canAddExtension, manager.canAddSuspension, systemDate, alarms]);
  
  const { getClock, getClockVersion, availableSuspensionTypes, totalSuspensionDays, suspensionPreActa, suspensionPostActa, FUN_0_TYPE_TIME } = manager;

  const filterAfterDesist = (items) => {
    if (!manager.isDesisted) return items;

    let skip = false;
    let inDesistBlock = false;
    const res = [];

    items.forEach((item) => {
      const titleUpper = (item.title || '').toUpperCase();

      if (titleUpper.includes('EJECUTORIA')) {
        skip = false;
        inDesistBlock = false;
        res.push(item);
        return;
      }

      if (titleUpper.includes('DESIST')) {
        skip = false;
        inDesistBlock = true;
        res.push(item);
        return;
      }

      if (item.title && !titleUpper.includes('DESIST')) {
        if (inDesistBlock) {
          skip = true;
          inDesistBlock = false;
        }
      }

      if (!skip) res.push(item);
    });

    return res;
  };

  const clocksToShow = filterAfterDesist(clocksToShowRaw);

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
    
    if (value.version !== undefined) {
        formDataClock.set('version', value.version);
    }

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
      version: value.version,
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
    let localScheduleData = scheduleConfig?.times || {};
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'schedule-modal-root';

    const handleScheduleChange = (newSchedule) => {
      localScheduleData = newSchedule;
    };

    const legalLimits = {};
    
    clocksToShow.forEach(clockValue => {
      if (!clockValue.title && clockValue.state !== undefined && clockValue.state !== false) {
        const limitDate = calculateLegalLimit(clockValue.state, clockValue, manager);
        
        if (limitDate) {
          legalLimits[clockValue.state] = {
            limitDate: limitDate
          };
        }
      }
    });

    MySwal.fire({
      title: 'Programar Tiempos del Proceso',
      html: modalContainer,
      width: 1000,
      showCancelButton: true,
      showDenyButton: hasSchedule,
      confirmButtonText: '<i class="fas fa-save me-2"></i>Guardar Programación',
      cancelButtonText: 'Cancelar',
      denyButtonText: '<i class="fas fa-trash me-2"></i>Eliminar Programación',
      didOpen: () => {
        ReactDOM.render(
          <ScheduleModal
            clocksToShow={clocksToShow}
            currentItem={currentItem}
            manager={manager}
            scheduleConfig={scheduleConfig}
            onScheduleChange={handleScheduleChange}
            legalLimits={legalLimits}
          />,
          modalContainer
        );
      },
      preConfirm: () => {
        if (Object.keys(localScheduleData).length === 0) {
          Swal.showValidationMessage('Debes programar al menos un tiempo antes de guardar');
          return false;
        }

        return localScheduleData;
      },
      willClose: () => {
        ReactDOM.unmountComponentAtNode(modalContainer);
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const payload = buildSchedulePayload(result.value, currentItem);
        
        MySwal.fire({
          title: 'Guardando...',
          text: 'Por favor espera mientras guardamos la programación',
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false
        });

        const formData = new FormData();
        formData.append('scheduleConfig', JSON.stringify(payload));

        FUN_SERVICE.updateSchedule(currentItem.id, formData)
          .then(response => {
            if (response.data === 'OK' || response.status === 200) {
              saveScheduleConfig(payload);
              setRefreshTrigger(prev => prev + 1);
              
              const scheduledCount = Object.keys(result.value).length;
              MySwal.fire({
                title: 'Programación Guardada',
                html: `<div class="text-start">
                    <p><i class="fas fa-check-circle text-success me-2"></i><strong>${scheduledCount}</strong> tiempo${scheduledCount !== 1 ? 's' : ''} programado${scheduledCount !== 1 ? 's' : ''}</p>
                    <p class="text-muted small mb-0">La columna "Límite Programado" mostrará las fechas calculadas.</p>
                  </div>
                `,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
              });
            } else {
              throw new Error('Respuesta inesperada del servidor');
            }
          })
          .catch(error => {
            console.error('Error guardando programación:', error);
            MySwal.fire({
              title: 'Error al Guardar',
              text: 'No se pudo guardar la programación. Por favor intenta nuevamente.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          });
      } else if (result.isDenied) {
        MySwal.fire({
          title: '¿Estás seguro?',
          text: 'Se eliminará toda la programación de tiempos para este expediente.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            const formData = new FormData();
            formData.append('scheduleConfig', JSON.stringify(null));

            FUN_SERVICE.updateSchedule(currentItem.id, formData)
              .then(() => {
                clearScheduleConfig();
                setRefreshTrigger(prev => prev + 1);
                
                MySwal.fire({
                  title: 'Programación Eliminada',
                  text: 'Se ha eliminado la configuración de programación del proceso.',
                  icon: 'info',
                  timer: 2000,
                  showConfirmButton: false
                });
              })
              .catch(error => {
                console.error('Error eliminando programación:', error);
                MySwal.fire({
                  title: 'Error',
                  text: 'No se pudo eliminar la programación.',
                  icon: 'error'
                });
              });
          }
        });
      }
    });
  };

  const _FIND_6 = (id) => (currentItem.fun_6s || []).find(f => f.id == id) || null;
  const _CHILD_6_SELECT = () => (currentItem.fun_6s || []).map(f => <option key={f.id} value={f.id}>{f.description}</option>);
  
  const catForTitle = (title = '') => {
    title = title.toUpperCase();
    if (title.includes('DESISTIDO') || title.includes('DESISTIMIENTO')) return { color: '#F93154', icon: 'fa-exclamation-circle' };
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
    <div className="exp-head d-flex align-items-center justify-between">
      <div className="small w-100"><div className="row g-2 m-0 fw-bold">
        <div className="col-5 cell-border">Evento</div>
        <div className="col-2 text-center cell-border">Fecha Evento</div>
        <div className="col-2 text-center cell-border">Límite Legal</div>
        <div className="col-3 text-center">Límite Programado</div>
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
            systemDate={systemDate}
          />
        );
    });
  }

  return (
    <div className="exp-wrapper">
      
      {/* --- PUNTO 1 y 2: LÓGICA DE RENDERIZADO DEL WIDGET DE ALARMAS Y FAB --- */}
      {showAlarms && (
        <AlarmsWidget 
          alarms={alarms} 
          onClose={() => setShowAlarms(false)} 
        />
      )}
      
      {!showAlarms && alarms.length > 0 && (
        <button className="alarms-fab" onClick={() => setShowAlarms(true)} title="Mostrar Alertas">
          <i className="fas fa-bell"></i>
          <span className="fab-badge">{alarms.length}</span>
        </button>
      )}


      {showTimeTravel && (
        <div className="time-travel-floating-widget">
            <ControlBar 
                timeTravel={{
                    systemDate,
                    onDateChange: handleDateChange,
                    onDateShift: handleDateShift,
                    onDateReset: resetDate,
                }}
                onClose={() => setShowTimeTravel(false)}
            />
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
          
          <div className="sidebar-utilities">
            <button 
              className="btn-sidebar-utility" 
              onClick={() => setShowTimeTravel(true)}
              title="Activar emulador de fecha"
            >
               <i className="fas fa-user-clock"></i>
               Emulador de Fecha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}