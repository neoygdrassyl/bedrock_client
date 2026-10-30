import { HardHat, ShieldCheck, Users } from 'lucide-react';
import { DovelaBadge } from '@/shared/dovela-ui';
import { Chip } from '../components/Chips';
import {
  PROFILE_KIND_LABELS,
  documentText,
  formatBoolean,
  formatDate,
  formatExperience,
  hasValue,
  labelFor,
  metadataList,
  plural,
  titleholderName,
} from '../onlineRadicationModel';
import { CountPill, DetailCard, EmptyNote, Fact, FactGrid, PersonCard } from './DetailPrimitives';

function PeopleList({ children }) {
  return <div className="flex flex-col gap-2.5">{children}</div>;
}

function countLabel(count, singular, pluralForm) {
  return <CountPill label={plural(count, singular, pluralForm)}>{count}</CountPill>;
}

export function TitleholdersSection({ metadata, labels }) {
  const titleholders = metadataList(metadata, 'titleholders');
  return (
    <DetailCard icon={Users} title="Titulares" aside={countLabel(titleholders.length, 'titular', 'titulares')}>
      {titleholders.length ? (
        <PeopleList>
          {titleholders.map((titleholder, index) => {
            const representative = titleholder.kind === 'legal' && titleholder.legalRepresentative ? titleholder.legalRepresentative : null;
            return (
              <PersonCard
                key={`${titleholder.documentNumber || 'titular'}-${index}`}
                title={titleholderName(titleholder)}
                badges={<DovelaBadge tone="outline">{PROFILE_KIND_LABELS[titleholder.kind] || 'Titular'}</DovelaBadge>}
              >
                <FactGrid>
                  <Fact label="Documento" value={documentText(labels, titleholder.documentType, titleholder.documentNumber)} />
                  <Fact label="Calidad" value={titleholder.role} />
                  <Fact label="Correo electrónico" value={titleholder.email} />
                  <Fact label="Teléfono" value={titleholder.phone} />
                  {titleholder.kind === 'legal' ? (
                    <Fact
                      label="Representante legal"
                      wide
                      value={representative ? [representative.name, documentText(labels, representative.documentType, representative.documentNumber)].filter(hasValue).join(' · ') : null}
                    />
                  ) : null}
                  <Fact label="Autoriza notificación electrónica" value={formatBoolean(titleholder.notificationAuthorized)} />
                </FactGrid>
              </PersonCard>
            );
          })}
        </PeopleList>
      ) : <EmptyNote>La solicitud no registra titulares.</EmptyNote>}
    </DetailCard>
  );
}

export function ProfessionalsSection({ metadata, labels }) {
  const professionals = metadataList(metadata, 'professionals');
  return (
    <DetailCard icon={HardHat} title="Profesionales" aside={countLabel(professionals.length, 'profesional', 'profesionales')}>
      {professionals.length ? (
        <PeopleList>
          {professionals.map((professional, index) => {
            const roles = (Array.isArray(professional.roles) ? professional.roles : []).map((role) => labelFor(labels, role)).filter(Boolean);
            return (
              <PersonCard
                key={`${professional.documentNumber || professional.name || 'profesional'}-${index}`}
                title={professional.name}
                badges={roles.map((role, roleIndex) => <Chip key={`${role}-${roleIndex}`}>{role}</Chip>)}
              >
                <FactGrid>
                  <Fact label="Documento" value={documentText(labels, professional.documentType, professional.documentNumber)} />
                  <Fact label="Matrícula profesional" mono value={professional.registrationNumber} />
                  <Fact label="Fecha de matrícula" value={formatDate(professional.registrationDate)} />
                  <Fact label="Experiencia" value={formatExperience(professional.experienceMonths)} />
                  <Fact label="Correo electrónico" value={professional.email} />
                  <Fact label="Teléfono" value={professional.phone} />
                  {hasValue(professional.supervision) ? <Fact label="Supervisión técnica" wide value={professional.supervision} /> : null}
                </FactGrid>
              </PersonCard>
            );
          })}
        </PeopleList>
      ) : <EmptyNote>La solicitud no registra profesionales.</EmptyNote>}
    </DetailCard>
  );
}

export function ResponsibleSection({ metadata, labels }) {
  const responsible = metadataList(metadata, 'responsible');
  return (
    <DetailCard icon={ShieldCheck} title="Responsables" aside={countLabel(responsible.length, 'responsable', 'responsables')}>
      {responsible.length ? (
        <PeopleList>
          {responsible.map((person, index) => (
            <PersonCard key={`${person.documentNumber || person.name || 'responsable'}-${index}`} title={person.name} meta={person.role}>
              <FactGrid>
                <Fact label="Documento" value={documentText(labels, person.documentType, person.documentNumber)} />
                <Fact label="Correo electrónico" value={person.email} />
                <Fact label="Teléfono" value={person.phone} />
                <Fact label="Dirección" value={person.address} />
                <Fact label="Autoriza notificación electrónica" value={formatBoolean(person.notificationAuthorized)} />
              </FactGrid>
            </PersonCard>
          ))}
        </PeopleList>
      ) : <EmptyNote>La solicitud no registra responsables.</EmptyNote>}
    </DetailCard>
  );
}
