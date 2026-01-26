import React from 'react';
import { GanttChart } from './GanttChart';

export const GanttPreview = ({
  phases,
  radDate,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  activePhaseId,
  onPhaseClick
}) => {
  return (
    <div className="gantt-preview-body">
      <GanttChart
        phases={phases}
        radDate={radDate}
        suspensionPreActa={suspensionPreActa}
        suspensionPostActa={suspensionPostActa}
        extension={extension}
        compactMode={true}
        disableTooltips={true}
        activePhaseId={activePhaseId}
        onPhaseClick={onPhaseClick}
      />
    </div>
  );
};