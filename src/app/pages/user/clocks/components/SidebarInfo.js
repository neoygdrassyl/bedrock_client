import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

const MySwal = withReactContent(Swal);

// --- COMPONENTE PARA UN ACTOR (REUTILIZABLE) ---
const ActorPanel = ({ actor, variant = 'default', onShowDetails }) => {
    const { name, icon, color, totalDays, usedDays, extraDays, status, taskDescription, daysBreakdown } = actor;
    const totalAvailable = totalDays + extraDays;
    const remainingDays = totalAvailable - usedDays;

    const statusMap = {
        PENDIENTE: { text: 'Pendiente', color: 'secondary', icon: 'fa-hourglass-start' },
        ACTIVO: { text: 'En Curso', color: 'primary', icon: 'fa-running' },
        PAUSADO: { text: 'Pausado', color: 'warning', icon: 'fa-pause-circle' },
        COMPLETADO: { text: 'Completado', color: 'success', icon: 'fa-check-circle' },
        ESPERANDO_NOTIFICACION: { text: 'Esperando Notificación', color: 'info', icon: 'fa-envelope' },
        VENCIDO: { text: 'Vencido', color: 'danger', icon: 'fa-exclamation-triangle' }
    };

    let currentStatus = statusMap[status] || statusMap.PENDIENTE;
    if (status === 'ACTIVO' && remainingDays < 0) {
        currentStatus = statusMap.VENCIDO;
    }

    const progressPercent = totalAvailable > 0 ? Math.min(100, (usedDays / totalAvailable) * 100) : 0;

    const panelClass = variant === 'secondary' ? 'secondary' : 
                       variant === 'single' ? 'single' : 'primary';

    return (
        <div className={`actor-panel ${panelClass}`}>
            <div className={`actor-header actor-header-${color}`}>
                <div className="actor-name">
                    <i className={`fas ${icon} me-2`}></i>
                    <span>{name}</span>
                </div>
                <span className={`actor-status-badge status-${currentStatus.color}`}>
                    <i className={`fas ${currentStatus.icon} me-1`}></i>
                    {currentStatus.text}
                </span>
            </div>

            {taskDescription && (
                <div className="actor-task">
                    <i className="fas fa-tasks me-1"></i>
                    {taskDescription}
                </div>
            )}

            <div className="actor-metrics">
                <div className="metric-row">
                    <span className="metric-label">
                        <i className="fas fa-calendar-alt me-1"></i>
                        Plazo Total
                    </span>
                    <span className="metric-value">
                        {totalAvailable} días
                        {daysBreakdown && (daysBreakdown.suspensions > 0 || daysBreakdown.extension > 0) && (
                            <span className="days-extra-badge ms-1">
                                +{daysBreakdown.suspensions + daysBreakdown.extension}
                            </span>
                        )}
                    </span>
                </div>
                <div className="metric-row">
                    <span className="metric-label">
                        <i className="fas fa-hourglass-half me-1"></i>
                        Días Usados
                    </span>
                    <span className="metric-value">{usedDays} días</span>
                </div>
                <div className="metric-row highlight">
                    <span className="metric-label">
                        <i className="fas fa-clock me-1"></i>
                        Días Restantes
                    </span>
                    <span className={`metric-value metric-remaining ${remainingDays < 0 ? 'negative' : remainingDays <= 3 ? 'warning' : 'positive'}`}>
                        {remainingDays} días
                    </span>
                </div>
            </div>

            <div className="actor-progress">
                <div className="progress-labels">
                    <span>0</span>
                    <span>{totalAvailable}</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                    <div
                        className={`progress-bar bg-${currentStatus.color}`}
                        role="progressbar"
                        style={{ width: `${progressPercent}%` }}
                        aria-valuenow={usedDays}
                        aria-valuemin="0"
                        aria-valuemax={totalAvailable}
                    ></div>
                </div>
                <div className="progress-indicator" style={{ left: `${progressPercent}%` }}>
                    <span className="indicator-value">{usedDays}</span>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PARA LA TARJETA DE FASE ---
const PhaseCard = ({ phase, onShowDetails }) => {
    const { title, responsible, status, totalDays, usedDays, extraDays, startDate, endDate, parallelActors, daysBreakdown, daysContext } = phase;

    const statusMap = {
        PENDIENTE: { text: 'Pendiente', color: 'secondary', icon: 'fa-hourglass-start' },
        ACTIVO: { text: 'En Curso', color: 'primary', icon: 'fa-running' },
        PAUSADO: { text: 'Pausado', color: 'warning', icon: 'fa-pause-circle' },
        COMPLETADO: { text: 'Completado', color: 'success', icon: 'fa-check-circle' },
        ESPERANDO_NOTIFICACION: { text: 'Esperando Notificación', color: 'info', icon: 'fa-envelope' },
        VENCIDO: { text: 'Vencido', color: 'danger', icon: 'fa-exclamation-triangle' }
    };

    const totalAvailable = totalDays + extraDays;
    const remainingDays = totalAvailable - usedDays;

    let currentStatus = statusMap[status] || statusMap.PENDIENTE;
    if (status === 'ACTIVO' && remainingDays < 0) {
        currentStatus = statusMap.VENCIDO;
    }

    const getResponsibleConfig = (resp) => {
        switch (resp) {
            case 'Curaduría':
                return { icon: 'fa-building', color: 'primary' };
            case 'Solicitante':
                return { icon: 'fa-user', color: 'info' };
            case 'Mixto':
                return { icon: 'fa-users', color: 'purple' };
            default:
                return { icon: 'fa-user-tie', color: 'secondary' };
        }
    };

    const responsibleConfig = getResponsibleConfig(responsible);

    if (parallelActors) {
        return (
            <div className="phase-card-content phase-card-modern">
                <h5 className="phase-title">{title}</h5>

                <div className="parallel-actors-container">
                    <ActorPanel 
                        actor={parallelActors.primary} 
                        variant="primary" 
                        onShowDetails={onShowDetails}
                    />
                    <div className="parallel-divider">
                        <div className="divider-line"></div>
                        <div className="divider-icon">
                            <i className="fas fa-arrows-alt-h"></i>
                        </div>
                        <div className="divider-line"></div>
                    </div>
                    <ActorPanel 
                        actor={parallelActors.secondary} 
                        variant="secondary"
                        onShowDetails={onShowDetails}
                    />
                </div>

                <div className="phase-timeline">
                    <div className="timeline-dates">
                        <div className="timeline-date start">
                            <i className="fas fa-play-circle"></i>
                            <span>{startDate ?  moment(startDate).format('DD MMM YY') : 'Sin iniciar'}</span>
                        </div>
                        <div className="timeline-connector"></div>
                        <div className="timeline-date end">
                            <i className="fas fa-flag-checkered"></i>
                            <span>{endDate ? moment(endDate).format('DD MMM YY') : 'En progreso'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const singleActor = {
        name: responsible,
        icon: responsibleConfig.icon,
        color: responsibleConfig.color,
        totalDays,
        usedDays,
        extraDays,
        status,
        taskDescription: null,
        daysBreakdown: daysBreakdown || null,
    };

    return (
        <div className="phase-card-content phase-card-modern">
            <h5 className="phase-title">{title}</h5>

            {daysContext && (
                <div className="phase-context-chip">
                    <span className="chip-icon"><i className="fas fa-calculator"></i></span>
                    <span className="chip-text">
                        {daysContext.totalCuraduria}d total − {daysContext.usedInPhase1}d Fase 1 = <strong>{daysContext.availableForPhase4}d</strong>
                    </span>
                </div>
            )}

            <ActorPanel 
                actor={singleActor} 
                variant="single"
                onShowDetails={onShowDetails}
            />

            <div className="phase-timeline">
                <div className="timeline-dates">
                    <div className="timeline-date start">
                        <i className="fas fa-play-circle"></i>
                        <span>{startDate ? moment(startDate).format('DD MMM YY') : 'Sin iniciar'}</span>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className="timeline-date end">
                        <i className="fas fa-flag-checkered"></i>
                        <span>{endDate ? moment(endDate).format('DD MMM YY') : 'En progreso'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const SidebarInfo = ({ manager, actions }) => {
    const { processPhases, curaduriaDetails, canAddSuspension, canAddExtension, isDesisted, 
            suspensionPreActa, suspensionPostActa, extension, FUN_0_TYPE_TIME, totalSuspensionDays } = manager;
    const { onAddTimeControl, onOpenScheduleModal } = actions;

    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

    useEffect(() => {
        if (processPhases && processPhases.length > 0) {
            const activeIndex = processPhases.findIndex(p => ['ACTIVO', 'PAUSADO'].includes(p.status));
            const firstPendingIndex = processPhases.findIndex(p => p.status === 'PENDIENTE');

            if (activeIndex !== -1) {
                setCurrentPhaseIndex(activeIndex);
            } else if (firstPendingIndex !== -1) {
                setCurrentPhaseIndex(firstPendingIndex);
            } else {
                setCurrentPhaseIndex(processPhases.length - 1);
            }
        }
    }, [processPhases]);

    const showDebug = () => {
        const info = processPhases.debugInfo;
        if (!info) return Swal.fire('No info', 'No hay información de debug disponible', 'warning');

        const formatBool = (b) => b ? '<span class="text-success">SÍ</span>' : '<span class="text-muted">NO</span>';
        const formatDate = (d) => d ? moment(d).format('YYYY-MM-DD') : '<span class="text-muted">-</span>';

        MySwal.fire({
            title: 'Diagnóstico de Fases',
            width: 650,
            html: `
                <div style="text-align: left; font-size: 0.85rem;">
                    <div class="row mb-2">
                        <div class="col-4">Hoy: <b>${info.system.today}</b></div>
                        <div class="col-8">Cumple?: ${formatBool(info.cumplimiento.isCumple)}</div>
                    </div>

                    <h6 class="text-primary border-bottom pb-1 mt-2">1. Análisis Fase 4 (Viabilidad)</h6>
                    <div class="row mb-1">
                        <div class="col-6">Trigger Source: <b>${info.fase4Debug.source}</b></div>
                        <div class="col-6">Trigger Date: ${formatDate(info.fase4Debug.trigger)}</div>
                        <div class="col-6">End Point: ${formatDate(info.fase4Debug.endPoint)}</div>
                        <div class="col-6">Status: <b>${info.fase4Debug.status}</b></div>
                    </div>
                    <div class="alert alert-warning p-1 mb-2">
                        Días Usados Fase 4: <b>${info.fase4Debug.usedCalculated}</b>
                    </div>

                    <h6 class="text-primary border-bottom pb-1 mt-3">2. Fechas Clave</h6>
                    <div class="row mb-1">
                        <div class="col-4">LDF: ${formatDate(info.fechas.ldf)}</div>
                        <div class="col-4">Acta 1: ${formatDate(info.fechas.acta1)}</div>
                        <div class="col-4">Corr: ${formatDate(info.fechas.corr)}</div>
                    </div>

                    <h6 class="text-primary border-bottom pb-1 mt-2">3. Balance General</h6>
                    <div>Total Disp: <b>${info.totales.totalDisponible}</b> | Usados Fase 1: <b>${info.calculoFase1.usados}</b></div>
                    <div>Disponible Fase 4: <b>${info.totales.restanteFase4}</b></div>
                    
                    <div class="mt-2 small text-muted text-break">
                        Texto Acta: "${info.cumplimiento.text || ''}"
                    </div>
                </div>
            `
        });
    };

    const showDaysDetailsModal = () => {
        const phase1 = processPhases?.find(p => p.id === 'phase1');
        const phase4 = processPhases?.find(p => p.id === 'phase4');
        const context = phase4?.daysContext;

        // --- CORRECCIÓN INICIA AQUÍ ---
        // 1. Usar los valores correctos directamente desde el manager.
        const baseDays = FUN_0_TYPE_TIME[manager.currentItem.type] ?? 45;
        const suspDays = manager.totalSuspensionDays || 0;
        const extDays = manager.extension.days || 0;
        // --- FIN CORRECCIÓN ---

        const totalDays = baseDays + suspDays + extDays;
        
        const phase1Used = context?.usedInPhase1 || phase1?.usedDays || 0;
        const phase4Available = context?.availableForPhase4 || (totalDays - phase1Used);
        const phase4Used = phase4?.usedDays || 0;
        const totalUsed = phase1Used + phase4Used;
        const totalRemaining = Math.max(0, totalDays - totalUsed);

        const pctPhase1 = totalDays > 0 ? (phase1Used / totalDays) * 100 : 0;
        const pctPhase4 = totalDays > 0 ? (phase4Used / totalDays) * 100 : 0;
        const pctRemaining = totalDays > 0 ? (totalRemaining / totalDays) * 100 : 0;

        MySwal.fire({
            title: 'Control de Tiempos - Curaduría',
            html: `
                <div class="days-modal-content">
                    <div class="days-summary-row">
                        <div class="summary-item">
                            <span class="summary-value">${totalDays}</span>
                            <span class="summary-label">Total</span>
                        </div>
                        <div class="summary-item used">
                            <span class="summary-value">${totalUsed}</span>
                            <span class="summary-label">Usados</span>
                        </div>
                        <div class="summary-item remaining">
                            <span class="summary-value">${totalRemaining}</span>
                            <span class="summary-label">Restantes</span>
                        </div>
                    </div>

                    <div class="days-progress-section">
                        <div class="progress-bar-container">
                            <div class="progress-segment phase1" style="width: ${pctPhase1}%" title="Fase 1: ${phase1Used} días"></div>
                            <div class="progress-segment phase4" style="width: ${pctPhase4}%" title="Fase 4: ${phase4Used} días"></div>
                            <div class="progress-segment available" style="width: ${pctRemaining}%" title="Disponible: ${totalRemaining} días"></div>
                        </div>
                        <div class="progress-legend">
                            <span class="legend-item"><span class="dot phase1"></span>Fase 1 (${phase1Used}d)</span>
                            <span class="legend-item"><span class="dot phase4"></span>Fase 4 (${phase4Used}d)</span>
                            <span class="legend-item"><span class="dot available"></span>Disponible (${totalRemaining}d)</span>
                        </div>
                    </div>

                    <div class="days-info-grid">
                        <div class="info-card">
                            <div class="info-card-title">
                                <i class="fas fa-layer-group"></i>
                                Composición del Plazo
                            </div>
                            <div class="info-card-body">
                                <div class="info-row">
                                    <span><i class="fas fa-calendar-day"></i> Días base</span>
                                    <strong>${baseDays}</strong>
                                </div>
                                <div class="info-row ${suspDays > 0 ? '' : 'muted'}">
                                    <span><i class="fas fa-pause"></i> Suspensiones</span>
                                    <strong class="${suspDays > 0 ? 'text-warning' : ''}">${suspDays > 0 ? '+' + suspDays : '—'}</strong>
                                </div>
                                <div class="info-row ${extDays > 0 ? '' : 'muted'}">
                                    <span><i class="fas fa-clock"></i> Prórroga</span>
                                    <strong class="${extDays > 0 ? 'text-info' : ''}">${extDays > 0 ? '+' + extDays : '—'}</strong>
                                </div>
                                <div class="info-row total">
                                    <span>Total disponible</span>
                                    <strong>${totalDays} días</strong>
                                </div>
                            </div>
                        </div>

                        <div class="info-card">
                            <div class="info-card-title">
                                <i class="fas fa-tasks"></i>
                                Distribución por Fases
                            </div>
                            <div class="info-card-body">
                                <div class="phase-detail">
                                    <div class="phase-header">
                                        <span class="phase-label">Fase 1: Estudio</span>
                                        <span class="phase-count">${phase1Used} / ${totalDays}</span>
                                    </div>
                                    <div class="phase-mini-bar">
                                        <div class="phase-mini-fill phase1" style="width: ${totalDays > 0 ? (phase1Used / totalDays) * 100 : 0}%"></div>
                                    </div>
                                </div>
                                
                                <div class="phase-arrow">
                                    <i class="fas fa-arrow-down"></i>
                                    <span>${phase4Available} días pasan a Fase 4</span>
                                </div>

                                <div class="phase-detail">
                                    <div class="phase-header">
                                        <span class="phase-label">Fase 4: Viabilidad</span>
                                        <span class="phase-count">${phase4Used} / ${phase4Available}</span>
                                    </div>
                                    <div class="phase-mini-bar">
                                        <div class="phase-mini-fill phase4" style="width: ${phase4Available > 0 ?  (phase4Used / phase4Available) * 100 : 0}%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            width: 560,
            showCloseButton: true,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#5bc0de',
            customClass: {
                popup: 'days-modal-popup',
                title: 'days-modal-title',
                htmlContainer: 'days-modal-container',
                confirmButton: 'days-modal-btn'
            }
        });
    };

    if (! curaduriaDetails || !processPhases || processPhases.length === 0) {
        return (
            <div className="sidebar-card">
                <div className="sidebar-card-header"><i className="fas fa-chart-line"></i><span>Estado del Proceso</span></div>
                <div className="sidebar-card-body"><div className="text-center text-muted"><i className="fas fa-spinner fa-spin me-2"></i>Calculando...</div></div>
            </div>
        );
    }

    const handlePhaseChange = (direction) => {
        setCurrentPhaseIndex(prev => Math.max(0, Math.min(prev + direction, processPhases.length - 1)));
    };

    const currentPhase = processPhases[currentPhaseIndex];

    return (
        <div className="sidebar-card">
            <div className="sidebar-card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0" style={{ fontSize: '0.9rem' }}>
                    <i className="fas fa-tasks me-2"></i>
                    Fases del Proceso
                </h6>
                
                <div className="d-flex align-items-center">
                    <button 
                        className="btn btn-sm btn-outline-secondary border-0 text-muted" 
                        onClick={showDebug}
                        title="Ver diagnóstico de cálculo"
                        style={{ padding: '0 5px' }}
                    >
                        <i className="fas fa-bug"></i>
                    </button>

                    <div className="phase-nav">
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handlePhaseChange(-1)}
                            disabled={currentPhaseIndex === 0}
                            title="Fase anterior"
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <span className="phase-indicator">
                            {currentPhaseIndex + 1} / {processPhases.length}
                        </span>
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handlePhaseChange(1)}
                            disabled={currentPhaseIndex === processPhases.length - 1}
                            title="Fase siguiente"
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="sidebar-card-body">
                <PhaseCard 
                    phase={currentPhase} 
                    onShowDetails={showDaysDetailsModal}
                />
            </div>

            <div className="sidebar-card-footer sidebar-card-footer-grid">
                <button className="btn-footer-action" onClick={() => showDaysDetailsModal()}>
                    <i className="fas fa-chart-pie"></i>
                    <span>Desglose</span>
                </button>
                <button className="btn-footer-action" onClick={onOpenScheduleModal}>
                    <i className="fas fa-calendar-check"></i>
                    <span>Programar</span>
                </button>

                {!isDesisted && canAddSuspension && (
                    <button type="button" className="btn-footer-action action-suspension" onClick={() => onAddTimeControl('suspension')}>
                        <i className="fas fa-pause"></i>
                        <span>Suspensión</span>
                    </button>
                )}
                {!isDesisted && canAddExtension && (
                    <button type="button" className="btn-footer-action action-extension" onClick={() => onAddTimeControl('extension')}>
                        <i className="fas fa-clock"></i>
                        <span>Prórroga</span>
                    </button>
                )}
            </div>
        </div>
    );
};