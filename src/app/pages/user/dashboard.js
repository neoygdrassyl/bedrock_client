import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import FUNService from '../../services/fun.service';
import PqrsMainService from '../../services/pqrs_main.service';
import SubmitService from '../../services/submit.service';
import MailboxService from '../../services/mailbox.service';
import AppointmentsService from '../../services/appointments.service';

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

/**
 * Dashboard — card grid with real-time counts, role-based modules.
 * Visual reference: Vercel dashboard cards + Stripe data density.
 */
function Dashboard({ breadCrums }) {
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchCounts() {
      try {
        const results = await Promise.allSettled([
          FUNService.getAll(),
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
      } catch {
        // Counts are optional enhancement
      } finally {
        if (!cancelled) setLoadingCounts(false);
      }
    }
    fetchCounts();
    return () => { cancelled = true; };
  }, []);

  const workModules = [
    { title: 'Radicar Licencias', icon: 'FileText', desc: 'Nuevas solicitudes', link: '/licencias' },
    { title: 'Gestionar Licencias', icon: 'FolderOpen', desc: 'Seguimiento y trámite', link: '/licencias/gestion' },
    { title: 'Gestión Licencias Nuevo', icon: 'Layers', desc: 'Nueva gestión', link: '/licencias/gestion-nueva' },
    { title: 'Peticiones PQRS', icon: 'FileSpreadsheet', desc: 'Quejas, reclamos y sugerencias', link: '/peticiones' },
    { title: 'Ventanilla Única', icon: 'FileInput', desc: 'Radicación de documentos', link: '/ventanilla' },
    { title: 'Buzón de Mensajes', icon: 'Mail', desc: 'Comunicaciones internas', link: '/mensajes' },
    { title: 'Calendario de Citas', icon: 'Calendar', desc: 'Agenda y programación', link: '/calendario' },
    { title: 'Publicaciones', icon: 'Newspaper', desc: 'Novedades y resoluciones', link: '/publicaciones' },
    { title: 'Nomenclaturas', icon: 'Signpost', desc: 'Asignación predial', link: '/nomenclatura' },
    { title: 'Archivo', icon: 'Archive', desc: 'Expedientes y documentos', link: '/archivo' },
  ];

  if (_GLOBAL_ID === 'cb1') {
    workModules.push({ title: 'Normas Urbanas', icon: 'Home', desc: 'Consulta normativa', link: '/normas' });
    workModules.push({ title: 'Uso de Suelo', icon: 'MapPin', desc: 'Certificados de uso', link: '/uso-suelo' });
  }

  const utilityModules = [
    { title: 'Documentos', icon: 'FileText', desc: 'Plantillas y formatos', link: '/documentos' },
    { title: 'Calculadora de Expensas', icon: 'Calculator', desc: 'Liquidación de costos', link: '/calculadora' },
    { title: 'Consecutivos', icon: 'Book', desc: 'Diccionario de radicados', link: '/consecutivos' },
    { title: 'Manual de Usuario', icon: 'BookOpen', desc: 'Guía de uso del sistema', link: '/ayuda' },
    { title: 'Base de Datos Profesionales', icon: 'HardHat', desc: 'Profesionales registrados', link: '/profesionales' },
    { title: 'Historial de Profesionales', icon: 'Contact', desc: 'Certificaciones emitidas', link: '/certificados' },
  ];

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in-up">
      {/* Greeting */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{getGreeting()}</h1>
        <p className="text-xs text-muted-foreground/70">{getFormattedDate()}</p>
      </div>

      {/* Operation & Management */}
      <section className="space-y-2.5">
        <SectionHeader title="Operación y Gestión" count={workModules.length} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {utilityModules.map((mod) => (
            <ModuleCard key={mod.link} {...mod} />
          ))}
        </div>
      </section>
    </div>
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
        <CardContent className="flex items-start gap-3 p-3.5 min-h-[4.5rem]">
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md shrink-0 transition-all duration-200 group-hover:scale-105',
            iconColor
          )}>
            <Icon name={icon} size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1.5">
              <h3 className="text-[13px] font-medium text-foreground leading-tight group-hover:text-primary transition-colors duration-150 line-clamp-1">{title}</h3>
              {loadingCount && hasCount ? (
                <Skeleton className="h-5 w-7 rounded" />
              ) : hasCount && count != null ? (
                <span className="text-base font-semibold text-foreground tabular-nums leading-none">
                  {count}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">{desc}</p>
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
