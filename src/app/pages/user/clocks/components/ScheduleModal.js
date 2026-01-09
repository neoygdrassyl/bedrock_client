import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { isTimeSchedulable, getReferenceDate, calculateScheduledDateFromDays, calculateDaysFromScheduledDate, getTotalAvailableDaysWithExtensions, COMPLIANCE_STRING, HIDDEN_STATES_IN_CUMPLE } from '../utils/scheduleUtils';

export const ScheduleModal = ({ clocksToShow, currentItem, manager, scheduleConfig, onScheduleChange, legalLimits }) => {
  const { getClock, getClockVersion, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension } = manager;
  
  // Estado local para programación
  const [localSchedule, setLocalSchedule] = useState(() => {
    return scheduleConfig?.times || {};
  });

  // Filtrar tiempos programables y ocultar según caso CUMPLE
  const schedulableClocks = useMemo(() => {
    const acta1 = getClock(30);
    const isCumple = acta1?.desc?.includes(COMPLIANCE_STRING);
    
    return clocksToShow.filter(clockValue => {
      if (clockValue.title) return false;
      
      const clock = clockValue.version !== undefined
        ? getClockVersion(clockValue.state, clockValue.version)
        : getClock(clockValue.state);
      
      // Si es caso CUMPLE, ocultar tiempos intermedios
      if (isCumple && HIDDEN_STATES_IN_CUMPLE.includes(clockValue.state)) {
        return false;
      }
      
      return isTimeSchedulable(clockValue, clock);
    });
  }, [clocksToShow, getClock, getClockVersion]);

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
  React.useEffect(() => {
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

    return (
      <tr key={`schedule-row-${clockState}-${index}`} className={hasSchedule ? 'table-active' : ''}>
        <td className="align-middle">
          <div className="d-flex flex-column">
            <span className="fw-semibold text-truncate" title={clockValue.name} style={{maxWidth: '350px'}}>{clockValue.name}</span>
            {clockValue.desc && (
              <small className="text-muted text-truncate" style={{maxWidth: '350px'}} title={clockValue.desc}>
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
                <div className="conversion-hint mt-1">
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
                <div className="conversion-hint mt-1">
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
              <div className="col-md-8">
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
              <th style={{ width: '40%' }}>Evento / Hito</th>
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