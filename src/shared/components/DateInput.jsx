import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './DateInput.css';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const EMPTY_TEXT = 'dd/mm/aaaa';
// Legacy forms write `input.value` imperatively (getElementById), which fires no event.
const SYNC_INTERVAL_MS = 600;

/** "2026-11-11" -> "11/11/2026"; anything else -> "". */
export function formatDateInputValue(value) {
    const match = ISO_DATE.exec(String(value ?? ''));
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

/**
 * Native date field that reads dd/mm/yyyy at rest regardless of the browser locale.
 *
 * The native `<input type="date">` keeps its id, name, value, events and validation, so it is a
 * drop-in replacement for controlled, uncontrolled and imperatively written fields. While the
 * field is not focused its own text is hidden and the value is drawn as dd/mm/yyyy; on focus the
 * native editor shows. Same pattern as the Tiempos table (ClockRow `.tc-date`).
 */
export function DateInput({ className, wrapperClassName, ref, ...props }) {
    const inputRef = useRef(null);
    const [text, setText] = useState(() => formatDateInputValue(props.value ?? props.defaultValue));
    const [box, setBox] = useState(null);

    const setRefs = (node) => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
    };

    const sync = () => {
        const node = inputRef.current;
        if (!node) return;
        const next = formatDateInputValue(node.value);
        setText((current) => (current === next ? current : next));
    };

    // The display copies the field's own metrics so it lines up with any legacy input style.
    useLayoutEffect(() => {
        const node = inputRef.current;
        if (!node || typeof window === 'undefined' || !window.getComputedStyle) return undefined;
        const measure = () => {
            const style = window.getComputedStyle(node);
            const next = {
                left: node.offsetLeft + (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.paddingLeft) || 0),
                top: node.offsetTop + node.offsetHeight / 2,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                fontFamily: style.fontFamily,
            };
            setBox((current) => (current && Object.keys(next).every((key) => current[key] === next[key]) ? current : next));
        };
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        sync();
        const frame = requestAnimationFrame(sync);
        return () => cancelAnimationFrame(frame);
    });

    useEffect(() => {
        const node = inputRef.current;
        if (!node) return undefined;
        const events = ['input', 'change', 'blur'];
        events.forEach((name) => node.addEventListener(name, sync));
        const form = node.form;
        const onReset = () => requestAnimationFrame(sync);
        if (form) form.addEventListener('reset', onReset);
        const timer = setInterval(sync, SYNC_INTERVAL_MS);
        return () => {
            events.forEach((name) => node.removeEventListener(name, sync));
            if (form) form.removeEventListener('reset', onReset);
            clearInterval(timer);
        };
    }, []);

    return (
        <span className={['dv-date', wrapperClassName].filter(Boolean).join(' ')} data-empty={text ? undefined : 'true'}>
            <input {...props} type="date" ref={setRefs} className={className} />
            <span
                className="dv-date-display"
                aria-hidden="true"
                style={box ? { left: box.left, top: box.top, fontSize: box.fontSize, fontWeight: box.fontWeight, fontFamily: box.fontFamily } : { visibility: 'hidden' }}
            >
                {text || EMPTY_TEXT}
            </span>
        </span>
    );
}

export default DateInput;
