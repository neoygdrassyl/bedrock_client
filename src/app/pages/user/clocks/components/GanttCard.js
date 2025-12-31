import React, { useState } from 'react';
import { GanttDiagram } from './GanttDiagram';

/**
 * Componente de tarjeta compacta del Gantt para el sidebar
 * Muestra una previsualización del diagrama con opción de expandir
 */
export const GanttCard = ({ manager, onExpandClick }) => {
  const [mode, setMode] = useState('legal');

  if (!manager?.processPhases || manager.processPhases.length === 0) {
    return (
      <div className="sidebar-card gantt-card">
        <div className="sidebar-card-header">
          <i className="fas fa-chart-gantt" />
          <span>Diagrama de Gantt</span>
        </div>
        <div className="sidebar-card-body">
          <div className="text-center text-muted py-3">
            <i className="fas fa-spinner fa-spin me-2" />
            Calculando fases...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-card gantt-card">
      <div className="sidebar-card-header d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-chart-gantt me-2" />
          <span>Diagrama de Gantt</span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary border-0"
          onClick={onExpandClick}
          title="Ver en pantalla completa"
        >
          <i className="fas fa-expand-alt" />
        </button>
      </div>

      <div className="sidebar-card-body gantt-card-body">
        {/* Vista compacta del Gantt */}
        <GanttDiagram manager={manager} mode={mode} compact={true} onModeChange={setMode} />

        {/* Toggle de modo en versión compacta */}
        <div className="gantt-compact-toggle">
          <button
            type="button"
            className={`gantt-mode-btn ${mode === 'legal' ? 'active' : ''}`}
            onClick={() => setMode('legal')}
            title="Límites legales"
          >
            <i className="fas fa-gavel" />
          </button>
          <button
            type="button"
            className={`gantt-mode-btn ${mode === 'event' ? 'active' : ''}`}
            onClick={() => setMode('event')}
            title="Fechas de evento"
          >
            <i className="fas fa-calendar-check" />
          </button>
        </div>
      </div>

      <div className="sidebar-card-footer">
        <button
          type="button"
          className="btn-footer-action"
          onClick={onExpandClick}
        >
          <i className="fas fa-arrows-alt" />
          <span>Pantalla completa</span>
        </button>
      </div>
    </div>
  );
};
