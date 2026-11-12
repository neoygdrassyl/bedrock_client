/**
 * Pure helpers of the inbox list (work queue): the row status that also reflects the liquidation
 * stage, "needs action" and waiting flags, the documents ratio and the numeric date format.
 * No React, no HTTP.
 */
import {
  STATUS_META,
  WAITING_WARNING_BUSINESS_DAYS,
  hasValue,
  parseDate,
  pendingEntryCount,
  plural,
  waitingBusinessDays,
} from './onlineRadicationModel';

/**
 * Liquidation stage of a pending request. `actionable` is true when the next step is Ventanilla's
 * (review the receipt, radicate after payment); false while the applicant has to act.
 */
export const LIQUIDATION_META = {
  awaiting_payment: {
    label: 'En espera de pago',
    tone: 'info',
    actionable: false,
    hint: 'Liquidación emitida: el solicitante debe pagar y cargar el recibo.',
  },
  receipt_submitted: {
    label: 'Recibo en revisión',
    tone: 'warning',
    actionable: true,
    hint: 'El solicitante cargó el recibo de pago: revíselo para aprobarlo o rechazarlo.',
  },
  receipt_rejected: {
    label: 'Recibo rechazado',
    tone: 'danger',
    actionable: false,
    hint: 'El recibo fue rechazado: el solicitante debe cargar uno nuevo.',
  },
  approved: {
    label: 'Pago aprobado',
    tone: 'success',
    actionable: true,
    hint: 'Pago aprobado: la solicitud está lista para radicar.',
  },
};

const REQUEST_HINTS = {
  pending: 'Solicitud por revisar.',
  radicated: 'Solicitud radicada.',
  rejected: 'Solicitud rechazada.',
};

/**
 * Liquidation status of a list item, read defensively: the list may not include it yet
 * (`liquidation` absent or null), may send the object (`{ status }`) or just the status string.
 */
export function liquidationStatusOf(value) {
  if (!value) return null;
  let status = null;
  if (typeof value === 'string') status = value;
  else if (typeof value === 'object') {
    // Accept a request item (`item.liquidation`) or the liquidation itself (`{ status }`).
    const source = 'liquidation' in value || 'liquidationStatus' in value ? value.liquidation ?? value.liquidationStatus : value;
    if (typeof source === 'string') status = source;
    else if (source && typeof source === 'object') status = source.status;
  }
  return typeof status === 'string' && LIQUIDATION_META[status] ? status : null;
}

/**
 * The single status shown for a row: the request status, refined by the liquidation stage while
 * the request is pending. `key` is the liquidation status or the request status.
 */
export function rowStatus(status, liquidation) {
  const liquidationStatus = status === 'pending' ? liquidationStatusOf(liquidation) : null;
  if (liquidationStatus) {
    const meta = LIQUIDATION_META[liquidationStatus];
    return { key: liquidationStatus, label: meta.label, tone: meta.tone, hint: meta.hint, liquidation: true };
  }
  const meta = STATUS_META[status];
  if (meta) return { key: status, label: meta.label, tone: meta.tone, hint: REQUEST_HINTS[status], liquidation: false };
  return { key: status || 'unknown', label: status ? String(status) : 'Sin estado', tone: 'neutral', hint: null, liquidation: false };
}

/** The request itself waits for Ventanilla (pending and not waiting on the applicant's payment). */
export function requestNeedsAction(item) {
  if (item?.status !== 'pending') return false;
  const liquidationStatus = liquidationStatusOf(item);
  return !liquidationStatus || LIQUIDATION_META[liquidationStatus].actionable;
}

/** Ventanilla has something to do: the request or a document entry waiting to be received. */
export function needsAction(item) {
  return requestNeedsAction(item) || pendingEntryCount(item) > 0;
}

/** Business days the request has been waiting and whether that exceeds the warning threshold. */
export function waitInfo(item, now) {
  const days = waitingBusinessDays(item, now);
  return {
    days,
    overdue: requestNeedsAction(item) && days > WAITING_WARNING_BUSINESS_DAYS,
    label: plural(days, 'día hábil', 'días hábiles'),
  };
}

/** "4/4" ratio of documents aportados vs required requirements, plus its accessible text. */
export function documentsRatio(item) {
  const count = Math.max(0, Math.trunc(Number(item?.documentCount) || 0));
  const required = Math.max(0, Math.trunc(Number(item?.requiredDocumentCount) || 0));
  const below = required > 0 && count < required;
  const text = `${plural(count, 'documento aportado', 'documentos aportados')}, ${plural(required, 'obligatorio')}`;
  return { count, required, below, short: required ? `${count}/${required}` : String(count), text };
}

export function actuationLabels(item) {
  return (Array.isArray(item?.actuations) ? item.actuations : [])
    .map((actuation) => (typeof actuation === 'string' ? actuation : actuation?.label || actuation?.code))
    .filter(hasValue);
}

const pad = (value) => String(value).padStart(2, '0');

/** dd/mm/aaaa (local date). */
export function formatNumericDate(value) {
  const date = parseDate(value);
  return date ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` : null;
}

/** dd/mm/aaaa hh:mm (24 h, local). */
export function formatNumericDateTime(value) {
  const date = parseDate(value);
  return date ? `${formatNumericDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}` : null;
}
