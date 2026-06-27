import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import FUNService from '../../services/fun.service';
import PqrsMainService from '../../services/pqrs_main.service';
import SubmitService from '../../services/submit.service';
import MailboxService from '../../services/mailbox.service';
import AppointmentsService from '../../services/appointments.service';
import BookmarkService from '../../services/bookmark.service';
import { RECENT_EXPEDIENTES_CHANGED_EVENT, getRecentExpedientes } from './fun_forms/utils/expedienteWorkspaceRoute';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

const ICON_COLORS = {
  '/licencias': 'bg-primary/8 text-primary',
  '/licencias/gestion': 'bg-primary/8 text-primary',
  '/licencias/gestion-nueva': 'bg-primary/8 text-primary',
  '/peticiones': 'bg-warning/8 text-warning',
  '/ventanilla': 'bg-accent/8 text-accent',
  '/configuracion?tab=alarmas': 'bg-warning/8 text-warning',
  '/calendario': 'bg-accent/8 text-accent',
  '/normas': 'bg-primary/8 text-primary',
  '/uso-suelo': 'bg-accent/8 text-accent',
  '/nomenclatura': 'bg-warning/8 text-warning',
  '/simulador/documentos': 'bg-primary/8 text-primary',
  '/simulador/legal': 'bg-accent/8 text-accent',
  '/archivo': 'bg-muted text-muted-foreground',
  '/documentos': 'bg-primary/8 text-primary',
  '/consecutivos': 'bg-muted text-muted-foreground',
  '/publicaciones': 'bg-muted text-muted-foreground',
  '/mensajes': 'bg-muted text-muted-foreground',
  '/calculadora': 'bg-accent/8 text-accent',
  '/profesionales': 'bg-warning/8 text-warning',
  '/certificados': 'bg-muted text-muted-foreground',
  '/ayuda': 'bg-muted text-muted-foreground',
  '/sellos': 'bg-primary/8 text-primary',
};

