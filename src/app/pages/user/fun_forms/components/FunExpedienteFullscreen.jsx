import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import FUNService from '../../../../services/fun.service';
import legalGuideService from '../../../../services/legalGuide.service';
import { calcularDiasHabiles, sumarDiasHabiles, FUN_0_TYPE_TIME } from '../../clocks/hooks/useClocksManager';
import { useAlarms } from '../hooks/useAlarms';
import FUNG from '../fun_g';
import FUNC from '../fun_c';
import FUNN from '../fun_n';
import FUND from './fun_docs';
import FUN_ALERT from '../fun_alertn';
import FUNCLOCK from '../fun_clock';
import RECORD_ARC from '../../records/record_arc';
import RECORD_LAW from '../../records/record_law';
import RECORD_ENG from '../../records/record_eng';
import RECORD_REVIEW from '../../records/record_review';
import RECORD_PH from '../../records/record_ph';
import EXPEDITION from '../../expeditions/expedition.page';
import { BookmarkQuickMenu } from './BookmarkQuickMenu';
import { useBookmarks } from '../hooks/useBookmarks';
import { formsParser1, regexChecker_isOA_2, regexChecker_isPh } from '../../../../components/customClasses/typeParse';

const SECTION_GROUPS = [
  {
    id: 'contexto',
    items: [
      { id: 'detalles', label: 'Detalles', icon: 'FolderOpen', accent: 'sky' },
      { id: 'tiempos', label: 'Tiempos', icon: 'Clock', accent: 'sky' },
    ],
  },
  {
    id: 'gestion',
    items: [
      { id: 'documentos', label: 'Documentos', icon: 'Archive', accent: 'slate' },
      { id: 'actualizar', label: 'Actualizar', icon: 'RefreshCw', accent: 'slate', requiresEdit: true },
      { id: 'chequeo', label: 'Chequeo', icon: 'CheckSquare', accent: 'slate' },
      { id: 'publicidad', label: 'Publicidad', icon: 'Megaphone', accent: 'amber', requiresPublicidad: true },
    ],
  },
  {
    id: 'cierre',
    items: [
      { id: 'informes', label: 'Informes', icon: 'FileText', accent: 'amber' },
      { id: 'acta', label: 'Acta', icon: 'FileCheck', accent: 'amber' },
      { id: 'expedicion', label: 'Expedición', icon: 'FileOutput', accent: 'amber' },
    ],
  },
];

const SECTION_ITEMS = SECTION_GROUPS.flatMap((group) => group.items);

const STANDARD_REPORT_ITEMS = [
  { id: 'juridico', label: 'Jurídico', icon: 'Scale' },
  { id: 'arquitectonico', label: 'Arquitectónico', icon: 'Building' },
  { id: 'estructural', label: 'Estructural', icon: 'Cog' },
];

const PH_REPORT_ITEM = { id: 'ph', label: 'Informe P.H.', icon: 'PenTool' };

const REPORT_ITEMS = [...STANDARD_REPORT_ITEMS, PH_REPORT_ITEM];

const STATUS_META = {
  EN_TERMINO: {
    label: 'En término',
    badgeClass: 'border-accent/30 bg-accent/10 text-accent',
    barClass: 'bg-accent',
  },
  PRONTO_A_VENCER: {
    label: 'Pronto a vencer',
    badgeClass: 'border-warning/30 bg-warning/10 text-warning',
    barClass: 'bg-warning',
  },
  ALERTA_VENCIMIENTO: {
    label: 'Alerta de vencimiento',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    barClass: 'bg-destructive',
  },
  VENCIDO: {
    label: 'Vencido',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    barClass: 'bg-destructive',
  },
};

const STATUS_FALLBACK = STATUS_META.EN_TERMINO;

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

function getSummaryStatusMeta(status) {
  return STATUS_META[status] || STATUS_FALLBACK;
}

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

function matchesLegacyPropertyHorizontal(type) {
  return /p\.?\s*h|propiedad\s+horizontal/i.test(type || '');
}

