import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import FUNService from '../../services/fun.service';
import PqrsMainService from '../../services/pqrs_main.service';
import SubmitService from '../../services/submit.service';
import MailboxService from '../../services/mailbox.service';
import AppointmentsService from '../../services/appointments.service';
import BookmarkService from '../../services/bookmark.service';
import {
  RECENT_EXPEDIENTES_CHANGED_EVENT,
  getRecentExpedientes,
} from './fun_forms/utils/expedienteWorkspaceRoute';
import {
  DASHBOARD_PREFERENCES_CHANGED_EVENT,
  readDashboardPreferences,
} from './dashboardPreferences';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

const COUNT_UNAVAILABLE_LABEL = 'Sin conteo';

const DASHBOARD_PALETTES = {
  dovela: {
    hero: 'border-primary/15 bg-gradient-to-br from-primary/10 via-card to-accent/10 text-primary',
    primaryTone: 'bg-primary/10 text-primary',
    accentTone: 'bg-accent/10 text-accent',
    warningTone: 'bg-warning/15 text-warning',
    neutralTone: 'bg-primary/10 text-primary/80',
    quickCard: 'hover:border-primary/30 hover:bg-primary/5',
    spotlight: 'border-primary/15 bg-primary/5',
  },
  civic: {
    hero: 'border-primary/20 bg-primary/5 text-primary',
    primaryTone: 'bg-primary/10 text-primary',
    accentTone: 'bg-primary/10 text-primary',
    warningTone: 'bg-primary/10 text-primary',
    neutralTone: 'bg-primary/10 text-primary/80',
    quickCard: 'hover:border-primary/35 hover:bg-primary/5',
    spotlight: 'border-primary/20 bg-primary/5',
  },
  verde: {
    hero: 'border-accent/20 bg-accent/5 text-accent',
    primaryTone: 'bg-accent/10 text-accent',
    accentTone: 'bg-accent/10 text-accent',
    warningTone: 'bg-accent/10 text-accent',
    neutralTone: 'bg-accent/10 text-accent/80',
    quickCard: 'hover:border-accent/35 hover:bg-accent/5',
    spotlight: 'border-accent/20 bg-accent/5',
  },
  ambar: {
    hero: 'border-warning/25 bg-warning/10 text-warning',
    primaryTone: 'bg-warning/15 text-warning',
    accentTone: 'bg-warning/15 text-warning',
    warningTone: 'bg-warning/15 text-warning',
    neutralTone: 'bg-warning/15 text-warning/90',
    quickCard: 'hover:border-warning/35 hover:bg-warning/10',
    spotlight: 'border-warning/20 bg-warning/10',
  },
  graphite: {
    hero: 'border-foreground/15 bg-muted/60 text-foreground',
    primaryTone: 'bg-foreground/10 text-foreground',
    accentTone: 'bg-accent/10 text-accent',
    warningTone: 'bg-warning/15 text-warning',
    neutralTone: 'bg-accent/10 text-accent/80',
    quickCard: 'hover:border-foreground/20 hover:bg-muted/60',
    spotlight: 'border-foreground/10 bg-muted/50',
  },
};

const DENSITY_STYLES = {
  comfortable: {
    sectionGap: 'space-y-5',
    quickGrid: 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3',
    helperText: 'text-xs',
  },
  compact: {
    sectionGap: 'space-y-4',
    quickGrid: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    helperText: 'text-[11px]',
  },
};

