
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/data-table-bridge';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import { Icon } from '@/components/icon';
import { swalConfirm } from '@/app/utils/swalAdapter';
import usePHSave from './hooks/usePHSave';

const INITIAL_FORM = { name: '', surname: '', role: '', registration: '', date: '', type: '', check: '', context: '' };

function RECORD_PH_PROFESIONAL({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [editForm, setEditForm] = useState({ ...INITIAL_FORM });
    const { execute, isSaving } = usePHSave({ swaMsg });

    useEffect(() => {
        if (edit !== false) {
            setEditForm({
                name: edit.name ?? '',
                surname: edit.surname ?? '',
                role: edit.role ?? '',
                registration: edit.registration ?? '',
                date: edit.date ?? '',
                type: edit.type ?? '',
                check: edit.check ?? '',
                context: edit.context ?? '',
            });
        }
    }, [edit]);

    let _GET_CHILD_PROFESIONALS = () => {
        var _CHILD = currentRecord.record_ph_profesionals;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    let _CHILD_LICENCE_LIST = () => {
        let _LIST = _GET_CHILD_PROFESIONALS();
        const columns = [
            {
                name: 'NOMBRE',
                selector: row => row.name,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.name}</span>
            },
            {
                name: 'APELLIDO',
                selector: row => row.surname,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.surname}</span>
            },
            {
                name: 'ROL',
                selector: row => row.role,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.role}</span>
            },
            {
                name: 'MATRICULA',
                selector: row => row.registration,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label >{row.registration}</label>
            },
            {
                name: 'FECHA',
                selector: row => row.date,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label >{row.date}</label>
            },
            {
                name: 'TIPO',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label >{row.type}</label>
            },
            {
                name: 'CUMPLE',
                selector: row => row.check,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label >{row.check}</label>
            },
            {
                name: 'OBSERVACIONES / RECOMENDACIONES',
                selector: row => row.context,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label >{row.context}</label>
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
                <div className="col">
                    <label>Nombre</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="user" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_p_1" + suffix} value={data.name} onChange={handleChange('name')} />
                    </div>
                </div>
                <div className="col">
                    <label>Apellido</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="user" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_p_2" + suffix} value={data.surname} onChange={handleChange('surname')} />
                    </div>
                </div>
                <div className="col">
                    <label>Rol</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="briefcase" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_p_3" + suffix} value={data.role} onChange={handleChange('role')} />
                    </div>
                </div>
                <div className="col">
                    <label>Matricula</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="id-card" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_p_4" + suffix} value={data.registration} onChange={handleChange('registration')} />
                    </div>
                </div>
            </div>
            <div className="row mb-1">
                <div className="col">
                    <label>Fecha</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="calendar" size={16} />
                        </span>
                        <input type="date" max="2100-01-01" className="form-control" id={"r_ph_p_5" + suffix} value={data.date} onChange={handleChange('date')} />
                    </div>
                </div>
                <div className="col">
                    <label>Tipo</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="file-alt" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_p_6" + suffix} value={data.type} onChange={handleChange('type')} />
                    </div>
                </div>
                <div className="col">
                    <label>Cumple</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="check-circle" size={16} />
                        </span>
                        <select className="form-select" id={"r_ph_p_7" + suffix} value={data.check} onChange={handleChange('check')}>
                            <option value="">Seleccione...</option>
                            <option value="SI">SI</option>
                            <option value="NO">NO</option>
                            <option value="PARCIAL">PARCIAL</option>
                            <option value="NO APLICA">NO APLICA</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="row mb-1">
                <div className="col">
                    <label>Observaciones / Recomendaciones</label>
                    <div className="input-group my-1">
                        <textarea className="form-control" id={"r_ph_p_8" + suffix} rows="3" value={data.context} onChange={handleChange('context')}></textarea>
                    </div>
                </div>
            </div>
        </>
    }

    let new_item = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('recordPhId', currentRecord.id);
        if (form.name) formData.set('name', form.name);
        if (form.surname) formData.set('surname', form.surname);
        if (form.role) formData.set('role', form.role);
        if (form.registration) formData.set('registration', form.registration);
        if (form.date) formData.set('date', form.date);
        if (form.type) formData.set('type', form.type);
        if (form.check) formData.set('check', form.check);
        if (form.context) formData.set('context', form.context);

        await execute(RECORD_PH_SERVICE.create_profesional(formData), {
            operationName: 'crear profesional',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setForm({ ...INITIAL_FORM });
            },
        });
    }

    let delete_item = async (id) => {
        const confirmed = await swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" });
        if (!confirmed.isConfirmed) return;

        await execute(RECORD_PH_SERVICE.delete_profesional(id), {
            operationName: 'eliminar profesional',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setEdit(false);
            },
        });
    }

    let edit_item = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (editForm.name) formData.set('name', editForm.name);
        if (editForm.surname) formData.set('surname', editForm.surname);
        if (editForm.role) formData.set('role', editForm.role);
        if (editForm.registration) formData.set('registration', editForm.registration);
        if (editForm.date) formData.set('date', editForm.date);
        if (editForm.type) formData.set('type', editForm.type);
        if (editForm.check) formData.set('check', editForm.check);
        if (editForm.context) formData.set('context', editForm.context);

        await execute(RECORD_PH_SERVICE.update_profesional(edit.id, formData), {
            operationName: 'actualizar profesional',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setEditForm({ ...INITIAL_FORM });
                setEdit(false);
            },
        });
    }

    return (
        <div className="record_law_gen_11 container my-2">
            <label className="app-p lead fw-bold">PROFESIONALES</label>

            <div className="form-check ms-5">
                <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                <label className="form-check-label" htmlFor="flexCheckDefault">
                    Nuevo Profesional
                </label>
            </div>
            {isNew
                ? <>
                    <form id="form_ph_profesional_new" onSubmit={new_item}>
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
                    <form id="form_ph_profesional_edit" onSubmit={edit_item}>
                        <h3 className="my-3 text-center">Actualizar Profesional</h3>
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

export default RECORD_PH_PROFESIONAL;
