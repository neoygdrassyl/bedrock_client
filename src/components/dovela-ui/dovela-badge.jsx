import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TONE_CLASSES = {
  neutral: 'border-border bg-muted/75 text-foreground hover:bg-muted',
  info: 'border-primary/25 bg-primary/10 text-foreground hover:bg-primary/15',
  success: 'border-accent/30 bg-accent/10 text-foreground hover:bg-accent/15',
  warning: 'border-warning/35 bg-warning/10 text-foreground hover:bg-warning/15',
  danger: 'border-destructive/30 bg-destructive/10 text-foreground hover:bg-destructive/15',
  outline: 'border-border bg-card text-muted-foreground hover:bg-muted/60',
};

export function DovelaBadge({
  tone = 'neutral',
  icon: Icon,
  className,
  children,
  ...props
}) {
  return (
    <Badge
      data-dovela-ui="badge"
      data-tone={tone}
      className={cn(
        'gap-1 rounded-[var(--badge-radius)] px-[var(--badge-padding-x)] py-[var(--badge-padding-y)] text-[length:var(--badge-font-size)] font-medium leading-none shadow-none',
        TONE_CLASSES[tone] || TONE_CLASSES.neutral,
        className
      )}
      {...props}
    >
      {Icon ? <Icon size={14} aria-hidden="true" /> : null}
      {children}
    </Badge>
  );
}
