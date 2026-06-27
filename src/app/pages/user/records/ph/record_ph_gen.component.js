import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/icon';
import { Button } from '@/components/ui/button';
import VIZUALIZER from '../../../../components/vizualizer.component';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import usePHSave from './hooks/usePHSave';

function RECORD_PH_GEN(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord } = props;
    const { execute, isSaving } = usePHSave({ swaMsg });

    const [form, setForm] = useState(Array(15).fill(''));
    const [dutyEnabled, setDutyEnabled] = useState(false);
    const lastReviewGenRef = useRef(null);

    useEffect(() => {
        const reviewGen = currentRecord?.review_gen ?? null;
        if (reviewGen === lastReviewGenRef.current) return;
        lastReviewGenRef.current = reviewGen;

        let _LIST = Array(15).fill('');
        if (reviewGen) {
            const parts = reviewGen.split(';');
            for (let i = 0; i < parts.length && i < 15; i++) {
                _LIST[i] = parts[i];
            }
        }
        setForm(_LIST);
        setDutyEnabled(_LIST[10] === 'SI');
    }, [currentRecord?.review_gen]);

    let _GET_CHILD_51 = () => {
        var _CHILD = currentItem.fun_51s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CHILD_6 = () => {
        var _CHILD = currentItem.fun_6s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _FIND_6 = (_ID) => {
        let _LIST = _GET_CHILD_6();
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].id == _ID) {
                return _LIST[i];
            }
        }
        return [];
    }
    let _CHILD_6_SELECT = () => {
        let _LIST = _GET_CHILD_6();
        let _COMPONENT = [];
        for (var i = 0; i < _LIST.length; i++) {
            _COMPONENT.push(<option key={_LIST[i].id} value={_LIST[i].id}>{_LIST[i].description}</option>)
        }
        return <>{_COMPONENT}</>
    }

    const handleChange = useCallback((index) => (e) => {
        const value = e.target.value;
        setForm((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
        if (index === 10) {
            setDutyEnabled(value === 'SI');
        }
    }, []);

    const handleRadio = useCallback((index, value) => () => {
        setForm((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    }, []);

    let manage_item = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('review_gen', form.join(';'));
        await execute(RECORD_PH_SERVICE.update(currentRecord.id, formData), {
            operationName: 'guardar revisión general PH',
            success: true,
            error: true,
            onSuccess: () => requestUpdateRecord(currentItem.id),
        });
    }

    let _COMPONENT_0 = () => {
        var _CHILDREN = _GET_CHILD_51()
        var _COMPONENT = []

        for (var i = 0; i < _CHILDREN.length; i++) {
            if (_CHILDREN[i].role) {
                if ((_CHILDREN[i].role).includes('PROPIETARIO')) _COMPONENT.push(
                    <div className="row border p-2 ms-2" key={i}>
                        <div className="col-3">
                            <label>{_CHILDREN[i].name} {_CHILDREN[i].surname}</label>
                        </div>
                        <div className="col-3">
                            <label>C.C {_CHILDREN[i].id_number}</label>
                        </div>
                        <div className="col-3">
                            <label>Email: {_CHILDREN[i].email}</label>
                        </div>
                        <div className="col-3">
                            <label>Teléfono: {_CHILDREN[i].nunber}</label>
                        </div>
                    </div>
                )
            }
        }
        return <>{_COMPONENT}</>
    }

    let _COMPONENT_1 = () => {
        return <>
            <div className="row border p-2 ms-2">
                <div className="col-4">
                    <label>LICENCIA DE CONSTRUCCIÓN</label>
                </div>
                <div className="col-2">
                    <div className="form-check ms-5">
                        <input className="form-check-input" type="radio" name="review_rb" value="1"
                            checked={form[14] === '1'} onChange={handleRadio(14, '1')} />
                    </div>
                </div>
                <div className="col-3">
                    <label>Número:</label>
                </div>
                <div className="col-3">
                    <input type="text" className="form-control" value={form[1]} onChange={handleChange(1)} />
                </div>
            </div>
            <div className="row border p-2 ms-2">
                <div className="col-4">
                    <label>LICENCIA DE PARCELACION</label>
                </div>
                <div className="col-2">
                    <div className="form-check ms-5">
                        <input className="form-check-input" type="radio" name="review_rb" value="2"
                            checked={form[14] === '2'} onChange={handleRadio(14, '2')} />
                    </div>
                </div>
                <div className="col-3">
                    <label>Expedida:</label>
                </div>
                <div className="col-3">
                    <input type="date" max="2100-01-01" className="form-control" value={form[2]} onChange={handleChange(2)} />
                </div>
            </div>
            <div className="row border p-2 ms-2">
                <div className="col-4">
                    <label>LICENCIA DE URBANISMO</label>
                </div>
                <div className="col-2">
                    <div className="form-check ms-5">
                        <input className="form-check-input" type="radio" name="review_rb" value="3"
                            checked={form[14] === '3'} onChange={handleRadio(14, '3')} />
                    </div>
                </div>
                <div className="col-3">
                    <label>Vigente:</label>
                </div>
                <div className="col-3">
                    <select className='form-select' value={form[3]} onChange={handleChange(3)}>
                        <option className="text-warning">SI</option>
                        <option className="text-danger">NO</option>
                    </select>
                </div>
            </div>
            <div className="row border p-2 ms-2">
                <div className="col-4">
                    <label>ACTO DE RECONOCIMIENTO</label>
                </div>
                <div className="col-2">
                    <div className="form-check ms-5">
                        <input className="form-check-input" type="radio" name="review_rb" value="4"
                            checked={form[14] === '4'} onChange={handleRadio(14, '4')} />
                    </div>
                </div>
                <div className="col-3">
                    <label>Declaración de obra terminada:</label>
                </div>
                <div className="col-3">
                    <select className='form-select' value={form[4]} onChange={handleChange(4)}>
                        <option value="2" className="text-warning">NO APLICA</option>
                        <option value="0" className="text-danger">NO APORTA</option>
                        <option value="1" className="text-success">APORTA</option>
                    </select>
                </div>
            </div>
            <div className="row border p-2 ms-2">
                <div className="col-6">

                </div>
                <div className="col-2">
                    <label>Documento:</label>
                </div>
                <div className="col-1">
                    {form[5] > 0
                        ?
                        <VIZUALIZER url={_FIND_6(form[5]).path + "/" + _FIND_6(form[5]).filename}
                            apipath={'/files/'} />
                        : ""}
                </div>
                <div className="col-3">
                    <select className='form-select' value={form[5]} onChange={handleChange(5)}>
                        <option value="-1">APORTADO FÍSICAMENTE</option>
                        <option value="0">SIN DOCUMENTO</option>
                        {_CHILD_6_SELECT()}
                    </select>
                </div>

            </div>
        </>
    }
    let _COMPONENT_2 = () => {
        return <>
            <div className="row">
                <div className="col-6">
                    <div className="row border p-1 ms-2">
                        <div className="col-6">
                            <label>Área Total Construida (m2)</label>
                        </div>
                        <div className="col-6">
                            <input type="number" min="0" step="0.01" className="form-control" value={form[6]} onChange={handleChange(6)} />
                        </div>
                    </div>
                    <div className="row border p-2 ms-2">
                        <div className="col-6">
                            <label>Destinación:</label>
                        </div>
                        <div className="col-6">
                            <input type="text" className="form-control" value={form[7]} onChange={handleChange(7)} />
                        </div>
                    </div>
                    <div className="row border p-2 ms-2">
                        <div className="col-6">
                            <label>Uso del Suelo</label>
                        </div>
                        <div className="col-6">
                            <select className="form-select" value={form[8]} onChange={handleChange(8)}>
                                <option>R1 - Residencial neta</option>
                                <option>R2 - Residencial 2 sin eje comercial</option>
                                <option>R2 - Residencial con comercio y servicio localizado</option>
                                <option>R3 - Residencial mixta - vivienda, comercio y servicio</option>
                                <option>R4 - Residencial con actividad económica</option>
                                <option>C1 - Comercial y de servicios empresariales</option>
                                <option>C2 - Comercial y de servicios livianos o al por mayor</option>
                                <option>C3 - Comercial y de servicios pesados</option>
                                <option>CE - Comercial de eje en Area de Actividades R-2</option>
                                <option>D - Dotacional</option>
                                <option>D - Dotacional Recreativo</option>
                                <option>I - Industria</option>
                                <option>M1 - Multiple centralidad</option>
                                <option>M2 - Multiple grandes establecimientos</option>
                            </select>
                        </div>
                    </div>
                    <div className="row border p-2 ms-2">
                        <div className="col-6">
                            <label>Tratamiento:</label>
                        </div>
                        <div className="col-6">
                            <select className="form-select" value={form[9]} onChange={handleChange(9)}>
                                <option>TD - Desarrollo</option>
                                <option>TC-1 - Consolidacion Urbana</option>
                                <option>TC-2 - Consolidacion con generacion de espacio publico</option>
                                <option>TRD - Redesarrollo</option>
                                <option>TRA-1 - Reactivacion</option>
                                <option>TRA-2 - Reactivacion</option>
                                <option>TRA-3 - Reactivacion de sector urbano especial</option>
                                <option>TMI-1 - Complementario</option>
                                <option>TMI-2 - Reordenamiento</option>
                                <option>TCoU - Para inmuebles de interes cultural del grupo urbano</option>
                                <option>TCoA-1 - Para inmuebles de interes cultural del grupo arquitectonico agrupacion</option>
                                <option>TCoA-2 - Para inmuebles de interes cultural del grupo arquitectonico individual</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="col-6">
                    <div className="row border p-1 ms-2">
                        <div className="col-12">
                            <label>El suelo de deberes Urbanísticos acorde con el Articulo 192 del POT Acero 011 de 2014</label>
                        </div>
                    </div>
                    <div className="row border p-2 ms-2">
                        <div className="col-6">
                            <label>Licencia señala deber:</label>
                        </div>
                        <div className="col-6">
                            <select className='form-select' value={form[10]} onChange={handleChange(10)}>
                                <option className="text-success">SI</option>
                                <option className="text-danger">NO</option>
                            </select>
                        </div>
                    </div>
                    <div className="row border p-1 ms-2">
                        <div className="col-6">
                            <label>Valor (COP):</label>
                        </div>
                        <div className="col-6">
                            <input type="number" min="0" step="0.01" className="form-control"
                                disabled={!dutyEnabled} value={form[11]} onChange={handleChange(11)} />
                        </div>
                    </div>
                    <div className="row border p-2 ms-2">
                        <div className="col-6">
                            <label>Recibo de pago numero:</label>
                        </div>
                        <div className="col-6">
                            <input type="text" className="form-control"
                                disabled={!dutyEnabled} value={form[12]} onChange={handleChange(12)} />
                        </div>
                    </div>
                    <div className="row border p-2 ms-2">
                        <div className="col-4">
                            <label>Documento:</label>
                        </div>
                        <div className="col-2">
                            {form[13] > 0
                                ?
                                <VIZUALIZER url={_FIND_6(form[13]).path + "/" + _FIND_6(form[13]).filename}
                                    apipath={'/files/'} />
                                : ""}
                        </div>
                        <div className="col-6">
                            <select className='form-select' value={form[13]} onChange={handleChange(13)}>
                                <option value="-1">APORTADO FÍSICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>

                    </div>
                </div>
            </div>

        </>
    }

    return (
        <div className="record_ph_gen container">
            <form onSubmit={manage_item}>
                <div className="row">
                    <label className="app-p lead fw-bold my-2">AREA Y LINDEROS DE PREDIO(S)</label>
                    <input type="text" className="form-control" value={form[0]} onChange={handleChange(0)} />
                    <label className="app-p lead fw-bold my-2">PROPIETARIOS</label>
                    {_COMPONENT_0()}
                    <label className="app-p lead fw-bold my-2">ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL</label>
                    {_COMPONENT_1()}
                    <label className="app-p lead fw-bold my-2">DATOS GENERALES DE LA LICENCIA</label>
                    {_COMPONENT_2()}
                    <div className="row mb-3 text-center">
                        <div className="col-12">
                            <Button size="sm" className="my-3" disabled={isSaving}>
                                <Icon name="file-alt" size={16} /> GUARDAR CAMBIOS
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div >
    );
}

export default RECORD_PH_GEN;
