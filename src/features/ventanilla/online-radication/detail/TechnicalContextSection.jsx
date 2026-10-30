import { Cpu } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { abbreviateChecksum, formatFactValue, getSnapshot, hasValue } from '../onlineRadicationModel';
import { CollapsibleCard, EmptyNote, Fact, FactGrid } from './DetailPrimitives';

function SubHeading({ children }) {
  return <h4 className="mb-2 mt-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</h4>;
}

function FactsList({ facts }) {
  const entries = facts && typeof facts === 'object' && !Array.isArray(facts) ? Object.entries(facts) : [];
  if (!entries.length) return <EmptyNote>El portal no envió hechos evaluados.</EmptyNote>;
  return (
    <dl className="m-0 grid gap-x-[1rem] gap-y-1.5 rounded-lg border bg-muted/20 px-[0.875rem] py-2.5 sm:grid-cols-[minmax(10rem,auto)_1fr]">
      {entries.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="break-all font-mono text-xs text-muted-foreground">{key}</dt>
          <dd className="mb-1.5 ml-0 break-words font-mono text-xs text-foreground sm:mb-0">{formatFactValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function ChoicesList({ choices }) {
  const rows = Array.isArray(choices) ? choices.filter(Boolean) : [];
  if (!rows.length) return <EmptyNote>El portal no envió elecciones de tipología.</EmptyNote>;
  return (
    <ul className="mb-0 list-none space-y-1.5 p-0">
      {rows.map((choice, index) => (
        <li key={`${choice.classificationCode}-${index}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs">
          <span className="font-mono font-semibold text-foreground">{choice.classificationCode || '—'}</span>
          <span className="font-mono text-muted-foreground">{(Array.isArray(choice.optionIds) ? choice.optionIds : []).join(', ') || '—'}</span>
        </li>
      ))}
    </ul>
  );
}

/** Contexto técnico (folded): Central release, checksum, evaluated facts and choices. */
export function TechnicalContextSection({ item }) {
  const release = item.release && typeof item.release === 'object' ? item.release : {};
  const snapshot = getSnapshot(item);
  return (
    <CollapsibleCard icon={Cpu} title="Contexto técnico" contentClassName="flex flex-col gap-[1rem]">
      <FactGrid>
        <Fact label="Publicación de Central" mono value={release.id} />
        <Fact label="Versión" value={hasValue(release.version) ? `v${release.version}` : null} />
        <Fact label="Checksum de la publicación">
          {hasValue(release.checksum) ? (
            <span className="inline-flex items-center gap-1">
              <span className="font-mono text-[13px]" title={release.checksum}>{abbreviateChecksum(release.checksum)}</span>
              <CopyButton value={release.checksum} label="Copiar checksum completo" />
            </span>
          ) : null}
        </Fact>
        <Fact label="Publicación sincronizada (Backoffice)" mono value={item.centralReleaseId ?? null} />
        <Fact label="Id de la solicitud en el portal" mono value={item.sourceApplicationId} />
        <Fact label="Esquema del snapshot" mono value={snapshot?.schemaVersion} />
      </FactGrid>
      <div>
        <SubHeading>Hechos evaluados</SubHeading>
        <FactsList facts={item.facts} />
      </div>
      <div>
        <SubHeading>Elecciones</SubHeading>
        <ChoicesList choices={item.choices} />
      </div>
    </CollapsibleCard>
  );
}
