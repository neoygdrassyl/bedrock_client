import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TabPane } from '@/components/ui/tab-pane';

describe('TabPane', () => {
  it('renders children when show is true', () => {
    render(<TabPane show={true}>Content</TabPane>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('does not render children when show is false', () => {
    render(<TabPane show={false}>Hidden</TabPane>);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('renders as tabpanel role', () => {
    render(<TabPane show={true}>Content</TabPane>);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('keeps mounted when keepMounted is true but hides', () => {
    render(<TabPane show={false} keepMounted>Kept</TabPane>);
    const el = screen.getByRole('tabpanel', { hidden: true });
    expect(el).toHaveClass('hidden');
  });
});
