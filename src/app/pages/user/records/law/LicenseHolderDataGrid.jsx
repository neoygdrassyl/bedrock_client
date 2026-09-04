import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import VIZUALIZER from '../../../../components/vizualizer.component';
import RecordLawService from '../../../../services/record_law.service';

const CHECKS = [
  { label: 'Cert. tradición', description: 'Certificado de tradición: titular del dominio' },
  { label: 'Coincide cédula', description: 'Coincide la cédula con el certificado de tradición' },
  { label: 'Copia cédula', description: 'Aportó copia de la cédula de ciudadanía' },
  { label: 'FUN', description: 'Firma original en el FUN' },
  { label: 'Legitimado', description: 'Quien firma está legitimado para ello' },
];

const text = value => value === undefined || value === null || value === '' ? 'Sin registro' : String(value);
const normalizeCheck = value => String(value) === '1' ? '1' : '0';
const personType = value => {
  const normalized = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  if (normalized === 'PERSONA NATURAL' || normalized === 'NATURAL') return 'NATURAL';
  if (normalized === 'PERSONA JURIDICA' || normalized === 'JURIDICA') return 'JURIDICA';
  return 'Sin registro';
};
const activeStatus = holder => holder?.active === true || holder?.active === 1 || holder?.active === '1' ? 'ACTIVO' : 'INACTIVO';

function documentCell(holder, position, filesById) {
  const id = String(holder?.docs || '').split(',')[position]?.trim();
  if (!id || id === '0') return <span className="text-destructive">No</span>;
  if (id === '-1') return <span className="text-emerald-700" title="Aportado físicamente">Sí</span>;

  const file = filesById.get(id);
  if (!file?.path || !file?.filename) return <span className="text-muted-foreground" title="El archivo relacionado no está disponible">No disponible</span>;

  return <span className="inline-flex items-center gap-1 whitespace-nowrap">
    <VIZUALIZER url={`${file.path}/${file.filename}`} apipath="/files/" icon={position === 0 ? 'IdCard' : 'BadgeCheck'} color="DeepSkyBlue" />
    <span className="text-emerald-700">Sí</span>
  </span>;
}

