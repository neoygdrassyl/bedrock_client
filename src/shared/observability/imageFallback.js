import { logEvent } from '@/shared/observability/logger';

/**
 * Global fallback for broken `<img>` elements.
 *
 * A capture-phase `error` listener on `document` sees every failed image (the
 * event does not bubble). After the component's own `onError` had a chance to
 * react (deferred one task), an image whose `src` is unchanged and still in the
 * page is swapped once for a neutral inline SVG placeholder and a `resource`
 * entry is logged. Images marked `data-no-fallback` are left alone.
 */

const FALLBACK_ATTR = 'data-dovela-fallback';

// Neutral grey that reads on light and dark backgrounds (an <img> cannot inherit
// CSS variables or currentColor).
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
<rect width="64" height="48" rx="4" fill="#94a3b8" fill-opacity="0.16"/>
<rect x="18" y="12" width="28" height="22" rx="3" fill="none" stroke="#94a3b8" stroke-width="2"/>
<path d="M20 31l7-7 5 5 4-4 8 8" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linejoin="round"/>
<circle cx="39" cy="18" r="2.5" fill="#94a3b8"/>
</svg>`;

export const BROKEN_IMAGE_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PLACEHOLDER_SVG)}`;

// Logged URL: path only for http(s); scheme only for data/blob (no payload, no
// query string, which may carry signed tokens).
function describeSource(src) {
  const raw = String(src || '');
  if (!raw) return '(empty)';
  if (/^(data|blob):/i.test(raw)) return `${raw.split(':')[0]}:`;
  try {
    const url = new URL(raw, globalThis.location?.href);
    return `${url.origin === globalThis.location?.origin ? '' : url.origin}${url.pathname}`;
  } catch {
    return raw.split(/[?#]/)[0].slice(0, 300);
  }
}

function swapToPlaceholder(img, failedSrc) {
  try {
    if (!img.isConnected) return;
    if (img.getAttribute('src') !== failedSrc) return; // the component handled it
    img.setAttribute(FALLBACK_ATTR, 'true');
    img.removeAttribute('srcset');
    img.src = BROKEN_IMAGE_PLACEHOLDER;
    if (!img.getAttribute('alt')) img.setAttribute('alt', 'Imagen no disponible');
    logEvent('warn', 'resource_load_failed', {
      kind: 'resource',
      message: `img ${describeSource(failedSrc)}`,
      data: { url: describeSource(failedSrc), tag: 'img' },
    });
  } catch {}
}

export function installBrokenImageFallback(doc = globalThis.document) {
  try {
    if (!doc?.addEventListener || doc.__dovelaImageFallback) return;
    doc.__dovelaImageFallback = true;
    doc.addEventListener(
      'error',
      (event) => {
        const img = event?.target;
        if (!img || img.tagName !== 'IMG') return;
        if (img.hasAttribute('data-no-fallback') || img.hasAttribute(FALLBACK_ATTR)) return;
        const failedSrc = img.getAttribute('src');
        // An <img> without src (or about:blank) is a placeholder, not a failure.
        if (!failedSrc || failedSrc === 'about:blank') return;
        setTimeout(() => swapToPlaceholder(img, failedSrc), 0);
      },
      true,
    );
  } catch {}
}
