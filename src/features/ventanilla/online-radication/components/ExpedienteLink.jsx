import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { buildExpedienteWorkspaceUrl } from '../../../expediente/fun/fun_forms/utils/expedienteWorkspaceRoute';

/** Route of the FUN 0 workspace, the same one search results and dashboards open. */
export function expedienteHref(funIdPublic) {
  return funIdPublic ? buildExpedienteWorkspaceUrl({ id_public: funIdPublic }, { section: 'detalles' }) : '';
}

/**
 * Link to the expediente workspace. Opens in a new tab like `openExpedienteWorkspace`, so the
 * inbox keeps its filters and position.
 */
export function ExpedienteLink({ funIdPublic, className, children, showIcon = true }) {
  const href = expedienteHref(funIdPublic);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-sm font-mono font-semibold text-[hsl(var(--primary))] no-underline underline-offset-2',
        'hover:text-[hsl(var(--primary))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {children ?? funIdPublic}
      {showIcon ? <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" /> : null}
      <span className="sr-only"> (abre el expediente en una pestaña nueva)</span>
    </a>
  );
}
