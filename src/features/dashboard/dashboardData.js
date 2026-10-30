// Pure helpers for the dashboard data layer (no React, no HTTP).

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export function getFormattedDate() {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

export function getUserDisplayName() {
  const user = window.user || {};
  return [user.name, user.name_2].filter(Boolean).join(' ').trim() || user.name_full || 'usuario';
}

export function normalizeList(payload) {
  return Array.isArray(payload) ? payload : payload?.data ?? [];
}

function getFirstFun1(expediente) {
  return expediente?.fun_1s?.[0] || expediente?.fun_1 || null;
}

function getExpedienteStateLabel(state) {
  const value = Number(state);
  if (!Number.isFinite(value)) return 'Sin estado';
  if (value < 0) return 'Incompleta';
  if (value === 0) return 'Borrador';
  if (value < 100) return 'Activa';
  return 'Cerrada';
}

function formatShortDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function buildTrackedExpedientes(bookmarks) {
  const seen = new Set();
  return (bookmarks || [])
    .map((bookmark) => {
      const fun0Id = bookmark.fun0Id ?? bookmark.fun_0_id ?? bookmark.fun_0?.id ?? bookmark.id;
      const expediente = bookmark.fun_0 || null;
      if (!fun0Id && !expediente) return null;
      const fun1 = getFirstFun1(expediente);
      const radicado = expediente?.id_public || bookmark.radicado || (fun0Id ? `#${fun0Id}` : 'Sin radicado');
      const idPublic = expediente?.id_public || null;
      return {
        key: `${bookmark.scope || 'scope'}-${fun0Id || radicado}`,
        fun0Id,
        radicado,
        title: fun1?.tramite || fun1?.tipo || expediente?.type || 'Licencia urbanística',
        description: fun1?.description || expediente?.model || 'Sin descripción registrada',
        stateLabel: getExpedienteStateLabel(expediente?.state),
        dateLabel: formatShortDate(expediente?.date || bookmark.createdAt),
        href: idPublic ? `/funmanage/expediente/${encodeURIComponent(idPublic)}` : '/licencias/gestion-nueva',
      };
    })
    .filter(Boolean)
    .filter((item) => {
      const unique = item.fun0Id || item.radicado;
      if (seen.has(unique)) return false;
      seen.add(unique);
      return true;
    })
    .slice(0, 6);
}

export function deferDashboardWork(callback) {
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(callback, { timeout: 1200 });
    return () => window.cancelIdleCallback?.(idleId);
  }

  const timeoutId = window.setTimeout(callback, 150);
  return () => window.clearTimeout(timeoutId);
}
