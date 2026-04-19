import { useState, useRef, useEffect } from 'react';

/**
 * Drop-in replacement for react-collapsible with smooth CSS animation.
 * Uses CSS grid row transition for natural height animation without JS measurement.
 * Supports: trigger, className, openedClassName, lazyRender, open, children.
 */
export default function Collapsible({
    trigger,
    children,
    className = '',
    openedClassName = '',
    open = false,
    lazyRender = false,
}) {
    const [isOpen, setIsOpen] = useState(open);
    const [hasRendered, setHasRendered] = useState(open);

    useEffect(() => {
        if (isOpen) setHasRendered(true);
    }, [isOpen]);

    const shouldRender = lazyRender ? hasRendered : true;

    return (
        <div className={isOpen ? (openedClassName || className) : className}>
            <div
                onClick={() => setIsOpen(prev => !prev)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-expanded={isOpen}
            >
                {trigger}
            </div>
            <div
                className="collapsible-grid-wrapper"
                data-open={isOpen}
            >
                <div className="collapsible-grid-inner">
                    {shouldRender && children}
                </div>
            </div>
        </div>
    );
}
