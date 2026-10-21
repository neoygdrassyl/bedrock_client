
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/data-table-bridge';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import { Icon } from '@/components/icon';
import { swalConfirm } from '@/app/utils/swalAdapter';
import usePHSave from './hooks/usePHSave';

const INITIAL_FORM = { number: '', predial: '', matricula: '', nomenclature: '', area: '' };

function RECORD_PH_BUILDING({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, CATEGORY, requestUpdateRecord }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [editForm, setEditForm] = useState({ ...INITIAL_FORM });
    const { execute, isSaving } = usePHSave({ swaMsg });

    useEffect(() => {
        if (edit !== false) {
            setEditForm({
                number: edit.number ?? '',
                predial: edit.predial ?? '',
                matricula: edit.matricula ?? '',
                nomenclature: edit.nomenclature ?? '',
                area: edit.area ?? '',
            });
        }
    }, [edit]);

    let _GET_CHILD_BUILDINGS = () => {
        var _CHILD = currentRecord.record_ph_buildings;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    let _CHILD_LICENCE_LIST = () => {
        let _LIST = _GET_CHILD_BUILDINGS();
        const columns = [
            {
                name: 'PREDIO N°',
                selector: row => row.number,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.number}</span>
            },
            {
                name: 'PREDIAL',
                selector: row => row.predial,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.predial}</span>
            },
            {
                name: 'MATRICULA',
                selector: row => row.matricula,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.matricula}</span>
            },
            {
                name: 'NOMENCLATURA',
                selector: row => row.nomenclature,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label >{row.nomenclature}</label>
            },
            {
                name: 'AREA Y LINDEROS',
                selector: row => row.area,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label >{row.area} m2</label>
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '120px',
                cell: row => <>
                    <span title="Modificar Item"><Button variant="outline" size="sm" className="m-0 p-2" onClick={() => setEdit(row)}><Icon name="edit" size={16} /></Button></span>
                    <span title="Eliminar Item"><Button variant="destructive" size="sm" className="m-0 p-2" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></Button></span>
                </>
            },
        ]
        return <DataTable
            noDataComponent="No hay Items"
            striped="true"
            columns={columns}
            data={_LIST}
            highlightOnHover
            className="data-table-component"
            noHeader
        />
    }

    let _COMPONENT_MANAGE = (isEditing = false) => {
        const data = isEditing ? editForm : form;
        const setData = isEditing ? setEditForm : setForm;
        const suffix = isEditing ? '_edit' : '';

        const handleChange = (field) => (e) => {
            setData(prev => ({ ...prev, [field]: e.target.value }));
        };

        return <>
            <div className="row mb-1">
                <div className="col-3">
                    <label>Predio N°</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                        <Icon name="hashtag" size={16} />
                        </span>
                        <input type="number" className="form-control" id={"r_ph_g_1" + suffix} value={data.number} onChange={handleChange('number')} />
                    </div>
                </div>
                <div className="col-3">
                    <label>Área y Linderos (m2)</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                        <Icon name="ruler" size={16} />
                        </span>
                        <input type="number" step="0.01" className="form-control" id={"r_ph_g_5" + suffix} value={data.area} onChange={handleChange('area')} />
                    </div>
                </div>
            </div>
            <div className="row mb-1">
                <div className="col-4">
                    <label>Número Predial</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="home" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_g_2" + suffix} value={data.predial} onChange={handleChange('predial')} />
                    </div>
                </div>
                <div className="col-4">
                    <label>Matricula</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="home" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_g_3" + suffix} value={data.matricula} onChange={handleChange('matricula')} />
                    </div>
                </div>
                <div className="col-4">
                    <label>Nomenclatura</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="home" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_g_4" + suffix} value={data.nomenclature} onChange={handleChange('nomenclature')} />
                    </div>
                </div>
            </div>
        </>
    }

    let new_item = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('recordPhId', currentRecord.id);
        if (form.number) formData.set('number', form.number);
        if (form.predial) formData.set('predial', form.predial);
        if (form.matricula) formData.set('matricula', form.matricula);
        if (form.nomenclature) formData.set('nomenclature', form.nomenclature);
        if (form.area) formData.set('area', form.area);

        await execute(RECORD_PH_SERVICE.create_building(formData), {
            operationName: 'crear predio',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setForm({ ...INITIAL_FORM });
            },
        });
    }

    let delete_item = async (id) => {
        const confirmed = await swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" });
        if (!confirmed.isConfirmed) return;

        await execute(RECORD_PH_SERVICE.delete_building(id), {
            operationName: 'eliminar predio',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setEdit(false);
            },
        });
    }

    let edit_item = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (editForm.number) formData.set('number', editForm.number);
        if (editForm.predial) formData.set('predial', editForm.predial);
        if (editForm.matricula) formData.set('matricula', editForm.matricula);
        if (editForm.nomenclature) formData.set('nomenclature', editForm.nomenclature);
        if (editForm.area) formData.set('area', editForm.area);

        await execute(RECORD_PH_SERVICE.update_building(edit.id, formData), {
            operationName: 'actualizar predio',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setEditForm({ ...INITIAL_FORM });
                setEdit(false);
            },
        });
    }

    return (
        <div className="record_law_gen_11 container my-2">
            <label className="app-p lead fw-bold">DATOS DE PREDIO(S)</label>

            <div className="form-check ms-5">
                <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                <label className="form-check-label" htmlFor="flexCheckDefault">
                    Nuevo Predio
                </label>
            </div>
            {isNew
                ? <>
                    <form id="form_ph_building_new" onSubmit={new_item}>
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
            {edit
                ? <>
                    <form id="form_ph_building_edit" onSubmit={edit_item}>
                        <h3 className="my-3 text-center">Actualizar Predio</h3>
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

export default RECORD_PH_BUILDING;
