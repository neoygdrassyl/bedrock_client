import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Icon } from '@/shared/components/icon';
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog';
import { PendingList } from './PendingChecklist';
import { describePendingCount } from '../../workspace/expedientePendingStatus';

/**
 * Finished process (workspace/expedientePendingStatus): an alarm about an event without a
 * date is no longer a running term. It is shown as a calm "sin registro"; a date that was
 * registered late stays as the fact it is.
 */
const toRecordAlarm = (alarm) => (
    alarm.completedLate || alarm.alarmType === 'completed'
        ? alarm
        : { ...alarm, isRecordOnly: true, severity: 'warning' }
);

// --- Componente para una fila de la tabla en el modal ---
const AlarmTableRow = ({ alarm }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        if (alarm.suggestion && alarm.suggestion.length > 80) {
            setExpanded(!expanded);
        }
    };

    let statusText, statusClass;
    
    if (alarm.isRecordOnly) {
        statusText = 'Sin registro';
        statusClass = 'text-warning';
    }
    // --- LÓGICA PARA ACTIVIDADES BINARIAS ---
    else if (alarm.isBinaryActivity) {
        statusText = alarm.statusText;
        if (alarm.alarmType === 'overdue') {
            statusClass = 'text-danger';
        } else if (alarm.alarmType === 'completed') {
            statusClass = 'text-success';
        } else {
            statusClass = 'text-warning';
        }
    } 
    // --- LÓGICA ESTÁNDAR ---
    else {
        if (alarm.completedLate) {
            // Same wording as the events table for a date registered after its limit.
            statusText = `Retraso de ${Math.abs(alarm.remainingDays)} día(s)`;
            statusClass = 'text-danger';
        } else if (alarm.remainingDays < 0) {
            statusText = `Vencido por ${Math.abs(alarm.remainingDays)} día(s)`;
            statusClass = 'text-danger';
        } else if (alarm.remainingDays === 0) {
            statusText = 'Vence hoy';
            statusClass = 'text-danger';
        } else {
            statusText = `Vence en ${alarm.remainingDays} día(s)`;
            statusClass = 'text-warning';
        }
    }

    const suggestionText = alarm.suggestion || 'No hay sugerencia.';
    const isExpandable = suggestionText.length > 80;

    return (
        <tr>
            <td>
                <span className={`alarm-type-badge type-${alarm.type}`}>{alarm.typeLabel}</span>
            </td>
            <td>{alarm.eventName}</td>
            <td className={statusClass}>
                <strong>{statusText}</strong>
            </td>
            <td className="font-mono">{alarm.limitDate}</td>
            <td style={{ maxWidth: '300px' }}>
                <span className={expanded ? 'd-inline-block' : 'd-inline-block text-truncate'} style={{ maxWidth: expanded ? 'none' : '250px', verticalAlign: 'bottom' }}>
                    {suggestionText}
                </span>
                {isExpandable && (
                    <button type="button" className="alarm-suggestion-toggle" onClick={toggleExpand} aria-expanded={expanded}>
                        {expanded ? 'ver menos' : 'ver más'}
                    </button>
                )}
            </td>
        </tr>
    );
};

