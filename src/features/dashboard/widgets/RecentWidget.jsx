import { memo } from 'react';
import { Link } from 'react-router-dom';
import { TINTS } from '../dashboardConfig';
import { WidgetCard, WidgetIcon } from './WidgetCard';

const SECTION_LABELS = {
  documentos: 'Documentos',
  'documentos-new': 'Documentos',
  legal: 'Revisión jurídica',
  arquitectura: 'Revisión arquitectónica',
  estructural: 'Revisión estructural',
  tiempos: 'Tiempos',
  expedicion: 'Expedición',
};

const relativeFormat = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' });
const RELATIVE_STEPS = [
  ['minute', 60, 60],
  ['hour', 3600, 24],
  ['day', 86400, 7],
  ['week', 604800, 5],
];

function formatRelative(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  const seconds = (date.getTime() - Date.now()) / 1000;
  if (Math.abs(seconds) < 60) return 'hace un momento';
  for (const [unit, size, limit] of RELATIVE_STEPS) {
    const amount = Math.round(seconds / size);
    if (Math.abs(amount) < limit) return relativeFormat.format(amount, unit);
  }
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' }).format(date);
}

// The workspace URL keeps the section the user was in (e.g. ?section=documentos).
function sectionLabel(href) {
  try {
    const section = new URL(href, window.location.origin).searchParams.get('section');
    if (!section) return 'Expediente';
    return SECTION_LABELS[section] || section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');
  } catch {
    return 'Expediente';
  }
}

function RecentWidget({ items }) {
  const [latest, ...rest] = items;

  return (
    <WidgetCard
      icon="History"
      tint={TINTS.accent}
      title="Continuar trabajando"
      subtitle="Expedientes que abriste hace poco"
      count={items.length}
      headingId="dashboard-widget-recent-title"
    >
      {!latest ? (
        <div className="mx-4 mb-4 mt-1 flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-4">
          <WidgetIcon name="Search" size={18} className="shrink-0 text-muted-foreground" />
          <p className="m-0 !text-xs text-muted-foreground">
            Los expedientes que abras aparecerán aquí para retomarlos en un clic. Usa <kbd className="rounded border border-border bg-muted px-1 font-sans !text-xs text-muted-foreground shadow-none">Ctrl K</kbd> para buscar uno.
          </p>
        </div>
      ) : (
        <div className="space-y-2 px-3 pb-3">
          <Link
            to={latest.href}
            className="group/latest flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] px-3.5 py-3 text-foreground no-underline transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <WidgetIcon name="FolderOpen" size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block !text-xs font-medium text-primary">Último abierto · {sectionLabel(latest.href)}</span>
              <span className="block truncate font-mono !text-sm font-semibold text-foreground">{latest.radicado}</span>
            </span>
            <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 !text-xs font-medium text-primary-foreground transition-transform group-hover/latest:translate-x-0.5 sm:flex">
              Retomar
              <WidgetIcon name="ArrowRight" size={13} />
            </span>
          </Link>

          {rest.length > 0 && (
            <ul className="m-0 grid list-none gap-0.5 p-0">
              {rest.map((item) => {
                const when = formatRelative(item.updatedAt);
                return (
                  <li key={item.radicado}>
                    <Link
                      to={item.href}
                      className="group/row flex items-center gap-3 rounded-xl px-2.5 py-2 text-foreground no-underline transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover/row:bg-primary/10 group-hover/row:text-primary">
                        <WidgetIcon name="FileText" size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono !text-xs font-semibold text-foreground">{item.radicado}</span>
                        <span className="block truncate !text-xs text-muted-foreground">{sectionLabel(item.href)}</span>
                      </span>
                      {when && <span className="shrink-0 !text-xs text-muted-foreground">{when}</span>}
                      <WidgetIcon name="ArrowUpRight" size={14} className="shrink-0 text-muted-foreground/60 group-hover/row:text-primary" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </WidgetCard>
  );
}

export default memo(RecentWidget);
