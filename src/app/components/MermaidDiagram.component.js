import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Contador global para IDs únicos
let mermaidIdCounter = 0;

// Variable global para controlar si mermaid ya está cargado
let mermaidLoaded = false;
let mermaidLoadPromise = null;

/**
 * Carga Mermaid dinámicamente desde CDN
 */
const loadMermaid = () => {
    if (mermaidLoaded && window.mermaid) {
        return Promise.resolve(window.mermaid);
    }
    
    if (mermaidLoadPromise) {
        return mermaidLoadPromise;
    }

    mermaidLoadPromise = new Promise((resolve, reject) => {
        // Verificar si ya existe el script
        if (document.querySelector('script[src*="mermaid"]')) {
            if (window.mermaid) {
                mermaidLoaded = true;
                resolve(window.mermaid);
            } else {
                // Esperar a que cargue
                const checkInterval = setInterval(() => {
                    if (window.mermaid) {
                        clearInterval(checkInterval);
                        mermaidLoaded = true;
                        window.mermaid.initialize({
                            startOnLoad: false,
                            theme: 'default',
                            securityLevel: 'loose',
                            fontFamily: 'inherit',
                            logLevel: 'error'
                        });
                        resolve(window.mermaid);
                    }
                }, 100);
            }
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
        script.async = true;
        
        script.onload = () => {
            mermaidLoaded = true;
            window.mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose',
                fontFamily: 'inherit',
                logLevel: 'error',
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis'
                },
                sequence: {
                    useMaxWidth: true,
                    diagramMarginX: 50,
                    diagramMarginY: 10
                },
                er: {
                    useMaxWidth: true
                },
                stateDiagram: {
                    useMaxWidth: true
                }
            });
            resolve(window.mermaid);
        };
        
        script.onerror = () => {
            reject(new Error('Error al cargar Mermaid desde CDN'));
        };
        
        document.head.appendChild(script);
    });

    return mermaidLoadPromise;
};

// Estilos para botones de control
const controlButtonStyle = {
    backgroundColor: '#2d2d44',
    border: '1px solid #444',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
};

// Estilo para kbd
const kbdStyle = {
    backgroundColor: '#333',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid #555',
    fontFamily: 'monospace'
};

/**
 * Componente Modal para visualización expandida con zoom y pan
 */
