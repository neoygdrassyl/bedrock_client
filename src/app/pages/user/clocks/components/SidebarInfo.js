import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

const MySwal = withReactContent(Swal);

const STATUS_MAP = {
  PENDIENTE: { text: 'Pendiente', color: 'secondary', icon: 'fa-hourglass-start' },
  ACTIVO: { text: 'En curso', color: 'primary', icon: 'fa-running' },
  PAUSADO: { text: 'Pausado', color: 'warning', icon: 'fa-pause-circle' },
  COMPLETADO: { text: 'Completado', color: 'success', icon: 'fa-check-circle' },
  ESPERANDO_NOTIFICACION: { text: 'Esperando notif.', color: 'info', icon: 'fa-envelope' },
  VENCIDO: { text: 'Vencido', color: 'danger', icon: 'fa-exclamation-triangle' },
};

const escapeHtml = (s) => {
  if (s === null || s === undefined) return '';
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

const formatShortDate = (d) => (d ? moment(d).format('DD MMM YY') : '—');

const getResolvedStatus = (status, remainingDays) => {
  if (status === 'ACTIVO' && remainingDays < 0) return STATUS_MAP.VENCIDO;
  return STATUS_MAP[status] || STATUS_MAP.PENDIENTE;
};

const getResponsibleCfg = (responsible) => {
  switch (responsible) {
    case 'Curaduria':
      return { icon: 'fa-building', color: 'primary', text: 'Curaduría' };
    case 'Solicitante':
      return { icon: 'fa-user', color: 'info', text: 'Solicitante' };
    case 'Mixto':
      return { icon: 'fa-users', color: 'purple', text: 'Mixto' };
    default:
      return { icon: 'fa-user-tie', color: 'secondary', text: responsible || 'Responsable' };
  }
};

const ResponsiblePill = ({ responsible }) => {
  const cfg = getResponsibleCfg(responsible);
  return (
    <span className={`phase-pill phase-pill-${cfg.color}`} title={cfg.text}>
      <i className={`fas ${cfg.icon}`} />
      <span className="text-truncate">{cfg.text}</span>
    </span>
  );
};

const ActorCompactRow = ({ actor, onActorClick, dense = false }) => {
  const {
    name,
    icon = 'fa-user',
    color = 'secondary',
    totalDays = 0,
    usedDays = 0,
    extraDays = 0,
    status = 'PENDIENTE',
    taskDescription,
  } = actor || {};

  const totalAvailable = (Number(totalDays) || 0) + (Number(extraDays) || 0);
  const used = Number(usedDays) || 0;
  const remaining = totalAvailable - used;
  const st = getResolvedStatus(status, remaining);

  const pct = totalAvailable > 0 ? Math.min(100, (used / totalAvailable) * 100) : 0;

  const handleClick = (e) => {
    e.stopPropagation(); // evita que se dispare el click de la fase
    onActorClick?.(actor);
  };

  return (
    <button
      type="button"
      className={`actor-compact ${dense ? 'dense' : ''} actor-compact-${color}`}
      onClick={handleClick}
      title="Ver detalle del actor"
    >
      <div className="actor-compact-top">
        <div className="actor-compact-name">
          <i className={`fas ${icon}`} />
          <span className="text-truncate">{name}</span>
        </div>

        <span className={`actor-compact-status status-${st.color}`}>
          <i className={`fas ${st.icon}`} />
          {st.text}
        </span>
      </div>

      {!!taskDescription && !dense && (
        <div className="actor-compact-task text-truncate">
          <i className="fas fa-tasks" />
          <span>{taskDescription}</span>
        </div>
      )}

      <div className="actor-compact-metrics">
        <div className="m">
          <span className="k">Total</span>
          <span className="v">{totalAvailable}</span>
        </div>
        <div className="m">
          <span className="k">Usados</span>
          <span className="v">{used}</span>
        </div>
        <div className="m">
          <span className="k">Rest.</span>
          <span className={`v rem ${remaining < 0 ? 'neg' : remaining <= 3 ? 'warn' : 'pos'}`}>
            {remaining}
          </span>
        </div>
      </div>

      <div className="actor-compact-bar">
        <div className="track">
          <div className={`fill bg-${st.color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </button>
  );
};

const PhaseCard = ({ phase, onPhaseClick, onActorClick, isActive }) => {
  if (!phase) return null;

  const {
    title,
    responsible,
    status,
    totalDays = 0,
    usedDays = 0,
    extraDays = 0,
    startDate,
    endDate,
    parallelActors,
    daysContext,
    highlightClass, // <--- Recibimos la clase de resaltado
  } = phase;

  const totalAvailable = (Number(totalDays) || 0) + (Number(extraDays) || 0);
  const used = Number(usedDays) || 0;
  const remaining = totalAvailable - used;

  const st = getResolvedStatus(status, remaining);
  const isParallel = !!parallelActors?.primary && !!parallelActors?.secondary;

  let compactActors = [];
  if (isParallel) {
    compactActors = [
      { ...parallelActors.primary, _key: 'primary' },
      { ...parallelActors.secondary, _key: 'secondary' },
    ];
  } else {
    // single actor
    compactActors = [
      {
        _key: 'single',
        name:
          responsible === 'Curaduria'
            ? 'Curaduría'
            : responsible === 'Solicitante'
              ? 'Solicitante'
              : responsible || 'Responsable',
        icon:
          responsible === 'Curaduria'
            ? 'fa-building'
            : responsible === 'Solicitante'
              ? 'fa-user'
              : responsible === 'Mixto'
                ? 'fa-users'
                : 'fa-user-tie',
        color: responsible === 'Solicitante' ? 'info' : responsible === 'Mixto' ? 'purple' : 'primary',
        totalDays,
        usedDays,
        extraDays,
        status,
        taskDescription: null,
      },
    ];
  }

  const handlePhaseClick = () => onPhaseClick?.(phase);
  
  // --- APLICAMOS LA CLASE DE RESALTADO SI LA TARJETA ESTÁ ACTIVA ---
  const activeHighlightClass = isActive ? highlightClass : '';

  return (
    <div
      className={`phase-card-compact ${activeHighlightClass}`}
      role="button"
      tabIndex={0}
      onClick={handlePhaseClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handlePhaseClick();
      }}
      title="Ver detalle de la fase"
    >
      <div className="phase-card-compact-header">
        <div className="phase-title-row">
          <h5 className="phase-title-compact text-truncate" title={title}>
            {title}
          </h5>
          <span className={`phase-status-pill status-${st.color}`}>
            <i className={`fas ${st.icon}`} />
            {st.text}
          </span>
        </div>

        <div className="phase-sub-row">
          <ResponsiblePill responsible={responsible} />
          <span className="phase-date-pill" title="Rango de fechas">
            <i className="fas fa-calendar-alt" />
            {formatShortDate(startDate)} <span className="sep">→</span> {endDate ? formatShortDate(endDate) : 'En progreso'}
          </span>
        </div>

        {!!daysContext && (
          <div className="phase-context-compact" title="Contexto de distribución de días">
            <i className="fas fa-calculator" />
            <span className="text-truncate">
              {daysContext.totalCuraduria}d total · {daysContext.usedInPhase1}d F1 ·{' '}
              <strong>{daysContext.availableForPhase4}d</strong> para F4
            </span>
          </div>
        )}
      </div>

      <div className={`phase-actors-compact ${isParallel ? 'is-parallel' : 'is-single'}`}>
        {isParallel ? (
          <div className="phase-actors-stack">
            {compactActors.map((a) => (
              <ActorCompactRow
                key={a._key}
                actor={a}
                onActorClick={onActorClick}
                dense
              />
            ))}
          </div>
        ) : (
          <div className="phase-actors-grid one">
            {compactActors.map((a) => (
              <ActorCompactRow
                key={a._key}
                actor={a}
                onActorClick={onActorClick}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export const SidebarInfo = ({ manager, actions, onActivePhaseChange, activePhaseId }) => {
  const {
    processPhases,
    curaduriaDetails,
    canAddSuspension,
    canAddExtension,
    isDesisted,
    FUN0TYPETIME,
  } = manager || {};

  const { onAddTimeControl, onOpenScheduleModal } = actions || {};
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  useEffect(() => {
    if (!processPhases || processPhases.length === 0) return;

    const activeIndex = processPhases.findIndex((p) => ['ACTIVO', 'PAUSADO'].includes(p.status));
    const firstPendingIndex = processPhases.findIndex((p) => p.status === 'PENDIENTE');

    if (activeIndex !== -1) setCurrentPhaseIndex(activeIndex);
    else if (firstPendingIndex !== -1) setCurrentPhaseIndex(firstPendingIndex);
    else setCurrentPhaseIndex(processPhases.length - 1);
  }, [processPhases]);

  // --- NUEVO EFFECT: Notifica al padre cuando la fase activa cambia ---
  useEffect(() => {
    if (processPhases && processPhases.length > 0) {
      const activePhase = processPhases[currentPhaseIndex];
      if (activePhase) {
        onActivePhaseChange?.(activePhase.id);
      }
    }
  }, [currentPhaseIndex, processPhases, onActivePhaseChange]);

  const handlePhaseChange = (direction) => {
    setCurrentPhaseIndex((prev) =>
      Math.max(0, Math.min(prev + direction, (processPhases?.length || 1) - 1)),
    );
  };

  const showDebug = () => {
    const info = processPhases?.debugInfo;
    if (!info) return Swal.fire('No info', 'No hay información de debug disponible.', 'warning');

    const system = info.system || {};
    const cumplimiento = info.cumplimiento || {};
    const fechas = info.fechas || {};
    const totales = info.totales || {};

    const fmt = (d) => (d ? moment(d).format('YYYY-MM-DD') : '—');

    return MySwal.fire({
      title: 'Diagnóstico de Fases',
      width: 680,
      html: `
        <div style="text-align:left;font-size:0.85rem;">
          <div class="row mb-2">
            <div class="col-4">Hoy: <b>${escapeHtml(system.today || '—')}</b></div>
            <div class="col-8">Cumple?: <b>${cumplimiento.isCumple ? 'SÍ' : 'NO'}</b></div>
          </div>

          <h6 class="text-primary border-bottom pb-1 mt-2">Fechas clave</h6>
          <div class="row mb-1">
            <div class="col-4">LDF: ${escapeHtml(fmt(fechas.ldf))}</div>
            <div class="col-4">Acta 1: ${escapeHtml(fmt(fechas.acta1))}</div>
            <div class="col-4">Corr: ${escapeHtml(fmt(fechas.corr))}</div>
          </div>

          <h6 class="text-primary border-bottom pb-1 mt-2">Balance</h6>
          <div>Total Disponible: <b>${escapeHtml(totales.totalDisponible ?? 0)}</b></div>
          <div>Restante Fase 4: <b>${escapeHtml(totales.restanteFase4 ?? 0)}</b></div>
        </div>
      `,
      showCloseButton: true,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#5bc0de',
    });
  };

  const showDaysDetailsModal = () => {
    const phase1 = processPhases?.find((p) => p.id === 'phase1');
    const phase4 = processPhases?.find((p) => p.id === 'phase4');
    const context = phase4?.daysContext;

    const baseDays =
      (typeof FUN0TYPETIME === 'function' ? FUN0TYPETIME(manager?.currentItem?.type) : null) ?? 45;
    const suspDays = manager?.totalSuspensionDays || 0;
    const extDays = manager?.extension?.days || 0;

    const totalDays = baseDays + suspDays + extDays;
    const phase1Used = context?.usedInPhase1 ?? phase1?.usedDays ?? 0;
    const phase4Available = context?.availableForPhase4 ?? Math.max(0, totalDays - phase1Used);
    const phase4Used = phase4?.usedDays ?? 0;

    const totalUsed = phase1Used + phase4Used;
    const totalRemaining = Math.max(0, totalDays - totalUsed);

    return MySwal.fire({
      title: 'Control de Tiempos - Curaduría',
      width: 560,
      showCloseButton: true,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#5bc0de',
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
              <div class="info-card-title"><i class="fas fa-layer-group"></i> Composición</div>
              <div class="info-card-body">
                <div class="info-row"><span><i class="fas fa-calendar-day"></i> Base</span><strong>${escapeHtml(baseDays)}</strong></div>
                <div class="info-row ${suspDays ? '' : 'muted'}"><span><i class="fas fa-pause"></i> Suspensiones</span><strong class="${suspDays ? 'text-warning' : ''}">${escapeHtml(suspDays || 0)}</strong></div>
                <div class="info-row ${extDays ? '' : 'muted'}"><span><i class="fas fa-clock"></i> Prórroga</span><strong class="${extDays ? 'text-info' : ''}">${escapeHtml(extDays || 0)}</strong></div>
                <div class="info-row total"><span>Total</span><strong>${escapeHtml(totalDays)}</strong></div>
              </div>
            </div>

            <div class="info-card">
              <div class="info-card-title"><i class="fas fa-tasks"></i> Distribución</div>
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
                  <i class="fas fa-arrow-down"></i>
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

  const openActorDetailModal = (actor, phase) => {
    if (!actor) return;

    const totalAvailable = (Number(actor.totalDays) || 0) + (Number(actor.extraDays) || 0);
    const used = Number(actor.usedDays) || 0;
    const remaining = totalAvailable - used;
    const st = getResolvedStatus(actor.status, remaining);

    const phaseTitle = phase?.title ? escapeHtml(phase.title) : '—';

    return MySwal.fire({
      title: 'Detalle del Actor',
      width: 560,
      showCloseButton: true,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#5bc0de',
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
                <i class="fas ${escapeHtml(actor.icon || 'fa-user')}"></i>
                <span>${escapeHtml(actor.name || 'Actor')}</span>
              </div>
              <div class="pdm-sub">Fase: <b>${phaseTitle}</b></div>
            </div>
            <div class="pdm-badges">
              <span class="pdm-pill status-${escapeHtml(st.color)}">
                <i class="fas ${escapeHtml(st.icon)}"></i> ${escapeHtml(st.text)}
              </span>
            </div>
          </div>

          ${actor.taskDescription ? `
            <div class="pdm-block">
              <div class="pdm-block-title"><i class="fas fa-tasks"></i> Actividad</div>
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

  const openPhaseDetailModal = (phase) => {
    if (!phase) return;

    const totalAvailable = (Number(phase.totalDays) || 0) + (Number(phase.extraDays) || 0);
    const used = Number(phase.usedDays) || 0;
    const remaining = totalAvailable - used;
    const st = getResolvedStatus(phase.status, remaining);

    const respCfg = getResponsibleCfg(phase.responsible);

    const isParallel = !!phase.parallelActors?.primary && !!phase.parallelActors?.secondary;
    const actorsForModal = isParallel
      ? [
          { ...phase.parallelActors.primary, _key: 'p' },
          { ...phase.parallelActors.secondary, _key: 's' },
        ]
      : [];

    return MySwal.fire({
      title: 'Detalle de la Fase',
      width: 720,
      showCloseButton: true,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#5bc0de',
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
                <i class="fas fa-layer-group"></i>
                <span>${escapeHtml(phase.title || 'Fase')}</span>
              </div>
              <div class="pdm-sub">
                Responsable:
                <span class="pdm-pill phase-pill-${escapeHtml(respCfg.color)}">
                  <i class="fas ${escapeHtml(respCfg.icon)}"></i> ${escapeHtml(respCfg.text)}
                </span>
              </div>
            </div>
            <div class="pdm-badges">
              <span class="pdm-pill status-${escapeHtml(st.color)}">
                <i class="fas ${escapeHtml(st.icon)}"></i> ${escapeHtml(st.text)}
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
              <div class="v">${escapeHtml(phase.endDate ? formatShortDate(phase.endDate) : 'En progreso')}</div>
            </div>
            <div class="pdm-card">
              <div class="k">Ejecución</div>
              <div class="v">${totalAvailable > 0 ? escapeHtml(Math.min(100, Math.round((used / totalAvailable) * 100))) : 0}%</div>
            </div>
          </div>

          ${phase.daysContext ? `
            <div class="pdm-block">
              <div class="pdm-block-title"><i class="fas fa-calculator"></i> Contexto (F4)</div>
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
              <div class="pdm-block-title"><i class="fas fa-users"></i> Actores</div>
              <div class="pdm-actors">
                ${actorsForModal
                  .map((a) => {
                    const t = (Number(a.totalDays) || 0) + (Number(a.extraDays) || 0);
                    const u = Number(a.usedDays) || 0;
                    const r = t - u;
                    const ast = getResolvedStatus(a.status, r);
                    return `
                      <div class="pdm-actor">
                        <div class="pdm-actor-top">
                          <div class="pdm-actor-name">
                            <i class="fas ${escapeHtml(a.icon || 'fa-user')}"></i>
                            <span>${escapeHtml(a.name || 'Actor')}</span>
                          </div>
                          <span class="pdm-pill status-${escapeHtml(ast.color)}">
                            <i class="fas ${escapeHtml(ast.icon)}"></i> ${escapeHtml(ast.text)}
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

  if (!curaduriaDetails || !processPhases || processPhases.length === 0) {
    return (
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <i className="fas fa-chart-line" />
          <span>Estado del Proceso</span>
        </div>
        <div className="sidebar-card-body">
          <div className="text-center text-muted">
            <i className="fas fa-spinner fa-spin me-2" />
            Calculando...
          </div>
        </div>
      </div>
    );
  }

  const currentPhase = processPhases[currentPhaseIndex];

  return (
    <div className="sidebar-card phases-card">
      <div className="sidebar-card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0" style={{ fontSize: '0.85rem' }}>
          <i className="fas fa-tasks me-2" />
          Fases del Proceso
        </h6>

        <div className="d-flex align-items-center">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-0 text-muted"
            onClick={showDebug}
            title="Ver diagnóstico"
            style={{ padding: '0 6px' }}
          >
            <i className="fas fa-bug" />
          </button>

          <div className="phase-nav ms-1">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => handlePhaseChange(-1)}
              disabled={currentPhaseIndex === 0}
              title="Fase anterior"
            >
              <i className="fas fa-chevron-left" />
            </button>

            <span className="phase-indicator">
              {currentPhaseIndex + 1}/{processPhases.length}
            </span>

            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => handlePhaseChange(1)}
              disabled={currentPhaseIndex === processPhases.length - 1}
              title="Fase siguiente"
            >
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      <div className="sidebar-card-body phases-body">
        <PhaseCard
          phase={currentPhase}
          onPhaseClick={openPhaseDetailModal}
          onActorClick={(actor) => openActorDetailModal(actor, currentPhase)}
          // --- NUEVO: Indicamos que esta tarjeta es la activa ---
          isActive={true}
        />
      </div>

      <div className="sidebar-card-footer sidebar-card-footer-grid">
        <button type="button" className="btn-footer-action" onClick={showDaysDetailsModal}>
          <i className="fas fa-chart-pie" />
          <span>Desglose</span>
        </button>

        <button type="button" className="btn-footer-action" onClick={onOpenScheduleModal}>
          <i className="fas fa-calendar-check" />
          <span>Programar</span>
        </button>

        {!isDesisted && canAddSuspension && (
          <button
            type="button"
            className="btn-footer-action action-suspension"
            onClick={() => onAddTimeControl?.('suspension')}
          >
            <i className="fas fa-pause" />
            <span>Suspensión</span>
          </button>
        )}

        {!isDesisted && canAddExtension && (
          <button
            type="button"
            className="btn-footer-action action-extension"
            onClick={() => onAddTimeControl?.('extension')}
          >
            <i className="fas fa-clock" />
            <span>Prórroga</span>
          </button>
        )}
      </div>
    </div>
  );
};