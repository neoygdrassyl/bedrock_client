import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
    close: vi.fn(),
    showLoading: vi.fn(),
  },
}));

import {
  swalConfirm,
  swalSuccess,
  swalError,
  swalLoading,
  swalClose,
  swalInfo,
  swalFormDialog,
} from '@/app/utils/swalAdapter';
import Swal from 'sweetalert2';

const swalThemeCss = readFileSync('/home/diego/dovela/frontend/src/app/styles/swal-theme.css', 'utf8');

describe('swalAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('swalConfirm calls Swal.fire with confirm defaults', async () => {
    await swalConfirm({ title: 'Delete?', text: 'This is permanent' });
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete?',
        text: 'This is permanent',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      })
    );
  });

  it('swalSuccess calls Swal.fire with success icon', async () => {
    await swalSuccess({ title: 'Done!' });
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Done!',
        icon: 'success',
        timer: 2000,
      })
    );
  });

  it('swalError calls Swal.fire with error icon', async () => {
    await swalError({ title: 'Oops', text: 'Something broke' });
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Oops',
        icon: 'error',
        customClass: expect.objectContaining({
          confirmButton: 'swal2-confirm-themed',
          cancelButton: 'swal2-cancel-themed',
        }),
      })
    );
  });

  it('swal theme styles the adapter button classes directly', () => {
    expect(swalThemeCss).toMatch(/\.swal2-confirm-themed\s*\{/);
    expect(swalThemeCss).toMatch(/\.swal2-cancel-themed\s*\{/);
    expect(swalThemeCss).toMatch(/\.swal2-deny-themed\s*\{/);
  });

  it('swal theme does not force hidden popups to replay the show animation', () => {
    expect(swalThemeCss).not.toMatch(/\.swal2-popup:not\(\.swal2-show\)/);
  });

  it('swalLoading calls Swal.fire with no buttons', async () => {
    await swalLoading({ title: 'Cargando...' });
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Cargando...',
        allowOutsideClick: false,
        showConfirmButton: false,
      })
    );
  });

  it('swalInfo preserves themed button classes when callers add customClass overrides', async () => {
    await swalInfo({
      title: 'Detalle',
      customClass: {
        popup: 'phase-detail-modal-popup',
        htmlContainer: 'phase-detail-modal-container',
      },
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        customClass: expect.objectContaining({
          popup: 'phase-detail-modal-popup',
          htmlContainer: 'phase-detail-modal-container',
          confirmButton: 'swal2-confirm-themed',
          cancelButton: 'swal2-cancel-themed',
        }),
      })
    );
  });

  it('swalFormDialog keeps theme classes when pages provide popup-specific customClass', async () => {
    await swalFormDialog({
      title: 'Programar tiempos',
      customClass: {
        popup: 'schedule-modal-popup',
      },
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        customClass: expect.objectContaining({
          popup: 'schedule-modal-popup',
          confirmButton: 'swal2-confirm-themed',
          cancelButton: 'swal2-cancel-themed',
        }),
      })
    );
  });

  it('swalClose calls Swal.close', () => {
    swalClose();
    expect(Swal.close).toHaveBeenCalled();
  });
});
