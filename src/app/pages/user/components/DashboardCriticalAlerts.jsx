import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import FUNService from '../../../services/fun.service';
import { PROCESS_DEFINITION } from '../legal_flow_guide/utils/legalProcessDefinition';
import { useAlarmsBell } from '../fun_forms/hooks/useAlarmsV2';
import { buildExpedienteWorkspaceUrl } from '../fun_forms/utils/expedienteWorkspaceRoute';

const MAX_VISIBLE_ALERTS = 10;
const ALERT_SKELETON_ROWS = ['dashboard-alert-1', 'dashboard-alert-2'];
const PHASE_LABELS_BY_CODE = Object.fromEntries(PROCESS_DEFINITION.phases.map((phase) => [phase.id, phase.label]));
const PHASE_CODE_PATTERN = new RegExp(
  `\\b(${Object.keys(PHASE_LABELS_BY_CODE)
    .sort((a, b) => b.length - a.length)
    .map((code) => code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})\\b`,
  'g'
);

function getFirstFiniteNumber(...values) {
  for (const value of values) {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) return numericValue;
  }
  return null;
}

function getRemainingDays(alarm) {
  const directValue = getFirstFiniteNumber(
    alarm?.daysRemaining,
    alarm?.remainingDays,
    alarm?.diasRestantes,
    alarm?.remaining_days,
    alarm?.timeRemainingDays,
    alarm?.days_left
  );

  if (directValue != null) return directValue;

  const totalDays = getFirstFiniteNumber(alarm?.daysTotal, alarm?.totalDays, alarm?.diasTotales, alarm?.limitDays, alarm?.daysLimit);
  const usedDays = getFirstFiniteNumber(alarm?.daysUsed, alarm?.usedDays, alarm?.diasUsados, alarm?.elapsedDays);

  if (totalDays != null && usedDays != null) return totalDays - usedDays;
  return null;
}

function getSeverityMeta(alarm) {
  const severity = String(alarm?.severity || alarm?.status || '').toLowerCase();
  const level = Number(alarm?.level);
  const isCritical = level >= 2 || /critical|critica|crítica|danger|expired|vencid/.test(severity);

  if (isCritical) {
    return {
      label: 'Crítica',
      badgeVariant: 'destructive',
      iconClassName: 'bg-destructive/10 text-destructive',
      itemClassName: 'border-destructive/25 bg-destructive/5',
      rank: 2,
    };
  }

  return {
    label: 'Preventiva',
    badgeVariant: 'outline',
    iconClassName: 'bg-warning/10 text-warning',
    itemClassName: 'border-warning/25 bg-warning/5',
    rank: 1,
  };
}

function isVisibleCuraduriaAlarm(alarm) {
  if (!alarm) return false;
  if (alarm.archivedAt || alarm.archived_at || alarm.archived) return false;
  if (alarm.attendedAt || alarm.attended_at || alarm.attended) return false;
  if (alarm.hiddenAt || alarm.hidden_at || alarm.hidden) return false;

  const actor = String(alarm.actor || '').trim().toUpperCase();
  return !actor || actor === 'CUR' || actor === 'CURADURIA' || actor === 'CURADURÍA';
}

function getAlarmTitle(alarm) {
  return alarm?.radicado || alarm?.id_public || alarm?.idPublic || alarm?.currentPublic || alarm?.title || `Alarma ${alarm?.id || ''}`.trim();
}

function getReadablePhaseLabel(code) {
  return PHASE_LABELS_BY_CODE[code] || code;
}

function formatAlarmDisplayText(value) {
  if (!value) return '';

  return String(value)
    .replace(PHASE_CODE_PATTERN, (code) => getReadablePhaseLabel(code))
    .replace(/\bTermino\b/g, 'Término')
    .replace(/\btermino\b/g, 'término')
    .replace(/\bCuraduria\b/g, 'Curaduría')
    .replace(/\bcuraduria\b/g, 'curaduría');
}

function getAlarmDescription(alarm) {
  return formatAlarmDisplayText(alarm?.message || alarm?.suggestion || alarm?.action || alarm?.title) || 'Tarea pendiente de actuación por curaduría.';
}

function getAlarmHref(alarm) {
  const radicado = alarm?.id_public || alarm?.idPublic || alarm?.radicado || alarm?.currentPublic;
  if (!radicado) return '';
  return buildExpedienteWorkspaceUrl({ id_public: radicado }, { section: 'tiempos' });
}

function getAlarmFun0Id(alarm) {
  return alarm?.fun0Id ?? alarm?.fun_0_id ?? alarm?.fun0_id ?? alarm?.fun_0?.id ?? null;
}

function getAlarmKey(alarm) {
  return String(alarm?.id || alarm?.radicado || alarm?.title || getAlarmFun0Id(alarm));
}

function getResolvedExpedienteHref(response) {
  const payload = response?.data;
  const expediente = Array.isArray(payload) ? payload[0] : payload;
  const publicId = expediente?.id_public || expediente?.idPublic || expediente?.radicado || expediente?.currentPublic;
  if (!publicId) return '';
  return buildExpedienteWorkspaceUrl({ id_public: publicId }, { section: 'tiempos' });
}

