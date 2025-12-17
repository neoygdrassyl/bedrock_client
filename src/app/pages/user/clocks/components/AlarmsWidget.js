import React, { useState, useMemo } from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- Componente para una fila de la tabla en el modal ---
const AlarmTableRow = ({ alarm }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        if (alarm.suggestion && alarm.suggestion.length > 80) {
            setExpanded(!expanded);
        }
    };

    let statusText, statusClass;
    if (alarm.remainingDays < 0) {
        statusText = `Vencido por ${Math.abs(alarm.remainingDays)} día(s)`;
        statusClass = 'text-danger';
    } else if (alarm.remainingDays === 0) {
        statusText = 'Vence Hoy';
        statusClass = 'text-danger';
    } else {
        statusText = `Vence en ${alarm.remainingDays} día(s)`;
        statusClass = 'text-warning';
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
            <td>{alarm.limitDate}</td>
            <td onClick={toggleExpand} style={{ cursor: isExpandable ? 'pointer' : 'default', maxWidth: '300px' }}>
                <span className="d-inline-block text-truncate" style={{ maxWidth: expanded ? 'none' : '250px' }}>
                    {suggestionText}
                </span>
                {isExpandable && !expanded && <small className="text-primary ms-1">(ver más)</small>}
            </td>
        </tr>
    );
};

// --- Componente para la vista previa (tarjeta pequeña) ---
const AlarmPreviewCard = ({ alarm }) => {
    const { eventName, remainingDays, suggestion, severity } = alarm;
    let statusText, statusIcon, statusColor;

    if (remainingDays < 0) {
        statusText = `Vencido por ${Math.abs(remainingDays)}d`;
        statusIcon = 'fa-exclamation-circle';
        statusColor = 'text-danger';
    } else if (remainingDays === 0) {
        statusText = 'Vence Hoy';
        statusIcon = 'fa-calendar-times';
        statusColor = 'text-danger';
    } else {
        statusText = `Vence en ${remainingDays}d`;
        statusIcon = 'fa-hourglass-half';
        statusColor = 'text-warning';
    }

    return (
        <div className={`alarm-preview-card severity-${severity}`}>
            <div className="alarm-preview-header">
                <h6 className="alarm-preview-title">{eventName}</h6>
                <div className={`alarm-preview-status ${statusColor}`}>
                    <i className={`fas ${statusIcon} me-2`}></i>
                    <span>{statusText}</span>
                </div>
            </div>
            <p className="alarm-preview-suggestion">
                {suggestion || 'No hay sugerencia específica.'}
            </p>
        </div>
    );
};

// --- Componente principal del Widget ---
export const AlarmsWidget = ({ alarms, onClose }) => {
    
    const openExpandedModal = () => {
        MySwal.fire({
            html: <ExpandedAlarmsModal alarms={alarms} />,
            showCloseButton: true,
            showConfirmButton: false,
            width: '90vw',
            customClass: {
                popup: 'alarm-modal-popup',
                htmlContainer: 'alarm-modal-container',
            }
        });
    };

    return (
        <div className="alarms-widget-preview">
            <div className="widget-preview-header">
                <i className="fas fa-bell-on"></i>
                <h5>Alertas ({alarms.length})</h5>
                <div className="widget-preview-actions">
                    <button onClick={openExpandedModal} className="btn-expand" title="Ver todas las alertas">
                        <i className="fas fa-expand-alt me-1"></i> Expandir
                    </button>
                    <button onClick={onClose} className="btn-close-widget" title="Cerrar">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div className="widget-preview-body">
                {alarms.length > 0 ? (
                    alarms.map(alarm => <AlarmPreviewCard key={alarm.id} alarm={alarm} />)
                ) : (
                    <div className="widget-preview-empty">
                        <i className="fas fa-check-circle"></i>
                        <p>¡Todo en orden!</p>
                        <span>No hay alertas activas.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Componente para el Modal Expandido con Tabla ---
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
                valA = moment(a.limitDate, 'DD/MM/YYYY');
                valB = moment(b.limitDate, 'DD/MM/YYYY');
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

    const getSortIcon = (key) => {
        if (sort.key !== key) return <i className="fas fa-sort text-muted"></i>;
        if (sort.order === 'asc') return <i className="fas fa-sort-up"></i>;
        return <i className="fas fa-sort-down"></i>;
    };

    return (
        <div className="alarm-modal-content">
            <h4 className="alarm-modal-title">Detalle de Alertas ({alarms.length})</h4>
            <div className="alarm-modal-controls">
                <div className="alarm-filters">
                    <span>Filtrar por tipo:</span>
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Todos</button>
                    <button className={filter === 'legal' ? 'active' : ''} onClick={() => setFilter('legal')}>Legal</button>
                    <button className={filter === 'scheduled' ? 'active' : ''} onClick={() => setFilter('scheduled')}>Programado</button>
                    <button className={filter === 'process' ? 'active' : ''} onClick={() => setFilter('process')}>Proceso</button>
                </div>
            </div>
            <div className="alarm-modal-table-container">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th onClick={() => handleSort('eventName')}>
                                Evento / Proceso {getSortIcon('eventName')}
                            </th>
                            <th onClick={() => handleSort('remainingDays')}>
                                Detalle {getSortIcon('remainingDays')}
                            </th>
                            <th onClick={() => handleSort('limitDate')}>
                                Fecha Límite {getSortIcon('limitDate')}
                            </th>
                            <th>Sugerencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedAlarms.map(alarm => (
                            <AlarmTableRow key={alarm.id} alarm={alarm} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};