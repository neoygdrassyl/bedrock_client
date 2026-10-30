import { Tag } from '../atoms/Tag';
import { EVALUATION_META, evaluationOf, evaluationReviewer } from '../../canonicalDocumentaryModel';

/**
 * Evaluation of one delivery: Aprobado / Rechazado / Sin evaluar tag (a dash when it does not apply)
 * and, once evaluated, a tiny muted "por {name}" line.
 */
export function EvaluationStatus({ evaluation, row, showReviewer = true }) {
  const value = evaluation || evaluationOf(row);
  const meta = EVALUATION_META[value.status] || EVALUATION_META.not_applicable;
  if (value.status === 'not_applicable' || !EVALUATION_META[value.status]) {
    return <span className="text-xs text-muted-foreground" aria-label="No aplica">{meta.label}</span>;
  }
  const reviewer = showReviewer ? evaluationReviewer(value) : null;
  return (
    <>
      <Tag tone={meta.tone}>{meta.label}</Tag>
      {reviewer ? <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">por {reviewer}</span> : null}
    </>
  );
}

export default EvaluationStatus;
