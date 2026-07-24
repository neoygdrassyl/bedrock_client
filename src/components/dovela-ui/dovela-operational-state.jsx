import React from 'react';

import { cn } from '@/lib/utils';
import { getOperationalStateMeta } from './dovela-operational';

export function DovelaOperationalState({
  state,
  dueDate,
  responsible,
  nextAction,
  className,
}) {
  const meta = getOperationalStateMeta(state);

  return (
    <section
      className={cn('dovela-operational-state space-y-2 p-3 text-sm', className)}
      data-dovela-ui="operational-state"
      data-state={meta.id}
      data-tone={meta.tone}
      aria-label={`Estado operacional: ${meta.label}`}
    >
      <div className="font-medium">{meta.label}</div>
      <p className="m-0 text-xs opacity-85">{meta.description}</p>
      <dl className="m-0 grid gap-1 text-xs">
        {dueDate ? <div>Vence: {dueDate}</div> : null}
        {responsible ? <div>Responsable: {responsible}</div> : null}
        {nextAction ? <div>Siguiente acción: {nextAction}</div> : null}
      </dl>
    </section>
  );
}
