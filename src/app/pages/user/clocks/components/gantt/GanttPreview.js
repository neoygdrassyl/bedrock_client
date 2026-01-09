import React from 'react';
import { GanttChart } from './GanttChart';

export const GanttPreview = ({
  phases,
  ldfDate,
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
        ldfDate={ldfDate}
        suspensionPreActa={suspensionPreActa}
        suspensionPostActa={suspensionPostActa}
        extension={extension}
        compactMode={true}
        activePhaseId={activePhaseId}
        onPhaseClick={onPhaseClick}
      />
    </div>
  );
};