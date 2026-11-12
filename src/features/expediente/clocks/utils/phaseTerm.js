import dayjs from 'dayjs';

/**
 * Pure helpers that read the phases computed by `useProcessPhases` (through
 * `useClocksManager`). They only describe a phase that was already computed: nothing here
 * changes how phases, day counts or limits are calculated.
 *
 * Moved out of `components/SidebarInfo.jsx` (which re-exports them) so that views outside
 * the Tiempos module (the workspace header, the dock) can use them without loading UI code.
 */

export const STATUS_MAP = {
  PENDIENTE: { text: 'Pendiente', color: 'secondary', icon: 'Hourglass' },
  ACTIVO: { text: 'En curso', color: 'primary', icon: 'PlayCircle' },
  PAUSADO: { text: 'Pausado', color: 'warning', icon: 'PauseCircle' },
  COMPLETADO: { text: 'Completado', color: 'success', icon: 'CheckCircle' },
  ESPERANDO_NOTIFICACION: { text: 'Esperando notif.', color: 'info', icon: 'Mail' },
  VENCIDO: { text: 'Vencido', color: 'danger', icon: 'AlertTriangle' },
  RETRASADO: { text: 'Retrasado', color: 'danger', icon: 'AlertCircle' }
};

/** Read-only dates of the module are shown as dd/mm/yyyy. */
export const formatPhaseDate = (d) => {
  if (!d) return '—';
  const parsed = dayjs(d);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '—';
};

/**
 * Phase the pager opens on: the active or paused one, else the first pending one, else
 * the last. Shared with the term strip so both always point at the same phase.
 */
export const getDefaultPhaseIndex = (processPhases) => {
  if (!processPhases || processPhases.length === 0) return -1;
  const activeIndex = processPhases.findIndex((p) => ['ACTIVO', 'PAUSADO'].includes(p.status));
  if (activeIndex !== -1) return activeIndex;
  const firstPendingIndex = processPhases.findIndex((p) => p.status === 'PENDIENTE');
  if (firstPendingIndex !== -1) return firstPendingIndex;
  return processPhases.length - 1;
};

export const getResolvedStatus = (status, remainingDays, endDate, limitDate) => {
  if (status === 'COMPLETADO' && limitDate && endDate && dayjs(endDate).isAfter(limitDate, 'day')) {
    return STATUS_MAP.VENCIDO;
  }
  if (status === 'ACTIVO' && remainingDays < 0) return STATUS_MAP.VENCIDO;
  return STATUS_MAP[status] || STATUS_MAP.PENDIENTE;
};

// Accent and case insensitive: the phases hook emits "Curaduría", older data "Curaduria".
const normalizeResponsible = (responsible) => String(responsible ?? '')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .trim()
  .toLowerCase();

export const getResponsibleCfg = (responsible) => {
  switch (normalizeResponsible(responsible)) {
    case 'curaduria':
      return { icon: 'Building', color: 'primary', text: 'Curaduría' };
    case 'solicitante':
      return { icon: 'User', color: 'info', text: 'Solicitante' };
    case 'mixto':
      return { icon: 'Users', color: 'purple', text: 'Mixto' };
    default:
      return { icon: 'UserCheck', color: 'secondary', text: responsible || 'Sin responsable' };
  }
};

/**
 * Figures of a phase (or of one of its actors) exactly as the phase card prints them:
 * total = plazo + días extra, remaining = total - used (negative when overdue).
 */
export const describePhaseTerm = (phase) => {
  const total = (Number(phase?.totalDays) || 0) + (Number(phase?.extraDays) || 0);
  const used = Number(phase?.usedDays) || 0;
  const remaining = total - used;
  const status = getResolvedStatus(phase?.status, remaining, phase?.endDate, phase?.limitDate);
  return { total, used, remaining, status };
};