export default function LicenseHolderDataGrid({ currentItem, currentRecord, currentVersionR, requestUpdateRecord, onEdit, viewModel }) {
  const sharedSection = viewModel?.sections?.find(section => section.id === 'holders');
  const holders = Array.isArray(sharedSection?.sourceRows) ? sharedSection.sourceRows : (Array.isArray(currentItem?.fun_51s) ? currentItem.fun_51s : []);
  const files = Array.isArray(currentItem?.fun_6s) ? currentItem.fun_6s : [];
  const steps = Array.isArray(currentRecord?.record_law_steps) ? currentRecord.record_law_steps : [];
  const step = steps.find(item => String(item.version) === String(currentVersionR) && item.id_public === 'f51');
  const storedChecks = typeof step?.check === 'string' ? step.check.split(';') : [];
  const [overrides, setOverrides] = useState({});
  const [savingIndexes, setSavingIndexes] = useState(() => new Set());
  const [error, setError] = useState('');
  const filesById = useMemo(() => new Map(files.map(file => [String(file.id), file])), [files]);
  const canPersist = Boolean(currentRecord?.id && currentVersionR !== undefined && currentVersionR !== null);

  useEffect(() => {
    setOverrides(previous => {
      let changed = false;
      const next = {};
      Object.entries(previous).forEach(([index, value]) => {
        if (normalizeCheck(storedChecks[Number(index)]) === value) changed = true;
        else next[index] = value;
      });
      return changed ? next : previous;
    });
  }, [step?.check]);

  const checkValue = index => overrides[index] ?? normalizeCheck(storedChecks[index]);

  const saveCheck = async (index, value) => {
    if (!canPersist || checkValue(index) === value) return;

    const checks = [...storedChecks];
    while (checks.length < holders.length * CHECKS.length) checks.push('0');
    checks[index] = value;

    const data = new FormData();
    data.set('check', checks.join(';'));
    data.set('version', currentVersionR);
    data.set('recordLawId', currentRecord.id);
    data.set('id_public', 'f51');

    setError('');
    setSavingIndexes(previous => new Set(previous).add(index));
    try {
      const response = step?.id
        ? await RecordLawService.update_step(step.id, data)
        : await RecordLawService.create_step(data);
      if (response.data !== 'OK') throw new Error('La API no confirmó la actualización.');

      setOverrides(previous => ({ ...previous, [index]: value }));
      try {
        await requestUpdateRecord?.(currentItem?.id);
      } catch {
        setError('La verificación se guardó, pero no fue posible actualizar la información mostrada.');
      }
    } catch {
      setError('No fue posible guardar la verificación del titular. Intente nuevamente.');
    } finally {
      setSavingIndexes(previous => {
        const next = new Set(previous);
        next.delete(index);
        return next;
      });
    }
  };

  return <section className="mt-3 rounded-lg border border-border bg-card p-3" aria-label="Tabla consolidada de titulares de la licencia">
    <div className="mb-3">
      <h3 className="mb-1 text-sm font-semibold">5.1. Titulares de la licencia</h3>
      <p className="mb-0 text-xs text-muted-foreground">Información consolidada para consulta y verificación.</p>
    </div>
    {error ? <p className="mb-2 text-xs text-destructive" role="alert">{error}</p> : null}
    <div className="max-h-[70vh] overflow-auto rounded-md border border-border">
      <table className="w-max border-separate border-spacing-0 text-[11px] text-foreground" aria-label="Titulares de la licencia">
        <thead className="sticky top-0 z-20 bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            <th rowSpan="2" className="sticky left-0 z-30 border-b border-r border-slate-400 bg-slate-200 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600 dark:bg-slate-800">Nombre</th>
            {['CC / NIT', 'Tipo persona', 'Calidad'].map(column => <th key={column} rowSpan="2" className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">{column}</th>)}
            <th colSpan="2" className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Documentos aportados</th>
            <th colSpan="3" className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Validación titularidad</th>
            <th colSpan="2" className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Firmas</th>
            <th rowSpan="2" className="border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Estado</th>
            <th rowSpan="2" className="w-20 border-b border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">Acción</th>
          </tr>
          <tr>
            {['Doc. identidad', 'Cert. exist. / rep. legal'].map(column => <th key={column} className="w-24 whitespace-normal border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">{column}</th>)}
            {CHECKS.slice(0, 3).map(check => <th key={check.label} title={check.description} className="w-20 whitespace-normal border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">{check.label}</th>)}
            {CHECKS.slice(3).map(check => <th key={check.label} title={check.description} className="w-20 whitespace-normal border-b border-r border-slate-400 px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight dark:border-slate-600">{check.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {holders.length ? holders.map((holder, holderIndex) => {
            const fullName = `${holder.name || ''} ${holder.surname || ''}`.trim() || 'Sin nombre';
            const canEdit = holder?.id !== undefined && holder?.id !== null && holder.id !== '' && typeof onEdit === 'function';
            const holderActiveStatus = activeStatus(holder);
            return <tr key={holder.id || `${holder.id_number || fullName}-${holderIndex}`}>
              <td className="sticky left-0 z-10 border-b border-r border-border bg-white px-2 py-1 font-semibold dark:bg-slate-900">{fullName}</td>
              <td className="border-b border-r border-border px-2 py-1 text-center">{text(holder.id_number)}</td>
              <td className="w-20 border-b border-r border-border px-2 py-1 text-center">{personType(holder.type)}</td>
              <td className="border-b border-r border-border px-2 py-1 text-center">{text(holder.role)}</td>
              <td className="border-b border-r border-border px-2 py-1 text-center">{documentCell(holder, 0, filesById)}</td>
              <td className="border-b border-r border-border px-2 py-1 text-center">{documentCell(holder, 1, filesById)}</td>
              {CHECKS.map((check, checkIndex) => {
                const index = holderIndex * CHECKS.length + checkIndex;
                const saving = savingIndexes.has(index);
                const value = checkValue(index);
                return <td key={check.label} className="border-b border-r border-border px-2 py-1 text-center">
                  <select
                    aria-label={`${check.description} — ${fullName}`}
                    className={`h-7 w-auto cursor-pointer rounded-md border border-border bg-background px-2 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-wait disabled:opacity-60 ${value === '1' ? 'text-emerald-700' : 'text-destructive'}`}
                    value={value}
                    disabled={saving || !canPersist}
                    aria-busy={saving}
                    onChange={event => saveCheck(index, event.target.value)}
                  >
                    <option value="0">No</option>
                    <option value="1">Sí</option>
                  </select>
                </td>;
              })}
              <td className={`border-b border-r border-border px-2 py-1 text-center font-semibold ${holderActiveStatus === 'ACTIVO' ? 'text-emerald-700' : 'text-destructive'}`}>{holderActiveStatus}</td>
              <td className="w-20 border-b border-border px-2 py-1 text-center"><Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label={`Actualizar ${fullName}`} title={canEdit ? undefined : 'No es posible actualizar este titular'} disabled={!canEdit} onClick={() => onEdit(holder.id)}><Icon name="edit" size={14} /></Button></td>
            </tr>;
          }) : <tr><td colSpan="13" className="h-24 px-4 text-center text-sm text-muted-foreground">No hay titulares registrados. Añádalos desde el submódulo Actualizar.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>;
}
