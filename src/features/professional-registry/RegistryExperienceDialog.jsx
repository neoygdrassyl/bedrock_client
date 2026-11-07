import { useEffect, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { todayIso } from '@/shared/utils/calendar';
import { DIALOG_CLOSE_CLASS } from './professionalRegistry.utils';
import { certifiedDuration, formatFullDuration } from './experienceDuration';

const EMPTY = { company: '', nit: '', duties: '', startDate: '', endDate: '' };
const EARLIEST = '1900-01-01';
const FILE_TYPES = ['application/pdf'];
// The server limits: same values as professional-registry-certificate-input.
const LIMITS = { company: 255, nit: 64, duties: 2000 };

// The first problem of the form, as the server would answer it, or ''.
export function validateExperience(values, file, today = todayIso()) {
  if (!values.company.trim()) return 'El nombre de la empresa es obligatorio.';
  if (values.company.trim().length > LIMITS.company) return `El nombre de la empresa puede tener máximo ${LIMITS.company} caracteres.`;
  if (values.nit.trim().length > LIMITS.nit) return `El NIT puede tener máximo ${LIMITS.nit} caracteres.`;
  if (values.duties.trim().length > LIMITS.duties) return `Las labores pueden tener máximo ${LIMITS.duties} caracteres.`;
  if (!values.startDate || !values.endDate) return 'Indique la fecha de inicio y la fecha de fin.';
  if (values.startDate < EARLIEST) return 'La fecha de inicio no puede ser anterior a 1900.';
  if (values.endDate > today) return 'La fecha de fin no puede ser posterior a hoy.';
  if (values.endDate < values.startDate) return 'La fecha de fin no puede ser anterior a la fecha de inicio.';
  if (!certifiedDuration(values.startDate, values.endDate)) return 'Indique fechas válidas.';
  if (file && file.type && !FILE_TYPES.includes(file.type)) return 'El soporte debe ser un archivo PDF.';
  return '';
}

// "Nueva experiencia certificada" for the active role. onSubmit({ company, nit, duties, startDate, endDate, file })
// resolves true when it was saved; `error` is the server's answer.
export default function RegistryExperienceDialog({ open, roleLabel, busy, error, onCancel, onSubmit }) {
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    if (!open) return;
    setValues(EMPTY);
    setFile(null);
    setProblem('');
  }, [open]);

  const set = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));
  const duration = values.startDate && values.endDate && values.endDate >= values.startDate
    ? certifiedDuration(values.startDate, values.endDate)
    : null;

  const submit = async (event) => {
    event.preventDefault();
    const found = validateExperience(values, file);
    setProblem(found);
    if (found) return;
    await onSubmit({ ...values, file });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onCancel?.(); }}>
      <DialogContent className={`max-w-lg ${DIALOG_CLOSE_CLASS}`}>
        <DialogHeader>
          <DialogTitle>Nueva experiencia certificada</DialogTitle>
          <DialogDescription>Rol: {roleLabel}</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" aria-label="Nueva experiencia certificada" onSubmit={submit} noValidate>
          <div className="space-y-1">
            <Label htmlFor="experience-company">Nombre de la empresa *</Label>
            <Input id="experience-company" value={values.company} onChange={set('company')} maxLength={LIMITS.company} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="experience-nit">NIT de la empresa</Label>
            <Input id="experience-nit" value={values.nit} onChange={set('nit')} maxLength={LIMITS.nit} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="experience-duties">Labores realizadas</Label>
            <Textarea id="experience-duties" value={values.duties} onChange={set('duties')} maxLength={LIMITS.duties} rows={3} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="experience-start">Fecha inicio *</Label>
              <Input id="experience-start" type="date" min={EARLIEST} max={todayIso()} value={values.startDate} onChange={set('startDate')} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="experience-end">Fecha fin *</Label>
              <Input id="experience-end" type="date" min={values.startDate || EARLIEST} max={todayIso()} value={values.endDate} onChange={set('endDate')} required />
            </div>
          </div>
          <p className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Duración: </span>
            <output aria-label="Duración calculada" aria-live="polite" className="font-semibold">{formatFullDuration(duration)}</output>
          </p>
          <div className="space-y-1">
            <Label htmlFor="experience-file">Documento de certificación / Soporte (PDF)</Label>
            <Input id="experience-file" type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </div>
          {problem || error ? <p className="text-sm text-destructive" role="alert">{problem || error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={busy}>Guardar experiencia</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
