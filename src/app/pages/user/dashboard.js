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

const CARD_COLORS = {
  '/licencias': 'border-l-primary',
  '/licencias/gestion': 'border-l-primary',
  '/licencias/gestion-nueva': 'border-l-primary',
  '/peticiones': 'border-l-warning',
  '/ventanilla': 'border-l-accent',
  '/mensajes': 'border-l-[hsl(var(--muted-foreground))]',
  '/calendario': 'border-l-accent',
  '/publicaciones': 'border-l-[hsl(var(--muted-foreground))]',
  '/nomenclatura': 'border-l-warning',
  '/archivo': 'border-l-[hsl(var(--muted-foreground))]',
  '/normas': 'border-l-primary',
  '/uso-suelo': 'border-l-accent',
};

const ICON_COLORS = {
  '/licencias': 'bg-primary/8 text-primary',
  '/licencias/gestion': 'bg-primary/8 text-primary',
  '/licencias/gestion-nueva': 'bg-primary/8 text-primary',
  '/peticiones': 'bg-warning/8 text-warning',
  '/ventanilla': 'bg-accent/8 text-accent',
  '/calendario': 'bg-accent/8 text-accent',
  '/normas': 'bg-primary/8 text-primary',
  '/uso-suelo': 'bg-accent/8 text-accent',
};

const DEFAULT_ICON_COLOR = 'bg-muted/60 text-muted-foreground';

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

/**
 * Dashboard — card grid with real-time counts, role-based modules.
 * Visual reference: Vercel dashboard cards + Stripe data density.
 */
