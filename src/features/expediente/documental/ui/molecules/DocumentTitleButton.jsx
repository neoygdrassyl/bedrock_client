import { ChevronRight, FileText } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

/**
 * Selectable document title of a documentary table row: icon, name (clamped until
 * expanded), code and optional extra content (e.g. a class badge). Pass `tabIndex={-1}`
 * and no `onClick` when the whole row is the focusable, clickable target.
 * With `meta` (text) the title is compact: exactly two truncated lines, name and meta, the full text on hover.
 */
export function DocumentTitleButton({ name, code, extra, meta, expanded = false, selected = false, controlsId, onClick, tabIndex }) {
  const displayName = name || 'Documento sin nombre';
  if (meta !== undefined) {
    return (
      <button type="button" aria-current={selected ? 'true' : undefined} aria-label={[displayName, meta].filter(Boolean).join(' · ')} onClick={onClick} tabIndex={tabIndex}
        title={[displayName, meta].filter(Boolean).join('\n')}
        className="group flex w-full min-w-0 items-center gap-[0.75rem] rounded-md bg-transparent p-0 text-left text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-colors motion-reduce:transition-none',
          selected ? 'border-primary/20 bg-primary/10 text-[hsl(var(--primary))]' : 'border-border/70 bg-muted/30 text-muted-foreground group-hover:border-primary/20 group-hover:text-primary')}>
          <FileText className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span id={controlsId} className="truncate text-[13px] font-medium leading-5" data-testid="row-name">{displayName}</span>
          <span className={cn('truncate text-[11px] leading-4', selected ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground')} data-testid="row-meta">{meta || code || 'Sin código'}</span>
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-current={selected ? 'true' : undefined}
      aria-label={(expanded ? 'Contraer: ' : 'Mostrar completo: ') + (name || 'documento')}
      onClick={onClick}
      tabIndex={tabIndex}
      className="group flex min-h-10 w-full items-center gap-[0.75rem] rounded-md bg-transparent p-0 text-left text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-colors motion-reduce:transition-none',
          selected
            ? 'border-primary/20 bg-primary/10 text-[hsl(var(--primary))]'
            : 'border-border/70 bg-muted/30 text-muted-foreground group-hover:border-primary/20 group-hover:text-primary',
        )}
      >
        <FileText className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          id={controlsId}
          className={cn('block break-words text-[13px] font-medium leading-5', !expanded && 'line-clamp-2')}
        >
          {displayName}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'font-mono text-[11px] leading-4',
              selected ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground',
            )}
          >
            {code || 'Sin código'}
          </span>
          {extra}
        </span>
      </span>
      <ChevronRight
        className={cn(
          'h-3.5 w-3.5 shrink-0 transition-colors motion-reduce:transition-none',
          selected ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground/40 group-hover:text-muted-foreground',
        )}
        aria-hidden="true"
      />
    </button>
  );
}

export default DocumentTitleButton;
