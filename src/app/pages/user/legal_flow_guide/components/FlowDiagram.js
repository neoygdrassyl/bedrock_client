import { useMemo } from 'react';
import MermaidDiagram from '../../../../components/MermaidDiagram.component';
import { generateLegalFlowMermaid } from '../utils/mermaidFlowGenerator';

function FlowDiagram({ filters }) {
  const mermaidString = useMemo(() => {
    return generateLegalFlowMermaid({
      projectType: filters.projectType,
      notificationMode: filters.notificationMode,
      notificationType: filters.notificationType,
      cumpleActa: filters.cumpleActa,
      showDesistimientos: filters.desistimientos,
      showSuspension: filters.showSuspension,
      showExtension: filters.showExtension,
      showProrroga: filters.showProrroga,
      showRecurso: filters.showRecurso,
    });
  }, [filters]);

  return (
    <div className="border rounded bg-white p-2" style={{ minHeight: 400 }}>
      {mermaidString ? (
        <MermaidDiagram chart={mermaidString} />
      ) : (
        <p className="text-muted text-center mt-5">No se pudo generar el diagrama.</p>
      )}
    </div>
  );
}

export default FlowDiagram;
