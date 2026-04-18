import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

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
  '/licencias': 'bg-primary/10 text-primary group-hover:bg-primary',
  '/licencias/gestion': 'bg-primary/10 text-primary group-hover:bg-primary',
  '/licencias/gestion-nueva': 'bg-primary/10 text-primary group-hover:bg-primary',
  '/peticiones': 'bg-warning/10 text-warning group-hover:bg-warning',
  '/ventanilla': 'bg-accent/10 text-accent group-hover:bg-accent',
  '/calendario': 'bg-accent/10 text-accent group-hover:bg-accent',
  '/normas': 'bg-primary/10 text-primary group-hover:bg-primary',
  '/uso-suelo': 'bg-accent/10 text-accent group-hover:bg-accent',
};

const DEFAULT_ICON_COLOR = 'bg-muted text-muted-foreground group-hover:bg-muted-foreground';

/**
 * Formats a greeting based on time of day.
 */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * Format current date in Spanish.
 */
function getFormattedDate() {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

/**
 * Dashboard — modern card grid with Lucide icons and role-based modules.
 * Uses new Spanish routes and shadcn/ui Card components.
 */
function Dashboard({ breadCrums }) {
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
    <div className="space-y-8 p-2 md:p-4">
      {/* Page heading with greeting */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{getGreeting()}</h1>
        <p className="text-sm text-muted-foreground">{getFormattedDate()}</p>
      </div>

      {/* Operation & Management */}
      <section className="space-y-3">
        <SectionHeader title="Operación y Gestión" subtitle={`${workModules.length} módulos`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {workModules.map((mod) => (
            <ModuleCard key={mod.link} {...mod} />
          ))}
        </div>
      </section>

      {/* Utilities */}
      <section className="space-y-3">
        <SectionHeader title="Utilidades y Documentación" subtitle="Soporte y consulta" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {utilityModules.map((mod) => (
            <ModuleCard key={mod.link} {...mod} />
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Section header with title and count/subtitle badge.
 */
function SectionHeader({ title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="flex-1 border-t border-border/40" />
      {subtitle && (
        <span className="text-[10px] text-muted-foreground/50 font-medium">{subtitle}</span>
      )}
    </div>
  );
}

/**
 * Single module card with icon, title, description, and colored left border.
 * Layout is stat-ready: when `count` is provided in future, it renders prominently.
 */
function ModuleCard({ title, icon, desc, link, count }) {
  const borderColor = CARD_COLORS[link] || 'border-l-border';
  const iconColor = ICON_COLORS[link] || DEFAULT_ICON_COLOR;

  return (
    <Link to={link} className="no-underline">
      <Card className={cn(
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group border-border/60',
        'border-l-[3px]',
        borderColor
      )}>
        <CardContent className="flex items-start gap-3.5 p-4">
          <div className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-colors duration-200',
            'group-hover:text-white',
            iconColor
          )}>
            <Icon name={icon} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-foreground leading-tight">{title}</h3>
              {count != null && (
                <span className="text-lg font-bold text-foreground tabular-nums leading-none">
                  {count}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default Dashboard;
