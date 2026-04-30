import Swal from 'sweetalert2';
import { requestDovelaErrorReport, resolveDovelaReportLastError } from './errorReporting';

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

const LOAD_ITEM_ERROR_PATTERN = /no ha sido posible cargar este (?:item|ítem)[,.\s]*int[eé]ntelo nuevamente/i;

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

export function swalError(opts = {}) {
  const {
    allowReport = false,
    reportContext = {},
    reportSource = 'legacy-swal-error',
    ...swalOpts
  } = opts;

  const errorText = [swalOpts.title, swalOpts.text].filter(Boolean).join(' ');
  const showReportAction = allowReport || LOAD_ITEM_ERROR_PATTERN.test(errorText);

  return Swal.fire(mergeSwalOptions({
    ...BASE,
    icon: 'error',
    ...(showReportAction ? {
      showDenyButton: true,
      denyButtonText: 'Reportar fallo',
      confirmButtonText: swalOpts.confirmButtonText || 'Cerrar',
    } : {}),
  }, swalOpts)).then((result) => {
    if (showReportAction && result.isDenied) {
      requestDovelaErrorReport({
        ...reportContext,
        reportSource,
        lastError: resolveDovelaReportLastError(reportContext) || {
          source: reportSource,
          error: {
            message: errorText || 'Dovela mostró un error sin detalle adicional.',
          },
        },
      });
    }

    return result;
  });
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
