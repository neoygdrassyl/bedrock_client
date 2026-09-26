import { Fragment, useEffect, useMemo, useState } from 'react';
import { _FUN_24_PARSER, _FUN_25_PARSER } from '../../../../components/customClasses/funCustomArrays';
import RecordLawService from '../../../../services/record_law.service';
import MatrixInformationTable from './MatrixInformationTable';

const STEP_ID = 's24';
const CONTROL_COUNT = 8;
const DEFAULT_VERIFICATION = 'NO DILIGENCIADO';
const DEFAULT_EVALUATION = '0';

const FIELDS = [
  { label: '2.1 Dirección actual', controlIndex: 0, getValue: property => property?.direccion },
  { label: '2.1 Dirección anterior', controlIndex: 1, getValue: property => property?.direccion_ant },
  { label: '2.2 Matrícula inmobiliaria', controlIndex: 2, getValue: property => property?.matricula },
  { label: '2.3 ID. catastral (viejo)', controlIndex: 3, getValue: property => property?.catastral },
  { label: '2.3.2 ID. catastral (nuevo)', controlIndex: 7, getValue: property => property?.catastral_2 },
  { label: '2.4 Clasificación del suelo', controlIndex: 4, getValue: property => _FUN_24_PARSER(property?.suelo) },
  { label: '2.5 Planimetría del lote', controlIndex: 5, getValue: property => _FUN_25_PARSER(property?.lote_pla) },
  { label: '2.6 Ubicación', controlIndex: 6, isLocation: true, getValue: property => locationValue(property) },
];

const verificationOptions = [
  { value: 'NO DILIGENCIADO', label: 'No diligenciado' },
  { value: 'DILIGENCIADO', label: 'Diligenciado' },
  { value: 'NO APLICA', label: 'No aplica' },
];

const evaluationOptions = [
  { value: '0', label: 'No cumple' },
  { value: '1', label: 'Cumple' },
  { value: '2', label: 'No aplica' },
];

function locationValue(property) {
  return [
    ['Barrio', property?.barrio],
    ['Vereda', property?.vereda],
    ['Comuna', property?.comuna],
    ['Sector', property?.sector],
    ['Corregimiento', property?.corregimiento],
    ['Lote', property?.lote],
    ['Estrato', property?.estrato],
    ['Manzana', property?.manzana],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

function fieldValue(value) {
  return value === undefined || value === null || value === '' ? 'Sin registro' : String(value);
}

function serializedValues(value) {
  return typeof value === 'string' ? value.split(';') : [];
}

function normalizeVerification(value) {
  if (value === 'VERIFICADO') return 'DILIGENCIADO';
  return verificationOptions.some(option => option.value === value) ? value : DEFAULT_VERIFICATION;
}

function normalizeEvaluation(value) {
  const normalized = String(value ?? '');
  return evaluationOptions.some(option => option.value === normalized) ? normalized : DEFAULT_EVALUATION;
}

function selectClass(value, kind) {
  if (kind === 'verification') {
    if (value === 'DILIGENCIADO') return 'text-emerald-700';
    if (value === 'NO APLICA') return 'text-amber-700';
    return 'text-destructive';
  }
  if (value === '1') return 'text-emerald-700';
  if (value === '2') return 'text-amber-700';
  return 'text-destructive';
}

export default function PropertyInformationDataGrid({ currentItem, currentRecord, currentVersionR, requestUpdateRecord, viewModel }) {
  const property = currentItem?.fun_2 || null;
  const steps = Array.isArray(currentRecord?.record_law_steps) ? currentRecord.record_law_steps : [];
  const step = steps.find(item => String(item?.version) === String(currentVersionR) && item?.id_public === STEP_ID);
  const sharedSection = viewModel?.sections?.find(section => section.id === 'property');
  const rows = useMemo(() => sharedSection?.fields || FIELDS.map(field => ({
    ...field,
    id: field.controlIndex,
    value: fieldValue(field.getValue(property)),
  })), [property, sharedSection]);
  const [controls, setControls] = useState({ verification: [], evaluation: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canPersist = Boolean(currentRecord?.id && currentVersionR !== undefined && currentVersionR !== null);

  useEffect(() => {
    const verification = serializedValues(step?.value);
    const evaluation = serializedValues(step?.check);
    setControls({
      verification: Array.from({ length: CONTROL_COUNT }, (_, index) => normalizeVerification(verification[index])),
      evaluation: Array.from({ length: CONTROL_COUNT }, (_, index) => normalizeEvaluation(evaluation[index])),
    });
  }, [step?.check, step?.value]);

  const saveControl = async (controlIndex, kind, value) => {
    if (!canPersist || saving) return;

    const previous = controls;
    const next = {
      verification: Array.from({ length: CONTROL_COUNT }, (_, index) => normalizeVerification(
        kind === 'verification' && index === controlIndex ? value : controls.verification[index],
      )),
      evaluation: Array.from({ length: CONTROL_COUNT }, (_, index) => normalizeEvaluation(
        kind === 'evaluation' && index === controlIndex ? value : controls.evaluation[index],
      )),
    };
    setControls(next);
    setError('');
    setSaving(true);

    const data = new FormData();
    data.set('value', next.verification.join(';'));
    data.set('check', next.evaluation.join(';'));
    data.set('version', currentVersionR);
    data.set('recordLawId', currentRecord.id);
    data.set('id_public', STEP_ID);

    try {
      const response = step?.id
        ? await RecordLawService.update_step(step.id, data)
        : await RecordLawService.create_step(data);
      if (response?.data !== 'OK') throw new Error('La API no confirmó la actualización.');
      requestUpdateRecord?.(currentItem?.id);
    } catch {
      setControls(previous);
      setError('No fue posible guardar la verificación del predio. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return <section className="mt-3 rounded-lg border border-border bg-card p-3" aria-label="Tabla consolidada de información sobre el predio">
    <div className="mb-3">
      <h3 className="mb-1 text-sm font-semibold">2. Información sobre el predio</h3>
      <p className="mb-0 text-xs text-muted-foreground">Información consolidada para consulta y verificación.</p>
    </div>
    {error ? <p className="mb-2 text-xs text-destructive" role="alert">{error}</p> : null}
    {!canPersist ? <p className="mb-2 text-xs text-muted-foreground" role="status">La verificación estará disponible cuando se cargue el informe jurídico.</p> : null}
    <MatrixInformationTable section={{ id: 'property', title: 'Información sobre el predio', fields: rows }} reviewState={{ status: 'ready', property: controls }} mode="interactive" disabled={!canPersist || saving} onReviewChange={saveControl} />
  </section>;
}
