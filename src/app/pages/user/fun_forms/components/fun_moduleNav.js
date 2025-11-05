import React, { Component } from 'react';
import { MDBBadge, MDBTooltip } from 'mdb-react-ui-kit';
import { formsParser1 } from '../../../../components/customClasses/typeParse';
import { regexChecker_isOA_2 } from '../../../../components/customClasses/typeParse';
import './fun_moduleNav_enhanced.css';

class FUN_MODULE_NAV extends Component {
    constructor(props) {
        super(props);
        this.state = {
            internalCollapsedState: false
        };
    }

    toggleSidebar = () => {
        const newState = !this.state.internalCollapsedState;
        this.setState({
            internalCollapsedState: newState
        });
        // Notify parent component if toggleSidebar prop is provided
        if (this.props.toggleSidebar) {
            this.props.toggleSidebar(newState);
        }
    };

    render() {
        const { translation, currentItem, currentVersion, FROM } = this.props;
        const { internalCollapsedState } = this.state;
        const isCollapsed = internalCollapsedState;

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

        // Definir grupos de navegación con colores
        const navGroups = [
            {
                id: 'actions',
                color: 'info',
                items: [
                    { id: 'general', icon: 'far fa-folder-open', label: 'DETALLES', from: 'general' },
                    { id: 'clock', icon: 'far fa-clock', label: 'TIEMPOS', from: 'clock' },
                    { id: 'archive', icon: 'fas fa-archive', label: 'DOCUMENTOS', from: 'archive', color: 'secondary' }
                ]
            }
        ];

        // Agregar grupo de edición si el estado lo permite
        if (currentItem.state != 101 && currentItem.state <= 200) {
            navGroups.push({
                id: 'edition',
                color: 'secondary',
                items: [
                    { id: 'edit', icon: 'far fa-folder-open', label: 'ACTUALIZAR', from: 'edit' },
                    { id: 'check', icon: 'far fa-check-square', label: 'CHECKEO', from: 'check', color: 'warning' }
                ]
            });

            // Grupo de evaluación con color warning
            const evaluationItems = [];

            if (!isPH) {
                if (!isOA && rules[0] != 1) {
                    evaluationItems.push({ 
                        id: 'alert', 
                        icon: 'fas fa-sign', 
                        label: 'PUBLICIDAD', 
                        from: 'alert',
                        badge: this.props.pqrsxfun?.length ? 'PQRS' : null
                    });
                }

                evaluationItems.push({ id: 'record_law', icon: 'fas fa-balance-scale', label: 'INF. JURÍDICO', from: 'record_law' });

                if (!isOA) {
                    evaluationItems.push({ id: 'record_arc', icon: 'far fa-building', label: 'INF. ARQ.', from: 'record_arc' });
                    
                    if (rules[1] != 1) {
                        evaluationItems.push({ id: 'record_eng', icon: 'fas fa-cogs', label: 'INF. ESTRUCT.', from: 'record_eng' });
                    }

                    evaluationItems.push({ id: 'record_review', icon: 'fas fa-file-contract', label: 'ACTA', from: 'record_review' });
                }
            } else {
                evaluationItems.push({ id: 'record_ph', icon: 'fas fa-pencil-ruler', label: 'INFORME P.H.', from: 'record_ph' });
            }

            evaluationItems.push({ id: 'expedition', icon: 'far fa-file-alt', label: 'EXPEDICIÓN', from: 'expedition' });

            if (evaluationItems.length > 0) {
                navGroups.push({
                    id: 'evaluation',
                    color: 'warning',
                    items: evaluationItems
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

                        {/* Scrollable container for buttons */}
                        <div className="fun-nav-buttons-container">
                            {/* Botón de cerrar */}
                            <div className="fun-nav-section">
                                <MDBTooltip 
                                    tag="div" 
                                    title={!isCollapsed ? '' : 'Cerrar'}
                                    placement="right"
                                >
                                    <button
                                        onClick={() => this.props.NAVIGATION(currentItem, "close", FROM)}
                                        className={`fun-nav-item btn-close-module`}
                                    >
                                        <i className="fas fa-times-circle"></i>
                                        {!isCollapsed && <span className="fun-nav-label">CERRAR</span>}
                                    </button>
                                </MDBTooltip>
                            </div>

                            {/* Grupos de navegación */}
                            {navGroups.map(group => (
                                <div key={group.id} className="fun-nav-section">
                                    {group.items.map(item => {
                                        const itemColor = item.color || group.color;
                                        const isActive = FROM === item.from;
                                        
                                        return (
                                            <MDBTooltip 
                                                key={item.id}
                                                tag="div" 
                                                title={!isCollapsed ? '' : item.label}
                                                placement="right"
                                            >
                                                <button
                                                    onClick={() => FROM !== item.from && this.props.NAVIGATION(currentItem, item.id, FROM)}
                                                    className={`fun-nav-item ${isActive ? 'active' : ''} btn-${itemColor}`}
                                                    disabled={isActive}
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
                                            </MDBTooltip>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export default FUN_MODULE_NAV;