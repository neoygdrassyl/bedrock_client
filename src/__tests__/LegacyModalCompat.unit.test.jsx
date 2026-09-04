import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LegacyModal } from '@/components/legacy-modal';

describe('LegacyModal compatibility', () => {
  it('preserves ReactModal class hooks expected by legacy pages and automation', () => {
    const onRequestClose = vi.fn();
    const { container } = render(
      <LegacyModal isOpen onRequestClose={onRequestClose} contentLabel="Demo modal">
        <input id="submit_1" />
      </LegacyModal>,
    );

    expect(container.querySelector('.ReactModal__Overlay')).toBeNull();
    expect(document.body.querySelector('.ReactModal__Overlay')).not.toBeNull();
    expect(document.body.querySelector('.ReactModal__Content')).not.toBeNull();
  });

  it('does not leak react-modal-only props like contentLabel to DOM attributes', () => {
    const onRequestClose = vi.fn();
    render(
      <LegacyModal isOpen onRequestClose={onRequestClose} contentLabel="Demo modal">
        <div>Modal body</div>
      </LegacyModal>,
    );

    const overlay = document.body.querySelector('.ReactModal__Overlay');
    expect(overlay).not.toBeNull();
    expect(overlay).not.toHaveAttribute('contentLabel');
  });

  it('applies overlayClassName to the overlay element for react-modal compatibility', () => {
    const onRequestClose = vi.fn();
    render(
      <LegacyModal
        isOpen
        onRequestClose={onRequestClose}
        contentLabel="Demo modal"
        overlayClassName="macro-modal-overlay"
      >
        <div>Modal body</div>
      </LegacyModal>,
    );

    const overlay = document.body.querySelector('.ReactModal__Overlay');
    expect(overlay).toHaveClass('macro-modal-overlay');
  });

  it('keeps overlay click working when overlayClassName is present', () => {
    const onRequestClose = vi.fn();
    render(
      <LegacyModal
        isOpen
        onRequestClose={onRequestClose}
        contentLabel="Demo modal"
        overlayClassName="macro-modal-overlay"
      >
        <div>Modal body</div>
      </LegacyModal>,
    );

    fireEvent.click(document.body.querySelector('.ReactModal__Overlay > div'));
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('uses horizontal insets instead of the default width when callers omit a width', () => {
    render(
      <LegacyModal
        isOpen
        onRequestClose={vi.fn()}
        contentLabel="Inset modal"
        style={{ content: { left: '25%', right: '25%' } }}
      >
        <div>Modal body</div>
      </LegacyModal>,
    );

    expect(document.body.querySelector('.ReactModal__Content')).toHaveStyle({
      left: '25%',
      right: '25%',
      width: 'auto',
    });
  });

  it('preserves an explicit caller width with horizontal insets', () => {
    render(
      <LegacyModal
        isOpen
        onRequestClose={vi.fn()}
        contentLabel="Sized modal"
        style={{ content: { left: '10%', right: '10%', width: '720px' } }}
      >
        <div>Modal body</div>
      </LegacyModal>,
    );

    expect(document.body.querySelector('.ReactModal__Content')).toHaveStyle({
      width: '720px',
    });
  });

  it('keeps a controlled input focused when its close callback changes on rerender', () => {
    function RerenderingModal() {
      const [value, setValue] = useState('');
      return (
        <LegacyModal isOpen onRequestClose={() => {}} contentLabel="Editable modal">
          <input aria-label="Valor" value={value} onChange={event => setValue(event.target.value)} />
        </LegacyModal>
      );
    }

    render(<RerenderingModal />);
    const input = screen.getByRole('textbox', { name: 'Valor' });

    input.focus();
    fireEvent.change(input, { target: { value: 'A' } });
    expect(document.activeElement).toBe(input);
    fireEvent.change(input, { target: { value: 'AB' } });
    expect(document.activeElement).toBe(input);
  });

  it('elevates modal stacking above the expediente workspace fullscreen shell', () => {
    const onRequestClose = vi.fn();
    document.body.classList.add('workspace-fullscreen-open');

    try {
      render(
        <LegacyModal isOpen onRequestClose={onRequestClose} contentLabel="Demo modal">
          <div>Modal body</div>
        </LegacyModal>,
      );

      const overlay = document.body.querySelector('.ReactModal__Overlay');
      const content = document.body.querySelector('.ReactModal__Content');

      expect(overlay).toHaveStyle({ zIndex: '10080' });
      expect(content).toHaveStyle({ zIndex: '10081' });
    } finally {
      document.body.classList.remove('workspace-fullscreen-open');
    }
  });
});
