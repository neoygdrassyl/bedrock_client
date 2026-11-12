import DataTable from '@/shared/components/data-table-bridge';

function BlueprintChecklistTable({ items, values, checks, getSelectClassName, onSave }) {
    const checklistItems = items.filter(item => !item.open);
    const observationItem = items.find(item => item.open);
    // The `min`/`step` attributes only hint the browser; a typed negative or decimal count was persisted as-is.
    const saveQuantity = (event) => {
        const quantity = Number(event.target.value);
        if (!Number.isFinite(quantity) || quantity < 0) event.target.value = '0';
        else if (!Number.isInteger(quantity)) event.target.value = String(Math.trunc(quantity));
        onSave(event);
    };
    const columns = [
        {
            name: 'PLANO',
            cell: item => <span>{item.name}</span>,
        },
        {
            name: 'CANT.',
            right: true,
            maxWidth: '180px',
            cell: item => <>
                <label className="visually-hidden" htmlFor={`blue_prints_values_${item.v}`}>Cantidad de {item.name}</label>
                <input type="number" step={1} min="0" onBlur={saveQuantity} className="form-control form-control-sm ew-num ms-auto w-24 text-end"
                    name="blue_prints_values" id={`blue_prints_values_${item.v}`} defaultValue={values[item.v] ?? 0} />
            </>,
        },
        {
            name: 'EVA.',
            center: true,
            maxWidth: '200px',
            cell: item => <>
                <label className="visually-hidden" htmlFor={`blue_prints_checks_${item.c}`}>Evaluación de {item.name}</label>
                <select className={getSelectClassName(checks[item.c])} name="blue_prints_checks"
                    id={`blue_prints_checks_${item.c}`} defaultValue={checks[item.c] || 2} onChange={onSave}>
                    <option value="0" className="text-danger">NO CUMPLE</option>
                    <option value="1" className="text-success">CUMPLE</option>
                    <option value="2" className="text-warning">NO APLICA</option>
                </select>
            </>,
        },
    ];

    return <div className="blueprint-checklist-table">
        <DataTable pagination={false}
            noDataComponent="No hay Items"
            columns={columns}
            data={checklistItems}
            highlightOnHover
            className="data-table-component"
            noHeader
            dense
        />
        {observationItem ? <div className="mt-2">
            <label className="visually-hidden" htmlFor={`blue_prints_values_${observationItem.v}`}>{observationItem.name}</label>
            <input type="text" onBlur={onSave} className="form-control form-control-sm"
                name="blue_prints_values" id={`blue_prints_values_${observationItem.v}`} defaultValue={values[observationItem.v] ?? ''}
                placeholder={observationItem.name} />
        </div> : null}
    </div>;
}

export default BlueprintChecklistTable;
