const COMPLETION_CLOCKS = [
  { state: 99, label: 'Ejecutoria - Licencia' },
  { state: 98, label: 'Entrega de Licencia' },
];

export function getLicenseCompletionClock(item) {
  const clocks = item?.fun_clocks || [];
  const match = COMPLETION_CLOCKS
    .map(definition => ({ ...definition, clock: clocks.find(clock => Number(clock?.state) === definition.state) }))
    .find(definition => definition.clock?.date_start);

  return {
    state: match?.state ?? null,
    dateStart: match?.clock?.date_start ?? null,
    label: match?.label ?? null,
    clock: match?.clock ?? null,
  };
}
