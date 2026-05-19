import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/data-table-bridge';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service';
import { Icon } from '@/components/icon';
import { swalConfirm } from '@/app/utils/swalAdapter';
import usePHSave from './hooks/usePHSave';

const EMPTY_FORM = {
    floor: '',
    divisions: [{ name: '', build: '', free: '' }],
    common: ['', '', '', ''],
    fixedEnabled: false,
    fixed: ['', '', '', ''],
};

const toNumber = (value) => Number(value || 0) || 0;
const toMoney = (value) => toNumber(value).toFixed(2);
const splitValue = (value) => value ? value.split(';') : [];

const buildFormFromRow = (row) => {
    const names = splitValue(row?.division);
    const builds = splitValue(row?.division_build);
    const frees = splitValue(row?.division_free);
    const common = splitValue(row?.common);
    const fixed = splitValue(row?.fixed);
    const max = Math.max(names.length, builds.length, frees.length, 1);

    return {
        floor: row?.floor || '',
        divisions: Array.from({ length: max }, (_, index) => ({
            name: names[index] || '',
            build: builds[index] || '',
            free: frees[index] || '',
        })),
        common: Array.from({ length: 4 }, (_, index) => common[index] || ''),
        fixedEnabled: fixed[0] === '&&',
        fixed: Array.from({ length: 4 }, (_, index) => fixed[index + 1] || ''),
    };
};

