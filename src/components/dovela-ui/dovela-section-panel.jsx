import React, { useId } from 'react';
import {
  DovelaCard,
  DovelaCardContent,
  DovelaCardDescription,
  DovelaCardHeader,
  DovelaCardTitle,
} from './dovela-card.jsx';
import { cn } from '@/lib/utils';

export function DovelaSectionPanel({
  title,
  description,
  actions,
  tone = 'default',
  className,
  headerClassName,
  contentClassName,
  children,
}) {
  const generatedId = useId();
  const titleId = title ? `dovela-section-${generatedId}` : undefined;

  return (
    <DovelaCard
      data-dovela-ui="section-panel"
      role="region"
      aria-labelledby={titleId}
      tone={tone}
      className={cn('overflow-hidden', className)}
    >
      {(title || description || actions) ? (
        <DovelaCardHeader className={cn('flex-row items-start justify-between gap-4 border-b border-border/70', headerClassName)}>
          <div className="min-w-0 space-y-1">
            {title ? <DovelaCardTitle id={titleId}>{title}</DovelaCardTitle> : null}
            {description ? <DovelaCardDescription>{description}</DovelaCardDescription> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </DovelaCardHeader>
      ) : null}
      <DovelaCardContent className={cn('pt-[var(--card-padding)]', contentClassName)}>
        {children}
      </DovelaCardContent>
    </DovelaCard>
  );
}
