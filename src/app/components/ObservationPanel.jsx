import { useEffect, useId, useRef, useState } from 'react';
import Icon from '@/components/icon';
import './ObservationPanel.css';

export default function ObservationPanel({
    title = 'OBSERVACIONES',
    defaultOpen,
    mode,
    textareaProps,
    children,
    helperText,
    headerId,
    panelId,
}) {
    const generatedId = useId();
    const contentRef = useRef(null);
    const textareaRef = useRef(null);
    const safeHeaderId = headerId || `${generatedId}-trigger`;
    const safePanelId = panelId || `${generatedId}-panel`;
    const hasTextarea = Boolean(textareaProps);
    const isReadOnly = Boolean(textareaProps?.readOnly || textareaProps?.disabled);
    const hintMode = mode || (hasTextarea && isReadOnly ? 'view' : 'edit');
    const hintText = hintMode === 'view' ? 'toque para ver observaciones' : 'toque para agregar observaciones';
    const textareaValue = textareaProps?.value ?? textareaProps?.defaultValue;
    const normalizedTextareaValue = textareaValue == null ? '' : String(textareaValue).trim();
    const hasObservationContent = normalizedTextareaValue !== '' && normalizedTextareaValue !== 'false';
    const [isOpen, setIsOpen] = useState(() => defaultOpen ?? hasObservationContent);

    const resizeTextarea = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const syncPanelHeight = () => {
        const el = contentRef.current;
        if (!el) return;

        el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : '0px';
    };

    const syncTextareaAndPanelHeight = () => {
        resizeTextarea();
        syncPanelHeight();
    };

    const setTextareaRef = (node) => {
        textareaRef.current = node;

        const providedRef = textareaProps?.ref;
        if (typeof providedRef === 'function') providedRef(node);
        else if (providedRef && typeof providedRef === 'object') providedRef.current = node;
    };

    const handleTextareaInput = (event) => {
        textareaProps?.onInput?.(event);
        syncTextareaAndPanelHeight();
    };

    useEffect(() => {
        if (defaultOpen !== undefined) return;

        setIsOpen(hasObservationContent);
    }, [defaultOpen, hasObservationContent]);

    useEffect(() => {
        syncTextareaAndPanelHeight();
    }, [isOpen, children, helperText, textareaProps]);

    return (
        <section className="op__panel">
            <button
                id={safeHeaderId}
                type="button"
                className="op__trigger"
                onClick={() => setIsOpen((current) => !current)}
                aria-expanded={isOpen}
                aria-controls={safePanelId}
            >
                <span className="op__label">
                    <span className="op__title">{title}</span>
                    <span className="op__hint">{hintText}</span>
                </span>
                <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={16} aria-hidden="true" />
            </button>
            <div
                ref={contentRef}
                id={safePanelId}
                className={isOpen ? 'op__content op__content--open' : 'op__content'}
                aria-labelledby={safeHeaderId}
                aria-hidden={!isOpen}
            >
                <div className="op__inner">
                    {hasTextarea ? (
                        <textarea
                            {...textareaProps}
                            ref={setTextareaRef}
                            onInput={handleTextareaInput}
                            aria-labelledby={textareaProps?.['aria-labelledby'] || safeHeaderId}
                            tabIndex={isOpen ? textareaProps?.tabIndex : -1}
                            className={isReadOnly ? 'op__textarea op__textarea--readonly' : 'op__textarea'}
                        />
                    ) : children}
                    {helperText ? <div className="op__helper">{helperText}</div> : null}
                </div>
            </div>
        </section>
    );
}
