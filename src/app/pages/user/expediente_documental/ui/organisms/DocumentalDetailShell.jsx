import { FileText } from 'lucide-react';

/**
 * Layout of the side "Ficha documental": labelled header with the document code,
 * scrollable body (title block + children) and an optional sticky footer for actions.
 */
export function DocumentalDetailShell({ code, title, caption, headingId, footer, children }) {
  return (
    <aside
      aria-labelledby={headingId}
      className="flex min-h-0 min-w-0 flex-col border-t border-border bg-[hsl(var(--card))] lg:border-l lg:border-t-0"
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/70 bg-muted/30 px-[1.25rem]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ficha documental
        </span>
        <span className="font-mono text-xs text-muted-foreground">{code || 'Sin código'}</span>
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label="Detalle documental desplazable"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <div className="mb-[1.25rem]">
          <span className="mb-[0.75rem] grid h-10 w-10 place-items-center rounded-lg border border-primary/15 bg-primary/5 text-[hsl(var(--primary))]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3
            id={headingId}
            className="m-0 break-words text-base font-semibold leading-6 tracking-tight text-foreground"
          >
            {title || 'Documento sin nombre'}
          </h3>
          {caption ? <div className="mb-0 mt-2 text-xs text-muted-foreground">{caption}</div> : null}
        </div>
        {children}
      </div>
      {footer ? (
        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-border bg-[hsl(var(--card))] p-[1rem]">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

export default DocumentalDetailShell;
