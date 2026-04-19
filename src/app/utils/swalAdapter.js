import Swal from 'sweetalert2';

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

export function swalError(opts = {}) {
  return Swal.fire(mergeSwalOptions({
    ...BASE,
    icon: 'error',
  }, opts));
}

export function swalLoading(opts = {}) {
  return Swal.fire(mergeSwalOptions({
    ...BASE,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  }, opts));
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
