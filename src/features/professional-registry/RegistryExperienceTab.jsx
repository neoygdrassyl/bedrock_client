import { useEffect, useState } from 'react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';
import RegistryDocumentTable from './RegistryDocumentTable';
import RegistryExperienceDialog from './RegistryExperienceDialog';
import { useRegistryCatalog } from './useRegistryCatalog';
import { useRegistryDocuments } from './useRegistryDocuments';

const SELECT_CLASS = 'h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground sm:max-w-md';
const NUMBER_CLASS = 'px-1 py-1 tabular-nums';
const COLUMNS = [
  { header: 'Rol', cell: (item) => item.roleLabel },
  { header: 'Empresa', cell: (item) => item.company },
  { header: 'NIT', cell: (item) => item.nit || '—' },
  { header: 'Labores', className: 'max-w-[16rem] whitespace-pre-line break-words px-1 py-1', cell: (item) => item.duties || '—' },
  { header: 'Fecha inicio', className: NUMBER_CLASS, cell: (item) => item.startDate },
  { header: 'Fecha fin', className: NUMBER_CLASS, cell: (item) => item.endDate },
  { header: 'Años', className: NUMBER_CLASS, cell: (item) => item.duration?.years ?? '—' },
  { header: 'Meses', className: NUMBER_CLASS, cell: (item) => item.duration?.months ?? '—' },
  { header: 'Días', className: NUMBER_CLASS, cell: (item) => item.duration?.days ?? '—' },
  {
    header: 'Soporte',
    file: {
      available: (item) => item.hasFile,
      missing: 'Sin archivo',
      className: 'h-auto p-0',
      label: (item) => `Descargar soporte ${item.fileName || ''}`.trim(),
      text: (item) => item.fileName || 'Ver soporte',
    },
  },
];
const MESSAGES = {
  loadFailed: 'No fue posible cargar las experiencias.',
  downloadFailed: 'No fue posible descargar el soporte.',
  created: 'Experiencia registrada.',
  removed: 'Experiencia eliminada.',
};

// The fields the server reads, in the order it documents them (professional-registry-certificate-input).
function experienceForm(roleCode, version, values) {
  const form = new FormData();
  form.append('roleCode', roleCode);
  form.append('company', values.company.trim());
  form.append('nit', values.nit.trim());
  form.append('duties', values.duties.trim());
  form.append('startDate', values.startDate);
  form.append('endDate', values.endDate);
  form.append('expectedVersion', String(version));
  if (values.file) form.append('file', values.file);
  return form;
}

// The role the tab starts with: the first catalog role the person already acts in, else the first of the catalog.
function initialRole(catalog, detail) {
  const own = (detail.roles || []).map((role) => role.code);
  return (catalog.find((role) => own.includes(role.code)) || catalog[0] || {}).code || '';
}

// "Experiencia" tab: certified work experiences per role. onChanged(text) reloads the detail (its version) after a
// write; onConflict() reloads it when someone else changed the person first.
export default function RegistryExperienceTab({ detail, canWrite, onChanged, onConflict }) {
  const catalog = useRegistryCatalog();
  const [roleCode, setRoleCode] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const documents = useRegistryDocuments({
    registryId: detail.id,
    version: detail.version,
    list: (id) => ProfessionalRegistryService.listExperienceCertificates(id),
    create: (id, form) => ProfessionalRegistryService.createExperienceCertificate(id, form),
    remove: (id, itemId, body) => ProfessionalRegistryService.deleteExperienceCertificate(id, itemId, body),
    download: (id, item) => ProfessionalRegistryService.downloadExperienceCertificateFile(id, item.id, item.fileName),
    messages: MESSAGES,
    onChanged,
    onConflict,
  });
  const { items, error, setError, busy } = documents;
  const writable = Boolean(canWrite) && !detail.deleted;

  // The catalog is shared by the page; the tab starts with the first catalog role the person acts in.
  useEffect(() => {
    if (catalog.loaded) setRoleCode((current) => current || initialRole(catalog.roles, detail));
  }, [catalog.loaded, catalog.roles]);

  useEffect(() => {
    if (catalog.failed) setError('No fue posible cargar el catálogo de roles.');
  }, [catalog.failed]);

  const roleLabel = catalog.roles.find((role) => role.code === roleCode)?.label || roleCode;
  const rolesWithExperience = new Set(items.map((item) => item.roleCode)).size;

  const create = async (values) => {
    setDialogError('');
    const saved = await documents.add(() => experienceForm(roleCode, detail.version, values), setDialogError);
    if (saved) setDialogOpen(false);
  };

  return (
    // min-w-0: the dialog is a CSS grid, so without it the wide table stretches the whole tab (and hides the button).
    <section aria-label="Experiencia" className="min-w-0 space-y-3">
      <div className="space-y-1">
        <Label htmlFor="experience-role">Rol</Label>
        <select id="experience-role" className={SELECT_CLASS} value={roleCode} onChange={(event) => setRoleCode(event.target.value)}>
          {catalog.roles.map((role) => <option key={role.code} value={role.code}>{role.label}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2">
        <p className="text-sm">
          Rol activo para agregar experiencia: <span className="font-semibold">{roleLabel || '—'}</span>
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{rolesWithExperience} {rolesWithExperience === 1 ? 'rol' : 'roles'} con experiencia</Badge>
          {writable ? (
            <Button type="button" size="sm" disabled={!roleCode || busy} onClick={() => { setDialogError(''); setDialogOpen(true); }}>
              + Añadir experiencia
            </Button>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}

      <RegistryDocumentTable
        title="Experiencias certificadas registradas"
        columns={COLUMNS}
        documents={documents}
        writable={writable}
        emptyText="Aún no hay experiencias registradas."
      />

      <RegistryExperienceDialog
        open={dialogOpen}
        roleLabel={roleLabel}
        busy={busy}
        error={dialogError}
        onCancel={() => setDialogOpen(false)}
        onSubmit={create}
      />
    </section>
  );
}
