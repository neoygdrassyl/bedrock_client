import './FunUpdateSectionLegend.css';

export default function FunUpdateSectionLegend({ id, step, children }) {
  return (
    <legend className="fun-update-section-legend" id={id}>
      {step ? <span className="fun-update-section-legend__step">{step}</span> : null}
      <span className="fun-update-section-legend__label">{children}</span>
    </legend>
  );
}
