import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { SectionCard, SectionSubheading } from '@/shared/components/SectionCard.jsx';
import { DovelaButton, DovelaInput, DovelaTextarea } from '@/shared/dovela-ui';
import { cn } from '@/shared/lib/utils';
import { guardSubmit } from '@/shared/utils/submitGuard.js';
import { formatDisplayDate } from '@/shared/utils/formatDisplayDate.js';
import {
  ANSWERS,
  DECISIONS,
  KIND,
  MODALITY_LABELS,
  buildReviewJson,
  findStep,
  normalizeReview,
  suggestDecision,
} from './subdivisionCriteria.js';

/** The step endpoints default to multipart; the legal grid only accepts `json` as an object. */
export const JSON_REQUEST = Object.freeze({ headers: { 'Content-Type': 'application/json' } });

const NO_SECTIONS = Object.freeze([]);
const hasValue = value => value !== undefined && value !== null && value !== '';

/**
 * Loads and saves one review step (`sub_law` / `sub_arc`) through the generic step endpoints.
 *
 * `adapter`: { stepId, parentKey, service, stepsOf(record), fetchRecord(funId, version) }.
 * When the parent passes `currentRecord` (even null) it is used as is; when it is undefined the
 * hook loads the record itself from `funId`. After a save the hook reloads the record (so a
 * second save updates instead of creating) and calls `requestUpdateRecord(funId)` if given.
 */
