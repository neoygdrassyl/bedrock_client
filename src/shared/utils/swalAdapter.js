import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { getRecentHttpFailure, getRequestIdFromError, logEvent } from '@/shared/observability/logger';

/**
 * Thin adapter over SweetAlert2.
 * Provides semantic shortcuts with consistent token-based defaults.
 * The visual theme is handled by swal-theme.css — this handles behavior.
 */

const BASE = {
  customClass: {
    popup: 'swal2-themed',
    confirmButton: 'swal2-confirm-themed',
    cancelButton: 'swal2-cancel-themed',
    denyButton: 'swal2-deny-themed',
  },
  buttonsStyling: false,
  reverseButtons: true,
};

function mergeSwalOptions(defaults, opts = {}) {
  const merged = {
    ...defaults,
    ...opts,
  };

  if (defaults.customClass || opts.customClass) {
    merged.customClass = {
      ...(defaults.customClass ?? {}),
      ...(opts.customClass ?? {}),
    };
  }

  if (typeof defaults.didOpen === 'function' && typeof opts.didOpen === 'function') {
    merged.didOpen = (...args) => {
      defaults.didOpen(...args);
      opts.didOpen(...args);
    };
  }

  return merged;
}

export function swalConfirm(opts = {}) {
  return Swal.fire(mergeSwalOptions({
    ...BASE,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
  }, opts));
}

export function swalSuccess(opts = {}) {
  return Swal.fire(mergeSwalOptions({
    ...BASE,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
  }, opts));
}

// ── Error classification: symptom vs action failure ─────────────────
//
// Rule: a failed LOAD (data that a page or panel fetches to show) is a symptom.
// The page is still usable, so instead of a blocking modal the failure is logged
// (`ui_load_failed`) and a non-blocking toast shows the reference code. A failed
// ACTION (save, delete, generate, validate…) keeps the modal: the user must know
// the action did not happen.
//
// A swalError call is a load failure when:
//   1. it passes `symptom: true` (`symptom: false` forces the modal); or
//   2. its title/text says so: "ERROR AL CARGAR", "no ha sido posible cargar",
//      "no se pudo cargar", "no fue posible cargar", "no se pudieron cargar"; or
//   3. it is the generic `swa_messages.generic_eror_title`/`generic_error_text`
//      message (shared by loads and actions) AND the last failed request, within
//      the previous 2 s, was a GET.
// Calls that ask for a decision (cancel/deny buttons, inputs, preConfirm) always
// keep the modal.

const LOAD_FAILURE_PATTERN = /\berror al cargar\b|\bno (?:ha sido|fue) posible cargar\b|\bno se pudo cargar\b|\bno se pudieron cargar\b/i;
const GENERIC_ERROR_PATTERN = /se han presentado errores|hubo errores en el procesamiento de esta acci[oó]n|errors have (?:oc)?c?urred/i;
const RECENT_FAILURE_WINDOW_MS = 2000;
const INTERACTIVE_OPTIONS = ['showCancelButton', 'showDenyButton', 'input', 'preConfirm', 'preDeny'];
const SYMPTOM_RESULT = Object.freeze({ isConfirmed: true, isDenied: false, isDismissed: false, value: true, symptom: true });

