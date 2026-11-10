// Focus of a FUN form section (5.1 / 5.2 / 5.3) after navigating to "Actualizar" (FUNN renders the forms once the
// expediente is loaded, so the anchor is polled for a while).
const POLL_MS = 150;
const MAX_WAIT_MS = 10000;

/**
 * Scrolls to the element with id `anchor` and focuses it as soon as it exists (up to 10 s). Returns a cancel function.
 * `doc` and `schedule` are injectable for tests.
 */
export function focusFunAnchor(anchor, { doc = typeof document === 'undefined' ? null : document, schedule = setTimeout, cancel = clearTimeout } = {}) {
  if (!anchor || !doc) return () => {};
  let waited = 0;
  let timer = null;
  const attempt = () => {
    const element = doc.getElementById(anchor);
    if (element) {
      element.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      element.focus?.({ preventScroll: true });
      timer = null;
      return;
    }
    waited += POLL_MS;
    timer = waited <= MAX_WAIT_MS ? schedule(attempt, POLL_MS) : null;
  };
  timer = schedule(attempt, 0);
  return () => { if (timer != null) cancel(timer); timer = null; };
}

export default focusFunAnchor;
