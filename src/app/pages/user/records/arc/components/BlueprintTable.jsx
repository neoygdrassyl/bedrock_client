import { Button } from '@/components/ui/button';
import DataTable from '@/components/data-table-bridge';
import { Icon } from '@/components/icon';

function formatDate(value) {
    if (!value) return '';
    const [year, month, day] = String(value).slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatCategory(value) {
    return value === 'cortes' ? '' : value || '';
}

function BlueprintTable({ rows, renderDocument, onEdit, onDelete }) {
    const columns = [
        {
            name: 'ID',
            center: true,
            maxWidth: '80px',
            cell: row => <span>{row.id_public}</span>,
        },
        {
            name: 'Escala',
            center: true,
            maxWidth: '100px',
            cell: row => <span>{row.scale}</span>,
        },
        {
            name: 'FECHA',
            center: true,
            maxWidth: '130px',
            cell: row => <span>{formatDate(row.date)}</span>,
        },
        {
            name: 'CATEGORIA',
            center: true,
            minWidth: '180px',
            cell: row => <span>{formatCategory(row.category)}</span>,
        },
        {
            name: 'Descripción',
            center: true,
            cell: row => <span>{row.use}</span>,
        },
        {
            name: 'Documento',
            center: true,
            cell: renderDocument,
        },
        {
            name: 'ACCIÓN',
            button: true,
            center: true,
            minWidth: '120px',
            cell: row => <>
                <Button
                    aria-label={`Editar plano ${row.id_public}`}
                    variant="outline"
                    size="sm"
                    className="px-2 me-1"
                    onClick={() => onEdit(row)}
                >
                    <Icon name="edit" size={16} />
                </Button>
                <Button
                    aria-label={`Eliminar plano ${row.id_public}`}
                    variant="destructive"
                    size="sm"
                    className="px-2"
                    onClick={() => onDelete(row)}
                >
                    <Icon name="trash-alt" size={16} />
                </Button>
            </>,
        },
    ];

    return <DataTable
        noDataComponent="No hay Items"
        striped="true"
        columns={columns}
        data={rows}
        highlightOnHover
        className="data-table-component"
        noHeader
        dense
    />;
}

export default BlueprintTable;
