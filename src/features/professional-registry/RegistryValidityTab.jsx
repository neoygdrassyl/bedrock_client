import { useState } from 'react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';
import { todayIso } from '@/shared/utils/calendar';
import RegistryDocumentTable from './RegistryDocumentTable';
import { useRegistryDocuments } from './useRegistryDocuments';

const EMPTY = { code: '', issueDate: '' };
const EARLIEST = '1900-01-01';
const FILE_TYPES = ['application/pdf'];
// The server rules: same values as professional-registry-validity-input.
const CODE_LIMITS = { min: 3, max: 64 };
const CODE_PATTERN = /^[A-Z0-9Ñ][A-Z0-9Ñ./\- ]*$/;
const STATUS = {
  VIGENTE: { label: 'Vigente', variant: 'default' },
  VENCIDO: { label: 'Vencido', variant: 'destructive' },
};

// "  cvad-2026   4717033 " -> "CVAD-2026 4717033", as the server stores it.
export const cleanCode = (raw) => String(raw ?? '').replace(/\s+/g, ' ').trim().toUpperCase();

// The first problem of the form, as the server would answer it, or ''.
export function validateValidityCertificate(values, file, today = todayIso()) {
  const code = cleanCode(values.code);
  if (!code) return 'El código del certificado es obligatorio.';
  if (code.length < CODE_LIMITS.min || code.length > CODE_LIMITS.max) {
    return `El código del certificado debe tener entre ${CODE_LIMITS.min} y ${CODE_LIMITS.max} caracteres.`;
  }
  if (!CODE_PATTERN.test(code)) return 'El código del certificado solo puede tener letras, números, guiones, barras y puntos.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.issueDate || '')) return 'Indique la fecha de expedición del certificado.';
  if (values.issueDate < EARLIEST) return 'La fecha de expedición no puede ser anterior a 1900.';
  if (values.issueDate > today) return 'La fecha de expedición no puede ser posterior a hoy.';
  if (!file) return 'Adjunte el documento del certificado (PDF).';
  if (file.type && !FILE_TYPES.includes(file.type)) return 'El documento del certificado debe ser un archivo PDF.';
  return '';
}

// The fields the server reads (professional-registry-validity-certificates).
function validityForm(version, values, file) {
  const form = new FormData();
  form.append('code', cleanCode(values.code));
  form.append('issueDate', values.issueDate);
  form.append('expectedVersion', String(version));
  form.append('file', file);
  return form;
}

function StatusBadge({ status }) {
  const shown = STATUS[status] || { label: status || '—', variant: 'outline' };
  return <Badge variant={shown.variant}>{shown.label}</Badge>;
}

// The columns of the history; `latest` is the id of the most recent certificate.
function historyColumns(latest) {
  return [
    {
      header: 'Código',
      className: 'break-words px-1 py-1',
      cell: (item) => (
        <span className="flex flex-wrap items-center gap-1">
          {item.code}
          {item.id === latest ? <Badge variant="secondary">Más reciente</Badge> : null}
        </span>
      ),
    },
    { header: 'Fecha de expedición', className: 'px-1 py-1 tabular-nums', cell: (item) => item.issueDate },
    { header: 'Vigente hasta', className: 'px-1 py-1 tabular-nums', cell: (item) => item.validUntil },
    { header: 'Estado', cell: (item) => <StatusBadge status={item.status} /> },
    {
      header: 'Documento',
      file: {
        className: 'h-auto max-w-[14rem] truncate p-0',
        label: (item) => `Descargar certificado ${item.fileName || item.code}`,
        text: (item) => item.fileName || 'Ver documento',
      },
    },
  ];
}

const MESSAGES = {
  loadFailed: 'No fue posible cargar los certificados de vigencia.',
  downloadFailed: 'No fue posible descargar el certificado.',
  created: 'Certificado de vigencia registrado.',
  removed: 'Certificado de vigencia eliminado.',
};
const READ_ONLY = <span className="text-muted-foreground">—</span>;

// "Cert. Vigencia" tab: the registration validity certificates of the person, with their history. onChanged(text)
// reloads the detail (its version) after a write; onConflict() reloads it when someone else changed the person first.
export default function RegistryValidityTab({ detail, canWrite, onChanged, onConflict }) {
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [formError, setFormError] = useState('');
  const documents = useRegistryDocuments({
    registryId: detail.id,
    version: detail.version,
    list: (id) => ProfessionalRegistryService.listValidityCertificates(id),
    create: (id, form) => ProfessionalRegistryService.createValidityCertificate(id, form),
    remove: (id, itemId, body) => ProfessionalRegistryService.deleteValidityCertificate(id, itemId, body),
    download: (id, item) => ProfessionalRegistryService.downloadValidityCertificateFile(id, item.id, item.fileName),
    messages: MESSAGES,
    onChanged,
    onConflict,
  });
  const { items, error, busy } = documents;
  const latest = documents.payload?.latest ?? items[0]?.id ?? null;
  const writable = Boolean(canWrite) && !detail.deleted;

  const set = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const found = validateValidityCertificate(values, file);
    setFormError(found);
    if (found) return;
    const saved = await documents.add(() => validityForm(detail.version, values, file), setFormError);
    if (!saved) return;
    setValues(EMPTY);
    setFile(null);
    setFileKey((key) => key + 1);
  };

  return (
    // min-w-0: the dialog is a CSS grid, so without it the table stretches the whole tab into a horizontal scroll.
    <section aria-label="Cert. Vigencia" className="min-w-0 space-y-3">
      {writable ? (
        <form
          className="min-w-0 space-y-3 rounded-md border border-border/60 bg-muted/20 p-3"
          aria-label="Registrar certificado de vigencia"
          onSubmit={submit}
          noValidate
        >
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-1">
              <Label htmlFor="validity-code">Código del certificado *</Label>
              <Input
                id="validity-code"
                value={values.code}
                onChange={set('code')}
                placeholder="Ej: CVAD-2026-4717033"
                maxLength={CODE_LIMITS.max}
                autoComplete="off"
                required
              />
            </div>
            <div className="min-w-0 space-y-1">
              <Label htmlFor="validity-issue-date">Fecha de expedición *</Label>
              <Input
                id="validity-issue-date"
                type="date"
                min={EARLIEST}
                max={todayIso()}
                value={values.issueDate}
                onChange={set('issueDate')}
                required
              />
            </div>
          </div>
          <div className="min-w-0 space-y-1">
            <Label htmlFor="validity-file">Documento del certificado (PDF) *</Label>
            <Input
              key={fileKey}
              id="validity-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              required
            />
          </div>
          {formError ? <p className="text-sm text-destructive" role="alert">{formError}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={busy}>Registrar certificado</Button>
          </div>
        </form>
      ) : null}

      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}

      <RegistryDocumentTable
        title="Historial de certificados de vigencia"
        columns={historyColumns(latest)}
        documents={documents}
        writable={writable}
        rowProps={(item) => ({
          className: `border-t border-border/60 align-top ${item.id === latest ? 'bg-primary/5 font-medium' : ''}`,
          'aria-current': item.id === latest ? 'true' : undefined,
        })}
        readOnly={READ_ONLY}
        emptyText="Aún no hay certificados de vigencia registrados."
      />
    </section>
  );
}