function getVersionFun1(expediente, version) {
  const fun1List = Array.isArray(expediente?.fun_1s) ? expediente.fun_1s : [];
  const targetIndex = Math.max(Math.min((version || 1) - 1, fun1List.length - 1), 0);
  return fun1List[targetIndex] ?? fun1List[0] ?? null;
}

function isPropertyHorizontalExpediente(expediente, version) {
  const fun1 = getVersionFun1(expediente, version);

  return regexChecker_isPh(fun1, true)
    || matchesLegacyPropertyHorizontal(formsParser1(fun1))
    || matchesLegacyPropertyHorizontal(getFirstValue(expediente?.tipo_licencia, expediente?.tramite, expediente?.categoria));
}

function getReportItemsForExpediente(expediente, version) {
  return isPropertyHorizontalExpediente(expediente, version) ? [PH_REPORT_ITEM] : STANDARD_REPORT_ITEMS;
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
  const showActualizar = isEditableLegacyExpediente(expediente);
  const showPublicidad = canShowLegacyPublicidad(expediente, version);
  const isPH = isPropertyHorizontalExpediente(expediente, version);

  return SECTION_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (isPH && item.id === 'acta') return false;
        if (item.requiresPublicidad) return showPublicidad;
        if (item.requiresEdit) return showActualizar;
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);
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

function SectionButton({ item, active, onClick }) {
  const toneClass = {
    sky: active
      ? 'border-sky-500 bg-sky-50 text-sky-700'
      : 'border-transparent text-muted-foreground hover:border-sky-200 hover:bg-sky-50/70 hover:text-sky-700',
    slate: active
      ? 'border-slate-400 bg-slate-100 text-slate-900'
      : 'border-transparent text-muted-foreground hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900',
    amber: active
      ? 'border-amber-400 bg-amber-50 text-amber-800'
      : 'border-transparent text-muted-foreground hover:border-amber-200 hover:bg-amber-50/70 hover:text-amber-800',
  };

  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap rounded-lg border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
        toneClass[item.accent] || toneClass.slate
      )}
    >
      <Icon name={item.icon} size={14} />
      {item.label}
    </button>
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

function PanelToggleButton({ open, onToggle }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onToggle}
      className={cn(
        'absolute top-4 z-20 h-11 w-11 rounded-full border-border bg-background/95 text-muted-foreground shadow-lg transition-all duration-200 hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        open ? '-left-5' : '-left-11'
      )}
      aria-label={open ? 'Ocultar panel lateral de contexto' : 'Mostrar panel lateral de contexto'}
      aria-expanded={open}
      title={open ? 'Ocultar contexto' : 'Mostrar contexto'}
    >
      <Icon name={open ? 'PanelRightClose' : 'PanelRightOpen'} size={17} />
    </Button>
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
      <DialogContent overlayClassName="!z-[10000]" className="!z-[10010] max-h-[82vh] max-w-2xl overflow-hidden p-0">
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
      <DialogContent overlayClassName="!z-[10000]" className="!z-[10010] max-h-[82vh] max-w-3xl overflow-hidden p-0">
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

function renderModuleContent(activeSection, activeReport, moduleProps) {
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
    case 'publicidad':
      return <FUN_ALERT {...moduleProps} />;
    case 'informes':
      if (activeReport === 'ph') {
        return <RECORD_PH {...moduleProps} />;
      }
      if (activeReport === 'arquitectonico') {
        return <RECORD_ARC {...moduleProps} />;
      }
      if (activeReport === 'estructural') {
        return <RECORD_ENG {...moduleProps} />;
      }
      return <RECORD_LAW {...moduleProps} />;
    case 'acta':
      return <RECORD_REVIEW {...moduleProps} />;
    case 'expedicion':
      return <EXPEDITION {...moduleProps} />;
    default:
      return <FUNG {...moduleProps} onDuplicateSuccess={() => {}} />;
  }
}

