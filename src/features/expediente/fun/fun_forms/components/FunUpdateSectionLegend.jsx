import { cn } from '@/shared/lib/utils';
import './FunUpdateSectionLegend.css';

/**
 * Section heading of the FUN "Actualizar" module. Renders a <legend> by default (inside a
 * fieldset); other modules can reuse the same look with `as` (e.g. "h2") outside a fieldset.
 */
export default function FunUpdateSectionLegend({ id, step, as: Component = 'legend', className, children }) {
  return (
    <Component className={cn('fun-update-section-legend', className)} id={id}>
      {step ? <span className="fun-update-section-legend__step">{step}</span> : null}
      <span className="fun-update-section-legend__label">{children}</span>
    </Component>
  );
}
