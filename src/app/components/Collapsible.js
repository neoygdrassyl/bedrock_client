import { useState } from 'react';

/**
 * Drop-in replacement for react-collapsible.
 * Supports: trigger, className, openedClassName, lazyRender, open, children.
 */
export default function Collapsible({
    trigger,
    children,
    className = '',
    openedClassName = '',
    open,
    lazyRender = false,
}) {
    const [isOpen, setIsOpen] = useState(open);

    return (
        <div className={(isOpen || open) ? (openedClassName || className) : className}>
            <div
                onClick={() => setIsOpen(prev => !prev)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-expanded={isOpen}
            >
                {trigger}
            </div>
            {(!lazyRender || isOpen || open) && (
                <div style={{ display: isOpen ? 'block' : 'none' }}>
                    {children}
                </div>
            )}
        </div>
    );
}
