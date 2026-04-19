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
