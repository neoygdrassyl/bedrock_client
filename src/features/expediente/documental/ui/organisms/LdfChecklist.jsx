import { useId, useState } from 'react';
import { ChevronDown, Circle, CircleCheck, CircleDashed, CircleX, Lock, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { cn } from '@/shared/lib/utils';
import { Tag } from '../atoms/Tag';
import { groupHeading, ROW_MARKERS, ROW_STATUS } from '../../ldfChecklistModel';

const ICON_BY_TONE = { success: CircleCheck, slate: CircleCheck, danger: CircleX, warning: Circle, neutral: CircleDashed };
const ICON_CLASS = { success: 'text-[hsl(var(--operational-success-text))]', slate: 'text-muted-foreground', danger: 'text-[hsl(var(--operational-danger-text))]', warning: 'text-[hsl(var(--operational-warning-text))]', neutral: 'text-muted-foreground' };

/** One checklist row: state icon, code, name, what is asked (required / optional / at least one) and its state. */
function ChecklistRow({ row, onOpen }) {
  const status = ROW_STATUS[row.status] || ROW_STATUS.missing;
  const marker = ROW_MARKERS[row.marker] || null;
  const Icon = ICON_BY_TONE[status.tone] || Circle;
  const name = [row.code, row.title].filter(Boolean).join(' ');
  const statusText = row.note ? `${status.label} (${row.note})` : status.label;
  return (
    <li data-testid={`ldf-row-${row.key}`} data-status={row.status}>
      <button type="button" onClick={() => onOpen(row)} aria-label={`${name}: ${statusText}`}
        className={cn('grid w-full grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-x-[0.75rem] gap-y-0.5 bg-transparent px-[1rem] py-1.5 text-left text-xs leading-5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none sm:grid-cols-[1rem_4.5rem_minmax(0,1fr)_auto_auto]',
          status.done && 'text-muted-foreground')}>
        <Icon aria-hidden="true" className={cn('h-4 w-4', ICON_CLASS[status.tone])} />
        <span className="hidden truncate font-mono text-foreground sm:block" title={row.code}>{row.code || '—'}</span>
        <span className="min-w-0 truncate text-foreground" title={row.note ? `${row.title} · ${row.note}` : row.title}>
          <span className="font-mono sm:hidden">{row.code ? `${row.code} ` : ''}</span>{row.title}
          {row.note ? <span className="ml-2 text-muted-foreground">{row.note}</span> : null}
        </span>
        {marker ? <Tag tone={marker.tone} className="hidden sm:inline-flex">{marker.label}</Tag> : <span className="hidden sm:block" />}
        <Tag tone={status.tone}>{status.label}</Tag>
      </button>
    </li>
  );
}

/** One group of the checklist (Solicitud or a person) with its progress and its rows, collapsible. */
function ChecklistGroup({ group, onOpen, gated }) {
  const bodyId = useId();
  const [open, setOpen] = useState(true);
  const complete = group.pendingCount === 0;
  return (
    <section aria-label={groupHeading(group)} data-testid={`ldf-group-${group.key}`} className={cn('flex flex-col', gated && group.kind !== 'request' && 'opacity-80')}>
      <div className="flex flex-wrap items-center gap-2 bg-muted/30 px-[1rem] py-1.5">
        <button type="button" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-1.5 bg-transparent p-0 text-left text-sm font-semibold leading-5 text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronDown aria-hidden="true" className={cn('h-3.5 w-3.5 shrink-0 transition-transform motion-reduce:transition-none', !open && '-rotate-90')} />
          <span className="truncate">{group.title}</span>
          {group.kind !== 'request' && group.subtitle ? <span className="truncate text-xs font-normal text-muted-foreground">· {group.subtitle}</span> : null}
        </button>
        <span className="font-mono text-xs tabular-nums text-muted-foreground" data-testid={`ldf-group-progress-${group.key}`} title="Documentos requeridos entregados">
          {group.deliveredCount}/{group.requiredCount} entregados
        </span>
        <Tag tone={complete ? 'success' : 'warning'}>{complete ? 'Al día' : `${group.pendingCount} por resolver`}</Tag>
      </div>
      <div id={bodyId} hidden={!open}>
        {group.rows.length ? (
          <ul className="m-0 flex list-none flex-col divide-y p-0">{group.rows.map((row) => <ChecklistRow key={row.key} row={row} onOpen={onOpen} />)}</ul>
        ) : <p className="mb-0 px-[1rem] py-2 text-xs text-muted-foreground">No se le exigen documentos.</p>}
      </div>
    </section>
  );
}

/**
 * The single document checklist of legal y debida forma: evaluation-level alerts, then "Solicitud" and one group per
 * person. `gated` (parties with pending data) keeps it readable but states that the per-person evaluation waits.
 * `onOpen(row)` opens the detail of a row.
 */
export function LdfChecklist({ checklist, onOpen, gated = false }) {
  const titleId = useId();
  const { groups, alerts, others } = checklist;
  return (
    <section aria-labelledby={titleId} className="flex flex-col border-b" data-testid="ldf-checklist">
      <h3 id={titleId} className="mb-0 px-[1rem] pb-1 pt-[0.75rem] text-sm font-semibold leading-5 text-foreground">Documentos</h3>
      {gated ? (
        <p role="status" className="mx-[1rem] mb-2 flex items-center gap-2 rounded-md border border-dashed px-[0.75rem] py-1.5 text-xs leading-5 text-[hsl(var(--operational-warning-text))]" data-testid="ldf-checklist-gate">
          <Lock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />Completa las partes para evaluar los documentos de cada persona.
        </p>
      ) : null}
      {alerts.length || others.length ? (
        <Alert variant="warning" className="mx-[1rem] mb-2 w-auto py-2" data-testid="ldf-checklist-alert">
          <TriangleAlert aria-hidden="true" />
          <AlertDescription className="min-w-0 flex-1">
            {[...alerts, ...others].map((alert) => <span key={alert.key || alert.code} className="block"><span className="font-medium">{alert.label}</span>{alert.message ? ` · ${alert.message}` : ''}</span>)}
          </AlertDescription>
        </Alert>
      ) : null}
      {groups.length ? (
        <div className="flex flex-col divide-y border-t">{groups.map((group) => <ChecklistGroup key={group.key} group={group} onOpen={onOpen} gated={gated} />)}</div>
      ) : <p className="mb-0 px-[1rem] pb-[0.75rem] text-xs text-muted-foreground">La evaluación no exige documentos para este expediente.</p>}
    </section>
  );
}

export default LdfChecklist;
