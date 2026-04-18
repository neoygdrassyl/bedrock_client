import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon } from '@/components/icon';

describe('Icon bridge component', () => {
  it('renders a lucide icon for a known FA name', () => {
    const { container } = render(<Icon name="fa-file-alt" />);
    // Lucide renders an <svg> element
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders fallback CircleAlert for an unknown FA name', () => {
    const { container } = render(<Icon name="fa-nonexistent-icon-xyz" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('passes className to the svg', () => {
    const { container } = render(<Icon name="fa-file-alt" className="text-red-500" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-red-500');
  });

  it('passes size prop to the icon', () => {
    const { container } = render(<Icon name="fa-file-alt" size={32} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
  });

  it('accepts a Lucide component name directly', () => {
    const { container } = render(<Icon name="FileText" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