function formatRemainingDays(days) {
  if (!Number.isFinite(days)) return 'Plazo por confirmar';
  if (days < 0) {
    const overdueDays = Math.abs(days);
    return overdueDays === 1 ? 'Vencida hace 1 día' : `Vencida hace ${overdueDays} días`;
  }
  if (days === 0) return 'Vence hoy';
  return days === 1 ? '1 día restante' : `${days} días restantes`;
}

function buildUrgentAlarms(alarms) {
  return (alarms || [])
    .filter(isVisibleCuraduriaAlarm)
    .map((alarm) => {
      const remainingDays = getRemainingDays(alarm);
      const severity = getSeverityMeta(alarm);
      return {
        ...alarm,
        remainingDays,
        severity,
        href: getAlarmHref(alarm),
      };
    })
    .sort((a, b) => {
      const aDays = Number.isFinite(a.remainingDays) ? a.remainingDays : Number.POSITIVE_INFINITY;
      const bDays = Number.isFinite(b.remainingDays) ? b.remainingDays : Number.POSITIVE_INFINITY;
      if (aDays !== bDays) return aDays - bDays;
      return b.severity.rank - a.severity.rank;
    })
    .slice(0, MAX_VISIBLE_ALERTS);
}

function useResolvedAlarmHrefs(urgentAlarms) {
  const [resolvedHrefs, setResolvedHrefs] = useState({});

  useEffect(() => {
    const unresolvedAlarms = urgentAlarms.filter((alarm) => !alarm.href && getAlarmFun0Id(alarm) && !(getAlarmKey(alarm) in resolvedHrefs));
    if (unresolvedAlarms.length === 0) return undefined;

    let active = true;

    async function resolveHrefs() {
      const entries = await Promise.all(
        unresolvedAlarms.map(async (alarm) => {
          try {
            const response = await FUNService.get(getAlarmFun0Id(alarm));
            return [getAlarmKey(alarm), getResolvedExpedienteHref(response)];
          } catch (_error) {
            return [getAlarmKey(alarm), ''];
          }
        })
      );

      if (!active) return;

      setResolvedHrefs((current) => {
        const next = { ...current };
        entries.forEach(([key, href]) => {
          next[key] = href || null;
        });
        return next;
      });
    }

    resolveHrefs();

    return () => {
      active = false;
    };
  }, [urgentAlarms, resolvedHrefs]);

  return resolvedHrefs;
}

function DashboardCriticalAlertsContent() {
  const { alarms, loading, error } = useAlarmsBell({ pollMs: 60000, includeRead: true, assignedOnly: false, limit: 50 });
  const urgentAlarms = useMemo(() => buildUrgentAlarms(alarms), [alarms]);
  const resolvedHrefs = useResolvedAlarmHrefs(urgentAlarms);
  const displayAlarms = urgentAlarms.map((alarm) => ({
    ...alarm,
    href: alarm.href || resolvedHrefs[getAlarmKey(alarm)] || '',
  }));

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <Icon name="AlertTriangle" size={15} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-foreground">Alertas urgentes</h2>
              <p className="truncate text-[11px] text-muted-foreground">Tareas de curaduría con menor plazo</p>
            </div>
          </div>
          <Badge variant={displayAlarms.length > 0 ? 'destructive' : 'secondary'} className="rounded-full text-[10px] tabular-nums">
            {loading ? '…' : displayAlarms.length}
          </Badge>
        </div>

        {loading ? (
          <div className="grid gap-1.5 p-2">
            {ALERT_SKELETON_ROWS.map((key) => (
              <div key={key} className="rounded-md border border-border px-2.5 py-2">
                <Skeleton className="mb-2 h-3.5 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-4 py-4 text-center text-xs text-warning">
            No fue posible cargar las alertas urgentes.
          </div>
        ) : displayAlarms.length === 0 ? (
          <div className="px-4 py-4 text-center text-xs text-muted-foreground">
            Estás al día, no hay tareas urgentes.
          </div>
        ) : (
          <div className="grid max-h-[13.75rem] gap-1.5 overflow-y-auto p-2 pr-1" role="region" aria-label="Listado de alertas urgentes">
            {displayAlarms.map((alarm) => (
              <DashboardCriticalAlertItem key={getAlarmKey(alarm)} alarm={alarm} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardCriticalAlertItem({ alarm }) {
  const content = (
    <>
      <div className="flex min-w-0 items-start gap-2.5">
        <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md', alarm.severity.iconClassName)}>
          <Icon name="Clock" size={13} />
        </span>
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-xs font-semibold text-foreground">{getAlarmTitle(alarm)}</span>
            <Badge variant={alarm.severity.badgeVariant} className="shrink-0 px-1.5 py-0 text-[9px]">
              {alarm.severity.label}
            </Badge>
          </span>
          <span className="mt-0.5 block line-clamp-1 text-[11px] text-muted-foreground">{getAlarmDescription(alarm)}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <span className="text-foreground">{formatRemainingDays(alarm.remainingDays)}</span>
          </span>
        </span>
      </div>
      <Icon name="ArrowUpRight" size={13} className="shrink-0 text-muted-foreground" />
    </>
  );

  const className = cn(
    'flex items-start justify-between gap-2 rounded-md border px-2.5 py-2 no-underline transition-colors hover:bg-muted/50',
    alarm.severity.itemClassName
  );

  if (!alarm.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link to={alarm.href} className={className}>
      {content}
    </Link>
  );
}

export default function DashboardCriticalAlerts() {
  return null;
}
