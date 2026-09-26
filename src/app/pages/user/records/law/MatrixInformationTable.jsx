import { Fragment } from 'react';

function reviewText(value, type) {
  if (type === 'verification') {
    return value === 'DILIGENCIADO' ? 'Diligenciado' : value === 'NO APLICA' ? 'No aplica' : 'No diligenciado';
  }
  return value === '1' ? 'Cumple' : value === '2' ? 'No aplica' : 'No cumple';
}

const verificationOptions = [['NO DILIGENCIADO', 'No diligenciado'], ['DILIGENCIADO', 'Diligenciado'], ['NO APLICA', 'No aplica']];
const evaluationOptions = [['0', 'No cumple'], ['1', 'Cumple'], ['2', 'No aplica']];

function selectClass(value, kind) {
  if (kind === 'verification') return value === 'DILIGENCIADO' ? 'text-emerald-700' : value === 'NO APLICA' ? 'text-amber-700' : 'text-destructive';
  return value === '1' ? 'text-emerald-700' : value === '2' ? 'text-amber-700' : 'text-destructive';
}

function ComparisonInput({ row, disabled, onChange }) {
  const className = `form-control form-control-sm${row.updated ? ' border-primary' : ''}`;
  const props = {
    'aria-label': `Valor de ${row.label}`,
    className,
    value: row.value || '',
    disabled,
    onChange: event => onChange?.(row.key, event.target.value),
  };

  return row.multiline ? <textarea {...props} rows="2" /> : <input {...props} type="text" />;
}

function ComparisonStatus({ row, phase }) {
  const isRadicacion = phase === 'radicacion';
  const checked = isRadicacion ? row.radicacionMarked : row.updated;
  return <input
    type="checkbox"
    className={`form-check-input m-0 h-4 w-4 cursor-default accent-primary${isRadicacion && checked ? ' opacity-50' : ''}`}
    aria-label={`Estado de ${isRadicacion ? 'Radicación' : 'Actualizar'} de ${row.label}`}
    aria-readonly="true"
    checked={checked}
    readOnly
    tabIndex={-1}
  />;
}

function PropertyComparisonTable({ rows, disabled, onChange }) {
  const groups = rows.reduce((items, row) => {
    const group = items.find(item => item.label === row.item);
    if (group) group.rows.push(row);
    else items.push({ label: row.item, rows: [row] });
    return items;
  }, []);

  return <div className="overflow-x-auto">
    <div className="grid min-w-[960px] grid-cols-3 items-stretch gap-2">
      {groups.map(group => <div key={group.label} className="min-w-0 overflow-hidden rounded-md border border-border">
        <table className="h-full w-full table-fixed border-separate border-spacing-0 text-[11px] text-foreground" aria-label={group.label}>
          <colgroup><col style={{ width: '6rem' }} /><col /><col style={{ width: '2rem' }} /><col style={{ width: '2rem' }} /></colgroup>
          <thead className="bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th colSpan="2" className="border-b border-r border-slate-400 px-2 py-1 text-left text-[9px] font-semibold uppercase dark:border-slate-600">{group.label}</th>
              <th className="w-8 border-b border-r border-slate-400 p-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">R</th>
              <th className="w-8 border-b border-slate-400 p-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">A</th>
            </tr>
          </thead>
          <tbody>{[0, 1].map(rowIndex => {
            const row = group.rows[rowIndex];
            if (!row) return <tr key={rowIndex}>
              <td className="border-b border-r border-border" /><td className="border-b border-r border-border" /><td className="border-b border-r border-border" /><td className="border-b border-border" />
            </tr>;
            return <tr key={row.key}>
              <th scope="row" className="border-b border-r border-border px-2 py-1 text-left font-semibold">{row.label}</th>
              <td className="border-b border-r border-border p-1"><ComparisonInput row={row} disabled={disabled || !row.canEdit} onChange={onChange} /></td>
              <td className="w-8 border-b border-r border-border p-1 text-center"><ComparisonStatus row={row} phase="radicacion" /></td>
              <td className="w-8 border-b border-border p-1 text-center"><ComparisonStatus row={row} phase="actualizar" /></td>
            </tr>;
          })}</tbody>
        </table>
      </div>)}
    </div>
  </div>;
}

function ChoiceStatus({ section, option, phase, disabled, onChange }) {
  const isRadicacion = phase === 'radicacion';
  const value = isRadicacion ? section.radicacionValue : section.actualizarValue;
  const checked = option.value ? value === option.value : value !== '' && !section.optionValues.includes(value);

  return <input
    type="checkbox"
    className={`form-check-input m-0 h-4 w-4 accent-primary${isRadicacion && checked ? ' opacity-50' : ''}`}
    aria-label={`${isRadicacion ? 'Radicación' : 'Actualizar'} de ${option.label}`}
    name={`${isRadicacion ? 'f_rad' : 'f_act'}_${section.key}`}
    checked={checked}
    disabled={disabled}
    onChange={() => onChange?.(section.key, option.value || value)}
  />;
}

