import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// SERVICES
import SubmitService from '../../../services/submit.service';

// LISTS
import Fun6DocList from '../../../components/jsons/fun6DocsList.json'
import { Lists } from '../../../components/jsons/lists_submit'

import DOCS_LIST from '../fun_forms/components/docs_list.component';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function SUBMIT_LIST({ translation, swaMsg, globals, currentItem, list, refreshList }) {
    const [lists, setLists] = useState(0);
    const [extra_items, setExtraItems] = useState(0);
    const [list_data_table, setListDataTable] = useState([]);
    const [selected_list, setSelectedList] = useState([]);
    const [list_new, setListNew] = useState(null);
    const [isNew, setIsNew] = useState(false);
    const currentSubLists = currentItem?.sub_lists ?? [];

    useEffect(() => {
        // componentDidMount
        //const interval = setInterval(() => {}, 1000);
        return () => {
            // componentWillUnmount cleanup
            //clearInterval(interval);
        };
    }, []);

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
            setListNew(items_set)
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
            let isExtra = checkIfExtra(row.list_title)
            return (
                <div className="space-y-3">
                    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                Lista documental
                            </p>
                            {!isExtra
                                ? <input
                                    type="text"
                                    className="form-control w-full md:min-w-[320px]"
                                    id={"save_list_title_" + ID}
                                    placeholder="Título de la lista"
                                    defaultValue={row.list_title}
                                />
                                : <h4 className="text-sm font-semibold text-foreground">{row.list_title}</h4>}
                        </div>

                        <span className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                            {items} documento{items === 1 ? '' : 's'}
                        </span>
                    </div>

                    <div className="hidden md:grid md:grid-cols-12 gap-3 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        <div className="md:col-span-2">Categoría</div>
                        <div className="md:col-span-2">Código</div>
                        <div className="md:col-span-5">Descripción</div>
                        <div className="md:col-span-1 text-center">Folios</div>
                        <div className="md:col-span-2">Revisión</div>
                    </div>

                    {Array.from({ length: items }).map((_, i) => (
                        <div key={`${ID}-${i}`} className="rounded-xl border border-border bg-background p-3 shadow-sm">
                            <div className="grid gap-3 md:grid-cols-12 md:items-start">
                                <div className="md:col-span-2">
                                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">Categoría</div>
                                    <select className="form-select" name={"submit_list_category_" + ID} defaultValue={category[i]}>
                                        <option>DC</option>
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

                                <div className="md:col-span-2 space-y-2">
                                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">Código</div>
                                    <input
                                        type="text"
                                        className="form-control text-center"
                                        name={"submit_list_code_" + ID}
                                        id={'edit_list_code_' + ID + '_' + i}
                                        defaultValue={code[i]}
                                        disabled={isExtra}
                                    />
                                    {!isExtra ? <DOCS_LIST idRef={ID + '_' + i} setValues={setValuesEdit} text={"VER LISTA"} /> : ""}
                                </div>

                                <div className="md:col-span-5">
                                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">Descripción</div>
                                    <textarea
                                        rows="2"
                                        className="form-control"
                                        name={"submit_list_name_" + ID}
                                        id={'edit_list_name_' + ID + '_' + i}
                                        defaultValue={name[i]}
                                        disabled={isExtra}
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground text-center md:hidden">Folios</div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        className="form-control text-center"
                                        name={"submit_list_pages_" + ID}
                                        defaultValue={page[i]}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:hidden">Revisión</div>
                                    <select className="form-select" name={"submit_list_review_" + ID} defaultValue={review[i]}>
                                        <option>NO</option>
                                        <option>SI</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
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
            let _array_selected_list = [...selected_list];
            let _newEntry = value + ':' + id;
            let _searchIndex = _array_selected_list.findIndex(value => value.includes(id));
            if (_searchIndex < 0) _array_selected_list.push(_newEntry);
            else _array_selected_list[_searchIndex] = _newEntry;
            setSelectedList(_array_selected_list);
        }
        let _update_doms = () => {
            /*for (var i = 0; i < this.state.selected_list.length; i++) {
                let _split_value = this.state.selected_list[i].split(':');
                if (document.getElementById(_split_value[1])) document.getElementById(_split_value[1]).value = _split_value[0];
            }*/
        }
        let _GET_DATA_FOR_TITLE = () => {
            let _LIST = list_new ? [list_new] : [Lists.list_61];
            return <label className="fw-bold submit_list_title" id="new_list_title">
                {Object.keys(_LIST[0])}</label>
        }
        let _GET_DATA_FOR_LIST = () => {
            let _LIST = list_new ? [list_new] : [Lists.list_61];
            for (var ITEM in _LIST) {
                var items_set = Object.values(_LIST[ITEM]);
                items_set = items_set[0] ?? [];
                return items_set.map((value) => {
                    return {
                        id: value,
                        search_cod: value,
                        search_title: Fun6DocList[value],
                        nome: <select className="form-select" name="submit_list_category" id={'select_' + value} onChange={(e) => _update_selected_list(e.target.value, 'select_' + value)}>
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
                        cod: <input type="text" className="form-control" name="submit_list_code"
                            value={value} readOnly disabled id={'cod_' + value} onChange={(e) => _update_selected_list(e.target.value, 'cod_' + value)} />,
                        title: <textarea rows="2" className="form-control" name="submit_list_name"
                            value={Fun6DocList[value]} readOnly disabled id={'title_' + value} onChange={(e) => _update_selected_list(e.target.value, 'title_' + value)} >
                        </textarea>,
                        review: <select className="form-select" name="submit_list_review" id={'review_' + value} onChange={(e) => _update_selected_list(e.target.value, 'review_' + value)} >
                            <option >NO</option>
                            <option>SI</option>
                        </select>,
                        pages: <input type="number" min="0" step="1" className="form-control" name="submit_list_pages" id={'pages_' + value} onChange={(e) => _update_selected_list(e.target.value, 'pages_' + value)} />,
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
                <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Gestión documental
                        </p>
                        <p className="text-sm font-semibold text-foreground">Listas Totales: {currentSubLists.length}</p>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => setIsNew(true)}>
                            <Icon name="plus-circle" size={16} /> NUEVA LISTA </Button>
                    </div>
                </div>
            </>

        }
        let _COMPONENT_LIST = () => {
            const list = currentSubLists;

            if (!list.length) {
                return (
                    <div className="rounded-xl border border-dashed border-border/70 bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                        No hay información documental para esta entrada.
                    </div>
                )
            }

            return (
                <div className="space-y-4">
                    {list.map((row) => (
                        <div key={row.id} className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-border/60 bg-background px-4 py-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                        Lista documental
                                    </p>
                                    <h4 className="text-sm font-semibold text-foreground">{row.list_title || 'Lista sin título'}</h4>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" title="Guardar Cambios" onClick={() => save_list(row.id)}>
                                        <Icon name="save" size={16} /> Guardar
                                    </Button>
                                    <Button variant="destructive" size="sm" title="Eliminar" onClick={() => delete_list(row.id)}>
                                        <Icon name="trash-alt" size={16} /> Eliminar
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4">
                                {_LIST_GEN(row)}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        let _COMPONENT_NEW = () => {
            let _COMPONENT = [];
            let _LIST = list_new ? [list_new] : [Lists.list_61];

            _COMPONENT.push(<>
                <div className="row">
                    <div className="text-start col-6 my-3">
                        <label>NUEVA LISTA</label>
                        <select className="form-select" required id={"submit_list_type"}
                            onChange={(e) => _SET_LIST(e)} >
                            {_LIST_COMPONENT()}
                        </select>
                    </div>
                    <div className="text-end col-6 my-3">
                        <Button variant="outline" size="sm" className="my-3 me-2" onClick={() => setIsNew(false)}>
                            <Icon name="times-circle" size={16} />  CANCELAR </Button>
                        <Button size="sm" className="my-3" onClick={() => new_list()}>
                            <Icon name="edit" size={16} /> GUARDAR LISTA </Button>
                    </div>
                </div></>)

            for (var ITEM in _LIST) {

                if (Object.keys(_LIST[ITEM])[0]) {
                    const rows = _GET_DATA_FOR_LIST();
                    _COMPONENT.push(<>
                        <table className="table table-striped table-bordered table-sm">
                            <thead>
                                <tr>
                                    {data.columns.map((col, idx) => (
                                        <th key={idx} style={col.width ? { width: col.width } : {}}>{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx}>
                                        {data.columns.map((col, cidx) => (
                                            <td key={cidx}>{row[col.field]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                        <input type="text" className="form-control" id="new_list_title"
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

            for (var i = 0; i < extra_items; i++) {
                _COMPONENT.push(<>
                    <div className="row border border-secondary py-1 text-center">
                        <div className="col-2">
                            <select className="form-select" name="submit_list_category" >
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
                            <input type="text" className="form-control" name="submit_list_code"
                                id={"new_list_code_" + i} />
                            <DOCS_LIST idRef={i} setValues={setValues} text={"VER LISTA"} />
                        </div>
                        <div className="col-4 text-start">
                            <textarea rows="2" className="form-control" name="submit_list_name"
                                id={"new_list_name_" + i} >
                            </textarea>
                        </div>
                        <div className="col-2">
                            <select className="form-select" name="submit_list_review" >
                                <option >NO</option>
                                <option>SI</option>
                            </select>
                        </div>
                        <div className="col-2">
                            <input type="number" min="0" step="1" className="form-control" name="submit_list_pages" />
                        </div>
                    </div>
                </>)

            }

            _COMPONENT.push(<>
                <div className="row text-center border border-secondary py-2 text-white">
                    <div className="col-6">
                        <label className="fw-bold text-dark">ITEMS TOTALES: {extra_items}</label>
                    </div>
                    <div className="col-6 text-end">
                        {extra_items > 0
                            ? <Button variant="outline" size="sm" className="my-3 me-1" onClick={() => setExtraItems(extra_items - 1)}>
                                <Icon name="minus-circle" size={16} /> REMOVER ULTIMO </Button>
                            : ""}
                        <Button variant="outline" size="sm" className="my-3" onClick={() => setExtraItems(extra_items + 1)}>
                            <Icon name="plus-circle" size={16} /> AÑADIR ITEM </Button>
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

            if (new_list_type == "LISTA EXTRA" && extra_items == 0) {
                swalError({ title: "LISTA EXTRA VACIA", text: "Para crear una Lista Extra de documentos, debe añadir almenos un elemeno.", icon: 'warning' });
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            SubmitService.create_list(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        refreshList();
                        setIsNew(false)
                    }
                    else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            SubmitService.update_list(ID, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        refreshList();
                    }
                    else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });

        };

        let delete_list = (id) => {
            swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    SubmitService.delete_list(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                refreshList();
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
        };

        return (
            <div className="space-y-4">
                {_COMPONENT_ADD_LIS()}
                {isNew
                    ? <>{_COMPONENT_NEW()}</>
                    : ""}
                <div className="space-y-3 pt-2">
                    <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Documento adjunto
                        </p>
                        <h4 className="text-sm font-semibold text-foreground">Inventario de listas</h4>
                    </div>
                    {_COMPONENT_LIST()}
                </div>
            </div >
        );
}

export default SUBMIT_LIST;