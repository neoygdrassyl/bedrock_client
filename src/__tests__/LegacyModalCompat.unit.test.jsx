import { fireEvent, render } from '@testing-library/react';
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
});
