export const STATUS_ORDER = ['VENCIDO', 'ALERTA_VENCIMIENTO', 'PRONTO_A_VENCER', 'EN_TERMINO', 'SUSPENDIDO'];

export const SEVERITY_BY_STATUS = {
  VENCIDO: 'expired',
  ALERTA_VENCIMIENTO: 'critical',
  PRONTO_A_VENCER: 'warning',
  EN_TERMINO: 'ok',
  SUSPENDIDO: 'paused',
};

export const OPERATIONAL_STATE_BY_FUN_STATUS = {
  VENCIDO: 'vencido',
  ALERTA_VENCIMIENTO: 'proximo_a_vencer',
  PRONTO_A_VENCER: 'proximo_a_vencer',
  EN_TERMINO: 'en_revision',
  SUSPENDIDO: 'bloqueado',
};

export const SEVERITY_COLORS = {
  expired: { bg: 'bg-red-600', text: 'text-white', ring: 'ring-red-500', badge: 'bg-red-100 text-red-800' },
  critical: { bg: 'bg-orange-500', text: 'text-white', ring: 'ring-orange-400', badge: 'bg-orange-100 text-orange-800' },
  warning: { bg: 'bg-yellow-400', text: 'text-black', ring: 'ring-yellow-300', badge: 'bg-yellow-100 text-yellow-800' },
  ok: { bg: 'bg-green-500', text: 'text-white', ring: 'ring-green-400', badge: 'bg-green-100 text-green-800' },
  paused: { bg: 'bg-gray-400', text: 'text-white', ring: 'ring-gray-300', badge: 'bg-gray-100 text-gray-800' },
};

export function severityFromStatus(status) {
  return SEVERITY_BY_STATUS[status] || 'ok';
}

export function operationalStateFromFunStatus(status) {
  return OPERATIONAL_STATE_BY_FUN_STATUS[status] || 'en_revision';
}

export function severityFromPercent(percentUsed, thresholds) {
  const warn = thresholds?.warning ?? 70;
  const crit = thresholds?.critical ?? 90;
  if (percentUsed >= 100) return 'expired';
  if (percentUsed >= crit) return 'critical';
  if (percentUsed >= warn) return 'warning';
  return 'ok';
}

export function daysToPercent(daysUsed, daysTotal) {
  if (!daysTotal || daysTotal <= 0) return 0;
  return Math.max(0, Math.min(100, (daysUsed / daysTotal) * 100));
}
