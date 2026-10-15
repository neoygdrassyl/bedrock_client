import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const TAG_TONES = ['neutral', 'info', 'success', 'warning', 'danger', 'code'];

/** Class string of a documentary tag (palette lives in documental.css under `.documental-ui`). */
export function tagClass({ tone = 'neutral', mono = false, pill = false, className } = {}) {
    return cn('d-tag', tone !== 'neutral' && `d-tag--${tone}`, mono && 'd-tag--mono', pill && 'd-tag--pill', className);
}

/** Single tag/chip primitive of the documentary module: AA-contrast tones, no Bootstrap leakage. */
export const Tag = forwardRef(function Tag({ tone = 'neutral', mono = false, pill = false, as: Component = 'span', className, ...props }, ref) {
    return <Component ref={ref} data-tone={tone} className={tagClass({ tone, mono, pill, className })} {...props} />;
});

export default Tag;
