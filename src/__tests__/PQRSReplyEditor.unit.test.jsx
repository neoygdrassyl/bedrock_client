import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const joditMockState = vi.hoisted(() => ({
  lastProps: null,
}));

vi.mock('jodit-pro-react', () => ({
  default: ({ id, value, config, onBlur, onChange, className }) => {
    joditMockState.lastProps = { id, value, config, onBlur, onChange, className };

    return (
      <div data-testid="pqrs-jodit-editor" data-class-name={className || ''}>
        <textarea id={id} defaultValue="VALOR_DOM_OBSOLETO" />
        <span>{value}</span>
        <button
          type="button"
          onClick={() => {
            onChange?.('<p>Respuesta formal editada desde Jodit</p>');
            onBlur?.('<p>Respuesta formal editada desde Jodit</p>');
          }}
        >
          Simular edición PQRS
        </button>
      </div>
    );
  },
}));

vi.mock('../app/components/jsons/vars', () => ({
  infoCud: {
    city: 'Bucaramanga',
    dir: 'Directora Test',
    job: 'Curadora Urbana',
    serials: { end: 'CUB-' },
  },
}));

const pqrsServiceMock = vi.hoisted(() => ({
  formalReply: vi.fn(() => Promise.resolve({ data: 'OK' })),
  get: vi.fn(() => Promise.resolve({ data: {} })),
  getlascub: vi.fn(() => Promise.resolve({ data: [{ cub: 'CUB-26-0001' }] })),
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  default: pqrsServiceMock,
}));

vi.mock('../app/services/cubXvr.service', () => ({
  default: {
    createCubXVr: vi.fn(() => Promise.resolve({ data: 'OK' })),
    updateCubVr: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalError: vi.fn(),
  swalSuccess: vi.fn(),
}));

import { PQRS_SET_REPLY1 } from '../app/pages/user/pqrs/components/pqrs_setReply2.component';

const currentItem = {
  id: 1,
  id_global: 'PQRS-2026-001',
  id_publico: 'PQRS-2026-001',
  id_reply: 'CUB-26-0001',
  content: 'Solicitud de prueba',
  pqrs_solocitors: [{ name: 'Solicitante Test' }],
  pqrs_contacts: [{ email: 'test@example.com', address: 'Calle 1 # 2-3' }],
  pqrs_workers: [{ reply: 'Concepto técnico previo' }],
  pqrs_info: { id: 10, reply: '<p>Respuesta formal original</p>' },
  pqrs_time: { id: 11, legal: '2026-04-01', time: 15, reply_doc_date: '2026-04-15' },
};

function renderPQRSReply() {
  return render(
    <PQRS_SET_REPLY1
      currentItem={currentItem}
      swaMsg={{
        publish_success_title: 'Guardado',
        publish_success_text: 'OK',
        text_footer: '',
        generic_eror_title: 'Error',
        generic_error_text: 'Error genérico',
      }}
      retrieveItem={vi.fn()}
      refreshList={vi.fn()}
      requestUpdate={vi.fn()}
    />,
  );
}

describe('PQRS_SET_REPLY1', () => {
  beforeEach(() => {
    joditMockState.lastProps = null;
    pqrsServiceMock.formalReply.mockClear();
  });

  test('configura Jodit aislado y evita aplicar form-control al contenedor del editor', () => {
    renderPQRSReply();

    expect(joditMockState.lastProps?.config).toMatchObject({
      iframe: true,
      readonly: false,
    });
    expect(joditMockState.lastProps?.className || '').not.toContain('form-control');
  });

  test('los botones auxiliares dentro del formulario no disparan submit accidental', () => {
    renderPQRSReply();

    expect(screen.getByRole('button', { name: /generar/i })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: /cargar información/i })).toHaveAttribute('type', 'button');
  });

  test('guarda la respuesta editada desde Jodit y no el textarea DOM obsoleto', async () => {
    renderPQRSReply();

    fireEvent.click(screen.getByRole('button', { name: /simular edición pqrs/i }));
    fireEvent.click(screen.getByRole('button', { name: /guardar respuesta/i }));

    await waitFor(() => {
      expect(pqrsServiceMock.formalReply).toHaveBeenCalledTimes(1);
    });

    const formData = pqrsServiceMock.formalReply.mock.calls[0][0];
    expect(formData.get('info_reply')).toContain('Respuesta formal editada desde Jodit');
    expect(formData.get('info_reply')).not.toContain('VALOR_DOM_OBSOLETO');
  });
});