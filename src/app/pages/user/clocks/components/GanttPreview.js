import React from 'react';
import { GanttChart } from './GanttChart';

/**
 * GanttPreview - Vista previa compacta del diagrama de Gantt para el sidebar (Regla 15)
 */
export const GanttPreview = ({ 
  phases, 
  ldfDate,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  onExpand 
}) => {
  return (
    <div className="gantt-preview-container">
      <div className="gantt-preview-header">
        <h5>
          <i className="fas fa-chart-gantt" />
          Diagrama de Gantt
        </h5>
        <button 
          className="gantt-expand-btn"
          onClick={onExpand}
          title="Ver diagrama completo"
        >
          <i className="fas fa-expand-alt" />
        </button>
      </div>
      <div className="gantt-preview-body">
        <GanttChart
          phases={phases}
          ldfDate={ldfDate}
          suspensionPreActa={suspensionPreActa}
          suspensionPostActa={suspensionPostActa}
          extension={extension}
          compactMode={true}
          adjustedWidthMode={false}
          onPhaseClick={onExpand}
        />
      </div>
    </div>
  );
};
