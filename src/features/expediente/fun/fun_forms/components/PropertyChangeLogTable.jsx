import ChangeLogTable from './ChangeLogTable.jsx';

const COLUMNS = [
  { key: 'targetId', label: 'ID', cellClassName: 'text-center font-semibold' },
  { key: 'date', label: 'FECHA', cellClassName: 'whitespace-nowrap' },
  { key: 'responsibleName', label: 'RESPONSABLE', cellClassName: 'text-center', useEntryResponsibleFallback: false },
  { key: 'category', label: 'CATEGORÍA', className: 'w-32', cellClassName: 'w-32' },
  { key: 'updateDetail', label: 'ACTUALIZACIÓN' },
  { key: 'support', label: 'SOPORTE' },
  { key: 'receiptStatus', label: 'RADICACIÓN', cellClassName: 'text-center font-semibold' },
  { key: 'action', label: 'ACCIÓN', className: 'w-16', cellClassName: 'w-16 text-center' },
];

export default function PropertyChangeLogTable(props) {
  return <ChangeLogTable
    {...props}
    ariaLabel="Bitácora de cambios de Información del Predio"
    title="Bitácora de cambios de Información del Predio"
    description="Los cambios detectados se registran al actualizar el predio."
    columns={COLUMNS}
    sectionProps={{ 'data-property-change-log': true }}
    keepVisible
  />;
}
