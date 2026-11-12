import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExpedienteSideNav, NAV_WIDTH_COLLAPSED, NAV_WIDTH_EXPANDED } from './ExpedienteSideNav';
import { getExpedienteNavGroups } from './expedienteNavConfig';
import { NAV_COLLAPSED_STORAGE_KEY, useExpedienteNavCollapsed } from './useExpedienteNavLayout';

const groups = getExpedienteNavGroups({ canEdit: true, canShowPublicidad: true });
const identity = {
  radicado: '68001-1-26-0231',
  version: 2,
  typeLabel: 'Categoría III',
  statusLabel: 'En término',
  statusClass: 'text-accent',
  barClass: 'bg-accent',
  remainingDays: 12,
  progressPercent: 40,
};

function Harness({ onSelect = vi.fn(), initialSection = 'detalles' }) {
  const [active, setActive] = useState(initialSection);
  const { collapsed, toggleCollapsed } = useExpedienteNavCollapsed();
  return (
    <ExpedienteSideNav
      groups={groups}
      activeSection={active}
      onSelect={(id) => { setActive(id); onSelect(id); }}
      identity={identity}
      collapsed={collapsed}
      onToggleCollapsed={toggleCollapsed}
    />
  );
}

afterEach(() => window.localStorage.clear());

describe('ExpedienteSideNav', () => {
  it('renders the identity block and marks only the active item', () => {
    render(<Harness initialSection="tiempos" />);

    const identityBlock = screen.getByTestId('expediente-nav-identity');
    expect(within(identityBlock).getByText('68001-1-26-0231')).toBeInTheDocument();
    expect(within(identityBlock).getByText('v2')).toBeInTheDocument();
    expect(within(identityBlock).getByText('En término')).toBeInTheDocument();
    expect(within(identityBlock).getByText('12 días hábiles restantes')).toBeInTheDocument();
    expect(within(identityBlock).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');

    const nav = screen.getByRole('navigation', { name: /módulos del expediente/i });
    const current = within(nav).getAllByRole('button').filter((button) => button.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('Tiempos');
  });

  it('labels groups and moves the active item on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);

    // One labelled group per block of modules.
    ['Consulta', 'Documentos', 'Evaluación', 'Expedición'].forEach((name) => {
      expect(screen.getByRole('group', { name })).toBeInTheDocument();
    });
    expect(screen.getAllByRole('group')).toHaveLength(4);
    expect(within(screen.getByRole('group', { name: 'Evaluación' })).getByRole('button', { name: 'Informe estructural' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Informe estructural' }));

    expect(onSelect).toHaveBeenCalledWith('estructural');
    expect(screen.getByRole('button', { name: 'Informe estructural' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Detalles' })).not.toHaveAttribute('aria-current');
  });

  it('collapses to an icon rail and persists the choice', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);
    const rail = screen.getByTestId('expediente-side-nav-rail');
    expect(rail).toHaveStyle({ width: `${NAV_WIDTH_EXPANDED}px` });

    await user.click(screen.getByRole('button', { name: 'Contraer menú del expediente' }));

    expect(rail).toHaveAttribute('data-collapsed', 'true');
    expect(rail).toHaveStyle({ width: `${NAV_WIDTH_COLLAPSED}px` });
    expect(screen.queryByTestId('expediente-nav-identity')).not.toBeInTheDocument();
    // Items keep their accessible names in the rail.
    expect(screen.getByRole('button', { name: 'Detalles' })).toHaveAttribute('aria-current', 'page');
    expect(window.localStorage.getItem(NAV_COLLAPSED_STORAGE_KEY)).toBe('true');

    unmount();
    render(<Harness />);
    expect(screen.getByTestId('expediente-side-nav-rail')).toHaveAttribute('data-collapsed', 'true');
    expect(screen.getByRole('button', { name: 'Expandir menú del expediente' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('falls back to expanded when storage is unreadable', () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error('blocked'); };
    try {
      render(<Harness />);
      expect(screen.getByTestId('expediente-side-nav-rail')).toHaveAttribute('data-collapsed', 'false');
    } finally {
      Storage.prototype.getItem = original;
    }
  });

  it('renders the sheet variant without the collapse control', () => {
    render(<ExpedienteSideNav variant="sheet" groups={groups} activeSection="acta" onSelect={vi.fn()} identity={identity} />);
    expect(screen.getByTestId('expediente-side-nav-sheet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /contraer menú/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acta' })).toHaveAttribute('aria-current', 'page');
  });
});
