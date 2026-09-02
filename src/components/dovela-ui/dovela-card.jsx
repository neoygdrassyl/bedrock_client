import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TONE_CLASSES = {
  default: 'border-border bg-card',
  subtle: 'border-border bg-muted/35',
  primary: 'border-primary/20 bg-primary/5',
  success: 'border-accent/25 bg-accent/5',
  warning: 'border-warning/35 bg-warning/10',
  danger: 'border-destructive/30 bg-destructive/10',
};

export function DovelaCard({ as: Component = Card, tone = 'default', className, ...props }) {
  return (
    <Component
      data-dovela-ui="card"
      data-tone={tone}
      className={cn(
        'rounded-[var(--card-radius)] border shadow-[var(--card-shadow)]',
        TONE_CLASSES[tone] || TONE_CLASSES.default,
        className
      )}
      {...props}
    />
  );
}

export function DovelaCardHeader({ compact = false, className, ...props }) {
  return (
    <div
      className={cn(
        'flex flex-col',
        compact ? 'gap-1 p-[var(--card-padding-compact)]' : 'gap-1.5 p-[var(--card-padding)]',
        className
      )}
      {...props}
    />
  );
}

export function DovelaCardTitle({ className, ...props }) {
  return (
    <div
      className={cn('text-base font-semibold leading-6 tracking-tight text-foreground', className)}
      {...props}
    />
  );
}

export function DovelaCardDescription({ className, ...props }) {
  return (
    <p
      className={cn('m-0 text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
}

export function DovelaCardContent({ compact = false, className, ...props }) {
  return (
    <div
      className={cn(
        compact ? 'px-[var(--card-padding-compact)] pb-[var(--card-padding-compact)]' : 'px-[var(--card-padding)] pb-[var(--card-padding)]',
        className
      )}
      {...props}
    />
  );
}

export function DovelaCardFooter({ compact = false, className, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center',
        compact ? 'px-[var(--card-padding-compact)] pb-[var(--card-padding-compact)] pt-0' : 'px-[var(--card-padding)] pb-[var(--card-padding)] pt-0',
        className
      )}
      {...props}
    />
  );
}
