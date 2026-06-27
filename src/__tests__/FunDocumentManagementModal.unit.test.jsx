import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import FunDocumentManagementModal from '../app/pages/user/fun_forms/components/FunDocumentManagementModal';

vi.mock('@/components/data-table-bridge', () => ({
  default: ({ data = [] }) => <div data-testid="document-history-table">{data.length}</div>,
}));

vi.mock('@/components/legacy-modal', () => ({
  LegacyModal: ({ isOpen, children, contentLabel }) => (isOpen ? <div aria-label={contentLabel}>{children}</div> : null),
}));

vi.mock('../app/components/pdfViewer.component', () => ({
  default: ({ url }) => <div data-testid="document-pdf-viewer">PDF:{url}</div>,
}));

vi.mock('../app/services/fun.service', () => ({
  default: {
    getAll_fun_6_h: vi.fn(async () => ({ data: [] })),
  },
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalConfirm: vi.fn(),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

describe('FunDocumentManagementModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abre una previsualización fullscreen dedicada para el archivo', async () => {
    const user = userEvent.setup();

    render(
      <FunDocumentManagementModal
        open
        onClose={vi.fn()}
        canManage={false}
        swaMsg={{}}
        documentItem={{
          id: 51,
          description: 'Formulario Único Nacional',
          path: 'fun/2026/51',
          filename: 'documento.pdf',
        }}
      />,
    );

    await user.click(screen.getByTestId('document-preview-fullscreen-trigger'));

    expect(screen.getByTestId('document-preview-fullscreen-modal')).toBeInTheDocument();
    expect(screen.getAllByTestId('document-pdf-viewer')).toHaveLength(2);

    await user.click(screen.getByLabelText('Cerrar previsualización en pantalla completa'));

    expect(screen.queryByTestId('document-preview-fullscreen-modal')).not.toBeInTheDocument();
  });
});