// --- Componente para la vista previa (tarjeta pequeña) ---
const AlarmPreviewCard = ({ alarm }) => {
    const { eventName, suggestion, severity, type, typeLabel, isBinaryActivity, statusText, alarmType } = alarm;
    let displayStatusText, statusIcon, statusColor;

    if (alarm.isRecordOnly) {
        displayStatusText = 'Sin registro';
        statusIcon = 'Hourglass';
        statusColor = 'text-warning';
    }
    // --- LÓGICA PARA ACTIVIDADES BINARIAS ---
    else if (isBinaryActivity) {
        displayStatusText = statusText; // "Pendiente", "Vencida", "Completada"
        if (alarmType === 'overdue') {
            statusIcon = 'XCircle';
            statusColor = 'text-danger';
        } else if (alarmType === 'completed') {
            statusIcon = 'CheckCircle';
            statusColor = 'text-success';
        } else {
            statusIcon = 'Circle';
            statusColor = 'text-warning';
        }
    } 
    // --- LÓGICA ESTÁNDAR ---
    else {
        if (alarm.completedLate) {
            displayStatusText = `Retraso de ${Math.abs(alarm.remainingDays)} día(s)`;
            statusIcon = 'AlertCircle';
            statusColor = 'text-danger';
        } else if (alarm.remainingDays < 0) {
            displayStatusText = `Vencido por ${Math.abs(alarm.remainingDays)} día(s)`;
            statusIcon = 'AlertCircle';
            statusColor = 'text-danger';
        } else if (alarm.remainingDays === 0) {
            displayStatusText = 'Vence hoy';
            statusIcon = 'CalendarX';
            statusColor = 'text-danger';
        } else {
            displayStatusText = `Vence en ${alarm.remainingDays} día(s)`;
            statusIcon = 'Hourglass';
            statusColor = 'text-warning';
        }
    }

    // NUEVO: Clases y estilos específicos por tipo
    const cardTypeClass = type === 'legal' ? 'alarm-card-legal' : 'alarm-card-scheduled';
    const typeBadgeClass = type === 'legal' ? 'type-badge-legal' : 'type-badge-scheduled';
    const typeIcon = type === 'legal' ? 'Gavel' : 'CalendarCheck';

    return (
        <div className={`alarm-preview-card severity-${severity} ${cardTypeClass}`}>
            <div className="alarm-preview-header">
                <div className="d-flex align-items-center gap-2">
                    <span className={`alarm-type-badge-small ${typeBadgeClass}`} title={`Alerta ${typeLabel || type}`}>
                        <Icon name={typeIcon} size={16} aria-hidden="true" />
                        <span className="sr-only">Alerta {typeLabel || type}: </span>
                    </span>
                    <h6 className="alarm-preview-title mb-0">{eventName}</h6>
                </div>
                <div className={`alarm-preview-status ${statusColor}`}>
                    <Icon name={statusIcon} size={16} className="me-1" />
                    <span>{displayStatusText}</span>
                </div>
            </div>
            <p className="alarm-preview-suggestion">
                {alarm.isRecordOnly
                    ? <>El proceso ya finalizó; el evento quedó sin fecha. Límite legal <span className="font-mono">{alarm.limitDate}</span>.</>
                    : (suggestion || 'No hay sugerencia específica.')}
            </p>
        </div>
    );
};

// --- Componente principal del Widget ACTUALIZADO ---
export const AlarmsWidget = ({ alarms, onClose, pending, onGoToEvent }) => {
    const [showExpanded, setShowExpanded] = useState(false);
    const isPending = Boolean(pending?.pending);
    const isFinished = Boolean(pending?.finished);

    // Finished process: the pending records lead, counted once; the remaining alarms follow.
    const shownAlarms = useMemo(() => {
        if (!isPending) return isFinished ? alarms.map(toRecordAlarm) : alarms;
        const pendingStates = new Set(pending.items.map((item) => String(item.state)));
        return alarms.filter((alarm) => !pendingStates.has(String(alarm.state))).map(toRecordAlarm);
    }, [alarms, isFinished, isPending, pending]);
    const tableAlarms = useMemo(() => (isFinished ? alarms.map(toRecordAlarm) : alarms), [alarms, isFinished]);
    const title = isPending ? `Pendientes (${pending.count})` : `Alertas (${alarms.length})`;

    return (
        <>
        <div
            className="alarms-widget-preview"
            role="region"
            aria-label={isPending ? `Pendientes: ${describePendingCount(pending.count)}` : `Alertas de tiempos: ${alarms.length}`}
            data-pending={isPending ? 'true' : undefined}
        >
            <div className="widget-preview-header">
                <Icon name={isPending ? 'Hourglass' : 'bell-on'} size={16} aria-hidden="true" />
                <h5>{title}</h5>
                <div className="widget-preview-actions">
                    <button type="button" onClick={() => setShowExpanded(true)} className="btn-expand" title="Ver todas las alertas en una tabla">
                        <Icon name="expand-alt" size={16} className="me-1" aria-hidden="true" /> Ver tabla
                    </button>
                    <button type="button" onClick={onClose} className="btn-close-widget" title="Cerrar alertas" aria-label="Cerrar alertas">
                        <Icon name="times" size={16} aria-hidden="true" />
                    </button>
                </div>
            </div>
            <div className="widget-preview-body">
                {isPending ? (
                    <div className="widget-pending-block">
                        <p className="widget-pending-note">Proceso finalizado: no corre ningún término legal. Estos eventos quedaron sin fecha.</p>
                        {pending.items.length > 0
                            ? <PendingList items={pending.items} onGoToEvent={onGoToEvent} />
                            : <p className="widget-pending-note">Hay fases sin cerrar, pero ningún evento visible sin fecha las explica.</p>}
                        {shownAlarms.length > 0 ? <h6 className="widget-pending-heading">Otros registros del proceso</h6> : null}
                    </div>
                ) : null}
                {shownAlarms.length > 0 ? (
                    shownAlarms.map(alarm => <AlarmPreviewCard key={alarm.id} alarm={alarm} />)
                ) : isPending ? null : (
                    <div className="widget-preview-empty">
                        <Icon name="check-circle" size={16} />
                        <p>Sin alertas activas</p>
                        <span>Ningún evento está vencido ni próximo a vencer.</span>
                    </div>
                )}
            </div>
        </div>
        <Dialog open={showExpanded} onOpenChange={setShowExpanded}>
            <DialogContent
                overlayClassName="z-[10040]"
                className="alarm-modal-popup z-[10050]"
                style={{ maxWidth: '90vw', width: '90vw' }}
                aria-describedby={undefined}
            >
                <ExpandedAlarmsModal alarms={tableAlarms} />
            </DialogContent>
        </Dialog>
        </>
    );
};

