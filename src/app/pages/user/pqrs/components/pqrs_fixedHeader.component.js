import React, { Component } from 'react';
import './pqrs_fixedHeader.css';

class PQRS_FIXED_HEADER extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { currentItem } = this.props;

        // Get solicitud details
        const solicitudNumber = currentItem?.id_publico || currentItem?.pqrs_fun?.id_public || 'N/A';
        const status = currentItem?.status === 0 ? 'En Proceso' : currentItem?.status === 1 ? 'Radicado' : 'Estado: Pendiente';
        const version = 'Ultra versión 1';

        return (
            <div className="pqrs-fixed-header">
                <div className="pqrs-header-left">
                    <h1 className="pqrs-header-title">Detalles de la Solicitud</h1>
                    <div className="pqrs-header-info">
                        <span className="pqrs-header-number">
                            <i className="fas fa-file-alt"></i>
                            Solicitud No: {solicitudNumber}
                        </span>
                        <span className="pqrs-header-status">
                            <i className="fas fa-info-circle"></i>
                            {status}
                        </span>
                    </div>
                </div>
                <div className="pqrs-header-right">
                    <button className="pqrs-header-btn" title="Llamar">
                        <i className="fas fa-phone"></i>
                        <span className="pqrs-btn-text">Llamar</span>
                    </button>
                    <button className="pqrs-header-btn" title="Compartir">
                        <i className="fas fa-share-alt"></i>
                        <span className="pqrs-btn-text">Compartir</span>
                    </button>
                    <span className="pqrs-header-version">{version}</span>
                </div>
            </div>
        );
    }
}

export default PQRS_FIXED_HEADER;
