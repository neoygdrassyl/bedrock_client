import { useEffect, useMemo, useState } from 'react';
import VIZUALIZER from '../../../../components/vizualizer.component';
import RecordLawService from '../../../../services/record_law.service';

const STEP_ID = 'f53';

const CHECKS = [
  { index: 0, group: 'power', label: 'Notariado', options: [['0', 'No'], ['1', 'Sí'], ['2', 'N/A']] },
  { index: 4, group: 'power', label: 'Tipo de poder', options: [['0', 'General'], ['1', 'Especial'], ['2', 'Mandato'], ['3', 'No aplica']] },
  { index: 6, group: 'power', label: 'Señala mandato', options: [['0', 'No'], ['1', 'Sí'], ['2', 'N/A']] },
  { index: 5, group: 'power', label: 'Cert. vigencia', options: [['0', 'No'], ['1', 'Sí'], ['2', 'N/A']] },
  { index: 7, group: 'power', label: 'Firmado ambas partes', options: [['0', 'No'], ['1', 'Sí'], ['2', 'N/A']] },
  { index: 1, group: 'signatures', label: 'FUN', options: [['0', 'No'], ['1', 'Sí'], ['2', 'N/A']] },
  { index: 2, group: 'signatures', label: 'Legitimado', options: [['0', 'No'], ['1', 'Sí'], ['2', 'N/A']] },
  { index: 3, group: 'notification', label: 'Notif. electrónica', options: [['0', 'No'], ['1', 'Sí'], ['2', 'N/A']] },
];
const POWER_CHECKS = CHECKS.filter(check => check.group === 'power');
const SIGNATURE_CHECKS = CHECKS.filter(check => check.group === 'signatures');
const NOTIFICATION_CHECK = CHECKS.find(check => check.group === 'notification');

function parseChecks(value) {
  const checks = typeof value === 'string' ? value.split(';').slice(0, CHECKS.length) : [];
  while (checks.length < CHECKS.length) checks.push('0');
  return checks;
}

function selectClass(value) {
  if (value === '1') return 'text-emerald-700';
  if (value === '2' || value === '3') return 'text-amber-700';
  return 'text-destructive';
}

function text(value, fallback = 'Sin registro') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

function documentIds(value) {
  const ids = String(value || '').split(',').slice(0, 2);
  return [...ids, ...Array(Math.max(0, 2 - ids.length)).fill('')];
}

function DocumentCell({ id, file, label }) {
  if (!id || id === '0') return <span className="text-destructive">No</span>;
  if (id === '-1') return <span className="text-emerald-700" title="Aportado físicamente">Sí</span>;
  if (!file?.path || !file?.filename) return <span className="text-muted-foreground" title={`El archivo de ${label.toLowerCase()} no está disponible`}>No disponible</span>;

  return <span className="inline-flex items-center justify-center gap-1 whitespace-nowrap">
    <VIZUALIZER url={`${file.path}/${file.filename}`} apipath="/files/" icon="FileText" color="DeepSkyBlue" />
    <span className="text-emerald-700">Sí</span>
  </span>;
}

