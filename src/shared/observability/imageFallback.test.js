import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { logEventMock } = vi.hoisted(() => ({ logEventMock: vi.fn() }));
vi.mock('@/shared/observability/logger', () => ({ logEvent: logEventMock }));

import { BROKEN_IMAGE_PLACEHOLDER, installBrokenImageFallback } from './imageFallback';

function addImage(attrs = {}) {
  const img = document.createElement('img');
  Object.entries(attrs).forEach(([name, value]) => img.setAttribute(name, value));
  document.body.appendChild(img);
  return img;
}

function fail(img) {
  img.dispatchEvent(new Event('error'));
  vi.runAllTimers();
}

describe('installBrokenImageFallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    logEventMock.mockReset();
    installBrokenImageFallback(document);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('swaps a broken image for the placeholder once and logs a resource entry without the query string', () => {
    const img = addImage({ src: '/api/files/photo.png?token=secret', srcset: '/a.png 2x' });

    fail(img);

    expect(img.getAttribute('src')).toBe(BROKEN_IMAGE_PLACEHOLDER);
    expect(img.hasAttribute('srcset')).toBe(false);
    expect(img.getAttribute('alt')).toBe('Imagen no disponible');
    expect(img.getAttribute('data-dovela-fallback')).toBe('true');
    expect(logEventMock).toHaveBeenCalledTimes(1);
    expect(logEventMock).toHaveBeenCalledWith('warn', 'resource_load_failed', {
      kind: 'resource',
      message: 'img /api/files/photo.png',
      data: { url: '/api/files/photo.png', tag: 'img' },
    });

    // A failing placeholder never loops.
    fail(img);
    expect(logEventMock).toHaveBeenCalledTimes(1);
  });

  it('keeps an existing alt text and logs data URLs by scheme only', () => {
    const img = addImage({ src: 'data:image/png;base64,AAAA', alt: 'Logo' });

    fail(img);

    expect(img.getAttribute('alt')).toBe('Logo');
    expect(logEventMock.mock.calls[0][2].data.url).toBe('data:');
  });

  it('skips images marked data-no-fallback', () => {
    const img = addImage({ src: '/logo.png', 'data-no-fallback': '' });

    fail(img);

    expect(img.getAttribute('src')).toBe('/logo.png');
    expect(logEventMock).not.toHaveBeenCalled();
  });

  it('leaves images whose component already changed the src in onError', () => {
    const img = addImage({ src: '/broken.png' });

    img.dispatchEvent(new Event('error'));
    img.setAttribute('src', '/component-fallback.png');
    vi.runAllTimers();

    expect(img.getAttribute('src')).toBe('/component-fallback.png');
    expect(logEventMock).not.toHaveBeenCalled();
  });

  it('ignores images without src, about:blank, detached images and non-image errors', () => {
    const empty = addImage();
    const blank = addImage({ src: 'about:blank' });
    const detached = addImage({ src: '/gone.png' });
    const script = document.createElement('script');
    document.body.appendChild(script);

    fail(empty);
    fail(blank);
    detached.dispatchEvent(new Event('error'));
    detached.remove();
    vi.runAllTimers();
    fail(script);

    expect(detached.getAttribute('src')).toBe('/gone.png');
    expect(logEventMock).not.toHaveBeenCalled();
  });

  it('installs the listener only once per document', () => {
    installBrokenImageFallback(document);
    const img = addImage({ src: '/x.png' });

    fail(img);

    expect(logEventMock).toHaveBeenCalledTimes(1);
  });
});
