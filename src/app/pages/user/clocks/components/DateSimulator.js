import React, { useState } from 'react';
import moment from 'moment';
import { DiasHabilesColombia } from '../../../../utils/BusinessDaysCol.js';

const businessDaysCalculator = new DiasHabilesColombia();

export const DateSimulator = ({ onDateChange }) => {
  const [simulatedDate, setSimulatedDate] = useState(moment().format('YYYY-MM-DD'));
  const [isSimulating, setIsSimulating] = useState(false);

  const handleDateChange = (newDate) => {
    setSimulatedDate(newDate);
    if (isSimulating) {
      onDateChange(moment(newDate));
    }
  };

  const toggleSimulation = () => {
    const newState = !isSimulating;
    setIsSimulating(newState);

    if (newState) {
      onDateChange(moment(simulatedDate));
    } else {
      onDateChange(moment()); // Reset a fecha actual
    }
  };

  const addBusinessDays = (days) => {
    const currentDate = moment(simulatedDate);
    const newDate = businessDaysCalculator.addBusinessDays(currentDate, days);
    setSimulatedDate(newDate.format('YYYY-MM-DD'));
    if (isSimulating) {
      onDateChange(newDate);
    }
  };

  return (
    <div className="date-simulator-container">
      <div className="date-simulator-header">
        <h5>
          <i className="fas fa-calendar-alt" />
          Simulador de Fecha del Sistema
        </h5>
        <button 
          onClick={toggleSimulation}
          className={`btn btn-sm ${isSimulating ? 'btn-success' : 'btn-secondary'}`}
        >
          <i className={`fas ${isSimulating ? 'fa-pause' : 'fa-play'}`} />
          {isSimulating ? 'Simulación Activa' : 'Activar Simulación'}
        </button>
      </div>

      <div className="date-simulator-body">
        <div className="row">
          <div className="col-md-6">
            <label>Fecha Simulada:</label>
            <input 
              type="date" 
              className="form-control"
              value={simulatedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              disabled={!isSimulating}
            />
          </div>
          <div className="col-md-6">
            <label>Acciones Rápidas:</label>
            <div className="btn-group" role="group">
              <button 
                onClick={() => handleDateChange(moment().format('YYYY-MM-DD'))}
                className="btn btn-sm btn-info"
                disabled={!isSimulating}
              >
                Hoy
              </button>
              <button 
                onClick={() => addBusinessDays(-5)}
                className="btn btn-sm btn-warning"
                disabled={!isSimulating}
              >
                -5 días
              </button>
              <button 
                onClick={() => addBusinessDays(5)}
                className="btn btn-sm btn-warning"
                disabled={!isSimulating}
              >
                +5 días
              </button>
              <button 
                onClick={() => addBusinessDays(30)}
                className="btn btn-sm btn-primary"
                disabled={!isSimulating}
              >
                +30 días
              </button>
            </div>
          </div>
        </div>

        {isSimulating && (
          <div className="alert alert-info mt-3">
            <i className="fas fa-info-circle" />
            <strong>Modo Simulación Activo</strong>
            <p>
              Los cálculos de días disponibles, días consumidos y fechas límite 
              se calculan como si hoy fuera: <strong>{moment(simulatedDate).format('DD/MM/YYYY')}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
