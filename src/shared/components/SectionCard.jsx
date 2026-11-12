import { cn } from '@/shared/lib/utils';

/**
 * Presentational building blocks of the expediente card-stack modules. The look
 * lives in the `.ew-*` rules of shared/styles/legacy-bridge.css (scope
 * `.expediente-workspace`), so legacy fieldsets and these components share one surface.
 */

/** Floating card: one concept, a calm heading row (title · meta · actions) and its content. */
export function SectionCard({ id, title, meta, actions, headingLevel = 'h2', className, children }) {
    const Heading = headingLevel;
    const hasHeader = title || meta || actions;

    return (
        <section id={id} className={cn('ew-card', className)}>
            {hasHeader ? (
                <div className="ew-card__header">
                    {title ? <Heading className="ew-card__title">{title}</Heading> : null}
                    {meta ? <span className="ew-card__meta">{meta}</span> : null}
                    {actions ? <div className="ew-card__actions">{actions}</div> : null}
                </div>
            ) : null}
            {children}
        </section>
    );
}

/** Sub-heading of a group inside a card. */
export function SectionSubheading({ id, as: Tag = 'h3', className, children }) {
    return <Tag id={id} className={cn('ew-subheading', className)}>{children}</Tag>;
}

const isEmptyValue = (value) => value === null || value === undefined || value === false
    || (typeof value === 'string' && value.trim() === '');

/** Label/value grid for display-only data. `wide` uses two columns instead of four. */
export function DataGrid({ wide = false, className, children }) {
    return <dl className={cn('ew-dl', wide && 'ew-dl--wide', className)}>{children}</dl>;
}

/**
 * One label/value pair. An empty value is stated explicitly (never a blank box):
 * legally relevant absence must stay visible.
 */
export function DataField({ label, value, children, full = false, mono = false, prose = false, emptyText = 'Sin dato', className }) {
    const content = children ?? value;
    const empty = isEmptyValue(content);

    return (
        <div className={cn('ew-dl__item', full && 'ew-dl__item--full', className)}>
            <dt>{label}</dt>
            <dd data-empty={empty ? 'true' : undefined} className={cn(mono && !empty && 'ew-num', prose && !empty && 'ew-prose')}>
                {empty ? emptyText : content}
            </dd>
        </div>
    );
}
