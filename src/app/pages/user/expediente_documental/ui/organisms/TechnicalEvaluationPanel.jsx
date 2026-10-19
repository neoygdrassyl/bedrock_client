import { useId, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DOCUMENTAL_SCOPE } from '../documentalScope';
import { Tag } from '../atoms/Tag';
import { CanonicalDocumentaryWorkspace } from './CanonicalDocumentaryWorkspace';
import { TECHNICAL_TAGS, toggleTechnicalTag } from '../../technicalEvaluationModel';

const CHIP_CLASS = 'inline-flex h-8 items-center gap-1.5 rounded-full border-[1px] border-solid px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none';
const CHIP_ACTIVE = 'border-[hsl(var(--primary)/0.4)] bg-primary/10 text-[hsl(var(--primary))]';
const CHIP_IDLE = 'border-[hsl(var(--border))] bg-background text-muted-foreground hover:border-[hsl(var(--primary)/0.4)] hover:text-foreground';

/**
 * Multi-select chips of the technical tags. `value` is the array of selected tags; "Todos" clears it.
 * Selecting every tag is equivalent to no filter, so the chips never leave the table empty by construction.
 */
export function TechnicalTagFilter({ value = [], onChange, id }) {
  const all = value.length === 0;
  return (
    <div id={id} className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar controles técnicos por etiqueta">
      <button type="button" aria-pressed={all} className={cn(CHIP_CLASS, all ? CHIP_ACTIVE : CHIP_IDLE)} onClick={() => onChange([])}>Todos</button>
      {TECHNICAL_TAGS.map((tag) => {
        const active = value.includes(tag.value);
        return (
          <button key={tag.value} type="button" aria-pressed={active} className={cn(CHIP_CLASS, active ? CHIP_ACTIVE : CHIP_IDLE)} onClick={() => onChange(toggleTechnicalTag(value, tag.value))}>
            {tag.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Evaluación técnica tab of a canonical expediente: the requirements with Central technical controls
 * (tags jurídico / arquitectónico / estructural), evaluated per delivery with the same control command as
 * Legal y debida forma. The tag chips narrow both the table and the controls shown in the evaluation sheet.
 */
export function TechnicalEvaluationPanel({ origin, canManage = false, reloadKey = 0, onEvaluationSaved }) {
  const ids = useId();
  const [tagFilter, setTagFilter] = useState([]);
  const selected = TECHNICAL_TAGS.filter((tag) => tagFilter.includes(tag.value)).map((tag) => tag.label);
  return (
    <section className={cn(DOCUMENTAL_SCOPE, 'flex min-w-0 flex-col gap-[0.75rem]')} aria-labelledby={`${ids}-title`} data-testid="technical-evaluation-panel">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-[1rem] gap-y-2 rounded-lg border bg-[hsl(var(--card))] px-[1rem] py-[0.75rem] shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardCheck className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <h2 id={`${ids}-title`} className="mb-0 text-sm font-semibold leading-5 text-foreground">Evaluación técnica</h2>
          {selected.length ? <Tag tone="info" pill aria-label={`Filtro: ${selected.join(', ')}`}>{selected.join(' · ')}</Tag> : null}
        </div>
        <TechnicalTagFilter id={`${ids}-tags`} value={tagFilter} onChange={setTagFilter} />
      </div>
      <CanonicalDocumentaryWorkspace
        origin={origin}
        canManage={canManage}
        variant="technical"
        embedded
        reloadKey={reloadKey}
        tagFilter={tagFilter}
        onEvaluationSaved={onEvaluationSaved}
      />
    </section>
  );
}

export default TechnicalEvaluationPanel;