function RECORD_PH_FLOOR({ swaMsg, currentItem, currentRecord = {}, requestUpdateRecord }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM, divisions: [...EMPTY_FORM.divisions], common: [...EMPTY_FORM.common], fixed: [...EMPTY_FORM.fixed] });
    const [editForm, setEditForm] = useState({ ...EMPTY_FORM, divisions: [...EMPTY_FORM.divisions], common: [...EMPTY_FORM.common], fixed: [...EMPTY_FORM.fixed] });
    const { execute, isSaving } = usePHSave({ swaMsg });

    useEffect(() => {
        if (edit) setEditForm(buildFormFromRow(edit));
    }, [edit]);

    const floors = Array.isArray(currentRecord.record_ph_floors) ? currentRecord.record_ph_floors : [];

    const totals = useMemo(() => {
        return floors.reduce((acc, row) => {
            const common = splitValue(row.common);
            if (common[0] === '&&') {
                acc.common_total += toNumber(common[1]);
            } else {
                acc.common_build += toNumber(common[0]);
                acc.common_free += toNumber(common[1]);
                acc.exclusive_build += toNumber(common[2]);
                acc.exclusive_free += toNumber(common[3]);
                acc.common_total += toNumber(common[0]) + toNumber(common[2]);
            }

            const builds = splitValue(row.division_build);
            const frees = splitValue(row.division_free);
            builds.forEach((build, index) => {
                acc.private_build += toNumber(build);
                acc.private_free += toNumber(frees[index]);
                acc.private_total += toNumber(build) + toNumber(frees[index]);
            });

            acc.total = acc.common_build + acc.exclusive_build + acc.private_build;
            return acc;
        }, {
            common_total: 0,
            common_build: 0,
            common_free: 0,
            exclusive_build: 0,
            exclusive_free: 0,
            private_build: 0,
            private_free: 0,
            private_total: 0,
            total: 0,
        });
    }, [floors]);

    const rowPrivateTotals = (row) => {
        const builds = splitValue(row.division_build);
        const frees = splitValue(row.division_free);
        return builds.map((build, index) => toMoney(toNumber(build) + toNumber(frees[index])));
    };

    const rowSubtotal = (row) => {
        const common = splitValue(row.common);
        if (common[0] === '&&') return toMoney(common[1]);
        const privateBuild = splitValue(row.division_build).reduce((acc, value) => acc + toNumber(value), 0);
        return toMoney(privateBuild + toNumber(common[0]) + toNumber(common[2]));
    };

    const renderList = (value) => {
        const items = splitValue(value);
        return <ul className="list-group list-group-flush">
            {items.length ? items.map(item => <li className="list-group-item mx-0 p-1" key={item || 'empty-value'}>{item || '-'}</li>) : <li className="list-group-item mx-0 p-1">-</li>}
        </ul>;
    };

    const columns = [
        { name: 'Piso', selector: row => row.floor, sortable: true, center: true, cell: row => <span>{row.floor}</span> },
        { name: 'División', center: true, compact: true, cell: row => renderList(row.division) },
        { name: 'Área Privada Construida', center: true, compact: true, cell: row => renderList(row.division_build) },
        { name: 'Área Privada Libre', center: true, compact: true, cell: row => renderList(row.division_free) },
        { name: 'Área Total Privada', center: true, cell: row => renderList(rowPrivateTotals(row).join(';')) },
        { name: 'Área Común Construida', selector: row => splitValue(row.common)[0], sortable: true, center: true, cell: row => <span>{splitValue(row.common)[0] || '0'}</span> },
        { name: 'Área Común Libre', selector: row => splitValue(row.common)[1], sortable: true, center: true, cell: row => <span>{splitValue(row.common)[1] || '0'}</span> },
        { name: 'Área Exclusiva Construida', selector: row => splitValue(row.common)[2], sortable: true, center: true, cell: row => <span>{splitValue(row.common)[2] || '0'}</span> },
        { name: 'Área Exclusiva Libre', selector: row => splitValue(row.common)[3], sortable: true, center: true, cell: row => <span>{splitValue(row.common)[3] || '0'}</span> },
        { name: 'Total Común Construida', selector: row => toMoney(toNumber(splitValue(row.common)[0]) + toNumber(splitValue(row.common)[2])), sortable: true, center: true, cell: row => <span className="fw-bold text-secondary">{toMoney(toNumber(splitValue(row.common)[0]) + toNumber(splitValue(row.common)[2]))}</span> },
        { name: 'Area Total Visto Bueno', selector: rowSubtotal, sortable: true, center: true, cell: row => <span className="fw-bold text-danger">{rowSubtotal(row)}</span> },
        {
            name: 'ACCION',
            button: true,
            minWidth: '120px',
            cell: row => <>
                <span title="Modificar Item"><Button variant="outline" size="sm" className="m-0 p-2" onClick={() => setEdit(row)}><Icon name="edit" size={16} /></Button></span>
                <span title="Eliminar Item"><Button variant="destructive" size="sm" className="m-0 p-2" onClick={() => deleteItem(row.id)}><Icon name="trash-alt" size={16} /></Button></span>
            </>,
        },
    ];

    const updateDivision = (setter, index, field, value) => {
        setter(prev => ({
            ...prev,
            divisions: prev.divisions.map((division, currentIndex) => currentIndex === index ? { ...division, [field]: value } : division),
        }));
    };

    const updateCommon = (setter, index, value) => {
        setter(prev => ({
            ...prev,
            common: prev.common.map((item, currentIndex) => currentIndex === index ? value : item),
        }));
    };

    const updateFixed = (setter, index, value) => {
        setter(prev => ({
            ...prev,
            fixed: prev.fixed.map((item, currentIndex) => currentIndex === index ? value : item),
        }));
    };

    const addDivision = (setter) => setter(prev => ({ ...prev, divisions: [...prev.divisions, { name: '', build: '', free: '' }] }));
    const removeDivision = (setter) => setter(prev => ({ ...prev, divisions: prev.divisions.length > 1 ? prev.divisions.slice(0, -1) : prev.divisions }));

    const buildPayload = (data) => {
        const formData = new FormData();
        formData.set('recordPhId', currentRecord.id);
        if (data.floor) formData.set('floor', data.floor);
        formData.set('division', data.divisions.map(item => item.name).join(';'));
        formData.set('division_build', data.divisions.map(item => item.build).join(';'));
        formData.set('division_free', data.divisions.map(item => item.free).join(';'));
        formData.set('common', data.common.join(';'));
        formData.set('fixed', data.fixedEnabled ? ['&&', ...data.fixed].join(';') : '');
        return formData;
    };

    const resetForm = () => setForm({ ...EMPTY_FORM, divisions: [{ name: '', build: '', free: '' }], common: ['', '', '', ''], fixed: ['', '', '', ''] });

    const newItem = async (event) => {
        event.preventDefault();
        await execute(RECORD_PH_SERVICE.create_floor(buildPayload(form)), {
            operationName: 'crear área',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                resetForm();
                setIsNew(false);
            },
        });
    };

    const editItem = async (event) => {
        event.preventDefault();
        await execute(RECORD_PH_SERVICE.update_floor(edit.id, buildPayload(editForm)), {
            operationName: 'actualizar área',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setEdit(false);
            },
        });
    };

    const deleteItem = async (id) => {
        const confirmed = await swalConfirm({ title: 'ELIMINAR ESTE ITEM', text: '¿Esta seguro de eliminar de forma permanente este item?', icon: 'question', confirmButtonText: 'ELIMINAR' });
        if (!confirmed.isConfirmed) return;

        await execute(RECORD_PH_SERVICE.delete_floor(id), {
            operationName: 'eliminar área',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setEdit(false);
            },
        });
    };

    const renderForm = (data, setter, prefix) => <>
        <div className="row mb-2">
            <div className="col-12 col-md-3">
                <label htmlFor={`${prefix}-floor`}>Piso</label>
                <div className="input-group my-1">
                    <span className="input-group-text bg-primary text-primary-foreground"><Icon name="hashtag" size={16} /></span>
                    <input id={`${prefix}-floor`} type="text" className="form-control" value={data.floor} onChange={(event) => setter(prev => ({ ...prev, floor: event.target.value }))} required />
                </div>
            </div>
        </div>

        <div className="row mb-2 align-items-start">
            <div className="col-12 col-lg-8 border border-info rounded-2 p-2">
                <div className="fw-bold mb-2">Unidades</div>
                {data.divisions.map((division, index) => <div className="row" key={`${division.name}-${division.build}-${division.free}`}>
                    <div className="col-12 col-md">
                        <label htmlFor={`${prefix}-division-name-${index}`}>Unidad {index + 1}</label>
                        <input id={`${prefix}-division-name-${index}`} type="text" className="form-control my-1" value={division.name} onChange={(event) => updateDivision(setter, index, 'name', event.target.value)} />
                    </div>
                    <div className="col-12 col-md">
                        <label htmlFor={`${prefix}-division-build-${index}`}>Área Priv. Construida</label>
                        <input id={`${prefix}-division-build-${index}`} type="number" min="0" step="0.01" className="form-control my-1" value={division.build} onChange={(event) => updateDivision(setter, index, 'build', event.target.value)} />
                    </div>
                    <div className="col-12 col-md">
                        <label htmlFor={`${prefix}-division-free-${index}`}>Área Priv. Libre</label>
                        <input id={`${prefix}-division-free-${index}`} type="number" min="0" step="0.01" className="form-control my-1" value={division.free} onChange={(event) => updateDivision(setter, index, 'free', event.target.value)} />
                    </div>
                </div>)}
            </div>
            <div className="col-12 col-lg-4 text-lg-end mt-2 mt-lg-0">
                {data.divisions.length > 1 ? <Button type="button" variant="outline" size="sm" className="mx-2" onClick={() => removeDivision(setter)}><Icon name="minus-circle" size={16} /> REMOVER ULTIMO</Button> : null}
                <Button type="button" variant="outline" size="sm" onClick={() => addDivision(setter)}><Icon name="plus-circle" size={16} /> AÑADIR</Button>
            </div>
        </div>

        <div className="row mb-2">
            <div className="fw-bold">Área Común</div>
            <div className="col-12 col-lg-6 border border-info rounded-2 p-2">
                <div className="fw-bold">Área de uso Común</div>
                <div className="row">
                    <div className="col"><label htmlFor={`${prefix}-common-build`}>Construida</label><input id={`${prefix}-common-build`} type="number" min="0" step="0.01" className="form-control my-1" value={data.common[0]} onChange={(event) => updateCommon(setter, 0, event.target.value)} /></div>
                    <div className="col"><label htmlFor={`${prefix}-common-free`}>Libre</label><input id={`${prefix}-common-free`} type="number" min="0" step="0.01" className="form-control my-1" value={data.common[1]} onChange={(event) => updateCommon(setter, 1, event.target.value)} /></div>
                </div>
            </div>
            <div className="col-12 col-lg-6 border border-info rounded-2 p-2">
                <div className="fw-bold">Área de uso Exclusivo</div>
                <div className="row">
                    <div className="col"><label htmlFor={`${prefix}-exclusive-build`}>Construida</label><input id={`${prefix}-exclusive-build`} type="number" min="0" step="0.01" className="form-control my-1" value={data.common[2]} onChange={(event) => updateCommon(setter, 2, event.target.value)} /></div>
                    <div className="col"><label htmlFor={`${prefix}-exclusive-free`}>Libre</label><input id={`${prefix}-exclusive-free`} type="number" min="0" step="0.01" className="form-control my-1" value={data.common[3]} onChange={(event) => updateCommon(setter, 3, event.target.value)} /></div>
                </div>
            </div>
        </div>

        <div className="form-check ms-2 my-3">
            <input id={`${prefix}-fixed-enabled`} className="form-check-input" type="checkbox" checked={data.fixedEnabled} onChange={(event) => setter(prev => ({ ...prev, fixedEnabled: event.target.checked }))} />
            <label className="form-check-label" htmlFor={`${prefix}-fixed-enabled`}>Área no modificable</label>
        </div>
        <div className="border border-info rounded-2 p-2 my-2">
            <div className="row">
                <div className="col-12 col-md"><label htmlFor={`${prefix}-fixed-writing`}>Escritura</label><input id={`${prefix}-fixed-writing`} type="text" className="form-control my-1" value={data.fixed[0]} onChange={(event) => updateFixed(setter, 0, event.target.value)} /></div>
                <div className="col-12 col-md"><label htmlFor={`${prefix}-fixed-date`}>Fecha</label><input id={`${prefix}-fixed-date`} type="date" max="2100-01-01" className="form-control my-1" value={data.fixed[1]} onChange={(event) => updateFixed(setter, 1, event.target.value)} /></div>
                <div className="col-12 col-md"><label htmlFor={`${prefix}-fixed-notary`}>Notaria</label><input id={`${prefix}-fixed-notary`} type="number" min="0" step="1" className="form-control my-1" value={data.fixed[2]} onChange={(event) => updateFixed(setter, 2, event.target.value)} /></div>
                <div className="col-12 col-md"><label htmlFor={`${prefix}-fixed-city`}>Ciudad</label><input id={`${prefix}-fixed-city`} type="text" className="form-control my-1" value={data.fixed[3]} onChange={(event) => updateFixed(setter, 3, event.target.value)} /></div>
            </div>
        </div>
    </>;

    return <div className="record_law_gen_11 container my-2">
        <div className="app-p lead fw-bold">AREAS COMUNES Y PRIVADAS</div>
        <div className="form-check ms-5">
            <input id="ph-floor-new-toggle" className="form-check-input" type="checkbox" checked={isNew} onChange={(event) => setIsNew(event.target.checked)} />
            <label className="form-check-label" htmlFor="ph-floor-new-toggle">Nuevo Área</label>
        </div>
        {isNew ? <form id="form_ph_floor_new" onSubmit={newItem}>
            {renderForm(form, setForm, 'ph-floor-new')}
            <div className="row mb-3 text-center"><div className="col-12"><Button size="sm" className="my-3" disabled={isSaving}><Icon name="file-alt" size={16} /> AÑADIR ITEM</Button></div></div>
        </form> : null}

        <DataTable
            conditionalRowStyles={[{ when: row => row.fixed?.includes('&&'), style: { backgroundColor: 'hsl(var(--warning) / 0.12)' } }]}
            noDataComponent="No hay Items"
            striped="true"
            columns={columns}
            data={floors}
            highlightOnHover
            className="data-table-component"
            noHeader
        />

        <div className="row border border-dark mx-2 py-2"><div className="col-12 text-center"><span className="fw-bold">Totales:</span></div></div>
        <div className="row mx-2 text-center ph-floor-totals">
            <div className="col border border-dark"><span className="small">Área Privada Construida</span><br /><span className="fw-bold">{toMoney(totals.private_build)}</span></div>
            <div className="col border border-dark"><span className="small">Área Privada Libre</span><br /><span className="fw-bold">{toMoney(totals.private_free)}</span></div>
            <div className="col border border-dark"><span className="small">Total Área Privada</span><br /><span className="fw-bold text-secondary">{toMoney(totals.private_total)}</span></div>
            <div className="col border border-dark"><span className="small">Área Común Construida</span><br /><span className="fw-bold">{toMoney(totals.common_build)}</span></div>
            <div className="col border border-dark"><span className="small">Área Común Libre</span><br /><span className="fw-bold">{toMoney(totals.common_free)}</span></div>
            <div className="col border border-dark"><span className="small">Área Exclusiva Construida</span><br /><span className="fw-bold">{toMoney(totals.exclusive_build)}</span></div>
            <div className="col border border-dark"><span className="small">Área Exclusiva Libre</span><br /><span className="fw-bold">{toMoney(totals.exclusive_free)}</span></div>
            <div className="col border border-dark"><span className="small">Total Común Construida</span><br /><span className="fw-bold text-secondary">{toMoney(totals.common_total)}</span></div>
            <div className="col border border-dark"><span className="small">Área Total Construida</span><br /><span className="fw-bold text-danger">{toMoney(totals.total)}</span></div>
        </div>

        {edit ? <form id="form_ph_floor_edit" onSubmit={editItem}>
            <h3 className="my-3 text-center">Actualizar Área</h3>
            {renderForm(editForm, setEditForm, 'ph-floor-edit')}
            <div className="row mb-3 text-center"><div className="col-12"><Button size="sm" className="my-3" disabled={isSaving}><Icon name="file-alt" size={16} /> GUARDAR CAMBIOS</Button></div></div>
        </form> : null}
    </div>;
}

export default RECORD_PH_FLOOR;
