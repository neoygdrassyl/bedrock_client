import { FileText } from 'lucide-react';

/**
 * Layout of the side "Ficha documental": labelled header with the document code,
 * scrollable body (title block + card sections) and an optional footer for actions.
 */
export function DocumentalDetailShell({ code, title, caption, headingId, footer, children }) {
  return (
    <aside
      aria-labelledby={headingId}
      className="flex min-h-0 min-w-0 flex-col border-t bg-muted/20 lg:border-l lg:border-t-0"
    >
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b bg-[hsl(var(--card))] px-[1rem]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ficha documental
        </span>
        <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">{code || 'Sin código'}</span>
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label="Detalle documental desplazable"
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-[1rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <div className="mb-[1rem] flex min-w-0 items-start gap-[0.75rem]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-[1px] border-solid border-primary/20 bg-primary/10 text-[hsl(var(--primary))]">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3
              id={headingId}
              className="mb-0 break-words text-[15px] font-semibold leading-5 tracking-tight text-foreground"
            >
              {title || 'Documento sin nombre'}
            </h3>
            {caption ? <div className="mt-1 text-xs leading-4 text-muted-foreground">{caption}</div> : null}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-[0.75rem]">{children}</div>
      </div>
      {footer ? (
        // Actions share the row while they fit and stack full-width in a narrow panel.
        <div className="flex shrink-0 flex-wrap gap-2 border-t bg-[hsl(var(--card))] p-[0.75rem] [&>*]:flex-auto">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

export default DocumentalDetailShell;
