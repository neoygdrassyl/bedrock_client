import React from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ICONS_BY_TONE = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
};

const TONE_CLASSES = {
  info: 'border-border bg-card text-foreground',
  success: 'border-accent/30 bg-accent/10 text-foreground',
  warning: 'border-warning/35 bg-warning/10 text-foreground',
  danger: 'border-destructive/30 bg-destructive/10 text-foreground',
};

export function DovelaInlineAlert({
  tone = 'info',
  title,
  icon: Icon,
  iconClassName,
  onDismiss,
  dismissLabel = 'Cerrar mensaje',
  className,
  children,
  ...props
}) {
  const ResolvedIcon = Icon || ICONS_BY_TONE[tone] || ICONS_BY_TONE.info;

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      data-dovela-ui="inline-alert"
      data-tone={tone}
      className={cn(
        'flex items-start justify-between gap-[var(--alert-gap)] rounded-[var(--alert-radius)] border px-[var(--alert-padding-x)] py-[var(--alert-padding-y)] text-sm leading-5 shadow-[var(--alert-shadow)]',
        TONE_CLASSES[tone] || TONE_CLASSES.info,
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="mt-0.5 inline-flex shrink-0 text-current">
          <ResolvedIcon size={16} className={iconClassName} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          {title ? (
            <span className="mb-0.5 block text-sm font-semibold leading-5">{title}</span>
          ) : null}
          <span className="block">{children}</span>
        </span>
      </div>

      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="h-7 w-7 shrink-0 rounded-full text-current shadow-none hover:bg-background/70 focus-visible:ring-offset-0"
        >
          <X size={14} aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