const DEFAULT_ICON_COLOR = 'bg-muted text-muted-foreground';
const TRACKED_SKELETON_ROWS = ['tracked-skeleton-1', 'tracked-skeleton-2', 'tracked-skeleton-3'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function getFormattedDate() {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
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

function deferDashboardWork(callback) {
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(callback, { timeout: 1200 });
    return () => window.cancelIdleCallback?.(idleId);
  }

  const timeoutId = window.setTimeout(callback, 150);
  return () => window.clearTimeout(timeoutId);
}

/**
 * Dashboard — card grid with real-time counts, role-based modules.
 * Visual reference: Vercel dashboard cards + Stripe data density.
 */
function Dashboard() {
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [trackedExpedientes, setTrackedExpedientes] = useState({ personal: [], team: [] });
  const [recentExpedientes, setRecentExpedientes] = useState(() => getRecentExpedientes());
  const [loadingTracked, setLoadingTracked] = useState(true);
  const [trackedError, setTrackedError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let cancelTrackedWork = () => {};

    async function fetchTrackedExpedientes(funData) {
      try {
        const results = await Promise.allSettled([
          BookmarkService.list({ scope: 'personal' }),
          BookmarkService.list({ scope: 'team' }),
        ]);
        if (cancelled) return;

        const personalBookmarks = results[0].status === 'fulfilled' ? normalizeList(results[0].value?.data) : [];
        const teamBookmarks = results[1].status === 'fulfilled' ? normalizeList(results[1].value?.data) : [];
        setTrackedExpedientes({
          personal: buildTrackedExpedientes(personalBookmarks, funData || []),
          team: buildTrackedExpedientes(teamBookmarks, funData || []),
        });
        setTrackedError(results[0].status === 'rejected' || results[1].status === 'rejected' ? 'No se pudieron cargar todos los marcados.' : null);
      } catch {
        if (!cancelled) setTrackedError('No se pudieron cargar todos los marcados.');
      } finally {
        if (!cancelled) setLoadingTracked(false);
      }
    }

    async function fetchCounts() {
      try {
        const results = await Promise.allSettled([
          FUNService.getAll_fun(),
          PqrsMainService.getAll(),
          SubmitService.getAll(),
          MailboxService.getAll(),
          AppointmentsService.getAll(),
        ]);
        if (cancelled) return;
        const len = (r) => r.status === 'fulfilled' && Array.isArray(r.value?.data) ? r.value.data.length : null;
        const funData = results[0].status === 'fulfilled' && Array.isArray(results[0].value?.data)
          ? results[0].value.data
          : null;
        const activeFun = Array.isArray(funData) ? funData.filter(f => f.state > 0 && f.state < 100).length : null;
        const pendingFun = Array.isArray(funData) ? funData.filter(f => Number(f.state) === 1 || Number(f.state) === -1).length : null;

        setCounts({
          '/licencias': pendingFun,
          '/licencias/gestion': activeFun,
          '/licencias/gestion-nueva': activeFun,
          '/peticiones': len(results[1]),
          '/ventanilla': len(results[2]),
          '/mensajes': len(results[3]),
          '/calendario': len(results[4]),
        });

        cancelTrackedWork = deferDashboardWork(() => fetchTrackedExpedientes(funData || []));
      } catch {
        // Counts are optional enhancement
        if (!cancelled) setLoadingTracked(false);
      } finally {
        if (!cancelled) setLoadingCounts(false);
      }
    }
    fetchCounts();
    return () => {
      cancelled = true;
      cancelTrackedWork();
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

  const dashboardGroups = [
    {
      key: 'radicacion',
      title: 'Radicación',
      description: 'Ingreso, recepción y consulta inicial de solicitudes',
      items: [
        { title: 'Nueva radicación', icon: 'FileText', desc: 'Crear y revisar radicaciones realizadas', link: '/licencias' },
        { title: 'Ventanilla Única', icon: 'FileInput', desc: 'Recepción documental completa', link: '/ventanilla' },
      ],
    },
    {
      key: 'gestion-curaduria',
      title: 'Gestión Curaduría',
      description: 'Control operativo de expedientes, PQRS y alarmas',
      items: [
        { title: 'Gestionar Licencias Nuevo', icon: 'Layers', desc: 'Dashboard operativo en desarrollo', link: '/licencias/gestion-nueva', status: 'En desarrollo' },
        { title: 'Gestionar Licencias', icon: 'FolderOpen', desc: 'Gestión clásica de expedientes', link: '/licencias/gestion' },
        { title: 'Peticiones PQRS', icon: 'FileSpreadsheet', desc: 'Quejas, reclamos y solicitudes', link: '/peticiones' },
        { title: 'Alarmas', icon: 'BellRing', desc: 'Configuración y seguimiento SLA', link: '/configuracion?tab=alarmas', status: 'En desarrollo' },
      ],
    },
    {
      key: 'otras-actuaciones',
      title: 'Otras actuaciones',
      description: 'Normas, usos y nomenclaturas según curaduría',
      items: [
        ...(_GLOBAL_ID === 'cb1'
          ? [
              { title: 'Normas Urbanas', icon: 'Home', desc: 'Disponible para esta curaduría', link: '/normas' },
              { title: 'Usos del suelo', icon: 'MapPin', desc: 'Disponible para esta curaduría', link: '/uso-suelo' },
            ]
          : []),
        { title: 'Nomenclaturas', icon: 'Signpost', desc: 'Asignación y consulta predial', link: '/nomenclatura' },
      ],
    },
    {
      key: 'archivo-expedicion',
      title: 'Archivo y Expedición',
      description: 'Repositorio, consecutivos y documentos de soporte',
      items: [
        { title: 'Archivo', icon: 'Archive', desc: 'Repositorio principal de expedientes', link: '/archivo' },
        { title: 'Diccionario de consecutivos', icon: 'Book', desc: 'Consulta de radicados y series', link: '/consecutivos' },
        { title: 'Documentos', icon: 'FileText', desc: 'Plantillas, formatos e instrumentos', link: '/documentos' },
      ],
    },
    {
      key: 'comunicaciones',
      title: 'Comunicaciones',
      description: 'Publicación, mensajería, citas y chat interno',
      items: [
        { title: 'Publicaciones', icon: 'Newspaper', desc: 'Novedades y resoluciones', link: '/publicaciones' },
        { title: 'Buzón de mensajes', icon: 'Mail', desc: 'Mensajes y correspondencia externa', link: '/mensajes' },
        { title: 'Calendario de citas', icon: 'Calendar', desc: 'Agenda y programación', link: '/calendario' },
        { key: 'chat-curaduria', title: 'Chat curaduría', icon: 'MessageCircle', desc: 'Conversaciones internas del equipo', link: '/mensajes', showCount: false },
      ],
    },
    {
      key: 'simulador',
      title: 'Simulador',
      description: 'Herramientas de consulta previa sin modificar expedientes',
      items: [
        { title: 'Documentos', icon: 'FileText', desc: 'Simula requisitos por actuación, trámite y modalidad', link: '/simulador/documentos' },
        { title: 'Legal', icon: 'Gavel', desc: 'Revisa la guía jurídica existente del flujo legal', link: '/simulador/legal' },
      ],
    },
    {
      key: 'utilidades',
      title: 'Utilidades',
      description: 'Herramientas auxiliares y consultas de apoyo',
      items: [
        { title: 'Calculadora de expensas', icon: 'Calculator', desc: 'Liquidación de costos', link: '/calculadora' },
        { title: 'Base de datos profesionales', icon: 'HardHat', desc: 'Profesionales registrados', link: '/profesionales' },
        { title: 'Historial de profesionales', icon: 'Contact', desc: 'Certificaciones emitidas', link: '/certificados' },
        { title: 'Manual de usuario', icon: 'BookOpen', desc: 'Guía de uso del sistema', link: '/ayuda' },
        { title: 'Sellos', icon: 'Stamp', desc: 'Consulta y generación de sellos', link: '/sellos' },
      ],
    },
  ].filter((group) => group.items.length > 0);

  const userName = useMemo(() => getUserDisplayName(), []);

  return (
    <div className="w-full space-y-5 animate-fade-in-up" data-dovela-tour-id="dashboard-main">
      {/* Greeting */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between" data-dovela-tour-id="dashboard-hero">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-xs text-muted-foreground">{getFormattedDate()} · Resumen operativo personal</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="space-y-4 xl:w-full xl:max-w-[58rem] xl:flex-none">
          <section className="space-y-2.5" data-dovela-tour-id="dashboard-operations">
            <SectionHeader title="Módulos agrupados" count={dashboardGroups.length} />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3" data-dovela-tour-id="dashboard-quick-actions">
              {dashboardGroups.map((group) => (
                <GroupedActionCard
                  key={group.key}
                  title={group.title}
                  description={group.description}
                  items={group.items}
                  counts={counts}
                  loadingCounts={loadingCounts}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:ml-auto xl:w-[26rem] xl:flex-none" data-dovela-tour-id="dashboard-tracking">
          <RecentExpedientesSummary items={recentExpedientes} />
          <TrackedExpedientesSummary
            personal={trackedExpedientes.personal}
            team={trackedExpedientes.team}
            loading={loadingTracked}
            error={trackedError}
            stacked
          />
        </aside>
      </div>
    </div>
  );
}

function RecentExpedientesSummary({ items }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-3">
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
          <div className="px-4 py-5 text-center text-xs text-muted-foreground">
            Aún no hay expedientes recientes.
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

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center gap-2.5">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {title}
      </h2>
      {count != null && (
        <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-normal rounded-full">
          {count}
        </Badge>
      )}
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

function GroupedActionCard({ title, description, items, counts, loadingCounts }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-3.5">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {items.map((item) => {
            const iconColor = ICON_COLORS[item.link] || DEFAULT_ICON_COLOR;
            const countKey = item.countKey || item.link;
            const hasCount = item.showCount !== false && Object.prototype.hasOwnProperty.call(counts, countKey);
            const count = counts[countKey];
            const status = item.status || null;

            return (
              <Button
                key={item.key || item.link}
                asChild
                variant="outline"
                className="h-auto min-h-[3.2rem] justify-start border-border bg-background px-3 py-2.5 shadow-sm"
              >
                <Link to={item.link} className="flex w-full items-center justify-between gap-3 no-underline">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', iconColor)}>
                      <Icon name={item.icon} size={15} />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-[13px] font-semibold text-foreground">{item.title}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{item.desc}</span>
                    </span>
                  </span>
                  <span className="shrink-0">
                    {status ? (
                      <Badge variant="outline" className="rounded-full px-2 text-[10px] font-normal">
                        {status}
                      </Badge>
                    ) : loadingCounts && hasCount ? (
                      <Skeleton className="h-5 w-7 rounded" />
                    ) : hasCount && count != null ? (
                      <Badge variant="secondary" className="rounded-full px-2 text-[10px] font-normal tabular-nums">
                        {count}
                      </Badge>
                    ) : hasCount ? (
                      <Badge variant="outline" className="rounded-full px-2 text-[10px] font-normal text-muted-foreground">
                        conteo no disponible
                      </Badge>
                    ) : (
                      <Icon name="ArrowUpRight" size={14} className="text-muted-foreground" />
                    )}
                  </span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TrackedExpedientesSummary({ personal, team, loading, error, stacked = false }) {
  return (
    <section className={cn('grid gap-3', stacked ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2')}>
      <TrackedExpedientesTable
        title="Marcados para mí"
        subtitle="Expedientes que requieren tu atención directa"
        icon="Bookmark"
        items={personal}
        loading={loading}
        emptyText="No tienes expedientes marcados para seguimiento personal."
      />
      <TrackedExpedientesTable
        title="Marcados del equipo"
        subtitle="Prioridades compartidas por el equipo de curaduría"
        icon="Users"
        items={team}
        loading={loading}
        emptyText="Aún no hay expedientes marcados para el equipo."
      />
      {error && (
        <div className={cn('rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning', !stacked && 'lg:col-span-2')}>
          {error}
        </div>
      )}
    </section>
  );
}

function TrackedExpedientesTable({ title, subtitle, icon, items, loading, emptyText }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon name={icon} size={15} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
              <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full text-[10px]">
            {loading ? '…' : items.length}
          </Badge>
        </div>

        <div className="divide-y divide-border/50">
          {loading ? (
            TRACKED_SKELETON_ROWS.map((key) => (
              <div key={key} className="px-3.5 py-3">
                <Skeleton className="mb-2 h-4 w-1/3" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            items.map((item) => <TrackedExpedienteRow key={item.key} item={item} />)
          )}
        </div>

        <div className="border-t border-border px-3.5 py-2.5 text-right">
          <Link to="/licencias/gestion-nueva" className="text-xs font-medium text-primary hover:underline underline-offset-2">
            Ver gestión nueva
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function TrackedExpedienteRow({ item }) {
  return (
    <Link to={item.href} className="block no-underline hover:bg-muted/40 transition-colors">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-3.5 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-foreground">{item.radicado}</span>
            <Badge variant="outline" className="h-5 rounded-full px-2 text-[10px] font-normal">
              {item.stateLabel}
            </Badge>
          </div>
          <p className="mt-1 truncate text-xs font-medium text-foreground">{item.title}</p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{item.description}</p>
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
