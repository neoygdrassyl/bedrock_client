import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AppWindow,
  BellRing,
  ChevronDown,
  ClipboardList,
  Menu,
  MessagesSquare,
  PanelRightClose,
  PanelRightOpen,
  Plus,
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { Icon } from '@/shared/components/icon';
import { Z_CLASS } from '@/shared/lib/layers';
import { cn } from '@/shared/lib/utils';
import FUNService from '../../../api/fun.service';
import legalGuideService from '../../../api/legalGuide.service';
import { calcularDiasHabiles, sumarDiasHabiles, FUN_0_TYPE_TIME } from '../../../clocks/hooks/useClocksManager';
import { useAlarms } from '../hooks/useAlarms';
import { BookmarkQuickMenu } from './BookmarkQuickMenu';
import { useBookmarks } from '../hooks/useBookmarks';
import { formsParser1, regexChecker_isOA_2 } from '../../../../../shared/config/customClasses/typeParse';
import RecordsBinnacleStack from '../../../records/RecordsBinnacleStack';
import { isBinnaclePanelDefaultOpen } from '../utils/expedienteWorkspaceRoute';
import { isSubdivisionExpediente } from '../utils/expedienteDomainRules.js';
import {
  EXPEDIENTE_NAV_GROUPS,
  EXPEDIENTE_SECTION_IDS,
  NAV_TONE_CLASSES,
  findNavSection,
  getExpedienteNavGroups,
} from '../../../workspace/expedienteNavConfig';
import { getExpedienteStatusMeta } from '../../../workspace/expedienteStatus';
import { ExpedienteSideNav } from '../../../workspace/ExpedienteSideNav';
import { ExpedienteAppSwitcher } from '../../../workspace/ExpedienteAppSwitcher';
import { ExpedienteBinnacleLauncher } from '../../../workspace/ExpedienteBinnacleLauncher';
import { useExpedienteNavCollapsed, useIsWideViewport } from '../../../workspace/useExpedienteNavLayout';
import { addToDock, minimize as minimizeDockWindow, setActiveWorkspace, setDockSearchOpen, useExpedienteDock } from '../../../dock';

const FUNG = React.lazy(() => import('../fun_g'));
const FUNC = React.lazy(() => import('../fun_c'));
const FUNN = React.lazy(() => import('../fun_n'));
const FUND = React.lazy(() => import('./fun_docs'));
const FUN_DOCUMENTAL_NEW = React.lazy(() => import('../../../documental/FunDocumentalNew.jsx'));
const FUN_ALERT = React.lazy(() => import('../fun_alertn'));
const FUNCLOCK = React.lazy(() => import('../fun_clock'));
const RECORD_ARC = React.lazy(() => import('../../../records/record_arc'));
const SUBDIVISION_ARCHITECTURE_REPORT = React.lazy(() => import('../../../records/record_arc_subdivision/SubdivisionArchitectureReport'));
const RECORD_LAW = React.lazy(() => import('../../../records/record_law'));
const RECORD_ENG = React.lazy(() => import('../../../records/record_eng'));
const RECORD_REVIEW = React.lazy(() => import('../../../records/record_review'));
const RECORD_PH = React.lazy(() => import('../../../records/record_ph'));
const EXPEDITION = React.lazy(() => import('../../../expeditions/expedition.page'));

const REPORT_ITEMS = EXPEDIENTE_NAV_GROUPS.find((group) => group.id === 'informes').items;
const STANDARD_REPORT_ITEMS = REPORT_ITEMS.filter((item) => item.standardReport);

function ModuleLoadingFallback() {
  return (
    <div className="flex min-h-[18rem] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
      Cargando módulo del expediente...
    </div>
  );
}

const TERM_META = {
  overdue: {
    label: 'Término vencido',
    description: 'El plazo legal reportado ya fue consumido.',
    icon: 'AlertTriangle',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    barClass: 'bg-destructive',
  },
  critical: {
    label: 'Atención inmediata',
    description: 'Quedan pocos días hábiles para actuar.',
    icon: 'Siren',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    barClass: 'bg-destructive',
  },
  warning: {
    label: 'Seguimiento preventivo',
    description: 'Conviene revisar el avance antes del vencimiento.',
    icon: 'Clock3',
    badgeClass: 'border-warning/30 bg-warning/10 text-warning',
    barClass: 'bg-warning',
  },
  stable: {
    label: 'En control',
    description: 'El expediente conserva holgura operativa.',
    icon: 'ShieldCheck',
    badgeClass: 'border-accent/30 bg-accent/10 text-accent',
    barClass: 'bg-accent',
  },
  unknown: {
    label: 'Sin término calculado',
    description: 'El backend no entregó días límite para este expediente.',
    icon: 'CircleHelp',
    badgeClass: 'border-border bg-muted text-muted-foreground',
    barClass: 'bg-muted-foreground/40',
  },
};

function formatDisplayDate(value) {
  if (!value) {
    return 'Sin fecha';
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(value));
  } catch (_error) {
    return String(value);
  }
}

