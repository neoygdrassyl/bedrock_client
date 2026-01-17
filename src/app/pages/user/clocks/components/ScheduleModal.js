import React, { useState, useMemo, useEffect } from 'react';
import moment from 'moment';
import { 
  getReferenceDate, 
  calculateScheduledDateFromDays, 
  calculateDaysFromScheduledDate, 
  COMPLIANCE_STRING, 
  HIDDEN_STATES_IN_CUMPLE 
} from '../utils/scheduleUtils';

export const ScheduleModal = ({ clocksToShow, currentItem, manager, scheduleConfig, onScheduleChange, legalLimits }) => {
  const { getClock, getClockVersion, phaseOptions } = manager;
  
  // Estado local para programación
  const [localSchedule, setLocalSchedule] = useState(() => {
    return scheduleConfig?.times || {};
  });

  // Opciones de configuración de fases para ocultar/mostrar notificaciones
  const estudioOptions = phaseOptions?.phase_estudio || { notificationType: 'notificar', byAviso: false };
  const correccionesOptions = phaseOptions?.phase_correcciones || { notificationType: 'notificar', byAviso: false };

  // Filtrar tiempos programables
  const schedulableClocks = useMemo(() => {
    const acta1 = getClock(30);
    const isCumple = acta1?.desc?.includes(COMPLIANCE_STRING);
    
    return clocksToShow.filter(clockValue => {
      // 1. Descartar títulos/secciones
      if (clockValue.title) return false;
      
      // 2. Verificar flag allowSchedule (definido en clocks.definitions.js)
      // NOTA: Ya NO filtramos si clock.date_start existe, para que se vean los ejecutados.
      if (!clockValue.allowSchedule) return false;
      
      // 3. Validar estado existente
      if (clockValue.state === false || clockValue.state === undefined) return false;

      // 4. Lógica de ocultamiento por "CUMPLE"
      if (isCumple && HIDDEN_STATES_IN_CUMPLE.includes(clockValue.state)) {
        return false;
      }

      // 5. Lógica de ocultamiento de Notificaciones (Estudio)
      // Si es "Comunicar", ocultar todo lo de notificación
      if (estudioOptions.notificationType === 'comunicar') {
        if ([31, 32, 33].includes(clockValue.state)) return false; // Oculta Citación, Personal, Aviso
      } else {
        // Si es "Notificar"
        if (estudioOptions.byAviso) {
           // Si es por Aviso, ocultamos Personal (32) pero mostramos Aviso (33) y Citación (31)
           if (clockValue.state === 32) return false; 
        } else {
           // Si es Personal, ocultamos Aviso (33) pero mostramos Personal (32) y Citación (31)
           if (clockValue.state === 33) return false;
        }
      }

      // 6. Lógica de ocultamiento de Notificaciones (Viabilidad)
      if (correccionesOptions.notificationType === 'comunicar') {
        if ([55, 56, 57].includes(clockValue.state)) return false;
      } else {
        if (correccionesOptions.byAviso) {
           if (clockValue.state === 56) return false; 
        } else {
           if (clockValue.state === 57) return false;
        }
      }
      
      return true;
    });
  }, [clocksToShow, getClock, estudioOptions, correccionesOptions]);

  // Actualizar schedule cuando cambia un input
  const handleInputChange = (clockState, field, value) => {
    setLocalSchedule(prev => {
      const newSchedule = { ...prev };
      
      if (!newSchedule[clockState]) {
        newSchedule[clockState] = {
          type: field,
          value: null,
          originalType: field
        };
      }

      // Si se está editando días
      if (field === 'days') {
        const days = value ? parseInt(value) : null;
        newSchedule[clockState] = {
          type: 'days',
          value: days,
          originalType: newSchedule[clockState].originalType || 'days'
        };
        // Limpiar fecha si se ingresa días
        if (days) {
          delete newSchedule[clockState].dateValue;
        }
      }

      // Si se está editando fecha
      if (field === 'date') {
        newSchedule[clockState] = {
          type: 'date',
          value: value || null,
          originalType: newSchedule[clockState].originalType || 'date'
        };
        // Limpiar días si se ingresa fecha
        if (value) {
          delete newSchedule[clockState].daysValue;
        }
      }

      // Si ambos están vacíos, eliminar la entrada
      if (!newSchedule[clockState].value) {
        delete newSchedule[clockState];
      }

      return newSchedule;
    });
  };

  // Eliminar programación de un tiempo específico
  const handleDelete = (clockState) => {
    setLocalSchedule(prev => {
      const newSchedule = { ...prev };
      delete newSchedule[clockState];
      return newSchedule;
    });
  };

  // Notificar cambios al padre
  useEffect(() => {
    if (onScheduleChange) {
      onScheduleChange(localSchedule);
    }
  }, [localSchedule, onScheduleChange]);

  // Obtener límite legal para referencia desde tabla maestra
  const getLegalLimitForReference = (clockValue) => {
    if (legalLimits && legalLimits[clockValue.state]) {
      const limitData = legalLimits[clockValue.state];
      if (limitData.limitDate) {
        return moment(limitData.limitDate).format('DD/MM/YYYY');
      }
    }
    return '';
  };

  // Renderizar fila de programación
  const renderScheduleRow = (clockValue, index) => {
    const clockState = clockValue.state;
    const scheduled = localSchedule[clockState] || {};
    
    // Obtener fecha de referencia para cálculos
    const refDate = getReferenceDate(
      clockState,
      clockValue,
      { times: localSchedule },
      getClock,
      getClockVersion,
      manager
    );

    // Valores actuales
    const daysValue = scheduled.type === 'days' ? scheduled.value : '';
    const dateValue = scheduled.type === 'date' ? scheduled.value : '';

    // Conversión para visualización
    let displayDays = daysValue;
    let displayDate = dateValue;

    if (refDate) {
      if (daysValue && !displayDate) {
        displayDate = calculateScheduledDateFromDays(refDate, daysValue);
      } else if (dateValue && !displayDays) {
        displayDays = calculateDaysFromScheduledDate(refDate, dateValue);
      }
    }

    const legalLimit = getLegalLimitForReference(clockValue);
    const hasSchedule = scheduled.type && scheduled.value;
    
    // Verificar si ya está ejecutado para indicarlo visualmente (opcional)
    const isExecuted = getClock(clockState)?.date_start;

    return (
      <tr key={`schedule-row-${clockState}-${index}`} className={hasSchedule ? 'table-active' : ''}>
        {/* Nombre alineado a la izquierda explícitamente */}
        <td className="align-middle text-start">
          <div className="d-flex flex-column align-items-start text-start ps-2">
            <span className="fw-semibold text-truncate" title={clockValue.name} style={{maxWidth: '350px'}}>
                {clockValue.name} 
                {isExecuted && <i className="fas fa-check-circle text-success ms-2 small" title="Evento ya ejecutado"></i>}
            </span>
            {clockValue.desc && (
              <small className="text-muted text-truncate text-start" style={{maxWidth: '350px'}} title={clockValue.desc}>
                {clockValue.desc}
              </small>
            )}
          </div>
        </td>
        
        <td className="align-middle">
            <div className="input-group input-group-sm">
                <input
                    type="number"
                    className="form-control"
                    placeholder="Días"
                    min="1"
                    value={daysValue || ''}
                    onChange={(e) => handleInputChange(clockState, 'days', e.target.value)}
                    disabled={dateValue ? true : false}
                />
                <span className="input-group-text bg-light"><i className="fas fa-hashtag"></i></span>
            </div>
            {refDate && displayDate && daysValue && (
                <div className="conversion-hint mt-1 text-start">
                 <i className="fas fa-arrow-right me-1"></i> {moment(displayDate).format('DD/MM/YYYY')}
                </div>
            )}
        </td>
        
        <td className="align-middle">
            <div className="input-group input-group-sm">
                <input
                    type="date"
                    className="form-control"
                    value={dateValue || ''}
                    onChange={(e) => handleInputChange(clockState, 'date', e.target.value)}
                    disabled={daysValue ? true : false}
                />
            </div>
             {refDate && displayDays && dateValue && (
                <div className="conversion-hint mt-1 text-start">
                 <i className="fas fa-arrow-right me-1"></i> {displayDays} días hábiles
                </div>
            )}
        </td>
        
        <td className="align-middle text-center">
            {legalLimit ? (
                <span className="badge bg-light text-dark border">{legalLimit}</span>
            ) : (
                <span className="text-muted">-</span>
            )}
        </td>
        
        <td className="align-middle text-center">
          {hasSchedule ? (
            <button
              type="button"
              className="btn btn-sm btn-icon btn-outline-danger border-0"
              onClick={() => handleDelete(clockState)}
              title="Eliminar programación"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          ) : (
             <span className="text-muted small"><i className="fas fa-circle" style={{fontSize: '5px'}}></i></span> 
          )}
        </td>
      </tr>
    );
  };

  const scheduledCount = Object.keys(localSchedule).length;

  return (
    <div className="schedule-modal-layout">
      {/* 1. Header & Instructions Panel */}
      <div className="schedule-modal-header-panel">
          <div className="row g-2 align-items-center">
              <div className="col-md-8 text-start">
                  <div className="alert alert-info mb-0 py-2 px-3 small">
                      <div className="d-flex align-items-center">
                          <i className="fas fa-info-circle fs-4 me-3 text-info"></i>
                          <div>
                              <strong>Instrucciones:</strong> Define los tiempos usando <strong>días hábiles</strong> O una <strong>fecha específica</strong>.<br/>
                              Los tiempos sin fecha de referencia esperarán a que exista para calcular la conversión.
                          </div>
                      </div>
                  </div>
              </div>
              <div className="col-md-4">
                 <div className={`card text-center py-2 ${scheduledCount > 0 ? 'border-success bg-success-subtle' : 'bg-light'}`}>
                    <h3 className="m-0 fw-bold">{scheduledCount}</h3>
                    <small className="text-muted text-uppercase">Tiempos Programados</small>
                 </div>
              </div>
          </div>
      </div>

      {/* 2. Scrollable Table Area */}
      <div className="schedule-modal-table-area">
        <table className="table table-sm table-hover table-bordered mb-0 table-fixed-header">
          <thead className="table-light">
            <tr>
              <th style={{ width: '40%' }} className="text-start ps-3">Evento / Hito</th>
              <th style={{ width: '18%' }}>Días Disponibles</th>
              <th style={{ width: '22%' }}>Fecha Objetivo</th>
              <th style={{ width: '15%' }} className="text-center">Límite Legal</th>
              <th style={{ width: '5%' }} className="text-center"></th>
            </tr>
          </thead>
          <tbody>
            {schedulableClocks.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-5">
                  <i className="fas fa-calendar-times fa-2x mb-2"></i><br/>
                  No hay tiempos programables disponibles en este momento.
                </td>
              </tr>
            ) : (
              schedulableClocks.map((clockValue, index) => renderScheduleRow(clockValue, index))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};