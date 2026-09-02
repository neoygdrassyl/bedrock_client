import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const { qgisServiceMock } = vi.hoisted(() => ({
  qgisServiceMock: {
    getLatestImport: vi.fn(),
    approveImport: vi.fn(),
    rejectImport: vi.fn(),
  },
}));

vi.mock('../../../../services/subdivision_qgis.service.js', () => ({
  default: qgisServiceMock,
}));

vi.mock('@/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

import { SubdivisionQgisImportPanel } from './SubdivisionArchitectureReport.jsx';

const latestResponse = {
  data: {
    ok: true,
    import: {
      id: 77,
      status: 'pending_approval_with_warnings',
      approval_status: 'pending',
      summary: {
        points_count: 2,
        lots_count: 2,
        visualizations_count: 1,
        preview_images_count: 1,
        area_closes: false,
        area_difference_m2: 197451.77,
        crs_auth: 'EPSG:9377',
      },
      warnings: [{ code: 'area_remainder_without_lot', message: 'Falta remanente explícito.' }],
    },
    payload: {
      visualizations: [
        {
          id: 'preview-1',
          type: 'image',
          role: 'preview',
          title: 'Previsualización QGIS',
          mime_type: 'image/png',
          data_url: 'data:image/png;base64,iVBORw0KGgo=',
        },
      ],
    },
  },
};

describe('SubdivisionQgisImportPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    qgisServiceMock.getLatestImport.mockResolvedValue(latestResponse);
    qgisServiceMock.approveImport.mockResolvedValue({ data: { ok: true, approval_status: 'approved', status: 'approved_with_warnings' } });
  });

  it('loads latest QGIS snapshot and renders preview image plus pending approval state', async () => {
    render(<SubdivisionQgisImportPanel idPublic="SUB26-0001" version={1} />);

    expect(qgisServiceMock.getLatestImport).toHaveBeenCalledWith('SUB26-0001', 1);
    expect(await screen.findByText(/Datos QGIS recibidos/i)).toBeDefined();
    expect(screen.getAllByText(/Pendiente de aprobación/i).length).toBeGreaterThan(0);
    expect(screen.getByAltText(/Previsualización QGIS/i)).toHaveAttribute('src', 'data:image/png;base64,iVBORw0KGgo=');
    expect(screen.getByText('2 puntos')).toBeDefined();
    expect(screen.getByText('2 predios')).toBeDefined();
    expect(screen.getByText(/Falta remanente explícito/i)).toBeDefined();
  });

  it('approves the import and refreshes latest snapshot', async () => {
    render(<SubdivisionQgisImportPanel idPublic="SUB26-0001" version={1} />);

    const button = await screen.findByRole('button', { name: /Aprobar import #77 · v1/i });
    fireEvent.click(button);

    await waitFor(() => expect(qgisServiceMock.approveImport).toHaveBeenCalledWith(77, { notes: 'Aprobado desde submódulo de arquitectura.' }));
    expect(qgisServiceMock.getLatestImport).toHaveBeenCalledTimes(2);
  });

  it('keeps the snapshot visible when approval fails', async () => {
    qgisServiceMock.approveImport.mockRejectedValueOnce({
      response: { data: { message: 'Error interno procesando integración QGIS.' } },
    });

    render(<SubdivisionQgisImportPanel idPublic="SUB26-0001" version={1} />);

    const button = await screen.findByRole('button', { name: /Aprobar import #77 · v1/i });
    fireEvent.click(button);

    expect(await screen.findByRole('alert')).toHaveTextContent('Error interno procesando integración QGIS.');
    expect(screen.getByText('2 puntos')).toBeDefined();
    expect(screen.getByText(/Import QGIS #77/i)).toBeDefined();
  });

  it('falls back to version 1 when the current version has no QGIS snapshot', async () => {
    qgisServiceMock.getLatestImport
      .mockResolvedValueOnce({ data: { ok: true, import: null, payload: null } })
      .mockResolvedValueOnce(latestResponse);

    render(<SubdivisionQgisImportPanel idPublic="SUB26-0001" version={3} />);

    await waitFor(() => expect(qgisServiceMock.getLatestImport).toHaveBeenCalledWith('SUB26-0001', 3));
    await waitFor(() => expect(qgisServiceMock.getLatestImport).toHaveBeenCalledWith('SUB26-0001', 1));
    expect(await screen.findByText('2 puntos')).toBeDefined();
  });

  it('shows the exact QGIS import and version that approval actions will affect', async () => {
    qgisServiceMock.getLatestImport
      .mockResolvedValueOnce({ data: { ok: true, import: null, payload: null } })
      .mockResolvedValueOnce(latestResponse);

    render(<SubdivisionQgisImportPanel idPublic="SUB26-0001" version={3} />);

    expect(await screen.findByText(/Import QGIS #77/i)).toBeDefined();
    expect(screen.getByText(/Versión importada: 1/i)).toBeDefined();
    expect(screen.getByText(/Vista actual: 3/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Aprobar import #77 · v1/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Rechazar import #77 · v1/i })).toBeDefined();
  });

  it('does not render unsafe remote or SVG preview sources', async () => {
    qgisServiceMock.getLatestImport.mockResolvedValue({
      data: {
        ok: true,
        import: {
          id: 78,
          status: 'pending_approval',
          approval_status: 'pending',
          summary: { points_count: 1, lots_count: 1, visualizations_count: 1, preview_images_count: 1 },
          warnings: [],
        },
        payload: {
          visualizations: [
            { id: 'tracker', type: 'image', title: 'Tracker remoto', url: 'https://tracker.example/qgis.png' },
            { id: 'svg', type: 'image', title: 'SVG', data_url: 'data:image/svg+xml;base64,PHN2Zy8+' },
          ],
        },
      },
    });

    render(<SubdivisionQgisImportPanel idPublic="SUB26-0001" version={1} />);

    expect(await screen.findByText(/El último envío no incluye imagen de previsualización/i)).toBeDefined();
    expect(screen.queryByAltText(/Tracker remoto/i)).toBeNull();
    expect(screen.queryByAltText(/SVG/i)).toBeNull();
  });

});
