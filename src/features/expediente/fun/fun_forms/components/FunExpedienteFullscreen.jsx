import React, { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BellRing,
  ClipboardList,
  ChevronsUpDown,
  Layers,
  Loader2,
  Minus,
  MoreHorizontal,
  Search,
  X,
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { Icon } from '@/shared/components/icon';
import { isOffCanvasTier, useShellTier } from '@/shared/hooks/use-mobile';
import { Z_CLASS } from '@/shared/lib/layers';
import { enterWorkspaceMode, useShellHeaderActionsSlot, useShellHeaderBreadcrumbSlot, useShellWorkspaceSlot } from '@/shared/lib/shellWorkspace';
import { cn } from '@/shared/lib/utils';
import { DovelaBadge } from '@/shared/dovela-ui';
import FUNService from '../../../api/fun.service';
import legalGuideService from '../../../api/legalGuide.service';
import { onClockWritten } from '../../../api/clockWriteEvents';
import { formatPhaseDate } from '../../../clocks/utils/phaseTerm';
import { useAlarms } from '../hooks/useAlarms';
import { BookmarkQuickMenu } from './BookmarkQuickMenu';
import { useBookmarks } from '../hooks/useBookmarks';
import { formsParser1, regexChecker_isOA_2 } from '../../../../../shared/config/customClasses/typeParse';
import RecordsBinnacleStack from '../../../records/RecordsBinnacleStack';
import { isBinnaclePanelDefaultOpen } from '../utils/expedienteWorkspaceRoute';
import { isSubdivisionExpediente, shouldUseStructuralReport } from '../utils/expedienteDomainRules.js';
import {
  EXPEDIENTE_NAV_GROUPS,
  EXPEDIENTE_SECTION_IDS,
  findNavSection,
  getExpedienteNavGroups,
  getFirstReportSection,
  getNavToneClasses,
} from '../../../workspace/expedienteNavConfig';
import { getShortRadicado } from '../../../workspace/expedienteStatus';
import { useExpedienteTerm } from '../../../workspace/useExpedienteTerm';
import { publishComputedTerm } from '../../../dock/computedTermStore';
import { ExpedienteHeaderBreadcrumb } from '../../../workspace/ExpedienteHeaderBreadcrumb';
import { ExpedienteSideNav } from '../../../workspace/ExpedienteSideNav';
import { ExpedienteTopNav } from '../../../workspace/ExpedienteTopNav';
import { ExpedienteWorkspaceContext } from '../../../workspace/ExpedienteWorkspaceContext';
import { useIsWideViewport, useNodeMinWidth, useNodeWidthFlags } from '../../../workspace/useExpedienteNavLayout';
import { addToDock, minimize as minimizeDockWindow, setActiveWorkspace, useExpedienteDock } from '../../../dock';
import { ExpedienteDockSwitcher } from '../../../dock/ExpedienteDockSwitcher';

// Trailing delay that coalesces a burst of clock writes into one detail reload.
const CLOCK_WRITE_REFRESH_DELAY_MS = 200;

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
  // Process finished with records left to register (workspace/expedientePendingStatus).
  pending: {
    label: 'Pendientes por registrar',
    description: 'El proceso finalizó; no corre ningún término legal.',
    icon: 'Hourglass',
    badgeClass: 'border-warning/30 bg-warning/10 text-warning',
    barClass: 'bg-warning/60',
  },
  finished: {
    label: 'Proceso cerrado',
    description: 'Todas las fases del trámite están completas.',
    icon: 'CheckCircle',
    badgeClass: 'border-accent/30 bg-accent/10 text-accent',
    barClass: 'bg-accent',
  },
  unknown: {
    label: 'Sin término calculado',
    description: 'Tiempos no tiene un término en curso para este expediente.',
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

function getFirstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
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

/**
 * Metadata of the expediente (applicant, category, dates) from the route payload and the
 * backend legal summary. The legal TERM never comes from here: it is computed by the
 * Tiempos engine (`useExpedienteTerm`), see `workspace/expedienteTerm`.
 */
function mergeLegalSummary(base, liveSummary) {
  return liveSummary ? { ...base, ...liveSummary } : base;
}

/** Icon and wording of the term box of the expanded summary, from the term view-model. */
function getTermMetaFromView(termView) {
  if (termView.pending) return TERM_META.pending;
  if (termView.status === 'FINALIZADO' || termView.status === 'DESISTIDO') return TERM_META.finished;
  if (termView.overdue) return TERM_META.overdue;
  if (!termView.known) return TERM_META.unknown;
  if (termView.status === 'PRONTO_A_VENCER') return TERM_META.critical;
  if (termView.status === 'PAUSADO') return TERM_META.warning;
  return TERM_META.stable;
}

const normalizePhaseLabel = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\bde\b/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/**
 * The backend suggestion is written for the phase the backend inferred. It is shown only
 * when that phase is the one Tiempos reports as current, so it never advises on another one.
 */
function getPhaseSuggestion(summary, termView) {
  const suggestion = summary?.sugerencia || summary?.suggestion || summary?.recomendacion;
  if (!suggestion || !termView.phaseTitle) return null;
  return normalizePhaseLabel(summary?.fase_label) === normalizePhaseLabel(termView.phaseTitle) ? suggestion : null;
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
  const isPropertyHorizontal = isPropertyHorizontalExpediente(expediente, version);
  return getExpedienteNavGroups({
    canEdit: isEditableLegacyExpediente(expediente),
    canShowPublicidad: canShowLegacyPublicidad(expediente, version),
    isPropertyHorizontal,
    // Subdivisión, P.H. and rule `x;1` have no structural report (expedienteDomainRules).
    hasStructuralReport: shouldUseStructuralReport(expediente, version, { isPropertyHorizontal }),
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

const TOP_BAR_TOOLTIP_CLASS = 'rounded-lg px-2.5 py-1 text-xs';
const TOP_BAR_BUTTON_CLASS = 'relative inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:bg-muted aria-expanded:text-foreground';
// Width (px) of the shell header from which each optional piece of the expediente
// identity fits next to the search and the window controls (the shell shows the search
// as a field from 1120px, `app/layouts/HeaderBar`; `trail` and `category` assume it).
const HEADER_MIN_WIDTH = Object.freeze({
  fullRadicado: 440,
  status: 520,
  version: 600,
  list: 700,
  fullTerm: 900,
  phase: 1180,
  trail: 1270,
  category: 1400,
});
// The binnacle panel docks beside the module only while the module keeps ~840px
// (panel 416 + gap 8); below that it opens over the work area instead.
const WORK_AREA_DOCKED_ASIDE_MIN_WIDTH = 1264;
// Shell event that opens the global search (kept as a literal: features do not import the shell).
const OPEN_SEARCH_EVENT = 'dovela:open-search';
// Window controls of the workspace header: one tight group of square ghost buttons.
const WINDOW_CONTROL_CLASS = 'relative inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:bg-muted aria-expanded:text-foreground';
const WINDOW_CLOSE_CLASS = 'hover:bg-destructive hover:text-destructive-foreground';
const TOUCH_CONTROL_CLASS = 'h-10 w-10';
const FLOATING_CARD_CLASS = 'rounded-2xl border border-border/70 bg-card shadow-[shadow:var(--elevation-floating)]';

/** Icon-only top bar button: accessible name + tooltip. */
function TopBarIconButton({ label, onClick, children, active = false, disabled = false, className, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(TOP_BAR_BUTTON_CLASS, 'w-8 text-muted-foreground', active && 'bg-muted text-foreground', className)}
          {...props}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className={TOP_BAR_TOOLTIP_CLASS}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Labeled top bar action (icon + text + optional counter). When the bar is narrow the
 * text hides and the tooltip carries the name; `label` is always the accessible name.
 */
function TopBarAction({ label, text, icon, showText = true, count = 0, className, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={count ? `${label}: ${count}` : label}
          className={cn(
            TOP_BAR_BUTTON_CLASS,
            'gap-1.5 text-[13px] font-medium',
            showText ? 'px-2 text-foreground' : 'w-8 text-muted-foreground',
            className,
          )}
          {...props}
        >
          <span className={cn('inline-flex shrink-0', showText && 'text-muted-foreground')}>{icon}</span>
          {showText ? <span>{text}</span> : null}
          {count ? (
            <span
              className={cn(
                'inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[10px] font-semibold leading-none text-destructive-foreground',
                !showText && 'absolute -right-0.5 -top-0.5',
              )}
              aria-hidden="true"
            >
              {count}
            </span>
          ) : null}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className={TOP_BAR_TOOLTIP_CLASS}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function TopBarDivider({ className }) {
  return <span className={cn('mx-1 h-5 w-px shrink-0 bg-border', className)} aria-hidden="true" />;
}

/**
 * Expanded summary: the legal term exactly as Tiempos states it (`termView`, see
 * workspace/expedienteTerm). Read-only.
 */
function LegalStatusCard({ summary, termView, legalGuide, legalGuideLoading }) {
  const termMeta = getTermMetaFromView(termView);
  const statusMeta = termView.statusMeta;
  const suggestion = getPhaseSuggestion(summary, termView);
  const guideTerm = getFirstValue(legalGuide?.terminoDias, legalGuide?.termino_dias);
  const guideActor = legalGuide?.actor;
  const guideNorm = legalGuide?.norma;
  const showsDays = termView.ratioText && !termView.pending;

  return (
    <SupportCard title="Estado y términos">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{termView.phaseTitle || 'Sin fase en curso'}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{termView.responsible || 'Responsable sin definir'}{guideActor ? ` · guía ${guideActor}` : ''}</p>
          </div>
          <Badge className={cn('shrink-0 border text-[10px] font-semibold', statusMeta.badgeClass)}>
            {statusMeta.label}
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
            {termView.known ? (
              <span className={cn('shrink-0 font-mono text-xs font-semibold', termView.overdue ? 'text-destructive' : 'text-foreground')}>{termView.shortText}</span>
            ) : null}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all duration-300', termMeta.barClass)}
              style={{ width: `${termView.barPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            {showsDays ? <span className="font-mono">{termView.usedDays}/{termView.totalDays} días hábiles</span> : <span>Sin término en curso</span>}
            <span className={cn('truncate', termView.overdue && 'font-semibold text-destructive')}>{termView.text}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg border border-border/70 bg-background/70 p-2">
            <p className="font-semibold uppercase tracking-[0.14em] text-muted-foreground">Límite legal</p>
            <p className="mt-0.5 truncate font-medium text-foreground">{termView.limitDate ? formatPhaseDate(termView.limitDate) : 'Sin fecha'}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/70 p-2">
            <p className="font-semibold uppercase tracking-[0.14em] text-muted-foreground">Fuente</p>
            <p className="mt-0.5 truncate font-medium text-foreground">Módulo Tiempos</p>
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

// Modules that lay out their own stack of floating cards on the page background
// instead of living inside the single module card (see the `data-layout='stack'`
// block of shared/styles/legacy-bridge.css).
const CARD_STACK_SECTIONS = new Set(['tiempos', 'detalles', 'documentos', 'actualizar', 'chequeo', 'publicidad', 'juridico', 'arquitectonico', 'estructural', 'ph', 'acta', 'expedicion']);

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
  const isCardStackSection = CARD_STACK_SECTIONS.has(activeSection);
  const [currentId, setCurrentId] = useState(getExpedienteId(expediente));
  const [currentVersion, setCurrentVersion] = useState(getExpedienteVersion(expediente));
  const [currentPublic, setCurrentPublic] = useState(getExpedienteRadicado(expediente));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [navSheetOpen, setNavSheetOpen] = useState(false);
  const isWideViewport = useIsWideViewport();
  // One subscription per field: a slot registering does not re-render for the others.
  const shellSlot = useShellWorkspaceSlot();
  const headerBreadcrumbSlot = useShellHeaderBreadcrumbSlot();
  const headerActionsSlot = useShellHeaderActionsSlot();
  // Portal target: once a shell slot has been seen in this mount it is kept even if the
  // store reports null transiently, so the whole workspace is never remounted onto <body>.
  const seenShellSlotRef = useRef(null);
  if (shellSlot) seenShellSlotRef.current = shellSlot;
  const portalSlot = shellSlot || seenShellSlotRef.current;
  // Density follows the real header width (it changes with the app sidebar), not the
  // viewport: the shell header when there is one, the self-contained bar otherwise.
  const [localBar, setLocalBar] = useState(null);
  const shellHeader = useMemo(
    () => headerBreadcrumbSlot?.closest('header') || null,
    [headerBreadcrumbSlot]
  );
  // Booleans per threshold (not the pixel width): one re-render per crossing.
  const headerFits = useNodeWidthFlags(shellHeader || localBar, HEADER_MIN_WIDTH);
  // Shell tier (viewport): decides the off-canvas pieces and the 40px touch targets.
  const tier = useShellTier();
  const touchTier = isOffCanvasTier(tier);
  const mobileTier = tier === 'mobile';
  const [rightPanelOpen, setRightPanelOpen] = useState(defaultRightPanelOpen);
  // Binnacle panel: docked beside the module while there is room; otherwise it is an
  // overlay the user opens on demand (it never opens by itself over the module).
  const [workArea, setWorkArea] = useState(null);
  const asideDocked = useNodeMinWidth(workArea, WORK_AREA_DOCKED_ASIDE_MIN_WIDTH);
  const [asideOverlayOpen, setAsideOverlayOpen] = useState(false);
  // Crossing the docking width with the panel open keeps it open in its other form (docked
  // <-> overlay): the same panel instance stays mounted, so an unsaved binnacle draft is
  // not lost. The first measurement after mounting is not a crossing: the overlay never
  // opens by itself over the module.
  const dockSettledRef = useRef(false);
  useEffect(() => {
    if (!workArea) return undefined;
    const timeout = window.setTimeout(() => { dockSettledRef.current = true; }, 500);
    return () => window.clearTimeout(timeout);
  }, [workArea]);
  const [prevAsideDocked, setPrevAsideDocked] = useState(asideDocked);
  if (prevAsideDocked !== asideDocked) {
    setPrevAsideDocked(asideDocked);
    const wasVisible = prevAsideDocked ? Boolean(rightPanelOpen) : asideOverlayOpen;
    if (dockSettledRef.current && wasVisible) {
      if (asideDocked) setRightPanelOpen(true);
      else setAsideOverlayOpen(true);
    }
  }
  const asideRef = useRef(null);
  const contentRegionRef = useRef(null);
  const moreToolsRef = useRef(null);
  const windowMenuRef = useRef(null);
  const navSheetNavigated = useRef(false);
  const sectionsTriggerRef = useRef(null);
  const focusAsideOnMenuClose = useRef(false);
  const pendingSwitcherOpen = useRef(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
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
  }, [resolvedDefaultRightPanelOpen]);

  const activateSection = useCallback((nextSection) => {
    setActiveSection(nextSection);
    setRightPanelOpen(isBinnaclePanelDefaultOpen(nextSection));
    setAsideOverlayOpen(false);
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

  // Ask the app shell for the content area (header/footer hidden, sidebar as a rail).
  useLayoutEffect(() => enterWorkspaceMode(), []);

  // The body class is still the contract for legacy modals and floating widgets that
  // must stack above the workspace (legacy-modal.jsx, centralClocks.css).
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

  // Last expediente detail merged into `summary` (the clocks the header term is computed from).
  const lastAppliedDetailRef = useRef(null);
  // Every detail GET takes a ticket when it starts; a response is merged only if no later
  // GET was merged before it, so a response read before a write never overwrites a newer one.
  const detailTicketRef = useRef(0);
  const appliedDetailTicketRef = useRef(0);
  const currentPublicRef = useRef(currentPublic);
  currentPublicRef.current = currentPublic;
  // Clock-write reloads are coalesced (see the `onClockWritten` effect below).
  const clockRefreshTimerRef = useRef(null);
  const takeDetailTicket = () => {
    detailTicketRef.current += 1;
    return detailTicketRef.current;
  };
  const canApplyDetail = (ticket, data) => {
    if (!data || ticket < appliedDetailTicketRef.current) return false;
    appliedDetailTicketRef.current = ticket;
    if (data === lastAppliedDetailRef.current) return false;
    lastAppliedDetailRef.current = data;
    return true;
  };

  const refreshSummary = useCallback(
    async (radicadoOverride) => {
      const radicado = radicadoOverride ?? currentPublic;
      if (!radicado) {
        return;
      }

      setIsRefreshing(true);
      // A reload requested by a module follows a write: never join a GET started before it.
      const ticket = takeDetailTicket();
      if (radicado === currentPublicRef.current && clockRefreshTimerRef.current) {
        // This GET starts after the pending clock writes, so it already covers them.
        clearTimeout(clockRefreshTimerRef.current);
        clockRefreshTimerRef.current = null;
      }
      try {
        const [detailResult, summaryResult] = await Promise.allSettled([
          FUNService.get_fun_IdPublic(radicado, undefined, { force: true }),
          FUNService.getSummaryByIdPublic(radicado, undefined, { force: true }),
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
          // Merged once, and never over a detail read after this one started.
          if (detailData ? canApplyDetail(ticket, detailData) : ticket >= appliedDetailTicketRef.current) {
            setSummary((prev) => mergeExpedienteSummary(prev, nextData));
          }
          setCurrentId(getExpedienteId(nextData));
          setCurrentVersion(getExpedienteVersion(nextData));
          setCurrentPublic(getExpedienteRadicado(nextData));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [currentPublic]
  );

  // Latest `onRefresh` through a ref: an inline parent callback must not change the
  // identity of `requestUpdate` (and with it every module prop).
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const requestUpdate = useCallback(
    async (id) => {
      const targetId = id ?? currentId;
      if (!targetId) {
        return;
      }

      try {
        // Same expediente: its radicado is known and `refreshSummary` reloads the detail
        // (`GET /fun/get/idpublic`, which carries the same FUN_0 and clocks as `GET /fun/:id`),
        // so the extra `GET /fun/:id` is only needed to resolve another id.
        const knownPublic = currentPublic && currentPublic !== 'Sin radicado' ? currentPublic : null;
        let radicado = knownPublic;
        if (!knownPublic || currentId == null || String(targetId) !== String(currentId)) {
          const response = await FUNService.get(targetId);
          const data = response?.data ?? null;
          radicado = data?.id_public ?? currentPublic;

          if (data) {
            setCurrentId(data.id ?? targetId);
            setCurrentVersion(getExpedienteVersion(data));
            setCurrentPublic(radicado);
          }
        }

        await refreshSummary(radicado);
        await Promise.resolve(onRefreshRef.current?.());
      } catch (error) {
        console.error(error);
      }
    },
    [currentId, currentPublic, refreshSummary]
  );

  // Reloads only the expediente detail (its clocks), after clock writes made by modules that
  // do not notify the workspace. Always a fresh GET: joining one started before the write
  // would bring back the old term.
  const refreshDetail = useCallback(() => {
    const radicado = currentPublic;
    if (!radicado || radicado === 'Sin radicado') return Promise.resolve();
    const ticket = takeDetailTicket();
    return Promise.resolve()
      .then(() => FUNService.get_fun_IdPublic(radicado, undefined, { force: true }))
      .then((response) => {
        const data = response?.data?.data ?? response?.data ?? null;
        // The workspace may have switched to another expediente while this GET was pending.
        if (!data || getExpedienteRadicado(data) !== radicado || currentPublicRef.current !== radicado) return;
        if (!canApplyDetail(ticket, data)) return;
        setSummary((prev) => mergeExpedienteSummary(prev, data));
      })
      // The HTTP client already logs failed requests; the header keeps the last term.
      .catch(() => {});
  }, [currentPublic]);

  // Any clock written for this expediente (Tiempos, Chequeo, the discipline reviews, the
  // Tiempos table inside Jurídico, Expedición, ...) reloads the detail, so the header term
  // follows the change without a manual reload (api/clockWriteEvents). A burst of writes (a
  // batch save, a module writing several clocks) is coalesced into one trailing reload, and
  // a module reload (`requestUpdate`) started after the writes cancels it (it covers them).
  useEffect(() => {
    const unsubscribe = onClockWritten(({ fun0Id }) => {
      if (fun0Id != null && currentId != null && String(fun0Id) !== String(currentId)) return;
      if (clockRefreshTimerRef.current) clearTimeout(clockRefreshTimerRef.current);
      clockRefreshTimerRef.current = setTimeout(() => {
        clockRefreshTimerRef.current = null;
        refreshDetail();
      }, CLOCK_WRITE_REFRESH_DELAY_MS);
    });
    return () => {
      unsubscribe();
      if (clockRefreshTimerRef.current) clearTimeout(clockRefreshTimerRef.current);
      clockRefreshTimerRef.current = null;
    };
  }, [currentId, refreshDetail]);

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
  // Legal term: ONE source of truth, the Tiempos engine run on this expediente's clocks
  // (workspace/expedienteTerm). The header, the side nav and the expanded summary render
  // this view-model; the Tiempos strip renders the same selector. It is recomputed when a
  // refresh brings new clocks. The backend summary is never used for the term.
  const term = useExpedienteTerm(summary);
  const isPendingProcess = term.pending;
  const summaryStatus = term.statusMeta;
  const termRepeatsStatus = term.textRepeatsStatus;

  // "Expedientes abiertos" and the dock show this same value once the expediente is minimized.
  useEffect(() => {
    publishComputedTerm(currentPublic, term);
  }, [currentPublic, term]);

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
  const canManage = isEditableLegacyExpediente(summary);

  const moduleProps = useMemo(
    () => ({
      translation,
      globals,
      swaMsg,
      currentId,
      currentPublic,
      currentVersion,
      canManage,
      requestUpdate,
      requesRefresh: () => requestUpdate(currentId),
      closeModal: noop,
      NAVIGATION: handleLegacyNavigation,
      NAVIGATION_VERSION: handleVersionNavigation,
      hideInlineBinnacles: true,
    }),
    [canManage, currentId, currentPublic, currentVersion, globals, handleLegacyNavigation, handleVersionNavigation, noop, requestUpdate, swaMsg, translation]
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

    // A hidden report (e.g. `report=estructural` on a subdivisión) lands on the first visible one.
    const firstReport = getFirstReportSection(visibleSectionGroups);
    if (activeSection === 'estructural' && firstReport) {
      setActiveSection(firstReport);
      return;
    }

    setActiveSection('detalles');
  }, [activeSection, isPropertyHorizontal, visibleSectionGroups, visibleSectionIds]);

  useEffect(() => {
    if (activeSection !== 'expedicion' || !isPropertyHorizontal) {
      return undefined;
    }

    // [Expedición P.H.] The approval card is rendered by a lazy module after its data arrives, so it does not
    // exist yet on the first frame: wait for it (up to ~8 s) and land once it has settled. Any user
    // scroll/keyboard interaction cancels the pending landing.
    let cancelled = false;
    let timer = null;
    let attempts = 0;
    let lastTop = null;
    let stableReads = 0;
    const cancel = () => { cancelled = true; };
    const scrollToApprovalSection = () => {
      if (cancelled) return;
      attempts += 1;
      const target = document.getElementById('record_ph_3');
      if (target) {
        const top = Math.round(target.getBoundingClientRect().top);
        stableReads = top === lastTop ? stableReads + 1 : 0;
        lastTop = top;
        target.scrollIntoView({ block: 'start' });
        if (stableReads >= 2) return;
      }
      if (attempts < 40) timer = window.setTimeout(scrollToApprovalSection, 200);
    };
    const interactionEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'];
    interactionEvents.forEach((name) => window.addEventListener(name, cancel, { passive: true, once: true }));
    timer = window.setTimeout(scrollToApprovalSection, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      interactionEvents.forEach((name) => window.removeEventListener(name, cancel));
    };
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

  // After picking a module from a menu or the sheet, focus lands on the module region.
  const focusContentRegion = useCallback(() => {
    contentRegionRef.current?.focus?.({ preventScroll: true });
  }, []);

  const handleSheetNavSelect = useCallback((nextSection) => {
    navSheetNavigated.current = true;
    handleNavSelect(nextSection);
  }, [handleNavSelect]);

  const asideVisible = asideDocked ? Boolean(rightPanelOpen) : asideOverlayOpen;
  const toggleAside = useCallback(() => {
    if (asideDocked) {
      setRightPanelOpen((value) => !value);
      return;
    }
    focusAsideOnMenuClose.current = !asideOverlayOpen;
    setAsideOverlayOpen(!asideOverlayOpen);
  }, [asideDocked, asideOverlayOpen]);
  const closeAsideOverlay = useCallback(() => {
    setAsideOverlayOpen(false);
    moreToolsRef.current?.focus?.();
  }, []);

  // An open "Expedientes abiertos" popover never survives a tier change.
  useEffect(() => {
    setSwitcherOpen(false);
  }, [tier]);

  const { items: dockItems, activeWorkspace: dockActiveWorkspace } = useExpedienteDock();
  const otherOpenCount = dockItems.filter((item) => item.radicado !== dockActiveWorkspace).length;

  const activeNavEntry = findNavSection(visibleSectionGroups, activeSection);
  const categoryLabel = isPropertyHorizontal
    ? 'Propiedad horizontal'
    : legalSummary?.categoria ? `Categoría ${legalSummary.categoria}` : null;
  const termBarClass = term.overdue ? 'bg-destructive' : summaryStatus.barClass;
  const termDotClass = term.overdue ? 'bg-destructive' : summaryStatus.dotClass;
  const navIdentity = {
    radicado: currentPublic,
    version: currentVersion,
    typeLabel: categoryLabel,
    statusLabel: summaryStatus.label,
    statusClass: summaryStatus.badgeClass,
    barClass: termBarClass,
    remainingDays: term.remainingDays,
    progressPercent: Math.round(term.barPercent),
    termText: term.text,
    termShortText: term.shortText,
    termRatioText: term.ratioText || '—',
  };

  const showFullRadicado = headerFits.fullRadicado;
  const showVersion = headerFits.version;
  const showStatusBadge = headerFits.status;
  const showListCrumb = headerFits.list;
  const showTrail = headerFits.trail;
  const showFullTerm = headerFits.fullTerm;
  const showPhase = headerFits.phase && Boolean(term.phaseTitle) && !isPendingProcess;
  const showCategory = Boolean(categoryLabel) && headerFits.category;

  const inShell = Boolean(portalSlot);
  const activeTone = getNavToneClasses(activeNavEntry?.group.tone);
  const activeItemLabel = activeNavEntry?.item.ariaLabel || activeNavEntry?.item.label || 'Expediente';

  // Header content. Inside the shell it is portaled into the header card (breadcrumb
  // area and actions area); without a shell it fills the self-contained bar below.
  const headerBreadcrumb = (
    <ExpedienteHeaderBreadcrumb
      radicado={currentPublic}
      shortRadicado={showFullRadicado ? undefined : getShortRadicado(currentPublic)}
      onClose={onClose}
      showTrail={showTrail}
      showList={showListCrumb}
    >
      {showVersion ? (
        <span
          className="shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-none text-muted-foreground"
          aria-label={`Versión ${currentVersion}`}
        >
          v{currentVersion}
        </span>
      ) : null}
      {showStatusBadge ? (
        <DovelaBadge tone={summaryStatus.tone} className="shrink-0 whitespace-nowrap">
          <span className={cn('size-1.5 shrink-0 rounded-full', summaryStatus.dotClass)} aria-hidden="true" />
          {summaryStatus.label}
        </DovelaBadge>
      ) : null}
      {showCategory ? (
        <span className="shrink-0 truncate text-xs text-muted-foreground">{categoryLabel}</span>
      ) : null}
      {/* Legal term, display-only: plain text (no control, nothing editable). It is the
          Tiempos term (workspace/expedienteTerm); `title` explains the figures. */}
      {termRepeatsStatus && showStatusBadge ? null : showFullTerm ? (
        <div
          className="flex min-w-0 shrink-0 items-center gap-2 border-l border-border pl-2.5"
          title={term.description}
          data-testid="expediente-term-indicator"
          data-term-status={term.status}
        >
          {showPhase ? (
            <span className="max-w-[14rem] truncate text-xs text-muted-foreground" data-testid="expediente-term-phase">{term.phaseTitle}</span>
          ) : term.phaseTitle && !isPendingProcess ? (
            <span className="sr-only">Fase actual: {term.phaseTitle}.</span>
          ) : null}
          <span className={cn('whitespace-nowrap text-xs', term.overdue ? 'font-semibold text-destructive' : 'text-foreground/80')} data-testid="expediente-term-text">{term.text}</span>
          {isPendingProcess || !term.ratioText ? null : (
            <>
              <div
                className="h-1 w-16 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Avance del término legal"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(term.barPercent)}
                aria-valuetext={`${term.usedDays} de ${term.totalDays} días hábiles`}
              >
                <div
                  className={cn('h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none', termBarClass)}
                  style={{ width: `${term.barPercent}%` }}
                />
              </div>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground" data-testid="expediente-term-ratio">{term.ratioText}</span>
            </>
          )}
        </div>
      ) : (
        // Narrow headers keep the legal term visible as a compact figure. When the status
        // badge does not fit either, this one dot stands for the status too (no second dot).
        <span
          title={term.description}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1 font-mono text-[11px] font-semibold tabular-nums text-foreground"
          data-testid="expediente-term-indicator"
          data-term-status={term.status}
        >
          <span className={cn('size-1.5 shrink-0 rounded-full', termDotClass)} aria-hidden="true" />
          <span aria-hidden="true">{term.shortText}</span>
          <span className="sr-only">
            {[
              showStatusBadge || termRepeatsStatus ? null : `Estado: ${summaryStatus.label}.`,
              term.phaseTitle && !isPendingProcess ? `Fase actual: ${term.phaseTitle}.` : null,
              term.known ? `${term.text} (${term.usedDays} de ${term.totalDays} días hábiles)` : term.text,
            ].filter(Boolean).join(' ')}
          </span>
        </span>
      )}
    </ExpedienteHeaderBreadcrumb>
  );

  const controlSizeClass = touchTier ? TOUCH_CONTROL_CLASS : null;
  const menuItemClass = cn('cursor-pointer text-[13px]', touchTier && 'min-h-10');

  // Window controls, always the last thing in the header: open expedientes, minimize,
  // close. Phones keep "close" and fold the rest (and the search) into one menu.
  const windowControls = (
    <div key={tier} role="group" aria-label="Ventana del expediente" className="flex shrink-0 items-center gap-0.5" data-testid="expediente-window-controls">
      {mobileTier ? (
        <span className="relative inline-flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                ref={windowMenuRef}
                type="button"
                aria-label={otherOpenCount ? `Más opciones de ventana. Expedientes abiertos: ${otherOpenCount}` : 'Más opciones de ventana'}
                className={cn(WINDOW_CONTROL_CLASS, controlSizeClass)}
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
                {otherOpenCount ? (
                  <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold leading-none text-primary-foreground" aria-hidden="true">
                    {otherOpenCount}
                  </span>
                ) : null}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              collisionPadding={8}
              className="min-w-[14rem]"
              onCloseAutoFocus={(event) => {
                if (!pendingSwitcherOpen.current) return;
                // Open the popover once the menu is gone, so focus is not pulled back out of it.
                pendingSwitcherOpen.current = false;
                event.preventDefault();
                setSwitcherOpen(true);
              }}
            >
              <DropdownMenuItem
                className={menuItemClass}
                onSelect={() => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))}
              >
                <Search aria-hidden="true" />
                Buscar
              </DropdownMenuItem>
              <DropdownMenuItem className={menuItemClass} onSelect={() => { pendingSwitcherOpen.current = true; }}>
                <Layers aria-hidden="true" />
                Expedientes abiertos{otherOpenCount ? ` (${otherOpenCount})` : ''}
              </DropdownMenuItem>
              <DropdownMenuItem className={menuItemClass} disabled={!hasDockableRadicado} onSelect={handleMinimizeToWindow}>
                <Minus aria-hidden="true" />
                Minimizar expediente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ExpedienteDockSwitcher anchorOnly open={switcherOpen} onOpenChange={setSwitcherOpen} returnFocusRef={windowMenuRef} />
        </span>
      ) : (
        <>
          <ExpedienteDockSwitcher open={switcherOpen} onOpenChange={setSwitcherOpen} triggerClassName={controlSizeClass} />
          <TopBarIconButton
            label="Minimizar"
            onClick={handleMinimizeToWindow}
            disabled={!hasDockableRadicado}
            className={cn(WINDOW_CONTROL_CLASS, controlSizeClass)}
          >
            <Minus className="size-4" aria-hidden="true" />
          </TopBarIconButton>
        </>
      )}
      <TopBarIconButton
        label="Cerrar"
        onClick={onClose}
        className={cn(WINDOW_CONTROL_CLASS, WINDOW_CLOSE_CLASS, controlSizeClass)}
      >
        <X className="size-4" aria-hidden="true" />
      </TopBarIconButton>
    </div>
  );

  // Tools of the expediente, at the end of its nav card. `mode` comes from the card's
  // fit: 'labels' (Alertas and Bitácora with text), 'icons', or 'menu' (all inside "Más").
  const renderExpedienteTools = (mode) => {
    const collapsed = mode === 'menu';
    const showText = mode === 'labels';
    return (
      <div key={tier} role="group" aria-label="Herramientas del expediente" className="ml-auto flex shrink-0 items-center gap-0.5 pl-1" data-testid="expediente-tools" data-mode={mode}>
        {collapsed ? null : (
          <>
            <TopBarAction
              label="Alertas del expediente"
              text="Alertas"
              icon={<BellRing className="h-4 w-4" aria-hidden="true" />}
              showText={showText}
              count={currentAlarms.length}
              aria-haspopup="dialog"
              className={controlSizeClass && !showText ? 'h-10 w-10' : undefined}
              onClick={() => setAlertsDialogOpen(true)}
            />
            <TopBarAction
              label="Bitácora del expediente"
              text="Bitácora"
              icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
              showText={showText}
              aria-haspopup="dialog"
              className={controlSizeClass && !showText ? 'h-10 w-10' : undefined}
              onClick={() => setBitacoraDialogOpen(true)}
            />
            <BookmarkQuickMenu
              rowId={currentId || currentPublic || 'actual'}
              bookmarkState={bookmarkState}
              triggerClassName={cn(TOP_BAR_BUTTON_CLASS, 'w-8 text-muted-foreground', touchTier && 'h-10 w-10')}
              triggerTestIdPrefix="fullscreen-bookmark-menu-trigger"
              menuTestIdPrefix="fullscreen-bookmark-menu"
              align="end"
              disabled={!currentId}
              onToggleScope={handleToggleBookmarkScope}
            />
            {bookmarkError ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    role="img"
                    tabIndex={0}
                    aria-label="No se pudieron sincronizar los marcajes"
                    className="inline-flex h-8 w-6 items-center justify-center rounded-lg text-warning outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon name="AlertCircle" size={13} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6} className={TOP_BAR_TOOLTIP_CLASS}>
                  No se pudieron sincronizar los marcajes
                </TooltipContent>
              </Tooltip>
            ) : null}
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TopBarAction
              ref={moreToolsRef}
              label="Más acciones"
              text="Más"
              showText={false}
              count={collapsed ? currentAlarms.length : 0}
              aria-busy={isRefreshing || undefined}
              className={touchTier ? 'h-10 w-10' : undefined}
              icon={isRefreshing
                ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                : <MoreHorizontal className="h-4 w-4" aria-hidden="true" />}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={6}
            collisionPadding={8}
            className="min-w-[14rem]"
            onCloseAutoFocus={(event) => {
              if (!focusAsideOnMenuClose.current) return;
              // The overlay panel was just opened from this menu: focus goes into it.
              focusAsideOnMenuClose.current = false;
              event.preventDefault();
              asideRef.current?.focus?.({ preventScroll: true });
            }}
          >
            {collapsed ? (
              <>
                <DropdownMenuItem className={menuItemClass} onSelect={() => setAlertsDialogOpen(true)}>
                  <BellRing aria-hidden="true" />
                  Alertas{currentAlarms.length ? ` (${currentAlarms.length})` : ''}
                </DropdownMenuItem>
                <DropdownMenuItem className={menuItemClass} onSelect={() => setBitacoraDialogOpen(true)}>
                  <ClipboardList aria-hidden="true" />
                  Bitácora
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="py-1 text-xs font-medium text-muted-foreground">Destacar expediente</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  className={menuItemClass}
                  disabled={!currentId}
                  checked={Boolean(bookmarkState?.personal)}
                  onCheckedChange={(checked) => handleToggleBookmarkScope('personal', Boolean(checked))}
                >
                  Solo para mí
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className={menuItemClass}
                  disabled={!currentId}
                  checked={Boolean(bookmarkState?.team)}
                  onCheckedChange={(checked) => handleToggleBookmarkScope('team', Boolean(checked))}
                >
                  Para el equipo
                </DropdownMenuCheckboxItem>
                {bookmarkError ? (
                  <p className="m-0 flex items-center gap-2 px-2 py-1.5 text-xs text-warning" role="status">
                    <Icon name="AlertCircle" size={13} aria-hidden="true" />
                    No se pudieron sincronizar los marcajes
                  </p>
                ) : null}
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuCheckboxItem className={menuItemClass} checked={asideVisible} onCheckedChange={toggleAside}>
              Panel de bitácoras
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem className={menuItemClass} onSelect={() => setHeaderExpanded((value) => !value)}>
              <Icon name={headerExpanded ? 'ChevronUp' : 'ChevronDown'} size={15} aria-hidden="true" />
              {headerExpanded ? 'Ocultar resumen' : 'Mostrar resumen'}
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} disabled={isRefreshing} onSelect={() => { refreshSummary(); }}>
              <Icon name="RefreshCw" size={15} aria-hidden="true" />
              {isRefreshing ? 'Recargando…' : 'Recargar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // Stable element: workspace-only state (alarms poll, dialogs, header width, panels)
  // re-renders this component but React skips the module subtree while the element is the same.
  const moduleContent = useMemo(
    () => renderModuleContent(activeSection, moduleProps, { isPropertyHorizontal, isSubdivision, expediente: binnaclePanelItem }),
    [activeSection, binnaclePanelItem, isPropertyHorizontal, isSubdivision, moduleProps]
  );

  const content = (
    <section
      className={cn(
        'expediente-fullscreen flex min-h-0 flex-col overflow-hidden bg-background text-foreground',
        // Inside the app shell the workspace is a regular flex child of the content area;
        // without a shell it falls back to a fixed overlay.
        inShell ? 'min-w-0 flex-1' : cn('fixed inset-0', Z_CLASS.workspace),
      )}
      aria-label="Detalle del expediente"
      data-testid="expediente-workspace"
    >
      <TooltipProvider delayDuration={200}>
        {/* ── Header: shared with the shell (portals) or self-contained ─── */}
        {inShell ? (
          <>
            {headerBreadcrumbSlot ? createPortal(headerBreadcrumb, headerBreadcrumbSlot) : null}
            {headerActionsSlot ? createPortal(windowControls, headerActionsSlot) : null}
          </>
        ) : (
          <div className="shrink-0 px-2 pt-2">
            <header
              ref={setLocalBar}
              className={cn(FLOATING_CARD_CLASS, 'flex h-16 min-w-0 items-center gap-1.5 overflow-hidden px-2.5 short:h-12')}
            >
              <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden text-[13px]">
                {headerBreadcrumb}
              </nav>
              <TopBarDivider />
              {windowControls}
            </header>
          </div>
        )}

        {/* ── Section navigation: one floating card, a color per group ──── */}
        <div className="relative z-10 shrink-0 px-2 pt-2">
          <div
            className={cn(FLOATING_CARD_CLASS, 'flex h-12 min-w-0 items-center gap-1 px-1.5')}
            data-testid="expediente-nav-card"
          >
            {isWideViewport ? (
              <ExpedienteTopNav
                groups={visibleSectionGroups}
                activeSection={activeSection}
                onSelect={handleNavSelect}
                onNavigated={focusContentRegion}
                renderTools={renderExpedienteTools}
              />
            ) : (
              <>
                <button
                  ref={sectionsTriggerRef}
                  type="button"
                  onClick={() => setNavSheetOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={navSheetOpen}
                  aria-label={`Secciones del expediente: ${activeItemLabel}`}
                  data-testid="expediente-sections-trigger"
                  className={cn(
                    'flex h-10 min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border-0 pl-1.5 pr-2 text-[13px] font-semibold leading-none outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card',
                    activeTone.activeSurface,
                    activeTone.activeText,
                  )}
                >
                  {activeNavEntry ? (
                    <span className={cn('inline-flex h-5 shrink-0 items-center rounded-md px-1.5 text-[10px] font-bold uppercase leading-none tracking-[0.05em]', activeTone.chip)}>
                      {activeNavEntry.group.label}
                    </span>
                  ) : null}
                  {activeNavEntry ? <Icon name={activeNavEntry.item.icon} size={15} strokeWidth={2.2} aria-hidden="true" /> : null}
                  <span className="truncate">{activeItemLabel}</span>
                  <ChevronsUpDown className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
                </button>
                {renderExpedienteTools(mobileTier ? 'menu' : 'icons')}
              </>
            )}
          </div>
        </div>

        {/* ── Work area ───────────────────────────────────────────────── */}
        <div ref={setWorkArea} className="relative flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <ScrollArea className="min-w-0 flex-1">
              <div className="w-full min-w-0 space-y-2 p-2">
                {headerExpanded ? (
                  <section
                    aria-label="Resumen del expediente"
                    className="grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4 xl:grid-cols-[minmax(0,1fr)_20rem]"
                  >
                    <div className="min-w-0">
                      <p className="m-0 mb-2 text-xs text-muted-foreground">
                        {isPendingProcess || !term.phaseTitle ? term.text : (
                          <>
                            {term.phaseTitle} ·{' '}
                            <span className="font-mono">{term.usedDays}/{term.totalDays} días hábiles</span>{' · '}{term.text}
                          </>
                        )}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <SummaryItem icon="User" label="Solicitante" value={getExpedienteApplicant(legalSummary)} />
                        <SummaryItem icon="Layers" label="Categoría" value={legalSummary?.categoria || legalSummary?.tipo || 'Sin categoría'} />
                        <SummaryItem icon="Calendar" label="Radicación" value={legalSummary?.fecha_radicacion || 'Sin fecha'} />
                        <SummaryItem icon="CalendarDays" label="Límite legal de la fase" value={term.limitDate ? formatPhaseDate(term.limitDate) : 'Sin fecha límite'} />
                      </div>
                    </div>
                    <LegalStatusCard
                      summary={legalSummary}
                      termView={term}
                      legalGuide={legalGuide}
                      legalGuideLoading={legalGuideLoading}
                    />
                  </section>
                ) : null}

                {/* Card-stack modules lay out their own floating cards on the page background. */}
                <div
                  className={cn(
                    'w-full min-w-0',
                    !isCardStackSection && 'overflow-hidden rounded-2xl border border-border bg-card shadow-[shadow:var(--card-shadow)]',
                  )}
                >
                  {/* `expediente-workspace` scopes the legacy bridge (shared/styles/legacy-bridge.css).
                      The new documental module is token-native and stays out of it. */}
                  <div
                    ref={contentRegionRef}
                    role="region"
                    tabIndex={-1}
                    aria-label={activeItemLabel}
                    className={cn(
                      'min-w-0 outline-none',
                      activeSection !== 'documentos-new' && 'expediente-workspace',
                      isCardStackSection
                        ? 'p-0'
                        : 'p-3 sm:p-5'
                    )}
                    data-section={activeSection === 'expedicion' && isPropertyHorizontal ? 'ph' : activeSection}
                    data-layout={isCardStackSection && activeSection !== 'tiempos' ? 'stack' : undefined}
                  >
                    <ExpedienteWorkspaceContext.Provider value>
                      <Suspense fallback={<ModuleLoadingFallback />}>
                        {moduleContent}
                      </Suspense>
                    </ExpedienteWorkspaceContext.Provider>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* ── Right binnacle panel ("Más" > Panel de bitácoras): docked or overlay ── */}
          {asideVisible ? (
            <aside
              ref={asideRef}
              tabIndex={-1}
              aria-label="Bitácoras profesionales"
              data-docked={asideDocked ? 'true' : 'false'}
              onKeyDown={asideDocked ? undefined : (event) => {
                if (event.key !== 'Escape' || event.defaultPrevented) return;
                event.stopPropagation();
                closeAsideOverlay();
              }}
              className={cn(
                'flex w-[26rem] flex-col overflow-hidden rounded-2xl border border-border bg-card outline-none',
                asideDocked
                  ? 'my-2 mr-2 max-w-[38vw] shrink-0 shadow-[shadow:var(--card-shadow)]'
                  : 'absolute inset-y-2 right-2 z-30 max-w-[calc(100%-1rem)] shadow-[shadow:var(--elevation-bar)]',
              )}
            >
              <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border/60 px-3">
                <ClipboardList className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h2 className="m-0 min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Bitácoras profesionales</h2>
                {asideDocked ? null : (
                  <TopBarIconButton label="Cerrar panel de bitácoras" onClick={closeAsideOverlay} className={cn('-mr-1.5', controlSizeClass)}>
                    <X className="size-4" aria-hidden="true" />
                  </TopBarIconButton>
                )}
              </div>
              <ScrollArea className="min-h-0 flex-1">
                {/* Same legacy-bridge scope as the module area: the binnacle cards are Bootstrap markup. */}
                <div className="expediente-workspace p-2.5">
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
                </div>
              </ScrollArea>
            </aside>
          ) : null}
        </div>
      </TooltipProvider>

      {!isWideViewport ? (
        <Sheet open={navSheetOpen} onOpenChange={setNavSheetOpen}>
          <SheetContent
            side="left"
            className="flex w-[280px] max-w-[85vw] flex-col p-0 sm:max-w-[280px] [&>button]:right-2 [&>button]:top-2 [&>button]:flex [&>button]:h-10 [&>button]:w-10 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-lg"
            onCloseAutoFocus={(event) => {
              // The sheet has no Radix trigger, so focus is handed back here: to the module
              // after picking one, otherwise to the button that opened it.
              event.preventDefault();
              if (navSheetNavigated.current) {
                navSheetNavigated.current = false;
                focusContentRegion();
              } else {
                sectionsTriggerRef.current?.focus?.();
              }
            }}
          >
            <SheetTitle className="sr-only">Módulos del expediente</SheetTitle>
            <SheetDescription className="sr-only">Módulos disponibles para {currentPublic}</SheetDescription>
            <ExpedienteSideNav
              variant="sheet"
              groups={visibleSectionGroups}
              activeSection={activeSection}
              onSelect={handleSheetNavSelect}
              identity={navIdentity}
              className="pt-10"
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
    </section>
  );

  return createPortal(content, portalSlot || document.body);
}

export default FunExpedienteFullscreen;
