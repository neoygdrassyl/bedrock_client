import { Archive, FileText, Files, History, Info, Monitor, ScanLine } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import FunUpdateSectionLegend from '@/app/pages/user/fun_forms/components/FunUpdateSectionLegend.jsx';

function legacyMetrics(summary = {}) {
  return [
    { label: 'Unidades', value: summary.totalGroups, icon: Files },
    { label: 'Asientos', value: summary.totalEntries, icon: History },
    { label: 'Físicos', value: summary.physical, icon: Archive },
    { label: 'Digitales', value: summary.digital, icon: Monitor },
    { label: 'Escaneados', value: summary.scanned, icon: ScanLine },
  ];
}

function MetricHint({ label, hint }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`${label}: ${hint}`}
          className="inline-grid h-4 w-4 shrink-0 cursor-help place-items-center rounded-full bg-transparent p-0 text-muted-foreground/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Info className="h-3 w-3" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[16rem] text-xs leading-4">{hint}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Shared header of the documentary workspaces: optional module title (same heading as the
 * FUN "Actualizar" sections) and a compact KPI strip. `metrics` ({label, value, icon, hint})
 * overrides the legacy summary metrics; `showTitle={false}` keeps only the KPI strip when the
 * module title is already rendered above (tabs of Documentos new).
 */
export function DocumentalWorkspaceHeader({ currentPublic, summary, loading, configuration, metrics: customMetrics, subtitle = 'Archivo del expediente', titleId = 'documental-workspace-title', showTitle = true }) {
  const metrics = customMetrics || legacyMetrics(summary);

  return (
    <header className="flex min-w-0 flex-col gap-[0.75rem]">
      {showTitle ? (
        <div className="flex flex-wrap items-center justify-between gap-x-[1rem] gap-y-2">
          <div className="min-w-0">
            <FunUpdateSectionLegend as="h2" id={titleId} step={<FileText className="h-4 w-4" aria-hidden="true" />} className="m-0">
              Gestión documental
            </FunUpdateSectionLegend>
            <p className="mb-0 mt-1.5 text-xs text-muted-foreground">
              <span className="font-mono text-foreground/80">{currentPublic || 'Expediente sin radicado'}</span>
              <span className="mx-2 text-muted-foreground/50" aria-hidden="true">/</span>
              {subtitle}
            </p>
          </div>
          {configuration ? <div className="min-w-0">{configuration}</div> : null}
        </div>
      ) : null}
      <TooltipProvider delayDuration={150}>
        <dl
          className="m-0 flex flex-wrap gap-px overflow-hidden rounded-lg border bg-border shadow-sm"
          aria-label="Resumen documental"
          aria-busy={loading}
        >
          {metrics.map(({ label, value, icon: Icon, hint }) => (
            <div key={label} className="min-w-[8.5rem] flex-1 bg-[hsl(var(--card))] px-[1rem] py-[0.625rem]">
              <dt className="flex min-w-0 items-center gap-1.5 text-xs font-medium leading-4 text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
                {hint ? <MetricHint label={label} hint={hint} /> : null}
              </dt>
              <dd className="mb-0 mt-1 text-xl font-semibold leading-7 tabular-nums tracking-tight text-foreground">
                {loading ? <Skeleton className="h-7 w-10" /> : (value ?? '—')}
              </dd>
            </div>
          ))}
        </dl>
      </TooltipProvider>
    </header>
  );
}