const MODULES = {
  radicacion: { key: 'radicacion', title: 'Radicar solicitud', eyebrow: 'Radicación', icon: 'FileText', desc: 'Crear una nueva solicitud', link: '/licencias', tone: 'primary' },
  ventanilla: { key: 'ventanilla', title: 'Ventanilla Única', eyebrow: 'Recepción', icon: 'FileInput', desc: 'Ingresos y revisión inicial', link: '/ventanilla', tone: 'accent' },
  'gestion-nueva': { key: 'gestion-nueva', title: 'Gestión nueva', eyebrow: 'Operación', icon: 'Layers', desc: 'Expedientes en desarrollo', link: '/licencias/gestion-nueva', status: 'En desarrollo', tone: 'primary' },
  gestion: { key: 'gestion', title: 'Gestión actual', eyebrow: 'Operación', icon: 'FolderOpen', desc: 'Licencias activas', link: '/licencias/gestion', tone: 'primary' },
  pqrs: { key: 'pqrs', title: 'PQRS', eyebrow: 'Atención', icon: 'FileSpreadsheet', desc: 'Peticiones y reclamos', link: '/peticiones', tone: 'warning' },
  alarmas: { key: 'alarmas', title: 'Alarmas', eyebrow: 'SLA', icon: 'BellRing', desc: 'Umbrales y vencimientos', link: '/configuracion?tab=alarmas', status: 'En desarrollo', tone: 'warning' },
  calendario: { key: 'calendario', title: 'Calendario', eyebrow: 'Agenda', icon: 'Calendar', desc: 'Citas y programación', link: '/calendario', tone: 'accent' },
  publicaciones: { key: 'publicaciones', title: 'Publicaciones', eyebrow: 'Difusión', icon: 'Newspaper', desc: 'Novedades y resoluciones', link: '/publicaciones', tone: 'neutral', showCount: false },
  mensajes: { key: 'mensajes', title: 'Buzón de mensajes', eyebrow: 'Correspondencia', icon: 'Mail', desc: 'Bandeja externa', link: '/mensajes', tone: 'neutral' },
  chat: { key: 'chat', title: 'Chat Curaduría', eyebrow: 'Equipo', icon: 'MessageCircle', desc: 'Conversación interna', link: '/mensajes', tone: 'neutral', showCount: false },
  archivo: { key: 'archivo', title: 'Archivo', eyebrow: 'Repositorio', icon: 'Archive', desc: 'Expedientes y soportes', link: '/archivo', tone: 'neutral', showCount: false },
  consecutivos: { key: 'consecutivos', title: 'Consecutivos', eyebrow: 'Consulta', icon: 'Book', desc: 'Series y radicados', link: '/consecutivos', tone: 'neutral', showCount: false },
  documentos: { key: 'documentos', title: 'Documentos', eyebrow: 'Plantillas', icon: 'FileText', desc: 'Formatos e instrumentos', link: '/documentos', tone: 'primary', showCount: false },
  calculadora: { key: 'calculadora', title: 'Calculadora de expensas', eyebrow: 'Herramienta', icon: 'Calculator', desc: 'Liquidación de costos', link: '/calculadora', tone: 'accent', showCount: false },
  profesionales: { key: 'profesionales', title: 'Base de profesionales', eyebrow: 'Consulta', icon: 'HardHat', desc: 'Profesionales registrados', link: '/profesionales', tone: 'warning', showCount: false },
  certificados: { key: 'certificados', title: 'Historial profesional', eyebrow: 'Consulta', icon: 'Contact', desc: 'Certificaciones emitidas', link: '/certificados', tone: 'neutral', showCount: false },
  ayuda: { key: 'ayuda', title: 'Manual de usuario', eyebrow: 'Ayuda', icon: 'BookOpen', desc: 'Guía del sistema', link: '/ayuda', tone: 'neutral', showCount: false },
  sellos: { key: 'sellos', title: 'Sellos', eyebrow: 'Apoyo', icon: 'Stamp', desc: 'Consulta y generación', link: '/sellos', tone: 'primary', showCount: false },
  nomenclatura: { key: 'nomenclatura', title: 'Nomenclaturas', eyebrow: 'Predial', icon: 'Signpost', desc: 'Asignación predial', link: '/nomenclatura', tone: 'warning' },
  normas: { key: 'normas', title: 'Normas urbanas', eyebrow: 'Consulta', icon: 'Home', desc: 'Disponible para esta curaduría', link: '/normas', tone: 'primary', enabled: _GLOBAL_ID === 'cb1' },
  'uso-suelo': { key: 'uso-suelo', title: 'Uso de suelo', eyebrow: 'Consulta', icon: 'MapPin', desc: 'Disponible para esta curaduría', link: '/uso-suelo', tone: 'accent', enabled: _GLOBAL_ID === 'cb1' },
};

const SECTION_DEFINITIONS = {
  intake: {
    title: 'Radicación e ingreso',
    description: 'Captura trámites, ventanilla y apertura de expedientes sin mezclar consulta normativa.',
    items: ['radicacion', 'ventanilla', 'gestion-nueva'],
  },
  reference: {
    title: 'Normativa y consulta predial',
    description: 'Aísla nomenclaturas, normas urbanas y uso del suelo para consulta rápida sin ruido operativo.',
    items: ['nomenclatura', 'normas', 'uso-suelo'],
  },
  management: {
    title: 'Gestión curaduría',
    description: 'Continúa expedientes activos, revisa alarmas y agenda operativa.',
    items: ['gestion-nueva', 'gestion', 'alarmas', 'calendario'],
  },
  communications: {
    title: 'Atención y comunicaciones',
    description: 'Centraliza PQRS, mensajes, chat interno y novedades.',
    items: ['pqrs', 'mensajes', 'chat', 'publicaciones', 'calendario'],
  },
  archive: {
    title: 'Archivo y expedición',
    description: 'Organiza documentos, archivo, consecutivos y sellos.',
    items: ['archivo', 'documentos', 'consecutivos', 'sellos'],
  },
  tools: {
    title: 'Utilidades documentales',
    description: 'Herramientas de consulta y apoyo que no deben competir con la operación diaria.',
    items: ['calculadora', 'profesionales', 'certificados', 'ayuda'],
  },
};