export default function ApplicantResponsibleDataGrid({ currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord, viewModel }) {
  const responsibleRecords = Array.isArray(currentItem?.fun_53s) ? currentItem.fun_53s : [];
  const files = Array.isArray(currentItem?.fun_6s) ? currentItem.fun_6s : [];
  const sharedSection = viewModel?.sections?.find(section => section.id === 'responsible');
  const responsible = sharedSection?.sourceRecord || responsibleRecords.find(item => String(item?.version) === String(currentVersion))
    || responsibleRecords[Math.max(0, Number(currentVersion) - 1)]
    || null;
  const step = (Array.isArray(currentRecord?.record_law_steps) ? currentRecord.record_law_steps : [])
    .find(item => String(item?.version) === String(currentVersionR) && item?.id_public === STEP_ID);
  const [checks, setChecks] = useState(() => parseChecks(step?.check));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const filesById = useMemo(() => new Map(files.map(file => [String(file.id), file])), [files]);
  const docs = documentIds(responsible?.docs);
  const canPersist = Boolean(currentRecord?.id && currentVersionR !== undefined && currentVersionR !== null);
  const fullName = `${responsible?.name || ''} ${responsible?.surname || ''}`.trim() || 'Sin registro';
  const status = checks[2] === '1' ? 'accepted' : 'pending';

  useEffect(() => {
    setChecks(parseChecks(step?.check));
  }, [step?.check]);

  const saveCheck = async (index, value) => {
    if (!canPersist || saving) return;

    const previous = checks;
    const next = [...checks];
    next[index] = value;
    if (next[4] !== '1') next[6] = '2';
    setChecks(next);
    setError('');
    setSaving(true);

    const data = new FormData();
    data.set('check', next.join(';'));
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
      setChecks(previous);
      setError('No fue posible guardar la verificación del responsable. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const control = check => {
    const isMandateIndication = check.index === 6;
    const hasSpecialPower = checks[4] === '1';
    const options = isMandateIndication && !hasSpecialPower ? [['2', 'N/A']] : check.options;
    const value = isMandateIndication && !hasSpecialPower ? '2' : checks[check.index] || '0';

    return <select
      aria-label={`${check.label} del responsable de la solicitud`}
      className={`h-7 w-auto cursor-pointer rounded-md border border-border bg-background px-2 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60 ${isMandateIndication && !hasSpecialPower ? 'cursor-default' : 'disabled:cursor-wait'} ${check.index === 4 ? 'text-foreground' : selectClass(value)}`}
      value={value}
      disabled={!canPersist || saving || (isMandateIndication && !hasSpecialPower)}
      aria-busy={saving}
      onChange={event => saveCheck(check.index, event.target.value)}
    >
      {options.map(([optionValue, label]) => <option key={optionValue} value={optionValue} className={check.index === 4 ? 'text-foreground' : undefined}>{label}</option>)}
    </select>;
  };

  return <section className="mt-3 rounded-lg border border-border bg-card p-3" aria-label="Tabla consolidada del responsable de la solicitud">
    <div className="mb-3">
      <h3 className="mb-1 text-sm font-semibold">5.3. Responsable de la solicitud</h3>
      <p className="mb-0 text-xs text-muted-foreground">Información consolidada para consulta y verificación.</p>
    </div>
    {error ? <p className="mb-2 text-xs text-destructive" role="alert">{error}</p> : null}
    {!canPersist ? <p className="mb-2 text-xs text-muted-foreground" role="status">La verificación estará disponible cuando se cargue el informe jurídico.</p> : null}
    <div className="max-h-[70vh] overflow-auto rounded-md border border-border">
      <table className="w-max border-separate border-spacing-0 text-[11px] text-foreground" aria-label="Responsable de la solicitud">
        <thead className="sticky top-0 z-20 bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            <th rowSpan="2" className="sticky left-0 z-30 border-b border-r border-slate-400 bg-slate-200 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600 dark:bg-slate-800">Nombre</th>
            <th rowSpan="2" className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Cédula</th>
            <th rowSpan="2" className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Calidad</th>
            <th colSpan="2" className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Documentos aportados</th>
            <th colSpan={POWER_CHECKS.length} className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Validación del poder</th>
            <th colSpan={SIGNATURE_CHECKS.length} className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Firmas</th>
            <th rowSpan="2" className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Notif.<br />electronica</th>
            <th rowSpan="2" className="border-b border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Estado</th>
          </tr>
          <tr>
            {['Doc. identidad', 'Poder', ...POWER_CHECKS, ...SIGNATURE_CHECKS].map(column => {
              const label = typeof column === 'string' ? column : column.label;
              return <th key={label} className="w-20 whitespace-normal border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">{label}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="sticky left-0 z-10 border-b border-r border-border bg-white px-2 py-1 font-semibold dark:bg-slate-900">{fullName}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{text(responsible?.id_number)}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{text(responsible?.role)}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center"><DocumentCell id={docs[0]} file={filesById.get(docs[0])} label="Documento de identidad" /></td>
            <td className="border-b border-r border-border px-2 py-1 text-center"><DocumentCell id={docs[1]} file={filesById.get(docs[1])} label="Poder o mandato" /></td>
            {POWER_CHECKS.map(check => <td key={check.index} className="border-b border-r border-border px-2 py-1 text-center">{control(check)}</td>)}
            {SIGNATURE_CHECKS.map(check => <td key={check.index} className="border-b border-r border-border px-2 py-1 text-center">{control(check)}</td>)}
            <td className="border-b border-r border-border px-2 py-1 text-center">{control(NOTIFICATION_CHECK)}</td>
            <td className="border-b border-border px-2 py-1 text-center">
              <span aria-label="Estado del responsable de la solicitud" className={`text-[11px] font-semibold ${status === 'accepted' ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                {status === 'accepted' ? 'Aceptado' : 'Pendiente'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>;
}
