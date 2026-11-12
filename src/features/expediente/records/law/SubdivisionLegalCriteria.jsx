import { useMemo } from 'react';
import RecordLawService from '../../api/record_law.service';
import {
  DECISIONS,
  KIND,
  LEGAL_SECTIONS,
  SUB_LAW_STEP,
  itemsOf,
  modalityFromFun,
  visibleSections,
} from '../subdivision/subdivisionCriteria.js';
import { SubdivisionReviewForm, useSubdivisionReviewStep } from '../subdivision/SubdivisionReviewForm.jsx';

const DECISION_LABELS = {
  [DECISIONS.PROCEDENTE]: 'Procedente',
  [DECISIONS.NO_PROCEDENTE]: 'No procedente',
};

/** record_law_step `sub_law` of the legal report (RecordLawService.getRecord returns every record_law of the FUN). */
export const LAW_STEP_ADAPTER = Object.freeze({
  stepId: SUB_LAW_STEP,
  parentKey: 'recordLawId',
  service: RecordLawService,
  stepsOf: record => record?.record_law_steps,
  fetchRecord: async (funId, version) => {
    const response = await RecordLawService.getRecord(funId);
    const records = Array.isArray(response?.data) ? response.data : [];
    return records.find(item => String(item?.fun0Id) === String(funId)
      && (version === undefined || version === null || String(item?.version) === String(version))) || null;
  },
});

/**
 * "Revisión jurídica · Subdivisión": legal criteria of a Licencia de subdivisión, saved as
 * record_law_step `sub_law` with json `{ criteria, notes, observations, decision }`.
 *
 * Props:
 * - currentItem: FUN (fun_0 with fun_1s); its `id` is the FUN id. Optional when `currentId` is given.
 * - currentId: FUN id, used when `currentItem` is not available.
 * - currentVersion: FUN version (selects fun_1s for the modality and the record to load).
 * - currentRecord: record_law with `record_law_steps`. Omit it (undefined) to let the component load it.
 * - currentVersionR: record_law version (defaults to currentRecord.version).
 * - requestUpdateRecord(funId): optional, called after a successful save so the parent refreshes.
 * - modality: 'rural' | 'urbana' | 'reloteo' | null. Omit it to derive it from fun_1.m_sub; null shows every criterion.
 * - canManage: false makes the review read-only (default true).
 */
export default function SubdivisionLegalCriteria({
  currentItem,
  currentId,
  currentVersion,
  currentRecord,
  currentVersionR,
  requestUpdateRecord,
  modality: modalityProp,
  canManage = true,
}) {
  const modality = modalityProp !== undefined ? modalityProp : modalityFromFun(currentItem, currentVersion);
  const sections = useMemo(() => visibleSections(LEGAL_SECTIONS, modality), [modality]);
  const keys = useMemo(() => itemsOf(sections).map(item => item.key), [sections]);
  const criterionKeys = useMemo(() => itemsOf(sections).filter(item => item.kind === KIND.CRITERION).map(item => item.key), [sections]);

  const state = useSubdivisionReviewStep({
    adapter: LAW_STEP_ADAPTER,
    currentRecord,
    currentVersionR,
    currentVersion,
    funId: currentItem?.id ?? currentId,
    requestUpdateRecord,
    keys,
  });

  return (
    <SubdivisionReviewForm
      id="record_law_subdivision"
      testId="subdivision-legal-criteria"
      title="Revisión jurídica · Subdivisión"
      modality={modality}
      sections={sections}
      suggestionKeys={criterionKeys}
      state={state}
      decisionLabels={DECISION_LABELS}
      canManage={canManage}
      missingRecordText="La revisión estará disponible cuando se cree el informe jurídico de esta versión."
    />
  );
}
