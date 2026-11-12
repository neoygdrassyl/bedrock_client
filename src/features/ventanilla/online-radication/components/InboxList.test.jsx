import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { InboxCards } from './InboxCards';
import { InboxTable } from './InboxTable';
import { StatusBadge } from './StatusBadge';

const NOW = new Date(2026, 10, 12, 10, 0);

const ITEMS = [
  {
    id: 1,
    publicCode: 'RAD-2026-000101',
    status: 'pending',
    receivedAt: '2026-10-15T09:00:00',
    applicantName: 'Ana Gómez',
    applicantDocument: '1098765432',
    propertyAddress: 'Calle 45 # 12-30, barrio Cabecera del Llano',
    requestObject: 'Licencia de construcción',
    actuations: [{ code: 'A', label: 'Obra nueva' }, { code: 'B', label: 'Demolición' }],
    documentCount: 2,
    requiredDocumentCount: 4,
    pendingEntryCount: 0,
  },
  {
    id: 2,
    publicCode: 'RAD-2026-000102',
    status: 'pending',
    receivedAt: '2026-11-11T09:00:00',
    applicantName: 'Luis Pérez',
    applicantDocument: '900123456',
    propertyAddress: 'Carrera 27 # 40-10',
    actuations: [{ code: 'A', label: 'Obra nueva' }],
    documentCount: 4,
    requiredDocumentCount: 4,
    pendingEntryCount: 2,
    liquidation: { status: 'receipt_submitted' },
  },
  {
    id: 3,
    publicCode: 'RAD-2026-000103',
    status: 'pending',
    receivedAt: '2026-10-01T09:00:00',
    applicantName: 'María Díaz',
    actuations: [],
    documentCount: 3,
    requiredDocumentCount: 3,
    liquidation: { status: 'awaiting_payment' },
  },
  {
    id: 4,
    publicCode: 'RAD-2026-000104',
    status: 'radicated',
    receivedAt: '2026-09-01T09:00:00',
    applicantName: 'Constructora Norte S.A.S.',
    actuations: [],
    documentCount: 5,
    requiredDocumentCount: 4,
    funIdPublic: '68001-1-26-0101',
    vr: 'VR-2026-0042',
  },
];