function toSafeNumber(value, fallback = 0) {
  if (value == null || value === '') {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getFirstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function normalizeTypeKey(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (['i', 'ii', 'iii', 'iv', 'oa'].includes(normalized)) return normalized;
  if (normalized.includes('obra') || normalized.includes('oa')) return 'oa';
  if (normalized.includes('iv') || normalized.includes('4')) return 'iv';
  if (normalized.includes('iii') || normalized.includes('3')) return 'iii';
  if (normalized.includes('ii') || normalized.includes('2')) return 'ii';
  if (normalized.includes('i') || normalized.includes('1')) return 'i';
  return null;
}

function getExpedienteTypeKey(expediente) {
  return normalizeTypeKey(getFirstValue(expediente?.tipo, expediente?.type, expediente?.categoria, expediente?.m_lic));
}

function hasSeededLegalSummary(expediente, currentPublic) {
  if (!expediente || !currentPublic || getExpedienteRadicado(expediente) !== currentPublic) {
    return false;
  }

  return [
    expediente?.fase_actual,
    expediente?.status,
    expediente?.dias_habiles_usados,
    expediente?.dias_habiles_limite,
    expediente?.porcentaje_avance,
    expediente?.fecha_limite,
  ].some((value) => value !== undefined && value !== null && value !== '');
}

function normalizePhaseCode(value) {
  if (!value) return '';
  const code = String(value).trim();
  const directMatch = STANDARD_PHASES_FS.find((phase) => code.includes(phase.phaseId));
  if (directMatch) return directMatch.phaseId;
  if (code.includes('_')) {
    const simple = code.split('_').reverse().find((part) => STANDARD_PHASES_FS.some((phase) => phase.phaseId === part));
    return simple || code;
  }
  return code;
}

function getClockDate(expediente, states) {
  const clocks = Array.isArray(expediente?.fun_clocks) ? expediente.fun_clocks : [];
  const stateList = Array.isArray(states) ? states : [states];
  const match = clocks.find((clock) => stateList.some((state) => String(clock?.state) === String(state)) && clock?.date_start);
  return match?.date_start ?? null;
}

function deriveFallbackLegalTerms(expediente) {
  if (!expediente) return null;

  const existingLimit = toSafeNumber(expediente?.dias_habiles_limite, 0);
  const existingUsed = toSafeNumber(expediente?.dias_habiles_usados, 0);
  if (existingLimit > 0 && (existingUsed > 0 || expediente?.fecha_limite)) {
    return null;
  }

  const startDate = getClockDate(expediente, [5, '5']) || expediente?.fecha_radicacion || expediente?.date_start || expediente?.createdAt;
  if (!startDate) return null;

  const typeKey = getExpedienteTypeKey(expediente) || 'iv';
  const limitDays = FUN_0_TYPE_TIME[typeKey] ?? 45;
  const usedDays = calcularDiasHabiles(startDate, new Date(), false);
  const progress = limitDays > 0 ? Math.min(Math.round((usedDays / limitDays) * 100), 100) : 0;
  const fechaLimite = sumarDiasHabiles(startDate, limitDays);
  const remaining = limitDays - usedDays;

  return {
    fase_actual: 'EST',
    fase_label: 'Estudio y observaciones',
    responsable: 'Curaduría',
    dias_habiles_usados: Math.max(usedDays, 0),
    dias_habiles_limite: limitDays,
    porcentaje_avance: progress,
    fecha_limite: fechaLimite,
    status: remaining < 0 ? 'VENCIDO' : remaining <= 3 ? 'ALERTA_VENCIMIENTO' : remaining <= 8 ? 'PRONTO_A_VENCER' : 'EN_TERMINO',
    sugerencia: 'Cálculo mínimo desde el submódulo de tiempos mientras el resumen legal individual termina de responder.',
    term_source: 'clocks-fallback',
  };
}

function mergeLegalSummary(base, liveSummary) {
  const combined = { ...base, ...liveSummary };
  const fallbackTerms = deriveFallbackLegalTerms(combined) || {};
  const fallbackSource = fallbackTerms.term_source;
  const sourceLabel = fallbackSource
    ? fallbackSource
    : liveSummary
      ? 'summary-endpoint'
      : 'payload';
  return {
    ...base,
    ...liveSummary,
    ...fallbackTerms,
    fase_actual: getFirstValue(liveSummary?.fase_actual, fallbackTerms.fase_actual, base?.fase_actual),
    fase_label: getFirstValue(liveSummary?.fase_label, fallbackTerms.fase_label, base?.fase_label),
    responsable: getFirstValue(liveSummary?.responsable, fallbackTerms.responsable, base?.responsable, base?.actor_actual),
    dias_habiles_usados: getFirstValue(liveSummary?.dias_habiles_usados, fallbackTerms.dias_habiles_usados, base?.dias_habiles_usados),
    dias_habiles_limite: getFirstValue(liveSummary?.dias_habiles_limite, fallbackTerms.dias_habiles_limite, base?.dias_habiles_limite),
    porcentaje_avance: getFirstValue(liveSummary?.porcentaje_avance, fallbackTerms.porcentaje_avance, base?.porcentaje_avance),
    fecha_limite: getFirstValue(liveSummary?.fecha_limite, fallbackTerms.fecha_limite, base?.fecha_limite),
    status: getFirstValue(liveSummary?.status, fallbackTerms.status, base?.status),
    sugerencia: getFirstValue(liveSummary?.sugerencia, liveSummary?.suggestion, fallbackTerms.sugerencia, base?.sugerencia, base?.suggestion),
    term_source: getFirstValue(fallbackSource, liveSummary?.term_source, base?.term_source, sourceLabel),
  };
}

const getSummaryStatusMeta = getExpedienteStatusMeta;

function getTermMeta({ summary, usedDays, limitDays, remainingDays }) {
  if (summary?.status === 'VENCIDO' || usedDays > limitDays && limitDays > 0) {
    return TERM_META.overdue;
  }

  if (!limitDays) {
    return TERM_META.unknown;
  }

  if (remainingDays <= 3 || summary?.status === 'ALERTA_VENCIMIENTO') {
    return TERM_META.critical;
  }

  if (remainingDays <= 8 || summary?.status === 'PRONTO_A_VENCER') {
    return TERM_META.warning;
  }

  return TERM_META.stable;
}

function getProgressPercent(summary, usedDays, limitDays) {
  return Math.max(
    0,
    Math.min(
      toSafeNumber(summary?.porcentaje_avance, limitDays > 0 ? Math.round((usedDays / limitDays) * 100) : 0),
      100
    )
  );
}

function getAlarmSeverityMeta(alarm) {
  const level = String(alarm?.severity ?? alarm?.level ?? alarm?.status ?? '').toLowerCase();

  if (level.includes('danger') || level.includes('destructive') || level.includes('critical') || level.includes('alta')) {
    return {
      label: 'Crítica',
      icon: 'AlertTriangle',
      className: 'border-destructive/30 bg-destructive/10 text-destructive',
    };
  }

  if (level.includes('warning') || level.includes('medium') || level.includes('media')) {
    return {
      label: 'Preventiva',
      icon: 'Clock3',
      className: 'border-warning/30 bg-warning/10 text-warning',
    };
  }

  return {
    label: alarm?.typeLabel || alarm?.statusText || 'Operativa',
    icon: 'Bell',
    className: 'border-primary/30 bg-primary/10 text-primary',
  };
}

function getAlarmTitle(alarm) {
  return alarm?.title || alarm?.phaseCode || alarm?.phaseName || alarm?.typeLabel || alarm?.radicado || `Alarma ${alarm?.id ?? ''}`;
}

function getAlarmDescription(alarm) {
  return alarm?.message || alarm?.suggestion || alarm?.action || alarm?.statusText || 'Sin detalle operativo registrado.';
}

function getReportLabel(value) {
  if (!value) {
    return 'Bitácora global';
  }

  const normalized = String(value).toLowerCase();
  const match = REPORT_ITEMS.find((item) => normalized.includes(item.id) || normalized.includes(item.label.toLowerCase()));
  return match?.label || String(value);
}

function getBitacoraGroups(entries) {
  const groups = new Map();

  entries.forEach((entry) => {
    const key = entry.report ? getReportLabel(entry.report) : 'Bitácora global';
    groups.set(key, [...(groups.get(key) || []), entry]);
  });

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

function deriveRecentActivity({ summary, alarms, bitacoraEntries }) {
  const events = [];

  if (summary?.fase_label) {
    events.push({
      id: 'fase-actual',
      icon: 'Route',
      title: 'Fase actual',
      detail: summary.fase_label,
      meta: summary.responsable || 'Responsable sin definir',
    });
  }

  alarms.slice(0, 2).forEach((alarm, index) => {
    events.push({
      id: `alarma-${alarm?.id ?? index}`,
      icon: 'BellRing',
      title: getAlarmTitle(alarm),
      detail: getAlarmDescription(alarm),
      meta: alarm?.phaseCode || alarm?.actor || 'Alarma operativa',
    });
  });

  bitacoraEntries.slice(0, 2).forEach((entry, index) => {
    events.push({
      id: `bitacora-${entry.id ?? index}`,
      icon: 'MessageSquareText',
      title: entry.author,
      detail: entry.note,
      meta: entry.date ? formatDisplayDate(entry.date) : getReportLabel(entry.report),
    });
  });

  return events.slice(0, 3);
}

function getExpedienteId(expediente) {
  return expediente?.id ?? expediente?.fun0Id ?? expediente?.fun_0_id ?? null;
}

function getExpedientePublicKey(expediente) {
  const value = getFirstValue(expediente?.id_public, expediente?.radicado);
  return value == null ? null : String(value).trim();
}

function hasDifferentExpedienteIdentity(current, next) {
  if (!current || !next) return false;

  const currentId = getExpedienteId(current);
  const nextId = getExpedienteId(next);
  if (currentId != null && nextId != null && String(currentId) !== String(nextId)) {
    return true;
  }

  const currentPublic = getExpedientePublicKey(current);
  const nextPublic = getExpedientePublicKey(next);
  return Boolean(currentPublic && nextPublic && currentPublic !== nextPublic);
}

function mergeExpedienteSummary(current, next) {
  if (!next) return current;
  if (!current || hasDifferentExpedienteIdentity(current, next)) return next;
  return { ...current, ...next };
}

function getBookmarkExpedienteId(bookmark) {
  return bookmark?.fun0Id ?? bookmark?.fun_0_id ?? bookmark?.fun_0?.id ?? bookmark?.id ?? null;
}

function createBookmarkState(state = {}) {
  const personal = Boolean(state.personal);
  const team = Boolean(state.team);

  return {
    personal,
    team,
    any: personal || team,
    mode: personal && team ? 'both' : personal ? 'personal' : team ? 'team' : 'none',
  };
}

function mergeBookmarkState(...states) {
  return createBookmarkState(
    states.reduce(
      (acc, state) => ({
        personal: acc.personal || Boolean(state?.personal),
        team: acc.team || Boolean(state?.team),
      }),
      { personal: false, team: false }
    )
  );
}

function getExpedienteVersion(expediente) {
  return Number.isFinite(expediente?.version) ? expediente.version : 1;
}

function getExpedienteRadicado(expediente) {
  return expediente?.id_public ?? expediente?.radicado ?? expediente?.fun0Id ?? expediente?.fun_0_id ?? 'Sin radicado';
}

function getExpedienteApplicant(expediente) {
  return expediente?.solicitante ?? expediente?.applicant ?? expediente?.titular ?? 'Sin solicitante registrado';
}

function normalizePropertyHorizontalText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function matchesLegacyPropertyHorizontal(type) {
  const normalizedType = normalizePropertyHorizontalText(type);

  if (!normalizedType) {
    return false;
  }

  return (
    /(?:^|[^a-z0-9])2\s*:\s*ph(?:$|[^a-z0-9])/.test(normalizedType)
    || /\bpropiedad\s+horizontal\b/.test(normalizedType)
    || /(?:^|[^a-z0-9])p\.?\s*h(?:$|[^a-z0-9])/.test(normalizedType)
    || /\bph\b/.test(normalizedType)
  );
}

function getVersionFun1(expediente, version) {
  const fun1List = Array.isArray(expediente?.fun_1s) ? expediente.fun_1s : [];
  const targetIndex = Math.max(Math.min((version || 1) - 1, fun1List.length - 1), 0);
  return fun1List[targetIndex] ?? fun1List[0] ?? null;
}

function getPropertyHorizontalClassifierText(expediente, version) {
  const fun1 = getVersionFun1(expediente, version);

  return [
    formsParser1(fun1),
    fun1?.item_1,
    fun1?.item_2,
    fun1?.tipo,
    fun1?.tramite,
    fun1?.m_urb,
    fun1?.m_sub,
    fun1?.m_lic,
    expediente?.tipo_licencia,
    expediente?.tramite,
    expediente?.categoria,
  ]
    .filter((value) => value !== undefined && value !== null && value !== '')
    .join(' ');
}

function isPropertyHorizontalExpediente(expediente, version) {
  return matchesLegacyPropertyHorizontal(getPropertyHorizontalClassifierText(expediente, version));
}

function isEditableLegacyExpediente(expediente) {
  if (typeof expediente?.state !== 'number') {
    return false;
  }

  return expediente.state !== 101 && expediente.state <= 200;
}

function canShowLegacyPublicidad(expediente, version) {
  if (!isEditableLegacyExpediente(expediente)) {
    return false;
  }

  const rules = expediente?.rules ? String(expediente.rules).split(';') : [];
  if (String(rules[0]) === '1') {
    return false;
  }

  const fun1 = getVersionFun1(expediente, version);

  return !isPropertyHorizontalExpediente(expediente, version) && !regexChecker_isOA_2(fun1);
}

function getVisibleSectionGroups(expediente, version) {
  return getExpedienteNavGroups({
    canEdit: isEditableLegacyExpediente(expediente),
    canShowPublicidad: canShowLegacyPublicidad(expediente, version),
    isPropertyHorizontal: isPropertyHorizontalExpediente(expediente, version),
  });
}

function normalizeBitacoraEntries(expediente) {
  const source = Array.isArray(expediente?.bitacora)
    ? expediente.bitacora
    : Array.isArray(expediente?.comentarios)
      ? expediente.comentarios
      : Array.isArray(expediente?.observaciones)
        ? expediente.observaciones
        : [];

  return source
    .map((entry, index) => {
      if (typeof entry === 'string') {
        return {
          id: `bitacora-${index}`,
          author: 'Profesional',
          note: entry,
          date: null,
          report: null,
        };
      }

      return {
        id: entry?.id ?? `bitacora-${index}`,
        author: entry?.author ?? entry?.usuario ?? entry?.profesional ?? entry?.worker_name ?? 'Profesional',
        note: entry?.note ?? entry?.comentario ?? entry?.observacion ?? entry?.detalle ?? 'Sin detalle registrado.',
        date: entry?.date ?? entry?.fecha ?? entry?.createdAt ?? entry?.updatedAt ?? null,
        report: entry?.report ?? entry?.informe ?? entry?.disciplina ?? entry?.module ?? entry?.tipo ?? null,
      };
    })
    .filter((entry) => entry.note);
}

// ── Fases legales reconocidas para normalizar códigos enriquecidos ─────────
const STANDARD_PHASES_FS = [
  { phaseId: 'RAD',     label: 'Radicación' },
  { phaseId: 'EST',     label: 'Estudio' },
  { phaseId: 'NOT_OBS', label: 'Notif. Obs.' },
  { phaseId: 'CORR',    label: 'Correcciones' },
  { phaseId: 'VIA',     label: 'Viabilidad' },
  { phaseId: 'NOT_VIA', label: 'Notif. Via.' },
  { phaseId: 'PAG',     label: 'Pagos' },
  { phaseId: 'RES',     label: 'Resolución' },
  { phaseId: 'NOT_RES', label: 'Notif. Res.' },
  { phaseId: 'EJEC',    label: 'Ejecutoria' },
  { phaseId: 'ENT',     label: 'Entrega' },
];

function SummaryItem({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card/70 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <Icon name={icon} size={12} />
        {label}
      </div>
      <p className="truncate text-sm font-medium text-foreground">{value || 'Sin dato disponible'}</p>
    </div>
  );
}

function SupportCard({ title, children, action }) {
  return (
    <section className="rounded-xl border border-border bg-card/80 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function TopBarIconButton({ label, onClick, children, active = false, disabled = false, className, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(
            'relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground outline-none transition-colors duration-150',
            'hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            active && 'bg-muted text-foreground',
            className,
          )}
          {...props}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className="rounded-lg px-2.5 py-1 text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function LegalStatusCard({ summary, legalGuide, legalGuideLoading, summaryStatus, termMeta, usedDays, limitDays, progressPercent, remainingDays }) {
  const responsable = summary?.responsable || summary?.actor_actual || 'Responsable sin definir';
  const suggestion = summary?.sugerencia || summary?.suggestion || summary?.recomendacion;
  const guideTerm = getFirstValue(legalGuide?.terminoDias, legalGuide?.termino_dias);
  const guideActor = legalGuide?.actor;
  const guideNorm = legalGuide?.norma;
  const sourceLabel = summary?.term_source === 'clocks-fallback'
    ? 'Calculado desde tiempos'
    : summary?.term_source === 'summary-endpoint'
      ? 'Resumen legal backend'
      : 'Payload del expediente';

  return (
    <SupportCard title="Estado y términos">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{summary?.fase_label || 'Fase por confirmar'}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{responsable}{guideActor ? ` · guía ${guideActor}` : ''}</p>
          </div>
          <Badge className={cn('shrink-0 border text-[10px] font-semibold', summaryStatus.badgeClass)}>
            {summaryStatus.label}
          </Badge>
        </div>

        <div className="rounded-lg border border-border/70 bg-background/70 p-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className={cn('inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', termMeta.badgeClass)}>
                <Icon name={termMeta.icon} size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{termMeta.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{termMeta.description}</p>
              </div>
            </div>
            {remainingDays != null ? (
              <span className="shrink-0 font-mono text-xs font-semibold text-foreground">{remainingDays}d</span>
            ) : null}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all duration-300', termMeta.barClass)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono">{usedDays}/{limitDays || 0} días hábiles</span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg border border-border/70 bg-background/70 p-2">
            <p className="font-semibold uppercase tracking-[0.14em] text-muted-foreground">Límite</p>
            <p className="mt-0.5 truncate font-medium text-foreground">{formatDisplayDate(summary?.fecha_limite)}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/70 p-2">
            <p className="font-semibold uppercase tracking-[0.14em] text-muted-foreground">Fuente</p>
            <p className="mt-0.5 truncate font-medium text-foreground">{sourceLabel}</p>
          </div>
        </div>

        {guideTerm || guideNorm || legalGuideLoading ? (
          <div className="rounded-lg border border-primary/15 bg-primary/5 p-2.5 text-[11px] leading-relaxed text-primary">
            <div className="mb-1 flex items-center gap-1.5 font-semibold">
              <Icon name="Scale" size={12} />
              Guía jurídica viva
            </div>
            <p className="text-primary/90">
              {legalGuideLoading
                ? 'Consultando modelamiento jurídico de la fase...'
                : `${guideTerm ? `Término guía: ${guideTerm} días. ` : ''}${guideNorm || 'Sin referencia normativa adicional.'}`}
            </p>
          </div>
        ) : null}

        {suggestion ? (
          <div className="rounded-lg border border-border/70 bg-background/70 p-2.5 text-[11px] text-muted-foreground">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
              <Icon name="Sparkles" size={13} />
              Sugerencia
            </div>
            <p className="leading-relaxed">{suggestion}</p>
          </div>
        ) : null}
      </div>
    </SupportCard>
  );
}

function BitacoraList({ entries }) {
  if (!entries.length) {
    return (
      <p className="text-xs text-muted-foreground">
        Sin comentarios profesionales registrados para este expediente.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.slice(0, 6).map((entry) => (
        <article key={entry.id} className="rounded-lg border border-border/70 bg-background/80 p-2.5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="truncate text-xs font-medium text-foreground">{entry.author}</span>
            {entry.date ? <span className="shrink-0 text-[10px] text-muted-foreground">{entry.date}</span> : null}
          </div>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{entry.note}</p>
        </article>
      ))}
    </div>
  );
}

function OperationalAlertsCard({ alarms, onOpen }) {
  return (
    <SupportCard
      title="Alertas y anuncios"
      action={(
        <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={onOpen}>
          Ver detalle
        </Button>
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={alarms.length ? 'destructive' : 'secondary'} className="text-xs">
            {alarms.length} alerta{alarms.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {alarms.length === 0 ? (
          <div className="rounded-lg border border-border/70 bg-background/70 p-2.5 text-[11px] text-muted-foreground">
            Sin alertas activas para este expediente. Si tiempos publica anuncios, aparecerán aquí cuando el backend los entregue como alarmas.
          </div>
        ) : (
          <ul className="space-y-2">
            {alarms.slice(0, 3).map((alarm, index) => {
                const severity = getAlarmSeverityMeta(alarm);
                return (
                <li key={alarm?.id ?? `alarm-${index}`} className="rounded-lg border border-border/70 bg-background/80 p-2.5">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={cn('inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', severity.className)}>
                      <Icon name={severity.icon} size={12} />
                    </span>
                    <p className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{getAlarmTitle(alarm)}</p>
                  </div>
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{getAlarmDescription(alarm)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SupportCard>
  );
}

function BitacoraPreviewCard({ entries, groups, onOpen }) {
  const hasReportGroups = groups.length > 1 || groups.some((group) => group.label !== 'Bitácora global');

  return (
    <SupportCard
      title="Bitácora operativa"
      action={(
        <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={onOpen}>
          Ver bitácora
        </Button>
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="text-xs">
            {entries.length} entrada{entries.length !== 1 ? 's' : ''}
          </Badge>
          {hasReportGroups ? <span className="text-[10px] text-muted-foreground">Por informe</span> : null}
        </div>

        <BitacoraList entries={entries.slice(0, 3)} />

        <div className="rounded-lg border border-border/70 bg-background/70 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
          {hasReportGroups
            ? 'El payload permite separar entradas por informe. La creación múltiple sigue dependiendo del backend.'
            : 'Vista global: el backend actual no expone bitácoras múltiples por informe como contrato CRUD.'}
        </div>
      </div>
    </SupportCard>
  );
}

function RecentActivityCard({ events }) {
  return (
    <SupportCard title="Actividad reciente">
      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sin actividad secundaria disponible en el payload actual.</p>
      ) : (
        <ol className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="flex gap-2.5">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                <Icon name={event.icon} size={13} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-foreground">{event.title}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{event.meta}</span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{event.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SupportCard>
  );
}

function AlertsDialog({ open, onOpenChange, alarms, currentPublic }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent overlayClassName="!z-[10060]" className="!z-[10070] max-h-[82vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name="BellRing" size={18} className="text-primary" />
            Alertas y anuncios operativos
          </DialogTitle>
          <DialogDescription>
            {currentPublic} · señales publicadas por tiempos y alarmas disponibles para este expediente.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 p-6">
            {alarms.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/70 p-5 text-sm text-muted-foreground">
                No hay alertas activas. El chat temporal o una tabla de anuncios dedicada requiere soporte backend adicional; en esta vista solo se consumen alarmas existentes.
              </div>
            ) : (
              alarms.map((alarm, index) => {
                const severity = getAlarmSeverityMeta(alarm);
                return (
                  <article key={alarm?.id ?? `dialog-alarm-${index}`} className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={cn('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border', severity.className)}>
                          <Icon name={severity.icon} size={16} />
                        </span>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold text-foreground">{getAlarmTitle(alarm)}</h4>
                          <p className="text-xs text-muted-foreground">{alarm?.phaseCode || alarm?.actor || 'Sin fase asociada'}</p>
                        </div>
                      </div>
                      <Badge className={cn('shrink-0 border text-[10px]', severity.className)}>{severity.label}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{getAlarmDescription(alarm)}</p>
                    {alarm?.action || alarm?.suggestion ? (
                      <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
                        {alarm.action || alarm.suggestion}
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function BitacoraDialog({ open, onOpenChange, entries, groups, currentPublic }) {
  const hasReportGroups = groups.length > 1 || groups.some((group) => group.label !== 'Bitácora global');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent overlayClassName="!z-[10060]" className="!z-[10070] max-h-[82vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name="ClipboardList" size={18} className="text-primary" />
            Bitácora operativa
          </DialogTitle>
          <DialogDescription>
            {currentPublic} · consulta de comentarios y observaciones disponibles en el expediente.
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-border bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
          {hasReportGroups
            ? 'Se detectaron grupos por informe en el payload recibido. La creación o edición de varias bitácoras por informe queda pendiente del contrato backend.'
            : 'El backend actual solo expone una bitácora global o campos embebidos; no hay CRUD real por informe en esta iteración.'}
        </div>

        <ScrollArea className="max-h-[58vh]">
          <div className="space-y-5 p-6">
            {entries.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/70 p-5 text-sm text-muted-foreground">
                Sin comentarios profesionales registrados para este expediente.
              </div>
            ) : (
              groups.map((group) => (
                <section key={group.label} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{group.label}</h4>
                    <Badge variant="outline" className="text-[10px]">{group.items.length} entrada{group.items.length !== 1 ? 's' : ''}</Badge>
                  </div>
                  <div className="space-y-3">
                    {group.items.map((entry) => (
                      <article key={entry.id} className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                              <Icon name="MessageSquareText" size={14} />
                            </span>
                            <p className="truncate text-sm font-semibold text-foreground">{entry.author}</p>
                          </div>
                          {entry.date ? <span className="shrink-0 text-xs text-muted-foreground">{formatDisplayDate(entry.date)}</span> : null}
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{entry.note}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function renderModuleContent(activeSection, moduleProps, options = {}) {
  const { isPropertyHorizontal = false, isSubdivision = false, expediente } = options;

  switch (activeSection) {
    case 'detalles':
      return <FUNG {...moduleProps} onDuplicateSuccess={() => {}} />;
    case 'tiempos':
      return <FUNCLOCK {...moduleProps} />;
    case 'actualizar':
      return <FUNN {...moduleProps} />;
    case 'chequeo':
      return <FUNC {...moduleProps} closeModal={moduleProps.closeModal} />;
    case 'documentos':
      return <FUND {...moduleProps} />;
    case 'documentos-new':
      return <FUN_DOCUMENTAL_NEW {...moduleProps} />;
    case 'publicidad':
      return <FUN_ALERT {...moduleProps} />;
    case 'ph':
      return <RECORD_PH {...moduleProps} />;
    case 'arquitectonico':
      return isSubdivision
        ? <SUBDIVISION_ARCHITECTURE_REPORT {...moduleProps} expediente={expediente} />
        : <RECORD_ARC {...moduleProps} />;
    case 'estructural':
      return <RECORD_ENG {...moduleProps} />;
    case 'juridico':
      return <RECORD_LAW {...moduleProps} />;
    case 'acta':
      return <RECORD_REVIEW {...moduleProps} />;
    case 'expedicion':
      if (isPropertyHorizontal) {
        return <RECORD_PH {...moduleProps} />;
      }
      return <EXPEDITION {...moduleProps} />;
    default:
      return <FUNG {...moduleProps} onDuplicateSuccess={() => {}} />;
  }
}

function normalizeInitialSection(section, report, isPropertyHorizontal = false) {
  if (section === 'informes') {
    if (isPropertyHorizontal) {
      return 'ph';
    }

    const normalizedReport = normalizeInitialReport(report);
    return normalizedReport === 'ph' ? 'juridico' : normalizedReport;
  }

  if (isPropertyHorizontal && (section === 'ph' || STANDARD_REPORT_ITEMS.some((item) => item.id === section))) {
    return 'ph';
  }

  if (!isPropertyHorizontal && section === 'ph') {
    return 'juridico';
  }

  return EXPEDIENTE_SECTION_IDS.includes(section) ? section : 'detalles';
}

function normalizeInitialReport(report) {
  return REPORT_ITEMS.some((item) => item.id === report) ? report : 'juridico';
}

export function FunExpedienteFullscreen({
  expediente,
  translation,
  globals,
  swaMsg,
  onClose,
  onRefresh,
  initialSection = 'detalles',
  initialReport = 'juridico',
  defaultRightPanelOpen,
  onSectionChange,
}) {
  const initialIsPropertyHorizontal = isPropertyHorizontalExpediente(expediente, getExpedienteVersion(expediente));
  const normalizedInitialSection = useMemo(
    () => normalizeInitialSection(initialSection, initialReport, initialIsPropertyHorizontal),
    [initialIsPropertyHorizontal, initialReport, initialSection]
  );
  const resolvedDefaultRightPanelOpen = defaultRightPanelOpen ?? isBinnaclePanelDefaultOpen(normalizedInitialSection);
  const [summary, setSummary] = useState(expediente);
  const [activeSection, setActiveSection] = useState(normalizedInitialSection);
  const [currentId, setCurrentId] = useState(getExpedienteId(expediente));
  const [currentVersion, setCurrentVersion] = useState(getExpedienteVersion(expediente));
  const [currentPublic, setCurrentPublic] = useState(getExpedienteRadicado(expediente));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [navSheetOpen, setNavSheetOpen] = useState(false);
  const { collapsed: navCollapsed, toggleCollapsed: toggleNavCollapsed } = useExpedienteNavCollapsed();
  const isWideViewport = useIsWideViewport();
  const [rightPanelOpen, setRightPanelOpen] = useState(defaultRightPanelOpen);
  // Binnacles open either docked in the right column (reports default) or as a floating chat window.
  const [binnacleFloating, setBinnacleFloating] = useState(false);
  const { items: dockItems } = useExpedienteDock();
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [bitacoraDialogOpen, setBitacoraDialogOpen] = useState(false);
  const [liveLegalSummary, setLiveLegalSummary] = useState(null);
  const [legalGuide, setLegalGuide] = useState(null);
  const [legalGuideLoading, setLegalGuideLoading] = useState(false);
  const seededLegalSummary = useMemo(
    () => (hasSeededLegalSummary(summary, currentPublic) ? summary : null),
    [currentPublic, summary]
  );

  const { alarms } = useAlarms({
    enabled: alertsDialogOpen || activeSection === 'tiempos',
    includeAttended: true,
    includeHidden: true,
  });
  const {
    bookmarks,
    error: bookmarkError,
    setScope: setBookmarkScope,
  } = useBookmarks({ enabled: false });

  useEffect(() => {
    setSummary(expediente);
    setLiveLegalSummary(null);
    setLegalGuide(null);
    setCurrentId(getExpedienteId(expediente));
    setCurrentVersion(getExpedienteVersion(expediente));
    setCurrentPublic(getExpedienteRadicado(expediente));
  }, [expediente]);

  useEffect(() => {
    setActiveSection(normalizedInitialSection);
  }, [normalizedInitialSection]);

  useEffect(() => {
    setRightPanelOpen(resolvedDefaultRightPanelOpen);
    setBinnacleFloating(false);
  }, [resolvedDefaultRightPanelOpen]);

  const activateSection = useCallback((nextSection) => {
    setActiveSection(nextSection);
    setRightPanelOpen(isBinnaclePanelDefaultOpen(nextSection));
    setBinnacleFloating(false);
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    if (currentPublic) {
      document.title = `${currentPublic} · DOVELA`;
    }

    return () => {
      document.title = previousTitle;
    };
  }, [currentPublic]);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.classList.add('workspace-fullscreen-open');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.classList.remove('workspace-fullscreen-open');
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    if (!currentPublic || currentPublic === 'Sin radicado') {
      setLiveLegalSummary(null);
      return undefined;
    }

    if (seededLegalSummary) {
      setLiveLegalSummary((prev) => prev ?? seededLegalSummary);
      return undefined;
    }

    FUNService.getSummaryByIdPublic(currentPublic)
      .then((response) => {
        if (ignore) return;
        setLiveLegalSummary(response?.data?.data ?? response?.data ?? null);
      })
      .catch((error) => {
        if (!ignore && error?.response?.status !== 404) {
          console.warn('No fue posible cargar el resumen legal individual.', error);
        }
        if (!ignore) setLiveLegalSummary(null);
      });

    return () => {
      ignore = true;
    };
  }, [currentPublic, seededLegalSummary]);

  const refreshSummary = useCallback(
    async (radicadoOverride) => {
      const radicado = radicadoOverride ?? currentPublic;
      if (!radicado) {
        return;
      }

      setIsRefreshing(true);
      try {
        const [detailResult, summaryResult] = await Promise.allSettled([
          FUNService.get_fun_IdPublic(radicado),
          FUNService.getSummaryByIdPublic(radicado),
        ]);

        const detailData = detailResult.status === 'fulfilled'
          ? detailResult.value?.data?.data ?? detailResult.value?.data ?? null
          : null;
        const summaryData = summaryResult.status === 'fulfilled'
          ? summaryResult.value?.data?.data ?? summaryResult.value?.data ?? null
          : null;
        const nextData = detailData || summaryData;

        if (summaryData) {
          setLiveLegalSummary(summaryData);
        }

        if (nextData) {
          setSummary((prev) => mergeExpedienteSummary(prev, nextData));
          setCurrentId(getExpedienteId(nextData));
          setCurrentVersion(getExpedienteVersion(nextData));
          setCurrentPublic(getExpedienteRadicado(nextData));
        } else {
          setSummary((prev) => mergeLegalSummary(prev, null));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [currentPublic]
  );

  const requestUpdate = useCallback(
    async (id) => {
      const targetId = id ?? currentId;
      if (!targetId) {
        return;
      }

      try {
        const response = await FUNService.get(targetId);
        const data = response?.data ?? null;
        const radicado = data?.id_public ?? currentPublic;

        if (data) {
          setCurrentId(data.id ?? targetId);
          setCurrentVersion(getExpedienteVersion(data));
          setCurrentPublic(radicado);
        }

        await refreshSummary(radicado);
        await Promise.resolve(onRefresh?.());
      } catch (error) {
        console.error(error);
      }
    },
    [currentId, currentPublic, onRefresh, refreshSummary]
  );

  const handleLegacyNavigation = useCallback((item, nextSection) => {
    if (item) {
      setCurrentId(getExpedienteId(item));
      setCurrentVersion(getExpedienteVersion(item));
      setCurrentPublic(getExpedienteRadicado(item));
      setSummary((prev) => mergeExpedienteSummary(prev, item));
    }

    switch (nextSection) {
      case 'general':
        activateSection('detalles');
        break;
      case 'edit':
        activateSection('actualizar');
        break;
      case 'check':
        activateSection('chequeo');
        break;
      case 'clock':
        activateSection('tiempos');
        break;
      case 'archive':
        activateSection('documentos');
        break;
      case 'alert':
        activateSection('publicidad');
        break;
      case 'record_law':
        activateSection('juridico');
        break;
      case 'record_arc':
        activateSection('arquitectonico');
        break;
      case 'record_eng':
        activateSection('estructural');
        break;
      case 'record_ph':
        activateSection('ph');
        break;
      case 'record_review':
        activateSection('acta');
        break;
      case 'expedition':
        activateSection('expedicion');
        break;
      default:
        break;
    }
  }, [activateSection]);

  const handleVersionNavigation = useCallback((step) => {
    setCurrentVersion((prev) => {
      if (step === 'minus') {
        return Math.max(1, prev - 1);
      }
      if (step === 'plus') {
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const handleSectionChange = useCallback((nextSection) => {
    activateSection(nextSection);
  }, [activateSection]);

  const bitacoraEntries = useMemo(() => normalizeBitacoraEntries(summary), [summary]);
  const bitacoraGroups = useMemo(() => getBitacoraGroups(bitacoraEntries), [bitacoraEntries]);
  const legalSummary = useMemo(() => mergeLegalSummary(summary, liveLegalSummary), [liveLegalSummary, summary]);
  const currentPhaseCode = normalizePhaseCode(legalSummary?.fase_actual);
  const shouldLoadLegalGuide = false;
  const summaryStatus = getSummaryStatusMeta(legalSummary?.status);
  const usedDays = toSafeNumber(legalSummary?.dias_habiles_usados);
  const limitDays = toSafeNumber(legalSummary?.dias_habiles_limite);
  const progressPercent = getProgressPercent(legalSummary, usedDays, limitDays);
  const remainingDays = limitDays > 0 ? Math.max(limitDays - usedDays, 0) : null;
  const termMeta = getTermMeta({ summary: legalSummary, usedDays, limitDays, remainingDays });
  useEffect(() => {
    let ignore = false;

    if (!shouldLoadLegalGuide) {
      setLegalGuide(null);
      setLegalGuideLoading(false);
      return undefined;
    }

    setLegalGuideLoading(true);
    legalGuideService.getByPhase(currentPhaseCode)
      .then((response) => {
        if (!ignore) setLegalGuide(response?.data?.data ?? response?.data ?? null);
      })
      .catch((error) => {
        if (!ignore && ![401, 403, 404].includes(error?.response?.status)) {
          console.warn('No fue posible cargar la guía legal de esta fase.', error);
        }
        if (!ignore) setLegalGuide(null);
      })
      .finally(() => {
        if (!ignore) setLegalGuideLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [currentPhaseCode, shouldLoadLegalGuide]);

  const currentAlarms = useMemo(
    () => (alarms || []).filter((alarm) => {
      const alarmFunId = alarm.fun0Id ?? alarm.fun_0_id ?? alarm.fun0?.id ?? null;
      const alarmPublic = alarm.radicado ?? alarm.id_public ?? alarm.fun0?.id_public ?? null;
      const hasFunMatch = alarmFunId != null && currentId != null && String(alarmFunId) === String(currentId);
      const hasPublicMatch = Boolean(alarmPublic && currentPublic && currentPublic !== 'Sin radicado' && String(alarmPublic) === String(currentPublic));
      const belongsToExpediente = hasFunMatch || hasPublicMatch;
      return belongsToExpediente && !alarm.attendedAt && !alarm.hiddenAt;
    }),
    [alarms, currentId, currentPublic]
  );
  const binnaclePanelItem = useMemo(
    () => ({ ...(summary || {}), id: currentId ?? summary?.id, id_public: currentPublic ?? summary?.id_public, version: currentVersion }),
    [currentId, currentPublic, currentVersion, summary]
  );
  const recentActivity = useMemo(
    () => deriveRecentActivity({ summary: legalSummary, alarms: currentAlarms, bitacoraEntries }),
    [bitacoraEntries, currentAlarms, legalSummary]
  );

  const bookmarkState = useMemo(() => {
    const serverState = createBookmarkState(summary?.isBookmarked);
    const matchedBookmarks = (bookmarks || []).filter((bookmark) => String(getBookmarkExpedienteId(bookmark)) === String(currentId));
    const clientState = createBookmarkState({
      personal: matchedBookmarks.some((bookmark) => bookmark.scope === 'personal' || bookmark.scope === 'user'),
      team: matchedBookmarks.some((bookmark) => bookmark.scope === 'team'),
    });

    return mergeBookmarkState(serverState, clientState);
  }, [bookmarks, currentId, summary?.isBookmarked]);

  const handleToggleBookmarkScope = useCallback(
    async (scope, shouldMark) => {
      if (!currentId) return;
      await setBookmarkScope(currentId, scope, shouldMark);
      await refreshSummary();
    },
    [currentId, refreshSummary, setBookmarkScope]
  );

  const noop = useCallback(() => {}, []);

  const moduleProps = useMemo(
    () => ({
      translation,
      globals,
      swaMsg,
      currentId,
      currentPublic,
      currentVersion,
      canManage: isEditableLegacyExpediente(summary),
      requestUpdate,
      requesRefresh: () => requestUpdate(currentId),
      closeModal: noop,
      NAVIGATION: handleLegacyNavigation,
      NAVIGATION_VERSION: handleVersionNavigation,
      hideInlineBinnacles: true,
    }),
    [currentId, currentPublic, currentVersion, globals, handleLegacyNavigation, handleVersionNavigation, noop, requestUpdate, summary, swaMsg, translation]
  );

  const visibleSectionGroups = useMemo(
    () => getVisibleSectionGroups(summary, currentVersion),
    [currentVersion, summary]
  );

  const isPropertyHorizontal = useMemo(
    () => isPropertyHorizontalExpediente(summary, currentVersion),
    [currentVersion, summary]
  );

  const isSubdivision = useMemo(
    () => isSubdivisionExpediente(summary, currentVersion),
    [currentVersion, summary]
  );

  const visibleSectionIds = useMemo(
    () => visibleSectionGroups.flatMap((group) => group.items.map((item) => item.id)),
    [visibleSectionGroups]
  );

  useEffect(() => {
    if (visibleSectionIds.includes(activeSection)) {
      return;
    }

    if (isPropertyHorizontal && ['juridico', 'arquitectonico', 'estructural'].includes(activeSection)) {
      setActiveSection('ph');
      return;
    }

    if (!isPropertyHorizontal && activeSection === 'ph') {
      setActiveSection('juridico');
      return;
    }

    setActiveSection('detalles');
  }, [activeSection, isPropertyHorizontal, visibleSectionIds]);

  useEffect(() => {
    if (activeSection !== 'expedicion' || !isPropertyHorizontal) {
      return undefined;
    }

    const scrollToApprovalSection = () => {
      document.getElementById('record_ph_3')?.scrollIntoView({ block: 'start' });
    };

    if (typeof window.requestAnimationFrame === 'function') {
      const frame = window.requestAnimationFrame(scrollToApprovalSection);
      return () => window.cancelAnimationFrame(frame);
    }

    const timeout = window.setTimeout(scrollToApprovalSection, 0);
    return () => window.clearTimeout(timeout);
  }, [activeSection, isPropertyHorizontal]);

  // Keep `?section=` in sync with the active module (replace: no extra history entries).
  const onSectionChangeRef = useRef(onSectionChange);
  onSectionChangeRef.current = onSectionChange;
  useEffect(() => {
    onSectionChangeRef.current?.(activeSection);
  }, [activeSection]);

  // Dock integration: the workspace owns its radicado while open; a quick window of
  // the same expediente is minimized so the two views never overlap.
  const hasDockableRadicado = Boolean(currentPublic && currentPublic !== 'Sin radicado');
  useEffect(() => {
    if (!hasDockableRadicado) return undefined;
    setActiveWorkspace(currentPublic);
    minimizeDockWindow(currentPublic);
    return () => setActiveWorkspace(null);
  }, [currentPublic, hasDockableRadicado]);

  useEffect(() => {
    if (isWideViewport) setNavSheetOpen(false);
  }, [isWideViewport]);

  const handleMinimizeToWindow = useCallback(() => {
    if (hasDockableRadicado) addToDock(currentPublic, { open: true });
    onClose?.();
  }, [currentPublic, hasDockableRadicado, onClose]);

  const handleNavSelect = useCallback((nextSection) => {
    handleSectionChange(nextSection);
    setNavSheetOpen(false);
  }, [handleSectionChange]);

  const activeNavEntry = findNavSection(visibleSectionGroups, activeSection);
  const activeTone = NAV_TONE_CLASSES[activeNavEntry?.group.tone] || NAV_TONE_CLASSES.sky;
  const navIdentity = {
    radicado: currentPublic,
    version: currentVersion,
    typeLabel: isPropertyHorizontal
      ? 'Propiedad horizontal'
      : legalSummary?.categoria ? `Categoría ${legalSummary.categoria}` : null,
    statusLabel: summaryStatus.label,
    statusClass: summaryStatus.badgeClass,
    statusTone: summaryStatus.tone,
    barClass: summaryStatus.barClass,
    remainingDays,
    progressPercent,
  };

  const moduleContent = renderModuleContent(activeSection, moduleProps, { isPropertyHorizontal, isSubdivision, expediente: binnaclePanelItem });

  const binnacleDocked = rightPanelOpen && !binnacleFloating;
  const binnacleFloatingOpen = rightPanelOpen && binnacleFloating;
  const binnacleStack = (
    <RecordsBinnacleStack
      translation={translation}
      swaMsg={swaMsg}
      globals={globals}
      currentItem={binnaclePanelItem}
      currentVersion={currentVersion}
      activeSection={activeSection}
      requestUpdateRecord={requestUpdate}
      compact
    />
  );

  const content = (
    <div
      className={cn('expediente-fullscreen fixed inset-0 flex overflow-hidden bg-background text-foreground', Z_CLASS.workspace)}
      role="dialog"
      aria-modal="true"
      aria-label="Detalle del expediente"
    >
      <TooltipProvider delayDuration={200}>
        {isWideViewport ? (
          <ExpedienteSideNav
            groups={visibleSectionGroups}
            activeSection={activeSection}
            onSelect={handleNavSelect}
            identity={navIdentity}
            header={<ExpedienteAppSwitcher currentRadicado={currentPublic} collapsed={navCollapsed} />}
            collapsed={navCollapsed}
            onToggleCollapsed={toggleNavCollapsed}
          />
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* ── Top bar: breadcrumb + actions ───────────────────────────── */}
          <header className="shrink-0 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex h-14 items-center gap-2 px-2 sm:px-3">
              {!isWideViewport ? (
                <TopBarIconButton label="Abrir menú del expediente" onClick={() => setNavSheetOpen(true)} aria-expanded={navSheetOpen}>
                  <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
                </TopBarIconButton>
              ) : null}
              <TopBarIconButton label="Volver" onClick={onClose}>
                <Icon name="ArrowLeft" size={16} />
              </TopBarIconButton>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className={cn('size-2 shrink-0 rounded-full', activeTone.dot)} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="m-0 flex min-w-0 items-center gap-1.5 text-[11px] leading-tight text-muted-foreground">
                    {/* On wide screens the side nav already shows the radicado; the breadcrumb keeps only the group. */}
                    {!isWideViewport ? <span className="truncate font-mono">{currentPublic}</span> : null}
                    {activeNavEntry ? (
                      <>
                        {!isWideViewport ? <span aria-hidden="true">/</span> : null}
                        <span className="truncate">{activeNavEntry.group.label}</span>
                      </>
                    ) : null}
                  </p>
                  <h1 className="m-0 truncate text-[15px] font-semibold leading-tight tracking-tight text-foreground">
                    {activeNavEntry?.item.ariaLabel || activeNavEntry?.item.label || 'Expediente'}
                  </h1>
                </div>
                {!isWideViewport ? (
                  <Badge className={cn('hidden shrink-0 border text-[10px] font-semibold sm:inline-flex', summaryStatus.badgeClass)}>
                    {summaryStatus.label}
                  </Badge>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <TopBarIconButton label="Abrir otro expediente en ventana" onClick={() => setDockSearchOpen(true)} className="hidden sm:inline-flex">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </TopBarIconButton>
                <TopBarIconButton label="Minimizar a ventana" onClick={handleMinimizeToWindow} disabled={!hasDockableRadicado} className="hidden sm:inline-flex">
                  <AppWindow className="h-4 w-4" aria-hidden="true" />
                </TopBarIconButton>
                <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
                <BookmarkQuickMenu
                  rowId={currentId || currentPublic || 'actual'}
                  bookmarkState={bookmarkState}
                  triggerClassName="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  triggerTestIdPrefix="fullscreen-bookmark-menu-trigger"
                  menuTestIdPrefix="fullscreen-bookmark-menu"
                  align="end"
                  disabled={!currentId}
                  onToggleScope={handleToggleBookmarkScope}
                />
                {bookmarkError ? (
                  <span title="No se pudieron sincronizar los marcajes" className="inline-flex h-8 w-6 items-center justify-center text-warning">
                    <Icon name="AlertCircle" size={13} />
                  </span>
                ) : null}
                <TopBarIconButton label="Recargar expediente" onClick={() => refreshSummary()} disabled={isRefreshing} className="hidden sm:inline-flex">
                  <Icon name="RefreshCw" size={15} className={cn(isRefreshing && 'animate-spin')} />
                </TopBarIconButton>
                <TopBarIconButton label="Alertas del expediente" onClick={() => setAlertsDialogOpen(true)}>
                  <BellRing className="h-4 w-4" aria-hidden="true" />
                  {currentAlarms.length ? (
                    <span className="absolute right-1 top-1 inline-flex min-w-[14px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold leading-[14px] text-destructive-foreground">
                      {currentAlarms.length}
                    </span>
                  ) : null}
                </TopBarIconButton>
                <TopBarIconButton label="Bitácora del expediente" onClick={() => setBitacoraDialogOpen(true)} className="hidden sm:inline-flex">
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                </TopBarIconButton>
                <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
                <TopBarIconButton
                  label={headerExpanded ? 'Ocultar resumen del expediente' : 'Ver resumen del expediente'}
                  onClick={() => setHeaderExpanded((value) => !value)}
                  aria-expanded={headerExpanded}
                  active={headerExpanded}
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform duration-200 motion-reduce:transition-none', headerExpanded && 'rotate-180')} aria-hidden="true" />
                </TopBarIconButton>
                <TopBarIconButton
                  label={rightPanelOpen ? 'Ocultar panel de bitácoras' : 'Mostrar panel de bitácoras'}
                  onClick={() => {
                    setBinnacleFloating(false);
                    setRightPanelOpen((value) => !value);
                  }}
                  aria-expanded={rightPanelOpen}
                  active={rightPanelOpen}
                  className="hidden sm:inline-flex"
                >
                  {rightPanelOpen
                    ? <PanelRightClose className="h-4 w-4" aria-hidden="true" />
                    : <PanelRightOpen className="h-4 w-4" aria-hidden="true" />}
                </TopBarIconButton>
                <TopBarIconButton label="Cerrar" onClick={onClose}>
                  <Icon name="X" size={16} />
                </TopBarIconButton>
              </div>
            </div>
            {/* Thin legal-term progress line when the side nav (which carries the term bar) is off-canvas */}
            <div className={cn('h-0.5 w-full bg-muted', isWideViewport && 'hidden')}>
              <div
                className={cn('h-full transition-[width] duration-300 motion-reduce:transition-none', summaryStatus.barClass)}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </header>

          {/* ── Work area ───────────────────────────────────────────────── */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className={cn('flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-muted/30 transition-[max-width] duration-200', binnacleDocked ? 'max-w-[calc(100%_-_20rem)]' : 'max-w-full')}>
              <ScrollArea className="min-w-0 flex-1">
                <div className="w-full min-w-0 space-y-4 p-3 pb-24 sm:p-5 sm:pb-24">
                  {headerExpanded ? (
                    <section
                      aria-label="Resumen del expediente"
                      className="grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4 xl:grid-cols-[minmax(0,1fr)_20rem]"
                    >
                      <div className="min-w-0">
                        <p className="m-0 mb-2 text-xs text-muted-foreground">
                          {legalSummary?.fase_label || 'Fase por confirmar'} ·{' '}
                          <span className="font-mono">{usedDays}/{limitDays || 0} días hábiles ({progressPercent}%)</span>
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <SummaryItem icon="User" label="Solicitante" value={getExpedienteApplicant(legalSummary)} />
                          <SummaryItem icon="Layers" label="Categoría" value={legalSummary?.categoria || legalSummary?.tipo || 'Sin categoría'} />
                          <SummaryItem icon="Calendar" label="Radicación" value={legalSummary?.fecha_radicacion || 'Sin fecha'} />
                          <SummaryItem icon="CalendarDays" label="Fecha límite" value={legalSummary?.fecha_limite || 'Sin fecha límite'} />
                        </div>
                      </div>
                      <LegalStatusCard
                        summary={legalSummary}
                        legalGuide={legalGuide}
                        legalGuideLoading={legalGuideLoading}
                        summaryStatus={summaryStatus}
                        termMeta={termMeta}
                        usedDays={usedDays}
                        limitDays={limitDays}
                        progressPercent={progressPercent}
                        remainingDays={remainingDays}
                      />
                    </section>
                  ) : null}

                  <div
                    className={cn(
                      'w-full min-w-0',
                      // The new documentary module brings its own surfaces (tab bar, notices, table card): no outer card.
                      activeSection === 'documentos-new'
                        ? null
                        : 'overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
                      activeSection === 'documentos-new'
                        ? 'p-0'
                        : activeSection === 'tiempos'
                        ? 'p-1 sm:p-2'
                        : activeSection === 'actualizar' || activeSection === 'publicidad'
                          ? 'p-2 sm:p-4'
                          : 'p-3 sm:p-5'
                    )}
                  >
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      {moduleContent}
                    </Suspense>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* ── Right binnacle panel (docked mode; toggled from the top bar) ─── */}
            {binnacleDocked ? (
              <aside aria-label="Bitácoras profesionales" className="flex w-[26rem] max-w-[38vw] shrink-0 flex-col overflow-hidden border-l border-border bg-card/50">
                <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border/60 bg-background/70 px-3">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <h2 className="m-0 flex-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Bitácoras profesionales</h2>
                  <TopBarIconButton label="Desacoplar bitácoras en ventana flotante" onClick={() => setBinnacleFloating(true)}>
                    <MessagesSquare className="h-4 w-4" aria-hidden="true" />
                  </TopBarIconButton>
                </div>
                <ScrollArea className="min-h-0 flex-1">
                  <div className="p-2.5">{binnacleStack}</div>
                </ScrollArea>
              </aside>
            ) : null}
          </div>
        </div>

        <ExpedienteBinnacleLauncher
          open={binnacleFloatingOpen}
          onToggle={() => {
            if (binnacleFloatingOpen) {
              setRightPanelOpen(false);
              return;
            }
            setBinnacleFloating(true);
            setRightPanelOpen(true);
          }}
          onDock={() => setBinnacleFloating(false)}
          subtitle={currentPublic}
          liftForDock={dockItems.length > 0}
          hideLauncher={binnacleDocked}
        >
          {binnacleFloatingOpen ? binnacleStack : null}
        </ExpedienteBinnacleLauncher>
      </TooltipProvider>

      {!isWideViewport ? (
        <Sheet open={navSheetOpen} onOpenChange={setNavSheetOpen}>
          <SheetContent side="left" className="flex w-[280px] max-w-[85vw] flex-col border-white/10 bg-sidebar p-0 text-sidebar-foreground sm:max-w-[280px] [&>button]:text-sidebar-foreground/70">
            <SheetTitle className="sr-only">Menú del expediente</SheetTitle>
            <SheetDescription className="sr-only">Módulos disponibles para {currentPublic}</SheetDescription>
            <ExpedienteSideNav
              variant="sheet"
              groups={visibleSectionGroups}
              activeSection={activeSection}
              onSelect={handleNavSelect}
              identity={navIdentity}
              header={<ExpedienteAppSwitcher currentRadicado={currentPublic} />}
              className="pt-8"
            />
          </SheetContent>
        </Sheet>
      ) : null}

      <AlertsDialog
        open={alertsDialogOpen}
        onOpenChange={setAlertsDialogOpen}
        alarms={currentAlarms}
        currentPublic={currentPublic}
      />
      <BitacoraDialog
        open={bitacoraDialogOpen}
        onOpenChange={setBitacoraDialogOpen}
        entries={bitacoraEntries}
        groups={bitacoraGroups}
        currentPublic={currentPublic}
      />
    </div>
  );

  return createPortal(content, document.body);
}

export default FunExpedienteFullscreen;
