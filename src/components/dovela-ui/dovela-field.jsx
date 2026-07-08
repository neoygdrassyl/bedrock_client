import React, { useId } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function DovelaField({
  label,
  helperText,
  error,
  required = false,
  className,
  children,
}) {
  const generatedId = useId();
  const controlId = children?.props?.id || `dovela-field-${generatedId}`;
  const helperId = helperText ? `${controlId}-helper` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [children?.props?.['aria-describedby'], helperId, errorId]
    .filter(Boolean)
    .join(' ') || undefined;

  const control = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: controlId,
        'aria-describedby': describedBy,
        'aria-invalid': error ? 'true' : children.props['aria-invalid'],
        invalid: error ? true : children.props.invalid,
      })
    : children;

  return (
    <div data-dovela-ui="field" className={cn('grid gap-2', className)}>
      {label ? (
        <Label htmlFor={controlId} className="text-sm font-semibold leading-5 text-foreground">
          {label}
          {required ? <span className="ml-1 text-destructive" aria-hidden="true">*</span> : null}
        </Label>
      ) : null}
      {control}
      {helperText ? (
        <p id={helperId} className="m-0 text-xs leading-5 text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="m-0 text-xs font-medium leading-5 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
