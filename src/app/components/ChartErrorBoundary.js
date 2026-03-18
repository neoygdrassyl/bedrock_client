import { Component } from 'react';

/**
 * ErrorBoundary para capturar errores de recharts y otras librerías de charts.
 * Muestra un mensaje de fallback en vez de romper toda la página.
 */
class ChartErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.warn('ChartErrorBoundary caught error:', error.message);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="border p-3 text-center text-muted">
                    <i className="fas fa-chart-bar me-2"></i>
                    {this.props.fallbackMessage || 'No se pudo renderizar la gráfica. Verifique que existan datos.'}
                </div>
            );
        }
        return this.props.children;
    }
}

export default ChartErrorBoundary;
