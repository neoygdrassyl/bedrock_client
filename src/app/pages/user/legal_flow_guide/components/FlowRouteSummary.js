import { useMemo } from 'react';
import { Icon } from '@/components/icon';
import {
  PROCESS_DEFINITION,
  calculateRouteDays,
  getPoolDays,
  getPhaseDays,
} from '../utils/legalProcessDefinition';

const ACTOR_META = {
  curaduria: { label: 'Curaduria', dotClass: 'lf-actor-dot--curaduria', barClass: 'lf-actor-bar__fill--curaduria' },
  solicitante: { label: 'Solicitante', dotClass: 'lf-actor-dot--solicitante', barClass: 'lf-actor-bar__fill--solicitante' },
  paralelo: { label: 'Paralelo', dotClass: 'lf-actor-dot--paralelo', barClass: 'lf-actor-bar__fill--paralelo' },
};

function FlowRouteSummary({ filters }) {
  const summary = useMemo(() => {
    const options = {
      projectType: filters.projectType,
      notificationMode: filters.notificationMode,
      notificationType: filters.notificationType,
      withProrroga: filters.showProrroga,
    };

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

    const byActor = {};
    for (const pid of visible) {
      const phase = PROCESS_DEFINITION.phases.find((p) => p.id === pid);
      if (!phase) continue;
      const days = getPhaseDays(pid, options) ?? 0;
      const actor = phase.responsible;
      byActor[actor] = (byActor[actor] || 0) + days;
    }

    const activeDesist = Object.entries(filters.desistimientos)
      .filter(([, v]) => v)
      .map(([k]) => k);

    return { totalDays, poolTotal, byActor, activeDesist };
  }, [filters]);

  const maxActorDays = Math.max(...Object.values(summary.byActor), 1);

  return (
    <div className="lf-card">
      <div className="lf-card__body">
        <div className="lf-section-title">
          <Icon name="chart-bar" size={16} />
          Resumen de Ruta
        </div>

        {/* Total days - hero stat */}
        <div className="lf-summary__stat">
          <span className="lf-summary__stat-value">{summary.totalDays}</span>
          <span className="lf-summary__stat-label">dias habiles (happy path)</span>
        </div>

        {/* Days per actor with bars */}
        <div className="lf-summary__actors">
          {Object.entries(summary.byActor).map(([actor, days]) => {
            const meta = ACTOR_META[actor] || { label: actor, dotClass: '', barClass: '' };
            const pct = Math.round((days / maxActorDays) * 100);
            return (
              <div key={actor}>
                <div className="lf-actor-row">
                  <span className={`lf-actor-dot ${meta.dotClass}`} />
                  <span className="lf-actor-name">{meta.label}</span>
                  <span className="lf-actor-days">{days}d</span>
                </div>
                <div className="lf-actor-bar" style={{ marginLeft: '1.35rem', marginTop: '0.2rem' }}>
                  <div
                    className={`lf-actor-bar__fill ${meta.barClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pool badge */}
        <div className="lf-pool-badge">
          <Icon name="link" size={16} style={{ fontSize: '0.65rem' }} />
          Pool EST + VIA: {summary.poolTotal}d (Tipo {filters.projectType})
        </div>

        {/* Desistimientos info */}
        {summary.activeDesist.length > 0 && (
          <div className="lf-desist-info">
            <strong>Desistimientos activos:</strong> {summary.activeDesist.join(', ')}
            <br />
            Subflujo base: 5 + 15 + 10 = 30d adicionales
          </div>
        )}
      </div>
    </div>
  );
}

export default FlowRouteSummary;
