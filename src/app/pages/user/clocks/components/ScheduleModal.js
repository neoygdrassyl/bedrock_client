import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { isTimeSchedulable, getReferenceDate, calculateScheduledDateFromDays, calculateDaysFromScheduledDate, getTotalAvailableDaysWithExtensions } from '../utils/scheduleUtils';

export const ScheduleModal = ({ clocksToShow, currentItem, manager, scheduleConfig, onScheduleChange, legalLimits }) => {
  const { getClock, getClockVersion, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension } = manager;
  
  // Estado local para programación
  const [localSchedule, setLocalSchedule] = useState(() => {
    return scheduleConfig?.times || {};
  });

  // Filtrar tiempos programables y ocultar según caso CUMPLE
  const schedulableClocks = useMemo(() => {
    const acta1 = getClock(30);
    const complianceString = "ACTA PARTE 1 OBSERVACIONES: CUMPLE";
    const isCumple = acta1?.desc?.includes(complianceString);
    
    return clocksToShow.filter(clockValue => {
      if (clockValue.title) return false;
      
      const clock = clockValue.version !== undefined
        ? getClockVersion(clockValue.state, clockValue.version)
        : getClock(clockValue.state);
      
      // Si es caso CUMPLE, ocultar tiempos intermedios
      if (isCumple) {
        const hiddenStates = [34, 35, 49]; // Prórroga correcciones, Radiación correcciones, Acta Parte 2
        if (hiddenStates.includes(clockValue.state)) {
          return false;
        }
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
    // Primero intentar obtener desde los límites legales pasados desde la tabla maestra
    if (legalLimits && legalLimits[clockValue.state]) {
      const limitData = legalLimits[clockValue.state];
      if (limitData.limitDate) {
        return moment(limitData.limitDate).format('DD/MM/YYYY');
      }
    }

    // Si no está en legalLimits, no mostrar nada (celda vacía)
    return '';
  };

  // Renderizar fila de programación
  const renderScheduleRow = (clockValue, index) => {
    const clockState = clockValue.state;
    const scheduled = localSchedule[clockState] || {};
    
    const clock = clockValue.version !== undefined
      ? getClockVersion(clockValue.state, clockValue.version)
      : getClock(clockValue.state);

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
          <div className="d-flex align-items-center">
            <span className="fw-semibold">{clockValue.name}</span>
            {clockValue.desc && (
              <span 
                className="ms-2 text-muted small" 
                style={{ fontSize: '0.75rem' }}
                title={clockValue.desc}
              >
                <i className="fas fa-info-circle"></i>
              </span>
            )}
          </div>
        </td>
        
        <td className="align-middle">
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Ej: 5"
            min="1"
            value={daysValue || ''}
            onChange={(e) => handleInputChange(clockState, 'days', e.target.value)}
            disabled={dateValue ? true : false}
          />
          {refDate && displayDate && daysValue && (
            <small className="text-muted d-block mt-1">
              = {moment(displayDate).format('DD/MM/YYYY')}
            </small>
          )}
          {!refDate && daysValue && (
            <small className="text-warning d-block mt-1">
              <i className="fas fa-exclamation-triangle me-1"></i>
              Sin fecha ref.
            </small>
          )}
        </td>
        
        <td className="align-middle">
          <input
            type="date"
            className="form-control form-control-sm"
            value={dateValue || ''}
            onChange={(e) => handleInputChange(clockState, 'date', e.target.value)}
            disabled={daysValue ? true : false}
          />
          {refDate && displayDays && dateValue && (
            <small className="text-muted d-block mt-1">
              = {displayDays} días hábiles
            </small>
          )}
          {!refDate && dateValue && (
            <small className="text-warning d-block mt-1">
              <i className="fas fa-exclamation-triangle me-1"></i>
              Sin fecha ref.
            </small>
          )}
        </td>
        
        <td className="align-middle text-center">
          <span className="text-muted small">{legalLimit}</span>
        </td>
        
        <td className="align-middle text-center">
          {hasSchedule && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDelete(clockState)}
              title="Eliminar programación"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          )}
        </td>
      </tr>
    );
  };

  const scheduledCount = Object.keys(localSchedule).length;

  return (
    <div className="schedule-modal-table-container">
      <div className="alert alert-info mb-3">
        <div className="d-flex align-items-center">
          <i className="fas fa-info-circle me-2"></i>
          <div>
            <strong>Instrucciones:</strong> Programa cada tiempo ingresando <strong>días disponibles</strong> O <strong>fecha específica</strong>.
            <br/>
            <small className="text-muted">
              Los campos se convierten automáticamente para visualización. Guarda al final para aplicar todos los cambios.
            </small>
          </div>
        </div>
      </div>

      {scheduledCount > 0 && (
        <div className="alert alert-success mb-3">
          <i className="fas fa-check-circle me-2"></i>
          <strong>{scheduledCount}</strong> tiempo{scheduledCount !== 1 ? 's' : ''} programado{scheduledCount !== 1 ? 's' : ''}
        </div>
      )}

      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table table-sm table-hover table-bordered">
          <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th style={{ width: '30%' }}>Evento</th>
              <th style={{ width: '20%' }}>Días Disponibles</th>
              <th style={{ width: '20%' }}>Fecha Especificada</th>
              <th style={{ width: '20%' }} className="text-center">Límite Legal (Ref.)</th>
              <th style={{ width: '10%' }} className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {schedulableClocks.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  <i className="fas fa-info-circle me-2"></i>
                  No hay tiempos programables disponibles. 
                  <br/>
                  <small>Los tiempos ya ejecutados no pueden programarse.</small>
                </td>
              </tr>
            ) : (
              schedulableClocks.map((clockValue, index) => renderScheduleRow(clockValue, index))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 p-3 bg-light rounded">
        <div className="row">
          <div className="col-md-6">
            <h6 className="mb-2 text-muted">
              <i className="fas fa-lightbulb me-2"></i>
              Información Importante
            </h6>
            <ul className="small mb-0">
              <li>Los campos <strong>Días</strong> y <strong>Fecha</strong> son excluyentes</li>
              <li>La conversión es solo para visualización, se guarda el dato original</li>
              <li>Los tiempos sin fecha de referencia esperarán a que exista</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6 className="mb-2 text-muted">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Validaciones
            </h6>
            <ul className="small mb-0">
              <li>No se pueden programar tiempos ya ejecutados</li>
              <li>Los días deben ser números positivos</li>
              <li>Las fechas deben ser válidas y futuras</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
