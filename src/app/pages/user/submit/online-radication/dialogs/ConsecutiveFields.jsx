import { Loader2, RefreshCw } from 'lucide-react';
import { DovelaInput } from '@/components/dovela-ui';

export const VR_PATTERN = /^VR\d{2}-\d{4,}$/;
export const VR_FORMAT_MESSAGE = 'Use el formato VR{AA}-NNNN, por ejemplo VR26-0123.';
export const VR_TAKEN_MESSAGE = 'Ese VR ya está registrado en Ventanilla, en un expediente o en una PQRS.';
export const COMPUTE_ERROR = 'No fue posible calcular el siguiente consecutivo. Escríbalo manualmente o vuelva a calcularlo.';

export function withoutKey(object, key) {
  const { [key]: _removed, ...rest } = object;
  return rest;
}

/** Monospace input with an inline "recalculate" button. Receives the DovelaField a11y props. */
export function ConsecutiveInput({ inputRef, computing, onRecompute, recomputeLabel, ...props }) {
  return (
    <div className="relative">
      <DovelaInput
        ref={inputRef}
        autoComplete="off"
        spellCheck={false}
        aria-busy={computing || undefined}
        placeholder={computing ? 'Calculando…' : undefined}
        className="px-[0.75rem] pr-[2.75rem] font-mono tracking-tight"
        {...props}
      />
      <button
        type="button"
        onClick={onRecompute}
        disabled={computing}
        aria-label={recomputeLabel}
        title={recomputeLabel}
        className="absolute right-1 top-1/2 inline-grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-70"
      >
        {computing
          ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

export function FieldAction({ error, onClick, disabled }) {
  if (!error?.taken && !error?.retry) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="-mt-1 inline-flex cursor-pointer items-center gap-1 justify-self-start rounded-sm bg-transparent text-xs font-semibold text-[hsl(var(--primary))] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
    >
      <RefreshCw className="h-3 w-3" aria-hidden="true" />
      {error.taken ? 'Usar siguiente disponible' : 'Volver a calcular'}
    </button>
  );
}
