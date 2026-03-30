import { useState, useEffect, useCallback, useMemo } from 'react';
import moment from 'moment';
import FUNService from '../../../services/fun.service';
import { regexChecker_isOA, regexChecker_isPh } from '../../../components/customClasses/typeParse';
import { calcularDiasHabiles, FUN_0_TYPE_TIME } from '../clocks/hooks/useClocksManager';

/**
 * Determina la fase actual de un proyecto a partir de sus campos macro.
 * Retorna un objeto { phase, phaseKey, stateLabel } que alimenta scatter + tabla.
 */
function derivePhase(row) {
  const state = Number(row.state);

  // Desistido
  if (state < -100 || (state >= -206 && state <= -200)) {
    return { phase: -1, phaseKey: 'desistido', stateLabel: 'DESIST' };
  }
  // Archivado
  if (state === 101) {
    return { phase: 6, phaseKey: 'archivado', stateLabel: 'ARCHIV' };
  }
  // Expedida / Licencia
  if (state === 100 || row.clock_license) {
    return { phase: 5, phaseKey: 'expedicion', stateLabel: 'EXPED' };
  }
  // Resolución / Viabilidad
  if (row.clock_resolution || row.clock_pay2) {
    return { phase: 4, phaseKey: 'viabilidad', stateLabel: 'VIAB' };
  }
  // Acta (P1 o P2 existente)
  if (row.rec_review != null || row.rec_review_2 != null) {
    return { phase: 3, phaseKey: 'acta', stateLabel: 'ACTA' };
  }
  // LyDF (en evaluación)
  if (state === 5) {
    return { phase: 2, phaseKey: 'lydf', stateLabel: 'LYDF' };
  }
  // Incompleto / Radicación
  if (state === 1 || state === -1 || state === 50) {
    return { phase: 1, phaseKey: 'radicacion', stateLabel: state === 50 ? 'EXPED' : 'INCOM' };
  }
  // Radicado sin estado claro
  return { phase: 0, phaseKey: 'radicacion', stateLabel: 'RADIC' };
}

/**
 * Calcula días hábiles consumidos desde radicación.
 */
function calcBusinessDays(row) {
  const start = row.clock_payment || row.date;
  if (!start) return 0;
  return calcularDiasHabiles(start, moment().format('YYYY-MM-DD'));
}

/**
 * Calcula días máximos legales según tipo.
 */
function calcMaxDays(row) {
  return FUN_0_TYPE_TIME[row.type] ?? 45;
}

/**
 * Genera los segmentos del mini-Gantt para una fila.
 * Cada segmento: { key, color, ratio } donde ratio es proporción del total.
 */
function buildGanttSegments(row, phaseInfo) {
  const segments = [];
  const maxDays = calcMaxDays(row) + 30; // radicación (30d) + LyDF limit
  const start = row.clock_payment || row.date;
  if (!start) return segments;

  const pushSeg = (from, to, key, color) => {
    if (!from) return;
    const end = to || moment().format('YYYY-MM-DD');
    const days = Math.max(1, calcularDiasHabiles(from, end));
    segments.push({ key, color, days, ratio: days / maxDays });
  };

  // Radicación → LyDF
  const lydfStart = row.clock_date;
  pushSeg(start, lydfStart, 'radicacion', '#F59E0B');

  if (lydfStart) {
    // LyDF → Acta
    const actaStart = row.clock_record_p1;
    pushSeg(lydfStart, actaStart, 'lydf', '#3B82F6');

    if (actaStart) {
      // Acta → Viabilidad
      const viaStart = row.clock_pay2 || row.clock_resolution;
      pushSeg(actaStart, viaStart, 'acta', '#8B5CF6');

      if (viaStart) {
        // Viabilidad → Expedición
        const expedStart = row.clock_license;
        pushSeg(viaStart, expedStart, 'viabilidad', '#06B6D4');

        if (expedStart) {
          pushSeg(expedStart, null, 'expedicion', '#10B981');
        }
      }
    }
  }

  return segments;
}

/**
 * Determina alarma básica a partir de datos macro.
 * Retorna { severity: 'danger'|'warning'|null, daysLeft: number|null }
 */
