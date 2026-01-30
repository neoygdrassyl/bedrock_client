import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// SERVICES
import SubmitService from '../../../services/submit.service';

// LISTS
import Fun6DocList from '../../../components/jsons/fun6DocsList.json'
import { Lists } from '../../../components/jsons/lists_submit'
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import DOCS_LIST from '../fun_forms/components/docs_list.component';
import { MDBDataTable } from 'mdbreact';

const MySwal = withReactContent(Swal);

class SUBMIT_LIST extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lists: 0,
            extra_items: 0,
            list_data_table: [],
            selected_list: [],
        };
    }
    componentDidMount() {
        //this.interval = setInterval(() => this.setState({ time: Date.now() }), 1000);
    }
    componentWillUnmount() {
        //clearInterval(this.interval);
    }
    componentDidUpdate(prevState) {
        /*if (this.state.selected_list !== prevState.selected_list && this.state.selected_list != []) {
            for (var i = 0; i < this.state.selected_list.length; i++) {
                let _split_value = this.state.selected_list[i].split(':');
                if (document.getElementById(_split_value[1])) document.getElementById(_split_value[1]).value = _split_value[0];
            }
        }
        */
    }
    render() {
        const { translation, swaMsg, globals, currentItem, list } = this.props;
        const { } = this.state;

        // DATA GETTERS

        // DATA COMVERTERS
        let _LIST_COMPONENT = () => {
            var _LIST = [];
            for (var ITEM in Lists) {
                // FIX: Added key prop for list items
                _LIST.push(<option key={ITEM}>{Object.keys(Lists[ITEM])}</option>)
            }
            _LIST.push(<option key="LISTA_EXTRA">LISTA EXTRA</option>) // FIX: Added key prop
            return <>{_LIST}</>
        }

        let checkIfExtra = (_TITLE) => {
            for (var ITEM in Lists) {
                if (Lists[ITEM][_TITLE]) return true
            }
            return false
        }

        let _SET_LIST = (e) => {
            var items_set = [];
            var new_list = document.getElementById('submit_list_type').value;
            for (var ITEM in Lists) {
                if (Lists[ITEM][new_list]) {
                    items_set = Lists[ITEM];
                    break;
                }
            }
            this.setState({ list_new: items_set })
            //_update_doms();
        }

        let _LIST_GEN = (row) => {
            let ID = row.id
            let name = row.list_name ? row.list_name.split(";") : []
            let category = row.list_category ? row.list_category.split(",") : []
            let code = row.list_code ? row.list_code.split(",") : []
            let page = row.list_pages ? row.list_pages.split(",") : []
            let review = row.list_review ? row.list_review.split(",") : []

            let items = name.length;
            let new_items = items
            let isExtra = checkIfExtra(row.list_title)
            let _COMPONENT = [];
            _COMPONENT.push(<>
                <div className="row bg-info text-white fw-bold d-flex py-2 text-center">
                    <div className="col-2">
                        <label>NOMENCLATURA</label>
                    </div>
                    <div className="col-2">
                        <label>COD</label>
                    </div>
                    {!isExtra
                        ? <div className="col-4">
                            <input type="text" class="form-control" id={"save_list_title_" + ID}
                                placeholder="Titulo..." defaultValue={row.list_title} />
                        </div>
                        : <div className="col-4">
                            <label>{row.list_title}</label>
                        </div>}

                    <div className="col-2">
                        <label>SI/NO</label>
                    </div>
                    <div className="col-2">
                        <label># FOLIOS / PLANOS</label>
                    </div>
                </div>
            </>)

            for (var i = 0; i < items; i++) {
                _COMPONENT.push(<>
                    <div className="row border border-info py-1 text-center">
                        <div className="col-2">
                            <select class="form-select" name={"submit_list_category_" + ID}
                                defaultValue={category[i]}>
                                <option >DC</option>
                                <option>DA-OA</option>
                                <option>DA-LC</option>
                                <option>DA-R</option>
                                <option>EXP</option>
                                <option>IMP</option>
                                <option>PRO-UIS</option>
                                <option>DBU</option>
                                <option>CCP</option>
                            </select>
                        </div>
                        <div className="col-2">
                            <input type="text" class="form-control" name={"submit_list_code_" + ID} id={'edit_list_code_' + ID + "_" + i}
                                defaultValue={code[i]} disabled={isExtra} />
                            {!isExtra ? <DOCS_LIST idRef={ID + "_" + i} setValues={setValuesEdit} text={"VER LISTA"} />
                                : ""}
                        </div>
                        <div className="col-4 text-start">
                            <textarea rows="2" class="form-control" name={"submit_list_name_" + ID} id={'edit_list_name_' + ID + "_" + i}
                                defaultValue={name[i]} disabled={isExtra} >
                            </textarea>
                        </div>
                        <div className="col-2">
                            <select class="form-select" name={"submit_list_review_" + ID}
                                defaultValue={review[i]}>
                                <option >NO</option>
                                <option>SI</option>
                            </select>
                        </div>
                        <div className="col-2">
                            <input type="number" min="0" step="1" class="form-control" name={"submit_list_pages_" + ID}
                                defaultValue={page[i]} />
                        </div>
                    </div>
                </>)
            }


            return <>{_COMPONENT}</>
        }

        let setValues = (refs, values) => {
            document.getElementById('new_list_code_' + refs).value = values[0];
            document.getElementById('new_list_name_' + refs).value = values[1];
        }
        let setValuesEdit = (refs, values) => {
            document.getElementById('edit_list_code_' + refs).value = values[0];
            document.getElementById('edit_list_name_' + refs).value = values[1];
        }

        // DATA CONVERTERS FOR DATATABLE
        let _update_selected_list = (value, id) => {
            let _array_selected_list = this.state.selected_list;
            let _newEntry = value + ':' + id;
            let _searchIndex = _array_selected_list.findIndex(value => value.includes(id));
            if (_searchIndex < 0) _array_selected_list.push(_newEntry);
            else _array_selected_list[_searchIndex] = _newEntry;
            this.setState({ selected_list: _array_selected_list });
        }
        let _update_doms = () => {
            /*for (var i = 0; i < this.state.selected_list.length; i++) {
                let _split_value = this.state.selected_list[i].split(':');
                if (document.getElementById(_split_value[1])) document.getElementById(_split_value[1]).value = _split_value[0];
            }*/
        }
        let _GET_DATA_FOR_TITLE = () => {
            let _LIST = this.state.list_new ? [this.state.list_new] : [Lists.list_61];
            return <label className="fw-bold submit_list_title" id="new_list_title">
                {Object.keys(_LIST[0])}</label>
        }
        let _GET_DATA_FOR_LIST = () => {
            let _LIST = this.state.list_new ? [this.state.list_new] : [Lists.list_61];
            for (var ITEM in _LIST) {
                var items_set = Object.values(_LIST[ITEM]);
                items_set = items_set[0] ?? [];
                return items_set.map((value) => {
                    return {
                        id: value,
                        search_cod: value,
                        search_title: Fun6DocList[value],
                        nome: <select class="form-select" name="submit_list_category" id={'select_' + value} onChange={(e) => _update_selected_list(e.target.value, 'select_' + value)}>
                            <option >DC</option>
                            <option>DA-OA</option>
                            <option>DA-LC</option>
                            <option>DA-R</option>
                            <option>EXP</option>
                            <option>IMP</option>
                            <option>PRO-UIS</option>
                            <option>DBU</option>
                            <option>CCP</option>
                        </select>,
                        cod: <input type="text" class="form-control" name="submit_list_code"
                            value={value} readOnly disabled id={'cod_' + value} onChange={(e) => _update_selected_list(e.target.value, 'cod_' + value)} />,
                        title: <textarea rows="2" class="form-control" name="submit_list_name"
                            value={Fun6DocList[value]} readOnly disabled id={'title_' + value} onChange={(e) => _update_selected_list(e.target.value, 'title_' + value)} >
                        </textarea>,
                        review: <select class="form-select" name="submit_list_review" id={'review_' + value} onChange={(e) => _update_selected_list(e.target.value, 'review_' + value)} >
                            <option >NO</option>
                            <option>SI</option>
                        </select>,
                        pages: <input type="number" min="0" step="1" class="form-control" name="submit_list_pages" id={'pages_' + value} onChange={(e) => _update_selected_list(e.target.value, 'pages_' + value)} />,
                    }
                })
            }
        }
        var data = {
            columns: [
                {
                    label: 'NOMENCLATURA',
                    field: 'nome',
                },
                {
                    label: 'COD',
                    field: 'cod',
                    sort: 'search_cod',
                    width: '70px'
                },
                {
                    label: _GET_DATA_FOR_TITLE(),
                    field: 'title',
                    sort: 'search_title',
                    width: '300px'
                },
                {
                    label: 'SI/NO',
                    field: 'review',
                },
                {
                    label: '# FOLIOS / PLANOS',
                    field: 'pages',
                },
            ],
            rows: _GET_DATA_FOR_LIST(),
        }
        // COMPONENT JSX
        let _COMPONENT_ADD_LIS = () => {
            return <>
                <div className="row py-2">
                    <div className="text-start col-6">
                        <label className="fw-bold">Listas Totales: {currentItem.sub_lists.length}</label>
                    </div>
                    <div className="text-end col-6">
                        <MDBBtn className="btn btn-sm btn-secondary mx-3" onClick={() => this.setState({ new: true })}>
                            <i class="fas fa-plus-circle"></i> NUEVA LISTA </MDBBtn>
                    </div>
                </div>
            </>

        }
        let _COMPONENT_LIST = () => {
            const columns = [
                {
                    name: <label className="text-center">DOCUMENTOS</label>,
                    selector: row => row.id, // FIX: v7→v8 column selector
                    sortable: true,
                    filterable: true,
                    center: true,

                    cell: row => <div className="py-2">{_LIST_GEN(row)}</div>
                },
                {
                    name: <label>ACCION</label>,
                    button: true,
                    wrap: false,
                    minWidth: '100px',
                    cell: row => <>
                        <MDBTooltip title='Guardar Cambios' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                            <button onClick={() => save_list(row.id)} className="btn btn-sm btn-secondary m-0 p-2 shadow-none">
                                <i class="far fa-save fa-2x" ></i></button></MDBTooltip>
                        <MDBTooltip title='Eliminar' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            <button onClick={() => delete_list(row.id)} className="btn btn-sm btn-danger  m-0 p-2 shadow-none">
                                <i class="far fa-trash-alt fa-2x"></i></button></MDBTooltip>
                    </>,
                },
            ]

            const list = currentItem.sub_lists;

            return <>
                <DataTable
                    noDataComponent={<h4 className="fw-bold">NO HAY INFORMACION</h4>}
                    striped="true"
                    columns={columns}
                    data={list}
                    className="data-table-component"
                    noHeader
                />
            </>
        }

        let _COMPONENT_NEW = () => {
            let _COMPONENT = [];
            let _LIST = this.state.list_new ? [this.state.list_new] : [Lists.list_61];

            _COMPONENT.push(<>
                <div className="row">
                    <div className="text-start col-6 my-3">
                        <label>NUEVA LISTA</label>
                        <select class="form-select" required id={"submit_list_type"}
                            onChange={(e) => _SET_LIST(e)} >
                            {_LIST_COMPONENT()}
                        </select>
                    </div>
                    <div className="text-end col-6 my-3">
                        <MDBBtn className="btn btn-info my-3 me-2" onClick={() => this.setState({ new: false })}>
                            <i class="fas fa-times-circle"></i>  CANCELAR </MDBBtn>
                        <MDBBtn className="btn btn-success my-3" onClick={() => new_list()}>
                            <i class="far fa-edit"></i> GUARDAR LISTA </MDBBtn>
                    </div>
                </div></>)

            for (var ITEM in _LIST) {

                if (Object.keys(_LIST[ITEM])[0]) {
                    _COMPONENT.push(<>
                        <MDBDataTable
                            striped
                            bordered
                            small
                            data={data}
                            searchLabel={"Buscar..."}
                            info={false}
                            paging={false}
                            onSearch={_update_doms}
                        />
                    </>)
                } else {
                    _COMPONENT.push(<>{_COMPONENT_EXTRA_LIST()}</>)
                }
            }
            return <>{_COMPONENT}</>
        }
        let _COMPONENT_EXTRA_LIST = () => {
            let _COMPONENT = [];


            _COMPONENT.push(<>
                <div className="row text-center border border-secondary py-2 bg-secondary text-white">
                    <div className="col-2">
                        <label className="fw-bold">Nomenclatura</label>
                    </div>
                    <div className="col-2">
                        <label className="fw-bold">COD</label>
                    </div>
                    <div className="col-4">
                        <input type="text" class="form-control" id="new_list_title"
                            placeholder="Titulo..." />
                    </div>
                    <div className="col-2">
                        <label className="fw-bold"> SI/NO</label>
                    </div>
                    <div className="col-2">
                        <label className="fw-bold"># FOLIOS / PLANOS</label>
                    </div>
                </div>
            </>)


            for (var i = 0; i < this.state.extra_items; i++) {
                _COMPONENT.push(<>
                    <div className="row border border-secondary py-1 text-center">
                        <div className="col-2">
                            <select class="form-select" name="submit_list_category" >
                                <option >DC</option>
                                <option>DA-OA</option>
                                <option>DA-LC</option>
                                <option>DA-R</option>
                                <option>EXP</option>
                                <option>IMP</option>
                                <option>PRO-UIS</option>
                                <option>DBU</option>
                                <option>CCP</option>
                            </select>
                        </div>
                        <div className="col-2">
                            <input type="text" class="form-control" name="submit_list_code"
                                id={"new_list_code_" + i} />
                            <DOCS_LIST idRef={i} setValues={setValues} text={"VER LISTA"} />
                        </div>
                        <div className="col-4 text-start">
                            <textarea rows="2" class="form-control" name="submit_list_name"
                                id={"new_list_name_" + i} >
                            </textarea>
                        </div>
                        <div className="col-2">
                            <select class="form-select" name="submit_list_review" >
                                <option >NO</option>
                                <option>SI</option>
                            </select>
                        </div>
                        <div className="col-2">
                            <input type="number" min="0" step="1" class="form-control" name="submit_list_pages" />
                        </div>
                    </div>
                </>)

            }


            _COMPONENT.push(<>
                <div className="row text-center border border-secondary py-2 text-white">
                    <div className="col-6">
                        <label className="fw-bold text-dark">ITEMS TOTALES: {this.state.extra_items}</label>
                    </div>
                    <div className="col-6 text-end">
                        {this.state.extra_items > 0
                            ? <MDBBtn className="btn btn-sm btn-secondary my-3 me-1" onClick={() => this.setState({ extra_items: this.state.extra_items - 1 })}>
                                <i class="fas fa-minus-circle"></i> REMOVER ULTIMO </MDBBtn>
                            : ""}
                        <MDBBtn className="btn btn-sm btn-secondary my-3" onClick={() => this.setState({ extra_items: this.state.extra_items + 1 })}>
                            <i class="fas fa-plus-circle"></i> AÑADIR ITEM </MDBBtn>
                    </div>
                </div>
            </>)



            return <>{_COMPONENT}</>
        }

        // FUNCTIONS AND APIS
        var formData = new FormData();

        let new_list = () => {
            formData = new FormData();
            formData.set('submitId', currentItem.id);
            let new_list_type = document.getElementById("submit_list_type").value;

            if (new_list_type == "LISTA EXTRA" && this.state.extra_items == 0) {
                MySwal.fire({
                    title: "LISTA EXTRA VACIA",
                    text: "Para crear una Lista Extra de documentos, debe añadir almenos un elemeno.",
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
                return 1
            }

            let submit_list_category = document.getElementsByName("submit_list_category");
            let submit_list_code = document.getElementsByName("submit_list_code");
            let submit_list_name = document.getElementsByName("submit_list_name");
            let submit_list_review = document.getElementsByName("submit_list_review");
            let submit_list_pages = document.getElementsByName("submit_list_pages");
            let list_title = document.getElementById("new_list_title").textContent ? document.getElementById("new_list_title").textContent : document.getElementById("new_list_title").value;
            formData.set('list_title', list_title);

            let list_category = [];
            let list_code = [];
            let list_name = [];
            let list_review = [];
            let list_pages = [];

            for (var i = 0; i < submit_list_review.length; i++) {
                list_category.push(submit_list_category[i].value);
                list_code.push(submit_list_code[i].value);
                list_name.push(submit_list_name[i].value);
                list_review.push(submit_list_review[i].value);
                list_pages.push(submit_list_pages[i].value);
            }
            formData.set('list_category', list_category.join(','));
            formData.set('list_code', list_code.join(','));
            formData.set('list_name', list_name.join(';'));
            formData.set('list_review', list_review.join(','));
            formData.set('list_pages', list_pages.join(','));

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            SubmitService.create_list(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.refreshList();
                        this.setState({ new: false })
                    }
                    else {
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

        };

        let save_list = (ID) => {
            var ID = ID
            formData = new FormData();

            let submit_list_category = document.getElementsByName("submit_list_category_" + ID);
            let submit_list_code = document.getElementsByName("submit_list_code_" + ID);
            let submit_list_name = document.getElementsByName("submit_list_name_" + ID);
            let submit_list_review = document.getElementsByName("submit_list_review_" + ID);
            let submit_list_pages = document.getElementsByName("submit_list_pages_" + ID);

            let list_title = document.getElementById("save_list_title_" + ID) ? document.getElementById("save_list_title_" + ID).value : false;
            if (list_title) formData.set('list_title', list_title);

            let list_category = [];
            let list_code = [];
            let list_name = [];
            let list_review = [];
            let list_pages = [];

            for (var i = 0; i < submit_list_review.length; i++) {
                list_category.push(submit_list_category[i].value);
                list_code.push(submit_list_code[i].value);
                list_name.push(submit_list_name[i].value);
                list_review.push(submit_list_review[i].value);
                list_pages.push(submit_list_pages[i].value);
            }
            formData.set('list_category', list_category.join(','));
            formData.set('list_code', list_code.join(','));
            formData.set('list_name', list_name.join(';'));
            formData.set('list_review', list_review.join(','));
            formData.set('list_pages', list_pages.join(','));

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            SubmitService.update_list(ID, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.refreshList();
                    }
                    else {
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

        };

        let delete_list = (id) => {
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
                    SubmitService.delete_list(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.refreshList();
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
        };

        return (
            <div className="py-3">
                {_COMPONENT_ADD_LIS()}
                {this.state.new
                    ? <>{_COMPONENT_NEW()}</>
                    : ""}
                <div className="row py-3">
                    <hr />
                    <label className="fw-bold">LISTA DE DOCUMENTOS</label>
                    {_COMPONENT_LIST()}
                </div>
            </div >
        );
    }
}

export default SUBMIT_LIST;