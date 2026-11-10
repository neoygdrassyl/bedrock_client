/** Legal-term status shared by the workspace side nav, the dock chips and quick windows. */
export const EXPEDIENTE_STATUS_META = Object.freeze({
  EN_TERMINO: {
    label: 'En término',
    badgeClass: 'border-accent/30 bg-accent/10 text-accent',
    barClass: 'bg-accent',
    dotClass: 'bg-accent',
  },
  PRONTO_A_VENCER: {
    label: 'Pronto a vencer',
    badgeClass: 'border-warning/30 bg-warning/10 text-warning',
    barClass: 'bg-warning',
    dotClass: 'bg-warning',
  },
  ALERTA_VENCIMIENTO: {
    label: 'Alerta de vencimiento',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    barClass: 'bg-destructive',
    dotClass: 'bg-destructive',
  },
  VENCIDO: {
    label: 'Vencido',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    barClass: 'bg-destructive',
    dotClass: 'bg-destructive',
  },
});

export const UNKNOWN_STATUS_META = Object.freeze({
  label: 'Sin estado',
  badgeClass: 'border-border bg-muted text-muted-foreground',
  barClass: 'bg-muted-foreground/40',
  dotClass: 'bg-muted-foreground/40',
});

/** Unknown statuses fall back to "En término", as the workspace header always did. */
export function getExpedienteStatusMeta(status) {
  return EXPEDIENTE_STATUS_META[status] || EXPEDIENTE_STATUS_META.EN_TERMINO;
}

function toNumber(value) {
  if (value == null || value === '') return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

/** Business-day figures of a legal summary, same math as the workspace header. */
export function getExpedienteTermFigures(summary) {
  const usedDays = toNumber(summary?.dias_habiles_usados);
  const limitDays = toNumber(summary?.dias_habiles_limite);
  const fallbackPercent = limitDays > 0 ? Math.round((usedDays / limitDays) * 100) : 0;
  const rawPercent = summary?.porcentaje_avance == null || summary?.porcentaje_avance === ''
    ? fallbackPercent
    : toNumber(summary.porcentaje_avance);
  return {
    usedDays,
    limitDays,
    remainingDays: limitDays > 0 ? Math.max(limitDays - usedDays, 0) : null,
    progressPercent: Math.max(0, Math.min(rawPercent, 100)),
  };
}

/** "68001-1-26-0231" -> "26-0231"; shorter radicados are returned as-is. */
export function getShortRadicado(radicado) {
  const value = String(radicado ?? '').trim();
  const parts = value.split('-').filter(Boolean);
  return parts.length >= 3 ? parts.slice(-2).join('-') : value;
}
