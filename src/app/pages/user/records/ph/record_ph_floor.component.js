
import { useState, useEffect } from 'react';
import DataTable from '@/components/data-table-bridge';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import { Icon } from '@/components/icon';

const MySwal = withReactContent(Swal);

function RECORD_PH_FLOOR({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);
    const [divisions, setDivisions] = useState(1);
    const [divisionsEdit, setDivisionsEdit] = useState(1);
    const [fixed, setFixed] = useState(false);
    const [fixedEdit, setFixedEdit] = useState(false);

    useEffect(() => {
        if (edit !== false) {
            var _ITEM = edit;

            document.getElementById("r_ph_fl_1_edit").value = _ITEM.floor;
            let common = [];
            if (_ITEM.common) common = (_ITEM.common).split(';');

            let fixedVal = _ITEM.fixed ? (_ITEM.fixed).split(';') : [];

            const cb = document.getElementById("cb_fixed_edit");
            const lastValue = cb.checked;
            if (fixedVal[0] == '&&') cb.checked = true;
            else cb.checked = false;
            const event = new Event("input", { fixed_edit: true });
            const tracker = cb._valueTracker;
            if (tracker) {
                tracker.setValue(lastValue);
            }
            cb.dispatchEvent(event);

            document.getElementById("r_ph_fl_1_edit").value = _ITEM.floor;

            document.getElementById("r_ph_floor_fixed_3_edit").value = fixedVal[1] ?? "";
            document.getElementById("r_ph_floor_fixed_4_edit").value = fixedVal[2] ?? "";
            document.getElementById("r_ph_floor_fixed_5_edit").value = fixedVal[3] ?? "";
            document.getElementById("r_ph_floor_fixed_6_edit").value = fixedVal[4] ?? "";

            let inputs = document.getElementsByName("r_ph_fl_common_edit");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].value = common[i];
            }

            if (_ITEM.division) {
                let _division = _ITEM.division ? _ITEM.division.split(';') : [];
                let _division_build = _ITEM.division_build ? _ITEM.division_build.split(';') : [];
                let _division_free = _ITEM.division_free ? _ITEM.division_free.split(';') : [];
                let division_inputs = document.getElementsByName('r_ph_floor_division_edit')
                let division_common_inputs = document.getElementsByName('r_ph_floor_division_common_edit')
                let division_free_inputs = document.getElementsByName('r_ph_floor_division_free_edit')
                if (division_inputs) {
                    for (var i = 0; i < division_inputs.length; i++) {
                        division_inputs[i].value = _division[i] ? _division[i] : ""
                    }
                }
                if (division_common_inputs) {
                    for (var i = 0; i < division_common_inputs.length; i++) {
                        division_common_inputs[i].value = _division_build[i]
                    }
                }
                if (division_free_inputs) {
                    for (var i = 0; i < division_free_inputs.length; i++) {
                        division_free_inputs[i].value = _division_free[i]
                    }

                }
            }

        }
    }, [edit]);
        const rowSelectedStyle = [
            {
                when: row => row.fixed != null && row.fixed.includes('&&'),
                style: {
                    backgroundColor: 'BlanchedAlmond',
                },
            },
        ];
        // DATA GETTERS
        let _GET_CHILD_FLOOR = () => {
            var _CHILD = currentRecord.record_ph_floors;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        // DATA CONVERTERS
        let _GET_TOTAL = () => {
            let _LIST = _GET_CHILD_FLOOR();
            var _TOTALES = {
                common_total: 0,

                common_build: 0,
                common_free: 0,
                exclusive_build: 0,
                exclusive_free: 0,

                private_build: 0,
                private_free: 0,

                private_total: 0,

                total: 0,
            }
            for (var i = 0; i < _LIST.length; i++) {
                var _common = _LIST[i].common.split(';');
                if (_common[0] == '&&') {
                    _TOTALES.common_total += Number(_common[1]);
                } else {
                    _TOTALES.common_build += (!isNaN(_common[0]) ? Number(_common[0]) : 0);
                    _TOTALES.common_free += (!isNaN(_common[1]) ? Number(_common[1]) : 0);
                    _TOTALES.exclusive_build += (!isNaN(_common[2]) ? Number(_common[2]) : 0);
                    _TOTALES.exclusive_free += (!isNaN(_common[3]) ? Number(_common[3]) : 0);
                    _TOTALES.common_total += (!isNaN(_common[0]) ? Number(_common[0]) : 0) + (!isNaN(_common[2]) ? Number(_common[2]) : 0);
                }
                var _division_build = []
                if (_LIST[i].division_build) _division_build = _LIST[i].division_build.split(';');
                var _division_free = []
                if (_LIST[i].division_free) _division_free = _LIST[i].division_free.split(';');
                for (var j = 0; j < _division_build.length; j++) {
                    _TOTALES.private_build += Number(_division_build[j] ?? 0)
                    _TOTALES.private_free += Number(_division_free[j] ?? 0)
                    _TOTALES.private_total += Number(_division_build[j] ?? 0) + Number(_division_free[j] ?? 0)
                }
            }
            _TOTALES.total = _TOTALES.common_build + _TOTALES.exclusive_build + _TOTALES.private_build;

            return _TOTALES;
        }
        let _DISPLAY_DIVISION = (item) => {
            if (!item) return ""
            var _item = item.split(';')
            var _COMPONENT = []
            for (var i = 0; i < _item.length; i++) {
                _COMPONENT.push(<li className="list-group-item mx-0 p-1">
                    {_item[i] ? _item[i] : "-"}
                </li>)
            }
            return <>{_COMPONENT}</>
        }
        let _DISPLAY_DIVISION_TOTAL = (row) => {
            if (!row) return ""
            var _build = [];
            if (row.division_build) _build = row.division_build.split(";")
            var _free = [];
            if (row.division_free) _free = row.division_free.split(";")

            var _COMPONENT = []
            for (var i = 0; i < _build.length; i++) {
                _COMPONENT.push(<li className="list-group-item text-secondary mx-0 p-1">
                    {(Number(_build[i] ?? 0) + Number(_free[i]  ?? 0)).toFixed(2)}
                </li>)
            }
            return <>{_COMPONENT}</>
        }
        let _DISPLAY_SUB_TOTAL = (row) => {
            if (!row) return ""
            var _sub_total = 0;
            var _build = [];
            if (row.common.split(';')[0] == '&&') {
                return Number((row.common).split(';')[1]).toFixed(2);
            } else {
                if (row.division_build) _build = row.division_build.split(";")

                for (var i = 0; i < _build.length; i++) {
                    _sub_total += Number(_build[i])
                }

                _sub_total += Number((row.common).split(';')[2]) + Number((row.common).split(';')[0])
                return (_sub_total).toFixed(2);
            }

        }
        let _SET_EDIT = (row) => {
            setEdit(row)
            if (row.division) setDivisionsEdit(row.division.split(';').length)
            else setDivisionsEdit(1)
            console.log(divisionsEdit)
        }
        // COMPONENT JSX
        let _CHILD_LICENCE_LIST = () => {
            let _LIST = _GET_CHILD_FLOOR();
            const columns = [
                {
                    name: 'Piso',
                    selector: row => row.floor,
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{row.floor}</span>
                },
                {
                    name: 'División',
                    center: true,
                    compact: true,
                    cell: row => <ul className="list-group list-group-flush">{_DISPLAY_DIVISION(row.division)}</ul>
                },
                {
                    name: 'Área Privada Construida',
                    center: true,
                    compact: true,
                    cell: row => <ul className="list-group list-group-flush">{_DISPLAY_DIVISION(row.division_build)}</ul>
                },
                {
                    name: 'Área Privada Libre',
                    center: true,
                    compact: true,
                    cell: row => <ul className="list-group list-group-flush">{_DISPLAY_DIVISION(row.division_free)}</ul>
                },
                {
                    name: 'Área Total Privada',
                    center: true,
                    cell: row => <ul className="list-group list-group-flush">{_DISPLAY_DIVISION_TOTAL(row)}</ul>
                },
                {
                    name: 'Área Común Construida',
                    selector: row => (row.common).split(";")[0],
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{(row.common).split(';')[0]}</span>
                },
                {
                    name: 'Área Común Libre',
                    selector: row => (row.common).split(";")[1],
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{(row.common).split(';')[1]}</span>
                },
                {
                    name: 'Área Exclusiva Construida',
                    selector: row => (row.common).split(";")[2],
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{(row.common).split(';')[2]}</span>
                },
                {
                    name: 'Área Exclusiva Libre',
                    selector: row => (row.common).split(";")[3],
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{(row.common).split(';')[3]}</span>
                },
                {
                    name: 'Total Común Construida',
                    selector: row => (Number((row.common).split(';')[2]) + Number((row.common).split(';')[0])).toFixed(2),
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label className="fw-bold text-secondary">{(Number((row.common).split(';')[2]) + Number((row.common).split(';')[0])).toFixed(2) }</label>
                },
                {
                    name: 'Area Total Visto Bueno',
                    selector: row => _DISPLAY_SUB_TOTAL(row),
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label className="fw-bold text-danger">{_DISPLAY_SUB_TOTAL(row)}</label>
                },
                {
                    name: 'ACCION',
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <span title="Modificar Item"><button type="button" className="btn btn-secondary m-0 p-2 shadow-none" onClick={() => _SET_EDIT(row)}><Icon name="edit" size={16} /></button></span>
                        <span title="Eliminar Item"><button type="button" className="btn btn-danger m-0 p-2 shadow-none" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></button></span>
                    </>
                },
            ]
            return <DataTable
                conditionalRowStyles={rowSelectedStyle}
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }
        let _COMPONENT_MANAGE = (editSuffix = "") => {
            var counter = editSuffix ? divisionsEdit : divisions;

            return <>
                <div className="row mb-1">
                    <div className="col-3">
                        <label>Piso</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="hashtag" size={16} />
                            </span>
                            <input type="text" className="form-control" id={"r_ph_fl_1" + editSuffix} required />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-8 border border-info p-2">
                        <label className="fw-bold">Unidades</label>
                        {PH_DIVISIONS(editSuffix, counter, editSuffix ? edit : null)}
                    </div>
                    <div className="col-4 text-end">
                        {editSuffix ?
                            <>
                                {divisionsEdit > 1
                                    ? <>
                                        <button type="button" className="btn btn-sm btn-secondary mx-3" onClick={() => editSuffix ? setDivisionsEdit(divisionsEdit - 1) : setDivisions(divisions - 1)}><Icon name="minus-circle" size={16} /> REMOVER ULTIMO </button>
                                    </>
                                    : ""}
                            </>

                            : <>
                                {divisions > 1
                                    ? <>
                                        <button type="button" className="btn btn-sm btn-secondary mx-3" onClick={() => editSuffix ? setDivisionsEdit(divisionsEdit - 1) : setDivisions(divisions - 1)}><Icon name="minus-circle" size={16} /> REMOVER ULTIMO </button>
                                    </>
                                    : ""}
                            </>}

                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => editSuffix ? setDivisionsEdit(divisionsEdit + 1) : setDivisions(divisions + 1)}><Icon name="plus-circle" size={16} /> AÑADIR </button>
                    </div>
                </div>

                <div className="row ">
                    <label className="fw-bold">Área Común</label>
                    <div className="col-6 border border-info p-2">
                        <label className="fw-bold">Área de uso Común</label>
                        <div className="row ">
                            <div className="col">
                                <label>Construida</label>
                                <div className="input-group my-1">
                                    <input type="number" min="0" step="0.01" className="form-control" name={"r_ph_fl_common" + editSuffix} />
                                </div>
                            </div>
                            <div className="col">
                                <label>Libre</label>
                                <div className="input-group my-1">
                                    <input type="number" min="0" step="0.01" className="form-control" name={"r_ph_fl_common" + editSuffix} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 border border-info p-2">
                        <label className="fw-bold">Área de uso Exclusivo</label>
                        <div className="row ">
                            <div className="col">
                                <label>Construida</label>
                                <div className="input-group my-1">
                                    <input type="number" min="0" step="0.01" className="form-control" name={"r_ph_fl_common" + editSuffix} />
                                </div>
                            </div>
                            <div className="col">
                                <label>Libre</label>
                                <div className="input-group my-1">
                                    <input type="number" min="0" step="0.01" className="form-control" name={"r_ph_fl_common" + editSuffix} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-check ms-5 my-3">
                    {editSuffix ?
                        <input className="form-check-input" type="checkbox" id="cb_fixed_edit" onChange={(e) => setFixedEdit(e.target.checked)} />
                        : <input className="form-check-input" type="checkbox" onChange={(e) => setFixed(e.target.checked)} />}
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Área no modificable
                    </label>
                </div>
                {PH_FIXED_AREA(editSuffix)}

            </>
        }
        let _COMPONENT_TOTAL = () => {

            let _LIST = _GET_TOTAL();
            return <>
                <div className="row border border-dark mx-2 py-2">
                    <div className="col-12  text-center">
                        <label className="fw-bold">Totales:</label>
                    </div>
                </div>
                <div className="row mx-2 text-center">
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Área Privada Construida</label><br />
                        <label className="fw-bold">{(_LIST.private_build).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Área Privada Libre</label><br />
                        <label className="fw-bold">{(_LIST.private_free).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Total Área Privada</label><br />
                        <label className="fw-bold text-secondary">{(_LIST.private_total.toFixed(2))}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Área Común Construida</label><br />
                        <label className="fw-bold">{(_LIST.common_build).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Área Común Libre</label><br />
                        <label className="fw-bold">{(_LIST.common_free).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Área Exclusiva Construida</label><br />
                        <label className="fw-bold">{(_LIST.exclusive_build).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Área Exclusiva Libre</label><br />
                        <label className="fw-bold">{(_LIST.exclusive_free).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Total Común Construida</label><br />
                        <label className="fw-bold text-secondary">{(_LIST.common_total).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Área Total Construida</label><br />
                        <label className="fw-bold text-danger">{(_LIST.total).toFixed(2)}</label>
                    </div>
                </div>
            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let new_item = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('recordPhId', currentRecord.id);

            if (fixed) {
                let fixed = [];

                fixed.push('&&');
                fixed.push(document.getElementById("r_ph_floor_fixed_3").value);
                fixed.push(document.getElementById("r_ph_floor_fixed_4").value);
                fixed.push(document.getElementById("r_ph_floor_fixed_5").value);
                fixed.push(document.getElementById("r_ph_floor_fixed_6").value);
                formData.set('fixed', fixed.join(';'));
            }
            let floor = document.getElementById("r_ph_fl_1").value;
            if (floor) formData.set('floor', floor);

            let items;
            let division = [];
            let division_build = [];
            let division_free = [];

            let common = [];

            items = document.getElementsByName("r_ph_floor_division");
            for (var i = 0; i < items.length; i++) {
                division.push(items[i].value);
            }
            items = document.getElementsByName("r_ph_floor_division_common");
            for (var i = 0; i < items.length; i++) {
                division_build.push(items[i].value);
            }
            items = document.getElementsByName("r_ph_floor_division_free");
            for (var i = 0; i < items.length; i++) {
                division_free.push(items[i].value);
            }

            items = document.getElementsByName("r_ph_fl_common");
            for (var i = 0; i < items.length; i++) {
                common.push(items[i].value);
            }

            formData.set('division', division.join(';'));
            formData.set('division_build', division_build.join(';'));
            formData.set('division_free', division_free.join(';'));

            formData.set('common', common.join(';'));

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.create_floor(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        requestUpdateRecord(currentItem.id);
                        document.getElementById('form_ph_floor_new').reset();
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }
        let delete_item = (id) => {
            MySwal.fire({
                title: "ELIMINAR ESTE ITEM",
                text: "¿Esta seguro de eliminar de forma permanente este item?",
                icon: 'question',
                confirmButtonText: "ELIMINAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    MySwal.fire({
                        title: swaMsg.title_wait,
                        text: swaMsg.text_wait,
                        icon: 'info',
                        showConfirmButton: false,
                    });
                    RECORD_PH_SERVICE.delete_floor(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                requestUpdateRecord(currentItem.id);
                                setEdit(false);
                            } else {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        });
                }
            });
        }
        let edit_item = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('recordPhId', currentRecord.id);

            if (document.getElementById("cb_fixed_edit").checked) {
                let fixed = [];

                fixed.push('&&');
                fixed.push(document.getElementById("r_ph_floor_fixed_3_edit").value);
                fixed.push(document.getElementById("r_ph_floor_fixed_4_edit").value);
                fixed.push(document.getElementById("r_ph_floor_fixed_5_edit").value);
                fixed.push(document.getElementById("r_ph_floor_fixed_6_edit").value);
                formData.set('fixed', fixed.join(';'));
            }else{
                formData.set('fixed', '');
            }
            let floor = document.getElementById("r_ph_fl_1_edit").value;
            if (floor) formData.set('floor', floor);

            let items;
            let division = [];
            let division_build = [];
            let division_free = [];

            let common = [];

            items = document.getElementsByName("r_ph_floor_division_edit");
            for (var i = 0; i < items.length; i++) {
                division.push(items[i].value);
            }
            items = document.getElementsByName("r_ph_floor_division_common_edit");
            for (var i = 0; i < items.length; i++) {
                division_build.push(items[i].value);
            }
            items = document.getElementsByName("r_ph_floor_division_free_edit");
            for (var i = 0; i < items.length; i++) {
                division_free.push(items[i].value);
            }

            items = document.getElementsByName("r_ph_fl_common_edit");
            for (var i = 0; i < items.length; i++) {
                common.push(items[i].value);
            }

            formData.set('division', division.join(';'));
            formData.set('division_build', division_build.join(';'));
            formData.set('division_free', division_free.join(';'));

            formData.set('common', common.join(';'));

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.update_floor(edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        requestUpdateRecord(currentItem.id);
                        document.getElementById('form_ph_floor_edit').reset();
                        setEdit(false);
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }
        return (
            <div className="record_law_gen_11 container my-2">
                <label className="app-p lead fw-bold">AREAS COMUNES Y PRIVADAS</label>

                <div className="form-check ms-5">
                    <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Nuevo Área
                    </label>
                </div>
                {isNew
                    ? <>
                        <form id="form_ph_floor_new" onSubmit={new_item}>
                            {_COMPONENT_MANAGE()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><Icon name="file-alt" size={16} /> AÑADIR ITEM </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
                {_CHILD_LICENCE_LIST()}
                {_COMPONENT_TOTAL()}
                {edit
                    ? <>
                        <form id="form_ph_floor_edit" onSubmit={edit_item}>
                            <h3 className="my-3 text-center">Actualizar Área</h3>
                            {_COMPONENT_MANAGE('_edit')}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><Icon name="file-alt" size={16} /> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
            </div >
        );
}

const PH_DIVISIONS = (edit, LENGTH = 1, object) => {
    var _COMPONEN_DIV = [];
    var counter = 1;
    if (object) {
        if (object.division ?? false) counter = object.division.split(';').length
        if (object.common.split(';')[0] == '&&') counter = 1
    }
    if (LENGTH != counter) counter = LENGTH
    for (var i = 0; i < counter; i++) {
        _COMPONEN_DIV.push(<div className="row">
            <div className="col">
                <label>Unidad {i + 1}</label>
                <div className="input-group my-1">
                    <input type="text" className="form-control" name={"r_ph_floor_division" + edit} />
                </div>
            </div>
            <div className="col">
                <label>Área Priv. Construida</label>
                <div className="input-group my-1">
                    <input type="number" min="0" step="0.01" className="form-control" name={"r_ph_floor_division_common" + edit} />
                </div>
            </div>
            <div className="col">
                <label>Área Priv. Libre</label>
                <div className="input-group my-1">
                    <input type="number" min="0" step="0.01" className="form-control" name={"r_ph_floor_division_free" + edit} />
                </div>
            </div>
        </div>)
    }
    return <>{_COMPONEN_DIV}</>
}

const PH_FIXED_AREA = (edit) => {
    var _COMPONEN_DIV = [];
    _COMPONEN_DIV.push(<div className="border border-info p-2 my-2">
        <div className="row">
            <div className="col">
                <label>Escritura</label>
                <div className="input-group my-1">
                    <input type="text" className="form-control" id={"r_ph_floor_fixed_3" + edit} />
                </div>
            </div>
            <div className="col">
                <label>Fecha</label>
                <div className="input-group my-1">
                    <input type="date" max="2100-01-01" className="form-control" id={"r_ph_floor_fixed_4" + edit} />
                </div>
            </div>
            <div className="col">
                <label>Notaria</label>
                <div className="input-group my-1">
                    <input type="number" min="0" step="1" className="form-control" id={"r_ph_floor_fixed_5" + edit} />
                </div>
            </div>
            <div className="col">
                <label>Ciudad</label>
                <div className="input-group my-1">
                    <input type="text" className="form-control" id={"r_ph_floor_fixed_6" + edit} />
                </div>
            </div>
        </div>
    </div>)

    return <>{_COMPONEN_DIV}</>

}

export default RECORD_PH_FLOOR;