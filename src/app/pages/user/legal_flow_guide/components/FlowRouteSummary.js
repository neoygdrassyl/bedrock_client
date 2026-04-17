import { useMemo } from 'react';
import {
  PROCESS_DEFINITION,
  calculateRouteDays,
  getPoolDays,
  getPhaseDays,
} from '../utils/legalProcessDefinition';

const RESPONSIBLE_LABELS = {
  solicitante: 'Solicitante',
  curaduria: 'Curaduría',
  paralelo: 'Paralelo',
};

const RESPONSIBLE_COLORS = {
  solicitante: 'text-primary',
  curaduria: 'text-success',
  paralelo: 'text-warning',
};

function FlowRouteSummary({ filters }) {
  const summary = useMemo(() => {
    const options = {
      projectType: filters.projectType,
      notificationMode: filters.notificationMode,
      notificationType: filters.notificationType,
      withProrroga: filters.showProrroga,
    };

    // Determine visible phases based on filters
    const visible = PROCESS_DEFINITION.phases
      .filter((p) => {
        if (!p.skipConditions) return true;
        if (p.skipConditions.includes('cumple_acta') && filters.cumpleActa) return false;
        if (p.skipConditions.includes('modo_comunicar') && filters.notificationMode === 'comunicar')
          return false;
        if (
          p.skipConditions.includes('modo_comunicar_viabilidad') &&
          filters.notificationMode === 'comunicar'
        )
          return false;
        return true;
      })
      .map((p) => p.id);

    const totalDays = calculateRouteDays(visible, options);
    const poolTotal = getPoolDays(filters.projectType);

    // Days per actor
    const byActor = {};
    for (const pid of visible) {
      const phase = PROCESS_DEFINITION.phases.find((p) => p.id === pid);
      if (!phase) continue;
      const days = getPhaseDays(pid, options) ?? 0;
      const actor = phase.responsible;
      byActor[actor] = (byActor[actor] || 0) + days;
    }

    // Active desistimientos
    const activeDesist = Object.entries(filters.desistimientos)
      .filter(([, v]) => v)
      .map(([k]) => k);

    return { totalDays, poolTotal, byActor, activeDesist };
  }, [filters]);

  return (
    <div className="card card-body">
      <h6 className="fw-semibold mb-2">Resumen de Ruta</h6>

      <div className="mb-2">
        <span className="text-muted">Happy Path:</span>{' '}
        <strong>{summary.totalDays} días hábiles</strong>
      </div>

      <table className="table table-sm table-borderless mb-2">
        <tbody>
          {Object.entries(summary.byActor).map(([actor, days]) => (
            <tr key={actor}>
              <td className={RESPONSIBLE_COLORS[actor] || ''}>
                {RESPONSIBLE_LABELS[actor] || actor}
              </td>
              <td className="text-end">{days}d</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-2">
        <span className="text-muted">Pool compartido EST + VIA:</span>{' '}
        <strong>{summary.poolTotal}d</strong>
      </div>

      {summary.activeDesist.length > 0 && (
        <div className="border-top pt-2 mt-1">
          <small className="text-muted d-block mb-1">
            Desistimientos activos: {summary.activeDesist.join(', ')}
          </small>
          <small className="text-danger">
            Subflujo desistimiento base: 5 + 15 + 10 = 30d adicionales
          </small>
        </div>
      )}
    </div>
  );
}

export default FlowRouteSummary;
