import React, { Component } from 'react';
import FUN_COLLAPSIBLE_NAV from './fun_collapsibleNav.component';
import FUN_FIXED_HEADER from './fun_fixedHeader.component';
import './fun_layoutWrapper.css';

class FUN_LAYOUT_WRAPPER extends Component {
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
            document.body.classList.add('fun-sidebar-open');
            document.body.classList.remove('fun-sidebar-closed');
        } else {
            document.body.classList.add('fun-sidebar-closed');
            document.body.classList.remove('fun-sidebar-open');
        }
    };

    handleNavigation = (sectionId) => {
        this.setState({ activeSection: sectionId });
    };

    componentDidMount() {
        // Set initial body class
        document.body.classList.add('fun-sidebar-open');
    }

    componentWillUnmount() {
        // Clean up body classes
        document.body.classList.remove('fun-sidebar-open', 'fun-sidebar-closed');
    }

    render() {
        const { children, currentItem, currentVersion, FROM, translation, pqrsxfun, NAVIGATION } = this.props;
        const { sidebarOpen, activeSection } = this.state;

        return (
            <div className="fun-layout-container">
                <FUN_COLLAPSIBLE_NAV
                    translation={translation}
                    currentItem={currentItem}
                    currentVersion={currentVersion}
                    FROM={FROM}
                    activeSection={activeSection}
                    onNavigate={this.handleNavigation}
                    isOpen={sidebarOpen}
                    onToggle={this.handleSidebarToggle}
                    pqrsxfun={pqrsxfun}
                    NAVIGATION={NAVIGATION}
                />
                
                <div className={`fun-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <FUN_FIXED_HEADER 
                        currentItem={currentItem}
                        translation={translation}
                    />
                    
                    <div className="fun-content-body">
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}

export default FUN_LAYOUT_WRAPPER;
