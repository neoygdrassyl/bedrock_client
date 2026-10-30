import { useEffect, useState } from 'react';
import { m } from 'motion/react';
import { useNavigationPending } from './navigation-pending-context';

const LOADING = {
  scaleX: [0, 0.35, 0.65, 0.85],
  opacity: 1,
  transition: { duration: 6, times: [0, 0.08, 0.35, 1], ease: 'easeOut' },
};
const DONE = {
  scaleX: 1,
  opacity: [1, 1, 0],
  transition: { duration: 0.4, times: [0, 0.55, 1], ease: 'easeOut' },
};

/**
 * Route progress bar: trickles towards 85% while a navigation is pending, then
 * completes and fades. Animates only transform/opacity (compositor-friendly).
 */
export function TopProgressBar() {
  const { pendingRoute } = useNavigationPending();
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    if (pendingRoute) setPhase('loading');
    else setPhase((current) => (current === 'loading' ? 'done' : current));
  }, [pendingRoute]);

  if (phase === 'idle') return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]"
      role="progressbar"
      aria-label="Cargando módulo"
      aria-busy={phase === 'loading'}
    >
      <m.div
        className="h-full origin-left bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.65)]"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={phase === 'loading' ? LOADING : DONE}
        onAnimationComplete={() => { if (phase === 'done') setPhase('idle'); }}
      />
    </div>
  );
}