const DASHBOARD_PRESETS = {
  recommended: {
    eyebrow: 'Dovela recomendado',
    title: 'Consola operativa del día',
    description: 'Radica, continúa gestión y revisa señales críticas sin repetir el mismo catálogo de módulos.',
    quickActionKeys: ['radicacion', 'gestion-nueva', 'pqrs', 'alarmas'],
    processSectionKeys: ['intake', 'management'],
    supportSectionKeys: ['reference', 'communications', 'archive', 'tools'],
    focus: ['4 acciones críticas arriba', 'Proceso separado de soporte', 'Seguimiento lateral compacto'],
    trackingMode: 'side',
  },
  intake: {
    eyebrow: 'Radicación express',
    title: 'Ingreso rápido de trámites',
    description: 'Reduce la primera pantalla a recepción, radicación y creación de expedientes.',
    quickActionKeys: ['radicacion', 'ventanilla', 'gestion-nueva'],
    processSectionKeys: ['intake'],
    supportSectionKeys: ['reference', 'management', 'communications', 'archive'],
    focus: ['Recepción primero', 'Ingreso sin ruido', 'Gestión secundaria'],
    trackingMode: 'side',
  },
  management: {
    eyebrow: 'Gestión curaduría',
    title: 'Control de expedientes activos',
    description: 'Prioriza gestión, alarmas y seguimiento para usuarios que operan expedientes todo el día.',
    quickActionKeys: ['gestion-nueva', 'gestion', 'alarmas', 'calendario'],
    processSectionKeys: ['management'],
    supportSectionKeys: ['intake', 'reference', 'communications', 'archive'],
    focus: ['Seguimiento ampliado', 'Alarmas arriba', 'Agenda operativa'],
    trackingMode: 'prominent',
  },
  communications: {
    eyebrow: 'Atención y comunicaciones',
    title: 'Frente de atención ciudadana',
    description: 'Organiza PQRS, mensajes, chat y agenda para responder más rápido.',
    quickActionKeys: ['pqrs', 'mensajes', 'chat', 'calendario'],
    processSectionKeys: ['communications'],
    supportSectionKeys: ['management', 'intake', 'reference', 'archive'],
    focus: ['PQRS visible', 'Buzón y chat unidos', 'Agenda inmediata'],
    trackingMode: 'side',
  },
  archive: {
    eyebrow: 'Archivo y expedición',
    title: 'Cierre documental y consultas',
    description: 'Lleva documentos, consecutivos, archivo y utilidades al primer nivel de trabajo.',
    quickActionKeys: ['archivo', 'documentos', 'consecutivos', 'sellos'],
    processSectionKeys: ['archive', 'tools'],
    supportSectionKeys: ['reference', 'intake', 'management', 'communications'],
    focus: ['Documentos primero', 'Consultas agrupadas', 'Operación compacta'],
    trackingMode: 'side',
  },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function getCompactDate() {
  return new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date());
}

function getUserDisplayName() {
  const user = window.user || {};
  return [user.name, user.name_2].filter(Boolean).join(' ').trim() || user.name_full || 'usuario';
}

function normalizeList(payload) {
  return Array.isArray(payload) ? payload : payload?.data ?? [];
}

function getFirstFun1(expediente) {
  return expediente?.fun_1s?.[0] || expediente?.fun_1 || null;
}

function getExpedienteStateLabel(state) {
  const value = Number(state);
  if (!Number.isFinite(value)) return 'Sin estado';
  if (value < 0) return 'Incompleta';
  if (value === 0) return 'Borrador';
  if (value < 100) return 'Activa';
  return 'Cerrada';
}

function formatShortDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function buildTrackedExpedientes(bookmarks, funData) {
  const universe = new Map();
  (funData || []).forEach((expediente) => {
    if (expediente?.id != null) universe.set(String(expediente.id), expediente);
  });

  const seen = new Set();
  return (bookmarks || [])
    .map((bookmark) => {
      const fun0Id = bookmark.fun0Id ?? bookmark.fun_0_id ?? bookmark.fun_0?.id ?? bookmark.id;
      const expediente = universe.get(String(fun0Id)) || bookmark.fun_0 || null;
      if (!fun0Id && !expediente) return null;
      const fun1 = getFirstFun1(expediente);
      const radicado = expediente?.id_public || bookmark.radicado || (fun0Id ? `#${fun0Id}` : 'Sin radicado');
      const idPublic = expediente?.id_public || null;
      return {
        key: `${bookmark.scope || 'scope'}-${fun0Id || radicado}`,
        fun0Id,
        radicado,
        title: fun1?.tramite || fun1?.tipo || expediente?.type || 'Licencia urbanística',
        description: fun1?.description || expediente?.model || 'Sin descripción registrada',
        stateLabel: getExpedienteStateLabel(expediente?.state),
        dateLabel: formatShortDate(expediente?.date || bookmark.createdAt),
        href: idPublic ? `/funmanage/expediente/${encodeURIComponent(idPublic)}` : '/licencias/gestion-nueva',
      };
    })
    .filter(Boolean)
    .filter((item) => {
      const unique = item.fun0Id || item.radicado;
      if (seen.has(unique)) return false;
      seen.add(unique);
      return true;
    })
    .slice(0, 6);
}

function getToneClasses(palette, tone) {
  const selected = DASHBOARD_PALETTES[palette] || DASHBOARD_PALETTES.dovela;
  if (tone === 'accent') return selected.accentTone;
  if (tone === 'warning') return selected.warningTone;
  if (tone === 'neutral') return selected.neutralTone;
  return selected.primaryTone;
}

function getToneIconClasses(palette, tone) {
  const selected = DASHBOARD_PALETTES[palette] || DASHBOARD_PALETTES.dovela;
  const toneSource =
    tone === 'accent'
      ? selected.accentTone
      : tone === 'warning'
        ? selected.warningTone
        : tone === 'neutral'
          ? selected.neutralTone
          : selected.primaryTone;

  return toneSource.split(' ').find((item) => item.startsWith('text-')) || 'text-primary';
}

function getModule(key) {
  const item = MODULES[key];
  if (!item || item.enabled === false) return null;
  return item;
}

function buildSection(key, excludedKeys = new Set()) {
  const definition = SECTION_DEFINITIONS[key];
  if (!definition) return null;

  const items = definition.items
    .map(getModule)
    .filter(Boolean)
    .filter((item) => !excludedKeys.has(item.key));
  if (items.length === 0) return null;

  return {
    key,
    title: definition.title,
    description: definition.description,
    items,
  };
}

function buildDashboardSections(layout = 'recommended') {
  const preset = DASHBOARD_PRESETS[layout] || DASHBOARD_PRESETS.recommended;
  const quickActions = preset.quickActionKeys.map(getModule).filter(Boolean);
  const quickActionKeys = new Set(quickActions.map((item) => item.key));

  return {
    preset,
    quickActions,
    processSections: preset.processSectionKeys.map((key) => buildSection(key, quickActionKeys)).filter(Boolean),
    supportSections: preset.supportSectionKeys.map((key) => buildSection(key, quickActionKeys)).filter(Boolean),
  };
}

