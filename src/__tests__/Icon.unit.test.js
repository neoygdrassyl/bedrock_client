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

  it('accepts legacy icon names without fa- prefix', () => {
    const { container } = render(<Icon name="file-alt" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-file-text');
  });

  it('accepts full FontAwesome class strings during migration', () => {
    const { container } = render(<Icon name="far fa-file-alt" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-file-text');
  });

  it('accepts legacy kebab-case names used by FUN workspace actions', () => {
    const { container } = render(<Icon name="project-diagram" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-network');
  });

  it('normalizes submit workflow location-search aliases', () => {
    const { container } = render(<Icon name="search-location" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-map-pin');
  });

  it('normalizes warning aliases still used in submit verification messages', () => {
    const { container } = render(<Icon name="exclamation" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-circle-alert');
  });

  it('normalizes fun dashboard chart aliases', () => {
    const { container } = render(<Icon name="circle-nodes" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-network');
  });

  it('keeps certification and document-signature aliases working', () => {
    const { container } = render(<Icon name="file-signature" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-pen-line');
  });

  it('keeps grid aliases used in preliminary tables working', () => {
    const { container } = render(<Icon name="th" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-layout-grid');
  });

  it('keeps review-assignment aliases used in radicar licencias working', () => {
    const { container } = render(<Icon name="user-clock" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-user-round-check');
  });
});
