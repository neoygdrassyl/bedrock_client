import React, { Component } from 'react';
import { MDBBadge, MDBTooltip } from 'mdb-react-ui-kit';
import { formsParser1 } from '../../../../components/customClasses/typeParse';
import { regexChecker_isOA_2 } from '../../../../components/customClasses/typeParse';
import './fun_moduleNav_enhanced.css';

class FUN_MODULE_NAV extends Component {
    constructor(props) {
        super(props);
        // Check if CSS variable is already set to determine initial state
        const currentWidth = getComputedStyle(document.documentElement).getPropertyValue('--fun-sidebar-width').trim();
        this.state = {
            isCollapsed: currentWidth === '60px'
        };
    }

    componentDidMount() {
        // Ensure CSS variable is set on mount if not already set
        const currentWidth = getComputedStyle(document.documentElement).getPropertyValue('--fun-sidebar-width').trim();
        if (!currentWidth || currentWidth === '') {
            document.documentElement.style.setProperty('--fun-sidebar-width', '240px');
        }
    }

    toggleSidebar = () => {
        this.setState(prevState => {
            const newCollapsedState = !prevState.isCollapsed;
            // Update CSS variable for dynamic modal positioning
            document.documentElement.style.setProperty(
                '--fun-sidebar-width',
                newCollapsedState ? '60px' : '240px'
            );
            return { isCollapsed: newCollapsedState };
        });
    };

