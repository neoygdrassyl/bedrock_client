import { useMemo } from 'react';
import MermaidDiagram from '../../../../components/MermaidDiagram.component';
import { generateLegalFlowMermaid } from '../utils/mermaidFlowGenerator';

const LEGEND = [
  { label: 'Curaduria', cls: 'lf-legend-swatch--curaduria' },
  { label: 'Solicitante', cls: 'lf-legend-swatch--solicitante' },
  { label: 'Paralelo', cls: 'lf-legend-swatch--paralelo' },
  { label: 'Desistimiento', cls: 'lf-legend-swatch--desistimiento' },
  { label: 'Modificador', cls: 'lf-legend-swatch--modifier' },
];

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
    <div className="lf-diagram">
      {/* Custom header with legend */}
      <div className="lf-diagram__header">
        <span className="lf-diagram__title">
          <i className="fas fa-project-diagram"></i>
          Diagrama de Proceso
        </span>
        <div className="lf-diagram__legend">
          {LEGEND.map((item) => (
            <span key={item.label} className="lf-legend-item">
              <span className={`lf-legend-swatch ${item.cls}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Diagram content */}
      <div className="lf-diagram__body">
        {mermaidString ? (
          <MermaidDiagram chart={mermaidString} />
        ) : (
          <p style={{ color: 'var(--lf-text-muted)', textAlign: 'center', marginTop: '4rem' }}>
            No se pudo generar el diagrama.
          </p>
        )}
      </div>
    </div>
  );
}

export default FlowDiagram;
