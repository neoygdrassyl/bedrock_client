/**
 * "A clock of an expediente was written": published by `fun.service` after every
 * successful `create_clock` / `update_clock` / `delete_clock`, whatever module made it.
 *
 * Many legacy modules that write clocks (Chequeo LyDF, the reviews of every discipline,
 * the Tiempos table embedded in Jurídico, ...) only reload their own copy of the
 * expediente. The workspace listens to this signal to reload its copy, so the legal term
 * in the header follows every clock change without wiring each module.
 *
 * `fun0Id` is the expediente of the clock when the request carried it (`null` otherwise,
 * e.g. a delete by clock id).
 */
const listeners = new Set();

export function onClockWritten(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readFun0Id(data) {
  if (!data) return null;
  const value = typeof data.get === 'function' ? data.get('fun0Id') : data.fun0Id;
  return value === undefined || value === null || value === '' ? null : value;
}

export function notifyClockWritten(data) {
  const detail = { fun0Id: readFun0Id(data) };
  listeners.forEach((listener) => {
    try {
      listener(detail);
    } catch {
      // A listener failing must never fail the write that already succeeded.
    }
  });
}

/** Resolves with the response of `request` and publishes the write once it succeeded. */
export function afterClockWrite(request, data) {
  return Promise.resolve(request).then((response) => {
    notifyClockWritten(data);
    return response;
  });
}
