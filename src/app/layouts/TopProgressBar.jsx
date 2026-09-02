import { useNavigationPending } from './navigation-pending-context';

/**
 * Slim indeterminate bar shown while a sidebar navigation is pending.
 * Self-contained keyframes (no tailwind.config.js edit) — kept local
 * per AGENTS.md's preference for reversible, feature-scoped changes.
 */
export function TopProgressBar() {
  const { pendingRoute } = useNavigationPending();

  if (!pendingRoute) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-transparent"
      role="progressbar"
      aria-label="Cargando módulo"
    >
      <style>{`
        @keyframes dovela-route-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(60%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
      <div
        className="h-full w-1/3 bg-primary"
        style={{ animation: 'dovela-route-progress 1.1s ease-in-out infinite' }}
      />
    </div>
  );
}
