import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const DENSITY_CLASSES = {
  compact: 'min-h-[var(--textarea-min-height-compact)] px-2.5 py-2 text-sm',
  comfortable: 'min-h-[var(--textarea-min-height)] px-3 py-2.5 text-sm',
  editor: 'min-h-[var(--textarea-min-height-editor)] px-3.5 py-3 text-sm',
};

export function DovelaTextarea({
  density = 'comfortable',
  invalid = false,
  className,
  'aria-invalid': ariaInvalid,
  ...props
}) {
  return (
    <Textarea
      data-dovela-ui="textarea"
      data-density={density}
      aria-invalid={invalid ? 'true' : ariaInvalid}
      className={cn(
        'rounded-[var(--input-radius)] border-input bg-background text-foreground shadow-[var(--input-shadow)] transition-[border-color,box-shadow]',
        'focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0',
        invalid && 'border-destructive focus-visible:ring-destructive/20',
        DENSITY_CLASSES[density] || DENSITY_CLASSES.comfortable,
        className
      )}
      {...props}
    />
  );
}
