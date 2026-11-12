import { describe, expect, it, vi } from 'vitest';
import { focusFunAnchor } from './funFormAnchor';

describe('focusFunAnchor', () => {
  it('waits for the FUN form to render, then scrolls to it and focuses it', () => {
    vi.useFakeTimers();
    try {
      focusFunAnchor('fun_n_52');
      vi.advanceTimersByTime(300);
      const element = document.createElement('div');
      element.id = 'fun_n_52';
      element.tabIndex = -1;
      element.scrollIntoView = vi.fn();
      document.body.appendChild(element);
      vi.advanceTimersByTime(200);
      expect(element.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      expect(document.activeElement).toBe(element);
      element.remove();
    } finally { vi.useRealTimers(); }
  });

  it('can be cancelled and ignores an empty anchor', () => {
    const schedule = vi.fn(() => 1);
    const cancel = vi.fn();
    focusFunAnchor('fun_n_51', { doc: document, schedule, cancel })();
    expect(cancel).toHaveBeenCalledWith(1);
    expect(() => focusFunAnchor(null)()).not.toThrow();
  });
});
