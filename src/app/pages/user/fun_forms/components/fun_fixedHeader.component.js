import React, { Component } from 'react';
import './fun_fixedHeader.css';

class FUN_FIXED_HEADER extends Component {
    render() {
        const { currentItem } = this.props;

        if (!currentItem) return null;

        // Get license details
        const licenseNumber = currentItem.id_public || 'N/A';
        const status = this.getStatusText(currentItem.state);
        const version = `Versión ${currentItem.version || 1}`;

        return (
            <div className="fun-fixed-header">
                <div className="fun-header-left">
                    <h1 className="fun-header-title">Gestión de Licencia</h1>
                    <div className="fun-header-info">
                        <span className="fun-header-number">
                            <i className="fas fa-file-alt"></i>
                            Radicado: {licenseNumber}
                        </span>
                        <span className="fun-header-status" style={{ backgroundColor: this.getStatusColor(currentItem.state) }}>
                            <i className="fas fa-info-circle"></i>
                            {status}
                        </span>
                        <span className="fun-header-version">
                            {version}
                        </span>
                    </div>
                </div>
                <div className="fun-header-right">
                    <button className="fun-header-btn" title="Acciones rápidas">
                        <i className="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        );
    }

    getStatusText(state) {
        if (state === 101) return 'Completado';
        if (state <= 200) return 'En Proceso';
        return 'Estado Desconocido';
    }

    getStatusColor(state) {
        if (state === 101) return 'rgba(40, 167, 69, 0.15)'; // green
        if (state <= 200) return 'rgba(255, 193, 7, 0.15)'; // yellow
        return 'rgba(108, 117, 125, 0.15)'; // gray
    }
}

export default FUN_FIXED_HEADER;
