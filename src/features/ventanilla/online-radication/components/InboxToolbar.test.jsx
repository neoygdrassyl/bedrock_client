import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { InboxPagination } from './InboxPagination';
import { InboxToolbar } from './InboxToolbar';

const COUNTS = { pending: 3, pendingEntries: 1, radicated: 12, rejected: 2, all: 17 };

function renderToolbar(props = {}) {
  const handlers = { onStatusChange: vi.fn(), onSearchChange: vi.fn(), onRefresh: vi.fn() };
  render(<InboxToolbar status="pending" counts={COUNTS} search="" {...handlers} {...props} />);
  return handlers;
}

describe('InboxToolbar', () => {
  it('shows the status filter with counts, the search and the refresh button', () => {
    const handlers = renderToolbar();
    const pending = screen.getByRole('radio', { name: /Pendientes/ });
    expect(pending).toHaveAttribute('aria-checked', 'true');
    expect(pending).toHaveTextContent('3');

    fireEvent.click(screen.getByRole('radio', { name: /Radicadas/ }));
    expect(handlers.onStatusChange).toHaveBeenCalledWith('radicated');

    fireEvent.change(screen.getByLabelText('Buscar solicitudes'), { target: { value: 'RAD-2026' } });
    expect(handlers.onSearchChange).toHaveBeenCalledWith('RAD-2026');

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar la lista' }));
    expect(handlers.onRefresh).toHaveBeenCalledTimes(1);
  });

  it('clears the search with its button or Escape', () => {
    const handlers = renderToolbar({ search: 'Ana' });
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
    expect(handlers.onSearchChange).toHaveBeenLastCalledWith('');
    fireEvent.keyDown(screen.getByLabelText('Buscar solicitudes'), { key: 'Escape' });
    expect(handlers.onSearchChange).toHaveBeenCalledTimes(2);
  });

  it('disables the refresh button while refreshing', () => {
    renderToolbar({ refreshing: true });
    expect(screen.getByRole('button', { name: 'Actualizando la lista' })).toBeDisabled();
  });
});

describe('InboxPagination', () => {
  it('summarises the range, the overdue rows and pages with previous/next', () => {
    const onPageChange = vi.fn();
    render(
      <InboxPagination page={2} pageSize={20} total={45} hint="Orden de llegada." overdueCount={2} overdueThreshold={3} onPageChange={onPageChange} />,
    );
    const nav = screen.getByRole('navigation', { name: 'Paginación de solicitudes' });
    expect(nav).toHaveTextContent('21–40 de 45');
    expect(nav).toHaveTextContent('2 solicitudes con más de 3 días hábiles en espera');
    expect(nav).toHaveTextContent('Página 2 de 3');

    fireEvent.click(screen.getByRole('button', { name: /Anterior/ }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it('hides the page controls and the overdue note when they do not apply', () => {
    render(<InboxPagination page={1} pageSize={20} total={5} onPageChange={() => {}} />);
    expect(screen.getByRole('navigation')).toHaveTextContent('1–5 de 5');
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText(/en espera/)).toBeNull();
  });
});
