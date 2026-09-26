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

vi.mock('../app/utils/pdfDownload', () => ({
  downloadProtectedPdf: vi.fn(() => Promise.resolve()),
}));

import EXP_RES_2 from '../app/pages/user/expeditions/exp_res_2.component';
import { downloadProtectedPdf } from '../app/utils/pdfDownload';

describe('EXP_RES_2', () => {
  beforeEach(() => {
    joditMockState.lastProps = null;
    vi.clearAllMocks();
    downloadProtectedPdf.mockResolvedValue();
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
      expect(downloadProtectedPdf).toHaveBeenCalledTimes(1);
    });

    const [path, filename, request] = downloadProtectedPdf.mock.calls[0];
    expect(path).toBe('/pdf-generate/generate-pdf');
    expect(filename).toBe('Resolucion CUB1-2024-0001.pdf');
    expect(request).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = request.data;
    expect(payload.html).toContain('Resolución editada desde Jodit');
    expect(payload.html).not.toContain('VALOR_OBSOLETO_REF');
    expect(payload.documentType).toBe('open');
  });

  test('preserva un margen superior explícito de cero para Ejecutoria', async () => {
    render(
      <EXP_RES_2
        data={{ _DATA: { reso: { m_top: 0 } } }}
        swaMsg={{ text_wait: 'Procesando', generic_eror_title: 'Error', generic_error_text: 'Error genérico' }}
        currentItem={{ id_public: 'CUB1-2024-0001', fun_clocks: [] }}
        currentModel="eje_open"
      />,
    );

    await screen.findByText(/Ejecutoria editable/i);
    fireEvent.click(screen.getByRole('button', { name: /descargar pdf/i }));

    await waitFor(() => expect(downloadProtectedPdf).toHaveBeenCalledTimes(1));
    const payload = downloadProtectedPdf.mock.calls[0][2].data;
    expect(payload.documentType).toBe('eje_open');
    expect(payload.margins.top).toBe(0);
  });
});
