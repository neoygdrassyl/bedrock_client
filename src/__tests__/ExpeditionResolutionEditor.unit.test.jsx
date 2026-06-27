import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const joditMockState = vi.hoisted(() => ({
  lastProps: null,
}));

vi.mock('jodit-pro-react', () => ({
  default: ({ ref, value, config, onChange }) => {
    const React = require('react');

    React.useImperativeHandle(ref, () => ({
      value: '<html><body>VALOR_OBSOLETO_REF</body></html>',
    }));

    joditMockState.lastProps = { value, config, onChange };

    return (
      <div data-testid="jodit-editor">
        <span>{value}</span>
        <button
          type="button"
          onClick={() => onChange('<html><body>Resolución editada desde Jodit</body></html>')}
        >
          Simular edición Jodit
        </button>
      </div>
    );
  },
}));

vi.mock('../app/utils/TemplateEngine', () => ({
  TemplateEngine: {
    buildTemplate: vi.fn(() => Promise.resolve('<p>Base</p>')),
  },
}));

vi.mock('../app/utils/ResoEngineTemplate', () => ({
  ResoEngineTemplate: class {
    modifyTemplateContent() {
      return '<p>Resolución editable</p>';
    }
  },
}));

vi.mock('../app/utils/ActDesistEngineTemp', () => ({
  ActDesistEngineTemp: class {
    modifyTemplateContent() {
      return '<p>Acta editable</p>';
    }
  },
}));

vi.mock('../app/utils/ExecEngineTemp', () => ({
  ExecEngineTemp: class {
    modifyTemplateContent() {
      return '<p>Ejecutoria editable</p>';
    }
  },
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalClose: vi.fn(),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalProgressPDF: vi.fn(),
  swalUpdateProgress: vi.fn(),
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

import EXP_RES_2 from '../app/pages/user/expeditions/exp_res_2.component';

describe('EXP_RES_2', () => {
  beforeEach(() => {
    joditMockState.lastProps = null;
    const pdfBytes = new TextEncoder().encode('pdf-content');
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(pdfBytes);
        controller.close();
      },
    });
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      headers: { get: () => null },
      body: stream,
    }));
  });

  test('renderiza el contenedor del editor PDF con la vista previa editable', async () => {
    render(
      <EXP_RES_2
        data={{
          _DATA: {
            reso: {
              m_top: '1.2',
              m_bot: '1.5',
              m_left: '1.9',
              m_right: '1.9',
              logo_pages: 'par',
              autenticidad: 'Original',
              font_size_body: '14',
              font_size_header: '10',
            },
          },
        }}
        swaMsg={{
          text_wait: 'Procesando',
          generic_eror_title: 'Error',
          generic_error_text: 'Error genérico',
        }}
        currentItem={{ id_public: 'CUB1-2024-0001', fun_clocks: [] }}
        currentModel="open"
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('exp-res-editor')).toBeInTheDocument();
    });

    expect(screen.getByText('Editor PDF de resolución')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /descargar pdf/i })).toBeInTheDocument();
    expect(screen.getByTestId('jodit-editor')).toBeInTheDocument();
    expect(screen.getByText(/Resolución editable/i)).toBeInTheDocument();
  });

  test('configura Jodit para editar documentos HTML completos dentro de iframe', async () => {
    render(
      <EXP_RES_2
        data={{ _DATA: { reso: {} } }}
        swaMsg={{ text_wait: 'Procesando', generic_eror_title: 'Error', generic_error_text: 'Error genérico' }}
        currentItem={{ id_public: 'CUB1-2024-0001', fun_clocks: [] }}
        currentModel="open"
      />,
    );

    await waitFor(() => {
      expect(joditMockState.lastProps?.config).toMatchObject({
        iframe: true,
        editHTMLDocumentMode: true,
      });
    });
  });

  test('descarga el HTML editado desde el estado del editor y no desde una ref obsoleta', async () => {
    render(
      <EXP_RES_2
        data={{ _DATA: { reso: {} } }}
        swaMsg={{ text_wait: 'Procesando', generic_eror_title: 'Error', generic_error_text: 'Error genérico' }}
        currentItem={{ id_public: 'CUB1-2024-0001', fun_clocks: [] }}
        currentModel="open"
      />,
    );

    await screen.findByText(/Resolución editable/i);
    fireEvent.click(screen.getByRole('button', { name: /simular edición jodit/i }));
    fireEvent.click(screen.getByRole('button', { name: /descargar pdf/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const [, request] = global.fetch.mock.calls[0];
    const payload = JSON.parse(request.body);
    expect(payload.html).toContain('Resolución editada desde Jodit');
    expect(payload.html).not.toContain('VALOR_OBSOLETO_REF');
  });
});