    render() {
        const { translation, currentItem, currentVersion, FROM } = this.props;
        const { isCollapsed } = this.state;

        let _REGEX_MATCH_PH = (_string) => {
            let regex0 = /p\.\s+h/i;
            let regex1 = /p\.h/i;
            let regex2 = /PROPIEDAD\s+HORIZONTAL/i;
            let regex3 = /p\s+h/i;
            if (regex0.test(_string) || regex2.test(_string) || regex1.test(_string) || regex3.test(_string)) return true;
            return false;
        };

        let version = currentItem.version;
        let fun1 = currentItem.fun_1s[version - 1];
        let type = "";
        if (fun1) type = formsParser1(fun1);

        const isPH = _REGEX_MATCH_PH(type);
        const isOA = regexChecker_isOA_2(fun1);
        const rules = currentItem.rules ? currentItem.rules.split(';') : [];

        // Definir grupos de navegación con colores - REFACTORIZADO
        const navGroups = [];
        
        // Grupo 1: Detalles y Tiempos
        navGroups.push({
            id: 'details_time',
            color: 'info',
            items: [
                { id: 'general', icon: 'far fa-folder-open', label: 'DETALLES', from: 'general' },
                { id: 'clock', icon: 'far fa-clock', label: 'TIEMPOS', from: 'clock' }
            ]
        });

        // Grupo 2: Documentos y Edición (solo si el estado lo permite)
        const editGroup = [];
        editGroup.push({ id: 'archive', icon: 'fas fa-archive', label: 'DOCUMENTOS', from: 'archive' });
        
        if (currentItem.state != 101 && currentItem.state <= 200) {
            editGroup.push({ id: 'edit', icon: 'far fa-folder-open', label: 'ACTUALIZAR', from: 'edit' });
            editGroup.push({ id: 'check', icon: 'far fa-check-square', label: 'CHECKEO', from: 'check' });
            
            if (!isPH && !isOA && rules[0] != 1) {
                editGroup.push({ 
                    id: 'alert', 
                    icon: 'fas fa-sign', 
                    label: 'PUBLICIDAD', 
                    from: 'alert',
                    badge: this.props.pqrsxfun?.length ? 'PQRS' : null
                });
            }
        }
        
        if (editGroup.length > 0) {
            navGroups.push({
                id: 'documents_edition',
                color: 'secondary',
                items: editGroup
            });
        }

        // Grupo 3: Informes (solo si el estado lo permite)
        if (currentItem.state != 101 && currentItem.state <= 200) {
            const reportsItems = [];

            if (!isPH) {
                reportsItems.push({ id: 'record_law', icon: 'fas fa-balance-scale', label: 'INF. JURÍDICO', from: 'record_law' });

                if (!isOA) {
                    reportsItems.push({ id: 'record_arc', icon: 'far fa-building', label: 'INF. ARQ.', from: 'record_arc' });
                    
                    if (rules[1] != 1) {
                        reportsItems.push({ id: 'record_eng', icon: 'fas fa-cogs', label: 'INF. ESTRUCT.', from: 'record_eng' });
                    }
                }
            } else {
                reportsItems.push({ id: 'record_ph', icon: 'fas fa-pencil-ruler', label: 'INFORME P.H.', from: 'record_ph' });
            }

            if (reportsItems.length > 0) {
                navGroups.push({
                    id: 'reports',
                    color: 'warning',
                    items: reportsItems
                });
            }

            // Grupo 4: Acta y Expedición
            const finalItems = [];
            
            if (!isPH && !isOA) {
                finalItems.push({ id: 'record_review', icon: 'fas fa-file-contract', label: 'ACTA', from: 'record_review' });
            }
            
            finalItems.push({ id: 'expedition', icon: 'far fa-file-alt', label: 'EXPEDICIÓN', from: 'expedition' });

            if (finalItems.length > 0) {
                navGroups.push({
                    id: 'final_steps',
                    color: 'warning',
                    items: finalItems
                });
            }
        }

        return (
            <>
                {currentItem && (
                    <div className={`fun-nav-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                        {/* Toggle Button */}
                        <button 
                            className="fun-nav-toggle"
                            onClick={this.toggleSidebar}
                            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                        >
                            <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                        </button>

                        {/* Header con información fija */}
                        <div className="fun-nav-header">
                            {!isCollapsed && (
                                <>
                                    <div className="fun-nav-header-title">
                                        <i className="fas fa-folder-open"></i>
                                        <span className="ms-2">NAVEGACIÓN</span>
                                    </div>
                                    <div className="fun-nav-header-info">
                                        <div className="fun-nav-info-item">
                                            <small className="text-muted">ID Radicación:</small>
                                            <strong className="d-block">{currentItem.id_public}</strong>
                                        </div>
                                        {currentItem.state !== undefined && (
                                            <div className="fun-nav-info-item mt-2">
                                                <small className="text-muted">Estado:</small>
                                                <MDBBadge 
                                                    color={
                                                        currentItem.state >= 100 ? 'success' :
                                                        currentItem.state >= 50 ? 'info' :
                                                        currentItem.state >= 5 ? 'warning' :
                                                        currentItem.state < 0 ? 'danger' : 'secondary'
                                                    }
                                                    className="d-block mt-1"
                                                >
                                                    {currentItem.state >= 100 ? 'ARCHIVADO' :
                                                     currentItem.state >= 50 ? 'EXPEDICIÓN' :
                                                     currentItem.state >= 5 ? 'EVALUACIÓN' :
                                                     currentItem.state < 0 ? 'INCOMPLETO' : 'RADICACIÓN'}
                                                </MDBBadge>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Botón de cerrar */}
                        <div className="fun-nav-section">
                            <button
                                onClick={() => this.props.NAVIGATION(currentItem, "close", FROM)}
                                className={`fun-nav-item btn-close-module`}
                                data-tooltip="CERRAR"
                            >
                                <i className="fas fa-times-circle"></i>
                                {!isCollapsed && <span className="fun-nav-label">CERRAR</span>}
                            </button>
                        </div>

                        {/* Grupos de navegación */}
                        {navGroups.map(group => (
                            <div key={group.id} className="fun-nav-section">
                                {group.items.map(item => {
                                    const itemColor = item.color || group.color;
                                    const isActive = FROM === item.from;
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => FROM !== item.from && this.props.NAVIGATION(currentItem, item.id, FROM)}
                                            className={`fun-nav-item ${isActive ? 'active' : ''} btn-${itemColor}`}
                                            disabled={isActive}
                                            data-tooltip={item.label}
                                        >
                                            <i className={item.icon}></i>
                                            {!isCollapsed && (
                                                <span className="fun-nav-label">
                                                    {item.label}
                                                    {item.badge && (
                                                        <MDBBadge color="primary" className="ms-2">
                                                            {item.badge}
                                                        </MDBBadge>
                                                    )}
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

export default FUN_MODULE_NAV;