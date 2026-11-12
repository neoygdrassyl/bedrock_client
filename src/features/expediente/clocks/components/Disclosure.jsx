import { useId } from 'react';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';

/**
 * The one disclosure pattern of the Tiempos module: the header row is the trigger
 * (chevron + title + optional summary), `actions` sit beside it and never toggle it, and
 * the panel animates its height (`.tc-collapse`, off under reduced motion). The panel
 * stays mounted while closed, so nothing typed inside it is lost; `inert` takes it out of
 * the tab order and the accessibility tree.
 */
export function DisclosureCard({
  title,
  summary,
  open,
  onOpenChange,
  actions,
  children,
  className,
  headingId,
  as: Wrapper = 'section',
  flush = false,
}) {
  const generatedId = useId();
  const titleId = headingId || `${generatedId}-title`;
  const panelId = `${generatedId}-panel`;

  return (
    <Wrapper className={cn(flush ? 'tc-disclosure' : 'tc-card tc-disclosure', className)} aria-labelledby={titleId}>
      <div className="tc-disclosure-header" data-open={open ? 'true' : 'false'}>
        <h3 className="tc-disclosure-heading">
          <button
            type="button"
            className="tc-disclosure-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => onOpenChange(!open)}
          >
            <Icon name="chevron-down" size={16} className="tc-chevron" aria-hidden="true" />
            <span id={titleId} className="tc-disclosure-title">{title}</span>
            {summary ? <span className="tc-disclosure-summary">{summary}</span> : null}
          </button>
        </h3>
        {actions ? <div className="tc-disclosure-actions">{actions}</div> : null}
      </div>
      <Collapse id={panelId} open={open}>{children}</Collapse>
    </Wrapper>
  );
}

/** Height-animated region controlled by a trigger with `aria-controls={id}`. */
export function Collapse({ id, open, children, className, ...props }) {
  return (
    <div id={id} className={cn('tc-collapse', className)} data-collapsed={open ? 'false' : 'true'} inert={!open} {...props}>
      <div className="tc-collapse-inner">{children}</div>
    </div>
  );
}

export default DisclosureCard;
