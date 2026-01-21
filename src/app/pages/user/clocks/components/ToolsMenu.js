import React, { useState, useEffect, useRef } from 'react';

export const ToolsMenu = ({ onAction, canAddSuspension, canAddExtension, isDesisted }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAction = (action) => {
        setIsOpen(false);
        onAction(action);
    };

    const menuItems = [
        { id: 'schedule', label: 'Programar Tiempos', icon: 'fa-calendar-check', show: true },
        { id: 'breakdown', label: 'Desglose de Días', icon: 'fa-chart-pie', show: true },
        { id: 'gantt', label: 'Ver Gantt', icon: 'fa-project-diagram', show: true },
        { id: 'time-travel', label: 'Emulador de Fecha', icon: 'fa-user-clock', show: true },
        { id: 'calendar', label: 'Calendario', icon: 'fa-calendar-alt', show: true },
        { isDivider: true, show: !isDesisted && (canAddSuspension || canAddExtension) },
        { id: 'suspension', label: 'Añadir Suspensión', icon: 'fa-pause', show: !isDesisted && canAddSuspension, isDynamic: true },
        { id: 'extension', label: 'Añadir Prórroga', icon: 'fa-clock', show: !isDesisted && canAddExtension, isDynamic: true },
    ];

    return (
        <div className="tools-menu-container" ref={menuRef}>
            {isOpen && (
                <div className="tools-menu">
                    {menuItems.map((item, index) => {
                        if (!item.show) return null;
                        if (item.isDivider) return <div key={`divider-${index}`} className="tools-menu-divider"></div>;

                        return (
                            <button key={item.id} className="tools-menu-item" onClick={() => handleAction(item.id)}>
                                <i className={`fas ${item.icon}`}></i>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
            <button className="tools-fab" onClick={() => setIsOpen(!isOpen)} title="Herramientas">
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-toolbox'}`}></i>
            </button>
        </div>
    );
};