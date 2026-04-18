import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/icon';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

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
    <div className="space-y-6 p-2 md:p-4">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Panel de Control</h1>
        <p className="text-sm text-muted-foreground mt-1">Accesos rápidos a los módulos del sistema</p>
      </div>

      {/* Operation & Management */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Operación y Gestión</h2>
          <span className="text-xs text-muted-foreground">Accesos principales</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {workModules.map((mod) => (
            <ModuleCard key={mod.link} {...mod} />
          ))}
        </div>
      </section>

      {/* Utilities */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Utilidades y Documentación</h2>
          <span className="text-xs text-muted-foreground">Soporte y consulta</span>
        </div>
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
 * Single module card with icon, title, and description.
 */
function ModuleCard({ title, icon, desc, link }) {
  return (
    <Link to={link} className="no-underline">
      <Card className="hover:shadow-md transition-shadow cursor-pointer group border-border/60">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
            <Icon name={icon} size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-foreground truncate">{title}</h3>
            <p className="text-xs text-muted-foreground truncate">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default Dashboard;
