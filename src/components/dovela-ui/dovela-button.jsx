import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TONE_CLASSES = {
  primary: 'border border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
  neutral: 'border border-input bg-card text-foreground hover:bg-muted',
  success: 'border border-transparent bg-accent text-accent-foreground hover:bg-accent/90',
  danger: 'border border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
  ghost: 'border border-transparent bg-transparent text-foreground shadow-none hover:bg-muted',
};

const SIZE_CLASSES = {
  sm: 'h-[var(--button-height-sm)] rounded-[var(--button-radius)] px-3 text-sm',
  md: 'h-[var(--button-height-md)] rounded-[var(--button-radius)] px-4 text-sm',
  lg: 'h-[var(--button-height-lg)] rounded-[var(--button-radius)] px-5 text-sm',
};

export function DovelaButton({
  tone = 'primary',
  size = 'md',
  leadingIcon: LeadingIcon,
  loading = false,
  loadingLabel,
  fullWidth = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) {
  const label = loading && loadingLabel ? loadingLabel : children;

  return (
    <Button
      type={type}
      variant="ghost"
      size="default"
      disabled={disabled || loading}
      data-dovela-ui="button"
      data-tone={tone}
      data-size={size}
      className={cn(
        'justify-center rounded-[var(--button-radius)] font-medium shadow-[var(--button-shadow)] transition-[background-color,border-color,color,box-shadow]',
        'focus-visible:ring-offset-0',
        fullWidth && 'w-full',
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        TONE_CLASSES[tone] || TONE_CLASSES.primary,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : LeadingIcon ? (
        <LeadingIcon aria-hidden="true" />
      ) : null}
      {label}
    </Button>
  );
}
