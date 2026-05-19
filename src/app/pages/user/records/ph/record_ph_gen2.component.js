import { useState } from 'react';
import Icon from '@/components/icon';
import { Button } from '@/components/ui/button';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import usePHSave from './hooks/usePHSave';

export default function RECORD_PH_GEN_2(props) {
    const { swaMsg, currentItem, currentRecord } = props;
    const { isSaving, execute } = usePHSave({ swaMsg });

    let _GET_CHILD_REVIEW_GEN = () => {
        var _CHILD = currentRecord.review_check;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD.split(';');
        }
        return _LIST;
    }

    let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
        if (!_VALUE) {
            return 'form-select text-danger';
        }
        if (_VALUE === '0') {
            return 'form-select text-danger';
        }
        if (_VALUE === '1') {
            return 'form-select text-success';
        }
        if (_VALUE === '2') {
            return 'form-select text-warning';
        } else {
            return 'form-select';
        }
    }

    const initialChecks = _GET_CHILD_REVIEW_GEN();
    const [checks, setChecks] = useState(() => {
        const arr = [...initialChecks];
        while (arr.length < 9) arr.push('');
        return arr;
    });
    const [detail, setDetail] = useState(currentRecord.detail || '');

    const handleCheckChange = (index, value) => {
        const newChecks = [...checks];
        newChecks[index] = value;
        setChecks(newChecks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (detail) formData.set('detail', detail);

        const review_check = ['0'];
        for (let i = 1; i <= 8; i++) {
            review_check.push(checks[i] || '');
        }
        formData.set('review_check', review_check.join(';'));

        const result = await execute(RECORD_PH_SERVICE.update(currentRecord.id, formData), {
            operationName: 'guardar observaciones planimétricas',
        });
        if (result.ok) {
            props.requestUpdateRecord(currentItem.id);
        }
    }

    let _COMPONENT_3 = () => {
        return <>
            <div className="row border rounded-2 p-2 mx-0 mb-2 align-items-start">
                <div className="col-12 col-lg-6">
                    <p className="mb-0">01. Los PLANOS para visto bueno concuerdan con los planos aprobados en la licencia urbanística.</p>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="row mb-1">
                        <div className="col-8">
                            <label htmlFor="ph-gen2-check-area">Área construida</label>
                        </div>
                        <div className="col-4">
                            <select id="ph-gen2-check-area" className={_GET_SELECT_COLOR_VALUE(checks[1])} value={checks[1]} onChange={(e) => handleCheckChange(1, e.target.value)}>
                                <option value="1" className="text-warning">SI</option>
                                <option value="0" className="text-danger">NO</option>
                            </select>
                        </div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-8">
                            <label htmlFor="ph-gen2-check-private-units">Unidades Privada</label>
                        </div>
                        <div className="col-4">
                            <select id="ph-gen2-check-private-units" className={_GET_SELECT_COLOR_VALUE(checks[2])} value={checks[2]} onChange={(e) => handleCheckChange(2, e.target.value)}>
                                <option value="1" className="text-warning">SI</option>
                                <option value="0" className="text-danger">NO</option>
                            </select>
                        </div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-8">
                            <label htmlFor="ph-gen2-check-common-spaces">Espacios Comunes</label>
                        </div>
                        <div className="col-4">
                            <select id="ph-gen2-check-common-spaces" className={_GET_SELECT_COLOR_VALUE(checks[3])} value={checks[3]} onChange={(e) => handleCheckChange(3, e.target.value)}>
                                <option value="1" className="text-warning">SI</option>
                                <option value="0" className="text-danger">NO</option>
                            </select>
                        </div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-8">
                            <label htmlFor="ph-gen2-check-lot-area">Área del Predio</label>
                        </div>
                        <div className="col-4">
                            <select id="ph-gen2-check-lot-area" className={_GET_SELECT_COLOR_VALUE(checks[4])} value={checks[4]} onChange={(e) => handleCheckChange(4, e.target.value)}>
                                <option value="1" className="text-warning">SI</option>
                                <option value="0" className="text-danger">NO</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row border rounded-2 p-2 mx-0 mb-2 align-items-start">
                <div className="col-12 col-lg-6">
                    <p className="mb-0">02. Los PLANOS para visto bueno presentados identifican con claridad los tipos de bienes: Privados y Comunes</p>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="row mb-1">
                        <div className="col-8">
                            <label htmlFor="ph-gen2-check-colors">Diferenciados con color/áreas</label>
                        </div>
                        <div className="col-4">
                            <select id="ph-gen2-check-colors" className={_GET_SELECT_COLOR_VALUE(checks[5])} value={checks[5]} onChange={(e) => handleCheckChange(5, e.target.value)}>
                                <option value="1" className="text-warning">SI</option>
                                <option value="0" className="text-danger">NO</option>
                            </select>
                        </div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-8">
                            <label htmlFor="ph-gen2-check-boundaries">Presentan alinderamiento</label>
                        </div>
                        <div className="col-4">
                            <select id="ph-gen2-check-boundaries" className={_GET_SELECT_COLOR_VALUE(checks[6])} value={checks[6]} onChange={(e) => handleCheckChange(6, e.target.value)}>
                                <option value="1" className="text-warning">SI</option>
                                <option value="0" className="text-danger">NO</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row border rounded-2 p-2 mx-0 mb-2 align-items-start">
                <div className="col-12 col-lg-6">
                    <p className="mb-0">03. La suma de los bienes privados y comunes coincide con el área total construida por:</p>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="row mb-1">
                        <div className="col-8">
                            <label htmlFor="ph-gen2-check-by-floor">Piso por piso</label>
                        </div>
                        <div className="col-4">
                            <select id="ph-gen2-check-by-floor" className={_GET_SELECT_COLOR_VALUE(checks[7])} value={checks[7]} onChange={(e) => handleCheckChange(7, e.target.value)}>
                                <option value="1" className="text-warning">SI</option>
                                <option value="0" className="text-danger">NO</option>
                            </select>
                        </div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-8">
                            <label htmlFor="ph-gen2-check-total-build">Total construida</label>
                        </div>
                        <div className="col-4">
                            <select id="ph-gen2-check-total-build" className={_GET_SELECT_COLOR_VALUE(checks[8])} value={checks[8]} onChange={(e) => handleCheckChange(8, e.target.value)}>
                                <option value="1" className="text-warning">SI</option>
                                <option value="0" className="text-danger">NO</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </>
    }

    let _COMPONENT_DETAILS_1 = () => {
        return <div className="row py-2">
            <div className="col-12">
                <label htmlFor="ph-gen2-detail">Descripción del Proyecto, separe cada punto con (solo) un salto de linea. (Máximo 2000 caracteres)</label>
                <textarea id="ph-gen2-detail" className="form-control" maxLength="2000" rows="4"
                    value={detail} onChange={(e) => setDetail(e.target.value)}></textarea>
            </div>
        </div>
    }

    return (
        <div className="record_ph_gen container-lg my-3 px-3">
            <form id="form_manage_ph_gen_2" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="app-p lead fw-bold my-2">OBSERVACIONES A LA INFORMACIÓN PLANIMÉTRICA</div>
                    {_COMPONENT_3()}
                    {_COMPONENT_DETAILS_1()}
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
