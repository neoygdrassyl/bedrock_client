import { useState } from 'react';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';
import { formatClockDate } from './ClockRow';

/**
 * Pending records of a finished process: the events without a registered date that keep
 * a phase open (see `workspace/expedientePendingStatus`). A to-do list, not an alarm: the
 * legal limit of each event stays as secondary information.
 *
 * `dense`: one line for the name and one for the meta, and an icon-only "Ir al evento"
 * (with its accessible name), for the narrow side panel.
 */
export function PendingList({ items, onGoToEvent, showPhase = true, className, dense = false }) {
  if (!items?.length) return null;
  return (
    <ul className={cn('tc-pending-list', dense && 'is-dense', className)}>
      {items.map((item) => (
        <li key={item.key} className="tc-pending-item">
          <Icon name="Circle" size={14} className="tc-pending-mark" aria-hidden="true" />
          <div className="tc-pending-body">
            <p className="tc-pending-name" title={item.name}>{item.name}</p>
            <p className="tc-pending-meta" title={dense && item.phaseTitle ? item.phaseTitle : undefined}>
              {dense ? (
                <>
                  {item.limitDate ? (
                    <span>Límite <span className="font-mono tabular-nums">{formatClockDate(item.limitDate)}</span></span>
                  ) : (
                    <span>Sin límite calculado</span>
                  )}
                  {showPhase && item.phaseTitle ? <span> · {item.phaseTitle}</span> : null}
                </>
              ) : (
                <>
                  {showPhase && item.phaseTitle ? <span>{item.phaseTitle} · </span> : null}
                  {item.limitDate ? (
                    <span>Límite legal <span className="font-mono tabular-nums">{formatClockDate(item.limitDate)}</span> · sin registro</span>
                  ) : (
                    <span>Sin límite calculado · sin registro</span>
                  )}
                </>
              )}
            </p>
          </div>
          {onGoToEvent ? (
            <button
              type="button"
              className={cn('tc-pending-go', dense && 'is-icon')}
              onClick={() => onGoToEvent(item)}
              aria-label={`Ir al evento ${item.name}`}
              title="Ir al evento"
            >
              {dense ? null : 'Ir al evento'}
              <Icon name="ArrowRight" size={dense ? 14 : 12} aria-hidden="true" />
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * `visibleCount`: items listed before "Ver todos (M)", set by the module from the height
 * the side panel has, so the panel never pushes its cards below the screen.
 */
export function PendingChecklist({ pending, onGoToEvent, visibleCount = 2 }) {
  const [expanded, setExpanded] = useState(false);
  if (!pending?.pending) return null;
  const count = pending.items.length;
  // Never hide a single item behind "Ver todos (n+1)".
  const shown = count - visibleCount === 1 ? count : visibleCount;
  const hidden = Math.max(0, count - shown);
  const items = expanded ? pending.items : pending.items.slice(0, shown);
  return (
    <section className={cn('tc-card tc-pending', expanded && 'is-expanded')} aria-labelledby="tc-pending-title">
      <div className="tc-card-header">
        <h3 id="tc-pending-title" className="tc-card-title">Pendientes</h3>
        <span className="tc-pending-count" aria-label={`${count} por registrar`}>{count}</span>
      </div>
      {count > 0 ? (
        <>
          <PendingList items={items} onGoToEvent={onGoToEvent} className="tc-pending-scroll" dense />
          {hidden > 0 ? (
            <button
              type="button"
              className="tc-pending-more"
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? 'Ver menos' : `Ver todos (${count})`}
              <Icon name="ChevronDown" size={14} className={cn('tc-chevron', expanded && 'is-open')} aria-hidden="true" />
            </button>
          ) : null}
        </>
      ) : (
        <p className="tc-empty">
          Hay fases sin cerrar, pero ningún evento visible sin fecha las explica. Revisa las fases marcadas como pendientes.
        </p>
      )}
    </section>
  );
}

export default PendingChecklist;
