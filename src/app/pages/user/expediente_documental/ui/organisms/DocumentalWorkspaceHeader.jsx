import { Archive, FileText, Files, History, Monitor, ScanLine } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function legacyMetrics(summary = {}) {
  return [
    { label: 'Unidades', value: summary.totalGroups, icon: Files },
    { label: 'Asientos', value: summary.totalEntries, icon: History },
    { label: 'Físicos', value: summary.physical, icon: Archive },
    { label: 'Digitales', value: summary.digital, icon: Monitor },
    { label: 'Escaneados', value: summary.scanned, icon: ScanLine },
  ];
}

/**
 * Shared header of the documentary workspaces. `metrics` ({label, value, icon, hint})
 * overrides the legacy summary metrics; `subtitle` replaces the default caption.
 */
export function DocumentalWorkspaceHeader({ currentPublic, summary, loading, configuration, metrics: customMetrics, subtitle = 'Archivo del expediente', titleId = 'documental-workspace-title' }) {
  const metrics = customMetrics || legacyMetrics(summary);

  return (
    <header className="flex flex-wrap items-center justify-between gap-[1rem] px-1 py-2">
      <div className="flex min-w-0 items-center gap-[0.75rem]">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/5 text-[hsl(var(--primary))]">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id={titleId}
            className="m-0 text-lg font-semibold tracking-tight text-foreground"
          >
            Gestión documental
          </h2>
          <p className="mb-0 mt-1 text-xs text-muted-foreground">
            <span className="font-mono">{currentPublic || 'Expediente sin radicado'}</span>
            <span className="mx-2 text-border" aria-hidden="true">
              /
            </span>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex max-w-full flex-wrap items-center gap-[0.75rem]">
        <dl
          className="m-0 flex flex-wrap gap-x-[1.25rem] gap-y-[0.75rem]"
          aria-label="Resumen documental"
          aria-busy={loading}
        >
          {metrics.map(({ label, value, icon: Icon, hint }) => (
            <div key={label} className="flex flex-col gap-1" title={hint}>
              <dt className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </dt>
              <dd className="m-0 font-mono text-lg font-semibold leading-6 tabular-nums text-foreground">
                {loading ? <Skeleton className="h-6 w-8" /> : (value ?? '—')}
              </dd>
            </div>
          ))}
        </dl>
        {configuration ? (
          <div className="border-l border-border pl-[0.75rem]">{configuration}</div>
        ) : null}
      </div>
    </header>
  );
}
