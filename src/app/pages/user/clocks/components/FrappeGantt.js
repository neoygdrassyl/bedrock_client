import React, { useRef, useLayoutEffect } from 'react';
import Gantt from 'frappe-gantt';
import moment from 'moment';

/**
 * Componente Wrapper para Frappe Gantt.
 * Se encarga de inicializar y renderizar el diagrama de Gantt.
 */
export const FrappeGantt = ({
  tasks = [],
  viewMode = 'Day', // 'Day', 'Week', 'Month'
  onTaskClick,
}) => {
  const ganttRef = useRef(null);
  const ganttInstance = useRef(null);

  useLayoutEffect(() => {
    if (ganttRef.current && tasks.length > 0) {
      // Si ya existe una instancia, la actualizamos. Si no, la creamos.
      if (ganttInstance.current) {
        ganttInstance.current.refresh(tasks);
        ganttInstance.current.change_view_mode(viewMode);
      } else {
        ganttInstance.current = new Gantt(ganttRef.current, tasks, {
          header_height: 50,
          column_width: 30,
          step: 24,
          view_modes: ['Day', 'Week', 'Month'],
          bar_height: 20,
          bar_corner_radius: 3,
          arrow_curve: 5,
          padding: 18,
          view_mode: viewMode,
          date_format: 'YYYY-MM-DD',
          language: 'es', // Asumiendo que se necesita en español
          custom_popup_html: (task) => {
            const startDate = moment(task._start).format('DD MMM YYYY');
            const endDate = task._end ? moment(task._end).format('DD MMM YYYY') : 'En progreso';
            const duration = task.duration_in_days || 0;

            return `
              <div class="gantt-custom-popup">
                <h5>${task.name}</h5>
                <p><strong>Responsable:</strong> ${task.responsible || 'N/A'}</p>
                <p><strong>Estado:</strong> ${task.status || 'N/A'}</p>
                <p><strong>Fechas:</strong> ${startDate} - ${endDate}</p>
                <p><strong>Duración:</strong> ${duration} día${duration !== 1 ? 's' : ''}</p>
              </div>
            `;
          },
          on_click: (task) => {
            onTaskClick?.(task);
          },
        });
      }
    }
  }, [tasks, viewMode, onTaskClick]);

  return <div ref={ganttRef}></div>;
};