function normalizeInitialSection(section) {
  return SECTION_ITEMS.some((item) => item.id === section) ? section : 'detalles';
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
  defaultRightPanelOpen = false,
}) {
  const [summary, setSummary] = useState(expediente);
  const [activeSection, setActiveSection] = useState(() => normalizeInitialSection(initialSection));
  const [activeReport, setActiveReport] = useState(() => normalizeInitialReport(initialReport));
  const [currentId, setCurrentId] = useState(getExpedienteId(expediente));
  const [currentVersion, setCurrentVersion] = useState(getExpedienteVersion(expediente));
  const [currentPublic, setCurrentPublic] = useState(getExpedienteRadicado(expediente));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(defaultRightPanelOpen);
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [bitacoraDialogOpen, setBitacoraDialogOpen] = useState(false);
  const [liveLegalSummary, setLiveLegalSummary] = useState(null);
  const [legalGuide, setLegalGuide] = useState(null);
  const [legalGuideLoading, setLegalGuideLoading] = useState(false);

  const { alarms } = useAlarms({ includeAttended: true, includeHidden: true });
  const {
    bookmarks,
    error: bookmarkError,
    setScope: setBookmarkScope,
  } = useBookmarks();

  useEffect(() => {
    setSummary(expediente);
    setLiveLegalSummary(null);
    setLegalGuide(null);
    setCurrentId(getExpedienteId(expediente));
    setCurrentVersion(getExpedienteVersion(expediente));
    setCurrentPublic(getExpedienteRadicado(expediente));
  }, [expediente]);

  useEffect(() => {
    setActiveSection(normalizeInitialSection(initialSection));
    setActiveReport(normalizeInitialReport(initialReport));
  }, [initialReport, initialSection]);

  useEffect(() => {
    setRightPanelOpen(defaultRightPanelOpen);
  }, [defaultRightPanelOpen]);

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
    if (activeSection === 'tiempos') {
      setRightPanelOpen(false);
    }
  }, [activeSection]);

  useEffect(() => {
    let ignore = false;

    if (!currentPublic || currentPublic === 'Sin radicado') {
      setLiveLegalSummary(null);
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
  }, [currentPublic]);

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
          setSummary((prev) => ({ ...prev, ...nextData }));
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
      setSummary((prev) => ({ ...prev, ...item }));
    }

    switch (nextSection) {
      case 'general':
        setActiveSection('detalles');
        break;
      case 'edit':
        setActiveSection('actualizar');
        break;
      case 'check':
        setActiveSection('chequeo');
        break;
      case 'clock':
        setActiveSection('tiempos');
        break;
      case 'archive':
        setActiveSection('documentos');
        break;
      case 'alert':
        setActiveSection('publicidad');
        break;
      case 'record_law':
        setActiveSection('informes');
        setActiveReport('juridico');
        break;
      case 'record_arc':
        setActiveSection('informes');
        setActiveReport('arquitectonico');
        break;
      case 'record_eng':
        setActiveSection('informes');
        setActiveReport('estructural');
        break;
      case 'record_ph':
        setActiveSection('informes');
        setActiveReport('ph');
        break;
      case 'record_review':
        setActiveSection('acta');
        break;
      case 'expedition':
        setActiveSection('expedicion');
        break;
      default:
        break;
    }
  }, []);

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
    setActiveSection(nextSection);
    if (nextSection !== 'informes') {
      return;
    }
    const nextReportItems = getReportItemsForExpediente(summary, currentVersion);
    setActiveReport((prev) => nextReportItems.some((item) => item.id === prev) ? prev : nextReportItems[0]?.id || 'juridico');
  }, [currentVersion, summary]);

  const bitacoraEntries = useMemo(() => normalizeBitacoraEntries(summary), [summary]);
  const bitacoraGroups = useMemo(() => getBitacoraGroups(bitacoraEntries), [bitacoraEntries]);
  const legalSummary = useMemo(() => mergeLegalSummary(summary, liveLegalSummary), [liveLegalSummary, summary]);
  const currentPhaseCode = normalizePhaseCode(legalSummary?.fase_actual);
  const summaryStatus = getSummaryStatusMeta(legalSummary?.status);
  const usedDays = toSafeNumber(legalSummary?.dias_habiles_usados);
  const limitDays = toSafeNumber(legalSummary?.dias_habiles_limite);
  const progressPercent = getProgressPercent(legalSummary, usedDays, limitDays);
  const remainingDays = limitDays > 0 ? Math.max(limitDays - usedDays, 0) : null;
  const termMeta = getTermMeta({ summary: legalSummary, usedDays, limitDays, remainingDays });
  useEffect(() => {
    let ignore = false;

    if (!currentPhaseCode) {
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
        if (!ignore && error?.response?.status !== 404) {
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
  }, [currentPhaseCode]);

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
      currentVersion,
      requestUpdate,
      requesRefresh: () => requestUpdate(currentId),
      closeModal: noop,
      NAVIGATION: handleLegacyNavigation,
      NAVIGATION_VERSION: handleVersionNavigation,
    }),
    [currentId, currentVersion, globals, handleLegacyNavigation, handleVersionNavigation, noop, requestUpdate, swaMsg, translation]
  );

  const visibleSectionGroups = useMemo(
    () => getVisibleSectionGroups(summary, currentVersion),
    [currentVersion, summary]
  );

  const visibleSectionIds = useMemo(
    () => visibleSectionGroups.flatMap((group) => group.items.map((item) => item.id)),
    [visibleSectionGroups]
  );

  const visibleReportItems = useMemo(
    () => getReportItemsForExpediente(summary, currentVersion),
    [currentVersion, summary]
  );

  const activeReportIsVisible = visibleReportItems.some((item) => item.id === activeReport);
  const effectiveActiveReport = activeReportIsVisible ? activeReport : visibleReportItems[0]?.id || 'juridico';

  useEffect(() => {
    if (!visibleSectionIds.includes(activeSection)) {
      setActiveSection('detalles');
    }
  }, [activeSection, visibleSectionIds]);

  useEffect(() => {
    if (activeSection === 'informes' && !activeReportIsVisible) {
      setActiveReport(effectiveActiveReport);
    }
  }, [activeReportIsVisible, activeSection, effectiveActiveReport]);

  const moduleContent = renderModuleContent(activeSection, effectiveActiveReport, moduleProps);

  const content = (
    <div
      className="expediente-fullscreen fixed inset-0 z-[9999] bg-background text-foreground flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Detalle del expediente"
    >
      {/* ── Header compacto ──────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-border bg-background/98 backdrop-blur">
        {/* Fila principal compacta */}
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
            aria-label="Volver"
          >
            <Icon name="ArrowLeft" size={15} />
          </Button>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 overflow-hidden">
            <span className="font-mono text-sm font-semibold truncate max-w-[160px] sm:max-w-xs">
              {currentPublic}
            </span>
            <Badge className={cn('border text-[10px] font-semibold shrink-0', summaryStatus.badgeClass)}>
              {summaryStatus.label}
            </Badge>
            {remainingDays != null ? (
              <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                {remainingDays}d restantes
              </Badge>
            ) : null}
            <Badge variant="secondary" className="font-mono text-[10px] shrink-0">
              v{currentVersion}
            </Badge>
          </div>

          {/* Acciones + toggle detalle + cerrar */}
          <div className="flex shrink-0 items-center gap-1">
            <BookmarkQuickMenu
              rowId={currentId || currentPublic || 'actual'}
              bookmarkState={bookmarkState}
              triggerClassName="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent bg-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              triggerTestIdPrefix="fullscreen-bookmark-menu-trigger"
              menuTestIdPrefix="fullscreen-bookmark-menu"
              align="end"
              disabled={!currentId}
              onToggleScope={handleToggleBookmarkScope}
            />
            {bookmarkError ? (
              <span title="No se pudieron sincronizar los marcajes" className="inline-flex h-7 w-7 items-center justify-center rounded-md text-warning">
                <Icon name="AlertCircle" size={13} />
              </span>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="hidden h-7 text-xs sm:flex"
              onClick={() => refreshSummary()}
              disabled={isRefreshing}
            >
              <Icon name="RefreshCw" size={12} className={cn(isRefreshing && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setHeaderExpanded(p => !p)}
              aria-label={headerExpanded ? 'Colapsar datos' : 'Expandir datos'}
              title={headerExpanded ? 'Colapsar datos' : 'Expandir datos'}
            >
              <Icon name={headerExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <Icon name="X" size={15} />
            </Button>
          </div>
        </div>

        {/* Franja de progreso siempre visible (fina) */}
        <div className="h-0.5 w-full bg-muted">
          <div
            className={cn('h-full transition-all duration-300', summaryStatus.barClass)}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Detalle expandible */}
        {headerExpanded && (
          <div className="border-t border-border/60 px-3 py-3 sm:px-4">
            <p className="mb-2 text-xs text-muted-foreground">
              {legalSummary?.fase_label || 'Fase por confirmar'} &nbsp;·&nbsp;
              <span className="font-mono">{usedDays}/{limitDays || 0} días hábiles ({progressPercent}%)</span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryItem icon="User" label="Solicitante" value={getExpedienteApplicant(legalSummary)} />
              <SummaryItem icon="Layers" label="Categoría" value={legalSummary?.categoria || legalSummary?.tipo || 'Sin categoría'} />
              <SummaryItem icon="Calendar" label="Radicación" value={legalSummary?.fecha_radicacion || 'Sin fecha'} />
              <SummaryItem icon="CalendarDays" label="Fecha límite" value={legalSummary?.fecha_limite || 'Sin fecha límite'} />
            </div>
          </div>
        )}
      </header>

      {/* ── Navegación de submódulos ─────────────────────────────────── */}
      <div className="shrink-0 border-b border-border bg-card/50 px-2 sm:px-4">
        <div className="flex gap-2 overflow-x-auto py-2">
          {visibleSectionGroups.map((group) => (
            <div key={group.id} className="flex items-center gap-1 rounded-xl border border-border/70 bg-background/85 p-1 shadow-sm">
              {group.items.map((item) => (
                <SectionButton key={item.id} item={item} active={activeSection === item.id} onClick={handleSectionChange} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Área de trabajo ──────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Contenido principal */}
        <div className={cn('flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden transition-[max-width] duration-200', rightPanelOpen ? 'max-w-[calc(100%_-_20rem)]' : 'max-w-full')}>
          <ScrollArea className="min-w-0 flex-1">
            <div className="w-full min-w-0 space-y-4 p-3 sm:p-5">
              {activeSection === 'informes' ? (
                <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card/80 p-2 shadow-sm">
                  {visibleReportItems.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant={effectiveActiveReport === item.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveReport(item.id)}
                    >
                      <Icon name={item.icon} size={14} />
                      {item.label}
                    </Button>
                  ))}
                </div>
              ) : null}

              <div
                className={cn(
                  'w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-card/90 shadow-sm',
                  activeSection === 'tiempos'
                    ? 'p-1 sm:p-2'
                    : activeSection === 'actualizar' || activeSection === 'publicidad'
                      ? 'p-2 sm:p-4'
                      : 'p-3 sm:p-5'
                )}
              >
                {moduleContent}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* ── Panel derecho colapsable ─────────────────────────────── */}
        <div className="relative flex shrink-0">
          <PanelToggleButton
            open={rightPanelOpen}
            onToggle={() => setRightPanelOpen(p => !p)}
          />

          {rightPanelOpen && (
            <aside className="w-80 shrink-0 overflow-hidden border-l border-border bg-card/50 shadow-xl flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-2.5 p-3">
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

                  <BitacoraPreviewCard
                    entries={bitacoraEntries}
                    groups={bitacoraGroups}
                    onOpen={() => setBitacoraDialogOpen(true)}
                  />

                  <OperationalAlertsCard
                    alarms={currentAlarms}
                    onOpen={() => setAlertsDialogOpen(true)}
                  />

                  <RecentActivityCard events={recentActivity} />

                </div>
              </ScrollArea>
            </aside>
          )}
        </div>
      </div>

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