export function useSubdivisionReviewStep({ adapter, currentRecord, currentVersionR, currentVersion, funId, requestUpdateRecord, keys }) {
  const selfLoading = currentRecord === undefined;
  const lookupVersion = hasValue(currentVersionR) ? currentVersionR : currentVersion;
  const [loadedRecord, setLoadedRecord] = useState(null);
  const [loading, setLoading] = useState(selfLoading && hasValue(funId));
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedOnce, setSavedOnce] = useState(false);

  const reload = useCallback(async () => {
    if (!hasValue(funId)) return null;
    const record = await adapter.fetchRecord(funId, lookupVersion);
    setLoadedRecord(record || null);
    return record;
  }, [adapter, funId, lookupVersion]);

  useEffect(() => {
    setLoadedRecord(null);
    if (!selfLoading || !hasValue(funId)) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    adapter.fetchRecord(funId, lookupVersion)
      .then(record => { if (!cancelled) setLoadedRecord(record || null); })
      .catch(() => { if (!cancelled) setLoadError('No fue posible cargar el informe del expediente.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, selfLoading, funId, lookupVersion, currentRecord]);

  const record = loadedRecord || currentRecord || null;
  const version = hasValue(currentVersionR) ? currentVersionR : record?.version;
  const step = findStep(adapter.stepsOf(record), adapter.stepId, version);
  const stepSignature = `${step?.id ?? ''}|${step?.updatedAt ?? ''}|${typeof step?.json === 'string' ? step.json : JSON.stringify(step?.json ?? null)}`;

  const [review, setReview] = useState(() => normalizeReview(step?.json));
  useEffect(() => {
    setReview(normalizeReview(step?.json));
  }, [stepSignature]);

  const setAnswer = useCallback((key, answer) => {
    setSavedOnce(false);
    setReview(prev => {
      const criteria = { ...prev.criteria };
      if (prev.criteria[key] === answer) delete criteria[key];
      else criteria[key] = answer;
      return { ...prev, criteria };
    });
  }, []);
  const setNote = useCallback((key, note) => {
    setSavedOnce(false);
    setReview(prev => ({ ...prev, notes: { ...prev.notes, [key]: note } }));
  }, []);
  const setObservations = useCallback((observations) => {
    setSavedOnce(false);
    setReview(prev => ({ ...prev, observations }));
  }, []);
  const setDecision = useCallback((decision) => {
    setSavedOnce(false);
    setReview(prev => ({ ...prev, decision: prev.decision === decision ? null : decision }));
  }, []);

  const save = useCallback(() => {
    if (!record?.id || !hasValue(version)) return undefined;
    return guardSubmit(`subdivision:${adapter.stepId}:${record.id}:${version}`, async () => {
      setSaving(true);
      setSaveError('');
      const payload = {
        id_public: adapter.stepId,
        version,
        [adapter.parentKey]: record.id,
        json: buildReviewJson(review, keys),
      };
      try {
        const response = step?.id
          ? await adapter.service.update_step(step.id, payload, JSON_REQUEST)
          : await adapter.service.create_step(payload, JSON_REQUEST);
        if (response?.data !== 'OK') throw new Error('La API no confirmó el guardado.');
        setSavedOnce(true);
        try {
          await reload();
        } catch {
          // The save went through; the parent refresh below still updates the record.
        }
        requestUpdateRecord?.(funId);
      } catch {
        setSaveError('No fue posible guardar la revisión. Intente nuevamente.');
      } finally {
        setSaving(false);
      }
    });
  }, [adapter, funId, keys, record?.id, reload, requestUpdateRecord, review, step?.id, version]);

  return { record, step, version, review, loading, loadError, saving, saveError, savedOnce, setAnswer, setNote, setObservations, setDecision, save };
}

const ANSWER_OPTIONS = {
  [KIND.CRITERION]: [
    { value: ANSWERS.SI, label: 'Sí' },
    { value: ANSWERS.NO, label: 'No' },
    { value: ANSWERS.NA, label: 'No aplica' },
  ],
  [KIND.FINDING]: [
    { value: ANSWERS.SI, label: 'Sí' },
    { value: ANSWERS.NO, label: 'No' },
  ],
};

function answerTone(kind, value) {
  if (value === ANSWERS.NA) return 'border-warning/45 bg-warning/10';
  const good = kind === KIND.FINDING ? ANSWERS.NO : ANSWERS.SI;
  return value === good ? 'border-accent/40 bg-accent/10' : 'border-destructive/40 bg-destructive/10';
}

function CriterionRow({ item, value, note, onAnswer, onNote, disabled }) {
  const labelId = useId();
  const [noteOpen, setNoteOpen] = useState(false);
  const showNote = noteOpen || Boolean(note);

  return (
    <li className="border-b border-border/70 py-2 last:border-b-0" data-criterion={item.key}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span id={labelId} className="min-w-0 flex-1 text-sm text-foreground">{item.label}</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <div role="group" aria-labelledby={labelId} className="flex items-center gap-1">
            {ANSWER_OPTIONS[item.kind].map(option => {
              const pressed = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn('ew-toggle-btn', pressed && answerTone(item.kind, option.value))}
                  aria-pressed={pressed}
                  disabled={disabled}
                  onClick={() => onAnswer(item.key, option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {!showNote ? (
            <DovelaButton tone="ghost" size="sm" disabled={disabled} onClick={() => setNoteOpen(true)} aria-label={`Agregar nota: ${item.label}`}>
              Nota
            </DovelaButton>
          ) : null}
        </div>
      </div>
      {showNote ? (
        <DovelaInput
          density="compact"
          className="mt-2"
          value={note || ''}
          maxLength={500}
          disabled={disabled}
          placeholder="Nota (opcional)"
          aria-label={`Nota: ${item.label}`}
          onChange={event => onNote(item.key, event.target.value)}
        />
      ) : null}
    </li>
  );
}

/** One group of criteria inside the review card. */
export function CriteriaSection({ section, review, onAnswer, onNote, disabled, first = false }) {
  const headingId = useId();
  return (
    <div role="region" aria-labelledby={headingId} data-section={section.id}>
      <SectionSubheading id={headingId} className={first ? 'ew-subheading--first' : undefined}>{section.title}</SectionSubheading>
      {section.description ? <p className="ew-field-hint text-muted-foreground">{section.description}</p> : null}
      <ul className="m-0 list-none p-0">
        {section.items.map(item => (
          <CriterionRow
            key={item.key}
            item={item}
            value={review.criteria[item.key]}
            note={review.notes[item.key]}
            onAnswer={onAnswer}
            onNote={onNote}
            disabled={disabled}
          />
        ))}
      </ul>
    </div>
  );
}

function countAnswers(review, items) {
  const counts = { SI: 0, NO: 0, NA: 0, pending: 0 };
  items.filter(item => item.kind === KIND.CRITERION).forEach(item => {
    const value = review.criteria[item.key];
    if (value) counts[value] += 1;
    else counts.pending += 1;
  });
  return counts;
}

/**
 * Card with the criteria sections, optional extra content (read-only data), observations,
 * the decision and the save action. Every visual is the shared `.ew-*` vocabulary.
 */
export function SubdivisionReviewForm({
  id,
  title,
  modality,
  sections,
  suggestionKeys,
  state,
  decisionLabels,
  canManage = true,
  missingRecordText,
  extraBetween = null,
  afterSections = NO_SECTIONS,
  testId,
}) {
  const { record, step, review, loading, loadError, saving, saveError, savedOnce, setAnswer, setNote, setObservations, setDecision, save } = state;
  const allSections = useMemo(() => [...sections, ...afterSections], [sections, afterSections]);
  const items = useMemo(() => allSections.flatMap(section => section.items), [allSections]);
  const counts = countAnswers(review, items);
  const suggestion = suggestDecision(review.criteria, suggestionKeys);
  const findings = items.filter(item => item.kind === KIND.FINDING && review.criteria[item.key] === ANSWERS.SI);
  const disabled = !canManage || !record?.id || saving;
  const observationsId = useId();
  const decisionId = useId();

  const meta = (
    <>
      <span className="ew-status-chip ew-status-chip--info">{modality ? MODALITY_LABELS[modality] : 'Todas las modalidades'}</span>
      <span className="ew-status-chip">Sí {counts.SI} · No {counts.NO} · No aplica {counts.NA} · Pendientes {counts.pending}</span>
    </>
  );

  return (
    <SectionCard id={id} title={title} meta={meta}>
      <div data-testid={testId}>
        {loading ? <p className="ew-notice" role="status">Cargando revisión…</p> : null}
        {loadError ? <p className="ew-notice ew-notice--danger" role="alert">{loadError}</p> : null}
        {!loading && !loadError && !record?.id ? <p className="ew-notice ew-notice--warning" role="status">{missingRecordText}</p> : null}

        {sections.map((section, index) => (
          <CriteriaSection
            key={section.id}
            section={section}
            review={review}
            onAnswer={setAnswer}
            onNote={setNote}
            disabled={disabled}
            first={index === 0}
          />
        ))}

        {extraBetween}

        {afterSections.map(section => (
          <CriteriaSection
            key={section.id}
            section={section}
            review={review}
            onAnswer={setAnswer}
            onNote={setNote}
            disabled={disabled}
          />
        ))}

        {findings.length ? (
          <p className="ew-notice ew-notice--warning" role="status">
            El certificado registra anotaciones que deben valorarse: {findings.map(item => item.label.toLowerCase()).join('; ')}.
          </p>
        ) : null}

        <SectionSubheading id={observationsId}>Observaciones</SectionSubheading>
        <DovelaTextarea
          aria-labelledby={observationsId}
          value={review.observations}
          maxLength={4000}
          disabled={disabled}
          placeholder="Observaciones de la revisión (máximo 4000 caracteres)"
          onChange={event => setObservations(event.target.value)}
        />

        <SectionSubheading id={decisionId}>Decisión</SectionSubheading>
        <div role="group" aria-labelledby={decisionId} className="ew-option-row">
          {[DECISIONS.PROCEDENTE, DECISIONS.NO_PROCEDENTE].map(decision => (
            <button
              key={decision}
              type="button"
              className={cn('ew-toggle-btn', review.decision === decision && (decision === DECISIONS.PROCEDENTE ? 'border-accent/40 bg-accent/10' : 'border-destructive/40 bg-destructive/10'))}
              aria-pressed={review.decision === decision}
              disabled={disabled}
              onClick={() => setDecision(decision)}
            >
              {decisionLabels[decision]}
            </button>
          ))}
        </div>
        {suggestion === DECISIONS.NO_PROCEDENTE && review.decision !== DECISIONS.NO_PROCEDENTE ? (
          <div className="ew-notice ew-notice--warning flex flex-wrap items-center gap-2" role="status" data-testid="decision-suggestion">
            <span>Hay criterios marcados en No. Se sugiere: {decisionLabels[DECISIONS.NO_PROCEDENTE]}.</span>
            <DovelaButton tone="neutral" size="sm" disabled={disabled} onClick={() => setDecision(DECISIONS.NO_PROCEDENTE)}>
              Usar sugerencia
            </DovelaButton>
          </div>
        ) : null}
        {suggestion === null && counts.pending > 0 ? (
          <p className="ew-field-hint text-muted-foreground">Faltan {counts.pending} criterios por evaluar.</p>
        ) : null}

        {saveError ? <p className="ew-notice ew-notice--danger" role="alert">{saveError}</p> : null}
        <div className="ew-actions">
          <DovelaButton onClick={save} loading={saving} loadingLabel="Guardando…" disabled={disabled}>
            Guardar revisión
          </DovelaButton>
          {savedOnce && !saving ? <span className="text-sm ew-text-success" role="status">Revisión guardada</span> : null}
          {!savedOnce && step?.updatedAt ? (
            <span className="text-sm text-muted-foreground">Última actualización: {formatDisplayDate(step.updatedAt, { withTime: true })}</span>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}
