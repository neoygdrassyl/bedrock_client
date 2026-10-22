import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
    close: vi.fn(),
    showLoading: vi.fn(),
    isLoading: vi.fn(() => false),
  },
}));

const toastWarning = vi.hoisted(() => vi.fn());
vi.mock('sonner', () => ({ toast: { warning: toastWarning } }));

import {
  swalConfirm,
  swalSuccess,
  swalError,
  swalLoading,
  swalClose,
  swalInfo,
  swalFormDialog,
  classifySwalError,
} from '@/shared/utils/swalAdapter';
import Swal from 'sweetalert2';
import {
  __getQueuedEventsForTests,
  __resetLoggerForTests,
  rememberHttpFailure,
} from '@/shared/observability/logger';

const swalThemeCss = readFileSync(path.resolve(__dirname, '../shared/styles/swal-theme.css'), 'utf8');

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

  it('swal theme keeps dialogs above fullscreen expediente layers', () => {
    expect(swalThemeCss).toMatch(/\.swal2-container\s*\{[^}]*z-index:\s*30000\s*!important;/s);
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

describe('swalError symptom classification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetLoggerForTests();
  });

  it.each([
    [{ title: 'ERROR AL CARGAR', text: 'No ha sido posible cargar este item, intentelo nuevamente.' }],
    [{ title: 'Aviso', text: 'No se pudo cargar el listado de radicaciones.' }],
    [{ title: 'Aviso', text: 'No fue posible cargar la lista de chequeo inteligente.' }],
    [{ title: '<h2>Error</h2>', text: 'No se pudieron cargar los profesionales.' }],
  ])('treats load failures as symptoms: %o', (opts) => {
    expect(classifySwalError(opts).symptom).toBe(true);
  });

  it.each([
    [{ title: 'ERROR AL GUARDAR', text: 'No fue posible guardar los cambios.' }],
    [{ title: 'ERROR AL DESCARGAR', text: 'No fue posible descargar el documento.' }],
    [{ title: 'ANEXOS INCOMPLETOS', text: 'Debe recargar el expediente.' }],
    [{ title: '<h2>SE HAN PRESENTADO ERRORES</h2>', text: 'Al parece hubo errores en el procesamiento de esta accion.' }],
  ])('keeps action failures as modals: %o', (opts) => {
    expect(classifySwalError(opts).symptom).toBe(false);
  });

  it('treats the generic message as a symptom only right after a failed GET', () => {
    const generic = { title: '<h2>SE HAN PRESENTADO ERRORES</h2>', text: 'Al parece hubo errores en el procesamiento de esta accion.' };

    rememberHttpFailure({ config: { method: 'post', dovelaRequestId: 'req_post_12345678' }, response: { status: 500 } });
    expect(classifySwalError(generic)).toEqual({ symptom: false, relatedRequestId: 'req_post_12345678' });

    rememberHttpFailure({ config: { method: 'get', dovelaRequestId: 'req_get_12345678' }, response: { status: 500 } });
    expect(classifySwalError(generic)).toEqual({ symptom: true, relatedRequestId: 'req_get_12345678' });
  });

  it('honours the explicit symptom option and never toasts interactive dialogs', () => {
    expect(classifySwalError({ title: 'ERROR AL CARGAR', symptom: false }).symptom).toBe(false);
    expect(classifySwalError({ title: 'Fallo al firmar', symptom: true }).symptom).toBe(true);
    expect(classifySwalError({ title: 'ERROR AL CARGAR', showCancelButton: true }).symptom).toBe(false);
  });

  it('logs and toasts a load failure instead of opening a modal', async () => {
    const error = { config: { dovelaRequestId: 'req_load_12345678' }, response: { status: 503 } };

    const result = await swalError({ title: 'ERROR AL CARGAR', text: 'No ha sido posible cargar este item.', error });

    expect(Swal.fire).not.toHaveBeenCalled();
    expect(result).toMatchObject({ isConfirmed: true, symptom: true });
    expect(toastWarning).toHaveBeenCalledWith('No se pudo cargar parte de la información', expect.objectContaining({
      description: 'Código: req_load_12345678',
    }));
    expect(__getQueuedEventsForTests()).toEqual([
      expect.objectContaining({
        level: 'warn',
        event: 'ui_load_failed',
        message: 'No ha sido posible cargar este item.',
        relatedRequestId: 'req_load_12345678',
        data: { title: 'ERROR AL CARGAR' },
      }),
    ]);
  });

  it('closes a pending loading modal when a load failure becomes a toast', async () => {
    Swal.isLoading.mockReturnValueOnce(true);

    await swalError({ title: 'ERROR AL CARGAR', text: 'No ha sido posible cargar el consecutivo.' });

    expect(Swal.close).toHaveBeenCalledTimes(1);
  });

  it('does not pass the classification options to SweetAlert2', async () => {
    await swalError({ title: 'ERROR AL GUARDAR', text: 'x', symptom: false, error: {}, requestId: 'req_x_12345678' });

    const options = Swal.fire.mock.calls[0][0];
    expect(options).not.toHaveProperty('symptom');
    expect(options).not.toHaveProperty('error');
    expect(options).not.toHaveProperty('requestId');
  });
});
