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

export default function MatrixInformationTable({ section, reviewState, mode = 'readonly', onReviewChange, disabled = false }) {
  const review = reviewState?.status === 'ready' ? reviewState[section.id] : null;
  const readOnly = mode === 'readonly';

  return <div className="max-h-[70vh] overflow-auto rounded-md border border-border">
    <table className="min-w-max border-separate border-spacing-0 text-[11px] text-foreground" aria-label={section.title}>
      <thead className="sticky top-0 z-20 bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300">
        <tr>{section.fields.map(field => <th key={field.id} colSpan="3" className="min-w-56 border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">{field.label}</th>)}</tr>
        <tr>{section.fields.map(field => <Fragment key={field.id}><th className="border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">Valor</th><th className="border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">Verificación</th><th className="border-b border-r border-slate-400 px-2 py-1 text-center text-[9px] font-semibold uppercase dark:border-slate-600">Evaluación</th></Fragment>)}</tr>
      </thead>
      <tbody><tr>{section.fields.map(field => {
        const index = field.controlIndex;
        const verification = review?.verification?.[index] || 'NO DILIGENCIADO';
        const evaluation = review?.evaluation?.[index] || '0';
        return <Fragment key={field.id}>
          <td className={`border-b border-r border-border px-2 py-1 font-semibold ${field.multiline ? 'whitespace-pre-line' : ''}`}>{field.value}</td>
          <td className={`border-b border-r border-border px-2 py-1 text-center font-semibold ${selectClass(verification, 'verification')}`}>{readOnly || !review ? review ? reviewText(verification, 'verification') : 'Sin revisión' : <select aria-label={`Verificación de ${field.label}`} className={`h-7 w-full min-w-32 cursor-pointer rounded-md border border-border bg-background px-2 text-[11px] font-semibold ${selectClass(verification, 'verification')}`} value={verification} disabled={disabled} onChange={event => onReviewChange?.(index, 'verification', event.target.value)}>{verificationOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}</td>
          <td className={`border-b border-r border-border px-2 py-1 text-center font-semibold ${selectClass(evaluation, 'evaluation')}`}>{readOnly || !review ? review ? reviewText(evaluation, 'evaluation') : 'Sin revisión' : <select aria-label={`Evaluación de ${field.label}`} className={`h-7 w-full min-w-28 cursor-pointer rounded-md border border-border bg-background px-2 text-[11px] font-semibold ${selectClass(evaluation, 'evaluation')}`} value={evaluation} disabled={disabled} onChange={event => onReviewChange?.(index, 'evaluation', event.target.value)}>{evaluationOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}</td>
        </Fragment>;
      })}</tr></tbody>
    </table>
  </div>;
}
