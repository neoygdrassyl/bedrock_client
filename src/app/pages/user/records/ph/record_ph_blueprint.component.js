
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/data-table-bridge';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import { Icon } from '@/components/icon';
import { swalConfirm } from '@/app/utils/swalAdapter';
import usePHSave from './hooks/usePHSave';

const INITIAL_FORM = { id_public: '', floor: '', area: '', units_other: '', units: ['','','','','','',''] };

function RECORD_PH_BLUEPRINT({ swaMsg, currentItem, currentRecord, requestUpdateRecord }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [editForm, setEditForm] = useState({ ...INITIAL_FORM });
    const { execute, isSaving } = usePHSave({ swaMsg });

    useEffect(() => {
        if (edit !== false) {
            const units = edit.units ? edit.units.split(';') : ['','','','','','',''];
            setEditForm({
                id_public: edit.id_public ?? '',
                floor: edit.floor ?? '',
                area: edit.area ?? '',
                units_other: edit.units_other ?? '',
                units: units.length >= 7 ? units : [...units, ...Array(7 - units.length).fill('')],
            });
        }
    }, [edit]);

    let _GET_CHILD_BLUEPRINTS = () => {
        var _CHILD = currentRecord.record_ph_blueprints;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    let _CHILD_LICENCE_LIST = () => {
        let _LIST = _GET_CHILD_BLUEPRINTS();
        const columns = [
            {
                name: 'ID Plano',
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.id_public}</span>
            },
            {
                name: 'Sótano / Piso',
                selector: row => row.floor,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.floor}</span>
            },
            {
                name: 'Área total construida m2',
                selector: row => row.area,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.area}</span>
            },
            {
                name: 'Vivienda / Aptos.',
                selector: row => (row.units).split(";")[0],
                sortable: true,
                filterable: true,
                center: true,
                minWidth: "40px",
                compact: true,
                cell: row => <span>{(row.units).split(";")[0]}</span>
            },
            {
                name: 'Locales / Lockers',
                selector: row => (row.units).split(";")[1],
                sortable: true,
                filterable: true,
                center: true,
                minWidth: "40px",
                compact: true,
                cell: row => <span>{(row.units).split(";")[1]}</span>
            },
            {
                name: 'Parcelas / Lotes',
                selector: row => (row.units).split(";")[2],
                sortable: true,
                filterable: true,
                center: true,
                minWidth: "40px",
                compact: true,
                cell: row => <span>{(row.units).split(";")[2]}</span>
            },
            {
                name: 'Parqueos',
                selector: row => (row.units).split(";")[3],
                sortable: true,
                filterable: true,
                center: true,
                minWidth: "40px",
                compact: true,
                cell: row => <span>{(row.units).split(";")[3]}</span>
            },
            {
                name: 'Oficinas',
                selector: row => (row.units).split(";")[4],
                sortable: true,
                filterable: true,
                center: true,
                minWidth: "40px",
                compact: true,
                cell: row => <span>{(row.units).split(";")[4]}</span>
            },
            {
                name: 'Bodegas',
                selector: row => (row.units).split(";")[5],
                sortable: true,
                filterable: true,
                center: true,
                minWidth: "40px",
                compact: true,
                cell: row => <span>{(row.units).split(";")[5]}</span>
            },
            {
                name: 'Número Parqueos',
                selector: row => (row.units).split(";")[6],
                sortable: true,
                filterable: true,
                center: true,
                minWidth: "40px",
                compact: true,
                cell: row => <span>{(row.units).split(";")[6]}</span>
            },
            {
                name: 'Descripción otros bienes (espacios)',
                selector: row => row.units_other,
                sortable: true,
                filterable: true,
                center: true,
                minWidth: "180px",
                cell: row => <span>{row.units_other}</span>
            },
            {
                name: 'ACCION',
                button: true,
                minWidth: '120px',
                cell: row => <>
                    <span title="Modificar Item"><Button variant="outline" size="sm" className="m-0 p-2" onClick={() => setEdit(row)}><Icon name="edit" size={16} /></Button></span>
                    <span title="Eliminar Item"><Button variant="destructive" size="sm" className="m-0 p-2" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></Button></span>
                </>
            },
        ]
        return <div className="table-responsive rounded-3 border bg-background">
            <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        </div>
    }

    let _COMPONENT_MANAGE = (isEditing = false) => {
        const data = isEditing ? editForm : form;
        const setData = isEditing ? setEditForm : setForm;
        const suffix = isEditing ? '_edit' : '';

        const handleChange = (field) => (e) => {
            setData(prev => ({ ...prev, [field]: e.target.value }));
        };

        const handleUnitChange = (index) => (e) => {
            setData(prev => {
                const next = [...prev.units];
                next[index] = e.target.value;
                return { ...prev, units: next };
            });
        };

        return <>
            <div className="row mb-2 g-2">
                <div className="col-12 col-md-4">
                    <label htmlFor={"r_ph_bl_1" + suffix}>ID Plano</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="hashtag" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_bl_1" + suffix} value={data.id_public} onChange={handleChange('id_public')} />
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <label htmlFor={"r_ph_bl_2" + suffix}>Sótano / Piso</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="home" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_bl_2" + suffix} value={data.floor} onChange={handleChange('floor')} />
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <label htmlFor={"r_ph_bl_3" + suffix}>Área total Construida m2</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="ruler" size={16} />
                        </span>
                        <input type="number" min="0" step="0.01" className="form-control" id={"r_ph_bl_3" + suffix} value={data.area} onChange={handleChange('area')} />
                    </div>
                </div>
            </div>
            <div className="row border border-info rounded-2 p-2 mx-0 g-2">
                <div className="fw-bold">Número de unidades privadas</div>
                <div className="col-12 col-md-4 col-xl-2">
                    <label htmlFor={"r_ph_bl_4_0" + suffix}>Viviendas/ Apartamentos</label>
                    <div className="input-group my-1">
                        <input id={"r_ph_bl_4_0" + suffix} type="number" min="0" className="form-control" value={data.units[0]} onChange={handleUnitChange(0)} />
                    </div>
                </div>
                <div className="col-12 col-md-4 col-xl-2">
                    <label htmlFor={"r_ph_bl_4_1" + suffix}>Locales / Lockers</label>
                    <div className="input-group my-1">
                        <input id={"r_ph_bl_4_1" + suffix} type="number" min="0" className="form-control" value={data.units[1]} onChange={handleUnitChange(1)} />
                    </div>
                </div>
                <div className="col-12 col-md-4 col-xl-2">
                    <label htmlFor={"r_ph_bl_4_2" + suffix}>Parcelas / Lotes</label>
                    <div className="input-group my-1">
                        <input id={"r_ph_bl_4_2" + suffix} type="number" min="0" className="form-control" value={data.units[2]} onChange={handleUnitChange(2)} />
                    </div>
                </div>
                <div className="col-12 col-md-4 col-xl-2">
                    <label htmlFor={"r_ph_bl_4_3" + suffix}>Parqueos</label>
                    <div className="input-group my-1">
                        <input id={"r_ph_bl_4_3" + suffix} type="number" min="0" className="form-control" value={data.units[3]} onChange={handleUnitChange(3)} />
                    </div>
                </div>
                <div className="col-12 col-md-4 col-xl-2">
                    <label htmlFor={"r_ph_bl_4_4" + suffix}>Oficinas</label>
                    <div className="input-group my-1">
                        <input id={"r_ph_bl_4_4" + suffix} type="number" min="0" className="form-control" value={data.units[4]} onChange={handleUnitChange(4)} />
                    </div>
                </div>
                <div className="col-12 col-md-4 col-xl-2">
                    <label htmlFor={"r_ph_bl_4_5" + suffix}>Bodegas</label>
                    <div className="input-group my-1">
                        <input id={"r_ph_bl_4_5" + suffix} type="number" min="0" className="form-control" value={data.units[5]} onChange={handleUnitChange(5)} />
                    </div>
                </div>
            </div>

            <div className="row border border-info rounded-2 p-2 mx-0 mt-2 g-2">
                <div className="fw-bold">Bienes comunes (Espacios)</div>
                <div className="col-12 col-md-4">
                    <label htmlFor={"r_ph_bl_4_6" + suffix}>Número Parqueos</label>
                    <div className="input-group my-1">
                        <input id={"r_ph_bl_4_6" + suffix} type="number" min="0" className="form-control" value={data.units[6]} onChange={handleUnitChange(6)} />
                    </div>
                </div>
                <div className="col-12 col-md-8">
                    <label htmlFor={"r_ph_bl_5" + suffix}>Descripción otros bienes (espacios)</label>
                    <div className="input-group my-1">
                        <input type="text" className="form-control" id={"r_ph_bl_5" + suffix} value={data.units_other} onChange={handleChange('units_other')} />
                    </div>
                </div>
            </div>
        </>
    }

    let _COMPONENT_TOTAL = () => {
        let _LIST = _GET_CHILD_BLUEPRINTS();
        let _area = 0;
        let _units = [0, 0, 0, 0, 0, 0, 0]
        for (let i = 0; i < _LIST.length; i++) {
            _area += Number(_LIST[i].area);
            let split = (_LIST[i].units).split(';');
            _units[0] += Number(split[0] ?? 0);
            _units[1] += Number(split[1] ?? 0);
            _units[2] += Number(split[2] ?? 0);
            _units[3] += Number(split[3] ?? 0);
            _units[4] += Number(split[4] ?? 0);
            _units[5] += Number(split[5] ?? 0);
            _units[6] += Number(split[6] ?? 0);
        }
        return <>
            <div className="row">
                <div className="col-12 border p-2 text-center">
                    <span className="fw-bold">Totales:</span>
                </div>
            </div>
            <div className="row border p-2">
                <div className="col-12">
                    <span>Construido: </span> <span className="fw-bold">{(_area).toFixed(2)} m2</span>
                </div>
            </div>
            <div className="row border p-2">
                <div className="col">
                    <span>Vivienda / Aptos: </span>  <span className="fw-bold">{_units[0]}</span>
                </div>
                <div className="col">
                    <span>Locales / Lockers: </span>  <span className="fw-bold">{_units[1]}</span>
                </div>
                <div className="col">
                    <span>Parcelas Lotes: </span>  <span className="fw-bold">{_units[2]}</span>
                </div>
                <div className="col">
                    <span>Parqueos: </span>   <span className="fw-bold">{_units[3]}</span>
                </div>
                <div className="col">
                    <span>Oficinas:  </span>  <span className="fw-bold">{_units[4]}</span>
                </div>
                <div className="col">
                    <span>Bodegas: </span>  <span className="fw-bold">{_units[5]}</span>
                </div>
                <div className="col">
                    <span>Número Parqueos: </span>  <span className="fw-bold">{_units[6]}</span>
                </div>
            </div>
        </>
    }

    let new_item = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('recordPhId', currentRecord.id);
        if (form.id_public) formData.set('id_public', form.id_public);
        if (form.floor) formData.set('floor', form.floor);
        if (form.area) formData.set('area', form.area);
        if (form.units_other) formData.set('units_other', form.units_other);
        formData.set('units', form.units.join(';'));

        await execute(RECORD_PH_SERVICE.create_blueprint(formData), {
            operationName: 'crear plano',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setForm({ ...INITIAL_FORM });
            },
        });
    }

    let delete_item = async (id) => {
        const confirmed = await swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" });
        if (!confirmed.isConfirmed) return;

        await execute(RECORD_PH_SERVICE.delete_blueprint(id), {
            operationName: 'eliminar plano',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setEdit(false);
            },
        });
    }

    let edit_item = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('id_public', editForm.id_public);
        formData.set('floor', editForm.floor);
        formData.set('area', editForm.area);
        formData.set('units_other', editForm.units_other);
        if (editForm.units.length) formData.set('units', editForm.units.join(';'));

        await execute(RECORD_PH_SERVICE.update_blueprint(edit.id, formData), {
            operationName: 'actualizar plano',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setEditForm({ ...INITIAL_FORM });
                setEdit(false);
            },
        });
    }

    return (
        <div className="record_law_gen_11 container-xl my-3 px-3">
            <div className="app-p lead fw-bold">RELACIÓN DE PLANOS PRESENTADOS</div>

            <div className="form-check ms-5">
                <input id="ph-blueprint-new-toggle" className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                <label className="form-check-label" htmlFor="ph-blueprint-new-toggle">
                    Nuevo Plano
                </label>
            </div>
            {isNew
                ? <>
                    <form id="form_ph_blueprint_new" onSubmit={new_item}>
                        {_COMPONENT_MANAGE(false)}
                        <div className="row mb-3 text-center">
                            <div className="col-12">
                                <Button size="sm" className="my-3" disabled={isSaving}><Icon name="file-alt" size={16} /> AÑADIR ITEM </Button>
                            </div>
                        </div>
                    </form>
                </>
                : ""}
            {_CHILD_LICENCE_LIST()}
            {_COMPONENT_TOTAL()}
            {edit
                ? <>
                    <form id="form_ph_blueprint_edit" onSubmit={edit_item}>
                        <h3 className="my-3 text-center">Actualizar Plano</h3>
                        {_COMPONENT_MANAGE(true)}
                        <div className="row mb-3 text-center">
                            <div className="col-12">
                                <Button size="sm" className="my-3" disabled={isSaving}><Icon name="file-alt" size={16} /> GUARDAR CAMBIOS </Button>
                            </div>
                        </div>
                    </form>
                </>
                : ""}
        </div >
    );
}

export default RECORD_PH_BLUEPRINT;
