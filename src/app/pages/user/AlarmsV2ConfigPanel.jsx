import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BellRing, ChevronDown, RefreshCcw, Save, Shield, UserRound, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { useAlarmConfigV2 } from './fun_forms/hooks/useAlarmConfigV2';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AlarmService from '../../services/alarm.service';

/**
 * Panel de configuración del sistema de alarmas v2.
 *
 * Modela por fase y actor N reglas (niveles) con thresholds en percent o dias,
 * acción configurable, mensaje, enabled y visibleTo. Incluye botón para
 * refrescar alarmas inmediatamente.
 *
 * Nota: el acordeón se controla con estado de React (no Bootstrap JS) para
 * evitar que se cierre automáticamente al re-renderizar por edición de inputs.
 *
 * Fuente canónica del shape: backend/app/services/alarm-engine.js
 */

const DEFAULT_PHASE_CODES = [
  { code: 'RAD', label: 'Radicación' },
  { code: 'EST', label: 'Estudio' },
  { code: 'NOT_OBS', label: 'Notificación de Observaciones' },
  { code: 'CORR', label: 'Correcciones (Solicitante)' },
  { code: 'VIA', label: 'Viabilidad' },
  { code: 'NOT_VIA', label: 'Notificación Viabilidad' },
  { code: 'PAG', label: 'Pago Expensas' },
  { code: 'RES', label: 'Resolución / Acto Admin.' },
  { code: 'NOT_RES', label: 'Notificación Resolución' },
  { code: 'EJEC', label: 'Ejecutoria / Expedición' },
  { code: 'ENT', label: 'Entrega' },
  { code: 'VALLA', label: 'Valla (Solicitante)' },
  { code: 'COM_VEC', label: 'Comunicación a Vecinos' },
];

const ACTORS = [
  { code: 'CUR', label: 'Curaduría', dotClass: '' },
  { code: 'SOL', label: 'Solicitante', dotClass: 'sol' },
];

const ACTIONS = [
  { code: 'show_alarm', label: 'Mostrar alarma', available: true },
  { code: 'send_email', label: 'Enviar correo', available: false },
  { code: 'start_suspension_prorroga', label: 'Iniciar suspensión/prórroga', available: false },
];

const LEVELS = [
  { n: 1, label: 'Preventiva' },
  { n: 2, label: 'Crítica' },
  { n: 3, label: 'Vencido' },
];

function emptyRule(level, actor) {
  return {
    level,
    actor,
    action: 'show_alarm',
    enabled: true,
    thresholds: { startPct: '', endPct: '' },
    message: '',
    visibleTo: null,
  };
}

function getPhaseRules(config, phaseCode) {
  return config?.phases?.[phaseCode]?.alarms || [];
}

function findRule(rules, level, actor) {
  return rules.find((r) => r.level === level && r.actor === actor) || null;
}

function countEnabled(rules) {
  return rules.filter((r) => r.enabled !== false).length;
}

function countEnabledForActor(rules, actor) {
  return rules.filter((r) => r.actor === actor && r.enabled !== false).length;
}

// ─── Stats helpers ─────────────────────────────────────────────────────────────

function computeAlarmStats(list) {
  const byPhase = {};
  const byLevel = { 1: 0, 2: 0, 3: 0 };
  const byActor = { CUR: 0, SOL: 0 };

  for (const alarm of list) {
    const phase = alarm.phaseCode || alarm.phase_code || 'OTHER';
    const level = Number(alarm.level) || 1;
    const actor = alarm.actor || 'CUR';

    if (!byPhase[phase]) {
      byPhase[phase] = { CUR: { 1: 0, 2: 0, 3: 0 }, SOL: { 1: 0, 2: 0, 3: 0 }, total: 0 };
    }
    if (byPhase[phase][actor]) byPhase[phase][actor][level] = (byPhase[phase][actor][level] || 0) + 1;
    byPhase[phase].total += 1;
    if (byLevel[level] != null) byLevel[level] += 1;
    if (byActor[actor] != null) byActor[actor] += 1;
  }

  return { total: list.length, byPhase, byLevel, byActor, list };
}

// ─── Main panel ────────────────────────────────────────────────────────────────

