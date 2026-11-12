import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DovelaBreadcrumb } from './dovela-breadcrumb';

describe('DovelaBreadcrumb', () => {
  it('renders the trail in order with the last item as the current, non-interactive page', async () => {
    const user = userEvent.setup();
    const goToList = vi.fn();
    render(
      <DovelaBreadcrumb
        items={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Gestión', onClick: goToList },
          { label: 'Sin enlace' },
          { label: '68001-1-26-0231', onClick: vi.fn(), href: '/x', mono: true },
        ]}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Inicio', 'Gestión', 'Sin enlace', '68001-1-26-0231']);

    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/dashboard');
    await user.click(within(nav).getByRole('button', { name: 'Gestión' }));
    expect(goToList).toHaveBeenCalledTimes(1);

    // The current page is marked and is neither a link nor a button, even if it was given handlers.
    const current = within(nav).getByText('68001-1-26-0231').closest('[aria-current]');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    expect(within(nav).getAllByRole('button')).toHaveLength(1);
  });

  it('drops empty items and uses the given label', () => {
    render(<DovelaBreadcrumb label="Ubicación" items={[null, { label: '' }, { label: 'Licencias', href: '/licencias' }, undefined, { label: 'Detalle' }]} />);

    const nav = screen.getByRole('navigation', { name: 'Ubicación' });
    expect(within(nav).getAllByRole('listitem')).toHaveLength(2);
    expect(within(nav).getByText('Detalle').closest('[aria-current]')).not.toBeNull();
  });

  it('renders nothing without items', () => {
    const { container } = render(<DovelaBreadcrumb items={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(render(<DovelaBreadcrumb />).container).toBeEmptyDOMElement();
  });
});
