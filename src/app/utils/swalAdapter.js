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

export function swalConfirm(opts = {}) {
  return Swal.fire({
    ...BASE,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    ...opts,
  });
}

export function swalSuccess(opts = {}) {
  return Swal.fire({
    ...BASE,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    ...opts,
  });
}

export function swalError(opts = {}) {
  return Swal.fire({
    ...BASE,
    icon: 'error',
    ...opts,
  });
}

export function swalLoading(opts = {}) {
  return Swal.fire({
    ...BASE,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
    ...opts,
  });
}

export function swalClose() {
  Swal.close();
}

/**
 * Info/display modal with rich HTML content.
 * For read-only information modals — no form inputs, just content + close button.
 */
export function swalInfo(opts = {}) {
  return Swal.fire({
    ...BASE,
    icon: opts.icon ?? undefined,
    showCloseButton: true,
    confirmButtonText: 'Cerrar',
    ...opts,
  });
}

/**
 * Form dialog with HTML content and preConfirm validation.
 * For dialogs that collect user input via HTML form elements.
 * Supports preConfirm, Swal.showValidationMessage, and all Swal options.
 */
export function swalFormDialog(opts = {}) {
  return Swal.fire({
    ...BASE,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    ...opts,
  });
}

/**
 * Re-export Swal for advanced usage (showValidationMessage, etc.)
 */
export { Swal };
