
import { useState } from 'react';
import DataTable from '@/components/data-table-bridge';
import { getJSON_Simple } from '../../../../components/customClasses/typeParse';
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import perfilData from '../../../../components/jsons/perfilesData.json';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

export default function RECORD_ARC_36_TABLE(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    var importCounter = 0;

    const ELEMENTS = ['Sep. Central', 'Carril SITM', 'Calzada', 'Sep. Lateral', 'Paralela', 'Bahia', 'Cicloruta', 'F.A', 'F.C', 'F.R']
    const SIDES = ['Norte', 'Sur', 'Oriente', 'Occidente'];
    const PERFILS = () => {
        let perfils = [];
        for (const key in perfilData) {
            perfils.push(key)
        }
        return perfils;
    }

    var [new36, setNew] = useState(false);
    var [edit36, setEdit] = useState(false);
    var [newRow, setRow] = useState({});
    var [editRow, setRowE] = useState({});

    // ***************************  DATA GETTERS *********************** //
    let _GET_CHILD_36_INFO = () => {
        var _CHILD = currentRecord.record_arc_36_infos;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    // *************************  DATA CONVERTERS ********************** //
    let _GET_EVALUATION = (_NORM, _PROYECT) => {
        var _DIFF = _PROYECT - _NORM;
        if (_DIFF == 0) return "P = N";
        if (_DIFF < 0) return "P <= N";
        if (_DIFF > 0) return "P >= N";
    }
    let _GET_PERFIL_SELECT = () => {
        let _LIST = perfilData;
        let _COMPONENT = [];
        for (var _JSON in _LIST) {
            _COMPONENT.push(<option>{_JSON}</option>)
        }
        return <>{_COMPONENT}</>
    }
    let _SET_IMAGE_LINK = (_VALUE, isEdit) => {
        let _LIST = perfilData;
        let _COMPONENT = isEdit ? document.getElementById("r_a_36_imglink_edit") : document.getElementById("r_a_36_imglink");
        let _BASE_URL = "//www.curaduria1bucaramanga.com/public_docs/OTHERS/PERFILES/"
        _COMPONENT.href = _BASE_URL + _LIST[_VALUE].src;

    }
    let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
        if (_VALUE == 0 || _VALUE == 'NO') {
            return 'form-select text-danger form-select-sm';
        }
        if (_VALUE == 1 || _VALUE == 'SI') {
            return 'form-select text-success form-select-sm';
        }
        if (_VALUE == 2 || _VALUE == 'NA') {
            return 'form-select text-warning form-select-sm';
        }
        return 'form-select form-select-sm';
    }
    // ******************************* JSX ***************************** 
    const columns = [
        {
            name: 'Dirección',
            selector: row => row.parent,
            sortable: true,
            filterable: true,
            center: true,
            compact: true,
            minWidth: '150px',
            cell: row => <span className="text-sm">{row.address}</span>
        },
        {
            name: 'Perfil',
            selector: row => row.parent,
            sortable: true,
            filterable: true,
            center: true,
            compact: true,
            minWidth: '150px',
            cell: row => {
                let grous = row.parent ? row.parent.split(';') : [];
                let newGroups = [];
                grous.map(g => { if (!newGroups.includes(g)) newGroups.push(g) })
                return newGroups.join(', ')
            }
        },
        {
            name: 'Relación',
            selector: row => row.name,
            sortable: true,
            filterable: true,
            center: true,
            compact: true,
            minWidth: '100px',
            cell: row => {
                let grous = row.name ? row.name.split(';') : [];
                let newGroups = [];
                grous.map(g => { if (!newGroups.includes(g)) newGroups.push(g) })
                return newGroups.join(', ')
            }
        },

        /**
         * {
            name: 'Lado',
            selector: row => row.side,
            sortable: true,
            filterable: true,
            center: true,
            compact: true,
            minWidth: '100px',
            cell: row => <span className="text-sm">{row.side}</span>
        },
         {
            name: 'Norma',
            selector: row => row.norm,
            sortable: true,
            filterable: true,
            center: true,
            compact: true,
            minWidth: '40px',
            cell: row => <span className="text-sm">{row.norm}</span>
        },
        {
            name: 'Proyecto',
            selector: row => row.project,
            sortable: true,
            filterable: true,
            center: true,
            compact: true,
            minWidth: '40px',
            cell: row => <span className="text-sm">{row.project}</span>
        },
        {
            name: 'Dif.',
            center: true,
            compact: true,
            minWidth: '40px',
            cell: row => <span className="text-sm">{(row.project - row.norm).toFixed(2)}</span>
        },
        {
            name: 'Observación',
            center: true,
            compact: true,
            minWidth: '50px',
            cell: row => <span className="text-sm">{_GET_EVALUATION(row.norm, row.project)}</span>
        },
        {
            name: 'Evaluación',
            button: true,
            center: true,
            minWidth: '140px',
            cell: row => <select
                className={_GET_SELECT_COLOR_VALUE(row.check)} defaultValue={row.check}
                onChange={(e) => setCheck_36_info(row.id, e.target.value)}>
                <option value="0" className="text-danger">NO CUMPLE</option>
                <option value="1" className="text-success">CUMPLE</option>
                <option value="2" className="text-warning">NO APLICA</option>
            </select>
        },
         *  {
            name: 'ESTADO',
            button: true,
            center: true,
            cell: row =>
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setActive_36_info(row)} />
                </div>
        },
         */

        {
            name: 'ACCIÓN',
            button: true,
            center: true,
            minWidth: '110px',
            cell: row => <>
                <button type="button" className="btn btn-secondary btn-sm px-2 me-1" onClick={() => setEdit(edit36 ? false : row)}><Icon name="edit" size={16} /></button>
                <button type="button" className="btn btn-danger btn-sm px-2" onClick={() => delete_36_info(row.id)}><Icon name="trash-alt" size={16} /></button>
            </>,
        },
    ]
    const ExpandedComponent = ({ data }) => {
        let subItems = data.parent ? data.parent.split(';') : [];

        return <>
            <div className='row border'>
                <div className='col my-1'>
                    <button type="button" className="btn btn-outline-primary btn-sm rounded-pill me-1" onClick={() => setRow(newRow[data.id] ? {} : { [data.id]: true })}>NUEVO PERFIL</button>
                </div>
            </div>

            <div className='row border'>
                <div className='col-3'>
                    <h5 className='fw-bold'><Icon name="road" size={16} /> PERFIL</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><Icon name="cube" size={16} /> LADO</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><Icon name="vector-square" size={16} /> RELACION</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><Icon name="hashtag" size={16} /> NORMA</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><Icon name="hashtag" size={16} /> PROY.</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><Icon name="greater-than-equal" size={16} /> DIF.</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><Icon name="greater-than-equal" size={16} /> OBS.</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><Icon name="check-square" size={16} /> EVA.</h5>
                </div>
                <div className='col-1'></div>

            </div>
            {subItems.map((it, i) => {
                let parent = it;
                let side = data.side ? data.side.split(';')[i] : '';
                let name = data.name ? data.name.split(';')[i] : '';
                let norm = data.norm ? data.norm.split(';')[i] : '';
                let project = data.project ? data.project.split(';')[i] : '';
                let diff = (Number(project) - Number(norm)).toFixed(2);
                let obs = _GET_EVALUATION(norm, project)
                let check = data.check ? data.check.split(';')[i] : '';;

                return <>

                    <div className='row border'>
                        <div className='col-3'>
                            {editRow['parent_' + data.id + i] ?
                                <select className="form-select form-select-sm" name={'parent_' + data.id} id={'parent_' + data.id + i}
                                    defaultValue={parent} onBlur={() => add_perfil(data.id)}>
                                    {PERFILS().map(g => <option>{g}</option>)}
                                </select>
                                :
                                <label name={'parent_' + data.id} id={'parent_' + data.id + i} onDoubleClick={() => setRowE({ ['parent_' + data.id + i]: true })}>{parent}</label>
                            }
                        </div>
                        <div className='col'>
                            {editRow['side_' + data.id + i] ?
                                <select className="form-select form-select-sm" name={'side_' + data.id} id={'side_' + data.id + i}
                                    defaultValue={side} onBlur={() => add_perfil(data.id)}>
                                    {SIDES.map(g => <option>{g}</option>)}
                                </select>
                                :
                                <label name={'side_' + data.id} id={'side_' + data.id + i} onDoubleClick={() => setRowE({ ['side_' + data.id + i]: true })}>{side}</label>
                            }
                        </div>
                        <div className='col' onDoubleClick={() => setRowE({ ['name_' + data.id + i]: true })}>
                            {editRow['name_' + data.id + i] ?
                                <select className="form-select form-select-sm" name={'name_' + data.id} id={'name_' + data.id + i}
                                    defaultValue={name} onBlur={() => add_perfil(data.id)}>
                                    {ELEMENTS.map(g => <option>{g}</option>)}
                                </select>
                                :
                                <label name={'name_' + data.id} id={'name_' + data.id + i}>{name}</label>
                            }
                        </div>
                        <div className='col' onDoubleClick={() => setRowE({ ['norm_' + data.id + i]: true })}>
                            {editRow['norm_' + data.id + i] ?
                                <input name={'norm_' + data.id} id={'norm_' + data.id + i} type="number" min={0}
                                    className='form-control form-control-sm' onBlur={() => add_perfil(data.id)} defaultValue={norm} autoFocus={true} />
                                :
                                <label name={'norm_' + data.id} id={'norm_' + data.id + i} >{norm}</label>
                            }

                        </div>
                        <div className='col' onDoubleClick={() => setRowE({ ['proyect_' + data.id + i]: true })}>
                            {editRow['proyect_' + data.id + i] ?
                                <input name={'proyect_' + data.id} id={'proyect_' + data.id + i} type="number" min={0}
                                    className='form-control form-control-sm' onBlur={() => add_perfil(data.id)} defaultValue={project} autoFocus={true} />
                                :
                                <label name={'proyect_' + data.id} id={'proyect_' + data.id + i}>{project}</label>
                            }
                        </div>
                        <div className='col'>
                            <label>{diff}</label>
                        </div>
                        <div className='col'>
                            <label>{obs}</label>
                        </div>
                        <div className='col'>
                            <select
                                className={_GET_SELECT_COLOR_VALUE(check)} defaultValue={check}
                                name={'check_' + data.id} id={'check_' + data.id + i}
                                onChange={(e) => add_perfil(data.id)}>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                                <option value="2" className="text-warning">NO APLICA</option>
                            </select>
                        </div>
                        <div className='col-1'>
                            {newRow[data.id] || subItems.length == 1 ? '' :
                                <button type="button" className="btn btn-outline-danger btn-sm rounded-pill px-2" onClick={() => del_grp_37(data.id)}> <Icon name="minus" size={16} className="text-danger" /></button>
                            }
                        </div>
                    </div>
                </>
            })}
            {newRow[data.id] ?
                <div className='row border my-1'>
                    <div className='col-3'>
                        <select className="form-select form-select-sm" name={'parent_' + data.id} id={'parent_' + data.id + subItems.length}>
                            {PERFILS().map(g => <option>{g}</option>)}
                        </select>
                    </div>
                    <div className='col'>
                        <select className="form-select form-select-sm" name={'side_' + data.id} id={'side_' + data.id + subItems.length}>
                            {SIDES.map(sg => <option>{sg}</option>)}
                        </select>
                    </div>
                    <div className='col'>
                        <select className="form-select form-select-sm" name={'name_' + data.id} id={'name_' + data.id + subItems.length}>
                            {ELEMENTS.map(sg => <option>{sg}</option>)}
                        </select>
                    </div>
                    <div className='col'>
                        <input name={'norm_' + data.id} id={'norm_' + data.id + subItems.length} type="number" min={0} step={0.01} className='form-control form-control-sm' />
                    </div>
                    <div className='col'>
                        <input name={'proyect_' + data.id} id={'proyect_' + data.id + subItems.length} type="number" min={0} step={0.01} className='form-control form-control-sm' />
                    </div>
                    <div className='col'></div>
                    <div className='col'></div>
                    <div className='col'>
                        <select name={'check_' + data.id} id={'check_' + data.id + subItems.length}
                            className={_GET_SELECT_COLOR_VALUE(0)} defaultValue={0}>
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                    </div>
                    <div className='col-1'>
                        {newRow[data.id] ?
                            <button type="button" className="btn btn-outline-success btn-sm rounded-pill px-2" onClick={() => add_perfil(data.id)}> <Icon name="plus" size={16} className="text-success" /></button> : ''}
                    </div>
                </div> : ''}
        </>
    };

    let _COMPONENT_1 = (edit) => {
        return <>
            <div className="row">
                <input type="hidden" id="r_a_34_" />
                <div className="col-3 p-1">
                    <label>Dirección</label>
                    <input type="text" className="form-control form-control-sm" id={"r_a_36_info_5" + edit} defaultValue={edit36.address}/>
                </div>
                {edit ? '' :
                    <>
                        <div className="col-3 p-1">
                            <label>Perfil</label>
                            <select className="form-select form-select-sm" id={"r_a_36_info_1" + edit}
                                onChange={(e) => _SET_IMAGE_LINK(e.target.value)}>
                                {_GET_PERFIL_SELECT()}
                            </select>
                        </div>
                        <div className="col-1 p-1">
                            <div className="input-group">
                                <a className="btn btn-info btn-sm p-2 ms-2 mt-3" target="_blank" href="http://www.curaduria1bucaramanga.com/public_docs/OTHERS/PERFILES/perfil_10.00_m_tipo_a.png" id={"r_a_36_imglink" + edit}><Icon name="image" size={16} /></a>
                            </div>
                        </div>
                        <div className="col p-1">
                            <label>Lado</label>
                            <select className="form-select form-select-sm" id={"r_a_36_info_6" + edit}>
                                {SIDES.map(it => <option>{it}</option>)}
                            </select>
                        </div>
                        <div className="col p-1">
                            <label>Elemento</label>
                            <select className="form-select form-select-sm" id={"r_a_36_info_2" + edit}>
                                {ELEMENTS.map(it => <option>{it}</option>)}
                            </select>
                        </div>
                        <div className="col-1 p-1">
                            <label>Norma</label>
                            <input type="number" min="0" step="0.01" className="form-control form-control-sm" id={"r_a_36_info_3" + edit} />
                        </div>

                        <div className="col-1 p-1">
                            <label>Proyecto</label>
                            <input type="number" min="0" step="0.01" className="form-control form-control-sm" id={"r_a_36_info_4" + edit} />
                        </div>
                    </>}

            </div>
        </>
    }
    let _LIST_COMPONENT = () => {
        let _LIST = _GET_CHILD_36_INFO();

        return <DataTable
            noDataComponent="No hay Items"
            striped="true"
            columns={columns}
            data={_LIST}
            highlightOnHover
            className="data-table-component"
            noHeader
            dense
            expandableRows
            expandableRowsComponent={ExpandedComponent}
        />
    }
    // ******************************* APIS **************************** // 
    let new_ra_36_info = (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.set('recordArcId', currentRecord.id);
        formData.set('active', 1);

        let parent = document.getElementById("r_a_36_info_1").value;
        formData.set('parent', parent);
        let name = document.getElementById("r_a_36_info_2").value;
        formData.set('name', name);
        let norm = document.getElementById("r_a_36_info_3").value;
        formData.set('norm', norm);
        let project = document.getElementById("r_a_36_info_4").value;
        formData.set('project', project);
        let address = document.getElementById("r_a_36_info_5").value;
        formData.set('address', address);
        let side = document.getElementById("r_a_36_info_6").value;
        formData.set('side', side);

        RECORD_ARCSERVICE.create_arc_36_info(formData)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    props.requestUpdateRecord(currentItem.id);
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }
    let edit_ra_36_info = (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.set('recordArcId', currentRecord.id);
        let address = document.getElementById("r_a_36_info_5_edit").value;
        formData.set('address', address);
        /**
         *     let parent = document.getElementById("r_a_36_info_1_edit").value;
        formData.set('parent', parent);

        let name = document.getElementById("r_a_36_info_2_edit").value;
        formData.set('name', name);
        let norm = document.getElementById("r_a_36_info_3_edit").value;
        formData.set('norm', norm);
        let project = document.getElementById("r_a_36_info_4_edit").value;
        formData.set('project', project);
       
        let side = document.getElementById("r_a_36_info_6_edit").value;
        formData.set('side', side);
         * 
         */
    

        RECORD_ARCSERVICE.update_arc_36_info(edit36.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    props.requestUpdateRecord(currentItem.id);
                    setEdit(false);
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }
    let delete_36_info = (id) => {
        swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                RECORD_ARCSERVICE.delete_36_info(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            props.requestUpdateRecord(currentItem.id);
                            setEdit(false);
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            }
        });
    }

    let add_perfil = (id, useSwal) => {
        var formData = new FormData();

        let parent = [];
        let side = [];
        let name = [];
        let norm = [];
        let project = [];
        let check = [];

        let htmls = document.getElementsByName('parent_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('parent_' + id + i);
            if (!element) continue;
            if (element.value) parent.push(element.value)
            else if (element.textContent) parent.push(element.textContent)
        }

        htmls = document.getElementsByName('side_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('side_' + id + i);
            if (!element) continue;
            if (element.value) side.push(element.value)
            else if (element.textContent) side.push(element.textContent)
        }

        htmls = document.getElementsByName('name_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('name_' + id + i);
            if (!element) continue;
            if (element.value) name.push(element.value)
            else if (element.textContent) name.push(element.textContent)
        }

        htmls = document.getElementsByName('norm_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('norm_' + id + i);
            if (!element) continue;
            if (element.value) norm.push(element.value)
            else if (element.textContent) norm.push(element.textContent)
            else norm.push('')
        }

        htmls = document.getElementsByName('proyect_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('proyect_' + id + i);
            if (!element) continue;
            if (element.value) project.push(element.value)
            else if (element.textContent) project.push(element.textContent)
            else project.push('')
        }

        htmls = document.getElementsByName('check_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('check_' + id + i);
            if (!element) continue;
            if (element.value) check.push(element.value)
            else if (element.textContent) check.push(element.textContent)
        }

        formData.set('parent', parent.join(';'));
        formData.set('side', side.join(';'));
        formData.set('name', name.join(';'));
        formData.set('norm', norm.join(';'));
        formData.set('project', project.join(';'));
        formData.set('check', check.join(';'));

        RECORD_ARCSERVICE.update_arc_36_info(id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    props.requestUpdateRecord(currentItem.id);
                    setRow({});
                    setRowE({});
                } else {
                    if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }
    let del_grp_37 = (id, ind, useSwal) => {
        var formData = new FormData();

        let parent = [];
        let side = [];
        let name = [];
        let norm = [];
        let project = [];
        let check = [];

        let htmls = document.getElementsByName('parent_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('parent_' + id + i);
            if (!element) continue;
            if (element.value) parent.push(element.value)
            else if (element.textContent) parent.push(element.textContent)
        }

        htmls = document.getElementsByName('side_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('side_' + id + i);
            if (!element) continue;
            if (element.value) side.push(element.value)
            else if (element.textContent) side.push(element.textContent)
        }

        htmls = document.getElementsByName('name_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('name_' + id + i);
            if (!element) continue;
            if (element.value) name.push(element.value)
            else if (element.textContent) name.push(element.textContent)
        }

        htmls = document.getElementsByName('norm_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('norm_' + id + i);
            if (!element) continue;
            if (element.value) norm.push(element.value)
            else if (element.textContent) norm.push(element.textContent)
            else norm.push('')
        }

        htmls = document.getElementsByName('proyect_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('proyect_' + id + i);
            if (!element) continue;
            if (element.value) project.push(element.value)
            else if (element.textContent) project.push(element.textContent)
            else project.push('')
        }

        htmls = document.getElementsByName('check_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('check_' + id + i);
            if (!element) continue;
            if (element.value) check.push(element.value)
            else if (element.textContent) check.push(element.textContent)
        }

        parent.splice(ind, 1);
        side.splice(ind, 1);
        name.splice(ind, 1);
        norm.splice(ind, 1);
        project.splice(ind, 1);
        check.splice(ind, 1);

        formData.set('parent', parent.join(';'));
        formData.set('side', side.join(';'));
        formData.set('name', name.join(';'));
        formData.set('norm', norm.join(';'));
        formData.set('project', project.join(';'));
        formData.set('check', check.join(';'));

        RECORD_ARCSERVICE.update_arc_36_info(id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    props.requestUpdateRecord(currentItem.id);
                    setRow({});
                    setEdit({});
                } else {
                    if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }
    return (
        <div className='row my-2'>

            <div className="form-check ms-5 my-2">
                <input className="form-check-input" type="checkbox" onChange={(e) => setNew(!new36)} />
                <label className="form-check-label" htmlFor="flexCheckDefault">
                    Añadir nuevo elemento de perfil
                </label>
            </div>

            {new36
                ? <form id="form_ra_36_info" onSubmit={new_ra_36_info}>
                    {_COMPONENT_1('')}
                    <div className="text-center">
                        <button className="btn btn-success btn-sm my-2">
                            <Icon name="share-square" size={16} /> AÑADIR ELEMENTOS
                        </button>
                    </div>
                </form>
                : ""}
            {_LIST_COMPONENT()}
            {edit36
                ? <form id="form_ra_36_info_edit" onSubmit={edit_ra_36_info}>
                    <h4 className="fw-bold text-center py-2">Actualizar Elemento</h4>
                    {_COMPONENT_1('_edit')}
                    <div className="text-center">
                        <button className="btn btn-success btn-sm  my-2">
                            <Icon name="share-square" size={16} /> GUARDAR CAMBIOS
                        </button>
                    </div>
                </form>
                : ""}
        </div>
    );
}