function buildTopWorkItems(personal = [], team = [], recent = []) {
  const seen = new Set();
  const candidates = [
    ...personal.map((item) => ({ ...item, sourceLabel: 'Mío' })),
    ...team.map((item) => ({ ...item, sourceLabel: 'Equipo' })),
    ...recent.map((item) => ({
      key: `recent-${item.radicado}`,
      radicado: item.radicado,
      href: item.href,
      title: 'Expediente reciente',
      stateLabel: 'Reciente',
      sourceLabel: 'Reciente',
    })),
  ];

  return candidates
    .filter((item) => item?.radicado && item?.href)
    .filter((item) => {
      const key = item.href || item.key || item.radicado;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

function getShortUserName(userName) {
  return String(userName || '').trim().split(/\s+/)[0] || 'usuario';
}

function Dashboard({ breadCrums }) {
  const [counts, setCounts] = useState({});
  const [countFailures, setCountFailures] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [trackedExpedientes, setTrackedExpedientes] = useState({ personal: [], team: [] });
  const [recentExpedientes, setRecentExpedientes] = useState(() => getRecentExpedientes());
  const [loadingTracked, setLoadingTracked] = useState(true);
  const [trackedError, setTrackedError] = useState(null);
  const [preferences, setPreferences] = useState(() => readDashboardPreferences());

  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      try {
        const results = await Promise.allSettled([
          FUNService.getAll_fun(),
          PqrsMainService.getAll(),
          SubmitService.getAll(),
          MailboxService.getAll(),
          AppointmentsService.getAll(),
          BookmarkService.list({ scope: 'personal' }),
          BookmarkService.list({ scope: 'team' }),
        ]);

        if (cancelled) return;

        const nextFailures = {};
        const nextCounts = {};
        const len = (result) =>
          result.status === 'fulfilled' && Array.isArray(result.value?.data)
            ? result.value.data.length
            : null;

        const funData = results[0].status === 'fulfilled' && Array.isArray(results[0].value?.data)
          ? results[0].value.data
          : null;

        if (Array.isArray(funData)) {
          nextCounts['/licencias'] = funData.filter((item) => item.state === 1 || item.state === -1).length;
          nextCounts['/licencias/gestion'] = funData.filter((item) => item.state > 0 && item.state < 100).length;
          nextCounts['/licencias/gestion-nueva'] = nextCounts['/licencias/gestion'];
        } else {
          nextFailures['/licencias'] = true;
          nextFailures['/licencias/gestion'] = true;
          nextFailures['/licencias/gestion-nueva'] = true;
        }

        const countMappings = [
          ['/peticiones', results[1]],
          ['/ventanilla', results[2]],
          ['/mensajes', results[3]],
          ['/calendario', results[4]],
        ];

        countMappings.forEach(([key, result]) => {
          const count = len(result);
          if (count == null) nextFailures[key] = true;
          else nextCounts[key] = count;
        });

        setCounts(nextCounts);
        setCountFailures(nextFailures);

        const personalBookmarks = results[5].status === 'fulfilled' ? normalizeList(results[5].value?.data) : [];
        const teamBookmarks = results[6].status === 'fulfilled' ? normalizeList(results[6].value?.data) : [];

        setTrackedExpedientes({
          personal: buildTrackedExpedientes(personalBookmarks, funData || []),
          team: buildTrackedExpedientes(teamBookmarks, funData || []),
        });
        setTrackedError(
          results[5].status === 'rejected' || results[6].status === 'rejected'
            ? 'No se pudieron cargar todos los marcados.'
            : null
        );
      } catch {
        if (!cancelled) {
          setCountFailures({
            '/licencias': true,
            '/licencias/gestion': true,
            '/licencias/gestion-nueva': true,
            '/peticiones': true,
            '/ventanilla': true,
            '/mensajes': true,
            '/calendario': true,
          });
        }
      } finally {
        if (!cancelled) setLoadingCounts(false);
        if (!cancelled) setLoadingTracked(false);
      }
    }

    fetchCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const refreshRecentExpedientes = () => setRecentExpedientes(getRecentExpedientes());

    refreshRecentExpedientes();
    window.addEventListener('storage', refreshRecentExpedientes);
    window.addEventListener(RECENT_EXPEDIENTES_CHANGED_EVENT, refreshRecentExpedientes);

    return () => {
      window.removeEventListener('storage', refreshRecentExpedientes);
      window.removeEventListener(RECENT_EXPEDIENTES_CHANGED_EVENT, refreshRecentExpedientes);
    };
  }, []);

  useEffect(() => {
    function syncPreferences() {
      setPreferences(readDashboardPreferences());
    }

    window.addEventListener('storage', syncPreferences);
    window.addEventListener(DASHBOARD_PREFERENCES_CHANGED_EVENT, syncPreferences);

    return () => {
      window.removeEventListener('storage', syncPreferences);
      window.removeEventListener(DASHBOARD_PREFERENCES_CHANGED_EVENT, syncPreferences);
    };
  }, []);

  const userName = useMemo(() => getUserDisplayName(), []);
  const dashboardModel = useMemo(() => buildDashboardSections(preferences.layout), [preferences.layout]);
  const density = DENSITY_STYLES[preferences.density] || DENSITY_STYLES.comfortable;
  const palette = DASHBOARD_PALETTES[preferences.palette] || DASHBOARD_PALETTES.dovela;
  const selectedPreset = dashboardModel.preset;
  const trackingEmphasis = selectedPreset.trackingMode === 'prominent';
  const topActions = dashboardModel.quickActions.slice(0, 2);
  const topWorkItems = useMemo(
    () => buildTopWorkItems(trackedExpedientes.personal, trackedExpedientes.team, recentExpedientes),
    [recentExpedientes, trackedExpedientes.personal, trackedExpedientes.team]
  );

  return (
    <TooltipProvider delayDuration={140}>
      <div className={cn('w-full animate-fade-in-up', density.sectionGap)} data-dovela-tour-id="dashboard-main">
      <WorkdayHeader
        preset={selectedPreset}
        userName={userName}
        palette={palette}
        paletteKey={preferences.palette}
        topActions={topActions}
        workItems={topWorkItems}
        counts={counts}
        countFailures={countFailures}
        loadingCounts={loadingCounts}
        loadingWorkItems={loadingTracked}
        density={preferences.density}
      />

      <section className="space-y-3" data-dovela-tour-id="dashboard-quick-actions">
        <SectionHeader title="Acciones críticas" />
        <div className={cn('grid gap-3', trackingEmphasis ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4' : density.quickGrid)}>
          {dashboardModel.quickActions.map((item) => (
            <QuickActionCard
              key={item.key || item.link}
              item={item}
              palette={preferences.palette}
              density={preferences.density}
              counts={counts}
              countFailures={countFailures}
              loadingCounts={loadingCounts}
            />
          ))}
        </div>
      </section>

      <div className={cn('flex flex-col gap-4', '2xl:flex-row 2xl:items-start')}>
        <div
          className={cn(
            'space-y-5',
            !trackingEmphasis && '2xl:w-full 2xl:max-w-[63rem] 2xl:flex-none',
            trackingEmphasis && '2xl:w-full 2xl:max-w-[49rem] 2xl:flex-none'
          )}
        >
          {dashboardModel.processSections.length > 0 ? (
            <section className="space-y-3" data-dovela-tour-id="dashboard-operations">
              <SectionHeader title="Trabajo principal" badge={selectedPreset.eyebrow} />

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {dashboardModel.processSections.map((section) => (
                  <GroupedActionCard
                    key={section.key}
                    title={section.title}
                    description={section.description}
                    items={section.items}
                    counts={counts}
                    countFailures={countFailures}
                    loadingCounts={loadingCounts}
                    palette={preferences.palette}
                    density={preferences.density}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <SectionHeader title="Módulos" />
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
              {dashboardModel.supportSections.map((section) => (
                <GroupedActionCard
                  key={section.key}
                  title={section.title}
                  description={section.description}
                  items={section.items}
                  counts={counts}
                  countFailures={countFailures}
                  loadingCounts={loadingCounts}
                  palette={preferences.palette}
                  density={preferences.density}
                />
              ))}
            </div>
          </section>
        </div>

        <aside
          className={cn(
            'space-y-4',
            '2xl:sticky 2xl:top-4 2xl:ml-auto 2xl:flex-none',
            !trackingEmphasis && '2xl:w-[26rem]',
            trackingEmphasis && '2xl:w-[34rem]'
          )}
          data-dovela-tour-id="dashboard-tracking"
        >
          <RecentExpedientesSummary items={recentExpedientes} />
          <TrackedExpedientesSummary
            personal={trackedExpedientes.personal}
            team={trackedExpedientes.team}
            loading={loadingTracked}
            error={trackedError}
            stacked={!trackingEmphasis}
            density={preferences.density}
          />
        </aside>
      </div>
      </div>
    </TooltipProvider>
  );
}

function WorkdayHeader({
  preset,
  userName,
  palette,
  paletteKey,
  topActions,
  workItems,
  counts,
  countFailures,
  loadingCounts,
  loadingWorkItems,
  density,
}) {
  const dense = density === 'compact';

  return (
    <section
      className={cn('overflow-hidden rounded-2xl border p-3 shadow-sm sm:p-4', palette.hero)}
      data-dovela-tour-id="dashboard-hero"
    >
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] xl:items-stretch">
        <div className="grid gap-3 lg:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1fr)] lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/15 bg-background/70 text-current shadow-sm">
              <Icon name="LayoutDashboard" size={18} />
            </span>
            <div className="min-w-0">
              <div className="mb-1 flex min-w-0 flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="h-5 max-w-full rounded-full border-current/20 bg-background/70 px-2 text-[10px] text-current">
                  <span className="truncate">{preset.eyebrow}</span>
                </Badge>
              </div>
              <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">Panel de trabajo</h1>
              <p className={cn('truncate text-muted-foreground', dense ? 'text-[10px]' : 'text-[11px]')}>
                {getGreeting()}, {getShortUserName(userName)} · {getCompactDate()}
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {topActions.map((item) => (
              <HeaderActionButton
                key={item.key || item.link}
                item={item}
                palette={paletteKey}
                counts={counts}
                countFailures={countFailures}
                loadingCounts={loadingCounts}
                compact={dense}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-current/15 bg-background/75 p-2.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">Continuar</span>
            <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px] font-normal">
              {loadingWorkItems ? '…' : workItems.length}
            </Badge>
          </div>
          <div className="grid gap-1.5">
            {loadingWorkItems ? (
              Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-9 rounded-lg" />)
            ) : workItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-[11px] text-muted-foreground">
                Sin expedientes recientes.
              </div>
            ) : (
              workItems.map((item) => <HeaderWorkItem key={item.key || item.href || item.radicado} item={item} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeaderActionButton({ item, palette, counts, countFailures, loadingCounts, compact }) {
  const toneClasses = getToneClasses(palette, item.tone);
  const toneIconClasses = getToneIconClasses(palette, item.tone);

  return (
    <ModuleTooltip item={item}>
      <Button
        asChild
        variant="outline"
        className="h-auto min-h-11 rounded-xl border-current/15 bg-background/70 p-0 text-left shadow-sm transition-colors hover:bg-background"
      >
        <Link to={item.link} className="flex w-full items-center justify-between gap-2.5 no-underline px-3 py-2">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', toneClasses)}>
              <Icon name={item.icon} size={15} className={toneIconClasses} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-semibold text-foreground">{item.title}</span>
              <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
                {item.eyebrow}
              </span>
            </span>
          </span>

          <ActionMeta
            item={item}
            counts={counts}
            countFailures={countFailures}
            loadingCounts={loadingCounts}
            compact={compact}
          />
        </Link>
      </Button>
    </ModuleTooltip>
  );
}

function HeaderWorkItem({ item }) {
  return (
    <Link
      to={item.href}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2.5 py-2 no-underline transition-colors hover:bg-muted/60"
    >
      <span className="min-w-0">
        <span className="block truncate font-mono text-[11px] font-semibold text-foreground">{item.radicado}</span>
        <span className="block truncate text-[10px] text-muted-foreground">{item.sourceLabel}</span>
      </span>
      <Badge variant="outline" className="h-5 max-w-24 rounded-full px-2 text-[10px] font-normal">
        <span className="truncate">{item.stateLabel}</span>
      </Badge>
    </Link>
  );
}

function SectionHeader({ title, badge }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
        {title}
      </h2>
      {badge ? (
        <Badge variant="secondary" className="h-4 rounded-full px-1.5 text-[9px] font-normal">
          {badge}
        </Badge>
      ) : null}
      <div className="flex-1 border-t border-border/30" />
    </div>
  );
}

function ModuleTooltip({ item, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        sideOffset={8}
        className="max-w-[13rem] rounded-lg border-border/70 bg-background/95 px-2.5 py-2 text-[11px] shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/90"
      >
        <div className="space-y-0.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">{item.eyebrow}</p>
          <p className="leading-snug text-foreground">{item.desc}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function QuickActionCard({ item, palette, density, counts, countFailures, loadingCounts }) {
  const toneClasses = getToneClasses(palette, item.tone);
  const toneIconClasses = getToneIconClasses(palette, item.tone);
  const paletteClasses = DASHBOARD_PALETTES[palette] || DASHBOARD_PALETTES.dovela;
  const dense = density === 'compact';

  return (
    <ModuleTooltip item={item}>
      <Button
        asChild
        variant="outline"
        className={cn(
          'h-auto rounded-xl border-border/70 p-0 text-left shadow-sm transition-colors',
          paletteClasses.quickCard
        )}
      >
        <Link to={item.link} className="flex w-full items-center gap-2.5 no-underline p-3">
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', toneClasses)}>
            <Icon name={item.icon} size={16} className={toneIconClasses} />
          </span>

          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
                {item.eyebrow}
              </span>
              {item.status ? (
                <Badge variant="outline" className="rounded-full px-2 text-[10px] font-normal">
                  {item.status}
                </Badge>
              ) : null}
            </span>

            <span className="text-[13px] font-semibold leading-tight text-foreground">{item.title}</span>
          </span>

          <ActionMeta
            item={item}
            counts={counts}
            countFailures={countFailures}
            loadingCounts={loadingCounts}
            compact={dense}
          />
        </Link>
      </Button>
    </ModuleTooltip>
  );
}

function GroupedActionCard({ title, description, items, counts, countFailures, loadingCounts, palette, density }) {
  const dense = density === 'compact';

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-3">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
          {description ? <SectionInfoTooltip title={title} description={description} /> : null}
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {items.map((item) => {
            const toneClasses = getToneClasses(palette, item.tone);
            const toneIconClasses = getToneIconClasses(palette, item.tone);

            return (
              <ModuleTooltip key={item.key || item.link} item={item}>
                <Button
                  asChild
                  variant="outline"
                  className={cn('h-auto justify-start px-3 py-2', dense ? 'min-h-[2.85rem]' : 'min-h-[3rem]')}
                >
                  <Link to={item.link} className="flex w-full items-center justify-between gap-2.5 no-underline">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', toneClasses)}>
                        <Icon name={item.icon} size={15} className={toneIconClasses} />
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
                          {item.eyebrow}
                        </span>
                        <span className="block truncate text-[12px] font-semibold text-foreground">{item.title}</span>
                      </span>
                    </span>

                    <ActionMeta
                      item={item}
                      counts={counts}
                      countFailures={countFailures}
                      loadingCounts={loadingCounts}
                      compact={dense}
                    />
                  </Link>
                </Button>
              </ModuleTooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionInfoTooltip({ title, description }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`Detalle de ${title}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="Info" size={13} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="end"
        sideOffset={8}
        className="max-w-[14rem] rounded-lg border-border/70 bg-background/95 px-2.5 py-2 text-[11px] leading-snug text-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/90"
      >
        {description}
      </TooltipContent>
    </Tooltip>
  );
}

function ActionMeta({ item, counts, countFailures, loadingCounts, compact = false }) {
  const countKey = item.countKey || item.link;
  const showCount = item.showCount !== false;
  const hasCount = showCount && Object.prototype.hasOwnProperty.call(counts, countKey);
  const countFailed = showCount && Boolean(countFailures[countKey]);
  const count = counts[countKey];

  if (loadingCounts && (hasCount || countFailed || showCount)) {
    return <Skeleton className="h-5 w-10 rounded" />;
  }

  if (countFailed) {
    return (
      <span className={cn('shrink-0 text-right font-medium text-warning', compact ? 'text-[10px]' : 'text-[11px]')}>
        {COUNT_UNAVAILABLE_LABEL}
      </span>
    );
  }

  if (hasCount && count != null) {
    return (
      <Badge variant="secondary" className="shrink-0 rounded-full px-2 text-[10px] font-normal tabular-nums">
        {count}
      </Badge>
    );
  }

  return <Icon name="ArrowUpRight" size={14} className="shrink-0 text-muted-foreground" />;
}

function RecentExpedientesSummary({ items }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Icon name="History" size={15} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-foreground">Vistos recientemente</h2>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full text-[10px]">
            {items.length}
          </Badge>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-4 text-center text-xs text-muted-foreground">
            Sin recientes.
          </div>
        ) : (
          <div className="grid gap-1.5 p-2">
            {items.map((item) => (
              <Link
                key={item.radicado}
                to={item.href}
                className="flex items-center justify-between rounded-md px-2.5 py-2 no-underline transition-colors hover:bg-muted/50"
              >
                <span className="truncate text-xs font-semibold text-foreground">{item.radicado}</span>
                <Icon name="ArrowUpRight" size={13} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrackedExpedientesSummary({ personal, team, loading, error, stacked = false, density }) {
  const dense = density === 'compact';

  return (
    <section className={cn('grid gap-3', stacked ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2')}>
      <TrackedExpedientesTable
        title="Marcados para mí"
        subtitle="Atención directa"
        icon="Bookmark"
        items={personal}
        loading={loading}
        emptyText="Sin marcados personales."
        dense={dense}
      />
      <TrackedExpedientesTable
        title="Marcados del equipo"
        subtitle="Prioridades compartidas"
        icon="Users"
        items={team}
        loading={loading}
        emptyText="Sin marcados del equipo."
        dense={dense}
      />
      {error ? (
        <div className={cn('rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning', !stacked && 'xl:col-span-2')}>
          {error}
        </div>
      ) : null}
    </section>
  );
}

function TrackedExpedientesTable({ title, subtitle, icon, items, loading, emptyText, dense }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon name={icon} size={15} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
              <p className={cn('truncate text-muted-foreground', dense ? 'text-[10px]' : 'text-[11px]')}>{subtitle}</p>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full text-[10px]">
            {loading ? '…' : items.length}
          </Badge>
        </div>

        <div className="divide-y divide-border/50">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="px-3.5 py-2.5">
                <Skeleton className="mb-2 h-4 w-1/3" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="px-4 py-4 text-center text-xs text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            items.map((item) => <TrackedExpedienteRow key={item.key} item={item} dense={dense} />)
          )}
        </div>

        <div className="border-t border-border/50 px-3.5 py-2.5 text-right">
          <Link to="/licencias/gestion-nueva" className="text-xs font-medium text-primary hover:underline underline-offset-2">
            Ver gestión nueva
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function TrackedExpedienteRow({ item, dense }) {
  return (
    <Link to={item.href} className="block no-underline transition-colors hover:bg-muted/40">
      <div className={cn('grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-3.5', dense ? 'py-2.5' : 'py-3')}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-foreground">{item.radicado}</span>
            <Badge variant="outline" className="h-5 rounded-full px-2 text-[10px] font-normal">
              {item.stateLabel}
            </Badge>
          </div>
          <p className="mt-1 truncate text-xs font-medium text-foreground/90">{item.title}</p>
        </div>
        <div className="flex flex-col items-end justify-between gap-2 text-right">
          <span className="text-[10px] text-muted-foreground">{item.dateLabel}</span>
          <Icon name="ArrowUpRight" size={13} className="text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}

export default Dashboard;
