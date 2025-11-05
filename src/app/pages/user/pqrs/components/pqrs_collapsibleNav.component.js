import React, { Component } from 'react';
import { MDBTooltip } from 'mdb-react-ui-kit';
import './pqrs_collapsibleNav.css';

class PQRS_COLLAPSIBLE_NAV extends Component {
    constructor(props) {
        super(props);
        this.state = {
            internalIsOpen: props.isOpen !== undefined ? props.isOpen : true
        };
    }

    componentDidUpdate(prevProps) {
        // Sync with parent if controlled
        if (this.props.isOpen !== undefined && this.props.isOpen !== prevProps.isOpen) {
            this.setState({ internalIsOpen: this.props.isOpen });
        }
    }

    toggleSidebar = () => {
        const newState = !this.state.internalIsOpen;
        this.setState({ internalIsOpen: newState });
        
        // Notify parent if callback provided
        if (this.props.onToggle) {
            this.props.onToggle(newState);
        }
    };

    render() {
        const { translation, currentItem, activeSection } = this.props;
        const isOpen = this.props.isOpen !== undefined ? this.props.isOpen : this.state.internalIsOpen;

        // Define menu items with color groups
        const menuItems = [
            {
                id: 'limits',
                icon: 'fas fa-lock',
                name: 'Límites',
                color: '#dc3545', // red
                group: 'limits'
            },
            {
                id: 'metadata',
                icon: 'fas fa-cog',
                name: 'Metadatos de la Solicitud',
                color: '#28a745', // green
                group: 'metadata',
                highlighted: true
            },
            {
                id: 'times',
                icon: 'fas fa-clock',
                name: 'Tiempos',
                color: '#6f42c1', // purple
                group: 'times'
            },
            {
                id: 'files',
                icon: 'fas fa-folder',
                name: 'Archivos',
                color: '#fd7e14', // orange
                group: 'files',
                subtext: 'No hay archivos'
            },
            {
                id: 'actas',
                icon: 'fas fa-file-alt',
                name: 'Actas',
                color: '#007bff', // blue
                group: 'actas'
            }
        ];

        const renderMenuItem = (item) => {
            const isActive = activeSection === item.id;
            
            if (!isOpen) {
                // Collapsed state - show only icon with tooltip
                return (
                    <MDBTooltip 
                        key={item.id}
                        title={item.name}
                        placement="right"
                        wrapperProps={{ color: false, shadow: false }}
                    >
                        <div
                            className={`pqrs-sidebar-item collapsed ${isActive ? 'active' : ''}`}
                            style={{ borderLeftColor: item.color }}
                            onClick={() => this.props.onNavigate && this.props.onNavigate(item.id)}
                        >
                            <div className="pqrs-sidebar-icon" style={{ color: item.color }}>
                                <i className={item.icon}></i>
                            </div>
                        </div>
                    </MDBTooltip>
                );
            }

            // Expanded state - show icon + name
            return (
                <div
                    key={item.id}
                    className={`pqrs-sidebar-item expanded ${isActive ? 'active' : ''} ${item.highlighted ? 'highlighted' : ''}`}
                    style={{ borderLeftColor: item.color }}
                    onClick={() => this.props.onNavigate && this.props.onNavigate(item.id)}
                >
                    <div className="pqrs-sidebar-icon" style={{ color: item.color }}>
                        <i className={item.icon}></i>
                    </div>
                    <div className="pqrs-sidebar-content">
                        <div className="pqrs-sidebar-name">{item.name}</div>
                        {item.subtext && (
                            <div className="pqrs-sidebar-subtext">{item.subtext}</div>
                        )}
                    </div>
                </div>
            );
        };

        return (
            <div className={`pqrs-collapsible-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="pqrs-sidebar-toggle" onClick={this.toggleSidebar}>
                    <i className={isOpen ? 'fas fa-chevron-left' : 'fas fa-bars'}></i>
                </div>
                
                <div className="pqrs-sidebar-items">
                    {menuItems.map(item => renderMenuItem(item))}
                </div>

                {isOpen && (
                    <div className="pqrs-sidebar-footer">
                        <div className="pqrs-sidebar-numbered-section">
                            <div className="numbered-item">1. Identificación</div>
                            <div className="numbered-item">2. Temas</div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default PQRS_COLLAPSIBLE_NAV;
