import { Component } from 'react';
import { IllustratedState } from '@/shared/components/feedback/IllustratedState';
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
        logError('chart_render_failed', error, { level: 'warn', kind: 'render', componentStack: errorInfo?.componentStack });
    }

    render() {
        if (this.state.hasError) {
            return (
                <IllustratedState
                    size="compact"
                    variant="load-error"
                    title="No se pudo mostrar la gráfica"
                    description={this.props.fallbackMessage || 'Verifique que existan datos.'}
                />
            );
        }
        return this.props.children;
    }
}

export default ChartErrorBoundary;
