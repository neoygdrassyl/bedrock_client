import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const service = vi.hoisted(() => ({ documentReviews: vi.fn(), updateDocumentReviews: vi.fn() }));
vi.mock('../../../services/legal_config.service.js', () => ({ default: service }));
import DocumentReviewChecksPage from './DocumentReviewChecksPage.jsx';

const workspace = {
  documents: [
    {
      id: 'd1', code: '6601', name: 'Planos arquitectónicos', is_active: true,
      review_config: { schemaVersion: 1, checks: [{ id: 'signed', text: '¿Está firmado?', active: true }] },
    },
    { id: 'd2', code: '6609', name: 'Concepto de patrimonio', is_active: true, review_config: null },
  ],
};

describe('DocumentReviewChecksPage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('adds and saves ordered review statements in one JSON document', async () => {
    service.documentReviews.mockResolvedValue({ data: workspace.documents });
    service.updateDocumentReviews.mockResolvedValue({
      data: {
        ...workspace.documents[0],
        review_config: {
          schemaVersion: 1,
          checks: [
            { id: 'signed', text: '¿Está firmado?', active: true },
            { id: 'new-check', text: '¿El contenido es legible?', active: true },
          ],
        },
      },
    });
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('new-check');
    render(<DocumentReviewChecksPage />);

    expect(await screen.findByRole('heading', { name: 'Revisiones por documento' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('¿Está firmado?')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Nueva revisión' }), { target: { value: '¿El contenido es legible?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir revisión' }));
    expect(screen.getByDisplayValue('¿El contenido es legible?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar revisiones' }));

    await waitFor(() => expect(service.updateDocumentReviews).toHaveBeenCalledWith('d1', {
      review_config: {
        schemaVersion: 1,
        checks: [
          { id: 'signed', text: '¿Está firmado?', active: true },
          { id: 'new-check', text: '¿El contenido es legible?', active: true },
        ],
      },
    }));
    expect(await screen.findByRole('status')).toHaveTextContent('Revisiones guardadas.');
  });

  it('soft-deactivates a check and keeps the three answer states visible', async () => {
    service.documentReviews.mockResolvedValue({ data: workspace.documents });
    render(<DocumentReviewChecksPage />);

    const row = await screen.findByRole('group', { name: 'Revisión 1' });
    expect(within(row).getByText('Pendiente')).toBeInTheDocument();
    expect(within(row).getByText('Sí')).toBeInTheDocument();
    expect(within(row).getByText('No')).toBeInTheDocument();
    fireEvent.click(within(row).getByRole('button', { name: 'Desactivar revisión' }));
    expect(within(row).getByText('Inactiva')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar revisiones' })).toBeEnabled();
  });

  it('switches documents without mixing their review lists', async () => {
    service.documentReviews.mockResolvedValue({ data: workspace.documents });
    render(<DocumentReviewChecksPage />);

    await screen.findByDisplayValue('¿Está firmado?');
    fireEvent.click(screen.getByRole('button', { name: /6609 Concepto de patrimonio/ }));
    expect(screen.queryByDisplayValue('¿Está firmado?')).not.toBeInTheDocument();
    expect(screen.getByText('Este documento todavía no tiene revisiones.')).toBeInTheDocument();
  });

  it('shows API errors without discarding the current text', async () => {
    service.documentReviews.mockResolvedValue({ data: workspace.documents });
    service.updateDocumentReviews.mockRejectedValue({ response: { data: { message: 'No fue posible guardar las revisiones.' } } });
    render(<DocumentReviewChecksPage />);

    const input = await screen.findByDisplayValue('¿Está firmado?');
    fireEvent.change(input, { target: { value: '¿Está firmado por el profesional?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar revisiones' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No fue posible guardar las revisiones.');
    expect(input).toHaveValue('¿Está firmado por el profesional?');
  });
});
