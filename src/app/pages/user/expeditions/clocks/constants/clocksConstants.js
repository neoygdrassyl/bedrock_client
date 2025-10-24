/**
 * Constants for EXP_CLOCKS component
 * Contains state codes, time definitions, titles and categories
 */

// Estados negativos (desistimientos)
export const STEPS_TO_CHECK = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];

// Tiempo por defecto del evaluador según tipo de trámite (en días hábiles)
export const FUN_TYPE_TIME = {
  'i': 20,
  'ii': 25,
  'iii': 35,
  'iv': 45,
  'oa': 15
};

// Títulos de procesos negativos (desistimientos)
export const NEGATIVE_PROCESS_TITLE = {
  '-1': 'INCOMPLETO',
  '-2': 'FALTA VALLA INFORMATIVA',
  '-3': 'NO CUMPLE ACTA CORRECCIONES',
  '-4': 'NO PAGA EXPENSAS',
  '-5': 'VOLUNTARIO',
  '-6': 'NEGADA',
};

// Etiquetas para fuentes de referencia en cálculos
export const FROM_LABEL = {
  'SUSP_POST_END(351)': 'Fin de Suspensión (Post-Acta)',
  'SUSP_POST_START(301)': 'Inicio de Suspensión (Post-Acta)',
  'SUSP_PRE_END(350)': 'Fin de Suspensión (Pre-Acta)',
  'SUSP_PRE_START(300)': 'Inicio de Suspensión (Pre-Acta)',
  'CORR_35': 'Radicación de Correcciones (35)',
  'LDF_5': 'Legal y Debida Forma (5)',
  'PAUSED': 'Tiempo corriendo para el solicitante',
  'NOT_STARTED': 'No iniciado',
};

/**
 * Categorías para títulos (color e ícono)
 * @param {string} title - Título a categorizar
 * @returns {{color: string, icon: string}}
 */
export const getCategoryForTitle = (title = '') => {
  const titleUpper = title.toUpperCase();
  if (titleUpper.includes('DESISTIDO')) return { color: '#F93154', icon: 'fa-exclamation-circle' };
  if (titleUpper.includes('RADICACIÓN')) return { color: '#5bc0de', icon: 'fa-inbox' };
  if (titleUpper.includes('OBSERVACIONES')) return { color: '#fd7e14', icon: 'fa-clipboard-list' };
  if (titleUpper.includes('CORRECCIONES')) return { color: '#20c997', icon: 'fa-tools' };
  if (titleUpper.includes('VIABILIDAD')) return { color: '#6f42c1', icon: 'fa-compass' };
  if (titleUpper.includes('PAGOS')) return { color: '#198754', icon: 'fa-money-bill' };
  if (titleUpper.includes('RESOLUCIÓN')) return { color: '#0b5ed7', icon: 'fa-file-signature' };
  if (titleUpper.includes('RECURSO')) return { color: '#d63384', icon: 'fa-exclamation-circle' };
  if (titleUpper.includes('LICENCIA')) return { color: '#157347', icon: 'fa-id-card' };
  if (titleUpper.includes('SUSPENSIÓN')) return { color: '#ffc107', icon: 'fa-pause' };
  if (titleUpper.includes('PRÓRROGA')) return { color: '#17a2b8', icon: 'fa-clock' };
  return { color: '#5bc0de', icon: 'fa-folder-open' };
};

// Códigos de estado para eventos específicos
export const STATE_CODES = {
  RADICACION: false,
  EXPENSAS_FIJAS: 3,
  INCOMPLETO: -1,
  LDF: 5,
  ACTA_1: 30,
  CORR_RADICACION: 35,
  ACTA_2: 49,
  ACTO_VIABILIDAD: 61,
  SUSP_PRE_START: 300,
  SUSP_PRE_END: 350,
  SUSP_POST_START: 301,
  SUSP_POST_END: 351,
  EXT_START: 400,
  EXT_END: 401,
};

// Límite máximo de días de suspensión
export const MAX_SUSPENSION_DAYS = 10;

// Días por defecto de prórroga por complejidad
export const DEFAULT_EXTENSION_DAYS = 22;
