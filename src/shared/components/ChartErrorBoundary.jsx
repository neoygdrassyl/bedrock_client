import { Component } from 'react';
import { Icon } from '@/shared/components/icon';
import { logError } from '@/shared/observability/logger';

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

    // A broken chart leaves the rest of the page usable: log it as a symptom.
    componentDidCatch(error, errorInfo) {
        logError('chart_render_failed', error, { level: 'warn', componentStack: errorInfo?.componentStack });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="border p-3 text-center text-muted">
                    <Icon name="chart-bar" size={16} className="me-2" />
                    {this.props.fallbackMessage || 'No se pudo renderizar la gráfica. Verifique que existan datos.'}
                </div>
            );
        }
        return this.props.children;
    }
}

export default ChartErrorBoundary;