function PropertyDetailsComparisonTable({ choiceRows, generalRows, disabled, isInitialRadicacion, onChange, onChoiceChange }) {
  const sections = Array.isArray(choiceRows) ? choiceRows : [];
  const general = Array.isArray(generalRows) ? generalRows : [];
  const soil = sections.find(section => section.key === 'suelo');
  const planimetry = sections.find(section => section.key === 'lote_pla');
  const soilOptions = soil?.options || [];
  const planimetryOptions = [...(planimetry?.options || []), { label: 'C. Otro', value: '' }];
  const urbanRows = general.filter(row => row.group === 'Predio urbano');
  const ruralRows = general.filter(row => row.group === 'Predio rural');
  const rowCount = Math.max(soilOptions.length, planimetryOptions.length, urbanRows.length, ruralRows.length);
  const choiceCells = (section, option) => option ? <>
    <th scope="row" className="border-b border-r border-border px-2 py-1 text-left font-semibold">{option.value === '' ? <div className="flex items-center gap-2"><span className="shrink-0">{option.label}</span><input aria-label="Especifique otro plano" className="form-control form-control-sm w-32 min-w-0 max-w-full" value={section.otherValue} disabled={disabled} onChange={event => onChoiceChange?.(section.key, event.target.value)} /></div> : option.label}</th>
    <td className="border-b border-r border-border p-1 text-center"><ChoiceStatus section={section} option={option} phase="radicacion" disabled={!isInitialRadicacion || disabled} onChange={onChoiceChange} /></td>
    <td className="border-b border-border p-1 text-center"><ChoiceStatus section={section} option={option} phase="actualizar" disabled={isInitialRadicacion || disabled} onChange={onChoiceChange} /></td>
  </> : <td colSpan="3" className="h-[60px] border-b border-border" />;
  const generalCells = (row, isLast) => row ? <>
    <th scope="row" className="border-b border-r border-border px-2 py-1 text-left font-semibold">{row.label}</th>
    <td className="border-b border-r border-border p-1"><ComparisonInput row={row} disabled={disabled || !row.canEdit} onChange={onChange} /></td>
    <td className="border-b border-r border-border p-1 text-center"><ComparisonStatus row={row} phase="radicacion" /></td>
    <td className={`border-b border-border p-1 text-center${isLast ? '' : ' border-r'}`}><ComparisonStatus row={row} phase="actualizar" /></td>
  </> : <td colSpan="4" className={`border-b border-border${isLast ? '' : ' border-r'}`} />;

  return <div className="overflow-x-auto">
    <div className="grid min-w-[1280px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,3fr)] items-stretch gap-2">
      <div className="min-w-0 overflow-hidden rounded-md border border-border">
        <table className="h-full w-full table-fixed border-separate border-spacing-0 text-[11px] text-foreground" aria-label="2.4 Clasificación del Suelo">
          <colgroup><col style={{ width: '12rem' }} /><col style={{ width: '2rem' }} /><col style={{ width: '2rem' }} /></colgroup>
          <thead className="bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300"><tr><th className="h-8 border-b border-r border-slate-400 px-2 py-1 text-left align-middle text-[9px] font-semibold uppercase dark:border-slate-600">2.4 Clasificación del Suelo</th><th className="h-8 border-b border-r border-slate-400 p-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">R</th><th className="h-8 border-b border-slate-400 p-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">A</th></tr></thead>
          <tbody>{Array.from({ length: rowCount }, (_, index) => <tr key={index}>{choiceCells(soil, soilOptions[index])}</tr>)}</tbody>
        </table>
      </div>
      <div className="min-w-0 overflow-hidden rounded-md border border-border">
        <table className="h-full w-full table-fixed border-separate border-spacing-0 text-[11px] text-foreground" aria-label="2.5 Planimetría del Lote">
          <colgroup><col style={{ width: '12rem' }} /><col style={{ width: '2rem' }} /><col style={{ width: '2rem' }} /></colgroup>
          <thead className="bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300"><tr><th className="h-8 border-b border-r border-slate-400 px-2 py-1 text-left align-middle text-[9px] font-semibold uppercase dark:border-slate-600">2.5 Planimetría del Lote</th><th className="h-8 border-b border-r border-slate-400 p-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">R</th><th className="h-8 border-b border-slate-400 p-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">A</th></tr></thead>
          <tbody>{Array.from({ length: rowCount }, (_, index) => <tr key={index}>{choiceCells(planimetry, planimetryOptions[index])}</tr>)}</tbody>
        </table>
      </div>
      <div className="min-w-0 overflow-hidden rounded-md border border-border">
        <table className="h-full w-full table-fixed border-separate border-spacing-0 text-[11px] text-foreground" aria-label="2.6 Información General">
          <colgroup>
            <col style={{ width: '8rem' }} /><col /><col style={{ width: '2rem' }} /><col style={{ width: '2rem' }} />
            <col style={{ width: '8rem' }} /><col /><col style={{ width: '2rem' }} /><col style={{ width: '2rem' }} />
          </colgroup>
          <thead className="bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300">
            <tr><th colSpan="8" className="border-b border-slate-400 px-2 py-1 text-left text-[9px] font-semibold uppercase dark:border-slate-600">2.6 Información General</th></tr>
            <tr><th colSpan="4" className="border-b border-r border-slate-400 p-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">Predio urbano</th><th colSpan="4" className="border-b border-slate-400 p-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">Predio rural</th></tr>
            <tr>{['Campo', 'Valor', 'R', 'A', 'Campo', 'Valor', 'R', 'A'].map((label, index) => <th key={`${label}-${index}`} className={`border-b border-slate-400 p-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600${index === 3 ? ' border-r' : ''}`}>{label}</th>)}</tr>
          </thead>
          <tbody>{Array.from({ length: rowCount }, (_, index) => <tr key={index}>{generalCells(urbanRows[index], false)}{generalCells(ruralRows[index], true)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>;
}

export default function MatrixInformationTable({ section, reviewState, mode = 'readonly', onReviewChange, disabled = false, comparisonRows, choiceRows, generalRows, isInitialRadicacion, onChoiceChange }) {
  if (mode === 'comparison') return <PropertyComparisonTable rows={Array.isArray(comparisonRows) ? comparisonRows : []} disabled={disabled} onChange={onReviewChange} />;
  if (mode === 'property-details-comparison') return <PropertyDetailsComparisonTable choiceRows={choiceRows} generalRows={generalRows} disabled={disabled} isInitialRadicacion={isInitialRadicacion} onChange={onReviewChange} onChoiceChange={onChoiceChange} />;

  const review = reviewState?.status === 'ready' ? reviewState[section.id] : null;
  const readOnly = mode === 'readonly';
  const hasOrigin = Array.isArray(review?.origin);

  return <div className="max-h-[70vh] overflow-auto rounded-md border border-border">
    <table className="min-w-max border-separate border-spacing-0 text-[11px] text-foreground" aria-label={section.title}>
      <thead className="sticky top-0 z-20 bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300">
        <tr>{section.fields.map(field => <th key={field.id} colSpan={hasOrigin ? '4' : '3'} className="min-w-56 border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">{field.label}</th>)}</tr>
        <tr>{section.fields.map(field => <Fragment key={field.id}><th className="border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">Valor</th><th className="border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">Verificación</th>{hasOrigin ? <th className="border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">Origen</th> : null}<th className="border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">Evaluación</th></Fragment>)}</tr>
      </thead>
      <tbody><tr>{section.fields.map(field => {
        const index = field.controlIndex;
        const verification = review?.verification?.[index] || 'NO DILIGENCIADO';
        const origin = review?.origin?.[index] || 'N/A';
        const evaluation = review?.evaluation?.[index] || '0';
        return <Fragment key={field.id}>
          <td className={`border-b border-r border-border px-2 py-1 font-semibold ${field.multiline ? 'whitespace-pre-line' : ''}`}>{field.value}</td>
          <td className={`border-b border-r border-border px-2 py-1 text-center font-semibold ${selectClass(verification, 'verification')}`}>{readOnly || !review || review.verificationReadOnly ? review ? reviewText(verification, 'verification') : 'Sin revisión' : <select aria-label={`Verificación de ${field.label}`} className={`h-7 w-full min-w-32 cursor-pointer rounded-md border border-border bg-background px-2 text-[11px] font-semibold ${selectClass(verification, 'verification')}`} value={verification} disabled={disabled} onChange={event => onReviewChange?.(index, 'verification', event.target.value)}>{verificationOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}</td>
          {hasOrigin ? <td className="border-b border-r border-border px-2 py-1 text-center font-semibold text-muted-foreground">{origin}</td> : null}
          <td className={`border-b border-r border-border px-2 py-1 text-center font-semibold ${selectClass(evaluation, 'evaluation')}`}>{readOnly || !review ? review ? reviewText(evaluation, 'evaluation') : 'Sin revisión' : <select aria-label={`Evaluación de ${field.label}`} className={`h-7 w-full min-w-28 cursor-pointer rounded-md border border-border bg-background px-2 text-[11px] font-semibold ${selectClass(evaluation, 'evaluation')}`} value={evaluation} disabled={disabled} onChange={event => onReviewChange?.(index, 'evaluation', event.target.value)}>{evaluationOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}</td>
        </Fragment>;
      })}</tr></tbody>
    </table>
  </div>;
}