function Dashboard({ breadCrums }) {
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [trackedExpedientes, setTrackedExpedientes] = useState({ personal: [], team: [] });
  const [recentExpedientes, setRecentExpedientes] = useState(() => getRecentExpedientes());
  const [loadingTracked, setLoadingTracked] = useState(true);
  const [trackedError, setTrackedError] = useState(null);

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
        const len = (r) => r.status === 'fulfilled' && Array.isArray(r.value?.data) ? r.value.data.length : null;
        const funData = results[0].status === 'fulfilled' && Array.isArray(results[0].value?.data)
          ? results[0].value.data
          : null;
        const activeFun = Array.isArray(funData) ? funData.filter(f => f.state > 0 && f.state < 100).length : null;
        const pendingFun = Array.isArray(funData) ? funData.filter(f => f.state == 1 || f.state == -1).length : null;

        setCounts({
          '/licencias': pendingFun,
          '/licencias/gestion': activeFun,
          '/licencias/gestion-nueva': activeFun,
          '/peticiones': len(results[1]),
          '/ventanilla': len(results[2]),
          '/mensajes': len(results[3]),
          '/calendario': len(results[4]),
        });

        const personalBookmarks = results[5].status === 'fulfilled' ? normalizeList(results[5].value?.data) : [];
        const teamBookmarks = results[6].status === 'fulfilled' ? normalizeList(results[6].value?.data) : [];
        setTrackedExpedientes({
          personal: buildTrackedExpedientes(personalBookmarks, funData || []),
          team: buildTrackedExpedientes(teamBookmarks, funData || []),
        });
        setTrackedError(results[5].status === 'rejected' || results[6].status === 'rejected' ? 'No se pudieron cargar todos los marcados.' : null);
      } catch {
        // Counts are optional enhancement
      } finally {
        if (!cancelled) setLoadingCounts(false);
        if (!cancelled) setLoadingTracked(false);
      }
    }
    fetchCounts();
    return () => { cancelled = true; };
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

  const workModules = [
    { title: 'Radicar Licencias', icon: 'FileText', desc: 'Nuevas solicitudes', link: '/licencias' },
    { title: 'Gestionar Licencias', icon: 'FolderOpen', desc: 'Seguimiento y trámite', link: '/licencias/gestion' },
    { title: 'Gestión Licencias Nuevo', icon: 'Layers', desc: 'Nueva gestión', link: '/licencias/gestion-nueva' },
    { title: 'Peticiones PQRS', icon: 'FileSpreadsheet', desc: 'Quejas, reclamos y sugerencias', link: '/peticiones' },
    { title: 'Ventanilla Única', icon: 'FileInput', desc: 'Radicación de documentos', link: '/ventanilla' },
    { title: 'Mensajes y Chat', icon: 'Mail', desc: 'Chat interno y buzón externo', link: '/mensajes' },
    { title: 'Calendario de Citas', icon: 'Calendar', desc: 'Agenda y programación', link: '/calendario' },
    { title: 'Publicaciones', icon: 'Newspaper', desc: 'Novedades y resoluciones', link: '/publicaciones' },
    { title: 'Nomenclaturas', icon: 'Signpost', desc: 'Asignación predial', link: '/nomenclatura' },
    { title: 'Archivo', icon: 'Archive', desc: 'Expedientes y documentos', link: '/archivo' },
  ];

  if (_GLOBAL_ID === 'cb1') {
    workModules.push({ title: 'Normas Urbanas', icon: 'Home', desc: 'Consulta normativa', link: '/normas' });
    workModules.push({ title: 'Uso de Suelo', icon: 'MapPin', desc: 'Certificados de uso', link: '/uso-suelo' });
  }

  const userName = useMemo(() => getUserDisplayName(), []);

  const utilityModules = [
    { title: 'Documentos', icon: 'FileText', desc: 'Plantillas y formatos', link: '/documentos' },
    { title: 'Calculadora de Expensas', icon: 'Calculator', desc: 'Liquidación de costos', link: '/calculadora' },
    { title: 'Consecutivos', icon: 'Book', desc: 'Diccionario de radicados', link: '/consecutivos' },
    { title: 'Manual de Usuario', icon: 'BookOpen', desc: 'Guía de uso del sistema', link: '/ayuda' },
    { title: 'Base de Datos Profesionales', icon: 'HardHat', desc: 'Profesionales registrados', link: '/profesionales' },
    { title: 'Historial de Profesionales', icon: 'Contact', desc: 'Certificaciones emitidas', link: '/certificados' },
  ];

  return (
    <div className="w-full space-y-5 animate-fade-in-up">
      {/* Greeting */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-xs text-muted-foreground/70">{getFormattedDate()} · Resumen operativo personal</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/mensajes" className="no-underline">
              <Icon name="MessageCircle" size={14} />
              Abrir chat completo
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/licencias/gestion-nueva" className="no-underline">
              <Icon name="Layers" size={14} />
              Gestión nueva
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="space-y-4 xl:w-full xl:max-w-[58rem] xl:flex-none">
          <QuickActionsPanel />

          {/* Operation & Management */}
          <section className="space-y-2.5">
            <SectionHeader title="Operación y Gestión" count={workModules.length} />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {workModules.map((mod) => {
                const hasCount = Object.prototype.hasOwnProperty.call(counts, mod.link);
                return (
                  <ModuleCard
                    key={mod.link}
                    {...mod}
                    count={counts[mod.link]}
                    hasCount={hasCount}
                    loadingCount={loadingCounts}
                  />
                );
              })}
            </div>
          </section>

          {/* Utilities */}
          <section className="space-y-2.5">
            <SectionHeader title="Utilidades y Documentación" />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {utilityModules.map((mod) => (
                <ModuleCard key={mod.link} {...mod} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:ml-auto xl:w-[26rem] xl:flex-none">
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
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3.5 py-3">
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
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
        {title}
      </h2>
      {count != null && (
        <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-normal rounded-full">
          {count}
        </Badge>
      )}
      <div className="flex-1 border-t border-border/30" />
    </div>
  );
}

function QuickActionsPanel() {
  const actions = [
    { label: 'Nueva radicación', description: 'Crear solicitud', icon: 'FilePlus', link: '/licencias', primary: true },
    { label: 'Gestionar licencias', description: 'Centro operativo', icon: 'Layers', link: '/licencias/gestion-nueva' },
    { label: 'Chat interno', description: 'Hablar con el equipo', icon: 'MessageCircle', link: '/mensajes' },
    { label: 'Alarmas', description: 'Configurar y revisar', icon: 'BellRing', link: '/configuracion' },
  ];

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Acciones principales</h2>
            <p className="text-xs text-muted-foreground">Atajos de operación diaria</p>
          </div>
          <Badge variant="secondary" className="rounded-full text-[10px]">Inicio</Badge>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => (
            <Button
              key={action.link}
              asChild
              variant={action.primary ? 'default' : 'outline'}
              className="h-auto min-h-[3.15rem] justify-start px-3.5 py-2.5 text-left"
            >
              <Link to={action.link} className="no-underline">
                <Icon name={action.icon} size={15} className="shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold">{action.label}</span>
                  <span className="block truncate text-[11px] opacity-75">{action.description}</span>
                </span>
              </Link>
            </Button>
          ))}
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
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-3.5 py-3">
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
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="px-3.5 py-3">
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

        <div className="border-t border-border/50 px-3.5 py-2.5 text-right">
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
          <p className="mt-1 truncate text-xs font-medium text-foreground/90">{item.title}</p>
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

function ModuleCard({ title, icon, desc, link, count, hasCount = false, loadingCount }) {
  const borderColor = CARD_COLORS[link] || 'border-l-border';
  const iconColor = ICON_COLORS[link] || DEFAULT_ICON_COLOR;

  return (
    <Link to={link} className="no-underline group h-full">
      <Card className={cn(
        'hover:shadow-md hover:border-border/60 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-border/40 h-full',
        'border-l-2',
        borderColor
      )}>
        <CardContent className="flex items-start gap-3.5 p-4 min-h-[5.4rem]">
          <div className={cn(
            'flex items-center justify-center w-9 h-9 rounded-md shrink-0 transition-all duration-200 group-hover:scale-105',
            iconColor
          )}>
            <Icon name={icon} size={17} />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-between gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[14px] font-medium text-foreground leading-tight group-hover:text-primary transition-colors duration-150 line-clamp-2">{title}</h3>
              {loadingCount && hasCount ? (
                <Skeleton className="h-5 w-7 rounded" />
              ) : hasCount && count != null ? (
                <span className="text-lg font-semibold text-foreground tabular-nums leading-none">
                  {count}
                </span>
              ) : null}
            </div>
            <p className="text-[12px] text-muted-foreground/70 line-clamp-2">{desc}</p>
            {!loadingCount && hasCount && count == null ? (
              <p className="text-[10px] text-warning mt-1">Conteo no disponible</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default Dashboard;
