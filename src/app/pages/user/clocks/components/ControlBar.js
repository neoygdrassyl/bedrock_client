import React from 'react';
import moment from 'moment';

export const ControlBar = ({ timeTravel }) => {
  const { systemDate, onDateChange, onDateShift, onDateReset } = timeTravel;
  const isToday = moment(systemDate).isSame(moment(), 'day');

  return (
    <div className="control-bar">
      <div className="bar-inner">
        <div className="time-travel-controls">
          <span className="control-label"><i className="fas fa-magic me-2"></i>Modificar fecha actual</span>
          
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm" 
            title="Retroceder 5 días"
            onClick={() => onDateShift(-5)}
          >
            <i className="fas fa-chevron-left me-1"></i>-5d
          </button>

          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm" 
            title="Retroceder 5 días"
            onClick={() => onDateShift(-1)}
          >
            <i className="fas fa-chevron-left me-1"></i>-1d
          </button>
          
          <input 
            type="date" 
            className="form-control form-control-sm date-picker"
            value={systemDate}
            onChange={(e) => onDateChange(e.target.value)}
          />

          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm" 
            title="Retroceder 5 días"
            onClick={() => onDateShift(1)}
          >
            <i className="fas fa-chevron-right me-1"></i>+1d
          </button>
          
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm" 
            title="Avanzar 5 días"
            onClick={() => onDateShift(5)}
          >
            +5d<i className="fas fa-chevron-right ms-1"></i>
          </button>
          
          <button 
            type="button" 
            className={`btn btn-sm ${isToday ? 'btn-secondary' : 'btn-primary'}`}
            title="Volver a la fecha actual"
            onClick={onDateReset}
            disabled={isToday}
          >
            <i className="fas fa-undo me-1"></i> Hoy
          </button>
        </div>
        <div className="actions">
          {/* Aquí podrían ir otros controles como el de pantalla completa si lo necesitas */}
        </div>
      </div>
       {!isToday && (
        <div className="time-travel-banner">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Estás viendo el expediente a fecha de <strong>{moment(systemDate).format('DD MMMM YYYY')}</strong>. Los cálculos reflejan esta fecha.
        </div>
      )}
    </div>
  );
};