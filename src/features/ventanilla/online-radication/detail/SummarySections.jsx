import { ClipboardList, MapPin, UserRound } from 'lucide-react';
import { Chip } from '../components/Chips';
import {
  PROFILE_KIND_LABELS,
  documentText,
  formatBoolean,
  formatDate,
  hasValue,
  labelFor,
  labelsFor,
  metadataSection,
} from '../onlineRadicationModel';
import { DetailCard, Fact, FactGrid } from './DetailPrimitives';

function ChipRow({ values }) {
  if (!values.length) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {values.map((value, index) => <Chip key={`${value}-${index}`} className="max-w-full">{value}</Chip>)}
    </span>
  );
}

function joined(values, separator = ' · ') {
  return values.filter(hasValue).join(separator) || null;
}

function MailLink({ value }) {
  if (!hasValue(value)) return null;
  return (
    <a href={`mailto:${value}`} className="break-all text-[hsl(var(--primary))] no-underline underline-offset-2 hover:text-[hsl(var(--primary))] hover:underline">
      {value}
    </a>
  );
}

/** Resumen de la solicitud: objeto, trámite, actuaciones, tipos, modalidades y usos. */
export function RequestSummarySection({ item, metadata, labels }) {
  const request = metadataSection(metadata, 'request');
  const actuations = (Array.isArray(item.actuations) ? item.actuations : []).map((actuation) => actuation?.label || actuation?.code).filter(Boolean);
  const modalities = [
    ...labelsFor(labels, request.urbanModalities, 'request.urbanModalities'),
    ...labelsFor(labels, request.subdivisionModalities, 'request.subdivisionModalities'),
    ...labelsFor(labels, request.licenceModalities, 'request.licenceModalities'),
  ];
  const types = labelsFor(labels, request.typeCodes, 'request.typeCodes');
  const uses = labelsFor(labels, request.uses, 'request.uses');

  return (
    <DetailCard icon={ClipboardList} title="Resumen de la solicitud">
      <FactGrid>
        <Fact label="Objeto de la solicitud" wide>
          {hasValue(request.object || item.requestObject) ? (
            <span className="whitespace-pre-line">{request.object || item.requestObject}</span>
          ) : null}
        </Fact>
        <Fact label="Trámite" value={item.procedureLabel || labelFor(labels, request.procedureCode, 'request.procedureCode')} />
        <Fact label="Presentada en el portal" value={formatDate(item.submissionDate)} />
        <Fact label="Actuaciones" wide><ChipRow values={actuations} /></Fact>
        {types.length ? <Fact label="Tipo de solicitud"><ChipRow values={types} /></Fact> : null}
        {modalities.length ? <Fact label="Modalidades"><ChipRow values={modalities} /></Fact> : null}
        {uses.length ? <Fact label="Usos" wide><ChipRow values={uses} /></Fact> : null}
      </FactGrid>
    </DetailCard>
  );
}

function alternateNotification(alternate) {
  if (!alternate || typeof alternate !== 'object') return null;
  return joined([alternate.email, alternate.phone, alternate.address]);
}

/** Solicitante (applicant snapshot); without metadata only the summary columns exist. */
export function ApplicantSection({ item, metadata, labels }) {
  const applicant = metadataSection(metadata, 'applicant');
  const representative = applicant.legalRepresentative && typeof applicant.legalRepresentative === 'object' ? applicant.legalRepresentative : null;
  const document = documentText(labels, applicant.documentType, applicant.documentNumber) || item.applicantDocument;

  return (
    <DetailCard icon={UserRound} title="Solicitante">
      <FactGrid>
        <Fact label="Nombre" value={applicant.displayName || item.applicantName} />
        <Fact label="Documento" value={document} />
        {metadata ? (
          <>
            <Fact label="Tipo de persona" value={PROFILE_KIND_LABELS[applicant.profileKind] || applicant.profileKind} />
            <Fact label="Calidad en la que actúa" value={labelFor(labels, applicant.role)} />
            <Fact label="Correo electrónico"><MailLink value={applicant.email} /></Fact>
            <Fact label="Celular / teléfono" value={joined([applicant.mobile, applicant.phone ? `Tel. ${applicant.phone}` : null])} />
            <Fact label="Dirección" value={applicant.address} />
            <Fact label="Municipio / departamento" value={joined([applicant.municipality, applicant.department], ', ')} />
            {representative || applicant.profileKind === 'legal' ? (
              <Fact
                label="Representante legal"
                wide
                value={representative ? joined([representative.name, documentText(labels, representative.documentType, representative.documentNumber)]) : null}
              />
            ) : null}
            <Fact label="Autoriza notificación electrónica" value={formatBoolean(applicant.notificationAuthorized)} />
            <Fact label="Notificación alterna" value={alternateNotification(applicant.alternateNotification)} />
          </>
        ) : null}
      </FactGrid>
    </DetailCard>
  );
}

/** Predio: identification and location of the property. */
export function PropertySection({ item, metadata, labels }) {
  const property = metadataSection(metadata, 'property');
  return (
    <DetailCard icon={MapPin} title="Predio">
      <FactGrid>
        <Fact label="Dirección" wide value={property.address || item.propertyAddress} />
        {metadata ? (
          <>
            {hasValue(property.formerAddress) ? <Fact label="Dirección anterior" wide value={property.formerAddress} /> : null}
            <Fact label="Matrícula inmobiliaria" mono value={property.realEstateRegistration} />
            <Fact label="Cédula catastral" mono value={property.cadastralNumber} />
            {hasValue(property.formerCadastralNumber) ? <Fact label="Cédula catastral anterior" mono value={property.formerCadastralNumber} /> : null}
            <Fact label="Clasificación del suelo" value={labelFor(labels, property.landClassification, 'property.landClassification')} />
            <Fact label="Barrio / vereda" value={joined([property.neighborhood, property.ruralDistrict])} />
            <Fact label="Comuna / sector" value={joined([property.commune, property.sector, property.township])} />
            <Fact label="Manzana / lote" value={joined([property.block ? `Manzana ${property.block}` : null, property.lot ? `Lote ${property.lot}` : null])} />
            <Fact label="Estrato" value={property.socioeconomicStratum ?? null} />
            {hasValue(property.subdivisionPlan) ? <Fact label="Plano de loteo" value={property.subdivisionPlan} /> : null}
          </>
        ) : null}
      </FactGrid>
    </DetailCard>
  );
}
