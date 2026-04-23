import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('jodit-pro-react', () => ({
  default: ({ value }) => <div data-testid="jodit-editor">{value}</div>,
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
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

import EXP_RES_2 from '../app/pages/user/expeditions/exp_res_2.component';

describe('EXP_RES_2', () => {
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
});