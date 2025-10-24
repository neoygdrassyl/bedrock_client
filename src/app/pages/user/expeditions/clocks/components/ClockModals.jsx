/**
 * Modal dialogs for clocks component
 * Centralized module for all modal interactions
 */

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FROM_LABEL } from '../constants/clocksConstants';

const MySwal = withReactContent(Swal);

/**
 * Show suspension information modal
 * @param {Object} suspensionData - Suspension data
 * @param {string} type - Type of suspension ('pre' or 'post')
 */
export const showSuspensionInfo = (suspensionData, type) => {
  const typeText = type === 'pre' ? 'Antes del Acta' : 'Después del Acta';
  MySwal.fire({
    title: `Suspensión ${typeText}`,
    html: `
      <div class="text-start">
        <p><strong>Ubicación:</strong> ${typeText}</p>
        <p><strong>Fecha de Inicio:</strong> ${suspensionData.start?.date_start || 'No definida'}</p>
        <p><strong>Fecha de Fin:</strong> ${suspensionData.end?.date_start || 'Pendiente por definir'}</p>
        <p><strong>Días de Suspensión:</strong> ${suspensionData.days || 'Pendiente'}</p>
        ${suspensionData.start?.desc ? `<p><strong>Información:</strong><br>${suspensionData.start.desc}</p>` : ''}
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Cerrar'
  });
};

/**
 * Show curaduría details modal
 * @param {Object} curDetails - Curaduría details
 * @param {Object} stateFlags - State flags (notStarted, paused, expired, inCourse)
 */
export const showCuraduriaDetails = (curDetails, stateFlags) => {
  if (!curDetails) return;

  const { notStarted, paused, expired, inCourse } = stateFlags;

  let stateChip = '<span class="badge bg-secondary">Sin estado</span>';
  if (notStarted) stateChip = '<span class="badge bg-secondary">No iniciado</span>';
  else if (paused) stateChip = '<span class="badge bg-warning text-dark">Pausado</span>';
  else if (expired) stateChip = '<span class="badge bg-danger">Vencido</span>';
  else if (inCourse) stateChip = '<span class="badge bg-primary">En curso</span>';

  const remainingClass = curDetails.remaining < 0 ? 'text-danger' : 'text-success';
  const fromText = FROM_LABEL[curDetails.from] || curDetails.from || '-';

  MySwal.fire({
    title: 'Detalle de Curaduría',
    html: `
      <div class="text-start">
        <div class="mb-2">${stateChip}</div>
        <div class="row g-2">
          <div class="col-12">
            <strong>Referencia:</strong> ${fromText}
            <div class="small text-muted">Fecha referencia: ${curDetails.reference || '-'}</div>
          </div>
          <div class="col-12">
            <strong>Fecha de corte:</strong> ${curDetails.today || '-'}
            <div class="small text-muted">Cálculo relativo a hoy (días hábiles)</div>
          </div>
          <hr class="my-2" />
          <div class="col-6"><strong>Base:</strong> ${curDetails.total - curDetails.suspensions - curDetails.extension}</div>
          <div class="col-6"><strong>Usados pre-Acta (5→30):</strong> ${curDetails.preActaUsed ?? 0}</div>
          <div class="col-6"><strong>Usados desde ref.:</strong> ${Math.max((curDetails.used ?? 0) - (curDetails.preActaUsed ?? 0), 0)}</div>
          <div class="col-6"><strong>Suspensiones:</strong> ${curDetails.suspensions}</div>
          <div class="col-6"><strong>Prórroga:</strong> ${curDetails.extension}</div>
          <div class="col-6"><strong>Total:</strong> ${curDetails.total}</div>
          <div class="col-6"><strong>Restantes:</strong> <span class="${remainingClass}">${curDetails.remaining}</span></div>
        </div>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Cerrar',
    width: 640,
  });
};

/**
 * Show desist modal
 * @param {Array} desistEvents - Array of desist events
 * @param {Object} negativeProcessTitles - Map of negative process titles
 */
export const showDesistModal = (desistEvents, negativeProcessTitles) => {
  const preferred = desistEvents.find(e => String(e.state) === '-5' || String(e.state) === '-6');
  const any = preferred || desistEvents[0];
  const reason = any ? (negativeProcessTitles?.[String(any.version)] || null) : null;

  const ordered = [...desistEvents].sort((a, b) => {
    const dateA = a.date_start || '';
    const dateB = b.date_start || '';
    return dateB.localeCompare(dateA);
  });

  const rows = ordered.map(e => {
    const lbl = negativeProcessTitles?.[String(e.version)] || `Estado ${e.state}`;
    return `<tr>
      <td>${lbl}</td>
      <td>${e.date_start}</td>
      <td>${e.version ?? '-'}</td>
    </tr>`;
  }).join('');

  MySwal.fire({
    title: 'Detalle de desistimiento',
    html: `
      <div class="text-start">
        ${reason ? `<div class="mb-2"><strong>Motivo principal:</strong> ${reason}</div>` : ''}
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Motivo/Estado</th>
                <th>Fecha</th>
                <th>Versión</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="small text-muted">Las acciones y métricas de tiempo se ocultan mientras el proceso esté desistido.</div>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Cerrar',
    width: 680,
  });
};
