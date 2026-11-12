import { lazy, Suspense } from 'react';
import { useExpedienteDock } from './expedienteDockStore';

const ExpedienteDock = lazy(() => import('./ExpedienteDock'));

/**
 * Tiny always-mounted gate: the dock UI chunk is only requested once the dock
 * has items or the user asks to open an expediente in a window.
 */
export function ExpedienteDockMount() {
  const { items, searchOpen } = useExpedienteDock();
  if (!items.length && !searchOpen) return null;

  return (
    <Suspense fallback={null}>
      <ExpedienteDock />
    </Suspense>
  );
}

export default ExpedienteDockMount;
