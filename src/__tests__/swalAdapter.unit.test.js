import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
    close: vi.fn(),
    showLoading: vi.fn(),
  },
}));

import { swalConfirm, swalSuccess, swalError, swalLoading, swalClose } from '@/app/utils/swalAdapter';
import Swal from 'sweetalert2';

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
      })
    );
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

  it('swalClose calls Swal.close', () => {
    swalClose();
    expect(Swal.close).toHaveBeenCalled();
  });
});
