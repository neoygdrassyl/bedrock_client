import React from 'react';
import { GanttChart } from './GanttChart';

export const GanttPreview = ({
  phases,
  ldfDate,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  // onExpand ya no es necesario aquí
  activePhaseId
}) => {
  return (
    // ✅ Se elimina el div de 'gantt-preview-container' y su header.
    // Ahora el componente solo renderiza el gráfico directamente.
    <GanttChart
      phases={phases}
      ldfDate={ldfDate}
      suspensionPreActa={suspensionPreActa}
      suspensionPostActa={suspensionPostActa}
      extension={extension}
      compactMode={true}
      activePhaseId={activePhaseId}
    />
  );
};