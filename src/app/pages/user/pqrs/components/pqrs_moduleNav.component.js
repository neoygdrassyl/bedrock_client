import React, { Component } from 'react';
import { MDBBadge } from 'mdb-react-ui-kit';
import './pqrs_moduleNav_enhanced.css';

class PQRS_MODULE_NAV extends Component {
    constructor(props) {
        super(props);
        // Check if CSS variable is already set to determine initial state
        const currentWidth = getComputedStyle(document.documentElement).getPropertyValue('--pqrs-sidebar-width').trim();
        this.state = {
            isCollapsed: currentWidth === '60px'
        };
    }

    componentDidMount() {
        // Ensure CSS variable is set on mount if not already set
        const currentWidth = getComputedStyle(document.documentElement).getPropertyValue('--pqrs-sidebar-width').trim();
        if (!currentWidth || currentWidth === '') {
            document.documentElement.style.setProperty('--pqrs-sidebar-width', '240px');
        }
    }

    toggleSidebar = () => {
        this.setState(prevState => {
            const newCollapsedState = !prevState.isCollapsed;
            // Update CSS variable for dynamic positioning
            document.documentElement.style.setProperty(
                '--pqrs-sidebar-width',
                newCollapsedState ? '60px' : '240px'
            );
            return { isCollapsed: newCollapsedState };
        });
    };
    render() {
        const { translation, currentItem, FROM } = this.props;
        const { isCollapsed } = this.state;
        const isAdmin = window.user.name_short === "Luis Parra";

        let _GET_WORKER_VAR = (worker_id) => {
            let _WORKERS = currentItem.pqrs_workers;
            for (var i = 0; i < _WORKERS.length; i++) {
                if ((_WORKERS[i].worker_id == worker_id) || window.user.roleId == 1) {
                    return {
                        id: _WORKERS[i].id,
                        id_master: currentItem.id,
                        id_public: currentItem.id_publico,
                    }
                }
            }
            return false
        }

        // Define navigation groups
        const navGroups = [];
        
        // Group 1: Close and Details
        navGroups.push({
            id: 'main_actions',
            color: 'info',
            items: [
                { id: 'general', icon: 'far fa-eye', label: 'DETALLES', from: 'general' }
            ]
        });

        // Group 2: Edit (only when status = 1)
        if (currentItem.status == 1) {
            navGroups.push({
                id: 'edit_actions',
                color: 'secondary',
                items: [
                    { id: 'editable', icon: 'fas fa-edit', label: 'EDITAR', from: 'editable' }
                ]
            });
        }

        // Group 3: Manage (only when status = 0 and user has permission)
        if (currentItem.status == 0 && 
            (window.user.roleId == 5 || window.user.roleId == 1 || isAdmin || window.user.roleId == 2)) {
            navGroups.push({
                id: 'manage_actions',
                color: 'success',
                items: [
                    { id: 'manage', icon: 'fas fa-cog', label: 'GESTIONAR', from: 'manage' }
                ]
            });
        }

        return (
            <>
                {currentItem && (
                    <div className={`pqrs-nav-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                        {/* Toggle Button */}
                        <button 
                            className="pqrs-nav-toggle"
                            onClick={this.toggleSidebar}
                            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                        >
                            <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                        </button>

                        {/* Header con información fija */}
                        <div className="pqrs-nav-header">
                            {!isCollapsed && (
                                <>
                                    <div className="pqrs-nav-header-title">
                                        <i className="fas fa-file-invoice"></i>
                                        <span className="ms-2">PQRS</span>
                                    </div>
                                    <div className="pqrs-nav-header-info">
                                        <div className="pqrs-nav-info-item">
                                            <small className="text-muted">ID Público:</small>
                                            <strong className="d-block">{currentItem.id_publico}</strong>
                                        </div>
                                        {currentItem.status !== undefined && (
                                            <div className="pqrs-nav-info-item mt-2">
                                                <small className="text-muted">Estado:</small>
                                                <MDBBadge 
                                                    color={currentItem.status === 0 ? 'warning' : 'success'}
                                                    className="d-block mt-1"
                                                >
                                                    {currentItem.status === 0 ? 'PENDIENTE' : 'COMPLETADO'}
                                                </MDBBadge>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Botón de cerrar */}
                        <div className="pqrs-nav-section">
                            <button
                                onClick={() => this.props.NAVIGATION(currentItem, "close", FROM)}
                                className="pqrs-nav-item btn-close-module"
                                data-tooltip="CERRAR"
                            >
                                <i className="fas fa-times-circle"></i>
                                {!isCollapsed && <span className="pqrs-nav-label">CERRAR</span>}
                            </button>
                        </div>

                        {/* Grupos de navegación */}
                        {navGroups.map(group => (
                            <div key={group.id} className="pqrs-nav-section">
                                {group.items.map(item => {
                                    const itemColor = item.color || group.color;
                                    const isActive = FROM === item.from;
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => FROM !== item.from && this.props.NAVIGATION(currentItem, item.id, FROM)}
                                            className={`pqrs-nav-item ${isActive ? 'active' : ''} btn-${itemColor}`}
                                            disabled={isActive}
                                            data-tooltip={item.label}
                                        >
                                            <i className={item.icon}></i>
                                            {!isCollapsed && (
                                                <span className="pqrs-nav-label">
                                                    {item.label}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    }
}

export default PQRS_MODULE_NAV;