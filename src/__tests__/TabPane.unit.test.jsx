import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TabPane } from '@/components/ui/tab-pane';

describe('TabPane', () => {
  it('renders children when show is true', () => {
    render(<TabPane show={true}>Content</TabPane>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('keeps children mounted by default when hidden to preserve MDBTabsPane compatibility', () => {
    render(<TabPane show={false}>Hidden</TabPane>);
    const el = screen.getByRole('tabpanel', { hidden: true });
    expect(el).toHaveClass('hidden');
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  it('can opt out of mounting hidden content when keepMounted is false', () => {
    render(<TabPane show={false} keepMounted={false}>Unmounted</TabPane>);
    expect(screen.queryByText('Unmounted')).not.toBeInTheDocument();
  });

  it('renders as tabpanel role', () => {
    render(<TabPane show={true}>Content</TabPane>);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });
});
