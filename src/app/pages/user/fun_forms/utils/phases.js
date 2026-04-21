export const PHASES = [
  { id: 'RAD', code: 'RAD', label: 'Radicación', group: 'inicio' },
  { id: 'REV', code: 'REV', label: 'Revisión', group: 'estudio' },
  { id: 'VIAB', code: 'VIAB', label: 'Viabilidad', group: 'estudio' },
  { id: 'EST', code: 'EST', label: 'Estudio', group: 'estudio' },
  { id: 'OBS', code: 'OBS', label: 'Observaciones', group: 'correcciones' },
  { id: 'NOT_OBS', code: 'NOT_OBS', label: 'Notif. Obs.', group: 'correcciones' },
  { id: 'CORR', code: 'CORR', label: 'Correcciones', group: 'correcciones' },
  { id: 'RES', code: 'RES', label: 'Resolución', group: 'expedicion' },
  { id: 'NOT_RES', code: 'NOT_RES', label: 'Notif. Resol.', group: 'expedicion' },
  { id: 'EJEC', code: 'EJEC', label: 'Ejecutoria', group: 'expedicion' },
  { id: 'ENT', code: 'ENT', label: 'Entrega', group: 'expedicion' },
];

export const PHASE_GROUPS = {
  inicio: { label: 'Inicio', color: 'blue' },
  estudio: { label: 'Estudio', color: 'indigo' },
  correcciones: { label: 'Correcciones', color: 'yellow' },
  expedicion: { label: 'Expedición', color: 'green' },
};

export function phaseLabel(code) {
  return PHASES.find((p) => p.code === code)?.label || code;
}

export function phaseGroup(code) {
  return PHASES.find((p) => p.code === code)?.group || null;
}