function plainText(value) {
  if (value == null) return '';
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Decides whether a swalError call is a load symptom (toast) or an action
 * failure (modal). Exported for tests.
 *
 * @returns {{ symptom: boolean, relatedRequestId: string|null }}
 */
export function classifySwalError(opts = {}) {
  const recent = getRecentHttpFailure(RECENT_FAILURE_WINDOW_MS);
  const relatedRequestId = opts.requestId || getRequestIdFromError(opts.error) || recent?.requestId || null;

  if (typeof opts.symptom === 'boolean') return { symptom: opts.symptom, relatedRequestId };
  if (INTERACTIVE_OPTIONS.some((key) => opts[key])) return { symptom: false, relatedRequestId };

  const text = `${plainText(opts.title)} ${plainText(opts.text)}`;
  if (LOAD_FAILURE_PATTERN.test(text)) return { symptom: true, relatedRequestId };
  if (GENERIC_ERROR_PATTERN.test(text) && recent?.method === 'GET') return { symptom: true, relatedRequestId };
  return { symptom: false, relatedRequestId };
}

function reportLoadSymptom(title, text, relatedRequestId) {
  logEvent('warn', 'ui_load_failed', {
    message: text || title,
    relatedRequestId: relatedRequestId || undefined,
    data: { title },
  });

  // A load usually started with swalLoading(); without the error modal that
  // would replace it, the spinner would stay open forever.
  try {
    if (Swal.isLoading?.()) Swal.close();
  } catch {}

  try {
    toast.warning('No se pudo cargar parte de la información', {
      id: `load-failed:${relatedRequestId || text || title}`,
      description: relatedRequestId ? `Código: ${relatedRequestId}` : 'Intente de nuevo en un momento.',
      duration: 8000,
    });
  } catch {}
}

/**
 * Error modal, or a toast for load failures (see the rule above).
 *
 * @param {object} opts SweetAlert2 options plus:
 * @param {boolean} [opts.symptom] force the toast (`true`) or the modal (`false`)
 * @param {unknown} [opts.error] the failed request's error, to read its request id
 * @param {string} [opts.requestId] explicit request id for the reference
 */
export function swalError(opts = {}) {
  const { symptom: _symptom, error: _error, requestId: _requestId, ...swalOpts } = opts;
  const classification = classifySwalError(opts);

  if (classification.symptom) {
    reportLoadSymptom(plainText(swalOpts.title), plainText(swalOpts.text), classification.relatedRequestId);
    return Promise.resolve(SYMPTOM_RESULT);
  }

  return Swal.fire(mergeSwalOptions({
    ...BASE,
    icon: 'error',
  }, swalOpts));
}

export function swalLoading(opts = {}) {
  return Swal.fire(mergeSwalOptions({
    ...BASE,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  }, opts));
}

/**
 * Modal con barra de progreso para operaciones de descarga/generación de archivos.
 * Usa swalUpdateProgress() para actualizar el porcentaje mientras avanza.
 */
export function swalProgressPDF(opts = {}) {
  return Swal.fire(mergeSwalOptions({
    ...BASE,
    allowOutsideClick: false,
    showConfirmButton: false,
    html: `
      <div style="text-align:left;margin-top:0.5rem">
        <div
          id="swal-pdf-label"
          style="font-size:0.75rem;color:hsl(var(--muted-foreground));margin-bottom:0.5rem;min-height:1.1em"
        >Preparando documento...</div>
        <div style="height:6px;background:hsl(var(--muted));border-radius:9999px;overflow:hidden">
          <div
            id="swal-pdf-bar"
            style="height:100%;width:0%;background:hsl(var(--primary));border-radius:9999px;transition:width 0.35s ease"
          ></div>
        </div>
        <div
          id="swal-pdf-pct"
          style="font-size:0.7rem;color:hsl(var(--muted-foreground));margin-top:0.375rem;text-align:right"
        >0%</div>
      </div>
    `,
  }, opts));
}

/** Actualiza la barra de progreso abierta por swalProgressPDF. */
export function swalUpdateProgress(pct, label) {
  const bar = document.getElementById('swal-pdf-bar');
  const pctEl = document.getElementById('swal-pdf-pct');
  const labelEl = document.getElementById('swal-pdf-label');
  if (bar) bar.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (label && labelEl) labelEl.textContent = label;
}

export function swalClose() {
  Swal.close();
}

/**
 * Info/display modal with rich HTML content.
 * For read-only information modals — no form inputs, just content + close button.
 */
export function swalInfo(opts = {}) {
  return Swal.fire(mergeSwalOptions({
    ...BASE,
    icon: opts.icon ?? undefined,
    showCloseButton: true,
    confirmButtonText: 'Cerrar',
  }, opts));
}

/**
 * Form dialog with HTML content and preConfirm validation.
 * For dialogs that collect user input via HTML form elements.
 * Supports preConfirm, Swal.showValidationMessage, and all Swal options.
 */
export function swalFormDialog(opts = {}) {
  return Swal.fire(mergeSwalOptions({
    ...BASE,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
  }, opts));
}

/**
 * Re-export Swal for advanced usage (showValidationMessage, etc.)
 */
export { Swal };
