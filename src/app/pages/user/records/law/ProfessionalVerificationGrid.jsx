import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { getRequiredExperienceYears } from './professionalResponsibility.constants';

const baseColumns = [
  'Actúa en calidad de', 'Nombre', 'CC/NIT', 'Teléfono', 'Correo', 'Matrícula', 'Exp. matrícula',
];
const certificateColumns = ['ID', 'Fecha', 'Cumple', 'Estado'];
const experienceColumns = ['Requerida', 'Acreditada', 'Postgrado', 'Estado'];
const signatureColumns = ['FUN', 'PLANOS', 'COINCIDE'];
const compactColumnClasses = {
  Fecha: 'w-16', Cumple: 'w-16', Requerida: 'w-24', Acreditada: 'w-20',
};

const text = value => value === undefined || value === null || value === '' ? 'Sin registro' : String(value);
const isTrue = value => value === true || value === 1 || value === '1' || value === 'true';
const years = value => `${Math.trunc(Number(value || 0) / 12)} año(s)`;
const postgraduateApplies = professional => professional?.postgraduate_applicable === undefined || professional?.postgraduate_applicable === null
  ? Number(professional?.postgraduate) > 0
  : isTrue(professional.postgraduate_applicable);
const requiredExperienceLabel = role => {
  const requiredYears = getRequiredExperienceYears(role);
  if (requiredYears === null) return 'No requiere experiencia';
  if (Number.isInteger(requiredYears) && requiredYears >= 0) return `${requiredYears} año(s)`;
  return 'Sin regla configurada';
};

function parseDateOnly(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').slice(0, 10));
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() === Number(match[2]) - 1 && date.getUTCDate() === Number(match[3]) ? date : null;
}

function addCalendarMonths(date, months) {
  const targetMonth = date.getUTCMonth() + months;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonth / 12);
  const month = targetMonth % 12;
  const lastDay = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, month, Math.min(date.getUTCDate(), lastDay)));
}

export function getCertificateValidity(certificateDate, legalFilingDate) {
  const certificate = parseDateOnly(certificateDate);
  const legalFiling = parseDateOnly(legalFilingDate);
  if (!certificate || !legalFiling) return 'pending';
  return addCalendarMonths(certificate, 6) >= legalFiling ? 'yes' : 'no';
}

export function getExperienceStatus(professional) {
  if (postgraduateApplies(professional)) return 'ACEPTADO';
  const requiredYears = getRequiredExperienceYears(professional?.role);
  if (requiredYears === null) return 'ACEPTADO';
  const accreditedMonths = Number(professional?.expirience);
  if (!Number.isInteger(requiredYears) || requiredYears < 0 || !Number.isFinite(accreditedMonths) || accreditedMonths < 0) return 'RECHAZADO';
  return accreditedMonths >= requiredYears * 12 ? 'ACEPTADO' : 'RECHAZADO';
}

export function getProfessionalQualityStatus(professional) {
  return professional?.registration_certificate_status === 'HABILITADO' && getExperienceStatus(professional) === 'ACEPTADO' ? 'SI' : 'NO';
}

export function getProfessionalActiveStatus(professional) {
  return professional?.active === true || professional?.active === 1 || professional?.active === '1' ? 'ACTIVO' : 'INACTIVO';
}

export function getProfessionalActionRecognitionStatus(professional) {
  return getProfessionalQualityStatus(professional) === 'SI' && isTrue(professional?.signature_original_fun) ? 'SI' : 'NO';
}

function valueOrRenderer(renderer, professional, fallback) {
  return renderer ? renderer(professional) : fallback;
}

