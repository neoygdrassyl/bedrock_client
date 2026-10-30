import { Compass, Fence, Ruler } from 'lucide-react';
import {
  formatNumber,
  hasValue,
  labelFor,
  metadataList,
  metadataSection,
  plural,
} from '../onlineRadicationModel';
import { CollapsibleCard, CountPill, DetailCard, EmptyNote, Fact, FactGrid, MiniTable } from './DetailPrimitives';

const ORIENTATION_LABELS = { NORTE: 'Norte', SUR: 'Sur', ORIENTE: 'Oriente', OCCIDENTE: 'Occidente' };

const NEIGHBOR_COLUMNS = [
  { key: 'propertyAddress', label: 'Dirección del predio', cellClassName: 'min-w-[12rem]' },
  { key: 'correspondenceAddress', label: 'Dirección de correspondencia', cellClassName: 'min-w-[12rem]' },
  { key: 'name', label: 'Nombre' },
];

const BOUNDARY_COLUMNS = [
  { key: 'orientation', label: 'Orientación', render: (row) => ORIENTATION_LABELS[row.orientation] || row.orientation, cellClassName: 'whitespace-nowrap font-medium' },
  { key: 'lengthM', label: 'Longitud', render: (row) => formatNumber(row.lengthM, ' m'), className: 'text-right', cellClassName: 'whitespace-nowrap text-right tabular-nums' },
  { key: 'adjoinsWith', label: 'Colinda con', cellClassName: 'w-full' },
];

/** Vecinos colindantes: folded by default, the count stays visible in the header. */
export function NeighborsSection({ metadata }) {
  const neighbors = metadataList(metadata, 'neighbors');
  return (
    <CollapsibleCard
      icon={Fence}
      title="Vecinos colindantes"
      aside={<CountPill label={plural(neighbors.length, 'vecino')}>{neighbors.length}</CountPill>}
    >
      {neighbors.length
        ? <MiniTable label="Vecinos colindantes" columns={NEIGHBOR_COLUMNS} rows={neighbors} />
        : <EmptyNote>La solicitud no registra vecinos colindantes.</EmptyNote>}
    </CollapsibleCard>
  );
}

export function BoundariesSection({ metadata }) {
  const boundaries = metadataList(metadata, 'boundaries');
  return (
    <DetailCard icon={Compass} title="Linderos" aside={<CountPill label={plural(boundaries.length, 'lindero')}>{boundaries.length}</CountPill>}>
      {boundaries.length
        ? <MiniTable label="Linderos del predio" columns={BOUNDARY_COLUMNS} rows={boundaries} />
        : <EmptyNote>La solicitud no registra linderos.</EmptyNote>}
    </DetailCard>
  );
}

export function CharacteristicsSection({ metadata, labels }) {
  const characteristics = metadataSection(metadata, 'characteristics');
  const label = (key) => labelFor(labels, characteristics[key], `characteristics.${key}`);
  return (
    <DetailCard icon={Ruler} title="Características">
      <FactGrid>
        <Fact label="Área construida" value={formatNumber(characteristics.builtAreaM2, ' m²')} />
        <Fact label="Rango de área" value={label('areaCode')} />
        <Fact label="Tipo de vivienda" value={label('housingCode')} />
        <Fact label="Bien de interés cultural" value={label('culturalCode')} />
        <Fact label="Construcción sostenible" value={label('sustainableCode')} />
        <Fact label="Zona climática" value={label('climateCode')} />
        {hasValue(characteristics.sustainableAnnex) ? <Fact label="Anexo de construcción sostenible" value="Diligenciado en el portal" /> : null}
      </FactGrid>
    </DetailCard>
  );
}