const DiagramModal = ({ isOpen, onClose, svg, chart }) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Reset al abrir
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            // Prevenir scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Manejar tecla Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Manejar zoom con rueda del mouse
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.min(Math.max(0.25, prev + delta), 4));
    }, []);

    // Manejar inicio de arrastre
    const handleMouseDown = useCallback((e) => {
        if (e.button === 0) { // Solo botón izquierdo
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    }, [position]);

    // Manejar movimiento
    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    }, [isDragging, dragStart]);

    // Manejar fin de arrastre
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Zoom con botones
    const zoomIn = () => setZoom(prev => Math.min(4, prev + 0.25));
    const zoomOut = () => setZoom(prev => Math.max(0.25, prev - 0.25));
    const resetView = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };
    const fitToScreen = () => {
        setZoom(0.8);
        setPosition({ x: 0, y: 0 });
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Header del Modal */}
            <div style={{
                backgroundColor: '#1a1a2e',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #333',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>
                        <i className="fas fa-project-diagram me-2"></i>
                        Visor de Diagrama
                    </span>
                    <span style={{ 
                        backgroundColor: '#4a4a6a', 
                        color: '#fff', 
                        padding: '4px 12px', 
                        borderRadius: '20px',
                        fontSize: '0.8rem'
                    }}>
                        Zoom: {Math.round(zoom * 100)}%
                    </span>
                </div>
                
                {/* Controles de zoom */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={zoomOut}
                        style={controlButtonStyle}
                        title="Alejar"
                    >
                        <i className="fas fa-search-minus"></i>
                    </button>
                    <input
                        type="range"
                        min="25"
                        max="400"
                        value={zoom * 100}
                        onChange={(e) => setZoom(e.target.value / 100)}
                        style={{ width: '120px', cursor: 'pointer' }}
                    />
                    <button
                        onClick={zoomIn}
                        style={controlButtonStyle}
                        title="Acercar"
                    >
                        <i className="fas fa-search-plus"></i>
                    </button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#444', margin: '0 8px' }}></div>
                    <button
                        onClick={fitToScreen}
                        style={controlButtonStyle}
                        title="Ajustar a pantalla"
                    >
                        <i className="fas fa-compress-arrows-alt"></i>
                    </button>
                    <button
                        onClick={resetView}
                        style={controlButtonStyle}
                        title="Restablecer vista"
                    >
                        <i className="fas fa-undo"></i>
                    </button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#444', margin: '0 8px' }}></div>
                    <button
                        onClick={onClose}
                        style={{
                            ...controlButtonStyle,
                            backgroundColor: '#dc3545',
                            borderColor: '#dc3545'
                        }}
                        title="Cerrar (Esc)"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>

            {/* Área del diagrama */}
            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    position: 'relative',
                    backgroundColor: '#f8f9fa'
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        padding: '40px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            </div>

            {/* Footer con instrucciones */}
            <div style={{
                backgroundColor: '#1a1a2e',
                padding: '10px 20px',
                borderTop: '1px solid #333',
                display: 'flex',
                justifyContent: 'center',
                gap: '30px',
                fontSize: '0.8rem',
                color: '#aaa',
                flexWrap: 'wrap'
            }}>
                <span><i className="fas fa-mouse me-2"></i>Rueda del mouse para zoom</span>
                <span><i className="fas fa-hand-paper me-2"></i>Arrastrar para mover</span>
                <span><kbd style={kbdStyle}>Esc</kbd> para cerrar</span>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

/**
 * Componente para renderizar diagramas Mermaid
 * @param {Object} props - Props del componente
 * @param {string} props.chart - El código del diagrama Mermaid
 * @param {string} props.className - Clase CSS opcional
 */
const MermaidDiagram = ({ chart, className = '' }) => {
    const containerRef = useRef(null);
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    const [showCode, setShowCode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const idRef = useRef(`mermaid-diagram-${++mermaidIdCounter}`);

    useEffect(() => {
        const renderDiagram = async () => {
            if (!chart || !containerRef.current) return;

            try {
                // Cargar Mermaid dinámicamente
                const mermaid = await loadMermaid();
                
                // Limpiar el código del diagrama
                const cleanChart = chart.trim();
                
                // Renderizar el diagrama
                const { svg: renderedSvg } = await mermaid.render(idRef.current, cleanChart);
                setSvg(renderedSvg);
                setError(null);
            } catch (err) {
                console.error('Error renderizando Mermaid:', err);
                setError(err.message || 'Error al renderizar el diagrama');
                setSvg('');
            }
        };

        renderDiagram();
    }, [chart]);

    // Estilos inline para el contenedor
    const containerStyle = {
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        margin: '1rem 0',
        backgroundColor: '#fff',
        overflow: 'hidden'
    };

    const headerStyle = {
        backgroundColor: '#f8f9fa',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
    };

    const diagramContainerStyle = {
        padding: '1rem',
        overflow: 'auto',
        maxHeight: '500px',
        transition: 'max-height 0.3s ease',
        backgroundColor: '#fafafa'
    };

    const svgContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
    };

    const codeContainerStyle = {
        backgroundColor: '#282c34',
        color: '#abb2bf',
        padding: '1rem',
        borderTop: '1px solid #dee2e6',
        fontSize: '0.85rem',
        overflow: 'auto',
        maxHeight: '300px'
    };

    const buttonStyle = {
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        marginLeft: '0.5rem',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        transition: 'all 0.2s ease'
    };

    const expandButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#0d6efd',
        borderColor: '#0d6efd',
        color: '#fff'
    };

    if (error) {
        return (
            <div style={containerStyle} className={className}>
                <div style={headerStyle}>
                    <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Error en Diagrama Mermaid
                    </span>
                </div>
                <div style={{ padding: '1rem' }}>
                    <div className="alert alert-danger mb-2">
                        {error}
                    </div>
                    <details>
                        <summary className="text-muted" style={{ cursor: 'pointer' }}>
                            Ver código fuente
                        </summary>
                        <pre style={codeContainerStyle}>
                            <code>{chart}</code>
                        </pre>
                    </details>
                </div>
            </div>
        );
    }

    return (
        <>
            <div style={containerStyle} className={className} ref={containerRef}>
                <div style={headerStyle}>
                    <span style={{ fontWeight: '500', color: '#6c757d' }}>
                        <i className="fas fa-project-diagram me-2"></i>
                        Diagrama Mermaid
                    </span>
                    <div>
                        <button
                            style={buttonStyle}
                            onClick={() => setShowCode(!showCode)}
                            title={showCode ? 'Ocultar código' : 'Ver código'}
                        >
                            <i className={`fas ${showCode ? 'fa-eye-slash' : 'fa-code'} me-1`}></i>
                            {showCode ? 'Ocultar' : 'Código'}
                        </button>
                        <button
                            style={expandButtonStyle}
                            onClick={() => setIsModalOpen(true)}
                            title="Abrir en visor expandido con zoom"
                        >
                            <i className="fas fa-expand-arrows-alt me-1"></i>
                            Expandir
                        </button>
                    </div>
                </div>
                <div style={diagramContainerStyle}>
                    {svg ? (
                        <div
                            style={svgContainerStyle}
                            dangerouslySetInnerHTML={{ __html: svg }}
                        />
                    ) : (
                        <div style={svgContainerStyle}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando diagrama...</span>
                            </div>
                        </div>
                    )}
                </div>
                {showCode && (
                    <pre style={codeContainerStyle}>
                        <code>{chart}</code>
                    </pre>
                )}
            </div>

            {/* Modal de visualización expandida */}
            <DiagramModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                svg={svg}
                chart={chart}
            />
        </>
    );
};

/**
 * Componente Code personalizado que detecta bloques mermaid
 * Para usar con markdown-to-jsx
 */
export const CodeBlock = ({ className, children, ...props }) => {
    // Detectar si es un bloque de código mermaid
    const isMermaid = className === 'lang-mermaid' || className === 'language-mermaid';
    
    if (isMermaid && typeof children === 'string') {
        return <MermaidDiagram chart={children} />;
    }
    
    // Si no es mermaid, renderizar como código normal
    return (
        <code className={className} {...props}>
            {children}
        </code>
    );
};

/**
 * Componente Pre personalizado para manejar bloques de código
 */
export const PreBlock = ({ children, ...props }) => {
    // Verificar si el hijo es un elemento code con clase mermaid
    if (children && children.props) {
        const { className, children: codeContent } = children.props;
        const isMermaid = className === 'lang-mermaid' || className === 'language-mermaid';
        
        if (isMermaid && typeof codeContent === 'string') {
            return <MermaidDiagram chart={codeContent} />;
        }
    }
    
    // Si no es mermaid, renderizar como pre normal con estilos
    return (
        <pre className="bg-dark text-light p-3 rounded" {...props}>
            {children}
        </pre>
    );
};

export default MermaidDiagram;
