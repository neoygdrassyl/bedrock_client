import { ChevronRight } from 'lucide-react';
import { Link, useInRouterContext } from 'react-router-dom';
import { Skeleton } from '@/shared/ui/skeleton';

// Same crumb styling as the shell header (`app/layouts/HeaderBar`), so the bar reads
// identically with an expediente open or closed.
const CRUMB_CLASS = 'shrink-0 cursor-pointer rounded-sm border-0 bg-transparent p-0 text-[13px] text-muted-foreground no-underline transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card';

function CrumbSeparator() {
  return <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />;
}

function CrumbLink({ to, children }) {
  const inRouter = useInRouterContext();
  // Isolated renders (no router) still get a working link.
  if (!inRouter) return <a href={to} className={CRUMB_CLASS}>{children}</a>;
  return <Link to={to} className={CRUMB_CLASS}>{children}</Link>;
}

/** Placeholder chips shown next to the radicado while the expediente loads. */
export function ExpedienteHeaderChipsSkeleton() {
  return (
    <span className="flex items-center gap-2" role="status" aria-label="Cargando expediente">
      <Skeleton className="h-5 w-8 rounded-md" />
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="hidden h-3 w-40 rounded-full md:block" />
    </span>
  );
}

/**
 * Breadcrumb of an open expediente, rendered inside the shell header:
 * `Inicio > Licencias > Gestión > <radicado>` followed by the identity chips (`children`).
 * The earlier crumbs navigate; "Gestión" goes back to the list (`onClose`); the radicado
 * is the current page. `showTrail` / `showList` let the caller drop the earlier crumbs
 * when the header is narrow, and `shortRadicado` replaces the visible text on phone-sized
 * headers (the accessible name and the tooltip keep the full radicado). Returns a fragment: the parent is the header's `<nav>`.
 */
export function ExpedienteHeaderBreadcrumb({ radicado, shortRadicado, onClose, showTrail = true, showList = true, children }) {
  return (
    <>
      {showTrail ? (
        <>
          <CrumbLink to="/dashboard">Inicio</CrumbLink>
          <CrumbSeparator />
          <CrumbLink to="/licencias">Licencias</CrumbLink>
          <CrumbSeparator />
        </>
      ) : null}
      {showList ? (
        <>
          <button type="button" onClick={onClose} className={CRUMB_CLASS} title="Volver al listado de expedientes">
            Gestión
          </button>
          <CrumbSeparator />
        </>
      ) : null}
      <h1
        className="m-0 min-w-16 select-text truncate font-mono text-[13px] font-semibold leading-none text-foreground"
        aria-current="page"
        title={radicado}
      >
        <span className="sr-only">Expediente </span>
        {shortRadicado ? (
          <>
            <span className="sr-only">{radicado}</span>
            <span aria-hidden="true">{shortRadicado}</span>
          </>
        ) : radicado}
      </h1>
      {children ? (
        <div className="ml-2 flex min-w-0 shrink-0 items-center gap-2" data-testid="expediente-header-identity">
          {children}
        </div>
      ) : null}
    </>
  );
}

export default ExpedienteHeaderBreadcrumb;