export default function ProfessionalVerificationGrid({
  professionals = [],
  legalFilingDate,
  onEdit,
  renderCertificateStatus,
  renderPostgraduate,
  renderSignatureOriginal,
  renderSignaturePlans,
  renderSignatureMatches,
  readOnly = false,
}) {
  const rows = Array.isArray(professionals) ? professionals : [];

  return <div className="max-h-[70vh] overflow-auto rounded-md border border-border" data-professional-verification-grid>
    <table className="w-max border-separate border-spacing-0 text-[11px] text-foreground" aria-label="Profesionales responsables">
      <thead className="sticky top-0 z-20 bg-slate-200 text-foreground/80 dark:bg-slate-800 dark:text-slate-300">
        <tr>
          {baseColumns.map((column, index) => <th key={column} rowSpan="2" className={`border-b border-r border-slate-400 px-1 py-1 text-center text-[10px] font-semibold uppercase dark:border-slate-600 ${index === 0 ? 'sticky left-0 z-30 bg-slate-200 dark:bg-slate-800' : ''}`}>{column}</th>)}
          <th colSpan="4" className="border-b border-r border-slate-400 px-1 py-1 text-center text-[10px] font-semibold uppercase dark:border-slate-600">Certificado vigencia</th>
          <th colSpan="4" className="border-b border-r border-slate-400 px-1 py-1 text-center text-[10px] font-semibold uppercase dark:border-slate-600">Experiencia</th>
          <th rowSpan="2" aria-label="Se reconoce la calidad" className="w-16 whitespace-normal border-b border-r border-slate-400 px-1 py-1 text-center text-[10px] font-semibold uppercase leading-tight dark:border-slate-600">Se reconoce<br />calidad</th>
          <th colSpan="3" className="border-b border-r border-slate-400 px-1 py-1 text-center text-[10px] font-semibold uppercase dark:border-slate-600">Firmas</th>
          <th rowSpan="2" aria-label="Se reconoce para la actuación" className="w-16 whitespace-normal border-b border-r border-slate-400 px-1 py-1 text-center text-[10px] font-semibold uppercase leading-tight dark:border-slate-600">Se reconoce<br />actuación</th>
          <th rowSpan="2" className="border-b border-r border-slate-400 px-1 py-1 text-center text-[10px] font-semibold uppercase dark:border-slate-600">Estado</th>
          <th rowSpan="2" className="border-b border-slate-400 px-1 py-1 text-center text-[10px] font-semibold uppercase dark:border-slate-600">Acción</th>
        </tr>
        <tr>
          {[...certificateColumns, ...experienceColumns, ...signatureColumns].map((column, index) => <th key={`${column}-${index}`} className={`border-b border-r border-slate-400 px-1 py-1 text-center text-[10px] font-semibold uppercase dark:border-slate-600 ${compactColumnClasses[column] || ''}`}>{column}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length ? rows.map(professional => {
          const fullName = `${professional.name || ''} ${professional.surname || ''}`.trim() || 'Sin nombre';
          const registrationValidity = getCertificateValidity(professional.registration_certificate_date, legalFilingDate);
          const certificateStatus = ['HABILITADO', 'INHABILITADO'].includes(professional.registration_certificate_status) ? professional.registration_certificate_status : 'Pendiente';
          const experienceStatus = getExperienceStatus(professional);
          const professionalQualityStatus = getProfessionalQualityStatus(professional);
          const professionalActiveStatus = getProfessionalActiveStatus(professional);
          const professionalActionRecognitionStatus = getProfessionalActionRecognitionStatus(professional);
          const signatureOriginal = isTrue(professional.signature_original_fun) ? 'Sí' : 'No';
          const signatureMatches = isTrue(professional.signature_matches_plans) ? 'Sí' : 'No';
          return <tr key={professional.id || `${professional.role}-${fullName}`} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40">
            <td className="sticky left-0 z-10 border-b border-r border-border bg-white px-2 py-1 font-semibold dark:bg-slate-900">{text(professional.role)}</td>
            <td className="border-b border-r border-border px-2 py-1">{fullName}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{text(professional.id_number)}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{text(professional.number)}</td>
            <td className="border-b border-r border-border px-2 py-1">{text(professional.email)}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{text(professional.registration)}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{text(professional.registration_date)}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{text(professional.registration_certificate_id)}</td>
            <td className="w-16 break-words border-b border-r border-border px-2 py-1 text-center">{text(professional.registration_certificate_date)}</td>
            <td className={`w-16 border-b border-r border-border px-2 py-1 text-center font-semibold ${registrationValidity === 'yes' ? 'text-emerald-700' : registrationValidity === 'no' ? 'text-destructive' : 'text-muted-foreground'}`}>{registrationValidity === 'yes' ? 'Sí' : registrationValidity === 'no' ? 'No' : 'Pendiente'}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center text-muted-foreground">{valueOrRenderer(renderCertificateStatus, professional, certificateStatus)}</td>
            <td className="w-24 whitespace-normal border-b border-r border-border px-2 py-1 text-center leading-tight">{requiredExperienceLabel(professional.role)}</td>
            <td className="w-20 border-b border-r border-border px-2 py-1 text-center">{years(professional.expirience)}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{valueOrRenderer(renderPostgraduate, professional, postgraduateApplies(professional) ? 'APLICA' : 'NO APLICA')}</td>
            <td className={`w-20 border-b border-r border-border px-2 py-1 text-center font-semibold ${experienceStatus === 'ACEPTADO' ? 'text-emerald-700' : 'text-destructive'}`}>{experienceStatus}</td>
            <td className={`border-b border-r border-border px-2 py-1 text-center font-semibold ${professionalQualityStatus === 'SI' ? 'text-emerald-700' : 'text-destructive'}`}>{professionalQualityStatus}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{valueOrRenderer(renderSignatureOriginal, professional, signatureOriginal)}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{valueOrRenderer(renderSignaturePlans, professional, isTrue(professional.signature_original_plans) ? 'Sí' : 'No')}</td>
            <td className="border-b border-r border-border px-2 py-1 text-center">{valueOrRenderer(renderSignatureMatches, professional, signatureMatches)}</td>
            <td className={`border-b border-r border-border px-2 py-1 text-center font-semibold ${professionalActionRecognitionStatus === 'SI' ? 'text-emerald-700' : 'text-destructive'}`}>{professionalActionRecognitionStatus}</td>
            <td className={`border-b border-r border-border px-2 py-1 text-center font-semibold ${professionalActiveStatus === 'ACTIVO' ? 'text-emerald-700' : 'text-destructive'}`}>{professionalActiveStatus}</td>
            <td className="border-b border-border px-2 py-1 text-center">{readOnly ? <span className="text-muted-foreground">Solo lectura</span> : onEdit ? <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={`Editar ${fullName}`} onClick={() => onEdit(professional)}><Icon name="edit" size={13} /></Button> : null}</td>
          </tr>;
        }) : <tr><td colSpan="22" className="h-24 px-4 text-center text-sm text-muted-foreground">No hay profesionales registrados. Añada un profesional para comenzar.</td></tr>}
      </tbody>
    </table>
  </div>;
}