// --- Componente para el Modal Expandido ACTUALIZADO ---
const ExpandedAlarmsModal = ({ alarms }) => {
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState({ key: 'remainingDays', order: 'asc' });

    const filteredAndSortedAlarms = useMemo(() => {
        let result = [...alarms];

        if (filter !== 'all') {
            result = result.filter(alarm => alarm.type === filter);
        }

        result.sort((a, b) => {
            let valA = a[sort.key];
            let valB = b[sort.key];
            
            if (sort.key === 'limitDate') {
                valA = dayjs(a.limitDate, 'DD/MM/YYYY');
                valB = dayjs(b.limitDate, 'DD/MM/YYYY');
            }
            
            if (valA < valB) return sort.order === 'asc' ? -1 : 1;
            if (valA > valB) return sort.order === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [alarms, filter, sort]);

    const handleSort = (key) => {
        setSort(prev => ({
            key,
            order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortState = (key) => (sort.key !== key ? 'none' : sort.order === 'asc' ? 'ascending' : 'descending');

    const getSortIcon = (key) => {
        if (sort.key !== key) return <Icon name="sort" size={16} className="text-muted" />;
        if (sort.order === 'asc') return <Icon name="sort-up" size={16} />;
        return <Icon name="sort-down" size={16} />;
    };

    return (
        <div className="alarm-modal-content">
            <DialogTitle className="alarm-modal-title">Detalle de alertas ({alarms.length})</DialogTitle>
            <div className="alarm-modal-controls">
                <div className="alarm-filters">
                    <span>Filtrar por tipo:</span>
                    <button type="button" aria-pressed={filter === 'all'} className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Todos</button>
                    <button type="button" aria-pressed={filter === 'legal'} className={filter === 'legal' ? 'active' : ''} onClick={() => setFilter('legal')}>Legal</button>
                    <button type="button" aria-pressed={filter === 'scheduled'} className={filter === 'scheduled' ? 'active' : ''} onClick={() => setFilter('scheduled')}>Programado</button>
                </div>
            </div>
            <div className="alarm-modal-table-container">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th aria-sort={sortState('eventName')}>
                                <button type="button" className="alarm-sort-btn" onClick={() => handleSort('eventName')}>
                                    Evento / proceso {getSortIcon('eventName')}
                                </button>
                            </th>
                            <th aria-sort={sortState('remainingDays')}>
                                <button type="button" className="alarm-sort-btn" onClick={() => handleSort('remainingDays')}>
                                    Detalle {getSortIcon('remainingDays')}
                                </button>
                            </th>
                            <th aria-sort={sortState('limitDate')}>
                                <button type="button" className="alarm-sort-btn" onClick={() => handleSort('limitDate')}>
                                    Fecha límite {getSortIcon('limitDate')}
                                </button>
                            </th>
                            <th>Sugerencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedAlarms.map(alarm => (
                            <AlarmTableRow key={alarm.id} alarm={alarm} />
                        ))}
                        {filteredAndSortedAlarms.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-muted">Sin alertas para este filtro.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};