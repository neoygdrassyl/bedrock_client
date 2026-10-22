import { useEffect, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';
import { errorCode, errorText } from './professionalRegistry.utils';

const EMPTY = { name: '', cc: '', registration: '', email: '', phone: '' };
const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]+$/;

// Same rules as the server, so the user sees the problem before sending the form.
export function validateRegistryForm(values, mode) {
  const errors = {};
  const name = values.name.trim().replace(/\s+/g, ' ');
  if (mode === 'create' && (name.length < 3 || name.length > 255 || !NAME_PATTERN.test(name))) errors.name = 'El nombre debe tener entre 3 y 255 caracteres y solo letras.';
  const cc = values.cc.replace(/[.\-\s]/g, '');
  if (values.cc.trim() && (!/^\d{6,10}$/.test(cc))) errors.cc = 'La cédula debe tener entre 6 y 10 dígitos y no puede incluir letras.';
  const registration = values.registration.replace(/[^A-Za-z0-9]/g, '');
  if (mode === 'create' && values.registration.trim() && (registration.length < 4 || registration.length > 40)) errors.registration = 'La matrícula debe tener entre 4 y 40 caracteres alfanuméricos.';
  if (mode === 'create' && !values.cc.trim() && !values.registration.trim()) errors.cc = 'Indique la cédula o, si no la tiene, la matrícula profesional.';
  const email = values.email.trim();
  if (email && (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) errors.email = 'El correo no tiene un formato válido.';
  const phone = values.phone.trim();
  if (phone && (!/\d/.test(phone) || !/^[\d+()\- ]+$/.test(phone) || phone.length > 64)) errors.phone = 'El teléfono solo puede tener dígitos, espacios, +, - y paréntesis.';
  return errors;
}

export default function RegistryForm({ open, mode, registry, onClose, onSaved, onOpenExisting, onConflict }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setServerError(null);
    setValues(mode === 'edit' && registry
      ? { ...EMPTY, cc: registry.cc || '', email: registry.email || '', phone: registry.phone || '' }
      : EMPTY);
  }, [open, mode, registry]);

  const set = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const found = validateRegistryForm(values, mode);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setServerError(null);
    try {
      const response = mode === 'create'
        ? await ProfessionalRegistryService.create({ name: values.name, cc: values.cc, registration: values.registration, email: values.email, phone: values.phone })
        : await ProfessionalRegistryService.update(registry.id, {
          expectedVersion: registry.version,
          email: values.email,
          phone: values.phone,
          ...(values.cc.replace(/\D/g, '') !== String(registry.cc || '') ? { cc: values.cc } : {}),
        });
      onSaved?.(response?.data);
    } catch (e) {
      setServerError({ code: errorCode(e), message: errorText(e), existingId: e?.response?.data?.id || null });
    } finally {
      setSaving(false);
    }
  };

  const field = (id, label, extra = {}) => (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={values[extra.key || id]} onChange={set(extra.key || id)} aria-invalid={Boolean(errors[extra.key || id])} {...extra.props} />
      {errors[extra.key || id] ? <p className="text-xs text-destructive" role="alert">{errors[extra.key || id]}</p> : null}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose?.(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo profesional' : 'Editar datos del profesional'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Se crea un registro manual. Si el profesional no tiene cédula, registre su matrícula profesional.'
              : 'El nombre se corrige desde el detalle. La cédula anterior sigue vinculada a este profesional.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3" noValidate>
          {mode === 'create' ? field('registry-name', 'Nombre completo *', { key: 'name' }) : null}
          {field('registry-cc', mode === 'create' ? 'Cédula' : 'Cédula', { key: 'cc' })}
          {mode === 'create' ? field('registry-registration', 'Matrícula profesional', { key: 'registration' }) : null}
          {field('registry-email', 'Correo', { key: 'email', props: { type: 'email' } })}
          {field('registry-phone', 'Teléfono', { key: 'phone' })}
          {serverError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive" role="alert">
              <p>{serverError.message}</p>
              {serverError.existingId ? <Button type="button" variant="link" size="sm" onClick={() => onOpenExisting?.(serverError.existingId)}>Abrir el profesional existente</Button> : null}
              {serverError.code === 'VERSION_CONFLICT' ? <Button type="button" variant="link" size="sm" onClick={() => onConflict?.()}>Recargar datos</Button> : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose?.()}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
