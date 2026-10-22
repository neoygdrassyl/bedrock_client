import { UserCheck } from 'lucide-react';
import { DovelaBadge } from '@/shared/dovela-ui';
import { formatDateTime, hasValue, labelFor, plural } from '../onlineRadicationModel';
import { CountPill, DetailCard, EmptyNote } from './DetailPrimitives';

const EFFECT_META = {
  complies: { label: 'Cumple', tone: 'success' },
  does_not_comply: { label: 'No cumple', tone: 'danger' },
  no_decision: { label: 'Sin decisión', tone: 'neutral' },
};
const effectMeta = (effect) => EFFECT_META[effect] || { label: 'Sin respuesta', tone: 'outline' };

const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

/**
 * Documents of the self-assessment with their label resolved from the evaluated requirements (or the
 * snapshot labels), and only the ones that carry items. Exported for tests.
 */
export function buildSelfAssessmentRows(item) {
  const assessment = item?.selfAssessment;
  if (!assessment || typeof assessment !== 'object') return [];
  const evaluated = new Map(asArray(item?.evaluatedDocuments).map((doc) => [doc.documentCode, doc]));
  const labels = item?.snapshot?.summary?.labels && typeof item.snapshot.summary.labels === 'object' ? item.snapshot.summary.labels : {};
  return asArray(assessment.documents).map((doc, index) => {
    const code = doc.documentCode || null;
    const requirement = code ? evaluated.get(code) : null;
    return {
      key: code || `doc-${index}`,
      code,
      label: requirement?.label || (code ? labelFor(labels, code) : null) || 'Documento sin código',
      items: asArray(doc.items),
      summary: doc.summary && typeof doc.summary === 'object' ? doc.summary : null,
    };
  });
}

function SummaryText({ summary }) {
  if (!summary) return null;
  const parts = [`${Number(summary.complies) || 0} cumple`, `${Number(summary.doesNotComply) || 0} no cumple`];
  if (Number(summary.noDecision) > 0) parts.push(`${Number(summary.noDecision)} sin decisión`);
  return <span className="text-xs text-muted-foreground">{parts.join(' · ')}</span>;
}

function AssessmentItem({ item }) {
  const meta = effectMeta(item.effect);
  const when = hasValue(item.assessedAt) ? formatDateTime(item.assessedAt) : null;
  return (
    <li className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-[0.75rem] gap-y-1">
        <p className="mb-0 min-w-0 flex-1 text-sm leading-5 text-foreground">{item.title || item.controlId || 'Control sin título'}</p>
        <DovelaBadge tone={meta.tone}>{meta.label}</DovelaBadge>
      </div>
      <p className="mb-0 flex flex-wrap items-center gap-x-1.5 text-xs leading-5 text-muted-foreground">
        {hasValue(item.valueLabel) ? <span>{item.valueLabel}</span> : null}
        {when ? <><span aria-hidden="true">·</span><span>{when}</span></> : null}
      </p>
      {hasValue(item.observation) ? <p className="mb-0 whitespace-pre-line text-xs leading-5 text-foreground/90">{item.observation}</p> : null}
    </li>
  );
}

/**
 * Autoevaluación del solicitante: the answers the citizen gave in the portal to the technical and checking
 * controls of each document. Informative only. Hidden when the request carries no self-assessment.
 */
export function SelfAssessmentSection({ item }) {
  const rows = buildSelfAssessmentRows(item);
  if (!rows.length) return null;
  const total = rows.reduce((count, row) => count + row.items.length, 0);
  return (
    <DetailCard
      icon={UserCheck}
      title="Autoevaluación del solicitante"
      aside={<CountPill label={plural(total, 'respuesta')}>{total}</CountPill>}
      contentClassName="flex flex-col gap-[0.875rem]"
    >
      <ul className="mb-0 list-none space-y-[0.75rem] p-0" aria-label="Documentos autoevaluados">
        {rows.map((row) => (
          <li key={row.key} className="min-w-0 rounded-lg border bg-muted/20 px-[0.875rem] py-[0.75rem]">
            <header className="mb-2 flex flex-wrap items-baseline justify-between gap-x-[0.75rem] gap-y-1">
              <h4 className="mb-0 min-w-0 flex-1 text-sm font-semibold leading-5 text-foreground">
                {row.label}
                {row.code ? <span className="ml-1.5 font-mono text-xs font-normal text-muted-foreground">{row.code}</span> : null}
              </h4>
              <SummaryText summary={row.summary} />
            </header>
            {row.items.length ? (
              <ul className="mb-0 list-none divide-y divide-border/70 p-0">
                {row.items.map((entry, index) => <AssessmentItem key={entry.controlId || index} item={entry} />)}
              </ul>
            ) : <EmptyNote>El solicitante no respondió controles de este documento.</EmptyNote>}
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}

export default SelfAssessmentSection;
