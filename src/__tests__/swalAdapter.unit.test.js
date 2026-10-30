import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
    close: vi.fn(),
    showLoading: vi.fn(),
    isLoading: vi.fn(() => false),
    isVisible: vi.fn(() => false),
    getPopup: vi.fn(() => null),
    getInput: vi.fn(() => null),
    getCancelButton: vi.fn(() => null),
    getDenyButton: vi.fn(() => null),
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
    [{ title: '<h2>SE HAN PRESENTADO ERRORES</h2>', text: 'Al parece hubo errores en el procesamiento de esta accion.' }],
    [{ title: 'ERROR AL GUARDAR', text: 'No fue posible guardar los cambios.' }],
  ])('keeps every call without symptom: true as a modal: %o', (opts) => {
    expect(classifySwalError(opts).symptom).toBe(false);
  });

  it('treats only an explicit symptom: true as a symptom, never for interactive dialogs', () => {
    expect(classifySwalError({ title: 'Fallo', symptom: true }).symptom).toBe(true);
    expect(classifySwalError({ title: 'ERROR AL CARGAR', symptom: false }).symptom).toBe(false);
    expect(classifySwalError({ title: 'ERROR AL CARGAR', symptom: true, showCancelButton: true }).symptom).toBe(false);
  });

  it('reads the related request id from requestId or error', () => {
    expect(classifySwalError({ requestId: 'req_explicit_1234' }).relatedRequestId).toBe('req_explicit_1234');
    expect(classifySwalError({ error: { config: { dovelaRequestId: 'req_from_error_12' } } }).relatedRequestId).toBe('req_from_error_12');
    expect(classifySwalError({}).relatedRequestId).toBeNull();
  });

  it('logs and toasts a symptom instead of opening a modal', async () => {
    const error = { config: { dovelaRequestId: 'req_load_12345678' }, response: { status: 503 } };

    const result = await swalError({ title: 'ERROR AL CARGAR', text: 'No ha sido posible cargar este item.', error, symptom: true });

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

  it('keeps the load-looking title as a modal and logs it as an action failure', async () => {
    await swalError({ title: 'ERROR AL CARGAR', text: 'No fue posible generar el PDF.', requestId: 'req_pdf_12345678' });

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'ERROR AL CARGAR', icon: 'error' }));
    expect(toastWarning).not.toHaveBeenCalled();
    expect(__getQueuedEventsForTests()).toEqual([
      expect.objectContaining({
        level: 'warn',
        event: 'ui_action_failed',
        message: 'No fue posible generar el PDF.',
        relatedRequestId: 'req_pdf_12345678',
        path: expect.any(String),
        data: { title: 'ERROR AL CARGAR', text: 'No fue posible generar el PDF.' },
      }),
    ]);
  });

  it('closes an open spinner when a symptom becomes a toast', async () => {
    Swal.isVisible.mockReturnValueOnce(true);
    Swal.isLoading.mockReturnValueOnce(true);

    await swalError({ title: 'Aviso', text: 'No se pudo cargar el listado.', symptom: true });

    expect(Swal.close).toHaveBeenCalledTimes(1);
  });

  it('closes an open PDF progress popup when a symptom becomes a toast', async () => {
    const popup = document.createElement('div');
    popup.innerHTML = '<div id="swal-pdf-bar"></div>';
    Swal.isVisible.mockReturnValueOnce(true);
    Swal.getPopup.mockReturnValueOnce(popup);

    await swalError({ title: 'Aviso', text: 'No se pudo cargar el listado.', symptom: true });

    expect(Swal.close).toHaveBeenCalledTimes(1);
  });

  it('leaves unrelated modals open when a symptom becomes a toast', async () => {
    const cancel = document.createElement('button');
    Swal.isVisible.mockReturnValue(true);
    Swal.getPopup.mockReturnValue(document.createElement('div'));

    await swalError({ title: 'Aviso', text: 'No se pudo cargar el listado.', symptom: true });
    expect(Swal.close).not.toHaveBeenCalled();

    // A preConfirm loader of a dialog with a cancel button is not a spinner.
    Swal.isLoading.mockReturnValue(true);
    Swal.getCancelButton.mockReturnValue(cancel);
    await swalError({ title: 'Aviso', text: 'No se pudo cargar otra lista.', symptom: true });
    expect(Swal.close).not.toHaveBeenCalled();

    Swal.isVisible.mockReturnValue(false);
    Swal.getPopup.mockReturnValue(null);
    Swal.isLoading.mockReturnValue(false);
    Swal.getCancelButton.mockReturnValue(null);
  });

  it('does not pass the classification options to SweetAlert2', async () => {
    await swalError({ title: 'ERROR AL GUARDAR', text: 'x', symptom: false, error: {}, requestId: 'req_x_12345678' });

    const options = Swal.fire.mock.calls[0][0];
    expect(options).not.toHaveProperty('symptom');
    expect(options).not.toHaveProperty('error');
    expect(options).not.toHaveProperty('requestId');
  });
});
