import Swal from 'sweetalert2';
import { getRequestIdFromError, logEvent } from '@/shared/observability/logger';

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
// Rule: a failed ACTION (save, delete, generate, download, validate, assign a
// consecutive…) keeps the blocking modal: the user must know the action did not
// happen. Every such call is also logged as `ui_action_failed` (warn) so it can
// be traced, without changing what the user sees.
//
// A failed background LOAD (data a page or panel fetches to show, where the page
// stays usable without it) can opt in to being a symptom with `symptom: true`:
// no modal and no toast, only a `ui_load_failed` log entry (see
// `window.__dovelaLogs`). The panel that lacks data shows its own empty or
// load-error state. There is no automatic detection by title, text or recent
// request: the caller must have verified that the failure is a background load.
// Calls that ask for a decision (cancel/deny buttons, inputs, preConfirm) always
// keep the modal, even with `symptom: true`.

const INTERACTIVE_OPTIONS = ['showCancelButton', 'showDenyButton', 'input', 'preConfirm', 'preDeny'];
const SYMPTOM_RESULT = Object.freeze({ isConfirmed: true, isDenied: false, isDismissed: false, value: true, symptom: true });

function plainText(value) {
  if (value == null) return '';
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Decides whether a swalError call is a load symptom (log only) or an action
 * failure (modal). Exported for tests.
 *
 * @returns {{ symptom: boolean, relatedRequestId: string|null }}
 */
export function classifySwalError(opts = {}) {
  const relatedRequestId = opts.requestId || getRequestIdFromError(opts.error) || null;
  const interactive = INTERACTIVE_OPTIONS.some((key) => opts[key]);
  return { symptom: opts.symptom === true && !interactive, relatedRequestId };
}

function isVisibleElement(element) {
  return Boolean(element) && element.style?.display !== 'none' && !element.hidden;
}

// True only for a spinner (`swalLoading` or an equivalent `Swal.showLoading()`
// popup without user controls) or a `swalProgressPDF` progress popup.
function isBusyPopupOpen() {
  if (!Swal.isVisible?.()) return false;
  const popup = Swal.getPopup?.();
  if (popup?.querySelector?.('#swal-pdf-bar')) return true;
  if (!Swal.isLoading?.()) return false;
  const hasUserControls = isVisibleElement(Swal.getInput?.())
    || isVisibleElement(Swal.getCancelButton?.())
    || isVisibleElement(Swal.getDenyButton?.());
  return !hasUserControls;
}

function reportLoadSymptom(title, text, relatedRequestId) {
  logEvent('warn', 'ui_load_failed', {
    message: text || title,
    relatedRequestId: relatedRequestId || undefined,
    data: { title },
  });

  // A load usually started with swalLoading(); without the error modal that
  // would replace it, the spinner would stay open forever. Other modals stay.
  try {
    if (isBusyPopupOpen()) Swal.close();
  } catch {}
}

function reportActionFailure(title, text, relatedRequestId) {
  logEvent('warn', 'ui_action_failed', {
    message: text || title,
    relatedRequestId: relatedRequestId || undefined,
    data: { title, text },
  });
}

/**
 * Error modal, or a silent log entry for verified background loads (see the rule above).
 *
 * @param {object} opts SweetAlert2 options plus:
 * @param {boolean} [opts.symptom] `true` only for a background load whose failure
 *   leaves the page usable: logged, no modal
 * @param {unknown} [opts.error] the failed request's error, to read its request id
 * @param {string} [opts.requestId] explicit request id for the reference
 */
export function swalError(opts = {}) {
  const { symptom: _symptom, error: _error, requestId: _requestId, ...swalOpts } = opts;
  const classification = classifySwalError(opts);
  const title = plainText(swalOpts.title);
  const text = plainText(swalOpts.text || swalOpts.html);

  if (classification.symptom) {
    reportLoadSymptom(title, text, classification.relatedRequestId);
    return Promise.resolve(SYMPTOM_RESULT);
  }

  reportActionFailure(title, text, classification.relatedRequestId);
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
