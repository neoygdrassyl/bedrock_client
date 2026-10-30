import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ILLUSTRATED_STATE_VARIANTS, IllustratedState } from './IllustratedState';

describe('IllustratedState', () => {
  it.each(Object.entries(ILLUSTRATED_STATE_VARIANTS))('renders the %s variant with its default copy', (variant, config) => {
    const { container } = render(<IllustratedState variant={variant} />);

    const state = screen.getByRole('status', { name: config.title });
    expect(state).toHaveAttribute('data-illustrated-state', variant);
    expect(state).toHaveTextContent(config.description);
    expect(screen.getByRole('heading', { level: 2, name: config.title })).toBeInTheDocument();
    // The illustration is decorative.
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('falls back to load-error for an unknown variant', () => {
    render(<IllustratedState variant="nope" />);
    expect(screen.getByRole('status', { name: ILLUSTRATED_STATE_VARIANTS['load-error'].title })).toBeInTheDocument();
  });

  it('overrides title and description, and hides the description with null', () => {
    const { rerender } = render(<IllustratedState title="Sin documentos" description="Agregue uno." />);
    expect(screen.getByRole('status', { name: 'Sin documentos' })).toHaveTextContent('Agregue uno.');

    rerender(<IllustratedState title="Sin documentos" description={null} />);
    expect(screen.getByRole('status')).toHaveTextContent(/^Sin documentos$/);
  });

  it('shows a retry button with a custom label plus extra actions and detail', async () => {
    const onRetry = vi.fn();
    render(
      <IllustratedState
        onRetry={onRetry}
        retryLabel="Recargar"
        actions={<button type="button">Ir al panel</button>}
        detail={<span>Referencia: abc</span>}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Recargar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Ir al panel' })).toBeInTheDocument();
    expect(screen.getByText('Referencia: abc')).toBeInTheDocument();
  });

  it('uses an h1 inside a full-page main region', () => {
    render(<IllustratedState fullPage variant="not-found" className="custom" />);

    expect(screen.getByRole('main')).toHaveClass('custom');
    expect(screen.getByRole('heading', { level: 1, name: ILLUSTRATED_STATE_VARIANTS['not-found'].title })).toBeInTheDocument();
  });

  it('renders a compact size', () => {
    render(<IllustratedState size="compact" variant="image" />);
    expect(screen.getByRole('status')).toHaveClass('max-w-[320px]');
  });
});