function renderWithTooltips(ui) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe('InboxTable', () => {
  it('renders the six data columns plus the action column', () => {
    renderWithTooltips(<InboxTable items={ITEMS} now={NOW} onOpen={() => {}} label="Solicitudes" />);
    const table = screen.getByRole('table', { name: 'Solicitudes' });
    const headers = within(table).getAllByRole('columnheader').map((cell) => cell.textContent);
    expect(headers).toEqual(['Solicitud', 'Solicitante', 'Predio', 'Recibida', 'Documentos', 'Estado', 'Acciones']);
  });

  it('shows the date as dd/mm/aaaa, the overdue wait and the documents ratio', () => {
    renderWithTooltips(<InboxTable items={ITEMS} now={NOW} onOpen={() => {}} label="Solicitudes" />);
    const [, first, second, third] = screen.getAllByRole('row');

    expect(within(first).getByText('15/10/2026')).toBeInTheDocument();
    expect(first.querySelector('[data-overdue]')).toHaveTextContent('20 d. háb.');
    expect(first.querySelector('[data-below-required]')).toHaveTextContent('2/4');
    expect(first.querySelector('td').className).toContain('hsl(var(--warning))');

    // Received yesterday: relative time instead of a warning.
    expect(second.querySelector('[data-overdue]')).toBeNull();
    expect(within(second).getByText('ayer')).toBeInTheDocument();
    expect(second.querySelector('[data-below-required]')).toBeNull();
    expect(within(second).getByText('2 entradas nuevas')).toBeInTheDocument();

    // Waiting on the applicant's payment: old, but not flagged as Ventanilla's backlog.
    expect(third.querySelector('[data-overdue]')).toBeNull();
  });

  it('reflects the liquidation stage in the single status badge', () => {
    renderWithTooltips(<InboxTable items={ITEMS} now={NOW} onOpen={() => {}} label="Solicitudes" />);
    const [, first, second, third, fourth] = screen.getAllByRole('row');
    expect(within(first).getByText('Pendiente')).toBeInTheDocument();
    expect(within(second).getByText('Recibo en revisión')).toBeInTheDocument();
    expect(within(third).getByText('En espera de pago')).toBeInTheDocument();
    expect(within(fourth).getByText('Radicada')).toBeInTheDocument();
    expect(within(fourth).getByText('VR-2026-0042')).toBeInTheDocument();
    expect(within(fourth).getByRole('link', { name: /68001-1-26-0101/ })).toBeInTheDocument();
  });

  it('labels the row action by whether Ventanilla has to act', () => {
    renderWithTooltips(<InboxTable items={ITEMS} now={NOW} onOpen={() => {}} label="Solicitudes" />);
    expect(screen.getByRole('button', { name: 'Revisar solicitud RAD-2026-000101' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revisar solicitud RAD-2026-000102' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver solicitud RAD-2026-000103' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver solicitud RAD-2026-000104' })).toBeInTheDocument();
  });

  it('opens the detail by click, Enter or Space, and not from the copy button', () => {
    const onOpen = vi.fn();
    renderWithTooltips(<InboxTable items={ITEMS} now={NOW} onOpen={onOpen} label="Solicitudes" />);
    const [, first, second, third] = screen.getAllByRole('row');

    fireEvent.click(within(first).getByText('Ana Gómez'));
    expect(onOpen).toHaveBeenLastCalledWith(ITEMS[0]);
    fireEvent.keyDown(second, { key: 'Enter' });
    expect(onOpen).toHaveBeenLastCalledWith(ITEMS[1]);
    fireEvent.keyDown(third, { key: ' ' });
    expect(onOpen).toHaveBeenLastCalledWith(ITEMS[2]);
    expect(onOpen).toHaveBeenCalledTimes(3);

    fireEvent.click(within(first).getByRole('button', { name: 'Copiar código RAD-2026-000101' }));
    expect(onOpen).toHaveBeenCalledTimes(3);
  });

  it('moves the focus between rows with the arrow keys', () => {
    renderWithTooltips(<InboxTable items={ITEMS} now={NOW} onOpen={() => {}} label="Solicitudes" />);
    const rows = screen.getAllByRole('row').slice(1);
    rows[0].focus();
    fireEvent.keyDown(rows[0], { key: 'ArrowDown' });
    expect(rows[1]).toHaveFocus();
    fireEvent.keyDown(rows[1], { key: 'End' });
    expect(rows[3]).toHaveFocus();
    fireEvent.keyDown(rows[3], { key: 'Home' });
    expect(rows[0]).toHaveFocus();
  });

  it('marks the last opened request', () => {
    renderWithTooltips(<InboxTable items={ITEMS} now={NOW} onOpen={() => {}} label="Solicitudes" selectedId={2} />);
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows.filter((row) => row.hasAttribute('data-selected'))).toEqual([rows[1]]);
  });
});

describe('InboxCards', () => {
  it('stacks the same data and opens the detail from the card or its button', () => {
    const onOpen = vi.fn();
    renderWithTooltips(<InboxCards items={ITEMS} now={NOW} onOpen={onOpen} label="Solicitudes" />);
    const cards = within(screen.getByRole('list', { name: 'Solicitudes' })).getAllByRole('listitem');
    expect(cards).toHaveLength(4);
    expect(within(cards[1]).getByText('Recibo en revisión')).toBeInTheDocument();
    expect(within(cards[0]).getByText('2/4')).toBeInTheDocument();

    fireEvent.click(within(cards[0]).getByText('Ana Gómez'));
    expect(onOpen).toHaveBeenLastCalledWith(ITEMS[0]);
    fireEvent.click(within(cards[3]).getByRole('button', { name: 'Ver solicitud RAD-2026-000104' }));
    expect(onOpen).toHaveBeenLastCalledWith(ITEMS[3]);
    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});

describe('StatusBadge', () => {
  it('keeps the plain request status when no liquidation is given', () => {
    const { rerender } = render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    rerender(<StatusBadge status="rejected" size="md" />);
    expect(screen.getByText('Rechazada')).toBeInTheDocument();
    rerender(<StatusBadge status="pending" liquidation="receipt_rejected" />);
    expect(screen.getByText('Recibo rechazado')).toBeInTheDocument();
  });
});
