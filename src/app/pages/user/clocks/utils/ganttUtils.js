import moment from 'moment';
import { calcularDiasHabiles, sumarDiasHabiles, FUN_0_TYPE_TIME } from '../hooks/useClocksManager';

/**
 * Calcula los datos necesarios para renderizar el diagrama de Gantt
 * basándose en las fases del proceso y la configuración de visualización
 */
export const calculateGanttData = (processPhases, manager, mode = 'legal') => {
  if (!processPhases || processPhases.length === 0) return [];

  const ganttBars = [];

  processPhases.forEach((phase, index) => {
    const {
      id,
      title,
      responsible,
      status,
      totalDays,
      usedDays,
      extraDays,
      startDate,
      endDate,
      parallelActors,
      highlightClass,
      daysContext,
    } = phase;

    // Calcular fechas para el diagrama
    let barStartDate = startDate;
    let barEndDate = endDate;
    
    if (mode === 'legal') {
      // Modo límites legales: usar totalDays + extraDays para calcular límite
      if (barStartDate && totalDays > 0) {
        const legalLimitDate = sumarDiasHabiles(barStartDate, totalDays + (extraDays || 0));
        barEndDate = endDate || legalLimitDate;
      }
    } else if (mode === 'event') {
      // Modo fechas de evento: usar solo las fechas reales
      barEndDate = endDate || null;
    }

    // Calcular ancho de la barra (días usados vs días totales)
    const totalAvailable = (totalDays || 0) + (extraDays || 0);
    const actualUsed = usedDays || 0;
    const fillPercentage = totalAvailable > 0 ? Math.min(100, (actualUsed / totalAvailable) * 100) : 0;

    // Identificar suspensiones y prórrogas que aplican a esta fase
    const suspensions = [];
    const extensions = [];

    // Determinar si esta fase incluye suspensiones o prórrogas
    if (extraDays > 0) {
      // Las prórrogas se muestran al final de la barra
      extensions.push({
        days: extraDays,
        type: 'extension',
        color: 'info',
      });
    }

    // Para suspensiones, necesitamos verificar si están en el contexto de esta fase
    // Esto se hace basándose en los estados relacionados
    if (manager.suspensionPreActa?.exists && manager.suspensionPreActa?.days > 0) {
      // Verificar si esta fase corresponde a pre-acta (Fase 1)
      if (id === 'phase1' || title?.toLowerCase().includes('observaciones')) {
        suspensions.push({
          days: manager.suspensionPreActa.days,
          type: 'suspension_pre',
          color: 'warning',
          isActive: manager.suspensionPreActa.isActive,
        });
      }
    }

    if (manager.suspensionPostActa?.exists && manager.suspensionPostActa?.days > 0) {
      // Verificar si esta fase corresponde a post-acta (Fase 4)
      if (id === 'phase4' || title?.toLowerCase().includes('viabilidad') || title?.toLowerCase().includes('correcciones')) {
        suspensions.push({
          days: manager.suspensionPostActa.days,
          type: 'suspension_post',
          color: 'warning',
          isActive: manager.suspensionPostActa.isActive,
        });
      }
    }

    const ganttBar = {
      id,
      title,
      responsible,
      status,
      startDate: barStartDate,
      endDate: barEndDate,
      totalDays: totalAvailable,
      usedDays: actualUsed,
      fillPercentage,
      highlightClass,
      parallelActors,
      suspensions,
      extensions,
      daysContext,
    };

    ganttBars.push(ganttBar);
  });

  return ganttBars;
};

/**
 * Calcula el rango de fechas total del diagrama de Gantt
 */
export const calculateGanttDateRange = (ganttBars) => {
  if (!ganttBars || ganttBars.length === 0) return { start: null, end: null };

  let minDate = null;
  let maxDate = null;

  ganttBars.forEach((bar) => {
    if (bar.startDate) {
      if (!minDate || moment(bar.startDate).isBefore(minDate)) {
        minDate = bar.startDate;
      }
    }

    if (bar.endDate) {
      if (!maxDate || moment(bar.endDate).isAfter(maxDate)) {
        maxDate = bar.endDate;
      }
    }
  });

  return { start: minDate, end: maxDate };
};

