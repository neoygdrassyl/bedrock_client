import { MDBBtn } from 'mdb-react-ui-kit';
import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { getJSON_Simple } from '../../../../components/customClasses/typeParse';
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import perfilData from '../../../../components/jsons/perfilesData.json';

export default function RECORD_ARC_36_TABLE(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    const MySwal = withReactContent(Swal);
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
            name: <label>Dirección</label>,
            selector: 'parent',
            sortable: true,
            filterable: true,
            center: true,
            compact: true,
            minWidth: '150px',
            cell: row => <label>{row.address}</label>
        },
        {
            name: <label>Perfil</label>,
            selector: 'parent',
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
            name: <label>Relación</label>,
            selector: 'name',
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
            name: <label>Lado</label>,
            selector: 'side',
            sortable: true,
            filterable: true,
            center: true,
            compact: true,
            minWidth: '100px',
            cell: row => <label>{row.side}</label>
        },
         {
            name: <label>Norma</label>,
            selector: 'norm',
            sortable: true,
            filterable: true,
            center: true,
            compact: true,
            minWidth: '40px',
            cell: row => <label>{row.norm}</label>
        },
        {
            name: <label>Proyecto</label>,
            selector: 'project',
            sortable: true,
            filterable: true,
            center: true,
            compact: true,
            minWidth: '40px',
            cell: row => <label>{row.project}</label>
        },
        {
            name: <label>Dif.</label>,
            center: true,
            compact: true,
            minWidth: '40px',
            cell: row => <label>{(row.project - row.norm).toFixed(2)}</label>
        },
        {
            name: <label>Observación</label>,
            center: true,
            compact: true,
            minWidth: '50px',
            cell: row => <label>{_GET_EVALUATION(row.norm, row.project)}</label>
        },
        {
            name: <label>Evaluación</label>,
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
            name: <label>ESTADO</label>,
            button: true,
            center: true,
            cell: row =>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setActive_36_info(row)} />
                </div>
        },
         */

        {
            name: <label>ACCIÓN</label>,
            button: true,
            center: true,
            minWidth: '110px',
            cell: row => <>
                <MDBBtn className="btn btn-secondary btn-sm px-2 me-1" onClick={() => setEdit(edit36 ? false : row)}><i class="far fa-edit"></i></MDBBtn>
                <MDBBtn className="btn btn-danger btn-sm px-2" onClick={() => delete_36_info(row.id)}><i class="far fa-trash-alt"></i></MDBBtn>
            </>,
        },
    ]
    const ExpandedComponent = ({ data }) => {
        let subItems = data.parent ? data.parent.split(';') : [];

        return <>
            <div className='row border'>
                <div className='col my-1'>
                    <MDBBtn rounded outline size='sm' className='me-1' onClick={() => setRow(newRow[data.id] ? {} : { [data.id]: true })}>NUEVO PERFIL</MDBBtn>
                </div>
            </div>

            <div className='row border'>
                <div className='col-3'>
                    <h5 className='fw-bold'><i class="fas fa-road"></i> PERFIL</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><i class="fas fa-cube"></i> LADO</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><i class="fas fa-vector-square"></i> RELACION</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><i class="fas fa-hashtag"></i> NORMA</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><i class="fas fa-hashtag"></i> PROY.</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><i class="fas fa-greater-than-equal"></i> DIF.</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><i class="fas fa-greater-than-equal"></i> OBS.</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><i class="far fa-check-square"></i> EVA.</h5>
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
                                <MDBBtn color="danger" rounded outline size='sm' className='px-2' onClick={() => del_grp_37(data.id)}> <i class="fas fa-minus text-danger"></i></MDBBtn>
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
                            <MDBBtn color="success" rounded outline size='sm' className='px-2' onClick={() => add_perfil(data.id)}> <i class="fas fa-plus text-success"></i></MDBBtn> : ''}
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
                    <input type="text" class="form-control form-control-sm" id={"r_a_36_info_5" + edit} defaultValue={edit36.address}/>
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
                            <div class="input-group">
                                <a className="btn btn-info btn-sm p-2 ms-2 mt-3" target="_blank" href="http://www.curaduria1bucaramanga.com/public_docs/OTHERS/PERFILES/perfil_10.00_m_tipo_a.png" id={"r_a_36_imglink" + edit}><i class="far fa-image fa-2x"></i></a>
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
                            <input type="number" min="0" step="0.01" class="form-control form-control-sm" id={"r_a_36_info_3" + edit} />
                        </div>

                        <div className="col-1 p-1">
                            <label>Proyecto</label>
                            <input type="number" min="0" step="0.01" class="form-control form-control-sm" id={"r_a_36_info_4" + edit} />
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
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    props.requestUpdateRecord(currentItem.id);
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
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    props.requestUpdateRecord(currentItem.id);
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
    let delete_36_info = (id) => {
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
                RECORD_ARCSERVICE.delete_36_info(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            props.requestUpdateRecord(currentItem.id);
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
                    if (useSwal) MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    props.requestUpdateRecord(currentItem.id);
                    setRow({});
                    setRowE({});
                } else {
                    if (useSwal) MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                if (useSwal) MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
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
                    if (useSwal) MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    props.requestUpdateRecord(currentItem.id);
                    setRow({});
                    setEdit({});
                } else {
                    if (useSwal) MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                if (useSwal) MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }
    return (
        <div className='row my-2'>

            <div class="form-check ms-5 my-2">
                <input class="form-check-input" type="checkbox" onChange={(e) => setNew(!new36)} />
                <label class="form-check-label" for="flexCheckDefault">
                    Añadir nuevo elemento de perfil
                </label>
            </div>

            {new36
                ? <form id="form_ra_36_info" onSubmit={new_ra_36_info}>
                    {_COMPONENT_1('')}
                    <div className="text-center">
                        <button className="btn btn-success btn-sm my-2">
                            <i class="far fa-share-square"></i> AÑADIR ELEMENTOS
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
                            <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                        </button>
                    </div>
                </form>
                : ""}
        </div>
    );
}
