import { useEffect, useId, useMemo, useState } from 'react';
import RecordArcService from '../../api/record_arc.service';
import FunService from '../../api/fun.service';
import { SectionSubheading } from '@/shared/components/SectionCard.jsx';
import {
  ARC_SECTIONS,
  DECISIONS,
  KIND,
  SUB_ARC_STEP,
  itemsOf,
  modalityFromFun,
  visibleSections,
} from '../subdivision/subdivisionCriteria.js';
import { SubdivisionReviewForm, useSubdivisionReviewStep } from '../subdivision/SubdivisionReviewForm.jsx';

const DECISION_LABELS = {
  [DECISIONS.PROCEDENTE]: 'Viable',
  [DECISIONS.NO_PROCEDENTE]: 'No viable',
};

/** record_arc_step `sub_arc` (RecordArcService.getRecord returns { record_arc, record_arc_steps, ... }). */
export const ARC_STEP_ADAPTER = Object.freeze({
  stepId: SUB_ARC_STEP,
  parentKey: 'recordArcId',
  service: RecordArcService,
  stepsOf: record => record?.record_arc_steps,
  fetchRecord: async (funId) => {
    const response = await RecordArcService.getRecord(funId);
    const data = response?.data;
    if (!data?.record_arc) return null;
    return { ...data.record_arc, record_arc_steps: Array.isArray(data.record_arc_steps) ? data.record_arc_steps : [] };
  },
});

const text = value => (value === undefined || value === null || String(value).trim() === '' ? '' : String(value).trim());

function pointText(label, x, y) {
  const coords = text(x) || text(y) ? `(${text(x) || '—'}, ${text(y) || '—'})` : '';
  return [text(label), coords].filter(Boolean).join(' ');
}

/** fun_4_technicals row (technical or legacy shape) to the five columns of the acta. */
export function boundaryRow(row) {
  const from = pointText(row?.puntoInicialEtiqueta, row?.puntoInicialX, row?.puntoInicialY);
  const to = pointText(row?.puntoFinalEtiqueta, row?.puntoFinalX, row?.puntoFinalY);
  return {
    id: row?.id,
    lindero: text(row?.lindero) || text(row?.coord) || '—',
    coordenadas: from || to ? `${from || '—'} → ${to || '—'}` : '—',
    distancia: text(row?.distancia) || text(row?.longitud) || '—',
    rumbo: text(row?.rumbo) || '—',
    colindante: text(row?.colindante) || text(row?.colinda) || '—',
  };
}

export function BoundariesTable({ boundaries, loading = false }) {
  const headingId = useId();
  const rows = (Array.isArray(boundaries) ? boundaries : []).map(boundaryRow);

  return (
    <div role="region" aria-labelledby={headingId} data-section="linderos">
      <SectionSubheading id={headingId}>Cuadro de linderos</SectionSubheading>
      {loading ? <p className="ew-field-hint text-muted-foreground" role="status">Cargando linderos técnicos…</p> : null}
      {!loading && !rows.length ? (
        <div className="ew-empty">
          <p className="ew-empty__text">El solicitante no registró linderos técnicos</p>
        </div>
      ) : null}
      {rows.length ? (
        <div className="ew-table-scroll" tabIndex={0} aria-labelledby={headingId}>
          <table className="ew-grid-table">
            <thead>
              <tr>
                <th scope="col">Lindero</th>
                <th scope="col">Coordenadas</th>
                <th scope="col" className="ew-cell-num">Distancia (m)</th>
                <th scope="col">Rumbo</th>
                <th scope="col">Colindante</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id ?? index}>
                  <th scope="row">{row.lindero}</th>
                  <td className="ew-num">{row.coordenadas}</td>
                  <td className="ew-cell-num ew-num">{row.distancia}</td>
                  <td>{row.rumbo}</td>
                  <td>{row.colindante}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

/** FUN with fun_4_technicals: the given item, or loaded from `currentId` when the parent has none. */
function useFunItem(currentItem, currentId) {
  const [loadedItem, setLoadedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const needsLoad = !currentItem && currentId !== undefined && currentId !== null && currentId !== '';

  useEffect(() => {
    if (!needsLoad) return undefined;
    let cancelled = false;
    setLoading(true);
    FunService.get(currentId)
      .then(response => { if (!cancelled) setLoadedItem(response?.data || null); })
      .catch(() => { if (!cancelled) setLoadedItem(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [needsLoad, currentId]);

  return { item: currentItem || loadedItem, loading };
}

/**
 * "Revisión arquitectónica · Subdivisión": planimetry and urban-norm criteria of a Licencia de
 * subdivisión plus the FUN technical boundaries, saved as record_arc_step `sub_arc` with json
 * `{ criteria, notes, observations, decision }` (Viable = procedente, No viable = no_procedente).
 *
 * Props:
 * - currentId: FUN id (the moduleProps of the expediente workspace). Used to load what is not given.
 * - currentItem: FUN (fun_0 with fun_1s and fun_4_technicals). Omit it to load it from `currentId`.
 * - expediente: optional route payload; only used to read the modality when `currentItem` is not loaded yet.
 * - currentVersion: FUN version (selects fun_1s for the modality).
 * - currentRecord: record_arc with `record_arc_steps`. Omit it (undefined) to let the component load it.
 * - currentVersionR: record_arc version (defaults to currentRecord.version).
 * - requestUpdateRecord(funId): optional, called after a successful save.
 * - modality: 'rural' | 'urbana' | 'reloteo' | null. Omit it to derive it from fun_1.m_sub; null shows every criterion.
 * - canManage: false makes the review read-only (default true).
 */
export default function SubdivisionArchitectureCriteria({
  currentItem,
  currentId,
  expediente,
  currentVersion,
  currentRecord,
  currentVersionR,
  requestUpdateRecord,
  modality: modalityProp,
  canManage = true,
}) {
  const { item: fun, loading: funLoading } = useFunItem(currentItem, currentId);
  const modality = modalityProp !== undefined
    ? modalityProp
    : modalityFromFun(fun, currentVersion) ?? modalityFromFun(expediente, currentVersion);
  const sections = useMemo(() => visibleSections(ARC_SECTIONS, modality), [modality]);
  const planimetry = sections.filter(section => section.id === 'planimetria');
  const norm = sections.filter(section => section.id !== 'planimetria');
  const keys = useMemo(() => itemsOf(sections).map(item => item.key), [sections]);
  const criterionKeys = useMemo(() => itemsOf(sections).filter(item => item.kind === KIND.CRITERION).map(item => item.key), [sections]);

  const state = useSubdivisionReviewStep({
    adapter: ARC_STEP_ADAPTER,
    currentRecord,
    currentVersionR,
    currentVersion,
    funId: fun?.id ?? currentId,
    requestUpdateRecord,
    keys,
  });

  return (
    <SubdivisionReviewForm
      id="record_arc_subdivision_criteria"
      testId="subdivision-architecture-criteria"
      title="Revisión arquitectónica · Subdivisión"
      modality={modality}
      sections={planimetry}
      afterSections={norm}
      extraBetween={<BoundariesTable boundaries={fun?.fun_4_technicals} loading={funLoading} />}
      suggestionKeys={criterionKeys}
      state={state}
      decisionLabels={DECISION_LABELS}
      canManage={canManage}
      missingRecordText="La revisión estará disponible cuando se cree el informe arquitectónico."
    />
  );
}
