import React, { Component } from 'react';
import PQRS_COLLAPSIBLE_NAV from './pqrs_collapsibleNav.component';
import PQRS_FIXED_HEADER from './pqrs_fixedHeader.component';
import './pqrs_layoutWrapper.css';

class PQRS_LAYOUT_WRAPPER extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarOpen: true,
            activeSection: null
        };
    }

    handleSidebarToggle = (isOpen) => {
        this.setState({ sidebarOpen: isOpen });
        // Update body class for CSS targeting
        if (isOpen) {
            document.body.classList.add('pqrs-sidebar-open');
            document.body.classList.remove('pqrs-sidebar-closed');
        } else {
            document.body.classList.add('pqrs-sidebar-closed');
            document.body.classList.remove('pqrs-sidebar-open');
        }
    };

    handleNavigation = (sectionId) => {
        this.setState({ activeSection: sectionId });
        // Scroll to section if needed
        const element = document.getElementById(`pqrs-section-${sectionId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    componentDidMount() {
        // Set initial body class
        document.body.classList.add('pqrs-sidebar-open');
    }

    componentWillUnmount() {
        // Clean up body classes
        document.body.classList.remove('pqrs-sidebar-open', 'pqrs-sidebar-closed');
    }

    render() {
        const { children, currentItem, translation, swaMsg, globals } = this.props;
        const { sidebarOpen, activeSection } = this.state;

        return (
            <div className="pqrs-layout-container">
                <PQRS_COLLAPSIBLE_NAV
                    translation={translation}
                    currentItem={currentItem}
                    activeSection={activeSection}
                    onNavigate={this.handleNavigation}
                    isOpen={sidebarOpen}
                    onToggle={this.handleSidebarToggle}
                />
                
                <div className={`pqrs-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <PQRS_FIXED_HEADER 
                        currentItem={currentItem}
                        translation={translation}
                    />
                    
                    <div className="pqrs-content-body">
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}

export default PQRS_LAYOUT_WRAPPER;
