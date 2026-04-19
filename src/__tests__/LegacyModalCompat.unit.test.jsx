import { render } from '@testing-library/react';
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

    expect(container.querySelector('.ReactModal__Overlay')).not.toBeNull();
    expect(container.querySelector('.ReactModal__Content')).not.toBeNull();
  });
});
