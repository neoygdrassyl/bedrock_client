/**
 * Legal-term status badges shared by the workspace bar, the dock switcher and quick windows
 * (selected by `workspace/expedienteTerm`). `tone` is the matching `DovelaBadge` tone.
 */
export const EXPEDIENTE_STATUS_META = Object.freeze({
  EN_TERMINO: {
    label: 'En término',
    tone: 'success',
    badgeClass: 'border-accent/30 bg-accent/10 text-accent',
    barClass: 'bg-accent',
    dotClass: 'bg-accent',
  },
  PRONTO_A_VENCER: {
    label: 'Pronto a vencer',
    tone: 'warning',
    badgeClass: 'border-warning/30 bg-warning/10 text-warning',
    barClass: 'bg-warning',
    dotClass: 'bg-warning',
  },
  ALERTA_VENCIMIENTO: {
    label: 'Alerta de vencimiento',
    tone: 'danger',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    barClass: 'bg-destructive',
    dotClass: 'bg-destructive',
  },
  VENCIDO: {
    label: 'Vencido',
    tone: 'danger',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    barClass: 'bg-destructive',
    dotClass: 'bg-destructive',
  },
});

export const UNKNOWN_STATUS_META = Object.freeze({
  label: 'Sin estado',
  tone: 'neutral',
  badgeClass: 'border-border bg-muted text-muted-foreground',
  barClass: 'bg-muted-foreground/40',
  dotClass: 'bg-muted-foreground/40',
});

/** Unknown or absent statuses are shown as a neutral "Sin estado", never as "En término". */
export function getExpedienteStatusMeta(status) {
  return EXPEDIENTE_STATUS_META[status] || UNKNOWN_STATUS_META;
}

/**
 * Neutral badge when no legal term runs (`workspace/expedienteTerm`): never a green
 * "En término" without a computed term.
 */
export const NO_TERM_STATUS_META = Object.freeze({
  ...UNKNOWN_STATUS_META,
  label: 'Sin término calculado',
});

/** "68001-1-26-0231" -> "26-0231"; shorter radicados are returned as-is. */
export function getShortRadicado(radicado) {
  const value = String(radicado ?? '').trim();
  const parts = value.split('-').filter(Boolean);
  return parts.length >= 3 ? parts.slice(-2).join('-') : value;
}
