import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Drop-in replacement for react-collapsible with smooth CSS animation.
 * Uses CSS grid row transition for natural height animation without JS measurement.
 * Supports: trigger, className, openedClassName, lazyRender, open, children.
 *
 * The trigger row is keyboard operable (Enter / Space) and exposes `aria-expanded`.
 * `data-legacy-collapsible` / `data-open` and the `legacy-collapsible__*` classes are
 * styling hooks for the legacy bridge (shared/styles/legacy-bridge.css); the chevron
 * stays hidden unless a scope opts in (the expediente workspace does).
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

    const handleKeyDown = (event) => {
        // Only the row itself toggles: interactive triggers (buttons, links) keep their own keys.
        if (event.target !== event.currentTarget) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        setIsOpen(prev => !prev);
    };

    return (
        <div
            className={isOpen ? (openedClassName || className) : className}
            data-legacy-collapsible=""
            data-open={isOpen}
        >
            <div
                className="legacy-collapsible__trigger"
                onClick={() => setIsOpen(prev => !prev)}
                onKeyDown={handleKeyDown}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
            >
                {trigger}
                <ChevronDown className="legacy-collapsible__chevron hidden" size={16} aria-hidden="true" />
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
