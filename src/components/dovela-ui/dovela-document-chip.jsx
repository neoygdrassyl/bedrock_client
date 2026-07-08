import React from 'react';

import { cn } from '@/lib/utils';
import { DovelaBadge } from './dovela-badge';
import { getDocumentTypeMeta } from './dovela-operational';

export function DovelaDocumentChip({ type, name, status, className }) {
  const meta = getDocumentTypeMeta(type);

  return (
    <article
      className={cn('flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm', className)}
      data-dovela-ui="document-chip"
      data-document-type={meta.id}
    >
      <div className="min-w-0">
        <DovelaBadge tone={meta.tone}>{meta.label}</DovelaBadge>
        <div className="mt-1 truncate font-medium text-foreground">{name}</div>
      </div>
      {status ? <div className="shrink-0 text-xs text-muted-foreground">{status}</div> : null}
    </article>
  );
}