export default function AlarmsV2ConfigPanel() {
  const { config, loading, saving, error, save, refreshAlarms, refetch } = useAlarmConfigV2();
  const [draft, setDraft] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openPhase, setOpenPhase] = useState(null);

  // Refresh state tracking
  const [refreshState, setRefreshState] = useState('idle'); // 'idle' | 'refreshing' | 'done'
  const [refreshCompletedAt, setRefreshCompletedAt] = useState(null);

  // Alarm visualization
  const [alarmStats, setAlarmStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [statsActor, setStatsActor] = useState('CUR');

  useEffect(() => {
    if (config) {
      setDraft(JSON.parse(JSON.stringify(config)));
      setDirty(false);
      setOpenPhase((prev) => prev || DEFAULT_PHASE_CODES[0]?.code || null);
    }
  }, [config]);

  const phaseList = DEFAULT_PHASE_CODES;

  const fetchAlarmStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const resp = await AlarmService.list({
        limit: 5000,
        includeAttended: true,
        includeHidden: true,
        includeArchived: false,
      });
      const list = Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? []);
      const nextStats = computeAlarmStats(list);
      setAlarmStats(nextStats);
      return nextStats;
    } catch (err) {
      setStatsError(err?.response?.data?.message || err?.message || 'No fue posible cargar las alarmas generadas.');
      return null;
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const pollAlarmStatsAfterRefresh = useCallback(async () => {
    let latestStats = null;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 2500 : 1500));
      latestStats = await fetchAlarmStats();
      if (latestStats?.total > 0) break;
    }
    return latestStats;
  }, [fetchAlarmStats]);

  // Abrir visualización → cargar datos si no hay
  const handleToggleVisualization = useCallback(async () => {
    if (!showVisualization && !alarmStats) {
      await fetchAlarmStats();
    }
    setShowVisualization((v) => !v);
  }, [showVisualization, alarmStats, fetchAlarmStats]);

  const setRule = (phaseCode, level, actor, patch) => {
    setDraft((prev) => {
      const next = { ...prev, phases: { ...(prev.phases || {}) } };
      const phase = { ...(next.phases[phaseCode] || { alarms: [] }) };
      const alarms = Array.isArray(phase.alarms) ? [...phase.alarms] : [];
      const idx = alarms.findIndex((r) => r.level === level && r.actor === actor);
      if (idx >= 0) {
        alarms[idx] = { ...alarms[idx], ...patch, level, actor };
      } else {
        alarms.push({ ...emptyRule(level, actor), ...patch });
      }
      phase.alarms = alarms;
      next.phases[phaseCode] = phase;
      return next;
    });
    setDirty(true);
  };

  const setThreshold = (phaseCode, level, actor, field, value) => {
    setDraft((prev) => {
      const next = { ...prev, phases: { ...(prev.phases || {}) } };
      const phase = { ...(next.phases[phaseCode] || { alarms: [] }) };
      const alarms = Array.isArray(phase.alarms) ? [...phase.alarms] : [];
      const idx = alarms.findIndex((r) => r.level === level && r.actor === actor);
      const base = idx >= 0 ? { ...alarms[idx] } : emptyRule(level, actor);
      base.thresholds = { ...(base.thresholds || {}) };
      base.thresholds[field] = value === '' ? '' : Number(value);
      if (idx >= 0) alarms[idx] = base;
      else alarms.push(base);
      phase.alarms = alarms;
      next.phases[phaseCode] = phase;
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      setAlert(null);
      const payload = {
        version: 2,
        ...draft,
        scatterThresholds: draft?.scatterThresholds || { warning: 80, critical: 95, overdue: 100 },
      };
      await save(payload);
      setAlert({
        type: 'success',
        text: 'Configuración guardada. Recalcular las alarmas aplicará los cambios.',
      });
      setDirty(false);
      setTimeout(() => setAlert(null), 4000);
    } catch (err) {
      setAlert({ type: 'danger', text: `Error al guardar: ${err?.message || 'Desconocido'}` });
    }
  };

  const handleRefreshAlarms = async () => {
    try {
      setAlert(null);
      setRefreshState('refreshing');
      await refreshAlarms();
      await pollAlarmStatsAfterRefresh();
      setRefreshState('done');
      setRefreshCompletedAt(new Date());
      setShowVisualization(true);
    } catch (err) {
      setRefreshState('idle');
      setAlert({ type: 'danger', text: `Error al refrescar: ${err?.message || 'Desconocido'}` });
    }
  };

  const togglePhase = (code) => {
    setOpenPhase((prev) => (prev === code ? null : code));
  };

  const baseCategory = useMemo(() => draft?.baseCategory || 'IV', [draft]);

  if (loading && !draft) {
    return (
      <div className="settings-panel__header" data-testid="alarms-v2-panel">
        <h2>Alarmas</h2>
        <p>Cargando configuración…</p>
      </div>
    );
  }
  if (error && !draft) {
    return (
      <div className="alarms-panel__alert danger" data-testid="alarms-v2-panel">
        <span>Error cargando configuración: {error?.message || 'Desconocido'}</span>
        <button type="button" onClick={refetch} aria-label="Reintentar">↻</button>
      </div>
    );
  }

  return (
    <div data-testid="alarms-v2-panel">
      <div className="settings-panel__header">
        <h2>Alarmas</h2>
        <p>
          Configuración global por fase con tres alarmas obligatorias por actor. La vista inicia en Curaduría y cada alarma lista sus acciones disponibles.
        </p>
      </div>

      <div className="alarms-panel__meta">
        <Badge variant="secondary">3 alarmas por actor</Badge>
        <Badge variant="outline">Vista inicial: Curaduría</Badge>
        <Badge variant="outline">Acción inicial: Mostrar alarma</Badge>
      </div>

      <div className="alarms-panel__notice">
        <strong>Impacto global:</strong> al guardar, las alarmas existentes se marcan como obsoletas
        y el próximo ciclo (o “Recalcular ahora”) las regenera desde cero.
      </div>

      {alert && (
        <div className={`alarms-panel__alert ${alert.type}`}>
          <span>{alert.text}</span>
          <button type="button" onClick={() => setAlert(null)} aria-label="Cerrar">×</button>
        </div>
      )}

      <div className="alarms-panel__toolbar">
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!dirty || saving}
          data-testid="alarms-v2-save"
        >
          <Save size={14} />
          {saving ? 'Guardando…' : 'Guardar configuración'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleRefreshAlarms}
          disabled={refreshState === 'refreshing'}
          data-testid="alarms-v2-refresh"
        >
          {refreshState === 'refreshing' ? (
            <Loader2 size={14} className="alarms-panel__spinner" />
          ) : refreshState === 'done' ? (
            <CheckCircle2 size={14} style={{ color: 'hsl(142 71% 35%)' }} />
          ) : (
            <RefreshCcw size={14} />
          )}
          {refreshState === 'refreshing' ? 'Recalculando…' : 'Recalcular ahora'}
        </Button>
        {refreshState === 'done' && refreshCompletedAt && (
          <span className="alarms-panel__refresh-done">
            Completado a las {refreshCompletedAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            {alarmStats && ` · ${alarmStats.total} alarma${alarmStats.total !== 1 ? 's' : ''} activa${alarmStats.total !== 1 ? 's' : ''}`}
          </span>
        )}
        <span className="spacer" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleToggleVisualization}
          title={showVisualization ? 'Ocultar alarmas generadas' : 'Ver alarmas generadas'}
        >
          {showVisualization ? <EyeOff size={14} /> : <Eye size={14} />}
          {showVisualization ? 'Ocultar alarmas' : 'Ver alarmas'}
        </Button>
        <span className="hint">
          Base por defecto: categoría <strong>{baseCategory}</strong> (45 días curaduría).
        </span>
      </div>

      {showVisualization && (
        <AlarmVisualization
          stats={alarmStats}
          loading={statsLoading}
          error={statsError}
          actor={statsActor}
          onActorChange={setStatsActor}
          onRefresh={fetchAlarmStats}
        />
      )}

      <div className="alarms-panel__phases">
        {phaseList.map((phase) => {
          const rules = getPhaseRules(draft, phase.code);
          const isOpen = openPhase === phase.code;
          return (
            <PhaseCard
              key={phase.code}
              phase={phase}
              rules={rules}
              isOpen={isOpen}
              onToggle={() => togglePhase(phase.code)}
              onRuleChange={(level, actor, patch) => setRule(phase.code, level, actor, patch)}
              onThresholdChange={(level, actor, field, value) =>
                setThreshold(phase.code, level, actor, field, value)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Alarm Visualization Panel ─────────────────────────────────────────────────

const LEVEL_META = {
  1: { label: 'Preventiva', className: 'lvl-1' },
  2: { label: 'Crítica',    className: 'lvl-2' },
  3: { label: 'Vencido',    className: 'lvl-3' },
};

function AlarmVisualization({ stats, loading, error, actor, onActorChange, onRefresh }) {
  if (loading) {
    return (
      <div className="alarm-viz">
        <div className="alarm-viz__loading">
          <Loader2 size={20} className="alarms-panel__spinner" />
          <span>Cargando alarmas…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alarm-viz">
        <div className="alarm-viz__empty alarm-viz__empty--error">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCcw size={13} /> Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="alarm-viz">
        <div className="alarm-viz__empty">
          <span>No se han cargado datos de alarmas aún.</span>
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCcw size={13} /> Cargar
          </Button>
        </div>
      </div>
    );
  }

  const { total, byPhase, byLevel, byActor } = stats;

  if (total === 0) {
    return (
      <div className="alarm-viz">
        <div className="alarm-viz__header">
          <div className="alarm-viz__title">
            <BellRing size={16} />
            <strong>Alarmas generadas</strong>
            <span className="alarm-viz__total-badge">0</span>
          </div>
          <button type="button" className="alarm-viz__refresh-btn" onClick={onRefresh} title="Actualizar datos">
            <RefreshCcw size={13} />
          </button>
        </div>
        <div className="alarm-viz__empty">
          <span>No hay alarmas activas generadas para visualizar. Si acaba de recalcular, revise que el backend haya terminado sin errores.</span>
        </div>
      </div>
    );
  }

  // Qué actor mostrar (CUR, SOL o ambos)
  const actors = actor === 'ALL' ? ['CUR', 'SOL'] : [actor];
  const visibleTotal = actors.reduce((sum, currentActor) => sum + (byActor[currentActor] ?? 0), 0);
  const visibleByLevel = [1, 2, 3].reduce((accumulator, level) => {
    accumulator[level] = Object.values(byPhase).reduce((sum, phaseData) => {
      return sum + actors.reduce((actorSum, currentActor) => actorSum + (phaseData[currentActor]?.[level] || 0), 0);
    }, 0);
    return accumulator;
  }, {});

  // Ordenar fases según DEFAULT_PHASE_CODES; incluir las que estén en stats pero no en la lista
  const orderedPhases = [
    ...DEFAULT_PHASE_CODES.filter((p) => byPhase[p.code]),
    ...Object.keys(byPhase)
      .filter((code) => !DEFAULT_PHASE_CODES.some((p) => p.code === code))
      .map((code) => ({ code, label: code })),
  ];

  return (
    <div className="alarm-viz">
      <div className="alarm-viz__header">
        <div className="alarm-viz__title">
          <BellRing size={16} />
          <strong>Alarmas generadas</strong>
          <span className="alarm-viz__total-badge">{visibleTotal}</span>
        </div>
        <div className="alarm-viz__controls">
          <div className="alarm-viz__actor-pills">
            {[['CUR', 'Curaduría'], ['SOL', 'Solicitante'], ['ALL', 'Todas']].map(([code, label]) => (
              <button
                key={code}
                type="button"
                className={`alarm-viz__pill${actor === code ? ' is-active' : ''}`}
                onClick={() => onActorChange(code)}
              >
                {label}
                {code !== 'ALL' && (
                  <span className="alarm-viz__pill-count">{byActor[code] ?? 0}</span>
                )}
              </button>
            ))}
          </div>
          <button type="button" className="alarm-viz__refresh-btn" onClick={onRefresh} title="Actualizar datos">
            <RefreshCcw size={13} />
          </button>
        </div>
      </div>

      <div className="alarm-viz__summary-row">
        {[1, 2, 3].map((lvl) => (
          <div key={lvl} className={`alarm-viz__summary-chip ${LEVEL_META[lvl].className}`}>
            <span className="alarm-viz__summary-chip-label">{LEVEL_META[lvl].label}</span>
            <span className="alarm-viz__summary-chip-count">{visibleByLevel[lvl] ?? byLevel[lvl] ?? 0}</span>
          </div>
        ))}
      </div>

      <div className="alarm-viz__table-wrap">
        <table className="alarm-viz__table">
          <thead>
            <tr>
              <th className="alarm-viz__th alarm-viz__th--phase">Fase</th>
              {actors.length > 1 ? (
                <>
                  <th className="alarm-viz__th" colSpan={3}>Curaduría</th>
                  <th className="alarm-viz__th" colSpan={3}>Solicitante</th>
                </>
              ) : (
                <>
                  <th className={`alarm-viz__th lvl-1`}>Preventiva</th>
                  <th className={`alarm-viz__th lvl-2`}>Crítica</th>
                  <th className={`alarm-viz__th lvl-3`}>Vencido</th>
                </>
              )}
              <th className="alarm-viz__th alarm-viz__th--total">Total</th>
            </tr>
            {actors.length > 1 && (
              <tr>
                <th />
                <th className="alarm-viz__th lvl-1">P</th>
                <th className="alarm-viz__th lvl-2">C</th>
                <th className="alarm-viz__th lvl-3">V</th>
                <th className="alarm-viz__th lvl-1">P</th>
                <th className="alarm-viz__th lvl-2">C</th>
                <th className="alarm-viz__th lvl-3">V</th>
                <th />
              </tr>
            )}
          </thead>
          <tbody>
            {orderedPhases.map(({ code, label }) => {
              const phaseData = byPhase[code] || {};
              const phaseTotal = actors.reduce(
                (sum, a) => sum + [1, 2, 3].reduce((s, l) => s + (phaseData[a]?.[l] || 0), 0),
                0,
              );
              return (
                <tr key={code} className="alarm-viz__row">
                  <td className="alarm-viz__td alarm-viz__td--phase">
                    <span className="alarm-viz__phase-code">{code}</span>
                    <span className="alarm-viz__phase-label">{label}</span>
                  </td>
                  {actors.flatMap((a) =>
                    [1, 2, 3].map((lvl) => {
                      const count = phaseData[a]?.[lvl] || 0;
                      return (
                        <td key={`${a}-${lvl}`} className={`alarm-viz__td alarm-viz__td--count${count > 0 ? ` lvl-${lvl}` : ' zero'}`}>
                          {count > 0 ? count : <span className="alarm-viz__zero">—</span>}
                        </td>
                      );
                    }),
                  )}
                  <td className={`alarm-viz__td alarm-viz__td--total${phaseTotal > 0 ? ' has-alarms' : ''}`}>
                    {phaseTotal || <span className="alarm-viz__zero">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="alarm-viz__foot">
              <td className="alarm-viz__td alarm-viz__td--phase"><strong>Total</strong></td>
              {actors.flatMap((a) =>
                [1, 2, 3].map((lvl) => {
                  const t = orderedPhases.reduce((s, { code }) => s + (byPhase[code]?.[a]?.[lvl] || 0), 0);
                  return (
                    <td key={`foot-${a}-${lvl}`} className={`alarm-viz__td alarm-viz__td--count${t > 0 ? ` lvl-${lvl}` : ' zero'}`}>
                      {t > 0 ? <strong>{t}</strong> : <span className="alarm-viz__zero">—</span>}
                    </td>
                  );
                }),
              )}
              <td className="alarm-viz__td alarm-viz__td--total has-alarms">
                <strong>{visibleTotal}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="alarm-viz__note">
        P = Preventiva · C = Crítica · V = Vencido · Solo alarmas activas (no archivadas)
      </p>
    </div>
  );
}

function PhaseCard({ phase, rules, isOpen, onToggle, onRuleChange, onThresholdChange }) {
  const [selectedActor, setSelectedActor] = useState('CUR');
  const bodyId = `phase-body-${phase.code}`;
  const enabledCount = countEnabled(rules);
  const selectedActorEnabledCount = countEnabledForActor(rules, selectedActor);
  return (
    <div className={`phase-card${isOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className="phase-card__header"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={bodyId}
      >
        <span className="phase-card__code">{phase.code}</span>
        <span className="phase-card__label">{phase.label}</span>
        {enabledCount > 0 && (
          <span className="phase-card__count">{selectedActorEnabledCount}/3 activas</span>
        )}
        <ChevronDown size={18} className="phase-card__chevron" />
      </button>
      {isOpen && (
        <div id={bodyId} className="phase-card__body">
          <div className="phase-card__controls">
            <div className="phase-card__actor-toggle" role="tablist" aria-label={`Actor en ${phase.code}`}>
              {ACTORS.map((actor) => {
                const isActive = selectedActor === actor.code;
                const Icon = actor.code === 'CUR' ? Shield : UserRound;
                return (
                  <Button
                    key={actor.code}
                    type="button"
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                    className="phase-card__actor-button"
                    onClick={() => setSelectedActor(actor.code)}
                  >
                    <Icon size={14} />
                    {actor.label}
                  </Button>
                );
              })}
            </div>

            <div className="phase-card__summary">
              <span>3 alarmas estructurales</span>
              <span>Actor visible: {selectedActor === 'CUR' ? 'Curaduría' : 'Solicitante'}</span>
              <span>Acción inicial: Mostrar alarma</span>
            </div>
          </div>

          <div className="actor-block">
            <div className="actor-block__title">
              <span className={`actor-dot ${selectedActor === 'SOL' ? 'sol' : ''}`} />
              {selectedActor === 'CUR' ? 'Curaduría' : 'Solicitante'} <span style={{ opacity: 0.6 }}>({selectedActor})</span>
            </div>

            <div className="alarm-rules">
              {LEVELS.map(({ n: level, label: levelLabel }) => {
                const rule = findRule(rules, level, selectedActor) || emptyRule(level, selectedActor);
                const mode =
                  rule.thresholds?.startPct != null || rule.thresholds?.endPct != null
                    ? 'percent'
                    : 'days';
                const startField = mode === 'percent' ? 'startPct' : 'startDays';
                const endField = mode === 'percent' ? 'endPct' : 'endDays';
                const unitSuffix = mode === 'percent' ? '%' : 'd';
                return (
                  <div
                    key={level}
                    className={`alarm-rule level-${level}${rule.enabled === false ? ' is-disabled' : ''}`}
                  >
                    <div className="alarm-rule__top">
                      <div className="alarm-rule__meta">
                        <Badge className={`alarm-rule__level level-${level}`}>
                          Nivel {level}
                        </Badge>
                        <span className="alarm-rule__subtitle">{levelLabel}</span>
                      </div>

                      <label className="alarm-rule__switch">
                        <input
                          type="checkbox"
                          checked={rule.enabled !== false}
                          onChange={(e) => onRuleChange(level, selectedActor, { enabled: e.target.checked })}
                        />
                        Activa
                      </label>
                    </div>

                    <div className="alarm-rule__grid">
                      <div className="alarm-rule__field alarm-rule__field--range">
                        <label>Rango</label>
                        <div className="alarm-rule__range">
                          <input
                            type="number"
                            value={rule.thresholds?.[startField] ?? ''}
                            onChange={(e) => onThresholdChange(level, selectedActor, startField, e.target.value)}
                            min={0}
                            placeholder="Inicio"
                            aria-label={`Inicio nivel ${level} ${selectedActor}`}
                          />
                          <span className="alarm-rule__range-sep">→</span>
                          <input
                            type="number"
                            value={rule.thresholds?.[endField] ?? ''}
                            onChange={(e) => onThresholdChange(level, selectedActor, endField, e.target.value)}
                            min={0}
                            placeholder="Fin"
                            aria-label={`Fin nivel ${level} ${selectedActor}`}
                          />
                          <span className="alarm-rule__range-sep">{unitSuffix}</span>
                        </div>
                      </div>

                      <div className="alarm-rule__field">
                        <label>Unidad</label>
                        <select
                          value={mode}
                          onChange={(e) => {
                            const newMode = e.target.value;
                            onRuleChange(level, selectedActor, {
                              thresholds:
                                newMode === 'percent'
                                  ? { startPct: '', endPct: '' }
                                  : { startDays: '', endDays: '' },
                            });
                          }}
                        >
                          <option value="percent">% de la fase</option>
                          <option value="days">Días fijos</option>
                        </select>
                      </div>

                      <div className="alarm-rule__field alarm-rule__field--actions">
                        <label>Acciones</label>
                        <div className="alarm-rule__actions">
                          {ACTIONS.map((action) => {
                            const isSelected = (rule.action || 'show_alarm') === action.code;
                            return (
                              <button
                                key={action.code}
                                type="button"
                                className={`alarm-rule__action${isSelected ? ' is-selected' : ''}`}
                                onClick={() => action.available && onRuleChange(level, selectedActor, { action: action.code })}
                                disabled={!action.available}
                              >
                                <BellRing size={14} />
                                <span>{action.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="alarm-rule__field alarm-rule__field--message">
                      <label>Mensaje</label>
                      <input
                        type="text"
                        value={rule.message ?? ''}
                        onChange={(e) => onRuleChange(level, selectedActor, { message: e.target.value })}
                        placeholder="Mensaje personalizado opcional; si queda vacío se usará el fallback del motor."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
