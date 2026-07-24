import React from 'react';
import { cn } from '@/lib/utils';

export function DovelaPageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}) {
  return (
    <header
      data-dovela-ui="page-header"
      className={cn('flex flex-col gap-3 border-b border-border/70 pb-4', className)}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          {eyebrow ? (
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="m-0 text-xl font-bold leading-7 tracking-tight text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="m-0 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : null}
    </header>
  );
}
