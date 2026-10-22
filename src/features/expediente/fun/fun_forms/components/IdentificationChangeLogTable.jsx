import ChangeLogTable from './ChangeLogTable.jsx';

const COLUMNS = [
  { key: 'targetId', label: 'ID', cellClassName: 'text-center font-semibold' },
  { key: 'date', label: 'FECHA', cellClassName: 'whitespace-nowrap' },
  { key: 'vr', label: 'VR', className: 'w-24', cellClassName: 'w-24' },
  { key: 'responsibleName', label: 'RESPONSABLE', cellClassName: 'text-center' },
  { key: 'category', label: 'CATEGORÍA', className: 'w-32', cellClassName: 'w-32' },
  { key: 'updateDetail', label: 'ACTUALIZACIÓN' },
  { key: 'support', label: 'SOPORTE' },
  { key: 'receiptStatus', label: 'RADICACIÓN', cellClassName: 'text-center font-semibold' },
  { key: 'action', label: 'ACCIÓN', className: 'w-16', cellClassName: 'w-16 text-center' },
];

export default function IdentificationChangeLogTable(props) {
  return <ChangeLogTable
    {...props}
    ariaLabel="Bitácora de cambios de Identificación"
    title="Bitácora de cambios de Identificación"
    description="Los cambios detectados se registran al actualizar la solicitud."
    columns={COLUMNS}
    sectionProps={{ 'data-identification-change-log': true }}
  />;
}