function deriveAlarm(row, phaseInfo) {
  const maxDays = calcMaxDays(row);
  const bizDays = calcBusinessDays(row);

  // Solo alarma en fases activas (no desistido, archivado, expedido)
  if (['desistido', 'archivado'].includes(phaseInfo.phaseKey)) return { severity: null, daysLeft: null };

  // Para radicación: 30 días de plazo
  if (phaseInfo.phaseKey === 'radicacion') {
    const start = row.clock_payment || row.date;
    if (!start) return { severity: null, daysLeft: null };
    const elapsed = calcularDiasHabiles(start, moment().format('YYYY-MM-DD'));
    const remaining = 30 - elapsed;
    if (remaining <= 2) return { severity: 'danger', daysLeft: remaining };
    if (remaining <= 7) return { severity: 'warning', daysLeft: remaining };
    return { severity: null, daysLeft: remaining };
  }

  // Para LyDF y acta: plazo según tipo
  if (['lydf', 'acta'].includes(phaseInfo.phaseKey)) {
    const ldfDate = row.clock_date;
    if (!ldfDate) return { severity: null, daysLeft: null };
    const elapsed = calcularDiasHabiles(ldfDate, moment().format('YYYY-MM-DD'));
    const remaining = maxDays - elapsed;
    if (remaining <= 2) return { severity: 'danger', daysLeft: remaining };
    if (remaining <= 7) return { severity: 'warning', daysLeft: remaining };
    return { severity: null, daysLeft: remaining };
  }

  // Para expedición: 30 días adicionales
  if (phaseInfo.phaseKey === 'expedicion') {
    const resDate = row.clock_resolution;
    if (!resDate) return { severity: null, daysLeft: null };
    const elapsed = calcularDiasHabiles(resDate, moment().format('YYYY-MM-DD'));
    const remaining = 30 - elapsed;
    if (remaining <= 2) return { severity: 'danger', daysLeft: remaining };
    if (remaining <= 7) return { severity: 'warning', daysLeft: remaining };
    return { severity: null, daysLeft: remaining };
  }

  return { severity: null, daysLeft: null };
}

/**
 * Tipo de actuación legible. Mapea campo 'tipo' a letra visible.
 */
const TIPO_MAP = { A: 'URB', B: 'PAR', C: 'SUB', D: 'CON', E: 'ESP', F: 'REC', G: 'OA' };
const TRAMITE_MAP = { A: 'Inicial', B: 'Prórroga', C: 'MLV', D: 'Revalidación' };

/**
 * Hook principal del dashboard.
 * Carga datos macro y transforma cada fila en un modelo normalizado.
 */
export function useDashboardData(dateStart, dateEnd) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    FUNService.loadMacro(dateStart, dateEnd)
      .then((res) => {
        setRawData(res.data || []);
      })
      .catch((err) => {
        console.error('Dashboard loadMacro error:', err);
        setError('Error cargando datos');
      })
      .finally(() => setLoading(false));
  }, [dateStart, dateEnd]);

  useEffect(() => {
    if (dateStart && dateEnd) loadData();
  }, [loadData, dateStart, dateEnd]);

  // Filtrar: excluir OA y Propiedad Horizontal
  const filteredData = useMemo(() => {
    return rawData.filter((row) => {
      if (regexChecker_isOA(row)) return false;
      if (regexChecker_isPh(row, false)) return false;
      return true;
    });
  }, [rawData]);

  // Transformar a modelo dashboard
  const projects = useMemo(() => {
    return filteredData.map((row) => {
      const phaseInfo = derivePhase(row);
      const businessDays = calcBusinessDays(row);
      const maxDays = calcMaxDays(row);
      const ganttSegments = buildGanttSegments(row, phaseInfo);
      const alarm = deriveAlarm(row, phaseInfo);

      return {
        id: row.id,
        idPublic: row.id_public,
        expId: row.exp_id,
        type: (row.type || '').toUpperCase(),
        tipoActuacion: TIPO_MAP[row.tipo] || row.tipo,
        tramite: TRAMITE_MAP[row.tramite] || row.tramite,
        state: Number(row.state),
        dateRad: row.clock_payment || row.date,
        // Phase
        phase: phaseInfo.phase,
        phaseKey: phaseInfo.phaseKey,
        stateLabel: phaseInfo.stateLabel,
        // Timeline
        businessDays,
        maxDays,
        ganttSegments,
        // Alarm
        alarm,
        // Raw (para navegación a modales)
        _raw: row,
      };
    });
  }, [filteredData]);

  // KPIs
  const kpis = useMemo(() => {
    const counts = { incompleto: 0, lydf: 0, acta: 0, expedicion: 0, alarma: 0, desistido: 0 };
    for (const p of projects) {
      if (p.phaseKey === 'radicacion') counts.incompleto++;
      else if (p.phaseKey === 'lydf') counts.lydf++;
      else if (p.phaseKey === 'acta') counts.acta++;
      else if (['viabilidad', 'expedicion'].includes(p.phaseKey)) counts.expedicion++;
      else if (p.phaseKey === 'desistido') counts.desistido++;
      if (p.alarm.severity) counts.alarma++;
    }
    return counts;
  }, [projects]);

  return { projects, kpis, loading, error, reload: loadData, totalRaw: rawData.length };
}
