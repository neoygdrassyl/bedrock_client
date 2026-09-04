import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  _FUN_101_PARSER,
  _FUN_102_PARSER,
  _FUN_1_PARSER,
  _FUN_2_PARSER,
  _FUN_3_PARSER,
  _FUN_4_PARSER,
  _FUN_5_PARSER,
  _FUN_6_PARSER,
  _FUN_7_PARSER,
  _FUN_8_PARSER,
  _FUN_9_PARSER,
} from '../../../../components/customClasses/funCustomArrays';
import RecordLawService from '../../../../services/record_law.service';
import MatrixInformationTable from './MatrixInformationTable';

const STEP_ID = 's23';
const DEFAULT_VERIFICATION = 'NO DILIGENCIADO';
const DEFAULT_EVALUATION = '0';

const FIELDS = [
  { label: '1.1 Tipo de trámite', field: 'tipo', parser: _FUN_1_PARSER },
  { label: '1.2 Objeto', field: 'tramite', parser: _FUN_2_PARSER },
  { label: '1.3 Modalidad licencia de urbanización', field: 'm_urb', parser: _FUN_3_PARSER },
  { label: '1.4 Modalidad licencia de subdivisión', field: 'm_sub', parser: _FUN_4_PARSER },
  { label: '1.5 Modalidad licencia de construcción', field: 'm_lic', parser: _FUN_5_PARSER },
  { label: '1.6 Usos', field: 'usos', parser: _FUN_6_PARSER },
  { label: '1.7 Área construida', field: 'area', parser: _FUN_7_PARSER },
  { label: '1.8 Tipo de vivienda', field: 'vivienda', parser: _FUN_8_PARSER },
  { label: '1.9 Bien de interés cultural', field: 'cultural', parser: _FUN_9_PARSER },
  { label: '1.10.1 Declaración sobre medidas de construcción sostenible', field: 'regla_1', parser: _FUN_101_PARSER, model2021Only: true },
  { label: '1.10.2 Zonificación climática', field: 'regla_2', parser: _FUN_102_PARSER, model2021Only: true },
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

function normalizeVerification(value) {
  if (value === 'VERIFICADO') return 'DILIGENCIADO';
  return verificationOptions.some(option => option.value === value) ? value : DEFAULT_VERIFICATION;
}

function normalizeEvaluation(value) {
  const normalized = String(value ?? '');
  return evaluationOptions.some(option => option.value === normalized) ? normalized : DEFAULT_EVALUATION;
}

function serializedValues(value) {
  return typeof value === 'string' ? value.split(';') : [];
}

function fieldValue(value) {
  return value === undefined || value === null || value === '' ? 'Sin registro' : value;
}

function isUnregistered(value) {
  return String(value).trim().toLocaleLowerCase('es-CO') === 'sin registro';
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

export default function IdentificationRequestDataGrid({ currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord, viewModel }) {
  const forms = Array.isArray(currentItem?.fun_1s) ? currentItem.fun_1s : [];
  const steps = Array.isArray(currentRecord?.record_law_steps) ? currentRecord.record_law_steps : [];
  const form = forms.find(item => String(item?.version) === String(currentVersion))
    || forms[Math.max(0, Number(currentVersion) - 1)]
    || null;
  const step = steps.find(item => String(item?.version) === String(currentVersionR) && item?.id_public === STEP_ID);
  const sharedSection = viewModel?.sections?.find(section => section.id === 'identification');
  const allRows = useMemo(() => sharedSection?.fields || FIELDS
    .filter(item => !item.model2021Only || Number(currentItem?.model) === 2021)
    .map((item, controlIndex) => ({
      ...item,
      id: item.field,
      controlIndex,
      value: fieldValue(item.parser(form?.[item.field])),
    })), [currentItem?.model, form, sharedSection]);
  const rows = allRows.filter(row => !isUnregistered(row.value));
  const [controls, setControls] = useState({ verification: [], evaluation: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verification = serializedValues(step?.value);
    const evaluation = serializedValues(step?.check);
    setControls({
      verification: allRows.map((_, index) => normalizeVerification(verification[index])),
      evaluation: allRows.map((_, index) => normalizeEvaluation(evaluation[index + 1])),
    });
  }, [allRows, step?.check, step?.value]);

  const canPersist = Boolean(currentRecord?.id && currentVersionR !== undefined && currentVersionR !== null);

  const saveControl = async (controlIndex, kind, value) => {
    if (!canPersist || saving) return;

    const previous = controls;
    const next = {
      verification: allRows.map((_, index) => normalizeVerification(
        kind === 'verification' && index === controlIndex ? value : controls.verification[index],
      )),
      evaluation: allRows.map((_, index) => normalizeEvaluation(
        kind === 'evaluation' && index === controlIndex ? value : controls.evaluation[index],
      )),
    };
    setControls(next);
    setError('');
    setSaving(true);

    const data = new FormData();
    data.set('value', next.verification.join(';'));
    data.set('check', [DEFAULT_EVALUATION, ...next.evaluation].join(';'));
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
      setError('No fue posible guardar la verificación. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return <section className="mt-3 rounded-lg border border-border bg-card p-3" aria-label="Tabla consolidada de identificación de la solicitud">
    <div className="mb-3">
      <h3 className="mb-1 text-sm font-semibold">1. Identificación de la solicitud</h3>
      <p className="mb-0 text-xs text-muted-foreground">Información consolidada para consulta y verificación.</p>
    </div>
    {error ? <p className="mb-2 text-xs text-destructive" role="alert">{error}</p> : null}
    {!canPersist ? <p className="mb-2 text-xs text-muted-foreground" role="status">La verificación estará disponible cuando se cargue el informe jurídico.</p> : null}
    {rows.length === 0 ? <p className="px-3 py-2 text-xs text-muted-foreground">No hay información diligenciada para verificar.</p> : <MatrixInformationTable section={{ id: 'identification', title: 'Identificación de la solicitud', fields: rows }} reviewState={{ status: 'ready', identification: controls }} mode="interactive" disabled={!canPersist || saving} onReviewChange={saveControl} />}
  </section>;
}
