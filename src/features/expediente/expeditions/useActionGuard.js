import { useId, useMemo } from 'react';
import { guardSubmit, holdSubmit } from '@/shared/utils/submitGuard';

/**
 * Wraps a handler with the shared double-submit guard (`shared/utils/submitGuard`):
 * `onSubmit={guard(save, 'save')}` / `onClick={guard(() => generate(), 'generate')}`.
 *
 * - A handler that RETURNS its promise is guarded in flight: the action stays taken until
 *   that promise settles (released at once on a rejection, after a short debounce on
 *   success, and after 30 s if it never settles). One click consumes one consecutive however
 *   slow the request is.
 * - A handler that returns nothing stays on the time window: a second run within `windowMs`
 *   is dropped.
 * - A handler whose request only starts after a confirm dialog returns nothing (the dialog
 *   may stay open for any time) and hands the request over once it starts:
 *   `guard.hold('review', save_review())`. From then on the action is guarded in flight.
 *
 * A dropped form submit is still cancelled, so the page never reloads. Keys are scoped to the
 * component instance.
 */
export function useActionGuard(windowMs = 1500) {
    const scope = useId();

    return useMemo(() => {
        const guard = (handler, key = handler?.name || 'action') => (...args) => {
            let ran = false;
            // `guardSubmit` frees the key when the handler throws synchronously (e.g. a
            // validation error), so the next click is not dropped.
            const result = guardSubmit(`${scope}:${key}`, () => {
                ran = true;
                return handler(...args);
            }, { windowMs });
            if (!ran) args[0]?.preventDefault?.();
            return result;
        };
        /** Keeps `key` taken until `pending` settles; returns a promise that settles like it. */
        guard.hold = (key, pending) => holdSubmit(`${scope}:${key}`, pending);
        return guard;
    }, [scope, windowMs]);
}

export default useActionGuard;
