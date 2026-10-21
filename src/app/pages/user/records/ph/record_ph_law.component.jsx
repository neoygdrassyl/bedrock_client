
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/data-table-bridge';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import { Icon } from '@/components/icon';
import { swalConfirm } from '@/app/utils/swalAdapter';
import usePHSave from './hooks/usePHSave';
import ObservationPanel from '../../../../components/ObservationPanel';

const INITIAL_FORM = { type: '', check: '', context: '' };

function RECORD_PH_LAW({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [editForm, setEditForm] = useState({ ...INITIAL_FORM });
    const { execute, isSaving } = usePHSave({ swaMsg });

    useEffect(() => {
        if (edit !== false) {
            setEditForm({
                type: edit.type ?? '',
                check: edit.check ?? '',
                context: edit.context ?? '',
            });
        }
    }, [edit]);

    let _GET_CHILD_LAWS = () => {
        var _CHILD = currentRecord.record_ph_laws;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    let _CHILD_LICENCE_LIST = () => {
        let _LIST = _GET_CHILD_LAWS();
        const columns = [
            {
                name: 'NORMA / DOCUMENTO',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.type}</span>
            },
            {
                name: 'CUMPLE',
                selector: row => row.check,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{row.check}</span>
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
                <div className="col-6">
                    <label>Norma / Documento</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="file-alt" size={16} />
                        </span>
                        <input type="text" className="form-control" id={"r_ph_l_1" + suffix} value={data.type} onChange={handleChange('type')} />
                    </div>
                </div>
                <div className="col">
                    <label>Cumple</label>
                    <div className="input-group my-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="check-circle" size={16} />
                        </span>
                        <select className="form-select" id={"r_ph_l_2" + suffix} value={data.check} onChange={handleChange('check')}>
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
                    <ObservationPanel
                        title="Observaciones / Recomendaciones"
                        className="my-1"
                        textareaProps={{
                            className: 'form-control',
                            id: "r_ph_l_3" + suffix,
                            rows: '3',
                            value: data.context,
                            onChange: handleChange('context'),
                        }}
                    />
                </div>
            </div>
        </>
    }

    let new_item = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('recordPhId', currentRecord.id);
        if (form.type) formData.set('type', form.type);
        if (form.check) formData.set('check', form.check);
        if (form.context) formData.set('context', form.context);

        await execute(RECORD_PH_SERVICE.create_law(formData), {
            operationName: 'crear norma',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setForm({ ...INITIAL_FORM });
            },
        });
    }

    let delete_item = async (id) => {
        const confirmed = await swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" });
        if (!confirmed.isConfirmed) return;

        await execute(RECORD_PH_SERVICE.delete_law(id), {
            operationName: 'eliminar norma',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setEdit(false);
            },
        });
    }

    let edit_item = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (editForm.type) formData.set('type', editForm.type);
        if (editForm.check) formData.set('check', editForm.check);
        if (editForm.context) formData.set('context', editForm.context);

        await execute(RECORD_PH_SERVICE.update_law(edit.id, formData), {
            operationName: 'actualizar norma',
            onSuccess: () => {
                requestUpdateRecord(currentItem.id);
                setEditForm({ ...INITIAL_FORM });
                setEdit(false);
            },
        });
    }

    return (
        <div className="record_law_gen_11 container my-2">
            <label className="app-p lead fw-bold">NORMAS Y DOCUMENTOS</label>

            <div className="form-check ms-5">
                <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                <label className="form-check-label" htmlFor="flexCheckDefault">
                    Nueva Norma / Documento
                </label>
            </div>
            {isNew
                ? <>
                    <form id="form_ph_law_new" onSubmit={new_item}>
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
                    <form id="form_ph_law_edit" onSubmit={edit_item}>
                        <h3 className="my-3 text-center">Actualizar Norma / Documento</h3>
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

export default RECORD_PH_LAW;
