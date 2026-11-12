import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const list = vi.fn();

vi.mock('@/features/ventanilla/api/online-radication.service', () => ({
  default: { list: (...args) => list(...args) },
  isRequestCanceled: () => false,
  isUnavailableError: (error) => Boolean(error?.unavailable),
}));

// The detail sheet belongs to another module: only its props contract is checked here.
vi.mock('./RequestDetailSheet', () => ({
  RequestDetailSheet: ({ open, summary }) => (open ? <div data-testid="detail-sheet">{summary?.publicCode}</div> : null),
}));

const { default: OnlineRadicationInbox } = await import('./OnlineRadicationInbox');

const COUNTS = { pending: 1, pendingEntries: 0, radicated: 0, rejected: 0, all: 1 };
const ITEM = {
  id: 7,
  publicCode: 'RAD-2026-000107',
  status: 'pending',
  receivedAt: new Date().toISOString(),
  applicantName: 'Ana Gómez',
  applicantDocument: '1098765432',
  propertyAddress: 'Calle 45 # 12-30',
  actuations: [{ code: 'A', label: 'Obra nueva' }],
  documentCount: 4,
  requiredDocumentCount: 4,
  pendingEntryCount: 0,
  liquidation: { status: 'awaiting_payment' },
};

describe('OnlineRadicationInbox', () => {
  beforeEach(() => {
    list.mockReset();
  });

  it('lists pending requests first, reports the counts and opens the detail sheet', async () => {
    list.mockResolvedValue({ items: [ITEM], total: 1, counts: COUNTS });
    const onCountsChange = vi.fn();
    render(<OnlineRadicationInbox counts={COUNTS} onCountsChange={onCountsChange} />);

    const table = await screen.findByRole('table', { name: /pendientes/i });
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending', q: '', page: 1, pageSize: 20 }), expect.anything());
    expect(onCountsChange).toHaveBeenCalledWith(COUNTS);
    expect(within(table).getByText('En espera de pago')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Paginación de solicitudes' })).toHaveTextContent('1–1 de 1');

    fireEvent.click(within(table).getByText('Ana Gómez'));
    expect(screen.getByTestId('detail-sheet')).toHaveTextContent('RAD-2026-000107');
    expect(within(table).getAllByRole('row')[1]).toHaveAttribute('data-selected');
  });

  it('filters by status and searches with the debounced query', async () => {
    list.mockResolvedValue({ items: [ITEM], total: 1, counts: COUNTS });
    render(<OnlineRadicationInbox counts={COUNTS} />);
    await screen.findByRole('table');

    fireEvent.click(screen.getByRole('radio', { name: /Todas/ }));
    await waitFor(() => expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'all', page: 1 }), expect.anything()));

    list.mockResolvedValue({ items: [], total: 0, counts: COUNTS });
    fireEvent.change(screen.getByLabelText('Buscar solicitudes'), { target: { value: 'zzz' } });
    await waitFor(() => expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'all', q: 'zzz' }), expect.anything()));
    expect(await screen.findByText('Sin resultados para «zzz»')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Limpiar búsqueda' }).at(-1));
    expect(screen.getByLabelText('Buscar solicitudes')).toHaveValue('');
  });

  it('shows the empty state of the pending queue', async () => {
    list.mockResolvedValue({ items: [], total: 0, counts: { ...COUNTS, pending: 0, all: 0 } });
    render(<OnlineRadicationInbox counts={null} />);
    expect(await screen.findByText('No hay solicitudes pendientes')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Paginación de solicitudes' })).toBeNull();
  });

  it('shows the load error with a retry action', async () => {
    list.mockRejectedValueOnce(new Error('Servidor no disponible'));
    list.mockResolvedValue({ items: [ITEM], total: 1, counts: COUNTS });
    render(<OnlineRadicationInbox counts={COUNTS} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No fue posible cargar las solicitudes');
    expect(alert).toHaveTextContent('Servidor no disponible');
    fireEvent.click(within(alert).getByRole('button', { name: /Reintentar/ }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });
});
