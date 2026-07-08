export const SCOPE_LABELS = Object.freeze({
  solicitud: 'Por solicitud',
  predio: 'Por predio',
  titular: 'Por titular',
  profesional: 'Por profesional',
  plano: 'Por plano',
  unknown: 'Por confirmar',
});

export const SCOPE_DISCLAIMER = 'Alcance visual para comprensión; no calcula cantidades por instancia.';

export function getScopeLabel(code) {
  if (typeof code !== 'string' || !code.trim()) return SCOPE_LABELS.unknown;

  const normalizedCode = code.trim().toLowerCase();
  return SCOPE_LABELS[normalizedCode] || SCOPE_LABELS.unknown;
}
