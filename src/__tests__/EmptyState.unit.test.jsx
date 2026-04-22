import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('renders default message', () => {
    render(<EmptyState />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<EmptyState message="No hay licencias" />);
    expect(screen.getByText('No hay licencias')).toBeInTheDocument();
  });

  it('renders icon', () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState description="Intente con otros filtros" />);
    expect(screen.getByText('Intente con otros filtros')).toBeInTheDocument();
  });
});
