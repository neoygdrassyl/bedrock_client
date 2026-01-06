import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { AlarmsWidget } from './components/AlarmsWidget';
import { useAlarms } from './hooks/useAlarms';
import { calcularDiasHabiles } from './hooks/useClocksManager';
import { buildSchedulePayload, calculateLegalLimit } from './utils/scheduleUtils';
import { GanttModal } from './components/gantt/GanttModal';

import FUN_SERVICE from '../../../services/fun.service';
import { dateParser_dateDiff } from '../../../components/customClasses/typeParse';

import './centralClocks.css';
import './gantt.css';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

export default function EXP_CLOCKS(props) {
  const { swaMsg, currentItem, currentVersion, outCodes } = props;
  const [clocksData, setClocksData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarHeight, setSidebarHeight] = useState('auto');
  
  const [showTimeTravel, setShowTimeTravel] = useState(false);
  const [showAlarms, setShowAlarms] = useState(false);
  
  const [systemDate, setSystemDate] = useState(moment().format('YYYY-MM-DD'));
  
  // Estado para secciones colapsables (Acordeón)
  const [collapsedSections, setCollapsedSections] = useState({});

  // --- NUEVO ESTADO: Almacena el ID de la fase activa para el resaltado ---
  const [activePhaseId, setActivePhaseId] = useState(null);
  const [showGanttModal, setShowGanttModal] = useState(false);

  const sidebarRef = useRef(null);

  const { scheduleConfig, saveScheduleConfig, clearScheduleConfig, hasSchedule } = useScheduleConfig(currentItem?.id);


  useEffect(() => {
    if (currentItem?.fun_clocks) {
      const clock1001FromProps = currentItem.fun_clocks.find(c => String(c.state) === '1001');
      const clock1001FromState = clocksData.find(c => String(c.state) === '1001');
      
      // SOLO actualizar si el 1001 del state es diferente al de las props
      // Esto previene que se sobrescriba el estado local durante una actualización optimista
      if (!clock1001FromState || (clock1001FromProps && clock1001FromProps.desc !== clock1001FromState.desc)) {
         setClocksData([...currentItem.fun_clocks]);
         setRefreshTrigger(prev => prev + 1);
      } 
      // else {
      //   //  console.log('%c[EFFECT 1] `fun_clocks` recibido, pero se omite la actualización del state para prevenir sobreescritura.', 'color: #007BFF');
      // }
    }
  }, [currentItem?.fun_clocks]);

  const phaseOptions = useMemo(() => {
    const phaseOptionsClock = clocksData.find(c => String(c.state) === '1001');
    try {
      return phaseOptionsClock?.desc ? JSON.parse(phaseOptionsClock.desc) : {};
    } catch (e) {
      console.error("Error parsing phaseOptions JSON:", e);
      return {};
    }
  }, [clocksData]);

  // Ahora pasamos phaseOptions al manager
  const manager = useClocksManager(currentItem, clocksData, currentVersion, systemDate, phaseOptions);

  const conGI = _GLOBAL_ID === 'cb1';
  const namePayment = conGI ? 'Impuestos Municipales' : 'Impuesto Delineacion';

  const clocksToShowRaw = generateClocks({
      ...manager,
      currentItem,
      namePayment,
      conGI,
      phaseOptions // Pasamos las opciones a las definiciones
  });

  const alarms = useAlarms(manager, scheduleConfig, clocksToShowRaw, systemDate);

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

  // Este hook se va a encargar de sincronizar el campo de fecha de valla del informe juridico con un state,
  // TODO: Como trabajo futuro se va a corregir para que directamente desde el formulario juridico el guardado en el state
  useEffect(() => {
      const syncVallaDate = () => {
          // Evita ejecuciones si los datos no están listos
          if (!currentItem || !currentItem.fun_law) return;

          // --- Obtener fechas de ambas fuentes ---
          const signArray = currentItem.fun_law.sign ? currentItem.fun_law.sign.split(',') : [];
          const formDate = signArray.length > 1 && signArray[1] ? signArray[1] : null;

          const clock503 = (clocksData || []).find(c => c.state == 503);
          const clockDate = clock503 ? clock503.date_start : null;
          
          // --- Lógica de Sincronización Bidireccional ---
          
          // Caso 1: El formulario tiene la fecha y el reloj no, o son diferentes.
          // El formulario es la fuente de verdad y actualiza el reloj.
          if (formDate && (!clockDate || formDate !== clockDate)) {
              const formData = new FormData();
              formData.set('date_start', formDate);
              formData.set('state', 503);
              formData.set('name', 'Instalación y Registro de la Valla Informativa'); // Desde clock.definitions.js
              formData.set('desc', 'Instalación de la valla informativa del proyecto'); // Desde clock.definitions.js
              
              // Reutiliza la función existente para crear/actualizar el reloj
              manage_clock(false, 503, undefined, formData, true);
          }
          
          // Caso 2: El reloj tiene la fecha pero el formulario no.
          // El reloj actualiza al formulario.
          else if (clockDate && !formDate) {
              const funLawId = currentItem.fun_law.id;
              if (!funLawId) return; // No se puede actualizar sin un ID

              const newSign = [signArray[0] || '-1', clockDate].join(',');
              
              const formData = new FormData();
              formData.set('sign', newSign);
              
              FUN_SERVICE.update_sign(funLawId, formData)
                  .then(response => {
                      if (response.data === 'OK') {
                          props.requestUpdate(currentItem.id);
                      }
                  })
                  .catch(e => console.error("Error sincronizando formulario desde reloj:", e));
          }
      };

      // Llama a la función de sincronización. El timeout previene carreras de datos al inicio.
      const timer = setTimeout(syncVallaDate, 100);
      return () => clearTimeout(timer);

  }, [currentItem, clocksData, props.requestUpdate]);
  
  const { getClock, getClockVersion, availableSuspensionTypes, totalSuspensionDays, suspensionPreActa, suspensionPostActa } = manager;

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

  const toggleSection = (title) => {
    setCollapsedSections(prev => ({
        ...prev,
        [title]: !prev[title]
    }));
  };

  const applyLocalClockChange = (state, changes, version) => {
    
    setClocksData(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const idx = arr.findIndex(c => String(c.state) === String(state) && (version !== undefined ? String(c.version) === String(version) : true));
      
      let newClock;
      if (idx >= 0) {
        newClock = { ...arr[idx], ...changes };
        arr[idx] = newClock;
      } else {
        newClock = { ...changes, state, version };
        arr.push(newClock);
      }
      
      // Si estamos actualizando el clock 1001, refrescamos el trigger
      // para forzar el re-renderizado completo con las nuevas opciones.
      if (String(state) === '1001') {
        setRefreshTrigger(p => p + 1);
      }
      
      console.groupEnd();
      return arr;
    });
  };

  const save_clock = (value, i) => {
    if (value.state === false || value.state == null) return;
    var formDataClock = new FormData();

    const dateInput = document.getElementById("clock_exp_date_" + i);
    const dateVal = dateInput ? String(dateInput.value || '').trim() : '';

    if (dateVal) formDataClock.set('date_start', dateVal);
    formDataClock.set('state', value.state);
    
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
          const days = dateParser_dateDiff(startExt, dateVal);
          descBase = `Fin de prórroga (${days} días)`;
        }
    }

    formDataClock.set('desc', descBase);
    formDataClock.set('name', value.name);

    applyLocalClockChange(value.state, {
      date_start: dateVal,
      desc: descBase,
      name: value.name,
      version: value.version,
    }, value.version);

    manage_clock(false, value.state, value.version, formDataClock, true);
  }

  const manage_clock = (useMySwal, findOne, version, formDataClock, triggerUpdate = false) => {
    console.groupCollapsed('%c[manage_clock] Guardando en backend', 'color: #17a2b8');
    
    var _CHILD = getClockVersion(findOne, version) || getClock(findOne);
    formDataClock.set('fun0Id', currentItem.id);

    if (useMySwal) MySwal.fire({ title: swaMsg.title_wait, text: swaMsg.text_wait, icon: 'info', showConfirmButton: false });
    
    const onOk = () => {
      if (useMySwal) MySwal.fire({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer, icon: 'success', confirmButtonText: swaMsg.text_btn });
      props.requestUpdate(currentItem.id);
      if (triggerUpdate) setTimeout(() => props.requestUpdate(currentItem.id), 150);
      console.groupEnd();
    }
    const onErr = (e) => {
      console.error('Error guardando clock en backend:', e);
      if (useMySwal) MySwal.fire({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning', confirmButtonText: swaMsg.text_btn });
      console.groupEnd();
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
                  </div>`,
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
        // ... (Logica de eliminación igual)
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

  const handleOptionChange = (phaseKey, option, value) => {

    // 1. Clonar las opciones actuales desde el estado para una UI optimista
    let allOptions = { ...(phaseOptions || {}) };

    // 2. Preparar la estructura para la fase si no existe
    if (!allOptions[phaseKey]) {
        allOptions[phaseKey] = {};
    }

    // 3. Actualizar la opción específica
    let phaseSpecificOptions = { ...allOptions[phaseKey], [option]: value };

    // 4. Lógica excluyente
    if (option === 'notificationType' && value === 'comunicar') {
        phaseSpecificOptions.byAviso = false;
    }

    // 5. Unir todo en el objeto principal
    const newAllOptions = { ...allOptions, [phaseKey]: phaseSpecificOptions };
    const newDesc = JSON.stringify(newAllOptions);

    applyLocalClockChange('1001', { name: 'phase_options', desc: newDesc }, undefined);

    // 7. Guardar en backend en segundo plano
    const formData = new FormData();
    formData.set('name', 'phase_options');
    formData.set('desc', newDesc);
    
    // El 'false' en triggerUpdate es importante para evitar una solicitud de actualización extra
    manage_clock(false, '1001', undefined, formData, false);
    console.groupEnd();
  };


  const _FIND_6 = (id) => (currentItem.fun_6s || []).find(f => f.id == id) || null;
  const _CHILD_6_SELECT = () => (currentItem.fun_6s || []).map(f => <option key={f.id} value={f.id}>{f.description}</option>);
  
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
  
  // -- NUEVO HEADER CON ALINEACIÓN A LA IZQUIERDA --
  const Header = () => (
    <div className="exp-head d-flex align-items-center">
      <div className="col-eventos header-title">
        <i className="fas fa-list me-2"></i> Evento
      </div>
      <div className="col-fecha header-title">
         <i className="far fa-calendar me-2"></i> Fecha evento
      </div>
      <div className="col-limite header-title">
         <i className="fas fa-history me-2"></i> Límite legal
      </div>
      <div className="col-programado header-title">
         <i className="fas fa-calendar-check me-2"></i> Límite Programado
      </div>
       <div className="col-alarma header-title">
         <i className="far fa-clock me-2"></i> Alarmas
      </div>
    </div>
  );

  let lastTitle = '';
  const renderClockList = () => {
    let isCurrentGroupCollapsed = false;

    // --- Lógica para encontrar la clase de resaltado ---
    const activePhase = manager.processPhases.find(p => p.id === activePhaseId);
    const highlightClass = activePhase ? activePhase.highlightClass : '';
    const relatedStates = activePhase ? activePhase.relatedStates : [];

    // Esta función renderiza la cinta de opciones
    const renderOptionsRibbon = (phaseKey) => {
      const phaseSpecificOptions = phaseOptions[phaseKey] || {};
      const notificationType = phaseSpecificOptions.notificationType || 'notificar';
      const byAviso = phaseSpecificOptions.byAviso === true;
      
      return (
        <div className="section-options" onClick={(e) => e.stopPropagation()}>
          <div className="compact-radio-group">
            <div className="form-check">
              <input 
                type="radio" 
                className="form-check-input" 
                name={`notificationType_${phaseKey}`}
                id={`type_notificar_${phaseKey}`}
                value="notificar"
                checked={notificationType === 'notificar'}
                onChange={() => handleOptionChange(phaseKey, 'notificationType', 'notificar')}
              />
              <label className="form-check-label" htmlFor={`type_notificar_${phaseKey}`}>Notificar</label>
            </div>
            <div className="form-check">
              <input 
                type="radio" 
                className="form-check-input" 
                name={`notificationType_${phaseKey}`}
                id={`type_comunicar_${phaseKey}`}
                value="comunicar"
                checked={notificationType === 'comunicar'}
                onChange={() => handleOptionChange(phaseKey, 'notificationType', 'comunicar')}
              />
              <label className="form-check-label" htmlFor={`type_comunicar_${phaseKey}`}>Comunicar</label>
            </div>
          </div>

          {notificationType === 'notificar' && (
             <div className="compact-sub-option">
               <div className="form-check form-switch">
                 <input 
                   className="form-check-input" 
                   type="checkbox" 
                   role="switch" 
                   id={`checkByAviso_${phaseKey}`}
                   checked={byAviso}
                   onChange={(e) => handleOptionChange(phaseKey, 'byAviso', e.target.checked)}
                 />
                 <label className="form-check-label" htmlFor={`checkByAviso_${phaseKey}`}>Por Aviso</label>
               </div>
             </div>
          )}
        </div>
      );
    };

    return clocksToShow.map((value, i) => {
        const clock = value.version !== undefined
          ? getClockVersion(value.state, value.version)
          : getClock(value.state);
        
        if (value.title) {
            // AÑADIDO: Si el título tiene show: false, no renderizarlo y colapsar el grupo
            if (value.show === false) {
                isCurrentGroupCollapsed = true;
                return null;
            }
            
            lastTitle = value.title;
            const isCollapsed = collapsedSections[value.title];
            isCurrentGroupCollapsed = isCollapsed;

            const isEstudioValla = value.title === 'Estudio y Observaciones';
            const isRevisionCorrecciones = value.title === 'Revisión y Viabilidad';
            
            // --- NUEVO: Determinar si la sección está resaltada ---
            const isSectionHighlighted = relatedStates.length > 0;

            return (
                <div 
                  key={`section-${i}`} 
                  className={`exp-section-header ${isSectionHighlighted ? highlightClass : ''}`} 
                  onClick={() => toggleSection(value.title)}
                >
                    <div className="d-flex align-items-center">
                        <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'down'} me-3 text-muted`}></i>
                        <span className="fw-normal">{value.title}</span>
                    </div>

                    {!isCollapsed && isEstudioValla && renderOptionsRibbon('phase_estudio')}
                    {!isCollapsed && isRevisionCorrecciones && renderOptionsRibbon('phase_correcciones')}
                </div>
            );
        }

        if (isCurrentGroupCollapsed) {
            return null;
        }

        // --- NUEVO: Determinar si la fila está resaltada ---
        const isRowHighlighted = relatedStates.includes(value.state);

        return (
          <ClockRow
            key={`row-${i}-${value.state ?? 'no-state'}-${value.version ?? 'no-version'}-${refreshTrigger}-${systemDate}`}
            value={value} i={i} clock={clock} onSave={save_clock} onDelete={delete_clock}
            outCodes={outCodes} _CHILD_6_SELECT={_CHILD_6_SELECT} _FIND_6={_FIND_6}
            helpers={{ getClock, getNewestDate, ...manager, currentItem }}
            scheduleConfig={scheduleConfig}
            systemDate={systemDate}
            // --- NUEVO: Pasar la clase de resaltado ---
            highlightClass={isRowHighlighted ? highlightClass : ''}
          />
        );
    });
  }

  return (
    <div className="exp-wrapper">
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

      <GanttModal
        isOpen={showGanttModal}
        onClose={() => setShowGanttModal(false)}
        phases={manager.processPhases}
        ldfDate={getClock(5)?.date_start || currentItem?.date}
        suspensionPreActa={manager.suspensionPreActa}
        suspensionPostActa={manager.suspensionPostActa}
        extension={manager.extension}
        currentItem={currentItem}
      />

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
              onOpenScheduleModal: openScheduleModal,
            }}
            onActivePhaseChange={setActivePhaseId}
            activePhaseId={activePhaseId}
          onOpenGanttModal={() => setShowGanttModal(true)}
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