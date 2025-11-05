import React, { Component } from 'react';
import { MDBTooltip } from 'mdb-react-ui-kit';
import './fun_collapsibleNav.css';

class FUN_COLLAPSIBLE_NAV extends Component {
    constructor(props) {
        super(props);
        this.state = {
            internalIsOpen: props.isOpen !== undefined ? props.isOpen : true
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.isOpen !== undefined && this.props.isOpen !== prevProps.isOpen) {
            this.setState({ internalIsOpen: this.props.isOpen });
        }
    }

    toggleSidebar = () => {
        const newState = !this.state.internalIsOpen;
        this.setState({ internalIsOpen: newState });
        
        if (this.props.onToggle) {
            this.props.onToggle(newState);
        }
    };

    render() {
        const { translation, currentItem, currentVersion, FROM, activeSection } = this.props;
        const isOpen = this.props.isOpen !== undefined ? this.props.isOpen : this.state.internalIsOpen;

        if (!currentItem) return null;

        // Get license type info
        let version = currentItem.version;
        let fun1 = currentItem.fun_1s ? currentItem.fun_1s[version - 1] : null;

        // Define menu items based on current item state
        const menuItems = [];

        // Always show these items
        menuItems.push({
            id: 'close',
            icon: 'fas fa-times-circle',
            name: 'CERRAR',
            color: '#17a2b8', // info blue
            action: () => this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "close", FROM)
        });

        menuItems.push({
            id: 'general',
            icon: 'far fa-folder-open',
            name: 'DETALLES',
            color: '#17a2b8',
            active: FROM === "general",
            action: () => FROM !== "general" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "general", FROM)
        });

        menuItems.push({
            id: 'clock',
            icon: 'far fa-clock',
            name: 'TIEMPOS',
            color: '#17a2b8',
            active: FROM === "clock",
            action: () => FROM !== "clock" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "clock", FROM)
        });

        menuItems.push({
            id: 'archive',
            icon: 'fas fa-archive',
            name: 'DOCUMENTOS',
            color: '#6c757d', // secondary
            active: FROM === "archive",
            action: () => FROM !== "archive" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "archive", FROM)
        });

        // Conditional items based on state
        if (currentItem.state != 101 && currentItem.state <= 200) {
            menuItems.push({
                id: 'edit',
                icon: 'far fa-folder-open',
                name: 'ACTUALIZAR',
                color: '#6c757d',
                active: FROM === "edit",
                action: () => FROM !== "edit" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "edit", FROM)
            });

            menuItems.push({
                id: 'check',
                icon: 'far fa-check-square',
                name: 'CHEKEO',
                color: '#ffc107', // warning
                active: FROM === "check",
                action: () => FROM !== "check" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "check", FROM)
            });

            menuItems.push({
                id: 'alert',
                icon: 'fas fa-sign',
                name: 'PUBLICIDAD',
                color: '#ffc107',
                active: FROM === "alert",
                action: () => FROM !== "alert" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "alert", FROM),
                badge: this.props.pqrsxfun && this.props.pqrsxfun.length ? 'PQRS' : null
            });

            menuItems.push({
                id: 'record_law',
                icon: 'fas fa-balance-scale',
                name: 'INF. JURÍDICO',
                color: '#ffc107',
                active: FROM === "record_law",
                action: () => FROM !== "record_law" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "record_law", FROM)
            });

            menuItems.push({
                id: 'record_arc',
                icon: 'far fa-building',
                name: 'INF. ARQ.',
                color: '#ffc107',
                active: FROM === "record_arc",
                action: () => FROM !== "record_arc" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "record_arc", FROM)
            });

            menuItems.push({
                id: 'record_eng',
                icon: 'fas fa-cogs',
                name: 'INF. ESTRUCT.',
                color: '#ffc107',
                active: FROM === "record_eng",
                action: () => FROM !== "record_eng" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "record_eng", FROM)
            });

            menuItems.push({
                id: 'record_review',
                icon: 'fas fa-file-contract',
                name: 'ACTA',
                color: '#ffc107',
                active: FROM === "record_review",
                action: () => FROM !== "record_review" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "record_review", FROM)
            });

            menuItems.push({
                id: 'expedition',
                icon: 'far fa-file-alt',
                name: 'EXPEDICIÓN',
                color: '#ffc107',
                active: FROM === "expedition",
                action: () => FROM !== "expedition" && this.props.NAVIGATION && this.props.NAVIGATION(currentItem, "expedition", FROM)
            });
        }

        const renderMenuItem = (item) => {
            const isActive = item.active || activeSection === item.id;
            
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
                            className={`fun-sidebar-item collapsed ${isActive ? 'active' : ''}`}
                            style={{ borderLeftColor: item.color }}
                            onClick={item.action}
                        >
                            <div className="fun-sidebar-icon" style={{ color: item.color }}>
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
                    className={`fun-sidebar-item expanded ${isActive ? 'active' : ''}`}
                    style={{ borderLeftColor: item.color }}
                    onClick={item.action}
                >
                    <div className="fun-sidebar-icon" style={{ color: item.color }}>
                        <i className={item.icon}></i>
                    </div>
                    <div className="fun-sidebar-content">
                        <div className="fun-sidebar-name">
                            {item.name}
                            {item.badge && <span className="fun-sidebar-badge">{item.badge}</span>}
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className={`fun-collapsible-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="fun-sidebar-toggle" onClick={this.toggleSidebar}>
                    <i className={isOpen ? 'fas fa-chevron-left' : 'fas fa-bars'}></i>
                </div>
                
                <div className="fun-sidebar-items">
                    {menuItems.map(item => renderMenuItem(item))}
                </div>
            </div>
        );
    }
}

export default FUN_COLLAPSIBLE_NAV;