/**
 * Calcula el ancho relativo de una barra en el diagrama
 * basándose en el rango total de fechas
 */
export const calculateBarWidth = (startDate, endDate, rangeStart, rangeEnd) => {
  if (!startDate || !rangeStart || !rangeEnd) return 0;

  const totalDays = calcularDiasHabiles(rangeStart, rangeEnd, true);
  if (totalDays <= 0) return 0;

  const barDays = endDate ? calcularDiasHabiles(startDate, endDate, true) : 0;
  const widthPercentage = (barDays / totalDays) * 100;

  return Math.max(0, Math.min(100, widthPercentage));
};

/**
 * Calcula el offset (posición inicial) de una barra en el diagrama
 */
export const calculateBarOffset = (startDate, rangeStart, rangeEnd) => {
  if (!startDate || !rangeStart || !rangeEnd) return 0;

  const totalDays = calcularDiasHabiles(rangeStart, rangeEnd, true);
  if (totalDays <= 0) return 0;

  const offsetDays = calcularDiasHabiles(rangeStart, startDate, true);
  const offsetPercentage = (offsetDays / totalDays) * 100;

  return Math.max(0, Math.min(100, offsetPercentage));
};

/**
 * Genera marcadores de línea de tiempo para el eje X del Gantt
 */
export const generateTimelineMarkers = (rangeStart, rangeEnd, maxMarkers = 8) => {
  if (!rangeStart || !rangeEnd) return [];

  const totalDays = calcularDiasHabiles(rangeStart, rangeEnd, true);
  if (totalDays <= 0) return [];

  const markers = [];
  const step = Math.max(1, Math.ceil(totalDays / maxMarkers));

  let currentDate = moment(rangeStart);
  let dayCount = 0;

  while (dayCount <= totalDays) {
    markers.push({
      date: currentDate.format('YYYY-MM-DD'),
      label: currentDate.format('DD MMM'),
      position: (dayCount / totalDays) * 100,
    });

    currentDate = moment(sumarDiasHabiles(rangeStart, dayCount + step));
    dayCount += step;
  }

  return markers;
};

/**
 * Obtiene el color de estado para una fase
 */
export const getStatusColor = (status) => {
  const colorMap = {
    PENDIENTE: 'secondary',
    ACTIVO: 'primary',
    PAUSADO: 'warning',
    COMPLETADO: 'success',
    VENCIDO: 'danger',
    ESPERANDO_NOTIFICACION: 'info',
  };

  return colorMap[status] || 'secondary';
};

/**
 * Obtiene el ícono para un responsable
 */
export const getResponsibleIcon = (responsible) => {
  const iconMap = {
    Curaduria: 'fa-building',
    Curaduría: 'fa-building',
    Solicitante: 'fa-user',
    Mixto: 'fa-users',
  };

  return iconMap[responsible] || 'fa-user-tie';
};

/**
 * Formatea la información de tooltip para una barra del Gantt
 */
export const formatGanttTooltip = (bar) => {
  const { title, responsible, totalDays, usedDays, startDate, endDate, suspensions, extensions } = bar;

  let tooltip = `<strong>${title}</strong><br/>`;
  tooltip += `Responsable: ${responsible}<br/>`;
  tooltip += `Días: ${usedDays}/${totalDays}<br/>`;

  if (startDate) {
    tooltip += `Inicio: ${moment(startDate).format('DD MMM YY')}<br/>`;
  }

  if (endDate) {
    tooltip += `Fin: ${moment(endDate).format('DD MMM YY')}<br/>`;
  }

  if (suspensions && suspensions.length > 0) {
    const totalSusp = suspensions.reduce((sum, s) => sum + s.days, 0);
    tooltip += `Suspensiones: ${totalSusp} días<br/>`;
  }

  if (extensions && extensions.length > 0) {
    const totalExt = extensions.reduce((sum, e) => sum + e.days, 0);
    tooltip += `Prórrogas: ${totalExt} días<br/>`;
  }

  return tooltip;
};
