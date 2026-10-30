const OPTIONS = [
  { value: 'SI', label: 'Sí' },
  { value: 'NO', label: 'No' },
  { value: 'NA', label: 'No aplica' },
];

export default function ChecklistEvaluationSelect({ value, disabled, onChange }) {
  return (
    <select
      aria-label="Evaluación del requisito"
      className="min-h-[44px] min-w-[132px] rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
      value={value || 'NO'}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
