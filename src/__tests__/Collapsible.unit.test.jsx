import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

describe('Collapsible', () => {
  test('hides content when closed', () => {
    render(
      <Collapsible open={false}>
        <CollapsibleContent>Hidden stuff</CollapsibleContent>
      </Collapsible>
    );
    const content = screen.getByText('Hidden stuff');
    expect(content.closest('[data-state]')).toHaveAttribute('data-state', 'closed');
  });

  test('shows content when open', () => {
    render(
      <Collapsible open={true}>
        <CollapsibleContent>Visible stuff</CollapsibleContent>
      </Collapsible>
    );
    const content = screen.getByText('Visible stuff');
    expect(content.closest('[data-state]')).toHaveAttribute('data-state', 'open');
  });

  test('toggles via trigger', async () => {
    function Wrapper() {
      const [open, setOpen] = React.useState(false);
      return (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Body</CollapsibleContent>
        </Collapsible>
      );
    }
    render(<Wrapper />);
    expect(screen.getByText('Body').closest('[data-state]')).toHaveAttribute('data-state', 'closed');
    await userEvent.click(screen.getByText('Toggle'));
    expect(screen.getByText('Body').closest('[data-state]')).toHaveAttribute('data-state', 'open');
  });

  test('supports className on content', () => {
    render(
      <Collapsible open={true}>
        <CollapsibleContent className="my-custom">Hello</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Hello').closest('[data-state]')).toHaveClass('my-custom');
  });
});
