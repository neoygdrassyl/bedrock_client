import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { swalInfo, swalError } from '../../../../shared/utils/swalAdapter';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';
import { getIconSvg } from '../../../../shared/utils/iconSvgString';
import { calcularDiasHabiles } from '../hooks/useClocksManager';
import { describePhaseTerm, formatPhaseDate, getDefaultPhaseIndex, getResolvedStatus, getResponsibleCfg } from '../utils/phaseTerm';

// The phase helpers live in `utils/phaseTerm` (pure, shared with the workspace header);
// re-exported here so existing imports keep working.
export { describePhaseTerm, formatPhaseDate, getDefaultPhaseIndex, getResponsibleCfg } from '../utils/phaseTerm';

const escapeHtml = (s) => {
  if (s === null || s === undefined) return '';
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

const formatShortDate = formatPhaseDate;

// Presentation only (workspace/expedientePendingStatus): in a finished process a phase that
// stayed open is a pending record, never "En curso" or "Vencido".
const PENDING_RECORD_STATUS = { text: 'Pendiente', color: 'warning', icon: 'Hourglass' };
const isOpenPhase = (phase) => Boolean(phase) && phase.status !== 'COMPLETADO';
const resolvePhaseStatus = (phase, term, finished) => (finished && isOpenPhase(phase) ? PENDING_RECORD_STATUS : term.status);

const STATUS_TEXT_CLASS = {
  primary: 'text-primary',
  info: 'text-primary',
  success: 'text-[color:var(--tc-success-text)]',
  warning: 'text-[color:var(--tc-warning-text)]',
  danger: 'text-destructive',
  secondary: 'text-muted-foreground',
};

const remainingClass = (remaining) => (remaining < 0 ? 'is-neg' : remaining <= 3 ? 'is-warn' : 'is-pos');

/**
 * Selected phase, compact: name + status, responsible + dates, legal limit, and the day
 * totals in a 3-up grid (the figures the phase card always showed: plazo + días extra,
 * usados, restantes). Parallel actors get one line each. Read-only.
 */
const PhaseSummary = ({ phase, pendingItems, onActorClick, onOpenDetail }) => {
  if (!phase) return null;
  const isPendingRecord = Array.isArray(pendingItems) && isOpenPhase(phase);
  const term = describePhaseTerm(phase);
  const st = isPendingRecord ? PENDING_RECORD_STATUS : term.status;
  const responsibleCfg = getResponsibleCfg(phase.responsible);
  const { startDate, endDate, limitDate, parallelActors, daysContext } = phase;
  const actors = parallelActors?.primary && parallelActors?.secondary ? [parallelActors.primary, parallelActors.secondary] : [];

  return (
    <div className="tc-phase-summary">
      <div className="tc-phase-summary-head">
        <div className="min-w-0">
          <button
            type="button"
            className="tc-phase-summary-title"
            onClick={() => onOpenDetail?.(phase)}
            title={`${phase.title}: ver el detalle completo`}
          >
            {phase.title}
          </button>
          <p className="tc-phase-summary-resp">
            <Icon name={responsibleCfg.icon} size={12} aria-hidden="true" />
            {responsibleCfg.text}
          </p>
        </div>
        <span className={`phase-status-pill status-${st.color}`}>
          <Icon name={st.icon} size={14} />
          {st.text}
        </span>
      </div>

      <dl className="tc-phase-facts">
        <div><dt>Inicio</dt><dd>{startDate ? formatShortDate(startDate) : '—'}</dd></div>
        <div>
          <dt>Fin</dt>
          <dd className={endDate ? undefined : 'is-text'}>{endDate ? formatShortDate(endDate) : isPendingRecord ? 'Sin registro' : startDate ? 'En curso' : '—'}</dd>
        </div>
        <div><dt>Límite legal</dt><dd>{limitDate ? formatShortDate(limitDate) : '—'}</dd></div>
        {isPendingRecord ? null : (
          <>
            <div><dt>Plazo</dt><dd className="is-num">{term.total} d</dd></div>
            <div><dt>Usados</dt><dd className="is-num">{term.used} d</dd></div>
            <div><dt>Restan</dt><dd className={cn('is-num', remainingClass(term.remaining))}>{term.remaining} d</dd></div>
          </>
        )}
      </dl>

      {isPendingRecord ? (
        <p className="tc-phase-summary-note">
          <Icon name="Hourglass" size={14} className="text-[color:var(--tc-warning-text)]" aria-hidden="true" />
          <span>
            {pendingItems.length
              ? `${pendingItems.length} evento${pendingItems.length === 1 ? '' : 's'} por registrar en esta fase.`
              : startDate
                ? 'Quedó abierta; ningún evento visible sin fecha la explica.'
                : 'Sin iniciar: depende de una fase anterior sin cerrar.'}
          </span>
        </p>
      ) : null}

      {actors.length && !isPendingRecord ? (
        <ul className="tc-phase-actors" aria-label="Actores en paralelo">
          {actors.map((actor) => {
            const at = describePhaseTerm(actor);
            return (
              <li key={actor.name}>
                <button type="button" className="tc-phase-actor" onClick={() => onActorClick?.(actor)} title="Ver detalle del actor">
                  <Icon name={actor.icon || 'User'} size={14} aria-hidden="true" />
                  <span className="tc-phase-actor-name">{actor.name}</span>
                  <span className={cn('tc-phase-actor-status', STATUS_TEXT_CLASS[at.status.color])}>{at.status.text}</span>
                  <span className="tc-phase-actor-days">{at.used}/{at.total}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {daysContext ? (
        <p className="tc-phase-summary-context" title="Contexto de distribución de días">
          <Icon name="calculator" size={14} aria-hidden="true" />
          <span>{daysContext.totalCuraduria} d total · {daysContext.usedInPhase1} d F1 · <strong>{daysContext.availableForPhase4} d</strong> para F4</span>
        </p>
      ) : null}
    </div>
  );
};
// --- FIN DE COMPONENTES AUXILIARES ---

/** Actor detail dialog (pure: reads only the actor and its phase). */
const openActorDetailModal = (actor, phase) => {
  if (!actor) return;

  const totalAvailable = (Number(actor.totalDays) || 0) + (Number(actor.extraDays) || 0);
  const used = Number(actor.usedDays) || 0;
  const remaining = totalAvailable - used;
  const st = getResolvedStatus(actor.status, remaining, actor.endDate, actor.limitDate);

  const phaseTitle = phase?.title ? escapeHtml(phase.title) : '—';

  return swalInfo({
    title: 'Detalle del Actor',
    width: 560,
    showCloseButton: true,
    customClass: {
      popup: 'phase-detail-modal-popup',
      title: 'phase-detail-modal-title',
      htmlContainer: 'phase-detail-modal-container',
    },
    html: `
      <div class="phase-detail-modal">
        <div class="pdm-header">
          <div class="pdm-title">
            <div class="pdm-name">
              ${getIconSvg(actor.icon || 'fa-user')}
              <span>${escapeHtml(actor.name || 'Actor')}</span>
            </div>
            <div class="pdm-sub">Fase: <b>${phaseTitle}</b></div>
          </div>
          <div class="pdm-badges">
            <span class="pdm-pill status-${escapeHtml(st.color)}">
              ${getIconSvg(st.icon)} ${escapeHtml(st.text)}
            </span>
          </div>
        </div>

        ${actor.taskDescription ? `
          <div class="pdm-block">
            <div class="pdm-block-title">${getIconSvg('fa-tasks')} Actividad</div>
            <div class="pdm-block-body">${escapeHtml(actor.taskDescription)}</div>
          </div>
        ` : ''}

        <div class="pdm-grid">
          <div class="pdm-card">
            <div class="k">Plazo total</div>
            <div class="v">${escapeHtml(totalAvailable)} días</div>
          </div>
          <div class="pdm-card">
            <div class="k">Días usados</div>
            <div class="v">${escapeHtml(used)} días</div>
          </div>
          <div class="pdm-card">
            <div class="k">Días restantes</div>
            <div class="v ${remaining < 0 ? 'neg' : remaining <= 3 ? 'warn' : 'pos'}">${escapeHtml(remaining)} días</div>
          </div>
        </div>
      </div>
    `,
  });
};

/** Phase detail dialog (pure), shared by the phase card and the Gantt rows. */
export const openPhaseDetailModal = (phase, { finished = false } = {}) => {
  if (!phase) return;

  const totalAvailable = (Number(phase.totalDays) || 0) + (Number(phase.extraDays) || 0);
  const used = Number(phase.usedDays) || 0;
  const remaining = totalAvailable - used;
  // `finished`: see PENDING_RECORD_STATUS. The figures below stay as calculated.
  const isPendingRecord = finished === true && isOpenPhase(phase);
  const st = isPendingRecord ? PENDING_RECORD_STATUS : getResolvedStatus(phase.status, remaining, phase.endDate, phase.limitDate);
  const respCfg = getResponsibleCfg(phase.responsible);
  const isParallel = !!phase.parallelActors?.primary && !!phase.parallelActors?.secondary;
  const actorsForModal = isParallel
    ? [
        { ...phase.parallelActors.primary, _key: 'p' },
        { ...phase.parallelActors.secondary, _key: 's' },
      ]
    : [];

  return swalInfo({
    title: 'Detalle de la Fase',
    width: 720,
    showCloseButton: true,
    customClass: {
      popup: 'phase-detail-modal-popup',
      title: 'phase-detail-modal-title',
      htmlContainer: 'phase-detail-modal-container',
    },
    html: `
      <div class="phase-detail-modal">
        <div class="pdm-header">
          <div class="pdm-title">
            <div class="pdm-name">
              ${getIconSvg('fa-layer-group')}
              <span>${escapeHtml(phase.title || 'Fase')}</span>
            </div>
            <div class="pdm-sub">
              Responsable:
              <span class="pdm-pill phase-pill-${escapeHtml(respCfg.color)}">
                ${getIconSvg(respCfg.icon)} ${escapeHtml(respCfg.text)}
              </span>
            </div>
          </div>
          <div class="pdm-badges">
            <span class="pdm-pill status-${escapeHtml(st.color)}">
              ${getIconSvg(st.icon)} ${escapeHtml(st.text)}
            </span>
          </div>
        </div>

        <div class="pdm-grid">
          <div class="pdm-card">
            <div class="k">Plazo total</div>
            <div class="v">${escapeHtml(totalAvailable)} días</div>
          </div>
          <div class="pdm-card">
            <div class="k">Días usados</div>
            <div class="v">${escapeHtml(used)} días</div>
          </div>
          <div class="pdm-card">
            <div class="k">Días restantes</div>
            <div class="v ${remaining < 0 ? 'neg' : remaining <= 3 ? 'warn' : 'pos'}">${escapeHtml(remaining)} días</div>
          </div>
          <div class="pdm-card">
            <div class="k">Inicio</div>
            <div class="v">${escapeHtml(formatShortDate(phase.startDate))}</div>
          </div>
          <div class="pdm-card">
            <div class="k">Fin</div>
            <div class="v">${escapeHtml(phase.endDate ? formatShortDate(phase.endDate) : isPendingRecord ? 'Sin registro' : 'En progreso')}</div>
          </div>
          <div class="pdm-card">
            <div class="k">Ejecución</div>
            <div class="v">${totalAvailable > 0 ? escapeHtml(Math.min(100, Math.round((used / totalAvailable) * 100))) : 0}%</div>
          </div>
        </div>

        ${phase.daysContext ? `
          <div class="pdm-block">
            <div class="pdm-block-title">${getIconSvg('fa-calculator')} Contexto (F4)</div>
            <div class="pdm-block-body">
              <div class="pdm-inline">
                <span>Total Curaduría:</span> <b>${escapeHtml(phase.daysContext.totalCuraduria)} días</b>
              </div>
              <div class="pdm-inline">
                <span>Usados en Fase 1:</span> <b>${escapeHtml(phase.daysContext.usedInPhase1)} días</b>
              </div>
              <div class="pdm-inline">
                <span>Disponibles para Fase 4:</span> <b>${escapeHtml(phase.daysContext.availableForPhase4)} días</b>
              </div>
            </div>
          </div>
        ` : ''}

        ${actorsForModal.length ? `
          <div class="pdm-block">
            <div class="pdm-block-title">${getIconSvg('fa-users')} Actores</div>
            <div class="pdm-actors">
              ${actorsForModal
                .map((a) => {
                  const t = (Number(a.totalDays) || 0) + (Number(a.extraDays) || 0);
                  const u = Number(a.usedDays) || 0;
                  const r = t - u;
                  const ast = getResolvedStatus(a.status, r, a.endDate, a.limitDate);
                  return `
                    <div class="pdm-actor">
                      <div class="pdm-actor-top">
                        <div class="pdm-actor-name">
                          ${getIconSvg(a.icon || 'fa-user')}
                          <span>${escapeHtml(a.name || 'Actor')}</span>
                        </div>
                        <span class="pdm-pill status-${escapeHtml(ast.color)}">
                          ${getIconSvg(ast.icon)} ${escapeHtml(ast.text)}
                        </span>
                      </div>
                      <div class="pdm-actor-grid">
                        <div><span>Total</span><b>${escapeHtml(t)}</b></div>
                        <div><span>Usados</span><b>${escapeHtml(u)}</b></div>
                        <div><span>Rest.</span><b class="${r < 0 ? 'neg' : r <= 3 ? 'warn' : 'pos'}">${escapeHtml(r)}</b></div>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
            <div class="pdm-note">Tip: para ver el actor desde la tarjeta, haz click directamente en el actor.</div>
          </div>
        ` : ''}
      </div>
    `,
  });
};

/**
 * "Desglose de días" dialog. A plain function of the manager (nothing is mutated onto the
 * hook's memoized objects), so the tools menu can open it directly.
 */
export const openDaysBreakdownModal = (manager) => {
  const { processPhases, FUN_0_TYPE_TIME } = manager || {};
  if (!processPhases?.length) {
    return swalError({ title: 'Sin datos', text: 'No hay fases calculadas para desglosar.', icon: 'warning' });
  }

  const phase1 = processPhases?.find((p) => p.id === 'phase1');
  const phase4 = processPhases?.find((p) => p.id === 'phase4');
  const context = phase4?.daysContext;

  const baseDays =
    (FUN_0_TYPE_TIME && typeof FUN_0_TYPE_TIME === 'object' ? FUN_0_TYPE_TIME[manager?.currentItem?.type] : 45) ?? 45;
  const suspDays = manager?.totalSuspensionDays || 0;
  const extDays = manager?.extension?.days || 0;

  const totalDays = baseDays + suspDays + extDays;
  const phase1Used = context?.usedInPhase1 ?? phase1?.usedDays ?? 0;
  const phase4Available = context?.availableForPhase4 ?? Math.max(0, totalDays - phase1Used);
  const phase4Used = phase4?.usedDays ?? 0;

  const totalUsed = phase1Used + phase4Used;
  const totalRemaining = Math.max(0, totalDays - totalUsed);

  return swalInfo({
    title: 'Control de Tiempos - Curaduría',
    width: 560,
    showCloseButton: true,
    customClass: {
      popup: 'days-modal-popup',
      title: 'days-modal-title',
      htmlContainer: 'days-modal-container',
      confirmButton: 'days-modal-btn',
    },
    html: `
      <div class="days-modal-content">
        <div class="days-summary-row">
          <div class="summary-item">
            <span class="summary-value">${escapeHtml(totalDays)}</span>
            <span class="summary-label">Total</span>
          </div>
          <div class="summary-item used">
            <span class="summary-value">${escapeHtml(totalUsed)}</span>
            <span class="summary-label">Usados</span>
          </div>
          <div class="summary-item remaining">
            <span class="summary-value">${escapeHtml(totalRemaining)}</span>
            <span class="summary-label">Restantes</span>
          </div>
        </div>

        <div class="days-info-grid">
          <div class="info-card">
            <div class="info-card-title">${getIconSvg('fa-layer-group')} Composición</div>
            <div class="info-card-body">
              <div class="info-row"><span>${getIconSvg('fa-calendar-day')} Base</span><strong>${escapeHtml(baseDays)}</strong></div>
              <div class="info-row ${suspDays ? '' : 'muted'}"><span>${getIconSvg('fa-pause')} Suspensiones</span><strong class="${suspDays ? 'text-warning' : ''}">${escapeHtml(suspDays || 0)}</strong></div>
              <div class="info-row ${extDays ? '' : 'muted'}"><span>${getIconSvg('fa-clock')} Prórroga</span><strong class="${extDays ? 'text-info' : ''}">${escapeHtml(extDays || 0)}</strong></div>
              <div class="info-row total"><span>Total</span><strong>${escapeHtml(totalDays)}</strong></div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-card-title">${getIconSvg('fa-tasks')} Distribución</div>
            <div class="info-card-body">
              <div class="phase-detail">
                <div class="phase-header">
                  <span class="phase-label">Fase 1</span>
                  <span class="phase-count">${escapeHtml(phase1Used)}/${escapeHtml(totalDays)}</span>
                </div>
                <div class="phase-mini-bar">
                  <div class="phase-mini-fill phase1" style="width:${totalDays ? (phase1Used / totalDays) * 100 : 0}%"></div>
                </div>
              </div>

              <div class="phase-transfer">
                ${getIconSvg('fa-arrow-down')}
                <span>${escapeHtml(phase4Available)} días pasan a Fase 4</span>
              </div>

              <div class="phase-detail">
                <div class="phase-header">
                  <span class="phase-label">Fase 4</span>
                  <span class="phase-count">${escapeHtml(phase4Used)}/${escapeHtml(phase4Available || 0)}</span>
                </div>
                <div class="phase-mini-bar">
                  <div class="phase-mini-fill phase4" style="width:${phase4Available ? (phase4Used / phase4Available) * 100 : 0}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  });
};

export const SidebarInfo = ({ manager, onActivePhaseChange, pending }) => {
  const { processPhases, curaduriaDetails } = manager || {};
  const finished = Boolean(pending?.pending);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  useEffect(() => {
    const defaultIndex = getDefaultPhaseIndex(processPhases);
    if (defaultIndex >= 0) setCurrentPhaseIndex(defaultIndex);
  }, [processPhases]);

  useEffect(() => {
    if (processPhases && processPhases.length > 0) {
      const activePhase = processPhases[currentPhaseIndex];
      if (activePhase) {
        onActivePhaseChange?.(activePhase.id);
      }
    }
  }, [currentPhaseIndex, processPhases, onActivePhaseChange]);

  // Keep the selected step in view inside the stepper (its own scroll box).
  const stepperRef = useRef(null);
  useEffect(() => {
    const list = stepperRef.current;
    const step = list?.querySelector('[aria-current="step"]');
    if (!list || !step || list.scrollHeight <= list.clientHeight) return;
    const top = step.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + step.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = Math.max(0, top - list.clientHeight / 2);
    }
  }, [currentPhaseIndex]);

  const handlePhaseChange = (direction) => {
    setCurrentPhaseIndex((prev) =>
      Math.max(0, Math.min(prev + direction, (processPhases?.length || 1) - 1)),
    );
  };
  
  const showDebug = () => {
      if (!manager || !processPhases?.length) {
        return swalError({ title: 'Sin datos', text: 'No hay fases calculadas para diagnosticar.', icon: 'warning' });
      }

      // `calcularDiasHabiles` is the helper exported by useClocksManager (same business-day
      // calculator the hook uses); the emulated "today" is the manager's systemDate.
      const system = { today: formatPhaseDate(manager.systemDate) };
      const { getClock, currentItem } = manager;
      
      const radicacionDate = currentItem?.date;
      const ldfDate = getClock(5)?.date_start;
      const vallaDate = getClock(503)?.date_start;
      const acta1Date = getClock(30)?.date_start;
      const corrDate = getClock(35)?.date_start;

      const diasRadLDF = radicacionDate && ldfDate ? calcularDiasHabiles(radicacionDate, ldfDate, true) : 'N/A';
      const diasLDFValla = ldfDate && vallaDate ? calcularDiasHabiles(ldfDate, vallaDate, true) : 'N/A';
      const diasLDFActa1 = ldfDate && acta1Date ? calcularDiasHabiles(ldfDate, acta1Date, true) : 'N/A';
      const diasActa1Corr = acta1Date && corrDate ? calcularDiasHabiles(acta1Date, corrDate, true) : 'N/A';
      
      const fmt = (d) => (d ? formatPhaseDate(d) : 'Sin fecha registrada');

      swalInfo({
          title: 'Diagnóstico de Fases y Tiempos',
          width: 720,
          html: `
              <div style="text-align:left;font-size:0.85rem;">
                  <div class="row mb-2">
                      <div class="col-6">Hoy (emulado): <b>${escapeHtml(system.today || '—')}</b></div>
                      <div class="col-6">Tipo Proceso: <b>${escapeHtml(currentItem?.type || '—')}</b></div>
                  </div>

                  <h6 class="text-primary border-bottom pb-1 mt-3">Eventos Clave y Días Consumidos</h6>
                  
                  <div class="pdm-block" style="font-size: 0.8rem;">
                      <div class="pdm-block-body">
                          <div class="pdm-inline">
                              <span>Radicación: <b>${escapeHtml(fmt(radicacionDate))}</b></span>
                              <span>LDF: <b>${escapeHtml(fmt(ldfDate))}</b></span>
                              <span>Consumido: <b>${diasRadLDF}d</b></span>
                          </div>
                          <div class="pdm-inline">
                              <span>LDF: <b>${escapeHtml(fmt(ldfDate))}</b></span>
                              <span>Valla: <b>${escapeHtml(fmt(vallaDate))}</b></span>
                              <span>Consumido: <b>${diasLDFValla}d</b></span>
                          </div>
                          <div class="pdm-inline">
                              <span>LDF: <b>${escapeHtml(fmt(ldfDate))}</b></span>
                              <span>Acta 1: <b>${escapeHtml(fmt(acta1Date))}</b></span>
                              <span>Consumido: <b>${diasLDFActa1}d</b></span>
                          </div>
                           <div class="pdm-inline">
                              <span>Acta 1: <b>${escapeHtml(fmt(acta1Date))}</b></span>
                              <span>Correcciones: <b>${escapeHtml(fmt(corrDate))}</b></span>
                              <span>Consumido: <b>${diasActa1Corr}d</b></span>
                          </div>
                      </div>
                  </div>

              </div>
          `,
          showCloseButton: true,
          });
  };


  if (!curaduriaDetails || !processPhases || processPhases.length === 0) {
    return (
      <section className="sidebar-card phases-card" aria-labelledby="tc-phases-title">
        <div className="sidebar-card-header">
          <h3 id="tc-phases-title" className="tc-card-title">Fases del proceso</h3>
        </div>
        <p className="tc-empty">Sin fases calculadas: registra la fecha de radicación para iniciar el control de términos.</p>
      </section>
    );
  }

  const currentPhase = processPhases[currentPhaseIndex] || processPhases[0];
  const defaultPhaseIndex = getDefaultPhaseIndex(processPhases);
  const doneCount = processPhases.filter((p) => p.status === 'COMPLETADO').length;

  return (
    <>
      <section className="sidebar-card phases-card" aria-labelledby="tc-phases-title">
        <div className="sidebar-card-header">
          <h3 id="tc-phases-title" className="tc-card-title">Fases del proceso</h3>
          <span className="tc-card-meta">{doneCount} de {processPhases.length} completadas</span>
        </div>

        {/* All phases at once; the same array and index the pager uses. The only scroll
            region of the panel, and only when the phases do not fit. */}
        <ol ref={stepperRef} className="tc-stepper" aria-label="Fases del proceso">
          {processPhases.map((phase, index) => {
            const term = describePhaseTerm(phase);
            const selected = index === currentPhaseIndex;
            const stepStatus = resolvePhaseStatus(phase, term, finished);
            const pendingRecord = finished && isOpenPhase(phase);
            const stepPendings = pendingRecord ? pending.items.filter((item) => item.phaseId === phase.id).length : 0;
            return (
              <li key={phase.id || index} className="tc-step-item">
                <button
                  type="button"
                  className={cn('tc-step', selected && 'is-selected')}
                  aria-current={selected ? 'step' : undefined}
                  onClick={() => setCurrentPhaseIndex(index)}
                  title={pendingRecord
                    ? `${phase.title} · Pendiente · ${stepPendings ? `${stepPendings} por registrar` : 'sin cerrar'}`
                    : `${phase.title} · ${stepStatus.text} · ${term.used}/${term.total} días hábiles`}
                >
                  <span className={cn('tc-step-icon', STATUS_TEXT_CLASS[stepStatus.color])} aria-hidden="true">
                    <Icon name={stepStatus.icon} size={14} />
                  </span>
                  <span className="tc-step-name">{phase.title}</span>
                  {index === defaultPhaseIndex && !finished ? <span className="tc-step-current">Actual</span> : null}
                  {pendingRecord ? (
                    // No day counter here: nothing is running in a finished process.
                    <span className="tc-step-days is-pending">{stepPendings ? `${stepPendings} pend.` : 'pend.'}</span>
                  ) : (
                    <span className={cn('tc-step-days', term.remaining < 0 && phase.status !== 'PENDIENTE' && 'is-over')}>
                      {term.used}/{term.total}
                    </span>
                  )}
                  <span className="sr-only">{stepStatus.text}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="sidebar-card tc-detail-card" aria-labelledby="tc-detail-title">
        <div className="sidebar-card-header">
          <h3 id="tc-detail-title" className="tc-card-title">Detalle de la fase</h3>
          <div className="phase-nav">
            <Button type="button" variant="ghost" size="sm" className="tc-icon-btn" onClick={showDebug}
              aria-label="Ver diagnóstico de fases y tiempos" title="Diagnóstico de fases y tiempos">
              <Icon name="bug" size={16} />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="tc-icon-btn" onClick={() => handlePhaseChange(-1)}
              disabled={currentPhaseIndex === 0}
              aria-label="Fase anterior" title="Fase anterior"
            >
              <Icon name="chevron-left" size={16} />
            </Button>
            <span className="phase-indicator" aria-live="polite" aria-label={`Fase ${currentPhaseIndex + 1} de ${processPhases.length}`}>
              {currentPhaseIndex + 1}/{processPhases.length}
            </span>
            <Button type="button" variant="ghost" size="sm" className="tc-icon-btn" onClick={() => handlePhaseChange(1)}
              disabled={currentPhaseIndex === processPhases.length - 1}
              aria-label="Fase siguiente" title="Fase siguiente"
            >
              <Icon name="chevron-right" size={16} />
            </Button>
          </div>
        </div>
        <PhaseSummary
          phase={currentPhase}
          pendingItems={finished ? pending.items.filter((item) => item.phaseId === currentPhase?.id) : undefined}
          onActorClick={(actor) => openActorDetailModal(actor, currentPhase)}
          onOpenDetail={(phase) => openPhaseDetailModal(phase, { finished })}
        />
      </section>
    </>
  );
};
